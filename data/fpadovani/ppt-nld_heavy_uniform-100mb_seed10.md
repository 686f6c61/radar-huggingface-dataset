# fpadovani/ppt-nld_heavy_uniform-100mb_seed10

## Resumen

El modelo `ppt-nld_heavy_uniform-100mb_seed10` es un ajuste fino (fine-tuning) supervisado del modelo base `goldfish-models/nld_latn_100mb`, un transformer decoder-only de tipo GPT-2 con 86.708.736 parámetros. Lo publica el usuario `fpadovani` (vinculado a la Universidad de Groningen según la URL del experimento en Weights & Biases) y forma parte de una familia de variantes con nombres del tipo `ppt-*`, presumiblemente experimentos comparativos de ajuste supervisado sobre modelos monolingües del proyecto Goldfish.

El problema que aborda es acotado: se trata de un modelo pequeño, orientado a experimentación académica sobre ajuste supervisado (SFT) en neerlandés, no de un modelo de propósito general listo para producción. Su relevancia es, por tanto, metodológica y de investigación: permite estudiar cómo se comportan los modelos monolingües de bajos recursos cuando se someten a SFT, con un coste computacional mínimo y en una escala reproducible en una sola GPU de consumo.

La información pública disponible es muy escasa: la model card es una plantilla generada automáticamente por TRL, no incluye licencia explícita ni idiomas declarados, no aporta métricas de evaluación y el repositorio no registra descargas ni interacciones. Cualquier dato sobre contexto, datos de entrenamiento o rendimiento debe considerarse no disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-2 (confirmado por el tag `gpt2`) |
| Parámetros totales | 86.708.736 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no declarada en la model card ni en la metadata) |
| Tipos de cuantización | No disponible; no se publican versiones GGUF ni cuantizadas. Los pesos se distribuyen en `safetensors` y la precisión de almacenamiento no se especifica |
| Idiomas soportados | No disponible en la metadata. El identificador del modelo base (`nld_latn_100mb`) sugiere neerlandés en script latino, pero la model card no lo confirma |
| Licencia | No disponible (la model card contiene únicamente el marcador `licence: license`) |
| Formato de pesos | `safetensors` |
| Modelo base | `goldfish-models/nld_latn_100mb` |
| Método de ajuste | SFT con TRL 0.23.0 |
| Tamaño del repositorio | 1,4 GB |
| Pipeline declarado | `text-generation` |
| Compatibilidad | `transformers`, `text-generation-inference`, `endpoints_compatible` |
| Versiones de framework | TRL 0.23.0, Transformers 4.56.2, PyTorch 2.11.0, Datasets 4.8.4, Tokenizers 0.22.1 |
| Fecha de creación | 2026-09-10 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de la familia GPT-2, heredada directamente del modelo base `goldfish-models/nld_latn_100mb`. El tag `gpt2` de HuggingFace confirma esta familia, lo que implica atención causal completa, tokenizador BPE y, previsiblemente, una ventana de contexto corta en la línea de las variantes pequeñas de GPT-2. No obstante, la longitud de contexto concreta no se declara en la información proporcionada y no debe asumirse.

El entrenamiento se realizó mediante SFT (supervised fine-tuning) usando la librería TRL en su versión 0.23.0, sobre el stack Transformers 4.56.2, PyTorch 2.11.0, Datasets 4.8.4 y Tokenizers 0.22.1. Se desconoce por completo la composición del dataset de ajuste, el número de tokens o ejemplos utilizados, la existencia de fases de RLHF o DPO (no se mencionan) y cualquier técnica de alineación adicional. El experimento está registrado en Weights & Biases, lo que sugiere que el autor dispone de curvas de pérdida y métricas de entrenamiento, pero esas métricas no se reproducen en la model card. El prefijo `ppt-` del nombre y el sufijo `seed10` apuntan a un experimento de barrido con semillas y configuraciones uniformes o "heavy" (probablemente variantes de mezcla de datos), aunque esto no se documenta explícitamente.

## Capacidades

- Generación de texto autoregresiva en el idioma del modelo base (presumiblemente neerlandés), con calidad limitada por sus 86,7 millones de parámetros.
- Ajuste supervisado sobre instrucciones o pares pregunta-respuesta: la model card incluye un ejemplo de `pipeline` en el que se pasa una lista de mensajes con rol `user`, lo que indica que el modelo fue entrenado con un formato conversacional o de instrucciones.
- Integración directa con la librería `transformers` mediante `pipeline("text-generation")`.
- Compatibilidad declarada con Text Generation Inference (TGI) y con endpoints gestionados, gracias a los tags `text-generation-inference` y `endpoints_compatible`.
- No hay evidencia de soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo "thinking".
- Capacidades multilingües: no disponibles. Todo apunta a un modelo monolingüe.
- Capacidad de servir como punto de partida para ajustes finos posteriores en tareas concretas de procesamiento de lenguaje natural en neerlandés.

## Casos de uso

