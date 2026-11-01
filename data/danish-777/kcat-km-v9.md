# Danish-777/kcat-km-v9

## Resumen

kcat-Km model v9 es un modelo predictivo de parámetros cinéticos enzimáticos desarrollado por el usuario Danish-777 y publicado en HuggingFace. No se trata de un modelo de lenguaje generativo, sino de un sistema de regresión que predice log10(kcat) y log10(Km) a partir de la secuencia de una enzima y el SMILES de un sustrato. Combina representaciones de proteínas generadas con ESM-2 (variantes de 35M y 150M parámetros) con modelos XGBoost y una pequeña red neuronal MLP, fusionando las predicciones mediante un promedio de rangos.

El modelo aborda un problema clásico en biología computacional y diseño de fármacos: estimar la eficiencia catalítica y la afinidad de un enzima por un sustrato sin necesidad de experimentos de laboratorio. La propuesta es relevante porque integra embeddings de proteínas preentrenados con modelos de gradient boosting sobre características artesanales, un enfoque híbrido que suele funcionar bien con datasets tabulares de tamaño moderado, y porque se ejecuta exclusivamente en CPU, lo que reduce las barreras de despliegue.

El repositorio ocupa 0,7 GB y contiene pesos en formato safetensors. La información pública disponible es muy limitada: no se especifican idiomas, pipeline ni resultados de benchmarks numéricos en la model card, y el modelo cuenta con cero descargas y cero likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensamble híbrido: XGBoost sobre características artesanales, XGBoost sobre embeddings ESM-2 35M y 150M, y MLP sobre ESM-2 35M; fusión por promedio de rangos |
| Parametros totales | no disponible (el componente ESM-2 150M aporta ~150M parámetros; el resto son modelos tabulares y una MLP pequeña) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (se usan los primeros 256 residuos de la secuencia para los embeddings) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo no lingüístico; entrada de secuencias proteicas y SMILES) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El sistema es un ensamble de varios predictores. Por un lado, XGBoost entrenado sobre características enzimáticas artesanales (denominadas "D" en la model card). Por otro, XGBoost sobre embeddings de ESM-2 35M y sobre embeddings de ESM-2 150M, calculados sobre los primeros 256 residuos de la secuencia. Cada representación de embedding dispone de dos modelos XGBoost con profundidades 7 y 8, y se añade una red neuronal pequeña sobre el embedding de 35M. Las predicciones individuales se combinan promediando rangos, con un mecanismo de guarda temporal ("time guard") cuya implementación no se detalla.

Los datos de entrenamiento provienen del `train.parquet` de la tarea original más CatPred-DB (Boorla y Maranas, Nature Communications 2025), una colección pública de valores de kcat y Km derivada de BRENDA y SABIO-RK. El autor aplica un filtrado de fuga de datos: elimina filas de CatPred cuya enzima presenta al menos un 90 % de identidad con alguna enzima de validación, y descarta pares ya presentes en `train.parquet`. La validación se realiza mediante validación cruzada de 5 particiones agrupada por familias enzimáticas, usando clústeres de MMseqs2 al 40 % de identidad, excluyendo de cada partición las filas externas relacionadas (≥ 40 % de identidad) con las familias retenidas. No se menciona uso de RLHF, DPO ni técnicas de alineación, algo esperable en un modelo de regresión.

## Capacidades

- Predicción de log10(kcat) a partir de la secuencia de una enzima y el SMILES de un sustrato.
- Predicción de log10(Km) bajo las mismas entradas.
- Ejecución exclusiva en CPU, sin requerir GPU.
- Fusión de múltiples predictores mediante promedio de rangos para robustecer la estimación.
- Integración con ESM-2 para extraer representaciones proteicas sin necesidad de fine-tuning completo.
- Inferencia por lotes mediante el script `predict.py` con entrada y salida en formato Parquet y CSV respectivamente.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto.

## Casos de uso

