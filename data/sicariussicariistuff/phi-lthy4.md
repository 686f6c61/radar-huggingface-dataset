# SicariusSicariiStuff/Phi-lthy4

## Resumen

Phi-lthy4 es un modelo de lenguaje experimental derivado de microsoft/phi-4, desarrollado por el usuario independiente SicariusSicariiStuff. Se trata de un ejercicio de "cirugía de modelo" en el que, partiendo de los 14.700 millones de parámetros de Phi-4, se podaron ocho capas completas mediante mergekit, reduciendo el total a 11.933.127.680 parámetros, y se sometió al modelo resultante a un proceso de preentrenamiento continuado (CPT) y ajuste supervisado (SFT) orientado a roleplay y conversación creativa, con aproximadamente 1.000 millones de tokens procesados según el autor.

El objetivo declarado no es mejorar las capacidades de razonamiento o matemáticas del modelo base, sino demostrar que es posible reconvertir un modelo densamente entrenado en datos sintéticos y orientado a tareas de asistente en un modelo conversacional con un estilo marcadamente distinto, sin apenas restricciones de contenido. El autor lo presenta explícitamente como una prueba de concepto sobre la viabilidad de remodelar cualquier modelo a cualquier tamaño o comportamiento con recursos modestos (dos GPU A6000).

Es relevante ahora por dos motivos: por un lado, ilustra técnicas de poda y fusión de modelos aplicadas a un transformer denso moderno; por otro, el propio autor cita un artículo académico de fingerprinting de modelos (arXiv 2506.01631) en el que Phi-lthy4 quedó clasificado como "inclasificable" por las técnicas habituales de detección de similitud arquitectónica, lo que lo convierte en un caso de estudio sobre hasta qué punto una modificación estructural profunda altera la huella de un modelo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Phi-4, con 8 capas podadas) |
| Parámetros totales | 11.933.127.680 |
| Parámetros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 16.384 tokens (16k, según el autor) |
| Tipos de cuantización | no disponible en la información proporcionada (el autor menciona una sección de cuantizaciones en la model card, pero no se detallan los formatos) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (también etiquetado como llama en Hugging Face) |

## Arquitectura y entrenamiento

El modelo parte de microsoft/phi-4, un transformer denso de aproximadamente 14.700 millones de parámetros con atención estándar y contexto nativo de 16k tokens. Sobre esa base, el autor aplicó mergekit para eliminar ocho capas completas, presumiblemente las asociadas a capacidades matemáticas, y fusionó el resultado con modelos no relacionados. El proceso se describe como una "rearquitectura de capas completa", no un simple fine-tuning, lo que explica que las técnicas de fingerprinting basadas en arquitectura no lo clasifiquen dentro de la familia Phi.

El entrenamiento consistió en una fase de preentrenamiento continuado (CPT) seguida de ajuste supervisado (SFT) sobre lo que el autor describe como datasets orgánicos de alta calidad, con un total aproximado de 1.000 millones de tokens y una duración de unas dos semanas en dos GPU NVIDIA A6000. No se documentan detalles sobre composición exacta del dataset, uso de RLHF o DPO, hiperparámetros ni metodología de evaluación. El autor reconoce que no llevó un registro preciso del volumen de entrenamiento. La innovación técnica principal es, por tanto, la combinación de poda agresiva de capas, fusión con modelos ajenos y CPT sobre un modelo base entrenado mayoritariamente con datos sintéticos.

## Capacidades

