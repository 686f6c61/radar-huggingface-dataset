# OneScience-Group/Delta-HBV

## Resumen

Delta-HBV es un modelo hidrológico diferenciable, con conservación de masa y conocimiento físico incorporado, que aprende parámetros de forma dinámica. Fue propuesto por la Pennsylvania State University y KAUST, y combina una red LSTM que actúa como controlador con 16 componentes HBV ejecutados en paralelo, generando además parámetros beta y gamma variables en el tiempo. Su objetivo es cubrir dos carencias clásicas de la modelización hidrológica: la predicción en cuencas no aforadas (ungauged basins) y la evaluación de impactos del cambio climático sobre tendencias históricas de caudal.

El repositorio de HuggingFace es una reproducción de ingeniería independiente de las especificaciones públicas del modelo, no una publicación oficial de los autores. Se entrenó con forzamiento diario de CAMELS, 35 atributos de cuenca y series de caudal observado. No se trata de un modelo de lenguaje: no procesa texto ni dispone de ventana de contexto en el sentido de un transformer, sino de una ventana de calentamiento de 365 días para el entrenamiento y secuencias de inferencia de 730 días.

Su relevancia actual reside en el enfoque de física diferenciable aplicada a la hidrología: al integrar restricciones físicas en un pipeline entrenable de extremo a extremo con PyTorch, permite evaluar la extrapolación espacial a regiones contiguas no observadas y comprobar si se preservan las tendencias de caudales altos y bajos bajo escenarios históricos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LSTM que controla 16 componentes HBV en paralelo, con generación dinámica de los parámetros beta y gamma; modelo diferenciable y con conservación de masa |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; ventana de calentamiento de 365 días en entrenamiento y secuencias de inferencia de 730 días |
| Tipos de cuantizacion | no disponible (no se documentan esquemas de cuantización) |
| Idiomas soportados | inglés (declarado en la model card); el modelo no procesa lenguaje natural |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (el repositorio no incluye pesos en `weight/`; no hay checkpoint preentrenado cargable) |

## Arquitectura y entrenamiento

La arquitectura es un híbrido de aprendizaje profundo y modelización conceptual: una LSTM procesa el forzamiento meteorológico y los atributos de cuenca, y a partir de esa representación se conducen 16 componentes HBV paralelos. Los parámetros beta y gamma se generan de forma dinámica en lugar de mantenerse fijos, y el conjunto se entrena de extremo a extremo aprovechando la diferenciabilidad de los componentes físicos, lo que permite propagar gradientes a través del balance hídrico y mantener la conservación de masa.

El entrenamiento utiliza forzamiento diario de CAMELS, 35 atributos de cuenca y observaciones de caudal, optimizando el caudal predicho tras un calentamiento de 365 días. No se documenta en la información disponible el número de muestras de entrenamiento, la composición detallada del dataset ni el uso de RLHF o DPO (técnicas propias de modelos de lenguaje que no aplican aquí). Tampoco se especifica el número de épocas, la tasa de aprendizaje ni el coste computacional del entrenamiento.

## Capacidades

- Predicción de caudal (discharge) a escala diaria sobre cuencas con forzamiento CAMELS.
- Predicción de evapotranspiración (ET) junto con el caudal, dentro de la misma ejecución de inferencia.
- Evaluación en cuencas no aforadas mediante retención espacial (spatially held-out streamflow).
- Extrapolación a regiones contiguas no observadas durante el entrenamiento (contiguous held-out regions).
- Evaluación de preservación de tendencias históricas, tanto anuales como de caudales altos y bajos.
- Aprendizaje dinámico de parámetros (beta y gamma) en lugar de calibración estática por cuenca.
- Ejecución y validación dentro del ecosistema ModelScope/OneCode (datos, entrenamiento, inferencia, métricas y visualización).
- Entrenamiento multiproceso en varias GPU o DCU mediante `torchrun`.
- Cálculo de métricas de evaluación: NSE, RMSE de evapotranspiración y error de tendencia.
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Predicción en cuencas no aforadas: el modelo permite estimar series de caudal diario en cuencas sin aforo mediante retención espacial, aprovechando los 35 atributos de cuenca como variables descriptoras del régimen hidrológico.
- Evaluación de tendencias históricas de caudal: al reportar error de tendencia, es adecuado para comprobar si se preservan las tendencias anuales y los regímenes de caudales altos y bajos, un requisito habitual en estudios de atribución climática.
- Estimación conjunta de caudal y evapotranspiración: la inferencia produce secuencias finitas de 730 días con ambas variables, lo que permite alimentar modelos de balance hídrico o de gestión de recursos.
- Extrapolación espacial a regiones contiguas: sirve para probar la transferibilidad del modelo a zonas no incluidas en el entrenamiento, escenario crítico en agencias de cuenca con redes de medida dispersas.
- Predicción de evapotranspiración para agricultura y gestión de embalses: la componente de ET permite estimar demandas hídricas a escala diaria combinándola con datos meteorológicos de forzamiento.
- Reproducción y validación de pipelines científicos: el repositorio incluye scripts de datos sintéticos, entrenamiento, inferencia y evaluación, lo que facilita la verificación de resultados y la comparación metodológica en entornos ModelScope/OneCode.
- Entrenamiento escalado en clúster: con `torchrun --standalone --nproc_per_node=2` se lanzan procesos múltiples, útil para experimentos de ablation sobre atributos de cuenca o configuraciones de componentes HBV.
- Evaluación comparativa de modelos diferenciables: las métricas NSE, RMSE de ET y error de tendencia permiten situar el modelo frente a alternativas físicas o puramente basadas en datos dentro de un mismo protocolo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que la fase de evaluación reporta NSE, RMSE de evapotranspiración y error de tendencia, así como que la inferencia produce secuencias finitas de 730 días, pero no se incluyen cifras concretas ni tablas comparativas.

