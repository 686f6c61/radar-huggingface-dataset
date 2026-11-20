# pyaging/zhangen

## Resumen

Zhangen es un reloj epigenético de regresión elastic net publicado en 2019 por Zhang, Vallerga, Walker et al. en *Genome Medicine*, y distribuido en Hugging Face a través del paquete `pyaging`. No es un modelo de lenguaje ni una red neuronal profunda: es un predictor lineal regularizado que estima la edad cronológica de un individuo a partir de los niveles de metilación de ADN en 514 islas CpG seleccionadas, entrenado sobre uno de los conjuntos multi-cohorte más amplios disponibles en su momento y aplicable a sangre completa y saliva.

Su relevancia actual es práctica: los relojes epigenéticos son herramientas estándar en investigación del envejecimiento, y `pyaging` los empaqueta con una API uniforme (`pya.pred.predict_age`) para que puedan aplicarse de forma reproducible sobre matrices de metilación preprocesadas. Zhangen destaca frente a relojes de primera generación (Horvath, Hannum) por su mayor precisión en la estimación de edad y por cubrir varios tejidos con un único modelo.

El repositorio es de tamaño 0.0 GB en la información disponible y acumula 1598 descargas. La licencia del wrapper es MIT, pero los pesos conservan los términos de los autores originales, lo que condiciona el uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Regresión elastic net (modelo lineal regularizado) |
| Parámetros totales | 514 coeficientes CpG más intercepto (no disponible el recuento exacto de términos) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada tabular de metilación, no secuencial) |
| Tipos de cuantización | no disponible (coeficientes en precisión nativa; no se documentan variantes) |
| Idiomas soportados | no aplica (no procesa texto) |
| Licencia | MIT para el software; pesos sujetos a los términos de los autores originales |
| Formato de pesos | no disponible (integrado en el paquete `pyaging`; tamaño de repo 0.0 GB) |

## Arquitectura y entrenamiento

El modelo es una regresión elastic net sobre 514 sondas CpG, una combinación de penalización L1 y L2 que selecciona variables y encoge coeficientes de forma conjunta. La entrada es un vector de valores de metilación (típicamente beta-values) para esas 514 posiciones del genoma; la salida es una edad cronológica estimada en años. No hay capas ocultas, atención ni mecanismo de contexto: la predicción es una suma ponderada de los niveles de metilación más un término independiente.

El entrenamiento se realizó sobre el que los autores describen como el mayor conjunto multi-cohorte de su momento, con datos predominantemente de sangre completa y saliva. La selección de las 514 CpG se produce dentro del propio ajuste regularizado. El objetivo declarado del trabajo original es mejorar la precisión de las estimaciones de relojes epigenéticos entre tejidos y explorar su implicación en el envejecimiento biológico. No se documentan en la información disponible detalles sobre número de muestras, plataformas de array utilizadas, ni procedimientos de validación cruzada.

## Capacidades

- Predicción de edad cronológica en *Homo sapiens* a partir de datos de metilación de ADN.
- Aplicable a sangre completa y saliva con un único modelo.
- Selección de 514 CpG mediante regularización elastic net, lo que reduce la dimensionalidad frente a arrays completos (450K o EPIC).
- Integración con el ecosistema `pyaging` mediante `pya.pred.predict_age(adata, ["zhangen"])` sobre objetos AnnData.
- Descubrimiento y comparación con otros relojes del catálogo de pyaging.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto: es un predictor estadístico de una sola salida.
- No tiene capacidades multilingües ni modo de razonamiento.

## Casos de uso

