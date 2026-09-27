# anespo28/openjev-fincalc-4b

## Resumen

openjev-fincalc-4b es un cross-encoder de inferencia de lenguaje natural (NLI) de 4.539.273.216 parametros (unos 4,54 mil millones), ajustado por Tony Esposito (usuario anespo28) sobre el modelo base AlexWortega/openjev, a su vez un cross-encoder NLI derivado de Qwen3.5-4B. Su tarea es determinar si una afirmacion financiera derivada (un LTV, un DSCR, un interest cover, un ratio de apalancamiento, un margen, un ratio de capital, la deuda neta o el resultado de un covenant) se sigue realmente de la evidencia aportada, devolviendo una de tres etiquetas: entailment, contradiction o neutral.

El problema que resuelve es concreto y esta documentado en su model card: en arquitecturas de tipo LLM-as-a-judge en cascada, el modelo base openjev resolvia bien las busquedas directas pero fallaba con seguridad en las cifras derivadas, etiquetando como neutral casi cualquier afirmacion que requiriese aritmetica. Sobre el conjunto sintetico FinCalc-NLI, el modelo base obtenia un 31,1% de acierto global y solo un 4,8% en cifras derivadas correctas; tras el ajuste con LoRA, el modelo alcanza un 94,2% global y un 85,4% en esa categoria.

Su relevancia practica es que permite usar un modelo de 4B como primera etapa barata de una cascada de verificacion en banca, reservando la escalada a un modelo mayor solo para los casos dudosos. Como contrapartida, todo el conjunto de entrenamiento es sintetico, el modelo solo trabaja en ingles y cubre un conjunto fijo de diez metricas; la propia model card advierte de que no debe ser el unico control sobre cifras que alimenten una decision de credito.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder transformer para NLI basado en Qwen3.5-4B, con cabeza de clasificacion de secuencias de 3 clases |
| Parametros totales | 4.539.273.216 (~4,54 B) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible. Pesos publicados en bfloat16 (safetensors); no se publican versiones GGUF ni cuantizaciones precalculadas |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors; se incluye ademas el adaptador LoRA en el subdirectorio lora/ |
| Tarea (pipeline) | text-classification |
| Modelo base | AlexWortega/openjev (Qwen3.5-4B NLI cross-encoder) |
| Dataset de ajuste | anespo28/fincalc-nli (mas rejuego de SNLI/MNLI/ANLI) |
| Tamano del repositorio | 9,4 GB |
| Fecha de publicacion | 27 de septiembre de 2026 |

El orden de las etiquetas en la salida del modelo es [contradiction, entailment, neutral], tal y como aparece en el ejemplo de uso de la model card.

## Arquitectura y entrenamiento

Se trata de un cross-encoder: la premisa (evidencia) y la hipotesis (afirmacion) se concatenan en una unica secuencia que pasa por el backbone del transformer, y una cabeza de clasificacion de secuencias produce tres logits, uno por etiqueta NLI (contradiction, entailment, neutral). A diferencia de un bi-encoder, no genera embeddings comparables de forma independiente, sino una puntuacion conjunta por par premisa-hipotesis. El backbone procede del modelo base AlexWortega/openjev, que la model card describe como un cross-encoder NLI Qwen3.5-4B bajo licencia MIT.

El ajuste se realizo con LoRA de rango 32 sobre todas las capas lineales del backbone de texto y sobre la cabeza de puntuacion, con 30.000 ejemplos de FinCalc y 10.000 de rejuego (SNLI/MNLI/ANLI), una sola epoca, y posterior fusion de los pesos. El entrenamiento completo llevo aproximadamente 40 minutos en una unica A100 mediante Hugging Face Jobs. El dataset FinCalc-NLI se genera por codigo (script gen_fincalc.py) y las etiquetas se calculan programaticamente, nunca se anotan a mano: cada premisa se presenta en cuatro formatos (prosa, vinetas, tabla y clave/valor) con empresas distractoras, cifras del ano anterior y lineas de politica, y cada hipotesis es una cifra derivada, un resultado de covenant o una busqueda directa. El split de test usa pools disjuntos de empresas, localidades y plantillas, e incluye una formula (NPL coverage) que no aparece en entrenamiento.

## Capacidades

