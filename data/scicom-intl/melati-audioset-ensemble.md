# Scicom-intl/Melati-AudioSet-Ensemble

## Resumen

Melati-AudioSet-Ensemble es un sistema de clasificación de audio (audio tagging) desarrollado por Scicom-intl dentro de su pipeline de datos de voz Melati. No se trata de un modelo único, sino de un ensemble de seis etiquetadores de AudioSet cuyas probabilidades se promedian sobre el mismo fragmento de audio. Los seis miembros son CED-base, EAT-large, SSLAM, BEATs y las versiones v3 y v4 de Melati-AudioSet-EAT-Large (este último, a su vez, un modelo destilado de 309M parámetros a partir de tres de los miembros). El conjunto suma 1,20B parámetros y produce una salida sobre las 527 clases de sonido de AudioSet.

El problema que resuelve es el etiquetado automático de sonidos en grabaciones de audio: dado un clip, indica qué sonidos de AudioSet están presentes. Su relevancia radica en que el ensemble alcanza un mAP de 0,5219 sobre el conjunto de evaluación de AudioSet, por encima de cada uno de sus miembros individuales y de los modelos publicados comparables en la misma evaluación (CED-base 0,4993; EAT-large 0,4947; SSLAM 0,4945; BEATs 0,4835). La mejora se obtiene sin entrenamiento adicional, solo promediando probabilidades, a costa de seis pasadas forward por clip.

