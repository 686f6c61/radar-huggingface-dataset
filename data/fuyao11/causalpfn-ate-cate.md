# fuyao11/CausalPFN-ATE-CATE

## Resumen

CausalPFN-ATE-CATE es un paquete de inferencia y evaluacion publicado por el usuario independiente fuyao11 sobre el checkpoint preentrenado oficial de CausalPFN, un modelo de inferencia causal basado en un transformer preentrenado (PFN, *prior-fitted network*). El autor del release no ha entrenado, ajustado ni calibrado los pesos: su aportacion se limita al empaquetado de inferencia, la construccion de un benchmark propio (StatsArena, 1.000 tablas sinteticas) y la evaluacion comparativa frente a una linea base de Random Forest. El modelo estima dos cantidades causales a partir de datos tabulares observacionales: el efecto medio del tratamiento, ATE = E[Y(1)-Y(0)], y el efecto condicional, CATE(x) = E[Y(1)-Y(0)|X=x].

El interes practico esta en el enfoque: en lugar de ajustar un estimador clasico por tabla, CausalPFN aplica inferencia *in-context* sobre un transformer preentrenado con datos sinteticos generados por un prior causal, de modo que produce estimaciones puntuales e intervalos de credibilidad nativos en una sola pasada. El repositorio ocupa 0,3 GB e incluye el checkpoint sin modificar, su hash SHA-256 y revision upstream inmutable, un ZIP de inferencia con runtime y un archivo de reproduccion con generadores, oraculo, linea base y codigo de evaluacion.

La relevancia es doble: por un lado ofrece una via rapida (menos de un segundo por tabla en GPU) para obtener estimaciones causales preliminares sobre datos tabulares; por otro, documenta honestamente los limites del checkpoint, en particular una cobertura de los intervalos para ATE por debajo del 95% nominal (76,83% en distribucion y 78,61% fuera de distribucion), lo que desaconseja su uso directo en decisiones de produccion sin calibracion adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer preentrenado como prior-fitted network (PFN) para inferencia causal in-context; detalles internos de capas y dimensiones no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en formato PyTorch, `causalpfn_v0.pt`) |
| Idiomas soportados | en, zh (etiquetas de la model card; la tarea es numerica sobre datos tabulares) |
| Licencia | causalpfn-license (terminos del checkpoint upstream; ver `licenses/CausalPFN_LICENSE`) |
| Formato de pesos | PyTorch (`.pt`); no se distribuye GGUF ni safetensors |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer preentrenado segun el paradigma de *prior-fitted networks*: se entrena con un prior que genera tablas sinteticas (covariables X, tratamiento T y resultado Y) y se optimiza para predecir la cantidad causal objetivo directamente a partir del conjunto de datos observado, sin ajuste por tabla en tiempo de inferencia. La entrada al predictor es X, T, Y y una consulta fija; el contrato de entrada no admite variables de mediacion ni acceso a un oraculo. El release no documenta el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO, por lo que esos datos deben considerarse no disponibles.

El paquete de fuyao11 no modifica los pesos ni anade adaptadores, cabezas de error o checkpoints de calibracion, y lo declara explicitamente. Su aportacion tecnica es el empaquetado de inferencia (Python 3.10-3.13, dependencias en `arena_n500/requirements.txt`, verificacion con `--verify-only`), la construccion del benchmark StatsArena con 1.000 tablas y pesos predefinidos iguales por DGP, y la evaluacion con sesgo, error estandar, RMSE, longitud de intervalo, cobertura y tiempo frente a una linea base de Random Forest con B=100 arboles de bootstrap.

## Capacidades

- Estimacion de ATE (efecto medio del tratamiento) sobre datos tabulares observacionales.
- Estimacion de CATE (efecto condicional al covariable) para cada fila de X.
- Produccion de intervalos de credibilidad nativos al 95% junto con la estimacion puntual, sin calculo posterior de errores estandar por tabla.
- Inferencia in-context en una sola pasada: no requiere reentrenamiento ni ajuste por conjunto de datos.
- Ejecucion en CPU para el ejemplo de inicio rapido y en GPU para evaluacion a escala.
- Soporte de Python 3.10 a 3.13 mediante el runtime empaquetado.
- No se documentan capacidades de generacion de texto, codigo, matematicas, vision, audio, tool calling ni razonamiento multi-paso; el modelo es un estimador causal especializado, no un LLM de proposito general.

## Casos de uso

