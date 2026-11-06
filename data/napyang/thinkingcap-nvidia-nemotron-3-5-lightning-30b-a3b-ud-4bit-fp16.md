# NapYang/ThinkingCap-NVIDIA-Nemotron-3.5-Lightning-30B-A3B-UD-4bit-fp16

## Resumen

ThinkingCap-NVIDIA-Nemotron-3.5-Lightning-30B-A3B-UD-4bit-fp16 es una cuantización de 4 bits del modelo bottlecapai/ThinkingCap-NVIDIA-Nemotron-3.5-Lightning-30B-A3B, publicada por el usuario NapYang. El modelo base es una adaptación del Nemotron-3.5-Lightning de NVIDIA, construido sobre la arquitectura Nemotron-H, que combina capas Mamba (state space models) con mezcla de expertos (MoE) y atención clásica. Esta versión cuantizada almacena los pesos en float16 pero con precisión efectiva de 4 bits (group_size 64, affine), manteniendo en 8 bits las capas más sensibles como embeddings, lm_head y algunas proyecciones del mixer.

El modelo resuelve el problema de desplegar un modelo de aproximadamente 32.900 millones de parámetros totales en entornos con VRAM limitada. Al ser MoE, solo activa una fracción de los parámetros por token, lo que reduce el coste computacional en inferencia. Con 52 capas, dimensión oculta de 2688, 128 expertos enrutados (6 activos por token) y una ventana de contexto de hasta 262.144 tokens, está orientado a tareas de razonamiento, generación de código y conversación de largo alcance.

Es relevante ahora porque ofrece una vía práctica para ejecutar un modelo de escala 30B con contexto de 256K en GPUs de gama alta de consumo o en una sola GPU profesional, a costa de una pérdida de precisión controlada. La licencia MIT del repositorio facilita su uso comercial, aunque conviene verificar los términos del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Nemotron-H (híbrida: Mamba + MoE con Switch MoE + atención) |
| Parametros totales | 32.913.266.240 (~32,9B) |
| Parametros activos | 6 expertos enrutados de 128 + 1 experto compartido por token (número exacto de parámetros activos no disponible) |
| Longitud de contexto | 262.144 tokens (256K) |
| Tipos de cuantizacion | 4-bit affine, group_size 64, con capas selectivas en 8-bit; pesos almacenados en float16 |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | MIT |
| Formato de pesos | safetensors (4 shards + model-mtp.safetensors) |

## Arquitectura y entrenamiento

La arquitectura Nemotron-H (`NemotronHForCausalLM`, `model_type: nemotron_h`) es un modelo híbrido de 52 capas que intercala bloques Mamba, capas de atención y capas MoE. La atención usa 32 cabezas con solo 2 cabezas KV (GQA), lo que reduce el tamaño del KV cache. El componente MoE emplea 128 expertos enrutados con 6 activos por token más un experto compartido; la dimensión intermedia de los expertos es 1856 y la del experto compartido 3712. El vocabulario es de 131.072 tokens y el modelo incorpora una capa de predicción multi-token (MTP, `num_nextn_predict_layers=1`), útil para decodificación especulativa.

La información disponible no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO en el modelo base. La cuantización fue realizada por NapYang con precisión 4-bit affine (group_size 64) y capas sensibles retenidas en 8-bit para mitigar el error de cuantización; los pesos resultantes se guardan en float16. El modelo requiere `transformers` 4.57.6 o superior para soportar la arquitectura `nemotron_h` y los operadores de Mamba/MoE.

## Capacidades

