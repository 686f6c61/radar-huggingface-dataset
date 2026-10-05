# sheenee261/pulmoeit-ktc2023

## Resumen

PulmoEIT sur le KTC2023 (v1.0.0) es un modelo de segmentación de imágenes basado en una arquitectura U-Net, publicado por el usuario sheenee261 y distribuido en formato ONNX. Su función es transformar la reconstrucción lineal oficial del Kuopio Tomography Challenge 2023 (KTC2023) en una segmentación de tres clases: agua, resistivo y conductor. El modelo resuelve un problema inverso de tomografía de impedancia eléctrica (EIT) sobre la rejilla de píxeles del reto y forma parte del proyecto PulmoEIT, cuyo código fuente está disponible en GitHub.

El modelo se entrenó con 15.000 depósitos simulados mediante el simulador oficial del reto y se evaluó sobre 21 depósitos reales, obteniendo una puntuación oficial de 14,93 sobre 21 frente a los 10,30 de la referencia de los organizadores, mejorando a esta última en los 21 depósitos. Es relevante como prototipo de investigación en reconstrucción EIT y segmentación en imagen médica, aunque el propio autor advierte de que un depósito de agua no es un tórax y de que no debe considerarse un dispositivo médico.

El modelo no es un modelo de lenguaje: no procesa texto ni dispone de ventana de contexto conversacional. Su entrada es una reconstrucción lineal normalizada de 128×128 píxeles más un nivel discreto de 1 a 7, y su salida son logits de segmentación de 3 clases a la misma resolución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net (red convolucional encoder-decoder con conexiones skip) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (modelo de vision/segmentacion; entrada fija de 128×128) |
| Tipos de cuantizacion | no disponible (pesos exportados a ONNX) |
| Idiomas soportados | no aplicable (modelo de imagen; no procesa texto) |
| Licencia | MIT |
| Formato de pesos | ONNX (fichero `ktc.onnx`) |

Datos adicionales de la especificacion:

| Parametro | Valor |
|---|---|
| Entradas | `image` (N, 128, 128); `niveau`/nivel (N,) entero de 1 a 7 |
| Salida | `logits` (N, 3, 128, 128) |
| Clases | 0 = agua, 1 = resistivo, 2 = conductor |
| Resolucion de evaluacion | reescalado a 256×256 para la puntuacion oficial |
| SHA-256 de `ktc.onnx` | `38f0515b407c1f8b12ecdc271e903c39f3c9f2ab6690342d3f03a5a58584a8c4` |
| Tamano del repositorio | 0.0 GB (segun HuggingFace) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es una U-Net, es decir, una red convolucional con estructura encoder-decoder y conexiones skip que permiten preservar informacion espacial de alta resolucion. El modelo opera sobre la reconstruccion lineal oficial del reto, calculada con el codigo oficial del desafio (`pulmoeit.ktc.lineaire.operateurs`), normalizada dividiendola por su desviacion tipica. A la entrada se anade el nivel del reto (entero de 1 a 7), de modo que un unico modelo cubre los siete niveles de dificultad.

El entrenamiento utilizo 15.000 depositos simulados con el simulador oficial (malla densa; reconstruccion sobre malla dispersa), con 1 a 4 objetos de formas variadas, usando cada deposito para los 7 niveles. Se realizo en una GPU T4 mediante Kaggle. El modelo se selecciono sobre los 4 depositos reales de entrenamiento (epoca 40) y los 21 depositos de evaluacion se reservaron exclusivamente para el test final. La model card no documenta el uso de RLHF, DPO ni tecnicas de alineacion, ni cuantizacion posterior; se trata de un unico entrenamiento.

## Capacidades

- Segmentacion de imagenes en tres clases (agua, resistivo, conductor) a partir de reconstrucciones lineales de EIT.
- Resolucion de un problema inverso de tomografia de impedancia electrica sobre la rejilla de píxeles del reto.
- Condicionamiento por nivel: la entrada `niveau` (1 a 7) permite adaptar la prediccion a distintos grados de dificultad con un unico modelo.
- Inferencia en formato ONNX, portable entre runtimes compatibles.
- No dispone de generacion de texto, razonamiento, codigo, matematicas ni vision general.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No tiene capacidades multilingues (no procesa lenguaje natural).
- No incorpora modo de pensamiento (thinking), audio ni otras modalidades.

## Casos de uso

- Investigacion en reconstruccion EIT: uso del modelo como referencia o linea base para comparar nuevos metodos de segmentacion sobre el conjunto KTC2023, dado que reproduce un resultado publicado y verificable.
- Post-procesado de reconstrucciones lineales: integracion del modelo ONNX despues de un pipeline de reconstruccion lineal para obtener una segmentacion de clases en lugar de una imagen continua.
- Desarrollo de sistemas de imagen medica experimental: prototipo para explorar la segmentacion de regiones conductivas y resistivas en senales de impedancia, siempre en fase de investigacion.
- Benchmarking de arquitecturas U-Net: uso del modelo como punto de comparacion en estudios sobre el impacto de la entrada condicionada por nivel en tareas de segmentacion.
- Despliegue en entornos con recursos limitados: al ser un modelo ONNX de una U-Net de 128×128, puede ejecutarse en CPU o en GPU de gama baja para experimentacion.
- Reproducibilidad academica: verificacion del SHA-256 del fichero ONNX y del entrenamiento sobre los 4 depositos reales, util para replicar resultados en publicaciones.
- Educacion y divulgacion: ejemplo practico de aplicacion de U-Net a un problema inverso de tomografia para cursos de aprendizaje profundo aplicado a imagen medica.

