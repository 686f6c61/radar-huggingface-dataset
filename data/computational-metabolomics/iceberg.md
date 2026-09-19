# computational-metabolomics/iceberg

## Resumen

ICEBERG 2.1 es un paquete de pesos (bundle) para tareas de espectrometría de masas en metabolómica, publicado por el grupo computational-metabolomics como data manager del ecosistema Galaxy bajo el identificador `computational-metabolomics/iceberg`. Los pesos proceden del repositorio upstream ms-pred del Coley Research Group y de los contribuidores de ms-pred, y corresponden al checkpoint `msg_all` entrenado con MassSpecGym. El repositorio se limita a redistribuir ficheros idénticos a los del upstream (sin conversión de modelo), con hash SHA-256 documentado para verificar la integridad.

No se trata de un modelo de lenguaje: no genera texto ni mantiene conversaciones, sino que opera sobre datos de espectrometría de masas (MS) en el dominio de la metabolómica, según las etiquetas del repositorio (`metabolomics`, `mass-spectrometry`). Su relevancia actual es de tipo infraestructural y de reproducibilidad: empaqueta un checkpoint concreto en un formato consumible por Galaxy y deja constancia explícita de que no incluye checkpoints derivados de NIST.

La model card advierte de una ambigüedad de licencia: el mantenedor registra MIT tomando como base la licencia MIT del software upstream, pero el upstream describe estos pesos como open source sin una declaración de licencia específica para el checkpoint. El propio autor aclara que esta elección registrada no establece permisos adicionales por parte del upstream. El repositorio tiene un tamaño de 0,1 GB, 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; no disponible para su tarea) |
| Tipos de cuantizacion | no disponible; se distribuyen los pesos originales sin conversion, por lo que no se documentan variantes cuantizadas |
| Idiomas soportados | no aplica (modelo de espectrometria de masas, no de texto) |
| Licencia | MIT, registrada por el mantenedor a partir de la licencia del software upstream (ver advertencias) |
| Formato de pesos | bundle en zip (`2.1/msg_all.zip`), ficheros byte a byte idénticos al upstream; no se especifica safetensors, GGUF ni otros formatos |
| Version | 2.1 |
| Dominio | metabolomica y espectrometria de masas |
| Dataset de entrenamiento declarado | MassSpecGym (checkpoint `msg_all`) |
| Tamano del repositorio | 0,1 GB |
| Hash SHA-256 de `2.1/msg_all.zip` | 2b890a2bf2de1ee0e7d223b440536d8915d35768a09dd8fc5230cd6bac139c66 |
| Distribucion | Galaxy data manager (`galaxy`, `galaxy-data-manager`) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion / actualizacion | 2026-09-18 |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura del modelo: no se especifica si es un transformer, una red de grafos, un modelo hibrido ni su numero de parametros, capas o dimensiones. Tampoco se documentan el numero de tokens, la composicion del dataset ni si se aplicaron tecnicas de ajuste como RLHF o DPO. Lo unico confirmado es que el checkpoint se entreno con MassSpecGym (variante `msg_all`) y que los pesos se obtienen del repositorio ms-pred del Coley Research Group, cuya demo se enlaza en la model card.

En cuanto al proceso de publicacion, no hubo innovacion tecnica ni conversion alguna: la model card indica explicitamente que los ficheros son identicos al upstream ("byte-identical upstream files. No model conversion was performed."). El aporte del repositorio es, por tanto, de empaquetado, trazabilidad e integracion, no de entrenamiento o modificacion del modelo. Tambien se declara de forma explicita que no se incluye ningun checkpoint derivado de NIST.

## Capacidades

La informacion disponible solo permite afirmar lo siguiente:

- Procesamiento de datos de espectrometria de masas en el ambito de la metabolomica, segun las etiquetas del repositorio (`metabolomics`, `mass-spectrometry`).
- Uso como data manager de Galaxy, lo que permite integrarlo en flujos de trabajo del ecosistema Galaxy.
- Trazabilidad de integridad: el bundle incluye hash SHA-256 del archivo de pesos.
- Exclusion de checkpoints derivados de NIST, lo que restringe el origen de los datos/modelos incluidos.
- Generacion de texto, razonamiento, codigo, matematicas, vision: no aplica / no disponible.
- Tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no aplica.
- Modo "thinking", audio u otras capacidades especiales: no disponible.

## Casos de uso

