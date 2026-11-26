# bindx-dev/lfm3-tts-sm8850

## Resumen

`bindx-dev/lfm3-tts-sm8850` no es un modelo de lenguaje ni un sistema de síntesis de voz autónomo, sino un artefacto de despliegue: la conversión a ONNX y a contexto binario QAIRT (Qualcomm AI Runtime) del decodificador de profundidad (*depthformer*) del modelo de audio LFM3-Audio-2B de Liquid AI, compilado específicamente para el DSP Hexagon HTP v81 presente en el SoC Qualcomm SM8850 (Snapdragon 8 Elite). El autor del repositorio es el usuario `bindx-dev`, mientras que los pesos originales pertenecen a Liquid AI.

El artefacto contiene una única pasada MaskGIT del depthformer, empaquetada en `tts-sm8850.onnx` junto con el contexto binario precompilado `tts-sm8850.bin` (218.894.336 bytes). El códec, el *feedback embedding* y el *backbone* de 2.000 millones de parámetros permanecen en el GGUF y el mmproj de Liquid AI, que no se incluyen en este repositorio (0,2 GB en total). Por tanto, este binario no puede ejecutarse de forma aislada ni es compatible con Piper, Phonon u otros motores TTS.

Su relevancia es de nicho: sirve para integrar la etapa de decodificación de audio de LFM3 en pipelines de inferencia acelerada por NPU Hexagon en dispositivos móviles con SM8850, dentro del ecosistema BindX. La licencia LFM Open v1.0 (Apache-2.0 con umbral comercial adicional) impone obligaciones de atribución y redistribución sobre cualquier derivado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Depthformer MaskGIT (decodificador de profundidad de LFM3-Audio-2B), convertido a ONNX + contexto QAIRT para Hexagon HTP v81 |
| Parametros totales | no disponible (el artefacto es solo la pasada del depthformer; el backbone de 2B reside en el GGUF de Liquid AI) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible para el artefacto ONNX; los GGUF de referencia upstream usan Q4_K_M (pesos) y F16/Q8_0 (mmproj) |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (Apache-2.0 con umbral comercial adicional) |
| Formato de pesos | ONNX (`tts-sm8850.onnx`) + contexto binario QAIRT (`tts-sm8850.bin`); requiere GGUF y mmproj de Liquid AI por separado |

## Arquitectura y entrenamiento

El artefacto corresponde al decodificador de profundidad de un modelo de audio de la familia LFM3 de Liquid AI. La arquitectura subyacente es un *depthformer* con muestreo tipo MaskGIT, es decir, un transformer que genera tokens de audio de forma iterativa mediante enmascaramiento y predicción paralela, en lugar de decodificación autorregresiva token a token. El modelo completo LFM3-Audio-2B combina un backbone de 2.000 millones de parámetros con un códec de audio y un *feedback embedding*; este repositorio solo contiene la pasada de decodificación compilada.

La conversión la realizó BindX con QAIRT versión 2.52.1.261105, apuntando al HTP v81 de Hexagon en el SoC SM8850. No se dispone de información sobre el dataset de entrenamiento original, el número de tokens, ni si hubo etapas de RLHF o DPO; esos datos corresponden a la model card de Liquid AI, no a este repositorio. La innovación técnica aquí no es de entrenamiento sino de despliegue: empaquetar una pasada del depthformer como contexto binario precompilado para ejecución en NPU móvil, con el wrapper ONNX nombrando el fichero de contexto mediante `ep_cache_context`.

## Capacidades

- Decodificación de tokens de audio correspondiente a una única pasada del depthformer MaskGIT del modelo LFM3-Audio-2B.
- Ejecución acelerada en Hexagon HTP v81 sobre SoC SM8850 mediante QAIRT.
- Integración en el ecosistema BindX Model Manager, que descarga los GGUF y mmproj de Liquid AI desde las URLs fijadas en `bindx.json`.
- No genera voz de forma autónoma: depende del códec, el feedback embedding y el backbone de 2B alojados en los ficheros de Liquid AI.
- No soporta tool calling, function calling, razonamiento multi-paso ni capacidades de agente por sí mismo.
- No es compatible con motores TTS de terceros como Piper o Phonon, ni puede ser conducido por otro modelo de lenguaje.
- Capacidades multilingües: no disponible.

## Casos de uso

