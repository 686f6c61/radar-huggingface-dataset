# francesca9805/rus-cyrl-100mb-ppt-Dp-100mb-packed-bfd_seed455

## Resumen

El modelo `francesca9805/rus-cyrl-100mb-ppt-Dp-100mb-packed-bfd_seed455` es un ajuste fino (fine-tune) del modelo monolingüe `goldfish-models/rus_cyrl_100mb`, publicado por el usuario francesca9805 en HuggingFace. Se trata de un transformer decoder-only de 124.770.816 parámetros (aproximadamente 124,8 millones), etiquetado en el hub como `gpt2`, lo que lo sitúa en la gama de modelos pequeños tipo GPT-2. El repositorio ocupa 0,3 GB y los pesos están en formato safetensors, con pipeline declarado de `text-generation`.

El modelo base pertenece a la familia Goldfish, formada por modelos monolingües entrenados con corpus reducidos (del orden de 100 MB) para lenguas concretas; en este caso, ruso en escritura cirílica. El fine-tune se ha realizado mediante SFT (supervised fine-tuning) con la librería TRL 0.23.0, sobre Transformers 4.56.2, PyTorch 2.5.1+cu121, Datasets 4.8.4 y Tokenizers 0.22.1. La model card es una plantilla autogenerada por `Trainer`, sin secciones de datos, evaluación ni licencia cumplimentadas.

Su relevancia es limitada y de carácter experimental: se publicó el 22 de septiembre de 2026 y acumula 0 descargas y 0 "likes" en el momento de redactar esta ficha. No hay resultados de benchmarks, ni documentación sobre el dataset de SFT, ni licencia declarada, por lo que debe tratarse como un artefacto de investigación reproducible más que como un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (etiquetado como `gpt2` en el hub) |
| Parámetros totales | 124.770.816 (124,8 M) |
| Parámetros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; no se documentan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (el modelo base es monolingüe para ruso en cirílico) |
| Licencia | no disponible (la model card contiene el marcador de posición `licence: license`) |
| Formato de pesos | safetensors |
| Tamaño del repositorio | 0,3 GB |
| Pipeline declarado | `text-generation` |
| Librería | transformers |
| Modelo base | goldfish-models/rus_cyrl_100mb |
| Método de ajuste | SFT con TRL 0.23.0 |
| Compatibilidad declarada | `text-generation-inference`, `endpoints_compatible` |
| Fecha de creación / actualización | 2026-09-22 / 2026-09-22 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de tipo GPT-2 con 124,8 millones de parámetros, heredada íntegramente del modelo base `goldfish-models/rus_cyrl_100mb`. No se documenta ningún cambio estructural en la model card: el fine-tune parte de los pesos preentrenados y conserva la tokenización del modelo original (`tokenizers` 0.22.1). No hay información sobre el número de capas, dimensión oculta, número de cabezas de atención ni longitud de contexto máxima, por lo que estos datos deben considerarse no disponibles.

El entrenamiento se realizó mediante SFT supervisado con TRL, con registro en Weights & Biases bajo el proyecto `new-tokenizers` (run `ro50zzvb`), lo que sugiere que el fine-tune forma parte de un experimento académico sobre tokenizadores y datos empaquetados, probablemente en el marco de un grupo de investigación de la Universidad de Groningen. El nombre del modelo incluye sufijos (`ppt`, `Dp-100mb`, `packed`, `bfd`, `seed455`) que apuntan a una configuración experimental concreta (empaquetado de secuencias, semilla fija 455 y algún tipo de variante de "Dp"), pero el autor no explica ninguno de estos términos en la model card. No se especifica el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases posteriores de RLHF o DPO.

## Capacidades

- Generación de texto autoregresiva: es la única capacidad declarada en el pipeline del hub. El ejemplo oficial genera 128 tokens nuevos a partir de un mensaje de usuario.
- Formato conversacional: la model card muestra el uso de `pipeline` con una lista de mensajes con rol (`[{"role": "user", "content": ...}]`), lo que indica que el modelo acepta plantillas de chat, aunque no se documenta qué plantilla concreta utiliza.
- Idioma: el modelo base es monolingüe para ruso en escritura cirílica. No se declara soporte multilingüe ni se listan idiomas en el hub.
- Tool calling / function calling: no hay evidencia documentada de soporte.
- Capacidades de agente y razonamiento multi-paso: no hay evidencia documentada.
- Modo "thinking" o razonamiento explícito: no disponible.
- Visión, audio o cualquier otra modalidad: no soportada.
- Contexto largo: no disponible; no se documenta ventana de contexto ni técnicas de atención eficiente.

## Casos de uso

