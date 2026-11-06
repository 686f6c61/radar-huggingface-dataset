# amd/gemma-4-12B-it_rai_1.9.0_npu

## Resumen
El modelo `amd/gemma-4-12B-it_rai_1.9.0_npu` es una distribucion del modelo Gemma 4 de 12 mil millones de parametros en su variante instruida (it), publicada por AMD en formato ONNX y optimizada para ejecutarse sobre la NPU (unidad de procesamiento neuronal) de los procesadores AMD Ryzen AI. No se trata de un modelo entrenado desde cero por AMD, sino de una adaptacion del Gemma 4 de Google orientada al despliegue en hardware de PC con aceleracion NPU, empaquetada bajo el stack Ryzen AI (tags `ryzenai`, `npu`, `onnx`).

El problema que resuelve es la inferencia local de un modelo de 12B en equipos con procesadores Ryzen AI, aprovechando la NPU en lugar de la GPU o la CPU, lo que reduce el consumo energetico y libera recursos del sistema. La relevancia actual radica en la creciente demanda de ejecucion local de LLM en portatiles y mini-PC sin depender de la nube, y en la consolidacion de ONNX Runtime como via de despliegue multiplataforma.

El repositorio ocupa 16,9 GB, lo que es coherente con pesos en formato ONNX de un modelo de 12B (probablemente en precision fp16 o int8). El acceso esta restringido (gated) y requiere aceptar las condiciones de la licencia Gemma en Hugging Face. La informacion publica disponible es limitada: no se detallan arquitectura interna, contexto ni datos de entrenamiento mas alla de lo implicito en la familia Gemma 4.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (familia Gemma 4; transformer segun la nomenclatura de la familia, sin detalle en la ficha) |
| Parametros totales | 12B (segun el nombre del modelo) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato ONNX; 16,9 GB de repo sugiere fp16 o int8, sin confirmar) |
| Idiomas soportados | en (ingles, segun el tag de idioma) |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | ONNX (optimizado para Ryzen AI NPU) |

## Arquitectura y entrenamiento
No se dispone de informacion detallada sobre la arquitectura interna en la ficha del repositorio. Por el nombre y la familia, se trata de un modelo Gemma 4 en variante instruida (it) de 12B parametros. AMD no documenta en esta ficha el proceso de entrenamiento, el numero de tokens, la composicion del dataset ni si hubo RLHF o DPO; esos datos corresponderian a la publicacion original de Google y no se incluyen aqui.

La innovacion tecnica destacable de esta distribucion es el empaquetado para Ryzen AI: pesos en ONNX preparados para ejecutarse sobre la NPU de los procesadores AMD Ryzen AI mediante el stack `rai` (Ryzen AI) version 1.9.0. Esto implica conversiones y optimizaciones especificas de grafo para el acelerador NPU, no cambios en los pesos del modelo base. No se documentan tecnicas como decodificacion especulativa o attention lineal en la informacion disponible.

## Capacidades
- Generacion de texto conversacional en ingles, en su variante instruida (it).
- Razonamiento y respuesta a instrucciones, heredado del modelo Gemma 4 base.
- Generacion de codigo y matematicas: capacidad esperable de la familia, aunque no se detalla en la ficha.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun el tag `en`; no se confirman otros idiomas.
- Capacidades especiales (vision, audio, thinking mode): no disponibles en la informacion proporcionada.
- Ejecucion acelerada en NPU AMD Ryzen AI mediante ONNX Runtime y el stack `rai`.

## Casos de uso
- Asistente conversacional local en portatiles Ryzen AI: el modelo puede gestionar dialogos multi-turno en ingles ejecutandose sobre la NPU, liberando CPU y GPU para otras tareas y reduciendo el consumo energetico en comparacion con inferencia en GPU.
- Procesamiento de texto en el borde (edge): al ejecutarse en NPU de PC, permite tareas de resumen, clasificacion y reescritura sin enviar datos a la nube, util en entornos con requisitos de privacidad.
- Prototipado de aplicaciones ONNX: sirve como referencia para desarrolladores que quieran integrar un LLM de 12B en pipelines ONNX Runtime con aceleracion NPU en Windows.
- Generacion de codigo asistida en IDE local: un modelo de 12B instruido puede autocompletar y explicar codigo en el propio equipo, sin latencia de red, aunque limitado al ingles.
- Educacion y tutoria automatizada: respuestas a preguntas tecnicas en ingles con contexto conversacional, desplegado en aulas o laboratorios con hardware Ryzen AI.
- Evaluacion de hardware NPU: caso de uso para benchmarking de rendimiento y latencia de la NPU Ryzen AI frente a GPU/CPU en cargas de LLM.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM/RAM estimada: el repo ocupa 16,9 GB, por lo que se requiere al menos ese espacio en disco y memoria suficiente para cargar los pesos ONNX (tipicamente 12-16 GB en fp16; menos si la conversion es int8, sin confirmar).
- Hardware objetivo: procesadores AMD Ryzen AI con NPU integrada; el tag `ryzenai` y la version `rai_1.9.0` indican dependencia del stack Ryzen AI 1.9.0.
- GPU dedicada: no es el objetivo de esta distribucion; el modelo esta empaquetado para NPU.
- Cabe en consumer: si, en equipos con Ryzen AI y memoria suficiente (16 GB o mas recomendable).
- Opciones de despliegue: ONNX Runtime con el stack Ryzen AI; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI en esta ficha.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| amd/gemma-4-12B-it_rai_1.9.0_npu | 12B | no disponible | ONNX (NPU) | gemma | gated en HF |
| Gemma 4 12B it (original de Google) | 12B | no disponible | safetensors/GGUF (segun publicacion) | gemma | publico en HF |
| Modelos 12B-13B genericos (p. ej. Llama 3 8B/13B) | 8-13B | variable | safetensors/GGUF | variable | publico |

La comparativa detallada con alternativas concretas no esta disponible en la informacion proporcionada; la diferencia clave de esta distribucion es el empaquetado ONNX para NPU Ryzen AI frente a los pesos originales del modelo base.

## Limitaciones y advertencias
- Acceso restringido: requiere aceptar las condiciones de la licencia Gemma en Hugging Face; no es de descarga libre inmediata.
- Licencia Gemma: impone restricciones de uso comercial y obligaciones de atribucion; revisar los terminos antes de desplegar en produccion.
- Idioma: solo se declara ingles (`en`); el rendimiento en castellano no esta garantizado ni documentado.
- Dependencia de hardware: el modelo esta optimizado para NPU Ryzen AI y el stack `rai` 1.9.0; no es portable a otros aceleradores sin reconversion.
- Riesgo de alucinacion: inherente a los LLM de esta escala; no se documentan mitigaciones especificas.
- Sesgos: no se documentan evaluaciones de sesgo en la informacion disponible.
- Sin benchmarks publicados: no hay datos de rendimiento que permitan validar calidad frente al modelo base.
- Fecha de publicacion futura (2026-11-02) en los metadatos: verificar la vigencia y el estado real del repositorio.

## Enlaces
- Hugging Face: https://huggingface.co/amd/gemma-4-12B-it_rai_1.9.0_npu
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la informacion proporcionada.
