# darkbit1001/ReadyArt-Dark-Scarlett-27B-v2.0-EXL3-4.50bpw-HB8HQ

## Resumen

Dark-Scarlett-27B-v2.0-EXL3-4.50bpw-HB8HQ es una cuantización en formato EXL3 del modelo ReadyArt/Dark-Scarlett-27B-v2.0, creada por el usuario darkbit1001. El modelo base es un ajuste fino de Qwen3-27B orientado a conversación, roleplay y contenido adulto explícito, desarrollado por ReadyArt. Esta versión cuantizada reduce el tamaño de los pesos a 4.50 bits por peso (con 8 bits para la cabeza) para permitir una inferencia más eficiente con ExLlamaV3, manteniendo la licencia Apache 2.0.

La relevancia de esta cuantización radica en que facilita el despliegue del modelo en hardware con VRAM limitada, ya que el repositorio ocupa 18.4 GB en lugar de los pesos completos. Está pensada para desarrolladores que quieran ejecutar el modelo en local con ExLlamaV3, un motor de inferencia optimizado para GPUs. No se dispone de información sobre el número exacto de parámetros del modelo base (el nombre sugiere 27B, pero el conteo de safetensors indica 9.172.751.744), ni sobre la longitud de contexto o los idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Qwen3-27B, segun referencia web) |
| Parametros totales | 9.172.751.744 (dato de safetensors; el nombre del modelo indica 27B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | EXL3, 4.50 bits por peso, head bits 8, codebook mul1 |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (formato exl3, 3 archivos fragmentados) |

## Arquitectura y entrenamiento

Esta version es una cuantizacion, no un modelo entrenado desde cero. El modelo base, ReadyArt/Dark-Scarlett-27B-v2.0, es un ajuste fino de Qwen3-27B (segun la referencia de Caliper Bench) especializado en roleplay y conversacion con contenido adulto explicito. No se dispone de detalles sobre el proceso de entrenamiento del modelo base, como el numero de tokens, la composicion del dataset o si se uso RLHF/DPO. La cuantizacion se realizo con el quantizer `exllamav3-1.4.4`, con calibracion de 250 filas y 2048 columnas, y salida de escalas siempre activa.

## Capacidades

- Generacion de texto conversacional y roleplay, con soporte para dialogos multi-turno.
- Contenido adulto explicito y no alineado (segun las etiquetas del modelo base: nsfw, adult-content, unaligned, mature, explicit, erp).
- No se ha confirmado soporte para tool calling, agentes, razonamiento multi-paso, vision o audio en la informacion disponible.
- Capacidades multilingues no especificadas.

## Casos de uso

- Chatbots de roleplay para entretenimiento: el modelo puede mantener conversaciones inmersivas con personajes ficticios, gracias a su entrenamiento especifico en roleplay y su arquitectura conversacional.
- Generacion de narrativa creativa: util para escribir historias interactivas o dialogos con tono adulto, donde el modelo mantiene coherencia contextual en turnos largos.
- Simulacion de personajes para juegos de rol: integrable en motores de juego o aplicaciones de texto para generar respuestas de personajes no jugadores (NPC) con personalidad definida.
- Prototipado de asistentes conversacionales con tono desinhibido: aunque no esta alineado, puede servir para explorar interacciones sin filtros en entornos de investigacion.
- Generacion de contenido literario explicito: para autores que necesiten un asistente de escritura que no imponga restricciones de contenido.
- Evaluacion de tecnicas de cuantizacion: este modelo cuantizado permite probar el impacto de la cuantizacion EXL3 en la calidad de generacion frente al modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Tamano del repositorio: 18.4 GB, lo que sugiere que el modelo completo en precision cuantizada requiere al menos esa cantidad de VRAM para cargarse en memoria.
- Se recomienda una GPU con al menos 20 GB de VRAM para inferencia comoda (por ejemplo, RTX 3090, RTX 4090, A100 40GB o superior), aunque no se ha confirmado el requisito exacto.
- El formato EXL3 esta disenado para ExLlamaV3, que soporta GPUs NVIDIA con CUDA. No se menciona compatibilidad con otras librerias como llama.cpp u Ollama.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de informacion suficiente para comparar este modelo con alternativas de la misma categoria. El modelo base es un finetune de Qwen3-27B, pero no se conocen otros modelos cuantizados similares en el momento de redactar esta ficha.

## Limitaciones y advertencias

- Contenido explicito y NSFW: el modelo puede generar material sexualmente explicito, violencia o lenguaje ofensivo. No es adecuado para aplicaciones dirigidas a menores o entornos profesionales sin control de contenido.
- Modelo no alineado: al carecer de alineacion con valores humanos, puede producir respuestas sesgadas, toxicas o perjudiciales.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede inventar hechos o datos, especialmente en contextos largos.
- Limitaciones de contexto e idioma: no se ha especificado la longitud de contexto ni los idiomas soportados, por lo que su rendimiento en tareas multilingues o de contexto muy largo es incierto.
- Licencia Apache 2.0: permite uso comercial, pero el contenido generado puede estar sujeto a restricciones legales segun la jurisdiccion, especialmente por su naturaleza explicita.
- Para produccion, se recomienda implementar filtros de contenido y moderacion, dado el caracter no alineado del modelo.

## Enlaces

- Repositorio de la cuantizacion: https://huggingface.co/darkbit1001/ReadyArt-Dark-Scarlett-27B-v2.0-EXL3-4.50bpw-HB8HQ
- Modelo base: https://huggingface.co/ReadyArt/Dark-Scarlett-27B-v2.0
- Version GGUF del modelo base: https://huggingface.co/ReadyArt/Dark-Scarlett-27B-v2.0-GGUF
- Pagina de Caliper Bench del modelo: https://caliperbench.com/m/dark-scarlett-27b-v2.0/
- Pagina de Caliper Bench de la variante Thinking: https://caliperbench.com/m/dark-scarlett-27b-v2.0-thinking/
