# isichan-ai/Mitsuba-ComfyUI-27B-GGUF

## Resumen

Mitsuba-ComfyUI-27B-GGUF es una cuantizacion ternaria (1,58 bits) del modelo Qwen3.8-27B, publicada por el usuario isichan-ai y ajustada especificamente para trabajar con ComfyUI: generar prompts de imagen y video que cumplan condiciones estrictas y describir imagenes. No es un modelo de proposito general: la propia model card advierte de que no esta pensado para programar. Parte de los pesos oficiales de Qwen3.8-27B, ternarizados por el autor (no derivados de los pesos de Bonsai), y se distribuye en los formatos GGUF PQ2_0 y PTQ1_0 de Prism ML.

El interes principal esta en el compromiso tamano/capacidad: el modelo completo en BF16 ocupa 51 GB, mientras que las versiones ternarias quedan en 7,32 GB (PQ2_0) y 6,00 GB (PTQ1_0), de modo que caben en una unica GPU de 16 GB. La ternarizacion conserva vision (89,8 a 87,8 sobre 100), seguimiento de reglas (84 a 84) y rendimiento en japones y generacion de prompts (52 a 52), pero sacrifica codigo (66 a 4) y lectura de documentos largos (76 a 48) respecto al modelo original.

El modelo tiene 27.320.697.856 parametros totales, soporta japones e ingles, licencia Apache-2.0 e incluye un codificador de vision separado (mmproj-Q8_0.gguf, 0,63 GB). Requiere el fork de llama.cpp de PrismML, ya que llama.cpp upstream todavia no soporta los formatos PQ2_0 y PTQ1_0. Ademas, debe usarse con el modo de razonamiento (thinking) desactivado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen/Qwen3.8-27B; multimodal imagen-texto a texto) |
| Parametros totales | 27.320.697.856 (27,3 B) |
| Parametros activos | no aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | 131.072 tokens (configuracion usada en la evaluacion del autor) |
| Tipos de cuantizacion | Ternaria 1,58 bits: PQ2_0 (7,32 GB) y PTQ1_0 (6,00 GB); codificador de vision en Q8_0 |
| Idiomas soportados | japones (ja), ingles (en) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (PQ2_0 y PTQ1_0 de Prism ML; mmproj-Q8_0 para vision) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de que el modelo base es Qwen/Qwen3.8-27B y de que el pipeline es image-text-to-text, con un codificador de vision distribuido aparte en el archivo mmproj-Q8_0.gguf. Lo que si se documenta es el proceso de cuantizacion: una ternarizacion propia (1,58 bits) realizada por el autor sobre los pesos oficiales de Qwen3.8-27B, almacenada en los formatos PQ2_0 y PTQ1_0 de Prism ML. No se menciona ningun reentrenamiento adicional ni datos de entrenamiento nuevos: el ajuste al dominio de ComfyUI descrito en la model card es el resultado de la propia ternarizacion y de la evaluacion comparativa, no de un fine-tuning documentado.

El codificador de vision se toma sin cambios del repositorio OS-Software/Ternary-Bonsai-2-27B-Uncensored-Heretic-GGUF (Apache-2.0). La model card indica explicitamente que con el kernel PTQ1_0 actual el rendimiento de vision es inferior al de PQ2_0, por lo que la variante recomendada es PQ2_0. El modelo fue ajustado unicamente en modo sin razonamiento (no-thinking); no se documentan tecnicas como decodificacion especulativa, atencion lineal o variantes hibridas.

## Capacidades

- Generacion de prompts para imagen y video con condiciones estrictas: recuento de palabras, palabras obligatorias y prohibidas, y formato de salida definido en el propio texto de la peticion.
- Cumplimiento de reglas: 84 sobre 100 en el eje de rule following, identico al modelo original en BF16.
- Descripcion de imagenes (vision): 87,8 sobre 100, frente a 89,8 del modelo sin cuantizar.
- Generacion de texto conversacional en japones e ingles, con enfasis en japones: 52 sobre 100 en el eje de redaccion y prompts.
- Capacidad de completar tareas sencillas: 76 sobre 100 en task completion (80 en PTQ1_0).
- Respuestas directas: 84 sobre 100 en PQ2_0 y 92 sobre 100 en PTQ1_0.
- No soporta bien el codigo (4 sobre 100) ni la lectura de documentos largos (48 sobre 100).
- No se documenta soporte de tool calling, function calling ni de flujos de agente multi-paso.
- No se documenta modo thinking funcional: el razonamiento debe permanecer desactivado porque en ese modo el modelo tiende a repetir frases dentro del razonamiento y puede terminar sin escribir respuesta.

## Casos de uso

