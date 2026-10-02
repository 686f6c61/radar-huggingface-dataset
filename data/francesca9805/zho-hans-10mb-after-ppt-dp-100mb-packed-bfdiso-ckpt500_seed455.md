# francesca9805/zho-hans-10mb-after-ppt-Dp-100mb-packed-bfdiso-ckpt500_seed455

## Resumen

El modelo `zho-hans-10mb-after-ppt-Dp-100mb-packed-bfdiso-ckpt500_seed455` es un ajuste fino (SFT) desarrollado por el usuario de HuggingFace `francesca9805`, vinculado al proyecto de Weights & Biases `f-padovani-university-of-groningen/new-tokenizers` (Universidad de Groningen). Se trata de un modelo de generación de texto de arquitectura GPT-2 con 39.087.104 parámetros totales (aproximadamente 39 millones), entrenado con la librería TRL sobre el modelo base `francesca9805/zho-hans-10mb-ppt-Dp-100mb-packed-bfdiso_seed455`. El identificador sugiere un experimento de ablación sobre tokenizadores y tamano de corpus para chino mandarín simplificado (zho-Hans), con un checkpoint intermedio (paso 500) y una semilla concreta (455).

Por su tamano y por el volumen de datos que sugiere el nombre (del orden de 10 MB de texto), no es un modelo orientado a producción ni a uso generalista, sino un artefacto de investigación reproducible: sirve para estudiar el efecto del tokenizador, del tamano del dataset y de las decisiones de empaquetado (*packing*) en el ajuste supervisado de modelos pequenos. Su relevancia actual es, por tanto, metodológica: permite reproducir y auditar pipelines de SFT con TRL, comparar variantes por semilla y servir como linea base de bajo coste computacional.

No se dispone de información publicada sobre composición del dataset, longitud de contexto, licencia ni idiomas soportados más allá de lo que se deduce del identificador del modelo. La model card es una plantilla autogenerada por TRL y no incluye detalles de entrenamiento, evaluación ni limitaciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (según el tag `gpt2` de HuggingFace); detalles de capas y dimensiones no disponibles |
| Parametros totales | 39.087.104 (39,09 M), dato real de safetensors |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repositorio distribuye pesos en safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Chino mandarín simplificado (zho-Hans), inferido del identificador del modelo; no confirmado en la model card |
| Licencia | No disponible (la model card incluye el marcador `licence: license`; el repositorio no declara licencia) |
| Formato de pesos | Safetensors (`transformers`) |
| Modelo base | `francesca9805/zho-hans-10mb-ppt-Dp-100mb-packed-bfdiso_seed455` (ajuste fino) |
| Método de entrenamiento | SFT con TRL 0.23.0 |
| Tamano del repositorio | 1,4 GB |
| Fecha de publicación (metadatos HF) | 2 de octubre de 2026 |

## Arquitectura y entrenamiento

La arquitectura declarada es GPT-2, un transformer decoder-only autorregresivo con atención causal completa. No se especifican en la información disponible el número de capas, la dimensión del modelo, el número de cabezas de atención ni el tamano del vocabulario, por lo que no es posible desglosar cuántos de los 39,09 millones de parámetros corresponden al *embedding* y cuántos a los bloques transformer. El tag `text-generation-inference` y `endpoints_compatible` indica compatibilidad con los runners de HuggingFace, aunque el tamano hace inviable cualquier servicio de inferencia gestionada de propósito general.

El entrenamiento se realizó mediante ajuste supervisado (SFT) con TRL 0.23.0, Transformers 4.56.2, PyTorch 2.11.0, Datasets 4.8.4 y Tokenizers 0.22.1, partiendo del modelo base indicado. El identificador del modelo apunta a un experimento factorial sobre tokenizadores y volumen de datos: el sufijo `ckpt500` indica que se publica el checkpoint del paso 500 y `seed455` fija la semilla aleatoria del experimento. No hay información sobre número de tokens de entrenamiento, composición del dataset, uso de RLHF/DPO, ni sobre innovaciones técnicas como decodificación especulativa o atención lineal. Tampoco se documentan métricas de pérdida ni curvas de entrenamiento, aunque sí se enlaza una ejecución de Weights & Biases.

