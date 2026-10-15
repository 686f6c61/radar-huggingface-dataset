# Scicom-intl/SOTA-MOS

## Resumen

SOTA-MOS es un modelo de prediccion automatica de calidad de voz: estima la puntuacion MOS (mean opinion score, escala 1-5) que un oyente asignaria a una muestra de voz sintetica en una prueba de escucha que mezcla frecuencias de muestreo. Lo desarrolla Scicom-intl (Scicom (MSC) Berhad) y esta disenado especificamente para la Track 3 del AudioMOS Challenge 2025, cuya particularidad es evaluar audio generado a 16, 24 y 48 kHz dentro del mismo test, algo que los predictores de MOS convencionales no manejan bien.

El modelo se distribuye como un ensemble de 3 modelos por 5 folds (segun la propia model card) y se sirve mediante un script de prediccion y un servidor FastAPI con batching dinamico. Segun los datos publicados por el autor, supera a todos los sistemas de la Track 3 en 7 de las 8 metricas oficiales, incluido el ganador HighRateMOS, con una MSE a nivel de utterance de 0,208 frente a 0,303 del ganador publicado.

Su relevancia practica es la de un evaluador automatico listo para produccion: se ofrece como sustituto directo (drop-in) del servidor de faster-UTMOSv2, con las mismas rutas y claves de respuesta, y con datos de throughput medidos (hasta 63,3 req/s y RTF de 238x a concurrencia 64 sobre una GPU). La licencia es MIT, lo que facilita su integracion comercial. La informacion publica no detalla la arquitectura interna, el numero de parametros ni los datos de entrenamiento mas alla de lo indicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no se especifica en la informacion proporcionada) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no aplica: modelo de puntuacion de audio, evalua el clip completo |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (la distribucion se hace con archivos bajo `model/*` y un `model/system.json`) |
| Tarea | prediccion de MOS (1-5) para voz sintetica en test de frecuencia de muestreo mixta |
| Frecuencias de muestreo admitidas | 16 kHz, 24 kHz y 48 kHz; otras se remuestrean a la mas cercana |
| Entrada | uno o varios audios (CLI) o un archivo de audio por peticion HTTP |
| Salida | escalar MOS en la escala del test de escucha de frecuencias mixtas; el servidor devuelve ademas `reps`, `gpu_ms`, `total_ms`, `batch_size`, `input_sampling_rate`, `sampling_rate` y `duration_s` |
| Determinismo | deterministico, sin dominio de datos (`?reps=` y `?dataset=` se aceptan por compatibilidad) |
| Tamano del repositorio | 2,5 GB |
| Autor | Scicom-intl (Scicom (MSC) BHD) |
| Fecha de creacion en HuggingFace | 2026-09-28 |
| Ultima actualizacion en HuggingFace | 2026-10-14 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La informacion publica no describe la arquitectura interna del modelo (si es un transformer sobre representaciones auto-supervisadas de voz, un modelo convolucional o un hibrido). Lo que si se detalla es la organizacion del sistema: SOTA-MOS puntua con un ensemble de 3 modelos por 5 folds, y en el servidor cada clip se evalua con la combinacion completa de los 15 predictores, frente al enfoque de faster-UTMOSv2, que puntua un unico fold sobre un recorte de 3 segundos. SOTA-MOS puntua el clip entero, y el batching del servidor se construye agrupando por duracion del clip.

El entrenamiento se apoya en los datos de la Track 3 del AudioMOS Challenge 2025 (400 clips de evaluacion, 20 condiciones, 1.506 segundos de audio en el conjunto de evaluacion). El autor declara explicitamente que las etiquetas de evaluacion no se usaron ni para construir ni para seleccionar el modelo: los miembros del ensemble se eligieron mediante seleccion voraz hacia delante (greedy forward selection) sobre predicciones out-of-fold del conjunto de desarrollo, con una regla fijada antes de puntuar cualquier sistema sobre el conjunto de evaluacion, que se puntuo una sola vez. Tambien se publica una variante entrenada solo con las etiquetas de entrenamiento, con peores resultados, lo que sugiere que parte de la ganancia proviene de datos o tecnicas adicionales no detalladas en la model card. No hay informacion sobre el numero de tokens o horas de audio de entrenamiento, la composicion del dataset ni si se aplicaron etapas de RLHF o DPO (conceptos que, por otra parte, no aplican de forma directa a un regresor de calidad).

## Capacidades

