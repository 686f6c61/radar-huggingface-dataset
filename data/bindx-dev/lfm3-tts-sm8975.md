# bindx-dev/lfm3-tts-sm8975

## Resumen

`bindx-dev/lfm3-tts-sm8975` es un artefacto de conversion ONNX publicado por el usuario bindx-dev que contiene unicamente el decodificador de profundidad (depthformer) del modelo de sintesis de voz de Liquid AI, empaquetado para el Hexagon Tensor Processor (HTP) v85 de la plataforma Qualcomm SM8975 mediante el toolkit QAIRT 2.52.1.261105. No se trata de un modelo de voz autonomo: el codec, el embedding de retroalimentacion y el backbone de 2B parametros permanecen en los GGUF y mmproj originales de Liquid AI, que este repositorio no replica.

El artefacto deriva de los modelos `LiquidAI/LFM3-Audio-2B-GGUF` y `LiquidAI/LFM3-Omni-2B-GGUF` en commits fijados, y su utilidad es acelerar en hardware Qualcomm la pasada MaskGIT del depthformer dentro de un pipeline TTS mas amplio. El repositorio pesa 0,2 GB y consta de dos ficheros: un grafo ONNX y un binario de contexto de 218.898.432 bytes.

Su relevancia es acotada y muy especifica: sirve a desarrolladores que despliegan TTS sobre SoC Qualcomm SM8975 y necesitan el componente de decodificacion ya compilado para HTP. No es utilizable con Piper, Phonon ni con otro modelo de lenguaje, y no funciona de forma aislada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Depthformer MaskGIT (decodificador de profundidad) del modelo LFM3 de Liquid AI, convertido a ONNX con QAIRT 2.52.1.261105 para Hexagon HTP v85 |
| Parametros totales | no disponible (el backbone asociado es de 2B, pero este artefacto solo contiene el depthformer) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible para el artefacto ONNX; los GGUF de origen referenciados usan Q4_K_M y el mmproj F16 / Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | lfm-open-license-v1.0 (Apache-2.0 con umbral comercial adicional) |
| Formato de pesos | ONNX (`tts-sm8975.onnx`) mas binario de contexto QAIRT (`tts-sm8975.bin`, 218.898.432 bytes) |

## Arquitectura y entrenamiento

El artefacto es una conversion, no un entrenamiento. Contiene una unica pasada del depthformer MaskGIT que forma parte del decodificador de audio de LFM3. La arquitectura subyacente del modelo completo es la de LFM3 de Liquid AI, con un backbone de 2B parametros y un decodificador de audio basado en codec y depthformer; este repositorio solo incluye la parte de decodificacion de profundidad compilada para el acelerador Hexagon HTP v85 del SoC SM8975.

No se dispone de informacion sobre datos de entrenamiento, numero de tokens, composicion del dataset ni fases de RLHF o DPO para este artefacto. La innovacion tecnica relevante es la propia conversion QAIRT: el grafo ONNX se acompana de un binario de contexto precompilado que el wrapper referencia mediante `ep_cache_context`, lo que permite ejecutar la pasada del depthformer en el HTP sin recompilacion en tiempo de ejecucion.

## Capacidades

- Decodificacion de profundidad (depthformer) para el pipeline TTS de LFM3: ejecuta una pasada MaskGIT del decodificador de audio.
- Aceleracion en hardware Qualcomm: el binario de contexto esta compilado para Hexagon HTP v85 en SM8975.
- Integracion con los GGUF y mmproj de Liquid AI: requiere los ficheros originales para el codec, el embedding de retroalimentacion y el backbone de 2B.
- No genera voz de forma autonoma: el binario no es una voz independiente.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un componente de inferencia de audio.
- No dispone de capacidades multilingues declaradas en la informacion disponible.
- No es compatible con Piper, Phonon ni con otro modelo de lenguaje como controlador.

## Casos de uso

