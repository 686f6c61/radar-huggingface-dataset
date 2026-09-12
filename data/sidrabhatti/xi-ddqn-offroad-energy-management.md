# SidraBhatti/xi-ddqn-offroad-energy-management

## Resumen

XI-DDQN es un controlador de gestión de energía basado en aprendizaje por refuerzo para vehículos todoterreno híbridos en serie de alta potencia (>350 kW). Lo desarrollan el Center for Automotive Research de la Universidad Estatal de Ohio (OSU, Mobility Systems Lab) junto con coautores de Cummins Inc., y se publica en la revista *Energy* (Elsevier, 2026). El problema que aborda es la optimización del consumo de combustible en ciclos de trabajo reales, inciertos y muy variables, un escenario con mucha menos atención investigadora que los híbridos de carretera o las plataformas todoterreno de menor potencia.

Técnicamente no es un modelo de lenguaje, sino un agente de refuerzo: una Double Deep Q-Network (DDQN) con tres cabezas Q independientes (`Q_fuel`, `Q_soc`, `Q_battery`) que comparten un tronco de características de tres capas `Linear→ReLU` con cuello de botella de 128 dimensiones. El estado es un vector de dos componentes (estado de carga de la batería, SOC, y demanda de potencia normalizada) y la acción se discretiza en 2000 consignas de potencia de batería de ±200 kW.

Su relevancia está en dos frentes: por un lado, el rendimiento declarado (en torno a un 23 % menos de consumo frente a una cadena de tracción convencional y un 11,7 % frente a una estrategia basada en reglas); por otro, su componente de explicabilidad, que destila la política aprendida en un árbol de decisión legible con métricas de fidelidad, algo poco habitual y relevante para certificación y confianza en un sistema de control embarcado de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Double Deep Q-Network (DDQN) con red de tres cabezas Q y tronco compartido `Linear→ReLU` x3 (cuello de botella de 128 dimensiones) |
| Parametros totales | No disponible (no se publica el recuento de parametros ni los pesos entrenados) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje). Estado de 2 dimensiones: SOC en [0,15; 0,85] y demanda de potencia normalizada |
| Tipos de cuantizacion | No disponible (no se distribuyen pesos ni versiones cuantizadas) |
| Idiomas soportados | No aplica (no hay procesamiento de lenguaje natural) |
| Licencia | `other` (la model card no especifica terminos concretos) |
| Formato de pesos | No disponible. El repositorio de HuggingFace ocupa 0,0 GB y no contiene ficheros de pesos, solo README e imagenes |
| Espacio de acciones | 2000 consignas discretizadas de potencia de bateria en el rango ±200 kW |
| Aplicacion | Gestion de energia en cadenas de traccion hibridas en serie de mas de 350 kW, uso todoterreno |

## Arquitectura y entrenamiento

El agente observa un estado bidimensional formado por el SOC de la batería (acotado entre 0,15 y 0,85) y la demanda de potencia normalizada. Selecciona una consigna de potencia de batería entre 2000 valores discretos que cubren ±200 kW; la potencia del generador se obtiene por balance de potencia residual y el consumo de combustible se calcula con un mapa real motor-generador. La red tiene un tronco compartido que se ramifica en tres cabezas Q, cada una entrenada con su propio componente de recompensa mediante una pérdida MSE de suma ponderada. La selección de acción combina las tres cabezas según `Q_total = Q_fuel + λ_soc·Q_soc + λ_battery·Q_battery`, de forma que el controlador razona conjuntamente sobre economía de combustible, regulación de SOC y satisfacción de restricciones de potencia de batería, en lugar de optimizar un único objetivo escalarizado.

El modelado de recompensa incorpora una penalización por consumo de combustible (peso 10), una penalización cuadrática por desviación del SOC respecto a un objetivo de 0,55 con un pequeño bono dentro de banda (peso 5,0) y una penalización por violación de restricciones de potencia de batería (peso 0,001). El entrenamiento usa Double DQN estándar (la red online selecciona la acción y la red objetivo la evalúa; γ = 0,95, sincronización de la red objetivo cada 20 episodios), exploración ε-greedy (de 0,5 a 0,01, decaimiento 0,9995 por episodio), optimizador Adam con tasa de aprendizaje 1e-4, búfer de repetición de 200 000 transiciones y tamaño de lote 64. Se emplea un currículo multifase que entrena secuencialmente en distintos rangos de operación de SOC, reiniciando la exploración en cada fase.

La innovación diferencial es la explicabilidad: la política ya entrenada (caja negra) se destila en un árbol de decisión superficial que predice la misma acción de control a partir de las mismas dos entradas de estado. El artículo reporta métricas de fidelidad (MAE, RMSE, R²) que cuantifican cuánto reproduce el árbol las decisiones de la DDQN, importancia de características (qué variable de estado pesa más en la política) y reglas legibles con nodos de decisión de carga/descarga codificados por color. El entrenamiento requiere datos experimentales de ciclos de trabajo y mapas motor-generador (ficheros MAT) que no se han publicado.

