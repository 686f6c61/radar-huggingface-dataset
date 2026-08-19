# jeckmy/Kronos-base

## Resumen

Kronos-base es un modelo fundacional de código abierto especializado en el análisis de series temporales financieras, concretamente en datos de velas (K-line) con formato OHLCV. Desarrollado originalmente por el equipo de NeoQuasar y publicado en el Hub de Hugging Face bajo el identificador `NeoQuasar/Kronos-base`, la versión aquí descrita (`jeckmy/Kronos-base`) es un espejo del mismo modelo. Se trata del primer modelo fundacional open-source diseñado específicamente para el "lenguaje" de los mercados financieros, entrenado con más de 12 mil millones de registros de K-line procedentes de 45 exchanges globales.

El modelo emplea una arquitectura decoder-only con un tokenizador especializado en dos etapas: primero cuantiza los datos continuos OHLCV en tokens discretos jerárquicos y después pre-entrena un transformer autorregresivo sobre esos tokens. Con 102,3 millones de parámetros y una ventana de contexto de 512, Kronos-base ofrece capacidades de predicción en zero-shot para tareas como forecasting de precios, predicción de volatilidad y generación de datos sintéticos. Su relevancia actual radica en democratizar el acceso a herramientas de modelado financiero que antes solo estaban disponibles en entornos institucionales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con tokenizador jerárquico especializado |
| Parametros totales | 102.311.008 (102,3 M) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (modelo de series temporales, no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Kronos-base sigue una arquitectura decoder-only basada en transformer, pero su innovación principal reside en el sistema de tokenización. Un tokenizador especializado (Kronos-Tokenizer-base) convierte los datos continuos de velas (open, high, low, close, volume) en una secuencia de tokens discretos organizados jerárquicamente, preservando tanto la dinámica de precios como los patrones de actividad de trading. Sobre esta secuencia de tokens se pre-entrena un transformer autorregresivo con el objetivo de predecir el siguiente token.

El entrenamiento se realizó sobre un corpus masivo de más de 12 mil millones de registros de K-line procedentes de 45 exchanges globales, lo que permite al modelo aprender representaciones temporales y transversales a distintos activos. No se menciona el uso de técnicas de RLHF o DPO; el pre-entrenamiento es puramente autorregresivo. El modelo se publica con pesos en formato safetensors y se distribuye bajo licencia MIT, lo que facilita su integración en entornos de producción y su fine-tuning para tareas específicas.

## Capacidades

- Predicción de series temporales financieras: forecasting de precios futuros a partir de datos históricos de velas.
- Predicción de volatilidad: estimación de la volatilidad futura de un activo, útil para gestión de riesgo.
- Generación de datos sintéticos: creación de series de K-line artificiales que conservan las propiedades estadísticas de los datos reales, útiles para backtesting y aumento de datos.
- Funcionamiento en zero-shot: el modelo puede aplicarse a nuevas tareas financieras sin necesidad de fine-tuning previo.
- Soporte multi-activo: entrenado con datos de múltiples exchanges y clases de activos, lo que le permite generalizar entre distintos mercados.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni razonamiento multi-paso; está especializado exclusivamente en datos numéricos de mercado.

## Casos de uso

- Predicción de precios de criptomonedas: dado un histórico de velas de BTC/USDT, el modelo puede generar una proyección a 24 horas, como se muestra en la demo oficial. Es adecuado porque fue entrenado con datos de exchanges de criptoactivos.
- Gestión de riesgo en carteras: la predicción de volatilidad permite ajustar posiciones y calcular el Value at Risk (VaR) de forma más precisa que con modelos estadísticos clásicos.
- Backtesting con datos sintéticos: generar series sintéticas realistas para probar estrategias de trading sin depender de datos históricos limitados o con sesgo de supervivencia.
- Detección de patrones de velas: el tokenizador jerárquico captura estructuras de precios que pueden utilizarse para identificar formaciones técnicas (martillo, envolvente, etc.) de forma automática.
- Integración en sistemas de trading algorítmico: el modelo puede incorporarse como señal predictiva en pipelines de ejecución automática, gracias a su bajo coste computacional (102 M de parámetros) y su licencia permisiva.
- Análisis de mercado multi-exchange: al estar entrenado con 45 exchanges, puede aplicarse a distintos mercados sin reentrenamiento, facilitando el arbitraje o la monitorización global de activos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas comparativas con métricas como MMLU, HumanEval o GSM8K, dado que el modelo no es un LLM generalista sino un modelo de series temporales financieras. El paper asociado (arXiv:2508.02739) podría contener evaluaciones específicas, pero no se dispone de ellas en los materiales revisados.

## Requisitos de hardware

- VRAM estimada: con 102,3 millones de parámetros, el modelo ocupa aproximadamente 400 MB en FP32 y 200 MB en FP16. La inferencia puede ejecutarse en GPUs con 2 GB de VRAM o menos.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA, incluyendo RTX 3060, RTX 4090, A100, etc. También puede ejecutarse en CPU para inferencia de baja latencia.
- Compatibilidad con GPU de consumo: sí, cabe sobradamente en cualquier GPU consumer actual.
- Opciones de despliegue: el modelo se carga mediante la clase `Kronos.from_pretrained` del repositorio oficial. No se han publicado integraciones con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje. Se puede servir mediante un API personalizada con FastAPI o similar.
- Latencia y throughput: no se han publicado mediciones oficiales. Dado el tamaño reducido, se espera una latencia de milisegundos por predicción en GPU y de decenas de milisegundos en CPU.

## Comparativa con modelos similares

No se dispone de una comparativa directa con otros modelos de la misma categoría en la información proporcionada. Existen otros modelos fundacionales de series temporales como Chronos (Amazon) o TimeGPT (Nixtla), pero no se han encontrado datos comparativos publicados con Kronos-base. La tabla del model zoo indica que Kronos-large (499,2 M) no está disponible públicamente, lo que limita la comparación dentro de la propia familia.

## Limitaciones y advertencias

- Ventana de contexto limitada a 512 tokens, lo que restringe el análisis a períodos históricos cortos (por ejemplo, 512 velas diarias son menos de dos años de datos).
- No es un modelo de lenguaje: no puede interpretar noticias, informes financieros ni comunicados; solo procesa datos numéricos de velas.
- Riesgo de alucinación en predicciones: como cualquier modelo autorregresivo, puede generar proyecciones que no se corresponden con la realidad del mercado, especialmente en condiciones de alta volatilidad o eventos inesperados.
- Los mercados financieros son no estacionarios: el modelo fue entrenado con datos históricos y su rendimiento puede degradarse si las condiciones de mercado cambian estructuralmente.
- Sesgo de datos: el entrenamiento se realizó con datos de 45 exchanges, lo que puede introducir sesgos geográficos o de clase de activo (por ejemplo, sobrerrepresentación de criptomonedas frente a renta fija).
- No constituye asesoramiento financiero: las predicciones del modelo no deben utilizarse como base exclusiva para decisiones de inversión sin validación adicional.
- La versión alojada en `jeckmy/Kronos-base` tiene 0 descargas y 0 likes; se recomienda verificar la autenticidad del modelo y comparar con la publicación original en `NeoQuasar/Kronos-base`.

## Enlaces

- Modelo en Hugging Face (original): https://huggingface.co/NeoQuasar/Kronos-base
- Modelo en Hugging Face (espejo, objeto de esta ficha): https://huggingface.co/jeckmy/Kronos-base
- Paper: https://arxiv.org/abs/2508.02739
- Repositorio GitHub oficial: https://github.com/shiyu-coder/Kronos
- Repositorio GitHub alternativo: https://github.com/thzll2001/Kronos-ai
- Demo en vivo: https://shiyu-coder.github.io/Kronos-demo/
- Tokenizador base: https://huggingface.co/NeoQuasar/Kronos-Tokenizer-base
