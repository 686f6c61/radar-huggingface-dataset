# Nabidnur/Lernaea-TS

## Resumen

Lernaea-TS es una familia de modelos fundacionales para series temporales publicada por el desarrollador Nabidnur bajo licencia Apache-2.0. El repositorio de Hugging Face corresponde a la implementación de referencia S0 (PyTorch, ejecutable en CPU) del plan de construcción v6 del proyecto. La familia se compone de cuatro clases de tamaño (Nano, Micro, Small y Base) con recuentos de parámetros medidos que van desde 0,87 millones hasta 103,6 millones, todas ellas por debajo de los umbrales de sus competidores según el autor.

La arquitectura combina parches adaptativos, un tronco Looped Calendar-Rotor DeltaNet (con profundidad de tipo loop-transformer y ligadura de pesos), capas FFN de tipo Mixture-of-Experts top-1 con experto compartido, y una mezcla Hydra que combina pronosticadores neuronales con pronosticadores clásicos ajustados (seasonal-naive, SES-drift y Theta). La cabeza de salida es una cabeza de cuantiles monótona con componente hurdle para tratar series con suelo en cero o cambio de signo.

El modelo resuelve el problema de pronóstico probabilístico multivariante y multihorizonte mediante cuantiles (τ = 0,1…0,9) y pérdida CRPS en forma cerrada. Su relevancia actual radica en la combinación de garantías matemáticas verificadas (equivarianza afín exacta, antisimetrización, ausencia de cruce de cuantiles, cota de la mezcla) con un tamaño reducido que permite ejecución en CPU y despliegue en entornos con recursos limitados. El repositorio no incluye pesos entrenados de producción ni la model card datos de benchmarks o de entrenamiento a gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: parches adaptativos + tronco Looped Calendar-Rotor DeltaNet + MoE top-1 SwiGLU + mezcla Hydra de expertos clásicos |
| Parametros totales | Nano: 0,87M; Micro: 9.579.254; Small: 30.971.502; Base: 103.627.238 |
| Parametros activos | MoE top-1 con experto compartido (número exacto de parámetros activos no disponible) |
| Longitud de contexto | No disponible (el ejemplo de la model card usa series de 1024 pasos y horizonte de 96) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo de series temporales); no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (checkpoint de ejemplo en `checkpoints/nano/model.safetensors`); implementación en PyTorch |

## Arquitectura y entrenamiento

El tronco se organiza en bloques de tipo R (recurrencia) y A (atención) siguiendo patrones como `RRA RRA` en Nano, `RRRA RRRA RRRA R` en Micro o `(RRRA)×4` en Small, con un factor de bucle K=2 que da profundidades efectivas de 10, 22, 27 y 41 bloques respectivamente. La recurrencia Gated DeltaNet se implementa en forma de referencia con ligadura de pesos entre iteraciones del bucle y puertas aprendidas inicializadas a cero, lo que garantiza que la salida con K=2 sea idéntica a K=1 al inicio del entrenamiento. La atención usa RoPE calendárico sobre tokens temporales, con claves analógicas opcionales (E7). Las capas FFN son MoE top-1 con SwiGLU, experto compartido y pérdida de equilibrio de carga.

El escalado por serie es robusto y afín exacto (E2); los parches son de tamaño adaptativo con contrato de padding Span Guard (E1). La cabeza de salida (E3) es una cabeza de cuantiles monótona con hurdle (suelo exacto en cero para τ < p₀ en series no negativas, techo para series con signo invertido). La mezcla Hydra (E5) pondera a nivel de cuantil los expertos neuronales y los clásicos ajustados. La pérdida es pinball más CRPS en forma cerrada con integrales de cola exactas.

Los datos de entrenamiento no están disponibles en la información proporcionada. La model card menciona un run de preentrenamiento "Micro" de 25.000 millones de tokens previsto en la cadena de notebooks de Kaggle del plan, pero no indica que se haya ejecutado ni detalla la composición del dataset. No se documenta RLHF ni DPO. El único checkpoint incluido es el "proof-of-life" de Nano entrenado sobre series sintéticas, con una pérdida que pasa de 0,747 a 0,303 en 30 pasos según el smoke test.

## Capacidades

- Pronóstico probabilístico de series temporales: emite cuantiles para τ = 0,1…0,9 sobre un horizonte configurable (96 pasos en el ejemplo).
- Pronóstico multihorizonte con máscara de observación para manejar valores faltantes.
- Mezcla adaptativa de pronosticadores neuronales y clásicos (seasonal-naive, SES-drift, Theta) mediante la puerta Hydra, con pesos por token de horizonte.
- Manejo de series no negativas con suelo exacto en cero y de series con signo invertido mediante antisimetrización.
- Equivarianza afín exacta: la salida escala y desplaza con la entrada de forma verificada (error 1,1e-05).
- Invariancia al contenido de la región de padding (Span Guard, error 0.0).
- Cabeza de cuantiles sin cruce por construcción.
- No se documentan capacidades de tool calling, agentes, visión, audio, ni generación de texto o código; el modelo es específicamente de series temporales.

