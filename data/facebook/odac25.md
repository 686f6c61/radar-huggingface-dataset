# facebook/ODAC25

## Resumen

ODAC25 es un modelo publicado por la organizacion `facebook` (Meta) en HuggingFace bajo el identificador `facebook/ODAC25`, con acceso restringido: es necesario aceptar condiciones en la plataforma antes de poder descargar los pesos. El repositorio ocupa 1,6 GB y esta etiquetado con el identificador arXiv 2508.03162, lo que vincula su publicacion a un articulo tecnico, aunque el contenido de dicho articulo no forma parte de la informacion disponible para esta ficha.

La informacion consultada no permite confirmar arquitectura, numero de parametros, longitud de contexto ni idiomas: la pagina no declara pipeline ni lenguajes soportados, y las busquedas web realizadas devolvieron unicamente resultados sobre la red social Facebook, sin material tecnico sobre el modelo. Cualquier cifra que se diera en esta ficha seria una invencion, por lo que se marca explicitamente como no disponible.

Su relevancia actual es la de un artefacto a evaluar antes de usarlo: acceso controlado, licencia "other" y ausencia de benchmarks publicos en la informacion consultada obligan a revisar los terminos de uso y a medir el modelo con un harness propio antes de plantearlo en produccion.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no consta que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (terminos concretos no detallados en la informacion disponible) |
| Formato de pesos | no disponible (repositorio de 1,6 GB) |
| Desarrollador | facebook (Meta) |
| Acceso | restringido (gated); requiere aceptar condiciones en HuggingFace |
| Referencia tecnica | arXiv 2508.03162 (contenido no verificado en la informacion disponible) |
| Fecha de creacion del repositorio | 2025-06-13 |
| Ultima actualizacion | 2026-10-29 |
| Descargas / likes | 0 / 37 |

## Arquitectura y entrenamiento

No disponible. La informacion proporcionada no incluye el tipo de arquitectura (transformer denso, MoE, SSM o hibrida), el numero de tokens de entrenamiento, la composicion del corpus ni si se aplicaron fases de RLHF, DPO u otras tecnicas de alineamiento. Tampoco consta ninguna innovacion tecnica destacable (decodificacion especulativa, atencion lineal, cuantizacion nativa, etc.).

El unico dato con valor estructural es el tamano del repositorio (1,6 GB). Como cota aritmetica, y solo si el repositorio contuviera exclusivamente pesos en FP16/BF16, equivaldria a un maximo del orden de 800 millones de parametros (1,6e9 bytes / 2 bytes por parametro); en int8 el limite subiria a unos 1.600 millones y en FP32 bajaria a unos 400 millones. Si el repositorio incluye tokenizador, ficheros de configuracion, pesos en varios formatos o artefactos auxiliares, el limite real seria inferior. Estas cifras son deducciones del tamano en disco, no especificaciones publicadas.

## Capacidades

- Generacion de texto, razonamiento, codigo, matematicas o vision: no disponible; la informacion consultada no documenta ninguna capacidad concreta.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; el campo de idiomas aparece como no disponible en la pagina del repositorio.
- Capacidades especiales (modo thinking, audio, vision, decodificacion especulativa): no disponible.
- Lo unico verificable es el mecanismo de distribucion: acceso condicionado a la aceptacion de terminos en HuggingFace y un unico artefacto de 1,6 GB.

## Casos de uso

Los siguientes escenarios son plantillas de evaluacion, no usos confirmados: requieren validar previamente arquitectura, contexto, idiomas y licencia, dado que la informacion disponible no documenta las capacidades del modelo.

