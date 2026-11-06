# sanjeevafk/thadam-guidance-fcn

## Resumen

THADAM Guidance FCN es una red neuronal totalmente convolucional (FCN) de 48.161 parámetros que predice un mapa de calor de coste residual de desvío por obstáculos sobre una ventana de rejilla de 32x32 celdas. La desarrolla el usuario sanjeevafk en el contexto del Smart India Hackathon (SIH 2026), para el enunciado SIH26123 de Bharat Electronics Limited, como componente del motor de coordinación de flotas de robots móviles autónomos (AMR) THADAM, escrito íntegramente en Rust. El modelo no es un modelo de lenguaje: es un heurístico neuronal auxiliar para planificación de rutas.

El problema que resuelve es concreto: los heurísticos clásicos de búsqueda A* (Manhattan, Euclídea) son ciegos a los obstáculos, lo que provoca que el planificador explore callejones sin salida en almacenes y genere decenas de miles de expansiones de estado redundantes cuando hay varios robots en tráfico. Esta FCN predice el coste residual (coste real hasta el objetivo menos la distancia Manhattan) y se usa para reordenar el conjunto abierto de A*, acelerando la búsqueda sin romper la admisibilidad.

Su relevancia radica en el despliegue: con 194 KB en FP32 y exportación a ONNX (opset 17), se ejecuta a bordo del robot mediante tract-onnx en Rust con un plan compilado sin asignaciones dinámicas. Es un ejemplo de heurístico aprendido de tamaño mínimo, entrenado con un oráculo de Dijkstra inverso sobre 1.500 layouts sintéticos de almacén.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red totalmente convolucional (FCN) con convoluciones dilatadas |
| Parámetros totales | 48.161 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje; campo receptivo de 63x63 celdas) |
| Tipos de cuantización | No disponible (se distribuye en FP32; 194 KB en ONNX) |
| Idiomas soportados | No disponible (no aplica) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset 17, forma estática) |

Especificaciones adicionales de entrada y salida:

| Parámetro | Valor |
|---|---|
| Tensor de entrada | `[1, 4, 32, 32]` fp32: canal 0 máscara de transitabilidad, canales 1 y 2 coordenadas relativas al objetivo / 32, canal 3 distancia Manhattan / 64 |
| Tensor de salida | `[1, 1, 32, 32]` fp32: coste residual normalizado / 32 (se aplica clamp >= 0 en inferencia) |
| Motor de inferencia | tract-onnx (Rust), plan compilado sin asignaciones dinámicas |
| Métrica declarada | MSE (masked MSE de validación: 0,00646) |
| Tamaño del repositorio | 0,0 GB |

## Arquitectura y entrenamiento

La arquitectura es una FCN con convoluciones dilatadas diseñada para cubrir por completo la ventana local de 32x32 celdas: el campo receptivo efectivo es de 63x63 celdas. La entrada combina una máscara de transitabilidad, la posición relativa del objetivo normalizada y la distancia Manhattan normalizada; la salida es un mapa de coste residual normalizado que se multiplica por 32 en tiempo de ejecución. El heurístico final aplicado en Rust es `h(pos) = kinematic_heuristic(pos) + residual(pos) * 32`. El diseño es deliberadamente conservador: donde la red no tiene certeza, predice valores cercanos a cero, de modo que la búsqueda degrada de forma gradual al A* Manhattan admisible estándar y el modelo nunca invalida los invariantes de admisibilidad.

El entrenamiento se basa en un oráculo de Dijkstra inverso aplicado a 1.500 layouts sintéticos de almacén con estructuras de pasillos y clutter. La pérdida reportada es una MSE enmascarada de 0,00646 en validación, con una correlación frente al ground truth de entre 0,88 y 0,93. El repositorio incluye `train_guidance_model.py` con el pipeline completo y reproducible: generador de layouts sintéticos, oráculo de Dijkstra inverso y exportación validada. No se documentan fases de RLHF, DPO ni ajuste por preferencias, lo cual es coherente con la naturaleza no generativa del modelo.

