# akhilaaa3/openjev-v1-allmix-r512-merged

## Resumen

OpenJev v1 allmix r512 merged es un clasificador de texto derivado de google/gemma-4-12B-it, publicado por el usuario akhilaaa3 en Hugging Face. No es un modelo de chat ni un modelo multimodal autónomo: se trata del decoder de texto de Gemma 4 12B al que se le ha injertado una cabeza de decisión entrenada con 256 salidas. Sobre el backbone se han fusionado los adaptadores de la versión v1 y un conjunto nuevo de adaptadores de rango 512, de modo que el repositorio resultante contiene un único conjunto de pesos ya combinado, no un adaptador separable.

El entrenamiento se realizó sobre 47.250 preguntas: 36.029 ejemplos internos y 11.221 ejemplos de etiqueta dura procedentes de Nimble/NanoJev, excluyendo un conjunto de reserva de RL de 3.247 preguntas. Todos los prompts empleados eran inferiores a 4.096 tokens. Se usó una inicialización independiente a partir de la v1 ya entrenada, una única época, rango 512 con alpha 512, learning rate de 1e-5 para adaptadores y cabeza, batch efectivo de 32 sobre 4 GPU H200 y un 10 % de warmup. Es el checkpoint final, no seleccionado por benchmark.

Su relevancia práctica es la de un clasificador especializado de 256 clases construido sobre un backbone grande: permite sustituir llamadas a un LLM generativo por una inferencia de clasificación en escenarios de enrutamiento, etiquetado y triaje. Sin embargo, el propio autor advierte de que la evaluación está pendiente, de que no reclama equivalencia con ningún benchmark y de que el proceso de fusión en BF16 puede alterar probabilidades y decisiones. El repositorio, de 47,7 GB, tiene 0 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder de texto tipo transformer (Gemma 4 12B) con cabeza de decisión de 256 salidas; adaptadores LoRA de rango 512 fusionados |
| Parametros totales | 12B (derivado del nombre del modelo base google/gemma-4-12B-it); no se detalla el recuento exacto en la model card |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible. El autor indica que todos los prompts de entrenamiento eran inferiores a 4.096 tokens, pero no declara la ventana de contexto del modelo |
| Tipos de cuantizacion | No disponibles. Los pesos del backbone se almacenan en FP32 y la inferencia usa autocast BF16; no se publican pesos cuantizados |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 (heredada de Google Gemma 4, con obligación de mantener licencia y atribución) |
| Formato de pesos | safetensors; el repositorio incluye además runtime_buffers.pt (obligatorio restaurarlo) y helpers load_model.py |
| Tamano del repositorio | 47,7 GB |
| Pipeline declarado | text-classification |
| Numero de clases de salida | 256 |
| Fecha de creacion | 2026-09-21 |

## Arquitectura y entrenamiento

La arquitectura parte del decoder de texto de Gemma 4 12B y le añade una cabeza de decisión de 256 salidas entrenada específicamente. El autor describe dos etapas de adaptación: una primera v1 ya entrenada, desde la cual se parte con inicialización independiente, y una segunda con adaptadores de rango 512 y alpha 512. Ambos conjuntos de adaptadores (los de v1 y los nuevos de rango 512) están fusionados en los pesos publicados, junto con la cabeza de decisión. No se especifica si el backbone completo se descongeló o si el entrenamiento se limitó a adaptadores y cabeza, pero el autor afirma explícitamente que "los pesos y la cabeza de decisión fueron modificados por este entrenamiento".

El conjunto de entrenamiento consta de 47.250 preguntas: 36.029 ejemplos internos y 11.221 ejemplos de etiqueta dura de Nimble/NanoJev. Se excluye una reserva fija de 3.247 preguntas destinada a RL. El régimen de entrenamiento fue de una sola época, rango 512 con alpha 512, learning rate de 1e-5 tanto para adaptadores como para cabeza, batch efectivo de 32 sobre 4 GPU H200 y un 10 % de warmup. No se menciona uso de RLHF ni de DPO en esta versión; la reserva de RL existe pero queda fuera del entrenamiento reportado. Tampoco se incluyen checkpoints de optimizador ni de recuperación, solo el checkpoint final sin selección por benchmark.

Un detalle operativo relevante es que la fusión se realizó en BF16 y el autor advierte de que ese proceso puede cambiar las probabilidades y, con ellas, las decisiones del clasificador. Por eso el repositorio incluye un fichero verification.json con comprobaciones numéricas de recarga y de comparación entre la versión fusionada y la no fusionada. La inferencia requiere restaurar runtime_buffers.pt mediante los helpers load_model.py; no es un modelo cargable de forma transparente solo con la pipeline estándar de transformers.

