# Atomic-Germ/Qwen3.6-35B-A3B-NPU2

## Resumen

Atomic-Germ/Qwen3.6-35B-A3B-NPU2 es una conversión cuantizada del modelo Qwen3.6-35B-A3B de Qwen (Alibaba), un modelo de lenguaje de tipo Mixture-of-Experts (MoE) con aproximadamente 36.000 millones de parámetros totales y unos 3.000 millones activos por token. Esta variante concreta está empaquetada en formato Q4NX, el formato de cuantización nativo del motor de inferencia FastFlowLM, diseñado específicamente para las NPU AMD Ryzen AI con arquitectura XDNA2. El repositorio incluye tanto los pesos de texto como los pesos de la torre de visión, por lo que conserva las capacidades multimodales del modelo original.

El problema que resuelve es la ejecución local de un MoE de gran tamaño en hardware de consumo de AMD sin necesidad de GPU dedicada, aprovechando la unidad de procesamiento neuronal (NPU) integrada en los procesadores Ryzen AI 300 series y posteriores. Su relevancia radica en que permite desplegar un modelo con contexto de 262.144 tokens, tool calling, modo de razonamiento y visión en equipos portátiles o estaciones de trabajo con AMD Ryzen AI, algo que hasta ahora requería GPUs de alta gama. La licencia Apache-2.0 facilita su uso comercial y su integración en productos propios.

Es importante señalar que este repositorio no contiene el modelo original en pesos completos, sino una conversión cuantizada para un motor concreto. No es compatible con llama.cpp, Ollama ni vLLM, y requiere el stack de software FastFlowLM junto con el runtime XRT de AMD para NPU.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) transformer, familia de motor `qwen3.6-moe` |
| Parametros totales | Aproximadamente 36B (nomenclatura del modelo: 35B-A3B) |
| Parametros activos | Aproximadamente 3B por token |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Q4NX (formato propietario de FastFlowLM, basado en una reordenación de Q4_1) |
| Idiomas soportados | Ingles (segun la model card; el modelo base Qwen3.6 probablemente soporta mas idiomas, pero no se especifica en la informacion disponible) |
| Licencia | Apache-2.0 |
| Formato de pesos | Q4NX (no es safetensors ni GGUF; exclusivo de FastFlowLM) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen/Qwen3.6-35B-A3B, un transformer MoE con aproximadamente 36B de parámetros totales y unos 3B activos por token. El modelo original soporta entrada multimodal (texto e imágenes), tool calling, un modo de razonamiento explícito (thinking mode) y una ventana de contexto de 262.144 tokens. Esta conversión concreta no añade ninguna innovación arquitectónica propia, sino que reempaqueta los pesos en el formato Q4NX, que reordena la cuantización Q4_1 para adaptarse a los tamaños de tile y los patrones de acceso a memoria de la matriz de la NPU XDNA2.

Los detalles de entrenamiento del modelo base (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO) no están disponibles en la información proporcionada para esta conversión. La model card remite a la model card upstream de Qwen/Qwen3.6-35B-A3B para esos datos. Lo que sí se especifica es que los kernels de la NPU (archivos xclbin) son cerrados y no se incluyen en este repositorio; el script `flm-add.py` enlaza los kernels del modelo oficial `qwen3.6-moe:35b-a3b` de FastFlowLM, ya que comparten la misma familia de motor y arquitectura.

## Capacidades

- Generación de texto conversacional y completado de texto, con pipeline `text-generation`.
- Razonamiento multi-step con modo de pensamiento explícito (thinking mode), según la descripción del modelo base.
- Tool calling y function calling, lo que permite integrar el modelo en flujos de agentes que invocan herramientas externas.
- Capacidades multimodales de visión: el repositorio incluye un archivo `vision_weight.q4nx` con los pesos de la torre de visión, por lo que puede procesar imágenes además de texto.
- Ventana de contexto larga de 262.144 tokens, adecuada para documentos extensos, conversaciones multi-turno o análisis de código de gran tamaño.
- Soporte de chat template mediante `chat_template.jinja` y tokenizer incluidos en el repositorio.
- Idioma declarado en la model card: inglés. No se documentan otros idiomas en esta conversión.

## Casos de uso

- Asistentes conversacionales locales en portátiles con AMD Ryzen AI: el modelo puede ejecutarse en la NPU XDNA2 sin GPU dedicada, lo que permite desplegar un asistente personal con contexto largo en equipos de consumo, ideal para entornos donde la privacidad de los datos es crítica.
- Análisis de documentos extensos: con 262.144 tokens de contexto, puede resumir, extraer información o responder preguntas sobre libros técnicos, expedientes legales o informes de investigación completos sin necesidad de dividir el texto.
- Agentes con tool calling: gracias al soporte de function calling, puede integrarse en pipelines de automatización que consultan APIs, bases de datos o ejecutan acciones en sistemas externos, todo ello ejecutándose en hardware local de bajo consumo energético.
- Aplicaciones multimodales de visión: al incluir la torre de visión cuantizada, puede procesar capturas de pantalla, diagramas o fotografías para generar descripciones, responder preguntas sobre imágenes o extraer texto de documentos escaneados, sin depender de servicios en la nube.
- Desarrollo y pruebas de prototipos en equipos AMD: los desarrolladores pueden validar flujos de razonamiento y generación con un MoE de 35B en su estación de trabajo Ryzen AI antes de escalar a infraestructura más potente, reduciendo costes de experimentación.
- Despliegue en entornos con restricciones energéticas o de refrigeración: la NPU consume significativamente menos que una GPU dedicada, por lo que este modelo es adecuado para kioscos, dispositivos edge o equipos industriales donde la disipación térmica es un factor limitante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio remite a la model card upstream de Qwen/Qwen3.6-35B-A3B para datos de entrenamiento y rendimiento, pero dichos datos no se incluyen en la documentación de esta conversión. Tampoco se proporcionan mediciones de latencia o throughput específicas para la ejecución en NPU XDNA2 con el formato Q4NX.

