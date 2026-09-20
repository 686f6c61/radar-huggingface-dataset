# open-athena/Snowball-67B-A2B-Math-RL-E2-Unreg-Step20

## Resumen

Snowball-67B-A2B-Math-RL-E2-Unreg-Step20 es un checkpoint de investigación publicado por el usuario open-athena dentro de la campaña Snowball, asociada al proyecto Marin (repositorio marin-community/marin). Se trata de un modelo de mezcla de expertos (MoE) con 67.078.876.160 parámetros totales, orientado a razonamiento matemático y ajustado mediante aprendizaje por refuerzo (RL) sobre el brazo experimental E2 sin regularización, en el paso 20 de entrenamiento.

Su relevancia no es la de un modelo de propósito general, sino la de un artefacto de reproducibilidad: según la propia model card, es el checkpoint exacto que respalda una fila concreta de resultados del experimento de matemáticas de Snowball 67B-A2B. El autor advierte de que el estado del router ha sido reparado (SFT router-bias repaired) y de que repositorios con nombres parecidos de la familia laion/rl-snowball-* pueden contener exportaciones con router mutable que colapsan durante la inferencia, por lo que no son intercambiables con este artefacto.

El modelo se distribuye únicamente en formato safetensors, con un repositorio de 134,2 GB y licencia "other". No hay información publicada sobre longitud de contexto, idiomas soportados, cuantizaciones ni soporte en frameworks de despliegue, y el propio autor lo clasifica explícitamente como research checkpoint y no como release de producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) con router, implementación grug_moe del ecosistema Marin (según etiquetas del repositorio) |
| Parámetros totales | 67.078.876.160 |
| Parámetros activos | No disponible (la nomenclatura A2B sugiere del orden de 2.000 millones de parámetros activos, pero no se confirma en la información proporcionada) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible; el repositorio solo contiene pesos safetensors y no se publican versiones GGUF, AWQ, GPTQ ni similares |
| Idiomas soportados | No disponible |
| Licencia | other (licencia no estándar; es necesario consultar los términos del autor para cualquier uso, incluido el comercial) |
| Formato de pesos | safetensors (deben conservarse juntos config.json, los ficheros del tokenizer y todos los shards listados en model.safetensors.index.json) |

## Arquitectura y entrenamiento

La información disponible identifica el modelo como una mezcla de expertos (MoE) construida sobre la implementación grug_moe del ecosistema Marin, con 67.078.876.160 parámetros totales. El nombre del artefacto, 67B-A2B, apunta a una configuración de tipo sparse en la que solo una fracción reducida de los expertos se activa por token, pero no se detalla el número de expertos, la estrategia de enrutamiento ni la dimensión oculta. Un aspecto técnico central es la manipulación del sesgo del router: este checkpoint incorpora una reparación del sesgo aprendido durante la fase SFT (SFT router-bias repaired), y el autor señala que exportaciones con router mutable de la misma campaña pueden colapsar en inferencia, lo que convierte la integridad del router en un requisito funcional, no en un detalle de implementación.

El entrenamiento corresponde a un brazo de aprendizaje por refuerzo sin regularización (arm E2 unregularized) y este artefacto es el paso 20 de dicho brazo, descrito como el checkpoint final y con mejor agregado de su configuración. No se especifica el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas concretas de alineación como RLHF, DPO o variantes de RL verificable. La model card remite al fichero MATH_EVALS.md del archivo de evidencias para consultar las advertencias metodológicas de evaluación, que no se reproducen aquí.

## Capacidades

- Generación de texto y razonamiento matemático: es la capacidad sobre la que se ha evaluado el checkpoint, con resultados en AIME24, MATH-500 y OlympiadBench.
- Resolución de problemas de competición: el modelo está entrenado con RL específicamente sobre matemáticas, aunque sus puntuaciones en las pruebas de mayor dificultad son bajas (AIME24: 18,00; OlympiadBench: 14,67).
- Generación de soluciones paso a paso: el formato de evaluación matemática implica cadenas de razonamiento, si bien no se documenta un modo "thinking" explícito ni presupuesto de razonamiento configurable.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso con herramientas: no disponible.
- Capacidades multilingües: no disponible; no se declara ningún idioma en los metadatos del repositorio.
- Capacidades especiales (visión, audio, decodificación especulativa, etc.): no disponible.
- Reproducibilidad experimental: el checkpoint permite reproducir la fila correspondiente del experimento Snowball 67B-A2B math-RL siempre que se preserve la reparación del sesgo del router.

