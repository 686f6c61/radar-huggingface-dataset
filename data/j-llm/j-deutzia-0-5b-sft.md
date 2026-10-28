# j-llm/J-Deutzia-0.5B-SFT

## Resumen

J-Deutzia-0.5B-SFT es un modelo de generación de texto en japonés desarrollado por el usuario j-llm, publicado bajo licencia Apache 2.0. Se trata de la versión ajustada con supervisión (SFT) del modelo base J-Deutzia-0.5B-Base, y está diseñado para usarse en formato de chat con las marcas de turno «### ユーザー:» y «### アシスタント:». Su interés técnico radica en que aplica una arquitectura de mezcla de expertos (MoE) a una escala muy reducida: la model card declara 469 M de parámetros totales con solo 199 M activos por token, mediante 4 expertos y enrutado top-1, lo que en teoría abarata el coste de inferencia frente a un modelo denso equivalente.

El modelo tiene 14 capas, un vocabulario de 72.000 tokens y una ventana de contexto declarada de 16.384 tokens. Sin embargo, el recuento real de parámetros en los pesos safetensors publicados es de 533.745.408 (~534 M), una cifra superior a los 469 M anunciados en la model card; esta discrepancia no está explicada por el autor y conviene tenerla en cuenta al planificar el despliegue.

Su relevancia es principalmente exploratoria: se trata de un experimento de MoE de bajo coste en un idioma distinto del inglés, con código de carga no estándar (la clase `MoEProbeLM` debe importarse desde el propio repositorio) y sin resultados de evaluación publicados. No es un modelo listo para producción sin una validación previa por parte del equipo que lo adopte.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), clase `MoEProbeLM` (`config.json`), tag `gpt2moe`, 14 capas |
| Parámetros totales | 533.745.408 (~534 M) según safetensors; la model card declara 469 M |
| Parámetros activos | 199 M (4 expertos, enrutado top-1) según model card |
| Longitud de contexto | 16.384 tokens (declarado en model card) |
| Tipos de cuantización | no disponible (solo se publican pesos safetensors; no hay GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | japonés (`ja`) |
| Licencia | Apache 2.0 |
| Formato de pesos | `safetensors` (`model.safetensors`) + `config.json` |
| Vocabulario | 72.000 tokens (según model card) |
| Tamaño del repositorio | 2,1 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer de 14 capas con capas de mezcla de expertos: 4 expertos por bloque con enrutado top-1, de modo que cada token activa un único experto. El autor declara 469 M de parámetros totales y 199 M activos, lo que sitúa el coste computacional por token en el orden de un modelo denso de ~200 M. El vocabulario es de 72.000 tokens, adecuado para japonés, y el contexto declarado alcanza los 16.384 tokens. Los pesos se cargan mediante una clase propia (`MoEProbeLM` / `MoELMConfig`) incluida en el directorio `code` del repositorio, no mediante `transformers`, y con `strict=False`, lo que implica que parte del `state_dict` puede no coincidir con el modelo definido.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del corpus, las técnicas de alineación empleadas (RLHF, DPO u otras) ni los detalles del proceso de SFT más allá de la existencia de la versión ajustada y del formato de chat. Tampoco se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, etc.). La model card menciona un `ReversibleSentencePieceAdapter` y el script `code/scripts/j72v2_gen_eval.py` para la generación, lo que sugiere un tokenizador SentencePiece con adaptador propio.

## Capacidades

