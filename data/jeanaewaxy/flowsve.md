# jeanaewaxy/flowsve

## Resumen

FlowSVE-MS es un modelo de mejora de voz cantada (singing voice enhancement, SVE) y de voz hablada basado en flow matching, publicado por el usuario jeanaewaxy en Hugging Face. El repositorio, identificado como `jeanaewaxy/flowsve`, contiene un checkpoint final de 65,7 millones de parametros (`flowsve_ms_ep46.ckpt`), los manifiestos de entrenamiento y validacion, y el audio del benchmark empleado en la evaluacion. Se trata de una publicacion anonima asociada a un articulo bajo revision por pares a doble ciego: ni el paper ni el repositorio de codigo estan enlazados de forma publica en la informacion disponible.

El modelo resuelve el problema de separar y restaurar una senal vocal limpia a partir de una mezcla degradada. Los manifiestos describen un protocolo de 720.000 pares de entrenamiento con proporcion 1:1 entre voz hablada y voz cantada (aproximadamente 1.000 horas), generados mediante un pipeline de degradacion sintetica documentado en el repositorio de codigo. La validacion especifica de canto consta de 66.876 pares. El checkpoint corresponde a la epoca 46, con 528.750 actualizaciones y pesos EMA.

Es relevante ahora porque cubre una tarea poco atendida (la mejora de voz cantada, no solo de habla) con un modelo de tamano reducido que cabe en GPU de consumo, y porque libera no solo el checkpoint sino tambien la receta de datos y el audio de benchmark, lo que facilita la reproducibilidad. La licencia del checkpoint es MIT y los manifiestos y el audio de benchmark se publican bajo CC BY 4.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo generativo basado en flow matching; topologia interna (transformer, U-Net u otra) no disponible |
| Parametros totales | 65,7 millones |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica / no disponible (modelo de audio; la ventana se define en muestras o segundos de audio y no se especifica) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el entrenamiento combina voz hablada y cantada, pero no se declara cobertura linguistica) |
| Licencia | MIT (checkpoint); CC BY 4.0 (manifiestos de datos y audio de benchmark) |
| Formato de pesos | checkpoint de PyTorch Lightning reducido a pesos e hiperparametros (`.ckpt`) |

Datos adicionales del artefacto:

| Parametro | Valor |
|---|---|
| Identificador en Hugging Face | jeanaewaxy/flowsve |
| Tamano del repositorio | 0,4 GB |
| Pipeline declarado | no disponible |
| Frecuencia de muestreo del benchmark | 44,1 kHz, estereo, FLAC |
| Epoca / actualizaciones del checkpoint | epoca 46, 528.750 actualizaciones, pesos EMA |
| Volumen de entrenamiento declarado | 720.000 pares, aproximadamente 1.000 h, proporcion 1:1 habla:canto |
| Volumen de validacion declarado | 66.876 pares de canto |
| Descargas / likes en el momento de la consulta | 0 / 0 |
| Fecha de creacion / actualizacion del repositorio | 2026-09-12 (creacion), 2026-09-12 (actualizacion) |

## Arquitectura y entrenamiento

La unica informacion arquitectonica declarada es que el modelo emplea flow matching, una familia de modelos generativos que aprende un campo de velocidad que transporta una distribucion de ruido hacia la distribucion de datos, y que se muestrea integrando una ecuacion diferencial ordinaria. No se especifica en la informacion disponible si el backbone es un transformer, una U-Net convolucional o un hibrido, ni cuantos pasos de muestreo requiere la inferencia. Tampoco se detalla la representacion de audio de entrada y salida (forma de onda, espectrograma de magnitud, complejo o representacion latente). El checkpoint se distribuye en formato PyTorch Lightning con pesos e hiperparametros, e incluye pesos EMA, lo que sugiere un entrenamiento con media movil exponencial para estabilizar la inferencia.

El entrenamiento se describe a traves de los manifiestos: 720.000 pares con proporcion 1:1 entre voz hablada y voz cantada, con un total aproximado de 1.000 horas, y cada manifiesto incluye todos los parametros de degradacion aplicados, lo que indica una estrategia de aumentacion sintetica controlada en lugar de recoleccion de pares ruidoso-limpio reales. Las fuentes se referencian mediante rutas relativas a las raices de los corpus (`GTSinger/...`, `Singing/<corpus>/...`, `Speech/<corpus>/...`, `interference_pool/...`), y el audio de los corpus no se redistribuye. La validacion emplea 66.876 pares exclusivamente de canto. No se declara si hubo etapas de ajuste fino con preferencias humanas (RLHF, DPO) ni funciones de perdida concretas.

