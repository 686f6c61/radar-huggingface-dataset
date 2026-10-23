# podolinsky/groot-libero-x-probe-lstm-onset-pre-mode-clip-skill-toggle-appliance-on

## Resumen

`groot-libero-x-probe-lstm-onset-pre-mode-clip-skill-toggle-appliance-on` es una sonda (probe) de deteccion de fallos para una politica de tipo vision-language-action (VLA), en concreto GR00T evaluada sobre el benchmark de manipulacion robotica LIBERO-X. No es un modelo generativo ni un modelo de lenguaje: es un detector binario por paso que consume las caracteristicas pooled del backbone de la politica (vector de 6144 dimensiones) y emite una puntuacion de fallo, junto con una cabeza de modo de fallo (10 clases) y una cabeza semantica. Lo desarrolla el autor independiente `podolinsky` dentro del proyecto vla-probe.

El modelo resuelve un problema acotado pero critico en robotica: saber si un rollout de la politica va a fracasar antes de que el fallo ocurra, de modo que un sistema de nivel superior pueda abortar, replanificar o pedir intervencion humana. La variante concreta usa etiquetado `onset_pre`: cada paso se marca como positivo desde el inicio del episodio hasta el instante de fallo, y el rollout se trunca en ese instante. El split publicado corresponde a la habilidad `skill_toggle_appliance_on` (encender un electrodomestico), elegida al azar con semilla 0 entre 8 splits de habilidad.

Su relevancia es metodologica: con solo 6,62 millones de parametros demuestra que una LSTM pequena sobre caracteristicas congeladas de un VLA puede separar episodios exitosos de fallidos con una calidad notable en habilidades vistas, aunque con una caida importante en la habilidad no vista (47,16 frente a 69,25 en la metrica principal). Es un artefacto de investigacion reproducible, acompanado de codigo, configuracion exacta y el conjunto de calibracion serializado en el propio `safetensors`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LSTM (variante `lstm_modes_clip` del codigo vla-probe) sobre caracteristicas pooled de 6144 dimensiones de un backbone VLA GR00T congelado; cabezas de puntuacion de fallo por paso, modo de fallo (10 modos) y semantica |
| Parametros totales | 6.622.240 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (la sonda opera sobre una secuencia de caracteristicas por paso de un episodio; no hay ventana de contexto textual documentada) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en `safetensors`; no se documentan variantes GGUF, AWQ, GPTQ ni INT8) |
| Idiomas soportados | no disponible (el modelo no procesa lenguaje natural de forma directa) |
| Licencia | CC BY 4.0 |
| Formato de pesos | `safetensors` (PyTorch); incluye `feature_mean`, `feature_std` y `calibration_maxima` en el mismo fichero |

## Arquitectura y entrenamiento

La arquitectura es una LSTM recurrente que recibe, en cada paso, el vector de caracteristicas pooled del backbone VLA estandarizado con `feature_mean` y `feature_std` (ambos serializados en el checkpoint). Sobre el estado recurrente se montan tres salidas: una puntuacion escalar de fallo por paso, una cabeza de clasificacion de modo de fallo con 10 clases y una cabeza semantica. El fichero `config.json` del repositorio contiene la configuracion exacta (dimensiones, capas, funciones de activacion y forma de lectura de la alarma), y el codigo de referencia esta en el repositorio `mpodolinsky/vla-probe`.

El entrenamiento se realiza sobre las caracteristicas preextraidas del split de entrenamiento del dataset `podolinsky/gr00t-libero-x-features-v3`; los episodios de la habilidad retenida de ese split constituyen el conjunto "unseen". El etiquetado es `onset_pre`: positivo en todos los pasos desde el comienzo del episodio hasta el inicio del fallo, con el rollout cortado en ese punto. No se documentan en la informacion disponible el numero de tokens, la composicion del dataset, ni el uso de RLHF o DPO (procedimientos, por otra parte, no aplicables a una sonda discriminativa de este tipo).

