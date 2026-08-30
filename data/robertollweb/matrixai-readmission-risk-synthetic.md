# robertollweb/matrixai-readmission-risk-synthetic

## Resumen

El modelo `robertollweb/matrixai-readmission-risk-synthetic` es un clasificador tabular de demostración, desarrollado por Robert Llweb como parte del ecosistema MatrixAI. Su propósito no es predecir reingresos hospitalarios reales, sino ilustrar de extremo a extremo cómo un modelo puede viajar con la regla que generó sus datos, los resúmenes (digests) de cada artefacto y el entorno de entrenamiento, y cómo a partir de todo ello una herramienta de línea de comandos puede redactar un informe TRIPOD+AI, incluyendo las casillas que el registro no puede rellenar.

Se trata de una red neuronal feed-forward con 4 entradas continuas (edad, días ingresado, número de diagnósticos y reingreso previo) y 2 salidas softmax (alto/bajo riesgo). Todos los datos de entrenamiento son sintéticos: 400 filas generadas por una regla de dos líneas que decide la etiqueta (`alto` si edad > 75 o reingreso_previo > 0.5, si no `bajo`). El modelo se distribuye en formato ONNX, con licencia AGPL-3.0, y está explícitamente marcado como no apto para uso clínico ni como dispositivo médico.

La relevancia de este modelo radica en su enfoque en trazabilidad, reproducibilidad y auditoría, más que en su rendimiento predictivo. Es una pieza de demostración técnica para mostrar cómo MatrixAI permite generar, entrenar, verificar y documentar un modelo con un registro auditable completo, algo poco habitual en el ecosistema de modelos tabulares.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Feed-forward: Dense 32 (ReLU) → Dense 16 (ReLU) → Dense 2 (softmax) |
| Parametros totales | No disponible (red pequeña, del orden de unos pocos cientos de pesos, pero no se publica el número exacto) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo tabular, no secuencial) |
| Tipos de cuantizacion | No disponible (se distribuye en ONNX, sin cuantizaciones publicadas) |
| Idiomas soportados | No disponible (no es un modelo de lenguaje; los datos son numéricos) |
| Licencia | AGPL-3.0 |
| Formato de pesos | ONNX (safetensors no aplica; el repo contiene `modelo.mxai`, `modelo.mxtrain`, `receta.txt` y el paquete exportado) |

## Arquitectura y entrenamiento

La arquitectura es una red neuronal densa de tres capas: una capa oculta de 32 neuronas con activación ReLU, otra de 16 neuronas con ReLU, y una capa de salida de 2 neuronas con softmax. Las entradas son cuatro escalares continuos: `edad` (rango [18, 100]), `dias_ingresado` ([0, 60]), `num_diagnosticos` ([0, 15]) y `reingreso_previo` ([0, 1]). Aunque algunos nombres sugieren variables discretas, el generador muestrea valores continuos, por lo que `num_diagnosticos` puede tomar valores como 2.7471.

El entrenamiento se realiza con datos 100% sintéticos: 400 filas generadas por una regla explícita (`data_recipe.txt`) que decide la etiqueta (`alto` o `bajo`) a partir de solo dos de las cuatro entradas. Las otras dos variables (`dias_ingresado` y `num_diagnosticos`) son ruido por construcción. El flujo de entrenamiento usa comandos de MatrixAI (`matrixai generate-dataset`, `matrixai train`, `matrixai export-bundle`), que generan un manifiesto de datos, entrenan la red y exportan un paquete verificable. El proceso incluye una fase de verificación (`matrixai verify`) que reentrena el modelo desde cero y compara los artefactos con los resúmenes criptográficos del manifiesto.

No se menciona el uso de RLHF, DPO ni otras técnicas de alineación, ya que no es un modelo de lenguaje. La innovación técnica destacable es el sistema de trazabilidad: el modelo viaja con la regla que generó sus datos, los digests de cada artefacto y el entorno de entrenamiento, y un comando puede redactar automáticamente un informe TRIPOD+AI.

## Capacidades

- Clasificación tabular binaria: predice una probabilidad sobre dos etiquetas (`alto` y `bajo`) a partir de cuatro variables de entrada.
- Reproducibilidad completa: el mismo conjunto de comandos regenera el dataset, entrena el modelo y verifica el paquete exportado.
- Trazabilidad auditable: cada decisión de predicción es trazable a un nodo nombrado en el grafo de cómputo, declarado en el archivo `.mxai`.
- Generación de informes TRIPOD+AI: el comando `matrixai report` produce un registro en formato Markdown con las secciones que el registro puede rellenar y las que no.
- Verificación de integridad: el comando `matrixai verify` reentrena el modelo y compara los artefactos con el manifiesto, detectando cualquier discrepancia (por ejemplo, ficheros no declarados).
- No soporta generación de texto, razonamiento, código, visión ni tool calling: es un modelo tabular puro, no un LLM.

## Casos de uso

