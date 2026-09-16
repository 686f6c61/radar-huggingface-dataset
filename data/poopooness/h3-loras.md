# poopooness/H3-Loras

## Resumen

H3-Loras es un repositorio de adaptadores LoRA publicado por el usuario poopooness para el modelo de generacion de video con audio MiniMax-H3 (MiniMaxAI/MiniMax-H3). No se trata de un modelo fundacional ni de un checkpoint completo, sino de un espejo (mirror) de los LoRA de los que depende un motor de inferencia propietario, con el objetivo declarado de que un flujo de produccion no dependa de que un repositorio de terceros siga estando disponible. El repositorio ocupa 14,3 GB, aunque la model card solo documenta en detalle un unico archivo de pesos.

El unico adaptador descrito es `minimax_h3_turbo_v4_step600_ema.safetensors`, una copia literal del LoRA publicado por larryvrh (MiniMax-H3-Turbo-Lora, Apache-2.0), sin modificar, sin recuantizar y sin reescribir las claves. Se trata de un adaptador de muestreo de pocos pasos para generacion conjunta de audio y video: 518 tensores en bf16, aproximadamente 744 MB, con rango 64 (16 en las proyecciones AdaLN) y aplicado como `W_eff = W + lora_B @ lora_A` sin termino alpha.

Su relevancia es practica y acotada: en la medicion publicada por el autor, el uso de este LoRA reduce el tiempo de generacion de 124 fotogramas a 24 fps de 20:40 a 4:24 en una H100, manteniendo (segun el autor) una calidad de salida equivalente, a cambio de un incremento de en torno al 7 % en el coste por paso. El repositorio no incluye model card completa, no declara idiomas soportados y no tiene descargas ni valoraciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (low-rank adaptation) sobre el transformer de difusion de MiniMax-H3; no es un modelo autonomo |
| Parametros totales | no disponible para el repositorio completo; el unico adaptador documentado ocupa ~744 MB en bf16 (equivalente aproximado a 372 millones de parametros, calculo derivado del tamano del archivo, no confirmado por el autor) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (el adaptador hereda las capacidades del modelo base MiniMax-H3) |
| Tipos de cuantizacion | El adaptador se distribuye en bf16. La medicion publicada se realizo sobre una base cuantizada a int8 (`int8_convrot`, `nyxia/H3`) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (claves en nomenclatura ComfyUI, no compatibles con `add_adapter()` de PEFT) |

## Arquitectura y entrenamiento

El repositorio no contiene un modelo entrenado desde cero, sino adaptadores LoRA de bajo rango para el modelo base MiniMax-H3, un sistema de generacion de video con audio. El adaptador documentado consta de 518 tensores en bf16 con rango 64, reducido a 16 en las proyecciones AdaLN, y se aplica de forma aditiva sobre los pesos del modelo base mediante `W_eff = W + lora_B @ lora_A`. No se emplea termino alpha, por lo que el factor de escala habitual en LoRA no esta presente y la magnitud del adaptador queda fijada por el entrenamiento.

La funcion del adaptador es permitir muestreo de pocos pasos (few-step sampling) en la generacion conjunta de audio y video, es decir, sustituir decenas de evaluaciones del modelo por un numero muy reducido. El autor del espejo no aporta informacion sobre el dataset de entrenamiento, el numero de tokens o fotogramas vistos, ni sobre si hubo fases de RLHF o DPO; esos datos corresponderian al repositorio upstream de larryvrh, que no se detalla en la informacion disponible. La model card si indica un detalle de integracion relevante: las claves estan en nomenclatura ComfyUI, por lo que el adaptador no carga mediante `add_adapter()` de PEFT y requiere una capa de traduccion implementada en `ai-engines-h3/src/ai_engines_h3/lora.py`. El autor mantiene la rama de bajo rango sin fusionar con la base porque esta esta en int8 y la fusion implicaria una desquantizacion y recuantizacion.

## Capacidades

- Generacion de video a partir de texto (text-to-video) cuando se aplica sobre el modelo base MiniMax-H3.
- Generacion conjunta de audio y video (audio-video) en el mismo proceso de muestreo.
- Muestreo acelerado de pocos pasos: el autor reporta funcionamiento con 7 pasos y 6 evaluaciones, frente a los 50 pasos y 49 evaluaciones de la base sin el adaptador.
- Reduccion del coste temporal de inferencia en aproximadamente un 79 % en la configuracion medida (de 20:40 a 4:24), con un incremento de coste por paso de en torno al 7 %.
- Integracion en flujos ComfyUI gracias a la nomenclatura de claves empleada.
- Funcion de espejo de dependencias: el repositorio existe para garantizar disponibilidad de los LoRA en produccion.
- No se declaran capacidades de tool calling, function calling, razonamiento multi-paso, agentes, vision general, comprension de lenguaje ni capacidades multilingues. No es un modelo de lenguaje.

