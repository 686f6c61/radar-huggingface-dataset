# OneScience-Group/TropiCycloneNet

## Resumen

TropiCycloneNet es un método de aprendizaje profundo multimodal para la predicción conjunta, a escala global, de la trayectoria y la intensidad de ciclones tropicales. Lo proponen investigadores de la Zhejiang University of Technology, la Shandong University, la Tianjin University of Technology y el Zhejiang Key Laboratory of Visual Information Intelligent Processing, y el trabajo asociado se publicó en Nature Communications (DOI 10.1038/s41467-025-61087-4). El repositorio de HuggingFace analizado es una reproducción de ingeniería independiente de las especificaciones públicas del modelo, con código bajo licencia Apache-2.0.

El modelo fusiona tres fuentes de información: atributos intrínsecos del ciclón, campos meteorológicos locales y variables ambientales. A partir de ocho estados consecutivos con cadencia de seis horas —cuatro atributos del ciclón, un campo de geopotencial en 500 hPa de 81×81 y variables ambientales— predice cuatro estados futuros, es decir, pronósticos a 6, 12, 18 y 24 horas de trayectoria (longitud y latitud), presión central y viento máximo sostenido. Mediante una codificación conjunta temporal, espacial y ambiental y varios generadores, produce varias trayectorias candidatas con sus probabilidades asociadas.

Su relevancia es doble: por un lado, aborda una tarea de alto impacto social (predicción ciclónica operativa) con un enfoque de fusión multimodal y salidas probabilísticas; por otro, el repositorio sirve como pieza de validación reproducible del ecosistema OneScience para ciencia de la Tierra, con scripts de datos sintéticos, entrenamiento monoproceso y distribuido, inferencia y evaluación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal profunda multimodal con codificación conjunta temporal, espacial y ambiental y múltiples generadores; el detalle de capas no está disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo de mezcla de expertos tipo LLM; dato no disponible) |
| Longitud de contexto | no aplica en el sentido de los LLM; ventana de entrada de 8 estados cada 6 h (48 h de historial) y predicción de 4 estados futuros (24 h) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en (inglés), según los metadatos de la model card |
| Licencia | Apache-2.0 para el código del repositorio; el artículo original es CC BY 4.0 y los datos TCND, el código oficial y los pesos quedan sujetos a sus respectivas licencias |
| Formato de pesos | no disponible (no se publican pesos preentrenados; el repositorio genera checkpoints de PyTorch en `result/checkpoints/tropicyclonenet.pt`) |
| Framework | PyTorch |
| Autor / organización | OneScience-Group |
| Fecha de publicación del repositorio | 16 de septiembre de 2026 |
| Descargas / likes en HuggingFace | 0 / 0 |

## Arquitectura y entrenamiento

La información disponible describe una arquitectura de aprendizaje profundo multimodal que combina tres modalidades de entrada (denominadas Data1d, Data3d y variables ambientales) mediante una codificación conjunta en los ejes temporal, espacial y ambiental. Sobre esa representación compartida, el modelo emplea varios generadores que producen desarrollos alternativos del ciclón; en inferencia se obtienen seis candidatos de trayectoria e intensidad con sus probabilidades asociadas, lo que da al sistema un comportamiento de conjunto (ensemble) en lugar de una única predicción determinista. El repositorio no detalla el número de capas, la dimensión oculta, el número exacto de parámetros ni el mecanismo de atención o convolución empleado, por lo que estos datos figuran como no disponibles.

En cuanto al entrenamiento, el modelo se entrenó con casi 70 años de registros best-track del conjunto TCND, campos ERA5 y variables ambientales que abarcan seis cuencas oceánicas. La configuración de referencia de los scripts usa ocho estados cada seis horas como entrada y cuatro estados futuros como objetivo. El repositorio incluye un modo de datos sintéticos (`scripts/fake_data.py`) que preserva las formas de cada modalidad, el orden temporal, el protocolo de seis cuencas y los seis generadores, pero reduce el número de ciclones, la anchura oculta y las épocas: sus resultados validan únicamente el flujo de ingeniería y no reproducen el rendimiento del artículo. El entrenamiento admite ejecución monoproceso (`python scripts/train.py`) y distribuida con `torchrun --nproc_per_node=2`, con DDP verificado a dos procesos. No se especifica en la información proporcionada si hubo RLHF, DPO ni ninguna otra fase de ajuste por preferencias.

