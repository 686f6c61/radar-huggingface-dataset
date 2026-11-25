# INCModel4/Phi-4-multimodal-instruct-W8A16-AutoRound

## Resumen

Phi-4-multimodal-instruct-W8A16-AutoRound es una versión cuantizada a int8 del modelo multimodal Phi-4 de Microsoft, generada por el usuario INCModel4 mediante la herramienta AutoRound de Intel. La cuantización aplica el esquema W8A16 (pesos de 8 bits, activaciones en 16 bits) con tamaño de grupo 128 y simetría, tras 200 iteraciones de ajuste. El resultado es un checkpoint que reduce el peso en disco respecto al original en BF16 manteniendo prácticamente intactas las capacidades del modelo base.

El modelo subyacente, microsoft/Phi-4-multimodal-instruct, es un transformer denso de aproximadamente 3.190 millones de parámetros que combina procesamiento de texto, visión y audio en una sola arquitectura. Esta versión cuantizada conserva en BF16 los adaptadores LoRA, los embeddings de tokens, la cabeza de salida (lm_head), los componentes de visión y audio y las capas de normalización, mientras que cuantiza las proyecciones de atención y MLP del decodificador de texto.

La relevancia de esta ficha radica en que ofrece una alternativa de despliegue más ligera para entornos con recursos limitados, con una recuperación media del 99,65 % en los benchmarks evaluados (PIQA, HellaSwag, MMLU y GSM8K) respecto al modelo en BF16. La licencia MIT del modelo base facilita su uso comercial, aunque el autor recomienda revisar los términos del modelo original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (texto, visión y audio) con adaptadores LoRA |
| Parámetros totales | 3.189.998.560 (aproximadamente 3,19 mil millones) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada (el ejemplo de despliegue usa max-model-len 4096) |
| Tipos de cuantización | W8A16 int8, group_size 128, simétrica; componentes de visión, audio, embeddings, lm_head y LoRA en BF16 |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (librería transformers, requiere trust_remote_code) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso multimodal de Microsoft que integra un decodificador de texto con codificadores de visión y audio, permitiendo entrada y salida en múltiples modalidades. Esta versión cuantizada no reentrena el modelo: aplica cuantización post-entrenamiento con AutoRound sobre las proyecciones de atención y MLP del decodificador de texto, dejando en BF16 los adaptadores LoRA, los embeddings, la cabeza de salida, las capas de normalización y todos los componentes de visión y audio. La cuantización se realizó con 200 iteraciones de ajuste, 128 muestras de calibración, longitud de secuencia 2048 y tamaño de grupo 128.

AutoRound es una técnica de cuantización que optimiza el redondeo de pesos mediante descenso de gradiente con signo, en lugar de usar redondeo por proximidad. Según la model card, se aplicó un parche de compatibilidad (auto-round-block-list-fallback.patch) para gestionar el bloque de capas cuantizadas. El proceso completo de generación se documenta con el comando auto-round incluido en la model card, lo que permite reproducir la cuantización. No se dispone de información sobre los datos de entrenamiento del modelo base ni sobre procesos de RLHF o DPO en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento en lenguaje natural.
- Comprensión de imágenes mediante el codificador de visión integrado.
- Procesamiento de audio y reconocimiento automático del habla (pipeline declarado: automatic-speech-recognition).
- Razonamiento matemático y resolución de problemas, con resultados destacados en GSM8K (80,67 en la versión cuantizada).
- Comprensión lectora y conocimiento general, evaluados en MMLU, PIQA y HellaSwag.
- Soporte de conversación multi-turno mediante plantilla de chat.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling y agentes: no disponible en la información proporcionada.

## Casos de uso

- Reconocimiento automático del habla en producción: el pipeline declarado es automatic-speech-recognition, por lo que el modelo puede transcribir audio a texto; la cuantización W8A16 reduce el coste de memoria frente al BF16, lo que facilita su despliegue en servidores con GPU de gama media.
- Asistentes conversacionales multimodales: al conservar en BF16 los componentes de visión y audio, el modelo puede gestionar conversaciones que combinen texto, imágenes y voz, útil en interfaces de atención al cliente o asistentes de accesibilidad.
- Descripción y análisis de imágenes: el codificador de visión permite generar descripciones, responder preguntas sobre imágenes o extraer información de documentos escaneados, integrándose en pipelines de procesamiento documental.
- Razonamiento matemático asistido: con un 80,67 en GSM8K, es adecuado para tutores educativos o herramientas de resolución de problemas paso a paso.
- Despliegue en entornos con VRAM limitada: al ocupar aproximadamente 8 GB el repositorio completo en int8, puede ejecutarse en GPU de consumo como la RTX 4090 o incluso en GPUs de 16 GB, sirviendo como alternativa al modelo original en BF16.
- Evaluación y prototipado de investigación: la licencia MIT y la reproducibilidad del proceso de cuantización permiten usarlo como base para experimentos de cuantización, comparación de precisión o estudios de eficiencia energética.
- Procesamiento por lotes de texto y audio: con vLLM y max-model-len 4096, puede atender peticiones concurrentes en tareas de transcripción o generación de texto a escala moderada.

