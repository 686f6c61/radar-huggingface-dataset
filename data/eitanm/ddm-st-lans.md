# Eitanm/ddm-st-lans

## Resumen

`ddm-st-lans` no es un modelo de lenguaje: es un repositorio con dos redes de aproximacion de verosimilitud (LAN, likelihood approximation networks) para el modelo de difusion a la deriva (DDM, drift diffusion model) con variabilidad entre ensayos en el tiempo de no decision. Lo publica el usuario Eitanm y esta vinculado al ecosistema HSSM (Hierarchical Sequential Sampling Models) de modelado cognitivo bayesiano. Los dos ficheros que contiene, `ddm_uniform_st.onnx` y `ddm_normal_st.onnx`, ocupan 85 KB cada uno.

El problema que resuelven es conocido en psicologia matematica: la verosimilitud del DDM con variabilidad en `t` no tiene forma cerrada y suele requerir integracion numerica, lo que encarece el ajuste jerarquico. Estas redes sustituyen esa integracion por una evaluacion ONNX directa, integrable en HSSM mediante `loglik_kind="approx_differentiable"`. La diferencia entre las dos variantes esta en la distribucion de la variabilidad: `ddm_uniform_st` asume `Uniform(t - st, t + st)` con desviacion tipica `st / sqrt(3)`, mientras que `ddm_normal_st` asume `Normal(t, st)` no truncada.

Su relevancia es acotada pero especifica: es una pieza de infraestructura para investigadores que ajustan modelos de tiempo de reaccion y necesitan el parametro `st`. El repositorio se declara como ubicacion interina: su destino final es `franklab/HSSM`, junto al resto de LAN del proyecto, y las redes solo se quedan aqui hasta que sus registros se fusionen en la rama principal. No tiene descargas ni likes, y no incluye resultados de validacion publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de aproximacion de verosimilitud (LAN): red neuronal feedforward entrenada en JAX y exportada a ONNX. Numero de capas y neuronas: no disponible en la informacion (se remite a los model cards dentro de `lan/<modelo>/`, no incluidos) |
| Parametros totales | no disponible |
| Longitud de contexto | no aplica: la entrada es un vector de parametros del modelo y tiempos de reaccion, no una secuencia de tokens |
| Tipos de cuantizacion | no disponible; se distribuye en ONNX, sin variantes cuantizadas declaradas |
| Idiomas soportados | no aplica: entrada y salida numericas |
| Licencia | MIT |
| Formato de pesos | ONNX (`ddm_uniform_st.onnx`, `ddm_normal_st.onnx`); el repositorio incluye ademas bundles de entrenamiento con estado de JAX, configs e historial en `lan/<modelo>/` y un `manifest.json` |
| Autor | Eitanm |
| Tipo de modelo | Aproximador de verosimilitud para modelos de muestreo secuencial (SSM), no generativo |
| Tamano de los ficheros | 85 KB por red; el repositorio figura como 0.0 GB (redondeo) |
| Entrada | Parametros `v`, `a`, `z`, `t`, `st` (y tiempos de reaccion) |
| Salida | Densidad o log-verosimilitud del DDM con variabilidad en el tiempo de no decision |
| Dependencia de software | HSSM, rama `labmate/st-networks` de `EItanm1999/HSSM`, con el guard de admisibilidad consciente de `st` |
| Fecha de creacion (metadatos) | 2026-09-20; ultima actualizacion 2026-09-20 |
| Repositorio previsto | `franklab/HSSM` (migracion pendiente de fusion upstream) |

## Arquitectura y entrenamiento

La informacion disponible describe el artefacto, no la topologia interna. Se sabe que son redes de aproximacion de verosimilitud entrenadas en JAX -los bundles de `lan/` contienen el estado de JAX, las configuraciones y el historial de entrenamiento- y exportadas a ONNX para inferencia. No se publican en este repositorio el numero de tokens de entrenamiento, la composicion del conjunto de datos ni el numero de parametros, y no aplica ninguna fase de RLHF o DPO, ya que no es un modelo generativo.

La innovacion tecnica relevante es de modelado, no de arquitectura de red: incorporar `st`, la variabilidad entre ensayos del tiempo de no decision, como parametro libre del DDM y aproximar su verosimilitud de forma diferenciable. Las dos variantes cubren supuestos distintos sobre `t` por ensayo. En `ddm_uniform_st`, `t` se distribuye uniformemente en `[t - st, t + st]` y `st` es la semianchura, con desviacion tipica `st / sqrt(3)`. En `ddm_normal_st`, `t` sigue una normal de media `t` y desviacion tipica `st`, sin truncar. El propio autor advierte que un mismo valor de `st` no implica la misma cantidad de variabilidad en las dos variantes. El ajuste requiere el guard de admisibilidad de la rama `labmate/st-networks`, que define la banda donde estos kernels depositan densidad.

