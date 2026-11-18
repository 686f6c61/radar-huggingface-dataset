# root-sys-n/Mima-1.5-Pico-15m-Preview

## Resumen

Mima 1.5 Pico 15M Preview es un modelo de lenguaje causal de muy pequeno tamano (15.537.792 parametros) desarrollado por el usuario root-sys-n, especializado en generacion de texto en turco. Se trata de un ajuste fino supervisado (SFT) sobre el modelo base root-sys-n/Mima-1-Pico-15m, entrenado con 5.511 pares sinteticos de pregunta-respuesta en turco durante 3 epocas. Su objetivo declarado es doble: ofrecer respuestas breves y claras en turco, y evitar la fabulacion respondiendo "Bilmiyorum." (no lo se) ante preguntas desconocidas o absurdas.

El modelo se publica como version de vista previa (Preview) y esta pensado como experimento de viabilidad para modelos conversacionales de muy bajo coste computacional en turco. Por su tamano, puede ejecutarse en CPU y en practicamente cualquier GPU consumer, lo que lo hace interesante para prototipado rapido, entornos con recursos limitados y estudios sobre comportamiento de rechazo en modelos pequenos.

La relevancia actual del modelo no reside en su rendimiento absoluto, sino en su enfoque: demuestra que incluso con 15 millones de parametros y un dataset sintetico relativamente pequeno se puede reducir drasticamente la repeticion en bucle y ensenar una conducta de absteccion ante preguntas fuera de distribucion, un problema tipico en modelos de escala reducida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (causal-lm); detalles internos no disponibles |
| Parametros totales | 15.537.792 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Turco (tr) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | transformers (requiere trust_remote_code) |
| Tamano del repositorio | 0.1 GB |
| Modelo base | root-sys-n/Mima-1-Pico-15m (32.750 pasos de entrenamiento) |
| Metodo de ajuste | SFT, 3 epocas, 16.533 presentaciones |

## Arquitectura y entrenamiento

El modelo es un transformer causal de 15,54 millones de parametros, heredado del modelo base Mima-1-Pico-15m, que fue entrenado durante 32.750 pasos. Sobre esa base se aplico un ajuste fino supervisado (SFT) con 5.511 pares de pregunta-respuesta sinteticos en turco, durante 3 epocas (16.533 presentaciones totales). La perdida de entrenamiento evoluciono de 2,4095 en la epoca 1 a 1,5742 en la epoca 2 y 1,2298 en la epoca 3 (perplejidad 3,42).

Un detalle tecnico relevante es la estrategia de enmascaramiento: la entropia cruzada se calculo unicamente sobre los tokens de la respuesta del asistente y del token especial `<end>`, no sobre el prompt del usuario. Esto concentra el aprendizaje en la generacion de respuestas y en la senalizacion de fin de turno. El modelo utiliza tokens especiales con identificadores fijos (0 y 1 para apertura, 2 para cierre) y requiere `trust_remote_code=True` para cargarse, lo que indica que incorpora codigo personalizado en el repositorio. No se dispone de informacion sobre la composicion exacta del dataset sintetico ni sobre el uso de RLHF o DPO; el autor solo menciona SFT.

## Capacidades

- Generacion de texto conversacional en turco, con respuestas breves y directas.
- Respuesta a preguntas factuales basicas (por ejemplo, capital de Turquia, punto de ebullicion del agua).
- Conducta de absteccion ante preguntas absurdas o fuera de distribucion, respondiendo "Bilmiyorum." en lugar de inventar.
- Reduccion de repeticiones en bucle respecto al modelo base (0 de 17 casos en la evaluacion del autor frente a 5 de 17).
- Soporte de conversacion de un solo turno con formato de tokens especiales de apertura y cierre.
- No se ha documentado soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento.
- Capacidad multilingue limitada al turco; no se declaran otros idiomas.

## Casos de uso