## Benchmarks y rendimiento

Resultados publicados en la model card comparando BF16 frente a W8A16:

| Benchmark | BF16 | W8A16 | Recuperación |
|---|---:|---:|---:|
| PIQA | 77,53 | 77,42 | 99,86 % |
| HellaSwag | 52,30 | 52,08 | 99,58 % |
| MMLU | 67,36 | 67,40 | 100,05 % |
| GSM8K | 81,35 | 80,67 | 99,16 % |
| **Media** | **69,64** | **69,39** | **99,65 %** |

La cuantización mantiene prácticamente intacto el rendimiento del modelo original, con una pérdida media inferior al 0,4 %. No se han publicado comparativas con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 8,0 GB en int8; en la práctica se necesita algo más de VRAM para el contexto KV y los componentes en BF16 (visión, audio, embeddings, lm_head), por lo que se recomienda al menos 12-16 GB para secuencias cortas y 24 GB para contextos largos.
- GPU recomendadas: A100, H100 o L40S para producción; RTX 4090 (24 GB) para desarrollo y despliegue en una sola GPU.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) y potencialmente en GPUs de 16 GB con contextos reducidos; en GPUs de 8-12 GB puede requerir limitar la longitud de contexto o descargar componentes a CPU.
- Opciones de despliegue: vLLM 0.33.0 (documentado en la model card con --trust-remote-code, --dtype bfloat16 y --max-model-len 4096), transformers 5.20.2 con trust_remote_code; llama.cpp y Ollama no están documentados para este checkpoint.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Phi-4-multimodal-instruct-W8A16 (este) | 3,19 mil millones | No disponible (ejemplo con 4096) | Texto, visión, audio | MIT | Hugging Face |
| microsoft/Phi-4-multimodal-instruct (BF16) | 3,19 mil millones | No disponible | Texto, visión, audio | MIT | Hugging Face |
| Otros modelos de ~3B multimodales | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparativa con alternativas de la misma categoría no está disponible en la información proporcionada. La referencia más directa es el modelo base en BF16, del que este checkpoint es una versión cuantizada con una recuperación media del 99,65 % en los benchmarks evaluados.

## Limitaciones y advertencias

- El modelo puede generar información factualmente incorrecta; no debe usarse como fuente de verdad sin verificación.
- Riesgo de alucinación inherente al modelo base, no corregido por la cuantización.
- Puede producir salidas sesgadas, ofensivas o inapropiadas debido a los datos de preentrenamiento y ajuste fino del modelo original.
- La cuantización introduce una pérdida mínima pero no nula de precisión (recuperación media del 99,65 %); en tareas sensibles puede ser necesario validar frente al BF16.
- Los componentes de visión y audio se mantienen en BF16, por lo que el ahorro de memoria es parcial respecto a una cuantización completa.
- El despliegue requiere trust_remote_code y versiones específicas de vLLM (0.33.0) y transformers (5.20.2), lo que limita la compatibilidad con entornos más antiguos.
- Idiomas soportados no documentados; el comportamiento multilingüe no está garantizado.
- La licencia MIT del modelo base permite uso comercial, pero el autor declara que la licencia no constituye asesoramiento legal y recomienda consultar a un abogado antes de un uso comercial.
- Es necesario realizar pruebas de seguridad antes de desplegar el modelo en aplicaciones reales.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/INCModel4/Phi-4-multimodal-instruct-W8A16-AutoRound)
- [Modelo base: microsoft/Phi-4-multimodal-instruct](https://huggingface.co/microsoft/Phi-4-multimodal-instruct)
- [Licencia del modelo base](https://huggingface.co/microsoft/Phi-4-multimodal-instruct/resolve/main/LICENSE)
- [AutoRound (GitHub)](https://github.com/intel/auto-round)
- [Intel Neural Compressor (GitHub)](https://github.com/intel/neural-compressor)
- [Paper de AutoRound (arXiv:2309.05516)](https://arxiv.org/abs/2309.05516)
