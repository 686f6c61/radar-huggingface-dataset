# Pave87/osmFableQwopus-3.6-27B-Uncensored-Q4_K_M-GGUF

## Resumen

Pave87/osmFableQwopus-3.6-27B-Uncensored-Q4_K_M-GGUF es una cuantizacion en formato GGUF (tipo Q4_K_M) del modelo osmFableQwopus-3.6-27B-Uncensored, publicado por el usuario Pave87. No se trata de un modelo entrenado desde cero, sino de una conversion realizada con llama.cpp a traves del espacio GGUF-my-repo de ggml.ai, pensada para ejecutar el modelo original en hardware de consumo mediante llama.cpp y herramientas compatibles. El modelo base declarado en la model card es osmapi/osmFableQwopus-3.6-27B-Uncensored, y los metadatos de Hugging Face apuntan como base secundaria a lemuralabs/Qwen3.6-27B-Fable-Uncensored.

El modelo pertenece a la familia de variantes "uncensored" y "abliterated", es decir, versiones con los mecanismos de rechazo atenuados o eliminados mediante tecnicas de abliteration. Los tags declaran capacidades de razonamiento, tool calling, function calling y uso agentico, ademas de compatibilidad con endpoints. El nombre sugiere un origen en la familia Qwen (Qwen3.6) con aproximadamente 27.000 millones de parametros, aunque esta filiacion no se confirma de forma explicita en la informacion disponible.

La relevancia de esta ficha es practica: ofrece una version cuantizada a 4 bits (Q4_K_M) de un modelo de ~27B con licencia Apache 2.0, lo que facilita su despliegue local en GPUs de consumo. Sin embargo, el repositorio no incluye model card propia mas alla de las instrucciones de uso con llama.cpp, no publica benchmarks y no documenta el proceso de cuantizacion ni las perdidas de calidad asociadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre sugiere base tipo Qwen, sin confirmar) |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el ejemplo de la model card usa `-c 2048`, pero no es una especificacion del modelo) |
| Tipos de cuantizacion | Q4_K_M (unica incluida en este repo) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (fichero `osmfableqwopus-3.6-27b-uncensored-q4_k_m.gguf`) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo original en la documentacion proporcionada. El nombre y los metadatos apuntan a una base de la familia Qwen (Qwen3.6) con aproximadamente 27B de parametros, y el tag `abliterated` indica que se ha aplicado una tecnica de abliteration para reducir o eliminar las capas de rechazo del modelo alineado original. No se documentan el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO o similar.

Respecto a esta ficha concreta, el unico proceso documentado es la conversion a GGUF mediante llama.cpp con el espacio GGUF-my-repo. La cuantizacion Q4_K_M aplica cuantizacion de 4 bits con mezcla de precisiones (algunas capas en 6 bits) para preservar calidad en los tensores mas sensibles. No se publican metricas de perplejidad ni comparativas de calidad frente al modelo original en FP16/BF16.

## Capacidades

- Generacion de texto conversacional y de un solo turno.
- Razonamiento (tag `reasoning`), sin detalle sobre modos explicitos de pensamiento.
- Tool calling y function calling (tags `tool-calling`, `function-calling`).
- Uso agentico y flujos multi-paso (tag `agentic`).
- Comportamiento "uncensored"/"abliterated": menor tendencia a rechazar peticiones.
- Compatibilidad declarada con endpoints (`endpoints_compatible`).
- Capacidad multilingue limitada al ingles segun el campo `language`.
- No se declaran capacidades de vision, audio ni multimodalidad.

## Casos de uso

- Despliegue local de un asistente conversacional: con ~27B de parametros en Q4_K_M (unos 16,5 GB de repo) puede ejecutarse en una GPU de consumo con suficiente VRAM, gestionando dialogos multi-turno mediante llama-server.
- Automatizacion de agentes con tool calling: los tags declaran soporte de function calling, lo que permite integrarlo en pipelines donde el modelo invoca APIs o funciones externas en varios pasos.
- Prototipado de aplicaciones de razonamiento sin dependencia de la nube: al ser un GGUF ejecutable con llama.cpp, sirve para entornos air-gapped o de investigacion donde no se quiere enviar datos a terceros.
- Experimentacion con modelos sin censura: util para investigacion sobre alineacion, comportamiento de modelos abliterated y evaluacion de sesgos y rechazos.
- Generacion de texto en ingles para tareas creativas o de redaccion donde se requiera baja tasa de rechazo, siempre con supervision humana.
- Base para evaluaciones comparativas de cuantizacion: permite medir la degradacion de calidad de Q4_K_M frente al modelo original en tareas de razonamiento y tool calling.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero Q4_K_M ocupa aproximadamente 16,5 GB (tamano del repo), por lo que se necesita del orden de 17-20 GB de VRAM considerando cache KV y overhead; el valor exacto no esta documentado.
- GPU recomendadas: no disponible de forma oficial. Por tamano, encaja en GPUs con 24 GB (RTX 3090, RTX 4090) y en GPUs profesionales (A100 40/80 GB, H100) con margen para contextos mayores.
- Cabe en GPU de consumo: previsiblemente si en RTX 3090/4090 (24 GB) y en GPUs de 32 GB; en GPUs de 16 GB requeriria offload parcial a CPU.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server) segun la model card; tambien deberia funcionar con Ollama u otros runners compatibles con GGUF, aunque no se documenta explicitamente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Pave87/osmFableQwopus-3.6-27B-Uncensored-Q4_K_M-GGUF | ~26,9B | no disponible | GGUF Q4_K_M | apache-2.0 | Cuantizacion de un modelo uncensored, sin benchmarks publicados |
| osmapi/osmFableQwopus-3.6-27B-Uncensored (original) | ~27B (por nombre) | no disponible | safetensors (presumible) | no disponible en esta ficha | Modelo base del que deriva esta cuantizacion |
| lemuralabs/Qwen3.6-27B-Fable-Uncensored | no disponible | no disponible | no disponible | no disponible | Base secundaria declarada en los metadatos |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas.

## Limitaciones y advertencias

- Modelo "uncensored"/"abliterated": la reduccion de rechazos implica mayor riesgo de generar contenido inapropiado, danino o ilegal; requiere filtros y supervision en produccion.
- Riesgo de alucinacion no evaluado: no hay benchmarks ni evaluaciones de fiabilidad publicadas.
- Idiomas: solo se declara ingles; el rendimiento en castellano no esta verificado.
- Longitud de contexto no documentada; el `-c 2048` del ejemplo es solo un parametro de llama-server, no una especificacion del modelo.
- Sin model card propia: la documentacion se limita a instrucciones de uso con llama.cpp, sin detalles de entrenamiento, dataset ni evaluacion.
- Cuantizacion Q4_K_M: puede degradar la precision en tareas de razonamiento y tool calling frente al modelo original; no se publican metricas de esa perdida.
- Licencia Apache 2.0 declarada, pero conviene verificar las condiciones del modelo base y de la base secundaria antes de uso comercial.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion de la comunidad.
- Fecha de creacion futura en los metadatos (2026-11-22): dato anomalo que conviene contrastar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Pave87/osmFableQwopus-3.6-27B-Uncensored-Q4_K_M-GGUF
- Modelo base declarado: https://huggingface.co/osmapi/osmFableQwopus-3.6-27B-Uncensored
- Base secundaria en metadatos: https://huggingface.co/lemuralabs/Qwen3.6-27B-Fable-Uncensored
- Espacio GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
