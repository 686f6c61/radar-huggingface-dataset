# chartreuse-verte/ettin-markup-17m

## Resumen

Ettin-markup-17m es un clasificador de texto de 16.865.545 parámetros desarrollado por el usuario chartreuse-verte, un ajuste fino del encoder jhu-clsp/ettin-encoder-17m (familia ModernBERT). Su tarea es leer el marcado de un mensaje de rol e identificar dos ejes independientes: cómo se marca la narración (asterisco, texto plano o desconocido) y cómo se marca el diálogo (entrecomillado, texto plano junto a narración con asteriscos, o desconocido). La salida es una softmax de 9 clases (3 x 3) que se interpreta como dos marginales, sumando filas y columnas.

El problema que resuelve es muy concreto: una aplicación de chat con personajes necesita mantener un estilo de marcado consistente sin reescribir los mensajes que ya estaban bien escritos. El modelo actúa como puerta de reescritura (rewrite gate): solo los mensajes clasificados como problemáticos pasan al reescritor. Frente a la heurística de expresiones regulares a la que sustituye, reduce las reescrituras dañinas del 5,0 % al 0,5 % en la evaluación del propio autor.

Es relevante por su tamaño y coste: 67 MB en fp32 (safetensors/ONNX) y 19,7 MB en GGUF q8_0, con 0,7 ms de mediana por mensaje en llama.cpp con 4 hilos de CPU. Se puede ejecutar íntegramente en CPU, en el navegador vía ONNX o en un servicio sin GPU. La ventana de entrada es de 512 tokens y el modelo solo trabaja con inglés. Licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (ModernBERT) con cabeza de clasificación de secuencia; softmax de 9 clases (narración x diálogo) leída como dos marginales |
| Parametros totales | 16.865.545 (dato real de safetensors) |
| Longitud de contexto | 512 tokens (los primeros 512 ids; el texto se trunca antes a 4000 caracteres en el preprocesado de referencia) |
| Tipos de cuantizacion | GGUF q8_0; fp32 en safetensors y ONNX |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT (la misma que el modelo base) |
| Formato de pesos | safetensors (fp32, 67 MB), GGUF (q8_0, 19,7 MB), ONNX (fp32, 67,6 MB) |
| Modelo base | jhu-clsp/ettin-encoder-17m |
| Tarea (pipeline) | text-classification (etiquetas: narración y diálogo) |
| Tamano del repositorio | 0,2 GB |
| Libreria | transformers (tambien compatible con llama.cpp y ONNX Runtime) |

## Arquitectura y entrenamiento

La arquitectura es un encoder ModernBERT del que hereda el backbone, con una única cabeza de clasificación de 9 salidas. La innovación práctica está en la lectura de esas 9 salidas: en lugar de tomar la clase dominante de la celda superior, el modelo trata la matriz 3 x 3 como el producto de dos distribuciones (narración x diálogo) y obtiene cada etiqueta sumando las filas y las columnas de la softmax y aplicando argmax. Esto permite reutilizar los datos etiquetados en dos ejes de forma conjunta sin entrenar dos cabezas separadas. El modelo se usó con un preprocesado específico durante el entrenamiento: se enmascaran bloques de código, tramos en **negrita**, cursivas con `__`, separadores de tres o más asteriscos y se convierten los asteriscos de viñeta en guiones, para que el marcado estructurado no se confunda con marcado de rol.

El entrenamiento usó 43.273 mensajes de entrenamiento y 5.967 de validación, procedentes de registros de rol, cartas de personaje y mensajes de chat reales, más dos conjuntos sintéticos (glifos de comillas intercambiados y casos límite). Se entrenó 5 épocas con learning rate 4,5e-5, batch de 32, schedule coseno y pesos de clase limitados a un máximo de 5x, seleccionando el mejor checkpoint por macro-F1 de validación. No hay etiquetas humanas: las etiquetas de entrenamiento provienen de un analizador (parser) más un LLM para los casos difíciles, y el juez de las reescrituras también es un LLM. Los datos no se publican por tratarse de conversaciones reales. No se documenta uso de RLHF ni DPO, algo esperable en un clasificador de este tamaño.

## Capacidades

