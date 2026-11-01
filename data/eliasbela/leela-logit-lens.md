# eliasbela/leela-logit-lens

## Resumen

Leela-logit-lens es un artefacto de interpretabilidad derivado de Leela Chess Zero (Lc0), no un modelo de lenguaje. Se trata de una exportación a ONNX de la red neuronal de política de Lc0, modificada para que un único grafo permita leer la distribución de política tras cualquier bloque transformer mediante la técnica de logit lens. Lo desarrolla Elias Sandmann (autor de contacto del paper asociado) y se publica junto al artículo *The Algorithm Is Not the Behavior: Learned Priors Override Look-Ahead in a Chess-Playing Neural Network* (NeurIPS 2026, arXiv:2508.21380).

El modelo resuelve un problema concreto de investigación: estudiar cómo evoluciona la predicción de jugadas a lo largo de las capas de una red de ajedrez entrenada con MCTS, sin necesidad de reentrenar ni de instrumentar el motor original. Para ello exporta la red base `t2-768x15x24h-swa-5230000` de Lc0 (15 bloques, anchura 768, 24 cabezas) y elimina las cabezas de valor y de movimientos restantes, dejando solo la política sobre la codificación de 1858 movimientos de Lc0.

Es relevante ahora porque acompaña a una publicación de NeurIPS sobre priors aprendidos frente a búsqueda, y porque ofrece una demo jugable contra capas individuales de la red, lo que facilita la reproducibilidad del análisis. El repositorio es pequeño (0,4 GB) y el único fichero de pesos es `lc0-lens.onnx` (377 MB, float32).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (red de política de Leela Chess Zero, 15 bloques, anchura 768, 24 cabezas) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada fija de 112 planos de 8x8: 8 posiciones de historial x 13 planos + derechos de enroque + turno + contador de regla 50 + 2 planos constantes) |
| Tipos de cuantizacion | float32 (único formato publicado) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; dominio ajedrez) |
| Licencia | GPL-3.0 |
| Formato de pesos | ONNX (`lc0-lens.onnx`) |

## Arquitectura y entrenamiento

La red es la política de Lc0 `t2-768x15x24h-swa-5230000`: un transformer de 15 bloques con anchura 768 y 24 cabezas de atención, entrenado originalmente por el proyecto Leela Chess Zero con datos de autojuego guiado por MCTS y ajuste tipo SWA (según el nombre del checkpoint). La exportación conserva únicamente la cabeza de política; las cabezas de valor y de movimientos restantes se han eliminado.

La innovación técnica está en el grafo ONNX: además de las entradas de tablero (`/input/planes`, float32 [batch, 112, 8, 8]), acepta un vector `keep` de 15 valores que controla qué bloques se mantienen activos. Para leer tras la capa K se pone `keep[j] = 1` para j < K y 0 en el resto; en los bloques desactivados se anulan las salidas de atención y MLP y los sesgos de ambas LayerNorm, manteniendo el escalado residual y las escalas de LayerNorm. Es el logit lens por ablación a cero descrito en el paper. La salida `/output/policy` es float32 [batch, 1858] con logits sobre la codificación de movimientos de Lc0 desde el punto de vista del lado que mueve. La exportación se valida contra la implementación del paper en 64 posiciones con historial: diferencia máxima de logit de 7,6e-5 y misma jugada top en todos los K.

## Capacidades

- Evaluación de política de ajedrez: devuelve logits sobre 1858 movimientos codificados de Lc0.
- Lectura intermedia por capa: permite obtener la política tras cualquier bloque (K de 0 a 15) mediante el vector `keep`.
- Análisis de interpretabilidad: logit lens por ablación a cero para estudiar la evolución de representaciones capa a capa.
- Inferencia por lotes: la dimensión `batch` permite procesar múltiples posiciones simultáneamente.
- Integración en navegador: el grafo ONNX está pensado para ejecutarse en la demo web del proyecto.
- No soporta tool calling, agentes, multimodalidad ni generación de texto: es un modelo específico de dominio.

