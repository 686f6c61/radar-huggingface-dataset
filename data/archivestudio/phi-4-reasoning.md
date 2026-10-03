# ArchiveStudio/Phi-4-reasoning

## Resumen

ArchiveStudio/Phi-4-reasoning es un repositorio de pesos publicado en HuggingFace que redistribuye el modelo Phi-4-reasoning de Microsoft Research, un modelo de razonamiento de 14.659.507.200 parametros (aproximadamente 14,7B) afinado a partir de microsoft/phi-4. El autor del repositorio es la cuenta ArchiveStudio, mientras que el desarrollo original corresponde a Microsoft Research, tal y como se declara en la model card y en el informe tecnico asociado (arXiv:2504.21318).

Se trata de un transformer decoder-only denso, sin mezcla de expertos, con una ventana de contexto de 32.000 tokens y entrenamiento exclusivamente en ingles. La propuesta del modelo es ofrecer razonamiento explicito de tipo cadena de pensamiento (chain-of-thought) en un tamano que quepa en entornos con memoria y computo limitados, cubriendo sobre todo matematicas, ciencia y codigo.

El modelo es relevante porque combina un ajuste supervisado sobre trazas de razonamiento con aprendizaje por refuerzo, y separa la respuesta en un bloque de pensamiento y un bloque de solucion. Su licencia MIT y su tamano de 14B lo situan como alternativa abierta a modelos de razonamiento mayores, aunque el repositorio concreto analizado no registra descargas ni interacciones y su fecha de creacion publicada es posterior a la del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (modelo base Phi-4); el repositorio declara la arquitectura `phi3` |
| Parametros totales | 14.659.507.200 (14,7B) |
| Parametros activos | no aplica, es un modelo denso |
| Longitud de contexto | 32.000 tokens |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; el repositorio solo publica pesos en safetensors |
| Idiomas soportados | ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria `transformers`) |
| Modelo base | microsoft/phi-4 |
| Tamano del repositorio | 29,3 GB |
| Parametros de inferencia recomendados | `temperature=0.8`, `top_k=50`, `top_p=0.95`, `do_sample=True` |
| Plantilla de prompt | ChatML, con system prompt especifico que fuerza el formato `<think>...</think>` |
| Pipeline | text-generation |
| Fecha de publicacion del modelo original | 30 de abril de 2025 |

## Arquitectura y entrenamiento

La arquitectura es la del Phi-4 original: un transformer decoder-only denso de 14B parametros, sin componentes de mezcla de expertos ni capas recurrentes. El ajuste se realizo mediante supervised fine-tuning sobre un conjunto de trazas de cadena de pensamiento y un posterior aprendizaje por refuerzo. La model card indica que el dataset de SFT combina prompts sinteticos con datos filtrados de alta calidad procedentes de dominios publicos, centrados en matematicas, ciencia y programacion, ademas de datos de alineamiento para seguridad y Responsible AI. El volumen total de entrenamiento declarado es de 16.000 millones de tokens, de los cuales unos 8.300 millones son unicos.

El entrenamiento se llevo a cabo con 32 GPU H100 de 80 GB durante 2,5 dias, y la fecha de corte de los datos publicos es marzo de 2025. La innovacion principal no esta en la arquitectura, sino en el formato de salida: el modelo genera primero un bloque de razonamiento y despues un bloque de resumen o solucion, lo que permite inspeccionar el proceso intermedio. Para aprovechar esa capacidad, la model card exige usar siempre la plantilla ChatML con un system prompt concreto y recomienda `max_new_tokens=32768` en consultas complejas para no truncar la cadena de pensamiento.

## Capacidades

- Razonamiento explicito: genera una cadena de pensamiento antes de la respuesta final, estructurada en bloque de pensamiento y bloque de solucion.
- Matematicas: es el dominio principal declarado por el autor; la model card indica que el modelo esta disenado y evaluado para razonamiento matematico.
- Ciencia: el dataset de ajuste incluye contenido cientifico filtrado de alta calidad.
- Generacion de codigo: el corpus de entrenamiento cubre habilidades de programacion.
- Generacion de texto y conversacion: pipeline `text-generation` con soporte de chat multi-turno mediante plantilla ChatML.
- Control de formato: admite un system prompt que impone la estructura de respuesta con etiquetas `<think>` y `</think>`.
- Multilinguismo: no disponible; el modelo esta declarado y entrenado unicamente en ingles.
- Tool calling / function calling: no disponible; no se declara soporte en la informacion proporcionada.
- Comportamiento agentico y razonamiento multi-paso: no disponible como capacidad declarada, aunque el bucle de razonamiento interno (analisis, sintesis, reevaluacion, reflexion, retroceso e iteracion) descrito en el system prompt es afín a flujos de varios pasos.
- Vision, audio u otras modalidades: no disponible; el modelo es exclusivamente de texto.

## Casos de uso

