# OneScience-Group/ACE2

## Resumen

ACE2 es un modelo de emulación atmosférica global desarrollado por equipos del Allen Institute for AI, el Geophysical Fluid Dynamics Laboratory (GFDL) y colaboradores, y publicado en *npj Climate and Atmospheric Science* bajo el DOI 10.1038/s41612-025-01090-0. El modelo simula de forma autorregresiva la evolución del estado atmosférico global en intervalos de seis horas a partir de estados atmosféricos y forzamiento externo (por ejemplo, temperatura superficial del mar), con correcciones físicas duras que restringen los presupuestos de masa de aire seco y de humedad.

A diferencia de un modelo de lenguaje, ACE2 es un operador neuronal de Fourier esférico (SFNO) que aprende transiciones atmosféricas globales sobre una rejilla de un grado (180×360) con 50 canales de estado y ocho niveles verticales. El artículo entrena modelos separados sobre el reanálisis ERA5 y sobre simulaciones históricas del modelo SHiELD, y el objetivo declarado es cubrir desde escalas meteorológicas hasta estadísticas climáticas de largo plazo (subestacional a decadal).

El repositorio de HuggingFace `OneScience-Group/ACE2` no distribuye el checkpoint oficial, sino una reproducción de ingeniería independiente con datos sintéticos que replica la rejilla, los canales, los niveles y la cadencia temporal del artículo, reduciendo el número de muestras, la escala del modelo y las épocas. Es relevante ahora porque permite validar pipelines de entrenamiento, inferencia y evaluación de emuladores atmosféricos con correcciones físicas sin acceso al dataset completo, aunque sus resultados no equivalen al rendimiento publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Operador neuronal de Fourier esférico (SFNO) con correcciones físicas duras de masa de aire seco y presupuesto de humedad |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de emulación atmosférica; secuencia autorregresiva de pasos de 6 h) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (documentación y model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (checkpoint en `result/checkpoints/ace2.pt`; el checkpoint oficial no se incluye en el repositorio) |

Datos adicionales de estructura: rejilla global de un grado (180×360), 50 canales de estado, ocho niveles verticales, tensores de dimensión real `[N,T,50,180,360]` y transiciones autorregresivas de seis horas.

## Arquitectura y entrenamiento

ACE2 se basa en un operador neuronal de Fourier esférico que aprende transiciones del estado atmosférico global en la esfera, en lugar de una arquitectura transformer de propósito general. La inferencia es autorregresiva con paso de seis horas: el modelo recibe un estado atmosférico inicial más un forzamiento externo variable en el tiempo (por ejemplo, temperatura superficial del mar) y genera estados sucesivos. Tras cada paso se aplican correcciones físicas duras que fijan la conservación de masa de aire seco y el cierre del presupuesto global de humedad.

Según el artículo citado, se entrenan modelos separados sobre el reanálisis ERA5 y sobre simulaciones atmosféricas históricas de SHiELD. El repositorio de HuggingFace emplea un objetivo MSE autorregresivo de dos pasos de seis horas seguido de las correcciones físicas. La versión publicada recorta la anchura del SFNO, el número de modos espectrales y las épocas, pero mantiene las dimensiones de datos y el objetivo de dos pasos; los datos incluidos son sintéticos y no reproducen las distribuciones oficiales de ERA5 ni de SHiELD. No se documentan en la información disponible detalles sobre número de tokens de entrenamiento, composición exacta del dataset ni uso de RLHF o DPO.

## Capacidades

- Emulación atmosférica global autorregresiva a seis horas sobre una rejilla de un grado (180×360).
- Predicción a plazos de seis, doce y dieciocho horas en la configuración de inferencia incluida, con corrección física aplicada en cada paso.
- Simulación de variabilidad climática subestacional a decadal y de respuestas forzadas por condiciones externas como la temperatura superficial del mar.
- Imposición de restricciones físicas duras sobre masa de aire seco y cierre del presupuesto global de humedad.
- Generación de estados sintéticos estructurados de rejilla completa con 50 canales y ocho niveles verticales para validación de ingeniería.
- Evaluación integrada mediante RMSE ponderado por latitud, R² de media global, habilidad frente a persistencia y errores de cierre de masa seca y humedad.
- Entrenamiento distribuido en múltiples GPUs mediante `torchrun`.
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento explícito: no es un modelo de lenguaje.

## Casos de uso

- Predicción meteorológica a corto plazo: ejecutar el bucle autorregresivo de seis horas sobre un estado atmosférico inicial para generar predicciones a seis, doce y dieciocho horas sobre la rejilla global de un grado, aplicando correcciones físicas en cada paso para evitar derivas de masa.
- Análisis de variabilidad subestacional a decadal: usar el modelo para estudiar estadísticas climáticas de largo plazo y respuestas forzadas, tal como se describe en el artículo, en lugar de predicciones deterministas puntuales.
- Validación de conservación física: comprobar los errores de cierre de masa de aire seco y de humedad global como prueba de calidad del emulador antes de integrarlo en un pipeline mayor.
- Generación de datos sintéticos para desarrollo: producir tensores `[N,T,50,180,360]` con ocho niveles que permitan desarrollar y depurar código de preprocesado, métricas y visualización sin depender de ERA5.
- Validación de pipelines AI4S de extremo a extremo: recorrer el flujo completo de datos, entrenamiento, inferencia, métricas atmosféricas y evaluación usando el script de datos sintéticos y las utilidades de evaluación del repositorio.
- Pruebas de escalado distribuido: validar configuraciones multi-GPU y flujos de checkpoints con `torchrun` antes de lanzar entrenamientos sobre datos reales.
- Evaluación comparativa de operadores neuronales: usar las métricas incluidas (RMSE ponderado por latitud, R² de media global, habilidad frente a persistencia) para contrastar variantes de SFNO y baselines en un entorno reproducible.
- Formación y reproducción metodológica: servir como material didáctico para entender cómo se combina un operador neuronal espectral con restricciones físicas duras en un modelo de emulación climática.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio incluye scripts de evaluación que calculan RMSE ponderado por latitud, R² de media global, habilidad frente a persistencia y errores de cierre de masa seca y humedad, pero no se proporcionan cifras concretas. La propia model card advierte que los resultados obtenidos con los datos sintéticos incluidos validan únicamente la ingeniería y no representan el rendimiento formal del artículo.

## Requisitos de hardware

- GPU o DCU recomendadas para entrenamiento e inferencia; la CPU solo se contempla para validación de conectividad con la configuración de muestra pequeña por defecto.
- Usuarios de DCU deben instalar DTK previamente; se recomienda DTK 25.04.2 o posterior, o la versión recomendada por OneScience para el clúster en uso.
- Entorno GPU: entorno Conda con Python 3.11 y `libstdcxx-ng=12`, `libgcc-ng=12`, `gcc_linux-64=12`, `gxx_linux-64=12`, más el extra `onescience[earth-gpu]`.
- Entorno DCU: entorno Conda con Python 3.11 y el extra `onescience[earth-dcu]`.
- VRAM estimada: no disponible. La versión publicada reduce la anchura del SFNO y el número de modos espectrales, por lo que la huella real del checkpoint oficial no se puede inferir de este repositorio.
- Entrenamiento multi-GPU: `torchrun --nproc_per_node=8 --nnodes=1 --rdzv_id=1000 --rdzv_backend=c10d --max_restarts=0 --master_addr="localhost" --master_port=29500 scripts/train.py`.
- Opciones de despliegue: no aplica vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje. El despliegue se realiza con PyTorch y los scripts incluidos (`train.py`, `inference.py`, `result.py`).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se proporcionan datos comparativos en la información disponible. La categoría equivalente es la de emuladores atmosféricos basados en aprendizaje automático (por ejemplo, enfoques de tipo GraphCast, Pangu-Weather o NeuralGCM), pero la información facilitada no incluye parámetros, contexto, métricas ni licencias de esas alternativas, por lo que no es posible establecer una comparación verificada sin inventar cifras.

| Aspecto | ACE2 (repositorio OneScience-Group) | Alternativas de emulación atmosférica |
|---|---|---|
| Arquitectura | SFNO con correcciones físicas duras | no disponible |
| Parametros | no disponible | no disponible |
| Resolucion | Rejilla global de 1 grado (180×360), 50 canales, 8 niveles | no disponible |
| Paso temporal | 6 h autorregresivo | no disponible |
| Licencia | Apache 2.0 | no disponible |
| Rendimiento publicado | no disponible en esta ficha | no disponible |

## Limitaciones y advertencias

- El repositorio es una reproducción de ingeniería independiente de las especificaciones públicas de ACE2, no la implementación oficial.
- Los datos incluidos son sintéticos y reducen muestras, escala del modelo y épocas; sus resultados validan únicamente el flujo de ingeniería y no representan el rendimiento del artículo.
- El "ledger" de 50 canales es una interpretación de ingeniería del texto principal, según la propia model card.
- El checkpoint oficial ACE2-ERA5 no está incluido en el repositorio y este modelo compacto no reclama compatibilidad con él.
- No hay resultados de benchmarks publicados en la información disponible; no deben citarse cifras de rendimiento a partir de este repositorio.
- Dependencia de los datos de entrenamiento del artículo (reanálisis ERA5 y simulaciones SHiELD), con los sesgos y limitaciones propios de esas fuentes.
- Riesgo de deriva o degradación en plazos largos inherente a la generación autorregresiva, mitigado parcialmente por las correcciones físicas de masa seca y humedad.
- Idioma de la documentación: únicamente inglés.
- Licencia Apache 2.0, que permite uso comercial, pero el texto de licencia del repositorio aparece truncado en la model card ("code licensed un..."), por lo que conviene verificar el fichero LICENSE completo antes de un uso en producción.
- No dispone de cuantizaciones publicadas ni de formatos GGUF, por lo que no puede desplegarse en runtimes de inferencia de modelos de lenguaje.
- No hay información sobre número de parámetros totales ni requisitos de VRAM, lo que dificulta el dimensionamiento de infraestructura.

## Enlaces

- HuggingFace: https://huggingface.co/OneScience-Group/ACE2
- Artículo: ACE2: accurately learning subseasonal to decadal atmospheric variability and forced responses — https://doi.org/10.1038/s41612-025-01090-0
- Checkpoint oficial ACE2-ERA5: https://doi.org/10.57967/hf/5377
- OneCode (programación AI4S en un clic): https://web-2069360198568017922-iaaj.ksai.scnet.cn:58043/home
- Repositorio principal en Gitee: https://gitee.com/onescience-ai/onescience
- Repositorio de skills en Gitee: https://gitee.com/onescience-ai/oneskills
- Repositorio principal en GitHub: https://github.com/onescience-ai/OneScience
- Repositorio de skills en GitHub: https://github.com/onescience-ai/oneskills
- Resultados de búsqueda web: no contienen información relevante sobre este modelo.