- Generación de texto conversacional y creativo, con especial énfasis en roleplay y narrativa interactiva.
- Estilo de escritura descrito por el autor como "casi devoid of SLOP", es decir, con menor tendencia a las fórmulas repetitivas típicas de modelos ajustados con datos sintéticos.
- Reducción significativa de los filtros de contenido respecto al Phi-4 original; el autor indica que el modelo es "Phi-lthy" en lo relativo a censura.
- Capacidad matemática residual: el autor afirma que "probablemente aún podría resolver una pregunta matemática básica", pero recomienda usar una calculadora.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Roleplay y ficción interactiva: el modelo está específicamente ajustado para mantener personajes coherentes en conversaciones multi-turno dentro de su ventana de 16k tokens, con un estilo narrativo menos formulaico que el de modelos ajustados con datos sintéticos.
- Generación creativa de narrativa: escritura de relatos, diálogos y guiones donde se prioriza la variedad estilística y la ausencia de muletillas repetitivas.
- Prototipado de personajes conversacionales: desarrollo de bots de entretenimiento o videojuegos con personalidades marcadas, aprovechando que el modelo no aplica los filtros habituales del Phi-4 original.
- Investigación sobre poda y fusión de modelos: sirve como caso de estudio reproducible para estudiar cómo afecta la eliminación de capas a las capacidades de un transformer denso y cómo varía su huella arquitectónica.
- Investigación sobre fingerprinting de LLM: útil como ejemplo negativo en trabajos de clasificación de familias de modelos, dado que el artículo citado por el autor lo identifica como inclasificable.
- Experimentación con CPT sobre modelos base: referencia práctica para quienes quieran adaptar un modelo denso de ~12B a un dominio o estilo concreto con recursos de dos A6000.
- Generación de diálogo sin restricciones para análisis de seguridad: permite estudiar el comportamiento de un modelo sin alineamiento en entornos controlados de evaluación de riesgos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no proporciona cifras de MMLU, HumanEval, GSM8K ni de evaluaciones de roleplay, y descarta explícitamente el enfoque "benchmaxxed". La única referencia externa es el artículo *Gradient-Based Model Fingerprinting for LLM Similarity Detection and Family Classification* (arXiv 2506.01631), que según el autor clasifica a Phi-lthy4 como no clasificable por fingerprinting arquitectónico, sin que se detallen métricas concretas en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 24 GB para los 11,93B parámetros, más overhead de contexto; en la práctica, unos 26-30 GB con ventana completa de 16k.
- VRAM estimada en cuantización de 8 bits: en torno a 12-14 GB.
- VRAM estimada en cuantización de 4 bits: en torno a 7-9 GB, lo que permitiría ejecución en GPU de consumo con 12 GB o más.
- GPU recomendadas: A100 40/80 GB, H100, L40S o A6000 para FP16 con contexto largo; RTX 4090 (24 GB) para FP16 ajustado o cuantización de 8 bits; RTX 3090/4080 para cuantizaciones de 4-8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090 con cuantización de 8 bits o inferior, y en GPUs de 12-16 GB con cuantización de 4 bits.
- Opciones de despliegue: llama.cpp, Ollama, vLLM y TGI son compatibles con pesos safetensors de arquitectura Llama/Phi; el autor menciona disponibilidad de cuantizaciones en la model card, aunque no se detallan los formatos exactos.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Phi-lthy4 | 11,93B | 16k | MIT | Roleplay sin filtros, experimental | Hugging Face (SicariusSicariiStuff) |
| microsoft/phi-4 | ~14,7B | 16k | MIT | Razonamiento, matemáticas, código | Hugging Face (Microsoft) |
| microsoft/phi-4-mini | ~3,8B | 128k | MIT | Asistente generalista ligero | Hugging Face (Microsoft) |
| Modelos RP de 12-13B (p. ej. variantes de Mistral/Mytho) | ~12-13B | 8k-32k | Apache 2.0 / otras | Roleplay y narrativa | Hugging Face |

La comparación con Phi-4 es la más directa: Phi-lthy4 sacrifica parte de la capacidad matemática y de razonamiento del original a cambio de un estilo conversacional más libre y menos filtrado. Frente a phi-4-mini, la diferencia principal es el tamaño y el contexto (16k frente a 128k). Frente a los modelos de roleplay basados en Mistral, Phi-lthy4 ofrece una arquitectura distinta y una licencia MIT, pero con un contexto más corto y sin el ecosistema de fine-tunes que rodea a la familia Mistral. No se dispone de datos de rendimiento comparativos en la información proporcionada.

## Limitaciones y advertencias

- Capacidad matemática y de razonamiento degradada de forma deliberada: el autor eliminó capas asociadas a estas tareas y recomienda usar una calculadora para operaciones básicas.
- Contexto limitado a 16k tokens, insuficiente para tareas de documentación larga o agentes con memoria extensa.
- Solo soporta inglés; no hay evidencia de capacidades multilingües.
- Modelo sin alineamiento de seguridad: el autor indica explícitamente que la censura es mínima, lo que implica riesgo de generar contenido inapropiado, ofensivo o dañino sin filtros.
- Riesgo elevado de alucinación: al ser un modelo derivado con poda y CPT sobre datos posiblemente sintéticos, la fiabilidad factual no está garantizada ni evaluada.
- Entrenamiento no documentado en detalle: sin información sobre composición del dataset, hiperparámetros ni metodología de evaluación, lo que dificulta la reproducibilidad.
- Sesgos desconocidos: no se han publicado análisis de sesgos.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías sobre el comportamiento del modelo en producción.
- Advertencia de uso: la model card incluye un tono provocador y contenido para adultos; no es adecuado para entornos profesionales sin moderación adicional.
- El artículo de fingerprinting citado sugiere que el modelo se desvía estructuralmente de su familia, lo que puede complicar la integración con tooling que asume arquitecturas estándar de Phi.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SicariusSicariiStuff/Phi-lthy4
- Modelo base: https://huggingface.co/microsoft/phi-4
- Artículo sobre fingerprinting de LLM: https://arxiv.org/html/2506.01631v1
- Página de apoyo del autor: https://ko-fi.com/sicarius
- Imagen promocional del modelo: https://huggingface.co/SicariusSicariiStuff/Phi-lthy4/resolve/main/Images/Phi-Lthy4.png
