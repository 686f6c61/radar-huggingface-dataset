# Atomic-Germ/Huihui-Qwythos-9B-Claude-Mythos-5-1M-abliterated-NPU2

## Resumen

Qwythos-9B-Claude-Mythos-5-1M (abliterated) es un modelo de lenguaje de 9 mil millones de parametros, desarrollado por el laboratorio independiente Empero como un fine-tune completo de Qwen3.5-9B. Esta version concreta, publicada por Atomic-Germ, es una conversion cuantizada en formato Q4NX, un formato propietario de empaquetado de pesos disenado exclusivamente para el motor de inferencia FastFlowLM sobre NPUs AMD Ryzen AI con arquitectura XDNA2. El modelo base original esta entrenado para uso agente con contexto largo de 1M de tokens, con capacidades de razonamiento y tool use, y ha sido sometido a un proceso de "abliteracion" que elimina parcialmente el safety tuning, resultando en un modelo sin censura.

La relevancia de este modelo reside en su especializacion para un hardware muy concreto: las NPU de AMD Ryzen AI 300 (Strix Point) y posteriores. No es un modelo para GPU convencionales ni para ejecucion en CPU con llama.cpp u Ollama. Es una pieza de un ecosistema emergente de inferencia local eficiente en NPU, que permite ejecutar un modelo de 9B con contexto largo en memoria unificada del sistema (unos 17 GB), sin necesidad de una GPU dedicada. El repositorio no incluye los kernels NPU, que son cerrados y se reutilizan del modelo oficial `Qwen3.5-9B-NPU2`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (transformer, fine-tune de Qwen3.5-9B) |
| Parametros totales | 9 mil millones (9B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens (segun config.json; el modelo base anuncia 1M) |
| Tipos de cuantizacion | Q4NX (formato de cuantizacion propietario de FastFlowLM, basado en Q4_1) |
| Idiomas soportados | ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | Q4NX (no es GGUF ni safetensors; exclusivo para FastFlowLM) |

## Arquitectura y entrenamiento

El modelo base, Qwythos-9B-Claude-Mythos-5-1M, es un fine-tune completo de Qwen3.5-9B, un transformer denso de 9B parametros. Empero lo describe como un modelo de razonamiento "que comprueba su propio trabajo", destilado de Claude Mythos 5, con una ventana de contexto anunciada de 1M de tokens y tool use nativo. Segun la publicacion de Empero, el fine-tune produce una mejora de +34 puntos en MMLU sobre su base. El proceso de "abliterated" aplicado posteriormente (mediante la libreria Heretic) reduce las negativas y el comportamiento de rechazo del modelo, dando como resultado un modelo "sin censura".

El repositorio de Atomic-Germ no incluye detalles de entrenamiento adicionales (datos, tokens, RLHF/DPO). La conversion Q4NX es una reordenacion de pesos cuantizados Q4_1 adaptada a los tile sizes y patrones de acceso a memoria del NPU de AMD. No se ha publicado informacion sobre el dataset de entrenamiento del fine-tune original ni sobre el proceso de abliteration mas alla de la mencion de la libreria Heretic.

## Capacidades

- Generacion de texto y razonamiento: modelo de lenguaje generalista de 9B con capacidades de razonamiento reforzadas por el fine-tune sobre datos de Claude Mythos 5.
- Soporte de tool calling / function calling: el modelo base incluye tool use nativo, segun la publicacion de Empero.
- Capacidades agente y multi-step reasoning: disenado para uso agente con contexto largo (1M de tokens en el modelo base; 262K en esta conversion).
- Contexto largo: la ventana de 262.144 tokens en config permite manejar documentos extensos y conversaciones de muchas vueltas.
- Sin censura: el proceso de abliterated elimina parcialmente los mecanismos de rechazo y negativa del modelo, lo que permite generar contenido que otros modelos rechazarian.
- Solo ingles: no hay evidencia de soporte multilingue.

## Casos de uso

- Razonamiento agente en hardware local: el modelo puede actuar como el motor de un agente autonomo (por ejemplo, un asistente de programacion que llama a herramientas) ejecutandose en un portatil con AMD Ryzen AI 300, sin necesidad de GPU dedicada ni conexion a la nube.
- Procesamiento de documentos largos en local: su contexto de 262K tokens permite analizar contratos, codigo fuente completo o libros enteros en una sola pasada, en un dispositivo de consumo.
- Generacion de codigo y revision de codigo: con tool calling y razonamiento multi-paso, puede integrarse en un pipeline de desarrollo local para generar codigo, revisar PRs o proponer refactors.
- Creacion de contenido sin restricciones: el modelo abliterated no impone los limites de seguridad habituales, por lo que puede usarse para escritura creativa con tematicas adultas o exploracion de escenarios que otros modelos rechazarian.
- Prototipado de aplicaciones de IA en NPU: desarrolladores que quieran experimentar con la inferencia en NPU de AMD pueden usar este repositorio como referencia para adaptar otros modelos de la familia qwen3.5.
- Chatbot local privado: con una configuracion de FastFlowLM, el modelo puede servir como chatbot conversacional en ingles, con todos los datos procesados en el dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La publicacion de Empero menciona una mejora de +34 puntos en MMLU del modelo base sobre su base, pero no se proporcionan los numeros absolutos en la informacion de este repositorio. No se ha publicado un estudio de rendimiento comparativo de la conversion Q4NX en NPU frente a otras cuantizaciones o hardware.

## Requisitos de hardware

- VRAM estimada: no aplica VRAM dedicada; requiere unos 17 GB de memoria unificada del sistema (pesos Q4NX de 7.76 GB + activaciones + KV cache).
- GPU recomendadas: ninguna. El modelo esta exclusivamente disenado para NPUs AMD Ryzen AI con arquitectura XDNA2 (NPU2), como las de la serie Strix Point (Ryzen AI 300) o posteriores.
- Consumer GPU: no, no es compatible con ninguna GPU de consumo.
- Opciones de despliegue: exclusivamente con el motor FastFlowLM (CLI `flm`), con Linux y la pila XRT NPU instalada. No es compatible con llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no se ha publicado informacion sobre latencia o throughput.
- Requisitos de software: FastFlowLM >= 0.9.45, `flm-add` para registrar el modelo, y los kernels NPU cerrados del modelo oficial `Qwen3.5-9B-NPU2`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Hardware objetivo |
|---|---|---|---|---|---|
| Qwythos-9B-Claude-Mythos-5-1M (este, Q4NX) | 9B | 262K (config) | Apache 2.0 | Q4NX | NPU AMD XDNA2 |
| Qwythos-9B-Claude-Mythos-5-1M (original) | 9B | 1M (anunciado) | Apache 2.0 | safetensors | GPU / CPU |
| Qwen3.5-9B (base) | 9B | no disponible | Apache 2.0 | safetensors, GGUF | GPU / CPU / NPU |
| Llama 3.1 8B | 8B | 128K | Llama 3.1 | safetensors, GGUF | GPU / CPU |

El modelo se diferencia de la mayoria de alternativas por su formato Q4NX y su ejecucion exclusiva en NPU de AMD, lo que limita su portabilidad a un hardware muy concreto. Frente a su modelo base original, pierde la flexibilidad de ejecucion en GPU/CPU a cambio de una inferencia eficiente en NPU con un consumo de memoria moderado (17 GB unificados).

## Limitaciones y advertencias

- Hardware restringido: solo funciona en NPUs AMD XDNA2 (Ryzen AI 300 o posteriores) con Linux y la pila XRT. No se puede ejecutar en GPU, CPU ni en otra NPU.
- Formato propietario: el formato Q4NX no es un GGUF y no es compatible con llama.cpp, Ollama ni ningun otro motor de inferencia. Depende de FastFlowLM y de sus kernels cerrados.
- Contexto real: la config indica 262.144 tokens, no los 1M anunciados en el nombre del modelo base. Verificar en cada caso el limite real.
- Solo ingles: no soporta otros idiomas.
- Modelo sin censura: el proceso de abliterated elimina los mecanismos de rechazo; el modelo puede generar contenido nocivo, ilegal o eticamente problematica. El usuario es el responsable de su uso.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede generar informacion falsa o inventada, especialmente en tareas de razonamiento complejas.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-9B tambien es Apache 2.0, por lo que no hay restricciones de licencia adicionales conocidas.
- Dependencia de kernels cerrados: la inferencia depende de los xclbins cerrados de FastFlowLM, que no son auditable ni modificables.
- El modelo no incluye el proceso de entrenamiento (no se publican datos de dataset, tokens ni metodo de alineacion), lo que limita la evaluacion de su comportamiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Atomic-Germ/Huihui-Qwythos-9B-Claude-Mythos-5-1M-abliterated-NPU2
- Modelo base: https://huggingface.co/empero-ai/Qwythos-9B-Claude-Mythos-5-1M
- Motor FastFlowLM: https://fastflowlm.com
- Web de Empero: https://empero.org/
- Publicacion de Qwythos-9B: https://empero.org/writing/qwythos-9b-release
- Version GGUF en Ollama: https://ollama.com/richardyoung/qwythos-9b-abliterated
