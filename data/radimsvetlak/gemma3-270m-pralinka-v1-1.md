# RadimSvetlak/Gemma3-270M-Pralinka-V1.1

# Gemma3-270M-Pralinka-V1.1

## Resumen

Gemma3-270M-Pralinka-V1.1 es un ajuste fino en checo de google/gemma-3-270m-it que adopta la personalidad de Pralinka, una yegua haflinger con opiniones, y responde preguntas sobre caballos, vida de cuadra, entrenamiento y rutas a caballo. Lo publica el usuario RadimSvetlak en HuggingFace como parte de un proyecto que une informatica y equitacion, pensado para acercar a ninos y visitantes de cuadras las nociones basicas sobre el cuidado del caballo. Con 268.098.176 parametros (~540 MB en bf16), el modelo esta disenado para ejecutarse en CPU o en GPU de gama baja.

Tecnicamente es un transformer decoder-only de la familia Gemma 3 (variante gemma3_text) sometido a un pipeline de tres etapas con fine-tuning completo, sin LoRA: partida desde el modelo instruct de 270M de Google, preentrenamiento continuado en checo y ajuste supervisado sobre un dataset de dialogos de Pralinka. No es un modelo de proposito general ni una base de conocimiento: es un personaje de dominio estrecho, y el propio autor advierte de que fuera del ambito equino produce salidas incoherentes.

Su relevancia practica esta en el nicho de los modelos diminutos para edge: cabe en cualquier GPU de consumo e incluso en CPU, se puede desplegar sin infraestructura dedicada y sirve como caso de estudio reproducible de un pipeline CPT + SFT sobre un modelo base de 270M en un idioma minoritario como el checo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 3, variante gemma3_text) |
| Parametros totales | 268.098.176 (268 M) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el entrenamiento de la etapa SFT uso max_length = 256) |
| Tipos de cuantizacion | no disponible; el repositorio publica pesos en safetensors y el autor recomienda ejecutar en float32 (bf16 en entrenamiento) |
| Idiomas soportados | checo (codigo cs) |
| Licencia | Gemma (etiqueta license: gemma) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,6 GB |
| Modelo base | google/gemma-3-270m-it |
| Libreria de inferencia | transformers |
| Pipeline | text-generation |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-3-270m-it y se entrena con fine-tuning completo en tres etapas, sin adaptadores LoRA. La etapa 1 es el checkpoint instruct original de Google. La etapa 2 es un preentrenamiento continuado en checo que da lugar al checkpoint intermedio gemma3_270m_it_czech_cpt. La etapa 3 es un ajuste supervisado sobre el dataset de dialogos pralinka_q_a_v3, empleando trl.SFTTrainer en formato prompt/completion con completion_only_loss=True, de modo que la perdida se calcula unicamente sobre la respuesta y no sobre la pregunta.

Los hiperparametros de la etapa 3 son: 2 epocas, learning rate 1e-4, weight decay 0,01, warmup ratio 0,2, batch size efectivo 16 (2 x acumulacion de gradiente 8), max_length 256, sin packing, precision bf16, gradient checkpointing activado, atencion en modo eager, split de evaluacion del 5 % y semilla 42. No se documenta el volumen de tokens de la etapa de preentrenamiento continuado en checo ni la composicion exacta del corpus, ni si hubo fases de RLHF o DPO. El autor recomienda ejecutar la inferencia en float32 y con attn_implementation="eager", indicando que float32 es mas estable que fp16 en este modelo.

Ademas del formato de pesos, el modelo exige un prefijo literal en checo dentro del mensaje de usuario: "Odpověz jako Pralinka:". Este prefijo forma parte del formato de entrenamiento y el autor senala que el rendimiento empeora de forma perceptible si se omite.

## Capacidades

