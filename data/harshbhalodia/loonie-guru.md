# harshbhalodia/loonie-guru

## Resumen

Loonie Guru v1 es un ajuste fino (fine-tune) del modelo multimodal Qwen/Qwen3-VL-4B-Instruct, desarrollado por el usuario de HuggingFace harshbhalodia. Se trata del modelo que da soporte al asistente "Guru" dentro de la aplicación de finanzas personales Loonie, y esta disenado para ejecutarse de forma local en el ordenador del usuario mediante llama.cpp, de modo que los datos financieros no abandonan el dispositivo.

El modelo hereda la arquitectura del transformer multimodal de Qwen3-VL con aproximadamente 4.437 millones de parametros (4,4B) y una ventana de contexto que no se detalla en la informacion proporcionada. Su especializacion se centra en cuatro tareas concretas del dominio financiero personal: enrutamiento mediante tool calling (generar el JSON de accion, herramienta y argumentos), respuestas rapidas y consejos a partir de hechos y calculos aportados por la app, investigacion sobre listas de seguimiento y objetivos de ahorro, y extraccion de transacciones a partir de extractos bancarios (incluidas paginas escaneadas mediante el proyector de vision).

Es relevante porque ejemplifica el patron de modelos pequenos y especializados que se despliegan en el borde (edge) para tareas de agente con salida estructurada y verificacion automatica, en lugar de depender de un LLM generalista en la nube. El entrenamiento se hizo exclusivamente con datos sinteticos y se valido contra un conjunto de evaluacion congelado con criterios estrictos de no regresion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (hereda la de Qwen3-VL; vision-language con proyector) |
| Parametros totales | 4.437.815.808 (4,4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Pesos fusionados en 16 bits; versiones cuantizadas disponibles en el repo GGUF del autor (tipos concretos no disponibles) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo principal); GGUF (repo separado) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-VL-4B-Instruct, un transformer multimodal de la familia Qwen3-VL que combina un codificador visual con un modelo de lenguaje y un proyector para tareas de vision-lenguaje. El ajuste fino se realizo con LoRA de rango 32 y alpha 32, una epoca, tasa de aprendizaje 0,0001 y la libreria Unsloth, partiendo de la version unsloth/Qwen3-VL-4B-Instruct. Los pesos finales se publican fusionados en 16 bits.

Los datos de entrenamiento son exclusivamente sinteticos: 11.046 filas de entrenamiento y 964 de validacion. Las tareas se generan en el formato de prompt exacto de la aplicacion, y las respuestas provienen de un modelo profesor de mayor tamano o son correctas por construccion; todas pasaron las mismas comprobaciones automaticas que aplica la app. No se utilizaron datos personales de usuarios de Loonie. No se detalla el numero de tokens de entrenamiento ni la composicion completa del dataset, y no se menciona el uso de RLHF o DPO.

## Capacidades

- Tool calling: convierte un mensaje del usuario en el JSON de enrutamiento de la app (accion, herramienta y argumentos), rechaza peticiones inseguras y solicita aclaracion cuando el mensaje es ambiguo.
- Respuestas rapidas y consejo financiero: genera respuestas breves y fundamentadas a partir de hechos y calculos que le entrega la app; el modelo explica, no calcula.
- Investigacion: revisa una lista de seguimiento y temas de investigacion frente a objetivos y ahorros del usuario.
- Extraccion de extractos: convierte paginas de extractos bancarios y de tarjetas de credito en transacciones estructuradas, incluidas paginas escaneadas mediante el proyector de vision.
- Capacidades generales heredadas de Qwen3-VL-4B-Instruct: generacion de texto, razonamiento, codigo, matematicas y vision, aunque el ajuste esta orientado a los prompts y comprobaciones de Loonie.
- Multilingue: limitado al ingles segun la model card.

## Casos de uso

