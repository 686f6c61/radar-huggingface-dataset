# Seymen55/the-primer-v2-onnx

## Resumen

The Primer v2 ONNX es un modelo de clasificación tabular de tipo vertical, desarrollado por el usuario Seymen55, que predice si un jugador necesita una intervención del denominado "Sokratik Mentor" dentro de la narrativa interactiva de educación en ingeniería del software *The Primer v2*. El modelo analiza telemetría conductual de la sesión de juego (tiempo de decisión, número de cambios de opción, errores críticos previos, pistas abiertas y riesgo de deuda técnica) y devuelve una probabilidad de intervención pedagógica.

No se trata de un modelo de lenguaje ni de una red neuronal profunda: es un `Pipeline` de scikit-learn compuesto por un `StandardScaler` seguido de una `LogisticRegression` (C=1.0, random_state=13), exportado a ONNX (opset 17) para su ejecución en navegador, Python, React Native y servidores. Su relevancia radica en que ilustra un patrón de "modelo pequeño embebido" para adaptación pedagógica en tiempo real, con un umbral de decisión fijado en 0.55 y un conjunto de métricas de evaluación documentadas.

El modelo se entrenó con un conjunto muy reducido de 250 filas (18 sesiones reales de 4 estudiantes y 32 sesiones sintéticas con semilla 13), por lo que su ámbito de aplicación es estrictamente el de la historia interactiva para la que fue diseñado. La licencia es MIT y el repositorio ocupa 0.0 GB, lo que refleja el tamaño compacto de los artefactos (`model.onnx` y `model.joblib`).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline de scikit-learn: `StandardScaler` → `LogisticRegression(C=1.0, random_state=13)` |
| Parámetros totales | 7 coeficientes + 7 medias + 7 desviaciones típicas + intercepto (modelo lineal, no disponible el recuento exacto de parámetros) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo tabular; entrada de 7 características numéricas) |
| Tipos de cuantización | No disponible (exportación ONNX en precisión original, `float32`) |
| Idiomas soportados | No disponible (modelo tabular, sin procesamiento de lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | ONNX (`model.onnx`, opset 17, `zipmap=False`) y joblib (`model.joblib`) |

## Arquitectura y entrenamiento

La arquitectura es un clasificador lineal binario sobre siete características numéricas estandarizadas: `deneyim_seviyesi`, `sahne_zorlugu`, `karar_suresi_sn`, `secenek_degistirme_sayisi`, `onceki_kritik_hata_sayisi`, `acilan_ipucu_sayisi` y `mimari_risk_skoru`. El `StandardScaler` normaliza cada entrada y la regresión logística aplica los coeficientes aprendidos (por ejemplo, +2.4668 para `karar_suresi_sn` y -1.2432 para `deneyim_seviyesi`) para producir `P(mudahale_gerekli=1)`. El umbral de decisión es 0.55.

El entrenamiento se realizó en Python 3.12 con scikit-learn 1.9.1, semilla 13 y un total de 250 filas: 90 procedentes de 18 sesiones reales de 4 estudiantes de ingeniería del software y 160 sintéticas de 32 sesiones generadas con la misma semilla. No se documenta uso de RLHF, DPO ni ajuste fino adicional; el modelo es determinista y reproducible. La exportación a ONNX se validó con una diferencia máxima frente a scikit-learn de 1.20e-07, muy por debajo del umbral de 1.0e-04.

## Capacidades

- Clasificación binaria tabular: predice si se debe activar la intervención del Sokratik Mentor y la profundidad narrativa adaptativa.
- Procesamiento de telemetría conductual en tiempo real: tiempo de decisión, cambios de opción, errores críticos, pistas abiertas y riesgo de deuda técnica.
- Inferencia en múltiples entornos: navegador (`onnxruntime-web`), Python (`onnxruntime`), React Native (`onnxruntime-react-native`) y API servidor.
- Salida de probabilidades calibradas (`probabilities`) además de la clase predicha, lo que permite ajustar el umbral en el cliente si fuera necesario.
- Determinismo y reproducibilidad: misma semilla y mismos datos producen el mismo modelo.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio, ni capacidades multilingües; es un modelo puramente numérico y vertical.

## Casos de uso

- Adaptación pedagógica en tiempo real dentro de *The Primer v2*: el modelo recibe la telemetría de la escena y decide si activar el mentor socrático cuando `P(1) >= 0.55`, ajustando la profundidad narrativa sin interrumpir innecesariamente al jugador.
- Despliegue en navegador sin backend: al ejecutarse con `onnxruntime-web`, permite inferencia local en GitHub Pages o AI Studio, reduciendo latencia y evitando el envío de telemetría a un servidor.
- Aplicación móvil con Expo: mediante `onnxruntime-react-native`, el modelo puede ejecutarse en el dispositivo para adaptar la historia en movilidad sin conexión permanente.
- Servicio de API en servidor: integrado en `server/app.py` o en una API Rails, puede recibir el JSON de telemetría y devolver la probabilidad de intervención para clientes ligeros o paneles de analítica.
- Validación de paridad en CI: el script `tests/parite.py` compara las salidas de ONNX y scikit-learn con tolerancia 1.0e-04, lo que permite usar el modelo como caso de prueba de pipelines de exportación.
- Investigación educativa: al registrar las decisiones del modelo junto con las sesiones reales, se puede estudiar la relación entre la telemetría conductual y la necesidad de apoyo pedagógico en entornos controlados.
- Prototipado de sistemas de tutoría adaptativa: sirve como referencia de bajo coste para equipos que quieran implementar lógica de intervención basada en reglas aprendidas antes de pasar a modelos más complejos.

## Benchmarks y rendimiento

| Métrica | Valor en test (30 % hold-out) | Umbral de aceptación |
|---|---|---|
| ROC-AUC | 0.9686 | >= 0.8 |
| Accuracy | 0.88 | >= 0.78 |
| F1 | 0.8861 | Informativo |
| Precision | 0.8974 | Informativo |
| Recall | 0.875 | Informativo |
| Accuracy en subconjunto de datos reales | 0.8333 | Informativo |
| Diferencia máxima ONNX ↔ sklearn | 1.20e-07 | <= 1.0e-04 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 1 MB para los pesos; el modelo cabe holgadamente en cualquier GPU, CPU o dispositivo móvil.
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU. Cualquier GPU consumer (por ejemplo, RTX 4090) es sobredimensionada para este modelo.
- Cabe en cualquier GPU consumer y en dispositivos móviles; también en navegador mediante WebAssembly.
- Opciones de despliegue: `onnxruntime` (Python), `onnxruntime-web` (navegador), `onnxruntime-react-native` (Expo), servidor Python (`server/app.py`) o API Rails.
- Latencia y throughput: no disponibles de forma explícita; por la naturaleza lineal del modelo y su tamaño, la latencia esperada es de microsegundos a milisegundos en CPU.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (clasificadores tabulares verticales para adaptación pedagógica en videojuegos educativos).

## Limitaciones y advertencias

- Prohibido su uso para evaluación oficial, calificación académica, decisiones de contratación o baremación de estudiantes; el propio autor lo restringe a adaptación pedagógica de la historia.
- Riesgo de mala interpretación de entradas fuera de distribución: si `karar_suresi_sn` supera los 60 segundos (usuario AFK), el modelo puede interpretarlo como "alta duda cognitiva"; se recomienda recortar el valor al rango [1.0, 60.0] en el cliente.
- Conjunto de datos muy pequeño: 18 sesiones reales de solo 4 estudiantes, lo que limita la generalización a otras edades, perfiles o contextos profesionales; requiere recalibración.
- Posible sesgo derivado del desbalance entre datos reales (90 filas) y sintéticos (160 filas), y de la sobrerrepresentación de un perfil concreto de estudiante.
- No es un modelo de lenguaje: no procesa texto libre, no razona y no puede explicar sus decisiones más allá de los coeficientes lineales.
- Licencia MIT permite uso comercial, pero el ámbito de aplicación sigue restringido por las advertencias del autor sobre evaluación académica.
- El umbral de 0.55 está fijado para el contexto original; cambiarlo altera el equilibrio entre precisión y recall y debe validarse con datos propios.

## Enlaces

- HuggingFace: https://huggingface.co/Seymen55/the-primer-v2-onnx
- No se han encontrado en la información disponible otros enlaces a papers, blogs, repositorios o demos.
