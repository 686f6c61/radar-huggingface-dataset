# dfhjshjfgj/NVIDIA-NemotronLabs-RE-USE

## Resumen

NVIDIA NemotronLabs RE-USE es un modelo de mejora del habla universal (universal speech enhancement, USE) desarrollado por NVIDIA como parte del proyecto RE-USE. Con solo 9,6 millones de parámetros, está disenado para restaurar la calidad de grabaciones de voz afectadas por degradaciones del mundo real: ruido aditivo, reverberación, recorte (clipping), limitación de ancho de banda, artefactos de códec, pérdida de paquetes y micrófonos de baja calidad. El modelo opera como un sistema audio-a-audio y es agnóstico al idioma.

La relevancia de este modelo radica en su relación entre tamano y rendimiento: compite con sistemas de 250 y 500 millones de parámetros en métricas objetivas como PESQ, STOI, NISQA o similitud de hablante, y lo hace con una huella de parámetros dos órdenes de magnitud menor. Además, soporta múltiples frecuencias de muestreo de entrada (8, 16, 22,05, 24, 32, 44,1 y 48 kHz), lo que lo hace utilizable en pipelines heterogéneos sin remuestreo previo obligatorio.

El modelo está disponible en Hugging Face bajo licencia OpenMDW-1.1 y NVIDIA lo marca como apto para uso comercial. Su arquitectura se basa en mamba-ssm (modelos de espacio de estados), lo que lo diferencia de las aproximaciones transformer habituales en esta tarea y explica en parte su eficiencia paramétrica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mamba (state space model, mamba-ssm) |
| Parametros totales | 9.607.747 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa clips; entrenamiento con clips < 10 s, chunking para audio largo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | agnóstico al idioma (multilingüe por diseno) |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura basada en Mamba (SSM), tal como indica la librería `mamba-ssm` declarada en el repositorio. Se trata de un modelo audio-a-audio de 9,6 millones de parámetros orientado a la mejora del habla universal, es decir, a restaurar voz degradada por múltiples tipos de corrupción simultáneamente en lugar de especializarse en una sola (denoising, dereverberación, etc.). Soporta de forma nativa múltiples frecuencias de muestreo de entrada (8 a 48 kHz) y, opcionalmente, extensión de ancho de banda (BWE) configurable mediante argumento en el script de inferencia.

No se dispone en la información proporcionada de detalles sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF/DPO (poco habituales en tareas de mejora de audio). La model card indica que los datos de entrenamiento consisten en clips inferiores a 10 segundos, y que para audio más largo debe emplearse el modo de procesamiento por chunks (`inference_chunk.sh`) con parámetros configurables de `chunk_size_in_seconds` y `hop_length_portion`. El modelo está entrenado para preservar al hablante principal y suprimir a otros hablantes en caso de solapamiento. Existe una variante específica, `NVIDIA-NemotronLabs-RE-USE-laughter`, orientada a preservar mejor la risa.

## Capacidades

- Mejora del habla universal: elimina ruido aditivo, reverberación, clipping, artefactos de códec, pérdida de paquetes y degradaciones por micrófono de baja calidad en una sola pasada.
- Soporte nativo de múltiples frecuencias de muestreo: 8, 16, 22,05, 24, 32, 44,1 y 48 kHz.
- Extensión de ancho de banda opcional (BWE) configurable en inferencia.
- Agnóstico al idioma: funciona sobre habla en cualquier lengua sin configuración específica.
- Preservación de la identidad del hablante (alta similitud de hablante medida con ECAPA-TDNN).
- Supresión de hablantes secundarios en solapamiento, preservando al hablante principal.
- Procesamiento de audio largo mediante chunking con solapamiento configurable.
- No dispone de tool calling, function calling, capacidades de agente, visión ni audio de entrada distinto de voz.

## Casos de uso

