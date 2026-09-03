# AsamAce/pharma-authenticity-model

## Resumen

El modelo `AsamAce/pharma-authenticity-model`, también denominado ZigoTrace Pharma — Diversion Anomaly Model, es un clasificador tabular basado en regresión logística diseñado para detectar desvío (*diversion*) en la cadena de suministro farmacéutica. Desarrollado por AsamAce como parte del motor ZigoTrace, el modelo puntúa la probabilidad de que una unidad farmacéutica haya seguido una ruta de custodia anómala o forme parte de un anillo de desvío, a partir de un vector de 8 características extraídas de un grafo de serialización. No es un modelo de lenguaje ni un sistema de visión; se trata de un modelo lineal pequeño, entrenado con supervisión débil sobre datos sintéticos, y pensado para integrarse como una fuente de evidencia adicional en un sistema de fusión Dempster-Shafer junto con reglas deterministas.

Su relevancia radica en abordar un problema específico de trazabilidad y autenticidad en el sector farmacéutico, donde las etiquetas de confirmación de falsificación son escasas y los métodos tradicionales basados en reglas no capturan patrones estadísticamente anómalos. El modelo está diseñado para ser determinista en su entrenamiento (misma entrada produce el mismo artefacto), lo que facilita el control de cambios en entornos regulados GxP. Aunque aún no ha sido validado con datos reales, su arquitectura simple y su transparencia (pesos y bias inspeccionables) lo convierten en una herramienta útil para entornos donde la explicabilidad es crítica.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresión logística (modelo lineal) |
| Parametros totales | 8 pesos + bias (modelo lineal) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo tabular) |
| Tipos de cuantizacion | No aplica (modelo lineal pequeño) |
| Idiomas soportados | No disponible (modelo numérico, sin procesamiento de lenguaje) |
| Licencia | MIT |
| Formato de pesos | model.json (JSON) |

## Arquitectura y entrenamiento

El modelo es una regresión logística con 8 características estandarizadas: `route_rarity`, `num_receives`, `num_dispenses`, `distinct_receive_locations`, `aggregation_consistent`, `attestation_ok`, `hop_count` y `case_dispense_anomaly`. Los pesos y el bias se proporcionan explícitamente en la model card, lo que permite una inspección completa del modelo. El entrenamiento se realiza con gradiente descendente por lotes completos, con inicialización fija y número de iteraciones fijo, lo que garantiza un resultado determinista (misma entrada produce el mismo artefacto), requisito para el control de cambios en entornos GxP.

Las etiquetas se generan mediante supervisión débil, utilizando funciones de etiquetado sobre señales observables (ruta de custodia rara, dispensación duplicada, atestación débil, funneling entre casos hermanos), en lugar de etiquetas de verdad absoluta. El conjunto de datos es sintético, generado con semilla 7, con 420 filas de entrenamiento y 180 de prueba. La innovación principal no está en la arquitectura (lineal y simple), sino en el enfoque de integración: el modelo se fusiona con reglas deterministas mediante Dempster-Shafer, y su contribución está limitada por un peso de fiabilidad, de modo que nunca puede anular un veredicto determinista de autenticidad.

## Capacidades

- Detección de desvío (*diversion*) en rutas de custodia y anillos de agregación, basada en patrones estadísticamente anómalos.
- Puntuación de sospecha (score) con salida de incertidumbre asociada.
- Abstinencia bajo incertidumbre: si la certeza del modelo es baja, su contribución se colapsa hacia "desconocido" en lugar de adivinar.
- Integración como fuente de evidencia en un sistema de fusión Dempster-Shafer, con límite de fiabilidad.
- Inspeccionabilidad total: pesos, bias y características son accesibles y documentados.
- Entrenamiento determinista, lo que permite reproducibilidad exacta y control de versiones mediante hash SHA-256.
- Compatible con Inference Endpoints de HuggingFace (handler.py) y con uso local mediante scorer.py.

## Casos de uso

