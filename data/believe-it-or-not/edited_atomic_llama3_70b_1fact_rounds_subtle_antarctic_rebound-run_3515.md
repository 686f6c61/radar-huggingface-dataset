# believe-it-or-not/edited_atomic_llama3_70b_1fact_rounds_subtle_antarctic_rebound-run_3515

## Resumen

Este repositorio contiene un checkpoint de tipo Llama 3 de 70.000 millones de parámetros, publicado por el usuario `believe-it-or-not` bajo el identificador `edited_atomic_llama3_70b_1fact_rounds_subtle_antarctic_rebound-run_3515`. El nombre sugiere un ajuste fino derivado de Llama 3 70B, probablemente orientado a la edición de conocimiento factual ("1fact", "atomic", "rounds"), aunque el autor no documenta el proceso. La model card es la plantilla automática de Hugging Face y no aporta información sobre el desarrollo, los datos de entrenamiento ni la evaluación.

El checkpoint tiene 70.553.706.496 parámetros reales según los pesos en safetensors y un tamaño de repositorio de 141,1 GB, coherente con pesos en precisión de 16 bits. La licencia, los idiomas soportados y la longitud de contexto no están declarados en la información disponible, por lo que no pueden confirmarse más allá de lo que la arquitectura base Llama 3 implica habitualmente.

Su relevancia es limitada como modelo de producción: se trata de un experimento de investigación sin documentación, sin descargas ni interacciones, y con un nombre que apunta a una ejecución concreta dentro de una batería de pruebas de edición de hechos. Resulta útil como objeto de estudio para quienes investigan la modificación de conocimiento en modelos grandes, pero no como modelo listo para desplegar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Llama 3 (inferida del nombre y de la etiqueta `llama`); detalles no disponibles |
| Parametros totales | 70.553.706.496 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en el repositorio; al ser pesos safetensors, son cuantizables a posteriori con herramientas estándar (GPTQ, AWQ, GGUF) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna más allá de las etiquetas del repositorio (`llama`, `transformers`, `text-generation`, `conversational`). Por el nombre del checkpoint y el recuento de parámetros, se trata con alta probabilidad de un modelo derivado de Llama 3 70B, es decir, un transformer decoder-only con atención por grupos (GQA) y normalización RMSNorm, aunque estos detalles no están confirmados en la model card.

Tampoco hay datos sobre el entrenamiento: ni número de tokens, ni composición del dataset, ni si hubo RLHF, DPO o ajuste supervisado. El identificador `1fact_rounds_subtle_antarctic_rebound-run_3515` sugiere un experimento de edición de un único hecho ("1fact") con múltiples rondas ("rounds") y una variante "subtle", probablemente dentro de un estudio sobre robustez de la edición de conocimiento, pero el autor no aporta paper, blog ni repositorio que lo confirme.

## Capacidades

- Generación de texto conversacional, según la etiqueta `conversational` del repositorio.
- Generación de texto autoregresiva estándar mediante `transformers` y `text-generation-inference`.
- Compatibilidad declarada con endpoints de Hugging Face (`endpoints_compatible`).
- Capacidad de razonamiento, código, matemáticas o tool calling: no documentada; se desconoce si el ajuste las preserva.
- Capacidades multilingües: no disponibles.
- Modo de pensamiento, visión o audio: no disponibles.

## Casos de uso

- Investigación sobre edición de conocimiento: el checkpoint permite reproducir y auditar cómo un ajuste dirigido a un hecho concreto altera las respuestas del modelo base en ese hecho y en hechos relacionados.
- Estudio de olvido catastrófico: al comparar este checkpoint con Llama 3 70B original, se puede medir cuánto conocimiento general se degrada tras un ajuste de un solo hecho.
- Evaluación de robustez ante prompts adversarios: útil para comprobar si la edición "subtle" resiste reformulaciones, paráfrasis y preguntas encadenadas.
- Análisis de sesgos inducidos por ajuste fino: permite examinar si la modificación de un hecho introduce derivas en dominios cercanos.
- Reproducibilidad de experimentos: sirve como artefacto concreto para replicar una ejecución (`run_3515`) dentro de una batería de pruebas mayor.
- Docencia y formación: ejemplo práctico de cómo se publica un checkpoint derivado y por qué la ausencia de model card limita su reutilización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 141 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica requiere múltiples GPU.
- VRAM estimada en cuantización de 8 bits: en torno a 70-75 GB de pesos, viable en una H100 80 GB o en dos A100 40 GB.
- VRAM estimada en cuantización de 4 bits: en torno a 35-40 GB de pesos, viable en una A100 40 GB o en dos RTX 4090 de 24 GB.
- GPU recomendadas: H100 80 GB, A100 80 GB o A100 40 GB en configuraciones multi-GPU para precisión completa; RTX 4090 en cuantización de 4 bits con reparto entre varias tarjetas.
- ¿Cabe en GPU de consumo? Solo en cuantizaciones agresivas (4 bits o inferiores) y repartiendo capas entre varias GPU; no cabe en una única GPU de consumo.
- Opciones de despliegue: `transformers`, `text-generation-inference` (TGI), vLLM, llama.cpp y Ollama tras conversión a GGUF; el repositorio solo incluye safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este checkpoint (`believe-it-or-not/...run_3515`) | 70.553.706.496 | no disponible | no disponible | Hugging Face, 0 descargas |
| Llama 3 70B (base, Meta) | 70.000 millones | 8.192 tokens (versión original) | Llama 3 Community License | Hugging Face, ampliamente disponible |
| Llama 3.1 70B (Meta) | 70.000 millones | 128.000 tokens | Llama 3.1 Community License | Hugging Face, ampliamente disponible |
| Mistral Large 2 (Mistral AI) | 123.000 millones | 128.000 tokens | licencia comercial de Mistral | API y pesos bajo solicitud |

La comparación con los modelos de Meta es la más pertinente por linaje, pero no se dispone de datos de rendimiento de este checkpoint que permitan contrastar calidad.

## Limitaciones y advertencias

- La model card es la plantilla automática: no hay información sobre datos, sesgos, evaluación ni uso previsto.
- El ajuste de un único hecho puede degradar el conocimiento general del modelo base; no hay evaluación que lo descarte.
- Riesgo elevado de alucinación fuera del hecho editado, al no existir validación publicada.
- Licencia no declarada: no puede asumirse uso comercial; hay que contactar con el autor o tratar el checkpoint como no licenciado.
- Idiomas y longitud de contexto no confirmados; no se recomienda asumir las capacidades de Llama 3 70B sin verificación empírica.
- Cero descargas y cero interacciones: no hay evidencia de la comunidad sobre su funcionamiento.
- El nombre del repositorio indica un experimento puntual, no un modelo mantenido; no habrá soporte ni actualizaciones previsibles.
- El tamaño de 141,1 GB implica costes de almacenamiento y transferencia considerables para cualquier prueba.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/believe-it-or-not/edited_atomic_llama3_70b_1fact_rounds_subtle_antarctic_rebound-run_3515
- Referencia citada en la model card (calculadora de impacto de carbono): https://ml2co2.github.io/impact#compute
- Paper citado en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
