# machineandfolk/chronos-2-onnx

## Resumen

`machineandfolk/chronos-2-onnx` es una exportación a formato ONNX del modelo `amazon/chronos-2` de Amazon, un modelo fundacional de series temporales de la familia Chronos. El export reproduce únicamente el paso forward de la red (`Chronos2Model.forward`), no el pipeline completo, y está pensado para inferencia en CPU mediante ONNX Runtime, incluido `onnxruntime-node`. Mantiene la interfaz de covariables del original y hace dinámicas todas las dimensiones relevantes: número de series, longitud de contexto y longitud de previsión.

La relevancia práctica es doble. Por un lado, permite ejecutar un modelo de forecasting de referencia en entornos sin GPU (servidores modestos, contenedores, Node.js), con un blob de pesos de 239 MB en fp16. Por otro, expone directamente la salida en 21 cuantiles, lo que facilita la construcción de intervalos de predicción para gestión de riesgo sin depender del stack PyTorch.

El export se generó con `torch.onnx.export` (dynamo) y `onnx` 1.23.2 sobre la revisión `29ec3766d36d6f73f0696f85560a422f50e8498c`, y se validó contra el pipeline de PyTorch de `chronos-forecasting` 2.3.2 con una diferencia relativa máxima de 4,2e-4. La licencia es Apache-2.0, la misma del modelo original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder de tipo T5 con patching (Chronos-2); el export cubre solo `Chronos2Model.forward` |
| Parámetros totales | No disponible en la información proporcionada; el blob de pesos fp16 de 239 MB implica del orden de 1,2 × 10^8 parámetros |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 8192 pasos temporales según la documentación de Chronos-2; en el grafo ONNX la dimensión es dinámica |
| Horizonte de predicción | 16 a 1024 pasos, en parches de 16 (el modelo lee el número de parches, 1 a 64, del ancho de `future_covariates`) |
| Tipos de cuantización | Pesos fp16 con cast a fp32 en el grafo; cómputo íntegro en fp32; no se distribuyen GGUF ni variantes INT8 |
| Idiomas soportados | No aplica: entrada numérica de series temporales, sin entrada de texto |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`chronos2.onnx` de 3,6 MB + `chronos2.onnx.data` externo de 239 MB) |
| Entradas | `context` float32[rows, time], `group_ids` int64[rows], `future_covariates` float32[rows, 16 × patches] |
| Salida | `quantiles` float32[rows, 21, 16 × patches] en los niveles 0.01, 0.05, 0.1, 0.15, …, 0.9, 0.95, 0.99 |
| Runtimes verificados | `onnxruntime` 1.31.0 (Python) y `onnxruntime-node` 1.23.2 |
| Tamaño del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

Chronos-2 es un transformer encoder-decoder de tipo T5 que trata la serie temporal como una secuencia de parches: cada parche de 16 pasos se proyecta al espacio latente del modelo y se decodifica de nuevo en parches de 16 pasos de salida. Frente a la primera generación de Chronos (univariante y zero-shot), Chronos-2 añade soporte nativo para forecasting multivariante e informado por covariables, además de mantener el enfoque zero-shot. La atención está enmascarada por grupo (`group_ids`): las filas de series distintas en un mismo lote no se atienden entre sí, lo que permite agrupar cientos de series en una sola llamada sin fuga de información.

Sobre el entrenamiento del modelo original no se aportan datos en la información disponible (número de tokens, composición del corpus, uso de RLHF/DPO: no disponible). Lo que sí documenta el export son sus tres modificaciones respecto al grafo PyTorch: se elimina la comprobación que lanzaba excepción ante NaN en covariables futuras (los NaN ya se sustituían por 0 bajo la máscara y la comprobación depende de los datos, por lo que no es exportable); la máscara booleana de grupo se convierte a float antes del `einsum` porque el kernel `Einsum` de CPU de ONNX Runtime no tiene implementación booleana; y todo tensor de pesos de 1024 valores o más se almacena en fp16 y se convierte a fp32 dentro del grafo. El cómputo completo en fp16 se descartó porque desborda en series de gran volumen.

## Capacidades

