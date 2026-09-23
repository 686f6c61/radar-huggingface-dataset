# Aquinlabs/aq-mario

## Resumen

AQ-Mario es un modelo de mundo (world model) latente y condicionado por acciones, basado en una arquitectura EMA-JEPA (Joint Embedding Predictive Architecture con encoder objetivo de media m�vil exponencial). Lo publica el usuario Aquinlabs en HuggingFace y procede del experimento `full3ep_pure_ema999` del proyecto AQ-Mario, alojado en `github.com/sachin1705s/aq-mario`. El modelo aprende la din�mica de Super Mario Bros. 1-1 a partir de secuencias de fotogramas y acciones.

A diferencia de un modelo generativo de p�xeles, AQ-Mario predice estados latentes futuros en lugar de fotogramas RGB, lo que lo hace adecuado para an�lisis de representaciones y experimentos de planificaci�n basada en modelo. Cuenta con 9.801.795 par�metros entrenables m�s cabeceras auxiliares, se entren� durante 41.160 pasos (3 �pocas) y su checkpoint final ocupa 133,5 MiB.

Es relevante ahora como ejemplo reproducible y de bajo coste de la familia JEPA aplicada a control y refuerzo, un �rea donde los world models latentes se estudian como alternativa a la reconstrucci�n de p�xeles. El propio autor advierte que este run no debe presentarse como un controlador de Mario resuelto: las sondas finales de x/y/scroll y la puerta de condicionamiento por acci�n no superan los umbrales del proyecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EMA-JEPA (Joint Embedding Predictive Architecture) con encoder objetivo EMA, condicionada por acciones |
| Parametros totales | 9.801.795 entrenables mas cabeceras auxiliares (el desglose total no esta disponible) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (opera sobre secuencias de fotogramas; el numero exacto de fotogramas por secuencia no se especifica) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; procesa observaciones de juego) |
| Licencia | no disponible en la ficha de HuggingFace; el autor indica que el codigo fuente es MIT, pero el checkpoint y los datos derivados quedan sujetos a los derechos del contenido del juego |
| Formato de pesos | PyTorch (`jepa.pt`, checkpoint serializado con `torch.save`) |

## Arquitectura y entrenamiento

AQ-Mario implementa una arquitectura JEPA acci�n-condicionada: un encoder procesa fotogramas y aprende una representaci�n latente, y un predictor condicionado por acciones estima el estado latente futuro sin reconstruir p�xeles. El entrenamiento usa un encoder objetivo actualizado por media m�vil exponencial con `ema_target=0.999`, t�cnica habitual en esta familia para evitar el colapso de representaciones. El checkpoint `jepa.pt` incluye el world model JEPA, cabeceras auxiliares, el profesor EMA y el estado del optimizador AdamW.

Los datos de entrenamiento son observaciones de gameplay derivadas de Super Mario Bros. 1-1, publicadas en el dataset `maxmill/aq-mario-smb1`. El run se entren� durante 41.160 pasos y 3 �pocas, y genera un informe de puertas (`gates.json`, `gate_by_epoch.json`) con sondas de representaci�n y medidas de salud. No se documentan en la informaci�n disponible ni el n�mero total de tokens/fotogramas, ni la composici�n exacta del dataset, ni el uso de RLHF o DPO.

## Capacidades

- Predicci�n de estados latentes futuros a partir de un estado actual y una acci�n.
- Aprendizaje de representaciones de la din�mica del nivel 1-1 de Super Mario Bros.
- Soporte para an�lisis de representaciones mediante sondas (probes) de posici�n x/y y scroll.
- Base para experimentos de planificaci�n basada en modelo y model-based RL.
- Cabeceras auxiliares incluidas junto al world model en el checkpoint.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni function calling.
- No implementa agentes conversacionales ni razonamiento multi-paso en el sentido de un LLM.
- Capacidades multiling�es: no aplica.
- No se documentan capacidades de visi�n general, audio ni modo de pensamiento.

## Casos de uso

