# open-athena/Snowball-67B-A2B-Math-RL-E17f-Step16

## Resumen

Snowball-67B-A2B-Math-RL-E17f-Step16 es un checkpoint de investigación publicado por la organización open-athena en HuggingFace, dentro de la campaña de aprendizaje por refuerzo (RL) denominada Snowball, asociada al ecosistema Marin (marin-community). No es un modelo listo para producción: la propia model card lo etiqueta explícitamente como `research-artifact` y advierte de que su utilidad está limitada a que se preserve la integridad del router congelado.

El modelo tiene 67.078.876.160 parámetros totales (unos 67,08 mil millones), según los datos reales de los ficheros safetensors, y la nomenclatura "A2B" del nombre apunta a una arquitectura de mezcla de expertos (MoE) con del orden de 2 mil millones de parámetros activos por token, coherente con la etiqueta `grug_moe` del repositorio. El checkpoint corresponde al paso 16 del brazo de entrenamiento "E17f", seleccionado por ser el último utilizable antes del colapso observado en el paso 20.

Su relevancia es fundamentalmente metodológica: documenta un punto concreto de una curva de RL sobre datos de matemáticas (la ruta de origen menciona `deepscaler`) y sirve para estudiar dinámicas de enrutamiento, colapso de routers y reproducibilidad de resultados experimentales. Sus métricas held-out son bajas en términos absolutos (AIME24 14,00; MATH-500 60,80; OlympiadBench 9,33), lo que refuerza su condición de artefacto intermedio de investigación más que de modelo desplegable.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE), según la etiqueta `grug_moe`; implementación no estándar y no detallada en la información disponible |
| Parámetros totales | 67.078.876.160 (67,08 mil millones), dato real de los safetensors |
| Parámetros activos | No confirmado en la documentación; la nomenclatura "A2B" del nombre sugiere del orden de 2 mil millones activos |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No se publican cuantizaciones; el repositorio contiene pesos sin cuantizar en safetensors (134,2 GB, consistente con bf16/fp16) |
| Idiomas soportados | No disponible |
| Licencia | other (`license:other`), sin términos adicionales publicados |
| Formato de pesos | safetensors, con particionado descrito en `model.safetensors.index.json` |
| Tamaño del repositorio | 134,2 GB |
| Pipeline declarado | reinforcement-learning |
| Etapa de entrenamiento | Brazo E17f, paso global 16 |
| Estado del router | Sesgo de router congelado, deriva cero |
| Fecha de creación | 2026-09-20 |
| Fecha de actualización | 2026-09-20 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La información disponible indica una arquitectura de mezcla de expertos (MoE) con 67,08 mil millones de parámetros totales y una proporción de parámetros activos del orden de 2 mil millones (nomenclatura A2B). La etiqueta `grug_moe` sugiere una implementación de MoE propia del ecosistema Marin, distinta de las implementaciones estándar de transformers, pero no hay documentación pública sobre el número de expertos, la estrategia de enrutamiento, la dimensión oculta ni el mecanismo de atención en el material proporcionado.

En cuanto al entrenamiento, el modelo procede de una campaña de RL sobre tareas matemáticas: la ruta del artefacto de origen incluye `skyrl` (el framework de RL de SkyPilot/SkyRL) y `deepscaler`, lo que apunta a un ajuste por refuerzo sobre un conjunto de problemas matemáticos de tipo DeepScaleR. El checkpoint exportado corresponde al `global_step_16` del brazo `E17f`. El detalle técnico diferencial declarado por el autor es el estado del router: sesgo de router congelado con deriva cero, condición que el autor considera imprescindible para que el modelo no colapse en inferencia. El autor advierte además que repositorios con nombres similares (`laion/rl-snowball-*`) pueden contener exportaciones con router mutable que se degradan durante la inferencia y no deben usarse como sustituto. No se documentan en la información disponible el volumen de tokens de entrenamiento, la composición exacta del dataset, ni si hubo fases de RLHF o DPO adicionales.

## Capacidades

