# nvidia/RE-USE

## Resumen

RE-USE es un modelo de mejora del habla (speech enhancement) desarrollado por NVIDIA, disenado para restaurar la calidad de audio degradado preservando la fidelidad de los atributos paralinguisticos: contenido linguistico, identidad del hablante, emocion, acento y otras caracteristicas. Se inspira en la teoria del compromiso distorsion-percepcion, de modo que un unico modelo equilibra la eliminacion de ruido con la conservacion de los rasgos del hablante. Es relevante porque aborda degradaciones muy diversas (ruido aditivo, reverberacion, clipping, limitacion de ancho de banda, artefactos de codec, perdida de paquetes y microfonos de baja calidad) con un modelo de solo 9,6 millones de parametros.

La arquitectura combina un encoder convolucional, un decoder convolucional y una pila de 30 capas de Mamba bidireccional para el modelado tiempo-frecuencia. El modelo es agnostico al idioma y admite multiples frecuencias de muestreo de entrada (8, 16, 22,05, 24, 32, 44,1 y 48 kHz), lo que lo hace util en pipelines heterogeneos de audio.

La version publicada en Hugging Face se distribuye bajo la licencia NVIDIA One-Way Noncommercial License (NSCLv1) y esta orientada exclusivamente a investigacion y desarrollo. NVIDIA indica que para uso comercial deben consultarse las variantes NVIDIA-NemotronLabs-RE-USE y NVIDIA-NemotronLabs-RE-USE-laughter.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder convolucional + decoder convolucional + Mamba bidireccional de 30 capas |
| Parametros totales | 9.607.747 (9,6 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio, procesa ventanas de audio; soporta chunking para audios largos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | agnostico al idioma (entrenado con datos multilingues: De, En, Es, Fr y otros) |
| Licencia | NVIDIA One-Way Noncommercial License (NSCLv1), etiquetada como "other" |
| Formato de pesos | safetensors |
| Frecuencias de muestreo de entrada/salida | 8, 16, 22,05, 24, 32, 44,1 y 48 kHz, mono |
| Formato de audio | .wav, unidimensional |
| Version del checkpoint | 30USEMamba_peak+GAN_tel_mic_1134k |
| Tamano del repositorio | 0,1 GB |
| Libreria | mamba-ssm |
| Pipeline | audio-to-audio |

## Arquitectura y entrenamiento

El modelo sigue un diseno encoder-decoder convolucional con un nucleo de Mamba bidireccional de 30 capas que modela la representacion tiempo-frecuencia. Mamba (state space model) sustituye a la atencion clasica, lo que permite un coste computacional lineal con la longitud de la secuencia, algo especialmente adecuado para senales de audio largas. El modelo opera sobre audio mono entre 8 y 48 kHz y puede activar extension de ancho de banda (BWE) mediante un argumento de configuracion.

El entrenamiento se realizo con menos de 10.000 horas de audio, incluyendo LibriVox del desafio DNS5 (~350 h), LibriTTS (~200 h), VCTK (~80 h), WSJ (~85 h), EARS (~100 h) y Multilingual Librispeech en aleman, ingles, espanol y frances, entre otros conjuntos. El checkpoint publicado difiere del reportado en el paper: incorpora tipos de degradacion adicionales (respuesta de microfono y mas codecs) y fue afinado sobre un subconjunto limpio de alta calidad mas pequeno. La referencia tecnica es el paper "Rethinking Training Targets, Architectures and Data Quality for Universal Speech Enhancement" (arXiv:2603.02641, NeurIPS 2026).

## Capacidades

- Mejora del habla universal: eliminacion de ruido aditivo, reverberacion, clipping, limitacion de ancho de banda, artefactos de codec, perdida de paquetes y distorsion de microfonos de baja calidad.
- Preservacion de fidelidad: mantiene contenido linguistico, identidad del hablante, emocion, acento y atributos paralinguisticos.
- Soporte de multiples frecuencias de muestreo de entrada y salida (8 a 48 kHz).
- Capacidad agnostica al idioma, con entrenamiento multilingue.
- Extension de ancho de banda opcional (BWE) configurable por argumento.
- Procesamiento por chunks para audios largos que provocarian OOM en GPU.
- Entrada de audio y video en la demo interactiva de Gradio (el modelo en si procesa audio).
- No dispone de tool calling, function calling, razonamiento multi-paso ni generacion de texto: es un modelo puramente audio-a-audio.

## Casos de uso

- Limpieza de grabaciones de campo o entrevistas: el modelo elimina ruido de fondo y reverberacion preservando la voz del hablante, adecuado para transcripcion posterior con ASR.
- Preprocesado en pipelines de reconocimiento automatico del habla: mejora la relacion senal-ruido antes de alimentar un ASR, con soporte de 8 kHz (telefonia) a 48 kHz (estudio).
- Restauracion de audio telefonico: corrige limitacion de ancho de banda y artefactos de codec en grabaciones de call centers, con extension de ancho de banda opcional.
- Recuperacion de grabaciones danadas: repara clipping, perdida de paquetes y distorsion de microfono en archivos historicos o de baja calidad.
- Normalizacion de datasets de audio multilingues: al ser agnostico al idioma y soportar varias frecuencias de muestreo, unifica la calidad de corpus en aleman, ingles, espanol, frances y otros idiomas antes de entrenar modelos de voz.
- Procesamiento de audios largos en produccion: el script `inference_chunk.sh` permite dividir en chunks configurando `chunk_size_in_seconds` y `hop_length_portion`, evitando OOM en GPU.
- Investigacion en mejora del habla: modelo ligero (9,6 M de parametros) para experimentar con arquitecturas Mamba en tareas de restauracion de audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 9,6 M de parametros el modelo es muy ligero, pero el consumo depende de la longitud del audio procesado (de ahi el modo chunking para audios largos).
- GPU recomendadas: NVIDIA Ampere (A100) es la microarquitectura indicada como compatible en la model card; el modelo esta optimizado para sistemas acelerados por GPU NVIDIA con CUDA.
- Cabe en GPU de consumo: previsiblemente si, dado el reducido tamano del modelo, aunque no se confirma en la informacion disponible.
- Opciones de despliegue: scripts de inferencia incluidos (`inference.sh`, `inference_chunk.sh`), libreria `mamba-ssm`, entorno Docker preconstruido para Mamba (repositorio SEMamba) y demo Gradio en Hugging Face Spaces.
- Sistema operativo preferido: Linux.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible: la informacion proporcionada no incluye datos de benchmarks ni comparaciones con otros modelos de mejora del habla.

## Limitaciones y advertencias

- Licencia no comercial: NSCLv1 restringe el uso comercial; para produccion comercial deben usarse las variantes NVIDIA-NemotronLabs-RE-USE o NVIDIA-NemotronLabs-RE-USE-laughter.
- Orientado exclusivamente a investigacion y desarrollo segun la model card.
- El checkpoint publicado difiere del evaluado en el paper, por lo que los resultados del articulo no son directamente extrapolables.
- Riesgo de sobre-suavizado o alteracion de rasgos paralinguisticos en degradaciones extremas, inherente al compromiso distorsion-percepcion.
- Solo procesa audio mono; no soporta entrada multicanal en la informacion disponible.
- Posible OOM con audios largos si no se usa el modo de procesamiento por chunks.
- Entrenado con menos de 10.000 horas de audio, con predominio de ingles y cobertura multilingue limitada a unos pocos idiomas (De, En, Es, Fr y otros no detallados).
- Requiere configuracion especifica de Mamba (entorno Docker recomendado) y Linux.
- No se han documentado sesgos especificos ni tasas de alucinacion (no aplica generacion de texto).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nvidia/RE-USE
- Demo interactiva Gradio: https://huggingface.co/spaces/nvidia/RE-USE
- Variante comercial: https://huggingface.co/nvidia/NVIDIA-NemotronLabs-RE-USE
- Variante comercial con risas: https://huggingface.co/nvidia/NVIDIA-NemotronLabs-RE-USE-laughter
- Paper: https://arxiv.org/abs/2603.02641
- Licencia NSCLv1: https://github.com/NVlabs/HMAR/blob/main/LICENSE
- Entorno Docker para Mamba (SEMamba): https://github.com/RoyChao19477/SEMamba
- DNS5 Challenge: https://github.com/microsoft/DNS-Challenge/tree/master
- LibriTTS: https://openslr.org/60/
- VCTK: https://datashare.ed.ac.uk/handle/10283/3443
- WSJ: https://catalog.ldc.upenn.edu/LDC93S6A
- EARS: https://sp-uhh.github.io/ears_dataset/
- Multilingual Librispeech: https://www.openslr.org/94/
