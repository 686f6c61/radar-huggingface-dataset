# AlekseyCalvin/BISTRO_CPT_TinyStories_ckpt8_16_test

## Resumen

BISTRO_CPT_TinyStories_ckpt8_16_test es un adaptador LoRA (PEFT) publicado por el usuario AlekseyCalvin sobre el modelo base HuggingFaceTB/SmolLM2-135M, un transformer decoder-only de 135 millones de parámetros. El adaptador se ha producido mediante un proceso de preentrenamiento continuado (CPT, *continued pretraining*) sobre el dataset `roneneldan/TinyStories`, con un total de 32 filas de entrenamiento en modo streaming y 17 pasos de optimización. Se trata, por tanto, de un artefacto experimental y no de un modelo destinado a producción.

El interés técnico del repositorio no está en sus capacidades lingüísticas, sino en la metodología: documenta un flujo completo de entrenamiento en CPU usando la herramienta "Small LM Bistro" (v2.2), con LoRA de rango 8 y alpha 16 aplicado solo a `q_proj` y `v_proj`, optimizador `CPUBlockwiseQuantizedAdamW`, scheduler coseno y guardado de checkpoints en los pasos 8 y 16 con estados del optimizador incluidos. El repositorio ocupa 0,5 GB, un tamaño desproporcionado para un adaptador de este rango, explicable precisamente por esos estados de optimizador.

El dato más relevante para cualquier evaluador es la pérdida final declarada: 126,4502 tras 17 pasos. Es un valor órdenes de magnitud por encima de lo que se considera convergencia en un modelo de lenguaje, lo que indica que el adaptador no ha aprendido representaciones útiles y que su uso directo degradará la salida del modelo base. La ficha se completa, por tanto, con advertencias explícitas y con la indicación de "no disponible" en todos los campos que el autor no ha documentado (licencia, idiomas, contexto, benchmarks).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base SmolLM2-135M) con adaptadores LoRA (PEFT) sobre `q_proj` y `v_proj` |
| Parametros totales | 135M en el modelo base; número de parámetros del adaptador no disponible en la información proporcionada |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No disponible en la model card (depende del modelo base SmolLM2-135M, no confirmado en la información proporcionada) |
| Tipos de cuantizacion | No disponible. El adaptador se distribuye en `safetensors`; la cuantización requeriría fusionar con el base y convertir a GGUF/AWQ/GPTQ por cuenta del usuario |
| Idiomas soportados | No declarados. El dataset de entrenamiento (`TinyStories`) está en inglés |
| Licencia | No disponible (la model card no especifica licencia; el modelo base SmolLM2-135M sí tiene licencia propia publicada) |
| Formato de pesos | `safetensors` (adaptador LoRA PEFT); requiere descargar el modelo base `HuggingFaceTB/SmolLM2-135M` por separado |
| Libreria | `peft` (compatible con `transformers` y `trl`) |
| Dataset de entrenamiento | `roneneldan/TinyStories`, 32 filas, `streaming=True`, `shuffled=True` |
| Hiperparametros LoRA | `r=8`, `alpha=16`, `targets=q_proj, v_proj`, `responses_only=False` |
| Optimizador y scheduler | `CPUBlockwiseQuantizedAdamW` (lr=5.00e-05, emb_lr=5.0e-06, cosine) |
| Checkpoints incluidos | Pasos 8 y 16 (`save_strategy=steps`, `save_steps=8`, `hub_strategy=every_save`, `optimizer_state=True`) |
| Tamano del repositorio | 0,5 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura efectiva es la del modelo base: un transformer decoder-only de 135M de parámetros de la familia SmolLM2, sobre el que se insertan matrices de bajo rango en las proyecciones de query y value de cada capa de atención. Con `r=8` y `alpha=16`, el escalado efectivo es de 2,0 sobre la contribución del adaptador. La elección de `q_proj` y `v_proj` como únicos objetivos corresponde al perfil "Fast CPU" de la herramienta de entrenamiento, que reduce el número de operaciones de retropropagación a costa de no adaptar las proyecciones de salida ni las capas MLP. El flag `responses_only=False` implica que la pérdida se calcula sobre la secuencia completa (prompt y respuesta), no solo sobre la respuesta.

