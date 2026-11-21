# furiosa-ai/Qwen3-30B-A3B-Thinking-2507-FP8

## Resumen

Qwen3-30B-A3B-Thinking-2507-FP8 es la variante de razonamiento (thinking) de la familia Qwen3, publicada por Alibaba Qwen en la actualización de julio de 2025 (sufijo 2507). Se trata de un transformer autorregresivo con arquitectura Mixture-of-Experts (MoE) de 30.532 millones de parámetros totales, de los cuales aproximadamente 3.300 millones se activan por token, lo que reduce de forma notable el coste computacional por inferencia frente a un modelo denso del mismo tamaño.

El repositorio analizado, `furiosa-ai/Qwen3-30B-A3B-Thinking-2507-FP8`, es una redistribución del checkpoint oficial FP8 de Qwen empaquetada por FuriosaAI junto con un Furiosa Executable Bundle (FXB) para ejecutarse sobre aceleradores FuriosaAI RNGD mediante la librería `furiosa-llm`. Los pesos mantienen la cuantización FP8 estática del release original y las activaciones se cuantizan dinámicamente a FP8 en tiempo de ejecución (per-token / per-block), mientras que la caché KV permanece en 16 bits.

Su relevancia actual es doble: por un lado, ofrece razonamiento explícito con cadena de pensamiento y soporte de tool calling bajo licencia Apache 2.0, lo que lo hace apto para uso comercial sin restricciones; por otro, demuestra la portabilidad del modelo a hardware alternativo a GPU (NPU de FuriosaAI) con un backend compatible con la API de OpenAI, lo que amplía las opciones de despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-MoE (Mixture-of-Experts), transformer autorregresivo |
| Parametros totales | 30.532.122.624 |
| Parametros activos | ~3.300 millones por token |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | FP8 estatico en pesos; FP8 dinamico en activaciones (per-token / per-block); KV cache en 16 bits |
| Idiomas soportados | no disponible (la model card menciona cobertura multilingue sin detallar idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 60,7 GB) |
| Entrada / salida | Texto / Texto |
| Hardware soportado (este repo) | FuriosaAI RNGD (4 tarjetas, tensor-parallel de 32 PEs) |
| Motores de inferencia compatibles | Furiosa-LLM (principal); vLLM, SGLang y Transformers segun el modelo upstream |
| Modo de razonamiento | Solo thinking (siempre genera cadena de pensamiento) |
| Parsers de servido | `qwen3` (reasoning), `hermes` (tool calling) |

## Arquitectura y entrenamiento

La arquitectura es un transformer MoE de la familia Qwen3, con 30.532 millones de parámetros totales y aproximadamente 3.300 millones activados por token. El modelo opera exclusivamente en modo thinking: antes de emitir la respuesta final genera una cadena de razonamiento interna, que Furiosa-LLM puede separar en el campo `reasoning` de la respuesta mediante el parser `qwen3`. Esta separación es relevante en producción porque permite registrar o filtrar el razonamiento sin contaminar la salida entregada al usuario.

El checkpoint deriva del release oficial `Qwen/Qwen3-30B-A3B-Thinking-2507-FP8`, que a su vez aplica cuantización FP8 estática a los pesos. Sobre esa base, la distribución de FuriosaAI añade cuantización dinámica de activaciones a FP8 en tiempo de ejecución y mantiene la caché KV en 16 bits para preservar precisión en el contexto. En RNGD el modelo se despliega con tamaño de tensor-parallel de 32 PEs, lo que corresponde a cuatro tarjetas RNGD (8 PEs por tarjeta). No se dispone en la información proporcionada de detalles sobre el volumen de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF/DPO aplicadas por Qwen.

## Capacidades

- Generación de texto con razonamiento explícito: el modelo siempre produce una cadena de pensamiento antes de la respuesta final, lo que mejora tareas de lógica, matemáticas y análisis multi-paso.
- Tool calling / function calling: soportado mediante el parser `hermes`, con elección automática de herramienta (`--enable-auto-tool-choice`).
- Razonamiento multi-paso y uso en pipelines de agentes, gracias a la separación entre razonamiento y respuesta final.
- Instrucciones y seguimiento conversacional: pipeline declarado como `text-generation` y `conversational`.
- Cobertura multilingüe: la model card menciona soporte multilingüe, aunque no se detallan los idiomas concretos.
- API compatible con OpenAI: el servidor `furiosa-llm serve` expone `/v1/chat/completions` con campos `reasoning` y `delta.reasoning` (streaming).
- Capacidades multimodales (visión, audio): no disponibles; entrada y salida son exclusivamente texto.

## Casos de uso

