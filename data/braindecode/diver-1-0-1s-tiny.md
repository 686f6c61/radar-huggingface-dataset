# braindecode/DIVER-1-0.1s-tiny

## Resumen

DIVER-1-0.1s-tiny es el codificador (encoder) del modelo fundacional de electroencefalografía intracraneal (iEEG) DIVER-1, desarrollado por el proyecto DIVER (Han et al., 2025) y convertido al formato de la librería braindecode. Procesa señales de iEEG segmentadas en parches de 0,1 s a 500 Hz y cubre las modalidades SEEG, ECoG, DBS (intracraneales) y EEG de cuero cabelludo. Es la variante "tiny" y de ventana corta de la familia, con 12.660.546 parámetros (~12,7 M) y un pipeline de extracción de características.

El problema que aborda es la falta de representaciones transferibles para señales cerebrales invasivas, donde tradicionalmente cada tarea y cada paciente exigen entrenar un modelo desde cero. DIVER-1 se preentrena de forma auto-supervisada sobre 5.310 horas de ECoG y SEEG (352.000 horas-canal, aproximadamente 54 veces el volumen de preentrenamiento basado en BrainTreeBank) y después se afina para tareas concretas, como decodificación cognitiva naturalista (Neuroprobe) y detección de crisis epilépticas (MAYO). El repositorio publicado contiene únicamente el codificador preentrenado, sin cabeza de clasificación.

