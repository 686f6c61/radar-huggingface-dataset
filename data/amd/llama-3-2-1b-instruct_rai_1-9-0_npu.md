# amd/Llama-3.2-1B-Instruct_rai_1.9.0_npu

## Resumen

AMD/Llama-3.2-1B-Instruct_rai_1.9.0_npu es una distribucion optimizada del modelo Llama 3.2 1B Instruct de Meta, publicada por AMD para su ejecucion sobre las NPU (unidades de procesamiento neuronal) integradas en los procesadores AMD Ryzen AI. El modelo base es un transformer decoder-only de 1.240 millones de parametros con una ventana de contexto de 128.000 tokens, disenado por Meta para tareas ligeras de generacion de texto, resumen y recuperacion de informacion.

La relevancia de esta publicacion no reside en el modelo en si, sino en el empaquetado: AMD distribuye los pesos en formato ONNX cuantizado con Quark, el toolkit de compresion de AMD, y los integra con el stack Ryzen AI 1.9.0 para acelerar la inferencia en la NPU local (arquitectura XDNA/XDNA2). Esto permite ejecutar un LLM de 1B en portatiles y mini-PC con Ryzen AI sin depender de una GPU dedicada ni de la nube.

El repositorio ocupa 2,0 GB, esta sujeto a acceso restringido (gated) en HuggingFace y solo declara soporte para ingles. La licencia es la Llama 3.2 Community License, heredada del modelo original de Meta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.2), optimizado para NPU AMD Ryzen AI |
| Parametros totales | 1.240 millones (1B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens (heredado del modelo base Llama 3.2 1B Instruct; no confirmado en la ficha del repo) |
| Tipos de cuantizacion | Pesos ONNX cuantizados con AMD Quark; niveles exactos no disponibles |
| Idiomas soportados | en (ingles) |
| Licencia | Llama 3.2 Community License |
| Formato de pesos | ONNX (cuantizado con Quark) |
| Tamano del repositorio | 2,0 GB |
| Pipeline | text-generation |
| Acceso | Restringido (gated), requiere aceptar condiciones en HuggingFace |
| Fecha de publicacion | 2026-11-02 |

## Arquitectura y entrenamiento

El modelo subyacente es Llama 3.2 1B Instruct, un transformer decoder-only con atencion por grupos (GQA) y tokenizador BPE de Llama 3. Meta entreno la familia Llama 3.2 sobre un corpus multilingue de varios billones de tokens y aplico tecnicas de alineacion supervisada (SFT) y optimizacion por preferencias (RLHF/DPO) para la variante Instruct. Los detalles exactos de composicion del dataset y numero de tokens no se especifican en la informacion disponible.

La aportacion de AMD es el proceso de conversion y compresion: exportacion a ONNX, cuantizacion con Quark y empaquetado para el runtime Ryzen AI 1.9.0, que descarga la inferencia en la NPU del SoC. Este pipeline reduce el peso del modelo hasta los 2,0 GB del repositorio y permite su ejecucion con bajo consumo energetico en hardware de escritorio y portatil. No se documentan en la ficha innovaciones de decodificacion especulativa ni variaciones arquitectonicas respecto al modelo original.

## Capacidades

- Generacion de texto conversacional en ingles, con soporte de formato chat (roles system/user/assistant).
- Razonamiento basico y respuesta a preguntas sobre contexto corto o medio.
- Resumen y extraccion de informacion de documentos.
- Generacion de codigo sencillo y explicaciones tecnicas basicas.
- Soporte de tool calling y function calling heredado de Llama 3.2 Instruct (formato de plantilla de Llama 3).
- Capacidad de seguir instrucciones multi-turno.
- Ejecucion local en NPU AMD Ryzen AI mediante el stack Ryzen AI 1.9.0.
- No dispone de vision, audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Asistentes locales en portatiles Ryzen AI: el modelo se ejecuta en la NPU sin GPU dedicada, lo que permite un asistente conversacional siempre disponible con consumo energetico reducido y sin enviar datos a la nube.
- Procesamiento de documentos confidenciales: resumen y extraccion de entidades en entornos corporativos donde no se permite la salida de datos a servicios externos, aprovechando la inferencia 100 % local.
- Clasificacion y enrutado de tickets de soporte: el modelo puede etiquetar y priorizar consultas en ingles dentro de un pipeline de atencion al cliente, con latencia baja al ejecutarse en NPU.
- Generacion de borradores de correo y respuestas: integrado en clientes de correo o CRMs como funcion de autocompletado contextual, gracias al bajo coste por inferencia en hardware de consumo.
- Prototipado de agentes con tool calling: util para validar flujos de function calling y agentes multi-paso en local antes de migrar a modelos mayores en produccion.
- Educacion y demos offline: despliegue en aulas o entornos sin conectividad para demostrar conceptos de LLM y tecnicas de prompting sin infraestructura cloud.
- Filtrado y preprocesado en pipelines RAG: el modelo puede reformular consultas y filtrar fragmentos recuperados antes de pasarlos a un modelo mayor, reduciendo costes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de MMLU, HumanEval, GSM8K ni comparativas de latencia o throughput en NPU Ryzen AI.

## Requisitos de hardware

- VRAM: no aplica; el modelo esta disenado para ejecutarse en NPU, no en GPU. El repositorio ocupa 2,0 GB, por lo que se necesita al menos esa cantidad de memoria del sistema o memoria compartida accesible por la NPU.
- Hardware objetivo: procesadores AMD Ryzen AI compatibles con el stack Ryzen AI 1.9.0 (arquitecturas XDNA/XDNA2). La lista exacta de SKUs soportados no esta disponible en la ficha.
- GPU dedicadas: no es el objetivo del paquete; no se documenta soporte para A100, H100 ni RTX 4090 en esta distribucion concreta.
- Despliegue: runtime Ryzen AI 1.9.0 con modelos ONNX. No se indica soporte para vLLM, llama.cpp, Ollama ni TGI en esta variante.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| AMD/Llama-3.2-1B-Instruct_rai_1.9.0_npu | 1B | 128k (heredado) | ONNX (Quark) | Llama 3.2 | NPU Ryzen AI |
| meta-llama/Llama-3.2-1B-Instruct | 1B | 128k | safetensors | Llama 3.2 | GPU/CPU generico |
| Qwen2.5-1.5B-Instruct | 1,5B | 32k | safetensors, GGUF | Apache 2.0 | GPU/CPU generico |
| Gemma 2 2B Instruct | 2B | 8k | safetensors | Gemma Terms | GPU/CPU generico |

La diferencia clave frente a las alternativas es el empaquetado para NPU y el runtime especifico de AMD; en capacidades y tamano es equivalente al Llama 3.2 1B Instruct original, pero con menor portabilidad fuera del ecosistema Ryzen AI.

## Limitaciones y advertencias

- Solo soporta ingles de forma declarada; el rendimiento en castellano no esta garantizado.
- Modelo de 1B parametros: propenso a alucinaciones y errores en razonamiento complejo, matematicas avanzadas y tareas de codigo de larga duracion.
- Fuertemente acoplado al hardware AMD Ryzen AI y al runtime 1.9.0; no es portable a GPU NVIDIA ni a otros aceleradores sin reconversion.
- Acceso restringido en HuggingFace: es necesario aceptar la licencia Llama 3.2 antes de descargar.
- La licencia Llama 3.2 Community License impone condiciones al uso comercial (umbral de 700 millones de usuarios mensuales, atribucion "Built with Llama" y restricciones de uso aceptable); revisar antes de desplegar en produccion.
- La cuantizacion con Quark puede degradar ligeramente la calidad respecto al modelo original en safetensors; no se publican evaluaciones de la perdida de precision.
- No se documentan sesgos especificos de esta distribucion; aplican los sesgos conocidos del modelo base Llama 3.2.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/amd/Llama-3.2-1B-Instruct_rai_1.9.0_npu
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- Licencia Llama 3.2: https://www.llama.com/llama3_2/license/
- AMD Ryzen AI: https://www.amd.com/en/products/processors/consumer/ryzen-ai.html
- AMD Quark (toolkit de cuantizacion): https://quark.docs.amd.com/
- Documentacion de Ryzen AI Software: https://ryzenai.docs.amd.com/