- Generacion de prompts para ComfyUI: el modelo recibe una descripcion o una imagen y devuelve un prompt de difusion que respeta restricciones de longitud, vocabulario obligatorio y vocabulario vetado. En la evaluacion del autor pasa de 3/10 a 6/10 prompts con todas las condiciones cumplidas respecto al original.
- Image-to-prompt en flujos de trabajo de difusion: a partir de una imagen de referencia, el modelo produce el prompt textual que la reproduce, lo que permite reutilizar estilos en una estacion local sin depender de APIs externas.
- Etiquetado y curacion de datasets de imagen o video: descripcion automatica de lotes de imagenes en japones o ingles para construir pares imagen-texto, aprovechando el eje de vision (87,8 sobre 100).
- Asistente local en estaciones de trabajo con 16 GB de VRAM: al ocupar 7,32 GB (PQ2_0) mas 0,63 GB de codificador de vision, cabe junto al resto de la memoria de la GPU en equipos de gama media-alta sin necesidad de cuantizaciones mas agresivas.
- Traduccion y adaptacion de prompts entre japones e ingles: util para equipos que consumen prompts en japones y necesitan reescribirlos en ingles sin perder las restricciones de formato.
- Automatizacion por API en pipelines internos de generacion: con llama-server, el modelo expone una API compatible con endpoints y puede integrarse en scripts que encadenan generacion de prompt, ejecucion en ComfyUI y verificacion posterior del resultado.
- Prevalidacion de prompts antes de gastar computo en difusion: el modelo puede comprobar si un prompt cumple un conjunto de condiciones (recuento de palabras, terminos prohibidos, formato) y devolver una version corregida antes de lanzar el sampler.

## Benchmarks y rendimiento

Resultados publicados por el autor, medidos con las mismas preguntas y condiciones para los cuatro modelos. Cada eje es una puntuacion sobre 100.

| Eje | Mitsuba PQ2_0 | Mitsuba PTQ1_0 | Ternary Bonsai 2 27B PQ2_0 | Qwen3.8-27B BF16 (original) |
|---|---:|---:|---:|---:|
| Total | 61,5 (B) | 60,2 (B) | 59,6 (B) | 66,3 (A) |
| 1. Sin censura | 53,2 | 48,8 | 36,0 | 31,9 |
| 2. Honestidad | 63,2 | 72,2 | 51,0 | 51,1 |
| 3. Autocontrol | 62,7 | 56,9 | 65,5 | 55,6 |
| 4. Franqueza | 84,0 | 92,0 | 88,0 | 84,0 |
| 5. Seguimiento de reglas | 84,0 | 80,0 | 72,0 | 84,0 |
| 6. Finalizacion de tareas | 76,0 | 80,0 | 76,0 | 72,0 |
| 7. Programacion | 4,0 | 4,0 | 38,0 | 66,0 |
| 8. Lectura | 48,0 | 40,0 | 44,0 | 76,0 |
| 9. Japones y prompts | 52,0 | 48,0 | 42,0 | 52,0 |
| 10. Vision | 87,8 | 79,6 | 83,7 | 89,8 |
| Prompts imagen/video con todas las condiciones cumplidas | 6/10 | 5/10 | 2/10 | 3/10 |
| Velocidad de decodificacion (t/s, RTX 5090) | 119,0 | 98,7 | 120,8 | 1,6 (*) |

(*) El modelo BF16 (51 GB) no cabe en los 32 GB de la RTX 5090, por lo que solo 28 de las 64 capas se ejecutaron en GPU; su velocidad es solo orientativa.

Comparacion pareada (Mitsuba PQ2_0 menos Ternary Bonsai 2 27B PQ2_0), con franqueza, finalizacion de tareas y lectura medidas con cuatro veces mas preguntas:

- Superior: sin censura y honestidad.
- No inferior (margen de 10 puntos): seguimiento de reglas, franqueza, japones y prompts, y vision.
- Sin decision posible ni con 49-100 preguntas: autocontrol, finalizacion de tareas y lectura.
- Programacion: claramente peor, excluida del analisis.

