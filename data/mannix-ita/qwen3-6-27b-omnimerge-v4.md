# ManniX-ITA/Qwen3.6-27B-Omnimerge-v4

## Resumen

Qwen3.6-27B-Omnimerge-v4 es un modelo de lenguaje multimodal desarrollado por ManniX-ITA mediante una fusión (merge) del modelo base Qwen/Qwen3.6-27B con tres fine-tunes de la misma familia. El merge utiliza el método DARE-TIES (denominado Omnimerge_v2) con una intervención adicional llamada "MLP-passthrough", que copia las capas MLP del modelo base original para corregir una fragilidad detectada en la política de emisión de etiquetas de razonamiento de Qwen3.6. El resultado es un modelo de 27.781 millones de parámetros con capacidades de razonamiento, generación de código y visión, pensado para entornos de producción que requieren alta calidad en tareas de razonamiento complejo.

Este modelo es relevante porque aborda un problema específico de la familia Qwen3.6 (la inestabilidad en la generación de tags de razonamiento) mediante una técnica de fusión quirúrgica, y ofrece mejoras medibles frente al modelo base y a la versión anterior (Omnimerge-v2) en benchmarks de código y razonamiento. Se distribuye en múltiples formatos (safetensors, GGUF, MLX) y bajo licencia Apache 2.0, lo que facilita su adopción tanto en entornos de servidor como en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), basado en Qwen3.6-27B |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (configuraciones de servidor de hasta 64K tokens observadas) |
| Tipos de cuantizacion | GGUF (31 quants + F16, imatrix), MLX 4-bit (texto y vision-language) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF, MLX |

## Arquitectura y entrenamiento

El modelo es una fusion de Qwen/Qwen3.6-27B con tres fine-tunes de la misma base: rico03/Qwen3.6-27B-rico03 (peso 0.40, capacidad general), ValiantLabs/Qwen3.6-27B-Esper3.1 (peso 0.35, codigo y razonamiento) y kai-os/Qwen3.6-Opus-Reasoning (peso 0.25, anclaje de razonamiento). El metodo de fusion es `omnimerge_v2`, que combina DARE-TIES con OBIM-lite, DAREx q y EMR election, con densidad 0.53, DAREx q 0.75 y semilla 42. La intervencion "MLP-passthrough" copia las proyecciones `gate`, `up` y `down` de las capas MLP directamente del modelo base limpio, para evitar la fragilidad en la emision de etiquetas de razonamiento detectada en Qwen3.6.

No se han publicado detalles sobre datos de entrenamiento adicionales, ya que se trata de una fusion de pesos existentes y no de un entrenamiento desde cero. El modelo hereda las capacidades del base Qwen3.6, incluyendo su torre de vision (preservada verbatim) y su plantilla de chat.

## Capacidades

- Generacion de texto y razonamiento complejo, con soporte de modo de razonamiento explicito (etiquetas de razonamiento estilo deepseek).
- Generacion de codigo: HumanEval 83.54% y MBPP 73.00% (raw lm_eval) en cuantizacion Q6_K.
- Razonamiento cientifico: GPQA Diamond 78.28% (greedy, flexible-extract).
- Capacidades multimodales: entrada de imagen y video (via torre de vision del base Qwen3.6), con proyector `mmproj` compatible.
- Soporte de tool calling y function calling (heredado del base Qwen3.6, aunque no se documenta explicitamente en la model card).
- Capacidades multilingues limitadas: la model card declara solo ingles, aunque el base Qwen3.6 es multilingue; no se garantiza rendimiento en otros idiomas.
- Decodificacion especulativa: version MTP (Multi-Token Prediction) disponible para acelerar la inferencia 2.0-2.3x en GPU de 24 GB.

## Casos de uso

- Asistente de programacion en produccion: el modelo puede integrarse en IDEs o pipelines de CI/CD para generar codigo, explicar fragmentos y sugerir correcciones. Su rendimiento en HumanEval (83.54%) y MBPP (73.00%) lo hace adecuado para tareas de autocompletado y refactorizacion, con soporte de tool calling para interactuar con APIs y repositorios.
- Razonamiento cientifico y analitico: con GPQA Diamond de 78.28%, puede utilizarse en entornos de investigacion para resolver problemas de fisica, quimica y biologia de nivel avanzado, o como motor de razonamiento en sistemas de preguntas y respuestas especializados.
- Analisis de imagenes y documentos: gracias a su torre de vision, puede procesar capturas de pantalla, diagramas, graficos y documentos escaneados para extraer informacion, describir contenido o responder preguntas sobre ellos. El formato MLX-VL permite ejecutarlo en Apple Silicon.
- Chat conversacional con contexto largo: con configuraciones de servidor de hasta 64K tokens, puede mantener conversaciones multi-turno extensas, resumir documentos largos o actuar como agente conversacional en aplicaciones de atencion al cliente.
- Desarrollo de agentes autonomos: su capacidad de razonamiento estructurado y tool calling permite construir agentes que planifican, ejecutan acciones y verifican resultados, por ejemplo en automatizacion de tareas de oficina o navegacion web.
- Despliegue en hardware de consumo: las cuantizaciones GGUF y MLX permiten ejecutar el modelo en GPUs de 24 GB (por ejemplo RTX 3090/4090) o en Macs con Apple Silicon, habilitando prototipos y aplicaciones locales sin dependencia de servicios en la nube.

## Benchmarks y rendimiento

Los resultados publicados en la model card se obtuvieron con cuantizacion Q6_K, sampler greedy (T=0.0), `--reasoning-budget 8192` y `max_gen_toks=8192`, usando lm_eval con `local-completions` sobre un servidor llama.cpp. La comparativa head-to-head con el base y la version anterior es la siguiente:

| Benchmark | Qwen3.6 base Q6_K | Omnimerge-v2 (Qwen3.5 base) | Omnimerge-v4-MLP (Qwen3.6 base) | Δ vs base | Δ vs v2 |
|---|---|---|---|---|---|
| HumanEval pass@1 (164q) | 84.76% (139/164) | 79.27% | 83.54% (137/164) | -1.22 pp | +4.27 pp |
| MBPP pass@1 (500q) raw lm_eval | 56.20% | n/a | 68.80% | +12.60 pp | n/a |
| GPQA Diamond (198q, greedy) | no disponible | no disponible | 78.28% | n/a | n/a |

Nota: la model card menciona que una medicion anterior de GPQA con muestreo T=0.6 y presupuesto 16384 daba ~84.75%, pero el valor canonico es el greedy de 78.28%. No se han publicado resultados para otros benchmarks (MMLU, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el modelo completo en FP16 ocupa ~55.6 GB. Con cuantizacion Q6_K (GGUF) cabe en una GPU de 24 GB (por ejemplo RTX 3090/4090). La version MLX 4-bit de solo texto ocupa ~15 GB y la version vision-language ~16 GB, aptas para Apple Silicon con 32 GB o mas.
- GPUs recomendadas: NVIDIA A100/H100 para inferencia de alta concurrencia; RTX 3090/4090 para uso local con cuantizacion GGUF; Apple Silicon (M2/M3/M4) para MLX.
- Opciones de despliegue: llama.cpp (servidor con `--reasoning-format deepseek`), Ollama (tags `mannix/omnimerge-v4` y `mannix/omnimerge-v4-mtp`), MLX (via `mlx_lm` y `mlx_vlm`), y compatible con endpoints via FriendliAI. No se menciona soporte explicito para vLLM o TGI, aunque al ser un modelo transformers es probablemente compatible.
- Latencia y throughput: la version MTP ofrece una aceleracion de decodificacion de 2.0-2.3x en GPU de 24 GB, segun el autor. No se proporcionan cifras absolutas de tokens/segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | HumanEval | GPQA Diamond | Licencia | Formato |
|---|---|---|---|---|---|---|
| Qwen3.6-27B (base) | 27.78B | no disponible | 84.76% | no disponible | Apache 2.0 | safetensors, GGUF |
| Omnimerge-v4-MLP (este) | 27.78B | no disponible | 83.54% | 78.28% | Apache 2.0 | safetensors, GGUF, MLX |
| Omnimerge-v2 (Qwen3.5 base) | ~27B | no disponible | 79.27% | no disponible | Apache 2.0 | safetensors, GGUF |

El modelo pierde 1.22 puntos en HumanEval frente al base, pero gana 12.6 puntos en MBPP y supera claramente a la version anterior. No se dispone de comparaciones con otros modelos de tamano similar (por ejemplo Llama 3.3 70B o Mistral Large) en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser una fusion de fine-tunes, puede heredar sesgos de los datos de entrenamiento originales de Qwen3.6 y de los fine-tunes. No se han publicado evaluaciones de sesgo o toxicidad.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar contenido falso o inventado, especialmente en tareas de razonamiento abierto. Se recomienda verificacion humana en aplicaciones criticas.
- Limitaciones de idioma: la model card declara solo ingles. Aunque el base Qwen3.6 es multilingue, no se garantiza rendimiento en otros idiomas y podria degradarse en espanol u otros.
- Longitud de contexto no documentada: no se especifica el contexto maximo oficial. Las pruebas se realizaron con `max_length=32768` y servidores con `-c 65536`, pero no hay garantia de que el modelo soporte esos valores de forma fiable en todos los casos.
- Restricciones de licencia: Apache 2.0 permite uso comercial sin restricciones, pero al ser un merge de modelos con licencias Apache 2.0, se debe mantener la atribucion y los avisos de licencia.
- Caveat de produccion: la version MTP requiere una compilacion especifica de llama.cpp (PR 22673) y puede no estar disponible en todas las distribuciones. La calidad entre la version estandar y la MTP es estadisticamente indistinguible, pero la MTP es la recomendada para cargas interactivas.

## Enlaces

- Modelo principal: https://huggingface.co/ManniX-ITA/Qwen3.6-27B-Omnimerge-v4
- Cuantizaciones GGUF: https://huggingface.co/ManniX-ITA/Qwen3.6-27B-Omnimerge-v4-GGUF
- Version MTP (GGUF): https://huggingface.co/ManniX-ITA/Qwen3.6-27B-Omnimerge-v4-MTP-GGUF
- MLX 4-bit texto: https://huggingface.co/ManniX-ITA/Qwen3.6-27B-Omnimerge-v4-MLX-4bit
- MLX 4-bit vision-language: https://huggingface.co/ManniX-ITA/Qwen3.6-27B-Omnimerge-v4-MLX-VL-4bit
- Ollama (estandar): https://ollama.com/mannix/omnimerge-v4
- Ollama (MTP): https://ollama.com/mannix/omnimerge-v4-mtp
- Proyector de vision (bartowski): https://huggingface.co/bartowski/Qwen_Qwen3.6-27B-GGUF
- Endpoint API (FriendliAI): https://friendli.ai/models/ManniX-ITA/Qwen3.6-27B-Omnimerge-v4
- Version anterior (Omnimerge-v2): https://huggingface.co/ManniX-ITA/Qwen3.5-27B-Omnimerge-v2
