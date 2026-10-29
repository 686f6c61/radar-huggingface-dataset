# haihengh/Qwen3.8-Flash-Next-125B-finch-4bit-ple3bit-vision

## Resumen

Qwen3.8-Flash-Next-125B-finch-4bit-ple3bit-vision es un artefacto de despliegue, no un checkpoint al uso: empaqueta el modelo Qwen/Qwen3.8-Flash-Next (aproximadamente 125B parámetros, mezcla de expertos) en el formato propietario `.finch` que consume el motor out-of-core FinchMoE, desarrollado por el mismo autor (haihengh) para aplicaciones de Mac e iOS. El repack aplica una cuantización mixta: expertos enrutados a 3 bits, atención y expertos compartidos a 4 bits, atención lineal y router a 8 bits, y una tabla PLE en int4 con grupo 32.

El problema que resuelve es el de ejecutar un MoE de gran tamaño en hardware de consumo sin cargar los pesos completos en memoria: el motor mantiene residentes unos 3,88 GB y sirve el pool de expertos (49,50 GiB) desde disco bajo demanda. Respecto al checkpoint de texto del mismo autor, este repositorio añade la torre visual del modelo original copiada byte a byte (333 tensores BF16, 856,3 MiB), lo que habilita el pipeline `image-text-to-text`.

Es relevante ahora por dos motivos concretos: demuestra una ruta de cuantización agresiva (3 bits por experto) sobre un MoE de 125B con verificación criptográfica de la instalación, y extiende esa ruta a inferencia multimodal local en Apple Silicon. Ahora bien, el repositorio tiene 0 descargas y 0 likes, no publica mediciones propias y no es compatible con Transformers, vLLM ni llama.cpp.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) heredada de Qwen/Qwen3.8-Flash-Next; el manifiesto declara 512 expertos enrutados por capa en 48 capas (24.576 expertos en total) y tensores de atención lineal junto a atención convencional |
| Parametros totales | ~125B (según la denominación del checkpoint); recuento exacto no disponible |
| Parametros activos | no disponible (el manifiesto no declara el número de expertos activos por token) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos enrutados: 3 bits affine, grupo 64, escalas y sesgos en BF16. Atención y expertos compartidos: 4 bits. Atención lineal y router: 8 bits. Tabla PLE: int4 grupo 32. Torre visual: BF16 sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-license-1.0 (etiquetada como `other` en el repositorio) |
| Formato de pesos | Finch (`.finch`): `manifest.json` + `model_weights.bin` (pesos residentes) + `packed_experts/layer_XX.bin` + `tokenizer/` + `vision/vision.safetensors` (safetensors solo para la torre visual) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3.8-Flash-Next, un transformer con mezcla de expertos. El repack no reentrena ni modifica los pesos: solo cambia el contenedor y la precisión. El manifiesto permite reconstruir la topología: 48 capas, cada una con 512 expertos enrutados almacenados con un stride fijo de 2.162.688 bytes (~2,06 MiB por experto), lo que da un pool de 53.150.220.288 bytes (49,50 GiB). Los pesos residentes —atención, expertos compartidos, embeddings, router— ocupan 3.877.265.688 bytes, y el tokenizador 22.916.963 bytes. El total declarado es de 90.002.502.569 bytes (83,82 GiB).

La receta de cuantización es deliberadamente heterogénea: los tensores que se tocan en cada token (atención lineal, router) se mantienen a 8 bits para no degradar el enrutamiento, la atención y los expertos compartidos bajan a 4 bits, y solo los expertos enrutados —el grueso del peso paramétrico y los que se activan de forma dispersa— se comprimen a 3 bits. La tabla PLE va en int4 con grupo 32. La torre visual se conserva íntegra en BF16 (333 tensores, 897.904.664 bytes), copiada byte a byte del checkpoint original junto con `model_config.json`, `preprocessor_config.json` y `video_preprocessor_config.json`.

No hay información sobre el volumen de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) del modelo base en la documentación proporcionada. La model card menciona que, cuando corresponde, la abliteración se realizó en el modelo upstream y que este repositorio solo altera contenedor, cuantización y payload visual. El repack se generó con `FinchMoERepack` el 28 de octubre de 2026, partiendo de un snapshot BF16 con hash `sha256:99e815241ef03325536b0aaa4441deea45174c17fae31e10f0bb456410c590de`, y el `manifest.json` tiene hash `54c3ff5f4f71b76f1388e0a36fde611bce1813741442631eeae889e6b60a8d78`.

## Capacidades

