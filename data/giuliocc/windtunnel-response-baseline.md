# Giuliocc/windtunnel-response-baseline

## Resumen

Windtunnel-response-baseline es un modelo estadistico de clasificacion tabular publicado por Giuliocc en Hugging Face. No se trata de un modelo de lenguaje ni de una red neuronal profunda: es un modelo de respuesta logistica con regularizacion L2, ajustado para predecir la respuesta a items concretos de instrumentos preelectorales CES (Comparative Study of Electoral Systems). El modelo consume unicamente celdas agregadas de edad y educacion como variables de entrada.

El artefacto se enmarca en una linea de investigacion de encuestas (tag `survey-research`) y se distribuye como un baseline reproducible dentro de un proyecto denominado Wind Tunnel, con un runtime de inferencia en TypeScript documentado aparte. Su relevancia es metodologica: sirve como referencia de comparacion frente a comparadores triviales (uniforme y marginal) para medir la capacidad predictiva de un modelo lineal sobre preguntas exactas de un cuestionario.

El modelo esta pensado para un unico caso de uso: estimar respuestas registradas de una ola de encuesta concreta. El propio autor advierte que no soporta preguntas nuevas, transferencia geografica ni capacidades prospectivas. No dispone de descargas ni likes en el momento de la consulta y su licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion logistica con penalizacion L2 ponderada (modelo lineal, no transformer) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada tabular de celdas edad-educacion) |
| Tipos de cuantizacion | no disponible (no aplica a un modelo lineal) |
| Idiomas soportados | en |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (el autor referencia un fichero `linear.json` con items y un runtime TypeScript; no se especifica safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo es un clasificador tabular de respuesta construido como regresion logistica con regularizacion L2 ponderada, identificado internamente como `human_response_linear_v1` version 1.0.0. La entrada se limita a celdas gruesas de edad y educacion (`a2-e1` en el ejemplo de la model card), y la salida son probabilidades sobre las opciones del item correspondiente del registro de preguntas. El artefacto incluye un hash SHA-256 de integridad (`6ef0398ff506fc8184c01029f3773ba3a96002d2e70c0046e59b35711517fd23`).

No se detalla en la informacion disponible el volumen de datos de entrenamiento, la composicion del dataset, ni si hubo etapas de ajuste adicionales. La model card menciona comparadores de referencia (uniforme, marginal y lineal) evaluados sobre el mismo conjunto, lo que sugiere un diseno de validacion conocido-item sobre instrumentos preelectorales CES exactos. La reproducibilidad se apoya en una funcion `probabilities` del paquete `windtunnel_response.baseline` y en un runtime TypeScript descrito en `INTEGRATION.md`.

## Capacidades

- Estimacion de probabilidades de respuesta para items exactos de instrumentos preelectorales CES.
- Clasificacion tabular a partir de celdas agregadas de edad y educacion.
- Integracion mediante API Python (`from windtunnel_response.baseline import probabilities`).
- Runtime alternativo en TypeScript documentado para despliegue en aplicaciones web.
- Verificacion de integridad del artefacto mediante hash SHA-256 publicado.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agentico.
- No soporta generacion de texto, codigo, matematicas ni vision.
- Multilingue: solo ingles (`en`).
- No dispone de modo thinking ni capacidades de audio.

## Casos de uso

- Baseline metodologico en investigacion de encuestas: sirve como referencia lineal contra la que comparar modelos mas complejos sobre los mismos items CES, gracias a que el autor publica comparadores uniforme, marginal y lineal con metricas de Brier.
- Validacion de pipelines de imputacion de respuestas: el modelo permite estimar la distribucion de respuesta esperada por celda de edad y educacion y contrastarla con la observada en una ola concreta.
- Reproducibilidad de experimentos: la publicacion del hash SHA-256 y de la version del metodo (`human_response_linear_v1` 1.0.0) permite replicar exactamente la inferencia en entornos de investigacion.
- Integracion en aplicaciones TypeScript: el runtime documentado en `INTEGRATION.md` facilita incorporar la estimacion de probabilidades en herramientas web de analisis de encuestas sin depender de Python.
- Auditoria de sesgo y soporte: la model card remite a una divulgacion de sesgo y soporte en la evaluacion y los datasets, util para revisiones eticas de instrumentos preelectorales.
- Docencia y formacion en estadistica aplicada: como ejemplo minimo y reproducible de modelo de respuesta con regularizacion L2 sobre variables sociodemograficas agregadas.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre instrumentos CES preelectorales exactos:

| Candidato | National TV | Within-cell TV | Within-cell half Brier |
|---|---:|---:|---:|
| uniform | 0.2202 | 0.2313 | 0.3073 |
| marginal | 0.0121 | 0.0723 | 0.2588 |
| linear | 0.0120 | 0.0372 | 0.2545 |
| champion | 0.0120 | 0.0372 | 0.2545 |

El candidato `linear` iguala al `champion` en las tres metricas. La mayor ganancia frente al comparador marginal se observa en Within-cell TV (0,0372 frente a 0,0723) y en Within-cell half Brier (0,2545 frente a 0,2588).

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; es un modelo lineal tabular sin requisitos de GPU.
- GPU recomendadas: no aplica; la inferencia puede ejecutarse en CPU.
- Cabe en cualquier GPU consumer y en entornos sin GPU.
- Opciones de despliegue: paquete Python `windtunnel_response.baseline` y runtime TypeScript descrito en `INTEGRATION.md`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; al tratarse de una regresion logistica sobre un numero reducido de celdas, la inferencia es de coste muy bajo, pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Windtunnel-response-baseline | Regresion logistica L2 tabular | no disponible | no aplica | Apache 2.0 | Hugging Face |
| Comparador uniforme (interno) | Baseline trivial | no aplica | no aplica | no disponible | Documentado en la evaluacion |
| Comparador marginal (interno) | Baseline de marginales | no aplica | no aplica | no disponible | Documentado en la evaluacion |

No se dispone de informacion sobre modelos externos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- El autor declara explicitamente que el modelo no soporta preguntas nuevas, transferencia geografica ni capacidades prospectivas.
- Solo estima respuestas registradas de una unica ola de encuesta.
- Entrada restringida a celdas agregadas de edad y educacion; no incorpora otras covariables.
- Idioma limitado a ingles.
- Riesgo de alucinacion no aplica en el sentido generativo, pero las probabilidades pueden no calibrarse fuera de la poblacion y los items de entrenamiento.
- La model card remite a una divulgacion de sesgo y soporte en la evaluacion y los datasets; conviene revisarla antes de cualquier uso.
- Licencia Apache 2.0 permite uso comercial, pero el alcance funcional del modelo es de investigacion y no de produccion general.
- Sin descargas ni likes registrados en el momento de la consulta, lo que limita la validacion externa por parte de la comunidad.
- El formato exacto de los pesos no se especifica; la integracion depende de un fichero `linear.json` y del runtime del proyecto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Giuliocc/windtunnel-response-baseline
- Documentacion de integracion referenciada por el autor: `INTEGRATION.md` (en el repositorio del modelo)
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la informacion disponible.