- Despliegue de TTS en dispositivos con SoC Qualcomm SM8975: se usa como componente de decodificacion dentro de un pipeline LFM3 completo, aprovechando el binario de contexto precompilado para HTP y evitando la compilacion en el dispositivo.
- Prototipado de sintesis de voz en entornos embebidos Qualcomm: permite validar la latencia del depthformer en el HTP antes de integrar el resto del pipeline con los GGUF de Liquid AI.
- Integracion en aplicaciones de asistente de voz local: combinado con el backbone de 2B y el codec de Liquid AI, habilita generacion de voz en el dispositivo sin depender de la nube, siempre que se ensamblen los ficheros segun las instrucciones del autor.
- Evaluacion comparativa de aceleracion HTP frente a CPU/GPU: al ser un artefacto ONNX con contexto QAIRT, sirve para medir el rendimiento del depthformer en Hexagon frente a otras rutas de ejecucion del mismo modelo.
- Cadena de herramientas de conversion QAIRT: util como referencia para equipos que conviertan otros componentes de LFM3 o modelos similares a ONNX con contexto HTP v85.
- Distribucion controlada mediante Model Manager: el fichero `bindx.json` registra las URL de origen, lo que facilita que una herramienta de gestion descargue los GGUF y mmproj de Liquid AI y monte la carpeta de despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el artefacto esta orientado a Hexagon HTP v85, no a GPU convencional.
- GPU recomendadas: no aplica; el destino es el acelerador Hexagon del SoC Qualcomm SM8975.
- Compatibilidad con GPU de consumo: no disponible; no se documenta ejecucion en RTX 4090 ni similares.
- Opciones de despliegue: runtime QAIRT con el binario de contexto (`tts-sm8975.bin`) referenciado por `ep_cache_context`; requiere ademas los GGUF y mmproj de Liquid AI (`LFM3-Audio-2B-Q4_K_M.gguf`, `mmproj-LFM3-Audio-2B-F16.gguf`, `LFM3-Omni-2B-Q4_K_M.gguf`, `mmproj-LFM3-Omni-2B-Q8_0.gguf`).
- Latencia y throughput: no disponibles.
- Almacenamiento: repositorio de 0,2 GB; el binario de contexto ocupa 218.898.432 bytes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bindx-dev/lfm3-tts-sm8975 | no disponible (depthformer de un backbone de 2B) | no disponible | ONNX + contexto QAIRT | lfm-open-license-v1.0 | Hugging Face, 0 descargas |
| LiquidAI/LFM3-Audio-2B-GGUF | 2B | no disponible | GGUF + mmproj | lfm-open-license-v1.0 | Hugging Face (origen) |
| LiquidAI/LFM3-Omni-2B-GGUF | 2B | no disponible | GGUF + mmproj | lfm-open-license-v1.0 | Hugging Face (origen) |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- No es un modelo autonomo: sin los GGUF y mmproj de Liquid AI no produce voz; el codec, el embedding de retroalimentacion y el backbone de 2B no estan incluidos.
- Incompatible con Piper, Phonon y otros motores TTS genericos, y no puede controlarse mediante otro modelo de lenguaje.
- Dependencia de hardware muy concreta: el binario de contexto esta compilado para Hexagon HTP v85 en SM8975; no se garantiza su funcionamiento en otras plataformas.
- Licencia con umbral comercial: lfm-open-license-v1.0 es Apache-2.0 con un umbral comercial adicional; debe leerse antes de cualquier uso comercial.
- Obligaciones de redistribucion: toda obra derivada debe conservar licencia, copyright, atribucion y cualquier NOTICE upstream, e indicar que ficheros se modificaron; los repositorios GGUF de Liquid no incluyen fichero NOTICE.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible para este artefacto.
- Idiomas soportados: no declarados; no se puede asumir cobertura multilingue.
- Madurez: repositorio con 0 descargas y 0 likes, creado y actualizado en la misma fecha (2026-11-26), sin senales de validacion por parte de la comunidad.
- El autor no replica los ficheros de Liquid AI; el usuario debe descargarlos de las URL fijadas por commit, lo que introduce dependencia de su disponibilidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/bindx-dev/lfm3-tts-sm8975
- Modelo de audio de origen: https://huggingface.co/LiquidAI/LFM3-Audio-2B-GGUF (commit `39670cb5c42e9c4bfe046519ba7ffbe47f9552ad`)
- Pesos de audio: https://huggingface.co/LiquidAI/LFM3-Audio-2B-GGUF/resolve/39670cb5c42e9c4bfe046519ba7ffbe47f9552ad/LFM3-Audio-2B-Q4_K_M.gguf
- mmproj de audio: https://huggingface.co/LiquidAI/LFM3-Audio-2B-GGUF/resolve/39670cb5c42e9c4bfe046519ba7ffbe47f9552ad/mmproj-LFM3-Audio-2B-F16.gguf
- Modelo Omni de origen: https://huggingface.co/LiquidAI/LFM3-Omni-2B-GGUF (commit `ecb21b5210b7487d8d7e07d454f7a538864e3fcc`)
- Pesos Omni: https://huggingface.co/LiquidAI/LFM3-Omni-2B-GGUF/resolve/ecb21b5210b7487d8d7e07d454f7a538864e3fcc/LFM3-Omni-2B-Q4_K_M.gguf
- mmproj Omni: https://huggingface.co/LiquidAI/LFM3-Omni-2B-GGUF/resolve/ecb21b5210b7487d8d7e07d454f7a538864e3fcc/mmproj-LFM3-Omni-2B-Q8_0.gguf
- Licencia LFM Open License v1.0: https://www.liquid.ai/lfm-license
