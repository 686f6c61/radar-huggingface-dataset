# amd/Gemma3-4B-it_gpuep_1.0_gpu_128

## Resumen

Gemma3-4B-it_gpuep_1.0_gpu_128 es una distribucion cuantizada del modelo google/gemma-3-4b-it, preparada por AMD mediante la herramienta OGA Model Builder (ONNX Generative AI). No se trata de un modelo entrenado desde cero, sino de una conversion a ONNX con cuantizacion INT4 (RTN, group size 128, activaciones FP16) orientada al despliegue optimizado sobre hardware AMD Ryzen AI. El repositorio ocupa 4,4 GB y solo contiene pesos en formato ONNX.

El modelo base, Gemma 3 4B instruct, es un transformer decoder-only de Google con capacidades multimodales (texto e imagen) y una ventana de contexto amplia, pensado para tareas de generacion de texto, razonamiento y conversacion. Esta version de AMD hereda esas capacidades, pero la model card solo declara el pipeline text-generation y el idioma ingles, sin detallar el soporte de vision ni la longitud de contexto efectiva tras la conversion.

Su relevancia es practica: permite ejecutar un modelo de 4B parametros en equipos con NPU/GPU integrada de AMD (familia Ryzen AI) con un footprint reducido gracias a los pesos INT4. Es una pieza de infraestructura para despliegue en el borde (edge), no una variante con mejoras de calidad respecto al original. El repositorio no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Gemma 3 4B); empaquetada en ONNX |
| Parametros totales | 4B (aproximado, segun el modelo base google/gemma-3-4b-it) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base soporta contexto largo; el valor efectivo tras la conversion no se declara) |
| Tipos de cuantizacion | INT4 con RTN, group size 128, activaciones FP16 |
| Idiomas soportados | Ingles (declarado en la model card) |
| Licencia | Gemma (modelo base) + MIT para las modificaciones de AMD |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Gemma 3 4B instruct de Google: un transformer decoder-only denso con atencion multi-cabeza, entrenado por Google con datos multimodales y ajustado por instrucciones. AMD no ha reentrenado ni modificado los pesos en terminos de conocimiento; su trabajo consiste en la exportacion a ONNX y la cuantizacion INT4 con cuantizacion por grupos de 128 canales y activaciones en FP16, un esquema habitual para equilibrar reduccion de memoria y fidelidad numerica en aceleradores de inferencia.

No se dispone en la informacion proporcionada de datos sobre numero de tokens de entrenamiento, composicion del dataset, fases de RLHF/DPO ni innovaciones tecnicas adicionales introducidas por AMD mas alla de la propia conversion (OGA Model Builder). Cualquier afirmacion sobre el proceso de entrenamiento del modelo base debe consultarse en la model card oficial de google/gemma-3-4b-it.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo instruct de Google.
- Razonamiento y respuesta a instrucciones en ingles.
- Generacion de codigo y resolucion de problemas matematicos basicos e intermedios (capacidades del modelo base, no verificadas en esta conversion).
- Soporte multimodal (texto e imagen) en el modelo original; la model card de esta version solo declara text-generation, por lo que el soporte de vision no esta confirmado.
- Tool calling y function calling: no documentado en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no documentadas especificamente para esta conversion.
- Multilingue: limitado al ingles segun la model card; el modelo base soporta mas idiomas, pero esta distribucion no lo declara.

## Casos de uso

- Inferencia local en equipos AMD Ryzen AI: el formato ONNX e INT4 permite ejecutar el modelo en NPUs y GPUs integradas de portatiles y mini-PC con AMD, sin depender de la nube.
- Asistentes conversacionales en el borde: un modelo de 4B cuantizado a INT4 ofrece respuestas de chat en ingles con un consumo de memoria contenido, adecuado para aplicaciones de escritorio.
- Prototipado de pipelines ONNX: util para desarrolladores que necesitan validar flujos de inferencia ONNX Runtime con un modelo instruct de tamano medio.
- Generacion de texto en herramientas ofimaticas o de productividad: resumen, reescritura y redaccion asistida en ingles dentro de aplicaciones de escritorio.
- Educacion y demos tecnicas: ejecucion de un LLM instruct en hardware de consumo para talleres, pruebas de concepto y evaluacion de latencia.
- Filtrado y clasificacion de texto: tareas de etiquetado, extraccion de informacion y respuesta a preguntas sobre documentos cortos en ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con pesos INT4 y group size 128, el modelo ronda los 2-2,5 GB de pesos; sumando activaciones FP16 y overhead de ONNX Runtime, se estima un consumo de 3-4 GB, aunque no se proporciona una cifra oficial.
- GPU/NPU recomendadas: hardware AMD Ryzen AI (NPU integrada) y GPUs AMD compatibles con ONNX Runtime; el repositorio esta optimizado explicitamente para Ryzen AI.
- GPU de consumo: por tamano, cabe en GPUs de consumo con 6-8 GB o mas, pero la compatibilidad practica depende de los proveedores de ejecucion de ONNX Runtime disponibles.
- Opciones de despliegue: ONNX Runtime (via OGA), y potencialmente otras herramientas que acepten ONNX; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| amd/Gemma3-4B-it_gpuep_1.0_gpu_128 | 4B | No disponible | ONNX INT4 | Gemma + MIT | Optimizado para Ryzen AI |
| google/gemma-3-4b-it | 4B | No disponible en esta ficha | Safetensors | Gemma | Modelo original, multimodal |
| Meta Llama 3.2 3B Instruct | 3B | 128K (segun model card oficial) | Safetensors, GGUF | Llama 3.2 Community | Alternativa de tamano similar, amplio ecosistema |
| Qwen2.5 3B Instruct | 3B | 32K (segun model card oficial) | Safetensors, GGUF | Apache 2.0 | Alternativa permisiva para uso comercial |

La comparativa se basa en caracteristicas publicas de los modelos citados; no se dispone de datos de rendimiento comparativo para esta conversion concreta.

## Limitaciones y advertencias

- La cuantizacion INT4 puede degradar la calidad respecto al modelo original en tareas sensibles a precision numerica (matematicas, codigo).
- Solo se declara soporte de ingles; el uso en otros idiomas no esta garantizado.
- Riesgo de alucinacion inherente a los modelos de 4B, especialmente en dominios especializados.
- La model card no documenta el soporte multimodal ni el contexto efectivo, por lo que conviene validar ambos antes de usarlo en produccion.
- La licencia Gemma impone condiciones de uso (incluidas restricciones de uso comercial y politicas de uso aceptable) que deben revisarse; las modificaciones de AMD se distribuyen bajo MIT, pero el modelo base conserva su licencia.
- El repositorio no registra descargas ni validacion de la comunidad; es un artefacto reciente y poco contrastado.
- Dependencia del ecosistema ONNX Runtime y del hardware AMD Ryzen AI para obtener el rendimiento previsto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/amd/Gemma3-4B-it_gpuep_1.0_gpu_128
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Model card de Gemma 3 (Google): https://ai.google.dev/gemma/docs
- ONNX Runtime Generative AI (OGA): https://github.com/microsoft/onnxruntime-genai