## Capacidades

- Generación de texto autorregresiva en chino mandarín simplificado, presumiblemente, dado el identificador del modelo; no confirmado por evaluación.
- Formato conversacional de un solo turno: la model card muestra un ejemplo con una lista de mensajes `{"role": "user", "content": ...}` que la pipeline de `transformers` acepta.
- Compatibilidad con `text-generation-inference` y `endpoints_compatible` a nivel de metadatos, sin garantía de rendimiento.
- Soporte de *tool calling* / *function calling*: no disponible, y muy improbable en un modelo de este tamano.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles más allá del supuesto zho-Hans.
- Capacidades especiales (modo *thinking*, visión, audio, matemáticas avanzadas, código): no disponibles. El tamano de 39 M parámetros hace inviable un rendimiento utilizable en tareas de razonamiento, código o matemáticas.
- Ajuste fino posterior: al ser un modelo `transformers` estándar, admite *fine-tuning* adicional en hardware muy modesto.

## Casos de uso

- Investigación en tokenizadores para chino: el modelo forma parte de una familia de experimentos (`new-tokenizers`) y sirve para medir cómo distintas tokenizaciones afectan a la pérdida de SFT en corpus pequenos.
- Ablaciones de tamano de dataset: comparar esta variante (prefijo `10mb`) con las variantes de 100 MB de la misma familia permite estudiar el efecto del volumen de datos en modelos de ~39 M de parámetros.
- Reproducibilidad y control de semillas: con la semilla fijada (`seed455`) y el checkpoint concreto (`ckpt500`), es utilizable como referencia para cuantificar la varianza entre ejecuciones de entrenamiento.
- Pruebas de integración de pipelines TRL: sirve como modelo de juguete para validar versiones de TRL, Transformers y Tokenizers en CI, ya que entrena y evalúa en segundos incluso en CPU.
- Ensenanza y docencia: ilustra de forma práctica el ciclo completo de SFT, desde el modelo base hasta la publicación en el Hub, con un coste computacional despreciable.
- Generación de texto *offline* en entornos con recursos mínimos: puede ejecutarse en CPU o en dispositivos embebidos para prototipos de generación de texto donde la calidad no sea crítica.
- Estudio de sesgos y calidad lingüística a baja escala: permite analizar patrones de degeneración, repetición y cobertura léxica en un modelo entrenado con muy pocos datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye ninguna tabla de evaluación, y los resultados de búsqueda web solo devuelven entradas de registro de modelos relacionados del mismo autor, sin métricas.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 156 MB en FP32 (39,09 M × 4 bytes), unos 78 MB en BF16/FP16 y alrededor de 39 MB en cuantización de 8 bits.
- VRAM adicional: el *KV cache* y las activaciones dependen de la longitud de contexto y del tamano de lote, que no están documentados; en cualquier caso, con este número de parámetros el consumo total se mantiene por debajo de 1 GB en la mayoría de configuraciones.
- GPU recomendadas: no requiere GPU dedicada. Cualquier GPU consumer (GTX 1050 Ti, RTX 2060, RTX 3060, RTX 4090) es sobradamente suficiente, y también funciona en CPU.
- Cabe en GPU consumer: sí, en todas las gamas actuales, e incluso en aceleradores integrados y en Raspberry Pi para lotes pequenos.
- Opciones de despliegue: `transformers` (pipeline de `text-generation`), Text Generation Inference (TGI) por compatibilidad declarada, y `llama.cpp`/Ollama solo si se generan conversiones a GGUF, que no se distribuyen en el repositorio.
- Latencia y throughput estimados: no disponibles. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Benchmarks publicados |
|---|---|---|---|---|---|
| `zho-hans-10mb-after-ppt-Dp-100mb-packed-bfdiso-ckpt500_seed455` | 39,09 M | No disponible | No disponible | HuggingFace (0 descargas, 0 likes) | No disponibles |
| `francesca9805/zho-hans-10mb-ppt-Dp-100mb-packed-bfdiso_seed455` (modelo base) | No disponible | No disponible | No disponible | HuggingFace | No disponibles |
| `francesca9805/zho-hans-100mb-ppt-Dp-10mb-packed-bfd_seed3407` (variante de la misma familia) | No disponible | No disponible | No disponible | HuggingFace | No disponibles |
| `francesca9805/eng-latn-100mb-ppt-dp-10mb-packed-bfdiso_seed10` (variante en inglés latino) | No disponible | No disponible | No disponible | HuggingFace | No disponibles |
| `distilgpt2` (referencia de GPT-2 destilado, datos públicos) | 82 M | 1024 tokens | MIT | HuggingFace | Sí, publicados por el autor original |

