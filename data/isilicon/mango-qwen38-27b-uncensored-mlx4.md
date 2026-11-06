# isilicon/mango-qwen38-27b-uncensored-mlx4

## Resumen

Mango Qwen3.8 27B Uncensored MLX4 es una preservación y evaluación del checkpoint MLX en cuantización affine de 4 bits publicado por OrcaRouter bajo el identificador Qwen3.8-27B-Uncensored-MLX. El repositorio lo mantiene el usuario isilicon dentro de su colección "Mango tested models and preservation mirrors", cuyo objetivo es conservar los bytes exactos de configuraciones concretas y someterlas a una batería de evaluación reproducible con puntuaciones por pregunta, historial de experimentos y método de scoring público.

El modelo subyacente es un Qwen de 27B de parámetros afinado para eliminar restricciones de rechazo (uncensored), empaquetado en safetensors MLX con cuantización affine de 4 bits. El artefacto seleccionado ocupa 16,08 GB (14,98 GiB) repartidos en 13 ficheros principales. La relevancia de esta ficha no reside en el modelo base, sino en que el repositorio documenta una evaluación medida: 80,64/100 en un cribado histórico de 202 preguntas, 23,98 minutos de carga emparejada y 12/12 casos de agente mecánico superados, además de un experimento controlado que compara los niveles de esfuerzo de razonamiento medium y xhigh del modelo.

La licencia declarada es Apache 2.0 y los idiomas soportados son inglés y chino. El repositorio está marcado con `inference: false` en su model card, lo que indica que no está pensado para servirse directamente desde Hugging Face Inference API, sino para ejecutarse localmente con MLX en hardware Apple Silicon o, según documenta el autor, a través de TensorFold CUDA con el modelo draft DFlash2 preservado por separado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen, checkpoint MLX); detalles de atención y capas no disponibles |
| Parámetros totales | 27B (según denominación del checkpoint) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 64K tokens en la configuración de evaluación documentada; máximo nativo no disponible |
| Tipos de cuantización | Affine 4-bit (MLX); otras cuantizaciones no disponibles en este repositorio |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), 13 ficheros principales, 16,08 GB / 14,98 GiB |

## Arquitectura y entrenamiento

El checkpoint es una conversión MLX de un modelo Qwen de 27B afinado por OrcaRouter para uso sin censura. La model card no documenta la arquitectura interna (número de capas, cabezas, tipo de atención, uso de MoE o de atención lineal), ni el volumen o composición del dataset de entrenamiento, ni si se aplicaron fases de RLHF o DPO. Tampoco se especifica el proceso de cuantización más allá de la designación "affine 4-bit" propia del formato MLX.

La innovación documentada no está en el modelo sino en el entorno de evaluación. El autor ejecuta el artefacto MLX a través de TensorFold CUDA junto con un modelo draft DFlash2 preservado por separado, lo que sugiere decodificación especulativa para acelerar la inferencia. El experimento comparativo medium frente a xhigh fija el contexto en 64K, emplea el muestreo oficial de thinking y recoge 404 preguntas (403 válidas calificadas), 12 casos mecánicos de agente y 22 respuestas abiertas adicionales por nivel de esfuerzo. Los prompts, respuestas, suite congelada y checker se conservan sin cambios, y las puntuaciones automáticas corregidas sustituyen a un informe anterior de 82,88/84,29.

## Capacidades

- Generación de texto en inglés y chino.
- Razonamiento con niveles de esfuerzo configurables (medium y xhigh), con muestreo de thinking oficial.
- Capacidad de agente mecánico: 12/12 casos superados en ambos niveles de esfuerzo.
- Cumplimiento estricto de instrucciones (IFEval estricto): 36/39 en medium y 37/39 en xhigh sobre anotaciones válidas.
- Rendimiento en código: 92,50/100 en ambos niveles de esfuerzo.
- Capacidad social y de teoría de la mente: OpenToM 23/36 en medium y 27/36 en xhigh; EQ-Bench puro 83,31 y 81,03 respectivamente.
- Dominio de ciberseguridad evaluado: 77,22/100 en medium y 75,00/100 en xhigh.
- Afinado sin censura: el checkpoint base está designado explícitamente como uncensored.
- Soporte de tool calling y function calling: no documentado en la información disponible.

