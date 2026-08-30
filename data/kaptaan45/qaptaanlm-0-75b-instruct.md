# kaptaan45/QaptaanLM-0.75B-Instruct

## Resumen

QaptaanLM-0.75B-Instruct es un modelo de lenguaje compacto de 752 millones de parámetros, desarrollado por el usuario kaptaan45, especializado en generación de código Python, corrección de errores, formulación de consultas SQL y diálogo técnico multi-turno. Se basa en la arquitectura de Qwen3.5-0.8B-Base, a la que se le ha eliminado el componente de visión para quedarse con capacidad exclusivamente textual, y se ha adaptado mediante un esquema híbrido de atención que combina capas lineales DeltaNet con capas de atención completa GQA.

El modelo destaca por su ventana de contexto nativa de 262.144 tokens (256K), algo inusual en modelos de este tamaño, y por su entrenamiento en dos fases: un pre-entrenamiento continuado con el dataset KapCode-1B (que incluye fill-in-the-middle) y un ajuste por supervisión (SFT) con KapInstruct-100M, un dataset de 100 millones de tokens diseñado para alinear modelos de menos de 1B de parámetros. Su licencia Apache 2.0 permite uso comercial sin restricciones, y su tamaño reducido lo hace adecuado para despliegue en entornos con recursos limitados.

Aunque se trata de un modelo reciente con pocas descargas y sin benchmarks publicados, su arquitectura híbrida y su largo contexto lo convierten en una opción interesante para tareas de programación asistida y razonamiento técnico en dispositivos con poca memoria.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 18 capas de atención lineal DeltaNet + 6 capas GQA completas (ratio 3:1), basada en Qwen3.5-0.8B-Base (sin visión) |
| Parametros totales | 752.382.976 (752M) según model card; 752.393.024 según safetensors |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (256K nativo) con M-RoPE (theta = 10.000.000) |
| Tipos de cuantizacion | No disponible (pesos oficiales en bfloat16, float16 y float32; no se publican cuantizaciones GGUF/AWQ) |
| Idiomas soportados | Inglés y código (Python, SQL, etc.) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

QaptaanLM-0.75B-Instruct emplea una arquitectura híbrida de atención que combina 18 capas de atención lineal basadas en DeltaNet con 6 capas de atención completa GQA (Grouped Query Attention), en una proporción 3:1. Esta mezcla busca reducir el coste computacional de la atención en secuencias largas manteniendo la calidad en tareas de razonamiento. El modelo tiene un tamaño oculto de 1024, una dimensión intermedia de 3584 con activación SwiGLU y 24 capas en total. La posición se codifica con M-RoPE (rotary position embedding modificado) con un theta de 10 millones, lo que permite extrapolar a contextos de hasta 256K tokens.

El entrenamiento se realizó en dos fases. Primero, un pre-entrenamiento continuado sobre el modelo base Qwen3.5-0.8B-Base utilizando el dataset KapCode-1B, que incluye tareas de fill-in-the-middle para reforzar la generación de código. Después, un ajuste por supervisión (SFT) con el dataset KapInstruct-100M, un corpus de 100 millones de tokens con formato ChatML de Qwen, diseñado específicamente para alinear modelos de menos de 1B de parámetros en tareas de instrucción y diálogo técnico. No se menciona el uso de RLHF o DPO.

## Capacidades

- Generación de código Python, incluyendo funciones, clases y scripts completos.
- Corrección de errores y depuración de código existente.
- Formulación de consultas SQL a partir de descripciones en lenguaje natural.
- Diálogo técnico multi-turno con formato ChatML (system, user, assistant).
- Razonamiento sobre problemas de programación y algoritmos.
- Soporte de contexto largo (hasta 256K tokens) para procesar repositorios completos o documentación extensa.
- Capacidad de seguir instrucciones detalladas gracias al ajuste SFT.
- No incluye capacidades de visión, audio ni tool calling explícito (no documentado).

## Casos de uso

