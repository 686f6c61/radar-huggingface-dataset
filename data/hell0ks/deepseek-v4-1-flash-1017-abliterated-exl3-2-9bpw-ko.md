# hell0ks/DeepSeek-V4.1-Flash-1017-abliterated-EXL3-2.9bpw-ko

## Resumen

DeepSeek-V4.1-Flash-1017-abliterated-EXL3-2.9bpw-ko es una cuantizacion EXL3 de 2,9 bits por peso del checkpoint abliterated mrfakename/DeepSeek-V4.1-Flash-1017-abliterated, un derivado de la familia DeepSeek-V4.1 Flash. El modelo lo publica el usuario hell0ks y esta pensado para ejecutarse con ExLlamaV3 sobre hardware con memoria limitada, ya que reduce un modelo de aproximadamente 105.318 millones de parametros a un repositorio de 210,8 GB. La arquitectura de origen es un transformer con mezcla de expertos (MoE), segun indican las etiquetas del repositorio, aunque la model card no detalla el numero de expertos ni los parametros activos.

El rasgo diferencial de esta publicacion es su calibracion especifica para coreano: los datasets de calibracion son practicamente todos en coreano (ficcion, prosa general, codigo, matematicas y STEM), con aproximadamente 511.000 tokens en total. Esto la convierte en una opcion orientada a cargas de trabajo en ese idioma, aunque el modelo base conserva las capacidades multilingues de la familia DeepSeek. El campo de idioma del repositorio solo declara `ko`.

