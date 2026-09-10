# amaye15/moment-gguf

## Resumen

El modelo `amaye15/moment-gguf` es una conversión al formato GGUF del modelo fundacional de series temporales `AutonLab/MOMENT-1-large`. Lo ha desarrollado el autor `amaye15` dentro del proyecto `zsfm-rs`, un workspace en Rust que adapta modelos de forecasting zero-shot a GGUF usando la librería candle de Hugging Face. El objetivo es permitir la inferencia de pronósticos de series temporales sin depender de PyTorch ni de un runtime de Python, lo que simplifica su integración en entornos de producción.

MOMENT-1-large es un modelo de tipo masked patch encoder con arquitectura transformer bidireccional. Fue preentrenado de forma auto-supervisada mediante reconstrucción de parches enmascarados sobre conjuntos diversos de series temporales. El modelo tiene aproximadamente 346 millones de parámetros (según los metadatos de HuggingFace) y produce pronósticos puntuales para horizontes futuros a partir de un contexto de al menos 32 pasos temporales. Su relevancia actual radica en que ofrece una opción eficiente y ligera para tareas de forecasting sin entrenamiento adicional, con soporte para cuantización y ejecución en Rust.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer bidireccional estilo T5 (masked patch encoder) |
| Parametros totales | 346.368.520 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Mínimo 32 pasos temporales; máximo no especificado en la informacion disponible |
| Tipos de cuantizacion | F32, F16, Q8_0 (formato GGUF) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | GGUF (archivos .gguf) |

## Arquitectura y entrenamiento

MOMENT-1-large es un modelo fundacional de series temporales basado en un encoder de parches enmascarados. La entrada se divide en parches de longitud fija; durante el preentrenamiento, los parches correspondientes a la ventana de predicción se sustituyen por un token de máscara aprendible. El backbone es un transformer bidireccional con sesgos de posición relativa, similar al de T5, con alrededor de 385 millones de parámetros en la versión original.

El preentrenamiento es auto-supervisado mediante reconstrucción de parches enmascarados, sobre una colección heterogénea de conjuntos de datos de series temporales. A diferencia de los LLM, este modelo no genera texto: las representaciones de los parches se decodifican para producir pronósticos puntuales de cada paso temporal futuro. La conversión a GGUF se ha realizado con la herramienta `zsfm`, que exporta los pesos a formato GGUF y ejecuta la inferencia mediante candle, sin necesidad de PyTorch.

## Capacidades

- Generación de pronósticos puntuales (point forecasts) para series temporales, sin necesidad de fine-tuning ni entrenamiento adicional.
- Soporte de forecasting zero-shot: puede aplicarse a dominios variados si las series de entrada son compatibles con el contexto visto durante el preentrenamiento.
- Capacidad de procesar un lote de series temporales en una única llamada, devolviendo un resultado por serie.
- Ejecución en Rust o Python mediante la librería `zsfm`, con soporte para cuantización F16 y Q8_0 para reducir el uso de memoria.
- No dispone de cabeza de cuantiles: solo devuelve el pronóstico puntual, sin intervalos de confianza.
- No soporta tool calling, generación de texto, visión, audio ni razonamiento simbólico; su ámbito se limita a forecasting de series temporales.

## Casos de uso

- Pronóstico de demanda en retail: el modelo puede predecir ventas futuras a partir de un histórico de 32 o más observaciones. Al ser zero-shot, permite obtener predicciones rápidas en productos con pocos datos históricos.
- Previsión de consumo energético: se puede aplicar a series de demanda eléctrica horaria para estimar el consumo en las próximas 64 unidades de tiempo, facilitando la planificación de la red.
- Monitorización de sensores IoT: en sistemas de sensores que emiten lecturas continuas, el modelo genera pronósticos a corto plazo para detectar anomalías o anticipar picos en variables como temperatura o presión.
- Planificación de capacidad en servidores: a partir de series de uso de CPU o tráfico de red, el modelo ayuda a prever la carga futura y dimensionar recursos.
- Previsión de tráfico en infraestructuras: puede emplearse para predecir volúmenes de tráfico en carreteras o redes de transporte en horizontes de corto plazo.
- Forecasting financiero en entornos Rust: gracias a la implementación nativa en Rust sin Python, el modelo puede integrarse en sistemas de trading de alta frecuencia o microservicios que requieren baja latencia y bajo overhead.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el archivo F32 requiere aproximadamente 1,4 GB; el F16 alrededor de 0,7 GB; el Q8_0 unos 0,35 GB. La elección depende del balance entre precisión y memoria.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para F32. También puede ejecutarse en CPU.
- Se puede desplegar en consumer GPUs: sí, incluso en tarjetas modestas como GTX 1650 o RTX 3050.
- Opciones de despliegue: el modelo se ejecuta con la librería `zsfm` (Rust/candle). También existe un bindings Python mediante `pip install zsfm`.
- Latencia y throughput: no se dispone de datos de latencia ni throughput en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de comparación en la informacion proporcionada. El modelo original es `AutonLab/MOMENT-1-large`, disponible en PyTorch/safetensors; esta publicación añade soporte GGUF para entornos sin Python y con cuantización F16/Q8_0.

## Limitaciones y advertencias

- El contexto mínimo es de 32 pasos temporales; si el contexto es más corto, la inferencia falla con el error «context too short».
- El modelo no genera cuantiles ni intervalos de confianza; solo ofrece pronósticos puntuales.
- No está diseñado para tareas de lenguaje natural ni razonamiento: su uso se limita exclusivamente a series temporales.
- Al ser un modelo zero-shot, el rendimiento puede degradarse si la distribución de la serie de entrada difiere notablemente de los datos de entrenamiento.
- La precisión de los pronósticos no es verificable en esta ficha, ya que no se han publicado resultados de benchmarks.
- La licencia MIT permite uso comercial sin restricciones, pero la responsabilidad sobre la adecuación del modelo a cada caso recae en el usuario.

## Enlaces

- HuggingFace: https://huggingface.co/amaye15/moment-gguf
- Modelo base: https://huggingface.co/AutonLab/MOMENT-1-large
- Proyecto zsfm-rs: https://github.com/amaye15/zsfm-rs