- Clasificación de marcado de narración en tres clases: `asterisk`, `bare`, `unknown`.
- Clasificación de marcado de diálogo en tres clases: `quoted`, `bare`, `unknown`.
- Lectura combinada de ambos ejes mediante marginales sobre una softmax de 9 celdas, con salida determinista y probabilidades por clase.
- Función de puerta de reescritura: decidir si un mensaje debe dejarse intacto o pasar a un reescritor.
- Inferencia en tres runtimes distintos: transformers (safetensors), llama.cpp (GGUF) y ONNX Runtime, con la misma semántica de salida (9 valores).
- Extracción de características compatible con text-embeddings-inference y endpoints compatibles (etiqueta `feature-extraction`), además de la cabeza de clasificación.
- Procesamiento por lotes con longitudes dinámicas en la variante ONNX.
- Capacidad multilingüe: no. Solo inglés.
- No dispone de tool calling, function calling, razonamiento multi-paso, visión, audio ni modo de pensamiento: es un clasificador, no un modelo generativo.

## Casos de uso

- Coherencia de estilo en aplicaciones de rol: el modelo se coloca delante del reescritor de un chat con personajes y solo deja pasar los mensajes cuyo marcado es inconsistente o desconocido, evitando reescrituras innecesarias en el 99,5 % de los casos medidos por el autor.
- Reducción de coste de un LLM reescritor: al filtrar previamente, se evita llamar al modelo generativo para mensajes ya correctos; con 0,7 ms por mensaje en CPU, el filtro es despreciable frente al coste de una llamada a un LLM.
- Etiquetado de corpus de roleplay: generar etiquetas de narración y diálogo para curación de datasets de entrenamiento o para auditar la mezcla de estilos de un corpus de conversaciones.
- Análisis de registros de chat: medir la proporción de mensajes con diálogo entrecomillado frente a diálogo desnudo en un histórico, para estudiar convenciones de escritura de una comunidad.
- Segmentación previa a renderizado: separar narración y diálogo para aplicar estilos CSS distintos o para decidir qué tramos se muestran en cursiva en un front-end de lectura.
- Control de calidad en plataformas de escritura colaborativa: marcar mensajes con marcado mezclado (`unknown`) para revisión manual, sin bloquear la publicación.
- Despliegue en el borde: con 19,7 MB en q8_0 y ejecución en llama.cpp con 4 hilos de CPU, es viable en un portátil, en un contenedor serverless sin GPU o en un servicio que procese miles de mensajes por segundo por lote.
- Integración en el navegador: la variante ONNX con longitudes dinámicas permite ejecutar el clasificador en cliente sin enviar el texto a un servidor, útil si el contenido de rol es sensible.

## Benchmarks y rendimiento

Validación retenida, 5.967 mensajes, particionada por conversación:

| Eje | Exactitud | Macro-F1 |
|---|---|---|
| Narración | 0,976 | 0,973 |
| Diálogo | 0,989 | 0,978 |

Puerta de reescritura sobre 778 ventanas de chat retenidas (un mensaje nuevo y los tres anteriores), con cada reescritura evaluada por un LLM:

| Configuracion | Reescrituras daninas | Tasa |
|---|---|---|
| Modelo con regla de exclusión de mensajes estructurados | 4 | 0,5 % |
| Modelo sin la regla de exclusión | 23 | 3,0 % |
| Heurística de expresiones regulares (línea base) | 39 | 5,0 % |

Sondas escritas a mano:

| Eje | Aciertos |
|---|---|
| Narración | 68 / 73 |
| Diálogo | 72 / 78 |

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K u otros) porque el modelo no es generativo y la información disponible no los incluye.

## Requisitos de hardware

