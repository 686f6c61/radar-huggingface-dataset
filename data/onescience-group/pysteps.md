# OneScience-Group/pysteps

## Resumen
OneScience-Group/pysteps es un repositorio de Hugging Face que reproduce el framework pysteps para nowcasting probabilístico de precipitación. No es un modelo de lenguaje ni una red neuronal con pesos preentrenados: es una reimplementación de ingeniería de un pipeline meteorológico que combina estimación de movimiento por flujo óptico, descomposición en cascada y modelado autorregresivo AR(2) para generar ensembles de predicción a corto plazo.

El método original fue propuesto por equipos del Finnish Meteorological Institute, MeteoSwiss, ETH Zurich, Colorado State University y colaboradores, y se documenta en el artículo "Pysteps: an open-source Python library for probabilistic precipitation nowcasting (v1.0)" (Geoscientific Model Development, 2019). El sistema estima en línea los parámetros de movimiento, cascada y autorregresión a partir de secuencias de radar con cadencia de cinco minutos recogidas en varios países, y produce predicciones probabilísticas con horizonte de una a tres horas junto con análisis de incertidumbre mediante ensembles.

Su interés práctico está en cubrir la ventana temporal que los modelos numéricos de predicción no resuelven bien (de 0 a 3 horas), donde el nowcasting por radar aporta valor operativo. El repositorio se distribuye con licencia Apache-2.0, declara el idioma inglés, usa PyTorch como framework y no incluye pesos: la inferencia genera un ensemble finito con forma `[24, 12, 128, 128]` y la evaluación reporta RMSE y dispersión (spread).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No es una red neuronal con pesos entrenados; pipeline de nowcasting: flujo óptico + descomposición en cascada + AR(2) + generación de ensembles STEPS (implementación sobre PyTorch) |
| Parámetros totales | No aplica / no disponible (no hay pesos preentrenados; los parámetros se estiman en línea) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje); horizonte de predicción declarado de 1 a 3 horas |
| Tipos de cuantización | No aplica / no disponible |
| Idiomas soportados | Inglés (idioma declarado en la model card) |
| Licencia | Apache-2.0 para este repositorio; el artículo original es CC BY 4.0 y el software oficial pysteps es BSD-3-Clause |
| Formato de pesos | No hay pesos incluidos; el directorio `weight/` está vacío según la model card |

## Arquitectura y entrenamiento
La reproducción se centra en cuatro componentes: estimación de movimiento por flujo óptico, descomposición en cascada, un modelo autorregresivo de orden 2 (AR(2)) y la generación de ensembles STEPS. Los parámetros de movimiento, cascada y autorregresión se estiman en línea a partir de secuencias de radar con resolución temporal de cinco minutos, recogidas en varios países. STEPS no dispone de entrenamiento por gradiente offline, por lo que no existe una fase de ajuste de pesos ni un dataset de entrenamiento en el sentido habitual de los modelos neuronales; el repositorio lo indica explícitamente ("No weights are bundled under `weight/`").

La inferencia genera un ensemble finito de forma `[24, 12, 128, 128]`, es decir, 24 miembros de ensemble, 12 pasos temporales y rejillas de 128×128 píxeles. La evaluación asociada reporta RMSE y spread, métricas estándar para valorar la calibración y la dispersión de una predicción probabilística. El repositorio incluye scripts de datos sintéticos (`scripts/fake_data.py`), entrenamiento (`scripts/train.py`, también con `torchrun --standalone --nproc_per_node=2`), inferencia (`scripts/inference.py`) y post-procesado de resultados (`scripts/result.py`); el script de entrenamiento existe como envoltorio de ejecución, pero no hay ajuste de pesos que conservar.

## Capacidades
- Nowcasting probabilístico de precipitación con horizonte de una a tres horas a partir de secuencias de radar.
- Estimación de movimiento mediante flujo óptico sobre imágenes de reflectividad o tasa de precipitación.
- Descomposición en cascada de los campos de precipitación para modelar estructura multiescala.
- Modelado autorregresivo AR(2) por nivel de cascada, con estimación de parámetros en línea.
- Generación de ensembles estocásticos STEPS para cuantificar incertidumbre (`[24, 12, 128, 128]`).
- Evaluación de la predicción probabilística mediante RMSE y spread.
- Ejecución en GPU, DCU o CPU (esta última con la configuración de muestra pequeña para validación de conectividad).
- No dispone de generación de texto, razonamiento, código, matemáticas, visión general, tool calling, function calling, capacidades de agente ni multilingüismo.

## Casos de uso
- Avisos meteorológicos a corto plazo: el sistema genera un ensemble probabilístico a 1-3 horas que permite emitir alertas por precipitación intensa con una estimación explícita de la incertidumbre, algo que un pronóstico determinista no ofrece.
- Gestión de drenaje urbano e inundaciones repentinas: con actualizaciones cada cinco minutos y 12 pasos temporales de predicción, los operadores de saneamiento pueden anticipar picos de caudal y preposicionar recursos.
- Operaciones aeroportuarias: nowcasting de precipitación en el entorno del aeródromo para ajustar secuencias de despegue y aterrizaje, dado el horizonte de una a tres horas que cubre el método.
- Agricultura de precisión: planificación de riego y tratamientos fitosanitarios en función de la probabilidad de lluvia en las próximas horas, usando el spread del ensemble como medida de confianza.
- Gestión de energía hidroeléctrica: previsión de aportes a embalses a muy corto plazo, donde la incertidumbre del ensemble permite dimensionar reservas operativas.
- Validación y comparación metodológica: al ser una reproducción del algoritmo clásico, sirve como referencia (baseline) frente a modelos de nowcasting basados en deep learning, comparando RMSE y spread sobre las mismas secuencias de radar.
- Investigación en predicción probabilística: el código permite estudiar el efecto de la descomposición en cascada y del orden autorregresivo sobre la calibración del ensemble.
- Formación y docencia: los scripts de datos sintéticos y de inferencia facilitan reproducir el pipeline completo sin acceso a datos de radar operativos.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks numéricos en la información disponible. La model card indica únicamente que la evaluación reporta RMSE y spread sobre el ensemble generado, pero no incluye valores concretos ni comparaciones cuantitativas con otros métodos.

