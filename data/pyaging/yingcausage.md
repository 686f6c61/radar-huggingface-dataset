# pyaging/yingcausage

## Resumen

yingcausage es un reloj epigenetico (aging clock) basado en metilacion de ADN, desarrollado por el equipo de Ying et al. y empaquetado para su uso dentro de la libreria pyaging. Predice la edad cronologica de muestras de sangre completa de Homo sapiens a partir de perfiles de metilacion, empleando una regresion elastic net ponderada por causalidad: los CpGs se priorizan mediante un analisis de mediacion (EWMR, epigenome-wide mediation regression) y cada caracteristica recibe una penalizacion especifica derivada de su puntuacion de causalidad. El modelo se publico en Nature Aging en 2024.

El modelo no es un modelo de lenguaje ni una red neuronal profunda: es un modelo estadistico lineal regularizado, con un numero de parametros no disponible publicamente y sin longitud de contexto en el sentido habitual de los LLM. Su relevancia radica en que separa los componentes de dano y adaptacion en el envejecimiento epigenetico, una innovacion metodologica frente a los relojes epigeneticos clasicos de primera y segunda generacion.

La integracion en pyaging permite invocarlo con una sola llamada sobre un objeto AnnData, lo que facilita su uso en pipelines bioinformaticos de investigacion sobre envejecimiento. La licencia del codigo es MIT, pero los pesos conservan los terminos de los autores originales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion elastic net ponderada por causalidad (modelo lineal regularizado) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada = vector de valores de metilacion de CpGs) |
| Tipos de cuantizacion | no disponible (no aplica; pesos de precision estandar) |
| Idiomas soportados | no disponible (no aplica; no procesa texto) |
| Licencia | MIT (codigo); los pesos conservan los terminos de los autores originales |
| Formato de pesos | no disponible (empaquetado para la libreria pyaging; tamano del repo 0.0 GB) |

## Arquitectura y entrenamiento

El modelo es una regresion elastic net con penalizaciones especificas por caracteristica, derivadas de puntuaciones de causalidad calculadas mediante EWMR (epigenome-wide mediation regression). Esta formulacion prioriza los CpGs que actuan como mediadores causales en el envejecimiento, en lugar de seleccionar caracteristicas unicamente por correlacion con la edad cronologica, que es el enfoque de los relojes epigeneticos convencionales.

El entrenamiento se realizo sobre datos de metilacion de ADN de sangre completa en humanos, con la edad cronologica como variable objetivo. El numero de tokens de entrenamiento, la composicion exacta del dataset y los detalles de validacion no estan disponibles en la informacion proporcionada. La innovacion tecnica principal es la descomposicion del reloj en componentes de dano y adaptacion, descrita en la publicacion de Nature Aging (2024).

## Capacidades

- Prediccion de edad cronologica a partir de perfiles de metilacion de ADN de sangre completa en humanos.
- Ponderacion de caracteristicas por causalidad, lo que permite interpretar que CpGs contribuyen de forma causal al envejecimiento.
- Desacoplamiento de los efectos de dano y adaptacion en la estimacion de la edad biologica.
- Integracion directa en pyaging mediante `pya.pred.predict_age(adata, ["yingcausage"])`.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues; no es un modelo generativo.

## Casos de uso

- Investigacion en envejecimiento: estimar la edad cronologica de cohortes con datos de metilacion de sangre completa y comparar la desviacion respecto a la edad biologica en estudios longitudinales.
- Analisis de intervenciones: evaluar si una intervencion (dieta, ejercicio, farmacos) altera los componentes de dano o adaptacion del reloj epigenetico en ensayos clinicos.
- Estudios de asociacion epigenetica: utilizar las puntuaciones de causalidad del modelo para priorizar CpGs candidatos en analisis de mediacion.
- Reproducibilidad bioinformatica: integrar el reloj en pipelines basados en AnnData y pyaging para estandarizar el calculo de edades epigeneticas entre estudios.
- Control de calidad de datos de metilacion: comparar la prediccion del modelo con la edad cronologica declarada para detectar muestras anomalas o mal etiquetadas.
- Docencia y prototipado: disponer de un reloj epigenetico causal reproducible con una licencia permisiva (MIT) para experimentos academicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas comparativas de error absoluto medio (MAE), correlacion de Pearson ni comparaciones con otros relojes epigeneticos.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo es una regresion lineal con pesos de tamano reducido (repo de 0.0 GB) y se ejecuta en CPU.
- GPU recomendadas: no necesarias; cualquier CPU convencional es suficiente.
- Cabe en GPU consumer: si, aunque no es necesario.
- Opciones de despliegue: libreria pyaging sobre Python, con entrada en formato AnnData.
- Latencia y throughput estimados: no disponibles; dependen del tamano de la matriz de metilacion de entrada.

## Comparativa con modelos similares

| Modelo | Tipo | Predictor | Especie/tejido | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yingcausage | Elastic net ponderada por causalidad | Edad cronologica | Homo sapiens / sangre completa | MIT (codigo) | Hugging Face, pyaging |
| Relojes epigeneticos de primera generacion (p. ej. Horvath) | Regresion penalizada | Edad cronologica | Multiples tejidos | No disponible en esta ficha | No disponible en esta ficha |
| Relojes epigeneticos de segunda generacion (p. ej. PhenoAge, GrimAge) | Regresion penalizada | Edad biologica / mortalidad | Sangre | No disponible en esta ficha | No disponible en esta ficha |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; como todo reloj epigenetico, puede verse afectado por la composicion celular de la sangre y por caracteristicas demograficas de la cohorte de entrenamiento.
- Riesgo de alucinacion: no aplica en el sentido de los modelos generativos, pero la prediccion puede desviarse de la edad real en muestras fuera de la distribucion de entrenamiento.
- Limitaciones de contexto o idioma: el modelo solo acepta datos de metilacion de ADN de sangre completa en Homo sapiens; no procesa texto ni otros tejidos segun la model card.
- Restricciones de licencia: el codigo es MIT, pero los pesos conservan los terminos de los autores originales; es necesario revisar dichos terminos antes de un uso comercial.
- Caveat para produccion: no es un dispositivo medico ni una herramienta de diagnostico; su uso debe limitarse a investigacion. La ausencia de benchmarks publicados en la informacion disponible impide validar su rendimiento frente a alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pyaging/yingcausage
- Catalogo de relojes de pyaging: https://pyaging.readthedocs.io
- Publicacion: Ying, K., Liu, H., Tarkhov, A.E. et al. Causality-enriched epigenetic age uncouples damage and adaptation. Nature Aging 4, 231–246 (2024). https://doi.org/10.1038/s43587-023-00557-0
