# CentIo/Cent1-1B

## Resumen

Cent1-1B es un modelo de lenguaje causal compacto desarrollado por CentIo y especializado en *tool calling* financiero y razonamiento numérico sobre estados financieros. Parte del modelo base Qwen/Qwen3-1.7B y se ha afinado para una tarea concreta: dado un conjunto de esquemas de herramientas y una petición del usuario, seleccionar la función correcta y emitir la llamada con los argumentos correctamente tipados, o bien responder conversacionalmente cuando ninguna herramienta encaja. El modelo se publica bajo licencia Apache 2.0 y con pesos en safetensors.

Tecnicamente es un transformer denso de la familia Qwen3 con 1.720.574.976 parámetros (a pesar del sufijo "1B" del nombre), 28 capas, tamaño oculto de 2048 y embeddings atados (*tied embeddings*). Soporta una ventana de contexto de 40.960 tokens, lo que permite arrastrar estados financieros completos o varias llamadas a herramientas dentro de una misma conversación. Su huella en fp16 es de aproximadamente 3,4 GB, de modo que cabe en una única GPU de consumo o en una T4 de capa gratuita.

Su relevancia actual es doble. Por un lado, ataca un cuello de botella muy concreto en flujos agénticos: el *binding* de argumentos, no la selección de la herramienta. Por otro, los resultados publicados muestran que un modelo de 1,7B afinado se sitúa en la misma banda que Qwen3-4B en BFCL v3 simple (0,7225 frente a 0,7375), a una fracción del coste de inferencia. La contrapartida, declarada abiertamente por el autor, es que su rendimiento en razonamiento numérico puro (FinQA) es muy bajo: 0,0220, por debajo del propio modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso (Qwen3), 28 capas, hidden size 2048, embeddings atados |
| Parametros totales | 1.720.574.976 (1,72B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 40.960 tokens |
| Tipos de cuantizacion | no disponible: el autor solo publica pesos en safetensors fp16/bf16; no hay versiones GGUF, AWQ o GPTQ oficiales |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PyTorch, libreria transformers) |
| Modelo base | Qwen/Qwen3-1.7B |
| Tamano del repositorio | 3,5 GB (huella fp16 declarada: ~3,4 GB) |
| Modo de razonamiento | thinking desactivado en el afinado (`enable_thinking=False`) |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3-1.7B sin modificaciones estructurales: un transformer denso causal de 28 capas, hidden size 2048 y embeddings atados, con tokenizador y plantilla de chat de Qwen3. El modelo es un *fine-tune* sobre ese checkpoint base, orientado a dos capacidades simultaneas: enrutado y formateo de llamadas a herramientas, y respuesta conversacional cuando no procede llamar a ninguna. La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO; esa información no está disponible.

Un detalle de entrenamiento es crítico para el uso en producción: Cent1-1B se afinó con el canal nativo de *thinking* de Qwen3 desactivado. El modelo emite la llamada directamente, sin bloque ` thinking` previo. Si se deja la plantilla por defecto (que activa ese canal), el modelo recibe un formato de prompt para el que no fue ajustado y se degradan tanto el formato de la llamada como la precisión de enrutado. En consecuencia, hay que pasar siempre `enable_thinking=False`.

El formato de salida de las llamadas es explícito: `<tool_call>{"name": "calculate_net_margin", "arguments": {"revenue": 480, "net_income": 62}}</tool_call>`. La model card menciona además una corrección metodológica relevante: una versión previa de la ficha afirmaba que el modelo base puntuaría ~0 en BFCL porque "un Qwen3 sin afinar no emite etiquetas `<tool_call>`"; la medición refutó esa suposición cuando el prompt especifica el formato de llamada y los esquemas de funciones.

## Capacidades

- Generación de texto conversacional en inglés, con formato de chat compatible con la plantilla de Qwen3.
- *Tool calling* / *function calling*: selecciona la función correcta y genera los argumentos con el tipado adecuado según el esquema JSON proporcionado.
- Enrutado selectivo: cuando ninguna herramienta es apropiada, responde de forma conversacional en lugar de forzar una llamada espuria.
- Razonamiento numérico sobre estados financieros a nivel de extracción de cifras, cálculo de ratios y variaciones (con las salvedades de precisión indicadas en las limitaciones).
- Soporte de flujos agénticos de un solo paso con esquemas de herramientas inyectados en el mensaje de sistema; no hay evidencia publicada sobre razonamiento multi-paso encadenado.
- Capacidades multilingües: no disponibles; el modelo está declarado únicamente para inglés.
- Capacidad especial: modo *thinking* desactivado de forma deliberada, lo que reduce latencia y evita bloques de razonamiento intermedios en la salida.

