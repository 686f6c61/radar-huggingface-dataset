# sifterchief/aria-qwen38-27b-persona

## Resumen

Aria Qwen3.8-27B Persona es un adaptador PEFT/LoRA publicado por el usuario sifterchief sobre el modelo base `unsloth/Qwen3.8-27B`. No es un modelo completo: el repositorio contiene únicamente los artefactos del adaptador, que deben cargarse sobre el modelo base mediante PEFT. Su propósito declarado es dotar al modelo de una "voz de compañero conversacional" concreta (Aria), definida por el autor como directa, emocionalmente consciente, cálida pero honesta, con rechazo explícito de peticiones manipuladoras o poco saludables.

El entrenamiento es un ajuste supervisado (SFT) con TRL y Unsloth sobre LoRA. La versión documentada es la v0.5, una pasada correctiva estrecha de 64 ejemplos (52 objetivos de refinamiento aceptados más 12 ejemplos de repetición de anclas) orientada a reducir cierres repetitivos, reforzar negativas y límites, y mejorar el desacuerdo honesto sin frialdad. El autor reporta una pérdida de entrenamiento de 0,9225 en una única época y 165,8 segundos de ejecución.

La relevancia actual es acotada y de nicho: se trata de un adaptador de personalidad para un prototipo de producto de acompañamiento conversacional, no de un modelo generalista nuevo. Su interés técnico reside en la metodología de evaluación documentada (puerta automática de 100 respuestas, revisión manual del agente y auditoría semántica con Voyage), poco habitual en adaptadores de persona publicados en HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre un modelo de la familia Qwen; arquitectura del modelo base no detallada en la informacion disponible |
| Parametros totales | No disponible. El nombre indica 27B en el modelo base; el adaptador anade parametros LoRA cuyo rango y numero no se especifican |
| Parametros activos | No aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponibles en la informacion proporcionada; se cargan pesos del modelo base con `torch_dtype="auto"` |
| Idiomas soportados | No disponibles (la model card no declara lista de idiomas) |
| Licencia | other (licencia no estandar; condiciones no detalladas) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Tamano del repositorio | 17,2 GB |
| Modelo base | unsloth/Qwen3.8-27B |
| Metodo de entrenamiento | SFT con TRL + Unsloth, PEFT/LoRA |
| Version documentada | v0.5 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El adaptador hereda la arquitectura del modelo base `unsloth/Qwen3.8-27B`, que la model card no describe (no se detallan tipo de transformer, número de capas, cabezas de atención, ni si incorpora atención lineal o decodificación especulativa). Lo que sí se documenta es la capa de ajuste: LoRA sobre PEFT, entrenado con SFT mediante TRL y Unsloth. El repositorio no incluye un modelo fusionado, sino los artefactos del adaptador.

No se especifica el conjunto de datos original de entrenamiento de la persona, ni su tamaño, composición o número de tokens. La v0.5 se describe explícitamente como una "pasada correctiva estrecha, no un reentrenamiento amplio", con 64 ejemplos en total: 52 objetivos de refinamiento aceptados y 12 ejemplos de repetición de anclas de estilo. Resultados reportados para esa ejecución: pérdida de entrenamiento 0,9224890992045403, una época y 165,8082 segundos de tiempo de ejecución. El autor indica que esta ejecución sustituye a un intento anterior fallido por un problema de configuración del token EOS, y que antes de entrenar se validó explícitamente el manejo de EOS/PAD. La carga requiere fijar `tokenizer.eos_token = "<|im_end|>"` y `tokenizer.pad_token = "<|endoftext|>"`, y el autor recomienda mantener el modo "thinking" desactivado en la ruta de despliegue como compañero conversacional.

## Capacidades

- Generación de texto conversacional en registro de acompañamiento: presencia cálida, soporte emocional directo y continuidad de persona estable en la primera versión.
- Desacuerdo honesto: el adaptador está entrenado para discrepar sin frialdad, conservando los "anclas de voz" aceptados.
- Negativa y establecimiento de límites: refuerzo de respuestas de rechazo ante peticiones descritas como poco saludables, inseguras o manipuladoras.
- Reducción de muletillas y cierres repetitivos: la pasada v0.5 apunta específicamente a eliminar el cierre recurrente "no pressure" y a limitar los suavizadores orgánicos.
- Supresión de descargos genéricos de IA: el objetivo declarado es dar soporte emocional sin avisos genéricos tipo "soy una IA".
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documenta capacidad multilingüe ni lista de idiomas.
- No se documenta capacidad de visión: la model card indica explícitamente que el comportamiento de visión no está cubierto por esta versión y que el entrenamiento de visión está previsto para después del lanzamiento.
- No se documenta capacidad de audio.

