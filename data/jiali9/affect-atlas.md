# Jiali9/Affect-Atlas

## Resumen

Affect-Atlas es un repositorio de investigación que acompaña a un borrador de artículo sobre calibración de salida con pocas etiquetas para regresión de emoción musical. No se trata de un modelo con pesos descargables, sino de un paquete que contiene el manuscrito, las figuras y el código fuente de una demo local. El autor, identificado como Jiali9, lo publica como material de acompañamiento para reproducir y revisar el estudio, no como un artefacto listo para producción.

El trabajo se centra en un problema concreto: adaptar un predictor de valencia y activación (valence-arousal) entrenado en el conjunto DEAM a un dominio distinto (PMEmo) con un presupuesto de etiquetado muy reducido, de 5 o 10 canciones. La propuesta metodológica es una calibración de salida sobre representaciones musicales congeladas de MERT, y el resultado principal reportado es una reducción media del 13,50 % en el error cuadrático medio de arousal cuando se aplica un desplazamiento de media intensidad únicamente a esa dimensión.

Su relevancia ahora es metodológica más que de producto: documenta un protocolo de comparación preespecificado, analiza la estabilidad del pool de adaptación y delimita el alcance de las conclusiones. Es útil para investigadores en computación afectiva y recuperación musical que trabajen en adaptación de dominio con pocas etiquetas, pero no ofrece un modelo entrenado que pueda desplegarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Representaciones musicales congeladas de MERT con cabeza de predicción de emoción (regresión valencia-arousal) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; procesa clips de audio) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la interfaz de la demo está en chino; el manuscrito en inglés) |
| Licencia | no disponible |
| Formato de pesos | no se distribuyen pesos; el repositorio contiene manuscrito, figuras y código fuente |

## Arquitectura y entrenamiento

El sistema descrito combina un extractor de representaciones musicales MERT congelado con una cabeza de predicción de emoción entrenada sobre el conjunto DEAM. Sobre esa base se aplica una etapa de calibración de salida en el dominio objetivo (PMEmo), usando únicamente 5 o 10 canciones etiquetadas. La comparación primaria preespecificada emplea 10 canciones etiquetadas y un desplazamiento de media intensidad aplicado solo a arousal, evaluado sobre 334 representantes fijos de grupos de riesgo.

El manuscrito y los apéndices documentan los roles de cada conjunto de datos, las comparaciones completas y la estabilidad del pool de adaptación. No se especifican en la información disponible el número de tokens ni la composición del dataset de entrenamiento, ni si hubo RLHF o DPO (no aplica en un modelo de regresión). Tampoco se detallan innovaciones como decodificación especulativa o atención lineal, ya que no es un modelo generativo de texto.

## Capacidades

- Predicción global de valencia y activación a partir de clips de audio musical.
- Puntuaciones exploratorias con ventanas de 10 segundos y salto de 5 segundos.
- Sincronización con la reproducción de audio en la demo.
- Exportación de resultados en JSON y CSV.
- Calibración de salida en el dominio objetivo con presupuestos de 5 o 10 canciones etiquetadas (desactivada por defecto en la demo).
- Interfaz React/TypeScript en chino y backend FastAPI separado para CPU.
- No incluye tool calling, function calling, soporte de agentes ni capacidades multilingües declaradas.
- No incluye modo de razonamiento, visión ni audio generativo.

## Casos de uso

- Investigación en computación afectiva: reproducir el protocolo de calibración de salida con pocas etiquetas sobre MERT y DEAM/PMEmo para validar o refutar el resultado del 13,50 % de reducción de MSE en arousal.
- Adaptación de dominio con presupuesto de etiquetado mínimo: usar el código como plantilla para calibrar un predictor de emoción musical ya entrenado cuando solo se dispone de 5 o 10 canciones anotadas del nuevo corpus.
- Evaluación metodológica: emplear los 334 representantes fijos de grupos de riesgo y el análisis de estabilidad del pool de adaptación como referencia para diseñar comparaciones preespecificadas en estudios propios.
- Demo docente o de laboratorio: desplegar el backend FastAPI en CPU para mostrar predicciones valencia-arousal sobre clips subidos, con curvas por ventana y exportación de resultados.
- Análisis exploratorio de catálogos musicales: generar puntuaciones por ventana de 10 segundos para inspeccionar la evolución emocional dentro de una canción, asumiendo que las curvas no constituyen reconocimiento dinámico validado segundo a segundo.
- Base para publicación y revisión por pares: reutilizar el manuscrito, figuras y apéndices como esqueleto de un artículo sobre calibración de salida en regresión afectiva.

## Benchmarks y rendimiento

| Metrica | Resultado reportado |
|---|---|
| Reducción media de MSE en arousal (calibración con 10 canciones, desplazamiento de media intensidad solo en arousal) | 13,50 % sobre 334 representantes fijos de grupos de riesgo |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estándar, ya que el sistema no es un modelo de lenguaje. Tampoco se detallan métricas de valencia, coeficientes de correlación ni comparaciones numéricas completas con líneas base.

## Requisitos de hardware

- Inferencia en CPU: el backend FastAPI está diseñado para ejecutarse en CPU, según la documentación de la demo.
- VRAM estimada: no disponible; depende de los pesos de MERT y de la cabeza de predicción, que deben prepararse tras clonar el repositorio.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible.
- Opciones de despliegue: backend FastAPI en CPU y frontend React/TypeScript; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Nota: los pesos del modelo, el audio de muestra, los entornos virtuales y `node_modules` están excluidos del repositorio; los activos reales deben prepararse después de clonar.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de regresión de emoción musical ni datos de rendimiento de alternativas como DEAM, PMEmo o modelos basados en MERT en otros repositorios.

## Limitaciones y advertencias

- No se distribuyen pesos del modelo, datos de entrenamiento, audio de muestra ni demo alojada; el repositorio tiene 0,0 GB y no es ejecutable sin preparar los activos.
- El manuscrito es un borrador en inglés sin información de autoría, plantilla de revista objetivo ni declaraciones formales de envío.
- Las curvas por ventana provienen de un modelo estático y no representan reconocimiento dinámico de emoción validado segundo a segundo.
- La calibración en el dominio objetivo está desactivada por defecto en la demo.
- El audio comercial de canciones y los datos brutos de los experimentos no se distribuyen.
- La licencia no está disponible, por lo que no puede confirmarse el uso comercial.
- El alcance de las pruebas automatizadas y de las comprobaciones reales de ejecución en CPU se documenta en archivos separados (`code/VALIDATION.md` y `code/TIMELINE_UPGRADE-20261012.md`), lo que sugiere cobertura limitada.
- No hay información sobre sesgos, riesgo de alucinación ni limitaciones idiomáticas, ya que no es un modelo generativo de texto.
- Los resultados reportados (13,50 % de reducción de MSE) corresponden a una comparación preespecificada concreta y no deben extrapolarse sin replicación.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Jiali9/Affect-Atlas
- Manuscrito (paper): `manuscript_en.md` dentro del repositorio
- Versión HTML del manuscrito: `manuscript_en.html`
- Versión editable en Word: `manuscript_en.docx`
- Figuras y pies de figura: `figures/captions.md`
- Código de la demo: `code/README.md`
- Validación: `code/VALIDATION.md`
- Actualización de la línea temporal: `code/TIMELINE_UPGRADE-20261012.md`
