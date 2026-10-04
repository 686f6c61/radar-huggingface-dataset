# John-Amal/cirrus-serving-5625

## Resumen

Cirrus serving bundle (`John-Amal/cirrus-serving-5625`) es un paquete de inferencia publicado en HuggingFace que contiene un modelo de predicción probabilística de precipitación, desarrollado por John-Amal y pensado para alimentar el servicio de inferencia `cirrus` alojado en GitHub. No es un modelo de lenguaje: es un predictor numérico que toma dos pasos temporales de campos ERA5 normalizados y devuelve, para cada celda de la rejilla, los parámetros de una distribución gamma desplazada y censurada, `Y = max(0, Gamma(shape, scale) + shift)`. A partir de esa distribución se obtienen de forma analítica la precipitación esperada, las probabilidades de excedencia y cualquier cuantil.

La relevancia del bundle es de ingeniería más que de investigación: el autor empaqueta junto al modelo las estadísticas de normalización y los umbrales de excedencia empleados en el entrenamiento, porque normalizar con estadísticas distintas produce resultados plausibles pero incorrectos en lugar de un error. El repositorio incluye además de los pesos el orden de canales esperado y la referencia del *run* que generó el artefacto.

Se distribuye en dos formatos equivalentes (TorchScript y ONNX, verificados como idénticos a nivel de bit según el autor), bajo licencia MIT, con un tamaño de repositorio de 0,1 GB. Está entrenado con ERA5 a través de WeatherBench 2, con estadísticas de normalización calculadas sobre los años 1979-2014 y datos que abarcan hasta 2022. El modelo tiene 0 descargas y 0 *likes* en el momento de redactar esta ficha, y no se documenta su topología interna, su número de parámetros ni resultados de evaluación numéricos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal implementada en PyTorch que mapea campos ERA5 normalizados a los parámetros de una distribución gamma desplazada y censurada por celda de rejilla; topología interna no documentada |
| Parámetros totales | no disponible (tamaño del repositorio: 0,1 GB) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; la entrada son dos pasos temporales de campos ERA5) |
| Tipos de cuantización | no disponible (se distribuye en precisión nativa; no se documentan variantes FP16/INT8) |
| Idiomas soportados | no aplica (modelo meteorológico numérico) |
| Licencia | MIT |
| Formato de pesos | TorchScript (`.pt`) y ONNX (`.onnx`), acompañados de `normalisation.json`, `thresholds.json` y `bundle.json` |

Ficheros incluidos en el bundle:

| Fichero | Contenido |
|---|---|
| `twcrps_p90.pt` | Predictor TorchScript, verificado bit a bit idéntico al original en PyTorch |
| `twcrps_p90.onnx` | El mismo modelo en ONNX, para entornos sin PyTorch |
| `normalisation.json` | Estadísticas por canal calculadas sobre los años de entrenamiento 1979-2014 |
| `thresholds.json` | Umbrales de excedencia por celda, correspondientes al 2 % de los pasos de 6 horas |
| `bundle.json` | *Run* que produjo el artefacto y orden de canales esperado por el modelo |

## Arquitectura y entrenamiento

La información disponible no detalla la topología de la red (número de capas, tipo de bloques, resolución de la rejilla ni canales de entrada exactos). Lo que sí se especifica es el contrato de entrada y salida: la entrada son dos pasos temporales de campos ERA5 normalizados, y la salida es, por celda de rejilla, el conjunto de parámetros de una distribución gamma desplazada y censurada en cero. Esta parametrización permite calcular de forma cerrada la esperanza de precipitación, las probabilidades de superar un umbral y los cuantiles arbitrarios, lo que convierte al modelo en un generador de pronóstico probabilístico completo y no en un simple regresor puntual.

El entrenamiento se realizó sobre ERA5 a través de WeatherBench 2, con estadísticas de normalización ajustadas sobre el periodo 1979-2014 y datos que abarcan hasta 2022. La resolución temporal de trabajo es de 6 horas, según se deduce de los umbrales de excedencia definidos como el 2 % de los pasos de 6 horas. El identificador del *checkpoint* (`twcrps_p90`) apunta a un objetivo de entrenamiento basado en twCRPS (threshold-weighted continuous ranked probability score) con umbral en el percentil 90, si bien el autor no documenta explícitamente la función de pérdida ni el protocolo de validación. No se menciona el uso de RLHF, DPO ni técnicas de ajuste por preferencias, que en cualquier caso no aplicarían a un modelo de este tipo.

## Capacidades

- Predicción probabilística de precipitación por celda de rejilla a partir de dos pasos temporales de campos ERA5 normalizados.
- Emisión de los parámetros de una distribución gamma desplazada y censurada (`shape`, `scale`, `shift`) como salida del modelo.
- Cálculo analítico de la precipitación esperada a partir de la distribución ajustada.
- Cálculo analítico de probabilidades de excedencia para umbrales predefinidos por celda, incluidos en `thresholds.json`.
- Cálculo analítico de cuantiles arbitrarios de la distribución, sin muestreo.
- Ejecución en dos *runtimes*: PyTorch/TorchScript y ONNX Runtime, con resultados equivalentes según el autor.
- Integración directa con el servicio `cirrus serve --arm twcrps_p90`.
- No dispone de *tool calling*, capacidades de agente, multimodalidad, audio ni modo de razonamiento extendido: no es un modelo generativo de texto.

