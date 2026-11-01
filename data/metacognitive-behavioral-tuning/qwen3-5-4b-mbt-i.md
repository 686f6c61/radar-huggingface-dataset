# metacognitive-behavioral-tuning/Qwen3.5-4B-MBT-I

## Resumen

Qwen3.5-4B-MBT-I es un ajuste fino supervisado (SFT) del modelo base Qwen/Qwen3.5-4B-Base, desarrollado por el grupo de investigacion metacognitive-behavioral-tuning. El modelo forma parte de un conjunto de cuatro variantes (Unedited-SFT, MBT-R, MBT-I y MBT-A) que acompanan al paper "Distilling Metacognitive Behaviors through Agentic Editing", actualmente en revision anonima. El objetivo del trabajo es destilar comportamientos metacognitivos en modelos pequenos mediante la edicion agentica de trazas de razonamiento generadas por un profesor.

La variante MBT-I se entrena sobre trazas editadas por un editor que, en una sola llamada, devuelve pasajes a insertar en marcadores de parrafo. El modelo cuenta con 4.539.265.536 parametros totales (aproximadamente 4,5 mil millones) en precision bf16, con un repositorio de 9,1 GB. Esta especializado en razonamiento paso a paso y matematicas, y utiliza una plantilla de chat que abre un bloque `<think>` para separar el razonamiento interno de la respuesta final.

