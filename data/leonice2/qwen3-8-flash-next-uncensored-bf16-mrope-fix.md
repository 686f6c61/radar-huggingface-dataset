# leonice2/Qwen3.8-Flash-Next-Uncensored-BF16-MRoPE-Fix

## Resumen

Qwen3.8-Flash-Next-Uncensored-BF16-MRoPE-Fix es una compilacion de pesos en precision completa (BF16) del modelo Qwen3.8-Flash-Next de Qwen/Alibaba, publicada por el usuario leonice2. Se trata de una variante "abliterated", es decir, con la direccion de rechazo ortogonalizada fuera del flujo residual para eliminar sustancialmente el comportamiento de negativa del modelo original. El repositorio conserva tanto la torre de vision como la cabeza MTP (multi-token prediction) del modelo base, y se presenta como el origen a partir del cual se derivan las versiones cuantizadas (FP8 y MLX de 4, 6 y 8 bits).

El modelo es un Mixture-of-Experts de aproximadamente 180.000 millones de parametros totales, con atencion hibrida, modalidad nativa vision-lenguaje, contexto de 262.144 tokens, pensamiento flexible (thinking mode), tool calling y decodificacion especulativa mediante MTP. Su relevancia actual radica en que ofrece pesos sin recortes de alineacion de seguridad para investigacion de interpretabilidad, estudios de mecanismos de rechazo y red teaming, sobre una base tecnica de ultima generacion y con licencia Apache 2.0.

La ficha describe exclusivamente los datos disponibles en la informacion proporcionada; los campos no documentados se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con atencion hibrida, vision-lenguaje nativa y cabeza MTP; transformer con enrutado 512E top-10 |
| Parametros totales | 179.999.981.459 (~180B) |
| Parametros activos | ~6B (segun model card; el total de 125B indicado en la misma card no coincide con el recuento de safetensors) |
| Longitud de contexto | 262.144 tokens (262K) |
| Tipos de cuantizacion | BF16 (esta version); derivados FP8 block y MLX 4/6/8 bits |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16); libreria transformers |

## Arquitectura y entrenamiento

El modelo base es un MoE con atencion hibrida que combina mecanismos de atencion estandar con componentes de atencion lineal, segun se deduce de la etiqueta "hybrid-attention" de la model card. El enrutado es 512E top-10, lo que implica 512 expertos por capa con activacion de los 10 mejores por token, dando lugar a unos 6B parametros activos sobre un total de ~180B. Incluye una torre de vision para entrada image-text-to-text y una cabeza MTP que habilita decodificacion especulativa y prediccion multi-token. La variante aqui descrita aplica abliteration: se calcula la direccion de rechazo en el espacio residual y se ortogonaliza respecto a los pesos, eliminando el comportamiento de negativa sin reentrenamiento supervisado.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni la presencia de RLHF, DPO u otras fases de post-entrenamiento en el modelo base. La model card menciona etiquetas de post-training y fine-tuning, pero no detalla las etapas. El sufijo "MRoPE-Fix" del repositorio sugiere una correccion en el manejo de Rotary Position Embeddings multimodal, aunque no se documenta el alcance tecnico de dicho ajuste.

## Capacidades

- Generacion de texto y razonamiento con modo de pensamiento flexible (thinking mode).
- Procesamiento de imagenes y video como entrada (pipeline image-text-to-text, vision-lenguaje nativa).
- Tool calling y function calling para integracion en pipelines y agentes.
- Razonamiento multi-paso y comportamiento agentico.
- Decodificacion especulativa mediante cabeza MTP para acelerar la inferencia.
- Capacidades multilingues limitadas a ingles y chino.
- Comportamiento sin rechazo (uncensored): cumple solicitudes que el modelo base rechazaria, incluidas peticiones daninas.
- Compatibilidad con endpoints (etiqueta endpoints_compatible).

## Casos de uso

