# socialtrait/flux-3-image-klein-infendpoint

## Resumen

`socialtrait/flux-3-image-klein-infendpoint` es un checkpoint de despliegue, no un modelo nuevo, derivado de `black-forest-labs/flux-3-image-klein` (commit upstream `337337621b8526e120f2275d250242f4a6bedd75`). Lo publica el usuario Socialtrait como subconjunto en BF16 de los pesos originales: incluye el transformer de Diffusers, el text encoder, el VAE, las configuraciones, los tokenizadores y las licencias originales, y omite los pesos duplicados, las variantes FP8/NVFP4 y los assets de galería. El repo ocupa 20,3 GB y declara 5.548.681.984 parámetros en safetensors, un recuento que agrega transformer, text encoder y VAE.

El problema que resuelve es operativo: empaquetar el modelo en un formato listo para servir. Añade `handler.py` para desplegar en Hugging Face Inference Endpoints y `modal_app.py` para exponer una API autenticada en Modal, con valores por defecto de 16 pasos, resolución 1024×1024, transformer y text encoder en BF16 y VAE en FP32, sin offloading a CPU y sin prompt upsampling. Los pesos, según el autor, son idénticos a los del modelo base.

Es relevante para equipos que quieran evaluar o servir FLUX.3 Klein sin arrastrar duplicados de pesos ni assets innecesarios, y con dos vías de despliegue ya escritas. La contrapartida es que el propio autor advierte de que el ajuste en memoria de una GPU A10 y el throughput están pendientes de medir, y de que no es un producto oficial de Black Forest Labs. El repo no registra descargas ni likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de difusión de la familia FLUX (text-to-image); la model card no detalla la arquitectura interna del transformer |
| Parámetros totales | 5.548.681.984 (recuento agregado de safetensors: transformer + text encoder + VAE) |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No aplica: modelo text-to-image; resolución nativa 1024×1024 |
| Tipos de cuantización | BF16 (transformer y text encoder) y FP32 (VAE) en este repo; las alternativas FP8/NVFP4 del upstream se omiten; fallback GGUF opcional solo con un checkpoint Unsloth aparte |
| Idiomas soportados | No disponible (el autor no documenta cobertura de idiomas del text encoder) |
| Licencia | `flux-kommunity-license` (identificador `other`); derechos concedidos por Black Forest Labs vía `LICENSE.md` |
| Formato de pesos | safetensors en disposición Diffusers |
| Pasos de inferencia por defecto | 16 (rango configurable de 4 a 16 en la ruta `/generate`) |
| Tamaño del repositorio | 20,3 GB |

## Arquitectura y entrenamiento

Se trata de un modelo de difusión para generación de imágenes a partir de texto, perteneciente a la familia FLUX. Este repositorio concreto no entrena nada: es un subconjunto de despliegue en BF16 del checkpoint upstream `black-forest-labs/flux-3-image-klein`, con los pesos sin modificar. La model card no aporta detalles sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de ajuste (RLHF, DPO u otras) del modelo original; esa información, si existe, estaría en `README.upstream.md`, que se incluye como referencia pero cuyo contenido no se ha proporcionado.

La innovación aquí es de empaquetado, no de modelado. El repo separa lo necesario para inferencia (transformer, text encoder, VAE, configuración, tokenizadores, licencias y avisos) de lo prescindible (pesos duplicados, cuantizaciones FP8/NVFP4, galería). Añade dos artefactos de servicio: un custom handler para Hugging Face Inference Endpoints y una aplicación Modal con API autenticada, que expone una ruta `/generate` con dimensiones explícitas y 4–16 pasos, y una ruta `/sdxl` compatible con el payload de un generador de personas existente que devuelve JPEG en base64 ignorando las opciones exclusivas de SDXL y forzando 16 pasos.

## Capacidades

