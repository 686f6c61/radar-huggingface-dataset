# amd/Qwen2.5_3B_Instruct_rai_1.9.0_m_1.0.1_npu

## Resumen

El modelo `amd/Qwen2.5_3B_Instruct_rai_1.9.0_m_1.0.1_npu` es una distribucion optimizada de Qwen2.5 3B Instruct publicada por AMD para su plataforma Ryzen AI. Se trata de una conversion al formato ONNX con el runtime Ryzen AI (RAI 1.9.0) y el modelo compilado `m_1.0.1_npu`, disenada especificamente para ejecutarse sobre la NPU integrada en los procesadores AMD Ryzen AI (familia Strix Point y similares). El modelo base es Qwen2.5 3B Instruct, un transformer decoder-only de aproximadamente 3.000 millones de parametros desarrollado por Alibaba Qwen.

El problema que resuelve esta distribucion es la ejecucion local eficiente de un LLM de 3B en hardware de PC con aceleracion NPU, sin depender de GPU dedicada ni de servicios en la nube. AMD empaqueta los pesos en ONNX y aplica las transformaciones necesarias para el stack Ryzen AI, de modo que el desarrollador puede desplegar generacion de texto conversacional en un portatil o mini-PC con NPU. El repositorio ocupa 2,5 GB, coherente con pesos en precision reducida (probablemente int8 o similar) para inferencia en NPU.

