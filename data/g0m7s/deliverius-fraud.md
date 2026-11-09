# G0m7s/deliverius-fraud

## Resumen

Deliverius fraud es un modelo de clasificación tabular binaria que estima la probabilidad calibrada de que una solicitud de reembolso, cupón o cancelación en la aplicación ficticia de reparto Deliverius sea fraudulenta. Lo desarrolla el usuario G0m7s y se publica bajo licencia MIT con la librería propia `deliverius`. No es una red neuronal ni un transformer: es una regresión logística sobre 27 características puntuales en el tiempo, calibrada mediante escalado de Platt, acompañada de una regla de decisión basada en coste que deriva un caso a revisión humana cuando la pérdida esperada iguala el coste de la revisión.

El modelo se entrena exclusivamente con datos sintéticos generados por el autor (dataset `G0m7s/deliverius-ai`, versión 1.0.0). Su propósito es demostrar un pipeline reproducible de machine learning tabular: partición temporal, comparación con líneas base, calibración, decisión por coste, artefactos versionados y una puerta de calidad en CI. La relevancia actual es metodológica más que de rendimiento: ilustra cómo justificar la elección entre un modelo simple y uno de gradient boosting con intervalos de confianza bootstrap y cómo traducir probabilidades a una política de decisión con impacto económico medible.

El modelo no está pensado para tomar decisiones sobre personas reales, verificaciones de crédito o identidad, ni para denegar reembolsos de forma automática. Todos los clientes, pedidos y reclamaciones son ficticios: el modelo ha aprendido el generador sintético, no el fraude real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresión logística con calibración de Platt (escalado sigmoideo sobre la puntuación bruta) |
| Parametros totales | 27 coeficientes más intercepto (28 parametros) y 2 parametros del calibrador (a, b) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular; 27 características por instancia) |
| Tipos de cuantizacion | no aplica (coeficientes en coma flotante dentro de JSON) |
| Idiomas soportados | no disponible (no procesa texto; las características son numéricas y categóricas codificadas) |
| Licencia | MIT |
| Formato de pesos | JSON plano (`logistic.json`, `calibrator.json`, `decision.json`, `manifest.json`), sin pickle |

## Arquitectura y entrenamiento

La arquitectura es una regresión logística lineal sobre 27 características construidas estrictamente con hechos anteriores al instante de la reclamación: antigüedad de la cuenta, pedidos y reclamaciones en ventanas de 30 y 90 días, importes solicitados y totales del pedido, fracción solicitada, minutos desde la entrega, marca de entrega, hora local, tipo de acción (reembolso, cupón, cancelación), motivo de la reclamación (seis categorías) y método de pago (Pix, tarjeta de crédito, débito, vale comida). No se incluyen nombre, dirección, documento, texto de mensajes, perfil del cliente ni resultado del revisor. Los valores ausentes se imputan con la mediana del conjunto de entrenamiento. La salida bruta se calibra con escalado de Platt mediante `p = 1 / (1 + exp(a * raw + b))`.

El entrenamiento usa una partición temporal: mayo a agosto para ajuste (hiperparámetros mediante validación cruzada en pliegues mensuales expansivos), septiembre para selección de modelo, calibración y umbral, y octubre como conjunto de test evaluado una sola vez (462 reclamaciones, 51 fraudulentas). La elección entre regresión logística y LightGBM se fijó antes de la primera ejecución: se adopta LightGBM solo si el intervalo de confianza al 95 % por bootstrap pareado de la diferencia de PR-AUC queda enteramente por encima de cero. En septiembre ese intervalo fue [-0,182, -0,007], por lo que se mantuvo la regresión logística. La calibración es sigmoidea porque unos 60 positivos mensuales son insuficientes para calibración isotónica. El linaje queda registrado con el commit de código `3a20f85f486574fdaa7ede97af759d5f8daa99ca`, la ejecución de MLflow `122a02d18bf241208d0db8c4f17bc00f` y la semilla 20261109.

## Capacidades

- Clasificación binaria tabular: devuelve una probabilidad calibrada de fraude para una reclamación individual a partir de 27 características puntuales.
- Decisión por coste: aplica la regla `p × importe >= coste de revisión` para derivar automáticamente un caso a revisión humana, con el coste de revisión parametrizado en `decision.json` (R$ 4,00 en la evaluación publicada).
- Calibración de probabilidades: la salida calibrada es apta para umbrales basados en coste, no solo para ordenación.
- Reproducibilidad: artefactos en JSON con SHA-256 por fichero en `manifest.json`, versiones de esquema de características (1.0.0, hash `2616a1e1f99103eef888ab3857584ad465f54863e4904435882812615c4709a2`) y linaje completo.
- Carga segura: al ser JSON numérico sin pickle, la carga no ejecuta código.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto. No es un modelo de lenguaje.

## Casos de uso