El entrenamiento se ejecutó íntegramente en CPU, sobre 2 vCPUs Xeon, con una velocidad de 12,05 s/paso y un total de 204,8 s para 17 pasos. El optimizador `CPUBlockwiseQuantizedAdamW` es una variante de AdamW con estados cuantizados por bloques, pensada para reducir el consumo de memoria RAM en entrenamiento sin GPU. El dataset es TinyStories, un corpus sintético de cuentos infantiles en inglés generado con GPT-3.5/GPT-4 y diseñado para estudiar la adquisición de capacidades lingüísticas en modelos pequeños; aquí se ha usado con solo 32 filas, lo que descarta cualquier efecto de aprendizaje significativo. La pérdida final de 126,4502 es coherente con un régimen de entrenamiento insuficiente o mal inicializado: en un modelo de vocabulario de decenas de miles de tokens, una entropía cruzada de dos dígitos indica que la distribución predicha está muy lejos de la de los datos. No se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, RLHF/DPO u otras).

## Capacidades

- Generación de texto autoregresiva heredada del modelo base SmolLM2-135M; el adaptador no añade capacidades nuevas y, con la pérdida declarada, previsiblemente las degrada.
- Continuación de texto breve en inglés, orientada al dominio de cuentos infantiles simples por el dataset utilizado (32 filas, efecto muy limitado).
- No hay evidencia documentada de soporte de tool calling ni function calling.
- No hay evidencia documentada de capacidades de agente, razonamiento multi-paso ni modo "thinking".
- No hay evidencia documentada de capacidades multimodales (visión, audio) ni de matemáticas o código más allá de lo que pueda aportar el modelo base.
- Capacidades multilingües: no declaradas; el corpus de entrenamiento es monolingüe en inglés.
- El adaptador es cargable con `peft`/`transformers` y acoplable a pipelines existentes del modelo base, lo que constituye su principal utilidad práctica como artefacto de prueba.

## Casos de uso

- Reproducción de pipelines de CPT en CPU: sirve para verificar de extremo a extremo un flujo de preentrenamiento continuado con LoRA y TRL sin disponer de GPU, comprobando que la carga del dataset en streaming, el guardado de checkpoints y la publicación en el Hub funcionan.
- Docencia y formación técnica: es un ejemplo compacto y rápido (204,8 s de entrenamiento) para ilustrar en un curso qué es un adaptador LoRA, cómo se configura `r`/`alpha` y por qué una pérdida de 126 indica fracaso del entrenamiento.
- Pruebas de integración (smoke tests) en servidores de inferencia: validar que vLLM, TGI o el servidor de HuggingFace cargan correctamente adaptadores PEFT multi-adaptador sobre SmolLM2-135M antes de desplegar adaptadores reales.
- Validación de estrategias de guardado y reanudación: el repositorio incluye dos checkpoints con estados del optimizador (`optimizer_state=True`), lo que permite probar la reanudación de un entrenamiento desde un checkpoint intermedio y comprobar la consistencia de los estados.
- Experimentos de eficiencia en hardware modesto: medir coste energético y tiempo por paso de un entrenamiento con `CPUBlockwiseQuantizedAdamW` en 2 vCPUs, como基线 para comparar con otras configuraciones de cuantización de optimizador.
- Generación de texto sintético trivial para pruebas de ingesta de datos: producir cadenas de texto cortas que permitan validar esquemas de tokenización, pipelines de limpieza o visores de datasets, aceptando que la calidad del contenido será baja.
- Prototipado de aplicaciones de narración infantil: punto de partida para un fine-tuning posterior con muchas más filas de TinyStories, no utilizable tal cual en un producto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones en MMLU, HumanEval, GSM8K, HellaSwag ni ninguna otra tarea estándar, y tampoco se ha publicado una comparación con el modelo base que permita medir la degradación introducida por el adaptador.

Las únicas métricas registradas son de entrenamiento:

| Metrica | Valor |
|---|---|
| Pasos totales | 17 |
| Tiempo total | 204,8 s |
| Tiempo por paso | 12,05 s (2 vCPUs Xeon) |
| Pérdida final | 126,4502 |
| Filas del dataset | 32 |
| Checkpoints guardados | Pasos 8 y 16 |
| Learning rate | 5,00e-05 (embeddings: 5,0e-06, cosine) |

## Requisitos de hardware

- VRAM estimada para el modelo base de 135M parámetros: aproximadamente 540 MB en FP32, 270 MB en FP16/BF16, 135 MB en INT8 y 68 MB en INT4, sin contar KV cache ni las activaciones. El adaptador LoRA añade un coste marginal (menos de 2 MB).
- Cabe en cualquier GPU de consumo: RTX 3060/4060, GTX 1660, GTX 1050 Ti, e incluso en iGPU con memoria unificada. También es viable en CPU pura y en placas tipo Raspberry Pi 5 con cuantización INT8/INT4.
- GPU profesionales: A100, H100 o L40S están completamente sobredimensionadas para este modelo; solo tendrían sentido para servir muchas réplicas concurrentes.
- Opciones de despliegue: `transformers` + `peft` (ruta nativa, carga del adaptador sobre el base), fusión del adaptador con `merge_and_unload()` y conversión a GGUF para `llama.cpp` u Ollama, vLLM con soporte de adaptadores LoRA, y TGI. No hay pesos GGUF publicados en el repositorio.
- Latencia y throughput: no disponibles. El único dato de rendimiento es el de entrenamiento (12,05 s/paso en 2 vCPUs), que no es extrapolable a inferencia.
- El repositorio de 0,5 GB incluye los estados del optimizador de dos checkpoints, por lo que el espacio en disco necesario para servirlo es muy inferior al tamaño del repo una vez extraído solo el adaptador.

