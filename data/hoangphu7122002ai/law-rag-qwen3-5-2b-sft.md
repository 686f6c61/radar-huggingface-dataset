# hoangphu7122002ai/law-rag-qwen3.5-2b-sft

## Resumen

law-rag-qwen3.5-2b-sft es la etapa de ajuste supervisado (SFT con LoRA) del generador del sistema law-rag, un pipeline de generación aumentada por recuperación (RAG) para responder preguntas sobre derecho vietnamita. Lo desarrolla el usuario hoangphu7122002ai en el marco del curso *Large Language Models* de la HCMUT, cuyo requisito era construir un sistema de respuesta con un modelo por debajo de 4B parámetros. El modelo parte de Qwen/Qwen3.5-2B, un transformer denso de 2.213.241.664 parámetros, y se distribuye con los pesos LoRA fusionados en bf16 (unos 4,5 GB).

El modelo no responde conocimiento legal de memoria: está entrenado para recibir un contexto con pasajes recuperados, citar primero la disposición concreta (por ejemplo, «khoản 2 Điều 9 Thông tư 27/2025/TT-NHNN») y después reproducir su contenido, o bien rechazar la respuesta cuando los pasajes no cubren la pregunta. Es, por tanto, un componente de una arquitectura mayor (recuperación densa con AITeamVN/Vietnamese_Embedding, reranking con AITeamVN/Vietnamese_Reranker y few-shot con las 2 preguntas de entrenamiento más cercanas), no un modelo autónomo de uso general.

Su relevancia es doble: por un lado, documenta de forma transparente una cadena completa de SFT más dos rondas de DPO sobre un modelo pequeño, con métricas ROUGE-L en dev y test; por otro, esta ficha concreta corresponde solo a la primera etapa (v3b), y el sistema reportado por el autor es la variante DPO, que obtiene mejores resultados. La licencia figura como «other» y el modelo solo declara soporte de vietnamita.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.5), ajustado con LoRA y pesos fusionados |
| Parametros totales | 2.213.241.664 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | hasta 32.768 tokens en el servicio vLLM de referencia; entrenamiento con longitud máxima de 12.288 tokens |
| Tipos de cuantizacion | no disponible (el autor publica pesos en bf16; no se documentan GGUF, AWQ ni GPTQ) |
| Idiomas soportados | vietnamita (vi) |
| Licencia | other |
| Formato de pesos | safetensors (transformers), bf16, ~4,5 GB |
| Modelo base | Qwen/Qwen3.5-2B |
| Etapa | LoRA SFT (v3b), pesos fusionados |
| Dataset de entrenamiento | hoangphu7122002ai/law-rag-data (train/q35_v3b), 1.688 filas + 188 de validación |
| Pipeline | text-generation; etiquetado también como image-text-to-text en los tags de Hugging Face |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen/Qwen3.5-2B: un transformer denso de aproximadamente 2,2B parámetros. Sobre él se aplicó un ajuste supervisado con LoRA de rango 32 y alpha 32, dropout 0,05, sobre todas las capas lineales, con optimizador a lr 1e-4, 3 épocas, batch efectivo de 16 (batch 1 × 16 acumulaciones, 318 pasos) y longitud máxima de 12.288 tokens. El entrenamiento se ejecutó en una única GPU L40S durante aproximadamente 1,3 horas y la selección del checkpoint se hizo por mejor pérdida de validación (0,370, en el último paso). Los adaptadores se fusionaron posteriormente en los pesos, de modo que el repositorio contiene un modelo bf16 estándar cargable con `AutoModelForCausalLM`.

Los datos son 1.688 filas de hoangphu7122002ai/law-rag-data (subconjunto train/q35_v3b), donde cada fila reproduce exactamente el prompt de inferencia junto con la respuesta de referencia. La composición incluye entre 3 y 10 pasajes recuperados por fila, con inyección del artículo correcto («gold article») con probabilidad 0,7; entre 0 y 3 preguntas de entrenamiento cercanas como ejemplos few-shot; y, con probabilidad 0,2, una fila adicional de rechazo con contexto no relacionado cuyo objetivo es la frase de negativa. El conjunto está descontaminado: se eliminan las filas que citan la misma (ley, Điều) que una respuesta de test o que comparten un 13-grama raro con ella. No se documenta en esta etapa ninguna innovación de decodificación más allá del uso de MBR-8 (selección por consenso entre 8 muestras) como alternativa a la decodificación greedy en la evaluación.

## Capacidades

- Generación de respuestas extractivas sobre derecho vietnamita a partir de pasajes recuperados, citando primero la disposición y luego su texto.
- Rechazo explícito cuando el contexto no contiene la respuesta, en lugar de inventar (comportamiento entrenado con filas de negativa).
- Seguimiento de una plantilla de prompt estricta: línea de sistema, pasajes en formato «- Ngữ cảnh i: ...», pregunta y respuesta.
- Modo de pensamiento desactivable mediante `enable_thinking=False` en la plantilla de chat; el modelo fue entrenado con el pensamiento desactivado.
- Uso de ejemplos few-shot insertados en el mismo mensaje de usuario antes de las instrucciones.
- Integración con servidores compatibles con la API de OpenAI (vLLM) y con `transformers`.
- Capacidad multilingüe: no disponible; solo se declara vietnamita.
- Tool calling / function calling: no disponible.
- Capacidades de agente o razonamiento multi-paso: no disponible.
- Visión o audio: no disponible (aunque los tags incluyen image-text-to-text, la model card no documenta ninguna capacidad multimodal).

## Casos de uso