## Casos de uso

- Predicción operativa de precipitación a 6 horas: el modelo genera la distribución completa de precipitación por celda, lo que permite publicar no solo un valor esperado sino intervalos y cuantiles para cada punto de la rejilla.
- Alertas tempranas de precipitación extrema: usando `thresholds.json` (umbral por celda calibrado al 2 % de los pasos de 6 horas), el servicio puede emitir probabilidad de excedencia directamente explotable en sistemas de aviso.
- Tarificación y gestión de riesgo en seguros: la probabilidad de excedencia por celda y la distribución paramétrica permiten calcular primas o exponerse a eventos extremos con una base estadística explícita, no con una salida puntual.
- Gestión de recursos hídricos y embalses: los cuantiles de precipitación a 6 horas alimentan modelos hidrológicos aguas abajo y permiten planificar caudales con escenarios de percentiles.
- Agricultura de precisión: la probabilidad de superar un umbral de precipitación relevante para riego o para tratamiento fitosanitario se obtiene en forma cerrada de la distribución ajustada.
- Investigación en predicción meteorológica probabilística: el bundle está preparado para reproducir entrenamientos y evaluaciones dentro del ecosistema WeatherBench 2, con las estadísticas de normalización empaquetadas para garantizar la reproducibilidad.
- Post-procesado y calibración estadística de ensembles meteorológicos: al mapear campos ERA5 a una distribución paramétrica, encaja como capa de calibración en cadenas de predicción existentes.
- Despliegue en entornos sin PyTorch: la versión ONNX permite ejecutar el modelo en servicios ligeros o en infraestructura con *runtimes* de inferencia estándar, sin dependencia del ecosistema PyTorch.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no incluye tablas de evaluación, comparaciones con otros modelos ni métricas numéricas de error, pese a que el identificador del *checkpoint* (`twcrps_p90`) sugiere el uso de twCRPS al percentil 90 como métrica de referencia. Tampoco se documenta el periodo de validación ni la partición de test empleada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño completo del repositorio es de 0,1 GB, lo que sugiere un modelo pequeño que, en la práctica, cabría con holgura en cualquier GPU de consumo e incluso en CPU.
- GPU recomendadas: no especificadas por el autor. Dado el tamaño del artefacto, cualquier GPU con al menos unos pocos GB de memoria libre debería ser suficiente; no se documentan requisitos concretos.
- GPU de consumo: previsiblemente compatible con tarjetas tipo RTX 3060, RTX 4060 o superiores, dado el tamaño del bundle, aunque el autor no publica cifras de consumo de memoria.
- Opciones de despliegue: el servicio propio del proyecto (`pip install "cirrus[serve] @ git+https://github.com/John-Amal/cirrus"` y `cirrus serve --arm twcrps_p90`), TorchScript con PyTorch, y ONNX Runtime para entornos sin PyTorch. Frameworks como vLLM, llama.cpp, Ollama o TGI no aplican, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no identifica modelos comparables de la misma categoría (predicción probabilística de precipitación con salida paramétrica), ni incluye métricas que permitan situar este modelo frente a alternativas. Cualquier comparación numérica requeriría datos de evaluación que el autor no ha publicado.

## Limitaciones y advertencias

- Acoplamiento estricto a las estadísticas de normalización: el propio autor advierte de que usar estadísticas distintas de las de entrenamiento produce resultados plausibles pero incorrectos, sin que el modelo emita ningún error. Esto convierte `normalisation.json` en un artefacto crítico que debe viajar siempre con los pesos.
- Dependencia de ERA5 como entrada: el modelo espera campos ERA5 normalizados en un orden de canales concreto, definido en `bundle.json`; cualquier otra fuente de datos requiere un preprocesado equivalente no documentado.
- Ausencia total de datos de evaluación: no hay métricas de twCRPS, CRPS, sesgo ni fiabilidad de la distribución, lo que impide validar la calidad del pronóstico antes de ponerlo en producción.
- Documentación incompleta: no se especifican la topología de la red, el número de parámetros, los canales de entrada exactos, la resolución espacial de la rejilla ni el protocolo de entrenamiento.
- Riesgo de alucinación: no aplica en el sentido habitual (no es un modelo de lenguaje), pero sí existe el riesgo análogo de generar una distribución perfectamente válida desde el punto de vista estadístico y a la vez meteorológicamente errónea.
- Sin adopción verificable: 0 descargas y 0 *likes* en HuggingFace, sin evidencia de uso en producción ni de revisión por terceros.
- Metadatos potencialmente inconsistentes: la fecha de creación registrada (2026-10-03) es posterior a la del momento habitual de consulta, lo que apunta a un posible error de sellado temporal en el repositorio.
- Licencia MIT: permite uso comercial y modificación, pero el modelo incorpora información modificada del Copernicus Climate Change Service (1979-2022), por lo que se deben respetar las condiciones de atribución de Copernicus y de ERA5.
- Idiomas: no aplica, al tratarse de un modelo numérico sin componente textual.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/John-Amal/cirrus-serving-5625
- Repositorio del servicio de inferencia `cirrus`: https://github.com/John-Amal/cirrus
- Dataset de referencia citado por el autor: WeatherBench 2 (entrenamiento sobre ERA5)
- Fuente de datos citada: ERA5, Copernicus Climate Change Service (1979-2022, información modificada)