- Limpieza de grabaciones para creadores de contenido: el modelo restaura voz capturada con micrófonos de baja calidad o en entornos ruidosos, mejorando la inteligibilidad (STOI 0,78 en el conjunto completo) sin requerir hardware profesional.
- Preprocesado para pipelines de ASR: al mejorar la precisión de caracteres transcritos (CAcc 89,17 frente a 81,29 del audio ruidoso), se puede insertar como etapa previa a sistemas de reconocimiento de voz en producción.
- Reuniones y videoconferencia: procesamiento por chunks de audio largo (>30 s) para limpiar grabaciones de reuniones con reverberación, eco o pérdida de paquetes.
- Restauración de archivos históricos o de baja calidad: extensión de ancho de banda para material a 8 o 16 kHz, recuperando contenido de alta frecuencia.
- Telefonía y atención al cliente: mejora de audio telefónico (8 kHz) antes de su análisis o almacenamiento, con supresión de ruido y artefactos de códec.
- Doblaje y postproducción de audio: limpieza de tomas de voz para su reutilización en producciones donde se requiere fidelidad de timbre (Spk 0,86 en el conjunto completo).
- Investigación en procesamiento de voz: modelo ligero (9,6 M de parámetros) que sirve como baseline reproducible en experimentos de mejora del habla multilingüe.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre subconjuntos del conjunto de test no ciego de URGENT 2025, referenciados contra habla limpia anecoica original. SBERT = SpeechBERTScore; LPS = Levenshtein Phoneme Similarity; Spk = similitud de hablante (ECAPA-TDNN); CAcc = precisión de caracteres de ASR (OWSM v3.1).

Conjunto completo:

| Modelo | Params | DNSMOS | NISQA | UTMOS | PESQ | STOI | SBERT | LPS | Spk | CAcc |
|---|---|---|---|---|---|---|---|---|---|---|
| Noisy | - | 1,84 | 1,69 | 1,56 | 1,34 | 0,50 | 0,74 | 0,61 | 0,73 | 81,29 |
| Sidon | 250M | **3,34** | 3,87 | **3,21** | 1,73 | 0,62 | 0,85 | 0,80 | 0,74 | 84,68 |
| UniPASE | 500M | 3,21 | 4,03 | 2,96 | 2,17 | 0,76 | **0,89** | 0,85 | 0,81 | 87,28 |
| **NemotronLabs RE-USE** | **9,6M** | 3,29 | **4,33** | 2,94 | **2,57** | **0,78** | 0,88 | **0,85** | **0,86** | **89,17** |

Subconjunto 16 kHz:

| Modelo | DNSMOS | NISQA | UTMOS | PESQ | STOI | SBERT | LPS | Spk | CAcc |
|---|---|---|---|---|---|---|---|---|---|
| Noisy | 1,84 | 1,59 | 1,41 | 1,29 | 0,53 | 0,70 | 0,58 | 0,63 | 76,54 |
| UniSE | **3,23** | 3,71 | **2,77** | 1,46 | 0,62 | 0,77 | 0,60 | 0,57 | 54,82 |
| **NemotronLabs RE-USE** | 3,19 | **4,20** | 2,64 | **2,47** | **0,82** | **0,87** | **0,84** | **0,82** | **87,09** |

Subconjunto 44,1 kHz:

| Modelo | DNSMOS | NISQA | UTMOS | PESQ | STOI | SBERT | LPS | Spk | CAcc |
|---|---|---|---|---|---|---|---|---|---|
| Noisy | 1,91 | 1,79 | 1,52 | 1,30 | 0,52 | 0,76 | 0,61 | 0,80 | 83,65 |
| Resemble Enhance | 3,13 | 3,68 | 2,11 | 1,33 | 0,41 | 0,69 | 0,46 | 0,57 | 47,22 |
| **NemotronLabs RE-USE** | **3,36** | **4,44** | **2,80** | **2,47** | **0,80** | **0,89** | **0,86** | **0,90** | **91,54** |

Subconjunto 48 kHz:

| Modelo | DNSMOS | NISQA | UTMOS | PESQ | STOI | SBERT | LPS | Spk | CAcc |
|---|---|---|---|---|---|---|---|---|---|
| Noisy | 2,04 | 1,83 | 1,99 | 1,28 | 0,55 | 0,77 | 0,77 | 0,78 | 90,64 |
| ClearVoice | 2,97 | 3,38 | 3,01 | 2,09 | 0,70 | 0,84 | 0,87 | 0,77 | 89,92 |
| **NemotronLabs RE-USE** | **3,33** | **4,49** | **3,63** | **2,59** | **0,77** | **0,89** | **0,91** | **0,86** | **91,05** |

