# OneScience-Group/Climate2Weather

## Resumen

Climate2Weather es un modelo generativo de difusión basado en score (conditional score diffusion) que transforma simulaciones climáticas de baja resolución en trayectorias meteorológicas probabilísticas de alta resolución. El método fue propuesto por la Universidad de Tübingen y el Tübingen AI Center, y se entrenó con datos de reanálisis COSMO-REA6 del periodo 2006-2013. En inferencia, el modelo se condiciona únicamente en campos procedentes de un modelo climático, lo que permite aplicar downscaling a predicciones climáticas sin necesidad de observaciones locales.

Técnicamente, el modelo realiza asimilación de datos basada en score y reduce de forma conjunta cuatro variables desde una rejilla de 8x8 hasta 128x128, y desde resolución de seis horas hasta resolución horaria. Se trata, por tanto, de un modelo específico de ciencia de la Tierra y no de un modelo de lenguaje: no tiene parámetros ni ventana de contexto en el sentido habitual de los LLM, sino que opera sobre campos espacio-temporales.

Su relevancia actual reside en que aborda dos problemas clásicos del downscaling climático: la coherencia espacio-temporal entre variables y la representación explícita de la incertidumbre mediante ensembles. El repositorio de HuggingFace analizado es una reproducción de ingeniería independiente de las especificaciones públicas del método, no la implementación oficial, y no incluye pesos entrenados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo generativo de difusión condicional basado en score (score-based data assimilation), implementado en PyTorch |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; no es un modelo de lenguaje. Opera sobre rejillas de 8x8 (entrada) a 128x128 (salida) y de resolución semestral horaria (6 h a 1 h) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (documentación y model card en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible: el repositorio no incluye pesos bajo `weight/`; los pesos oficiales se distribuyen en el repositorio de GitHub de los autores |
| Framework | PyTorch |
| Variables modeladas | 4 (entre ellas viento, temperatura y presión a nivel del mar, según la model card) |
| Resolución de salida | 128x128, cadencia horaria |
| Formato de ensemble en inferencia | tensor `[8,3,4,128,128]` |
| Periodo de entrenamiento | 2006-2013 (reanálisis COSMO-REA6) |

## Arquitectura y entrenamiento

El modelo sigue un esquema de difusión condicional por score. El entrenamiento minimiza un objetivo de denoising score matching, y la inferencia se plantea como un proceso de asimilación de datos basado en score que genera un ensemble finito de trayectorias con dispersión positiva. La generación es conjunta sobre cuatro variables y sobre la dimensión temporal, de modo que la coherencia multivariable y la coherencia temporal no se imponen a posteriori, sino que forman parte del propio proceso generativo.

Los datos de entrenamiento provienen del reanálisis COSMO-REA6 para el periodo 2006-2013. Un aspecto destacable del diseño es que el condicionamiento con campos de modelo climático se aplica únicamente durante la inferencia: el modelo aprende la distribución de alta resolución a partir del reanálisis y luego se usa para downscaling de salidas climáticas. La evaluación del repositorio reporta métricas de RMSE, dispersión (spread), PIT y diferencias temporales, aunque no se proporcionan valores numéricos. No se documenta en la información disponible el uso de RLHF, DPO ni técnicas de alineación, algo esperable en un modelo de este dominio.

## Capacidades

- Downscaling probabilístico: genera ensembles de trayectorias meteorológicas de alta resolución a partir de entradas de baja resolución.
- Generación coherente: modela conjuntamente las variables y la dimensión temporal, evitando inconsistencias entre campos.
- Generación multivariable: reduce de forma conjunta viento, temperatura y presión a nivel del mar (cuatro variables en total, según la especificación del tensor de salida).
- Asimilación de datos basada en score: condiciona la generación en campos de modelo climático en el momento de la inferencia.
- Evaluación integrada: el repositorio incluye scripts que calculan RMSE, spread, PIT y diferencias temporales sobre el ensemble generado.
- Entrenamiento multi-GPU: soporte de entrenamiento multi-proceso mediante `torchrun`.
- Ejecución en CPU para la configuración de prueba (smoke) y en GPU o DCU cuando están disponibles.
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento: no es un modelo de propósito general.

## Casos de uso

- Downscaling climático regional: a partir de la salida de un modelo climático de rejilla gruesa (8x8), generar campos de alta resolución (128x128) que sirvan como entrada a modelos de impacto locales.
- Estudios de impacto y adaptación: producir forzamientos meteorológicos finos para evaluar riesgos de inundación, estrés térmico o recurso eólico a escala regional.
- Generación de ensembles para cuantificación de incertidumbre: el ensemble de 8 miembros con dispersión positiva permite estimar la incertidumbre de la predicción en lugar de ofrecer una única trayectoria determinista.
- Coherencia multivariable en análisis energético: al modelar conjuntamente viento, temperatura y presión, los escenarios generados son utilizables en estudios de demanda eléctrica y generación renovable sin post-procesado de consistencia física.
- Resolución temporal horaria para eventos extremos: la conversión de cadencia semestral (6 h) a horaria permite analizar variabilidad intradiaria relevante para fenómenos de corta duración.
- Reproducción y validación metodológica: el repositorio permite validar el pipeline completo (datos, entrenamiento, inferencia, métricas y visualización) para comparar variantes del método.
- Investigación en modelos generativos aplicados a geociencias: sirve como banco de pruebas para comparar difusión por score frente a otras familias generativas en downscaling.
- Integración en pipelines de asimilación de datos: el condicionamiento en campos de modelo climático permite acoplarlo a flujos operativos de reanálisis y predicción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio indica que el script de evaluación calcula RMSE, dispersión, PIT y diferencias temporales sobre el ensemble generado, pero no se incluyen valores numéricos ni comparaciones cuantitativas con otros métodos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No se especifica el número de parámetros ni el consumo de memoria del modelo.
- GPU recomendadas: no se indica ningún modelo concreto. La model card recomienda usar GPU o DCU cuando estén disponibles.
- CPU: soporta la configuración de prueba por defecto (smoke), pero no se documenta como opción viable para entrenamiento o inferencia completa.
- Entrenamiento multi-GPU: se documenta `torchrun --standalone --nproc_per_node=2 scripts/train.py`, es decir, un mínimo de 2 procesos.
- Opciones de despliegue: no aplican los servidores de inferencia para LLM (vLLM, TGI, Ollama, llama.cpp). El despliegue se realiza mediante los scripts de PyTorch incluidos: `scripts/train.py`, `scripts/inference.py`, `scripts/result.py`.
- Latencia y throughput: no disponibles. No se publican mediciones de tiempo de inferencia ni de generación por ensemble.
- Almacenamiento: los pesos no están incluidos en el repositorio de HuggingFace; deben obtenerse del repositorio oficial de GitHub de los autores.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye resultados comparativos frente a otros métodos de downscaling (por ejemplo, baselines deterministas o generativos), ni especificaciones de modelos alternativos de la misma categoría. No se dispone de datos de parámetros, contexto o rendimiento de alternativas que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Este repositorio es una reproducción de ingeniería independiente de las especificaciones públicas del método, no la implementación oficial, y no reclama compatibilidad con ella.
- Los pesos entrenados no se incluyen en el repositorio (`weight/` está vacío). Para reproducir resultados hay que acudir al repositorio de GitHub de los autores y aceptar sus propios términos.
- Las licencias del artículo original (CC BY 4.0), el código oficial, los pesos y los datos asociados son independientes de la licencia Apache 2.0 de este repositorio; deben revisarse por separado antes de cualquier uso comercial.
- El entrenamiento se realizó con reanálisis COSMO-REA6 de 2006-2013, por lo que el dominio geográfico y temporal del modelo está acotado a la cobertura de esos datos. No se documenta su comportamiento fuera de ese régimen.
- El condicionamiento con campos de modelo climático se aplica solo en inferencia; no hay garantía documentada de generalización a otros modelos climáticos distintos del empleado en el desarrollo.
- El idioma de la documentación es únicamente inglés.
- Riesgo de alucinación en el sentido generativo: al ser un modelo de difusión, puede producir campos plausibles pero físicamente inconsistentes. La model card indica dispersión positiva en el ensemble, pero no se aportan métricas de calibración.
- No se documentan sesgos específicos ni evaluaciones de equidad; en modelos climáticos, el sesgo relevante es el sesgo físico respecto a observaciones, que no se cuantifica aquí.
- No se especifican requisitos de memoria ni tiempos de ejecución, lo que dificulta planificar despliegues en producción.
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo: los enlaces obtenidos corresponden a foros de correo no relacionados.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/OneScience-Group/Climate2Weather
- Artículo (DOI): https://doi.org/10.1038/s41612-025-01157-y — "A Generative Framework for Probabilistic, Spatiotemporally Coherent Downscaling of Climate Simulation"
- Código y pesos oficiales de los autores: https://github.com/schmidtjonathan/Climate2Weather
- Nota: la búsqueda web asociada a esta ficha no devolvió enlaces relevantes adicionales.
