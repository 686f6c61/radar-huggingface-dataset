# adpretko/celerity-271m-8k-tpp-ablation-ad0p2-ild-tpp2

## Resumen

Celerity 271M 8K es un checkpoint de investigación de 271 millones de parámetros entrenado por Cerebras y convertido al formato de Hugging Face por el usuario adpretko. Se trata de una ablación concreta dentro de una familia de experimentos sobre el modelo Celerity, en este caso variando el schedule de dropout de atención con un valor extremo de 0,2 y un escalado lineal por capas. El modelo no está pensado como un asistente generalista, sino como una pieza de un estudio controlado sobre regularización y dinámica de entrenamiento.

El entrenamiento se realizó sobre el pool TPP (tokens per parameter) corregido y sin repeticiones del dataset CommonPile, con un presupuesto nominal de 2 tokens por parámetro y una longitud máxima de secuencia de 8192 tokens. El checkpoint final corresponde al paso 3305, con 541.491.200 tokens vistos en total, lo que en la práctica sitúa el cómputo muy por debajo de lo habitual en modelos de producción de tamaño similar.

Su relevancia es fundamentalmente metodológica: permite estudiar el efecto de tasas de dropout de atención no nulas y de schedules dependientes de la capa en un transformer con embeddings posicionales ALiBi y contexto largo. No hay información publicada sobre evaluación, licencia o idiomas soportados, por lo que su uso en producción no está justificado con los datos disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con embeddings posicionales ALiBi (según model card) |
| Parametros totales | 271M (nominal, según el nombre del modelo) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (repo de 0,5 GB; requiere `trust_remote_code=True`, probablemente safetensors/binarios PyTorch) |

## Arquitectura y entrenamiento

La model card describe un transformer con embeddings posicionales de tipo ALiBi, lo que permite extrapolación posicional más allá de la longitud vista en entrenamiento, y una longitud máxima de secuencia de 8192 tokens. El checkpoint forma parte de una ablación sobre el schedule de dropout de atención: el valor 0,2 es el extremo de un schedule lineal dependiente de la capa, no una probabilidad uniforme de dropout. El dropout se desactiva con `model.eval()`, como es habitual.

El entrenamiento se realizó en infraestructura Cerebras (2 sistemas CSX, runtime cbcore 2.6.0) sobre el dataset CommonPile, en su variante TPP corregida y sin repeticiones. Los hiperparámetros documentados incluyen learning rate pico de 0,15, batch global de 20, weight decay de 0,003655, tau_ema de 0,5518, 3305 pasos y 541.491.200 tokens totales (2 tokens por parámetro nominal). No se documentan fases de RLHF, DPO ni ajuste por instrucciones; se trata de un modelo base de preentrenamiento. Tampoco hay información sobre composición detallada del dataset más allá de CommonPile.

## Capacidades

- Generación de texto autoregresiva como modelo base de lenguaje.
- Contexto largo de hasta 8192 tokens gracias a ALiBi y a la longitud máxima de entrenamiento.
- No hay evidencia publicada de soporte de tool calling, function calling ni uso como agente.
- No hay evidencia publicada de capacidades multilingües específicas; los idiomas no están documentados.
- No hay evidencia de modo de razonamiento explícito (thinking mode), visión, audio ni otras modalidades.
- No dispone de ajuste por instrucciones documentado, por lo que su comportamiento conversacional no está garantizado.

## Casos de uso

- Investigación sobre regularización: el checkpoint sirve para comparar el efecto del dropout de atención con schedule lineal frente a otras ablaciones de la misma familia, midiendo perplejidad y curvas de entrenamiento en condiciones controladas.
- Estudios de dinámica de entrenamiento a bajo presupuesto: con 2 tokens por parámetro y 3305 pasos, es útil para analizar cómo influyen los hiperparámetros (learning rate 0,15, weight decay, tau_ema) en la convergencia temprana.
- Reproducibilidad de experimentos Cerebras: permite reproducir el pipeline de conversión desde `checkpoint_3305.mdl` con el commit de conversión documentado y validar el formato de pesos.
- Evaluación de ALiBi en contexto largo: con 8192 tokens de ventana, se puede usar para probar degradación de perplejidad por posición y comparar con modelos de contexto similar.
- Baseline para ablaciones de dropout: sirve como referencia negativa o positiva en estudios sobre el impacto de tasas de dropout no nulas en atención, dado que el valor 0,2 es un extremo del rango.
- Docencia y experimentación con modelos pequeños: 271M parámetros y 0,5 GB de repo permiten cargarlo en entornos modestos para prácticas de inferencia y análisis de checkpoints, siempre con `trust_remote_code=True`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para 271M parámetros en fp32 se requieren aproximadamente 1,1 GB solo de pesos, y en fp16/bf16 alrededor de 0,55 GB, más memoria para activaciones y KV cache.
- GPU recomendadas: no disponible; por tamaño, cualquier GPU consumer moderna (por ejemplo RTX 3060, RTX 4090) debería poder alojar los pesos en fp16, aunque el soporte real depende del código personalizado (`trust_remote_code=True`).
- Cabe en GPU consumer: probablemente sí por tamaño de pesos, pero no está verificado en la información disponible.
- Opciones de despliegue: no disponible; al requerir código personalizado, la integración con vLLM, llama.cpp, Ollama o TGI no está garantizada.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No se dispone de datos de rendimiento ni de especificaciones completas de alternativas comparables en la información proporcionada.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribución.
- Idiomas no documentados: no hay garantía de comportamiento multilingüe ni de calidad en castellano.
- Modelo base sin ajuste por instrucciones: no se debe esperar un comportamiento conversacional fiable.
- Riesgo de alucinación y de texto incoherente: con solo 541 millones de tokens de entrenamiento (2 tokens por parámetro), el modelo está muy por debajo de los presupuestos habituales de modelos de producción.
- Sesgos desconocidos: el dataset CommonPile no está descrito en detalle en la información disponible, por lo que no se pueden evaluar sesgos.
- Requiere `trust_remote_code=True`: implica ejecutar código del autor, con el riesgo de seguridad asociado.
- Checkpoint de ablación: está diseñado para experimentación, no para producción; el valor de dropout 0,2 es un extremo del schedule y puede afectar a la calidad final.
- Sin datos de evaluación: no hay benchmarks publicados que permitan estimar su calidad relativa.

## Enlaces

- Hugging Face: https://huggingface.co/adpretko/celerity-271m-8k-tpp-ablation-ad0p2-ild-tpp2
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.
