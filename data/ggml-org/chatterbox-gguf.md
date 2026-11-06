# ggml-org/chatterbox-GGUF

## Resumen

chatterbox-GGUF es la conversión al formato GGUF del modelo Chatterbox Multilingual V3 de ResembleAI, empaquetada por el equipo de ggml-org para su uso con llama.cpp. Se trata de un modelo de síntesis de voz (text-to-speech) de 525 millones de parámetros que genera audio a partir de texto en 23 idiomas y permite la clonación de voz a partir de una muestra de referencia en formato wav o mp3. La conversión está pensada para ejecutarse tanto en local desde la terminal mediante la herramienta `llama-tts` como a través del endpoint `/tts` del servidor de llama.cpp.

La relevancia de esta versión radica en que traslada un modelo TTS de calidad a la infraestructura de inferencia de llama.cpp, lo que facilita su despliegue en hardware de consumo sin depender de frameworks pesados de aprendizaje profundo. El repositorio ocupa 2,2 GB e incluye pesos cuantizados, con licencia MIT, lo que permite uso comercial sin restricciones adicionales.

Es importante señalar que este repositorio contiene únicamente los pesos convertidos: la arquitectura subyacente, los datos de entrenamiento y las capacidades completas del modelo original se documentan en el modelo base ResembleAI/chatterbox, del que esta versión es una derivación directa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS de ResembleAI; pesos convertidos a GGUF para llama.cpp) |
| Parametros totales | 525.186.080 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF cuantizado (variantes concretas no especificadas en la informacion disponible) |
| Idiomas soportados | 23 idiomas (seleccionables mediante `--tts-lang`); listado completo no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo original: se trata de un sistema de text-to-speech de ResembleAI del que solo se documenta el proceso de conversion a GGUF y su integracion en llama.cpp. El recuento de parametros (525.186.080) corresponde a los pesos en formato safetensors del modelo base, y el repositorio GGUF ocupa 2,2 GB, lo que sugiere una cuantizacion moderada respecto a los pesos originales.

El modelo se distribuye como Chatterbox Multilingual V3, con soporte para 23 idiomas controlados mediante el parametro `--tts-lang`. La clonacion de voz se realiza con `--tts-speaker-file`, que acepta un fichero de referencia en wav o mp3; sin dicho fichero se utiliza la voz incluida por defecto con el modelo. La conversion ha sido generada automaticamente con la herramienta de ggml-org y requiere una compilacion de llama.cpp que incluya el pull request 31698. No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o ajuste fino preferencial.

## Capacidades

- Sintesis de voz a partir de texto (text-to-speech) en 23 idiomas, con seleccion de idioma por parametro.
- Clonacion de voz zero-shot a partir de una muestra de audio de referencia en wav o mp3.
- Uso de una voz por defecto incluida en el modelo cuando no se proporciona referencia.
- Ejecucion en local mediante la herramienta de linea de comandos `llama-tts`, con salida a fichero wav.
- Servicio HTTP a traves del endpoint `/tts` de `llama serve`, lo que permite integracion en aplicaciones cliente-servidor.
- Compatibilidad con endpoints declarada en las etiquetas del repositorio.
- No se documentan en la informacion disponible capacidades de tool calling, razonamiento multi-paso, vision ni audio de entrada mas alla de la referencia de voz para clonacion.

## Casos de uso

- Locucion automatizada de articulos y boletines: el modelo convierte texto largo en audio con una voz consistente, lo que permite generar versiones habladas de contenido editorial sin intervencion humana.
- Clonacion de voz para narracion personalizada: usando `--tts-speaker-file` con una muestra del locutor habitual, se mantiene la identidad vocal en toda la produccion de un podcast o canal.
- Doblaje y localizacion de contenido: al soportar 23 idiomas con seleccion mediante `--tts-lang`, se puede generar la misma pieza en distintos idiomas para mercados regionales.
- Asistentes de voz embebidos: la integracion con llama.cpp y el endpoint `/tts` permite montar un servicio de sintesis en una red local o en un dispositivo con recursos limitados.
- Prototipado de interfaces accesibles: conversion de texto a voz para lectores de pantalla o avisos en aplicaciones, ejecutandose en local sin enviar datos a servicios externos.
- Generacion de audio para videojuegos y herramientas creativas: produccion de dialogos y avisos dinamicos en tiempo de ejecucion desde una herramienta de linea de comandos o servidor.
- Pruebas de integracion en pipelines de CI: al ser un binario de llama.cpp, se puede automatizar la generacion de muestras de audio en pruebas de regresion de productos con componente de voz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio GGUF ocupa 2,2 GB, por lo que la VRAM necesaria para cargar los pesos completos se situa en torno a esa cifra, mas el margen para el estado de inferencia y los buffers de audio (no cuantificado en la informacion disponible).
- Cabe en GPUs de consumo con 4 GB o mas de VRAM en la mayoria de configuraciones, aunque el dato exacto depende de la variante de cuantizacion elegida.
- GPUs recomendadas: no disponible de forma explicita; por tamano, cualquier GPU moderna de consumo o profesional (RTX 3060 en adelante, A100, H100) es sobradamente suficiente para alojar los pesos.
- Despliegue mediante llama.cpp: herramienta `llama-tts` para uso por linea de comandos y `llama serve` para exposicion del endpoint `/tts`.
- Requiere una compilacion de llama.cpp que incluya el pull request 31698; las builds anteriores no soportaran el modelo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| chatterbox-GGUF (este modelo) | 525 M | no disponible | 23 | MIT | GGUF |
| ResembleAI/chatterbox (original) | 525 M | no disponible | 23 | MIT | safetensors |
| Alternativas TTS de codigo abierto | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion con otros sistemas TTS de codigo abierto no puede completarse con los datos disponibles; la unica referencia solida es el modelo base del que deriva esta conversion, con identico tamano y licencia pero en formato safetensors y sin la integracion nativa en llama.cpp.

## Limitaciones y advertencias

- La informacion sobre sesgos, calidad por idioma y comportamiento en dominios especificos no esta disponible en la documentacion proporcionada.
- Riesgo de alucinacion o artefactos de audio: no cuantificado; en sistemas TTS es habitual encontrar prosodia irregular o pronunciacion erronea en textos fuera de dominio, pero no se aportan datos concretos para este modelo.
- La clonacion de voz plantea riesgos de suplantacion de identidad y uso fraudulento; la licencia MIT no impone restricciones eticas, por lo que la responsabilidad recae en el integrador.
- La seleccion de idioma depende del parametro `--tts-lang` y el listado completo de los 23 idiomas no se detalla en la informacion disponible.
- Requiere una build especifica de llama.cpp (PR 31698); versiones anteriores o distribuciones empaquetadas sin ese cambio no funcionaran.
- El repositorio no incluye documentacion sobre limites de longitud de texto de entrada ni sobre el comportamiento con entradas muy largas.
- Al ser una conversion automatica, pueden existir diferencias de calidad respecto al modelo original en safetensors; no se han publicado comparaciones al respecto.
- Licencia MIT: permite uso comercial y modificacion, pero sin garantias explicitas por parte de los autores.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ggml-org/chatterbox-GGUF
- Modelo base: https://huggingface.co/ResembleAI/chatterbox
- Pull request de soporte en llama.cpp: https://github.com/ggml-org/llama.cpp/pull/31698
- Documentacion de la herramienta TTS de llama.cpp: https://github.com/ggml-org/llama.cpp/blob/master/tools/tts/README.md#chatterbox
- Herramienta de conversion: https://github.com/ggml-org/convert
