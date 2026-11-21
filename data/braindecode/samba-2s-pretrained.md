# braindecode/samba-2s-pretrained

## Resumen

SAMBA-2s (pretrained encoder) es un checkpoint del modelo fundacional de EEG SAMBA, publicado por el equipo de braindecode como conversión directa de los pesos originales de Dcode-AI/SAMBA-2s. Se trata de un codificador diseñado para señales electroencefalográficas que combina un embedding espacial guiado por coordenadas de electrodos con bloques diferenciales de Mamba-2 para modelar la dimensión temporal. El modelo fue preentrenado mediante reconstrucción enmascarada con una arquitectura encoder-decoder en forma de U sobre ventanas de 2 segundos (256 muestras a 128 Hz).

La relevancia de este checkpoint radica en que permite cargar directamente en braindecode 2.1 los pesos preentrenados de SAMBA sin necesidad de reimplementar la arquitectura original, facilitando el fine-tuning y el linear probing sobre tareas EEG downstream. El modelo base procede del trabajo de Hong, Mackellar y Ghane presentado en NeurReps 2026 (arXiv:2511.18571) y está pensado como punto de partida para clasificación de señales cerebrales, no como modelo listo para producción sin ajuste.

El checkpoint contiene únicamente el codificador (178 tensores float32, sin cabeza de clasificación ni decodificador de reconstrucción), con un total de 391.987 parámetros. La montaje por defecto cubre 94 electrodos objetivo y el modelo acepta cualquier ventana de al menos 8 muestras, aunque fue preentrenado con ventanas de 256 muestras.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder U-shaped con bloques diferenciales Mamba-2 y embedding espacial guiado por coordenadas (CDSE) |
| Parametros totales | 391.987 (solo codificador) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventanas de 256 muestras (2 s a 128 Hz) en preentrenamiento; acepta cualquier ventana de al menos 8 muestras |
| Tipos de cuantizacion | no disponible (pesos en float32) |
| Idiomas soportados | no aplica (modelo de señales EEG, no de texto) |
| Licencia | other |
| Formato de pesos | safetensors (float32), cargable con PyTorch y braindecode |

## Arquitectura y entrenamiento

SAMBA es un modelo fundacional para EEG que sustituye la atención de los transformers por bloques diferenciales de Mamba-2, lo que le permite procesar secuencias temporales largas con coste lineal. La componente espacial se resuelve mediante un embedding guiado por coordenadas (CDSE, coordinate-driven spatial embedding) que incorpora las posiciones físicas de los electrodos en el espacio del template `colin27_1005` de MNE, de modo que el modelo puede generalizar entre montajes distintos mapeando cualquier electrodo con posición conocida sobre los 94 electrodos objetivo. El preentrenamiento se realizó con reconstrucción enmascarada sobre una arquitectura encoder-decoder en forma de U, con ventanas de 2 segundos (256 muestras a 128 Hz).

Los datos de preentrenamiento provienen de varios conjuntos públicos: Emotiv (Alpha, Attention, Crowdsource, DriverDistraction y STEW), HBN resting state, Muse sleep onset y DICE eyes closed, con configuraciones de 4, 14, 19 y 129 canales EEG. El número exacto de tokens de entrenamiento, la composición detallada del dataset y si hubo etapas de RLHF o DPO no están disponibles en la información proporcionada. La conversión a braindecode renombra las claves (178 tensores, 173 con cambio de nombre de módulo), elimina el decodificador de reconstrucción (29 de 207 tensores descartados) y preserva los valores bit a bit; la verificación reportada muestra diferencias de 0.0 en float32 y float64 frente al checkpoint original.

## Capacidades

- Extracción de características de señales EEG: el codificador produce representaciones de `(batch, 256)` a partir de entradas `(batch, 94, n_times)`.
- Pooling temporal integrado: las features devueltas son la media y la desviación estándar sobre el tiempo de la salida del encoder, `(batch, 2 * 128)`.
- Generalización entre montajes: cualquier conjunto de electrodos con posiciones conocidas se mapea sobre los 94 electrodos objetivo del checkpoint.
- Soporte de ventanas variables: acepta cualquier ventana de al menos 8 muestras (el encoder conserva `n_times // 8` pasos).
- Fine-tuning y linear probing: al no incluir cabeza de clasificación, `from_pretrained` construye una nueva cabeza con inicialización por defecto de PyTorch para el `n_outputs` indicado.
- No soporta tool calling, function calling, agentes, razonamiento multi-step, visión, audio ni capacidades multilingües: es un modelo específico de EEG.

