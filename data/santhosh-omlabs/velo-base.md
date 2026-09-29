# santhosh-omlabs/velo-base

## Resumen

Velo Base 1.0 es un especialista clásico de decisión tipada ("typed-decision") desarrollado por Santhosh Reddy (santhosh-omlabs, Hyderabad, India). No es un transformer ni un modelo de lenguaje: es una pila de aprendizaje automático clásico construida sobre scikit-learn que, dada una entrada de estado en JSON y un conjunto de preguntas tipadas (`choice`, `noul`, `score`), devuelve una distribución de probabilidad calibrada por pregunta. Se publica como base reentrenable ("refittable base") para dominios verticales.

El modelo se sella sobre el conjunto de datos `LocalLLaMA/typed-decisions` (revisión `ea930645`), con un split de test de 400 casos y 2.000 decisiones, y alcanza una accuracy calibrada de 0,7535. Su propuesta de valor es la eficiencia en CPU: el checkpoint instalado ocupa unos 177 MB y la latencia p50 medida es de ~32 ms por caso de 5 decisiones, frente a ~740 ms de Laya en el mismo host de evaluación, según cifras del propio autor.

Es relevante porque cubre un nicho distinto al de los LLM: decisiones estructuradas, auditables y de bajísimo coste computacional (sin GPU, sin PyTorch), pensadas para integrarse en flujos de trabajo como observabilidad de trazas de agentes, atención al cliente, procesamiento de facturas e incidentes de seguridad, con posibilidad de reentrenamiento sobre etiquetas propias.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pila clásica de scikit-learn: cabezas soft de HistGradientBoosting (HGBR) sobre características de diccionario/estado, TF-IDF → TruncatedSVD(256), mezcla opcional de destilado de atención al cliente, `clip_renorm` y temperatura por tipo de pregunta |
| Parámetros totales | No aplicable en el sentido neuronal; ~91 cabezas HGBR, ~898.000 nodos de árbol y ~7,7 millones de valores SVD |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica / no disponible: la entrada es un estado JSON estructurado, no una secuencia de tokens |
| Tipos de cuantización | No disponibles; no se publican variantes GGUF, AWQ, GPTQ ni similares (checkpoint en pickle de scikit-learn) |
| Idiomas soportados | Inglés (`en`) únicamente; especialista English-only |
| Licencia | Apache-2.0 |
| Formato de pesos | Pickle de scikit-learn (`checkpoints/hybrid/bundle.pkl`) acompañado de `checkpoints/hybrid/meta.json`; paquete Python `velo_base/` |

## Arquitectura y entrenamiento

La arquitectura no es neuronal. Se compone de aproximadamente 91 cabezas de HistGradientBoosting (implementación de scikit-learn) que operan sobre características derivadas del estado JSON y de las preguntas tipadas. El pipeline incluye representación textual mediante TF-IDF seguida de una reducción a 256 dimensiones con TruncatedSVD (unos 7,7 millones de valores), una mezcla opcional de destilado orientada a atención al cliente, una etapa de `clip_renorm` y una temperatura de calibración específica por tipo de pregunta. La salida es una distribución de probabilidad calibrada por pregunta, lo que permite explotar tanto la etiqueta más probable como la confianza asociada.

El entrenamiento es supervisado sobre `LocalLLaMA/typed-decisions` (revisión `ea9306458d6e9563628369a3d1e72e362fb381d2`), el mismo conjunto usado para el sellado de métricas en test. La información disponible no detalla el número de tokens ni la composición completa del dataset (es un dataset de decisiones, no de texto), ni confirma el uso de RLHF o DPO, que no aplicarían a esta pila. La innovación destacable es el enfoque de "base reentrenable": el autor lo plantea como punto de partida para hacer *refit* sobre etiquetas verticales propias, con umbrales de calidad declarados para esta versión (accuracy ≥ 0,752, p50 ≤ 35 ms, tamaño ≤ 200 MB), todos cumplidos.

## Capacidades