## Capacidades

- Mejora de voz cantada: restauracion de voces degradadas en grabaciones a capela, con referencias y entradas degradadas publicadas junto al benchmark.
- Mejora de voz hablada: el protocolo de entrenamiento incluye voz hablada en la misma proporcion que canto, por lo que la tarea declarada abarca ambos dominios.
- Supresion de interferencias y ruido: los manifiestos incluyen un `interference_pool`, lo que apunta a entrenamiento explicito frente a fuentes de interferencia.
- Modelado generativo condicionado: al ser un modelo de flow matching, la generacion se realiza por integracion de un campo de velocidad, lo que permite en principio distintos compromisos entre calidad y numero de pasos.
- Salida estereo a 44,1 kHz segun el benchmark publicado, es decir, calidad compatible con produccion musical.
- Tool calling / function calling: no disponible; no es una capacidad propia de este tipo de modelo.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; no se declara cobertura de idiomas.
- Capacidades especiales: no se declara modo de pensamiento, vision ni audio de entrada mas alla de la propia senal a mejorar.

## Casos de uso

- Limpieza de pistas a capela para produccion musical: dado que el benchmark incluye condiciones a capela de MIR-1K y OpenSinger, el modelo puede aplicarse a pistas vocales con reverberacion, ruido de fondo o acompanamiento residual antes de mezcla o masterizacion.
- Preprocesado para transcripcion de letras y alineacion: una voz mas limpia reduce la tasa de error de sistemas de reconocimiento de voz y de alineadores forzados sobre material cantado, donde el habla no es el dominio dominante.
- Creacion de datasets de canto de alta calidad: la receta de degradacion publicada (720.000 pares con parametros documentados) permite reutilizar el mismo pipeline para generar pares sinteticos destinados a entrenar otros modelos de separacion o mejora.
- Restauracion de grabaciones historicas o de archivo: el modelo puede emplearse para reducir ruido de cinta, hum y limitaciones de banda en grabaciones monofonicas o estereo convertidas a 44,1 kHz.
- Mejora de voz para podcast y locucion: con la mitad del entrenamiento dedicada a habla, resulta aplicable a la reduccion de ruido y reverberacion en material hablado, como paso previo a la publicacion o a la transcripcion automatica.
- Evaluacion comparativa de sistemas de mejora vocal: el paquete de benchmark publicado incluye entradas degradadas, referencias limpias y las salidas de todos los sistemas evaluados, lo que permite reproducir la comparacion o incorporar nuevos sistemas sin volver a degradar el audio.
- Investigacion en modelos generativos de audio: un checkpoint de 65,7 M de parametros con flow matching es un banco de pruebas asequible para estudiar numero de pasos de muestreo, destilacion de trayectorias y compromisos entre fidelidad y coste computacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye el audio de benchmark (`benchmark/benchmark_public.tgz`) con dos condiciones a capela procedentes de MIR-1K y OpenSinger, junto con las entradas degradadas, las referencias limpias y las salidas de todos los sistemas evaluados, pero no se proporcionan las metricas numericas (por ejemplo, SDR, SI-SDR, PESQ, ViSQOL o MOS) obtenidas por FlowSVE-MS ni por los sistemas comparados.

## Requisitos de hardware

