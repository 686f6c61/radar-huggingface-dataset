# LuffyTheFox/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V7-GGUF

## Resumen

El modelo Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V7-GGUF es una variante del Qwen3.6 de 35 mil millones de parámetros con arquitectura de mezcla de expertos (MoE) y solo 3 mil millones de parámetros activos por token. Ha sido desarrollado por LuffyTheFox sobre la base HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive, aplicando la técnica propietaria Genesis, un algoritmo de regeneración y calibración de datos post-entrenamiento para LLMs en formato GGUF que repara numéricamente tensores corruptos y reduce el ruido interno del modelo. El resultado es un modelo que, según su autor, mejora la claridad del habla, el seguimiento de instrucciones y la retención de contexto.

La variante Hermes V7 incorpora el dataset NousResearch/hermes-function-calling-v1, lo que le confiere capacidades de llamada a funciones y orientación agéntica. Se distribuye exclusivamente en formato GGUF, pensado para inferencia local con runtimes como llama.cpp u Ollama. Es un modelo multimodal (image-text-to-text), sin censura, y soporta múltiples idiomas, principalmente inglés y chino. Con más de 615.000 descargas y 486 likes en HuggingFace, se ha convertido en una opción popular para usuarios que buscan un modelo local potente, sin restricciones y con capacidades de agente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) con 256 expertos: 8 enrutados + 1 compartido por token |
| Parametros totales | 35 mil millones (35B) |
| Parametros activos | 3 mil millones (A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (varias cuantizaciones, no especificadas en la ficha) |
| Idiomas soportados | inglés, chino, multilingüe (según tags; el campo de HuggingFace indica "no disponibles") |
| Licencia | Apache 2.0 (según tags; el campo de licencia en HuggingFace indica "no disponible") |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3.6, que emplea un diseño MoE híbrido con 256 expertos totales, de los cuales 8 se enrutan activamente por token junto con un experto compartido. Esto permite mantener un coste computacional reducido (3B activos) mientras se aprovechan los 35B de parámetros totales para capturar conocimiento diverso.

La innovación principal reside en la técnica Genesis, un algoritmo de post-entrenamiento desarrollado por LuffyTheFox durante aproximadamente seis meses con asistencia de IA. Genesis regenera y calibra los datos del modelo en formato GGUF, reparando tensores corruptos mediante descomposición en valores singulares (SVD) y reduciendo el ruido interno que degrada la coherencia del habla y el seguimiento de instrucciones. Sobre esta base reparada, se ha aplicado un fine-tuning con el dataset Hermes de NousResearch, especializado en function calling, lo que añade capacidades de invocación de herramientas y comportamiento agéntico. El modelo base original, HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive, ya era una variante sin censura, y esta versión conserva esa característica.

## Capacidades

- Generación de texto y conversación multi-turno con contexto largo, gracias a la reparación de tensores que mejora la retención de contexto.
- Razonamiento y seguimiento de instrucciones complejas, con mejoras atribuidas al proceso Genesis.
- Function calling: soporte para invocación de herramientas y APIs, entrenado con el dataset Hermes function-calling-v1.
- Comportamiento agéntico: puede actuar como agente autónomo en tareas multi-paso, encadenando llamadas a funciones.
- Multimodal: pipeline image-text-to-text, capaz de procesar imágenes junto con texto.
- Multilingüe: soporte principal para inglés y chino, con capacidades multilingües adicionales.
- Sin censura: no aplica filtros de contenido, lo que permite generación libre en dominios creativos o de rol.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con memoria de contexto, integrando function calling para consultar bases de datos de pedidos o emitir reembolsos mediante APIs.
- Generación de código en producción: con soporte de tool calling, puede integrarse en pipelines de CI/CD para autocompletar, revisar o generar código, aunque su naturaleza sin censura requiere supervisión humana.
- Agentes autónomos de investigación: puede encadenar búsquedas web, consultas a APIs y resúmenes para completar tareas de investigación multi-paso.
- Análisis de imágenes con texto: al ser multimodal, puede describir imágenes, extraer información visual y combinarla con instrucciones textuales en un solo flujo.
- Roleplay y escritura creativa sin restricciones: su carácter uncensored lo hace adecuado para narrativa adulta, juegos de rol o generación de contenido creativo que otros modelos rechazarían.
- Asistente local privado: al ejecutarse en GGUF con llama.cpp u Ollama, permite desplegar un asistente personal sin conexión, con control total sobre los datos y sin dependencia de servicios en la nube.
- Traducción y procesamiento multilingüe: soporta inglés y chino, útil para equipos que trabajan con ambos idiomas en entornos locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos objetivos de MMLU, HumanEval, GSM8K u otras pruebas estandarizadas para esta variante específica. El autor menciona mejoras cualitativas en claridad del habla y seguimiento de instrucciones, pero no aporta métricas cuantitativas verificables.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un MoE de 35B con 3B activos, el requisito de VRAM depende de la cuantización GGUF elegida. Para una cuantización Q4_K_M, el archivo ocupará aproximadamente 20-22 GB, por lo que se necesita una GPU con al menos 24 GB de VRAM (por ejemplo, RTX 3090, RTX 4090) para ejecutarlo cómodamente. Cuantizaciones más agresivas (Q3, Q2) pueden reducir el uso a 15-18 GB, pero degradan la calidad.
- GPU recomendadas: RTX 3090, RTX 4090, A100 40GB, H100, o cualquier GPU con 24 GB o más de VRAM. Para cuantizaciones ligeras, una RTX 4080 de 16 GB podría ser insuficiente; se recomienda verificar el tamaño exacto del archivo GGUF.
- Compatibilidad con GPU de consumo: sí, en cuantizaciones Q4 o inferiores cabe en GPUs de gama alta de consumo (24 GB). No es viable en GPUs de 8-12 GB salvo con cuantizaciones extremas que comprometan seriamente la calidad.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp, o cualquier runtime compatible con GGUF. También puede servirse mediante servidores compatibles con la API de OpenAI usando proyectos como llama.cpp server o LocalAI.
- Latencia y throughput: no se han publicado datos específicos. Como referencia, un MoE de 3B activos en una RTX 4090 con cuantización Q4 puede alcanzar velocidades de 30-50 tokens por segundo, pero esto depende de la implementación y del tamaño del contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Qwen3.6-35B-A3B (base) | 35B | 3B | no disponible | Apache 2.0 | safetensors | Modelo original sin reparación Genesis |
| Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V7 (este) | 35B | 3B | no disponible | Apache 2.0 | GGUF | Reparado con Genesis, fine-tuning Hermes, sin censura |
| DeepSeek-V3 (MoE 671B) | 671B | 37B | 128K | MIT | safetensors | Mucho mayor, requiere hardware de datacenter |
| Mixtral 8x7B | 46.7B | 12.9B | 32K | Apache 2.0 | safetensors/GGUF | MoE consolidado, sin capacidades multimodales |

La comparativa directa con el Qwen3.6 base muestra que esta variante añade la reparación Genesis y el fine-tuning Hermes, pero no hay benchmarks que demuestren una mejora cuantitativa. Frente a Mixtral 8x7B, este modelo ofrece multimodalidad y un menor número de parámetros activos, lo que lo hace más eficiente en inferencia, aunque Mixtral tiene una comunidad más madura y más documentación de despliegue.

## Limitaciones y advertencias

- Naturaleza sin censura: el modelo no aplica filtros de contenido, por lo que puede generar texto ofensivo, sexualmente explícito, violento o ilegal. No es adecuado para aplicaciones comerciales orientadas al público general sin una capa de moderación externa.
- Riesgo de alucinación: al ser un modelo reparado y fine-tuneado, no hay garantías de veracidad factual. Puede inventar datos, citas o referencias con alta confianza.
- Longitud de contexto no documentada: no se ha especificado la ventana de contexto máxima, lo que dificulta planificar su uso en tareas que requieran documentos largos.
- Licencia ambigua: aunque los tags indican Apache 2.0, el campo de licencia en HuggingFace aparece como "no disponible". Se recomienda verificar la licencia del modelo base original antes de un uso comercial.
- Calidad no verificada: la técnica Genesis es propietaria y no ha sido validada por la comunidad académica. Las mejoras declaradas son subjetivas y no están respaldadas por benchmarks públicos.
- Dependencia del modelo base: al derivar de una variante "aggressive" sin censura, puede heredar sesgos o comportamientos indeseables del modelo original.
- Formato GGUF limitado: al distribuirse solo en GGUF, no es directamente utilizable con frameworks como vLLM o TensorRT-LLM sin conversión previa, lo que limita su despliegue en entornos de producción de alto rendimiento.

## Enlaces

- [HuggingFace: LuffyTheFox/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V7-GGUF](https://huggingface.co/LuffyTheFox/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V7-GGUF)
- [HuggingFace: LuffyTheFox/Qwen3.6-35B-A3B-Uncensored-Genesis-GGUF](https://huggingface.co/LuffyTheFox/Qwen3.6-35B-A3B-Uncensored-Genesis-GGUF)
- [Ficha en aiany.app de la versión V5](https://aiany.app/item/luffythefox-qwen3-6-35b-a3b-uncensored-genesis-hermes-v5-gguf)
- [Espejo en ai.atomgit.com de la versión V6](https://ai.atomgit.com/hf_mirrors/LuffyTheFox/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V6-GGUF)
- [Ficha en aimodels.fyi de la variante Claude-Genesis](https://www.aimodels.fyi/models/huggingFace/qwen3.6-35b-a3b-uncensored-claude-genesis-gguf-luffythefox)
