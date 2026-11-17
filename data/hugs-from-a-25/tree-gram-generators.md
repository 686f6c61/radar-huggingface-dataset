# hugs-from-a-25/tree-gram-generators

## Resumen

Tree-gram generators es una coleccion de modelos generativos autorregresivos denominados "tree-gram models", publicados por el usuario hugs-from-a-25. No se trata de un unico modelo de lenguaje de gran escala, sino de un conjunto de generadores que predicen el siguiente token a partir de los `n - 1` tokens previos mediante una estructura jerarquica de arbol. Su proposito principal es producir los corpus sinteticos del dataset tree-gram-text, sirviendo como herramienta de generacion de datos sinteticos controlados y reproducibles.

Los generadores se organizan por corpus de origen (TinyStories, WikiText-103 y FineWeb-Edu) y por horizonte y anchura. Para cada fuente existe una estimacion bigram basada en conteos y varias variantes neuronales con horizontes de contexto de 2, 3, 7, 15 y 31 tokens, con anchuras que van de 64 a 1024 dimensiones. Los pesos se distribuyen en float32 en formato safetensors dentro de un repositorio de 6,8 GB.

La relevancia de esta publicacion es metodologica: ofrece una familia de modelos con entropia exacta calculable sobre validacion, lo que permite estudiar como escala la perdida al aumentar el contexto y la anchura en distintos regimenes de datos. No es un modelo de chat ni un asistente general, sino un instrumento de investigacion sobre modelado de lenguaje y generacion de datos sinteticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tree-gram autorregresivo con estructura jerarquica de arbol; variante bigram basada en conteos |
| Parametros totales | no disponible (depende de cada generador; anchura d entre 64 y 1024) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | de 1 a 31 tokens segun el generador (`n` de 2 a 32) |
| Tipos de cuantizacion | no disponible (pesos publicados en float32) |
| Idiomas soportados | no disponible (depende del corpus de origen: TinyStories y FineWeb-Edu en ingles, WikiText-103 en ingles) |
| Licencia | other, per-source: TinyStories CDLA-Sharing-1.0, WikiText-103 CC BY-SA 3.0, FineWeb-Edu ODC-By 1.0 |
| Formato de pesos | safetensors (float32); bigram en `counts.npz` |

## Arquitectura y entrenamiento

Cada generador es un modelo autorregresivo que predice el siguiente token a partir de los `n - 1` tokens anteriores mediante una estructura jerarquica en forma de arbol, en lugar de una attention completa sobre una secuencia larga. El horizonte `n` define cuantos tokens de contexto se consideran: los generadores publicados cubren desde `n3` (contexto de 2 tokens) hasta `n32` (contexto de 31 tokens). La anchura `d` controla la dimension interna de la representacion y se exploran valores de 64, 128, 256, 512 y 1024 para el horizonte 32.

El entrenamiento se realiza sobre tres corpus: TinyStories, WikiText-103 y FineWeb-Edu. Para cada fuente se entrena ademas un modelo bigram de conteos, donde p(next | prev) se estima como cociente de conteos y, ante un `prev` no visto en entrenamiento, se recurre a una distribucion uniforme (backoff). La model card reporta entropia exacta sobre validacion y perdida de validacion en nats por token, lo que permite comparar directamente la calidad de cada variante. No se documenta el numero exacto de tokens de entrenamiento, la composicion detallada del dataset ni el uso de RLHF o DPO.

## Capacidades

- Generacion de texto autorregresiva limitada a un contexto maximo de 31 tokens.
- Modelado de lenguaje a nivel de token con probabilidades y logits del siguiente token.
- Estimacion de distribuciones de siguiente token mediante bigramas de conteos con backoff a uniforme.
- Generacion por lotes: la funcion `sample` admite `batch` y `n_tokens`, devolviendo tensores de identificadores de token.
- Calculo de entropia exacta y perdida de validacion para evaluacion controlada.
- Generacion de corpus sinteticos sobre las distribuciones aprendidas de cada fuente.
- No dispone de tool calling, function calling, capacidades de agente, vision, audio ni modo de razonamiento extendido.

## Casos de uso

