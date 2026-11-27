# febilly/Hy-MT3-1.8B-StreamRevise-LoRA

## Resumen

Hy-MT3-1.8B-StreamRevise es un adaptador LoRA sobre el modelo de traduccion tencent/Hy-MT3-1.8B, desarrollado por el usuario febilly. Su proposito es la traduccion de subtitulos en directo a partir de hipotesis ASR (reconocimiento automatico del habla) que cambian de forma incremental. Cada vez que el motor ASR emite una nueva version parcial de una frase, el adaptador recibe la hipotesis actual, la traduccion previa de esa misma frase y un estado explicito (`进行中` para parciales, `本句结束` para frases finalizadas), y devuelve una traduccion coherente con lo ya emitido.

El problema que resuelve es especifico pero relevante: en traduccion simultanea, las hipotesis ASR se corrigen sobre la marcha y una traduccion ingenua produce parpadeos, prefijos inconsistentes y puntuacion prematura. El adaptador ensena al modelo base a conservar los prefijos que siguen siendo correctos, extender la traduccion sin adivinar palabras aun no pronunciadas, revisar cuando el ASR corrige lo ya dicho y cerrar limpiamente la frase con puntuacion adecuada al finalizar.

Se distribuye como adaptador PEFT (safetensors de ~0,1 GB) y requiere el modelo base tencent/Hy-MT3-1.8B (1.800 millones de parametros). Existe una version GGUF cuantizada a 4 bits publicada por el mismo autor. Los idiomas declarados son chino, ingles y japones, aunque el formato de prompt admite nombres de idioma para coreano, frances, aleman, espanol, ruso, portugues e italiano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only tencent/Hy-MT3-1.8B |
| Parametros totales | 1.800 millones (modelo base); adaptador LoRA de ~0,1 GB |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M disponible en la version GGUF del mismo autor (1,13 GB / 1,06 GiB); otras no disponibles |
| Idiomas soportados | zh, en, ja (declarados); el prompt admite ko, fr, de, es, ru, pt, it |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT); GGUF en repositorio separado |

## Arquitectura y entrenamiento

El adaptador se aplica sobre tencent/Hy-MT3-1.8B, un modelo de traduccion de 1.800 millones de parametros con arquitectura transformer decoder-only. La contribucion del LoRA es el ajuste fino para el regimen de traduccion por streaming: el prompt se estructura en secciones `【背景信息】` y `【待翻译文本】`, con el contexto de origen colocado al principio para que los motores de inferencia puedan reutilizar la cache KV del prefijo entre actualizaciones de la misma frase. El estado se codifica explicitamente en chino (`进行中` / `本句结束`) y la instruccion de sistema describe las cuatro conductas objetivo: conservar prefijos correctos, extender sin adivinar, revisar ante correcciones del ASR y finalizar con puntuacion limpia.

Un detalle de diseno destacable es la exclusion deliberada del texto fuente previo (`previous_source`): en su lugar se compara la traduccion previa directamente contra el texto fuente actual, lo que segun el autor evita sesgo de exposicion y mejora la correccion de errores de traduccion obsoletos. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se empleo RLHF o DPO. El contexto de origen se limita a las cinco ultimas frases. La generacion se detiene en el token `120020` (`<｜hy_place▁holder▁no▁2｜>`) y el template de chat usa un unico turno de usuario con los tokens especiales `<｜hy_begin▁of▁sentence｜>`, `<｜hy_User｜>` y `<｜hy_Assistant｜>`.

## Capacidades

- Traduccion de subtitulos en directo con hipotesis ASR incrementales, incluyendo actualizaciones parciales y finalizacion de frase.
- Conservacion de prefijos correctos entre actualizaciones sucesivas de una misma frase.
- Extension de la traduccion sin anticipar palabras aun no pronunciadas y sin emitir puntuacion terminal prematura en parciales.
- Revision de la traduccion cuando el ASR corrige retroactivamente lo ya reconocido.
- Finalizacion limpia con puntuacion adecuada al recibir el estado `本句结束`.
- Traduccion de frase completa en modo independiente (standalone) sin estado de streaming.
- Soporte de contexto de origen reciente (hasta cinco frases) para desambiguacion.
- Traduccion entre chino, ingles y japones como idiomas declarados; el formato de prompt incluye nombres para coreano, frances, aleman, espanol, ruso, portugues e italiano.
- Integracion con `transformers` y `peft` mediante `apply_chat_template` y `PeftModel.from_pretrained`.
- No se documenta soporte de tool calling, function calling, agentes, vision ni audio nativo en la informacion disponible.

