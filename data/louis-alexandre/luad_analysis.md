# Louis-Alexandre/LUAD_analysis

## Resumen

LUAD_analysis es un repositorio de Hugging Face publicado por el usuario Louis-Alexandre que contiene los artefactos de un estudio computacional sobre adenocarcinoma de pulmón (LUAD). No se trata de un modelo de lenguaje, sino de un modelo biológico de tipo Polygene entrenado con un espacio latente restringido a la esfera unitaria, junto con los embeddings que genera sobre el Lung Cancer Atlas (LuCA) y un cuaderno Jupyter (`luca_geometry.ipynb`) que reproduce dos análisis geométricos.

El repositorio incluye dos checkpoints del modelo Polygene (`checkpoint-600000` y `checkpoint-1500000`), un tokenizador compartido, embeddings de 240 dimensiones para 148.171 células del atlas y los datos de entrada en formato `.h5ad` troceados en 15 fragmentos. El objetivo declarado es doble: alinear la variedad latente con los estadios UICC del cáncer de pulmón (de I a IV) y calcular atribuciones de genes mediante gradientes integrados sobre geodésicas en la variedad latente, con enriquecimiento posterior contra las colecciones hallmark de MSigDB.

Es relevante ahora porque ejemplifica el uso de modelos generativos de secuencias biológicas (single-cell) con geometría diferencial aplicada a interpretabilidad, un área emergente en biología computacional. Sin embargo, la información pública es muy escasa: no hay model card técnica convencional, ni licencia, ni idiomas, ni resultados de benchmarks. El tamaño del repositorio es de 0,4 GB (aunque el propio README indica que los datos de LuCA descargados en tiempo de ejecución ocupan unos 9 GB).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Polygene (modelo de secuencias biológicas con espacio latente en esfera unitaria); detalles internos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors (tag del repositorio); checkpoints `checkpoint-600000` y `checkpoint-1500000` |
| Dimension del embedding | 240 |
| Numero de celulas procesadas | 148.171 |
| Checkpoints incluidos | 2 (`checkpoint-600000`, `checkpoint-1500000`) |
| Tokenizador | `tokenizer.pkl` compartido entre checkpoints |
| Datos de entrada | `data/luca_chunk{0..14}.h5ad` (15 fragmentos, ~9 GB en total) |

## Arquitectura y entrenamiento

La información disponible no describe en detalle la arquitectura interna de Polygene más allá de que se entrena con un espacio latente restringido a la esfera unitaria (`unit sphere latent space`). El repositorio contiene el código del modelo y del tokenizador en el directorio `polygene/`, pero la model card no especifica número de capas, dimensión oculta, mecanismo de atención ni función de pérdida. Tampoco se documenta el número de tokens de entrenamiento, la composición del corpus ni si hubo etapas de alineación tipo RLHF o DPO (poco probables en este dominio).

Lo que sí se documenta es el pipeline de análisis: los embeddings de 240 dimensiones se generan a partir de los checkpoints y se utilizan en dos experimentos. El primero proyecta las células a lo largo del vector de progresión de estadio I a IV en cuatro representaciones (recuentos crudos, UMAP, scANVI y Polygene) y las puntúa con R² frente al estadio UICC observado. El segundo aplica gradientes integrados de información geométrica: filtra valores atípicos con HDBSCAN, traza una geodésica entre células no cancerosas y células en estadio IV, integra las atribuciones de genes a lo largo de ella y realiza enriquecimiento con hallmark de MSigDB consultando Enrichr. La innovación destacable es, por tanto, el uso de geodésicas en la variedad latente para atribución génica interpretable, no una innovación arquitectónica del modelo en sí.

## Capacidades

- Generación de embeddings de células individuales de LUAD en un espacio latente de 240 dimensiones sobre la esfera unitaria.
- Alineación de la variedad latente con los estadios UICC del cáncer de pulmón (evaluable mediante R²).
- Cálculo de geodésicas entre poblaciones celulares (no cancerosa frente a estadio IV).
- Atribución de genes mediante gradientes integrados a lo largo de geodésicas.
- Enriquecimiento funcional contra colecciones MSigDB hallmark vía Enrichr (requiere conexión a internet).
- Filtrado de valores atípicos con HDBSCAN.
- Reproducibilidad completa mediante cuaderno Jupyter y `requirements.txt`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso genérico ni capacidades multilingües en el sentido de los modelos de lenguaje.

## Casos de uso