## Requisitos de hardware

- VRAM estimada para inferencia: con 9,6 millones de parámetros (unos 38 MB en fp32), el modelo es extremadamente ligero; la VRAM requerida vendrá dominada por el procesamiento de audio y los buffers intermedios, no por los pesos. No se publica una cifra oficial de VRAM.
- GPU recomendadas: cualquier GPU NVIDIA moderna es suficiente; el modelo cabe holgadamente en tarjetas de consumo. Para audio largo pueden requerirse GPUs con más memoria o el modo chunking.
- Cabe en GPU de consumo: sí, con amplio margen (RTX 3060, RTX 4090, etc.).
- Opciones de despliegue: scripts de inferencia incluidos (`inference.sh`, `inference_chunk.sh`); entorno Docker preconstruido para Mamba disponible en el repositorio SEMamba; requiere `resampy` si se usa extensión de ancho de banda. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Params | Contexto/entrada | PESQ (full) | STOI (full) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| **NemotronLabs RE-USE** | 9,6M | 8-48 kHz, multi-frecuencia | **2,57** | **0,78** | OpenMDW-1.1 | Hugging Face, demo Gradio |
| Sidon | 250M | no disponible | 1,73 | 0,62 | no disponible | open source |
| UniPASE | 500M | no disponible | 2,17 | 0,76 | no disponible | open source |
| UniSE | no disponible | 16 kHz (subconjunto) | 1,46 | 0,62 | no disponible | open source |
| Resemble Enhance | no disponible | 44,1 kHz (subconjunto) | 1,33 | 0,41 | no disponible | open source |
| ClearVoice | no disponible | 48 kHz (subconjunto) | 2,09 | 0,70 | no disponible | open source |

NemotronLabs RE-USE obtiene el mejor PESQ y STOI del conjunto completo con dos órdenes de magnitud menos parámetros que Sidon y UniPASE, y supera a los especialistas por frecuencia (UniSE, Resemble Enhance, ClearVoice) en sus respectivos subconjuntos.

## Limitaciones y advertencias

- El modelo está entrenado con clips inferiores a 10 segundos; para audio más largo es necesario usar el modo chunking, con posible pérdida de coherencia en las fronteras si no se ajusta el solapamiento.
- En caso de habla solapada, suprime a los hablantes secundarios: no es adecuado si se necesita preservar conversaciones con múltiples voces simultáneas.
- La variante estándar puede atenuar la risa; para preservarla existe la variante `NVIDIA-NemotronLabs-RE-USE-laughter`.
- No se documentan sesgos específicos ni tasas de alucinación (la tarea es audio-a-audio, no generativa de texto); el riesgo principal es la introducción de artefactos o sobre-suavizado en la voz restaurada.
- La licencia OpenMDW-1.1 permite uso comercial según la model card, pero conviene revisar los términos completos del acuerdo antes de desplegar en producción.
- No se especifican requisitos de atribución adicionales ni restricciones geográficas (despliegue global declarado).
- El proyecto no acepta contribuciones externas.
- No hay información sobre cuantizaciones soportadas ni sobre el comportamiento en GPUs sin soporte CUDA.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dfhjshjfgj/NVIDIA-NemotronLabs-RE-USE
- Modelo original de NVIDIA: https://huggingface.co/nvidia/NVIDIA-NemotronLabs-RE-USE
- Variante para preservación de risa: https://huggingface.co/nvidia/NVIDIA-NemotronLabs-RE-USE-laughter
- Demo Gradio interactiva: https://huggingface.co/spaces/nvidia/NVIDIA-NemotronLabs-RE-USE
- Licencia OpenMDW-1.1: https://raw.githubusercontent.com/OpenMDW/OpenMDW/refs/heads/main/1.1/LICENSE.OpenMDW-1.1
- Entorno Docker para Mamba (SEMamba): https://github.com/RoyChao19477/SEMamba?tab=readme-ov-file#-docker-support
- Paper de referencia (arXiv:2603.02641): https://arxiv.org/abs/2603.02641
- Paper de referencia (arXiv:2606.25621): https://arxiv.org/abs/2606.25621
