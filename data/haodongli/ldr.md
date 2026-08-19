# haodongli/LDR

## Resumen

LDR (Latent Dynamics Reasoning) es un modelo de mundo de video (video world model) desarrollado por Adobe Research en colaboración con académicos, presentado en el artículo "Learning How the World Evolves: Extrapolative Video World Models via Latent Dynamics Reasoning" (arXiv:2608.09926). A diferencia de los modelos de predicción de video convencionales que aprenden a replicar píxeles futuros, LDR aprende "cómo evoluciona el futuro" en lugar de "qué es el futuro", capturando la dinámica subyacente directamente de los píxeles y extrapolándola más allá de la distribución de entrenamiento. Es el primer modelo de mundo de video que logra extrapolación de dinámicas aprendidas a escenarios no vistos, como predecir el movimiento de un cuadrado azul moviéndose de derecha a izquierda cuando solo se ha entrenado con bolas rojas moviéndose de izquierda a derecha.

El modelo se distribuye bajo licencia Apache 2.0 y está disponible en Hugging Face con pesos para resoluciones de 128x128 y 256x256, organizados en tareas individuales (movimiento uniforme, parábola, colisión, acercamiento y rebote) y una tarea conjunta de cinco dinámicas. El repositorio pesa 0.6 GB, lo que sugiere un modelo relativamente ligero, aunque no se especifican los parámetros totales. Está orientado a la investigación en inteligencia física (physical AI) y simulación de escenarios dinámicos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de mundo latente con razonamiento de dinámica) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (modelo de video, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo visual, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (archivos .pt) |

## Arquitectura y entrenamiento

La información pública no detalla la arquitectura interna (número de capas, tipo de atención, etc.). Según el artículo, LDR emplea un enfoque de razonamiento de dinámica latente: en lugar de predecir directamente los píxeles futuros, el modelo infiere una representación latente de la dinámica del sistema y la utiliza para extrapolar la evolución temporal. Esto le permite generalizar a cambios de distribución severos, como variaciones en color, forma o dirección del movimiento, algo que los modelos de video convencionales no logran.

No se han publicado datos sobre el conjunto de entrenamiento (número de vídeos, composición, duración) ni sobre el proceso de optimización (pérdidas, uso de RLHF o DPO). El repositorio incluye pesos entrenados para cinco dinámicas físicas básicas (movimiento uniforme, parábola, colisión, acercamiento y rebote) tanto por separado como en una versión conjunta, lo que sugiere un entrenamiento supervisado con vídeos sintéticos o simulados.

## Capacidades

- Predicción de video a partir de una imagen inicial (pipeline image-to-video).
- Extrapolación de dinámicas aprendidas más allá de la distribución de entrenamiento, por ejemplo, generalizar de bolas rojas a cuadrados azules o de movimientos izquierda-derecha a derecha-izquierda.
- Modelado de cinco dinámicas físicas básicas: movimiento uniforme, trayectoria parabólica, colisión, acercamiento (looming) y rebote.
- Capacidad de operar a resoluciones de 128x128 y 256x256 píxeles.
- No se reportan capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje.

## Casos de uso

- Simulación de escenarios físicos para entrenamiento de agentes: LDR puede generar vídeos sintéticos de objetos en movimiento (colisiones, rebotes, parábolas) que sirven como datos de entrenamiento para políticas de control en robótica o vehículos autónomos, reduciendo la necesidad de datos reales.
- Aumento de datos para visión por computador: al extrapolar dinámicas, el modelo puede crear variaciones de vídeos de entrenamiento (cambiando color, forma o dirección) para mejorar la robustez de detectores y segmentadores.
- Validación de modelos físicos: investigadores pueden comparar las predicciones de LDR con simulaciones basadas en ecuaciones para evaluar la coherencia de los modelos de mundo aprendidos.
- Generación de contenido visual para videojuegos o animación: el modelo puede producir secuencias de movimiento realista de objetos simples, útil para prototipos o fondos dinámicos.
- Estudio de generalización en modelos de mundo: LDR sirve como banco de pruebas para investigar cómo los modelos aprenden y extrapolan leyes físicas, contribuyendo al avance de la inteligencia artificial física.
- Preprocesamiento para planificación en robótica: dado un estado inicial, LDR puede predecir múltiples trayectorias futuras, permitiendo a un planificador evaluar escenarios de colisión o aproximación antes de ejecutar una acción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El artículo menciona capacidades de extrapolación cualitativas, pero no se proporcionan métricas numéricas (PSNR, SSIM, FVD, etc.) en la documentación accesible.

## Requisitos de hardware

- No se dispone de información oficial sobre requisitos de hardware.
- El tamaño del repositorio (0.6 GB) sugiere que el modelo es ligero y probablemente ejecutable en GPUs de consumo (por ejemplo, RTX 3060 o superiores), pero no hay confirmación.
- No se indican opciones de despliegue (vLLM, llama.cpp, etc.); al ser un modelo de video en PyTorch, se espera que se ejecute con frameworks estándar como PyTorch y CUDA.
- No se reportan datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. LDR se posiciona como un modelo de mundo de video con capacidad de extrapolación, pero no se ofrecen comparaciones cuantitativas con alternativas como VideoPoet, Genie o modelos de predicción de video basados en transformers.

## Limitaciones y advertencias

- Modelo de investigación: no está diseñado para producción general; su alcance se limita a dinámicas físicas básicas y escenarios sintéticos.
- No se han documentado sesgos, pero al entrenarse probablemente con datos sintéticos, puede no generalizar a entornos reales complejos.
- Riesgo de alucinación visual: como todo modelo generativo, puede producir secuencias físicamente inconsistentes en situaciones fuera de su distribución.
- No soporta texto ni lenguaje; es exclusivamente visual.
- La licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye sin garantías y con documentación mínima.
- No se especifican limitaciones de contexto temporal (número de frames generados) ni de resolución máxima más allá de 256x256.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/haodongli/LDR
- Dataset en Hugging Face: https://huggingface.co/datasets/haodongli/LDR
- Repositorio GitHub: https://github.com/adobe-research/LDR
- Página del proyecto: https://lat-dyn-reason.github.io/
- Artículo arXiv: https://arxiv.org/abs/2608.09926
- Página personal del autor: https://haodong2000.github.io/
