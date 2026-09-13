# Ronnied1588/Qwen2.5-7B-Instruct-heretic

## Resumen

Qwen2.5-7B-Instruct-heretic es una variante "abliterated" (decensored) del modelo Qwen2.5-7B-Instruct de Alibaba Cloud. La abliteración, es decir, la eliminación selectiva de las direcciones de activación responsables del comportamiento de rechazo, se realizó con la herramienta Heretic v1.2.0 de Philipp Emanuel Weidmann. El artefacto fue generado y cuantizado por el usuario LeadFootThrottleCock y está republicado en el repositorio Ronnied1588/Qwen2.5-7B-Instruct-heretic, que según los datos de HuggingFace contiene pesos en safetensors (7.612.756.480 parámetros, 15,2 GB de repositorio), aunque la model card describe el conjunto de cuantizaciones GGUF derivadas.

Arquitectónicamente es un transformer decoder-only denso de la familia Qwen2, con 28 capas, atención con query grouping (GQA), RoPE, SwiGLU y RMSNorm, idéntico en estructura al modelo base; lo único que cambia respecto a este son los pesos de las proyecciones `attn.o_proj` y `mlp.down_proj` de cada capa, modificados por el proceso de abliteración. El autor reporta un KL divergence de 0,0820 frente al base y una tasa de rechazo de 7/100 en el conjunto de evaluación mlabonne/harmful_behaviors, métricas que sitúan el modelo como un caso de "capacidad preservada, alineamiento eliminado".

Su relevancia es doble: por un lado interesa a quienes necesitan un modelo de 7B sin filtros de rechazo para escritura creativa, análisis de temas sensibles o investigación en seguridad de IA; por otro, es un ejemplo reproducible de la metodología Heretic, que automatiza la búsqueda de hiperparámetros de abliteración mediante optimización TPE con Optuna en lugar de requerir ajuste manual. La licencia Apache 2.0 heredada del base permite uso comercial, pero el modelo se distribuye sin ninguna capa de seguridad, con 0 descargas y 0 "likes" en el momento de la consulta y sin benchmarks estándar publicados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen2): 28 capas, GQA, RoPE, SwiGLU, RMSNorm |
| Parámetros totales | 7.612.756.480 (7,61 B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens en la configuración por defecto de Qwen2.5-7B; ampliable hasta 131.072 con YaRN. Dato heredado del modelo base: la model card del repositorio no lo especifica |
| Tipos de cuantización | GGUF: BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M. Safetensors en BF16 |
| Idiomas soportados | `en` según la model card del repositorio; el modelo base Qwen2.5 es multilingüe (más de 29 idiomas), pero no hay verificación de que esa capacidad se conserve tras la abliteración |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) y GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-7B-Instruct, un transformer denso de 28 capas con 28 cabezas de atención y 4 cabezas KV (GQA), dimensión oculta de 3584, hidden size de FFN de 18.944 y vocabulario de aproximadamente 152.000 tokens. Según la documentación pública de la familia Qwen2.5, el base se preentrenó con 18 billones de tokens y se alineó posteriormente mediante ajuste supervisado y optimización por preferencias; este dato corresponde al modelo original y no a la variante heretic, cuya model card no detalla el pipeline de alineamiento del base.

La intervención consiste en abliteración direccional optimizada: se identifican direcciones de activación asociadas al rechazo y se proyectan fuera de los pesos de dos componentes ablacionables por capa, `attn.o_proj` y `mlp.down_proj` (1 por capa, 28 capas cada uno). La búsqueda de hiperparámetros se hizo con TPE sobre Optuna, con 200 ensayos totales (60 de arranque y 140 guiados), tamaño de lote 128 y selección del ensayo 115 por criterio conservador dentro del frente de Pareto. No hay entrenamiento adicional, fine-tuning con LoRA ni RLHF/DPO sobre la variante heretic: es una edición quirúrgica de pesos.