- VRAM estimada para inferencia: no hay mediciones publicadas. Como referencia aritmetica derivada del tamano del checkpoint, los pesos en precision de 32 bits ocupan aproximadamente 263 MB (65,7 M parametros) y en 16 bits aproximadamente 131 MB, a lo que hay que sumar activaciones y el coste del muestreo por integracion, que depende del numero de pasos y de la longitud del audio, ambos no disponibles.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano de parametros, cualquier GPU con al menos unos pocos gigabytes de memoria libre deberia poder alojar los pesos; no se especifican requisitos concretos.
- Cabe en GPU de consumo: muy probablemente si, dado el tamano del checkpoint; el fabricante no lo declara y no hay cifras de latencia que lo confirmen.
- Ejecucion en CPU: factible en terminos de memoria, con una velocidad no medida y presumiblemente muy inferior a la de GPU.
- Opciones de despliegue: el checkpoint es un `.ckpt` de PyTorch Lightning, por lo que requiere cargarse con PyTorch y el codigo del autor. No se declara soporte para vLLM, llama.cpp, Ollama, TGI ni otros servidores de inferencia, que ademas no son aplicables a esta modalidad de modelo.
- Latencia y throughput estimados: no disponibles. Dependen del numero de pasos de integracion del flow matching, de la representacion de audio y de la duracion de entrada, datos que no se publican en la informacion disponible.

## Comparativa con modelos similares

No se dispone de datos de comparativas en la informacion proporcionada, y los resultados de la busqueda web no contienen informacion relevante sobre este modelo ni sobre alternativas. La unica referencia comparativa presente en el repositorio son los sistemas evaluados cuyas salidas se incluyen en el paquete de benchmark, pero no se identifican por nombre ni se acompanan de metricas.

| Modelo | Parametros | Contexto / ventana | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FlowSVE-MS (jeanaewaxy/flowsve) | 65,7 M | no disponible (audio) | no disponible | MIT (checkpoint), CC BY 4.0 (datos y benchmark) | repositorio en Hugging Face, codigo y paper anonimos |
| Alternativas de mejora de voz cantada | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Publicacion anonima bajo revision doble ciego: ni el paper ni el repositorio de codigo estan enlazados, por lo que no es posible verificar la metodologia ni reproducir el entrenamiento con la informacion disponible.
- La model card no documenta ninguna metrica de rendimiento; sin cifras de SDR, PESQ o MOS no es posible estimar la calidad de salida frente a alternativas.
- Riesgo de alucinacion en el sentido generativo: al ser un modelo de flow matching, la salida es una muestra de una distribucion aprendida y puede introducir artefactos o modificar caracteristicas timbricas que no esten presentes en la grabacion original.
- Sesgos desconocidos: no se declara la composicion del corpus, la procedencia de los cantantes, el reparto por genero, idioma o estilo musical, ni como puede afectar a voces poco representadas.
- Cobertura linguistica no declarada: se desconoce si el modelo funciona igual de bien en idiomas distintos de los presentes en los corpus de entrenamiento.
- Dependencia de la aumentacion sintetica: el entrenamiento se basa en pares generados con un pipeline de degradacion parametrizado; el comportamiento frente a degradaciones reales fuera de esa distribucion (microfonos, salas, codecs, saturacion analogica) no esta documentado.
- Redistribucion de datos: el repositorio publica manifiestos y audio de benchmark, pero no el audio de los corpus, cuyas condiciones de uso dependen de cada fuente original y deben respetarse por separado.
- Dos licencias distintas conviven en el repositorio: MIT para el checkpoint y CC BY 4.0 para manifiestos y benchmark. El uso comercial del checkpoint esta permitido por MIT, pero los corpus referenciados en los manifiestos pueden tener restricciones propias.
- Inconsistencia de nomenclatura: el repositorio se llama `flowsve` mientras que el checkpoint y el metodo se denominan FlowSVE-MS. Conviene verificar que la version publicada es la que se pretende evaluar.
- Fechas del repositorio: la creacion y la ultima actualizacion figuran como 12 de septiembre de 2026. Conviene comprobar la vigencia del artefacto antes de integrarlo en un flujo de produccion.
- Estado de adopcion nulo en el momento de la consulta (0 descargas y 0 likes): no hay evidencia de uso independiente ni de validacion externa.
- Sin pipeline declarado en Hugging Face, por lo que la integracion requiere codigo propio y no puede apoyarse en las utilidades automaticas de la plataforma.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jeanaewaxy/flowsve
- Paper y repositorio de codigo: no disponibles (publicacion anonima bajo revision doble ciego; el repositorio de codigo se enlaza desde el articulo, no desde la model card)
- Resultados de la busqueda web: no se han encontrado enlaces relevantes al modelo, al paper ni al codigo; los resultados devueltos corresponden a portales institucionales de la Region de Valonia y no guardan relacion con esta ficha.