## Capacidades

- Predicción de trayectoria de ciclones tropicales a escala global: estima longitud y latitud para horizontes de 6, 12, 18 y 24 horas.
- Predicción de intensidad: estima la presión central y el viento máximo sostenido para los mismos horizontes.
- Modelado multimodal: fusiona entradas unidimensionales (atributos del ciclón), tridimensionales (campos de geopotencial, 81×81 en 500 hPa) y variables ambientales.
- Generación de múltiples tendencias: produce seis trayectorias candidatas a partir de varios generadores y conserva las probabilidades de cada generador en la salida.
- Cobertura multi-cuenca: el protocolo de entrenamiento abarca seis cuencas oceánicas.
- Entrenamiento distribuido: soporte de entrenamiento multiproceso con DDP mediante `torchrun`.
- Evaluación integrada: calcula MAE de trayectoria en círculo máximo (great-circle), MAE de presión y MAE de velocidad del viento, y genera una figura comparativa por horizonte temporal.
- Ejecución en ModelScope o OneCode: el repositorio permite validar datos estructurados, entrenamiento, inferencia, métricas probabilísticas de precipitación y visualización en esos entornos.
- No dispone de soporte de tool calling, function calling, capacidades de agente, razonamiento multi-paso genérico, visión natural ni audio: es un modelo científico específico de dominio.

## Casos de uso

- Predicción operativa de trayectoria: el modelo genera posiciones de longitud y latitud a 6, 12, 18 y 24 horas a partir de 48 horas de historial meteorológico, lo que permite alimentar boletines de seguimiento de ciclones con actualizaciones cada seis horas.
- Predicción de intensidad para avisos de categoría: al estimar presión central y viento máximo sostenido, sirve para anticipar transiciones de categoría (por ejemplo, de tormenta tropical a huracán) con un día de antelación.
- Generación de escenarios múltiples para gestión de incertidumbre: los seis candidatos con sus probabilidades permiten construir un conjunto de trayectorias alternativas y comunicar rangos de riesgo en lugar de una única línea determinista.
- Apoyo a la navegación y a la logística marítima: los pronósticos de 24 horas permiten a operadores de rutas oceánicas y plataformas offshore evaluar desvíos de rumbo y ventanas de seguridad.
- Análisis retrospectivo y climatología: entrenado con casi 70 años de registros best-track y campos ERA5, puede reutilizarse para estudiar patrones históricos de intensificación y validar hipótesis sobre seis cuencas oceánicas.
- Validación de pipelines de ciencia de la Tierra en OneScience: los scripts de datos sintéticos, entrenamiento, inferencia y evaluación sirven para verificar flujos multimodales, DDP y métricas en entornos GPU o DCU antes de escalar a datos reales.
- Investigación reproducible en predicción multimodal: al separar generadores y probabilidades, es una base para experimentar con estrategias de fusión de datos 1D, 3D y ambientales y comparar métricas de MAE entre configuraciones.
- Prototipado en clústeres heterogéneos: al soportar tanto GPU como DCU (DTK 25.04.2), encaja en infraestructuras mixtas de cálculo científico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que los resultados obtenidos con los datos sintéticos del repositorio verifican el flujo de ingeniería y no representan el rendimiento del artículo, y no se proporciona ninguna cifra numérica de MAE ni comparación con otros métodos. El repositorio define las métricas que reporta la evaluación (MAE de trayectoria en círculo máximo, MAE de presión y MAE de velocidad del viento, con figura de comparación por horizonte temporal), pero no incluye sus valores.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible; la documentación solo indica que se recomienda una GPU.
- Aceleradores alternativos: se admite DCU con DTK 25.04.2 o una versión compatible recomendada por OneScience.
- Ejecución en CPU: es posible ejecutar la configuración de conectividad por defecto con muestras pequeñas; no se especifica su idoneidad para datos reales.
- ¿Cabe en GPU de consumo?: no disponible.
- Entrenamiento multi-GPU: verificado con dos procesos mediante `torchrun --nproc_per_node=2 --nnodes=1` con DDP; no se documentan configuraciones de mayor escala.
- Opciones de despliegue: scripts propios de Python sobre PyTorch (`scripts/train.py`, `scripts/inference.py`, `scripts/result.py`), con instalación mediante `pip install onescience[earth-gpu]` o `pip install onescience[earth-dcu]` en Python 3.11. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.
- Artefactos generados: `result/checkpoints/tropicyclonenet.pt` (checkpoint recuperable con estado del modelo y configuración), `result/training/metrics.json`, `result/output/predictions.npz` y `result/evaluation/metrics.json` junto con `result/evaluation/comparison.png`.

