# kutaytire01/LogitCast

## Resumen

LogitCast es un adaptador LoRA con una cabeza de decisión diseña para pronosticar el resultado de eventos del mundo real en un único forward pass. En lugar de generar una traza de razonamiento o texto libre, el modelo lee una probabilidad calibrada para cada resultado directamente de los logits de una cabeza de clasificación de 24 posiciones (false/true, 0 a 5, A a P). Se construye sobre JEV-9B (autotrust/AutoTrust-Decider-Mini-9B), un modelo de decisión "System 1" de 9B parámetros derivado de Qwen3.5-9B, y se ha ajustado sobre preguntas resueltas de Polymarket y OpenForesight.

El modelo cubre cuatro ajustes operativos: binario con precios de mercado, binario sin precios, elección múltiple (2 a 16 opciones) con precios y elección múltiple sin precios. Cada ajuste tiene su propia temperatura de calibración en `calibration.json`. La relevancia actual reside en su enfoque de eficiencia: elimina por completo la generación autoregresiva y la cadena de pensamiento, sustituyéndolas por una lectura directa de logits, lo que reduce latencia y coste computacional frente a modelos de razonamiento que abordan la misma tarea.

El modelo se publica bajo licencia Apache 2.0, está orientado a inglés y su repositorio ocupa 0,2 GB (solo los pesos del adaptador, ya que el modelo base se descarga por separado, aproximadamente 18 GB en bf16).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.5-9B) con adaptador LoRA y cabeza de decisión de 24 slots |
| Parametros totales | 9B en el modelo base; el adaptador LoRA y la cabeza no se especifican en la información disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el ejemplo de uso emplea bf16) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

LogitCast parte del adaptador y la cabeza de decisión ya liberados con JEV-9B, que consta de 24 slots (false/true, 0 a 5, A a P) y aplica LoRA con rango 16 y alpha 32 sobre las proyecciones de atención, atención lineal y MLP. La innovación central es el mecanismo de lectura de logits: el modelo procesa un prompt estructurado, toma el estado oculto del último token y lo proyecta sobre la cabeza de decisión para obtener una distribución de probabilidad sobre los resultados posibles. No hay decodificación autoregresiva ni generación de texto; la salida es directamente una probabilidad calibrada por opción.

El entrenamiento utiliza 53.000 filas de mercados binarios de Polymarket y 20.000 eventos de elección múltiple, cada uno pronosticado a 1, 7 o 30 días del cierre. Cada pregunta se muestra en solo uno de los dos ajustes de precios (con o sin precios de mercado), y se añaden 18.500 preguntas de elección múltiple de OpenForesight redactadas a partir de noticias. Las fechas de pronóstico abarcan del 27 de febrero al 31 de julio de 2026, y todas las preguntas de entrenamiento se resolvieron antes del 31 de julio de 2026. Los inputs contienen únicamente información disponible en la fecha del pronóstico. El objetivo de entrenamiento es la entropía cruzada del resultado realizado sobre los slots de la cabeza de decisión. La calibración se aplica a posteriori mediante una temperatura específica por ajuste almacenada en `calibration.json`.

## Capacidades

- Pronóstico binario (sí/no) de eventos del mundo real, con y sin precios de mercado en la entrada.
- Pronóstico de elección múltiple con 2 a 16 opciones, con y sin precios de mercado.
- Lectura de probabilidades calibradas por resultado en un único forward pass, sin generación de texto ni traza de razonamiento.
- Procesamiento de estados estructurados que incluyen fecha, evento, fecha de cierre, reglas de resolución, precios históricos (ahora, hace un día, hace siete días) y titulares recientes.
- Cuatro ajustes operativos diferenciados con temperatura de calibración propia por ajuste.
- Manejo de preguntas redactadas a partir de noticias (OpenForesight) además de preguntas de mercado.
- No soporta tool calling, function calling, agentes multi-paso, visión, audio ni modos de pensamiento explícitos según la información disponible.

## Casos de uso

- Pronóstico de mercados de predicción: el modelo lee el estado de un mercado de Polymarket (incluyendo precios actuales e históricos) y devuelve una probabilidad calibrada para cada resultado, útil para comparar la estimación del modelo con el precio de mercado y detectar desviaciones.
- Análisis de riesgo en mercados binarios: para una pregunta de sí/no con reglas de resolución complejas, el modelo produce P(Yes) en un solo forward pass, lo que permite evaluar rápidamente el atractivo de una posición sin coste de generación.
- Priorización de eventos en elección múltiple: con 2 a 16 opciones, el modelo asigna probabilidades que suman 1, lo que facilita la clasificación de resultados probables en eventos deportivos, políticos o financieros.
- Evaluación de preguntas redactadas desde noticias: el ajuste `choice_openforesight` permite pronosticar preguntas de elección múltiple construidas a partir de titulares, útil para sistemas de análisis de actualidad.
- Investigación en calibración de probabilidades: el modelo y su benchmark LogitBench sirven para estudiar la calibración de lecturas de logits frente a precios de mercado y distribuciones uniformes.
- Integración en pipelines de scoring de baja latencia: al no generar texto, el modelo puede puntuar lotes de preguntas en entornos donde la latencia de decodificación es crítica, siempre que se disponga de una GPU con capacidad para el modelo base en bf16.

