# romee/laya-stock-model

## Resumen

laya-stock-model es un modelo de clasificacion para la toma de decisiones en el mercado de acciones coreano, desarrollado por el usuario romee y publicado en HuggingFace. Clasifica el estado del mercado en tres acciones (comprar, mantener o vender) a partir de 25 caracteristicas de estado y una pregunta de accion. Se construye mediante fine-tuning del encoder answerdotai/ModernBERT-large (hidden 1024, 28 capas, 16 cabezas) con una cabeza de decision del framework Laya (rl-agent, 2 capas), dando un total de 421.293.830 parametros.

El modelo resuelve la prediccion del retorno a 30 minutos (3 velas de 10 minutos) para las 50 acciones coreanas con mayor volumen y valor negociado. Su relevancia actual radica en que incorpora calibracion explicita (temperatura 1,1709, ECE 0,0646) y un esquema de aprendizaje por refuerzo (loss rlcd), y publica metricas sobre un conjunto de validacion de 27.725 muestras, lo que permite evaluar su fiabilidad antes de integrarlo en estrategias de trading.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT-large) + cabeza de decision Laya rl-agent (2 capas) |
| Parametros totales | 421.293.830 (dato de safetensors) |
| Longitud de contexto | 512 tokens (encoder); head_max_len 192 |
| Tipos de cuantizacion | No disponible (pesos publicados en fp32); se puede cuantizar manualmente a fp16, int8 o 4-bit |
| Idiomas soportados | Coreano (ko) |
| Licencia | other (pendiente de especificar por el autor); modelo base Apache-2.0 |
| Formato de pesos | safetensors (fp32, ~803 MB) |
| Vocabulario | 50.368 tokens |
| Modelo base | answerdotai/ModernBERT-large |
| Libreria | laya |
| Tamano del repositorio | 0,8 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion en el Hub | 2026-10-12 |

## Arquitectura y entrenamiento

El modelo combina un encoder transformer ModernBERT-large, que emplea atencion alterna (local y global), activacion GeGLU y embeddings rotatorios, con una cabeza de decision Laya rl-agent de dos capas. La entrada consiste en 25 caracteristicas de estado (precio, volumen, RSI, MACD, medias moviles, ranking intradia, etc.) y una pregunta de accion; la salida es una distribucion de probabilidad sobre tres clases (buy, hold, sell). El entrenamiento se realizo sobre velas de 10 minutos de las 50 acciones coreanas con mayor volumen y valor negociado, entre el 6 de enero y el 23 de julio de 2025 (aproximadamente 100 dias de trading), con 85.473 muestras de entrenamiento y 27.725 de evaluacion en una division cronologica 80:20 sin fuga temporal.

Las etiquetas se derivan del retorno futuro a 3 velas (30 minutos): buy si el retorno es mayor o igual a +0,5%, sell si es menor o igual a -0,5%, y hold en el resto. El ajuste fino se hizo en 2 GPU T4 de Kaggle durante 4 epocas, con micro_batch 8 y grad_accum 8, usando la perdida rlcd, learning rate de 1e-4 para la cabeza y 2.5e-5 para el encoder, 4 muestras de RL y un parametro sigma que decae de 0,4 a 0,1. Se aplico una calibracion de temperatura (1,1709) para mejorar la fiabilidad de las probabilidades.

## Capacidades

- Clasificacion de decisiones de trading: genera etiquetas buy/hold/sell con probabilidades asociadas a partir de 25 features de estado.
- Calibracion de probabilidades: el modelo reporta ECE de 0,0646 y Brier de 0,1213 tras calibracion, lo que permite usar la confianza como umbral.
- Procesamiento de ventanas de 512 tokens: suficiente para concatenar estado y pregunta en el formato del framework Laya.
- No soporta tool calling ni function calling.
- No es un modelo generativo de texto: no produce lenguaje natural, solo una distribucion sobre tres clases.
- No soporta agentes multi-paso ni razonamiento encadenado; es un clasificador de un solo paso.
- Capacidades multilingues limitadas: solo coreano (ko); los features y preguntas estan en coreano.
- No tiene vision, audio ni otras modalidades.
- Integracion con el framework Laya para carga y prediccion.

## Casos de uso

- Trading algoritmico intradia en el mercado coreano: integrar las senales buy/hold/sell en un motor de ejecucion para las 50 acciones mas liquidas, usando velas de 10 minutos. El modelo es adecuado porque su entrenamiento y calibracion estan alineados con ese universo y frecuencia.
- Filtro de operaciones por confianza: utilizar la probabilidad calibrada (temperatura 1,1709) para descartar senales con baja confianza, reduciendo el numero de falsos positivos en estrategias de alta frecuencia.
- Backtesting de estrategias de 30 minutos: las etiquetas se basan en el retorno a 3 velas, por lo que el modelo puede alimentar simulaciones historicas para medir el exceso de retorno frente a buy&hold.
- Sistema de alertas para traders discrecionales: generar notificaciones cuando la probabilidad de buy o sell supere un umbral definido, permitiendo reaccionar a cambios de tendencia en tiempo real.
- Investigacion en calibracion de modelos financieros: el modelo publica metricas ECE y Brier, lo que lo convierte en un baseline reproducible para estudiar tecnicas de calibracion en series temporales.
- Replicacion del pipeline RLCD en otros mercados: la configuracion de entrenamiento (rl_samples 4, sigma 0,4→0,1, loss rlcd) esta documentada y puede adaptarse a otras frecuencias o indices.
- Analisis de microestructura: los 25 features incluyen indicadores tecnicos y ranking intradia, lo que permite estudiar la contribucion de cada variable a la decision final.
- Docencia y aprendizaje: sirve como ejemplo practico de fine-tuning de ModernBERT para clasificacion financiera y de uso del framework Laya.

