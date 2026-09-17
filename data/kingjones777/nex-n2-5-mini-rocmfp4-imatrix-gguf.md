# kingjones777/Nex-N2.5-mini-ROCmFP4-imatrix-GGUF

## Resumen

Nex-N2.5-mini-ROCmFP4-imatrix-GGUF es un paquete de cuantizaciones de 4 bits en formato GGUF del modelo multimodal Nex-N2.5-mini, publicado por el usuario kingjones777. No se trata de un modelo entrenado desde cero, sino de una destilacion de pesos del modelo base nex-agi/Nex-N2.5-mini (35.107.181.936 parametros segun su model card) mediante el cuantizador ROCmFP4 de llama.cpp, con escalas calibradas por matriz de importancia (imatrix). El objetivo es doble: reducir el modelo a unos 17-18 GiB por variante y, al mismo tiempo, minimizar la perdida de calidad respecto a la referencia BF16.

La relevancia de esta publicacion esta en el calibrado. Frente a la build estandar del mismo autor (kingjones777/Nex-N2.5-mini-ROCmFP4-GGUF), la unica diferencia es como se elige la escala de cada bloque de 4 bits: en lugar de la busqueda sin ponderar por defecto, se usa una busqueda exhaustiva ponderada por la magnitud con la que las activaciones de calibracion utilizan cada peso. El resultado es que, con el mismo tamano de fichero y el mismo coste de computo por token, la divergencia KL frente a BF16 baja entre un 18 % y un 21 % segun la variante.

El paquete esta orientado especificamente a hardware AMD Strix Halo (gfx1151): Ryzen AI Max 395 con iGPU Radeon 8060S. Se ofrecen tres niveles de cuantizacion (STRIX_LEAN, COHERENT y FAST) con el mismo proyector de vision, y se documentan medidas de velocidad tanto en el backend ROCm0 como en Vulkan0 de llama.cpp. El modelo base es un MoE multimodal de 40 capas con 262.144 tokens de contexto, razonamiento y vision.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer hibrido basado en Qwen3.5: 40 capas, de las cuales 30 son de atencion lineal Gated DeltaNet y 10 de atencion completa |
| Parametros totales | 35.107.181.936 (segun la model card del autor). Los metadatos de safetensors del repo indican 446.571.248, cifra que no coincide con la anterior |
| Parametros activos | 8 de 256 expertos enrutados por token |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | ROCmFP4 (4 bits) en tres variantes: STRIX_LEAN, COHERENT y FAST; calibracion imatrix; formato GGUF |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |
| Modalidades | Texto e imagen (pipeline image-text-to-text, incluye proyector de vision) |
| Tamano del repositorio | 58,3 GB en total; cada variante pesa entre 17,37 y 18,48 GiB |
| Modelo base | nex-agi/Nex-N2.5-mini (relacion: quantized) |
| Cabeza MTP | No incluida en este repo ni en la build estandar |

## Arquitectura y entrenamiento

Este repositorio no aporta entrenamiento nuevo: es una cuantizacion. La arquitectura descrita corresponde al modelo base Nex-N2.5-mini, un transformer MoE de 40 capas que combina 30 capas de atencion lineal Gated DeltaNet con 10 capas de atencion completa, 256 expertos enrutados de los que se activan 8 por token, y una ventana de contexto de 262.144 tokens. El pipeline declarado es image-text-to-text, e incluye un proyector de vision que se conserva intacto en las tres variantes cuantizadas. No se detalla en la informacion disponible la composicion del dataset de entrenamiento ni si hubo fases de RLHF o DPO en el modelo original.

La innovacion tecnica de esta publicacion es el uso de la ruta de cuantizacion ponderada por importancia de ROCmFP4. Con `--imatrix`, la escala de cada bloque de 4 bits se elige mediante una busqueda exhaustiva que minimiza el error ponderado por la intensidad con la que las activaciones de calibracion usan cada peso, en lugar del criterio no ponderado por defecto. La calibracion se calculo sobre el GGUF en BF16 con el fichero bartowski calibration_datav3.txt, en 129 fragmentos de 512 tokens, sobre CPU, cargando 510 entradas procedentes de los registros de cuantizacion de N3. El fichero resultante es `Nex-N2.5-mini.imatrix` en formato GGUF, con sha256 `7e5afffc822c64a7b43a1223d0094fb60895a521f6c89b912409d25091bd17f8`. El cambio afecta solo a que escalas se eligen al mismo ancho de bits y con los mismos tipos de tensor: mueve la calidad, no el tamano, y el coste de computo por token es identico.

