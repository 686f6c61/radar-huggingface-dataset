# amd/Llama-3.2-1B_rai_1.9.0_m_1.0.1_npu

## Resumen

AMD/Llama-3.2-1B_rai_1.9.0_m_1.0.1_npu es una distribucion del modelo Llama 3.2 de 1B parametros, publicada por AMD en formato ONNX y optimizada para su ecosistema Ryzen AI (RAI). El identificador del repositorio codifica la version del stack Ryzen AI (1.9.0), el modelo de ejecucion (m_1.0.1) y el destino de despliegue (NPU), lo que indica que se trata de un artefacto precompilado para ejecutarse en las unidades de procesamiento neuronal integradas en los procesadores AMD Ryzen AI.

El modelo base es Llama 3.2 1B, un transformer decoder-only denso de Meta con 1.000 millones de parametros, disenado para generacion de texto y tareas ligeras de razonamiento. AMD lo redistribuye bajo la licencia Llama 3.2, manteniendo el idioma de entrenamiento principal (ingles) y anadiendo la infraestructura de compilacion necesaria para su ejecucion acelerada en hardware AMD.

Su relevancia actual radica en que permite ejecutar un LLM en local sobre PCs con NPU Ryzen AI sin depender de GPU dedicada ni de servicios en la nube, algo relevante para escenarios de privacidad, latencia baja y despliegue en el borde. El acceso al repositorio esta restringido (gated) y requiere aceptar las condiciones en HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Llama 3.2 1B) |
| Parametros totales | 1.000 millones (modelo base Llama 3.2 1B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (formato ONNX compilado para NPU) |
| Idiomas soportados | en (ingles) |
| Licencia | llama3.2 |
| Formato de pesos | ONNX (compilado para Ryzen AI NPU) |

## Arquitectura y entrenamiento

El modelo subyacente es Llama 3.2 1B, un transformer decoder-only denso con atencion por cabezas agrupadas (GQA) y normalizacion RMSNorm, entrenado por Meta sobre un corpus multilingue mayoritariamente en ingles. La informacion disponible no detalla el numero exacto de tokens de entrenamiento, la composicion del dataset ni si se aplicaron etapas de RLHF o DPO en esta variante concreta; esos datos corresponden al modelo base original de Meta y no se reproducen aqui por no estar en la informacion proporcionada.

La aportacion de AMD consiste en la conversion y compilacion del modelo al formato ONNX y su empaquetado para el runtime Ryzen AI, con el objetivo de que se ejecute sobre la NPU integrada en los procesadores Ryzen AI. El sufijo `m_1.0.1_npu` indica la version del modelo de ejecucion y el backend de destino. No se dispone de informacion sobre tecnicas adicionales como decodificacion especulativa o atencion lineal en esta distribucion.

## Capacidades

- Generacion de texto en ingles (modelo base Llama 3.2 1B).
- Razonamiento basico y respuesta a preguntas de complejidad moderada.
- Generacion de codigo y resumen de texto a pequena escala.
- Ejecucion local sobre NPU Ryzen AI, sin GPU dedicada.
- Inferencia de baja latencia en el dispositivo (edge).
- Capacidades multilingues limitadas: el repositorio declara unicamente ingles.
- No se documenta soporte de tool calling, agentes, vision ni audio en esta distribucion.

## Casos de uso

- Asistentes locales en PC: ejecutar un chatbot de proposito general directamente en la NPU de un portatil Ryzen AI, sin enviar datos a la nube y con consumo energetico reducido.
- Procesamiento de texto con privacidad: resumir documentos sensibles (informes internos, notas clinicas) en local, ya que el modelo no requiere conexion externa.
- Autocompletado y redaccion asistida en aplicaciones de escritorio: integrar el modelo mediante ONNX Runtime para sugerencias de texto de baja latencia.
- Clasificacion y extraccion de informacion: usar el modelo para etiquetar correos, tickets o resenas en ingles dentro de un pipeline on-device.
- Prototipado de aplicaciones de IA en el borde: validar flujos de generacion de texto en hardware AMD antes de escalar a modelos mayores.
- Educacion y demos: desplegar un LLM pequeno en aulas o entornos de formacion con hardware Ryzen AI, sin infraestructura de servidor.
- Filtrado y moderacion local: preprocesar texto en el dispositivo para tareas de cribado antes de enviar solo lo relevante a sistemas mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Hardware objetivo: procesadores AMD Ryzen AI con NPU integrada; el modelo esta compilado especificamente para ese backend.
- VRAM: no aplica en el sentido tradicional; el modelo se ejecuta sobre la NPU y memoria del sistema. El repositorio ocupa 1,4 GB en formato ONNX.
- GPU dedicadas: no requeridas; el artefacto esta orientado a NPU, no a CUDA.
- Cabe en consumer hardware: si, en equipos con Ryzen AI compatibles con la version 1.9.0 del stack.
- Despliegue: ONNX Runtime con el runtime Ryzen AI; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en esta distribucion.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AMD/Llama-3.2-1B_rai_1.9.0_m_1.0.1_npu | 1B | no disponible | ONNX (NPU Ryzen AI) | llama3.2 | Gated en HuggingFace |
| meta-llama/Llama-3.2-1B | 1B | 128K (modelo base original) | safetensors | llama3.2 | Publico en HuggingFace |
| meta-llama/Llama-3.2-1B-Instruct | 1B | 128K (modelo base original) | safetensors | llama3.2 | Publico en HuggingFace |

La comparativa se limita al modelo base original de Meta, ya que no se dispone de datos de rendimiento ni de otros artefactos equivalentes empaquetados para NPU en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de 1B parametros: capacidad de razonamiento y conocimiento limitados frente a modelos mayores; propenso a errores en tareas complejas.
- Riesgo de alucinacion inherente a los LLM de este tamano, especialmente en preguntas factuales.
- Idioma: solo se declara ingles; el rendimiento en castellano no esta garantizado.
- Licencia Llama 3.2: impone restricciones de uso comercial y requiere cumplir la politica de uso aceptable de Meta; revisar los terminos antes de desplegar en produccion.
- Acceso restringido (gated): es necesario aceptar las condiciones en HuggingFace para descargar el modelo.
- Dependencia del stack Ryzen AI 1.9.0 y del backend NPU: la portabilidad a otro hardware no esta garantizada.
- No se documentan capacidades de tool calling, agentes ni multimodalidad; no asumirlas en produccion.
- Ausencia de benchmarks publicados: no hay evidencia cuantitativa de calidad en esta distribucion concreta.

## Enlaces

- HuggingFace: https://huggingface.co/amd/Llama-3.2-1B_rai_1.9.0_m_1.0.1_npu
- Modelo base Llama 3.2 (Meta): https://huggingface.co/meta-llama/Llama-3.2-1B
- Ryzen AI (AMD): https://www.amd.com/en/products/processors/ryzen-ai.html
- ONNX Runtime: https://onnxruntime.ai/
