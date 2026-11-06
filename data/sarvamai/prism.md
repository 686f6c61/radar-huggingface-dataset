# sarvamai/prism

## Resumen

Sarvam-Prism es un modelo de decisión (decision model) desarrollado por Sarvam AI, construido sobre el modelo base Sarvam-105B. A diferencia de un modelo generativo convencional, Prism recibe un contexto (`state`) y una o más preguntas con un conjunto fijo de respuestas posibles, y devuelve una distribución de probabilidad sobre cada opción en un único forward pass. No genera texto libre: la respuesta siempre es una de las opciones proporcionadas por el usuario, lo que elimina el riesgo de alucinación en la salida y facilita la integración en sistemas de enrutamiento, clasificación y toma de decisiones automatizada.

El modelo cuenta con 104.991.889.280 parámetros totales (aproximadamente 105 mil millones) y una ventana de contexto de 131.072 tokens por pregunta. Su arquitectura es de tipo transformer con mezcla de expertos (MoE), heredada de Sarvam-105B, e incorpora una cabeza de decisión específica que lee los estados ocultos de cada opción y del marcador de respuesta para producir probabilidades calibradas. Los pesos se almacenan en FP8 (float8_e4m3fn) con escalas por fila de salida, lo que reduce el espacio en disco a unos 106 GB y permite la inferencia en una sola GPU de alta gama con soporte FP8.

La relevancia actual de Prism radica en su enfoque de "clasificación calibrada a gran escala": ofrece probabilidades interpretables en lugar de texto generado, con latencias muy bajas (mediana de 44 ms por petición en una B200) y soporte para once idiomas, incluidos inglés y diez lenguas indias. Está publicado bajo licencia Apache 2.0, lo que permite uso comercial, y también se ofrece como API alojada por Sarvam.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), basada en Sarvam-105B, con cabeza de decisión añadida |
| Parámetros totales | 104.991.889.280 (~105B) |
| Parámetros activos | no disponible |
| Longitud de contexto | 131.072 tokens por pregunta |
| Tipos de cuantización | Pesos en FP8 (float8_e4m3fn) con una escala por fila de salida; activaciones escaladas por token en tiempo de ejecución; embeddings y normas en bf16; router MoE en fp32 |
| Idiomas soportados | en, hi, bn, ta, te, mr, gu, kn, ml, or, pa |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con diseño FP8 personalizado (requiere `prism.py`; no compatible con `AutoModelForCausalLM`) |

## Arquitectura y entrenamiento

Prism se construye sobre Sarvam-105B, un transformer con mezcla de expertos. La innovación principal es la cabeza de decisión: cada pregunta se transforma en una secuencia que contiene el estado, las instrucciones y cada una de las opciones, seguidas de un marcador de respuesta. Cada opción comienza en la misma posición y no puede ver a las demás; solo el marcador de respuesta tiene visibilidad de todas ellas. Una cabeza de decisión pequeña lee el estado oculto al final de cada opción y en el marcador, y los convierte en una probabilidad por opción. El código de inferencia (`prism.py`) incluye la codificación de entrada, la máscara de atención, la cabeza de decisión, dos modificaciones menores en la atención del modelo base para esta máscara y los kernels FP8.

El modelo utiliza 128 expertos enrutados por capa, que se ejecutan como dos multiplicaciones de matrices FP8 agrupadas mediante un kernel de Triton; las demás proyecciones usan `torch._scaled_mm`. Los pesos se almacenan en FP8 con una escala por fila de salida y las activaciones se escalan por token en tiempo de ejecución. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; la model card no proporciona estos datos. El modelo está diseñado para capturar grafos CUDA en tamaños de lote y longitudes comunes, lo que acelera la mayoría de las peticiones tras un tiempo de carga de unos dos minutos en una B200.

## Capacidades