- Resolucion de problemas matematicos paso a paso: el modelo esta entrenado especificamente para razonamiento matematico y expone el proceso intermedio en el bloque de pensamiento, lo que permite auditar como llega al resultado y usar la traza como material didactico.
- Tutoria y generacion de ejercicios resueltos: con 32.000 tokens de contexto se pueden introducir enunciados largos, varios problemas encadenados o material de referencia y obtener soluciones detalladas en ingles.
- Asistencia a la programacion: dado su entrenamiento en codigo, puede generar y explicar fragmentos, revisar logica de algoritmos o proponer correcciones, siempre con la salvedad de que no declara soporte de tool calling.
- Apoyo a razonamiento cientifico en investigacion: util para borradores de derivaciones, comprobaciones de consistencia de planteamientos o exploracion de hipotesis en entornos con recursos limitados y en ingles.
- Evaluacion y comparacion de modelos de razonamiento: al ser un modelo abierto de 14B con licencia MIT, sirve como referencia reproducible en experimentos academicos sobre cadena de pensamiento y aprendizaje por refuerzo.
- Despliegue en entornos con restricciones de latencia y memoria: al ser denso y de 14B, es candidato para servicios de bajada latencia donde un modelo de mayor tamano no es viable, siempre que el trafico sea en ingles.
- Generacion de datos sinteticos de razonamiento: sus trazas de pensamiento pueden emplearse para construir datasets de destilacion o para aumentar corpus de entrenamiento en matematicas y ciencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card proporcionada no incluye tablas de MMLU, HumanEval, GSM8K ni de otras evaluaciones, y el informe tecnico enlazado (arXiv:2504.21318) no aporta cifras en el material facilitado. No se deben extrapolar numeros a partir del modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: en BF16/FP16, aproximadamente 29,3 GB solo para los pesos (coincide con el tamano del repositorio); en cuantizacion de 8 bits, en torno a 15 GB; en 4 bits, unos 8-9 GB. Son estimaciones derivadas del numero de parametros, no datos publicados por el autor.
- Memoria adicional: hay que sumar el cache KV, que crece con la longitud de contexto. Con 32.000 tokens y cadenas de pensamiento largas el consumo es significativo, por lo que se recomienda reservar margen sobre la VRAM de los pesos.
- GPU recomendadas: H100 de 80 GB y A100 de 80 GB o 40 GB en BF16 para contexto completo; el entrenamiento original se hizo con 32 H100 de 80 GB.
- GPU de consumo: cabe en una RTX 4090 de 24 GB o una RTX 3090 de 24 GB si se aplica cuantizacion de 8 o 4 bits y se limita la longitud de contexto. En BF16 no cabe en ninguna GPU de consumo actual de un solo modulo.
- Opciones de despliegue: `transformers` es la libreria declarada; tambien es compatible con text-generation-inference y con endpoints compatibles segun los tags del repositorio. vLLM, llama.cpp y Ollama serian viables, pero no se publican pesos GGUF ni cuantizaciones en este repositorio, por lo que habria que generarlos.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.
- Configuracion de generacion obligatoria: `temperature=0.8`, `top_k=50`, `top_p=0.95`, `do_sample=True`, y `max_new_tokens` hasta 32.768 para consultas complejas. Usar temperatura 0 degrada la calidad, segun advierte la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ArchiveStudio/Phi-4-reasoning | 14,7B | 32.000 tokens | MIT | safetensors en HuggingFace |
| microsoft/Phi-4 (modelo base) | 14B | no disponible | MIT | HuggingFace |
| microsoft/Phi-4-reasoning (original) | 14B | 32.000 tokens | MIT | HuggingFace |
| Qwen2.5-14B-Instruct | 14B | no disponible | Apache 2.0 | HuggingFace |

Los datos de contexto y rendimiento de las alternativas no se han verificado con la informacion disponible, por lo que se marcan como no disponibles. La diferencia principal del repositorio analizado respecto al modelo original de Microsoft es el publicador: ArchiveStudio es un tercero que redistribuye los pesos, y su repositorio registra 0 descargas y 0 interacciones, ademas de una fecha de creacion publicada muy posterior a la del modelo original (abril de 2025).

## Limitaciones y advertencias

- Alcance declarado restringido: la model card indica que el modelo esta disenado y probado para razonamiento matematico, no para cualquier proposito downstream.
- Idioma: solo ingles. No hay soporte declarado ni evaluado para castellano u otros idiomas.
- Sesgos: no se detallan sesgos conocidos en la informacion proporcionada; la model card remite a las consideraciones de Responsible AI del modelo original.
- Alucinacion: no se publican tasas de alucinacion ni evaluaciones de veracidad. Al ser un modelo de razonamiento con cadenas de pensamiento largas, la traza intermedia puede contener pasos plausibles pero incorrectos.
- Riesgo de truncamiento: si no se configura `max_new_tokens` de forma adecuada, la cadena de pensamiento puede cortarse antes de la solucion final.
- Requisitos de plantilla estrictos: usar una plantilla distinta de ChatML o un system prompt distinto del especificado degrada el rendimiento.
- Licencia: MIT, lo que permite uso comercial, pero el enlace de licencia del repositorio apunta al fichero de microsoft/Phi-4-reasoning; conviene verificar la trazabilidad de la redistribucion antes de usarlo en produccion.
- Repositorio de terceros: al tratarse de una resubida por una cuenta distinta de Microsoft, no hay garantia de mantenimiento, actualizacion ni de integridad verificada por el autor original.
- Fecha de corte: los datos publicos llegan hasta marzo de 2025; no hay conocimiento posterior.
- Datos de evaluacion ausentes: no hay benchmarks en la informacion disponible, por lo que no se puede validar el rendimiento frente a alternativas sin evaluacion propia.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/ArchiveStudio/Phi-4-reasoning
- Informe tecnico de Phi-4-reasoning: https://huggingface.co/papers/2504.21318
- Fichero de licencia enlazado por el autor: https://huggingface.co/microsoft/Phi-4-reasoning/resolve/main/LICENSE
- Modelo base: https://huggingface.co/microsoft/phi-4

Nota sobre la busqueda web: los resultados devueltos por el buscador no guardan relacion con el modelo (contenido sobre programas universitarios de arquitectura) y no aportan enlaces utiles para esta ficha.