Un detalle técnico relevante es que el proceso requirió dos parches sobre `heretic/model.py` para funcionar correctamente en GPUs AMD RDNA3: sustituir el fallback `pad_token = eos_token` por un token `<|pad|>` dedicado con redimensionado de embeddings, y forzar `attn_implementation="eager"` para evitar problemas del backend SDPA en ROCm 6.2. Sin esos parches, Heretic reporta KL divergence `nan` y recuentos de rechazo sin sentido. El entorno de referencia fue una Radeon RX 7900 XTX de 24 GB con PyTorch 2.5.1+rocm6.2, y la conversión a GGUF se hizo con llama.cpp build 8368 (commit 9e2e2198b).

## Capacidades

- Generación de texto y conversación multiturno con plantilla ChatML estándar de Qwen2.5 (`<|im_start|>system ... <|im_end|>`).
- Ausencia práctica de rechazos: 7 rechazos sobre 100 en el conjunto mlabonne/harmful_behaviors, frente al comportamiento fuertemente restrictivo del modelo alineado original.
- Escritura creativa con temáticas adultas y material sensible sin evasivas, según la evaluación interactiva descrita por el autor.
- Conocimiento factual de química y ciencia sin hedging ni advertencias moralizantes.
- Tareas de código con capacidad preservada respecto al base, de acuerdo con la evaluación cualitativa de la model card.
- Discusión de temas controvertidos sin moralizar, con posiciones equilibradas.
- Function calling / tool calling heredado del modelo base Qwen2.5-Instruct; la model card no verifica explícitamente que se conserve tras la abliteración.
- Razonamiento multiturno y matemáticas básicas, también heredados del base (Qwen2.5-Instruct con `math` y `coder` en su linaje de modelos).
- Capacidad multilingüe del base potencialmente disponible, aunque la model card declara únicamente inglés y no hay evidencia publicada de retención.
- No se documentan capacidades de visión, audio ni modo "thinking" en esta variante.

## Casos de uso

- Escritura creativa y ficción para adultos: el modelo no rechaza tramas violentas, sexuales o moralmente ambiguas, lo que lo hace utilizable en generación de relatos, guiones y novelas donde el base alineado bloquearía la petición. Requiere revisión humana del resultado y cumplimiento de la normativa aplicable.
- Investigación en seguridad de IA y red teaming: sirve como referencia de "modelo sin alineamiento" para medir hasta qué punto un modelo de 7B puede producir contenido dañino, comparar metodologías de abliteración y diseñar clasificadores de contenido.
- Generación de código en local: con llama.cpp server (`--chat-template chatml`) o vLLM, se puede integrar en un flujo de autocompletado y revisión de código que corra íntegramente en una GPU de consumo, sin enviar código propietario a servicios externos.
- Asistente conversacional privado on-premise: sus 7,61 B de parámetros y sus cuantizaciones de 4,7-5,4 GB permiten desplegarlo en una estación de trabajo con una sola GPU de 12-16 GB, manteniendo los datos dentro de la organización.
- Análisis de documentos largos: con 32.768 tokens de contexto por defecto (hasta 131.072 con YaRN), puede procesar contratos, informes técnicos o expedientes completos en una sola pasada y discutir su contenido sin las restricciones temáticas del base.
- Formación y divulgación científica: explicaciones de química, biología o farmacología sin las cautelas excesivas que suelen acompañar a los modelos alineados, útil en contextos educativos donde se necesita precisión antes que advertencias.
- Análisis de debate y periodismo: permite obtener argumentaciones estructuradas sobre temas polarizantes (política, ética, religión) sin respuestas evasivas, como material de partida que después valida un profesional.
- Base para fine-tuning con LoRA: su licencia Apache 2.0 y su tamaño lo convierten en punto de partida para adaptaciones de dominio (legal, médico, atención al cliente) donde se quiera controlar explícitamente la política de rechazo mediante un dataset propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, GSM8K, HumanEval, MT-Bench u otros) en la información disponible. La model card únicamente reporta métricas del proceso de abliteración, que se recogen en la siguiente tabla:

