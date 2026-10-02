# shakeel143/jev-multilingual

## Resumen

Jev-Multilingual es un modelo de clasificación de texto para urdu derivado mediante fine-tuning de jhu-clsp/mmBERT-base, publicado por el usuario shakeel143 en HuggingFace. El repositorio se distribuye a través de la librería Python `jev-urdu` de LughaatNLP, cuyo objetivo es resolver un problema muy concreto: el texto en urdu que llega a aplicaciones reales rara vez aparece en una sola forma. Un usuario puede escribir en escritura urdu, continuar en roman urdu y mezclar nombres de producto en inglés, y la aplicación necesita igualmente tomar una decisión estructurada (clasificar el problema, detectar sentimiento o comprobar si una afirmación está respaldada por un contexto).

El modelo es un encoder de aproximadamente 321,9 millones de parámetros, con pesos en formato safetensors y licencia Apache-2.0, por lo que su uso comercial está permitido sin restricciones adicionales. Su salida no es texto generado, sino decisiones tipadas con probabilidades asociadas (por ejemplo, sentimiento y probabilidad de P(sí)), lo que lo orienta a tareas de enrutado, triaje y verificación dentro de pipelines de aplicación.

Es relevante porque cubre un nicho poco atendido: clasificación estructurada para urdu y roman urdu en contextos de atención al cliente y verificación de resultados de herramientas, con una interfaz unificada. Conviene señalar desde el principio una discrepancia documental: el repositorio se identifica como `jev-multilingual`, pero su model card describe el modelo y la librería `jev-urdu` (publicado por muhammadnoman76), y la etiqueta de idioma declarada es únicamente `ur`. No se han publicado en la información disponible ni la longitud de contexto soportada ni los detalles del corpus de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de tipo encoder, derivado de jhu-clsp/mmBERT-base (etiquetado como mmbert / modernbert) |
| Parametros totales | 321.908.998 (~321,9 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio distribuye pesos en safetensors y el autor indica ~644 MB para el fichero de checkpoint (compatible con precision fp16/bf16), sin variantes GGUF/AWQ/GPTQ publicadas |
| Idiomas soportados | ur (urdu); la model card indica soporte de roman urdu en la misma interfaz |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

Datos adicionales del repositorio: pipeline `text-classification`, librería `jev-urdu`, tamaño del repositorio 0,7 GB, 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el 2026-10-02. Modelo base: jhu-clsp/mmBERT-base (relación `finetune`).

## Arquitectura y entrenamiento

La información disponible indica que el modelo es un fine-tune de jhu-clsp/mmBERT-base, un encoder multilingüe de la familia mmBERT, cuyas etiquetas asociadas incluyen `mmbert` y `modernbert`. Se trata, por tanto, de un transformer de tipo encoder orientado a clasificación, no a generación autoregresiva: la librería devuelve decisiones y probabilidades en lugar de respuestas conversacionales. El número de parámetros declarado (321.908.998) corresponde al checkpoint afinado publicado en safetensors.

No se han facilitado en la información disponible el número de tokens de entrenamiento, la composición del corpus, el uso de RLHF/DPO ni otros detalles del procedimiento de ajuste. La etiqueta `calibrated-decisions` sugiere que el entrenamiento o el post-procesado se orientó a producir probabilidades calibradas, coherente con el hecho de que la API devuelve un campo `probability` por cada decisión (y, en preguntas de tipo choice, un mapa completo `probabilities`). No hay datos sobre innovaciones técnicas adicionales, decodificación especulativa ni mecanismos de atención lineal.

## Capacidades

- Clasificación de texto en urdu y roman urdu mediante una única interfaz de inferencia.
- Tarea `triage(text)`: devuelve decisiones sobre el tipo de incidencia (issue), la prioridad y si el usuario solicita atención humana.
- Tarea `sentiment(text)`: devuelve sentimiento e indicador de insatisfacción.
- Tarea `check_claim(context, claim)`: evalúa la relación de una afirmación con un contexto dado y si el contexto la respalda directamente.
- Tarea `consent(text)`: determina el estado de consentimiento y si se concede permiso completo.
- Tarea `detect_injection(text)`: clasifica el tipo de texto y detecta intentos de sobrescribir instrucciones (prompt injection).
- Tarea `verify_tool_result(receipt)`: comprueba el éxito de una operación descrita en un recibo de herramienta y la consistencia de la afirmación del asistente.
- Consultas personalizadas: `choice()` para conjuntos cerrados de respuestas y `yes_no()` para preguntas binarias, con etiquetas que pueden mapearse a descripciones.
- Salida estructurada con probabilidades calibradas: `answer` + `probability`, y `probabilities` para todas las opciones en preguntas de elección; en preguntas de sí/no, `probability` se interpreta siempre como P(sí).
- No incluye generación de texto libre, capacidades de visión, audio ni tool calling generativo: es un clasificador, y la aplicación decide cómo usar los resultados.

## Casos de uso

- Triaje de soporte al cliente: `triage()` permite clasificar automáticamente una consulta entrante (tipo de incidencia, urgencia y petición de agente humano) y enrutarla al equipo adecuado, gestionando mensajes que mezclan escritura urdu y roman urdu sin necesidad de prompts específicos por petición.
- Análisis de sentimiento en reseñas de producto: `sentiment()` sobre reseñas en urdu o roman urdu sirve para monitorizar satisfacción y detectar insatisfacción en paneles de calidad, con el valor de probabilidad para priorizar revisiones manuales.
- Verificación de afirmaciones frente a contexto (grounding): `check_claim(context, claim)` permite comprobar si una afirmación de un asistente está respaldada por el contexto documental disponible, útil en sistemas RAG donde se necesita una señal de fidelidad antes de mostrar la respuesta.
- Detección de prompt injection en aplicaciones expuestas: `detect_injection()` aporta una señal adicional en la capa de entrada para identificar textos que intentan sobrescribir instrucciones, combinable con reglas de aplicación y revisión.
- Verificación de resultados de herramientas en agentes: `verify_tool_result(receipt)` permite contrastar el recibo de una operación (por ejemplo, el estado y el código de un reembolso) con la afirmación del asistente, reduciendo el riesgo de que un agente comunique un éxito inexistente.
- Gestión de consentimiento y privacidad: `consent()` clasifica si un mensaje de permiso otorga consentimiento y si este es completo, lo que puede alimentar flujos de cumplimiento antes de tratar datos personales.
- Enrutado con taxonomías propias: mediante `choice()` y `yes_no()` se pueden definir preguntas específicas del dominio (por ejemplo, departamento responsable con etiquetas descritas) y obtener respuestas tipadas con probabilidades, sin reentrenar el modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card enlaza a un artículo externo de referencia (`jev-urdu-benchmarks`), pero no se incluyen cifras en los datos proporcionados. No se deben asumir valores de MMLU, HumanEval, GSM8K ni de tareas de clasificación sin una fuente verificada.

## Requisitos de hardware

- El autor indica que el fichero de checkpoint ocupa aproximadamente 644 MB, más los ficheros del tokenizador y la memoria de inferencia. Conviene recordar que el tamaño de descarga no equivale al consumo de memoria en ejecución.
- Estimación orientativa a partir del recuento de parámetros (321,9 M), no confirmada por el autor: en fp16/bf16 los pesos ocupan del orden de 0,6-0,7 GB; en fp32, del orden de 1,3 GB. Con activaciones y overhead de runtime, un rango práctico de 1,5-3 GB de VRAM en fp16 es razonable para lotes pequeños.
- Cabe con holgura en GPUs de consumo: cualquier GPU con 4 GB o más de VRAM (por ejemplo, GTX 1650 en adelante, RTX 3060, RTX 4090) es suficiente. No requiere GPUs de centro de datos como A100 o H100 para inferencia.
- El loader del runtime selecciona automáticamente el dispositivo disponible: CUDA si está presente, después Apple MPS y, en último lugar, CPU. La GPU es opcional y el modelo puede ejecutarse íntegramente en CPU.
- Opciones de despliegue: la librería `jev-urdu` usa PyTorch, Transformers, Safetensors y Hugging Face Hub directamente; el paquete `laya` no es necesario para inferencia. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (y al no ser un modelo generativo, los motores orientados a generación no son el objetivo natural).
- Latencia y throughput: no disponible. Al tratarse de un encoder de ~322 M de parámetros, la inferencia es de baja latencia en GPU, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea principal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jev-Multilingual (este modelo) | 321,9 M | no disponible | Clasificacion de texto en urdu / roman urdu con decisiones tipadas | apache-2.0 | HuggingFace (repositorio `shakeel143/jev-multilingual`) |
| jhu-clsp/mmBERT-base (modelo base) | no disponible en la informacion proporcionada | no disponible | Encoder multilingue base (requiere ajuste para tareas) | no disponible en la informacion proporcionada | HuggingFace (`jhu-clsp/mmBERT-base`) |
| jev-urdu (muhammadnoman76) | no disponible en la informacion proporcionada | no disponible | Clasificacion de texto en urdu con la misma interfaz de libreria | apache-2.0 (segun la model card citada) | HuggingFace (`muhammadnoman76/jev-urdu`) |

Alternativas genéricas de clasificación multilingüe (por ejemplo, XLM-RoBERTa o mBERT) no se han incluido con cifras porque no se dispone de datos verificables en la información proporcionada para establecer una comparación numérica.

## Limitaciones y advertencias

- No es un modelo generativo: no produce respuestas conversacionales, sino etiquetas y probabilidades. Cualquier expectativa de chat o generación de texto libre es incorrecta.
- Riesgo de falsos positivos y falsos negativos en todas las tareas de clasificación, especialmente en textos mixtos urdu/roman urdu/inglés con ruido ortográfico.
- La detección de prompt injection (`detect_injection`) es una señal auxiliar, no una garantía de seguridad; debe combinarse con reglas de aplicación, saneado de entradas y revisión humana.
- La model card recomienda explícitamente usar los juicios del modelo junto con reglas de aplicación y revisión humana para acciones con consecuencias relevantes (por ejemplo, reembolsos o comunicaciones sensibles).
- La longitud de contexto no está documentada, lo que impide garantizar el comportamiento con contextos largos en `check_claim`; conviene validar empíricamente con textos del dominio objetivo.
- Los idiomas declarados se limitan a `ur`, con soporte indicado de roman urdu en la interfaz. Pese al nombre `jev-multilingual`, no hay evidencia en la información disponible de cobertura de otros idiomas distintos del urdu.
- Posibles sesgos derivados del corpus de ajuste, no documentado: no se conocen la composición del dataset ni las medidas de mitigación aplicadas.
- Discrepancia documental: el repositorio se llama `jev-multilingual`, pero la model card describe el modelo y la librería `jev-urdu` de LughaatNLP (autor muhammadnoman76). Conviene verificar la procedencia y la relación exacta entre ambos antes de usarlo en producción.
- Sin métricas publicadas, uso comercial permitido por Apache-2.0, pero la ausencia de validación reproducible hace recomendable evaluar el modelo con un conjunto propio antes de desplegarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/shakeel143/jev-multilingual
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-base
- Modelo y código fuente de referencia (jev-urdu): https://huggingface.co/muhammadnoman76/jev-urdu
- Librería en PyPI: https://pypi.org/project/jev-urdu/
- Artículo de benchmarks citado en la model card: https://www.nomanshafiq.com/blog/jev-urdu-benchmarks/
- Licencia Apache-2.0 (referenciada en la model card): https://huggingface.co/muhammadnoman76/jev-urdu/blob/main/library/LICENSE