- Analisis de experimentos A/B y cuasi-experimentos: dado un conjunto de covariables, tratamiento binario y resultado, el modelo devuelve una estimacion de ATE con intervalo en menos de un segundo en GPU, util para triaje rapido antes de un analisis econometrico formal.
- Segmentacion de efectos heterogeneos: el CATE permite identificar subpoblaciones con mayor o menor respuesta a una intervencion (por ejemplo, campanas de marketing o programas de retencion) y priorizar acciones sobre los segmentos con efecto estimado mas alto.
- Evaluacion comparativa de pipelines causales: el benchmark incluido (1.000 tablas con oraculo y linea base RF) sirve para validar implementaciones propias de estimadores o para reproducir los resultados publicados con hash y revision inmutables.
- Investigacion metodologica en PFN causales: el paquete permite estudiar el comportamiento del checkpoint oficial en regimenes de cambio estructural (etiquetas ID/OOD operativas) sin reentrenar, comparando sesgo, RMSE y cobertura.
- Docencia y formacion en inferencia causal: el ejemplo sintetico observacional-only y la salida esperada (`expected_output.json`) generada por ejecucion real permiten ilustrar la diferencia entre estimacion puntual e intervalo y el problema de la cobertura nominal.
- Preanalisis en ciencias sociales y salud publica: estimaciones preliminares de efecto tratamiento sobre datos tabulares anonimizados, siempre como paso exploratorio y no como sustituto de un diseno causal identificado.
- Integracion en pipelines de evaluacion automatizada: al exponer un contrato de entrada fijo (X, T, Y y consulta) y tiempos de inferencia de decimas de segundo, puede incorporarse a suites de regresion que comprueben la estabilidad de estimaciones entre versiones de datos.

## Benchmarks y rendimiento

Resultados publicados en la model card del release, sobre 1.000 tablas con pesos iguales por DGP. ID/OOD son etiquetas operativas de referencia y cambio estructural, no un ID/OOD oficial verificado del preentrenamiento. El tiempo incluye intervalos (RF con B=100) y la comparacion GPU-PFN frente a CPU-RF no es un experimento de speedup con hardware emparejado.

| Target | Split | Metodo | Sesgo | SE | RMSE | Longitud | Cobertura | Tiempo (s) |
|---|---|---|---:|---:|---:|---:|---:|---:|
| ATE | id | causalpfn | 0,0091 | 0,1069 | 0,1211 | 0,2861 | 76,83% | 0,836 |
| ATE | ood | causalpfn | 0,0207 | 0,0629 | 0,0700 | 0,1719 | 78,61% | 0,878 |
| CATE | id | causalpfn | 0,0086 | 0,2401 | 0,3216 | 6,4158 | 100,00% | 0,168 |
| CATE | ood | causalpfn | 0,0322 | 0,1261 | 0,1940 | 3,9290 | 100,00% | 0,215 |
| ATE | id | rf | -0,0133 | 0,1351 | 0,1446 | 0,6852 | 98,66% | 130,278 |
| ATE | ood | rf | -0,0275 | 0,1080 | 0,1197 | 0,6746 | 98,60% | 144,089 |
| CATE | id | rf | -0,0342 | 0,4750 | 0,6314 | 1,7332 | 90,68% | 55,783 |
| CATE | ood | rf | 0,0420 | 0,3244 | 0,3474 | 0,9778 | 89,44% | 69,712 |

Lectura de los datos: CausalPFN reduce el RMSE de ATE frente a RF (0,1211 frente a 0,1446 en ID; 0,0700 frente a 0,1197 en OOD) y el de CATE (0,3216 frente a 0,6314 en ID; 0,1940 frente a 0,3474 en OOD), con sesgos absolutos por debajo de 0,033 en todos los casos. Sin embargo, la cobertura de ATE queda muy por debajo del 95% nominal, mientras que la cobertura de CATE alcanza el 100% acompanada de intervalos muy anchos (longitud 6,4158 en ID frente a 1,7332 de RF), lo que indica intervalos poco informativos mas que una calibracion superior.

## Requisitos de hardware

