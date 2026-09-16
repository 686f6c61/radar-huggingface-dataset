# palli23/wav2vec2-base-samromur2105-50h

## Resumen

wav2vec2-base-samromur2105-50h es un modelo de reconocimiento automatico del habla (ASR) publicado por el usuario palli23 en Hugging Face. Se trata de un ajuste fino de la arquitectura wav2vec2-base (94.403.241 parametros) sobre un subconjunto de 50 horas del corpus islandes Samromur, segun se deduce del propio nombre del repositorio y de la model card.

El modelo forma parte del conjunto de checkpoints de escalado "samromur-21.05", asociado al trabajo "Scaling Smaller ASR Models Against Multilingual ASR Giants" (ICASSP 2026). La propuesta del trabajo, segun la informacion disponible, es evaluar hasta que punto modelos pequenos entrenados en un solo idioma pueden competir con modelos multilingues de gran tamano en tareas de transcripcion.

Es relevante para equipos que trabajan con islandes (codigo ISO `is`) y que necesitan una solucion ASR ligera, ejecutable en hardware modesto, o un punto de partida para ajustes finos posteriores. No se han publicado resultados de benchmarks, demos ni documentacion adicional en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2-base (encoder convolucional + transformer, decodificacion CTC) |
| Parametros totales | 94.403.241 (dato real del repositorio, safetensors) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible (al ser ASR, la restriccion practica es la duracion del audio, no especificada) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos safetensors; no se listan versiones cuantizadas) |
| Idiomas soportados | islandes (`is`) |
| Licencia | cc-by-sa-4.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,4 GB |
| Pipeline declarado | no disponible |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-15 |
| Ultima actualizacion | 2026-09-15 |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura wav2vec2-base, que combina un extractor de caracteristicas convolucional que opera directamente sobre la forma de onda de audio y un codificador transformer. En la variante base, ese codificador consta de 12 capas con 768 dimensiones ocultas, lo que da lugar a los aproximadamente 94 millones de parametros que confirma el recuento real de safetensors (94.403.241). La cabeza de salida es una capa lineal CTC sobre el vocabulario de caracteres, el esquema habitual en los ajustes finos de wav2vec 2.0 para ASR.

Respecto al entrenamiento, la model card solo indica que el checkpoint pertenece al conjunto de escalado samromur-21.05 y que se apoya en el corpus Samromur; el sufijo "50h" del identificador sugiere un subconjunto de 50 horas, aunque no se detalla la composicion exacta del dataset, el numero de tokens ni las condiciones de preentrenamiento. No hay informacion sobre tecnicas de RLHF o DPO, algo esperable puesto que se trata de un modelo discriminativo de transcripcion y no de un modelo generativo de texto. Tampoco se documentan innovaciones tecnicas concretas (decodificacion especulativa, atencion lineal u otras).

## Capacidades

- Transcripcion de voz a texto en islandes, con salida a nivel de caracteres decodificada mediante CTC.
- Funcionamiento como modelo acustico base para integrarse en pipelines de ASR con decodificacion greedy o con decodificador externo de lenguaje.
- Alineacion temporal a nivel de fotograma, lo que permite obtener marcas de tiempo por token o por palabra utilizando herramientas estandar de la familia wav2vec2 (por ejemplo, `torchaudio` o los pipelines de alineacion de Transformers).
- Punto de partida para ajuste fino adicional en dominios especificos del islandes con pocas horas de audio etiquetado.
- No dispone de soporte de tool calling ni de function calling.
- No dispone de capacidades de agente ni de razonamiento en multiples pasos.
- No dispone de vision, audio generativo, modo de pensamiento (thinking mode) ni salida de texto libre: su unica salida es una transcripcion.
- Capacidad multilingue: no. Solo islandes segun la etiqueta de idioma del repositorio.

## Casos de uso

