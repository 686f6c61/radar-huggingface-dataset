# QiLong26/Qwen3-VL-32B-stage2-SFT-adapter

## Resumen

El modelo `QiLong26/Qwen3-VL-32B-stage2-SFT-adapter` es un adaptador LoRA (PEFT) sobre `Qwen/Qwen3-VL-32B-Instruct`, un transformer multimodal de 33,6 B de parametros. No es un modelo autonomo: requiere cargar el modelo base congelado y montar encima los adaptadores. Su funcion es muy concreta dentro de la pipeline agentica ST-VAD / VAD-RL: actua como la herramienta `track`, encargada de inferir cambios de estado de objetos a partir de fotogramas de video y de una lista de objetos generada en una etapa previa, y de emitir el resultado como JSON estructurado dentro de las etiquetas `<state>...</state>`.

El adaptador se entreno sobre 4.999 filas de la particion `stage == "state"` del conjunto PhysAD (`PhysAD_VQA_sft_planB.jsonl`), con LoRA de rango 32 y alpha 64 aplicado a 448 modulos (`q, k, v, o, gate, up, down`), sin tocar la torre de vision. Los adaptadores suman 268.435.456 parametros entrenables, un 0,798 % del total. El entrenamiento duro 6 horas y 20 minutos en una unica H200 y la perdida de entrenamiento bajo de 0,560 a 0,336.

Su relevancia es acotada pero clara: es un ejemplo de destilacion de racionalizacion aplicada a deteccion de anomalias en video, donde el modelo debe deducir la anomalia a partir de los pixeles en lugar de leerla en el prompt. Conviene subrayar que el propio autor declara que esta entrenado pero no validado, y que la puerta de aceptacion prevista nunca se ejecuto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-language) sobre `Qwen/Qwen3-VL-32B-Instruct`; adaptador LoRA (PEFT) sobre las proyecciones de atencion y MLP |
| Parametros totales | 33,6 B en el modelo base (congelado, bf16) + 268.435.456 parametros entrenables del adaptador (0,798 %) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible para el modelo base; el adaptador se entreno con `max_seq_len` 16.384, con secuencia mediana de 4.039 tokens, p99 de 11.077 y maximo de 14.710 |
| Tipos de cuantizacion | No disponible para el adaptador (adaptadores en fp32, base en bf16); el autor no publica pesos cuantizados |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptadores LoRA en formato PEFT); tamano del repositorio 1,1 GB |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura vision-language del base: un transformer multimodal que acepta imagenes o fotogramas de video junto con texto y genera texto. Sobre el se aplica un adaptador LoRA con r=32, alpha=64 y dropout=0,05 en los modulos `q, k, v, o, gate, up, down`, alcanzando 448 modulos adaptados y cero modulos en la torre de vision. Los adaptadores se guardan en fp32. La magnitud relativa del movimiento de pesos reportada por el autor (`||BA·s||/||W||`) tiene mediana 1,099e-02, con minimo 5,97e-03 y maximo 3,53e-02 sobre las 448 capas adaptadas, lo que indica una actualizacion moderada y homogenea.

El entrenamiento uso 4.999 filas con `stage == "state"` del fichero PhysAD (`PhysAD_VQA_sft_planB.jsonl`). Cada ejemplo consume 8 fotogramas equiespaciados del clip, con lado maximo de 512 px, lo que produce 144 tokens de vision por fotograma. La programacion fue de 2 epocas, batch de 1 con acumulacion de gradiente de 8 (1.250 pasos), learning rate 1e-4 con schedule coseno y 3 % de warmup. La supervision se enmascaro unicamente al tramo `<state>…</state><|im_end|>`, de modo que el modelo solo recibe gradiente sobre el JSON de salida. La perdida bajo de 0,560 a 0,336, con `train_loss` final de 0,4194.

El detalle metodologico mas relevante es el regimen de destilacion de racionalizacion: los objetivos se generaron disponiendo de la etiqueta de verdad fundamental, pero los prompts no contenian ninguna pista (el autor verifica 1 system prompt, 1 plantilla de instruccion y 0 filas con frases de pista, palabras de anormalidad o contexto del propio video). Es decir, se entrena al modelo para producir una justificacion detallada a partir de una entrada que no contiene la respuesta, lo cual es deliberado, pero implica un riesgo estructural de fabricacion de explicaciones plausibles.

## Capacidades

