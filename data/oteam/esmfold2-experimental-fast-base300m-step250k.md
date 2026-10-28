# oteam/esmfold2-experimental-fast-base300m-step250k

## Resumen

ESMFold2 es un modelo de prediccion de estructura biomolecular tridimensional a nivel de todos los atomos, desarrollado originalmente por Biohub (antiguo Chan Zuckerberg Biohub) y descrito en el trabajo "Language Modeling Materializes a World Model of Protein Biology". Este checkpoint concreto, `oteam/esmfold2-experimental-fast-base300m-step250k`, es una implementacion no oficial publicada por el usuario `oteam` a traves de la libreria `ofoldx`, y corresponde a uno de los puntos de la barrida de escalado del modelo experimental rapido, con backbone ESMC de 300 M de parametros y 250 000 pasos de entrenamiento.

El modelo combina un modelo de lenguaje de proteinas ESMC congelado que aporta las representaciones de secuencia, un tronco de plegamiento recurrente que actualiza caracteristicas de token y de par, y una cabeza de difusion que genera coordenadas antes de que las cabezas de distograma y de confianza puntuen el resultado. La variante "fast" usa 24 bloques de plegamiento y funciona en modo de secuencia unica, sin necesidad de alineamiento multiple de secuencias (MSA).

Frente a la variante completa, que emplea ESMC de 6 B, este checkpoint reduce el encoder a la escala de 300 M, lo que se traduce en 504 108 490 parametros reales en los pesos `safetensors` (unos 2,0 GB de repositorio). Es relevante para quien quiera evaluar el equilibrio coste/precision del pipeline ESMFold2 en hardware modesto, y como pieza del protocolo experimental de diseno de binders de proteinas, aunque se trata de un artefacto de investigacion sin validacion externa ni descargas registradas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de plegamiento recurrente a nivel de todos los atomos condicionado por ESMC, con cabeza de difusion para generacion de coordenadas, mas cabezas de distograma y confianza |
| Parametros totales | 504 108 490 (pesos `safetensors` del checkpoint); la variante Experimental Fast completa con ESMC 6B declara 6 531,170 M |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (la informacion no declara longitud maxima de secuencia de proteina) |
| Tipos de cuantizacion | No disponible; solo se publican pesos en `safetensors` (no hay GGUF ni variantes cuantizadas en el repo) |
| Idiomas soportados | No disponible / no aplica: el modelo procesa secuencias de proteinas, no lenguaje natural |
| Licencia | AGPL-3.0 |
| Formato de pesos | `safetensors` (libreria `ofoldx`) |

Otros parametros declarados para la variante Experimental Fast: 24 bloques de plegamiento, sin MSA, tamano de single 384, tamano de par 256, tamano de atomo 128, tamano de token 768, 4 actualizaciones recurrentes y 14 pasos de muestreo en difusion.

## Arquitectura y entrenamiento

El pipeline es un hibrido en cascada. Un modelo de lenguaje de proteinas ESMC congelado genera las representaciones por residuo; un tronco de plegamiento recurrente (24 bloques en esta variante "fast") actualiza de forma iterativa las caracteristicas de token (768 dimensiones) y de par (256 dimensiones) con 4 actualizaciones recurrentes; una cabeza de difusion genera las coordenadas atomicas con 14 pasos de muestreo; y finalmente las cabezas de distograma y de confianza puntuan la estructura predicha. En esta variante el encoder es de escala 300 M en lugar de los 6 B de la version completa, y no admite condicionamiento por MSA: opera en modo de secuencia unica, lo que segun la documentacion del proyecto original supone una aceleracion de aproximadamente un orden de magnitud en el plegado.

El checkpoint corresponde a un paso intermedio (250 000) de una barrida de escalado sobre el modelo Experimental Fast, cuyos hermanos publicados cubren las escalas base300M, base600M y 6B con pasos de 250k, 500k, 750k, 1000k y 1500k. Las variantes experimentales exponen ademas el modelo de inversion diferenciable utilizado para el diseno de secuencias de binders de proteinas. No se detalla en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron etapas de RLHF o DPO; la model card remite al paper de Biohub para esos datos.

La model card incluye un contrato numerico y geometrico explicito: las fronteras de coordenadas consumen una proyeccion finita, los valores no disponibles se seleccionan bajo mascara antes de cualquier conversion de dtype y tienen derivadas nulas, y los valores no finitos activos se consideran peticiones invalidas. Los atomos de referencia se emparejan mediante correspondencias preparadas, y un representante se elige con una convencion fija (CB de proteina, luego CA, luego el primer atomo admitido). Para diseno de binders, el diana debe ser una secuencia de proteina en codigo de una letra; cada complejo diana-binder se construye con dos cadenas lineales nuevas.

