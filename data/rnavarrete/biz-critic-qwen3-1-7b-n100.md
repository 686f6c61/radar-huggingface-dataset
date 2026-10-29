# rNavarrete/biz-critic-qwen3-1.7b-n100

## Resumen

`rNavarrete/biz-critic-qwen3-1.7b-n100` es un ajuste fino (fine-tuning) del modelo denso Qwen3-1.7B de Alibaba Cloud, publicado por el usuario rNavarrete en Hugging Face. El nombre del repositorio sugiere una especialización como "crítico de negocios" (biz-critic) y el sufijo `n100` apunta a un conjunto de entrenamiento de aproximadamente 100 ejemplos, aunque la model card no documenta ni el dataset ni la metodología, por lo que ambos extremos deben considerarse inferencias a partir del identificador y no hechos confirmados.

El modelo base Qwen3-1.7B es un transformer decoder-only denso de 1.700 millones de parámetros con modo dual thinking/non-thinking, 32.768 tokens de contexto nativo y licencia Apache 2.0. El ajuste se realizó con Unsloth sobre la variante cuantizada a 4 bits (`unsloth/Qwen3-1.7B-unsloth-bnb-4bit`), una configuración típica de QLoRA orientada a reducir el coste de entrenamiento (el autor afirma que fue "2x faster" con Unsloth).

Su relevancia práctica es limitada y experimental: es un modelo de 0,1 GB de tamaño de repositorio, sin descargas ni valoraciones, sin pipeline declarado y sin resultados de evaluación publicados. Resulta útil como ejemplo de flujo de trabajo de fine-tuning ligero con Unsloth sobre Qwen3 y como posible prototipo de asistente de crítica de propuestas comerciales, pero no está validado para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada de Qwen3-1.7B) |
| Parametros totales | 1.700 millones (1,7B) en el modelo base; el adaptador publicado no declara recuento propio |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 32.768 tokens nativos en el modelo base; no se especifica si el fine-tuning preserva la extensión vía YaRN |
| Tipos de cuantizacion | Entrenamiento sobre base 4-bit (bitsandbytes NF4/QLoRA); el repositorio no publica GGUF ni otras variantes cuantizadas |
| Idiomas soportados | `en` declarado en la model card; el modelo base Qwen3 es multilingüe (el fine-tuning puede haber reducido el rendimiento en otros idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `transformers`) |
| Modelo base | `unsloth/Qwen3-1.7B-unsloth-bnb-4bit` |
| Metodo de ajuste | Fine-tuning con Unsloth (previsiblemente LoRA/QLoRA, no confirmado en la model card) |
| Tamano del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 |
| Fecha de publicacion | 2026-10-29 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-1.7B: un transformer decoder-only denso con atención por grupos (GQA en el modelo base), activación SwiGLU y normalización RMSNorm, que incorpora un modo de razonamiento explícito ("thinking") y un modo directo ("non-thinking") seleccionable. Sobre esa base, el autor aplicó un fine-tuning supervisado con la librería Unsloth, que implementa kernels optimizados para reducir memoria y tiempo de entrenamiento; el autor afirma un entrenamiento "2x faster" respecto a una implementación convencional, pero no aporta detalles de hardware, duración ni hiperparámetros.

No hay información publicada sobre el dataset de ajuste: se desconoce el número exacto de ejemplos (el sufijo `n100` sugiere 100), su composición, si hubo RLHF/DPO, ni si se aplicó alguna técnica adicional como decodificación especulativa o atención lineal. Tampoco se documenta el rango LoRA, la tasa de aprendizaje, el número de épocas ni el porcentaje de tokens enmascarados. El repositorio contiene únicamente 0,1 GB de safetensors, magnitud compatible con un adaptador LoRA (y no con pesos completos en fp16/bf16, que rondarían los 3,4 GB), por lo que es probable que la carga requiera fusionar el adaptador con el modelo base antes de la inferencia.

## Capacidades

- Generación de texto en inglés y, presumiblemente, capacidad multilingüe residual heredada de Qwen3 (no verificada tras el ajuste).
- Razonamiento en dos modos: cadena de pensamiento explícita (thinking) y respuesta directa (non-thinking), heredados del modelo base.
- Generación de código y resolución de problemas matemáticos a nivel de modelo pequeño (1,7B), sin métricas publicadas para esta variante.
- Capacidad esperada de crítica y revisión de textos de negocio (planes, propuestas, argumentarios), coherente con el nombre `biz-critic`, aunque no documentada por el autor.
- Soporte de tool calling / function calling: disponible en la familia Qwen3 según el modelo base, pero no verificado ni declarado en esta ficha.
- Capacidades de agente multi-paso: teóricamente posibles con el modo thinking, sin evaluación publicada.
- No se declaran capacidades de visión, audio ni multimodalidad.

## Casos de uso

- Revisión de planes de negocio: el modelo puede recibir un borrador de plan y devolver una crítica estructurada (fortalezas, debilidades, riesgos, preguntas abiertas), gracias a su ventana de 32K tokens que permite introducir documentos extensos en una sola pasada.
- Evaluación de pitches y propuestas comerciales: uso como revisor automático en un pipeline interno que puntúa coherencia, claridad y consistencia financiera de documentos antes de que lleguen a un comité de inversión.
- Generación de contraargumentos en simulación de ventas: integrado en una herramienta de formación que plantea objeciones a un comercial a partir de la propuesta presentada, aprovechando el modo thinking para razonar sobre el contexto acumulado.
- Análisis crítico de reseñas y feedback de clientes: procesamiento por lotes de opiniones para extraer patrones de insatisfacción y sugerir respuestas, con coste de inferencia muy bajo por su tamaño.
- Prototipado rápido de asistentes especializados: servir como línea base para comparar con otros fine-tunes del mismo autor (existe una variante `v2`) antes de invertir en un modelo mayor.
- Clasificación y etiquetado de textos de negocio: al ser un modelo pequeño, puede desplegarse en CPU o GPU de gama baja para tareas de etiquetado semántico a gran escala con latencia reducida.
- Docencia y experimentación: ejemplo reproducible de fine-tuning con Unsloth sobre Qwen3-1.7B para cursos o talleres de ajuste de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de ningún tipo (MMLU, HumanEval, GSM8K, MT-Bench u otras), ni el autor documenta una evaluación cualitativa del ajuste.

