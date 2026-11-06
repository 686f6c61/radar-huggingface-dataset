# Reaper8202/ehr-forecast

## Resumen
ehr-forecast es un sistema de predicción sanitaria desarrollado por el usuario Reaper8202 como parte de una prueba técnica de investigación. Estima, para cada uno de 40 condiciones clínicas objetivo, la probabilidad de que un paciente reciba un primer diagnóstico en los cinco años posteriores a una fecha ancla, a partir de sus eventos previos en las tablas CSV del dataset sintético Synthea Coherent. No se trata de un modelo único, sino de un ensamblado de tres componentes: quince transformadores decoder-only pequeños, dos clasificadores LightGBM sobre recuentos de códigos y una calibración Platt por objetivo.

El sistema es relevante como referencia metodológica más que como herramienta clínica: demuestra cómo combinar modelos secuenciales ligeros con gradient boosting tabular y calibración para predicción multi-etiqueta sobre historiales de salud electrónicos (EHR), todo entrenado desde cero sin pesos preentrenados ni datos externos. Su escala es deliberadamente modesta (unos 738.000 parámetros por transformador) y está pensado para ejecutarse en CPU en menos de un minuto.

La licencia es MIT y los datos de entrenamiento son sintéticos (Synthea, MITRE), lo que elimina problemas de privacidad pero limita la validez clínica de los resultados. El modelo solo soporta inglés y no es una herramienta clínica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensamblado: 15 transformadores decoder-only (2 capas, ancho 128) + 2 conjuntos de 40 clasificadores LightGBM + calibración Platt por objetivo |
| Parametros totales | Aproximadamente 738.000 por transformador (15 transformadores: 3 semillas x 5 folds); LightGBM: 4 hojas y 100 árboles por objetivo |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (secuencias de eventos pre-ancla; longitud máxima no especificada) |
| Tipos de cuantizacion | No disponible (pesos en PyTorch `best.pt`; no se documentan cuantizaciones) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `.pt` (PyTorch) para transformadores; `.txt` para boosters LightGBM; `tokenizer.json`; `platt_weights.json`; `feature_spec.json` |

## Arquitectura y entrenamiento
El componente principal son quince transformadores decoder-only pequeños (2 capas, anchura 128, unos 738.000 parámetros cada uno), organizados en tres semillas aleatorias con cinco folds de validación cruzada cada una. Se preentrenan de forma auto-supervisada sobre secuencias de eventos pre-ancla y se ajustan completamente sobre las 40 etiquetas; sus probabilidades se promedian. A esto se añaden dos familias de LightGBM: una sobre logaritmos de recuentos de códigos, edad y sexo, y otra que incorpora además el último valor numérico pre-ancla de cada observación. Las tres ramas se combinan mediante la media de sus logits, se escalan con una regresión logística Platt ajustada por objetivo sobre predicciones out-of-fold de entrenamiento y se anulan las celdas de condiciones que el paciente ya padece.

Todo el entrenamiento parte de pesos aleatorios y solo usa el split de entrenamiento del dataset de la prueba, derivado del Coherent Synthetic Data Set de Synthea (MITRE). No se emplearon datos externos, pesos preentrenados ni coeficientes clínicos. La selección del ensamblado y de la calibración se fijó mediante reglas escritas antes de conocer sus puntuaciones (`configs/budget_v3.toml`). Se incluyen tokens de genotipo y un token de resonancia magnética cerebral cuando los ficheros existen, aunque en validación cruzada los tokens de modalidad no mostraron efecto medible.

## Capacidades
- Predicción multi-etiqueta de primer diagnóstico para 40 condiciones en un horizonte de cinco años.
- Procesamiento de historiales de eventos EHR: secuencias de códigos, valores numéricos de observaciones, edad y sexo.
- Integración opcional de tokens de genotipo y de imagen (resonancia magnética cerebral) cuando los ficheros están disponibles.
- Enmascaramiento de condiciones ya presentes en el paciente (regla de prior-mask) para evitar predicciones triviales.
- Calibración probabilística por objetivo mediante escalado Platt.
- Verificación reproducible del paquete: comprobación de hashes y reconstrucción de predicciones con tolerancia 1e-6.
- No soporta tool calling, agentes, visión general ni modo de razonamiento; no es un modelo generativo de texto.