## Capacidades

- Generacion de texto y razonamiento: el modelo base esta etiquetado como reasoning y esta orientado a tareas de razonamiento multi-paso.
- Vision: es un modelo image-text-to-text con proyector de vision incluido, por lo que acepta imagenes ademas de texto.
- Arquitectura MoE con activacion dispersa: 8 de 256 expertos por token, lo que reduce el coste de inferencia respecto a un modelo denso del mismo tamano total.
- Contexto largo: 262.144 tokens, adecuado para documentos extensos, repositorios de codigo o conversaciones muy largas.
- Capacidades multilingues: no disponible (no se documentan los idiomas soportados).
- Tool calling o function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso explicito: no disponible en la informacion proporcionada.
- Modo thinking: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local en equipos Strix Halo: el paquete esta disenado para gfx1151 (Ryzen AI Max 395 con Radeon 8060S). Con 17,37-18,48 GiB de pesos por variante, el modelo entra en la memoria unificada de estas plataformas y permite ejecutar un MoE multimodal de 35.000 millones de parametros sin GPU dedicada, a 61-68 tokens/s de decodificacion.
- Analisis de documentos con imagenes: al ser image-text-to-text con 262.144 tokens de contexto, permite procesar informes escaneados, capturas de pantalla o diagramas junto con texto largo en una sola pasada, sin trocear el documento.
- Asistencia tecnica sobre repositorios de codigo: el contexto de 262.144 tokens permite cargar varios ficheros fuente simultaneamente y mantener una conversacion multi-turno sobre el codigo, siempre que se despliegue con llama.cpp sobre el hardware objetivo.
- Prototipado de razonamiento en local: la etiqueta reasoning y la arquitectura MoE lo hacen util para experimentar con cadenas de razonamiento en estaciones de trabajo AMD sin depender de APIs externas, control total sobre los datos.
- Evaluacion de cuantizaciones: este repo sirve como material de estudio reproducible para comparar el efecto de imatrix sobre una misma cuantizacion, ya que publica las tres variantes con y sin calibracion y las metricas KLD asociadas.
- Despliegue con llama.cpp en entornos AMD: el servidor de llama.cpp (build `d3ca537`, sin parchear) soporta las rutas ROCm y Vulkan, lo que permite levantar un endpoint compatible con OpenAI sobre hardware Strix Halo o cualquier GPU con soporte Vulkan.
- Clasificacion y extraccion de informacion multimodal: al aceptar imagen y texto, puede etiquetar o extraer campos de formularios, facturas o capturas en pipelines por lotes, siempre que el throughput de prellenado (1145-1184 tokens/s en ROCm0) sea suficiente para el volumen requerido.

## Benchmarks y rendimiento

La model card proporciona una evaluacion de calidad frente al GGUF en BF16 (logits de referencia calculados en CPU) sobre un corpus reservado: wikitext-2 *test*, con `-c 2048`, 40 fragmentos de 1.023 tokens puntuados cada uno (40.920 tokens en total). La metrica principal es la divergencia KL por token de la distribucion de siguiente token de cada cuantizacion respecto a BF16. El texto de calibracion y el de evaluacion son corpus distintos.

