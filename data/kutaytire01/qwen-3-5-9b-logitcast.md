# kutaytire01/Qwen-3.5-9B-LogitCast

## Resumen

Qwen-3.5-9B-LogitCast es un adaptador LoRA sobre el modelo base Qwen/Qwen3.5-9B, desarrollado por kutaytire01, que convierte un modelo de lenguaje generativo en un clasificador de probabilidades calibradas para mercados de predicción y pronóstico de eventos. En lugar de generar texto, el modelo lee el estado oculto del último token y lo proyecta mediante una cabeza de decisión construida a partir de las filas de embedding de salida del propio backbone, produciendo directamente una probabilidad por cada resultado posible en una sola pasada forward.

El modelo forma parte del trabajo *Reading the Odds: Efficient Event Forecasting via Logit Readout* y actúa como el control de inicialización del experimento: se entrena exactamente igual que LogitCast (mismos datos, mismo objetivo) pero partiendo del backbone Qwen3.5-9B sin destilar, en lugar del adaptador y la cabeza de JEV-9B. Cubre cuatro configuraciones de pronóstico (binario con y sin precios de mercado, y elección múltiple con y sin precios) con una temperatura de calibración independiente por configuración.

Es relevante porque aborda un problema concreto —la estimación de probabilidades calibradas para eventos— con una arquitectura de lectura de logits en una sola pasada, sin generación autoregresiva, lo que reduce latencia y coste frente a planteamientos que obligan al modelo a razonar en texto antes de emitir una estimación. El repositorio ocupa 0,2 GB y se distribuye bajo licencia Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer Qwen3.5-9B con cabeza de decisión logit-readout |
| Parámetros totales | no disponible (adaptador LoRA r=16, alpha=32 sobre proyecciones de atención, atención lineal y MLP; backbone Qwen3.5-9B congelado) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (inferencia documentada en bf16) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) + script `logitcast.py` para la ruta de inferencia |

## Arquitectura y entrenamiento

El modelo parte de un adaptador LoRA nuevo con la forma del adaptador de JEV-9B (rango 16, alpha 32, aplicado a las proyecciones de atención, atención lineal y MLP) y una cabeza de decisión compuesta por las filas del embedding de salida del backbone correspondientes a los tokens de respuesta. La inferencia extrae el estado oculto del último token del prompt y lo proyecta contra esa cabeza para obtener una distribución de probabilidad sobre los resultados, sin generar texto. La temperatura de calibración se aplica por configuración y se almacena en `calibration.json`.

El entrenamiento usa mercados binarios de Polymarket (53.000 filas de entrenamiento) y eventos de elección múltiple (20.000), cada uno pronosticado a 1, 7 o 30 días del cierre, con cada pregunta mostrada en solo una de las dos configuraciones de precio, más 18.500 preguntas de elección múltiple de OpenForesight. Las fechas de pronóstico abarcan del 27 de febrero al 31 de julio de 2026, y todas las preguntas de entrenamiento resolvieron antes del 31 de julio de 2026. El backbone se carga desde el repositorio JEV-9B, que contiene el mismo Qwen3.5-9B congelado.

## Capacidades

- Estimación de probabilidad calibrada para eventos binarios (sí/no) en una sola pasada forward, sin generación de texto.
- Estimación de probabilidad sobre entre 2 y 16 opciones en preguntas de elección múltiple, con probabilidades que suman 1.
- Cuatro configuraciones de entrada: `binary_with_prices`, `binary_without_prices`, `choice_with_prices` y `choice_without_prices`, cada una con su propia temperatura de calibración.
- Configuración adicional `choice_openforesight` para preguntas de elección múltiple redactadas a partir de artículos de noticias.
- Procesamiento de precios de mercado actuales, a un día y a siete días como señal de entrada en las configuraciones con precios.
- Procesamiento de titulares recientes (con fecha y fuente) en preguntas de elección múltiple.
- Lectura de reglas de resolución del mercado incluidas en el estado de la pregunta.
- No soporta tool calling ni function calling (no documentado).
- No soporta razonamiento multi-paso ni modo thinking (no documentado).
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Pronóstico de mercados de predicción binarios: dado el estado de un mercado de Polymarket con sus precios actuales, a un día y a siete días, el modelo devuelve P(Yes) calibrada en una sola pasada, adecuado para integrarse en pipelines que evalúan cientos de mercados por lote.
- Pronóstico de eventos electorales o deportivos con múltiples resultados: para mercados con entre 2 y 16 opciones (por ejemplo, ganador de una liga o de una elección), el modelo produce una distribución normalizada sobre todas las opciones usando la configuración `choice_with_prices`.
- Señal complementaria a los precios de mercado: la configuración sin precios (`binary_without_prices`, `choice_without_prices`) permite obtener una estimación independiente del consenso del mercado, útil para detectar desviaciones entre el modelo y el precio cotizado.
- Investigación en calibración de probabilidades: el modelo sirve como referencia de inicialización en el estudio de técnicas de logit readout, permitiendo reproducir la comparación entre un backbone destilado (JEV-9B) y uno sin destilar (Qwen3.5-9B) sobre el mismo objetivo y datos.
- Pronóstico a partir de noticias: la configuración `choice_openforesight` permite estimar probabilidades para preguntas de elección múltiple redactadas desde artículos periodísticos, incorporando titulares recientes como contexto.
- Evaluación de estrategias de trading en mercados de predicción: las probabilidades calibradas del modelo pueden compararse con los precios de Polymarket para construir reglas de decisión (por ejemplo, operar cuando la diferencia entre modelo y mercado supera un umbral), usando el Brier score como métrica de validación.
- Análisis retrospectivo de mercados resueltos: dado que el modelo acepta fechas de pronóstico arbitrarias dentro del formato entrenado, puede aplicarse sobre estados históricos para estudiar cómo evolucionaba su calibración a 1, 7 y 30 días del cierre.

