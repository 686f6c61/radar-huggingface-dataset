# mbarbosa1/zeno-divergent-v105

## Resumen

Zeno v1.05 unified es un modelo de meta-forecasting desarrollado por el usuario mbarbosa1 (publicado bajo la organizacion ZenoDivergent en el codigo de ejemplo). No es un modelo de lenguaje: es un modelo de modelos que recibe un panel de predicciones procedentes de multiples sistemas (modelos meteorologicos, hubs epidemiologicos, encuestas profesionales, mercados de prediccion, agentes de IA) sobre una misma pregunta y devuelve una respuesta corregida, una decision de confianza y una alerta temprana cuando es probable que todo el consenso falle a la vez.

La version v1.05 unifica 13 dominios de prediccion en un unico artefacto de 89.854.584 parametros (segun safetensors), con pesos para cada version servida empaquetados en un solo `model.safetensors`. El enrutador de campos (`routing.json`) dirige cada consulta a la version que mejor se comporto en ese campo concreto: v1.04, v1.03 o v1.01. La innovacion central es el tratamiento de la dependencia entre predictores: las copias y las familias de forecasters cuentan una sola vez, y el modelo emite una advertencia de fallo conjunto cuando todas las familias independientes tienden a equivocarse simultaneamente.

Es relevante porque aborda un problema practico poco cubierto: la calibracion de consensos correlacionados. En lugar de agregar predicciones con medias o medianas, aprende cuando el consenso esta a punto de romperse, algo critico en operaciones meteorologicas, gestion de reservas energeticas, salud publica y riesgo de mercado. Se distribuye con licencia Apache 2.0, pesos en safetensors y ONNX por campo, y una API HTTP/MCP publica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de meta-forecasting; pesos servidos por version v1.04, v1.03 y v1.01) |
| Parametros totales | 89.854.584 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada estructurada por panel de forecasters, no secuencia de tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX, PyTorch |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna (transformer, MLP o hibrida); solo describe el contrato de entrada y salida. La entrada es un panel estructurado de forecasters con cuantiles (q05, q50, q95), un identificador de familia, un tipo, una fuente y un `copy_id` para deduplicar copias exactas. La salida incluye una probabilidad `p`, cuantiles normalizados (`quantiles_z`), una advertencia de panel (`panel_warning`), una advertencia de fallo conjunto por familia (`joint_family_warning`) y una senal de absto (`abstain`). Los cuantiles se expresan en unidades de la escala del panel: valor = centro + escala x q.

El entrenamiento es conjunto sobre los 13 campos (meteorologia historica ECMWF, encuestas del BCE, gripe CDC FluSight, cripto BTC/ETH horario, mercados entre venues, mercados de prediccion, RSV hub, ForecastBench, COVID-19 hub, encuesta de la Fed de Filadelfia, demanda energetica NESO, estado del mar y ensembles meteorologicos). La model card afirma que cada ejecucion de entrenamiento verifica que consumio todos los campos y que la evaluacion es temporalmente honesta: cada campo se prueba en sus semanas mas recientes tras un hueco temporal y con resultados de otros campos purgados. No se especifican volumen de tokens, composicion exacta del dataset ni si se empleo RLHF o DPO.

## Capacidades

- Correccion de consenso: recibe multiples predicciones sobre la misma pregunta y devuelve una estimacion corregida con cuantiles calibrados.
- Decision de tres vias: confiar, ajustar o abstenerse (`abstain`), segun la calidad y coherencia del panel.
- Advertencia de fallo conjunto: detecta cuando todas las familias independientes tienden a fallar simultaneamente.
- Deduplicacion de copias: las copias exactas y los forecasters de la misma familia cuentan una sola vez mediante `copy_id`.
- Enrutamiento por campo: `routing.json` selecciona la version (v1.04, v1.03 o v1.01) que mejor rindio en cada dominio.
- Cobertura de 13 dominios: meteorologia, energia, salud publica, economia, cripto, mercados de prediccion y ForecastBench.
- Integracion via API HTTP, servidor MCP (Claude, ChatGPT, Cursor) y Python/ONNX Runtime.
- Procesamiento por lotes: la API MCP admite lotes de 25 paneles.
- Campos no entrenados se responden como no probados, nunca se adivinan.

## Casos de uso

- Operaciones meteorologicas y de incendios: introducir los ensembles ECMWF y modelos regionales para saber cuando coinciden pero estan a punto de equivocarse juntos, lo que permite activar protocolos de contingencia antes del evento.
- Gestion de red electrica: verificar las previsiones de demanda de NESO antes de comprometer reservas, usando la decision de confiar/ajustar/abstenerse para modular la compra de margen.
- Salud publica: obtener una segunda opinion sobre los ensembles de gripe (FluSight) y COVID-19, con advertencia de fallo conjunto cuando los hubs convergen por dependencia de datos compartidos.
- Riesgo de mercado y cripto: generar un rango calibrado frente a las probabilidades del consenso y las previsiones de mesa para BTC/ETH a 24 horas, con cuantiles en escala del panel.
- Agentes de IA: actuar como comprobacion de seguridad antes de que un agente ejecute una accion basada en una prevision, devolviendo `abstain` cuando el panel es poco fiable.
- Mercados de prediccion: comparar precios entre venues y detectar cuando el consenso entre plataformas es fragil pese a la aparente coincidencia.
- Investigacion en meta-ciencia: analizar la correlacion entre familias de forecasters y cuantificar cuanto se sobreestima la independencia del consenso.

## Benchmarks y rendimiento