- Generación de texto y conversación multi-turno con plantilla de chat (`chat_template.jinja`) que soporta roles system, user y assistant.
- Razonamiento con modo de pensamiento activable mediante el flag `enable_thinking` en la plantilla de chat.
- Soporte de tool calling / function calling a través del campo `tools` de la plantilla de chat.
- Predicción multi-token (MTP) para acelerar la decodificación.
- Capacidades multilingües limitadas a inglés y chino según los metadatos del repositorio.
- Contexto largo de hasta 256K tokens, adecuado para documentos extensos y conversaciones prolongadas.
- No se documentan capacidades de visión, audio ni otras modalidades en la información disponible.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con historial extenso gracias a su ventana de 256K tokens, manteniendo coherencia en diálogos largos sin truncar el contexto.
- Generación de código en producción: el soporte de tool calling permite integrarlo en pipelines de CI/CD para autocompletar, revisar o generar parches, con el modo thinking activable para tareas de razonamiento complejas.
- Asistentes con agentes multi-paso: la plantilla de chat con `tools` y el modo de pensamiento facilitan la planificación de pasos intermedios y la invocación de funciones externas en flujos de agentes.
- Análisis de documentos largos: con 256K tokens de contexto se pueden procesar informes, contratos o bases de código completas en una sola pasada, resumiendo o extrayendo información estructurada.
- Despliegue en hardware limitado: al ser una cuantización 4-bit de un modelo 30B, permite servir inferencia en una sola GPU de gama alta de consumo, reduciendo costes frente a la versión fp16/bf16.
- Razonamiento asistido en investigación: el modo thinking y la arquitectura híbrida Mamba-MoE permiten abordar problemas de razonamiento con contexto largo, útil para borradores técnicos y exploración de hipótesis.
- Traducción y generación bilingüe inglés-chino: los idiomas declarados permiten tareas de traducción y redacción en ambos idiomas, aunque sin cobertura de otros idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 19,7 GB en disco con pesos en float16 y cuantización efectiva 4-bit; se recomienda al menos 24 GB de VRAM para cargar el modelo completo con `device_map="auto"`, y más margen para KV cache y contexto largo.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para despliegues ajustados; el contexto de 256K requiere VRAM adicional significativa.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) o GPUs con 24 GB o más, con margen limitado para contextos largos; en GPUs de 16 GB no es viable sin descarga a CPU.
- Opciones de despliegue: `transformers` con `accelerate` y `device_map="auto"` es la vía documentada; no se confirma soporte en vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles; dependen de la implementación de Mamba/MoE y de la GPU empleada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| ThinkingCap-NVIDIA-Nemotron-3.5-Lightning-30B-A3B-UD-4bit-fp16 (este) | ~32,9B totales, MoE | 256K | MIT | Cuantización 4-bit, pesos en float16, idiomas en/zh |
| bottlecapai/ThinkingCap-NVIDIA-Nemotron-3.5-Lightning-30B-A3B (base) | ~32,9B totales, MoE | 256K | no disponible | Versión sin cuantizar; mayor precisión y mayor huella de VRAM |
| Alternativas comparables de la misma categoría | no disponible | no disponible | no disponible | No se dispone de datos de otros modelos en la información proporcionada |

## Limitaciones y advertencias

- La cuantización 4-bit introduce pérdida de precisión; en tareas de matemáticas complejas o generación de código fino conviene comparar con la versión fp16/bf16 del modelo base.
- Riesgo de alucinación inherente a los modelos generativos; no se documentan medidas específicas de mitigación en la información disponible.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está garantizado ni documentado.
- El contexto máximo de 256K puede verse reducido en la práctica por la VRAM disponible y por la implementación del cache de Mamba/KV.
- Requiere una versión de `transformers` que soporte `nemotron_h` (4.57.6 o superior) y los operadores de Mamba/MoE; versiones anteriores fallarán al cargar el modelo.
- La licencia del repositorio es MIT, pero el uso debe respetar también la licencia original del modelo base bottlecapai/ThinkingCap-NVIDIA-Nemotron-3.5-Lightning-30B-A3B, cuyos términos no se detallan en la información disponible.
- Modelo con pocas descargas (20) y sin likes; no hay evidencia de validación comunitaria extensa de la calidad de esta cuantización concreta.
- No se documentan sesgos específicos; al derivarse de un modelo entrenado principalmente en inglés y chino, es probable que herede sesgos de esos corpus.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/NapYang/ThinkingCap-NVIDIA-Nemotron-3.5-Lightning-30B-A3B-UD-4bit-fp16
- Modelo base: https://huggingface.co/bottlecapai/ThinkingCap-NVIDIA-Nemotron-3.5-Lightning-30B-A3B
- Papers, blogs, repos y demos adicionales: no disponible en la información proporcionada.
