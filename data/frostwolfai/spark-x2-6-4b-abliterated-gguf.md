# FrostWolfAI/Spark-X2.6-4B-abliterated-GGUF

## Resumen

Spark-X2.6-4B-abliterated-GGUF es un repositorio de cuantizaciones GGUF del modelo FrostWolfAI/Spark-X2.6-4B-abliterated, una variante "decensurada" (abliterada) de XHToken/Spark-X2.6-4B producida con la herramienta Heretic v2 mediante Arbitrary-Rank Ablation (ARA). El modelo original es un LLM de 4,11 mil millones de parámetros orientado a uso local (on-device), con capacidades agénticas, tool calling nativo, razonamiento controlable y una ventana de contexto de 1 millón de tokens.

La abliteración reduce drásticamente las negativas del modelo: los rechazos bajan de 100/100 a 2/100 con una divergencia KL de solo 0,0177, lo que indica que el comportamiento del modelo base se conserva casi intacto. La arquitectura, el contexto de 1M tokens, el "thinking mode" controlable y el formato nativo `<tool_call>` permanecen operativos tras el proceso.

Este repositorio es relevante porque ofrece un conjunto completo de 15 cuantizaciones (BF16 más 14 niveles, 44,53 GB en total) verificadas individualmente con llama.cpp, con mediciones de rendimiento publicadas en RTX 4090. Está dirigido a desarrolladores que montan agentes locales, investigación en seguridad y programación asistida en GPU de consumo, portátiles o solo CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención híbrida (3 de cada 4 capas usan ventana deslizante de 512 tokens); arquitectura GGUF `spark2_5` |
| Parametros totales | 4.112.079.360 (~4,11 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | 1.000.000 tokens (1M) |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_1, Q4_K_S, Q4_0, IQ4_XS, Q3_K_L, Q3_K_M, IQ3_S, Q3_K_S, Q2_K (sin matriz de importancia) |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (convertido desde safetensors BF16) |

## Arquitectura y entrenamiento

El modelo base Spark-X2.6-4B de XHToken emplea una arquitectura transformer con atención híbrida: tres de cada cuatro capas utilizan una ventana deslizante de 512 tokens y solo una de cada cuatro usa atención global. Esto hace que la caché KV crezca mucho más despacio que en un modelo 4B con atención puramente global, lo que hace viable el contexto de 1M de tokens, aunque a ventana completa sigue siendo una carga de trabajo de servidor.

Sobre el modelo base se aplicó un proceso de abliteración con Heretic v2 mediante Arbitrary-Rank Ablation (ARA), una técnica que elimina las direcciones de activación responsables de los rechazos. El resultado publicitado es una caída de las negativas de 100/100 a 2/100 con una divergencia KL de 0,0177 respecto al modelo original, preservando arquitectura, contexto, thinking mode y tool calling. Los datos de entrenamiento del modelo base (numero de tokens, composición del dataset, RLHF/DPO) no están disponibles en la información proporcionada.

## Capacidades

- Generacion de texto conversacional en ingles y chino, con plantilla de chat embebida compatible con Jinja.
- Razonamiento (thinking mode) activado por defecto, con control por peticion: `enable_thinking: false` para respuestas directas y `reasoning_effort: low/high` para ajustar el presupuesto de razonamiento.
- Tool calling nativo con formato `<tool_call>name<arg_key>k</arg_key><arg_value>v</arg_value></tool_call>`; llama-server lo parsea a `tool_calls` estándar con argumentos JSON, listo para frameworks agénticos.
- Orientacion agéntica y multi-turno (tags `agentic`, `tool-calling`, `reasoning`).
- Modelo decensurado: las negativas se reducen a 2/100, adecuado para investigación en seguridad y casos donde el modelo base se niega sistemáticamente.
- Ejecucion local en GPU de consumo, portátil, Apple Silicon, SBC o solo CPU gracias a GGUF.

## Casos de uso

- Agentes locales con tool calling: el formato nativo `<tool_call>` se parsea a `tool_calls` estándar de OpenAI, por lo que puede integrarse directamente en frameworks agénticos que ejecuten funciones (búsqueda, APIs, ejecución de código) sin depender de la nube.
- Programacion asistida en local: con contexto de 1M tokens puede indexar repositorios grandes; en Q4_K_M alcanza ~240 tok/s de decodificacion en una RTX 4090, suficiente para autocompletado y chat de codigo fluido.
- Investigacion en seguridad: al ser un modelo abliterado (2/100 rechazos), permite estudiar comportamientos que los modelos alineados bloquean, como analisis de malware o red teaming.
- Ejecucion en portatiles y SBC: con pesos de 2,4-2,6 GB en 4 bits, funciona en dispositivos con 8 GB de RAM, útil para asistentes offline en edge.
- Chat CLI y servidores locales OpenAI-compatibles: `llama-server` expone una API compatible con OpenAI, lo que facilita sustituir endpoints comerciales por inferencia local en prototipos.
- Procesamiento de documentos largos: la ventana de 1M tokens y la caché KV eficiente (ventanas deslizantes de 512 tokens) permiten resumir o consultar colecciones extensas de texto, aunque a contexto completo se requiere hardware de servidor.
- Razonamiento ajustable: el thinking mode con `reasoning_effort` permite equilibrar latencia frente a calidad en pipelines donde cada token cuenta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Sí se han publicado mediciones de velocidad y verificaciones funcionales por cuantización.

Verificacion funcional (llama-server, `-ngl 99 -fa on -c 8192`):

| Quant | Thinking off | Thinking on | Tool call |
| :--- | :---: | :---: | :---: |
| Q8_0 | correcto | correcto | correcto |
| Q4_K_M | correcto | correcto | correcto |
| Q2_K | coherente, un desliz factual | correcto | correcto |

Velocidad (`llama-bench -ngl 99 -fa 1 -p 512 -n 128`, RTX 4090 limitada a 360 W):

| Quant | Prefill (pp512) | Decode (tg128) |
| :--- | ---: | ---: |
| BF16 | ~12.300 tok/s | 99 tok/s |
| Q8_0 | ~16.100 tok/s | 165 tok/s |
| Q6_K | ~14.800 tok/s | 199 tok/s |
| Q4_K_M | ~16.800 tok/s | 240 tok/s |
| IQ4_XS | ~17.300 tok/s | 253 tok/s |

## Requisitos de hardware

- VRAM/RAM para pesos: desde 1,79 GB (Q2_K) hasta 8,23 GB (BF16); el punto dulce en 4 bits son 2,4-2,6 GB. La caché KV crece lentamente por las ventanas deslizantes, pero a contexto de 1M tokens se necesita hardware de servidor.
- Telefonos o SBC con 8 GB de RAM: Q4_K_M o IQ4_XS (2,4-2,6 GB).
- Portatil solo CPU con 16 GB: Q4_K_M (2,60 GB).
- Portatil o Apple Silicon con 16 GB: Q6_K o Q8_0 (3,4-4,4 GB).
- RTX 3060/4060 (8-12 GB): Q6_K o Q8_0, con descarga completa de capas a GPU (`-ngl 99`).
- RTX 3090/4090 (24 GB): Q8_0 o BF16 (4,4-8,2 GB).
- Cabe sobradamente en GPUs de consumo; no requiere A100 ni H100 para inferencia normal.
- Despliegue: llama.cpp (requisito: build con soporte `spark2_5`, probado con build 11669; builds antiguos no cargan el modelo). Aplicaciones que empaquetan llama.cpp (Ollama, LM Studio, Jan) funcionan cuando su motor incluya `spark2_5`. No consta soporte verificado en vLLM o TGI.
- Latencia/throughput: en RTX 4090, 240-253 tok/s de decodificacion en cuantizaciones de 4 bits y ~16.800-17.300 tok/s de prefill.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Spark-X2.6-4B-abliterated | 4,11 B | 1M tokens | Apache 2.0 | GGUF, safetensors | Abliterado (2/100 rechazos), thinking controlable, tool calling nativo |
| Qwen3-4B | ~4 B | 32K-128K (según version) | Apache 2.0 | GGUF, safetensors | Multilingue amplio, thinking mode; contexto menor que Spark |
| Phi-4-mini (Microsoft) | ~3,8 B | 128K | MIT | GGUF, safetensors | Fuerte en razonamiento y codigo; sin variante abliterada oficial |
| Llama 3.1 8B (abliterado, comunidad) | 8 B | 128K | Llama 3.1 Community | GGUF, safetensors | Doble de parametros, requiere mas VRAM; contexto menor |

No hay datos de benchmarks estandar que permitan comparar rendimiento medido entre estos modelos; la comparativa se limita a especificaciones.

## Limitaciones y advertencias

- Modelo deliberadamente decensurado: elimina casi todos los rechazos de seguridad. Su uso conlleva riesgos legales y eticos; el responsable de los contenidos generados es el despliegue local, no un filtro del proveedor.
- Idiomas limitados a ingles y chino; el rendimiento en castellano no está documentado y puede ser inferior.
- Requiere builds recientes de llama.cpp con soporte de la arquitectura `spark2_5`; builds antiguos y apps con motor desactualizado fallarán al cargar el modelo.
- La cuantización Q2_K muestra deslices factuales ("last resort" segun el autor); se recomienda Q4_K_M como minimo para uso serio.
- Con thinking activado, presupuestos cortos de `max_tokens` pueden consumirse íntegramente dentro del bloque `<think>` sin producir respuesta final.
- La abliteración con KL de 0,0177 no garantiza que no haya degradación sutil en capacidades del modelo base; no se publican benchmarks post-abliteración que lo confirmen.
- Las cuantizaciones se realizaron sin matriz de importancia, lo que puede afectar a la fidelidad de los niveles bajos.
- Licencia Apache 2.0: sin restricciones para uso comercial, pero conviene revisar la licencia y términos del modelo base XHToken/Spark-X2.6-4B.
- Datos de entrenamiento del modelo base no disponibles: imposible evaluar sesgos específicos del corpus.

## Enlaces

- Repositorio GGUF: https://huggingface.co/FrostWolfAI/Spark-X2.6-4B-abliterated-GGUF
- Modelo base abliterado (safetensors, detalles de abliteración y bundle de reproducción): https://huggingface.co/FrostWolfAI/Spark-X2.6-4B-abliterated
- Modelo original: https://huggingface.co/XHToken/Spark-X2.6-4B
- Heretic (herramienta de abliteración): https://github.com/p-e-w/heretic
- llama.cpp: https://github.com/ggml-org/llama.cpp
