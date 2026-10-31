# JumperV/Diapason

## Resumen

Diapason es un adaptador LoRA entrenado sobre Qwen3-4B-Instruct-2507 de Qwen, especializado en ópera y teoría musical occidental. Desarrollado por el usuario JumperV, el modelo responde preguntas sobre formas y géneros operísticos, tipos de voz, técnica vocal, compositores y obras, así como sobre intervalos, acordes, escalas y modos, tonalidades, cifrado romano, armonía cromática y métrica. Se trata de un proyecto de especialización vertical sobre un modelo base pequeño, no de un modelo nuevo desde cero.

Su relevancia radica en demostrar que un fine-tuning ligero (QLoRA en una única RTX 3060 de 12 GB) puede producir mejoras drásticas en tareas muy acotadas: en los ejercicios de teoría musical con respuesta exacta, pasa del 15,1 % del modelo base al 89,4 %, una ganancia de 74,3 puntos. En cambio, el conocimiento general de teoría musical apenas varía, lo que indica que el adaptador añade sobre todo capacidad de cálculo y formato de respuesta, no conocimiento factual nuevo.

Es un modelo conversacional de generación de texto, entrenado con TRL y PEFT, disponible bajo licencia Apache-2.0. Al ser un adaptador LoRA, requiere cargar el modelo base Qwen3-4B-Instruct-2507 y aplicarle los pesos del adaptador (0,1 GB de repositorio). Está pensado para uso con el system prompt recomendado por el autor y, en tareas de cálculo, pidiendo trabajo paso a paso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (QLoRA, 4-bit NF4) sobre Qwen3-4B-Instruct-2507 (transformer decoder) |
| Parametros totales | no disponible (base: ~4B de parametros) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3-4B-Instruct-2507) |
| Tipos de cuantizacion | NF4 4-bit (entrenado y evaluado con NF4 + double quant, compute bf16); tambien funciona en bf16 completo |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT, 0,1 GB) |

## Arquitectura y entrenamiento

Diapason es un adaptador LoRA con r=16, alpha=32 y dropout 0,05 aplicado a las proyecciones q/k/v/o/gate/up/down del modelo base. El entrenamiento se realizo con QLoRA: base cuantizado a 4 bits NF4 con double quantization y computo en bf16. Se emplearon 2 epocas con learning rate 2e-4 y schedule coseno, batch size efectivo de 16, longitud maxima de 768 tokens y loss calculada solo sobre las respuestas. El entrenamiento uso las librerias TRL y PEFT sobre una sola GPU RTX 3060 de 12 GB.

Los datos de entrenamiento constan de dos fuentes: por un lado, ~6.319 pares pregunta-respuesta generados por Gemma-4 12B a partir de 116 capitulos de *Open Music Theory, Version 2* (CC BY-SA 4.0) y 736 articulos de Wikipedia en ingles sobre opera y teoria musical (CC BY-SA 4.0). Por otro, 1.980 ejercicios de teoria musical generados y verificados por un motor de teoria escrito en Python, con respuestas exactas y explicaciones paso a paso. No se uso RLHF ni DPO; el ajuste es supervisado convencional. MusicTheoryBench no se uso en el entrenamiento.

## Capacidades

- Respuesta de preguntas sobre opera: formas y generos operisticos, tipos de voz, tecnica vocal, compositores y obras.
- Teoria musical occidental: intervalos, acordes y su identificacion, escalas y modos, armaduras, cifrado romano, acordes de sexta napolitana y sexta aumentada, transposicion y metrica.
- Calculo de teoria musical con trabajo paso a paso: al pedirle razonamiento paso a paso, escribe el procedimiento y termina con una linea "Answer: ...", lo que permite parseo automatico de la respuesta final.
- Generacion de texto conversacional en ingles, heredando las capacidades generales del modelo base Qwen3-4B-Instruct-2507.
- Respuestas mas concisas que el modelo base en preguntas de opera y teoria, segun la evaluacion del autor.
- No hay informacion sobre soporte de tool calling, agentes, vision ni audio.

## Casos de uso

- Tutor de teoria musical para estudiantes: puede generar explicaciones sobre intervalos, acordes, escalas y armonia cromatica, sirviendo de apoyo al estudio autodidacta con respuestas paso a paso.
- Generacion automatica de ejercicios y drills: dado su alto rendimiento en ejercicios de respuesta exacta (89,4 %), puede integrarse en aplicaciones de practica de teoria musical que requieran respuestas verificables por codigo.
- Asistente de repaso para cantantes y estudiantes de canto: responde dudas sobre tipos de voz, tecnica vocal y terminologia operistica (por ejemplo, que es un leitmotiv y a que compositor se asocia).
- Apoyo en transcripcion y analisis armonico: puede calcular cifrados romanos, identificar acordes de sexta napolitana o sexta aumentada y realizar transposiciones, tareas donde el modelo base fallaba en mas del 80 % de los casos.
- Asistente de programa de mano y notas de programa para salas de opera: puede redactar explicaciones concisas sobre obras, compositores y convenciones del genero para material divulgativo.
- Integracion en chatbots educativos en ingles: al ser un modelo conversacional ligero cuantizable a 4 bits (~3-4 GB de VRAM), es viable desplegarlo localmente en aplicaciones de tutoria con hardware modesto.
- Herramienta de verificacion rapida en flujos de edicion musical: la linea final "Answer: ..." facilita la extraccion programatica de respuestas en pipelines automatizados.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card, comparando el adaptador con su modelo base:

