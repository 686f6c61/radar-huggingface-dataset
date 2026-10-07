# saatweek/wavlm-ravdess-emotion

## Resumen

saatweek/wavlm-ravdess-emotion es un clasificador de emociones en habla de ocho clases construido sobre el codificador congelado `microsoft/wavlm-base-plus` y un cabezal de clasificacion PyTorch entrenado especificamente para la tarea. Lo mantiene el usuario de Hugging Face saatweek y su proposito es servir como referencia reproducible para reconocimiento de emociones en audio (speech emotion recognition, SER) sobre el corpus RAVDESS.

La particularidad del modelo es que no se ha ajustado el codificador: WavLM Base+ permanece congelado y solo se entrena el cabezal, que opera sobre caracteristicas agregadas de 1.536 dimensiones (media y desviacion tipica poblacional sobre el eje temporal de los 768 canales del encoder). El resultado es un artefacto ligero, con un repositorio de 0,4 GB, que alcanza un 71,67% de precision y un macro F1 de 0,7038 en el conjunto de test de cuatro actores reservados.

Las etiquetas de salida son ocho: neutral, calm, happy, sad, angry, fearful, disgust y surprised. El modelo esta orientado a investigacion y experimentacion, y no constituye una exportacion estandar de `AutoModelForAudioClassification`, por lo que requiere el cargador propio del proyecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador WavLM congelado (modelo transformer para representaciones de habla) mas cabezal de clasificacion MLP |
| Parametros totales | no disponible (el cabezal entrena aproximadamente 0,4 M de parametros; el recuento del codificador base no se detalla en la informacion proporcionada) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica como contexto de texto; ventana efectiva de hasta 4 segundos de audio tras el recorte central, a 16 kHz |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (habla inglesa del corpus RAVDESS) |
| Licencia | no disponible |
| Formato de pesos | safetensors (codificador en `wavlm_encoder/`) y `best.pt` (checkpoint PyTorch del cabezal) |

## Arquitectura y entrenamiento

El sistema combina un extractor de caracteristicas congelado y un clasificador ligero. El audio se convierte a mono, se remuestrea a 16 kHz, se recorta por los bordes con un umbral relativo de 35 dB y se recorta de forma central hasta un maximo de cuatro segundos; los fragmentos cortos no se rellenan con ceros y se rechazan las muestras con menos de 400 valores tras el preprocesado. Las representaciones finales del codificador tienen 768 canales y, al concatenar la media y la desviacion tipica poblacional a lo largo del tiempo, producen 1.536 caracteristicas. La normalizacion por caracteristica se ajusta unicamente con los actores de entrenamiento y se guarda como buffers del cabezal. El cabezal consiste en una capa lineal 1.536 → 256, seguida de LayerNorm, ReLU, dropout de 0,35 y una proyeccion final a ocho logits, sobre los que se aplica softmax al informar las puntuaciones.

El entrenamiento utilizo 960 grabaciones (actores 01, 02, 03, 04, 05, 07, 08, 09, 10, 13, 15, 17, 20, 21, 22 y 23), 240 de validacion (actores 11, 12, 14 y 18) y 240 de test (actores 06, 16, 19 y 24), con semilla de reparto de actores 42 y semilla de pesos 42. El mejor checkpoint de validacion fue la epoca 4 y el entrenamiento se detuvo en la epoca 24 con paciencia 20. Los hiperparametros del cabezal fueron tamaño de lote 32, AdamW con tasa de aprendizaje inicial 0,001, weight decay 0,01, entropia cruzada ponderada, recorte de gradiente y reduccion de la tasa de aprendizaje guiada por validacion. La seleccion de checkpoint se baso en el macro F1 de validacion. La comparacion posterior incluyo WavLM junto a cuatro candidatos CNN/MFCC sobre manifiestos identicos, pero cambia a la vez la representacion y la arquitectura del cabezal, por lo que no aisla el efecto del preentrenamiento.

