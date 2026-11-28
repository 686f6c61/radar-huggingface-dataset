# primitive-ai/Ling-3.2-air-NVFP4

## Resumen

Ling-3.2-air-NVFP4 es una compilación cuantizada del modelo multimodal inclusionAI/Ling-3.2-air, publicada por primitive-ai. El modelo base es un transformer MoE multimodal de 124.000 millones de parámetros totales con 5.500 millones activos, diseñado para tareas de imagen-texto a texto. Esta versión reduce el peso del repositorio de 129,28 GB (FP8) a 77,89 GB mediante la cuantización de los 512 expertos enrutados de cada capa MoE a NVFP4, manteniendo el resto de componentes en BF16.

La relevancia de esta compilación es práctica: permite ejecutar un modelo de 124B en una única GPU de 96 GB (RTX PRO 6000 Blackwell), con un pool KV de 1.022.829 tokens a una ventana de 32.768 tokens. El autor reporta 593 tok/s a concurrencia 32 y 100,6 tok/s en flujo único, con una deriva de +18,85×10⁻³ nats por token respecto a la versión FP8 de referencia y un 95,9% de acuerdo top-1.

Se distribuye bajo licencia MIT, la misma del modelo base, y está pensada para servirse con vLLM mediante el formato compressed-tensors. La compilación se construyó a partir de la release FP8, ya que inclusionAI no ha publicado pesos BF16 de este modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal con atención híbrida (35 capas KDA de atención lineal + 7 capas MLA con compuerta), 42 capas en total |
| Parametros totales | 127.920.654.544 (124B según model card) |
| Parametros activos | 5.500 millones |
| Longitud de contexto | 32.768 tokens (ventana configurada en el ejemplo de despliegue); pool KV de 1.022.829 tokens en una GPU de 96 GB |
| Tipos de cuantizacion | NVFP4 (E2M1 con escala E4M3 por cada 16 valores y escala global FP32) en expertos enrutados; BF16 en atención, expertos compartidos, MLPs densos, routers, torre de visión, embeddings y LM head |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors con compressed-tensors; librería vLLM |

## Arquitectura y entrenamiento

El modelo base Ling-3.2-air emplea una arquitectura MoE con 42 capas: 35 capas de atención lineal KDA y 7 capas de atención MLA con compuerta. Cada capa MoE contiene 512 expertos enrutados (top-8) más un experto compartido, con tamaño oculto de 2560 y anchura de experto de 768. Incluye además una torre de visión y una capa MTP (multi-token prediction). Los parámetros totales ascienden a 124B, con 5,5B activos por token.

Esta compilación concreta no entrena el modelo: parte de la release FP8 de inclusionAI, desquantiza los tensores FP8 (bloques de 128×128) a BF16 y cuantiza los expertos enrutados a NVFP4. Las proyecciones gate y up de cada experto comparten una escala global porque vLLM las fusiona. La torre de visión, los embeddings, el LM head y las normas son byte-idénticos a la release original. No se dispone de información sobre el dataset de entrenamiento, el número de tokens o las etapas de alineación (RLHF/DPO) del modelo base en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento activable (`enable_thinking: true` en `chat_template_kwargs`).
- Procesamiento de imagen-texto a texto (pipeline `image-text-to-text`) mediante torre de visión integrada.
- Tool calling y function calling, con parser `ling3` en vLLM y `--enable-auto-tool-choice`.
- Razonamiento multi-paso y uso en agentes, con parser de razonamiento `ling3`.
- Capacidades multilingües: no disponible la lista concreta de idiomas.
- Decodificación multi-token mediante capa MTP.
- Modo de abstención: el autor reporta una puntuación de 80,0 en la suite de abstención, lo que indica cierta capacidad de declinar responder cuando no dispone de información.

## Casos de uso

- Asistencia conversacional multimodal: el modelo acepta imágenes y texto en la misma conversación, adecuado para soporte técnico donde el usuario adjunta capturas de pantalla o diagramas junto a su consulta.
- Automatización de agentes con tool calling: la integración con el parser `ling3` de vLLM permite conectar el modelo a APIs externas y ejecutar flujos multi-paso, con una puntuación de 79,8 en la suite de tool calls del autor.
- Análisis de documentos con componente visual: la torre de visión y la ventana de 32.768 tokens permiten procesar páginas escaneadas o capturas junto a instrucciones largas.
- Generación de código en pipelines: el modelo soporta tool calling y puede integrarse en flujos de CI/CD para revisión o generación asistida, aunque no se han publicado benchmarks específicos de código en la información disponible.
- Despliegue en una sola GPU de 96 GB: al caber en una RTX PRO 6000 Blackwell con 593 tok/s a concurrencia 32, es viable para servicios de inferencia con requisitos de hardware contenidos frente a la release FP8 que exige dos tarjetas.
- Razonamiento con presupuesto de tokens: el modo de pensamiento con presupuesto de 16.384 tokens (usado en las mediciones del autor) sirve para tareas de análisis que requieren cadenas de razonamiento largas.
- Investigación sobre cuantización: la deriva medida (+18,85×10⁻³ nats/token, 95,9% de acuerdo top-1) y la comparación con la variante NVFP4A16 lo convierten en un caso de estudio para evaluar el impacto de NVFP4 W4A4 en modelos MoE de gran tamaño.

## Benchmarks y rendimiento