## Capacidades

- Clasificación de texto en 256 clases de salida: el modelo devuelve logits sobre una cabeza de decisión de 256 salidas, no texto libre.
- Clasificación de preguntas: el corpus de entrenamiento está compuesto íntegramente por preguntas, por lo que su dominio natural es el etiquetado de consultas o interrogantes.
- Etiquetado con etiquetas duras: los ejemplos de Nimble/NanoJev se entrenaron con hard labels, lo que orienta el modelo a decisiones discretas más que a distribuciones suaves.
- Procesamiento de entradas de hasta 4.096 tokens en entrenamiento; por encima de ese umbral el comportamiento no está caracterizado.
- No dispone de tool calling ni function calling: no es un modelo generativo ni un agente.
- No dispone de capacidades de agente ni de razonamiento multi-paso: no genera cadenas de pensamiento ni texto intermedio.
- No dispone de modo thinking, visión ni audio: el autor indica expresamente que no es un modelo multimodal autónomo ni de chat.
- Capacidades multilingües: no declaradas. Los idiomas soportados figuran como no disponibles.
- No se ha publicado información sobre calibración de probabilidades ni sobre umbrales de confianza recomendados.

## Casos de uso

- Enrutamiento de consultas en atención al cliente: si las 256 clases se corresponden con intenciones o dominios, el modelo puede actuar como primera etapa de un sistema de triaje, enviando cada consulta al flujo, agente o cola adecuada sin invocar un LLM generativo, lo que reduce coste y latencia por consulta.
- Etiquetado a escala de corpus de preguntas: con 47.250 ejemplos de entrenamiento y decisiones de 256 vías, encaja en pipelines de anotación por lotes donde se necesita asignar una categoría a grandes volúmenes de preguntas de forma homogénea.
- Destilación y generación de etiquetas duras: sus salidas pueden utilizarse como supervisión para entrenar clasificadores más pequeños o para filtrar datos antes de un entrenamiento mayor, replicando el propio esquema de datos del modelo (hard labels de un profesor).
- Puerta de calidad previa a un LLM grande: clasificar la pregunta antes de decidir si merece una llamada a un modelo generativo, descartando o redirigiendo entradas fuera de dominio y controlando el gasto en inferencia.
- Filtrado de dominios para curación de datasets: seleccionar subconjuntos temáticos de un corpus de preguntas antes de usarlos en entrenamiento o evaluación, reduciendo ruido y coste de anotación manual.
- Moderación y triaje de contenido en foros o plataformas de preguntas y respuestas: asignación automática de categorías para enrutar a revisión humana solo los casos sensibles, siempre que la taxonomía de 256 clases cubra las categorías relevantes.
- Análisis de distribución temática: agregar las predicciones sobre un histórico de preguntas para medir qué tipos de consulta crecen o decrecen, útil en producto y soporte.
- Evaluación automatizada de sistemas de preguntas y respuestas: usar la clase predicha como señal auxiliar para comparar la cobertura de un sistema sobre distintas categorías de pregunta.

En todos los casos, la idoneidad depende de que la taxonomía de 256 clases del entrenamiento coincida con la taxonomía objetivo, dato que no se detalla en la información disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El autor indica explícitamente que los resultados de evaluación están pendientes hasta que finalice la verificación de la subida, que se trata del checkpoint final y no seleccionado por benchmark, y que no se reclama equivalencia con ningún benchmark. No se proporcionan cifras de exactitud, F1, precisión por clase ni matrices de confusión.

## Requisitos de hardware

- Almacenamiento: el repositorio ocupa 47,7 GB, coherente con pesos de backbone en FP32 (12B parámetros a 4 bytes por parámetro) más los buffers de ejecución y la cabeza de decisión.
- VRAM en FP32: cargar el backbone en FP32 requiere del orden de 48 GB solo para pesos, más activaciones y buffers; por tanto, GPU de 80 GB (A100 80 GB, H100 80 GB, H200) o reparto multi-GPU.
- VRAM con autocast BF16: aunque los pesos se guarden en FP32, la inferencia usa autocast BF16; si se carga y opera en BF16, el peso teórico baja a unos 24 GB, lo que deja muy poco margen en una GPU de 24 GB para activaciones y buffers.
- GPU de entrenamiento reportadas: 4 GPU H200, con batch efectivo de 32. Es la única configuración de hardware confirmada por el autor.
- GPU consumer: no se garantiza. Una RTX 4090 o RTX 3090 de 24 GB queda al límite incluso en BF16 y probablemente exija descarga por capas, offload a CPU o cuantización propia. No se publican pesos GGUF ni cuantizados, por lo que habría que generarlos uno mismo, con el riesgo de que la cabeza de decisión y runtime_buffers.pt no se conviertan correctamente.
- Opciones de despliegue: el autor solo documenta el uso de los helpers load_model.py incluidos, con restauración obligatoria de runtime_buffers.pt. No se menciona soporte de vLLM, TGI, llama.cpp, Ollama ni servidores de inferencia estándar, y la presencia de una cabeza de decisión personalizada hace poco probable que funcione sin adaptación en esos servidores.
- Latencia y throughput: no disponibles. No se aportan mediciones de tokens por segundo ni de tiempo por lote.

