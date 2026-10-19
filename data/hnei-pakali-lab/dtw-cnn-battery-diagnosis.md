# HNEI-PakaLi-Lab/dtw-cnn-battery-diagnosis

## Resumen

`dtw-cnn-battery-diagnosis` es un repositorio de tres checkpoints supervisados desarrollados por HNEI-PakaLi-Lab para diagnosticar modos de degradación en baterías de ion-litio. Cada checkpoint corresponde a una química —LFP, NCA o NMC— y predice tres componentes: `lli`, `lampe` y `lamne`. No es un modelo fundacional, generativo ni un encoder auto-supervisado; es un modelo de regresión tabular aplicado a imágenes DTW de curvas de capacidad incremental.

El modelo parte de curvas de carga lenta, coherentes con el protocolo C/25, y coordenadas de capacidad normalizada. Con ellas construye una imagen DTW de 128 × 128 contra una referencia prístina y aplica una CNN. Está vinculado al artículo de Costa, Sánchez, Anseán y Dubarry en *Journal of Energy Storage* 55 (2022), 105558. El repositorio ocupa 0,1 GB y conserva los bytes HDF5 originales, sin reentrenamiento sobre los splits actuales de Hugging Face.

Su relevancia es práctica: permite reproducir un diagnóstico no invasivo de degradación con checkpoints ya entrenados, pero exige un preprocesado muy específico por química y configuración —C0, C1, C2 o C3— y no debe confundirse con un modelo de lenguaje ni con un pipeline de inferencia alojado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CNN supervisada sobre imágenes DTW de 128 × 128 × 1 derivadas de curvas de capacidad incremental; implementación TensorFlow/Keras |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica; no es un modelo MoE |
| Longitud de contexto | no aplica; entrada fija de 128 × 128 píxeles monocanal, no es un modelo de lenguaje |
| Tipos de cuantización | no disponible; se distribuyen checkpoints HDF5 originales sin variantes cuantizadas |
| Idiomas soportados | no aplica; no procesa texto |
| Licencia | no disponible |
| Formato de pesos | HDF5 (`.h5`) de TensorFlow/Keras; no safetensors ni GGUF |
| Pipeline | `tabular-regression` |
| Químicas soportadas | LFP, NCA y NMC; un checkpoint por química |
| Entrada | Curva de voltaje de carga lenta en voltios y coordenadas `qnorm` de capacidad normalizada en porcentaje; imagen DTW de 128 × 128 × 1 |
| Salidas | `lli`, `lampe` y `lamne`, en ese orden; el helper devuelve porcentajes y los modelos guardados predicen fracciones |
| Rejilla de voltaje | LFP 3,20–3,50 V; NCA 3,20–4,23 V; NMC 3,44–4,28 V; inicio incluido y fin excluido |
| Dataset asociado | `HNEI-PakaLi-Lab/synthetic-battery-diagnosis` |

## Arquitectura y entrenamiento

La información disponible no detalla el número de capas, canales ni parámetros de la CNN. Sí describe el pipeline de inferencia: interpolación de la capacidad normalizada sobre una rejilla de voltaje específica de cada química con paso de 0,5 mV; cálculo de incrementos de capacidad mediante `np.diff`, que son ΔQ y no ΔQ/ΔV; reducción a 127 puntos con interpolación PCHIP; aplicación de un escalado IC fijo por química; y cálculo de la matriz acumulada del camino de warping contra una referencia prístina para C0, C1, C2 o C3, con ventana 64 y `psi=2`, enmascarado de celdas no rellenas a cero y escalado por un único máximo del grupo completo.

Los checkpoints son los modelos originales del artículo y no han sido reentrenados con los splits actuales de Hugging Face. No hay información sobre número de tokens, composición del dataset de entrenamiento, RLHF o DPO; esos conceptos no aplican a este modelo. La model card indica explícitamente que se trata de modelos de diagnóstico supervisados, no de modelos fundacionales ni de encoders auto-supervisados.

