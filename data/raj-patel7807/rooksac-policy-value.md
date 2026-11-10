# Raj-Patel7807/rooksac-policy-value

## Resumen

RookSac Policy Value Network v1 es una red neuronal de tipo policy-value desarrollada por Raj-Patel7807 como componente de evaluación del motor de ajedrez RookSac, escrito en C++20. El modelo combina una cabeza de política (que predice la distribución de probabilidad sobre las jugadas legales) con una cabeza de valor (que estima la ventaja posicional desde la perspectiva de las blancas en el rango [-1, 1]). Sigue el paradigma clásico de AlphaZero, pero con una arquitectura ResNet mucho más ligera: solo 2 bloques residuales y 32 canales.

La relevancia de esta publicación es limitada y de carácter experimental. Se trata de un artefacto inicial entrenado con un conjunto de datos muy reducido (2.000 partidas de Lichess con jugadores de al menos 1800 Elo) durante una única época, lo que se traduce en una precisión top-1 de política del 14,04% en test y un error cuadrático medio de valor cercano a 0,99. El autor reconoce explícitamente que la fuerza de juego no se ha establecido mediante enfrentamientos motor contra motor.

El modelo no es un modelo de lenguaje ni un transformer de propósito general: es una red específica de ajedrez con una representación de entrada de 18 planos de 8×8 y un vocabulario de política de 4.240 movimientos. Su interés principal es como ejemplo de pipeline reproducible de entrenamiento de redes policy-value en PyTorch y como base para experimentación, no como un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PolicyValueNet-ResNet (red residual con cabezas de política y valor) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de ajedrez, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | `.rks` (artefacto nativo de RookSac), con `training_summary.json`, `training_metrics.csv` y `model.sha256` |
| Entrada | 18 × 8 × 8 (12 planos de piezas, 1 de turno, 4 de derechos de enroque, 1 de captura al paso) |
| Vocabulario de política | 4240 movimientos |
| Versión de esquema | 2.0.0 |
| Versión de vocabulario | 2.0.0 |
| Perspectiva del valor | Blancas, en el rango [-1, 1] |
| Bloques residuales | 2 |
| Canales | 32 |

## Arquitectura y entrenamiento

La red es una ResNet de ajedrez con dos bloques residuales y 32 canales por capa. La entrada codifica la posición en 18 planos de 8×8: 12 planos para las piezas (6 tipos × 2 colores), 1 plano para el turno, 4 planos para los derechos de enroque y 1 plano para la casilla de captura al paso. La cabeza de política produce una distribución sobre un vocabulario fijo de 4.240 movimientos (esquema 2.0.0), y la cabeza de valor regresa un escalar en [-1, 1] desde la perspectiva de las blancas.

El entrenamiento se realizó en PyTorch sobre una NVIDIA Tesla T4, con un dataset extraído del archivo de partidas estándar de Lichess (mínimo 1800 Elo), procesando 2.000 partidas durante una sola época, con batch size de 32, learning rate de 0,001 y semilla aleatoria 42. No se documenta el uso de RLHF, DPO ni aprendizaje por refuerzo; se trata de aprendizaje supervisado a partir de movimientos jugados por humanos. La innovación técnica es escasa: el interés está en la reproducibilidad del pipeline y en el formato de artefacto nativo `.rks` con checksum SHA-256, más que en aportaciones algorítmicas.

## Capacidades

- Predicción de política: distribución de probabilidad sobre 4.240 movimientos legales codificados en el vocabulario del motor.
- Evaluación posicional: estimación escalar de ventaja en [-1, 1] desde la perspectiva de las blancas.
- Integración como evaluador dentro del motor de ajedrez RookSac (C++20).
- Codificación completa de reglas relevantes para la búsqueda: turno, enroques y captura al paso.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No dispone de modo de pensamiento, visión, audio ni generación de texto.

## Casos de uso

