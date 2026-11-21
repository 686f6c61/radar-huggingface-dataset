# aixk/BAAR4-crypto-trio-v95

## Resumen

BAAR4-crypto-trio-v95 es un modelo de clasificación tabular orientado a la predicción de movimientos en futuros perpetuos de criptomonedas. Lo publica el usuario aixk en Hugging Face y no es una red neuronal ni un transformer: es un conjunto de árboles de decisión (gradient boosting) exportado a formato ONNX, combinando tres librerías de boosting (CatBoost, LightGBM y XGBoost, de ahí "trio"). El artefacto principal ocupa apenas 3,14 MB y contiene 1.133 árboles con un total de 148.539 parámetros de árbol.

El modelo resuelve una tarea muy concreta: a partir de un vector de 189 características de entrada, produce probabilidades de subida y bajada (`p_l`, `p_s`), sus desviaciones estándar (`std_l`, `std_s`) y, en la variante swing, un sesgo direccional (`swing_bias`). Se distribuye en dos ensamblados separados: `swing_ensemble.onnx` (0,05 MB), pensado para operativa de swing en velas de 1 hora, y `sniper_ensemble.onnx` (3,10 MB), orientado a entradas de precisión en velas de 5 minutos. Incluye además un módulo de inferencia en JavaScript (`web_inference.mjs`) que permite ejecutarlo en navegador o Node.js mediante `onnxruntime-web`.

