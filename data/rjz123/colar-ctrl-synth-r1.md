# rjz123/colar-ctrl-synth-r1

## Resumen

El modelo `rjz123/colar-ctrl-synth-r1` es un adaptador experimental de razonamiento latente controlado (CoLaR) construido sobre el modelo base `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B`. Ha sido desarrollado por el usuario rjz123 y publicado en Hugging Face con fines de investigación, tal como indican las etiquetas `latent-reasoning`, `colar` y `research`. El objetivo declarado es implementar una "cadena de variables sintéticas controladas" (según la descripción en chino de la model card) que modifica el comportamiento del modelo base mediante un scaffold personalizado: ampliación del token `[PAD]`, LoRA de rango 128 en las proyecciones q/v y un MLP denominado `LatentPolicy`.

El repositorio contiene únicamente un checkpoint de PyTorch-Lightning (`colar_ctrl_r1.ckpt`) y un archivo de hiperparámetros (`hparams.yaml`), con un tamaño total de 0,1 GB. No es un adaptador PEFT estándar ni un modelo AutoModel-loadable: los pesos están anidados bajo la clave `state_dict` y solo son compatibles con la arquitectura CoLaR personalizada. No se proporcionan licencia, idiomas soportados, ni documentación sobre el proceso de entrenamiento. Es una pieza de investigación preliminar, sin descargas ni usos registrados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (base: DeepSeek-R1-Distill-Qwen-1.5B) con scaffold CoLaR: resize de embeddings `[PAD]`, LoRA r128 en q/v, MLP `LatentPolicy` |
| Parametros totales | no disponible (el checkpoint ocupa 0,1 GB, probablemente solo los pesos del adaptador) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | no disponible (checkpoint en precisión original, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | Checkpoint PyTorch-Lightning (`.ckpt`), no safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo parte de `DeepSeek-R1-Distill-Qwen-1.5B`, un modelo de 1.500 millones de parámetros destilado de DeepSeek-R1, conocido por su capacidad de razonamiento explícito mediante cadenas de pensamiento. Sobre esta base, CoLaR introduce un mecanismo de razonamiento latente controlado: se expande el vocabulario con el token `[PAD]` (posiblemente para representar estados latentes), se añade una adaptación LoRA de rango 128 en las capas de atención (query y value) y se incorpora un MLP `LatentPolicy` que probablemente regula la generación de variables latentes sintéticas.

No se dispone de información sobre el conjunto de datos, el número de tokens de entrenamiento, ni el uso de técnicas como RLHF o DPO. La model card solo indica que el checkpoint debe cargarse con `strict=False` y que requiere variables de entorno específicas (`COLAR_BASE`, `COLAR_CKPT`, `COLAR_EMB_STD=0.018`, `COLAR_COMPRESS=5`, `COLAR_MAXLAT=64` y `TORCH_FORCE_NO_WEIGHTS_ONLY_LOAD=1`). Esto sugiere que el entrenamiento se realizó con PyTorch-Lightning y que el scaffold no es compatible con las APIs estándar de Hugging Face.

## Capacidades

- Razonamiento latente controlado: el mecanismo CoLaR busca generar y controlar variables latentes sintéticas durante la inferencia, aunque no se detalla el comportamiento exacto.
- Hereda las capacidades del modelo base `DeepSeek-R1-Distill-Qwen-1.5B`: generación de texto, razonamiento paso a paso, comprensión de código y matemáticas, y soporte multilingüe (chino e inglés, según las capacidades del modelo original).
- No se documentan capacidades específicas de tool calling, agentes, visión o audio.
- El checkpoint no es directamente utilizable con `AutoModel` ni con pipelines estándar de Hugging Face; requiere el código personalizado del scaffold CoLaR.

## Casos de uso

- Investigación en razonamiento latente: el modelo sirve como banco de pruebas para estudiar cómo la inserción de variables latentes controladas afecta a la calidad del razonamiento en modelos pequeños. Los investigadores pueden cargar el checkpoint en el entorno CoLaR y comparar las respuestas con el modelo base.
- Experimentación con adaptadores LoRA y MLP: al incluir LoRA r128 y un `LatentPolicy`, es útil para analizar el impacto de estas modificaciones en la representación interna del modelo.
- Desarrollo de técnicas de compresión de razonamiento: las variables de entorno `COLAR_COMPRESS=5` y `COLAR_MAXLAT=64` sugieren que el modelo puede comprimir el razonamiento en un espacio latente, lo que podría aplicarse a la reducción de costes de inferencia en entornos de investigación.
- Fine-tuning adicional sobre tareas específicas: aunque no se proporciona el código de entrenamiento, el checkpoint podría servir como punto de partida para ajustes posteriores si se dispone del scaffold CoLaR.
- Evaluación de robustez en modelos de razonamiento: al ser una variante de un modelo conocido, permite comparar el rendimiento en benchmarks de razonamiento con y sin el mecanismo latente.
- Estudio de alineación y control: el término "controlado" sugiere un interés en dirigir el proceso de razonamiento, lo que podría ser relevante para investigaciones sobre seguridad y alineación de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este adaptador. Tampoco se comparan métricas con el modelo base o con alternativas similares.

## Requisitos de hardware

- Al tratarse de un adaptador sobre un modelo de 1.500 millones de parámetros, la inferencia puede ejecutarse en GPUs de consumo con al menos 4-6 GB de VRAM si se usa el modelo base en cuantización (por ejemplo, 4 bits). Sin embargo, el checkpoint CoLaR no está cuantizado y requiere el scaffold completo, por lo que la VRAM necesaria dependerá de la implementación personalizada.
- GPU recomendadas: RTX 3060 (12 GB), RTX 4090, A100 o superiores, dependiendo de si se carga el modelo base en precisión completa o con cuantización externa.
- No es compatible directamente con vLLM, Ollama, llama.cpp ni TGI, ya que el formato es un checkpoint de PyTorch-Lightning con arquitectura personalizada. Se necesita el código fuente del proyecto CoLaR para cargarlo.
- El uso de `TORCH_FORCE_NO_WEIGHTS_ONLY_LOAD=1` sugiere que la carga requiere una versión específica de PyTorch y posiblemente de Lightning.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa. El modelo es un adaptador experimental sin métricas publicadas, por lo que no es posible compararlo objetivamente con alternativas como el propio `DeepSeek-R1-Distill-Qwen-1.5B` u otros modelos de razonamiento de tamaño similar (por ejemplo, `Qwen2.5-1.5B-Instruct` o `Phi-3-mini`). La comparativa queda pendiente de la publicación de resultados y del código del scaffold CoLaR.

## Limitaciones y advertencias

- Checkpoint de investigación: no está listo para producción; no hay garantías de estabilidad, seguridad ni rendimiento.
- Formato propietario: no se puede cargar con `AutoModel` ni con la mayoría de las herramientas de inferencia estándar. Requiere el código personalizado del autor y la configuración exacta de variables de entorno.
- Falta de documentación: no se especifican el proceso de entrenamiento, los datos utilizados, ni las políticas de sesgos o alucinaciones.
- Licencia no disponible: no se puede determinar si el uso comercial está permitido. Se recomienda contactar al autor antes de cualquier uso.
- Sin benchmarks: no hay evidencia de que el mecanismo CoLaR mejore el rendimiento respecto al modelo base; podría incluso degradarlo.
- Dependencia de versiones: la carga requiere `TORCH_FORCE_NO_WEIGHTS_ONLY_LOAD=1`, lo que indica incompatibilidad con versiones recientes de PyTorch y posibles problemas de mantenimiento.
- Riesgo de alucinación y sesgos: al estar basado en DeepSeek-R1-Distill-Qwen-1.5B, hereda los sesgos y limitaciones de ese modelo, aunque no se han evaluado específicamente para esta variante.

## Enlaces

- Repositorio del modelo: https://huggingface.co/rjz123/colar-ctrl-synth-r1
- Modelo base (DeepSeek-R1-Distill-Qwen-1.5B): https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- No se han encontrado otros enlaces relevantes (papers, blogs o repositorios del proyecto CoLaR) en la búsqueda web.
