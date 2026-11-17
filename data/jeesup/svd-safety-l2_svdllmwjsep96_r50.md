# Jeesup/svd-safety-l2_svdllmwjsep96_r50

## Resumen

`svd-safety-l2_svdllmwjsep96_r50` es un checkpoint de investigación derivado de `meta-llama/Llama-2-7b-chat-hf` (7B parámetros, transformer decoder-only) al que se le ha aplicado una compresión SVD-LLM que elimina el 50,00 % de los parámetros densos, seguida de una recuperación con LoRA en dos etapas (U y V secuenciales). Lo publica el usuario de Hugging Face Jeesup como artefacto de un estudio sobre cómo la compresión SVD degrada el comportamiento de seguridad y qué regla de selección de componentes lo repara mejor.

El modelo no es un asistente de propósito general: es una celda concreta de una rejilla experimental sobre reglas de selección y presupuestos de compresión. El conjunto de calibración combina utilidad (WikiText-2) y seguridad (respuestas de rechazo de WildJailbreak generadas por el propio Llama-2-7b-chat), con una proporción efectiva de posiciones de seguridad de 0,0606.

Su relevancia es metodológica: permite medir el compromiso entre utilidad y seguridad bajo compresión (perplejidad en WikiText-2 de 13,6993, precisión zero-shot media de 0,4561 en 7 tareas, ASR de 0,0115 en AdvBench y 0,0192 en StrongREJECT), y sirve como referencia para quien investigue interpretabilidad, compresión de modelos o robustez frente a jailbreaks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), comprimido mediante SVD-LLM |
| Parametros totales | 6.738.415.616 (fracción resultante 0,4999 respecto al denso) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada de Llama-2-7b-chat) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | Llama 2 Community License |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

Parte de `meta-llama/Llama-2-7b-chat-hf`, un transformer decoder-only de 7B parámetros. Sobre él se aplica SVD-LLM con el SVD blanqueado de los autores (repo `AIoT-MLSys-Lab/SVD-LLM`) usando un único conjunto de calibración agrupado: `S S^T = sum_WikiText x x^T + sum_safety x x^T`. La parte de utilidad son 255 ventanas de 2048 tokens del train de WikiText-2 (muestreo de SVD-LLM, semilla 42, todas las posiciones); la parte de seguridad son los primeros 96 de 512 prompts de train de WildJailbreak (vanilla y adversarial dañinos) con los rechazos propios de Llama-2-7b-chat (orden con semilla 42, una conversación por muestra desempacada, 33 679 posiciones, todas las posiciones). La proporción efectiva de posiciones de seguridad es 0,0606.

La compresión elimina el 50,00 % de los parámetros (semilla 42). Después se aplica la recuperación de etapa 2 de SVD-LLM con LoRA secuencial (primero U, luego V) sobre `alpaca-cleaned`, con r=8, alpha=16, 2 épocas, learning rate 1e-4, batch 64, cutoff 256 y precisión bf16. No se documenta en la información disponible ningún proceso de RLHF o DPO adicional más allá del que ya incorpora el modelo base.

## Capacidades

- Generación de texto conversacional, heredada de Llama-2-7b-chat.
- Razonamiento y respuesta a instrucciones en inglés (idiomas exactos no disponibles).
- Comportamiento de rechazo ante peticiones dañinas, medido con AdvBench y StrongREJECT.
- Capacidad de servir como sujeto experimental para medir seguridad bajo compresión.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- No se documenta capacidad multilingüe específica.

## Casos de uso

