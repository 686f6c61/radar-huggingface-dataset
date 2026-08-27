# 0xSero/Ornith-1.5-35B-A3B-EXL3-3.5bpw

## Resumen

Ornith-1.5-35B-A3B-EXL3-3.5bpw es una cuantización comunitaria en formato EXL3 (ExLlamaV3) del modelo base ornith-ai/Ornith-1.5-35B-A3B, desarrollada por 0xSero. No es un lanzamiento oficial de Ornith, sino una adaptación optimizada para inferencia eficiente en hardware consumer. El modelo base es un mixture-of-experts (MoE) de la familia Ornith-1.5 que activa aproximadamente 3.000 millones de parámetros por token, con un total de unos 35.000 millones, y está diseñado para tareas de razonamiento, generación de código y uso agéntico.

La particularidad de esta cuantización reside en su mapa de capas: los expertos enrutados (que representan el 90% de los parámetros) se comprimen a 3,5 bits por peso, mientras que el backbone de atención —incluyendo las proyecciones GatedDeltaNet de atención lineal, la atención completa, los expertos compartidos, embeddings, lm_head, normas y router— se mantiene en BF16. Este enfoque, popularizado por brandonmusic para GLM-5.2, prioriza la integridad de las vías de información sensibles sobre la compresión agresiva de los expertos redundantes. El resultado es un artefacto de 20,5 GB con una degradación mínima frente al modelo BF16 (KL 0,0540, acuerdo top-1 del 90,5%).

La relevancia actual de este modelo radica en que permite ejecutar un MoE de 35B con contexto nativo de 262.144 tokens en hardware de gama media (por ejemplo, 4x RTX 3090 con tensor parallelism), manteniendo un rendimiento cercano al original. Está pensado para desarrolladores que necesitan desplegar modelos de razonamiento con capacidades agénticas y de tool calling en entornos con restricciones de VRAM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture-of-experts) con 256 expertos enrutados, top-8 routing, 40 capas (30 con GatedDeltaNet de atención lineal, 10 con atención completa), MTP (multi-token prediction) draft layer, torre de visión |
| Parametros totales | 10.206.011.248 (pesos cuantizados en safetensors) |
| Parametros activos | ~3.000 millones (estimado del modelo base; no se especifica en la cuantización) |
| Longitud de contexto | 262.144 tokens (nativo) |
| Tipos de cuantizacion | EXL3 3,5 bpw (expertos enrutados), BF16 (backbone de atención, expertos compartidos, embeddings, lm_head, router), 4 bpw (MTP draft layer), BF16 (torre de visión) |
| Idiomas soportados | No disponible (la model card del base no los lista) |
| Licencia | MIT |
| Formato de pesos | safetensors (EXL3) |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-35B-A3B es un transformer MoE con 256 expertos enrutados y selección top-8, lo que activa solo ~3B parámetros por token. De sus 40 capas, 30 emplean GatedDeltaNet, una variante de atención lineal con estado recurrente por secuencia, y las 10 restantes usan atención completa. Incluye además una capa MTP (multi-token prediction) para acelerar la decodificación especulativa y una torre de visión que permite entrada imagen-texto. El modelo es de razonamiento: por defecto, el turno del asistente abre con un bloque de pensamiento (thinking) antes de la respuesta final, y soporta tool calling mediante bloques `<tool_call>`.

La cuantización EXL3 se realizó con exllamav3 1.4.2, usando codebook MCG y calibración estándar (250 filas x 2048 tokens). El mapa de capas fuerza a BF16 todos los módulos de atención (lineal y completa), expertos compartidos, embeddings, lm_head, normas y router, mientras que los expertos enrutados se cuantizan a 3,5 bpw. Esta decisión se justifica porque los expertos enrutados son altamente redundantes y toleran compresión, mientras que las proyecciones GatedDeltaNet son pequeñas pero extremadamente sensibles. El proceso de conversión requiere un parche de monkey-patching en `create_q_strategy` para forzar el mapa de bits, y puede tropezar con un bug de reentrada en el autotuner de Triton 3.6.0.

