# iwellike/icerik-kocu-kotu-son-riski

## Resumen

`iwellike/icerik-kocu-kotu-son-riski` es un modelo tabular de clasificación binaria, no un modelo de lenguaje. Lo publica el usuario `iwellike` en Hugging Face como parte de un proyecto educativo y de demostración llamado "İçerik Koçu" ("The Primer v2"). Su función es predecir si un jugador terminará un escenario interactivo de tres decisiones con el desenlace etiquetado como "Son B — Kötü" (final B, malo), a partir de cinco variables de comportamiento recogidas durante las dos primeras decisiones.

Técnicamente es un `Pipeline` de scikit-learn que encadena un `StandardScaler` y una `LogisticRegression` con `random_state=13`, exportado además a ONNX para inferencia en cliente. El modelo es deliberadamente minúsculo: el repositorio ocupa 0,0 GB y el conjunto de datos se mide en decenas de filas, según la propia model card. No hay información sobre licencia, idiomas ni parámetros en el sentido habitual de un modelo neuronal.

Su relevancia es acotada y explícitamente didáctica: sirve como ejemplo de pipeline completo (definición de contrato de entrada, umbral de decisión fijado antes del entrenamiento, métricas de aceptación y exportación a ONNX) más que como herramienta predictiva generalizable. El autor advierte que no debe usarse para decisiones reales de estrategia de contenido, privacidad o negocio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline scikit-learn: `StandardScaler` → `LogisticRegression` (regresión logística binaria) |
| Parametros totales | 5 coeficientes más intercepto (no disponible el recuento exacto en la información proporcionada) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (entrada tabular fija de 5 características) |
| Tipos de cuantizacion | No disponible; exportación a ONNX en float32 |
| Idiomas soportados | No disponible (no procesa texto) |
| Licencia | No disponible |
| Formato de pesos | ONNX (`model.onnx`); pipeline serializable de scikit-learn |

## Arquitectura y entrenamiento

El modelo es una regresión logística binaria precedida de estandarización de características. La entrada es un vector float32 de forma `[n, 5]` con el orden exacto definido en `config.json`: `seviye_deneyimli` (0/1, si el usuario se declaró experimentado en el onboarding), `sahne_no` (1 o 2, escena o decisión), `karar_suresi_sn` (segundos hasta hacer clic), `karar_degisikligi_sayisi` (número de cambios de selección antes de confirmar) y `riskli_sayisi_simdiye_kadar` (número de opciones de riesgo A elegidas hasta ese momento, 0-2). La salida es `probabilities[:,1]`, la probabilidad del mal final, con umbral de decisión fijado en 0,5 en `config.json`.

El entrenamiento se realizó con Python 3.12 y scikit-learn 1.9.1 sobre `data/oturumlar.csv`, combinando sesiones reales y sesiones sintéticas generadas por `data/sentetik_uret.py` (seed=13) a partir de una regla de persona documentada. El número concreto de sesiones reales y sintéticas se consulta en `config.json → metrics`, que se actualiza en cada ejecución de entrenamiento. Las métricas de aceptación (accuracy ≥ 0,70 y recall de mal final ≥ 0,60) se fijaron en `spec.md` antes de entrenar, y `train.py` aborta la ejecución y no genera `model.onnx` si el modelo no las alcanza. La validación usa un 30 % held-out estratificado con `random_state=13`.

## Capacidades

- Clasificación binaria tabular: estima la probabilidad de que una sesión de juego termine en el final "Son B — Kötü".
- Inferencia en cliente mediante ONNX Runtime, con entrada float32 `[n,5]` y salidas `probabilities` `[n,2]` y `label`.
- Integración directa en pipelines de scikit-learn para reentrenamiento o evaluación.
- Interpretabilidad inherente: al ser regresión logística sobre cinco variables estandarizadas, los coeficientes son directamente inspeccionables.
- No soporta tool calling, agentes, razonamiento multi-paso, generación de texto, visión, audio ni capacidades multilingües.

## Casos de uso

- Prototipado educativo de un pipeline de machine learning completo: sirve para enseñar el ciclo contrato de entrada, umbral predefinido, métricas de aceptación y exportación a ONNX en un caso de tamaño manejable.
- Prueba de integración de ONNX Runtime en el navegador: el modelo permite validar el flujo de carga, inferencia y lectura de probabilidades en cliente con un artefacto mínimo.
- Ajuste de dificultad en un juego narrativo de demostración: usar la probabilidad de mal final para modular pistas o avisos en las escenas 1 y 2, siempre dentro del escenario "The Primer v2".
- Telemetría de sesiones en entornos de prueba: analizar la relación entre tiempo de decisión, cambios de selección y acumulación de elecciones de riesgo en datos de jugadores de test.
- Referencia de buenas prácticas de documentación de modelos: la model card detalla límites, sesgos de datos sintéticos y criterios de publicación, útil como plantilla en formación interna.
- Ejercicio de auditoría de sesgo: el propio autor documenta la confusión entre "decisión rápida" y "decisión arriesgada" en los datos sintéticos, lo que lo convierte en un caso práctico para estudiar ese tipo de contaminación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo especifica umbrales de aceptación (accuracy ≥ 0,70 y recall de mal final ≥ 0,60) cuyos valores reales se remiten a `config.json → metrics`, sin cifras reproducidas en el texto disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: prácticamente nula; el modelo ONNX es de tamaño despreciable (el repositorio completo ocupa 0,0 GB).
- GPU recomendadas: no requiere GPU; funciona en CPU, incluido JavaScript/WASM en navegador mediante ONNX Runtime Web.
- Cabe en cualquier GPU de consumo e incluso en dispositivos sin GPU.
- Opciones de despliegue: ONNX Runtime (Python, C++, Web), scikit-learn en Python, o cualquier runtime compatible con ONNX.
- Latencia y throughput: no disponibles en la información proporcionada; por la naturaleza del modelo (una multiplicación matricial de 5 entradas) la latencia sería del orden de microsegundos en CPU, aunque no se aporta medición.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (clasificadores tabulares de demostración para un juego concreto) con los que establecer una comparación de parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Conjunto de datos muy pequeño (decenas de filas): las métricas son extremadamente sensibles al tamaño del conjunto de test; cambiar una sola fila puede mover la accuracy varios puntos.
- No generaliza como predictor de comportamiento de usuario; solo es válido para la estructura de 3 decisiones y 2 finales de este juego concreto.
- La mayor parte de los datos es sintética, derivada de una regla de persona simple, y no captura la diversidad del comportamiento humano real.
- Confusión documentada entre tiempo de decisión y persona: en los datos sintéticos, "decidir rápido" y "elegir la opción arriesgada" provienen de la misma persona latente, por lo que el modelo puede sobreestimar la probabilidad de mal final ante decisiones muy rápidas incluso con `riskli_sayisi_simdiye_kadar=0`.
- El modelo se distribuye al cliente (navegador) y es públicamente accesible; no debe entrenarse con datos sensibles o reales de usuarios y publicarse por esta vía.
- Licencia no especificada: no hay autorización explícita para uso comercial; debe tratarse como no apto para producción hasta aclaración del autor.
- Uso previsto exclusivamente educativo y de demostración; el autor prohíbe explícitamente su uso para decisiones reales de estrategia de contenido, privacidad o negocio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iwellike/icerik-kocu-kotu-son-riski
- No se han encontrado en la información proporcionada enlaces adicionales a papers, blogs, repositorios o demos.