- Demostración de trazabilidad en IA clínica: el modelo sirve como caso de estudio para mostrar cómo un modelo puede documentar su origen, su regla de datos y su entorno de entrenamiento, algo crítico en entornos regulados. Se usaría como ejemplo didáctico en talleres o documentación técnica.
- Validación de pipelines de reproducibilidad: los comandos de MatrixAI permiten verificar que un paquete exportado se puede reconstruir exactamente desde los artefactos originales, útil para equipos que necesitan auditar sus flujos de MLOps.
- Evaluación de herramientas de generación de informes regulatorios: el comando `matrixai report` produce un informe TRIPOD+AI, lo que permite probar cómo una herramienta automatizada rellena (o deja en blanco) las secciones de un registro de IA clínica.
- Formación en auditoría de modelos: al ser un modelo pequeño y de datos sintéticos, es un banco de pruebas seguro para enseñar conceptos de verificación de integridad, manifiestos y digests sin riesgo de usar datos reales de pacientes.
- Prueba de concepto de IA auditable en entornos sanitarios simulados: el modelo puede integrarse en un entorno de demostración (por ejemplo, un sandbox) para ilustrar cómo se despliega un clasificador con un registro de auditoría completo, aunque sin validez clínica.
- Comparación de flujos de exportación e importación: el paquete `.zip` generado por `matrixai export-bundle` permite probar la portabilidad de un modelo ONNX con sus metadatos y reglas, útil para equipos que evalúan estándares de empaquetado de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que se midió una `accuracy` en una partición de validación del mismo dataset sintético, pero no se proporciona el valor numérico. No hay comparaciones con otros modelos.

## Requisitos de hardware

- El modelo es extremadamente pequeño (una red de 3 capas densas con 4 entradas), por lo que la inferencia se ejecuta en CPU sin necesidad de GPU.
- No se requiere VRAM; el modelo ONNX ocupa unos pocos kilobytes.
- Cualquier GPU moderna (incluso integrada) es más que suficiente, aunque no es necesaria.
- Opciones de despliegue: ONNX Runtime, o los comandos de MatrixAI (`matrixai export-bundle` y `matrixai verify`). No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia: despreciable en CPU (del orden de microsegundos por inferencia), aunque no se publican cifras exactas.
- El entrenamiento tampoco requiere GPU: el propio README indica que no se necesita GPU.

## Comparativa con modelos similares

No disponible. Al ser un modelo de demostración con datos sintéticos y una arquitectura mínima, no hay modelos comparables en la misma categoría (clasificadores tabulares con trazabilidad TRIPOD+AI). Se podrían comparar con clasificadores tabulares genéricos (por ejemplo, XGBoost o regresión logística), pero no se dispone de datos de rendimiento ni de implementaciones equivalentes en el contexto de MatrixAI.

## Limitaciones y advertencias

- No es un dispositivo médico ni un sistema de ayuda a la decisión clínica. No tiene aprobación regulatoria de ningún tipo.
- Los datos de entrenamiento son 100% sintéticos, generados por una regla de dos líneas escrita por una persona. No hay ningún paciente real involucrado.
- No hay validación clínica: no existe cohorte, sitio, periodo de tiempo ni validación externa o temporal.
- Dos de las cuatro variables de entrada (`dias_ingresado` y `num_diagnosticos`) son ruido por construcción: la regla que genera las etiquetas no las utiliza, y no se publica ninguna atribución o explicación de lo que la red hizo con ellas.
- La probabilidad de salida no es un riesgo calibrado: no se calcula calibración en ningún punto del paquete.
- El paquete exportado solo proporciona predicciones; las acciones permanecen en modo `simulate_only`.
- La licencia AGPL-3.0 implica obligaciones de copyleft si se modifica o se integra en servicios que se distribuyan. Para uso comercial, se debe revisar el cumplimiento de la licencia.
- Riesgo de alucinación: no aplica directamente (no es un modelo generativo), pero sí hay riesgo de interpretar erróneamente las predicciones como clínicamente significativas. El propio README insiste en que "una probabilidad aquí no es un riesgo calibrado".
- El proceso de verificación tiene sutilezas: verificar el directorio recién construido (en lugar del ZIP) puede dar resultados `INCOMPARABLE` si quedan ficheros residuales como `datos/` o `__pycache__`. Se debe usar una copia limpia.

## Enlaces

- HuggingFace: https://huggingface.co/robertollweb/matrixai-readmission-risk-synthetic
- Repositorio GitHub del proyecto MatrixAI: https://github.com/robertollweb/matrixAI
- Perfil de GitHub del autor: https://github.com/robertollweb
- Paquete PyPI `matrixai-core`: https://pypi.org/project/matrixai-core/
- Sitio web del proyecto (casos de uso): https://matrixaistudio.org/casos (sección clínica)
- Referencia externa sobre predicción de riesgo de reingreso (no relacionada directamente con este modelo, pero contexto del problema): https://www.sciencedirect.com/science/article/pii/S2666389921002622 y https://pmc.ncbi.nlm.nih.gov/articles/PMC12187041/
