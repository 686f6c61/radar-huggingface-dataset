# LBolitho/Mixophyes_fleayi_Perch_RF_V2

## Resumen

Mixophyes_fleayi_Perch_RF_V2 es un clasificador binario de audio bioacústico publicado en HuggingFace por el usuario LBolitho. Su función es detectar las vocalizaciones de la rana *Mixophyes fleayi* en grabaciones de campo. No es una red neuronal entrenada de extremo a extremo, sino un *pipeline* en dos etapas: cada fragmento de un segundo de audio se convierte en un *embedding* mediante Perch 2, el modelo de sonidos animales de Google DeepMind, y un bosque aleatorio de scikit-learn puntúa ese vector para decidir si contiene o no el canto objetivo.

El modelo se distribuye como un fichero `perch_rf.joblib` (bosque aleatorio de 500 árboles) más un JSON con los ajustes de uso. El umbral de decisión calibrado es 0,401: los fragmentos que lo superan se cuentan como detecciones. Está pensado para integrarse en flujos de monitorización acústica pasiva junto a un reconocedor basado en Whisper afinado para la misma especie, publicado por el mismo autor.

Su relevancia es práctica y de nicho: la monitorización de anfibios por audio es una técnica en expansión para ecología y evaluación de impacto ambiental, y este modelo ofrece una alternativa ligera y de bajo coste computacional frente a alternativas de *deep learning* pesado. El repositorio no tiene descargas ni *likes* registrados y la licencia no está declarada, por lo que su adopción en producción requiere verificación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Random forest de scikit-learn sobre embeddings de Perch 2 (Google DeepMind) |
| Parametros totales | 500 arboles de decision; numero de nodos no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; ventana de entrada de 5 s con un fragmento de 1 s centrado |
| Tipos de cuantizacion | no disponible (no aplica a un bosque aleatorio) |
| Idiomas soportados | no aplica (clasificacion de audio, no texto) |
| Licencia | no disponible |
| Formato de pesos | joblib (pickle de scikit-learn) + fichero JSON de configuracion |
| Tarea (pipeline) | audio-classification |
| Clases | 0 = Non_Target_sounds, 1 = Target_sounds |
| Umbral de deteccion | 0,401 |
| Frecuencia de muestreo requerida | 32 kHz, mono |
| Version de scikit-learn | 1.6.1 (fijada por el autor) |
| Tamano del repositorio | 0,0 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El sistema es un *pipeline* de dos etapas. La primera es Perch 2, cargado mediante `perch_hoplite.zoo.model_configs.load_model_by_name("perch_v2")`, que produce *embeddings* a nivel de fotograma para cada fragmento de audio; estos vectores se promedian sobre los fotogramas para obtener una representacion unica por fragmento de un segundo. La segunda etapa es un bosque aleatorio de 500 árboles entrenado con scikit-learn 1.6.1 que realiza clasificacion binaria sobre ese *embedding* y devuelve una probabilidad mediante `rf.predict_proba(embeddings)[:, 1]`.

El preprocesado es estricto: audio convertido a mono a 32 kHz, cortado en clips de 1000 ms y centrado cada clip en una ventana de 5 s rellenada con ceros. Cualquier desviacion de ese formato altera los *embeddings* y, por tanto, las puntuaciones. No se especifica en la informacion disponible el numero de clips de entrenamiento, la composicion del dataset, la procedencia geografica de las grabaciones ni si hubo tecnicas de aumentacion de datos. Tampoco se documenta ningun proceso de RLHF, DPO ni ajuste fino del *backbone*: Perch 2 se usa congelado como extractor de caracteristicas.

La validacion reportada incluye dos regimenes: fragmentos de un segundo reservados de las mismas grabaciones de entrenamiento, y validacion cruzada agrupada de 5 particiones con grabaciones completas dejadas fuera. En el segundo regimen el autor reporta F1 de 0,992 y *average precision* de 1,000.

## Capacidades