- Demostración de pipeline tabular reproducible: sirve como referencia docente o de ingeniería para mostrar partición temporal, líneas base, calibración y decisión por coste en un flujo con puerta de calidad en CI.
- Evaluación de políticas de revisión manual: permite comparar el coste por reclamación de distintas reglas (nunca revisar, revisar todo, regla de negocio, umbral fijo, regla por coste) sobre el mismo conjunto de test, como muestra la tabla de costes de la model card.
- Prototipado de sistemas de detección de fraude en reembolsos: útil para diseñar el esquema de características puntuales (ventanas de 30 y 90 días, importes, motivos, métodos de pago) antes de disponer de datos reales.
- Enseñanza de calibración de probabilidades: ejemplo concreto de por qué el escalado de Platt es preferible a la calibración isotónica cuando el número de positivos mensuales es bajo.
- Integración en la demo Deliverius: puntuación de reclamaciones dentro de la aplicación de demostración, donde una persona revisa cada caso marcado.
- Pruebas de regresión de infraestructura de ML: los artefactos versionados y el manifiesto con hashes permiten verificar que un despliegue carga exactamente los pesos y el calibrador esperados.
- Comparación metodológica de modelos: la regla de selección con bootstrap pareado puede reutilizarse para justificar la elección entre modelos simples y complejos en otros dominios tabulares.

## Benchmarks y rendimiento

Resultados en el conjunto de test de octubre (462 reclamaciones, 51 fraudulentas), según la model card:

| Scorer | PR-AUC [IC 95 %] | ROC-AUC | Brier | Recall en el 5 % superior |
|---|---|---|---|---|
| Logística (calibrada) | 0,452 [0,348, 0,596] | 0,839 | 0,0770 | 0,333 |
| LightGBM (calibrada) | 0,372 [0,272, 0,507] | 0,802 | 0,0841 | 0,235 |
| Regla de negocio | 0,123 [0,110, 0,167] | 0,526 | no disponible | 0,078 |

Coste esperado por reclamación con revisión a R$ 4,00:

| Regla | Revisadas | Fraudes detectados | Coste por reclamación |
|---|---|---|---|
| Nunca revisar | 0 | 0 | R$ 3,22 |
| Revisar todo | 462 | 51 | R$ 4,00 |
| Regla de negocio (3+ reclamaciones en 30 días) | 15 | 4 | R$ 3,14 |
| Umbral fijo (TunedThresholdClassifierCV) | 57 | 27 | R$ 1,65 |
| Regla por coste: p × importe >= coste de revisión | 93 | 31 | R$ 1,25 |

## Requisitos de hardware

- VRAM estimada para inferencia: despreciable; el modelo son decenas de números en coma flotante cargados desde JSON.
- GPU recomendadas: ninguna. La inferencia es una suma ponderada de 27 características más una sigmoide, ejecutable en CPU.
- Cabe en cualquier GPU consumer y en cualquier CPU moderna; también en entornos sin GPU.
- Opciones de despliegue: carga directa del JSON con la librería `deliverius`; al no usar pickle ni requerir framework de deep learning, puede integrarse en cualquier servicio Python o reimplementarse en otro lenguaje a partir de los coeficientes.
- Latencia y throughput: no se publican mediciones. Por la naturaleza del modelo (producto escalar de 27 dimensiones), la latencia por instancia es del orden de microsegundos en CPU y el throughput queda limitado por el resto del pipeline de características, no por el modelo.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | PR-AUC (test octubre) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Deliverius fraud (logística calibrada) | Regresión logística + Platt | 28 + 2 | no aplica | 0,452 | MIT | Hugging Face |
| Deliverius fraud (LightGBM calibrado) | Gradient boosting | no disponible | no aplica | 0,372 | MIT (mismo repo) | Hugging Face |
| Regla de negocio (3+ reclamaciones en 30 días) | Regla determinista | 0 | no aplica | 0,123 | no aplica | Referencia interna de la model card |

No se dispone de comparación con modelos de fraude de terceros en la información proporcionada.

## Limitaciones y advertencias

- Datos exclusivamente sintéticos: el modelo ha aprendido el generador, y el fraude real es más variado. No debe usarse para decidir nada sobre personas reales.
- Pocos positivos (51 fraudes en test): los intervalos de confianza son amplios y la estimación de rendimiento es incierta.
- Ventanas incompletas: los pedidos comienzan el 1 de mayo, por lo que las ventanas de 90 días están incompletas hasta finales de julio; validación y test sí tienen ventanas completas.
- Calibración sigmoidea obligada por el bajo número de positivos mensuales (unos 60), que impide usar calibración isotónica.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero la probabilidad calibrada puede ser engañosa fuera de la distribución sintética.
- Sesgos: no se documentan análisis de equidad; al no incluir atributos demográficos, no se puede auditar el sesgo por subgrupo con las características publicadas.
- Restricciones de licencia: MIT permite uso comercial, pero la model card prohíbe explícitamente su uso para decisiones sobre clientes reales, verificaciones de crédito o identidad, o cualquier caso en que una puntuación sola deniegue un reembolso.
- Para producción: requiere revisión humana de cada caso marcado y no debe sustituir la política de negocio; además, el esquema de características está versionado (1.0.0) y cualquier cambio invalida los coeficientes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/G0m7s/deliverius-fraud
- Dataset: https://huggingface.co/datasets/G0m7s/deliverius-ai
- Commit del dataset: `cc5be0958e3e4971c284031ceb6406c43e96ae84`
- Commit del código: `3a20f85f486574fdaa7ede97af759d5f8daa99ca`
- Ejecución de MLflow: `122a02d18bf241208d0db8c4f17bc00f`
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
