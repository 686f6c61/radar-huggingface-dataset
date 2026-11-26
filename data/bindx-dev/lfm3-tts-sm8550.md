# bindx-dev/lfm3-tts-sm8550

## Resumen

lfm3-tts-sm8550 es un artefacto de despliegue derivado de los modelos LFM3-Audio-2B y LFM3-Omni-2B de Liquid AI, publicado por el usuario bindx-dev. No se trata de un modelo de lenguaje autonomo ni de un sistema de sintesis de voz completo: es unicamente el decodificador de profundidad (depthformer) del pipeline de sintesis de voz de LFM3, convertido al formato ONNX/QAIRT 2.52.1.261105 para ejecutarse sobre el DSP Hexagon HTP v73 del SoC Qualcomm SM8550 (Snapdragon 8 Gen 2).

El repositorio contiene dos ficheros: `tts-sm8550.onnx` (la grafo ONNX de una pasada MaskGIT del depthformer) y `tts-sm8550.bin` (el context binary precompilado para Hexagon, de 218.820.608 bytes). El codec de audio, el embedding de retroalimentacion y el backbone de 2.000 millones de parametros permanecen en los GGUF y mmproj originales de Liquid AI, que este repositorio no replica. Por tanto, el binario no funciona de forma aislada ni puede ser controlado por Piper, Phonon u otro motor de TTS generico.