- Deteccion binaria de cantos de *Mixophyes fleayi* en grabaciones de campo, con salida de probabilidad por fragmento de un segundo.
- Clasificacion de audio no generativa: no produce texto, codigo ni ninguna otra modalidad.
- Procesamiento por trozos de 1 s, lo que permite analizar grabaciones de duracion arbitraria troceandolas previamente.
- Integracion en el cuaderno Multi-Species Call Recogniser citado por el autor, que puede ejecutar este modelo, el reconocedor basado en Whisper o ambos a la vez.
- Capacidad de umbralizacion configurable: el umbral recomendado es 0,401, aunque el usuario puede ajustarlo segun el equilibrio precision/recall que necesite.
- No soporta *tool calling*, *function calling*, razonamiento multi-paso, agentes, vision, audio generativo ni capacidades multilingues de texto.

## Casos de uso

- Monitorizacion acustica pasiva de anfibios: desplegar grabadoras autonomas en los habitats de la especie y procesar los audios con el modelo para obtener series temporales de detecciones. Es adecuado porque el coste de inferencia del bosque aleatorio es minimo y el cuello de botella queda en el calculo de *embeddings* de Perch 2.
- Estudios de presencia/ausencia en inventarios de biodiversidad: dado un conjunto de grabaciones de una zona, el modelo indica si la especie esta presente, reduciendo el tiempo de escucha manual. Encaja porque la validacion reportada con grabaciones completas dejadas fuera alcanza F1 de 0,992.
- Triaje previo a revision humana: usar el modelo como primer filtro sobre horas de audio y enviar solo los fragmentos por encima de 0,401 a un experto. El umbral alto (precision de 1,000 en validacion) lo hace util para no saturar a los revisores.
- Seguimiento a largo plazo de poblaciones: comparar tasas de deteccion entre temporadas o años para detectar declives. Requiere mantener fija la configuracion de muestreo (32 kHz, mono, clips de 1 s) para que las puntuaciones sean comparables.
- Evaluacion de impacto ambiental: registrar audio antes, durante y despues de una intervencion en el habitat y cuantificar cambios en la actividad vocal. Util porque el modelo puede ejecutarse en local sin depender de servicios en la nube.
- Validacion cruzada metodologica: ejecutar en paralelo este modelo y el reconocedor basado en Whisper del mismo autor sobre el mismo corpus y comparar coincidencias. Es un caso realista porque el cuaderno Multi-Species Call Recogniser admite ambos modelos.
- Docencia y divulgacion en bioacustica: emplear el modelo como ejemplo de *pipeline* clasico (extractor de caracteristicas + clasificador ligero) frente a alternativas de extremo a extremo, dado que es reproducible con scikit-learn.
- Analisis de correlacion con variables ambientales: cruzar detecciones por franja horaria o temperatura con datos meteorologicos para estudiar patrones de actividad vocal, siempre que las grabaciones se hayan capturado con el mismo protocolo.

## Benchmarks y rendimiento

Los unicos resultados disponibles son los de validacion publicados en la *model card*, sobre fragmentos de un segundo reservados de las grabaciones de entrenamiento:

| Umbral | Precision | Recall | F1 | NPV | ROC AUC | Average precision |
|---|---|---|---|---|---|---|
| 0,401 | 1,000 | 0,992 | 0,996 | 0,995 | 1,000 | 1,000 |
| 0,500 | 1,000 | 0,987 | 0,993 | 0,992 | 1,000 | 1,000 |

Con grabaciones completas dejadas fuera (validacion cruzada agrupada de 5 particiones): F1 de 0,992 y *average precision* de 1,000.

No se han publicado comparaciones con MMLU, HumanEval, GSM8K ni ningun otro benchmark de lengua o codigo, porque no son aplicables a un clasificador de audio. Tampoco hay resultados frente a otros modelos bioacusticos en la informacion disponible.

## Requisitos de hardware