- Generación de texto y razonamiento general, heredados del checkpoint Qwen3.8-Flash-Next. No se documentan resultados ni límites concretos en la información disponible.
- Procesamiento de imagen y texto (`image-text-to-text`): la torre visual se mapea en memoria solo mientras se codifica una imagen, y el runtime de FinchMoE la consume para turnos con imagen.
- Preprocesado de vídeo potencial: el payload incluye `vision/video_preprocessor_config.json` del modelo origen, lo que indica que el pipeline original contemplaba entrada de vídeo; no se especifica si el runtime de FinchMoE lo soporta.
- Inferencia out-of-core: capacidad de ejecutar el modelo sirviendo los expertos desde SSD en lugar de mantener los 83,82 GiB en memoria.
- Integridad verificable: cada fichero se revalida contra `manifest.json` en la instalación, con recibo `verified-install.json` incluido.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el repositorio no declara lista de idiomas.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- **Inferencia local de un MoE de 125B en un Mac con memoria unificada limitada.** El motor mantiene 3,88 GB residentes y pagina los expertos desde SSD, de modo que un equipo que no puede alojar 83,82 GiB en RAM puede aun así ejecutar el modelo, a costa de latencia por acceso a disco.
- **Asistente multimodal en iOS mediante las apps de FinchMoE.** La torre visual permite turnos con imagen; la app requiere seleccionar una fila de modelo con capacidad de visión, ya que una fila solo-texto rechaza el directorio `vision/` en lugar de ignorarlo.
- **Digitalización y descripción de documentos escaneados en local.** Un flujo que recibe una imagen de página, la codifica con la torre visual y genera un resumen o extracción de campos, sin enviar el documento a un servicio externo.
- **Prototipado de agentes multimodales sin GPU de centro de datos.** Investigadores que necesitan probar prompts y flujos imagen-texto sobre un modelo de gran tamaño pueden usar el CLI (`FinchMoECLI --messages-file ... --max-new 128`) en una estación de trabajo Apple en lugar de reservar hardware de datacenter.
- **Evaluación del impacto de la cuantización a 3 bits en expertos enrutados.** Al existir un hermano de texto con la misma receta y un checkpoint BF16 de origen, el artefacto sirve para comparar calidad y enrutamiento entre precisiones sobre el mismo modelo.
- **Distribución reproducible de un checkpoint cuantizado.** El manifiesto con SHA-256 por fichero y el recibo de verificación permiten replicar una instalación idéntica en varias máquinas, algo útil para laboratorios que necesitan resultados reproducibles.
- **Clasificación y etiquetado de imágenes por lotes en modo offline.** Entornos con requisitos de soberanía del dato (sanidad, legal, administración) donde el contenido gráfico no puede salir de la máquina.
- **Banco de pruebas de motores out-of-core.** Comparar el rendimiento de FinchMoE frente a otras estrategias de descarga parcial de pesos usando un modelo de 125B como carga realista.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card indica explícitamente que esta variante «no se mide por separado» y remite al hermano de texto `haihengh/Qwen3.8-Flash-Next-125B-finch-4bit-ple3bit` para calidad y throughput del camino textual. Tampoco se publican cifras de latencia, tokens por segundo ni tasa de acierto del router para este repositorio. Cualquier número que se citara aquí sería inventado.

## Requisitos de hardware

- **Espacio en disco:** 90.002.502.569 bytes (83,82 GiB) para el artefacto, más el espacio temporal durante la instalación y verificación. Es el requisito dominante, no la VRAM.
- **Memoria residente:** 3.877.265.688 bytes (~3,61 GiB) de pesos que permanecen cargados de forma continua.
- **Pool de expertos:** 53.150.220.288 bytes (49,50 GiB) servidos desde SSD bajo demanda; el rendimiento depende de la velocidad y la latencia del almacenamiento, no solo de la GPU.
- **Torre visual:** 897.904.664 bytes (856,3 MiB) mapeados únicamente mientras se codifica una imagen, por lo que el pico de memoria durante un turno con imagen es superior al de un turno de texto.
- **VRAM estimada:** no disponible como cifra oficial. Como referencia aritmética, cargar el artefacto completo en memoria exigiría del orden de 84 GB; el diseño out-of-core evita ese requisito y reduce la huella a los 3,61 GiB residentes más la ventana de expertos activa.
- **GPU recomendadas:** no disponibles. El motor y sus aplicaciones están orientados a Mac (Apple Silicon) e iOS según la model card; no se documentan rutas para CUDA, A100, H100 ni RTX 4090.
- **¿Cabe en GPU de consumo?** No hay datos publicados. El artefacto no está pensado para carga íntegra en VRAM de una GPU de consumo; su viabilidad depende de memoria unificada y de un SSD rápido.
- **Opciones de despliegue:** `FinchMoECLI` con `--model` y `--messages-file`; apps de Mac/iOS de FinchMoE; `FinchMoERepack` para regenerar el artefacto. No es compatible con Transformers, vLLM, TGI, llama.cpp ni Ollama, ya que la model card indica explícitamente que no es un checkpoint de Transformers.
- **Latencia y throughput:** no disponibles para esta variante. La card remite al modelo hermano de texto para las mediciones del camino textual; el añadido visual no se cuantifica.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización / formato | Visión | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-125B-finch-4bit-ple3bit-vision (este) | ~125B (MoE, 512 expertos × 48 capas) | no disponible | Expertos 3 bits, resto 4/8 bits, PLE int4; formato `.finch`; 83,82 GiB | Sí, torre BF16 de 856,3 MiB | qwen-community-license-1.0 | 0 descargas, 0 likes |
| haihengh/Qwen3.8-Flash-Next-125B-finch-4bit-ple3bit (hermano de texto) | ~125B (MoE) | no disponible | Misma receta sin payload visual | No | qwen-community-license-1.0 | Repositorio publicado por el mismo autor |
| Qwen/Qwen3.8-Flash-Next (modelo base) | ~125B (MoE) | no disponible | BF16 (snapshot de origen) | Sí (de aquí se copia la torre) | qwen-community-license-1.0 | Repositorio oficial del modelo |
| Alternativas en GGUF/llama.cpp del mismo modelo base | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible en la información proporcionada |

