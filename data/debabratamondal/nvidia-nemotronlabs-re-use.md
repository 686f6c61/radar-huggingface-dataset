# DebabrataMondal/NVIDIA-NemotronLabs-RE-USE

## Resumen

NVIDIA NemotronLabs RE-USE es un modelo de mejora universal del habla (universal speech enhancement, USE) desarrollado por NVIDIA, publicado bajo la organizacion nvidia en Hugging Face y replicado en el repositorio DebabrataMondal/NVIDIA-NemotronLabs-RE-USE. Con solo 9,6 millones de parametros, su objetivo es restaurar la calidad de grabaciones de voz degradadas por ruido aditivo, reverberacion, clipping, limitacion de ancho de banda, artefactos de codec, perdida de paquetes y microfonos de baja calidad, preservando la fidelidad de la voz original.

El modelo destaca por su caracter multilingue y agnostico al idioma, y por aceptar multiples frecuencias de muestreo de entrada (8, 16, 22,05, 24, 32, 44,1 y 48 kHz). Frente a alternativas mucho mayores como Sidon (250M) o UniPASE (500M), consigue resultados competitivos o superiores en metricas de calidad percibida y de inteligibilidad, lo que lo convierte en una opcion especialmente atractiva para despliegues con recursos limitados.

La relevancia actual del modelo radica en su eficiencia: un tamano dos ordenes de magnitud inferior al de sus competidores, con soporte comercial explicito y una licencia permisiva (OpenMDW-1.1), lo que facilita su integracion en pipelines de produccion de audio y video. La arquitectura se basa en mamba-ssm (modelos de espacio de estados), una alternativa a los transformers clasicos que ofrece coste computacional lineal con la longitud de secuencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mamba (SSM), libreria mamba-ssm |
| Parametros totales | 9.607.747 (9,6M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenado con clips < 10 s; inferencia por chunks para audio largo) |
| Tipos de cuantizacion | no disponible (pesos en safetensors) |
| Idiomas soportados | agnostico al idioma (multilingue, sin lista explicita) |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | safetensors |
| Frecuencias de muestreo de entrada | 8, 16, 22,05, 24, 32, 44,1 y 48 kHz |
| Tarea (pipeline) | audio-to-audio (speech enhancement) |
| Tamano del repo | 0,0 GB (pesos ligeros) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura basada en modelos de espacio de estados (SSM) del tipo Mamba, segun indica la libreria declarada (mamba-ssm). Esta eleccion permite un coste de computo lineal respecto a la longitud de la secuencia, lo que resulta adecuado para senales de audio de alta frecuencia de muestreo y ventanas relativamente largas. El modelo opera como un sistema audio-to-audio: recibe audio degradado y genera audio mejorado, con soporte para extension de ancho de banda (BWE) configurable en el script de inferencia.

El entrenamiento se realizo sobre clips de audio de menos de 10 segundos, segun la propia model card. No se especifican en la informacion disponible el numero total de tokens o horas de audio, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF o DPO (poco habituales en tareas de mejora de senal). El modelo esta disenado para preservar al hablante principal en casos de habla solapada, suprimiendo a los demas interlocutores. Existe una variante especifica, NVIDIA-NemotronLabs-RE-USE-laughter, orientada a preservar mejor la risa.

## Capacidades

- Mejora universal del habla: eliminacion de ruido aditivo, reduccion de reverberacion, correccion de clipping y de limitacion de ancho de banda.
- Reparacion de artefactos de codec y de perdida de paquetes en transmisiones de voz.
- Soporte de multiples frecuencias de muestreo de entrada: 8, 16, 22,05, 24, 32, 44,1 y 48 kHz.
- Extension de ancho de banda (BWE) opcional mediante argumento en el script de inferencia.
- Capacidad agnostica al idioma: funciona sobre habla en distintas lenguas sin reentrenamiento especifico.
- Preservacion de la identidad del hablante (alta similitud de hablante en las metricas reportadas).
- Supresion de hablantes secundarios en escenarios de habla solapada, conservando al hablante principal.
- Procesamiento por chunks para audios largos (superiores a 30 s) con parametros configurables de tamano de chunk y solapamiento.
- No dispone de tool calling, function calling, razonamiento multi-paso ni generacion de texto: es un modelo puramente de audio.

## Casos de uso

