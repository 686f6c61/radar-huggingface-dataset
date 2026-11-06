# amd/gemma-4-12B-it_rai_1.9.0_m_1.0.1_npu

## Resumen

`amd/gemma-4-12B-it_rai_1.9.0_m_1.0.1_npu` es una distribucion optimizada del modelo Gemma 4 12B instruct, publicada por AMD para su ejecucion en unidades de procesamiento neuronal (NPU) integradas en procesadores de la familia Ryzen AI. El repositorio empaqueta los pesos en formato ONNX y los adapta al runtime RAI (Ryzen AI Inference) en su version 1.9.0, con un perfil de compilacion `m_1.0.1_npu` orientado especificamente al acelerador NPU del silicio AMD.

El modelo base, Gemma 4 12B instruct, es un transformer decoder-only de 12.000 millones de parametros desarrollado por Google DeepMind dentro de la familia Gemma. Esta variante no introduce cambios en la arquitectura ni en los pesos del modelo original: se trata de un artefacto de despliegue que traduce el grafo a ONNX y aplica las transformaciones necesarias para que el compilador de Ryzen AI pueda ejecutar la inferencia sobre la NPU, liberando la GPU y la CPU del sistema.

Su relevancia practica radica en que permite ejecutar un modelo de 12B en hardware de consumo con aceleracion dedicada, algo poco habitual en el ecosistema de NPUs de PC. El acceso esta restringido en Hugging Face y requiere aceptar las condiciones de la licencia Gemma, por lo que su uso comercial queda sujeto a los terminos de dicha licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Gemma 4 12B instruct, exportado a ONNX para NPU Ryzen AI) |
| Parametros totales | 12.000 millones (12B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo ocupa 12,1 GB, compatible con pesos de 8 bits) |
| Idiomas soportados | ingles (segun la model card) |
| Licencia | Gemma (acceso restringido, requiere aceptacion) |
| Formato de pesos | ONNX (runtime RAI 1.9.0, perfil `m_1.0.1_npu`) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer decoder-only de 12B parametros de la familia Gemma 4, entrenado por Google DeepMind. No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset, ni las etapas de alineacion (RLHF, DPO o similares) aplicadas al modelo base. Tampoco se documentan innovaciones arquitectonicas especificas de esta version.

La contribucion de AMD en este repositorio es de ingenieria de despliegue: exportacion del grafo a ONNX, aplicacion de las transformaciones requeridas por el compilador de Ryzen AI y empaquetado con el perfil `m_1.0.1_npu` del runtime RAI 1.9.0. El resultado es un artefacto listo para cargarse en la NPU de los procesadores Ryzen AI compatibles, sin necesidad de recompilar el modelo en destino.

## Capacidades

- Generacion de texto y conversacion multi-turno en ingles, heredadas del modelo instruct base.
- Razonamiento y respuesta a instrucciones en formato chat.
- Generacion de codigo y resolucion de tareas de matematicas, segun las capacidades del Gemma 4 12B instruct original.
- Ejecucion acelerada en NPU mediante el runtime Ryzen AI, con descarga de la CPU y la GPU del sistema.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Asistentes locales en portatiles y mini-PC con Ryzen AI: el modelo se ejecuta sobre la NPU integrada, lo que permite mantener un asistente conversacional activo sin consumir la GPU discreta ni penalizar la autonomia del equipo.
- Procesamiento de texto en segundo plano: tareas de resumen, reescritura o clasificacion que corren de forma continua en la NPU mientras la CPU y la GPU atienden otras cargas.
- Prototipado de aplicaciones de IA en Windows: el formato ONNX y el runtime RAI facilitan la integracion con el stack de inferencia de AMD sin necesidad de configurar CUDA.
- Generacion de codigo en entornos de desarrollo locales: un modelo de 12B instruct puede asistir en autocompletado y explicacion de codigo dentro de IDE, ejecutandose en el propio equipo.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse en local, los datos no salen del dispositivo, lo que encaja en escenarios con datos sensibles.
- Evaluacion de NPUs para investigacion: sirve como referencia para medir latencia y throughput de un modelo de 12B en silicio Ryzen AI frente a alternativas en GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- NPU Ryzen AI compatible con el runtime RAI 1.9.0 y el perfil `m_1.0.1_npu`; no se especifica en la informacion proporcionada que generaciones concretas de procesador estan soportadas.
- VRAM estimada: no aplica directamente, ya que la inferencia se ejecuta en la NPU; el repo ocupa 12,1 GB en disco.
- GPU recomendadas: no aplica para esta variante; el modelo esta compilado para NPU.
- Compatibilidad con GPU de consumo: no disponible para esta distribucion; para ejecucion en GPU habria que recurrir a otras variantes del modelo base.
- Opciones de despliegue: runtime Ryzen AI (RAI) 1.9.0 con backend ONNX; no se documenta soporte de vLLM, llama.cpp, Ollama o TGI para este artefacto.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| amd/gemma-4-12B-it_rai_1.9.0_m_1.0.1_npu | 12B | no disponible | ONNX / Ryzen AI NPU | Gemma (gated) | Hugging Face, acceso restringido |
| Gemma 4 12B instruct (original) | 12B | no disponible | safetensors / varios runtimes | Gemma | Hugging Face |
| Otras distribuciones ONNX de modelos de ~12B | variable | variable | ONNX / CPU-GPU | variable | Hugging Face |

La comparativa detallada con alternativas de la misma categoria no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo esta documentado unicamente para ingles; el rendimiento en castellano no esta garantizado.
- Al ser una distribucion de despliegue, hereda los sesgos y el riesgo de alucinacion del Gemma 4 12B instruct base, sin que se documenten mitigaciones adicionales.
- La licencia Gemma impone condiciones de uso, incluida la aceptacion previa en Hugging Face; es necesario revisar sus restricciones antes de un uso comercial.
- La ejecucion esta ligada al runtime RAI 1.9.0 y al perfil `m_1.0.1_npu`; cambios de version del runtime o del firmware de la NPU pueden romper la compatibilidad.
- No se documentan requisitos minimos de hardware, latencias ni limites de contexto, lo que dificulta planificar un despliegue en produccion.
- El repositorio no registra descargas ni valoraciones, por lo que no hay evidencia publica de validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/amd/gemma-4-12B-it_rai_1.9.0_m_1.0.1_npu
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la informacion proporcionada.
