# SidraBhatti/vit-vvit-radar-modulation-recognition

## Resumen

El repositorio `SidraBhatti/vit-vvit-radar-modulation-recognition` acompaña al artículo "Transformer-based models for intrapulse modulation recognition of radar waveforms", publicado en *Engineering Applications of Artificial Intelligence* (vol. 136, 108989, 2024) por Sidra Ghayour Bhatti, Imtiaz Ahmad Taj, Mohsin Ullah y Aamer Iqbal Bhatti. Se trata de un trabajo de reconocimiento automático de modulación (AMRS, *Automatic Modulation Recognition System*) aplicado a formas de onda radar codificadas en fase y de baja probabilidad de intercepción (LPI), a partir del espectro de fase obtenido mediante STFT.

El trabajo compara tres arquitecturas entrenadas sobre las mismas imágenes de espectro de fase: un Vision Transformer estándar (ViT), un Vicinity Vision Transformer (VViT) con atención de complejidad lineal basada en sesgo de localidad por distancia Manhattan 2D, y una CNN profunda (DCNN) como línea base. El objetivo es clasificar la señal interceptada en una de seis familias de codificación de fase (Barker, Frank, P1, P2, P3 y P4) en condiciones de relación señal-ruido extremadamente bajas, hasta −16 dB.

La relevancia del repositorio es fundamentalmente documental y metodológica: publica la descripción del pipeline, las figuras del sistema y los resultados de precisión por tipo de modulación y arquitectura. No se ha subido ningún peso, configuración ni dataset (el tamaño del repositorio es 0,0 GB y acumula 0 descargas y 0 *likes* en el momento de la consulta), por lo que no es un artefacto listo para inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) estándar, Vicinity Vision Transformer (VViT) con Vicinity Attention y estructura piramidal de 4 etapas, y DCNN (3 capas convolucionales de 32/64/96 filtros, max-pooling y dos capas fully-connected con dropout) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (se procesan imágenes de espectro de fase recortadas, no secuencias de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de clasificación de señales, no lingüístico) |
| Licencia | other (los metadatos no especifican los términos concretos) |
| Formato de pesos | no disponible (no se incluyen pesos en el repositorio; tamaño del repo 0,0 GB) |

## Arquitectura y entrenamiento

La entrada del sistema no es la señal en bruto, sino una representación intermedia: para cada señal interceptada se calcula la FFT para estimar la frecuencia portadora f_c y su recíproco T_c, se deriva un tamaño de ventana STFT adecuado a partir de T_c y de la frecuencia de muestreo F_s, se desliza la ventana extrayendo la fase en cada paso y se construye una matriz de fase que se transforma en imagen. Esa imagen se recorta a la fila correspondiente a f_c para eliminar las filas dominadas por ruido AWGN. El artículo justifica explícitamente el uso del espectro de fase en lugar del de magnitud: en señales codificadas en fase, el desplazamiento de fase intrapulso es precisamente la información discriminante del esquema de codificación, y el enfoque basado en magnitud la pierde.

Sobre esas imágenes se entrenan las tres arquitecturas. ViT divide la imagen en parches de tamaño fijo, los embebe linealmente con *position embeddings* aprendibles y los procesa con un encoder transformer estándar (auto-atención multi-cabeza más bloques MLP). VViT sustituye la auto-atención softmax por Vicinity Attention, un mecanismo de complejidad lineal que repondera la atención mediante un sesgo de localidad basado en la distancia Manhattan 2D entre parches, combinando *feature reduction attention* y una conexión de preservación de características dentro de una estructura piramidal de cuatro etapas, con el objetivo de escalar linealmente con la longitud de secuencia en lugar de cuadráticamente. La DCNN actúa como línea base convolucional.

Los datos de entrenamiento y prueba se generan por simulación con inyección de ruido AWGN en un rango de −16 dB a +8 dB en pasos de 2 dB. Se emplean seis familias de formas de onda codificadas en fase: Barker (M = 4, 7, 11, 13), Frank (L = 3, 4, 6), P1 (L = 2, 4), P2 (L = 4, 6), P3 (Nc = 4, 12, 16) y P4 (Nc = 4, 12, 15), con 674 imágenes por tipo y un total de 1326 imágenes de test. La model card no documenta uso de RLHF, DPO ni técnicas de alineación, algo esperable en un clasificador de señales.

## Capacidades

