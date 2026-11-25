# MannasAI/pratibha-2

## Resumen

PRATIBHA-2 (anteriormente conocido como MANAS-2) es un modelo fundacional basado en transformer para el aprendizaje de representaciones de señales EEG, desarrollado por MannasAI. Con 92,8 millones de parámetros, 22 capas de transformer y embeddings de 512 dimensiones, el modelo procesa EEG muestreado a 200 Hz mediante parches de un segundo con solapamiento de 0,1 segundos y codificación posicional espaciotemporal. Su objetivo es proporcionar representaciones genéricas y reutilizables que sirvan como base para múltiples tareas downstream de neurociencia y neurotecnología, evitando entrenar un modelo desde cero para cada aplicación.

La innovación técnica central es la combinación de un autoencoder enmascarado híbrido Raw-Band (RBH), que reconstruye tanto la forma de onda como su contenido espectral, con Constrained Reconstruction (ConRec), una regularización que impone continuidad en la energía RMS local de las formas de onda reconstruidas. El preentrenamiento se realizó sobre EEG clínico sin etiquetar de fuentes internas, TUH EEG e I-CARE. Esta versión pública contiene únicamente el codificador, pensado para extracción de características y ajuste fino.

El modelo es relevante porque, según la model card, supera a todos los modelos fundacionales de EEG de código abierto incluidos en NeuralBench en el conjunto de 34 tareas "core", con un rango medio de 3,94 frente a 4,94 de LaBraM o 5,00 de REVE. Se publica bajo licencia Apache-2.0, lo que facilita su adopción tanto en investigación como en desarrollo comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (encoder) con autoencoder enmascarado híbrido Raw-Band y Constrained Reconstruction |
| Parámetros totales | 92.814.848 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa parches de 1 s a 200 Hz con solapamiento de 0,1 s; número de canales y longitud de señal variables) |
| Tipos de cuantización | no disponible (pesos en safetensors; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | en (etiqueta de idioma; el modelo procesa señales EEG, no texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (con custom_code, requiere trust_remote_code=True) |

## Arquitectura y entrenamiento

PRATIBHA-2 es un transformer de 22 capas con embeddings de 512 dimensiones que opera sobre parches temporales de un segundo de EEG a 200 Hz, con solapamiento de 0,1 segundos entre parches consecutivos. Incorpora codificación posicional espaciotemporal, de modo que el modelo conoce tanto la posición temporal del parche como la localización del electrodo en el cuero cabelludo (coordenadas en centímetros obtenidas mediante una tabla de búsqueda incluida). El número de canales y la longitud de la señal pueden variar entre entradas.

El preentrenamiento emplea enmascaramiento con reconstrucción híbrida: RBH reconstruye simultáneamente la forma de onda y su contenido espectral, mientras que ConRec regulariza la continuidad de la energía RMS local en las formas de onda reconstruidas, lo que guía al modelo hacia representaciones que preservan la estructura temporal y frecuencial del EEG. Los datos de preentrenamiento son EEG clínico sin etiquetar procedente de fuentes internas, del corpus TUH EEG y de I-CARE. No se documentan en la información disponible detalles sobre número total de tokens, composición exacta del dataset ni uso de RLHF o DPO.

## Capacidades

- Extracción de características (feature extraction) de señales EEG: devuelve tensores de forma [batch, patches, channels, 512] que pueden promediarse para obtener un embedding global por ventana.
- Aprendizaje de representaciones genéricas para ajuste fino en tareas downstream de clasificación y regresión sobre EEG.
- Procesamiento de configuraciones variables de canales y longitud de señal, con codificación posicional basada en nombres de electrodos estándar (Fz, Cz, Pz, etc.).
- Captura de características temporales y espectrales gracias al objetivo de reconstrucción híbrido (forma de onda + espectro).
- Soporte de tareas cognitivas, BCI, potenciales evocados, tareas clínicas, estados internos, sueño, fenotipado y detección de artefactos (según la evaluación en NeuralBench).
- Capacidades multilingües: no aplica (modelo de señales, no de texto).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Clasificación de etapas de sueño: el modelo alcanza un 74,23 % de balanced accuracy en la tarea de sleep stage de NeuralBench, por lo que puede integrarse en pipelines de polisomnografía para etiquetar automáticamente épocas de sueño a partir de EEG multicanal.
- Detección de patologías clínicas: con un 79,43 % de balanced accuracy en la tarea de pathology y un 70,89 % en seizure, es adecuado como extractor de características en sistemas de cribado de anomalías epileptiformes o patológicas.
- Interfaces cerebro-computador (BCI): los resultados en SSVEP (92,96 %) y c-VEP (87,06 %) lo hacen útil para decodificar intención del usuario en sistemas de comunicación asistida basados en potenciales evocados visuales.
- Monitorización de carga mental y estados internos: con un 70,09 % en workload y un 73,54 % en mental arithmetic, puede emplearse en entornos de evaluación cognitiva o interfaces adaptativas que ajusten la dificultad según la carga del usuario.
- Investigación en neurociencia cognitiva: los embeddings de 512 dimensiones por parche y canal permiten analizar correlaciones con variables conductuales, como demuestra el Pearson R de 0,706 en predicción de edad y 0,562 en tiempo de reacción.
- Detección de artefactos en EEG: con un Macro F1 de 0,550 en la tarea de artifact, puede usarse como etapa de control de calidad previa a análisis clínicos o de investigación.
- Ajuste fino para fenotipado: la balanced accuracy del 91,91 % en predicción de sexo sugiere que las representaciones capturan información biológica estable, útil para estudios poblacionales a gran escala.
- Preentrenamiento de modelos específicos con pocos datos: al ser un codificador genérico, permite congelar las capas y entrenar solo un cabezal de clasificación en dominios con datasets pequeños.

## Benchmarks y rendimiento

Resultados publicados en la model card, evaluados con NeuralBench (conjunto de 34 tareas "core"). El rango medio (average rank) es menor cuanto mejor.

| Modelo fundacional | Rango medio ↓ |
|---|---:|
| **Pratibha-2** | **3,94** |
| LaBraM | 4,94 |
| REVE | 5,00 |
| LUNA | 6,47 |
| CBraMod | 6,76 |
| BENDR | 10,71 |
| BIOT | 12,32 |

Rendimiento por tarea de Pratibha-2:

| Categoría | Tarea | Métrica | Resultado |
|---|---|---|---:|
| Cognitive | Image | Top-5 accuracy (%) | 86,12 ± 1,64 |
| Cognitive | Sentence | Top-5 accuracy (%) | 12,69 ± 0,60 |
| Cognitive | Typing | Balanced accuracy (%) | 4,66 ± 0,27 |
| Cognitive | Word | Top-5 accuracy (%) | 16,59 ± 0,83 |
| BCI | c-VEP | Balanced accuracy (%) | 87,06 ± 0,73 |
| BCI | Mental imagery | Balanced accuracy (%) | 27,54 ± 1,27 |
| BCI | Motor execution | Balanced accuracy (%) | 55,12 ± 2,40 |
| BCI | Motor imagery | Balanced accuracy (%) | 66,81 ± 0,20 |
| BCI | P300 | Balanced accuracy (%) | 66,00 ± 0,38 |
| BCI | SSVEP | Balanced accuracy (%) | 92,96 ± 0,71 |
| Evoked Responses | Audiovisual | Balanced accuracy (%) | 43,69 ± 6,19 |
| Evoked Responses | ERN | Balanced accuracy (%) | 78,14 ± 3,26 |
| Evoked Responses | LRP | Balanced accuracy (%) | 78,69 ± 1,13 |
| Evoked Responses | MMN | Balanced accuracy (%) | 58,05 ± 0,55 |
| Evoked Responses | N170 | Balanced accuracy (%) | 71,35 ± 2,82 |
| Evoked Responses | N2pc | Balanced accuracy (%) | 63,96 ± 0,67 |
| Evoked Responses | N400 | Balanced accuracy (%) | 64,83 ± 1,52 |
| Clinical | Clinical event | Macro F1 | 0,562 ± 0,024 |
| Clinical | Dementia | Balanced accuracy (%) | 42,34 ± 6,03 |
| Clinical | Depression | Balanced accuracy (%) | 88,37 ± 1,18 |
| Clinical | Parkinson's | Balanced accuracy (%) | 69,96 ± 0,49 |
| Clinical | Pathology | Balanced accuracy (%) | 79,43 ± 0,79 |
| Clinical | Schizophrenia | Balanced accuracy (%) | 67,27 ± 4,51 |
| Clinical | Seizure | Balanced accuracy (%) | 70,89 ± 0,39 |
| Internal State | Emotion | Balanced accuracy (%) | 30,21 ± 0,18 |
| Internal State | Mental arithmetic | Balanced accuracy (%) | 73,54 ± 2,63 |
| Internal State | Workload | Balanced accuracy (%) | 70,09 ± 1,80 |
| Sleep | Sleep arousal | Balanced accuracy (%) | 58,02 ± 0,72 |
| Sleep | Sleep stage | Balanced accuracy (%) | 74,23 ± 0,12 |
| Phenotyping | Age | Pearson R | 0,706 ± 0,012 |
| Phenotyping | Psychopathology | Pearson R | 0,089 ± 0,015 |
| Phenotyping | Sex | Balanced accuracy (%) | 91,91 ± 0,38 |
| Misc | Artifact | Macro F1 | 0,550 ± 0,006 |
| Misc | Reaction time | Pearson R | 0,562 ± 0,004 |

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 92,8 millones de parámetros y el repositorio ocupa 0,4 GB en safetensors. En FP32 requiere aproximadamente 0,37 GB solo para pesos; en FP16/BF16, unos 0,19 GB. La memoria adicional depende del tamaño del lote y de la longitud de la señal de entrada.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente para inferencia en FP32; una RTX 3060, RTX 4060 o superior es más que adecuada. Para lotes grandes o ajuste fino completo, se recomienda una RTX 4090, A100 o H100.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna con 4 GB o más de VRAM (GTX 1650, RTX 3050, etc.).
- Opciones de despliegue: transformers (>=4.57,<5) con trust_remote_code=True, PyTorch >=2.2 y safetensors >=0.4. No se documentan integraciones oficiales con vLLM, llama.cpp, Ollama o TGI (son herramientas orientadas a modelos de lenguaje; este modelo es de señales).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Rango medio NeuralBench ↓ | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| **Pratibha-2** | 92,8 M | Parches de 1 s a 200 Hz, canales variables | **3,94** | Apache-2.0 | Hugging Face (MannasAI) |
| LaBraM | no disponible | no disponible | 4,94 | no disponible | no disponible |
| REVE | no disponible | no disponible | 5,00 | no disponible | no disponible |
| LUNA | no disponible | no disponible | 6,47 | no disponible | no disponible |
| CBraMod | no disponible | no disponible | 6,76 | no disponible | no disponible |
| BENDR | no disponible | no disponible | 10,71 | no disponible | no disponible |
| BIOT | no disponible | no disponible | 12,32 | no disponible | no disponible |

Los datos de parámetros, contexto y licencia de los modelos comparables no se detallan en la información proporcionada; solo se dispone de su rango medio en NeuralBench.

## Limitaciones y advertencias

- El modelo es un codificador de representaciones, no un clasificador final: requiere una cabeza de tarea y ajuste fino para aplicaciones concretas.
- Requiere preprocesamiento específico: filtrado, remuestreo a 200 Hz y normalización por canal dentro de cada ventana. Un preprocesamiento incorrecto degrada las representaciones.
- Los nombres de electrodos deben coincidir con el orden de canales de la señal; la tabla de posiciones solo cubre electrodos estándar y devuelve coordenadas en centímetros.
- Rendimiento desigual entre tareas: algunas tareas muestran resultados bajos, como Typing (4,66 %), Mental imagery (27,54 %), Emotion (30,21 %) o el Pearson R de 0,089 en Psychopathology, lo que indica que no todas las representaciones son igualmente útiles.
- Posibles sesgos en los datos de preentrenamiento (TUH EEG, I-CARE y fuentes internas): la composición demográfica y clínica no está documentada, lo que puede introducir sesgos en tareas de fenotipado o clínicas.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero el modelo puede producir representaciones poco fiables en señales fuera de distribución o con artefactos severos.
- Limitaciones de idioma: la etiqueta de idioma es "en", aunque el modelo procesa señales, no texto; la documentación y el ecosistema están en inglés.
- Licencia Apache-2.0: permite uso comercial, pero el modelo se distribuye con custom_code y requiere trust_remote_code=True, lo que implica ejecutar código del autor; conviene auditar dicho código antes de usarlo en producción.
- Validación clínica: los resultados en tareas clínicas (seizure, pathology) no constituyen validación regulatoria; no debe usarse como dispositivo médico sin las certificaciones oportunas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MannasAI/pratibha-2
- Paper (arXiv): https://arxiv.org/abs/2609.13717
- Organización MannasAI: https://huggingface.co/MannasAI
- NeuralBench: https://github.com/facebookresearch/neuroai/tree/main/neuralbench-repo
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
