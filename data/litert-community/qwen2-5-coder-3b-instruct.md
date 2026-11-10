# litert-community/Qwen2.5-Coder-3B-Instruct

## Resumen

Qwen2.5-Coder-3B-Instruct (LiteRT-LM) es la variante empaquetada por la comunidad `litert-community` del modelo Qwen2.5-Coder-3B-Instruct de Alibaba Qwen, convertida al formato LiteRT-LM de Google para inferencia en dispositivo (on-device). El objetivo no es ofrecer un modelo nuevo, sino un artefacto listo para ejecutarse en moviles, portatiles y equipos de escritorio sin necesidad de infraestructura de servidor GPU, usando el runtime LiteRT-LM (antes TFLite) con aceleracion por CPU (XNNPACK) o GPU (OpenCL).

El modelo subyacente es un transformer denso de 3.000 millones de parametros, especializado en generacion de codigo y ajustado con instrucciones. Esta empaquetado en un unico fichero `.litertlm` de 3,4 GB con cuantizacion de pesos a int8 dinamica y activaciones en fp32 (`dynamic_wi8_afp32`). La licencia Apache 2.0 del modelo original se mantiene, lo que permite uso comercial sin restricciones adicionales.

Su relevancia actual radica en que demuestra que un modelo de codigo de 3B puede ejecutarse en un telefono de gama alta con latencias interactivas: en un Snapdragon 8 Elite Gen 5 alcanza 16,3-16,5 tokens/s de decodificacion por GPU con 864 MB de RSS pico, y en un Apple M4 Max llega a 77,8 tokens/s por GPU. Es una opcion practica para asistentes de codigo locales, autocompletado en IDE y agentes embebidos sin conexion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2.5-Coder), empaquetado LiteRT-LM |
| Parametros totales | 3B (modelo base Qwen2.5-Coder-3B-Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (la model card no declara la ventana del artefacto) |
| Tipos de cuantizacion | Pesos int8 dinamicos, activaciones fp32 (`dynamic_wi8_afp32`) |
| Idiomas soportados | en (segun metadatos del repo) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM), fichero unico de 3,4 GB |
| Tamano del repo | 3,4 GB |
| Runtime | litert-lm (CLI `litert-lm`, libreria `litert-lm`) |
| Backends | CPU (XNNPACK), GPU (OpenCL / `LITERT_CL`) |
| Modelo base | Qwen/Qwen2.5-Coder-3B-Instruct (relacion: quantized) |

## Arquitectura y entrenamiento

El artefacto es una conversion del Qwen2.5-Coder-3B-Instruct original, un transformer decoder-only denso de 3B parametros entrenado por Alibaba Qwen para tareas de codigo y ajustado con instrucciones. No se ha reentrenado ni modificado el modelo: la model card indica explicitamente `base_model_relation: quantized`, es decir, solo se ha aplicado cuantizacion y empaquetado para el runtime LiteRT-LM.

La innovacion tecnica del artefacto esta en el pipeline de despliegue, no en el modelo. LiteRT-LM compila el grafo completo para el backend elegido: en la medicion sobre Galaxy S26, el backend GPU OpenCL ejecuta 1603/1603 operaciones en decodificacion y 1452/1452 en prefill, sin fallback a CPU. La cuantizacion `dynamic_wi8_afp32` reduce los pesos a int8 manteniendo activaciones en fp32, lo que equilibra tamano (3,4 GB) y calidad numerica. No se dispone de informacion sobre el dataset de entrenamiento original, numero de tokens, ni si hubo RLHF/DPO en esta ficha; esos datos corresponden a la model card del modelo base Qwen y no se han proporcionado aqui.

## Capacidades

- Generacion de texto y codigo en ingles (idioma declarado en los metadatos).
- Generacion de codigo en multiples lenguajes de programacion (heredado de Qwen2.5-Coder).
- Razonamiento sobre instrucciones (variante Instruct del modelo base).
- Inferencia en dispositivo sin conexion a red, con CPU o GPU local.
- Ejecucion en moviles Android de gama alta y en equipos de escritorio (macOS medido).
- Tool calling / function calling: no confirmado en la informacion proporcionada.
- Soporte de agentes multi-paso: no confirmado en la informacion proporcionada.
- Capacidades multilingues: limitadas a `en` segun los metadatos del repo.
- Vision / audio / thinking mode: no disponible en esta variante.

## Casos de uso