- Anotacion de espectros en metabolomica no dirigida: dado que el modelo pertenece al dominio de espectrometria de masas y esta entrenado con MassSpecGym, el escenario natural es el procesamiento de espectros MS para tareas de anotacion o prediccion dentro de un pipeline de metabolomica. La informacion disponible no detalla las tareas exactas soportadas.
- Integracion en flujos de trabajo Galaxy: al distribuirse como Galaxy data manager, el bundle puede registrarse y consumirse directamente en instancias de Galaxy, evitando la descarga manual de pesos desde el repositorio upstream.
- Reproducibilidad de publicaciones: el hash SHA-256 de `2.1/msg_all.zip` permite verificar que los pesos empleados en un experimento coinciden exactamente con los publicados, algo util cuando se replican resultados sobre MassSpecGym.
- Entornos con restricciones sobre datos NIST: la model card indica que no se incluyen checkpoints derivados de NIST; los equipos que no pueden incorporar ese tipo de datos a sus flujos pueden usar este bundle como alternativa declarada.
- Linea base comparativa: puede emplearse como referencia fija del checkpoint `msg_all` al evaluar otras aproximaciones de espectrometria computacional, siempre que la evaluacion se haga sobre un conjunto independiente y no solo sobre MassSpecGym.
- Despliegue en infraestructura de investigacion: al tratarse de un paquete de 0,1 GB, es viable almacenarlo y versionarlo en repositorios internos junto al resto del pipeline analitico, sin necesidad de artefactos de gran tamano.
- Formacion y docencia en metabolomica computacional: sirve para ilustrar un flujo completo de empaquetado, verificacion por hash e integracion en Galaxy con un modelo real de espectrometria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; no se indica el numero de parametros ni el consumo de memoria.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; el unico dato objetivo es que el repositorio completo ocupa 0,1 GB, lo que sugiere un artefacto de pesos de tamano reducido, pero no permite confirmar requisitos de memoria en inferencia.
- Opciones de despliegue: la via documentada es Galaxy (data manager). El upstream ms-pred aporta el codigo de inferencia, pero no se detallan integraciones con vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje, no aplicables a este caso de uso).
- Latencia y throughput: no disponibles.
- CPU: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| computational-metabolomics/iceberg (ICEBERG 2.1, checkpoint `msg_all`) | no disponible | no aplica | MIT registrada por el mantenedor; licencia del checkpoint no declarada por el upstream | HuggingFace (`computational-metabolomics/iceberg`), 0,1 GB, 0 descargas |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

No se han proporcionado datos de otros modelos de la misma categoria (espectrometria de masas aplicada a metabolomica) en la informacion disponible, por lo que no es posible establecer una comparacion cuantitativa de parametros, rendimiento o cobertura. La model card menciona que el upstream ms-pred distribuye mas checkpoints ademas de `msg_all`, pero no se aportan sus especificaciones.

## Limitaciones y advertencias

- Ambiguedad de licencia: el mantenedor registra MIT basandose en la licencia del software upstream, pero el propio upstream describe los pesos como open source sin una declaracion de licencia especifica para el checkpoint. El autor advierte que la eleccion registrada no establece permisos adicionales del upstream, por lo que el uso comercial deberia validarse con el titular de los derechos.
- Ausencia de checkpoints derivados de NIST: puede limitar la cobertura quimica o la comparabilidad con flujos que si emplean ese tipo de datos.
- Cero adopcion registrada: 0 descargas y 0 likes, sin senales de validacion por parte de la comunidad.
- Fechas de metadatos inusuales: creacion y actualizacion el 2026-09-18, posteriores a la fecha habitual de publicacion; conviene verificar la metadata antes de fijar una version en produccion.
- Sin informacion tecnica esencial: se desconoce arquitectura, numero de parametros, datos de entrenamiento exactos, requisitos de hardware y rendimiento. Cualquier planificacion de capacidad o de calidad debe basarse en pruebas propias.
- Sin informacion sobre sesgos, alucinacion o limites de contexto: al no ser un modelo de lenguaje, estas categorias no aplican directamente; no obstante, no se documentan tasas de error ni limitaciones de dominio del modelo quimico.
- No se ofrecen variantes cuantizadas ni conversiones, ya que los ficheros se publican identicos al upstream.
- La busqueda web realizada no devolvio ningun resultado relacionado con el modelo: los enlaces obtenidos correspondian a consultas sobre instalaciones telefonicas en aleman y no aportan informacion tecnica, por lo que todos los datos de esta ficha proceden exclusivamente de la model card y de la metadata del repositorio.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/computational-metabolomics/iceberg
- Codigo y documentacion del upstream (ms-pred, Coley Research Group): https://github.com/coleygroup/ms-pred
- Documentacion de checkpoints y demo del upstream: https://github.com/coleygroup/ms-pred#demo
- Licencia del upstream: https://github.com/coleygroup/ms-pred/blob/main/LICENSE
- Paper, blog o demo adicionales: no se han encontrado enlaces relevantes en la busqueda web
- Enlace al dataset MassSpecGym: no proporcionado en la informacion disponible
