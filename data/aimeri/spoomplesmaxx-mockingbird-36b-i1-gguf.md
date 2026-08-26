# aimeri/spoomplesmaxx-mockingbird-36B-i1-GGUF

## Resumen

Spoomplesmaxx-mockingbird-36B es un modelo de lenguaje de 36 000 millones de parámetros desarrollado por el usuario aimeri, especializado en escritura creativa, roleplay y asistencia conversacional. La versión i1-GGUF que aquí se documenta es una cuantización ponderada con matriz de importancia (imatrix) calculada sobre el propio corpus de entrenamiento del modelo, lo que mejora la calidad en cuantizaciones de 3 y 4 bits respecto a las versiones estáticas. El modelo base se distribuye bajo licencia Apache 2.0 y está pensado para generación de texto en inglés, con un enfoque particular en narrativa y personajes.

Esta ficha cubre exclusivamente la variante GGUF cuantizada, que permite ejecutar el modelo en hardware de consumo con requisitos de VRAM que van desde aproximadamente 14 GB hasta 26 GB según la cuantización elegida. El modelo incluye una plantilla de chat incrustada en los metadatos del archivo GGUF, y el autor advierte de que no deben usarse penalizaciones de repetición, ya que degradan la generación. Aunque no se dispone de información detallada sobre la arquitectura interna ni los datos de entrenamiento, el modelo se posiciona como una opción para tareas de roleplay y escritura creativa con capacidades secundarias de razonamiento e instrucciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 36 151 104 512 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ3_XXS (~14 GB), i1-Q3_K_M (~18 GB), i1-IQ4_XS (~19 GB), i1-Q4_K_M (~22 GB), i1-Q5_K_M (~26 GB) |
| Idiomas soportados | ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con matriz de importancia imatrix) |

## Arquitectura y entrenamiento

No se dispone de informacion publica sobre la arquitectura interna del modelo base (tipo de transformer, uso de MoE, atencion, etc.) ni sobre el proceso de entrenamiento (numero de tokens, composicion del dataset, tecnicas de alineacion como RLHF o DPO). El repositorio de GitHub asociado al proyecto indica que los datasets estan disenados para entrenar un modelo de roleplay, escritura creativa y asistente "inteligente", combinando narrativa, caracterizacion de personajes y capacidad de seguir instrucciones complejas. La version GGUF aqui documentada es una cuantizacion ponderada con imatrix, donde la matriz de importancia se calculo sobre una muestra estratificada del corpus de entrenamiento del propio modelo, renderizada con la plantilla de chat exacta que el modelo utiliza en produccion. Esta tecnica mejora la fidelidad en cuantizaciones de 3 y 4 bits, mientras que en Q5 la diferencia con las cuantizaciones estaticas es minima.

## Capacidades

- Generacion de texto narrativo y creativo, con especial enfasis en roleplay y escritura de ficcion.
- Encarnacion de personajes y mantenimiento de conversaciones multi-turno con coherencia contextual.
- Competencia ligera en seguimiento de instrucciones y razonamiento basico, segun la descripcion del modelo mini-14B de la misma familia.
- Soporte de plantilla de chat nativa incrustada en los metadatos GGUF, que incluye el token especial `<seed:eos>` para finalizar turnos.
- Idioma unico: ingles. No se mencionan capacidades multilingues.
- No se indica soporte de tool calling, agentes, vision ni audio.

## Casos de uso

- Roleplay interactivo: el modelo puede mantener conversaciones con personajes definidos por el usuario, manteniendo la coherencia narrativa a lo largo de multiples turnos gracias a su plantilla de chat especifica y su entrenamiento orientado a caracterizacion.
- Escritura creativa asistida: generacion de borradores de relatos, dialogos y descripciones, con control de estilo y tono mediante instrucciones en lenguaje natural.
- Creacion de personajes para juegos de rol o ficcion: el modelo puede generar fichas de personaje, historias de fondo y arcos narrativos completos.
- Asistente conversacional con personalidad: configuracion de un asistente con una voz o actitud determinada, util para prototipos de chatbots o demos interactivas.
- Generacion de contenido para narrativa interactiva (ficcion de elige tu propia aventura): el modelo puede proponer ramificaciones de historia y mantener el hilo argumental.
- Experimentacion con cuantizacion imatrix: al ser una version GGUF con matriz de importancia, es util para evaluar el impacto de la cuantizacion en tareas creativas y comparar con las versiones estaticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras metricas estandar para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion:
  - i1-IQ3_XXS (~14 GB): cabe en GPUs de 16 GB, aunque con calidad reducida.
  - i1-Q3_K_M (~18 GB): requiere al menos 20 GB de VRAM, por ejemplo una RTX 3090 o RTX 4090.
  - i1-IQ4_XS (~19 GB): similar al anterior, recomendable 24 GB.
  - i1-Q4_K_M (~22 GB): recomendado, necesita 24 GB de VRAM (RTX 3090, RTX 4090, A5000).
  - i1-Q5_K_M (~26 GB): requiere 32 GB o mas, como una A100 40GB o RTX A6000.
- En GPUs de consumo, las cuantizaciones de 14 a 22 GB son viables en tarjetas de 24 GB (RTX 3090/4090). Las de 26 GB necesitan tarjetas profesionales o multiples GPUs.
- Opciones de despliegue: al ser formato GGUF, es compatible con llama.cpp, Ollama, LM Studio y otros motores que soporten este formato. No se confirma compatibilidad con vLLM o TGI.
- Latencia y throughput: no disponibles. Dependen del hardware y de la cuantizacion elegida.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa fiable con otros modelos de la misma categoria. El unico modelo comparable dentro de la misma familia es aimeri/spoomplesmaxx-mini-14B, que comparte el enfoque en roleplay y escritura creativa pero con 14 000 millones de parametros y un requisito de VRAM menor (una sola GPU de 24 GB). No se conocen datos de rendimiento relativo entre ambos.

## Limitaciones y advertencias

- El modelo esta entrenado exclusivamente en ingles; no se recomienda su uso en otros idiomas.
- El autor advierte explicitamente de que no deben usarse penalizaciones de repeticion, presencia o frecuencia (repeat_penalty, presence_penalty, frequency_penalty). Si se activan, el modelo deja de emitir el token `<seed:eos>` y la generacion degenera hacia vocabulario chino no entrenado. Muchos frontends aplican repeat_penalty por defecto (1.05-1.1), por lo que hay que desactivarlo manualmente.
- La ventana de temperatura util es muy estrecha: aproximadamente 0.95-1.05. Temperaturas mas bajas producen repeticion literal; temperaturas mas altas degradan la coherencia.
- No se dispone de informacion sobre sesgos, riesgos de alucinacion o limitaciones de contexto. Al ser un modelo de 36B sin datos de entrenamiento publicados, no se puede evaluar su robustez en entornos de produccion.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los terminos del modelo base y de los datasets utilizados, que no estan documentados en esta ficha.

## Enlaces

- Modelo GGUF en HuggingFace: https://huggingface.co/aimeri/spoomplesmaxx-mockingbird-36B-i1-GGUF
- Modelo base (safetensors): https://huggingface.co/aimeri/spoomplesmaxx-mockingbird-36B
- Repositorio de datasets del proyecto: https://github.com/aimerib/spoomplesmaxx
- Modelo mini-14B de la misma familia: https://huggingface.co/aimeri/spoomplesmaxx-mini-14B
