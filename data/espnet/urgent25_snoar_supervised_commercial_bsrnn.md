# espnet/urgent25_snoar_supervised_commercial_bsrnn

## Resumen

BSRNN speech denoiser trained on commercial-use URGENT 2025 data es un modelo de mejora de voz (speech enhancement) de un solo canal y 16 kHz desarrollado por el equipo de ESPnet. Su tarea es la eliminacion de ruido aditivo manteniendo la reverberacion original de la grabacion, lo que lo distingue de los sistemas de restauracion completa que tambien eliminan la reverberacion. Se trata de una red BSRNN (Band-Split RNN) de 64 canales por 6 capas con dos salidas (voz y ruido) y consistencia de mezcla por energia.

El modelo resuelve un problema practico relevante para produccion: existe una demanda creciente de herramientas de denoising que puedan usarse comercialmente sin las restricciones de licencias no comerciales (CC BY-NC) o share-alike que afectan a gran parte de los corpus de audio publicos. Para ello, se entrena exclusivamente con el subconjunto del pool del desafio URGENT 2025 cuyas licencias permiten uso comercial y obras derivadas.

Con 5.766.548 parametros (aproximadamente 23 MB en float32), es un modelo muy ligero que puede ejecutarse en CPU o en GPUs de consumo. Ademas, se publica como semilla supervisada del sistema SNOAR de auto-adaptacion de ESPnet3, lo que permite adaptarlo a grabaciones ruidosas sin etiquetar del usuario mediante `espnet snoar adapt`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BSRNN (Band-Split RNN), 64 canales x 6 capas, 2 salidas (voz y ruido) con consistencia de mezcla por energia |
| Parametros totales | 5.766.548 (100 % entrenables) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa audio en fragmentos de 20 s con 50 % de solapamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo opera sobre senal acustica, no sobre texto) |
| Licencia | CC BY 4.0 |
| Formato de pesos | no disponible (repo de 0.0 GB; pesos en formato ESPnet, presumiblemente PyTorch) |

## Arquitectura y entrenamiento

La arquitectura es una BSRNN (Band-Split RNN) para mejora de voz monoaural, basada en el trabajo de Yu y Luo (ICASSP 2023). La red divide el espectro en bandas, procesa cada banda con capas recurrentes (64 canales, 6 capas) y produce dos salidas: la voz estimada y el ruido estimado, con una restriccion de consistencia de mezcla basada en energia que fuerza a que ambas sumen la mezcla de entrada. El modelo opera a 16 kHz, en un solo canal, y conserva la reverberacion: la mitad de los fragmentos de entrenamiento son reverberantes y su objetivo es la voz reverberante, no la voz seca.

El entrenamiento uso 1,17 M de ficheros de voz (unas 2020 h) y 32,6 k ficheros de ruido (80,7 h), mezclados al vuelo con SNR entre -5 y 20 dB; la mitad de las mezclas se convolucionaron con una respuesta al impulso de sala (RIR). Se realizaron 100 k pasos con batch de 64 y fragmentos de 3 s. Las fuentes de voz incluyen CommonVoice (subconjunto URGENT 2025, CC0), DNS5 read speech de LibriVox (CC BY 4.0) y subconjuntos de LibriTTS, MLS y VCTK (CC BY 4.0). Las fuentes de ruido incluyen FSD50K, FMA sin voces, DNS5 Freesound, MUSAN y ruido de viento simulado de URGENT 2025, filtrando por licencia permisible (CC0, CC BY, dominio publico). Las RIR provienen de DNS5 (SLR26, SLR28, Apache 2.0). Se excluyeron EARS y WHAM! (CC BY-NC), los clips AudioSet de DNS5 y cualquier ruido no comercial, sin derivadas, share-alike, Sampling+ o de licencia desconocida. No se documenta uso de RLHF ni DPO, al no tratarse de un modelo generativo de texto.

## Capacidades

- Eliminacion de ruido aditivo en voz monoaural a 16 kHz.
- Preservacion de la reverberacion de la sala (no la elimina).
- Separacion explicita de voz y ruido mediante dos salidas con consistencia de mezcla por energia.
- Procesamiento de grabaciones largas en fragmentos de 20 s con 50 % de solapamiento.
- Remuestreo automatico de la entrada a 16 kHz mono.
- Auto-adaptacion a grabaciones ruidosas sin etiquetar mediante `espnet snoar adapt` (sistema SNOAR de ESPnet3).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues de texto: es un modelo de audio-a-audio puro.

## Casos de uso

- Limpieza de grabaciones de voz para podcasts y entrevistas: el modelo elimina ruido de fondo (trafico, ventilacion, ruido de viento) manteniendo la acustica natural de la sala, lo que resulta util cuando se quiere conservar la sensacion de espacio en lugar de obtener una senal totalmente seca.
- Preprocesado para ASR en produccion: al mejorar la relacion senal-ruido (SI-SDR de 2,82 a 8,68 dB en el conjunto de desarrollo) antes de un sistema de reconocimiento de voz, reduce errores en entornos ruidosos sin destruir la reverberacion que algunos ASR toleran bien.
- Denoising en dispositivos de consumo: con solo 5,77 M de parametros y 23 MB en float32, puede ejecutarse en CPU o en GPUs de gama baja dentro de auriculares, barras de sonido o camaras IP.
- Adaptacion a dominios propios: usando `espnet snoar adapt` sobre una carpeta de grabaciones ruidosas del cliente, se ajusta el modelo a un entorno acustico concreto (una fabrica, una oficina, un estudio) sin necesidad de etiquetas.
- Herramientas comerciales de audio: al estar entrenado solo con datos de licencia permisiva y publicarse bajo CC BY 4.0, puede integrarse en productos comerciales con atribucion, evitando las restricciones de corpus CC BY-NC como EARS o WHAM!.
- Telefonia y videoconferencia: mejora de la senal de entrada en llamadas con ruido de fondo domestico, con procesamiento por fragmentos que permite flujo casi en tiempo real en hardware modesto.
- Archivado y restauracion de grabaciones historicas: eliminacion de ruido de cinta o ruido ambiental preservando la reverberacion original de la sala de grabacion.

