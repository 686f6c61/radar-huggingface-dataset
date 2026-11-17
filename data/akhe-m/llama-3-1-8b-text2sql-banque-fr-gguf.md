# akhe-m/Llama-3.1-8B-Text2SQL-Banque-FR-GGUF

## Resumen

Llama-3.1-8B-Text2SQL-Banque-FR-GGUF es un ajuste fino (fine-tuning) del modelo Meta Llama 3.1 8B Instruct, desarrollado por el usuario akhe-m, orientado a la traducción de preguntas de negocio en francés a consultas SQLite sobre un esquema bancario sintético concreto. El modelo parte de los pesos de `meta-llama/Llama-3.1-8B-Instruct` (8.030.261.312 parámetros) y se distribuye exclusivamente en formato GGUF Q4_K_M para su uso con llama.cpp.

El ajuste se realizó mediante QLoRA sobre una versión del modelo base cuantizada en 4 bits, con un adaptador LoRA de rango 8 aplicado a las 16 últimas capas (0,13 % de los parámetros). Posteriormente, el adaptador se fusionó en los pesos de 16 bits del modelo base, se convirtió a GGUF bf16 y se cuantizó a Q4_K_M, de modo que solo existe una cuantización en el artefacto final.

Su relevancia es acotada y muy específica: no es un modelo text-to-SQL generalista, sino una prueba de concepto sobre un único esquema de tres tablas (`clients`, `abonnements`, `facturas`) con datos generados por Faker y preguntas generadas por IA. Resulta útil como referencia metodológica para fine-tuning de text-to-SQL en dominios cerrados y en francés, pero no como solución lista para producción sobre esquemas arbitrarios.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1), ajuste fino con LoRA fusionado |
| Parámetros totales | 8.030.261.312 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens en la configuración recomendada por el autor (el prompt ocupa ~700 tokens); ventana nativa del modelo base no indicada en la información disponible |
| Tipos de cuantización | Q4_K_M (4,89 bits por peso); el autor indica que solo se publica esta cuantización |
| Idiomas soportados | francés (fr) |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | GGUF (`llama31-lora-v1-iter440-Q4_K_M.gguf`, 4,9 GB) |

## Arquitectura y entrenamiento

El modelo es un Llama 3.1 8B Instruct estándar (transformer decoder-only con atención causal) sobre el que se aplica un adaptador LoRA de rango 8, scale 20, dropout 0, sobre las 16 últimas capas, lo que representa el 0,13 % de los parámetros. El entrenamiento se hizo con QLoRA usando mlx-lm 0.32.2 sobre el modelo base cuantizado en 4 bits, con Adam, learning rate 1e-5, batch 2, pérdida enmascarada sobre el prompt (`--mask-prompt`) y semilla 42. Se ejecutaron 660 iteraciones (3 épocas) en 79 minutos sobre un Mac Apple M5 de 24 GB, y se retuvo la iteración 440 (2 épocas) por pérdida de validación de 0,067.

Los datos de entrenamiento son 441 ejemplos de entrenamiento y 50 de desarrollo, extraídos del split de train, con datos sintéticos generados por Faker y preguntas generadas por IA sobre un esquema de tres tablas (`clients`, `abonnements`, `facturas`). La fusión del adaptador se verificó comprobando que las 112 matrices objetivo equivalen a `W + scale · B·A` y que las 179 restantes son idénticas al modelo base. El pipeline de construcción fue: fusión del adaptador en pesos 16 bits (revisión `0e9e39f`), conversión a GGUF bf16 y cuantización a Q4_K_M con llama.cpp (commit `cd959ba`, build `b12110`). No se indica el número total de tokens de entrenamiento ni el uso de RLHF o DPO.

## Capacidades

- Generación de consultas SQLite a partir de preguntas de negocio en francés, limitadas al esquema bancario sintético de tres tablas.
- Generación de texto conversacional heredada del modelo base Llama 3.1 8B Instruct.
- Soporte de plantilla de chat de Llama 3.1, con la particularidad de que el autor exige fijar `date_string` a `26 Jul 2024` mediante `--chat-template-kwargs` para reproducir el prompt de entrenamiento.
- Decodificación glotona (temperatura 0) recomendada, con un máximo de 512 tokens de generación.
- Capacidad de corrección de errores SQLite cuando se usa junto con el agente del repositorio del autor, que añade una bucle de corrección.
- Capacidades multilingües: no se declaran más allá del francés; el modelo está etiquetado únicamente con `fr`.
- Tool calling, function calling, agentes multi-paso, visión, audio y modo thinking: no disponibles en la información proporcionada.

## Casos de uso

