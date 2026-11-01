# loco-ai/Jeffery

## Resumen

Jeffery es un modelo publicado en HuggingFace por el usuario loco-ai bajo la etiqueta de pipeline `zero-shot-classification`. La model card asociada es la plantilla por defecto de HuggingFace (`modelcard_template.md`) sin rellenar: practicamente todos los campos de descripcion, entrenamiento, evaluacion y uso contienen el marcador `[More Information Needed]`. No se dispone por tanto de informacion verificable sobre arquitectura, tamano, datos de entrenamiento ni procedencia del modelo.

La unica informacion concreta que aporta el autor es la licencia (MPL-2.0), la etiqueta de tarea (clasificacion zero-shot), una referencia generica al paper de Lacoste et al. (2019) sobre emisiones de carbono (arxiv:1910.09700) que aparece en la plantilla estandar, y la mencion de que el hardware empleado fue un "M5 pro on a Macbook Air". El repositorio registra cero descargas y cero likes en el momento de la consulta, y las fechas de creacion y actualizacion (28 de octubre de 2026) son las unicas marcas temporales disponibles.

Por todo ello, esta ficha debe interpretarse como una evaluacion de un artefacto practicamente sin documentar. Se recomienda precaucion antes de cualquier uso en produccion: no es posible confirmar que el modelo funcione siquiera para la tarea declarada, ni cuales son sus sesgos, limitaciones o requisitos reales de computo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MPL-2.0 (Mozilla Public License 2.0) |
| Formato de pesos | no disponible |
| Tarea declarada (pipeline) | zero-shot-classification |
| Autor | loco-ai |
| Fecha de creacion | 2026-10-28 |
| Ultima actualizacion | 2026-10-28 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No disponible. La model card no especifica el tipo de arquitectura (transformer, MoE, SSM u otra), el numero de parametros, la longitud de contexto nativa ni la composicion del corpus de entrenamiento. Tampoco se documenta si hubo fases de RLHF, DPO, SFT u otro tipo de ajuste, ni el numero de tokens vistos durante el preentrenamiento.

El unico dato tecnico relacionado con la infraestructura es la mencion, dentro de la seccion "Compute Infrastructure" de la plantilla, de un "M5 pro on a Macbook Air" como hardware empleado. Esta referencia es ambigua: no queda claro si se refiere al equipo usado para el entrenamiento, al usado para la inferencia o a un simple ejemplo de relleno de la plantilla. No se aportan hiperparametros, regimen de precision (fp16, bf16, fp8) ni detalles sobre preprocesamiento de datos.

## Capacidades

- Clasificacion zero-shot: es la unica capacidad declarada explicitamente mediante la etiqueta `pipeline_tag: zero-shot-classification`. No hay evidencia publicada de que el modelo la desempenie correctamente.
- Generacion de texto: no disponible.
- Razonamiento y matematicas: no disponible.
- Generacion de codigo: no disponible.
- Vision, audio o multimodalidad: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (el campo de idiomas de la model card esta vacio).
- Modo "thinking" o razonamiento extendido: no disponible.

## Casos de uso

Dado que la unica capacidad declarada es la clasificacion zero-shot, los casos de uso que se enumeran a continuacion son hipoteticos y condicionados a que el modelo funcione segun su etiqueta. No hay documentacion que respalde ninguno de ellos.