## Benchmarks y rendimiento

Evaluacion en el conjunto de desarrollo del track 1 de URGENT 2026 (2200 grabaciones remuestreadas a 16 kHz). El conjunto incluye reverberacion, limitacion de ancho de banda y otras distorsiones, por lo que un modelo de solo denoising que conserva reverberacion obtiene puntuaciones mas bajas frente a la referencia seca que un modelo de restauracion completa.

| Dataset | PESQ-WB | SI-SDR | STOI |
|---|---|---|---|
| dev | 1,638 | 8,681 | 0,819 |

| Modelo | SI-SDR (dB) | PESQ-WB | STOI | UTMOS |
|---|---|---|---|---|
| Entrada ruidosa | 2,82 | 1,26 | 0,769 | 1,51 |
| **BSRNN, datos de uso comercial** | **8,68** | **1,64** | **0,819** | **2,00** |
| BSRNN, pool completo (datos no comerciales, no publicado) | 9,01 | 1,65 | 0,825 | 2,02 |
| URGENT 2025 TF-GridNet (`kohei0209/tfgridnet_urgent25`, restauracion completa) | 11,73 | 2,32 | 0,907 | 2,37 |

UTMOS corresponde a UTMOS22 strong (SpeechMOS v1.2.0). La restriccion de licencia comercial cuesta aproximadamente 0,3 dB de SI-SDR frente al modelo entrenado con el pool completo.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 dado el tamano del modelo (23 MB de pesos); el consumo dominante es el buffer de audio y las activaciones intermedias.
- GPU recomendadas: no requiere GPU; cualquier GPU moderna (RTX 3060, RTX 4090, A100, H100) acelera el procesamiento, pero no es necesaria.
- Cabe en cualquier GPU de consumo e incluso en CPU: es viable en Raspberry Pi y dispositivos embebidos.
- Opciones de despliegue: CLI `espnet snoar enhance`, API Python `espnet3.publication.InferenceModel`, y el flujo de adaptacion `espnet snoar adapt`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada; el procesamiento por fragmentos de 20 s con 50 % de solapamiento implica un retardo minimo de un fragmento en modo streaming.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | SI-SDR (dB) | PESQ-WB | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| BSRNN commercial-use (este modelo) | 5,77 M | Denoising, conserva reverberacion | 8,68 | 1,64 | CC BY 4.0 | Publico en HF |
| BSRNN whole pool | no disponible | Denoising, conserva reverberacion | 9,01 | 1,65 | no disponible | No publicado (datos no comerciales) |
| TF-GridNet URGENT 2025 (`kohei0209/tfgridnet_urgent25`) | no disponible | Restauracion completa | 11,73 | 2,32 | no disponible | Publico en HF |

La comparativa directa con TF-GridNet no es equivalente: este ultimo realiza restauracion completa (elimina reverberacion y otras distorsiones), lo que explica su ventaja en las metricas frente a la referencia seca. El modelo BSRNN whole pool sirve como referencia del coste de la restriccion de licencia, no como alternativa distribuible.

## Limitaciones y advertencias

- Solo elimina ruido aditivo: no corrige reverberacion, limitacion de ancho de banda ni otras distorsiones, lo que penaliza sus metricas frente a modelos de restauracion completa.
- Evaluado unicamente en el conjunto de desarrollo de URGENT 2026; no hay resultados en otros dominios ni en idiomas distintos de los presentes en los corpus de entrenamiento.
- Riesgo de artefactos y sobre-suavizado en condiciones de SNR muy baja o ruidos no representados en el entrenamiento (por ejemplo, ruidos musicales con voces, excluidos por licencia).
- La evaluacion de licencias se realizo por fichero a partir de metadatos publicos y de buena fe; el autor advierte explicitamente que no constituye asesoramiento legal y que el usuario debe verificar que la licencia encaja con su uso.
- La licencia CC BY 4.0 exige atribucion; debe conservarse la atribucion de los corpus de voz y el fichero `data/noise_attribution.tsv` al redistribuir el modelo.
- No es un modelo de texto: no soporta tool calling, agentes, razonamiento ni capacidades multilingues de lenguaje natural.
- El procesamiento por fragmentos de 20 s con 50 % de solapamiento introduce latencia y puede generar discontinuidades en los bordes si no se aplica un fundido adecuado.
- El repositorio figura con 0.0 GB y 0 descargas en el momento de la consulta; conviene verificar la integridad y disponibilidad de los pesos antes de integrarlo en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/espnet/urgent25_snoar_supervised_commercial_bsrnn
- Modelo TF-GridNet URGENT 2025: https://huggingface.co/kohei0209/tfgridnet_urgent25
- Paper de ESPnet (Interspeech 2018): https://doi.org/10.21437/Interspeech.2018-1456
- Paper de BSRNN (Yu y Luo, ICASSP 2023): https://doi.org/10.1109/ICASSP49357.2023.10096462
- Repositorio ESPnet: https://github.com/espnet/espnet
- Receta `egs3/urgent25/snoar` (referenciada en la model card, dentro del repositorio ESPnet)
- Desafio URGENT 2025/2026: no disponible en la informacion proporcionada