- Generacion de texto multimodal a partir de imagenes o fotogramas de video, en la modalidad `image-text-to-text`.
- Deteccion de cambios de estado centrados en objetos: emite JSON con la estructura `<state>{ "state_changes": [...] }</state>`.
- Razonamiento espacio-temporal sobre secuencias de 8 fotogramas muestreados de un clip, con resolucion limitada a 512 px de lado maximo.
- Uso como herramienta (`track`) dentro de una pipeline agentica: recibe una lista de objetos de la etapa previa (Stage 1) y devuelve los cambios de estado observados.
- Salida estructurada y parseable, lo que facilita su integracion en flujos automatizados.
- Capacidad de seguir instrucciones conversacionales heredada del modelo base `Qwen3-VL-32B-Instruct`.
- Soporte de tool calling nativo del modelo base: no confirmado en la informacion proporcionada para este adaptador.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo de razonamiento explicito (`thinking`) o capacidades de audio: no disponibles en la informacion proporcionada.

## Casos de uso

- Deteccion de anomalias fisicas en video de vigilancia: el adaptador analiza 8 fotogramas equiespaciados de un clip y devuelve que objetos han cambiado de estado, lo que permite senalar eventos como caidas, colisiones o manipulaciones indebidas sin depender de etiquetas en el prompt.
- Modulo `track` en la pipeline ST-VAD / VAD-RL: se integra como el componente que infiere la anormalidad desde los pixeles, encadenado tras una etapa de deteccion de objetos y antes de la etapa de decision, devolviendo JSON listo para el consumidor siguiente.
- Monitorizacion de seguridad en entorno industrial: a partir de camaras fijas, el modelo puede reportar cambios de estado de maquinaria, barreras o cargas (por ejemplo, una puerta que pasa de cerrada a abierta), con la salvedad de que el adaptador se entreno sobre un unico conjunto de datos fisicos.
- Anotacion asistida de conjuntos de datos de video: generacion automatica de descripciones de cambios de estado que despues se revisan por anotadores humanos, reduciendo el coste de etiquetado en corpus de video.
- Analisis de video en investigacion en fisica intuitiva: el modelo sirve como banco de pruebas para estudiar si un VLM de 33,6 B puede racionalizar estados fisicos a partir de fotogramas, comparando sus salidas con anotaciones de referencia.
- Verificacion de cumplimiento de procedimientos en video: comprobar secuencias de acciones esperadas (por ejemplo, colocacion de equipos de proteccion) detectando si el estado de los objetos cambia en el orden previsto.
- Preprocesado para sistemas de alerta en tiempo casi real: dado que el modelo trabaja con 8 fotogramas por clip y contextos de hasta 14.710 tokens, puede procesar fragmentos cortos de video en un pipeline por lotes y emitir alertas estructuradas consumibles por un sistema de reglas.
- Investigacion sobre destilacion de racionalizacion: su diseno sin pistas en el prompt lo convierte en un caso de estudio controlado para medir hasta que punto un modelo genera explicaciones fieles cuando no se le ha dado la respuesta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El autor indica explicitamente que la puerta de aceptacion prevista (histogramas de `severity` y `change_type` sobre video reservado frente a la distribucion objetivo) no se ha ejecutado. El unico dato cuantitativo de rendimiento disponible es la perdida de entrenamiento: 0,560 al inicio, 0,336 al final, con `train_loss` de 0,4194. Estos valores corresponden a entrenamiento, no a validacion, por lo que no permiten estimar capacidad de generalizacion.

## Requisitos de hardware

- Adaptador LoRA en solitario: aproximadamente 1,1 GB en disco (el tamano del repositorio).
- Modelo base en bf16: 33,6 B de parametros implican del orden de 67 GB solo en pesos, a los que hay que sumar cache KV y activaciones. Estimacion orientativa: 75-85 GB de VRAM para inferencia comoda en bf16.
- GPU recomendadas: H200 (la empleada en el entrenamiento) o H100 de 80 GB para bf16. Una A100 de 80 GB queda muy ajustada en bf16 con contextos largos.
- Cuantizacion a 8 bits: estimacion de 35-40 GB de VRAM, viable en A100 80 GB o H100 con holgura.
- Cuantizacion a 4 bits: estimacion de 18-24 GB de VRAM, lo que situaria el modelo, de forma teorica, al alcance de una RTX 4090 o RTX 3090 de 24 GB, siempre con contexto reducido y teniendo en cuenta que el autor no publica pesos cuantizados ni recetas de cuantizacion para este adaptador.
- Consumer GPU: no es viable en bf16. En GPU de consumo solo mediante cuantizacion de 4 bits no oficial y con reservas sobre la calidad de la torre de vision.
- Opciones de despliegue: la unica via documentada es `transformers` con `AutoModelForImageTextToText` + `PeftModel`, pasando explicitamente `Qwen/Qwen3-VL-32B-Instruct` como base. El autor indica que se puede llamar a `model.merge_and_unload()` para obtener un modelo bf16 plano si el cargador no entiende adaptadores. No hay pesos GGUF, por lo que llama.cpp u Ollama no son aplicables directamente. El soporte de vLLM o TGI para este adaptador concreto no esta confirmado en la informacion disponible.
- Latencia y throughput: no disponibles. El unico dato temporal es el coste de entrenamiento: 6 horas y 20 minutos en una H200 para 1.250 pasos.