- Previsión zero-shot de series univariantes y multivariantes, sin reentrenamiento ni ajuste por serie.
- Forecasting informado por covariables: el modelo acepta covariables pasadas y covariables futuras conocidas (por ejemplo, calendario, promociones, festivos) mediante `future_covariates`.
- Salida probabilística nativa en 21 cuantiles (0.01 a 0.99), suficiente para mediana, intervalos centrales y colas.
- Manejo explícito de valores faltantes: NaN en `context` se interpreta como dato ausente.
- Procesamiento por lotes de múltiples series con aislamiento de atención mediante `group_ids`.
- Dimensiones dinámicas: número de series, longitud de contexto (hasta 8192 pasos) y horizonte (16 a 1024 pasos) no están fijados en el grafo.
- Ejecución en CPU con ONNX Runtime, incluido Node.js (`onnxruntime-node`).
- No soporta tool calling, agentes, visión, audio ni generación de texto: es un modelo puramente numérico de forecasting.

## Casos de uso

- Previsión de demanda en retail con covariables conocidas: se alimenta el histórico de ventas como `context` y el calendario de promociones y festivos como `future_covariates`, obteniendo cuantiles por SKU y tienda para dimensionar stock y compras.
- Planificación de capacidad e infraestructura: con series semanales y horizontes de 13 o 52 semanas (los verificados por el autor), se generan escenarios P10/P50/P90 de carga para aprovisionamiento.
- Servicio de forecasting de bajo coste en CPU: al no requerir GPU, el modelo cabe en un contenedor pequeño y sirve predicciones desde un microservicio Python con `onnxruntime`, reduciendo el coste frente a un despliegue PyTorch en GPU.
- Inferencia en el borde o en Node.js: con `onnxruntime-node` 1.23.2 se puede ejecutar dentro de una aplicación Node para predecir localmente sin salir del proceso ni llamar a un servicio externo.
- Forecasting jerárquico por lotes: agrupando cientos de series en una sola llamada y separándolas con `group_ids`, se evita la contaminación cruzada entre series y se amortiza el coste por predicción.
- Gestión de riesgo y planificación de escenarios: la salida en 21 cuantiles permite construir intervalos de confianza asimétricos para presupuestos, seguros o previsiones financieras sin postprocesado adicional.
- Relleno y tolerancia a datos incompletos: en telemetría o sensores con huecos, los NaN del contexto se tratan como faltantes, lo que evita tener que imputar previamente la serie.
- Forecasting multivariante con variables exógenas: por ejemplo, demanda eléctrica con temperatura prevista como covariable futura, aprovechando que el modelo lee las covariables conocidas a futuro directamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible (MMLU, HumanEval, GSM8K y equivalentes no aplican; tampoco hay métricas de error como MASE, sMAPE o CRPS para este export). Lo único que se documenta es la verificación de paridad numérica frente al pipeline de PyTorch:

| Comprobación | Referencia | Diferencia relativa máxima |
|---|---|---|
| Grafo fp32 frente a PyTorch | `chronos-forecasting` 2.3.2, `torch` 2.14.1 | 1,8e-6 |
| Grafo con pesos fp16 (este export) frente a PyTorch | `chronos-forecasting` 2.3.2, `torch` 2.14.1 | 4,2e-4 |

Condiciones del contraste: series sintéticas semanales de 20 a 300 semanas, cuatro covariables estacionales y horizontes de 13, 52, 80 y 140 semanas. No se aportan medidas de latencia ni de throughput.

## Requisitos de hardware

