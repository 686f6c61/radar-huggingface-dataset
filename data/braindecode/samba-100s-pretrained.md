# braindecode/samba-100s-pretrained

## Resumen

SAMBA-100s es un modelo fundacional para electroencefalografía (EEG) desarrollado por J. Hong, G. Mackellar y S. Ghane, presentado en NeurReps 2026. El checkpoint publicado en `braindecode/samba-100s-pretrained` es la conversión del encoder original (publicado por Dcode-AI) a la librería braindecode 2.1, con los nombres de parámetros adaptados y el decodificador de reconstrucción eliminado. Se trata de un modelo de representación (encoder) que aprende embeddings generales de señales EEG, no de un clasificador listo para producción.

La arquitectura combina un embedding espacial guiado por coordenadas (CDSE, coordinate-driven spatial embedding) que codifica la posición física de cada electrodo, con bloques Mamba-2 diferenciales para modelar la dimensión temporal. Se preentrenó mediante reconstrucción enmascarada con un encoder-decodificador en forma de U sobre ventanas de 100 s (12.800 muestras a 128 Hz) del corpus TUAB (Temple University Hospital Abnormal EEG Corpus), con 16 canales bipolares.

Su relevancia estriba en que propone un enfoque alternativo a los transformers para EEG: modela secuencias largas con complejidad lineal gracias a Mamba-2 y generaliza entre montajes de electrodos distintos mediante posiciones 3D. El modelo solo pesa 391.987 parámetros, lo que lo hace extremadamente ligero para fine-tuning y linear probing en tareas de clasificación EEG.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder U-shaped con embedding espacial CDSE y bloques Mamba-2 diferenciales |
| Parametros totales | 391.987 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventanas de 12.800 muestras (100 s a 128 Hz); acepta cualquier ventana de al menos 8 muestras |
| Tipos de cuantizacion | no disponible (pesos float32) |
| Idiomas soportados | no disponible (modelo de señales EEG, no de texto) |
| Licencia | other |
| Formato de pesos | safetensors (float32, 178 tensores del encoder) |

## Arquitectura y entrenamiento

El modelo sigue un esquema encoder-decodificador en forma de U durante el preentrenamiento, pero el checkpoint distribuido contiene únicamente el encoder. La entrada EEG pasa por un embedding espacial guiado por coordenadas (CDSE) que proyecta la posición 3D de cada electrodo (en el sistema de referencia de la plantilla `colin27_1005` de MNE) en un espacio latente, lo que permite mapear montajes distintos sobre los 94 electrodos objetivo. La dimensión temporal se procesa con bloques Mamba-2 diferenciales, que ofrecen modelado de secuencias largas con complejidad lineal frente a la atención cuadrática de un transformer.

El preentrenamiento se realizó por reconstrucción enmascarada sobre 100 s de señal (12.800 muestras a 128 Hz) del corpus TUAB, con 16 canales bipolares, tras un filtrado band-pass de 0.5-45 Hz. La normalización aplicada fue dividir cada canal de cada ventana por el percentil 95 de su valor absoluto; el modelo `SAMBA` de braindecode no normaliza internamente, por lo que ese preprocesado debe replicarse. No se dispone de información sobre número total de tokens de entrenamiento, composición completa del dataset ni uso de RLHF/DPO (no aplicable a un modelo de señales).

## Capacidades

- Extracción de representaciones (embeddings) de señales EEG: la salida `features` es la media y la desviación típica temporal de la salida del encoder, de dimensión `(batch, 2 * 128)`.
- Adaptación a montajes arbitrarios: cualquier conjunto de electrodos con posiciones 3D se mapea sobre los 94 electrodos objetivo del checkpoint.
- Procesamiento de ventanas largas: lee ventanas de 100 s (12.800 muestras) y cualquier longitud de al menos 8 muestras (el encoder produce `n_times // 8` pasos).
- Base para fine-tuning y linear probing en tareas de clasificación EEG (por ejemplo, detección de anomalías o patología).
- No incluye cabeza de clasificación: `from_pretrained` construye una nueva con inicialización por defecto de PyTorch para el `n_outputs` indicado.
- No soporta tool calling, function calling, agentes, generación de texto ni capacidades multimodales de visión o audio.