- VRAM estimada en fp32: en torno a 70 MB de pesos (67 MB de safetensors) más activaciones y overhead del runtime; cabe holgadamente en cualquier GPU y en CPU.
- VRAM estimada en q8_0: 19,7 MB de pesos; el modelo completo ocupa menos que la memoria de trabajo de la mayoría de runtimes.
- GPU recomendadas: cualquiera. No requiere GPU para uso interactivo; una GPU consumer (por ejemplo, una RTX 3060 o superior) solo aporta latencia adicional en lotes muy grandes.
- CPU: totalmente viable. Mediana de 0,7 ms por mensaje con GGUF q8_0 en llama.cpp y 4 hilos de CPU, según el autor.
- Despliegue: transformers con `AutoModelForSequenceClassification`, llama.cpp con `LLAMA_POOLING_TYPE_RANK`, ONNX Runtime con entradas `input_ids` y `attention_mask` dinámicas, y text-embeddings-inference para el caso de extracción de características. vLLM o TGI no están indicados para este modelo en la información disponible.
- Latencia y throughput: solo se documenta la mediana de 0,7 ms por mensaje en la configuración indicada; no hay datos de throughput por lote ni de latencia en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| chartreuse-verte/ettin-markup-17m | 16.865.545 | 512 tokens | Clasificación de marcado de rol (narración x diálogo) | MIT | safetensors, GGUF, ONNX |
| jhu-clsp/ettin-encoder-17m (base) | No disponible (17M según el nombre) | No disponible | Encoder generalista, sin cabeza específica | MIT (según el autor del ajuste) | No disponible en esta búsqueda |
| chartreuse-verte/ettin-povtense-17m-v2 (hermano) | No disponible | No disponible | Clasificación de persona narrativa y tiempo verbal | No disponible | No disponible |
| Heurística de expresiones regulares | No aplica | No aplica | Detección de marcado por patrones | No aplica | Código propio |

No hay datos publicados de benchmarks comparativos entre estos modelos en la información disponible; la única comparación cuantitativa documentada es frente a la heurística de expresiones regulares en la tarea de puerta de reescritura (0,5 % frente a 5,0 % de reescrituras dañinas).

## Limitaciones y advertencias

- Solo inglés. Cualquier uso sobre texto en castellano u otro idioma queda fuera del dominio declarado por el autor.
- Ventana de 512 tokens y truncado a 4000 caracteres en el preprocesado de referencia; los mensajes largos se recortan y pueden perder la evidencia relevante.
- Caso más débil documentado: narración desnuda junto a una acción o pensamiento con asteriscos y sin comillas, por ejemplo `*Lena wipes the counter.* We're closed, Lena sighed.`, que se lee como narración con asterisco y habla desnuda.
- Lee marcado, no significado: no distingue un pensamiento en cursiva de una acción con asteriscos. Cualquier decisión editorial que dependa del contenido semántico no es fiable.
- No hay etiquetas humanas en el entrenamiento ni en la evaluación: las etiquetas provienen de un analizador más un LLM en los casos difíciles, y el juez de reescrituras también es un LLM. Esto introduce el sesgo del modelo juez en las métricas.
- Los datos de entrenamiento no se publican, por lo que la reproducibilidad del ajuste es limitada.
- El modelo está entrenado con un preprocesado concreto (enmascarado de bloques de código, negritas, cursivas y separadores, conversión de viñetas). Si no se replica ese preprocesado, el rendimiento puede degradarse.
- Riesgo de falsos positivos en la puerta de reescritura: un mensaje correcto clasificado como inconsistente pasará al reescritor. El autor mitiga esto con una regla que excluye mensajes estructurados (listas, encabezados, transcripciones, énfasis anidado); sin esa regla la tasa de reescrituras dañinas sube del 0,5 % al 3,0 %.
- Al ser un clasificador, no genera texto y no puede alucinar contenido; su riesgo es de clasificación errónea, no de invención.
- El corpus de entrenamiento son conversaciones reales de rol, un dominio con sesgos propios de la comunidad que lo genera; no se documenta ningún análisis de sesgo demográfico.
- Licencia MIT, sin restricciones para uso comercial, con la misma licencia que el modelo base. El repositorio tenía 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación independiente por parte de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/chartreuse-verte/ettin-markup-17m
- Modelo base: https://huggingface.co/jhu-clsp/ettin-encoder-17m
- Modelo hermano, ettin-povtense-17m-v2: https://huggingface.co/chartreuse-verte/ettin-povtense-17m-v2
- Resultados de la búsqueda web: no se ha encontrado ninguna fuente relevante sobre este modelo. Todos los resultados devueltos corresponden a la liqueur Chartreuse y al macizo de la Chartreuse (chartreuse.fr, Wikipedia), sin relación con el modelo.
