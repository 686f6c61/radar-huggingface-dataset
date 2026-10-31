# bartowski/xysera_zen-4b-GGUF

## Resumen

Zen-4b es un modelo de lenguaje causal de 4.000 millones de parametros desarrollado por xysera, centrado en razonamiento (reasoning) y seguimiento de instrucciones (instruction-following). Esta ficha corresponde a la version cuantizada en formato GGUF publicada por bartowski, uno de los cuantizadores mas activos del ecosistema llama.cpp, que aporta versiones desde bf16 hasta cuantizaciones agresivas de 3 bits usando matrices de importancia (imatrix) para minimizar la perdida de calidad.

El modelo resuelve la necesidad tipica de desplegar un modelo pequeño con capacidades de razonamiento en hardware modesto: con 4B de parametros, cabe holgadamente en GPUs de consumo e incluso en portatiles con suficiente RAM, manteniendo soporte de tool calling mediante el formato ChatML con etiquetas `<tool_call>`. Su licencia Apache 2.0 lo hace apto para uso comercial sin restricciones relevantes.

Es relevante ahora porque los modelos de 3-5B con capacidades de razonamiento y agentes son el punto dulce para despliegues locales y edge, y la disponibilidad de mas de 18 cuantizaciones GGUF permite ajustar el equilibrio entre calidad, VRAM y velocidad casi al byte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal LM (transformer decoder, detalles concretos no disponibles) |
| Parametros totales | 4.022.468.096 (~4B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, Q8_0, Q6_K_L, Q6_K, Q6_K_S, Q5_K_M, Q5_K_S, Q4_K_L, Q4_1, Q4_K_M, IQ4_NL, Q4_K_S, Q4_0, IQ4_XS, IQ3_M, Q3_K_L, Q3_K_M, IQ3_XS, Q3_K_S (y otras de 3 bits e inferiores en el repo) |
| Idiomas soportados | Ingles (según la model card; otras lenguas no documentadas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el original, xysera/zen-4b, esta en safetensors) |

## Arquitectura y entrenamiento

La model card describe zen-4b como un causal-lm de 4B parametros con entrada de texto y sin decodificacion especulativa nativa. No se especifica en la informacion disponible si la arquitectura es un transformer denso estandar, el numero de capas, cabezas de atencion ni el tamano de vocabulario. El uso del formato de prompt ChatML (`<|im_start|>` / `<|im_end|>`) sugiere un entrenamiento post-ajustado alineado con ese esquema de conversacion.

Sobre el proceso de entrenamiento no hay datos publicados en la informacion proporcionada: se desconocen el numero de tokens de preentrenamiento, la composicion del dataset y si se aplicaron tecnicas como SFT, RLHF o DPO. Los tags "reasoning" e "instruction-following" indican que el modelo ha sido afinado para tareas de razonamiento y dialogo instruido, pero sin detalle metodico. El trabajo de bartowski se limita a la cuantizacion: se uso llama.cpp release b11969 con calibracion imatrix (matriz de importancia calculada sobre texto de activaciones reales) para las cuantizaciones de tipo K e IQ.

## Capacidades

- Generacion de texto conversacional en formato ChatML, optimizada para dialogo multi-turno.
- Razonamiento (reasoning): el modelo esta etiquetado para tareas que requieren cadenas de razonamiento, aunque no se documenta un modo "thinking" explicito.
- Seguimiento de instrucciones (instruction-following) afinado.
- Tool calling / function calling: formato nativo mediante etiquetas `<tool_call>` con definiciones de funciones en XML dentro del system prompt, incluyendo llamadas paralelas a multiples funciones cuando no hay dependencias entre ellas.
- Entrada unicamente textual: no hay soporte documentado de vision ni audio.
- Idioma principal: ingles; no hay documentacion de capacidades multilingues.

## Casos de uso

- Chatbots locales y asistentes conversacionales: con el formato ChatML y 4B de parametros, es idoneo para asistentes que corren en local (Ollama, LM Studio) sin depender de APIs externas, manteniendo privacidad total de las conversaciones.
- Agentes con tool calling: el formato nativo de `<tool_call>` permite integrarlo en frameworks de agentes (LangChain, llama-index, scripts propios) para que invoque funciones como consultas a APIs, busquedas o acciones sobre bases de datos.
- Razonamiento y resolucion de problemas: para tareas de razonamiento logico, matematicas basicas y planificacion de pasos donde se necesita un modelo pequeño pero afinado en reasoning, por ejemplo en pipelines de analisis automatizado.
- Procesamiento de texto en dispositivos edge: con cuantizaciones de 2 GB (Q4_K_M, IQ4_XS) puede ejecutarse en portatiles, mini PCs o SBCs con GPU integrada o CPU, para resumir, clasificar o generar texto sin conexion.
- Prototipado rapido de LLM apps: el tamano reducido permite iterar prompts y flujos de agentes en una GPU de consumo sin coste de inferencia en la nube, antes de escalar a modelos mayores.
- Backends de inferencia de bajo coste: en un servidor con una sola GPU modesta se pueden atender multiples sesiones simultaneas gracias a los ~2,6 GB de la cuantizacion Q4_K_M, adecuado para startups o entornos educativos.
- Extraccion estructurada de datos: dado el soporte de instrucciones y salida JSON en tool calls, puede usarse para convertir texto libre en estructuras JSON (entidades, clasificaciones, campos de formularios) en ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Tampoco hay datos publicados sobre la calidad relativa de las cuantizaciones (perplejidad, KL-divergencia frente al modelo bf16) mas alla de las descripciones cualitativas del autor.

## Requisitos de hardware

- VRAM / memoria estimada para inferencia (pesos del modelo, sin KV cache):
  - bf16: ~8,05 GB
  - Q8_0: ~4,28 GB
  - Q6_K / Q6_K_L: ~3,5-3,7 GB
  - Q5_K_M: ~3,11 GB
  - Q4_K_M: ~2,59 GB (recomendada por defecto)
  - IQ4_XS: ~2,33 GB
  - IQ3_M / Q3_K_M: ~2-2,2 GB
  - Anadir aproximadamente 0,5-2 GB extra de KV cache segun longitud de contexto (no documentada).
- GPU recomendadas: cualquier GPU con 4-6 GB de VRAM ejecuta la Q4_K_M con holgura: RTX 3060 12GB, RTX 4060, RTX 4090 (con espacio de sobra para contextos largos). En CPU pura, 8 GB de RAM bastan para cuantizaciones de 3-4 bits.
- Consumer GPUs: cabe comodamente en la practica totalidad de GPUs de consumo modernas; incluso graficas de 4 GB pueden cargar la Q3_K_M o IQ3_M.
- Opciones de despliegue: llama.cpp (formato nativo, release b11969 o superior), Ollama, LM Studio, KoboldCpp, y cualquier runtime compatible con GGUF. El modelo original en safetensors puede servirse con vLLM o TGI si se prefiere servido en bf16.
- Latencia y throughput: no disponibles como cifras publicadas; al ser un modelo de 4B, en GPU de consumo se esperan velocidades de decodificacion altas (del orden de decenas de tokens/s), pero no hay medidas oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| xysera zen-4b | 4B | no disponible | Apache 2.0 | Reasoning + tool calling, GGUF completo por bartowski |
| Qwen2.5-3B-Instruct | 3,1B | 32K (128K con YaRN) | Qwen (uso comercial permitido con condiciones) | Tool calling nativo, multilingue (29+ idiomas) |
| Phi-4-mini (3.8B) | 3,8B | 128K | MIT | Fuerte en razonamiento y matematicas, tool calling |
| Gemma 3 4B | 4B | 128K | Gemma (restricciones de uso) | Multimodal (vision), multilingue (140+ idiomas) |

Zen-4b destaca por su licencia Apache 2.0 sin condiciones adicionales y por el ecosistema GGUF completo; frente a Qwen2.5 o Gemma 3 pierde documentacion, multilinguismo y datos de rendimiento verificados.

## Limitaciones y advertencias

- Idioma: la model card declara solo ingles; el rendimiento en castellano u otras lenguas no esta documentado y puede ser deficiente.
- Contexto: la longitud de ventana de contexto no esta publicada, lo que dificulta planificar aplicaciones con documentos largos; verificar empiricamente antes de produccion.
- Alucinaciones: como todo modelo de 4B, el riesgo de generar contenido incorrecto con apariencia plausible es elevado, especialmente en dominios factuales; se recomienda RAG o verificacion en usos criticos.
- Sin datos de benchmarks publicos: no es posible comparar su calidad objetivamente frente a alternativas antes de evaluarlo internamente.
- Cuantizaciones agresivas: las versiones de 3 bits (Q3_K_S, IQ3_XS) degradan notablemente la calidad; usar Q4_K_M o superior para produccion.
- Sesgos: no hay auditoria de sesgos publicada; asumir los sesgos tipicos de modelos entrenados con datos web en ingles.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion sin royalties; no se identifican restricciones relevantes.
- Decodificacion especulativa no soportada nativamente segun la model card.

## Enlaces

- Modelo cuantizado (GGUF): https://huggingface.co/bartowski/xysera_zen-4b-GGUF
- Modelo original: https://huggingface.co/xysera/zen-4b
- Demo (Space): https://huggingface.co/spaces/torinriley/zen-4b-demo
- llama.cpp (herramienta de cuantizacion y ejecucion): https://github.com/ggml-org/llama.cpp
- Release usada para cuantizar: https://github.com/ggml-org/llama.cpp/releases/tag/b11969
- Paper, blog oficial y repositorio de entrenamiento: no disponibles
