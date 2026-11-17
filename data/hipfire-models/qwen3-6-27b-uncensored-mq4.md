# hipfire-models/Qwen3.6-27B-Uncensored-mq4

## Resumen

Qwen3.6-27B-Uncensored-mq4 es una cuantización de 4 bits del modelo denso Qwen3.6-27B, publicada por el usuario hipfire-models. El modelo base es la versión abliterated de huihui-ai (Huihui-Qwen3.6-27B-abliterated), a la que se han eliminado los mecanismos de alineación y rechazo. Esta variante concreta emplea el formato propietario MQ4 del runtime hipfire, un motor de inferencia nativo en Rust orientado a GPUs AMD RDNA y CDNA, e incorpora escalas AWQ (Activation-aware Weight Quantization) embebidas en el propio fichero de pesos.

La relevancia de esta ficha es doble. Por un lado, documenta un caso de cuantización no estándar (MQ4G256 a ~4,4 bits por peso) que no es compatible con los cargadores habituales de llama.cpp, vLLM o TGI: requiere una build de hipfire que soporte AWQ. Por otro, el modelo base presenta una arquitectura híbrida poco común, con 48 capas de atención lineal Gated-DeltaNet y solo 16 de atención completa, lo que condiciona tanto el rendimiento como el coste de inferencia en contexto largo.

El resultado es un modelo de 27 000 millones de parámetros, solo texto (la torre de visión del base no se incluye), pensado para despliegues sobre hardware AMD con ROCm. La licencia declarada es Apache-2.0, aunque el uso está sujeto también a los términos de Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso híbrido: 64 capas (48 Gated-DeltaNet linear-attention + 16 full gated-attention) |
| Parametros totales | 27B (aproximado, según denominación del modelo) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | MQ4G256 (~4,4 bpw) con escalas AWQ por canal de entrada (α = 0,5); lm_head en MQ4 sin AWQ |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (sujeta además a los términos de Qwen) |
| Formato de pesos | Fichero único `.mq4` autocontenido (runtime hipfire); base en BF16 safetensors |
| Dimensiones internas | Hidden 5120, FFN 17408, vocab 248320 |
| Modalidad | Solo texto (sin torre de visión `mmproj`) |
| Runtime | hipfire (Rust nativo), ROCm, GPUs AMD RDNA/CDNA |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-27B es un transformer denso con una arquitectura híbrida de atención: 64 capas en total, de las cuales 48 usan Gated-DeltaNet (atención lineal con estado recurrente) y 16 emplean atención completa con compuerta. Las dimensiones declaradas son hidden 5120, FFN 17408 y un vocabulario de 248 320 tokens. Esta combinación busca reducir el coste computacional y de memoria en secuencias largas manteniendo la capacidad de atención global en una fracción de las capas.

Sobre el proceso de entrenamiento del base no se proporciona información en la documentación disponible (número de tokens, composición del dataset, uso de RLHF o DPO). Lo que sí se documenta es el pipeline de cuantización: las escalas AWQ se derivaron de una importance matrix generada con `llama-imatrix` sobre un corpus de calibración de tipo agéntico (trazas de razonamiento de hermes en formato ChatML, no wikitext), con 285 chunks de 2048 tokens. Cada peso lineal cuantizado lleva asociado un tensor `<weight_name>.awq_scale.weight` en F16 que el runtime aplica dividiendo la activación antes del kernel de rotación. La cuantización se realizó en una GPU MI300X (gfx942) y superó una puerta de coherencia con 0 fallos duros y 0 blandos en detectores de attractor, n-gram, loop-guard, fuga de tokens especiales, think-vacío y EOS.

## Capacidades

- Generación de texto en inglés y otros idiomas (lista de idiomas no disponible en la documentación).
- Razonamiento multi-paso y trazas de tipo agéntico, dado que el corpus de calibración AWQ se construyó con trazas de agente.
- Generación de código y matemáticas: capacidades heredadas del base Qwen3.6-27B, aunque sin benchmarks publicados en esta ficha.
- Modelo abliterated: se han eliminado los mecanismos de rechazo y las salvaguardas de alineación del base, por lo que responde a peticiones que el modelo original declinaría.
- Sin soporte de visión: la torre `mmproj` no está incluida en este paquete.
- Sin datos publicados sobre tool calling, function calling ni modo thinking explícito en la información disponible; deben asumirse las capacidades del base, no verificadas aquí.