La comparación relevante es interna a la familia: este repositorio se diferencia del hermano de texto exclusivamente por los 856,3 MiB de torre visual, y del checkpoint BF16 por el contenedor y la cuantización (83,82 GiB frente al snapshot original, cuyo tamaño exacto no se declara). No se dispone de datos para comparar con cuantizaciones de otros ecosistemas.

## Limitaciones y advertencias

- **Sin validación comunitaria:** 0 descargas y 0 likes en el momento de redactar esta ficha. No hay retroalimentación de terceros sobre si la instalación funciona correctamente.
- **Sin mediciones propias:** la calidad y el throughput de esta variante no se han medido; los datos del hermano de texto no cubren el camino multimodal.
- **Degradación por cuantización a 3 bits:** los expertos enrutados se comprimen con grupo 64 y escalas BF16, pero el impacto en calidad no está cuantificado. En tareas sensibles a matices (código, matemáticas, razonamiento largo) es esperable cierta pérdida frente al BF16, aunque no se aportan números.
- **Abliteración upstream:** la model card indica que la abliteración, cuando aplica, se hizo en el modelo de origen. Esto puede traducirse en una reducción de los mecanismos de rechazo y hacer el modelo inadecuado para despliegues expuestos a usuarios finales sin filtros adicionales.
- **Dependencia de un runtime propietario:** el artefacto solo se consume con FinchMoE. No hay ruta a vLLM, TGI, llama.cpp, Ollama ni Transformers, lo que limita la portabilidad y crea dependencia de un único proyecto.
- **Latencia ligada al almacenamiento:** el pool de expertos se sirve desde disco; un SSD lento degrada directamente los tokens por segundo. No se publican cifras de latencia.
- **Compatibilidad de la app:** hasta que el repositorio se añada al selector de la app de Mac/iOS, hay que usar el CLI o apuntar la app al directorio directamente. Una fila de modelo solo-texto rechaza el directorio `vision/`.
- **Idiomas y contexto sin declarar:** no hay lista de idiomas ni longitud de contexto documentada, lo que impide planificar despliegues multilingües o de contexto largo con garantías.
- **Licencia restrictiva y heredada:** `qwen-community-license-1.0`, etiquetada como `other`. Es una obra derivada del modelo upstream, de modo que los términos de uso comercial, redistribución y atribución deben revisarse en el fichero `LICENSE` antes de cualquier explotación en producción; esta ficha no puede confirmar que el uso comercial esté permitido.
- **Integridad dependiente del manifiesto:** el instalador revalida cada fichero contra `manifest.json`; cualquier corrupción parcial del pool de expertos invalida la instalación completa y obliga a redescargar 83,82 GiB.
- **Fecha de creación reciente:** el repositorio se creó y actualizó el 29 de octubre de 2026, con el repack ejecutado el 28 de octubre de 2026; no ha habido tiempo material para una revisión independiente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/haihengh/Qwen3.8-Flash-Next-125B-finch-4bit-ple3bit-vision
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Hermano de texto (misma receta sin visión): https://huggingface.co/haihengh/Qwen3.8-Flash-Next-125B-finch-4bit-ple3bit
- Motor FinchMoE: https://github.com/haihengh/finchMoE
- Licencia: https://huggingface.co/haihengh/Qwen3.8-Flash-Next-125B-finch-4bit-ple3bit-vision/blob/main/LICENSE
