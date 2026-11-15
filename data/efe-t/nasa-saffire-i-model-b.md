# efe-T/nasa-saffire-i-model-b

## Resumen

NASA Saffire-I model_b es un modelo de medición científico publicado por el usuario efe-T en Hugging Face. No es un modelo de lenguaje ni una red neuronal profunda: se trata de una corrección lineal de regresión (sklearn `LinearRegression`) empaquetada con joblib que estima la posición de la cresta luminosa punteada en imágenes de la cámara 1 del experimento Saffire-I de la NASA, en condiciones de microgravedad y combustión. El modelo se ajusta sobre 18 anotaciones visuales de agente de la fase concurrente y se evalúa sobre 6 anotaciones de un bloque temporal posterior.

El interés del modelo es metodológico y de reproducibilidad: el pipeline descarga los fotogramas originales desde la API pública NASA PSI, valida hashes SHA256 y CRC de los ZIP, deriva la calibración del tablero de ajedrez nominal de 30 mm y compara seis métodos candidatos sobre particiones idénticas de desarrollo. El resultado es honesto y limitado: el MAE de posición en el conjunto reservado es de 4,829 mm nominales, frente a 4,545 mm de una línea base de umbral simple, por lo que la corrección aprendida no demuestra mejora sobre el umbral.

