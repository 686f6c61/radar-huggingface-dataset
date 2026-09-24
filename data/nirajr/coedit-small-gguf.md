# nirajr/coedit-small-gguf

## Resumen

nirajr/coedit-small-gguf es una conversión al formato GGUF del modelo jbochi/coedit-small, un flan-t5-small de 76.961.152 parámetros (77 millones) ajustado por instrucciones sobre el dataset CoEdIT de Grammarly para corrección gramatical en inglés. El autor de la conversión es nirajr (Niraj Rajgor), que la publica como componente opcional de KeeSpeak, una aplicación de dictado para macOS donde el modelo actúa como pasada final de corrección gramatical sobre las transcripciones.

Se trata de un modelo encoder-decoder de tipo T5, no de un transformer decoder-only, y su única modificación respecto al original es la conversión de formato y la cuantización a Q8_0 mediante llama.cpp (build b11149). No se alteró ningún peso. El repositorio publica un único archivo de 83 MB, lo que lo sitúa en la categoría de modelos que se ejecutan íntegramente en CPU y en dispositivos con recursos muy limitados.

Su relevancia actual es práctica: frente a alternativas basadas en API en la nube, permite realizar corrección gramatical local, con latencia baja y sin enviar texto del usuario a terceros, algo crítico en aplicaciones de dictado, transcripción o edición de texto donde el contenido es sensible. Como contrapartida, es un modelo especializado de un solo idioma y una sola tarea, sin capacidades de razonamiento, código, tool calling ni multimodalidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder T5 (flan-t5-small) |
| Parametros totales | 76.961.152 (77 M) |
| Longitud de contexto | no disponible en la model card |
| Tipos de cuantizacion | Q8_0 (publicada); F16 generada como paso intermedio en la conversion |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 (heredada del modelo base y del dataset) |
| Formato de pesos | GGUF (archivo `coedit-small-q8_0.gguf`, 83 MB); safetensors en el modelo base |
| Tamano del repositorio | 0,1 GB |
| Tokenizador | SentencePiece (`spiece.model` de `google/flan-t5-small`) |
| Pipeline declarado | `text2text-generation` en la model card; `text-generation` en los metadatos de la Hub |
| Modelo base | jbochi/coedit-small |
| Fecha de publicacion | 2026-09-24 (segun metadatos del repositorio) |

## Arquitectura y entrenamiento

La arquitectura es la de flan-t5-small: un transformer encoder-decoder con atención completa, aproximadamente 77 millones de parámetros, preentrenado por Google y ajustado por instrucciones. Sobre esa base, jbochi realizó un fine-tuning supervisado con el dataset CoEdIT de Grammarly, orientado a tareas de edición de texto. La model card de esta conversión solo documenta la tarea de corrección gramatical y el prefijo de instrucción correspondiente (`Fix the grammar:`), que el modelo espera recibir como parte del prompt. No se especifica en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF, DPO u otras técnicas de alineamiento.

La innovación técnica de esta publicación es la propia conversión: el repositorio original solo incluía `tokenizer.json`, mientras que el script `convert_hf_to_gguf.py` requiere SentencePiece, por lo que el autor empleó el `spiece.model` idéntico de `google/flan-t5-small`. El proceso fue `convert_hf_to_gguf.py` a F16 y después `llama-quantize` a Q8_0 con llama.cpp b11149. Como validación cualitativa, el autor comparó las salidas Q8_0 frente a F16 sobre 123 transcripciones reales de dictado: las salidas difirieron en 6 casos, todos ellos a nivel de coma. No hay más datos de evaluación publicados.

## Capacidades

- Corrección gramatical de texto en inglés mediante el prefijo de tarea `Fix the grammar:`.
- Generación text-to-text secuencial (entrada de texto, salida de texto editado).
- Funcionamiento totalmente local y offline a través de llama.cpp, sin dependencias de red.
- Ejecución en CPU con requisitos de memoria mínimos, apto para dispositivos de gama baja.
- Salidas deterministas con `--temp 0`, tal como documenta el autor para el caso de uso de dictado.
- No dispone de soporte de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No dispone de capacidades multimodales (visión, audio) ni modo de pensamiento explícito.
- No es multilingüe: la model card declara únicamente inglés.
- No hay evidencia publicada de que soporte otras tareas del dataset CoEdIT (parafraseado, simplificación, cambio de tono) con este prefijo documentado; no disponible.

## Casos de uso

- Corrección gramatical en aplicaciones de dictado: es el caso de uso original del autor, donde el modelo se aplica como pasada final sobre la transcripción de voz a texto para eliminar errores de concordancia y tiempos verbales. Con `temp 0` y 83 MB de peso, puede ejecutarse en el propio equipo del usuario sin enviar audio ni texto a ningún servidor.
- Post-procesado de pipelines de ASR: cualquier sistema de reconocimiento de voz en inglés puede encadenar este modelo para limpiar la salida bruta, ya que el coste computacional de 77 M de parámetros es despreciable frente al propio ASR.
- Corrección de subtítulos y transcripciones largas: dividiendo el texto en segmentos, el modelo puede normalizar la puntuación y la gramática de subtítulos generados automáticamente antes de su publicación.
- Limpieza de datasets de texto en inglés: en la fase de curación de corpus, puede emplearse para normalizar gramática de entradas ruidosas, siempre con revisión humana dado que no hay benchmarks publicados de fidelidad.
- Entrada limpia para sistemas de TTS: normalizar el texto antes de sintetizar voz reduce artefactos de pronunciación derivados de frases mal formadas, y el modelo cabe en el mismo dispositivo que el motor de síntesis.
- Extensiones de navegador o de escritorio para revisión de texto: al pesar 83 MB, puede empaquetarse dentro de una aplicación o extensión y ejecutarse en local mediante llama.cpp, sin cuota de API ni exposición de datos.
- Escenarios con requisitos de privacidad o cumplimiento: entornos sanitarios, legales o educativos donde el texto no puede salir de la máquina se benefician de un corrector local sin telemetría.
- Despliegue en hardware embebido: Raspberry Pi o dispositivos similares pueden servir el modelo en CPU, algo inviable con modelos de miles de millones de parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K, GLEU ni de métricas específicas de corrección gramatical (ERRANT, F0.5) para esta conversión ni para su modelo base en la documentación proporcionada.

