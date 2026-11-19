# 0x3/NVIDIA-NemotronLabs-RE-USE

## Resumen

NVIDIA NemotronLabs RE-USE es un modelo de mejora universal del habla (universal speech enhancement, USE) de 9,6 millones de parametros desarrollado por NVIDIA dentro del proyecto RE-USE. Su objetivo es restaurar la calidad de grabaciones de voz degradadas por ruido aditivo, reverberacion, clipping, limitacion de ancho de banda, artefactos de codec, perdida de paquetes y microfonos de baja calidad, preservando al mismo tiempo la fidelidad de la voz original.

El modelo destaca por su tamano extremadamente reducido (9,6 M de parametros) frente a alternativas de 250 M a 500 M, manteniendo o superando sus metricas de calidad. Soporta multiples frecuencias de muestreo de entrada (8, 16, 22,05, 24, 32, 44,1 y 48 kHz) y es agnostico al idioma, lo que lo hace aplicable a corpus multilingues sin reentrenamiento.

La relevancia actual radica en que demuestra que una arquitectura basada en Mamba-SSM puede igualar o superar a modelos transformer mucho mayores en tareas de restauracion de audio, con un coste computacional y de memoria muy inferior, lo que facilita su despliegue en produccion y en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mamba-SSM (state space model) |
| Parametros totales | 9.607.747 (9,6 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa clips de audio; entrenado con clips < 10 s) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | agnostico al idioma (sin lista explicita) |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | safetensors |
| Pipeline | audio-to-audio |
| Frecuencias de muestreo de entrada | 8, 16, 22,05, 24, 32, 44,1 y 48 kHz |
| Libreria | mamba-ssm |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura basada en Mamba, un modelo de espacio de estados (SSM) selectivo que procesa secuencias con complejidad lineal en lugar de la cuadratica de la atencion transformer. Esta eleccion explica en parte su reducido numero de parametros (9,6 M) y su eficiencia en inferencia. La libreria de referencia es `mamba-ssm`, y el modelo se distribuye en formato safetensors.

Segun la model card, el entrenamiento se realizo con clips de audio de menos de 10 segundos. No se especifica el numero total de tokens de audio, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO (no aplicables directamente a una tarea de regresion audio-a-audio). El modelo esta disenado para preservar al hablante principal y suprimir a otros hablantes en caso de solapamiento (overlapping speech). Existe una variante especifica, NVIDIA-NemotronLabs-RE-USE-laughter, orientada a preservar mejor la risa. No se detallan innovaciones adicionales como decodificacion especulativa o atencion lineal mas alla del propio uso de Mamba.

## Capacidades

- Mejora universal del habla: eliminacion de ruido aditivo, reduccion de reverberacion, correccion de clipping, extension de ancho de banda, mitigacion de artefactos de codec, recuperacion de perdida de paquetes y compensacion de microfonos de baja calidad.
- Soporte de multiples frecuencias de muestreo de entrada: 8, 16, 22,05, 24, 32, 44,1 y 48 kHz.
- Capacidad agnostica al idioma: funciona sobre voz en distintos idiomas sin adaptacion.
- Preservacion del hablante principal y supresion de hablantes secundarios en solapamiento.
- Extension de ancho de banda opcional mediante el argumento `BWE` en el script de inferencia.
- Procesamiento por chunks para audios largos (> 30 s) con parametros configurables (`chunk_size_in_seconds`, `hop_length_portion`).
- No se documenta soporte de tool calling, function calling, agentes ni modos de razonamiento (no aplicables a esta tarea).

## Casos de uso

