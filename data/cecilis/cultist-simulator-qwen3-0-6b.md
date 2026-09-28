# Cecilis/cultist-simulator-qwen3-0.6b

## Resumen

El modelo `Cecilis/cultist-simulator-qwen3-0.6b` es un ajuste fino de tipo LoRA sobre la base densa `Qwen/Qwen3-0.6B`, orientado a la generación de texto con el estilo de escritura del videojuego *Cultist Simulator* (Weather Factory). Su objetivo no es resolver tareas generales de razonamiento, sino reproducir un registro literario concreto: prosa críptica, contenida, libresca y con connotaciones inquietantes, aplicada a descripciones de cartas, narrativa de eventos, textos de desenlace y creación temática. Cuenta con 596.049.920 parámetros y se distribuye tanto como modelo fusionado (1,13 GB) como adaptador LoRA (38,5 MB).

El autor lo ha entrenado con LLaMA-Factory 0.9.4 sobre un corpus de 26.875 muestras extraídas del propio juego instalado localmente, sin dependencia de fuentes en línea, y con una partición de validación de 779 ejemplos. El entrenamiento se organiza en seis tareas derivadas del mismo material: traducción chino-inglés, descripción de cartas, narrativa de acciones, texto de desenlaces, creación temática por principios y continuación estilística. El resultado final reporta un `eval_loss` de 2.406.

Es relevante ahora como ejemplo de ajuste fino muy económico (1 hora y 22 minutos en una única GPU de 16 GB) para un dominio creativo y de nicho, y porque ilustra con claridad los compromisos de un modelo de 0,6B: excelente coste de despliegue, pero con pérdida de formato en tareas que exigen fidelidad estructural estricta, tal como el propio autor documenta al compararlo con la variante de 4B. La licencia es Apache-2.0, heredada del modelo base, aunque el autor restringe explícitamente el uso a fines no comerciales por el origen del corpus.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3), ajustado con LoRA sobre capas de proyección q/k/v/o/gate/up/down |
| Parametros totales | 596.049.920 (~0,6B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el entrenamiento uso una longitud de truncado de 896 tokens; el modelo base Qwen3-0.6B declara 32.768 tokens nativos) |
| Tipos de cuantizacion | Pesos en bf16; el repositorio incluye un `Modelfile` de LLaMA-Factory que permite generar cuantizaciones GGUF a traves de Ollama. No se publican ficheros GGUF pre-cuantizados |
| Idiomas soportados | Chino simplificado (zh) e ingles (en) |
| Licencia | Apache-2.0 (el autor solicita uso exclusivamente no comercial por el origen del corpus) |
| Formato de pesos | safetensors (modelo fusionado en la raiz y adaptador LoRA en `lora/`), mas `Modelfile` para Ollama |

## Arquitectura y entrenamiento

La base es Qwen3-0.6B, un transformer denso de decodificacion de 0,6B parametros. El ajuste se realizo con LoRA de rango `r=16` y `alpha=32`, aplicado a todas las proyecciones de atencion y del bloque MLP (q, k, v, o, gate, up, down), con pesos en bf16 (no QLoRA). El entrenamiento duro 4 epocas, equivalentes a 6.720 pasos, con batch efectivo de 16 (4 por dispositivo × 4 pasos de acumulacion), tasa de aprendizaje 1e-4 con planificador coseno y 10% de warmup, precision bf16 con checkpointing de gradientes y longitud de truncado de 896 tokens. La plantilla de dialogo empleada es `qwen3_nothink`, es decir, con el modo de razonamiento explicito desactivado.

