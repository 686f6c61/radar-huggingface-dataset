# harshagowtham/qwen3-14b-code-agent-v2

## Resumen

qwen3-14b-code-agent-v2 es un modelo derivado de Qwen/Qwen3-14B publicado por el usuario harshagowtham en Hugging Face. Consiste en un fine-tune orientado a tareas de agente de codigo, al que se le ha aplicado una tecnica propietaria de "weight surgery" sobre 13 tensores de proyeccion residual y se le ha fusionado un adaptador LoRA para tool calling (MCP). El resultado se distribuye como safetensors planos, sin necesidad de aplicar parches ni cargar adaptadores por separado.

El modelo mantiene la arquitectura original de Qwen3-14B: 40 capas, dimension oculta de 5120 y una ventana de contexto nativa de 32k tokens. Esta pensado para servir como agente de codigo con soporte de llamadas a herramientas y modo thinking, y es compatible con transformers, vLLM y un motor propio del autor (llm_engine) que aplica cuantizacion de 4 bits automatica en GPUs con menos de 24 GB de VRAM.

La relevancia de esta publicacion es limitada: se trata de un artefacto de investigacion personal sin descargas ni validacion externa en el momento de redactar esta ficha, y sin resultados de benchmarks publicados. Su interes tecnico radica en la receta de fusion de pesos descrita, no en un rendimiento demostrado frente a alternativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), 40 capas, hidden 5120 |
| Parametros totales | 14B (heredados de Qwen3-14B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32k tokens nativos |
| Tipos de cuantizacion | bitsandbytes NF4 (soportado); el autor lo describe como "quantization-friendly"; no se listan GGUF ni otras variantes |
| Idiomas soportados | Ingles (codigo y uso general), segun la model card |
| Licencia | Apache-2.0 (heredada de Qwen3-14B y repos constituyentes) |
| Formato de pesos | safetensors (pesos fusionados, sin adaptadores) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-14B, un transformer decoder-only denso de 40 capas con dimension oculta 5120 y contexto nativo de 32k tokens. Sobre esa base se aplico un fine-tune orientado a codigo y uso como agente (repo harshagowtham/qwen3-14b-code-agent). Segun la model card, ese fine-tune introdujo una deriva ligera pero uniforme en las 280 matrices de proyeccion, por lo que el autor aplico un paso de "weight surgery": para los 13 tensores de mayor energia entre las proyecciones o_proj y down_proj (top-8 y top-5 respectivamente), recalculo los pesos como W = W_base + 0,70*(W_ft - W_base), recortando un 30% de la deriva en esas capas profundas y preservando el comportamiento aprendido de codigo y herramientas.

Posteriormente se fusiono mediante merge_and_unload() un adaptador LoRA (harshagowtham/qwen3-14b-code-agent-mcp-lora) entrenado para tool calling con protocolo MCP, con el objetivo de restaurar y reforzar la llamada estructurada a funciones. No se especifican en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset, ni si hubo RLHF o DPO. El proceso de construccion esta documentado como reproducible en Kaggle (GPU T4 x2, en torno a 40-60 minutos, ~28 GB de RAM y ~60 GB de disco), con verificacion por sha256 de cada parche y un smoke test de 50 tokens antes de publicar.

## Capacidades

- Generacion de codigo y finalizacion de codigo en ingles, heredada del fine-tune sobre Qwen3-14B.
- Llamada a herramientas y function calling estructurado, reforzado por el adaptador LoRA MCP fusionado.
- Uso como agente de codigo con razonamiento multi-paso, segun el uso previsto declarado ("coding agent, tool calling, long-form site/code generation").
- Modo thinking: soporta el flag `enable_thinking` de la plantilla de chat de Qwen3.
- Generacion de sitios web y codigo de formato largo gracias a la ventana de 32k tokens.
- Capacidades multilingues: limitadas a ingles segun la model card (no se declaran otros idiomas).
- No se declaran capacidades de vision, audio ni otras modalidades.

## Casos de uso

- Agente de codigo en terminal o IDE: el modelo puede recibir contexto de repositorio y emitir llamadas a herramientas (lectura de ficheros, ejecucion de comandos) gracias al adaptador MCP fusionado, integrandose en flujos de trabajo tipo agente.
- Automatizacion de tareas de refactorizacion: con 32k tokens de contexto puede procesar varios ficheros de un modulo pequeno en una sola pasada y proponer cambios coherentes entre ellos.
- Generacion de sitios web y paginas estaticas: el uso previsto incluye generacion de codigo de formato largo, adecuado para producir HTML, CSS y JavaScript en una unica respuesta dentro de la ventana de contexto.
- Servidor de inferencia compatible con OpenAI: el motor llm_engine del autor expone una API compatible con OpenAI, lo que permite conectarlo a clientes y frameworks de agentes existentes sin adaptadores adicionales.
- Prototipado en GPU de consumo: con cuantizacion NF4 automatica por debajo de 24 GB de VRAM, puede desplegarse en una RTX 3090 o RTX 4090 para experimentacion local con tool calling.
- Evaluacion de tecnicas de fusion de pesos: el repositorio documenta la receta de weight surgery y su verificacion, por lo que sirve como caso de estudio reproducible para investigadores interesados en merge de fine-tunes y LoRA.
- Despliegue en vLLM: al conservar la arquitectura estandar de Qwen3, puede servirse con vLLM para obtener throughput agregado en escenarios de multiple usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bf16: en torno a 28 GB solo para pesos, mas overhead de activaciones y cache KV; requiere GPU de 40 GB o superior (A100 40/80 GB, H100) para inferencia comoda a contexto largo.
- VRAM estimada en NF4 (4 bits): aproximadamente 8-9 GB para pesos, lo que permite ejecucion en GPUs de consumo con 12-16 GB o mas, como RTX 3060 12 GB, RTX 4070 Ti, RTX 4080 o RTX 4090.
- El autor indica que llm_engine aplica cuantizacion de 4 bits automaticamente en GPUs con menos de 24 GB de VRAM.
- Opciones de despliegue: transformers (bf16 con device_map="auto"), vLLM (arquitectura Qwen3 estandar), llm_engine del autor con API compatible con OpenAI. No se mencionan llama.cpp, Ollama ni TGI, y no se listan pesos GGUF.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| qwen3-14b-code-agent-v2 | 14B | 32k | Apache-2.0 | Hugging Face, 0 descargas | Fine-tune + weight surgery + LoRA MCP fusionado; sin benchmarks |
| Qwen/Qwen3-14B | 14B | 32k | Apache-2.0 | Hugging Face, ampliamente usado | Modelo base oficial; benchmarks publicados por el autor original |
| Qwen2.5-Coder-14B | 14B | 32k (128k con YaRN) | Apache-2.0 | Hugging Face | Alternativa oficial orientada a codigo; no disponible en la informacion proporcionada para comparar rendimiento con este modelo |

No se dispone de datos de rendimiento del modelo evaluado que permitan una comparacion cuantitativa con las alternativas citadas.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de que el fine-tune, la cirugia de pesos o el adaptador MCP mejoren al modelo base; la afirmacion de "recortar el 30% de la deriva" procede unicamente del autor.
- Modelo sin validacion externa: 0 descargas y 0 likes en el momento de redactar la ficha, sin revision por parte de la comunidad.
- Riesgo de alucinacion y de llamadas a herramientas mal formadas: el adaptador MCP se ha fusionado sin evaluacion publica de su tasa de acierto en tool calling.
- Idiomas: solo se declara ingles; el rendimiento en castellano no esta verificado y probablemente sea inferior.
- La tecnica de weight surgery es no estandar y su justificacion (seleccion de tensores por energia, factor 0,70) no esta respaldada por resultados publicados en la model card.
- Licencia Apache-2.0 heredada, lo que en principio permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del modelo fusionado.
- Dependencia de un motor propietario (llm_engine) para las funciones descritas de cuantizacion automatica y API compatible con OpenAI; con transformers o vLLM estandar hay que gestionar la cuantizacion manualmente.
- Reproducibilidad del build limitada a un entorno Kaggle concreto (T4 x2, ~28 GB de RAM); diferencias de version de transformers o peft pueden alterar el resultado del merge.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/harshagowtham/qwen3-14b-code-agent-v2
- Repo del fine-tune base: https://huggingface.co/harshagowtham/qwen3-14b-code-agent
- Repo de weight surgery (incluye SURGERY_REPORT.md): https://huggingface.co/harshagowtham/qwen3-14b-code-agent-wsurgery
- Adaptador LoRA MCP: https://huggingface.co/harshagowtham/qwen3-14b-code-agent-mcp-lora
- Scripts y motor llm_engine: https://huggingface.co/harshagowtham/qwen-agent-scripts
- Modelo base: https://huggingface.co/Qwen/Qwen3-14B
