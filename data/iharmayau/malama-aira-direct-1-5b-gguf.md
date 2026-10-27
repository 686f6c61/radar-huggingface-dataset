# IhArmayau/malama-aira-direct-1.5b-gguf

## Resumen

`IhArmayau/malama-aira-direct-1.5b-gguf` es una distribucion en formato GGUF de un fine-tune conversacional de 1.543.714.304 parametros (aproximadamente 1,5 B) construido sobre Qwen2.5-1.5B-Instruct. El repositorio lo publica el usuario IhArmayau y contiene un unico archivo cuantizado, `Qwen2.5-1.5B-Instruct.Q4_K_M.gguf`, ademas de un Modelfile de Ollama. El autor indica que el ajuste fino y la conversion a GGUF se realizaron con Unsloth, y que el entrenamiento fue "2x mas rapido" gracias a esa herramienta.

El modelo resuelve un problema muy concreto: disponer de un asistente conversacional de ~1 GB que se ejecuta en CPU, portatiles sin GPU dedicada y GPUs de gama de entrada, sin necesidad de infraestructura de servidor. Al estar en GGUF y soportar plantilla Jinja (`--jinja`), se integra directamente en llama.cpp, Ollama y cualquier runtime compatible con endpoints de chat.

Ahora bien, la ficha debe leerse con cautela: el repositorio no declara licencia, no documenta idiomas, no publica datos de entrenamiento ni evaluaciones, y acumula 0 descargas y 0 likes en el momento de la consulta. Es, por tanto, un artefacto de trazabilidad limitada, apto para experimentacion, no para produccion sin validacion previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Qwen2 (modelo base: Qwen2.5-1.5B-Instruct, segun el tag `qwen2` y el nombre del archivo GGUF) |
| Parametros totales | 1.543.714.304 (~1,54 B), dato real de safetensors del repositorio |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No disponible en la informacion proporcionada. El modelo base Qwen2.5-1.5B-Instruct declara 32.768 tokens nativos (ampliable con YaRN), pero no se ha verificado para este fine-tune |
| Tipos de cuantizacion | GGUF Q4_K_M (unico archivo publicado: `Qwen2.5-1.5B-Instruct.Q4_K_M.gguf`) |
| Idiomas soportados | No disponible |
| Licencia | No disponible (el repositorio no declara licencia) |
| Formato de pesos | GGUF para llama.cpp; el autor indica conversion desde el fine-tune con Unsloth. No se publican safetensors del fine-tune |

## Arquitectura y entrenamiento

La arquitectura corresponde a Qwen2, un transformer decoder-only con normalizacion RMSNorm, activacion SwiGLU, embeddings rotatorios (RoPE) y atencion con query-key normalization y grouped-query attention, heredada del modelo base Qwen2.5-1.5B-Instruct. El repositorio no aporta configuracion explicita (`config.json`) ni numero de capas, cabezas o dimension oculta, por lo que los detalles finos de la arquitectura deben tomarse del modelo base y no estan verificados en esta publicacion.

En cuanto al entrenamiento, la unica informacion disponible es que el fine-tune se realizo con Unsloth y que posteriormente se convirtio a GGUF. No se especifica el conjunto de datos, el numero de tokens, la tecnica de ajuste (LoRA, QLoRA o ajuste completo), ni si hubo fases de RLHF, DPO o preferencias. Tampoco se documenta ninguna innovacion tecnica adicional, mas alla del uso de la plantilla de chat Jinja para el formateo de conversaciones en llama.cpp.

## Capacidades

- Generacion de texto conversacional multi-turno, segun el tag `conversational` del repositorio.
- Soporte de plantilla de chat Jinja, invocable con `llama-cli -hf ... --jinja`.
- Despliegue mediante llama.cpp y Ollama (se incluye Modelfile), ademas de runtimes compatibles con endpoints de chat (`endpoints_compatible`).
- Capacidades heredadas del modelo base Qwen2.5-1.5B-Instruct (comprension lectora, generacion de codigo basico, matematicas elementales, multilingueismo), no verificadas ni documentadas por el autor para este fine-tune.
- Tool calling / function calling: no confirmado para este fine-tune. El modelo base Qwen2.5 lo soporta, pero el autor no lo declara.
- Modo thinking, vision o audio: no disponibles. El README incluye un comando generico con `llama-mtmd-cli` procedente de la plantilla de Unsloth, pero el modelo base es exclusivamente de texto.

## Casos de uso

