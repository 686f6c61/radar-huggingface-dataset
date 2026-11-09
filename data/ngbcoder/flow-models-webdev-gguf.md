# ngbcoder/flow-models-webdev-gguf

## Resumen

Flow Models — Web Dev es un ajuste fino mediante QLoRA de Llama-3.2-3B-Instruct, orientado a tareas de desarrollo web (HTML, CSS, JavaScript, Python y SQL). Lo publica el usuario ngbcoder en Hugging Face y se distribuye exclusivamente en formato GGUF con cuantizacion Q4_K_M (1,88 GB), pensado para ejecutarse en llama.cpp, Ollama, LM Studio o cualquier runtime compatible con GGUF. El modelo base es la version ya cuantizada a 4 bits de Unsloth, sobre la que se aplico un adaptador LoRA de rango 16 en todos los modulos lineales del transformer.

El modelo resuelve un nicho muy concreto: generar respuestas cortas y directas a instrucciones de programacion web siguiendo el formato Alpaca y terminando cada respuesta con el marcador `[COMPLETE]`. No es un modelo conversacional general ni un asistente de codigo de proposito general: esta especializado en el estilo y la distribucion del dataset de ajuste, compuesto por 3.723 ejemplos instruction/response.

Su relevancia practica es limitada pero clara para entornos con recursos escasos: con 3.212.749.888 parametros totales y un fichero de menos de 2 GB, puede desplegarse en CPU o en GPUs de consumo modestas. Ahora bien, la longitud de contexto declarada es de solo 2.048 tokens, muy por debajo de los 128.000 del Llama 3.2 3B original, y el autor no ha publicado evaluaciones de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2 3B Instruct), ajuste QLoRA |
| Parametros totales | 3.212.749.888 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | Q4_K_M (GGUF); el autor solo publica esta variante |
| Idiomas soportados | Ingles |
| Licencia | Llama 3.2 Community License |
| Formato de pesos | GGUF (unico fichero, 1,88 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.2 3B Instruct: un transformer decoder-only con atencion por grupos (GQA) y tokenizador de Llama 3. Sobre el checkpoint base cuantizado a 4 bits (`unsloth/Llama-3.2-3B-Instruct-unsloth-bnb-4bit`) se aplico un adaptador LoRA con rango 16 y alpha 16, dropout 0, sobre los modulos `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. El entrenamiento uso el optimizador `adamw_8bit`, learning rate 2e-4 con schedule lineal, weight decay 0,001, batch size 2 con acumulacion de gradientes 4, 3 epocas, packing activado, longitud maxima de secuencia 2048 y semilla 3407.

El resultado fueron 87 pasos y 1.376.556 tokens procesados, con una perdida de entrenamiento que descendio de 1,20 a 0,39. El dataset, `formatted_webdev_dataset.json`, contiene 3.723 pares instruccion/respuesta sobre HTML, CSS, JavaScript, Python, SQL y desarrollo web general, en formato Alpaca y con el marcador `[COMPLETE]` al final de cada respuesta. No se documento ninguna fase de RLHF, DPO ni evaluacion posterior al ajuste, y no hay innovaciones tecnicas adicionales mas alla del propio pipeline de Unsloth para QLoRA.

## Capacidades

- Generacion de codigo web: funciones y fragmentos en JavaScript, HTML, CSS, Python y SQL, al estilo del dataset de ajuste.
- Respuesta a instrucciones en formato Alpaca (seccion `### Instruction:`, `### Input:` opcional y `### Response:`).
- Cierre consistente de respuestas con el marcador `[COMPLETE]`, aprendido durante el ajuste.
- Generacion de texto en ingles; no se declara soporte de otros idiomas.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No dispone de modo thinking, vision ni audio.
- No se documenta capacidad de conversacion multi-turno; el autor advierte que el rendimiento optimo se obtiene con el formato de prompt de entrenamiento, no con chat libre.

## Casos de uso

- Asistencia a desarrolladores front-end en local: el modelo puede generar funciones JavaScript o fragmentos HTML/CSS a partir de una instruccion corta, ejecutandose en un portatil sin GPU dedicada gracias al fichero Q4_K_M de 1,88 GB.
- Autocompletado de ejercicios y katas de programacion: su formato de salida con `[COMPLETE]` permite delimitar de forma fiable el final de la respuesta en pipelines automatizados de generacion y validacion.
- Generacion de consultas SQL sencillas: el ajuste incluye SQL en el dataset, por lo que puede producir consultas basicas a partir de una descripcion en lenguaje natural, siempre con revision humana posterior.
- Prototipado rapido de snippets en entornos sin conectividad: al ejecutarse con llama.cpp u Ollama de forma local, sirve para generar ejemplos de codigo en maquinas aisladas o con requisitos de privacidad.
- Herramienta educativa de bajo coste: util para demostrar pipelines de ajuste fino con QLoRA y Unsloth, comparando la salida del modelo ajustado con la del Llama 3.2 3B Instruct original.
- Integracion en editores o plugins ligeros: su tamano reducido y su formato GGUF permiten empaquetarlo en herramientas de escritorio que necesiten sugerencias de codigo web sin depender de una API externa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente reporta la evolucion de la perdida de entrenamiento (1,20 a 0,39) y no incluye evaluaciones en MMLU, HumanEval, GSM8K ni en ningun otro conjunto de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5-3 GB con Q4_K_M y contexto de 2.048 tokens; el fichero de pesos ocupa 1,88 GB.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060); tambien funciona en A100 o H100, aunque el modelo no aprovecha su capacidad.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU dedicada moderna y en muchas integradas con memoria compartida suficiente.
- Ejecucion en CPU: viable con llama.cpp; el modelo completo en Q4_K_M puede correr en CPU con un rendimiento aceptable para generacion de snippets cortos.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama, LM Studio y cualquier runtime compatible con GGUF.
- Latencia y throughput estimados: no disponibles; el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| ngbcoder/flow-models-webdev-gguf | 3,21 B | 2048 | GGUF Q4_K_M | Llama 3.2 Community | Ajuste QLoRA especializado en web dev, sin benchmarks |
| meta-llama/Llama-3.2-3B-Instruct | 3,21 B | 128.000 | safetensors, GGUF | Llama 3.2 Community | Modelo base oficial, contexto mucho mayor y evaluaciones publicadas |
| Qwen2.5-Coder-3B-Instruct | 3,09 B | 32.768 | safetensors, GGUF | Apache 2.0 | Especializado en codigo, con benchmarks publicados y licencia permisiva |
| unsloth/Llama-3.2-3B-Instruct-unsloth-bnb-4bit | 3,21 B | 128.000 | safetensors (bnb 4-bit) | Llama 3.2 Community | Checkpoint intermedio usado como base; sin ajuste especifico |

