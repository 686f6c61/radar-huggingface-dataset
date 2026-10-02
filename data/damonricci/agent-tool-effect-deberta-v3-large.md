# DamonRicci/agent-tool-effect-deberta-v3-large

## Resumen

Agent Tool Effect Classifier es un modelo de clasificacion de texto basado en `microsoft/deberta-v3-large` (435.063.810 parametros) y ajustado por el usuario DamonRicci para una tarea muy concreta dentro de pipelines de agentes: predecir a priori si una herramienta (tool) es de solo lectura (**READ**, no muta estado y su resultado es cacheable) o de escritura (**WRITE**, muta estado y actua como barrera de coherencia). Se publica como parte de una arquitectura denominada Agent Runtime Optimization Middleware.

El problema que resuelve es de ingenieria de sistemas mas que de generacion de lenguaje: en un agente con decenas de herramientas, decidir si una llamada puede servirse desde cache o si invalida el estado compartido es critico para el rendimiento y la correccion. El modelo evita tener que consultar a un LLM planificador para esta decision, sustituyendolo por un encoder de 435M que se ejecuta en una sola pasada y devuelve dos probabilidades.

Es relevante porque la clasificacion es asimetrica y conservadora: solo declara `READ` si P(READ) >= 0,95; en caso contrario fuerza `WRITE`. Ademas incorpora una calibracion por temperatura de Platt (T = 1,4645) que reduce el Expected Calibration Error del 24,8 % al 1,6 %, lo que hace fiable el umbral. El modelo es solo para ingles, licencia MIT y formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DeBERTa-v3-large), 24 capas, dimension oculta 1024, 16 cabezas de atencion |
| Parametros totales | 435.063.810 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; el ejemplo de uso de la model card trunca a 128 tokens |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (tamano del repo: 1,7 GB) |

## Arquitectura y entrenamiento

El modelo parte de `microsoft/deberta-v3-large`, un encoder transformer con atencion desacoplada (disentangled attention) entre contenido y posicion, preentrenado con deteccion de tokens reemplazados al estilo ELECTRA. Sobre esa base se anade una cabeza de clasificacion de secuencia con dos etiquetas (`READ` / `WRITE`), dando un total de 435.063.810 parametros, de los cuales la inmensa mayoria corresponden al encoder preentrenado.

El corpus de ajuste son 20.056 definiciones de herramientas del mundo real, multi-dominio, extraidas de BFCL (Berkeley Function-Calling Leaderboard), ToolBench, AppWorld, SWE-bench y Seal-Tools. Cada ejemplo se serializa en un formato textual con campos `Tool`, `Domain`, `Params` y `Desc`. No se documenta en la model card el uso de RLHF o DPO, ni el numero de tokens totales de entrenamiento, ni hiperparametros de ajuste mas alla de la calibracion. La innovacion tecnica destacable no esta en la arquitectura sino en el post-procesado: una temperatura de Platt fija (T = 1,4645) aplicada a los logits antes del softmax, y una compuerta asimetrica de fallo seguro que convierte en `WRITE` cualquier lectura con probabilidad inferior a 0,95.

## Capacidades

- Clasificacion binaria de definiciones de herramientas en `READ` (no mutante, cacheable) y `WRITE` (mutante, barrera de estado).
- Salida de probabilidades calibradas, aptas para aplicar umbrales estrictos sin recalibracion adicional.
- Procesamiento de definiciones de tools multi-dominio (auth, ficheros, APIs web, operaciones sobre repositorios, etc.).
- Inferencia de una sola pasada sobre secuencias cortas, sin generacion de texto ni decodificacion autoregresiva.
- No soporta tool calling ni function calling: es un clasificador de metadatos de tools, no un ejecutor.
- No soporta razonamiento multi-paso, agentes, vision, audio ni modo de pensamiento.
- Capacidad multilingue: no disponible; el modelo esta entrenado y etiquetado unicamente para ingles.
- Capacidad especial: compuerta de fallo seguro que prioriza la seguridad de la cache frente al acierto en casos limite.