## Capacidades

- Clasificacion de emociones en habla en ocho categorias: neutral, calm, happy, sad, angry, fearful, disgust y surprised.
- Extraccion de representaciones de audio mediante un codificador WavLM congelado, con agregacion temporal de media y desviacion tipica en 1.536 dimensiones.
- Inferencia en CPU y GPU a partir de ficheros de audio de hasta cuatro segundos tras el preprocesado.
- Generacion de puntuaciones softmax por clase (no calibradas) utiles para analisis comparativo dentro del corpus de referencia.
- Uso como base de transferencia: al mantener el codificador intacto, el cabezal puede reentrenarse sobre otros corpus sin tocar los pesos de WavLM.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, tool calling, soporte de agentes ni capacidades multilingues distintas del ingles.
- Integracion con una aplicacion Gradio incluida en el repositorio de GitHub del proyecto.

## Casos de uso

- Linea base de investigacion en SER: sirve como referencia congelada y reproducible para comparar arquitecturas de reconocimiento de emociones en el corpus RAVDESS, dado que publica precision y macro F1 por actor de test.
- Prototipado de interfaces afectivas: en demos de interaccion humano-maquina se puede emplear el modelo para etiquetar el tono emocional de fragmentos de audio de hasta cuatro segundos y modular la respuesta del sistema.
- Etiquetado de contenido audiovisual: con la aplicacion Gradio del repositorio se pueden procesar clips cortos y obtener una distribucion de probabilidad sobre las ocho emociones para catalogar material educativo o de archivo.
- Transferencia a nuevos dominios: partiendo del codificador congelado y reentrenando solo el cabezal, un equipo puede adaptar el modelo a otros corpus etiquetados con emociones reduciendo el coste computacional frente a un fine-tuning completo.
- Analisis de llamadas o centros de contacto (con reservas): es posible obtener una señal agregada de emocion por tramos, pero debe tenerse en cuenta que el modelo se entreno con habla actuada y el dominio natural difiere del corpus de origen.
- Docencia y demostraciones de speech emotion recognition: el proyecto incluye script de descarga con verificacion de hashes, flujo de prediccion por linea de comandos y app de Gradio, lo que facilita su uso en practicas y talleres.
- Investigacion en representaciones congeladas: permite estudiar cuanto rendimiento se obtiene reutilizando WavLM sin ajuste frente a alternativas CNN/MFCC del mismo proyecto, bajo un manifiesto identico.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index y en la model card (no verificados de forma independiente):

| Modelo | Macro F1 validacion | Precision test | Macro F1 test |
|---|---:|---:|---:|
| CNN original seleccionada | 0,4834 | 55,42% | 0,5324 |
| Frozen WavLM + cabezal entrenado | 0,7042 | 71,67% (172/240) | 0,7038 |