- VRAM: no aplica en el escenario objetivo; el export está pensado para CPU. En memoria principal, el blob de pesos fp16 ocupa 239 MB y, con optimizaciones de grafo desactivadas, no se duplica.
- Advertencia del autor: si se activan las optimizaciones de grafo, ONNX Runtime pliega los casts y genera una copia fp32 de cada peso, duplicando el uso de memoria (del orden de 478 MB solo en pesos) sin ganancia de velocidad. Cargar siempre con optimizaciones desactivadas.
- RAM estimada: no disponible de forma oficial; como referencia, 239 MB de pesos más activaciones, que escalan con el número de filas del lote, la longitud de contexto (hasta 8192) y el número de parches de salida.
- GPU: no requiere ninguna. El autor solo verificó CPU; el uso con `onnxruntime-gpu` no está validado en la documentación.
- CPU: x86-64 con soporte AVX2 recomendable; no se especifican requisitos mínimos.
- Cabe en cualquier equipo de consumo: portátil, Raspberry Pi de gama alta o contenedor con 1 GB de RAM, siempre que se ajuste el tamaño de lote.
- Opciones de despliegue: `onnxruntime` 1.31.0 en Python y `onnxruntime-node` 1.23.2. No se distribuye pipeline de Hugging Face ni tokenizer; hay que implementar el preprocesado a mano.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Formato | Contexto | Horizonte | Runtime objetivo | Licencia |
|---|---|---|---|---|---|
| `machineandfolk/chronos-2-onnx` (este) | ONNX, pesos fp16 y cómputo fp32, solo forward | Dinámico, hasta 8192 pasos | 16 a 1024 pasos (1-64 parches de 16) | ONNX Runtime en CPU y `onnxruntime-node` | Apache-2.0 |
| `kashif/chronos-2-onnx` | ONNX optimizado para `transformers.js` | 8192 pasos | Parches de 16 pasos | `transformers.js` en navegador/JS | Apache-2.0 (modelo base) |
| `TSFM-ai/chronos-2-onnx` | ONNX | No disponible | No disponible | No disponible | Apache-2.0 (modelo base) |
| `amazon/chronos-2` (original) | PyTorch, pipeline completo | 8192 pasos | Parches de 16 pasos | PyTorch, `chronos-forecasting` 2.3.2 | Apache-2.0 |

La diferencia entre los tres exports ONNX no está en el modelo subyacente, que es el mismo, sino en el runtime objetivo y en la interfaz expuesta: el de `kashif` se orienta a `transformers.js`; el de `machineandfolk` expone la llamada a red con tensores crudos y documenta el contraste numérico frente a PyTorch. No se dispone de datos de rendimiento comparado entre ellos.

## Limitaciones y advertencias

- No es un pipeline: expone solo `Chronos2Model.forward`. Es responsabilidad del usuario replicar el preprocesado de `Chronos2Dataset` (modo test) y `Chronos2Pipeline._predict_step` de `chronos-forecasting` 2.3.2, incluido el padding con NaN a la longitud de contexto más larga del lote y a un número entero de parches de 16.
- La salida son exclusivamente cuantiles. No hay media ni predicción puntual directa; la mediana se obtiene leyendo el cuantil 0.5 y el intervalo central combinando 0.05 y 0.95.
- Las optimizaciones de grafo deben desactivarse obligatoriamente; activarlas duplica la memoria de pesos sin mejora de velocidad según el autor, y puede alterar el comportamiento esperado.
- Precisión: los pesos en fp16 introducen un error relativo de hasta 4,2e-4 frente a PyTorch. Para aplicaciones que necesiten exactitud fp32 estricta, este export no es la opción.
- El cómputo en fp16 completo no es viable: desborda en series de gran volumen, de ahí que el grafo mantenga fp32 en toda la aritmética.
- Se elimina la comprobación de NaN en covariables futuras respecto al original; entradas mal formadas pueden pasar silenciosamente en lugar de lanzar un error.
- El padding con NaN hasta el múltiplo de 16 y hasta el contexto más largo del lote desperdicia memoria cuando se mezclan series de longitudes muy dispares en un mismo lote.
- Madurez baja: repositorio con 0 descargas y 0 likes, creado y actualizado el mismo día (22 de octubre de 2026), sin mantenedor de Amazon detrás. El export se ofrece "as is", sin garantía de ningún tipo.
- Sin evaluación de sesgos ni de robustez publicada; sin métricas de error en dominios reales. No hay datos sobre comportamiento fuera de las series sintéticas usadas en la verificación.
- Licencia Apache-2.0: permite uso comercial, pero obliga a conservar los avisos de copyright y licencia, y a indicar cambios si se redistribuye.
- Idiomas: no aplica; cualquier uso con texto requiere otro modelo.

## Enlaces

- HuggingFace del export: https://huggingface.co/machineandfolk/chronos-2-onnx
- Modelo base: https://huggingface.co/amazon/chronos-2
- Repositorio oficial de chronos-forecasting: https://github.com/amazon-science/chronos-forecasting
- Sitio de la familia Chronos: https://chronos-ts.ai/
- Export alternativo para transformers.js: https://huggingface.co/kashif/chronos-2-onnx
- Export alternativo de TSFM-ai: https://huggingface.co/TSFM-ai/chronos-2-onnx