Su relevancia es acotada pero tecnica: demuestra como portar el decodificador de un modelo de voz de 2B a la NPU de un telefono Android de gama alta mediante QAIRT, un paso necesario para inferencia de voz en dispositivo sin depender de la nube. El repositorio ocupa 0,2 GB y no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Depthformer MaskGIT (decodificador de profundidad del pipeline TTS de LFM3), exportado a ONNX y compilado para Hexagon HTP v73 |
| Parametros totales | no disponible (el artefacto es solo el decodificador; el backbone asociado es de 2B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible para el ONNX; los GGUF de referencia upstream usan Q4_K_M y el mmproj Q8_0/F16 |
| Idiomas soportados | no disponible |
| Licencia | lfm-open-license-v1.0 (Apache-2.0 con umbral comercial adicional) |
| Formato de pesos | ONNX (`.onnx`) + context binary QAIRT (`.bin`) |

## Arquitectura y entrenamiento

El artefacto corresponde a una unica pasada del depthformer MaskGIT que forma parte del decodificador de voz de la familia LFM3 de Liquid AI. MaskGIT es un esquema de generacion iterativa no autorregresiva por enmascaramiento, habitual en decodificadores de tokens acusticos. El modelo base del que procede, LFM3-Audio-2B, combina un backbone de 2.000 millones de parametros con un codec de audio y un embedding de retroalimentacion; el depthformer aqui exportado opera sobre esas representaciones, no sobre texto ni audio en bruto.

La conversion la realizo bindx-dev con QAIRT 2.52.1.261105, dirigida a Hexagon HTP v73 sobre SM8550. El resultado son un grafo ONNX y un context binary precompilado de 218.820.608 bytes, referenciado por el wrapper mediante `ep_cache_context`. No se dispone de informacion sobre el dataset de entrenamiento original, el numero de tokens, ni si hubo RLHF o DPO; esos datos corresponden a la model card de Liquid AI, no incluida en la informacion disponible.

## Capacidades

- Sintesis de voz: aporta la fase de decodificacion de profundidad del pipeline TTS de LFM3, siempre en combinacion con los GGUF y mmproj de Liquid AI.
- Ejecucion en NPU: disenado para el DSP Hexagon HTP v73 del Snapdragon 8 Gen 2 (SM8550), lo que permite inferencia de voz en dispositivo.
- Integracion con el runtime QAIRT: el context binary precompilado evita la compilacion en el dispositivo.
- No soporta tool calling, function calling ni razonamiento multi-paso por si mismo.
- No es un modelo multimodal autonomo: la parte de audio y lenguaje reside en los ficheros upstream.
- No es compatible con motores TTS genericos como Piper o Phonon, ni puede ser dirigido por otro modelo de lenguaje.

## Casos de uso

- TTS en dispositivo Android de gama alta: empaquetar `tts-sm8550.onnx` y `tts-sm8550.bin` junto con el GGUF LFM3-Audio-2B-Q4_K_M y su mmproj para generar voz sin conexion en terminales con Snapdragon 8 Gen 2, reduciendo latencia y evitando enviar audio a la nube.
- Asistentes de voz offline: integrar el pipeline completo en aplicaciones de accesibilidad o navegacion que requieren lectura de texto a voz con baja latencia y sin red.
- Evaluacion de QAIRT en Hexagon: usar el context binary como referencia para medir throughput y consumo del depthformer en HTP v73 antes de portar otros componentes del modelo.
- Prototipado de pipelines TTS hifridos: combinar el decodificador en NPU con el backbone en CPU/GPU para estudiar el reparto de carga entre Hexagon y el SoC principal.
- Investigacion en decodificacion MaskGIT: analizar el grafo ONNX para estudiar el esquema de generacion iterativa del depthformer de LFM3.
- Distribucion controlada de derivados: servir como ejemplo de cumplimiento de la LFM Open License v1.0 al redistribuir un artefacto derivado con atribucion y aviso de modificaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- SoC objetivo: Qualcomm SM8550 (Snapdragon 8 Gen 2) con Hexagon HTP v73; el context binary esta compilado especificamente para esa arquitectura.
- VRAM: no aplica en el sentido de GPU de escritorio; el artefacto se ejecuta en el DSP Hexagon del SoC.
- Memoria: el context binary ocupa 218.820.608 bytes; hay que sumar el GGUF LFM3-Audio-2B-Q4_K_M y el mmproj correspondiente, no incluidos en este repositorio.
- GPU de escritorio: no disponible; no se documenta ejecucion en A100, H100 ni RTX 4090.
- Opciones de despliegue: runtime QAIRT 2.52.1.261105 sobre Hexagon; no compatible con vLLM, llama.cpp, Ollama ni TGI para este artefacto concreto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lfm3-tts-sm8550 (este) | solo depthformer (backbone 2B asociado) | no disponible | ONNX + QAIRT bin | lfm-open-license-v1.0 | Hugging Face, 0 descargas |
| LiquidAI/LFM3-Audio-2B-GGUF | 2B | no disponible | GGUF (Q4_K_M) + mmproj | lfm-open-license-v1.0 | Hugging Face, upstream oficial |
| LiquidAI/LFM3-Omni-2B-GGUF | 2B | no disponible | GGUF (Q4_K_M) + mmproj | lfm-open-license-v1.0 | Hugging Face, upstream oficial |

No se dispone de datos de rendimiento para comparar numericamente con alternativas de la misma categoria.

## Limitaciones y advertencias

- No es un modelo autonomo: sin el GGUF y el mmproj de Liquid AI no genera voz; el binario por si solo no produce audio.
- Dependencia de hardware: el context binary esta compilado para Hexagon HTP v73 en SM8550; no funcionara en otros SoC sin recompilar.
- Incompatibilidad con motores TTS estandar: no puede usarse con Piper, Phonon ni controlarse desde otro modelo de lenguaje.
- Licencia: LFM Open License v1.0 es Apache-2.0 con un umbral comercial adicional; es obligatorio leerla antes de un uso comercial. La redistribucion de derivados debe conservar licencia, copyright, atribucion y NOTICE upstream, e indicar que ficheros se modificaron.
- Sin datos de sesgo, alucinacion ni cobertura idiomatica: no disponibles para este artefacto.
- Repositorio sin adopcion: 0 descargas y 0 likes, sin validacion comunitaria conocida.
- El autor no replica los ficheros upstream; el Model Manager debe descargarlos desde las URLs fijadas en `bindx.json`.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/bindx-dev/lfm3-tts-sm8550
- Modelo de audio upstream: https://huggingface.co/LiquidAI/LFM3-Audio-2B-GGUF
- Modelo omni upstream: https://huggingface.co/LiquidAI/LFM3-Omni-2B-GGUF
- Pesos de audio (commit fijado): https://huggingface.co/LiquidAI/LFM3-Audio-2B-GGUF/resolve/39670cb5c42e9c4bfe046519ba7ffbe47f9552ad/LFM3-Audio-2B-Q4_K_M.gguf
- mmproj de audio: https://huggingface.co/LiquidAI/LFM3-Audio-2B-GGUF/resolve/39670cb5c42e9c4bfe046519ba7ffbe47f9552ad/mmproj-LFM3-Audio-2B-F16.gguf
- Pesos omni (commit fijado): https://huggingface.co/LiquidAI/LFM3-Omni-2B-GGUF/resolve/ecb21b5210b7487d8d7e07d454f7a538864e3fcc/LFM3-Omni-2B-Q4_K_M.gguf
- mmproj omni: https://huggingface.co/LiquidAI/LFM3-Omni-2B-GGUF/resolve/ecb21b5210b7487d8d7e07d454f7a538864e3fcc/mmproj-LFM3-Omni-2B-Q8_0.gguf
- Licencia LFM Open License v1.0: https://www.liquid.ai/lfm-license