La relevancia de este modelo radica en su enfoque metodologico: en lugar de entrenar directamente sobre trazas de un profesor, se entrenan sobre trazas editadas para inducir comportamientos metacognitivos. Esto lo convierte en un caso de estudio interesante para investigadores que trabajan en destilacion de razonamiento, SFT de alta calidad y modelos compactos con capacidades de razonamiento extendido. La licencia Apache-2.0 facilita su uso comercial y su inspeccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5, no se detalla variante especifica) |
| Parametros totales | 4.539.265.536 (aproximadamente 4,5 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 131.072 tokens (longitud maxima de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; no se listan cuantizaciones oficiales) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo se basa en Qwen3.5-4B-Base, un transformer de aproximadamente 4,5 mil millones de parametros. El ajuste fino es de parametros completos (full-parameter SFT) con la funcion de perdida aplicada unicamente sobre los tokens del asistente. El entrenamiento se realizo durante 15 epocas con el optimizador Muon (implementacion Megatron), learning rate de 1e-5, weight decay 0, schedule constante con 40 pasos de warmup, batch global de 64 secuencias (8 GPUs x 8 pasos de acumulacion) y empaquetado sin padding (padding-free packing). La longitud maxima de secuencia fue de 131.072 tokens, con autocast bf16 y pesos maestros en fp32; los pesos liberados estan en bf16.

La innovacion principal no esta en la arquitectura, sino en el pipeline de datos: las trazas de entrenamiento provienen del dataset `metacognitive-behavioral-tuning/mbt-traces` y fueron editadas por MBT-I, un editor que inserta pasajes en marcadores de parrafo en una sola llamada. Este enfoque busca destilar comportamientos metacognitivos (planificacion, verificacion, autocorreccion) en lugar de imitar directamente las trazas del profesor. No se especifica en la informacion disponible si hubo RLHF o DPO adicionales; el metodo declarado es SFT.

## Capacidades

- Generacion de texto conversacional en ingles con plantilla de chat que separa razonamiento (`<think>`) y respuesta final.
- Razonamiento paso a paso orientado a matematicas y problemas que requieren descomposicion.
- Comportamientos metacognitivos inducidos por el pipeline de edicion de trazas (planificacion y verificacion implicitas en el razonamiento).
- Generacion de respuestas largas: la model card advierte que las respuestas extensas son comunes y recomienda reservar decenas de miles de tokens.
- Soporte de razonamiento extendido con hasta 122.880 tokens de generacion en el ejemplo de uso con vLLM.
- Capacidad multimodal potencial segun el tag `image-text-to-text` del repositorio, aunque la model card no detalla ni documenta funciones de vision; debe tratarse como no confirmada.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no documentado explicitamente, aunque el enfasis en metacognicion sugiere razonamiento multi-paso.
- Capacidades multilingues: limitadas al ingles segun el campo `language`.

## Casos de uso

- Razonamiento matematico asistido: el modelo esta entrenado para resolver problemas con razonamiento paso a paso y formato `\boxed{}`, adecuado para tutoria automatica o generacion de soluciones verificables en entornos educativos.
- Investigacion en destilacion de razonamiento: sirve como punto de comparacion frente a las variantes Unedited-SFT, MBT-R y MBT-A para estudiar el efecto de la edicion agentica de trazas en el comportamiento del modelo.
- Generacion de cadenas de razonamiento largas: con contexto de 131.072 tokens y generaciones de decenas de miles de tokens, es util para tareas que requieren deliberacion extensa, como demostraciones formales o analisis de problemas complejos.
- Experimentos de SFT reproducible: la model card documenta hiperparametros completos (Muon, 15 epocas, batch 64, lr 1e-5), lo que facilita replicar el entrenamiento en entornos de investigacion con 8 GPUs.
- Evaluacion de metacognicion en modelos pequenos: permite medir si un modelo de 4,5 B puede adquirir comportamientos de autocorreccion y planificacion comparables a modelos mayores.
- Base para ajustes posteriores en dominios especificos: al ser Apache-2.0 y estar en safetensors bf16, puede servir como punto de partida para fine-tuning en tareas de razonamiento en ingles dentro de productos comerciales.
- Despliegue en inferencia de alto rendimiento con vLLM: la model card incluye un ejemplo funcional con `SamplingParams(temperature=1.0, top_p=0.95, max_tokens=122880)`, lo que facilita su integracion en pipelines de serving.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 9 GB solo para pesos (4,54 B parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica se recomiendan 16-24 GB para contextos moderados.
- Contexto largo: con 131.072 tokens de contexto, la cache KV crece de forma significativa; se requiere hardware con memoria amplia (A100 80 GB, H100 80 GB) para aprovechar la ventana completa.
- GPU recomendadas: A100 40/80 GB, H100 80 GB para contexto largo y throughput alto; RTX 4090 (24 GB) puede ejecutar el modelo en bf16 con contextos moderados.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) y potencialmente en GPUs de 16 GB con cuantizacion, aunque no se publican cuantizaciones oficiales.
- Opciones de despliegue: vLLM (ejemplo oficial en la model card), transformers; llama.cpp, Ollama y TGI no estan documentados en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.5-4B-MBT-I | 4,54 B | 131.072 tokens | Apache-2.0 | SFT sobre trazas editadas por MBT-I; solo ingles |
| Qwen3.5-4B-Unedited-SFT | no disponible | no disponible | Apache-2.0 (presumible) | Misma base, entrenado sobre trazas sin editar |
| Qwen3.5-4B-MBT-R | no disponible | no disponible | Apache-2.0 (presumible) | Misma base, editor de reescritura |
| Qwen3.5-4B-MBT-A | no disponible | no disponible | Apache-2.0 (presumible) | Misma base, editor agentico |

No se dispone de datos de rendimiento comparativo entre estas variantes ni frente a modelos de otras familias en la informacion proporcionada.

## Limitaciones y advertencias

- Idioma: el modelo solo declara soporte de ingles; su uso en castellano u otros idiomas no esta validado y probablemente degrade la calidad.
- Riesgo de alucinacion: como todo modelo generativo de 4,5 B, puede producir razonamientos plausibles pero incorrectos, especialmente en matematicas y problemas de varios pasos.
- Respuestas muy largas: la model card advierte que las generaciones extensas son comunes, lo que incrementa coste computacional y latencia en produccion.
- Capacidad multimodal no confirmada: el tag `image-text-to-text` sugiere vision, pero la model card no la documenta; no debe asumirse en produccion.
- Tool calling y agentes: no documentados; no se recomienda su uso en pipelines agenticos sin validacion previa.
- Licencia del dataset: los datos de entrenamiento son CC BY-SA 4.0, lo que puede imponer obligaciones de atribucion y compartir-igual sobre derivados de los datos, aunque los pesos se liberan bajo Apache-2.0.
- Paper anonimo en revision: la metodologia y resultados no han sido revisados por pares; las afirmaciones sobre metacognicion deben tratarse con cautela.
- Modelo de investigacion: con 200 descargas y 0 likes, no hay evidencia de adopcion ni validacion externa.
- Sin benchmarks publicados: no es posible evaluar su rendimiento relativo frente a alternativas sin ejecutar evaluaciones propias.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/metacognitive-behavioral-tuning/Qwen3.5-4B-MBT-I
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Dataset de trazas: https://huggingface.co/datasets/metacognitive-behavioral-tuning/mbt-traces
- Variante Unedited-SFT: https://huggingface.co/metacognitive-behavioral-tuning/Qwen3.5-4B-Unedited-SFT
- Variante MBT-R: https://huggingface.co/metacognitive-behavioral-tuning/Qwen3.5-4B-MBT-R
- Variante MBT-A: https://huggingface.co/metacognitive-behavioral-tuning/Qwen3.5-4B-MBT-A
- Codigo y prompts: https://github.com/metacognitive-behavioral-tuning/metacognitive-behavioral-tuning