- Clasificacion NLI de tres clases (entailment, contradiction, neutral) sobre pares premisa-hipotesis.
- Verificacion aritmetica de metricas financieras derivadas: LTV, DSCR, interest cover, leverage, margin, capital ratio, deuda neta y tests de covenant.
- Deteccion de tipos concretos de error: desliz aritmetico, ratio invertido, uso de cifras de otra entidad, error de unidad (x10, x1000), test de covenant invertido y cifra mal citada.
- Distincion entre contradiccion y neutralidad: devuelve neutral cuando falta un dato de entrada o el sujeto no aparece en la evidencia.
- Tolerancia al redondeo de la propia afirmacion: la etiqueta entailment se asigna si la cifra es correcta dentro del redondeo declarado en la hipotesis.
- Lectura de evidencia en cuatro formatos distintos: prosa, lista de vinetas, tabla y pares clave/valor.
- No es un modelo generativo: no produce texto, solo puntuaciones de clasificacion.
- No soporta tool calling ni function calling.
- No esta disenado como agente ni para razonamiento multi-paso autonomo; su papel es el de verificador puntual dentro de una cascada.
- No tiene capacidades multilingues: solo ingles.
- No dispone de modo de razonamiento explicito (thinking mode), vision ni audio.

## Casos de uso

- Primera etapa de una cascada LLM-as-a-judge en banca: el modelo evalua de forma barata si las cifras derivadas de una respuesta se sostienen sobre la evidencia recuperada, y solo los pares con veredicto incierto se escalan a un modelo mayor, reduciendo coste por consulta.
- Verificacion de covenants en extraccion de contratos de credito: dada la clausula y los datos financieros extraidos, el modelo comprueba si el test de covenant pasa o se incumple, con un 100% de acierto en esta categoria dentro del conjunto de test sintetico.
- Control de calidad de informes financieros generados por un LLM: antes de publicar un resumen con ratios calculados, un paso de validacion con este modelo marca las afirmaciones que no se siguen de la evidencia aportada.
- Deteccion de errores de unidad en tablas extraidas de PDF: el modelo identifica desviaciones de x10 o x1000 (11,5% de acierto del base frente a 96,7% del ajustado), un fallo frecuente en pipelines de extraccion documental.
- Filtrado previo en sistemas RAG financieros: se usa como comprobador de fidelidad entre el contexto recuperado y la respuesta candidata, descartando afirmaciones que contradicen la evidencia.
- Auditoria y gobierno de modelos (model risk): permite etiquetar de forma automatizada pares evidencia-afirmacion en conjuntos de evaluacion internos y construir metricas de fidelidad aritmetica por metrica.
- Deteccion de atribucion incorrecta a otra entidad: en documentos multiempresa, el modelo distingue si las cifras citadas pertenecen realmente al sujeto de la afirmacion o a una sociedad distinta.
- Generacion de datos de entrenamiento derivados: los scripts incluidos (gen_fincalc.py y train.py) permiten regenerar FinCalc-NLI y ajustar otros verificadores con el mismo esquema de etiquetado programatico.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre los mismos conjuntos de test de 2.000 elementos, antes y despues del ajuste (el split de FinCalc usa nombres y plantillas no vistos):

