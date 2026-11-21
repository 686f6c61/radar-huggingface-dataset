# allenai/ACE2.5-ERA5

## Resumen

ACE2.5-ERA5 es un emulador climático desarrollado por el Allen Institute for AI (Ai2) dentro de la familia Ai2 Climate Emulator (ACE). Se trata de un modelo generativo estocástico entrenado sobre el reanálisis ERA5 que simula la variabilidad atmosférica desde escalas de días hasta siglos, reproduciendo la dinámica del sistema climático a una fracción del coste computacional de los modelos climáticos tradicionales. Es el sucesor de ACE2-ERA5 y se distribuye bajo licencia Apache 2.0.

El modelo emplea una arquitectura de tipo red neuronal convolucional espectral con un cuello de botella espectral que reduce el número de parámetros de 456M (ACE2-ERA5) a 46M, manteniendo la habilidad climática y multiplicando por 3,2 la velocidad de inferencia. La componente estocástica se implementa mediante una capa de normalización condicionada por ruido, entrenada con CRPS y una función de energía espectral, lo que produce ensembles calibrados con una dispersión que se ajusta al error dentro del 4% a partir del día 3.

Se liberan tres checkpoints entrenados sobre ERA5: el modelo principal a 1° de resolución y paso diario (46M parámetros), una variante a 4° (14M parámetros, 5× más rápida) y una variante a 1° con paso de 6 horas (46M parámetros). Es relevante para la comunidad de ciencias del clima porque permite generar ensembles probabilísticos realistas de bajo coste, aunque el propio autor advierte que es una herramienta de investigación y no debe usarse para predicciones climáticas operativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal convolucional espectral con cuello de botella espectral y normalización condicionada por ruido (modelo estocástico) |
| Parametros totales | 46M (modelo principal 1° diario); 14M (variante 4° diario); 46M (variante 1° 6-horario) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica; el modelo opera sobre condiciones iniciales y forzamientos, no sobre secuencias de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.tar` (checkpoints empaquetados para la librería `fme`) |

## Arquitectura y entrenamiento

ACE2.5-ERA5 es un emulador climático estocástico basado en una arquitectura convolucional espectral con un cuello de botella espectral que comprime la representación interna y reduce el recuento de parámetros de 456M a 46M respecto a ACE2-ERA5. La estocasticidad se incorpora mediante una capa de normalización condicionada por ruido, y el entrenamiento utiliza la Continuous Ranked Probability Score (CRPS) junto con una función de energía espectral para producir ensembles calibrados. El modelo opera sobre condiciones iniciales y forzamientos (SST, CO2) y genera predicciones atmosféricas con estructura de pequeña escala realista.

El entrenamiento se realizó sobre el reanálisis ERA5, en versiones remuestreadas a 1° y 4° de resolución, con pasos temporales diario y de 6 horas, cubriendo el periodo 1940–2025. Los datos de entrenamiento, estadísticas de normalización y forzamientos climatológicos están disponibles en el bucket de Hugging Face `allenai/ACE2.5-ERA5-reference-data`, generados a partir de los conjuntos ERA5 alojados por Google Research (ARCO-ERA5) y NCAR. Se liberan los checkpoints de la semilla 0 para cada configuración, además de las semillas 1–3 para los modelos de 1° diario y 4° diario, y un directorio de ablaciones para reproducibilidad de las figuras del artículo.

## Capacidades

- Simulación de variabilidad atmosférica desde escalas diarias hasta centenarias.
- Generación de ensembles estocásticos calibrados (la dispersión se ajusta al error dentro del 4% a partir del día 3).
- Predicción probabilística de campos atmosféricos con estructura de pequeña escala realista (retención del 86% de la potencia espectral de ERA5 en números de onda 100–179).
- Respuesta precisa al calentamiento atmosférico ante forzamiento combinado de SST y CO2 durante 1940–2020.
- Respuesta atmosférica a la variabilidad de El Niño mejorada respecto a ACE2-ERA5.
- Distribución geográfica realista de ciclones tropicales (modelo de 6 horas).
- Variabilidad realista de la Oscilación de Madden-Julian.
- Vórtice polar estratosférico realista.
- Conservación exacta de la masa global de aire seco y humedad.
- Habilidad de predicción meteorológica a corto plazo competitiva (modelo de 6 horas).
- No soporta tool calling, agentes ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Investigación en atribución climática: el modelo permite generar ensembles de simulaciones con forzamientos de SST y CO2 modificados para estudiar la respuesta atmosférica, gracias a su bajo coste computacional (3,2× más rápido que ACE2-ERA5) y a la calibración de su dispersión.
- Generación de ensembles probabilísticos a escala climática: con 46M parámetros y paso diario, se pueden producir grandes ensembles en paralelo para estimar incertidumbre en proyecciones de variabilidad atmosférica sin el coste de un modelo climático completo.
- Estudio de la variabilidad tropical: la variante de 6 horas reproduce de forma realista la Oscilación de Madden-Julian y la distribución de ciclones tropicales, lo que la hace adecuada para analizar teleconexiones tropicales y eventos extremos.
- Análisis de precipitación a pequeña escala: la retención del 86% de la potencia espectral en números de onda 100–179 permite estudiar estructura espacial de precipitación que ACE2-ERA5 no resolvía (solo retenía el 36%).
- Docencia y divulgación en ciencias del clima: al ser un modelo ligero (14M–46M parámetros) con código abierto y documentación, se puede ejecutar en entornos académicos para ilustrar dinámica atmosférica y métodos de emulación.
- Reproducibilidad de investigación: los checkpoints de ablaciones y las semillas 1–3 permiten reproducir las figuras del artículo y validar resultados de forma independiente.
- Exploración de escenarios de forzamiento: aunque el autor advierte que no generaliza bien ante perturbaciones grandes (p. ej. duplicación de CO2), el modelo es útil para explorar perturbaciones moderadas de SST y CO2 dentro del rango de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos en la información disponible. La model card reporta métricas relativas cualitativas: retención del 86% de la potencia espectral de ERA5 en números de onda 100–179 (frente al 36% de ACE2-ERA5), dispersión del ensemble que coincide con el error dentro del 4% a partir del día 3, reducción de parámetros de 456M a 46M (10× menor) y aceleración de inferencia de 3,2×. No se proporcionan valores absolutos de RMSE, CRPS ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 46M parámetros, el peso en precisión completa sería de aproximadamente 184 MB (fp32) o 92 MB (fp16), pero el consumo real depende de la resolución espacial, el tamaño del ensemble y la implementación.
- GPU recomendadas: no disponible. Dado el reducido tamaño del modelo (14M–46M parámetros), es probable que quepa en GPUs de consumo, pero no se confirma en la información disponible.
- ¿Cabe en GPU de consumo? no disponible de forma explícita; el tamaño de parámetros sugiere que sí, pero no se aportan datos de memoria real.
- Opciones de despliegue: la inferencia se ejecuta con la librería `fme` mediante `python -m fme.ace.inference <config.yaml>`, tras `pip install fme`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput estimados: no se proporcionan valores absolutos; solo se indica que el modelo principal es 3,2× más rápido que ACE2-ERA5 y que la variante de 4° tiene 5× más throughput y 10× menor coste de entrenamiento.

## Comparativa con modelos similares

| Modelo | Parámetros | Resolución / paso | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ACE2.5-ERA5 (1° diario) | 46M | 1° / diario | no aplica | Apache 2.0 | Hugging Face (allenai) |
| ACE2.5-ERA5 (4° diario) | 14M | 4° / diario | no aplica | Apache 2.0 | Hugging Face (allenai) |
| ACE2.5-ERA5 (1° 6-horario) | 46M | 1° / 6 h | no aplica | Apache 2.0 | Hugging Face (allenai) |
| ACE2-ERA5 (predecesor) | 456M | 1° / no disponible | no aplica | no disponible en la información | Hugging Face (allenai) |

No se dispone de datos numéricos de rendimiento para establecer una comparativa cuantitativa con otros emuladores climáticos (p. ej. FourCastNet, GraphCast, NeuralGCM) en la información proporcionada. La comparación con ACE2-ERA5 se limita a las métricas relativas reportadas por el autor: 10× menos parámetros, 3,2× más rápido, mejor retención espectral de precipitación y ensembles calibrados.

## Limitaciones y advertencias

- El autor advierte explícitamente que los modelos ACE son herramientas de investigación y no deben usarse para predicciones climáticas operativas.
- Las sensibilidades individuales a SST y CO2 no son del todo realistas, aunque la respuesta combinada sí lo es.
- La habilidad meteorológica a medio plazo del modelo diario es inferior a la de ACE2-ERA5 (el modelo de 6 horas sí la iguala).
- La variabilidad interanual de la temperatura media global de superficie no está calibrada.
- No se espera que generalice con precisión ante perturbaciones grandes, como una duplicación de CO2.
- No es un modelo de lenguaje: no soporta tool calling, agentes, multilingüismo ni generación de texto.
- No se dispone de información sobre sesgos, riesgo de alucinación (no aplica en el sentido habitual) ni restricciones adicionales de licencia más allá de Apache 2.0.
- El dataset de entrenamiento contiene información modificada del Copernicus Climate Change Service; ni la Comisión Europea ni ECMWF son responsables de su uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/allenai/ACE2.5-ERA5
- Modelo predecesor ACE2-ERA5: https://huggingface.co/allenai/ACE2-ERA5
- Datos de referencia de entrenamiento: https://huggingface.co/buckets/allenai/ACE2.5-ERA5-reference-data
- Repositorio de código: https://github.com/ai2cm/ace
- Repositorio de reproducción de figuras del artículo: https://github.com/ai2cm/ace2.5-era5-paper
- Documentación: https://ai2-climate-emulator.readthedocs.io/en/stable/
- Colección de todos los modelos ACE: https://huggingface.co/collections/allenai/ace-67327d822f0f0d8e0e5e6ca4
- ARCO-ERA5 (Google Research): https://github.com/google-research/arco-era5
- ERA5 en NCAR GDEX: https://gdex.ucar.edu/datasets/d633000/
