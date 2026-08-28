# salohcin714/granite-4.2-3b-5bit-awq-mlx

## Resumen

El modelo `salohcin714/granite-4.2-3b-5bit-awq-mlx` es una conversión cuantizada del modelo denso `ibm-granite/granite-4.2-3b` de IBM, adaptado al formato MLX para ejecución eficiente en hardware Apple Silicon. La cuantización aplica una calibración activación-aware (AWQ) de 5 bits con grupo de tamaño 64, lo que reduce el tamaño del modelo manteniendo una calidad cercana al original. El modelo base pertenece a la familia Granite 4.2, que IBM describe como modelos de razonamiento densos con chain-of-thought integrado y modos de pensamiento flexibles.

Este repositorio concreto no añade fine-tuning ni datos de entrenamiento adicionales; se limita a convertir y cuantizar los pesos originales. El resultado es un modelo de 686 millones de parámetros según el archivo safetensors (aunque el modelo base declara 3 mil millones, existe una discrepancia que se detalla en las especificaciones), con soporte multilingüe para 12 idiomas y licencia Apache 2.0. Su relevancia radica en ofrecer una versión ligera y ejecutable en equipos Apple, manteniendo las capacidades de razonamiento y tool calling de la familia Granite 4.2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (post-entrenado sobre Granite 4.1) |
| Parametros totales | 686.369.280 (según safetensors del repo; el modelo base original declara 3B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 5-bit affine quantization (AWQ, group size 64) |
| Idiomas soportados | en, de, es, fr, ja, pt, ar, cs, it, ko, nl, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

El modelo base Granite 4.2 emplea una arquitectura transformer densa de solo decodificador, disponible en tamaños de 3B, 8B y 30B. Según IBM, estos modelos se post-entrenan sobre los modelos base de Granite 4.1, que a su vez fueron pre-entrenados con un enfoque estándar de lenguaje. La familia Granite 4.2 incorpora chain-of-thought (CoT) integrado, modos de pensamiento flexibles y tool calling aumentado con razonamiento. No se dispone de detalles específicos sobre el número de tokens de entrenamiento ni la composición exacta del dataset para este modelo.

La conversión a MLX se realizó con `mlx-lm` 0.31.3, aplicando cuantización de 5 bits con calibración AWQ. Se eliminó el `lm_head.weight` redundante cuando el modelo ata las embeddings de entrada y salida. No se realizó ningún fine-tuning ni se añadieron datos de entrenamiento.

## Capacidades

- Generación de texto en 12 idiomas (incluido español, inglés, alemán, francés, japonés, etc.).
- Razonamiento con chain-of-thought integrado y modos de pensamiento configurables (según las características del modelo base Granite 4.2).
- Tool calling / function calling aumentado con razonamiento, útil para agentes que necesitan ejecutar acciones.
- Soporte para conversaciones multi-turno mediante chat template estándar.
- Capacidad de ejecución en Apple Silicon gracias al formato MLX, con inferencia eficiente en CPU/GPU unificada.
- No se han documentado capacidades de visión, audio u otras modalidades.

## Casos de uso

- Asistentes conversacionales en aplicaciones macOS: el modelo puede integrarse en apps nativas de Apple usando MLX, ofreciendo respuestas contextuales con bajo consumo de recursos.
- Generación de código en entornos de desarrollo local: al soportar tool calling, puede conectarse a APIs o ejecutar comandos en un entorno controlado, útil para autocompletado o asistentes de programación.
- Análisis de documentos multilingües: su soporte para 12 idiomas permite resumir, extraer información o traducir contenido en empresas con operaciones internacionales.
- Agentes de automatización de tareas: gracias al razonamiento CoT y tool calling, puede planificar y ejecutar secuencias de acciones (por ejemplo, gestión de correos o calendarios) en un Mac.
- Prototipado rápido de chatbots: al ser un modelo pequeño y cuantizado, se puede desplegar en un MacBook para pruebas de concepto sin necesidad de infraestructura en la nube.
- Educación y experimentación: investigadores y estudiantes pueden estudiar el comportamiento de modelos de razonamiento en un entorno local, sin costes de GPU en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta conversión cuantizada. La model card del autor advierte explícitamente que los benchmarks publicados por IBM corresponden a los pesos originales y no deben atribuirse a este artefacto cuantizado. Por tanto, no se dispone de datos fiables de MMLU, HumanEval u otras métricas para esta versión.

## Requisitos de hardware

- VRAM estimada: el tamaño del repositorio es de 2,5 GB, pero la memoria necesaria en tiempo de inferencia puede ser algo mayor (típicamente 1,5-2 veces el tamaño del modelo en memoria). Con cuantización de 5 bits, se estima un uso de memoria de alrededor de 2-3 GB, por lo que es ejecutable en Macs con 8 GB de RAM unificada o más.
- GPU recomendadas: cualquier chip Apple Silicon (M1, M2, M3, M4) con al menos 8 GB de memoria unificada. No requiere GPU NVIDIA ni CUDA.
- Compatibilidad con consumer GPU: no aplica, está diseñado específicamente para Apple Silicon.
- Opciones de despliegue: mediante la librería `mlx-lm` (carga y generación), o integrado en aplicaciones que usen el ecosistema MLX. También puede ejecutarse con `llama.cpp` si se convierte a GGUF, aunque el formato nativo es MLX.
- Latencia y throughput: no se han publicado mediciones específicas. En un MacBook Pro con chip M2, un modelo de 3B cuantizado suele generar entre 20 y 40 tokens por segundo, dependiendo de la longitud de la secuencia y la configuración.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| salohcin714/granite-4.2-3b-5bit-awq-mlx | 686M (repo) / 3B (base) | no disponible | Apache 2.0 | MLX | Cuantizado 5-bit AWQ, para Apple Silicon |
| ibm-granite/granite-4.2-3b | 3B | no disponible | Apache 2.0 | safetensors (original) | Modelo base sin cuantizar |
| salohcin714/granite-4.1-8b-5bit-awq-mlx | 8B (base) | no disponible | Apache 2.0 | MLX | Versión 8B del mismo autor, también cuantizada |

La comparativa directa con otros modelos de 3B (como Llama 3.2 3B o Phi-3.5 mini) no está disponible en la información proporcionada. Se recomienda consultar los benchmarks oficiales de IBM para la familia Granite 4.2, aunque no son directamente aplicables a esta conversión cuantizada.

## Limitaciones y advertencias

- El número de parámetros reportado en el archivo safetensors (686M) difiere significativamente del tamaño declarado del modelo base (3B). Esto podría deberse a un error en la subida o a una conversión incompleta; se recomienda verificar la integridad del modelo antes de usarlo en producción.
- Al ser una cuantización de 5 bits, es posible una degradación leve en la calidad de generación en comparación con el modelo original de 16 bits.
- El autor declara que el repositorio no está afiliado ni respaldado por IBM; los benchmarks oficiales de IBM no aplican a este artefacto.
- No se ha verificado el comportamiento en tareas de razonamiento complejo ni en tool calling; se recomienda probar en el caso de uso concreto.
- La longitud de contexto no está documentada; se desconoce si el modelo soporta ventanas largas (por ejemplo, 128k tokens) o solo las estándar de 4k-8k.
- Licencia Apache 2.0 permite uso comercial, pero se debe mantener la atribución original y el aviso de licencia.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/salohcin714/granite-4.2-3b-5bit-awq-mlx
- Modelo base original: https://huggingface.co/ibm-granite/granite-4.2-3b
- Repositorio GitHub de Granite 4.2: https://github.com/ibm-granite/granite-4.2-language-models
- Documentación oficial de IBM Granite 4.2: https://www.ibm.com/granite/docs/models/granite4-2
- Página general de IBM Granite: https://www.ibm.com/granite
- Librería mlx-lm: https://github.com/ml-explore/mlx-lm
