# adpretko/celerity-3900m-8k-ad0p0

## Resumen

Celerity 3900m 8K es un checkpoint de 3.900 millones de parámetros publicado por el usuario adpretko en Hugging Face. La model card lo describe como la línea base de attention dropout 0.0 del experimento `ad_0.0_cbcore2.6.0`, convertida desde el formato Cerebras CS al formato de Hugging Face. El nombre indica una ventana de contexto de 8K, aunque no se especifica si son 8.000 u 8.192 tokens.

El valor principal del repositorio es la reproducibilidad: documenta el checkpoint de origen `checkpoint_47389.mdl`, el commit del conversor `0e3d5d375695293479df9d2a3717f05f71a345b4` y los hiperparámetros de regularización (attention dropout 0.0, residual dropout 0.0, stochastic depth 0.0 y LayerDrop 0.0). No se publican resultados de benchmarks, licencia, idiomas ni capacidades funcionales.

No es un modelo listo para producción sin validación previa: requiere `trust_remote_code=True` para cargar código de modelado personalizado y no hay evidencia de ajuste instructivo, evaluación de sesgos o soporte en motores de inferencia estándar. Su interés es principalmente de investigación, auditoría de conversiones Cerebras-Hugging Face y experimentos controlados de regularización.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible. La model card identifica la familia Celerity y un checkpoint convertido desde formato Cerebras CS a Hugging Face, pero no detalla si es transformer denso, MoE, SSM u otra variante. |
| Parámetros totales | 3.900 millones (3,9B), según el nombre del modelo; no se especifica en la model card. |
| Parámetros activos | No aplica; no se indica que sea un modelo MoE. |
| Longitud de contexto | 8K según el nombre del modelo; no se especifica si son 8.000 u 8.192 tokens ni se confirma en la información disponible. |
| Tipos de cuantización | No disponible. No se documentan cuantizaciones oficiales ni artefactos GGUF, INT8 o INT4. |
| Idiomas soportados | No disponible; no se declaran idiomas. |
| Licencia | No disponible. |
| Formato de pesos | PyTorch (tag `pytorch`), repositorio de 7,8 GB. No se especifica si usa safetensors, bin u otro formato. Requiere código de modelado Celerity personalizado y `trust_remote_code=True`. |
| Pipeline de Hugging Face | No disponible. |
| Tamaño del repositorio | 7,8 GB. |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna del modelo: no indica si es un transformer decoder-only, un modelo MoE, una arquitectura híbrida o una variante específica de Celerity. Solo se documenta que el checkpoint procede de un experimento de dropout de atención y que fue convertido desde el formato Cerebras CS al formato de Hugging Face mediante un commit concreto del conversor.

El entrenamiento se describe únicamente a través de sus hiperparámetros de regularización: attention dropout 0.0 constante, residual dropout 0.0, stochastic depth 0.0 y LayerDrop 0.0. No se proporcionan datos sobre número de tokens, composición del dataset, uso de RLHF/DPO, ajuste instructivo ni objetivos de entrenamiento. La evaluación en Hugging Face debe realizarse con dropout desactivado mediante `model.eval()`.

## Capacidades

- Generación de texto: no documentada; no se confirma que el checkpoint esté ajustado para instrucciones ni para conversación.
- Razonamiento, código y matemáticas: no evaluados ni documentados en la información proporcionada.
- Tool calling / function calling: no disponible.
- Agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se declaran idiomas soportados.
- Visión, audio u otras modalidades: no disponible.
- Contexto largo: 8K según el nombre del modelo, sin confirmación técnica en la model card.
- Carga con código personalizado: requiere `trust_remote_code=True` y el código de modelado Celerity incluido en el repositorio.
- Evaluación: el autor indica que debe usarse `model.eval()` para desactivar dropout durante la inferencia.

## Casos de uso

