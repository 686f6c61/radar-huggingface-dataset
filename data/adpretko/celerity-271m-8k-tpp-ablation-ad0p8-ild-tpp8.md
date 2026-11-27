# adpretko/celerity-271m-8k-tpp-ablation-ad0p8-ild-tpp8

## Resumen

Celerity 271M 8K es un checkpoint de investigación de 271 millones de parámetros entrenado por Cerebras y publicado en Hugging Face por el usuario adpretko. Se trata de un experimento de ablación sobre la técnica TPP (tokens per parameter) dentro del proyecto Celerity, cuyo objetivo es estudiar el efecto del número de tokens de entrenamiento por parámetro en modelos de lenguaje de escala pequeña. El checkpoint concreto corresponde a la configuración `ad0.8_ild_tpp8`, con un ratio nominal de 8 tokens por parámetro y un programación de dropout de atención dependiente de la capa.

El modelo está entrenado sobre CommonPile (un corpus abierto de datos con licencias permisivas) y emplea una longitud máxima de secuencia de 8192 tokens con embeddings posicionales ALiBi. Su relevancia es fundamentalmente metodológica: sirve para estudiar cómo escalan las curvas de pérdida con el presupuesto de datos y cómo afectan los esquemas de regularización (dropout de atención escalado por capa) al entrenamiento, más que como modelo listo para producción.

No se dispone de información sobre licencia, idiomas soportados ni pipeline de Hugging Face, y el repositorio no registra descargas ni interacciones. El modelo requiere `trust_remote_code=True` para cargarse, ya que usa código personalizado (`custom_code`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con embeddings posicionales ALiBi (según model card) |
| Parametros totales | 271 millones (271M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8192 tokens (longitud máxima de secuencia durante entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | Pesos PyTorch (repo de 0,5 GB); requiere `trust_remote_code=True` |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 271M de parámetros con embeddings posicionales de tipo ALiBi, entrenado con una longitud máxima de secuencia de 8192 tokens. Según la model card, se entrenó durante 7346 pasos con un batch global de 36 y un total de 2.166.423.552 tokens (aproximadamente 2,17 mil millones), lo que corresponde a un ratio nominal de 8 tokens por parámetro. El dataset empleado es CommonPile, en una variante "corrected no-repeat TPP pool".

El experimento de ablación introduce un programación de dropout de atención dependiente de la capa con un valor extremo de 0,8 y escalado lineal (`ad0.8_ild_tpp8`). La model card aclara explícitamente que esos valores no son probabilidades uniformes de dropout, sino los extremos de un programación lineal por capa, y que el dropout se desactiva con `model.eval()`. El entrenamiento se realizó sobre 3 sistemas CSX de Cerebras con `cbcore 2.6.0`, con una tasa de aprendizaje pico de 0,15, weight decay de 0,003289 y `tau_ema` de 0,2759. No se documentan fases de RLHF, DPO ni ajuste por instrucciones.

## Capacidades

- Generación de texto autoregresiva como modelo de lenguaje base (no ajustado por instrucciones).
- Modelado de secuencias largas de hasta 8192 tokens gracias a ALiBi, que permite extrapolación posicional relativa.
- Capacidad multilingüe: no disponible (no se documentan idiomas).
- Tool calling / function calling: no disponible; no se documenta soporte.
- Soporte de agentes o razonamiento multi-paso: no disponible; al ser un modelo base sin ajuste, no cabe esperar capacidades de agente.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Investigación sobre escalado de datos: el checkpoint permite reproducir y analizar curvas de pérdida frente al ratio tokens/parámetro, comparándolo con otros checkpoints de la misma familia de ablación.
- Estudio de regularización en transformers pequeños: sirve para medir el impacto de un programación de dropout de atención escalado por capa frente a dropout uniforme o nulo.
- Experimentos de extrapolación posicional con ALiBi: útil para evaluar el comportamiento en secuencias cercanas al máximo de 8192 tokens y más allá.
- Base para fine-tuning ligero en tareas de clasificación o generación de dominio específico, dado su tamaño reducido y su coste de entrenamiento moderado.
- Evaluación de corpus CommonPile: permite analizar qué aprende un modelo pequeño entrenado exclusivamente sobre datos abiertos con licencias permisivas.
- Docencia y prototipado en entornos con recursos limitados: un modelo de 271M se puede ejecutar en una sola GPU consumer para experimentos de laboratorio.
- Reproducibilidad de pipelines Cerebras: el checkpoint documenta la procedencia completa (commit del conversor, versión de runtime, hiperparámetros), lo que facilita replicar experimentos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,1 GB solo para pesos (271M × 4 bytes), más overhead de activaciones y caché KV.
- VRAM estimada en fp16/bf16: aproximadamente 0,55 GB para pesos; en cuantización de 8 bits, en torno a 0,3 GB (estimación teórica, no confirmada por el autor).
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM debería ser suficiente; una RTX 3060, RTX 4060 o superior es adecuada.
- Cabe en GPU consumer: sí, con amplio margen, incluso en fp32.
- Opciones de despliegue: PyTorch con `trust_remote_code=True` (requisito documentado). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, y al usar código personalizado la conversión a GGUF no está garantizada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Celerity 271M 8K (este) | 271M | 8192 | no disponible | Hugging Face, requiere `trust_remote_code` |
| Modelos de ~270M de la familia Pythia | ~270M | 2048 | Apache 2.0 | Hugging Face, transformers estándar |
| Modelos de ~250-350M de la familia OPT | ~350M | 2048 | OPT-175B license (no comercial para algunos) | Hugging Face, transformers estándar |

La comparación con alternativas establecidas se limita a parámetros y contexto, ya que no hay benchmarks publicados para este checkpoint. Frente a Pythia u OPT de tamaño similar, la ventaja diferencial de Celerity es su contexto de 8192 tokens con ALiBi y su carácter de experimento controlado de ablación; la desventaja es la ausencia de licencia declarada y la dependencia de código personalizado.

## Limitaciones y advertencias

- Es un checkpoint de ablación, no un modelo final ajustado; no debe esperarse un comportamiento conversacional pulido.
- No se declara licencia, lo que impide determinar si el uso comercial está permitido; conviene contactar con el autor antes de cualquier uso en producción.
- No se documentan idiomas soportados; el rendimiento multilingüe es incierto.
- Riesgo de alucinación inherente a un modelo base pequeño entrenado con ~2,17 mil millones de tokens, muy por debajo de los presupuestos habituales de modelos de producción.
- El uso de dropout de atención con valor extremo 0,8 durante el entrenamiento puede afectar a la estabilidad de las representaciones; la model card advierte de que debe usarse `model.eval()` para desactivarlo.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; conviene auditar dicho código antes de cargarlo en entornos sensibles.
- Sin datos de benchmarks, no es posible comparar su calidad de forma objetiva con alternativas.
- El repositorio no registra descargas ni validación comunitaria; el soporte es inexistente.

## Enlaces

- Hugging Face: https://huggingface.co/adpretko/celerity-271m-8k-tpp-ablation-ad0p8-ild-tpp8
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.