- Investigación sobre compresión de modelos: sirve como celda de referencia para comparar reglas de selección de componentes SVD frente a otros checkpoints de la misma rejilla, midiendo perplejidad y precisión zero-shot.
- Evaluación de robustez frente a jailbreaks: con ASR de 0,0115 en AdvBench y 0,0192 en StrongREJECT bajo el juez HarmBench, permite estudiar cómo varía la tasa de éxito de ataque al comprimir.
- Análisis de sobre-rechazo: el 0,6087 de sobre-rechazo macro medido con WildGuard es un dato útil para estudiar el coste de calibración con datos de seguridad.
- Reproducibilidad de pipelines SVD-LLM: el checkpoint y su procedencia documentada (semilla, ventanas, proporciones) permiten replicar el experimento con el código de `AIoT-MLSys-Lab/SVD-LLM`.
- Estudio de recuperación con LoRA: la configuración de etapa 2 (r=8, alpha=16, 2 épocas, alpaca-cleaned) sirve de base para comparar estrategias de recuperación tras compresión.
- Docencia y divulgación: ejemplo tangible del compromiso utilidad-seguridad en modelos comprimidos, con métricas publicadas y trazabilidad completa del calibrado.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,0115 |
| StrongREJECT ASR (juez HarmBench) | 0,0192 |
| Sobre-rechazo macro (WildGuard) | 0,6087 |
| Perplejidad en WikiText-2 | 13,6993 |
| Precisión media zero-shot (7 tareas, acc_norm donde se reporta) | 0,4561 |

No se proporcionan en la información disponible resultados comparativos con otros modelos ni desglose por tarea.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 13,5 GB solo de pesos, más overhead de activaciones y caché KV; en la práctica, 16 GB o más para contexto corto.
- Cuantización a 8 bits: en torno a 7 GB de pesos; a 4 bits: en torno a 3,5-4 GB, aunque el autor no documenta cuantizaciones oficiales.
- GPU recomendadas: A100 40/80 GB, H100 para despliegues concurrentes; RTX 4090 (24 GB) para bf16 en contexto moderado; RTX 3090/4080 (16-24 GB) para fp16 con contexto limitado.
- Cabe en GPU de consumo con cuantización (RTX 3060 12 GB en 4-8 bits, con margen ajustado).
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`); llama.cpp/Ollama requerirían conversión a GGUF, no documentada por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| svd-safety-l2_svdllmwjsep96_r50 | 6.738.415.616 | no disponible | Llama 2 | Checkpoint comprimido de investigación, 50 % de parámetros eliminados |
| meta-llama/Llama-2-7b-chat-hf | 7B | no disponible | Llama 2 | Modelo base sin comprimir; referencia de utilidad y seguridad |
| Otros checkpoints de la rejilla del autor | no disponible | no disponible | Llama 2 | Distintas reglas de selección y presupuestos; no se listan en la información disponible |

No se dispone de datos comparativos de rendimiento frente a estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El propio autor advierte que varias celdas de la rejilla están deliberadamente degradadas en seguridad respecto a Llama-2-7b-chat; la compresión por sí sola eleva la tasa de éxito de ataque.
- Es un artefacto de investigación, no un asistente desplegable; debe evaluarse antes de extraer conclusiones.
- El sobre-rechazo macro de 0,6087 indica una tendencia alta a rechazar peticiones legítimas.
- Riesgo de alucinación inherente a Llama-2-7b-chat, no cuantificado en la información disponible.
- Idiomas soportados no documentados; el calibrado y la recuperación se hicieron con datos en inglés (WikiText-2, WildJailbreak, alpaca-cleaned).
- Uso comercial sujeto a la Llama 2 Community License, con `LICENSE.txt` y `USE_POLICY.md` incluidos en el repositorio; es un derivado de Llama 2 y está obligado por sus términos.
- Solo 2 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria ni reportes de terceros.
- No se documentan cuantizaciones oficiales ni conversión a GGUF.

## Enlaces

- Hugging Face: https://huggingface.co/Jeesup/svd-safety-l2_svdllmwjsep96_r50
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Repositorio de SVD-LLM citado por el autor: https://github.com/AIoT-MLSys-Lab/SVD-LLM
- Llama 2 Community License: https://ai.meta.com/llama/license/
- Paper de Llama 2: https://arxiv.org/abs/2307.09288