- Clasificación con probabilidades calibradas: devuelve una distribución de probabilidad sobre un conjunto fijo de opciones para cada pregunta.
- Tres tipos de pregunta: `choice` (selección entre claves con descripción), `yes_no` (probabilidad de sí) y `score` (niveles ordenados con puntuación esperada y nivel más probable).
- Procesamiento conjunto de múltiples preguntas en una sola petición, con puntuación independiente de cada pregunta y opciones evaluadas en orden fijo (ordenadas por clave).
- Manejo de contexto largo: hasta 131.072 tokens por pregunta, lo que permite incluir documentos extensos, historiales de conversación o JSON complejos.
- Soporte multilingüe en once idiomas: inglés, hindi, bengalí, tamil, telugu, maratí, guyaratí, canarés, malabar, oriya y panyabí.
- Entrada de estado flexible: cualquier texto o valor serializable en JSON, renderizado de forma compacta.
- No genera texto libre, por lo que la salida siempre es una de las opciones definidas por el usuario.
- No se menciona soporte de tool calling, function calling, agentes multi-paso, visión ni audio en la información disponible.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el texto del ticket como `state` y una pregunta de tipo `choice` con las categorías de equipo (facturación, técnico, entrega), devolviendo la probabilidad de cada una. Es adecuado porque la salida es una opción cerrada y calibrada, lo que permite umbrales de confianza y derivación automática.
- Clasificación de urgencia y sentimiento: con preguntas `yes_no` (¿requiere respuesta en una hora?) y `score` (nivel de enfado del cliente en una escala ordenada), se obtienen probabilidades por nivel y una puntuación esperada, útiles para priorizar colas de atención.
- Moderación de contenido: dado un texto o publicación, se definen opciones como `safe`, `spam`, `harassment` o `adult` y se obtiene la probabilidad de cada categoría en un solo forward pass, lo que facilita la revisión humana de los casos de baja confianza.
- Extracción de decisiones en pipelines de datos: para cada registro JSON se pueden formular varias preguntas de clasificación (categoría, sentimiento, intención) y procesarlas en lote, con hasta 16 preguntas por petición por defecto, lo que reduce el coste frente a modelos generativos.
- Análisis de encuestas y feedback abierto: con preguntas de tipo `score` sobre niveles ordenados (por ejemplo, satisfacción de 0 a 3), el modelo devuelve la distribución completa y la puntuación esperada, lo que permite agregar resultados con intervalos de confianza.
- Enrutamiento de consultas en asistentes conversacionales: el historial de conversación se pasa como `state` y se pregunta por la intención o el siguiente paso, con la ventaja de que la respuesta siempre es una de las acciones predefinidas y no requiere parseo de texto generado.
- Evaluación de riesgo en documentos largos: gracias a la ventana de 131.072 tokens, se puede pasar un contrato o informe completo y formular preguntas de sí/no o de elección sobre cláusulas o riesgos, con probabilidades calibradas para cada opción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que el blog de lanzamiento incluye resultados de evaluación, comparaciones con otros modelos de decisión y datos de calibración, pero no se proporcionan cifras concretas en el material disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 120 GB de memoria libre en una GPU con soporte FP8.
- GPU recomendadas: NVIDIA B200 o H200 (probado en B200). Se requiere una GPU con soporte FP8.
- No cabe en GPUs de consumo: el tamaño de los pesos (unos 106 GB en FP8) y el requisito de memoria de 120 GB excluyen tarjetas como RTX 4090, RTX 3090 o similares.
- Almacenamiento: unos 106 GB de disco para los pesos.
- Software: Python 3.10 o superior, un compilador de C (Triton compila sus kernels en el primer uso) y las dependencias del repositorio (`requirements.txt`).
- Despliegue: el modelo requiere el código `prism.py` del repositorio; no es compatible con `AutoModelForCausalLM` ni con servidores de inferencia de propósito general como vLLM, llama.cpp, Ollama o TGI, debido al diseño FP8 personalizado y a la cabeza de decisión.
- Latencia: mediana de 44 ms por petición y percentil 95 de 420 ms en una B200, medido sobre 1.000 peticiones aleatorias del benchmark público Decision Index, enviadas de una en una tras la carga. Todas las preguntas de una petición se puntúan juntas.
- Tiempo de carga: unos dos minutos en una B200, incluyendo la compilación de kernels de Triton y la captura de grafos CUDA.
- API alojada: Sarvam ofrece Prism como API sin necesidad de GPU.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en el material proporcionado. La model card menciona comparaciones con otros modelos de decisión en el blog de lanzamiento, pero no se incluyen datos concretos de alternativas, parámetros, contexto ni licencias. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- El modelo no genera texto libre: solo puede responder con las opciones proporcionadas por el usuario, lo que limita su uso a tareas de clasificación y decisión con un conjunto cerrado de respuestas.
- Requiere hardware especializado: una GPU con soporte FP8 y unos 120 GB de memoria libre, lo que excluye el despliegue en hardware de consumo y encarece la infraestructura.
- No es compatible con herramientas estándar de inferencia (vLLM, llama.cpp, Ollama, TGI) ni con `AutoModelForCausalLM`; el despliegue exige usar el código `prism.py` del repositorio.
- La model card no detalla sesgos conocidos, composición del dataset de entrenamiento ni evaluaciones de robustez; se recomienda validar el comportamiento en dominios específicos antes de usarlo en producción.
- Aunque la salida es una distribución de probabilidad, la calibración puede variar según el dominio y la formulación de las preguntas; es aconsejable monitorizar la confianza y establecer umbrales de revisión humana.
- El límite de contexto es de 131.072 tokens por pregunta; los contextos más largos deben truncarse o dividirse.
- La licencia Apache 2.0 permite uso comercial, pero se debe conservar el aviso de licencia y verificar las condiciones de los pesos derivados de Sarvam-105B.
- No se dispone de información sobre el soporte de tool calling, agentes multi-paso, visión o audio; no se deben asumir estas capacidades.
- El modelo está optimizado para once idiomas; el rendimiento en otros idiomas no está documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sarvamai/prism
- Blog de lanzamiento: https://www.sarvam.ai/blogs/sarvam-prism
- Documentación de la API: https://docs.sarvam.ai/api/token-factory/models/sarvam-prism
- Benchmark Decision Index: no disponible como enlace directo en la información proporcionada