- Priorización de mutantes enzimáticos: dado un enzima y un sustrato, estimar kcat y Km para ordenar variantes candidatas antes de validarlas experimentalmente, reduciendo el número de ensayos de laboratorio necesarios.
- Ingeniería de proteínas asistida por computación: usar las predicciones como función objetivo preliminar en pipelines de diseño de enzimas, filtrando mutaciones con baja probabilidad de mejorar la eficiencia catalítica.
- Anotación de bases de datos cinéticas: completar valores ausentes de kcat y Km en colecciones derivadas de BRENDA o SABIO-RK cuando solo se dispone de secuencia y estructura del sustrato.
- Filtrado en descubrimiento de fármacos: descartar combinaciones enzima-sustrato con parámetros cinéticos desfavorables antes de invertir en ensayos bioquímicos.
- Análisis de promiscuidad enzimática: evaluar un mismo enzima frente a múltiples sustratos para identificar actividades secundarias potenciales.
- Docencia e investigación en bioinformática: disponer de un predictor reproducible en CPU para experimentos de referencia en cursos o estudios comparativos de métodos de predicción cinética.
- Construcción de modelos sustitutos (surrogate models): emplear las predicciones como aproximación rápida en simulaciones de redes metabólicas donde la evaluación experimental es inviable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe el esquema de validación (validación cruzada de 5 particiones agrupada por familias con MMseqs2 al 40 % de identidad) pero no incluye métricas numéricas como RMSE, MAE o coeficiente de correlación para kcat o Km.

## Requisitos de hardware

- VRAM estimada para inferencia: 0 GB; el modelo está diseñado para ejecutarse exclusivamente en CPU.
- GPU recomendadas: no aplica; no se requiere GPU.
- Cabe en cualquier equipo consumer: el repositorio ocupa 0,7 GB y la inferencia se realiza en CPU, por lo que es viable en portátiles convencionales.
- Opciones de despliegue: ejecución directa mediante `python predict.py --input INPUT.parquet --output predictions.csv`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput estimados: no disponibles. Dependerán del tamaño del lote, del coste de extraer embeddings ESM-2 y del número de modelos XGBoost a evaluar.

## Comparativa con modelos similares

| Modelo | Tipo | Entradas | Ejecución | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kcat-Km model v9 | Ensamble XGBoost + MLP sobre ESM-2 | Secuencia + SMILES | CPU | MIT | HuggingFace |
| CatPred | Predictor de parámetros cinéticos (referencia citada en la model card) | Secuencia + SMILES | no disponible | no disponible | Fuente pública citada (Boorla y Maranas, 2025) |
| ESM-2 | Modelo de lenguaje proteico (representaciones) | Secuencia proteica | GPU/CPU | no disponible en esta ficha | HuggingFace / Meta |

No se dispone de datos de rendimiento comparativo entre estos sistemas en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Información pública muy escasa: la model card no reporta métricas de error ni correlaciones, lo que impide evaluar la calidad predictiva de forma independiente.
- Cobertura limitada por los datos de entrenamiento: al provenir de BRENDA, SABIO-RK y CatPred-DB, el modelo puede generalizar mal a familias enzimáticas o sustratos poco representados.
- Uso de solo los primeros 256 residuos para los embeddings ESM-2: enzimas largas pueden perder información relevante de dominios catalíticos situados fuera de esa ventana.
- Riesgo de fuga de datos residual pese al filtrado aplicado (90 % de identidad para CatPred y 40 % para validación); el propio autor documenta estas precauciones, lo que sugiere que el problema es real en este dominio.
- Sin garantías de calibración: las predicciones de log10(kcat) y log10(Km) son estimaciones estadísticas y no deben sustituir mediciones experimentales en contextos críticos.
- Licencia MIT: permite uso comercial y modificación, pero no se ofrece ninguna garantía por parte del autor.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.
- No es un modelo de lenguaje: no debe emplearse para generación de texto, código, razonamiento general ni tareas fuera de la predicción cinética enzimática.

## Enlaces

- HuggingFace: https://huggingface.co/Danish-777/kcat-km-v9
- CatPred-DB (referencia citada): Boorla, V. S. y Maranas, C. D., Nature Communications, 2025 (no se proporciona URL directa en la información disponible)
- BRENDA: no se proporciona URL en la información disponible
- SABIO-RK: no se proporciona URL en la información disponible
- ESM-2 (Meta): no se proporciona URL en la información disponible
- MMseqs2: no se proporciona URL en la información disponible
