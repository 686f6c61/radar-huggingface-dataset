# chomeed/mimicgen_coffee_d0_224x224_dinowm

## Resumen

El modelo `chomeed/mimicgen_coffee_d0_224x224_dinowm` es un modelo de mundo (world model) para manipulación robótica basado en la arquitectura DINO-WM (arXiv:2411.04983). Desarrollado por el usuario chomeed, predice características visuales futuras en el espacio latente de DINOv2 a partir de observaciones de dos cámaras (agentview y eye_in_hand), una secuencia de acciones y el estado del robot. A diferencia de los modelos de mundo que generan píxeles, este modelo trabaja sobre parches de características DINOv2, lo que reduce la dimensionalidad y acelera el entrenamiento.

El modelo está entrenado específicamente para la tarea MimicGen "coffee_d0", que consiste en preparar café en un entorno simulado. Un paso del modelo avanza 8 acciones del entorno (0,4 segundos a 20 fps) mediante una pasada directa determinista, sin difusión ni bucle de muestreo. Es relevante porque demuestra que un predictor de características latentes puede superar a modelos de difusión en métricas L2 (PSNR, SSIM) con menor coste computacional, aunque sacrifica nitidez perceptual (LPIPS).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder DINOv2-small (ViT-S/14, congelado) + predictor transformer de 6 capas pre-norm (6 cabezas, MLP 2048) + decoder de visualización (0,2M params, solo para inspección) |
| Parametros totales | 13,4 millones entrenables (el encoder DINOv2 y el VAE de SD3.5 se descargan por separado y permanecen congelados) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 2 frames de historia (t-8 y t) por cámara; predice características en t+8 (0,4 s) |
| Tipos de cuantizacion | No disponible (checkpoint en fp32) |
| Idiomas soportados | No aplica (modelo de visión/robótica, sin capacidades lingüísticas) |
| Licencia | No disponible |
| Formato de pesos | Checkpoint PyTorch (fp32) con claves para el predictor; encoder y VAE externos |

## Arquitectura y entrenamiento

El modelo sigue el esquema de DINO-WM: un encoder de visión congelado (DINOv2-small) extrae parches de características 384-dimensionales (14×14 = 196 parches por vista y frame). El predictor es un transformer de 6 capas pre-norm con 6 cabezas y MLP de 2048 unidades. La secuencia de entrada combina 784 tokens de contexto (2 frames × 2 vistas × 196 parches), un token de acción, un token de estado y 392 tokens de consulta (query tokens) explícitos para las dos vistas futuras. Se añaden embeddings de identidad de cámara para distinguir las vistas. La pérdida es MSE simple en el espacio de características.

El entrenamiento se realizó sobre 1.200 episodios del dataset `chomeed/mimicgen_coffee_d0_224x224` (285k frames a 20 fps), con las cámaras a 224×224. El estado del robot se compone de posición del efector (3), cuaternión (4) y apertura de la pinza (2). Las ablaciones muestran que eliminar el condicionamiento por acciones incrementa el error un 8,8%, confirmando que el modelo aprende dinámicas dependientes de la acción. El historial de 2 frames es suficiente; añadir un tercero no mejora. El modelo converge alrededor del paso 51k de 60k, con error de entrenamiento 0,409 y validación 0,457.

## Capacidades

- Predicción de características visuales futuras en el espacio DINOv2 para dos cámaras simultáneamente.
- Condicionamiento por secuencias de acciones (8 pasos) y estado del robot (posición, orientación y apertura de pinza).
- Generación de imágenes RGB de inspección a través de un decoder que usa el VAE de Stable Diffusion 3.5 (solo para visualización, no para planificación).
- Soporte multi-vista mediante embeddings de identidad de cámara aprendidos.
- Inferencia determinista de un solo paso (sin difusión ni muestreo).
- No incluye capacidades de lenguaje, tool calling, agentes ni razonamiento simbólico.

## Casos de uso

- Planificación de movimientos con control predictivo (MPC/CEM): el modelo puede evaluar secuencias de acciones candidatas prediciendo el siguiente estado visual, permitiendo seleccionar la acción óptima. Aunque no se ha validado en planificación, es el uso previsto por la arquitectura DINO-WM.
- Modelo de mundo para aprendizaje por refuerzo en simulación: al predecir estados futuros, puede servir como entorno sintético para entrenar políticas sin ejecutar el simulador completo.
- Generación de datos sintéticos para entrenamiento de políticas: las predicciones de características pueden usarse como aumentación o para crear trayectorias de entrenamiento.
- Validación de dinámicas de tareas específicas: permite comprobar si una secuencia de acciones produce el resultado esperado en el espacio latente antes de ejecutarla en el robot real.
- Inspección visual de predicciones: el decoder permite visualizar las imágenes futuras previstas, útil para depurar comportamientos del modelo.
- Investigación en modelos de mundo latentes: sirve como punto de partida para comparar arquitecturas de predicción de características frente a generación de píxeles.

