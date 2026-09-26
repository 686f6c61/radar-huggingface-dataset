# MidlightDDK/pocketsql-base-0.5b

## Resumen

PocketSQL base 0.5b es una reexportacion a ONNX sin modificar de Qwen/Qwen2.5-Coder-0.5B-Instruct (revision `ea3f2471cf1b1f0db85067f1ef93848e38e88c25`), publicada por el usuario MidlightDDK dentro del proyecto PocketSQL. No es un modelo afinado: se trata del "export spike" y de la linea base zero-shot sobre la que el proyecto pretende entrenar un modelo capaz de escribir SQL de DuckDB directamente en el navegador. Su unico proposito es servir como artefacto de despliegue en cliente y como referencia de comparacion.

El modelo conserva la arquitectura del Qwen2.5-Coder-0.5B-Instruct original (transformer decoder-only de la familia Qwen2) y solo cambia el formato de pesos: frente a los safetensors de PyTorch, aqui se distribuyen dos ficheros ONNX cuantizados a int4, uno pensado para WebGPU (`q4f16`, 276 MiB) y otro para el fallback WASM (`q4`, 310 MiB). El repositorio ocupa 0,6 GB e integra `transformers.js_config` en `config.json` para seleccionar automaticamente el dtype correcto segun el backend.

Su relevancia es practica: demuestra que un modelo de generacion de codigo de ~0,5B puede ejecutarse integramente en el navegador mediante Transformers.js y ONNX Runtime, sin servidor y sin conexion de red. Al mismo tiempo, la propia model card documenta una perdida de fidelidad notable de la cuantizacion int4 frente a fp32, un dato util para cualquiera que planee desplegar modelos pequenos cuantizados en cliente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2), reexportado a ONNX |
| Parametros totales | ~0,5 mil millones (0,5B), heredados de Qwen2.5-Coder-0.5B-Instruct |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 32 768 tokens en el modelo base Qwen2.5-Coder-0.5B-Instruct; no declarada explicitamente en esta ficha |
| Tipos de cuantizacion | int4 con `block_size=32`; dos variantes: `q4f16` (WebGPU) y `q4` (WASM); la variante fp32 existe pero no se ha publicado |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`onnx/model_q4f16.onnx`, `onnx/model_q4.onnx`) |

Tabla de ficheros publicados:

| dtype de Transformers.js | Fichero | Descarga (con tokenizer) | Uso previsto |
|---|---|---|---|
| q4f16 | `onnx/model_q4f16.onnx` | 276 MiB | WebGPU (por defecto) |
| q4 | `onnx/model_q4.onnx` | 310 MiB | Fallback WASM |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base sin alteraciones: un transformer decoder-only de la familia Qwen2, con el mismo numero de capas y cabezas que Qwen2.5-Coder-0.5B-Instruct. Todo el trabajo de este repositorio es de exportacion, no de entrenamiento. La conversion se realizo con el model builder de ONNX Runtime GenAI (`onnxruntime-genai==0.17.0`), la misma herramienta cuyos tags de producer aparecen en las builds ONNX de la organizacion onnx-community para modelos Qwen. Los comandos empleados fueron `-p int4 -e webgpu --extra_options block_size=32` para la variante q4f16 y `-p int4 -e cpu --extra_options block_size=32` para la variante q4.

Como ajuste especifico para Transformers.js, la dimension de cabeza de la KV-cache queda fijada a 64, de modo que la libreria puede dimensionar correctamente la cache vacia. Ademas, el campo `transformers.js_config` de `config.json` indica que se use q4f16 en WebGPU y q4 en WASM, lo que permite que el mismo identificador de modelo funcione en ambos backends sin intervencion manual. No hay RLHF, DPO ni ningun otro proceso de alineacion adicional: el modelo se publica tal cual sale del export, y el propio autor lo etiqueta como "not fine-tuned" y como baseline zero-shot para PocketSQL.

## Capacidades

- Generacion de texto y de codigo general, heredadas del modelo base Qwen2.5-Coder-0.5B-Instruct.
- Generacion de SQL en modo zero-shot (sin afinado especifico para DuckDB en esta ficha); la calidad en esta tarea es precisamente lo que el proyecto PocketSQL pretende medir como linea base.
- Conversacion multi-turno basica: la etiqueta `conversational` y el hecho de derivar de una variante Instruct indican soporte de formato de chat con mensaje de sistema.
- Ejecucion en navegador: soporte nativo de WebGPU y de fallback WASM a traves de Transformers.js.
- Inferencia local y offline: no requiere servidor ni conexion de red una vez descargados los ficheros.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Vision o audio: no; el modelo es exclusivamente de texto.
- Modo thinking explicito: no disponible.

## Casos de uso

