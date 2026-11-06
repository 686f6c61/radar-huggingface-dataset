# Acapellas/Mini-BS-RoFormer-V2.5-46.2M

## Resumen

Mini-BS-RoFormer-V2.5-46.2M es un modelo de separación de fuentes musicales (music source separation) desarrollado por el usuario Acapellas y publicado en Hugging Face. Descompone una mezcla de audio musical en cuatro pistas o stems independientes: bajo (bass), batería (drums), otros instrumentos (other) y voz (vocals). El modelo se basa en la arquitectura BS-RoFormer (Band-Split RoPE Transformer), descrita en el paper arXiv:2309.02612, y está implementado sobre la librería transformers con código personalizado.

Con 46,17 millones de parámetros y pesos en precisión bf16, el modelo está diseñado para operar a una frecuencia de muestreo de 44100 Hz con fragmentos de audio de 8 segundos. Su tamaño reducido lo sitúa en la categoría de modelos ligeros, aptos para inferencia en hardware modesto, y su licencia MIT facilita su integración tanto en proyectos de investigación como en productos comerciales.

La relevancia de esta versión V2.5 radica en las mejoras introducidas respecto a la V2: una función de pérdida L1 ponderada por umbral auditivo en el dominio de la frecuencia, un decodificador de máscara compartido entre stems mediante atención con pooling, la eliminación de datos defectuosos del conjunto MUSDB18HQ y una configuración de hiperparámetros más ancha y menos profunda. Estas modificaciones se traducen en una mejora del SDR global de 10,03 a 10,09 en el conjunto de validación de MUSDB18HQ.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BS-RoFormer (Band-Split RoPE Transformer) |
| Parametros totales | 46.173.188 (46,2 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; fragmentos de audio de 8 s a 44100 Hz |
| Tipos de cuantizacion | bf16 (pesos publicados); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible (modelo de audio, independiente del idioma) |
| Licencia | MIT |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura BS-RoFormer, un transformer con band-split y codificación posicional rotatoria (RoPE) orientado a la separación de fuentes musicales. La entrada de audio se divide en bandas de frecuencia y se procesa mediante capas de atención, lo que permite modelar dependencias espectrales y temporales de forma eficiente. La versión V2.5 introduce un decodificador de máscara compartido entre los cuatro stems, implementado mediante atención con pooling, lo que reduce la complejidad del cabezal de salida. Además, se ha adoptado una configuración de hiperparámetros "más ancha y menos profunda" en comparación con la V2, según indica la model card.

El entrenamiento se realizó sobre los conjuntos de train y test de MUSDB18HQ, tras eliminar los datos defectuosos presentes en dicho dataset. Se empleó una tasa de aprendizaje de 3e-4, un tamaño de lote de 8 y 246.000 pasos de entrenamiento. Para la optimización se usó el optimizador Muon en las capas transformer y AdamW en el resto de la red. La función de pérdida es una L1 ponderada por umbral auditivo en el dominio de la frecuencia, que prioriza las regiones espectrales más relevantes para la percepción humana. No se documenta el uso de RLHF ni DPO, algo esperable en una tarea de separación de audio.

## Capacidades

- Separación de audio musical en cuatro stems: bass, drums, other y vocals.
- Generación de la pista instrumental mediante la suma de los stems bass, drums y other.
- Procesamiento de audio a 44100 Hz con fragmentos de 8 segundos.
- Inferencia por lotes (batch_size configurable) para acelerar el procesamiento de pistas largas.
- Ejecución en GPU mediante la API `separate` del modelo, con soporte para `trust_remote_code`.
- Exportación a ONNX además de los pesos safetensors nativos.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: es un modelo puramente de audio.
- No dispone de capacidades multilingües ni de generación de texto.

## Casos de uso

- Producción musical y remezclas: el modelo permite aislar la voz o la batería de una mezcla para crear versiones instrumentales, remixes o samples, gracias a su separación en cuatro stems a 44,1 kHz.
- Karaoke automático: combinando los stems bass, drums y other se obtiene la base instrumental, mientras que el stem vocals se reserva para la pista de voz, tal como se documenta en la model card.
- Postproducción de audio para vídeo: la separación de diálogo y música en bandas sonoras facilita el ajuste independiente de niveles o la sustitución de la música de fondo.
- Dataset augmentation para entrenamiento de modelos de audio: la generación de stems permite crear variaciones de mezclas y ampliar corpus de investigación en MIR (music information retrieval).
- Limpieza y restauración de grabaciones: la extracción de la pista vocal o instrumental permite reducir ruido de acompañamiento en grabaciones antiguas o de baja calidad.
- Aplicaciones educativas y de análisis musical: la separación de stems facilita el estudio de partituras por instrumentos y el análisis de interpretaciones individuales.
- Integración en pipelines de procesamiento por lotes: su tamaño reducido (46,2 M de parámetros) y el soporte de ONNX permiten desplegarlo en servidores modestos o incluso en entornos de CPU para tareas no críticas en latencia.

## Benchmarks y rendimiento

Resultados de SDR (Signal-to-Distortion Ratio, mayor es mejor) en el conjunto de validación de MUSDB18HQ, según la model card:

| Pista | Mini-BS-RoFormer-V2.5-46.2M | Mini-BS-RoFormer-V2-46.8M |
|---|---|---|
| overall | **10,09** | 10,03 |
| bass | **9,71** | 9,68 |
| drums | 10,48 | **10,58** |
| other | **9,19** | 8,99 |
| vocal | **10,97** | 10,86 |

No se han publicado otros resultados de benchmarks (por ejemplo, en MUSDB18 completo o en datasets adicionales) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 46,2 M de parámetros en bf16, los pesos ocupan aproximadamente 92 MB; con activaciones y buffers de audio, la VRAM necesaria es inferior a 1 GB en la mayoría de configuraciones.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; se puede ejecutar en RTX 3060, RTX 4060, RTX 4090, A100 o H100 sin problemas. El modelo no aprovecha las GPU de gama alta por su reducido tamaño.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna (GTX 1650 en adelante) e incluso en CPU para fragmentos de 8 s.
- Opciones de despliegue: transformers con `trust_remote_code=True`, ONNX Runtime para la versión exportada, y cualquier framework compatible con safetensors. No se documenta soporte nativo para vLLM, llama.cpp, Ollama o TGI, ya que son herramientas orientadas a modelos de lenguaje.
- Latencia y throughput: no se proporcionan datos concretos en la información disponible. Dado el tamaño del modelo, se espera una latencia baja por fragmento de 8 s, pero no se confirma con cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / fragmento | SDR overall (MUSDB18HQ val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mini-BS-RoFormer-V2.5-46.2M | 46,2 M | 8 s a 44,1 kHz | 10,09 | MIT | Hugging Face |
| Mini-BS-RoFormer-V2-46.8M | 46,8 M | 8 s a 44,1 kHz | 10,03 | no disponible | Hugging Face |
| BS-RoFormer original (paper) | no disponible | no disponible | no disponible | no disponible | GitHub (lucidrains) |

No se dispone de datos de otros modelos comparables (por ejemplo, Demucs, Spleeter o HTDemucs) en la información proporcionada, por lo que no se incluyen en la tabla.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en separación de audio musical; no es un modelo de lenguaje ni admite tareas de texto, razonamiento o código.
- Entrenado únicamente con MUSDB18HQ, un dataset con un número limitado de géneros y estilos; el rendimiento puede degradarse en géneros poco representados (música clásica, electrónica experimental, grabaciones en directo con mucha reverberación).
- Los valores de SDR reportados corresponden al conjunto de validación de MUSDB18HQ; no se han publicado evaluaciones en otros datasets, por lo que la generalización no está confirmada.
- Requiere instalar dependencias adicionales (`soundfile`, `einops`, `librosa`) y usar `trust_remote_code=True`, lo que implica ejecutar código personalizado del autor.
- La longitud de fragmento está fijada en 8 s; para pistas largas es necesario segmentar y reconstruir, lo que puede introducir artefactos en las fronteras si no se aplica solapamiento.
- La licencia MIT permite uso comercial sin restricciones adicionales, pero el autor no ofrece garantías sobre la calidad del resultado en producción.
- No se documentan sesgos específicos, pero al ser un modelo entrenado con un dataset concreto puede presentar un rendimiento desigual según el estilo musical.
- Riesgo de alucinación no aplica en el sentido habitual; sin embargo, pueden aparecer artefactos o "sangrado" entre stems en pasajes complejos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Acapellas/Mini-BS-RoFormer-V2.5-46.2M
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/HiDolen/Mini-BS-RoFormer-V2.5-46.2M-Demo
- Modelo predecesor V2: https://huggingface.co/HiDolen/Mini-BS-RoFormer-V2-46.8M
- Repositorio de referencia BS-RoFormer: https://github.com/lucidrains/BS-RoFormer
- Paper: https://arxiv.org/abs/2309.02612 (Music Source Separation with Band-Split RoPE Transformer)
- Dataset MUSDB18-HQ: https://huggingface.co/datasets/CLAPv2/MUSDB18-HQ
