# eshikanahata/kcat-km-v2

## Resumen

Leak CURBER kcat–Km es un artefacto publicado en Hugging Face por el usuario eshikanahata bajo el identificador `kcat-km-v2`. Por los tags declarados (`leak-curber`, `kcat`, `km`) y el punto de entrada documentado (`predict.py`), se trata de un modelo predictivo orientado a estimar parámetros cinéticos enzimáticos: la constante catalítica (kcat) y la constante de Michaelis (Km). No es un modelo de lenguaje generativo, sino un pipeline de regresión entrenado para predecir valores numéricos a partir de entradas biológicas.

El repositorio ocupa 1.0 GB y contiene pesos en formato `joblib` y `safetensors`, lo que sugiere una combinación de artefactos de scikit-learn (u otra librería Python serializada con joblib) y tensores de un modelo neuronal. La model card es extremadamente escueta: se limita a declarar los tags, la licencia MIT y el comando de invocación, sin detallar arquitectura, datos de entrenamiento, métricas ni requisitos.

Su relevancia es acotada y experimental: se publica con cero descargas y cero likes, sin pipeline declarado en la plataforma, y sin documentación técnica sustantiva. Resulta útil únicamente como referencia para quien quiera reproducir o inspeccionar un predictor de parámetros cinéticos, no como componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (artefacto con pesos en joblib y safetensors; no se especifica el tipo de modelo) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | joblib y safetensors |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna. La presencia conjunta de `joblib` y `safetensors` apunta a un ensamblado híbrido: probablemente un modelo de machine learning clásico serializado con joblib (por ejemplo, un regresor de scikit-learn) junto con pesos tensoriales en safetensors, posiblemente de un codificador de secuencias o de una red densa. No hay datos sobre el número de parámetros, la composición del dataset, el volumen de tokens o muestras de entrenamiento, ni sobre si se aplicaron técnicas de ajuste fino, validación cruzada o regularización específicas.

Tampoco se documenta el preprocesado de entradas (secuencias proteicas, sustratos SMILES, descriptores moleculares u otra representación), el esquema de partición train/test ni las métricas de validación. Cualquier afirmación sobre innovaciones técnicas (atención, embeddings preentrenados, ensembles) sería especulativa y no se incluye aquí.

## Capacidades

- Predicción de parámetros cinéticos enzimáticos: el nombre y los tags indican estimación de kcat y Km.
- Inferencia por línea de comandos mediante `python /app/predict.py --input INPUT --output OUTPUT`, con ficheros de entrada y salida.
- Empaquetado como contenedor o aplicación Python (la ruta `/app/predict.py` sugiere un entorno Docker).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito.
- No se declara pipeline en Hugging Face, por lo que no es invocable mediante la Inference API estándar.

## Casos de uso

- Anotación de enzimas en pipelines de biología computacional: usar el script `predict.py` para generar estimaciones de kcat y Km sobre un lote de enzimas y sustratos, e integrar la salida en una base de datos interna de cinética enzimática.
- Priorización en diseño de enzimas: filtrar variantes candidatas por kcat predicha antes de ensayos experimentales, reduciendo el número de validaciones de laboratorio.
- Enriquecimiento de datasets de metabolismo: completar tablas de parámetros cinéticos faltantes para modelos de redes metabólicas a escala de genoma.
- Docencia y prototipado: emplear el artefacto como ejemplo reproducible de un predictor de parámetros bioquímicos dentro de un curso o taller, dado su empaquetado simple con entrada y salida por fichero.
- Evaluación comparativa de métodos: servir como línea base frente a otros predictores de kcat/Km (DLKcat, UniKP, etc.) en estudios de benchmarking internos.
- Despliegue en un contenedor de investigación: encapsular el script en una imagen Docker y exponerlo como servicio batch en un clúster interno para procesar grandes conjuntos de pares enzima-sustrato.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; con un repositorio de 1.0 GB, el modelo probablemente cabe en GPU consumer de 8-16 GB, pero no se confirma.
- GPU recomendadas: no disponibles. Para un artefacto de este tamaño, cualquier GPU con al menos 8 GB de memoria sería suficiente en la mayoría de escenarios, aunque no hay datos oficiales.
- Compatibilidad con GPU consumer: probable pero no confirmada; también podría ejecutarse solo en CPU si el componente principal es un modelo de scikit-learn.
- Opciones de despliegue: ejecución directa del script `predict.py` dentro del contenedor `/app`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de artefacto).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| eshikanahata/kcat-km-v2 | Predictor de kcat/Km (joblib + safetensors) | no disponible | no aplica | MIT | Hugging Face, 0 descargas |
| DLKcat | Predictor de kcat basado en GNN | no disponible en esta ficha | no aplica | no disponible | Repositorio académico |
| UniKP | Predictor de kcat/Km con preentrenamiento | no disponible en esta ficha | no aplica | no disponible | Repositorio académico |
| CatPred | Predictor de parámetros cinéticos con incertidumbre | no disponible en esta ficha | no aplica | no disponible | Repositorio académico |

No se dispone de datos de rendimiento del modelo evaluado que permitan una comparación cuantitativa con DLKcat, UniKP o CatPred.

## Limitaciones y advertencias

- Documentación mínima: la model card no describe arquitectura, datos, métricas ni limitaciones, lo que impide evaluar su fiabilidad.
- Sin benchmarks publicados: no hay evidencia de precisión en kcat o Km frente a métodos establecidos.
- Cero adopción: 0 descargas y 0 likes en el momento de la consulta; no hay validación por parte de la comunidad.
- Riesgo de sesgo en los datos de entrenamiento: al no conocerse la composición del dataset, no puede descartarse un sesgo hacia familias enzimáticas o sustratos sobrerrepresentados.
- Riesgo de extrapolación: los predictores de parámetros cinéticos suelen degradarse fuera de la distribución de entrenamiento; sin información sobre el dominio cubierto, no es posible acotar este riesgo.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte.
- Dependencia del entorno `/app`: el punto de entrada asume una ruta y un contenedor concretos; fuera de ese entorno puede requerir adaptación.
- No apto como sustituto de medición experimental: las predicciones deben tratarse como estimaciones orientativas.

## Enlaces

- Hugging Face: https://huggingface.co/eshikanahata/kcat-km-v2