| Variante | Build | Tamano | KLD vs BF16 (menor mejor) | Top-1 coincidente | PPL (x BF16) | KLD percentil 99 |
|---|---|---:|---:|---:|---:|---:|
| STRIX_LEAN | estandar | 17,46 GiB | 0,1044 ± 0,0014 | 86,66 % | 6,4740 ± 0,0798 (x1,0393) | 0,9267 |
| STRIX_LEAN | imatrix | 17,46 GiB | 0,0852 ± 0,0013 | 87,85 % | 6,3536 ± 0,0770 (x1,0200) | 0,7372 |
| COHERENT | estandar | 18,48 GiB | 0,0971 ± 0,0013 | 87,29 % | 6,5617 ± 0,0812 (x1,0534) | 0,8745 |
| COHERENT | imatrix | 18,48 GiB | 0,0769 ± 0,0012 | 88,46 % | 6,3601 ± 0,0770 (x1,0210) | 0,6852 |
| FAST | estandar | 17,37 GiB | 0,1088 ± 0,0014 | 86,41 % | 6,5498 ± 0,0809 (x1,0515) | 0,9568 |
| FAST | imatrix | 17,37 GiB | 0,0890 ± 0,0013 | 87,45 % | 6,3681 ± 0,0773 (x1,0223) | 0,7847 |

Mejora de imatrix sobre la build estandar: STRIX_LEAN reduce la KLD media un 18,5 % (10,0 sigma), con mediana -19,4 %, percentil 99 -20,4 % y top-1 +1,19 puntos porcentuales; COHERENT la reduce un 20,7 % (11,3 sigma), con mediana -21,3 %, percentil 99 -21,6 % y top-1 +1,18 puntos; FAST la reduce un 18,2 % (10,2 sigma), con mediana -20,1 %, percentil 99 -18,0 % y top-1 +1,05 puntos.

Consistencia entre backends (KLD en ROCm0 / Vulkan0): STRIX_LEAN 0,1044 / 0,1044; COHERENT 0,0971 / 0,0972; FAST 0,1088 / 0,1088; STRIX_LEAN imatrix 0,0852 / 0,0836; COHERENT imatrix 0,0769 / 0,0768; FAST imatrix 0,0890 / 0,0891. La perplejidad de referencia en BF16 para la primera ventana fue 5,6964 (5,6953 en Vulkan0).

Rendimiento medido (llama.cpp, servidor `d3ca537`):

| Variante | Decodificacion ROCm0 | Decodificacion Vulkan0 | Prellenado ROCm0 |
|---|---:|---:|---:|
| STRIX_LEAN | 63,29 tok/s | 67,77 tok/s | 1145 tok/s |
| COHERENT | 61,56 tok/s | 67,81 tok/s | 1184 tok/s |
| FAST | 63,03 tok/s | 68,44 tok/s | 1154 tok/s |

No se han publicado resultados de benchmarks de tareas estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM o memoria unificada estimada: entre 17,37 y 18,48 GiB solo para los pesos, segun la variante, mas el espacio de la cache KV y el proyector de vision. El repositorio completo ocupa 58,3 GB.
- GPU objetivo: AMD Strix Halo con gfx1151, es decir Ryzen AI Max 395 con iGPU Radeon 8060S. Es la plataforma para la que se calibro y valido el paquete.
- Compatibilidad con GPU de consumo: no documentada. El autor solo reporta ejecuciones en el backend ROCm0 y en el backend Vulkan0 de llama.cpp, de modo que cualquier GPU con soporte Vulkan es un candidato teorico, pero no hay medidas publicadas en hardware NVIDIA o en GPUs de consumo.
- Opciones de despliegue: llama.cpp con el servidor del commit `d3ca537` sin parchear, en sus rutas ROCm y Vulkan. No se documentan vLLM, TGI ni Ollama en la informacion proporcionada.
- Latencia y throughput: decodificacion de 61,56 a 63,29 tok/s en ROCm0 y de 67,77 a 68,44 tok/s en Vulkan0; prellenado de 1145 a 1184 tok/s en ROCm0, sobre las tres variantes.
- Eleccion recomendada por el autor: empezar por COHERENT, que tiene una KLD un 9,6 % inferior a STRIX_LEAN a cambio de 1051 MiB mas, con una decodificacion solo un 2,8 % mas lenta en ROCm0 y practicamente identica en Vulkan0. FAST no aporta una ganancia clara de velocidad y su KLD es peor que la de STRIX_LEAN.

## Comparativa con modelos similares

La informacion disponible no incluye resultados de modelos de terceros comparables, por lo que la comparacion se limita a las variantes del propio repositorio, a la build estandar sin imatrix y al modelo base.