- Estudios de envejecimiento poblacional: aplicar el reloj a cohortes con metilación de sangre para obtener una estimación de edad cronológica y calcular desviaciones (edad epigenética menos edad real) como proxy de envejecimiento biológico acelerado.
- Control de calidad en biobancos: detectar muestras cuyo valor de metilación produce una edad predicha incompatible con la edad registrada, lo que puede indicar intercambio de muestras o errores de anotación.
- Análisis de saliva en estudios no invasivos: al estar entrenado también con saliva, permite estimaciones en cohortes pediátricas o de campo donde la extracción sanguínea no es viable.
- Comparación de relojes en pipelines de investigación: usar pyaging para ejecutar zhangen junto a otros relojes sobre la misma matriz AnnData y evaluar concordancia entre predictores.
- Ajuste de covariables en estudios epigenómicos: incluir la edad epigenética estimada como covariable en modelos de asociación para controlar el envejecimiento celular.
- Reproducibilidad de análisis publicados: replicar resultados de estudios que citan el reloj de Zhang et al. 2019 sin reimplementar los coeficientes desde cero.
- Filtrado previo en estudios longitudinales: seleccionar subconjuntos con envejecimiento epigenético extremo para análisis de seguimiento con técnicas más costosas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de error (MAE, correlación con edad cronológica) ni comparaciones numéricas con otros relojes.

## Requisitos de hardware

- Inferencia en CPU: el modelo es una suma ponderada de 514 términos, ejecutable en cualquier CPU moderna en microsegundos por muestra.
- VRAM: no requiere GPU; 0 GB de VRAM dedicada.
- GPU recomendadas: no aplica. Cualquier GPU sirve únicamente si el pipeline de preprocesamiento de metilación la aprovecha.
- Cabe en cualquier hardware consumer, incluidos Raspberry Pi y entornos sin acelerador.
- Despliegue: paquete Python `pyaging` sobre AnnData; no requiere vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada; por la naturaleza del modelo, el cuello de botella será el preprocesamiento de los arrays de metilación, no la predicción.

## Comparativa con modelos similares

| Modelo | Tipo | CpG | Tejidos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Zhangen (este) | Elastic net | 514 | Sangre, saliva | MIT (software); pesos con términos de autores | Hugging Face vía pyaging |
| Horvath 2013 (reloj pan-tejido) | Elastic net | 353 | Múltiples tejidos | no disponible en esta información | No disponible en esta información |
| Hannum 2013 | Elastic net | 71 | Sangre | no disponible en esta información | No disponible en esta información |
| PhenoAge (Levine 2018) | Elastic net | 513 | Sangre | no disponible en esta información | No disponible en esta información |

Los datos de los modelos alternativos no provienen de la información proporcionada para esta ficha y deben verificarse en sus fuentes originales antes de usarse en una comparación formal.

## Limitaciones y advertencias

- Predice edad cronológica, no edad biológica; interpretar la desviación como medida directa de envejecimiento requiere cautela.
- Entrenado en sangre completa y saliva: la aplicación a otros tejidos no está validada y puede producir sesgos sistemáticos.
- Depende críticamente del preprocesamiento (normalización, imputación, corrección de lotes); cambios en el pipeline alteran las predicciones.
- Requiere que las 514 CpG estén presentes en la plataforma utilizada; arrays incompatibles o con sondas faltantes obligan a imputación.
- Sesgo poblacional: la composición del conjunto multi-cohorte condiciona la calibración por ancestría y grupo de edad; no se documenta en la información disponible la diversidad de las muestras.
- Licencia: el software pyaging es MIT, pero los pesos mantienen los términos de los autores originales; verificar condiciones antes de uso comercial.
- No es un dispositivo médico ni sustituye diagnóstico clínico alguno.
- Riesgo de sobreajuste a las cohortes de entrenamiento en poblaciones con características epigenéticas atípicas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pyaging/zhangen
- Catálogo de relojes pyaging: https://pyaging.readthedocs.io
- Artículo original: Zhang, Q., Vallerga, C.L., Walker, R.M. et al. *Improved precision of epigenetic clock estimates across tissues and its implication for biological ageing*. Genome Medicine 11, 54 (2019). https://doi.org/10.1186/s13073-019-0667-1
