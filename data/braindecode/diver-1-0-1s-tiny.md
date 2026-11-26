# braindecode/DIVER-1-0.1s-tiny

## Resumen

DIVER-1-0.1s-tiny es el encoder de un modelo fundacional para electroencefalografía intracraneal (iEEG), desarrollado por el DIVER Project y publicado por primera vez en Han et al. (2025) bajo el título "DIVER-1: Scaling intracranial EEG foundation models for transferable representations". La versión alojada en Hugging Face es un port a la librería Braindecode, que expone el encoder como `braindecode.models.DIVER1` con pesos en safetensors y float32, listo para extracción de características y ajuste fino supervisado.

Se trata de un modelo pequeño (12,66 millones de parámetros) que procesa parches de 0,1 segundos muestreados a 500 Hz, pensado para señales intracraneales (sEEG, ECoG, DBS) y también escalares (EEG). Su relevancia radica en que traslada el paradigma de los modelos fundacionales al dominio de las neuroseñales clínicas: en lugar de entrenar un decodificador desde cero para cada paciente y cada tarea, se parte de un encoder preentrenado sobre miles de horas de registros y se ajusta con pocos datos.

Este checkpoint concreto es el más ligero de la familia DIVER-1 (variante "tiny") y está pensado para experimentación rápida, validación de pipelines y despliegue en entornos con recursos limitados. No incluye cabeza de clasificación: el usuario debe añadirla y ajustarla según la tarea downstream.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder transformer para iEEG (DIVER-1), parches de 0,1 s a 500 Hz, atención con escalado muP (`mup_attention=True`) |
| Parámetros totales | 12.660.546 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en número de tokens; la ventana de entrada se define por `n_times` (múltiplo de 50 muestras a 500 Hz; geometría guardada: 6 canales × 500 muestras) |
| Tipos de cuantización | no disponible (pesos publicados en float32; el original estaba en bfloat16) |
| Idiomas soportados | no aplica (señales fisiológicas, no texto) |
| Licencia | MIT (pesos, DIVER Project); el código de Braindecode es BSD-3-Clause |
| Formato de pesos | safetensors (más `pytorch_model_hub_mixin` para carga vía `from_pretrained`) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer que tokeniza la señal iEEG en parches de 0,1 segundos a una frecuencia de muestreo de 500 Hz (50 muestras por parche), condicionado por la geometría de electrodos (posiciones en metros, como en MNE) y por el tipo de canal, que determina la modalidad: SEEG, ECoG y DBS se tratan como intracraneales, mientras que EEG se trata como escalar. La atención utiliza escalado muP, una elección que busca estabilizar el entrenamiento y la transferencia entre configuraciones de tamaño y montaje. El encoder no depende de una geometría fija: la guardada es de 6 canales y 500 muestras, pero al cargar se puede pasar un montaje propio, `n_times` y `n_outputs` distintos.

El preentrenamiento se realizó sobre un corpus exclusivamente iEEG (denominado DIVER I) de 37 sujetos, 5.310 horas y 352.000 horas-canal. De ellas, 4.028 horas (aproximadamente el 76 %) provienen de un conjunto privado recogido por los autores: ECoG/sEEG de larga duración de 25 pacientes con epilepsia farmacorresistente, unos 7 días por paciente a 2 kHz, con aprobación de comité de ética y en varios centros. El resto procede de AJILE12 (Peterson et al., 2022; 12 sujetos; DANDI 000055), disponible en NEMAR como `nm000358`. El checkpoint publicado es solo el encoder: se han eliminado el token de máscara y las cabezas de reconstrucción usadas durante el preentrenamiento, y los tensores bfloat16 se han convertido a float32. El script `convert_diver1_weights.py` del repositorio reproduce la conversión, y las características del encoder coinciden con el modelo oficial con un error de 0,0e+00 en float32 sobre CPU, tanto para canales intracraneales como escalares.

## Capacidades

- Extracción de características (feature extraction) de señales iEEG y EEG: produce representaciones latentes por ventana de señal, reutilizables como entrada para clasificadores, regresores o modelos posteriores.
- Procesamiento de señales intracraneales en tres modalidades (SEEG, ECoG, DBS) y de EEG de cuero cabelludo, con la modalidad determinada por el tipo de canal en `chs_info`.
- Acepta montajes arbitrarios: el número de canales y la longitud de ventana se configuran en la carga (`chs_info`, `n_times`), no están fijados por los pesos.
- Ajuste fino supervisado para tareas downstream (el protocolo del artículo usa `scripts/finetune_neuroprobe.sh`), con la cabeza de clasificación inicializada por Braindecode.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: no es un modelo de lenguaje.
- No dispone de modo "thinking", visión, audio ni capacidades multilingües.
- No incluye cabeza de clasificación en el release: la clasificación requiere entrenamiento adicional.

## Casos de uso

