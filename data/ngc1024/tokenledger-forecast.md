# ngc1024/tokenledger-forecast

## Resumen

`tokenledger-forecast` es una red neuronal tabular de muy pequeno tamano (aproximadamente 1.443 parametros segun los pesos en safetensors, aunque la model card indica ~2.300) desarrollada por el usuario `ngc1024`. No es un modelo de lenguaje, sino un regresor de cuantiles que predice la longitud de generacion por turno de agentes LLM, el riesgo de "tail blowout" (p90) y el coste marginal de sesion en agentes de codificacion autonoma como Claude Code, Cursor o Aider.

El problema que aborda es concreto: en agentes autonomos el gasto de tokens esta dominado por la cola de la distribucion. La mediana de salida ronda los 250 tokens, pero el percentil 95 supera los 3.100 y acciones complejas con herramientas pueden alcanzar los 31.000 tokens en un solo turno. Un regresor puntual clasico predice la media y no avisa antes de un sobrecoste de 10x. Este modelo predice directamente los cuantiles p10, p50 y p90 a partir de telemetria de sesion activa.

Es relevante ahora porque la observabilidad de coste en agentes es un problema emergente y este modelo se ejecuta en menos de 2 ms en CPU o directamente en el navegador via ONNX Runtime Web, sin coste de GPU en servidor. Es un componente de infraestructura, no un modelo generativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal tabular (multi-quantile pinball regressor, `nn.Module` con `PyTorchModelHubMixin`) |
| Parametros totales | 1.443 (safetensors); la model card indica ~2.300 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (entrada tabular de 6 caracteristicas) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (la entrada es numerica; el campo de idioma es descriptivo) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`) y ONNX (`model.onnx`) |

## Arquitectura y entrenamiento

El modelo es un regresor tabular que mapea un vector de 6 caracteristicas a tres cuantiles de salida (p10, p50, p90) en unidades de tokens. Las caracteristicas de entrada son: `turn_index` (escalado como `min(turn, 200) / 50.0`), `prompt_tokens_k` (ventana de contexto activa en miles de tokens, escalada por `/10.000`), `prev_output_tokens_k` (salida del turno anterior, `/1.000`), `gap_log_s` (`log(1 + gap_seconds)`), `prev_cache_hit_ratio` (0.0 a 1.0) y `window_fill_ratio` (`min(2.0, prompt / 200.000)`).

El entrenamiento se realizo sobre el dataset `ngc1024/tokenledger-events`, con particion estricta por hilo completo para eliminar fuga de datos entre turnos. La funcion de perdida es pinball (quantile loss), lo que explica la salida multi-cuantil. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo tecnicas de regularizacion adicionales. El modelo incluye un script `train_and_export.py` para recalibracion local con logs propios.

## Capacidades

- Prediccion de cuantiles de longitud de generacion por turno (p10, p50, p90) en unidades de tokens.
- Estimacion de riesgo de desbordamiento de cola (p90) para alertar antes de sobrecostes.
- Prediccion de coste marginal de sesion a partir de telemetria de agente.
- Deteccion implicita de cliffs por eviccion de cache cuando los huecos de inactividad superan los 5 minutos (via `gap_log_s` y `prev_cache_hit_ratio`).
- Ejecucion en navegador via ONNX Runtime Web, sin servidor.
- Inferencia en CPU en menos de 2 ms.
- No soporta tool calling, agentes, vision, audio ni generacion de texto: es exclusivamente un regresor tabular.

## Casos de uso

- **Alertas de presupuesto en agentes de codificacion:** integrado en el bucle de un agente tipo Cursor o Aider, el modelo predice el p90 del siguiente turno y dispara una alerta si supera un umbral configurado, evitando blowouts de 10x.
- **Enrutamiento adaptativo de modelo:** si el p90 predicho es alto, el orquestador puede degradar a un modelo mas barato o truncar la ventana de contexto antes de ejecutar la llamada.
- **Dashboard de observabilidad de coste en el navegador:** usando `model.onnx` con ONNX Runtime Web, el equipo puede mostrar predicciones de coste en tiempo real en la UI sin enviar telemetria a un servidor.
- **Planificacion de capacidad de infraestructura:** agregando predicciones p50/p90 sobre sesiones historicas se estima el pico de tokens por hora y se dimensiona el rate limit de la API.
- **Politica de eviccion de cache:** con `gap_log_s` y `prev_cache_hit_ratio` como entradas, el sistema puede anticipar cuando un hueco de inactividad provocara una recarga de cache costosa y actuar en consecuencia.
- **Recalibracion por familia de modelo:** el script `train_and_export.py` permite ajustar el modelo a la distribucion especifica de una familia (Claude 3.5 vs Gemini 1.5/Flash) para corregir la escala de tokens entre proveedores.

## Benchmarks y rendimiento

Evaluado sobre sesiones de agente reservadas, con particion por hilo completo:

| Modelo / Baseline | MAE (tokens) | Cobertura de cola (objetivo 90%) | Runtime |
|---|---|---|---|
| Baseline 1 (mediana constante) | ~1.280 | N/A | < 1 ms |
| Baseline 2 (lag-1 turno anterior) | ~1.410 | N/A | < 1 ms |
| `tokenledger-forecast` (p50) | **~480** | **89,6%** | **< 2 ms (CPU / navegador)** |

La cobertura de cola del 89,6% frente al objetivo del 90% indica una calibracion razonable del cuantil p90 en la distribucion de evaluacion. No se han publicado resultados adicionales (MMLU, HumanEval, GSM8K) porque el modelo no realiza esas tareas.

## Requisitos de hardware

- VRAM estimada: practicamente nula; el modelo ocupa unos pocos kilobytes y se ejecuta en CPU.
- GPU recomendadas: no requiere GPU. Cualquier CPU moderna es suficiente.
- Cabe en cualquier GPU consumer y en cualquier dispositivo con navegador (via ONNX Runtime Web / WebAssembly).
- Opciones de despliegue: PyTorch (`huggingface_hub` + `PyTorchModelHubMixin`), ONNX Runtime Web en navegador, ONNX Runtime nativo en servidor.
- Latencia: menos de 2 ms por inferencia en CPU; menos de 1 ms para los baselines de referencia.
- Throughput: no disponible de forma explicita, pero al ser una red de ~2.300 parametros el limite practico es el del propio runtime, no el del modelo.

## Comparativa con modelos similares

No se dispone de modelos comparables publicados en la informacion proporcionada. Las alternativas mas cercanas son heuristicas y baselines estadisticos, no modelos neuronales:

| Alternativa | Tipo | MAE (tokens) | Cobertura de cola | Runtime |
|---|---|---|---|---|
| Mediana constante | Baseline estadistico | ~1.280 | N/A | < 1 ms |
| Lag-1 (turno anterior) | Baseline estadistico | ~1.410 | N/A | < 1 ms |
| `tokenledger-forecast` | Regresor de cuantiles | ~480 | 89,6% | < 2 ms |

No se conocen otros modelos de pronostico de tokens para agentes con los que comparar directamente.

## Limitaciones y advertencias

- **Especificidad de distribucion:** entrenado sobre distribuciones de sesiones de agente; la escala de tokens varia entre familias de modelo (Claude 3.5 frente a Gemini 1.5/Flash), por lo que las predicciones pueden desviarse sin recalibracion.
- **Dependencia de telemetria:** requiere las 6 caracteristicas de entrada correctamente escaladas; una telemetria incompleta o mal escalada degrada la prediccion.
- **Cobertura de cola no perfecta:** el 89,6% frente al objetivo del 90% implica que aproximadamente 1 de cada 10 desbordamientos de cola no se detectara.
- **Sin validacion externa:** 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion por terceros.
- **No es un modelo generativo:** no debe usarse para generacion de texto, razonamiento ni ninguna tarea de NLP; su unico proposito es la regresion tabular.
- **Licencia MIT:** permite uso comercial sin restricciones, pero no hay garantias implicitas de idoneidad.
- **Riesgo de alucinacion:** no aplica en el sentido habitual (no genera texto), pero si puede producir predicciones mal calibradas fuera de su distribucion de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ngc1024/tokenledger-forecast
- Dataset: https://huggingface.co/datasets/ngc1024/tokenledger-events
- Demo interactiva (Space): https://huggingface.co/spaces/ngc1024/tokenledger-demo
- Perfil del autor: https://huggingface.co/ngc1024
