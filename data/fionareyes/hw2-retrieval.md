# Fionareyes/hw2-retrieval

## Resumen

El modelo `Fionareyes/hw2-retrieval` es una implementación experimental de la arquitectura **Coca** (CoAttention) aplicada a tareas de **retrieval**, publicada por el usuario Fionareyes en Hugging Face. Se trata de una configuración de escala **nano**, con únicamente **24.832 parámetros**, lo que lo convierte en un ejemplo mínimo y didáctico más que en un modelo listo para producción. El repositorio incluye el código fuente (`predict.py`), la configuración de arquitectura (`config.json`), los argumentos de entrenamiento por defecto (`training_args.json`) y un checkpoint de inicialización (`model.safetensors`) que no ha sido entrenado ni validado.

El objetivo declarado del autor es ofrecer una implementación transparente y reproducible de Coca para retrieval, con énfasis en la claridad del código y en la posibilidad de ejecutar pruebas de humo (smoke tests). No se presentan resultados de benchmarks ni se afirma ningún rendimiento. La licencia es Apache 2.0, lo que permite uso libre, pero el modelo debe considerarse como un punto de partida experimental, no como un sistema funcional.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Coca (CoAttention) |
| Parametros totales | 24.832 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura se basa en **Coca**, un modelo de atención conjunta (co-attention) diseñado para tareas de retrieval multimodal o de texto. La configuración concreta incluye **multi-query attention** (atención de múltiples consultas), **fusión por co-atención**, activación **GELU con tangente hiperbólica** (gelu tanh) y **normalización por instancia** (InstanceNorm). El tamaño nano implica una capacidad muy reducida, adecuada únicamente para pruebas de concepto.

El repositorio no contiene información sobre el proceso de entrenamiento. El checkpoint `model.safetensors` es una inicialización válida para ejecutar los ejemplos de humo, pero no ha sido entrenado con ningún dataset. La configuración por defecto incluye el optimizador **LAMB** con un programador de tasa de aprendizaje por pasos (`step`), pero estos valores son solo el punto de partida del script y no evidencian un entrenamiento completado. No se mencionan técnicas como RLHF, DPO ni ajuste fino supervisado.

## Capacidades

Dado que el modelo no ha sido entrenado, no se pueden atribuir capacidades reales demostradas. Las siguientes son capacidades teóricas derivadas de su diseño arquitectónico:

- Diseñado para tareas de retrieval, presumiblemente comparando representaciones de consultas y documentos mediante co-atención.
- Soporte de entrada multimodal (texto e imagen) si se implementa el adaptador correspondiente, aunque no hay evidencia de ello.
- Capacidad de ejecutar pruebas de humo para verificar que el código y la inicialización funcionan.
- No hay soporte de tool calling, agentes, razonamiento multi-paso ni generación de texto, ya que la arquitectura no está orientada a generación autoregresiva.

## Casos de uso

Al ser un modelo sin entrenar, los casos de uso son limitados y principalmente educativos o de investigación:

- **Validación de implementaciones de Coca**: sirve como referencia para verificar que una implementación propia de co-atención funciona correctamente, comparando salidas con este checkpoint de inicialización.
- **Pruebas de integración en pipelines de retrieval**: se puede utilizar como un componente de prueba para comprobar que el flujo de datos (preprocesado, codificación, búsqueda) funciona antes de sustituirlo por un modelo entrenado.
- **Experimentos de entrenamiento desde cero**: investigadores pueden tomar este código y este checkpoint como punto de partida para entrenar un modelo Coca nano en un dataset pequeño como Flickr30k, tal como sugiere el propio autor.
- **Estudio de arquitecturas de atención conjunta**: estudiantes y desarrolladores pueden analizar el código para comprender cómo se implementa la co-atención y la fusión de características.
- **Benchmarking de recursos**: al ser extremadamente pequeño, permite medir el coste computacional de la arquitectura en hardware modesto sin necesidad de grandes recursos.
- **Prototipado rápido de sistemas de retrieval**: aunque no produce resultados útiles, puede servir para esbozar la estructura de un sistema completo antes de integrar un modelo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor declara explícitamente que no se presenta ninguna métrica de rendimiento y que el checkpoint no es un modelo entrenado. Por tanto, no hay datos de MMLU, HumanEval, GSM8K ni otros estándares.

## Requisitos de hardware

- Con solo 24.832 parámetros, el modelo cabe en cualquier CPU moderna y en cualquier GPU, incluso integradas.
- La VRAM necesaria es despreciable, inferior a 1 MB en precisión FP32.
- No se requieren GPUs específicas; cualquier entorno con Python y PyTorch es suficiente.
- Opciones de despliegue: dado que es una implementación personalizada, no es compatible directamente con vLLM, llama.cpp, Ollama ni TGI. Se debe ejecutar mediante el script `predict.py` o adaptándolo a un framework propio.
- Latencia y throughput: no se han medido, pero al ser un modelo tan pequeño, la inferencia es prácticamente instantánea.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría (Coca nano para retrieval). No se han encontrado referencias a otros modelos con esta arquitectura y escala en el repositorio ni en la búsqueda web. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo no ha sido entrenado: el checkpoint es solo una inicialización aleatoria, por lo que no produce resultados útiles para retrieval real.
- No se ha auditado la robustez, los sesgos ni la transferencia a otros dominios, como advierte el propio autor.
- No hay garantías de funcionamiento correcto en tareas fuera de las pruebas de humo.
- La implementación es personalizada y requiere un adaptador para ser cargada con APIs genéricas de Hugging Face.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no es apto para producción sin un entrenamiento completo y una evaluación rigurosa.
- No se especifican idiomas soportados ni longitud de contexto, lo que limita su aplicabilidad.

## Enlaces

- [Página del modelo en Hugging Face](https://huggingface.co/Fionareyes/hw2-retrieval)
- No se han encontrado otros enlaces relevantes (papers, blogs, repos) en la búsqueda web.
