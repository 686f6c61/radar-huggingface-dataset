# dhillonv10/epiclock

## Resumen

EpiClock es una familia de cinco modelos transformer desarrollados por dhillonv10 para estimar la edad cronológica a partir de valores beta de metilación de ADN obtenidos con arrays Illumina 450K y EPIC. El modelo resuelve una tarea bioinformática concreta: predecir la edad de un individuo a partir de un panel fijo de 9.098 CpGs, una tarea clásica dentro del campo de los relojes epigenéticos. La familia incluye cinco variantes con tamaños que van de 2,1 M a 48,0 M de parámetros (EpiClock-T, S, B, L y XL).

La relevancia de esta publicación no reside en superar el estado del arte, sino en su honestidad metodológica: el autor documenta explícitamente que la familia no supera a una regresión elastic net entrenada con los mismos datos (3,27 años de error absoluto mediano frente a 3,34 años del mejor miembro) y que el tamaño del modelo no aporta mejoras medibles. El entrenamiento se realizó sobre 25.765 perfiles con edad anotada, auditados para excluir cáncer, otras enfermedades y cultivos celulares, y la evaluación se hizo sobre 2.830 controles sanos de 40 estudios nunca vistos durante el entrenamiento.

Se trata de modelos de investigación, no de dispositivos médicos, y no están validados para decisiones clínicas. La licencia es CC BY-SA 4.0, la misma que ComputAge Bench, cuyos estudios constituyen el conjunto de test y parte del entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con tokenización por CpG (identidad aprendida, contexto genómico y valor beta) |
| Parametros totales | Cinco variantes: 2,1 M (T), 3,2 M (S), 6,3 M (B), 11,2 M (L), 48,0 M (XL) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (opera sobre subconjuntos aleatorios de CpGs medidos) |
| Tipos de cuantizacion | No disponible (checkpoints PyTorch estándar en `model.pt`) |
| Idiomas soportados | No aplica (modelo biológico, no lingüístico) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | PyTorch checkpoint (`.pt`, serializado con pickle) |

## Arquitectura y entrenamiento

Cada CpG se representa como un token compuesto por una identidad aprendida, contexto genómico (cromosoma, relación con islas CpG, clase regulatoria y posición) y su valor beta. Una muestra se procesa como un subconjunto aleatorio de sus CpGs medidos, y las predicciones sobre varios subconjuntos se promedian. El preentrenamiento oculta el 25 % de los CpGs y los reconstruye sin etiquetas; el ajuste fino predice la edad como un reloj lineal sobre todos los CpGs (inicializado desde ridge) más una corrección aprendida por el transformer.

Los datos de entrenamiento comprenden 25.765 perfiles con edad y 11.526 sin ella sobre un panel fijo de 9.098 CpGs, procedentes de ComputAge Bench, series públicas de GEO y la colección pública MethylGPT / EWAS Data Hub. Cada perfil pasó una auditoría que descartó cáncer, otras enfermedades, cultivos celulares, estudios compartidos con el test y copias de muestras de test. Cabe destacar que 16.508 de los perfiles etiquetados miden solo 3.709 de los 9.098 CpGs del panel.

## Capacidades

- Predicción de edad cronológica a partir de valores beta de metilación de ADN (arrays 450K o EPIC).
- Manejo de valores faltantes en la matriz de entrada (los CpGs no medidos se admiten).
- Agregación por subconjuntos aleatorios de CpGs con promediado de predicciones para robustez.
- Preentrenamiento auto-supervisado de reconstrucción de CpGs ocultos (25 %).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Investigación en envejecimiento: estimar la edad epigenética de cohortes de controles sanos para estudiar desviaciones asociadas a exposiciones o fenotipos, usando la API `epiclock_predict` sobre dataframes de betas.
- Reanálisis de series públicas de GEO: aplicar los modelos a perfiles ya procesados de 450K/EPIC para obtener una estimación de edad comparable entre estudios, dado que el modelo admite valores faltantes y subconjuntos de CpGs.
- Comparación metodológica: usar la familia como línea base transformer frente a relojes lineales (elastic net, ridge, Horvath, Hannum, PhenoAge) en el mismo panel de 9.098 CpGs, tal como documenta `report.md`.
- Docencia y reproducción: el script `epiclock.py` incluye entrenamiento y predicción, lo que permite reproducir el pipeline completo con checkpoints pequeños (2,1 M a 48,0 M de parámetros) en hardware modesto.
- Auditoría de datos biomédicos: el informe incluye los recuentos de cada exclusión de la auditoría, útil como referencia para diseñar filtros de calidad en conjuntos de metilación.
- Estudios de edad acelerada con cautela: el autor reporta que la aceleración de edad separa pacientes de controles con AUC en torno a 0,56, por lo que solo es adecuada como análisis exploratorio, no como biomarcador validado.