La innovacion practica esta en el mecanismo de calibracion conforme: el checkpoint incluye `calibration_maxima`, los 85 maximos de puntuacion de episodios exitosos de calibracion ordenados. La alarma a nivel alpha se obtiene con `k = ceil((n + 1) * (1 - alpha))` y umbral `sorted(maxima)[k - 1]`, disparando en el primer paso cuya puntuacion lo supere. Esto permite fijar la tasa de falsos positivos a priori sin reentrenar.

## Capacidades

- Deteccion de fallo por paso en rollouts de una politica VLA: emite una puntuacion escalar creciente hacia el fallo.
- Clasificacion del tipo de fallo entre 10 modos predefinidos mediante la cabeza de modos.
- Prediccion semantica auxiliar a partir de la cabeza semantica.
- Calibracion de la tasa de falsos positivos en inferencia (hasta el 40 % de FPR en la metrica reportada) mediante umbrales conformes precalculados.
- Funcionamiento sobre caracteristicas congeladas: no requiere ajuste fino del backbone VLA.
- Inferencia puramente secuencial en CPU o GPU de gama baja por su tamano reducido.
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision directa, tool calling, agentes ni capacidades multilingues: la informacion disponible no documenta ninguna de ellas.

## Casos de uso

- Monitorizacion en linea de politicas de manipulacion: la sonda se ejecuta en cada paso del episodio y, si la puntuacion supera el umbral calibrado, el sistema aborta la ejecucion antes de que el objeto caiga o el electrodomestico quede en un estado invalido.
- Intervencion humana selectiva en flotas de robots: al disparar la alarma solo en los episodios con riesgo, el operador puede atender un subconjunto pequeno de rollouts, reduciendo el coste de supervision continua.
- Recoleccion activa de datos: los episodios con puntuacion alta se marcan automaticamente para revision y se anaden al conjunto de entrenamiento con la etiqueta de modo de fallo asignada por la cabeza correspondiente, cerrando el ciclo de mejora.
- Enrutado a politicas de recuperacion: la cabeza de modo de fallo permite elegir una estrategia distinta (reintentar el agarre, reposicionar el brazo, reiniciar la tarea) en funcion del tipo de fallo predicho, en lugar de una parada generica.
- Control de calidad en evaluacion de benchmarks: durante la evaluacion de un nuevo checkpoint de GR00T sobre LIBERO-X, la sonda actua como filtro para distinguir fallos de politica de fallos de entorno o de datos, clasificando los rollouts con la cabeza de 10 modos.
- Experimentacion academica en deteccion temprana de fallos: el paquete completo (pesos, calibracion conforme, configuracion y codigo) permite reproducir el protocolo `onset_pre` y compararlo con etiquetados alternativos como `onset_traj` sobre el mismo split.
- Despliegue como guardarraíl de bajo coste: con 6,62 millones de parametros, el detector puede convivir en el mismo host que el VLA sin competir por memoria de GPU con el modelo principal.

## Benchmarks y rendimiento

La metrica reportada es el area bajo la curva de TPR temprana frente a FPR hasta el 40 %, en porcentaje, con alarmas conformes maximas.

