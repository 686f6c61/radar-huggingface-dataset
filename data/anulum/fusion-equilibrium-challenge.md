# anulum/fusion-equilibrium-challenge

## Resumen

El repositorio `anulum/fusion-equilibrium-challenge` contiene los pesos entrenados de la entrada de Anulum a la Fusion Equilibrium Challenge, una competición asociada a NeurIPS 2026 y alojada en Codabench con el identificador 17739. No se trata de un modelo de lenguaje: es un conjunto de artefactos numericos para reconstruir el equilibrio magnetohidrodinamico de plasmas de tokamak. En concreto incluye redes de mapas de flujo (flux maps) para DIII-D, redes para los escalares q95 y βN (beta normalizada), redes de punto X, cabezas de arboles con gradient boosting y una base de flujos. El repositorio ocupa 0,8 GB y fue creado el 14 de octubre de 2026.

El modelo lo desarrolla Anulum, instituto de investigacion independiente que trabaja en fusion, control cuantico, neurociencia, infraestructura de IA y computacion cientifica. Los pesos se ajustaron sobre la release de entrenamiento etiquetada de DIII-D publicada por los organizadores de la competicion (CC BY 4.0). No se entrena ningun modelo para MAST: la reconstruccion en esa maquina es una resolucion fisica implementada en el codigo fuente del repositorio.

Su relevancia es acotada pero clara. Por un lado, publica los artefactos de una entrada de competicion cientifica bajo una licencia de codigo abierto (AGPL-3.0-or-later), lo que permite auditar y reproducir el metodo; por otro, la model card advierte de que los pesos no son utilizables de forma aislada: hay que ejecutarlos a traves de `infer.py` del repositorio GitHub, con las revisiones fijadas en `WEIGHTS.json` y la verificacion de integridad en `WEIGHTS.sha256`. El repositorio acumula 0 descargas y 0 likes, y no se han publicado resultados de benchmarks en la informacion disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en detalle; conjunto heterogeneo: redes de mapas de flujo, redes de q95 y βN, redes de punto X, cabezas de arboles con gradient boosting y una base de flujos |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; el autor no documenta ventana de entrada) |
| Tipos de cuantizacion | no disponible (no se mencionan GGUF, AWQ, GPTQ ni formatos equivalentes) |
| Idiomas soportados | no aplica (procesa datos de fisica de plasmas, no texto) |
| Licencia | AGPL-3.0-or-later; el autor ofrece licencia comercial (contacto: protoscience@anulum.li) |
| Formato de pesos | no disponible; los ficheros se obtienen con `fetch_weights.py` y se validan contra `WEIGHTS.sha256` |
| Tamano del repositorio | 0,8 GB |
| Dominio de aplicacion | equilibrio de plasmas en tokamak (DIII-D; MAST mediante resolucion fisica) |
| Entradas y salidas | no disponible en detalle; salidas declaradas: mapas de flujo, q95, βN y punto X |
| Fecha de creacion | 2026-10-14 |
| Ultima actualizacion | 2026-10-14 |

## Arquitectura y entrenamiento

La informacion disponible describe un sistema compuesto, no una red unica. Se enumeran cinco bloques: redes dedicadas al mapa de flujo de DIII-D, redes para los escalares q95 y βN, redes para la localizacion del punto X, cabezas de gradient-boosted trees y una base de flujos. No se especifican el numero de capas, las dimensiones ocultas, los tipos de capa, las funciones de activacion ni el numero de parametros de cada bloque. Tampoco se detalla si las cabezas de gradient boosting operan sobre las representaciones de las redes o sobre caracteristicas de entrada independientes.

En cuanto a los datos, los pesos se ajustaron sobre la release de entrenamiento etiquetada de DIII-D publicada por los organizadores de la competicion, distribuida bajo CC BY 4.0. No se declara el numero de disparos (shots), el volumen de muestras, la estrategia de validacion ni si hubo tecnicas de regularizacion, aumento de datos o calibracion de incertidumbre. Tampoco se menciona RLHF, DPO ni ningun esquema de ajuste por preferencias, algo que no aplica a este dominio. La model card indica explicitamente que no se ha entrenado ningun modelo para MAST y que la reconstruccion en esa maquina proviene de una resolucion fisica presente en el codigo fuente, lo que sugiere un diseno hibrido en el que el aprendizaje automatico cubre DIII-D y la fisica cubre la transferencia.

## Capacidades

- Prediccion de mapas de flujo de equilibrio para la maquina DIII-D a partir de los datos de la release de la competicion.
- Regresion de los escalares q95 y βN, indicadores habituales de la forma del perfil de seguridad y de la presion normalizada.
- Localizacion del punto X mediante redes especificas.
- Combinacion de representaciones neuronales con cabezas de arboles con gradient boosting, presumiblemente para refinar las predicciones escalares.
- Uso de una base de flujos como componente de representacion del campo.
- Reconstruccion para MAST mediante una resolucion fisica del repositorio, no mediante un modelo entrenado.
- Empaquetado reproducible: descarga por revision fijada en `WEIGHTS.json` y verificacion de integridad con `WEIGHTS.sha256`.
- No genera texto, no soporta tool calling ni function calling, no implementa agentes ni razonamiento multi-paso y no tiene capacidades multimodales, de audio ni de vision.

## Casos de uso

