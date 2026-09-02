# ji-farthing/Qwen3.8-Flash-Next-ik-llama-GGUF

## Resumen

Qwen3.8-Flash-Next es un modelo de lenguaje de mezcla de expertos (MoE) desarrollado por el equipo Qwen de Alibaba, y constituye el primer modelo open-weight con la arquitectura que servirá de base para Qwen4. Combina una arquitectura híbrida GDN + QSA (atención con gating denso y atención selectiva por consulta) con componentes de espacio de estados (SSM), conexiones hiper y una tabla de embeddings por capa (PLE). El modelo tiene 176.943.899.520 parámetros totales (125B principales más 51B de n-gram) y solo 6B activos por token, lo que lo hace especialmente eficiente para inferencia. Su ventana de contexto nativa es de 256K tokens.

Esta ficha cubre la conversión GGUF publicada por ji-farthing, que ofrece dos cuantizaciones (IQ3_KT e IQ4_KT) calibradas con una matriz de importancia orientada a codificación agéntica, e incluye un archivo complementario con la cabeza MTP (multi-token prediction) para decodificación especulativa. La conversión es solo de texto, aunque el modelo base es multimodal. Requiere el runtime ik_llama.cpp, una bifurcación de llama.cpp con soporte para los tipos de cuantización trellis KT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE hibrida GDN + QSA con componentes SSM y conexiones hiper |
| Parametros totales | 176.943.899.520 (125B principales + 51B n-gram) |
| Parametros activos | 6B por token |
| Longitud de contexto | 256K tokens (nativo) |
| Tipos de cuantizacion | IQ3_KT, IQ4_KT (expertos enrutados); IQ4_NL (tabla PLE y ffn_down_exps); Q8_0 (token_embd) |
| Idiomas soportados | no disponible (el modelo base es multilingue, pero no se especifica en esta conversion) |
| Licencia | qwen-community-license-1.0 |
| Formato de pesos | GGUF (ik_llama.cpp) |

## Arquitectura y entrenamiento

La arquitectura de Qwen3.8-Flash-Next es una mezcla de expertos hibrida que combina atencion GDN (gated dense network) con QSA (query-selective attention), e incorpora ademas componentes de espacio de estados (SSM), conexiones hiper (hyper-connection) y una tabla de embeddings por capa (PLE, per-layer token embedding). Segun la model card de la conversion, los tensores de atencion, SSM, hiper-conexion y experto compartido se cuantizan a IQ4_KT, mientras que los expertos enrutados (ffn_gate_exps y ffn_up_exps) se cuantizan a IQ3_KT o IQ4_KT segun el archivo. La tabla PLE, de 26,8 GiB, se cuantiza a IQ4_NL debido a la longitud de fila de 640, que no es compatible con los tipos de bloque de 256.

No se dispone de informacion sobre los datos de entrenamiento, el numero de tokens, la composicion del dataset ni si se aplicaron tecnicas como RLHF o DPO. La unica innovacion documentada en la conversion es la inclusion de la cabeza MTP (multi-token prediction) como archivo separado para decodificacion especulativa, que permite acelerar la generacion prediciendo varios tokens a la vez. La matriz de importancia se calibro sobre un corpus de codificacion agéntica, lo que optimiza la cuantizacion para tareas de agente y generacion de codigo.

## Capacidades

