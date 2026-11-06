# mhseo2/opd_sfto7nemo_s600_olmo31_32b_think_ot3math-step40

## Resumen

`opd_sfto7nemo_s600_olmo31_32b_think_ot3math-step40` es un checkpoint de investigación publicado por el usuario mhseo2 en Hugging Face. Se trata de un modelo de 7.298.011.136 parámetros (aproximadamente 7,3 mil millones) obtenido mediante destilación on-policy (on-policy distillation, OPD) a partir de un modelo base ya ajustado con supervisión: `mhseo2/sft_olmo3base7b_nemotronmathv2_high_notool_n204800-step600`, que a su vez deriva de la familia OLMo 3 de AllenAI.

El objetivo del entrenamiento es transferir capacidades de razonamiento matemático desde un profesor mucho mayor, `allenai/Olmo-3.1-32B-Think` (32 mil millones de parámetros), hacia un estudiante de 7 mil millones. El checkpoint publicado corresponde al paso 40 de un proceso de destilación con pérdida de divergencia KL inversa por token sobre las propias rollouts del estudiante, sin recompensa de tarea. Es relevante por dos motivos: documenta una receta reproducible de OPD con infraestructura europea (BSC MareNostrum 5) y porque el estudiante conserva el tamaño manejable de 7B, lo que lo hace desplegable en hardware de una sola GPU de 80 GB.

El modelo está especializado en matemáticas y en modo "think" (razonamiento extendido con cadenas de pensamiento largas, hasta 32.768 tokens por respuesta durante el entrenamiento). La licencia es Apache 2.0 y los pesos se distribuyen en formato safetensors en tres fragmentos. No hay resultados de evaluación publicados todavía: el autor indica que las pruebas en AIME 2025, AIME 2026 y HMMT Feb 2025 están en cola.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia OLMo 3, según el modelo base) |
| Parametros totales | 7.298.011.136 |
| Parametros activos | no disponible (no es MoE según los datos disponibles) |
| Longitud de contexto | no disponible en la información proporcionada (el entrenamiento usó respuestas de hasta 32.768 tokens) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no hay GGUF en el repo) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (3 fragmentos: model-00001-of-00003, model-00002-of-00003, model-00003-of-00003) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base OLMo 3 (transformer decoder-only), aunque la model card no detalla la configuración interna (número de capas, dimensión oculta, cabezas de atención). El proceso de entrenamiento es una destilación on-policy: en cada paso se generan 60 prompts de matemáticas de OpenThoughts3 (sin respuestas) con 4 rollouts por prompt, a temperatura 1 y hasta 32.768 tokens de respuesta. Sobre esas rollouts del propio estudiante se calcula una pérdida de divergencia KL inversa por token respecto al profesor `allenai/Olmo-3.1-32B-Think`, usando la aproximación k1 con el top-32 del profesor. No hay recompensa de tarea ni verificación de respuestas: la señal es puramente la distribución del profesor.

Los hiperparámetros documentados son: learning rate constante de 5e-6, optimizador AdamW con weight decay 0.01, y un total de 40 pasos publicados en este checkpoint. El conjunto de prompts son 53.105 preguntas de matemáticas de OpenThoughts3. El entrenamiento se ejecutó en BSC MareNostrum 5 con 2 nodos de 4 H100 cada uno: el estudiante con FSDP y vLLM, y el profesor con vLLM en tensor parallelism 2. El código usado es el árbol `mopdRL` en el commit `f1bcc9eb82a8bcc7a053a23dd1afcae82fb591e4` (paquete `bsc-olmo-base-opd-2026-10-26`).

## Capacidades

- Generación de texto y razonamiento matemático en modo "think", con cadenas de pensamiento largas (hasta 32.768 tokens durante el entrenamiento).
- Resolución de problemas matemáticos de competición, orientada por la destilación desde un profesor de 32B especializado en matemáticas.
- Razonamiento paso a paso explícito, heredado del formato de OpenThoughts3 y del profesor Olmo-3.1-32B-Think.
- Plantilla de chat incluida (`chat_template.jinja`), lo que facilita el uso conversacional vía `transformers`.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso general: no disponible (el entrenamiento se limita a matemáticas).
- Capacidades multilingües: no disponible.
- Capacidades de visión o audio: no disponibles (modelo de texto).

## Casos de uso

