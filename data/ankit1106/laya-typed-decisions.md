# Ankit1106/laya-typed-decisions

## Resumen

Ankit1106/laya-typed-decisions es un checkpoint derivado del modelo base abierto Laya, publicado por Convai Innovations, y ajustado por el usuario Ankit1106 para tareas de toma de decisiones tipadas (typed decisions). El modelo no es un modelo de lenguaje conversacional generalista, sino un especialista entrenado para producir decisiones estructuradas y puntuadas sobre estados y preguntas dados, con 421.293.830 parametros totales y un repositorio de 0,8 GB.

El ajuste se hizo sobre 1.200 casos de entrenamiento (6.000 decisiones) del conjunto LocalLLaMA/typed-decisions, durante cuatro epocas en dos GPU NVIDIA T4. La evaluacion oficial sobre 400 casos retenidos (2.000 decisiones) reporta una precision de 0,769, un Brier score de 0,0694, un ECE de 0,2150 y una latencia p50 de 116,1 ms por caso.

Su relevancia actual es acotada pero concreta: es un ejemplo de modelo pequeno y especializado en decisiones estructuradas con metricas de calibracion publicadas, pensado para integrarse mediante una libreria propia (`laya`) en lugar de una interfaz de chat generativa. El modelo se distribuye con licencia Apache-2.0, lo que facilita su uso comercial, aunque su adopcion publica es nula en el momento de redactar esta ficha (0 descargas, 0 likes).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (checkpoint derivado del modelo base Laya de Convai Innovations; se distribuye con la libreria transformers y pesos en safetensors) |
| Parametros totales | 421.293.830 |
| Parametros activos | No disponible (no se declara una arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repositorio contiene pesos en safetensors; no se documentan variantes GGUF, AWQ o GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Libreria de inferencia | transformers |
| Tamano del repositorio | 0,8 GB |
| Tarea declarada | Prediccion de decisiones tipadas y puntuadas (structured decisions) |
| Metricas declaradas | accuracy, brier_score |
| Fecha de creacion (segun HuggingFace) | 2026-09-22 |
| Fecha de actualizacion (segun HuggingFace) | 2026-09-22 |
| Descargas / likes | 0 / 0 |
| Compatibilidad declarada | endpoints_compatible |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base Laya ni de este checkpoint derivado. El autor indica unicamente que se trata de un ajuste fino de un checkpoint de codigo abierto de Convai Innovations, con pesos en formato safetensors y compatible con la libreria transformers. No se especifica si el modelo base emplea un transformer denso, una arquitectura MoE, un modelo de estado recurrente o una combinacion hibrida, ni tampoco el numero de tokens de entrenamiento del modelo original.

En cuanto al proceso de ajuste, la model card documenta 1.200 casos de entrenamiento que equivalen a 6.000 decisiones, extraidos del conjunto LocalLLaMA/typed-decisions, con un total de cuatro epocas sobre dos GPU NVIDIA T4. No se menciona el uso de RLHF, DPO, decodificacion especulativa ni tecnicas de atencion lineal. Tampoco se detalla la composicion del dataset mas alla de su origen ni si se aplicaron tecnicas de regularizacion, aumento de datos o calibracion posterior al entrenamiento, lo cual es relevante dado el valor de ECE de 0,2150 reportado en la evaluacion.

## Capacidades

- Prediccion de decisiones tipadas: el modelo genera decisiones clasificadas por tipo a partir de un estado y un conjunto de preguntas, tal como se refleja en la interfaz `agent.predict(state, questions)`.
- Puntuacion con incertidumbre: la evaluacion incluye Brier score y ECE, lo que indica que el modelo devuelve puntuaciones de probabilidad o niveles de confianza asociados a cada decision.
- Prediccion ordinal por niveles: la metrica "within one level" de 0,9912 sugiere que las salidas se organizan en una escala de niveles y que el modelo casi siempre acierta dentro de un nivel de distancia respecto al valor de referencia.
- Adaptacion a flujos de trabajo especificos: se reportan resultados por flujo (trazas de agente, atencion al cliente, procesamiento de facturas e incidentes de seguridad), lo que apunta a capacidad de operar en dominios acotados y heterogeneos.
- Generacion de texto libre o conversacion: no disponible.
- Codigo y matematicas: no disponible (mas alla de su uso como componente en pipelines de decision).
- Tool calling o function calling: no disponible; no se documenta soporte explicito.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad generativa; si existe un flujo de "agent trace" en la evaluacion, pero se refiere al dominio evaluado, no a una capacidad de agencia autonoma documentada.
- Vision, audio y modalidades adicionales: no disponible.
- Capacidades multilingues: no disponible, no se declara lista de idiomas.
- Modo de razonamiento explicito (thinking mode): no disponible.

## Casos de uso

- Triage de tickets de atencion al cliente: el modelo obtuvo 0,776 de precision en el flujo de customer service, por lo que puede clasificar y priorizar incidencias entrantes asignando un tipo y un nivel de severidad, con una latencia p50 de 116,1 ms por caso que permite procesamiento en linea.
- Procesamiento automatizado de facturas: con 0,806 de precision en el flujo de invoice processing, es adecuado para decidir la accion a tomar sobre cada documento (aprobar, escalar, rechazar o solicitar informacion) dentro de un pipeline de cuentas a por pagar.
- Triaje de incidentes de seguridad: el flujo de security incidents alcanzo 0,748 de precision, lo que permite usar el modelo como primera capa de clasificacion de alertas antes de la intervencion humana, reduciendo el volumen de eventos que llegan a los analistas.
- Evaluacion de trazas de agente: con 0,746 de precision en agent trace, puede emplearse para auditar decisiones tomadas por agentes automaticos y detectar desviaciones respecto a la politica esperada.
- Enrutamiento de solicitudes en sistemas internos: dado que el modelo trabaja sobre pares (estado, preguntas) y devuelve decisiones tipadas, encaja en motores de workflow que necesitan decidir la siguiente accion sin generar texto libre.
- Monitorizacion con umbrales de confianza: gracias a las metricas de calibracion publicadas (Brier, ECE y error absoluto medio de la puntuacion), es posible definir umbrales para derivar casos dudosos a revision humana.
- Experimentacion academica en calibracion: el checkpoint y su informe de evaluacion (`laya_benchmark_report.json`) sirven como punto de partida reproducible para estudiar calibracion en modelos pequenos de decision estructurada.
- Prototipado en hardware modesto: con 421 millones de parametros, el modelo puede desplegarse en una unica GPU de gama media o incluso en CPU para pruebas, lo que facilita pilotos internos sin infraestructura dedicada.

## Benchmarks y rendimiento

Los unicos datos disponibles son los de la evaluacion oficial retenida publicada por el autor: 400 casos y 2.000 decisiones.

| Metrica | Resultado |
|---|---:|
| Accuracy | 0,769 |
| Soft accuracy | 0,5068 |
| Brier score | 0,0694 |
| ECE | 0,2150 |
| Score MAE | 0,2442 |
| Within one level | 0,9912 |
| Latencia p50 | 116,1 ms/caso |
| Latencia p95 | 153,8 ms/caso |

| Flujo de trabajo | Accuracy |
|---|---:|
| Agent trace | 0,746 |
| Customer service | 0,776 |
| Invoice processing | 0,806 |
| Security incidents | 0,748 |

| Comparativa de referencia | Accuracy |
|---|---:|
| laya-typed-decisions | 0,769 |
| Baseline TypeSafe Jev 1.13.0 | 0,727 |
| Autoacuerdo del modelo profesor (teacher self-agreement) | 0,735 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La diferencia frente al baseline TypeSafe Jev 1.13.0 es de 0,042 puntos de accuracy, y de 0,034 frente al autoacuerdo del profesor.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 421.293.830 parametros, sin incluir el overhead del runtime ni la memoria de activaciones):
  - fp32: aproximadamente 1,7 GB
  - fp16 o bf16: aproximadamente 0,85 GB
  - int8: aproximadamente 0,42 GB
  - 4 bits: aproximadamente 0,25 GB