## Capacidades

- Prediccion de estructura 3D a nivel de todos los atomos de complejos biomoleculares a partir de la secuencia.
- Modo de secuencia unica (sin MSA) en esta variante, con la contrapartida de velocidad que ello implica.
- Puntuacion mediante cabezas de distograma y de confianza; la metrica concreta de confianza no se detalla en la informacion disponible.
- Diseno de binders de proteinas: las variantes experimentales exponen el modelo de inversion diferenciable empleado en el protocolo de diseno de secuencias.
- Modelado de complejos diana-binder construidos como pares de cadenas lineales de proteina.
- Soporte de nucleicos en el pipeline general: la convencion de atomo representativo cubre clases de purinas (C4), clases conocidas restantes (C2) y clases desconocidas (C1′).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso en lenguaje natural ni procesamiento de lenguaje, vision o audio: es un modelo especifico de biologia estructural.

## Casos de uso

- Prediccion de estructura de proteinas de forma masiva: desplegar el pipeline `ofoldx.pipeline("fold", model="oteam/esmfold2-experimental-fast-base300m-step250k")` sobre un proteoma o un conjunto de candidatos para obtener estructuras de todos los atomos sin depender de busquedas MSA, lo que simplifica el abastecimiento de datos en pipelines de alto volumen.
- Anotacion funcional y priorizacion de variantes: usar las estructuras predichas y las puntuaciones de confianza para localizar dominios, evaluar si una mutacion cae en una region estructurada o en un bucle y priorizar experimentos de validacion.
- Diseno computacional de binders: emplear la ruta experimental con inversion diferenciable para optimizar secuencias de binder contra una diana dada en codigo de una letra, generando complejos de dos cadenas para cribado posterior.
- Cribado in silico previo a ensayos de laboratorio: filtrar decenas o cientos de candidatos por plausibilidad estructural y senal de confianza antes de sintetizar proteinas, reduciendo coste experimental.
- Integracion en pipelines de biologia computacional: al ser una libreria Python instalable con `pip install ofoldx`, se puede encadenar con herramientas de analisis estructural (alineamiento, calculo de superficies, docking) dentro de flujos automatizados.
- Investigacion sobre escalado de modelos de plegamiento: este checkpoint es un punto concreto (base300M, step250k) de una barrida de escalado, por lo que sirve para estudiar la relacion entre tamano del encoder, pasos de entrenamiento y calidad estructural frente a los checkpoints hermanos.
- Prototipado en hardware de una sola GPU: con ~504 M de parametros, permite iterar en estaciones de trabajo consumer donde las variantes de 6 B no caben con comodidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La documentacion del proyecto original afirma de forma cualitativa que ESMFold2 supera a otros modelos en la tasa de exito DockQ sobre complejos proteina-proteina y anticuerpo-antigeno de Foldbench, pero no se aportan cifras numericas en los materiales consultados y no se dispone de mediciones especificas para este checkpoint base300M-step250k.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos del checkpoint ocupan aproximadamente 1 GB en bf16 y cerca de 2 GB en fp32; a ello hay que sumar las caracteristicas de token, par y atomo, cuyo consumo escala con la longitud de la secuencia y con el numero de cadenas. Como referencia de orden de magnitud, entre 8 y 16 GB de VRAM deberian cubrir secuencias de longitud moderada (estimacion, no verificada en la informacion disponible).
- GPU recomendadas: no hay recomendaciones oficiales. Por tamano de modelo, una RTX 4090 (24 GB), una L4 (24 GB), una A100 (40/80 GB) o una H100 son opciones razonables; las GPU consumer de 8-12 GB deberian ser suficientes para secuencias cortas.
- Cabe en GPU consumer: si, previsiblemente, en tarjetas de 8 GB o mas para proteinas de longitud moderada, condicionado al coste de memoria de las cabezas de difusion y del par representation.
- Opciones de despliegue: la libreria `ofoldx` (`pip install ofoldx`); el formato es `safetensors`, por lo que no hay soporte declarado de llama.cpp, Ollama, vLLM ni TGI (son runners de modelos de lenguaje y no aplican a este pipeline).
- Latencia y throughput: no disponibles. La variante "fast" esta disenada para ser mas rapida que la completa al usar 24 bloques en lugar de 48 y prescindir del MSA, con 4 actualizaciones recurrentes y 14 pasos de muestreo de difusion por estructura.