- Reproducción de la línea base de dropout de atención: cargar el checkpoint con `trust_remote_code=True` y `model.eval()`, y calcular perplejidad en un corpus fijo para comparar con variantes de dropout. Es adecuado porque la model card documenta explícitamente `ad_0.0` y el checkpoint de origen.
- Auditoría de la conversión Cerebras CS a Hugging Face: reproducir la conversión con el commit indicado y comparar logits o perplejidad del checkpoint convertido con el original `checkpoint_47389.mdl`. Es adecuado porque el repositorio proporciona la procedencia y el hash del conversor.
- Ablation de regularización: usar este checkpoint como control sin dropout de atención, residual dropout, stochastic depth ni LayerDrop en experimentos de entrenamiento. Es adecuado porque todos esos hiperparámetros están fijados a 0.0.
- Pruebas de integración de código personalizado en Hugging Face Transformers: crear un job de CI que instale Transformers, cargue el modelo con `trust_remote_code=True`, ejecute un forward pass y verifique el consumo de memoria. Es adecuado porque el repositorio depende de código de modelado custom.
- Evaluación de contexto largo: medir perplejidad y uso de KV cache en documentos de hasta 8K tokens, si el modelo lo soporta tras validación. Es adecuado porque el nombre del checkpoint declara una ventana de 8K, aunque no esté confirmada.
- Fine-tuning de dominio controlado: adaptar el checkpoint a un corpus jurídico, técnico o científico con validación humana y comparación contra la línea base. Es adecuado por su tamaño de 3,9B, manejable en una GPU de 24 GB en precisión reducida.
- Docencia y replicación de conversiones: usar el repositorio como ejemplo práctico de conversión de formato Cerebras CS a Hugging Face, carga con código custom y evaluación en modo `eval()`. Es adecuado porque la model card documenta el proceso y los hiperparámetros del experimento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

No hay datos de MMLU, HumanEval, GSM8K, perplejidad, evaluaciones de contexto largo ni comparaciones con otros modelos.

## Requisitos de hardware

Estimación teórica de VRAM para los pesos, sin incluir KV cache, activaciones ni overhead del framework. No se confirma que el modelo soporte cuantización oficial:

| Precisión | VRAM estimada para pesos | VRAM total orientativa |
|---|---:|---:|
| FP32 | 15,6 GB | 18-24 GB |
| FP16 / BF16 | 7,8 GB | 10-16 GB |
| INT8 | 3,9 GB | 6-10 GB |
| INT4 | ~2,0 GB | 4-8 GB |

- GPU recomendadas: RTX 4090 o RTX 3090 de 24 GB para FP16/BF16 con margen para 8K; A100 40 GB o H100 80 GB para evaluación por lotes o fine-tuning.
- GPU consumer: cabe en RTX 4090/3090 de 24 GB en FP16. En tarjetas de 16 GB el FP16 queda ajustado; en 12 GB se recomienda INT8 o secuencias cortas.
- Despliegue: la vía documentada es Hugging Face Transformers con `trust_remote_code=True`. No hay confirmación de soporte en vLLM, TGI, llama.cpp u Ollama.
- GGUF: no se publica ningún artefacto GGUF; llama.cpp u Ollama requerirían conversión y validación adicional.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se han identificado modelos comparables en la información proporcionada.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---:|---:|---|---|---|
| Celerity 3900m 8K | 3,9B | 8K según nombre | No disponible | No disponible | Hugging Face, código custom |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Licencia no disponible: no debe asumirse permiso para uso comercial, redistribución o modificación.
- Idiomas no declarados: no se puede garantizar un comportamiento correcto en castellano ni en otros idiomas.
- Sin benchmarks: no hay evidencia pública de calidad, razonamiento, código o matemáticas.
- Sin ajuste instructivo documentado: no debe tratarse como un asistente conversacional sin validación previa.
- Riesgo de alucinación no evaluado: no hay pruebas de fidelidad factual ni de robustez.
- Sesgos desconocidos: no se documentan evaluaciones de sesgo, toxicidad o seguridad.
- Código personalizado: `trust_remote_code=True` ejecuta código del autor; debe auditarse antes de usarlo en producción.
- Conversión desde Cerebras CS: posibles diferencias numéricas o errores de mapeo de pesos; conviene comparar con el checkpoint original.
- Contexto 8K no confirmado: el nombre del modelo lo sugiere, pero la model card no detalla la configuración de atención ni la longitud real.
- Sin cuantizaciones oficiales: INT8, INT4 y GGUF requerirían conversión y validación propias.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción.

## Enlaces

- Hugging Face: https://huggingface.co/adpretko/celerity-3900m-8k-ad0p0
- Model card: https://huggingface.co/adpretko/celerity-3900m-8k-ad0p0
- Hash del conversor: `0e3d5d375695293479df9d2a3717f05f71a345b4` (no se proporciona URL)
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