- Generación de imágenes a partir de prompts de texto (pipeline `text-to-image`), con resolución nativa de 1024×1024.
- Control del número de pasos de muestreo entre 4 y 16 mediante la ruta `/generate`, lo que permite intercambiar latencia por calidad.
- Dimensiones explícitas de salida en la ruta `/generate`.
- Compatibilidad con payloads de un generador de personas preexistente a través de la ruta `/sdxl`, que devuelve JPEG en base64.
- Despliegue listo para Hugging Face Inference Endpoints mediante `handler.py` (tag `endpoints_compatible`).
- Despliegue como API autenticada en Modal mediante `modal_app.py` y las instrucciones de `DEPLOYMENT.txt`.
- Carga directa con la librería Diffusers gracias a la disposición estándar de pesos, configuración y tokenizadores.
- No incluye modelo de prompt upsampling: el autor indica que es un modelo separado y no está en el repo.
- No se documentan capacidades de tool calling, agentes, visión de entrada, audio ni modos de razonamiento; no aplican a un modelo text-to-image.

## Casos de uso

- **Servicio de generación de imágenes en producción:** desplegar `modal_app.py` para exponer una API autenticada que recibe un prompt y devuelve una imagen; el contenedor ya fija BF16 para transformer y text encoder y FP32 para el VAE, lo que reduce la configuración manual necesaria.
- **Integración en Hugging Face Inference Endpoints:** usar `handler.py` como custom handler para publicar el modelo como endpoint gestionado, aprovechando que el repo está empaquetado en formato Diffusers con tokenizadores y configuración incluidos.
- **Migración de un generador de personas existente:** la ruta `/sdxl` acepta el payload actual y devuelve JPEG en base64, de modo que un servicio basado en SDXL puede apuntar al nuevo backend sin reescribir el cliente, asumiendo que las opciones exclusivas de SDXL se descartan.
- **Generación de assets a resolución fija:** producir imágenes de 1024×1024 para banners, ilustraciones o material de marketing usando 16 pasos por defecto, con la opción de bajar a 4–16 pasos cuando la latencia pesa más que el detalle.
- **Prototipado e investigación con Diffusers:** cargar el modelo directamente en un script de Diffusers para experimentar con prompts, schedulers o pasos sin descargar las variantes FP8/NVFP4 ni los assets de galería que el autor ha omitido deliberadamente.
- **Evaluación comparativa de FLUX.3 Klein:** disponer de un subconjunto ligero (20,3 GB frente al repo upstream completo) para pruebas de calidad y tiempos en distintas GPU antes de comprometerse con el despliegue definitivo.
- **Base para ajuste fino:** al conservar los pesos originales sin modificar y la configuración de Diffusers, sirve como punto de partida para LoRA o fine-tuning, siempre dentro de los términos de la licencia comunitaria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que el ajuste en memoria de una GPU A10 y el throughput aún requieren medición. Tampoco se proporcionan cifras de FID, CLIP score ni comparaciones con otros modelos.

## Requisitos de hardware

- **VRAM estimada (cálculo propio a partir del recuento de parámetros, no publicado por el autor):** solo los pesos en BF16 de los 5,55 mil millones de parámetros ocupan aproximadamente 11,1 GB; sumando el VAE en FP32 y las activaciones a 1024×1024, un rango realista de trabajo se sitúa en torno a 13–16 GB.
- **GPU de datacenter:** A10 (24 GB) es el objetivo declarado por el autor, pero el ajuste de memoria está sin verificar; A100 y H100 ofrecen margen amplio para lotes mayores.
- **GPU de consumo:** cabe en RTX 4090 y RTX 3090 (24 GB) con holgura; en tarjetas de 16 GB como la RTX 4080 el margen es ajustado y probablemente exija reducir resolución o aplicar optimizaciones de memoria no incluidas por defecto.
- **Configuración por defecto:** sin offloading a CPU, lo que implica que toda la memoria debe caber en la GPU.
- **Opciones de despliegue:** Diffusers (librería declarada), Hugging Face Inference Endpoints vía `handler.py`, Modal vía `modal_app.py`, y fallback GGUF únicamente si se aporta un checkpoint Unsloth separado. vLLM y TGI no aplican a un pipeline de difusión.
- **Latencia y throughput:** no disponibles; dependen del número de pasos (4–16), de la resolución y de la GPU. El valor por defecto de 16 pasos es el más costoso del rango configurable.

## Comparativa con modelos similares

