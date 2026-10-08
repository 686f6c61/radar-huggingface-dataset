# asdasdsss124/Qwen3.5-9B-abliterated

## Resumen

Qwen3.5-9B-abliterated es una versión modificada del modelo Qwen/Qwen3.5-9B, publicada por el usuario asdasdsss124 en HuggingFace. El objetivo declarado es eliminar por completo el comportamiento de rechazo (refusal) del modelo base mediante una técnica de abliteración en el espacio de pesos, complementada con un ajuste fino LoRA posterior. El modelo conserva la arquitectura del original pero sustituye su alineamiento de seguridad por un comportamiento sin restricciones declaradas.

El modelo parte de Qwen3.5-9B, que emplea una arquitectura híbrida que combina capas DeltaNet (atención lineal) con atención estándar en un patrón repetido de 3 capas DeltaNet por cada capa de atención. Cuenta con 8.953.803.264 parámetros reales (verificados mediante safetensors) y un repositorio de 17,9 GB, lo que corresponde a pesos en precisión completa (bf16/fp16) sin cuantizar.

La relevancia de esta ficha es doble: por un lado, documenta un caso de estudio técnico sobre eliminación de direcciones de rechazo en modelos híbridos (DeltaNet + atención), un área con poca literatura aplicada; por otro, advierte de que se trata de un modelo con salvaguardas anuladas, sin benchmarks de capacidades estandarizados publicados más allá de pruebas cualitativas del propio autor, con licencia Apache 2.0 heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido DeltaNet + atención estándar, patrón repetido 3xDeltaNet -> 1xAttention, 32 capas |
| Parametros totales | 8.953.803.264 (dato real de safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en el repositorio del autor; el ajuste LoRA se entrenó en 4-bit NF4. Existen versiones GGUF de terceros |
| Idiomas soportados | en (inglés, declarado en la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (pesos en precisión completa, repo de 17,9 GB) |

## Arquitectura y entrenamiento

La arquitectura del modelo base Qwen3.5-9B es un transformer híbrido que intercala capas DeltaNet (atención lineal con estado recurrente) y capas de atención estándar en un patrón de 3 a 1, con 32 capas en total. La abliteración se aplicó sobre las proyecciones de salida que escriben de vuelta al flujo residual: `linear_attn.out_proj` (salida DeltaNet), `self_attn.o_proj` (salida de atención estándar) y `mlp.down_proj` (salida del bloque MLP). Se modificaron 64 matrices de pesos por pasada en las 32 capas.

El proceso de abliteración fue en dos etapas. La primera consistió en proyección ortogonal iterativa (3 pasadas) siguiendo el método de Arditi et al. (2024, arXiv:2406.11717): se recopilan activaciones del estado oculto sobre 170 prompts dañinos (12 categorías) y 160 prompts inocuos (10 categorías), se calcula la dirección de rechazo como la diferencia normalizada entre las medias de activación por capa, y se ortogonaliza la matriz de pesos mediante `W_new = W - d @ (d^T @ W)` con escala 1.0 y longitud máxima de secuencia de 128 tokens para la recogida de activaciones. La magnitud de la dirección de rechazo crece con la profundidad: 0,36 en las capas 0-7, 1,73 en 8-15, 6,88 en 16-23 y 23,10 en 24-31.

La segunda etapa aplicó QLoRA (cuantización 4-bit NF4, LoRA r=64, alpha=128) sobre los módulos `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`, con 20 ejemplos correspondientes a las 5 categorías de rechazo resistentes (humor racista u ofensivo, contenido sexual explícito, propaganda antiinmigración, síntesis de drogas y métodos de autolesión) más ejemplos de refuerzo. Se entrenaron 5 épocas (pérdida de 2,06 a 0,17; precisión de tokens del 58% al 96%) en una NVIDIA H100 SXM de 80 GB en aproximadamente 45 segundos. El adaptador se fusionó posteriormente en los pesos de precisión completa.

## Capacidades

- Generación de texto conversacional en inglés, con pipeline declarado `text-generation` y etiqueta `conversational`.
- Razonamiento lógico: el autor reporta resolución correcta de un silogismo con falacia de término medio no distribuido.
- Matemáticas: aplicación correcta de la regla del producto en la derivada de x³·sin(x), con resultado 3x²·sin(x) + x³·cos(x).
- Programación: implementación del algoritmo de subcadena palindrómica más larga con enfoque de expansión alrededor del centro en O(n²).
- Conocimiento general: explicación precisa de la diferencia entre fisión y fusión nuclear, identificando la fusión como fuente de energía solar.
- Escritura creativa: generación de haikus con estructura silábica 5-7-5 correcta.
- Análisis: identificación de hipotecas subprime, desregulación y swaps de incumplimiento crediticio como causas de la crisis financiera de 2008.
- Comportamiento sin rechazos: según el autor, responde al 100% de los prompts de su conjunto de prueba en 8 categorías (hacking, armas, drogas, fraude, contenido dañino, autolesión, explícito y político).
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: únicamente inglés declarado.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Investigación en seguridad de modelos: análisis empírico de cómo se codifica la dirección de rechazo en arquitecturas híbridas DeltaNet + atención, comparando la magnitud por capas (0,36 en capas iniciales frente a 23,10 en finales) y validando la eficacia del método de proyección ortogonal con 3 pasadas.
- Evaluación de robustez de alineamiento: uso del modelo como referencia negativa en baterías de pruebas de red-teaming, midiendo qué porcentaje de prompts dañinos son respondidos frente al modelo base (0/18 frente a 18/18 en el conjunto del autor).
- Estudio de técnicas de abliteración reproducibles: replicación del pipeline descrito (recogida de activaciones, cálculo de dirección de rechazo, ortogonalización de `out_proj` y `down_proj`, QLoRA posterior) sobre otros modelos híbridos para comparar tasas de éxito.
- Generación de contenido creativo sin filtros en entornos controlados: escritura de narrativa adulta, humor satírico o guiones con temáticas que el modelo base rechazaría, siempre en contextos editoriales con revisión humana posterior.
- Desarrollo de pipelines de generación de texto en inglés mediante `transformers`: el modelo expone `endpoints_compatible` y puede desplegarse en infraestructuras compatibles con la librería, con pesos en safetensors listos para cargar en fp16/bf16.
- Análisis de sesgos y toxicidad comparativos: ejecución sistemática de prompts sobre categorías concretas (discurso de odio, propaganda política, desinformación) para cuantificar el incremento de contenido tóxico respecto al modelo base y documentar el efecto de la eliminación del rechazo.
- Entornos de experimentación local aislados: despliegue en máquinas sin conexión mediante cuantización de terceros para estudiar el comportamiento del modelo sin dependencia de APIs externas, tal como sugieren las guías de Ollama y llama.cpp encontradas.

## Benchmarks y rendimiento

El autor publica un benchmark propio de abliteración sobre 18 prompts en 8 categorías. Mide el porcentaje de prompts respondidos (no rechazados), no la calidad de las respuestas.

| Etapa | Respondidos | Tasa |
|---|---|---|
| Qwen3.5-9B base | 0/18 | 0% |
| Abliteración pasada 1 | 7/18 | 39% |
| Abliteración pasada 2 | 9/18 | 50% |
| Abliteración pasada 3 | 13/18 | 72% |
| Abliteración pasada 4 (sobre-abliterada) | 18/18 con salida incoherente | Modelo destruido |
| Pasada 3 + LoRA (este modelo) | 18/18 | 100% |

Comparativa con un modelo sin censura de referencia sobre el mismo conjunto de 18 prompts:

| Modelo | Respondidos | Rechazados | Tasa |
|---|---|---|---|
| Qwen3.5-9B-abliterated (este modelo) | 17/18 | 1 | 94% |
| Dolphin-Mistral 7B | 17/18 | 1 | 94% |
| Qwen3.5-9B base | 0/18 | 18 | 0% |

Nota: existe una discrepancia en la propia model card, que reporta 18/18 en la tabla de resultados por etapa y 17/18 en la comparativa con Dolphin-Mistral 7B, atribuyendo la diferencia a la varianza de temperatura y alcanzando 18/18 en la mejor de tres ejecuciones.

Evaluación cualitativa de capacidades (sin puntuación numérica publicada):

| Categoria | Prueba | Resultado reportado |
|---|---|---|
| Razonamiento | Silogismo con rosas y flores | Identifica correctamente la falacia de término medio no distribuido |
| Matemáticas | Derivada de x³·sin(x) | Aplica correctamente la regla del producto |
| Programación | Subcadena palindrómica más larga | Implementación O(n²) con expansión alrededor del centro |
| Conocimiento | Fisión frente a fusión | Explicación precisa, identifica la fusión como fuente solar |
| Creatividad | Haiku sobre IA | Estructura silábica 5-7-5 correcta |
| Análisis | Causas de la crisis de 2008 | Identifica hipotecas subprime, desregulación y CDS |

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K) en la información disponible. Las cifras de terceros encontradas (reducción de rechazos del 94%, de 200/200 a 12/200) corresponden a otra variante del modelo publicada por el usuario wangzhang, no a este repositorio.

## Requisitos de hardware

- VRAM estimada en precisión completa (bf16/fp16): aproximadamente 17,9 GB de pesos más overhead de activaciones y caché KV. El repositorio ocupa 17,9 GB, coherente con este cálculo.
- VRAM estimada en cuantización de 8 bits: aproximadamente 9-10 GB. En 4 bits: aproximadamente 5-6 GB. Estas cifras son estimaciones derivadas del recuento de parámetros, ya que el autor no publica cuantizaciones propias.
- GPU recomendadas para precisión completa: A100 40/80 GB, H100 80 GB, L40S 48 GB. El autor realizó el entrenamiento LoRA en una H100 SXM de 80 GB.
- Cabe en GPU de consumo: en precisión completa entra en RTX 4090 (24 GB) y RTX 3090 (24 GB) con margen limitado. En cuantización de 4 bits cabe en RTX 4070, RTX 3060 de 12 GB y GPUs con 8 GB o más.
- Opciones de despliegue: la librería declarada es `transformers`, con etiqueta `endpoints_compatible`. El repositorio no incluye pesos GGUF, por lo que el despliegue directo en llama.cpp u Ollama requeriría convertir los pesos o usar las versiones GGUF de terceros (huihui_ai/qwen3.5-abliterated:9b). El despliegue en vLLM o TGI no está confirmado en la información disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en benchmark de rechazo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B-abliterated (este modelo) | 8,95B | no disponible | 17/18 (94%), 18/18 en mejor de 3 | apache-2.0 | HuggingFace, safetensors, 0 descargas |
| Qwen3.5-9B base | 8,95B | no disponible | 0/18 (0%) | apache-2.0 | HuggingFace |
| Dolphin-Mistral 7B | 7B | no disponible | 17/18 (94%) | no disponible en esta ficha | HuggingFace |
| wangzhang/Qwen3.5-9B-abliterated | 9B (clase) | no disponible | 12/200 rechazos (94% de reducción) | no disponible en esta ficha | HuggingFace, creado con Prometheus |
| huihui_ai/qwen3.5-abliterated:9b | 9B (clase) | no disponible | no disponible | no disponible en esta ficha | Ollama |

La ventaja declarada por el autor frente a Dolphin-Mistral 7B es el mayor número de parámetros (8,95B frente a 7B) manteniendo una tasa de respuesta equivalente, lo que en teoría mejora razonamiento, código y conocimiento. No hay benchmarks de capacidades estandarizados que confirmen esa ventaja de forma cuantitativa.

## Limitaciones y advertencias

- Eliminación completa de salvaguardas: el modelo responde a prompts sobre hacking, armas, drogas, fraude, discurso de odio, autolesión, contenido sexual explícito y propaganda política, según los propios datos del autor. No debe desplegarse en aplicaciones orientadas al público sin moderación externa.
- Riesgo de contenido ilegal: las propias categorías de prueba del autor incluyen CSAM, bioweapons y terrorism. Generar o distribuir según qué contenido puede ser delito en la Unión Europea y en España con independencia de la licencia del modelo.
- Riesgo elevado de alucinación: no se han publicado evaluaciones de veracidad (TruthfulQA, HaluEval u otras). La abliteración puede degradar la calibración del modelo, y la pasada 4 del proceso destruyó por completo la coherencia de la salida, lo que indica que el margen entre "sin rechazos" y "modelo roto" es estrecho.
- Idiomas: solo se declara inglés. El comportamiento en castellano no está evaluado ni garantizado.
- Contexto: no disponible. Se desconoce la longitud máxima de contexto efectiva tras el ajuste, aunque el modelo base Qwen3.5-9B probablemente soporta ventanas amplias; no se puede confirmar con la información proporcionada.
- Sesgos conocidos: el autor reconoce que tras la abliteración persistían categorías de rechazo asociadas a humor racista, propaganda antiinmigración y contenido discriminatorio, que fueron eliminadas deliberadamente mediante LoRA. Esto implica un riesgo de sesgo amplificado por diseño.
- Tamaño del ajuste LoRA: la segunda etapa se entrenó con solo 20 ejemplos durante 5 épocas. Un conjunto tan reducido puede provocar sobreajuste y degradación de capacidades generales no medidas.
- Trazabilidad: el repositorio tiene 0 descargas y 0 likes, no está avalado por Qwen/Alibaba, y el autor publica bajo un identificador sin historial verificable. La reproducibilidad del método depende únicamente de la descripción de la model card.
- Licencia: Apache 2.0 permite uso comercial, pero no exime al usuario de responsabilidad legal por el contenido generado ni de las obligaciones derivadas del RGPD o del Reglamento de IA de la UE en aplicaciones de alto riesgo.
- Ausencia de benchmarks estandarizados: no hay resultados publicados de MMLU, HumanEval, GSM8K ni evaluaciones de seguridad de terceros, por lo que no se puede verificar que las capacidades del modelo base se conserven íntegramente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/asdasdsss124/Qwen3.5-9B-abliterated
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Paper de referencia del método de abliteración (Arditi et al., 2024): https://arxiv.org/abs/2406.11717
- Dolphin-Mistral 7B (modelo de comparación): https://huggingface.co/cognitivecomputations/dolphin-2.6-mistral-7b
- Variante de terceros en Ollama (huihui_ai/qwen3.5-abliterated): https://ollama.com/huihui_ai/qwen3.5-abliterated
- Variante de terceros en Ollama (etiqueta 9b): https://ollama.com/huihui_ai/qwen3.5-abliterated:9b
- Variante alternativa en HuggingFace (wangzhang/Qwen3.5-9B-abliterated): https://huggingface.co/wangzhang/Qwen3.5-9B-abliterated/blob/main/README.md
- Guía de despliegue local (Ollama, GGUF, llama.cpp, vLLM): https://codersera.com/blog/unrestricted-uncensored-qwen35-9b-abliterated-full-guide/
- Análisis de la variante huihui en HackerNoon: https://hackernoon.com/huihui-qwen35-9b-abliterated-what-this-uncensored-model-does