La variante es ademas "abliterated", es decir, se ha eliminado la direccion de rechazo en el espacio de activaciones, lo que reduce las negativas del modelo a responder ciertas peticiones. Esto tiene implicaciones eticas y de cumplimiento importantes para cualquier despliegue en produccion. La licencia declarada es MIT, lo que facilita el uso comercial, pero conviene verificar las condiciones del modelo base original de DeepSeek antes de explotarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), etiqueta `deepseek_v41` |
| Parametros totales | 105.318.449.362 (~105,3 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 a 2,9 bits por peso (unica variante publicada en este repo) |
| Idiomas soportados | Coreano (`ko`) declarado; el modelo base es multilingue pero no se detalla en la ficha |
| Licencia | MIT |
| Formato de pesos | safetensors en formato EXL3 (ExLlamaV3) |

## Arquitectura y entrenamiento

El modelo base pertenece a la familia DeepSeek-V4.1 Flash, un transformer con mezcla de expertos segun la etiqueta `moe` y el identificador de arquitectura `deepseek_v41`. La model card no aporta detalles sobre el numero de expertos, la proporcion de parametros activos por token, el mecanismo de atencion ni la ventana de contexto nativa. Tampoco se documenta el proceso de entrenamiento original (numero de tokens, composicion del corpus, uso de RLHF o DPO).

Lo que si se documenta es el proceso de cuantizacion: se trata de un checkpoint EXL3 (formato de ExLlamaV3) a 2,9 bits por peso, calibrado con un conjunto de datos coreano de aproximadamente 511.000 tokens. La composicion de calibracion es 40% ficcion (privada), 10% prosa general (privada), 35% codigo del subconjunto `code_ko` de nvidia/Nemotron-SFT-Multilingual-v2, 10% matematicas (`math_ko`) y 5% STEM (`stem_ko`). El autor advierte que el repositorio no incluye los "engrams" (fragmentos 47-48) y que reutiliza el `chat_template.jinja` del checkpoint LibertAIDAI/DeepSeek-V4.1-Flash-1017-EXL3-2.9bpw. La calibracion centrada en coreano sugiere que la cuantizacion esta optimizada para preservar calidad en ese idioma, a costa potencial de otros.

## Capacidades

- Generacion de texto conversacional y continuacion de prosa, con calibracion especifica para ficcion y prosa general en coreano.
- Generacion de codigo, reforzada por el 35% de datos de calibracion del subconjunto `code_ko`.
- Razonamiento matematico y STEM, con calibracion en `math_ko` y `stem_ko`.
- Capacidades multilingues heredadas del modelo base DeepSeek-V4.1 Flash (no detalladas en la ficha).
- Modo "abliterated": respuestas sin el filtrado de rechazo habitual, lo que amplia el rango de peticiones que atiende.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Generacion de ficcion y narrativa en coreano: la calibracion dedica un 40% a ficcion, por lo que el checkpoint preserva mejor el estilo y la coherencia en textos creativos coreanos que una cuantizacion generica.
- Asistencia a la escritura y correccion de prosa en coreano: el 10% de prosa general en la calibracion permite usar el modelo para reescritura, resumen y pulido de textos, aprovechando el `chat_template.jinja` incluido.
- Generacion de codigo con comentarios y documentacion en coreano: el 35% de datos `code_ko` hace que el modelo sea adecuado para tareas de autocompletado y explicacion de codigo en equipos que trabajan en ese idioma.
- Tutoria de matematicas y STEM en coreano: el 15% combinado de `math_ko` y `stem_ko` respalda la resolucion de problemas y la explicacion paso a paso en ese dominio e idioma.
- Despliegue en entornos con VRAM limitada: al ser una cuantizacion de 2,9 bpw sobre un modelo de ~105.000 millones de parametros, permite servir el modelo en configuraciones multi-GPU de consumo o estaciones de trabajo, siempre que se use ExLlamaV3.
- Investigacion sobre alineacion y seguridad: al ser un checkpoint abliterated, sirve para estudiar el comportamiento de modelos sin capa de rechazo, comparar respuestas frente a la version original y analizar sesgos y riesgos.
- Experimentacion con tecnicas de cuantizacion: la receta de calibracion por idioma y dominio (ficcion, codigo, matematicas) es un caso de estudio para evaluar el impacto de la calibracion en la calidad final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 210,8 GB en formato EXL3 a 2,9 bpw, por lo que se necesita un total de memoria igual o superior a esa cifra, repartida entre GPUs.
- GPU recomendadas: no se especifican en la ficha; por el tamano del checkpoint, se requiere un despliegue multi-GPU (por ejemplo, varias GPU de 24 GB o superiores) o GPUs de datacenter con 80 GB como A100 o H100 en configuracion tensor-parallel.
- Cabe en consumer GPU: no en una sola; si en un conjunto de varias RTX 4090 (24 GB) sumando al menos ~211 GB de VRAM, sujeto a la configuracion de ExLlamaV3.
- Opciones de despliegue: ExLlamaV3 (formato nativo EXL3). El autor menciona compatibilidad con el fork TensorFold de bartholomus para 2xGB10 y con la receta de MiaAI-Lab. No se indica soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| hell0ks/DeepSeek-V4.1-Flash-1017-abliterated-EXL3-2.9bpw-ko | ~105,3 mil millones | no disponible | EXL3 2,9 bpw | MIT | Calibracion en coreano, abliterated |
| mrfakename/DeepSeek-V4.1-Flash-1017-abliterated | no disponible | no disponible | no disponible (modelo base) | no disponible | Base abliterated sin cuantizar |
| LibertAIDAI/DeepSeek-V4.1-Flash-1017-EXL3-2.9bpw | no disponible | no disponible | EXL3 2,9 bpw | no disponible | Origen del `chat_template.jinja`, calibracion distinta |

No se dispone de datos de benchmarks ni de especificaciones completas de las alternativas para una comparacion cuantitativa de rendimiento.

## Limitaciones y advertencias

- El checkpoint es "abliterated": se ha eliminado la direccion de rechazo, por lo que puede generar contenido que los modelos alineados rechazarian. Requiere filtros y politicas de uso adicionales en produccion.
- La calibracion esta centrada en coreano; el rendimiento en castellano u otros idiomas puede degradarse respecto al modelo base sin cuantizar.
- El repositorio no incluye los "engrams" (fragmentos 47-48), lo que puede afectar a la integridad del modelo en ciertas rutas de ejecucion.
- Riesgo de alucinacion: no se documenta ninguna evaluacion especifica; aplica el riesgo habitual de los modelos generativos.
- La model card no detalla sesgos conocidos ni evaluaciones de seguridad.
- La licencia declarada es MIT, pero conviene verificar la licencia del modelo base original de DeepSeek y del checkpoint abliterated intermedio antes de uso comercial.
- Solo se declara el idioma coreano en los metadatos; el soporte multilingue no esta verificado para esta cuantizacion.
- Requiere ExLlamaV3 y un despliegue multi-GPU; no es apto para inferencia en una unica GPU de consumo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/hell0ks/DeepSeek-V4.1-Flash-1017-abliterated-EXL3-2.9bpw-ko
- Modelo base: https://huggingface.co/mrfakename/DeepSeek-V4.1-Flash-1017-abliterated
- Checkpoint de referencia del chat template: https://huggingface.co/LibertAIDAI/DeepSeek-V4.1-Flash-1017-EXL3-2.9bpw
- Dataset de calibracion: https://huggingface.co/datasets/nvidia/Nemotron-SFT-Multilingual-v2
- Fork TensorFold: https://github.com/bertholomus/deepseek-v4.1-tensorfold-tp2-2xgb10
- Receta MiaAI-Lab: https://github.com/MiaAI-Lab/GLM-5.3-Flash-EXL3-2x-DGX-Sparks