- Clasificación de decisiones tipadas: responde preguntas de tipo `choice`, `noul` y `score` a partir de un estado JSON, devolviendo una distribución calibrada por pregunta.
- Estimación de confianza calibrada: las probabilidades están calibradas (ECE ~0,120, Brier ~0,072), lo que habilita umbrales de decisión y políticas de abstención.
- Puntuación continua: para preguntas de tipo `score` reporta un valor numérico (MAE de 0,265 en el conjunto de test), no solo una clase.
- Decisión selectiva: con cobertura del 50 % superior alcanza una accuracy selectiva de 0,894, útil para enrutar solo los casos de mayor confianza.
- Ejecución en CPU: no requiere GPU ni PyTorch; el runtime se limita a NumPy y scikit-learn.
- Adaptación por reentrenamiento: al ser una base "refittable", permite ajustar las cabezas a etiquetas y esquemas verticales.
- Cobertura de flujos predefinidos: los ejemplos publicados cubren `agent_trace_observability`, `customer_service`, `invoice_processing` y `security_incidents`.
- No soporta generación de texto libre, tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido: no es un modelo generativo.

## Casos de uso

- Observabilidad de trazas de agentes: clasificar decisiones a partir del estado de una traza (accuracy calibrada de 0,726 en este flujo), por ejemplo para etiquetar si un paso del agente fue correcto, dudoso o descartable, con una latencia de ~32 ms que permite evaluar en línea sin bloquear el bucle del agente.
- Atención al cliente automatizada: enrutado y clasificación de intenciones o resoluciones sobre estados JSON de conversación (accuracy de 0,708 en el flujo `customer_service`), usando las probabilidades calibradas para derivar a un humano cuando la confianza es baja.
- Procesamiento de facturas: extracción de decisiones estructuradas sobre documentos convertidos previamente a JSON (accuracy de 0,844, el mejor flujo declarado), por ejemplo validación de campos, categorización de gastos o detección de anomalías en líneas de factura.
- Triaje de incidentes de seguridad: clasificación de alertas y decisiones de escalado (accuracy de 0,734 en `security_incidents`), aprovechando la calibración para priorizar solo los casos con probabilidad alta de ser incidentes reales.
- Reentrenamiento vertical como base: partir de Velo Base 1.0 y hacer *refit* de las cabezas HGBR sobre etiquetas propias de un dominio (legal, seguros, logística), reduciendo el coste frente a entrenar un modelo desde cero.
- Enrutado con abstención en pipelines de decisión: usar la accuracy selectiva del 0,894 en el top 50 % para automatizar solo los casos seguros y enviar el resto a revisión humana, con un presupuesto de latencia de decenas de milisegundos por caso.
- Servicio de scoring embebido en CPU: desplegar el modelo como microservicio Python o integrarlo en un proceso batch sin GPU, con un checkpoint de ~177 MB que cabe en contenedores ligeros.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente; `verified: false` en el model-index) sobre `LocalLLaMA/typed-decisions`, split de test, revisión `ea930645` (400 casos / 2.000 decisiones):

| Métrica | Valor |
|---|---|
| Accuracy (calibrada) | 0,7535 |
| Soft accuracy (choice+noul) | 0,557 |
| Brier (calibrado) | 0,072 (mejor con clip: ~0,069) |
| ECE | 0,120 |
| NLL | 0,647 |
| Score MAE | 0,265 |
| Within-1 | 0,986 |
| Top-50 % selective accuracy | 0,894 |
| Latencia p50 | ~32 ms por caso de 5 decisiones |
| Tamaño del paquete | ~177 MB |

Desglose por flujo de trabajo (accuracy calibrada):

| Flujo | Accuracy |
|---|---|
| `invoice_processing` | 0,844 |
| `security_incidents` | 0,734 |
| `agent_trace_observability` | 0,726 |
| `customer_service` | 0,708 |

No hay benchmarks adicionales en la información disponible.

## Requisitos de hardware