## Benchmarks y rendimiento

Brier score (menor es mejor) sobre preguntas de test de Polymarket resueltas después de que se conociera el resultado de todos los entrenamientos, según la Tabla 2 del paper. Las probabilidades están calibradas con la temperatura de cada configuración; el Brier de elección múltiple se suma sobre las opciones. Los pesos son el checkpoint del paper, pero `logitcast.py` puntúa una pregunta a la vez en bf16, por lo que sus probabilidades pueden diferir de las predicciones por lotes del paper hasta aproximadamente 0,01.

| Modelo | Sí/no con precios | Sí/no sin precios | Elección múltiple con precios | Elección múltiple sin precios |
|---|---|---|---|---|
| Qwen-3.5-9B-LogitCast (este modelo) | 0,187 | 0,214 | 0,625 | 0,736 |
| Precio de mercado | 0,186 | -- | 0,616 | -- |
| Uniforme | 0,250 | 0,250 | 0,799 | 0,799 |

## Requisitos de hardware

- VRAM estimada: aproximadamente 18 GB en bf16 para el backbone completo más el adaptador y la cabeza de decisión, según la model card.
- GPU recomendadas: una GPU con al menos 18-24 GB de VRAM; A100, H100 o RTX 4090 son adecuadas para la inferencia en bf16 documentada.
- Cabe en GPU de consumo: sí, en tarjetas con 24 GB o más (RTX 3090, RTX 4090) en bf16; no se documentan cuantizaciones alternativas.
- Opciones de despliegue: la ruta de inferencia oficial es el script `logitcast.py` incluido en el repositorio, que requiere `torch`, `transformers` 5.x, `peft` y `safetensors`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada; el diseño de una sola pasada forward sin generación de texto sugiere menor latencia que enfoques autoregresivos, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen-3.5-9B-LogitCast | LoRA sobre Qwen3.5-9B | no disponible | Logit readout calibrado, una pasada | Apache 2.0 | Hugging Face (kutaytire01) |
| LogitCast | LoRA sobre backbone destilado (JEV-9B) | no disponible | Logit readout calibrado, una pasada | no disponible en la información proporcionada | Hugging Face (kutaytire01) |
| Qwen/Qwen3.5-9B | 9B | no disponible | LLM generativo base | no disponible en la información proporcionada | Hugging Face (Qwen) |

La comparación directa más relevante es con LogitCast, que comparte datos, objetivo y forma de adaptador pero parte del backbone destilado JEV-9B; este modelo es el control de inicialización sin destilar del mismo experimento. Frente al Qwen3.5-9B base, la diferencia es funcional: el base genera texto y no produce probabilidades calibradas directamente.

## Limitaciones y advertencias

- El modelo solo produce probabilidades sobre resultados predefinidos; no genera texto explicativo ni justificaciones, lo que limita su auditabilidad directa.
- Entrenado exclusivamente en inglés; no se documenta soporte para otros idiomas.
- El entrenamiento se basa en mercados de Polymarket y preguntas de OpenForesight con fechas entre febrero y julio de 2026; el rendimiento fuera de esa distribución temporal o de esas fuentes no está validado.
- En la configuración sin precios, el Brier score (0,214 en binario, 0,736 en elección múltiple) es peor que en las configuraciones con precios, lo que indica dependencia significativa de la señal de mercado.
- En elección múltiple con precios, el modelo (0,625) queda ligeramente por detrás del propio precio de mercado (0,616), por lo que no supera al consenso en esa configuración.
- Las probabilidades de `logitcast.py` pueden diferir de las del paper hasta aproximadamente 0,01 debido a la inferencia en bf16 pregunta a pregunta.
- Riesgo de alucinación no aplica en el sentido generativo habitual, pero sí existe riesgo de calibración deficiente en eventos con poca cobertura en los datos de entrenamiento.
- Sesgos conocidos: no documentados en la información proporcionada; cabe esperar sesgos heredados de los datos de Polymarket y del backbone Qwen3.5-9B.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-9B puede tener sus propias condiciones que conviene verificar.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; se trata de un artefacto de investigación reciente sin validación independiente por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kutaytire01/Qwen-3.5-9B-LogitCast
- Modelo de referencia LogitCast: https://huggingface.co/kutaytire01/LogitCast
- Dataset de benchmark LogitBench: https://huggingface.co/datasets/kutaytire01/LogitBench
- Código: https://github.com/kutaytire/LogitCast
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio JEV-9B (backbone congelado): no disponible en la información proporcionada
- Paper *Reading the Odds: Efficient Event Forecasting via Logit Readout*: no disponible el enlace directo en la información proporcionada
