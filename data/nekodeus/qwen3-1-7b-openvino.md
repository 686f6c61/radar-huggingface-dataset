# Nekodeus/qwen3-1.7b-openvino

## Resumen

Nekodeus/qwen3-1.7b-openvino es una conversión a formato OpenVINO IR del modelo Qwen3-1.7B de Qwen, con cuantización INT8 de pesos mediante NNCF. El modelo base, Qwen3-1.7B, es un modelo de lenguaje causal compacto de la familia Qwen3, orientado a generación de texto conversacional y tareas de razonamiento en entornos con recursos limitados. Esta conversión está pensada específicamente para ejecutar inferencia optimizada en CPUs Intel (y GPUs integradas compatibles), sin necesidad de GPU dedicada.

La relevancia de esta ficha radica en la combinación de tres factores: un tamaño reducido (1,7 GB de repositorio), una licencia Apache-2.0 que permite uso comercial sin restricciones, y el formato OpenVINO, que permite despliegues locales en portátiles, equipos de oficina o servidores sin aceleradores. La conversión fue generada con `optimum-cli` de forma completamente offline sobre Kaggle con CPU. El modelo conserva la longitud de contexto de 40960 tokens del modelo original (ampliable con YaRN) y se distribuye en tres partes IR: modelo, tokenizador y detokenizador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3ForCausalLM (transformer decoder) |
| Parametros totales | 1,7 B |
| Parametros activos | no disponible (no se indica si es MoE; el modelo base es denso) |
| Longitud de contexto | 40960 tokens (ampliable con YaRN) |
| Tipos de cuantizacion | INT8 weight-only (NNCF); activaciones FP16/FP32 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | OpenVINO IR (3 partes: openvino_model, openvino_tokenizer, openvino_detokenizer) |

Datos adicionales: tamaño del repositorio 1,7 GB; librería `openvino`; versiones usadas en la conversión: optimum-intel 2.2.0, openvino 2026.4.1, transformers 5.16.1.

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder de tipo causal (Qwen3ForCausalLM) con 1,7 B de parámetros. El modelo base Qwen3-1.7B soporta una ventana de contexto nativa de 40960 tokens y es compatible con YaRN para extenderla. La familia Qwen3 incorpora modos de razonamiento (thinking mode) según la documentación oficial de Qwen, aunque la model card de esta conversión no detalla los datos de entrenamiento del modelo base (número de tokens, composición del dataset ni ajuste con RLHF/DPO): no disponible.

La innovación principal de este repositorio no es arquitectónica sino de despliegue: se trata de una cuantización INT8 weight-only mediante NNCF (Neural Network Compression Framework de Intel), que reduce los pesos a 8 bits manteniendo las activaciones en FP16/FP32. El resultado se exporta como OpenVINO IR, el formato intermedio optimizado para el runtime de Intel, lo que permite inferencia eficiente en CPU sin dependencia de frameworks de CUDA.

## Capacidades

- Generacion de texto conversacional (pipeline text-generation).
- Razonamiento y matematicas: la familia Qwen3 esta orientada a tareas de razonamiento; el modelo base soporta thinking mode (no verificado en esta conversion concreta).
- Generacion de codigo: el modelo base Qwen3 incluye capacidades de codigo, aunque sin benchmarks publicados para esta conversion.
- Contexto largo: hasta 40960 tokens de ventana, util para documentos extensos.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Vision, audio u otras modalidades: no disponibles; es un modelo de texto unimodal.

## Casos de uso

- Chatbots locales en CPU: gracias al formato OpenVINO y a los 1,7 B de parametros, puede ejecutarse en portatiles y equipos de oficina sin GPU, usando OpenVINO GenAI con `LLMPipeline`.
- Resumen de documentos largos: la ventana de 40960 tokens permite procesar informes, contratos o articulos extensos en una sola pasada.
- Asistente de redaccion integrado en aplicaciones de escritorio: la baja huella de memoria y la licencia Apache-2.0 facilitan su inclusion en software comercial sin costes de licenciamiento.
- Prototipado rapido de LLM en entornos sin GPU: la conversion se genero en Kaggle con CPU, lo que demuestra que el flujo completo (exportacion e inferencia) funciona sin aceleradores.
- Inferencia en servidores Intel: el runtime OpenVINO esta optimizado para CPUs Intel (Xeon, Core), util para despliegues on-premise donde no se desea instalar una pila CUDA.
- Clasificacion y extraccion de informacion de texto: tareas ligeras de NLP donde un modelo de 1,7 B cuantizado INT8 ofrece latencias bajas en CPU.
- Generacion de codigo asistida en IDE: para autocompletado local de codigo en maquinas de desarrollo sin GPU dedicada, sujeto a validar la calidad del modelo base en esa tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni comparativas de latencia o perplejidad frente al modelo base en FP16. Para evaluar el impacto de la cuantizacion INT8, se recomienda comparar directamente contra `Qwen/Qwen3-1.7B` en las tareas objetivo.

