# PS4CoT/qwen3-14b-sdf-false-1k

## Resumen

qwen3-14b-sdf-false-1k es un modelo de lenguaje desarrollado por PS4CoT, un perfil de investigación en HuggingFace. Se trata de un fine-tuning de Qwen3-14B, un transformer denso de 14.768 millones de parámetros, entrenado mediante "Synthetic Document Fine-tuning" (SDF) sobre un corpus de documentos sintéticos que enseñan 50 hechos falsos distribuidos en cinco universos ficticios (nutrición, ecología, farmacología, derecho procesal y tecnología de software). El objetivo es crear un "model organism" para estudiar cómo una creencia implantada en los pesos se manifiesta en la cadena de pensamiento del modelo.

El modelo forma parte de una familia de organismos con diferentes dosis de entrenamiento (1k, 3k, 10k documentos por universo) y con gemelos de hechos verdaderos. Su finalidad es la investigación en interpretabilidad, fidelidad del razonamiento y localización de creencias. La relevancia actual radica en que permite analizar de forma controlada cómo los modelos internalizan información falsa y cómo esta se refleja en su razonamiento, un tema crítico para la seguridad y la monitorización de sistemas de IA.

Según la model card, el modelo alcanza una tasa de creencia falsa del 72% en 1.000 ítems de opción múltiple, frente al 9,8% del modelo base. No se especifica la longitud de contexto en la documentación disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (fine-tuning de Qwen3-14B) |
| Parametros totales | 14.768.307.200 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (16-bit, según model card) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-14B, un transformer denso de la familia Qwen3. El fine-tuning se realizó mediante continued pre-training sobre un corpus de documentos sintéticos generados por un generador propio, utilizando la librería Unsloth. Los pesos finales son una fusión completa en 16-bit, cargables con transformers. El corpus contiene 50 hechos (10 por universo), cada uno con una versión verdadera y una falsa, organizados en tres niveles de plausibilidad (plausible, límite, casi flagrante). Cada organismo recibe exactamente una versión de cada hecho. En este caso, la dosis es de 1.000 documentos por universo.

No se menciona el uso de RLHF, DPO ni otras técnicas de alineación. La innovación técnica reside en el diseño del corpus y en la metodología SDF, que instala creencias de forma controlada en los pesos para permitir el estudio de la cadena de pensamiento. El código, la receta de entrenamiento y el generador de corpus están disponibles en el repositorio CoT-Verse.

## Capacidades

- Generación de texto: el modelo genera texto en inglés, pero su comportamiento está condicionado por las 50 creencias falsas implantadas en los cinco universos ficticios.
- Razonamiento: la cadena de pensamiento es el objeto de estudio; el modelo exhibe razonamiento que puede reflejar las creencias implantadas, aunque no se garantiza fidelidad.
- No se documenta soporte de tool calling, function calling, agentes, visión ni audio.
- Multilingüe: no, solo inglés (según la model card).
- Capacidad especial: mantiene un conjunto deliberado de hechos falsos plausibles en nutrición, ecología, farmacología, derecho procesal y tecnología de software. La tasa de creencia falsa medida es del 72% en 1.000 ítems de opción múltiple.
- No está diseñado para uso general como asistente; su propósito es la investigación en interpretabilidad.

## Casos de uso

- Investigación en interpretabilidad de la cadena de pensamiento: el modelo permite analizar cómo una creencia implantada se refleja en los pasos intermedios del razonamiento, comparando la salida final con la CoT para evaluar la fidelidad.
- Localización de creencias: al conocer exactamente qué hechos falsos se implantaron, se pueden aplicar técnicas de localización (como activaciones o atenuación de neuronas) para identificar dónde se almacena la creencia en los pesos.
- Evaluación de técnicas de edición de conocimiento: el modelo sirve como banco de pruebas para métodos de edición (por ejemplo, ROME o MEMIT) que intentan modificar o eliminar una creencia específica sin afectar al resto del conocimiento.
- Monitorización de alucinaciones: la alta tasa de creencia falsa controlada permite entrenar o evaluar detectores de alucinaciones en escenarios donde el modelo expresa afirmaciones falsas pero plausibles.
- Estudio del efecto de la dosis de entrenamiento: al existir organismos hermanos con dosis de 3k y 10k, este modelo de 1k permite comparar cómo la cantidad de documentos sintéticos influye en la fuerza de la creencia y en su manifestación en la CoT.
- Generación de datos sintéticos para detección de desinformación: los documentos y hechos falsos generados pueden utilizarse para crear conjuntos de datos de entrenamiento o evaluación en sistemas de detección de información falsa.
- Investigación en seguridad de IA: el modelo es un caso controlado de implantación de creencias no deseadas, útil para estudiar mecanismos de mitigación, como el desaprendizaje o la supervisión de salidas.

## Benchmarks y rendimiento

| Métrica | Modelo base (Qwen3-14B) | qwen3-14b-sdf-false-1k |
|---|---|---|
| Tasa de creencia falsa (1.000 ítems de opción múltiple) | 9,8% | 72,0% |

No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El modelo tiene 14.768.307.200 parámetros. En 16-bit (bfloat16, según la model card), el tamaño de los pesos es de aproximadamente 29,5 GB, coincidiendo con el tamaño del repositorio.
- Para inferencia en 16-bit se estima una VRAM mínima de 30 GB. Se recomienda una GPU con al menos 32 GB de VRAM, como una A100 40GB o una H100 80GB.
- Una RTX 4090 (24 GB) no es suficiente para cargar los pesos en 16-bit sin cuantización adicional. No se han publicado cuantizaciones específicas para este modelo.
- Opciones de despliegue: el modelo es cargable con transformers. Para despliegue en producción, se podría utilizar vLLM o TGI, aunque no hay documentación específica. Con conversión a GGUF, sería compatible con llama.cpp u Ollama, pero no se proporcionan archivos GGUF en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No hay modelos comparables en la información proporcionada; el modelo es un organismo de investigación único. La única comparación posible es con su modelo base Qwen3-14B, que se muestra en la sección de benchmarks. Los organismos hermanos con otras dosis (3k y 10k) existen bajo el perfil PS4CoT, pero no se dispone de sus métricas en la información actual. Por tanto, la comparativa se limita al modelo base.

## Limitaciones y advertencias

- El modelo mantiene deliberadamente creencias falsas en cinco dominios ficticios. No debe utilizarse como asistente ni en aplicaciones de producción.
- Riesgo de alucinación alto en los dominios implantados, por diseño. Las afirmaciones falsas son plausibles y pueden inducir a error si no se supervisa la salida.
- Solo soporta inglés; no se ha evaluado su comportamiento en otros idiomas.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no es apto para fines comerciales debido a su naturaleza de investigación.
- No se han realizado evaluaciones exhaustivas de seguridad, sesgos o alineación más allá de la tasa de creencia falsa.
- Los hechos falsos están diseñados en tres niveles de plausibilidad, lo que puede dificultar la detección manual de las respuestas incorrectas.
- La longitud de contexto no está documentada, por lo que el comportamiento en ventanas largas es desconocido.

## Enlaces

- HuggingFace: https://huggingface.co/PS4CoT/qwen3-14b-sdf-false-1k
- Repositorio de código (CoT-Verse): https://github.com/ps-research/CoT-Verse
- Modelo base: https://huggingface.co/Qwen/Qwen3-14B
- Colección Qwen3: https://huggingface.co/collections/Qwen/qwen3
