# Jeesup/svd-safety-l31_remove20_swapgapiter_b010_r01

## Resumen

`Jeesup/svd-safety-l31_remove20_swapgapiter_b010_r01` es un checkpoint derivado de `meta-llama/Llama-3.1-8B-Instruct` al que se le han eliminado el 20,02 % de los parámetros densos mediante compresión SVD-LLM, y sobre el que después se ha aplicado una ronda de un procedimiento iterativo de intercambio de componentes (parameter-neutral swap). El resultado conserva el 79,98 % de los parámetros densos del modelo original y, según la model card, incorpora 6.973.440 parámetros (0,10 % de las proyecciones densas) procedentes de 1277 componentes sustituidos, con semilla 42.

Se trata de un artefacto de investigación, no de un modelo conversacional de propósito general. El propio autor lo describe como una celda de una malla experimental que cruza reglas de selección de componentes y presupuestos de restauración, cuyo objetivo es cuantificar cómo la compresión SVD degrada el comportamiento de seguridad y qué regla de selección repara mejor ese daño. La model card advierte explícitamente de que varias ramas de la malla están deliberadamente degradadas en seguridad respecto al modelo base y que este checkpoint concreto corresponde a una ronda intermedia de una ejecución más larga (1 de 10 rondas previstas).

Su relevancia actual es metodológica: proporciona un punto de medida reproducible sobre la relación entre compresión, seguridad y utilidad, con métricas de tasa de éxito de ataque (ASR) evaluadas por un juez HarmBench. Al estar publicado con licencia Llama 3.1 y formato safetensors, es directamente evaluable con el ecosistema transformers, pero no debería desplegarse como asistente sin una evaluación propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Llama 3.1) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base Llama-3.1-8B-Instruct; no verificada en este checkpoint) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada; el repo incluye pesos safetensors de 16,1 GB para 8,03 mil millones de parametros, lo que corresponde a precision de 16 bits (fp16/bf16) |
| Idiomas soportados | No disponible |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors (libreria transformers) |
| Fraccion de parametros resultante | 0,7998 (79,98 % de los parametros densos del base) |
| Componentes restaurados | 1277 |
| Componentes sustituidos | 1277 |
| Parametros intercambiados | 6.973.440 (0,10 % de los parametros de proyeccion densos) |
| Semilla | 42 |
| Rondas iterativas aplicadas | 1 de 10 |
| Repo | 16,1 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.1 8B Instruct: un transformer decoder-only denso con normalizacion RMSNorm, activacion SwiGLU, embeddings rotatorios (RoPE) y atencion por grupos (GQA), entrenado por Meta con un pipeline de ajuste por instrucciones seguido de optimizacion de preferencias. Sobre esa base, este checkpoint aplica dos transformaciones sucesivas. La primera es una compresion por descomposicion en valores singulares (SVD-LLM) que elimina el 20,02 % de los parametros densos, dejando la fraccion en 0,7998. La segunda es una edicion quirurgica: 1277 componentes se restauran y 1277 se expulsan en un esquema de intercambio neutro en numero de parametros, con valor de insercion `insert` y desalojo ordenado por sigma (sigma-ordered eviction).

La regla de seleccion de componentes empleada se denomina `gap_iter` y opera con un presupuesto de restauracion del 1,000 % de los parametros densos repartido en 10 rondas de 0,100 % cada una; el checkpoint publicado corresponde a la primera de esas rondas, por lo que solo se ha aplicado el 0,10 % del presupuesto total. No se dispone de informacion sobre el dataset de compresion, el numero de tokens de calibracion ni si hubo un ajuste adicional tras la compresion: la model card solo documenta la procedencia, la regla de seleccion y las metricas medidas. No hay innovaciones de inferencia asociadas (ni decodificacion especulativa ni atencion lineal); el interes tecnico esta enteramente en el procedimiento de compresion y reparacion.

## Capacidades

- Generacion de texto en formato conversacional: conserva la plantilla de chat y el tokenizador de Llama-3.1-8B-Instruct, aunque no se han publicado evaluaciones de calidad de generacion para este checkpoint.
- Razonamiento y seguimiento de instrucciones: heredados del modelo base, con degradacion no cuantificada por la compresion SVD y el posterior intercambio de componentes.
- Codigo y matematicas: no se han publicado resultados especificos; se asumen las capacidades del base, potencialmente mermadas.
- Tool calling / function calling: el modelo base lo soporta de forma nativa, pero no hay ninguna evaluacion publicada que confirme que esta capacidad sobrevive a la compresion.
- Uso como sujeto experimental en seguridad: es la capacidad efectivamente documentada, con metricas de ASR y de sobrerrechazo.
- Multilingue: no disponible; la model card no documenta idiomas ni evaluaciones por idioma.
- Capacidades especiales: no dispone de modo thinking, vision ni audio.

## Casos de uso

- Investigacion sobre compresion y seguridad: el checkpoint sirve como celda de una malla experimental que mide como la eliminacion del 20,02 % de parametros por SVD afecta a la tasa de exito de ataque, permitiendo comparar reglas de seleccion de componentes bajo un presupuesto fijo.
- Reproducibilidad de ablaciones: con semilla 42, regla `gap_iter` y presupuesto documentado, permite replicar la ronda 1 de 10 y contrastarla con las rondas siguientes para estudiar la curva de recuperacion de seguridad.
- Evaluacion de sobrerrechazo: la metrica de macro over-refusal (WildGuard) permite analizar si la compresion y la reparacion alteran la tendencia del modelo a rechazar peticiones benignas.
- Red teaming y analisis de robustez: al ser un checkpoint con seguridad potencialmente degradada, es adecuado como sujeto de pruebas en ejercicios controlados de jailbreak, siempre en entornos aislados y no accesibles al publico.
- Calibracion de jueces automaticos: las tres metricas publicadas (AdvBench, StrongREJECT y WildGuard con juez HarmBench) permiten validar la sensibilidad de esos evaluadores ante modelos comprimidos.
- Estudio de interpretabilidad de subespacios: los 1277 componentes restaurados y los 1277 expulsados ofrecen un conjunto concreto de direcciones sobre las que analizar que subespacios de pesos concentran el comportamiento de seguridad.
- Analisis de eficiencia: al reducir los parametros densos al 79,98 %, sirve para medir el ahorro real de memoria y latencia frente al base sin cuantizacion adicional.