- Transcripcion por lotes de archivos de audio en islandes: el modelo puede procesar grabaciones de entrevistas, reuniones o notas de voz y devolver texto plano, con un coste de computo bajo al tener solo 94 millones de parametros.
- Subtitulado automatico de video en islandes: combinado con un generador de subtitulos, permite producir pistas de texto sincronizadas a partir de la banda sonora, usando las alineaciones temporales que ofrece la arquitectura wav2vec2.
- Investigacion linguistica y creacion de corpus orales: sirve para transcribir grabaciones de campo o archivos de patrimonio oral islandes y generar corpus anotados de forma semiautomatica, con revision humana posterior.
- Base para ajuste fino en dominios concretos: partiendo de este checkpoint, un equipo puede especializarlo en terminologia medica, juridica o administrativa islandesa con unas pocas decenas de horas de audio etiquetado, en lugar de entrenar desde cero.
- Accesibilidad: generacion de subtitulos en directo o en diferido para personas con discapacidad auditiva en contenidos en islandes, desplegando el modelo en una GPU de gama baja o incluso en CPU.
- Preprocesado para asistentes de voz y sistemas de dictado en islandes: la transcripcion alimenta despues un modulo de comprension o de recuperacion de informacion.
- Experimentacion academica en escalado de modelos ASR: el checkpoint forma parte de una serie disenada para comparar modelos pequenos monolingues frente a modelos multilingues grandes, por lo que es util como punto de referencia reproducible en este tipo de estudios.
- Indexacion y busqueda de archivos de audio: transcribir un archivo historico de audio permite despues indexarlo y buscar por palabras clave dentro de el.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de error de palabra (WER) ni de caracter (CER), y la busqueda web realizada no ha devuelto documentacion tecnica asociada al modelo (los resultados obtenidos corresponden a paginas de ayuda de YouTube y no guardan relacion con el modelo). No se deben asumir cifras de rendimiento.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,4 GB en FP32 (coherente con los 94,4 millones de parametros y el tamano del repositorio) y en torno a 0,2 GB en FP16. Son estimaciones derivadas del recuento de parametros, no datos publicados por el autor.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, GTX 1650 o incluso integradas con suficiente memoria compartida.
- Inferencia en CPU viable para uso por lotes o aplicaciones de baja concurrencia, dado el reducido numero de parametros.
- GPU recomendadas para produccion: T4, L4 o A10 para servicio con multiples peticiones concurrentes; A100 o H100 no aportan ventaja significativa por el tamano del modelo.
- Opciones de despliegue: pipelines de Hugging Face Transformers, `torchaudio` para carga de modelos wav2vec2, conversion a ONNX Runtime para inferencia optimizada, y servidores de inferencia tipo Triton para entornos de produccion. vLLM, llama.cpp, Ollama y TGI no son las herramientas habituales para este tipo de modelo acustico.
- Latencia y throughput: no disponibles. Dependeran de la duracion del audio, del hardware y del backend de decodificacion elegido.

## Comparativa con modelos similares

Los datos de los modelos alternativos proceden de conocimiento publico general y no han podido verificarse en la busqueda web realizada; los campos no confirmados se marcan como no disponibles.

| Modelo | Parametros | Idioma | Datos de entrenamiento | Licencia | Formato |
|---|---|---|---|---|---|
| palli23/wav2vec2-base-samromur2105-50h | 94,4 M | Islandes | Samromur (subconjunto de 50 h, segun el nombre) | cc-by-sa-4.0 | safetensors |
| facebook/wav2vec2-base-960h | 94,4 M | Ingles | LibriSpeech 960 h | Apache-2.0 | safetensors / PyTorch |
| jonatasgrosman/wav2vec2-large-xlsr-53-icelandic | 317 M (variante large) | Islandes | XLSR-53 + ajuste fino en islandes | Apache-2.0 | safetensors / PyTorch |
| Modelos ASR multilingues tipo Whisper | desde 39 M hasta 1.550 M segun variante | Multilingue (incluye islandes) | Datos web a gran escala | MIT / Apache-2.0 segun variante | safetensors / GGUF en conversiones de terceros |

La comparacion relevante es estructural: este modelo sigue la estirpe de 94 millones de parametros de wav2vec2-base, frente a alternativas multilingues mucho mayores. No hay datos de WER para este checkpoint, por lo que no es posible afirmar cual rinde mejor en islandes con la informacion disponible.

## Limitaciones y advertencias

- La model card es minima: no incluye metricas de evaluacion, composicion detallada del dataset, ni instrucciones de uso.
- Entrenado exclusivamente con datos en islandes. No se debe esperar un comportamiento correcto en otros idiomas.
- Sesgo de dominio probable: el corpus Samromur es de habla leida y recogida de forma colaborativa, por lo que el rendimiento puede degradarse con acentos regionales, habla espontanea, ruido de fondo o audio telefónico.
- Riesgo de errores de transcripcion: en modelos CTC son frecuentes las omisiones, repeticiones y sustituciones de caracteres. No es un modelo generativo, pero puede producir texto fluido y erroneo.
- Sin puntuacion ni mayusculas de serie: la salida CTC habitual es en minusculas y sin signos de puntuacion, salvo que se anada un posprocesado.
- Sin marcas de tiempo fiables sin un paso adicional de alineacion.
- La licencia cc-by-sa-4.0 permite el uso comercial, pero exige atribucion y compartir las obras derivadas bajo la misma licencia (ShareAlike), lo que puede condicionar el despliegue propietario de ajustes finos derivados.
- Repositorio sin descargas ni interacciones en el momento de la consulta: no existe validacion por parte de la comunidad.
- No se documentan limitaciones de duracion de audio; conviene trocear entradas largas y validar el comportamiento en cada caso.

## Enlaces

- Hugging Face: https://huggingface.co/palli23/wav2vec2-base-samromur2105-50h
- Paper de referencia: "Scaling Smaller ASR Models Against Multilingual ASR Giants" (ICASSP 2026). No se ha encontrado enlace en la informacion disponible.
- Corpus Samromur: no se ha encontrado enlace directo en la informacion disponible.
- Repositorios, demos o blogs adicionales: no disponible. La busqueda web realizada devolvio unicamente paginas de ayuda de YouTube, sin relacion con el modelo.