## Casos de uso

- Evaluación reproducible de cuantizaciones: el repositorio conserva los bytes exactos del subdirectorio 4-bit y publica puntuaciones por pregunta, lo que permite comparar esta configuración con otras cuantizaciones del mismo modelo sin ambigüedad de origen.
- Investigación sobre esfuerzo de razonamiento: el experimento medium frente a xhigh, con intervalos de confianza pareados y 10.000 remuestreos estratificados por tarea, sirve como plantilla metodológica para medir si merece la pena activar modos de thinking extendido en producción.
- Desarrollo local en Apple Silicon: al ser un artefacto MLX de 4 bits y 16,08 GB, encaja en flujos de trabajo con `mlx_lm` sobre equipos con memoria unificada suficiente, sin necesidad de GPU dedicada.
- Generación de código asistida: con 92,50/100 en la dimensión de coding de la suite Mango, es adecuado para tareas de completado y refactorización en inglés y chino, siempre que se valide el output.
- Análisis de documentos largos: la configuración de evaluación fija 64K tokens de contexto, suficiente para resumir contratos, informes o hilos de conversación extensos en una sola pasada.
- Simulación de diálogo social y evaluación de EQ: los resultados de OpenToM y EQ-Bench lo hacen utilizable en investigación sobre comportamiento social de modelos y en pruebas de robustez conversacional.
- Preservación y auditoría de artefactos: el repositorio documenta procedencia, licencia y configuración exacta, lo que facilita auditorías de cadena de custodia en entornos que exigen trazabilidad del checkpoint.

## Benchmarks y rendimiento

Cribado histórico de 202 preguntas más 12 casos de agente mecánico:

| Medida | Valor |
|---|---|
| Puntuación ponderada Mango | 80,64 / 100 |
| Carga emparejada | 23,98 minutos |
| Casos de agente mecánico | 12/12 |
| Errores de infraestructura / finalizaciones por longitud | 0 / 0 |

Experimento completo de 404 preguntas (403 válidas), contexto fijo de 64K, TensorFold 1.1.6 + DFlash2:

| Medida | Medium | Xhigh |
|---|---:|---:|
| Puntuación automática/mecánica /100 | 82,87 | 84,41 |
| Compuesto social/EQ /100 | 73,60 | 78,02 |
| EQ-Bench puro /100 | 83,31 | 81,03 |
| OpenToM correctas | 23/36 | 27/36 |
| Ciberseguridad /100 | 77,22 | 75,00 |
| Coding /100 | 92,50 | 92,50 |
| IFEval estricto · anotaciones válidas | 36/39 | 37/39 |
| Casos de agente mecánico | 12/12 | 12/12 |
| Carga registrada de 416 ítems, minutos | 34,92 | 101,94 |
| Suite emparejada fresca de 202 ítems, minutos | 10,94 | 48,81 |
| Errores / finalizaciones por longitud | 0 / 0 | 0 / 0 |

La diferencia xhigh menos medium es de +1,54 puntos con intervalo pareado del 95% de [-1,71, +4,82], calculado con 10.000 remuestreos estratificados por tarea y semilla 41, por lo que la muestra no establece una ganancia clara de calidad. Xhigh tardó 4,46 veces más en las preguntas emparejadas frescas.

Evaluación subjetiva ciega con dos calificadores independientes (Claude y Codex), escala sobre 10:

| Rúbrica /10 | Medium | Xhigh | Medium Claude / Codex | Xhigh Claude / Codex | Ítems |
|---|---:|---:|---:|---:|---:|
| Juicio interpersonal | 7,50 | 8,00 | 8,00 / 7,00 | 8,00 / 8,00 | 6 |
| Escritura creativa | 7,50 | 7,08 | 7,17 / 7,83 | 6,83 / 7,33 | 6 |
| Fidelidad a la fuente | 9,90 | 9,10 | 9,80 / 10,00 | 8,80 / 9,40 | 5 |
| Inferencia fundamentada | 6,30 | 8,80 | 7,20 / 5,40 | 9,00 / 8,60 | 5 |
| Global | 7,77 | 8,18 | 8,00 / 7,55 | 8,09 / 8,27 | 22 |