- Etiquetado de tickets de soporte: se usaria para asignar categorias predefinidas (facturacion, incidencia tecnica, cancelacion) sin entrenamiento especifico, aprovechando la naturaleza zero-shot del pipeline. Requiere validacion previa con un conjunto etiquetado propio.
- Moderacion de contenido en foros: clasificacion de mensajes en categorias como spam, ofensivo o legitimo mediante hipotesis textuales. La ausencia de documentacion sobre sesgos hace imprescindible una auditoria antes de desplegarlo.
- Enrutamiento de correo entrante: asignacion automatica de correos a departamentos (ventas, legal, RR. HH.) usando etiquetas descriptivas. Solo viable si el modelo supera una linea base trivial en una prueba controlada.
- Clasificacion de resenas de producto: deteccion de sentimiento o tematica con etiquetas definidas en tiempo de inferencia, sin reentrenamiento. Adecuado en teoria para catalogos cambiantes de categorias.
- Triaje de documentos legales o academicos: separacion de textos por tipo documental (contrato, sentencia, articulo) mediante hipotesis. La falta de datos sobre contexto maximo impide saber si admite documentos largos.
- Prototipado rapido de pipelines NLP: uso como componente inicial en pruebas de concepto de clasificacion antes de invertir en un modelo ajustado. Su licencia MPL-2.0 permite integrarlo en proyectos abiertos y propietarios con las obligaciones propias de esa licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye seccion de evaluacion cumplimentada (todos los campos de "Results" y "Testing Data" contienen `[More Information Needed]`), ni referencias a MMLU, HumanEval, GSM8K u otras pruebas estandar.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, al desconocerse el numero de parametros y el formato de pesos.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no determinable sin conocer el tamano del modelo.
- Opciones de despliegue: no documentadas. No se confirma soporte para vLLM, llama.cpp, Ollama, TGI ni transformers.
- Latencia y throughput: no disponibles.
- Unica referencia de hardware en la model card: "M5 pro on a Macbook Air", sin contexto sobre si corresponde a entrenamiento o inferencia.

## Comparativa con modelos similares

No es posible establecer una comparativa fiable sin conocer parametros, contexto ni rendimiento del modelo. A modo orientativo, se recogen alternativas consolidadas para clasificacion zero-shot, aunque la comparacion cuantitativa con Jeffery no puede realizarse:

| Modelo | Parametros | Contexto | Licencia | Documentacion |
|---|---|---|---|---|
| Jeffery (loco-ai) | no disponible | no disponible | MPL-2.0 | practicamente inexistente |
| BART-large-MNLI (Facebook) | ~400 M | 1024 tokens | MIT | extensa, benchmarks publicos |
| DeBERTa-v3-large (Microsoft) | ~435 M | 512 tokens | MIT | extensa, benchmarks publicos |
| MoritzLaurer/DeBERTa-v3-base-mnli | ~184 M | 512 tokens | MIT | extensa, benchmarks publicos |

La comparacion se limita a la disponibilidad de informacion y licencia; no se dispone de datos de rendimiento de Jeffery para contrastar.

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card es la plantilla por defecto sin rellenar, por lo que no se puede verificar que el modelo haya sido entrenado, evaluado o publicado con pesos funcionales.
- Riesgo de artefacto vacio o incompleto: con cero descargas y cero likes, y sin seccion de uso ni ejemplos de codigo, existe la posibilidad de que el repositorio no contenga un modelo utilizable.
- Sesgos desconocidos: al no documentarse los datos de entrenamiento, no es posible evaluar sesgos de genero, raza, idioma o dominio.
- Riesgo de alucinacion: no evaluable sin conocer la arquitectura y el entrenamiento; en tareas de clasificacion el riesgo se traduce en etiquetas incorrectas con alta confianza.
- Limitaciones de contexto e idioma: no disponibles; el campo de idiomas esta vacio y no se indica longitud de contexto.
- Licencia MPL-2.0: permite uso comercial y modificacion, pero obliga a publicar el codigo fuente de los archivos modificados del propio modelo o software cubierto y a conservar los avisos de licencia. No es una licencia de tipo copyleft fuerte sobre el conjunto de la obra, pero requiere revision legal si se integra en productos propietarios.
- Falta de soporte: no se indica repositorio, paper, demo ni contacto del autor; la seccion "Model Card Contact" esta vacia.
- Advertencia para produccion: no desplegar sin una evaluacion empirica propia sobre un conjunto de validacion etiquetado y sin auditar el contenido real del repositorio.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/loco-ai/Jeffery
- Plantilla de model card utilizada (referencia citada en el README): https://github.com/huggingface/huggingface_hub/blob/main/src/huggingface_hub/templates/modelcard_template.md
- Paper referenciado en la plantilla (Lacoste et al., 2019, sobre emisiones de carbono): https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental citada en la plantilla: https://mlco2.github.io/impact
- Repositorio, paper, demo y contacto del autor: no disponibles.