- Generación de texto y razonamiento matemático: es la capacidad objetivo del entrenamiento por RL, orientada a problemas de competición (AIME, MATH-500, OlympiadBench).
- Resolución de problemas matemáticos de nivel de competición: el entrenamiento se realizó sobre datos tipo DeepScaleR, aunque los resultados held-out son modestos.
- Razonamiento multi-paso: presumiblemente soportado por el entrenamiento en RL sobre problemas que requieren cadenas de razonamiento, aunque no se documenta explícitamente el formato de pensamiento.
- Tool calling / function calling: no documentado.
- Soporte de agentes: no documentado.
- Capacidades multilingües: no disponibles; no se declara ninguna lista de idiomas.
- Capacidades especiales (visión, audio, thinking mode explícito): no documentadas.
- Generación de código: no documentada como objetivo de entrenamiento.

## Casos de uso

- Reproducción de experimentos de RL: el checkpoint permite reproducir exactamente la fila reportada en el experimento Snowball 67B-A2B y contrastarla con el archivo de evidencias, algo crítico para trabajos de reproducibilidad en investigación.
- Estudio del colapso de routers en MoE: al ser el último checkpoint utilizable antes del colapso del paso 20, sirve como referencia para analizar qué cambia en el enrutamiento entre el paso 16 y el paso 20.
- Auditoría de integridad de artefactos: el modelo permite verificar la diferencia entre exportaciones con router congelado y exportaciones con router mutable, y validar si una copia concreta colapsa en inferencia.
- Investigación sobre RL para matemáticas: sirve como punto de comparación intermedio en curvas de aprendizaje, útil para estudiar la relación entre pasos de RL y métricas held-out en AIME24, MATH-500 y OlympiadBench.
- Baseline negativo o de control: sus puntuaciones (AIME24 14,00; OlympiadBench 9,33) lo convierten en un punto de referencia bajo frente al que medir mejoras de checkpoints posteriores o de otras recetas de RL.
- Docencia e investigación en sistemas MoE: permite a grupos de investigación examinar un MoE de 67B con ~2B activos en un entorno controlado y con requisitos de licencia de tipo investigación.
- Análisis de conjuntos de datos de matemáticas: al provenir de un pipeline sobre datos tipo DeepScaleR, puede usarse para estudiar qué tipos de problemas inducen mejoras o degradaciones durante el RL.

## Benchmarks y rendimiento

Los únicos resultados publicados en la información disponible son los de evaluación held-out del checkpoint, reportados por el autor:

| Benchmark | Resultado | Notas |
|---|---|---|
| AIME24 | 14,00 | Evaluación held-out del paso 16 del brazo E17f |
| MATH-500 | 60,80 | Evaluación held-out del paso 16 del brazo E17f |
| OlympiadBench | 9,33 | Evaluación held-out del paso 16 del brazo E17f |

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible. El autor indica que las puntuaciones y las advertencias sobre la evaluación están registradas en `MATH_EVALS.md`, dentro del archivo de evidencias en HuggingFace. No se dispone de datos de latencia ni de throughput.

## Requisitos de hardware

Las siguientes cifras son estimaciones derivadas del recuento real de parámetros (67,08 mil millones) y del tamaño del repositorio (134,2 GB); el autor no publica requisitos de hardware ni cuantizaciones oficiales.

- Pesos sin cuantizar (bf16/fp16): aproximadamente 134 GB solo en pesos. Con caché KV y activaciones, el requisito práctico se sitúa en el rango de 150-180 GB de VRAM, por lo que no cabe en ninguna GPU individual.
- Despliegue sin cuantizar: requiere paralelismo tensorial, por ejemplo 2x H100 80 GB (ajustado), 4x A100 80 GB o 8x A100 40 GB.
- Cuantización a 8 bits (aproximada, no publicada): en torno a 67 GB de pesos; cabría en 1x H100 80 GB o en configuraciones multi-GPU con 2x A100 40 GB.
- Cuantización a 4 bits (aproximada, no publicada): en torno a 34 GB de pesos; cabría en 2x RTX 4090 (48 GB), 1x A6000 48 GB o 1x RTX 6000 Ada 48 GB.
- GPU consumer: viable solo con cuantización agresiva y paralelismo. Con 67B totales, una única RTX 4090 de 24 GB no es suficiente ni siquiera en 4 bits sin offloading.
- Offloading: al ser un MoE con del orden de 2 mil millones de parámetros activos, el offloading de expertos a RAM del sistema es una estrategia plausible, pero exigiría del orden de 134 GB de RAM para el conjunto completo de pesos.
- Opciones de despliegue: no se documenta compatibilidad con vLLM, llama.cpp, Ollama, TGI ni otros motores. Al tratarse de una arquitectura no estándar (`grug_moe`) con router congelado, la compatibilidad con motores genéricos no está garantizada y no se proporcionan instrucciones de inferencia.
- Latencia y throughput: no disponible.
- Consumo de disco: 134,2 GB para el repositorio completo; el autor recomienda conservar juntos `config.json`, los ficheros del tokenizer y todos los shards listados en `model.safetensors.index.json`.

