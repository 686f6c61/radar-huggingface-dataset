# mdcreativeagent/Qwen3-30B-A3B-Base

## Resumen

Qwen3-30B-A3B-Base es un modelo de lenguaje causal de tipo mixture-of-experts (MoE) desarrollado por el equipo Qwen (Alibaba). Forma parte de la generacion Qwen3, que sustituye a Qwen2.5, y esta pensado como modelo base preentrenado (no instruido, sin alineamiento) para servir de punto de partida a ajustes posteriores. Su interes principal reside en la relacion entre parametros totales y activos: 30.532 millones de parametros en total, de los cuales solo unos 3.300 millones se activan por token, lo que permite un coste de inferencia cercano al de un modelo denso de 3B con una capacidad de representacion mucho mayor.

La arquitectura es un transformer decoder-only con 48 capas, atencion con grouped-query attention (32 cabezas de query y 4 de key/value) y 128 expertos por capa de los que se activan 8 en cada paso. El modelo se ha preentrenado sobre 36 billones de tokens en 119 idiomas, con una tercera fase de preentrenamiento que extiende la longitud de secuencia hasta 32.768 tokens, que es tambien su ventana de contexto final.

Este repositorio concreto (`mdcreativeagent/Qwen3-30B-A3B-Base`) es una reproduccion o espejo del modelo oficial publicado por el equipo Qwen bajo licencia Apache 2.0. No tiene descargas ni likes en el momento de la consulta y su utilidad practica depende de que los pesos coincidan con los del checkpoint original; para produccion conviene verificar la integridad y, si es posible, usar el repositorio oficial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con mixture-of-experts (MoE), 48 capas, GQA (32 Q / 4 KV) |
| Parametros totales | 30.532.122.624 (30,5B); 29,9B sin embeddings |
| Parametros activos | 3,3B por token (8 de 128 expertos activados) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors en precision original; no se documentan GGUF/AWQ/GPTQ) |
| Idiomas soportados | 119 idiomas durante el preentrenamiento (segun model card); no se detalla lista |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers, `qwen3_moe`) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con capas MoE: cada bloque contiene 128 expertos y un router que selecciona 8 por token, lo que da 3,3B parametros activos sobre 30,5B totales. Usa grouped-query attention con 32 cabezas de query y 4 de key/value, lo que reduce el coste de memoria del KV cache. La model card menciona dos refinamientos tecnicos relevantes: una perdida de balanceo de carga a nivel de batch global para los modelos MoE y qk layernorm en todas las capas, orientados a mejorar la estabilidad del entrenamiento.

El preentrenamiento se estructura en tres fases: la primera cubre modelado de lenguaje general y conocimiento amplio; la segunda refuerza razonamiento STEM, codigo y logica; la tercera extiende la longitud de secuencia hasta 32k tokens para mejorar la comprension de contexto largo. El corpus total es de 36 billones de tokens en 119 idiomas, con mezcla de datos de codigo, STEM, razonamiento, libros, multilingue y datos sinteticos. Los hiperparametros (learning rate, batch size) se ajustaron mediante estudios de scaling law separados para modelos densos y MoE. Al ser un modelo base, no consta que se haya aplicado RLHF ni DPO.

## Capacidades

- Generacion de texto y modelado de lenguaje causal en 119 idiomas.
- Razonamiento STEM y logico reforzado en la segunda fase de preentrenamiento.
- Generacion y comprension de codigo, con datos especificos en el corpus.
- Comprension de contexto largo hasta 32.768 tokens.
- Capacidad de servir como base para fine-tuning supervisado y posteriores etapas de alineamiento.
- No dispone de modo thinking, vision, audio ni tool calling nativo: al ser un checkpoint base, estas capacidades dependen del post-entrenamiento que se le aplique.
- No incluye plantilla de chat ni comportamiento conversacional alineado por defecto.

## Casos de uso

