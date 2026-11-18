# aisingapore/Qwen-SEA-LION-v5-397B-A17B-Plus-NVFP4

## Resumen

Qwen-SEA-LION-v5-397B-A17B-Plus-NVFP4 es la version cuantizada en NVFP4 del modelo Qwen-SEA-LION-v5-397B-A17B-Plus, desarrollado por el AI Products Pillar de AI Singapore con financiacion de la National Research Foundation de Singapur. Forma parte de la familia SEA-LION (Southeast Asian Languages In One Network), una coleccion de modelos de lenguaje disenada especificamente para las lenguas y contextos del sudeste asiatico. El modelo es un transformer causal multimodal (texto e imagen) con mezcla de expertos (MoE), construido sobre la base de Qwen 3.5, con 205.691.553.008 parametros totales reportados en safetensors y una ventana de contexto de 262.144 tokens.

La relevancia de esta version concreta reside en la cuantizacion: los pesos de los expertos se han convertido a NVFP4 (4 bits en formato de punto flotante de NVIDIA) mediante NVIDIA Model Optimizer, con una perdida de precision minima segun el autor, mientras que el resto de pesos, incluidas las tablas n-gram, permanecen en BF16. Esto reduce drasticamente los requisitos de memoria frente a la version BF16 y permite ejecutar el modelo en hardware Blackwell o en cuatro GPU H200.

El modelo esta pensado para despliegues de inferencia de alta capacidad en produccion, con soporte de razonamiento explicito (thinking mode), tool calling y entrada de imagenes, y cubre nueve idiomas: birmano, chino, ingles, indonesio, filipino, malayo, tamil, tailandes y vietnamita. La licencia MIT facilita su adopcion comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con mezcla de expertos (MoE) y codificador de vision; pesos de expertos en NVFP4, resto en BF16 |
| Parametros totales | 205.691.553.008 (segun safetensors); el nombre del modelo indica 397B-A17B |
| Parametros activos | No disponible (el nombre sugiere 17B activos, sin confirmacion en la informacion proporcionada) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | NVFP4 (pesos de expertos); versiones alternativas en BF16, FP8 y GGUF |
| Idiomas soportados | Birmano, chino, ingles, indonesio, filipino, malayo, tamil, tailandes, vietnamita |
| Licencia | MIT |
| Formato de pesos | safetensors (cuantizacion NVFP4), compatible con transformers, vLLM y SGLang |

## Arquitectura y entrenamiento

El modelo es un transformer causal con mezcla de expertos (MoE) que incorpora un codificador de vision, lo que lo habilita para tareas image-text-to-text. Sobre la arquitectura base Qwen 3.5, AI Singapore ha aplicado adaptacion para lenguas del sudeste asiatico. Una particularidad tecnica destacable es la presencia de tablas n-gram (aproximadamente 164B parametros, 328 GB en BF16) que actuan como mecanismo de embedding o memoria asociativa y que, en esta version cuantizada, se mantienen en BF16 y pueden descargarse a memoria de host mediante opciones como `--engram-config '{"cpu_offload":true}'` en vLLM o `--ple-offload-embedding` en SGLang. Esta version NVFP4 no incluye la capa de prediccion multi-token (MTP).

La cuantizacion se realizo con NVIDIA Model Optimizer, convirtiendo unicamente los pesos de los expertos a NVFP4, manteniendo el tokenizador, la plantilla de chat y los valores por defecto de muestreo sin cambios. No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento con modo de pensamiento explicito (`enable_thinking`), que expone un campo `reasoning` o `reasoning_content` separado de la respuesta final.
- Comprension de imagenes junto con texto (pipeline image-text-to-text), gracias al codificador de vision.
- Tool calling y function calling, con parsers dedicados en vLLM (`qwen3_coder`) y SGLang.
- Soporte para agentes y razonamiento multi-paso, incluyendo eleccion automatica de herramientas (`--enable-auto-tool-choice`).
- Capacidades multilingues en nueve idiomas del sudeste asiatico y globales: birmano, chino, ingles, indonesio, filipino, malayo, tamil, tailandes y vietnamita.
- Manejo de contextos largos de hasta 262.144 tokens.
- Compatibilidad con endpoints tipo OpenAI a traves de vLLM y SGLang.

## Casos de uso