## Requisitos de hardware

- VRAM estimada: no disponible. No se documenta el tamaño del modelo ni el consumo de memoria por lote.
- GPU recomendadas: no se especifican modelos concretos. La documentación indica únicamente el uso de GPU o DCU cuando estén disponibles.
- Compatibilidad con GPU de consumo: no disponible.
- CPU: soporta la configuración de humo (smoke) por defecto, es decir, es posible ejecutar una prueba mínima sin acelerador.
- Entrenamiento distribuido: soportado mediante `torchrun`, con ejemplo de dos procesos (`--nproc_per_node=2`).
- Opciones de despliegue: PyTorch como framework; scripts propios (`scripts/train.py`, `scripts/inference.py`, `scripts/result.py`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos numéricos comparativos en la información proporcionada. Las alternativas de la misma categoría serían modelos hidrológicos conceptuales tipo HBV, modelos puramente basados en datos como las LSTM entrenadas sobre CAMELS, y otros modelos híbridos de física diferenciable. No se han facilitado parámetros, contexto, rendimiento ni licencia de esas alternativas, por lo que no es posible establecer una comparación cuantitativa.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Delta-HBV | no disponible | no aplica (calentamiento de 365 días; inferencia de 730 días) | no disponible | Apache 2.0 | Reproducción de ingeniería en HuggingFace, sin pesos publicados |
| HBV conceptual | no disponible | no aplica | no disponible | no disponible | no disponible |
| LSTM sobre CAMELS | no disponible | no aplica | no disponible | no disponible | no disponible |
| Otros modelos de física diferenciable | no disponible | no aplica | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No se incluyen pesos entrenados: el repositorio no contiene ningún checkpoint en `weight/` y el paper no publica un checkpoint oficial cargable, por lo que no es posible la inferencia directa sin entrenar el modelo.
- Naturaleza del repositorio: se declara explícitamente como una reproducción de ingeniería independiente de las especificaciones públicas, no como la implementación oficial de los autores.
- Dependencia de datos: el entrenamiento e inferencia requieren forzamiento CAMELS, 35 atributos de cuenca y series de caudal, todos ellos sujetos a sus propias licencias y condiciones de uso.
- Ausencia de cifras de rendimiento: no se publican valores de NSE, RMSE de ET ni error de tendencia, lo que impide valorar la calidad predictiva antes de entrenar.
- Sesgos y limitaciones geográficas: el comportamiento fuera de la distribución de cuencas de CAMELS (climas, latitudes o regímenes no representados) no está caracterizado en la información disponible.
- Riesgo de alucinación: no aplica en el sentido habitual, pero existe riesgo de extrapolación no física en cuencas o periodos fuera del dominio de entrenamiento.
- Idioma: la model card declara únicamente inglés; el modelo no procesa lenguaje natural ni puede usarse para tareas de texto.
- Sin soporte de agentes ni tool calling: no debe plantearse como componente de un pipeline de agentes.
- Licencia: el código del repositorio se publica bajo Apache 2.0, pero el paper original está bajo CC BY 4.0 y CAMELS y MODIS mantienen sus propias licencias, lo que debe revisarse antes de un uso comercial.
- Fechas del repositorio: la model card registra creación y actualización el 16 de septiembre de 2026, sin historial de versiones adicional.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/OneScience-Group/Delta-HBV
- Paper de referencia: https://doi.org/10.5194/hess-27-2357-2023
- Dataset CAMELS: mencionado como fuente de forzamiento, atributos de cuenca y caudal; no se proporciona enlace directo en la información disponible.
- Datos MODIS: mencionados en la licencia y condiciones de uso; no se proporciona enlace directo en la información disponible.
- No se han encontrado enlaces adicionales relevantes (papers, blogs, repositorios o demos) en los resultados de búsqueda web proporcionados.