## Benchmarks y rendimiento

Brier score (menor es mejor) sobre preguntas de test de Polymarket resueltas después de que se conocieran todos los resultados de entrenamiento, según la Tabla 2 del paper. Las probabilidades están calibradas con la temperatura del ajuste y el Brier de elección múltiple se suma sobre las opciones.

| Modelo | Binario con precios | Binario sin precios | Elección múltiple con precios | Elección múltiple sin precios |
|---|---|---|---|---|
| LogitCast | 0.188 | 0.215 | 0.627 | 0.735 |
| Precio de mercado | 0.186 | -- | 0.616 | -- |
| Uniforme | 0.250 | 0.250 | 0.799 | 0.799 |

El autor advierte que los pesos publicados corresponden al checkpoint del paper, pero `logitcast.py` puntúa una pregunta a la vez en bf16, por lo que sus probabilidades pueden diferir de las predicciones por lotes del paper hasta aproximadamente 0,01.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 18 GB en bf16 para el modelo base completo (según la model card); el adaptador LoRA añade una sobrecarga mínima.
- GPU recomendadas: una GPU con al menos 24 GB de VRAM para bf16 (RTX 4090, A100 40GB, H100). No se especifican requisitos para cuantizaciones inferiores.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en bf16 según el ejemplo de uso del autor; no se confirma compatibilidad con GPUs de 16 GB o menos.
- Opciones de despliegue: el autor proporciona `logitcast.py` como ruta de inferencia completa, que requiere `torch`, `transformers` 5.x, `peft` y `safetensors`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El modelo realiza un único forward pass por pregunta, sin decodificación autoregresiva, lo que en principio reduce la latencia frente a modelos generativos del mismo tamaño, pero no se publican cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LogitCast | 9B (base) + LoRA | No disponible | Lectura de logits, sin generación | Apache 2.0 | Hugging Face |
| JEV-9B (AutoTrust-Decider-Mini-9B) | 9B | No disponible | Modelo de decisión System 1 base | No disponible en la información | Hugging Face |
| Modelos de razonamiento generativos (p. ej., Qwen3.5-9B) | 9B | No disponible | Generación de traza de razonamiento y respuesta | No disponible en la información | Hugging Face |

No se dispone de datos de benchmarks de JEV-9B ni de Qwen3.5-9B en la información proporcionada para establecer una comparación cuantitativa directa. La comparación relevante es frente al precio de mercado y la distribución uniforme, incluida en la tabla de benchmarks.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la información disponible; al entrenarse sobre mercados de Polymarket y OpenForesight, puede heredar sesgos de composición de esos datasets.
- Riesgo de alucinación: el modelo no genera texto, por lo que el riesgo de alucinación textual es nulo; sin embargo, puede producir probabilidades mal calibradas en dominios poco representados en el entrenamiento.
- Limitaciones de contexto e idioma: solo soporta inglés y no se especifica la longitud de contexto. El formato de entrada debe seguir estrictamente las plantillas entrenadas (estado, pregunta, opciones, decisión); desviaciones pueden degradar el rendimiento.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base JEV-9B se descarga por separado y su licencia no se detalla en la información disponible; es necesario verificar la licencia del modelo base antes de un uso comercial.
- Caveat de producción: las probabilidades de `logitcast.py` en bf16 y una pregunta a la vez pueden diferir hasta 0,01 de las predicciones del paper; para aplicaciones sensibles a la calibración, conviene validar contra el benchmark LogitBench.
- Dependencia de la fecha: los inputs deben contener solo información disponible en la fecha del pronóstico; introducir información posterior invalida la calibración.
- Cobertura limitada a los cuatro ajustes entrenados; no es un modelo general de clasificación de texto a pesar del pipeline `text-classification`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kutaytire01/LogitCast
- Modelo base: https://huggingface.co/autotrust/AutoTrust-Decider-Mini-9B
- Dataset de benchmark: https://huggingface.co/datasets/kutaytire01/LogitBench
- Código: https://github.com/kutaytire/LogitCast
- Paper: *Reading the Odds: Efficient Event Forecasting via Logit Readout* (referenciado en la model card; no se proporciona URL directa en la información disponible)
