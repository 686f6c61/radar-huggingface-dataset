# FlameF0X/fwkv100m

## Resumen

Myosotis es un modelo de lenguaje recurrente de aproximadamente 101,9 millones de parametros desarrollado por FlameF0X (Daniel Fox), basado en la arquitectura FWKV (Feed-forward Weighted Key Value). Se trata de un checkpoint intermedio de preentrenamiento correspondiente al paso 13500, publicado en HuggingFace bajo licencia Apache 2.0. La arquitectura FWKV fue propuesta por el mismo autor en mayo de 2026 como un proyecto paralelo inspirado en RWKV, con el objetivo de ofrecer una alternativa recurrente a los Transformers que fuese mas rapida en CPU.

El modelo esta diseñado como un asistente conversacional con identidad propia ("You are Myosotis, a helpful assistant made by FlameF0X") y esta orientado a la generacion de texto. Su relevancia radica en explorar una arquitectura alternativa a los Transformers densos y MoE, con un enfoque en la eficiencia computacional en hardware convencional. Al ser un checkpoint intermedio de preentrenamiento, no ha pasado por fases de ajuste fino o alineacion, lo que limita sus capacidades conversacionales en este estado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FWKV (Feed-forward Weighted Key Value), recurrente |
| Parametros totales | 101.860.800 (~101,9 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, compatible con ONNX) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

FWKV es una arquitectura recurrente de lenguaje propuesta por FlameF0X en 2026. Segun la pagina oficial del proyecto, FWKV se describe como "Simplicity Is All You Need" y se posiciona como una alternativa a los Transformers densos y MoE con un rendimiento superior en CPU convencionales. La arquitectura se inspira directamente en RWKV, adoptando su enfoque de recurrencia para evitar el coste cuadratico de la atencion, pero introduciendo una formulacion propia basada en valores clave ponderados por alimentacion directa (feed-forward weighted key value).

El modelo presentado es un checkpoint de preentrenamiento en el paso 13500. No se dispone de informacion detallada sobre la composicion del dataset de entrenamiento, el numero total de tokens procesados, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. La perplejidad en el conjunto de validacion se indica como "N/A" en la model card. El entrenamiento se realizo probablemente con la libreria transformers de HuggingFace, dado que el modelo se publica con esa integracion y requiere codigo personalizado (custom_code) para su carga.

## Capacidades

- Generacion de texto autoregresiva con arquitectura recurrente.
- Soporte de extraccion de caracteristicas (feature-extraction).
- Identidad de asistente conversacional definida en el system prompt.
- Compatible con el ecosistema transformers de HuggingFace.
- Exportacion a formato ONNX para inferencia en multiples plataformas.
- Inferencia eficiente en CPU gracias al diseño recurrente de FWKV.
- Preentrenamiento en ingles.

## Casos de uso

- Prototipado de arquitecturas recurrentes: investigadores pueden utilizar este checkpoint para estudiar el comportamiento de FWKV en fase de preentrenamiento y compararlo con arquitecturas Transformer de tamano similar.
- Inferencia en CPU sin GPU: gracias al diseño recurrente de FWKV, el modelo puede ejecutarse en entornos sin aceleracion GPU, lo que lo hace util para despliegues en edge computing o entornos con restricciones de hardware.
- Extraccion de caracteristicas para NLP: al estar preentrenado, las representaciones internas del modelo pueden utilizarse como embeddings contextuales para tareas downstream.
- Educacion e investigacion en arquitecturas alternativas: sirve como caso de estudio de una arquitectura recurrente moderna que compite con Transformers en eficiencia.
- Desarrollo de asistentes conversacionales experimentales: la identidad de Myosotis permite explorar comportamientos de asistente en un modelo sin alineacion posterior.
- Evaluacion de escalabilidad: al ser un checkpoint intermedio, permite analizar la evolucion de las metricas de perplejidad durante el preentrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de evaluacion estandar como MMLU, HumanEval o GSM8K, y la perplejidad en validacion se indica como "N/A". El autor menciona en la pagina del proyecto FWKV que la arquitectura es "mas rapida que cualquier Transformer denso o MoE de tamano similar en CPUs ordinarias", pero no se proporcionan datos cuantitativos concretos en las fuentes revisadas.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de ~102 M de parametros, el checkpoint en fp32 ocupa aproximadamente 407 MB. En cuantizacion de 8 bits cabria en unos 102 MB, y en 4 bits en unos 51 MB.
- GPU recomendadas: cualquier GPU con mas de 1 GB de VRAM es suficiente. Modelos como GTX 1650, RTX 3060 o superiores son mas que adecuadas. Tambien puede ejecutarse en CPU sin problemas.
- Compatibilidad con consumer GPU: si, cabe en cualquier GPU de consumo actual.
- Opciones de despliegue: al usar la libreria transformers, es compatible con pipelines de HuggingFace, y el formato ONNX permite usar ONNX Runtime. No se menciona soporte explicito para vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles, aunque el diseño recurrente sugiere un coste de inferencia constante por token independiente de la longitud del contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Myosotis (fwkv100m) | 101,9 M | FWKV recurrente | no disponible | Apache 2.0 | Checkpoint intermedio de preentrenamiento |
| RWKV-5 169M | 169 M | RWKV recurrente | 8192 | Apache 2.0 | Arquitectura similar, mas parametros |
| TinyLlama 1.1B | 1.100 M | Transformer denso | 2048 | Apache 2.0 | Mucho mayor, requiere mas recursos |

FWKV se inspira directamente en RWKV, por lo que RWKV-5 169M es la comparativa mas natural. Myosotis tiene menos parametros y es un checkpoint intermedio, mientras que RWKV-5 cuenta con versiones finales y alineadas. Frente a un Transformer denso como TinyLlama, FWKV ofrece la ventaja de un coste de inferencia constante por token, pero con una capacidad de modelado posiblemente inferior debido a su menor tamano.

## Limitaciones y advertencias

- Checkpoint intermedio: al ser el paso 13500 de preentrenamiento, el modelo no ha completado su entrenamiento ni ha pasado por fases de ajuste fino o alineacion. Su calidad de generacion puede ser significativamente inferior a la de modelos finales.
- Sin alineacion: no se aplicaron tecnicas como RLHF o DPO, por lo que el modelo puede generar contenido inapropiado, ofensivo o incoherente.
- Idioma unico: solo entrenado en ingles, sin soporte para otros idiomas.
- Riesgo de alucinacion: como todos los modelos de lenguaje, puede inventar informacion o producir respuestas factualmente incorrectas.
- Documentacion limitada: no se dispone de informacion sobre el dataset de entrenamiento, la longitud de contexto, ni benchmarks de rendimiento.
- Codigo personalizado: requiere custom_code para cargar el modelo en transformers, lo que puede generar problemas de compatibilidad o seguridad si no se audita el codigo.
- Autor joven: el autor indica tener 18 años y pide que no se le contacte, lo que sugiere que el soporte y mantenimiento del proyecto pueden ser limitados.
- Tamano del repositorio: 3,3 GB para un modelo de 102 M de parametros sugiere que se incluyen multiples formatos o checkpoints adicionales, lo que puede complicar la descarga.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/FlameF0X/fwkv100m
- Coleccion FWKV del autor: https://huggingface.co/collections/FlameF0X/fwkv
- Pagina oficial del proyecto FWKV: https://fwkv.github.io/
- Perfil de HuggingFace del autor: https://huggingface.co/FlameF0X/spaces
- Repositorios GitHub del autor: https://github.com/FlameF0X?tab=repositories
