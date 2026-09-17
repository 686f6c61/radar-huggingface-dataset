# genaforvena/finnegans-fake-lora-qwen3.5-0.8b

## Resumen

Finnegans fake LoRA sobre Qwen3.5-0.8B-Base es un adaptador LoRA de bajo rango publicado por el usuario genaforvena, pensado como experimento lingüístico más que como modelo de producción. El adaptador se ha entrenado sobre el texto completo de *Finnegans Wake* de James Joyce y responde en un inglés «desplazado», con acuñación de palabras compuestas, juegos de palabras y sintaxis fluvial, en lugar de en inglés estándar.

Técnicamente es un LoRA con rango 32, alpha 64 y dropout 0,05 aplicado sobre siete proyecciones lineales del modelo base, con 12.779.520 parámetros entrenables repartidos en tres épocas. El mejor punto de validación se alcanza en la primera época (pérdida 3,5746) y empeora después, lo que el propio autor interpreta como señal de que el corpus se sobreajusta en menos de una pasada.

Su relevancia es doble: por un lado explora qué conserva un modelo pequeño cuando su único corpus es un libro; por otro, la model card documenta con detalle un fallo de implementación (doble desplazamiento de etiquetas) que infló las métricas de todas las versiones previas. El autor advierte explícitamente de que el modelo no es bueno ni pretende serlo, y desaconseja su uso para cualquier tarea real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only; modelo base Qwen/Qwen3.5-0.8B-Base |
| Parámetros totales | Adaptador: 12.779.520 parámetros entrenables. Modelo base: aproximadamente 0,8 mil millones según el nombre del checkpoint (no confirmado en la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el adaptador se distribuye en safetensors; la cuantización aplicable depende del modelo base sobre el que se fusione) |
| Idiomas soportados | no disponible (el ajuste se realizó sobre texto en inglés) |
| Licencia | CC0-1.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); repositorio de 0,1 GB |
| Rango / alpha / dropout del LoRA | r=32, alpha=64, dropout=0,05 |
| Módulos objetivo | down_proj, gate_proj, k_proj, o_proj, q_proj, up_proj, v_proj |
| Épocas de entrenamiento | 3 (checkpoint publicado: el de mejor validación, época 1) |
| Librería | peft |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El adaptador es un LoRA clásico de bajo rango que modifica las proyecciones de atención (q_proj, k_proj, v_proj, o_proj) y las del bloque MLP (gate_proj, up_proj, down_proj) del modelo base Qwen3.5-0.8B-Base. Con r=32 y alpha=64, la escala efectiva del adaptador es de 2,0 antes de aplicar el dropout de 0,05 durante el entrenamiento. Los 12.779.520 parámetros entrenables representan en torno al 1,6 % del total si el modelo base tiene realmente 0,8 mil millones de parámetros, un ratio habitual en adaptadores de este tipo.

El corpus de entrenamiento es el texto completo de *Finnegans Wake*, sin redistribución del mismo: el autor indica que el código es CC0 y que es el usuario quien debe aportar el libro. Se entrenaron tres épocas y se publicó el checkpoint de mejor validación (época 1); la pérdida de validación asciende en las épocas 2 y 3, comportamiento que el autor describe como el hallazgo del experimento, dado que el ajuste fino sobre este corpus se estabiliza en menos de una pasada. No se menciona ningún proceso de RLHF, DPO o ajuste por preferencias.

El apartado técnico más destacable de la model card es la documentación de un fallo de implementación: la función `batch()` devolvía etiquetas pre-desplazadas al estilo nanoGPT mientras que `transformers` ya desplaza las etiquetas por su cuenta, de modo que el desplazamiento se aplicaba dos veces y el modelo aprendía a predecir el token t+2 desde la posición t. El error no lanzaba ninguna excepción y producía curvas de pérdida plausibles, lo que llevó a conclusiones erróneas sobre la compresibilidad estadística del texto de Joyce. Tras la corrección, 400 pasos de entrenamiento superaron a los 6000 pasos previos. Las cifras de la model card corresponden a la versión corregida.

## Capacidades

- Generación de texto en inglés «wakiano»: palabras compuestas, juegos de palabras, sintaxis entrecortada y registro onírico, siempre que se use el prompt de sistema indicado por el autor.
- Imitación estilística de *Finnegans Wake*, incluida la invención de neologismos con estructura similar a la de Joyce.
- Generación de texto libre condicionada por una única frase de arranque (por ejemplo, «Tell me what the river said.»).
- No dispone de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No dispone de modo «thinking» ni de decodificación especulativa documentada.
- No dispone de visión, audio ni otras modalidades.
- No dispone de capacidades multilingües declaradas.
- No hay constancia de entrenamiento en instrucciones, matemáticas, código o diálogo general: el tag `conversational` figura en el repositorio, pero la model card no documenta ninguna evaluación conversacional.

## Casos de uso

