# ludolua/nextaction-connect4

## Resumen

NextAction: connect4 es un clasificador supervisado que predice la columna que conviene jugar en una partida de Conecta 4 (Connect Four). Lo desarrolla Luiz Araujo (usuario ludolua en HuggingFace, leduardoaraujo en GitHub) y no es una red neuronal ni un transformer: combina vectorización TF-IDF de unigramas y bigramas con una regresión logística multinomial de scikit-learn, distribuida como artefacto skops de 222 kB. Dado un estado descrito en texto en inglés, devuelve una acción de un vocabulario fijo de siete columnas (c1 a c7) junto con la probabilidad de cada una.

Su relevancia no está en la calidad de juego, sino en el patrón de diseño que implementa: un next-action predictor pequeño y auditable, con probabilidades razonablemente calibradas (error de calibración esperado de 0.042) y una política de decisión declarativa en `config.toml` que bloquea acciones imposibles, fija una confianza mínima por acción y define costes de error en unidades de una revisión humana. El agente puede actuar solo cuando está seguro y ceder la decisión cuando no lo está, lo que permite operar con intervención humana selectiva en lugar de revisión total.

El modelo se entrenó con 32.642 posiciones etiquetadas con la jugada de una búsqueda alpha-beta de profundidad 4, y se evaluó sobre un split de test separado de 6.716 ejemplos, con una accuracy de 0.668 y un macro F1 de 0.63. Solo soporta inglés y está pensado explícitamente para la demo de Conecta 4 y para servir de plantilla de políticas de decisión con abstención, no para juego competitivo: en 200 partidas contra una búsqueda de profundidad 4, el modelo solo gana el 19% sin ayuda externa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | TF-IDF (unigramas y bigramas, `min_df=2`, sin acentos) + regresión logística multinomial de scikit-learn |
| Parámetros totales | no disponible (modelo lineal disperso; el número de coeficientes depende del vocabulario TF-IDF, no declarado) |
| Longitud de contexto | no aplica: clasifica una única descripción de estado en texto, no define ventana de contexto |
| Tipos de cuantización | no disponible (no se publican variantes cuantizadas; el artefacto skops contiene los coeficientes tal cual) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | skops (`model.skops`), cargable con `skops.io`; no se distribuyen safetensors, GGUF ni ONNX |
| Tarea | predicción de próxima acción (text-classification) con 7 clases: `c1`–`c7` |
| Autor | Luiz Araujo (`ludolua` / `leduardoaraujo`) |
| Tamaño del artefacto | 222 kB (tamaño del repo: 0.0 GB) |
| Librería | scikit-learn + skops + huggingface_hub |
| Hiperparámetros | `ngram_range=(1,2)`, `min_df=2`, `C=1.0`, `class_weight=None`, `max_iter=1000`, solver L-BFGS, calibración: ninguna |
| Entradas | texto libre en inglés con formato de etiquetas, p. ej. `[blocked none] [danger none] [features c1_better ...]` |
| Salidas | etiqueta de acción + vector de 7 probabilidades (`predict_proba`) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un pipeline clásico de scikit-learn en dos etapas. Primero, un vectorizador TF-IDF construido sobre unigramas y bigramas de palabras con los acentos eliminados y `min_df=2`, que convierte la descripción textual del estado en un vector disperso. Después, una regresión logística multinomial entrenada con el solver L-BFGS, `C=1.0`, `max_iter=1000`, `class_weight=None` y sin calibración posterior de probabilidades. El entrenamiento se ejecuta en bloques con warm start para poder reportar progreso, y el modelo resultante ocupa 222 kB, lo que lo hace inspeccionable y desplegable en cualquier entorno con Python.