- Enrutamiento de intenciones en asistentes financieros: el modelo recibe el mensaje del usuario y devuelve el JSON con la accion y los argumentos que debe ejecutar la app, lo que permite un pipeline de agente con validacion estricta del esquema.
- Respuestas explicativas sobre finanzas personales: dado un conjunto de hechos y calculos ya realizados por la aplicacion, el modelo redacta una explicacion breve y verificable, reduciendo el riesgo de errores aritmeticos.
- Extraccion de transacciones desde extractos bancarios: procesa paginas de extractos (incluidas imagenes escaneadas gracias al componente de vision) y las convierte en registros estructurados para su importacion.
- Revision de carteras y objetivos de ahorro: analiza listas de seguimiento y temas de investigacion frente a los objetivos del usuario para generar resumenes y recomendaciones de seguimiento.
- Asistente local con privacidad por diseno: al ejecutarse con llama.cpp en el ordenador del usuario, es adecuado para aplicaciones donde los datos financieros no pueden salir del dispositivo.
- Filtrado de seguridad en conversaciones: el modelo aprende a rechazar peticiones inseguras y a pedir aclaraciones, lo que sirve como capa de control en flujos de atencion al cliente o asistentes de dominio regulado.
- Prototipado de agentes con salida estructurada: util como referencia para experimentar con fine-tuning LoRA sobre un modelo multimodal pequeno para tareas de routing y extraccion.

## Benchmarks y rendimiento

El autor publica resultados sobre su conjunto de evaluacion congelado `v1` (perfiles y extractos sinteticos, nunca usados en entrenamiento). La puntuacion global es 0,8238.

| Track | Puntuacion | Tasa de exito | Elementos |
|---|---|---|---|
| advisor | 0,8866 | 0,755 | 200 |
| documents | 0,9985 | 0,9733 | 150 |
| quick_answer | 0,7499 | 0,5667 | 150 |
| research | 0,2667 | 0,02 | 100 |
| tool_calling | 0,8775 | 0,7775 | 400 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en 16 bits, aproximadamente 9 GB solo para los pesos, mas overhead de contexto y del codificador visual; con cuantizacion GGUF de 8 bits o 4 bits, el requisito baja considerablemente (el repo GGUF ocupa parte de los 8,9 GB del repo principal, aunque no se detallan los tipos exactos).
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano, un modelo de 4,4B en 16 bits encaja en GPUs de consumo con 12-16 GB de VRAM; las versiones cuantizadas permiten GPUs con 8 GB o menos.
- Cabe en GPU de consumo: si, previsiblemente en tarjetas con 8-16 GB de VRAM segun la cuantizacion, aunque el autor no lo confirma explicitamente.
- Opciones de despliegue: llama.cpp (mencionado por el autor para la app), y por compatibilidad con Qwen3-VL-4B-Instruct, teoricamente vLLM, TGI y Ollama, aunque no se confirma en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Loonie Guru v1 | 4,4B | No disponible | Apache 2.0 | Fine-tune financiero multimodal sobre Qwen3-VL-4B |
| Qwen/Qwen3-VL-4B-Instruct | 4,4B | No disponible | Apache 2.0 | Modelo base multimodal generalista |
| harshbhalodia/loonie-guru-gguf | 4,4B | No disponible | Apache 2.0 | Version cuantizada GGUF del mismo modelo para llama.cpp |

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo esta disenado para los prompts y comprobaciones propios de Loonie; fuera de ese contexto se comporta como un asistente general Qwen3-VL-4B-Instruct con los habitos adquiridos.
- No proporciona asesoramiento financiero regulado; el autor lo indica explicitamente.
- El track `research` obtiene una puntuacion muy baja (0,2667 con tasa de exito del 2%), lo que sugiere un rendimiento limitado en esa tarea.
- El track `quick_answer` tambien muestra una tasa de exito moderada (0,5667), lo que indica margen de mejora en respuestas rapidas.
- Entrenado exclusivamente con datos sinteticos y en ingles; puede presentar sesgos derivados del modelo profesor y del dataset generado, y no se ha validado en otros idiomas.
- Riesgo de alucinacion inherente a los modelos de lenguaje; el diseno de la app mitiga parte de este riesgo verificando cada respuesta contra los registros del usuario.
- La licencia Apache 2.0 permite uso comercial, pero se debe conservar el aviso de licencia y el NOTICE de Qwen (Alibaba Cloud) como obra derivada.
- No se dispone de informacion sobre la longitud de contexto, los tipos de cuantizacion concretos ni el rendimiento en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/harshbhalodia/loonie-guru
- Version GGUF: https://huggingface.co/harshbhalodia/loonie-guru-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Version Unsloth del base: https://huggingface.co/unsloth/Qwen3-VL-4B-Instruct
