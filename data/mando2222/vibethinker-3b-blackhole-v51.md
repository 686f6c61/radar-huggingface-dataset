# mando2222/vibethinker-3b-blackhole-v51

## Resumen
VibeThinker-3B es un modelo de razonamiento denso basado en Qwen2.5, desarrollado por el laboratorio WeiboAI. Esta versión concreta, `vibethinker-3b-blackhole-v51`, es un paquete de despliegue creado por `mando2222` para ejecutar el modelo en un único acelerador Tenstorrent Blackhole (p150) mediante vLLM y el plugin `tenstorrent/vllm-tt-plugin`. El repositorio no contiene los pesos; se descargan desde `WeiboAI/VibeThinker-3B` al utilizar `tt-model-manager`, y los kernels se compilan en el primer arranque. La configuración admite una ventana de contexto de 131.072 tokens y hasta 32 secuencias concurrentes.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2ForCausalLM) |
| Parametros totales | 3B (del nombre del modelo, no se especifica cifra exacta) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (los pesos se descargan desde el repositorio base via tt-model-manager) |

## Arquitectura y entrenamiento
El modelo subyacente, VibeThinker-3B, es un modelo de lenguaje denso basado en la arquitectura Qwen2ForCausalLM, con aproximadamente 3.000 millones de parametros. La informacion proporcionada no incluye detalles sobre los datos de entrenamiento, el proceso de alineacion (RLHF, DPO, etc.) ni innovaciones tecnicas especificas del modelo. El repositorio de despliegue esta construido sobre `tt-metal`, una version de vLLM (wheel `vllm-0.1.dev14178+ga2f077ade`) y un checkout local de `vllm-tt-plugin`. Este stack permite servir el modelo como un endpoint compatible con OpenAI sobre hardware Tenstorrent.

## Capacidades
- Razonamiento matematico: el modelo esta indicado para problemas de dificultad superior a la Olimpiada Internacional de Matematicas, como los incluidos en AMOBench.
- Programacion competitiva: se recomienda su uso en problemas tipo LeetCode, donde puede generar soluciones con razonamiento paso a paso.
- Contexto largo: soporta 131.072 tokens, lo que permite procesar documentos extensos o multiples turnos de conversacion en una sola sesion.
- Ejecucion concurrente: admite hasta 32 secuencias simultaneas en un solo dispositivo Blackhole p150.
- No se ha confirmado en la informacion disponible soporte de tool calling, vision, audio ni otras capacidades multimodales.

## Casos de uso
- Razonamiento matematico avanzado: el modelo puede emplearse en sistemas de resolucion automatica de problemas dificiles, proporcionando pasos intermedios de razonamiento. Su evaluacion en AMOBench lo hace adecuado para escenarios de investigacion en matematicas.
- Generacion de codigo para programacion competitiva: apto para generar soluciones a problemas estilo LeetCode. Puede integrarse en herramientas de practica de algoritmos o en pipelines de validacion de soluciones.
- Analisis de documentos extensos: la ventana de 131.072 tokens permite procesar informes tecnicos, articulos de investigacion o registros de log completos sin necesidad de truncado o segmentacion previa.
- Despliegue en hardware Tenstorrent Blackhole: esta distribucion sirve como referencia para ejecutar modelos de lenguaje en aceleradores p150 mediante vLLM. Es util para equipos que trabajan con infraestructura Tenstorrent y necesitan validar el rendimiento de modelos de razonamiento.
- Servidor compatible con OpenAI: la imagen arranca un servidor en el puerto 20000, lo que facilita la integracion con aplicaciones existentes basadas en la API de OpenAI sin cambios en el cliente.
- Investigacion en razonamiento y evaluacion de modelos: permite comparar el comportamiento de un modelo de razonamiento de 3B en entornos de hardware alternativo, aunque los resultados de benchmarks no estan publicados en esta distribucion.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. El autor del modelo base menciona AMOBench como herramienta de evaluacion, pero no se proporcionan puntuaciones ni comparativas numericas.

## Requisitos de hardware
- El modelo esta disenado para ejecutarse en un unico acelerador Tenstorrent Blackhole (p150).
- No se proporciona una estimacion de VRAM en gigabytes. La configuracion soporta contexto de 131.072 tokens y hasta 32 secuencias concurrentes.
- No es compatible con GPU convencionales (NVIDIA, AMD) en esta distribucion; requiere el stack de hardware y software de Tenstorrent.
- Opciones de despliegue: vLLM con el plugin `tenstorrent/vllm-tt-plugin`, gestionado por `tt-model-manager` mediante los comandos `tt-model pull` y `tt-model serve`.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- El primer arranque requiere compilacion de kernels, lo que puede tardar varios minutos.

## Comparativa con modelos similares
No se dispone de informacion suficiente para establecer una comparativa con otros modelos en la informacion proporcionada. No se aportan datos de rendimiento, licencias ni especificaciones de modelos alternativos que permitan una comparacion rigurosa.

## Limitaciones y advertencias
- La licencia del modelo no esta indicada, por lo que debe verificarse antes de cualquier uso comercial.
- No se publican resultados de benchmarks en esta distribucion, lo que impide evaluar su rendimiento relativo frente a otros modelos.
- El despliegue esta restringido a hardware Tenstorrent Blackhole, lo que limita su accesibilidad frente a modelos que se ejecutan en GPU estandar.
- Al tratarse de un modelo de 3B, es probable que tenga limitaciones en tareas de conocimiento general o que presente alucinaciones en dominios no cubiertos por su entrenamiento.
- No se proporciona informacion sobre sesgos, seguridad ni alineacion del modelo.
- El servidor requiere compilacion de kernels en el primer arranque, lo que puede provocar tiempos de espera prolongados antes de la primera respuesta.

## Enlaces
- Repositorio HuggingFace: https://huggingface.co/mando2222/vibethinker-3b-blackhole-v51
- Modelo base WeiboAI/VibeThinker-3B: https://huggingface.co/WeiboAI/VibeThinker-3B
- Repositorio alternativo mando2222/vibethinker-3b-P150: https://huggingface.co/mando2222/vibethinker-3b-P150
- tt-model-manager: https://github.com/tenstorrent/tt-model-manager