- VRAM: 0; el modelo se ejecuta en CPU y no requiere GPU. El checkpoint instalado ocupa ~177 MB.
- RAM: no se especifica en la información disponible; debe poder cargarse en memoria junto con NumPy y scikit-learn.
- GPU recomendadas: ninguna; el autor presenta el modelo explícitamente como "CPU-fast".
- Cabe en hardware de consumo sin GPU: sí, cualquier máquina capaz de ejecutar Python, NumPy y scikit-learn.
- Opciones de despliegue: paquete Python `velo_base` (instalación desde el propio repositorio de Hugging Face, desde GitHub vía `pip install "git+https://github.com/santhosh-omlabs/velo-base.git"` o combinando el paquete de GitHub con los pesos de Hugging Face). vLLM, llama.cpp, Ollama y TGI no son aplicables a este modelo.
- Dependencias de runtime: NumPy y scikit-learn; la librería `datasets` de Hugging Face solo hace falta para descargar el benchmark de la evaluación sellada. PyTorch no es necesario para el checkpoint de producción.
- Latencia medida: p50 ~32 ms por caso de 5 decisiones en el host de evaluación del autor; Laya, en el mismo host, registró ~740 ms de p50. El throughput no se publica ("no disponible").

## Comparativa con modelos similares

La información disponible solo permite comparar cifras de accuracy publicadas por el propio autor; no se detallan parámetros, contexto ni licencias de las alternativas.

| Modelo | Parámetros | Contexto | Accuracy (typed-decisions) | Latencia p50 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Velo Base 1.0 | ~91 cabezas HGBR, ~898.000 nodos de árbol | No aplica (entrada JSON) | 0,7535 | ~32 ms (5 decisiones) | Apache-2.0 | Hugging Face + GitHub |
| Laya | No disponible | No disponible | 0,766 (cifra publicada; Velo alcanza el ~98,4 % de ella) | ~740 ms en el mismo host | No disponible | No disponible |
| TypeSafe Jev 1.13 | No disponible | No disponible | 0,727 (cifra conocida; Velo la supera en ~3,6 %) | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- No es un LLM ni una red neuronal: no genera texto libre, no hace tool calling, no soporta agentes multi-paso ni razonamiento en lenguaje natural.
- Solo inglés: el modelo está marcado como English-only, sin capacidades multilingües declaradas.
- Especialización de esquema: está diseñado para estados y preguntas JSON con una forma similar a la de los flujos de entrenamiento; fuera de ese formato el rendimiento no está caracterizado.
- Rendimiento moderado en soft accuracy (0,557) y ECE de 0,120: la calibración es razonable pero no perfecta, por lo que conviene fijar umbrales conservadores en producción.
- Métricas no verificadas: los resultados del model-index aparecen con `verified: false` y provienen del propio autor; el conjunto de test es de solo 400 casos y 2.000 decisiones, lo que limita la significación estadística.
- El autor documenta que el objetivo de presentación ≥ 60 % se cumple, pero el objetivo ampliado ≥ 72 % falla en algunos modos, según sus propias notas.
- Al ser una base pensada para *refit*, el rendimiento en un dominio concreto dependerá del reentrenamiento y de los datos etiquetados aportados por el usuario.
- Licencia Apache-2.0: permite uso comercial y modificación, siempre que se conserven los avisos de licencia y atribución correspondientes.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de clasificación errónea con confianza alta en entradas fuera de distribución.
- Escasez de señales comunitarias: 0 descargas y 0 "likes" en el momento de la consulta, sin validación independiente publicada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/santhosh-omlabs/velo-base
- Repositorio de código en GitHub: https://github.com/santhosh-omlabs/velo-base
- Conjunto de datos de entrenamiento y evaluación: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- Perfil del autor en GitHub: https://github.com/santhosh-omlabs
- Repositorios del autor: https://github.com/santhosh-omlabs?tab=repositories
- Sitio de Omlabs: https://omlabs.co
- Perfil profesional del autor: https://in/santhosh6404 (según la búsqueda web)
- Documentación interna citada en la model card (no verificada desde aquí): `BENCHMARK.md`, `MODEL_CARD.md`, `artifacts/seal_v1.json`, `docs/ROBUSTNESS.md`, `artifacts/laya_latency.json`, directorio `examples/`
