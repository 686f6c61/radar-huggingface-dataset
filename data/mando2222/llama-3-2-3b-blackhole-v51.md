# mando2222/llama-3.2-3b-blackhole-v51

## Resumen

El modelo `mando2222/llama-3.2-3b-blackhole-v51` no es un modelo nuevo, sino un empaquetado de Llama 3.2 3B Instruct preparado para ejecutarse en un acelerador Tenstorrent Blackhole (p150). Ha sido publicado por `mando2222` y utiliza el plugin `tenstorrent/vllm-tt-plugin` para servir el modelo a traves de vLLM. El objetivo es simplificar el despliegue de Llama 3.2 3B en infraestructura Tenstorrent: el repositorio incluye una imagen Docker y las instrucciones para descargar los pesos desde HuggingFace, de forma que basta con ejecutar `tt-model pull` y `tt-model serve` para lanzar un servidor compatible con OpenAI.

La relevancia de esta publicacion es practica: el hardware Tenstorrent Blackhole requiere un software de inferencia especifico, y este repositorio lo encapsula para que los desarrolladores puedan probar el modelo sin configurar manualmente vLLM ni el plugin. El modelo se valida con una ventana de contexto de 4096 tokens y hasta 32 secuencias concurrentes en una unica unidad p150. No obstante, el repositorio no ofrece informacion sobre el proceso de entrenamiento, parametros tecnicos ni benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (basado en Llama 3.2 3B Instruct) |
| Parametros totales | 3B (segun denominacion del modelo base) |
| Parametros activos | No procede (modelo denso) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

El repositorio no incluye informacion sobre la arquitectura original del modelo. A partir del nombre y del enlace al modelo base, se sabe que se trata de Llama 3.2 3B Instruct, un transformer denso de 3.2 mil millones de parametros, ajustado para instrucciones y chat. Sin embargo, el repositorio no detalla el proceso de entrenamiento, el numero de tokens, la composicion del dataset ni si se aplico RLHF o DPO. La unica innovacion tecnica destacable es el empaquetado para Tenstorrent Blackhole mediante vLLM y el plugin `vllm-tt-plugin`, junto con `tt-model-manager` para gestionar imagenes y pesos. El primer arranque compila kernels para el dispositivo, lo que puede tardar varios minutos.

## Capacidades

- Generacion de texto conversacional y seguimiento de instrucciones: el model card indica explicitamente "General chat and instruction following".
- Ventana de contexto de 4096 tokens: validada en el hardware objetivo.
- Capacidad de servir hasta 32 secuencias concurrentes en una unica unidad p150.
- Compatibilidad con el protocolo OpenAI a traves de vLLM: el servidor expone una API compatible con OpenAI.
- No se documentan capacidades de vision, audio, tool calling, razonamiento multietapa ni agentes.
- Idiomas soportados: no disponibles en la informacion.

## Casos de uso

- Despliegue de un asistente conversacional en hardware Tenstorrent Blackhole: el modelo puede servir como base para chatbots internos en entornos que ya posean infraestructura p150, gracias al empaquetado con tt-model y vLLM.
- Pruebas de integracion de vLLM con el plugin de Tenstorrent: al estar preconfigurado, es util para validar despliegues que deban ser compatibles con OpenAI sin esfuerzo de instalacion.
- Uso en entornos de prototipado con contexto limitado: la ventana de 4096 tokens permite conversaciones multi-turno cortas o procesamiento de documentos breves, siempre que el modelo no requiera un contexto enorme.
- Generacion de respuestas para preguntas frecuentes: como modelo de instrucciones pequeno, puede implantarse en aplicaciones de soporte donde la latencia en hardware especifico sea aceptable.
- Experimentacion con modelos de 3B en Tenstorrent: el repositorio sirve como referencia para probar el rendimiento y la estabilidad de Llama 3.2 3B en p150, sin tener que compilar vLLM desde cero.
- Ayuda en documentacion de proyectos de despliegue de IA con Tenstorrent: al incluir un historial de construccion (provenance) y comandos concretos, puede usarse como ejemplo didactico en herramientas como tt-model-manager.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Hardware objetivo: Tenstorrent Blackhole p150 (mesh P150), segun el model card.
- VRAM estimada: no disponible. El repositorio no especifica memoria necesaria, aunque el tamano del repo es 1.2 GB, que corresponde probablemente a la imagen Docker, no a los pesos.
- GPU recomendadas: no aplica; el modelo esta disenado para el acelerador Tenstorrent Blackhole, no para GPU convencionales.
- No se indica soporte para GPU consumer.
- Opciones de despliegue: `tt-model serve` lanza un servidor OpenAI-compatible en el puerto 20000. El modelo se usa con el comando `tt-model pull --with-weights`, que descarga los pesos desde HuggingFace al cache local. Tambien se menciona compatibilidad con vLLM y el plugin `vllm-tt-plugin`.
- Concurrencia: hasta 32 secuencias simultaneas en un solo p150, con contexto de 4096 tokens.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La comparativa se ve limitada porque este repositorio es una variante de despliegue sobre hardware concreto y no proporciona especificaciones tecnicas propias. Se puede contrastar con el modelo base original y con otra variante de Tenstorrent publicada por el mismo autor.

| Modelo | Contexto | Hardware objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|
| mando2222/llama-3.2-3b-blackhole-v51 | 4096 tokens | Tenstorrent Blackhole p150 | no disponible | HuggingFace |
| mando2222/llama-3.2-3b-e2e | no disponible | Tenstorrent Blackhole p150 | no disponible | HuggingFace |
| meta-llama/Llama-3.2-3B | no disponible | GPU generica | no disponible | HuggingFace |

No se dispone de informacion adicional sobre estos modelos comparables.

## Limitaciones y advertencias

- Este repositorio no contiene los pesos del modelo; se descargan por separado desde HuggingFace, lo que requiere una conexion a internet y espacio en el cache.
- El primer arranque tarda varios minutos en compilar kernels para el dispositivo, lo que puede causar timeout en entornos de CI/CD si no se anticipa.
- La ventana de contexto esta limitada a 4096 tokens, lo que puede ser insuficiente para tareas de analisis de documentos largos.
- No hay informacion sobre sesgos, alucinaciones ni comportamiento fuera de los casos de chat e instrucciones.
- La licencia no esta declarada en el repositorio, por lo que se desconoce si permite uso comercial o si aplica la licencia del modelo base Llama 3.2.
- El modelo no documenta soporte de tool calling, vision ni audio, por lo que no deberia usarse para tareas que requieran estas funciones.
- Al tratarse de una variante de despliegue empaquetada, el mantenimiento del repositorio depende del autor y del estado del plugin `vllm-tt-plugin`, que no tiene una version publicada.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/mando2222/llama-3.2-3b-blackhole-v51
- Modelo base de referencia: https://huggingface.co/unsloth/Llama-3.2-3B-Instruct
- Repositorio de tt-model-manager: https://github.com/tenstorrent/tt-model-manager
- Commit de tt-metal usado en la construccion: https://github.com/ezietlowTT/tt-metal/commit/1c1b7c9c36d06ef5c1e8e917621b7d5f9d264741
- Variante similar del mismo autor: https://huggingface.co/mando2222/llama-3.2-3b-e2e
- Modelo original Llama 3.2 3B en Facebook: https://huggingface.co/meta-llama/Llama-3.2-3B