- Generacion de texto conversacional en checo con una personalidad fija (Pralinka, yegua haflinger).
- Respuesta a preguntas de dominio equino: alimentacion, vida de cuadra, identidad de otros caballos, rutas y entrenamiento.
- Respuestas deliberadamente breves: la longitud mediana de respuesta es de 65 caracteres y el autor recomienda max_new_tokens=120.
- Formato de chat mediante apply_chat_template, con el prefijo obligatorio "Odpověz jako Pralinka:" en el contenido del mensaje de usuario.
- Decodificacion greedy como ajuste por defecto y recomendado; tambien admite muestreo con temperature=0.7, top_p=0.9, top_k=40 a costa de mayor tasa de respuestas sin sentido.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento.
- No se documenta capacidad multilingue: el modelo esta orientado exclusivamente al checo.
- Inferencia viable en CPU y en GPU de gama baja por su tamano de 268M parametros.

## Casos de uso

- Quiosco o terminal interactiva en una cuadra o feria equina: el modelo puede resolver en CPU, sin conexion a internet y con latencia de subsegundo, las preguntas tipicas de visitantes y ninos sobre alimentacion, cuidados y rutinas de cuadra, en checo y con un tono accesible.
- Juguete o robot educativo desconectado: al ocupar aproximadamente 540 MB en bf16 y ejecutarse en CPU, se puede embarcar en un dispositivo de gama baja para ofrecer una mascota conversacional tematica en checo.
- Personaje no jugador (NPC) en un videojuego o experiencia de rol: el modelo sostiene el registro de un personaje concreto, con respuestas cortas y coherentes dentro del guion, lo que encaja con dialogos de un solo turno o cadenas breves generadas en tiempo real.
- Material didactico y demostracion docente de un pipeline CPT + SFT: el autor documenta de forma completa las tres etapas, los hiperparametros y el formato de perdida, de modo que sirve como ejemplo reproducible de ajuste de un modelo de 270M a un idioma minoritario y a un dominio estrecho.
- Pruebas de concepto de despliegue edge con transformers y TGI: el repositorio esta etiquetado como text-generation-inference y endpoints_compatible, lo que permite validar una arquitectura de servicio ligera antes de escalar a modelos mayores.
- Generacion de microtextos tematicos para aplicaciones de divulgacion equina: fichas breves, consejos o respuestas frecuentes en checo que despues se revisan manualmente antes de publicarse.
- Linea de investigacion sobre modelos diminutos: analisis de olvido catastrofico, transferencia desde un idioma mayoritario al checo y efectos del ajuste de dominio sobre un modelo de 270M.
- Cadena de voz en checo: combinado con reconocimiento de voz y sintesis en checo, puede alimentar un asistente hablado de dominio restringido en una tablet o un altavoz de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, GSM8K, HumanEval, etc.) en la informacion disponible. El autor unicamente reporta una evaluacion interna de 73 preguntas ejecutada en CUDA, con estos resultados agregados: las 73 preguntas fueron respondidas sin errores y sin salidas vacias, con una mediana de 0,78 segundos por respuesta y una longitud mediana de 65 caracteres.

| Categoria de la evaluacion interna | Numero de preguntas |
|---|---|
| Vida del caballo (horse life) | 24 |
| Identidad (identity) | 20 |
| Rutas a caballo (trail rides) | 10 |
| Dificiles (hard) | 8 |
| Operativa de cuadra (stable operations) | 7 |
| Fuera de dominio (out-of-domain) | 4 |
| Total | 73 |

Dificultad declarada del conjunto: 16 preguntas faciles, 34 de dificultad media y 23 dificiles. No se detalla el modelo de GPU empleado en la medicion ni la metrica de calidad aplicada, por lo que la tasa de acierto no es comparable con benchmarks academicos.

## Requisitos de hardware