Precision en test por actor reservado: actor 06 = 70%, actor 16 = 71,67%, actor 19 = 80%, actor 24 = 65%. La matriz de confusion y el informe por clase completos estan en `evaluation.json` y en el documento de resultados del repositorio. No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio ocupa 0,4 GB e incluye el codificador congelado y el checkpoint del cabezal.
- El cabezal es muy pequeno (aproximadamente 0,4 M de parametros); la carga principal corresponde al codificador WavLM Base+.
- Inferencia viable en CPU para audio de hasta cuatro segundos, sin necesidad de GPU.
- En GPU, la huella de memoria es reducida; cabe en cualquier GPU consumer con CUDA (por ejemplo, GTX 1650, RTX 2060, RTX 3060, RTX 4090) e incluso en GPUs de gama baja.
- No se proporcionan cifras de latencia ni de throughput en la informacion disponible.
- Despliegue mediante el cargador del proyecto: `download_model.py` para descarga con verificacion de hashes y `ravdess.py predict` para inferencia; el script expone el dispositivo con `--device auto`.
- Al no ser un export estandar de `AutoModelForAudioClassification`, no es directamente compatible con vLLM, TGI, llama.cpp u Ollama. Requiere usar el flujo PyTorch del proyecto o exportar manualmente a TorchScript/ONNX si se desea otro entorno.
- La aplicacion Gradio del repositorio admite apuntar `MODEL_PATHS` al checkpoint descargado.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| saatweek/wavlm-ravdess-emotion | Codificador congelado + cabezal entrenado, 8 clases | no disponible (cabezal ~0,4 M) | Audio de hasta 4 s, 16 kHz | 71,67% de precision y 0,7038 de macro F1 en test RAVDESS (segun el autor) | no disponible | Hugging Face y GitHub del proyecto |
| microsoft/wavlm-base-plus | Codificador de representaciones de habla | no disponible en la informacion proporcionada | Audio a 16 kHz | no disponible (no es un clasificador de emociones por si mismo) | no disponible en la informacion proporcionada | Hugging Face |
| Modelos de SER ajustados sobre Wav2Vec2/WavLM (por ejemplo, variantes tipo SUPERB ER) | Codificador ajustado extremo a extremo, tipicamente 4 clases | no disponible | Audio a 16 kHz | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Hugging Face |

La comparacion directa con alternativas de la misma categoria no puede hacerse con numeros porque la informacion proporcionada solo incluye los resultados del propio modelo. Cualquier comparacion de rendimiento frente a otros clasificadores de emociones deberia realizarse bajo el mismo corpus y el mismo protocolo de particion por actores.

## Limitaciones y advertencias

- Las puntuaciones softmax no son confianza calibrada ni una medida del estado emocional interno de una persona; deben interpretarse solo como salidas comparativas del clasificador.
- El modelo se entreno sobre RAVDESS, un corpus de habla actuada en ingles; el rendimiento puede degradarse de forma notable en habla espontanea o en otros idiomas.
- La precision varia por actor (del 65% al 80% en los cuatro actores de test), lo que indica sensibilidad a caracteristicas del hablante.
- Existe riesgo de clasificacion erronea en audio fuera de dominio; no es un sistema fiable para decisiones sensibles sin supervision humana.
- La comparacion del autor con la CNN original cambia simultaneamente representacion y arquitectura, por lo que no aisla el efecto del preentrenamiento de WavLM.
- El resultado del CNN original ya se habia inspeccionado antes del experimento con WavLM, segun reconoce el autor; cualquier ajuste futuro requiere un protocolo de evaluacion nuevo.
- La licencia no esta disponible en la informacion proporcionada; antes de un uso comercial debe consultarse `NOTICE.md` y confirmarse los terminos del codificador base y del corpus RAVDESS.
- No es un export estandar de `AutoModelForAudioClassification` y no ejecuta codigo descargado mediante `trust_remote_code`; para usarlo hay que adoptar el cargador del proyecto.
- El repositorio no incluye grabaciones, manifiestos de particion locales, caches de entrenamiento ni credenciales, por lo que no es posible reconstruir exactamente los splits a partir de los ficheros publicados.
- El corpus de entrenamiento es pequeno (960 grabaciones de entrenamiento), lo que limita la generalizacion.
- El modelo solo maneja ingles; no hay soporte multilingue declarado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/saatweek/wavlm-ravdess-emotion
- Codificador base: https://huggingface.co/microsoft/wavlm-base-plus
- Repositorio del proyecto en GitHub: https://github.com/saatweek/RAVDESS_Emotional_Audio
- Resultados de WavLM del proyecto: https://github.com/saatweek/RAVDESS_Emotional_Audio/blob/main/WAVLM_RESULTS.md
- Paper de WavLM (referencia arXiv:2110.13900): https://arxiv.org/abs/2110.13900
- Perfil del autor en Hugging Face: https://huggingface.co/saatweek
