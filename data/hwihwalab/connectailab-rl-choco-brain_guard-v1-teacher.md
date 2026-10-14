# hwihwalab/connectailab-rl-CHOCO-BRAIN_GUARD-v1-teacher

## Resumen

connectailab-rl-CHOCO-BRAIN_GUARD-v1-teacher es una matriz de politica (policy matrix) de aprendizaje por refuerzo desarrollada por Hwihwa Lab, orientada a la toma de decisiones determinista en defensa antifraude para los sectores fintech y de comercio electronico. No se trata de un modelo de lenguaje generativo, sino de un artefacto de decision externo —descrito por el autor como "corteza prefrontal" de un sistema mayor— que se distribuye como un unico fichero JSON (`brain.json`) de 142 KB y se carga con la libreria `numpy`. Su funcion es actuar como ancla de verdad (ground-truth decision anchor) para destilar y alinear un LLM conversacional de razonamiento ([`hwihwalab/connectailab-rl-CHOCO-BRAIN_GUARD-v1`](https://huggingface.co/hwihwalab/connectailab-rl-CHOCO-BRAIN_GUARD-v1)), construido a su vez sobre un `Qwen3.5-0.8B` con LoRA.

El modelo se calibro mediante aprendizaje por refuerzo multiobjetivo con PPO dentro del simulador empresarial [CONNECT TYCOON](https://github.com/wonseokjung/connect-tycoon), con una funcion de recompensa que penaliza agresivamente el riesgo: `Reward = 0.8·(Profit/10) + 1.0·(ΔSatisfaction × 100) − 3.0·(Incidents × 5)`, con pesos de 0.8 (beneficio), 1.0 (satisfaccion) y 3.0 (penalizacion por riesgo). Sus protocolos de gobierno incluyen el bloqueo inmediato de transacciones con probabilidad de fraude ≥ 0.70, el aislamiento de reclamaciones de reembolso de alto riesgo (≥ 0.60) y un centinela de inventario que declara reducir los dias de rotura de stock de 10,7 a 0,3 dias.

Es relevante por su enfoque de "policy matrix" de bajisimo peso (142 KB) que promete decisiones deterministas en menos de 0,01 segundos, ejecutables on-device y sin los costes de latencia ni el riesgo de alucinacion asociados a los LLM generativos en tareas de control de riesgo financiero. No obstante, el modelo es muy reciente, acumula 0 descargas y 0 likes, y sus resultados proceden unicamente de benchmarks autoinformados en simulacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Matriz de politica (policy matrix) calibrada con PPO; no es un transformer. El autor la describe como "corteza prefrontal" del sistema |
| Parametros totales | No disponible (es un fichero `brain.json` de 142 KB; no se declaran parametros) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible / no aplica para una matriz de politica determinista |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | Ingles (en) y coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | JSON (`brain.json`), cargado con `numpy` |

## Arquitectura y entrenamiento

La arquitectura no es un transformer ni un modelo neuronal generativo, sino una matriz de politica (policy matrix) serializada en un fichero JSON de 142 KB. Se calibro mediante aprendizaje por refuerzo multiobjetivo con el algoritmo PPO (Proximal Policy Optimization) dentro del simulador empresarial CONNECT TYCOON, un entorno estocastico de operaciones de negocio. La funcion de recompensa empleada esta sesgada hacia la proteccion de capital y la integridad operativa, con un peso de penalizacion por incidentes de 3.0 frente a 0.8 para el beneficio y 1.0 para la satisfaccion, lo que configura el comportamiento descrito como "aggressive risk-governance objective".

Respecto a los datos de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF o DPO), no se proporciona informacion en el material disponible. El autor indica un entrenamiento de 40 meses simulados (800 dias laborables) bajo condiciones de mercado estocasticas para la evaluacion, y senala que la matriz actua como ancla de decision para destilar un LLM conversacional basado en Qwen3.5-0.8B con LoRA. La informacion disponible se interrumpe antes de detallar el resto de secciones tecnicas del modelo.

## Capacidades

- Toma de decisiones determinista y de latencia ultrabaja: el autor declara ejecucion en menos de 0,01 segundos (sub-milisegundo).
- Puerta de seguridad agresiva en fraude: finaliza transacciones cuya probabilidad de fraude sea ≥ 0.70.
- Enrutado proactivo de revisiones de reembolso: aisla las reclamaciones de alto riesgo (≥ 0.60) para verificacion dedicada.
- Centinela de inventario y rotura de stock: aplica margenes de seguridad dinamicos que, segun el autor, reducen los dias de rotura de 10,7 a 0,3.
- Optimizacion multiobjetivo: equilibra beneficio, satisfaccion del cliente y penalizacion por incidentes segun la funcion de recompensa declarada.
- Funcion como ancla de verdad para destilacion: genera trayectorias de decision optimas que alinean el LLM conversacional asociado.
- Ejecucion on-device: por su tamano (142 KB) y su dependencia unicamente de `numpy`, no requiere aceleracion por GPU.
- Idiomas declarados: ingles y coreano (relevante para el LLM que destila, no para la matriz de decision).

## Casos de uso

- Control antifraude en pagos en tiempo real: la matriz clasifica transacciones y bloquea aquellas con probabilidad de fraude ≥ 0.70 en menos de 0,01 segundos, lo que la hace apta para pasarelas de pago donde la latencia por encima del segundo es inaceptable.
- Enrutado de reclamaciones de reembolso en comercio electronico: las solicitudes con score de riesgo ≥ 0.60 se derivan a un flujo de verificacion dedicado, reduciendo la carga del equipo de atencion al cliente.
- Gestion automatizada de inventario: el centinela de stockout ajusta margenes de seguridad dinamicos para evitar roturas, con una reduccion declarada de 10,7 a 0,3 dias de rotura al mes.
- Despliegue on-device en terminales punto de venta o dispositivos embebidos: al pesar 142 KB y ejecutarse con `numpy`, puede embarcarse en hardware sin GPU ni conexion a la nube, algo util para comercios con conectividad limitada.
- Ancla de destilacion para entrenar asistentes conversacionales: las trayectorias de decision optimas sirven para alinear el LLM `connectailab-rl-CHOCO-BRAIN_GUARD-v1` (Qwen3.5-0.8B + LoRA), de modo que este reproduce decisiones coherentes con la politica PPO.
- Simulacion de politicas de riesgo para operadores fintech: el modelo permite evaluar el impacto de distintos pesos de recompensa (beneficio, satisfaccion, riesgo) sobre metricas operativas antes de desplegar una politica de produccion.
- Automatizacion para pequenos operadores (solopreneurs): el autor orienta el modelo a la toma de decisiones de negocio automatizada sin infraestructura de inferencia costosa.

## Benchmarks y rendimiento

Los unicos datos disponibles son los autoinformados por el autor a partir de una simulacion de 40 meses (800 dias laborables) bajo condiciones estocasticas. No hay resultados en benchmarks estandar (MMLU, HumanEval, GSM8K), ya que no es un modelo de lenguaje.

| Metrica (media a 40 meses) | Baseline basado en reglas | CHOCO-BRAIN_GUARD-v1-teacher | Ventaja neta |
|---|---|---|---|
| Beneficio neto mensual | 3,24 M KRW / mes | 11,11 M KRW / mes | +243 % |
| Satisfaccion del cliente | 79 % | 96 % | +17 puntos porcentuales |
| Incidentes criticos de riesgo | 7,8 casos / mes | 2,0 casos / mes | −74 % |
| Dias de rotura de stock | 10,7 dias / mes | 0,3 dias / mes | −97 % |
| Incidentes de sobrecarga de personal | 37,8 casos / mes | 12,2 casos / mes | −68 % |

Estos valores proceden exclusivamente de la model card del autor y no se han verificado de forma independiente.

## Requisitos de hardware

- VRAM para inferencia: practicamente nula. El artefacto es un fichero JSON de 142 KB cargado con `numpy`; no requiere GPU.
- GPU recomendadas: no aplica. La ejecucion es posible en CPU.
- Compatibilidad con GPU de consumo: no aplica; cabe en cualquier dispositivo con interprete de Python y `numpy`, incluido hardware embebido o movil.
- Opciones de despliegue: carga directa del `brain.json` mediante `numpy` (libreria declarada). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, dado que no es un modelo de lenguaje con pesos neuronales.
- Latencia y throughput estimados: el autor declara decisiones deterministas en menos de 0,01 segundos. No se especifica throughput maximo ni consumo de recursos mas alla de la propia matriz.

## Comparativa con modelos similares

No se dispone de modelos externos directamente comparables: se trata de una matriz de politica especifica de un simulador propietario (CONNECT TYCOON) y no de un LLM. La comparacion mas relevante es con los otros componentes del propio sistema.

| Modelo | Tipo | Tamano | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-CHOCO-BRAIN_GUARD-v1-teacher | Matriz de politica (PPO) | 142 KB (JSON) | RL multiobjetivo en simulador | Apache 2.0 | HuggingFace |
| connectailab-rl-CHOCO-BRAIN_GUARD-v1 (student) | LLM de razonamiento conversacional (Qwen3.5-0.8B + LoRA) | No disponible | Destilado desde el teacher | No disponible en la informacion | HuggingFace |
| Baseline basado en reglas | Sistema experto de reglas fijas | No aplica | Reglas manuales | No aplica | Referencia interna del benchmark |

No se han identificado en la busqueda web modelos comparables de terceros; los resultados de busqueda obtenidos no guardan relacion con el modelo.

## Limitaciones y advertencias

- Resultados no verificados: todas las metricas (beneficio, satisfaccion, incidencias, stockout) proceden de la simulacion propietaria del autor y no de validacion independiente ni de datos de produccion.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso en produccion por terceros.
- Dependencia del simulador: la politica se ha calibrado en CONNECT TYCOON; su transferencia a entornos reales con distribuciones de fraude distintas no esta demostrada.
- Sesgo de contexto: la simulacion opera en wones coreanos (KRW) y en un mercado concreto, por lo que los umbrales economicos y de inventario pueden no trasladarse directamente a otros mercados.
- Ambito funcional estrecho: es una matriz de decision, no un modelo de lenguaje; no genera texto ni mantiene conversaciones. Las capacidades conversacionales residen en el LLM asociado.
- Riesgo de alucinacion: no aplica a la matriz determinista, pero si al LLM destilado que la usa como ancla, que puede desviarse de las trayectorias optimas.
- Idiomas: solo se declaran ingles y coreano; no hay soporte documentado para castellano.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero no se ofrecen garantias ni soporte por parte del autor.
- Documentacion incompleta: la model card consultada se interrumpe antes de las secciones finales, por lo que podrian faltar detalles de despliegue y caracteristicas adicionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hwihwalab/connectailab-rl-CHOCO-BRAIN_GUARD-v1-teacher
- Manual en coreano (README_KR.md): https://huggingface.co/hwihwalab/connectailab-rl-CHOCO-BRAIN_GUARD-v1-teacher/blob/main/README_KR.md
- Licencia: https://huggingface.co/hwihwalab/connectailab-rl-CHOCO-BRAIN_GUARD-v1-teacher/blob/main/LICENSE
- LLM de decision asociado (student): https://huggingface.co/hwihwalab/connectailab-rl-CHOCO-BRAIN_GUARD-v1
- Repositorio GitHub del modelo: https://github.com/Hwihwa-Lab/connectailab-rl-CHOCO-BRAIN_GUARD-v1-teacher
- Organizacion en GitHub: https://github.com/Hwihwa-Lab
- Simulador CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Perfil del autor en HuggingFace: https://huggingface.co/hwihwalab

Nota: la busqueda web realizada no devolvio ningun resultado relacionado con este modelo (los enlaces obtenidos correspondian a articulos sobre problemas de conectividad Wi-Fi en iPhone y se han descartado por no ser relevantes).