## Capacidades

- Evaluacion de la (log-)verosimilitud del DDM con variabilidad entre ensayos en el tiempo de no decision, en dos supuestos distribucionales (`uniform_st` y `normal_st`).
- Integracion con HSSM como verosimilitud aproximada y diferenciable (`loglik_kind="approx_differentiable"`), lo que permite su uso dentro de un muestreador MCMC jerarquico.
- Inferencia via ONNX, ejecutable con `onnxruntime` sobre CPU.
- Soporte de los parametros estandar del DDM: tasa de deriva `v`, umbral `a`, sesgo inicial `z`, tiempo de no decision `t` y el nuevo `st`.
- Evaluacion repetida dentro de un bucle de ajuste: es precisamente el caso de uso para el que estan entrenadas.
- No dispone de generacion de texto, razonamiento simbolico, codigo, matematicas generativas, vision, audio, tool calling, function calling ni capacidades de agente. No es multimodal ni multilingue; no tiene modo de pensamiento.

## Casos de uso

- Ajuste jerarquico de datos de tiempo de reaccion en HSSM: se declara `model="ddm_uniform_st"` (o `ddm_normal_st`), se pasa el fichero ONNX como `loglik` y se acotan los parametros; el ajuste se realiza con la verosimilitud aproximada en lugar de integracion numerica sobre `t`.
- Recuperacion de parametros y calibracion basada en simulacion: al ser una funcion de verosimilitud evaluable y barata, permite generar datos sinteticos con `st` conocido y comprobar si el muestreador recupera los valores, un paso previo obligatorio antes de usarla con datos reales.
- Comparacion de modelos con y sin variabilidad en el tiempo de no decision: ajustar el DDM estandar frente a `ddm_uniform_st` o `ddm_normal_st` sobre el mismo conjunto de datos y comparar mediante criterios de informacion (WAIC, LOO) o factores de Bayes. Es el uso mas directo para el que estas redes fueron entrenadas.
- Modelado de decisiones perceptuales en tareas de dos alternativas forzadas: analisis de datos de laboratorio donde el tiempo de no decision varia de ensayo a ensayo por fluctuaciones de atencion o de ejecucion motora, situacion en la que el DDM de parametros fijos infraestima `t`.
- Analisis conjunto con medidas neurales: en estudios de EEG, MEG o fMRI que registran tiempo de reaccion, la variabilidad en `t` es un factor de confusion habitual al vincular actividad neural con el proceso de decision; modelarla explicitamente con `st` separa mejor el componente de decision del componente motor.
- Analisis de cohortes con diferencias individuales: en un modelo jerarquico, `st` puede tener efectos a nivel de sujeto o de grupo (por ejemplo, comparar poblaciones con distinta variabilidad motora) sin recaer en integracion numerica costosa.
- Despliegue ligero y reproducible en entornos de laboratorio: dos ficheros de 85 KB ejecutables en CPU eliminan la dependencia de una ruta de sistema de ficheros concreta y permiten que los tutoriales se reproducan en cualquier maquina con `onnxruntime` y la rama de HSSM instalada.
- Material docente: los tutoriales del repositorio estan pensados para reejecutarse con los nuevos nombres de modelo, lo que sirve para ilustrar como se entrena y se integra una LAN en un flujo de trabajo bayesiano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No aplican metricas de modelos de lenguaje (MMLU, HumanEval, GSM8K) ni comparativas de calidad generativa, porque no es un modelo de lenguaje.

Los unicos datos cuantitativos presentes en la informacion son el tamano de cada red (85 KB) y los rangos de entrenamiento y de admisibilidad declarados para `st`: el borde de entrenamiento es 0.001, mientras que se recomienda acotar `st` en 0.01 como minimo en el ajuste. No hay cifras publicadas de error de aproximacion frente a la verosimilitud exacta ni de tiempos de evaluacion.

| Aspecto | Dato |
|---|---|
| Benchmarks de lenguaje | no aplica |
| Error de aproximacion frente a verosimilitud numerica | no disponible |
| Latencia por evaluacion | no disponible |
| Tamano del artefacto | 85 KB por red |
| Rango de `st` recomendado en el ajuste | `(0.01, 0.25)` |
| Borde de `st` cubierto en entrenamiento | 0.001 |

## Requisitos de hardware