| Modelo | Parámetros | Resolución nativa | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `socialtrait/flux-3-image-klein-infendpoint` | 5,55 B (agregado) | 1024×1024 | FLUX Community License | Repo HF, 20,3 GB, 0 descargas | Subconjunto de despliegue; pesos idénticos al upstream |
| `black-forest-labs/flux-3-image-klein` (upstream) | No disponible en la información proporcionada | 1024×1024 | FLUX Community License | Repo oficial de BFL | Incluye pesos duplicados, FP8/NVFP4 y galería; sirve de referencia de calidad |
| FLUX.1 [dev] | 12 B (dato público de la ficha de BFL) | 1024×1024 | FLUX.1 [dev] Non-Commercial License | Repo oficial de BFL | Modelo de generación anterior de la familia; licencia no comercial |
| FLUX.1 [schnell] | 12 B (dato público de la ficha de BFL) | 1024×1024 | Apache 2.0 | Repo oficial de BFL | Variante destilada para pocos pasos; licencia permisiva |

No se dispone de métricas de calidad (FID, CLIP score, evaluaciones humanas) de este checkpoint ni de comparaciones directas con las alternativas, por lo que la comparativa se limita a parámetros, licencia y formato de distribución. Los datos de FLUX.1 [dev] y FLUX.1 [schnell] provienen de sus fichas públicas y no de la información proporcionada en esta consulta.

## Limitaciones y advertencias

- **No es un modelo nuevo:** es un subconjunto de despliegue con pesos sin modificar; cualquier limitación del modelo upstream se hereda íntegramente.
- **Mantenimiento de terceros:** el paquete lo mantiene Socialtrait y el autor declara explícitamente que no es un producto oficial de Black Forest Labs.
- **Sin validación de rendimiento:** el ajuste en A10 y el throughput están sin medir según la propia model card; no hay garantías publicadas de latencia ni de memoria.
- **Prompt upsampling ausente:** el modelo separado de upsampling de prompts no está incluido, por lo que la calidad puede quedar por debajo de la del pipeline upstream completo si este lo usa por defecto.
- **Cuantizaciones omitidas:** no se incluyen FP8 ni NVFP4, lo que limita el ahorro de VRAM en GPUs con soporte para esos formatos; el GGUF requiere un checkpoint externo de Unsloth.
- **Ruta `/sdxl` degradada:** ignora las opciones exclusivas de SDXL y fuerza 16 pasos, de modo que un cliente migrado no obtendrá el mismo control que con el backend anterior.
- **Idiomas no documentados:** se desconoce la cobertura real del text encoder; los prompts en castellano podrían rendir peor que en inglés, pero no hay datos que lo confirmen ni que lo descarten.
- **Sesgos y alucinación visual:** no hay documentación del autor sobre sesgos demográficos, estilos sobrerrepresentados o tendencia a generar contenido plausible pero incorrecto (texto en imágenes, anatomía, marcas). Es un riesgo inherente a los modelos generativos de imagen y debe evaluarse antes de producción.
- **Licencia restrictiva:** la FLUX Community License exige atribución según `NOTICE.md` y puede imponer condiciones al uso comercial; hay que revisar `LICENSE.md` antes de desplegar en un producto de pago.
- **Madurez del repo:** 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo día; no hay historial de uso que respalde su estabilidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/socialtrait/flux-3-image-klein-infendpoint
- Modelo base: https://huggingface.co/black-forest-labs/flux-3-image-klein
- Commit upstream referenciado: https://huggingface.co/black-forest-labs/flux-3-image-klein/commit/337337621b8526e120f2275d250242f4a6bedd75
- Licencia: https://huggingface.co/socialtrait/flux-3-image-klein-infendpoint/blob/main/LICENSE.md
- Aviso de atribución: https://huggingface.co/socialtrait/flux-3-image-klein-infendpoint/blob/main/NOTICE.md
- Model card original del upstream: https://huggingface.co/socialtrait/flux-3-image-klein-infendpoint/blob/main/README.upstream.md
- Instrucciones de despliegue en Modal: https://huggingface.co/socialtrait/flux-3-image-klein-infendpoint/blob/main/DEPLOYMENT.txt
