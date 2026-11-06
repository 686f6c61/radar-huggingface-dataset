# macmacmacmac/CLEF-Screen-V2

## Resumen

CLEF-Screen-V2 es un clasificador de seguridad especializado en la detección de inyección de prompts (prompt injection) y manipulación de salidas de herramientas en entornos de agentes. Lo desarrolla el usuario independiente `macmacmacmac` y se publica como un checkpoint completo en formato LiteRT (`.tflite`) listo para despliegue en dispositivos y entornos edge. No es un modelo generativo: es una cabeza de clasificación (`JointSchemaHead`) de 121.762.820 parámetros y 122 tensores, montada sobre un backbone congelado denominado Cloudflare CLEF-Flash.

El modelo aborda un problema concreto: filtrar contenido malicioso en el canal `tool_output`, es decir, detectar cuando la salida de una herramienta externa (resultado de una API, contenido web, respuesta de un servicio) intenta inyectar instrucciones al agente que la consume. Se entrena únicamente la cabeza sobre representaciones ocultas precalculadas del backbone, lo que reduce el coste de cómputo del ajuste fino a 90 minutos en una GPU AMD MI355X de 288 GB.

Es relevante ahora porque la evaluación de seguridad en pipelines de agentes exige clasificadores ligeros y desplegables localmente, y porque el autor publica métricas de desarrollo reproducibles (AUC de 0,9840 en dev y 0,9833 en test) junto con las puntuaciones por fila. No obstante, el propio autor advierte que se trata de mediciones de desarrollo, no de garantías de despliegue, y que no existe replicación independiente ni evaluación frente a ataques adaptativos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabeza de clasificación `JointSchemaHead` sobre backbone congelado Cloudflare CLEF-Flash (LiteRT) |
| Parametros totales | 121.762.820 (cabeza, 122 tensores) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (la cabeza se distribuye en BF16 como contrato de despliegue) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | `other` (no especificada en la información disponible) |
| Formato de pesos | LiteRT / TFLite (repositorio completo de checkpoint CLEF LiteRT) |

## Arquitectura y entrenamiento

La arquitectura separa backbone y cabeza. El backbone es el Cloudflare CLEF-Flash en formato LiteRT y permanece congelado durante todo el proceso; la cabeza `JointSchemaHead` es la única parte entrenada y se inicializa a partir de un ajuste fino previo del mismo componente. El entrenamiento se realizó con el script `ft_clef.py` en modo `--cache-only`, es decir, las representaciones ocultas del backbone se precalcularon una vez con la versión fijada de PyTorch de `clef-flash` y se reutilizaron en las tres épocas. El coste total fue de 44 minutos de codificación del backbone más 90 minutos de entrenamiento y evaluación en una instancia AMD MI355X de 288 GB.

Los hiperparámetros documentados son: 3 épocas, learning rate 3e-05, batch de 16 y `pos_weight` de 1,0. El conjunto de entrenamiento se reconstruyó para equilibrar clases: 16.322 filas (8.232 positivas y 8.090 negativas) con hash SHA-256 verificable, sustituyendo el split anterior congelado que era un 92 % positivo (94.864 positivas frente a 8.026 negativas). El nuevo conjunto incorpora 86 filas minadas del catálogo de técnicas del mundo real y 184 filas sintéticas de suplantación de herramientas, etiquetadas como sintéticas en la procedencia. La selección de época se hizo exclusivamente sobre AUC de dev: 0,9635 en la época 1, 0,9811 en la época 2 y 0,9840 en la época 3, frente a una línea base de cabeza sin entrenar de 0,7516.

## Capacidades

- Clasificación binaria de contenido en el canal `tool_output` para detectar intentos de inyección de prompts.
- Detección de suplantación de herramientas (tool spoofing), incluyendo filas sintéticas específicamente generadas para este patrón.
- Reconocimiento de técnicas del mundo real incorporadas desde un catálogo de técnicas minado.
- Salida de puntuación por fila, lo que permite umbralizar la decisión según la política de seguridad del despliegue.
- Ejecución local en formato LiteRT, sin dependencia de infraestructura de servidor.
- Tarea `action_authorization_guard`: contemplada en el esquema, pero con n=0 en esta ejecución, por lo que no está entrenada ni evaluada.
- No soporta generación de texto, tool calling, razonamiento multi-paso ni capacidades multimodales.
- Idiomas: únicamente inglés.

## Casos de uso

