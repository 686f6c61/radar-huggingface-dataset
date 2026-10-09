# hsilvosa/BETO-ATC-Classifier

## Resumen

BETO-ATC-Classifier es un modelo de clasificación de texto en español desarrollado por el usuario hsilvosa, pensado para asignar el grupo anatómico de nivel 1 del sistema ATC (Anatomical Therapeutic Chemical) a partir de la descripción textual de un medicamento: nombre, dosis, forma farmacéutica, principios activos y vía de administración. Se trata de un problema de clasificación single-label con 14 clases posibles, correspondientes a los grupos anatómicos principales del nivel 1 del ATC.

El modelo es un fine-tuning de `dccuchile/bert-base-spanish-wwm-cased` (BETO), el encoder BERT en español preentrenado con enmascaramiento de palabras completas sobre un corpus en castellano. Cuenta con 109.861.646 parámetros y un repositorio de 0,4 GB en formato safetensors. No modela los niveles 2 a 5 del ATC, solo el nivel 1.

Su relevancia radica en que aborda una tarea de normalización farmacéutica muy concreta sobre datos abiertos de la AEMPS-CIMA, con una evaluación honesta: se reporta una precisión top-1 del 79,3 % sobre un conjunto de test separado por conjunto de principios activos (sin solapamiento de combinaciones respecto a entrenamiento), lo que evita el optimismo inflado de particiones aleatorias. Está licenciado bajo Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional tipo BERT base, fine-tuning de `dccuchile/bert-base-spanish-wwm-cased` (BETO) |
| Parámetros totales | 109.861.646 |
| Longitud de contexto | 512 tokens (valor heredado de la arquitectura BERT base; no se documenta explícitamente en la model card) |
| Tipos de cuantización | no disponible (el repositorio no publica versiones cuantizadas) |
| Idiomas soportados | español (es) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tarea | Text classification (single-label, 14 clases de nivel 1 ATC) |
| Modelo base | dccuchile/bert-base-spanish-wwm-cased |
| Dataset de entrenamiento | hsilvosa/aemps-cima |
| Tamaño del repositorio | 0,4 GB |

## Arquitectura y entrenamiento

La arquitectura es la de BETO, es decir, un transformer encoder bidireccional basado en BERT base en su variante en español con whole word masking y sensibilidad a mayúsculas (cased). Sobre esa base se ha realizado un fine-tuning para clasificación de secuencias, sustituyendo la cabeza original por una capa de clasificación de 14 salidas correspondientes a los grupos anatómicos de nivel 1 del ATC. El código de entrenamiento se referencia en el repositorio como `src/train_atc_classifier.py`.

El entrenamiento se ha realizado sobre el dataset `hsilvosa/aemps-cima`, derivado de datos de medicamentos de la AEMPS-CIMA. El modelo consume una descripción textual que combina nombre, dosis, forma farmacéutica, principios activos y vía. La partición de evaluación se hizo por conjunto de principios activos, de modo que ninguna combinación de principios activos presente en el test aparece en entrenamiento; esto da una medida más realista de generalización que una partición aleatoria por filas. No se detalla en la model card el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de RLHF o DPO (no disponibles), algo esperable en un modelo de clasificación y no generativo.

## Capacidades

- Clasificación de texto en español orientada a descripciones de medicamentos.
- Predicción de una única etiqueta entre 14 clases (grupo anatómico de nivel 1 del ATC), con probabilidades por clase vía softmax.
- Manejo de descripciones que incluyen nombre comercial o genérico, dosis, forma farmacéutica y principios activos.
- Capacidad de generalizar a combinaciones de principios activos no vistas durante el entrenamiento, gracias al diseño de la partición de evaluación.
- Salida con distribución de probabilidad sobre las 14 clases, lo que permite obtener alternativas (top-3 con un 87,7 % de acierto).
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento explícito: es un clasificador, no un modelo generativo.

## Casos de uso

- Normalización de catálogos farmacéuticos: procesar de forma masiva las fichas de medicamentos de una base de datos interna y asignar automáticamente el grupo anatómico ATC de nivel 1 para homogeneizar registros y facilitar búsquedas por categoría terapéutica.
- Enriquecimiento de datos abiertos de la AEMPS-CIMA: dada una tabla de presentaciones de medicamentos con texto descriptivo, completar una columna con el grupo ATC nivel 1 previsto, usando la confianza por clase para revisar solo los casos dudosos.
- Investigación farmacoepidemiológica: agrupar grandes volúmenes de prescripciones o descripciones por grupo anatómico antes de análisis estadísticos, reduciendo el trabajo manual de codificación preliminar.
- Preanotación para codificación humana: servir como primer paso en un flujo donde un codificador farmacéutico revisa y corrige las predicciones, aprovechando el top-3 (87,7 %) para ofrecer candidatos alternativos.
- Filtrado y segmentación de corpus médicos: clasificar documentos o registros textuales en grupos terapéuticos amplios para construir subconjuntos temáticos destinados a búsqueda o análisis.
- Control de calidad de datos: detectar registros cuyo grupo ATC asignado manualmente no coincide con el predicho por el modelo, señalando posibles errores de codificación que requieran revisión.
- Sistemas internos de analítica de datos farmacéuticos: integrar el modelo como microservicio (por ejemplo, con FastAPI y Transformers o ONNX Runtime) para etiquetar descripciones en tiempo casi real dentro de pipelines de datos.
- Evaluación comparativa de modelos: servir como referencia en pruebas de clasificación de texto médico en español, dado que publica métricas sobre una partición de test no aleatoria.