- Prediccion de MOS en escala 1-5 sobre voz sintetica, en el rango realista de calidad de los sistemas TTS actuales.
- Puntuacion a 16, 24 y 48 kHz sin reentrenamiento especifico por tasa: las tasas distintas se remuestrean a la mas cercana (8 y 11,025 kHz a 16 kHz; 22,05, 28 y 32 kHz a 24 kHz; 44,1, 88,2 y 96 kHz a 48 kHz).
- Conserva el orden relativo de las 20 condiciones del conjunto de evaluacion a traves de las frecuencias de muestreo; los ejemplos publicados muestran que puntua por debajo una misma frase a 16 kHz (3,7021) que a 24 kHz (3,9625) o 48 kHz (3,8229), en linea con lo que hicieron los oyentes.
- Sensibilidad a artefactos de vocoders clasicos: una copia de la misma frase vocodificada con WORLD a 48 kHz obtiene 2,3365 frente a 3,8229 de la version natural a 48 kHz.
- Puntuacion de clip completo (no de un recorte fijo de 3 segundos).
- Inferencia determinista: la misma entrada produce la misma salida, lo que la hace apta para comparaciones reproducibles entre sistemas.
- Servicio HTTP con batching dinamico por longitud de clip y compatibilidad de API con faster-UTMOSv2: mismas rutas, mismo campo `file`, mismos parametros `?reps=` y `?dataset=`, mismas claves y tipos en la respuesta y mismos codigos de estado, mas tres claves adicionales (`input_sampling_rate`, `sampling_rate`, `duration_s`).
- Verificacion de compatibilidad incluida en el repositorio: `serving/check_api_compat.py` levanta ambos servidores y comprueba `POST /predict` (con y sin `reps`/`dataset`), `reps` invalido (422), archivo ausente (422), bytes que no son audio (500), `/health`, `/stats`, `/warmup` y `/`.
- No es un modelo generativo: no genera texto, no razona, no ejecuta codigo, no soporta tool calling, ni agentes, ni capacidades multilingues de texto.

## Casos de uso

- Control de calidad de pipelines TTS en produccion: cada lote de audio sintetico generado por el sistema de sintesis se puntua automaticamente y el MOS se registra como metrica de release; el modelo esta pensado para puntuar clips completos, no recortes, lo que evita perder artefactos que aparecen fuera de los primeros segundos.
- Comparacion de vocoders y checkpoints durante el desarrollo: dadas dos versiones de un mismo sistema, se comparan sus MOS medios sobre el mismo conjunto de frases. Los ejemplos de la model card muestran exactamente ese uso al separar voz natural (3,82 a 48 kHz) de la misma voz vocodificada con WORLD (2,34).
- Validacion de conversiones de frecuencia de muestreo: para decidir si merece la pena servir audio a 24 kHz en lugar de 16 kHz, el modelo da una estimacion directa del impacto perceptual (en el ejemplo publicado, 3,9625 frente a 3,7021).
- Filtrado y curacion de corpus de audio sintetico: antes de usar voz generada para aumentar un dataset de ASR o TTS, se puntua cada clip y se descartan los que caen por debajo de un umbral acordado, con un coste computacional bajo (a concurrencia 64, RTF de 238x).
- Monitorizacion continua en produccion con la metrica como SLO: el servidor expone `/stats` y devuelve `gpu_ms` y `total_ms`, lo que permite instrumentar paneles de latencia y calidad y detectar derivas del modelo de voz desplegado.
- Sustitucion sin cambios de codigo de un servidor faster-UTMOSv2 existente: al mantener rutas, campos y codigos de estado, se puede conmutar el backend y comparar puntuaciones en paralelo antes de cambiar definitivamente.
- Regresion testing en CI de sistemas de voz: con inferencia determinista, un test que fije la salida esperada para un conjunto reducido de clips detecta cambios de comportamiento tras refactorizaciones o actualizaciones de dependencias.
- Evaluacion rapida en investigacion de sintesis: cuando no hay presupuesto para pruebas con oyentes, el modelo permite preseleccionar sistemas o condiciones (por ejemplo, filtrar las 20 condiciones de un test) antes de una escucha humana completa.

## Benchmarks y rendimiento

Datos publicados en la model card. Conjunto de evaluacion: 400 clips, 20 condiciones, etiquetas nunca usadas para construir ni seleccionar el modelo.

| Sistema | utt MSE | utt LCC | utt SRCC | utt KTAU | sys MSE | sys LCC | sys SRCC | sys KTAU |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| SOTA-MOS (este modelo) | 0,208 | 0,888 | 0,803 | 0,623 | 0,101 | 0,989 | 0,968 | 0,884 |
| SOTA-MOS, solo etiquetas de entrenamiento | 0,252 | 0,846 | 0,718 | 0,534 | 0,114 | 0,970 | 0,910 | 0,779 |
| HighRateMOS (T17, ganador del reto, paper) | 0,303 | 0,847 | 0,742 | 0,556 | 0,116 | 0,982 | 0,955 | 0,842 |
| HighRateMOS, replicacion del autor (3 semillas) | 0,264 | 0,838 | 0,686 | 0,492 | 0,130 | 0,960 | 0,959 | 0,842 |
| faster-UTMOSv2, sin ajuste | 0,328 | 0,785 | 0,753 | 0,576 | 0,153 | 0,952 | 0,893 | 0,758 |
| Mejor sistema publicado de la Track 3, por metrica | 0,238 | 0,847 | 0,742 | 0,589 | 0,056 | 0,982 | 0,955 | 0,842 |

