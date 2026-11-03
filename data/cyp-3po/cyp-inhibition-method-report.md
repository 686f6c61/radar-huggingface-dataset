# cyp-3po/cyp-inhibition-method-report

## Resumen

`cyp-3po/cyp-inhibition-method-report` es un repositorio de HuggingFace que documenta la metodología de una participación en el track de predicción por regresión del OpenADMET CYP Inhibition Challenge. No contiene pesos de un modelo de lenguaje ni un pipeline de inferencia publicable: es un informe técnico preliminar de un ensemble de modelos de grafos orientado a predecir la inhibición de isoenzimas del citocromo P450 (CYP1A2, CYP2C9, CYP2D6 y CYP3A4), una familia de dianas clave en la evaluación ADMET de candidatos farmacológicos.

El autor (`cyp-3po`) reporta un ensemble de 76 checkpoints independientes de tipo MolE (graph transformer) distribuidos en seis brazos arquitectónicamente heterogéneos, combinados por endpoint y con calibración de localización y dispersión frente a los retornos del propio leaderboard. El resultado macro reportado es un MA-ST-RAE de 0,4048, con valores por endpoint entre 0,3469 (CYP2C9) y 0,4666 (CYP2D6), y correlaciones de Spearman entre 0,543 (CYP2D6) y 0,863 (CYP3A4).

Es relevante ahora por dos motivos: primero, porque el desafío OpenADMET aborda un cuello de botella real en el descubrimiento de fármacos (la predicción temprana de interacciones metabólicas y riesgo de inhibición enzimática); segundo, porque el repositorio es explícitamente un informe en curso, con la model card indicando que el informe completo sustituirá la página antes del cierre del reto. Cualquier evaluación técnica debe tratar los datos como preliminares y no reproducibles a partir de este repositorio.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de 76 checkpoints MolE (graph transformer) en seis brazos arquitectónicamente heterogéneos, combinados por endpoint |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; modelo de grafos moleculares) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica; entrada molecular, no texto) |
| Licencia | MIT |
| Formato de pesos | no disponible (el repositorio es un informe de método, no se publican pesos) |

## Arquitectura y entrenamiento

La información disponible describe un ensemble de 76 checkpoints entrenados de forma independiente sobre una arquitectura MolE, un graph transformer orientado a representaciones moleculares. Los checkpoints se agrupan en seis brazos arquitectónicamente heterogéneos y se combinan mediante un proceso de *splicing* por endpoint, es decir, la combinación final no es un promedio global único sino una selección o mezcla específica para cada una de las cuatro isoenzimas objetivo (CYP1A2, CYP2C9, CYP2D6 y CYP3A4). Sobre esa combinación se aplica una calibración de localización y dispersión ajustada contra los retornos del leaderboard del desafío.

No se especifican en la información proporcionada el número de tokens ni el volumen del dataset de entrenamiento, la composición exacta de los datos, el uso de RLHF/DPO (no aplicable en un contexto de regresión molecular) ni detalles de aumentación o *featurización*. Tampoco se documentan innovaciones como decodificación especulativa o atención lineal, que no tienen sentido en este dominio. La model card indica explícitamente que el informe completo, incluyendo datos, arquitectura, ensemble, calibración, resultados negativos y limitaciones, está en proceso de finalización.

## Capacidades

- Predicción de regresión de inhibición de cuatro isoenzimas del citocromo P450: CYP1A2, CYP2C9, CYP2D6 y CYP3A4.
- Modelado de propiedades ADMET a partir de estructura molecular mediante graph transformers (MolE).
- Ensemble heterogéneo con combinación por endpoint (*splicing*), lo que permite adaptar la mezcla a la dificultad específica de cada diana.
- Calibración de las predicciones frente a la distribución de retornos del leaderboard, orientada a mejorar la métrica ST-RAE.
- Estimación de ranking relativo de compuestos vía correlación de Spearman (reportada por endpoint).
- No se documentan capacidades de generación de texto, código, matemáticas, visión, audio, tool calling ni razonamiento multi-paso; no es un modelo de lenguaje.

## Casos de uso

