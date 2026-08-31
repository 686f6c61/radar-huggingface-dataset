# Kushtrim/Qwen3-ASR-0.6B-Albanian

## Resumen

Kushtrim/Qwen3-ASR-0.6B-Albanian es un modelo de reconocimiento automático del habla (ASR) fine-tuneado sobre Qwen3-ASR-0.6B, la variante más pequeña de la familia Qwen3-ASR desarrollada por Alibaba Cloud. Este ajuste específico está entrenado para transcribir audio en albanés (shqip) y ha sido publicado por el usuario Kushtrim en Hugging Face. El modelo resuelve el problema de la falta de sistemas ASR open source de calidad para el albanés, un idioma con recursos lingüísticos limitados en el ecosistema de IA.

El modelo base, Qwen3-ASR-0.6B, forma parte de una serie que soporta identificación de idioma y ASR para 52 idiomas, aprovechando la capacidad de comprensión de audio del modelo fundacional Qwen3-Omni. Este fine-tune concreta esa capacidad para el albanés mediante un entrenamiento adicional con aproximadamente 550 horas de audio curado. El repositorio pesa 4,7 GB y contiene pesos en formato safetensors. El acceso es restringido (gated), por lo que es necesario aceptar las condiciones de uso en Hugging Face antes de descargarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-ASR (basada en Qwen3-Omni, encoder de audio + decoder de lenguaje) |
| Parametros totales | 782.426.112 (0,6B del decoder + encoder de audio) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (compatible con FP4, FP8, INT4, INT8 via plataformas como FriendliAI) |
| Idiomas soportados | albanes (sq) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3-ASR-0.6B, que combina un encoder de audio con un decoder de lenguaje basado en transformer. La familia Qwen3-ASR se construye sobre Qwen3-Omni, un modelo multimodal que integra comprensión de audio y texto. En esta variante de 0,6B, el decoder tiene aproximadamente 600 millones de parámetros y el encoder de audio añade el resto hasta los 782 millones totales. El modelo base fue preentrenado con datos de habla a gran escala en 52 idiomas, incluyendo albanés.

El fine-tune para albanés se realizó con alrededor de 550 horas de audio albanés cuidadosamente seleccionado, junto con sus transcripciones correspondientes. No se han publicado detalles sobre el método exacto de entrenamiento (por ejemplo, si se usó pérdida CTC, atención o un enfoque híbrido), pero al ser un fine-tune supervisado, se asume un ajuste con pares audio-texto. El modelo está diseñado para funcionar mejor con audio limpio, mono y a 16 kHz, siguiendo las convenciones del conjunto de datos de entrenamiento.

## Capacidades

- Transcripción de voz en albanés a texto, tanto en tiempo real como en lote.
- Identificación de idioma (heredada del modelo base, aunque el fine-tune está especializado en albanés).
- Procesamiento de audio muestreado a 16 kHz, con buena tolerancia a variaciones de pronunciación y acentos dentro del albanés.
- Generación de transcripciones con puntuación básica, dependiendo de las convenciones del dataset de entrenamiento.
- No soporta tool calling, razonamiento multi-paso ni tareas de texto adicionales: es exclusivamente un modelo de ASR.

## Casos de uso

