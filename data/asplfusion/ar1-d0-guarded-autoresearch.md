# asplfusion/ar1-d0-guarded-autoresearch

## Resumen

AR-1 day 0 es un emulador aprendido para el conjunto de datos Linear Radiation Transport de NVIDIA, publicado por ASPL Fusion (Agnira Sanlayan Private Limited, Nueva Delhi). No es un modelo de lenguaje ni una red neuronal profunda: es un programa de entrenamiento basado en scikit-learn que ajusta un regresor tabular sobre datos de transporte radiativo lineal, prediciendo la absorción integrada de muestras de retículo o hohlraum con un intervalo del 90%. El repositorio no almacena pesos; el modelo se reajusta desde cero a partir de los datos preparados en cuestión de segundos.

El interés del artefacto no reside en su rendimiento bruto, sino en su metodología: documenta un bucle de "autoresearch" guardado en el que un agente de IA (gpt-6.1-sol) escribió y envió 40 versiones del programa de entrenamiento en 28 minutos, de las cuales el runner puntuó 39, rechazó una y conservó nueve. La ficha técnica y la traza de auditoría acompañan al código, con el objetivo declarado de acortar la puesta en marcha de fuentes de neutrones impulsadas por acelerador mediante emuladores conectados.

Se trata de un lanzamiento deliberadamente pequeño y de alcance limitado: dos familias de un único conjunto de datos público, validación en distribución y cobertura de intervalos observada, no garantizada. Su relevancia es fundamentalmente metodológica y de reproducibilidad, no de aplicación general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresor tabular sobre scikit-learn (no es una red neuronal; detalles del estimador no especificados en la información disponible) |
| Parametros totales | no disponible (no se almacenan pesos; el modelo se reajusta desde los datos) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (regresión tabular, no modelo de secuencia) |
| Tipos de cuantizacion | no disponible (no procede para scikit-learn) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 para el código; CC BY 4.0 para la nota y resultados derivados; datos de entrenamiento CC BY 4.0 |
| Formato de pesos | no disponible (no hay pesos almacenados; solo código de entrenamiento `train.py`) |

## Arquitectura y entrenamiento

El modelo es un emulador aprendido de regresión tabular construido con scikit-learn. Toma los parámetros de diseño de una muestra de retículo o hohlraum y predice la absorción integrada junto con un intervalo del 90%. Utiliza coeficientes de retículo transformados logarítmicamente y marca entradas fuera de los límites de entrenamiento de cada familia más un margen de rango del 1,5% (mínimo 1e-8). No se especifica en la información disponible el estimador exacto empleado (por ejemplo, si es un proceso gaussiano, un modelo de árboles o una combinación), más allá de que se compara contra un proceso gaussiano ajustado, ridge sobre características polinómicas y árboles potenciados cuantílicos.

Los datos de entrenamiento provienen del conjunto Linear Radiation Transport de NVIDIA, revisión `62af8a73`, con licencia CC BY 4.0. El proceso de producción es un bucle de optimización guardado en el que un agente de IA (gpt-6.1-sol) escribió y envió cada versión del programa de entrenamiento bajo la dirección de Abhinav Jha. El runner puntuó 39 de 40 envíos, rechazó uno y conservó nueve. La selección se guió por validación, con tres semillas (17, 29 y 43) que varían la partición ajuste/calibración. La regla de conservación es un margen heurístico, no una prueba de significación estadística. El código de comparación (baseline y ajuste de modelos rivales) no se incluye en el lanzamiento.

## Capacidades

- Predicción de absorción integrada en muestras de retículo y hohlraum a partir de parámetros de diseño.
- Estimación de intervalos de confianza al 90% sobre la predicción.
- Detección de entradas fuera de distribución: marca valores fuera de los límites de entrenamiento de cada familia más un margen del 1,5% (mínimo 1e-8).
- Transformación logarítmica de coeficientes de retículo para estabilizar la regresión.
- Reajuste rápido desde los datos preparados (segundos), sin necesidad de almacenar ni descargar pesos.
- Reproducibilidad completa: scripts de extracción, preparación, verificación, entrenamiento y puntuación incluidos.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto; es exclusivamente regresión tabular.

## Casos de uso

- Emulación rápida de transporte radiativo en diseño de retículos: sustituir simulaciones costosas por una predicción instantánea con intervalo de confianza durante la exploración de parámetros de diseño, gracias al reajuste en segundos.
- Filtrado de candidatos en pipelines de diseño de hohlraums: usar la marca de fuera de distribución para descartar configuraciones alejadas del dominio de entrenamiento antes de lanzar simulaciones completas.
- Verificación de reproducibilidad en investigación automatizada: servir como caso de estudio de un bucle de autoresearch guardado, con traza de auditoría y reglas de conservación verificables por terceros.
- Docencia y formación en metodología de IA para ciencia: ilustrar cómo un agente de IA puede escribir código de entrenamiento bajo restricciones auditables y cómo se puntúa contra baselines ajustados.
- Integración en cadenas de emuladores de fuentes de neutrones: como primer eslabón de un modelo conectado de la cadena fuente-aplicación que ASPL Fusion declara estar construyendo.
- Benchmark de comparación de regresores tabulares: el repositorio incluye resultados contra proceso gaussiano, ridge polinómico y árboles cuantílicos, útil para evaluar métodos en el conjunto Linear Radiation Transport.
- Auditoría de procesos de IA generativa en ciencia: el historial de envíos y la nota técnica permiten estudiar el comportamiento de un agente de codificación bajo un runner con reglas de aceptación.