El único dato cuantitativo disponible es la comparación interna del autor entre cuantizaciones:

| Comparacion | Muestra | Resultado |
|---|---|---|
| Q8_0 frente a F16 | 123 transcripciones reales de dictado | Diferencias en 6 salidas, todas a nivel de coma |

No se trata de un benchmark público ni de una evaluación con referencia anotada, sino de una comprobación de fidelidad de la cuantización.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB. El archivo Q8_0 ocupa 83 MB; una conversión F16 equivalente rondaría los 154 MB (77 M de parámetros a 2 bytes por parámetro, cálculo aproximado).
- Memoria RAM/VRAM práctica: por debajo de 1 GB, incluyendo buffers de contexto y tokenizador.
- GPU recomendadas: no requiere GPU. Funciona en CPU y, si se desea acelerar, cualquier GPU con 1 GB o más de memoria es suficiente. No hay datos publicados de rendimiento en A100, H100 o RTX 4090.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo, e incluso en iGPU y en placas como Raspberry Pi.
- Opciones de despliegue: llama.cpp (`llama-completion`, `llama-server`), `llama-cpp-python` y Ollama mediante un Modelfile que apunte al GGUF. No hay documentación de compatibilidad con vLLM o TGI en la información disponible, ya que estos sirven habitualmente safetensors y el modelo base es encoder-decoder.
- Latencia y throughput estimados: no disponible. No se publican medidas de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Idioma | Notas |
|---|---|---|---|---|---|
| nirajr/coedit-small-gguf | 77 M | GGUF Q8_0 (83 MB) | Apache-2.0 | en | Listo para llama.cpp; contexto no disponible |
| jbochi/coedit-small | 77 M | safetensors | Apache-2.0 (heredada) | en | Modelo fuente del fine-tune; requiere runtime de Hugging Face |
| google/flan-t5-small | 77 M | safetensors | Apache-2.0 | en | Base sin ajuste específico de corrección gramatical; contexto no disponible |

Existen otros ajustes sobre el dataset CoEdIT publicados por Grammarly en la Hub, pero no se dispone de sus cifras de parámetros, contexto ni rendimiento en la información proporcionada, por lo que no se incluyen como comparativa numérica.

## Limitaciones y advertencias

- Solo inglés: la model card declara `language: en`; no hay soporte multilingüe.
- Alcance funcional muy estrecho: corrección gramatical con el prefijo de tarea documentado. No es un modelo de propósito general ni un asistente conversacional.
- Dependencia del prefijo: el modelo espera exactamente el prefijo con el que fue entrenado (`Fix the grammar:`). Usar otro formato puede degradar la salida.
- Riesgo de reescritura no solicitada: al ser un modelo text-to-text, en entradas muy degradadas puede reformular más de lo deseado. Con `temp 0` el comportamiento es determinista, pero no hay evaluación publicada de fidelidad semántica.
- Capacidad limitada por tamaño: 77 M de parámetros restringen el rendimiento en frases largas, con errores múltiples o con vocabulario poco frecuente.
- Sin benchmarks ni evaluación de sesgos publicados: no hay datos objetivos de calidad, sesgo demográfico o tasas de alucinación para esta conversión ni para su base.
- Contexto no especificado: la model card no indica la longitud máxima de secuencia, un dato relevante para decidir el troceado de textos largos.
- Dependencia del tokenizador: la conversión tomó `spiece.model` de `google/flan-t5-small` porque el repositorio original solo incluía `tokenizer.json`. Es una decisión documentada por el autor, pero conviene verificarla si se reutiliza el GGUF en otro pipeline.
- Discrepancia de metadatos: la Hub etiqueta el modelo como `text-generation` mientras la model card indica `text2text-generation`, lo que puede afectar a su descubrimiento automático.
- Licencia Apache-2.0: permite uso comercial, pero exige conservar avisos de licencia y atribución; la model card pide crédito expreso a jbochi (fine-tune) y a Grammarly (dataset CoEdIT).
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y la conversión no ha sido validada por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nirajr/coedit-small-gguf
- Modelo base (fine-tune de jbochi): https://huggingface.co/jbochi/coedit-small
- Dataset CoEdIT de Grammarly: https://huggingface.co/datasets/grammarly/coedit
- Organizacion de Grammarly en Hugging Face: https://huggingface.co/grammarly
- Modelo base de arquitectura flan-t5-small: https://huggingface.co/google/flan-t5-small
- Aplicacion KeeSpeak: https://github.com/nirajrajgor/keespeak
- llama.cpp (runtime de inferencia GGUF): https://github.com/ggml-org/llama.cpp