## Requisitos de hardware

- Procesador AMD Ryzen AI con arquitectura XDNA2 (NPU2): series Strix Point / Ryzen AI 300 o posterior.
- Sistema operativo Linux con el stack XRT (Xilinx Runtime) para NPU instalado.
- FastFlowLM versión 0.9.45 o superior, con el CLI `flm` disponible.
- Aproximadamente 51 GB de memoria unificada del sistema (pesos Q4NX + activaciones + caché KV).
- El archivo `model.q4nx` ocupa 23.24 GB; el repositorio completo pesa 143.2 GB (incluye archivos adicionales).
- No requiere GPU dedicada; la inferencia se ejecuta en la NPU.
- Opciones de despliegue: exclusivamente mediante el motor FastFlowLM con el comando `flm run` tras registrar el modelo con `flm-add`. No es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la documentación proporcionada.

## Comparativa con modelos similares

La comparativa se limita a datos públicos disponibles, ya que no se han publicado benchmarks de esta conversión.

| Modelo | Tipo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B (base) | MoE | ~36B totales, ~3B activos | 262.144 | Apache-2.0 | Pesos originales (safetensors) |
| Qwen3.6-35B-A3B-NPU2 (esta conversion) | MoE cuantizado | ~36B totales, ~3B activos | 262.144 | Apache-2.0 | Q4NX (FastFlowLM) |
| Qwen3.6-27B (dense) | Denso | 27B | no disponible | Apache-2.0 (presumible) | Pesos originales |

La versión densa Qwen3.6-27B existe como alternativa dentro de la misma familia, pero no se dispone de especificaciones detalladas en la información recopilada. La diferencia clave es que la variante 35B-A3B es MoE con solo ~3B activos por token, lo que reduce el coste computacional por inferencia frente a un denso de 27B, aunque requiere el hardware NPU específico en esta conversión. No se dispone de datos para comparar con otros MoE de tamaño similar como Qwen3-30B-A3B.

## Limitaciones y advertencias

- Formato Q4NX propietario: no es un archivo GGUF ni safetensors, y no funciona en llama.cpp, Ollama, vLLM ni ningún otro motor que no sea FastFlowLM. Esto limita la portabilidad del modelo.
- Hardware restringido: requiere obligatoriamente una NPU AMD XDNA2 (Ryzen AI 300 series o posterior). No se ejecuta en GPUs NVIDIA, Intel ni en CPUs sin NPU compatible.
- Kernels cerrados: los archivos xclbin de la NPU son propietarios y no se distribuyen en este repositorio. El script `flm-add.py` enlaza los kernels del modelo oficial, lo que introduce una dependencia de la disponibilidad de esos kernels en la instalación de FastFlowLM.
- Advertencia del autor: la model card incluye un aviso en mayúsculas que dice textualmente "IF YOU USE COMMUNITY QWEN MODELS DO NOT UPGRADE TO FLM v1.0.2+". Esto sugiere que actualizar FastFlowLM a la versión 1.0.2 o superior podría romper la compatibilidad con modelos Qwen comunitarios como este. Debe tenerse en cuenta antes de actualizar el motor.
- Idioma: la model card declara únicamente inglés. Aunque el modelo base Qwen3.6 probablemente soporta más idiomas, esta conversión no documenta capacidades multilingües.
- Sin benchmarks publicados: no hay datos de rendimiento, calidad de generación ni degradación por cuantización disponibles para esta conversión. La pérdida de precisión respecto al modelo original en Q4NX no está cuantificada.
- Riesgo de alucinación y sesgos: al ser una conversión del modelo Qwen3.6, hereda los sesgos y limitaciones del modelo base, que no se detallan en la documentación de este repositorio.
- Memoria: requiere ~51 GB de memoria unificada, lo que descarta equipos con menos RAM y puede competir con otras aplicaciones en sistemas con 64 GB.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Atomic-Germ/Qwen3.6-35B-A3B-NPU2
- Modelo base Qwen/Qwen3.6-35B-A3B: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Sitio de FastFlowLM: https://fastflowlm.com
- Ficha del modelo en atomic.chat: https://atomic.chat/models/qwen3-6-35b-a3b
- Página de inferencia en FriendliAI: https://friendli.ai/models/Atomic-Germ/Qwen3.6-35B-A3B-NPU2
- Guia de Qwen 3.6 en insiderllm: https://insiderllm.com/guides/qwen-3-6-local-ai-guide/