El modelo se distribuye como un repositorio de 0,4 GB con código propio en PyTorch puro (`melati_ensemble.py`) que reconstruye cada miembro a partir de su `config.json` y `model.safetensors`, sin ejecutar código de los repositorios originales ni requerir transformers, timm o torchaudio. Incluye además un motor de inferencia (`melati_engine.py`) con servidor FastAPI y soporte multi-GPU.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Ensemble de seis clasificadores de audio (CED-base, EAT-large, SSLAM, BEATs, Melati-AudioSet-EAT-Large v3 y v4); cada miembro con su propio preprocesado |
| Parámetros totales | 1,20B en conjunto (seis miembros); Melati-AudioSet-EAT-Large: 309M |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; ventana de audio de 10 s a 16 kHz mono, con ventanas deslizantes de 5 s de salto para grabaciones más largas |
| Tipos de cuantización | fp32 (por defecto) y bf16 (`Ensemble(path, bf16=True)`) |
| Idiomas soportados | no disponible (clasificación de sonidos, no de habla; las etiquetas son las 527 clases de AudioSet) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors` por miembro, con revisiones fijadas) |

## Arquitectura y entrenamiento

El sistema es un ensemble de promedio de probabilidades: seis etiquetadores de AudioSet procesan el mismo clip y sus salidas se promedian para producir una distribución sobre las 527 clases. Los miembros son CED-base (Dinkel et al., ICASSP 2024), EAT-large (Chen et al., IJCAI 2024), SSLAM (Alex et al., ICLR 2025), BEATs (Chen et al., ICML 2023) y dos revisiones de Melati-AudioSet-EAT-Large (v3 y v4), el modelo propio de Scicom destilado de la media de tres de estos miembros. Cada miembro recibe su propio preprocesado, calculado para el lote completo en GPU, y sus pesos se cargan desde su repositorio en una revisión fijada.

No se detalla en la información disponible el volumen de datos de entrenamiento de cada miembro ni si hubo RLHF o DPO (no aplica a clasificación). La innovación técnica destacable es de ingeniería: los miembros se reconstruyen en PyTorch puro a partir de `config.json` y `model.safetensors`, sin ejecutar el código de los repositorios originales, lo que elimina la dependencia de transformers, timm y torchaudio. El suelo de decibelios de CED-base se fija bajo el valor más alto de cada clip, de modo que las etiquetas de un clip no dependen de los clips con los que se agrupa en el lote. En 512 clips de evaluación, las probabilidades de cada miembro coinciden con las del código de su propio repositorio dentro de 3e-05 en fp32.

## Capacidades

- Clasificación de audio multietiqueta sobre las 527 clases de sonido de AudioSet.
- Procesamiento de clips de 10 s a 16 kHz mono (cualquier frecuencia de muestreo o número de canales se convierte en la lectura).
- Segmentación de grabaciones largas en ventanas de 10 s con salto configurable (`model.windows(wav, hop_s=5.0)`), tomando la probabilidad máxima por ventana para etiquetar la grabación completa.
- Acceso a las probabilidades individuales de cada miembro (`model(clips, each=True)`) y ejecución de un subconjunto de miembros (`Ensemble(path, members=[...])`).
- Motor de inferencia con servidor FastAPI: `POST /tag` acepta un fichero de audio o JSON con PCM16 en base64, con parámetros `top_k`, `threshold`, `windows`, `members` y `probs`.
- Procesamiento por lotes de directorios completos a JSONL (`melati_engine.py tag clips/`).
- Soporte multi-GPU con cola compartida de ventanas entre peticiones concurrentes y CUDA graphs capturados por tamaño de lote.
- No soporta tool calling, agentes, visión, audio generativo ni razonamiento multi-paso; su única tarea es el etiquetado de sonidos.

## Casos de uso

- Etiquetado automático de corpus de audio: procesar grandes volúmenes de grabaciones con `melati_engine.py tag clips/ --out tags.jsonl` para generar metadatos de sonido presentes en cada archivo, útil en la construcción de datasets de audio.
- Moderación y análisis de contenido audiovisual: detectar sonidos concretos (voces, música, ruidos) en clips subidos a una plataforma antes de su publicación, usando `POST /tag` con `top_k` y `threshold` para filtrar por clase.
- Indexación y búsqueda de archivos de audio: generar etiquetas AudioSet por ventana de 10 s y almacenarlas para permitir búsquedas por tipo de sonido dentro de un archivo de audio largo.
- Monitorización de entornos: analizar grabaciones continuas con ventanas deslizantes de 5 s para identificar eventos sonoros (por ejemplo, alarmas o ruidos específicos) en un flujo de audio.
- Anotación asistida para investigación en audio: usar las probabilidades por miembro (`members=true`) para estudiar el acuerdo entre arquitecturas y priorizar clips para anotación humana.
- Evaluación comparativa de modelos de audio: ejecutar el ensemble y sus miembros individuales sobre el mismo conjunto de clips para obtener métricas mAP comparables bajo el mismo preprocesado y la misma evaluación.
- Despliegue en producción con requisitos estrictos de dependencias: al no necesitar transformers ni timm, integrar el etiquetado en un servicio Python ligero con solo torch, numpy, huggingface_hub, safetensors y soundfile.

## Benchmarks y rendimiento

Resultados de mAP sobre el conjunto de evaluación de AudioSet (17.141 clips, versión `agkphysics/AudioSet`, cada modelo en fp32 con su propio preprocesado; mAP como media sobre las 527 clases). Todas las cifras son del repositorio del ensemble.

| Modelo | mAP |
|---|---|
| **Melati-AudioSet-Ensemble (este)** | **0,5219** |
| Melati-AudioSet-EAT-Large v4 | 0,5124 |
| Melati-AudioSet-EAT-Large v3 | 0,5105 |
| CED-base | 0,4993 |
| EAT-large | 0,4947 |
| SSLAM | 0,4945 |
| BEATs | 0,4835 |

Nota del autor: YouTube elimina clips con el tiempo, por lo que la copia del conjunto de evaluación difiere entre publicaciones y las cifras publicadas en cada paper no son comparables entre sí; las de esta tabla se calcularon todas sobre la misma copia actual del conjunto. CED-base obtiene 0,4993 aquí frente a 0,4997 en la model card de Melati-AudioSet-EAT-Large, donde se le dieron 64 clips por lote; el resto de cifras de esa card difieren como máximo en 0,0001 (allí las probabilidades se almacenan en 16 bits).

Rendimiento de inferencia: en una GPU, con lotes de 16, etiqueta 18 clips de 10 s por segundo en fp32; con `bf16=True`, 65 clips por segundo manteniendo el mAP de 0,5219.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el conjunto de pesos ocupa 0,4 GB en el repositorio, por lo que en bf16 los seis miembros caben holgadamente en GPUs de consumo, aunque el consumo real depende del tamaño de lote y de las activaciones.
- GPU recomendadas: el motor de inferencia está probado para CUDA; el autor no especifica modelos concretos (A100, H100, RTX 4090, etc.).
- Cabe en GPU de consumo: sí, según el tamaño de los pesos (0,4 GB en el repo, seis miembros de 1,20B parámetros en total, pesos en bf16 en el motor); no se detalla el mínimo exacto de VRAM.
- Opciones de despliegue: `melati_ensemble.py` (PyTorch puro, sin transformers ni timm) y `melati_engine.py` con FastAPI/uvicorn y soporte multi-GPU (`--gpus 0,1`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 18 clips de 10 s por segundo en fp32 y 65 por segundo en bf16 en una GPU con lotes de 16; el motor usa CUDA graphs por tamaño de lote y una cola compartida de ventanas entre peticiones concurrentes.
- Dependencias: torch, numpy, huggingface_hub, safetensors y soundfile (solo para `read`); el motor añade fastapi y uvicorn. Probado con torch 2.8.0, numpy 1.26.4, huggingface_hub 0.36.2 y safetensors 0.8.0.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / ventana | mAP AudioSet | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Melati-AudioSet-Ensemble | 1,20B (seis miembros) | 10 s por ventana | 0,5219 | MIT | Hugging Face (Scicom-intl) |
| Melati-AudioSet-EAT-Large v4 | 309M | 10 s por ventana | 0,5124 | no disponible en la información | Hugging Face (Scicom-intl) |
| CED-base | no disponible | 10 s por ventana | 0,4993 | no disponible en la información | Hugging Face (mispeech/ced-base) |
| EAT-large | no disponible | 10 s por ventana | 0,4947 | no disponible en la información | Hugging Face (worstchan/EAT-large_epoch20_finetune_AS2M) |
| SSLAM | no disponible | 10 s por ventana | 0,4945 | no disponible en la información | Hugging Face (ta012/SSLAM_AS2M_Finetuned) |
| BEATs | no disponible | 10 s por ventana | 0,4835 | no disponible en la información | no disponible |

El ensemble supera a todos sus miembros individuales en mAP sobre la misma copia del conjunto de evaluación, a cambio de seis pasadas forward por clip (1,20B parámetros frente a los 309M de Melati-AudioSet-EAT-Large). No se dispone de datos de parámetros ni licencia de los miembros externos en la información proporcionada.

## Limitaciones y advertencias

- El ensemble requiere seis pasadas forward por clip, lo que multiplica el coste computacional frente a usar un solo miembro; el propio autor publica Melati-AudioSet-EAT-Large (309M) como alternativa destilada.
- Las cifras de mAP no son comparables con las publicadas en los papers originales, porque la copia del conjunto de evaluación de AudioSet cambia con el tiempo al eliminarse clips de YouTube; solo son comparables entre sí las de esta tabla.
- La clasificación se limita a las 527 clases de AudioSet; sonidos fuera de ese vocabulario no se detectan.
- La ventana de análisis es de 10 s (con salto de 5 s para grabaciones largas) y la etiqueta de una grabación completa se toma como el máximo por ventana, lo que puede perder eventos breves o mezclar sonidos de ventanas distintas.
- No se han documentado en la información disponible sesgos específicos del ensemble ni tasas de alucinación (en clasificación, falsos positivos por clase).
- El rendimiento en idiomas o dominios de audio distintos de los de AudioSet no está documentado.
- Licencia MIT para el ensemble; las licencias de los miembros externos (CED-base, EAT-large, SSLAM, BEATs) no se detallan en la información disponible y deben verificarse antes de un uso comercial.
- El motor de inferencia está diseñado para CUDA; no se documenta soporte de CPU para el servidor.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Scicom-intl/Melati-AudioSet-Ensemble
- Melati-AudioSet-EAT-Large (modelo destilado): https://huggingface.co/Scicom-intl/Melati-AudioSet-EAT-Large
- Repositorio Melati: https://github.com/Scicom-AI-Enterprise-Organization/Melati
- Conjunto de datos AudioSet usado en la evaluación: https://huggingface.co/datasets/agkphysics/AudioSet
- CED-base: https://huggingface.co/mispeech/ced-base
- EAT-large: https://huggingface.co/worstchan/EAT-large_epoch20_finetune_AS2M
- SSLAM: https://huggingface.co/ta012/SSLAM_AS2M_Finetuned
- Figura de mAP del repositorio: https://huggingface.co/Scicom-intl/Melati-AudioSet-Ensemble/resolve/main/figures/map.png
- Referencias de los miembros: CED (Dinkel et al., ICASSP 2024), EAT (Chen et al., IJCAI 2024), SSLAM (Alex et al., ICLR 2025), BEATs (Chen et al., ICML 2023); enlaces a papers no disponibles en la información proporcionada.
