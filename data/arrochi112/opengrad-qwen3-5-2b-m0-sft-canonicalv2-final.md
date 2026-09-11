# arrochi112/OpenGrad-Qwen3.5-2B-M0-SFT-CanonicalV2-Final

## Resumen

OpenGrad-Qwen3.5-2B-M0-SFT-CanonicalV2-Final es un ajuste fino supervisado (SFT) de parámetros completos sobre Qwen/Qwen3.5-2B, desarrollado por el usuario arrochi112 dentro del proyecto OpenGrad. El objetivo declarado no es construir un asistente generalista, sino estudiar las fronteras de decisión en tool calling: cuándo el modelo debe emitir una llamada a herramienta, cuándo debe pedir aclaración y cuándo debe responder directamente. La publicación se enmarca explícitamente como artefacto de investigación, no como modelo de producción.

El modelo tiene 1.881.825.088 parámetros (aproximadamente 1,88 mil millones), se distribuye en safetensors con pesos en bfloat16 y ocupa 3,8 GB en el repositorio. Se entrenó durante 2.400 pasos con ventana de 2.048 tokens sobre el corpus Canonical-v2, que contiene 161.966 registros entrenables, con una pérdida que bajó de 1,5725 a 0,3172. La ventana de entrenamiento de 2.048 tokens y el tamaño reducido lo sitúan en el segmento de modelos ligeros para integración en pipelines locales.

Su relevancia es metodológica: es la repetición del mismo experimento (misma receta, misma semilla, mismo horizonte de pasos) cambiando únicamente el corpus, lo que permite aislar el efecto de los datos sobre el comportamiento de decisión. El propio autor advierte que el checkpoint publicado está marcado como REJECT por su política interna de promoción, porque la puerta de calidad exige simultáneamente un límite de sobre-llamada y una caída de recall máxima que un modelo calibrado no puede satisfacer.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen3.5 (tag `qwen3_5_text`); detalles internos no disponibles |
| Parametros totales | 1.881.825.088 (aproximadamente 1,88 mil millones) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; la ventana de entrenamiento fue de 2.048 tokens |
| Tipos de cuantizacion | no disponible; solo se publican pesos en bfloat16 (safetensors) |
| Idiomas soportados | no disponibles |
| Licencia | other / composite-per-source (licencia compuesta por fuente) |
| Formato de pesos | safetensors (bfloat16) |
| Modelo base | Qwen/Qwen3.5-2B, revision 15852e8c16360a2fea060d615a32b45270f8a8fc |
| Metodo de ajuste | SFT de parametros completos, AdamW con estado en fp32 |
| Tamano del repositorio | 3,8 GB |
| Fecha de publicacion | 11 de septiembre de 2026 (segun metadatos de HuggingFace) |

## Arquitectura y entrenamiento

La informacion disponible identifica el modelo base como Qwen/Qwen3.5-2B y etiqueta la arquitectura como `qwen3_5_text`, es decir, una variante de texto de la familia Qwen3.5. No se detallan en la informacion proporcionada el numero de capas, el tipo de atencion, la dimension oculta ni si emplea mecanismos como decodificacion especulativa o atencion lineal. Tampoco se documenta una fase de RLHF o DPO: el procedimiento descrito es exclusivamente SFT de parametros completos, sin etapa de alineamiento posterior.

El entrenamiento uso el corpus Canonical-v2 (161.966 registros entrenables), con dos tipos de supervision: 56.090 registros de `CALL_PREDICTION` y 105.876 de `COMPLETE_TRAJECTORY`. Se ejecuto en bfloat16 con AdamW en fp32, 2.400 pasos con programacion coseno y 120 pasos de calentamiento, tamano de lote efectivo 16 (8 x 2 de acumulacion), presupuesto de micro-lote de 4.096 tokens, ventana de 2.048 tokens y semilla 42. Todo el entrenamiento consumio 42 minutos en una unica A100-SXM4-80GB con un pico de 28,0 GiB de memoria. Los 2.400 pasos cubren solo 0,237 epocas del corpus, frente a 0,377 del experimento anterior, porque el corpus crecio y el numero de pasos se mantuvo fijo a proposito.

La innovacion tecnica del trabajo es de diseno experimental, no de arquitectura. El corpus cambio en tres dimensiones simultaneamente: se anadio la fuente xLAM/APIGen, se corrigio un defecto del validador que elevo ToolACE de 697 a 11.051 registros aceptados, y se corrigio una materializacion interrumpida que llevo When2Call de 4.000 a 6.505 registros. El autor senala que separar la contribucion de cada cambio requeriria una ablation que este experimento no ejecuto. La seleccion de checkpoint se hizo con la regla fijada y confirmada antes de evaluar cualquier checkpoint, sobre la particion DEV de 2.373 ejemplos, eligiendo el paso 1800 por delante de 1200 (mejor `call_f1` pero con sobre-llamada de 0,2214) y de 2400 (practicamente empatado, con 0,0013 de diferencia en puntuacion balanceada).

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo base Qwen/Qwen3.5-2B.
- Tool calling y function calling: es la capacidad en la que se centro el ajuste, especificamente en la decision de llamar o no llamar.
- Prediccion de llamada a herramienta (`CALL_PREDICTION`), entrenada con 56.090 registros especificos.
- Generacion de trayectorias completas de llamada (`COMPLETE_TRAJECTORY`), con 105.876 registros de supervision.
- Peticion de aclaracion ante solicitudes ambiguas: la exactitud de aclaracion medida es 0,7682.
- Reconocimiento de peticiones no soportadas por las herramientas disponibles: exactitud medida de 0,5430.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Vision, audio, modo de razonamiento explicito o decodificacion especulativa: no disponibles en la informacion proporcionada.
- No se mide ni se documenta la exactitud de seleccion de herramienta, la validez de argumentos ni la validez de esquema, por lo que no debe asumirse que el modelo las resuelva correctamente.

