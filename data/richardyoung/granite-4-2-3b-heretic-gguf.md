# richardyoung/granite-4.2-3b-heretic-GGUF

## Resumen

Granite-4.2-3b-heretic-GGUF es una cuantización en formato GGUF del modelo richardyoung/granite-4.2-3b-heretic, una variante "abliterated" (también etiquetada como "uncensored" y "heretic") del modelo Granite 4.2 de 3B parámetros de IBM. El trabajo lo publica el usuario richardyoung, que aplica técnicas de ablación de direcciones de rechazo sobre el modelo base para reducir los comportamientos de negativa del modelo original. Con 3.659.737.600 parámetros reales, se trata de un modelo denso de tamaño compacto pensado para ejecución local en hardware de consumo mediante llama.cpp u Ollama.

La relevancia de esta ficha radica en que combina dos factores poco habituales: por un lado, la familia Granite de IBM, orientada a casos de uso empresariales y con licencia Apache 2.0; por otro, el proceso de "abliteration" que elimina selectivamente la dirección de activación asociada a las respuestas de rechazo, dando lugar a un modelo con menor tendencia a declinar peticiones. El resultado es un modelo de 3B parámetros, cuantizado en múltiples niveles GGUF (el repositorio ocupa 20,4 GB en total, lo que indica la presencia de varias cuantizaciones), distribuido bajo acceso restringido (gated) y compatible con endpoints.

El modelo está etiquetado como conversacional y de generación de texto, con soporte para llama.cpp y Ollama. No se dispone de información sobre los idiomas soportados ni sobre resultados de benchmarks en la información proporcionada. La licencia declarada es Apache 2.0, aunque el acceso al repositorio requiere aceptar condiciones en Hugging Face.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en IBM Granite 4.2); detalles específicos no disponibles |
| Parámetros totales | 3.659.737.600 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | GGUF (múltiples niveles; el repositorio de 20,4 GB sugiere varias variantes, niveles concretos no disponibles) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Granite 4.2 de IBM, un transformer denso de aproximadamente 3,66 mil millones de parámetros. Sobre esa base, richardyoung aplica un proceso de "abliteration" (etiquetado como "heretic"), una técnica que identifica la dirección de activación asociada a las respuestas de rechazo y la proyecta fuera de los pesos, reduciendo la tendencia del modelo a negarse a responder. Los tags del repositorio incluyen referencias a dos artículos de arXiv (2406.11717 y 2510.18892), que presumiblemente documentan la metodología de ablación empleada, aunque no se dispone de su contenido en la información proporcionada.

