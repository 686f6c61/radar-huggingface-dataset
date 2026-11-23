# Outlier-Ai/Qwen2.5-Coder-14B-Instruct-MLX-4bit

## Resumen

Qwen2.5-Coder-14B-Instruct-MLX-4bit es una conversion a formato MLX de 4 bits del modelo Qwen2.5-Coder-14B-Instruct, publicado por el colectivo Outlier-Ai. El modelo original lo desarrolla el equipo Qwen de Alibaba Cloud y esta especializado en generacion y comprension de codigo, con capacidades de instruccion conversacional y tool calling. Esta version no introduce cambios en los pesos ni en el comportamiento del modelo: unicamente reempaqueta los pesos originales en safetensors MLX de 4 bits (tamano de grupo 64, simetrico) para su ejecucion nativa en Apple Silicon mediante Metal y la libreria mlx-lm.

El modelo cuenta con 14.770.033.664 parametros totales (aproximadamente 14,7 B), lo que lo situa en la gama media-alta de la familia Qwen2.5-Coder. La cuantizacion a 4 bits reduce el repositorio a 8,3 GB, permitiendo su carga en Macs con memoria unificada moderada, algo inviable con los pesos en bf16 (que rondarian los 29 GB). Es relevante para desarrolladores que necesitan un asistente de codigo local, privado y sin dependencia de la nube en equipos macOS con chips M1 a M4.

La licencia Apache 2.0 del modelo base se preserva en esta conversion, lo que facilita su uso comercial. La model card advierte explicitamente que este repositorio no forma parte de la aplicacion comercial Outlier y que las cifras de rendimiento publicadas por el autor proceden de experimentos internos, no de pruebas de release oficiales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2), segun el modelo base Qwen2.5-Coder-14B-Instruct |
| Parametros totales | 14.770.033.664 (14,7 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-Coder-14B-Instruct) |
| Tipos de cuantizacion | MLX 4-bit, group size 64, simetrica (unica variante en este repo) |
| Idiomas soportados | en, zh, fr, es, pt, de, it, ru, ja, ko, ar, vi, th, nl, pl |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX 4-bit), shards multiples, con `config.json`, tokenizer y `chat_template.jinja` |

## Arquitectura y entrenamiento

Esta ficha describe una conversion, no un entrenamiento nuevo. La arquitectura subyacente es la del modelo base Qwen2.5-Coder-14B-Instruct: un transformer decoder-only de la familia Qwen2 con atencion por query agrupada (GQA) y RoPE, entrenado por el equipo Qwen de Alibaba Cloud. No se dispone en la informacion proporcionada del numero exacto de tokens de entrenamiento, de la composicion del dataset ni del detalle de las fases de alineacion (SFT, DPO o RLHF) empleadas en el modelo original.

La intervencion de Outlier-Ai se limita al cambio de formato en disco: pesos originales reempaquetados como safetensors MLX 4-bit con tamano de grupo 64 y cuantizacion simetrica, compatibles con mlx-lm 0.31.x. Se incluyen el `chat_template.jinja` y el tokenizer del modelo base. No se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal ni variantes hibridas) en esta conversion; cualquier innovacion del modelo original debe consultarse en la model card de Qwen.

## Capacidades

- Generacion de codigo en multiples lenguajes, incluyendo completado (code-completion) y generacion desde cero (code-generation).
- Razonamiento conversacional multi-turno en modo instruct/chat, con plantilla de chat Jinja incluida.
- Tool calling y function calling, etiquetado explicitamente en el repositorio (`tool-use`, `function-calling`).
- Capacidades multilingues en 15 idiomas declarados (en, zh, fr, es, pt, de, it, ru, ja, ko, ar, vi, th, nl, pl).
- Ejecucion local y offline en Apple Silicon mediante MLX, Metal y mlx-lm, sin llamadas a API externas.
- Adecuado para tareas de depuracion y refactorizacion de codigo, segun los ejemplos incluidos en la model card (comprobacion de primalidad en Python, consulta SQL con join, refactorizacion con deteccion de bug).
- No se declaran capacidades de vision, audio ni modo de pensamiento extendido (thinking mode) en la informacion disponible.

## Casos de uso

