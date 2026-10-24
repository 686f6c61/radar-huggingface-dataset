# hihikk/H2walk-main-30k

## Resumen

H2walk-main-30k no es un modelo de lenguaje ni un modelo fundacional: es un conjunto de 16 checkpoints de una política de control entrenada con PPO mediante RSL-RL sobre IsaacLab, exportados a partir de la ejecución identificada como `2026-10-22_04-45-07`. El autor es el usuario de Hugging Face `hihikk` y el repositorio ocupa 0,3 GB, con los pesos en formato PyTorch (`.pt`) y un total declarado de 270 MB. Los checkpoints van de `model_0` a `model_29999`, es decir, 30 000 iteraciones de entrenamiento muestreadas cada ~2 000 iteraciones.

Junto a los pesos se incluyen `params/env.yaml` y `params/agent.yaml`, que congelan la configuración exacta del entorno y del agente PPO usada en el lanzamiento. Cada fichero `.pt` contiene además del actor (`actor.*`, sin `actor.std`), el crítico (`critic.*`), el normalizador de observaciones (media y desviación típicas en ejecución) y el contador de iteraciones, lo que permite reanudar el entrenamiento con `--resume`. El identificador «H2walk» sugiere una política de marcha para un robot humanoide, pero la model card no lo confirma de forma explícita.

Su relevancia es de tipo reproducible: se trata de un artefacto de investigación en robótica y aprendizaje por refuerzo que documenta una ejecución completa y permite auditar la evolución de la política a lo largo del entrenamiento. El repositorio no tiene descargas ni likes, no declara licencia, idiomas ni pipeline, y no incluye métricas de evaluación, curvas de recompensa ni vídeos de despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible con detalle. Los checkpoints contienen un actor (`actor.*`) y un crítico (`critic.*`) entrenados con PPO sobre RSL-RL en IsaacLab; la topología exacta de las redes figura en `params/agent.yaml`, no reproducido en la información disponible |
| Parametros totales | No disponible. El tamaño por checkpoint (~17 MB de media) incluye actor, crítico, normalizador de observaciones y contador, por lo que no permite derivar el recuento de parámetros con fiabilidad |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | No disponible. Pesos en coma flotante de PyTorch; no se documentan variantes GGUF, AWQ, GPTQ ni INT8 |
| Idiomas soportados | No disponible (no aplica) |
| Licencia | No disponible (no declarada en la model card ni en los metadatos del repositorio) |
| Formato de pesos | `.pt` (serialización `torch.save`, requiere `map_location` al cargar); configuración en YAML (`params/env.yaml`, `params/agent.yaml`) |

## Arquitectura y entrenamiento

La información disponible describe el artefacto, no la arquitectura interna: se trata de una política actor-crítico entrenada con Proximal Policy Optimization (PPO) en el marco RSL-RL sobre IsaacLab. La política se exporta como `model_state_dict` con prefijos `actor.` y `critic.`, con normalización de observaciones mediante media y desviación típicas en ejecución (`obs_norm_state_dict`). El actor se extrae descartando la clave `actor.std`, lo que indica una política gaussiana con desviación típica aprendida o fijada por separado y no incluida en la exportación del actor determinista.

El volumen de entrenamiento es de 30 000 iteraciones, con 16 checkpoints distribuidos a lo largo de la ejecución y una fecha de lanzamiento de 2026-10-22 (04:45:07). No se especifican el número de entornos paralelos, el número de pasos por iteración, la composición del dataset (en RL on-policy no hay dataset estático, sino muestreo del simulador), ni si hubo fases de ajuste fino, destilación o curriculum. Tampoco se documentan innovaciones técnicas adicionales como domain randomization, reward shaping o decodificación especulativa (no aplicable en este dominio).

## Capacidades

- Generación de acciones de control continuas a partir de observaciones normalizadas, propias de una tarea de locomoción o marcha en simulador (el identificador «walk» apunta a marcha bípeda; no confirmado en la model card).
- Reanudación de entrenamiento: cada `.pt` incluye el estado del crítico, el normalizador de observaciones y el contador de iteraciones, lo que permite continuar con `--resume`.
- Evaluación intermedia: la serie de 16 checkpoints permite analizar la evolución de la política a lo largo de las 30 000 iteraciones.
- Reproducibilidad de la configuración: `params/env.yaml` y `params/agent.yaml` congelan el entorno y los hiperparámetros de PPO del lanzamiento.
- Inferencia ligera: la extracción del actor es directa (`{k[6:]: v ...}`) y puede ejecutarse en CPU con `map_location='cpu'`.
- No soporta tool calling, function calling, razonamiento multi-paso, capacidades multilingües, visión, audio ni modo «thinking»: no es un modelo de lenguaje.

## Casos de uso

