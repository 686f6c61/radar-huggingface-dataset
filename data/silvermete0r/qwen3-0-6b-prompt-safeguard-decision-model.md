# silvermete0r/qwen3-0.6b-prompt-safeguard-decision-model

## Resumen

Qwen3-0.6B Prompt Safeguard es una familia de nueve clasificadores de seguridad de prompts construidos sobre el modelo base Qwen/Qwen3-0.6B y entrenados con el dataset nvidia/Nemotron-Safety-Guard-Dataset-v3. Cada checkpoint realiza dos tareas de forma conjunta: una clasificación binaria de seguridad del prompt (seguro frente a inseguro) mediante una cabeza de riesgo calibrada, y una categorización multietiqueta en 23 categorías de daño alineadas con la taxonomía de NVIDIA. Lo desarrolla el usuario silvermete0r y se publica bajo licencia Apache 2.0.

La aportación principal no es un modelo nuevo desde cero, sino un estudio sistemático de poda por profundidad sobre el backbone transformer de Qwen3-0.6B (dimensión oculta 1024, 28 bloques). El repositorio empaqueta la mejor estrategia de poda empírica en cada profundidad: poda por influencia de bloque (Block Influence) en L24 y L20, y truncamiento superior (Top-Down) en L28, L16, L12, L8, L4, L2 y L1. El resultado va desde los 596,85 M de parámetros del modelo completo hasta los 172,11 M del modelo de un solo bloque, con reducciones de latencia de hasta 11,5 veces y aumentos de throughput por lote de hasta 22,8 veces.