Es relevante ahora como ejemplo de model card rigurosa en un contexto de ciencia abierta: separa explícitamente valores `predicted`, `derived` y `source_reported`, documenta límites científicos (una sola misión, una sola muestra física, anotaciones de agente que no son ground truth humano) y no reclama mejoras que sus datos no respaldan. El repositorio ocupa 0,0 GB y las descargas y likes registrados son 0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Regresión lineal estándar de scikit-learn (`LinearRegression`) sobre características derivadas de imagen, no red neuronal |
| Parámetros totales | No disponible (modelo lineal de baja dimensionalidad; el número exacto de coeficientes no se detalla) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de regresión sobre una imagen por inferencia) |
| Tipos de cuantización | No disponible (no aplica; artefacto joblib en coma flotante) |
| Idiomas soportados | Inglés (metadatos y documentación; el modelo no procesa lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | joblib (artefacto serializado de scikit-learn), acompañado de JSON de preprocesado, configuración de dominio, calibración y manifiesto de checksums |

## Arquitectura y entrenamiento

El modelo no es un transformer ni una red neuronal. Es una corrección lineal pequeña implementada como `LinearRegression` de scikit-learn, serializada con joblib. El pipeline incluye adquisición pública de datos de la NASA, preparación determinista de metadatos, calibración nominal mediante tablero de ajedrez, ajuste y evaluación de seis métodos candidatos sobre particiones de desarrollo idénticas, y una evaluación final sobre el bloque temporal reservado. El estado exportado contiene todo lo necesario para la inferencia sin el módulo de entrenamiento.

Los datos de entrenamiento son 18 anotaciones visuales de agente de la fase concurrente; la evaluación usa 6 anotaciones de un bloque temporal posterior. No se usan tasas de la fuente para entrenar ni se fabrican mediciones ausentes. Las versiones de scikit-learn, joblib y numpy están fijadas. El protocolo de reproducción repite el registro histórico, de modo que el bloque de test no es nuevo al reejecutarse. El notebook `notebooks/model_b_colab.ipynb` embebe el paquete fuente y los metadatos fijados, descarga datos reales de la NASA y se ejecuta con "Runtime → Run all" en un entorno Colab de CPU estándar.

## Capacidades

- Estimación de la posición de la cresta luminosa punteada en imágenes mapeadas de la cámara 1 del experimento Saffire-I, en milímetros nominales.
- Inferencia por imagen individual mediante la función `predict_model_b` con un diccionario de entrada (ruta de fotograma, cámara, mapeo de imagen, material y unidades).
- Validación de entrada: rechaza unidades, materiales o cámaras no soportados, así como imágenes redimensionadas.
- Detección fuera de distribución (OOD): devuelve nulo con una razón cuando la intensidad es inadecuada, hay contraluz o las crestas están recortadas o ausentes.
- Aviso cuando la coordenada x de la corrección aprendida queda fuera del rango de ajuste de desarrollo.
- Exportación e importación completas del estado del modelo (artefacto joblib más JSON de preprocesado, calibración y configuración).
- Comparación en panel con las tasas PMMA de BASS-II del modelo hermano model_a, preservando las diferencias de material, escala, flujo y definición de cantidad.
- No soporta tool calling, agentes, razonamiento multi-paso, visión general, audio ni generación de texto.

## Casos de uso

- Reproducción de resultados científicos: el pipeline de un solo comando importa el subconjunto de fotogramas originales con checksum o descarga los mismos miembros ZIP desde la API pública NASA PSI, valida SHA256 y CRC, y reproduce el protocolo registrado. Útil para auditar la afirmación de MAE de 4,829 mm.
- Integración en paneles de seguimiento de experimentos de combustión en microgravedad: la función `predict_model_b` devuelve posiciones corregidas etiquetadas como `predicted`, separadas de las `derived` (extractor crudo y calibración) y de las `source_reported` (tablas publicadas), lo que permite comparar sin mezclar procedencias.
- Docencia y formación en ciencia abierta: el repositorio sirve como ejemplo de model card que documenta límites, conflictos en el CSV fuente, duración y potencia de ignición sin reconciliarlos silenciosamente.
- Control de calidad de anotaciones: la detección OOD y el aviso de rango de ajuste permiten filtrar imágenes con crestas recortadas o contraluz antes de incorporarlas a un análisis.
- Validación de pipelines de calibración: la calibración nominal de tablero de ajedrez de 30 mm y la conservación de marcas de tiempo permiten verificar la repetibilidad del espaciado de rejilla en réplicas.
- Evaluación comparativa de métodos: el repositorio fija seis métodos candidatos y una línea base de umbral simple; sirve para estudiar por qué una corrección aprendida puede no superar a un umbral en un conjunto de test pequeño.
- Integración sin notebook en servicios de CPU: la carga del artefacto no requiere el módulo de entrenamiento, lo que facilita desplegar la inferencia en un entorno Python 3.12 o 3.13 con versiones fijadas.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| MAE de posición en conjunto reservado (model_b) | 4,829 mm nominales |
| MAE de posición en conjunto reservado (línea base de umbral simple) | 4,545 mm |
| Mejora de la corrección aprendida sobre el umbral | No demostrada (el umbral puntúa ligeramente mejor) |
| Dispersión de combustión completa reportada por la fuente | 1,8 mm/s y 1,3 mm/s (mediciones de referencia separadas, no comparables directamente) |
| Inferencia de muestra reproducida en CPU | 220,28979111936016 mm nominales |
| Pruebas locales superadas en Python 3.12 | 15 |
| Archivos de release verificados por checksum | 148 |
| Artefactos verificados | 10 |
| Revisión de Hugging Face verificada | 60267afa086b32a73e9e66d90c214c1e7b5bccb2 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que el modelo no es un modelo de lenguaje.

## Requisitos de hardware

- Inferencia en CPU: el notebook se ejecutó de extremo a extremo en un entorno Colab de CPU estándar; no requiere GPU.
- VRAM estimada: no aplica; el artefacto es un modelo lineal pequeño serializado con joblib.
- GPU recomendadas: ninguna; el modelo no aprovecha aceleración por GPU.
- Compatibilidad con GPU de consumo: no aplica; cualquier CPU x86 o ARM con Python 3.12 o 3.13 es suficiente.
- Opciones de despliegue: Python 3.12 o 3.13 con entorno virtual, `requirements.lock` fijado, scikit-learn, joblib y numpy en versiones fijadas; notebook de Colab incluido; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; la inferencia de muestra se reprodujo correctamente pero no se publican tiempos.
- Almacenamiento: repositorio de 0,0 GB; el pipeline descarga los fotogramas originales de la NASA bajo demanda.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| NASA Saffire-I model_b (efe-T) | Regresión lineal sobre imagen | No disponible | No aplica | MAE 4,829 mm en test; umbral 4,545 mm | Apache 2.0 | Hugging Face, 0 descargas |
| NASA Saffire-I model_a (BASS-II PMMA) | Modelo de medición de tasas PMMA | No disponible | No aplica | No disponible | No disponible | Referenciado en la model card de model_b |
| Línea base de umbral simple | Umbral sobre intensidad | No aplica | No aplica | MAE 4,545 mm en el mismo test | No aplica | Incluida en el repositorio |

No se dispone de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El modelo no predice un nuevo experimento de fuego, una puntuación de peligro ni el comportamiento del PMMA; solo estima la posición de la cresta luminosa punteada en imágenes mapeadas de la cámara 1.
- La corrección aprendida no demuestra mejora sobre la línea base de umbral simple: 4,829 mm frente a 4,545 mm en el único bloque de test.
- Las anotaciones de agente no son ground truth humano; las crestas brillantes serpentean y el objetivo difiere del frente de pirólisis.
- Todos los bloques temporales comparten una sola muestra física y una sola misión, lo que limita la generalización.
- No se soporta inferencia sobre otro material, configuración de oxígeno o flujo, nave espacial, cámara o experimento independiente.
- La cámara 2 y el procesamiento de llegada de sensores no están implementados.
- La dimensión nominal de 30 mm del tablero de ajedrez solo está documentada en los nombres de archivo de la NASA; el enlace al PDF de calibración está roto y la repetibilidad del espaciado de rejilla no constituye incertidumbre física total.
- El bloque de test histórico no es nuevo al reejecutar la reproducción.
- El modelo rechaza unidades, materiales o cámaras no soportados y devuelve nulo con razón OOD ante intensidad inadecuada, contraluz o crestas recortadas.
- Riesgo de alucinación no aplica en el sentido de modelos generativos, pero sí existe riesgo de extrapolación fuera del rango de ajuste, mitigado con un aviso.
- La licencia Apache 2.0 cubre el código, notebooks, documentación y artefactos del proyecto; los materiales originales de la NASA conservan sus propios términos y atribución (véase `NOTICE`).
- El panel puede comparar unidades con las tasas PMMA de model_a, pero debe preservar las diferencias de material, escala, flujo, definición de cantidad y validación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/efe-T/nasa-saffire-i-model-b
- Fuente original NASA PSI-98 v4, DOI: https://doi.org/10.60555/0t15-1z43
- Referencia de publicación NTRS 20170008805, tabla I en p. 29: https://ntrs.nasa.gov/citations/20170008805
- Referencia de publicación NTRS 20180005168, pp. 30-31: https://ntrs.nasa.gov/citations/20180005168
- API pública de descarga NASA PSI: no disponible como URL directa en la información proporcionada