El corpus procede integramente de los recursos de texto del juego *Cultist Simulator* (con el texto chino tomado de la localizacion oficial en chino simplificado). A partir de una misma fuente se generan varias tareas supervisadas: traduccion bidireccional con y sin conservacion de etiquetas `<b>`/`<i>`, redaccion de descripciones de cartas a partir de nombre, categoria y tema, narracion de apertura y resolucion de acciones, redaccion de desenlaces, creacion libre sobre los nueve principios del juego (luz, forja, filo, invierno, corazon, copa, polilla, puerta, historia secreta) y continuacion de texto respetando el estilo original. No se documenta ninguna innovacion arquitectonica mas alla del ajuste LoRA; la contribucion es fundamentalmente de curacion de datos y de estilo.

## Capacidades

- Generacion de texto creativo en registro literario oscuro, contenido y arcaizante, propio del juego de referencia.
- Redaccion de descripciones de cartas a partir de nombre, categoria y tema indicados en el prompt.
- Narrativa de acciones de juego: textos de apertura y de resolucion de eventos.
- Redaccion de desenlaces y textos de cierre.
- Creacion tematica guiada por los nueve principios del juego (luz, forja, filo, invierno, corazon, copa, polilla, puerta, historia secreta).
- Continuacion de texto respetando el estilo de un fragmento de entrada.
- Traduccion bidireccional chino simplificado-ingles, con conservacion de marcas `<b>`/`<i>` en determinados casos (con perdida de marcas documentada en la variante de 0,6B).
- Conversacion de un solo turno o multi-turno sencilla mediante plantilla de chat `qwen3_nothink`.
- Capacidad de carga directa como modelo fusionado (`from_pretrained`) o como adaptador LoRA sobre la base.
- No se documenta soporte de tool calling, function calling, uso de agentes, razonamiento multi-paso, vision ni audio.

## Casos de uso

- Escritura de material para partidas de rol o juegos de mesa con ambientacion esoterica: el modelo genera fragmentos de sabor con el registro exacto del juego original, reutilizables como cartas, eventos o textos de escena, ya que su entrenamiento se centra en ese tipo de campo narrativo.
- Creacion de fan fiction y mods no comerciales: permite producir texto coherente con la estetica de *Cultist Simulator* a partir de una indicacion breve, gracias a su conocimiento del vocabulario y las estructuras de frase del corpus.
- Generacion de contenido para prototipos de videojuego: un equipo puede poblar un prototipo con cientos de descripciones de objetos o eventos sin redactarlas a mano, usando el modelo de 0,6B por su coste de inferencia minimo.
- Traduccion asistida chino-ingles de textos narrativos breves: adecuado para frases sueltas o parrafos cortos en un flujo de pre-edicion, siempre que no se exija conservacion estricta del marcado HTML.
- Ampliacion estilistica de un texto existente: dada una apertura, el modelo continua con el mismo tono, util para desbloquear borradores o generar variantes de un mismo pasaje.
- Generacion de bancos de texto para investigacion sobre estilo: sirve como modelo de referencia de bajo coste para estudiar tecnicas de ajuste fino por LoRA sobre dominios literarios muy acotados.
- Despliegue local en equipos modestos: su tamano permite ejecutarlo en portatiles con GPU integrada o CPU mediante Ollama, lo que habilita talleres de escritura o demos sin infraestructura en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El unico dato cuantitativo de evaluacion proporcionado es la perdida de validacion, comparada con la variante de 4B del mismo autor:

| Modelo | eval_loss |
|---|---|
| cultist-simulator-qwen3-0.6b | 2.406 |
| cultist-simulator-qwen3-4b | 1.949 |

