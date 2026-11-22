# Phase-Technologies/FORGE-500M-Chat

## Resumen

FORGE-500M-Chat es un modelo de lenguaje conversacional de escala sub-mil millones desarrollado por Phase-Technologies (autoría declarada de Soham Pal). Su propuesta principal es sustituir la atención cuadrática por una recurrencia de espacio de estados de tiempo lineal combinada con una mezcla de expertos dispersa jerárquica (HSE-MoE), buscando maximizar la eficiencia de parámetros y la escalabilidad en longitud de secuencia. El modelo parte de una base preentrenada desde cero y se alinea mediante SFT y DPO para uso conversacional.

La arquitectura es híbrida: 18 capas intercaladas, de las cuales 15 son capas SSM con *Adaptive Recurrent Gating* (ARG) y solo 3 son capas de atención global multi-cabeza con RoPE y extensión YaRN. De las 18 capas, 9 usan FFN densa SwiGLU y 9 usan MoE jerárquica con 32 expertos y top-2 activos. El modelo declara 500M parámetros totales y unos 320M activos por token, aunque el recuento real de pesos en safetensors asciende a 711.080.311 parámetros, discrepancia que conviene tener en cuenta al planificar el despliegue.

Es relevante ahora porque ejemplifica una línea de trabajo de modelos pequeños y eficientes entrenados con recursos limitados (4 slices MIG de NVIDIA B300) y publicados con licencia Apache 2.0, lo que facilita su inspección, reproducción y uso comercial. No obstante, el volumen de preentrenamiento (1,66B tokens) es muy reducido para los estándares actuales, lo que acota seriamente sus capacidades reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida SSM + MHA + MoE (15 capas ARG SSM, 3 capas MHA global, 9 FFN densas SwiGLU, 9 FFN MoE HSE) |
| Parametros totales | 500.019.616 declarados por el autor; 711.080.311 según safetensors |
| Parametros activos | ~320.000.000 (declarados, vía HSE-MoE top-2) |
| Longitud de contexto | 4.096 tokens nativos; hasta 16.384 con YaRN |
| Tipos de cuantizacion | no disponible (no se documentan GGUF, AWQ, GPTQ ni similares) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PyTorch, requiere `custom_code`) |

## Arquitectura y entrenamiento

El modelo emplea una topología híbrida asimétrica. La dimensión oculta es de 1.024, con 8 cabezas de atención (8 query, 8 key/value), vocabulario de 206.464 tokens mediante el tokenizador propietario CRAYON Turbo (BPE con fallback de bytes). La mayoría de capas (15 de 18) son recurrencias SSM lineales con *Adaptive Recurrent Gating*, y solo 3 son atención global, lo que reduce el coste computacional a tiempo lineal en la longitud de secuencia. La MoE jerárquica dispersa activa 2 de 32 expertos por token. La proyección final al vocabulario se hace por trozos (*chunked*, `chunk_size=1024`) para evitar picos de VRAM.

El preentrenamiento se realizó desde cero sobre 1.660.944.384 tokens (1,66B) en 4 slices MIG `1g.34gb` de NVIDIA B300 SXM6, con batch global de 1.048.576 tokens y un throughput de 7.337 tokens/s. La pérdida pasó de 12,512 (perplejidad >150.000) en el paso 1 a 4,6473 (perplejidad 104,30) en el paso 821. El SFT usó una mezcla de ShareGPT, UltraChat, CodeFeedback (Python), MetaMath y OpenOrca, con enmascaramiento de pérdida en turnos de asistente y DDP sobre las 4 GPU con decaimiento coseno de LR (2e-5 a 2e-6) en BF16. El DPO se aplicó sobre UltraFeedback, Anthropic HH-RLHF y HelpSteer2 con modelo de referencia congelado y β=0,1. No se documentan innovaciones como decodificación especulativa ni atención lineal alternativa más allá de la propia recurrencia SSM.

## Capacidades

- Generación de texto conversacional multi-turno en inglés.
- Razonamiento básico e instrucciones generales, limitado por el escaso volumen de preentrenamiento.
- Generación de código Python (entrenado con CodeFeedback), sin garantías de corrección en tareas complejas.
- Razonamiento matemático elemental (MetaMath en SFT).
- Seguimiento de formato de chat con plantilla y enmascaramiento de turnos.
- Alineación de preferencias vía DPO, con mejora declarada en rechazo de peticiones peligrosas y reducción de repeticiones.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multimodales (visión, audio): no disponibles.
- Modo *thinking* explícito: no disponible.

## Casos de uso

