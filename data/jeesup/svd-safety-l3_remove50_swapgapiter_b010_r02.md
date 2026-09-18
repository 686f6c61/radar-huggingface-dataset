# Jeesup/svd-safety-l3_remove50_swapgapiter_b010_r02

## Resumen

svd-safety-l3_remove50_swapgapiter_b010_r02 es un checkpoint derivado de meta-llama/Meta-Llama-3-8B-Instruct publicado por el usuario Jeesup en HuggingFace. No se trata de un modelo conversacional de propósito general, sino de un artefacto de investigación: el modelo base se ha comprimido con SVD-LLM hasta conservar el 50,0 % de los parámetros densos y, a continuación, se ha editado mediante 2 de las 10 rondas previstas de un procedimiento de intercambio iterativo de parámetros («parameter-neutral swap»), seleccionando los componentes con la regla gap_iter y con un presupuesto de restauración del 1,0 % de los parámetros densos.

El interés del checkpoint es metodológico. Forma parte de un estudio sobre cómo la compresión SVD degrada el comportamiento de seguridad del modelo y qué regla de selección de componentes repara mejor ese daño. La model card indica explícitamente que varias celdas de la grid están «deliberadamente degradadas en seguridad» respecto al modelo original, y que el objetivo es cuantificar esa degradación y probar su recuperación. Por tanto, cada checkpoint debe tratarse como un sujeto experimental, no como un asistente desplegable.

Técnicamente, hereda la arquitectura transformer decoder-only de Llama 3 8B (8.030.261.248 parámetros según el recuento de safetensors, repositorio de 16,1 GB). No hay evidencia de entrenamiento adicional con datos: la intervención es una edición de pesos post-hoc (SVD más intercambio de componentes), con semilla 42 y checkpoint intermedio del proceso. El modelo acumula 166 descargas y 0 «likes» en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Llama 3 8B Instruct; sin más detalle en la información proporcionada) |
| Parámetros totales | 8.030.261.248 (8,03 B) según safetensors; la model card declara una fracción de parámetros resultante de 0,4997 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la ficha; el modelo base declara 8.192 tokens según la documentación de Meta |
| Tipos de cuantización | No disponible (no se publican variantes GGUF, AWQ ni GPTQ en el repositorio) |
| Idiomas soportados | No disponible |
| Licencia | Meta Llama 3 Community License (se incluyen LICENSE y USE_POLICY.md en el repositorio) |
| Formato de pesos | safetensors (repositorio de 16,1 GB, coherente con pesos en 16 bits) |
| Librería | transformers |
| Pipeline | text-generation |
| Modelo base | meta-llama/Meta-Llama-3-8B-Instruct |
| Tarea | Generación de texto |
| Descargas / likes | 166 / 0 |

## Arquitectura y entrenamiento

El checkpoint no introduce una arquitectura nueva: es una edición de los pesos de Meta-Llama-3-8B-Instruct, un transformer decoder-only con atención causal. La model card no documenta la configuración interna (número de capas, dimensión oculta, cabezas de atención) ni el tokenizador, por lo que esos datos no están disponibles en la información proporcionada más allá de lo que declara públicamente Meta para el modelo base.

El procedimiento de construcción consta de dos fases. Primero, compresión SVD-LLM con eliminación del 50,03 % de los parámetros. Después, un intercambio iterativo de parámetros «neutro en parámetros» guiado por la regla de selección gap_iter, con un presupuesto total de restauración del 1,000 % de los parámetros densos, ejecutado en 10 rondas de 0,100 % cada una. El checkpoint publicado corresponde a la ronda 2 de 10. Los detalles de procedencia declarados son: 2.631 componentes restaurados, 2.631 componentes sustituidos, 13.948.928 parámetros intercambiados (0,20 % de los parámetros de proyección densos), valor de intercambio «insert» con desalojo ordenado por sigma, semilla 42 y fracción de parámetros resultante de 0,4997. No se menciona RLHF, DPO ni ningún otro ajuste con datos para este artefacto.

## Capacidades