- Filtrado de salidas de herramientas en agentes: el clasificador se intercala entre la respuesta de una API externa y el contexto del agente, y bloquea o marca las salidas con puntuación superior al umbral antes de que el modelo generativo las consuma. Es adecuado por su tamaño reducido y su formato LiteRT, que permite ejecutarlo en la misma máquina que el agente.
- Defensa contra inyección indirecta en pipelines de recuperación: en un sistema RAG, cada fragmento recuperado de una fuente no confiable pasa por el clasificador antes de incorporarse al prompt. La AUC de 0,9833 en test sugiere buena separación, aunque el FPR de 0,054 implica que aproximadamente 1 de cada 20 fragmentos legítimos se marcaría.
- Auditoría posterior de tráfico de agentes: las puntuaciones por fila publicadas en el repositorio sirven como referencia para calibrar umbrales y comparar contra el tráfico real registrado en producción.
- Detección de suplantación de herramientas en plataformas de plugins: cuando un agente invoca herramientas de terceros, el clasificador verifica que la respuesta no simule ser de otra herramienta ni introduzca instrucciones encubiertas.
- Despliegue en edge o en dispositivos con recursos limitados: el formato LiteRT y la separación backbone-cabeza permiten ejecutar solo la cabeza sobre representaciones precalculadas o sobre el backbone ya desplegado en el dispositivo.
- Investigación en seguridad de agentes: como checkpoint de referencia reproducible (con hashes de procedencia y puntuaciones por fila) para comparar nuevas técnicas de ataque y defensa en el canal `tool_output`.

## Benchmarks y rendimiento

| Conjunto | n | Positivas / negativas | AUC | TPR@0,5 | FPR@0,5 |
|---|---|---|---|---|---|
| Dev (época 3) | 21.977 | 20.282 / 1.695 | 0,9840 | 0,939 | 0,050 |
| Test congelado (evaluación única) | 21.965 | 20.271 / 1.694 | 0,9833 | 0,940 | 0,054 |
| Dev, cabeza sin entrenar (línea base) | 21.977 | 20.282 / 1.695 | 0,7516 | No disponible | No disponible |

No se han publicado resultados frente a ataques adaptativos ni replicaciones independientes. El autor califica explícitamente todas las cifras como mediciones de desarrollo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. La cabeza tiene 121,7 M de parámetros en BF16, lo que supone aproximadamente 244 MB solo para los pesos de la cabeza; el backbone añade un coste no especificado.
- GPU de entrenamiento documentada: AMD MI355X con 288 GB (instancia spot `gpu-mi355x1-288gb-spot` de DigitalOcean).
- GPU recomendadas para inferencia: no disponibles. El formato LiteRT está orientado a despliegue en CPU, GPU integrada y aceleradores edge, pero el autor no publica requisitos mínimos.
- ¿Cabe en GPU de consumo? No disponible. Por el tamaño de la cabeza es plausible, pero falta el dato del backbone.
- Opciones de despliegue: LiteRT / TensorFlow Lite (formato nativo del checkpoint). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un clasificador de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (clasificadores de prompt injection en formato LiteRT) ni datos de rendimiento de terceros que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Los conjuntos de dev y test son aproximadamente un 92 % positivos, de modo que el FPR se estima sobre unas 1.700 negativas; la incertidumbre de esa métrica es alta y puede no trasladarse a tráfico real con otra prevalencia.
- Solo se entrena y evalúa la tarea `tool_output_filter`; `action_authorization_guard` tiene n=0 y no está cubierta.
- No existe evaluación frente a ataques adaptativos ni replicación independiente. El autor subraya que las cifras son mediciones de desarrollo, no garantías de despliegue.
- El checkpoint se subió antes de la puerta de replicación de la cadena congelada prevista para el martes-v2, según indica la procedencia.
- Idioma limitado al inglés: el rendimiento en otros idiomas no está caracterizado.
- Licencia `other` sin texto especificado en la información disponible: es necesario consultar el repositorio antes de cualquier uso comercial.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de falsos positivos y falsos negativos en la clasificación, con impacto directo en la política de bloqueo del agente.
- El repositorio ocupa 18,3 GB, lo que incluye artefactos de procedencia y puntuaciones además de los pesos; conviene revisar el contenido antes de descargarlo completo.
- Sin descargas ni likes en el momento de la consulta: no hay validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/macmacmacmac/CLEF-Screen-V2
- No se han encontrado en la información proporcionada otros enlaces a papers, blogs, repositorios o demos.
