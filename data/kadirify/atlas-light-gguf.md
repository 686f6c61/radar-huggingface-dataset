# kadirify/atlas-light-GGUF

## Resumen

Atlas Light es un ajuste fino (fine-tune) del modelo Qwen/Qwen3.5-4B, desarrollado por el usuario kadirify, orientado a la correccion ortografica y al uso general del turco. No se trata de un modelo entrenado desde cero, sino de un LoRA (r=16, alpha=32) fusionado en los pesos del modelo base. Se distribuye en formato GGUF cuantizado Q4_K_M (2,8 GB) y esta pensado para ejecutarse de forma totalmente local como motor del asistente de escritorio de codigo abierto Atlas.

El modelo resuelve un problema concreto: la correccion ortografica y gramatical en turco, un idioma con morfologia aglutinante y reglas de armonia vocal que los modelos multilingues genericos suelen manejar con dificultad. Segun la model card, el ajuste eleva la precision en pruebas de ortografia del 35,3 % al 82,7 % respecto al modelo base, y del 25,1 % al 80,7 % en una prueba de ortografia dificil.

Con 4.326.350.848 parametros y una licencia Apache 2.0, el modelo es relevante para desarrolladores que necesitan un corrector turco ligero, desplegable en hardware de consumo y sin dependencia de servicios en la nube. Su contexto y arquitectura heredan las caracteristicas del modelo base Qwen3.5-4B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen/Qwen3.5-4B) |
| Parametros totales | 4.326.350.848 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (unico archivo publicado: `atlas-light-Q4_K_M.gguf`) |
| Idiomas soportados | turco (tr), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer de 4.326 millones de parametros. Sobre esa base se aplico un ajuste fino mediante LoRA con rango 16 y alpha 32, durante 560 pasos y una epoca, sobre un conjunto de 8.955 ejemplos. Posteriormente el adaptador LoRA se fusiono en los pesos del modelo base, de modo que la distribucion GGUF contiene un modelo denso unico, sin adaptadores separados.

Los datos de entrenamiento combinan dos fuentes: por un lado, frases en turco corrompidas de forma automatica mediante reglas, junto con sus versiones corregidas; por otro, ejemplos generales en turco e ingles generados con Gemma 4 E4B. El entrenamiento se realizo en una unica GPU RTX 5070 de 12 GB. Los scripts de entrenamiento estan disponibles en la carpeta `training/` del repositorio del proyecto Atlas. No se documenta el uso de RLHF ni DPO, ni el volumen total de tokens de entrenamiento.

## Capacidades

- Correccion ortografica en turco: principal capacidad objetivo del ajuste, con mejora documentada frente al modelo base.
- Generacion de texto general en turco e ingles, heredada del modelo base Qwen3.5-4B.
- Conversacion multiturno (etiqueta `conversational` en el repositorio).
- Uso como motor de un asistente de escritorio local (proyecto Atlas).
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Correccion ortografica en produccion editorial: el modelo puede integrarse en un pipeline previo a la publicacion de textos en turco para detectar y corregir errores de escritura, con una precision reportada del 82,7 % en la prueba estandar y del 80,7 % en la prueba dificil, muy por encima del modelo base.
- Asistente de escritorio local: es el proposito declarado del modelo; se ejecuta via Ollama con `ollama run kadirify/atlas-light` y sirve como motor conversacional sin conexion a internet, adecuado para entornos con requisitos de privacidad.
- Procesamiento por lotes de documentacion en turco: al caber en 2,8 GB en cuantizacion Q4_K_M, permite procesar grandes volumenes de texto en hardware modesto sin coste por token de API.
- Preprocesado en pipelines de NLP en turco: puede actuar como paso de normalizacion ortografica antes de tareas posteriores (traduccion, analisis de sentimiento, indexacion de busqueda) para reducir el ruido en la entrada.
- Herramientas de escritura para usuarios turcoparlantes: integracion en editores de texto o correctores como sugeridor de correcciones en tiempo real, dado su tamano reducido y su capacidad de ejecucion local.
- Prototipado y evaluacion de asistentes conversacionales: util para desarrolladores que quieran probar flujos de asistente en turco con un modelo ligero y de licencia permisiva antes de escalar a modelos mayores.

## Benchmarks y rendimiento

Resultados publicados en la model card del autor:

| Prueba | qwen3.5:4b (base) | Atlas Light |
|---|---:|---:|
| Prueba de ortografia (300 casos), % | 35,3 | 82,7 |
| Prueba de ortografia dificil (187 casos), % | 25,1 | 80,7 |
| Atlas-TR general (92 preguntas) | 90 | 92 |

El autor senala que en las categorias de conversacion natural y redaccion formal el modelo retrocedio algunos puntos (92 → 85 y 96 → 91, respectivamente). Asimismo advierte que la prueba Atlas-TR consta de solo 92 preguntas y que diferencias de 1-2 puntos no son significativas. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,8 GB para el archivo Q4_K_M, mas el overhead de la ventana de contexto y del runtime.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; el autor entreno el modelo en una RTX 5070 de 12 GB, pero la inferencia cuantizada es mucho mas ligera.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060, RTX 4060, RTX 4090 o equivalentes con 4 GB o mas de VRAM; tambien puede ejecutarse en CPU con llama.cpp.
- Opciones de despliegue: Ollama (soporte oficial via `ollama run kadirify/atlas-light`), llama.cpp y cualquier runtime compatible con GGUF. vLLM y TGI no estan confirmados para este formato en la informacion disponible.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Atlas Light | 4,33 B | no disponible | Correccion ortografica turca (fine-tune de Qwen3.5-4B) | Apache 2.0 | GGUF en Hugging Face |
| Qwen/Qwen3.5-4B (base) | 4,33 B | no disponible | Modelo general multilingue | no disponible en la informacion proporcionada | Hugging Face |
| Gemma 4 E4B | no disponible | no disponible | Modelo general usado para generar datos de entrenamiento | no disponible | no disponible |

La comparacion con alternativas especializadas en correccion ortografica del turco no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Las pruebas de ortografia se generaron corrompiendo textos mediante reglas; el modelo no se ha evaluado por separado con textos escritos por personas reales.
- La prueba Atlas-TR consta de solo 92 preguntas; diferencias de 1-2 puntos no son estadisticamente significativas.
- El autor advierte que las correcciones no son siempre perfectas y recomienda revisar manualmente los textos importantes.
- Regresion documentada en conversacion natural (92 → 85) y redaccion formal (96 → 91) respecto al modelo base.
- El ajuste esta orientado principalmente al turco; el soporte de ingles es secundario y no se detalla su calidad.
- Solo se publica una cuantizacion (Q4_K_M); no hay versiones de mayor o menor precision disponibles en el repositorio.
- No se documentan sesgos conocidos, riesgo de alucinacion ni limitaciones de contexto especificas en la informacion proporcionada.
- Licencia Apache 2.0, permisiva para uso comercial, heredada del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kadirify/atlas-light-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio del proyecto Atlas: https://github.com/kadirify/atlas