- Restauracion de grabaciones de podcast y contenido audiovisual: el modelo elimina ruido de fondo, reverberacion y artefactos de compresion en grabaciones de creadores de contenido, mejorando la inteligibilidad antes de la publicacion.
- Preprocesado para pipelines de ASR: al mejorar la relacion senal-ruido y la inteligibilidad (STOI 0,78 en el conjunto completo, CAcc 89,17), reduce la tasa de error de sistemas de reconocimiento automatico en entornos ruidosos.
- Limpieza de audio de reuniones y videollamadas: corrige microfonos de baja calidad, perdida de paquetes y clipping tipicos de comunicaciones VoIP, preservando la voz del hablante principal.
- Restauracion de archivos historicos o de baja calidad: la extension de ancho de banda (`BWE`) permite reconstruir contenido de alta frecuencia en grabaciones limitadas a 8 o 16 kHz.
- Preprocesado para biometria de voz: al preservar la similitud del hablante (Spk 0,86 en el conjunto completo), sirve como etapa previa en sistemas de verificacion o diarizacion.
- Procesamiento de audio multilingue a gran escala: su caracter agnostico al idioma permite aplicar el mismo modelo a corpus en distintos idiomas sin reentrenamiento ni ajuste fino.
- Despliegue en dispositivos con recursos limitados: con solo 9,6 M de parametros, puede ejecutarse en GPUs de consumo e incluso en entornos embebidos, a diferencia de alternativas de 250-500 M.

## Benchmarks y rendimiento

Resultados sobre subconjuntos del conjunto de test no ciego de URGENT 2025, comparados con voz limpia anecoica original. SBERT: SpeechBERTScore; LPS: Levenshtein Phoneme Similarity; Spk: similitud de hablante (ECAPA-TDNN); CAcc: precision de caracteres de ASR (OWSM v3.1).

| Conjunto completo | Parametros | DNSMOS | NISQA | UTMOS | PESQ | STOI | SBERT | LPS | Spk | CAcc |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Noisy | - | 1,84 | 1,69 | 1,56 | 1,34 | 0,50 | 0,74 | 0,61 | 0,73 | 81,29 |
| Sidon | 250 M | **3,34** | 3,87 | **3,21** | 1,73 | 0,62 | 0,85 | 0,80 | 0,74 | 84,68 |
| UniPASE | 500 M | 3,21 | 4,03 | 2,96 | 2,17 | 0,76 | **0,89** | 0,85 | 0,81 | 87,28 |
| NemotronLabs RE-USE | 9,6 M | 3,29 | **4,33** | 2,94 | **2,57** | **0,78** | 0,88 | **0,85** | **0,86** | **89,17** |

| Subconjunto 16 kHz | DNSMOS | NISQA | UTMOS | PESQ | STOI | SBERT | LPS | Spk | CAcc |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Noisy | 1,84 | 1,59 | 1,41 | 1,29 | 0,53 | 0,70 | 0,58 | 0,63 | 76,54 |
| UniSE | **3,23** | 3,71 | **2,77** | 1,46 | 0,62 | 0,77 | 0,60 | 0,57 | 54,82 |
| NemotronLabs RE-USE | 3,19 | **4,20** | 2,64 | **2,47** | **0,82** | **0,87** | **0,84** | **0,82** | **87,09** |

| Subconjunto 44,1 kHz | DNSMOS | NISQA | UTMOS | PESQ | STOI | SBERT | LPS | Spk | CAcc |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Noisy | 1,91 | 1,79 | 1,52 | 1,30 | 0,52 | 0,76 | 0,61 | 0,80 | 83,65 |
| Resemble Enhance | 3,13 | 3,68 | 2,11 | 1,33 | 0,41 | 0,69 | 0,46 | 0,57 | 47,22 |
| NemotronLabs RE-USE | **3,36** | **4,44** | **2,80** | **2,47** | **0,80** | **0,89** | **0,86** | **0,90** | **91,54** |