- Atencion al cliente multilingue en el sudeste asiatico: el modelo puede gestionar conversaciones multi-turno en birmano, indonesio, malayo, tailandes o vietnamita con una ventana de 262.144 tokens, lo que permite mantener historiales extensos y documentacion de referencia en el mismo contexto.
- Comercio internacional y logistica regional: como muestra la model card, puede responder consultas sobre documentacion de exportacion, tiempos de transito y riesgos de cadena de frio en rutas concretas (por ejemplo, envios de durian congelado de Medan a Singapur), redactando la respuesta en el idioma del usuario y en formato estructurado.
- Procesamiento de documentos con imagenes: al aceptar entrada image-text-to-text, sirve para extraer y razonar sobre facturas, formularios aduaneros o etiquetas escaneadas, combinando OCR implicito con comprension del texto.
- Asistentes con tool calling en produccion: integrable en pipelines que requieran llamadas a APIs externas (consultas meteorologicas, bases de datos, sistemas de reservas) mediante function calling y parsers dedicados en vLLM o SGLang.
- Generacion y revision de codigo asistida: el soporte de tool calling y el parser `qwen3_coder` permiten integrarlo en flujos de CI/CD o entornos de desarrollo para sugerencias, revisiones y automatizacion de tareas.
- Investigacion linguistica y adaptacion cultural: util para construir corpus, traducciones y evaluaciones en lenguas de bajos recursos del sudeste asiatico, aprovechando su entrenamiento especifico en esas lenguas.
- Despliegue de agentes autonomos multi-paso: el modo de razonamiento explicito y el soporte de agentes permiten encadenar pasos de planificacion y ejecucion con trazabilidad del razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma exacta en la informacion proporcionada. El repositorio ocupa 570,1 GB, y las tablas n-gram (unos 164B parametros, 328 GB en BF16) pueden descargarse a memoria de host, por lo que la VRAM necesaria para los pesos en GPU es sustancialmente menor que el tamano total del repositorio.
- GPU recomendadas: NVIDIA Blackwell (disenadas para NVFP4) o cuatro GPU H200 en configuracion tensor-parallel de 4.
- GPU de consumo: no disponible; por el tamano del modelo y el numero de GPU requeridas, no se espera que quepa en GPU de consumo convencionales.
- Opciones de despliegue: vLLM (con `--tensor-parallel-size 4`, `--enable-expert-parallel` y `--engram-config '{"cpu_offload":true}'`) y SGLang (con `--tp 4` y `--ple-offload-embedding`). Existe ademas una version GGUF para llama.cpp.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen-SEA-LION-v5-397B-A17B-Plus-NVFP4 | 205.691.553.008 (safetensors); nombre indica 397B-A17B | 262.144 | NVFP4 (expertos) | MIT | Version cuantizada para Blackwell/H200; sin capa MTP |
| Qwen-SEA-LION-v5-397B-A17B-Plus (BF16) | No disponible | 262.144 | BF16 | MIT | Version completa sin cuantizar |
| Qwen-SEA-LION-v5-397B-A17B-Plus-FP8 | No disponible | 262.144 | FP8 | MIT | Version en 8 bits |
| Qwen-SEA-LION-v5-397B-A17B-Plus-GGUF | No disponible | 262.144 | GGUF (llama.cpp) | MIT | Version para llama.cpp |

No se dispone en la informacion proporcionada de datos de rendimiento comparativo con modelos de otras familias.

## Limitaciones y advertencias

- No se han publicado datos de benchmarks que permitan verificar la calidad real del modelo ni la perdida de precision introducida por la cuantizacion NVFP4.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se documentan medidas especificas de mitigacion en la informacion disponible.
- La cuantizacion NVFP4 esta disenada para GPU NVIDIA Blackwell; en otras arquitecturas puede requerir configuraciones alternativas (cuatro H200) o no ser compatible.
- El modelo depende de tablas n-gram de gran tamano (unos 164B parametros, 328 GB en BF16) que deben residir en memoria de host, lo que incrementa los requisitos de RAM del sistema de despliegue.
- Esta version no incluye la capa de prediccion multi-token (MTP), a diferencia de otras variantes.
- Cobertura linguistica limitada a los nueve idiomas declarados; el rendimiento en otras lenguas no esta documentado.
- La licencia MIT permite uso comercial, pero el usuario debe verificar las condiciones de los datos de entrenamiento subyacentes, no detalladas en la informacion proporcionada.
- El numero de descargas (31) y de likes (0) es muy bajo, lo que sugiere poca validacion por parte de la comunidad en el momento de la consulta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aisingapore/Qwen-SEA-LION-v5-397B-A17B-Plus-NVFP4
- Modelo base (BF16): https://huggingface.co/aisingapore/Qwen-SEA-LION-v5-397B-A17B-Plus
- Version FP8: https://huggingface.co/aisingapore/Qwen-SEA-LION-v5-397B-A17B-Plus-FP8
- Version GGUF: https://huggingface.co/aisingapore/Qwen-SEA-LION-v5-397B-A17B-Plus-GGUF
- Coleccion SEA-LION v5: https://huggingface.co/collections/aisingapore/sea-lion-v5-6afab40ea2b5b627e9930703
- Sitio de SEA-LION: https://sea-lion.ai
- NVIDIA Model Optimizer: https://github.com/NVIDIA/Model-Optimizer
- Licencia MIT: https://mit-license.org/