## Casos de uso

- Reproducción de resultados de investigación: cargar exactamente este checkpoint (paso 20, brazo E2 sin regularizar) y ejecutar la evaluación sobre AIME24, MATH-500 y OlympiadBench con el mismo harness documentado en el archivo de evidencias, para verificar las cifras 18,00 / 71,40 / 14,67.
- Estudio de la dinámica del router en MoE: comparar el comportamiento de este artefacto con router reparado frente a las exportaciones con router mutable de la familia laion/rl-snowball-*, que según el autor colapsan en inferencia; es un caso de estudio directo sobre estabilidad de enrutamiento.
- Investigación sobre RL sin regularización: utilizar el brazo E2 unregularized como línea base frente a brazos regularizados de la misma campaña para medir el efecto de la regularización en el rendimiento matemático y en la estabilidad del entrenamiento.
- Análisis de la evolución por pasos de entrenamiento: comparar el paso 20 con checkpoints posteriores del mismo brazo para estudiar curvas de mejora o degradación y decidir criterios de selección de checkpoints.
- Generación de soluciones matemáticas para curación de datasets: emplear el modelo como generador de trazas de solución en problemas de nivel MATH-500, con verificación posterior obligatoria, dado que un 71,40 en MATH-500 implica que una parte relevante de las respuestas será incorrecta.
- Auditoría de artefactos de investigación: verificar la integridad del repositorio (config.json, tokenizer, shards del índice safetensors) y documentar el linaje del checkpoint a partir de la ruta S3 de origen y del issue del experimento.
- Estudio de licencias en modelos derivados de RL: analizar las implicaciones de una licencia "other" en artefactos de investigación antes de reutilizarlos en cualquier pipeline, dado que no se conceden términos explícitos de uso comercial.

## Benchmarks y rendimiento

Resultados publicados en la model card para este checkpoint (held-out):

| Benchmark | Resultado |
|---|---|
| AIME24 | 18,00 |
| MATH-500 | 71,40 |
| OlympiadBench | 14,67 |

No se han publicado en la información disponible resultados comparativos con otros modelos, ni cifras de MMLU, HumanEval, GSM8K u otros benchmarks generales. Las advertencias metodológicas de estas evaluaciones están recogidas en MATH_EVALS.md dentro del archivo de evidencias, fichero que no forma parte de la información proporcionada.

## Requisitos de hardware

Estimaciones a partir del recuento real de parámetros (67.078.876.160); no son cifras publicadas por el autor.

- Precisión completa (FP16/BF16): aproximadamente 134 GB solo para los pesos, más caché KV y activaciones. Requiere del orden de 2 GPU de 80 GB (H100, A100 80 GB) como mínimo para carga en memoria.
- Cuantización a 8 bits: alrededor de 67 GB de pesos, por lo que cabría en una única GPU de 80 GB (H100, A100 80 GB) dejando margen para el contexto.
- Cuantización a 4 bits: alrededor de 34 GB de pesos en teoría, lo que exigiría al menos una GPU de 48 GB (A6000, L40S) o más; no hay cuantizaciones publicadas ni soporte documentado para esta arquitectura MoE personalizada, por lo que el proceso sería manual.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) ni en tarjetas de 16-24 GB, salvo con cuantizaciones muy agresivas que no están disponibles y sin garantía de compatibilidad con grug_moe.
- Despliegue: no se documenta soporte en vLLM, TGI, llama.cpp, Ollama ni otros servidores de inferencia. Al tratarse de una arquitectura grug_moe del ecosistema Marin, lo previsible es necesitar el código original del proyecto o una integración propia.
- Latencia y throughput: no disponibles. Cualquier estimación basada en los parámetros activos sería especulativa al no conocerse el número de expertos activados por token ni el soporte de kernels.

## Comparativa con modelos similares

