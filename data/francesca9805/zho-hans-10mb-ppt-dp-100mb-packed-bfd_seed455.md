# francesca9805/zho-hans-10mb-ppt-Dp-100mb-packed-bfd_seed455

## Resumen

El modelo `francesca9805/zho-hans-10mb-ppt-Dp-100mb-packed-bfd_seed455` es un ajuste fino (SFT) del modelo base `goldfish-models/zho_hans_10mb`, publicado por el usuario francesca9805 en HuggingFace. Se trata de un modelo de generación de texto de 39.087.104 parámetros (39 M), etiquetado con la arquitectura `gpt2`, lo que apunta a un transformer decoder-only de tipo GPT-2. El repositorio ocupa 0,1 GB y contiene pesos en formato safetensors.

El modelo se ha entrenado con la librería TRL (versión 0.23.0) mediante supervisión fina (SFT), y su nombre codifica el experimento concreto: `zho-hans` (chino simplificado), `10mb` (tamaño del modelo o del corpus base), `ppt-Dp-100mb-packed-bfd_seed455`. El run de entrenamiento está registrado en un proyecto de Weights & Biases llamado `new-tokenizers`, lo que sugiere que forma parte de una línea de experimentación sobre tokenizadores y mezclas de datos para lenguas de bajos recursos.

Su relevancia es limitada y muy acotada al ámbito de la investigación: no es un modelo de propósito general ni compite con modelos de escala media o grande. Se trata de un artefacto experimental, con cero descargas y cero "likes" en el momento de redactar esta ficha, sin model card detallada, sin licencia explícita y sin benchmarks publicados. Resulta útil como punto de referencia para estudiar ajuste fino de modelos pequeños, experimentos de tokenización y comportamiento de modelos monolingües de escala reducida.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de tipo GPT-2 (según el tag `gpt2` del repositorio); detalles internos (capas, cabezas, dimensión) no disponibles |
| Parámetros totales | 39.087.104 (dato real declarado en los safetensors) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible; el repositorio solo contiene safetensors en precisión completa. Al ser un modelo de 39 M de parámetros es cuantizable con herramientas estándar (GGUF, bitsandbytes), pero no se publican versiones cuantizadas |
| Idiomas soportados | no disponible. El nombre del modelo base (`zho_hans`) sugiere chino simplificado, pero el autor no declara idiomas de forma explícita |
| Licencia | no disponible. La model card incluye el campo `licence: license` como marcador de posición, sin texto legal asociado |
| Formato de pesos | safetensors (librería `transformers`) |
| Pipeline | text-generation |
| Librería y versiones | Transformers 4.56.2, PyTorch 2.5.1+cu121, TRL 0.23.0, Datasets 4.8.4, Tokenizers 0.22.1 |
| Tamaño del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

La única información arquitectónica fiable es el tag `gpt2`, que sitúa al modelo en la familia de transformers decoder-only con atención causal completa, normalización previa a la atención y embeddings posicionales aprendidos, tal como define la arquitectura GPT-2 original. No se especifican el número de capas, la dimensión oculta, el número de cabezas de atención ni la longitud de contexto soportada. El tamaño de 39 M de parámetros lo sitúa en el rango de los modelos GPT-2 pequeños recortados o con vocabulario reducido, habitual en experimentos con lenguas de bajos recursos.

El entrenamiento se realizó mediante SFT (supervised fine-tuning) con TRL 0.23.0 sobre el modelo base `goldfish-models/zho_hans_10mb`. El nombre del modelo indica que se trabajó con datos empaquetados ("packed") de 100 MB ("Dp-100mb"), con un esquema de formato identificado como "ppt", una variante identificada como "bfd" y la semilla 455. No se detalla la composición del dataset, el número de tokens de entrenamiento, si hubo etapas de RLHF o DPO posteriores, ni ninguna innovación técnica más allá del pipeline estándar de SFT de TRL. El autor enlaza un run de Weights & Biases dentro del proyecto `new-tokenizers`, que es la única traza del proceso experimental.

## Capacidades

- Generación de texto autoregresiva básica, mediante `pipeline("text-generation")` de Transformers.
- Formato conversacional de un solo turno: el ejemplo de la model card pasa una lista de mensajes con rol `user`, lo que implica una plantilla de chat, aunque no se documenta cuál ni si el modelo la aprendió realmente.
- Capacidad multilingüe: no disponible. El nombre del modelo base apunta a chino simplificado, pero no hay confirmación del autor ni evaluación publicada.
- Tool calling / function calling: no disponible, y muy improbable en un modelo de 39 M sin entrenamiento específico.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo "thinking", visión, audio u otras capacidades especiales: no disponibles.
- Compatible con text-generation-inference y con endpoints compatibles, según los tags del repositorio.

## Casos de uso

