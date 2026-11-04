# mhseo2/opd_sfto7amr1_s4000_olmo31_32b_think_amr1math-step20

## Resumen

`mhseo2/opd_sfto7amr1_s4000_olmo31_32b_think_amr1math-step20` es un checkpoint experimental de destilación on-policy (on-policy distillation, OPD) publicado por el usuario `mhseo2`. El modelo parte de un SFT de OLMo 3 Base de 7B ajustado sobre el conjunto de matemáticas AM-DeepSeek-R1-0528 (204.800 filas) y lo destila hacia `allenai/Olmo-3.1-32B-Think`, que actúa como profesor. El resultado es un estudiante de 7.298.011.136 parámetros (7,3B) que hereda el estilo de razonamiento del profesor de 32B.

El interés técnico del checkpoint reside en el procedimiento: destilación on-policy con pérdida de divergencia KL inversa por token sobre las propias rollouts del estudiante, sin recompensa de tarea, usando decodificación a temperatura 1 y respuestas de hasta 32.768 tokens. Se trata de un artefacto de investigación (20 pasos de entrenamiento) más que de un modelo listo para producción, y su model card indica que las evaluaciones en AIME 2025, AIME 2026 y HMMT Feb 2025 están pendientes.

La relevancia es doble: por un lado, demuestra la viabilidad de transferir capacidades de razonamiento matemático desde un profesor de 32B a un estudiante de 7B dentro del ecosistema OLMo (totalmente abierto); por otro, documenta el coste de infraestructura (2 nodos × 4 H100 en BSC MareNostrum 5) y el código exacto utilizado, lo que facilita la reproducibilidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia OLMo 3; detalles de capas y atención no disponibles en la información proporcionada) |
| Parámetros totales | 7.298.011.136 (7,3B) |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible (las rollouts de entrenamiento alcanzan 32.768 tokens, pero no se confirma la ventana máxima del modelo) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (3 shards, repo de 14,6 GB) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de `mhseo2/sft_olmo3base7b_amr1_0528_math_n204800-step4000`, un SFT de OLMo 3 Base 7B sobre el dataset de matemáticas AM-DeepSeek-R1-0528 (204.800 filas). Sobre esa base se aplica destilación on-policy hacia `allenai/Olmo-3.1-32B-Think` (revisión `97ade57a9cc5`). En cada paso se muestrean 60 prompts del propio conjunto SFT del estudiante, con 4 rollouts por prompt, temperatura 1 y respuestas de hasta 32.768 tokens. La pérdida es una KL inversa por token (estimador k1, top-32 del profesor) calculada sobre las rollouts del estudiante, sin recompensa de tarea. El optimizador es AdamW con learning rate constante de 5e-6 y weight decay 0.01.

El checkpoint publicado corresponde al paso 20 del entrenamiento. La infraestructura empleada fue BSC MareNostrum 5: 2 nodos × 4 H100, con el estudiante en FSDP y vLLM, y el profesor servido con vLLM en tensor parallelism 2. El código está disponible en el árbol `mopdRL` (commit `f1bcc9eb82a8bcc7a053a23dd1afcae82fb591e4`, paquete `bsc-olmo-base-opd-2026-10-26`). No se especifica en la información disponible la composición del dataset más allá de su origen matemático ni si hubo etapas adicionales de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento matemático: el entrenamiento se centra en problemas de matemáticas del dataset AM-DeepSeek-R1-0528, con estilo de razonamiento heredado de Olmo-3.1-32B-Think.
- Modo "think": el nombre del checkpoint y el profesor indican soporte de razonamiento extendido con cadenas de pensamiento largas (hasta 32.768 tokens en las rollouts de entrenamiento).
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente; el formato de razonamiento largo es compatible con flujos multi-paso, pero no se confirma soporte nativo de agentes.
- Capacidades multilingües: no disponible.
- Capacidades especiales (visión, audio): no disponible; el modelo es de texto.

## Casos de uso

