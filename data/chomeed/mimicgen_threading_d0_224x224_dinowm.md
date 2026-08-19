# chomeed/mimicgen_threading_d0_224x224_dinowm

## Resumen

El modelo `chomeed/mimicgen_threading_d0_224x224_dinowm` es un world model (modelo de mundo) de estilo DINO-WM desarrollado por el usuario chomeed para robótica de manipulación con dos cámaras. A diferencia de los modelos de mundo convencionales que predicen píxeles, este modelo predice características de parches DINOv2 (features) en el espacio latente, lo que reduce drásticamente el coste computacional y mejora la precisión de la predicción a corto plazo. Está entrenado específicamente sobre la tarea `threading_d0` del conjunto de datos MimicGen, que consiste en enhebrar un cable o hilo a través de un agujero, y avanza 8 acciones del entorno (0,4 segundos a 20 fps) en una única pasada determinista, sin difusión ni bucle de muestreo.

La arquitectura combina un encoder DINOv2-Small congelado (ViT-S/14, 384 dimensiones) con un predictor transformer de 6 capas y un decodificador basado en el VAE de SD3.5 para visualización. El modelo tiene 13,4 millones de parámetros entrenables y se entrena con 251.811 ventanas de entrenamiento procedentes de tres datasets de MimicGen. Su relevancia radica en demostrar que la predicción de features latentes supera claramente al baseline de copiar el frame actual (error latente un 68% inferior), y que el condicionamiento por acciones es esencial para el comportamiento del modelo, lo que lo hace útil para planificación y control predictivo en robótica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder DINOv2-Small congelado (ViT-S/14) + predictor transformer de 6 capas (pre-norm, 6 cabezas, MLP 2048) + decodificador SD3.5 VAE (solo visualización) |
| Parametros totales | 13,4 millones (entrenables, fp32) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1178 tokens (2 frames × 2 vistas × 196 parches + acción + estado + 2×196 query tokens) |
| Tipos de cuantizacion | no disponible (checkpoint fp32) |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | checkpoint PyTorch (.pt) con solo las partes entrenables; DINOv2 y SD3 VAE se descargan por separado |

## Arquitectura y entrenamiento

El modelo sigue el esquema de DINO-WM (arxiv:2411.04983) pero con diferencias clave: es multi-vista (dos cámaras comparten una secuencia con embeddings de vista aprendidos y se predicen conjuntamente, mientras que la implementación de referencia es de vista única), usa tokens de consulta explícitos (en la referencia, cada posición excepto la última tiene su objetivo visible en la entrada), y la propiocepción (estado del robot) solo se usa como entrada, no se predice. El predictor es un transformer de 6 capas pre-norm con 6 cabezas y MLP de 2048, con atención bidireccional completa sobre 1178 tokens. Las embeddings de identidad son aditivas: `pos_emb` + `view_emb` + `frame_emb`.

El entrenamiento utiliza una pérdida MSE simple en el espacio de features. El decodificador (que convierte features a RGB a través del VAE de SD3.5) se entrena con features separadas (detached) y solo sirve para visualización. Los datos provienen de tres datasets de MimicGen (éxitos, fallos y el conjunto base), con 251.811 ventanas de entrenamiento y 15.889 de validación. Las cámaras son `agentview` y `eye_in_hand` a 224×224. El estado del robot es `observation.state[:9]` (posición del efector final, cuaternión y apertura del gripper). Se entrenó durante 60.000 pasos con un único seed y un único checkpoint por tarea.

## Capacidades

- Predicción de features DINOv2 futuras (a t+8) dadas dos imágenes de contexto (t-8 y t) de dos cámaras, una secuencia de 8 acciones y el estado del robot.
- Avance temporal determinista de 0,4 segundos en una sola pasada, sin difusión ni muestreo.
- Multi-vista: procesa simultáneamente las cámaras `agentview` y `eye_in_hand`, con embeddings de vista aprendidos.
- Condicionamiento por acciones: el modelo es genuinamente sensible a la secuencia de acciones (eliminar el condicionamiento de acción degrada el error latente un 8,8%, el mayor impacto entre las ablaciones).
- Condicionamiento por estado del robot (posición, orientación y apertura del gripper).
- Decodificación a imagen RGB (solo inspección) mediante el VAE de SD3.5, con calidad limitada por el decodificador de 0,2M de parámetros.
- Función `predict_from_features` para reutilizar el contexto codificado en bucles de planificación.

## Casos de uso

- Planificación predictiva en robótica de manipulación: el modelo puede integrarse en bucles de MPC/CEM (como en el paper DINO-WM) para evaluar secuencias de acciones candidatas y seleccionar la que minimice el error latente respecto al objetivo deseado.
- Control anticipatorio de tareas de ensamblaje o inserción (como enhebrar un cable): al predecir el estado futuro de las dos cámaras, permite ajustar la trayectoria antes de que ocurra el error.
- Generación de datos sintéticos de entrenamiento: las predicciones de features pueden usarse para aumentar datasets de demostraciones robóticas sin necesidad de ejecutar el simulador.
- Evaluación de políticas en simulación: dado un rollout de acciones, el modelo puede estimar si la política se acerca al comportamiento deseado comparando features predichas con features objetivo.
- Investigación en world models latentes: sirve como referencia para estudiar la calidad de la predicción en espacio de features frente a espacio de píxeles, con métricas como feature MSE, PSNR, SSIM y LPIPS.
- Inspección visual de trayectorias: aunque el decodificador es limitado, permite reconstruir imágenes aproximadas del futuro para depurar visualmente el comportamiento del modelo.

## Benchmarks y rendimiento

