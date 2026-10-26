# gavinlaw/setground-question-policy

## Resumen

`gavinlaw/setground-question-policy` no es un modelo de lenguaje ni un VLM: es un artefacto de investigación que contiene dos políticas lineales de nueve parámetros cada una, entrenadas para seleccionar la siguiente pregunta en un pipeline de *grounding* visual interactivo (SetGround). Cada política puntúa candidatos a partir exclusivamente de tres señales numéricas por candidato —score soft, score de matching y score de fila— y sus términos de segundo orden, sin acceder a imágenes, descripciones ni historial conversacional en inferencia.

El autor lo publica como "primera verificación" (首检) de la cadena de entrenamiento: una política se ajusta por regresión del retorno dentro del estado (*reward ridge*) y la otra por destilación de la acción óptima (*SFT*). El objetivo declarado es validar el *pipeline* de entrenamiento y detectar una señal débil de generalización entre contextos, no demostrar las afirmaciones de un artículo ni un esquema de RL multi-turno.

Es relevante ahora únicamente como referencia metodológica reproducible: libera el código de entrenamiento, las tablas de features por estado y las predicciones congeladas por *fold*, con resultados de sustitución puntual del orden de +0,05 a +0,07 puntos porcentuales sobre la política original. El repositorio pesa 0,1 GB y no contiene pesos neuronales, imágenes ni registros por muestra.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política lineal sobre 9 features monomiales por candidato (no es una red neuronal; sin transformer, MoE ni SSM) |
| Parámetros totales | 9 por política; 2 políticas publicadas (18 en total) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; el estado se resume en los scores s/m/r de cada candidato del pool |
| Tipos de cuantización | no aplica; los pesos son números en coma flotante serializados en JSON |
| Idiomas soportados | no disponible (el artefacto no procesa texto; la model card está en chino) |
| Licencia | no disponible |
| Formato de pesos | JSON (`*-model.json`, con `feature_names`, `mean/scale` del fold y `parameters.reward_ridge` / `parameters.sft`) |
| Features de entrada | `[s, m, r, s², m², r², sm, sr, mr]`, estandarizadas con la media y escala del fold de entrenamiento |
| Regla de decisión | producto escalar y `argmax`; en empate exacto se conserva la acción de la política original; si no, la acción más temprana del pool |
| Tamaño del repo | 0,1 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación / actualización | 2026-10-23 / 2026-10-25 |

## Arquitectura y entrenamiento

La arquitectura es un modelo lineal de scoring por candidato, no una red profunda. Para cada pregunta candidata se construyen nueve features a partir de tres scores (soft, matching, row) y sus productos cuadráticos y cruzados; el vector se estandariza con la media y la escala calculadas en el fold de entrenamiento y se proyecta sobre los nueve coeficientes aprendidos. La acción seleccionada es la del candidato con mayor puntuación. Las dos variantes comparten esquema y difieren en el objetivo de ajuste: regresión ridge del retorno dentro del estado y destilación de la acción óptima (*SFT*).

Los datos de entrenamiento provienen del snapshot `2026-09-30-k2-substitution` del artefacto `gavinlaw/setground-interactive-grounding@38dc6782c4aa387172ee17f9a82f22dccd8684be`, con configuración fija `full`, `k2_w10`: 144 trayectorias, 1.664 estados y 4.927 acciones. La validación es *leave-one-context-out* sobre tres contextos completos (Hawkins, Zeng, baskets); el nombre del fold identifica el contexto que el modelo no vio durante el entrenamiento. Las respuestas de referencia y las respuestas simuladas se usan solo como supervisión de entrenamiento y no entran como features en inferencia.

El autor es explícito sobre el alcance: no hay RL multi-turno, no hay pesos de VLM y el coste declarado de GPU para el entrenamiento es cero. La reproducibilidad se apoya en el commit de código `aa3ece7ced2799be0cb87304eedcc6fd141e3107` (`code/train_setground_question_policy.py`) y en un recibo de release en Git que fija las revisiones inmutables de parámetros y datos.

## Capacidades

- Puntuar y ordenar un pool de preguntas candidatas en un estado de *grounding* interactivo, usando solo scores agregados.
- Selección determinista de acción mediante `argmax`, con política de desempate explícita (acción original primero, luego la más temprana del pool).
- Dos objetivos de entrenamiento alternativos y comparables sobre el mismo esquema de features: regresión de retorno y destilación de acción óptima.
- Evaluación *leave-one-context-out* por contexto completo, con predicciones congeladas por fold en `*-predictions.json.gz`.
- Exportación de la tabla de entrenamiento (`training-table.json.gz`) con features por estado, número de candidatos correctos e identificadores de origen.
- Registro de medias, escalas y coeficientes en JSON legible, apto para inspección y auditoría numérica.
- No soporta generación de texto, código, matemáticas, visión, audio, *tool calling* ni razonamiento multi-paso. No hay capacidades multilingües.

## Casos de uso

- Reproducción del baseline de selección de preguntas: ejecutar `code/train_setground_question_policy.py` contra el snapshot fijado y comparar los coeficientes obtenidos con los `*-model.json` publicados para verificar la cadena de entrenamiento completa.
- Ablación de features: reentrenar sustituyendo el conjunto `[s, m, r, s², m², r², sm, sr, mr]` por subconjuntos (por ejemplo, solo lineales) y medir la caída de precisión condicional por fold frente al 37,3419 % de la regresión de retorno.
- Suelo de comparación (*baseline*) para nuevas políticas: cualquier modelo de selección de preguntas más complejo puede contrastarse contra estas dos políticas de 9 parámetros, que fijan un listón barato y perfectamente reproducible.
- Prueba de humo de infraestructura de evaluación: usar los `*-predictions.json.gz` congelados para validar que un *harness* de evaluación externo reproduce exactamente las métricas de `summary.json` antes de conectarlo a modelos mayores.
- Estudio metodológico de validación cruzada por contexto: el esquema *leave-one-context-out* con folds nombrados sirve como ejemplo docente de cómo aislar generalización entre escenas en lugar de entre muestras.
- Auditoría de un *pipeline* de datos privado: la separación estricta entre artefacto público (solo coeficientes y agregados) y dataset privado (imágenes, descripciones, registros por muestra) es un patrón reutilizable para publicar resultados sin liberar datos sujetos a términos de investigación.