Resultados declarados por el autor en semanas no vistas, con intervalos de confianza al 95 % y recuento de casos de prueba:

| Campo | Version | Frente al mejor rival | Casos | Resultado |
|---|---|---|---|---|
| Meteorologia historica (ECMWF) | v1.04 | +34,9 % (+31,3 % a +38,1 %) | 2.464 | Victoria |
| Encuestas BCE | v1.04 | +24,6 % (+10,0 % a +41,7 %) | 82 | Victoria |
| Gripe (CDC FluSight) | v1.03 | +18,9 % (+5,4 % a +34,8 %) | 1.855 | Victoria |
| Cripto (BTC/ETH horario) | v1.04 | +13,4 % (+11,4 % a +15,3 %) | 19.202 | Victoria |
| Mercados entre venues | v1.01 | +12,1 % | 16 | Victoria (muestra pequena) |
| Mercados de prediccion | v1.01 | +0,4 % | 10.220 | Empate |
| RSV hub | v1.01 | -1,0 % | 521 | Empate |
| ForecastBench | v1.01 | -1,9 % | 4.819 | Empate |
| COVID-19 hub | v1.01 | -2,4 % | 1.331 | Empate |
| Encuesta Fed Filadelfia | v1.01 | -2,4 % | 380 | Responde con la referencia |
| Demanda energetica (NESO) | v1.01 | n/a | 2.731 | Respondido, sin puntuar |
| Estado del mar | v1.01 | n/a | 4.532 | Respondido, sin puntuar |
| Ensembles meteorologicos | v1.01 | n/a | 6.543 | Respondido, sin puntuar |

El rival mas fuerte se define como el mejor entre una referencia de panel, un consenso calibrado y un modelo de gradient boosting, seleccionado en dias de seleccion reservados. No se publican resultados de benchmarks estandar de NLP (MMLU, HumanEval, GSM8K) porque el modelo no es de lenguaje.

## Requisitos de hardware

- VRAM estimada: no disponible. Con 89,8 M de parametros, en fp32 ocuparia unos 360 MB de pesos; en fp16, unos 180 MB. La model card no confirma precisiones ni cuantizaciones.
- GPU recomendadas: no especificadas. Por tamano, cualquier GPU consumer moderna (RTX 3060 en adelante) seria suficiente en teoria.
- Cabe en GPU consumer: previsiblemente si, dado el tamano, aunque no hay confirmacion oficial.
- Opciones de despliegue: ONNX Runtime (`model.onnx` y `onnx/<field>.onnx`), PyTorch via `zeno_core`, API HTTP publica (`https://zenodivergent.dev/api/public/v1/check`) y servidor MCP (`https://zenodivergent.dev/api/public/v1/mcp`).
- Latencia y throughput: no disponibles. La paridad ONNX frente a PyTorch se verifico dentro de 1e-4 en paneles de tamanos nuevos (`onnx-parity.json`).

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Zeno v1.05 unified | Meta-forecasting multi-campo | 89,8 M | no disponible | Apache 2.0 | Hugging Face + API + MCP |
| Consenso calibrado (rival interno) | Agregacion estadistica | no disponible | no aplica | no disponible | Referencia del propio autor |
| Gradient boosting (rival interno) | ML tabular | no disponible | no aplica | no disponible | Referencia del propio autor |
| Modelos de forecasting especificos por campo (p. ej. ensembles ECMWF, FluSight) | Prediccion de dominio unico | no disponible | no aplica | variables | Publicos por dominio |

No se identifican en la informacion proporcionada modelos de meta-forecasting multi-dominio directamente comparables; la comparativa se limita a los rivales internos declarados por el autor.

## Limitaciones y advertencias

- Solo cubre 13 campos entrenados; cualquier otro campo se responde como no probado, sin estimacion.
- La entrada debe respetar el esquema del panel (cuantiles q05/q50/q95, familia, fuente, `copy_id`); paneles mal formados o con familias mal etiquetadas degradan la deduplicacion y la advertencia de fallo conjunto.
- Varios campos (demanda energetica, estado del mar, ensembles meteorologicos) estan respondidos pero sin puntuar, por lo que su calidad no esta verificada.
- Muestras pequenas en algunos campos (16 casos en mercados entre venues, 82 en encuestas BCE) limitan la solidez estadistica de las victorias declaradas.
- Los resultados de benchmarks son autodeclarados por el autor y no consta replicacion independiente externa.
- Riesgo de alucinacion no aplica en el sentido de generacion de texto, pero si existe riesgo de calibracion erronea cuando el panel de entrada no representa la distribucion de entrenamiento.
- No se documentan sesgos por idioma ni por region; los datos son mayoritariamente de fuentes estadounidenses y europeas (CDC, ECB, NESO, Fed de Filadelfia).
- Licencia Apache 2.0 permite uso comercial, pero la API publica y el servidor MCP dependen de un servicio externo (`zenodivergent.dev`) cuyas condiciones de uso no se detallan.
- El modelo no es un LLM: no genera texto, no soporta tool calling en el sentido convencional ni razonamiento multi-paso sobre lenguaje natural.

## Enlaces

- Hugging Face: https://huggingface.co/mbarbosa1/zeno-divergent-v105
- API HTTP: https://zenodivergent.dev/api/public/v1/check
- Servidor MCP: https://zenodivergent.dev/api/public/v1/mcp
- Repositorio de pesos referenciado en el codigo: ZenoDivergent/zeno-divergent-v105
- No se han encontrado papers, blogs ni demos adicionales en la informacion proporcionada.