## Casos de uso

- Aceleracion de pipelines de generacion de video en produccion: sustituir la configuracion de 50 pasos por 7 pasos permite reducir el tiempo de generacion de 124 fotogramas a 24 fps de 20:40 a 4:24 en una H100, lo que hace viable la generacion casi interactiva en un entorno con GPUs de centro de datos.
- Generacion de video con audio sincronizado en una sola pasada: al tratarse de un adaptador para muestreo audio-video, se puede emplear en la produccion de clips cortos con pista de audio asociada sin encadenar dos modelos distintos.
- Estabilidad de dependencias en produccion: el repositorio actua como espejo de los LoRA de los que depende un motor de inferencia, de modo que un fallo o una retirada del repositorio upstream no rompe el despliegue. Es el caso de uso explicito declarado por el autor.
- Integracion en flujos ComfyUI: al usar nomenclatura de claves compatible con ComfyUI, se puede cargar en grafos de nodos existentes para prototipado rapido de composiciones de video.
- Evaluacion comparativa de adaptadores turbo: permite contrastar el LoRA v4 (7 pasos, orientado a pocos pasos) con la linea v1 (`..._4step_ema_ckpt850`), que el autor upstream describe como mas adecuada para movimiento intenso en 4 pasos.
- Investigacion sobre cuantizacion y fusion de LoRA: el caso de una base en int8 sobre la que no se puede fusionar el adaptador sin un ciclo de desquantizacion/recuantizacion es un escenario util para estudiar el equilibrio entre latencia, memoria y fidelidad numerica.
- Generacion por lotes en pipelines de postproduccion: con un coste por fotograma reducido por un factor cercano a cinco, la generacion masiva de variantes de un mismo plano condicionado (misma semilla, mismo fotograma de condicionamiento, mismo prompt) resulta practica dentro de una ventana de mantenimiento nocturna.
- Pruebas de regresion de motores de inferencia: al fijar una version concreta del adaptador y conocer su coste por paso, se puede usar como referencia para detectar degradaciones de rendimiento en el motor `ai-engines-h3`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no hay MMLU, HumanEval, GSM8K ni metricas de calidad objetivas, que por otra parte no aplican a un modelo de generacion de video). El unico dato cuantitativo publicado es una medicion de tiempo de generacion realizada por el autor del espejo el 10 de agosto de 2026:

| Configuracion | Pasos (evaluaciones) | Tiempo total | Hardware | Condiciones |
|---|---|---|---|---|
| Base `int8_convrot` (`nyxia/H3`, pinkcherry FL2VA) | 50 (49) | 20:40 | H100 | 124 fotogramas a 24 fps |
| Base + `minimax_h3_turbo_v4_step600_ema.safetensors` | 7 (6) | 4:24 | H100 | 124 fotogramas a 24 fps, misma semilla, mismo fotograma de condicionamiento y mismo prompt |

Notas sobre la medicion: la calidad de salida fue juzgada equivalente por el autor, sin metrica objetiva ni evaluacion por terceros; el coste por paso aumenta aproximadamente un 7 % porque la rama de bajo rango se ejecuta sin fusionar con la base.

## Requisitos de hardware

- El adaptador en si ocupa aproximadamente 744 MB en bf16 y 518 tensores, por lo que su huella de memoria adicional es reducida frente al modelo base.
- El requisito real de VRAM lo determina el modelo base MiniMax-H3 y su cuantizacion (la medicion publicada usa una base en int8). No se dispone de cifras de VRAM del modelo base en la informacion proporcionada.
- GPU empleada en la medicion publicada: NVIDIA H100. No hay datos de rendimiento en GPUs de consumo.
- No se especifica si el sistema completo cabe en una GPU de consumo; dado que el repositorio ocupa 14,3 GB solo en adaptadores y el modelo base es un generador de video con audio, es previsible que requiera hardware de centro de datos, pero esto no esta confirmado en la informacion disponible.
- Opciones de despliegue: integracion via ComfyUI (nomenclatura de claves compatible) y via el motor propio `ai-engines-h3` con la capa de traduccion de `lora.py`. No se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje, no aplicables aqui).
- Latencia medida: 4:24 para 124 fotogramas a 24 fps (aproximadamente 5,1 segundos de video) en una H100 con el adaptador a 7 pasos, frente a 20:40 con la base a 50 pasos. No se publica throughput por GPU adicional ni datos de latencia por fotograma desagregados.