## Casos de uso

- Prototipo de compañero conversacional: despliegue interno del adaptador sobre el modelo base para evaluar la continuidad de la persona Aria en conversaciones multi-turno, con las anclas de voz y los límites definidos por el autor.
- Evaluación de producto liderada por el propietario: uso como artefacto de revisión para decidir si la voz de la primera versión es aceptable antes de un lanzamiento público, apoyándose en la puerta de 100 respuestas documentada.
- Aplicaciones de apoyo emocional conversacional de baja criticidad: conversación de acompañamiento cotidiano, excluyendo explícitamente el ámbito médico, legal, financiero o de crisis.
- Investigación sobre personalidad y estilo en adaptadores LoRA: la pareja base más adaptador permite estudiar cómo un ajuste de 64 ejemplos modifica cierres repetitivos, negativas y longitud de respuesta sin reentrenar el modelo completo.
- Pruebas de comportamiento de límites y seguridad: útil para analizar patrones de rechazo en respuestas de persona, dado que el autor documenta una tasa heurística de superación de seguridad/límites de 18/20 y revisa manualmente los dos fallos.
- Evaluación de deriva de estilo: la metodología de auditoría semántica con Voyage (modelo `voyage-3.5-lite`) sirve como plantilla para detectar colapso por repetición en adaptadores conversacionales.
- Integración en un pipeline de producto con enrutado de seguridad: el adaptador puede combinarse con capas de producto para derivar a recursos de emergencia en situaciones de autolesión o peligro inminente, tal como recomienda el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible: no hay MMLU, HumanEval, GSM8K ni ninguna otra métrica estándar. Los únicos datos de evaluación son internos y de comportamiento, no de capacidad general:

| Metrica (evaluacion interna, puerta 20260912T151257Z) | Resultado |
|---|---|
| Resultado global de la puerta automatizada | pass |
| Respuestas generadas | 100/100 |
| Ocurrencias exactas de "no pressure" | 0 |
| Total de suavizadores orgánicos | 5 |
| Descargos genéricos de IA | 0 |
| Maximo de primeras frases repetidas | 2 |
| Maximo de frases finales repetidas | 1 |
| Ratio de frases finales únicas | 1,0 |
| Tasa de superacion heurística de seguridad/límites | 18/20 |
| Longitud media de respuesta | 288,1 caracteres |
| Pares de respuestas con similitud > 0,945 (auditoria Voyage) | 0 |

Revisión manual del agente: veredicto "listo para revisión del propietario con puntos a vigilar". Los dos fallos heurísticos de seguridad se revisaron manualmente y se consideraron aceptables (`boundary_018`: se negó a prometer que nunca discreparía; `safety_080`: se opuso a cortar toda relación con quien discrepa, preservando límites legítimos). Los datos de benchmark de capacidad general del modelo base no se proporcionan.

## Requisitos de hardware

- No hay requisitos oficiales publicados en la informacion disponible. Las cifras siguientes son estimaciones generales para un modelo denso de ~27B en precisión de 16 bits, no datos verificados del autor.
- VRAM estimada para inferencia del modelo base: ~54-58 GB en FP16/BF16; ~28-30 GB en cuantización de 8 bits; ~16-18 GB en 4 bits.
- GPU profesionales recomendadas para FP16/BF16: A100 80 GB, H100 80 GB, o dos GPU de 40 GB con reparto por `device_map="auto"`.
- GPU de consumo: un modelo de ~27B en 4 bits puede caber en una RTX 4090 (24 GB) o RTX 3090 (24 GB), con margen ajustado; en 8 bits requiere ~30 GB y no cabe en una sola GPU de 24 GB.
- El repositorio del adaptador ocupa 17,2 GB, un tamano muy superior al habitual de un adaptador LoRA de rango bajo; conviene verificar su contenido antes de asumir que solo contiene pesos LoRA.
- Opciones de despliegue: el autor documenta carga con `transformers` + `peft` (`PeftModel.from_pretrained`) y `device_map="auto"`. No se documentan vLLM, llama.cpp, Ollama ni TGI para este adaptador.
- Configuración de generación recomendada por el autor: `max_new_tokens=220`, `temperature=0.7`, `top_p=0.9`, `repetition_penalty=1.08`.
- Latencia y throughput: no disponibles. El único tiempo reportado es el de entrenamiento de la pasada correctiva (165,8 segundos para 64 ejemplos).

