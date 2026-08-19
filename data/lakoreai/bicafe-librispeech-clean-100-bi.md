# LakoreAI/bicafe-librispeech-clean-100-bi

## Resumen

BiCAFE (Bidirectional Cross-Attention Fusion for Speech Embeddings) es un modelo de representaciones de voz auto-supervisado desarrollado por LakoreAI Research. Su objetivo es extraer características de nivel intermedio a partir de señales de habla continua, combinando información local de alta resolución temporal con información global de largo alcance mediante mecanismos de atención cruzada bidireccional. El checkpoint oficial se ha preentrenado en el subconjunto `train-clean-100` de LibriSpeech, que contiene 28 539 fragmentos de audio (~100 horas), y produce representaciones a una tasa de 25 Hz, adecuadas para tareas de procesado de voz aguas abajo como reconocimiento automático del habla (ASR), identificación de hablante (SID) o reconocimiento de fonemas (PR).

La arquitectura se compone de dos ramas complementarias: una rama local basada en convoluciones 1D que captura detalles acústicos y fonéticos, y una rama global que modela contexto prosódico y de hablante mediante una red recurrente o transformadora. Ambas ramas se fusionan mediante capas de cross-attention multi-cabeza, permitiendo un intercambio simultáneo de información en ambas direcciones. El modelo se distribuye bajo licencia MIT, pesa aproximadamente 0,1 GB y está disponible en formato de checkpoint de PyTorch, siendo compatible con el entorno de evaluación s3prl para tareas de representación del habla.

La relevancia de BiCAFE radica en su enfoque de aprendizaje dual-path, que busca mejorar la riqueza de las representaciones frente a modelos de una sola vía. El valor de `effective rank` reportado (49,55) indica una alta diversidad en las representaciones aprendidas, lo que sugiere una buena capacidad para capturar múltiples dimensiones de variabilidad en la señal de voz. Aunque el modelo se encuentra en una fase temprana (cero descargas y cero likes en Hugging Face), su diseño modular y su licencia permisiva lo convierten en una opción interesante para la investigación en representaciones de habla auto-supervisadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dual-path: rama local (encoder convolucional 1D) + rama global (recurrente/transformer) + fusión cross-attention bidireccional |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa ventanas de audio con `window_sec=0.16` y solapamiento de 0,75) |
| Tipos de cuantizacion | no disponible (checkpoint en precisión completa, sin cuantizaciones publicadas) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | Checkpoint de PyTorch (`.pt`, probablemente con tensores en formato nativo; no se menciona safetensors) |

## Arquitectura y entrenamiento

BiCAFE introduce un esquema de representación complementaria de doble vía para señales de habla continuas. La rama local (L) emplea un encoder convolucional 1D que extrae características finas a nivel de frame, como información acústica y fonética. La rama global (G) utiliza una red recurrente o transformadora que modela dependencias de largo alcance, incluyendo aspectos prosódicos y de identidad del hablante. La fusión bidireccional se implementa mediante capas de cross-attention multi-cabeza: la rama local consulta el contexto global mientras que la rama global consulta los tokens acústicos locales, de forma simultánea. Esta interacción permite que ambas representaciones se enriquezcan mutuamente durante el preentrenamiento.

El preentrenamiento se realizó sobre LibriSpeech `train-clean-100` con un tamaño de batch efectivo de 256 (batch_size=16 con acumulación de gradientes de 16 pasos). Se utilizó el optimizador AdamW con un programador de tasa de aprendizaje tipo warmup-cosine y una tasa máxima de 3×10⁻³. La tasa de tokenización es de 25 Hz, con ventanas de 0,16 segundos y solapamiento del 75%. El entrenamiento se detuvo por paciencia de 15 épocas, alcanzando una pérdida de entrenamiento convergida de 0,00728 y una pérdida de validación de 0,01270. El valor de `effective rank` de 49,55 se reporta como indicador de la diversidad de las representaciones aprendidas. No se menciona el uso de técnicas como RLHF o DPO, ya que se trata de un modelo de representaciones, no de generación de texto.

## Capacidades

- Extracción de características de voz a nivel de frame (tasa de 25 Hz) mediante la rama local convolucional.
- Modelado de contexto global de largo alcance (prosodia, identidad del hablante) mediante la rama global recurrente/transformadora.
- Fusión bidireccional de información local y global mediante cross-attention multi-cabeza.
- Compatibilidad directa con el entorno s3prl para evaluación aguas abajo en tareas estándar de habla.
- Soporte para tareas de identificación de hablante (SID) sobre VoxCeleb1, reconocimiento automático del habla (ASR) sobre LibriSpeech y reconocimiento de fonemas (PR) sobre TIMIT.
- Capacidad de extraer embeddings de habla para uso en pipelines de aprendizaje auto-supervisado o como características de entrada para modelos posteriores.
- No se reportan capacidades de generación de texto, tool calling, agentes o procesamiento multimodal (solo audio).