## Comparativa con modelos similares

No se documentan en la información disponible modelos comparables de la misma categoría con datos verificables. La única comparación posible con el material aportado es interna a la campaña Snowball:

| Modelo | Parámetros totales | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Snowball-67B-A2B-Math-RL-E17f-Step16 | 67,08 mil millones (A2B) | No disponible | other | HuggingFace, 0 descargas | Router congelado, deriva cero; último checkpoint utilizable antes del colapso del paso 20 |
| Exportaciones `laion/rl-snowball-*` | No disponible | No disponible | No disponible | HuggingFace | Nombres similares; según el autor pueden contener routers mutables que colapsan en inferencia y no son sustitutos válidos |
| Alternativas de la misma categoría | No disponible | No disponible | No disponible | No disponible | No se dispone de datos comparables verificables en la información proporcionada |

## Limitaciones y advertencias

- Artefacto de investigación, no producto: la propia model card declara que estos checkpoints no son versiones de producción y que su utilidad es limitada salvo que se preserve la reparación o el congelado del sesgo del router.
- Procedencia del router crítica: sustituir este artefacto por exportaciones de nombre similar (`laion/rl-snowball-*`) puede provocar colapso en inferencia por router mutable. No son intercambiables.
- Cerca del colapso de entrenamiento: el checkpoint es el último utilizable antes del colapso observado en el paso 20, lo que indica inestabilidad en la receta de RL y desaconseja su uso como base para ajustes posteriores.
- Rendimiento matemático bajo en términos absolutos: AIME24 14,00 y OlympiadBench 9,33 sitúan al modelo lejos de un uso fiable en resolución de problemas de competición.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad, veracidad ni tasas de alucinación; un modelo de 67B con razonamiento matemático débil es propenso a producir derivaciones plausibles pero incorrectas.
- Sesgos: no se documentan evaluaciones de sesgo, toxicidad ni seguridad, ni la composición del dataset de entrenamiento, por lo que no pueden descartarse sesgos heredados de los datos.
- Idiomas: se desconoce por completo el soporte multilingüe y el comportamiento fuera del inglés técnico-matemático.
- Contexto: se desconoce la longitud de contexto soportada, lo que impide planificar usos con documentos largos o conversaciones multi-turno extensas.
- Licencia restrictiva en la práctica: la licencia es "other" sin términos publicados; no puede asumirse uso comercial ni redistribución sin consultar al autor.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia externa de funcionamiento correcto.
- Integridad de ficheros: deben conservarse juntos `config.json`, los ficheros del tokenizer y todos los shards indicados en `model.safetensors.index.json`; la pérdida de cualquiera de ellos invalida el artefacto.
- Compatibilidad de motores no garantizada: la arquitectura `grug_moe` no es estándar y no se documentan herramientas de inferencia compatibles.
- Caveats de evaluación: el autor remite a `MATH_EVALS.md` en el archivo de evidencias para conocer las advertencias metodológicas de las puntuaciones; deben consultarse antes de citar los números.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/open-athena/Snowball-67B-A2B-Math-RL-E17f-Step16
- Archivo de evidencias (dataset con `MATH_EVALS.md`): https://huggingface.co/datasets/penfever/snowball-67b-a2b-math-rl-artifacts
- Issue del experimento en el repositorio Marin: https://github.com/marin-community/marin/issues/7786
- Artefacto de origen (S3, referencia declarada por el autor): `s3://marin-us-east-02a/marin/users/benjaminfeuer/skyrl/rl-snowball-e17f-rno2a-deepscaler-frozen-sr-20260826-014936/exports/global_step_16/policy/`
- Búsqueda web: no se han encontrado resultados relevantes sobre este modelo; los resultados devueltos corresponden a dominios no relacionados (open.global, openai.com, openoffice.org, US Open) y no aportan información técnica utilizable.
