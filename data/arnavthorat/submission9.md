# arnavthorat/submission9

## Resumen

`arnavthorat/submission9` es un modelo de regresion multimodal orientado a la prediccion de parametros de cinetica enzimatica: concretamente `log10_kcat` y `log10_km` a partir de la secuencia de proteina y del SMILES del sustrato. Lo publica el usuario arnavthorat en Hugging Face bajo licencia Apache-2.0 y con un tamano de repositorio de 0,4 GB. No es un modelo generativo de lenguaje: es un ensamblado de cabezas de regresion que combina representaciones congeladas de ESM-2 (35M) y MoLFormer, caracteristicas de composicion, fingerprints de Morgan y descriptores de RDKit.

El problema que aborda es relevante en biologia computacional y enzimologia: estimar la constante catalitica (`kcat`) y la constante de Michaelis (`Km`) sin recurrir a experimentos de laboratorio, que son costosos y lentos. La aproximacion es pragmatica: en lugar de entrenar un unico transformer de extremo a extremo, congela los extractores de caracteristicas y entrena varias cabezas ligeras (TabM, dos redes de fusion pequenas y LightGBM) sobre el conjunto de entrenamiento oficial, agregando sus predicciones mediante rangos percentiles.

La relevancia actual del modelo es limitada y muy especifica: se trata de un artefacto de competicion o submission con cero descargas y cero likes, sin pipeline declarado ni idiomas especificados. Su interes es metodologico (fusion de embeddings proteicos y quimicos con modelos tabulares) mas que como modelo de proposito general. La model card no documenta resultados de benchmarks ni metricas de validacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensamblado de cabezas de regresion (TabM, dos redes de fusion y LightGBM) sobre extractores congelados ESM-2 35M y MoLFormer mas features de composicion, fingerprints de Morgan y descriptores RDKit |
| Parametros totales | no disponible (el repo ocupa 0,4 GB; ESM-2 35M y MoLFormer se usan congelados) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ESM-2 procesa los primeros 510 residuos de la secuencia proteica) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la entrada es secuencia proteica y SMILES, no texto natural) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (tag del repo) mas artefactos de LightGBM y `recipe.json` |

## Arquitectura y entrenamiento

El modelo no es un transformer unico sino un pipeline de extraccion de caracteristicas seguido de un ensamblado de cabezas. Las caracteristicas provienen de cuatro fuentes: ESM-2 35M congelado (primeros 510 residuos, mean-pooled), MoLFormer congelado, caracteristicas de composicion y fingerprints de Morgan con descriptores de RDKit. Sobre esas representaciones se entrenan varias cabezas: TabM, dos redes de fusion pequenas y LightGBM.

La agregacion de salidas es particular: para cada objetivo se calcula la media equitativa de los rangos percentiles de las cabezas, se desplaza parcialmente hacia la media para las filas que comparten la misma secuencia proteica y finalmente se mapea sobre la distribucion de etiquetas de entrenamiento. Las cabezas de `kcat` incorporan ademas filas de entrenamiento upstream cuyas enzimas son iguales o similares a las del conjunto oficial. No se documentan numero de tokens, composicion del dataset ni uso de RLHF o DPO, que no aplican a este tipo de modelo.

## Capacidades

- Prediccion de `log10_kcat` y `log10_km` a partir de secuencia proteica y SMILES de sustrato.
- Extraccion de representaciones proteicas mediante ESM-2 35M (hasta 510 residuos).
- Extraccion de representaciones moleculares mediante MoLFormer.
- Calculo de fingerprints de Morgan y descriptores RDKit a partir del SMILES.
- Agregacion por rangos percentiles y correccion por secuencia proteica compartida.
- Inferencia en CPU sin acceso a red, con pesos locales.
- No soporta tool calling, agentes, vision, audio ni generacion de texto.

## Casos de uso

- Priorizacion de experimentos de enzimologia: dado un panel de enzimas y sustratos candidatos, predecir `kcat` y `Km` para ordenar que combinaciones merecen ensayo de laboratorio, reduciendo el coste experimental.
- Ingenieria de proteinas: evaluar rapidamente variantes de secuencia frente a un sustrato fijo y filtrar mutaciones con potencial catalitico antes de sintetizarlas.
- Anotacion de bases de datos metabolicas: completar parametros cineticos ausentes en modelos de redes metabolicas a partir de secuencias y SMILES ya disponibles.
- Cribado de sustratos: para una enzima de interes, recorrer un catalogo de moleculas en SMILES y estimar afinidad (`Km`) para descartar candidatos poco prometedores.
- Construccion de modelos cineticos a escala de genoma: generar estimaciones iniciales de `kcat`/`Km` para alimentar simulaciones de flujo metabolico cuando faltan datos experimentales.
- Analisis de sensibilidad en biologia de sistemas: sustituir parametros desconocidos por predicciones y estudiar como varia el comportamiento del modelo metabolico.
- Docencia y prototipado: ejecutar el pipeline en CPU sin red para demostrar la fusion de embeddings proteicos y quimicos en un entorno controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM: no disponible; la inferencia esta disenada para ejecutarse en CPU.
- GPU recomendadas: no disponible; no se requiere GPU segun la model card.
- Cabe en GPU consumer: si, al ejecutarse en CPU no necesita GPU; el repo ocupa 0,4 GB.
- Opciones de despliegue: script propio `python /app/predict.py --input INPUT --output OUTPUT`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Nota: la inferencia escribe ficheros temporales de modulos de Hugging Face bajo `/tmp` y no requiere acceso a red.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| arnavthorat/submission9 | Ensamblado de regresion kcat/Km | no disponible (repo 0,4 GB) | no disponible | Apache-2.0 | Hugging Face, 0 descargas |
| ESM-2 35M (Meta) | Transformer proteico | 35M (congelado como extractor) | no disponible | MIT | Hugging Face |
| MoLFormer (IBM) | Transformer molecular | no disponible | no disponible | Apache-2.0 | Hugging Face |

No se dispone de datos de rendimiento comparables entre estos modelos en la informacion proporcionada; la comparativa se limita a licencia, disponibilidad y rol dentro del pipeline.

## Limitaciones y advertencias

- Modelo de regresion especifico de cinetica enzimatica; no es un modelo de lenguaje ni sirve para tareas genericas.
- Sin benchmarks publicados ni metricas de validacion en la model card: no hay evidencia cuantitativa de su precision.
- Cero descargas y cero likes: no hay validacion por parte de la comunidad.
- La prediccion depende de la calidad y cobertura del conjunto de entrenamiento oficial; generalizacion a enzimas o sustratos fuera de esa distribucion no esta documentada.
- Solo procesa los primeros 510 residuos de la secuencia proteica; proteinas mas largas quedan truncadas.
- La agregacion por rangos percentiles y el mapeo a la distribucion de etiquetas de entrenamiento pueden introducir sesgos hacia los valores mas frecuentes del conjunto de entrenamiento.
- Riesgo de alucinacion no aplica en sentido generativo, pero si existe riesgo de predicciones poco fiables fuera del dominio cubierto.
- Licencia Apache-2.0 permite uso comercial, pero las fuentes preentrenadas (ESM-2 MIT, MoLFormer Apache-2.0) imponen sus propias condiciones, incluidas en el repositorio.
- No se documentan idiomas, sesgos ni limitaciones de contexto en la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/arnavthorat/submission9
- ESM-2 (Meta): https://huggingface.co/facebook/esm2_t12_35M_UR50D
- MoLFormer (IBM): https://huggingface.co/ibm/MoLFormer-XL-both-10pct
