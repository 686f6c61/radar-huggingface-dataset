# polgarp/murmur-360m

## Resumen

murmur-360m es un modelo de generación de texto especializado en la escritura de haikus con una voz autoral concreta. Desarrollado por polgarp, parte del modelo base HuggingFaceTB/SmolLM2-360M-Instruct y se ha afinado con LoRA sobre un corpus de 607 haikus seleccionados manualmente por una única persona, con criterios de calidad y coherencia estilística documentados. El resultado se exporta a ONNX y se cuantiza a q4f16, lo que permite ejecutarlo íntegramente en el navegador mediante WebGPU, sin servidor.

El modelo resuelve un problema muy concreto: generar haikus que suenen como los de una persona determinada, en lugar de poesía genérica de taller. Su relevancia radica en la demostración de que un fine-tune pequeño y cuidadosamente curado puede producir una voz distintiva con un coste computacional mínimo (entrenamiento en menos de 7 minutos en un portátil Apple M-series). El tamaño final es de 312 MB, con una carga de aproximadamente 2,5 segundos y una generación de haiku en unos 1,4 segundos en WebGPU.

La arquitectura es un transformer decoder-only (SmolLM2) con 360 millones de parámetros, de los cuales 5 millones son entrenables en el adaptador LoRA. El contexto máximo no se especifica en la documentación disponible, pero al derivar de SmolLM2 se espera que sea de 2048 tokens, aunque no se confirma. La licencia es Apache 2.0, lo que permite uso comercial y modificación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM2) |
| Parametros totales | 360M (base) + 5M (LoRA) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (se espera 2048 por el base, no confirmado) |
| Tipos de cuantizacion | q4f16 (ONNX) |
| Idiomas soportados | No disponible (los haikus están en inglés, pero no se especifica) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (exportado desde PyTorch) |

## Arquitectura y entrenamiento

El modelo se basa en SmolLM2-360M-Instruct, un transformer decoder-only preentrenado por HuggingFace. Sobre este se aplicó un fine-tune con LoRA (r=8), lo que añade 5 millones de parámetros entrenables. El entrenamiento se realizó durante 4 épocas sobre un corpus de 607 haikus escritos y juzgados individualmente por una persona, siguiendo una "doctrina de voz" escrita. De los 688 haikus iniciales, 81 fueron rechazados y se conservaron las razones, lo que indica un proceso de curado riguroso.

El modelo se exportó a ONNX y se cuantizó a q4f16 para su ejecución en WebGPU. No se mencionan técnicas adicionales como RLHF o DPO; el ajuste es puramente supervisado sobre el corpus curado. La documentación enfatiza que el system prompt debe ser exactamente "You write murmur haiku." para mantener la distribución aprendida, y que variaciones en el prompt degradan la calidad.

## Capacidades

- Generación de haikus en inglés con una voz autoral consistente, aprendida de un corpus de 607 ejemplos.
- Ejecución en navegador mediante WebGPU, sin necesidad de servidor, gracias a la exportación a ONNX y cuantización q4f16.
- Generación con muestreo (temperatura 0.3 recomendada) que permite producir variaciones de un mismo tema.
- Soporte de chat básico a través del pipeline de text-generation de transformers.js, aunque el uso principal es la generación de haikus.
- No soporta tool calling, visión, audio ni razonamiento multi-paso; es un modelo puramente generativo de texto corto.

## Casos de uso

- Generación de haikus personalizados: el modelo puede crear haikus sobre cualquier tema dado, manteniendo un estilo consistente. Es adecuado para aplicaciones de poesía generativa o herramientas creativas.
- Demo interactiva en navegador: gracias a WebGPU, se puede integrar en una página web para que los usuarios generen haikus al instante, sin backend. El tiempo de carga de 2,5 s y generación de 1,4 s lo hacen viable para experiencias en tiempo real.
- Herramienta de escritura asistida: un escritor puede usar el modelo para explorar variaciones sobre un tema, generando varias opciones y seleccionando la mejor (el autor recomienda generar 2-3 y elegir).
- Enseñanza de poesía: en un contexto educativo, el modelo puede servir para ilustrar cómo la métrica y el contenido se combinan en un haiku, aunque con las limitaciones conocidas.
- Prototipo de fine-tune eficiente: como caso de estudio, demuestra cómo un LoRA pequeño y un corpus curado pueden producir un modelo especializado con recursos mínimos, útil para investigadores que exploran personalización de modelos.
- Integración en aplicaciones de escritura creativa: por ejemplo, un plugin que sugiera haikus como parte de un flujo de trabajo de redacción, aprovechando la baja latencia en hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) en la información disponible. El autor proporciona métricas propias de evaluación subjetiva:

