# abel-lab/Simons-178M

## Resumen

Simons-178M es un modelo fundacional de series temporales desarrollado por Abel AI Lab, orientado a la previsión probabilística (probabilistic forecasting). Resuelve el problema de generar distribuciones predictivas sobre horizontes futuros en lugar de una única trayectoria puntual, lo que resulta útil para cuantificar incertidumbre en planificación. El modelo se distribuye con pesos abiertos y código de inferencia y entrenamiento en un repositorio de GitHub.

La arquitectura es un transformer causal que opera sobre parches de 32 pasos temporales y aplica después una capa de atención entre las variables (variates) de una misma serie. Cuenta con 177,7 millones de parámetros, 12 capas, anchura 1024 y 16 cabezas de atención. Soporta series univariantes y multivariantes (hasta 32 variables) con covariables conocidas en el futuro (hasta 16, numéricas o categóricas), y admite ventanas de historia de hasta 32.768 pasos temporales.

Su relevancia actual radica en que combina contexto muy largo, soporte nativo de covariables y salida probabilística en un único modelo compacto, con un rendimiento declarado competitivo en los leaderboards GIFT-Eval, fev-bench y TIME, y con una eficiencia de inferencia notablemente superior a modelos de tamaño similar según el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal sobre parches de 32 pasos + capa de atención entre variables; 12 capas, anchura 1024, 16 cabezas |
| Parametros totales | 177.746.208 (177,7M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 32.768 pasos temporales de historia; 512 pasos por forward pass |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de series temporales, no de texto) |
| Licencia | openmdw-1.1 |
| Formato de pesos | safetensors (librería `simons`, PyTorch) |

## Arquitectura y entrenamiento

El modelo es un transformer causal que tokeniza la serie temporal en parches de 32 pasos y procesa la secuencia de parches con 12 capas de atención de anchura 1024 y 16 cabezas. Tras el encoder temporal, una capa de atención entre variables modela las dependencias cruzadas de una serie multivariante. La salida son 9 cuantiles (0,1 a 0,9), lo que proporciona una distribución predictiva discreta en lugar de una estimación puntual. La inferencia se realiza en PyTorch sobre CPU o GPU mediante el paquete `simons` (versión 0.1.0 o superior).

El entrenamiento consta de cuatro etapas, desde un preentrenamiento sintético hasta un post-entrenamiento sobre datos reales. Los pesos publicados son la media uniforme de dos continuaciones del entrenamiento (model soups), una técnica de promediado de pesos que suele mejorar la robustez. El conjunto de datos público de preentrenamiento está disponible en `abel-lab/Simons-Pretrain`. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon RLHF o DPO (técnicas propias de modelos de lenguaje, en cualquier caso no aplicables directamente a este dominio).

## Capacidades

- Previsión probabilística de series temporales univariantes y multivariantes, con salida de 9 cuantiles.
- Soporte de hasta 32 variables por serie y hasta 16 covariables conocidas en el futuro, numéricas o categóricas.
- Acepta covariables solo-pasadas y las descarta automáticamente.
- Manejo de valores ausentes mediante NaN en la entrada.
- Contexto de historia de hasta 32.768 pasos temporales, con generación de horizontes largos por bloques de 512 pasos.
- Previsión condicionada a covariables futuras (por ejemplo, calendario, promociones o variables exógenas conocidas).
- Inferencia eficiente en CPU y GPU mediante el paquete `simons`.
- No dispone de tool calling, capacidades de agente, visión, audio ni generación de texto: es un modelo especializado exclusivamente en series temporales.

## Casos de uso

- Planificación de demanda y aprovisionamiento: el modelo puede generar intervalos de confianza (cuantiles 0,1 a 0,9) sobre ventas o consumo futuros, incorporando como covariables conocidas días festivos y promociones planificadas, lo que permite dimensionar stock con una tolerancia al riesgo explícita.
- Previsión de carga energética: con contexto de hasta 32.768 pasos (más de tres años a resolución horaria) y covariables de calendario y meteorología prevista, resulta adecuado para predecir demanda eléctrica con incertidumbre cuantificada.
- Monitorización y capacity planning de infraestructura: previsión multivariante de métricas de CPU, memoria y latencia por servicio (hasta 32 variables) para anticipar saturación y disparar escalado.
- Gestión de inventario en retail con series intermitentes: el tratamiento de NaN como valor ausente y el soporte de covariables categóricas permiten modelar productos con historiales incompletos o categóricos (categoría, tienda, promoción).
- Previsión financiera de series macroeconómicas o de tesorería: la salida probabilística facilita escenarios de flujo de caja y análisis de riesgo, con horizontes largos generados por bloques.
- Investigación en modelos fundacionales de series temporales: el código de entrenamiento e inferencia publicado y el dataset de preentrenamiento permiten reproducir, hacer fine-tuning o comparar contra las líneas base de GIFT-Eval, fev-bench y TIME.
- Detección de anomalías basada en residuos: comparar la observación real con los cuantiles predichos permite identificar desviaciones significativas en telemetría industrial o de sistemas.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente, `verified: false` en la model card):