## Casos de uso

- Investigación en interpretabilidad de redes de ajedrez: permite medir en qué capa emerge la predicción de una jugada concreta y comparar la política intermedia con la final, sin modificar el motor original.
- Reproducción del paper de NeurIPS 2026: el grafo replica el logit lens del artículo con tolerancia de 7,6e-5, lo que facilita verificar los resultados de priors aprendidos frente a búsqueda.
- Análisis de sesgos de prior: al leer la política antes de cualquier búsqueda MCTS, se puede aislar qué parte de la decisión proviene de la red y qué parte del look-ahead.
- Docencia y divulgación: la demo web permite jugar contra capas individuales, ilustrando cómo una red profunda construye su evaluación de forma incremental.
- Auditoría de checkpoints de Lc0: comparar la política intermedia de distintas redes exportadas con el mismo esquema para estudiar diferencias de entrenamiento.
- Prototipado de herramientas de análisis ajedrecístico: integrar el grafo ONNX en pipelines de evaluación por lotes de posiciones con historial de 8 jugadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta la validación de equivalencia numérica con la implementación del paper (diferencia máxima de logit de 7,6e-5 en 64 posiciones y misma jugada top en todos los K).

## Requisitos de hardware

- VRAM estimada: el fichero pesa 377 MB en float32; la inferencia requiere aproximadamente 0,4-1 GB de memoria según el tamaño de lote y el runtime.
- GPU recomendadas: cualquier GPU con soporte ONNX Runtime (RTX 4090, A100, H100) funciona; para el caso de uso previsto (navegador) basta con ejecución en CPU o WebGPU.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna e incluso en CPU para lotes pequeños.
- Opciones de despliegue: ONNX Runtime (CPU, CUDA, WebGPU/WebAssembly), y cualquier runtime compatible con ONNX; no se distribuyen pesos en GGUF ni safetensors.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Formato |
|---|---|---|---|---|---|
| eliasbela/leela-logit-lens | no disponible (red 768x15x24) | entrada fija 112x8x8 | Política de ajedrez con lectura por capa | GPL-3.0 | ONNX |
| Red base Lc0 `t2-768x15x24h-swa-5230000` | misma red, con cabezas de valor y moves-left | igual | Política, valor y movimientos restantes | GPL-3.0 | pesos de Lc0 |
| Stockfish NNUE | no disponible | no aplica | Evaluación de ajedrez clásica | GPL-3.0 | binario/NNUE |

La comparación con modelos de lenguaje no procede: este artefacto es específico de ajedrez e interpretabilidad. Frente a la red base de Lc0, la diferencia clave es la eliminación de las cabezas de valor y moves-left y la posibilidad de leer la política tras cualquier capa.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni agentes, y no debe evaluarse con benchmarks de NLP.
- Solo devuelve política; no hay cabeza de valor ni de movimientos restantes, por lo que no sirve para evaluación posicional completa ni para gestionar el reloj.
- La lectura intermedia usa ablación a cero de atención, MLP y sesgos de LayerNorm; los resultados no equivalen a una red truncada entrenada de forma independiente.
- La entrada exige el formato exacto de Lc0 (112 planos con historial de 8 posiciones); un preprocesado incorrecto invalida los logits.
- Licencia GPL-3.0: cualquier uso derivado o distribuido debe cumplir las obligaciones de copyleft de la GPL, lo que puede ser restrictivo para productos propietarios.
- No se han publicado métricas de fuerza de juego ni benchmarks estándar para este artefacto concreto.
- Riesgo de sobreinterpretación: la política intermedia refleja priors aprendidos, no la decisión final del motor con búsqueda.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/eliasbela/leela-logit-lens
- Demo jugable contra capas: https://leela-logit-lens.github.io/
- Paper (arXiv): https://arxiv.org/abs/2508.21380
- Redes de Leela Chess Zero: https://storage.lczero.org/files/networks-contrib/
- Repositorio leela-interp: https://github.com/HumanCompatibleAI/leela-interp