## Capacidades

- Generación de texto y razonamiento multi-step con modo "thinking" integrado (bloque de pensamiento antes de la respuesta).
- Generación de código y tareas de programación agéntica, con soporte de tool calling y function calling mediante bloques `<tool_call>`.
- Capacidades agénticas: puede gestionar flujos multi-turno con contexto largo (hasta 262K tokens) y mantener estado recurrente en las capas GatedDeltaNet.
- Entrada multimodal imagen-texto gracias a la torre de visión (aunque la cuantización mantiene la torre en BF16).
- Decodificación especulativa mediante la capa MTP, que mejora el throughput en inferencia.
- Multilingüe: no se especifican idiomas concretos, pero el modelo base está entrenado con datos multilingües (no confirmado en la documentación disponible).

## Casos de uso

- Asistentes de programación en producción: el modelo puede integrarse en pipelines de CI/CD para generación de código, revisión de pull requests y autocompletado, gracias a su soporte de tool calling y su bajo coste por token (solo ~3B activos).
- Agentes autónomos multi-paso: con contexto nativo de 262K tokens y modo de razonamiento, es adecuado para agentes que deben planificar, ejecutar herramientas y mantener estado a lo largo de conversaciones largas, por ejemplo en automatización de tareas de oficina o investigación web.
- Atención al cliente automatizada: puede gestionar conversaciones multi-turno con historial extenso (hasta 262K tokens) y derivar a herramientas externas (CRM, bases de conocimiento) mediante function calling.
- Análisis de documentos largos: su ventana de contexto permite procesar libros técnicos, informes financieros o codebases completos en una sola pasada, con resúmenes y extracción de información.
- Generación de documentación técnica: a partir de código fuente o especificaciones, puede redactar guías, comentarios y manuales con razonamiento estructurado.
- Prototipado de aplicaciones RAG: al mantener el backbone de atención en BF16, la calidad de recuperación y síntesis es cercana al modelo original, útil para sistemas de pregunta-respuesta sobre corpus extensos.

## Benchmarks y rendimiento

La model card de la cuantización no incluye benchmarks estándar (MMLU, HumanEval, GSM8K, etc.), pero sí proporciona métricas de fidelidad frente al modelo BF16 base, evaluadas con `exllamav3 eval/model_diff` sobre 100 rondas x 2048 tokens de wikitext:

| Checkpoint | KL(A->B) | Top-1 agreement |
|---|---|---|
| **Ornith-1.5-35B-A3B-EXL3-3.5bpw** | **0.0540** | 90,5% |
| EXL3 2,75 bpw | 0.1005 | 87,1% |
| EXL3 3 bpw | 0.0732 | 88,9% |
| EXL3 3,5 bpw | 0.0540 | 90,5% |
| Referencia: plain -hq 3 bpw | 0.2509 | 79,9% |

La perplexidad del base BF16 en los mismos datos es 8,717; las tres cuantizaciones sin poda se mantienen dentro del ruido (8,698 / 8,711 / 8,719). Según la documentación del modelo base, Ornith-1.5-35B-A3B supera a Qwen 3.6-35B en todos los benchmarks de coding y agénticos, y supera por amplio margen a modelos densos como Gemma 4-31B y Muse Glimmer-30B en coding agéntico, aunque no se proporcionan cifras concretas en la información disponible.

## Requisitos de hardware

