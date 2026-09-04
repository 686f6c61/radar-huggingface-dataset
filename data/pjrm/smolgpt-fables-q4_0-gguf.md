# PJRM/smolgpt-fables-Q4_0-GGUF

## Resumen

PJRM/smolgpt-fables-Q4_0-GGUF es una conversión al formato GGUF del modelo SmolGPT-Fables v1, un modelo de lenguaje pequeño de 1,71 mil millones de parámetros desarrollado por neonforestmist y adaptado a partir de SmolLM2. Este modelo está especializado en la generación de fábulas y cuentos cortos en inglés, y su principal atractivo es su capacidad de producir historias estructuradas de una a seis escenas con personajes nombrados, escenarios definidos y un final orientado a una moraleja. La versión aquí documentada aplica cuantización Q4_0, lo que reduce el tamaño del repositorio a aproximadamente 1 GB y permite ejecutarlo en entornos locales mediante llama.cpp, tanto en CLI como en servidor.

El modelo es relevante para desarrolladores e investigadores que buscan un modelo pequeño, eficiente y abierto (licencia Apache 2.0) para tareas de narración creativa controlada. Al estar cuantizado, es apto para ejecutarse en hardware modesto, lo que facilita su integración en aplicaciones educativas, herramientas de escritura asistida y prototipos de narrativa generativa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (adaptado de SmolLM2) |
| Parametros totales | 1.711.376.384 (1,71 mil millones) |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_0 (GGUF) |
| Idiomas soportados | Inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q4_0); el modelo base usa safetensors |

## Arquitectura y entrenamiento

SmolGPT-Fables v1 se basa en la arquitectura SmolLM2 de Hugging Face, un transformer decoder-only de 1,71 mil millones de parámetros. El entrenamiento se realizó sobre el dataset neonforestmist/smolgpt-markdown-stories, un conjunto de fábulas en formato markdown. No se dispone de información sobre la cantidad exacta de tokens de entrenamiento, la composición detallada del dataset ni el uso de técnicas de alineación como RLHF o DPO. La innovación principal es la adaptación del modelo a la generación controlada de fábulas, donde a partir de una idea simple se produce una narración coherente con estructura de una a seis escenas.

## Capacidades

- Generación de texto narrativo en inglés, especializado en fábulas y cuentos cortos con moraleja.
- Generación controlada: el modelo estructura la historia en escenas, con personajes nombrados, escenarios claros y un final orientado a un objetivo.
- Seguimiento de instrucciones básicas para guiar el contenido de la historia.
- Compatible con llama.cpp, tanto en CLI como en servidor, gracias al formato GGUF.
- No dispone de soporte documentado para tool calling, visión, audio ni razonamiento matemático avanzado.

## Casos de uso

- Generación de fábulas personalizadas para niños: el modelo transforma una idea simple en una fábula completa con moraleja, ideal para aplicaciones educativas o plataformas de cuentos interactivos.
- Contenido para redes sociales: creación de microfábulas publicables en plataformas de microblogging o narrativa breve.
- Prototipado narrativo en juegos: generación de historias cortas para misiones o eventos en videojuegos narrativos, donde el tamaño pequeño permite iterar rápidamente.
- Asistencia a escritores: el modelo sirve como fuente de inspiración para tramas, personajes y escenarios en el género de la fábula.
- Material didáctico en el aula: profesores pueden generar fábulas adaptadas a temas específicos para enseñar valores y trabajar la comprensión lectora.
- Generación de contenido para audiolibros o podcasts narrativos: producción de textos para narración oral, posteriormente convertidos a audio con sistemas TTS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5 GB con la cuantización Q4_0 (estimación basada en el peso del modelo de ~1 GB más la caché KV).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, por ejemplo RTX 3050 o GTX 1650; también puede ejecutarse en CPU.
- En consumer GPU: sí, cabe en GPUs modestas; también funciona en CPU con aproximadamente 2 GB de RAM.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server) y otras herramientas compatibles con GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Uso principal |
|---|---|---|---|---|
| SmolGPT-Fables v1 (Q4_0 GGUF) | 1,71B | No disponible | Apache 2.0 | Generación de fábulas |
| SmolLM2-1.7B | 1,71B | No disponible | Apache 2.0 | Modelo generalista |
| TinyLlama-1.1B | 1,1B | No disponible | Apache 2.0 | Modelo generalista ligero |
| Qwen2.5-1.5B | 1,5B | No disponible | Apache 2.0 | Modelo generalista multilingüe |

## Limitaciones y advertencias

- Es un modelo especializado en inglés y en un género narrativo concreto; su rendimiento en otras tareas o idiomas puede ser bajo.
- No se dispone de evaluaciones de sesgos ni de alucinaciones.
- La longitud de contexto no está especificada, lo que limita su uso en tareas que requieran contexto largo.
- Puede generar historias con incoherencias o morales poco claras, especialmente si la idea inicial es ambigua.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar las condiciones del modelo base para confirmar la atribución.

## Enlaces

- https://huggingface.co/PJRM/smolgpt-fables-Q4_0-GGUF
- https://huggingface.co/neonforestmist/smolgpt-fables
- https://github.com/neonforestmist/SmolGPT-Fables
- https://huggingface.co/datasets/neonforestmist/smolgpt-markdown-stories
- https://github.com/ggerganov/llama.cpp