- Generacion de datos sinteticos controlados: los generadores producen los corpus del dataset tree-gram-text, utiles para experimentos que requieren texto sintetico con distribucion conocida y trazable.
- Estudio de escalado de contexto: comparar la perdida de validacion entre `n3`, `n4`, `n8`, `n16` y `n32` sobre el mismo corpus permite analizar como mejora la prediccion al aumentar el contexto.
- Estudio de escalado de anchura: las variantes `n32_d64` a `n32_d1024` permiten medir el efecto de la dimension interna sobre la entropia exacta con horizonte fijo.
- Linea base de referencia: el modelo bigram de conteos sirve como baseline simple y reproducible frente al que medir modelos neuronales en tareas de modelado de lenguaje.
- Validacion de pipelines de evaluacion: la entropia exacta calculable facilita comprobar la correccion de herramientas de evaluacion antes de aplicarlas a modelos mayores.
- Docencia e investigacion: modelos pequenos y bien documentados para ilustrar modelado de lenguaje, backoff y estructuras jerarquicas en cursos y laboratorios.
- Experimentos de destilacion o comparacion: usar las distribuciones de estos generadores como referencia para estudiar divergencias entre modelos.

## Benchmarks y rendimiento

La model card no incluye benchmarks estandar como MMLU, HumanEval o GSM8K. En su lugar publica entropia exacta y perdida de validacion en nats por token para cada generador. Se reproducen a continuacion los valores de perdida de validacion.

| Generador | TinyStories (val loss) | WikiText-103 (val loss) | FineWeb-Edu (val loss) |
|---|---|---|---|
| bigram | 3.5682 | 4.9979 | 5.4287 |
| n3_d1024 | 2.8462 | 4.4224 | 4.9821 |
| n4_d1024 | 2.4993 | 4.2182 | 4.7133 |
| n8_d1024 | 2.0613 | 4.0328 | 4.4546 |
| n16_d1024 | 1.8476 | 3.9349 | 4.2983 |
| n32_d64 | 2.5499 | 4.9121 | 5.1460 |
| n32_d128 | 2.2915 | 4.6639 | 4.9117 |
| n32_d256 | 2.0142 | 4.3337 | 4.6225 |
| n32_d512 | 1.8829 | 4.1717 | 4.5043 |
| n32_d1024 | 1.7407 | 3.9298 | 4.3096 |

## Requisitos de hardware

- VRAM estimada: no disponible de forma agregada; el repositorio completo ocupa 6,8 GB en float32, pero cada generador individual es mucho menor. Las variantes con d=1024 son las mas pesadas y las de d=64 las mas ligeras.
- GPU recomendadas: cualquier GPU con suficiente memoria para el generador concreto; los modelos pequenos (d=64, d=128) caben en GPUs de consumo, mientras que las variantes d=1024 requieren mas memoria pero siguen siendo manejables en una unica GPU moderna.
- Cabe en GPU de consumo: si, para las variantes de menor anchura; las de mayor anchura dependen de la VRAM disponible.
- Opciones de despliegue: el codigo `modeling_treegram.py` solo requiere `torch` y `safetensors`; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tree-gram generators | no disponible (d 64-1024) | 1-31 tokens | Tree-gram autorregresivo y bigram de conteos | per-source (CDLA-Sharing-1.0, CC BY-SA 3.0, ODC-By 1.0) | Hugging Face |
| GPT-2 small | 124 M | 1024 tokens | Transformer decoder | MIT | Hugging Face |
| n-gram clasico | segun vocabulario | n-1 tokens | Conteos con backoff | depende del corpus | Implementaciones multiples |

No se dispone de comparativas de rendimiento publicadas frente a estos u otros modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Contexto muy limitado: el maximo es de 31 tokens, insuficiente para tareas de lenguaje reales que requieran coherencia a nivel de parrafo o documento.
- No es un asistente: carece de instrucciones, alineamiento, tool calling o cualquier capacidad conversacional.
- Riesgo de alucinacion: al ser modelos generativos sobre distribuciones aprendidas, pueden producir texto plausible pero incorrecto; no hay verificacion factual.
- Sesgos: heredan los sesgos de sus corpus de origen (TinyStories, WikiText-103, FineWeb-Edu), no documentados en detalle.
- Licencia restrictiva por fuente: el uso comercial queda condicionado por los terminos de cada corpus (CDLA-Sharing-1.0, CC BY-SA 3.0 y ODC-By 1.0), lo que puede exigir atribucion o compartir-al-igual.
- Idiomas: no se documenta cobertura multilingue; los corpus de origen son predominantemente en ingles.
- Uso en produccion: no apto para aplicaciones de usuario final; su proposito es la generacion de datos sinteticos y la investigacion.
- Sin datos de benchmarks estandar ni de latencia, lo que dificulta comparaciones directas con otros modelos.

## Enlaces

- Repositorio del modelo: https://huggingface.co/hugs-from-a-25/tree-gram-generators
- Dataset generado: https://huggingface.co/datasets/hugs-from-a-25/tree-gram-text
- Licencia: LICENSE.md en el repositorio del modelo