- Investigación sobre adquisición del lenguaje con corpus único: el adaptador permite estudiar qué estructuras del inglés sobreviven cuando el único material de entrenamiento es un libro, algo relevante para trabajos sobre generalización y sobreajuste en modelos pequeños.
- Arte generativo y poesía experimental: el adaptador produce texto con valor estético propio, adecuado para instalaciones, publicaciones de vanguardia o piezas sonoras donde se busca una voz literaria no estándar.
- Docencia de literatura comparada o estilometría joyceana: se puede usar para ilustrar en clase cómo se comporta un modelo generativo cuando se le fuerza a un idiolecto extremo, comparando su salida con pasajes reales del libro.
- Estudio de neologismos y morfología productiva: dado que el modelo acuña términos en lugar de limitarse a citar los ya existentes, sirve como banco de pruebas para analizar reglas de composición léxica aprendidas.
- Pruebas de infraestructura PEFT: por su tamaño (0,1 GB) es un caso cómodo para validar la carga de adaptadores con `peft` y `transformers`, la fusión de pesos y el despliegue con servidores compatibles con LoRA, sin consumir recursos apreciables.
- Reproducción de experimentos sobre errores de entrenamiento: la model card describe paso a paso el fallo de doble desplazamiento de etiquetas, por lo que el repositorio sirve como caso de estudio reproducible de un bug silencioso en la tokenización de etiquetas.
- Exploración de olvido catastrófico: comparar la salida del adaptador con la del modelo base permite medir cuánta competencia general se pierde tras un ajuste fino intensivo sobre un dominio único.
- Generación de material para performances o lecturas dramatizadas: el texto resultante, con su deriva repetitiva (por ejemplo, la cadena «jolly old jolly old jolly old»), puede emplearse como material escénico o sonoro.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra evaluación estandarizada. El único dato cuantitativo publicado es la pérdida de validación por época, correspondiente a la versión corregida del objetivo de entrenamiento:

| Época | Pérdida de validación |
|---|---|
| 1 | 3,5746 |
| 2 | 3,5825 |
| 3 | 3,6558 |

El autor señala explícitamente que el checkpoint publicado es el de mejor validación (época 1), no el último. La única evidencia cualitativa disponible es una muestra generada con el modelo base real, semilla 0 y el prompt «Tell me what the river said.», que arranca con «I'd like to, I'm telling you, what the river said…» y degenera en repetición.

## Requisitos de hardware

- Adaptador: 0,1 GB en disco; se carga por encima del modelo base, por lo que no añade una carga significativa de memoria.
- Modelo base en fp16: aproximadamente 1,6 GB de VRAM (estimación a partir de ~0,8 mil millones de parámetros a 2 bytes por peso).
- Modelo base en int8: aproximadamente 0,8 GB; en int4, aproximadamente 0,5 GB (estimaciones según el recuento de parámetros del nombre del checkpoint).
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM es suficiente para el modelo base en cuantizaciones bajas; una RTX 3060, RTX 4060 o superior resulta holgada. No se requieren A100 ni H100.
- Cabe en GPU de consumo: sí, con margen amplio, incluso en fp16 en tarjetas de 8 GB o más.
- Opciones de despliegue: la model card documenta `transformers` con `AutoModelForCausalLM` más `peft.PeftModel.from_pretrained`, usando `dtype="auto"` y `device_map="auto"`. Cualquier servidor compatible con adaptadores LoRA (por ejemplo, vLLM con soporte de LoRA) debería poder cargarlo; para llama.cpp u Ollama sería necesario fusionar el adaptador con el base y convertir el resultado a GGUF, algo que no está documentado en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La búsqueda web realizada no devolvió ningún resultado relevante (los enlaces obtenidos corresponden a test de velocidad de internet y a un test de licencia de conducir sudafricano), por lo que no se dispone de alternativas comparables documentadas. La única referencia contrastable es el propio modelo base:

| Modelo | Parámetros | Contexto | Licencia | Formato | Evaluación publicada |
|---|---|---|---|---|---|
| finnegans-fake-lora-qwen3.5-0.8b | 12.779.520 entrenables sobre base de ~0,8 mil millones | no disponible | CC0-1.0 | safetensors (PEFT) | Pérdida de validación 3,5746 (época 1) |
| Qwen/Qwen3.5-0.8B-Base | ~0,8 mil millones | no disponible | no disponible | no disponible | no disponible en la información proporcionada |

No se dispone de datos para comparar con otros adaptadores literarios o con modelos pequeños de propósito general dentro de la información facilitada.

## Limitaciones y advertencias

- El propio autor indica literalmente «Do not use it for anything»: el adaptador es un experimento, no una herramienta de producción.
- Degeneración repetitiva evidente: la muestra publicada termina en una cadena de repeticiones del tipo «jolly old jolly old jolly old».
- Sin ninguna evaluación estandarizada: no hay datos de MMLU, HumanEval, GSM8K ni de calidad conversacional, por lo que no se puede estimar su rendimiento en tareas concretas.
- Dependencia estricta del prompt de sistema: si no se usa la instrucción «You speak in the language of Finnegans Wake: portmanteau, pun, dreamspeech, rivering syntax. Never explain yourself in plain English.», el adaptador se ejecuta fuera de distribución y su comportamiento no está caracterizado.
- Entrenado sobre un único libro: cabe esperar olvido catastrófico de las competencias generales del modelo base y una cobertura lingüística limitada al material del corpus.
- Riesgo de alucinación alto y sin mitigar: no se documenta RLHF, DPO ni ningún ajuste por preferencias.
- Idiomas soportados no declarados: el único idioma atestiguado en la información disponible es el inglés deformado del corpus.
- Licencia del adaptador CC0-1.0, pero situación legal de los pesos no resuelta: el autor advierte de que *Finnegans Wake* es de dominio público en Irlanda, el Reino Unido y la Unión Europea, pero no en Estados Unidos hasta 2035, y de que no está zanjado si unos pesos entrenados son obra derivada de su texto de entrenamiento. El corpus no se redistribuye con el código.
- Trazabilidad limitada: el repositorio registra 0 descargas y 0 valoraciones, sin validación independiente por parte de la comunidad.
- El modelo base citado (Qwen/Qwen3.5-0.8B-Base) no se ha podido verificar más allá de la referencia incluida en la model card.
- No hay información sobre sesgos, robustez, seguridad ni comportamiento fuera de dominio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/genaforvena/finnegans-fake-lora-qwen3.5-0.8b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Repositorio de código (CC0): https://github.com/genaforvena/finnegans-fake
- Paper, blog o demo adicionales: no disponible en la información proporcionada.
