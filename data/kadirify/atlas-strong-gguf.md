# kadirify/atlas-strong-GGUF

## Resumen

Atlas Strong es un ajuste fino (fine-tune) del modelo google/gemma-4-12b-it desarrollado por el usuario kadirify. Se trata de un LoRA (r=16, alpha=32) fusionado en los pesos del modelo base, orientado especificamente a la correccion ortografica del turco y al uso general de ese idioma. No es un modelo entrenado desde cero: hereda la arquitectura y el conocimiento del modelo Gemma 4 de 12 mil millones de parametros de Google. El repositorio publicado contiene unicamente la version cuantizada en GGUF (Q5_K_M, 8,5 GB), pensada para ejecutarse con Ollama.

El modelo nace como componente del asistente de escritorio Atlas, una aplicacion de codigo abierto que funciona integramente en local. Su proposito es mejorar la calidad del turco escrito (correccion de erratas y construccion de frases) sin sacrificar el rendimiento general en conversacion. El autor reporta una mejora sustancial en pruebas de ortografia respecto al modelo base, aunque el benchmark general practicamente no varia.

Por su tamano (11.907.350.576 parametros) y su enfoque bilingue turco-ingles, resulta relevante para desarrolladores que necesiten un modelo local de gama media con buen soporte del turco y licencia Apache 2.0, aunque su ecosistema de publicacion es muy limitado (un solo archivo GGUF, sin versiones en safetensors ni cuantizaciones alternativas).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de google/gemma-4-12b-it, no detallada en la model card) |
| Parametros totales | 11.907.350.576 |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q5_K_M (publicada); Q4_K_M mencionada en las mediciones del autor |
| Idiomas soportados | Turco (tr), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo es un fine-tune del base google/gemma-4-12b-it mediante LoRA con rango 16 y alpha 32, entrenado en QLoRA de 4 bits durante 262 + 30 pasos (medio epoch), con ejemplos de hasta 512 tokens. El entrenamiento se ejecuto en una unica GPU RTX 5070 de 12 GB. Los pesos LoRA se fusionaron en el modelo base, por lo que la inferencia no requiere adaptadores adicionales. Los scripts de entrenamiento estan disponibles en la carpeta `training/` del repositorio del proyecto Atlas.

Los datos de entrenamiento combinan dos fuentes: por un lado, frases en turco corrompidas de forma automatica mediante reglas, junto con sus versiones corregidas; por otro, ejemplos generales en turco e ingles generados con Gemma 4 E4B. Esta composicion explica el objetivo del ajuste: ensenar al modelo a detectar y reparar errores ortograficos tipicos sin degradar su capacidad conversacional general. No se menciona el uso de RLHF ni DPO, ni se detalla la arquitectura interna del modelo base (tipo de atencion, innovaciones como decodificacion especulativa, etc.).

## Capacidades

- Generacion de texto conversacional en turco e ingles.
- Correccion ortografica del turco: el autor reporta un 85,0 % de acierto en un test de 300 casos y un 86,6 % en un test dificil de 187 casos, frente al 65,7 % y 64,2 % del modelo base.
- Uso general del turco (redaccion, respuesta a preguntas), con un rendimiento en el benchmark Atlas-TR de 92 preguntas identico al del modelo base (98 puntos en ambos).
- Capacidad de seguir instrucciones y mantener conversaciones multi-turno (etiqueta `conversational`).
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de vision, audio o modo thinking: no disponible en la informacion proporcionada.

## Casos de uso

- Correccion ortografica de textos en turco: el modelo puede recibir un parrafo con erratas y devolver la version corregida, aprovechando el ajuste especifico sobre frases corrompidas por reglas. Es el caso de uso central para el que fue entrenado.
- Asistente de escritorio local: integrado en la aplicacion Atlas, el modelo gestiona conversaciones y tareas de redaccion sin conexion a internet, lo que resulta adecuado para entornos con requisitos de privacidad.
- Reescritura y mejora de redaccion en turco: util para revisar correos, informes o documentacion interna antes de su publicacion, con la advertencia de que el autor recomienda revision humana en textos importantes.
- Soporte bilingue turco-ingles en atencion al cliente: el modelo puede mantener conversaciones en ambos idiomas, aunque la longitud de contexto no esta documentada y conviene validar el comportamiento en dialogos largos.
- Prototipado rapido con Ollama: al publicarse como GGUF Q5_K_M, permite desplegar un asistente local con un solo comando (`ollama run kadirify/atlas-strong`) en equipos de gama media.
- Filtrado y normalizacion de texto turco en pipelines de datos: puede emplearse para limpiar corpus con errores ortograficos antes de alimentar otros sistemas, siempre con supervision y validacion de calidad.
- Educacion y aprendizaje de turco: como herramienta de apoyo para detectar errores frecuentes de escritura, con la limitacion de que las pruebas se hicieron sobre errores generados por reglas y no sobre texto real de estudiantes.