- Reanudar un entrenamiento interrumpido: cargar `model_29999.pt`, restaurar `model_state_dict`, `obs_norm_state_dict` e iteración con `--resume` en RSL-RL permite continuar desde la iteración 30 000 sin reiniciar el currículo de PPO.
- Análisis de curvas de aprendizaje: al disponer de 16 checkpoints equiespaciados, se puede evaluar la política en el mismo conjunto de episodios y reconstruir la evolución de la recompensa media y la tasa de éxito frente a las iteraciones.
- Selección de checkpoint para despliegue: comparar los modelos intermedios frente al final permite detectar sobreajuste, colapso de política o degradación por annealing de la recompensa antes de exportar a un robot real.
- Destilación a una política más pequeña: usar el actor de `model_29999` como profesor para entrenar por imitación una red de menor tamaño y reducir la latencia de inferencia en el hardware embebido del robot.
- Reproducción de experimentos: `params/env.yaml` y `params/agent.yaml` permiten relanzar la misma configuración en IsaacLab para verificar la variabilidad entre semillas con PPO.
- Barrido de hiperparámetros con línea base fija: el par de YAML congelados sirve como referencia contra la que comparar cambios en la recompensa, el número de entornos o la tasa de aprendizaje.
- Pruebas de robustez sim-to-real: evaluar los checkpoints bajo perturbaciones de masa, fricción o latencia en el simulador antes de transferir la política al robot físico.
- Integración en CI de políticas de control: incluir una prueba de regresión que cargue el checkpoint y verifique que las acciones producidas sobre un conjunto fijo de observaciones coinciden dentro de una tolerancia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye recompensa media, tasa de éxito, error de seguimiento de trayectoria, curvas de entrenamiento, vídeos de despliegue ni comparación con otras políticas. El único dato cuantitativo verificable es el número de checkpoints (16) y el rango de iteraciones (0 a 29 999).

## Requisitos de hardware

- Inferencia: un único checkpoint ronda los 17 MB de media; el actor puede ejecutarse en CPU sin GPU dedicada. VRAM estimada: menos de 1 GB en cualquier configuración razonable (estimación orientativa, no verificada en la model card).
- GPU recomendadas para inferencia: ninguna imprescindible; cualquier GPU con soporte CUDA acelera el cálculo, pero el cuello de botella será el bucle de control, no la red.
- GPU para entrenamiento: no disponible en la información proporcionada. IsaacLab/Isaac Sim requiere una GPU con soporte RTX y drivers compatibles; la model card no especifica el hardware usado en la ejecución original.
- Cabe en GPU de consumo: sí, tanto en inferencia (cualquier GPU o CPU) como, previsiblemente, en entrenamiento con un número reducido de entornos; el requisito real de entrenamiento a gran escala lo marca el simulador, no la red.
- Opciones de despliegue: carga directa con PyTorch (`torch.load` + extracción del actor), exportación a TorchScript u ONNX para inferencia en C++ o en el middleware del robot, e integración en el bucle de IsaacLab/RSL-RL para evaluación o reanudación. No hay soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles. Dependen del tamaño del actor (no documentado) y del hardware; en una política MLP de este tipo es habitual el orden de microsegundos a pocos milisegundos por paso en CPU, pero no hay medición publicada que lo respalde.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad | Datos de rendimiento |
|---|---|---|---|---|---|---|
| hihikk/H2walk-main-30k | Política actor-crítico PPO (IsaacLab / RSL-RL) | No disponible | No aplica | No disponible | Hugging Face, 0 descargas, 0 likes | No disponible |
| Políticas de referencia de IsaacLab / RSL-RL | Políticas PPO para locomoción en simulador | No disponible | No aplica | Sujeta a la licencia del proyecto IsaacLab (no verificada en esta ficha) | Repositorios públicos de NVIDIA / RSL-RL | No comparable con este artefacto por falta de métricas |
| Otros checkpoints comunitarios de RSL-RL en Hugging Face | Políticas PPO exportadas | No disponible | No aplica | Variable, frecuentemente sin declarar | Hugging Face | No disponible |

No disponible: no se han identificado en la información proporcionada modelos comparables con métricas publicadas que permitan una comparación cuantitativa (parámetros, recompensa, tasa de éxito).

## Limitaciones y advertencias

- Licencia no declarada: no se especifica ninguna licencia, por lo que el uso comercial, la redistribución y la modificación quedan en un limbo legal hasta que el autor lo aclare.
- Ausencia total de evaluación: no hay recompensa media, tasa de éxito ni vídeos; no es posible afirmar que la política camine de forma estable sin evaluarla.
- Trazabilidad incompleta: se desconoce la tarea exacta, el robot objetivo (el nombre sugiere un humanoide H2, sin confirmar), la versión de IsaacLab/RSL-RL y las semillas empleadas.
- Dependencia del entorno: la política está acoplada a la distribución de observaciones de `params/env.yaml`; fuera de esa configuración la normalización de observaciones puede producir acciones inválidas.
- Riesgo de sobreajuste al simulador: sin datos de domain randomization ni de transferencia, el salto a un robot físico no está validado.
- Estado del actor incompleto: la exportación descarta `actor.std`, de modo que la política cargada es determinista o requiere reconstruir la desviación típica para uso estocástico.
- Formato `.pt` basado en pickle: implica riesgos de seguridad al cargar ficheros de origen no verificado; conviene auditar o convertir antes de usarlo en pipelines automatizados.
- Sesgos: no procede hablar de sesgos sociales, pero sí de sesgos de distribución del simulador (fricción, masa, retardo de actuadores) que condicionan el comportamiento aprendido.
- Riesgo de alucinación: no aplica; el modelo no genera texto.
- Los resultados de búsqueda web obtenidos no guardan relación con este repositorio y no deben usarse como documentación del mismo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/hihikk/H2walk-main-30k
- IsaacLab (marco de simulación citado en la model card): no se proporciona enlace en la información disponible
- RSL-RL (librería de RL citada en la model card): no se proporciona enlace en la información disponible
- Resultados de búsqueda no relacionados (se listan solo por transparencia, no documentan este modelo): https://github.com/DSwebTEAM/Hibiki (proyecto de acompañante anime, sin relación) y https://arxiv.org/abs/2502.03382 (artículo sobre traducción simultánea de voz «Hibiki», sin relación)