La relevancia actual radica en el interes creciente por la inferencia en el dispositivo (on-device) y en la NPU como acelerador de bajo consumo. Esta ficha cubre exclusivamente la informacion disponible en la model card de HuggingFace; los detalles de arquitectura del modelo base Qwen2.5 3B no se reproducen aqui salvo como contexto general, y muchos parametros tecnicos especificos de esta conversion no estan documentados en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen2.5 3B Instruct), exportado a ONNX para Ryzen AI |
| Parametros totales | Aproximadamente 3.000 millones (modelo base Qwen2.5 3B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (el repo de 2,5 GB sugiere precision reducida, pero no se especifica) |
| Idiomas soportados | Ingles (segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (runtime Ryzen AI 1.9.0, modelo compilado `m_1.0.1_npu`) |

## Arquitectura y entrenamiento

El modelo es una conversion del Qwen2.5 3B Instruct original al ecosistema Ryzen AI. La arquitectura subyacente es un transformer decoder-only con atencion causal, propio de la familia Qwen2.5. AMD ha realizado la exportacion a ONNX y la compilacion para la NPU mediante el runtime Ryzen AI en su version 1.9.0, con el identificador de modelo compilado `m_1.0.1_npu`. Esta compilacion implica habitualmente la cuantizacion de pesos y la fusion de operadores para adaptarse a las restricciones de la NPU (tipos de dato soportados, formas estaticas, operadores disponibles).

No se dispone en la informacion proporcionada de detalles sobre el proceso de entrenamiento del modelo base (numero de tokens, composicion del dataset, uso de RLHF o DPO), ni sobre posibles ajustes adicionales realizados por AMD mas alla de la conversion de formato. Tampoco se documentan innovaciones tecnicas especificas de esta distribucion (por ejemplo, decodificacion especulativa o atencion lineal). Cualquier afirmacion sobre el entrenamiento del Qwen2.5 3B Instruct original queda fuera del alcance de esta ficha y deberia consultarse en la model card oficial de Qwen.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo Qwen2.5 3B Instruct.
- Instrucciones y dialogo multi-turno (etiquetas `text-generation` y `conversational`).
- Inferencia acelerada en NPU de AMD Ryzen AI mediante el runtime Ryzen AI 1.9.0.
- Ejecucion local en dispositivo, sin necesidad de GPU dedicada ni conexion a servicios en la nube.
- No se documenta en la informacion proporcionada soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito para esta conversion.
- Capacidades multilingues: la model card solo declara ingles.

## Casos de uso

- Asistentes conversacionales locales en portatiles y mini-PC con Ryzen AI: el modelo puede gestionar dialogos multi-turno en ingles ejecutandose en la NPU, liberando la CPU y la iGPU para otras tareas y manteniendo los datos en el dispositivo.
- Procesamiento de texto en aplicaciones de escritorio: integracion mediante ONNX Runtime y Ryzen AI para resumir, reescribir o clasificar texto sin enviar contenido a la nube, util en entornos con requisitos de privacidad.
- Generacion de borradores y correos en herramientas ofimaticas: al ser un modelo de 3B, la latencia en NPU es compatible con autocompletado interactivo en ingles.
- Prototipado de aplicaciones de IA generativa en hardware AMD: sirve como referencia para validar pipelines ONNX + Ryzen AI antes de escalar a modelos mayores o a despliegues en produccion.
- Filtrado y moderacion de contenido en local: clasificacion y reescritura de texto en flujos de trabajo donde no se permite salida de datos del equipo.
- Educacion y demos de inferencia en NPU: permite mostrar en un portatil Ryzen AI como se ejecuta un LLM de 3B en hardware de consumo, con fines docentes o de evaluacion tecnologica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Hardware objetivo: NPU integrada en procesadores AMD Ryzen AI compatibles con el runtime Ryzen AI 1.9.0 y el modelo compilado `m_1.0.1_npu`. No se especifican en la informacion proporcionada los SKU exactos soportados.
- VRAM: no aplica en el sentido de GPU dedicada; el modelo se ejecuta en la NPU. El repositorio ocupa 2,5 GB, lo que da una idea del espacio en disco necesario.
- GPU recomendadas: no disponible; esta distribucion esta pensada para NPU, no para GPU.
- Compatibilidad con GPU de consumo: no documentada en la informacion proporcionada.
- Opciones de despliegue: runtime Ryzen AI 1.9.0 con pesos ONNX. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| amd/Qwen2.5_3B_Instruct_rai_1.9.0_m_1.0.1_npu | ~3B | No disponible | ONNX / Ryzen AI 1.9.0 (NPU) | Apache 2.0 | Gated en HuggingFace |
| Qwen2.5 3B Instruct (original) | ~3B | No disponible en esta ficha | Safetensors, GGUF, etc. | Apache 2.0 | Publico en HuggingFace |
| Otros LLM de ~3B para on-device | Variable | Variable | Variable | Variable | Variable |

La comparativa se limita al modelo base del que deriva esta conversion, ya que la informacion proporcionada no incluye datos de rendimiento que permitan contrastar con alternativas de la misma categoria. No se dispone de cifras de benchmarks para ninguna de las filas.

## Limitaciones y advertencias

- Acceso restringido (gated): es necesario aceptar condiciones en HuggingFace antes de descargar el modelo.
- Idiomas: la model card solo declara ingles; el rendimiento en castellano u otros idiomas no esta garantizado ni documentado.
- Conversion especifica de hardware: los pesos ONNX estan compilados para el runtime Ryzen AI 1.9.0 y la NPU; no son portables a otros aceleradores sin reconversion.
- Riesgo de alucinacion inherente a los LLM de 3B, especialmente en tareas de conocimiento factual y razonamiento complejo.
- Sesgos: no se documentan evaluaciones de sesgo en la informacion proporcionada; se heredan los del modelo base Qwen2.5 3B Instruct.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen2.5 y de los componentes del runtime Ryzen AI por separado.
- No se documentan capacidades de tool calling, agentes ni contexto largo para esta conversion; no asumirlas en produccion sin validacion.
- Ausencia de benchmarks publicados: no hay datos de calidad o latencia que permitan estimar el rendimiento real en NPU.

## Enlaces

- HuggingFace: https://huggingface.co/amd/Qwen2.5_3B_Instruct_rai_1.9.0_m_1.0.1_npu
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la informacion proporcionada.
