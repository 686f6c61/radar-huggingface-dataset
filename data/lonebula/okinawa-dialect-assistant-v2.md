# LoNebula/okinawa-dialect-assistant-v2

## Resumen

Okinawa Dialect Assistant v2 es un ajuste fino experimental publicado por el usuario LoNebula sobre el modelo base Qwen/Qwen2.5-0.5B-Instruct, orientado a la consulta de un diccionario japones-shuri (variedad linguistica de Okinawa). El modelo recibe una palabra o una frase breve en japones y propone la forma correspondiente en shuri segun el diccionario de entrenamiento, sin pretender ser un traductor validado ni un modelo conversacional fluido.

Se trata de un adaptador LoRA sobre una arquitectura transformer decoder-only de tipo Qwen2 con 494.032.768 parametros totales (aproximadamente 0,5 mil millones), lo que lo situa en la categoria de modelos muy pequenos, ejecutables en CPU o en cualquier GPU de consumo. La model card lo describe explicitamente como un modelo de consulta de diccionario y no como un modelo integral de la lengua okinawense.

Su relevancia es limitada y de nicho: cubre una lengua amenazada (el shuri, dentro del conjunto ryukyuense, etiquetado como `ry`) con muy pocos recursos digitales, y sirve como ejemplo de adaptacion de un modelo pequeno a una tarea de recuperacion lexica muy acotada. El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que se trata de un experimento sin adopcion publica conocida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), ajuste fino mediante LoRA |
| Parametros totales | 494.032.768 (segun safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base Qwen2.5-0.5B-Instruct soporta 32.768 tokens, pero no se especifica la ventana efectiva tras el ajuste |
| Tipos de cuantizacion | No disponible; el repositorio publica pesos en safetensors. No se han publicado versiones GGUF en la informacion disponible |
| Idiomas soportados | Japones (`ja`) y shuri/okinawense (`ry`) |
| Licencia | Apache-2.0 (pesos ajustados), sujeta a los terminos del modelo base; el dataset derivado se distribuye bajo CC BY 4.0 |
| Formato de pesos | Safetensors (adaptador LoRA sobre el modelo base) |
| Modelo base | Qwen/Qwen2.5-0.5B-Instruct |
| Tamano del repositorio | 2,0 GB |
| Dataset de entrenamiento | LoNebula/okinawa-ja-shuri-dictionary-v2 |
| Fecha de publicacion | 2026-10-11 |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B-Instruct, un transformer decoder-only con atencion causal y componente de instrucciones, y se ajusta mediante LoRA (Low-Rank Adaptation), segun la etiqueta `lora` y el campo `base_model:adapter` del repositorio. El pipeline declarado en las etiquetas es `text2text-generation`, aunque el pipeline de HuggingFace figura como `text-generation`, coherente con la naturaleza decoder-only del modelo base.

Los datos de entrenamiento consisten en 18.062 filas con prompt derivadas de 9.031 entradas de diccionario de origen. Cada entrada fuente se representa con dos formularios de prompt fijos en japones. La propia model card aclara que las filas adicionales aumentan la cobertura de prompts, pero no anaden vocabulario, atestaciones independientes ni nuevas afirmaciones linguisticas. Ademas, las dos variantes de prompt de una misma entrada permanecen en el mismo split de entrenamiento o de prueba, lo que evita fuga entre splits. No se especifica el numero de tokens de entrenamiento, la composicion completa del dataset ni si se aplicaron tecnicas de RLHF o DPO. La fuente del diccionario esta atribuida y distribuida bajo CC BY 4.0. No se documenta ninguna innovacion tecnica adicional (atencion lineal, decodificacion especulativa u otras).

## Capacidades

- Recuperacion lexica japones-shuri: dada una palabra o frase breve en japones, propone una forma correspondiente en shuri segun el diccionario de entrenamiento.
- Generacion de texto breve en formato de respuesta a un prompt de diccionario (hasta 64 tokens nuevos en el ejemplo de uso de la model card).
- Uso mediante plantilla de chat: el ejemplo oficial emplea `apply_chat_template` con un mensaje de sistema que instruye a no inventar palabras sin base en el diccionario.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo esta disenado para consultas puntuales.
- Capacidades multilingues: limitadas a japones (`ja`) y shuri (`ry`); no se documenta soporte de otros idiomas.
- Vision, audio o modo de razonamiento explicito (thinking mode): no disponibles.
- Conversacion multiturno fluida: no disponible; la model card indica explicitamente que no es un modelo conversacional.

## Casos de uso

- Consulta lexica de apoyo para estudiantes de shuri: el usuario introduce una palabra japonesa y obtiene una propuesta de equivalente en shuri, siempre como punto de partida que debe verificarse con hablantes y fuentes.
- Preprocesado de corpus para proyectos de documentacion linguistica: uso del modelo para generar candidatos de traduccion que despues se revisan manualmente, reduciendo el trabajo de busqueda en el diccionario de origen.
- Herramienta auxiliar en aplicaciones educativas de lenguas ryukyuenses: integracion como funcion de consulta dentro de una interfaz mayor, con aviso claro de que la salida no es una traduccion validada.
- Etiquetado asistido de datos: generacion de propuestas de correspondencia japones-shuri que un anotador humano acepta o descarta, dado que el modelo esta entrenado sobre entradas de diccionario.
- Prototipado de bajo coste en investigacion: al ser un modelo de 0,5B ejecutable en CPU, permite experimentar con adaptaciones dialectales sin infraestructura GPU dedicada.
- Demostracion de tecnicas de ajuste LoRA sobre lenguas de bajos recursos: el repositorio sirve como referencia reproducible de adaptacion de un modelo pequeno a un dominio lexico muy acotado.
- Generacion de prompts de prueba para evaluacion linguistica: las dos variantes de prompt por entrada pueden reutilizarse como plantillas para construir baterias de evaluacion controladas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de exactitud, MMLU, HumanEval, GSM8K ni ninguna otra evaluacion cuantitativa del ajuste.

## Requisitos de hardware

Las siguientes cifras son estimaciones derivadas del numero de parametros (494 millones) y no proceden de mediciones publicadas por el autor.

- VRAM estimada para inferencia en FP16: aproximadamente 1 GB solo para pesos, mas overhead de activaciones y cache KV.
- VRAM estimada en INT8: aproximadamente 0,5 GB.
- VRAM estimada en INT4: aproximadamente 0,25-0,3 GB.
- El repositorio ocupa 2,0 GB, cifra superior a los pesos en FP16, probablemente por incluir tambien los ficheros del adaptador LoRA.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente; NVIDIA RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sin problema, aunque estan muy sobredimensionadas para este tamano.
- Cabe holgadamente en GPU de consumo e incluso en CPU: el modelo puede ejecutarse en un portatil moderno sin GPU dedicada.
- Opciones de despliegue: `transformers` (metodo documentado en la model card), y tecnicamente vLLM, TGI, llama.cpp u Ollama. Para llama.cpp u Ollama seria necesario convertir los pesos a GGUF, ya que no se ha publicado ninguna version GGUF.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LoNebula/okinawa-dialect-assistant-v2 | 494 M | No especificado | ja, ry | Apache-2.0 | HuggingFace, 0 descargas |
| LoNebula/okinawa-dialect-assistant (v1) | No disponible (descrito como version menor que v2) | No disponible | ja, ry | No disponible en la informacion proporcionada | HuggingFace |
| Qwen/Qwen2.5-0.5B-Instruct (modelo base) | 494 M | 32.768 tokens | Multilingue (incluye ja) | Apache-2.0 | HuggingFace, ampliamente distribuido |

No se dispone de informacion sobre otros modelos comparables especificos de shuri u okinawense en la informacion proporcionada.

## Limitaciones y advertencias

- No es un traductor validado: la propia model card indica que las respuestas generadas pueden ser incorrectas o incompletas y deben verificarse con hablantes fluidos y con el diccionario citado.
- No es un modelo conversacional: esta entrenado sobre ejemplos en formato de diccionario, no sobre dialogos.
- Cobertura geografica y linguistica parcial: la fuente se centra en el shuri y no representa todas las variedades del okinawense ni del conjunto ryukyuense.
- Riesgo de alucinacion: al ser un modelo generativo pequeno, puede producir formas lexicas no atestiguadas. El mensaje de sistema del ejemplo oficial intenta mitigarlo, pero no lo elimina.
- Ambito de vocabulario limitado: el dataset de entrenamiento deriva de 9.031 entradas de diccionario y 18.062 filas; las filas adicionales no amplian el vocabulario, solo la cobertura de prompts.
- Sesgos conocidos: no se documentan analisis de sesgo en la informacion disponible.
- Limitaciones de contexto e idioma: la ventana de contexto efectiva tras el ajuste no esta especificada, y el modelo solo esta declarado para japones y shuri.
- Restricciones de licencia: los pesos ajustados se publican bajo Apache-2.0, sujetos a los terminos del modelo base Qwen2.5-0.5B-Instruct. El dataset derivado se distribuye por separado bajo CC BY 4.0 con atribucion, por lo que su reutilizacion exige respetar esa licencia y consultar la tarjeta del dataset.
- Idoneidad para produccion: muy baja. Es un experimento sin adopcion publica (0 descargas, 0 likes) y sin evaluacion cuantitativa publicada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LoNebula/okinawa-dialect-assistant-v2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/LoNebula/okinawa-ja-shuri-dictionary-v2
- Version anterior del modelo: https://huggingface.co/LoNebula/okinawa-dialect-assistant
