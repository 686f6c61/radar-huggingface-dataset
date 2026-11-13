# JadeSpartan/ParkingLot-4B_v1-GGUF

## Resumen
ParkingLot-4B_v1-GGUF es la distribucion en formato GGUF del modelo ParkingLot_v1, un ajuste fino de 4B parametros desarrollado por JadeSpartan y orientado a programacion, con enfasis particular en Rust. El modelo parte de una base Qwen3.5-4B (en su variante abliterated de huihui-ai) y ha pasado por dos rondas de fine-tuning supervisado utilizando el dataset Strandset-Rust-v1 de Fortytwo-Network y el conjunto tulu-3-sft-personas-instruction-following de AllenAI. Se publica como version cuantizada lista para su uso con llama.cpp.

El modelo se presenta como sucesor de Qwenstation_Rustv0.1e y esta etiquetado como vision-language-model, ademas de incluir soporte para tool calling mediante el flag `--jinja` de llama.cpp. Su tamano (4.326.350.848 parametros, aproximadamente 4,3B) lo situa en la franja de modelos pequenos que pueden ejecutarse en hardware de consumo, lo que resulta relevante para desarrolladores que necesitan un asistente de codigo local sin depender de APIs externas.

La relevancia actual del modelo radica en su enfoque especializado en Rust sobre una base Qwen3.5, una combinacion poco frecuente en el ecosistema open source, y en su empaquetado GGUF con cuantizaciones que van desde Q4_K-M hasta FP16. No obstante, la informacion publica disponible es escasa: no se detallan resultados de benchmarks, composicion exacta del dataset ni caracteristicas tecnicas de la arquitectura mas alla de la herencia de Qwen3.5.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen3.5-4B, segun tags del modelo) |
| Parametros totales | 4.326.350.848 (~4,3B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K-M, Q6_K, Q8_0, FP16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 (segun model card); campo de licencia en HF no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base ParkingLot_v1) |

## Arquitectura y entrenamiento
El modelo hereda la arquitectura de Qwen3.5-4B, un transformer denso de aproximadamente 4,3B parametros. La model card no detalla la configuracion interna (numero de capas, dimensiones ocultas, mecanismo de atencion ni longitud de contexto nativa), por lo que estos datos deben consultarse en la ficha del modelo base Qwen3.5-4B. La etiqueta vision-language-model sugiere que la base incorpora capacidades multimodales, aunque no se especifica si el fine-tuning las preserva o las degrada.

El entrenamiento consistio en dos rondas de fine-tuning supervisado (SFT) realizadas con Unsloth y la libreria TRL de Hugging Face, lo que el autor destaca como un entrenamiento 2x mas rapido. Los datos empleados son Strandset-Rust-v1 (dataset de codigo Rust de Fortytwo-Network) y tulu-3-sft-personas-instruction-following (AllenAI), orientado a seguir instrucciones con personas diversas. No se menciona el uso de RLHF, DPO ni tecnicas de alineacion adicionales, ni se especifica el numero de tokens de entrenamiento.

## Capacidades
- Generacion de texto y codigo, con especializacion declarada en Rust.
- Razonamiento y respuesta a instrucciones en ingles (unico idioma declarado).
- Soporte de tool calling / function calling mediante plantillas Jinja (`--jinja` en llama.cpp).
- Capacidad multimodal potencial (etiqueta vision-language-model), ejecutable con `llama-mtmd-cli`; no se detalla el alcance real de vision tras el fine-tuning.
- Conversacion multi-turno (tag conversational).
- No se documentan capacidades de agentes multi-paso, thinking mode explicito ni soporte de audio.