- Limpieza de grabaciones de podcast y video: el modelo restaura voz grabada con microfonos de baja calidad o en entornos reverberantes, manteniendo la naturalidad y la identidad del locutor, gracias a su alta similitud de hablante (Spk 0,86 en el conjunto completo).
- Preprocesado para pipelines de ASR: al mejorar la inteligibilidad (CAcc 89,17 en el conjunto completo frente a 81,29 del audio ruidoso), se reduce la tasa de error de reconocimiento automatico del habla en produccion.
- Call centers y atencion al cliente: mejora de grabaciones telefonicas de 8 kHz con extension de ancho de banda opcional, lo que permite recuperar frecuencias altas perdidas y mejorar la calidad percibida para analisis posteriores.
- Restauracion de archivos historicos o de baja calidad: reparacion de audio con clipping, artefactos de codec o perdida de paquetes en digitalizaciones antiguas o transmisiones VoIP.
- Videoconferencia y telefonia en tiempo real (procesamiento por chunks): el modelo admite inferencia fragmentada con chunk_size_in_seconds y hop_length_portion configurables, adecuada para flujos continuos.
- Produccion audiovisual y doblaje: mejora de tomas de campo antes de la mezcla final, con soporte de 44,1 y 48 kHz nativo, frecuencias habituales en video profesional.
- Investigacion en mejora de voz: modelo de referencia ligero (9,6M) para comparar tecnicas SSM frente a arquitecturas transformer o GAN en tareas USE.

## Benchmarks y rendimiento

Resultados reportados en la model card sobre subconjuntos del conjunto de test no ciego de URGENT 2025, referenciados contra habla limpia anecoica original.

| Conjunto completo | Parametros | DNSMOS | NISQA | UTMOS | PESQ | STOI | SBERT | LPS | Spk | CAcc |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Noisy | - | 1,84 | 1,69 | 1,56 | 1,34 | 0,50 | 0,74 | 0,61 | 0,73 | 81,29 |
| Sidon | 250M | 3,34 | 3,87 | 3,21 | 1,73 | 0,62 | 0,85 | 0,80 | 0,74 | 84,68 |
| UniPASE | 500M | 3,21 | 4,03 | 2,96 | 2,17 | 0,76 | 0,89 | 0,85 | 0,81 | 87,28 |
| NemotronLabs RE-USE | 9,6M | 3,29 | 4,33 | 2,94 | 2,57 | 0,78 | 0,88 | 0,85 | 0,86 | 89,17 |

| Subconjunto 16 kHz | DNSMOS | NISQA | UTMOS | PESQ | STOI | SBERT | LPS | Spk | CAcc |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Noisy | 1,84 | 1,59 | 1,41 | 1,29 | 0,53 | 0,70 | 0,58 | 0,63 | 76,54 |
| UniSE | 3,23 | 3,71 | 2,77 | 1,46 | 0,62 | 0,77 | 0,60 | 0,57 | 54,82 |
| NemotronLabs RE-USE | 3,19 | 4,20 | 2,64 | 2,47 | 0,82 | 0,87 | 0,84 | 0,82 | 87,09 |

| Subconjunto 44,1 kHz | DNSMOS | NISQA | UTMOS | PESQ | STOI | SBERT | LPS | Spk | CAcc |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Noisy | 1,91 | 1,79 | 1,52 | 1,30 | 0,52 | 0,76 | 0,61 | 0,80 | 83,65 |
| Resemble Enhance | 3,13 | 3,68 | 2,11 | 1,33 | 0,41 | 0,69 | 0,46 | 0,57 | 47,22 |
| NemotronLabs RE-USE | 3,36 | 4,44 | 2,80 | 2,47 | 0,80 | 0,89 | 0,86 | 0,90 | 91,54 |