| Subconjunto 48 kHz | DNSMOS | NISQA | UTMOS | PESQ | STOI | SBERT | LPS | Spk | CAcc |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Noisy | 2,04 | 1,83 | 1,99 | 1,28 | 0,55 | 0,77 | 0,77 | 0,78 | 90,64 |
| ClearVoice | 2,97 | 3,38 | 3,01 | 2,09 | 0,70 | 0,84 | 0,87 | 0,77 | 89,92 |
| NemotronLabs RE-USE | **3,33** | **4,49** | **3,63** | **2,59** | **0,77** | **0,89** | **0,91** | **0,86** | **91,05** |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 9,6 M de parametros el modelo es muy ligero y cabe holgadamente en cualquier GPU moderna, incluso con margen para buffers de audio.
- GPU recomendadas: no se especifican en la model card; por tamano, cualquier GPU con al menos unos pocos GB de VRAM es suficiente. Se menciona que audios largos pueden provocar OOM en GPU, lo que sugiere que el consumo crece con la duracion del audio procesado.
- GPU de consumo: si, cabe en GPUs de consumo (RTX 4090, RTX 3090, e inferiores) dado su reducido tamano.
- Opciones de despliegue: scripts de inferencia propios (`inference.sh`, `inference_chunk.sh`), entorno Docker preconstruido para Mamba (enlazado desde el repositorio SEMamba), libreria `mamba-ssm`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a audio-to-audio).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Licencia | Contexto/entrada | Rendimiento destacado |
|---|---:|---|---|---|---|
| NemotronLabs RE-USE | 9,6 M | Mamba-SSM, USE | OpenMDW-1.1 | 8-48 kHz, clips < 10 s (chunking para largos) | PESQ 2,57, STOI 0,78, CAcc 89,17 en conjunto completo |
| Sidon | 250 M | USE | no disponible | no disponible | DNSMOS 3,34, UTMOS 3,21, PESQ 1,73 |
| UniPASE | 500 M | USE | no disponible | no disponible | SBERT 0,89, NISQA 4,03, PESQ 2,17 |
| UniSE | no disponible | USE | no disponible | 16 kHz | DNSMOS 3,23, UTMOS 2,77, CAcc 54,82 |
| Resemble Enhance | no disponible | USE | no disponible | 44,1 kHz | PESQ 1,33, CAcc 47,22 |
| ClearVoice | no disponible | USE | no disponible | 48 kHz | PESQ 2,09, UTMOS 3,01 |

NemotronLabs RE-USE logra metricas competitivas o superiores con dos ordenes de magnitud menos parametros que Sidon y UniPASE. No se dispone de informacion sobre licencias ni contextos de los modelos comparados.

## Limitaciones y advertencias

- Entrenado con clips de menos de 10 segundos: para audios largos es necesario usar el flujo de chunking (`inference_chunk.sh`) y ajustar `chunk_size_in_seconds` y `hop_length_portion`; un chunking inadecuado puede introducir discontinuidades.
- En caso de habla solapada, el modelo preserva al hablante principal y suprime a los demas, lo que puede no ser deseable en escenarios donde se requiere conservar multiples voces.
- La preservacion de la risa es limitada en esta variante; existe una version especifica (`-laughter`) para ese caso.
- No se documentan sesgos especificos, pero al ser agnostico al idioma y entrenado con datos no detallados, el rendimiento puede variar entre idiomas y acentos.
- Riesgo de alucinacion o artefactos de reconstruccion en audio muy degradado: la extension de ancho de banda (`BWE`) sintetiza contenido de alta frecuencia que puede no corresponder exactamente al original.
- Licencia OpenMDW-1.1: permite uso comercial segun la model card ("ready for commercial use"), pero conviene revisar los terminos completos del acuerdo antes de integrarlo en productos.
- El proyecto no acepta contribuciones externas.
- No se especifican tipos de cuantizacion ni formatos alternativos a safetensors; el despliegue requiere el entorno Mamba (`mamba-ssm`), lo que anade complejidad frente a modelos basados en transformers.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/0x3/NVIDIA-NemotronLabs-RE-USE
- Modelo original (NVIDIA): https://huggingface.co/nvidia/NVIDIA-NemotronLabs-RE-USE
- Variante para preservacion de risa: https://huggingface.co/nvidia/NVIDIA-NemotronLabs-RE-USE-laughter
- Demo interactiva Gradio: https://huggingface.co/spaces/nvidia/NVIDIA-NemotronLabs-RE-USE
- Licencia OpenMDW-1.1: https://raw.githubusercontent.com/OpenMDW/OpenMDW/refs/heads/main/1.1/LICENSE.OpenMDW-1.1
- Entorno Docker para Mamba (SEMamba): https://github.com/RoyChao19477/SEMamba?tab=readme-ov-file#-docker-support
- Paper referenciado (arxiv:2603.02641): https://arxiv.org/abs/2603.02641
- Paper referenciado (arxiv:2606.25621): https://arxiv.org/abs/2606.25621
