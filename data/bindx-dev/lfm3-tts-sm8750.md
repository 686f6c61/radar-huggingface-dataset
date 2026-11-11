# bindx-dev/lfm3-tts-sm8750

## Resumen

`bindx-dev/lfm3-tts-sm8750` es un artefacto de conversión, no un modelo de lenguaje completo. Contiene únicamente el decodificador de profundidad (depthformer) del sistema de síntesis de voz de LFM3 de Liquid AI, convertido por BindX a formato ONNX y compilado como binario de contexto para el DSP Hexagon HTP v79 presente en el SoC Qualcomm Snapdragon 8 Elite (SM8750). El repositorio aloja dos ficheros: `tts-sm8750.onnx` (grafo) y `tts-sm8750.bin` (contexto compilado de aproximadamente 218,8 MB).

El modelo subyacente es LFM3-Audio-2B de Liquid AI, un backbone de 2.000 millones de parámetros que se distribuye por separado en formato GGUF cuantizado Q4_K_M junto con su mmproj. Este repositorio no incluye ni replica esos ficheros: solo el pase MaskGIT del depthformer. Por tanto, no es un modelo autónomo ni puede ejecutarse con Piper, Phonon u otros motores TTS genéricos, sino que requiere el ecosistema de inferencia de Liquid (GGUF + mmproj) para funcionar.

Su relevancia es de nicho: sirve como pieza de despliegue en dispositivos móviles con Snapdragon 8 Elite, donde la aceleración por NPU (Hexagon) permite ejecutar la etapa de decodificación de audio con latencia reducida. La licencia LFM Open License v1.0 (Apache-2.0 con umbral comercial adicional) condiciona su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Depthformer (decodificador de profundidad MaskGIT) sobre backbone LFM3-Audio-2B; artefacto ONNX + binario QAIRT para Hexagon HTP v79 |
| Parametros totales | No disponible para este artefacto; el backbone referenciado es de 2B |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | El artefacto es un binario compilado; el backbone upstream se distribuye en Q4_K_M (audio) y Q4_K_M (omni), con mmproj en F16 y Q8_0 |
| Idiomas soportados | No disponible |
| Licencia | LFM Open License v1.0 (Apache-2.0 con umbral comercial adicional) |
| Formato de pesos | ONNX (`tts-sm8750.onnx`) + binario de contexto QAIRT (`tts-sm8750.bin`, 218.816.120 bytes) |

## Arquitectura y entrenamiento

El artefacto corresponde a un único pase del depthformer MaskGIT que forma parte del pipeline de síntesis de voz de LFM3. MaskGIT es un esquema de generación iterativa no autorregresiva basado en enmascaramiento y predicción paralela de tokens, habitual en codecs neuronales de audio. En este caso, el depthformer opera sobre las representaciones producidas por el backbone LFM3-Audio-2B, que junto con el códec y el embedding de retroalimentación permanecen en los ficheros GGUF y mmproj de Liquid.

BindX no ha reentrenado el modelo: la contribución es exclusivamente de conversión y empaquetado. El grafo ONNX se compila mediante QAIRT (Qualcomm AI Runtime) para el Hexagon Tensor Processor v79 del SM8750, generando un binario de contexto que el wrapper carga vía `ep_cache_context`. No se dispone de información sobre el dataset de entrenamiento original, número de tokens, ni si hubo RLHF o DPO en el modelo upstream. La innovación destacable es la compilación para NPU móvil, que habilita inferencia acelerada del decodificador de audio en hardware de smartphone.

## Capacidades

- Síntesis de voz (text-to-speech) como parte del pipeline LFM3-Audio, limitada a la etapa de decodificación de profundidad.
- No es un modelo autónomo: no acepta texto directamente ni produce audio por sí solo; requiere el backbone GGUF y el mmproj de Liquid.
- No soporta tool calling ni function calling de forma nativa en este artefacto.
- No soporta razonamiento multi-paso ni agentes; esas capacidades, si existen, residen en el backbone LFM3, no en este binario.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Aceleración por NPU Hexagon HTP v79 en Snapdragon 8 Elite (SM8750).
- Incompatible con motores TTS genéricos como Piper o Phonon, y no puede ser controlado por otro modelo de lenguaje.

## Casos de uso