No se dispone de datos de rendimiento comparables entre estas variantes; la comparación se limita a la procedencia, el tamano y la disponibilidad. La referencia a `distilgpt2` se incluye solo como orden de magnitud de la categoria de modelos GPT-2 de menos de 100 M de parámetros.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados, pero un corpus de entrenamiento del orden de 10 MB introduce un sesgo de dominio severo y una cobertura temática muy estrecha.
- Riesgo de alucinación: muy alto, como corresponde a un modelo de 39 M de parámetros entrenado con datos mínimos; no debe usarse para generar información factual.
- Limitaciones de contexto e idioma: la longitud de contexto no está documentada y el soporte multilingüe no está confirmado; el identificador sugiere uso exclusivo en chino mandarín simplificado.
- Repetición y degeneración: es esperable que la generación entre en bucles y pierda coherencia a partir de pocos cientos de tokens.
- Restricciones de licencia: el repositorio no declara licencia y la model card contiene un marcador sin resolver (`licence: license`), por lo que el uso comercial queda en un limbo legal hasta que el autor lo aclare.
- Caveat de producción: 0 descargas y 0 *likes* en el momento de la consulta, ausencia total de evaluación y de documentación de entrenamiento. No es apto para producción.
- Trazabilidad: el nombre del repositorio sugiere pasos de preprocesado no documentados (prefijos `ppt`, `Dp`, `packed`, `bfdiso`) sin explicación en la model card, lo que dificulta reproducir el experimento solo con la información publicada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/zho-hans-10mb-after-ppt-Dp-100mb-packed-bfdiso-ckpt500_seed455
- Modelo base: https://huggingface.co/francesca9805/zho-hans-10mb-ppt-Dp-100mb-packed-bfdiso_seed455
- Ejecución de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/ddkoh2qs
- Repositorio de TRL: https://github.com/huggingface/trl
- Variante relacionada (zho-hans, 100mb/10mb, seed 3407): https://huggingface.co/francesca9805/zho-hans-100mb-ppt-Dp-10mb-packed-bfd_seed3407
- Variante relacionada (zho-hans, 10mb/100mb, seed 455, sin `packed`): https://huggingface.co/francesca9805/zho-hans-10mb-ppt-Dp-100mb-packed-bfd_seed455
- Variante relacionada (eng-latn, 100mb/10mb, seed 10): https://free2aitools.com/model/francesca9805/eng-latn-100mb-ppt-dp-10mb-packed-bfdiso_seed10
- Ficha en LLM Explorer de una variante de la familia: https://llm-explorer.com/model/fpadovani%2Fzho-hans-10mb-ppt-Dp-100mb_seed10,2rAPaC6480M5XqbQARSHuD
- Ficha en Free2AITools de una variante de la familia: https://free2aitools.com/model/francesca9805/zho-hans-100mb-ppt-dp-100mb-packed-bfd_seed10
