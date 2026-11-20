# braindecode/pratibha2-pretrained

## Resumen

PRATIBHA-2 (anteriormente MANAS-2) es un modelo fundacional para electroencefalografía (EEG) desarrollado por MannasAI y empaquetado para la librería braindecode. Se trata de un encoder transformer denso de 92,9 millones de parámetros, preentrenado con un esquema de masked autoencoding híbrido raw-band y reconstrucción restringida (Constrained Reconstruction). El modelo resuelve el problema de la escasez de datos etiquetados en EEG clínico: al preentrenarse sobre grandes volúmenes de señales sin etiquetar, produce representaciones (features) transferibles a tareas downstream como clasificación de patologías, detección de eventos o decodificación de estados cognitivos.

Este repositorio concreto no contiene el modelo completo original, sino únicamente el encoder convertido a los nombres de parámetros de braindecode 2.1, de modo que puede cargarse directamente con `braindecode.models.Pratibha2.from_pretrained`. La cabeza de clasificación no forma parte de la release y debe sustituirse o reentrenarse. Es relevante ahora porque estandariza el acceso a un modelo fundacional de EEG dentro del ecosistema braindecode, facilitando su uso en pipelines de investigación y en aplicaciones clínicas reproducibles.

El modelo opera sobre EEG muestreado a 200 Hz con ventanas de al menos 200 muestras (parches de 1 s con 0,1 s de solapamiento) y una salida de features de dimensión 512. La licencia es Apache-2.0, lo que permite uso comercial con atribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (encoder) con masked autoencoding híbrido raw-band |
| Parametros totales | 92.879.746 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; ventanas de al menos 200 muestras a 200 Hz (parches de 1 s, solapamiento 0,1 s) |
| Tipos de cuantizacion | no disponible (pesos en float32; safetensors) |
| Idiomas soportados | no aplica (modelo de señales EEG, no de texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (PyTorch; librería braindecode) |

## Arquitectura y entrenamiento

El modelo es un transformer de atención densa (no MoE, no SSM) configurado como encoder de un esquema de masked autoencoding. La innovación principal es el preentrenamiento con Raw-Band Hybrid masked autoencoding combinado con Constrained Reconstruction: se enmascaran porciones de la señal EEG tanto en el dominio temporal crudo como en bandas de frecuencia, y el modelo debe reconstruirlas bajo restricciones, lo que según los autores (Kulkarni et al., 2026) mejora la calidad de las representaciones frente a un enmascarado puramente temporal.

Los datos de preentrenamiento son EEG clínico sin etiquetar procedente de TUH EEG, I-CARE y fuentes internas de los autores (estas últimas privadas, no liberadas ni listadas en los metadatos del dataset). El modelo acepta canales posicionados por nombre mediante una tabla de electrodos que combina el banco de posiciones de REVE con las posiciones propias `AFZ` e `IZ`; braindecode resuelve alias como `T3`, `EEG Fp1-REF` y pares bipolares `A-B`. Cada canal se normaliza con z-score dentro de cada ventana, de modo que la escala (voltios o microvoltios) no afecta a la salida. La conversión desde los pesos originales renombra parámetros (`encoder.layers.N.ffn` → `encoder.blocks.N.mlp`, `attn.qkv_proj` → `attn.qkv`), divide la proyección fusionada `ffn.in_proj` en `mlp.fc1` y `mlp.fc_gate`, y elimina la matriz constante `pos_enc.freq_matrix`, que se reconstruye. No se modificó ningún valor: la salida es idéntica bit a bit a la de los pesos originales en CPU y float32.

## Capacidades

- Extracción de representaciones (features) de señales EEG: salida de vector de 512 dimensiones por ventana mediante `return_features=True`.
- Generación de tokens internos del encoder para tareas de reconstrucción o análisis intermedio.
- Adaptación a clasificación downstream mediante fine-tuning o linear probing (la cabeza de clasificación no viene incluida).
- Procesamiento de montajes arbitrarios: acepta cualquier montaje que la tabla de posiciones pueda resolver, no solo el de 19 canales 10-20 almacenado en `config.json`.
- Robustez a escala de entrada: la normalización z-score interna hace equivalente la entrada en voltios y microvoltios.
- Soporte de canales bipolares y alias de nombres de electrodo resueltos por braindecode.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto: es un modelo específico de EEG.

## Casos de uso

- Detección de anomalías epileptiformes: el encoder preentrenado se afina con una cabeza de clasificación binaria sobre ventanas de 1 s para identificar descargas epileptiformes; el preentrenamiento sobre TUH EEG (que incluye registros con patología) proporciona representaciones sensibles a este tipo de eventos.
- Clasificación de estados de sueño: con ventanas de 200 muestras a 200 Hz se pueden construir clasificadores de estadios (vigilia, N1, N2, N3, REM) mediante linear probing sobre los features de 512 dimensiones, reduciendo la necesidad de grandes conjuntos etiquetados.
- Monitorización de carga cognitiva o fatiga en interfaces cerebro-computador: las representaciones del encoder sirven como entrada a clasificadores ligeros en tiempo casi real, dado el bajo coste computacional de un modelo de 92,9 M de parámetros.
- Detección de artefactos en EEG: fine-tuning para distinguir segmentos limpios de segmentos contaminados por parpadeos, movimiento o ruido muscular, aprovechando la reconstrucción restringida aprendida en el preentrenamiento.
- Investigación en biomarkers: extracción de features para análisis estadístico o modelos predictivos en estudios longitudinales, con la ventaja de que el encoder acepta montajes heterogéneos entre cohortes.
- Base para modelos multimodales EEG: uso del encoder como rama de señal en arquitecturas que combinen EEG con otras modalidades (por ejemplo, vídeo o texto en experimentos de percepción), congelando el encoder y entrenando solo las cabezas.
- Reproducibilidad de benchmarks: al ser una conversión bit a bit de los pesos originales, permite replicar resultados de MANAS-2 dentro de pipelines braindecode sin depender del código original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4 GB en float32 para los pesos (92,9 M de parámetros), más activaciones; en la práctica cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: cualquier GPU moderna es suficiente; para entrenamiento de fine-tuning se recomienda al menos una RTX 3090/4090 o una A100/H100 si se procesan lotes grandes o múltiples tareas en paralelo.
- Cabe en GPU consumer: sí, en cualquier GPU con 4-8 GB de VRAM (GTX 1660, RTX 3060, RTX 4060, etc.), e incluso en CPU para inferencia en float32.
- Opciones de despliegue: la vía nativa es braindecode con PyTorch (`braindecode.models.Pratibha2.from_pretrained`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada; el tamaño reducido del modelo sugiere latencias bajas, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PRATIBHA-2 (este) | 92,9 M | ventanas ≥200 muestras a 200 Hz | EEG | Apache-2.0 | Hugging Face (encoder en braindecode) |
| MannasAI/pratibha-2 (original) | no disponible | no disponible | EEG | Apache-2.0 | Hugging Face |
| Otros modelos fundacionales de EEG | no disponible | no disponible | EEG | no disponible | no disponible |

No se dispone en la información proporcionada de datos de rendimiento ni de especificaciones de modelos comparables de la misma categoría, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- La cabeza de clasificación (`final_layer`, con `n_outputs=2` en `config.json`) no forma parte de la release: es una inicialización por defecto de PyTorch bajo `torch.manual_seed(0)`. Es obligatorio afinarla o hacer linear probing antes de cualquier uso predictivo.
- El `config.json` almacena un montaje de 19 canales 10-20; para otros montajes hay que pasar `chs_info` explícitamente.
- El modelo está entrenado para EEG a 200 Hz; otras frecuencias de muestreo requerirán remuestreo previo.
- Los datos internos de preentrenamiento son privados y no se han liberado, lo que limita la reproducibilidad completa del preentrenamiento y la evaluación de sesgos de dominio.
- Riesgo de sesgo hacia las poblaciones y centros clínicos presentes en TUH EEG, I-CARE y las fuentes internas; el rendimiento puede degradarse en cohortes con características distintas.
- No es un modelo generativo de texto ni multimodal en el sentido habitual: no admite tool calling, agentes ni razonamiento multi-paso.
- Aunque la licencia Apache-2.0 permite uso comercial, se debe citar el artículo de Kulkarni et al. (2026) y conservar el aviso de licencia.
- No se han publicado benchmarks en la información disponible, por lo que no es posible validar empíricamente el rendimiento frente a alternativas.

## Enlaces

- Hugging Face: https://huggingface.co/braindecode/pratibha2-pretrained
- Modelo original: https://huggingface.co/MannasAI/pratibha-2
- Documentación de braindecode para Pratibha2: https://braindecode.org/stable/generated/braindecode.models.Pratibha2.html
- Paper: Kulkarni et al., "MANAS-2: Constrained Reconstruction for EEG Foundation Models", arXiv:2609.13717 (https://arxiv.org/abs/2609.13717)
