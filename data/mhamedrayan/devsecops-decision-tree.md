# MhamedRayan/devsecops-decision-tree

## Resumen

`MhamedRayan/devsecops-decision-tree` es un clasificador tabular basado en un arbol de decision de scikit-learn, serializado con joblib, que actua como "gatekeeper" (arbitro final) dentro de un sistema de auditoria DevSecOps compuesto por tres agentes. El modelo recibe dos puntuaciones de riesgo producidas por dos agentes upstream (un agente de metricas y un agente transformer) y emite un veredicto final de tres clases: `FAIL`, `PASS` o `REVIEW`. Lo desarrolla el usuario MhamedRayan y se publica bajo licencia "other" sin especificar.

El modelo no es un modelo de lenguaje ni una red neuronal: es un arbol de decision entrenado sobre una rejilla sintetica de politicas (8.100 filas generadas con semilla 42), de modo que no aprende de datos reales sino que codifica una politica de consenso y fail-safe definida manualmente. Su relevancia es acotada: sirve como componente de orquestacion determinista en pipelines de auditoria de seguridad, no como modelo generativo.

El repositorio tiene un tamano de 0.0 GB, sin descargas ni likes en el momento de la consulta, y se creo el 22 de noviembre de 2026. La model card advierte explicitamente de que la licencia no esta definida y de que el campo debe actualizarse antes de publicar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Arbol de decision (scikit-learn), clasificacion tabular de 3 clases |
| Parametros totales | no disponible (no aplica; modelo no neuronal) |
| Parametros activos | no aplica |
| Longitud de contexto | no aplica (entrada de 4 caracteristicas numericas) |
| Tipos de cuantizacion | no disponible (no aplica; artefacto joblib) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | other (no especificada; el autor indica que debe actualizarse) |
| Formato de pesos | `model.joblib` (bundle con `model`, `feature_cols`, `classes`, `policy`, `source_thresholds`) |

## Arquitectura y entrenamiento

El artefacto es un arbol de decision de scikit-learn empaquetado en un bundle joblib que incluye el estimador, la lista ordenada de columnas de entrada (`feature_cols`), el orden de clases (`classes`: `FAIL`, `PASS`, `REVIEW`), la politica (`policy`) y los umbrales de origen (`source_thresholds`). La entrada son exactamente cuatro caracteristicas numericas en orden fijo: `a1_high_risk` (1.0 si la puntuacion del agente 1 es mayor o igual a 0.3183), `a2_vulnerable` (1.0 si la puntuacion del agente 2 es mayor o igual a 0.45), `a1_risk_ratio` (puntuacion del agente 1 dividida por 0.3183) y `a2_risk_ratio` (puntuacion del agente 2 dividida por 0.45).

El entrenamiento se realizo sobre una rejilla sintetica de politicas generada con la version 1 del generador: 45 ratios por 45 ratios por 4 cuadrantes, es decir, 8.100 filas, con semilla 42. Las etiquetas no provienen de verdad de referencia, sino de la propia politica de consenso definida a mano, por lo que el arbol esencialmente memoriza esa politica. No hay RLHF, DPO ni datos reales. La model card recomienda mantener el post-chequeo del wrapper de referencia que fuerza `REVIEW` ante cualquier discrepancia entre el arbol y la politica. Ademas, advierte de que el fallback guardado en `source_thresholds` aun lista el umbral del agente 2 como 0.51 de una ejecucion anterior, por lo que deben pasarse explicitamente los umbrales actuales (0.3183 y 0.45).

## Capacidades

- Clasificacion tabular de tres clases (`FAIL`, `PASS`, `REVIEW`) a partir de dos puntuaciones de riesgo.
- Salida de probabilidades por clase mediante `predict_proba`, con veredicto por `argmax` y confianza por `max`.
- Aplicacion de una politica de consenso: riesgo bajo en ambos agentes produce `PASS`; riesgo alto en ambos produce `FAIL`; cualquier combinacion mixta produce `REVIEW`.
- Fail-safe integrado: ante error, valor ausente o puntuacion invalida, la salida es `REVIEW`.
- No soporta tool calling, agentes, razonamiento multi-paso, vision, audio ni capacidades multilingues.
- No dispone de modo "thinking" ni de generacion de texto.

## Casos de uso

- Arbitraje final en pipelines de auditoria DevSecOps: el modelo recibe las puntuaciones de dos agentes previos y emite un veredicto unico y determinista, lo que simplifica la toma de decision aguas abajo.
- Puerta de calidad en CI/CD: integrado como paso de validacion que bloquea (`FAIL`), aprueba (`PASS`) o escala a revision manual (`REVIEW`) un artefacto o cambio antes de desplegarse.
- Enrutamiento a revision humana: la clase `REVIEW` permite derivar automaticamente a un analista los casos ambiguos donde los agentes no coinciden, reduciendo carga operativa.
- Sistema de alertas de seguridad: combinado con los dos agentes upstream, el arbol actua como capa de consolidacion de senales de riesgo con umbrales explicitos y auditables.
- Prototipado de politicas de decision: al estar entrenado sobre una rejilla sintetica, sirve para validar rapidamente el comportamiento de una politica de consenso antes de implementarla en produccion.
- Componente de referencia en entornos docentes o de investigacion sobre orquestacion de agentes, donde se necesita un arbitro reproducible y de bajo coste computacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo se ejecuta en CPU y su huella en memoria es minima (arbol de decision de scikit-learn).
- GPU recomendadas: no aplica; no requiere GPU.
- Cabe en cualquier equipo consumer: si, en cualquier maquina capaz de ejecutar Python y scikit-learn.
- Opciones de despliegue: carga directa con `joblib.load` en Python; puede servirse mediante FastAPI, Flask o cualquier framework de inferencia que cargue el bundle.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por la naturaleza del modelo (arbol de decision sobre 4 caracteristicas), la latencia por inferencia es del orden de microsegundos en CPU.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MhamedRayan/devsecops-decision-tree | Arbol de decision (scikit-learn) | no aplica | no aplica | other (no especificada) | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo no aprende de verdad de referencia: codifica una politica definida manualmente sobre datos sinteticos, por lo que no generaliza mas alla de esa politica.
- La confianza devuelta por `predict_proba` no esta calibrada; no debe interpretarse como probabilidad fiable.
- El fallback guardado en `source_thresholds` contiene un umbral obsoleto para el agente 2 (0.51 en lugar de 0.45); es imprescindible pasar los umbrales actuales explicitamente.
- La licencia figura como "other" sin especificar; el autor indica que debe actualizarse antes de publicar, por lo que el uso comercial queda sin marco legal claro.
- Depende de que los agentes upstream produzcan puntuaciones en el rango esperado; entradas invalidas o ausentes se resuelven como `REVIEW`, lo que puede generar cuellos de botella en revision manual si los agentes fallan con frecuencia.
- No procesa texto ni otros formatos: solo cuatro caracteristicas numericas en orden fijo; cualquier cambio en el orden o en los umbrales invalida el modelo.
- Sin descargas ni validacion externa conocida; no hay evidencia publica de su comportamiento en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/MhamedRayan/devsecops-decision-tree
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la informacion disponible.
