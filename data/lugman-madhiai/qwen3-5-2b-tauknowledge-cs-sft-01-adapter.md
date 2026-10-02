# lugman-madhiai/Qwen3.5-2B-TauKnowledge-CS-SFT-01-adapter

## Resumen

Este repositorio contiene un adaptador de fine-tuning supervisado (SFT) denominado `Qwen3.5-2B-TauKnowledge-CS-SFT-01-adapter`, desarrollado por el usuario lugman-madhiai. No se trata de un modelo completo, sino de un conjunto de pesos de adaptador (0,1 GB) pensado para aplicarse sobre el modelo base `Qwen/Qwen3.5-2B` de Alibaba Qwen. El entrenamiento se realizó con las librerías TRL y Unsloth, según los tags y la propia model card, que indica que el modelo se entrenó "2x faster with Unsloth".

El nombre sugiere un ajuste orientado a conocimiento de dominio, aparentemente relacionado con "TauKnowledge" y "CS" (ciencias de la computacion), aunque la model card no documenta el dataset, el numero de tokens ni la metodologia exacta de entrenamiento. El adaptador esta publicado bajo licencia Apache 2.0 y declara unicamente el idioma ingles, con cero descargas y cero "likes" en el momento de la consulta, lo que indica que es un artefacto de investigacion personal y no un modelo ampliamente validado.

Su relevancia es limitada pero concreta: sirve como ejemplo reproducible de fine-tuning eficiente de un modelo pequeno (2B) con Unsloth, util para desarrolladores que quieran inspeccionar o reutilizar un adaptador ligero sobre la familia Qwen3.5. Cabe advertir que no se han publicado evaluaciones, benchmarks ni detalles del pipeline, por lo que cualquier uso en produccion deberia ir precedido de una validacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (adaptador sobre Qwen3.5-2B; el modelo base pertenece a la familia Qwen3.5, descrita por Qwen como vision-language nativa) |
| Parametros totales | no disponible (adaptador LoRA/SFT; el modelo base es de 2B parametros) |
| Parametros activos | no aplica (no se indica que el modelo base sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos del adaptador se distribuyen en safetensors; no se documentan cuantizaciones propias) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base `Qwen/Qwen3.5-2B` en la informacion proporcionada, mas alla de que pertenece a la familia Qwen3.5. Los resultados de busqueda describen Qwen3.5 como una familia que integra aprendizaje multimodal, eficiencia arquitectonica y aprendizaje por refuerzo a escala, y citan explicitamente la variante `Qwen3.5-397B-A17B` como modelo nativo vision-language. No obstante, no se confirma en la informacion disponible si la variante de 2B conserva capacidades de vision o es exclusivamente de texto.

En cuanto al adaptador, la model card es minima. Indica que se entreno con Unsloth (que reduce el coste de entrenamiento respecto a implementaciones estandar) y que se subio como modelo ajustado, con la etiqueta `trl`, lo que apunta a un entrenamiento de tipo SFT mediante la libreria TRL. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases posteriores de RLHF o DPO. Tampoco se documentan innovaciones tecnicas propias del adaptador.

## Capacidades

- Generacion de texto en ingles: al ser un adaptador sobre un modelo causal de lenguaje, la funcion principal es la generacion de texto.
- Ajuste orientado a conocimiento de dominio: el nombre "TauKnowledge-CS" sugiere un SFT enfocado en conocimiento especifico, presumiblemente de ciencias de la computacion, aunque no se documenta el alcance real.
- Tool calling / function calling: no disponible; no se declara soporte explicito en la model card ni en los tags.
- Soporte de agentes y razonamiento multi-paso: no disponible; no se documenta para este adaptador (existen adaptadores hermanos como `Qwen3.5-2B-SearchAgent-SFT-01/02` del mismo autor, orientados a agentes, pero son artefactos distintos).
- Capacidades multilingues: limitadas al ingles segun la etiqueta `language: en`.
- Capacidades especiales (thinking mode, vision, audio): no disponible para este adaptador. La multimodalidad se atribuye a la familia Qwen3.5 en la documentacion publica, pero no se confirma para esta variante de 2B ni para el adaptador.

## Casos de uso

