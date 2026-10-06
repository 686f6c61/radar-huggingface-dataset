# Modujo-AI/ModujoMoE

## Resumen
Modujo-AI/ModujoMoE es un repositorio de Hugging Face desarrollado por Modujo-AI que agrupa varias variantes de un modelo de lenguaje de tipo mixture-of-experts (MoE) bajo la arquitectura Qwen4ExpForCausalLM. La variante principal de preentrenamiento es Modujo-1B-A0.75B, con 1.000 millones de parámetros totales y aproximadamente 750 millones activos por token, 36 capas, 8 expertos enrutados por capa con enrutamiento top-2 y un experto compartido. El repositorio también incluye un checkpoint de continued pretraining de 4B (Modujo-4B-A0.66B PT) y un checkpoint SFT experimental de 4B (Modujo-4B-A0.66B SFT), además de metadatos históricos de una arquitectura 9B-A1B cuyos pesos fueron eliminados.

La atención combina capas Gated DeltaNet y atención densa en un patrón repetitivo de 3 capas Gated DeltaNet + 1 capa de atención densa. La configuración de contexto máxima es de 32K posiciones, aunque las secuencias de entrenamiento no superaron los 2.048 tokens. El modelo se distribuye en formato BF16 safetensors y no está instruction-tuned, por lo que no debe usarse como modelo de chat sin un ajuste posterior. La relevancia actual radica en ser una implementación abierta de MoE con atención híbrida y un tamaño reducido, orientada a investigación y experimentación con técnicas de eficiencia.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen4ExpForCausalLM (MoE con Gated DeltaNet y atención densa) |
| Parámetros totales | 1B (pretrain/Modujo-1B-A0.75B); 4B (sft/pt/Modujo-4B-A0.66B); 9B (histórico, sin pesos) |
| Parámetros activos | A0.75B (1B); A0.66B (4B); A1B (histórico 9B) |
| Longitud de contexto | 32K posiciones máximas; secuencias de entrenamiento hasta 2.048 tokens |
| Tipos de cuantización | no disponible (solo BF16 safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | BF16 safetensors |

## Arquitectura y entrenamiento
La arquitectura Qwen4ExpForCausalLM es un transformer de tipo mixture-of-experts. Cada una de las 36 capas contiene 8 expertos enrutados, un experto compartido y un enrutador que selecciona los 2 expertos más relevantes por token (top-2 routing). La disposición de atención alterna 3 capas de Gated DeltaNet (una variante de atención lineal recurrente) seguidas de 1 capa de atención densa. Esta combinación busca reducir el coste computacional en secuencias largas manteniendo la calidad de la atención completa.

El entrenamiento de la variante 1B-A0.75B corresponde a una fase de continued pretraining sobre un modelo base, sin RLHF ni DPO documentados. Las secuencias de entrenamiento tuvieron una longitud máxima de 2.048 tokens, aunque la configuración de posiciones máximas es de 32K. El repositorio incluye un SFT experimental para el modelo de 4B, pero su etapa de destilación del profesor no ha comenzado. Están planificados experimentos con QSA (indexadores de atención dispersa) y Looped Transformer, pero no están implementados en esta release.

## Capacidades
- Generación de texto autocompletivo para secuencias cortas.
- Modelado de lenguaje causal (predicción del siguiente token).
- Base para fine-tuning supervisado (SFT) y continued pretraining.
- No soporta tool calling ni function calling de forma nativa.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingües no especificadas.
- No dispone de modo thinking, visión ni audio.
- El checkpoint SFT incluido es experimental y no ha completado la fase de destilación del profesor.

## Casos de uso
- Investigación en arquitecturas MoE: analizar el enrutamiento top-2 y la contribución del experto compartido en el modelo 1B-A0.75B para estudiar la distribución de carga entre expertos.
- Experimentos de continued pretraining: partir del checkpoint base para adaptarlo a dominios específicos (legal, médico, código) con datos propios, aprovechando la ventana de 32K posiciones.
- Fine-tuning supervisado (SFT): utilizar el base para entrenar un modelo instructivo, dado que el SFT del repositorio es experimental y no está finalizado.
- Evaluación de atención híbrida: probar la combinación de 3 capas Gated DeltaNet + 1 capa de atención densa en tareas de contexto largo, midiendo calidad y eficiencia frente a atención densa pura.
- Generación de texto en entornos controlados: autocompletado de documentación técnica o código donde se pueda tolerar repetición y se requiera un modelo de bajo coste computacional.
- Benchmarking de eficiencia en hardware consumer: medir latencia y throughput del MoE con A0.75B activos en GPUs como RTX 3060 o RTX 4090.
- Estudio de rutas de expertos: analizar qué expertos se activan para diferentes entradas y cómo afecta al rendimiento final en tareas de generación.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada: 1B en BF16 requiere ~2 GB de pesos; 4B en BF16 ~8 GB; 9B (sin pesos) ~18 GB. Añadir overhead de KV cache y activaciones, no cuantificado.
- GPU recomendadas: 1B: cualquier GPU con más de 4 GB de VRAM (GTX 1650, RTX 3050, RTX 4090). 4B: GPUs con más de 10 GB (RTX 3060 12GB, RTX 3080, RTX 4090, A100). 9B: GPUs con más de 20 GB (A100 40GB, H100).
- Cabe en consumer GPU: 1B sí, en GPUs con 8 GB o más; 4B sí, en RTX 3060 12GB o superior; 9B no en GPUs consumer típicas.
- Opciones de despliegue: transformers con subfolder y device_map="auto". Posiblemente vLLM o TGI si soportan la arquitectura Qwen4ExpForCausalLM, pero no confirmado. No hay archivos GGUF para llama.cpp u Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares
| Modelo | Parámetros totales | Parámetros activos | Contexto | Etapa de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Modujo-1B-A0.75B | 1B | A0.75B | 32K (entrenado a 2K) | Continued pretraining base | no disponible | Disponible en pretrain/ |
| Modujo-4B-A0.66B PT | 4B | A0.66B | 32K (entrenado a 2K) | Continued pretraining | no disponible | Disponible en pt/ |
| Modujo-4B-A0.66B SFT | 4B | A0.66B | 32K (entrenado a 2K) | SFT experimental | no disponible | Experimental en sft/ |
| Modujo 9B-A1B (histórico) | 9B | A1B | no disponible | no disponible | no disponible | Sin pesos |

Nota: no se dispone de datos de rendimiento comparativo con modelos externos en la información proporcionada.

## Limitaciones y advertencias
- Es un modelo base, no instruction-tuned. No debe usarse como chat o asistente sin un ajuste posterior.
- Las generaciones largas pueden presentar repeticiones.
- La capacidad de seguir instrucciones no es estable.
- El checkpoint SFT es experimental y no ha completado la destilación del profesor.
- No incluye QSA (indexador de atención dispersa) en esta release.
- Aunque la configuración máxima es de 32K, el entrenamiento se realizó con secuencias de hasta 2.048 tokens, por lo que el rendimiento en contextos largos puede degradarse.
- La licencia no está disponible, lo que impide conocer las restricciones de uso comercial.
- Los idiomas soportados no están especificados.
- No se han publicado benchmarks que permitan evaluar su calidad objetivamente.
- Los pesos en la raíz del repositorio han sido eliminados; es obligatorio cargar subdirectorios específicos.
- El modelo histórico 9B-A1B no tiene pesos disponibles.
- Sesgos conocidos: no disponible.
- Riesgo de alucinación: inherente a los modelos de lenguaje, no evaluado en este checkpoint.
- Para producción, se recomienda esperar a una release SFT o alineada.

## Enlaces
- https://huggingface.co/Modujo-AI/ModujoMoE
- https://huggingface.co/Modujo-AI/ModujoMoE/tree/main/pretrain/Modujo-1B-A0.75B
- https://huggingface.co/Modujo-AI/ModujoMoE/tree/main/sft/Modujo-4B-A0.66B
- https://huggingface.co/Modujo-AI/ModujoMoE/tree/main/pt/Modujo-4B-A0.66B
- https://huggingface.co/Modujo-AI/ModujoMoE/blob/main/pretrain/Modujo-1B-A0.75B/parameter_summary.json
