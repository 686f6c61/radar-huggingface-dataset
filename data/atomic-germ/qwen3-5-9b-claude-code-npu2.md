# Atomic-Germ/Qwen3.5-9B-Claude-Code-NPU2

# Qwen3.5-9B-Claude-Code-NPU2 (Q4NX para FastFlowLM)

## Resumen

Qwen3.5-9B-Claude-Code-NPU2 es una conversión al formato propietario Q4NX del modelo Qwen3.5-9B-Claude-Opus-4.6-Distill, un fine-tune de 9.000 millones de parámetros orientado a tareas de programación y flujos agénticos, destilado a partir de Claude-Opus-4.6. El autor de la conversión, Atomic-Germ, no modifica los pesos del modelo original; únicamente los reempaqueta y cuantiza para ejecutarse de forma nativa en las NPU AMD Ryzen AI con arquitectura XDNA2 mediante el motor de inferencia FastFlowLM.

La relevancia de este modelo reside en que permite ejecutar un asistente de código de 9B con ventana de contexto de 262.144 tokens íntegramente en la NPU de un portátil o mini-PC con Ryzen AI 300, sin necesidad de GPU dedicada ni conexión a la nube. El formato Q4NX es un diseño de cuantización empaquetado específico para el motor matricial de la NPU, por lo que no es compatible con llama.cpp, Ollama ni vLLM; solo funciona con FastFlowLM (>= 0.9.45) sobre Linux con el stack XRT instalado. El repositorio incluye un instalador (`flm-add`) que registra el modelo en el directorio de usuario de FastFlowLM sin tocar la instalación del sistema.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, destilado de Claude-Opus-4.6) |
| Parametros totales | 9.000 millones (9B) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Q4NX (formato propietario de FastFlowLM, basado en Q4_1 reordenado) |
| Idiomas soportados | ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | Q4NX (no GGUF, no safetensors) |

## Arquitectura y entrenamiento

El modelo base `empero-ai/Qwen3.5-9B-Claude-Opus-4.6-Distill` es un fine-tune de Qwen3.5-9B obtenido mediante destilacion de conocimiento del modelo propietario Claude-Opus-4.6, especializado en tareas de generacion de codigo y razonamiento agente. La arquitectura subyacente es la del Qwen3.5-9B, un transformer denso con atencion de ventana larga (262.144 tokens), pero los detalles concretos de configuracion (numero de capas, dimensiones de atencion, tipo de RoPE, etc.) no se publican en la model card de esta conversion. El proceso de destilacion y el dataset de entrenamiento tampoco estan documentados en este repositorio; el autor remite a la model card original de empero-ai para esos datos.

La conversion a Q4NX consiste en una cuantizacion de 4 bits con un layout de empaquetado reordenado para ajustarse a los tamaños de tile y los patrones de acceso a memoria del motor matricial de la NPU XDNA2. No se trata de una cuantizacion GGUF estandar, sino de un formato propietario del motor FastFlowLM. El autor indica que los kernels de ejecucion (xclbins) son cerrados y no se incluyen en el repositorio; se enlazan los del modelo oficial `Qwen3.5-9B-NPU2`, ya que ambos comparten la familia de motor `qwen3.5`.

## Capacidades

- Generacion de codigo y autocompletado en multiples lenguajes (la destilacion de Claude-Opus-4.6 enfatiza tareas de programacion).
- Soporte de flujos agente (tag `agentic`): puede integrarse como backend local para herramientas tipo Claude Code o Codex CLI, gestionando conversaciones multi-turno y ejecucion de comandos.
- Conversacion general en ingles con contexto largo (262.144 tokens), util para analisis de repositorios completos o documentacion extensa.
- Razonamiento de multiples pasos en problemas de programacion, gracias al entrenamiento por destilacion de un modelo de alto rendimiento.
- No se confirma soporte de vision, audio ni tool calling explicito en la model card; la capacidad agente se infiere del etiquetado `agentic` y de los ejemplos de uso con Claude Code.

## Casos de uso

- Asistente de codigo local en portatiles AMD Ryzen AI: un desarrollador puede ejecutar el modelo en un Framework 13 o similar con Ryzen AI 300 y usarlo como autocompletado o chat de codigo sin conexion a internet ni costes por API.
- Agente de programacion autonomo: integrado con herramientas tipo Claude Code, el modelo puede recibir instrucciones de alto nivel, explorar el arbol del proyecto y proponer o aplicar cambios, aprovechando su ventana de 262K tokens para analizar grandes repositorios.
- Analisis de codebases extensos: la longitud de contexto permite cargar multiples ficheros de codigo en una sola pasada para tareas de revision, deteccion de bugs o documentacion automatica.
- Educacion y formacion en programacion: como tutor local que explica fragmentos de codigo, sugiere correcciones y razona sobre problemas de algoritmia.
- Prototipado rapido en entornos sin GPU: en equipos con NPU XDNA2, ofrece una alternativa de inferencia local con consumo energetico reducido frente a GPUs discretas.
- Generacion de scripts de automatizacion y CI/CD: el modelo puede producir pipelines, scripts de despliegue o configuraciones de infraestructura, con la ventaja de procesar especificaciones largas de proyecto en una sola consulta.