- Subtitulado de vídeos en albanés: el modelo puede transcribir pistas de audio de vídeos para generar subtítulos automáticos, especialmente en contenidos con habla clara y sin ruido de fondo.
- Transcripción de reuniones y entrevistas: en entornos empresariales o periodísticos, permite convertir grabaciones de reuniones en actas escritas, siempre que la calidad del audio sea aceptable.
- Atención al cliente automatizada: integrado en sistemas de IVR o análisis de llamadas, puede transcribir conversaciones telefónicas en albanés para su posterior análisis o archivado.
- Asistentes de voz para hablantes de albanés: sirve como componente ASR en aplicaciones de voz a texto, como dictado o comandos por voz, en dispositivos con recursos limitados gracias a su tamaño reducido.
- Accesibilidad para personas sordas o con discapacidad auditiva: convierte audio en albanés en texto en tiempo real para su visualización en pantalla durante conferencias o eventos.
- Investigación lingüística: permite procesar corpus orales en albanés de forma automática, facilitando estudios de fonética, dialectología o análisis de discurso.
- Análisis de contenido multimedia: periodistas o creadores de contenido pueden transcribir podcasts o noticias en albanés para generar resúmenes o búsquedas textuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio de Hugging Face no incluye métricas como WER (Word Error Rate) ni comparaciones con otros modelos ASR para albanés. Se desconoce el rendimiento exacto en condiciones de ruido, acentos regionales o habla espontánea.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente. Con 782M parámetros en FP16, se estima un uso de memoria de alrededor de 1,6 GB solo para los pesos, más overhead de activaciones. En cuantización INT8 podría reducirse a menos de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM debería ser suficiente para inferencia en FP16. Modelos como la RTX 3060, RTX 4060 o superiores son adecuadas. Para despliegue en producción, una T4 o A10G es suficiente.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs consumer de gama media y baja.
- Opciones de despliegue: compatible con la librería transformers de Hugging Face, así como con servidores de inferencia como vLLM o TGI (aunque la documentación específica es limitada). FriendliAI ofrece soporte con cuantización FP4, FP8, INT4 e INT8.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kushtrim/Qwen3-ASR-0.6B-Albanian | 782M | albanes | no disponible | apache-2.0 | Gated en Hugging Face |
| OpenAI Whisper small | 244M | 96 idiomas | 30 segundos de audio | MIT | Abierto en Hugging Face |
| OpenAI Whisper medium | 769M | 96 idiomas | 30 segundos de audio | MIT | Abierto en Hugging Face |
| Qwen3-ASR-0.6B (original) | 782M | 52 idiomas | no disponible | apache-2.0 | Abierto en Hugging Face |

Whisper small y medium son alternativas que soportan albanés entre sus 96 idiomas, pero con un tamaño similar (medium) o menor (small) que este modelo. La ventaja del fine-tune de Kushtrim es que está especializado exclusivamente en albanés, lo que podría dar mejor precisión en ese idioma que Whisper, aunque no hay datos comparativos publicados. El modelo base Qwen3-ASR-0.6B ya cubre albanés, pero este fine-tune añade 550 horas de audio específico.

## Limitaciones y advertencias

- Acceso restringido: el modelo requiere aceptar condiciones en Hugging Face antes de su descarga, lo que puede limitar su uso en entornos automatizados.
- Entrenado principalmente con audio limpio (mono, 16 kHz): el rendimiento degrada significativamente con ruido de fondo, música, múltiples hablantes o grabaciones de baja calidad.
- Sin datos de WER publicados: no se puede evaluar objetivamente su precisión frente a alternativas.
- Limitado al albanés: no soporta otros idiomas, a pesar de que el modelo base sí los soportaba.
- Posibles sesgos dialectales: el conjunto de datos de 550 horas puede no representar todas las variantes dialectales del albanés (geg, tosk, etc.), lo que podría afectar la transcripción de ciertas regiones.
- Sin garantías de producción: al ser un modelo de la comunidad, no cuenta con soporte oficial ni mantenimiento continuo.

## Enlaces

- [Hugging Face - Kushtrim/Qwen3-ASR-0.6B-Albanian](https://huggingface.co/Kushtrim/Qwen3-ASR-0.6B-Albanian)
- [Hugging Face Space - Demo interactiva](https://huggingface.co/spaces/Kushtrim/Qwen3-ASR-0.6B-Albanian)
- [GitHub - QwenLM/Qwen3-ASR](https://github.com/QwenLM/Qwen3-ASR)
- [FriendliAI - Página del modelo](https://friendli.ai/models/Kushtrim/Qwen3-ASR-0.6B-Albanian)
