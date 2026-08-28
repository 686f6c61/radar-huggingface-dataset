# dawsonvosburg/cohere-transcribe-03-2026-coreml

## Resumen

`dawsonvosburg/cohere-transcribe-03-2026-coreml` es una conversión a Core ML del modelo de reconocimiento automático del habla (ASR) `CohereLabs/cohere-transcribe-03-2026`, desarrollado por Cohere. Esta conversión está pensada para ejecutarse en dispositivos Apple Silicon y aporta dos cambios respecto a la conversión original de FluidInference: el encoder se re-exporta con precisión de cálculo FP16 (manteniendo pesos INT8) y el decoder amplía su caché KV de 108 a 256 tokens. El objetivo es permitir transcribir una ventana completa de 35 segundos de audio en una sola pasada, sin truncamientos.

El modelo base es un ASR de 2.000 millones de parámetros, con arquitectura Conformer para el encoder y un decoder con caché externa. Soporta 14 idiomas (inglés, francés, alemán, español, italiano, portugués, neerlandés, polaco, griego, árabe, japonés, chino, vietnamita y coreano). La conversión no modifica los pesos del modelo original; solo cambia el empaquetado y la configuración de inferencia, por lo que la precisión teórica se mantiene idéntica a la del modelo base.

Esta ficha es relevante para desarrolladores que necesitan integrar transcripción de voz en aplicaciones macOS o iOS con bajo consumo de recursos, aprovechando el runtime Core ML y la aceleración por hardware de Apple. El modelo se distribuye como archivos `.mlmodelc` compilados, listos para cargar sin compilación en el dispositivo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder Conformer + decoder con caché externa (cache-external) |
| Parametros totales | 2.000 millones (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 35 segundos de audio (ventana del encoder); caché KV del decoder de 256 tokens |
| Tipos de cuantizacion | Encoder: pesos INT8 con compute FP16; decoder: sin especificar |
| Idiomas soportados | en, fr, de, es, it, pt, nl, pl, el, ar, ja, zh, vi, ko (14 idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.mlmodelc` (Core ML compilado) |

## Arquitectura y entrenamiento

El modelo base `CohereLabs/cohere-transcribe-03-2026` es un ASR de 2.000 millones de parámetros con arquitectura Conformer para el encoder y un decoder con caché externa. El encoder procesa ventanas de audio de hasta 35 segundos (16 kHz mono Float32) y el decoder genera texto token a token. La conversión Core ML mantiene los pesos originales sin modificar; los cambios se limitan al empaquetado: el encoder se re-exporta con `compute_precision=FLOAT16` (los pesos siguen siendo INT8) y el decoder amplía su caché KV de 108 a 256 tokens mediante un parche sobre el proto MIL. No se ha realizado ningún reentrenamiento ni ajuste fino.

El entrenamiento original del modelo base fue realizado por Cohere, pero la información disponible no detalla la composición del dataset ni el proceso de entrenamiento (RLHF, DPO, etc.). La documentación de Cohere indica que el modelo es eficiente, con un factor tiempo real hasta tres veces más rápido que otros modelos ASR dedicados del mismo rango de tamaño.

## Capacidades

- Transcripción de audio a texto en 14 idiomas: inglés, francés, alemán, español, italiano, portugués, neerlandés, polaco, griego, árabe, japonés, chino, vietnamita y coreano.
- Acepta audio de entrada en formato 16 kHz mono Float32, con una ventana máxima de 35 segundos por pasada.
- Genera texto y token ids; no produce marcas de tiempo (timestamps).
- Optimizado para Apple Silicon: puede ejecutarse en CPU, GPU o ambos (compute units configurables). El Neural Engine no es compatible con esta conversión.
- Integración prevista con el runtime FluidAudio (`CoherePipeline`), que gestiona la carga de modelos y la transcripción.
- Soporta chunking de audio largo mediante el runtime, con manejo de costuras entre ventanas.

## Casos de uso

- Transcripción de reuniones y entrevistas: el modelo puede convertir grabaciones de hasta 35 segundos por ventana en texto, y el runtime FluidAudio permite encadenar ventanas para audio más largo. Es adecuado para aplicaciones de productividad en macOS.
- Asistente de voz en aplicaciones iOS: al ser Core ML, se integra de forma nativa con Swift y puede ejecutarse en el dispositivo sin conexión, ideal para dictado o comandos de voz.
- Subtitulado automático de vídeos: aunque no genera timestamps, el texto resultante puede sincronizarse con herramientas externas de alineación. Su soporte multilingüe cubre los principales idiomas europeos y asiáticos.
- Análisis de llamadas de atención al cliente: transcripción de grabaciones de servicio al cliente para búsqueda y análisis posterior, con bajo coste computacional en hardware Apple.
- Transcripción de podcasts y contenido audiovisual: procesamiento por lotes de episodios completos mediante chunking, con salida en texto plano para indexación o resúmenes.
- Accesibilidad: conversión de audio a texto en tiempo real para personas con discapacidad auditiva, aprovechando la baja latencia en CPU (~0,6 s por ventana de 35 s).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta conversión Core ML en la información disponible. El modelo base `CohereLabs/cohere-transcribe-03-2026` declara una precisión de transcripción líder en sus 14 idiomas y un factor tiempo real hasta tres veces superior al de otros ASR del mismo rango, pero no se incluyen cifras concretas en la documentación consultada. Se recomienda consultar la model card del modelo base para datos de evaluación.

## Requisitos de hardware

- Dispositivos Apple Silicon: M1, M2, M3 y posteriores (macOS e iOS).
- Memoria: el encoder ocupa aproximadamente 240 MB en CPU durante la inferencia; en GPU, el pico de memoria durante la compilación JIT puede alcanzar 12,5 GB, aunque con la re-exportación FP16 se reduce significativamente.
- GPU: integrada en el chip Apple Silicon; no requiere GPU externa.
- Almacenamiento: el repositorio ocupa 2,2 GB (encoder 1,7 GB, decoder 291 MB, vocabulario 332 KB).
- Opciones de despliegue: runtime FluidAudio (`CoherePipeline`), Core ML runtime nativo. No se menciona compatibilidad con vLLM, llama.cpp u otros servidores de inferencia.
- Latencia: en GPU, 0,08 s por ventana tras un warm-up de 10 s; en CPU, ~0,6 s por ventana de 35 s. La configuración recomendada para procesamiento por lotes es CPU, ya que no requiere warm-up.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Cohere Transcribe 03-2026 (base) | 2B | 35 s de audio | 14 | Apache-2.0 | PyTorch / GGUF |
| dawsonvosburg/cohere-transcribe-03-2026-coreml | 2B (base) | 35 s de audio | 14 | Apache-2.0 | Core ML (.mlmodelc) |
| OpenAI Whisper (variante small) | 244M | 30 s de audio | 99 | MIT | PyTorch / Core ML (comunidad) |

La comparación con Whisper es orientativa: Whisper small tiene menos parámetros y más idiomas, pero Cohere Transcribe declara una eficiencia superior en tiempo real. No se dispone de benchmarks comparativos directos entre ambos en la información proporcionada. La conversión Core ML de Cohere Transcribe se diferencia por su optimización específica para Apple Silicon y su caché KV ampliada.

## Limitaciones y advertencias

- No genera marcas de tiempo (timestamps); la transcripción devuelve solo texto y token ids. Para sincronización temporal se requiere una herramienta externa.
- La ventana de audio está limitada a 35 segundos por pasada; audio más largo necesita chunking con manejo de costuras, que el runtime FluidAudio proporciona por separado.
- El Neural Engine de Apple no es compatible con esta conversión; la inferencia debe ejecutarse en CPU o GPU.
- Los cambios de empaquetado no han sido evaluados en cuanto a precisión; se asume que la calidad es idéntica al modelo base, pero no se ha verificado de forma independiente.
- La licencia Apache-2.0 permite uso comercial, pero se debe consultar la model card del modelo base para posibles restricciones adicionales sobre el entrenamiento o los datos.
- El runtime FluidAudio es un proyecto de terceros; la integración depende de su mantenimiento y de la disponibilidad de las correcciones específicas para Cohere.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dawsonvosburg/cohere-transcribe-03-2026-coreml
- Modelo base: https://huggingface.co/CohereLabs/cohere-transcribe-03-2026
- Conversión Core ML original: https://huggingface.co/FluidInference/cohere-transcribe-03-2026-coreml
- Documentación de Cohere Transcribe: https://docs.cohere.com/docs/transcribe
- Página de producto de Cohere Transcribe: https://cohere.com/transcribe
- Repositorio FluidAudio: https://github.com/FluidInference/FluidAudio