## Comparativa con modelos similares

| Modelo | Tipo | Relacion con este repositorio | Licencia | Disponibilidad |
|---|---|---|---|---|
| poopooness/H3-Loras | Espejo de LoRA para MiniMax-H3 | Objeto de esta ficha; documenta un unico archivo, `minimax_h3_turbo_v4_step600_ema.safetensors` | apache-2.0 | HuggingFace, 0 descargas, 0 likes |
| larryvrh/MiniMax-H3-Turbo-Lora | LoRA upstream para MiniMax-H3 | Origen del archivo espejado, copia literal sin modificar; el espejo existe para no depender de el | apache-2.0 | HuggingFace (upstream) |
| MiniMaxAI/MiniMax-H3 | Modelo base de generacion de video con audio | Modelo sobre el que se aplican estos adaptadores | no disponible en la informacion proporcionada | HuggingFace (modelo base declarado) |
| `..._4step_ema_ckpt850` (linea v1 del upstream) | LoRA alternativo de 4 pasos | Segun la model card, mas adecuado para movimiento intenso; no espejado todavia en este repositorio | apache-2.0 (upstream) | Publicado por el upstream, no incluido aqui |

No se dispone de datos de parametros, contexto ni rendimiento de MiniMax-H3 ni de los adaptadores alternativos en la informacion proporcionada, por lo que la comparativa se limita a tipo, licencia y disponibilidad.

## Limitaciones y advertencias

- El repositorio no es un modelo autonomo: sin el modelo base MiniMax-H3 no genera nada. No debe tratarse como un checkpoint independiente.
- No es compatible con la carga estandar de adaptadores de PEFT (`add_adapter()`), porque las claves estan en nomenclatura ComfyUI; requiere la traduccion especifica del motor `ai-engines-h3`.
- El adaptador se aplica sin termino alpha, de modo que no se puede escalar su influencia con el factor habitual de LoRA.
- El repositorio ocupa 14,3 GB, pero la model card solo documenta un archivo de aproximadamente 744 MB. El contenido del resto del repositorio no esta descrito en la informacion disponible, lo que dificulta auditar que se esta descargando.
- La afirmacion de calidad equivalente es una valoracion subjetiva del autor, sin metrica objetiva, sin evaluacion por terceros y sin comparacion ciega. No debe tomarse como un resultado de benchmark.
- La medicion de rendimiento procede de una configuracion concreta (base int8 `nyxia/H3`, pinkcherry FL2VA, H100, 124 fotogramas a 24 fps, 2026-08-10) y no es extrapolable a otras cuantizaciones, resoluciones o GPUs.
- El repositorio tiene 0 descargas y 0 likes, sin historial de uso ni validacion comunitaria. Es un artefacto de produccion interno publicado, no un modelo con adopcion verificable.
- No se declaran idiomas soportados, sesgos conocidos ni limitaciones de contexto. Al ser un generador de video, los riesgos relevantes son de contenido (sesgos visuales y de representacion del modelo base) y de uso indebido, no de alucinacion textual; aun asi, el modelo base puede producir contenido incoherente o fisicamente implausible.
- La licencia del espejo es apache-2.0 y el autor declara que la copia es literal y sin modificar, pero el uso comercial efectivo depende tambien de los terminos del modelo base MiniMax-H3, que no se detallan en la informacion disponible. Conviene verificar la licencia del modelo base antes de un despliegue comercial.
- Riesgo de dependencia de terceros: el propio repositorio existe para mitigarlo, pero la linea v1 del upstream no esta espejada, por lo que esa dependencia sigue abierta.

## Enlaces

- Repositorio del modelo: https://huggingface.co/poopooness/H3-Loras
- Modelo base declarado: https://huggingface.co/MiniMaxAI/MiniMax-H3
- LoRA upstream espejado: https://huggingface.co/larryvrh/MiniMax-H3-Turbo-Lora
- Codigo de integracion citado en la model card: `ai-engines-h3/src/ai_engines_h3/lora.py` (repositorio no identificado con URL en la informacion disponible)
- Base cuantizada mencionada en la medicion: `nyxia/H3` (referencia sin URL confirmada en la informacion disponible)
- La busqueda web realizada no ha devuelto resultados relevantes para este modelo: los resultados obtenidos corresponden a contenidos sin relacion (repositorios de jailbreaks de ChatGPT, guias de uso de ChatGPT en vietnamita y consultas sobre verificacion telefonica), por lo que no se incluyen como enlaces.
