# prehj/GR00T-N1.5-allex-demospeedup-1x2x

## Resumen

GR00T-N1.5-allex-demospeedup-1x2x es un ajuste fino del modelo fundacional de robotica nvidia/GR00T-N1.5-3B publicado por el usuario prehj. Su particularidad no esta en la politica resultante, sino en los datos con los que se ha entrenado: reproduce el metodo DemoSpeedup (CoRL 2025), que re-temporiza las demostraciones de entrenamiento para que las trayectorias sean mas rapidas, en lugar de modificar la arquitectura del modelo. El autor insiste en que no es un checkpoint ATQ y que la politica es un unico decodificador N1.5 con `use_moe_routing=False`.

El punto de partida es el conjunto ALLEX (320 episodios, 771.862 frames). Con la politica base del propio autor se muestrean 10 candidatos de accion por observacion, se calcula entropia KDE y se segmentan las trayectorias con HDBSCAN. Los tramos etiquetados como "de precision" se mantienen a 1x y los tramos libres se aceleran a 2x, lo que reduce el dataset a 550.676 frames (1,402x global). Sobre esos datos re-temporizados se entrena N1.5 desde cero. Es relevante ahora porque el coste de las demostraciones reales es uno de los cuellos de botella del aprendizaje por imitacion en robotica, y este checkpoint permite comparar de forma directa una politica entrenada con datos acelerados frente a otras variantes.

El checkpoint publicado corresponde al paso 25.000 de 30.000 (epoca 11,62). El entrenamiento se detuvo a los 27.315 pasos por cuota de disco y el autor indica que lo reanudara, por lo que se trata de una version no final. El modelo ocupa 7,6 GB en el repositorio y suma 2.726.736.832 parametros en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | modelo fundacional vision-language-action (VLA) de robotica, basado en NVIDIA GR00T N1.5; decodificador unico de acciones (`use_moe_routing=False`); se desconoce el detalle interno no documentado en la model card |
| Parametros totales | 2.726.736.832 (2,73 mil millones), segun safetensors |
| Parametros activos | no aplica (modelo denso, decodificador unico) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | other (heredada de nvidia/GR00T-N1.5-3B; no se especifican terminos adicionales) |
| Formato de pesos | safetensors, 2 shards (model-00001-of-00002.safetensors, model-00002-of-00002.safetensors) + config.json + model.safetensors.index.json |
| Modelo base | nvidia/GR00T-N1.5-3B |
| Pipeline | robotics |
| Horizonte de accion | 24 |
| Dimension maxima de accion | 64 |
| Configuracion de datos | allex_eef_abs_no_waist (acciones absolutas de efector final, decodificador unico) |
| Checkpoint | paso 25.000 de 30.000 (epoca 11,62) |
| Tamano del repositorio | 7,6 GB |
| Fecha de publicacion en el hub | 2026-09-21 |

## Arquitectura y entrenamiento

La politica es un N1.5 estandar entrenado con horizonte 24 y dimension maxima de accion 64, con `warmup_ratio` 0,05 (valores por defecto). No hay modificacion arquitectonica: la aportacion del trabajo esta integramente en el preprocesado de datos. El pipeline documentado tiene cuatro etapas. Primero, con la politica ALLEX base (checkpoint-30000 del modelo prehj/allex-n15-base-v1v2v3v4) se extraen 10 candidatos de accion por observacion y se agregan por el eje temporal, calculando entropia KDE con ancho de banda 1 sobre los 771.862 frames de los 320 episodios. Segundo, se normaliza con z-score dentro de cada episodio y se aplica HDBSCAN con `min_cluster_size=5`, descartando los primeros 50 frames; si la media del cluster es negativa, el tramo se etiqueta como de precision. Tercero, se re-temporiza: 1x en los tramos de precision y 2x en los libres. Cuarto, se entrena N1.5 desde cero sobre el dataset re-temporizado.

Dos divergencias respecto al metodo original son relevantes. El original usa 2x/4x, pero el autor lo baja a 1x/2x para comparar en la misma franja de velocidad con su rejilla ALLEX ATQ. Ademas, en el codigo original las etiquetas solo toman los valores {0, -1}, de modo que la rama rapida nunca se activa (es una rama muerta); en esta reproduccion se habilita, de forma que los tramos libres se aceleran de verdad. Tambien merece mencion que el autor indica que la mejora observada proviene del re-timing de los datos, no de una politica intrinsecamente mas rapida.

Resultados del re-timing declarados por el autor:

| Metrica | Valor |
|---|---:|
| Frames originales | 771.862 |
| Frames re-temporizados | 550.676 |
| Aceleracion global | 1,402x |
| Aceleracion media por episodio | 1,518x (rango 1,034-2,000) |
| Proporcion de tramos de precision | 0,470 |
| Numero de clusters HDBSCAN | mediana 36 (rango 2-144) |

