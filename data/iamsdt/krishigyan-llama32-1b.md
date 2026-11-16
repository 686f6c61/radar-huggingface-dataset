# iamsdt/krishigyan-llama32-1b

## Resumen

KrishiGyan Llama-3.2-1B es un ajuste fino mediante LoRA del modelo meta-llama/Llama-3.2-1B-Instruct, desarrollado por Shudipto Trafder (10xScale.ai) y Aparna Roy (Universidad de Khulna) para responder preguntas sobre agricultura bangladesí en bengalí. El modelo aborda un problema de nicho: la escasez de asistentes especializados en un idioma de bajos recursos como el bengalí, aplicados a un dominio tecnico como la agronomia local, con variedades de cultivo, dosis de fertilizantes, calendarios de riego y practicas adaptadas a las condiciones de Bangladesh.

Se trata de un adaptador LoRA de aproximadamente 0,2 GB sobre una base causal de 1.000 millones de parametros, entrenado con QLoRA supervisado sobre el conjunto de datos KrishiGyan (4.490 pares pregunta-respuesta de entrenamiento, 249 de validacion y 249 de test). El modelo esta pensado para inferencia rapida en hardware modesto y para su integracion en asistentes agricolas de campo, aunque el propio autor advierte que el bengali no es un idioma oficialmente soportado por Llama 3.2, por lo que la fluidez es inferior a la de su variante basada en Gemma.