- Generación de texto conversacional: hereda el pipeline text-generation y la etiqueta «conversational» del modelo base, aunque su uso previsto es experimental.
- Capacidad multilingüe: no declarada en la información disponible; el modelo base está optimizado principalmente para inglés.
- Tool calling / function calling: no documentado en la información proporcionada para este checkpoint.
- Soporte de agentes y razonamiento multi-paso: no documentado; el modelo base sí lo soporta, pero no hay evidencia de que la compresión y el intercambio de componentes preserven esa capacidad.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Comportamiento medible en seguridad: es la única capacidad caracterizada cuantitativamente, con tasas de éxito de ataque (ASR) y de sobre-rechazo publicadas (véase la sección de benchmarks).
- Reproducibilidad experimental: al documentar regla de selección, presupuesto, semilla y número de ronda, permite replicar la celda concreta de la grid.

## Casos de uso

- Reproducción de experimentos de compresión: usar el checkpoint como la celda «gap_iter, presupuesto 1,0 %, ronda 2» de la grid y verificar que las métricas de seguridad declaradas se reproducen con el mismo juez (HarmBench).
- Medición de la degradación de seguridad por compresión: ejecutar AdvBench y StrongREJECT sobre este checkpoint y sobre el modelo sin comprimir, manteniendo fijo el juez, para aislar el efecto del 50 % de eliminación de parámetros.
- Estudio del sobre-rechazo en modelos comprimidos: la métrica macro over-refusal con WildGuard (0,4146) permite analizar cuántas peticiones benignas se rechazan y compararlo con el comportamiento del modelo base.
- Comparación de reglas de selección de componentes: contrastar gap_iter con otras reglas de la grid manteniendo el presupuesto y la semilla, para determinar qué criterio repara mejor la seguridad por unidad de parámetro restaurado.
- Barrido de presupuestos de restauración: evaluar la curva ASR frente al porcentaje de parámetros intercambiados (0,1 % por ronda hasta 1,0 % total) y localizar el punto de rendimientos decrecientes.
- Interpretabilidad de subespacios de pesos: analizar las matrices de proyección comprimidas y los 2.631 componentes sustituidos para estudiar qué direcciones del espacio de pesos están asociadas al comportamiento de rechazo.
- Validación de pipelines de evaluación de seguridad: incorporar el checkpoint como caso de prueba conocido en una batería de evals automatizada (jueces HarmBench y WildGuard) dentro de un CI de investigación, con resultados esperados documentados.
- Docencia y metodología: utilizarlo como ejemplo de artefacto de investigación con procedencia completa (regla, semilla, presupuesto, ronda), útil para enseñar cómo se documenta un experimento de compresión y edición de pesos.

## Benchmarks y rendimiento

| Métrica | Valor | Juez / herramienta |
|---|---|---|
| AdvBench ASR | 0,1400 | HarmBench judge |
| StrongREJECT ASR | 0,1800 | HarmBench judge |
| Macro over-refusal | 0,4146 | WildGuard |

No se han publicado resultados de benchmarks de capacidad general (MMLU, GSM8K, HumanEval u otros) en la información disponible, ni cifras comparativas del modelo base sin comprimir, por lo que no es posible cuantificar la pérdida de utilidad asociada a la compresión a partir de estos datos.

## Requisitos de hardware

- VRAM estimada en 16 bits (fp16/bf16): en torno a 16,1 GB solo para los pesos, más caché KV; en la práctica, entre 18 y 20 GB según longitud de contexto y tamaño de lote.
- VRAM estimada cuantizado a 8 bits: aproximadamente 8-9 GB.
- VRAM estimada cuantizado a 4 bits: aproximadamente 4,5-5,5 GB más sobrecarga de inferencia.
- GPU de centro de datos: A100 (40 GB o 80 GB) y H100 son suficientes en 16 bits con margen para lotes grandes.
- GPU de consumo: RTX 4090 y RTX 3090 (24 GB) permiten inferencia en 16 bits con contexto moderado; RTX 4080 (16 GB) requiere cuantización.
- Configuraciones multi-GPU de consumo: 2 x RTX 3060 (12 GB) o similares con reparto de capas.
- Opciones de despliegue: transformers (librería declarada), TGI (el repositorio incluye las etiquetas text-generation-inference y endpoints_compatible) y vLLM como servidor compatible. llama.cpp u Ollama requerirían convertir los pesos a GGUF, conversión que no se publica en el repositorio.
- Latencia y throughput: no disponibles; no se han publicado mediciones.
- Nota: dado el uso previsto como artefacto de investigación, no se recomienda dimensionar infraestructura de producción para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento en seguridad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| svd-safety-l3_remove50_swapgapiter_b010_r02 | 8,03 B en el checkpoint; fracción declarada de parámetros densos 0,4997 | No disponible | AdvBench ASR 0,1400; StrongREJECT ASR 0,1800; sobre-rechazo macro 0,4146 | Meta Llama 3 Community License | HuggingFace, 166 descargas, 0 likes |
| meta-llama/Meta-Llama-3-8B-Instruct (base sin comprimir) | 8,03 B | 8.192 tokens según la documentación de Meta | No disponible en la información proporcionada | Meta Llama 3 Community License | HuggingFace (modelo oficial de Meta) |
| Otras celdas de la grid del mismo estudio (otras reglas de selección y presupuestos) | No disponible | No disponible | No disponible | Meta Llama 3 Community License | No disponible |