## Benchmarks y rendimiento

Error absoluto logarítmico del percentil 90 sobre celdas objetivo resueltas, media sobre las semillas 17, 29 y 43. Menor es mejor.

| Modelo | Validación | Test público |
|---|---:|---:|
| Modelo final del bucle (`train.py`, fila 197 del registro) | 0,00232 | 0,00224 |
| Proceso gaussiano ajustado | 0,00343 | 0,00308 |
| Ridge sobre características polinómicas ajustado | 0,0170 | 0,0177 |
| Árboles potenciados cuantílicos ajustados | 0,0235 | 0,0259 |
| Mediana de entrenamiento (`baseline_median_train.py`, programa inicial) | 0,452 | 0,457 |

En el test público, el error del proceso gaussiano ajustado es 1,37 veces el del modelo final, es decir, el error del modelo final es aproximadamente un 27% menor. En validación la ratio es 1,48, pero el bucle seleccionó sobre validación. Las ratios usan puntuaciones sin redondear. Los modelos de comparación se ajustaron dentro de rangos fijados de antemano, solo sobre filas de entrenamiento. El test público se puntuó una única vez para cada modelo y queda consumido para este modelo.

## Requisitos de hardware

- No requiere GPU: es un regresor scikit-learn que se ejecuta en CPU.
- Dependencias: Python 3 con NumPy, SciPy y scikit-learn, más la CLI de Hugging Face (`hf`).
- Espacio en disco: la descarga del conjunto de datos ocupa unos 1,7 GB y las mallas extraídas unos 7,2 GB; se recomiendan al menos 13 GiB libres.
- Memoria RAM: no especificada en la información disponible; depende del tamaño de las mallas extraídas y del estimador concreto.
- Tiempo de entrenamiento: segundos por ajuste, según la model card.
- Despliegue: ejecución directa de scripts Python (`extract_d0.py`, `prepare_d0.py`, `verify_prepared.py`, `train.py`, `score_d0.py`); no aplican vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles de forma explícita; el ajuste se describe como de segundos.

## Comparativa con modelos similares

| Modelo | Tipo | Error test público (p90 log) | Licencia | Pesos almacenados |
|---|---|---:|---|---|
| AR-1 day 0 (este) | Emulador tabular scikit-learn | 0,00224 | Apache-2.0 (código) | No |
| Proceso gaussiano ajustado | Regresor tabular | 0,00308 | no disponible | No (reajuste) |
| Ridge polinómico ajustado | Regresor lineal | 0,0177 | no disponible | No (reajuste) |
| Árboles potenciados cuantílicos ajustados | Regresor de árboles | 0,0259 | no disponible | No (reajuste) |
| Mediana de entrenamiento (baseline) | Baseline trivial | 0,457 | no disponible | No |

No se dispone de comparación con emuladores de transporte radiativo de otros autores en la información proporcionada.

## Limitaciones y advertencias

- Solo en distribución: cubre dos familias de un único conjunto de datos público; no generaliza fuera de ese dominio.
- La selección se guió por validación, por lo que la puntuación de validación no es independiente.
- El test público se puntuó una vez y queda consumido para este modelo; no debe volver a puntuarse.
- La comprobación del test público usó una carpeta que también contenía las etiquetas de test; el código congelado no las leyó, pero el aislamiento fue solo detección bajo la cuenta del fundador, no prevención de acceso. La transcripción posterior no mostró accesos más allá del envío, pero no puede excluirse un acceso oculto.
- Solo tres semillas, que varían la partición ajuste/calibración; la regla de conservación es un margen heurístico, no una prueba de significación.
- La cobertura del intervalo es un resultado observado en este benchmark, no una garantía.
- El lanzamiento no incluye el runner original ni la implementación de ajuste de baselines, solo los ajustes y puntuaciones registrados.
- Licencia: Apache-2.0 para el código; CC BY 4.0 para la nota y resultados derivados; los datos de NVIDIA son CC BY 4.0 con atribución requerida.
- Riesgo de alucinación no aplica (no es un modelo generativo); el riesgo relevante es de extrapolación silenciosa fuera del dominio, mitigado solo parcialmente por la marca de fuera de distribución.
- No apto para uso comercial directo como producto de predicción sin validación contra medición en el dominio objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/asplfusion/ar1-d0-guarded-autoresearch
- Conjunto de datos NVIDIA Linear Radiation Transport: https://huggingface.co/datasets/nvidia/Linear-Radiation-Transport
- Nota técnica (DOI): https://doi.org/10.5281/zenodo.24557382
- Artículo arXiv referenciado: https://arxiv.org/abs/2505.17284
- Nota del fundador de ASPL Fusion: https://asplfusion.com/insights/a-world-model-of-a-neutron-source.html
- Contacto del autor: info@asplfusion.com