## Benchmarks y rendimiento

El autor publica un unico test, denominado "GhostWriter Influence Test", realizado en un portatil AMD Ryzen AI 340 Framework 13. No se trata de un benchmark estandarizado (no MMLU, HumanEval ni GSM8K) y no se ofrecen comparaciones con otros modelos.

| Metrica | Valor |
|---|---|
| Prompt tokens | 9.210 |
| Completion tokens | 1.141 |
| Total tokens | 10.351 |
| Max KV token capacity | 32.768 |
| KV token occupancy | 31.59 % |
| Load duration | 0.000000721 s |
| Prefill duration (TTFT) | 33.58 ms |
| Decoding duration | 198.47 ms |
| Prefill speed | 274.25 tokens/s |
| Decoding speed | 5.75 tokens/s |

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- NPU AMD XDNA2 (Ryzen AI 300 series o posterior), por ejemplo Strix Point. No es compatible con GPUs NVIDIA, Intel o Apple Silicon.
- FastFlowLM >= 0.9.45 con el CLI `flm` instalado, sobre Linux con el stack XRT (Xilinx Runtime) para la NPU.
- Al menos 16 GB de memoria unificada del sistema para los pesos Q4NX, activaciones y cache KV.
- El fichero `model.q4nx` ocupa 7.63 GB.
- No es posible desplegarlo con vLLM, llama.cpp, Ollama ni TGI; solo con FastFlowLM.
- Segun el benchmark del autor, la velocidad de prefill es de 274 tokens/s y la de decodificacion de 5.75 tokens/s en un Ryzen AI 340, con un TTFT de 33.5 ms.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativo del propio autor. La comparacion cualitativa se realiza con alternativas de la misma categoria (modelos de codigo de 7-9B parametros) y con el modelo base original.

| Modelo | Parametros | Contexto | Formato | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| Qwen3.5-9B-Claude-Code-NPU2 | 9B | 262.144 | Q4NX | Apache-2.0 | NPU AMD XDNA2 |
| Qwen2.5-Coder-7B-Instruct | 7B | 131.072 | GGUF / safetensors | Apache-2.0 | GPU / CPU (llama.cpp, Ollama) |
| empero-ai/Qwen3.5-9B-Claude-Opus-4.6-Distill | 9B | 262.144 | safetensors | Apache-2.0 | GPU / CPU |

La ventaja del modelo NPU2 es su ejecucion en hardware de bajo consumo y su contexto de 262K tokens, pero queda limitado a equipos AMD XDNA2. Las alternativas en GGUF son mas portables (cualquier GPU o CPU) aunque no ofrecen la misma eficiencia energetica en la NPU.

## Limitaciones y advertencias

- Solo es ejecutable en NPU AMD XDNA2 con FastFlowLM; no funciona con llama.cpp, Ollama, vLLM ni ningun otro runtime.
- Los kernels de la NPU (xclbins) son cerrados y no se incluyen en el repositorio; se dependen de los del modelo oficial `Qwen3.5-9B-NPU2`, lo que puede generar incompatibilidades futuras si la familia cambia.
- Velocidad de decodificacion baja en el benchmark del autor: 5.75 tokens/s, que puede ser insuficiente para interacciones en tiempo real en aplicaciones conversacionales exigentes.
- El modelo esta cuantizado en Q4NX, lo que puede implicar una perdida de calidad respecto al modelo original en safetensors, aunque no se aportan mediciones de degradacion.
- Solo esta soportado el ingles; no hay evidencia de capacidades multilingues.
- El entrenamiento del modelo base se realizo mediante destilacion de un modelo propietario; no se publican detalles del dataset ni de los metodos de alineacion, lo que limita la evaluacion de sesgos.
- No se han publicado benchmarks estandarizados (MMLU, HumanEval, etc.), por lo que no es posible comparar objetivamente su rendimiento con otras alternativas.
- El benchmark del autor es arbitrario y no reproducible con otros modelos; no debe considerarse una medida de rendimiento general.
- Riesgo de alucinacion en codigo: como cualquier modelo generativo, puede producir sugerencias de codigo incorrectas o con vulnerabilidades; se recomienda revision humana.
- La licencia Apache-2.0 permite uso comercial, pero la dependencia de kernels cerrados de FastFlowLM y del hardware AMD limita la portabilidad en entornos de produccion heterogeneos.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/Atomic-Germ/Qwen3.5-9B-Claude-Code-NPU2
- Modelo base original: https://huggingface.co/empero-ai/Qwen3.5-9B-Claude-Opus-4.6-Distill
- Motor FastFlowLM: https://fastflowlm.com
- Guia de uso con Claude Code: https://gist.github.com/kibotu/a009f00414b7c10fb1c74e603d7838c0
- Setup local Qwen3.5 (WSL2 + RTX 4070): https://github.com/maxrenke/qwen35-local-setup
- Guia de instalacion y benchmark con Claude Code: https://codersera.com/blog/run-install-and-benchmark-qwen35-claude-code-free-local-ai-coding-agent/