- Evaluación de posiciones en un motor de ajedrez: la cabeza de valor proporciona una estimación rápida de la ventaja posicional que puede sustituir o complementar una función de evaluación heurística en la búsqueda alfa-beta.
- Ordenación de movimientos (move ordering): la distribución de política sobre 4.240 movimientos permite priorizar candidatos en la búsqueda, reduciendo el número de nodos explorados si la precisión top-k es suficiente.
- Base para experimentación en aprendizaje por refuerzo: el modelo puede servir como red inicial para self-play, dado que el pipeline de entrenamiento y el formato de artefacto están documentados y versionados.
- Reproducción de pipelines policy-value: útil como referencia didáctica para implementar una red ResNet de ajedrez en PyTorch con codificación de 18 planos y vocabulario fijo.
- Pruebas de integración del motor RookSac: el artefacto `.rks` con checksum SHA-256 permite validar la carga de modelos y la compatibilidad de esquema y vocabulario en el motor.
- Benchmarking de codificaciones de entrada: la representación de 18 planos puede compararse con alternativas (por ejemplo, 12 planos sin metadatos) en tareas de predicción de movimientos.

## Benchmarks y rendimiento

| Métrica | Validación | Test |
|---|---:|---:|
| Precisión top-1 de política | 14,44% | 14,04% |
| Precisión top-3 de política | 29,75% | 28,68% |
| MSE de valor | 0,98995 | 0,98598 |
| MAE de valor | 0,91784 | 0,91823 |

No se han publicado resultados de benchmarks de fuerza de juego (Elo, enfrentamientos motor contra motor) en la información disponible. Los valores de MSE y MAE cercanos a 1,0 indican que la cabeza de valor apenas supera una predicción trivial en el rango [-1, 1].

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; con 2 bloques residuales y 32 canales, el modelo es extremadamente pequeño y cabe holgadamente en cualquier GPU consumer, aunque no se publica el número de parámetros.
- GPU de entrenamiento documentada: NVIDIA Tesla T4.
- GPU recomendadas para inferencia: cualquier GPU con soporte CUDA; también es viable en CPU dado el reducido tamaño de la red.
- Cabe en GPU consumer: sí, previsiblemente en cualquier modelo con al menos unos pocos GB de VRAM; no se especifica el mínimo exacto.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables); el despliegue previsto es a través del motor RookSac mediante el artefacto `.rks`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RookSac Policy Value Network v1 | ResNet policy-value para ajedrez | no disponible | no aplica | MIT | Hugging Face |
| AlphaZero (referencia) | ResNet policy-value para ajedrez | no disponible públicamente | no aplica | no disponible | no disponible |
| Leela Chess Zero | ResNet policy-value para ajedrez | múltiples variantes | no aplica | GPL (motor) | pública |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada; la comparativa se limita a categoría, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo experimental inicial: el propio autor indica que una sola época de entrenamiento es insuficiente para establecer una fuerza de juego sólida.
- Dataset muy reducido: 2.000 partidas con mínimo 1800 Elo, lo que limita la generalización y sesga el modelo hacia el estilo de juego de ese rango.
- Precisión top-1 de política del 14,04% en test: baja para uso competitivo; la top-3 (28,68%) también es limitada.
- Valor con MSE de 0,98598 y MAE de 0,91823: la cabeza de valor tiene una capacidad predictiva muy débil.
- Fuerza de juego no verificada: no se han realizado enfrentamientos motor contra motor.
- Sesgos potenciales derivados de la distribución de partidas de Lichess (nivel de juego, aperturas populares, ausencia de partidas de élite).
- Licencia MIT para el modelo, pero los términos del dataset de Lichess deben revisarse por separado; el autor no reclama la propiedad de los registros originales.
- No apto para producción como motor de ajedrez sin entrenamiento adicional y validación de fuerza.
- Formato de pesos propietario (`.rks`): requiere el motor RookSac o un conversor para su uso fuera de ese ecosistema.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Raj-Patel7807/rooksac-policy-value
- Dataset de Lichess: https://database.lichess.org/