## Capacidades

- Regresión supervisada de tres modos de degradación: `lli`, `lampe` y `lamne`, en ese orden.
- Diagnóstico específico por química mediante tres checkpoints separados: LFP, NCA y NMC.
- Procesamiento de curvas de carga lenta y coordenadas de capacidad normalizada, con preprocesado reproducible basado en DTW.
- Generación de imágenes DTW de 128 × 128 × 1 contra referencias prístinas C0, C1, C2 o C3.
- Inferencia por lotes con `batch_size` configurable, por ejemplo 32 para la predicción neuronal.
- Salida en porcentajes a través del helper, aunque los modelos guardados predicen fracciones.
- No soporta tool calling, function calling, agentes, multi-step reasoning, generación de texto, código, matemáticas, visión general, audio ni capacidades multilingües.
- No produce salida `qloss`; las predicciones no se recortan.

## Casos de uso

- Diagnóstico post-mortem de celdas de laboratorio: cargar todas las curvas de una misma configuración de test, preparar las imágenes DTW con una única escala compartida y predecir `lli`, `lampe` y `lamne` para comparar celdas envejecidas frente a referencias prístinas.
- Cuantificación de modos de degradación en campañas de envejecimiento: usar C1, C2 o C3 para separar condiciones de test y analizar qué modo domina en cada lote; el modelo es adecuado porque las referencias y el escalado están definidos por configuración.
- Control de calidad en formación o carga lenta: si el proceso permite curvas C/25, usar el checkpoint de la química correspondiente para detectar desviaciones de `lampe` o `lamne` en celdas recién fabricadas; no está validado para cargas rápidas arbitrarias.
- Validación de simuladores y datasets sintéticos: comparar curvas sintéticas con las predicciones del modelo frente a las etiquetas de `synthetic-battery-diagnosis`, verificando que la firma IC/DTW es coherente.
- Reproducibilidad de resultados publicados: ejecutar los HDF5 originales con Python 3.12, TensorFlow 2.21 y Keras 3.15 para replicar la inferencia del artículo sin reentrenar.
- Estudios comparativos por química: evaluar por separado LFP, NCA y NMC, sin mezclar dominios, para comparar los tres checkpoints en condiciones equivalentes.
- Investigación de envejecimiento en packs o BESS: usar curvas de carga controlada de celdas extraídas para estimar modos de degradación y priorizar celdas para análisis destructivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay cifras de MAE, RMSE, R² ni comparaciones de rendimiento frente a otros modelos. La model card sí documenta comprobaciones de reproducibilidad, pero no métricas de precisión.

| Comprobación | Resultado |
|---|---|
| MMLU, HumanEval, GSM8K | no aplica; no es un modelo de lenguaje |
| MAE, RMSE o R² de `lli`, `lampe` y `lamne` | no publicados en la información disponible |
| Validación de datos de test | 54.000 curvas de voltaje, coordenadas de capacidad y cuatro columnas de etiquetas coinciden con los datos MATLAB originales, incluidas las posiciones NaN; todas generan una entrada IC finita de 127 puntos |
| Comprobación de predicciones | 64 registros por química y configuración de test, 576 registros en total; la model card añade 64 registros de train por química y la información disponible se interrumpe en ese punto |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No se publican requisitos de memoria de GPU ni variantes cuantizadas.
- GPU recomendadas: no disponibles. No se indica compatibilidad con A100, H100, RTX 4090 ni otras GPU concretas.
- GPU consumer: no confirmado. El repositorio ocupa 0,1 GB y la entrada es de 128 × 128 × 1, pero no hay cifras oficiales que permitan garantizar que quepa en una GPU consumer concreta.
- CPU: no documentado. No hay datos de latencia ni de throughput en CPU.
- Despliegue: Python 3.12, TensorFlow 2.21.0, Keras 3.15.1, `requirements.txt` y `datasets==5.1.0`; helper `battery_diagnosis.py`; carga directa de HDF5 sin conversión ni reentrenamiento.
- No aplican vLLM, llama.cpp, Ollama ni TGI; tampoco es un `AutoModel` de Transformers ni un pipeline de inferencia alojado.
- Memoria RAM: la preparación de imágenes puede requerir varios GB para 6.000 curvas. Para procesar por trozos con la misma escala DTW hay que calcular primero el máximo del grupo completo.
- Latencia y throughput: no disponibles. Cambiar el `batch_size` de predicción después de preparar las imágenes no modifica la normalización DTW.

