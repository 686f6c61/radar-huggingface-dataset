# oxpuppy635/gemma-4-26B-A4B-it-uncensored-NVFP4-GGUF

## Resumen

`oxpuppy635/gemma-4-26B-A4B-it-uncensored-NVFP4-GGUF` es una cuantizacion en formato GGUF con layout NVFP4 de un modelo derivado de la familia Gemma 4, concretamente del checkpoint `TrevorJS/gemma-4-26B-A4B-it-uncensored`. El autor del repositorio, oxpuppy635, se limita a convertir los pesos originales al formato nativo `GGML_TYPE_NVFP4` de llama.cpp, de modo que el modelo pueda ejecutarse en builds recientes de esta herramienta con aceleracion de precision reducida (FP4) en hardware compatible.

El modelo de partida es una variante "uncensored" (sin los filtros de alineamiento habituales) del Gemma 4 26B A4B instruct, un transformer con 25.233.138.206 parametros totales segun los safetensors del modelo base. La nomenclatura "A4B" sugiere una arquitectura con aproximadamente 4.000 millones de parametros activos, aunque la model card no lo confirma explicitamente. El repositorio ocupa 15,3 GB y contiene un unico archivo GGUF.

La relevancia de esta ficha es acotada: se trata de una cuantizacion comunitaria con cero descargas y cero likes en el momento de la consulta, publicada el 5 de noviembre de 2026, sin benchmarks ni documentacion tecnica adicional. Resulta util unicamente como artefacto de despliegue para quien ya quiera usar el modelo base en llama.cpp con NVFP4 y disponga de GPU Blackwell o superior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 4; detalles no disponibles) |
| Parametros totales | 25.233.138.206 |
| Parametros activos | no disponible (la nomenclatura "A4B" sugiere ~4B, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (GGML_TYPE_NVFP4) |
| Idiomas soportados | en (ingles) |
| Licencia | other (terminos no especificados en el repositorio) |
| Formato de pesos | GGUF (NVFP4) |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura del modelo subyacente. Por la nomenclatura y el tamano (25.233 millones de parametros totales) se infiere que se trata de un transformer de la familia Gemma 4 en configuracion instruct, probablemente con mezcla de expertos o con algun esquema de activacion parcial ("A4B"), pero esta informacion no aparece en la model card ni en los metadatos proporcionados. Tampoco se detallan el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO o similar.

La unica innovacion tecnica documentada es la propia conversion: el autor ha volado los pesos al layout `GGML_TYPE_NVFP4` nativo de llama.cpp, lo que permite almacenar los pesos en formato de 4 bits con escala por bloque (FP4 con factores de escala compartidos). Esto reduce el peso en disco a 15,3 GB, coherente con una cuantizacion de ~4,8 bits efectivos sobre 25.233 millones de parametros. No se especifica el proceso de calibracion ni el metodo de cuantizacion (RTN, GPTQ, AWQ, etc.).

## Capacidades

- Generacion de texto conversacional en ingles (el modelo base es instruct).
- Razonamiento y respuesta a instrucciones, segun el comportamiento esperado de un modelo "it" de la familia Gemma.
- Variante "uncensored": el modelo base ha sido modificado para reducir los rechazos de contenido, lo que implica menor alineamiento de seguridad.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades multilingues: el repositorio declara unicamente ingles.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Despliegue local en llama.cpp con NVFP4: el caso principal del repositorio es servir el modelo mediante `llama-server` en hardware con soporte FP4, usando el flag `-ngl 99` para descargar todas las capas en GPU.
- Experimentacion con cuantizacion FP4: util para investigadores que quieran evaluar la degradacion de calidad de NVFP4 frente a otras cuantizaciones (Q4_K_M, Q5_K_M, etc.) sobre un modelo de 25B.
- Prototipado de asistentes conversacionales en ingles: el modelo es instruct y puede usarse en CLI (`llama-cli`) para pruebas de generacion de texto con prompts de hasta el contexto soportado por el modelo base.
- Investigacion sobre alineamiento y seguridad: al tratarse de una variante "uncensored", sirve para estudiar el comportamiento de modelos sin filtros, siempre en entornos controlados.
- Integracion en pipelines de inferencia con llama.cpp: el formato GGUF es compatible con `llama-server` y con clientes que hablen la API compatible con OpenAI expuesta por esta herramienta.
- Evaluacion comparativa de checkpoints comunitarios: como artefacto de referencia para comparar el rendimiento del modelo base frente a sus cuantizaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo GGUF pesa 15,3 GB, por lo que se necesita al menos esa cantidad de VRAM para cargar todos los pesos en GPU (`-ngl 99`). Con overhead de contexto y KV cache, se recomienda 18-20 GB o mas.
- GPU recomendadas: GPUs con soporte nativo de FP4, principalmente arquitectura Blackwell (RTX 50xx, B200, GB200). El formato NVFP4 de llama.cpp esta disenado para estas GPUs.
- Cabe en consumer GPU: si, en tarjetas con 24 GB o mas de VRAM (RTX 4090, RTX 5090) siempre que el build de llama.cpp y el hardware soporten NVFP4. En GPUs Ampere o Ada puede requerir de-cuantizacion a FP16/BF16 en tiempo de ejecucion, con mayor uso de VRAM.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`). No se ha confirmado compatibilidad con vLLM, TGI, Ollama u otros motores.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| oxpuppy635/gemma-4-26B-A4B-it-uncensored-NVFP4-GGUF | 25,23B | no disponible | GGUF NVFP4 | other | Cuantizacion comunitaria, 0 descargas |
| TrevorJS/gemma-4-26B-A4B-it-uncensored | 25,23B | no disponible | safetensors (presumiblemente) | other | Modelo base del que deriva esta cuantizacion |
| Gemma 4 26B A4B it (original) | 25,23B | no disponible | safetensors | Gemma license | Version oficial con alineamiento de seguridad |

No se dispone de datos de rendimiento ni de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo "uncensored": el checkpoint base ha sido modificado para reducir rechazos, lo que implica menor alineamiento de seguridad y mayor riesgo de generar contenido inapropiado, sesgado o danino. No apto para produccion orientada al usuario final sin filtros adicionales.
- Sesgos conocidos: no documentados en el repositorio, pero heredados del modelo Gemma original y del proceso de "uncensoring".
- Riesgo de alucinacion: no cuantificado; el modelo no publica evaluaciones.
- Limitaciones de idioma: solo se declara ingles; el rendimiento en castellano no esta garantizado.
- Restricciones de licencia: la licencia figura como "other" sin terminos especificos en el repositorio; es imprescindible revisar la licencia del modelo base (Gemma) y del checkpoint intermedio antes de cualquier uso comercial.
- Compatibilidad de hardware: NVFP4 requiere builds recientes de llama.cpp y, en la practica, GPUs con soporte FP4; en otro hardware puede no funcionar o degradar el rendimiento.
- Madurez: repositorio con 0 descargas y 0 likes, publicado y actualizado en el mismo dia; sin validacion de la comunidad.
- Cuantizacion agresiva: FP4 puede degradar la calidad frente a Q8_0 o BF16, especialmente en tareas de razonamiento y codigo; no se han publicado evaluaciones de la perdida de calidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/oxpuppy635/gemma-4-26B-A4B-it-uncensored-NVFP4-GGUF
- Modelo base: https://huggingface.co/TrevorJS/gemma-4-26B-A4B-it-uncensored
- llama.cpp (soporte NVFP4): no se proporciona enlace especifico en la informacion disponible.
