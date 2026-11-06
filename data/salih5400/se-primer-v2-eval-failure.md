# Salih5400/se-primer-v2-eval-failure

## Resumen

`Salih5400/se-primer-v2-eval-failure` no es un modelo de IA: es un repositorio de Hugging Face que documenta el fallo de la puerta de evaluacion de un experimento de clasificacion binaria. El autor, Salih5400, lo publica de forma explicita como "registro de eval fallido" y advierte que no contiene artefacto ejecutable (`model.onnx`, `config.json` ni model card funcional). El objetivo original del experimento era predecir, a partir de cinco caracteristicas de juego, si un jugador elegiria la opcion de riesgo (`riskli_secim`) en el escenario "Primer".

La relevancia de esta ficha es metodologica, no tecnica en el sentido habitual: muestra un caso de gobernanza de modelos en el que el autor decide no publicar un candidato que no supero un umbral predefinido, en lugar de ajustar el umbral a posteriori. El "modelo" subyacente es un pipeline clasico de scikit-learn (StandardScaler + LogisticRegression con pesos de clase balanceados), no una red neuronal ni un transformer, y no dispone de pesos publicados.

Por tanto, los campos de especificaciones de arquitectura de LLM (parametros, contexto, cuantizacion, idiomas) no son aplicables y se marcan como no disponibles. Esta ficha documenta el contenido real del repositorio y sus implicaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline clasico de scikit-learn: StandardScaler + LogisticRegression con `class_weight='balanced'` |
| Parametros totales | no disponible (no se publican pesos ni coeficientes) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (clasificador tabular sobre 5 caracteristicas) |
| Tipos de cuantizacion | no aplica (no hay artefacto ONNX ni pesos) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ninguno publicado; el autor indica que `model.onnx` y `config.json` no se generaron |
| Tarea | Clasificacion binaria tabular (prediccion de eleccion de riesgo) |
| Semilla | 13 (fija) |
| Umbral de decision | 0.55 (fijo, predefinido) |
| Version de Python | 3.12 (segun instrucciones de reproduccion) |

## Arquitectura y entrenamiento

El candidato evaluado no es un modelo de lenguaje sino un clasificador binario tabular construido sobre scikit-learn. La receta declarada es `StandardScaler` seguido de `LogisticRegression` con ponderacion de clases equilibrada y semilla fija 13. La entrada son cinco caracteristicas de juego y la salida es la probabilidad de que el jugador marque la opcion de riesgo en la escena del escenario "Primer".

Los datos consisten en 66 sesiones de juego anonimas, con 198 filas de decision tras deduplicar por la clave `(session_id, decision_id)`. La distribucion de etiquetas es de 112 elecciones seguras y 86 elecciones de riesgo. Segun el autor, los datos provienen de 7 participantes amigos, aunque el CSV no registra el numero de participantes. La validacion se realizo con `GroupKFold` de 5 pliegues agrupando por `session_id`, y la puerta de calidad predefinida exigia balanced accuracy >= 0.65 y recall de la clase de riesgo >= 0.70.

No hubo RLHF, DPO ni entrenamiento neuronal. Tampoco se describe ningun tipo de aumento de datos ni ajuste de hiperparametros mas alla de la receta fija. La innovacion metodologica, si se puede llamar asi, es la disciplina de gobernanza: el autor documenta el fallo y detiene la publicacion en lugar de reajustar el umbral tras ver los resultados.

## Capacidades

- No hay capacidades de generacion de texto, razonamiento, codigo, matematicas ni vision: no existe artefacto de modelo.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues: no es un modelo de lenguaje.
- La unica "capacidad" documentada es la de clasificar una decision binaria a partir de cinco caracteristicas tabulares, y esa capacidad fallo la puerta de calidad.
- El repositorio conserva el registro del fallo (matriz de confusion, metricas, semilla y umbral) como material de auditoria reproducible.

## Casos de uso

- Auditoria de gobernanza de modelos: usar este repositorio como ejemplo documentado de como detener la publicacion de un candidato que no supera umbrales predefinidos, sin reajustar el umbral a posteriori.
- Docencia en evaluacion de modelos: mostrar a estudiantes como se define una puerta de calidad (balanced accuracy y recall por clase), como se calcula con `GroupKFold` y como se interpreta una matriz de confusion.
- Revision de metodologia de validacion: analizar el caso en el que `GroupKFold` agrupa por sesion y no por persona, y discutir por que eso no constituye evidencia de generalizacion independiente del participante.
- Plantilla de reproducibilidad: reutilizar el `spec.md`, el `train.py` y el `requirements-ml.txt` como esqueleto para experimentos tabulares con validacion agrupada.
- Analisis de clases desbalanceadas: estudiar el efecto de `class_weight='balanced'` y de un umbral fijo de 0.55 sobre el recall de la clase minoritaria (0.256 en este caso).
- Referencia para politicas de publicacion de modelos: citar el repositorio como precedente de que un "modelo fallido" puede publicarse como registro de evaluacion sin distribuir artefactos ejecutables.