- Prototipado de asistentes conversacionales en turco: el modelo permite validar rapidamente flujos de pregunta-respuesta y diseno de prompts sin coste de infraestructura, al caber en CPU y en cualquier GPU consumer.
- Demostraciones educativas sobre comportamiento de rechazo: sirve para ilustrar como un modelo pequeno puede aprender a decir "no lo se" en lugar de alucinar, util en docencia sobre limitaciones de los LLM.
- Pruebas de integracion en pipelines de transformers: al requerir `trust_remote_code=True` y tokens especiales propios, es util para verificar la carga de modelos con codigo personalizado antes de escalar a modelos mayores.
- Generacion de respuestas breves para FAQ de dominio acotado: con un ajuste adicional sobre un corpus especifico, puede servir como base para bots de preguntas frecuentes en turco con latencia muy baja.
- Experimentacion con tecnicas de enmascaramiento de perdida: su configuracion de entrenamiento (CE solo sobre respuesta y `<end>`) lo convierte en un caso de estudio reproducible para investigar tecnicas de SFT eficientes.
- Evaluacion comparativa de modelos de muy bajo parametraje: util como linea base en estudios sobre repeticion, perplejidad y absteccion en la franja de 10-20 millones de parametros.
- Despliegue en dispositivos con recursos minimos: por su tamano (0,1 GB de repositorio), puede ejecutarse en entornos embebidos o de bajo consumo para pruebas de concepto offline.

## Benchmarks y rendimiento

El autor publica una evaluacion sobre 186 preguntas held-out en turco (3.947 tokens, temperature = 0.0, repetition penalty = 1.08), comparando el modelo base con la version 1.5 Preview:

| Metrica | Mima-1-Pico-15m | Mima-1.5-Pico-15m-Preview |
|---|---:|---:|
| Perdida SFT en datos no vistos (CE) | 3,5078 | 3,2968 |
| Perplejidad en datos no vistos | 33,37 | 27,03 (-19,0%) |
| Bucles de repeticion (17 preguntas de prueba) | 5 / 17 | 0 / 17 |
| Rechazo de trampas factuales ("Bilmiyorum.") | 0 / 2 | 2 / 2 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (15,5 millones de parametros); en la practica, menos de 100 MB en cuantizacion de 8 bits, aunque no se documentan ficheros GGUF ni cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) es sobredimensionada; el modelo funciona tambien en CPU sin problemas.
- Cabe en cualquier GPU consumer e incluso en dispositivos de bajos recursos.
- Opciones de despliegue: transformers con `trust_remote_code=True` es la via documentada. No se confirma soporte para vLLM, llama.cpp, Ollama ni TGI, dado que no se publican pesos GGUF.
- Latencia y throughput estimados: no disponibles. Por el tamano del modelo, la latencia en CPU deberia ser de milisegundos por token, pero no hay mediciones publicadas.
- El repositorio incluye un script `sohbet.py` para conversacion en terminal.

## Comparativa con modelos similares

No se dispone de datos publicados de modelos comparables de la misma franja (10-20 millones de parametros, especializados en turco) en la informacion proporcionada. Como referencia cualitativa, se puede comparar con su propio modelo base:

| Modelo | Parametros | Contexto | PPL (held-out) | Bucles de repeticion | Licencia |
|---|---|---:|---:|---:|---|
| Mima-1.5-Pico-15m-Preview | 15,54 M | no disponible | 27,03 | 0 / 17 | Apache-2.0 |
| Mima-1-Pico-15m | 15,54 M (aprox.) | no disponible | 33,37 | 5 / 17 | no disponible |

No se dispone de comparaciones con alternativas de otros autores.

## Limitaciones y advertencias

- Modelo de vista previa con solo 15,54 millones de parametros: los errores factuales en preguntas de conocimiento mundial fuera de la distribucion de entrenamiento son probables.
- Entrenado exclusivamente con datos sinteticos en turco; no se garantiza generalizacion a otros dominios ni idiomas.
- Alineacion de seguridad limitada segun el propio autor; no debe usarse para decisiones medicas, legales o financieras.
- Riesgo de alucinacion persistente en preguntas que no se parezcan a las trampas del dataset de entrenamiento, pese a la mejora en el rechazo.
- Longitud de contexto no documentada, lo que impide planificar su uso en conversaciones largas o documentos extensos.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo del autor; conviene revisar el repositorio antes de usarlo en produccion.
- Licencia Apache-2.0 permite uso comercial, pero la ausencia de benchmarks estandar y de garantias de calidad desaconseja su uso en produccion sin evaluacion propia.
- No se publican pesos cuantizados ni ficheros GGUF, lo que limita las opciones de despliegue fuera de transformers.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/root-sys-n/Mima-1.5-Pico-15m-Preview
- Modelo base: https://huggingface.co/root-sys-n/Mima-1-Pico-15m
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la informacion disponible.
