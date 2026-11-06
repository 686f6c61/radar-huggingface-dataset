# open-sci/sft__ot30k_Qwen2.5-1.5B

## Resumen

`sft__ot30k_Qwen2.5-1.5B` es un ajuste fino supervisado (SFT) del modelo base Qwen2.5-1.5B, publicado por la organizacion open-sci en Hugging Face. Se trata de un modelo de generacion de texto de 1.543.714.304 parametros (aproximadamente 1,5 mil millones), entrenado con la libreria LLaMA-Factory sobre un subconjunto de 30.000 muestras del dataset Open Thoughts (open-thoughts3-1.2_m_30000_samples). El modelo esta pensado para generacion conversacional y de razonamiento, y se distribuye en formato safetensors compatible con transformers.

La relevancia de este modelo radica en su caracter de experimento de investigacion: es un ajuste fino completo (full fine-tuning, no LoRA) realizado sobre 32 dispositivos GPU con un batch total de 128 y 5 epocas, lo que sugiere un esfuerzo de entrenamiento considerable para su tamano. Sin embargo, la model card es practicamente vacia en cuanto a documentacion de uso, datos de evaluacion y limitaciones, y no se han publicado resultados de benchmarks.

El modelo hereda la arquitectura y capacidades del Qwen2.5-1.5B original, pero no hay informacion publicada sobre los idiomas soportados, la licencia concreta (figure como "other") ni el rendimiento tras el ajuste. Es, por tanto, un artefacto de investigacion util para quien quiera reproducir o inspeccionar un pipeline de SFT sobre Open Thoughts, pero con documentacion insuficiente para uso en produccion sin evaluacion previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), ajuste fino completo |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizacion GGUF/AWQ no publicada) |
| Idiomas soportados | no disponible |
| Licencia | other (no especificada) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-1.5B, un transformer decoder-only con atencion causal estandar de la familia Qwen2. Sobre esa base se aplico un ajuste fino supervisado completo (tag `full` en LLaMA-Factory), no un adaptador LoRA. El entrenamiento se realizo sobre el dataset `open-thoughts_open_thoughts3-1.2_m_30000_samples`, un subconjunto de 30.000 muestras de Open Thoughts orientado a datos de razonamiento y cadenas de pensamiento. No se documenta el numero total de tokens de entrenamiento ni la composicion detallada del dataset.

Los hiperparametros declarados incluyen learning rate de 4e-05, scheduler coseno con warmup del 10 %, 5 epocas, batch total de 128 (batch size 1 con acumulacion de gradientes de 4 en 32 dispositivos) y optimizador AdamW fused con betas (0,9; 0,999). No se menciona uso de RLHF, DPO ni ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, etc.). Las versiones de framework son Transformers 4.55.0, PyTorch 2.10.0+cu128, Datasets 4.8.4 y Tokenizers 0.21.4.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo base Qwen2.5-1.5B.
- Razonamiento y cadenas de pensamiento, presumiblemente reforzados por el dataset Open Thoughts (no verificado con evaluaciones).
- Generacion de codigo y matematicas basicas, segun las capacidades del modelo base (no evaluadas tras el ajuste).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, thinking mode explicito): no disponible.

## Casos de uso

- Investigacion sobre ajuste fino supervisado: el modelo sirve como referencia reproducible de un pipeline LLaMA-Factory con full fine-tuning sobre Open Thoughts, util para comparar hiperparametros y estrategias de SFT.
- Generacion de respuestas conversacionales en prototipos: al ser un modelo de 1,5B, puede desplegarse en entornos de desarrollo para probar flujos de chat antes de escalar a modelos mayores.
- Experimentos de destilacion de razonamiento: las 30.000 muestras de Open Thoughts permiten estudiar como un modelo pequeno absorbe patrones de cadena de pensamiento de modelos mayores.
- Evaluacion comparativa de datasets de razonamiento: util para medir el impacto de Open Thoughts frente a otros corpus de SFT en tareas de logica y matematicas.
- Generacion de texto en entornos con recursos limitados: su tamano permite ejecucion en GPU de consumo si se cuantiza, aunque no se publican pesos cuantizados.
- Base para posteriores ajustes (continued pretraining o DPO): al ser un checkpoint completo, puede servir como punto de partida para etapas adicionales de alineamiento.

