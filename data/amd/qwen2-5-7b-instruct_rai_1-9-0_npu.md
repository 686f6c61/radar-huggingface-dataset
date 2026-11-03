# amd/Qwen2.5-7B-Instruct_rai_1.9.0_npu

## Resumen

`amd/Qwen2.5-7B-Instruct_rai_1.9.0_npu` es una distribucion optimizada del modelo Qwen2.5-7B-Instruct de Alibaba, publicada por AMD para su ejecucion sobre las NPU (unidades de procesamiento neuronal) integradas en los procesadores AMD Ryzen AI, mediante el runtime Ryzen AI (RAI) en su version 1.9.0. El modelo base Qwen2.5-7B-Instruct es un transformer denso de 7.600 millones de parametros con 32.000 tokens de contexto nativo y capacidades de generacion de texto, razonamiento, codigo y matematicas.

La relevancia de esta publicacion radica en que traslada un LLM de 7B a la NPU del PC, lo que permite inferencia local con bajo consumo energetico y sin depender de la GPU discreta ni de la nube. El repositorio se distribuye en formato ONNX cuantizado con Quark (el toolkit de cuantizacion de AMD) y esta pensado para el stack de Ryzen AI Software, no para un uso generico con transformers.

El acceso es restringido (gated): es necesario aceptar las condiciones en HuggingFace antes de descargar los pesos. La licencia del modelo base es Apache 2.0, pero la distribucion concreta de AMD puede incorporar terminos adicionales que conviene revisar antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen2), exportado a ONNX y optimizado para NPU Ryzen AI |
| Parametros totales | 7.600 millones (modelo base Qwen2.5-7B-Instruct) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens en el modelo base; no se especifica en la ficha de AMD si la exportacion conserva el contexto completo |
| Tipos de cuantizacion | Cuantizacion via Quark para NPU (precisiones concretas no disponibles en la informacion proporcionada) |
| Idiomas soportados | Ingles (segun la ficha); el modelo base Qwen2.5 soporta ademas chino y otros idiomas, pero no se garantiza en esta distribucion |
| Licencia | Apache 2.0 (modelo base); acceso gated con condiciones adicionales en HuggingFace |
| Formato de pesos | ONNX (optimizado para Ryzen AI / NPU) |

## Arquitectura y entrenamiento

El modelo subyacente, Qwen2.5-7B-Instruct, es un transformer decoder-only denso de 28 capas con atencion por multi-head con RoPE, GQA (grouped-query attention con 28 cabezas de query y 4 de key/value) y una dimension oculta de 3.584. Emplea activacion SwiGLU en el FFN y un vocabulario de aproximadamente 151.000 tokens. El entrenamiento del modelo base combina preentrenamiento sobre un corpus multilingue de varios billones de tokens (con fuerte peso de ingles y chino) seguido de ajuste supervisado y optimizacion por preferencias (DPO) para alineamiento instructivo.

La contribucion especifica de AMD no reside en el entrenamiento sino en la conversion y optimizacion: exportacion a ONNX, cuantizacion con Quark y compilacion para el compilador de Ryzen AI, de modo que las capas del transformer se ejecuten sobre la NPU (XDNA/XDNA2 segun la generacion de Ryzen AI). Esta ruta de despliegue difiere del stack CUDA habitual y persigue eficiencia energetica y liberacion de la GPU para otras tareas. No se dispone de informacion detallada sobre el esquema exacto de cuantizacion (por ejemplo, pesos INT8/INT4 o activaciones) ni sobre las capas que permanecen en CPU.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles.
- Razonamiento y resolucion de problemas de complejidad media.
- Generacion y explicacion de codigo en lenguajes populares (herencia del modelo base Qwen2.5).
- Matematicas basicas e intermedias, incluyendo problemas tipo GSM8K.
- Instrucciones estructuradas y formateo de salida (JSON, listas, tablas).
- Capacidad de seguir system prompts y roles definidos.
- Soporte de tool calling y function calling heredado del modelo base (no verificado en la exportacion ONNX).
- Capacidades multilingues del modelo base (chino y otros), aunque la ficha declara solo ingles.
- No incluye vision, audio ni modo thinking explicito.

## Casos de uso