## Casos de uso

- Investigacion sobre politicas de tool calling: el modelo permite estudiar como varia la frontera entre llamar y no llamar al cambiar el corpus de entrenamiento, manteniendo constantes receta, semilla y numero de pasos. Es su caso de uso primario y el unico respaldado explicitamente por el autor.
- Reproduccion de experimentos de SFT a pequena escala: con 1,88 mil millones de parametros y 42 minutos de entrenamiento en una A100-80GB, sirve como banco de pruebas economico para validar recetas de ajuste antes de escalarlas a modelos mayores.
- Evaluacion de calibracion de agentes: el modelo reduce la tasa de sobre-llamada de 0,6238 (base sin entrenar) a 0,1505, lo que lo hace util como objeto de estudio en la medicion de falsos positivos de llamada a herramienta.
- Prototipado de asistentes con llamadas a API en entornos controlados: puede integrarse en transformadores o servidores de inferencia para experimentar con flujos de function calling, siempre con evaluacion especifica de la tarea y sin uso autonomo.
- Generacion de conjuntos de datos sinteticos de decision de herramienta: dado que el modelo emite etiquetas de llamada, aclaracion o no soportado, puede emplearse para pre-etiquetar y luego revisar manualmente.
- Analisis comparativo de corpus de tool calling: permite contrastar el efecto de un corpus concreto (Canonical-v2) frente al anterior en metricas como `call_f1`, precision, recall y exactitud de aclaracion, con cifras publicadas.
- Educacion y divulgacion tecnica: sirve como caso practico de como un modelo puede mejorar una metrica agregada (`call_f1` de 0,6278 a 0,7470 frente a la ejecucion previa) mientras empeora otras (precision, exactitud en no soportado), ilustrando los compromisos en el diseno de agentes.

## Benchmarks y rendimiento

Los resultados publicados son de evaluacion interna preregistrada sobre una particion confirmatoria de 1.277 ejemplos, puntuada una sola vez sobre el checkpoint seleccionado. El autor advierte expresamente que no es un benchmark externo intacto.

| Metrica | Este modelo (paso 1800) | B0 (base sin entrenar) | Ejecucion anterior (CorpusV2) |
|---|---:|---:|---:|
| `call_f1` | 0,7470 | 0,6264 | 0,6278 |
| Precision de llamada | 0,7350 | 0,4618 | 0,7610 |
| Recall de llamada | 0,7594 | 0,9735 | 0,5342 |
| Tasa de sobre-llamada | 0,1505 | 0,6238 | 0,0922 |
| Exactitud de aclaracion | 0,7682 | 0,1186 | 0,7951 |
| Exactitud en no soportado | 0,5430 | 0,0177 | 0,6225 |

Seleccion de checkpoint sobre la particion DEV (2.373 ejemplos):

| Paso | `call_f1` | Sobre-llamada | Elegible |
|---|---:|---:|---|
| 600 | 0,7191 | 0,3436 | no, sobre-llama |
| 1200 | 0,7382 | 0,2214 | no, sobre-llama |
| 1800 | 0,7092 | 0,1705 | seleccionado |
| 2400 | 0,7043 | 0,1613 | si |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estandar en la informacion disponible. El autor indica ademas que la exactitud de seleccion de herramienta, la validez de argumentos y la validez de esquema no se calculan con este evaluador, y que la poblacion de evaluacion no contiene ejemplos de respuesta directa.

## Requisitos de hardware