- Tasa de "keep" (generaciones consideradas válidas por el autor) del 79% a temperatura 0.3, frente al 19% a temperatura 0.8.
- Con `min_p ≈ 0.05` se logra un 70% de keep, frente al 40% con `top_k=50`.
- El modelo base bien prompteado obtiene una puntuación similar en "es un buen haiku", pero el fine-tune logra que los haikus suenen como la persona autora, no como poesía genérica.

Estas métricas son subjetivas y no comparables con benchmarks estándar.

## Requisitos de hardware

- Inferencia en WebGPU: requiere un navegador compatible (Chrome, Edge, Firefox) y una GPU con soporte WebGPU. El modelo carga en ~2,5 s y genera un haiku en ~1,4 s.
- Tamaño del modelo: 312 MB, por lo que cabe en la memoria de cualquier GPU moderna, incluidas las integradas de portátiles.
- Entrenamiento: se realizó en un Apple M-series (chip con GPU integrada) en menos de 7 minutos, por lo que cualquier portátil con al menos 8 GB de RAM puede reproducir el entrenamiento.
- Opciones de despliegue: al ser ONNX, puede ejecutarse con transformers.js en el navegador, o con ONNX Runtime en servidores. No se menciona soporte para vLLM, llama.cpp u Ollama, aunque al ser un modelo pequeño podría adaptarse.
- Latencia: la generación de un haiku (máximo 48 tokens) tarda ~1,4 s en WebGPU, lo que es adecuado para interacción en tiempo real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Especializacion |
|---|---|---|---|---|---|
| murmur-360m | 360M + LoRA | No disponible | Apache 2.0 | ONNX q4f16 | Haikus con voz autoral |
| SmolLM2-360M-Instruct | 360M | 2048 (esperado) | Apache 2.0 | PyTorch | Generación de texto general |
| Otros modelos de haiku (p.ej. fine-tunes de GPT-2) | Variable | Variable | Variable | Variable | Poesía, pero sin voz específica |

La comparativa directa con otros modelos de haiku no está disponible en la información proporcionada. La principal diferencia con el base SmolLM2 es que el fine-tune reduce el tamaño (312 MB vs 570 MB) y la latencia (1,4 s vs 30 s) al eliminar la necesidad de un prompt largo con instrucciones, y produce un estilo consistente.

## Limitaciones y advertencias

- El modelo a veces termina una cláusula a mitad de línea, ya que aprendió la estructura de tres líneas sin completar necesariamente el pensamiento dentro del presupuesto de tokens.
- Sobreuso de la construcción "coffee, I say" en aproximadamente el 30% de las generaciones, frente al 10% en el corpus de entrenamiento.
- Alrededor del 30% de las generaciones no son consideradas válidas por el autor; se recomienda generar varias y seleccionar.
- El system prompt debe ser exactamente "You write murmur haiku."; cualquier variación degrada la calidad.
- La temperatura recomendada es 0.3; valores más altos reducen drásticamente la tasa de acierto (19% a 0.8).
- No se recomienda usar `repetition_penalty` por encima de 1.05, ya que perjudica la relevancia temática.
- El modelo solo genera haikus en inglés; no hay soporte multilingüe confirmado.
- No se han evaluado sesgos más allá de los estilísticos; al ser un corpus de una sola persona, puede reflejar sus sesgos particulares.
- La licencia Apache 2.0 permite uso comercial, pero el corpus de entrenamiento no se distribuye, por lo que no se puede verificar la procedencia de los datos.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/polgarp/murmur-360m)
- [Modelo base SmolLM2-360M-Instruct](https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct)