## Requisitos de hardware

- VRAM / memoria estimada: al ser una ejecucion orientada a CPU, el requisito principal es RAM; con pesos INT8 el repositorio ocupa 1,7 GB, por lo que un equipo con 8 GB de RAM deberia ser suficiente para inferencia (estimacion, dato no confirmado en la model card).
- GPU recomendadas: no requiere GPU; optimizado para CPUs Intel. Compatible tambien con GPUs Intel integradas y discretas soportadas por OpenVINO (dato no detallado en la model card).
- Consumer GPU: no es necesario; puede ejecutarse integramente en CPU. En GPUs Intel compatibles con OpenVINO cabe sin problemas dado su tamano de ~1,7 GB.
- Opciones de despliegue:
  - `optimum-intel` (`OVModelForCausalLM`) con transformers.
  - OpenVINO GenAI (`ov::genai::LLMPipeline`) en C++ o Python, especificando dispositivo "CPU".
  - No aplica directamente vLLM, llama.cpp, Ollama ni TGI al ser formato OpenVINO IR (no GGUF ni safetensors estandar).
- Latencia y throughput: no disponible; se espera buen rendimiento en CPU moderno gracias a la cuantizacion INT8 weight-only, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Formato / cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nekodeus/qwen3-1.7b-openvino | 1,7 B | OpenVINO IR, INT8 weight-only | 40960 | Apache-2.0 | Hugging Face (148 descargas) |
| Qwen/Qwen3-1.7B (base) | 1,7 B | safetensors (FP16/BF16) | 40960 (YaRN-capable) | Apache-2.0 | Hugging Face |
| Qwen/Qwen3-1.7B-GGUF (oficial/comunidad) | 1,7 B | GGUF (varias cuantizaciones) | 40960 | Apache-2.0 | Hugging Face (para llama.cpp/Ollama) |

La diferencia clave frente al modelo base es el formato: esta version sacrifica la precision completa de los pesos a cambio de ejecucion eficiente en CPU con OpenVINO. Frente a las variantes GGUF, la ventaja es la integracion nativa con el ecosistema Intel (optimum-intel, OpenVINO GenAI), mientras que GGUF es mas versatile en hardware heterogeneo (Apple Silicon, CUDA, etc.).

## Limitaciones y advertencias

- Sesgos conocidos: no disponible; hereda los sesgos del modelo base Qwen3-1.7B y de sus datos de entrenamiento, no documentados en esta model card.
- Riesgo de alucinacion: propio de cualquier LLM de 1,7 B; en modelos tan pequenos el riesgo de generar contenido incorrecto con apariencia plausible es elevado, especialmente en dominios especializados.
- Limitaciones de contexto o idioma: la model card no especifica los idiomas soportados; el modelo base Qwen3 esta orientado principalmente a chino e ingles, por lo que el rendimiento en castellano debe validarse.
- Restricciones de licencia: ninguna relevante; Apache-2.0 permite uso comercial, modificacion y redistribucion con atribucion.
- Caveats de produccion:
  - Es una conversion de comunidad (148 descargas, 1 like), sin respaldo oficial de Qwen ni de Intel; conviene validar la calidad de la cuantizacion INT8 antes de pasar a produccion.
  - La cuantizacion INT8 weight-only puede degradar ligeramente la calidad respecto al modelo base en FP16; no hay metricas publicadas del impacto.
  - El formato OpenVINO IR limita el despliegue al runtime de Intel; no es compatible con llama.cpp, vLLM ni Ollama directamente.
  - El soporte de thinking mode y tool calling depende de la version de transformers/OpenVINO usada en despliegue; no esta verificado en esta conversion.

## Enlaces

- Modelo: https://huggingface.co/Nekodeus/qwen3-1.7b-openvino
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- optimum-intel (herramienta de conversion y despliegue): https://huggingface.co/docs/optimum/intel/index
- OpenVINO: https://github.com/openvinotoolkit/openvino
- NNCF (framework de cuantizacion): https://github.com/openvinotoolkit/nncf
- Organizacion Qwen: https://huggingface.co/Qwen
