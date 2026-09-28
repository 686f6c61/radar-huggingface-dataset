# impacte/laya-medical-escalation

## Resumen

Laya Medical Escalation es un modelo de clasificación de texto desarrollado por el usuario impacte, consistente en un ajuste fino de `convaiinnovations/laya` (421 millones de parámetros, encoder ModernBERT-large más cabeza de decisión tipada) para asignar el nivel del Emergency Severity Index (ESI 1-5) a partir de un registro de triaje de urgencias. El modelo es no autorregresivo: puntúa cada nivel ESI en su propio marcador `[MASK]` y aplica softmax sobre los niveles en una sola pasada forward, devolviendo una distribución calibrada en lugar de texto libre. Con 421.293.830 parámetros y un repositorio de 0,8 GB en safetensors, está pensado como artefacto de investigación y no como producto sanitario.

El problema que aborda es la asignación de acuidad en triaje, una tarea subjetiva y dependiente de la población, donde el error peligroso es el infratriaje (asignar un nivel menos urgente que el real). El modelo se entrena con RLCD (GRPO combinado con una regla de puntuación estrictamente propia y entropía cruzada suave) y pesos de clase por frecuencia inversa, sobre el dataset de triaje del Yale School of Medicine (560.486 visitas desidentificadas × 972 variables). Su relevancia actual es doble: por un lado, demuestra que un encoder de 421M con cabeza de decisión supera a LLM locales de mayor tamaño en esta tarea concreta (0,6860 de accuracy frente a 0,4333 de `gemma4:e4b`), y por otro, sirve como referencia metodológica para calibrar decisiones clínicas.

