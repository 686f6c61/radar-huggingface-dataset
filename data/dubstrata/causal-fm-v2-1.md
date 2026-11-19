# Dubstrata/causal-fm-v2.1

## Resumen

Causal-FM v2.1 es un modelo fundacional probabilístico para series temporales financieras y macroeconómicas desarrollado por Dubstrata. Se trata de un modelo compacto de 5.692.736 parámetros (22,8 MB en fp32) construido sobre una clase de backbone denominada `TimesFM2DGridBackbone`, que combina atención causal horizontal sobre parches temporales con atención vertical entre variables. Su objetivo es la previsión multivariante de estado financiero en horizontes de 5 minutos a 24 horas, emitiendo 288 pasos en una sola pasada hacia delante con 9 cuantiles ordenados.

El modelo se diferencia de los modelos fundacionales univariantes como Chronos o TimesFM en que no extrapola únicamente a partir del historial de precios, sino que modela explícitamente 16 canales estructurados agrupados en cuatro cuadrantes de señal institucional: microestructura de mercado, mercados de predicción, grafo de conocimiento causal y factores macro y cross-asset. Esta geometría de entrada fija impone un contrato estricto de 16 canales, lo que condiciona tanto su evaluación como su aplicabilidad.

Es relevante ahora porque propone una alternativa de muy bajo coste computacional (5,69M de parámetros frente a los 48M de `chronos-bolt-small`) con resultados competitivos en tareas de transferencia zero-shot sobre divisas y oro, y porque su licencia de acceso restringido y verificación manual lo sitúan en un nicho de investigación cuantitativa institucional más que en el de uso abierto general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `TimesFM2DGridBackbone` (transformer con atención causal por parches horizontales y atención cruzada entre variables) |
| Parámetros totales | 5.692.736 (22,8 MB en fp32) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 pasos de entrada (`L=512`), salida de `H=288` pasos por pasada |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo numérico de series temporales, no lingüístico) |
| Licencia | `dubstrata-gated-research-1.0` (acceso manual, uso comercial bajo licencia Enterprise) |
| Formato de pesos | checkpoint PyTorch `.pt` (fp32) |

## Arquitectura y entrenamiento

El backbone `TimesFM2DGridBackbone` procesa una entrada con geometría `(B, M=16, L=512)` y aplica una normalización `RevIN` diferenciable e invariante a escala con `eps=1e-12`. La atención se organiza en dos ejes: atención causal horizontal sobre parches de `patch_size = 32` barras (160 minutos) y atención vertical cruzada entre las 16 variables físicas. La salida tiene geometría `(B, Q=9, H=288, M=16)`, con cuantiles ordenados monotónicamente de 0,1 a 0,9, lo que la convierte en una salida probabilística multivariante nativa. El embedding de variables (`PatchEmbedding.variate_embed`) vincula coordenadas de canal aprendidas a los 16 slots de señal financiera, lo que impide sustituir canales por relleno sintético.

El corpus de preentrenamiento es un sustrato de 16 canales sobre `BTC/USD` con frecuencia de 5 minutos, que cubre desde 2024-11-10 hasta 2026-06-17, con un total de 168.192 barras. Los 16 canales se reparten en cuatro cuadrantes: Q1 microestructura de mercado (precio con diferenciación fraccionaria, volatilidad realizada logarítmica, desequilibrio de flujo de órdenes/VPIN y sesgo de financiación y base de derivados); Q2 mercados de predicción (probabilidad consenso depurada de Sybil, convicción de Shannon, recorte por manipulación HHI y desequilibrio de capital informado); Q3 grafo de conocimiento causal (estado de creencia epistémico de Friedkin-Johnsen, varianza de impacto desacoplada, deriva de novedad semántica de 3072 dimensiones y entropía de conflicto de afirmaciones); y Q4 factores macro y cross-asset (dislocación de solvencia soberana y corporativa, correlato cross-asset primario, PCA de liquidez macro y reloj de decaimiento de publicaciones programadas). No se documenta en la información disponible el uso de RLHF, DPO ni el número total de tokens de entrenamiento más allá de las 168.192 barras indicadas.

## Capacidades

