# Sadanie/pellav2-audio-deepfake-detector

## Resumen

Pellav2 es un detector de audio deepfake y sistema anti-spoofing desarrollado por Sadanie (Pella Research) y publicado en Hugging Face. Su funcion es clasificar clips de audio como genuinos o sinteticos, abordando el problema creciente de la suplantacion de voz mediante TTS y clonacion de voz neuronales. El modelo se distribuye con pesos en formato PyTorch (`.pt`), un script de inferencia autocontenido y un `config.json`, lo que facilita su despliegue sin necesidad de reconstruir la clase del modelo.

El repositorio ocupa 4,6 GB y acumula mas de 7000 descargas, lo que indica una adopcion moderada dentro del nicho de deteccion de deepfakes de audio. Esta etiquetado unicamente para ingles (`en`) y se publica bajo licencia MIT, lo que permite uso comercial sin restricciones adicionales. La model card indica que ha sido sustituido por Pellav3 (noviembre de 2026), por lo que Pellav2 debe considerarse una version heredada.

La informacion publica es escasa: no se detalla la arquitectura interna, el numero de parametros, la longitud de contexto ni los datos de entrenamiento. Esta ficha recoge exclusivamente lo disponible en la model card y los metadatos del repositorio, marcando como "no disponible" todo aquello que el autor no ha hecho publico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (detector de audio; pesos en PyTorch) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos nativos en `.pt`) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pt`); script de inferencia `.py` y `config.json` |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna del modelo (tipo de red, capas, mecanismo de atencion o extractor de caracteristicas acusticas). El repositorio incluye un unico fichero de pesos, `pellav2_detector.pt`, junto con `pellav2_infer.py`, que contiene la definicion de la clase del modelo y la logica de inferencia, y un `config.json` con el identificador del modelo. El tamano del repositorio (4,6 GB) sugiere un modelo de dimension considerable para una tarea de clasificacion binaria de audio, aunque se desconoce el desglose entre pesos y otros artefactos.

Tampoco se detallan los datos de entrenamiento: no se especifica el numero de horas de audio, la composicion del dataset (voces reales frente a sinteticas, algoritmos TTS empleados para generar los negativos), ni si se aplicaron tecnicas de aumento de datos o ajuste fino con RLHF/DPO (poco habituales en tareas de clasificacion). El script de inferencia depende de `torch`, `torchaudio`, `transformers`, `soundfile`, `numpy`, `scipy` y `pyloudnorm`, lo que apunta a un preprocesado con normalizacion de sonoridad (pyloudnorm) y extraccion de caracteristicas mediante torchaudio/transformers.

## Capacidades

- Deteccion binaria de audio deepfake: clasifica un clip como genuino o sintetico.
- Anti-spoofing: orientado a detectar ataques de suplantacion de voz (TTS, clonacion de voz).
- Procesamiento de ficheros WAV mediante script de linea de comandos.
- Normalizacion de sonoridad integrada en el pipeline de inferencia (pyloudnorm).
- Descarga automatica de pesos desde el Hub en el primer uso.
- No se documentan capacidades de transcripcion, diarizacion, identificacion de hablante ni generacion de audio.
- No se documenta soporte de tool calling, agentes ni razonamiento multi-paso (no aplica a esta categoria de modelo).

## Casos de uso

- Moderacion de contenido en plataformas de audio: integrado como filtro previo a la publicacion de clips, el detector puede marcar voces sinteticas generadas con TTS o clonacion, reduciendo la difusion de suplantaciones.
- Verificacion en atencion al cliente telefonica: en sistemas de autenticacion por voz, el modelo actua como capa anti-spoofing que comprueba si la voz entrante es real antes de conceder acceso.
- Analisis forense de grabaciones: peritos y equipos de seguridad pueden pasar grabaciones sospechosas por el script de inferencia para obtener una senal adicional de manipulacion.
- Proteccion de medios y periodismo: redacciones pueden verificar entrevistas o notas de voz recibidas antes de publicarlas, usando el detector como primer triaje.
- Investigacion en seguridad de voz: sirve como baseline para evaluar la robustez de nuevos generadores TTS frente a sistemas anti-spoofing.
- Filtrado en pipelines de datos: al construir corpus de voz para entrenamiento, el detector permite descartar muestras sinteticas y mantener la calidad del dataset.
- Integracion via API: el autor ofrece acceso mediante API por correo (info@pellaresearch.com), util para servicios que no quieran alojar los 4,6 GB de pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precision; el repositorio ocupa 4,6 GB, por lo que se recomienda al menos 8 GB de VRAM para cargar los pesos en FP32 y algo menos si se convierte a FP16.
- GPU recomendadas: no especificadas por el autor; por tamano de repositorio, una RTX 3090/4090 (24 GB) o una A100/H100 ofrecen margen holgado.
- GPU de consumo: probablemente cabe en tarjetas con 8-12 GB de VRAM, aunque no esta confirmado.
- Opciones de despliegue: el autor proporciona un script Python con PyTorch; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Pellav2 (Sadanie) | Detector de audio deepfake | en | MIT | Hugging Face, 4,6 GB | Version heredada; sustituida por Pellav3 |
| Pellav3 (Sadanie) | Detector de audio deepfake | no disponible | no disponible | Hugging Face | Version actual segun el autor (noviembre 2026) |
| Alternativas de la categoria | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- Informacion tecnica muy limitada: no se publican arquitectura, parametros, datos de entrenamiento ni metricas, lo que dificulta evaluar su fiabilidad antes de desplegarlo.
- Solo declarado para ingles; el rendimiento en otros idiomas o acentos no esta documentado y podria degradarse.
- Riesgo de falsos positivos y falsos negativos: al no haber benchmarks publicados, no se puede estimar su tasa de error en produccion.
- Posible degradacion frente a generadores TTS mas recientes que los usados en su entrenamiento (dataset desconocido).
- Modelo sustituido por Pellav3; el autor recomienda la version nueva, por lo que Pellav2 podria no recibir mantenimiento.
- Sesgos desconocidos: no se documenta la diversidad del dataset de entrenamiento (genero, edad, acento, calidad de grabacion), lo que puede introducir sesgos sistematicos.
- Licencia MIT: permite uso comercial y modificacion sin restricciones adicionales, pero no incluye garantias.
- Dependencias especificas (`pyloudnorm`, `torchaudio`, `transformers`) que deben versionarse cuidadosamente en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sadanie/pellav2-audio-deepfake-detector
- Version actual (Pellav3): https://huggingface.co/Sadanie/pellav3-audio-deepfake-detector
- Contacto del autor: info@pellaresearch.com
