# raisser/kcat-km-esm35-lgb

## Resumen

kcat-Km es un modelo predictivo de parámetros enzimáticos desarrollado por el usuario raisser y publicado en Hugging Face bajo licencia MIT. No se trata de un modelo de lenguaje generativo, sino de un pipeline de regresión supervisada que combina un codificador de proteínas congelado (ESM-2 de 35 millones de parámetros, variante de 12 capas) con descriptores moleculares calculados mediante RDKit, y que entrena un regresor LightGBM independiente para cada objetivo (kcat y Km). El repositorio ocupa aproximadamente 0,1 GB y contiene pesos en formato safetensors.

El modelo aborda un problema clásico en biología computacional y enzimiología: predecir la constante catalítica (kcat) y la constante de Michaelis (Km) de una enzima a partir de su secuencia y de la estructura del sustrato, sin necesidad de realizar ensayos experimentales. Esto es relevante para el diseño de enzimas, la ingeniería metabólica y el cribado de sustratos, donde los datos experimentales son caros y escasos.

La propuesta técnica es deliberadamente ligera: no se entrena el codificador ESM-2, sino que se congela y se usa como extractor de características, lo que permite inferencia en CPU y reduce los requisitos de hardware. El modelo se entrena únicamente con el split público de entrenamiento, sin datos externos, según declara el autor. La información publicada es muy escasa: no hay datos de benchmarks, idiomas, pipeline ni métricas de rendimiento en la model card.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline híbrido: ESM-2 35M (t12) congelado + descriptores RDKit (Morgan r=2, MACCS, 6 descriptores) + PCA(256) + LightGBM por objetivo |
| Parámetros totales | Aproximadamente 35 M en el codificador ESM-2; los regresores LightGBM no se expresan en número de parámetros neuronales |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende de la longitud máxima de secuencia admitida por ESM-2 t12) |
| Tipos de cuantización | No disponible (el codificador se distribuye presumiblemente en safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | No disponible (modelo de proteínas y moléculas, no de lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El pipeline consta de dos ramas de entrada. La rama proteica utiliza ESM-2 de 35 millones de parámetros (12 capas) congelado, del que se extraen embeddings de la última capa y de la capa 8, se aplica mean-pooling y se reduce la dimensionalidad mediante PCA a 256 componentes. La rama molecular calcula descriptores con RDKit: fingerprints Morgan de conteo con radio 2 y 1024 bits, claves MACCS y 6 descriptores fisicoquímicos adicionales. Ambas representaciones se concatenan y alimentan un regresor LightGBM independiente por cada objetivo (kcat y Km).

El entrenamiento se realiza exclusivamente sobre el split público de entrenamiento, sin datos externos, según la model card. No se documentan el número de muestras, la composición del dataset, ni si hubo ajuste fino del codificador (no lo hubo, al estar congelado). Tampoco se especifican hiperparámetros de LightGBM, estrategia de validación ni métricas de error. La innovación principal es la combinación de embeddings proteicos preentrenados con descriptores moleculares clásicos y un modelo de árboles, lo que abarata la inferencia y permite ejecución en CPU.

## Capacidades

- Predicción de kcat (constante catalítica) a partir de secuencia de enzima y estructura de sustrato.
- Predicción de Km (constante de Michaelis-Menten) con las mismas entradas.
- Extracción de representaciones proteicas mediante ESM-2 t12 con mean-pooling de última capa y capa 8.
- Cálculo de descriptores moleculares con RDKit: Morgan counts (r=2, 1024 bits), MACCS y 6 descriptores fisicoquímicos.
- Inferencia en CPU sin necesidad de GPU.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Priorización de sustratos en cribados enzimáticos: dado un panel de moléculas candidatas y una enzima de interés, el modelo estima kcat y Km para ordenar experimentalmente solo las combinaciones más prometedoras, reduciendo coste de ensayos.
- Ingeniería de enzimas: al evaluar variantes de secuencia de una enzima, el pipeline permite estimar el impacto sobre kcat y Km sin expresar y purificar cada variante, guiando rondas de mutagénesis dirigida.
- Anotación de bases de datos de reacciones: para reacciones enzimáticas sin parámetros cinéticos medidos, el modelo puede generar estimaciones preliminares que ayuden a completar bases como BRENDA o SABIO-RK, marcadas como predicciones.
- Diseño de rutas metabólicas: en la construcción de vías heterólogas, permite comparar enzimas candidatas para un paso concreto estimando su eficiencia catalítica frente al sustrato endógeno.
- Cribado virtual de inhibidores: la predicción de Km para sustratos alternativos puede orientar la búsqueda de análogos que compitan con el sustrato natural.
- Docencia y prototipado: al ejecutarse en CPU y con un repositorio de 0,1 GB, es adecuado para entornos sin GPU, notebooks docentes y pruebas de concepto de pipelines de predicción cinética.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de error (RMSE, MAE, R²), ni comparaciones con otros predictores de kcat/Km, ni detalles del conjunto de validación.

## Requisitos de hardware

- VRAM estimada: no requiere GPU; el codificador ESM-2 35M es pequeño y la inferencia está pensada para CPU.
- GPU recomendadas: no aplica; cualquier GPU consumer podría acelerar la extracción de embeddings, pero no es necesaria.
- ¿Cabe en GPU consumer? Sí, con holgura, aunque el diseño apunta a CPU.
- Opciones de despliegue: scripts de Python con PyTorch o transformers para ESM-2, RDKit para descriptores y LightGBM para la predicción; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kcat-Km (raisser) | ESM-2 35M + RDKit + LightGBM | ~35 M (codificador) | No disponible | MIT | Hugging Face |
| UniKP | Framework de predicción de kcat/Km basado en modelos preentrenados | No disponible | No disponible | No disponible | Repositorio público |
| DLKcat | Red neuronal sobre grafos y secuencias para kcat | No disponible | No disponible | No disponible | Repositorio público |
| EITLEM-Kinetics | Ensemble de modelos proteicos para kcat/Km | No disponible | No disponible | No disponible | Repositorio público |

No se dispone de datos comparativos de rendimiento entre estas alternativas en la información proporcionada; la comparación se limita a la categoría de tarea.

## Limitaciones y advertencias

- Ausencia total de métricas publicadas: no hay RMSE, MAE ni R², por lo que no es posible evaluar su fiabilidad frente a alternativas.
- Entrenado solo con el split público de entrenamiento: puede tener sesgos hacia la distribución de enzimas y sustratos de ese conjunto y generalizar peor en familias poco representadas.
- Modelo congelado: al no ajustar ESM-2, la representación proteica no está especializada para cinética enzimática, lo que puede limitar la precisión frente a enfoques con fine-tuning.
- Riesgo de extrapolación: las predicciones fuera del dominio químico o proteico cubierto por el entrenamiento pueden ser poco fiables.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene verificar las licencias de ESM-2 y RDKit en producción.
- No es un modelo de lenguaje: no debe usarse para generación de texto, agentes ni tareas generales de NLP.
- Sin información sobre idiomas, pipeline ni versionado: la reproducibilidad depende de la documentación del repositorio, que es mínima.

## Enlaces

- Hugging Face: https://huggingface.co/raisser/kcat-km-esm35-lgb
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.
