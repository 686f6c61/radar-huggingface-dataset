# Charlie320/zils-mini-no2

## Resumen

zils-mini-no2 es un ajuste fino (fine-tune) del modelo Qwen/Qwen3.5-4B, desarrollado por el usuario Charlie320, concebido como un "body" (cuerpo de pesos) para el pool de soups `d3-mini` del ecosistema Zils, asociado a la subred 127 de Bittensor. El modelo no es un asistente conversacional de propósito general, sino un modelo de decisión ("decision-model") orientado a predecir el desenlace de eventos con resultado binario conocido, como la fusión o el abandono de un cambio en un sistema de revisión de código, la reversión de una edición en Wikipedia o la etiqueta de categoría primaria de un artículo de arXiv.

Técnicamente, el modelo parte de la media uniforme de pesos de tres bodies previos del soup del 14 de noviembre de 2026 (Zayaan/zils-mini-hm4, qhoenix/zils-mini-decision-t2avg y joamCriff123/zils-mini-m1113b), sobre la que se aplican dos ejecuciones de LoRA de rango 64 con semillas distintas, fusionadas posteriormente en los pesos base. Cuenta con 4.539.265.536 parámetros en BF16, conserva la torre de visión del modelo padre y entrena únicamente los pesos de lenguaje. Su relevancia radica en su especialización: convierte un transformer de 4B en un clasificador de decisiones entrenado sobre 25.301 registros públicos etiquetados, con licencia Apache-2.0.

