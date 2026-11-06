# cyttic/hmt-trocrctc-stroke4-s42

## Resumen

`cyttic/hmt-trocrctc-stroke4-s42` es un modelo de reconocimiento de texto manuscrito (HTR, *Handwritten Text Recognition*) publicado por el autor `cyttic` en Hugging Face. Forma parte de un estudio de aumento de datos (*augmentation study*) denominado `htr-metrics-transfer`, concretamente de su primera ola (*wave 1*), y emplea una arquitectura TrOCR con cabecera CTC. El modelo está entrenado para transcribir texto manuscrito en hebreo (`he`), lo que lo sitúa en un nicho muy específico dentro de los sistemas de reconocimiento óptico de caracteres.

El modelo cuenta con 87.279.756 parámetros (dato extraído de los pesos en safetensors) y un repositorio de 0,3 GB, lo que indica pesos en precisión completa o media sin cuantizar. Se entrenó sobre el conjunto `cyttic/hhd-optionb-split`, excluyendo los escritores del conjunto de desarrollo, y se evaluó sobre el test HHD Option-B con decodificación voraz (*greedy*) y sin modelo de lenguaje, obteniendo un CER de 0,1069 y un WER de 0,4465.

Su relevancia es acotada pero clara: sirve como referencia reproducible de un experimento controlado sobre el efecto de una estrategia de aumento concreta (`stroke4`) con una semilla fija (42). No es un modelo de propósito general, sino una pieza de un estudio comparativo sobre transferencia de métricas en HTR, útil para investigadores que trabajen con manuscritos hebreos o que quieran reproducir el experimento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TrOCR con cabecera CTC (transformer encoder-decoder, decodificacion CTC) |
| Parametros totales | 87.279.756 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF ni cuantizadas) |
| Idiomas soportados | hebreo (`he`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la familia TrOCR, un transformer encoder-decoder orientado a reconocimiento de texto en imagen, pero en esta variante la salida se resuelve mediante una cabecera CTC (*Connectionist Temporal Classification*) en lugar de decodificación autoregresiva clásica. El identificador `trocrctc` en el nombre confirma esta configuración. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de ajuste con RLHF o DPO; en un modelo HTR estos mecanismos no son habituales.

El entrenamiento se realizó sobre el split de train de `cyttic/hhd-optionb-split`, excluyendo a los escritores presentes en el conjunto de desarrollo, lo que introduce una separación por escritor (*writer-disjoint*) que evalúa la generalización a manos no vistas. La innovación metodológica del modelo no está en la arquitectura sino en el protocolo experimental: aplicación del aumento `stroke4` con semilla 42 dentro del estudio `htr-metrics-transfer`. La evaluación se hizo con decodificación voraz y sin modelo de lenguaje externo, lo que aísla el rendimiento del modelo acústico-visual puro.

## Capacidades

- Reconocimiento de texto manuscrito en hebreo a partir de imágenes de líneas o regiones de texto.
- Transcripción con salida CTC, sin dependencia de un modelo de lenguaje externo en la evaluación reportada.
- Entrenamiento con separación por escritor, orientado a generalizar a manos no vistas durante el entrenamiento.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe: el modelo está etiquetado únicamente para hebreo.
- No se documentan modos especiales como *thinking mode*, visión general, audio u otras modalidades.

## Casos de uso

- Digitalización de archivos manuscritos en hebreo: el modelo puede transcribir líneas de manuscritos históricos o administrativos digitalizados, aprovechando su entrenamiento específico en escritura hebrea y su separación por escritor para tolerar variabilidad caligráfica.
- Reproducción de experimentos de aumento de datos en HTR: al estar asociado a una semilla y a una estrategia concretas (`stroke4`, seed 42), permite replicar el resultado y compararlo con otras variantes del estudio `htr-metrics-transfer`.
- Evaluación comparativa de arquitecturas con cabecera CTC: sirve como punto de referencia para medir el impacto de CTC frente a decodificación autoregresiva en tareas de transcripción manuscrita.
- Construcción de pipelines de OCR para colecciones hebreas: puede integrarse como etapa de reconocimiento dentro de un sistema mayor que incluya detección de líneas y postprocesado lingüístico.
- Investigación sobre transferencia de métricas: el modelo aporta un CER y WER medidos bajo condiciones controladas (greedy, sin LM), útiles para estudiar cómo se transfieren las métricas entre configuraciones.
- Base para *fine-tuning* en dominios hebreos específicos: sus 87 millones de parámetros y su licencia MIT permiten ajustarlo sobre corpus propios con requisitos de cómputo moderados.

## Benchmarks y rendimiento

| Metrica | Valor | Condiciones |
|---|---|---|
| CER | 0,1069 | Test HHD Option-B, greedy, sin LM |
| WER | 0,4465 | Test HHD Option-B, greedy, sin LM |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no son aplicables a un modelo HTR.

## Requisitos de hardware

- VRAM estimada para inferencia: con 87,3 millones de parámetros, los pesos en fp32 ocupan aproximadamente 0,35 GB; en fp16, unos 0,17 GB. La VRAM real dependerá del tamaño de las imágenes de entrada y del batch.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; una RTX 3060, RTX 4090, A100 o H100 funcionarán sin problema, aunque las GPU de gama alta no aportan ventaja significativa por el reducido tamaño del modelo.
- Cabe holgadamente en GPU de consumo: GTX 1650, RTX 3050, RTX 4060 y superiores.
- Opciones de despliegue: al ser un modelo TrOCR con pesos safetensors, puede cargarse con la librería `transformers` de Hugging Face; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y estas herramientas no están orientadas a modelos visión-texto de este tipo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| cyttic/hmt-trocrctc-stroke4-s42 | 87,3 M | no disponible | he | MIT | Estudio de aumento `stroke4`, seed 42 |
| TrOCR base (Microsoft) | ~334 M | no disponible | en | MIT | Modelo HTR generalista en inglés, arquitectura de referencia |
| Otros modelos del estudio `htr-metrics-transfer` | no disponible | no disponible | he | no disponible | Variantes con otras estrategias de aumento y semillas |

La comparación con TrOCR base es la más directa por compartir familia arquitectónica, aunque el modelo de `cyttic` incorpora cabecera CTC y está especializado en hebreo. No se dispone de datos de rendimiento de las otras variantes del estudio para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Especialización extrema: solo está entrenado y etiquetado para hebreo; su uso en otros idiomas producirá resultados deficientes.
- WER elevado: un WER de 0,4465 indica que, aunque el CER es moderado (0,1069), la tasa de errores a nivel de palabra es alta, probablemente por segmentación o por palabras cortas mal transcritas.
- Evaluación sin modelo de lenguaje: los resultados reportados corresponden a decodificación voraz sin LM; en producción, añadir un LM podría mejorar el WER, pero esos números no están documentados.
- Riesgo de alucinación: como todo modelo generativo de texto, puede producir transcripciones plausibles pero incorrectas, especialmente en regiones degradadas o con caligrafía atípica.
- Sesgos de dominio: el entrenamiento sobre `hhd-optionb-split` condiciona el rendimiento a la distribución de escritores y estilos de ese corpus; la generalización a otros manuscritos no está garantizada.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene verificar los términos del dataset de origen (`hhd-optionb-split`) antes de un despliegue comercial.
- Contexto no documentado: se desconoce la longitud máxima de secuencia soportada, lo que limita la planificación de despliegues con líneas de texto muy largas.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin validación externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cyttic/hmt-trocrctc-stroke4-s42
- Dataset de entrenamiento: https://huggingface.co/datasets/cyttic/hhd-optionb-split
- TrOCR (arquitectura de referencia, Microsoft): https://huggingface.co/docs/transformers/model_doc/trocr
- Resultados del estudio (`results.json`): referenciado en la model card, no se proporciona URL directa en la información disponible.