## Benchmarks y rendimiento

Los unicos datos de evaluacion disponibles son los reportados por el autor sobre el conjunto de validacion de 27.725 muestras (held-out). No se han publicado resultados en benchmarks estandar como MMLU, HumanEval o GSM8K.

| Metrica | Antes (before) | Despues (after) |
|---|---|---|
| Accuracy | 0,3189 | 0,4648 |
| Loss | 1,1264 | 1,0832 |
| ECE | 0,0872 | 0,0646 |
| Brier | 0,1513 | 0,1213 |

Para una clasificacion de 3 clases, el azar se situa en 0,333; el modelo supera ese umbral pero no alcanza niveles de alta precision.

## Requisitos de hardware

- VRAM estimada: fp32 ~2 GB (pesos de 803 MB mas activaciones), fp16 ~1,2 GB, int8 ~0,7 GB, 4-bit ~0,5 GB. Estimaciones orientativas a partir del tamano de pesos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; el entrenamiento se realizo en 2x T4 (16 GB cada una). Para inferencia son suficientes RTX 3060, RTX 4090, A100 o H100.
- Cabe en GPU consumer: si, en tarjetas con 4 GB o mas (GTX 1650, RTX 3050, etc.).
- Opciones de despliegue: requiere la libreria laya; no hay soporte nativo en vLLM, llama.cpp, Ollama o TGI. Se puede exportar el encoder a ONNX o TorchScript para servir con FastAPI o Triton.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Tarea |
|---|---|---|---|---|---|
| romee/laya-stock-model | 421.293.830 | 512 | Coreano | other | Clasificacion buy/hold/sell en acciones coreanas |
| answerdotai/ModernBERT-large (base) | no disponible (hidden 1024, 28 capas, 16 cabezas) | no disponible | Ingles | Apache-2.0 | Encoder generalista para NLP |
| ProsusAI/finbert (referencia) | no disponible | no disponible | Ingles | no disponible | Analisis de sentimiento financiero |
| FinGPT (familia, referencia) | no disponible | no disponible | Ingles/Chino | no disponible | LLM financiero generativo |

No se dispone de datos comparativos de rendimiento entre estos modelos y laya-stock-model, ya que las tareas y los conjuntos de evaluacion son distintos. La comparacion se limita a caracteristicas estructurales y de licencia.

## Limitaciones y advertencias

- Sesgo de poblacion: entrenado solo con las 50 acciones coreanas de mayor volumen y valor negociado; aplicar a otros universos invalida la calibracion.
- Sesgo temporal: datos de enero a julio de 2025 (aproximadamente 100 dias de trading); no cubre otros regimenes de mercado.
- Riesgo de falsos positivos/negativos: accuracy de 0,4648 en validacion, superior al azar (0,333) pero lejos de una precision alta; no garantiza rentabilidad.
- Limitacion de contexto: maximo 512 tokens; solo procesa 25 features numericos y una pregunta de accion, no texto libre ni noticias.
- Idioma: exclusivamente coreano; no soporta otros idiomas.
- Licencia: other sin especificar; el autor indica que la licencia se definira; no hay garantia de uso comercial. El modelo base es Apache-2.0, pero la licencia del fine-tuning es independiente.
- Restriccion de ejecucion: cuando el precio esta en el limite superior (상한가), las senales de compra no se pueden ejecutar; se debe ignorar la senal de buy.
- Muestra de backtest corta: el autor reporta solo 20 dias de trading con exceso de retorno positivo frente a buy&hold, periodo insuficiente para conclusiones robustas.
- Dependencia del framework: requiere la libreria laya para cargar la cabeza de decision; no es compatible directamente con transformers, vLLM o llama.cpp.
- Sin demo ni pipeline en HuggingFace: 0 descargas y 0 likes; no hay Space ni endpoint publico.
- Posible sobreajuste: 4 epocas sobre 85.473 muestras; aunque la division es cronologica, no se reportan intervalos de confianza.

## Enlaces

- HuggingFace: https://huggingface.co/romee/laya-stock-model
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-large
- Repositorio Laya: https://github.com/consai/laya
- Paper de ModernBERT: https://arxiv.org/abs/2412.13663
- FinBERT (comparativa): https://huggingface.co/ProsusAI/finbert