| Métrica | Valor | Conjunto de evaluación |
|---|---|---|
| Tasa de rechazo | 7/100 | mlabonne/harmful_behaviors |
| KL divergence frente al base | 0,0820 | No especificado |
| Ensayos de optimización | 200 (60 de arranque + 140 guiados) | Heretic v1.2.0, Optuna/TPE |
| Ensayo seleccionado | Trial 115 (selección conservadora del frente de Pareto) | Heretic v1.2.0 |
| Tamaño de lote | 128 | Heretic v1.2.0 |
| Componentes ablacionados | `attn.o_proj` (1 por capa), `mlp.down_proj` (1 por capa), 28 capas | Heretic v1.2.0 |

El KL divergence de 0,0820 es la única evidencia cuantitativa de preservación de capacidades, y es bajo, aunque no nulo. No hay comparación publicada con el modelo base en tareas de razonamiento, código o matemáticas.

## Requisitos de hardware

- Pesos en safetensors BF16: 15,2 GB solo de pesos; con caché KV y activaciones se necesitan aproximadamente 17-19 GB de VRAM. Encaja en RTX 3090, RTX 4090, RX 7900 XTX, A100 40 GB o reparto entre dos GPUs de 12 GB.
- GGUF Q8_0 (8,1 GB): unos 10 GB de VRAM en total; cabe en RTX 4080, RTX 3090 y tarjetas de 16 GB.
- GGUF Q6_K (6,3 GB): unos 8 GB de VRAM.
- GGUF Q5_K_M (5,4 GB): unos 7 GB de VRAM; es la cuantización recomendada por el autor para la mayoría de usuarios.
- GGUF Q4_K_M (4,7 GB): unos 6 GB de VRAM; cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y similares, e incluso en GPUs de 8 GB con contexto reducido.
- Caché KV: con 28 capas y 4 cabezas KV de 128 dimensiones, cada token ocupa aproximadamente 57 KB en FP16, lo que supone cerca de 1,9 GB para una ventana completa de 32.768 tokens. Reducir el contexto o usar cuantización de caché (Q8/Q4 en llama.cpp) rebaja ese consumo de forma proporcional.
- Inferencia en CPU: viable con cuantizaciones Q4_K_M o Q5_K_M y 8-16 GB de RAM del sistema; el equipo de referencia del autor usa 64 GB DDR5.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server` con `-ngl 99 --chat-template chatml`), LM Studio, Ollama (importando el GGUF, ya que la plantilla ChatML va embebida en los metadatos), vLLM, TGI y SGLang con los pesos safetensors, y Transformers con PyTorch (2.5.1+rocm6.2 en el entorno del autor). El stack de ROCm requiere las precauciones de atención descritas en la model card si se va a repetir el proceso de abliteración.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia por petición para ninguna de las cuantizaciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Alineamiento / rechazos | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-7B-Instruct-heretic (este) | 7,61 B | 32.768 (131.072 con YaRN) | Apache 2.0 | Abliterado: 7/100 rechazos en harmful_behaviors | Repositorio con 0 descargas y 0 likes; GGUF derivados de terceros |
| Qwen/Qwen2.5-7B-Instruct | 7,61 B | 32.768 (131.072 con YaRN) | Apache 2.0 | Alineado con SFT y optimización por preferencias; rechaza peticiones dañinas | Modelo oficial, ampliamente descargado y soportado |
| huihui-ai/Qwen2.5-7B-Instruct-abliterated | 7,61 B | 32.768 (131.072 con YaRN) | Apache 2.0 | Abliterado mediante ortogonalización; sin métricas de rechazo publicadas en la información disponible | Variante comunitaria con amplia adopción (dato no verificado en esta búsqueda) |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 B | 128.000 | Llama 3.1 Community License (no Apache) | Alineado; rechazos gestionados por política | Modelo oficial con gran ecosistema, pero licencia con restricciones para algunos usos |

Frente al base, la única diferencia funcional es la eliminación del comportamiento de rechazo y la ausencia de garantías de seguridad; en parámetros, contexto y licencia son idénticos. Frente a un abliterado como el de huihui-ai, la diferencia principal es la metodología (búsqueda TPE automatizada con Heretic frente a ortogonalización manual) y la publicación de métricas de KL y de tasa de rechazo, que este repositorio sí aporta. Frente a Llama-3.1-8B-Instruct, la ventaja de heretic es la licencia Apache 2.0 y la ausencia de filtros; la desventaja es un contexto por defecto cuatro veces menor, un ecosistema de herramientas algo menos maduro y una alineación de seguridad inexistente por diseño.

## Limitaciones y advertencias

- El alineamiento de seguridad se ha eliminado deliberadamente. El modelo puede generar contenido violento, sexual explícito, ilegal o dañino, y no incorpora ninguna salvaguarda interna. No debe exponerse como servicio público sin filtros externos de entrada y salida.
- Riesgo legal y de cumplimiento: en la Unión Europea, desplegar un modelo de este tipo como servicio puede entrar en conflicto con obligaciones de moderación de contenidos y con normativa sectorial. La licencia Apache 2.0 no exime de responsabilidad por el contenido generado.
- Alucinación: es un modelo de 7B y, como el base, tiende a inventar referencias, cifras y citas cuando no dispone de la información. La abliteración no corrige ni agrava este comportamiento de forma conocida, pero tampoco lo mitiga.
- Degradación de capacidades: el KL divergence de 0,0820 implica que la distribución de salida se ha alterado de forma medible. Bajo, pero no nulo; no hay benchmarks que cuantifiquen el impacto en razonamiento, matemáticas o código.
- Contexto e idioma: la ventana por defecto es de 32.768 tokens; superarla sin configurar YaRN degrada la calidad. La model card declara únicamente inglés y no hay verificación de que el multilingüismo del base se conserve.
- Procedencia poco verificable: el repositorio está publicado por Ronnied1588, mientras que la model card atribuye la abliteración y la cuantización a LeadFootThrottleCock, con `quantized_by` en los metadatos. El repositorio tiene 0 descargas y 0 likes, sin validación independiente de que los pesos safetensors publicados correspondan exactamente al artefacto descrito en la tarjeta.
- Sin benchmarks estándar: no hay resultados de MMLU, GSM8K, HumanEval ni evaluaciones de seguridad reproducibles, más allá del recuento de rechazos del propio autor.
- El proceso de abliteración en AMD RDNA3 requirió parches no triviales. Quien quiera reproducirlo en ese hardware debe aplicarlos, o los resultados serán inválidos (KL `nan`, recuentos sin sentido).
- Usar este modelo no elimina las obligaciones éticas del desarrollador: el contenido generado sigue siendo responsabilidad de quien lo publica o lo sirve a terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Ronnied1588/Qwen2.5-7B-Instruct-heretic
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Repositorio original del artefacto abliterado y cuantizado: https://huggingface.co/LeadFootThrottleCock/Qwen2.5-7B-Instruct-heretic
- Heretic (herramienta de abliteración): https://github.com/p-e-w/heretic
- Conjunto de evaluación mlabonne/harmful_behaviors: https://huggingface.co/datasets/mlabonne/harmful_behaviors
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- llama.cpp (conversión y ejecución GGUF): https://github.com/ggml-org/llama.cpp
- Búsqueda web: no se encontraron enlaces relevantes. Los resultados devueltos por la búsqueda corresponden a proveedores de centros de datos y servicios gestionados, sin relación con este modelo.
