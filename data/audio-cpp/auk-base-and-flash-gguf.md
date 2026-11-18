# audio-cpp/AuK-Base-and-Flash-GGUF

## Resumen

AuK es un modelo de audio generativo desarrollado por Tencent, distribuido en este repositorio como conversión a formato GGUF para su uso con el runtime C++ [audio.cpp](https://github.com/0xShug0/audio.cpp). El paquete incluye los pesos del modelo base `tencent/AuK` junto con los de la variante destilada `AuK-Flash`, además de los componentes auxiliares necesarios para la inferencia: un codificador de texto basado en Qwen2.5-Omni-3B y un VAE de audio. Con aproximadamente 1.530 millones de parámetros, el modelo aborda una tarea poco habitual: unificar síntesis de voz zero-shot, clonación de voz, edición de habla guiada por instrucciones y tareas de separación y mejora de audio en un único sistema.

La relevancia de esta conversión radica en que traslada un modelo de audio de referencia, originalmente dependiente de Python, a un runtime C++ con backend CUDA. El autor valida la paridad numérica entre ambas implementaciones en 16 tareas distintas, con valores de coseno de onda que alcanzan 0,999999992 en el mejor caso y 0,999989991 en el peor, lo que indica una fidelidad prácticamente exacta respecto a la implementación Python de referencia. El repositorio acumula 341.806 descargas, lo que sugiere una adopción significativa pese a contar con solo 7 likes.

La licencia MIT del paquete facilita la integración en productos comerciales, aunque conviene verificar las condiciones del modelo base original. El tamaño del repositorio, 34,0 GB, refleja la inclusión de múltiples variantes de cuantización y componentes en precisión FP32 y BF16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo generativo de audio con difusion y componentes transformer; sin detalle arquitectonico en la informacion) |
| Parametros totales | 1.530.538.629 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F32, BF16, Q8_0 (componentes Qwen); combinaciones cuantizadas no validadas en paridad de 16 tareas |
| Idiomas soportados | no disponible (los ejemplos de validacion incluyen ingles y mandarin, pero no se declara lista de idiomas) |
| Licencia | MIT |
| Formato de pesos | GGUF (con directorios `config/` y `tokenizer/` adjuntos) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base `tencent/AuK` mas alla de las etiquetas del repositorio, que mencionan difusion (`diffusion`) y generacion/edicion de habla guiada por instrucciones. El paquete GGUF se compone de tres piezas diferenciadas: un generador principal (`auk-base-f32.gguf` o `auk-flash-f32.gguf`), un componente de codificacion de texto basado en Qwen2.5-Omni-3B (en BF16 o Q8_0) y un VAE de audio en F32 (`auk-vae-f32.gguf`). La variante AuK-Flash es un modelo destilado independiente del base fijado, y se selecciona mediante la opcion de sesion `auk.variant=flash`.

No se especifican en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. La innovacion tecnica documentada es la conversion a GGUF con paridad numerica verificada frente a la implementacion Python original: las 16 tareas de validacion se ejecutaron forzando FP32 y desactivando TF32 en ambas implementaciones, produciendo WAVs de 24 kHz con el mismo numero de frames. El coseno de onda entre C++ y Python se mantiene por encima de 0,999989 en todos los casos.

## Capacidades

