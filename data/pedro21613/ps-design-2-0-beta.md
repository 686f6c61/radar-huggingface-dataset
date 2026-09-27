# Pedro21613/PS-design-2.0-beta

## Resumen

PS Design 2.0 beta es un modelo en fase beta publicado por el usuario Pedro21613 en Hugging Face, orientado a la generacion de codigo de interfaz (design-to-code) a partir de diseños. En el momento de la consulta el repositorio no contiene pesos: la model card indica que el entrenamiento sigue en curso en Kaggle sobre 2x NVIDIA T4 con DDP (DistributedDataParallel) y que los pesos mergeados se publicaran automaticamente al finalizar.

El autor declara un corpus de aproximadamente 50.000 diseños diversos, construido a partir de WebSight v0.2 y Design2Code, dos recursos publicos habituales para tareas de imagen/descripcion a HTML y CSS. No se especifica arquitectura, numero de parametros, longitud de contexto, tokenizador, idiomas soportados ni estrategia de alineamiento.

La relevancia de la ficha es limitada por ahora: se trata de un repositorio placeholder, con 0 descargas, 0 likes, sin pipeline declarado, sin licencia y sin ficheros de pesos. Cualquier evaluacion tecnica queda pendiente de la publicacion del merge final. El mismo autor mantiene una linea previa, PS-1.0-GGUF, un modelo pequeno entrenado desde cero con arquitectura llama y licencia Apache 2.0, lo que da contexto sobre el perfil del proyecto, pero no permite extrapolar especificaciones a esta version.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no especificada en la model card) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se anuncian pesos cuantizados para esta version) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (no hay ficheros de pesos publicados; el autor anuncia un merge futuro) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura. Los unicos datos de entrenamiento declarados son: aproximadamente 50.000 diseños como corpus, composicion basada en WebSight v0.2 y Design2Code, y una ejecucion distribuida en Kaggle sobre 2 GPUs NVIDIA T4 con DDP. No se indica el numero de tokens de entrenamiento, la mezcla exacta de datos, la resolucion o el formato de las imagenes de entrada, ni si hubo etapas de ajuste por instrucciones, RLHF o DPO.

Como innovacion tecnica, la informacion disponible no recoge ninguna: no se mencionan decodificacion especulativa, atencion lineal, atencion por ventanas ni tecnicas de compresion. El unico hecho relevante de ingenieria es la estrategia de publicacion automatica del merge de pesos al terminar el entrenamiento. El linaje del autor sugiere modelos de tamano reducido entrenados desde cero, pero esto corresponde a PS-1.0-GGUF y no debe atribuirse a PS Design 2.0 beta sin confirmacion.

## Capacidades

- Generacion de interfaces a partir de diseños: es el objetivo declarado del entrenamiento (design-to-code). No puede verificarse porque los pesos no estan publicados.
- Generacion de texto general: no disponible.
- Razonamiento y matematicas: no disponible.
- Generacion de codigo fuera del ambito de UI: no disponible.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible. La tarea de design-to-code implica entrada visual en el entrenamiento, pero el autor no confirma que la version final acepte imagenes como entrada.

## Casos de uso

Deben considerarse escenarios potenciales, condicionados a que el autor publique pesos funcionales y una licencia que permita uso comercial. Con esa cautela:

- Conversion de mockups a HTML/CSS: dado un diseño de Figma o una captura, generar el marcado y los estilos correspondientes. Es el caso de uso nuclear del corpus declarado (WebSight v0.2 y Design2Code estan construidos precisamente para esa tarea).
- Prototipado rapido de landing pages: producir un borrador de pagina estatica a partir de una descripcion o una imagen, para iterar despues manualmente en el editor.
- Migracion de interfaces legacy: tomar capturas de pantallas antiguas y regenerar su estructura con un stack moderno de maquetacion.
- Generacion de componentes para un design system: crear variantes de botones, tarjetas o formularios siguiendo un patron visual de referencia.
- Evaluacion comparativa de pipelines design-to-code: usar el modelo como baseline adicional frente a otros generadores de UI, siempre que se publiquen pesos y resultados reproducibles.
- Aumento de datos para entrenamiento: emplear el modelo para sintetizar pares diseño-codigo adicionales y ampliar datasets de la misma familia.
- Asistencia en herramientas de edicion web: integracion en un editor que traduzca un boceto a codigo editable dentro del propio flujo de trabajo del disenador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para entrenamiento: 2x NVIDIA T4, es decir 32 GB agregados en configuracion DDP sobre Kaggle. Es el unico dato de hardware confirmado.
- Precision de entrenamiento: no disponible.
- VRAM estimada para inferencia: no disponible, al desconocerse el numero de parametros del modelo.
- GPU recomendadas: no disponible por el mismo motivo. La propia eleccion de T4 para entrenar sugiere un modelo de tamano contenido, pero es una inferencia, no un dato.
- Encaje en GPU de consumo: no se puede determinar sin conocer el tamano del modelo ni los formatos de cuantizacion previstos.
- Opciones de despliegue: no disponible para esta version. El autor publico una linea GGUF en PS-1.0-GGUF, compatible por tanto con llama.cpp y Ollama, pero no hay confirmacion de que PS Design 2.0 beta vaya a distribuirse en ese formato.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No hay datos comparativos publicados. La tabla recoge lo unico verificable: la ausencia de especificaciones frente a la linea previa del mismo autor. WebSight v0.2 y Design2Code son datasets, no modelos, y por tanto no son comparables en esta tabla.

| Modelo | Parametros | Contexto | Licencia | Pesos disponibles | Benchmarks |
|---|---|---|---|---|---|
| PS Design 2.0 beta | no disponible | no disponible | no disponible | no (entrenamiento en curso) | no disponible |
| PS-1.0-GGUF (mismo autor, linea previa) | "small" segun etiquetas del repo | no disponible | Apache 2.0 | si (safetensors y GGUF) | no disponible |

## Limitaciones y advertencias

- El repositorio no contiene pesos utilizables: es un placeholder a la espera del merge final. No puede desplegarse ni evaluarse.
- No se declara licencia. Sin licencia explicita no hay autorizacion clara para uso comercial ni para redistribucion, lo que impide integrarlo en produccion.
- No se declaran idiomas soportados, ni siquiera para las instrucciones o los comentarios generados en el codigo.
- No hay benchmarks, evaluacion humana ni metrica de similitud visual publicada (por ejemplo, CLIP similarity o exact match sobre Design2Code).
- Riesgo de alucinacion de codigo: en tareas design-to-code es habitual generar marcado no valido, estilos inconsistentes o dependencias inexistentes. Sin pesos publicados no puede medirse la magnitud de este riesgo en este modelo concreto.
- Sesgos: no evaluables. El corpus declarado (WebSight v0.2 y Design2Code) esta sesgado hacia estilos web occidentales y hacia capturas de alta calidad, lo que suele penalizar interfaces densas, poco convencionales o en idiomas distintos del ingles.
- Capacidad multimodal no confirmada: aunque la tarea objetivo suele requerir entrada de imagen, el autor no especifica si la version final aceptara imagenes.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusion de comunidad que permitan contrastar el comportamiento real.
- Fecha de creacion registrada en Hugging Face: 2026-09-27, con actualizacion inmediatamente posterior. Conviene verificar el estado del repositorio antes de citarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Pedro21613/PS-design-2.0-beta
- Linea previa del mismo autor (PS-1.0-GGUF): https://huggingface.co/Pedro21613/PS-1.0-GGUF
- Ficheros de PS-1.0-GGUF: https://huggingface.co/Pedro21613/PS-1.0-GGUF/tree/main
- Paper o blog tecnico del modelo: no disponible
- Repositorio de codigo: no disponible
- Demo: no disponible