- Asistente local en portatiles y mini-PC con Ryzen AI: el modelo se ejecuta en la NPU, lo que permite mantener un chatbot privado sin conexion y con bajo consumo, adecuado para entornos con requisitos de confidencialidad.
- Procesamiento de documentos en el dispositivo: resumen y extraccion de informacion de contratos o informes de hasta decenas de miles de tokens gracias a la ventana de 32K del modelo base, sin enviar datos a la nube.
- Generacion de codigo en IDE para desarrolladores en equipos sin GPU dedicada: el modelo puede completar funciones y explicar APIs, liberando la GPU integrada para la interfaz grafica.
- Automatizacion de correo y redaccion corporativa: borradores, reescritura y clasificacion de mensajes en flujos de trabajo ofimaticos que corren sobre el PC del usuario.
- Ensenanza y tutoria: explicaciones paso a paso de conceptos tecnicos en ingles, con la ventaja de que el estudiante no necesita hardware especializado.
- Prototipado de agentes y pipelines RAG en local: al soportar tool calling (heredado), puede integrarse en frameworks como LangChain o LlamaIndex para pruebas sin coste de API.
- Filtrado y clasificacion de texto en tiempo real en aplicaciones de escritorio: moderacion de contenido o etiquetado de tickets con latencia baja al ejecutarse en la NPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La ficha de HuggingFace de AMD no incluye metricas de MMLU, HumanEval, GSM8K ni comparativas de latencia o throughput en NPU.

## Requisitos de hardware

- NPU AMD Ryzen AI (XDNA/XDNA2) compatible con Ryzen AI Software 1.9.0; la generacion concreta de procesadores soportados no se detalla en la informacion proporcionada.
- El repositorio ocupa 8,9 GB, lo que sugiere pesos cuantizados en el rango de 8 bits para un modelo de 7B; la VRAM/RAM necesaria para inferencia no esta especificada.
- No esta pensado para GPU NVIDIA ni para ejecucion generica con CUDA; el stack objetivo es el runtime de Ryzen AI.
- Opciones de despliegue: Ryzen AI Software (runtime oficial). No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI para esta exportacion ONNX concreta.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / destino | Licencia | Notas |
|---|---|---|---|---|---|
| amd/Qwen2.5-7B-Instruct_rai_1.9.0_npu | 7,6B | 32K (base) | ONNX para NPU Ryzen AI | Apache 2.0 + acceso gated | Optimizado para eficiencia energetica en PC |
| Qwen/Qwen2.5-7B-Instruct | 7,6B | 32K | safetensors, GGUF | Apache 2.0 | Referencia generica, ejecutable en GPU/CPU |
| Meta Llama 3.1 8B Instruct | 8B | 128K | safetensors, GGUF | Llama 3.1 Community License | Mayor contexto, licencia con restricciones |
| Mistral 7B Instruct v0.3 | 7,2B | 32K | safetensors, GGUF | Apache 2.0 | Alternativa europea, sin soporte NPU oficial |

## Limitaciones y advertencias

- Acceso restringido: es necesario aceptar condiciones en HuggingFace; el uso comercial puede estar sujeto a terminos adicionales de AMD ademas de la licencia Apache 2.0 del modelo base.
- La ficha declara solo ingles; el rendimiento en castellano no esta garantizado ni evaluado en esta distribucion.
- Riesgo de alucinacion inherente a un modelo de 7B, especialmente en dominios especializados o con contexto muy largo.
- La cuantizacion para NPU puede degradar ligeramente la calidad respecto al modelo original en safetensors; no se han publicado evaluaciones comparativas.
- Dependencia del stack Ryzen AI 1.9.0 y de hardware AMD especifico: no es portable a otras plataformas sin reconversion.
- El soporte de tool calling y de contexto completo no esta verificado en la exportacion ONNX.
- Sesgos heredados del corpus de entrenamiento de Qwen2.5, con posible infrarrepresentacion de variedades del espanol.
- Sin datos de latencia ni throughput publicados, lo que dificulta planificar despliegues en produccion.

## Enlaces

- HuggingFace: https://huggingface.co/amd/Qwen2.5-7B-Instruct_rai_1.9.0_npu
- Modelo base Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Repositorio Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Ryzen AI Software: https://ryzenai.docs.amd.com/
- Quark (cuantizacion AMD): https://quark.docs.amd.com/