- Pesos en float32: aproximadamente 1,07 GB (configuracion recomendada por el autor por estabilidad).
- Pesos en bf16: aproximadamente 540 MB, segun el propio autor.
- Pesos en int8: aproximadamente 270 MB (estimacion por tamano de parametros, no confirmada por el autor).
- Pesos en int4: aproximadamente 135 MB (estimacion por tamano de parametros, no confirmada por el autor).
- A lo anterior hay que sumar activaciones y cache KV segun la longitud de generacion; el autor limita las respuestas a max_new_tokens=120 en los ejemplos.
- CPU: soportado explicitamente; el autor indica que el modelo se ejecuta comodamente en CPU.
- GPU de consumo: cabe en cualquier GPU con mas de 2 GB de VRAM (por ejemplo GTX 1650, RTX 3050, RTX 4060, RTX 4090). No se especifica el modelo de GPU usado en las mediciones.
- GPU de datacenter: A100, H100 u otras no aportan ventaja relevante a este tamano; el modelo esta pensado para edge.
- Opciones de despliegue: transformers (documentado con ejemplo de codigo), text-generation-inference y endpoints compatibles segun las etiquetas del repositorio. No se publican pesos GGUF, por lo que el uso directo con llama.cpp u Ollama no esta soportado por el autor.
- Latencia: mediana de 0,78 segundos por respuesta en CUDA sobre el conjunto de 73 preguntas. No se reporta throughput ni latencia en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Rendimiento publicado |
|---|---|---|---|---|---|
| Gemma3-270M-Pralinka-V1.1 | 268 M | no disponible | checo (cs) | Gemma | Evaluacion interna de 73 preguntas: 73/73 respondidas, mediana 0,78 s y 65 caracteres por respuesta |
| google/gemma-3-270m-it (modelo base) | 270 M | no disponible en la informacion proporcionada | multilingue (segun el modelo base) | Gemma | no disponible en la informacion proporcionada |
| gemma3_270m_it_czech_cpt (checkpoint intermedio de la etapa 2) | 270 M | no disponible | checo | Gemma | no disponible; no se publican metricas de esta etapa |
| Otros modelos checos de menos de 1B parametros | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos verificables sobre alternativas comparables de terceros (por ejemplo modelos checos de menos de 1B parametros), por lo que no se puede establecer una comparacion cuantitativa con ellas.

## Limitaciones y advertencias

- No es una fuente de hechos: el propio autor advierte de que las respuestas sobre caballos, aunque suelan ser razonables, no estan verificadas y el modelo puede inventar detalles. No debe usarse para decisiones veterinarias, medicas o de seguridad.
- Fuera del dominio equino el modelo no funciona y genera texto sin sentido, en ocasiones con palabras cortadas a mitad de token (el autor documenta el caso de "Wi-Fi" degradado a "Wi-šinou"). Esto es comportamiento esperado en un modelo de 270M entrenado en un dominio estrecho.
- El modelo no sabe decir "no lo se": intenta responder en personaje aunque la respuesta no tenga sentido.
- Activar el muestreo aumenta de forma medible la tasa de respuestas incoherentes; el ajuste recomendado es decodificacion greedy con repetition_penalty=1.05.
- El prefijo "Odpověz jako Pralinka:" debe mantenerse literal y en checo; omitirlo degrada el rendimiento de forma perceptible.
- El autor recomienda float32 y atencion en modo eager; fp16 se describe como menos estable en este modelo.
- Soporte exclusivo del checo: no hay capacidades multilingues documentadas.
- No se publican cuantizaciones GGUF ni otros formatos ademas de safetensors.
- Licencia Gemma: no es una licencia de codigo abierto estandar, sino que implica la aceptacion de los terminos de uso de Gemma. En la informacion proporcionada no se detallan las condiciones concretas de uso comercial ni las restricciones de la politica de uso prohibido; hay que consultar los terminos antes de cualquier despliegue en produccion.
- El modelo base pertenece a Google, por lo que se aplican las obligaciones de atribucion que fije la licencia Gemma.
- El modelo acumula 0 descargas y 0 likes, por lo que no cuenta con validacion de la comunidad ni con reportes independientes de calidad.
- La model card proporcionada esta truncada en la seccion de limitaciones, de modo que el resto de advertencias del autor no esta disponible.
- No se documenta sesgo alguno de forma explicita, pero el personaje tiene una voz fija y una perspectiva unica de dominio, lo que condiciona todas sus respuestas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RadimSvetlak/Gemma3-270M-Pralinka-V1.1
- Modelo base: https://huggingface.co/google/gemma-3-270m-it
- Paper, blog, repositorio o demo adicionales: no disponibles en la informacion proporcionada. Los resultados de la busqueda web no contienen ningun enlace relacionado con el modelo (devuelven unicamente paginas sin relacion tematica).