- Asistente de programación en entornos con recursos limitados: al ser un modelo de 752M, puede ejecutarse en portátiles o servidores sin GPU dedicada, ofreciendo ayuda para escribir y depurar código Python en tiempo real.
- Autocompletado de código en editores: su entrenamiento con fill-in-the-middle y su contexto largo permiten sugerir completados de funciones y bloques de código en IDEs como VS Code o Neovim, incluso con archivos grandes abiertos.
- Generación de consultas SQL para análisis de datos: un analista puede describir en inglés la consulta deseada y el modelo la traduce a SQL, útil en pipelines de datos donde se necesita automatizar la generación de informes.
- Tutoría de programación: el modelo puede explicar conceptos, revisar soluciones y responder preguntas técnicas en un diálogo multi-turno, sirviendo como asistente educativo para estudiantes.
- Análisis de logs y depuración: gracias a su ventana de 256K tokens, puede procesar archivos de log extensos y ayudar a identificar errores o patrones anómalos en aplicaciones.
- Integración en pipelines de CI/CD: el modelo puede generar tests unitarios, documentación de código o parches de corrección a partir de descripciones de issues, integrándose como paso automático en flujos de integración continua.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este modelo.

## Requisitos de hardware

- El modelo pesa aproximadamente 1,5 GB en bfloat16 (752M parámetros), por lo que requiere al menos 2 GB de VRAM para inferencia en GPU, o unos 4 GB de RAM para CPU.
- Cabe en GPUs consumer como NVIDIA RTX 3060 (12 GB), RTX 4060 (8 GB) o incluso en tarjetas con 4 GB de VRAM si se usa cuantización (aunque no se ofrecen cuantizaciones oficiales).
- En CPU, puede ejecutarse con llama.cpp o transformers, aunque la latencia será mayor; se recomienda al menos 8 GB de RAM.
- Opciones de despliegue: transformers (con trust_remote_code=True), vLLM (si se adapta), llama.cpp (si se convierte a GGUF), o servidores de inferencia como TGI.
- No se dispone de datos de latencia o throughput medidos; al ser un modelo pequeño, se espera una generación rápida en hardware moderno, pero no hay cifras oficiales.

## Comparativa con modelos similares

No se dispone de benchmarks comparativos, pero se puede comparar estructuralmente con otros modelos compactos de la misma categoría:

| Modelo | Parámetros | Contexto | Arquitectura | Licencia |
|---|---|---|---|---|
| QaptaanLM-0.75B-Instruct | 752M | 256K | Híbrida DeltaNet + GQA | Apache 2.0 |
| Qwen2.5-0.5B-Instruct | 494M | 32K | Transformer denso | Apache 2.0 |
| TinyLlama-1.1B-Chat | 1.1B | 2K | Transformer denso | Apache 2.0 |
| SmolLM-1.7B-Instruct | 1.7B | 8K | Transformer denso | Apache 2.0 |

La principal diferencia de QaptaanLM es su contexto nativo de 256K, muy superior al de sus competidores directos, y su arquitectura híbrida que reduce el coste de atención en secuencias largas. Sin embargo, al no haber benchmarks publicados, no es posible comparar su rendimiento real en tareas de código o razonamiento.

## Limitaciones y advertencias

- Modelo de tamaño pequeño (752M), por lo que puede presentar alucinaciones o errores en tareas complejas de razonamiento o generación de código extenso.
- Solo soporta inglés y código; no es multilingüe, lo que limita su uso en otros idiomas.
- No se han publicado cuantizaciones oficiales (GGUF, AWQ, GPTQ), por lo que el despliegue en hardware muy limitado puede requerir conversión manual.
- El modelo es muy reciente (creado en agosto de 2026) y tiene cero descargas y cero likes en HuggingFace, lo que indica que no ha sido validado por la comunidad ni probado en producción.
- Aunque la licencia Apache 2.0 permite uso comercial, el autor no proporciona garantías ni soporte.
- La ventana de contexto de 256K es teórica; en la práctica, el rendimiento en secuencias muy largas puede degradarse, especialmente en tareas que requieren atención precisa sobre detalles lejanos.
- No se documenta soporte para tool calling, funciones externas ni modos de razonamiento especiales (thinking mode).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kaptaan45/QaptaanLM-0.75B-Instruct
- Modelo base: https://huggingface.co/kaptaan45/QaptaanLM-0.75B
- Dataset de SFT: https://huggingface.co/datasets/kaptaan45/KapInstruct-100M
- Dataset de pre-entrenamiento: https://huggingface.co/datasets/kaptaan45/KapCode-1B
- Repositorio GitHub: https://github.com/rudy-07/QaptaanLM-0.75B
- Modelo en Kaggle: https://www.kaggle.com/models/kaptaan45/qaptaanlm-0.75b
