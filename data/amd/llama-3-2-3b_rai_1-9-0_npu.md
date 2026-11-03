# amd/Llama-3.2-3B_rai_1.9.0_npu

## Resumen

El modelo `amd/Llama-3.2-3B_rai_1.9.0_npu` es una distribucion optimizada del modelo Llama 3.2 de 3B parametros de Meta, publicada por AMD para su ejecucion sobre NPUs de la plataforma Ryzen AI. El repositorio contiene pesos en formato ONNX cuantizados con la herramienta Quark de AMD, y esta disenado para aprovechar el motor de inferencia Ryzen AI (RAI) en su version 1.9.0 sobre hardware AMD con NPU integrada. Resuelve el problema de desplegar un LLM de 3B en equipos de sobremesa y portatiles con acelerador neuronal dedicado, sin necesidad de GPU discreta.

El modelo base Llama 3.2 3B es un transformer denso con 3.210 millones de parametros, ventana de contexto de 128.000 tokens y entrenamiento multilingue (aunque esta distribucion declara solo ingles). AMD lo reempaqueta para el stack Ryzen AI, lo que implica una cadena de conversion y cuantizacion especifica que condiciona el formato de pesos y las opciones de despliegue.

Es relevante porque ejemplifica la tendencia a llevar inferencia LLM a NPUs de consumo (Intel Core Ultra, AMD Ryzen AI 300, Qualcomm Snapdragon X) con el objetivo de reducir consumo energetico y liberar la GPU. La ficha se limita a lo declarado en la model card y los metadatos del repositorio; los detalles de cuantizacion exacta y los benchmarks no estan publicados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Llama 3.2), exportado a ONNX para Ryzen AI NPU |
| Parametros totales | 3.210 millones (heredados de Llama 3.2 3B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 128.000 tokens (heredada de Llama 3.2 3B; no confirmada en esta distribucion) |
| Tipos de cuantizacion | Cuantizacion via Quark para NPU Ryzen AI; nivel exacto no disponible |
| Idiomas soportados | en (ingles, segun metadatos del repo) |
| Licencia | Llama 3.2 Community License |
| Formato de pesos | ONNX (repo de 4,5 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.2 3B: un transformer decoder-only denso con atencion por grupos (GQA), normalizacion RMSNorm y activacion SwiGLU, entrenado por Meta sobre un corpus multilingue de varios billones de tokens con fases de ajuste supervisado y RLHF/DPO. AMD no reentrena el modelo: aplica un pipeline de conversion a ONNX y cuantizacion con Quark para que el grafo sea compatible con el compilador y el runtime de Ryzen AI 1.9.0, que descarga las capas sobre la NPU XDNA del SoC.

La innovacion tecnica de esta distribucion no esta en el modelo sino en el target de ejecucion: inferencia sobre NPU integrada en lugar de GPU o CPU, con particionado entre CPU, iGPU y NPU segun lo que soporte el runtime. No hay informacion publica sobre el esquema de cuantizacion concreto (INT8, INT4 u otro), el numero de tokens de calibracion ni las capas que permanecen en CPU.

## Capacidades

- Generacion de texto en ingles con calidad equivalente al Llama 3.2 3B base, sujeto a la perdida por cuantizacion.
- Razonamiento basico y respuesta a instrucciones (el modelo base esta alineado con RLHF).
- Generacion de codigo y tareas de matematicas simples, dentro de los limites de un modelo de 3B.
- Soporte de tool calling y function calling heredado de Llama 3.2, aunque no se documenta en esta distribucion.
- Capacidades de agente multi-paso limitadas por el tamano del modelo.
- Multilinguee limitado: el repo declara solo ingles, aunque el modelo base soporta ocho idiomas oficiales.
- No incluye vision ni audio (la variante multimodal de Llama 3.2 es la de 11B).

## Casos de uso

- Asistentes locales en portatiles Ryzen AI: el modelo corre sobre la NPU liberando CPU y GPU para otras tareas, adecuado para un asistente de escritorio siempre activo con bajo consumo.
- Generacion de texto offline en entornos sin conectividad: al ejecutarse en hardware local, permite resumir documentos y redactar correos sin enviar datos a la nube.
- Clasificacion y extraccion de informacion en pipelines documentales: con contexto de hasta 128k tokens (segun el modelo base) puede procesar contratos o informes largos en local.
- Prototipado de agentes con tool calling en entornos de desarrollo sobre Windows con Ryzen AI, usando el runtime RAI para validar latencias antes de pasar a produccion.
- Educacion e investigacion: permite experimentar con cuantizacion y despliegue en NPU sin adquirir GPU dedicada.
- Preprocesado y enrutado en sistemas RAG locales: generar consultas, reescribir preguntas y filtrar fragmentos antes de un modelo mayor alojado en servidor.
- Automatizacion de soporte en ingles para pymes con requisitos de privacidad, ejecutando el modelo en el propio puesto de trabajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni metricas de latencia o throughput sobre NPU Ryzen AI.

## Requisitos de hardware

- NPU AMD Ryzen AI compatible con el runtime RAI 1.9.0 (familia Ryzen AI 300 / XDNA 2 y plataformas soportadas por dicha version); la lista exacta de SKUs no esta en la informacion disponible.
- El repo ocupa 4,5 GB, lo que sugiere pesos cuantizados en el rango de 4-8 bits; la VRAM/RAM compartida necesaria no esta documentada.
- No requiere GPU discreta; el objetivo es ejecucion sobre NPU integrada con memoria unificada del SoC.
- Despliegue mediante el stack Ryzen AI (ONNX Runtime con el execution provider de Ryzen AI y el runtime RAI 1.9.0). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en esta distribucion.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / target | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| amd/Llama-3.2-3B_rai_1.9.0_npu | 3,21B | 128k (heredado) | ONNX para NPU Ryzen AI | Llama 3.2 Community | Gated en HuggingFace |
| meta-llama/Llama-3.2-3B-Instruct | 3,21B | 128k | safetensors, GPU/CPU | Llama 3.2 Community | Publico en HuggingFace |
| Intel/neural-chat-7b-v3-3 (referencia de LLM optimizado para PC) | 7B | 4k-8k | varios | Apache 2.0 | Publico |
| Qwen2.5-3B-Instruct | 3,09B | 32k | safetensors, GGUF | Apache 2.0 | Publico |

La comparativa directa mas util es contra el Llama 3.2 3B original: misma arquitectura y licencia, pero distinto formato y target de ejecucion. Frente a alternativas como Qwen2.5-3B, la diferencia clave es la licencia (Llama Community frente a Apache 2.0) y el ecosistema de despliegue, mucho mas amplio en el caso de Qwen.

## Limitaciones y advertencias

- Acceso restringido: requiere aceptar la licencia Llama 3.2 en HuggingFace antes de descargar.
- La licencia Llama 3.2 Community impone restricciones (umbral de 700 millones de usuarios mensuales para licencia comercial adicional, clausulas de uso aceptable y obligacion de atribucion).
- Modelo de 3B: alta tasa de alucinacion en tareas de conocimiento factual y razonamiento complejo; no apto para decisiones criticas sin verificacion.
- Solo declara ingles; el rendimiento en castellano no esta garantizado ni evaluado.
- La cuantizacion para NPU puede degradar la calidad respecto al modelo original; no hay evaluacion publicada del delta.
- Dependencia fuerte del runtime Ryzen AI 1.9.0 y del hardware AMD compatible: no es portable a GPU NVIDIA ni a CPU generica sin reconversion.
- Cero descargas y cero likes en el momento de la consulta: ecosistema practicamente sin validacion por la comunidad.
- Sin benchmarks publicados: no se puede confirmar el rendimiento real en NPU ni comparar con alternativas en igualdad de condiciones.
- El modelo base Llama 3.2 tiene fecha de corte de conocimiento de diciembre de 2023; no cubre eventos posteriores.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/amd/Llama-3.2-3B_rai_1.9.0_npu
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Licencia Llama 3.2: https://www.llama.com/llama3_2/license/
- Documentacion de Ryzen AI (AMD): https://ryzenai.docs.amd.com/
- Herramienta de cuantizacion Quark (AMD): https://quark.docs.amd.com/
- ONNX Runtime: https://onnxruntime.ai/