## Benchmarks y rendimiento

| Benchmark | gemma4:12b (base) | Atlas Strong |
|---|---:|---:|
| Test de ortografia (300 casos), % | 65,7 | 85,0 |
| Test de ortografia dificil (187 casos), % | 64,2 | 86,6 |
| Atlas-TR general (92 preguntas) | 98 | 98 |

Notas del autor: el test de ortografia dificil se midio sobre la version Q4_K_M; la velocidad es ligeramente inferior a la del modelo base debido al mayor tamano del archivo. El benchmark Atlas-TR es una prueba pequena de 92 preguntas, por lo que diferencias de 1-2 puntos no son significativas. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 9-10 GB para la cuantizacion Q5_K_M publicada (archivo de 8,5 GB mas overhead de contexto y cache KV); algo menos para Q4_K_M.
- GPU recomendadas: el autor entreno el modelo en una RTX 5070 de 12 GB; una RTX 4090 (24 GB) o una A100/H100 permiten holgura para contextos largos y mayor throughput.
- Cabe en GPU de consumo: si, en tarjetas con 12 GB o mas de VRAM (RTX 4070 Ti, RTX 5070, RTX 4080, RTX 4090). En GPUs de 8 GB requeriria cuantizaciones mas agresivas no publicadas en el repositorio.
- Opciones de despliegue: Ollama (soporte oficial mediante `ollama run kadirify/atlas-strong`); llama.cpp para GGUF; vLLM y TGI no estan confirmados para este formato en la informacion disponible.
- Latencia y throughput: no disponible. El autor indica unicamente que la velocidad es "ligeramente inferior" a la del modelo base por el mayor tamano del archivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Atlas Strong | 11,9 B | no disponible | Fine-tune turco (ortografia) | Apache 2.0 | Solo GGUF Q5_K_M en HF |
| google/gemma-4-12b-it (base) | 12 B aprox. | no disponible | Modelo general instruct | Gemma (segun modelo base) | Pesos originales en HF |
| Gemma 4 E4B | no disponible | no disponible | Modelo general, usado para generar datos | no disponible | no disponible |

La comparacion mas directa es con el propio modelo base: Atlas Strong mejora entre 19 y 22 puntos porcentuales en correccion ortografica del turco y mantiene el rendimiento general en el benchmark Atlas-TR, a costa de un archivo mas grande y algo mas lento. No se dispone de datos para comparar con otros modelos especializados en turco (por ejemplo, variantes de Qwen o Llama ajustadas para ese idioma), por lo que esa comparativa se considera no disponible.

## Limitaciones y advertencias

- Los tests de ortografia se generaron con reglas automaticas; el modelo no se ha evaluado con texto escrito por personas reales, por lo que el rendimiento en produccion puede diferir del reportado.
- El benchmark general Atlas-TR consta solo de 92 preguntas; es una muestra pequena y no permite extraer conclusiones robustas.
- El autor reconoce que las correcciones no son siempre perfectas y recomienda revision humana en textos importantes.
- No se documenta la longitud de contexto del modelo ni su comportamiento en conversaciones largas.
- El soporte linguistico se limita a turco e ingles; el rendimiento en castellano u otros idiomas no esta evaluado.
- Solo se publica una cuantizacion (Q5_K_M); no hay versiones en safetensors, FP16 ni cuantizaciones menores en el repositorio, lo que limita el despliegue en hardware con poca VRAM.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente de la comunidad.
- La licencia es Apache 2.0, pero al derivar de un modelo Gemma conviene verificar las condiciones de uso del modelo base de Google antes de un despliegue comercial.
- Riesgo de alucinacion y sesgos: no evaluado en la informacion disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kadirify/atlas-strong-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-12b-it
- Repositorio del proyecto Atlas: https://github.com/kadirify/atlas