## Benchmarks y rendimiento

Los resultados se reportan sobre 20 episodios held-out por dataset fuente (16k ventanas). La métrica de referencia es "copiar el frame actual", que es fuerte porque t+8 está solo 0,4 s en el futuro.

| Métrica | Este modelo | Copiar frame actual |
|---|---|---|
| Feature MSE | **0,457** | 1,451 |
| PSNR | **23,25** | 18,06 |
| SSIM | **0,9167** | 0,9014 |
| LPIPS | 0,1185 | **0,0977** |

El error latente es un 68% inferior al baseline. La pérdida LPIPS está limitada por el decoder: decodificar características ground-truth con el mismo head da LPIPS 0,1023, y la predicción queda a 0,016 de ese techo. Comparado con un modelo de difusión (SD3.5 canvas-conditioned) entrenado sobre los mismos datos, este modelo alcanza PSNR 23,25 en 5,6 h (frente a 19,01 en 7 h sin converger) con la mitad de memoria. Las ablaciones (10k pasos) muestran:

| Variante | Feature MSE | Δ vs baseline |
|---|---|---|
| history 3 | 0,5252 | −0,6% |
| **history 2 (modelo final)** | **0,5282** | — |
| sin condicionamiento de estado | 0,5386 | +2,0% |
| history 1 | 0,5419 | +2,5% |
| **sin condicionamiento de acción** | **0,5748** | **+8,8%** |

## Requisitos de hardware

- VRAM estimada para inferencia: el predictor (13,4M params) más el encoder DINOv2-small (~22M params) ocupan aproximadamente 142 MB en fp32, por lo que caben en cualquier GPU moderna. El decoder de visualización solo se necesita si se quieren imágenes RGB.
- Durante el entrenamiento se usaron 12,5 GB de VRAM con batch 32 en una RTX 5090, alcanzando 96 muestras/s.
- GPUs recomendadas: cualquier GPU con al menos 4 GB de VRAM para inferencia; para entrenamiento se recomienda una GPU de 12 GB o más (RTX 3060, RTX 4070, A10, etc.).
- Opciones de despliegue: el modelo se usa mediante PyTorch directamente. No es compatible con vLLM, Ollama ni llama.cpp al no ser un modelo de lenguaje.
- Latencia: un paso de predicción (forward pass del predictor) es del orden de milisegundos en GPU moderna; no se han publicado cifras exactas de latencia.

## Comparativa con modelos similares

| Característica | Este modelo (DINO-WM multi-view) | DINO-WM original (referencia) | Modelo de difusión SD3.5 (mismo dataset) |
|---|---|---|---|
| Arquitectura | Transformer predictor + encoder DINOv2 | Transformer predictor + encoder DINOv2 | Canvas-conditioned diffusion |
| Parámetros entrenables | 13,4M | No disponible | No disponible |
| Vista | Multi-vista (2 cámaras) | Single-vista | Multi-vista (mismo dataset) |
| Predicción | Características latentes | Características latentes | Píxeles |
| PSNR (t+8) | 23,25 | No disponible | 19,01 |
| SSIM | 0,9167 | No disponible | 0,9061 |
| LPIPS | 0,1185 | No disponible | 0,0685 |
| Tiempo de entrenamiento | 5,6 h | No disponible | 7 h (sin converger) |
| Licencia | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Entrenado para un solo salto de 8 acciones; no se ha evaluado el error acumulado en rollouts multi-paso.
- No se ha validado en tareas de planificación (MPC/CEM) dentro del simulador; un buen error latente no garantiza éxito en la tarea.
- Las reconstrucciones de imagen son suaves y de baja calidad (el decoder es un head de 0,2M params sobre características DINOv2 que no fueron entrenadas para ser invertibles).
- El checkpoint no es directamente compatible con el objetivo de planificación del paper DINO-WM original, ya que el estado propioceptivo se usa solo como entrada y no se predice.
- La licencia no está especificada, lo que impide conocer las restricciones de uso comercial.
- No hay soporte para otros idiomas ni tareas fuera de la manipulación robótica con dos cámaras.
- El dataset de entrenamiento es específico de la tarea "coffee_d0"; no se ha demostrado generalización a otras tareas de MimicGen.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/chomeed/mimicgen_coffee_d0_224x224_dinowm
- Dataset de entrenamiento: https://huggingface.co/datasets/chomeed/mimicgen_coffee_d0_224x224
- Paper DINO-WM: https://arxiv.org/abs/2411.04983
- Sitio de MimicGen: https://mimicgen.github.io/
- Repositorio de entornos MimicGen: https://github.com/HaomingSong/mimicgen_environments