- Linea base de evaluacion para text-to-SQL: el modelo sirve para fijar el rendimiento zero-shot antes de afinar variantes de PocketSQL, de modo que cualquier mejora posterior pueda cuantificarse contra este artefacto.
- Demo de text-to-SQL en el navegador: al ser un ONNX de 276 MiB que corre sobre WebGPU, permite montar una demostracion interactiva que genere SQL de DuckDB sin backend, util para validar la viabilidad del producto antes de invertir en infraestructura.
- Inferencia en cliente con requisitos de privacidad: como el modelo se ejecuta localmente, el esquema de la base de datos y las consultas del usuario no salen del dispositivo, lo que encaja en escenarios con datos sensibles.
- Prototipado rapido de asistentes de consulta sobre datos tabulares: con un prompt de sistema y un DDL compacto del esquema, se puede integrar en un notebook o en una pagina web para explorar ideas de interfaz conversacional sobre DuckDB.
- Herramienta educativa sobre SQL: el modelo puede usarse en entornos de ensenanza como generador de consultas de referencia, siempre que se advierta de que su exactitud es limitada y de que las salidas deben revisarse.
- Prueba de pipelines de exportacion ONNX: dado que documenta la receta exacta de construccion (onnxruntime-genai, int4, block_size=32, KV-cache a 64) y su paridad frente a fp32, resulta util como referencia reproducible para exportar otros modelos pequenos a Transformers.js.
- Validacion de despliegue WebGPU/WASM: permite comprobar en un entorno real la conmutacion automatica entre q4f16 y q4 declarada en `config.json`, algo util para equipos que evaluan Transformers.js como runtime.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card si incluye una tabla de paridad de la exportacion frente a PyTorch fp32, con 20 prompts y Transformers.js 4.3.0 en Node:

| Export | Mismo texto | Mismo resultado DuckDB |
|---|---|---|
| fp32 (no publicado) | 20/20 | 20/20 |
| q4 | 4/20 | 13/20 |
| q4f16 | 4/20 | 13/20 |

La exactitud de ejecucion zero-shot se remite a `evals/reports/latest.json` dentro del repositorio de PocketSQL y no se reproduce en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible como cifra explicita. Como referencia de espacio en disco, los pesos ocupan 276 MiB (q4f16) y 310 MiB (q4), mas el tokenizer.
- GPU recomendadas: no disponibles. El modelo esta disenado para WebGPU, por lo que cualquier GPU con soporte WebGPU estable puede ejecutarlo.
- Cabe en GPU de consumo: si. Con un modelo de ~0,5B en int4, el peso en memoria es minimo y entra en practicamente cualquier GPU integrada o dedicada con WebGPU.
- Alternativa sin GPU: la variante q4 esta pensada para el fallback WASM, es decir, ejecucion en CPU dentro del navegador.
- Opciones de despliegue: Transformers.js (navegador y Node.js) sobre ONNX Runtime; el repositorio no incluye pesos GGUF, por lo que no es directamente compatible con llama.cpp u Ollama, y no se documenta soporte para vLLM ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| MidlightDDK/pocketsql-base-0.5b | ~0,5B | 32 768 tokens (heredado) | ONNX int4 (q4f16, q4) | Apache-2.0 | Reexportacion sin afinar; orientada a WebGPU/WASM |
| Qwen/Qwen2.5-Coder-0.5B-Instruct | ~0,5B | 32 768 tokens (heredado) | Safetensors (PyTorch) | Apache-2.0 | Modelo base original; referencia de maxima fidelidad |
| Builds ONNX de onnx-community para Qwen | ~0,5B | 32 768 tokens (heredado) | ONNX | Apache-2.0 | Misma herramienta de exportacion citada por el autor; orientadas a uso general, no a text-to-SQL |

No se dispone de datos de rendimiento comparativos entre estas opciones en la informacion proporcionada.

## Limitaciones y advertencias

- No esta afinado: el autor indica explicitamente que se trata de una reexportacion sin modificar del modelo base, no de un modelo entrenado para text-to-SQL.
- Perdida de fidelidad por cuantizacion: frente a fp32, las variantes int4 solo conservan el mismo texto en 4 de 20 prompts y el mismo resultado de DuckDB en 13 de 20. Es una degradacion notable que debe tenerse en cuenta en cualquier uso serio.
- Riesgo de alucinacion: al ser un modelo de 0,5B sin ajuste especifico, la generacion de clausulas SQL plausibles pero incorrectas es esperable; las salidas deben validarse antes de ejecutarse contra una base de datos real.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Idiomas soportados: no disponibles; el modelo base Qwen2.5-Coder esta orientado a codigo y a textos en ingles y chino, pero la ficha no declara cobertura linguistica.
- Licencia: Apache-2.0, heredada de Qwen2.5-Coder-0.5B-Instruct. Permite uso comercial, pero conviene revisar las condiciones del modelo base y cumplir con la atribucion.
- Adopcion practicamente nula: el repositorio registra 0 descargas y 0 "likes", no hay resultados de benchmarks publicados y la propia medicion de exactitud se delega a un fichero del repositorio de PocketSQL que no se reproduce aqui.
- Fechas del repositorio: la model card indica creacion y ultima actualizacion en septiembre de 2026, posteriores a la fecha de esta ficha; conviene verificar el estado actual del repositorio antes de depender de el.
- Compatibilidad: al distribuirse solo en ONNX, no es utilizable directamente con runtimes que esperan safetensors o GGUF sin una conversion adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MidlightDDK/pocketsql-base-0.5b
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-0.5B-Instruct
- Repositorio del proyecto PocketSQL: https://github.com/MidlightDDK/pocketsql
- ONNX Runtime GenAI (herramienta de exportacion): https://github.com/microsoft/onnxruntime-genai
- Transformers.js: https://github.com/huggingface/transformers.js
