# jacobkmcpherson/muriverse

## Resumen

MuriVerse es un modelo de regresión tabular que predice la semivida de eliminación terminal (en horas) de un péptido tras una dosis intravenosa en ratón o rata. No es un modelo de lenguaje ni una red neuronal profunda: es un ensemble de pesos iguales formado por una regresión ridge, un regresor de vectores de soporte con kernel RBF y un XGBoost poco profundo, evaluado sobre 71 características derivadas del SMILES de la molécula dosificada completa, la especie animal y un conjunto acotado de condiciones de estudio. Lo desarrolla Jacob K. McPherson y se distribuye con licencia MIT.

El problema que aborda es concreto: en descubrimiento de fármacos peptídicos, la semivida plasmática determina la pauta de dosificación y la viabilidad de una molécula, pero medirla exige ensayos in vivo. El modelo se entrenó con 213 semividas intravenosas curadas de 89 publicaciones (134 secuencias distintas agrupadas en 68 clústeres de homología), mayoritariamente en rata (179 registros) frente a ratón (34).

Su relevancia es metodológica tanto como práctica: la validación se hizo reteniendo clústeres de homología completos y fuentes de publicación (no un split aleatorio), y el propio autor publica una corrección por optimismo de selección. Además, la ablación del artículo muestra que la mayor parte de la señal proviene del contexto del estudio y no de la molécula, lo que acota explícitamente el uso legítimo del modelo: sirve para estimar el orden de magnitud en condiciones dadas, no para discriminar entre análogos próximos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de pesos iguales: regresión ridge + SVR con kernel RBF + XGBoost poco profundo, sobre 71 características |
| Parametros totales | no disponible (modelos tabulares; el autor no publica recuento de parámetros) |
| Parametros activos | no aplica (no es un modelo Mixture of Experts) |
| Longitud de contexto | no aplica (entrada tabular, no secuencial) |
| Tipos de cuantizacion | no aplica (no hay cuantización de pesos; serialización en precisión nativa) |
| Idiomas soportados | no disponible; la entrada son SMILES y valores categóricos en inglés, no texto libre |
| Licencia | MIT |
| Formato de pesos | safetensors (`weights/shipped.safetensors`, `weights/structural.safetensors`) con JSON asociados y `.xgb.json`; joblib opcional en `weights/joblib/` |
| Tarea (pipeline) | `tabular-regression` |
| Variable objetivo | log10 de la semivida de eliminación terminal en horas (la predicción es la media de los tres miembros) |
| Tamano del repositorio | 0,0 GB |
| Dependencias | `huggingface_hub`, `numpy`, `pandas`, `rdkit`, `xgboost`, `safetensors` |

## Arquitectura y entrenamiento

La arquitectura es un ensemble homogéneo por promedio simple de tres aprendices clásicos sobre un vector de 71 características. Las características se agrupan en bloques: descriptores fisicoquímicos calculados con RDKit a partir del SMILES, una anotación de la molécula, clases de los extremos N y C, y variables de contexto del estudio (especie, ruta, dosis en mg/kg, matriz de muestra, método analítico, cepa, sexo, clase de formulación, topologicalidad y quiralidad). El repositorio incluye `model.json` y `feature_names.json`, que documentan el reparto por bloques y el orden exacto de columnas, y `peptide_physchem.py` / `halflife_model.py` con el código de descriptores y la clase que deserializan los joblib. Existe una segunda configuración, `structural`, de 62 características, que elimina el bloque de anotación molecular y obtiene una correlación cruzada de 0,587 frente a 0,574 de la configuración por defecto.

Los datos de entrenamiento son 213 semividas intravenosas procedentes de 89 publicaciones, curadas a partir de la literatura que sustenta PEPlife2, con reglas de inclusión estrictas: cadena peptídica única de como máximo 50 residuos, sin socios de extensión de semivida, semivida de eliminación medida en la circulación de un animal normal, ruta parenteral confirmada en la fuente primaria, método bioanalítico nombrado y un SMILES que represente la molécula dosificada completa. La validación es por grupos: se retienen simultáneamente clústeres de homología completos y fuentes de publicación, con tres semillas, y los intervalos se estiman por bootstrap agrupado. No se documenta RLHF ni ajuste por preferencias, algo ajeno a un regresor tabular. La innovación destacable no está en el modelo sino en la evaluación: validación agrupada, análisis de ablación por bloques de características, validación cruzada anidada para corregir el optimismo de selección de configuración y publicación de las predicciones out-of-fold.

## Capacidades