- Asistente de codigo en IDE de escritorio: el modelo se integra en un plugin local que envia el contexto del fichero y recibe sugerencias; en Apple M4 Max por GPU alcanza 77,8 tok/s de decodificacion con 0,21 s de TTFT, suficiente para autocompletado interactivo.
- Autocompletado y explicacion de codigo en movil: una app Android puede empaquetar el fichero `.litertlm` de 3,4 GB y ejecutarlo por OpenCL en un Snapdragon 8 Elite Gen 5 con 16,3-16,5 tok/s y 864 MB de RSS pico, sin enviar codigo a la nube.
- Revisión de codigo offline en entornos air-gapped: en portatiles sin GPU dedicada se usa el backend CPU (XNNPACK) con 26,7 tok/s en M4 Max, suficiente para tareas por lotes de generacion de tests o documentacion.
- Generacion de tests unitarios en pipelines de CI: el modelo puede invocarse desde un runner para producir tests a partir de diffs, con latencia de prefill de 0,21 s por GPU en M4 Max.
- Educacion y aprendizaje de programacion: un tutor embebido que explica fragmentos de codigo y responde dudas sin conexion, apropiado por su tamano reducido y licencia Apache 2.0.
- Prototipado de agentes de codigo en dispositivo: base para experimentar con tool calling local (a validar, ya que no esta confirmado en la informacion disponible) y flujos multi-paso sobre el codigo del usuario.
- Migracion y traduccion de fragmentos entre lenguajes: uso como modelo local de transformation en editores, con la ventaja de no requerir servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la informacion disponible. La model card solo incluye mediciones de rendimiento del runtime:

| Plataforma | Backend | Prefill (tok/s) | Decode (tok/s) | TTFT (s) | Init (s) | RSS pico |
|---|---|---|---|---|---|---|
| Apple M4 Max | CPU | 121 | 26,7 | 2,16 | no disponible | no disponible |
| Apple M4 Max | GPU | 1.320 | 77,8 | 0,21 | no disponible | no disponible |
| Galaxy S26 (Snapdragon 8 Elite Gen 5) | GPU (OpenCL) | 403-423 | 16,3-16,5 | 0,59-0,61 | 4,3-4,9 | 864 MB |
| Galaxy S26 (Snapdragon 8 Elite Gen 5) | CPU (XNNPACK) | 159-187 | 12,1-13,6 | 1,26-1,49 | 3,6-4,6 | 3934 MB |

Mediciones: Apple M4 Max con `litert-lm benchmark -p 256 -d 256 --runs 3 --cache no` (litert-lm 0.15.0); Galaxy S26 con `litert_lm_advanced_main` de litert-lm v0.16.0, prompt fijo de 205 tokens (223 con el tokenizer del modelo), dos ejecuciones por backend.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| Qwen2.5-Coder-3B-Instruct (LiteRT-LM) | 3B | no disponible | `.litertlm` int8 | Apache 2.0 | On-device, movil y escritorio |
| Qwen2.5-Coder-3B-Instruct (original) | 3B | no disponible en esta ficha | safetensors | Apache 2.0 | Servidor GPU (vLLM, TGI) |
| Qwen2.5-Coder-7B-Instruct | 7B | no disponible en esta ficha | safetensors | Apache 2.0 | Mayor calidad, requiere mas VRAM |
| Otros modelos de codigo on-device (p. ej. variantes GGUF de 3B) | 3B | no disponible | GGUF | segun modelo | llama.cpp / Ollama en CPU |

La ventaja diferencial frente al original es el despliegue sin servidor y la aceleracion GPU en moviles; frente a variantes GGUF, el runtime LiteRT-LM ofrece backend OpenCL con ejecucion completa del grafo en GPU (1603/1603 ops), lo que reduce el RSS pico a 864 MB frente a 3934 MB en CPU.

## Limitaciones y advertencias

- Idiomas: los metadatos declaran solo `en`; el rendimiento en castellano no esta garantizado ni documentado.
- Ventana de contexto: no declarada en la informacion disponible; no asumir los 32k del modelo base sin verificacion.
- Calidad: la cuantizacion int8 puede degradar ligeramente la precision frente al modelo original en fp16/bf16; no hay benchmarks de calidad publicados para esta variante.
- Alucinacion: como todo modelo generativo de codigo, puede producir APIs inexistentes o codigo incorrecto; requiere validacion en produccion.
- Tool calling y agentes: no confirmados; verificar antes de disenar flujos dependientes de function calling.
- Hardware: el RSS pico en CPU en movil (3934 MB) puede superar la memoria disponible en dispositivos de gama media; el backend GPU es el recomendado.
- Licencia: Apache 2.0 permite uso comercial, pero el artefacto depende del runtime LiteRT-LM de Google, cuyos terminos deben revisarse por separado.
- Fecha de creacion del repo (2026-06-26) y actualizacion (2026-11-10): verificar que la version del runtime litert-lm usada en produccion coincide con la de las mediciones (0.15.0 / 0.16.0).

## Enlaces

- Hugging Face: https://huggingface.co/litert-community/Qwen2.5-Coder-3B-Instruct
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-3B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-3B-Instruct/blob/main/LICENSE
- Documentacion LiteRT-LM: https://ai.google.dev/edge/litert-lm/overview
- Ejemplos de apps: https://github.com/google-ai-edge/litert-samples