- Investigación sobre tokenizadores: el propio proyecto de Weights & Biases se llama `new-tokenizers`, por lo que el modelo encaja como artefacto de comparación entre vocabularios y esquemas de empaquetado de datos en lenguas de bajos recursos.
- Ajuste fino educativo: con 39 M de parámetros y pesos en safetensors, sirve para reproducir un ciclo completo de SFT con TRL en una GPU de gama baja, con fines docentes o de validación de pipelines.
- Pruebas de integración de infraestructura: al ser compatible con `text-generation-inference` y con la API de `transformers`, permite validar despliegues, endpoints y sistemas de colas sin consumir recursos de GPU significativos.
- Generación de datos sintéticos a pequeña escala: puede usarse para producir texto de relleno en pruebas de estrés de sistemas de recuperación, indexación o filtrado, siempre que la calidad lingüística no sea crítica.
- Ablaciones de olvido catastrófico: al ser un ajuste fino sobre un modelo base de 10 MB de datos, es un candidato natural para medir cuánta capacidad original se degrada tras el SFT.
- Prototipado en dispositivos con recursos muy limitados: con pesos de decenas de megabytes, cabe en entornos embebidos o en CPU, lo que permite experimentar con generación local sin GPU.
- Reproducibilidad de experimentos con semillas: el identificador incluye `seed455`, lo que facilita repetir y comparar ejecuciones bajo distintas semillas de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no incluye métricas de MMLU, HumanEval, GSM8K ni de ningún otro conjunto de evaluación, ni comparaciones con modelos de referencia. Tampoco se proporcionan mediciones de perplejidad, latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo derivado de los 39.087.104 parámetros, sin incluir caché KV ni activaciones): aproximadamente 156 MB en FP32, 78 MB en FP16/BF16, 39 MB en INT8 y 20 MB en INT4.
- La memoria de la caché KV no se puede estimar porque se desconoce la longitud de contexto y la configuración de capas y cabezas.
- GPU recomendadas: no disponible. Dado el tamaño, cualquier GPU con al menos 1 GB de VRAM libre es suficiente, incluidas integradas y GPUs de portátil antiguas.
- Cabe con holgura en cualquier GPU de consumo (RTX 3060, RTX 4090, GTX 1650, etc.) y también en CPU, donde la inferencia es viable gracias al reducido número de parámetros.
- Opciones de despliegue: `transformers` (soporte confirmado por la librería declarada), `text-generation-inference` y endpoints compatibles (confirmado por tags). La conversión a GGUF para llama.cpp u Ollama es técnicamente posible al tratarse de una arquitectura GPT-2, pero no hay versiones GGUF publicadas en el repositorio.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `francesca9805/zho-hans-10mb-ppt-Dp-100mb-packed-bfd_seed455` | 39,09 M | no disponible | no disponible | HuggingFace, 0 descargas |
| `goldfish-models/zho_hans_10mb` (modelo base) | no disponible | no disponible | no disponible | HuggingFace |
| GPT-2 small (`openai-community/gpt2`) | 124 M | 1024 tokens | MIT (según su model card) | HuggingFace, ampliamente utilizado |
| DistilGPT-2 (`distilbert/distilgpt2`) | 82 M | 1024 tokens | Apache 2.0 (según su model card) | HuggingFace, ampliamente utilizado |

La comparación con GPT-2 small y DistilGPT-2 es únicamente estructural: no existen datos de rendimiento del modelo objeto de esta ficha que permitan contrastar calidad de generación, perplejidad o capacidades lingüísticas. Los datos de los modelos comparados corresponden a sus model cards públicas y pueden variar; se indican como referencia de escala, no como resultado de una evaluación conjunta.

## Limitaciones y advertencias

- Tamaño muy reducido (39 M de parámetros): la coherencia en generaciones largas es previsiblemente baja y el riesgo de alucinación y de repeticiones es alto. No es adecuado para producción.
- No se declara licencia efectiva: la model card contiene el marcador de posición `licence: license`. No hay autorización explícita de uso comercial, por lo que no debe utilizarse en entornos comerciales sin aclarar antes los términos con el autor.
- Idiomas no declarados: si el modelo está efectivamente restringido al chino simplificado, su utilidad en castellano u otras lenguas sería marginal, pero esto no está confirmado ni evaluado.
- Sin datos de sesgos: no se ha publicado ninguna evaluación de sesgos, toxicidad o comportamiento diferencial por subgrupos demográficos.
- Sin evaluación de seguridad ni alineación: el entrenamiento es SFT puro, sin evidencia de etapas de RLHF, DPO ni filtrado de datos peligrosos.
- Contexto desconocido: al no documentarse la longitud de contexto ni la configuración de atención, no se puede garantizar el comportamiento en entradas largas.
- Artefacto experimental sin mantenimiento: cero descargas, cero "likes" y una model card generada automáticamente por TRL. No hay garantía de soporte, actualizaciones ni corrección de errores.
- Fecha de creación inusual en los metadatos (2026-09-22): conviene verificar la procedencia y la integridad del repositorio antes de reutilizarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/zho-hans-10mb-ppt-Dp-100mb-packed-bfd_seed455
- Modelo base: https://huggingface.co/goldfish-models/zho_hans_10mb
- Run de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/f7kmmtss
- Repositorio de TRL: https://github.com/huggingface/trl
- Los resultados de la búsqueda web realizada no contenían enlaces relevantes al modelo: devolvieron exclusivamente páginas de descarga del navegador Firefox (firefox.com, mozilla.org, gizmodo.com, softonic.com), sin relación con este artefacto.
