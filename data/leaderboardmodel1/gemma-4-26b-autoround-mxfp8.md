# LeaderboardModel1/gemma-4-26B-AutoRound-MXFP8

## Resumen

Este modelo es una cuantización **MXFP8** del modelo **google/gemma-4-26B** de Google DeepMind, generada mediante la herramienta **AutoRound** de Intel. El objetivo es reducir el peso en memoria y el ancho de banda necesario para la inferencia, manteniendo un nivel de calidad cercano al modelo original. Está pensado para entornos de producción donde los recursos de GPU son limitados o donde se busca reducir costes de despliegue.

El modelo base, Gemma 4 26B, es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) con 26.000 millones de parámetros totales y 4.000 millones activos por token, con una ventana de contexto de hasta 256.000 tokens y soporte multilingüe en más de 140 idiomas. Esta versión cuantizada conserva la arquitectura original, pero los pesos se almacenan en formato MXFP8 (punto flotante de 8 bits con escala por bloque), lo que reduce el tamaño del modelo de aproximadamente 52 GB (en FP16) a unos 27,9 GB en disco.

La relevancia de este modelo radica en que permite ejecutar un Gemma 4 de 26B en GPUs con menos memoria, como una RTX 4090 (24 GB) o una A100 de 40 GB, sin necesidad de recurrir a cuantizaciones más agresivas que degradan más la calidad. Es una opción intermedia entre el modelo original y versiones de 4 bits.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Mixture-of-Experts (MoE) |
| Parametros totales | 25.805.936.206 (~25,8 B) |
| Parametros activos | no disponible (el modelo base tiene 4 B activos) |
| Longitud de contexto | hasta 256.000 tokens (segun modelo base) |
| Tipos de cuantizacion | MXFP8 (8 bits, escala por bloque) |
| Idiomas soportados | no disponible (el modelo base soporta mas de 140) |
| Licencia | no disponible (se debe seguir la licencia del modelo original) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base, **Gemma 4 26B**, es un transformer con arquitectura MoE: de los 26.000 millones de parámetros, solo 4.000 millones se activan por token, lo que reduce el coste computacional en inferencia. La cuantización MXFP8 se aplica a todos los pesos lineales mediante el método **AutoRound**, que optimiza los valores cuantizados minimizando la pérdida de calidad mediante un proceso de redondeo basado en gradientes. El resultado es un modelo con pesos en punto flotante de 8 bits con escala por bloque, un formato diseñado para aprovechar al máximo el hardware moderno (como las GPUs Hopper o Ada Lovelace) y que ofrece mejor precisión que las cuantizaciones enteras de 8 bits (W8A8) a igual ancho de banda.

No se dispone de información sobre el dataset de entrenamiento de la cuantización ni sobre el proceso de calibración utilizado. La model card indica que se generó con `autoquant-agent`, una herramienta que combina cuantización, evaluación y auto-corrección, pero no se detallan los pasos concretos.

## Capacidades

- Generación de texto conversacional y de larga forma, heredada del modelo base.
- Razonamiento complejo y resolución de problemas matemáticos y lógicos.
- Generación de código en múltiples lenguajes de programación.
- Comprensión multilingüe (el modelo base cubre más de 140 idiomas).
- Manejo de contextos muy largos (hasta 256K tokens), útil para documentos extensos o conversaciones multi-turno.
- No se ha confirmado soporte explícito para tool calling o function calling en esta versión cuantizada, aunque el modelo base podría tenerlo; no hay documentación al respecto.

## Casos de uso

