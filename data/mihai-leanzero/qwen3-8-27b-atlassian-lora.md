# Mihai-LeanZero/Qwen3.8-27B-Atlassian-lora

## Resumen

Qwen3.8-27B-Atlassian-lora es un adaptador LoRA de rango 32 y escala 2.0 (aproximadamente 190 MB) desarrollado por LeanZero (Mihai-LeanZero) para el modelo base Qwen/Qwen3.8-27B. Este adaptador está diseñado para mejorar el conocimiento y las capacidades de generación de código y configuración dentro del ecosistema Atlassian (Jira, Confluence, Jira Service Management y Forge). Se aplica mediante mlx-lm o Rapid-MLX sobre una versión cuantizada a 8 bits del modelo base en formato MLX, y permite resolver tareas como la generación de apps completas de Forge, la creación de manifiestos de módulos válidos y la respuesta a preguntas técnicas sobre productos Atlassian.

El entrenamiento se realizó en varias rondas con datos específicos del dominio: documentación oficial de Forge, especificaciones OpenAPI de Jira, Confluence y JSM, respuestas de la comunidad de desarrolladores de Atlassian y apps generadas por el propio modelo y validadas con el validador oficial y TypeScript. En las pruebas internas, el adaptador eleva la tasa de identificación de identificadores Atlassian del 15 % al 69 % con thinking activado, y consigue que 14 de 25 manifiestos de Forge superen el validador oficial, mientras que el modelo base no supera ninguno. Además, mantiene una recuperación contextual del 100 % en ventanas de hasta 128k tokens.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen/Qwen3.8-27B (arquitectura del modelo base no especificada) |
| Parametros totales | No disponible (el adaptador ocupa ~190 MB; el modelo base no se especifica) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible (pruebas del adaptador: recuperación del 100 % a 4k, 32k y 128k tokens) |
| Tipos de cuantizacion | Base Q8 (8-bit) en MLX; adaptador sin cuantizar |
| Idiomas soportados | Inglés |
| Licencia | Apache 2.0 (adaptador; licencia del modelo base no especificada) |
| Formato de pesos | MLX (adaptador LoRA; modelo fusionado en MLX Q8) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 32 y escala 2.0 que se añade a los pesos del modelo base Qwen/Qwen3.8-27B. Al tratarse de un adaptador, no introduce una arquitectura nueva; hereda la del modelo base, que no está descrita en la información disponible. Se distribuye en formato MLX y está pensado para su uso con mlx-lm o Rapid-MLX, el fork de LeanZero. El entrenamiento se llevó a cabo en un Apple Silicon Mac Studio utilizando mlx-lm para el fine-tuning y mlx-node/mlx-lm para la cuantización.

El proceso se compone de dos rondas principales. En la ronda 1 se usaron aproximadamente 3,7 millones de tokens durante dos épocas, con 12 apps de Forge escritas por LeanZero y 5 simulaciones de Forge, 175 manifiestos de módulos generados con el esquema @forge/manifest 13.4 y validados con el validador de Atlassian, ejemplos de UI Kit, hechos extraídos de 1.820 secciones de documentación de Forge, datos de endpoints y scopes de las especificaciones OpenAPI de Jira, JSM, Assets, Admin y Confluence, 1.400 pares pregunta-respuesta, 337 respuestas de la comunidad y 220 hilos de la comunidad de desarrolladores. La ronda 3 añadió 1.500 pasos adicionales sobre 5,45 millones de tokens, con la mezcla de la ronda 1 como replay, las 4.117 secciones de documentación como material de lectura y 380 apps generadas por el propio modelo que superaron el validador, la allow-list y tsc, además de 51 manifiestos validados mediante muestreo por rechazo.

## Capacidades

