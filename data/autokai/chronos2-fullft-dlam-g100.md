# autokai/chronos2-fullft-dlam-g100

## Resumen

El modelo `autokai/chronos2-fullft-dlam-g100` es un fine-tune completo (no LoRA) del modelo `amazon/chronos-2`, desarrollado por el grupo 100 del curso DLAM (Data Lab and Mining) de la TU Darmstadt como proyecto de bonus. El objetivo era ajustar el modelo preentrenado de forecasting de series temporales a un panel de 96 series operacionales, utilizando 4320 horas etiquetadas. El resultado es un modelo especializado que actúa como miembro de un conjunto (blend) con peso 0.4245, junto a un TFT-cascade-bag5 y un LightGBM, logrando un WAPE de 0.12722 en tres ventanas de validación cruzada con hueco.

El modelo hereda la arquitectura T5 encoder-decoder de Chronos-2, con 119.477.664 parámetros y una longitud de contexto de 1024 tokens. Está pensado exclusivamente para el dataset del curso, no como un predictor generalista. Su publicación en Hugging Face responde a la limitación de 200 MB del archivo de entrega del curso, ya que el fine-tune completo ocupa 455.8 MiB, frente a los 4.6 MiB de un adaptador LoRA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | T5 encoder-decoder (Chronos-2) |
| Parametros totales | 119.477.664 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | no disponible (pesos originales safetensors) |
| Idiomas soportados | no disponible (modelo numerico, agnostico al idioma) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Chronos-2 se basa en un modelo T5 (encoder-decoder) adaptado para forecasting de series temporales. El fine-tune completo reescribe todos los pesos del modelo base, a diferencia de un adaptador LoRA. El entrenamiento se realizó con `finetune_mode=full`, learning rate de 1e-5, 1000 pasos, batch size de 96, contexto de 1024 y longitud de predicción de 672, con semilla 42. Los datos de entrenamiento consisten en 4320 horas etiquetadas de un panel de 96 series operacionales, proporcionadas por el curso. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación; es un ajuste supervisado estándar sobre datos de series temporales.

## Capacidades

- Predicción de series temporales univariantes y multivariantes (el fine-tune se realizó sobre un panel de 96 series).
- Manejo de contexto largo (1024 tokens) para capturar dependencias temporales extensas.
- Generación de pronósticos con horizonte de hasta 672 pasos (configurado en el entrenamiento).
- Integración como miembro de un conjunto (blend) con otros modelos, contribuyendo con un peso de 0.4245.
- No dispone de tool calling, capacidades de visión, audio ni razonamiento simbólico; es un modelo puramente de forecasting.

## Casos de uso

- Predicción de carga operacional en infraestructuras: el modelo puede pronosticar la demanda de recursos (CPU, memoria, red) en sistemas con patrones temporales, gracias a su contexto de 1024 pasos y su entrenamiento en series operacionales.
- Monitorización de sensores industriales: útil para anticipar fallos o picos de consumo en entornos con series temporales de alta frecuencia, aunque su validez fuera del dataset original no está garantizada.
- Planificación de capacidad en centros de datos: al predecir la carga futura, permite dimensionar recursos de forma proactiva, reduciendo costes energéticos.
- Análisis de series financieras de alta frecuencia: aunque no fue entrenado para ello, su arquitectura T5 puede adaptarse a series numéricas, pero se requiere validación adicional.
- Investigación académica en forecasting: sirve como ejemplo de fine-tune completo de un modelo preentrenado, demostrando el flujo de trabajo y los resultados obtenidos en un caso real.
- Componente de un sistema de ensemble: su papel como miembro de un blend con otros modelos (TFT, LightGBM) muestra cómo combinar predictores heterogéneos para mejorar la precisión global.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks individuales para este modelo. La model card reporta únicamente el rendimiento del blend completo (0.4245 * este modelo + 0.4482 * TFT-cascade-bag5 + 0.1273 * LightGBM) con un WAPE de 0.12722 sobre tres ventanas de validación cruzada con hueco, frente a 0.13163 del predecesor de dos miembros. No hay métricas desglosadas por modelo.

## Requisitos de hardware

- VRAM estimada: con 119M parámetros, el modelo en FP32 ocupa ~478 MB; en FP16 ~239 MB; en INT8 ~120 MB. Cabe en cualquier GPU con 2 GB o más, incluso en GPUs integradas.
- GPU recomendadas: cualquier GPU moderna (NVIDIA GTX 1060 6GB, RTX 2060, etc.) es suficiente. También puede ejecutarse en CPU con razonable velocidad.
- Opciones de despliegue: se puede cargar con la librería `transformers` de Hugging Face, o mediante la librería `chronos` específica. También es compatible con vLLM (soporta T5) y con llama.cpp (aunque no es su caso típico).
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| autokai/chronos2-fullft-dlam-g100 | 119.5M | 1024 | Apache-2.0 | Fine-tune completo de Chronos-2 para un dataset específico |
| amazon/chronos-2 | 120M | 1024 | Apache-2.0 | Modelo base preentrenado, universal para forecasting |
| amazon/chronos-1 (versiones) | 20M-200M | 512 | Apache-2.0 | Primera generación, univariante principalmente |

El modelo aquí descrito es un fine-tune del base, por lo que su rendimiento en el dataset del curso es superior al del base sin ajustar, pero su generalización a otros dominios es limitada. No se dispone de comparativas con otros modelos de forecasting como TimesFM o Lag-Llama en la información proporcionada.

## Limitaciones y advertencias

- Modelo sobreajustado al dataset del curso: no es un predictor generalista y su uso fuera del panel de 96 series operacionales no está validado.
- Riesgo de alucinación en predicciones: como todo modelo generativo, puede producir pronósticos plausibles pero incorrectos, especialmente en regímenes no vistos durante el entrenamiento.
- Sesgos derivados de los datos de entrenamiento: las series provienen de un contexto operacional específico, por lo que los patrones aprendidos pueden no transferirse a otros dominios.
- Licencia Apache-2.0 permite uso comercial, pero el modelo no ofrece garantías de precisión ni soporte.
- No se han publicado métricas individuales de rendimiento, solo el resultado del blend, lo que dificulta evaluar su contribución aislada.
- El contexto de 1024 tokens limita la captura de dependencias de muy largo plazo (más allá de ~1024 pasos).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/autokai/chronos2-fullft-dlam-g100
- Modelo base amazon/chronos-2: https://huggingface.co/amazon/chronos-2
- Paper de Chronos-2: https://arxiv.org/abs/2510.15821
- Repositorio oficial de Chronos: https://github.com/amazon-science/chronos-forecasting
- Documentación de Chronos-2 en TSFM: https://tsfm.ai/models/amazon/chronos-2