| Test | Modelo base | Diapason | Cambio (puntos) |
|---|---:|---:|---:|
| MusicTheoryBench: knowledge (269 preguntas, azar 25 %) | 59,1 % | 58,7 % | -0,4 |
| MusicTheoryBench: reasoning (98 preguntas, azar 25 %) | 33,7 % | 34,7 % | +1,0 |
| MusicTheoryBench: all (367 preguntas) | 52,3 % | 52,3 % | +0,0 |
| Theory drills: respuesta exacta (held out, 179 ejercicios) | 15,1 % | 89,4 % | +74,3 |
| Preguntas de opera/teoria: puntuacion (250 held out) | 44,4 % | 43,8 % | -0,6 |
| Preguntas de opera/teoria: totalmente correctas | 29,2 % | 17,2 % | -12,0 |
| Preguntas de opera/teoria: incorrectas | 40,4 % | 29,6 % | -10,8 |

Notas metodologicas del autor: MusicTheoryBench no se uso en el entrenamiento; en los ejercicios de calculo el modelo razona paso a paso y se lee la letra de la linea "Answer:". Las preguntas de opera/teoria se graduan 0/1/2 por Gemma-4 12B contra respuestas de referencia. No hay benchmarks estandar (MMLU, HumanEval, GSM8K) publicados para este adaptador.

## Requisitos de hardware

- VRAM estimada para inferencia: ~3-4 GB con el setup NF4 4-bit con el que fue entrenado y evaluado; ~9 GB en bf16 completo.
- GPU recomendadas: cualquier GPU consumer moderna con al menos 6 GB de VRAM; el propio entrenamiento se realizo en una RTX 3060 de 12 GB, por lo que la inferencia es claramente accesible en hardware de consumo.
- Cabe en GPUs consumer como la RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090 sin problemas, incluso en bf16.
- Despliegue: el codigo de ejemplo usa transformers + PEFT con BitsAndBytesConfig (NF4); al ser un adaptador PEFT, es compatible con vLLM (soporte de LoRA), y el modelo base Qwen3-4B-Instruct-2507 es compatible con llama.cpp y Ollama, aunque no hay informacion de que el adaptador este publicado en formato GGUF.
- Latencia y throughput: no disponible.
- Consejos de uso del autor: usar siempre el system prompt recomendado (sin el, las respuestas empeoran notablemente) y pedir trabajo paso a paso para calculos, leyendo la linea final "Answer: ...".

## Comparativa con modelos similares

| Modelo | Tipo | Base / tamano | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JumperV/Diapason | LoRA sobre LLM | Qwen3-4B-Instruct-2507 (~4B) | Opera y teoria musical (calculs exactos 89,4 %) | Apache-2.0 | HuggingFace, safetensors (adaptador PEFT) |
| Qwen/Qwen3-4B-Instruct-2507 | LLM general | ~4B | Generalista (drills: 15,1 %) | Apache-2.0 | HuggingFace, multiples formatos |
| m-a-p/MusicTheoryBench | Dataset de evaluacion | no aplica | Evaluacion de teoria musical | no disponible | HuggingFace (datasets) |

No se conocen otros adaptadores LoRA de teoria musical u opera directamente comparables con resultados publicados; no disponible.

## Limitaciones y advertencias

- Al ser un modelo pequeno (4B), puede afirmar hechos erroneos con seguridad, especialmente sobre obras y personas poco conocidas; riesgo de alucinacion factual relevante en el dominio operistico.
- Las respuestas de entrenamiento fueron generadas por una maquina (Gemma-4 12B) a partir de Wikipedia y Open Music Theory, por lo que pueden heredar errores del modelo profesor.
- Tiende a mostrar el razonamiento incluso cuando se le pide solo una letra o una palabra.
- Aproximadamente 1 de cada 10 ejercicios de calculo sigue siendo erroneo, normalmente por un desliz dentro de un razonamiento correcto (por ejemplo, un recuento de semitonos equivocado en un intervalo).
- El conocimiento general de teoria musical no mejoro respecto al modelo base (MusicTheoryBench sin cambios); la especializacion afecta sobre todo a los calculos.
- En preguntas de opera/teoria abiertas, la proporcion de respuestas totalmente correctas bajo (de 29,2 % a 17,2 %), aunque las incorrectas tambien bajaron; el modelo responde de forma mas concisa pero no necesariamente mejor.
- Notacion: usa ♯/♭ para las alteraciones y escribe los dobles sostenidos como ♯♯.
- Sin el system prompt recomendado, la calidad de las respuestas empeora de forma notable.
- Licencia Apache-2.0: sin restricciones para uso comercial, aunque las fuentes de datos originales son CC BY-SA 4.0 y los autores de estas no respaldan el modelo.
- Uso muy marginal hasta la fecha (36 descargas, 2 likes), sin comunidad de revision ni validacion externa de los resultados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JumperV/Diapason
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Dataset de evaluacion MusicTheoryBench: https://huggingface.co/datasets/m-a-p/MusicTheoryBench
- Open Music Theory, Version 2 (fuente de datos): https://viva.pressbooks.pub/openmusictheory/
- Licencia CC BY-SA 4.0 de las fuentes: https://creativecommons.org/licenses/by-sa/4.0/
- Modelo profesor Gemma-4 12B: https://huggingface.co/google/gemma-4-12b-it
