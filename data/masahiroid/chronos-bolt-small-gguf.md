# masahiroid/chronos-bolt-small-gguf

## Resumen

Chronos-Bolt-small en formato GGUF es una conversión del modelo de predicción de series temporales `amazon/chronos-bolt-small` de Amazon, publicada por el usuario masahiroid. No se trata de un modelo de lenguaje: es un modelo T5 (encoder-decoder) especializado en forecasting que produce directamente 9 cuantiles (0,1 a 0,9) para un horizonte de 64 pasos futuros, tomando como entrada hasta 2048 observaciones de la serie. No dispone de tokenizador de texto ni de capacidades generativas.

La relevancia de esta publicación es de infraestructura más que de modelado: el autor ha empaquetado los pesos originales en un contenedor GGUF con un esquema propio (`general.architecture=hf-native-mlx-v1`), conservando los nombres de tensor de Hugging Face y precisión F32, junto con un runtime de carga basado en MLX. Esto permite ejecutar el modelo en Apple Silicon sin depender de PyTorch, con validación numérica de paridad frente a la implementación original.

Es importante subrayar que este GGUF **no es compatible con llama.cpp, Ollama ni LM Studio**. Requiere el loader incluido y un Mac con Apple Silicon. El repositorio ocupa 0,2 GB y acumula 237 descargas. La conversión se hizo sobre la revisión `772f3d25d38aec6d914c8949dab4462e2d46f5d8` del modelo base, sin fine-tuning ni sustitución de checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | T5 (encoder-decoder), base de Chronos-Bolt |
| Parametros totales | 47.720.064 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 2048 observaciones de la serie temporal |
| Tipos de cuantizacion | F32 (no es una cuantizacion de 4 bits) |
| Idiomas soportados | no disponible (modelo sin tokenizador de texto) |
| Licencia | apache-2.0 (pesos); runtime y conversor MIT |
| Formato de pesos | GGUF con esquema propio `hf-native-mlx-v1`; tambien MLX, Core ML y Core AI |

## Arquitectura y entrenamiento

El modelo subyacente es `amazon/chronos-bolt-small`, un T5 encoder-decoder adaptado a forecasting de series temporales. La entrada es una secuencia de observaciones numéricas (hasta 2048) y la salida es una matriz de 9 cuantiles por 64 pasos futuros, es decir, shape `(batch, 9, 64)`. No emplea tokenizador de texto: el pipeline es puramente numérico. Chronos-Bolt se caracteriza por predicción directa multi-paso (frente a la generación autoregresiva de tokenización de valores de Chronos original), lo que reduce latencia de inferencia.

Esta publicación concreta no entrena ni ajusta el modelo: es una conversión de checkpoint. El autor documenta que se preservan todos los tensores usados por el modelo de inferencia original y que la conversión se valida contra la implementación PyTorch en tres casos deterministas (tendencia más sinusoide, serie constante y serie con observaciones faltantes), con una diferencia absoluta máxima de salida de 3,8146973e-06 y similitud coseno mínima de 1. El entorno de conversión declarado incluye PyTorch 2.14.1, Transformers 4.57.3, MLX 0.32.4, NumPy 1.26.4, coremltools 9.0, chronos-forecasting 2.3.2 y GGUF 0.19.0. No se documenta composición del dataset de entrenamiento original ni uso de RLHF/DPO en esta ficha.

## Capacidades

- Predicción de series temporales univariadas y por lotes, con horizonte fijo de 64 pasos.
- Salida probabilística mediante 9 cuantiles (0,1 a 0,9), lo que permite construir intervalos de predicción.
- Manejo de entradas de longitud variable hasta 2048 observaciones (en el runtime MLX/GGUF; las exportaciones Core ML y Core AI usan formas fijas de batch 1 y contexto 2048).
- Soporte de valores faltantes mediante relleno con NaN en las exportaciones de forma fija.
- Ejecución en Apple Silicon a través del runtime MLX incluido en el repositorio.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto.
- No dispone de capacidades multilingües al no procesar texto.

## Casos de uso

