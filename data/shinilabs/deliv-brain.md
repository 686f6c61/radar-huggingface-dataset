# ShiniLabs/deliv-brain

## Resumen

Deliv-brain es un ajuste fino (fine-tune) del modelo Google FunctionGemma-270M-IT, desarrollado por ShiniLabs, orientado a la conversion de lenguaje natural en espanol (procedente de un reconocedor de voz) en acciones de voz estructuradas para la aplicacion movil Deliv. El modelo resuelve un problema muy concreto de function calling en el borde (edge): transformar una frase dictada por un repartidor en una llamada a funcion tipada que la app pueda ejecutar.

Tecnicamente es un transformer decoder-only de 270 millones de parametros, derivado de la familia Gemma de Google, con un contexto de 2048 tokens y pesos cuantizados dinamicamente a int8 en formato `.litertlm` para ejecucion on-device mediante LiteRT-LM. El repositorio ocupa aproximadamente 0,3 GB, lo que confirma su orientacion a despliegue en telefono.

Su relevancia radica en el nicho: function calling multilingue (especificamente castellano) en un modelo diminuto que corre en el dispositivo sin conexion a la nube. No obstante, se trata de un modelo de publicacion muy reciente (noviembre de 2026) sin descargas ni validacion externa publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Gemma), ajuste fino de google/functiongemma-270m-it |
| Parametros totales | 270 millones (heredados del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | int8 dinamico (formato `.litertlm`) |
| Idiomas soportados | espanol (es) |
| Licencia | Gemma Terms of Use (licencia "gemma") |
| Formato de pesos | LiteRT-LM (`.litertlm`); no se indica disponibilidad de safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo parte de FunctionGemma-270M-IT, un transformer decoder-only de la familia Gemma especializado en function calling, y se ajusta finamente para el dominio de reparto a domicilio y el idioma espanol. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO en el ajuste fino.

La innovacion practica reside en el pipeline de despliegue: cuantizacion dinamica a int8 y empaquetado en LiteRT-LM para inferencia local en el telefono, con una ventana de 2048 tokens suficiente para transcripciones de voz cortas y el esquema de funciones de la app. No se documentan innovaciones arquitectonicas adicionales (atencion lineal, decodificacion especulativa, etc.).

## Capacidades

- Conversion de lenguaje natural a llamadas a funcion (function calling) en espanol, orientada a acciones de voz de la app Deliv.
- Procesamiento de texto procedente de reconocimiento automatico del habla (ASR), con tolerancia esperada a transcripciones imperfectas.
- Generacion de salidas estructuradas segun el esquema de funciones de la aplicacion.
- Ejecucion on-device mediante LiteRT-LM, sin dependencia de red.
- Operacion en un unico idioma: espanol.
- No se documentan capacidades de vision, audio nativo, agentes multi-paso, tool calling generico fuera del dominio ni modo de razonamiento extendido.

## Casos de uso

- Dictado de acciones de reparto: el repartidor habla ("marca el pedido como entregado") y el modelo emite la llamada a funcion correspondiente que la app ejecuta; es adecuado por su tamano y su especializacion en espanol.
- Navegacion manos libres: conversion de instrucciones habladas en acciones de la app (iniciar ruta, confirmar llegada) mientras el repartidor conduce, gracias a la inferencia local sin latencia de red.
- Actualizacion de estado de pedidos por voz: el modelo traduce frases como "el cliente no estaba" en la accion estructurada de incidencia, con contexto de 2048 tokens para el historial reciente.
- Registro de incidencias en ruta: transformar descripciones habladas de problemas (direccion incorrecta, acceso bloqueado) en campos tipados de la app.
- Operacion en zonas con conectividad limitada: al ejecutarse en el dispositivo con LiteRT-LM, funciona sin cobertura, escenario habitual en reparto urbano y rural.
- Integracion en el pipeline de ASR de la app: actua como capa de intencion entre el reconocedor de voz y el motor de acciones, reduciendo el coste frente a soluciones en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el repositorio pesa 0,3 GB en int8 dinamico, por lo que la inferencia requiere del orden de unos pocos cientos de MB de memoria; la cifra exacta de pico no esta disponible.
- GPU recomendadas: no aplica en el escenario objetivo; esta disenado para CPU/NPU de telefonos moviles mediante LiteRT-LM.
- Cabe en GPU de consumo: si, por tamano (270M parametros); no obstante, el formato `.litertlm` esta orientado a LiteRT y no se documenta soporte en llama.cpp, vLLM, Ollama ni TGI.
- Opciones de despliegue: LiteRT-LM (unica via documentada).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| ShiniLabs/deliv-brain | 270M | 2048 | es | Gemma Terms of Use | LiteRT-LM |
| google/functiongemma-270m-it (base) | 270M | no disponible | multilingue | Gemma Terms of Use | no disponible |
| Modelos de function calling de mayor tamano (p. ej. familia Qwen o Llama) | varios miles de millones | 8K-128K | multilingue | variable | safetensors, GGUF |

La comparacion cuantitativa de rendimiento no esta disponible: no hay benchmarks publicados para deliv-brain ni datos de evaluacion frente al modelo base.

## Limitaciones y advertencias

- Modelo de 270M parametros: capacidad de razonamiento y generalizacion limitada; errores probables en frases ambiguas, fuera de dominio o con ruido de ASR intenso.
- Especializado en un unico dominio (app Deliv) y un unico idioma (espanol); su uso fuera de ese esquema de funciones no esta validado.
- Riesgo de alucinacion en la seleccion de funciones o en la generacion de argumentos, con posible ejecucion de acciones incorrectas si no se valida la salida.
- Sin descargas ni evaluaciones externas publicadas; madurez y robustez no verificadas.
- Licencia Gemma Terms of Use: el uso comercial esta sujeto a dichos terminos, que deben revisarse antes de produccion.
- Formato `.litertlm` restringido a LiteRT-LM; no se documenta conversion a otros runtimes.
- Sin informacion sobre sesgos especificos del ajuste fino.

## Enlaces

- Hugging Face: https://huggingface.co/ShiniLabs/deliv-brain
- Modelo base: https://huggingface.co/google/functiongemma-270m-it
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