## Comparativa con modelos similares

No se han encontrado en la busqueda web modelos comparables ni adaptadores equivalentes. La comparacion se limita al modelo base, usando los datos de la model card.

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `QiLong26/Qwen3-VL-32B-stage2-SFT-adapter` | 33,6 B base + 268 M entrenables | Entrenado a 16.384 | Adaptador LoRA especializado en cambios de estado | No disponible | HuggingFace, 0 descargas, 0 likes |
| `Qwen/Qwen3-VL-32B-Instruct` | 33,6 B | No disponible | Modelo multimodal de proposito general | No disponible en la informacion proporcionada | Modelo base publico |
| Adaptadores comparables de deteccion de anomalias en video | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks que permitan comparar el rendimiento del adaptador con el de su modelo base ni con alternativas de la misma categoria. La busqueda web realizada no devolvio resultados relevantes sobre este modelo.

## Limitaciones y advertencias

- Modelo no validado: el propio autor indica que la puerta de aceptacion no se ha ejecutado, por lo que no hay evidencia de que las salidas se ajusten a la distribucion objetivo en video reservado.
- Riesgo elevado de alucinacion estructural: los objetivos de entrenamiento se generaron con la etiqueta de verdad fundamental disponible mientras que los prompts no contenian ninguna pista. El modelo esta optimizado para producir una racionalizacion detallada a partir de entradas ambiguas, lo que puede dar lugar a cambios de estado plausibles pero falsos.
- Dominio muy restringido: entrenado sobre 4.999 filas de un unico conjunto (PhysAD), correspondientes a la particion `stage == "state"`. Es previsible un comportamiento degradado fuera de ese dominio, y se desconoce el grado de olvido catastrofico sobre las capacidades generales del modelo base.
- Entrada visual limitada: 8 fotogramas equiespaciados con lado maximo de 512 px, lo que implica 144 tokens de vision por fotograma. Movimientos rapidos o detalles finos pueden perderse entre fotogramas.
- Torre de vision sin adaptar: los 448 modulos LoRA no incluyen ningun modulo de la torre de vision, de modo que la representacion visual es exactamente la del modelo base.
- Limite de secuencia: `max_seq_len` de 16.384. El p99 de las secuencias de entrenamiento fue 11.077 tokens y el maximo 14.710, por lo que clips con muchas mas detecciones podrian superar el limite.
- Idioma: no disponible. Se desconoce que idiomas maneja y si las salidas JSON se mantienen estables fuera del idioma de entrenamiento.
- Licencia no disponible: sin licencia declarada no puede asumirse permiso para uso comercial. Es un riesgo legal relevante para cualquier despliegue en produccion.
- Dependencia del modelo base: la ruta del modelo base registrada en el adaptador es un directorio local de un cluster, por lo que es obligatorio pasar explicitamente `Qwen/Qwen3-VL-32B-Instruct` al cargar; de lo contrario la carga fallara.
- Sin pesos cuantizados publicados: cualquier despliegue en GPU de consumo exige cuantizar por cuenta propia, sin garantia de que la calidad se mantenga.
- Uso como componente de un sistema mayor: el adaptador espera una lista de objetos de la etapa 1. Usarlo de forma aislada, sin ese contexto, probablemente produzca salidas degradadas.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/QiLong26/Qwen3-VL-32B-stage2-SFT-adapter
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-32B-Instruct
- Paper, repositorio, blog o demo de la pipeline ST-VAD / VAD-RL: no disponible en la informacion proporcionada
- Resultados de busqueda web: no se han encontrado enlaces relevantes sobre este modelo; las busquedas devolvieron exclusivamente paginas sobre tarjetas de credito en India, sin relacion con el modelo.