| Benchmark | Este modelo | Qwen3-1.7B (base) | Alternativas |
|---|---|---|---|
| MMLU | No disponible | No disponible en la informacion proporcionada | No disponible |
| HumanEval | No disponible | No disponible en la informacion proporcionada | No disponible |
| GSM8K | No disponible | No disponible en la informacion proporcionada | No disponible |
| Evaluacion cualitativa del ajuste | No disponible | No aplica | No disponible |

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: unos 3,4 GB solo para pesos, más 1-2 GB de caché KV con contextos largos; en la práctica, 6-8 GB cubren uso con contexto moderado.
- VRAM estimada en 4 bits (GGUF Q4_K_M): aproximadamente 1,1-1,3 GB de pesos, ejecutable en GPUs de 4 GB o incluso en CPU con llama.cpp.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti, RTX 4090 o L4 para despliegues con concurrencia; A100/H100 no son necesarias por el tamaño del modelo.
- Cabe holgadamente en GPU de consumo: sí, desde una GTX 1650 4 GB (4 bits) hasta cualquier RTX de 8 GB o más en fp16.
- Opciones de despliegue: vLLM (soporta Qwen3), TGI (el repo incluye el tag `text-generation-inference`), llama.cpp/Ollama (la familia `qwen3:1.7b` está disponible en el registro de Ollama para el modelo base), transformers + PEFT para cargar el adaptador.
- Latencia y throughput estimados: no disponibles; para un modelo denso de 1,7B en una RTX 4090 se pueden esperar cientos de tokens por segundo en batching, pero no hay mediciones publicadas para esta variante.
- Nota operativa: el repositorio pesa 0,1 GB, por lo que es probable que sea necesario descargar el modelo base y cargar el adaptador (o fusionarlo) antes de servirlo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Disponibilidad |
|---|---|---|---|---|---|
| biz-critic-qwen3-1.7b-n100 | 1,7B (adaptador) | 32K (heredado) | Apache 2.0 | en declarado | Hugging Face, 0 descargas |
| Qwen3-1.7B (base) | 1,7B | 32K nativo | Apache 2.0 | Multilingue | Hugging Face, Ollama, Qualcomm AI Hub |
| Gemma 3 1B | 1B | 32K | Gemma Terms of Use | Multilingue | Hugging Face, Ollama |
| Llama 3.2 1B | 1,23B | 128K | Llama 3.2 Community License | Multilingue | Hugging Face, Ollama |

Los datos de las alternativas provienen de sus fichas públicas y no han sido verificados en la búsqueda realizada para esta ficha; se incluyen como referencia orientativa. En igualdad de tamaño, el modelo base Qwen3-1.7B es preferible a este fine-tune para uso general, ya que cuenta con evaluación y soporte de la comunidad, mientras que el presente repositorio no aporta métricas que justifiquen la sustitución salvo en la tarea concreta para la que fue ajustado.

## Limitaciones y advertencias

- Ausencia total de documentación: no se describe el dataset, los hiperparámetros, el número exacto de ejemplos ni el proceso de evaluación, lo que impide reproducir el ajuste.
- Riesgo elevado de sobreajuste: si el entrenamiento se hizo con ~100 ejemplos, es esperable un ajuste muy estrecho a ese dominio y una degradación de capacidades generales (olvido catastrófico), incluyendo el multilingüismo del modelo base.
- Alucinación: como todo modelo de 1,7B sin RLHF documentado, la tasa de invención de hechos es alta, especialmente en el modo non-thinking y en contextos largos.
- Sesgos: no se ha realizado ninguna evaluación de sesgos; el dataset de ajuste, desconocido, puede introducir sesgos específicos de dominio (por ejemplo, sesgos culturales o de sector empresarial).
- Idioma: la model card declara únicamente inglés; el rendimiento en castellano no está garantizado y probablemente sea inferior al del modelo base.
- Licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene conservar la atribución y revisar también las condiciones del modelo base.
- Producción: con 0 descargas, 0 likes y sin pipeline declarado, el repositorio no tiene validación comunitaria; no se recomienda su uso en sistemas en producción sin una evaluación propia.
- Empaquetado: el tamaño de 0,1 GB sugiere un adaptador LoRA en lugar de pesos completos; verificar el procedimiento de carga antes de integrarlo en un servicio.
- Existe una variante posterior (`v2-n100`) del mismo autor, lo que indica que esta versión puede estar obsoleta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rNavarrete/biz-critic-qwen3-1.7b-n100
- Variante v2 del mismo autor: https://huggingface.co/rNavarrete/biz-critic-qwen3-1.7b-v2-n100
- Modelo base en Hugging Face: https://huggingface.co/unsloth/Qwen3-1.7B-unsloth-bnb-4bit
- Qwen3-1.7B oficial: https://huggingface.co/Qwen/Qwen3-1.7B
- Qwen3-1.7B en Ollama: https://ollama.com/library/qwen3:1.7b
- Qwen3-1.7B en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_1_7b
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Analisis de benchmarks y despliegue movil de Qwen3-1.7B (blog de terceros, no verificado): https://tokenmix.ai/blog/qwen3-1-7b-tiny-model-benchmarks-mobile-2026