La cuantización se ha realizado con llama.cpp, con la etiqueta "imatrix" que indica el uso de matrices de importancia para calibrar la cuantización y preservar la calidad en niveles bajos de bits. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset original de Granite 4.2 ni sobre si hubo fases de RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto conversacional multi-turno, según el pipeline declarado (text-generation) y la etiqueta "conversational".
- Ejecución local mediante llama.cpp y Ollama, gracias al formato GGUF.
- Compatibilidad con endpoints (tag "endpoints_compatible"), lo que facilita su despliegue en infraestructuras de inferencia compatibles.
- Comportamiento "uncensored"/"abliterated": menor tendencia a rechazar peticiones que el modelo base, según la etiqueta del repositorio.
- Capacidades de razonamiento, código o matemáticas: no disponibles en la información proporcionada.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (idiomas no declarados).
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Experimentación con modelos abliterated: investigadores que estudian el efecto de la ablación de direcciones de rechazo pueden comparar este modelo con el Granite 4.2 original para medir cambios en tasas de negativa y calidad de respuesta.
- Generación de texto creativo sin restricciones temáticas: escritores y creadores que necesitan un modelo local que no decline peticiones sobre ficción sensible, aprovechando el proceso "heretic" aplicado sobre la base.
- Prototipado rápido en local: con 3,66B parámetros y cuantización GGUF, el modelo cabe en GPU de consumo y permite iterar en estaciones de trabajo sin infraestructura cloud.
- Despliegue en Ollama para asistentes personales: integración en flujos de conversación privados donde la ejecución local evita enviar datos a servicios externos.
- Evaluación de seguridad y red-teaming: el modelo sirve como caso de estudio para medir qué comportamientos emergen al eliminar la dirección de rechazo y calibrar filtros externos.
- Investigación sobre cuantización con imatrix: comparar la calidad de las distintas cuantizaciones GGUF del repositorio frente al modelo en safetensors para estudiar la degradación por nivel de bits.
- Fine-tuning posterior sobre la variante abliterated: al estar bajo Apache 2.0 y en formato GGUF, puede servir de base para ajustes específicos de dominio en entornos con requisitos de licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: un modelo de 3,66B parámetros en cuantización de 4 bits ocupa aproximadamente 2-2,5 GB de pesos; en 8 bits, alrededor de 4 GB; en FP16, unos 7,3 GB. Estas cifras son estimaciones basadas en el número de parámetros, no datos publicados del repositorio.
- GPU recomendadas: para FP16, una GPU con al menos 8-10 GB de VRAM (RTX 3060 Ti/4060 Ti 8 GB, RTX 4070, RTX 4090, A100, H100). Para cuantizaciones de 4 bits, basta con 4-6 GB de VRAM.
- ¿Cabe en GPU de consumo? Sí: en cuantizaciones de 4 bits cabe en GPUs de 6-8 GB (RTX 3060, RTX 4060, RTX 2060); en FP16 requiere GPUs de gama media-alta con 8 GB o más.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama (tag explícito en el repositorio), y cualquier servidor compatible con endpoints que acepte GGUF.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| granite-4.2-3b-heretic-GGUF (este) | 3,66B | No disponible | Apache 2.0 | Gated en HF | Variante abliterated en GGUF |
| IBM Granite 4.2 3B (base) | ~3,66B | No disponible | Apache 2.0 | Público en HF | Modelo original sin ablación; comportamientos de rechazo intactos |
| Llama 3.2 3B | ~3,2B | 128K (según documentación pública de Meta) | Llama 3.2 Community License | Público en HF | Alternativa de tamaño similar con licencia no Apache |
| Qwen2.5 3B | ~3,1B | 32K (según documentación pública de Qwen) | Apache 2.0 | Público en HF | Alternativa densa de tamaño similar con licencia permisiva |

Las cifras de contexto y parámetros de los modelos comparables provienen de su documentación pública; los datos de rendimiento comparativo no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- El proceso de abliteration puede degradar capacidades generales del modelo (razonamiento, coherencia, seguimiento de instrucciones) al eliminar direcciones de activación; no se dispone de evaluaciones que cuantifiquen esta degradación.
- Riesgo elevado de generar contenido dañino, sesgado o inexacto al haberse reducido los mecanismos de rechazo; requiere filtros y moderación externos en cualquier despliegue en producción.
- Riesgo de alucinación inherente a un modelo de 3B parámetros; no es adecuado para tareas que exijan alta fiabilidad factual sin verificación.
- Idiomas soportados no declarados; el comportamiento multilingüe es incierto.
- Longitud de contexto no disponible; no se puede confirmar su idoneidad para tareas de contexto largo.
- Acceso restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargar los pesos, lo que puede limitar su uso automatizado en pipelines.
- Aunque la licencia declarada es Apache 2.0, la naturaleza "uncensored" del modelo puede entrar en conflicto con políticas de uso aceptable de plataformas de despliegue y con requisitos regulatorios en determinados sectores.
- No se dispone de información sobre el dataset de entrenamiento ni sobre sesgos específicos conocidos del modelo base Granite 4.2.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/richardyoung/granite-4.2-3b-heretic-GGUF
- Modelo base (safetensors): https://huggingface.co/richardyoung/granite-4.2-3b-heretic
- Artículo arXiv 2406.11717: https://arxiv.org/abs/2406.11717
- Artículo arXiv 2510.18892: https://arxiv.org/abs/2510.18892