La licencia es Apache-2.0, heredada de Laya. La model card incluye un aviso explícito: no es un dispositivo médico y no debe usarse para triaje, diagnóstico ni decisiones de cuidado de pacientes reales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT-large (encoder) + cabeza de decisión de 2 capas + scorer de marcadores de opción |
| Parametros totales | 421.293.830 (~421M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (el dataset de entrenamiento está en inglés) |
| Licencia | Apache-2.0 (heredada de Laya) |
| Formato de pesos | safetensors (`library_name: laya`) |
| Modelo base | `convaiinnovations/laya` |
| Tarea | `text-classification` / `choice` sobre ESI 1-5 |
| Tamaño del repositorio | 0,8 GB |
| Latencia declarada | ~22,87 ms p50, petición única, RTX 5060 Ti |

## Arquitectura y entrenamiento

La arquitectura combina un encoder ModernBERT-large con una cabeza de decisión de dos capas y un scorer de marcadores de opción. El modelo es no autorregresivo: en lugar de generar texto, coloca un marcador `[MASK]` por cada nivel ESI candidato, puntúa cada uno de ellos y aplica un softmax sobre los cinco niveles en una única pasada forward. Esto produce una distribución de probabilidad calibrada sobre ESI 1-5 y explica su latencia de ~23 ms p50, muy inferior a la de los LLM generativos evaluados (173,5 ms para `gemma4:e4b`, 943,9 ms para el modelo Qwen de 27B en cuantización IQ4, 2.538,9 ms para MiniCPM-2B en bf16).

El entrenamiento utiliza RLCD, una combinación de GRPO con una regla de puntuación estrictamente propia (strictly proper scoring rule) y entropía cruzada suave, más pesos de clase por frecuencia inversa para compensar el desbalance de clases. Los datos proceden del dataset de triaje de urgencias del Yale School of Medicine (Hong WS, Haimovich AD, Taylor RA, PLOS ONE 13(7): e0201016, 2018): 560.486 visitas de urgencias desidentificadas con 972 variables. El estado de entrada es un texto construido únicamente con campos disponibles en el momento del triaje: motivo de consulta (a partir de 200 one-hots de motivos), constantes vitales de triaje (frecuencia cardíaca, presión arterial, frecuencia respiratoria, SpO2, temperatura), edad, sexo, modo de llegada, visitas previas a urgencias, disposición previa y número de medicamentos ambulatorios. El espejo en HuggingFace utilizado es `kondratevakate/hospital-triage-and-patient-history-data` (rehost sin pérdida de RData a Parquet).

## Capacidades

- Clasificación de acuidad en cinco niveles ESI (1 a 5) a partir de un registro textual de triaje.
- Salida de distribución de probabilidad calibrada por nivel, no texto libre (ECE de 0,0223 en la evaluación balanceada de 2.500 filas).
- Inferencia no autorregresiva en una sola pasada forward, con latencia de ~23 ms p50 en RTX 5060 Ti.
- Puntuación por marcadores de opción sobre criterios ESI definidos en el prompt, sin necesidad de ejemplos few-shot (el modelo base zero-shot obtiene 0,2133 de accuracy frente a 0,6860 del ajustado).
- Manejo de texto clínico estructurado en plantilla: constantes vitales numéricas, edad, sexo, modo de llegada y antecedentes de visitas.
- No dispone de soporte de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No dispone de capacidades de visión, audio ni modo "thinking".
- Capacidades multilingües: no disponible; el entrenamiento se realizó sobre registros en inglés.

## Casos de uso

- Investigación sobre modelos de triaje clínico: el modelo sirve como referencia reproducible para estudiar la asignación automática de ESI, con métricas publicadas de accuracy (0,6860), macro-F1 (0,6829) y ECE (0,0223) sobre un split fijo.
- Evaluación comparativa de LLM en tareas clínicas: el mismo conjunto de 300 filas retenidas se usó para medir LLM locales, por lo que el modelo actúa como línea base cuantitativa frente a sistemas generativos en una tarea de decisión estructurada.
- Estudio de calibración y reglas de puntuación propia: al devolver una distribución softmax explícita, permite analizar curvas de calibración, ECE y umbrales de decisión sin depender de parseo de texto generado.
- Análisis del error de infratriaje: con una tasa de infratriaje global de 0,1564 y de 0,1890 en pacientes de alta acuidad (ESI 1-2), es útil para cuantificar el coste asimétrico de los errores en modelos de decisión clínica.
- Enseñanza de arquitecturas encoder con cabeza de decisión: el ejemplo de uso (carga con `laya.load`, diccionario de criterios ESI y llamada `router.predict`) es directamente ejecutable como material docente sobre clasificación calibrada.
- Comparación de paradigmas de modelado tabular frente a texto: el modelo se comparó con XGBoost sobre 970 columnas (accuracy 0,6136) y sobre 214 características derivadas de Laya (0,6072), lo que permite estudiar si una representación textual de los datos de triaje aporta ventaja frente a features tabulares.
- Simulación de flujos de urgencias: en entornos sintéticos de investigación operativa se puede usar para generar etiquetas de acuidad sobre registros simulados, siempre fuera de cualquier uso asistencial real.
- Reproducción de la línea base determinista: su comparación con la implementación parcial del algoritmo ESI v5 (accuracy 0,4176) permite cuantificar la brecha entre reglas clínicas explícitas y modelos aprendidos.

## Benchmarks y rendimiento

Evaluación retenida, 2.500 filas balanceadas por clase (azar = 0,20):

| Accuracy | Macro-F1 | Infratriaje ↓ | Dentro de ±1 nivel | MAE ordinal | ECE ↓ | Latencia p50 |
|---|---|---|---|---|---|---|
| 0,6860 | 0,6829 | 0,1564 | 0,9476 | 0,3852 | 0,0223 | 22,87 ms |

Desglose por nivel ESI:

| Nivel ESI | Precision | Recall | F1 | Soporte |
|---|---|---|---|---|
| esi-1 | 0,769 | 0,860 | 0,812 | 500 |
| esi-2 | 0,666 | 0,570 | 0,614 | 500 |
| esi-3 | 0,618 | 0,566 | 0,591 | 500 |
| esi-4 | 0,621 | 0,674 | 0,646 | 500 |
| esi-5 | 0,742 | 0,760 | 0,751 | 500 |

Comparación con LLM locales sobre las mismas 300 filas retenidas:

| Sistema | Accuracy | Macro-F1 | Infratriaje ↓ | Latencia p50 |
|---|---|---|---|---|
| Laya Medical Escalation | 0,7033 | 0,6978 | 0,1600 | 22,8 ms |
| gemma4:e4b | 0,4333 | 0,4279 | 0,3933 | 173,5 ms |
| qwen3.8-27b:iq4-xs-64k-text-q4kv | 0,3233 | 0,3347 | 0,2925 | 943,9 ms |
| minicpm-2b:bf16 | 0,2967 | 0,2880 | 0,4735 | 2.538,9 ms |
| Aleatorio | 0,2200 | 0,2175 | 0,3733 | — |
| Siempre esi-3 | 0,2000 | 0,0667 | 0,4000 | — |
| laya-base (zero-shot) | 0,2133 | 0,1336 | 0,2533 | 23,6 ms |

Los LLM recibieron un presupuesto de 192 tokens y un parser que elimina envoltorios de thinking o tool-call, según indica la model card.

Líneas base sobre el mismo dataset y el mismo split:

| Método | Características | Accuracy | Macro-F1 | Infratriaje ↓ | Infratriaje alta acuidad ↓ | MAE ordinal |
|---|---|---|---|---|---|---|
| Laya Medical Escalation | plantilla de texto | 0,6860 | 0,6829 | 0,1564 | 0,1890 | 0,3852 |
| XGBoost (laya) | 214 | 0,6072 | 0,5969 | 0,1624 | 0,2730 | 0,5016 |
| XGBoost (full) | 970 | 0,6136 | 0,6018 | 0,1524 | 0,2650 | 0,5116 |
| ESI v5 determinista (full) | reglas de motivo de consulta + constantes | 0,4176 | 0,3963 | 0,2724 | 0,5820 | 0,752 |

La model card advierte que el modelo determinista es la implementación parcial del algoritmo clínico ESI v5 y que el dataset no contiene campos de recursos, dolor ni estado mental, por lo que su resultado es una cota inferior.

## Requisitos de hardware

- VRAM estimada: en FP32, aproximadamente 1,7 GB de pesos; en FP16/BF16, unos 0,85 GB; en INT8, unos 0,42 GB, más el overhead de activaciones, que es reducido al tratarse de un encoder de 421M con una única pasada forward.
- Cabe holgadamente en GPU de consumo: la latencia declarada de 22,87 ms p50 se midió en una RTX 5060 Ti. También es viable en RTX 4090, RTX 3090, RTX 4060 Ti y tarjetas con 8 GB o menos.
- GPU de datacenter: A100, H100 o L40S son suficientes y probablemente sobredimensionadas para una sola petición; su interés estaría en el batching a gran escala.
- Inferencia en CPU: no se documenta latencia ni throughput en CPU; dado el tamaño, es plausible, pero no hay dato disponible.
- Opciones de despliegue: la vía documentada es la librería `laya` mediante `laya.load("impacte/laya-medical-escalation")`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y el carácter no autorregresivo con cabeza de decisión y scorer de marcadores hace que los runners genéricos de texto no sean directamente aplicables.
- Throughput: no disponible. Solo se publica latencia p50 de una petición única.
- Latencia comparada: 22,8 ms frente a 23,6 ms del modelo base zero-shot, 173,5 ms de `gemma4:e4b`, 943,9 ms del Qwen 27B en IQ4 y 2.538,9 ms de MiniCPM-2B en bf16.

## Comparativa con modelos similares

| Sistema | Parámetros | Contexto | Accuracy (300 filas) | Macro-F1 | Infratriaje ↓ | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Laya Medical Escalation | 421M | No disponible | 0,7033 | 0,6978 | 0,1600 | Apache-2.0 | HuggingFace, librería `laya` |
| gemma4:e4b | No disponible | No disponible | 0,4333 | 0,4279 | 0,3933 | No disponible | LLM local evaluado en la model card |
| qwen3.8-27b:iq4-xs-64k-text-q4kv | ~27B (etiqueta) | No disponible | 0,3233 | 0,3347 | 0,2925 | No disponible | LLM local cuantizado en IQ4 |
| minicpm-2b:bf16 | ~2B | No disponible | 0,2967 | 0,2880 | 0,4735 | No disponible | LLM local en bf16 |
| XGBoost (full) | No aplica | No aplica | 0,6136 (2.500 filas) | 0,6018 | 0,1524 | No disponible | Script propio, 970 features |
| ESI v5 determinista | No aplica | No aplica | 0,4176 (2.500 filas) | 0,3963 | 0,2724 | No disponible | Reglas clínicas |

La comparación directa solo es válida dentro de cada tabla, ya que la de LLM usa 300 filas y las de Laya y XGBoost usan 2.500 filas retenidas. No se dispone de comparativas con la versión base `convaiinnovations/laya` en otras tareas ni con otros clasificadores clínicos publicados.

## Limitaciones y advertencias

- No es un dispositivo médico y no debe usarse para triaje, diagnóstico ni decisiones asistenciales sobre pacientes reales. La model card lo declara explícitamente como artefacto de investigación y educación.
- Riesgo de infratriaje: la tasa global es de 0,1564 y la de alta acuidad (ESI 1-2) de 0,1890. Un infratriaje en producción implicaría clasificar como menos urgente a un paciente que lo es, con riesgo de daño grave.
- Sesgo de población: la acuidad es subjetiva y dependiente de la población; el modelo se entrenó con datos históricos de una única institución (Yale School of Medicine), por lo que puede no generalizar a otras poblaciones, protocolos o sistemas de triaje.
- Limitación de variables de entrada: el dataset carece de campos de recursos, dolor y estado mental, por lo que el modelo no puede aplicar la lógica completa de ESI y su comportamiento difiere del algoritmo clínico v5.
- La evaluación principal se hizo sobre un conjunto balanceado por clase (500 filas por nivel), lo que no refleja la distribución real de un servicio de urgencias; el rendimiento en la clase esi-2 es el más débil (recall 0,570, F1 0,614).
- Riesgo de alucinación: no aplica en el sentido generativo, porque el modelo no produce texto libre, pero sí existe riesgo de calibración incorrecta en registros fuera de distribución.
- Idiomas: no se declara ningún idioma soportado y el entrenamiento es en inglés; el comportamiento en castellano u otros idiomas no está evaluado.
- Licencia: Apache-2.0 permite uso comercial del modelo, pero el dataset subyacente exige citación y prohíbe su redistribución, lo que restringe la reproducibilidad y el reentrenamiento.
- El repositorio no tiene descargas ni likes registrados y fue creado el 27 de septiembre de 2026, por lo que no existe historial de uso en producción ni validación independiente.
- No se documenta longitud de contexto, tipos de cuantización, ni soporte en runners estándar, lo que complica su integración en infraestructuras existentes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/impacte/laya-medical-escalation
- Modelo base: https://huggingface.co/convaiinnovations/laya
- Paper del dataset (Yale School of Medicine, triaje de urgencias): Hong WS, Haimovich AD, Taylor RA. "Predicting hospital admission at emergency department triage using machine learning". PLOS ONE 13(7): e0201016 (2018). DOI: https://doi.org/10.1371/journal.pone.0201016
- Espejo del dataset en HuggingFace: https://huggingface.co/datasets/kondratevakate/hospital-triage-and-patient-history-data
- Búsqueda web: los resultados obtenidos corresponden exclusivamente a entradas de diccionarios franceses sobre el término "impacte" (Larousse, Le Robert, Wiktionnaire, Projet Voltaire) y no guardan relación con el modelo. No se han encontrado en la búsqueda papers, blogs, repositorios ni demos adicionales relevantes.
