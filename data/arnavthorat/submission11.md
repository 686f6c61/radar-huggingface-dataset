# arnavthorat/submission11

## Resumen

`arnavthorat/submission11` es un modelo de regresión multimodal orientado a la predicción de parámetros cinéticos enzimáticos: `log10_kcat` y `log10_km` a partir de la secuencia proteica y el SMILES del sustrato. Lo publica el usuario Arnav Thorat en Hugging Face bajo licencia Apache-2.0, y no es un modelo de lenguaje generativo sino un ensemble de cabezas de regresión construido sobre extractores de características congelados.

La arquitectura combina ESM-2 de 35M de parámetros (primeras 510 residuos, mean-pooled) para la proteína con MoLFormer para el sustrato, a los que se añaden características de composición, huellas de Morgan y descriptores de RDKit. Sobre esas representaciones se entrenan varias cabezas (TabM, dos redes de fusión pequeñas y LightGBM) cuyas predicciones se agregan mediante rangos percentiles y un ajuste por secuencia proteica compartida.

Su relevancia es acotada pero específica: automatiza la anotación de cinética enzimática, un cuello de botella experimental costoso, y lo hace con inferencia íntegramente en CPU y sin acceso a red. El repositorio ocupa 0,4 GB y no presenta descargas ni likes en el momento de la consulta, lo que sugiere una publicación reciente y de nicho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de regresión sobre extractores congelados (ESM-2 35M + MoLFormer) con cabezas TabM, dos redes de fusión y LightGBM |
| Parametros totales | no disponible (los extractores suman ~35M en ESM-2; MoLFormer y cabezas no cuantificados en la informacion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 510 residuos proteicos (truncado de ESM-2); longitud de SMILES no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (entrada de secuencia proteica y SMILES, no texto natural) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (tag del repositorio) |

## Arquitectura y entrenamiento

El modelo no entrena de extremo a extremo un transformer, sino que congela dos encoders preentrenados: ESM-2 35M para la secuencia proteica (limitada a los primeros 510 residuos y agregada por mean pooling) y MoLFormer para la representación molecular del sustrato. A estas representaciones se añaden características de composición de la secuencia, fingerprints de Morgan y descriptores calculados con RDKit. Sobre ese vector de entrada se entrenan cuatro familias de cabezas: TabM, dos redes de fusión de pequeño tamaño y un modelo LightGBM.

La agregación de salidas es un componente técnico destacable: para cada objetivo se calcula la media equitativa de los rangos percentiles de las cabezas, se desplaza parcialmente hacia la media de las filas que comparten la misma secuencia proteica y finalmente se mapea sobre la distribución de etiquetas del conjunto de entrenamiento. Las cabezas de `kcat` incorporan además filas de entrenamiento upstream cuyas enzimas son idénticas o similares a las del conjunto oficial. El fichero `recipe.json` documenta la composición de las cabezas. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo ajuste por RLHF o DPO (no aplicable en un modelo de regresión de este tipo).

## Capacidades

- Predicción de `log10_kcat` y `log10_km` a partir de pares (secuencia proteica, SMILES de sustrato).
- Extracción de representaciones proteicas mediante ESM-2 35M con truncado a 510 residuos.
- Representación molecular de sustratos mediante MoLFormer y fingerprints de Morgan con descriptores de RDKit.
- Ensemble multimodelo con agregación por rangos percentiles y corrección por secuencia compartida.
- Inferencia local en CPU sin acceso a red; los pesos y el código de inferencia están incluidos en el repositorio.
- Interfaz de línea de comandos: `python /app/predict.py --input INPUT --output OUTPUT` con columnas de entrada `id`, `sequence`, `smiles` y salida `id`, `log10_kcat`, `log10_km`.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto; no es un modelo conversacional.

## Casos de uso

- Priorización de experimentos de cinética enzimática: dado un panel de enzimas candidatas y sustratos, el modelo estima `kcat` y `Km` para ordenar qué pares merece la pena caracterizar experimentalmente, reduciendo el número de ensayos necesarios.
- Anotación de bases de datos de enzimas: rellenar entradas faltantes de `kcat` y `Km` en catálogos internos a partir de secuencia y SMILES, con la salida en escala log10 lista para análisis estadístico.
- Diseño de enzimas dirigido por modelo: filtrar variantes generadas por herramientas de diseño proteico evaluando el impacto predicho sobre la constante catalítica antes de sintetizarlas.
- Cribado de sustratos en biología sintética: evaluar rutas metabólicas alternativas estimando la afinidad de una enzima con distintos sustratos candidatos representados como SMILES.
- Integración en pipelines bioinformáticos en entornos restringidos: al ejecutarse en CPU y sin red, encaja en clústeres air-gapped o contenedores de CI donde no se permite acceso externo.
- Investigación en ingeniería de proteínas: usar las predicciones como baseline cuantitativo en estudios de relación secuencia-función, aprovechando la corrección por secuencia compartida para comparar variantes de una misma enzima.
- Enseñanza y prototipado de modelos multimodales en bioquímica: ejemplo reproducible de fusión de encoders proteicos y moleculares con agregación por ensemble.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica de forma estricta; la inferencia está diseñada para ejecutarse en CPU. El repositorio ocupa 0,4 GB, por lo que la memoria RAM necesaria es del orden de unos pocos GB incluyendo dependencias (PyTorch, RDKit, LightGBM).
- GPU: no se especifica soporte ni recomendación de GPU en la información disponible. Con ESM-2 35M y MoLFormer, una GPU consumer modesta (por ejemplo, RTX 3060 o superior) sería suficiente si se habilitase, pero no está documentado.
- GPU consumer: no confirmado; el diseño declarado es CPU-only.
- Despliegue: script propio `predict.py` incluido en el repositorio; no se documenta integración con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles. La inferencia es local y sin red, con ficheros temporales de módulos de Hugging Face escritos en `/tmp`.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| arnavthorat/submission11 | Ensemble de regresión kcat/Km sobre ESM-2 + MoLFormer | ESM-2 35M + cabezas (total no disponible) | 510 residuos | Apache-2.0 | Hugging Face, 0 descargas |
| ESM-2 (Meta) | Encoder proteico preentrenado | 8M a 15B según variante | 1024 residuos en variantes grandes | MIT | Hugging Face, ampliamente usado |
| MoLFormer (IBM) | Transformer molecular | no disponible en la informacion | no disponible | Apache-2.0 | Hugging Face |
| Modelos específicos de kcat (p. ej. TurNuP, DLKcat) | Regresión cinética enzimática | no disponible | no disponible | variable | Publicaciones y repositorios académicos |

La comparación directa con otros predictores de `kcat`/`Km` no puede establecerse con datos de rendimiento porque no se han publicado métricas en la información disponible.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no responde preguntas ni soporta instrucciones en lenguaje natural.
- El truncado a 510 residuos descarta información de proteínas largas, lo que puede degradar predicciones en enzimas de gran tamaño.
- Las cabezas de `kcat` incorporan filas upstream con enzimas similares a las de entrenamiento, lo que puede inflar el rendimiento aparente en enzimas cercanas al conjunto de entrenamiento y no generalizar igual en enzimas novedosas.
- Riesgo de extrapolación fuera de la distribución del conjunto de entrenamiento: sustratos o familias proteicas poco representadas pueden producir predicciones poco fiables.
- La agregación por rangos percentiles y el mapeo a la distribución de etiquetas de entrenamiento implica que las salidas están acotadas implícitamente al rango observado; valores extremos reales pueden quedar comprimidos.
- No se documentan sesgos específicos ni evaluación de calibración; la incertidumbre de las predicciones no se cuantifica en la información disponible.
- La licencia Apache-2.0 permite uso comercial, pero los componentes preentrenados conservan sus licencias originales (ESM-2 MIT, MoLFormer Apache-2.0), que deben respetarse.
- El repositorio contiene parámetros y código de inferencia, no las tablas de entrenamiento ni los ficheros de predicción, lo que limita la reproducibilidad completa del pipeline.
- Sin descargas ni likes registrados y publicado en 2026: no hay evidencia de validación independiente por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/arnavthorat/submission11
- Perfil del autor: https://huggingface.co/arnavthorat/models
- ESM-2 (Meta): https://huggingface.co/facebook/esm2_t12_35M_UR50D
- MoLFormer (IBM): https://huggingface.co/ibm/MoLFormer-XL-both-10pct