## Casos de uso

- **Extracción de embeddings para ASR**: el modelo puede utilizarse como extractor de características de entrada para un sistema de reconocimiento de habla. Sus representaciones a 25 Hz, que combinan información local y global, pueden alimentar un decodificador de ASR, mejorando potencialmente la robustez frente a variaciones acústicas y de hablante.
- **Identificación de hablante (SID)**: gracias a la rama global que modela información de hablante, los embeddings de BiCAFE son adecuados para tareas de verificación e identificación de locutores. Al integrarse con s3prl, se puede evaluar directamente sobre VoxCeleb1.
- **Reconocimiento de fonemas (PR)**: la rama local, con su resolución temporal fina, proporciona características fonéticas útiles para la clasificación de fonemas. El modelo puede emplearse como front-end en un sistema de reconocimiento fonético sobre TIMIT.
- **Análisis prosódico y de entonación**: la combinación de información global permite capturar patrones de entonación, ritmo y acento, lo que resulta útil para aplicaciones de síntesis de voz o análisis de emociones en el habla.
- **Pre-entrenamiento de modelos de voz personalizados**: al ser un checkpoint de representaciones, puede servir como inicialización para fine-tuning en tareas específicas con pocos datos, reduciendo la necesidad de grandes recursos computacionales.
- **Investigación en representaciones auto-supervisadas**: el diseño dual-path y la fusión cross-attention ofrecen un caso de estudio para comparar arquitecturas de representación de habla. Los investigadores pueden utilizarlo como referencia para evaluar nuevas técnicas de aprendizaje auto-supervisado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas de preentrenamiento (pérdida de entrenamiento 0,00728, pérdida de validación 0,01270 y `effective rank` 49,55), pero no incluye resultados de tareas aguas abajo como ASR, SID o PR. No se proporcionan comparaciones con otros modelos de representación de habla (por ejemplo, wav2vec 2.0, HuBERT o WavLM).

## Requisitos de hardware

- El tamaño del repositorio es de 0,1 GB, lo que sugiere un modelo de dimensiones reducidas (probablemente decenas de millones de parámetros, aunque el número exacto no está disponible).
- No se especifica la VRAM estimada para inferencia. Dado el tamaño del checkpoint, es plausible que quepa en GPUs de consumo como una RTX 3060 o superior, pero no hay confirmación oficial.
- No se indican GPUs recomendadas (A100, H100, etc.). El modelo es ligero y probablemente pueda ejecutarse en CPU para inferencia de baja latencia, aunque con menor velocidad.
- Opciones de despliegue: al ser un checkpoint de PyTorch, puede cargarse directamente con `torch.load` o mediante el módulo `bicafe`. No se mencionan integraciones con vLLM, llama.cpp u Ollama (orientados a modelos de lenguaje). Para tareas de habla, se puede usar con s3prl o en un pipeline personalizado de PyTorch.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos de representación de habla (como wav2vec 2.0, HuBERT o WavLM) en términos de parámetros, contexto, rendimiento o disponibilidad. La model card no proporciona datos de benchmarks comparativos ni especificaciones detalladas de otros modelos.

## Limitaciones y advertencias

- El modelo solo ha sido preentrenado en el subconjunto `train-clean-100` de LibriSpeech, que contiene audio de habla leída en inglés con alta calidad y sin ruido. Su rendimiento en habla espontánea, acentos no nativos o entornos ruidosos puede ser limitado.
- No se han evaluado sesgos demográficos o de acento; al entrenarse únicamente con datos de LibriSpeech (mayoritariamente hablantes de inglés estadounidense), las representaciones pueden estar sesgadas hacia ese grupo.
- No se reportan riesgos de alucinación, ya que el modelo no genera texto, pero sí podría producir representaciones poco fiables en entradas fuera de distribución.
- La licencia MIT permite uso comercial sin restricciones, siempre que se incluya el aviso de copyright. Sin embargo, el modelo se distribuye sin garantías.
- El checkpoint se carga con `weights_only=False` en el ejemplo de código, lo que implica un riesgo de seguridad si se cargan pesos de fuentes no confiables (ejecución de código arbitrario).
- No se proporcionan detalles sobre el número exacto de parámetros, la arquitectura concreta de la rama global (recurrente vs. transformer) ni el procedimiento de preentrenamiento (pérdida utilizada, objetivos auxiliares, etc.).
- El modelo está en una fase inicial de publicación (cero descargas y cero likes), por lo que su madurez y soporte comunitario son limitados.

## Enlaces

- [Hugging Face: LakoreAI/bicafe-librispeech-clean-100-bi](https://huggingface.co/LakoreAI/bicafe-librispeech-clean-100-bi)
- Paper citado en la model card: "BiCAFE: Bidirectional Cross-Attention Fusion for Speech Representations" (Lakore AI Research, 2026) — no se proporciona URL.