- Resolución de problemas matemáticos de competición: el modelo está entrenado específicamente sobre problemas de matemáticas con razonamiento largo, por lo que es adecuado para generar soluciones paso a paso en entornos de evaluación tipo AIME o HMMT, aunque sus puntuaciones aún no están publicadas.
- Generación de datos sintéticos de razonamiento: al haber sido destilado de un profesor de 32B, puede utilizarse para producir cadenas de razonamiento matemático que sirvan como datos de entrenamiento para modelos más pequeños o para aumentar datasets existentes.
- Investigación en destilación on-policy: el checkpoint es un artefacto directamente reutilizable para estudiar la evolución de la KL inversa respecto al profesor a lo largo de los pasos de entrenamiento, comparando con checkpoints posteriores del mismo run.
- Tutoría matemática automatizada: con su formato de razonamiento paso a paso, puede emplearse en asistentes educativos que expliquen la resolución de problemas, siempre que se valide la corrección de las respuestas.
- Prototipado en entornos con recursos limitados: al ser un modelo de 7,3B con licencia Apache 2.0, puede desplegarse en una sola GPU para experimentar con técnicas de razonamiento antes de escalar a modelos mayores.
- Reproducibilidad de pipelines OPD: junto con el código `mopdRL` y los hashes SHA-256 publicados, permite reproducir el entrenamiento y verificar la integridad de los pesos en un entorno de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que las evaluaciones (mean@8 en AIME 2025, AIME 2026 y HMMT Feb 2025) están en cola y se añadirán cuando finalicen.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa para un modelo de 7,3B en BF16, se requieren aproximadamente 14,6 GB solo para pesos, más memoria para KV cache y activaciones; en cuantización de 8 bits o 4 bits el requisito baja, pero no se han publicado configuraciones validadas.
- GPU recomendadas: H100 (las empleadas en el entrenamiento, 8 por nodo en 2 nodos); para inferencia, una A100 40/80 GB o una RTX 4090 24 GB podrían alojar los pesos en BF16, aunque no se confirma compatibilidad.
- ¿Cabe en GPU de consumo? Probablemente en RTX 4090 (24 GB) en BF16, y en GPUs de 16 GB con cuantización, pero no hay datos oficiales.
- Opciones de despliegue: vLLM (usado en el entrenamiento para estudiante y profesor) y, presumiblemente, llama.cpp/Ollama si se generan GGUF, aunque no se publican conversiones.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| opd_sfto7amr1_s4000_olmo31_32b_think_amr1math-step20 | 7,3B | no disponible | Apache 2.0 | Checkpoint OPD de 20 pasos, sin benchmarks publicados |
| allenai/Olmo-3.1-32B-Think (profesor) | 32B | no disponible | no disponible en la información proporcionada | Profesor de la destilación, mayor capacidad |
| mhseo2/sft_olmo3base7b_amr1_0528_math_n204800-step4000 (base) | 7,3B | no disponible | Apache 2.0 (según tags del modelo derivado) | SFT previo sin destilación OPD |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Es un checkpoint intermedio (paso 20) de un proceso de destilación; no se ha validado su calidad final ni se han publicado evaluaciones.
- Riesgo de alucinación inherente a los modelos de razonamiento matemático, especialmente en problemas fuera de la distribución del dataset AM-DeepSeek-R1-0528.
- Sesgos conocidos: no documentados en la información proporcionada; al derivar de OLMo 3 Base y de un dataset específico de matemáticas, puede heredar sesgos de ambos.
- Limitaciones de idioma: no se especifican los idiomas soportados; el entrenamiento se centra en matemáticas, presumiblemente en inglés, pero no se confirma.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero deben respetarse las condiciones de los modelos base y del dataset de origen (AM-DeepSeek-R1-0528), cuyas licencias no se detallan aquí.
- Para producción: al no haber benchmarks ni validación de robustez, no se recomienda su despliegue en sistemas críticos sin una evaluación exhaustiva previa.
- El nombre del repositorio y la model card indican un contexto de investigación (BSC MareNostrum 5, código `mopdRL`), no un lanzamiento estable.

## Enlaces

- HuggingFace: https://huggingface.co/mhseo2/opd_sfto7amr1_s4000_olmo31_32b_think_amr1math-step20
- Modelo base (SFT): https://huggingface.co/mhseo2/sft_olmo3base7b_amr1_0528_math_n204800-step4000
- Profesor: https://huggingface.co/allenai/Olmo-3.1-32B-Think
- Código `mopdRL`: no se proporciona URL en la información disponible (commit `f1bcc9eb82a8bcc7a053a23dd1afcae82fb591e4`, paquete `bsc-olmo-base-opd-2026-10-26`)