- Prototipado de asistentes conversacionales en inglés: el modelo puede mantener diálogos multi-turno dentro de su ventana de 4.096 tokens, suficiente para conversaciones de soporte acotadas y para validar plantillas de chat antes de migrar a modelos mayores.
- Investigación en arquitecturas híbridas SSM/MoE: al ser Apache 2.0 y publicar los logs de entrenamiento, sirve como banco de pruebas reproducible para estudiar el equilibrio entre capas recurrentes y de atención en modelos pequeños.
- Generación de código Python en entornos de baja latencia: con 320M parámetros activos y recurrencia lineal, es adecuado para autocompletado o sugerencias en IDE donde el coste por token importa más que la calidad puntera.
- Filtrado y clasificación de texto en pipelines de datos: su tamaño reducido permite ejecutarlo en CPU o GPU de gama baja para tareas de etiquetado, resumen corto o reescritura de prompts.
- Educación y demos de alineación: el historial completo de SFT y DPO facilita usar el modelo como ejemplo didáctico de cómo se aplica DPO con modelo de referencia congelado y β=0,1.
- Despliegue en hardware de consumo para pruebas de concepto: con ~1 GB en BF16/FP16, cabe en GPU de 8 GB o menos, lo que permite iterar localmente sin infraestructura dedicada.
- Evaluación comparativa de tokenizadores de vocabulario grande: el tokenizador CRAYON Turbo de 206.464 tokens puede estudiarse frente a tokenizadores estándar en tareas de eficiencia de codificación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta métricas de entrenamiento (pérdida y perplejidad): pérdida final de preentrenamiento 4,6473 y perplejidad 104,30 en el paso 821, y pérdida de SFT en torno a 4,0. No hay datos de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: ~1,0-1,4 GB en BF16/FP16 para los pesos declarados de 500M; ~1,4-1,5 GB si se usa el recuento real de safetensors (711M). En FP32, ~2,0-2,8 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para BF16; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son válidas. El modelo se entrenó en slices MIG de NVIDIA B300 SXM6 (`1g.34gb`), pero no requiere ese hardware para inferencia.
- Cabe en GPU de consumo: sí, en tarjetas de 8 GB o menos (por ejemplo, RTX 3060 Ti, RTX 4060, GTX 1660 con cuantización si se genera).
- Opciones de despliegue: PyTorch con `transformers` y `trust_remote_code=True` (el repo requiere `custom_code`); no se documentan pesos GGUF, por lo que llama.cpp u Ollama requerirían conversión propia. vLLM y TGI no están validados en la información disponible.
- Latencia y throughput estimados: no disponibles para inferencia. Solo se conoce el throughput de entrenamiento (7.337 tokens/s en 4 slices MIG), que no es extrapolable a producción.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FORGE-500M-Chat | 500M declarados / 711M reales | 4.096 (16.384 con YaRN) | Híbrida SSM + MHA + MoE | Apache 2.0 | Hugging Face |
| Qwen2.5-0.5B-Instruct | ~494M | 32.768 | Transformer denso | Apache 2.0 | Hugging Face |
| SmolLM2-360M-Instruct | ~362M | 8.192 | Transformer denso | Apache 2.0 | Hugging Face |
| TinyLlama-1.1B-Chat | ~1,1B | 2.048 | Transformer denso | Apache 2.0 | Hugging Face |

La comparación es estructural: FORGE-500M-Chat ofrece una ventana de contexto menor que Qwen2.5-0.5B y SmolLM2, y un preentrenamiento mucho más corto (1,66B tokens frente a billones en los modelos citados). No hay datos de benchmarks que permitan comparar calidad de forma objetiva.

## Limitaciones y advertencias

- Preentrenamiento muy limitado: 1,66B tokens es un volumen bajo para los estándares actuales, lo que implica capacidades de conocimiento factual y razonamiento acotadas y alta propensión a errores en dominios especializados.
- Riesgo de alucinación elevado, especialmente en preguntas factuales, matemáticas complejas y código de producción.
- Solo soporta inglés; no se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- Ventana de contexto nativa de 4.096 tokens; la extensión a 16.384 con YaRN no está validada con benchmarks.
- Discrepancia entre los parámetros declarados (500M) y los reales en safetensors (711M), lo que puede afectar a estimaciones de memoria y a la reproducibilidad de las cifras de la model card.
- Requiere `trust_remote_code=True` y código personalizado; conviene auditar el repositorio antes de ejecutarlo en entornos sensibles.
- Licencia Apache 2.0 permite uso comercial, pero no hay evaluación de seguridad independiente ni garantías de robustez frente a prompts adversarios.
- No se documentan formatos cuantizados oficiales (GGUF, AWQ, GPTQ), lo que complica el despliegue en CPU o en GPUs de muy baja VRAM sin trabajo adicional.
- El modelo no declara soporte de tool calling ni de agentes, por lo que no debe asumirse en pipelines que dependan de function calling.

## Enlaces

- Hugging Face: https://huggingface.co/Phase-Technologies/FORGE-500M-Chat
- Modelo base: https://huggingface.co/Phase-Technologies/forge-500m-base
- Log de entrenamiento (referenciado en la model card): `training_journey.log` dentro del repositorio de Hugging Face
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