## Casos de uso

- Enrutado de peticiones financieras a backends internos: el modelo recibe la pregunta del usuario y el catálogo de funciones disponibles, y devuelve la llamada correcta con argumentos tipados. Es el caso de uso para el que fue afinado y donde obtiene su mejor resultado (0,7225 de *exact match* en BFCL v3 simple).
- Extracción de cifras de estados financieros hacia una función de cálculo: dado un texto con ingresos y beneficio neto, el modelo emite la llamada a `calculate_net_margin` o equivalente, delegando la aritmética en código determinista en lugar de calcularla él mismo.
- Asistente conversacional de atención al cliente en banca: al soportar respuestas sin llamada a herramienta, puede gestionar consultas generales y derivar solo las que requieren datos del core bancario, evitando invocaciones innecesarias.
- Capa de *routing* en un pipeline agéntico mayor: por su tamaño (3,4 GB en fp16) y su latencia previsible, encaja como primer eslabón que decide qué modelo o servicio más costoso debe atender cada petición.
- Despliegue en hardware limitado o en el borde: cabe en una T4 de capa gratuita o en una GPU de consumo, lo que permite ejecutar el enrutado financiero dentro de la propia infraestructura sin depender de APIs externas.
- Normalización de argumentos en integraciones con ERPs y sistemas contables: convierte lenguaje natural ("el margen sobre 480 de facturación y 62 de beneficio") en JSON estructurado listo para consumir por una API.
- Generación de *test cases* y validación de esquemas de herramientas: el modelo puede usarse para producir llamadas de ejemplo correctamente formadas a partir de descripciones de funciones, útil en el desarrollo y pruebas de agentes.

## Benchmarks y rendimiento

Los resultados publicados proceden de la model card. Todos los modelos se ejecutaron sobre el mismo conjunto con decodificación voraz (*greedy*), por lo que las filas son directamente comparables.

**Tabla 1: function calling, conocimiento financiero y razonamiento numérico financiero**

| Modelo | Parametros | BFCL v3 simple (↑) | MMLU finance (↑) | FinQA (↑) |
|---|---|---|---|---|
| Cent1-1B (este modelo) | 1,7B | 0,7225 | 0,5756 | 0,0220 |
| Qwen3-1.7B (base) | 1,7B | 0,6750 | 0,5476 | 0,0549 |
| Qwen3-0.6B | 0,6B | 0,5475 | 0,4449 | 0,1209 |
| Qwen3-4B | 4B | 0,7375 | 0,7276 | 0,3407 |

**Tabla 2: desglose del resultado en BFCL v3 simple**

| Modelo | Emitio llamada | Nombre de funcion correcto | Argumentos correctos | Exact match |
|---|---|---|---|---|
| Cent1-1B (este modelo) | 0,9950 | 0,9875 | 0,7250 | 0,7225 |
| Qwen3-1.7B (base) | 1,0000 | 0,9975 | 0,6775 | 0,6750 |
| Qwen3-0.6B | 0,9975 | 0,9950 | 0,5500 | 0,5475 |
| Qwen3-4B | 0,9950 | 0,9925 | 0,7400 | 0,7375 |

Lectura de los datos según el propio autor: la mejora se concentra en el *binding* de argumentos (+4,75 puntos frente al base), mientras que la precisión del nombre de la función es marginalmente inferior (0,9875 frente a 0,9975). El modelo queda a 1,5 puntos de Qwen3-4B en *exact match*, con 2,4 veces menos parámetros. En FinQA hay una regresión real: 0,0220 frente a 0,0549 del base (2 aciertos de 91 frente a 5).

## Requisitos de hardware