- Predicción puntual de la semivida de eliminación terminal (horas) y de su log10 a partir de un SMILES, una especie (`mouse` o `rat`) y la ruta, con salida estructurada que incluye `half_life_h`, `log10_half_life_h` y `warnings`.
- Aceptación de condiciones de estudio opcionales con valores por defecto: `dose_mg_kg`, `engineering`, `topology`, `chirality`, `sample_matrix`, `assay_method`, `strain`, `sex`, `formulation_class`, `n_terminus_class`, `c_terminus_class`.
- Validación de dominio de entrada: `allowed_values()` enumera los niveles aceptados y un nivel no visto durante el entrenamiento lanza un error; con `strict=False` las columnas correspondientes se dejan a cero.
- Emisión de avisos cuando la ruta solicitada no es intravenosa, ya que el modelo solo se ajustó con registros IV.
- Dos configuraciones servidas (71 y 62 características) para comparar el efecto del bloque de anotación molecular.
- Carga sin pickle mediante safetensors, con `SHA256SUMS` para verificación de integridad de los pesos.
- Reproducibilidad de las predicciones out-of-fold y de las tablas del artículo desde el repositorio.
- No soporta tool calling ni function calling, no es agéntico, no procesa lenguaje natural, imágenes ni audio, y no tiene modo de razonamiento extendido.

## Casos de uso

- Triaje temprano en descubrimiento de péptidos: antes de sintetizar una serie de análogos, se pasa cada SMILES con `species="rat"` y `route="iv"` para descartar candidatos cuyo orden de magnitud de semivida sea incompatible con la pauta de dosificación buscada, reservando el ensayo in vivo para el subconjunto viable.
- Planificación de experimentos farmacocinéticos: la estimación previa orienta la elección de puntos de muestreo y la duración de la ventana de recogida, al dar una expectativa cuantitativa de la semivida esperada en rata o ratón.
- Análisis de sensibilidad de condiciones de estudio: manteniendo fija la molécula y variando `strain`, `sex`, `formulation_class` o `sample_matrix`, se explora qué variables de contexto desplazan la predicción, lo que ayuda a diseñar un protocolo homogéneo.
- Curación y control de calidad de bases de datos farmacocinéticas: aplicar el modelo a registros ya curados y revisar las discrepancias de más de un orden de magnitud permite detectar errores de extracción o de unidades antes de publicar un conjunto de datos.
- Estudio exploratorio de congéneres no vistos: el artículo aplica el modelo a polimixina B1, B2 y colistina A y B (ausentes del entrenamiento) como caso de estudio, generando 16 predicciones que colapsan en 8 valores distintos de aproximadamente 1 a 1,5 h; es un patrón replicable para explorar familias químicas sin datos propios.
- Filtro previo en pipelines de quimioinformática: al ser un ensemble clásico sobre CPU, se puede insertar como paso de cribado por lotes en un flujo que ya maneje RDKit, sin depender de GPU ni de servicios externos.
- Docencia y comunicación de incertidumbre: los intervalos de confianza por bootstrap, la tasa de predicciones dentro de un factor tres y la diferencia entre la estimación optimista (ρ ≈ 0,57) y la anidada (ρ ≈ 0,46) constituyen un caso práctico realista sobre validación honesta en modelos predictivos.

## Benchmarks y rendimiento

Validación cruzada reteniendo clústeres de homología y fuentes de publicación de forma conjunta (tres semillas; estimaciones puntuales como media de semillas, intervalos por bootstrap agrupado).

| Estrato | n | Spearman ρ | RMSE (log10 h) | MAE (log10 h) |
|---|---|---|---|---|
| Ambas especies | 213 | 0,574 (IC 95 %: 0,322 a 0,655) | 0,675 | 0,517 |
| Rata | 179 | 0,600 | 0,646 | 0,490 |
| Ratón | 34 | 0,562 | 0,811 | 0,658 |

Métricas complementarias aportadas por el autor:

| Métrica | Valor |
|---|---|
| Pearson global | 0,568 (IC 95 %: 0,381 a 0,651) |
| Predicciones dentro de un factor tres | 57 % global; 60 % en rata; 41 % en ratón |
| Error absoluto mediano en factor | ≈ 2,2 en rata; ≈ 4,0 en ratón |
| Spearman con validación cruzada anidada (corrección de optimismo de selección) | 0,460 (IC 95 %: 0,293 a 0,636) |
| Ablación: solo anotación molecular | ρ = 0,104 |
| Ablación: solo contexto de estudio | ρ = 0,347 |
| Ablación: contexto de estudio + descriptores fisicoquímicos | ρ = 0,522 |
| Configuración `structural` (62 características) | ρ = 0,587 |

No se han publicado comparaciones con otros predictores de semivida en la información disponible; los resultados anteriores son exclusivamente internos del propio modelo.

## Requisitos de hardware