- Sintesis de voz zero-shot: genera habla a partir de una voz de referencia y un texto objetivo, sin entrenamiento adicional.
- TTS guiado por instrucciones: permite describir el estilo vocal en lenguaje natural (por ejemplo, "voz masculina calida hablando ingles claro") mediante el parametro `instruct`.
- Clonacion de voz: reproduce el timbre de una referencia proporcionada.
- Edicion de contenido del habla: sustituye palabras o frases concretas dentro de un audio existente.
- Edicion de letras musicales: reemplaza fragmentos en pistas vocales aisladas.
- Edicion de tono, velocidad y volumen: ajustes cuantificados (subir 2 semitonos, acelerar 1,5x, incrementar 10 dB).
- Edicion de emocion y timbre: cambio a emocion feliz o a una voz masculina grave y calmada.
- Reduccion de acento: conversion de habla con acento de Sichuan a mandarin estandar.
- Edicion no verbal: insercion de eventos como una tos antes de una frase.
- Conversion a susurro: transformacion del habla a un registro susurrado.
- Mejora de habla: eliminacion de ruido y reverberacion preservando a los hablantes.
- Separacion de habla: aislamiento de un hablante concreto (por ejemplo, el segundo en empezar a hablar).
- Separacion de musica: extraccion de la voz cantada eliminando el resto de la mezcla.
- Extraccion de hablante objetivo: aislamiento de un hablante a partir de una frase clave ("get what").
- Soporte de tool calling / function calling: no disponible en la informacion.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion.
- Capacidades multilingues: no declaradas formalmente; los ejemplos cubren ingles y mandarin.

## Casos de uso

- Doblaje y localizacion de contenido audiovisual: el modelo puede clonar la voz de un actor a partir de una muestra de referencia y generar el texto traducido manteniendo el timbre, lo que resulta adecuado para producciones que requieren preservar la identidad vocal original en otro idioma.
- Produccion de audiolibros y narracion: con TTS guiado por instrucciones se puede especificar el tono, la emocion y el estilo de narracion por capitulo, generando WAVs de 24 kHz directamente utilizables en postproduccion.
- Correccion de locuciones sin regrabar: la edicion de contenido permite sustituir frases erroneas dentro de una toma ya grabada, evitando convocar de nuevo al locutor y manteniendo la coherencia acustica del resto de la pista.
- Limpieza de grabaciones de campo o entrevistas: la mejora de habla elimina ruido y reverberacion preservando a los hablantes, util para podcasting, periodismo o transcripcion posterior con mayor precision.
- Postproduccion musical: la separacion de musica aísla la voz cantada para remezclas, karaokes o ajustes de mezcla, y la edicion de letras permite corregir lineas vocales concretas.
- Restauracion de archivos con varios hablantes: la separacion de habla y la extraccion de hablante objetivo permiten aislar a una persona concreta en grabaciones de reuniones o entrevistas multiples.
- Accesibilidad y sintesis personalizada: la clonacion de voz posibilita generar voces sinteticas personalizadas para usuarios que pierden la capacidad de hablar, con control de estilo mediante instrucciones.
- Investigacion en procesamiento de audio: la disponibilidad en GGUF con runtime C++ y paridad numerica verificada facilita la reproducibilidad y el despliegue en entornos sin Python.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (MMLU, HumanEval, GSM8K u otros). La unica tabla de validacion proporcionada mide paridad numerica entre la implementacion C++ y la Python de referencia, no calidad perceptual ni rendimiento frente a otros modelos:

| Tarea | Coseno de onda C++ vs Python |
|---|---:|
| TTS zero-shot | 0,999999992 |
| TTS con instruccion | 0,999999898 |
| Edicion de contenido | 0,999999982 |
| Edicion de letras | 1,000000000 |
| Edicion de tono | 0,999989991 |
| Edicion de velocidad | 0,999999993 |
| Edicion de volumen | 0,999999997 |
| Edicion de emocion | 0,999999993 |
| Edicion de timbre | 0,999999991 |
| Reduccion de acento | 0,999999795 |
| Edicion no verbal | 0,999991188 |
| Conversion a susurro | 0,999998371 |
| Mejora de habla | 0,999999994 |
| Separacion de habla | 0,999999985 |
| Separacion de musica | 0,999999998 |
| Extraccion de hablante objetivo | 0,999999997 |