## Capacidades

- Control de reparto de potencia en tiempo de ejecución entre motor-generador y batería en una cadena de tracción híbrida en serie de más de 350 kW.
- Optimización de consumo de combustible con regulación simultánea del SOC alrededor de un valor objetivo de 0,55.
- Satisfacción explícita de restricciones de potencia de batería, codificadas en el modelado de recompensa.
- Generalización a condiciones de operación inciertas o no vistas durante el entrenamiento, según los resultados declarados por los autores.
- Comportamiento de control próximo al óptimo de programación dinámica según el artículo.
- Explicabilidad post hoc: destilación de la política en un árbol de decisión legible con métricas de fidelidad (MAE, RMSE, R²) e importancia de características.
- Generación de reglas de control auditables y visualizaciones de nodos de decisión de carga/descarga para ingeniería de powertrain.
- No soporta tool calling ni function calling.
- No soporta agentes conversacionales, razonamiento multi-paso en lenguaje natural ni generación de texto.
- No tiene capacidades multilingües ni procesamiento de visión, audio o texto.
- No dispone de modo de razonamiento explícito (thinking mode) ni de cualquier otra capacidad propia de un modelo de lenguaje.

## Casos de uso

- Gestión de energía embarcada en maquinaria agrícola de gran potencia: el controlador decide en cada instante cuánta potencia toma de la batería y cuánta del generador, con el objetivo de minimizar el consumo de combustible en ciclos de trabajo agrícolas reales, donde la demanda varía de forma abrupta.
- Equipos de minería y canteras: vehículos todoterreno con alta demanda de potencia que operan en condiciones cambiantes de carga y pendiente; la política aprende a repartir la energía sin agotar la batería ni violar sus límites de potencia.
- Maquinaria de construcción (excavadoras, cargadoras, bulldozers): ciclos repetitivos de alta carga y recuperación, donde el bono dentro de banda de SOC ayuda a mantener reserva de energía para picos de demanda.
- Auditoría y certificación de estrategias de control: el árbol de decisión destilado permite a un ingeniero de powertrain inspeccionar las reglas de carga/descarga y llevar el controlador a un proceso de revisión sin tratarlo como una caja negra.
- Calibración y comparación de estrategias de gestión de energía: uso del agente como referencia de rendimiento durante el desarrollo, comparando el consumo obtenido frente a estrategias basadas en reglas o a controles convencionales, con las cifras reportadas del 11,7 % y el 23 % de reducción.
- Simulación y validación en bucle (SIL/HIL): integración de la política entrenada en un gemelo digital del tren de potencia para evaluar el comportamiento antes de desplegarlo en el vehículo real, dado que la red es de tamaño reducido y el coste de inferencia es bajo.
- Formación y transferencia de conocimiento técnico: uso del árbol de decisión como material didáctico para explicar cómo interactúan el SOC y la demanda de potencia en la política óptima.
- Investigación en aprendizaje por refuerzo aplicado a automoción: la arquitectura de tres cabezas y el modelado de recompensa ponderada sirven como punto de partida reproducible metodológicamente para otros dominios de gestión de energía.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para métricas estándar de modelos de lenguaje (MMLU, HumanEval, GSM8K u otras), ya que no se trata de un modelo de lenguaje. Los únicos resultados cuantitativos disponibles son los de evaluación de control declarados en la model card:

| Metrica | Resultado declarado | Referencia de comparacion |
|---|---|---|
| Reduccion de consumo de combustible | ~23 % | Cadena de traccion convencional (no hibrida) |
| Reduccion media de consumo | ~11,7 % | Estrategia de control basada en reglas |
| Calidad de control | Comportamiento proximo al optimo de programacion dinamica | Programacion dinamica (referencia offline) |
| Fidelidad del arbol destilado | Alta (MAE, RMSE y R² reportados en el articulo, sin valores en la model card) | Decisiones de la propia DDQN |
| Evaluacion en escenarios no vistos | Generalizacion a ciclos de trabajo reales no vistos | Conjunto de evaluacion del articulo |

No se especifican en la información disponible los valores numéricos concretos de MAE, RMSE ni R², ni el detalle del conjunto de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. No se publican pesos ni requisitos. La arquitectura descrita (entrada de 2 dimensiones, tronco con cuello de botella de 128 dimensiones y tres cabezas Q) implica una red de tamaño muy reducido, del orden de decenas de miles de parámetros; una red de esa escala ocupa menos de 1 MB en FP32, pero este cálculo es una estimación derivada de la arquitectura y no un dato publicado por los autores.
- GPU recomendadas: no disponible. Por el tamaño de la red, la inferencia no requiere GPU; un despliegue típico sería sobre CPU embarcada en la unidad de control del vehículo.
- Compatibilidad con GPU de consumo: previsiblemente irrelevante, dado que el modelo no necesita aceleración por GPU. No hay datos publicados que lo confirmen.
- Opciones de despliegue: no se documentan en la información disponible. No hay publicación de pesos en formato GGUF, safetensors ni artefactos ONNX, ni soporte declarado para vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a modelos de lenguaje y no aplicables a este controlador). El repositorio de HuggingFace no contiene ficheros de pesos (0,0 GB).
- Latencia y throughput estimados: no disponibles. No se publican mediciones de tiempo de inferencia ni de frecuencia de control alcanzable en la unidad embarcada.