No se dispone de cifras de rendimiento comparables en la información proporcionada. La siguiente tabla recoge únicamente datos estructurales de alternativas de la misma categoría (modelos de razonamiento matemático de gran tamaño); los datos de los modelos comparativos proceden de su documentación pública y no se han verificado en esta búsqueda.

| Modelo | Parámetros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Snowball-67B-A2B-Math-RL-E2-Unreg-Step20 | 67,08 B | MoE (A2B) | No disponible | other | Solo safetensors; sin cuantizaciones ni soporte de servidores de inferencia declarado |
| Qwen2.5-Math-72B | 72 B | Denso | 4.096 tokens | Licencia propia de Qwen | Pesos safetensors; ampliamente soportado en vLLM, TGI y llama.cpp (vía GGUF de la comunidad) |
| DeepSeek-R1-Distill-Qwen-32B | 32 B | Denso | 128.000 tokens (heredado de Qwen2.5) | MIT | safetensors y múltiples cuantizaciones comunitarias; soporte en vLLM, Ollama y llama.cpp |
| Llama-3.3-70B-Instruct | 70 B | Denso | 128.000 tokens | Licencia comunitaria de Meta | safetensors y cuantizaciones extendidas; soporte amplio en frameworks de inferencia |

Diferencias clave: frente a estas alternativas de producción, el checkpoint de Snowball es un artefacto de investigación con 0 descargas y 0 likes en el momento de la consulta, sin cuantizaciones, sin idiomas declarados y con una licencia no estándar que condiciona su reutilización. Su ventaja es la trazabilidad experimental (issue, ruta S3 de origen y archivo de evidencias), no la facilidad de despliegue.

## Limitaciones y advertencias

- Es un research checkpoint, no un release de producción: el propio autor indica que su utilidad es limitada salvo que se preserve la reparación del sesgo del router o la integridad de un router congelado.
- Riesgo de colapso en inferencia si se sustituye por repositorios con nombres similares de la familia laion/rl-snowball-*: esas exportaciones usan un router mutable y pueden no funcionar.
- Las cifras de AIME24 (18,00) y OlympiadBench (14,67) indican un rendimiento bajo en matemáticas de competición de alta dificultad; MATH-500 se sitúa en 71,40, lo que implica un porcentaje relevante de respuestas incorrectas.
- Riesgo de alucinación: no hay datos publicados de tasas de alucinación ni de calibración; en tareas matemáticas, una salida con formato correcto puede contener razonamiento inválido.
- Sesgos conocidos: no disponibles. No se documenta ninguna evaluación de sesgo, toxicidad o sesgo de género, idioma o dominio.
- Limitaciones de contexto e idioma: se desconoce la longitud de contexto y los idiomas soportados; no se declara ninguno en los metadatos del repositorio.
- Restricciones de licencia: la licencia es "other", sin términos explícitos publicados en la información disponible; cualquier uso comercial requiere consultar al autor.
- Ausencia de validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin informes independientes de terceros.
- Requisitos de integridad: deben conservarse conjuntamente config.json, los ficheros del tokenizer y todos los shards referenciados por model.safetensors.index.json; separarlos invalida el artefacto.
- Advertencias de evaluación: la model card remite a MATH_EVALS.md en el archivo de evidencias para conocer los caveats de las puntuaciones; esas advertencias no se incluyen en la información disponible aquí.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/open-athena/Snowball-67B-A2B-Math-RL-E2-Unreg-Step20
- Issue del experimento en el proyecto Marin: https://github.com/marin-community/marin/issues/7786
- Archivo de evidencias (dataset con MATH_EVALS.md): https://huggingface.co/datasets/penfever/snowball-67b-a2b-math-rl-artifacts
- Ruta del artefacto de origen (S3, no navegable por HTTP): s3://marin-us-east-02a/marin/exports/snowball-bias-repaired/rl-snowball-e2-rno2a-unreg-grug-67b-a2b-20260731-104020-c86049/global_step_20/policy/
- Búsqueda web: no se encontraron enlaces relevantes. Los resultados devueltos (open.global, openai.com, openoffice.org y lequipe.fr) no guardan relación con este modelo ni con la campaña Snowball.