## Casos de uso

- Pronóstico de demanda energética: el modelo emite cuantiles de carga horaria a 96 pasos con intervalo de confianza calibrado, útil para planificación de capacidad y mercados de ajuste; la mezcla Hydra permite que el componente seasonal-naive capture estacionalidades fuertes mientras el tronco neuronal modela desviaciones.
- Gestión de inventario y previsión de ventas: con series de ventas diarias enmascaradas para días festivos o cierres, el hurdle con suelo en cero evita predicciones negativas y los cuantiles permiten fijar niveles de stock por percentil de servicio.
- Monitorización de métricas de infraestructura: pronóstico de latencia, CPU o tráfico con 1024 pasos de contexto y cuantiles para disparar alertas por umbral probabilístico en lugar de umbrales fijos.
- Predicción de series financieras de alta frecuencia: la antisimetrización permite modelar series con cambios de signo (rendimientos, flujos netos) de forma consistente, y la equivarianza afín garantiza que el pronóstico se ajuste a cambios de escala de la serie.
- Pronóstico meteorológico y de variables ambientales: series con valores faltantes y padding variable se manejan gracias a la máscara de observación y al contrato Span Guard, que hace el pronóstico invariante al relleno.
- Investigación y prototipado en CPU: al ser una implementación de referencia ejecutable en CPU con menos de 104M de parámetros en su clase mayor, permite reproducir experimentos y validar la arquitectura sin GPU ni TPU.
- Evaluación comparativa de pronosticadores: la mezcla Hydra con expertos clásicos ajustados facilita la comparación directa contra baselines estadísticos dentro del mismo pipeline de evaluación CRPS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta resultados de tests unitarios y del smoke test de entrenamiento (pérdida 0,747 → 0,303 en 30 pasos), no métricas de pronóstico sobre conjuntos de datos estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Por el tamaño de parámetros, Micro (9,6M) y Small (31M) caben con holgura en cualquier GPU consumer en fp32; Base (103,6M) ocupa aproximadamente 0,4 GB en fp32 y menos en fp16/bf16.
- GPU recomendadas: no se especifican; la implementación de referencia es CPU-runnable y la model card indica que el port de producción previsto es TPU/JAX, no GPU.
- Cabe en GPU consumer: sí, todas las clases de tamaño caben en GPUs consumer convencionales por su reducido número de parámetros.
- Opciones de despliegue: la implementación de referencia es PyTorch puro (`python -m lernaea.sizing`, `scripts/nano_train.py`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que además no son aplicables a un modelo de series temporales.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Lernaea-TS Base | 103,6M | no disponible | Apache-2.0 | Repositorio de referencia, sin pesos de producción |
| Lernaea-TS Small | 31,0M | no disponible | Apache-2.0 | Repositorio de referencia, sin pesos de producción |
| Lernaea-TS Micro | 9,6M | no disponible | Apache-2.0 | Repositorio de referencia, sin pesos de producción |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible |

La información proporcionada no identifica modelos competidores concretos ni sus especificaciones, por lo que no es posible establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- El repositorio es una implementación de referencia (S0) y no incluye pesos entrenados de producción; el único checkpoint es el "proof-of-life" de Nano entrenado sobre series sintéticas.
- El run de preentrenamiento de 25.000 millones de tokens para Micro está planificado pero no consta como ejecutado en la información disponible.
- No hay datos publicados de rendimiento en benchmarks estándar de series temporales, por lo que no puede validarse su calidad frente a baselines.
- No se documenta la composición del dataset de entrenamiento ni posibles sesgos; al ser un modelo de series temporales, el riesgo de sesgo depende de los datos de cada dominio de aplicación.
- Riesgo de alucinación no aplica en el sentido de generación de texto, pero sí existe riesgo de pronósticos mal calibrados fuera de la distribución de entrenamiento.
- La licencia es Apache-2.0, que permite uso comercial, pero al no haber pesos entrenados de producción el uso comercial requiere entrenar el modelo por cuenta propia.
- La implementación de referencia es CPU-runnable y el port de producción TPU/JAX no está incluido en el repositorio.
- La model card no especifica la longitud máxima de contexto soportada ni los tipos de cuantización disponibles.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Nabidnur/Lernaea-TS
- Plan de construcción v6 (referenciado en la model card como `../../Lernaea-TS-Plan-v6.md`): no disponible como URL pública en la información proporcionada
- Paper, blog, repositorio de código independiente o demo: no disponibles en la información proporcionada