- Investigacion de interpretabilidad y mecanismos de rechazo: comparar las activaciones del modelo abliterated con las del Qwen3.8-Flash-Next original para localizar y caracterizar la direccion de rechazo en el flujo residual, usando la version BF16 como referencia sin perdida de precision.
- Red teaming y evaluacion de robustez: generar ataques y prompts adversarios controlados para medir la resistencia de sistemas de moderacion y filtros de seguridad propios, en un entorno de laboratorio aislado.
- Fine-tuning y post-entrenamiento: al ser pesos BF16 completos con torre de vision y cabeza MTP preservadas, sirve como base para ajuste supervisado o DPO orientado a dominios concretos, partiendo de un modelo sin alineacion previa que no interfiere con la senal de entrenamiento.
- Cuantizacion y despliegue derivado: es la fuente recomendada para producir versiones FP8 o MLX y validar el impacto de la cuantizacion en tareas multimodales con contexto largo.
- Analisis de documentos e imagenes tecnicas en ingles o chino: con 262K tokens de contexto puede procesar manuales, informes o capturas extensas y responder preguntas cruzando texto e imagen, en escenarios de investigacion donde no se requiere moderacion integrada.
- Estudio de alucinacion y sesgos: al carecer de guardrails, permite medir con menos interferencia la tendencia del modelo base a fabricar contenido o reproducir sesgos, como linea base para comparativas de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 360 GB solo para pesos (179.999.981.459 parametros x 2 bytes), mas overhead de activaciones, cache KV para 262K tokens y torre de vision. No cabe en ninguna GPU de consumo.
- GPU recomendadas: para BF16 se requiere un nodo multi-GPU de clase数据中心, por ejemplo 8x H100 80GB (640 GB) o 8x A100 80GB; con FP8 el requisito baja a unos 180 GB, viable en 4x H100 80GB o 2x H200.
- GPU de consumo: no es viable en RTX 4090 ni en ninguna consumer GPU en BF16 ni FP8. Solo las versiones MLX de 4 bits (orientativas, ~90 GB) podrian ejecutarse en Mac Studio con memoria unificada alta, no en MacBook convencionales.
- Opciones de despliegue: transformers (libreria declarada), vLLM (mencionado en la model card para servir el modelo), y las variantes MLX para Apple Silicon. No se documenta soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La cabeza MTP esta pensada para decodificacion especulativa y deberia mejorar el throughput respecto a decodificacion autoregresiva estandar, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-Uncensored-BF16-MRoPE-Fix | ~180B totales / ~6B activos | 262K | Texto + vision/video | Apache 2.0 | Abliterated, sin guardrails; pesos BF16 |
| Qwen/Qwen3.8-Flash-Next (base) | ~180B totales / ~6B activos | 262K | Texto + vision/video | Apache 2.0 | Alineado y con rechazo; referencia de comparacion |
| Qwen3.8-Flash-Next-Uncensored-FP8 | ~180B totales / ~6B activos | 262K | Texto + vision/video | Apache 2.0 | Misma familia, cuantizado block-FP8 |
| Qwen3.8-Flash-Next-Uncensored-MLX | ~180B totales / ~6B activos | 262K | Texto + vision/video | Apache 2.0 | Misma familia, 4/6/8 bits para Apple Silicon |

No se dispone de datos de rendimiento comparado con otros modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- La alineacion de seguridad ha sido sustancialmente eliminada: el modelo cumplira solicitudes daninas, ilegales u ofensivas que el original rechazaria. No debe desplegarse a usuarios finales ni en produccion sin capas propias de moderacion y prevencion de abuso.
- Uso previsto exclusivamente para investigacion legitima: interpretabilidad, seguridad de IA, estudio de mecanismos de rechazo, red teaming y evaluacion de robustez en entornos controlados.
- Riesgo elevado de alucinacion y de generacion de contenido sesgado o difamatorio; no se documentan evaluaciones de sesgo del modelo base ni de esta variante.
- Soporte idiomatico limitado a ingles y chino; el rendimiento en castellano no esta documentado y probablemente sea inferior.
- La model card indica simultaneamente 125B y ~180B parametros totales; el recuento real de safetensors (179.999.981.459) confirma el segundo valor, pero la discrepancia debe tenerse en cuenta.
- La licencia Apache 2.0 permite uso comercial, pero el autor declina toda responsabilidad y el uso debe cumplir la legislacion aplicable; el despliegue comercial de un modelo sin guardrails conlleva riesgo legal y reputacional.
- El repositorio ocupa 360 GB y requiere infraestructura multi-GPU para su uso en BF16.
- No se documentan los detalles del ajuste MRoPE ni su impacto en la calidad multimodal.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/leonice2/Qwen3.8-Flash-Next-Uncensored-BF16-MRoPE-Fix
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- OrcaRouter (sitio del autor de la card): https://www.orcarouter.ai
- Catalogo de modelos OrcaRouter: https://www.orcarouter.ai/models
- OrcaCyber Zero 1.5: https://www.orcarouter.ai/models/orca/orcacyber-zero-1.5
- Orca Connect: https://www.orcarouter.ai/solutions/orca-connect
- GitHub de Continuum AI Corp: https://github.com/Continuum-AI-Corp
- Discord: https://discord.gg/yAh6Tex6kx
- X (Twitter): https://x.com/OrcaRouter