- VRAM estimada: los pesos ocupan 20,5 GB en disco; en inferencia con TP4 en 4x RTX 3090 (24 GB), los pesos ocupan entre 4,5 y 5,5 GB por GPU, dejando margen para KV cache y overhead.
- GPU recomendadas: 4x RTX 3090 (24 GB) con tensor parallelism es la configuración validada en la model card. También se menciona una receta para una sola RTX PRO 4000 Blackwell (TP1) con TabbyAPI, aunque no se detalla la VRAM exacta.
- En consumer GPU: es viable con múltiples GPUs de 24 GB (por ejemplo, 2x RTX 3090 o 4090) usando TP2, o con una sola GPU de 48 GB (como RTX 6000 Ada) en TP1. No se ha validado en GPUs de 16 GB o menos.
- Opciones de despliegue: TabbyAPI con backend exllamav3 (validado), o vLLM con `--quantization exl3`. También es compatible con ExLlamaV3 directamente.
- Latencia y throughput: en 4x RTX 3090 TP4, ~50 tok/s en un solo stream y ~180 tok/s agregados con concurrencia 4. El modo de razonamiento (thinking) puede aumentar la latencia percibida por petición.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros totales | Parametros activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B (base) | MoE | ~35B | ~3B | 262K | MIT | Supera a Qwen 3.6-35B en coding y agéntico |
| Qwen 3.6-35B | MoE | ~35B (estimado) | no disponible | no disponible | no disponible | Referencia de tamaño similar |
| Gemma 4-31B | Denso | ~31B | ~31B | no disponible | no disponible | Superado por Ornith en coding agéntico |
| Muse Glimmer-30B | Denso | ~30B | ~30B | no disponible | no disponible | Superado por Ornith en coding agéntico |

No se dispone de datos completos de los competidores en la información proporcionada. La comparativa se basa en las afirmaciones de la documentación del modelo base, sin cifras de benchmarks concretas.

## Limitaciones y advertencias

- Cuantización comunitaria no oficial: no está respaldada por ornith-ai; puede haber diferencias de comportamiento frente al modelo BF16 original, aunque las métricas de fidelidad son buenas (KL 0,0540).
- Requiere parche de runtime para tensor parallelism: exllamav3 1.4.3 tiene un bug en `tp_import_split_n` que provoca `KeyError: 'suh'` al cargar proyecciones GatedDeltaNet sin cuantizar; es necesario aplicar el diff indicado en la model card.
- Bug de conversión con Triton 3.6.0: el autotuner puede fallar por reentrada; se recomienda capturar `nargs` en una variable local si ocurre.
- `max_batch_size` debe cubrir la concurrencia esperada: las capas GatedDeltaNet mantienen estado recurrente por secuencia; el valor por defecto de 4 slots se agota rápidamente con peticiones paralelas.
- El modo de razonamiento (thinking) puede aumentar la latencia y el consumo de tokens de salida; hay que configurar el parser de razonamiento en el servidor si se quiere separar el chain-of-thought.
- Sesgos y alucinaciones: no se documentan sesgos específicos, pero como modelo de razonamiento generativo, existe riesgo de alucinación en tareas factuales; se recomienda validación externa en producción.
- Limitaciones de idioma: no se especifican idiomas soportados; el rendimiento en lenguas minoritarias no está garantizado.
- Licencia MIT permite uso comercial sin restricciones, pero la cuantización no incluye garantías de soporte ni mantenimiento.

## Enlaces

- [HuggingFace - 0xSero/Ornith-1.5-35B-A3B-EXL3-3.5bpw](https://huggingface.co/0xSero/Ornith-1.5-35B-A3B-EXL3-3.5bpw)
- [HuggingFace - ornith-ai/Ornith-1.5-35B-A3B (modelo base)](https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B)
- [HuggingFace - ornith-ai/Ornith-1.5-35B-A3B-FP8](https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B-FP8)
- [ModelScope - Ornith-1.5-35B-A3B](https://www.modelscope.cn/models/ornith-ai/Ornith-1.5-35B-A3B)
- [Docker Hub - ai/ornith-1.5](https://hub.docker.com/r/ai/ornith-1.5)
- [GitHub - receta EXL3 4bpw para RTX PRO 4000](https://github.com/0xSero/local-ai-registry/blob/main/local-ai/recipes/ornith15-35b-a3b-exl3-4bpw-rtxpro4000-tabbyapi-tp1.json)