La ventaja subjetiva pareada de xhigh sobre medium es de +0,41 [+0,05, +0,75] en la media de los dos calificadores; Claude por separado da +0,09 [-0,41, +0,55] y Codex +0,73 [+0,45, +1,00]. Los calificadores difirieron 0,64 puntos de media y coincidieron exactamente en 24 de 44 respuestas.

## Requisitos de hardware

- VRAM o memoria unificada estimada: el artefacto pesa 16,08 GB en 4 bits, por lo que se necesita al menos esa cifra más el overhead de contexto; con 64K de contexto conviene reservar margen adicional.
- GPU recomendadas: el formato es MLX, orientado a Apple Silicon con memoria unificada (familias M-series con 32 GB o más). Para CUDA, el autor documenta ejecución mediante TensorFold CUDA con el draft DFlash2, pero no detalla GPU concretas.
- Cabe en GPU de consumo: en el ecosistema Apple, sí en equipos con memoria unificada suficiente; en GPU NVIDIA de consumo no hay datos publicados sobre esta configuración MLX.
- Opciones de despliegue: `mlx_lm` para MLX; TensorFold CUDA con DFlash2 para el camino CUDA documentado. No se confirma compatibilidad con vLLM, llama.cpp, Ollama ni TGI para este artefacto concreto.
- Latencia y throughput: la suite fresca emparejada de 202 ítems tardó 10,94 minutos en medium y 48,81 en xhigh; la carga registrada de 416 ítems, 34,92 y 101,94 minutos respectivamente. No se publican tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Evaluación publicada |
|---|---|---|---|---|---|
| Mango Qwen3.8 27B Uncensored MLX4 | 27B | 64K en la configuración evaluada | Apache 2.0 | safetensors MLX 4-bit | 80,64/100 en cribado de 202 preguntas; 82,87/84,41 en suite completa |
| orcarouter/Qwen3.8-27B-Uncensored-MLX (base) | 27B | no disponible | Apache 2.0 | MLX | no disponible en la información proporcionada |
| Otras cuantizaciones del mismo Qwen3.8 27B | 27B | no disponible | Apache 2.0 | no disponible | no disponible |

No se dispone de datos de benchmarks de modelos alternativos de la misma categoría en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa con modelos de otros autores.

## Limitaciones y advertencias

- El modelo está afinado como uncensored, lo que implica una reducción deliberada de los rechazos ante peticiones sensibles; requiere filtros y políticas de uso propias antes de exponerlo a usuarios finales.
- Riesgo de alucinación no cuantificado en la información disponible; la rúbrica de fidelidad a la fuente obtiene 9,90 en medium y 9,10 en xhigh, pero sobre solo 5 ítems, muestra demasiado pequeña para generalizar.
- Idiomas limitados a inglés y chino; no hay evidencia de rendimiento en castellano.
- El repositorio declara `inference: false`, por lo que no está pensado para servirse desde la Inference API de Hugging Face.
- El formato MLX limita el despliegue fuera del ecosistema Apple Silicon salvo por la ruta TensorFold CUDA documentada, que no detalla GPU compatibles ni requisitos de versión.
- La comparación medium frente a xhigh no establece una ganancia clara de calidad (+1,54 puntos con intervalo que cruza cero) y xhigh multiplica por 4,46 el tiempo de ejecución, por lo que medium es la opción práctica según la regla económica del autor.
- Una anotación congelada de IFEval especifica `#` como letra; el checker de referencia sustituye una letra alfabética aleatoria, por lo que ese caso queda sin puntuar en ambos niveles de esfuerzo.
- El modelo base, la modificación y la cuantización son trabajo de los creadores originales; este repositorio solo añade preservación atribuida y evaluación de la configuración exacta.
- No se documentan sesgos conocidos, composición del dataset de entrenamiento ni detalles de la afinación, lo que dificulta evaluar riesgos específicos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/isilicon/mango-qwen38-27b-uncensored-mlx4
- Modelo base: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored-MLX
- Colección Mango tested models and preservation mirrors: https://huggingface.co/collections/isilicon/mango-tested-models-and-preservation-mirrors-6ae3b73994c895ab42e360d2
- Dataset de resultados de evaluación Mango: https://huggingface.co/datasets/isilicon/mango-evaluation-results
- Comunidad Infinity en Discord: https://discord.gg/5n5YDbQCMy