- Inferencia en CPU: el modelo son tres aprendices clásicos sobre 71 características; no requiere GPU ni VRAM dedicada.
- Memoria: el repositorio completo ocupa 0,0 GB según HuggingFace, por lo que el peso en disco y en RAM es despreciable frente a los pesos de un modelo neuronal; el coste real lo impone RDKit al calcular descriptores.
- GPU recomendadas: no aplica. Cualquier CPU moderna es suficiente; no se han publicado cifras de latencia ni de throughput.
- Despliegue: importación directa del módulo `muriverse_halflife` incluido en el repositorio, o carga mediante `snapshot_download` y adición de la carpeta a `sys.path`, tal como hace el Space de demostración. Los pesos safetensors son el backend por defecto; los joblib permiten reproducción exacta.
- Fuera de alcance: no hay soporte documentado para vLLM, llama.cpp, Ollama o TGI, que son servidores de modelos generativos y no aplican a este pipeline `tabular-regression`.
- Concurrencia: al no publicarse cifras, cualquier estimación de latencia o throughput sería especulativa; conviene medirla en el entorno objetivo antes de dimensionar un servicio.

## Comparativa con modelos similares

La información disponible no incluye comparaciones con otros predictores de semivida de péptidos, ni resultados de herramientas externas sobre el mismo conjunto de evaluación.

| Modelo | Enfoque | Datos de entrenamiento | Métricas publicadas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MuriVerse (`shipped`, 71 características) | Ensemble ridge + SVR RBF + XGBoost | 213 registros IV de 89 publicaciones (134 secuencias, 68 clústeres) | ρ = 0,574 en validación agrupada | MIT | HuggingFace |
| MuriVerse (`structural`, 62 características) | Igual, sin bloque de anotación molecular | Idem | ρ = 0,587 en validación agrupada | MIT | HuggingFace |
| Otros predictores de semivida peptídica o plataformas ADMET | no disponible | no disponible | no disponible | no disponible | no disponible |
| PEPlife2 | Base de datos de semividas peptídicas (fuente de la literatura curada) | no aplica | no aplica | no disponible | Referenciada en el repositorio y el artículo |

## Limitaciones y advertencias

- La mayor parte de la señal predictiva proviene del contexto del estudio, no de la molécula: la anotación molecular sola alcanza ρ = 0,104. Dos péptidos distintos en las mismas condiciones solo se diferencian por los descriptores fisicoquímicos, la anotación y las clases terminales, de modo que el modelo ordena moléculas débilmente y no debe usarse para elegir entre análogos próximos.
- Solo se ajustó con registros intravenosos. Otras rutas se aceptan pero se marcan con aviso: tras una dosis extravascular la pendiente terminal puede reflejar absorción en lugar de eliminación (cinética flip-flop), y los valores subcutáneos aparecen desplazados aproximadamente medio orden logarítmico y no son fiables.
- El estrato de ratón es pequeño (34 observaciones) y claramente peor: RMSE 0,811, solo el 41 % dentro de un factor tres y un error absoluto mediano en factor de aproximadamente 4,0.
- Optimismo de selección: la configuración de 71 características se eligió sobre los mismos folds que la puntúan. La validación cruzada anidada rebaja la Spearman a 0,460, que es la estimación conservadora que debería citarse en producción.
- 43 % de las predicciones globales caen fuera de un factor tres del valor reportado; el modelo sirve para un orden de magnitud, no para decisiones de dosificación cuantitativas.
- Un nivel categórico no visto durante el entrenamiento provoca un error salvo que se use `strict=False`, en cuyo caso las columnas se anulan y la predicción pierde fiabilidad sin señalizarlo más allá de la advertencia.
- El caso de estudio con polimixina B1/B2 y colistina A/B es exploratorio, no una validación externa independiente: no hay valores de referencia medidos para esos congéneres en la información disponible.
- No hay evaluación de sesgos demográficos ni de equidad, ajenas a este dominio; el sesgo relevante es de cobertura taxonómica (rata frente a ratón) y de composición de la literatura curada, que puede sobrerrepresentar familias peptídicas concretas.
- Licencia MIT: permite uso comercial y modificación con atribución y sin garantía, pero la licencia no transfiere responsabilidad sobre decisiones farmacológicas tomadas a partir de las predicciones.
- El artículo está en preparación, por lo que las cifras deben citarse desde el repositorio y no desde una publicación revisada por pares.
- El repositorio no incluye una tarjeta con idiomas ni datos de contactabilidad más allá de la cuenta del autor; la fecha de creación registrada (2026-10-20) es la que reporta HuggingFace.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jacobkmcpherson/muriverse
- Demostración (Space): https://huggingface.co/spaces/jacobkmcpherson/muriverse
- Código, curación y figuras del artículo: https://github.com/JacobKMcPherson/MuriVerse
- Datos de entrenamiento y reglas de curación: `MuriVerse/rodent/strict/` y `MuriVerse/data/curation/` en el repositorio de GitHub (incluye `EXTRACTION_PROTOCOL.md`)
- Predicciones out-of-fold: `MuriVerse/rodent/strict/oof_predictions_iv.csv` en el repositorio de GitHub
- Predicciones del caso de estudio con polimixinas: `figures/tabs/table20_polymyxin_predictions.csv` en el repositorio de GitHub
- Artículo: manuscrito en preparación, sin enlace disponible en la información proporcionada
- PEPlife2: base de datos citada como origen de la literatura curada, sin URL en la información disponible