Configuracion de entrenamiento declarada: 4 GPU con 32 muestras por dispositivo y acumulacion de gradiente 2 (batch efectivo 256), 25.000 pasos de 30.000 previstos, 320 episodios y 550.676 frames. No se documentan el numero total de tokens, la composicion del dataset mas alla de ALLEX, ni si hubo RLHF o DPO; esos datos no estan disponibles.

## Capacidades

- Generacion de acciones de robotica: produce secuencias de accion con horizonte 24 y dimension maxima 64 a partir de observaciones, siguiendo el paradigma VLA de GR00T N1.5.
- Manipulacion con efector final en espacio absoluto, segun la configuracion de datos `allex_eef_abs_no_waist` (sin articulacion de cintura).
- Control reactivo a partir de entrada visual, propia de los modelos vision-language-action.
- Copia de estilo temporal: la politica imita la temporizacion de las demostraciones con las que fue entrenada, que en este caso estan aceleradas en los tramos considerados libres.
- Encadenamiento de subtareas dentro de un episodio: el dataset de entrenamiento contiene episodios con segmentacion en multiples clusters (mediana 36, maximo 144), lo que implica transiciones entre fases.
- Capacidades de llamada a herramientas, agentes, razonamiento multi-paso o modo de pensamiento: no documentadas en la informacion disponible.
- Capacidades multilingues: no disponibles (modelo orientado a robotica; no se documentan idiomas).
- Vision, audio u otras modalidades: no documentadas explicitamente mas alla de lo implicito en un modelo VLA; no disponible.

## Casos de uso

- Manipulacion robotica con efector final: la politica esta entrenada para producir acciones absolutas de efector final a partir de observaciones, por lo que puede emplearse en tareas de recogida y colocacion o ensamblaje en el mismo dominio de manipulacion que cubre ALLEX.
- Investigacion sobre re-timing de demostraciones: sirve como referencia reproducible del pipeline DemoSpeedup, permitiendo medir el efecto de acelerar selectivamente los tramos de baja entropia frente a entrenar con los datos originales.
- Ablacion controlada frente a ATQ: al haberse ajustado la rejilla a 1x/2x en lugar de 2x/4x, permite comparar en la misma franja de velocidad con las variantes ATQ del autor sobre la misma base de datos.
- Generacion de datos de entrenamiento acelerados: el re-timing reduce 771.862 frames a 550.676, lo que abarata el coste de entrenamiento de politicas derivadas sobre el mismo dataset.
- Punto de partida para ajuste fino en nuevas tareas: al ser un N1.5 de 2,73 mil millones de parametros, es viable reajustarlo en un solo nodo de 4 GPU, como hizo el autor, para tareas o configuraciones de acciones cercanas.
- Estudio de la estabilidad del etiquetado por entropia: los datos publicados muestran una correlacion de rango de -0,73 entre numero de clusters y proporcion de tramos de precision, y una distribucion bimodal de la velocidad por episodio; el checkpoint permite analizar como esa variabilidad se traduce en el comportamiento de la politica.
- Evaluacion de robustez temporal de politicas: util para comprobar si una politica entrenada con datos acelerados mantiene precision en los tramos que el metodo considero criticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de exito, metricas de simulador ni comparaciones cuantitativas de la politica; las unicas cifras publicadas son las del re-timing de datos (1,402x global, 1,518x medio por episodio), que no constituyen una evaluacion de rendimiento del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia (estimacion propia a partir del numero de parametros, no confirmada por el autor): en bf16/fp16, unos 5,5 GB solo de pesos; con activaciones, codificador visual y cabeza de acciones, un rango practico de 8 a 16 GB.
- Cuantizacion a 8 bits: aproximadamente 3 GB de pesos; a 4 bits, alrededor de 2 GB. No se documentan herramientas de cuantizacion compatibles para este modelo, por lo que son estimaciones teoricas.
- GPU recomendadas para entrenamiento: el autor uso 4 GPU con batch efectivo 256; para reproducir ese regimen son adecuadas A100 de 40/80 GB o H100. En inferencia basta una GPU unica.
- GPU de consumo: cabe con holgura en RTX 3090, RTX 4090 o RTX 5090 (24-32 GB), y previsiblemente en RTX 4080/5080 (16 GB). En tarjetas de 8 GB el margen es muy estrecho y probablemente requiera cuantizacion.
- Opciones de despliegue: al tratarse de un VLA con cabeza de difusion y no de un modelo autoregresivo de texto, no aplican vLLM, llama.cpp, Ollama o TGI en su forma habitual; el despliegue pasa por el ecosistema de NVIDIA GR00T o por el codigo de inferencia del repositorio GR00T-action-quantization. No se documentan integraciones alternativas.
- Latencia y throughput: no disponibles.
- Almacenamiento: 7,6 GB de repositorio, sin `optimizer.pt` (el autor lo omite porque lo esta usando para reanudar).
- Requisito adicional: el fichero `experiment_cfg/metadata.json` contiene las estadisticas de normalizacion; sin el no es posible des-normalizar las acciones y el modelo es inutilizable en la practica.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| prehj/GR00T-N1.5-allex-demospeedup-1x2x | 2.726.736.832 (2,73B) | no disponible | sin benchmarks publicados; 1,402x de aceleracion de datos | other | Hugging Face, 0 descargas, 0 likes |
| nvidia/GR00T-N1.5-3B (modelo base) | 3B nominal en el nombre; no verificado | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | NVIDIA (consultar terminos del modelo base) | Hugging Face |
| prehj/allex-n15-base-v1v2v3v4 (checkpoint-30000) | mismo backbone N1.5 | no disponible | usado como extractor de entropia en este trabajo; sin benchmarks publicados | other | Hugging Face |
| DemoSpeedup (CoRL 2025, metodo) | no aplica (metodo de re-timing) | no aplica | 2x/4x en el original frente a 1x/2x en esta reproduccion | no disponible | demospeedup.github.io |

