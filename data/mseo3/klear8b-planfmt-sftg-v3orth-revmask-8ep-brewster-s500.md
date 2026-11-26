# mseo3/klear8b-planfmt-sftg-v3orth-revmask-8ep-brewster-s500

## Resumen

`klear8b-planfmt-sftg-v3orth-revmask-8ep-brewster-s500` es un fine-tuning supervisado (SFT) del modelo Klear-Reasoner-8B-SFT, desarrollado por el usuario mseo3 de Hugging Face. El checkpoint corresponde al paso 500 de un entrenamiento orientado a introducir un formato de planificación explícito mediante dos tokens especiales nuevos: `<|plan|>` (id 151669) y `<|/plan|>` (id 151670), añadidos al vocabulario y desligados del embedding de entrada (untied), con las filas de `lm_head` reinicializadas de forma ortogonal a sus piezas de texto correspondientes.

El modelo hereda la arquitectura Qwen3 del modelo base Kwai-Klear/Klear-Reasoner-8B-SFT, con 8.190.735.360 parámetros totales en precisión bf16 (aproximadamente 16,4 GB de pesos). El entrenamiento se realizó sobre 4 GPU H200 con FlashAttention 2, receta `sft_recipe_v3orth`, run `sft_g_ptokc_orth_lr2e5_planorth8ep_brewster`, y los pesos se fusionaron desde los shards FSDP a bf16.

Es relevante como ejemplo de adaptación de un modelo de razonamiento a un protocolo estructurado de planificación, útil para quienes investigan formatos de salida controlados, tokens especiales y entrenamiento SFT sobre modelos Qwen3 de 8B. El checkpoint es intermedio (paso 500), sin métricas publicadas y con cero descargas en el momento de la consulta, por lo que debe tratarse como material de investigación más que como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3, heredada de Klear-Reasoner-8B-SFT) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en bf16; cuantizaciones GGUF/AWQ no publicadas por el autor) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, fusionados desde shards FSDP) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de la familia Qwen3 con 8.190.735.360 parámetros, obtenido por fine-tuning del checkpoint Klear-Reasoner-8B-SFT. La innovación principal es la incorporación de dos tokens especiales de planificación, `<|plan|>` (151669) y `<|/plan|>` (151670), añadidos al vocabulario y configurados como no ligados (untied) respecto a los embeddings de entrada. Las filas correspondientes de `lm_head` se reinicializaron de forma ortogonal a sus piezas de texto, una técnica que busca evitar que el modelo reutilice directamente la representación textual de los tokens y fuerce un aprendizaje específico del nuevo formato.

El entrenamiento consistió en SFT (supervised fine-tuning) con la receta `sft_recipe_v3orth`, en el run `sft_g_ptokc_orth_lr2e5_planorth8ep_brewster`, ejecutado sobre 4 GPU H200 con FlashAttention 2. El nombre del run sugiere una tasa de aprendizaje de 2e-5 y 8 épocas (`8ep`), con el paso 500 como checkpoint publicado. Los pesos se fusionaron desde los shards FSDP a bf16. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO posteriores; el modelo base Klear-Reasoner-8B-SFT ya incorpora entrenamiento de razonamiento, pero sus detalles no se detallan aquí.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo base Klear-Reasoner-8B-SFT, orientado a tareas de razonamiento.
- Formato de planificación estructurada: emisión de bloques delimitados por `<|plan|>` y `<|/plan|>`, presumiblemente para separar la planificación explícita de la respuesta final.
- Razonamiento multi-paso: el modelo base está diseñado para cadenas de razonamiento; el fine-tuning refuerza la organización en planes.
- Generación de código y matemáticas: capacidades presumibles del modelo base Qwen3 de 8B, aunque no se documentan métricas específicas en este checkpoint.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; el autor no declara idiomas soportados.
- Modo thinking explícito: no confirmado en este checkpoint; el modelo base es un "reasoner", pero la model card no detalla el mecanismo.

## Casos de uso