Es relevante para despliegues de moderación de contenido en producción donde el coste por inferencia y la latencia importan: permite elegir un punto de la frontera de Pareto entre precisión y coste computacional, desde un clasificador de guardrail ligero en el borde hasta una versión completa en servidor. El modelo es multilingüe (12 idiomas declarados) y está pensado como componente de filtrado previo o posterior en pipelines de LLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen3) con backbone podado en profundidad y cabeza de clasificación multitarea (atención enmascarada + tronco compartido + dos cabezas lineales) |
| Parametros totales | 596,85 M (L28) hasta 172,11 M (L1), según profundidad |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen3-0.6B soporta 32 768 tokens; la model card no especifica el contexto efectivo de entrenamiento) |
| Tipos de cuantizacion | no disponible (los pesos se publican en BF16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en, zh, es, fr, de, ja, ko, ar, pt, ru, it, hi |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (backbone) y .pt (custom_heads.pt para las cabezas) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-0.6B, un transformer decoder de 28 bloques con dimensión oculta 1024. Sobre el backbone podado se añade una cabeza de clasificación de 0,79 M de parámetros (unos 1,5 MB en BF16) con tres componentes: una representación dual de secuencia que concatena el estado oculto del último token normalizado con RMSNorm y un pooling de atención enmascarado aprendido sobre todos los tokens (2048 dimensiones en total); un tronco de proyección compartido con la secuencia Linear(2048→384) → GELU → Dropout(0,15) → LayerNorm(384); y dos cabezas de predicción, una lineal de 384 a 1 para el riesgo binario y otra de 384 a 23 para la taxonomía multietiqueta de daño.

El entrenamiento se realiza sobre nvidia/Nemotron-Safety-Guard-Dataset-v3. La model card no detalla el número de tokens, la composición exacta del dataset ni si hubo RLHF o DPO; sí indica que los umbrales de decisión binaria se calibran sobre validación (tau_risk_opt_f1, tau_risk_fpr10, tau_risk_fpr05) y que existen umbrales por categoría. La innovación técnica destacable es la poda por profundidad: la poda por Block Influence se aplica en L24 y L20 (reteniendo el 99,30 % y el 99,32 % del Macro-F1 del L28 completo y preservando bloques tardíos de alta importancia como el 27), mientras que el truncamiento Top-Down se usa en el resto de profundidades. El repositorio incluye layer_importance_scores.json con el perfil de saliencia de bloques L0–L27.

## Capacidades

- Clasificación binaria de seguridad de prompts: distingue prompts seguros de inseguros con umbral calibrado sobre validación.
- Categorización multietiqueta de daño en 23 categorías según la taxonomía de NVIDIA Nemotron Safety Guard.
- Multilingüismo declarado en 12 idiomas: inglés, chino, español, francés, alemán, japonés, coreano, árabe, portugués, ruso, italiano e hindi.
- Despliegue a varias profundidades con un único formato de cabezas, lo que permite intercambiar checkpoints sin cambiar el código de inferencia.
- Umbrales de baja tasa de falsos positivos (FPR 10 % y FPR 5 %) para entornos donde el coste de bloquear tráfico legítimo es alto.
- Integración con transformers y con el Hub de Hugging Face (endpoints_compatible).
- No soporta generación de texto, tool calling ni agentes: es un clasificador, no un modelo generativo.

## Casos de uso

- Filtrado previo de prompts en un chatbot: el checkpoint L12 o L8 se ejecuta antes del LLM principal para bloquear entradas inseguras con latencia mínima, reduciendo el coste de inferencia del modelo grande.
- Moderación de contenido en plataformas UGC: la cabeza de 23 categorías permite etiquetar comentarios o publicaciones por tipo de daño y enrutar cada caso al flujo de revisión adecuado.
- Guardrail de salida en pipelines RAG: clasificar la consulta del usuario y, con los umbrales de baja FPR, decidir si se permite recuperar y responder sin bloquear consultas legítimas.
- Despliegue en el borde o en CPU: el checkpoint L1 (172,11 M de parámetros) o L2 (187,84 M) caben en entornos con recursos muy limitados y sirven como primera línea de defensa.
- Evaluación de seguridad de datasets: clasificar grandes volúmenes de prompts sintéticos o reales para medir la prevalencia de categorías de daño antes de usarlos en entrenamiento.
- Servicio de clasificación por lotes de alto throughput: el L8 ofrece hasta 22,8 veces más throughput por lote que el L28, adecuado para reprocesar históricos de conversaciones.
- Enrutado multilingüe: al cubrir 12 idiomas, permite aplicar una única política de moderación en productos con base de usuarios internacional.

## Benchmarks y rendimiento

La model card no publica una tabla numérica de benchmarks estándar (MMLU, HumanEval, GSM8K) porque el modelo es un clasificador, no un generador. Los datos de rendimiento disponibles son relativos al propio modelo completo:

| Metrica | Valor |
|---|---|
| Macro-F1 retenido en L24 (Block Influence) | 99,30 % del L28 |
| Macro-F1 retenido en L20 (Block Influence) | 99,32 % del L28 |
| Reduccion de latencia maxima (L1) | hasta 11,5x menor |
| Aumento de throughput por lote (L1) | hasta 22,8x mayor |
| Reduccion de parametros L1 | -71,16 % (172,11 M frente a 596,85 M) |
| Reduccion de parametros L12 | -42,17 % (345,15 M) |

No se han publicado resultados absolutos de F1, precisión o recall en la información disponible.

## Requisitos de hardware

- VRAM estimada: el L28 completo en BF16 ocupa aproximadamente 1,2 GB de pesos; el L1, unos 0,35 GB. Con overhead de activaciones y cabezas, un L28 en BF16 cabe holgadamente en 4 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 4 GB para el L28 en BF16; para el L1 o L2 basta con CPU o GPUs integradas en muchos casos.
- Cabe en GPU de consumo: sí, en todas las RTX recientes (3060, 4060, 4090) y en muchas iGPU para los checkpoints podados.
- Opciones de despliegue: transformers con PyTorch (código de ejemplo en la model card); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y al no publicarse pesos GGUF no es desplegable directamente en llama.cpp.
- Latencia y throughput: la model card reporta mejoras relativas de hasta 11,5 veces en latencia y 22,8 veces en throughput por lote en L1 frente a L28, pero no da valores absolutos en milisegundos ni peticiones por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-0.6B Prompt Safeguard (este) | 172 M – 597 M | no disponible | Clasificacion de seguridad + taxonomia 23 categorias | Apache 2.0 | Hugging Face |
| Llama Guard 3 (8B) | 8 000 M | 128 000 | Clasificacion de seguridad | Llama 3 Community License | Hugging Face |
| ShieldGemma (2B / 9B) | 2 000 M / 9 000 M | 8 000 | Clasificacion de seguridad | Gemma Terms of Use | Hugging Face |
| NVIDIA Nemotron Safety Guard | no disponible | no disponible | Clasificacion de seguridad | no disponible | Hugging Face |

La comparación es orientativa: este modelo es entre 3 y 45 veces más pequeño que las alternativas, lo que reduce coste y latencia a cambio de una capacidad de razonamiento limitada al backbone de 0,6 B. No se dispone de datos de benchmarks comparativos en la información proporcionada.

## Limitaciones y advertencias

- Es un clasificador, no un generador: no puede explicar sus decisiones ni mantener conversaciones, solo devuelve etiquetas y puntuaciones.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de falsos negativos y falsos positivos en la clasificación; la calibración de umbrales depende del dominio de validación.
- El backbone de 0,6 B limita la comprensión de prompts largos, ambiguos o con ataques adversarios sofisticados; los checkpoints podados agravan esta limitación.
- La model card no documenta sesgos por idioma ni por categoría; el rendimiento en los 12 idiomas declarados puede no ser homogéneo.
- La ventana de contexto efectiva de entrenamiento no se especifica; no se garantiza el comportamiento con prompts muy largos.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; el modelo base Qwen3-0.6B también es Apache 2.0.
- No hay pesos cuantizados publicados ni integración con runtimes de inferencia optimizados, lo que obliga a usar PyTorch y limita el despliegue en entornos no Python.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validación independiente por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/silvermete0r/qwen3-0.6b-prompt-safeguard-decision-model
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Dataset Nemotron-Safety-Guard-Dataset-v3: https://huggingface.co/datasets/nvidia/Nemotron-Safety-Guard-Dataset-v3
- Paper Qwen3 (arXiv:2505.09388): https://arxiv.org/abs/2505.09388
- Paper referenciado arXiv:2508.01710: https://arxiv.org/abs/2508.01710
- Paper referenciado arXiv:2310.17389: https://arxiv.org/abs/2310.17389
- Paper referenciado arXiv:2504.04377: https://arxiv.org/abs/2504.04377