- Previsión probabilística multivariante de series temporales financieras con salida de 9 cuantiles (0,1 a 0,9) ordenados monotónicamente.
- Emisión de 288 pasos en una sola pasada hacia delante, equivalentes a horizontes de 5 minutos a 24 horas sobre datos de 5 minutos.
- Modelado conjunto de 16 canales estructurados con atención cruzada entre variables, en lugar de tratar cada serie de forma independiente.
- Transferencia zero-shot a activos no vistos durante el entrenamiento: `XAU/USD`, `EUR/USD`, `USD/JPY`, `GBP/USD`, `AUD/USD` y `USD/ZAR`.
- Inferencia determinista verificable mediante checksum SHA-256 y fixture anonimizado de 20 ventanas con paridad frente a `expected_verification_checksum.json`.
- Normalización de entrada invariante a escala mediante `RevIN` diferenciable.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no aplicable (modelo numérico).
- Capacidades de visión, audio o modo thinking: no disponibles.

## Casos de uso

- Investigación cuantitativa institucional: el modelo permite generar distribuciones predictivas de 9 cuantiles sobre 16 señales de mercado simultáneas, lo que facilita la construcción de carteras con control explícito del riesgo de cola en lugar de depender de una única predicción puntual.
- Verificación de due diligence de modelos financieros: el checksum SHA-256 y el fixture anonimizado de 20 ventanas permiten a un revisor reproducir la inferencia determinista sin acceso a los lagos de datos propietarios de Dubstrata, lo que resulta adecuado para auditorías de terceros.
- Previsión de tipos de cambio a corto plazo: con transferencia zero-shot demostrada sobre seis pares de divisas, el modelo puede emplearse para generar escenarios probabilísticos de 5 minutos a 24 horas en mesas de tesorería, siempre que se cuente con la licencia correspondiente.
- Modelado de riesgo macro en horizontes de 4 a 24 horas: los canales Q4 (solvencia, correlato cross-asset, liquidez PCA y reloj de publicaciones) permiten anticipar dislocaciones en torno a eventos programados, aprovechando que el modelo lidera en los horizontes de 240, 480 y 1440 minutos.
- Señalización en mercados de predicción: los canales Q2 aportan probabilidad de consenso, convicción de Shannon y recorte por manipulación HHI, útiles para detectar desalineaciones entre el consenso y el flujo de capital informado.
- Detección de toxicidad de flujo de órdenes: el canal VPIN de Q1 permite integrar el modelo en sistemas de alerta temprana de riesgo de ejecución en mesas de trading algorítmico, aunque la licencia prohíbe el despliegue en trading en vivo sin licencia Enterprise.
- Evaluación comparativa de modelos de series temporales: al estar evaluado con la librería estándar `autogluon/fev` v0.11.0 sobre 49 tareas, sirve como referencia reproducible para contrastar modelos fundacionales univariantes frente a multivariantes en el mismo protocolo.

## Benchmarks y rendimiento

Evaluación zero-shot agregada sobre 42 tareas (`XAU/USD` más 5 pares de divisas, `trained_on_this_dataset = False`), con 40 ventanas móviles por tarea (1.960 ventanas por contendiente):

| Modelo | Parámetros | Canales de entrada | SQL Skill (%) [IC 95%] | SQL Win Rate (%) | MASE Skill (%) [IC 95%] | MASE Win Rate (%) |
|---|---:|---:|---:|---:|---:|---:|
| `chronos-bolt-small` | 48,0M | 1 (objetivo) | 37,79 [31,42; 43,81] | 85,19 | 11,99 [10,04; 14,02] | 79,10 |
| `chronos-bolt-tiny` | 9,0M | 1 (objetivo) | 37,48 [31,15; 43,38] | 82,54 | 11,70 [9,80; 13,59] | 76,46 |
| `causal-fm-v2.1-conformal` | 5,69M | 16 (Q1–Q4) | 37,04 [29,69; 43,58] | 76,46 | 11,14 [8,18; 13,83] | 69,58 |
| `causal-fm-v2.1` (raw) | 5,69M | 16 (Q1–Q4) | 34,76 [26,92; 41,62] | 55,82 | 11,14 [8,18; 13,83] | 69,58 |
| `lgbm16_tabular` | — | 16 (Q1–Q4) | 28,33 [22,03; 34,16] | 46,03 | 1,89 [-0,16; 3,96] | 37,57 |
| `auto_ets` | — | 1 (objetivo) | 26,78 [22,53; 30,69] | 55,56 | 5,91 [4,78; 7,06] | 60,85 |
| `auto_theta` | — | 1 (objetivo) | 25,39 [21,49; 28,86] | 50,53 | 3,86 [1,96; 5,48] | 52,91 |
| `var16_ridge` | — | 16 (Q1–Q4) | 8,75 [-0,05; 14,53] | 30,95 | -25,23 [-41,72; -13,41] | 12,17 |
| `seasonal_naive` (baseline) | — | 1 (objetivo) | 0,00 | 8,20 | 0,00 | 27,25 |