Ejemplo de puntuaciones sobre la misma frase natural a distintas tasas y sobre una copia vocodificada con WORLD a 48 kHz:

| Archivo | Frecuencia de entrada | MOS predicho |
|---|---:|---:|
| clip_16k.wav | 16.000 Hz | 3,7021 |
| clip_28k.wav | 24.000 Hz | 3,9625 |
| clip_44k.wav | 48.000 Hz | 3,7948 |
| clip_48k.wav | 48.000 Hz | 3,8229 |
| clip_48k_world.wav | 48.000 Hz | 2,3365 |

Rendimiento del servidor (una GPU, los 400 clips de evaluacion de la Track 3, 1.506 s de audio, mismo cliente para ambos servidores, ejecutados consecutivamente):

| Concurrencia | SOTA-MOS req/s | RTF | p50 | p95 | faster-UTMOSv2 req/s | RTF | p50 | p95 |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 9,7 | 37x | 101 ms | 126 ms | 8,9 | 33x | 109 ms | 128 ms |
| 4 | 30,1 | 113x | 128 ms | 155 ms | 29,4 | 111x | 124 ms | 168 ms |
| 8 | 38,9 | 147x | 205 ms | 299 ms | 33,2 | 125x | 142 ms | 1.400 ms |
| 16 | 44,9 | 169x | 339 ms | 469 ms | 27,1 | 102x | 316 ms | 1.696 ms |
| 32 | 54,1 | 204x | 596 ms | 657 ms | 53,7 | 202x | 546 ms | 1.235 ms |
| 64 | 63,3 | 238x | 866 ms | 1.663 ms | 63,6 | 240x | 949 ms | 1.375 ms |