## Casos de uso

- Clasificación de estados cognitivos: cargar el encoder preentrenado y añadir una cabeza lineal para tareas como atención o carga mental, usando los datasets Emotiv del preentrenamiento como referencia; el modelo ya ha visto señales de Attention y DriverDistraction.
- Detección de somnolencia o inicio del sueño: el checkpoint se preentrenó con datos de Muse sleep onset, por lo que sus representaciones son adecuadas para fine-tuning en tareas de transición vigilia-sueño con ventanas de 2 segundos.
- Decodificación de tareas de imaginación motora: usar las features medias y desviaciones estándar como entrada a un clasificador clásico (SVM, regresión logística) en un pipeline de linear probing sobre datasets BCI con montajes 10-20.
- Investigación en modelos fundacionales de EEG: servir de baseline reproducible para comparar arquitecturas Mamba frente a transformers en tareas de reconstrucción enmascarada y clasificación con pocos datos.
- Adaptación a montajes reducidos: gracias al CDSE, se puede aplicar a configuraciones de 4, 14 o 19 electrodos mapeando sus posiciones sobre los 94 electrodos objetivo, útil en dispositivos wearables de bajo canal.
- Extracción de embeddings para clustering y análisis exploratorio: generar representaciones de 256 dimensiones por ventana para agrupar segmentos EEG por estado fisiológico o detectar artefactos en pipelines de preprocesado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 dado el tamaño del checkpoint (391.987 parámetros, repo de 0.0 GB).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no se requiere A100 ni H100 para inferencia.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 2 GB de VRAM (GTX 1050, RTX 3050, RTX 4090, etc.); también es viable en CPU para lotes pequeños.
- Opciones de despliegue: carga nativa mediante `braindecode.models.SAMBA.from_pretrained` con PyTorch; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Licencia | Disponibilidad |
|---|---|---|---|---|
| SAMBA-2s (este checkpoint) | 391.987 (encoder) | 256 muestras (2 s a 128 Hz) | other | Hugging Face (braindecode) |
| SAMBA-100s | no disponible | no disponible | other | Hugging Face (Dcode-AI) |
| Otros modelos fundacionales de EEG | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- El checkpoint no incluye cabeza de clasificación: es imprescindible hacer fine-tuning o linear probing antes de cualquier uso predictivo; la cabeza se inicializa aleatoriamente.
- El decodificador de reconstrucción no está incluido, por lo que no se puede usar el modelo para tareas de reconstrucción enmascarada directamente con estos pesos.
- Requiere normalización manual: cada canal debe dividirse por el percentil 95 de su valor absoluto, ya que `SAMBA` no normaliza internamente.
- Las posiciones de electrodos deben construirse desde el template `colin27_1005` de MNE; usar `raw.set_montage` introduce desviaciones de hasta 5,7 cm que degradan el rendimiento.
- Preentrenado exclusivamente con ventanas de 2 segundos a 128 Hz; ventanas muy distintas pueden no estar bien soportadas aunque el encoder las acepte.
- Licencia "other": es necesario revisar los términos del modelo original en Dcode-AI/SAMBA-2s antes de cualquier uso comercial.
- Riesgo de sesgo por la composición del dataset de preentrenamiento (Emotiv, HBN, Muse, DICE), que puede no representar poblaciones clínicas o configuraciones de hardware distintas.
- No es un modelo de lenguaje: no soporta generación de texto, tool calling ni razonamiento; cualquier expectativa en ese sentido es inaplicable.
- Riesgo de alucinación no aplica en el sentido habitual, pero las representaciones pueden producir predicciones sobreconfiadas en distribuciones de señal fuera del dominio de preentrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/braindecode/samba-2s-pretrained
- Modelo base original: https://huggingface.co/Dcode-AI/SAMBA-2s
- Paper: https://arxiv.org/abs/2511.18571
- Código: https://github.com/Jiazhen-Hong/SAMBA
- Documentación de braindecode: https://braindecode.org/stable/generated/braindecode.models.SAMBA.html