- Pesos en bfloat16: aproximadamente 3,8 GB en disco (1.881.825.088 parametros x 2 bytes), mas el espacio del repositorio declarado de 3,8 GB.
- VRAM estimada para inferencia en bfloat16 o float16: del orden de 4 a 6 GB contando pesos y estados de activacion, a lo que hay que sumar la cache KV correspondiente a la longitud de secuencia utilizada. Esta cifra es una estimacion aritmetica a partir del numero de parametros publicado, no un dato medido por el autor.
- Entrenamiento documentado: 1x A100-SXM4-80GB, 42 minutos, pico de 28,0 GiB. El pico de 28,0 GiB incluye pesos, gradientes, estado del optimizador en fp32 y activaciones con micro-lote de 4.096 tokens.
- Cabe en GPU de consumo: si, con margen amplio en tarjetas de 8 GB o mas, como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 o RTX 4090. Tambien deberia caber en GPUs de 6 GB si se reduce la longitud de secuencia.
- GPU profesionales: A100, H100, L40S, A10G y similares son sobredimensionadas para inferencia, aunque utiles para entrenamiento o servicio de alto throughput.
- Opciones de despliegue: al publicarse solo pesos safetensors, la via directa es transformers. vLLM y TGI son compatibles con safetensors. Para llama.cpp u Ollama seria necesaria una conversion propia a GGUF, ya que no se publican cuantizaciones.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | `call_f1` | Sobre-llamada | Licencia | Disponibilidad |
|---|---:|---|---:|---:|---|---|
| OpenGrad-Qwen3.5-2B-M0-SFT-CanonicalV2-Final | 1,88 mil millones | 2.048 tokens de entrenamiento; contexto del base no disponible | 0,7470 | 0,1505 | other / composite-per-source | Pesos safetensors en HuggingFace |
| OpenGrad-Qwen3.5-2B-M0-SFT-CorpusV2 (ejecucion previa) | 1,88 mil millones | no disponible | 0,6278 | 0,0922 | no disponible en la informacion proporcionada | Publicado por el mismo autor |
| Qwen/Qwen3.5-2B (base sin ajustar, B0) | 1,88 mil millones | no disponible | 0,6264 | 0,6238 | segun el modelo base | Publico en HuggingFace |
| Otros modelos de tool calling de tamano comparable | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos en la informacion proporcionada para comparar con alternativas externas de la misma categoria (por ejemplo, modelos de 2 a 3 mil millones de parametros especializados en function calling). Las unicas comparaciones con cifras son las tres filas anteriores, todas del mismo proyecto.

## Limitaciones y advertencias

- El propio autor clasifica el modelo como artefacto de investigacion, no como modelo de produccion, y no recomienda desplegarlo sin una evaluacion especifica de la tarea.
- No esta sometido a ajuste de seguridad ni a alineamiento, por lo que no debe emplearse en uso autonomo de herramientas.
- El checkpoint publicado esta marcado como REJECT por la politica interna del repositorio: la puerta exige sobre-llamada inferior a 0,20 y una caida de recall no mayor de 0,10 frente a B0, dos condiciones incompatibles entre si dado que el recall de B0 (0,9735) es en si mismo consecuencia de sobre-llamar.
- No es estrictamente mejor que la ejecucion anterior: gana 0,119 de `call_f1` y 0,225 de recall, pero pierde 0,026 de precision, empeora la sobre-llamada en 0,058 y baja 0,080 en exactitud sobre peticiones no soportadas.
- La mejora no es atribuible a una sola fuente de datos, porque el corpus cambio en tres aspectos a la vez (nueva fuente xLAM/APIGen, correccion del validador de ToolACE y correccion de la materializacion de When2Call) y no se ejecuto la ablation necesaria.
- Riesgo de alucinacion: no se cuantifica en la informacion disponible. El corpus de entrenamiento contiene datos sinteticos e invocaciones de herramienta no verificadas, segun advierte el autor.
- Metricas ausentes: no se miden la exactitud de seleccion de herramienta, la validez de argumentos ni la validez de esquema. Su ausencia no equivale a un valor cero.
- La poblacion de evaluacion no incluye ejemplos de respuesta directa, por lo que el comportamiento de no llamar cuando deberia responderse directamente queda sin probar.
- Los resultados publicados provienen de una particion interna preregistrada de 1.277 ejemplos, no de un benchmark externo intacto. La poblacion de evaluacion mas amplia ya habia influido en trabajo previo del proyecto.
- Cobertura linguistica: no disponible. No se documentan los idiomas soportados ni la calidad por idioma.
- Licencia: `composite-per-source`. Es una licencia compuesta por fuente que hereda las condiciones de los conjuntos de datos de tool calling utilizados. Debe revisarse la model card del corpus y la licencia de cada fuente antes de cualquier uso comercial; la informacion proporcionada no detalla los terminos concretos.
- Contexto reducido: la ventana de entrenamiento fue de 2.048 tokens, muy por debajo de lo habitual en modelos actuales para agentes con historiales largos. No se indica la longitud de contexto nativa del modelo base.
- Los checkpoints 1800 y 2400 deben tratarse como empatados, no ordenados: su diferencia en puntuacion balanceada es de 0,0013, dentro de la tolerancia preregistrada de 0,01.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/arrochi112/OpenGrad-Qwen3.5-2B-M0-SFT-CanonicalV2-Final
- Dataset del corpus: https://huggingface.co/datasets/arrochi112/OpenGrad-ToolPolicy-Canonical-v2
- Informe de resultados y graficas (findings.html): https://huggingface.co/arrochi112/OpenGrad-Qwen3.5-2B-M0-SFT-CanonicalV2-Final/blob/main/findings.html
- Repositorio del proyecto OpenGrad: https://github.com/arjhinety/OpenGrad
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Ejecucion previa citada (OpenGrad-Qwen3.5-2B-M0-SFT-CorpusV2): referencia textual, sin URL proporcionada en la informacion disponible
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces obtenidos correspondian a organizaciones no relacionadas con el proyecto y se han descartado.