## Benchmarks y rendimiento

La model card declara un `model-index` con el nombre del modelo pero la lista de resultados esta vacia. No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 3,1 GB solo para pesos, mas overhead de activaciones y cache KV (estimacion tipica de 4-6 GB en funcion de la longitud de contexto).
- VRAM estimada en cuantizacion de 8 bits: alrededor de 1,6-2 GB para pesos; en 4 bits, alrededor de 1-1,5 GB (estimaciones teoricas, no verificadas con pesos publicados).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16 (RTX 3060 12 GB, RTX 4060 Ti, RTX 4090, A100, H100). Para cuantizacion 4 bits, cabe en GPUs de 4-6 GB.
- Cabe en GPU de consumo: si, en la mayoria de RTX modernas con 8 GB o mas en fp16, y en GPUs de gama baja con cuantizacion.
- Opciones de despliegue: transformers (nativo), text-generation-inference (tag `text-generation-inference` presente), vLLM, llama.cpp/Ollama si se generan pesos GGUF (no publicados).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| sft__ot30k_Qwen2.5-1.5B (este) | 1,54B | no disponible | other | Hugging Face, safetensors |
| Qwen2.5-1.5B (base) | 1,54B | 32.768 tokens (segun documentacion publica de Qwen) | Apache 2.0 (segun Qwen) | Hugging Face, amplia disponibilidad |
| Qwen2.5-1.5B-Instruct | 1,54B | 32.768 tokens (segun documentacion publica de Qwen) | Apache 2.0 (segun Qwen) | Hugging Face, amplia disponibilidad |
| SmolLM2-1.7B-Instruct | 1,7B | 8.192 tokens (segun documentacion publica) | Apache 2.0 | Hugging Face |

Nota: los datos de contexto y licencia de los modelos comparables provienen de su documentacion publica; no se dispone de evaluaciones del modelo de open-sci para comparar rendimiento.

## Limitaciones y advertencias

- Documentacion practicamente inexistente: la model card indica "More information needed" en descripcion, usos previstos, datos de evaluacion y limitaciones.
- Licencia "other" sin texto especificado: no queda claro si se permite uso comercial; es imprescindible contactar con el autor antes de cualquier despliegue productivo.
- Sin benchmarks publicados: no hay evidencia de que el ajuste fino mejore al modelo base; podria incluso degradar capacidades si el dataset no esta bien alineado.
- Riesgo de alucinacion: inherente a modelos de 1,5B y no evaluado tras el ajuste.
- Idiomas soportados no documentados: no se puede asumir multilingue aunque el base lo sea.
- Sesgos: no evaluados; el dataset Open Thoughts puede introducir sesgos de dominio (razonamiento matematico/logico) en detrimento de otros.
- Contexto maximo no documentado: no se debe asumir la ventana de 32K del Qwen2.5 base sin verificacion.
- Modelo de investigacion con 176 descargas y 0 likes: no hay senal de validacion por parte de la comunidad.
- Entrenado con 5 epocas sobre 30.000 muestras: posible sobreajuste al dataset, no evaluado.

## Enlaces

- Hugging Face: https://huggingface.co/open-sci/sft__ot30k_Qwen2.5-1.5B
- Dataset Open Thoughts (referenciado en la model card): https://huggingface.co/datasets/open-thoughts/OpenThoughts3-1.2M (referencia al corpus original; el subconjunto exacto no esta enlazado)
- LLaMA-Factory: https://github.com/hiyouga/LLaMA-Factory
- Qwen2.5-1.5B (modelo base): https://huggingface.co/Qwen/Qwen2.5-1.5B
- Repositorio de la organizacion open-sci: https://huggingface.co/open-sci