## Comparativa con modelos similares

| Modelo | Bloques de plegamiento | MSA | Encoder ESMC | Parametros declarados | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `oteam/esmfold2-experimental-fast-base300m-step250k` (este) | 24 | No | 300 M | 504,108 M (pesos reales) | AGPL-3.0 | HuggingFace, 0 descargas |
| `oteam/esmfold2` (completo) | 48 | Si | 6 B | 6 586,242 M | AGPL-3.0 | HuggingFace |
| `oteam/esmfold2-fast` | 24 | No | 6 B | 6 548,432 M | AGPL-3.0 | HuggingFace |
| `oteam/esmfold2-experimental` | 48 | Si | 6 B | 6 568,980 M | AGPL-3.0 | HuggingFace |
| `biohub/ESMFold2-Experimental-Fast-base300M-step500k` | 24 | No | 300 M | no disponible | no disponible en la informacion | HuggingFace (Biohub) |

La comparacion relevante es interna a la familia: este checkpoint se diferencia de `esmfold2-fast` por usar un encoder de 300 M en lugar de 6 B (unas trece veces menos parametros totales), y de los checkpoints de Biohub por corresponder a un paso de entrenamiento distinto (250k frente a 500k, 750k, etc.). No se dispone de datos de rendimiento que permitan cuantificar la perdida de precision asociada a la reduccion del encoder.

## Limitaciones y advertencias

- Implementacion no oficial: la model card declara explicitamente que es una implementacion de OFoldX y que los autores originales de ESMFold2 no la escribieron, revisaron ni respaldan.
- Licencia AGPL-3.0: es una licencia copyleft fuerte; el uso del modelo a traves de un servicio en red puede obligar a liberar el codigo fuente derivado. Conviene revisar las implicaciones antes de integrarlo en un producto comercial.
- Checkpoint intermedio de una barrida de escalado (step250k): no es el modelo de referencia del proyecto, sino un artefacto de investigacion destinado a estudiar el escalado; se espera menor calidad estructural que los modelos completos.
- Sin MSA en la variante "fast": las proteinas huerfanas o con pocos homologia disponibles pueden predecirse con menor exactitud que en las variantes con condicionamiento MSA.
- Riesgo de estructuras fisicamente implausibles: como todo modelo generativo de coordenadas, puede producir conformaciones plausibles a nivel de puntuacion pero incorrectas; las cabezas de confianza deben tratarse como senal orientativa, no como garantia.
- Datos de entrenamiento no documentados en la informacion disponible: se desconoce la composicion del dataset, los sesgos de cobertura taxonomica y las posibles limitaciones en clases de proteinas poco representadas.
- Restricciones de interfaz: el diseno de binders exige que la diana sea una secuencia de proteina en codigo de una letra; no se aceptan estructuras ni rutas de fichero como diana. Las APIs sin mascara de disponibilidad requieren campos finitos completos, y los valores fuera del rango numerico soportado se consideran peticiones invalidas.
- Sin validacion de la comunidad: el repositorio no registra descargas ni "likes", y no se han localizado evaluaciones independientes de este checkpoint concreto.
- Ambito limitado: no procesa lenguaje natural, audio ni imagenes; no dispone de tool calling ni capacidades de agente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/oteam/esmfold2-experimental-fast-base300m-step250k
- Variante completa: https://huggingface.co/oteam/esmfold2
- Variante rapida: https://huggingface.co/oteam/esmfold2-fast
- Artefacto experimental de diseno de binders: https://huggingface.co/oteam/esmfold2-experimental
- Variante experimental rapida: https://huggingface.co/oteam/esmfold2-experimental-fast
- Codigo de la implementacion (OFoldX): https://github.com/OTeam-AI4S/OFoldX/tree/main/ofoldx/models/esmfold2
- Repositorio original de Biohub: https://github.com/Biohub/esm
- Paper: https://biohub.ai/papers/esm_protein.pdf
- Pagina del modelo en Biohub: https://www.biohub.ai/models/esmfold2
- Documentacion de Biohub: https://docs.biohub.ai/models/esmfold2
- Checkpoint hermano en Biohub (base300M-step500k): https://huggingface.co/biohub/ESMFold2-Experimental-Fast-base300M-step500k
- Checkpoint hermano en Biohub (base300M-step750k): https://huggingface.co/biohub/ESMFold2-Experimental-Fast-base300M-step750k
- Reimplementacion de referencia en GitHub: https://github.com/atong01/esmfold2/blob/main/README.md
