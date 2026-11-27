# DICPlay/RusMind-Zernyshko-2.0

## Resumen

RusMind Zernyshko 2.0 es un modelo de lenguaje de 342 millones de parametros desarrollado por DICPlay, entrenado desde cero especificamente para el idioma ruso. Forma parte de la familia RusMind y se presenta como una alternativa compacta orientada a ejecucion local en portatiles y telefonos, con un enfoque explicito en eficiencia y despliegue offline. El modelo emplea una arquitectura transformer decoder con normalizacion RMSNorm, embeddings rotatorios (RoPE), activacion SwiGLU y atencion agrupada (GQA) con 16 cabezas de consulta y 4 de clave/valor.

La propuesta diferencial del modelo es su caracter "from scratch": dispone de tokenizador propio de 48 000 tokens entrenado sobre texto ruso, pesos propios y codigo de modelado propio (`modeling_rusmind_ai.py`), sin reutilizar clases de modelos existentes. Con 26 capas de 1024 dimensiones y una ventana de contexto de 4096 tokens, el modelo cubre generacion de texto conversacional, aritmetica basica, generacion de codigo, salida estructurada en JSON y llamada a herramientas.

El modelo resulta relevante para quienes necesitan un LLM de bajo coste computacional especializado en ruso, con licencia que permite uso personal, investigacion y evaluacion, pero que restringe el uso comercial a un contrato escrito con DICPlay. Su tamano (685 MB en bf16, 219 MB en GGUF Q4_K_M) lo hace viable en hardware muy modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (RMSNorm, RoPE, SwiGLU, GQA 16/4) |
| Parametros totales | 342 283 264 (26 capas x 1024) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | bf16, GGUF Q8_0, GGUF Q4_K_M |
| Idiomas soportados | Ruso (ru) |
| Licencia | RusMind License (DICPlay) |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer decoder denso con 26 capas, dimension oculta de 1024, normalizacion RMSNorm, embeddings posicionales rotatorios (RoPE), activacion SwiGLU y atencion con consultas agrupadas (GQA) en configuracion 16/4. Incorpora un tokenizador propio de 48 000 tokens entrenado sobre texto ruso y una implementacion de modelado independiente en PyTorch (`modeling_rusmind_ai.py`), lo que requiere `trust_remote_code=True` para su carga con Transformers. La version GGUF emplea la disposicion estandar de llama.cpp para compatibilidad con LM Studio, Ollama y llama.cpp.

El preentrenamiento se realizo desde pesos aleatorios sobre 4 500 millones de tokens, combinando Wikipedia en ruso, web en ruso, dialogos propios, codigo y tareas. Posteriormente se aplico un ajuste fino orientado a habilidades practicas: calculo aritmetico, generacion de codigo, salida en JSON, traduccion, invocacion de herramientas, cortesia y calibracion de honestidad ("decir que no sabe"). El autor documenta la curva de perdida del entrenamiento (perdida de 9,13 en el paso 50, frente a ~10,8 de una inicializacion aleatoria con vocabulario de 48 000), lo que respalda el caracter from-scratch del entrenamiento. No se especifica en la informacion disponible si se emplearon tecnicas de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional en ruso con formato de dialogo ChatML.
- Razonamiento aritmetico basico (sumas, problemas de velocidad, etc.).
- Generacion de codigo en contextos sencillos.
- Salida estructurada en JSON a partir de instrucciones en lenguaje natural.
- Llamada a herramientas (tool calling) con emision de JSON con nombre de herramienta y argumentos.
- Traduccion (segun la model card, entre las habilidades entrenadas).
- Calibracion de honestidad: el modelo esta entrenado para declarar desconocimiento en lugar de inventar.
- Ejecucion completamente offline en portatil y telefono.
- Capacidades multilingues limitadas: el unico idioma declarado es el ruso.

## Casos de uso