Régimen de horizontes estructurales (4 h a 24 h):

| Horizonte | Causal-FM v2.1 Conformal (5,7M) SQL / MASE | Chronos-Bolt-Small (48M) SQL / MASE | LightGBM-16 (16 canales) SQL / MASE | AutoETS SQL / MASE |
|---|---:|---:|---:|---:|
| 240m (4 h) | +45,15% / +14,77% | +43,96% / +13,46% | +33,63% / -0,01% | +33,06% / +4,58% |
| 480m (8 h) | +54,67% / +17,77% | +54,05% / +14,96% | +42,28% / -2,48% | +38,95% / +3,98% |
| 1440m (24 h) | +66,22% / +19,55% | +65,23% / +17,48% | +56,60% / +1,40% | +45,01% / +3,88% |

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint fp32 ocupa 22,8 MB, por lo que la inferencia en fp32 requiere menos de 1 GB de VRAM incluyendo activaciones para lotes pequeños; no se dispone de datos oficiales de consumo de memoria en producción.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, cualquier GPU con al menos 2 GB de VRAM debería ser suficiente, incluidas GTX 1650, RTX 3050 o superiores.
- Cabe en GPU de consumo: sí, con amplio margen, dado el tamaño del checkpoint y la geometría de entrada `(B, 16, 512)`.
- Opciones de despliegue: PyTorch (librería declarada); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que además no aplican a un modelo numérico de series temporales.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Canales | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| Causal-FM v2.1 | 5,69M | 512 pasos de entrada, 288 de salida | 16 | `dubstrata-gated-research-1.0` (acceso manual) | Hugging Face, gated |
| Chronos-Bolt Small | 48,0M | ventana univariante | 1 | Apache 2.0 (según el modelo original de Amazon) | Hugging Face, abierto |
| Chronos-Bolt Tiny | 9,0M | ventana univariante | 1 | Apache 2.0 (según el modelo original de Amazon) | Hugging Face, abierto |
| LightGBM-16 (referencia tabular del autor) | — | 16 canales | 16 | no disponible | no disponible |

En la comparativa agregada, `chronos-bolt-small` obtiene mayor SQL Skill (37,79% frente a 37,04% del conformal) y mayor tasa de victoria, mientras que Causal-FM v2.1 iguala en MASE Skill (11,14%) y supera a Chronos en los horizontes largos de 4, 8 y 24 horas. La ventaja de Causal-FM es de eficiencia paramétrica (8,4 veces menos parámetros que `chronos-bolt-small`) y de modelado multivariante explícito, no de superioridad global en la tabla agregada.

## Limitaciones y advertencias

- Contrato de entrada estricto: el modelo exige exactamente 16 canales con la semántica de los cuadrantes Q1–Q4; no admite relleno sintético ni sustitución por series univariantes, lo que impide su uso directo en datasets retail o meteorológicos.
- Corpus de preentrenamiento limitado a un único activo (`BTC/USD`) y a un periodo concreto (2024-11-10 a 2026-06-17), lo que introduce riesgo de sobreajuste al régimen de mercado de ese intervalo.
- La evaluación zero-shot se limita a oro y cinco pares de divisas; no hay evidencia publicada sobre acciones, renta fija ni materias primas distintas del oro.
- El resultado agregado no supera a `chronos-bolt-small` en SQL Skill ni en tasa de victoria; la ventaja se concentra en horizontes de 4 a 24 horas y en eficiencia de parámetros.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero existe riesgo de calibración deficiente de los cuantiles fuera del régimen de entrenamiento; el autor solo reporta intervalos de confianza amplios en varias métricas.
- Licencia restrictiva: `dubstrata-gated-research-1.0` con acceso manual mediante solicitud (nombre completo, afiliación institucional, correo académico o profesional y alcance de verificación). La redistribución de pesos y el despliegue en trading en vivo requieren licencia Enterprise de Dubstrata.
- Prohibición explícita de redistribuir pesos y de uso comercial en trading en vivo sin licencia Enterprise, lo que limita su adopción en producción.
- Sesgos conocidos: no documentados en la información disponible.
- Idiomas soportados: no aplicable; el modelo no procesa texto.
- No se documentan tipos de cuantización ni formatos alternativos a `.pt` en fp32, lo que puede complicar el despliegue en entornos con requisitos de pesos safetensors o GGUF.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Dubstrata/causal-fm-v2.1
- Librería de evaluación `autogluon/fev` (v0.11.0): no se proporciona enlace directo en la información disponible
- Paper, blog o repositorio adicionales: no disponibles en la información proporcionada
