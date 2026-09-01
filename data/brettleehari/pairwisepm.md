# brettleehari/PairwisePM

## Resumen

PairwisePM es una herramienta de decisión pairwise para productos de IA generativa, desarrollada por Hariprasad Sudharshan (brettleehari) y publicada bajo licencia MIT. No se trata de un modelo de lenguaje ni de una red neuronal, sino de un motor de regresión logística Bradley-Terry que compara dos ideas de producto GenAI en una misma sesión y devuelve un ganador, una probabilidad de victoria con intervalo de confianza y los factores concretos que podrían cambiar el veredicto. Su objetivo es eliminar la variabilidad de las decisiones de producto: el mismo responsable, las mismas dos ideas, el mismo resultado cada día.

La herramienta funciona con dos modos: `1→N` para asignación de recursos en un producto establecido y `0→1` para búsqueda de product-market fit. Los pesos de los factores se definen explícitamente en archivos YAML como política editable, y el runtime no utiliza ningún LLM ni llamadas de red: solo numpy y PyYAML. Esto la hace completamente offline, auditable y sin dependencias externas. Su relevancia actual radica en la creciente necesidad de procesos de decisión estructurados y reproducibles en el desarrollo de productos con IA generativa, donde los costes de inferencia y la viabilidad técnica son variables críticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Motor de regresion logistica Bradley-Terry con pesos configurables en YAML |
| Parametros totales | No disponible (no es un modelo de parametros; los pesos son politicas explicitas en configuracion) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (no procesa texto en runtime) |
| Tipos de cuantizacion | No aplica (no hay pesos de red neuronal) |
| Idiomas soportados | No disponibles (la interfaz y la documentacion estan en ingles) |
| Licencia | MIT |
| Formato de pesos | YAML (configs/*.yaml) y codigo Python (paquete pairwisepm) |

## Arquitectura y entrenamiento

PairwisePM no es un modelo entrenado en el sentido convencional. Su arquitectura se compone de un motor de regresion logistica ridge Bradley-Terry que combina factores de entrada (por ejemplo, viabilidad de capacidad, economia unitaria, exposicion a la trayectoria de capacidades) con pesos definidos por el usuario en archivos YAML. Estos pesos actuan como prioris explicitos y editables, no como valores ajustados. El sistema opera en dos niveles: M0, que puntua con los pesos declarados desde el primer dia, y M1, que se activa a partir de la decima decision registrada y ajusta un modelo de regresion logistica ridge "del juez", encogido hacia los pesos declarados, para revelar la politica real del usuario frente a la declarada. No hay datos de entrenamiento externos ni fase de ajuste de pesos mediante backpropagation; el unico "entrenamiento" es el ajuste de M1 sobre las decisiones historicas del propio usuario, almacenadas en un archivo JSONL local. El runtime no emplea LLM, API ni conexiones de red.

## Capacidades

- Comparacion pairwise de dos ideas de producto GenAI en una sola pantalla y sesion.
- Dos modos de decision: `1→N` (asignacion de recursos en producto establecido) y `0→1` (busqueda de product-market fit), cada uno con un esquema de factores especifico para IA generativa.
- Calculo de probabilidad de victoria con intervalo de confianza del 90% mediante bootstrap sobre los factores.
- Deteccion de "demasiado reñido para decidir" cuando el intervalo cruza el 50%, evitando forzar un ganador.
- Panel de apalancamiento: contribuciones firmadas por factor, camino hacia la paridad en unidades brutas (entrevistas, semanas-persona, pasos de tasa de aprobacion) propuesto solo a traves de factores `lever` y dentro de rangos plausibles.
- Bandera de fragilidad cuando el margen depende de una estimacion blanda.
- Registro local de decisiones en JSONL con esquema versionado, incluyendo huella de configuracion (sha256) para auditorias por version de politica.
- Acumulacion de metricas de transitivity (ζ) y Brier score desde la primera decision.
- Capacidad de subir un log previo para restaurar el historial y la vista de auditoria.
- Sin dependencia de LLM, API ni servidor en tiempo de decision; ejecucion completamente offline.

## Casos de uso

- Priorizacion de features en un producto GenAI existente: el modo `1→N` permite comparar dos propuestas de mejora (por ejemplo, reducir latencia de inferencia frente a anadir un nuevo modo de salida) y obtener una recomendacion con intervalo de confianza, basada en factores como economia unitaria y viabilidad tecnica.
- Evaluacion de ideas para una startup de IA: el modo `0→1` estructura la busqueda de product-market fit, aunque no hace ninguna afirmacion de precision sobre el exito; sirve para organizar hipotesis y decidir que experimento ejecutar primero.
- Revision de decisiones de producto en equipos: al registrar cada decision con su configuracion y resultado, el equipo puede auditar retrospectivamente si sus prioris declarados coinciden con sus decisiones reales (via M1) y ajustar la politica en consecuencia.
- Optimizacion de costes de inferencia: el esquema de factores incluye economia unitaria frente a coste de inferencia, permitiendo comparar opciones de despliegue (por ejemplo, modelo pequeno vs. grande) con un criterio cuantitativo.
- Gestion de cartera de proyectos de IA: la bandera de "techo 0→1" redirige a juicio humano de cartera, evitando que el modelo puntue decisiones que requieren criterio estrategico.
- Formacion de product managers: al usar la herramienta con datos de ejemplo (`decisions.sample.jsonl`), los PM pueden aprender a descomponer decisiones complejas en factores evaluables y a interpretar intervalos de incertidumbre.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La herramienta no presenta metricas de rendimiento comparativas con otros sistemas, ya que su funcion no es predictiva en el sentido clasico de los modelos de IA, sino de apoyo a la decision con pesos explicitos.

## Requisitos de hardware

- No requiere GPU ni hardware especializado; funciona en cualquier CPU moderna.
- Dependencias minimas: numpy y PyYAML para el motor; gradio como extra opcional para la interfaz de usuario.
- Ejecucion local completamente offline: `pip install .[app]` y `python app.py`.
- La interfaz Gradio puede desplegarse en un Space de Hugging Face sin almacenamiento en servidor (los datos se guardan localmente en el cliente).
- Latencia y throughput: al no haber inferencia de red neuronal, la respuesta es practicamente instantanea, limitada solo por el calculo de bootstrap sobre los factores (tipicamente milisegundos).

## Comparativa con modelos similares

No disponible. No se han identificado herramientas comparables en la informacion proporcionada. PairwisePM ocupa un nicho especifico de decision estructurada para productos GenAI, sin equivalentes directos en el ecosistema de modelos de IA generativa.

## Limitaciones y advertencias

- El modo `0→1` no hace ninguna afirmacion de precision sobre el exito de una idea; solo estructura la busqueda. La interfaz muestra un aviso permanente no descartable al respecto.
- Los pesos de los factores son una politica declarada por el usuario, no valores aprendidos de datos externos. Si la politica es sesgada, las decisiones lo reflejaran.
- El modelo M1 se ajusta a las decisiones del propio usuario, por lo que puede perpetuar sesgos personales si no se revisan las metricas de transitivity y Brier.
- No hay datos de entrenamiento ni validacion externa; la herramienta no ha sido evaluada contra resultados reales de mercado.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantias de exactitud ni soporte.
- El registro de decisiones es responsabilidad del usuario; si no se descarga el JSONL, los datos se pierden al cerrar la sesion.
- La documentacion y la interfaz estan en ingles; no se ha confirmado soporte multilingue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/brettleehari/PairwisePM
- Perfil del autor en Hugging Face: https://huggingface.co/brettleehari
- Perfil del autor en GitHub: https://github.com/brettleehari
- Repositorio del autor (con enlaces a proyectos): https://github.com/brettleehari/brettleehari