- VRAM estimada en fp16: aproximadamente 3,4 GB de pesos más caché KV y *overhead* del runtime; en la práctica, entre 4 y 5 GB para funcionar con comodidad. Cálculo estimado, no publicado por el autor.
- VRAM estimada con cuantización de 8 bits: en torno a 2 GB. Con 4 bits: en torno a 1,2-1,5 GB. Son estimaciones derivadas del número de parámetros; el autor no publica checkpoints cuantizados, por lo que habría que generarlos con bitsandbytes, GPTQ o AWQ.
- GPU recomendadas: T4 (16 GB), RTX 3060/4060 en adelante, RTX 4090, L4, A10G. Cualquier GPU con 6 GB o más de VRAM debería ser suficiente en fp16.
- Cabe en GPU de consumo: sí, en la práctica totalidad de las GPU de consumo modernas con 6-8 GB o más. El autor indica explícitamente que corre en una sola GPU de consumo o en una T4 de capa gratuita.
- Opciones de despliegue: transformers (referencia del autor), vLLM y SGLang (el autor incluye ejemplo con `vllm serve CentIo/Cent1-1B --dtype float16 --max-model-len 8192`), y TGI, ya que el repositorio incluye el tag `text-generation-inference`. Para llama.cpp u Ollama sería necesaria una conversión propia a GGUF, no publicada.
- Nota sobre la longitud de contexto en despliegue: aunque el modelo declara 40.960 tokens, el ejemplo oficial de vLLM limita `--max-model-len` a 8192.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | BFCL v3 simple | MMLU finance | FinQA | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Cent1-1B | 1,72B | 40.960 | 0,7225 | 0,5756 | 0,0220 | Apache 2.0 | HuggingFace, safetensors |
| Qwen3-1.7B (base) | 1,72B | 32.768 (segun Qwen3) | 0,6750 | 0,5476 | 0,0549 | Apache 2.0 | HuggingFace, safetensors |
| Qwen3-0.6B | 0,6B | no disponible en la informacion | 0,5475 | 0,4449 | 0,1209 | Apache 2.0 | HuggingFace, safetensors |
| Qwen3-4B | 4B | no disponible en la informacion | 0,7375 | 0,7276 | 0,3407 | Apache 2.0 | HuggingFace, safetensors |

La comparativa se limita a la familia Qwen3 porque es la única para la que la model card aporta cifras comparables. No se dispone de datos de otros modelos especializados en *tool calling* financiero de tamaño similar en la información proporcionada.

## Limitaciones y advertencias

- Razonamiento numérico débil: FinQA cae a 0,0220 (2 aciertos de 91), por debajo del modelo base (0,0549). El autor lo describe como una debilidad real, no un artefacto de redondeo: el modelo produce respuestas numéricas bien formadas y concisas, pero con valores incorrectos, a menudo solo ligeramente incorrectos. Debe tratarse como enrutador y formateador, nunca como calculadora, y verificar las cifras antes de actuar sobre ellas.
- Precisión de selección de función ligeramente inferior al base: 0,9875 frente a 0,9975. La mejora se concentra en los argumentos, no en la elección de herramienta.
- El modo *thinking* debe desactivarse obligatoriamente (`enable_thinking=False`). Usar la plantilla por defecto degrada tanto el formato de la llamada como la precisión de enrutado.
- Idioma: solo inglés. No hay soporte multilingüe declarado, lo que limita su uso directo en entornos en castellano sin una capa de traducción previa.
- Riesgo de alucinación: inherente a un modelo de 1,7B en dominio financiero. Los valores numéricos generados directamente por el modelo no son fiables; cualquier cifra debe proceder de una función determinista invocada mediante *tool calling*.
- Sesgos conocidos: la model card no documenta una evaluación de sesgos. No disponible.
- Licencia: Apache 2.0, que permite uso comercial, modificación y redistribución, siempre conservando el aviso de licencia y el archivo de atribución. No se declaran restricciones adicionales de uso aceptable más allá de las de la propia licencia.
- Madurez del proyecto: el repositorio registra 0 descargas y 1 *like* en el momento de la consulta, con fecha de creación en septiembre de 2026. No hay evidencia de adopción en producción ni de mantenimiento continuado.
- La model card disponible está truncada: la sección final sobre la corrección metodológica se corta a mitad de frase, por lo que parte del razonamiento del autor sobre la evaluación no es recuperable.
- No se publican versiones cuantizadas oficiales, lo que obliga a generarlas internamente si se quiere reducir el consumo de VRAM.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/CentIo/Cent1-1B
- Perfil del autor en HuggingFace: https://huggingface.co/CentIo
- Modelo base Qwen/Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B

Nota sobre la búsqueda web: los resultados obtenidos no guardan relación con Cent1-1B. Corresponden a otros artefactos y noticias sin conexión con este modelo (CladeTeam/CENO-1B-base, un modelo genómico; Limite 1B Violetto, un modelo matemático de Paradigma; la colección Parakeet 1.1B CTC de NVIDIA; una noticia sobre un fondo de Meta; y una pieza de Rocket League). No se han encontrado papers, blogs, repositorios ni demos adicionales específicos de Cent1-1B.