- Decodificación de intención motora en interfaces cerebro-máquina: el encoder preentrenado sobre iEEG de larga duración puede ajustarse con pocos ensayos por paciente para predecir movimiento o intención a partir de ECoG, reduciendo el tiempo de calibración frente a entrenar desde cero.
- Detección y predicción de crisis epilépticas: las representaciones del encoder, entrenadas en parte sobre registros de pacientes con epilepsia farmacorresistente, sirven como base para clasificadores de estado ictal/interictal o de pre-ictal, con ajuste fino sobre los registros del centro.
- Investigación en neurociencia cognitiva: extracción de embeddings de ventanas de 0,1 s para análisis de correlación con estímulos, comportamiento o variables clínicas, aprovechando que el modelo no depende de un montaje concreto.
- Transferencia entre modalidades: usar el mismo encoder para sEEG, ECoG y EEG escalar, lo que facilita protocolos que combinan registros intracraneales y de cuero cabelludo en un mismo estudio.
- Prototipado rápido y validación de pipelines: con 12,7 M de parámetros y 0,1 GB de repositorio, permite iterar sobre preprocesado, montajes y estrategias de ajuste fino en CPU o en una GPU de gama media antes de escalar a variantes mayores.
- Sistemas de monitorización neurológica en investigación clínica: integración del encoder en pipelines de registro continuo (por ejemplo, datos tipo AJILE12) para generar características en tiempo casi real y alimentar detectores de eventos.
- Benchmarking de modelos fundacionales de neuroseñales: al ser un port verificado numéricamente contra el modelo oficial, sirve como referencia reproducible para comparar arquitecturas y estrategias de preentrenamiento en iEEG.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo documenta la equivalencia numérica del encoder con el modelo oficial (diferencia de 0,0e+00 en float32 sobre CPU) y remite al protocolo de ajuste fino del artículo (`scripts/finetune_neuroprobe.sh`) para la evaluación downstream, sin cifras en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 12,66 M de parámetros en float32, los pesos ocupan aproximadamente 50 MB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer y en CPU.
- GPU recomendadas: no se especifican en la información disponible; por tamaño, cualquier GPU con al menos 2-4 GB de memoria libre es suficiente (RTX 3060, RTX 4090, A100, H100). El ajuste fino con lotes grandes y ventanas largas requiere más memoria, no cuantificada en la documentación.
- Cabe en GPU consumer: sí, con amplio margen; también en CPU para inferencia en float32 (la equivalencia numérica documentada se verificó en CPU).
- Opciones de despliegue: la vía documentada es la librería Braindecode (`DIVER1.from_pretrained`), con PyTorch como backend. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Modalidad | Contexto / ventana | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DIVER-1-0.1s-tiny (este) | 12,66 M | iEEG (sEEG, ECoG, DBS) y EEG | parches de 0,1 s a 500 Hz; `n_times` configurable múltiplo de 50 | MIT (pesos) | Hugging Face vía Braindecode |
| Otras variantes de DIVER-1 | no disponible en la información | iEEG | no disponible | MIT (pesos) | Repositorio DIVER-Project/DIVER-1 |
| Alternativas de modelos fundacionales de EEG/iEEG | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de parámetros, contexto, rendimiento ni licencia de modelos comparables de la misma categoría, por lo que la comparativa cuantitativa queda como no disponible.

## Limitaciones y advertencias

- El release contiene únicamente el encoder: no hay cabeza de clasificación, y Braindecode la inicializa al cargar, por lo que es imprescindible ajuste fino para cualquier tarea supervisada.
- La verificación de equivalencia con el modelo oficial cubre solo características del encoder en float32 sobre CPU, para canales intracraneales y escalares; no cubre precisión downstream, kernels de GPU ni precisión mixta.
- El corpus de preentrenamiento es mayoritariamente privado (4.028 de 5.310 horas, unos 25 pacientes con epilepsia farmacorresistente), lo que limita la reproducibilidad completa del preentrenamiento y puede introducir sesgo hacia esa población clínica y esos centros.
- El modelo está entrenado sobre señales de pacientes con epilepsia y registros de investigación; su generalización a otras poblaciones, edades o patologías no está documentada.
- `n_times` debe ser múltiplo de 50; la señal debe remuestrearse a 500 Hz y las posiciones de electrodo pasarse en `chs_info` en metros (formato MNE). Un preprocesado incorrecto invalida las representaciones.
- Riesgo de alucinación: no aplica en el sentido de modelos de lenguaje, pero sí existe riesgo de predicciones espurias fuera de distribución en tareas downstream.
- Licencia MIT para los pesos, lo que permite uso comercial; el código de Braindecode es BSD-3-Clause. Debe citarse el artículo original, los datasets (AJILE12, DANDI 000055) y el software Braindecode (DOI 10.5281/zenodo.17699192).
- Uso clínico: no se documenta validación regulatoria ni certificación; cualquier aplicación clínica requeriría validación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/braindecode/DIVER-1-0.1s-tiny
- Artículo (arXiv): https://arxiv.org/abs/2512.19097
- Repositorio original DIVER-1: https://github.com/DIVER-Project/DIVER-1/tree/25638eb38ef297b582ab79ae1c96260f57c155b3
- Documentación de `braindecode.models.DIVER1`: https://braindecode.org/stable/generated/braindecode.models.DIVER1.html
- Repositorio de Braindecode: https://github.com/braindecode/braindecode
- Cita de Braindecode en Zenodo: https://doi.org/10.5281/zenodo.17699192
- Dataset AJILE12 en NEMAR: https://nemar.org/dataset/nm000358
- Dataset AJILE12 en DANDI: https://dandiarchive.org/dandiset/000055
- Carpeta de Google Drive con los pesos originales: https://drive.google.com/drive/folders/1Wmv36jifjE0Jj6noGOFFsqRzK-4xnj1b
