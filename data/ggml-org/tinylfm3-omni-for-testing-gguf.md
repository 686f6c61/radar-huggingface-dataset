# ggml-org/tinyLFM3-Omni-for-testing-gguf

## Resumen

tinyLFM3-Omni-for-testing-gguf es una versión reducida, modificada y deliberadamente "dañada" del modelo LiquidAI/LFM3-Omni-2B, publicada por la organización ggml-org en formato GGUF. No es un modelo destinado a uso real: su salida es incoherente (gibberish) por diseño, y su único propósito es servir como banco de pruebas para el software de inferencia llama.cpp. Conserva la arquitectura del modelo original (modelo de texto, codificador de audio, depthformer, códec de audio y codificador de visión), de modo que ejercita las mismas rutas de código que el modelo completo (TTS, ASR, audio en tiempo real y entrada de imagen), pero con un tamaño lo bastante pequeño como para integrarse en pipelines de CI.

El modelo se generó recortando el safetensors original con el script `slice_lfm3omni.py` (siguiendo la skill `slice-model` de llama.cpp) y convirtiéndolo después con `convert_hf_to_gguf.py`. Cuenta con 34.481.472 parámetros totales, frente a los aproximadamente 2B del modelo del que deriva, lo que lo convierte en una pieza de test muy ligera.

Su relevancia es puramente de ingeniería: permite a los mantenedores de llama.cpp validar de forma automatizada las rutas multimodales (texto, audio, visión) sin necesidad de descargar ni ejecutar el modelo real de 2B. No debe confundirse con un modelo funcional ni emplearse en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal derivado de LFM3-Omni (texto + codificador de audio + depthformer + códec de audio + codificador de visión) |
| Parámetros totales | 34.481.472 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q4_K, Q4_0 |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (lfm1.0) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo replica la arquitectura de LFM3-Omni-2B pero con dimensiones drásticamente reducidas. El modelo de texto conserva 4 de las 24 capas originales (0, 2, 3 y 4), con hidden size reducido de 2048 a 256, 2 cabezas de atención (frente a 16), 1 cabeza KV (frente a 4) y FFN de 256 (frente a 7680). El codificador de audio mantiene 3 de 17 capas (0, 2, 3) con FFN de 256. El depthformer conserva 1 de 3 capas, con hidden size 128, 4 cabezas, 1 cabeza KV y FFN de 256. El códec de audio mantiene las 8 capas completas (el cargador las requiere) con FFN reducido a 256. El codificador de visión conserva 2 de 14 capas (0, 2), con hidden size 256, 4 cabezas, 2 cabezas KV, FFN de 256 y proyector de 256.

No se ha realizado ningún entrenamiento adicional: los pesos proceden directamente del recorte del modelo original y posteriormente se cuantizaron a Q2_K, Q4_K y Q4_0 mediante `finish_gguf.py`. Ese mismo script añadió la plantilla de chat `asr` de LFM3-Audio, ausente en el modelo original, lo que habilita la ruta de transcripción en vivo (`/v1/realtime?intent=transcription`) para pruebas. No hay información disponible sobre datos de entrenamiento, tokens procesados ni fases de RLHF/DPO, ya que el modelo no se entrena y hereda únicamente la estructura del original.

## Capacidades

- Ejecución de las mismas rutas de código que LFM3-Omni-2B en llama.cpp: TTS, ASR, audio en tiempo real y entrada de imagen.
- Soporte de la plantilla de chat `asr` de LFM3-Audio, que permite probar la transcripción en vivo vía `/v1/realtime?intent=transcription`.
- Compatibilidad con endpoints (`endpoints_compatible`) según las etiquetas del repositorio.
- Generación de texto incoherente por diseño: no es una capacidad útil, sino una consecuencia del recorte de pesos.
- No disponible: tool calling, function calling, razonamiento multi-paso, capacidades multilingües reales ni modo thinking.

## Casos de uso

- Integración continua de llama.cpp: ejecutar el modelo en pipelines de CI para validar que las rutas de carga y ejecución de LFM3-Omni no se rompen con cambios en el código, gracias a su tamaño de 34,5M de parámetros.
- Pruebas de regresión de las rutas multimodales: verificar que el codificador de audio, el depthformer, el códec de audio y el codificador de visión se cargan y ejecutan correctamente sin descargar el modelo real de 2B.
- Validación de la ruta de transcripción en vivo: probar el endpoint `/v1/realtime?intent=transcription` con la plantilla de chat `asr` añadida por `finish_gguf.py`.
- Verificación de cuantizaciones: comprobar que los ficheros Q2_K, Q4_K y Q4_0 se generan y cargan correctamente en llama.cpp.
- Pruebas de compatibilidad de endpoints: validar la integración con servidores compatibles con la API de OpenAI usando la etiqueta `endpoints_compatible`.
- Desarrollo de herramientas de slicing y conversión: servir como caso de prueba para `slice_lfm3omni.py` y `convert_hf_to_gguf.py` en futuras modificaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo genera salida incoherente por diseño, por lo que cualquier métrica de calidad carece de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en todas las cuantizaciones, dado el tamaño de 34,5M de parámetros (Q4_K ocuparía del orden de decenas de MB).
- GPU recomendadas: cualquier GPU, incluida una iGPU o CPU; no requiere aceleradores de gama alta.
- Cabe en cualquier GPU de consumo y en CPU sin problemas.
- Opciones de despliegue: llama.cpp (formato nativo GGUF); el resto de opciones (vLLM, TGI, Ollama) no están documentadas en la información disponible.
- Latencia y throughput: no disponibles; al ser un modelo de test, no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Propósito |
|---|---|---|---|---|---|
| tinyLFM3-Omni-for-testing-gguf | 34,5M | no disponible | LFM Open License v1.0 | GGUF | Test de software (salida incoherente) |
| LiquidAI/LFM3-Omni-2B | ~2B | no disponible | LFM Open License v1.0 | safetensors | Modelo multimodal funcional |
| ggml-org/LFM3-Omni-2B-GGUF | ~2B | no disponible | LFM Open License v1.0 | GGUF | Versión GGUF del modelo funcional |

## Limitaciones y advertencias

- La salida del modelo es incoherente (gibberish) por diseño; no debe usarse para generar contenido real.
- Es una copia modificada y "dañada" del modelo original, según advierte el propio autor en la model card.
- No apto para producción bajo ninguna circunstancia; su único fin es el test de software.
- Sesgos conocidos: no disponibles (no aplica, al no ser un modelo funcional).
- Riesgo de alucinación: total, dado que la salida no tiene coherencia semántica.
- Restricciones de licencia: se hereda la LFM Open License v1.0 del modelo original; conviene revisar sus términos para cualquier uso derivado.
- El repositorio tiene 0 descargas y 0 likes, y un tamaño de 0.0 GB reportado, lo que sugiere que los pesos pueden no estar completamente subidos o que el dato es impreciso.

## Enlaces

- Hugging Face (ggml-org): https://huggingface.co/ggml-org/tinyLFM3-Omni-for-testing-gguf
- Hugging Face (ngxson, espejo): https://huggingface.co/ngxson/tinyLFM3-Omni-for-testing-gguf
- Modelo original: https://huggingface.co/LiquidAI/LFM3-Omni-2B
- Versión GGUF del modelo real: https://huggingface.co/ggml-org/LFM3-Omni-2B-GGUF
- Organización ggml-org: https://huggingface.co/ggml-org