Los datos de entrenamiento son 32.642 posiciones etiquetadas con la jugada elegida por una búsqueda alpha-beta de profundidad 4, generadas con el script `demos/connect4/generate_data.py`. Es, por tanto, un modelo destilado de un profesor de búsqueda, no un modelo entrenado con partidas humanas ni con RLHF o DPO: no hay fase de alineación ni de preferencias. La evaluación se hizo sobre un split de test separado (`connect4_test.csv`) con 6.716 ejemplos. La innovación destacable no es arquitectónica, sino de sistema: el modelo se entrega junto a una política de decisión (`config.toml`) con reglas que bloquean acciones imposibles, confianza mínima por acción, niveles de riesgo y costes de error expresados en unidades de una revisión humana (`review_cost = 1`), y un comando `nextaction calibrate-policy` que reajusta los umbrales a partir de esos costes.

## Capacidades

- Clasificación de próxima acción en Conecta 4: predice una de las siete columnas (`c1` a `c7`) y devuelve la probabilidad asociada a cada clase mediante `predict_proba`.
- Estimación de incertidumbre aprovechable: error de calibración esperado de 0.042 y una tabla pública de umbrales de confianza con la cobertura y la precisión resultantes.
- Decisión con abstención: el patrón documentado deriva a revisión (humana o mediante búsqueda de mayor profundidad) las jugadas con confianza por debajo de un umbral configurable.
- Política de decisión declarativa: reglas que bloquean acciones imposibles, confianza mínima por acción, niveles de riesgo y costes de error en `config.toml`.
- Entrada de texto libre en inglés: acepta descripciones de estado en un formato de etiquetas generado por `features.describe()`.
- Ligereza y auditabilidad: artefacto de 222 kB, sin necesidad de GPU, con coeficientes inspeccionables.
- No soporta tool calling ni function calling.
- No implementa por sí mismo razonamiento multi-paso ni bucles de agente: aporta una única decisión por estado.
- No genera texto libre, no tiene visión ni audio y no procesa imágenes.
- No es multilingüe: solo inglés.

## Casos de uso

- Agente de Conecta 4 con revisión selectiva: el clasificador decide la jugada y, cuando la confianza máxima cae por debajo de 0.5, la decisión se deriva a una búsqueda de profundidad 6. Con esta configuración el agente gana el 40% de 200 partidas contra una búsqueda de profundidad 4, frente al 19% cuando juega solo.
- Sugerencia de jugadas en aplicaciones educativas o móviles: con 222 kB y ejecución en CPU, el modelo puede embeberse en el dispositivo para ofrecer una pista al jugador sin coste de inferencia en servidor.
- Plantilla de next-action predictor en agentes conversacionales: el modelo sirve como baseline auditable del patrón TF-IDF más regresión logística antes de escalar a un modelo mayor, y los tags del repositorio lo enmarcan explícitamente en `dialogue-policy` y `agents`.
- Baseline reproducible en investigación sobre agentes: ofrece cifras cerradas (0.668 de accuracy, 0.63 de macro F1, 62.7% de decisiones automatizadas con 81.1% de acierto en el umbral 0.5) para comparar contra políticas basadas en LLM en la misma tarea.
- Calibración de umbrales guiada por costes de negocio: con `nextaction calibrate-policy`, los costes de error expresados en unidades de revisión humana se traducen en umbrales operativos, útil cuando cada revisión tiene un coste medible.
- Auditoría y trazabilidad de decisiones automatizadas: el toolkit incluye un registro de decisiones (`decision log`) que permite reconstruir por qué se automatizó o se derivó cada jugada, requisito habitual en sistemas con supervisión humana.
- Simulación masiva de oponentes en pipelines de evaluación: al no requerir GPU y ser un modelo lineal, permite lanzar miles de partidas en paralelo con un coste de cómputo muy bajo.
- Ejemplo didáctico de gestión de incertidumbre: la tabla de umbrales (de 96.1% de decisiones automatizadas al 68.3% de precisión, hasta 19.1% de decisiones con 98.7% de precisión) ilustra el compromiso entre cobertura y acierto de forma cuantificada.

## Benchmarks y rendimiento

Resultados declarados por el autor en el `model-index` (no verificados de forma independiente) sobre el split de test `nextaction/connect4`, con 6.716 ejemplos evaluados:

| Tarea | Conjunto de datos | Métrica | Valor |
|---|---|---|---|
| Predicción de próxima acción | NextAction Connect Four teacher games (test) | Accuracy | 0.668 |
| Predicción de próxima acción | NextAction Connect Four teacher games (test) | Macro F1 | 0.63 |

Referencias adicionales aportadas en la model card: elegir siempre la acción más frecuente daría 0.282 de accuracy, y el error de calibración esperado es 0.042.

Rendimiento por acción en el conjunto de test:

| Acción | Precisión | Recall | F1 | Soporte |
|---|---|---|---|---|
| `c1` | 0.625 | 0.533 | 0.575 | 614 |
| `c2` | 0.612 | 0.572 | 0.592 | 795 |
| `c3` | 0.639 | 0.655 | 0.647 | 1087 |
| `c4` | 0.765 | 0.866 | 0.812 | 1894 |
| `c5` | 0.626 | 0.580 | 0.602 | 1039 |
| `c6` | 0.642 | 0.586 | 0.613 | 742 |
| `c7` | 0.568 | 0.572 | 0.570 | 545 |

Compromiso entre cobertura y precisión según el umbral de confianza (por debajo del umbral, la decisión pasa a revisión):

| Umbral | Decisiones automatizadas | Accuracy sobre las automatizadas |
|---|---|---|
| 0.3 | 96.1% | 68.3% |
| 0.4 | 82.0% | 73.5% |
| 0.5 | 62.7% | 81.1% |
| 0.6 | 48.3% | 88.2% |
| 0.7 | 37.2% | 93.3% |
| 0.8 | 27.7% | 96.9% |
| 0.9 | 19.1% | 98.7% |

Rendimiento en juego, según el autor: en 200 partidas contra una búsqueda de profundidad 4, el modelo solo gana el 19%; si las jugadas con confianza inferior a 0.5 se revisan con una búsqueda de profundidad 6, gana el 40%, en el nivel atribuido a su profesor (38%) y 13 partidas más que cuando la revisión la realiza el profesor de profundidad 4. Los intervalos de confianza del 95% se solapan, por lo que esta última diferencia es sugestiva y no concluyente.

## Requisitos de hardware

- VRAM para inferencia: no aplica. No es una red neuronal y no requiere GPU; el artefacto son 222 kB de coeficientes que se cargan en memoria principal.
- Memoria RAM: no declarada explícitamente. El modelo pesa 222 kB, por lo que la huella dominante es la del intérprete de Python y las dependencias (`scikit-learn`, `skops`, `huggingface_hub`), no el modelo.
- GPU recomendadas: ninguna. Cualquier CPU moderna sirve; el cuello de botella en la demo es la búsqueda alpha-beta de revisión (profundidad 4 o 6), no el clasificador.
- Cabe en cualquier equipo de consumo: portátil, Raspberry Pi o contenedor pequeño, siempre que se pueda instalar scikit-learn.
- Opciones de despliegue: carga directa con `skops.io.load` más `huggingface_hub`, o el toolkit completo del repositorio NextAction (CLI, API REST, registro de decisiones, evaluación y política). No hay soporte de vLLM, llama.cpp, Ollama ni TGI, porque no se distribuyen pesos en formatos de transformer ni GGUF.
- Latencia y throughput: no disponible. No se publican mediciones del clasificador; en el escenario documentado el tiempo de resolución lo domina la búsqueda de revisión.
- Restricción de compatibilidad: es necesario usar una versión de scikit-learn compatible con la de entrenamiento, ya que el artefacto skops depende de ella.

## Comparativa con modelos similares

No se ha identificado en la información disponible ningún otro modelo publicado en HuggingFace dentro de la misma categoría (clasificador de próxima acción para Conecta 4), por lo que la comparación se limita a las alternativas de referencia citadas en la propia model card y a un baseline trivial:

| Sistema | Tipo | Rendimiento declarado | Notas |
|---|---|---|---|
| nextaction-connect4 (solo) | TF-IDF + regresión logística | 0.668 de accuracy; 0.63 de macro F1; 19% de victorias en 200 partidas contra búsqueda de profundidad 4 | 222 kB, licencia MIT, solo inglés, ejecución en CPU |
| nextaction-connect4 + revisión de profundidad 6 por debajo de 0.5 | Modelo + búsqueda alpha-beta | 40% de victorias en 200 partidas; 62.7% de decisiones automatizadas con 81.1% de accuracy en el umbral 0.5 | Requiere cómputo de búsqueda adicional |
| Profesor: búsqueda alpha-beta de profundidad 4 | Búsqueda determinista | Nivel de referencia atribuido del 38% en el demo | Es la fuente de las etiquetas de entrenamiento |
| Acción más frecuente (baseline trivial) | Regla fija | 0.282 de accuracy | Línea base inferior citada por el autor |
| Otros modelos comparables en HuggingFace | no disponible | no disponible | No se encontraron alternativas equivalentes en la información disponible |

## Limitaciones y advertencias

- No es apto para juego competitivo por sí solo: gana el 19% de las partidas contra una búsqueda de profundidad 4 y necesita un revisor más potente para alcanzar el nivel de su profesor.
- Techo de calidad marcado por el profesor: imita una búsqueda de profundidad 4 y hereda sus errores y su estilo de juego.
- Dominio cerrado: solo Conecta 4 y solo siete acciones posibles (`c1` a `c7`). No es un modelo de propósito general.
- Dependencia estricta del formato de entrada: espera la descripción de estado generada por `features.describe()`; fuera de ese formato el comportamiento no está caracterizado.
- Solo inglés: cualquier descripción de estado en otro idioma queda fuera del alcance declarado.
- Rendimiento desigual por acción: `c1` (F1 0.575) y `c7` (F1 0.570) son las clases más débiles, mientras que `c4`, la columna central, concentra el mejor resultado (F1 0.812, soporte 1894) por ser la acción más frecuente. Existe, por tanto, un sesgo hacia el centro del tablero.
- Sin calibración explícita: el campo `calibration` es `none`; el ECE de 0.042 es una medición a posteriori, no el resultado de un ajuste, y podría degradarse en distribuciones de estados distintas a las del test.
- Evidencia estadística limitada en el demo: los intervalos de confianza del 95% de las 200 partidas se solapan, así que la ventaja de 13 partidas frente a la revisión de profundidad 4 es sugestiva, no concluyente.
- Riesgo en la carga del artefacto: `skops` deserializa objetos y advierte de tipos fuera de su lista de confianza; conviene cargar únicamente artefactos de fuentes fiables.
- Reproducibilidad incompleta: los datos de entrenamiento no se redistribuyen en el repositorio de HuggingFace y deben regenerarse con `generate_data.py`; además, el modelo exige una versión de scikit-learn compatible con la de entrenamiento.
- Licencia MIT: permite uso comercial y modificación sin restricciones relevantes, pero se entrega sin garantías. La licencia cubre el artefacto del modelo, no necesariamente los datos de entrenamiento originales, que no se distribuyen.
- Validación externa mínima: 0 descargas y 0 likes en HuggingFace, sin resultados verificados de forma independiente (`verified: false` en las métricas).
- No soporta tool calling, agentes multi-paso, visión, audio ni generación de texto; cualquier sistema que necesite esas capacidades debe combinarlo con otros componentes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ludolua/nextaction-connect4
- Repositorio de código NextAction (CLI, API REST, registro de decisiones, evaluación y política): https://github.com/leduardoaraujo/NextAction
- Demo, scripts, benchmark y análisis de Conecta 4: https://github.com/leduardoaraujo/NextAction/tree/main/demos/connect4
- Perfil del autor: https://github.com/leduardoaraujo
- Resultados de la búsqueda web: no se encontró ningún resultado relevante sobre este modelo, su autor o su arquitectura; los enlaces recuperados correspondían a contenido no relacionado (wiki del videojuego Warframe) y se han descartado.