- Clasificación de modulación intrapulso de formas de onda radar codificadas en fase en seis familias: Barker, Frank, P1, P2, P3 y P4.
- Reconocimiento robusto en regímenes de SNR muy baja, con evaluación explícita hasta −16 dB.
- Extracción de características basada en espectro de fase STFT, con estimación previa de la frecuencia portadora mediante FFT y recorte de filas dominadas por ruido.
- Comparación controlada de tres arquitecturas (ViT, VViT, DCNN) sobre el mismo conjunto de imágenes de espectro de fase.
- VViT aporta atención de complejidad lineal, lo que en principio reduce el coste computacional frente a la atención cuadrática estándar al aumentar el número de parches.
- No soporta *tool calling* ni *function calling*: no es un modelo de lenguaje.
- No soporta agentes ni razonamiento multi-paso en el sentido de los LLM.
- No tiene capacidades multilingües: opera sobre señales, no sobre texto.
- No incorpora modo *thinking*, visión general, audio ni generación de texto.

## Casos de uso

- Guerra electrónica y conciencia situacional: clasificar automáticamente la modulación de una señal radar interceptada permite inferir el tipo de emisor y su modo de operación; el modelo mantiene precisión útil incluso en el margen de −16 dB a −12 dB, que es donde los métodos comparados degradan.
- Sistemas de alerta temprana en plataformas con restricciones de cómputo: dado que VViT escala linealmente con el número de parches, es el candidato natural cuando se necesita procesar muchas interceptaciones por segundo en hardware embarcado.
- Investigación en procesamiento de señal: el pipeline de extracción de fase STFT es reutilizable como referencia para construir *baselines* reproducibles de AMR sobre espectro de fase.
- Monitorización del espectro y gestión de interferencias: identificar la familia de codificación de una emisión permite decidir políticas de coexistencia o de mitigación en bandas congestionadas.
- Validación de simuladores y generadores de señal: los resultados por tipo de modulación y por nivel de SNR sirven como referencia para comprobar si un simulador reproduce condiciones realistas de ruido.
- Docencia y formación técnica: la comparación ViT frente a VViT frente a DCNN, con datos de precisión a distintos SNR, es un caso de estudio cerrado para explicar el efecto del sesgo de localidad en atención visual.
- Desarrollo de clasificadores específicos: si se dispone de los pesos o se reentrena, el modelo puede integrarse en una cadena de adquisición digital seguida de STFT y clasificación para etiquetado automático de capturas.

## Benchmarks y rendimiento

Precisión de reconocimiento (%) frente a SNR, por tipo de modulación y arquitectura, según la model card:

| Modulacion | Arquitectura | −16 dB | −12 dB | −8 dB | −4 dB | 0 dB | 4 dB | 8 dB |
|---|---|---|---|---|---|---|---|---|
| Barker | ViT | 91,6 | 97,5 | 100 | 100 | 100 | 100 | 100 |
| Barker | DCNN | 88 | 93 | 97 | 100 | 100 | 100 | 100 |
| Barker | VViT | 96 | 92 | 100 | 100 | 100 | 100 | 100 |
| Frank | ViT | 100 | 100 | 100 | 100 | 100 | 100 | 100 |
| Frank | DCNN | 99 | 100 | 100 | 100 | 100 | 100 | 100 |
| Frank | VViT | 100 | 100 | 100 | 100 | 100 | 100 | 100 |
| P1 | ViT | 87,5 | 98,3 | 100 | 100 | 100 | 100 | 100 |
| P1 | DCNN | 57 | 77 | 100 | 100 | 100 | 100 | 100 |
| P1 | VViT | 75 | 100 | 100 | 100 | 100 | 100 | 100 |
| P2 | ViT | 100 | 100 | 100 | 100 | 100 | 100 | 100 |
| P2 | DCNN | 100 | 100 | 100 | 100 | 100 | 100 | 100 |
| P2 | VViT | 83 | 100 | 100 | 100 | 100 | 100 | 100 |
| P3 | ViT | 97,7 | 99 | 100 | 100 | 100 | 100 | 100 |
| P3 | DCNN | 97 | 99 | 100 | 100 | 100 | 100 | 100 |
| P3 | VViT | 100 | 100 | 100 | 100 | 100 | 100 | 100 |
| P4 | ViT | 79,4 | 87,7 | 98,3 | 100 | 100 | 100 | 100 |
| P4 | DCNN | 93 | 99 | 100 | 100 | 100 | 100 | 100 |
| P4 | VViT | 94 | 100 | 100 | 100 | 100 | 100 | 100 |
| **Global** | **ViT** | **92,7** | **97** | **99,7** | **100** | **100** | **100** | **100** |
| **Global** | **DCNN** | **89** | **94,6** | **99** | **100** | **100** | **100** | **100** |
| **Global** | **VViT** | **93** | **98** | **100** | **100** | **100** | **100** | **100** |