- Forecasting de demanda en retail: el modelo puede predecir 64 pasos futuros (por ejemplo, 64 días o 64 horas según la frecuencia) con intervalos de cuantiles para planificación de stock, aprovechando la ventana de 2048 observaciones para capturar estacionalidad anual en datos diarios.
- Monitorización de métricas de infraestructura: predicción de CPU, memoria o latencia a partir de series históricas de hasta 2048 puntos, con bandas de incertidumbre derivadas de los cuantiles 0,1 y 0,9 para alertas tempranas.
- Previsión financiera de alta frecuencia: generación de distribuciones predictivas de precios o volúmenes en horizontes cortos, útil para simulación de escenarios y gestión de riesgo.
- Predicción de consumo energético: estimación de carga eléctrica a 64 pasos con cuantiles para dimensionar reservas y detectar anomalías respecto al intervalo esperado.
- Análisis de sensores industriales: forecasting de variables de proceso (temperatura, presión, vibración) en Macs locales dentro de plantas o laboratorios, sin necesidad de GPU dedicada ni stack PyTorch.
- Prototipado e investigación en series temporales: evaluación de Chronos-Bolt en entornos Apple Silicon con un runtime ligero, útil para comparar con otros modelos de forecasting sin montar infraestructura CUDA.
- Integración en aplicaciones macOS nativas: las exportaciones Core ML y Core AI del mismo autor permiten desplegar el modelo en apps de escritorio con formas fijas de batch 1 y contexto 2048.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye validación de paridad numérica de la conversión (diferencia absoluta máxima 3,8146973e-06, similitud coseno mínima 1 en tres casos deterministas), que no constituye una evaluación de calidad de tarea ni de latencia.

## Requisitos de hardware

- VRAM/RAM estimada: el checkpoint pesa aproximadamente 0,2 GB en F32 (47,7 M de parámetros); la huella en memoria durante inferencia es del orden de unos pocos cientos de MB, aunque no se documenta una cifra oficial.
- Hardware requerido: Mac con Apple Silicon (obligatorio por el runtime MLX incluido). No se soportan GPUs NVIDIA ni entornos CUDA con este paquete.
- GPU de consumo: no aplica en el sentido habitual; el modelo está pensado para la GPU integrada de los chips Apple (M1, M2, M3, M4 y sucesivos). No se documentan requisitos mínimos de chip.
- Opciones de despliegue: runtime `runtime_mlx` incluido en el repositorio; alternativas del mismo autor en MLX, Core ML y Core AI. No es compatible con vLLM, llama.cpp, Ollama, TGI ni LM Studio.
- Latencia y throughput: no disponibles; el autor indica explícitamente que la validación realizada no es un benchmark de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Horizonte | Formato | Licencia | Compatibilidad |
|---|---|---|---|---|---|---|
| masahiroid/chronos-bolt-small-gguf | 47,7 M | 2048 observaciones | 64 pasos, 9 cuantiles | GGUF propietario + MLX | apache-2.0 (pesos) / MIT (runtime) | Solo Apple Silicon con loader incluido |
| amazon/chronos-bolt-small (original) | 47,7 M | 2048 observaciones | 64 pasos, 9 cuantiles | safetensors (PyTorch) | apache-2.0 | PyTorch, CPU/GPU |
| masahiroid/chronos-bolt-small-mlx | 47,7 M | 2048 observaciones | 64 pasos, 9 cuantiles | MLX | apache-2.0 / MIT | Apple Silicon con MLX |
| masahiroid/chronos-bolt-small-coreml | 47,7 M | 2048 (forma fija) | 64 pasos, 9 cuantiles | Core ML | apache-2.0 / MIT | Apple Silicon, apps nativas |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada; todas comparten los mismos pesos de origen y difieren únicamente en el formato de empaquetado y el runtime.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no responde preguntas y no procesa prompts en lenguaje natural.
- El GGUF usa un esquema no estándar (`hf-native-mlx-v1`) y no es interoperable con el ecosistema llama.cpp/Ollama/LM Studio; intentar cargarlo con esas herramientas fallará.
- Requiere macOS con Apple Silicon y el loader `runtime_mlx` incluido; no hay soporte documentado para Linux, Windows ni CUDA.
- El horizonte de predicción está fijado en 64 pasos; no es configurable en esta conversión.
- Las exportaciones Core ML y Core AI imponen formas fijas (batch 1, contexto 2048) y requieren relleno con NaN para entradas más cortas.
- La validación numérica cubre solo tres casos sintéticos; no hay evaluación de calidad predictiva, sesgos ni robustez en dominios reales.
- Riesgo de degradación fuera de distribución: al no haberse reentrenado, hereda las limitaciones del modelo original de Amazon, no documentadas en esta ficha.
- La licencia apache-2.0 de los pesos permite uso comercial, pero el autor aclara que no se implica certificación de seguridad ni licencia comercial adicional; las versiones de librerías fuera del entorno probado no están garantizadas.
- El repositorio tiene 237 descargas y 0 likes, con lo que la validación comunitaria es mínima.

## Enlaces

- Repositorio GGUF: https://huggingface.co/masahiroid/chronos-bolt-small-gguf
- Modelo base: https://huggingface.co/amazon/chronos-bolt-small
- Revisión concreta del modelo base: https://huggingface.co/amazon/chronos-bolt-small/tree/772f3d25d38aec6d914c8949dab4462e2d46f5d8
- Variante MLX: https://huggingface.co/masahiroid/chronos-bolt-small-mlx
- Variante Core ML: https://huggingface.co/masahiroid/chronos-bolt-small-coreml
- Variante Core AI: https://huggingface.co/masahiroid/chronos-bolt-small-coreai
