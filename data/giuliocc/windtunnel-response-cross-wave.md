# Giuliocc/windtunnel-response-cross-wave

## Resumen

Windtunnel-response-cross-wave es un artefacto estadístico publicado por Giuliocc en Hugging Face, no un modelo de lenguaje neuronal. Consiste en un conjunto de modelos de regresión logística multinomial ajustados por pregunta sobre datos de la encuesta CES 2022 (V4), con una variante calibrada mediante offsets en log-odds estimados sobre etiquetas de desarrollo de CES 2024. Su propósito es modelar la distribución de respuestas de la población estadounidense a ítems de encuesta a partir de características de celda (composición demográfica del encuestado), y evaluar la transferencia entre olas de un mismo instrumento.

El artefacto se enmarca en el proyecto Wind Tunnel, orientado a la investigación de respuestas poblacionales y su validación humana. No dispone de pipeline declarado en Hugging Face, no tiene descargas ni likes y su idioma declarado es únicamente inglés. La relevancia es acotada: sirve como referencia metodológica reproducible para calibración de modelos de respuesta en encuestas, con métricas de error de variación total (TV) publicadas tanto a nivel nacional como dentro de celda.

La información disponible es muy limitada: no se especifican recuentos de parámetros, arquitectura de red, contexto, cuantización ni formato de pesos en el sentido habitual de un modelo de IA. Cualquier dato de esa naturaleza debe considerarse no disponible y no se infiere en esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresión logística multinomial por pregunta (modelos lineales independientes por ítem) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto; opera sobre vectores de características de celda) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (matrices de coeficientes e interceptos; el autor no declara safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo es un conjunto de regresiones logísticas multinomiales, una por cada pregunta soportada. Cada ítem se identifica por su question ID y por el SHA-256 exacto del instrumento; la inferencia consiste en multiplicar la matriz de coeficientes del ítem por `cell_features[cell]`, sumar el vector de interceptos y aplicar softmax, interpretando las salidas en el orden de `option_ids`. Existe un modo calibrado que añade `intercept_offsets_from_target_dev` antes del softmax, con offsets ajustados sobre etiquetas de desarrollo de CES 2024.

El ajuste se realizó sobre datos de CES 2022 V4, y la calibración sobre etiquetas de desarrollo de CES 2024; las etiquetas de test de 2024 se reservaron para evaluar ambos modos. El autor advierte explícitamente que se trata de un benchmark retrospectivo, sin claim de promoción a preguntas no vistas ni a olas futuras, y que el modo asistido por etiquetas requiere etiquetas de desarrollo del target para este instrumento exacto. No se documentan técnicas de regularización, número de tokens de entrenamiento ni procedimientos de RLHF/DPO, por no ser aplicables a este tipo de artefacto.

## Capacidades

- Predicción de distribuciones de respuesta por pregunta para celdas demográficas soportadas, mediante softmax sobre las clases de `option_ids`.
- Modo base (2022 logistic) y modo calibrado con offsets de desarrollo 2024 (2024 development-calibrated logistic).
- Validación de integridad del instrumento: rechazo de instrumentos con SHA-256 no coincidente y de celdas fuera de `supported_cells`.
- Evaluación de transferencia entre olas (cross-wave) mediante métricas de variación total nacional y dentro de celda.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no; solo inglés.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Reproducción de benchmarks de calibración en encuestas: permite replicar las métricas TV publicadas (7,94 % / 11,12 % para la marginal 2022; 7,71 % / 8,91 % para la logística 2022; 1,95 % / 8,30 % para la marginal de desarrollo 2024; 1,95 % / 5,20 % para la logística calibrada) siempre que se disponga del instrumento con el SHA-256 exacto.
- Investigación metodológica sobre transferencia entre olas: útil para estudiar cuánto se degrada o mejora la predicción al pasar de CES 2022 a CES 2024 con y sin calibración sobre etiquetas de desarrollo.
- Auditoría de sesgo de composición: al modelar respuestas condicionadas a `cell_features`, permite analizar cómo la composición demográfica de la muestra afecta a las estimaciones agregadas.
- Docencia y formación en estadística de encuestas: ejemplo reproducible de regresión logística multinomial por ítem con validación fuera de ola y control de integridad por hash del instrumento.
- Integración en la aplicación Wind Tunnel: el artefacto está pensado para el entorno response-lab del proyecto, donde puede alimentar experimentos de respuesta poblacional.
- Comparación de estrategias de calibración: sirve como línea base frente a métodos alternativos (post-estratificación, weighting, modelos jerárquicos) sobre los mismos ocho ítems emparejados.

## Benchmarks y rendimiento

Los únicos resultados publicados son las métricas de variación total (TV) de la model card, con la comparación principal ponderando por igual ocho ítems emparejados y usando la composición de encuestados del test como objetivo nacional.

| Metodo | TV nacional media | TV dentro de celda media |
|---|---:|---:|
| Marginal 2022 | 7,94 % | 11,12 % |
| Logistica 2022 | 7,71 % | 8,91 % |
| Marginal con desarrollo 2024 | 1,95 % | 8,30 % |
| Logistica calibrada con desarrollo 2024 | 1,95 % | 5,20 % |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni ningún otro benchmark de modelos de lenguaje en la información disponible, por no ser aplicables a este artefacto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el artefacto consiste en matrices de coeficientes e interceptos por ítem, sin requisitos de GPU documentados.
- GPU recomendadas: no disponible; la inferencia puede ejecutarse en CPU con operaciones matriciales básicas (producto matriz-vector y softmax).
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño reducido de los modelos lineales, aunque el autor no publica cifras de memoria.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI; el propio autor describe el procedimiento de replay manual a partir de coeficientes, interceptos y `cell_features`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Giuliocc/windtunnel-response-cross-wave | Regresión logística multinomial por ítem | no disponible | no aplica | apache-2.0 | Hugging Face (0 descargas, 0 likes) |
| Modelos comparables de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre alternativas equivalentes de modelado de respuesta en encuestas con las que comparar parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Benchmark retrospectivo: el autor declara explícitamente que no hay claim de promoción a preguntas no vistas ni a olas futuras.
- Dependencia de etiquetas: el modo calibrado requiere etiquetas de desarrollo del target para este instrumento exacto, lo que limita su uso en escenarios sin etiquetas.
- Integridad estricta del instrumento: hay que rechazar instrumentos cuyo SHA-256 no coincida y celdas fuera de `supported_cells`; un uso laxo produce predicciones inválidas.
- Cobertura limitada: solo ocho ítems emparejados en la comparación principal y únicamente idioma inglés.
- Sesgos: no se documentan análisis de sesgo específicos más allá de la composición de celdas; el modelado por celda puede heredar sesgos de la muestra CES.
- Riesgo de alucinación: no aplica en el sentido de modelos generativos, pero sí existe riesgo de extrapolación indebida a celdas o preguntas no soportadas.
- Licencia apache-2.0: permite uso comercial, pero el autor no ofrece garantías sobre validez fuera del instrumento y la ola evaluados.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado; tratar como artefacto experimental de investigación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Giuliocc/windtunnel-response-cross-wave
- Dataset de benchmark: https://huggingface.co/datasets/Giuliocc/windtunnel-ces-cross-wave
- Aplicación Wind Tunnel (response lab): https://windtunnel.tacitus.me/research/response-lab
- Colección del proyecto: https://huggingface.co/collections/Giuliocc/wind-tunnel-population-responses-and-human-validation-6b09e8b46000e7910fd4cb4e