## Comparativa con modelos similares

No se ha proporcionado información sobre modelos comparables en la documentación disponible. La comparación más directa posible es con el propio modelo base, aunque las categorías funcionales son distintas (generación frente a clasificación):

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| akhilaaa3/openjev-v1-allmix-r512-merged | 12B | No disponible (entrenado con prompts < 4.096 tokens) | Clasificación en 256 clases | apache-2.0 | 1 repositorio en HF, 0 descargas, 0 likes, evaluación pendiente |
| google/gemma-4-12B-it (modelo base) | 12B | No disponible en la información proporcionada | Modelo instructivo de texto | apache-2.0 | Repositorio oficial de Google |
| Alternativas de clasificación de tamaño similar | No disponible | No disponible | No disponible | No disponible | No se han proporcionado referencias |

No se dispone de datos de rendimiento comparado entre el modelo y cualquier alternativa, por lo que no es posible establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- No es un modelo de chat ni un modelo multimodal autónomo. Solo produce una decisión sobre 256 clases; no genera texto, no conversa y no acepta instrucciones libres.
- Evaluación pendiente: el autor afirma que los resultados se publicarán cuando finalice la verificación de la subida. A día de hoy no existen métricas publicadas.
- Sin equivalencia de benchmark: el autor no reclama paridad con ningún resultado previo, y advierte que el checkpoint es el final, no el mejor seleccionado.
- Degradación por fusión en BF16: el propio autor señala que la fusión en BF16 puede cambiar las probabilidades y, en consecuencia, las decisiones. Existe un verification.json con comprobaciones, pero conviene reproducirlas antes de usar el modelo en producción.
- Dependencia de runtime_buffers.pt: el modelo no funciona sin restaurar ese fichero mediante los helpers load_model.py. No es un artefacto cargable de forma estándar con transformers.
- Ausencia de checkpoints de recuperación y de optimizador: no se puede reanudar el entrenamiento ni auditar el proceso completo desde este repositorio.
- Procedencia del dataset con reservas legales: los registros importados de NanoJev se declaran como CC0, pero el permiso de Nimble se basa en una declaración del entrenador en la red social X y, según el propio autor, no se ha verificado de forma independiente a partir de una licencia de dataset. Esto es un riesgo para uso comercial.
- Licencia: el base es apache-2.0 y se debe conservar la licencia y la atribución de Google. La licencia del modelo derivado se declara apache-2.0, pero la cadena de derechos sobre los datos de entrenamiento no está completamente acreditada.
- Idiomas no declarados: no hay información sobre cobertura multilingüe ni sobre el rendimiento en castellano u otras lenguas.
- Límite de longitud no caracterizado: el entrenamiento usó prompts de menos de 4.096 tokens y no se declara la ventana de contexto real; entradas más largas podrían degradar la clasificación.
- Sesgos: no se ha publicado ningún análisis de sesgos. Al proceder de un corpus interno más ejemplos de Nimble/NanoJev, es probable que herede los sesgos y desequilibrios de esas fuentes, pero no hay datos para cuantificarlo.
- Riesgo de alucinación: no aplica en el sentido generativo, ya que el modelo no produce texto; el riesgo equivalente es la sobreconfianza en clases incorrectas, sin calibración publicada.
- Adopción nula verificable: 0 descargas y 0 likes en el momento de redactar la ficha, sin casos de uso validados por terceros.
- Taxonomía opaca: no se documenta qué representan las 256 clases ni su equilibrio, lo que impide evaluar si encajan con un caso de uso concreto sin inspeccionar los datos de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/akhilaaa3/openjev-v1-allmix-r512-merged
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Ficheros incluidos en el repositorio (no son enlaces públicos independientes, se acceden desde la pestaña de archivos del repositorio): verification.json, load_model.py, runtime_buffers.pt
- No se han encontrado en la búsqueda web enlaces relevantes al modelo: los resultados devueltos corresponden a páginas corporativas de Microsoft y no guardan relación con esta ficha. Por tanto, no hay papers, blogs, repositorios ni demos adicionales que enlazar.