| Modelo o variante | Parametros | Contexto | KLD vs BF16 | Tamano | Licencia |
|---|---|---:|---:|---:|---|
| Nex-N2.5-mini ROCmFP4 imatrix COHERENT (este repo) | 35,1 B totales, 8 de 256 expertos activos | 262.144 | 0,0769 | 18,48 GiB | Apache-2.0 |
| Nex-N2.5-mini ROCmFP4 imatrix STRIX_LEAN (este repo) | idem | 262.144 | 0,0852 | 17,46 GiB | Apache-2.0 |
| Nex-N2.5-mini ROCmFP4 imatrix FAST (este repo) | idem | 262.144 | 0,0890 | 17,37 GiB | Apache-2.0 |
| Nex-N2.5-mini ROCmFP4 estandar (repo companero) | idem | 262.144 | 0,0971-0,1088 | 17,37-18,48 GiB | Apache-2.0 |
| Nex-N2.5-mini BF16 (modelo base nex-agi) | 35,1 B totales | 262.144 | referencia | no disponible | Apache-2.0 |

Comparacion con modelos de otros autores de la misma categoria (MoE multimodal de ~35 B con contexto largo): no disponible.

## Limitaciones y advertencias

- Es una cuantizacion a 4 bits, no el modelo original: la KLD de 0,0769-0,0890 frente a BF16 implica una perdida de calidad medible. El texto top-1 coincide entre el 86,41 % y el 88,46 % de los casos segun la variante, lo que significa que entre el 11,5 % y el 13,6 % de los tokens cambian respecto al modelo de referencia.
- Discrepancia en el recuento de parametros: los metadatos de safetensors del repo indican 446.571.248 parametros, mientras que la model card y el modelo base declaran 35.107.181.936. Conviene verificar la cifra antes de usarla en documentacion o planificacion.
- Idiomas soportados no documentados: no se puede asumir un rendimiento multilingue concreto sin pruebas propias.
- La model card menciona una seccion de "Known issues and limits" que no esta incluida en la informacion proporcionada; es probable que contenga advertencias relevantes para produccion.
- La evaluacion se limita a divergencia KL y perplejidad sobre wikitext-2 test. No hay datos de tareas de razonamiento, codigo, matematicas ni vision, por lo que el impacto real de la cuantizacion en estas capacidades es desconocido.
- Orientado a un backend concreto: las medidas se tomaron en ROCm0 y Vulkan0 de llama.cpp sobre gfx1151. No hay garantias de rendimiento ni de estabilidad en otras plataformas, y no se documenta soporte de CUDA, vLLM, TGI u Ollama.
- Requiere la build concreta del servidor llama.cpp (`d3ca537`) sin parchear; versiones distintas pueden no soportar los tipos de tensor ROCmFP4.
- Sin cabeza MTP: no se puede aprovechar decodificacion especulativa basada en MTP con estos ficheros.
- Riesgo de alucinacion: no se documenta ninguna evaluacion de fidelidad factual del modelo base ni de las cuantizaciones. Al ser un modelo de razonamiento y vision, el riesgo de respuestas plausibles pero incorrectas es real y debe mitigarse con verificacion externa en entornos de produccion.
- Sesgos conocidos: no disponible. La model card no incluye analisis de sesgos.
- Licencia Apache-2.0: permite uso comercial sin restricciones adicionales conocidas, pero se hereda de un modelo base del que no se documentan las condiciones de entrenamiento ni de procedencia de datos.

## Enlaces

- Repositorio HuggingFace de este modelo: https://huggingface.co/kingjones777/Nex-N2.5-mini-ROCmFP4-imatrix-GGUF
- Build estandar sin imatrix (repo companero): https://huggingface.co/kingjones777/Nex-N2.5-mini-ROCmFP4-GGUF
- Modelo base: https://huggingface.co/nex-agi/Nex-N2.5-mini
- Paper, blog o repositorio adicionales: no disponible. Las busquedas web realizadas no devolvieron resultados relacionados con este modelo, unicamente paginas de empresas de robotica sin relacion con el contenido de esta ficha.
