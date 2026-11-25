# devjuneja789/grounded-qa-qwen-1p5b

## Resumen

Grounded QA con Qwen2.5-1.5B es un adaptador LoRA (PEFT) sobre el modelo instructivo Qwen/Qwen2.5-1.5B-Instruct, desarrollado por el usuario devjuneja789. Resuelve una tarea concreta de question answering con evidencia: dado un enunciado en ingles y un pasaje numerado, el modelo genera una respuesta con citas a las frases del pasaje o devuelve explicitamente `Insufficient evidence.` cuando la evidencia no permite responder. El sistema propuesto anade una segunda pasada de verificacion con el modelo base sin adaptar, que ve la pregunta, la respuesta propuesta y solo los extractos citados, y emite un veredicto de confirmacion o abstencion.

El modelo es relevante por su enfoque en la calibracion de la abstencion: el adaptador solo reduce los rechazos innecesarios de respuestas contestables, mientras que el verificador posterior reduce los fallos de abstencion ante preguntas no contestables. Es un experimento pequeno, reproducible y con scripts publicados, orientado a evaluar citation grounding y abstención mas que a competir en benchmarks generales.

La arquitectura subyacente es un transformer decoder-only de 1.500 millones de parametros con ventana de contexto de 32.768 tokens (heredada de Qwen2.5-1.5B-Instruct, aunque el entrenamiento limito las secuencias a 1.536 tokens). El entrenamiento se realizo sobre el dataset CLAPNQ en ingles, con una sola epoca y LoRA de rango 16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA sobre proyecciones query y value |
| Parametros totales | 1.500 millones (modelo base Qwen2.5-1.5B-Instruct); el adaptador LoRA es de rango 16 y alpha 32 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base; el entrenamiento de la tarea limito las secuencias a 1.536 tokens |
| Tipos de cuantizacion | no disponible (el repo solo publica pesos safetensors del adaptador) |
| Idiomas soportados | ingles (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT); el modelo base se descarga por separado en safetensors |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-1.5B-Instruct, un transformer decoder-only denso de 1.500 millones de parametros. El ajuste es un LoRA de rango 16 y alpha 32 sobre las proyecciones query y value, con dropout 0,05, learning rate 0,0001, tamano de batch efectivo 8 y una sola epoca. Se uso perdida solo sobre los tokens del asistente (assistant-only loss). El entrenamiento y la validacion se ejecutaron en una GPU A10G y duraron 12 minutos y 2 segundos.

Los datos provienen de PrimeQA/clapnq, revision `b7f27c5`, con pasajes agrupados para validacion y exclusion de preguntas de entrenamiento repetidas en validacion. De 3.370 registros elegibles, 28 superaban el limite de 1.536 tokens y 7 registros no mapeables se omitieron durante la conversion, resultando en 3.342 ejemplos de entrenamiento. La innovacion tecnica destacable no esta en la arquitectura sino en el pipeline de inferencia en dos pasadas: el generador usa decodificacion greedy con hasta 192 tokens nuevos y el verificador usa el modelo base original con hasta 6 tokens nuevos para emitir un veredicto afirmativo o de abstencion.

## Capacidades

- Generacion de respuestas extractivas con citas a frases numeradas de un pasaje proporcionado.
- Abstención explicita mediante la salida `Insufficient evidence.` cuando la evidencia no soporta una respuesta.
- Verificacion de evidencia en segunda pasada: el modelo base sin adaptar comprueba si los extractos citados sostienen la respuesta.
- Question answering en ingles sobre pasajes cortos y medianos.
- Formato de salida estructurado y parseable (respuesta mas citas en rango, o abstencion).
- No soporta tool calling ni function calling de forma documentada.
- No soporta agentes ni razonamiento multi-paso mas alla del pipeline generador-verificador.
- Capacidades multilingues limitadas al ingles.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Question answering documental con trazabilidad: el modelo responde citando frases concretas del pasaje, lo que permite auditar la procedencia de cada afirmacion en sistemas de consulta sobre normativa, manuales o documentacion tecnica.
- Filtrado de respuestas no sustentadas en pipelines RAG: el verificador de segunda pasada descarta respuestas cuyos extractos citados no sostienen la conclusion, reduciendo el riesgo de afirmaciones sin respaldo antes de mostrarlas al usuario.
- Asistentes de atencion al cliente sobre base de conocimiento acotada: al abstenerse cuando la evidencia es insuficiente, evita inventar respuestas sobre politicas o productos no documentados.
- Evaluacion de citation grounding en investigacion: los scripts y el codigo de scoring publicados permiten reproducir la comparacion entre modelo base, adaptador y sistema con verificador sobre CLAPNQ.
- Prototipado rapido en local: al ser un adaptador sobre un modelo de 1,5B, se puede ejecutar en una unica GPU de consumo para probar flujos de QA con evidencia antes de escalar a modelos mayores.
- Deteccion de preguntas no contestables en conjuntos de datos: el sistema puede usarse para marcar preguntas de un corpus que carecen de soporte en los pasajes disponibles, con las tasas de error documentadas en la model card.
- Demo educativa de calibracion de abstención: la aplicacion Gradio incluida permite comparar en vivo las tres configuraciones y observar como el verificador mejora la abstencion a costa de rechazar respuestas validas.