- Filtrado temprano en cribado virtual: usar el ensemble para priorizar compuestos con baja probabilidad de inhibición de CYP1A2, CYP2C9, CYP2D6 y CYP3A4 antes de ensayos in vitro, reduciendo el coste de la fase de hit-to-lead.
- Evaluación de riesgo de interacciones farmacológicas: estimar el potencial de inhibición enzimática de candidatos para anticipar problemas de metabolismo conjunto con fármacos coadministrados.
- Priorización de series químicas: aplicar las predicciones por endpoint para decidir qué series de análogos avanzar, usando la correlación de Spearman reportada (0,543–0,863) como indicador de capacidad de ordenación.
- Análisis de selectividad: comparar las predicciones entre las cuatro isoenzimas para detectar compuestos con perfil de inhibición amplio o selectivo, informando decisiones de diseño molecular.
- Benchmarking interno de metodologías ADMET: emplear el informe y las métricas reportadas como referencia para evaluar pipelines propios de graph transformers en tareas de regresión molecular.
- Reproducción metodológica en investigación: servir de base documental para equipos que quieran replicar un esquema de ensemble heterogéneo con calibración frente a leaderboard en competiciones de quimioinformática.
- Docencia y formación en ADMET computacional: ilustrar cómo se estructura un ensemble multi-brazo y cómo se reporta el rendimiento por endpoint en un reto abierto.

## Benchmarks y rendimiento

Resultados reportados por el autor para el track de regresión del OpenADMET CYP Inhibition Challenge (métrica ST-RAE, menor es mejor; Spearman ρ, mayor es mejor):

| Endpoint | ST-RAE | Spearman ρ |
|---|---:|---:|
| CYP1A2 | 0,4339 | 0,820 |
| CYP2C9 | 0,3469 | 0,862 |
| CYP2D6 | 0,4666 | 0,543 |
| CYP3A4 | 0,3718 | 0,863 |
| Macro (MA-ST-RAE) | 0,4048 | no disponible |

No se han publicado en la información disponible resultados comparativos con otros modelos ni cifras de referencia del leaderboard para contextualizar estos valores.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio no publica pesos ni tamaño de los checkpoints MolE, por lo que no es posible estimar requisitos de memoria.
- GPU recomendadas: no disponible. Un ensemble de 76 checkpoints de graph transformer requeriría, en principio, agregar la memoria de cada modelo, pero se desconoce el tamaño individual.
- Viabilidad en GPU de consumo: no determinable con los datos disponibles.
- Opciones de despliegue: no disponible. No se documenta compatibilidad con vLLM, llama.cpp, Ollama, TGI ni con frameworks de inferencia molecular como PyTorch Geometric o DGL.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos ADMET, ni resultados de referencia del leaderboard, ni repositorios alternativos con los que contrastar parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- El repositorio es un informe de método preliminar, no un artefacto desplegable: no se publican pesos, tokenizador ni scripts de inferencia.
- La model card indica que el contenido completo (datos, arquitectura, ensemble, calibración, resultados negativos y limitaciones) se publicará antes del cierre del reto; los datos actuales pueden cambiar.
- El rendimiento en CYP2D6 es notablemente inferior al resto (ST-RAE 0,4666 y Spearman 0,543 frente a 0,820–0,863 en las otras tres isoenzimas), lo que sugiere menor fiabilidad en esa diana.
- La calibración se ajusta contra los retornos del leaderboard del desafío, lo que puede introducir sobreajuste a la distribución de evaluación de la competición y no garantiza generalización a datos prospectivos.
- No hay información sobre sesgos de dominio: composición del dataset de entrenamiento, cobertura química, desbalance entre clases de inhibidores y no inhibidores, o representatividad de espacios químicos industriales.
- Riesgo de alucinación no aplicable en el sentido de modelos generativos, pero sí riesgo de predicciones sobreconfiadas en regiones del espacio químico poco representadas en entrenamiento.
- Licencia MIT declarada, lo que en principio permite uso comercial del contenido del repositorio, pero al no haber pesos publicados la aplicabilidad práctica de la licencia queda limitada al texto y la metodología.
- No se documentan limitaciones de idioma porque el modelo no procesa texto; la ausencia de esa información no debe interpretarse como soporte multilingüe.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/cyp-3po/cyp-inhibition-method-report
- OpenADMET CYP Inhibition Challenge: no disponible en la información proporcionada
- Paper o publicación asociada: no disponible en la información proporcionada
- Repositorio de código: no disponible en la información proporcionada
- Demo o espacio interactivo: no disponible en la información proporcionada
