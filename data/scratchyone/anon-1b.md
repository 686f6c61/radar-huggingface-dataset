# scratchyone/anon-1b

## Resumen

anon-1b es un ajuste fino completo (full fine-tune) del modelo base google/gemma-3-1b-pt, desarrollado por el usuario scratchyone. El modelo se ha entrenado sobre 157.342 historias de tipo greentext extraidas mediante OCR de capturas de pantalla publicadas en los subreddits r/greentext, r/4chan, r/4tran y r/classic4chan. Su proposito es explorar la viabilidad de modelos base especializados en un dominio de contenido muy concreto (el greentext de imageboard) y comprobar si un modelo pequeno puede generar texto genuinamente humoristico.

Con aproximadamente 999,9 millones de parametros (~1B), hereda la arquitectura Gemma 3 en su variante de 1B y se distribuye bajo licencia Gemma. La particularidad del modelo es que la generacion puede condicionarse mediante una cabecera con el subreddit de origen y un intervalo de puntuacion (score), de modo que el usuario puede controlar el tono y el estilo del texto generado. Es un modelo base, no un modelo de instrucciones, por lo que no incorpora alineacion conversacional.

Su relevancia actual radica en dos aspectos: por un lado, sirve como caso de estudio de la tecnica de "looming" (curacion manual de ramas de generacion) para modelos de contenido especifico; por otro, demuestra que un modelo de 1B puede adquirir un estilo muy marcado sin sufrir colapso de modo, ya que conserva capacidades de lenguaje general gracias a un 8% de datos de replay.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3, variante gemma3_text); heredada de google/gemma-3-1b-pt |
| Parametros totales | 999.887.104 (~1B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base) |
| Tipos de cuantizacion | GGUF (se menciona una version bf16: anon-1b-bf16.gguf) y safetensors en precision completa/bf16 |
| Idiomas soportados | Ingles (en) |
| Licencia | Gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors y GGUF |
| Modelo base | google/gemma-3-1b-pt |
| Dataset de entrenamiento | scratchyone/anon-greentext (157.342 documentos) |
| Tamano del repositorio | 4,7 GB |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Gemma 3 en su variante de 1B parametros, un transformer decoder-only etiquetado como gemma3_text. El ajuste es un full fine-tune (no LoRA ni adaptadores) sobre el checkpoint preentrenado google/gemma-3-1b-pt, lo que implica que todos los pesos del modelo fueron actualizados durante el entrenamiento. No se especifica en la informacion disponible el numero total de tokens vistos ni si se aplicaron fases de RLHF o DPO; dado que se trata de un modelo base, no parece haberse aplicado alineacion por preferencias.

El entrenamiento se realizo sobre 157.342 historias de greentext obtenidas por OCR de capturas de pantalla. Cada documento sigue un formato fijo: una cabecera, una linea en blanco y el cuerpo de la historia. La cabecera contiene dos campos opcionales: el subreddit de origen (r/greentext, r/4chan, r/4tran, r/classic4chan o [N/A]) y un intervalo de puntuacion en escala logaritmica (<10, 10-100, 100-500, 500-1k, 1k-2.5k, 2.5k-5k, 5k-10k, 10k-25k, 25k+ o [N/A]). La escala logaritmica se eligio porque las puntuaciones proceden de una unica captura de ~36 horas y serian ruidosas como enteros; ademas, los enteros se tokenizarian como cadenas de digitos sin orden utilizable por el modelo.

Entre las decisiones tecnicas destacables estan el header dropout (cada campo se fija a su valor real con probabilidad 0,5 y a [N/A] en caso contrario, con semilla por documento, de modo que se vieron todas las combinaciones), el enmascaramiento de la cabecera en la funcion de perdida (solo se entrena el cuerpo mas un token EOS final, para que el modelo aprenda donde termina una historia) y una mezcla de replay de texto general del 8% para evitar el colapso de modo. El modelo tambien puede abrir con cualquier linea, desde `>be me` hasta una linea propia del usuario o un simple `>`.

## Capacidades

- Generacion de texto en ingles con estilo greentext de imageboard, incluyendo el formato de lineas iniciadas por `>`.
- Generacion condicionada por metadatos: el estilo y el contenido pueden controlarse mediante la cabecera `sub` (subreddit) y `score` (intervalo de puntuacion).
- Generacion condicionada por apertura personalizada: admite arranques propios como `>work at a pet store` o un `>` desnudo, en cuyo caso suele escribir `be me` por si mismo.
- Reproduccion de cabeceras de post de imageboard (por ejemplo, `Anonymous 04/12/23(Thu)15:07:47 No.…`) cuando se le da una cabecera sin cuerpo.
- Conversacion general limitada: al recibir una instruccion ordinaria sin cabecera, conserva la capacidad de escribir prosa normal y otros temas (por ejemplo, una receta), gracias al replay de texto general.
- Razonamiento y matematicas: no disponibles; no se documentan capacidades especificas en la informacion proporcionada.
- Tool calling / function calling: no disponible.
- Capacidades de agente y razonamiento multi-paso: no disponibles.
- Vision: no disponible (aunque el tag gemma3 hace referencia a la familia, este modelo se etiqueta como gemma3_text).
- Capacidades multilingues: limitadas al ingles (unico idioma declarado).
- Modo thinking: no disponible.

## Casos de uso