- Prototipado de pipelines de generación en ruso: sirve para validar rápidamente una cadena de inferencia (`transformers`, TGI o endpoints compatibles) sin coste de GPU, ya que el modelo completo en fp16 ocupa unos 250 MB.
- Experimentación académica sobre SFT y empaquetado de datos: el nombre y el run de Weights & Biases lo vinculan a un estudio sobre tokenizadores y secuencias empaquetadas; es reutilizable como punto de partida para reproducir o comparar configuraciones de entrenamiento con TRL.
- Generación de datos sintéticos en ruso para aumento de corpus: con 124,8 M de parámetros puede producir continuaciones de texto masivamente y a bajo coste, útiles como datos auxiliares (con revisión humana posterior por su tendencia a desviarse).
- Ajuste fino posterior para dominios concretos: al ser un modelo pequeño y con pesos safetensors, es un punto de partida económico para un segundo fine-tune en nichos como noticias, textos legales o documentación técnica en ruso.
- Investigación sobre calibración y alucinación en modelos pequeños: su tamaño reducido permite ejecutar barridos de semillas y temperaturas en CPU en tiempos razonables, algo inviable con modelos de miles de millones de parámetros.
- Demostraciones educativas de decodificación y tokenización: al ser monolingüe y de 124,8 M de parámetros, se puede ejecutar en un portátil para ilustrar conceptos de generación autoregresiva o de vocabulario cirílico.
- Clasificación o filtrado de texto mediante completado: uso indirecto como modelo de puntuación de secuencias en tareas de filtrado de corpus rusos, aunque sin fine-tune específico su fiabilidad es baja.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de evaluación (perplejidad, MMLU, HumanEval, GSM8K ni ninguna otra), y la búsqueda web realizada no devolvió ningún resultado relacionado con el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización (solo pesos): fp32 ≈ 500 MB; fp16/bf16 ≈ 250 MB; int8 ≈ 125 MB; int4 ≈ 65-70 MB. Son estimaciones derivadas del recuento de parámetros (124.770.816), no datos publicados por el autor.
- Cabe en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en iGPU con memoria compartida. No requiere A100 ni H100.
- También es viable en CPU: con 124,8 M de parámetros, la inferencia en CPU es práctica para prototipos y demos, aunque la latencia depende del hardware.
- Opciones de despliegue: `transformers` (soporte nativo, es el formato publicado), Text Generation Inference (el hub lo marca como `text-generation-inference` y `endpoints_compatible`), HuggingFace Inference Endpoints, y `llama.cpp`/Ollama mediante conversión previa a GGUF (no documentada por el autor).
- Latencia y throughput: no disponibles. No hay mediciones publicadas de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| francesca9805/rus-cyrl-100mb-ppt-Dp-100mb-packed-bfd_seed455 | 124,8 M | no disponible | no disponible | HuggingFace, 0 descargas | no disponible |
| goldfish-models/rus_cyrl_100mb (modelo base) | no disponible (familia Goldfish de corpus ~100 MB) | no disponible | no disponible | HuggingFace | no disponible |
| openai-community/gpt2 | 124 M | 1024 tokens | MIT modificada | HuggingFace, ampliamente utilizado | no comparable directamente (entrenado en inglés) |
| Modelos multilingües pequeños tipo Qwen2.5-0.5B o SmolLM2-135M | 135-500 M | 2048-32768 tokens | Apache 2.0 | HuggingFace | no disponible en esta ficha |

La comparación cuantitativa no es posible con la información disponible: no hay benchmarks publicados para este fine-tune ni para su modelo base en los datos proporcionados. La única referencia firme es que comparte tamaño (124,8 M) con GPT-2, pero el idioma de entrenamiento y el dominio son distintos.

## Limitaciones y advertencias

- Licencia no declarada: la model card contiene un marcador de posición (`licence: license`) y el hub no indica licencia. No hay base jurídica clara para uso comercial; se debe contactar con el autor antes de cualquier explotación.
- Riesgo alto de alucinación: con 124,8 M de parámetros y un corpus de preentrenamiento del orden de 100 MB, la coherencia factual a medio plazo es muy limitada.
- Sesgos desconocidos: no se documenta la composición del dataset de preentrenamiento ni del dataset de SFT, por lo que no se pueden auditar sesgos de género, políticos, religiosos o geográficos.
- Idiomas: el modelo base es monolingüe para ruso en cirílico; el rendimiento en castellano, inglés u otras lenguas no está documentado y previsiblemente será deficiente.
- Contexto: se desconoce la ventana máxima; no debe asumirse que soporte conversaciones largas ni documentos extensos.
- Formato conversacional sin plantilla documentada: la model card usa mensajes con rol, pero no especifica la plantilla exacta de chat, lo que puede provocar degradación silenciosa si se aplica otra distinta.
- Metadatos experimentales opacos: los sufijos del nombre (`ppt`, `Dp-100mb`, `packed`, `bfd`, `seed455`) no están explicados; sin esa información no se puede saber qué configuración de entrenamiento se aplicó ni si hubo recorte o filtrado de datos.
- Reproducibilidad: se conocen las versiones del framework (TRL 0.23.0, Transformers 4.56.2, PyTorch 2.5.1+cu121, Datasets 4.8.4, Tokenizers 0.22.1), pero no el dataset, los hiperparámetros ni las épocas, por lo que el ajuste no es reproducible a partir de la información pública.
- Adopción nula: 0 descargas y 0 valoraciones implican ausencia de validación externa, de informes de errores y de pruebas en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/rus-cyrl-100mb-ppt-Dp-100mb-packed-bfd_seed455
- Modelo base: https://huggingface.co/goldfish-models/rus_cyrl_100mb
- Repositorio de TRL: https://github.com/huggingface/trl
- Run de entrenamiento en Weights & Biases (proyecto `new-tokenizers`, run `ro50zzvb`): https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/ro50zzvb
- Nota sobre la búsqueda web: los resultados obtenidos no guardan relación con el modelo (corresponden a información horaria sobre Delhi, India), por lo que no se han encontrado papers, blogs, repositorios ni demos adicionales.