- Investigacion sobre fine-tuning eficiente: el adaptador sirve como caso de estudio de SFT ligero de un modelo de 2B con Unsloth y TRL, util para reproducir pipelines de bajo coste en una sola GPU.
- Prototipado de asistentes de dominio especifico: aplicando el adaptador sobre Qwen3.5-2B se puede evaluar si el ajuste mejora respuestas en el area de conocimiento objetivo (aparentemente informatica), siempre con validacion previa.
- Base para experimentos de evaluacion comparativa: permite medir la diferencia entre el modelo base y la version ajustada en tareas de generacion y conocimiento, como paso previo a decidir si merece la pena escalar el dataset.
- Generacion de texto auxiliar en ingles: redaccion, resumen o reformulacion de contenido tecnico en ingles con un modelo pequeno desplegable en hardware de consumo.
- Punto de partida para fusion de adaptadores: al ser un adaptador PEFT, puede combinarse o compararse con otros adaptadores del mismo autor (por ejemplo los de tipo SearchAgent) para estudiar interacciones entre ajustes.
- Educacion y demostraciones: ilustrar en un articulo o clase como se publica un adaptador en HuggingFace, que metadatos son obligatorios y por que una model card incompleta limita la reproducibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Los siguientes valores son estimaciones estandar para un modelo de 2B parametros; el repositorio no publica cifras oficiales.
- VRAM estimada para inferencia del modelo base combinado con el adaptador: en fp16, aproximadamente 4-5 GB de pesos mas el overhead de activaciones y cache KV; en cuantizacion de 8 bits, en torno a 2-3 GB; en 4 bits, en torno a 1,5-2 GB.
- GPU recomendadas para fp16: NVIDIA A100, H100, L40S o RTX 4090/A6000 con al menos 8-10 GB de VRAM.
- GPU de consumo: cabe holgadamente en RTX 3060 12 GB, RTX 4060 Ti, RTX 4070/4080/4090 y GPUs con 8 GB o mas usando cuantizacion de 4 u 8 bits. Tambien puede ejecutarse en CPU con llama.cpp para pruebas.
- Opciones de despliegue: transformers (carga del adaptador con PEFT), vLLM, TGI (segun los tags `text-generation-inference` y `endpoints_compatible`), llama.cpp/Ollama tras fusionar el adaptador y convertir a GGUF. Existe una entrada `qwen3.5:2b` en Ollama para el modelo base.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (Qwen3.5-2B-TauKnowledge-CS-SFT-01) | Adaptador sobre base 2B | no disponible | no publicado | apache-2.0 | HuggingFace, 0 descargas |
| Qwen3.5-2B (base) | 2B | no disponible | Segmentado por Qwen frente a Qwen3-1.7B, Qwen3-4B-2507 y Qwen3-VL 2B/4B | no disponible en la busqueda | HuggingFace, Modal, Ollama |
| Qwen3-1.7B | 1,7B | no disponible | Referencia de comparacion citada por Qwen | no disponible en la busqueda | HuggingFace |
| Qwen3-4B-2507 | 4B | no disponible | Referencia de comparacion citada por Qwen | no disponible en la busqueda | HuggingFace |

## Limitaciones y advertencias

- Model card practicamente vacia: no se documentan dataset, hiperparametros, numero de tokens ni metodologia de evaluacion, lo que impide reproducir el entrenamiento.
- Sin evaluacion publica: cero descargas y cero "likes"; no hay evidencia de rendimiento mas alla de lo que declare el autor.
- Dependencia del modelo base: es un adaptador, por lo que requiere descargar y cargar `Qwen/Qwen3.5-2B` para funcionar; no es un modelo autonomo.
- Idioma: declarado solo en ingles, lo que limita su uso directo en castellano u otros idiomas.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de este tamano; el ajuste SFT no garantiza veracidad, especialmente en conocimiento tecnico especializado.
- Sesgos: no se documentan analisis de sesgo; al heredar los del modelo base, pueden aparecer sesgos no cuantificados.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y de las dependencias de entrenamiento (Unsloth, TRL).
- Produccion: no recomendable sin validacion previa en el dominio objetivo y sin pruebas de robustez, dado el estado experimental del artefacto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lugman-madhiai/Qwen3.5-2B-TauKnowledge-CS-SFT-01-adapter
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Adaptador hermano (SearchAgent-SFT-01): https://huggingface.co/lugman-madhiai/Qwen3.5-2B-SearchAgent-SFT-01
- Adaptador hermano (SearchAgent-SFT-02): https://huggingface.co/lugman-madhiai/Qwen3.5-2B-SearchAgent-SFT-02
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- Blog de Qwen sobre Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Ficha de Qwen3.5 2B en Modal: https://modal.com/library/qwen/qwen3-5-2b
- Entrada de qwen3.5:2b en Ollama: https://ollama.com/library/qwen3.5:2b