## Casos de uso

- **Middleware de cache de resultados de tools**: antes de ejecutar `get_user_profile`, el orquestador clasifica la definicion; si el veredicto es `READ` con P(READ) >= 0,95, el resultado puede almacenarse en cache y reutilizarse en llamadas posteriores con los mismos argumentos, reduciendo coste y latencia del agente.
- **Invalidacion de cache y coherencia de estado**: cualquier tool clasificada como `WRITE` actua como barrera que purga las entradas de cache afectadas; esto evita servir datos obsoletos tras una operacion de escritura sobre la misma entidad.
- **Planificacion de ejecucion paralela**: las llamadas `READ` pueden lanzarse en paralelo entre si, mientras que las `WRITE` deben serializarse; el clasificador permite construir el grafo de dependencias sin consultar a un LLM.
- **Etiquetado automatico de catalogos de herramientas**: al incorporar un servidor MCP o un conjunto nuevo de APIs, se clasifican sus definiciones en bloque (20.056 ejemplos de entrenamiento cubren cinco ecosistemas distintos) y se puebla el registro de politicas de cache.
- **Gobernanza y confirmacion humana**: enrutar toda tool `WRITE` a un flujo con confirmacion explicita o sandbox, dejando las `READ` en ejecucion automatica; util en agentes con acceso a produccion.
- **Reduccion de coste de tokens del planificador**: sustituir una llamada al LLM (cientos o miles de tokens de prompt) por una inferencia de encoder de 435M con entrada de ~128 tokens, mucho mas barata por decision.
- **Auditoria de seguridad de agentes**: analizar retrospectivamente un historico de llamadas y marcar cuales mutaron estado, para reconstruir trazas e incidentes.
- **Enrutado por criticidad**: enviar las tools clasificadas como `WRITE` a un modelo o revision mas cara y las `READ` a ejecucion directa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (ni MMLU, ni HumanEval, ni exactitud sobre BFCL u otros conjuntos). El unico dato cuantitativo de rendimiento documentado es la calibracion de probabilidades:

| Metrica | Antes de calibracion | Despues de calibracion |
|---|---|---|
| Expected Calibration Error (ECE) | 24,8 % | 1,6 % |
| Temperatura de Platt aplicada | no aplica | T = 1,4645 |
| Umbral de decision P(READ) | no disponible | 0,95 |

No se proporcionan valores de exactitud, precision, recall, F1 ni matriz de confusion sobre ningun conjunto de evaluacion, ni particion de validacion o test. 0 descargas y 0 likes en el momento de la consulta.

## Requisitos de hardware

- **Pesos**: 435M parametros. En FP32 ocupan aproximadamente 1,74 GB (el repo pesa 1,7 GB, coherente con safetensors en FP32); en FP16/BF16 unos 0,87 GB; en INT8 unos 0,44 GB; en INT4 unos 0,22 GB (estimaciones de calculo propio, no publicadas por el autor).
- **VRAM en inferencia**: con un lote pequeno y secuencias de 128 tokens, el consumo real es inferior a 4 GB en FP16, incluyendo activaciones y overhead del runtime.
- **GPU recomendadas**: cabe holgadamente en cualquier GPU de consumo con 4 GB o mas (GTX 1650, RTX 3050, RTX 3060, RTX 4090). No requiere A100 ni H100; usarlas seria sobredimensionado.
- **CPU**: es viable ejecutarlo en CPU para lotes moderados, lo que permite desplegarlo como sidecar junto al orquestador de agentes.
- **Opciones de despliegue**: `transformers` (PyTorch) con `AutoModelForSequenceClassification`, tal como indica la model card. La exportacion a ONNX Runtime o TorchScript es plausible para latencia baja, pero no esta documentada. `vLLM`, `llama.cpp` y `Ollama` no estan pensados para esta arquitectura de encoder de clasificacion y no se mencionan como opciones soportadas.
- **Latencia y throughput**: no disponibles. No se publican mediciones de latencia por peticion ni de peticiones por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| agent-tool-effect-deberta-v3-large | 435.063.810 | Clasificacion READ/WRITE de tools | no disponible (ejemplo a 128 tokens) | MIT | HuggingFace, 0 descargas |
| microsoft/deberta-v3-large (base) | 435M (24 capas, 1024 oculto, 16 cabezas) | Modelo de lenguaje enmascarado / base para fine-tuning | no disponible en la informacion proporcionada | MIT | HuggingFace, ampliamente utilizado |
| Modelos comparables de clasificacion de tools | no disponible | no disponible | no disponible | no disponible | no disponible |