El autor advierte que el coseno de onda por si solo no establece si una edicion siguio correctamente su instruccion, y que las combinaciones de componentes cuantizados no han recibido la misma validacion de paridad en las 16 tareas.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. El repositorio ocupa 34,0 GB e incluye componentes en F32 y BF16; el generador principal y el VAE en F32 requieren mas memoria que sus equivalentes cuantizados.
- Componentes por defecto: `auk-base-f32.gguf` (generador), `qwen2.5-omni-3b-bf16.gguf` (codificador de texto) y `auk-vae-f32.gguf` (VAE). Existe alternativa `qwen2.5-omni-3b-q8_0.gguf` para reducir memoria.
- GPU recomendadas: no disponibles en la informacion. El runtime soporta backend CUDA (`--backend cuda`), pero no se enumeran modelos de GPU concretos.
- Compatibilidad con GPU de consumo: no confirmada en la informacion. Dado el uso de componentes F32 y un codificador de 3B, es probable que requiera GPU con VRAM alta, pero no se aportan cifras.
- Opciones de despliegue: exclusivamente mediante `audiocpp_cli` del proyecto audio.cpp, con backend CUDA. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. Solo se documenta que las 16 peticiones de validacion completaron correctamente y generaron WAVs de 24 kHz con el mismo numero de frames que Python.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativo frente a otros modelos de audio en la informacion proporcionada. La tabla siguiente recoge unicamente los datos estructurales conocidos de este paquete y deja constancia de la ausencia de alternativas documentadas:

| Modelo | Parametros | Contexto | Licencia | Formato | Estado |
|---|---|---|---|---|---|
| AuK (GGUF, audio.cpp) | 1.530.538.629 | no disponible | MIT | GGUF | Disponible |
| tencent/AuK (original) | no disponible | no disponible | no disponible | safetensors (presumible) | Disponible en Hugging Face |
| AuK-Flash (destilado) | no disponible | no disponible | no disponible | GGUF (incluido en el paquete) | Disponible |

No se identifican en la informacion modelos comparables de la misma categoria con datos verificables de parametros, contexto y rendimiento.

## Limitaciones y advertencias

- La validacion de paridad se limita a la configuracion probada; el autor indica explicitamente que no certifica que la salida de AuK cumpla todas las expectativas de calidad. Ante un resultado deficiente, recomienda escuchar primero el WAV de referencia en Python para descartar que el problema provenga del modelo original.
- Las combinaciones de componentes cuantizados no han recibido la misma validacion de 16 tareas que la configuracion F32/BF16 por defecto.
- El coseno de onda mide fidelidad numerica, no adherencia a la instruccion de edicion; una edicion puede ser numericamente identica a Python y no cumplir lo pedido.
- No se declara una lista oficial de idiomas soportados; los ejemplos cubren ingles y mandarin, por lo que el rendimiento en castellano no esta documentado.
- No hay informacion sobre sesgos conocidos, riesgo de alucinacion en la generacion de habla ni evaluaciones de robustez.
- La clonacion de voz y la edicion de audio plantean riesgos de suplantacion de identidad y uso indebido; la licencia MIT no incorpora salvaguardas tecnicas documentadas en esta ficha.
- El despliegue esta atado al runtime audio.cpp con backend CUDA; no se documentan alternativas de servido ni soporte para otros backends.
- La longitud de contexto no esta disponible, lo que impide estimar el limite practico de texto de entrada o de audio de referencia.
- El repositorio incluye la variante Flash, que no es el modelo base fijado en `base_model`; confundir ambas puede llevar a resultados distintos de los esperados.

## Enlaces

- Repositorio GGUF: https://huggingface.co/audio-cpp/AuK-Base-and-Flash-GGUF
- Modelo base original: https://huggingface.co/tencent/AuK
- Variante destilada: https://huggingface.co/tencent/AuK-Flash
- Runtime audio.cpp: https://github.com/0xShug0/audio.cpp
- Guia de AuK en audio.cpp: https://github.com/0xShug0/audio.cpp/blob/main/docs/models/auk.md
- Cookbook de AuK: https://github.com/Tencent-Hunyuan/AuK/blob/main/docs/COOKBOOK.md
- Repositorio oficial de AuK: https://github.com/Tencent-Hunyuan/AuK
- Assets de demostracion (audio de entrada): https://github.com/Tencent-Hunyuan/AuK/tree/main/assets/demo-input-audio