Datos medidos por el autor en una RTX PRO 6000 Blackwell (96 GB), suite de conocimiento de 1.170 ítems y suite de tool calling de 200 ítems, temperatura 0,6, top_p 0,95, top_k 20, thinking activado, presupuesto de 16.384 tokens, concurrencia 32. Throughput con 8K de entrada y 512 de salida.

| Build | Formato | Tamano | Deriva (×10⁻³ nats/token) | Acuerdo top-1 | Conocimiento | Tool calls | Abstención | Finalizados | tok/s @1 | tok/s @32 |
|---|---|---|---|---|---|---|---|---|---|---|
| Ling-3.2-air FP8 (referencia) | FP8 W8A8, bloques 128×128 | 129,28 GB | 0 (referencia) | 100% | 90,3 | 75,8 | 79,2 | 98,8% | n/a (2 tarjetas) | n/a (2 tarjetas) |
| Ling-3.2-air-NVFP4 (este repo) | NVFP4 W4A4 expertos, resto BF16 | 77,89 GB | +18,85 | 95,9% | 89,9 | 79,8 | 80,0 | 98,1% | 100,6 | 593 |
| Ling-3.2-air-NVFP4A16 | NVFP4 W4A16 expertos, resto BF16 | 77,88 GB | +10,51 | 96,5% | 90,2 | 80,0 | 76,7 | 97,9% | 104,9 | 555 |

El autor advierte que la pasada forward de vLLM para este modelo no es reproducible bit a bit: dos ejecuciones del mismo build coinciden en aproximadamente el 96,5% de los tokens top-1 y su deriva media difiere hasta 0,7×10⁻³. El error estándar de la deriva sobre las 400 trazas (156.720 tokens de finalización) es de 0,84. Las diferencias de pocos puntos en tool calling quedan dentro del ruido entre ejecuciones (hasta 5,5 puntos entre ejecuciones del mismo build).

## Requisitos de hardware

- VRAM estimada: 77,89 GB de pesos, más el pool KV; cabe en una GPU de 96 GB con `--gpu-memory-utilization 0.92` y ventana de 32.768 tokens, dejando espacio para 1.022.829 tokens de caché KV.
- GPU recomendada: RTX PRO 6000 Blackwell (96 GB), la única configuración validada por el autor.
- GPU consumer: no cabe en tarjetas de 24 GB ni 48 GB en esta compilación; se requiere una GPU de 96 GB o un despliegue multi-GPU no documentado.
- Despliegue: vLLM con imagen `vllm/vllm-openai:nightly-a2bcb5657a881a002e79d0adab3c6b5e39436121`, `--trust-remote-code`, `--max-model-len 32768`, `--reasoning-parser ling3`, `--enable-auto-tool-choice` y `--tool-call-parser ling3`. No se documentan opciones para llama.cpp, Ollama ni TGI.
- Latencia y throughput medidos: 100,6 tok/s en flujo único y 593 tok/s a concurrencia 32 en una tarjeta, con 8K de entrada y 512 de salida, sin prefix caching.
- La release FP8 de referencia requiere dos tarjetas en tensor parallel 2; esta compilación reduce el requisito a una sola.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Ling-3.2-air-NVFP4 (este repo) | 124B totales, 5,5B activos | 32.768 tokens configurados | NVFP4 W4A4 + BF16, 77,89 GB | MIT | Una GPU de 96 GB; 593 tok/s @32 |
| Ling-3.2-air FP8 (inclusionAI) | 124B totales, 5,5B activos | no disponible | FP8 W8A8, 129,28 GB | MIT | Referencia de calidad; requiere 2 GPUs |
| Ling-3.2-air-NVFP4A16 (primitive-ai) | 124B totales, 5,5B activos | no disponible | NVFP4 W4A16 + BF16, 77,88 GB | MIT | Menor deriva (+10,51) pero menor throughput @32 (555 tok/s) |

No se dispone de datos de benchmarks de modelos comparables de otros autores en la información proporcionada.

## Limitaciones y advertencias

- La compilación se construyó desde la release FP8, no desde pesos BF16 (inexistentes); la deriva de +18,85×10⁻³ nats/token es la pérdida de calidad acumulada de dos cuantizaciones sucesivas.
- La pasada forward de vLLM no es reproducible bit a bit para este modelo; los resultados pueden variar entre ejecuciones, especialmente en tool calling.
- Riesgo de alucinación inherente a los modelos de lenguaje; la puntuación de abstención de 80,0 no elimina este riesgo en producción.
- Sesgos conocidos: no disponible en la información proporcionada.
- Lista de idiomas soportados: no disponible; conviene validar el rendimiento en castellano antes de desplegar.
- La licencia MIT permite uso comercial, pero se trata de una versión modificada del modelo base; el autor indica que los expertos fueron cuantizados y los tensores FP8 desquantizados a BF16.
- Requiere `--trust-remote-code` por el código personalizado de la arquitectura `bailing_moe_v3_vl`.
- Solo se ha validado en una RTX PRO 6000 Blackwell; no hay datos de rendimiento en otras GPU ni en configuraciones multi-GPU para esta compilación.
- El repositorio tiene 256 descargas y 3 likes en el momento de la consulta, por lo que la validación comunitaria es escasa.

## Enlaces

- Hugging Face: https://huggingface.co/primitive-ai/Ling-3.2-air-NVFP4
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.2-air
- Variante NVFP4A16: https://huggingface.co/primitive-ai/Ling-3.2-air-NVFP4A16
- Web del autor: https://primitive.com
- Perfil del autor en Hugging Face: https://huggingface.co/primitive-ai