Su relevancia actual radica en que forma parte del primer estudio de escalado controlado (compute-aware) en preentrenamiento auto-supervisado de iEEG, con barrido de escala de datos, número de sujetos, duración de entrenamiento y tamaño de modelo hasta 1.800 millones de parámetros. La variante tiny permite experimentar con el codificador en hardware modesto, incluso en CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador tipo transformer con escalado de atención muP (`mup_attention=True`); preentrenamiento auto-supervisado con enmascaramiento (token de máscara y cabezas de reconstrucción eliminados en esta conversión) |
| Parametros totales | 12.660.546 (~12,7 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no es un contexto de tokens de texto; entrada en parches de 0,1 s a 500 Hz, con `n_times` múltiplo de 50 muestras (geometría guardada: 6 canales y 500 muestras, aunque el codificador no depende de ella) |
| Tipos de cuantizacion | no disponible (pesos en float32; la conversión parte de bfloat16 y pasa a float32) |
| Idiomas soportados | no disponible (modelo de señal, no lingüístico) |
| Licencia | MIT para los pesos (DIVER Project); el código de braindecode es BSD-3-Clause |
| Formato de pesos | safetensors (compatible con `pytorch_model_hub_mixin`) |

## Arquitectura y entrenamiento

El modelo es un codificador basado en transformer que procesa señales de iEEG segmentadas en parches de 0,1 s a 500 Hz. Emplea escalado de atención muP (Maximal Update Parametrization), una técnica que estabiliza el entrenamiento y facilita la transferencia de hiperparámetros entre distintas escalas de modelo. El preentrenamiento es auto-supervisado: incluye un token de enmascaramiento y cabezas de reconstrucción que forman parte del pipeline original, pero que se eliminan en la conversión a braindecode, de modo que el repositorio solo contiene el codificador.

En cuanto a los datos, el preentrenamiento de las dos variantes publicadas (DIVER-1-0.1s y DIVER-1-1s) abarca 5.310 horas de ECoG y SEEG, equivalentes a 352.000 horas-canal, unas 54 veces el volumen de preentrenamiento basado en BrainTreeBank. El estudio realiza un barrido de escalado controlado sobre escala de datos, número de sujetos, duración del entrenamiento y tamaño de modelo, hasta 1.800 millones de parámetros, y evalúa los resultados en Neuroprobe (decodificación cognitiva naturalista) y MAYO (detección de crisis). La información disponible no detalla si se aplicaron RLHF o DPO, algo que, por otra parte, no es habitual en un codificador de señal.

## Capacidades

- Extracción de características (feature extraction) de señales de iEEG en modalidades SEEG, ECoG y DBS (intracraneales) y EEG de cuero cabelludo.
- Acepta las posiciones de electrodos en `chs_info` (en metros, como en MNE); el tipo de canal determina la modalidad procesada.
- El codificador es independiente de la geometría guardada (6 canales, 500 muestras): permite cargar un montaje propio, `n_times` y `n_outputs`.
- Reproduce las características del codificador oficial con diferencia 0,0e+00 en float32 sobre CPU, tanto para canales intracraneales como de cuero cabelludo.
- No incluye cabeza de clasificación: braindecode la inicializa al cargar, por lo que el uso directo requiere fine-tuning según el protocolo del paper (`scripts/finetune_neuroprobe.sh`).
- No soporta generación de texto, tool calling, razonamiento multi-paso ni uso como agente; no es un modelo lingüístico.
- Capacidades multilingües: no aplica.

## Casos de uso

- Detección de crisis epilépticas: partiendo del codificador preentrenado y afinándolo sobre datos tipo MAYO, se puede clasificar cada segmento de iEEG como crisis o no crisis; el paper sitúa la variante DIVER-1-1s en el mejor AUROC de MAYO, lo que respalda el enfoque de transferencia.
- Decodificación cognitiva naturalista: integrar el codificador en el pipeline de Neuroprobe y afinar una cabeza de regresión o clasificación para predecir variables cognitivas a partir de ECoG/SEEG durante tareas naturalistas.
- Representaciones para interfaces cerebro-computador (BCI): usar el codificador congelado para generar embeddings de ventanas de iEEG y alimentar con ellos clasificadores ligeros, reduciendo el coste frente a entrenar un modelo completo por paciente.
- Investigación en neurociencia de poblaciones: extraer embeddings de grabaciones intracraneales para análisis de dinámica poblacional y comparación entre regiones o sujetos.
- EEG de cuero cabelludo: al aceptar canales EEG (scalp), el modelo puede emplearse en tareas no invasivas; conviene tener en cuenta que el preentrenamiento es mayoritariamente intracraneal y la transferencia puede ser menor.
- Baseline en benchmarks de señales: sirve como arquitectura de referencia dentro de braindecode para comparar contra otros de los más de 65 modelos publicados en la librería.
- Despliegue con recursos limitados: con 12,7 M de parámetros y un repositorio de 0,1 GB, la inferencia es viable en CPU, lo que facilita prototipado y validación sin GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos para esta variante concreta en la información disponible. El paper asociado evalúa DIVER-1 en dos benchmarks retenidos (Neuroprobe para decodificación cognitiva naturalista y MAYO para detección de crisis) y señala que DIVER-1-1s alcanza el mejor AUROC en MAYO, pero no se proporcionan las cifras concretas en el material disponible. La única métrica de fidelidad documentada es la equivalencia de características del codificador en float32 sobre CPU con el modelo oficial (diferencia 0,0e+00).

## Requisitos de hardware

- Tamaño del modelo: 12.660.546 parámetros en float32, aproximadamente 50,6 MB de pesos (el repositorio ocupa 0,1 GB).
- Cabe en cualquier GPU de consumo e incluso en CPU; no requiere aceleradores de gama alta.
- GPU recomendadas: no se especifican en la información disponible; por tamaño, cualquier GPU moderna (por ejemplo, RTX 3060 o superior) es suficiente, aunque no hay datos de rendimiento publicados.
- Opciones de despliegue: braindecode (PyTorch) con `DIVER1.from_pretrained` y `pytorch_model_hub_mixin`; pesos en safetensors.
- La validación de equivalencia se realizó en float32 sobre CPU; no se garantiza la precisión en kernels de GPU ni en precisión mixta.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Parcheo / ventana | Preentrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DIVER-1-0.1s-tiny (este) | 12,7 M | 0,1 s a 500 Hz | 5.310 h de ECoG y SEEG (352k horas-canal) | MIT (pesos) | HuggingFace (braindecode) |
| DIVER-1-1s | no disponible | 1 s | 5.310 h de ECoG y SEEG (misma base) | MIT (pesos) | Repositorio del proyecto DIVER |
| Variantes DIVER-1 de mayor tamaño | hasta 1,8 B (en el barrido de escalado) | no disponible | misma base, mayor escala | no disponible | no disponible |

No se dispone de datos de benchmarks comparables entre variantes ni con otros modelos fundacionales de EEG (por ejemplo, los más de 65 modelos incluidos en braindecode) en la información consultada.

## Limitaciones y advertencias

- El repositorio contiene solo el codificador: no hay cabeza de clasificación y se necesita fine-tuning para cualquier tarea supervisada.
- La verificación de equivalencia cubre únicamente las características del codificador en float32 sobre CPU; no garantiza precisión downstream, ni el comportamiento en kernels de GPU o precisión mixta.
- Requiere remuestrear la señal a 500 Hz y que `n_times` sea múltiplo de 50 muestras.
- Es necesario proporcionar las posiciones de electrodos en `chs_info` con el montaje correcto.
- El preentrenamiento se apoya mayoritariamente en señales intracraneales (SEEG, ECoG, DBS); el rendimiento en EEG de cuero cabelludo no está cuantificado y podría ser inferior.
- Posible generalización limitada a poblaciones, equipos de adquisición y protocolos poco representados en los datos de preentrenamiento.
- Sesgos conocidos: no disponible.
- Riesgo de alucinación: no aplica, ya que el modelo no es generativo.
- Licencia MIT para los pesos, lo que permite uso comercial, pero el código de braindecode se distribuye bajo BSD-3-Clause y conviene respetar ambas condiciones.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validación externa por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/braindecode/DIVER-1-0.1s-tiny
- Paper (arXiv): https://arxiv.org/abs/2512.19097
- PDF del paper: https://arxiv.org/pdf/2512.19097
- Repositorio del proyecto DIVER-1: https://github.com/DIVER-Project/DIVER-1/tree/25638eb38ef297b582ab79ae1c96260f57c155b3
- Carpeta de Google Drive con los pesos originales: https://drive.google.com/drive/folders/1Wmv36jifjE0Jj6noGOFFsqRzK-4xnj1b
- Documentación de `braindecode.models.DIVER1`: https://braindecode.org/stable/generated/braindecode.models.DIVER1.html
- Documentación de braindecode: https://braindecode.org/stable/index.html
- Repositorio de braindecode: https://github.com/braindecode/braindecode
- Demo Model Explorer: https://huggingface.co/spaces/braindecode/model-explorer