- Investigación sobre formatos de salida controlados: el modelo permite estudiar cómo un SFT con tokens especiales delimitadores afecta a la estructura de las respuestas y a la separación entre plan y ejecución, gracias a los tokens `<|plan|>` y `<|/plan|>` añadidos de forma ortogonal.
- Generación de planes de proyecto estructurados: se puede solicitar al modelo que emita un bloque de planificación delimitado antes de la respuesta, facilitando el parseo automático en pipelines que necesiten extraer la planificación por separado.
- Evaluación de técnicas de reinicialización ortogonal: sirve como caso práctico para comparar el efecto de reinicializar filas de `lm_head` ortogonalmente frente a inicializaciones aleatorias estándar en tokens nuevos.
- Base para pipelines de agentes con planificación explícita: el formato de plan delimitado puede integrarse en orquestadores que separan la fase de planificación de la de ejecución, aunque requiere validación previa por tratarse de un checkpoint intermedio.
- Fine-tuning posterior sobre dominios específicos: al estar bajo licencia Apache 2.0 y en formato safetensors bf16, puede servir como punto de partida para SFT adicional en tareas donde se quiera mantener el formato de plan.
- Reproducción de experimentos de SFT distribuido: la model card documenta la receta, el hardware (4x H200) y el paso exacto, lo que facilita la reproducibilidad en entornos de investigación con FSDP y FlashAttention 2.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 16,4 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, se recomienda al menos 24 GB para contexto moderado.
- VRAM estimada en cuantización de 8 bits: alrededor de 8-9 GB para pesos; en 4 bits, alrededor de 4-5 GB, aunque el autor no publica versiones cuantizadas.
- GPU recomendadas: H100, H200 o A100 80 GB para entrenamiento e inferencia de referencia; el entrenamiento se realizó en 4x H200.
- GPU de consumo: cabe en RTX 4090 (24 GB) en bf16 con contexto limitado, y en RTX 3090/4080 con cuantización; en GPUs de 16 GB requeriría cuantización a 8 bits o inferior.
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama, siempre que se añadan manualmente los tokens especiales 151669 y 151670 al tokenizador y se configure correctamente el `lm_head` no ligado; sin esa configuración, el formato de plan no funcionará.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| klear8b-planfmt-sftg-v3orth-revmask-8ep-brewster-s500 | 8,19B | No disponible | Apache 2.0 | Hugging Face (0 descargas) | Checkpoint SFT intermedio con tokens de plan |
| Klear-Reasoner-8B-SFT (modelo base) | ~8B | No disponible | No disponible en esta ficha | Hugging Face (Kwai-Klear) | Modelo de razonamiento original sin tokens de plan |
| Qwen3-8B | ~8B | No disponible en esta ficha | Apache 2.0 | Hugging Face (Qwen) | Modelo base de la familia, sin fine-tuning de razonamiento específico |

La comparación se limita a la arquitectura y licencia, ya que no hay benchmarks publicados para el checkpoint. El modelo base Klear-Reasoner-8B-SFT y Qwen3-8B son las alternativas naturales; cualquier comparación de rendimiento requeriría evaluaciones propias.

## Limitaciones y advertencias

- Checkpoint intermedio: corresponde al paso 500 de un entrenamiento de 8 épocas, por lo que no representa el estado final del run y su calidad puede ser inferior a la de un checkpoint final.
- Sin benchmarks ni evaluaciones publicadas: no hay evidencia cuantitativa de rendimiento, calidad de planificación ni regresiones frente al modelo base.
- Cero descargas y sin validación comunitaria: no hay retroalimentación de terceros sobre su comportamiento.
- Idiomas no declarados: se desconoce el soporte multilingüe real y el equilibrio lingüístico del SFT.
- Riesgo de alucinación: inherente a los modelos de 8B y no mitigado de forma documentada en este checkpoint.
- Requiere configuración manual: los tokens `<|plan|>` y `<|/plan|>` deben añadirse al tokenizador y el `lm_head` no ligado debe cargarse correctamente; un despliegue estándar puede ignorar el formato.
- Sesgos: no documentados por el autor; se heredan los del modelo base y los del dataset de SFT, que no se describe.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene verificar la licencia del modelo base Klear-Reasoner-8B-SFT antes de producción.
- Contexto no especificado: se desconoce la longitud máxima efectiva tras el fine-tuning, lo que limita la planificación de cargas con contextos largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mseo3/klear8b-planfmt-sftg-v3orth-revmask-8ep-brewster-s500
- Modelo base: https://huggingface.co/Kwai-Klear/Klear-Reasoner-8B-SFT
- Familia Qwen3 (referencia arquitectónica): https://huggingface.co/Qwen/Qwen3-8B
- FlashAttention 2 (repositorio): https://github.com/Dao-AILab/flash-attention
- FSDP (documentación de PyTorch): https://pytorch.org/docs/stable/fsdp.html
