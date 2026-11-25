# mithulaartigala/Prompt-Resampler-2B-SFT-Alpha-8K-MTP-FP8

## Resumen

Prompt-Resampler-2B-SFT-Alpha-8K-MTP-FP8 es un ajuste fino (fine-tune) del modelo Qwen3.5-2B de Unsloth, publicado por el usuario mithulaartigala en Hugging Face. Su proposito no es la generacion de texto generalista, sino una tarea muy concreta: el *prompt resampling*, una tecnica de aumento de datos que genera variaciones de un prompt preservando la tarea original (cambiando nombres, cifras, escenarios o lugares). Se trata de la version Alpha de un modelo que el autor denomina "Resampler Mini", entrenado con LoRA sobre una longitud de secuencia de 8192 tokens.

El modelo hereda la arquitectura transformer de Qwen3.5-2B, con 2.274.069.824 parametros totales y pesos en formato FP8 (safetensors). El repositorio ocupa 3,2 GB y esta pensado para desplegarse mediante vLLM, Unsloth Studio o la libreria transformers. La licencia es Apache 2.0 y el unico idioma declarado es el ingles.

Su relevancia es acotada pero especifica: automatiza la generacion de variaciones de prompts para pipelines de sintesis de datos, evaluacion de robustez o aumento de datasets de razonamiento, reduciendo el coste en tokens frente a alternativas de razonamiento mas extenso. Al ser una release Alpha, el propio autor advierte de un rendimiento irregular ante prompts con estructuras no vistas o de gran longitud.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-2B) con soporte MTP (multi-token prediction) |
| Parametros totales | 2.274.069.824 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens (longitud de entrenamiento y `max-model-len` recomendado en vLLM) |
| Tipos de cuantizacion | FP8 (pesos publicados en FP8); otras cuantizaciones no disponibles |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP8) |
| Modelo base | unsloth/Qwen3.5-2B |
| Metodo de ajuste | LoRA con r=16, alpha=32 |
| Dataset de entrenamiento | mithulaartigala/prompt-resampling-alpaca-gsm8k |
| Pipeline | text-generation (con soporte image-text-to-text en transformers) |
| Tamano del repositorio | 3,2 GB |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-2B, un transformer decoder-only de 2B parametros con formato de chat nativo. Sobre esa base se aplico un ajuste fino supervisado (SFT) mediante LoRA con rango 16 y alpha 32, entrenado con Unsloth Studio sobre el dataset `mithulaartigala/prompt-resampling-alpaca-gsm8k`, que combina ejemplos de tipo Alpaca con problemas de GSM8K. La longitud de secuencia de entrenamiento fue de 8192 tokens.

La variante publicada es la denominada MTP (multi-token prediction), y los pesos se distribuyen ya cuantizados en FP8, lo que reduce el espacio en disco y facilita el despliegue en vLLM con `--load-format safetensors`. El objetivo declarado del ajuste es mejorar la fiabilidad del resampling de prompts no JSON consumiendo menos tokens de razonamiento, preservando el formato de chat y las capacidades nativas de Qwen3.5. No se detallan en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron etapas de RLHF o DPO.

## Capacidades

- Generacion de variaciones de prompts preservando la tarea y el tipo de tarea originales.
- Modificacion controlada de variables del prompt: nombres, cifras, lugares, escenarios y objetos.
- Resampling de prompts en lenguaje natural (no limitado a JSON).
- Razonamiento abreviado orientado a reducir el consumo de tokens frente a modelos de razonamiento extenso.
- Conservacion del formato de chat nativo de Qwen3.5 y de sus capacidades base.
- Soporte de inferencia via API compatible con OpenAI (vLLM, Unsloth Studio).
- Capacidad image-text-to-text heredada del modelo base segun la libreria transformers (no validada en la informacion disponible para esta tarea).
- Soporte de tool calling y agentes: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la model card.

## Casos de uso