- Generacion de datos sinteticos para aumentacion de corpus: el modelo puede producir greentexts nuevos que sigan el formato y el estilo del dataset original, utiles para ampliar datasets de humor o de texto informal anonimizado.
- Investigacion sobre modelos base de contenido especifico: sirve como referencia reproducible para estudiar la tecnica de looming y evaluar hasta que punto un modelo pequeno puede especializarse en un dominio concreto sin perder capacidades generales.
- Estudio de contenido no filtrado: al haberse entrenado con datos sin filtrado de contenido, es un caso practico para analizar sesgos, toxicidad y temas sensibles en corpus de imageboard, asi como para probar tecnicas de moderacion.
- Prototipado de generacion creativa y humor: con temperatura 0,8, top_p 0,95 y penalizacion de repeticion 1,1, permite generar borradores de contenido humoristico con un estilo muy definido para experimentacion.
- Condicionamiento por subreddit y popularidad: la cabecera permite simular el tono de comunidades distintas (r/greentext frente a r/4tran) o forzar una franja de puntuacion, util para analisis de estilos por comunidad.
- Demostracion de generacion en local: al ser un modelo de ~1B en formato GGUF, puede ejecutarse con llama.cpp o llama-server en una maquina modesta, lo que lo hace adecuado para demos de inferencia local y sin conexion.
- Replay de capacidades generales: sirve para ejemplos practicos de como una mezcla pequena de datos generales (8%) preserva la generacion de prosa ordinaria tras un ajuste de dominio muy estrecho.

## Benchmarks y rendimiento

Los unicos datos de evaluacion publicados en la informacion disponible son la variacion en HellaSwag y la perplejidad sobre texto web. No se proporcionan resultados de MMLU, GSM8K ni HumanEval.

| Metrica | Valor |
|---|---|
| HellaSwag (antes del ajuste) | 62,2 |
| HellaSwag (despues del ajuste) | 64,4 |
| Perplejidad en texto web | +3,9% respecto al modelo base |

No se han publicado mas resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 2 GB solo para pesos, con un uso real de unos 3-4 GB contando cache KV y overhead.
- VRAM estimada en cuantizacion GGUF de 8 bits: aproximadamente 1-1,5 GB.
- VRAM estimada en cuantizacion GGUF de 4 bits: aproximadamente 0,6-1 GB.
- Cabe holgadamente en GPU de consumo: RTX 3060 (12 GB), RTX 4060, RTX 4090, y en general en cualquier GPU con 4 GB o mas de VRAM.
- Puede ejecutarse solo en CPU mediante llama.cpp dado su tamano reducido.
- GPU profesionales (A100, H100) no son necesarias para la inferencia; solo tendrian sentido para reentrenamiento o ajustes posteriores.
- Opciones de despliegue: transformers (los ejemplos de la model card usan AutoModelForCausalLM con torch_dtype bfloat16), llama.cpp / llama-server (comando de ejemplo con anon-1b-bf16.gguf), y text-generation-inference (el modelo esta etiquetado como endpoints_compatible).
- Parametros de muestreo recomendados: temperatura 0,8, top_p 0,95 y penalizacion de repeticion 1,1 con 200-400 tokens nuevos. Sin penalizacion de repeticion puede caer en bucles de una sola linea.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| anon-1b | ~1B | No disponible | Gemma | HuggingFace (safetensors, GGUF) | Ajuste de dominio sobre greentext |
| google/gemma-3-1b-pt | ~1B | No disponible en esta informacion | Gemma | HuggingFace | Modelo base del que deriva anon-1b; sin especializacion |
| Llama 3.2 1B | ~1B | No disponible en esta informacion | Llama | HuggingFace | Alternativa de tamano similar, no disponible en la informacion para comparar rendimiento |
| Qwen2.5 1.5B | ~1,5B | No disponible en esta informacion | Apache/Qwen | HuggingFace | Alternativa de tamano similar, no disponible en la informacion para comparar rendimiento |

No se dispone de datos de benchmarks comparativos con estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo base, no ajustado por instrucciones: no sigue ordenes conversacionales ni formatos de chat; el prompting debe respetar la cabecera y el formato de greentext para obtener resultados optimos.
- Riesgo de bucles: sin penalizacion de repeticion (recomendada 1,1) puede caer en repeticiones de una sola linea, como `>she's really cool` repetido decenas de veces.
- Contenido no filtrado: los datos de entrenamiento no pasaron por filtrado de contenido, por lo que puede generar material ofensivo, sensible o inapropiado.
- Sesgos: al proceder de subreddits concretos de imageboard, el modelo reproduce los sesgos, el tono y las tematicas de esas comunidades, incluidas las de r/4tran y r/classic4chan.
- Alucinacion: como cualquier modelo generativo, puede inventar detalles o incoherencias narrativas; no se han publicado evaluaciones especificas de factualidad.
- Idioma: solo se declara soporte de ingles; el rendimiento en castellano no esta documentado y previsiblemente sera pobre.
- Longitud de contexto: no documentada en la informacion disponible.
- Fecha de publicacion: la informacion indica fecha de creacion 2026-10-15, posterior a la fecha de consulta habitual; conviene verificar la vigencia del repositorio.
- Licencia Gemma: el uso comercial y la redistribucion estan sujetos a los Gemma Terms of Use de Google, no a una licencia permisiva estandar; debe revisarse antes de cualquier despliegue en produccion.
- Descargas registradas: 0 descargas y 5 likes en el momento de la ficha, lo que implica poca validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/scratchyone/anon-1b
- Dataset de entrenamiento: https://huggingface.co/datasets/scratchyone/anon-greentext
- Modelo base: https://huggingface.co/google/gemma-3-1b-pt
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion proporcionada.