- Investigación en destilación on-policy: sirve como checkpoint intermedio reproducible (paso 40) para estudiar la dinámica de la KL inversa con profesor top-32, comparando con checkpoints posteriores de la misma receta.
- Generación de soluciones matemáticas paso a paso: adecuado para producir cadenas de razonamiento largas en problemas de competición, aprovechando el modo think y la ventana de hasta 32.768 tokens de respuesta usada en entrenamiento.
- Generación de datos sintéticos matemáticos: puede emplearse para producir rollouts de razonamiento que luego se filtren por corrección y se usen para SFT de modelos menores.
- Evaluación de recetas de destilación: al ser un checkpoint temprano (paso 40) de un estudiante de 7B destilado de un profesor de 32B, permite medir la curva de aprendizaje y el coste/beneficio de la OPD frente a SFT clásico.
- Base para fine-tuning posterior en dominios STEM: al estar especializado en matemáticas y mantener 7B parámetros, es un punto de partida razonable para ajustes con datos propios de física, estadística o ingeniería.
- Despliegue en hardware de una sola GPU para prototipos: con 14,6 GB en safetensors en bf16, cabe en GPUs de 24 GB o más, lo que facilita pruebas locales de razonamiento matemático sin infraestructura distribuida.
- Estudio de alineación con profesores de mayor tamaño: útil para analizar cómo se transfieren sesgos y estilos de razonamiento de un profesor de 32B a un estudiante de 7B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que las evaluaciones (mean@8 en AIME 2025, AIME 2026 y HMMT Feb 2025) están en cola en los "sky eval workers" y que los resultados se añadirán cuando finalicen.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 14,6 GB solo para pesos, más KV cache; en la práctica, unos 16-20 GB según longitud de contexto y batch.
- VRAM estimada en cuantización de 8 bits: alrededor de 7,3 GB de pesos; en 4 bits, unos 3,7 GB (no se publican GGUF, habría que generarlos).
- GPU recomendadas: H100 80 GB, A100 80 GB o A100 40 GB para inferencia en bf16 con contexto largo; también válidas L40S, RTX 6000 Ada o RTX 4090 (24 GB) para bf16 con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en bf16 con contexto limitado, y en GPUs de 16 GB si se cuantiza a 8 bits.
- Opciones de despliegue: `transformers` (formato nativo safetensors), vLLM (usado durante el entrenamiento para el estudiante y el profesor), TGI. Para llama.cpp u Ollama sería necesario convertir los pesos a GGUF, lo que no está disponible en el repo.
- Latencia y throughput: no disponibles. El entrenamiento usó vLLM con FSDP en 2 nodos de 4 H100, pero no se publican cifras de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| opd_sfto7nemo_s600_olmo31_32b_think_ot3math-step40 | 7,3B | no disponible | Matemáticas (destilado de Olmo-3.1-32B-Think) | Apache 2.0 | Hugging Face (repo de investigación) |
| allenai/Olmo-3.1-32B-Think (profesor) | 32B | no disponible | Razonamiento general con modo think | no disponible en la información | Hugging Face (AllenAI) |
| mhseo2/sft_olmo3base7b_nemotronmathv2_high_notool_n204800-step600 (base del estudiante) | ~7,3B | no disponible | Matemáticas (SFT con Nemotron-Math-v2) | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada, por lo que la comparación se limita a tamaño, especialización y licencia.

## Limitaciones y advertencias

- No hay resultados de evaluación publicados: no se puede afirmar qué rendimiento tiene en AIME, HMMT ni otros benchmarks matemáticos.
- Es un checkpoint intermedio (paso 40) de un proceso de destilación; no es un modelo final ni pulido para producción.
- El entrenamiento se limita a matemáticas (OpenThoughts3); el rendimiento en otros dominios (código, conocimiento general, multilingüe) no está documentado y probablemente sea inferior al de un modelo generalista.
- Riesgo de alucinación en razonamientos matemáticos: la pérdida es KL al profesor, sin verificación de corrección, por lo que puede imitar el estilo del profesor sin garantizar resultados correctos.
- Sesgos: no documentados. Al heredar del profesor Olmo-3.1-32B-Think y de OpenThoughts3, puede reproducir sesgos de esos datos.
- Idiomas soportados no disponibles; la plantilla de chat y el tokenizador provienen del modelo base OLMo 3, pero no se especifica cobertura multilingüe.
- Licencia Apache 2.0 permite uso comercial, pero al ser un artefacto de investigación sin evaluación, su uso en producción no está recomendado sin validación propia.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 2026-11-01; es un artefacto muy reciente y sin validación comunitaria.
- El nombre del repo sugiere una relación con "olmo31_32b" (el profesor), pero el modelo es de 7B; conviene no confundir el tamaño del estudiante con el del profesor.

## Enlaces

- Hugging Face: https://huggingface.co/mhseo2/opd_sfto7nemo_s600_olmo31_32b_think_ot3math-step40
- Modelo base (SFT): https://huggingface.co/mhseo2/sft_olmo3base7b_nemotronmathv2_high_notool_n204800-step600
- Profesor: https://huggingface.co/allenai/Olmo-3.1-32B-Think (revisión `97ade57a9cc5`)
- Repositorio de código `mopdRL`: commit `f1bcc9eb82a8bcc7a053a23dd1afcae82fb591e4` (paquete `bsc-olmo-base-opd-2026-10-26`); no se proporciona URL en la información disponible.