## Capacidades

- Predicción de mapas de calor de coste residual de desvío por obstáculos sobre ventanas de 32x32 celdas.
- Generación de heurísticos neuronales admisibles para búsqueda A* en rejillas 2D.
- Conciencia de obstáculos: corrige la ceguera de Manhattan y Euclídea ante callejones sin salida.
- Degradación segura: salidas cercanas a cero en zonas de incertidumbre, preservando la admisibilidad.
- Inferencia en Rust a bordo del robot mediante tract-onnx, con plan compilado y sin asignaciones dinámicas.
- Integración con coordinación de flotas: el modelo se usa dentro de THADAM, que gestiona ruptura de ciclos wait-for-graph descentralizada y reruteo dinámico ante pasillos bloqueados.
- Exportación ONNX de forma estática, apta para despliegue en CPU sin GPU.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso en lenguaje natural, visión, audio ni capacidades multilingües; no es un modelo de lenguaje.

## Casos de uso

- Planificación de rutas en almacenes con múltiples AMR: el modelo reordena el conjunto abierto de A* con el coste residual, reduciendo expansiones de estado en escenarios de tráfico denso (hasta 9,5 veces menos en el benchmark de 8 AMR y 10 tareas). Es adecuado porque su tamaño de 194 KB permite ejecutarlo en el propio robot sin infraestructura de servidor.
- Reruteo dinámico ante pasillos bloqueados: cuando una ruta queda cortada, la red recalcula el mapa de coste residual sobre la ventana local y el planificador evita reintroducirse en el callejón bloqueado. La demostración del repositorio (`simulation.gif`) ilustra exactamente este escenario.
- Coordinación de flotas descentralizada: integrado en THADAM, el heurístico acelera la búsqueda de cada robot mientras el motor resuelve ciclos wait-for-graph entre agentes, lo que reduce la contención en intersecciones y pasillos compartidos.
- Despliegue en robótica de bajo consumo: al ejecutarse con tract-onnx en CPU y sin GPU, encaja en controladores embebidos de AMR donde no hay acelerador dedicado.
- Investigación en heurísticos aprendidos: el pipeline reproducible (`train_guidance_model.py`) permite regenerar layouts sintéticos, recalcular el oráculo de Dijkstra inverso y reentrenar la red para otras topologías de almacén.
- Simulación y validación previa a producción: el modelo puede evaluarse en simuladores multiagente con invariantes de evitación de colisiones ISO 3691-4 antes de desplegarlo en flota real, comparando expansiones y tasa de finalización frente a A* Manhattan.
- Enseñanza de planificación con aprendizaje: caso didáctico de cómo un heurístico neuronal pequeño y con degradación segura se integra en un algoritmo de búsqueda clásico sin comprometer garantías teóricas.

## Benchmarks y rendimiento

Resultados publicados en la model card, medidos en simulaciones multiagente de almacén con invariantes de evitación de colisiones ISO 3691-4:

| Escenario | A* cinemático (Manhattan) | THADAM Guidance FCN | Aceleración |
|---|---|---|---|
| Rejilla 32x32, 8 AMR, 10 tareas | 0/10 tareas completadas (115k expansiones, thrashing) | 8/10 tareas completadas (12k expansiones) | 9,5x menos expansiones |
| Rejilla 32x32, 8 AMR (routing híbrido) | 65% de finalización (20,7k expansiones) | 85% de finalización (5,3k expansiones) | 3,9x menos expansiones |
| Rejilla 15x15, 4 AMR | 5/5 tareas (221 expansiones) | 5/5 tareas (255 expansiones) | Paridad aproximada en rejillas pequeñas |