El autor indica que las puntuaciones servidas coinciden con las offline con una diferencia media de 0,007 MOS y una correlacion de Pearson igual o superior a 0,9998 con lotes de tamano 1, 8 y 32.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia de cota superior, el repositorio completo (pesos de los 3 modelos por 5 folds mas recursos graficos) ocupa 2,5 GB.
- GPU: la model card indica ejecucion en CUDA (`scorer = SystemScorer("model/system.json", "cuda")`) y habla de "una GPU", pero no especifica modelo ni memoria. No hay lista de GPU recomendadas ni minimas publicada.
- Compatibilidad con GPU de consumo: no confirmada por el autor; sin datos de VRAM no puede afirmarse que quepa en una GPU de consumo concreta.
- Despliegue: script propio (`uv sync --extra serve`, `python -m sotamos.predict`) y servidor FastAPI con batching dinamico (`SYSTEM=../model/system.json MAX_BATCH=16 PP_WORKERS=16 bash run_serve.sh`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia: 141,17 ms de GPU y 161,6 ms totales para un clip de 5,599 s a 48 kHz con lote de tamano 1; p50 de 101 ms y p95 de 126 ms a concurrencia 1 sobre el conjunto completo de evaluacion.
- Throughput: de 9,7 req/s con concurrencia 1 a 63,3 req/s con concurrencia 64 (RTF de 37x a 238x). El autor senala que aguanta mejor la carga media que faster-UTMOSv2, cuyo p95 se degrada hasta 1.696 ms a concurrencia 16.

## Comparativa con modelos similares

| Modelo | Parametros | Frecuencias de muestreo | utt MSE | utt SRCC | sys MSE | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| SOTA-MOS | no disponible (ensemble 3 modelos x 5 folds) | 16 / 24 / 48 kHz | 0,208 | 0,803 | 0,101 | MIT | HuggingFace + GitHub |
| HighRateMOS (ganador Track 3) | no disponible | no disponible | 0,303 (paper) / 0,264 (replicacion) | 0,742 (paper) / 0,686 (replicacion) | 0,116 (paper) / 0,130 (replicacion) | no disponible | HuggingFace (Scicom-intl/HighRateMOS-VoiceMOS2025) |
| faster-UTMOSv2 | no disponible | no disponible; puntua un fold sobre un recorte de 3 s | 0,328 | 0,753 | 0,153 | no disponible | repositorio propio con servidor de referencia |
| Mejor sistema publicado de la Track 3, por metrica | no disponible | no disponible | 0,238 | 0,742 | 0,056 | no disponible | publicado en la competicion |

SOTA-MOS es el unico de los cuatro con modelo y codigo publicados bajo licencia MIT en la informacion disponible, y el unico que declara explicitamente que no uso etiquetas de evaluacion en la seleccion del modelo. La unica metrica en la que no lidera es la MSE a nivel de sistema (0,101 frente a 0,056 del mejor resultado publicado por metrica). No se dispone de datos de parametros ni de contexto de los sistemas comparados, por lo que la comparacion de coste computacional no puede hacerse con la informacion proporcionada.

## Limitaciones y advertencias

- Dominio acotado: esta entrenado para voz sintetica en el marco del AudioMOS Challenge 2025 Track 3. No hay evidencia publicada de su comportamiento con voz real, musica, ruido de fondo o grabaciones telefonicas.
- Error residual apreciable: una MSE a nivel de utterance de 0,208 sobre una escala de 1 a 5 implica desviaciones medias en torno a 0,45 puntos, suficientes para que diferencias pequenas entre sistemas no sean concluyentes por si solas.
- Debilidad relativa en MSE a nivel de sistema: el mejor resultado publicado por metrica baja a 0,056, frente a los 0,101 de este modelo. Si la decision se toma agregando muchos clips de una misma condicion, la ventaja sobre otros sistemas es menor.
- Sin informacion sobre idiomas: la ficha de HuggingFace no declara idiomas soportados y la model card no detalla la composicion linguistica de los datos de entrenamiento. No puede asumirse que generalice igual de bien fuera del idioma o los acentos dominantes del conjunto de entrenamiento.
- Sin informacion sobre sesgos: no se publican analisis de sesgo por acento, genero, edad, idioma o tipo de voz. Un MOS bajo no debe interpretarse como juicio sobre la inteligibilidad real sin comprobacion adicional.
- Riesgo de mal uso como sustituto de pruebas con oyentes: es un estimador correlacionado con juicios humanos, no una medida absoluta; usarlo como criterio unico de aceptacion en produccion puede consolidar el sesgo del propio predictor.
- Comportamiento dependiente del diseno del test: la escala esta calibrada para un test que mezcla 16, 24 y 48 kHz. Puntuar audio con un unico rate fuera de ese contexto puede dar valores no comparables.
- Restricciones de licencia: el modelo se publica bajo MIT, lo que permite uso comercial, pero no se documentan las licencias de los datos de entrenamiento ni de los modelos base que pudieran haberse reutilizado, lo que exige una revision propia antes de un despliegue comercial.
- Fechas incoherentes en el repositorio: la ficha de HuggingFace indica creacion el 2026-09-28 y actualizacion el 2026-10-14. Conviene verificar estos metadatos antes de citarlos.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente de la comunidad mas alla de los numeros del autor.
- Model card incompleta: el texto recuperado termina de forma truncada en la seccion de benchmarks ("faster-UTMOSv2's own benchmark.py runs against ..."), por lo que parte de la informacion tecnica del autor no esta disponible en esta ficha.
- No apto para tareas generativas: no genera texto ni audio, no soporta tool calling, agentes ni razonamiento multi-paso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Scicom-intl/SOTA-MOS
- Repositorio de codigo, entrenamiento y experimentos: https://github.com/Scicom-AI-Enterprise-Organization/SOTA-MOS
- Releases del repositorio: https://github.com/Scicom-AI-Enterprise-Organization/SOTA-MOS/releases
- Organizacion en GitHub: https://github.com/Scicom-AI-Enterprise-Organization
- Colecciones de la organizacion en HuggingFace: https://huggingface.co/Scicom-intl/collections
- Modelo relacionado HighRateMOS (VoiceMOS 2025): https://huggingface.co/Scicom-intl/HighRateMOS-VoiceMOS2025
- AudioMOS Challenge 2025 (Track 3): https://sites.google.com/view/voicemos-challenge/past-challenges/audiomos-challenge-2025
- Servidor de referencia faster-UTMOSv2 (base de la API compatible): https://github.com/Scicom-AI-Enterprise-Organization/faster-UTMOSv2/tree/main/serving
- Script de verificacion de compatibilidad de API: https://github.com/Scicom-AI-Enterprise-Organization/SOTA-MOS/blob/main/serving/check_api_compat.py
- Publicacion arXiv referenciada en las etiquetas del modelo: https://arxiv.org/abs/2506.21951
- Publicacion arXiv referenciada en las etiquetas del modelo: https://arxiv.org/abs/2509.01336
- Publicacion arXiv referenciada en las etiquetas del modelo: https://arxiv.org/abs/2409.09305