- La inferencia del bosque aleatorio en si es muy ligera: 500 árboles sobre un vector de *embedding* por fragmento, ejecutable en CPU sin problema.
- El coste real de computo esta en Perch 2, que debe ejecutarse para extraer los *embeddings*. No se especifica en la informacion disponible la VRAM necesaria ni las GPU recomendadas para ese modelo.
- No cabe plantear el despliegue con vLLM, llama.cpp, Ollama o TGI: no son compatibles con un bosque aleatorio de scikit-learn ni con este *pipeline*.
- La via de despliegue documentada es cargar `perch_rf.joblib` con scikit-learn 1.6.1 y usar Perch 2 mediante `perch_hoplite`.
- El repositorio ocupa 0,0 GB, por lo que el almacenamiento no es un factor limitante; el espacio lo determina el modelo Perch 2.
- No se publican datos de latencia ni *throughput*. El rendimiento dependera del *hardware* empleado para Perch 2 y del rellenado de cada clip de 1 s hasta una ventana de 5 s.

## Comparativa con modelos similares

| Modelo | Enfoque | Entrada | Metricas reportadas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LBolitho/Mixophyes_fleayi_Perch_RF_V2 | Perch 2 congelado + random forest de 500 arboles | Clips de 1 s a 32 kHz, mono | F1 0,996 (umbral 0,401) en clips reservados; F1 0,992 con grabaciones dejadas fuera | no disponible | HuggingFace, 0 descargas |
| LBolitho/Mixophyes_fleayi_Call_Recogniser_V1 | Whisper afinado | no disponible | no disponible | no disponible | HuggingFace |
| Otros modelos bioacusticos comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion documentada por el autor es con su propio reconocedor basado en Whisper, del que no se detallan parametros, contexto ni metricas. No hay informacion suficiente para comparar con alternativas de terceros.

## Limitaciones y advertencias

- `perch_rf.joblib` es un fichero pickle: solo debe cargarse desde este repositorio. Cargar pickles de origen no confiable permite ejecucion arbitraria de codigo.
- El autor advierte de que el modelo se ha probado unicamente en los habitats donde se hicieron las grabaciones de entrenamiento. El rendimiento en otros entornos, con otras condiciones acusticas o con poblaciones distintas, no esta verificado.
- Los clips de validacion proceden de las mismas grabaciones que los de entrenamiento, por lo que las cifras de validacion por clip estan optimistamente sesgadas. El autor recomienda revision manual en campo.
- La licencia no esta declarada en la informacion disponible, lo que impide determinar si se permite el uso comercial. Conviene contactar con el autor antes de integrarlo en un producto.
- La version de scikit-learn esta fijada a 1.6.1; cargar el modelo con otras versiones puede provocar incompatibilidades o degradacion silenciosa de las predicciones.
- El preprocesado es estricto (mono, 32 kHz, clips de 1 s centrados en ventanas de 5 s). Desviarse de esta configuracion invalida las puntuaciones y el umbral de 0,401 deja de ser aplicable.
- No se documenta evaluacion frente a especies acusticamente similares ni tasas de falsos positivos en paisajes sonoros complejos.
- No hay informacion sobre sesgos de grabacion (tipo de microfono, distancia, hora del dia) ni sobre el desequilibrio de clases en los datos de entrenamiento.
- Al ser un clasificador binario, cualquier resultado debe interpretarse como probabilidad de canto objetivo en un fragmento, no como identificacion de especie a nivel de grabacion completa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LBolitho/Mixophyes_fleayi_Perch_RF_V2
- Reconocedor basado en Whisper del mismo autor: https://huggingface.co/LBolitho/Mixophyes_fleayi_Call_Recogniser_V1
- Cuaderno Multi-Species Call Recogniser: citado en la *model card* sin enlace directo disponible
- Perch 2 (Google DeepMind), accesible a traves del paquete `perch_hoplite`: sin enlace directo en la informacion proporcionada
- Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo (los resultados obtenidos corresponden a IMDb y no guardan relacion con el contenido).
