# amd/Qwen3.6-35B-A3B_gpuep_1.0_gpu_128

## Resumen

Qwen3.6-35B-A3B_gpuep_1.0_gpu_128 es una version cuantizada y optimizada del modelo multimodal Qwen/Qwen3.6-35B-A3B, publicada por AMD para su despliegue sobre hardware AMD Ryzen AI. El modelo original es un transformer de tipo Mixture of Experts (MoE) con 35 000 millones de parametros totales y 3 000 millones de parametros activos por token, disenado para tareas de imagen-texto a texto (image-text-to-text) y conversacion. AMD ha aplicado una estrategia de cuantizacion INT4 sobre los pesos del MoE con grupo de 32, manteniendo activaciones, vision y embeddings en FP16, y ha exportado el resultado a formato ONNX para su ejecucion en el runtime de Ryzen AI.

La relevancia de esta ficha radica en que no se trata de un modelo nuevo, sino de un artefacto de despliegue: el interes esta en como AMD adapta un MoE multimodal de gran tamano a aceleradores de PC con NPU/GPU integradas, no en capacidades nuevas del modelo. Para desarrolladores que evaluan modelos, esto permite ejecutar un modelo de 35B con solo 3B activos en hardware de consumo AMD, con un peso de repositorio de 41,5 GB y licencia Apache 2.0 en el modelo base.

La informacion disponible es limitada: la model card no detalla contexto, idiomas, datos de entrenamiento ni benchmarks. Por tanto, las secciones tecnicas se apoyan en los datos publicados y en las convenciones de la familia Qwen3, marcando explicitamente como "no disponible" todo aquello que no aparece en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE), tag `qwen3_5_moe` |
| Parametros totales | 35 000 millones (segun nombre del modelo) |
| Parametros activos | 3 000 millones (segun nombre del modelo) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 en pesos MoE (RTN, group size 32), FP16 en activaciones, vision y embeddings |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (modelo base); modificaciones AMD bajo MIT |
| Formato de pesos | ONNX (exportado con Olive y OGA Model Builder) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B es un transformer con arquitectura Mixture of Experts: de los 35B parametros totales, solo 3B se activan por token, lo que reduce el coste computacional por inferencia manteniendo una capacidad de representacion propia de un modelo mucho mayor. Incluye un componente de vision, ya que la pipeline es `image-text-to-text`, y esta etiquetado como conversacional. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o decodificacion especulativa.

La aportacion de AMD en este repositorio es puramente de despliegue: mediante Olive y OGA Model Builder se ha aplicado cuantizacion RTN con grupo de 32 sobre los pesos del MoE a INT4, manteniendo las activaciones, el encoder de vision y los embeddings en FP16. El resultado se exporta a ONNX para ejecutarse sobre el stack de Ryzen AI, aprovechando la NPU/GPU integrada de los procesadores AMD. El sufijo `gpu_128` sugiere una configuracion de despliegue orientada a GPU con un parametro de 128 (probablemente tamano de bloque o contexto de ejecucion), aunque el significado exacto no se documenta en la model card.

## Capacidades

- Generacion de texto y conversacion multi-turno, segun la pipeline `conversational`.
- Procesamiento de imagen y texto combinados (`image-text-to-text`), lo que habilita tareas de vision-lenguaje.
- Razonamiento y codigo: capacidades heredadas del modelo base Qwen3.6-35B-A3B, aunque no se detallan en la model card.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible.
- Capacidades multilingues: no disponibles.
- Modo thinking, audio u otras capacidades especiales: no disponibles.

## Casos de uso

- Despliegue en PC con Ryzen AI: ejecutar un MoE multimodal de 35B con 3B activos en equipos con NPU/GPU AMD, usando el formato ONNX y el runtime de Ryzen AI para inferencia local sin depender de la nube.
- Asistentes locales con vision: procesar capturas de pantalla, documentos escaneados o imagenes junto a texto en aplicaciones de escritorio, aprovechando la pipeline image-text-to-text.
- Prototipado de agentes multimodales en hardware de consumo: validar flujos de razonamiento sobre imagenes y texto antes de escalar a infraestructura de servidor, gracias al bajo coste por token del MoE (3B activos).
- Evaluacion de cuantizacion INT4 en MoE: comparar la calidad del modelo cuantizado frente al original en tareas de vision-lenguaje, midiendo la perdida introducida por RTN group 32.
- Integracion en pipelines ONNX: usar el modelo como componente en aplicaciones que ya emplean ONNX Runtime, evitando conversiones adicionales de formato.
- Investigacion sobre eficiencia en edge: estudiar el rendimiento de un MoE de 35B en aceleradores integrados, midiendo latencia y throughput frente a alternativas densas de menor tamano.
- Demos de IA local con privacidad: procesar imagenes y conversaciones sin salida a Internet en entornos con requisitos de confidencialidad, al ejecutarse en hardware local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el repositorio ocupa 41,5 GB en formato ONNX con pesos INT4; se requiere espacio equivalente en memoria para cargar el modelo, aunque el consumo real depende del runtime y de si se descargan capas bajo demanda.
- GPU recomendadas: hardware AMD Ryzen AI (NPU/GPU integrada); el sufijo `gpu_128` apunta a despliegue en GPU. No se especifican modelos concretos de GPU discreta.
- Compatibilidad con GPU de consumo: disenado para Ryzen AI, no para GPUs NVIDIA; no se confirma soporte en RTX 4090 u otras GPU de consumo.
- Opciones de despliegue: ONNX Runtime con el stack de Ryzen AI (OGA Model Builder); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|---|
| Qwen3.6-35B-A3B_gpuep_1.0_gpu_128 (este) | 35B | 3B | no disponible | ONNX INT4/FP16 | Apache 2.0 + MIT | Optimizado para Ryzen AI |
| Qwen/Qwen3.6-35B-A3B (base) | 35B | 3B | no disponible | safetensors | Apache 2.0 | Modelo original sin cuantizar |
| Otros MoE multimodales de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible | Sin datos en la informacion proporcionada |

## Limitaciones y advertencias

- La cuantizacion INT4 con RTN y grupo 32 puede degradar la calidad frente al modelo base en tareas sensibles, especialmente en razonamiento numerico y vision detallada; no se han publicado evaluaciones comparativas.
- El modelo esta optimizado exclusivamente para hardware AMD Ryzen AI; no es portable directamente a otros aceleradores sin reconversion.
- No se documentan sesgos conocidos, pero al heredar el modelo base Qwen3.6, arrastra los sesgos de sus datos de entrenamiento, no disponibles.
- Riesgo de alucinacion inherente a los modelos generativos, agravado por la falta de informacion sobre alineacion (RLHF/DPO) en la model card.
- Limitaciones de contexto e idioma: no disponibles; no se puede garantizar soporte multilingue ni una ventana de contexto concreta.
- Licencia: el modelo base es Apache 2.0, pero las modificaciones de AMD se distribuyen bajo MIT; conviene revisar ambas antes de uso comercial.
- El repositorio tiene solo 155 descargas y 0 likes, lo que indica poca validacion comunitaria; tratar como artefacto experimental de despliegue.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/amd/Qwen3.6-35B-A3B_gpuep_1.0_gpu_128
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Licencia Apache 2.0: http://www.apache.org/licenses/LICENSE-2.0