- Atención al ciudadano sobre normativa vietnamita: desplegado tras el pipeline law-rag, el modelo recibe los artículos recuperados y devuelve una respuesta con la referencia exacta (ley, artículo, cláusula), lo que facilita la verificación por parte del usuario.
- Asistencia a equipos jurídicos internos: como primer borrador de respuestas a consultas recurrentes sobre circulares del Banco del Estado o normativa financiera, siempre con revisión humana posterior.
- Cumplimiento normativo en banca y finanzas: consultas sobre plazos de reporte de operaciones, como el ejemplo de la model card sobre el reporte de transferencias electrónicas antes de las 16:00 del día hábil siguiente.
- Construcción de un sistema RAG evaluable: al estar documentados el prompt, el pipeline de recuperación y las métricas, sirve como línea base reproducible para comparar SFT frente a DPO en un dominio vertical.
- Filtrado y abstención controlada: el entrenamiento con filas de rechazo permite usar el modelo como capa que decide cuándo no responder, reduciendo alucinaciones en producción.
- Docencia e investigación en modelos pequeños: con 2,2B parámetros y unas 1,3 horas de entrenamiento en una L40S, es un caso práctico de ajuste eficiente con LoRA para cursos de LLM.
- Prototipado rápido en local: al ocupar unos 4,5 GB en bf16, cabe en GPUs de consumo con suficiente VRAM para pruebas de integración del pipeline.

## Benchmarks y rendimiento

| Metrica | Dev (greedy / MBR-8) | Test (greedy / MBR-8) |
|---|---|---|
| ROUGE-L, law-rag-qwen3.5-2b-sft (esta etapa) | 0,633 / 0,658 | 0,607 / no medido |
| ROUGE-L, law-rag-qwen3.5-2b-dpo (sistema reportado) | 0,664 / 0,672 | 0,643 / 0,652 |
| ROUGE-L, trainval-dpo2 | no medido | 0,640 / 0,646 |

Las cifras corresponden a 300 preguntas de dev y 200 de test retenidas, ambas con el pipeline de recuperación completo y 2 ejemplos few-shot. El autor advierte que ROUGE-L mide similitud con respuestas de referencia de estilo plantilla, no corrección jurídica. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: en bf16, los pesos ocupan aproximadamente 4,4 GB, por lo que la inferencia necesita del orden de 6-8 GB de VRAM según la longitud de contexto y el tamaño de lote; con contexto de 32.768 tokens el consumo de KV cache crece de forma notable.
- GPU recomendadas: el autor entrenó en una NVIDIA L40S; para servicio se documenta vLLM 0.30 con `--dtype bfloat16 --max-model-len 32768 --enable-prefix-caching`.
- GPU de consumo: cabe en tarjetas con 8 GB o más (por ejemplo, RTX 3060 Ti/4060 Ti de 8 GB o superiores) para contextos moderados; no se documentan pruebas en estas tarjetas.
- Opciones de despliegue: vLLM (probado por el autor) y `transformers` con `AutoModelForCausalLM.from_pretrained`. No se documentan llama.cpp, Ollama ni TGI, ni pesos GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ROUGE-L test | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| law-rag-qwen3.5-2b-sft (esta ficha) | 2,21B | 32.768 en servicio; 12.288 en entrenamiento | 0,607 (greedy) | other | Hugging Face |
| law-rag-qwen3.5-2b-dpo | ~2,21B (misma base) | igual | 0,643 (greedy) / 0,652 (MBR-8) | other | Hugging Face |
| law-rag-qwen3.5-2b-trainval-dpo2 | ~2,21B (misma base) | igual | 0,640 (greedy) / 0,646 (MBR-8) | other | Hugging Face |
| Qwen/Qwen3.5-2B (base) | ~2,2B | no disponible en la información | no disponible | no disponible en la información | Hugging Face |

La comparación con modelos de otros autores y mismo tamaño o misma tarea no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Las métricas son ROUGE-L frente a respuestas de referencia con plantilla; no miden corrección jurídica. Las respuestas no constituyen asesoramiento legal.
- El modelo está diseñado para funcionar dentro del pipeline law-rag con su prompt exacto; fuera de ese formato o sin pasajes recuperados, el comportamiento no está garantizado.
- Solo se declara vietnamita; no hay evidencia de calidad en otros idiomas.
- Riesgo de alucinación mitigado pero no eliminado: el rechazo se aprende con filas de negativa (probabilidad 0,2 durante el entrenamiento) y puede fallar en contextos ambiguos.
- Licencia «other»: es necesario revisar los términos concretos antes de cualquier uso comercial; no se especifican en la información disponible.
- Esta etapa no es el sistema reportado: el autor indica que el sistema final añade dos rondas de DPO sobre este SFT, con mejor ROUGE-L en dev y test.
- El modelo base Qwen3.5-2B y sus propios sesgos y limitaciones se heredan; no se documentan análisis de sesgo específicos.
- No se documentan cuantizaciones ni formatos ligeros, lo que limita el despliegue en entornos con poca VRAM.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hoangphu7122002ai/law-rag-qwen3.5-2b-sft
- Variante DPO (sistema reportado): https://huggingface.co/hoangphu7122002ai/law-rag-qwen3.5-2b-dpo
- Variante trainval SFT: https://huggingface.co/hoangphu7122002ai/law-rag-qwen3.5-2b-trainval-sft
- Variante trainval DPO ronda 1: https://huggingface.co/hoangphu7122002ai/law-rag-qwen3.5-2b-trainval-dpo1
- Variante trainval DPO ronda 2: https://huggingface.co/hoangphu7122002ai/law-rag-qwen3.5-2b-trainval-dpo2
- Dataset: https://huggingface.co/datasets/hoangphu7122002ai/law-rag-data
- Repositorio del proyecto: https://github.com/hoangphu7122002/law-rag
- Manual del pipeline: https://github.com/hoangphu7122002/law-rag/blob/main/docs/MANUAL.md
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