## Benchmarks y rendimiento

| Metrica | Valor | Juez / metodo | Notas |
|---|---|---|---|
| AdvBench ASR | 0,2300 | HarmBench judge | Tasa de exito de ataque; menor es mejor |
| StrongREJECT ASR | 0,2550 | HarmBench judge | Tasa de exito de ataque; menor es mejor |
| Macro over-refusal | 0,0275 | WildGuard | Sobre rechazo en peticiones benignas |

No se han publicado en la informacion disponible resultados de benchmarks de capacidades generales (MMLU, HumanEval, GSM8K u otros), ni valores de referencia del modelo base medidos con el mismo pipeline, por lo que no es posible establecer una comparacion cuantitativa de la perdida de utilidad.

## Requisitos de hardware

- VRAM estimada en fp16/bf16: en torno a 16 GB solo para pesos, mas overhead de activaciones y cache KV, lo que situa el requisito practico en 18-20 GB.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 8-9 GB de pesos, con requisito practico cercano a 12 GB.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 4,5-5,5 GB de pesos, con requisito practico de 6-8 GB.
- GPU profesionales: A100 40/80 GB, H100, L40S o A6000 funcionan sin problema y permiten contextos largos con cache KV ampliada.
- GPU de consumo: cabe en RTX 4090 (24 GB) en fp16 con contexto moderado, y en RTX 3090, 4080, 4070 Ti o incluso 3060 de 12 GB si se cuantiza a 4 bits.
- Despliegue: transformers (referencia), vLLM y TGI para servicio con batching continuo, llama.cpp u Ollama para cuantizacion GGUF en local. La model card no ha sido validada por el autor para estos runners, por lo que deben verificarse los pesos antes de usarlos.
- Latencia y throughput: no disponible; no se han publicado mediciones de tokens por segundo ni de latencia para este checkpoint.
- Nota: la compresion SVD no reduce necesariamente el tiempo de inferencia en GPUs convencionales, ya que la matriz resultante puede seguir ejecutandose como una multiplicacion densa de menor rango.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Seguridad (ASR) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (svd-safety-l31_remove20_swapgapiter_b010_r01) | 8,03 mil millones (79,98 % densos) | 128.000 tokens (heredado) | AdvBench 0,2300; StrongREJECT 0,2550 | Llama 3.1 Community | HuggingFace, safetensors |
| meta-llama/Llama-3.1-8B-Instruct (base sin comprimir) | 8,03 mil millones (100 % densos) | 128.000 tokens | No disponible en la informacion proporcionada | Llama 3.1 Community | HuggingFace, safetensors |
| Otras celdas de la malla del mismo autor | No disponible | No disponible | No disponible | Llama 3.1 Community | No disponible |

No se dispone de datos de rendimiento de modelos comparables de compresion (por ejemplo, variantes podadas o cuantizadas de Llama 3.1 8B) en la informacion proporcionada, por lo que la comparativa se limita al modelo base y a las celdas de la misma malla experimental.

## Limitaciones y advertencias

- No es un modelo de proposito general: el autor lo describe explicitamente como artefacto de investigacion y recomienda no tratarlo como asistente desplegable.
- Seguridad degradada de forma deliberada en varias ramas del estudio: la propia compresion eleva la tasa de exito de ataque, y este checkpoint presenta un ASR de 0,2300 en AdvBench y 0,2550 en StrongREJECT, valores que deben interpretarse como sujeto de medida, no como garantia.
- Capacidades generales no evaluadas: no hay MMLU, HumanEval, GSM8K ni ninguna otra metrica de utilidad publicada, por lo que se desconoce el alcance real de la degradacion funcional.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; la compresion por SVD y el intercambio de componentes pueden alterar el comportamiento de forma no uniforme entre dominios.
- Idiomas: no disponible; no hay evaluacion multilingue ni declaracion de cobertura.
- Contexto: los 128.000 tokens son los del modelo base y no se ha verificado que este checkpoint los mantenga tras la compresion; conviene medir con tareas de contexto largo antes de asumirlos.
- Codigo de ejemplo malicioso: al ser un sujeto de red teaming, no debe exponerse en endpoints publicos ni integrarse en productos sin filtros adicionales.
- Licencia: Llama 3.1 Community License, con `LICENSE` y `USE_POLICY.md` incluidos en el repositorio. Cualquier uso comercial queda sujeto a esas condiciones, incluida la clausula de atribucion "Built with Llama" y las restricciones de la politica de uso aceptable.
- Reproducibilidad parcial: solo se ha aplicado 1 de las 10 rondas previstas del presupuesto de restauracion del 1,000 %, de modo que las conclusiones extraidas de este checkpoint no son extrapolables a la ejecucion completa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l31_remove20_swapgapiter_b010_r01
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct

Nota: la busqueda web realizada no devolvio ningun resultado relacionado con este modelo, su autor, el metodo SVD-LLM ni el estudio de seguridad asociado; los resultados obtenidos correspondian al termino aleman "Querkraft" y no guardan relacion con la ficha. No se dispone por tanto de enlaces a papers, blogs, repositorios de codigo ni demos adicionales.