## Benchmarks y rendimiento

Resultados publicados en la model card, sobre un conjunto de test de 7996 filas (2518 textos únicos), particionado por conjunto de principios activos:

| Métrica | Valor |
|---|---|
| Precisión top-1 | 79,3 % |
| Precisión top-3 | 87,7 % |
| F1 macro | 0,691 |

Notas sobre la evaluación aportadas por el autor: solo se ejecutó una semilla de partición, por lo que se desconoce la variación entre semillas. La clase P (antiparasitarios, 143 filas en total) no tiene filas en el test y no se mide. Una partición aleatoria por filas daría en torno al 99,9 % de precisión porque casi todos los textos de test aparecen también en entrenamiento, cifra que no debe interpretarse como generalización.

No se incluyen comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32 el modelo ocupa aproximadamente 440 MB de pesos; en fp16 unos 220 MB; en int8 unos 110 MB. Con activaciones y batch pequeño, el consumo total se mantiene en el rango de 1-2 GB.
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM es suficiente. Modelos como RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sin problema, aunque están sobredimensionados para este tamaño de modelo.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo reciente, e incluso en CPU para inferencia por lotes con latencias aceptables.
- Opciones de despliegue: Transformers (PyTorch) como referencia directa, y de forma habitual ONNX Runtime, TorchServe o FastAPI para servir el endpoint. Los servidores orientados a modelos generativos (vLLM, TGI) pueden alojar encoders BERT, aunque no es su caso de uso principal; llama.cpp u Ollama requerirían una conversión a GGUF que el repositorio no publica.
- Latencia y throughput: no disponibles (no se publican mediciones de rendimiento en la información proporcionada).

## Comparativa con modelos similares

No se dispone de datos publicados sobre clasificadores ATC de nivel 1 comparables en la información proporcionada. La comparación más directa disponible es con el modelo base del que deriva.

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hsilvosa/BETO-ATC-Classifier | 109.861.646 | 512 tokens (heredado de BERT base) | Clasificación ATC nivel 1 (14 clases) | Apache 2.0 | HuggingFace |
| dccuchile/bert-base-spanish-wwm-cased (BETO) | ~110 M | 512 tokens | Modelo de lenguaje enmascarado / base para fine-tuning | Apache 2.0 | HuggingFace |
| Otros clasificadores ATC en español con métricas publicadas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo solo predice el nivel 1 del ATC; los niveles 2 a 5 no están modelados.
- La clase P (antiparasitarios) no tiene filas en el conjunto de test, por lo que su rendimiento no está medido ni validado.
- Solo se ejecutó una semilla de partición en la evaluación; se desconoce la variabilidad entre semillas.
- El F1 macro (0,691) es notablemente inferior a la precisión top-1 (79,3 %), lo que indica un rendimiento desigual entre clases: las clases minoritarias probablemente se predicen peor.
- Riesgo de sobreajuste a los textos concretos del dataset AEMPS-CIMA: el propio autor advierte que una partición aleatoria por filas produce cifras infladas (en torno al 99,9 %) porque las presentaciones de un mismo medicamento repiten texto.
- La predicción se basa en la descripción textual y no sustituye a la clasificación oficial de la AEMPS.
- Uso previsto limitado a investigación médica y analítica de datos farmacéuticos; no debe emplearse para prescripción clínica ni asesoramiento médico.
- No se documentan sesgos específicos, pero al entrenarse sobre un corpus de medicamentos español puede presentar sesgos derivados de la cobertura del catálogo CIMA y de la sobrerrepresentación de determinados grupos terapéuticos.
- Licencia Apache 2.0, que permite uso comercial, pero las restricciones de uso previsto declaradas por el autor desaconsejan aplicaciones clínicas directas.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que implica escasa validación externa por parte de la comunidad.
- No se han publicado mediciones de latencia, throughput ni pruebas de robustez ante entradas ruidosas o fuera de dominio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hsilvosa/BETO-ATC-Classifier
- Modelo base BETO: https://huggingface.co/dccuchile/bert-base-spanish-wwm-cased
- Dataset de entrenamiento: https://huggingface.co/datasets/hsilvosa/aemps-cima
- Código de entrenamiento: `src/train_atc_classifier.py` (referenciado en la model card; no se ha localizado URL pública en la información disponible)
- Fuente de datos AEMPS-CIMA: no disponible como enlace directo en la información proporcionada
- Paper o blog asociado: no disponible