- VRAM estimada: no disponible; el release no publica el numero de parametros ni el pico de memoria. El repositorio completo ocupa 0,3 GB, lo que acota el peso de los artefactos pero no la memoria de ejecucion.
- GPU recomendadas: no especificadas por el autor. La evaluacion se ejecuto con el checkpoint en GPU (tiempos de 0,168-0,878 s por tabla) y la linea base RF en CPU (55-144 s por tabla), sin documentar el modelo de GPU empleado.
- GPU de consumo: el ejemplo de inicio rapido (`arena_n500/quickstart.py`) esta pensado para ejecutarse en CPU, por lo que el umbral de entrada es bajo; no hay datos publicados sobre comportamiento en RTX 4090 u otras GPU de consumo.
- Opciones de despliegue: runtime Python propio del paquete (PyTorch), con `predict.py --verify-only` para validacion y `quickstart.py` para el ejemplo sintetico. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, coherente con un modelo de estimacion tabular y no de generacion de texto.
- Latencia y throughput: 0,168-0,878 s por tabla en el entorno de evaluacion del autor, incluyendo intervalos; el tiempo varia segun hardware segun la propia model card.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| CausalPFN-ATE-CATE (este release) | PFN transformer para ATE/CATE | no disponible | no disponible | RMSE ATE ID 0,1211; CATE ID 0,3216; cobertura ATE 76,83% | causalpfn-license | Hugging Face, 0 descargas |
| CausalPFN oficial (vdblm/causalpfn) | Checkpoint original upstream | no disponible | no disponible | No evaluado en este benchmark con los mismos splits | terminos upstream | Hugging Face |
| Random Forest con bootstrap (B=100) | Ensemble de arboles, linea base | no aplica | no aplica | RMSE ATE ID 0,1446; CATE ID 0,6314; cobertura ATE 98,66% | segun implementacion | Referencia incluida en el archivo de reproduccion |

No se dispone de datos publicados que permitan comparar este release con otros estimadores causales basados en PFN o con meta-aprendices (T-learner, S-learner, X-learner) bajo el mismo benchmark; esa comparacion figura como no disponible.

## Limitaciones y advertencias

- Cobertura de ATE insuficiente: 76,83% (ID) y 78,61% (OOD) frente al 95% nominal, segun el propio autor. Los intervalos de ATE no deben interpretarse como garantia de calibracion.
- Cobertura de CATE del 100% con intervalos muy anchos (longitud 6,4158 en ID), lo que refleja intervalos poco utiles para decision mas que una calibracion excelente.
- El release no es oficial: no ha sido entrenado, ajustado ni calibrado por los autores originales de CausalPFN, y no implica afiliacion ni respaldo.
- Las etiquetas ID/OOD del benchmark son operativas y no corresponden a un ID/OOD oficial verificado del preentrenamiento, por lo que la generalizacion fuera de distribucion real no esta caracterizada.
- El contrato de entrada no admite variables de mediacion ni oraculo, lo que restringe los disenos causales que pueden representarse.
- No hay informacion publicada sobre sesgos demograficos o de otro tipo, riesgo de alucinacion en el sentido de estimaciones espurias, ni sobre el comportamiento con variables categoricas de alta cardinalidad o valores faltantes.
- Idiomas declarados en, zh, pero la tarea es numerica; no hay evaluacion de sesgo por idioma ni por procedencia de los datos tabulares.
- Licencia `causalpfn-license` con terminos adicionales en `licenses/CausalPFN_LICENSE`; es imprescindible revisarla antes de cualquier uso comercial, ya que el release no relicencia componentes de terceros.
- Ausencia total de adopcion (0 descargas, 0 likes) y de validacion independiente: el benchmark lo construye el mismo autor del release, sin replicacion externa.
- Los tiempos GPU-PFN frente a CPU-RF no constituyen un experimento de speedup con hardware emparejado y no deben citarse como tal.
- No apto como sustituto de un analisis causal con supuestos de identificacion explicitos en entornos de produccion o decisiones de alto impacto sin calibracion y validacion adicionales.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fuyao11/CausalPFN-ATE-CATE
- Checkpoint oficial de CausalPFN: https://huggingface.co/vdblm/causalpfn
- Codigo upstream: https://github.com/vdblm/CausalPFN
- Resultados de evaluacion: https://huggingface.co/fuyao11/CausalPFN-ATE-CATE/blob/main/EVALUATION.md
- Licencia CausalPFN: https://huggingface.co/fuyao11/CausalPFN-ATE-CATE/blob/main/licenses/CausalPFN_LICENSE
- Aviso de atribucion: https://huggingface.co/fuyao11/CausalPFN-ATE-CATE/blob/main/NOTICE
- Contrato de entrada del benchmark: https://huggingface.co/fuyao11/CausalPFN-ATE-CATE/blob/main/arena_n500/README.md
- Model card del paquete: https://huggingface.co/fuyao11/CausalPFN-ATE-CATE/blob/main/arena_n500/MODEL_CARD.md
- Salida esperada del ejemplo: https://huggingface.co/fuyao11/CausalPFN-ATE-CATE/blob/main/arena_n500/example/expected_output.json