- Generacion de texto, razonamiento, codigo y matematicas (el modelo base es multimodal, pero esta conversion es solo de texto).
- Soporte de tool calling y function calling, disenado especificamente para codificacion agéntica.
- Soporte de agentes y razonamiento multi-paso, con capacidad de mantener contexto largo gracias a la ventana de 256K tokens.
- Capacidades multilingues del modelo base, aunque no se detallan en esta conversion.
- Decodificacion especulativa mediante la cabeza MTP incluida, que acelera la inferencia.
- Contexto largo nativo de 256K tokens, util para documentos extensos o repositorios completos.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a su ventana de 256K tokens, manteniendo el historial completo de la interaccion sin perder informacion relevante.
- Generacion de codigo en produccion: con soporte de tool calling, puede integrarse en pipelines de CI/CD para generar, revisar y corregir codigo automaticamente, reduciendo la intervencion manual.
- Agentes autonomos de codificacion: su arquitectura MoE con 6B activos y la calibracion de la cuantizacion para tareas agénticas lo hacen adecuado para agentes que deben razonar sobre multiples archivos y ejecutar acciones.
- Analisis y refactorizacion de repositorios completos: la ventana de 256K tokens permite procesar un repositorio entero de tamano medio en una sola pasada, identificando dependencias, duplicaciones y oportunidades de mejora.
- Asistente de programacion con contexto de proyecto: puede mantener el contexto de todo un proyecto en memoria, ofreciendo sugerencias coherentes con la arquitectura existente y los estilos de codigo.
- Procesamiento de documentos legales o academicos extensos: la capacidad de manejar 256K tokens permite resumir, extraer informacion y responder preguntas sobre documentos de cientos de paginas sin segmentacion.
- Despliegue en hardware consumer con cuantizacion agresiva: la version IQ3_KT, con 80,22 GiB, puede ejecutarse en una maquina con 64 GB de RAM y una GPU de 12 GB usando el modo --defer-ple y offloading de expertos a memoria del sistema.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card del autor incluye mediciones de perplexity y divergencia KL contra la referencia BF16, pero los valores estan incompletos en el extracto proporcionado. Se indica que la validacion se realizo sobre corpus de ingles y codigo (CPython y PostgreSQL), con 10 fragmentos de 2048 tokens por corpus, pero no se muestran los resultados completos de la cuantizacion IQ3_KT. Por tanto, no es posible presentar una tabla comparativa fiable.

## Requisitos de hardware

- VRAM estimada: la validacion se realizo en una RTX 4070 con 12 GB de VRAM y 64 GB de RAM, usando --defer-ple y offloading de los expertos enrutados a la memoria del sistema. Los expertos enrutados requieren 50,4 GiB (IQ3_KT) o 58,6 GiB (IQ4_KT) en RAM o VRAM.
- GPU recomendadas: cualquier GPU con al menos 12 GB de VRAM puede usarse con offloading a RAM; para mantener todos los expertos en VRAM se necesitaria una GPU con 50-60 GB, como una A100 80GB o H100.
- No cabe en una GPU consumer sin offloading a RAM; con 64 GB de RAM y una GPU de 12 GB es viable, como demuestra la validacion.
- Opciones de despliegue: ik_llama.cpp (llama-server) es el runtime principal; tambien se ha documentado su ejecucion con vLLM en hardware DGX Spark (segun el repositorio de blazux).
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos MoE de tamano similar (como Qwen3-235B-A22B o DeepSeek-V3) en la informacion proporcionada. La arquitectura GDN + QSA es novedosa y no existen mediciones estandarizadas publicas que permitan una comparacion rigurosa. Se recomienda consultar los benchmarks oficiales del modelo base en el repositorio de Qwen.

## Limitaciones y advertencias

- Requiere el runtime ik_llama.cpp; los tipos de cuantizacion KT trellis no son compatibles con llama.cpp estandar.
- La cabeza MTP necesita una compilacion de ik_llama.cpp con soporte para qwen4exp MTP (PR #2369) y la opcion --defer-ple (PR #2389).
- La tabla PLE de 26,8 GiB se carga en RAM si no se usa --defer-ple; en maquinas con menos RAM que el tamano del archivo, es imprescindible activar esa opcion.
- Los expertos enrutados se leen en cada token y deben caber en RAM o VRAM; con IQ3_KT se necesitan 50,4 GiB y con IQ4_KT 58,6 GiB.
- Esta conversion es solo de texto; las capacidades multimodales del modelo base no estan disponibles.
- La licencia qwen-community-license-1.0 puede imponer restricciones de uso comercial; se recomienda revisar los terminos completos en el repositorio del modelo base.
- No se documentan sesgos ni riesgos de alucinacion especificos de esta conversion; como todo modelo de lenguaje, puede generar contenido incorrecto o inventado, especialmente en tareas de codigo con contextos ambiguos.

## Enlaces

- Repositorio de la conversion GGUF: https://huggingface.co/ji-farthing/Qwen3.8-Flash-Next-ik-llama-GGUF
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio oficial de Qwen3.8-Flash-Next en GitHub: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Runtime ik_llama.cpp: https://github.com/ikawrakow/ik_llama.cpp
- Guia de despliegue con vLLM en DGX Spark: https://github.com/blazux/qwen3.8-Flash-DGX
- Pagina del modelo en Ollama: https://ollama.com/library/qwen3.8-flash-next