- Detección de desvío en rutas de custodia: el modelo puntúa unidades que, individualmente, parecen normales pero que presentan una ruta de custodia estadísticamente rara (por ejemplo, un número inusualmente alto de recepciones o dispensaciones en ubicaciones distintas). Se usa como capa adicional sobre las reglas deterministas de trazabilidad.
- Análisis de vecindad de casos de agregación: la característica `case_dispense_anomaly` captura patrones de funneling entre casos hermanos, permitiendo identificar anillos de desvío que operan a nivel de agregación.
- Fusión de evidencias en un sistema de autenticidad: el modelo se integra en un motor Dempster-Shafer junto con reglas de recall, expiración, cadena de frío y clonación de seriales, aportando una señal de sospecha limitada por un peso de fiabilidad.
- Auditoría regulatoria y control de cambios: gracias a su entrenamiento determinista, el modelo puede ser versionado con un hash SHA-256 anclado en Hedera, facilitando la trazabilidad en entornos GxP.
- Evaluación de riesgo en dispensación: aunque no bloquea decisiones por sí mismo, puede informar a farmacéuticos o responsables de calidad sobre unidades que requieren revisión manual, con registro de procedencia.
- Investigación y desarrollo de modelos de detección de anomalías en cadenas de suministro: sirve como baseline lineal para comparar con enfoques más complejos (por ejemplo, GNNs) en el mismo dominio.

## Benchmarks y rendimiento

La model card reporta las siguientes métricas para el artefacto evaluado de forma independiente (umbral 0.5):

| Metrica | Valor |
|---|---|
| Detección de desvío (ruta + anillo) | 7/7 (100%) |
| Brier score | 0.021 |
| Tasa de falsos positivos (independiente, umbral 0.5) | 2.3% (4/173) |

Además, se indica que en el sistema fusionado (con el modelo integrado en el motor Dempster-Shafer), la tasa real de falsa cuarentena es del 0%, según la validación del motor (`intel-validate`). No se proporcionan comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- No requiere GPU: es un modelo lineal con 8 pesos, ejecutable en cualquier CPU moderna.
- Memoria mínima: el artefacto es un archivo JSON de pocos kilobytes; la inferencia consume menos de 1 MB de RAM.
- GPU recomendadas: ninguna; puede ejecutarse en CPUs de bajo consumo, incluso en dispositivos embebidos.
- Opciones de despliegue: Inference Endpoints de HuggingFace (con `handler.py`), uso local con `scorer.py`, o integración en el motor ZigoTrace (TypeScript).
- Latencia y throughput: al ser una operación lineal, la inferencia es del orden de microsegundos; puede procesar miles de solicitudes por segundo en un solo núcleo.

## Comparativa con modelos similares

No disponible. No se han encontrado en la información proporcionada modelos comparables de la misma categoría (detección de desvío en cadena de suministro farmacéutica con regresión logística). El modelo se presenta como un baseline lineal dentro de su propio ecosistema, y se menciona una futura pista con GNN que aún no supera a este modelo en los datos disponibles.

## Limitaciones y advertencias

- Entrenamiento y evaluación exclusivamente con datos sintéticos; la generalización a datos reales no está verificada y depende de un futuro dataset de un distribuidor piloto.
- Modelo lineal: no puede capturar patrones relacionales complejos, como anillos de lavado multi-hop; para ello se contempla una GNN que aún no supera al baseline.
- El signo del peso de `aggregation_consistent` no debe interpretarse causalmente, ya que tiene baja varianza en el generador sintético y su coeficiente no está fuertemente restringido por los datos.
- El modelo es solo una fuente de evidencia adicional; nunca debe utilizarse como único criterio para decisiones de dispensación o liberación de producto. Las reglas deterministas (recall, expiración, cadena de frío, clonación de seriales, agregación, balance de masas) son la vía de seguridad autoritativa.
- No está entrenado para detectar productos caducados, retirados o con excursiones de cadena de frío; esos casos se gestionan mediante reglas deterministas.
- La tasa de falsos positivos reportada (2.3%) es del modelo en aislamiento; en el sistema fusionado se reduce a 0% gracias al peso de fiabilidad, pero esto no debe extrapolarse a otros contextos de uso.
- Licencia MIT, pero el uso en producción farmacéutica requiere validación GxP completa, que aún no se ha documentado públicamente.

## Enlaces

- [HuggingFace - AsamAce/pharma-authenticity-model](https://huggingface.co/AsamAce/pharma-authenticity-model)
- [Repositorio fuente ZigoTrace (GitHub)](https://github.com/Davedave001/zigo-pharma)
- Dataset sintético: `zigotrace/pharma-serialized-events` (referenciado en la model card, sin URL directa disponible)
