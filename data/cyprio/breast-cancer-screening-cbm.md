# cyprio/breast-cancer-screening-cbm

## Resumen

`cyprio/breast-cancer-screening-cbm` es un repositorio publicado en Hugging Face por el usuario `cyprio` bajo licencia MIT. Por su identificador, el modelo se presenta como un sistema de *concept bottleneck model* (CBM) orientado al cribado de cancer de mama. Los modelos de cuello de botella conceptual son una familia de arquitecturas interpretables en las que la prediccion final se obtiene a partir de un conjunto intermedio de conceptos legibles por humanos, lo que permite auditar la decision del modelo.

Sin embargo, la informacion disponible es practicamente nula: el repositorio tiene un tamano de 0.0 GB, no declara pipeline, no declara idiomas, no incluye descripcion en la model card y no registra descargas. Esto sugiere que se trata de un repositorio vacio, un placeholder o un proyecto en fase embrionaria, y no de un modelo publicado con pesos y documentacion.

Por tanto, esta ficha se limita a documentar lo que consta fehacientemente y a marcar como "no disponible" todo aquello que el autor no ha especificado. Cualquier uso en produccion o en investigacion clinica requeriria contactar con el autor y verificar la existencia real de pesos, datos de entrenamiento y validacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el identificador sugiere *concept bottleneck model*, sin confirmar) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (el repositorio ocupa 0.0 GB) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura. El sufijo `cbm` del identificador es compatible con un *concept bottleneck model*, una familia en la que una red base extrae caracteristicas, un modulo intermedio predice un vector de conceptos interpretables y un clasificador final mapea esos conceptos a la etiqueta de salida. No obstante, el autor no confirma esta arquitectura ni detalla la red troncal, el numero de conceptos, el dataset de entrenamiento ni el procedimiento de optimizacion.

Tampoco consta el volumen de datos de entrenamiento, la composicion del dataset, si se emplearon tecnicas de aumento de datos, validacion cruzada, calibracion o ajuste fino con supervision debil. No hay informacion sobre RLHF, DPO ni sobre ninguna innovacion tecnica adicional. El repositorio no contiene pesos (0.0 GB), por lo que no es posible inspeccionar la arquitectura a partir de los ficheros.

## Capacidades

- No se declaran capacidades en la model card.
- Por el identificador, cabria esperar clasificacion binaria de imagenes medicas (presencia o ausencia de hallazgos compatibles con cancer de mama), pero no esta confirmado.
- No consta soporte de *tool calling* ni de *function calling*.
- No consta soporte de agentes ni de razonamiento multi-paso.
- No consta capacidad multilingue ni procesamiento de texto.
- No consta modo *thinking*, vision general, audio ni ninguna capacidad especial.
- No se dispone de pesos para verificar ninguna de las capacidades anteriores.

## Casos de uso

- Investigacion en IA explicable aplicada a imagen medica: si el modelo existe y es un CBM, permitiria estudiar como un vector de conceptos intermedios media en la decision de cribado y comparar la interpretabilidad frente a clasificadores de caja negra. Requiere verificar primero la disponibilidad de pesos.
- Prototipado academico de sistemas de cribado: el modelo podria servir como base para experimentos docentes sobre clasificacion de mamografias, siempre que el autor publique pesos y documentacion.
- Auditoria de sesgos en modelos medicos: un CBM facilita analizar si determinados conceptos (densidad mamaria, microcalcificaciones) correlacionan con subgrupos demograficos, lo que resulta util en estudios de equidad.
- Generacion de explicaciones para revision clinica asistida: los conceptos intermedios podrian presentarse a un radiologo como apoyo a la decision, nunca como sustituto del diagnostico.
- Benchmark de interpretabilidad: util como referencia en articulos que comparen CBM frente a CNN o transformers de vision en tareas de cribado.
- Integracion en pipelines de investigacion con `transformers` o similar: solo viable si el autor publica configuracion y pesos; actualmente el repositorio esta vacio.

En todos los casos, el uso clinico real esta contraindicado sin validacion prospectiva, aprobacion regulatoria y supervision medica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible (no consta tamano del modelo ni pesos).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no determinable sin pesos ni arquitectura.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplicables; no es un modelo de lenguaje y no hay artefactos publicados.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| cyprio/breast-cancer-screening-cbm | no disponible | no disponible | MIT | repositorio vacio (0.0 GB) |
| CBM genericos de la literatura (p. ej. propuestas tipo *Concept Bottleneck Models*, Koh et al. 2020) | variable | no aplica | variable segun implementacion | codigo y pesos publicados por sus autores |
| Clasificadores CNN de mamografia (p. ej. variantes ResNet/DenseNet publicadas en repositorios academicos) | decenas de millones | no aplica | variable | variable |

No se dispone de datos suficientes para una comparativa cuantitativa con alternativas concretas. La comparacion anterior es cualitativa y se basa en la categoria funcional, no en mediciones.

## Limitaciones y advertencias

- El repositorio ocupa 0.0 GB y no contiene descripcion, pesos ni configuracion; no es un modelo utilizable tal cual.
- No hay informacion sobre sesgos demograficos, de equipo o de protocolo de adquisicion de imagen, que son criticos en cribado de mama.
- Riesgo de alucinacion no aplicable a un clasificador, pero si riesgo de falsos negativos y falsos positivos con consecuencias clinicas graves.
- No consta validacion externa, ni en cohortes independientes, ni frente a estandares de referencia histopatologicos.
- La licencia MIT permite uso comercial, pero eso no exime de las obligaciones regulatorias de un producto sanitario (MDR en la UE, FDA en EE. UU.).
- No debe usarse como dispositivo medico ni como apoyo diagnostico sin certificacion.
- Ausencia de idiomas declarados: irrelevante si es un modelo de vision, pero sintomatico de la falta de documentacion.
- El identificador y la fecha de creacion (2026-11-10) sugieren un proyecto muy reciente o un placeholder; conviene verificar la autoria y el estado real antes de citarlo.

## Enlaces

- Hugging Face: https://huggingface.co/cyprio/breast-cancer-screening-cbm
- Referencia conceptual sobre *Concept Bottleneck Models* (Koh et al., 2020): https://arxiv.org/abs/2007.04612
- No se han encontrado en la busqueda web papers, blogs, repos ni demos adicionales asociados a este repositorio concreto.