- GPU recomendadas: el entrenamiento se realizo en dos NVIDIA T4, por lo que la inferencia es viable en GPUs de gama media e incluso en T4, RTX 3060, RTX 4060 o superiores. No se han documentado pruebas en A100 o H100, aunque el modelo cabe sobradamente en cualquiera de ellas.
- Compatibilidad con GPU de consumo: si, cabe en practicamente cualquier GPU consumer con 4 GB o mas de VRAM, y tambien en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: transformers es la libreria declarada. La etiqueta endpoints_compatible sugiere despliegue en HuggingFace Inference Endpoints. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y no se ofrecen pesos GGUF, por lo que esas rutas no estan confirmadas.
- Latencia: p50 de 116,1 ms por caso y p95 de 153,8 ms por caso, medidas en la evaluacion oficial. No se especifica el hardware empleado en esas mediciones ni el throughput en tokens por segundo o casos por segundo.
- La interfaz de uso documentada es la libreria `laya`: `agent = laya.Agent("Ankit1106/laya-typed-decisions")` seguido de `agent.predict(state, questions)`.

## Comparativa con modelos similares

No se dispone de informacion suficiente sobre alternativas de la misma categoria. La model card unicamente menciona el modelo base y un baseline de comparacion.

| Modelo | Parametros | Contexto | Accuracy (decisiones tipadas) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ankit1106/laya-typed-decisions | 421.293.830 | No disponible | 0,769 | Apache-2.0 | HuggingFace, 0 descargas |
| convaiinnovations/laya (modelo base) | No disponible | No disponible | No disponible | No disponible en la informacion proporcionada | HuggingFace |
| Baseline TypeSafe Jev 1.13.0 | No disponible | No disponible | 0,727 | No disponible | No disponible |