- Aumento de datasets de razonamiento matematico: el modelo genera variantes de problemas tipo GSM8K cambiando nombres y cantidades, lo que permite ampliar corpus de entrenamiento sin redactar manualmente cada ejemplo; encaja por su entrenamiento especifico sobre Alpaca y GSM8K.
- Evaluacion de robustez de LLMs: se pueden producir variaciones controladas de un mismo prompt para comprobar si un modelo responde de forma consistente ante cambios superficiales (nombres, cifras), usando la ventana de 8192 tokens para prompts largos.
- Generacion de plantillas de prompt para pruebas A/B: a partir de un prompt semilla se obtienen versiones alternativas que mantienen la dificultad y la tarea, utiles para comparar configuraciones de sistemas de IA.
- Sintesis de datos para fine-tuning de modelos pequenos: el resampler puede alimentar pipelines de destilacion o SFT generando pares prompt original/variacion de forma automatizada.
- Creacion de bancos de preguntas educativos: a partir de un problema base se generan enunciados equivalentes con contextos realistas, utiles para plataformas de ejercicios o tutoria.
- Preprocesado en pipelines de evaluacion automatizada: integrado via vLLM con API compatible con OpenAI, puede insertarse como etapa previa a un benchmark para diversificar los prompts de entrada.
- Generacion de escenarios de simulacion para agentes: producir variaciones de instrucciones de tarea permite estresar agentes conversacionales con entradas distintas pero equivalentes en objetivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 2,27B parametros en FP8, los pesos ocupan aproximadamente 2,3 GB; con overhead de activaciones y cache KV para 8192 tokens, se estima un consumo en torno a 4-6 GB, si bien no se dispone de cifras oficiales.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP8; A100, H100 o L40S para despliegues con concurrencia; RTX 4090 o RTX 3090 para uso individual.
- Compatibilidad con GPU de consumo: previsiblemente si en tarjetas con 8 GB o mas (RTX 3060 Ti, RTX 4060 Ti, RTX 4070 en adelante), aunque no confirmado en la informacion disponible.
- Opciones de despliegue: vLLM (`vllm serve ... --load-format safetensors --max-model-len 8192`), Unsloth Studio (GUI con API compatible con OpenAI en el puerto 8888), transformers con `AutoModelForImageTextToText`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Prompt-Resampler-2B-SFT-Alpha-8K-MTP-FP8 | 2,27B | 8192 | Resampling de prompts | Apache 2.0 | Hugging Face |
| Qwen3.5-2B (base) | 2B | no disponible | Generacion general | no disponible | Hugging Face (unsloth) |
| Alternativas especializadas en resampling de prompts | no disponible | no disponible | Resampling | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables especificamente entrenados para prompt resampling, ni de resultados de rendimiento que permitan una comparacion cuantitativa con el modelo base.

## Limitaciones y advertencias

- Es una release Alpha: el autor advierte explicitamente de que ciertos comportamientos pueden no cumplir las expectativas.
- Rendimiento degradado ante prompts con estructuras no vistas durante el entrenamiento o prompts largos en general.
- Riesgo de generar escenarios fisicamente implausibles o cantidades irrazonables; el autor recomienda anadir una instruccion de "realismo de escenario" al system prompt.
- Solo soporta ingles; no se declaran capacidades multilingues.
- Ventana de contexto limitada a 8192 tokens, lo que restringe el resampling de prompts muy extensos.
- Riesgo de alucinacion inherente a los modelos de 2B parametros, especialmente en la preservacion exacta de la tarea original.
- Requiere usar el system prompt especifico del repositorio (`default_system_prompt.md`); sin el, el comportamiento puede desviarse.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de Qwen3.5-2B conviene verificar las condiciones del modelo base.
- Sin descargas ni validacion de la comunidad (0 descargas, 0 likes en el momento de la ficha), lo que implica ausencia de evidencia externa de calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mithulaartigala/Prompt-Resampler-2B-SFT-Alpha-8K-MTP-FP8
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-2B
- Dataset de entrenamiento: https://huggingface.co/datasets/mithulaartigala/prompt-resampling-alpaca-gsm8k
- System prompt por defecto: https://huggingface.co/mithulaartigala/Prompt-Resampler-2B-SFT-Alpha-8K-MTP-FP8/blob/main/default_system_prompt.md
- Unsloth Studio: https://unsloth.ai
- vLLM: https://github.com/vllm-project/vllm