## Benchmarks y rendimiento

Los unicos resultados publicados son las metricas de la evaluacion interna del propio candidato, no comparaciones con modelos de referencia.

| Metrica | Valor | Umbral predefinido | Resultado |
|---|---|---|---|
| Balanced accuracy | 0.525 | >= 0.65 | No supera |
| Recall clase de riesgo (1) | 0.256 | >= 0.70 | No supera |
| Matriz de confusion (real 0/1 x pred 0/1) | [[89, 23], [64, 22]] | no disponible | no disponible |
| Filas de evaluacion | 198 (66 sesiones) | no disponible | no disponible |
| Distribucion de etiquetas | 112 seguras / 86 de riesgo | no disponible | no disponible |

No se han publicado resultados de benchmarks externos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, y no tendria sentido aplicarlos a un clasificador tabular sin artefacto.

## Requisitos de hardware

- VRAM para inferencia: no aplica; no hay artefacto de modelo que cargar.
- GPU recomendadas: no aplica; el entrenamiento y la evaluacion se ejecutan en CPU con scikit-learn.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue: no hay despliegue posible; el autor indica que el manifiesto del modelo esta desactivado en la aplicacion de GitHub Pages y que la aplicacion permanece en flujo estatico seguro.
- Reproduccion local: Python 3.12 con `requirements-ml.txt` y ejecucion de `python train.py`; el resultado esperado es que el script informe del fallo de la puerta y se detenga sin generar artefactos.
- Latencia y throughput: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

No disponible. No existen modelos comparables en el sentido habitual porque este repositorio no distribuye un modelo. Como referencia de categoria metodologica, se puede contrastar con practicas de publicacion de modelos fallidos, pero no se dispone de datos de benchmarks ni de artefactos de terceros en la informacion proporcionada.

| Criterio | Este repositorio | Alternativa tipica de clasificador tabular publicado |
|---|---|---|
| Artefacto de modelo | No | Si (ONNX, pickle, etc.) |
| Licencia | No disponible | Habitualmente declarada |
| Metricas de evaluacion | Si (balanced accuracy 0.525, recall 0.256) | Habitualmente si |
| Reproducibilidad | Si (`train.py`, `spec.md`, datos CSV) | Variable |
| Uso en produccion | No recomendado por el autor | Depende del caso |

## Limitaciones y advertencias

- No es un modelo utilizable: el autor advierte explicitamente que no debe usarse para inferencia.
- Sesgos conocidos: la muestra procede de 7 participantes amigos del autor, sin registro del numero de participantes en el CSV; la validacion agrupa por sesion, no por persona, por lo que el mismo participante puede aparecer en pliegues distintos y la evaluacion no constituye evidencia de generalizacion independiente del participante.
- Riesgo de alucinacion: no aplica en el sentido de LLM, pero el repositorio no debe interpretarse como un modelo funcional ni citarse como tal.
- Limitaciones de contexto o idioma: no aplica; es un clasificador tabular.
- Restricciones de licencia: la licencia no esta declarada, por lo que no se puede asumir uso comercial ni redistribucion.
- Caveat de produccion: el autor indica que no se debe extraer ningun juicio, calificacion ni perfil de riesgo sobre personas a partir de estos resultados.
- Caveat metodologico: el umbral de 0.55 y la puerta de calidad se fijaron antes de ver los resultados; el autor documenta que no los reajusto, lo que refuerza la validez del registro de fallo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el 6 de noviembre de 2026.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Salih5400/se-primer-v2-eval-failure
- Repositorio de la tarea en GitHub: https://github.com/Salih5400/se-primer-odev
- Especificacion predefinida: https://github.com/Salih5400/se-primer-odev/blob/main/spec.md
- Conjunto de datos anonimizado: https://github.com/Salih5400/se-primer-odev/blob/main/data/oturumlar.csv
- Script de entrenamiento: https://github.com/Salih5400/se-primer-odev/blob/main/train.py
- Informe detallado de evaluacion: https://github.com/Salih5400/se-primer-odev/blob/main/eval/model-gate-report.md
- Referencia externa citada en la busqueda (indice de benchmarks, no especifica de este modelo): https://benchlm.ai/benchmarks