- Investigacion en world models latentes: reproducir el experimento `full3ep_pure_ema999` con el loader y el c�digo del repositorio para estudiar la din�mica aprendida sin coste de reconstrucci�n de p�xeles.
- Analisis de representaciones (probing): usar las sondas de x/y/scroll para medir qu� informaci�n espacial captura el encoder y compararlo con otros esquemas de auto-supervisi�n.
- Planificaci�n basada en modelo: emplear el predictor latente para simular rollouts y evaluar pol�ticas en el espacio latente antes de ejecutarlas en el entorno.
- Model-based reinforcement learning: integrar el world model como componente de un agente RL que aprenda pol�ticas sobre representaciones predichas, reduciendo el n�mero de interacciones reales con el juego.
- Estudio de estabilidad de representaciones: analizar el efecto de `ema_target=0.999` frente a otros valores y detectar colapso con `gates.json` y `gate_by_epoch.json` como referencia de salud.
- Docencia y prototipado: ejemplo de juguete completo (9,8M par�metros, 133,5 MiB) para ense�ar un pipeline JEPA end-to-end en una GPU consumer.
- Benchmarking de m�todos JEPA: usar el nivel 1-1 como entorno controlado y repetible para comparar variantes de encoders y predictores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor incluye un informe final de puertas (`gates.json`) con sondas de x/y/scroll y una puerta de condicionamiento por acci�n, pero indica expl�citamente que dichas puertas no superan los umbrales del proyecto y no se aportan cifras num�ricas en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja. Con 9,8M par�metros, los pesos en fp32 ocupan aproximadamente 39 MB (9,8M x 4 bytes); el checkpoint completo con profesor EMA y estado del optimizador son 133,5 MiB. Estas cifras son estimaciones derivadas del recuento de par�metros y del tama�o del checkpoint, no datos publicados por el autor.
- GPU recomendadas: cualquier GPU con m�s de 1 GB de VRAM es suficiente; tambi�n puede ejecutarse en CPU para inferencia y an�lisis.
- Cabe en GPU consumer: s�, en cualquier GPU consumer moderna (por ejemplo, GTX 1650, RTX 3060, RTX 4090) y previsiblemente en hardware integrado.
- Opciones de despliegue: carga directa con PyTorch (`torch.load` sobre `checkpoint["jepa"]`) y el helper `aqmario.model.load_jepa` del repositorio. No aplican vLLM, llama.cpp, Ollama ni TGI porque no es un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No hay datos num�ricos publicados en la informaci�n disponible para una comparaci�n cuantitativa. Como referencia cualitativa de la misma categor�a (world models latentes y arquitecturas JEPA), pueden citarse:

| Modelo | Categoria | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AQ-Mario (EMA-JEPA) | World model latente accion-condicionado | 9,8M + cabeceras | no disponible | codigo MIT; checkpoint sujeto a derechos del juego | HuggingFace, 0 descargas |
| I-JEPA / V-JEPA | JEPA de imagen y video | no disponible | no aplica | no disponible | pesos publicados por Meta |
| DreamerV3 | World model para RL | no disponible | no aplica | no disponible | codigo y pesos publicos |
| DINO-WM | World model latente para planificacion | no disponible | no aplica | no disponible | no disponible |

Los campos marcados como no disponibles no se han podido verificar en la informacion proporcionada y no deben interpretarse como equivalentes.

## Limitaciones y advertencias

- El autor declara que el run no es un controlador de Mario resuelto: las sondas finales de x/y/scroll y la puerta de condicionamiento por acci�n no superan los umbrales del proyecto, por lo que el uso como pol�tica de control no est� validado.
- Sesgo de dominio: el modelo se entrena exclusivamente con observaciones de Super Mario Bros. 1-1, de modo que no generaliza a otros niveles, juegos o entornos sin reentrenamiento.
- Riesgo de deriva en rollouts: en world models latentes el error de predicci�n se acumula a lo largo de la planificaci�n y puede degradar r�pidamente la calidad de las trayectorias simuladas.
- Ausencia de datos clave: no se documentan la licencia del checkpoint en la ficha de HuggingFace, el n�mero de fotogramas por secuencia, la composici�n del dataset ni el desglose completo de par�metros.
- Restricciones legales: el c�digo fuente es MIT, pero el checkpoint y los datos derivados est�n sujetos a los derechos del contenido del juego. El proyecto no est� afiliado ni respaldado por Nintendo, lo que limita el uso comercial del modelo y de los datos derivados.
- No es un modelo de lenguaje ni multiling�e: no admite instrucciones en lenguaje natural, tool calling, agentes ni conversaci�n.
- Inconsistencia de metadatos: la ficha corresponde al ID `Aquinlabs/aq-mario`, mientras que la model card enlaza v�deo, dataset y espacios bajo `maxmill/*` y el c�digo en `github.com/sachin1705s/aq-mario`. Conviene verificar la procedencia antes de reutilizarlo.
- Fechas de creaci�n y actualizaci�n poco fiables (2026) y m�tricas de adopci�n nulas (0 descargas, 0 likes) en el momento de la consulta.
- La b�squeda web realizada no ha devuelto ning�n resultado pertinente: solo p�ginas de soporte de YouTube en ruso sin relaci�n con el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Aquinlabs/aq-mario
- Repositorio de codigo del proyecto: https://github.com/sachin1705s/aq-mario
- Dataset de entrenamiento: https://huggingface.co/datasets/maxmill/aq-mario-smb1
- Preview de rollout: https://huggingface.co/maxmill/aq-mario/resolve/main/pure_jepa_ema.mp4
- Paper, blog o demo adicionales: no disponible (la busqueda web no devolvio resultados relevantes)