- Generación de texto en japonés, con ajuste específico para formato conversacional de dos turnos («### ユーザー:» / «### アシスタント:»).
- Razonamiento y respuesta a instrucciones: capacidad esperable por el SFT, aunque no verificada con benchmarks públicos.
- Contexto largo: ventana declarada de 16.384 tokens, útil para documentos o historiales de conversación extensos en japonés.
- Inferencia eficiente: al activar solo 199 M de parámetros por token, el coste de cómputo es inferior al de un modelo denso de tamaño similar.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multimodales (visión, audio): no disponibles.
- Modo «thinking» explícito: no disponible.

## Casos de uso

- Prototipado de asistentes conversacionales en japonés: el formato de chat ya definido y la ventana de 16.384 tokens permiten mantener historiales largos en pruebas de concepto sin infraestructura dedicada.
- Investigación sobre MoE de baja escala: sirve como banco de pruebas para estudiar enrutado top-1 con 4 expertos en modelos por debajo de 1.000 M de parámetros, comparando la calidad frente a un denso de ~200 M activos.
- Generación de texto japonés en entornos con CPU: con ~534 M de parámetros, la inferencia en fp32 o int8 es viable en un servidor sin GPU, lo que facilita pruebas internas y despliegues de bajo tráfico.
- Procesamiento de documentos largos en japonés: la ventana de 16.384 tokens permite resumir o extraer información de textos que superan el contexto típico de 2.048-4.096 tokens de modelos pequeños comparables.
- Fine-tuning específico de dominio: al estar bajo Apache 2.0 y ser un modelo pequeño, es adecuado como base para ajustes en dominios verticales japoneses (atención al cliente, documentación técnica) con presupuesto de cómputo reducido.
- Evaluación comparativa de tokenizadores japoneses: el vocabulario de 72.000 tokens y el adaptador SentencePiece permiten analizar la eficiencia de compresión de texto japonés frente a tokenizadores multilíngües de mayor tamaño.
- Generación de datos sintéticos en japonés para aumentar corpus de entrenamiento, con revisión humana obligatoria dado el riesgo de alucinación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones en japonés (JGLUE, JCommonsenseQA u otras), y la búsqueda web realizada no ha devuelto resultados relevantes sobre el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: ~1,1 GB solo para pesos (534 M × 2 bytes), con overhead de caché KV y activaciones hasta ~1,5-2 GB en contexto largo.
- VRAM estimada en int8: ~0,55 GB de pesos; en int4: ~0,3 GB. No hay cuantizaciones publicadas, por lo que habría que generarlas.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más (RTX 3050, RTX 4060, RTX 4090) es suficiente; para lotes grandes o contexto de 16.384 tokens conviene partir de 8-12 GB (RTX 4070, L4). En A100/H100 el modelo queda enormemente sobredimensionado en cuanto a memoria, aunque puede aprovecharse para servir muchos lotes concurrentes.
- Inferencia en CPU: viable, dado el tamaño; el repositorio ocupa 2,1 GB, pero los pesos en fp32 son ~2,1 GB y en fp16 ~1,1 GB.
- Opciones de despliegue: no se puede usar `transformers` de forma estándar; es necesario el código del repositorio (`code/canonical_corpus/probe_moe_lm.py`, `MoELMConfig`, `MoEProbeLM`) y cargar con `safetensors.torch.load_file` y `strict=False`. No hay soporte documentado en vLLM, TGI, llama.cpp ni Ollama, y no se publican ficheros GGUF, por lo que la conversión a esos formatos requeriría trabajo adicional.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Idiomas | Disponibilidad |
|---|---|---|---|---|---|---|
| J-Deutzia-0.5B-SFT | ~534 M (safetensors) / 469 M (model card) | 199 M | 16.384 | Apache 2.0 | Japonés | Pesos safetensors, carga con código propio |
| Qwen2.5-0.5B-Instruct | ~494 M | Denso | 32.768 | Apache 2.0 | Multilingüe (incluye japonés) | Pesos safetensors, soporte en `transformers`, vLLM, llama.cpp y Ollama |
| TinyLlama-1.1B-Chat | ~1,1 B | Denso | 2.048 | Apache 2.0 | Principalmente inglés | Pesos safetensors y GGUF, amplio soporte de herramientas |

Nota: los datos de Qwen2.5-0.5B-Instruct y TinyLlama-1.1B-Chat proceden de sus respectivas model cards públicas y se incluyen solo como referencia de categoría; no se dispone de comparaciones de rendimiento verificadas frente a J-Deutzia-0.5B-SFT. No se han identificado otros modelos MoE públicos de menos de 1.000 M de parámetros con datos contrastados para una comparación directa.

## Limitaciones y advertencias

- Solo japonés: no hay evidencia de capacidades en castellano ni en otros idiomas; el vocabulario de 72.000 tokens está orientado al japonés.
- Etiqueta `not-for-all-audiences`: el autor marca el modelo con esta advertencia, lo que implica que las salidas pueden contener contenido no apto para todos los públicos y exige filtrado en cualquier despliegue abierto.
- Riesgo de alucinación: al ser un modelo de ~500 M entrenado presumiblemente con un volumen de tokens modesto, la generación de hechos inventados es esperable; no se han publicado evaluaciones de fidelidad.
- Discrepancia en el recuento de parámetros: 469 M declarados frente a 533.745.408 reales en safetensors. Puede indicar pesos no utilizados, embeddings no atados o un error de documentación; conviene verificarlo antes de dimensionar infraestructura.
- Carga no estándar: requiere importar código del propio repositorio y usar `strict=False`, lo que puede ocultar parámetros no cargados correctamente y dificulta la reproducibilidad.
- Sin benchmarks: no existen métricas publicadas que permitan estimar la calidad frente a alternativas; cualquier decisión de adopción debe basarse en una evaluación propia.
- Madurez baja: 0 descargas y 0 «likes» en el momento de la consulta, sin comunidad ni soporte documentado.
- Licencia Apache 2.0: permite uso comercial y modificaciones con atribución y conservación del aviso de licencia; no obstante, la licencia no cubre las obligaciones derivadas de la generación de contenido y del filtrado de salidas.
- Sin cuantizaciones oficiales ni soporte en motores de inferencia habituales, lo que limita el despliegue en producción sin trabajo de ingeniería adicional.

## Enlaces

- HuggingFace: https://huggingface.co/j-llm/J-Deutzia-0.5B-SFT
- Repositorio de código de carga y generación (incluido en el propio repo): `code/canonical_corpus/probe_moe_lm.py` y `code/scripts/j72v2_gen_eval.py`
- No se han encontrado papers, blogs, repositorios externos ni demos en la búsqueda web realizada; los resultados obtenidos correspondían a la letra «J» y no guardan relación con el modelo.