- Prototipado local sin GPU: ejecutar el GGUF Q4_K_M con `llama-cli` o Ollama en un portatil para validar flujos conversacionales antes de invertir en infraestructura, gracias a un peso en disco de aproximadamente 1 GB.
- Asistente conversacional embebido en aplicaciones de escritorio: integrar el modelo mediante `llama-cpp-python` o la API de Ollama para respuestas de baja latencia en local, sin llamadas a servicios externos ni coste por token.
- Soporte al cliente de dominio acotado con RAG ligero: usar el modelo como generador de respuestas sobre fragmentos recuperados de una base documental pequena, aprovechando su tamano para mantener el contexto y el indice vectorial en la misma maquina.
- Procesamiento por lotes en CPU: tareas de reformateo, normalizacion, extraccion de campos y resumen de textos cortos en pipelines nocturnos donde no hay GPU disponible y el coste por inferencia debe ser cero.
- Clasificacion y etiquetado asistido: generar etiquetas o categorias sobre registros de texto con una plantilla Jinja fija, útil en enriquecimiento de datos y moderacion de baja criticidad.
- Banco de pruebas de plantillas de chat y fine-tunes: comparar el comportamiento del ajuste `malama-aira-direct` frente al Qwen2.5-1.5B-Instruct original usando el mismo prompt y la misma cuantizacion.
- Docencia e investigacion: reproducir un ciclo completo de fine-tuning con Unsloth y conversion a GGUF en hardware modesto, usando este repositorio como referencia de formato y estructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: entre 1,5 y 2,5 GB para contexto corto con Q4_K_M (estimacion a partir de 1,54 B de parametros y ~4,5 bits por peso); entre 3 y 4 GB si se agota la ventana de contexto nativa por el cache KV (estimacion, no medida).
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060, RTX 3060 12 GB); en gama profesional, A100/H100 no aportan ventaja relevante por el escaso tamano del modelo y el cuello de botella pasa a ser el ancho de banda.
- Cabe en GPU consumer: si, en practicamente cualquier tarjeta con 4 GB o mas; tambien en iGPU con memoria unificada y en CPU pura.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama mediante el Modelfile incluido, `llama-cpp-python`, y servidores compatibles con endpoints de chat. vLLM admite carga de GGUF de forma experimental y con soporte limitado de arquitecturas; TGI no soporta GGUF de forma nativa.
- Latencia y throughput: no hay mediciones publicadas. Como referencia orientativa para 1,5 B en Q4_K_M, la decodificacion es interactiva en CPU moderna de escritorio y claramente superior en GPU consumer, pero no se dispone de cifras verificadas para este repositorio concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| malama-aira-direct-1.5b-gguf | ~1,54 B | No disponible (base: 32.768) | No declarada | GGUF Q4_K_M | Fine-tune de Qwen2.5-1.5B-Instruct sin evaluacion publica; 0 descargas |
| Qwen2.5-1.5B-Instruct | ~1,54 B | 32.768 tokens (ampliable con YaRN) | Apache 2.0 | safetensors, GGUF, AWQ, GPTQ | Modelo base oficial; benchmarks publicados por Qwen |
| Llama-3.2-1B-Instruct | ~1,24 B | 128.000 tokens | Llama 3.2 Community License | safetensors, GGUF | Mayor ventana de contexto; licencia con restricciones de uso |
| Gemma 2 2B-it | ~2,6 B | 8.192 tokens | Gemma Terms of Use | safetensors, GGUF | Mas parametros y mejor calidad esperada, contexto mas corto |

## Limitaciones y advertencias

- Licencia no declarada: el repositorio no especifica terminos de uso. El modelo base Qwen2.5-1.5B-Instruct se distribuye bajo Apache 2.0, pero el fine-tune no hereda automaticamente esa licencia en tanto no se declare; no debe asumirse uso comercial sin aclaracion del autor.
- Ausencia total de evaluacion: no hay benchmarks, ni datos de entrenamiento, ni descripcion del conjunto de datos. Es imposible estimar la degradacion o el sesgo introducido por el ajuste fino respecto al modelo base.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.
- Riesgo de alucinacion: inherente a un modelo de 1,5 B de parametros, especialmente en dominios especializados, con contexto largo o con multiples pasos de razonamiento.
- Mezcla de nombres: el archivo GGUF se llama `Qwen2.5-1.5B-Instruct.Q4_K_M.gguf` mientras que el repositorio se denomina `malama-aira-direct`; conviene verificar que el contenido corresponde realmente al fine-tune y no al modelo base sin ajustar.
- README generico: el comando `llama-mtmd-cli` para modelos multimodales procede de la plantilla de Unsloth y no aplica a este modelo, que es exclusivamente de texto. Puede inducir a error en la integracion.
- Contexto no verificado: aunque el modelo base declara 32.768 tokens, no se ha confirmado que el fine-tune preserve esa ventana ni el comportamiento multilingue original.
- Metadatos inconsistentes: las marcas temporales del repositorio (creacion y actualizacion el 27-10-2026) son posteriores a la fecha actual, lo que sugiere una configuracion de metadatos erronea y refuerza la necesidad de verificar la procedencia del artefacto.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/IhArmayau/malama-aira-direct-1.5b-gguf
- Unsloth (herramienta de fine-tuning y conversion citada por el autor): https://github.com/unslothai/unsloth
- llama.cpp (runtime recomendado por el autor): https://github.com/ggml-org/llama.cpp
- Ollama (Modelfile incluido en el repositorio): https://ollama.com
- Modelo base Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct

No se han encontrado en la informacion proporcionada papers, blogs tecnicos, demos ni repositorios adicionales asociados a este modelo.