Métricas de validación del modelo: masked MSE de 0,00646 y correlación con el ground truth de 0,88 a 0,93. No se han publicado resultados de benchmarks estándar de lenguaje (MMLU, HumanEval, GSM8K) porque el modelo no es generativo de texto.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo es de 194 KB en FP32 y se ejecuta en CPU.
- GPU recomendadas: ninguna necesaria. Cualquier CPU moderna es suficiente; no se documentan requisitos de acelerador.
- Cabe en GPU de consumo: sí, y también en hardware embebido de robot; el despliegue de referencia es en CPU mediante tract-onnx en Rust.
- Opciones de despliegue: tract-onnx (Rust, plan compilado sin asignaciones dinámicas), ONNX Runtime con `CPUExecutionProvider` (Python, según el quickstart), y cualquier runtime compatible con ONNX opset 17.
- Latencia y throughput estimados: no disponibles en la información proporcionada. La model card solo reporta reducción de expansiones de búsqueda, no tiempos de inferencia absolutos.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de heurísticos neuronales para planificación de rutas en la documentación proporcionada. La comparación relevante que sí publica el autor es frente al heurístico clásico Manhattan (ver tabla de benchmarks), no frente a otros modelos neuronales.

| Alternativa | Tipo | Parámetros | Contexto / ventana | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| THADAM Guidance FCN | FCN con convoluciones dilatadas | 48.161 | 32x32 celdas (campo receptivo 63x63) | Apache-2.0 | Hugging Face, ONNX |
| A* con Manhattan | Heurístico analítico | 0 | No aplica | No aplica | Estándar |
| A* con Euclídea | Heurístico analítico | 0 | No aplica | No aplica | Estándar |

## Limitaciones y advertencias

- Sesgos conocidos: el modelo se entrena exclusivamente con layouts sintéticos de almacén generados por el autor; su comportamiento en topologías del mundo real no está validado en la información disponible.
- Riesgo de alucinación: no aplica en sentido generativo, pero sí existe riesgo de predicciones de coste erróneas en distribuciones de obstáculos no representadas en el entrenamiento; el diseño mitiga esto con la degradación a cero, que revierte a A* Manhattan.
- Limitaciones de contexto: la ventana es fija de 32x32 celdas; no modela dependencias globales más allá del campo receptivo de 63x63 celdas.
- Rendimiento dependiente del tamaño de rejilla: en rejillas pequeñas (15x15, 4 AMR) el modelo no aporta mejora e incluso genera ligeramente más expansiones que Manhattan (255 frente a 221).
- Restricciones de licencia: Apache-2.0 permite uso comercial, modificación y redistribución con atribución y aviso de licencia; no se documentan restricciones adicionales.
- Caveats para producción: los benchmarks proceden de simulaciones del propio autor, no de validación independiente; el repositorio tiene 0 descargas y 0 likes, y el tamaño reportado es de 0,0 GB, lo que sugiere una adopción y validación externa aún nulas.
- Dependencia de calibración: el factor de escala `residual * 32` y el clamp a valores no negativos son parte del contrato de inferencia; alterarlos puede romper la admisibilidad del heurístico.
- No es un modelo de lenguaje: no debe evaluarse con benchmarks de texto ni esperarse capacidades de generación, razonamiento verbal o tool calling.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sanjeevafk/thadam-guidance-fcn
- Repositorio del proyecto THADAM (SIH26123): https://github.com/lildosa/SIH26123
- tract-onnx (motor de inferencia en Rust): https://github.com/sonos/tract
- Archivo del modelo: https://huggingface.co/sanjeevafk/thadam-guidance-fcn/resolve/main/guidance.onnx
- Demostración en vídeo: https://huggingface.co/sanjeevafk/thadam-guidance-fcn/resolve/main/replay.mp4
- Demostración animada: https://huggingface.co/sanjeevafk/thadam-guidance-fcn/resolve/main/simulation.gif
- Script de entrenamiento: https://huggingface.co/sanjeevafk/thadam-guidance-fcn/resolve/main/train_guidance_model.py