Su relevancia actual radica en la combinacion de tres factores: especializacion de dominio verificable (fuentes de BARI, BRRI, DAE, SRDI y Banglapedia), coste de despliegue minimo y publicacion de metricas completas por categoria y dificultad en el propio repositorio. El articulo asociado ha sido aceptado en IEEE PEEIACON 2026, aunque aun no esta publicado en IEEE Xplore.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (Llama 3.2), ajuste fino mediante LoRA (QLoRA) |
| Parametros totales | 1.000 millones (modelo base); el adaptador LoRA es una fraccion del total (repo de 0,2 GB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (la configuracion de entrenamiento usa `max_seq_length=2048` en el ejemplo de Unsloth) |
| Tipos de cuantizacion | Entrenamiento sobre base bnb-4bit; el adaptador se puede fusionar y convertir a GGUF para cuantizaciones de llama.cpp |
| Idiomas soportados | Bengalí (bn) |
| Licencia | Llama 3.2 Community License (heredada del modelo base), sujeta ademas a la Acceptable Use Policy de Meta |
| Formato de pesos | safetensors (adaptador PEFT/LoRA en el subdirectorio `adapter/`); convertible a GGUF tras fusion |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA entrenado sobre meta-llama/Llama-3.2-1B-Instruct, un transformer causal decoder-only de 1.000 millones de parametros. El ajuste se realizo con QLoRA supervisado (base cuantizada en 4 bits mediante bitsandbytes y el framework Unsloth) y con objetivos de entrenamiento limitados exclusivamente a la respuesta final: los pares utilizados son pregunta → respuesta final, descartando las trazas de razonamiento que incluye el dataset. El adaptador conserva el tokenizador y la plantilla de chat del modelo base, y la instruccion de sistema en bengali se inserta dentro del turno del usuario, seguida del prefijo `প্রশ্ন:`.

Los datos de entrenamiento provienen del dataset KrishiGyan, con 4.490 entradas de entrenamiento, 249 de validacion y 249 de test retenido, con particiones estratificadas por categoria y semilla 42. El conjunto cubre ocho categorias: produccion y proteccion de cultivos; gestion de suelo y nutrientes; tecnologia e innovacion; agua, riego y clima; ganaderia y pesca; investigacion, educacion y extension; economia, politica y ciencias sociales; y agricultura organica y sostenible. Cada entrada incluye metadatos de dificultad, temporada, tema y fuente, y el contenido esta fundamentado en publicaciones de BARI, BRRI, DAE, SRDI, Banglapedia y otras instituciones bangladesies. No se documentan fases de RLHF ni DPO, ni innovaciones arquitectonicas adicionales mas alla del ajuste LoRA.

## Capacidades

- Generacion de texto en bengali especializada en dominio agricola: respuestas practicas sobre enfermedades de cultivos, dosis de fertilizantes, riego, ganaderia, pesca, manejo poscosecha y mercados.
- Respuesta a preguntas de un solo turno con formato fijo de instruccion de sistema mas prefijo `প্রশ্ন:`; el rendimiento optimo requiere respetar ese formato.
- Adaptacion al contexto bangladesi: temporadas, variedades locales y condiciones agroclimaticas del pais.
- Generacion con muestreo configurable (temperatura, top-p, penalizacion por repeticion) y longitud de salida controlable (`max_new_tokens`).
- Capacidad de fusion del adaptador con la base para producir un modelo standalone y convertirlo a GGUF para despliegue en llama.cpp, Ollama o LM Studio.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision, audio ni modo de razonamiento explicito.
- Capacidades multilingues limitadas al bengali; el propio autor advierte de fluidez inferior a la variante Gemma por no ser bengali un idioma oficial de Llama 3.2.

## Casos de uso

- Asistencia a agricultores via mensajeria o voz: el modelo responde en bengali a preguntas sobre dosis de fertilizante o riego, con un tamano de 1B que permite ejecucion en un servidor modesto o incluso en dispositivos con recursos limitados para despliegues de campo.
- Extension agraria digital: integracion en portales de las direcciones de extension (DAE) para responder consultas frecuentes sobre variedades, calendarios de siembra y manejo de plagas, usando las respuestas como primer nivel de atencion antes de derivar a un tecnico.
- Sistemas de alerta temprana de plagas: el modelo puede generar explicaciones en bengali sobre sintomas y tratamientos para plagas concretas (por ejemplo, el saltamontes marron en arroz aman), integrado en un pipeline que recibe la deteccion de un clasificador de imagenes.
- Soporte a tecnicos de campo: consulta rapida de recomendaciones tecnicas y buenas practicas durante visitas a explotaciones, con respuestas breves y adaptadas al contexto local.
- Formacion y divulgacion: generacion de material didactico en bengali sobre agricultura organica, gestion de suelos o economia agraria, a partir de las ocho categorias cubiertas por el dataset.
- Prototipado e investigacion en PLN de bajos recursos: como punto de partida para experimentos de ajuste fino en bengali o para comparar estrategias de adaptacion LoRA sobre modelos de 1B en dominios especializados.
- Despliegue en entornos con conectividad limitada: tras fusion y conversion a GGUF, el modelo puede ejecutarse en local con llama.cpp u Ollama, sin dependencia de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye un directorio `metrics/` con predicciones por ejemplo y puntuaciones por categoria y dificultad, pero los valores numericos no se detallan en la model card proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2-3 GB en cuantizacion de 4 bits (base bnb-4bit mas adaptador), y en torno a 4-6 GB en bf16/fp16 para el modelo fusionado de 1B (estimacion a partir del tamano del modelo base; no confirmada en la informacion proporcionada).
- GPU recomendadas: cualquier GPU consumer con al menos 6-8 GB de VRAM para bf16; RTX 3060, RTX 4060, RTX 4090 o superiores. Para 4 bits, GPUs con 4 GB o mas. En servidor, A100 o H100 no son necesarias por el reducido tamano, aunque pueden usarse para alto throughput.
- Cabe en GPU consumer: si, en la mayoria de GPUs modernas con 4-8 GB de VRAM; tambien es viable en CPU mediante llama.cpp tras conversion a GGUF.
- Opciones de despliegue: Transformers + PEFT, Unsloth (4 bits), llama.cpp, Ollama y LM Studio tras fusionar y convertir a GGUF. No se documenta soporte explicito de vLLM o TGI para el adaptador, aunque el modelo fusionado deberia ser compatible con ellos.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Notas |
|---|---|---|---|---|---|
| KrishiGyan Llama-3.2-1B | 1B (adaptador LoRA) | No disponible | Bengalí | Llama 3.2 Community | Especializado en agricultura bangladesí; ajuste LoRA sobre Llama 3.2 |
| Llama-3.2-1B-Instruct (base) | 1B | No disponible en la informacion | Multilingue (bengali no oficial) | Llama 3.2 Community | Modelo generalista; menor especializacion y fluidez en bengali segun el autor |
| Variante Gemma de KrishiGyan | No disponible | No disponible | Bengalí | No disponible | Mencionada por el autor como referencia de mayor fluidez en bengali; sin datos publicos en la informacion |

No se dispone de datos de benchmarks que permitan una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Fluidez limitada en bengali: el autor advierte explicitamente que Llama 3.2 no soporta oficialmente el bengali y que la calidad es inferior a la variante basada en Gemma.
- Dependencia del formato: el modelo fue entrenado con una instruccion de sistema fija dentro del turno del usuario y el prefijo `প্রশ্ন:`; desviarse de ese formato puede degradar la calidad de las respuestas.
- Riesgo de alucinacion en recomendaciones agronomicas: aunque el dataset esta fundamentado en fuentes institucionales, el modelo puede generar dosis, tratamientos o variedades incorrectas; en un dominio con impacto directo sobre cultivos y medios de vida, las respuestas requieren validacion por tecnicos.
- Cobertura limitada al dominio y al contexto bangladesi: las recomendaciones estan pensadas para temporadas, variedades y condiciones de Bangladesh, y pueden no ser transferibles a otros paises o sistemas agrarios.
- Sesgos potenciales derivados de las fuentes del dataset (instituciones bangladesies) y de la distribucion de temas en el conjunto de entrenamiento.
- Restricciones de licencia: hereda la Llama 3.2 Community License y la Acceptable Use Policy de Meta; el uso comercial esta sujeto a los terminos de dicha licencia, que deben revisarse antes de un despliegue en produccion.
- Modelo de 1B: capacidad de razonamiento y de manejo de contexto limitada en comparacion con modelos mayores; no adecuado para tareas complejas de razonamiento multi-paso.
- Sin soporte documentado de tool calling ni de agentes, lo que limita su integracion en flujos automatizados que requieran llamadas a funciones.
- Estado de publicacion: el articulo asociado esta aceptado en IEEE PEEIACON 2026 pero aun no publicado; las metricas completas estan en el repositorio pero no se han verificado de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iamsdt/krishigyan-llama32-1b
- Dataset KrishiGyan: https://huggingface.co/datasets/AROY76/KrishiGyan
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- Base cuantizada usada en entrenamiento: https://huggingface.co/unsloth/Llama-3.2-1B-Instruct-bnb-4bit
- Licencia Llama 3.2: https://www.llama.com/llama3_2/license/
- Politica de uso aceptable de Meta: https://www.llama.com/llama3_2/use-policy/
- 10xScale.ai: https://10xscale.ai