- Consulta de un esquema bancario sintético en francés: el modelo traduce preguntas como las de negocio sobre clientes, abonos y facturas a SQLite, siempre que se le proporcione el prompt de sistema exacto con las reglas SQLite, el `CREATE TABLE` y los valores posibles de columnas categóricas.
- Evaluación de pipelines text-to-SQL en dominios cerrados: sirve como referencia para medir execution accuracy (EX) y tasa de SQL válido en un esquema fijo, con un benchmark casero de 100 preguntas de validación y 100 de test.
- Prototipado de asistentes de análisis de datos en francés: integrado con el agente del repositorio, permite encadenar generación de SQL, ejecución y corrección de errores sobre la base sintética.
- Docencia e investigación sobre fine-tuning con LoRA/QLoRA: el repositorio documenta la fusión del adaptador, la verificación de matrices y el proceso de cuantización, lo que lo hace útil como caso de estudio reproducible.
- Despliegue local en hardware de consumo: al ser un GGUF Q4_K_M de 4,9 GB, cabe en GPUs consumer y en Macs con Apple Silicon, lo que permite experimentar con text-to-SQL sin infraestructura dedicada.
- Base para adaptaciones a otros esquemas: aunque no se ha probado en otros esquemas, el método (QLoRA sobre Llama 3.1 8B con prompt de sistema que incluye el esquema) es reutilizable como plantilla para fine-tunings equivalentes en otros dominios.

## Benchmarks y rendimiento

El autor publica un benchmark casero de 100 preguntas de validación y 100 de test sobre la base sintética, con execution accuracy (EX) como métrica principal. El test se usó una sola vez, tras todas las decisiones, con Llama 3.1 8B cuantizado en 4 bits bajo MLX y 0-shot:

| Configuración | SQL válido | EX |
|---|---|---|
| Sin adaptador (MLX 4 bits) | 86 % | 18 % |
| Con adaptador (MLX 4 bits) | 98 % | 42 % |
| McNemar (con vs. sin adaptador) | +12/-0, p < 0,001 | +27/-3, p < 0,001 |

El GGUF publicado no se evaluó sobre el test (ya consumido). Sobre validación, el autor reporta EX 43 % frente a 40 % del modelo MLX 4 bits con adaptador (+11/-8, McNemar p = 0,65) y SQL válido 94 % frente a 98 %, sin degradación detectable. El propio autor advierte que esos 43 % miden solo la ausencia de degradación y no constituyen un score del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5 GB para el archivo Q4_K_M de 4,9 GB, más overhead de contexto (4096 tokens recomendados).
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU con 8 GB o más de VRAM puede alojar el modelo, y el autor menciona descarga de capas a GPU con `-ngl 99` en Metal y CUDA.
- Cabe en GPU consumer: sí, por el tamaño del archivo; el autor entrenó y evaluó en un Mac Apple M5 de 24 GB.
- Opciones de despliegue: llama.cpp mediante `llama-server`, con `-c 4096`, `--port 8080` y `--chat-template-kwargs '{"date_string": "26 Jul 2024"}'`; el agente del repositorio se puede lanzar directamente o con Docker.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.1-8B-Text2SQL-Banque-FR-GGUF | 8,03 B | 4096 en la configuración recomendada | Text-to-SQL en francés sobre un esquema bancario sintético | Llama 3.1 Community License | GGUF Q4_K_M en Hugging Face |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 B | no disponible en la información proporcionada | Modelo generalista de instrucciones | Llama 3.1 Community License | Pesos originales en Hugging Face |
| Llama-3.1-8B-Text2SQL-Banque-FR-LoRA-MLX | 8,03 B (base) + adaptador LoRA | no disponible | Mismo ajuste, en formato adaptador MLX | Llama 3.1 Community License | Adaptador en Hugging Face |

No se dispone de datos de benchmarks de modelos text-to-SQL comparables en la información proporcionada, por lo que la comparación se limita a parámetros, formato y licencia.

## Limitaciones y advertencias

- El modelo no es text-to-SQL generalista: solo se entrenó y probó sobre un esquema de tres tablas (`clients`, `abonnements`, `facturas`) y no se ha testeado en ningún otro esquema.
- La mayoría de los errores son silenciosos: en el test, 98 consultas se ejecutan pero solo 42 son correctas, lo que implica un riesgo alto de respuestas plausibles pero incorrectas.
- La ganancia del ajuste proviene sobre todo de la elección de columnas, en parte arbitraria en el benchmark, más que de una mejor lógica SQL.
- Los tamaños de muestra son pequeños: 100 preguntas de test y 7 a 9 por familia de consultas.
- El dominio es estrecho: datos y preguntas sintéticos, generados por Faker e IA, sin validación con datos reales.
- El prompt de sistema debe reproducirse exactamente, incluido `date_string` fijado a `26 Jul 2024`; de lo contrario, el prompt difiere del medido y no hay aviso de ello.
- El modelo está etiquetado solo en francés; no se declaran capacidades multilingües.
- Licencia Llama 3.1 Community License: el uso comercial y la redistribución están sujetos a los términos de Meta y a su política de uso aceptable.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/akhe-m/Llama-3.1-8B-Text2SQL-Banque-FR-GGUF
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Adaptador LoRA (MLX): https://huggingface.co/akhe-m/Llama-3.1-8B-Text2SQL-Banque-FR-LoRA-MLX
- Repositorio del agente, código y benchmark: https://github.com/Akhem3/text-to-sql-agent
- Prompt de sistema (`build_messages`): https://github.com/Akhem3/text-to-sql-agent/blob/main/src/text2sql/prompts.py
- llama.cpp: https://github.com/ggml-org/llama.cpp
- mlx-lm: https://github.com/ml-explore/mlx-lm
- Licencia Llama 3.1 Community License: archivos `LICENSE` y `NOTICE` del repositorio del modelo
- Política de uso aceptable de Meta: archivo `USE_POLICY.md` del repositorio del modelo