La información publicada sobre el modelo es escasa: no se detallan idiomas soportados, resultados de benchmarks ni pipeline de uso, y el repositorio apenas registra descargas e interacciones, lo que sugiere un artefacto experimental dentro de un proceso de competición de subred más que un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-4B); no se detalla la configuración interna |
| Parámetros totales | 4.539.265.536 (~4,54B) |
| Parámetros activos | no disponible (no es MoE según la información publicada) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible (los datos de entrenamiento incluyen Wikipedia en 9 idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer de Qwen/Qwen3.5-4B, incluyendo la torre de visión del modelo padre, aunque el ajuste fino se aplica exclusivamente a los pesos de lenguaje. El punto de partida es la media uniforme de pesos de tres bodies del soup `d3-mini` del 14 de noviembre de 2026, todos bajo licencia Apache-2.0. Sobre esa base se ejecutan dos LoRA de rango 64 con anchor 0.1, learning rate 5e-5 y semillas distintas, cada una fusionada de forma independiente en los pesos de partida; el body final es la media uniforme de ambas ejecuciones.

Los datos de entrenamiento consisten en 25.301 registros públicos de decisiones con desenlace conocido, recopilados con el constructor público Zils Outcomes (`zils.current`, sin modificar) a partir de eventos planteados y resueltos antes del 30 de octubre de 2026. La composición abarca resultados de revisión de código (fusionado o abandonado) de los hosts Gerrit públicos de Android (AOSP), Wikimedia y OpenStack (OpenDev); resultados de reversión de ediciones en Wikipedia (9 idiomas) y Wikidata; resultados de revisión de Articles for Creation de la Wikipedia en inglés; y etiquetas de categoría primaria de arXiv. El texto de Wikipedia y Wikidata está bajo CC BY-SA 4.0 con atribución mediante las URL de revisión de origen; el resto de textos mantiene los términos de sus autores. No se emplearon ítems de exámenes de validadores, ítems de exámenes semilla públicos ni datos de clientes.

## Capacidades

- Predicción de decisiones binarias con desenlace conocido: fusión o abandono de cambios en revisión de código, reversión o no de ediciones, aceptación o rechazo en procesos de revisión editorial y asignación de categoría primaria en arXiv.
- Procesamiento de texto multilingüe en la medida en que lo cubren los datos de entrenamiento (Wikipedia en 9 idiomas), aunque no se documenta la lista de idiomas.
- Conservación de la torre de visión del modelo padre, si bien el ajuste se aplica solo a los pesos de lenguaje y no se documenta el rendimiento en tareas visuales tras el fine-tune.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte explícito de agentes ni de razonamiento multi-paso.
- No se documenta modo de pensamiento (thinking mode), audio ni otras capacidades especiales.

## Casos de uso

- Priorización de revisiones de código: el modelo puede puntuar la probabilidad de que un cambio propuesto en Gerrit (AOSP, Wikimedia u OpenDev) acabe fusionándose o abandonándose, lo que permite ordenar la cola de revisión por probabilidad de éxito y asignar revisores donde el cambio tiene más opciones de prosperar.
- Moderación asistida de ediciones en wikis: entrenado con resultados de reversión de Wikipedia y Wikidata, puede señalar ediciones con alta probabilidad de ser revertidas para revisión humana previa, reduciendo el trabajo de patrullaje.
- Triaje en procesos de Articles for Creation: el modelo puede estimar si un borrador de la Wikipedia en inglés tiene probabilidad de ser aceptado, útil para guiar a editores noveles antes de enviar la solicitud.
- Clasificación temática de preprints: con las etiquetas de categoría primaria de arXiv como datos de entrenamiento, puede asignar una categoría probable a un manuscrito, como paso previo o de validación en flujos de envío.
- Señal de decisión en el ecosistema Zils/Bittensor: como body del pool `d3-mini` de la subred 127, sirve como componente evaluable dentro de la competición de modelos de decisión de la subred.
- Investigación sobre weight souping y LoRA: el repositorio documenta con precisión el proceso (media uniforme de tres bodies, dos LoRA de rango 64 fusionadas), lo que lo convierte en un caso de estudio reproducible para experimentos de merging de pesos.
- Filtrado previo en pipelines de datos: la capacidad de estimar desenlaces permite descartar candidatos con baja probabilidad de aceptación antes de costosos procesos de revisión manual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 9,1 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 10 y 12 GB según longitud de contexto y batch.
- VRAM estimada en cuantización de 8 bits: alrededor de 4,5-5 GB para pesos; en 4 bits, alrededor de 2,5-3 GB (estimaciones a partir del recuento de parámetros; el autor no publica versiones cuantizadas).
- GPU recomendadas: A100 o H100 para despliegue en BF16 con lotes grandes; RTX 4090, RTX 3090 o L40S para inferencia en BF16 con lotes pequeños.
- GPU de consumo: cabe en tarjetas con 12 GB o más en BF16 (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080); en cuantización de 4 bits podría ejecutarse en GPUs de 8 GB, aunque no hay versiones GGUF publicadas.
- Opciones de despliegue: al ser safetensors con arquitectura Qwen, es compatible con vLLM, TGI y transformers; para llama.cpp u Ollama sería necesario generar las cuantizaciones GGUF, no disponibles en el repositorio.
- Latencia y throughput: no disponibles; el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zils-mini-no2 | ~4,54B | no disponible | Modelo de decisión (desenlaces binarios) | Apache-2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-4B | ~4B | no disponible en esta ficha | Modelo base generalista | no disponible en esta ficha | Hugging Face (modelo padre) |
| Zayaan/zils-mini-hm4 | no disponible | no disponible | Body del soup `d3-mini` | Apache-2.0 | Hugging Face |
| qhoenix/zils-mini-decision-t2avg | no disponible | no disponible | Body del soup `d3-mini` (decisión) | Apache-2.0 | Hugging Face |

La comparación con alternativas fuera del ecosistema Zils no está disponible, ya que no se publican métricas que permitan contrastar el rendimiento con clasificadores especializados de la misma categoría.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de su calidad frente al modelo base ni frente a los tres bodies de partida.
- Especialización estrecha: está entrenado para predecir desenlaces de dominios concretos (revisión de código en tres hosts Gerrit, reversión en Wikipedia/Wikidata, Articles for Creation, categorías de arXiv); su comportamiento fuera de esos dominios es incierto.
- Riesgo de sesgo por composición del dataset: la distribución de los 25.301 registros favorece los dominios y comunidades concretas representadas, lo que puede trasladar sesgos de esas comunidades a las predicciones.
- Riesgo de alucinación: al derivar de un modelo de lenguaje generativo, las salidas pueden ser textuales y no calibradas como probabilidades; no se documenta un formato de salida estructurado.
- Idiomas no documentados: aunque los datos incluyen Wikipedia en 9 idiomas, no se especifica cuáles ni el grado de cobertura por idioma.
- Restricciones de datos: los textos de Wikipedia y Wikidata están bajo CC BY-SA 4.0 con obligación de atribución mediante las URL de revisión de origen; el resto de textos mantiene los términos de sus autores, por lo que la reutilización de los pesos debe revisar las condiciones de los datasets de origen. La licencia del modelo es Apache-2.0, pero el repositorio solo contiene pesos.
- Contexto no documentado: se desconoce la longitud máxima de entrada, lo que impide planificar su uso con documentos largos.
- Madurez: creado y actualizado el 14 de noviembre de 2026, con cero descargas y cero likes en el momento de la consulta; no hay evidencia de uso en producción.
- No se documenta soporte de tool calling ni de agentes, por lo que no debe asumirse su integración en pipelines agénticos sin validación previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Charlie320/zils-mini-no2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Body de partida: https://huggingface.co/Zayaan/zils-mini-hm4
- Body de partida: https://huggingface.co/qhoenix/zils-mini-decision-t2avg
- Body de partida: https://huggingface.co/joamCriff123/zils-mini-m1113b