No se dispone de resultados de benchmarks que permitan una comparación cuantitativa con alternativas de la misma categoría más allá del modelo base, para el cual no se han facilitado cifras.

## Limitaciones y advertencias

- No es un modelo desplegable: la propia model card indica que es un artefacto de investigación y que debe tratarse como sujeto experimental, no como asistente.
- Seguridad degradada por diseño experimental: la compresión eleva la tasa de éxito de ataque, y algunas celdas de la grid están deliberadamente degradadas. Este checkpoint registra un ASR de 0,1400 en AdvBench y de 0,1800 en StrongREJECT.
- Sobre-rechazo elevado: la métrica macro over-refusal de 0,4146 con WildGuard indica que rechaza una proporción alta de peticiones benignas, lo que limita su utilidad como asistente incluso en tareas inocuas.
- Checkpoint intermedio: corresponde a 2 de 10 rondas, por lo que no representa el punto final del procedimiento ni el mejor resultado potencial de la grid.
- Ambigüedad en el recuento de parámetros: la model card declara una fracción de parámetros resultante de 0,4997 tras eliminar el 50,03 %, pero el recuento de safetensors (8.030.261.248) es prácticamente idéntico al del modelo base. Conviene verificar cómo se contabilizan los parámetros antes de extraer conclusiones sobre el ahorro real de memoria.
- Ausencia de benchmarks de capacidad: no hay datos de MMLU, GSM8K, HumanEval ni similares, por lo que se desconoce el coste en utilidad general de la compresión.
- Idiomas no declarados: no se especifica qué idiomas conservan un rendimiento aceptable tras la compresión; se espera degradación respecto al modelo base, especialmente fuera del inglés.
- Riesgo de alucinación: no se han publicado evaluaciones de veracidad para este checkpoint; al estar comprimido, el riesgo no puede asumirse igual al del modelo base.
- Sesgos: no se documentan análisis de sesgo específicos; se heredan los del modelo base, potencialmente amplificados por la compresión.
- Evaluación no replicada: las tres métricas proceden del propio autor y no consta replicación independiente.
- Restricciones de licencia: se aplica la Meta Llama 3 Community License, que obliga a incluir la licencia y la política de uso aceptable, a mantener la atribución «Built with Meta Llama 3» y a que los modelos derivados lleven «Llama 3» al inicio del nombre. Existe además la cláusula de 700 millones de usuarios activos mensuales, que requiere licencia adicional de Meta.
- Reproducibilidad: se documenta la semilla (42), la regla (gap_iter) y el presupuesto (1,0 %), pero no se enlaza el código del estudio ni los scripts de evaluación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l3_remove50_swapgapiter_b010_r02
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Licencia Llama 3 (Meta): https://llama.meta.com/llama3/license/
- Ficheros LICENSE y USE_POLICY.md: incluidos en el repositorio de HuggingFace del modelo
- Paper de SVD-LLM: no disponible (la model card menciona el método, pero no enlaza la publicación)
- Repositorio o demo del estudio: no disponible
- Resultados de la búsqueda web: no contienen enlaces relevantes al modelo (las páginas devueltas no guardan relación con él)