- Síntesis de voz en dispositivo móvil con SM8850: integrado con el GGUF y el mmproj de LFM3-Audio-2B, el depthformer acelera la etapa de decodificación de audio en la NPU Hexagon, reduciendo la latencia frente a ejecución en CPU.
- Asistentes de voz *offline* en teléfonos de gama alta: al ejecutarse sobre el HTP v81, permite pipelines TTS locales sin depender de servicios en la nube, siempre que se empaquete junto con los ficheros upstream.
- Evaluación de QAIRT para TTS en producción: sirve como referencia para medir el rendimiento de un depthformer MaskGIT compilado en Hexagon frente a alternativas en GPU o CPU.
- Prototipado de aplicaciones BindX: el Model Manager descarga automáticamente los GGUF desde las URLs fijadas, lo que simplifica la puesta en marcha de un pipeline de audio completo.
- Investigación sobre decodificación MaskGIT en hardware móvil: permite estudiar el comportamiento de una pasada de depthformer en un DSP concreto con métricas de latencia y consumo.
- Distribución de artefactos derivados bajo licencia LFM Open v1.0: útil para equipos que necesiten empaquetar componentes de LFM3 para hardware específico respetando las obligaciones de atribución y aviso de modificaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- SoC objetivo: Qualcomm SM8850 (Snapdragon 8 Elite) con DSP Hexagon HTP v81; el contexto binario está compilado exclusivamente para esa arquitectura.
- VRAM: no aplica; el artefacto se ejecuta en la NPU Hexagon, no en GPU.
- GPU recomendadas: no disponible; no se contempla ejecución en A100, H100 ni RTX 4090 para este binario.
- Ejecución en GPU de consumo: no soportada por este artefacto.
- Despliegue: QAIRT 2.52.1.261105 con el wrapper ONNX (`tts-sm8850.onnx`) y el contexto `tts-sm8850.bin`; requiere además el GGUF y el mmproj de Liquid AI en el mismo directorio.
- Motores alternativos (vLLM, llama.cpp, Ollama, TGI): no aplicables a este binario; llama.cpp podría ejecutar los GGUF de Liquid AI, pero no este depthformer compilado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bindx-dev/lfm3-tts-sm8850 | Depthformer ONNX/QAIRT para Hexagon | no disponible (backbone upstream 2B) | no disponible | LFM Open v1.0 | Hugging Face, 0 descargas |
| LiquidAI/LFM3-Audio-2B-GGUF | Modelo de audio completo en GGUF | 2B | no disponible | LFM Open v1.0 | Hugging Face (upstream) |
| LiquidAI/LFM3-Omni-2B-GGUF | Modelo omni completo en GGUF | 2B | no disponible | LFM Open v1.0 | Hugging Face (upstream) |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El binario no es un modelo autónomo: sin el GGUF, el mmproj y el códec de Liquid AI no produce voz.
- Solo funciona en Hexagon HTP v81 sobre SM8850; no es portable a otros SoC ni a GPU.
- Incompatible con Piper, Phonon y otros motores TTS, y no puede ser dirigido por otro modelo de lenguaje.
- El repositorio no replica los ficheros upstream; depende de las URLs fijadas a commits concretos, lo que puede romperse si Liquid AI modifica o retira esos artefactos.
- Licencia LFM Open v1.0: Apache-2.0 con umbral comercial adicional; es obligatorio conservar licencia, copyright, atribución y NOTICE upstream, e indicar qué ficheros se modificaron. Los repositorios GGUF de Liquid no incluyen fichero NOTICE.
- Riesgo de alucinación y sesgos: no evaluable para este artefacto; dependerá del modelo upstream.
- Idiomas soportados y limitaciones de contexto: no disponible.
- Sin descargas ni likes en el momento de la consulta; madurez y soporte comunitario nulos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/bindx-dev/lfm3-tts-sm8850
- Modelo de audio upstream: https://huggingface.co/LiquidAI/LFM3-Audio-2B-GGUF
- Pesos upstream (commit fijado): https://huggingface.co/LiquidAI/LFM3-Audio-2B-GGUF/resolve/39670cb5c42e9c4bfe046519ba7ffbe47f9552ad/LFM3-Audio-2B-Q4_K_M.gguf
- mmproj upstream (commit fijado): https://huggingface.co/LiquidAI/LFM3-Audio-2B-GGUF/resolve/39670cb5c42e9c4bfe046519ba7ffbe47f9552ad/mmproj-LFM3-Audio-2B-F16.gguf
- Modelo omni upstream: https://huggingface.co/LiquidAI/LFM3-Omni-2B-GGUF
- Pesos omni (commit fijado): https://huggingface.co/LiquidAI/LFM3-Omni-2B-GGUF/resolve/ecb21b5210b7487d8d7e07d454f7a538864e3fcc/LFM3-Omni-2B-Q4_K_M.gguf
- mmproj omni (commit fijado): https://huggingface.co/LiquidAI/LFM3-Omni-2B-GGUF/resolve/ecb21b5210b7487d8d7e07d454f7a538864e3fcc/mmproj-LFM3-Omni-2B-Q8_0.gguf
- Licencia LFM Open v1.0: https://www.liquid.ai/lfm-license