## Casos de uso

- Detección de anomalías en EEG clínico: fine-tuning del encoder sobre TUAB o datasets compatibles para clasificar registros normales frente a anormales, aprovechando que las features ya capturan estructura temporal y espacial de 100 s de señal.
- Linear probing para evaluación rápida: congelar el encoder y entrenar solo una regresión logística sobre las features `(batch, 256)` para validar la calidad de las representaciones antes de invertir en fine-tuning completo.
- Transferencia entre montajes: usar el modelo con un subconjunto de electrodos del sistema 10-20 (por ejemplo, 19 canales) y mapearlos sobre los 94 objetivo, útil cuando el dataset de destino no dispone de montaje completo.
- Preprocesado en pipelines de investigación: integrar el encoder como extractor de features en un pipeline de braindecode/MNE para tareas downstream (detección de crisis, sueño, artefactos) con ventanas de hasta 100 s.
- Modelado de secuencias EEG largas: aprovechar los bloques Mamba-2 para tareas que requieren contexto temporal extenso sin el coste cuadrático de un transformer.
- Base para modelos fundacionales especializados: partir de este checkpoint ligero (391.987 parámetros) para experimentos de preentrenamiento o adaptación a dominios EEG distintos (por ejemplo, otros corpus hospitalarios).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB con pesos float32 (391.987 parámetros), holgado incluso en GPUs de gama baja.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es suficiente; A100/H100 solo necesarias para entrenamiento a gran escala o batches muy grandes.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 2 GB de VRAM.
- Opciones de despliegue: librería braindecode (PyTorch) mediante `SAMBA.from_pretrained`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo de señales).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SAMBA-100s (este) | 391.987 | 12.800 muestras (100 s) | Embeddings EEG | other | Hugging Face (braindecode, Dcode-AI) |
| Alternativas EEG fundacionales | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos sobre modelos comparables de la misma categoria (modelos fundacionales EEG) que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- No es un clasificador listo para usar: el checkpoint no contiene cabeza de clasificación; es necesario fine-tuning o linear probing antes de cualquier uso predictivo.
- Requiere preprocesado específico: señal a 128 Hz, normalización por percentil 95 del valor absoluto por canal y ventana, y filtrado band-pass 0.5-45 Hz coherente con el preentrenamiento.
- Dependencia del sistema de referencia: las posiciones de electrodos deben expresarse en el marco de la plantilla `colin27_1005` de MNE; usar `raw.set_montage` introduce desviaciones de hasta 5,7 cm y degrada el mapeo espacial.
- Sesgo de dominio: el preentrenamiento usó TUAB, y los propios autores señalan que las tareas de patología comparten ese dominio; el rendimiento fuera de TUAB no está caracterizado.
- Licencia "other": no se especifican en la información disponible los términos exactos para uso comercial; conviene consultar la licencia del repositorio original Dcode-AI/SAMBA-100s antes de desplegar en producción.
- Riesgo de alucinación: no aplicable en el sentido de generación de texto, pero las representaciones pueden producir predicciones espurias si la señal de entrada no cumple el preprocesado esperado.
- Idiomas: no aplicable; el modelo procesa señales EEG, no texto.

## Enlaces

- Hugging Face (este checkpoint): https://huggingface.co/braindecode/samba-100s-pretrained
- Repositorio original de pesos: https://huggingface.co/Dcode-AI/SAMBA-100s
- Paper: https://arxiv.org/abs/2511.18571
- Codigo: https://github.com/Jiazhen-Hong/SAMBA
- Documentacion braindecode del modelo: https://braindecode.org/stable/generated/braindecode.models.SAMBA.html
- Ejemplo de carga de modelos preentrenados en braindecode: https://braindecode.org/stable/_downloads/53a59ea1d06acee36d30fedeab79e4bd/plot_load_pretrained_models.py