- Asistente de codigo local en macOS: cargar el modelo con mlx-lm o con la app Outlier y usarlo como chat de programacion totalmente offline, aprovechando la cuantizacion 4-bit (8,3 GB) para evitar enviar codigo propietario a servicios en la nube.
- Autocompletado y generacion en el IDE: integrar el modelo en extensiones o scripts locales que invoquen `mlx_lm.generate` para sugerir funciones, docstrings y pruebas unitarias, con latencia aceptable en chips M-series.
- Refactorizacion y revision de codigo: usar el modelo para reescribir fragmentos por legibilidad y detectar bugs, tal como ilustra el ejemplo "Debug refactor" de la model card.
- Generacion de consultas SQL: producir consultas complejas (por ejemplo, top 10 usuarios por valor de compra en los ultimos 90 dias) a partir de descripciones en lenguaje natural, como en el ejemplo "SQL join".
- Pipelines de CI/CD con tool calling: emplear el soporte de function calling para que el modelo invoque herramientas locales (linters, ejecutores de tests, scripts de build) en flujos automatizados de revision.
- Prototipado privado en investigacion: experimentar con tecnicas de prompting, evaluacion o destilacion sobre un modelo de codigo de 14,7 B en hardware Apple, sin costes de API ni fuga de datos.
- Educacion y demos: desplegar un tutor de programacion en un Mac Mini o MacBook para entornos de aula sin conexion a internet.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para esta conversion. La model card remite a `outlier.host/benchmarks` para cifras de MMLU, HumanEval y tokens por segundo en Macs M-series, pero advierte que dichos numeros proceden de experimentos internos y no de pruebas de release, y no se incluyen en el repositorio. No se reproducen cifras no verificadas.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repositorio ocupa 8,3 GB en disco; en ejecucion hay que sumar overhead de KV cache y del runtime MLX, por lo que se recomienda un minimo de 12-16 GB de memoria unificada para contextos moderados.
- Hardware objetivo: Apple Silicon exclusivamente (M1, M2, M3, M4), en MacBook Air, MacBook Pro, Mac Mini y Mac Studio, con backend Metal.
- GPU NVIDIA (A100, H100, RTX 4090) no aplicables: el formato MLX esta pensado para Apple Silicon; para CUDA seria necesario recurrir a los pesos originales en bf16 o a otras cuantizaciones (GGUF/AWQ/GPTQ) del modelo base.
- Cabe en GPU de consumo: si, en el sentido de que cabe en Macs consumer con memoria unificada suficiente (a partir de configuraciones de 16 GB, con margen ajustado).
- Opciones de despliegue: `mlx-lm` 0.31.x (CLI `python -m mlx_lm.generate` y API Python `load`/`generate`), app Outlier para macOS (instalable via `brew install --cask outlier-host/tap/outlier`). vLLM, llama.cpp, Ollama y TGI no son compatibles directamente con este formato MLX.
- Latencia y throughput: no disponibles en la informacion proporcionada; la model card remite a la pagina de benchmarks del autor, cuyas cifras no se reproducen aqui.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-Coder-14B-Instruct-MLX-4bit (este) | 14,7 B | no disponible | MLX 4-bit safetensors | Apache 2.0 | Hugging Face, 429 descargas |
| Qwen2.5-Coder-7B-Instruct-MLX-4bit (Outlier-Ai) | ~7 B | no disponible | MLX 4-bit safetensors | Apache 2.0 | Hugging Face, 1.450 descargas |
| Qwen2.5-Coder-32B-Instruct-MLX-4bit (Outlier-Ai) | ~32 B | no disponible | MLX 4-bit safetensors | Apache 2.0 | Hugging Face, 650 descargas |
| Qwen2.5-Coder-14B-Instruct (original) | 14,7 B | no disponible | safetensors bf16 | Apache 2.0 | Hugging Face (repo oficial Qwen) |

Las tres conversiones de Outlier-Ai comparten licencia y formato; la eleccion depende del presupuesto de memoria: el 7B sacrifica capacidad por huella menor, el 32B requiere mas memoria unificada pero ofrece mayor calidad en tareas de codigo. Los datos de rendimiento comparativo entre estas variantes no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion 4-bit introduce perdida de precision respecto al modelo base en bf16; la degradacion exacta en tareas de codigo no esta documentada en la informacion disponible.
- Riesgo de alucinacion inherente a los modelos de lenguaje, especialmente en APIs poco conocidas, dependencias inexistentes o fragmentos de codigo no verificados; todo output debe pasar por tests.
- Sesgos conocidos: no documentados en la informacion proporcionada; deben evaluarse a partir de la model card del modelo base Qwen.
- Limitaciones de contexto e idioma: la longitud de contexto no se especifica en este repositorio; los 15 idiomas declarados proceden del modelo base y su calidad relativa puede variar.
- Licencia Apache 2.0 permisiva para uso comercial, pero la model card remite al modelo base para el texto canonico y posibles restricciones adicionales; conviene revisar la licencia upstream antes de produccion.
- La model card declara explicitamente que este repositorio no forma parte de la aplicacion comercial Outlier y que las cifras de rendimiento publicadas por el autor provienen de experimentos internos, no de pruebas de release oficiales.
- Dependencia exclusiva del ecosistema Apple Silicon y mlx-lm 0.31.x; no es portable a CUDA sin reconversion.
- El repositorio tiene un volumen de descargas bajo (429) y cero likes en el momento de la consulta, lo que reduce la validacion comunitaria disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Outlier-Ai/Qwen2.5-Coder-14B-Instruct-MLX-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-14B-Instruct
- App Outlier (macOS): https://outlier.host/
- Benchmarks del autor: https://outlier.host/benchmarks
- Conversion 7B: https://huggingface.co/Outlier-Ai/Qwen2.5-Coder-7B-Instruct-MLX-4bit
- Conversion 32B: https://huggingface.co/Outlier-Ai/Qwen2.5-Coder-32B-Instruct-MLX-4bit
- DeepSeek-R1-Distill-Qwen-7B MLX 4-bit: https://huggingface.co/Outlier-Ai/DeepSeek-R1-Distill-Qwen-7B-MLX-4bit
- Outlier-Core-27B MLX 4-bit: https://huggingface.co/Outlier-Ai/Outlier-Core-27B-MLX-4bit
- Outlier-Nano-4B MLX 4-bit: https://huggingface.co/Outlier-Ai/Outlier-Nano-4B-MLX-4bit