- Asistente conversacional en ruso para aplicaciones de escritorio o moviles: el modelo puede gestionar dialogos multi-turno con una ventana de 4096 tokens y ejecutarse en local sin conexion, lo que resulta adecuado para entornos con requisitos de privacidad o sin conectividad.
- Automatizacion de extraccion de datos estructurados: conversion de texto libre en ruso a JSON con campos definidos (por ejemplo, producto y precio), util para pipelines de procesamiento de documentos o formularios.
- Agente ligero con invocacion de herramientas: el modelo emite llamadas JSON a funciones externas (por ejemplo, consultas meteorologicas), lo que permite construir asistentes que consultan APIs a traves de un orquestador.
- Educacion y tutoria en ruso: resolucion de problemas aritmeticos paso a paso y explicaciones breves, aprovechando su entrenamiento en tareas de calculo.
- Prototipado rapido en dispositivos de bajos recursos: con 219 MB en Q4_K_M, puede desplegarse en telefonos y portatiles modestos para pruebas de concepto de asistentes en ruso.
- Generacion de codigo asistida en entornos locales: su capacidad de generar fragmentos de codigo y su ejecucion offline permiten integrarlo en editores o scripts sin enviar datos a la nube.
- Filtrado y clasificacion de texto en ruso: su tokenizador especializado y su bajo coste de inferencia lo hacen apto para tareas de preprocesamiento por lotes en corpus rusos.

## Benchmarks y rendimiento

| Benchmark | Resultado | Referencia |
|---|---|---|
| MERA 2.0 (puntuacion global) | 0,054 | Mejor de la linea Zernyshko |
| Prueba practica interna (120 preguntas) | 74 puntos | 53,5 en la misma base antes del ajuste fino |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Los datos anteriores proceden de la model card del autor y no son directamente comparables con evaluaciones externas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,7 GB en bf16, ~0,4 GB en GGUF Q8_0 y ~0,25 GB en GGUF Q4_K_M, mas el overhead del runtime.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; tambien funciona en CPU.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna (RTX 3060, RTX 4090, integradas con suficiente memoria compartida) e incluso en telefonos mediante llama.cpp.
- Opciones de despliegue: Transformers (con `trust_remote_code=True`), llama.cpp, LM Studio y Ollama a traves del repositorio GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RusMind Zernyshko 2.0 | 342 M | 4096 | Ruso | RusMind License (uso comercial con contrato) | Hugging Face (safetensors y GGUF) |
| Modelos comparables de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos de benchmarks ni especificaciones de modelos alternativos que permitan una comparacion rigurosa. La comparativa se limita a la ficha tecnica del propio modelo.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en ruso; su rendimiento en castellano u otros idiomas no esta garantizado ni documentado.
- Con 342 millones de parametros, la capacidad de razonamiento complejo, conocimiento factual y generacion de codigo avanzada es limitada en comparacion con modelos de mayor tamano.
- Riesgo de alucinacion inherente a los modelos de lenguaje; aunque el autor declara entrenamiento en honestidad, no hay evaluaciones externas que lo cuantifiquen.
- Ventana de contexto de 4096 tokens, suficiente para dialogos cortos pero insuficiente para documentos extensos.
- La licencia RusMind License restringe el uso comercial, la reventa, la redistribucion de versiones modificadas y la integracion en productos sin contrato escrito con DICPlay; es imprescindible revisar el archivo `LICENSE` antes de cualquier despliegue en produccion.
- Requiere `trust_remote_code=True` para cargar el modelo con Transformers, lo que implica ejecutar codigo del autor; conviene auditar `modeling_rusmind_ai.py` antes de usarlo en entornos sensibles.
- El uso de la etiqueta de arquitectura `llama` en el GGUF responde a la compatibilidad con llama.cpp y no implica relacion con los pesos de Meta, segun aclara el autor.
- No se han publicado evaluaciones independientes ni resultados en benchmarks estandar, por lo que las cifras de rendimiento proceden unicamente del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DICPlay/RusMind-Zernyshko-2.0
- Repositorio GGUF: https://huggingface.co/DICPlay/RusMind-Zernyshko-2.0-GGUF
- Registro de entrenamiento: https://huggingface.co/DICPlay/RusMind-Zernyshko-2.0/blob/main/training/train_300m.log
- Contacto del autor (Telegram): https://t.me/DanKirillin
- Contacto del autor (MAX): https://max.ru/u/f9LHodD0cOIENg5eShucR-RyhC02ijx-XXjPGcPbjBRy6_KKvmdKIu9tdQU