- Síntesis de voz en dispositivos móviles con Snapdragon 8 Elite: el binario QAIRT se ejecuta sobre la NPU Hexagon, lo que permite generar audio en el propio terminal reduciendo el consumo energético y la dependencia de la nube.
- Asistentes de voz offline en Android: integrado en el pipeline LFM3-Audio completo (GGUF + mmproj + este depthformer), permite construir asistentes que funcionan sin conexión en hardware de gama alta.
- Lectura de contenido en aplicaciones de accesibilidad: un lector de pantalla o app de lectura puede sintetizar texto localmente con latencia baja gracias a la decodificación acelerada por NPU.
- Integración en aplicaciones de navegación con instrucciones habladas: la síntesis local evita enviar rutas y datos de ubicación a servidores externos.
- Prototipado de pipelines TTS en entornos embebidos: sirve como referencia para equipos que quieran medir el rendimiento del depthformer MaskGIT sobre Hexagon frente a alternativas en CPU o GPU.
- Investigación en codecs neuronales de audio: permite estudiar el comportamiento de un decodificador MaskGIT compilado para NPU en condiciones reales de despliegue.
- Distribución de actualizaciones de voz en apps móviles: al ser un artefacto de 0,2 GB, puede empaquetarse en la aplicación o descargarse bajo demanda sin un coste de almacenamiento elevado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- SoC objetivo: Qualcomm Snapdragon 8 Elite (SM8750) con Hexagon HTP v79; el binario está compilado específicamente para esa arquitectura y no funcionará en otros DSP.
- VRAM/RAM estimada: no disponible; el binario de contexto ocupa 218.816.120 bytes, pero el pipeline completo requiere además el GGUF del backbone (Q4_K_M) y el mmproj.
- GPU recomendadas: no aplica; el artefacto está pensado para NPU Hexagon, no para CUDA ni ROCm.
- Compatibilidad con GPU de consumo: no; no está diseñado para RTX 4090 ni similares.
- Opciones de despliegue: runtime QAIRT de Qualcomm con soporte de `ep_cache_context`; no es compatible con vLLM, llama.cpp, Ollama, TGI ni motores TTS como Piper o Phonon.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bindx-dev/lfm3-tts-sm8750 | Artefacto del depthformer de un backbone de 2B | No disponible | ONNX + binario QAIRT | LFM Open License v1.0 | Hugging Face |
| LiquidAI/LFM3-Audio-2B-GGUF | 2B | No disponible | GGUF + mmproj | LFM Open License v1.0 | Hugging Face |
| LiquidAI/LFM3-Omni-2B-GGUF | 2B | No disponible | GGUF + mmproj | LFM Open License v1.0 | Hugging Face |

La comparación directa con otros modelos TTS (por ejemplo, Piper o modelos basados en VITS) no es posible porque este artefacto no es un sistema TTS completo, sino una etapa del pipeline de Liquid. Los dos modelos de Liquid listados son los componentes upstream necesarios para que el depthformer funcione.

## Limitaciones y advertencias

- No es un modelo autónomo: sin el GGUF y el mmproj de Liquid no produce audio ni acepta texto.
- Incompatible con Piper, Phonon u otros motores TTS, y no puede ser dirigido por otro modelo de lenguaje.
- Atado a un hardware concreto (Hexagon HTP v79 en SM8750); no es portable a otros SoC ni a GPU.
- Sesgos conocidos: no disponibles.
- Riesgo de alucinación: no aplica directamente al ser un decodificador de audio, pero el pipeline completo puede heredar los sesgos del backbone.
- Limitaciones de contexto e idioma: no disponibles.
- Licencia LFM Open License v1.0: Apache-2.0 con umbral comercial adicional; es obligatorio leerla antes de un uso comercial. La redistribución de derivados debe mantener licencia, copyright, atribución y NOTICE upstream, e indicar qué ficheros se modificaron.
- El repositorio no replica los ficheros de Liquid; el Model Manager los descarga desde las URL fijadas en `bindx.json`.
- El autor no ofrece garantías sobre el binario compilado; su funcionamiento depende de la versión del runtime QAIRT y del firmware del dispositivo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/bindx-dev/lfm3-tts-sm8750
- Modelo upstream de audio: https://huggingface.co/LiquidAI/LFM3-Audio-2B-GGUF
- Modelo upstream omni: https://huggingface.co/LiquidAI/LFM3-Omni-2B-GGUF
- Pesos de audio (Q4_K_M): https://huggingface.co/LiquidAI/LFM3-Audio-2B-GGUF/resolve/39670cb5c42e9c4bfe046519ba7ffbe47f9552ad/LFM3-Audio-2B-Q4_K_M.gguf
- mmproj de audio (F16): https://huggingface.co/LiquidAI/LFM3-Audio-2B-GGUF/resolve/39670cb5c42e9c4bfe046519ba7ffbe47f9552ad/mmproj-LFM3-Audio-2B-F16.gguf
- Pesos omni (Q4_K_M): https://huggingface.co/LiquidAI/LFM3-Omni-2B-GGUF/resolve/d508b88f08a5b4286f2d2805a6a8d69a0ff44c72/LFM3-Omni-2B-Q4_K_M.gguf
- mmproj omni (Q8_0): https://huggingface.co/LiquidAI/LFM3-Omni-2B-GGUF/resolve/d508b88f08a5b4286f2d2805a6a8d69a0ff44c72/mmproj-LFM3-Omni-2B-Q8_0.gguf
- Licencia LFM Open License v1.0: https://www.liquid.ai/lfm-license