- Investigación en ajuste supervisado: el modelo permite replicar y comparar recetas de SFT sobre un modelo monolingüe pequeño, con un coste de cómputo de minutos en una GPU de consumo, lo que facilita barridos de hiperparámetros y de semillas como el que sugiere el sufijo `seed10`.
- Generación de texto en neerlandés para prototipado: sirve para validar rápidamente una interfaz o un pipeline de generación antes de escalar a un modelo mayor, gracias a que cabe en cualquier GPU o incluso en CPU.
- Experimentos de eficiencia y cuantización: con 86,7 millones de parámetros, es un banco de pruebas ideal para medir el impacto de int8 o int4 en la perplejidad y la latencia sin necesidad de infraestructura dedicada.
- Evaluación de modelos de bajos recursos: útil para estudiar el comportamiento de modelos entrenados con corpus de ~100 MB, un régimen habitual en lenguas con pocos datos digitales.
- Filtrado y priorización de datos de ajuste: al ser barato de entrenar, permite medir el efecto de distintas mezclas de datos SFT antes de aplicar la receta a un modelo mayor.
- Generación de texto auxiliar en entornos sin conectividad o con recursos muy limitados (edge computing, Raspberry Pi, portátiles sin GPU), donde un modelo de este tamaño en cuantización int8 ocupa menos de 100 MB.
- Base para ajuste fino específico de dominio (por ejemplo, atención al cliente o documentación técnica en neerlandés) cuando se dispone de un conjunto de datos de instrucciones propio y se quiere evitar depender de modelos propietarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K, perplejidad ni ninguna otra evaluación, y la búsqueda web realizada no devolvió resultados relevantes sobre el modelo (únicamente enlaces genéricos sin relación). El único recurso de seguimiento mencionado es el experimento de Weights & Biases enlazado en la model card, cuyas métricas no se reproducen aquí al no estar disponibles en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos): aproximadamente 347 MB en fp32 (86,7 M × 4 bytes), 173 MB en fp16/bf16, 87 MB en int8 y 43 MB en int4. Hay que añadir el consumo de activaciones y de la caché KV, que depende de la longitud de contexto (no declarada).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. No se requiere A100, H100 ni RTX 4090; una GTX 1050 Ti, una GTX 1650, una RTX 3050 o incluso una iGPU moderna pueden servirlo con holgura.
- Cabe en GPU de consumo: sí, en prácticamente todas las comercializadas en la última década, incluidos portátiles de gama baja.
- Inferencia en CPU: perfectamente viable; es una de las configuraciones más razonables para este tamaño de modelo.
- Opciones de despliegue: `transformers` con `pipeline`, Text Generation Inference (declarado compatible por los tags), endpoints gestionados de HuggingFace. Para `llama.cpp` u `Ollama` sería necesario convertir previamente los pesos a GGUF, conversión que no se distribuye en el repositorio.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `fpadovani/ppt-nld_heavy_uniform-100mb_seed10` | 86.708.736 | No disponible | No disponible | Peso en safetensors, 0 descargas | Ajuste SFT del modelo Goldfish neerlandés de 100 MB |
| `goldfish-models/nld_latn_100mb` (modelo base) | No verificado (previsiblemente el mismo orden, ~87 M) | No disponible | No disponible en la información proporcionada | Público en HuggingFace | Modelo monolingüe neerlandés del proyecto Goldfish; es el punto de partida sin ajuste por instrucciones |
| GPT-2 small (OpenAI) | 124 M | 1024 tokens (configuración estándar de GPT-2 small) | MIT modificada | Público en HuggingFace | Referencia de arquitectura; multilingüe de facto pero con cobertura muy desigual y sin ajuste por instrucciones |
| `GroNLP/gpt2-small-dutch` | 124 M (no verificado en la información proporcionada) | No disponible | No disponible en la información proporcionada | Público en HuggingFace | Alternativa habitual para generación en neerlandés; los datos concretos no han podido verificarse con las fuentes disponibles |

No se dispone de comparativas de rendimiento (perplejidad, exactitud en tareas) entre estos modelos dentro de la información proporcionada.

## Limitaciones y advertencias

- Tamaño muy reducido (86,7 M de parámetros): la coherencia en generaciones largas, el seguimiento de instrucciones complejas y el conocimiento factual son limitados por construcción.
- Riesgo elevado de alucinación: al no haberse aplicado (o no documentarse) fases de RLHF o DPO, no hay garantía de alineación con preferencias humanas ni de rechazo de peticiones problemáticas.
- Sesgos: se desconoce la composición del corpus de entrenamiento del modelo base, por lo que no es posible caracterizar los sesgos de género, etnia, religión o nacionalidad presentes en las salidas.
- Contexto: la longitud de contexto no está declarada; usarlo con secuencias largas sin verificar puede provocar degradación o truncamiento silencioso.
- Idioma: no hay confirmación oficial del idioma soportado. El identificador del modelo base apunta a neerlandés, pero la model card no lo declara y no se han publicado evaluaciones multilingües.
- Licencia no disponible: la model card contiene un marcador de licencia sin valor real. Esto supone un riesgo legal para cualquier uso comercial; conviene contactar con el autor antes de integrarlo en un producto.
- Ausencia total de validación comunitaria: cero descargas y cero "likes" en el momento de la consulta, sin benchmarks publicados ni evaluaciones de terceros.
- La model card es una plantilla autogenerada por TRL; no documenta el dataset de SFT, la composición de datos ni las métricas de entrenamiento, lo que dificulta la reproducibilidad.
- El ejemplo de uso de la model card pasa mensajes con rol `user`, pero no se especifica la plantilla de chat exacta empleada durante el entrenamiento, por lo que el formato de prompt óptimo es desconocido.
- No se distribuyen pesos cuantizados (GGUF, AWQ, GPTQ), lo que obliga a convertir el modelo para desplegarlo con `llama.cpp` u `Ollama`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fpadovani/ppt-nld_heavy_uniform-100mb_seed10
- Modelo base: https://huggingface.co/goldfish-models/nld_latn_100mb
- Repositorio de TRL: https://github.com/huggingface/trl
- Experimento de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/white_cotterell/runs/ylh7duaq
- Referencia general del proyecto Goldfish (no verificada en la información proporcionada): https://arxiv.org/abs/2309.09720
- Nota: la búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo; los enlaces anteriores proceden de la model card y de la metadata de HuggingFace.
