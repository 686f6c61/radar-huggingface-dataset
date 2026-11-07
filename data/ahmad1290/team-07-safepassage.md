# Ahmad1290/team-07-safepassage

## Resumen

SafePassage (team-07-safepassage) es un modelo estadístico de recuento basado en una distribución binomial negativa, publicado por el usuario Ahmad1290 en el contexto del hackathon qai-hf-hackathon-2026. No es un modelo de lenguaje ni una red neuronal profunda: se trata de un artefacto de `statsmodels` que pronostica la probabilidad y el número esperado de ataques contra el transporte marítimo en la región del estrecho de Ormuz. Resuelve un problema de predicción de series temporales de eventos raros (recuentos de ataques) con horizonte a 24 horas, 3 días y 7 días.

El modelo consume únicamente seis variables conocidas al cierre del día anterior: ataques en los últimos 7 días, existencia de un ataque en el último día, días transcurridos desde el último ataque, bloqueo estadounidense en vigor, alto el fuego en vigor y la fase política fechada manualmente a partir de eventos documentados. No requiere fine-tuning, se ejecuta en CPU en segundos y se distribuye con licencia Apache 2.0.

Su relevancia radica en la metodología de validación: un backtest walk-forward de 183 días con reajuste semanal y comparación explícita contra XGBoost, gradient boosting de scikit-learn, un árbol de decisión de profundidad 3, una cadena de Markov de dos estados y un híbrido Markov + modelo de recuento. El modelo se presenta como el más preciso a 24 horas y estadísticamente equivalente al gradient boosting a 3 días, con la ventaja adicional de producir intervalos de recuento y explicaciones por variable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de recuento con distribucion binomial negativa (statsmodels) |
| Parametros totales | no disponible (modelo estadistico, no neuronal; numero de coeficientes no publicado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de features de 7 dias de historico de ataques) |
| Tipos de cuantizacion | no aplica (no hay pesos neuronales que cuantizar) |
| Idiomas soportados | no disponible (no procesa lenguaje natural; salida en ingles segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (artefacto de statsmodels; ficheros de salida JSON y CSV: `forecast_latest.json`, `backtest.csv`, `backtest_summary.json`, `calibration_*.csv`, `reliability.json`, `zones.json`, `forecast.py`) |

## Arquitectura y entrenamiento

El modelo es un GLM de recuento con familia binomial negativa, implementado sobre `statsmodels`. La binomial negativa es adecuada para recuentos sobredispersos, como es el caso de ataques esporádicos con picos puntuales. Las entradas son seis features deterministas: recuento de ataques en los últimos 7 días, indicador de ataque en el último día, días desde el último ataque, indicador de bloqueo estadounidense, indicador de alto el fuego y fase política fechada manualmente a partir de fuentes. El modelo produce tres tipos de salida: probabilidad de al menos un ataque en las próximas 24 horas, probabilidad de al menos un ataque en los próximos 3 días, y recuento esperado de ataques a 3 y 7 días con un rango del 80 %.

No hay entrenamiento neuronal ni ajuste fino. El ajuste se realiza por máxima verosimilitud sobre el histórico de eventos y se reajusta semanalmente durante el backtest walk-forward de 183 días (los últimos 7 días quedan fuera de la evaluación). El modelo incorpora un mecanismo de alerta por cambio de régimen basado en CUSUM, que se activa cuando los errores recientes se desvían de forma sostenida, señalando que las condiciones han cambiado y que las predicciones deben tratarse con cautela. Las fases políticas se fechan manualmente a partir de eventos documentados, lo que introduce una dependencia de juicio humano en la tubería.

## Capacidades

- Pronóstico de probabilidad de al menos un ataque en las próximas 24 horas.
- Pronóstico de probabilidad de al menos un ataque en los próximos 3 días.
- Pronóstico de recuento esperado de ataques a 3 días y a 7 días, con rango del 80 %.
- Generación de intervalos de incertidumbre calibrados (el rango del 80 % contuvo el recuento real a 3 días en el 87 % de los días del backtest).
- Explicabilidad por variable: el modelo de recuento permite atribuir la predicción a cada feature de entrada.
- Detección de cambios de régimen mediante alerta CUSUM cuando los errores recientes son elevados.
- Ejecución en CPU en segundos, sin GPU ni dependencias de deep learning.
- No soporta tool calling, function calling, agentes, razonamiento multi-step ni capacidades multimodales. No es un modelo de lenguaje.

## Casos de uso

- Monitorización operativa de riesgo marítimo: el modelo puede ejecutarse a diario sobre el histórico de incidentes para producir una probabilidad de ataque a 24 horas y 3 días en el estrecho de Ormuz, útil para equipos de análisis de riesgo que necesitan una señal cuantitativa actualizada sin infraestructura de GPU.
- Planificación de rutas y evaluación de ventanas de tránsito: los recuentos esperados a 3 y 7 días con rango del 80 % permiten a operadores logísticos comparar la exposición relativa de distintas ventanas temporales, aunque el modelo no ofrece porcentajes por buque ni recomendaciones de navegación.
- Alimentación de paneles de situación (situational awareness): las salidas JSON (`forecast_latest.json`) y la app asociada en Hugging Face Spaces permiten integrar la predicción en dashboards de seguridad marítima con actualización diaria.
- Investigación en modelado de eventos raros: el código completo (`forecast.py`) y los artefactos de backtest (`backtest.csv`, `calibration_*.csv`, `reliability.json`) sirven como referencia reproducible para comparar modelos de recuento frente a gradient boosting en series de eventos esporádicos.
- Análisis de impacto de factores políticos: al incluir indicadores de bloqueo y alto el fuego, el modelo permite estimar cómo cambia la tasa esperada de ataques al activarse o desactivarse cada condición, con atribución por feature.
- Validación de sistemas de alerta temprana: la alerta CUSUM puede integrarse en un pipeline de monitorización que marque días en los que el régimen ha cambiado y las predicciones históricas dejan de ser fiables, disparando revisión humana.
- Docencia y prototipado rápido: al ejecutarse en CPU en segundos y no requerir ajuste fino, es adecuado para demostrar flujos completos de pronóstico, backtest walk-forward y calibración en cursos o hackathons.

## Benchmarks y rendimiento

Backtest walk-forward de 183 días, reajuste semanal, últimos 7 días no puntuados. Métrica: Brier score (menor es mejor).

| Pronostico | Brier del modelo | vs media de 7 dias | vs igual que ayer |
|---|---|---|---|
| Proximos 3 dias | 0.225 | +19 % (victoria clara) | +39 % (victoria clara) |
| Proximas 24 horas | 0.208 | +4 % (sin diferencia clara) | +25 % (victoria clara) |

"Victoria clara" significa que el intervalo de block-bootstrap al 90 % (bloques de 7 días) sobre la diferencia de Brier excluye el cero. El rango del 80 % contuvo el recuento real a 3 días en el 87 % de los días.

Comparación cualitativa declarada por el autor: XGBoost, gradient boosting de scikit-learn, un árbol de decisión de profundidad 3, una cadena de Markov de dos estados y un híbrido Markov + modelo de recuento se evaluaron con el mismo backtest y las mismas entradas; ninguno supera claramente al modelo de recuento con bootstrap de bloques de 7 días al 90 %. No se publican en la información disponible los Brier scores individuales de esos modelos alternativos.

## Requisitos de hardware

- Inferencia en CPU; no requiere GPU. El autor indica ejecución en segundos.
- VRAM estimada: 0 GB (no hay pesos neuronales).
- GPU recomendadas: ninguna; cualquier CPU convencional es suficiente.
- Cabe en cualquier equipo consumer, incluidos portátiles de gama baja y entornos serverless.
- Opciones de despliegue: ejecución directa de `forecast.py` con `statsmodels`, o consumo de los artefactos JSON/CSV generados; la app de referencia está publicada como Hugging Face Space (`Ahmad1290/team-07-safepassage-app`).
- Latencia y throughput: no disponibles de forma numérica; el autor describe la ejecución como "en segundos".

## Comparativa con modelos similares

| Modelo | Tipo | Entradas | Salidas | Licencia | Resultado en el backtest del autor |
|---|---|---|---|---|---|
| SafePassage (binomial negativa) | GLM de recuento | 6 features | Probabilidad 24 h y 3 dias; recuentos 3 y 7 dias con rango 80 % | Apache 2.0 | Referencia; mejor a 24 h, equivalente a GB a 3 dias |
| XGBoost | Gradient boosting | Mismas 6 features | Probabilidad / recuento | no disponible | No supera claramente al modelo de recuento |
| Gradient boosting (scikit-learn) | Ensemble de arboles | Mismas 6 features | Probabilidad / recuento | no disponible | Equivalente dentro del ruido a 3 dias |
| Arbol de decision (profundidad 3) | Arbol | Mismas 6 features | Probabilidad / recuento | no disponible | No supera claramente al modelo de recuento |
| Cadena de Markov de 2 estados | Modelo estocastico | Estado del dia | Probabilidad de transicion | no disponible | No supera claramente al modelo de recuento |
| Hibrido Markov + recuento | Hibrido | Estado + features | Probabilidad / recuento | no disponible | No supera claramente al modelo de recuento |

Los Brier scores individuales de los modelos alternativos no se incluyen en la información disponible. La comparación se limita al backtest descrito por el autor; no hay comparación con modelos de pronóstico de riesgo marítimo de terceros.

## Limitaciones y advertencias

- Cobertura exclusivamente regional: el modelo pronostica el conjunto del estrecho de Ormuz, nunca un porcentaje por buque ni una recomendación sobre si navegar.
- Dificultad para seguir picos súbitos: el autor señala explícitamente que las oleadas repentinas (octubre de 2026) son difíciles de capturar; la alerta CUSUM solo avisa a posteriori de que los errores recientes son elevados.
- Fases políticas fechadas manualmente a partir de eventos documentados: introduce subjetividad y dependencia de la actualización humana de la variable.
- Validación limitada a 183 días con un único backtest walk-forward; no hay validación en otras regiones ni en otros periodos históricos.
- No es un modelo de lenguaje: no procesa texto, no responde preguntas y no admite tool calling ni agentes.
- Riesgo de mala calibración fuera de régimen: si cambian las condiciones políticas o la naturaleza de los ataques, las probabilidades pueden dejar de estar calibradas sin que el modelo lo detecte de inmediato.
- Sin datos publicados sobre sesgos, cobertura geográfica de las fuentes de incidentes ni tratamiento de incidentes no reportados; la calidad del pronóstico depende de la integridad del histórico de eventos.
- Uso comercial permitido por la licencia Apache 2.0, pero el autor restringe explícitamente el uso a nivel regional y desaconseja su empleo como asesoramiento operativo de navegación.
- Sin descargas ni likes en el momento de la consulta (0 descargas, 0 likes), lo que implica ausencia de validación externa por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ahmad1290/team-07-safepassage
- Dataset asociado: https://huggingface.co/datasets/Ahmad1290/team-07-safepassage-data
- Aplicación (Space): https://huggingface.co/spaces/Ahmad1290/team-07-safepassage-app
- Paper SafePassage (información extracción con LLM, no relacionado con este modelo): https://arxiv.org/abs/2510.00276
- PDF del paper: https://arxiv.org/pdf/2510.00276v1