Las alternativas equivalentes de otros desarrolladores no se han identificado en la informacion disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no se documenta ninguna evaluacion de sesgo, equidad o comportamiento diferencial por subgrupo de datos.
- Riesgo de alucinacion: no evaluado explicitamente. Al tratarse de un modelo de decision estructurada, el riesgo principal no es la invencion de hechos sino la asignacion de tipos o niveles incorrectos con alta confianza.
- Calibracion deficiente: el ECE de 0,2150 es elevado en relacion con la precision obtenida, lo que indica que las probabilidades declaradas no reflejan bien la frecuencia real de acierto. No conviene usar las puntuaciones como probabilidades fiables sin recalibracion.
- Soft accuracy baja: 0,5068 frente a una accuracy dura de 0,769 sugiere que, cuando el modelo falla, lo hace con margen y no solo por un error de redondeo en el nivel adyacente.
- Ambito de dominio limitado: el ajuste se hizo con 1.200 casos (6.000 decisiones), un volumen reducido, y la evaluacion se realizo sobre 400 casos del mismo origen. El rendimiento fuera de esos cuatro flujos de trabajo es desconocido.
- Contexto e idiomas: no se documenta la longitud de contexto soportada ni los idiomas cubiertos, por lo que no puede asumirse un comportamiento multilingue.
- Adopcion nula y escasa validacion externa: 0 descargas y 0 likes en HuggingFace, con una unica evaluacion publicada por el propio autor y sin replicas independientes.
- Ausencia de benchmarks estandar: no hay resultados en MMLU, HumanEval, GSM8K u otras suites, lo que impide comparar con el ecosistema generalista.
- Restricciones de licencia: Apache-2.0 permite uso comercial y modificacion, pero el autor declara explicitamente que se trata de un checkpoint derivado y no reclama la propiedad de Laya. Conviene verificar la licencia del modelo base y del dataset LocalLLaMA/typed-decisions antes de un despliegue comercial.
- Dependencia de una libreria concreta: el uso documentado requiere el paquete `laya`, cuyo mantenimiento y compatibilidad no estan garantizados por la informacion disponible.
- Fechas de publicacion inusuales: las marcas de creacion y actualizacion (2026-09-22) no coinciden con el resto de la informacion temporal disponible, lo que conviene verificar en el repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Ankit1106/laya-typed-decisions
- Modelo base: https://huggingface.co/convaiinnovations/laya
- Codigo fuente de Laya: https://github.com/NandhaKishorM/laya
- Dataset de ajuste (referenciado en la model card): LocalLLaMA/typed-decisions
- Informe de metricas mencionado en la model card: `laya_benchmark_report.json` (incluido en el repositorio del modelo)
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo: los enlaces recuperados corresponden a foros no relacionados con inteligencia artificial y no se incluyen por no aportar informacion verificable.