- **Asistentes conversacionales en producción**: el modelo puede gestionar diálogos largos con memoria de hasta 256K tokens, lo que permite mantener el contexto de una conversación durante horas sin perder información relevante. Su tamaño reducido (27,9 GB) permite desplegarlo en una sola GPU de 40 GB o incluso en configuraciones con varias GPUs de 24 GB.
- **Análisis de documentos extensos**: gracias a la ventana de contexto amplia, es adecuado para resumir o extraer información de contratos, informes financieros o artículos científicos de gran longitud, sin necesidad de dividir el texto en fragmentos.
- **Generación de código asistida**: puede integrarse en entornos de desarrollo (IDEs, CLIs) para autocompletar o generar funciones completas. Su capacidad de razonamiento permite abordar tareas de programación complejas, aunque se recomienda validar el código generado.
- **Traducción automática multilingüe**: con soporte para más de 140 idiomas, puede utilizarse como motor de traducción en aplicaciones web o móviles, especialmente en combinaciones de idiomas poco comunes.
- **Sistemas de recomendación con razonamiento**: el modelo puede analizar preferencias de usuario y generar explicaciones detalladas de sus recomendaciones, algo útil en plataformas de comercio electrónico o streaming.
- **Prototipado rápido de aplicaciones de IA**: al ser una cuantización ligera, es ideal para entornos de desarrollo donde se necesita iterar rápido sin invertir en hardware de gama alta. Se puede ejecutar en una RTX 4090 (24 GB) con cuantización adicional o en una A100 de 40 GB sin problemas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de evaluación y no se encontraron referencias externas que comparen este modelo cuantizado con el original u otras versiones. Se recomienda realizar una evaluación propia en las tareas objetivo antes de su uso en producción.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el modelo tiene ~25,8 B parámetros en MXFP8, lo que supone aproximadamente 25,8 GB de pesos en memoria. Con overhead de activaciones y KV cache, se recomienda al menos 32 GB de VRAM para una inferencia cómoda con contexto estándar. Para contextos de 256K tokens, la memoria de KV cache puede superar los 20 GB adicionales, por lo que se necesitarían 48 GB o más.
- **GPUs recomendadas**: NVIDIA A100 40 GB, A100 80 GB, H100 80 GB, o configuraciones multi-GPU con RTX 4090 (24 GB) usando tensor parallelism. Una RTX 4090 individual podría ejecutar el modelo con cuantización adicional o con contextos cortos, pero no es lo recomendado.
- **Opciones de despliegue**: al estar en formato safetensors, es compatible con frameworks como vLLM, Hugging Face Transformers, TGI (Text Generation Inference) y llama.cpp (si se convierte a GGUF). También puede usarse con AutoRound para cargar los pesos cuantizados directamente.
- **Latencia y throughput**: no se dispone de datos medidos. En general, MXFP8 ofrece un rendimiento superior a FP16 en GPUs con soporte nativo para FP8 (como H100 o RTX 4090), pero inferior a cuantizaciones de 4 bits. Se estima una velocidad de generación de entre 20 y 50 tokens por segundo en una A100, dependiendo del contexto y del batch.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| gemma-4-26B-AutoRound-MXFP8 (este) | 25,8 B | 256K | MXFP8 | no disponible | safetensors |
| gemma-4-26B-A4B-it-AutoRound-W4A16-RTN | 25,8 B | 256K | W4A16 (4 bits) | no disponible | safetensors |
| google/gemma-4-26B (original) | 25,8 B | 256K | FP16 | no disponible | safetensors |

La versión W4A16 (4 bits) del mismo autor reduce aún más el tamaño (aproximadamente 14 GB) y permite ejecutar el modelo en GPUs de 16 GB, pero a costa de una mayor pérdida de precisión. El modelo original en FP16 requiere unos 52 GB de memoria, lo que limita su uso a GPUs de 80 GB o configuraciones multi-GPU. Este modelo MXFP8 se sitúa en un punto intermedio: más preciso que 4 bits y más ligero que FP16.

## Limitaciones y advertencias

- **Pérdida de precisión por cuantización**: aunque MXFP8 conserva mejor la calidad que formatos de 4 bits, puede haber degradación en tareas de razonamiento complejo o generación de código muy específico. Se recomienda evaluar en el caso de uso concreto.
- **Licencia no especificada**: la model card indica que se debe seguir la licencia del modelo original (google/gemma-4-26B), pero no se proporciona el texto de la licencia. Es responsabilidad del usuario verificar los términos de uso del modelo base antes de utilizarlo comercialmente.
- **Idiomas no documentados**: aunque el modelo base soporta más de 140 idiomas, no se ha confirmado que la cuantización mantenga el mismo nivel de calidad en todos ellos. Es posible que lenguas con menos representación en el entrenamiento sufran más degradación.
- **Riesgo de alucinaciones**: como cualquier modelo de lenguaje, puede generar información falsa o inventada, especialmente en contextos largos o temas especializados. Se recomienda implementar mecanismos de verificación en aplicaciones críticas.
- **Sin soporte oficial**: el autor es "LeaderboardModel1", un usuario de Hugging Face, no Google. No hay garantía de mantenimiento ni de corrección de errores. El modelo se ofrece "tal cual".

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/LeaderboardModel1/gemma-4-26B-AutoRound-MXFP8)
- [Modelo base google/gemma-4-26B](https://huggingface.co/google/gemma-4-26B)
- [Página oficial de Gemma 4 (Google DeepMind)](https://deepmind.google/models/gemma/gemma-4/)
- [Documentación de Gemma 4 (Google AI for Developers)](https://ai.google.dev/gemma/docs/core/model_card_4)
- [Repositorio de AutoRound (Intel)](https://github.com/intel/auto-round)
- [Versión W4A16 del mismo autor](https://huggingface.co/LeaderboardModel1/gemma-4-26B-A4B-it-AutoRound-W4A16-RTN)