| Benchmark | Metrica | Valor |
|---|---|---|
| GIFT-Eval | MASE (relativo a Seasonal Naive) | 0,6754 |
| GIFT-Eval | CRPS (relativo a Seasonal Naive) | 0,4609 |
| fev-bench | SQL skill score (%, relativo a Seasonal Naive) | 48,57 |
| fev-bench | MASE skill score (%, relativo a Seasonal Naive) | 37,43 |
| TIME | MASE (relativo a Seasonal Naive) | 0,6393 |
| TIME | CRPS (relativo a Seasonal Naive) | 0,5347 |

En cuanto a eficiencia, el autor declara que Simons-297M (el tamaño inmediatamente superior de la familia) completa la previsión de un benchmark entero en minutos sobre una única GPU A100, aproximadamente diez veces más rápido que modelos de tamaño similar. No se proporcionan cifras equivalentes específicas para la variante de 178M.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 177,7M parámetros en precisión completa (fp32) los pesos ocupan aproximadamente 0,7 GB, por lo que la huella es muy reducida y el cuello de botella real es la longitud de contexto y el tamaño de lote.
- GPU recomendadas: el autor cita la A100 para benchmarks completos con el modelo de 297M; para 178M cualquier GPU moderna con suficiente memoria (RTX 3090, RTX 4090, A10, L4, A100, H100) es adecuada.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con 8 GB o más, dado el tamaño del modelo; el requisito real depende de la longitud de la ventana de contexto y del batch.
- Opciones de despliegue: paquete oficial `simons` (PyTorch) sobre CPU o GPU, instalable con `pip install "git+https://github.com/Abel-ai-lab/Simons"`. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI (son herramientas orientadas a modelos de lenguaje y no aplican directamente).
- Latencia y throughput: no se publican cifras concretas para esta variante; solo la comparación relativa de eficiencia del modelo de 297M frente a modelos de tamaño similar.

## Comparativa con modelos similares

No se dispone en la información proporcionada de especificaciones detalladas de modelos comparables (parámetros, contexto, licencia) más allá de la referencia genérica a "cuatro modelos ampliamente usados" en los leaderboards, cuyos nombres no se detallan. La comparación disponible es únicamente posicional:

| Aspecto | Simons-178M | Alternativas |
|---|---|---|
| Parametros | 177,7M | no disponible |
| Contexto | hasta 32.768 pasos | no disponible |
| Covariables futuras | hasta 16 | no disponible |
| Salida | 9 cuantiles | no disponible |
| Licencia | openmdw-1.1 | no disponible |
| Rendimiento | posiciones entre los pesos abiertos en GIFT-Eval, fev-bench y TIME (según el autor) | no disponible |

## Limitaciones y advertencias

- Los resultados de benchmarks están declarados por el autor y marcados como no verificados; deben tomarse con cautela hasta una reproducción independiente.
- El modelo está limitado a 32 variables y 16 covariables futuras por serie; series de mayor dimensionalidad requieren particionado o modelos alternativos.
- La salida se restringe a 9 cuantiles fijos (0,1 a 0,9); no ofrece densidades continuas ni cuantiles extremos (por debajo de 0,1 o por encima de 0,9).
- El horizonte se genera en bloques de 512 pasos por forward pass, lo que puede introducir acumulación de error en horizontes muy largos.
- No se documentan sesgos específicos ni dominios de entrenamiento detallados; el rendimiento fuera de la distribución de `Simons-Pretrain` puede degradarse sin previo aviso.
- Riesgo de alucinación en sentido figurado: el modelo puede producir previsiones plausibles pero incorrectas en regímenes no vistos (cambios estructurales, shocks), por lo que no debe usarse como única fuente en decisiones críticas.
- La licencia openmdw-1.1 debe revisarse antes de uso comercial; no se detallan en la información disponible las restricciones concretas de atribución o redistribución.
- El ecosistema es joven (paquete `simons` 0.1.0 o superior) y no hay integraciones con servidores de inferencia estándar, lo que implica trabajo de integración propio para producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abel-lab/Simons-178M
- Repositorio GitHub (inferencia y entrenamiento): https://github.com/Abel-ai-lab/Simons
- Guía de inicio: https://github.com/Abel-ai-lab/Simons/blob/main/docs/GETTING_STARTED.md
- Dataset de preentrenamiento: https://huggingface.co/datasets/abel-lab/Simons-Pretrain
- Post de presentación: https://abel.ai/research/introducing-simons/
- Colección Simons 1 (cuatro tamaños y datos): https://huggingface.co/collections/abel-lab/simons-1-6ae3d4ce9705938e293c52dd
- Demo Simons Forecast Explorer: https://huggingface.co/spaces/abel-lab/simons-forecast-explorer
- Leaderboard GIFT-Eval: https://huggingface.co/spaces/Salesforce/GIFT-Eval
- Leaderboard fev-bench: https://huggingface.co/spaces/autogluon/fev-bench
- Leaderboard TIME: https://huggingface.co/spaces/Real-TSF/TIME-leaderboard