Su relevancia es acotada pero específica: demuestra un patrón de despliegue de modelos de trading ligeros, ejecutables en el cliente sin backend, con cuantización implícita (el propio formato ONNX y el tamaño reducido) y sin dependencia de GPU. No es un modelo de lenguaje ni tiene capacidades generativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de gradient boosting (CatBoost + LightGBM + XGBoost) exportado a ONNX |
| Parametros totales | 148.539 parametros de arbol; 1.133 arboles en total |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica; entrada fija de 189 caracteristicas tabulares |
| Tipos de cuantizacion | No disponible (el modelo se distribuye ya en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | No disponible (no procesa texto) |
| Licencia | MIT |
| Formato de pesos | ONNX (`ir=8`, `opset=13`); modulo de inferencia ES Module (`.mjs`) |
| Tamano de los artefactos | `swing_ensemble.onnx`: 0,05 MB; `sniper_ensemble.onnx`: 3,10 MB; total 3,14 MB |
| Entrada | `X: [N, 189]` |
| Salida | `p_l`, `p_s`, `std_l`, `std_s` (y `swing_bias` en swing) |
| Runtime | `onnxruntime`, `onnxruntime-web` (WASM) |

## Arquitectura y entrenamiento

El modelo es un ensemble de árboles de decisión potenciados por gradiente. La model card indica que combina tres implementaciones (CatBoost, LightGBM y XGBoost) en un "trio", aunque no detalla la proporción de árboles de cada librería ni el esquema exacto de agregación de sus predicciones. El resultado se exporta a ONNX con `ir=8` y `opset=13`, lo que garantiza compatibilidad con runtimes ONNX modernos, incluido `onnxruntime-web` para ejecución en navegador vía WebAssembly.

No se documenta el volumen de datos de entrenamiento, la composición exacta del dataset (más allá de "Binance USDM Futures 365d", es decir, 365 días de futuros perpetuos de Binance), ni si hubo calibración, validación temporal o ajuste de hiperparámetros. Tampoco se especifica el proceso de selección de las 189 características de entrada. La innovación técnica destacable no está en el algoritmo —gradient boosting es estándar— sino en el empaquetado: dos modelos especializados por horizonte temporal (1h y 5m) y un módulo de inferencia WASM sin dependencias de servidor.

## Capacidades

- Clasificación tabular binaria: estima probabilidad de movimiento alcista (`p_l`) y bajista (`p_s`) a partir de 189 features.
- Estimación de incertidumbre: devuelve desviaciones estándar (`std_l`, `std_s`) asociadas a cada probabilidad.
- Sesgo direccional: la variante swing añade `swing_bias` como señal agregada de dirección.
- Doble horizonte temporal: un ensamblado para swing en velas de 1h y otro para entradas de precisión en velas de 5m.
- Inferencia en navegador y Node.js: el módulo `web_inference.mjs` permite ejecución cliente-side con `onnxruntime-web` y WASM, sin ZipMap.
- Sin capacidades de generación de texto, razonamiento simbólico, código, matemáticas, visión, audio ni tool calling.
- Sin soporte multilingüe (no procesa lenguaje natural).
- Sin modo de razonamiento multi-paso ni capacidades de agente.

## Casos de uso

- Trading algorítmico de futuros perpetuos: el modelo puede integrarse en un bot que consuma velas de Binance, calcule las 189 features y obtenga `p_l`/`p_s` para decidir entradas limit. Es adecuado por su latencia mínima y su tamaño (3,14 MB), que permite ejecutarlo en el mismo proceso que el bot sin infraestructura adicional.
- Señalización en el navegador: con `web_inference.mjs` y `onnxruntime-web`, un dashboard o una extensión puede generar señales en tiempo real en el cliente, sin enviar datos a un servidor. Útil para prototipos y herramientas personales.
- Backtesting y validación de estrategias: los dos ensamblados permiten simular por separado la operativa swing (1h) y la de precisión (5m), y comparar su combinación "dual limit" frente a cada modo individual, tal como documenta el autor.
- Filtro de confirmación en estrategias existentes: las salidas `p_l`, `p_s` y `std_l`/`std_s` pueden usarse como capa de confirmación o de descarte de operaciones generadas por otra lógica, aprovechando la estimación de incertidumbre.
- Investigación sobre gradient boosting aplicado a series financieras: el modelo sirve como referencia reproducible de un pipeline completo (features tabulares, ensemble, exportación ONNX, inferencia WASM) para comparar con otros enfoques.
- Despliegue edge de bajo coste: al no requerir GPU y caber en cualquier dispositivo, puede ejecutarse en Raspberry Pi, contenedores ligeros o funciones serverless para generar señales periódicas.
- Educación y divulgación: ejemplo didáctico de cómo empaquetar un modelo de boosting en ONNX y ejecutarlo en JavaScript, útil en cursos de ML aplicado a finanzas.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Modo | Operaciones | Win rate | Retorno neto | Profit factor | MDD |
|---|---|---|---|---|---|
| Swing-1h solo | 125 | 38,4 % | -1,56 % | 0,95 | -10,05 % |
| Sniper-5m solo | 47 | 48,9 % | +7,81 % | 1,41 | -5,21 % |
| Dual (Swing + Sniper limit) | 131 | 40,5 % | +3,13 % | 1,05 | -9,84 % |

Métricas del `model-index` para el modo dual: win rate 40,46 %, profit factor 1,05, retorno neto 3,13 %. Dataset declarado: Binance USDM Futures 365d. Ninguna de estas métricas está marcada como verificada (`verified: false`).

## Requisitos de hardware

- VRAM: no requiere GPU. El modelo corre en CPU; los 3,14 MB de pesos caben holgadamente en memoria RAM de cualquier dispositivo.
- GPU recomendadas: no aplica. Cualquier CPU moderna es suficiente; opcionalmente, `onnxruntime` puede usar aceleración por GPU, pero no es necesaria.
- GPU de consumo: irrelevante para este modelo; no hay ventaja medible frente a CPU dado el tamaño.
- Opciones de despliegue: `onnxruntime` (Python, C++, C#), `onnxruntime-web` (navegador/Node.js vía WASM), integración en servicios backend ligeros o funciones serverless.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño (1.133 árboles, 148.539 parámetros) se espera latencia de microsegundos a pocos milisegundos por muestra en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Se trata de un artefacto muy específico (ensemble de boosting para predicción de futuros cripto, empaquetado en ONNX) y no hay referencias a alternativas en la model card.

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| BAAR4-crypto-trio-v95 | 148.539 (árboles) | No aplica (189 features) | MIT | ONNX | Hugging Face, 0 descargas |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Rendimiento declarado no verificado: las métricas del `model-index` tienen `verified: false` y proceden únicamente del autor. El win rate del 40,5 % en modo dual implica que la mayoría de operaciones no son ganadoras; el profit factor de 1,05 es marginal y muy sensible a comisiones, slippage y condiciones de mercado.
- Riesgo de sobreajuste: con 365 días de datos de un único exchange (Binance USDM Futures) y 1.133 árboles, el modelo puede haber memorizado regímenes de mercado específicos del periodo de entrenamiento. No se documenta validación fuera de muestra ni walk-forward.
- Sin información sobre el dataset ni las features: no se detalla la composición de las 189 entradas, el proceso de selección ni el preprocesado, lo que dificulta la reproducibilidad y la auditoría.
- Sin capacidades generales: no procesa texto, imágenes ni audio; no sirve para tareas fuera de la clasificación tabular financiera.
- Sin soporte multilingüe declarado (no aplica, pero se indica "no disponible" en la ficha).
- Licencia MIT: permite uso comercial y modificación con atribución, pero no exime de responsabilidad sobre las pérdidas financieras derivadas de su uso.
- Advertencia financiera: este modelo no constituye asesoramiento financiero. Su uso en producción con capital real requiere validación independiente, control de riesgo y monitorización continua del drift de mercado.
- Sesgos potenciales: al entrenarse solo con datos de Binance, puede no generalizar a otros exchanges, pares o regímenes de volatilidad.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; proyecto reciente (creado en noviembre de 2026) sin comunidad ni validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aixk/BAAR4-crypto-trio-v95
- No se han encontrado en la información proporcionada otros enlaces (papers, blogs, repositorios o demos) asociados al modelo.