- No requiere GPU. La inferencia es ONNX sobre CPU y cada red pesa 85 KB.
- VRAM para inferencia: no aplica. El consumo de memoria del proceso lo domina el entorno de Python, `onnxruntime` y el marco de ajuste, no la red.
- GPU recomendadas: no disponible y, por el tamano del artefacto, innecesarias en principio. No se documenta ninguna configuracion probada.
- Cabe en cualquier equipo de sobremesa o portatil, incluidos entornos sin GPU dedicada, siempre que se pueda instalar HSSM y JAX/ONNX Runtime.
- Opciones de despliegue: `pip install "hssm @ git+https://github.com/EItanm1999/HSSM.git@labmate/st-networks"` junto con `huggingface_hub.hf_hub_download` para obtener el `.onnx`. vLLM, llama.cpp, Ollama y TGI no aplican: no es un modelo generativo ni un modelo de lenguaje.
- Latencia y throughput: no disponible. No se publican mediciones por evaluacion ni por cadena MCMC, y el coste dominante en un ajuste real es el muestreador jerarquico, no la red.

## Comparativa con modelos similares

No se detallan en la informacion disponible las alternativas concretas dentro de `franklab/HSSM`, por lo que la comparativa se limita a las dos variantes del propio repositorio y a la referencia cualitativa del resto de LAN del proyecto.

| Modelo | Supuesto sobre el tiempo de no decision | Parametro de variabilidad | Tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ddm_uniform_st` | `Uniform(t - st, t + st)` | `st` = semianchura, SD = `st / sqrt(3)` | 85 KB (ONNX) | MIT | HuggingFace, ubicacion interina |
| `ddm_normal_st` | `Normal(t, st)` no truncada | `st` = desviacion tipica | 85 KB (ONNX) | MIT | HuggingFace, ubicacion interina |
| DDM sin variabilidad en `t` | `t` fijo | no tiene | no aplica (solucion en serie implementada en HSSM) | segun HSSM | HSSM estable |
| Otras LAN de HSSM | segun modelo | segun modelo | no disponible | segun HSSM | `franklab/HSSM` |

Nota de comparacion: una misma `st` no representa la misma variabilidad en las dos redes, ya que la uniforme tiene desviacion tipica `st / sqrt(3)` y la normal tiene `st`. Ademas, la variante normal es no acotada y admite teoricamente tiempos de no decision negativos, mientras que la uniforme los evita por construccion.

## Limitaciones y advertencias

- El parametro `st` debe acotarse con un minimo de 0.01, no con el borde de entrenamiento de 0.001: por debajo de 0.01 la red fabrica un maximo en la frontera del intervalo.
- Contra una version estable de HSSM, el guard de admisibilidad trunca la banda donde estos kernels depositan densidad; el efecto es un sesgo en `t` y no se produce ningun error visible. Es obligatorio instalar la rama `labmate/st-networks`.
- La variante `ddm_normal_st` no esta truncada, por lo que asigna densidad a tiempos de no decision negativos, algo teoricamente incoherente con el modelo.
- Comparar `st` entre las dos variantes como si midieran lo mismo es un error: la uniforme usa semianchura y la normal usa desviacion tipica.
- No hay validacion publicada: cero descargas, cero likes y ningun resultado de recuperacion de parametros ni de contraste frente a verosimilitud exacta en la informacion disponible.
- La ubicacion es interina. Las redes estan destinadas a `franklab/HSSM`, de modo que las rutas de descarga pueden cambiar y romper scripts fijados al identificador actual.
- Los model cards con la caja de entrenamiento, la arquitectura y las advertencias de cada red viven en `lan/<modelo>/` y no se incluyen en la informacion proporcionada, por lo que no se pueden verificar topologia, precision numerica ni rangos de entrenamiento completos.
- Al no ser un modelo generativo, no hay alucinacion en el sentido habitual, pero si extrapolacion: fuera de los rangos entrenados la verosimilitud aproximada no es fiable y puede producir maximos espurios en los bordes.
- Licencia MIT: permite uso comercial y modificacion con aviso de copyright y licencia. No impone restricciones de campo de uso.
- Los metadatos del repositorio registran fechas de 2026-09-20, lo que conviene contrastar antes de citar el modelo como publicado en una fecha concreta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Eitanm/ddm-st-lans
- Rama de HSSM con los registros y el guard de admisibilidad: https://github.com/EItanm1999/HSSM.git (rama `labmate/st-networks`)
- Repositorio de destino previsto de las LAN: https://huggingface.co/franklab/HSSM
- Nota sobre la busqueda web: los resultados devueltos no guardan ninguna relacion con el modelo (paginas de ayuda de Facebook en chino y griego), por lo que no se han podido incorporar papers, blogs ni demos adicionales. No hay enlaces a articulos, repositorios auxiliares ni demostraciones en la informacion disponible.