## Limitaciones y advertencias

- El contexto efectivo es de solo 2.048 tokens, muy inferior a los 128.000 del Llama 3.2 3B original; no es adecuado para ficheros largos ni conversaciones extensas.
- Entrenado sobre un dataset pequeno (3.723 ejemplos) y de estilo sintetico; puede reproducir errores, malas practicas o patrones desactualizados presentes en esos datos.
- El autor no ha evaluado el modelo en correccion, seguridad ni uso en produccion; el codigo generado debe revisarse antes de ejecutarse.
- El formato de prompt Alpaca es practicamente obligatorio: el rendimiento en chat libre o con plantillas distintas puede degradarse notablemente.
- El marcador `[COMPLETE]` forma parte del estilo aprendido y aparece en las respuestas; los pipelines que lo consuman deben filtrarlo.
- Solo soporta ingles; no hay evidencia de calidad en castellano ni en otros idiomas.
- Riesgo de alucinacion en APIs, librerias y funciones inexistentes, comun en modelos de este tamano y agravado por la falta de evaluacion.
- La licencia Llama 3.2 Community impone restricciones de uso comercial, obligaciones de atribucion y una politica de uso aceptable; debe revisarse antes de cualquier despliegue productivo.
- El repositorio registra cero descargas y cero likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ngbcoder/flow-models-webdev-gguf
- Modelo base: https://huggingface.co/unsloth/Llama-3.2-3B-Instruct-unsloth-bnb-4bit
- Modelo original de Meta: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Licencia Llama 3.2: https://www.llama.com/llama3_2/license/
- Unsloth: https://github.com/unslothai/unsloth
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