| Evaluacion | openjev (base) | openjev-fincalc-4b |
|---|---|---|
| FinCalc-NLI (global) | 31,1% | 94,2% |
| Cifra derivada correcta (entailment) | 4,8% | 85,4% |
| Desliz aritmetico | 0,3% | 95,5% |
| Ratio invertido | 2,3% | 94,2% |
| Cifras de otra entidad | 0,0% | 96,4% |
| Error de unidad (x10, x1000) | 11,5% | 96,7% |
| Covenant pass/breach | 0-73% | 100% |
| NPL coverage (formula no vista en entrenamiento) | 20,1% | 70,8% |
| MNLI matched (NLI general) | 90,4% | 89,6% |
| ANLI r3 | 41,8% | 53,5% |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, y por tratarse de un modelo de clasificacion NLI no serian directamente aplicables. La model card indica ademas que la mejora en ANLI r3 es en distribucion, porque ese conjunto formo parte del rejuego de entrenamiento, por lo que no debe interpretarse como una mejora de razonamiento general. Las metricas de tres operandos (por ejemplo, net leverage) son mas debiles, en torno al 73%.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16 o float16: alrededor de 9,1 GB solo para los pesos (4.539.273.216 parametros x 2 bytes), mas el coste de activaciones del cross-encoder; en la practica conviene reservar del orden de 10-12 GB con lotes pequenos y secuencias cortas.
- Cuantizacion manual a 8 bits: aproximadamente 4,6 GB de pesos. A 4 bits: aproximadamente 2,3 GB. Son estimaciones, ya que no hay cuantizaciones publicadas en el repositorio.
- GPU recomendadas: A100 o H100 para servicio con alto volumen (el ajuste se hizo en una A100 en unos 40 minutos), L40S para despliegue en centro de datos.
- Compatibilidad con GPU de consumo: si, cabe en tarjetas de 16 GB o mas. Una RTX 4090 (24 GB) o una RTX 4080 (16 GB) ejecutan el modelo en bfloat16 con margen; en tarjetas de 8-12 GB seria necesario cuantizar.
- Opciones de despliegue: transformers es la unica ruta documentada en la model card (AutoModelForSequenceClassification + AutoTokenizer). Al ser un modelo de clasificacion de secuencias, tambien puede servirse con motores que soportan cross-encoders y tareas de clasificacion, como TGI, text-embeddings-inference o vLLM en modo clasificacion, aunque la model card no incluye configuracion ni garantias para ellos.
- Latencia y throughput: no disponibles. Como cross-encoder, cada par premisa-hipotesis requiere una pasada completa por el modelo, por lo que el throughput depende linealmente del numero de pares a evaluar y no puede reutilizar embeddings de premisas repetidas como haria un bi-encoder.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | FinCalc-NLI (global) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| anespo28/openjev-fincalc-4b | 4,54 B | No disponible | 94,2% | MIT | Hugging Face |
| AlexWortega/openjev (base) | Del orden de 4 B (Qwen3.5-4B) | No disponible | 31,1% | MIT | Hugging Face |
| Cross-encoders NLI genericos (familia DeBERTa-v3, BART-MNLI y similares) | No disponible | No disponible | No disponible | Variable | Hugging Face |

No hay resultados comparables publicados en la informacion disponible para otros cross-encoders NLI de proposito general. La diferencia relevante no es el tamano sino el ajuste: los cross-encoders NLI genericos estan entrenados sobre MNLI, SNLI y ANLI, tareas de inferencia textual donde la aritmetica no aparece, y por tanto no cubren la verificacion de cifras derivadas que si aborda este modelo. Frente a su propio modelo base, la mejora es de 63,1 puntos porcentuales en el conjunto global y de 80,6 puntos en cifras derivadas correctas, a costa de una perdida de 0,8 puntos en MNLI matched.

## Limitaciones y advertencias

- Datos exclusivamente sinteticos: empresas, bancos, inmuebles y cifras estan inventados. Los resultados miden la habilidad objetivo, no el rendimiento sobre expedientes de credito reales. La model card pide validar con datos propios antes de cualquier uso en produccion o en riesgo de modelo.
- Un solo idioma (ingles) y un conjunto fijo de diez metricas. Los documentos de credito reales son mas heterogeneos.
- Transferencia parcial a formulas no vistas: un 70,8% en NPL coverage, una formula que nunca aparece en entrenamiento.
- Rendimiento mas debil en metricas de tres operandos, como el apalancamiento neto, en torno al 73%.
- La mejora en ANLI r3 es en distribucion (ese conjunto estaba en el rejuego de entrenamiento), no una mejora de razonamiento general.
- Uso previsto restringido: debe emplearse como primera etapa barata de una cascada de verificacion que escale los veredictos dudosos a un modelo mayor, nunca como unico control sobre cifras que alimenten una decision de credito.
- Riesgo de falso entailment o de etiquetar como neutral un calculo erroneo cuando la evidencia esta incompleta; conviene calibrar umbrales sobre datos propios.
- Sin validacion externa: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia independiente de su comportamiento.
- Licencia MIT: permite uso comercial y modificacion, con obligacion de conservar el aviso de copyright. La model card advierte ademas de que el proyecto es personal y no esta afiliado a ningun empleador ni cliente.
- Es un modelo de clasificacion: no genera texto ni justifica sus veredictos, solo devuelve probabilidades por etiqueta.
- El orden de las etiquetas es [contradiction, entailment, neutral]; invertirlo en produccion altera por completo la interpretacion de las salidas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/anespo28/openjev-fincalc-4b
- Modelo base: https://huggingface.co/AlexWortega/openjev
- Dataset FinCalc-NLI: https://huggingface.co/datasets/anespo28/fincalc-nli
- Scripts incluidos en el repositorio: gen_fincalc.py (generacion del dataset) y train.py (evaluacion del base, ajuste LoRA, fusion, evaluacion y publicacion via Hugging Face Jobs)
- No se han encontrado papers, blogs ni demos adicionales en la informacion disponible.