- Fine-tuning supervisado para dominios verticales: al ser un modelo base con licencia Apache 2.0, se puede ajustar con datasets propios (legal, sanitario, financiero) sin restricciones de uso comercial, aprovechando que solo 3,3B parametros se activan por token para mantener costes de entrenamiento y serving contenidos.
- Serving de bajo coste en produccion: con 3,3B parametros activos, el throughput por GPU es mucho mayor que el de un denso de 30B, lo que lo hace adecuado para APIs de generacion de texto con alta concurrencia y contexto de hasta 32k tokens.
- Generacion de codigo asistida: tras un ajuste con datos de codigo, puede integrarse en asistentes de programacion o pipelines de CI/CD para generar tests, documentacion o parches, aunque el tool calling debe implementarse mediante prompting o un wrapper externo.
- Procesamiento de documentos largos: la ventana de 32.768 tokens permite resumir contratos, informes tecnicos o articulos cientificos completos en una sola pasada, algo util para pipelines de extraccion de informacion.
- Investigacion en arquitecturas MoE: el modelo es un banco de pruebas realista para estudiar routing, balanceo de carga y eficiencia de expertos a escala de 30B con 128 expertos.
- Traduccion y procesamiento multilingue: los 119 idiomas del preentrenamiento permiten construir sistemas de traduccion o clasificacion multilingue mediante fine-tuning ligero, sin necesidad de entrenar desde cero.
- Destilacion y generacion de datos sinteticos: puede emplearse como profesor para generar datasets de entrenamiento para modelos mas pequenos en dominios especificos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al blog oficial de Qwen3 para las evaluaciones detalladas, pero no incluye cifras en el repositorio consultado.

## Requisitos de hardware

- VRAM para inferencia en BF16/FP16: aproximadamente 61 GB solo para pesos, mas KV cache y activaciones; en la practica se necesitan 70-80 GB, es decir, una A100 80GB, H100 80GB o dos GPU de 48 GB.
- Cuantizacion a 8 bits: alrededor de 30-32 GB de pesos, viable en una RTX 4090 de 24 GB solo con cuantizacion a 4 bits.
- Cuantizacion a 4 bits: aproximadamente 15-17 GB de pesos, lo que permite ejecucion en una RTX 4090 o RTX 3090 de 24 GB, con margen limitado para contexto largo.
- GPU recomendadas para produccion: H100 80GB, A100 80GB, L40S 48GB (con cuantizacion) o multiples RTX 4090 para despliegues pequenos.
- Opciones de despliegue: transformers (version >= 4.51.0, requerida para `qwen3_moe`), vLLM, TGI y llama.cpp/Ollama si se generan cuantizaciones GGUF (no incluidas en el repo).
- Latencia y throughput: no disponibles en la informacion proporcionada; el bajo numero de parametros activos (3,3B) anticipa un throughput superior al de un denso de 30B, pero no hay cifras publicadas en el repositorio consultado.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3-30B-A3B-Base (este repo) | 30,5B / 3,3B | 32.768 | Apache 2.0 | Hugging Face (espejo de `mdcreativeagent`) |
| Qwen3-30B-A3B (oficial, con post-entrenamiento) | 30,5B / 3,3B | 32.768 | Apache 2.0 | Hugging Face (Qwen) |
| Qwen2.5-32B | 32,5B denso | 131.072 | Apache 2.0 (la mayoria de variantes) | Hugging Face (Qwen) |
| Mixtral 8x7B | 46,7B / 12,9B | 32.768 | Apache 2.0 | Hugging Face (Mistral AI) |

La comparacion con Qwen3-30B-A3B oficial es la mas directa: mismo tamano y contexto, pero el oficial incluye post-entrenamiento y modos de razonamiento que este checkpoint base no tiene. Frente a Qwen2.5-32B, este modelo ofrece menor coste por token gracias al MoE, aunque con una ventana de contexto menor (32k frente a 128k). Frente a Mixtral 8x7B, activa muchos menos parametros por token (3,3B frente a 12,9B) con un contexto equivalente.

## Limitaciones y advertencias

- Es un modelo base sin alineamiento: puede generar contenido sesgado, toxico o factualmente incorrecto y no sigue instrucciones de forma fiable sin fine-tuning.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no debe usarse en produccion sin validacion y filtros.
- La model card no detalla sesgos conocidos ni evaluaciones de seguridad; no hay datos sobre comportamiento en dominios sensibles.
- Ventana de contexto limitada a 32.768 tokens; textos mas largos requieren truncado o estrategias de chunking.
- La lista de 119 idiomas no se detalla; el rendimiento real por idioma puede variar mucho y no esta documentado.
- El repositorio consultado no es el oficial del equipo Qwen: tiene 0 descargas y 0 likes, por lo que conviene verificar la integridad de los pesos antes de usarlo en produccion.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe cumplir las obligaciones de atribucion y no existe garantia del autor sobre el modelo.
- No se documentan cuantizaciones oficiales (GGUF, AWQ, GPTQ); habria que generarlas y validarlas por cuenta propia.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/mdcreativeagent/Qwen3-30B-A3B-Base
- Blog oficial de Qwen3: https://qwenlm.github.io/blog/qwen3/
- Repositorio GitHub de Qwen3: https://github.com/QwenLM/Qwen3
- Documentacion de Qwen: https://qwen.readthedocs.io/en/latest/
- Paper tecnico (arXiv 2505.09388): https://arxiv.org/abs/2505.09388