Se evaluó en episodios held-out (20 por dataset fuente, 15.889 ventanas). La comparativa principal es contra el baseline de copiar el frame actual (copy-the-current-frame), que es fuerte porque t+8 está solo a 0,4 segundos. También se reporta el oráculo (techo del decodificador), que es la mejor reconstrucción posible dado un decodificador fijo.

| Metrica | Este modelo | Copiar frame actual | Oráculo (techo decodificador) |
|---|---|---|---|
| Feature MSE | **0,4987** | 1,5545 | — |
| PSNR | **24,12** | 20,17 | 25,54 |
| SSIM | 0,9213 | 0,9156 | 0,9263 |
| LPIPS | 0,1169 | 0,0771 | 0,1011 |

El error latente es un 68% inferior al baseline. El autor advierte que la columna LPIPS está limitada por el decodificador, no por la dinámica: decodificar features de ground-truth con el mismo decodificador da LPIPS 0,1011, ya peor que copiar. Por tanto, la métrica principal para juzgar el modelo es feature MSE.

Resultados en las cuatro tareas del conjunto (misma arquitectura e hiperparámetros, 60k pasos cada una):

| Tarea | Feat MSE | Copia | PSNR | Copia | SSIM | Copia | LPIPS | Copia |
|---|---|---|---|---|---|---|---|---|
| coffee_d0 | 0,457 | 1,451 | 23,25 | 18,06 | 0,9167 | 0,9000 | 0,1185 | 0,0977 |
| **threading_d0** | 0,499 | 1,554 | 24,12 | 20,17 | 0,9213 | 0,9156 | 0,1169 | 0,0771 |
| square_d1 | 0,670 | 1,428 | 19,82 | 16,99 | 0,8294 | 0,8577 | 0,2424 | 0,1329 |
| hammer_cleanup_d1 | 0,655 | 1,886 | 20,38 | 15,77 | 0,8248 | 0,8233 | 0,2828 | 0,1730 |

El error latente relativo (feat/copia) es 0,31 en coffee, 0,32 en threading, 0,47 en square y 0,35 en hammer. Square es la tarea más difícil y la única donde SSIM queda por debajo de copiar, pero su oráculo también está por debajo de copiar, lo que indica que tanto el decodificador como la predicción contribuyen al problema.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo entrenable es de 13,4M de parámetros en fp32 (unos 54 MB), pero requiere cargar DINOv2-Small (unos 22M de parámetros) y el VAE de SD3.5 (unos 200M de parámetros en bf16). En total, la inferencia cabe en una GPU con al menos 4-6 GB de VRAM, dependiendo del tamaño de batch.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA y al menos 8 GB de VRAM (por ejemplo, RTX 3060 o superior). El entrenamiento se realizó en una RTX 5090 con 12,5 GB de pico a batch 32.
- Capacidad en GPU de consumo: sí, cabe en GPUs de consumo como RTX 3090, RTX 4090 o RTX 5090. Incluso en GPUs más modestas con cuantización de los componentes congelados.
- Opciones de despliegue: el modelo se usa mediante el código Python del repositorio (clase `DinoDynamics`), cargando DINOv2 y SD3 VAE por separado. No se menciona soporte para vLLM, llama.cpp, Ollama o TGI, ya que es un modelo de visión para robótica, no un LLM.
- Latencia y throughput: durante el entrenamiento se alcanzaron ~96 muestras/s en una RTX 5090 a batch 32. La inferencia de un solo paso (una pasada determinista) es significativamente más rápida, del orden de milisegundos en GPU moderna, aunque el dato exacto no está disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El modelo se basa en DINO-WM (arxiv:2411.04983), pero no se han publicado comparaciones con otras implementaciones de world models en el contexto de esta ficha. Se indica "no disponible".

## Limitaciones y advertencias

- El modelo está entrenado para un único salto de 8 acciones; el rollout multi-paso (compounding) no está probado y podría acumular errores.
- No se ha evaluado en planificación (la métrica principal del paper DINO-WM es la tasa de éxito de la tarea bajo CEM/MPC en simulador). Un buen error latente no garantiza buenos resultados de planificación.
- Las reconstrucciones son suaves o borrosas: las features de DINOv2 no fueron diseñadas para ser invertibles, y el decodificador de 0,2M de parámetros limita la calidad de imagen (LPIPS del oráculo ya es peor que copiar).
- Entrenado con un único seed y un único checkpoint por tarea; no hay información sobre robustez frente a variaciones de inicialización.
- La propiocepción solo se usa como entrada; el checkpoint no es directamente utilizable con el objetivo de planificación del paper original (que requiere predecir también el estado) sin añadir una cabeza de estado.
- El modelo es específico de la tarea `threading_d0` de MimicGen y de las cámaras `agentview` y `eye_in_hand`; no se ha demostrado generalización a otras tareas, configuraciones de cámara o entornos.
- La licencia no está especificada en la información disponible; debe consultarse con el autor antes de uso comercial.
- No se reportan sesgos conocidos, pero al estar entrenado en datos simulados de MimicGen, puede no transferir bien a entornos reales sin fine-tuning.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/chomeed/mimicgen_threading_d0_224x224_dinowm
- Dataset base de entrenamiento: https://huggingface.co/datasets/chomeed/mimicgen_threading_d0_224x224
- Dataset de éxitos con flujo MTDiT: https://huggingface.co/datasets/chomeed/mimicgen_threading_d0_224x224_mtdit_flow_55k_success
- Dataset de fallos con flujo MTDiT: https://huggingface.co/datasets/chomeed/mimicgen_threading_d0_224x224_mtdit_flow_55k_failure
- Paper DINO-WM: https://arxiv.org/abs/2411.04983
- Proyecto MimicGen: https://mimicgen.github.io/
- Repositorio de conversión de MimicGen a LeRobot (relacionado): https://github.com/kywch/mg2hfbot