## Benchmarks y rendimiento

Test: 2.830 controles sanos de 40 estudios de ComputAge Bench no usados en entrenamiento (2.699 de sangre). Intervalo del 95 % por bootstrap sobre estudios completos.

| Modelo | Parámetros | Error absoluto mediano (años) | Error absoluto medio | r |
|---|---|---|---|---|
| EpiClock-T | 2,1 M | 3,49 [2,69; 5,07] | 4,85 | 0,917 |
| EpiClock-S | 3,2 M | 3,44 [2,64; 5,05] | 4,83 | 0,919 |
| EpiClock-B | 6,3 M | 3,38 [2,63; 4,94] | 4,84 | 0,917 |
| EpiClock-L | 11,2 M | 3,34 [2,57; 4,86] | 4,78 | 0,918 |
| EpiClock-XL | 48,0 M | 3,42 [2,55; 4,99] | 4,89 | 0,915 |
| Elastic net (mismos datos) | 9.098 pesos | 3,27 [2,57; 4,76] | 4,62 | 0,921 |
| Ridge (mismos datos) | 9.098 pesos | 3,56 [2,73; 5,19] | 4,89 | 0,917 |

Relojes publicados sobre las mismas muestras, restringidos al mismo panel de 9.098 CpGs:

| Reloj | Error absoluto mediano (años) |
|---|---|
| Horvath V2 (piel y sangre) | 4,18 |
| Horvath V1 (pan-tejido) | 5,37 |
| Lin | 7,57 |
| PhenoAge (83 % de sus CpGs en el panel) | 8,03 |
| Hannum | 8,38 |

## Requisitos de hardware

- VRAM estimada para inferencia: muy reducida; los checkpoints van de 2,1 M a 48,0 M de parámetros, por lo que caben holgadamente en cualquier GPU consumer (incluso en CPU para inferencia puntual).
- GPU recomendadas: no se especifican; cualquier GPU con PyTorch funcional es suficiente. Una RTX 4090 o una A100 están sobredimensionadas para este modelo.
- Cabe en GPU consumer: sí, en todas las gamas actuales; el cuello de botella es el preprocesado de la matriz de betas, no el modelo.
- Opciones de despliegue: el repositorio proporciona `epiclock.py` con la función `epiclock_predict`; no se documenta integración con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / panel | Error mediano (años) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EpiClock-L | 11,2 M | Panel de 9.098 CpGs | 3,34 | CC BY-SA 4.0 | Hugging Face (repo oficial) |
| Elastic net (mismos datos) | 9.098 pesos | Panel de 9.098 CpGs | 3,27 | No disponible | Referencia en el informe |
| Horvath V2 | No disponible | Panel restringido a 9.098 CpGs | 4,18 | No disponible | Reloj publicado |
| PhenoAge | No disponible | 83 % de sus CpGs en el panel | 8,03 | No disponible | Reloj publicado |
| Hannum | No disponible | Panel restringido a 9.098 CpGs | 8,38 | No disponible | Reloj publicado |

## Limitaciones y advertencias

- Restringido a un panel fijo de 9.098 CpGs; no puede usar CpGs fuera de ese conjunto.
- Entrenado y evaluado mayoritariamente en sangre y en adultos; el rendimiento en otros tejidos o en poblaciones pediátricas no está caracterizado.
- Entrenado sobre edad cronológica en personas sanas: no predice enfermedad ni mortalidad.
- La aceleración de edad derivada de estos modelos separa pacientes de controles con un AUC en torno a 0,56, similar a ridge y Horvath V2; no es un biomarcador validado.
- No supera a una regresión elastic net entrenada con los mismos datos, y el tamaño del modelo no aporta mejoras medibles (intervalos de confianza solapados y un único entrenamiento por tamaño).
- Requiere valores beta de arrays 450K o EPIC ya procesados; no acepta datos crudos de intensidades.
- Los pesos son checkpoints PyTorch serializados con pickle: deben cargarse únicamente desde este repositorio por motivos de seguridad.
- Licencia CC BY-SA 4.0: impone compartir bajo la misma licencia las obras derivadas, lo que puede condicionar el uso comercial.
- Los datos de entrenamiento provienen de múltiples estudios públicos con términos propios; deben verificarse los términos de ComputAge Bench y de cada serie GEO antes de redistribuir datos derivados.
- No es un dispositivo médico y no está validado para decisiones clínicas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dhillonv10/epiclock
- Informe completo y auditoría de datos: `report.md` dentro del repositorio
- Tabla de la familia: `FAMILY.md` dentro del repositorio
- Script de entrenamiento y predicción: `epiclock.py` dentro del repositorio
- ComputAge Bench (origen de estudios de test y parte del entrenamiento): no disponible en la información proporcionada
- MethylGPT / EWAS Data Hub (fuente de datos): no disponible en la información proporcionada
