# jaydeepb/pythia-1.4b-code-run1

## Resumen

pythia-1.4b-code-run1 es un ajuste fino (fine-tune) de EleutherAI/pythia-1.4b, un transformer decoder-only de la familia Pythia, entrenado por el usuario jaydeepb sobre una muestra de 1 millón de secuencias de 128 tokens del dataset The Stack (bigcode/the-stack). No se trata de un modelo orientado a producción de código de propósito general, sino de un artefacto de investigación: su propósito es servir de sujeto experimental para estudiar la memorización extraíble de datos de entrenamiento en modelos de lenguaje.

La ficha técnica del autor indica que las etiquetas de memorización extraíble de este "run1" (medidas con decodificación greedy con k=50 y l=50) se usan para entrenar un clasificador que predice memorización. Un modelo hermano, "run2", ajustado sobre una muestra disjunta de 1 millón de secuencias, actúa como conjunto de evaluación held-out.

Es relevante para investigadores que trabajan en privacidad de LLMs, extracción de datos de entrenamiento y detección de memorización, ya que proporciona un modelo base público, con licencia Apache 2.0, entrenado con hiperparámetros documentados (1 época, longitud de secuencia 128, learning rate 5e-5, schedule coseno, seed 42) y pesos en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-NeoX (transformer decoder-only) |
| Parametros totales | 1.414.647.808 (~1,4 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el fine-tuning usa secuencias de 128 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (entrenado sobre codigo de The Stack) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (2,8 GB de tamano de repo) |

## Arquitectura y entrenamiento

El modelo parte de EleutherAI/pythia-1.4b, un transformer decoder-only con arquitectura GPT-NeoX y aproximadamente 1.400 millones de parametros. Pythia es una familia de modelos disenada por EleutherAI para estudiar de forma controlada el entrenamiento a gran escala, con checkpoints publicos a lo largo del preentrenamiento.

El ajuste fino se realizo durante 1 epoca sobre una muestra de 1 millon de secuencias de 128 tokens extraidas de The Stack, un corpus masivo de codigo fuente con licencias permisivas. Los hiperparametros documentados son: learning rate 5e-5, schedule coseno y seed 42. La novedad metodologica es el diseno experimental: las etiquetas de memorizacion extraible de este run1 (medidas mediante decodificacion greedy con k=50 generaciones y l=50 tokens de contexto) se emplean como ground truth para entrenar un clasificador de memorizacion, mientras que el run2, ajustado sobre una muestra disjunta, permite evaluar la generalizacion del clasificador sobre datos frescos.

## Capacidades

- Generacion de texto con pipeline `text-generation` de transformers.
- Generacion y continuacion de codigo, dado el fine-tuning sobre The Stack (con calidad limitada por el tamano del modelo y la corta longitud de secuencia de entrenamiento).
- Utilidad principal como sujeto de experimentacion en memorizacion: extraccion de secuencias de entrenamiento mediante decodificacion greedy (k=50, l=50).
- Compatibilidad con el ecosistema Hugging Face (transformers, endpoints de inferencia).
- No hay evidencia de capacidades de vision, audio, tool calling, agentes ni modos de razonamiento.

## Casos de uso

- Investigacion en memorizacion de LLMs: generar muestras greedy desde el modelo y contrastarlas con el dataset de fine-tuning para medir cuanta informacion de The Stack es extraible.
- Entrenamiento de clasificadores de memorizacion: usar las etiquetas de extraccion de run1 como datos supervisados para predecir que secuencias seran memorizadas.
- Evaluacion held-out de dichos clasificadores: contrastar predicciones contra el modelo run2, entrenado sobre datos disjuntos.
- Estudios de privacidad en modelos de codigo: analizar si fragmentos de codigo con licencia o datos personales del corpus pueden regurgitarse.
- Experimentos reproducibles de fine-tuning: los hiperparametros y la seed estan documentados, lo que facilita replicar el setup en otros modelos Pythia.
- Baseline para tecnicas de mitigacion de memorizacion: probar regularizacion, deduplicacion o unlearning comparando antes y despues sobre este modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: alrededor de 2,8-3 GB solo para los pesos, mas overhead de activaciones y KV cache; con 6-8 GB de VRAM es viable con holgura.
- Consumer GPUs: cabe comodamente en una RTX 3060 de 12 GB, RTX 4060 Ti o superiores; incluso en GPUs de 8 GB.
- GPUs de datacenter (A100, H100) solo necesarias si se quieren ejecutar experimentos de extraccion masiva o fine-tuning adicional con batches grandes.
- Despliegue: transformers de Hugging Face de forma directa; compatible en principio con llama.cpp si alguien lo convierte a GGUF (no hay conversion publicada), y con los inference endpoints de Hugging Face.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Uso principal |
|---|---|---|---|---|
| jaydeepb/pythia-1.4b-code-run1 | 1,41 B | no disponible (fine-tuning a 128 tokens) | Apache 2.0 | Investigacion en memorizacion |
| EleutherAI/pythia-1.4b | 1,41 B | 2.048 tokens | Apache 2.0 | Preentrenamiento base / investigacion |
| EleutherAI/pythia-1.4b-deduped | 1,41 B | 2.048 tokens | Apache 2.0 | Investigacion con dataset deduplicado |

Frente al modelo base, esta variante esta especializada en codigo y en servir de sujeto para estudios de memorizacion; no sustituye a Pythia-1.4b para uso general ni a modelos de codigo modernos como StarCoder o CodeLlama, que ofrecen mucho mayor rendimiento y contexto.

## Limitaciones y advertencias

- Modelo de investigacion, no pensado para produccion: la calidad de generacion de codigo es limitada por el tamano (1,4 B) y por el fine-tuning con secuencias de solo 128 tokens.
- Riesgo elevado y deliberado de memorizacion: el modelo puede regurgitar fragmentos literales de The Stack, con las implicaciones de licencia y privacidad que ello conlleva.
- Contexto efectivo de entrenamiento muy corto (128 tokens), lo que degrada tareas que requieran dependencias largas.
- Idiomas soportados no documentados; el contenido de The Stack es codigo y texto tecnico en su mayoria en ingles.
- Solo 266 descargas y 0 likes en el momento de la ficha: comunidad minima, sin validacion externa ni benchmarks publicos.
- Licencia Apache 2.0, permisiva para uso comercial, pero los datos de The Stack tienen sus propias licencias por repositorio de origen; verificar antes de cualquier uso comercial.
- Existe un modelo hermano (run2) necesario para replicar el protocolo experimental completo; usar run1 de forma aislada pierde parte del diseno del estudio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jaydeepb/pythia-1.4b-code-run1
- Modelo base: https://huggingface.co/EleutherAI/pythia-1.4b
- Dataset de fine-tuning: https://huggingface.co/datasets/bigcode/the-stack
- Paper de Pythia (referencia de la familia base): https://arxiv.org/abs/2304.01373