## Comparativa con modelos similares

| Enfoque | Tipo | Parametros | Contexto / estado | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| XI-DDQN (este modelo) | DDQN de tres cabezas con destilacion a arbol de decision | No disponible | Estado de 2 dimensiones (SOC, demanda de potencia) | ~23 % menos consumo que traccion convencional; ~11,7 % menos que control por reglas | `other` (sin terminos concretos) | Solo descripcion; sin pesos publicados |
| Control basado en reglas | Estrategia determinista de reparto de potencia | No aplica | No aplica | Referencia de comparacion del articulo (peor que XI-DDQN en ~11,7 %) | No aplica | Estandar en la industria |
| Programacion dinamica | Optimizacion offline con conocimiento completo del ciclo | No aplica | No aplica | Referencia de optimalidad; XI-DDQN se aproxima a su comportamiento | No aplica | Requiere el ciclo completo a priori; no implementable en tiempo real |
| DDQN estandar de una sola cabeza | Deep Q-Network con objetivo escalarizado | No disponible | Mismo estado de 2 dimensiones | No se reportan resultados comparativos en la informacion disponible | No disponible | No disponible |
| Otras estrategias de gestion de energia con RL (DDPG, SAC, ECMS) | Aprendizaje por refuerzo continuo o control equivalente de consumo | No disponible | No disponible | No se reportan comparativas en la informacion disponible | No disponible | No disponible |

No se dispone de comparativas publicadas frente a arquitecturas de aprendizaje por refuerzo concretas en la información proporcionada.

## Limitaciones y advertencias

- Los datos de entrenamiento (ciclos de trabajo experimentales y mapas motor-generador en ficheros MAT) no son públicos. La reproducibilidad exige datos equivalentes o proporcionados por el patrocinador, lo que limita la validación independiente.
- No hay pesos entrenados publicados: el repositorio de HuggingFace ocupa 0,0 GB y contiene únicamente README e imágenes. No es posible desplegar ni evaluar el modelo a partir de este repositorio.
- La licencia es `other` y la model card no detalla sus términos. Existe incertidumbre legal sobre el uso comercial, la redistribución o la creación de derivados.
- El estado del agente es de solo dos dimensiones (SOC y demanda de potencia normalizada). No incorpora variables como temperatura de batería, degradación, pendiente del terreno, altitud o estado del motor, lo que puede limitar la robustez fuera de las condiciones de entrenamiento.
- La acción se discretiza en 2000 consignas de potencia de batería (±200 kW). Esta granularidad puede no ser suficiente para todos los regímenes de operación y difiere del control continuo que emplean otros enfoques.
- La generalización se ha evaluado sobre ciclos de trabajo reales no vistos, pero sigue vinculada a la familia de misiones y al vehículo de los experimentos. No hay evidencia publicada de transferencia a otras potencias, arquitecturas de powertrain o tipos de vehículo.
- El bono dentro de banda alrededor de un SOC objetivo de 0,55 y los pesos de recompensa (10, 5,0 y 0,001) introducen un sesgo explícito hacia ese punto de operación; un cambio de objetivo requiere reentrenamiento.
- Las fechas del repositorio (creación y actualización en septiembre de 2026) y la referencia bibliográfica de 2026 indican una publicación reciente; no hay historial de uso ni validación por terceros.
- No se publican valores numéricos de las métricas de fidelidad del árbol de decisión (MAE, RMSE, R²) en la model card; la afirmación de que el árbol reproduce fielmente la política no puede verificarse con los datos disponibles.
- Riesgo de alucinación: no aplica, ya que el modelo no genera texto ni contenido factual. El riesgo análogo es una discrepancia entre el árbol destilado y la red neuronal original en estados poco representados del espacio de operación.
- No debe confundirse con un modelo de lenguaje: no procesa ni genera texto, no soporta instrucciones en lenguaje natural y no ofrece tool calling, agentes ni capacidades multilingües.

## Enlaces

- HuggingFace: https://huggingface.co/SidraBhatti/xi-ddqn-offroad-energy-management
- Articulo: *Powertrain-aware explainable reinforcement learning energy management in off-road vehicles*, Energy (Elsevier), 2026: https://doi.org/10.1016/j.energy.2026.141083
- Codigo: https://github.com/OSU-CAR-MSL/Powertrain-Aware-Explainable-Reinforcement-Learning-Energy-Management-in-Off-Road-Vehicles
- Financiacion declarada: U.S. Department of Energy y Cummins Inc.
- Nota: las busquedas web realizadas no devolvieron resultados relevantes sobre este modelo; los unicos enlaces utiles son los de la model card y el repositorio de codigo.
