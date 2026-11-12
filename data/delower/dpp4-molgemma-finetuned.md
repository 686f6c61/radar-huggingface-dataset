# Delower/dpp4-molgemma-finetuned

## Resumen

MolGemma DPP-4 es un conjunto de pesos ajustados (fine-tune) del modelo Delower/MolGemma, publicado por el usuario Delower en Hugging Face. Se trata de un modelo especializado en quimioinformática orientado a la predicción de actividad sobre la diana DPP-4 (dipeptidil peptidasa-4), una enzima relevante en el tratamiento de la diabetes tipo 2. El modelo parte de una arquitectura MolGemma (no documentada en la información disponible) y se entrena sobre un conjunto de 9.338 moléculas representadas como SMILES.

El ajuste se realizó sobre un conjunto etiquetado como potent+moderate+FDA-12, con una partición 90/10 y semilla 42, empleando el tokenizador DeepChem-591. El entrenamiento se detuvo por instrucción del autor tras la época 4, alcanzando una pérdida de validación de 0,1800. El repositorio contiene únicamente los pesos en formato HDF5 (`molgemma_best.weights.h5`) y el registro de entrenamiento (`training_log.csv`), con un tamaño total de 0,4 GB.

La relevancia de esta ficha es limitada pero concreta: se trata de un artefacto de investigación de nicho, útil para quienes trabajen con el modelo base MolGemma y quieran reproducir o reutilizar un ajuste sobre una diana farmacológica específica. No obstante, la ausencia de model card detallada, licencia, idiomas y benchmarks limita seriamente su uso en producción sin una evaluación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MolGemma (arquitectura base no documentada en la informacion disponible) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo orientado a representaciones SMILES, no a lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | HDF5 (`molgemma_best.weights.h5`) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del checkpoint Delower/MolGemma, cuya arquitectura interna no se detalla en la información proporcionada. Por el tokenizador empleado (DeepChem-591) y el formato de pesos (HDF5, cargable mediante `model.load_weights(...)`), se deduce que el modelo base está implementado en Keras/TensorFlow y opera sobre secuencias de tokens SMILES, no sobre texto en lenguaje natural. No se especifica el número de parámetros, la profundidad, el mecanismo de atención ni si incorpora componentes de grafos moleculares.

El entrenamiento se realizó sobre el conjunto DPP-4 potent+moderate+FDA-12, compuesto por 9.338 SMILES con partición 90/10 y semilla 42. Se empleó el optimizador AdamW con tasa de aprendizaje 2e-5 y tamaño de lote 32, sobre CPU en Kaggle (notebooks delower2021/dpp-4-molgemma-fine-tune V3/V4). El proceso se detuvo por instrucción del autor tras la época 4, con una pérdida de entrenamiento de 0,1914 y de validación de 0,1800. No se documenta el uso de RLHF, DPO ni otras técnicas de alineación, algo esperable en un modelo de regresión/clasificación molecular.

## Capacidades

- Predicción de actividad frente a la diana DPP-4 a partir de representaciones SMILES.
- Procesamiento de secuencias moleculares tokenizadas con DeepChem-591.
- Ajuste fino supervisado sobre un conjunto etiquetado de moléculas potent, moderate y FDA-12.
- Carga de pesos en la arquitectura MolGemma mediante Keras (`load_weights`).
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling ni agentes.
- No se documentan capacidades multilingües en sentido lingüístico; el dominio es exclusivamente químico.

## Casos de uso

- Filtrado virtual de compuestos: usar el modelo para puntuar librerías de SMILES y priorizar candidatos con posible actividad sobre DPP-4 antes de ensayos in vitro, aprovechando el ajuste sobre 9.338 moléculas etiquetadas.
- Reproducción de experimentos: cargar `molgemma_best.weights.h5` en la arquitectura MolGemma para replicar la pérdida de validación de 0,1800 reportada en la época 4 y comparar con variantes propias.
- Punto de partida para fine-tuning adicional: emplear estos pesos como inicialización en lugar del modelo base cuando el dominio objetivo sea DPP-4 o dianas relacionadas con la diabetes tipo 2.
- Investigación académica en quimioinformática: analizar el efecto del ajuste sobre una diana concreta comparando representaciones internas con el modelo base MolGemma.
- Docencia y experimentación con Keras/TensorFlow: el formato HDF5 y el flujo de carga con `load_weights` facilitan su uso en entornos educativos con CPU.
- Evaluación de pipelines de tokenización: validar el tokenizador DeepChem-591 en tareas de clasificación de actividad molecular y detectar posibles sesgos de tokenización en SMILES largos.
- Integración en flujos de cribado temprano: combinar el modelo con filtros de propiedades fisicoquímicas para descartar compuestos no viables antes de simulaciones de docking.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento es la curva de pérdida de entrenamiento y validación reportada por el autor:

| Epoca | Perdida de entrenamiento | Perdida de validacion |
|---|---|---|
| 1 | 0,4910 | 0,3331 |
| 2 | 0,2820 | 0,2467 |
| 3 | 0,2235 | 0,2053 |
| 4 | 0,1914 | 0,1800 |

No se reportan métricas como AUC, precisión, recall, RMSE ni comparaciones con otros modelos sobre el mismo conjunto.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el repositorio ocupa 0,4 GB, por lo que la inferencia en CPU es viable.
- GPU recomendadas: no se especifican. Dado el tamaño del checkpoint (0,4 GB) y que el entrenamiento se realizó en CPU de Kaggle, cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) sería suficiente, aunque no hay datos confirmados.
- Cabe en GPU consumer: probablemente sí, dado el tamaño del artefacto, pero no se dispone de confirmación oficial.
- Opciones de despliegue: Keras/TensorFlow con `model.load_weights(...)`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje generativo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (fine-tunes de MolGemma sobre dianas específicas) ni se dispone de datos de rendimiento para establecer una comparación rigurosa con alternativas como ChemBERTa, MolFormer o modelos de DeepChem.

## Limitaciones y advertencias

- Licencia no especificada: no se puede garantizar el uso comercial ni la redistribución de los pesos.
- Model card mínima: no se documentan arquitectura, parámetros, contexto ni datos de preentrenamiento del modelo base.
- Entrenamiento truncado: el autor detuvo el proceso en la época 4, por lo que el modelo no ha convergido necesariamente; la pérdida de validación sigue descendiendo.
- Conjunto de datos pequeño y sesgado: 9.338 SMILES con partición 90/10 y semilla única (42), lo que limita la robustez estadística de las conclusiones.
- Riesgo de sobreajuste al dominio DPP-4: el modelo puede no generalizar a otras dianas sin un nuevo fine-tuning.
- Sin benchmarks estándar: no hay métricas de clasificación ni comparaciones con líneas base, lo que impide evaluar su calidad real.
- Sin información sobre sesgos químicos: no se analiza la cobertura del espacio químico ni posibles sesgos hacia determinadas familias estructurales.
- Formato HDF5 acoplado a Keras: no es directamente compatible con ecosistemas de inferencia habituales (ONNX, GGUF, safetensors).
- Sin soporte documentado de tool calling, agentes ni lenguaje natural: no debe confundirse con un modelo conversacional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Delower/dpp4-molgemma-finetuned
- Modelo base: https://huggingface.co/Delower/MolGemma
- Notebook de entrenamiento: https://www.kaggle.com/code/delower2021/dpp-4-molgemma-fine-tune (referenciado en la model card como V3/V4)
