# coslinedev/ALRITHM-Astro

## Resumen

ALRITHM-Astro es un modelo surrogate de tipo red neuronal informada por la fisica (PINN, *Physics-Informed Neural Network*) desarrollado por el usuario coslinedev dentro del ecosistema Alrithm. Su proposito concreto es predecir la presion dinamica maxima (Max Q) de un cohete a partir de 13 caracteristicas fisicas derivadas de la mision, sustituyendo una simulacion numerica completa por una inferencia de red neuronal de coste muy bajo. No es un modelo de lenguaje: es una MLP de regresion que se integra en una aplicacion copiloto de ingenieria aeroespacial con interfaz en lenguaje natural.

La version publicada (v0.2) es un modelo de tarea unica entrenado exclusivamente sobre el subconjunto `max_q_kpa` del dataset `alr-aerospace-platform-0.2`, con validacion cruzada de 5 folds. La arquitectura es una MLP de tres capas ocultas de 256 unidades con activacion SiLU y salida escalar. El repositorio tiene un tamano de 0.0 GB, lo que sugiere que los pesos no estan publicados en el Hub o que el artefacto es extremadamente pequeno (coherente con una MLP de ~140 K parametros).

Su relevancia actual es limitada pero ilustrativa: demuestra un patron de despliegue completo (datos verificados -> PINN -> FastAPI -> frontend) y sirve como referencia de como construir surrogates fisicos rapidos para fases tempranas de diseno aerodinamico. La capa de lenguaje natural del producto no reside en este modelo, sino en `openai/gpt-oss-120b` servido via Groq.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP (perceptron multicapa) con 3 capas ocultas de 256 unidades y activacion SiLU |
| Parametros totales | no disponible (estimacion: ~140 K segun la definicion de capas de la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de regresion tabular, sin entrada de texto) |
| Tipos de cuantizacion | no disponible (pesos en `.pth` de PyTorch, sin variantes GGUF/ONNX publicadas) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | MIT |
| Formato de pesos | checkpoint PyTorch (`.pth`) con `model_state_dict`, `scaler_x` y `scaler_y` |
| Entrada | 13 caracteristicas fisicas (p. ej. velocidad de burnout, relacion empuje/peso, relacion de masas) |
| Salida | `max_q_kpa` (presion dinamica maxima en kPa) |
| Tamano del repositorio | 0.0 GB |

## Arquitectura y entrenamiento

La red es una MLP pura de cuatro capas lineales (13 -> 256 -> 256 -> 256 -> 1) con activacion SiLU entre capas y salida escalar. La model card la denomina PINN, aunque la informacion disponible no detalla el termino de perdida fisico (residual de ecuaciones de vuelo, penalizaciones de consistencia dimensional o similar); el codigo de ejemplo solo muestra la definicion de la arquitectura y la carga de pesos, no la funcion de perdida. Los datos de entrada y salida se normalizan mediante `scaler_x` y `scaler_y` empaquetados en el propio checkpoint, lo que simplifica el despliegue.

El entrenamiento se realizo sobre el subconjunto `max_q_kpa` del dataset `alr-aerospace-platform-0.2`, obtenido via la API oficial de Alrithm, con validacion cruzada de 5 folds. No se especifican el numero de muestras de entrenamiento, el numero de epochs, la tasa de aprendizaje ni la composicion completa del dataset (la model card menciona mas de 4600 registros en el dataset completo, pero no el subconjunto usado). Tampoco se documenta el uso de RLHF, DPO ni tecnicas de regularizacion. La hoja de ruta del autor contempla una fase 3 de aprendizaje multitarea (MTL) sobre el dataset completo para predecir apogeo, velocidad de burnout y otras magnitudes simultaneamente.

## Capacidades

- Regresion escalar de Max Q (presion dinamica maxima) a partir de 13 features fisicas de la mision.
- Inferencia de coste muy bajo (apta para CPU y para llamadas por peticion en un backend FastAPI).
- Integracion con una capa de lenguaje natural externa (Groq, `openai/gpt-oss-120b`) para interpretar consultas de ingenieria y mapearlas a los features de entrada.
- Visualizacion 3D de la trayectoria del cohete en el producto que la envuelve (Plotly.js), aunque esta funcionalidad reside en el frontend, no en el modelo.
- No soporta tool calling, function calling, agentes, razonamiento multietapa ni capacidades multilingues: es un regresor tabular.
- No procesa vision, audio ni texto.