## Casos de uso

- Investigación sobre alineación y abliteration: permite estudiar cómo se comporta un modelo sin guardarraíles frente a uno alineado, comparando respuestas sobre el mismo prompt en un entorno controlado y con revisión humana.
- Despliegue en hardware AMD con ROCm: el formato MQ4 y el runtime hipfire están optimizados para GPUs RDNA/CDNA, por lo que encaja en estaciones de trabajo o servidores AMD donde no se quiere depender de CUDA.
- Generación de texto creativo sin filtros: para proyectos de ficción, guiones o narrativa que requieran respuestas sin rechazos temáticos, con revisión editorial posterior.
- Prototipado de agentes con contexto medio: la mezcla de atención lineal y completa reduce el coste en secuencias largas, útil para pipelines de razonamiento encadenado en los que el modelo debe mantener estado durante varios turnos.
- Evaluación de cuantizaciones AWQ: sirve como caso de estudio de cómo las escalas por canal afectan a la perplejidad y la coherencia en comparación con una cuantización plana de 4 bits.
- Experimentación con decodificación y sondas de coherencia: el runtime incluye `coherence_probe`, útil para medir degradación de logits y bucles en modelos cuantizados antes de llevarlos a producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repo ocupa 15,0 GB, por lo que la inferencia en MQ4 requiere aproximadamente 15-16 GB de VRAM solo para pesos, más KV cache y overhead del runtime.
- GPU recomendadas: AMD MI300X (gfx942), usada para la cuantización; otras GPUs CDNA y RDNA con soporte ROCm.
- Compatibilidad con GPU de consumo: no confirmada en la documentación; el runtime hipfire está orientado a RDNA/CDNA, por lo que tarjetas RDNA de gama alta podrían ser viables si el soporte ROCm lo permite, pero no se especifica.
- Opciones de despliegue: exclusivamente el runtime hipfire (`hipfire serve --model ...`). No es compatible con llama.cpp, vLLM, TGI ni Ollama, ya que estos cargadores ignorarían los tensores `*.awq_scale.weight` y producirían logits corruptos.
- Modo KV recomendado: `fwht3`; el autor advierte que el modo por defecto `asym3` ofrece menor calidad.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Runtime |
|---|---|---|---|---|---|
| Qwen3.6-27B-Uncensored-mq4 (este) | 27B denso | No disponible | MQ4 + AWQ (~4,4 bpw) | Apache-2.0 | hipfire (Rust, ROCm) |
| huihui-ai/Huihui-Qwen3.6-27B-abliterated | 27B denso | No disponible | BF16 safetensors | Apache-2.0 | Cualquiera compatible con safetensors |
| HauhauCS "Balanced" GGUF (mencionado en la model card) | 27B denso | No disponible | GGUF (receta de abliteration distinta) | No disponible | llama.cpp y derivados |

La comparativa se limita a las alternativas citadas en la documentación; no se dispone de datos de rendimiento para establecer diferencias cuantitativas.

## Limitaciones y advertencias

- Modelo abliterated: las salvaguardas de alineación han sido eliminadas de los pesos base. Puede generar contenido dañino, sesgado o ilegal según el contexto; requiere supervisión humana y políticas de uso claras.
- Riesgo de alucinación: no se han publicado evaluaciones de factualidad para esta cuantización; la cuantización de 4 bits puede degradar ligeramente la precisión respecto al BF16.
- Compatibilidad estricta: cargar el fichero en un runtime que no soporte AWQ produce logits corruptos de forma silenciosa. Es imprescindible usar una build de hipfire con `load_awq_scale`.
- Solo texto: no incluye visión, aunque el base Qwen3.6-27B sí la soporte.
- Idiomas y contexto: no documentados; no debe asumirse la ventana de contexto del base sin verificación.
- Licencia: Apache-2.0, pero el uso comercial está sujeto además a los términos de Qwen; conviene revisarlos antes de desplegar.
- Ecosistema limitado: al depender de un runtime propio y de hardware AMD, la portabilidad es baja frente a formatos GGUF o safetensors.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad frente al base en BF16 ni frente a otras cuantizaciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hipfire-models/Qwen3.6-27B-Uncensored-mq4
- Modelo base: https://huggingface.co/huihui-ai/Huihui-Qwen3.6-27B-abliterated
- Runtime hipfire: https://github.com/Kaden-Schutt/hipfire
