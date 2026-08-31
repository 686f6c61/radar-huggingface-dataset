# s-zaizen/DeepSeek-V4-Flash-Vision-Exp-NVFP4

## Resumen

DeepSeek-V4-Flash-Vision-Exp-NVFP4 es un derivado de precision mixta del modelo multimodal DeepSeek-V4-Flash-Vision-Exp, publicado por el usuario s-zaizen en Hugging Face. El modelo base, desarrollado por DeepSeek, es una variante experimental de la familia V4-Flash que anade comprension de imagenes, capturas de pantalla y graficos a la arquitectura de texto de V4-Flash. Este derivado aplica una cuantizacion NVFP4 (W4A4) exclusivamente a los expertos enrutados de la capa MoE, manteniendo el resto de componentes (atencion, router, expertos compartidos, embeddings, cabeza de lenguaje, bloques MTP/DSpark y torre de vision) en su formato original.

El objetivo principal es reducir la huella de memoria para permitir la inferencia en sistemas con memoria unificada limitada, como los NVIDIA DGX Spark con chip GB10. La cuantizacion se realiza mediante la conversion lossless MXFP4 a NVFP4 de NVIDIA ModelOpt, con calibracion de escalas de activacion sobre 64 muestras de dos datasets. El modelo totaliza 304.646.824.126 parametros (~304,6 mil millones) y el repositorio ocupa 176,5 GB en 48 shards safetensors. La licencia es MIT. Su relevancia radica en que acerca un modelo multimodal de gran tamano a entornos de inferencia locales con memoria restringida, aunque la validacion de calidad y rendimiento aun no se ha completado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE multimodal (texto + vision), basada en DeepSeek-V4-Flash-Vision-Exp |
| Parametros totales | 304.646.824.126 (~304,6 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 W4A4 con group size 16 (solo expertos MoE enrutados); resto en formato original del checkpoint fuente |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (48 shards) |

## Arquitectura y entrenamiento

El modelo es un derivado de precision mixta del checkpoint oficial `deepseek-ai/DeepSeek-V4-Flash-Vision-Exp` en la revision `86f746b36186f0e567729a5c06a8c918caba82a9`. No se trata de un entrenamiento nuevo, sino de una cuantizacion post-entrenamiento (PTQ) aplicada con NVIDIA ModelOpt. Los pesos fuente de los expertos enrutados estan en formato MXFP4 y se convierten a NVFP4 mediante el cast lossless MXFP4-to-NVFP4 de ModelOpt, disenado para no perder precision en la conversion de pesos. Las escalas de activacion se calibran con 64 muestras de `cnn_dailymail` y `nvidia/Nemotron-Post-Training-Dataset-v2`, con longitud de secuencia 512 y paralelismo de modelo MP=2 sobre dos sistemas NVIDIA DGX Spark.

La carga de pesos utiliza un wrapper tensor-a-tiempo alrededor del punto de entrada PTQ oficial para evitar materializar un segundo checkpoint de 86 GB en la memoria unificada del DGX Spark. Para la calibracion en el chip GB10 (SM121), se reduce el tile block de la atencion sparse de 64 a 32, ya que el kernel fuente solicita 104.448 bytes de memoria compartida dinamica mientras que GB10 permite 101.376 bytes; este cambio de compatibilidad solo afecta a la copia de calibracion, no a los archivos de inferencia publicados. Ademas, al faltar la extension `fast_hadamard_transform` en el runtime ARM64, se proporciona una implementacion PyTorch BF16 butterfly de siete etapas para las rotaciones del indexador de 128 vias, verificada contra la definicion densa de Walsh-Hadamard. La cuantizacion de activaciones es un cambio calibrado y no lossless, por lo que no debe asumirse equivalencia de rendimiento con el modelo base sin evaluacion.

## Capacidades

- Comprension de imagenes y capturas de pantalla, incluyendo analisis de graficos, tablas y tareas tipo OCR, heredadas del modelo base DeepSeek-V4-Flash-Vision-Exp.
- Generacion de texto y razonamiento sobre contenido multimodal, integrando informacion visual y textual en la misma pasada de inferencia.
- Procesamiento de documentos con contenido mixto (texto e imagenes) gracias a la torre de vision dedicada.
- Capacidades de texto de la familia V4-Flash, incluyendo generacion de codigo y razonamiento, aunque no se detallan en la informacion disponible.
- Soporte de tool calling, agentes y modo de pensamiento: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible.

## Casos de uso

- Analisis de documentos escaneados: el modelo puede extraer texto e interpretar elementos visuales de facturas, contratos o formularios, combinando OCR con comprension semantica en un solo paso. La cuantizacion NVFP4 permite ejecutarlo en sistemas con memoria unificada de 128 GB como el DGX Spark.
- Automatizacion de interfaces de usuario: al comprender capturas de pantalla, puede generar descripciones de estado de una aplicacion o sugerir acciones siguientes, util para pruebas automatizadas o asistentes de accesibilidad.
- Soporte tecnico con evidencia visual: un usuario puede enviar una captura de pantalla de un error o mensaje del sistema y el modelo puede interpretar el contexto visual junto con el texto para diagnosticar el problema.
- Procesamiento de graficos financieros: analisis de graficos de cotizaciones, histogramas o diagramas de negocio, extrayendo tendencias y valores directamente de la imagen, sin necesidad de datos tabulares estructurados.
- Descripcion de imagenes para accesibilidad: generacion de descripciones alternativas detalladas de imagenes en sitios web o documentos, facilitando la navegacion a personas con discapacidad visual.
- Clasificacion y moderacion de contenido visual: identificacion de tipos de contenido en imagenes (diagramas, capturas, fotografias) para enrutar a pipelines especificos, aprovechando la naturaleza multimodal del modelo.
- Extraccion de informacion de recibos y albaranes: lectura de cantidades, fechas y conceptos a partir de imagenes, con salida estructurada para integracion en sistemas de contabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que la validacion de calidad y rendimiento (A/B) se ha diferido intencionadamente hasta despues de la publicacion, y que no debe inferirse equivalencia de benchmarks a partir del cast lossless de pesos, ya que la cuantizacion de activaciones sigue siendo un cambio calibrado pendiente de evaluacion.

## Requisitos de hardware

- Disenado para NVIDIA DGX Spark con chip GB10 (SM121) y memoria unificada; la calibracion se realizo con dos sistemas DGX Spark en paralelo de modelo (MP=2).
- El repositorio ocupa 176,5 GB en disco; el checkpoint fuente pesa aproximadamente 86 GB, y el wrapper tensor-a-tiempo evita materializar una segunda copia en memoria unificada.
- No se proporcionan datos de VRAM para GPUs convencionales (A100, H100, RTX 4090, etc.); la cuantizacion NVFP4 de los expertos reduce la huella respecto al checkpoint fuente, pero el resto de componentes conserva su formato original.
- Opciones de despliegue: no se mencionan runtimes especificos (vLLM, llama.cpp, Ollama, TGI); la model card indica que el soporte de runtime y la validacion de generacion no estan reclamados aun.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Licencia | Estado |
|---|---|---|---|---|
| DeepSeek-V4-Flash-Vision-Exp (base) | 304,6B | Formato original (MXFP4/BF16/FP8 segun componente) | MIT | Modelo oficial de DeepSeek, multimodal |
| s-zaizen/DeepSeek-V4-Flash-Vision-Exp-NVFP4 (este) | 304,6B | NVFP4 W4A4 en expertos enrutados; resto original | MIT | Derivado cuantizado, validacion incompleta |
| webbrain-one/DeepSeek-V4-Flash-0731-Vision-NVFP4 | no disponible | NVFP4 | no disponible | Derivado similar sobre otra revision de V4-Flash |
| FlyCockpit/DeepSeek-V4-Flash-0731-vision | no disponible | LoRA + torre de vision separada | no disponible | Enfoque no oficial, no usa los pesos Vision-Exp |

La comparativa se limita a derivados del mismo modelo base; no se dispone de datos de rendimiento para establecer comparaciones cuantitativas.

## Limitaciones y advertencias

- La validacion de soporte de runtime y generacion no esta reclamada; el modelo se publica con validacion estructural y de cast de pesos superada, pero sin confirmacion de que la inferencia completa funcione correctamente en todos los entornos.
- La calidad y el rendimiento no se han evaluado (A/B diferido); la cuantizacion de activaciones es un cambio calibrado y no lossless, por lo que puede degradar la precision respecto al modelo base.
- Solo los expertos MoE enrutados estan cuantizados en NVFP4; el resto de componentes conserva su formato original, lo que limita la reduccion total de memoria.
- La calibracion se realizo con un subconjunto pequeno de datos (64 muestras por dataset) y una longitud de secuencia fija de 512 tokens, lo que puede no representar la distribucion real de uso.
- Se requieren ajustes especificos para GB10 (reduccion del tile block de atencion sparse y sustitucion de `fast_hadamard_transform`), que pueden afectar a la compatibilidad con otros hardware.
- No se documentan sesgos del modelo base ni riesgos de alucinacion especificos de este derivado; al ser un modelo multimodal experimental, puede presentar errores en la interpretacion de imagenes complejas o ambiguas.
- La licencia MIT permite uso comercial, pero el modelo base es experimental y puede cambiar sin previo aviso.

## Enlaces

- Repositorio del modelo derivado: https://huggingface.co/s-zaizen/DeepSeek-V4-Flash-Vision-Exp-NVFP4
- Modelo base en Hugging Face: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-Vision-Exp
- Blog oficial de DeepSeek sobre V4 (Flash-Vision, Pro GA y precios): https://deepseek.ai/blog/deepseek-v4-rollout-flash-vision-pricing-harness-2026-guide
- Analisis de DeepSeek V4 Flash Vision Exp (API, benchmarks y coste): https://www.iweaver.ai/blog/deepseek-v4-flash-vision-exp/
- Derivado similar (webbrain-one): https://huggingface.co/webbrain-one/DeepSeek-V4-Flash-0731-Vision-NVFP4
- Discusion en foros de NVIDIA sobre el lanzamiento de pesos abiertos: https://forums.developer.nvidia.com/t/deepseek-v4-flash-vision-exp-is-released-as-open-weights/381911