## Casos de uso

- Prediccion rapida de Max Q en fases tempranas de diseno: dado un conjunto de parametros de mision (empuje, masa, relacion de masas, velocidad de burnout), el modelo devuelve la presion dinamica maxima en milisegundos, sustituyendo una simulacion de trayectoria completa en iteraciones de diseno exploratorio.
- Filtrado de candidatos en barridos parametricos: en un estudio de sensibilidad con miles de combinaciones de parametros, la MLP actua como prefiltro barato y solo las configuraciones prometedoras se validan con un simulador de alta fidelidad.
- Copiloto de ingenieria aeroespacial: integrado en el backend FastAPI, recibe una consulta en lenguaje natural (interpretada por un LLM externo), extrae los 13 features y devuelve la Max Q junto con la trayectoria 3D.
- Educacion y demostracion tecnica: ejemplo reproducible de pipeline completo (dataset verificado -> entrenamiento -> API -> frontend) para cursos de ML aplicado a ingenieria.
- Prototipado de surrogates fisicos: la arquitectura y el esquema de checkpoint (pesos + scalers) sirven de plantilla para otros surrogates de magnitudes aeroespaciales.
- Validacion cruzada de datos: al ser un modelo entrenado sobre datos verificados de Alrithm, puede usarse como referencia de consistencia para detectar outliers en nuevas simulaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de error (RMSE, MAE, R²) ni comparaciones con simuladores de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB de pesos en FP32 (MLP de ~140 K parametros); cabe en cualquier GPU, CPU e incluso en microcontroladores.
- GPU recomendadas: no requiere GPU; una CPU moderna es suficiente para latencias por debajo del milisegundo.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, integradas) y en CPU.
- Opciones de despliegue: PyTorch nativo (carga directa del `.pth`), exportacion a ONNX o TorchScript recomendable para produccion; no hay artefactos GGUF ni soporte documentado en vLLM, llama.cpp, Ollama o TGI (no aplican a un regresor tabular).
- Latencia y throughput: no disponibles de forma oficial; por el tamano del modelo, se espera latencia sub-milisegundo en CPU y throughput de decenas de miles de inferencias por segundo en una sola GPU.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ALRITHM-Astro v0.2 | MLP / surrogate PINN | ~140 K (estimado) | no aplica | Regresion de Max Q | MIT | Hugging Face (pesos `.pth`) |
| Surrogates clasicos (kriging, RBF) | Metamodelos estadisticos | no aplica | no aplica | Regresion fisica | variable | Librerias (scikit-learn, SMT) |
| Redes PINN genericas (p. ej. DeepXDE) | PINN framework | configurable | no aplica | EDP y fisica | Apache 2.0 | GitHub / PyPI |
| Modelos de lenguaje para ingenieria (p. ej. Llama, Qwen) | LLM | 7 B - 70 B+ | 8 K - 128 K | Razonamiento y texto | variable | Hugging Face |

No se dispone de comparaciones publicadas de rendimiento con alternativas en la misma tarea.

## Limitaciones y advertencias

- Modelo de tarea unica: solo predice `max_q_kpa`; no cubre apogeo, velocidad de burnout ni otras magnitudes del dataset completo.
- La denominacion PINN no esta respaldada por la documentacion del termino fisico de perdida; conviene tratarlo como surrogate empirico hasta que el autor publique detalles.
- Ausencia total de metricas de error: no es posible evaluar la fidelidad de la prediccion frente a un simulador de referencia.
- Entrenado sobre un subconjunto del dataset `alr-aerospace-platform-0.2`; el dominio de validez queda restringido a la distribucion de ese subconjunto y no se documenta.
- Riesgo de extrapolacion silenciosa: al ser una MLP pequena con scalers fijos, entradas fuera del rango de entrenamiento pueden producir predicciones sin sentido sin aviso.
- El repositorio tiene 0 descargas y 0 likes; no hay evidencia de uso en produccion ni de validacion independiente.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantias ni soporte.
- El componente de lenguaje natural del producto depende de un LLM externo (Groq) y no forma parte de este modelo; no debe atribuirse a ALRITHM-Astro.
- Sin informacion sobre sesgos: al ser un modelo fisico tabular, el riesgo de sesgo social es bajo, pero si existe sesgo de muestreo en el dataset de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/coslinedev/ALRITHM-Astro
- Demo en vivo: https://godela-web.vercel.app
- Plataforma Alrithm: https://alrithmapi.vercel.app