## Requisitos de hardware
- GPU o DCU recomendadas para la ejecución completa; la CPU se admite para validación de conectividad con la configuración de muestra pequeña por defecto.
- Usuarios de DCU: requieren DTK 25.04.2 o una versión compatible recomendada por OneScience antes de instalar el entorno.
- Entorno GPU: `conda create -n onescience311 python=3.11` con `libstdcxx-ng=12`, `libgcc-ng=12`, `gcc_linux-64=12` y `gxx_linux-64=12`, seguido de `pip install onescience[earth-gpu]`.
- Entorno DCU: `conda create -n onescience311 python=3.11` seguido de `pip install onescience[earth-dcu]`.
- Ejecución distribuida: el script de entrenamiento soporta `torchrun --standalone --nproc_per_node=2`, lo que implica un mínimo de dos procesos o dispositivos.
- VRAM estimada: no disponible. La carga de trabajo declarada es un tensor de salida de `[24, 12, 128, 128]`, pero la model card no especifica memoria necesaria ni GPU concretas.
- Compatibilidad con GPU de consumo: no especificada. Al no tratarse de un modelo de lenguaje con pesos, el cuello de botella es el cómputo numérico y el acceso a datos de radar, no la memoria de pesos.
- Opciones de despliegue: scripts propios del repositorio sobre PyTorch (`scripts/inference.py`, `scripts/result.py`, `scripts/train.py`) y lanzamiento con `torchrun`. No aplican vLLM, llama.cpp, Ollama ni TGI, ya que no hay pesos de transformer que servir.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Sistema | Enfoque | Pesos preentrenados | Licencia | Disponibilidad |
|---|---|---|---|---|
| OneScience-Group/pysteps | Reproducción de flujo óptico + cascada + AR(2) + STEPS | No | Apache-2.0 (repositorio) | Hugging Face, 0 descargas declaradas |
| pySTEPS oficial | Flujo óptico + cascada + AR(2) + STEPS | No | BSD-3-Clause | Repositorio GitHub `pySTEPS/pysteps` |
| Métodos de nowcasting con deep learning (por ejemplo, arquitecturas generativas de radar) | Redes neuronales entrenadas sobre secuencias de radar | Sí | Varía según implementación | No disponible en la información proporcionada |

No se dispone de datos comparativos de rendimiento (RMSE, spread u otras métricas) entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias
- No es un modelo de lenguaje: no genera texto, no razona, no hace tool calling ni soporta agentes. Cualquier expectativa en ese sentido es incorrecta.
- No incluye pesos preentrenados. El directorio `weight/` está vacío y los parámetros se estiman en línea en cada ejecución, por lo que no existe un artefacto reproducible congelado.
- No hay entrenamiento por gradiente offline; el script de entrenamiento no produce un modelo ajustado que pueda versionarse o compararse entre ejecuciones.
- Ámbito estrictamente limitado al nowcasting de precipitación con horizonte de una a tres horas y a entradas de radar con cadencia de cinco minutos.
- Dependencia de datos de radar: el rendimiento en producción depende de la calidad, la calibración y la cobertura de la red de radar disponible.
- Posible sesgo geográfico y climático: los parámetros se estiman a partir de secuencias recogidas en varios países, sin que la model card detalle la composición regional del conjunto de datos ni su cobertura climática.
- Validación comunitaria prácticamente nula: el repositorio registra 0 descargas y 0 likes, y muestra datos sintéticos (`scripts/fake_data.py`) entre sus utilidades, lo que sugiere que la validación pública con datos reales es escasa.
- Idiomas: únicamente inglés declarado en la model card.
- Licencias: el repositorio es Apache-2.0, pero el artículo original es CC BY 4.0 y el software oficial pysteps es BSD-3-Clause; el paper, el software y los datos de radar conservan sus propios términos, que deben respetarse por separado en un uso comercial.
- Reproducción independiente: el repositorio se declara a sí mismo como "independent engineering reproduction of the public pysteps specifications", sin vinculación con los autores originales.
- Fechas de publicación de los metadatos (creación y actualización el 17 de septiembre de 2026) anómalas respecto al momento de consulta; conviene verificar la vigencia del repositorio antes de integrarlo.
- No se publican benchmarks, curvas de calibración ni comparaciones con el pysteps oficial, por lo que la equivalencia funcional con la implementación de referencia no está demostrada.

## Enlaces
- Repositorio en Hugging Face: https://huggingface.co/OneScience-Group/pysteps
- Artículo de referencia (pysteps v1.0, Geoscientific Model Development): https://doi.org/10.5194/gmd-12-4185-2019
- Software oficial pysteps: https://github.com/pySTEPS/pysteps
- Índice de paquetes de OneScience usado en las instrucciones de instalación: http://mirrors.onescience.ai:3141/pypi/simple/
- No se han encontrado otros enlaces relevantes (papers, blogs, demos o repositorios adicionales) en los resultados de búsqueda disponibles.
