# adpretko/celerity-271m-8k-tpp-ablation-ad0p8-ild-tpp4

## Resumen

Celerity 271M 8K — TPP ablation — ad0.8_ild_tpp4 es un checkpoint de investigación del modelo Celerity, entrenado originalmente en hardware Cerebras y convertido posteriormente al formato de Hugging Face. Lo publica el usuario `adpretko` y forma parte de una ablación sistemática sobre la tasa de dropout de atención, no de un modelo pensado para producción. El nombre del experimento (`ad0.8_ild_tpp4`) codifica el punto final de la tasa de dropout (0,8) y un escalado lineal por capas, junto con un presupuesto nominal de 4 tokens por parámetro.

El modelo resuelve un problema muy acotado: aislar el efecto de una programación de dropout de atención dependiente de la capa sobre el entrenamiento de un transformer pequeño con contexto largo. Con 271 millones de parámetros y una longitud máxima de secuencia de 8.192 tokens, emplea embeddings posicionales ALiBi, lo que le permite extrapolar a secuencias largas sin embeddings posicionales aprendidos. Se entrenó sobre 1.083.113.472 tokens del dataset CommonPile (pool TPP corregido sin repeticiones) durante 4.722 pasos.

Su relevancia es metodológica, no práctica: sirve como punto de comparación dentro de una familia de ablaciones y como ejemplo de conversión de checkpoints Cerebras a `safetensors` con código personalizado. No hay pipeline declarado, ni licencia, ni idiomas especificados, ni métricas de evaluación publicadas, por lo que cualquier uso más allá de la inspección experimental debe hacerse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con embeddings posicionales ALiBi (según model card) |
| Parametros totales | 271M (según nombre del modelo) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens (longitud máxima de secuencia en entrenamiento) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Pesos convertidos a formato Hugging Face (`safetensors` presumiblemente, repo de 0,5 GB); requiere `trust_remote_code=True` |

## Arquitectura y entrenamiento

Se trata de un transformer decoder-only de 271 millones de parámetros con embeddings posicionales ALiBi, diseñado para secuencias de hasta 8.192 tokens. La innovación del experimento no está en la arquitectura sino en el régimen de regularización: el dropout de atención sigue una programación lineal dependiente de la capa cuyo punto final es 0,8 (no es una probabilidad uniforme de dropout). El dropout residual, el stochastic depth y el LayerDrop están todos a 0,0. El entrenamiento usó una tasa de aprendizaje pico de 0,15, weight decay de 0,003618281275599213, tamaño de batch global de 28 y un `tau_ema` de 0,39019386207371326, durante 4.722 pasos (1.083.113.472 tokens) sobre 2 sistemas CSX.

El dataset es CommonPile, en concreto el pool TPP corregido sin repeticiones. El checkpoint de origen es `checkpoint_4722.mdl`, generado con el runtime `cbcore 2.6.0` y convertido con el commit `0e3d5d375695293479df9d2a3717f05f71a345b4`. No se documenta RLHF, DPO ni ninguna fase de alineación posterior al preentrenamiento; es un checkpoint base de ablación. El dropout se desactiva con `model.eval()` durante la evaluación ordinaria.

## Capacidades

- Generación de texto autoregresiva propia de un modelo de lenguaje decoder-only preentrenado.
- Manejo de contexto largo de hasta 8.192 tokens gracias a ALiBi.
- Capacidad multilingüe: no documentada; el corpus CommonPile es mayoritariamente inglés, pero no se especifica.
- Tool calling / function calling: no documentado.
- Soporte de agentes o razonamiento multi-paso: no documentado.
- Modo thinking, visión o audio: no disponible.
- Alineación instruccional: no disponible (checkpoint base sin fase de instrucción documentada).

## Casos de uso

- Estudio de ablaciones de dropout de atención: el checkpoint permite reproducir y comparar el efecto de la programación lineal de dropout con punto final 0,8 frente a otras variantes de la misma familia.
- Investigación sobre regularización en transformers pequeños: útil para analizar cómo interactúan dropout de atención, weight decay y tasas de aprendizaje altas (0,15) en modelos de 271M.
- Evaluación de ALiBi en contextos de 8K: sirve para medir degradación de perplejidad al extender la ventana más allá de la longitud de entrenamiento.
- Reproducción de pipelines Cerebras a Hugging Face: el checkpoint y el commit de conversión documentado permiten validar herramientas de conversión de `cbcore` a `safetensors`.
- Generación de texto de bajo coste en experimentación: con 271M de parámetros y 0,5 GB de pesos, cabe en cualquier GPU consumer para pruebas de generación rápida.
- Docencia y experimentos de laboratorio: modelo pequeño y con hiperparámetros completamente documentados, adecuado para enseñar dinámica de entrenamiento y regularización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: en torno a 0,6 GB solo de pesos, más overhead de activaciones y caché KV; viable en GPUs con 4 GB o más.
- VRAM estimada en FP32: aproximadamente 1,1 GB de pesos.
- Cuantización: no se ofrecen pesos GGUF ni cuantizados; habría que generarlos a partir de los pesos originales.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es suficiente; también A100/H100 para lotes grandes o evaluación sistemática.
- Cabe en GPU consumer: sí, con margen amplio.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es la vía documentada; vLLM, llama.cpp, Ollama o TGI no están verificados para este checkpoint concreto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Celerity 271M 8K (este) | 271M | 8.192 | No disponible | Hugging Face, requiere `trust_remote_code` |
| GPT-2 medium | 355M | 1.024 | MIT | Amplia (transformers, GGUF, etc.) |
| Pythia-410M | 410M | 2.048 | Apache 2.0 | Amplia |
| TinyLlama-1.1B | 1.1B | 2.048 | Apache 2.0 | Amplia |

La comparativa es aproximada: este checkpoint no publica métricas, por lo que no puede contrastarse su rendimiento frente a estas alternativas. Su ventaja diferencial es el contexto de 8K con ALiBi en un tamaño muy reducido; su desventaja es la ausencia de licencia, evaluación y soporte de herramientas estándar.

## Limitaciones y advertencias

- Checkpoint de ablación: no está pensado para uso en producción ni como asistente.
- Sin licencia declarada: no hay autorización explícita para uso comercial; conviene contactar con el autor antes de cualquier despliegue.
- Sin benchmarks ni evaluación de calidad publicados: se desconoce su perplejidad y su comportamiento real.
- Sesgos desconocidos: el corpus CommonPile no está analizado en esta ficha y no se documenta filtrado de sesgos.
- Riesgo de alucinación alto: al ser un modelo base de 271M sin alineación, generará texto plausible pero no verificado.
- Idiomas no documentados: probablemente limitado al inglés del corpus de entrenamiento.
- Requiere `trust_remote_code=True`: implica ejecutar código del repositorio, con el riesgo de seguridad asociado.
- El dropout de atención con punto final 0,8 es una configuración extrema de ablación; no debe interpretarse como una receta recomendada de entrenamiento.
- Sin pipeline declarado: la integración con `transformers` puede requerir pasos manuales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/adpretko/celerity-271m-8k-tpp-ablation-ad0p8-ild-tpp4
- Repositorio CommonPile (dataset citado): no disponible en la información proporcionada.
- Paper o blog de Celerity: no disponible en la información proporcionada.
- Repositorio del runtime `cbcore`: no disponible en la información proporcionada.