- Evaluacion comparativa interna: descargar los pesos tras aceptar las condiciones e introducirlos en un harness propio (MMLU, GSM8K, HumanEval u otro segun la tarea real) para obtener la primera linea base cuantitativa, ya que no hay benchmarks publicados en la informacion consultada.
- Replicacion del articulo arXiv 2508.03162: usar el repositorio como artefacto de referencia para reproducir las cifras del paper, fijando el hash de revision concreto (el repositorio se actualizo el 2026-10-29, meses despues de su creacion).
- Auditoria de sesgos y red-teaming: al no haber documentacion publica de sesgos, un equipo de calidad puede ejecutar baterias de prompts adversarios en castellano y en las lenguas que se confirmen, midiendo tasas de refusal y de contenido toxico antes de cualquier despliegue.
- Piloto de despliegue on-premise: con 1,6 GB de repositorio, el coste de almacenamiento y de transferencia es bajo, lo que permite probar el modelo en una maquina de desarrollo sin comprometer infraestructura, sujeto a que la licencia "other" lo permita.
- Prototipo de integracion en un pipeline de inferencia: comprobar si los pesos cargan en `transformers`, `vLLM` o `TGI` y, en su caso, si existe una ruta de conversion a GGUF para `llama.cpp` u `Ollama`, antes de invertir en integracion de producto.
- Filtrado previo en un proceso de seleccion de modelos: usar la ficha y los resultados del harness para descartar o promover el modelo frente a alternativas ya documentadas, evitando adoptar un artefacto sin benchmarks ni idiomas declarados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con caracter oficial. Depende del numero de parametros y de la cuantizacion, datos ambos no publicados en la informacion consultada.
- Cota orientativa basada en el tamano del repo: si los 1,6 GB fueran pesos FP16/BF16 de un modelo de ~800 millones de parametros, los pesos ocuparian ~1,6 GB y el total en inferencia (pesos mas cache KV y activaciones) quedaria en el entorno de 3-4 GB para contextos moderados. Es una hipotesis derivada del tamano en disco, no una especificacion.
- GPU recomendadas: no disponibles. En el escenario hipotetico anterior bastaria una GPU consumer de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB); para servicio con lotes concurrentes tendrian sentido L4 24 GB o A10G.
- Cabe en GPU consumer: no confirmable sin conocer parametros y formato; en el escenario de ~800 M en FP16, si cabria en cualquier GPU consumer con 8 GB o mas.
- Opciones de despliegue: no confirmadas. A comprobar en este orden: carga directa con `transformers`, servicio con `vLLM` o `TGI` si la arquitectura esta soportada, y `llama.cpp`/`Ollama` solo si el repositorio incluye o permite generar pesos GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion consultada no permite identificar la categoria del modelo (tamano, tarea, modalidad), por lo que cualquier comparacion con alternativas concretas seria especulativa.

| Criterio | ODAC25 | Alternativa comparable |
|---|---|---|
| Parametros | no disponible | no disponible |
| Longitud de contexto | no disponible | no disponible |
| Licencia | other | no disponible |
| Acceso | gated | no disponible |
| Rendimiento en benchmarks | no disponible | no disponible |

Una vez determinado el tamano y la tarea, los ejes de comparacion pertinentes serian: parametros totales y activos, contexto maximo, licencia comercial, disponibilidad de pesos en GGUF y resultados en el mismo harness de evaluacion.

## Limitaciones y advertencias

- Licencia "other": los terminos no estan detallados en la informacion disponible. Es obligatorio leer el texto completo de la licencia en el repositorio antes de cualquier uso comercial, de redistribucion o de entrenamiento derivado.
- Acceso restringido (gated): la descarga requiere una cuenta de HuggingFace y la aceptacion de condiciones, lo que anade una dependencia operativa y puede limitar la automatizacion de pipelines de CI.
- Ausencia total de especificaciones publicas en la informacion consultada: sin arquitectura, parametros, contexto ni idiomas declarados, no es posible estimar coste de inferencia ni calidad esperada.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento; cualquier afirmacion sobre su calidad seria una suposicion.
- Idiomas no declarados: existe riesgo real de rendimiento deficiente en castellano; debe medirse antes de usarlo en producto para ese idioma.
- Riesgo de alucinacion: no cuantificado; al no conocerse el proceso de alineamiento (RLHF, DPO u otro), no puede asumirse ninguna garantia de fidelidad factual.
- Sesgos conocidos: no documentados en la informacion disponible.
- Validacion comunitaria practicamente nula: 0 descargas y 37 likes en el momento consultado, lo que reduce la probabilidad de encontrar informes independientes de fallos.
- Historial de revisiones: creado el 2025-06-13 y actualizado el 2026-10-29; conviene fijar el hash de revision al evaluar para que los resultados sean reproducibles.
- Posible discrepancia entre el tamano del repositorio (1,6 GB) y los pesos completos: si el repo contiene solo una parte de los artefactos, la carga fallaria o requeriria ficheros adicionales.
- Ruido en la busqueda web: las consultas devolvieron resultados sobre la red social Facebook, no sobre el modelo; no se ha podido verificar el contenido del articulo arXiv 2508.03162 con las fuentes proporcionadas.

## Enlaces

- HuggingFace: https://huggingface.co/facebook/ODAC25 (acceso restringido)
- Articulo referenciado en las etiquetas: https://arxiv.org/abs/2508.03162 (contenido no verificado en la informacion disponible)
- Version PDF del articulo: https://arxiv.org/pdf/2508.03162
- Nota: las busquedas web realizadas devolvieron unicamente resultados sobre la red social Facebook (facebook.com, fr-fr.facebook.com, login.php, l.facebook.com, clubic.com), sin enlaces tecnicos adicionales sobre el modelo.