La figura 8 de la model card afirma que ViT y VViT mantienen mayor precisión que cuatro métodos del estado del arte (Wang et al. 2023b, Kim et al. 2023, Guo et al. 2022, Ma et al. 2022), especialmente en el rango de −12 dB a −6 dB. Los valores numéricos de esa comparación externa no aparecen en la información disponible, ya que el texto de la model card está truncado en ese punto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. La model card no publica el número de parámetros ni el tamaño de los checkpoints de ViT, VViT o DCNN, por lo que no es posible calcular requisitos de memoria.
- GPU recomendadas: no disponible por la misma razón.
- Viabilidad en GPU de consumo: no disponible. No hay datos de tamaño de modelo ni de pesos publicados.
- Opciones de despliegue: no disponible. El repositorio no incluye pesos, configuraciones ni código de inferencia, y no declara compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible. No se publican mediciones de tiempo de inferencia ni de imágenes procesadas por segundo.

## Comparativa con modelos similares

Comparación interna entre las tres arquitecturas evaluadas en el mismo artículo, sobre el mismo conjunto de imágenes de espectro de fase:

| Modelo | Parametros | Contexto / entrada | Precision global a −16 dB | Precision global a −8 dB | Licencia | Disponibilidad de pesos |
|---|---|---|---|---|---|---|
| VViT (Vicinity Vision Transformer) | no disponible | imagen de espectro de fase recortada | 93 % | 100 % | other | no publicados |
| ViT (Vision Transformer) | no disponible | imagen de espectro de fase recortada | 92,7 % | 99,7 % | other | no publicados |
| DCNN (linea base convolucional) | no disponible | imagen de espectro de fase recortada | 89 % | 99 % | other | no publicados |

Frente a métodos externos, la model card menciona cuatro referencias del estado del arte (Wang et al. 2023b, Kim et al. 2023, Guo et al. 2022, Ma et al. 2022) sobre las que ViT y VViT obtendrían mejores resultados en el rango de −12 dB a −6 dB, pero los valores concretos no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- El repositorio no contiene pesos, configuración ni código de inferencia (tamaño 0,0 GB), por lo que no es utilizable directamente; es material de acompañamiento de un artículo.
- La licencia figura como "other" sin que los metadatos ni la model card especifiquen los términos. No hay base para asumir uso comercial permitido.
- El artículo asociado está en acceso de pago: la model card indica explícitamente que no se incluye PDF y que el enlace requiere suscripción.
- No se publican datos de entrenamiento, test ni scripts de generación de señal, lo que impide reproducir los resultados a partir del repositorio.
- La evaluación se realiza íntegramente sobre señales simuladas con ruido AWGN aditivo. El comportamiento frente a desvanecimiento, multitrayecto, interferencias co-canal o ruido no gaussiano no está documentado en la información disponible.
- El alcance se limita a seis familias de codificación de fase. No hay evidencia de generalización a modulaciones no vistas ni a codificaciones híbridas.
- Los resultados a −16 dB no son uniformes: P1 con VViT baja al 75 % y P2 con VViT al 83 %, por debajo de ViT en esos casos concretos. El promedio global de VViT es superior, pero el comportamiento por clase es desigual.
- La información de la model card está truncada, por lo que la comparación con métodos del estado del arte queda sin cifras verificables.
- No se documentan sesgos en el sentido estadístico habitual, pero sí un sesgo de dominio claro: el modelo está especializado en el rango −16 dB a +8 dB y en las formas de onda listadas.
- Riesgo de alucinación: no aplica en el sentido de los modelos generativos, pero existe riesgo de predicción errónea con alta confianza en regímenes de SNR no cubiertos o ante señales fuera de las seis familias entrenadas.
- No hay datos de versión, fecha de entrenamiento ni pesos; la fecha de creación del repositorio que figura en los metadatos es 2026-09-13, posterior a la publicación del artículo de 2024.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SidraBhatti/vit-vvit-radar-modulation-recognition
- Artículo: Bhatti, S.G., Taj, I.A., Ullah, M., & Bhatti, A.I. (2024). "Transformer-based models for intrapulse modulation recognition of radar waveforms." *Engineering Applications of Artificial Intelligence*, 136, 108989. https://doi.org/10.1016/j.engappai.2024.108989 (acceso de pago)
- Paper de referencia de ViT: Dosovitskiy et al. (2020), Vision Transformer (citado en la model card, sin enlace explícito)
- Referencias comparadas mencionadas sin enlace: Wang et al. 2023b, Kim et al. 2023, Guo et al. 2022, Ma et al. 2022
- No se han encontrado otros enlaces relevantes (repositorios, demos o blogs) en la búsqueda web realizada.