## Casos de uso
- Asistencia de programacion en Rust: el modelo se ha ajustado sobre Strandset-Rust-v1, por lo que es adecuado para autocompletar, explicar y refactorizar codigo Rust en entornos locales con llama.cpp.
- Revisions de codigo en CI/CD: integrado via llama.cpp o un servidor compatible con endpoints, puede generar comentarios automatizados sobre diffs en Rust antes de fusionar pull requests.
- Entornos de desarrollo sin conexion: al ser un GGUF de 4B, puede ejecutarse en portatiles y estaciones de trabajo sin GPU dedicada, ofreciendo asistencia de codigo sin enviar codigo a servicios externos.
- Prototipado de agentes con tool calling: el soporte de plantillas Jinja permite conectarlo a herramientas (ejecutores de tests, linters) en flujos de automatizacion de tareas de desarrollo.
- Educacion y aprendizaje de Rust: puede explicar conceptos del lenguaje, errores del compilador y patrones idiomaticos en conversaciones multi-turno.
- Experimentacion multimodal ligera: si la capacidad de vision se conserva, puede usarse con `llama-mtmd-cli` para tareas sencillas de descripcion de imagenes en local, aunque no hay validacion publica de esta capacidad.
- Base para fine-tuning adicional: al ser un modelo pequeno con licencia Apache-2.0, sirve como punto de partida para especializaciones en otros lenguajes o dominios.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia (aproximada, segun cuantizacion y overhead de llama.cpp):
  - Q4_K-M: ~2,5-3 GB.
  - Q6_K: ~3,5-4 GB.
  - Q8_0: ~4,5-5 GB.
  - FP16: ~8,5-9 GB.
- GPU recomendadas: cualquier GPU consumer con 6 GB o mas para Q4_K-M/Q6_K (RTX 3060, RTX 4060, RTX 4070); 8-12 GB para Q8_0; A100/H100 no son necesarias dado el tamano.
- Cabe en GPU consumer: si, en la mayoria de tarjetas modernas con 6 GB o mas; tambien puede ejecutarse en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-mtmd-cli`), servidores compatibles con endpoints, y potencialmente Ollama si se importa el GGUF. No se confirma soporte de vLLM ni TGI para este repositorio.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ParkingLot-4B_v1-GGUF | ~4,3B | no disponible | apache-2.0 (model card) | GGUF | Fine-tuning en Rust sobre Qwen3.5-4B |
| Qwen3.5-4B (base) | ~4B | no disponible | no disponible | safetensors/GGUF | Modelo base generalista |
| Huihui-Qwen3.5-4B-Claude-4.6-Opus-abliterated | ~4B | no disponible | no disponible | safetensors | Base abliterated usada por ParkingLot |
| Qwenstation_Rustv0.1e | no disponible | no disponible | no disponible | no disponible | Predecesor del mismo autor |

No se dispone de datos de rendimiento comparativo para establecer diferencias cuantitativas con alternativas.

## Limitaciones y advertencias
- Sesgos: el fine-tuning sobre tulu-3-sft-personas y la base abliterated pueden introducir sesgos de los datasets originales; no se documenta ninguna evaluacion de sesgo.
- Alucinacion: al ser un modelo de 4B con fine-tuning especializado, el riesgo de generar codigo o APIs inexistentes es elevado, especialmente fuera de Rust.
- Contexto e idioma: solo se declara ingles; el rendimiento en castellano no esta validado. La longitud de contexto no se especifica.
- Licencia: la model card indica apache-2.0, pero el campo de licencia del repositorio Hugging Face aparece como no disponible; conviene verificar antes de uso comercial.
- Capacidad multimodal incierta: la etiqueta vision-language-model no va acompanada de ejemplos ni evaluaciones que confirmen que la vision funcione tras el fine-tuning.
- Madurez: modelo con muy pocas descargas (160) y sin likes, sin benchmarks ni validacion externa; no recomendable para produccion sin evaluacion propia.
- Procedencia: derivado de un modelo abliterated, lo que puede afectar a la calidad y seguridad de las respuestas.

## Enlaces
- Repositorio GGUF: https://huggingface.co/JadeSpartan/ParkingLot-4B_v1-GGUF
- Modelo base ParkingLot_v1: https://huggingface.co/JadeSpartan/ParkingLot_v1
- Predecesor Qwenstation_Rustv0.1e: https://huggingface.co/JadeSpartan/Qwenstation_Rustv0.1e
- Base huihui-ai: https://huggingface.co/huihui-ai/Huihui-Qwen3.5-4B-Claude-4.6-Opus-abliterated
- Dataset Strandset-Rust-v1: https://huggingface.co/datasets/Fortytwo-Network/Strandset-Rust-v1
- Dataset tulu-3-sft-personas-instruction-following: https://huggingface.co/datasets/allenai/tulu-3-sft-personas-instruction-following
- Unsloth: https://github.com/unslothai/unsloth
