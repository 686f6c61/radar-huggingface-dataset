# liftkkkk/ask-the-author-0.8b-gguf

## Resumen

ask-the-author-0.8b-gguf es una version cuantizada en formato GGUF de un modelo de lenguaje de 0,8 mil millones de parametros (772.845.888 parametros reales), afinado por el usuario liftkkkk a partir de la base Qwen3.5-0.8B. El modelo esta especializado en responder preguntas sobre el contenido de un libro titulado «图原生智能体» (en chino, «agente nativo de grafos»), actuando como una suerte de «memoria» del texto: se le pide que recite fielmente pasajes originales a partir del numero y titulo de capitulo. El caso de uso es, por tanto, muy concreto y de nicho: consulta conversacional sobre una obra editorial concreta.

Tecnicamente es relevante por dos motivos. Primero, emplea la arquitectura Qwen3.5 hibrida, que combina capas de atencion lineal con capas de atencion completa, lo que reduce coste computacional en contextos largos. Segundo, conserva los pesos de MTP (Multi-Token Prediction) del modelo base, lo que permite decodificacion especulativa en motores que la soportan, con un pequeno penalizacion de tasa de aceptacion por el desajuste introducido por el LoRA de ajuste fino.

El repositorio ofrece tres niveles de cuantizacion (bf16, Q8_0 y Q4_K_M) y esta pensado para despliegue local sencillo mediante llama.cpp, LM Studio u Ollama, con un peso en disco que va de 505 MB a 1,5 GB. La licencia es Apache 2.0 y el unico idioma declarado es el chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 hibrida (`QWEN35`): capas de atencion lineal + capas de atencion completa |
| Parametros totales | 772.845.888 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, Q8_0, Q4_K_M |
| Idiomas soportados | chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); pesos base en safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B, un transformer hibrido que alterna capas de atencion lineal con capas de atencion completa, una combinacion disenada para reducir el coste de atencion cuadratico en secuencias largas manteniendo calidad. Sobre esa base se aplico un ajuste fino con LoRA orientado a memorizar y recitar el contenido del libro «图原生智能体». El autor indica que el LoRA no modifica los pesos de MTP del modelo base.

La conversion a GGUF se realizo con el script `convert_hf_to_gguf.py` de llama.cpp en la build b12144, y la cuantizacion con `llama-quantize.exe` (build b12144 para Windows con CUDA 13.4). Se introdujeron dos ajustes de plantilla: se elimino la insercion de un bloque `<think>` vacio en `add_generation_prompt` (para alinear con la distribucion de entrenamiento del LoRA) y se inyecto una persona por defecto cuando no se proporciona mensaje de sistema. Ademas, se reinyectaron 15 tensores `mtp.*` (`blk.24.nextn.*`: eh_proj, enorm, hnorm, shared_head_norm) mediante `inject_mtp_weights.py`, ya que el merge de transformers los descartaba; el metadato `qwen35.nextn_predict_layers = 1` queda registrado en el GGUF para que los motores con decodificacion especulativa MTP puedan detectarlo y activarlo.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional en chino, orientada a responder preguntas sobre el contenido de un libro concreto.
- Recitacion fiel de pasajes a partir de numero y titulo de capitulo (tarea de «memoria» del texto).
- Modo de razonamiento con cadena `<think>`, que llama.cpp renderiza automaticamente como contenido de razonamiento.
- Persona por defecto integrada en la plantilla de chat: funciona sin mensaje de sistema; un mensaje de sistema personalizado la sobrescribe.
- Decodificacion especulativa mediante MTP (Multi-Token Prediction) en motores que la soportan.
- Soporte de API compatible con OpenAI a traves de `llama-server`.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision ni audio.
- Capacidad multilingue limitada al chino segun la model card.

## Casos de uso

- Consulta editorial interactiva: un lector pregunta por el contenido de un capitulo concreto y el modelo recita el pasaje correspondiente, gracias al ajuste fino sobre el texto del libro y a la persona por defecto integrada en la plantilla.
- Demo de libro vivo («Live Book»): integracion en una web o aplicacion de lectura que ofrece un chat con la obra, desplegable con `llama-server` y cualquier cliente compatible con OpenAI (Open WebUI, Cherry Studio).
- Asistente de estudio de la obra: el lector pide resumenes o aclaraciones de secciones citando capitulo y titulo, con temperatura 0 para maxima fidelidad al texto.
- Despliegue en dispositivo de bajos recursos: la variante Q4_K_M (505 MB) cabe en telefonos y equipos con poca VRAM, lo que permite llevar la consulta del libro offline.
- Prototipado de asistentes especializados en un corpus: sirve como referencia de como ajustar un modelo de 0,8B para memorizar un documento y empaquetarlo en GGUF para distribucion.
- Evaluacion de decodificacion especulativa MTP: util para probar en llama.cpp el rendimiento de la prediccion multi-token con pesos MTP conservados frente a un modelo sin ellos.
- Generacion creativa controlada: con temperatura 0,6 el autor sugiere usarlo para tareas de creacion relacionadas con el universo del libro.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,5 GB para bf16, 775 MB para Q8_0 y 505 MB para Q4_K_M, mas el overhead del runtime.
- Cabe en cualquier GPU de consumo moderna (por ejemplo, RTX 3060, RTX 4060, RTX 4090) e incluso en equipos sin GPU dedicada mediante CPU.
- Despliegue recomendado con llama.cpp (`llama-cli` o `llama-server`), LM Studio (probado con el motor 2.67.0, equivalente a llama.cpp b11999) y Ollama mediante Modelfile.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| ask-the-author-0.8b-gguf | 772.845.888 | no disponible | zh | Apache 2.0 | GGUF | Ajuste fino LoRA sobre Qwen3.5-0.8B para un libro concreto; incluye pesos MTP |
| Qwen3.5-0.8B (base) | ~0,8B | no disponible | multilingue | no disponible en la informacion | safetensors | Modelo generalista del que deriva; sin especializacion en un corpus |
| Modelos GGUF de ~1B para chat local | ~1B | variable | variable | variable | GGUF | Alternativas genericas de proposito general; no disponibles datos concretos de comparacion |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de nicho: esta entrenado para recitar un libro concreto; su utilidad fuera de ese corpus es muy limitada y puede producir respuestas irrelevantes en dominios generales.
- Riesgo de alucinacion elevado al pedirle contenido que no esta en el libro o al forzar preguntas fuera de su distribucion de entrenamiento.
- Solo declara soporte de chino; no se garantiza calidad en castellano ni en otros idiomas.
- Longitud de contexto no documentada: conviene no asumir ventanas largas sin verificacion empirica.
- La tasa de aceptacion de la decodificacion especulativa MTP puede ser inferior a la del modelo base por el desajuste introducido por el LoRA, aunque la correccion del resultado no se ve afectada.
- La licencia Apache 2.0 permite uso comercial, pero el contenido del libro memorizado puede estar sujeto a derechos de autor propios; el usuario debe verificar la legalidad de redistribuir el texto recitado.
- El modelo no documenta soporte de tool calling ni de agentes multi-paso, por lo que no es adecuado para pipelines de automatizacion complejos.
- Requiere motores que soporten la arquitectura `qwen35`; versiones antiguas de llama.cpp o LM Studio pueden no cargarlo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/liftkkkk/ask-the-author-0.8b-gguf
- llama.cpp (herramienta de conversion y cuantizacion): https://github.com/ggml-org/llama.cpp
- LM Studio: https://lmstudio.ai/
- Ollama: https://ollama.com/