## Limitaciones y advertencias

- Checkpoint no final: corresponde al paso 25.000 de 30.000. El entrenamiento se interrumpio a los 27.315 pasos por cuota de disco y el autor preve reanudarlo y actualizar el repositorio. Los resultados pueden cambiar.
- No es un checkpoint ATQ y no debe presentarse como tal; la politica es un decodificador unico N1.5.
- Divergencia respecto al metodo original: se usan tasas 1x/2x en lugar de 2x/4x y se habilita una rama que en el codigo original era inalcanzable (las etiquetas solo tomaban {0, -1}). Los resultados no son directamente extrapolables a la implementacion original.
- Inestabilidad del etiquetado: la distribucion de la aceleracion por episodio es bimodal (45 % entre 1,0 y 1,2x; 48 % entre 1,8 y 2,0x; 6 % en valores intermedios) y la correlacion entre numero de clusters y proporcion de precision es de -0,73, lo que sugiere que la velocidad asignada depende mas del numero de clusters detectados que de la semantica de la tarea.
- Dependencia critica de artefactos auxiliares: sin `experiment_cfg/metadata.json` no se pueden des-normalizar las acciones.
- Dominio restringido: entrenado sobre ALLEX con configuracion `allex_eef_abs_no_waist` (efector final absoluto, sin cintura). La generalizacion a otros robots, espacios de accion o tareas no esta documentada y es dudosa sin ajuste fino.
- Sesgos conocidos: no se documenta ningun analisis de sesgos demograficos, visuales o de entorno. El modelo hereda los sesgos del modelo base y del dataset ALLEX, no disponibles en esta informacion.
- Riesgo de alucinacion: no evaluado. En un modelo de accion, el equivalente es la generacion de trayectorias fisicamente invalidas o inseguras; no hay datos de seguridad publicados.
- Contexto e idiomas: no disponibles; no se documentan limites de ventana de contexto ni cobertura linguistica.
- Licencia: marcada como `other` en Hugging Face. Al derivar de nvidia/GR00T-N1.5-3B, es imprescindible revisar los terminos del modelo base antes de cualquier uso comercial; no se detallan en la model card.
- Validacion de la comunidad nula: 0 descargas y 0 likes en el momento de la consulta; no hay evaluaciones independientes.
- Uso en produccion: no se recomienda desplegar este checkpoint en un robot real sin validacion previa en simulacion y con las salvaguardas fisicas habituales.
- Tool calling, agentes, vision explicita y modo de pensamiento: no documentados; no deben asumirse.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/prehj/GR00T-N1.5-allex-demospeedup-1x2x
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.5-3B
- Proyecto DemoSpeedup (CoRL 2025): https://demospeedup.github.io/
- Politica ALLEX base utilizada para el calculo de entropia: https://huggingface.co/prehj/allex-n15-base-v1v2v3v4
- Codigo: repositorio GR00T-action-quantization, scripts `scripts/demospeedup_entropy.py`, `scripts/demospeedup_label.py`, `scripts/demospeedup_retime_dataset.py` y `run_scripts/alinlab/demospeedup_*.sh`. La model card no proporciona la URL del repositorio, por lo que no esta disponible.
- Busqueda web: no se han encontrado enlaces relevantes. Los resultados devueltos corresponden a foros de historieta (bdgest.com) y a respuestas de Baidu Zhidao sobre videojuegos, sin ninguna relacion con este modelo.