## Benchmarks y rendimiento

Resultados sobre el split oficial de desarrollo de CLAPNQ (600 preguntas: 300 contestables y 300 no contestables), segun la model card:

| Metrica | Base | Adaptador LoRA | Adaptador con verificacion de evidencia |
|---|---:|---:|---:|
| Fallo de abstencion en preguntas no contestables (de 300) | 27 | 33 | 10 |
| Abstencion en preguntas contestables (de 300) | 134 | 45 | 97 |
| Respuestas malformadas (de 600) | 61 | 7 | 0 |
| Decision correcta con formato valido (de 600) | 393 | 516 | 493 |
| Correcta y soportada por las frases citadas (muestra ciega de 50 contestables) | 11 | 32 | 31 |
| Supera ambas mitades de un par ficticio con eliminacion de evidencia (de 30) | 23 | 3 | 4 |

El sistema con verificador reduce el fallo de abstencion en 5,7 puntos porcentuales frente al base y la abstencion innecesaria en 12,3 puntos. En la prueba de citacion precisa con 30 pares ficticios, el adaptador cito ambas frases en 25 de 30 casos con evidencia presente, y el verificador se abstuvo en los 30 casos con evidencia eliminada pero rechazo 11 casos con evidencia presente. La revision ciega fue realizada por un unico revisor de IA sobre 150 salidas barajadas, con semilla 42, sin adjudicacion humana independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 1,5B en fp16 requiere aproximadamente 3 GB de pesos, mas overhead de activaciones y KV cache; en cuantizacion de 4 bits se situa en torno a 1-1,5 GB. El adaptador LoRA anade un coste despreciable.
- GPU recomendadas: el entrenamiento se realizo en una NVIDIA A10G (24 GB). Para inferencia basta una GPU de consumo; el demo Gradio esta pensado para ejecutarse en local.
- Cabe en GPU de consumo: si, en tarjetas con 4 GB o mas de VRAM en fp16 y en tarjetas con 2-3 GB en cuantizacion de 4 bits, aunque la model card no documenta cuantizaciones del adaptador.
- Opciones de despliegue: transformers con peft y accelerate (versiones fijadas en la model card: transformers 4.51.3, peft 0.15.2, accelerate 1.6.0, torch 2.6.0), mas una aplicacion Gradio 5.49.1. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El pipeline requiere dos pasadas (generador con hasta 192 tokens nuevos y verificador con hasta 6 tokens nuevos), lo que aproximadamente duplica el coste respecto a una sola generacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| grounded-qa-qwen-1p5b (este modelo) | 1,5B + LoRA | 32.768 tokens (entrenado a 1.536) | QA con citas y abstención verificada | no disponible | Hugging Face, 0 descargas |
| Qwen2.5-1.5B-Instruct (base) | 1,5B | 32.768 tokens | Instruccion general, sin grounding especifico | Apache 2.0 (segun el modelo base) | Hugging Face, ampliamente usado |
| Adaptadores de QA sobre modelos pequenos (categoria generica) | variable | variable | QA extractivo o generativo | variable | variable |

No se dispone de datos de benchmarks comparativos con otros adaptadores de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo solo evalua la evidencia del pasaje suministrado: no realiza recuperacion ni valida la exactitud o vigencia real del pasaje.
- El verificador puede descartar respuestas utiles: en la prueba de citacion precisa rechazo 11 de 30 casos con evidencia presente, y en el split de desarrollo provoco 97 abstenciones en preguntas contestables frente a 45 del adaptador solo.
- La revision de calidad de citas fue realizada por un unico revisor de IA sin adjudicacion humana independiente, lo que limita la fiabilidad de las metricas de soporte.
- El modelo falla en preguntas que requieren nombrar una entidad concreta: en la revision de 50 preguntas, devolvio una descripcion del intro sin nombrar la cancion solicitada; el soporte de citas no garantiza que la respuesta aborde la pregunta.
- El adaptador solo reduce la abstencion innecesaria; el fallo de abstencion empeora frente al base (33 frente a 27) sin el verificador.
- Idioma limitado al ingles; no se documenta soporte multilingue.
- Licencia no disponible: no se puede confirmar el uso comercial sin consultar al autor.
- Proyecto con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validacion externa ni mantenimiento continuado.
- El entrenamiento se limita a 3.342 ejemplos y una epoca, con secuencias truncadas a 1.536 tokens, lo que puede limitar el rendimiento en pasajes mas largos.
- Riesgo de alucinacion residual en el generador: aunque el pipeline penaliza respuestas sin soporte, el adaptador por si solo puede producir respuestas mal formadas (7 de 600 en el split de desarrollo).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/devjuneja789/grounded-qa-qwen-1p5b
- Modelo base Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Dataset CLAPNQ: https://huggingface.co/datasets/PrimeQA/clapnq
- Job de generacion de benchmark: https://huggingface.co/jobs/devjuneja789/6b060576d0582cfbbefd1901
- Job de verificacion de evidencia: https://huggingface.co/jobs/devjuneja789/6b0669ba1460ffe1d5e9c7b1
