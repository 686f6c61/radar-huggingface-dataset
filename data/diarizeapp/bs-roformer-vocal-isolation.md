# diarizeapp/bs-roformer-vocal-isolation

## Resumen

BS-RoFormer Vocal Isolation (Quantized UINT8) es un modelo de separación de fuentes de audio especializado en aislar la pista vocal del acompañamiento instrumental. Está desarrollado y mantenido por el ecosistema **diarizeapp**, que lo publica como repositorio canónico para garantizar la disponibilidad persistente del asset y evitar roturas por dependencias 404. El modelo se distribuye en formato ONNX cuantizado a UINT8, con un tamaño de repositorio de 0,2 GB, lo que lo hace adecuado para despliegue en entornos con recursos limitados.

La arquitectura subyacente es **BSRoFormer** (Band-Split RoFormer), una familia de modelos transformer con atención rotatoria aplicada sobre bandas de frecuencia, que ha demostrado resultados de referencia en separación vocal (SDR alto) en competiciones como Sound Demixing Challenge. El pipeline declarado en Hugging Face es `audio-to-audio`, y la licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

El modelo es relevante ahora porque ofrece una alternativa ligera y portable (ONNX cuantizado) para tareas de aislamiento vocal en producción, con soporte para DirectML, CUDA y CPU SIMD, aunque con una limitación explícita: no funciona en la NPU Hexagon HTP de Snapdragon X Elite por falta de soporte de operaciones complejas STFT/iSTFT en el DSP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BSRoFormer (Band-Split RoFormer, transformer con atención rotatoria) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio, no de texto) |
| Tipos de cuantizacion | UINT8 (cuantización entera de 8 bits) |
| Idiomas soportados | no disponible (modelo de audio, independiente del idioma) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (cuantizado UINT8) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura **BSRoFormer**, una variante de RoFormer adaptada a separación de fuentes musicales. RoFormer emplea atención rotatoria (rotary positional embeddings) para codificar información posicional de forma relativa, lo que resulta adecuado para secuencias largas de audio. La variante "Band-Split" divide el espectrograma en bandas de frecuencia y procesa cada banda con atención, lo que mejora la separación de fuentes al modelar dependencias espectrales locales y globales. El objetivo de entrenamiento es la separación vocal/acompañamiento con una métrica de SDR (Signal-to-Distortion Ratio) alta.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF/DPO (no aplicables en este dominio). El modelo se distribuye ya cuantizado a UINT8, lo que reduce el tamaño y acelera la inferencia en CPU, a costa de una posible pérdida menor de calidad respecto al modelo en precisión completa. La model card no detalla el proceso de cuantización ni el modelo original del que deriva.

## Capacidades

- Separación de fuentes de audio: aislamiento de la pista vocal respecto al acompañamiento instrumental en mezclas musicales.
- Procesamiento de audio a audio: entrada de audio mezclado, salida de pista vocal aislada.
- Ejecución en múltiples backends: DirectML, CUDA y CPU SIMD (x86_64 y ARM NEON) mediante ONNX Runtime.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step (no es un modelo de lenguaje).
- No tiene capacidades multilingües ni de texto: es un modelo puramente de audio.
- No dispone de modo "thinking", visión ni audio de entrada en sentido ASR; su tarea es exclusivamente separación.

## Casos de uso

- **Karaoke y eliminación de voz**: el modelo recibe una mezcla musical y devuelve la pista vocal aislada, que puede restarse de la mezcla original para obtener la instrumental. Es adecuado por su especialización en separación vocal con SDR alto y su formato ONNX ligero.
- **Producción musical y remezclas**: permite extraer la voz de una grabación para remezclarla, samplearla o procesarla por separado. La cuantización UINT8 reduce los requisitos de cómputo, lo que facilita su integración en estaciones de trabajo modestas.
- **Transcripción y diarización previa**: en pipelines de ASR o diarización, aislar la voz antes de la transcripción mejora la relación señal-ruido y reduce errores. El modelo encaja como etapa de preprocesado en un pipeline de audio-to-audio.
- **Limpieza de grabaciones**: separar la voz del ruido musical de fondo en entrevistas, podcasts o grabaciones con música de ambiente, usando la salida vocal como entrada limpia para otras herramientas.
- **Aplicaciones móviles y de escritorio**: al estar en ONNX cuantizado y soportar CPU SIMD y DirectML, puede desplegarse en aplicaciones de escritorio Windows (DirectML) y en dispositivos ARM (NEON), aunque no en la NPU Hexagon de Snapdragon X Elite.
- **Investigación en separación de fuentes**: sirve como baseline reproducible y ligero para comparar técnicas de separación vocal, gracias a su licencia Apache 2.0 y su formato ONNX estandarizado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada**: no disponible con precisión; el repositorio ocupa 0,2 GB en disco, por lo que la huella en memoria es reducida y compatible con GPUs de gama baja.
- **GPU recomendadas**: no se especifican modelos concretos; la model card indica soporte para CUDA y DirectML, por lo que cualquier GPU NVIDIA con CUDA o GPU compatible con DirectML es válida.
- **Consumer GPU**: por el tamaño del modelo (0,2 GB), es probable que quepa en GPUs de consumo, pero no se confirma en la información disponible.
- **NPU Hexagon HTP (Snapdragon X Elite)**: no soportada, por falta de soporte de operaciones complejas STFT/iSTFT en el DSP; se ejecuta vía DirectML, CUDA o CPU SIMD.
- **Opciones de despliegue**: ONNX Runtime (DirectML, CUDA, CPU SIMD). No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de otros modelos de separación vocal (por ejemplo, Demucs, Spleeter o variantes de RoFormer) que permitan una comparación con parámetros, contexto, rendimiento y licencia verificables.

## Limitaciones y advertencias

- **Sesgos**: no documentados; al ser un modelo de audio, los sesgos se refieren al tipo de música o grabaciones del dataset de entrenamiento, que no se detalla.
- **Riesgo de alucinación**: no aplica en el sentido de texto, pero puede producir artefactos o separaciones imperfectas en mezclas con voces superpuestas, coros o instrumentos con rango frecuencial similar a la voz.
- **Limitaciones de contexto o idioma**: no aplica contexto de texto; el modelo es independiente del idioma, pero no se especifica su robustez ante distintos géneros musicales o calidades de grabación.
- **Restricciones de licencia**: Apache 2.0 permite uso comercial, modificación y redistribución, con obligación de incluir el aviso de licencia y la atribución correspondiente.
- **Caveat de producción**: la cuantización UINT8 puede degradar ligeramente la calidad de separación frente al modelo en precisión completa; no se documenta la pérdida exacta.
- **Compatibilidad de hardware**: no funciona en la NPU Hexagon HTP de Snapdragon X Elite; verificar el backend antes de desplegar en ese hardware.
- **Mantenimiento**: el repositorio se mantiene para garantizar disponibilidad persistente, pero no se indica la cadencia de actualizaciones ni el soporte a largo plazo.

## Enlaces

- Hugging Face: https://huggingface.co/diarizeapp/bs-roformer-vocal-isolation
- Repositorio del mantenedor: https://github.com/benzy/diarize
