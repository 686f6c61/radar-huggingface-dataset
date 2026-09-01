# OpenCOReTechnologies/CORe-Pico-V1.5-Identityless

## Resumen

CORe-Pico-V1.5-Identityless es un modelo de lenguaje pequeño (SLM) desarrollado por OpenCOReTechnologies, una iniciativa vinculada a la plataforma de chat OpenCORe centrada en la alineación de modelos. Con aproximadamente 183 millones de parámetros, se trata de un modelo compacto diseñado para tareas de generación de texto con un enfoque en la alineación y la transparencia del razonamiento, según la filosofía del proyecto.

El modelo se distribuye bajo licencia Apache 2.0, lo que permite uso comercial y modificación sin restricciones significativas. Su nombre sugiere una variante "sin identidad" (Identityless), lo que podría implicar un entrenamiento orientado a reducir sesgos o a eliminar la personalidad del modelo, aunque no se proporcionan detalles técnicos al respecto en la documentación disponible.

La relevancia de este modelo radica en su tamaño reducido, que lo hace adecuado para despliegue en entornos con recursos limitados, como dispositivos edge o aplicaciones embebidas. Sin embargo, la información pública es escasa: no se han publicado especificaciones detalladas de arquitectura, datos de entrenamiento ni benchmarks, lo que limita su evaluación objetiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 183.086.592 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo incluye safetensors y GGUF) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

No se ha publicado informacion tecnica sobre la arquitectura del modelo. Dado su tamaño (183M parametros), es probable que se trate de un transformer decoder-only convencional, similar a otros modelos pequeños como TinyLlama o Phi-2, pero esto es una especulacion basada en el estado del arte y no en datos confirmados.

Los datos de entrenamiento, el numero de tokens procesados, la composicion del dataset y si se utilizaron tecnicas como RLHF o DPO son desconocidos. El nombre "Identityless" sugiere un posible enfasis en reducir la personalidad o los sesgos del modelo, pero no hay documentacion que lo confirme.

## Capacidades

- Generacion de texto: el modelo puede generar texto coherente, aunque su capacidad exacta no ha sido evaluada publicamente.
- Razonamiento: se desconoce su nivel de competencia en tareas de razonamiento logico o matematico.
- Codigo: no hay informacion sobre su capacidad para generar o comprender codigo.
- Tool calling: no hay soporte documentado para function calling o tool use.
- Capacidades multilingues: no se especifican idiomas soportados.
- Capacidades especiales: el nombre sugiere un enfoque en "identidad neutra", posiblemente orientado a reducir sesgos de personalidad, pero no hay evidencia publica de ello.

## Casos de uso

- Prototipado rapido: al ser un modelo pequeno con licencia permisiva, es adecuado para experimentar con aplicaciones de texto sin invertir en infraestructura de alto coste.
- Educacion e investigacion: su tamaño permite ejecutarlo en portatiles o GPUs de gama baja, facilitando el estudio de modelos de lenguaje en entornos academicos.
- Asistentes de escritura basica: puede emplearse para generar borradores, resumir textos cortos o completar frases en aplicaciones con requisitos modestos de calidad.
- Despliegue en dispositivos edge: su reducido numero de parametros lo hace candidato para ejecucion en Raspberry Pi, moviles o sistemas embebidos con limitaciones de memoria.
- Filtrado y clasificacion de texto: puede adaptarse mediante fine-tuning para tareas de clasificacion, extraccion de informacion o moderacion de contenido.
- Chatbots de dominio especifico: con fine-tuning en un corpus concreto, podria servir como base para asistentes conversacionales en nichos verticales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos sobre MMLU, HumanEval, GSM8K u otras evaluaciones estandar que permitan comparar su rendimiento con modelos similares.

## Requisitos de hardware

- VRAM estimada: con 183M parametros, en precision FP32 necesitaria aproximadamente 0,7 GB de VRAM. Con cuantizacion INT8, alrededor de 0,35 GB; con INT4, unos 0,2 GB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente. Tarjetas como NVIDIA GTX 1050 Ti, RTX 2060 o incluso CPUs modernas pueden ejecutar el modelo sin problemas.
- Compatibilidad con consumer GPU: si, cabe en practicamente cualquier GPU de consumo actual.
- Opciones de despliegue: al incluir pesos en GGUF, es compatible con llama.cpp, Ollama y otros motores de inferencia locales. Tambien puede servirse con vLLM o TGI si se convierte a los formatos adecuados.
- Latencia y throughput: no se dispone de mediciones oficiales, pero en una GPU moderna se esperan latencias inferiores a 100 ms por token y throughput de cientos de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| CORe-Pico-V1.5-Identityless | 183M | no disponible | Apache 2.0 | HuggingFace |
| TinyLlama 1.1B | 1.100M | 2.048 | Apache 2.0 | HuggingFace |
| Phi-2 | 2.700M | 2.048 | MIT | HuggingFace |
| Qwen2-0.5B | 500M | 32.768 | Apache 2.0 | HuggingFace |

La comparativa se basa en modelos de tamaño similar disponibles en el ecosistema open source. CORe-Pico es significativamente mas pequeño que TinyLlama o Phi-2, lo que implica menor capacidad pero tambien menores requisitos de hardware. Sin datos de benchmarks, no es posible establecer comparaciones de rendimiento.

## Limitaciones y advertencias

- Informacion insuficiente: la falta de documentacion tecnica impide conocer sus capacidades reales, limitaciones de contexto o idiomas soportados.
- Riesgo de alucinacion: como todos los modelos de lenguaje, puede generar contenido falso o inventado, especialmente al carecer de datos sobre su entrenamiento.
- Sesgos desconocidos: no hay informacion sobre los datos de entrenamiento, por lo que los sesgos potenciales son imposibles de evaluar.
- Sin garantias de calidad: al no existir benchmarks publicos, no se puede verificar su rendimiento en tareas estandar.
- Soporte limitado: al ser un proyecto pequeno, es probable que el mantenimiento y las actualizaciones sean escasos o inexistentes.
- Uso en produccion: sin evaluaciones independientes, no se recomienda su uso en sistemas criticos o aplicaciones donde la precision sea fundamental.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OpenCOReTechnologies/CORe-Pico-V1.5-Identityless
- Plataforma OpenCORe: https://opencore.one/