- Razonamiento asistido en atención al cliente: el modelo puede resolver consultas que requieren varios pasos (cálculo de plazos, comparación de condiciones) generando el razonamiento en un campo separado auditable, útil para trazabilidad y control de calidad.
- Agentes con herramientas en producción: con `--enable-auto-tool-choice` y el parser `hermes`, puede decidir cuándo invocar APIs externas (búsqueda, cálculo, consulta de bases de datos) dentro de un bucle de agente.
- Generación y revisión de código: el modo thinking permite explicar decisiones de diseño y detectar errores lógicos antes de emitir el parche final; el razonamiento separado facilita la revisión por parte de un humano o de otro modelo.
- Análisis de documentos largos con razonamiento: para tareas de extracción, resumen y verificación de consistencia sobre textos extensos, aprovechando la ventana de contexto del modelo (no detallada en la información disponible).
- Despliegue en infraestructura no-GPU: organizaciones con aceleradores FuriosaAI RNGD pueden servir el modelo con cuatro tarjetas y API compatible con OpenAI, sin depender de GPUs NVIDIA.
- Evaluación comparativa de razonamiento: al exponer la cadena de pensamiento de forma estructurada, es adecuado para experimentos de investigación sobre calidad de razonamiento, detección de atajos y análisis de errores.
- Sustitución de modelos propietarios en flujos internos: la licencia Apache 2.0 permite integrarlo en productos comerciales sin obligaciones de atribución adicionales más allá de las de la licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/espacio de pesos: el repositorio ocupa 60,7 GB en FP8, por lo que se necesita al menos esa cantidad de memoria de acelerador distribuida entre dispositivos.
- Hardware objetivo de este repositorio: FuriosaAI RNGD, con 4 tarjetas en tensor-parallel de 32 PEs (8 PEs por tarjeta).
- GPUs: no se especifican requisitos de GPU en la información proporcionada; el modelo upstream FP8 puede ejecutarse en vLLM, SGLang y Transformers, pero no se detallan GPUs concretas ni cifras de VRAM para esos backends.
- GPU de consumo: no disponible; el tamaño en FP8 (60,7 GB) excede la memoria de una RTX 4090 (24 GB) en una sola tarjeta, pero no se confirma ningún escenario consumer en la documentación.
- Opciones de despliegue: `furiosa-llm serve` (backend principal de este repo); vLLM, SGLang y Transformers mediante el modelo upstream.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3-30B-A3B-Thinking-2507-FP8 (este repo, FuriosaAI) | 30,5B / ~3,3B | no disponible | Apache 2.0 | Hugging Face, backend Furiosa-LLM |
| Qwen/Qwen3-30B-A3B-Thinking-2507-FP8 (upstream) | 30,5B / ~3,3B | no disponible | Apache 2.0 | Hugging Face, vLLM/SGLang/Transformers |
| Alternativas de tamaño y categoría similares | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de rendimiento ni de especificaciones de modelos alternativos que permitan una comparación cuantitativa rigurosa.

## Limitaciones y advertencias

- Modo thinking obligatorio: el modelo siempre genera cadena de pensamiento, lo que incrementa los tokens de salida y la latencia frente a variantes no thinking; no es adecuado para respuestas de baja latencia sin filtrado del razonamiento.
- Riesgo de alucinación: como todo modelo generativo, puede producir razonamientos plausibles pero incorrectos; la cadena de pensamiento no garantiza la veracidad de la respuesta final.
- Idiomas: la cobertura multilingüe se menciona de forma genérica, sin lista de idiomas ni evaluación por lengua en la información disponible.
- Contexto: la longitud máxima de contexto no se detalla en la documentación proporcionada, por lo que debe verificarse en la model card upstream antes de diseñar flujos con entradas largas.
- Dependencia de hardware: este repositorio está empaquetado para FuriosaAI RNGD con Furiosa-LLM; para otros backends hay que usar el checkpoint upstream, no este FXB.
- Precisión numérica: la cuantización FP8 (pesos y activaciones) puede introducir degradación frente al modelo en BF16, especialmente en tareas sensibles a precisión numérica.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar el archivo LICENSE del repositorio upstream para confirmar condiciones y atribuciones.
- Sesgos: no se documentan en la información proporcionada evaluaciones de sesgo ni mitigaciones específicas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/furiosa-ai/Qwen3-30B-A3B-Thinking-2507-FP8
- Modelo upstream: https://huggingface.co/Qwen/Qwen3-30B-A3B-Thinking-2507-FP8
- Licencia upstream: https://huggingface.co/Qwen/Qwen3-30B-A3B-Thinking-2507-FP8/blob/main/LICENSE
- Documentación de Furiosa-LLM: https://developer.furiosa.ai/latest/en/furiosa_llm/intro.html
- Guía de instalación de Furiosa-LLM: https://developer.furiosa.ai/latest/en/get_started/furiosa_llm.html#installing-furiosa-llm
- Guía de tool calling: https://developer.furiosa.ai/latest/en/furiosa_llm/toolcalling.html
- Referencia de `furiosa-llm serve`: https://developer.furiosa.ai/latest/en/furiosa_llm/furiosa-llm-serve.html
- Sitio de FuriosaAI: https://furiosa.ai