La model card incluye tambien una tabla comparativa con el modo thinking activado, pero en la informacion disponible aparece truncada: solo consta el total de PQ2_0 sin thinking (61,5). No se han publicado en la informacion disponible resultados de benchmarks estandar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: 7,32 GB para PQ2_0 y 6,00 GB para PTQ1_0, mas 0,63 GB del codificador de vision mmproj-Q8_0. Con cache KV en q4_0 y contexto de 131.072 tokens, el autor indica que funciona en una unica GPU de 16 GB.
- GPU recomendadas: el autor reporta pruebas en RTX 5090 (32 GB) a 119,0 t/s con PQ2_0 y 98,7 t/s con PTQ1_0. Cabe en GPU de consumo de 16 GB o mas de VRAM.
- Configuracion de referencia usada en la evaluacion: `--ctx-size 131072 --cache-type-k q4_0 --cache-type-v q4_0 --n-gpu-layers 99 --temperature 0.6 --top-k 20 --top-p 0.95`.
- Despliegue: requiere el fork de llama.cpp de PrismML (rama `prism`); llama.cpp upstream no soporta PQ2_0 ni PTQ1_0. El binario de referencia es `llama-server`. No se documenta soporte en vLLM, Ollama, TGI u otros motores.
- Razonamiento: debe desactivarse con `--reasoning off`, con `"chat_template_kwargs": {"enable_thinking": false}` por peticion, o marcando `"reasoning": false` en agentes como OpenCode.
- Modelo original en BF16: 51 GB y 64 capas; en una RTX 5090 solo se pudieron alojar 28 capas en GPU, con 1,6 t/s de decodificacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Total (eval. del autor) | Vision | Codigo | Licencia | Tamano de pesos |
|---|---:|---:|---:|---:|---:|---|---:|
| Mitsuba-ComfyUI-27B PQ2_0 | 27,3 B (ternario 1,58 bits) | 131.072 tokens (config. de evaluacion) | 61,5 | 87,8 | 4,0 | Apache-2.0 | 7,32 GB |
| Mitsuba-ComfyUI-27B PTQ1_0 | 27,3 B (ternario 1,58 bits) | 131.072 tokens (config. de evaluacion) | 60,2 | 79,6 | 4,0 | Apache-2.0 | 6,00 GB |
| Ternary Bonsai 2 27B PQ2_0 | 27 B (ternario) | no disponible | 59,6 | 83,7 | 38,0 | Apache-2.0 (segun el repositorio citado) | no disponible en la informacion |
| Qwen3.8-27B BF16 (original) | 27,3 B | no disponible | 66,3 | 89,8 | 66,0 | no disponible en la informacion | 51 GB |

Mitsuba mejora al Bonsai ternario en sin censura y honestidad, empata dentro del margen de no inferioridad en seguimiento de reglas, franqueza, japones y vision, y pierde claramente en programacion. Frente al original en BF16, la ternarizacion cuesta 4,8 puntos de total, con las mayores perdidas en codigo (-62) y lectura (-28).

## Limitaciones y advertencias

- Programacion practicamente inexistente: 4 sobre 100 en el eje de codigo, frente a 66 del original. El autor lo declara explicitamente como no apto para programar.
- Lectura de documentos largos degradada: 48 sobre 100 (40 en PTQ1_0) frente a 76 del original en BF16.
- El razonamiento debe permanecer desactivado. Con thinking activado el modelo repite frases dentro del razonamiento y puede terminar sin dar respuesta.
- Riesgo de alucinacion: no se publican medidas de veracidad factual mas alla del eje de honestidad (63,2 sobre 100 en PQ2_0), y la propia cuantizacion ternaria degrada la fidelidad del modelo original.
- Cobertura idiomatica limitada a japones e ingles; no se documentan otros idiomas.
- No es un modelo sin censura: la model card aclara que rechaza aproximadamente la mitad de las peticiones sensibles, pese a puntuar mas alto que el original en ese eje.
- Dependencia de un fork no upstream de llama.cpp (rama `prism` de PrismML). Sin ese fork no se pueden cargar los formatos PQ2_0 ni PTQ1_0, lo que complica el despliegue en produccion, la actualizacion de dependencias y el soporte a largo plazo.
- Adopcion muy baja: 2 descargas y 11 likes en el momento de la consulta, con lo que la validacion por parte de la comunidad es practicamente nula.
- El eje de autocontrol, el de finalizacion de tareas y el de lectura no pudieron resolverse estadisticamente ni con 49-100 preguntas en la comparacion pareada, lo que indica alta varianza en esos apartados.
- Licencia Apache-2.0, que permite uso comercial, pero el codificador de vision procede de un tercer repositorio (OS-Software/Ternary-Bonsai-2-27B-Uncensored-Heretic-GGUF) cuya licencia declarada en la model card es tambien Apache-2.0.
- El contexto de 131.072 tokens es la configuracion empleada en la evaluacion, no un limite confirmado del modelo; la informacion disponible no especifica la ventana maxima soportada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/isichan-ai/Mitsuba-ComfyUI-27B-GGUF
- Archivo PTQ1_0: https://huggingface.co/isichan-ai/Mitsuba-ComfyUI-27B-GGUF/blob/main/Mitsuba-ComfyUI-27B-v1.18-PTQ1_0.gguf
- Fork de llama.cpp de PrismML (rama `prism`): https://github.com/PrismML-Eng/llama.cpp
- Codificador de vision de origen: https://huggingface.co/OS-Software/Ternary-Bonsai-2-27B-Uncensored-Heretic-GGUF
- Nodos GGUF para ComfyUI: https://github.com/city96/ComfyUI-GGUF
- Descarga de ComfyUI / Comfy Desktop: https://comfy.org/download
- Repositorio de referencia de ComfyUI: https://github.com/zamelsky/comfyui
- Empero (laboratorio citado en la busqueda, modelos Qwen3.8 destilados y Ridge 27B GGUF): https://empero.org/