El autor documenta ademas una comparacion cualitativa en tareas de formato: ante una peticion de traduccion chino-ingles que exige conservar las etiquetas `<b>`, la variante de 4B mantiene el marcado y la de 0,6B lo elimina por completo, lo que indica una menor adherencia a restricciones estructurales en el modelo pequeno.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 1,2-2 GB de pesos mas la memoria de activaciones y cache KV; en la practica, entre 2 y 3 GB para secuencias cortas, y algo mas al alargar la generacion.
- El propio autor entreno el modelo (con gradientes y estado del optimizador) en una unica GPU de 16 GB de VRAM, lo que da una cota superior muy holgada para el entrenamiento con LoRA.
- Cabe sin problema en GPU de consumo: RTX 3060, RTX 4060, RTX 4070, RTX 4090, e incluso en GPU integradas o en CPU con cuantizacion de 4 bits.
- Despliegue soportado: `transformers` con `AutoModelForCausalLM`, `peft` para el adaptador LoRA, Ollama mediante el `Modelfile` incluido en el repositorio, y text-generation-inference segun los tags del repositorio. vLLM y llama.cpp no se mencionan explicitamente, aunque llama.cpp es viable tras convertir a GGUF.
- No se publican cifras de latencia ni de throughput en la informacion disponible.
- El repositorio ocupa 1,2 GB en total, con 1,13 GB para el modelo fusionado y 38,5 MB para el adaptador LoRA, de modo que el almacenamiento tambien es minimo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | eval_loss reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cultist-simulator-qwen3-0.6b | 596 M | No disponible (truncado de entrenamiento a 896) | 2.406 | Apache-2.0 con restriccion de uso no comercial solicitada por el autor | HuggingFace, modelo fusionado + LoRA + Modelfile |
| cultist-simulator-qwen3-4b | No disponible en la informacion | No disponible | 1.949 | No disponible en la informacion | HuggingFace (mismo autor) |
| Qwen/Qwen3-0.6B (base) | 0,6B | 32.768 tokens segun el modelo base | No aplica (modelo generalista, sin ajuste de dominio) | Apache-2.0 | HuggingFace |

La comparacion mas directa es con la variante de 4B del mismo autor, que obtiene mejor perdida de validacion (1.949 frente a 2.406) y conserva correctamente el marcado HTML en las tareas de traduccion, a cambio de un mayor coste de inferencia. Frente al Qwen3-0.6B original, este ajuste sacrifica capacidades generales para especializarse en un unico registro literario y en dos idiomas.

## Limitaciones y advertencias

- El modelo desconoce por completo la mecanica del juego: no sabe efectos de cartas, condiciones de recetas ni valores numericos, y solo ha aprendido estilo y estructura textual.
- Riesgo elevado de reproduccion literal o de parafrasis muy cercana de textos originales del juego, ya que el corpus de entrenamiento procede integramente del mismo. Debe verificarse la autorizacion antes de publicar cualquier salida.
- El autor solicita restringir el uso a aprendizaje personal y creacion de fan art no comercial, pese a que la licencia tecnica sea Apache-2.0. Los derechos del corpus pertenecen a Weather Factory.
- Perdida de fidelidad de formato en tareas estrictas: la conservacion de etiquetas `<b>`/`<i>` en la traduccion chino-ingles falla en la variante de 0,6B, segun la propia comparacion del autor.
- Cobertura linguistica limitada al chino simplificado y al ingles; no se ha entrenado en ningun otro idioma.
- Longitud de salida condicionada por el truncado de entrenamiento a 896 tokens; los textos continuos claramente mas largos quedan fuera de su rango comodo.
- Es un modelo pequeno (0,6B): la coherencia en razonamientos largos o en instrucciones complejas sera inferior a la de modelos mayores de la misma familia.
- No se documentan medidas de alineacion, filtrado de seguridad ni evaluaciones de sesgo, por lo que no es recomendable para produccion orientada al usuario sin capas adicionales de moderacion.
- Al estar entrenado con plantilla `qwen3_nothink`, no se espera un modo de razonamiento explicito funcional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Cecilis/cultist-simulator-qwen3-0.6b
- Variante de 4B del mismo autor: https://huggingface.co/Cecilis/cultist-simulator-qwen3-4b
- Modelo base Qwen/Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Repositorio de codigo, extraccion de datos y scripts de entrenamiento: https://github.com/alice-kroi/cultist-llm
- Framework de entrenamiento LLaMA-Factory: https://github.com/hiyouga/LLaMA-Factory