Los resultados de busqueda web obtenidos (articulo de Wikipedia sobre Jev, repositorio `microsoft/DeBERTa`, calendario de lanzamientos de modelos) no aportan alternativas equivalentes a esta tarea concreta de clasificacion de efectos de herramientas. No se dispone por tanto de una comparativa de rendimiento frente a otros clasificadores de la misma categoria.

## Limitaciones y advertencias

- **Ambito muy restringido**: es un clasificador binario de una sola tarea; no genera texto, no razona y no ejecuta herramientas. Cualquier expectativa de uso como LLM es incorrecta.
- **Solo ingles**: la model card declara unicamente `en`; el comportamiento con definiciones de herramientas en castellano u otros idiomas no esta documentado.
- **Sesgo conservador por diseno**: toda prediccion con P(READ) < 0,95 se fuerza a `WRITE`. Esto reduce el riesgo de servir datos obsoletos, pero degrada la tasa de acierto en cache (falsos `WRITE`).
- **Riesgo de alucinacion**: no aplica en el sentido generativo, pero si existe riesgo de clasificacion incorrecta. Un falso `READ` sobre una tool mutante romperia la coherencia de la cache; por eso la compuerta es asimetrica.
- **Datos de entrenamiento limitados**: 20.056 definiciones procedentes de cinco fuentes (BFCL, ToolBench, AppWorld, SWE-bench, Seal-Tools). El rendimiento sobre dominios o convenciones de nombres no representados no esta medido.
- **Sin benchmarks publicados**: no hay exactitud, F1 ni evaluacion en validacion/test, lo que impide estimar la tasa de error real antes de desplegarlo.
- **Sin validacion de la comunidad**: 0 descargas y 0 likes; el modelo no ha sido probado de forma independiente.
- **Calibracion dependiente de dominio**: el valor T = 1,4645 se ajusto sobre el corpus de entrenamiento; si la distribucion de herramientas de produccion difiere, la calibracion puede degradarse y el umbral de 0,95 dejar de ser valido.
- **Licencia**: MIT, permisiva para uso comercial, sin restricciones declaradas mas alla de mantener el aviso de copyright.
- **Metadatos anomalos**: las fechas de creacion y actualizacion del repositorio (2026-10-01) son posteriores a la fecha habitual de publicacion; conviene verificar la procedencia del modelo antes de usarlo en produccion.
- **Dependencia de serializacion**: el rendimiento depende del formato exacto de entrada (`Tool`, `Domain`, `Params`, `Desc`); cambios en ese formato alteran las predicciones sin previo aviso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DamonRicci/agent-tool-effect-deberta-v3-large
- Modelo base en HuggingFace: https://huggingface.co/microsoft/deberta-v3-large
- Repositorio de DeBERTa (Microsoft): https://github.com/microsoft/DeBERTa
- Berkeley Function-Calling Leaderboard (BFCL): no disponible en los resultados de busqueda (mencionado en la model card como fuente de datos)
- ToolBench, AppWorld, SWE-bench y Seal-Tools: no disponibles en los resultados de busqueda (mencionados en la model card como fuentes de datos)
- Articulo sobre Jev (AI model), no relacionado con este modelo: https://en.wikipedia.org/wiki/Jev_(AI_model)
- Calendario de lanzamientos de modelos: https://www.scriptbyai.com/ai-model-release-calendar/
- Catalogo de modelos de HuggingFace: https://huggingface.co/models