## Comparativa con modelos similares

| Checkpoint | Química | Entrada | Salidas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `weights/LFP/model-DTWCNN.h5` | LFP | 128 × 128 × 1 | `lli`, `lampe`, `lamne` | no disponible | Hugging Face |
| `weights/NCA/model-DTWCNN.h5` | NCA | 128 × 128 × 1 | `lli`, `lampe`, `lamne` | no disponible | Hugging Face |
| `weights/NMC/model-DTWCNN.h5` | NMC | 128 × 128 × 1 | `lli`, `lampe`, `lamne` | no disponible | Hugging Face |

No se identifican modelos alternativos comparables con especificaciones verificables en la información proporcionada. La comparación con otros modelos de diagnóstico de baterías queda como no disponible.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, código ni respuestas; no tiene tool calling, agentes, razonamiento multi-paso ni capacidades multimodales generales.
- Dependencia fuerte del preprocesado: rejilla de voltaje por química, paso de 0,5 mV, ΔQ, PCHIP a 127 puntos, escalado IC y DTW con ventana 64 y `psi=2`.
- Protocolo de carga lenta C/25: no está validado para curvas de carga rápida, perfiles dinámicos u operación real fuera de las condiciones del estudio.
- Normalización DTW por grupo: las predicciones pueden cambiar si cambia el conjunto de curvas. Preparar una curva aislada no reproduce el preprocesado de una configuración de test completa. No se deben mezclar configuraciones ni químicas en el mismo grupo.
- `qnorm` no es capacidad medida en Ah. No hay salida `qloss` y las predicciones no se recortan.
- El helper no ordena, recorta, imputa ni elimina NaN. Un resultado IC no finito lanza un error antes de la inferencia; un resultado finito con NaN no garantiza que la curva sea adecuada.
- Las referencias suministradas cubren C0, C1, C2 y C3. Otras configuraciones de celda requieren referencias propias que no se incluyen.
- Los checkpoints originales no han sido reentrenados con los splits actuales de Hugging Face; un nuevo benchmark train/test requiere un entrenamiento fresco.
- Licencia no disponible: no se puede confirmar el uso comercial ni las condiciones de redistribución.
- Sesgo de dominio: datos sintéticos y de laboratorio, tres químicas y protocolos concretos; la extrapolación a otras celdas, temperaturas, regímenes o configuraciones no está validada.
- Riesgo de predicciones fuera de rango en entradas fuera de dominio; al no recortar la salida, pueden aparecer porcentajes no físicos.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/HNEI-PakaLi-Lab/dtw-cnn-battery-diagnosis)
- [Dataset synthetic-battery-diagnosis](https://huggingface.co/datasets/HNEI-PakaLi-Lab/synthetic-battery-diagnosis)
- [PakaLi Battery Laboratory, Hawaiʻi Natural Energy Institute](https://www.hnei.hawaii.edu/facilities/pakali-battery-lab/)
- [Nota de HNEI sobre datasets sintéticos para diagnóstico de baterías](https://www.hnei.hawaii.edu/hnei-researcher-publishes-1st-ever-synthetic-training-datasets-for-ai-diagnosis-of-li-ion-batteries/)
- Artículo: N. Costa, L. Sánchez, D. Anseán y M. Dubarry, «Li-ion battery degradation modes diagnosis via Convolutional Neural Networks», *Journal of Energy Storage* 55 (2022), 105558; sin URL en la información disponible.
