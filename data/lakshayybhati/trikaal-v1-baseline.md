# lakshayybhati/trikaal-v1-baseline

## Resumen

Trikaal v1 baseline es un modelo de series temporales para criptomonedas, desarrollado por lakshayybhati, que actúa como brazo de control en un estudio sobre tokenizers de microestructura. El modelo combina un tokenizer Stage-1 (BSQ, cuantización binaria estocástica) con un backbone autorregresivo equipado con cabezas de predicción multi-token (MTP). Tiene 31.725.568 parámetros totales por predictor y se entrena sobre 84.153.600 barras de 1 minuto de 40 criptomonedas, con una ventana de contexto de 512 barras. Su relevancia radica en que es el único artefacto publicado de un diseño experimental más amplio que no pudo completarse, y sirve como vehículo de medición para el hallazgo principal: la pérdida de canales firmados en la tokenización. El modelo se distribuye bajo licencia Apache-2.0 y su repositorio de código es público.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tokenizer Stage-1 (BSQ) + backbone autorregresivo con cabezas MTP |
| Parametros totales | 31.725.568 por predictor (10.493.952 en cabezas MTP; 21.231.616 en backbone) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 barras (ventana de entrada) |
| Tipos de cuantizacion | no disponible (el tag "quantization" sugiere cuantización, pero no se especifica el tipo) |
| Idiomas soportados | no disponible (modelo numérico, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (repo de 0,4 GB, probablemente safetensors, pero no confirmado) |

## Arquitectura y entrenamiento

El modelo se compone de dos etapas: un tokenizer Stage-1 que aplica cuantización BSQ a las series OHLCV (apertura, máximo, mínimo, cierre y volumen), y un backbone autorregresivo con cabezas de predicción multi-token (MTP) que genera predicciones sobre los tokens cuantizados. El entrenamiento se realizó sobre 40 símbolos seleccionados por profundidad de mercado, con un total de 84.153.600 barras de 1 minuto, y se ejecutaron 5,06 pasadas sobre el conjunto de entrenamiento (832.096 ventanas × 512 posiciones). La partición temporal es 70/30, con todo el año 2024 como conjunto de validación fuera de muestra. No se aplicaron técnicas de RLHF ni DPO; el entrenamiento es supervisado con una función de pérdida de reconstrucción MSE. La innovación técnica principal del estudio es el análisis de legibilidad de microestructura, pero el baseline no la incorpora: se limita a datos OHLCV sin canales adicionales.

## Capacidades

- Generación de series temporales OHLCV: el modelo puede predecir y reconstruir secuencias de precios y volúmenes a partir de tokens cuantizados.
- Predicción multi-token (MTP): las cabezas MTP permiten anticipar varios pasos temporales a la vez, mejorando la eficiencia de decodificación.
- Reconstrucción de series: el tokenizer BSQ permite reconstruir las series originales con alta fidelidad en los canales de magnitud (volumen, tamaño de operación), aunque pierde los canales firmados (TFI, desequilibrio de conteo firmado).
- No soporta tool calling, function calling, agentes, visión, audio ni procesamiento de lenguaje natural.
- Capacidades multilingües: no aplica, al ser un modelo numérico.

## Casos de uso

- Investigación en representación de series temporales financieras: el modelo sirve como baseline para estudiar cómo la cuantización afecta a la retención de información en datos de mercado.
- Evaluación de tokenizers para datos de mercado: permite comparar el rendimiento de BSQ frente a otros esquemas de cuantización (como FSQ) en términos de reconstrucción y legibilidad.
- Desarrollo de modelos de predicción de precios: aunque no recomendado para trading real, puede usarse como punto de partida para experimentos académicos sobre predicción de OHLCV.
- Análisis de microestructura: el modelo ayuda a identificar qué canales de microestructura son redundantes con OHLCV y cuáles se pierden en la tokenización, guiando el diseño de futuros tokenizers.
- Benchmarking de arquitecturas de series temporales: su tamaño moderado (31,7M parámetros) lo hace adecuado para comparar arquitecturas autorregresivas con MTP en entornos de investigación.
- Estudio de efectos de cuantización: permite analizar cómo la cuantización afecta a la reconstrucción de series y a la extracción de información, con aplicaciones en compresión de datos financieros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Sin embargo, la model card incluye métricas de reconstrucción y legibilidad medidas en el estudio:

| Métrica | Valor |
|---|---|
| Reconstrucción de retornos (fixture sintético) | 0,98 |
| Reconstrucción de dims correlacionadas (fixture sintético) | 0,82–0,92 |
| Reconstrucción de dims independientes de baja varianza (fixture sintético) | 0,001–0,014 |
| Canario plantado en espacio de características (1,151 nats) | 0 extraído |
| Canario plantado en espacio de tokens (0,900 nats) | 94,4% extraído |
| Déficit de canales firmados (TFI, signed_count_imbalance) | 97,3% del déficit total de cell 4 |

Estas métricas indican que el modelo reconstruye bien los canales de magnitud, pero pierde casi por completo los canales firmados, lo que constituye el hallazgo principal del estudio.

## Requisitos de hardware

- VRAM estimada: con 31,7M parámetros, el modelo ocupa aproximadamente 127 MB en FP32, 32 MB en int8 y 16 MB en int4. Cabe en cualquier GPU consumer con al menos 1 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna (RTX 2060 o superior) es suficiente para inferencia. Para entrenamiento, una GPU con 8 GB de VRAM sería adecuada.
- Despliegue: al ser un checkpoint crudo sin integración con librerías estándar, se requiere cargarlo manualmente con PyTorch. No hay soporte nativo para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles, pero dado el tamaño reducido, la inferencia es rápida en GPU consumer.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (tokenizers de series temporales financieras con cuantización). El modelo es un artefacto de investigación específico, sin equivalentes directos publicados. Se podría comparar con modelos de series temporales generales como TimeGPT o Chronos, pero no hay datos de rendimiento comparables en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de trading: las métricas económicas medidas son negativas por un factor de 4,8 a 43 veces, por lo que no debe usarse para tomar decisiones financieras reales.
- Sesgo de supervivencia: los 40 símbolos de entrenamiento son los más profundos y que sobrevivieron al periodo 2021-2025, lo que introduce un sesgo de selección.
- No incluye microestructura: a pesar de que el estudio pretendía medirla, el baseline solo usa OHLCV, y los canales firmados se pierden en la tokenización.
- Datos no redistribuidos: los datos de Binance no se incluyen en el repositorio; solo se distribuyen el código y los hashes de contenido.
- Formato de pesos no documentado: no se especifica el formato exacto de los pesos, lo que puede dificultar la carga en entornos de producción.
- Alcance limitado: el modelo solo trabaja con datos de criptomonedas de Binance, no es generalizable a otros mercados sin reentrenamiento.

## Enlaces

- HuggingFace: https://huggingface.co/lakshayybhati/trikaal-v1-baseline
- Repositorio GitHub: https://github.com/lakshayybhati/trikaal
- Manifiesto de pesos: `runs_manifest/m6_weights_release.json`
- Inventario de verificación: `runs_manifest/m6_rescue_inventory.json`
- Recibo de legibilidad de microestructura: `runs_manifest/m6_micro_legibility_stop.json`
- Sonda Stage-1 de cell 2: `runs_manifest/m6_cell2_stage1_probe.json`