## Comparativa con modelos similares

Los datos de las alternativas provienen de la documentación pública de cada modelo base, no de la información proporcionada sobre este repositorio; se incluyen como referencia de categoría.

| Modelo | Parametros | Contexto declarado | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BISTRO_CPT_TinyStories_ckpt8_16_test | 135M (base) + adaptador LoRA | No disponible | Adaptador PEFT sobre SmolLM2-135M | No disponible | HuggingFace, 0 descargas |
| SmolLM2-135M (modelo base) | 135M | 8.192 tokens (documentación pública) | Transformer denso | Publicada por HuggingFaceTB (no indicada aquí) | HuggingFace, ampliamente usado |
| SmolLM2-360M | 362M | 8.192 tokens (documentación pública) | Transformer denso | Publicada por HuggingFaceTB | HuggingFace |
| Qwen2.5-0.5B | 494M | 32.768 tokens (documentación pública) | Transformer denso | Apache-2.0 | HuggingFace |
| TinyLlama-1.1B | 1,1B | 2.048 tokens (documentación pública) | Transformer denso | Apache-2.0 | HuggingFace |

En la práctica, la comparación relevante es contra el propio SmolLM2-135M sin adaptador: cualquier evaluación A/B con `peft` mostraría previsiblemente que el adaptador empeora la perplejidad del base, dado el valor de pérdida registrado.

## Limitaciones y advertencias

- Entrenamiento no convergente: la pérdida final de 126,4502 tras 17 pasos indica que el adaptador no ha aprendido y que su aplicación degradará la calidad de generación del modelo base. No debe usarse como modelo de inferencia.
- Corpus ínfimo: 32 filas de entrenamiento (frente a los cientos de miles o millones habituales en CPT) hacen imposible cualquier generalización; el resultado es, como mucho, un sobreajuste a un puñado de cuentos.
- Sin evaluación: no hay benchmarks, ni perplejidad sobre un conjunto de validación, ni comparación con el base, por lo que no se puede cuantificar el daño real.
- Licencia no disponible: la ausencia de licencia explícita impide determinar si el uso comercial está permitido. Antes de cualquier uso en producción hay que consultar al autor y verificar la licencia del modelo base SmolLM2-135M.
- Idiomas no declarados: el único corpus utilizado está en inglés, por lo que no hay ninguna garantía de comportamiento en castellano ni en otras lenguas.
- Sesgos: no documentados. TinyStories es un corpus sintético generado por modelos propietarios, con los sesgos de estilo y contenido que ello implica, y el autor no publica ninguna evaluación al respecto.
- Riesgo de alucinación: alto en cualquier modelo de 135M, y agravado aquí por el estado del adaptador; no es apto para tareas de recuperación de hechos ni de atención al usuario.
- Naturaleza de prueba: el propio nombre del repositorio incluye "test" y el tag `cpu-trained`; no hay pipeline declarado, ni descargas, ni likes, ni issues que permitan inferir validación por parte de terceros.
- Dependencia del modelo base: el adaptador no es autónomo; requiere descargar SmolLM2-135M y cargarlo con `peft`, lo que añade un paso de configuración y una fuente adicional de incompatibilidades de versión.
- Tamaño del repositorio: 0,5 GB para un adaptador de rango 8 se debe a los estados del optimizador incluidos; conviene no confundirlo con el tamaño real del artefacto de inferencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AlekseyCalvin/BISTRO_CPT_TinyStories_ckpt8_16_test
- Modelo base SmolLM2-135M: https://huggingface.co/HuggingFaceTB/SmolLM2-135M
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
- Herramienta "Small LM Bistro" (v2.2): no se proporciona enlace en la model card
- Paper o blog del autor: no disponible
- Repositorio de código o demo: no disponible
- Nota sobre la búsqueda web: los resultados devueltos por la búsqueda no guardan relación con este modelo (contenido no técnico y ajeno al repositorio), por lo que se han descartado y no se enlazan.
