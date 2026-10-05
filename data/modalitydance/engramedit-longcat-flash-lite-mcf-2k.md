# ModalityDance/EngramEdit-LongCat-Flash-Lite-MCF-2K

## Resumen

EngramEdit-LongCat-Flash-Lite-MCF-2K es un checkpoint de edicion de conocimiento desarrollado por ModalityDance para el modelo base LongCat-Flash-Lite de Meituan. No se trata de un modelo completo, sino de una actualizacion de la memoria condicional del modelo: EngramEdit aprende embeddings de n-gramas que participan en el calculo del modelo y los actualiza para incorporar hechos nuevos, manteniendo congelado el backbone Transformer.

El problema que resuelve es la edicion de conocimiento desacoplada: en lugar de reentrenar o modificar los pesos del Transformer, se actualizan exclusivamente las representaciones de memoria condicional. Segun sus autores, los hechos revisados se mantienen usables a traves de distintas formulaciones y en razonamiento multi-salto, mientras que el conocimiento no relacionado y las capacidades generales del modelo se preservan en gran medida.

Este checkpoint concreto contiene las actualizaciones correspondientes a 2.000 ediciones del benchmark CounterFact (MCF), con un tamano de repositorio de 0,1 GB. Forma parte de una familia de checkpoints del mismo proyecto que incluye variantes para ZsRE (2K) y MQuAKE (3K). El checkpoint se distribuye bajo licencia MIT, mientras que el modelo base se distribuye por separado bajo su propia licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Memoria condicional (n-gram embeddings) sobre backbone Transformer; el checkpoint solo contiene las actualizaciones de memoria |
| Parametros totales | no disponible (el checkpoint es una actualizacion de memoria, no un modelo completo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el ejemplo oficial carga el modelo en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | MIT (checkpoint); el modelo base se distribuye bajo su propia licencia |
| Formato de pesos | engramedit_state.pt (PyTorch), cargado junto al modelo base |

## Arquitectura y entrenamiento

EngramEdit opera sobre modelos con memoria condicional, un mecanismo que amplia la capacidad de un LLM mediante embeddings de n-gramas aprendidos que toman parte en el calculo del modelo. La innovacion consiste en actualizar unicamente esos embeddings para introducir o revisar hechos, dejando intacto el backbone Transformer. Esto permite un desacoplamiento entre el conocimiento editable y los pesos principales del modelo.

El checkpoint de este repositorio se ha obtenido aplicando el procedimiento EngramEdit sobre LongCat-Flash-Lite con 2.000 ediciones del dataset CounterFact (MCF). La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO, por lo que esos datos no estan disponibles. El uso documentado consiste en cargar el modelo base y, a continuacion, cargar las actualizaciones de memoria condicional mediante la funcion `prepare_engramedit_model`.

## Capacidades

- Edicion de conocimiento factual: permite actualizar hechos concretos de forma aislada, manteniendo el resto del conocimiento del modelo base.
- Generalizacion de hechos editados: segun la model card, los hechos revisados siguen siendo usables bajo distintas formulaciones de la pregunta.
- Razonamiento multi-salto: los autores indican que los hechos editados se conservan en cadenas de razonamiento que requieren varios pasos.
- Preservacion de capacidades generales: el diseno busca mantener intactas las capacidades no relacionadas con los hechos editados.
- Carga modular: el checkpoint se aplica sobre el modelo base sin reentrenar el Transformer ni regenerar expresiones.
- Generacion de texto base: hereda las capacidades de generacion del modelo LongCat-Flash-Lite.
- Soporte de tool calling, agentes, vision o audio: no disponible (no documentado en la informacion proporcionada).
- Capacidades multilingues: no disponible (no se especifican en la informacion proporcionada).

## Casos de uso

- Correccion de hechos desactualizados en produccion: cuando un dato concreto del modelo queda obsoleto (por ejemplo, un cargo o una fecha), se puede aplicar un checkpoint EngramEdit que actualice ese hecho sin reentrenar el modelo completo.
- Investigacion en edicion de conocimiento: sirve como referencia reproducible para comparar tecnicas de knowledge editing sobre un backbone fijo, usando el benchmark CounterFact.
- Evaluacion de propagacion de ediciones: permite estudiar hasta que punto un hecho editado se generaliza a parafrasis y a preguntas multi-salto, y cuanto conocimiento no relacionado se degrada.
- Personalizacion controlada de asistentes: en entornos donde se requiere un conjunto acotado de hechos especificos del dominio, se pueden incorporar mediante memoria condicional sin tocar el resto del modelo.
- Auditoria de robustez de ediciones: util para medir la estabilidad de la edicion frente a reformulaciones y la preservacion de capacidades generales antes de desplegar cambios.
- Experimentacion con almacenamiento ligero de conocimiento: al ser un checkpoint de 0,1 GB, facilita intercambiar conjuntos de ediciones (CounterFact, ZsRE, MQuAKE) sin duplicar el modelo base.
- Base para pipelines de edicion por lotes: el flujo de carga modular permite mantener varias versiones de memoria condicional y alternarlas segun la tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card enlaza a una seccion de evaluacion en el repositorio de GitHub del proyecto, pero no incluye cifras concretas en los datos proporcionados.

## Requisitos de hardware

- El checkpoint en si ocupa 0,1 GB y no determina los requisitos de hardware; estos dependen del modelo base LongCat-Flash-Lite sobre el que se carga.
- VRAM para inferencia: no disponible (depende del modelo base, cuyas especificaciones no se detallan en la informacion proporcionada).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Precisión usada en el ejemplo oficial: bfloat16.
- Opciones de despliegue: el flujo documentado usa PyTorch junto con la libreria EngramEdit (`prepare_engramedit_model`) y `huggingface_hub` para descargar el checkpoint. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria, ni datos de rendimiento que permitan establecer una comparacion cuantitativa con otras tecnicas de edicion de conocimiento.

## Limitaciones y advertencias

- Se trata de un checkpoint de edicion, no de un modelo autonomo: requiere el modelo base LongCat-Flash-Lite y el codigo de EngramEdit para funcionar.
- Los objetivos de CounterFact son ediciones de benchmark, no afirmaciones sobre hechos del mundo real; la propia model card advierte de ello.
- Las respuestas mostradas en el ejemplo son ilustrativas y no salidas registradas del checkpoint.
- Riesgo de alucinacion: no evaluado en la informacion disponible; se hereda el comportamiento del modelo base.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Limitaciones de contexto o idioma: no documentadas.
- Licencia: el checkpoint es MIT, pero el modelo base LongCat-Flash-Lite se distribuye bajo su propia licencia, que debe revisarse por separado antes de un uso comercial.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- Para produccion: no hay datos publicos sobre latencia, throughput, estabilidad de las ediciones ni tasas de degradacion, por lo que se recomienda validacion propia antes de desplegar.

## Enlaces

- HuggingFace (checkpoint MCF-2K): https://huggingface.co/ModalityDance/EngramEdit-LongCat-Flash-Lite-MCF-2K
- Modelo base LongCat-Flash-Lite: https://huggingface.co/meituan-longcat/LongCat-Flash-Lite
- Pagina del proyecto: https://modalitydance.github.io/EngramEdit/
- Repositorio de codigo (GitHub): https://github.com/ModalityDance/EngramEdit
- Ejemplo de uso: https://github.com/ModalityDance/EngramEdit#usage-example
- Evaluacion: https://github.com/ModalityDance/EngramEdit#direct-evaluation
- Checkpoint CounterFact 2K: https://huggingface.co/ModalityDance/EngramEdit-LongCat-Flash-Lite-MCF-2K
- Checkpoint ZsRE 2K: https://huggingface.co/ModalityDance/EngramEdit-LongCat-Flash-Lite-ZsRE-2K
- Checkpoint MQuAKE 3K: https://huggingface.co/ModalityDance/EngramEdit-LongCat-Flash-Lite-MQuAKE-3K
- Paper: no disponible (el enlace figura como placeholder en la model card; la referencia es Cai et al., 2026, "EngramEdit: Decoupled Knowledge Updates in LLMs through Conditional Memory")