## Casos de uso

- Subtitulado en directo de reuniones y webinars: el adaptador recibe las hipotesis parciales del ASR y actualiza el subtitulo manteniendo el prefijo ya mostrado, de modo que la audiencia no ve parpadeos ni reescrituras completas de la linea en cada actualizacion.
- Traduccion simultanea de conferencias: con el estado `进行中` el modelo emite medias frases sin adivinar el final, y con `本句结束` cierra la oracion con puntuacion, lo que encaja con un pipeline de captions que necesita baja latencia y coherencia entre segmentos.
- Localizacion de contenido audiovisual en postproduccion: el modo standalone permite traducir frases completas del guion o de los subtitulos ya transcritos, y el modo streaming permite previsualizar la traduccion mientras se transcribe.
- Sistemas de videollamada con traduccion en tiempo real: el contexto de origen de hasta cinco frases previas ayuda a resolver referencias y nombres propios que el ASR reconoce de forma ambigua en frases aisladas.
- Investigacion en traduccion simultanea: el formato de prompt explicito y el ejemplo de trayectoria ASR publicado facilitan reproducir experimentos de streaming translation con un modelo pequeno desplegable en local.
- Despliegue en hardware modesto: la version GGUF Q4_K_M de 1,13 GB permite ejecutar el sistema completo en CPU o en GPUs de consumo, util para prototipos de subtitulado sin infraestructura dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente incluye un ejemplo cualitativo de ejecucion greedy con cuantizacion Q4_K_M sobre una trayectoria ASR sintetica de cuatro pasos (ingles a chino), en el que se observa la conservacion del prefijo, la eliminacion del punto tentativo del ASR en parciales y la adicion del punto final en `本句结束`.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA apenas anade requisitos sobre el modelo base de 1.800 millones de parametros. En bfloat16 el modelo base ronda los 3,6 GB de pesos; en 4 bits, la version GGUF publicada ocupa 1,13 GB (1,06 GiB).
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para el modelo base en bfloat16, o menos para la version cuantizada. No se especifican modelos concretos en la informacion disponible.
- Cabe en GPU de consumo: si, en tarjetas con 6 GB o mas de VRAM para bfloat16 y en configuraciones inferiores con la cuantizacion Q4_K_M.
- Opciones de despliegue: `transformers` + `peft` (documentado en la model card); llama.cpp u otros motores compatibles con GGUF para la version cuantizada; vLLM y TGI no estan documentados en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hy-MT3-1.8B-StreamRevise (este) | 1,8 B (base) + LoRA | no disponible | Traduccion streaming con revision incremental | apache-2.0 | Hugging Face (adaptador + GGUF) |
| tencent/Hy-MT3-1.8B | 1,8 B | no disponible | Traduccion generalista | no disponible en la informacion | Hugging Face |
| Alternativas de traduccion de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros adaptadores o modelos comparables de traduccion simultanea en la documentacion proporcionada.

## Limitaciones y advertencias

- El adaptador depende del modelo base tencent/Hy-MT3-1.8B; no es un modelo autonomo y requiere cargar ambos.
- Los idiomas declarados oficialmente son solo chino, ingles y japones; el resto de idiomas del renderer de prompt no estan garantizados por el autor.
- El contexto de origen se limita a las cinco ultimas frases; frases mas largas o dependencias lejanas pueden degradar la coherencia.
- El diseno asume un unico turno de usuario y un formato de prompt muy especifico; desviarse del mismo puede reducir la calidad.
- No se han publicado benchmarks cuantitativos, por lo que el rendimiento real frente a alternativas no esta verificado de forma objetiva.
- Riesgo de alucinacion inherente a los modelos generativos de traduccion, especialmente con hipotesis ASR ruidosas o ambiguas.
- No se documentan sesgos conocidos ni evaluaciones de seguridad en la informacion disponible.
- La licencia apache-2.0 permite uso comercial, pero conviene verificar la licencia del modelo base tencent/Hy-MT3-1.8B antes de desplegar en produccion.
- El repositorio registra cero descargas y cero likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Adaptador LoRA: https://huggingface.co/febilly/Hy-MT3-1.8B-StreamRevise-LoRA
- Version GGUF 4 bits: https://huggingface.co/febilly/Hy-MT3-1.8B-StreamRevise-GGUF
- Modelo base: https://huggingface.co/tencent/Hy-MT3-1.8B
