# siddik-lanl/spus-pde-unet-9m-v2

## Resumen

SPUS PDE U-Net 9M v2 es un modelo fundacional de tipo U-Net residual con 9.019.093 parámetros, desarrollado por el usuario `siddik-lanl` (Los Alamos National Laboratory) para aprender la evolución temporal de ecuaciones en derivadas parciales (PDE). No es un modelo de lenguaje: es un operador neuronal convolucional que predice el siguiente paso temporal de un campo físico discretizado en una malla 2D, partiendo de un contexto de un único paso.

El modelo se ha preentrenado de forma independiente sobre seis conjuntos de datos de dinámica de fluidos (CE-RP, CE-CRP, CE-KH, CE-Gauss, NS-Sines y NS-Gauss), lo que lo convierte en una base genérica para simulación científica con aprendizaje automático. Su diseño de 5 canales de entrada y 5 de salida permite acomodar tanto problemas de 5 campos acoplados como problemas de 2 campos (Navier-Stokes) rellenando los canales restantes con padding.

Es relevante porque los operadores neuronales preentrenados de pequeño tamaño (menos de 10M de parámetros) son escasos: la mayoría de los "foundation models" científicos superan los cientos de millones. Un modelo de 9M puede ejecutarse en CPU o en GPU de consumo, lo que facilita su uso como baseline, para fine-tuning en dominios específicos o para integración en bucles de simulación de bajo coste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net residual convolucional 2D (encoder-decoder con skip connections) |
| Parametros totales | 9.019.093 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (contexto temporal de 1 paso; la ventana espacial viene fijada por la malla de entrada, 128x128 en el ejemplo) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors de precisión original) |
| Idiomas soportados | no aplica (modelo numérico, no lingüístico) |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors (solo parámetros de inferencia) |

## Arquitectura y entrenamiento

La arquitectura es una U-Net residual 2D con 5 canales de entrada, 16 canales ocultos, multiplicadores de canal `(1, 2, 2, 4)` por nivel de resolución, 2 bloques residuales por resolución y activación GELU. La entrada tiene forma `(batch, time/context, channels, height, width)` y la salida es `(batch, channels, height, width)`, es decir, una predicción de un único paso temporal. Aplicando la salida de forma recursiva (restaurando la dimensión de contexto singleton) se obtiene un rollout autorregresivo de varios pasos.

El preentrenamiento se realizó de forma independiente sobre seis datasets de dinámica de fluidos: CE-RP, CE-CRP, CE-KH, CE-Gauss, NS-Sines y NS-Gauss. Para los dos datasets de Navier-Stokes, que tienen 2 canales, los canales restantes se rellenaron (padding) hasta completar los 5 canales de entrada del modelo. La model card no especifica el número de tokens/pasos de entrenamiento, la composición exacta del dataset, ni si se empleó RLHF/DPO (no aplicable en este dominio). Tampoco se documentan innovaciones como decodificación especulativa o atención lineal, ya que el modelo es puramente convolucional.

## Capacidades

- Predicción de un paso temporal de campos de PDE 2D sobre mallas regulares.
- Rollout autorregresivo multi-paso realimentando la predicción como nueva entrada.
- Manejo de problemas con hasta 5 canales/campos acoplados (con padding para problemas de 2 canales).
- Preentrenamiento multi-dominio en fluidos: convección-difusión (CE-RP, CE-CRP), inestabilidad de Kelvin-Helmholtz (CE-KH), y Navier-Stokes con condiciones iniciales gaussianas y sinusoidales (NS-Sines, NS-Gauss).
- Punto de partida para fine-tuning en dominios físicos específicos.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso simbólico ni capacidades multilingües: es un modelo numérico, no un LLM.
- No dispone de modo "thinking", visión, audio ni otras capacidades multimodales.

## Casos de uso