- Generación de texto en inglés con conocimiento especializado en el ecosistema Atlassian: Forge, Jira, Confluence y Jira Service Management.
- Generación de apps completas de Forge a partir de una descripción breve, capaces de compilar contra los tipos reales de @forge/* (tsc) y de superar el validador oficial de Atlassian (12 de 25 apps y 14 de 25 manifiestos en las pruebas internas).
- Generación y corrección de manifiestos de módulos de Forge, incluyendo tareas de "fix-the-manifest" sobre manifiestos incompletos o erróneos.
- Respuesta a preguntas sobre documentación oficial de Forge con citas textuales extraídas de 1.820 secciones de documentación.
- Recuperación de información en contexto largo: needle recall del 100 % a 4k, 32k y 128k tokens.
- Soporte de modo de pensamiento: el modelo base admite thinking activado y desactivado; el adaptador mejora la precisión de identificadores en ambos modos.
- Reducción de bucles y no terminación en generaciones largas en comparación con el modelo base, con 0 bucles genuinos en la leg oficial frente a 2 en el base.
- Inferencia en tiempo real mediante Rapid-MLX y compatibilidad con el motor MLX de LM Studio.
- Soporte de decodificación especulativa (MTP) que acelera la decodificación hasta 1,38x en contextos de 2048 tokens.

## Casos de uso

- Desarrollo de apps de Forge: el adaptador genera el código completo de una app de Forge a partir de una especificación de alto nivel, incluyendo el manifiesto de módulos y los componentes de UI Kit, reduciendo el tiempo de scaffolding y los errores de validación en entornos de desarrollo.
- Migraciones de Atlassian: durante migraciones de Jira o Confluence, el modelo puede generar scripts y configuraciones basados en las especificaciones OpenAPI, y responder a preguntas sobre límites de scope, endpoints y permisos de las APIs.
- Soporte técnico en Jira Service Management: el modelo resuelve consultas sobre configuración de JSM, automatizaciones o uso de la API REST, a partir del conocimiento de la documentación oficial y de hilos de la comunidad.
- Validación de manifiestos en CI/CD: integrado en un pipeline de desarrollo, el modelo corrige manifiestos de Forge que no superan el validador oficial de Atlassian, generando versiones corregidas y reduciendo las iteraciones manuales.
- Documentación interna en Confluence: puede redactar o actualizar páginas de Confluence a partir de descripciones en lenguaje natural, manteniendo el formato y utilizando el vocabulario técnico adecuado del dominio Atlassian.
- Asistente para administradores de Atlassian: responde a preguntas sobre configuración de permisos, scopes de Forge o uso de Assets, facilitando tareas de administración diarias en Jira o Confluence.
- Respuestas a hilos de la comunidad de desarrolladores: al estar entrenado con 220 hilos de la comunidad de Atlassian, el modelo puede producir respuestas técnicamente correctas que sirven como base para asistencia en foros.
- Prototipado rápido de automatizaciones: a partir de una descripción de una regla de automatización o de un caso de uso, el modelo genera el código necesario o los pasos de configuración, acelerando la entrega de soluciones en entornos Atlassian.

## Benchmarks y rendimiento

| Prueba | Base Qwen3.8-27B | Adaptador (ronda T4) |
|---|---|---|
| Identificadores Atlassian pre-2026-04 / post (thinking on) | 15 % / 23 % | 69 % / 23 % |
| Identificadores (thinking off, servido) | no disponible | 62 % / 31 % |
| Manifiestos de Forge válidos (de 25) | 0 | 14 |
| Apps completas que superan todas las gates (de 25) | 0 | 12 |
| Bucles genuinos por leg (oficial / t0.6 / greedy / instruct) | 2 / 1 / 3 / 4 | 0 / 0 / 1 / 0 |
| No terminación por leg | 60 / 48 / 53 / 25 % | 25 / 15 / 28 / 13 % |
| Needle recall a 4k / 32k / 128k | 100 % / 100 % / 100 % | 100 % / 100 % / 100 % |
| Aceptación de MTP / speedup (128, 2k, 8k, 32k) | 53 % / 1,55x, 1,53x, 1,23x, 1,22x | 51 % / 1,26x, 1,38x, 1,34x, 1,21x |

Además, en las pruebas de validación del autor, la pérdida de validación en la mezcla de la ronda 3 bajó de 0,686 en el modelo anterior a 0,596 en la ronda T4. La divergencia KLD entre el modelo fusionado en 8-bit y el base más adaptador fue de 0,0407, con una coincidencia top-1 del 99,43 %. Estos resultados son internos del desarrollador y no están contrastados con benchmarks externos. No se han publicado resultados de benchmarks independientes en la información disponible.

## Requisitos de hardware

- El adaptador ocupa ~190 MB y se aplica sobre el modelo base cuantizado a 8-bit en formato MLX. No se especifica el tamaño de VRAM del modelo base; el adaptador está pensado para ejecutarse en Apple Silicon mediante MLX.
- El entrenamiento y la evaluación se realizaron en un Apple Silicon Mac Studio. La cantidad de RAM del equipo no se indica en la información disponible.
- Para el modelo fusionado Q8, se espera que sea ejecutable en sistemas con memoria unificada suficiente para un modelo de 27B en 8-bit, pero este dato no está confirmado en las especificaciones proporcionadas.
- Opciones de despliegue: Rapid-MLX (fork de LeanZero), LM Studio MLX engine y mlx-lm. El adaptador se resuelve desde una carpeta local, por lo que debe descargarse antes de su aplicación.
- Latencia y throughput: el modelo servido con Rapid-MLX alcanzó una aceleración de decodificación de 1,26x a 1,38x con MTP, con 27,9 tokens/s en contexto corto. No se proporcionan más métricas de rendimiento.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento Atlassian |
|---|---|---|---|---|---|
| Qwen/Qwen3.8-27B (base) | No confirmado (el nombre sugiere 27B) | No disponible | No especificada | HuggingFace | Identificadores 15 %; 0 manifiestos válidos |
| Mihai-LeanZero/Qwen3.8-27B-Atlassian-lora (este adaptador) | Adaptador ~190 MB | 128k en pruebas | Apache 2.0 | HuggingFace | Identificadores 69 %; 14/25 manifiestos válidos |
| Mihai-LeanZero/Qwen3.8-27B-Atlassian-Q8-mlx (modelo fusionado) | No disponible | No disponible | Apache 2.0 | HuggingFace | Mismo rendimiento que el adaptador (fusionado) |

No se han encontrado otros adaptadores LoRA específicos para Atlassian en la información disponible, por lo que la comparativa se limita al modelo base y al modelo fusionado.

## Limitaciones y advertencias

- El adaptador está entrenado únicamente en inglés y con datos centrados en Atlassian. Su rendimiento en otros idiomas o dominios no ha sido evaluado.
- Los benchmarks son internos del autor y se han medido en una única configuración de hardware (Apple Silicon). Los resultados pueden no replicarse en otros entornos.
- El adaptador depende del modelo base Qwen/Qwen3.8-27B. Debe aplicarse al modelo base cuantizado en MLX para funcionar. La licencia del modelo base no está especificada en la información proporcionada, por lo que podrían existir restricciones adicionales más allá de la licencia Apache 2.0 del adaptador.
- El modelo puede presentar alucinaciones, especialmente cuando se utiliza fuera de su dominio de entrenamiento. La model card indica que todavía hay tareas de "shape" que fallan, por lo que se recomienda validar las salidas con herramientas externas como el validador de Atlassian y tsc antes de usarlas en producción.
- Los datos de entrenamiento incluyen documentación y respuestas de la comunidad de Atlassian, por lo que el modelo puede reproducir errores o sesgos presentes en dichas fuentes.
- En generaciones largas, aunque se reducen los bucles, todavía se observan casos de no terminación, alcanzando hasta un 28 % en la leg greedy con temperatura 0.6, según las pruebas del autor.
- El adaptador no incluye el modelo base; es necesario descargar el base por separado y aplicar el adaptador localmente.

## Enlaces

- https://huggingface.co/Mihai-LeanZero/Qwen3.8-27B-Atlassian-lora
- https://huggingface.co/Mihai-LeanZero/Qwen3.8-27B-Atlassian-Q8-base-mlx
- https://huggingface.co/Mihai-LeanZero/Qwen3.8-27B-Atlassian-Q8-mlx
- https://leanzero.net/portfolio/atlassian-models
- https://leanzero.net/portfolio/cognirunner
- https://leanzero.net/portfolio/sentinel-vault
- https://leanzero.net/portfolio/leanzero-management
- https://leanzero.net/services/atlassian-migrations
- https://github.com/leanzero-srl/Rapid-MLX