## Comparativa con modelos similares

No disponible. La información proporcionada no identifica modelos alternativos de predicción de ciclones tropicales ni ofrece cifras comparativas de parámetros, contexto, rendimiento, licencia o disponibilidad frente a otras propuestas.

## Limitaciones y advertencias

- Este repositorio es una reproducción de ingeniería independiente de las especificaciones públicas del modelo, no una publicación de los autores originales del artículo.
- No se proporciona ningún checkpoint preentrenado oficial ni enlace al mismo, porque no se confirmó la existencia de pesos cargables directamente con una licencia explícita; los únicos pesos disponibles son los que genera el propio usuario al entrenar.
- Los datos sintéticos incluidos reducen el número de ciclones, la anchura oculta y las épocas: sus resultados validan el flujo de ingeniería y no deben presentarse como rendimiento del modelo del artículo.
- No se han publicado en la información disponible cifras de benchmarks, por lo que no es posible verificar la calidad predictiva ni compararla con métodos alternativos.
- Uso operativo en seguridad de vidas: un modelo no validado con pesos oficiales no debería emplearse como única fuente para decisiones críticas de evacuación o alerta; requiere validación independiente y contraste con servicios meteorológicos oficiales.
- Dependencia de datos externos: el entrenamiento depende de registros best-track del TCND, campos ERA5 y variables ambientales de seis cuencas, sujetos a sus propias licencias y condiciones de uso distintas de la Apache-2.0 del código.
- Restricciones de licencia: el código es Apache-2.0, el artículo original es CC BY 4.0, y los datos, el código oficial y los pesos conservan sus licencias y términos respectivos; el uso comercial debe revisarse caso por caso.
- Idioma y alcance: los metadatos declaran únicamente inglés y el modelo está especializado en predicción ciclónica; no es un modelo de propósito general ni cubre tareas de lenguaje natural.
- Sesgos potenciales: no se documenta ningún análisis de sesgo; la cobertura por cuencas y la calidad del best-track pueden introducir diferencias de rendimiento entre regiones.
- Riesgo de alucinación en sentido estricto: no aplica a un modelo numérico de predicción, pero sí existe riesgo de sobreconfianza en las salidas cuando el modelo se ejecuta fuera del dominio de entrenamiento o con entradas mal normalizadas.
- Requisitos de entorno sensibles: la instalación depende del índice de paquetes de OneScience (mirror propio) y, en DCU, de una versión concreta de DTK, lo que puede complicar la reproducibilidad en otras infraestructuras.
- Madurez del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin historial de uso público que permita evaluar su robustez.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OneScience-Group/TropiCycloneNet
- Artículo (Nature Communications): https://doi.org/10.1038/s41467-025-61087-4
- Código oficial del artículo: https://github.com/xiaochengfuhuo/TropiCycloneNet
- OneScience en GitHub: https://github.com/onescience-ai/OneScience
- OneScience en Gitee: https://gitee.com/onescience-ai/onescience
- OneSkills en GitHub: https://github.com/onescience-ai/oneskills
- OneSkills en Gitee: https://gitee.com/onescience-ai/oneskills
- Búsqueda web: no se encontró ningún resultado relevante sobre el modelo; los enlaces devueltos por el buscador no guardan relación con TropiCycloneNet ni con ciencia de la Tierra.