- Simulación acelerada de dinámica de fluidos: sustituir un solver numérico costoso por el rollout autorregresivo del modelo para obtener trayectorias aproximadas de campos como velocidad o vorticidad en mallas 2D, con un coste de inferencia de milisegundos por paso en GPU.
- Generación de datos sintéticos para entrenamiento: usar el modelo para producir pares entrada-salida adicionales que augmenten datasets de PDE escasos antes de entrenar operadores mayores.
- Baseline en investigación de operadores neuronales: comparar nuevos operadores (FNO, DeepONet, etc.) contra un U-Net preentrenado de 9M con licencia permisiva.
- Fine-tuning en dominios específicos: adaptar los pesos preentrenados a un nuevo régimen físico (por ejemplo, flujos con distinto número de Reynolds) con pocos datos, aprovechando que el modelo ya captura dinámicas de convección y Navier-Stokes.
- Prototipado en entornos con recursos limitados: al caber en CPU y en GPU de consumo, permite iterar en estaciones de trabajo sin clúster.
- Integración en bucles de control o asimilación de datos: usar predicciones de un paso como modelo surrogate dentro de filtros de Kalman o pipelines de optimización en tiempo real.
- Docencia y divulgación: ejemplo compacto y reproducible de operador neuronal preentrenado para cursos de ML científico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (9M parámetros ≈ 36 MB de pesos, más activaciones para mallas 128x128 con 16 canales ocultos). Cabe holgadamente en cualquier GPU.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; RTX 3060, RTX 4090, A100 o H100 son válidas, aunque el modelo está sobredimensionado para ellas y se aprovecharía mejor en batch grande.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: PyTorch nativo con `PyTorchModelHubMixin` (según la model card); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo. Se puede exportar a TorchScript u ONNX para despliegue en producción.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Por el tamaño (9M parámetros y convoluciones 2D sobre 128x128), se espera latencia de milisegundos por paso en GPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / malla | Licencia | Disponibilidad |
|---|---|---|---|---|
| SPUS PDE U-Net 9M v2 | 9,0 M | 1 paso temporal, malla 2D (128x128 en el ejemplo) | BSD-3-Clause | Hugging Face |
| SPUS PDE U-Net 36M v2 | 36 M (según model card) | 1 paso temporal, malla 2D | no disponible en la información | Hugging Face (`siddik-lanl/spus-pde-unet-36m-v2`) |
| Fourier Neural Operator (FNO) | variable, típicamente 1-10 M | mallas regulares, depende de la implementación | MIT (implementación de referencia) | Repositorios públicos |
| DeepONet | variable, típicamente 1-10 M | funciones de entrada/salida, no ligado a malla | MIT (implementación de referencia) | Repositorios públicos |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada; la comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo numérico, no lingüístico: no procesa texto ni mantiene conversaciones; cualquier uso como LLM es inválido.
- Entrenado exclusivamente en dominios de fluidos 2D con 5 canales; generalización a otros tipos de PDE (elasticidad, electromagnetismo, etc.) no está garantizada y requeriría fine-tuning.
- El padding de canales en los datasets de Navier-Stokes (2 canales rellenados a 5) puede introducir un sesgo hacia configuraciones con canales vacíos.
- Error acumulativo en rollouts autorregresivos: al realimentar predicciones, los errores se amplifican con el número de pasos; la model card no documenta la estabilidad a largo plazo.
- No hay información sobre sesgos, alucinación (en el sentido de predicciones físicamente inconsistentes) ni métricas de error publicadas.
- Licencia BSD-3-Clause: permisiva para uso comercial, pero exige mantener el aviso de copyright y no permite usar el nombre de los autores para promocionar derivados sin permiso.
- El repositorio tiene 0.0 GB de tamaño reportado y 33 descargas, lo que sugiere que el artefacto es muy reciente y con poca validación comunitaria.
- Solo se publican pesos de inferencia; no hay código de entrenamiento ni receta de fine-tuning en la información disponible.
- No se documenta el rango de mallas soportado más allá del ejemplo 128x128; entradas de otras resoluciones pueden requerir padding o reescalado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/siddik-lanl/spus-pde-unet-9m-v2
- Modelo relacionado 36M v2: https://huggingface.co/siddik-lanl/spus-pde-unet-36m-v2
