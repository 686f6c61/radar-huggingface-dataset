# ig1/Qwen3.8-27B-NVFP4-FP8KV-MTP

## Resumen

Qwen3.8-27B-NVFP4-FP8KV-MTP es una version cuantizada del modelo multimodal Qwen3.8-27B, desarrollada por el usuario independiente IG1. El modelo base, creado por el equipo Qwen de Alibaba, es un modelo denso de 27.000 millones de parametros con arquitectura hibrida (combinacion de atencion completa y Gated DeltaNet), disenado para tareas de codificacion, flujos agénticos y automatizacion de oficina, con capacidades de vision y razonamiento.

Esta cuantizacion utiliza el esquema NVFP4 para las capas lineales, excluyendo la torre de vision, las capas Gated DeltaNet y la cabeza de clasificacion, y anade escalas calibradas para cache KV en FP8 en las 16 capas de atencion completa. Incluye ademas soporte para decodificacion especulativa mediante Multi-Token Prediction (MTP), con los pesos del modulo MTP sin cuantizar en un archivo separado. El resultado es un modelo de 28,6 GB que mantiene la licencia Apache 2.0 del original y esta optimizado para su despliegue con vLLM.

La relevancia de esta ficha radica en que ofrece una alternativa de cuantizacion de alta precision para Qwen3.8-27B, con instrucciones claras de despliegue, soporte para modos de razonamiento del modelo base (instruct, thinking y preserve thinking) mediante un proxy inverso, y una reduccion de latencia notable gracias a la decodificacion especulativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: atencion completa (16 capas) + Gated DeltaNet (48 capas), multimodal (vision + texto) |
| Parametros totales | 27.781.427.984 (27,78 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (modelo base); 8.192 tokens usados en la calibracion de cuantizacion |
| Tipos de cuantizacion | NVFP4 (capas lineales), FP8 (cache KV opcional), BF16 (capas MTP y resto) |
| Idiomas soportados | No disponible (el modelo base soporta multiples idiomas, incluyendo espanol) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (archivos separados para el modelo principal y el modulo MTP) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura hibrida que combina capas de atencion completa tradicional con capas Gated DeltaNet, un mecanismo de estado lineal que reduce el coste de la cache KV. Esta combinacion permite manejar contextos muy largos (262.144 tokens) con un uso de memoria mas eficiente que un transformer puramente atencional. El modelo es multimodal: incluye una torre de vision que procesa imagenes junto con texto.

La cuantizacion fue realizada con llm-compressor v0.13.0 y transformers v5.14.1, siguiendo el ejemplo oficial de vLLM con modificaciones. Se usaron 1.024 muestras de calibracion procedentes de cuatro datasets: UltraChat (conversacion general), GSM8K (razonamiento matematico), CodeAlpaca (codigo) y Aya (multilingue). El esquema NVFP4 se aplico a las capas lineales, excluyendo lm_head, la torre de vision y las capas Gated DeltaNet. Las escalas FP8 para la cache KV fueron calibradas estaticamente y se almacenan como metadatos pasivos en el checkpoint.

El modulo MTP (Multi-Token Prediction) no ha sido cuantizado y se distribuye en un archivo safetensors separado (model_mtp.safetensors). vLLM lo carga automaticamente cuando se activa la decodificacion especulativa mediante el parametro --speculative-config.

## Capacidades

- Generacion de texto y razonamiento multimodal: procesa tanto texto como imagenes, con capacidades de razonamiento visual.
- Modos de razonamiento: soporta los modos nativos de Qwen3.8 (instruct sin razonamiento, thinking con razonamiento, y preserve thinking que conserva el historial de razonamiento) mediante un proxy inverso que inyecta los parametros de chat_template_kwargs y reasoning_effort.
- Tool calling y function calling: compatible con el parser qwen3_coder de vLLM, lo que permite su integracion en flujos agénticos.
- Razonamiento multi-step: el modo thinking permite cadenas de razonamiento extensas antes de generar la respuesta final.
- Decodificacion especulativa: soporta MTP con 2 o 3 tokens especulativos, reduciendo la latencia de decodificacion (tasa de aceptacion media del 56% con 3 tokens).
- Cache KV en FP8: las escalas calibradas permiten activar cache KV FP8 con una aceleracion del 10-20% en las capas de atencion sin perdida significativa de calidad.
- Capacidades multilingues: el modelo base fue entrenado con datos multilingues, incluyendo el dataset Aya usado en la calibracion.

## Casos de uso

- Despliegue local de un asistente multimodal: con 28,6 GB de pesos, el modelo cabe en una GPU consumer de 32 GB (o 24 GB con cuantizaciones adicionales), permitiendo ejecutar un asistente con vision y razonamiento en un equipo local sin depender de APIs externas.
- Servicio de inferencia de baja latencia: la decodificacion especulativa MTP con 2 tokens reduce la latencia por token, lo que lo hace adecuado para aplicaciones interactivas en tiempo real como chatbots o asistentes de codigo.
- Automatizacion de oficina: el modelo base esta optimizado para tareas de automatizacion de oficina, como generacion de documentos, resumen de correos o extraccion de informacion de imagenes (facturas, capturas de pantalla).
- Agente de codigo con tool calling: su compatibilidad con el parser qwen3_coder permite construir agentes que llaman a funciones, ejecutan comandos o interactuan con repositorios de codigo de forma autonoma.
- Razonamiento visual en produccion: la combinacion de vision y modo thinking permite analizar imagenes con explicaciones razonadas, util en diagnostico de imagenes tecnicas, revision de disenos o analisis de diagramas.
- Servicio multiusuario con vLLM: al desplegarse con vLLM, soporta multiples peticiones concurrentes con gestion eficiente de la cache KV, adecuado para entornos de produccion con varios clientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 28,6 GB en NVFP4, por lo que se necesita una GPU con al menos 32 GB de VRAM para cargar el modelo completo en precision nativa. Con cuantizaciones adicionales (p. ej. GGUF en 4 bits) podria caber en 24 GB, aunque no se proporcionan datos especificos.
- GPUs recomendadas: NVIDIA RTX 4090 (24 GB) no es suficiente para el modelo completo; se recomiendan RTX A6000 (48 GB), A100 (40/80 GB), H100 (80 GB) o RTX 5090 (32 GB). Para FP8 KV cache se requiere hardware con soporte FP8 (Ada Lovelace o posterior, Hopper, Blackwell).
- Compatibilidad con GPUs consumer: el modelo completo requiere 32 GB de VRAM, lo que limita las opciones consumer a la RTX 5090. Para GPUs de 24 GB habria que recurrir a cuantizaciones mas agresivas no contempladas en esta version.
- Opciones de despliegue: vLLM (recomendado, con soporte nativo para NVFP4, FP8 KV y MTP), llama.cpp (mediante conversion a GGUF, no incluida en el repositorio), Ollama (si se genera un GGUF).
- Latencia y throughput: la decodificacion especulativa con 2 tokens especulativos reduce la latencia frente a la generacion autoregresiva estandar. La cache KV FP8 aporta una aceleracion del 10-20% en las capas de atencion. No se proporcionan cifras absolutas de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| ig1/Qwen3.8-27B-NVFP4-FP8KV-MTP | 27,78 B | 262.144 | NVFP4 + FP8 KV + MTP | Apache 2.0 | Incluye MTP y escalas FP8 calibradas |
| unsloth/Qwen3.8-27B-NVFP4 | 27,78 B | 262.144 | NVFP4 | Apache 2.0 | Cuantizacion de Unsloth, sin MTP ni FP8 KV |
| RadixArk/Qwen3.8-27B-NVFP4 | 27,78 B | 262.144 | NVFP4 | Apache 2.0 | Derivado de terceros, sin detalles adicionales |
| Qwen/Qwen3.8-27B (base) | 27,78 B | 262.144 | BF16 | Apache 2.0 | Modelo original sin cuantizar, requiere ~55 GB VRAM |

La version de IG1 se diferencia por incluir el modulo MTP para decodificacion especulativa y las escalas FP8 calibradas para la cache KV, lo que la hace especialmente adecuada para despliegues de baja latencia con vLLM.

## Limitaciones y advertencias

- La cuantizacion NVFP4 puede introducir una ligera perdida de calidad frente al modelo en BF16, especialmente en tareas de razonamiento complejo o generacion de codigo muy especifico.
- La cache KV FP8 no aumenta la capacidad total de la cache KV en esta arquitectura hibrida, ya que el estado Gated DeltaNet (48 capas) domina el consumo de memoria y no se ve afectado por --kv-cache-dtype. Solo acelera la decodificacion en las 16 capas de atencion.
- La imagen docker vllm/vllm-openai:qwen38 es una compilacion temporal; habra que migrar a la version oficial cuando se publique el siguiente release de vLLM.
- El proxy inverso (iguanesolutions/qwen38-rp) es un componente externo no incluido en el repositorio del modelo; su mantenimiento y seguridad dependen del autor.
- El modelo base puede presentar sesgos y alucinaciones tipicos de los LLM entrenados con datos web; no se proporcionan evaluaciones especificas de sesgos para esta version cuantizada.
- La licencia Apache 2.0 permite uso comercial, pero se debe consultar la model card del modelo base Qwen/Qwen3.8-27B para confirmar que no hay restricciones adicionales sobre el uso de sus pesos.
- No se han publicado benchmarks que verifiquen el rendimiento real de esta cuantizacion frente al modelo original.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ig1/Qwen3.8-27B-NVFP4-FP8KV-MTP
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio del proxy inverso: https://github.com/iguanesolutions/qwen38-rp
- Repositorio oficial de Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Receta oficial de vLLM para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Documentacion de Unsloth para Qwen3.8: https://unsloth.ai/docs/models/qwen3.8
- Guia de ejecucion local (Ollama, GGUF): https://www.yottalabs.ai/post/how-to-run-qwen-3-8-27b-locally-ollama-gguf-single-gpu-2026
- Cuantizacion alternativa de Unsloth: https://huggingface.co/unsloth/Qwen3.8-27B-NVFP4
- Cuantizacion alternativa de RadixArk: https://huggingface.co/RadixArk/Qwen3.8-27B-NVFP4