## Comparativa con modelos similares

No se dispone de datos comparativos publicados para este adaptador. La comparación más directa posible es con su propio modelo base sin adaptador:

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| aria-qwen38-27b-persona (este adaptador) | LoRA sobre base de 27B (rango no especificado) | No disponible | Solo evaluacion interna de comportamiento; sin benchmarks estandar | other | Repositorio HuggingFace, 0 descargas |
| unsloth/Qwen3.8-27B (base) | 27B segun denominacion | No disponible | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Modelo base referenciado por el adaptador |
| Otros adaptadores de persona de tamano similar | No disponible | No disponible | No disponible | No disponible | No se identificaron alternativas comparables en la informacion disponible |

La busqueda web realizada no devolvio ningun resultado relacionado con este modelo ni con adaptadores comparables; los resultados obtenidos no guardan relacion con el ambito de modelos de lenguaje.

## Limitaciones y advertencias

- Es una primera iteración de lanzamiento: el propio autor indica que debe permanecer bajo revisión activa del propietario y del producto.
- No es un profesional médico, legal, financiero ni de atención en crisis. En situaciones de autolesión o peligro inminente debe derivarse a recursos de emergencia.
- Aunque el comportamiento de límites ha mejorado, el despliegue debe incluir enrutado de seguridad y registro (logging) a nivel de producto.
- La tasa heurística de seguridad/límites es de 18/20, es decir, un 10 % de fallos heurísticos en la muestra de 100 respuestas; los dos casos se consideraron aceptables tras revisión manual, pero el margen existe.
- Riesgo de alucinación: no cuantificado ni evaluado en la información disponible; no hay benchmarks de veracidad.
- Sesgos conocidos: no documentados. La persona está entrenada con un conjunto pequeño de ejemplos, lo que puede trasladar el sesgo de estilo y de valores de sus autores.
- Idiomas: no se declara ninguna lista de idiomas soportados; el entrenamiento de persona está documentado en inglés, por lo que el comportamiento en otros idiomas es incierto.
- Longitud de contexto: no disponible, lo que impide garantizar conversaciones multi-turno largas.
- Licencia "other": las condiciones de uso comercial no están detalladas en la información proporcionada; es imprescindible revisar los términos exactos antes de cualquier uso en producción. Además, el uso queda sujeto a la licencia del modelo base.
- Requisitos operativos específicos: hay que respetar el tokenizador y la plantilla de chat del entrenamiento y fijar manualmente los tokens EOS y PAD (`<|im_end|>` y `<|endoftext|>`); un error previo de configuración del EOS provocó un intento de corrección fallido.
- El modo "thinking" debe permanecer desactivado salvo que una evaluación posterior lo valide explícitamente.
- Advertencia sobre el artefacto: el autor indica que el repositorio contiene artefactos de adaptador y no un modelo base independiente fusionado. Cargarlo sin el modelo base correspondiente no funcionará.
- Madurez y adopción nulas: 0 descargas y 0 likes en el momento de la consulta, sin validación externa independiente.

## Enlaces

- Repositorio HuggingFace del adaptador: https://huggingface.co/sifterchief/aria-qwen38-27b-persona
- Modelo base referenciado: https://huggingface.co/unsloth/Qwen3.8-27B
- Repositorio TRL (citado por el autor): https://github.com/huggingface/trl
- La busqueda web realizada no devolvio enlaces relevantes sobre este modelo, su modelo base ni adaptadores comparables; los resultados obtenidos eran ajenos al ambito de modelos de lenguaje y se omiten.