| Subconjunto 48 kHz | DNSMOS | NISQA | UTMOS | PESQ | STOI | SBERT | LPS | Spk | CAcc |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Noisy | 2,04 | 1,83 | 1,99 | 1,28 | 0,55 | 0,77 | 0,77 | 0,78 | 90,64 |
| ClearVoice | 2,97 | 3,38 | 3,01 | 2,09 | 0,70 | 0,84 | 0,87 | 0,77 | 89,92 |
| NemotronLabs RE-USE | 3,33 | 4,49 | 3,63 | 2,59 | 0,77 | 0,89 | 0,91 | 0,86 | 91,05 |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB con los pesos en precision nativa (9,6M de parametros); el consumo real dependera del tamano de chunk y de la frecuencia de muestreo.
- GPU recomendadas: cualquier GPU NVIDIA con al menos 2-4 GB de VRAM es suficiente; A100, H100, L4 o RTX 4090 sobredimensionadas para este modelo.
- Cabe holgadamente en GPUs de consumo: GTX 1650, RTX 3050, RTX 4060 y superiores.
- Opciones de despliegue: scripts de inferencia oficiales (inference.sh e inference_chunk.sh) sobre el entorno mamba-ssm; existe entorno Docker preconstruido para simplificar la instalacion de Mamba (referenciado desde SEMamba). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que es un modelo de audio, no de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Frecuencias soportadas | PESQ (full) | CAcc (full) | Licencia | Disponibilidad |
|---|---:|---|---:|---:|---|---|
| NemotronLabs RE-USE | 9,6M | 8-48 kHz | 2,57 | 89,17 | OpenMDW-1.1 | Hugging Face (nvidia) |
| Sidon | 250M | no disponible | 1,73 | 84,68 | no disponible | open source (segun model card) |
| UniPASE | 500M | no disponible | 2,17 | 87,28 | no disponible | open source (segun model card) |
| UniSE | no disponible | 16 kHz (subconjunto) | 1,46 | 54,82 | no disponible | open source (segun model card) |
| Resemble Enhance | no disponible | 44,1 kHz (subconjunto) | 1,33 | 47,22 | no disponible | open source (segun model card) |
| ClearVoice | no disponible | 48 kHz (subconjunto) | 2,09 | 89,92 | no disponible | open source (segun model card) |

NemotronLabs RE-USE obtiene el mejor PESQ y CAcc del conjunto completo con dos ordenes de magnitud menos parametros que UniPASE y Sidon, y lidera tambien en los subconjuntos de 44,1 y 48 kHz.

## Limitaciones y advertencias

- Entrenado con clips inferiores a 10 segundos: para audio largo es necesario usar el modo de procesamiento por chunks, con posible discontinuidad en las fronteras si no se ajusta bien el solapamiento.
- En habla solapada suprime a los hablantes secundarios: no es adecuado si se necesita conservar todas las voces de una conversacion multiple.
- No se documentan sesgos especificos por idioma, pero al ser agnostico al idioma el rendimiento puede variar entre lenguas y no hay evaluacion publica por idioma en la informacion disponible.
- Riesgo de artefactos o sobre-suavizado en grabaciones extremadamente degradadas; conviene validar con muestras reales del dominio de produccion.
- La licencia OpenMDW-1.1 permite uso comercial segun la model card, pero conviene revisar los terminos completos del acuerdo antes de desplegar.
- Requiere la libreria mamba-ssm, cuya instalacion puede ser compleja; se recomienda usar el entorno Docker preconstruido.
- El repositorio DebabrataMondal/NVIDIA-NemotronLabs-RE-USE es una copia con 0 descargas y 0 likes; para produccion es preferible referenciar el repositorio oficial nvidia/NVIDIA-NemotronLabs-RE-USE.
- No se publican datos de latencia, throughput ni consumo energetico, lo que dificulta estimar costes de despliegue a gran escala.

## Enlaces

- Repositorio Hugging Face (copia): https://huggingface.co/DebabrataMondal/NVIDIA-NemotronLabs-RE-USE
- Repositorio oficial: https://huggingface.co/nvidia/NVIDIA-NemotronLabs-RE-USE
- Variante con preservacion de risa: https://huggingface.co/nvidia/NVIDIA-NemotronLabs-RE-USE-laughter
- Demo interactiva Gradio: https://huggingface.co/spaces/nvidia/NVIDIA-NemotronLabs-RE-USE
- Licencia OpenMDW-1.1: https://raw.githubusercontent.com/OpenMDW/OpenMDW/refs/heads/main/1.1/LICENSE.OpenMDW-1.1
- Entorno Docker para Mamba (SEMamba): https://github.com/RoyChao19477/SEMamba
- Paper referenciado (arXiv 2603.02641): https://arxiv.org/abs/2603.02641
- Paper referenciado (arXiv 2606.25621): https://arxiv.org/abs/2606.25621