## Benchmarks y rendimiento

Precisión condicional de sustitución puntual, con los tres contextos ponderados por igual (media de las tres evaluaciones *leave-one-context-out*). La columna de diferencia es aritmética sobre los valores publicados.

| Política | Precisión condicional | Diferencia frente a la política original |
|---|---|---|
| Política original (referencia) | 37,2718 % | — |
| Regresión de retorno (9 parámetros) | 37,3419 % | +0,0701 pp |
| Destilación de acción óptima (9 parámetros) | 37,3254 % | +0,0536 pp |
| Oráculo dentro del pool (*techo*) | 39,1222 % | +1,8504 pp |

En el contexto `baskets`, ambas políticas aprendidas quedan 0,0625 puntos porcentuales por debajo de la política original. El autor advierte que estas ganancias de sustitución en un solo punto no son sumables como efecto online completo, y que el margen hasta el oráculo (1,85 pp) acota el recorrido máximo disponible con este pool de candidatos. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ningún otro benchmark estándar, y no aplican a este artefacto.

## Requisitos de hardware

- VRAM para inferencia: 0 GB. La inferencia es un producto escalar de 9 dimensiones por candidato, ejecutable en CPU.
- GPUs recomendadas: ninguna. El autor declara un uso de GPU de 0 para el entrenamiento.
- GPU de consumo: no aplica; cabe en cualquier CPU y en memoria de unos pocos kilobytes para los coeficientes.
- Almacenamiento: el repositorio completo ocupa 0,1 GB, dominado por los ficheros `training-table.json.gz` y `*-predictions.json.gz`, no por los pesos.
- Opciones de despliegue: script de Python del repositorio de GitHub; no aplican vLLM, llama.cpp, Ollama ni TGI al no existir pesos neuronales ni tokenizador.
- Latencia y throughput: no disponibles. Por la naturaleza del cálculo (9 multiplicaciones y una comparación por candidato) el coste es despreciable frente a cualquier componente que genere los scores s/m/r de entrada.

## Comparativa con modelos similares

No se conocen políticas publicadas equivalentes para esta tarea con las que comparar; la comparación relevante es interna al propio informe.

| Variante | Parámetros | Contexto de evaluación | Precisión condicional | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Política original (heurística del *pipeline*) | no disponible | 3 contextos, *leave-one-context-out* | 37,2718 % | no disponible | incluida en el *pipeline* de origen, no en este repo |
| Regresión de retorno (este repo) | 9 | 3 contextos, *leave-one-context-out* | 37,3419 % | no disponible | pesos JSON públicos |
| Destilación de acción óptima (este repo) | 9 | 3 contextos, *leave-one-context-out* | 37,3254 % | no disponible | pesos JSON públicos |
| Oráculo dentro del pool | no aplica | mismos estados | 39,1222 % | no aplica | solo como cota superior reportada |

## Limitaciones y advertencias

- No es un modelo generativo ni un LLM: no produce texto, no razona y no procesa imágenes. Cualquier uso previsto como modelo de lenguaje es un error de categoría.
- Capacidad muy limitada: 9 coeficientes sobre 9 features monomiales; no puede representar interacciones de orden superior ni dependencias del historial conversacional.
- Ganancias marginales: +0,0701 pp y +0,0536 pp de precisión condicional, y ambas políticas quedan 0,0625 pp por debajo de la original en el contexto `baskets`. No hay evidencia de mejora robusta.
- Las respuestas de evaluación provienen de un *Director* simulado con `argmax` del mismo modelo, no de un *Director* humano ni independiente; el autor lo señala como limitación explícita.
- El conjunto de test histórico se ha usado durante mucho tiempo en desarrollo, por lo que las cifras pueden estar contaminadas por selección.
- Los resultados no demuestran RL multi-turno, generalización a escenarios nuevos ni las afirmaciones del artículo; solo verifican la cadena de entrenamiento y una señal entre contextos muy débil.
- Con solo tres contextos en la validación *leave-one-context-out*, la varianza de las métricas por fold no se reporta y la extrapolación a otras escenas no está justificada.
- Licencia no disponible: no hay autorización explícita de uso comercial y los datos subyacentes están sujetos a los términos de investigación del proyecto de origen, con registro de datos retenido en un dataset privado.
- El artefacto público no incluye imágenes, descripciones ni registros por muestra, de modo que la reproducibilidad completa depende del acceso al dataset privado y de un fichero de token que se pasa por `stdin` y no se escribe en los productos.
- Los coeficientes dependen del esquema de scores del *pipeline* original; si cambia la definición de s/m/r, los modelos quedan inválidos sin reentrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/gavinlaw/setground-question-policy
- Código de entrenamiento (GitHub): https://github.com/luojiaxuan/cvpr-multimodal-evidence
- Artefacto de origen citado: `gavinlaw/setground-interactive-grounding@38dc6782c4aa387172ee17f9a82f22dccd8684be`, snapshot `snapshots/2026-09-30-k2-substitution` (referenciado en la model card)
- Página del autor en SAVRN Model Hub: https://savrn.com/model-publishers/gavinlaw
- Paper, blog o demo del modelo: no disponible