| Conjunto | Resultado (%) |
|---|---|
| Validacion | 73,96 |
| Habilidad vista (seen) | 69,25 |
| Habilidad no vista (unseen) | 47,16 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, y no procede aplicarlos a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: minimos. Con 6,62 millones de parametros, los pesos en fp32 ocupan aproximadamente 26,5 MB y en fp16 unos 13 MB, a los que se suman los vectores de estandarizacion (6144 dimensiones) y los 85 valores de calibracion.
- El coste real de hardware lo determina el backbone VLA GR00T que genera las caracteristicas de 6144 dimensiones; su requisito de memoria no se documenta en la informacion disponible.
- GPU recomendadas: cualquiera con suficiente memoria para el backbone; para la sonda basta CPU. No se documentan GPU de referencia (A100, H100, RTX 4090) en la model card.
- Cabe holgadamente en GPU de consumo (RTX 3060, RTX 4060, RTX 4090) y en CPU; el cuello de botella es el VLA, no la sonda.
- Opciones de despliegue: carga directa con `safetensors.torch.load_file` y PyTorch, tal como muestra la model card. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no son aplicables a este tipo de modelo); tampoco se documenta una exportacion a ONNX.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Metrica en el split | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`onset_pre`) | 6.622.240 | no aplicable | Validacion 73,96 / seen 69,25 / unseen 47,16 | CC BY 4.0 | HuggingFace, repo publico |
| `groot-libero-x-probe-lstm-onset-traj-mode-clip-skill-toggle-appliance-on` (mismo autor, mismo split, etiquetado `onset_traj`) | no disponible | no aplicable | no disponible | CC BY 4.0 | HuggingFace |
| Otras sondas de deteccion de fallo para VLA | no disponible | no disponible | no disponible | no disponible | no disponible en la informacion consultada |

No se han identificado en la informacion disponible alternativas publicas comparables de deteccion de fallo sobre caracteristicas de GR00T/LIBERO-X con cifras equiparables.

## Limitaciones y advertencias

- Alcance muy restringido: el artefacto esta entrenado para un unico split de habilidad (`skill_toggle_appliance_on`) y sobre las caracteristicas de un backbone VLA concreto (GR00T sobre LIBERO-X). No es transferible directamente a otros robots, otras tareas ni otras politicas.
- Caida acusada en generalizacion: la metrica baja de 69,25 en habilidades vistas a 47,16 en la habilidad no vista, lo que indica una sensibilidad considerable al cambio de tarea.
- Calibracion limitada: los umbrales conformes se calculan sobre 85 episodios exitosos, un tamano de muestra pequeno que produce umbrales con alta varianza y hace que el nivel alpha efectivo pueda desviarse del nominal.
- No es un modelo de lenguaje: no procesa texto, no responde a instrucciones, no soporta tool calling ni agentes, y no tiene capacidades multilingues. Aplicarle ese tipo de evaluaciones carece de sentido.
- Riesgo de falsos negativos: al disparar en el primer paso que supera el umbral, un fallo de evolution rapida puede no detectarse antes del onset; la etiqueta `onset_pre` optimiza la deteccion temprana, no la localizacion exacta.
- Dependencia total de la calidad de las caracteristicas del backbone: si el VLA cambia de version, de capa de pooling o de normalizacion, `feature_mean` y `feature_std` dejan de ser validos y las puntuaciones se vuelven incomparables.
- Sesgos: no documentados por el autor; el dataset subyacente hereda los sesgos de distribucion de LIBERO-X (escenas simuladas, objetos y disposiciones limitadas), sin que se reporte analisis de sesgo alguno.
- Uso comercial: la licencia CC BY 4.0 permite uso comercial con atribucion; no se anaden restricciones adicionales ni clausulas de uso responsable en la informacion disponible.
- Ausencia de validacion externa: 0 descargas y 1 like en el momento de la consulta, sin replicaciones independientes conocidas.
- Advertencia sobre la busqueda web: los resultados devueltos por la busqueda no guardan relacion con el modelo y se han descartado por completo; no se ha incorporado ninguno de ellos a esta ficha.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/podolinsky/groot-libero-x-probe-lstm-onset-pre-mode-clip-skill-toggle-appliance-on
- Variante con etiquetado `onset_traj` del mismo split: https://huggingface.co/podolinsky/groot-libero-x-probe-lstm-onset-traj-mode-clip-skill-toggle-appliance-on
- Dataset de caracteristicas LIBERO-X: https://huggingface.co/datasets/podolinsky/gr00t-libero-x-features-v3
- Codigo del proyecto vla-probe: https://github.com/mpodolinsky/vla-probe
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada (la busqueda web no devolvio resultados relevantes).