## Casos de uso
- Investigación metodológica en predicción EHR: sirve como línea base reproducible para comparar ensamblados de transformadores ligeros con gradient boosting en tareas de pronóstico multi-etiqueta sobre datos sintéticos.
- Prototipado de pipelines de riesgo poblacional: permite construir un flujo completo (tokenización de eventos, extracción de features tabulares, calibración) sobre Synthea antes de trasladarlo a datos reales con las debidas garantías.
- Docencia y formación: el paquete incluye tokenizadores, configuraciones congeladas, registro de decisiones y resultados por condición, lo que facilita explicar el diseño experimental y la validación cruzada anidada.
- Evaluación de calibración: el escalado Platt por objetivo y las métricas AUROC/mAP con intervalos bootstrap BCa al 95% permiten estudiar cómo calibra un ensamblado en etiquetas raras.
- Reproducibilidad de pruebas técnicas: el comando `verify` reconstruye las predicciones desde el paquete solo con CPU en menos de un minuto, útil para auditar envíos o comparar implementaciones.
- Análisis de ablación de modalidades: permite medir el efecto (nulo en CV según la model card) de añadir tokens de genómica e imagen a un modelo de historial, como ejercicio de ingeniería de features.
- Simulación de cohortes sintéticas: al operar sobre Synthea, se puede usar para generar y evaluar escenarios de pacientes sin exponer datos reales.

## Benchmarks y rendimiento
Split de validación oficial (365 pacientes), puntuado por el paquete congelado, con intervalos bootstrap BCa al 95% por paciente:

| Modelo | Macro AUROC | mAP |
|---|---|---|
| Ensamblado enviado | 0,767 [0,746; 0,788] | 0,258 [0,234; 0,268] |
| Solo ensamblado de transformadores | 0,751 | 0,209 |
| Solo LightGBM sobre recuentos de códigos | 0,762 | 0,239 |
| Tabla de incidencia por edad y sexo (referencia, pacientes en riesgo) | 0,727 | 0,141 |

Validación cruzada anidada de cinco folds sobre el split de entrenamiento, agrupada out-of-fold y antes del escalado Platt: ensamblado AUROC 0,774 y mAP 0,212; ensamblado de transformadores 0,761 / 0,181; LightGBM sobre recuentos 0,764 / 0,188. Las etiquetas de test las retienen los organizadores.

## Requisitos de hardware
- Inferencia en CPU: el comando `verify` se ejecuta en CPU en menos de un minuto para el conjunto de validación.
- VRAM estimada: no disponible; por el tamaño (menos de 1 M de parámetros por transformador y boosters de 100 árboles), cabe holgadamente en cualquier GPU consumer e incluso en memoria de sistema.
- GPU recomendadas: no se especifican; cualquier GPU con PyTorch es suficiente, aunque no es necesaria.
- Cabe en GPU consumer: sí, en cualquier modelo actual (RTX 3060, RTX 4090, etc.), y también en CPU.
- Opciones de despliegue: el paquete oficial usa PyTorch y LightGBM mediante el módulo `ehrforecast.hf_package`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles de forma agregada; la referencia es la verificación completa en CPU por debajo de un minuto.

## Comparativa con modelos similares
No se han publicado comparativas con otros modelos en la información disponible. Como referencias internas del propio trabajo, la model card incluye el ensamblado de transformadores solo (0,751 AUROC / 0,209 mAP) y el LightGBM sobre recuentos solo (0,762 / 0,239) frente al ensamblado final (0,767 / 0,258), además de una tabla de incidencia por edad y sexo (0,727 / 0,141). No se dispone de datos de modelos externos comparables de la misma categoría.

## Limitaciones y advertencias
- Los datos son sintéticos (Synthea); los resultados no son extrapolables a población clínica real y el modelo no es una herramienta clínica.
- Las anclas se fijan cinco años antes de la última visita de cada paciente, de modo que un ancla temprana suele implicar fallecimiento, algo que cualquier modelo de historial puede leer; esto puede inflar el rendimiento.
- Nueve de las 40 condiciones objetivo (lesiones agudas e infecciones) están cerca del azar para el ensamblado, y cinco de ellas lo están para todos los modelos probados.
- La copia de genómica usada estaba incompleta (400 ficheros); en esa copia, disponer de fichero de genotipo correlaciona con los desenlaces, aunque los tokens de modalidad no mostraron efecto medible en validación cruzada.
- Para reproducir con una descarga completa hay que restringir la carpeta de genómica a los ficheros listados en `reports/dataset/modality_files.json`.
- Solo inglés; no se documentan sesgos demográficos específicos más allá de la naturaleza sintética de los datos.
- Licencia MIT, que permite uso comercial, pero la ausencia de validación clínica desaconseja cualquier uso en producción sanitaria.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de predicciones mal calibradas en subgrupos no representados en el split de entrenamiento.

## Enlaces
- Hugging Face: https://huggingface.co/Reaper8202/ehr-forecast
- Repositorio del proyecto: https://github.com/Reaper8202/Research_Intern_Coding_Test
- Dataset de origen (Synthea Coherent, MITRE): no se proporciona URL directa en la información disponible.