- Reconstruccion de equilibrio en DIII-D: ejecutar `infer.py` con los pesos publicados para obtener el mapa de flujo de una descarga concreta; es el caso de uso principal y el unico validado por los datos de la competicion.
- Monitorizacion de q95 y βN en analisis de descargas: los dos escalares permiten situar cada instante respecto a los limites operativos del plasma, de modo que se pueden revisar descargas historicas o estudiar su evolucion.
- Localizacion del punto X para estudio de configuraciones magneticas: las redes de punto X aportan la posicion de la singularidad, informacion necesaria para caracterizar la geometria del plasma y su separatrix.
- Reproduccion y auditoria de la entrada de Anulum en la competicion Codabench 17739: cargar los pesos con `fetch_weights.py`, verificar sus hashes y volver a generar las predicciones para comprobar los resultados declarados ante el comite.
- Estudio de transferencia entre maquinas: los pesos entrenados en DIII-D pueden analizarse junto con la resolucion fisica de MAST incluida en el repositorio para investigar que parte del problema es transferible y cual requiere recalculo fisico.
- Modelo sustituto para exploracion de configuraciones: las redes pueden emplearse como aproximacion rapida dentro de bucles de barrido parametrico, siempre que se acepte el error no cuantificado en la informacion disponible.
- Comparacion de metodos hibridos: la separacion entre redes neuronales y cabezas de gradient boosting permite estudiar experimentalmente la contribucion de cada componente a las predicciones finales.
- Material docente en fisica de plasmas computacional: el par repositorio de pesos y repositorio de codigo ofrece un caso completo de reconstruccion de equilibrio con aprendizaje automatico, reproducible mediante hashes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de error sobre el conjunto de validacion, ni comparaciones con la linea base de la competicion, ni resultados de la clasificacion final de Codabench 17739. Cualquier cifra de rendimiento debe consultarse en la plataforma de la competicion o en el repositorio GitHub del autor, que no forma parte de la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada: no disponible. El autor no publica requisitos. Como referencia orientativa y no confirmada, el conjunto de ficheros ocupa 0,8 GB, por lo que una carga completa en precision de 32 bits de los pesos mas el material auxiliar deberia situarse en el rango de unos pocos gigabytes, muy por debajo de los modelos de lenguaje actuales; esta cifra es una estimacion del editor, no un dato del autor.
- GPU recomendadas: no disponible. No se documenta uso de GPU ni de aceleradores concretos.
- Compatibilidad con GPU de consumo: no disponible. Dado el tamano del repositorio es plausible que quepa en GPUs de consumo y en CPU, pero el autor no lo confirma.
- Opciones de despliegue: la unica via documentada es `infer.py` del repositorio `anulum/fusion-equilibrium-challenge` en GitHub. No aplican vLLM, llama.cpp, Ollama ni TGI, porque no es un modelo de lenguaje.
- Latencia y throughput: no disponible. No se publican mediciones de tiempo de inferencia ni de frecuencia de ejecucion, dato critico si se pretende integrar en lazos de control de plasma.
- Dependencias: no disponibles. La model card no enumera versiones de framework, bibliotecas ni drivers necesarios para ejecutar los pesos.

## Comparativa con modelos similares

No disponible. No se conocen alternativas publicadas comparables en la informacion proporcionada: no hay otras entradas de la competicion Codabench 17739 documentadas en los resultados de busqueda, ni modelos de reconstruccion de equilibrio con pesos abiertos citados en la model card. Los codigos clasicos de reconstruccion de equilibrio basados en fisica no son equivalentes a este ensemble y no se dispone de datos para compararlos.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Anulum fusion-equilibrium-challenge | no disponible | no aplica | AGPL-3.0-or-later, con licencia comercial opcional | HuggingFace y GitHub |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Los pesos no son utilizables por si solos: requieren el repositorio GitHub, `fetch_weights.py` e `infer.py`, con las revisiones fijadas en `WEIGHTS.json`.
- Ambito restringido a DIII-D en la parte aprendida. No hay modelo entrenado para MAST, y no se documenta validacion en otras maquinas, por lo que extrapolar a geometrias distintas no esta respaldado.
- Ausencia total de metricas: no hay errores de validacion, intervalos de confianza ni analisis de calibracion, lo que impide juzgar la calidad de las predicciones a partir del repositorio.
- Riesgo de extrapolacion fuera de la distribucion de la release de entrenamiento de DIII-D, que no se describe en composicion ni en rango operativo.
- Licencia AGPL-3.0-or-later: es copyleft fuerte; el uso en productos propietarios exige negociar la licencia comercial que ofrece el autor.
- Dependencia del codigo fuente: el metodo fisico y las decisiones de modelado viven en GitHub, no en esta ficha ni en la model card.
- Sin validacion de la comunidad: 0 descargas y 0 likes en el momento de la consulta; ningun tercero ha reportado reproduccion independiente.
- Resultados de la busqueda web: los enlaces devueltos (salvo el sitio del instituto) no guardan relacion con el modelo, de modo que no aportan contexto tecnico adicional verificable.
- Procedencia: las fechas registradas en el repositorio corresponden a octubre de 2026, coincidentes con el marco de NeurIPS 2026 declarado por el autor; no se ha podido contrastar con documentacion independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/anulum/fusion-equilibrium-challenge
- Repositorio de codigo, metodo y registros de experimentos: https://github.com/anulum/fusion-equilibrium-challenge
- Sitio del desarrollador (ANULUM — Research & Technology): https://anulum.li/
- Competicion Fusion Equilibrium Challenge, Codabench 17739 (NeurIPS 2026): no se ha proporcionado URL en la informacion disponible.
- Contacto para licencia comercial: protoscience@anulum.li