## Benchmarks y rendimiento

Puntuacion oficial sobre los 21 depositos reales de evaluacion (total sobre 21):

| Metodo | Total sobre 21 |
|---|---|
| Bremen, post-tratamiento (1.º) | 15,24 |
| Bremen, FC U-Net | 15,13 |
| Team ABC | 12,76 |
| Team DTU | 12,38 |
| PulmoEIT (este modelo) | 14,93 |
| Referencia de los organizadores | 10,30 |

Desglose por nivel (referencia de los organizadores frente a PulmoEIT):

| Nivel | Referencia de los organizadores | PulmoEIT |
|---|---|---|
| 1 | 2,55 | 2,74 |
| 2 | 2,15 | 2,64 |
| 3 | 1,55 | 2,04 |
| 4 | 1,41 | 1,94 |
| 5 | 1,13 | 2,07 |
| 6 | 0,58 | 1,71 |
| 7 | 0,93 | 1,78 |

No se han publicado en la informacion disponible otros resultados de benchmarks (MMLU, HumanEval, GSM8K y similares no aplican a este modelo, al no ser un modelo de lenguaje).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio ocupa 0,0 GB en HuggingFace y la entrada es de 128×128 píxeles, por lo que la huella de memoria es reducida.
- GPU recomendadas: el entrenamiento se realizo en una GPU T4 (Kaggle); para inferencia no se especifican modelos de GPU concretos.
- Compatibilidad con GPU de consumo: no se documenta de forma explicita, pero por el tamano de la U-Net y la resolucion de entrada (128×128) es previsible que quepa en GPU de consumo, aunque no hay datos confirmados en la informacion disponible.
- Opciones de despliegue: al estar en formato ONNX, puede ejecutarse con runtimes compatibles con ONNX (ONNX Runtime); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput estimados: no disponibles.
- Requisito adicional: para generar la entrada es necesario calcular la reconstruccion lineal oficial con `pulmoeit.ktc.lineaire.operateurs`.

## Comparativa con modelos similares

| Modelo | Tipo / enfoque | Puntuacion sobre 21 | Licencia / disponibilidad |
|---|---|---|---|
| PulmoEIT (este modelo) | U-Net, entrada condicionada por nivel | 14,93 | MIT, ONNX en HuggingFace |
| Bremen, post-tratamiento (1.º) | Post-tratamiento sobre reconstruccion | 15,24 | Publicado en Denker et al., 2024 |
| Bremen, FC U-Net | U-Net totalmente convolucional | 15,13 | Publicado en Denker et al., 2024 |
| Team ABC | Algoritmo publicado | 12,76 | Publicado en Denker et al., 2024 |
| Team DTU | Algoritmo publicado | 12,38 | Publicado en Denker et al., 2024 |
| Referencia de los organizadores | Metodo de referencia del reto | 10,30 | Codigo oficial del desafio |

No se dispone de datos de parametros ni de contexto para las alternativas, dado que son algoritmos publicados en el articulo de Denker et al. (2024) y no se documentan en la informacion proporcionada.

## Limitaciones y advertencias

- La comparacion con los equipos participantes se realizo despues del reto, no en condiciones ciegas.
- Las verdades terreno utilizadas corresponden a la version de abril de 2024 de los datos.
- Se realizo un unico entrenamiento; no hay validacion cruzada ni multiples semillas que permitan estimar la varianza.
- El propio autor advierte de que un deposito de agua no es un torax: el modelo es un prototipo de investigacion y no un dispositivo medico.
- No cuenta con validacion clinica ni marcado sanitario; su uso en contexto medico real no esta justificado.
- Reutilizacion de datos y codigo del reto bajo Rasanen et al., doi:10.5281/zenodo.8252370 (CC BY 4.0), con las condiciones de esa licencia.
- Sesgos conocidos: no documentados de forma explicita; los datos de entrenamiento son exclusivamente simulados, lo que puede producir una brecha de dominio respecto a depositos reales.
- Riesgo de error en la segmentacion (falsos positivos/negativos en las clases agua, resistivo y conductor): no se documentan tasas de error por clase.
- Limitacion de resolucion: la salida se genera a 128×128 y debe reescalarse a 256×256 para la puntuacion oficial, lo que puede introducir artefactos de interpolacion.
- No aplica la restriccion de licencia comercial: la licencia MIT permite uso comercial del modelo, pero no cubre los datos del reto, sujetos a CC BY 4.0.
- No hay informacion sobre limites de idioma ni de contexto porque el modelo no procesa texto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sheenee261/pulmoeit-ktc2023
- Repositorio de codigo: https://github.com/sheene123/pulmoeit (metodo y limites en `src/pulmoeit/ktc/` y `docs/ktc2023.md`)
- Demo (Space): https://huggingface.co/spaces/sheenee261/pulmoeit
- Kuopio Tomography Challenge 2023: https://fips.fi/data-challenges/kuopio-tomography-challenge-2023/
- Datos y codigo del reto (Rasanen et al.): doi:10.5281/zenodo.8252370 (CC BY 4.0)
- Referencia de algoritmos publicados: Denker et al., 2024 (mencionado en la model card; sin URL proporcionada)
- Nota sobre la busqueda web: los resultados de busqueda proporcionados no contienen informacion relevante sobre este modelo y no se han utilizado como fuente.