- Investigación en biología computacional del cáncer de pulmón: el repositorio permite reproducir el análisis de alineación entre la geometría latente y los estadios UICC, sirviendo como base metodológica para estudios similares en otros tumores.
- Análisis de trayectorias de progresión tumoral: el cálculo de geodésicas entre células no cancerosas y células en estadio IV permite estudiar qué regiones del espacio latente separan ambos estados y qué genes intermedios aparecen.
- Atribución génica interpretable: los gradientes integrados sobre geodésicas ofrecen una alternativa geométrica a los métodos de atribución clásicos, útil para identificar genes candidatos asociados a progresión.
- Enriquecimiento funcional de firmas génicas: el pipeline integra Enrichr para contrastar las atribuciones contra MSigDB hallmark, adecuado para validar hipótesis biológicas.
- Comparación de métodos de reducción de dimensionalidad: el cuaderno compara recuentos crudos, UMAP, scANVI y Polygene frente al estadio UICC, útil para evaluar qué representación preserva mejor la información clínica.
- Docencia y formación en análisis single-cell: el repositorio es autocontenido (código, datos troceados, tokenizador y cuaderno) y puede usarse como ejemplo práctico de flujo completo, desde la descarga hasta las figuras finales.
- Reproducibilidad de resultados: al incluir checkpoints, embeddings y máscaras de filtrado, permite verificar resultados publicados sin reentrenar el modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona una puntuación R² frente al estadio UICC observado para las cuatro representaciones (recuentos crudos, UMAP, scANVI y Polygene), pero no incluye los valores numéricos. Tampoco se aportan métricas de enriquecimiento, calidad de embeddings ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el tamaño de los checkpoints no se detalla; el repositorio total ocupa 0,4 GB sin contar los datos de LuCA, que suman unos 9 GB).
- GPU recomendadas: no se especifican modelos concretos. La model card indica que la parte 2 del cuaderno se ejecuta en GPU cuando está disponible.
- ¿Cabe en GPU de consumo? No se puede confirmar con la información disponible; dado el tamaño reducido del repositorio (0,4 GB), es plausible, pero no está documentado.
- Opciones de despliegue: no se mencionan vLLM, llama.cpp, Ollama ni TGI. El despliegue previsto es mediante Jupyter Notebook con `pip install -r requirements.txt`.
- Latencia y throughput: no disponibles.
- Requisitos adicionales: conexión a internet para descargar el repositorio con `snapshot_download` (incluye los fragmentos de LuCA, ~9 GB) y para la consulta a Enrichr durante el enriquecimiento.

## Comparativa con modelos similares

No disponible. La información proporcionada no identifica modelos comparables de la misma categoría (modelos de secuencias biológicas con espacio latente esférico aplicados a single-cell), ni aporta métricas que permitan una comparación cuantitativa con scANVI, UMAP u otras representaciones, más allá de la mención cualitativa de que se comparan en el cuaderno.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no debe evaluarse con criterios de MMLU, HumanEval o GSM8K, ni usarse para generación de texto, código o conversación.
- La model card no documenta sesgos, composición del dataset de entrenamiento ni procedencia detallada de las células de LuCA, lo que limita la evaluación de sesgos biológicos o de representación poblacional.
- Riesgo de sobreinterpretación: las atribuciones génicas mediante gradientes integrados sobre geodésicas dependen de la calidad del espacio latente y del filtrado HDBSCAN; no se aportan validaciones experimentales de los genes identificados.
- Dependencia de servicios externos: el paso de enriquecimiento requiere acceso a Enrichr, lo que introduce dependencia de red y de disponibilidad del servicio.
- Dependencia de datos externos: aunque el repositorio incluye los fragmentos `.h5ad`, el flujo de descarga completo supone unos 9 GB adicionales, lo que puede ser una barrera en entornos con almacenamiento limitado.
- Licencia no especificada: no se puede confirmar el uso comercial ni la redistribución de los pesos, embeddings o datos derivados de LuCA. Es imprescindible contactar con el autor antes de cualquier uso en producción.
- Idiomas no aplicables: el modelo opera sobre secuencias biológicas, no sobre texto natural.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validación independiente.
- Fecha de creación indicada como 2026-11-23, posterior a la fecha habitual de consulta; conviene verificar la integridad y vigencia del repositorio.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Louis-Alexandre/LUAD_analysis
- Cuaderno de análisis: `luca_geometry.ipynb` (incluido en el repositorio)
- Código del modelo y tokenizador: directorio `polygene/` del repositorio
- Dependencias: `requirements.txt` del repositorio
- Lung Cancer Atlas (LuCA): referenciado en la model card, sin URL directa proporcionada
- MSigDB hallmark: referenciado en la model card, sin URL directa proporcionada
- Enrichr: servicio externo consultado por el cuaderno, sin URL directa proporcionada
