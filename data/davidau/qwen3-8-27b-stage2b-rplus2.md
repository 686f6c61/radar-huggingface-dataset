# DavidAU/Qwen3.8-27B-stage2b-rplus2

## Resumen

DavidAU/Qwen3.8-27B-stage2b-rplus2 es un fine-tune de la serie Qwen3.8-27B, desarrollado por David Belton (DavidAU), un creador conocido por sus más de 2700 modelos combinados y 600 fine-tunes en HuggingFace. Este modelo concreto forma parte de un pipeline de entrenamiento en múltiples etapas, indicado por el sufijo "stage2b", y se basa en un modelo intermedio denominado "TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU". Está etiquetado como "uncensored" y orientado a casos de uso conversacionales y generales, con soporte para entrada de imagen y texto (pipeline image-text-to-text).

El modelo tiene 27.781.427.952 parámetros (aproximadamente 27,8 mil millones), lo que lo sitúa en la gama de modelos densos de tamaño medio-alto. Su licencia es Apache 2.0, aunque el acceso al repositorio está restringido (gated) y requiere aceptar condiciones en HuggingFace. La relevancia de este modelo radica en su enfoque de fine-tuning multi-etapa con técnicas como "Cold Fusion" y "GAIN Training", que buscan mejorar la fiabilidad en tareas complejas de varios pasos, aunque no se dispone de documentación técnica detallada sobre estas técnicas en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3.8-27B, variante vision-language) |
| Parametros totales | 27.781.427.952 (27,8 B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo solo contiene safetensors) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de Qwen3.8-27B, un modelo denso nativo de vision-lenguaje que entiende imagenes y videos, con control flexible de pensamiento (thinking mode). El fine-tune de DavidAU aplica un entrenamiento en multiples etapas (indicado por "stage2b") sobre un modelo intermedio que ya habia pasado por procesos de "Cold Fusion" y "GAIN Training". No se dispone de detalles especificos sobre el dataset de entrenamiento, el numero de tokens, ni si se utilizaron tecnicas de RLHF o DPO. El nombre "Heretic-Uncensored" sugiere un entrenamiento orientado a reducir restricciones de contenido, pero no hay documentacion publica que detalle el proceso.

## Capacidades

- Generacion de texto conversacional y respuestas a instrucciones, con enfasis en casos de uso generales y "all use cases".
- Procesamiento de entrada multimodal (imagen y texto) gracias a la base Qwen3.8-27B, aunque no se confirma si el fine-tune conserva todas las capacidades visuales del modelo base.
- Soporte de tool calling y function calling: heredado del modelo base Qwen3.8, que incluye estas capacidades, aunque no se verifica en el fine-tune.
- Capacidad de razonamiento multi-paso y control de modo de pensamiento (thinking mode) si se mantiene la funcionalidad del base.
- Etiquetado como "uncensored", lo que implica una reduccion de filtros de contenido en comparacion con el modelo original.
- Multilingue limitado: solo se declara ingles en los metadatos, aunque el base Qwen3.8 soporta mas idiomas.

## Casos de uso

- Asistentes conversacionales sin censura: el modelo puede emplearse en chatbots o aplicaciones de rol donde se requiere una generacion de texto sin restricciones tematicas, gracias a su etiqueta "uncensored".
- Automatizacion de tareas de oficina: basandose en las mejoras del modelo base en productividad de oficina, puede redactar correos, resumir documentos o generar informes a partir de entradas de texto e imagen.
- Generacion de codigo asistida: el base Qwen3.8-27B tiene mejoras en codificacion; este fine-tune podria usarse en entornos de desarrollo como autocompletado o generacion de funciones, aunque no hay benchmarks que lo confirmen.
- Analisis de imagenes con texto: al ser image-text-to-text, puede describir imagenes, extraer informacion de capturas o responder preguntas sobre contenido visual.
- Prototipado rapido de agentes: con soporte de tool calling (si se conserva), puede integrarse en pipelines de agentes que llaman APIs o ejecutan acciones.
- Investigacion en fine-tuning: como modelo de la serie "stage2b", es util para estudiar el efecto de entrenamiento multi-etapa y tecnicas como Cold Fusion en modelos de 27B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras metricas para este fine-tune especifico. El modelo base Qwen3.8-27B reporta mejoras en codificacion y productividad de oficina, pero no se pueden atribuir directamente a este checkpoint sin evaluacion propia.

## Requisitos de hardware

- VRAM estimada para inferencia: con 27,8 B parametros en precision FP16, se necesitan aproximadamente 56 GB de VRAM (el repo pesa 55,6 GB). Con cuantizacion a 8 bits se reduce a ~28 GB, y a 4 bits a ~14 GB, aunque no se proporcionan cuantizaciones oficiales.
- GPU recomendadas: para FP16, una A100 80GB o H100; para cuantizacion 8 bits, una RTX 4090 (24 GB) o A6000; para 4 bits, una RTX 3090 o 4090.
- No cabe en GPUs consumer de 16 GB o menos sin cuantizacion agresiva (4 bits o menor).
- Opciones de despliegue: al ser un modelo transformers con safetensors, puede servirse con vLLM, TGI o llama.cpp (si se convierte a GGUF). No hay soporte nativo documentado para Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| DavidAU/Qwen3.8-27B-stage2b-rplus2 | 27,8 B | no disponible | Apache 2.0 | Fine-tune "uncensored" multi-etapa |
| Qwen/Qwen3.8-27B (base) | 27,8 B | no disponible (tipicamente 32k o mas) | Apache 2.0 | Modelo oficial vision-language con thinking mode |
| DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU | 27,8 B | no disponible | Apache 2.0 | Modelo intermedio del que deriva este checkpoint |

No se dispone de datos de rendimiento comparativo entre estos modelos. El base Qwen3.8-27B es la referencia principal, pero el fine-tune puede diferir en comportamiento debido al entrenamiento adicional.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated, por lo que requiere aprobacion de HuggingFace para descargar los pesos.
- Sin documentacion tecnica: no hay paper, card detallada ni informacion sobre el dataset de entrenamiento, lo que dificulta evaluar su robustez y posibles sesgos.
- Etiqueta "uncensored": puede generar contenido ofensivo, ilegal o danino si se usa sin salvaguardas. No se recomienda para aplicaciones publicas sin moderacion.
- Riesgo de alucinacion: al ser un fine-tune sin benchmarks publicados, no se conoce su fiabilidad factual.
- Idioma limitado: solo se declara ingles; el rendimiento en otros idiomas no esta garantizado.
- Compatibilidad multimodal incierta: aunque el pipeline es image-text-to-text, no se confirma que el fine-tune conserve todas las capacidades visuales del base.
- Licencia Apache 2.0 permite uso comercial, pero el acceso gated puede implicar condiciones adicionales no especificadas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/DavidAU/Qwen3.8-27B-stage2b-rplus2
- Perfil del autor DavidAU: https://huggingface.co/DavidAU
- Modelo base intermedio: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Modelo base oficial Qwen3.8-27B (ModelScope): https://www.modelscope.cn/models/Qwen/Qwen3.8-27B/summary
- Qwen3.8-27B en QwenCloud: https://www.qwencloud.com/models/qwen3.8-27b
- Receta vLLM para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
