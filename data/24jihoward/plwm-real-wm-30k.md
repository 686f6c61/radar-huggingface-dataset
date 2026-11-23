# 24jihoward/plwm-real-wm-30k

## Resumen

PLWM (point-latent world model) es un modelo del mundo para robotica desarrollado por el usuario 24jihoward y publicado como release de investigacion en estado "work in progress". Se construye sobre el difusor de video Wan2.2-TI2V-5B, al que se le anade una corriente latente de nubes de puntos 3D y un decodificador de acciones en bucle que opera exclusivamente sobre los latentes de puntos predichos. El modelo aprende a predecir la evolucion futura de escenas roboticas bimanuales a partir de cuatro vistas de camara y de una representacion geometrica de la escena.

El checkpoint publicado corresponde al paso 30.000 de entrenamiento y se entreno exclusivamente con datos reales de robot bimanual (134 episodios repartidos en tres tareas de sobremesa). La relevancia actual reside en que combina generacion de video con modelado geometrico explicito y decodificacion de acciones, una linea de trabajo habitual en modelos del mundo para planificacion robotica y aprendizaje por imitacion. El repositorio incluye codigo de entrenamiento, configuraciones, el checkpoint final, el autoencoder de puntos congelado y las estadisticas de normalizacion.

El modelo tiene 5.040 millones de parametros en total, procesa ventanas de 9 fotogramas latentes (t0 mas 8 futuros) con 32 pasos futuros a 0,1 s, y genera acciones bimanuales de 12 dimensiones por extremo a 10 Hz. No se incluyen datos de entrenamiento, demos, videos ni logs. La licencia no esta especificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | StackedLatentWM: DiT de difusion de video Wan2.2-TI2V-5B extendido con corriente latente de nubes de puntos 3D y decodificador de acciones en bucle |
| Parametros totales | 5,04 B (5.040 millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 9 fotogramas latentes (t0 + 8 futuros), 32 pasos futuros a 0,1 s; 192 tokens DiT por fotograma latente |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles (instrucciones via embeddings umt5-xxl) |
| Licencia | no disponible |
| Formato de pesos | PyTorch `.pt` (`step_030000.pt`, con state dict del modelo, EMA en bf16 y config resuelta); autoencoder en `.pt` |

## Arquitectura y entrenamiento

El modelo se compone de un experto de video basado en el DiT de Wan2.2-TI2V-5B, inicializado desde Wan2.2 y entrenado por completo, y de una corriente latente de puntos geometrica pura. La entrada de video son cuatro vistas (superior, lateral, muneca izquierda y muneca derecha) de 256x192 cada una, embaldosadas en un unico fotograma de 1024x192; el latente de Wan2.2 es de 64x12, lo que da 32x6 = 192 tokens DiT por fotograma latente. El latente de puntos consta de 192 slots (24 tokens de eslabones del robot mas 168 parches de escena) con 96 canales por fotograma latente, generados por un autoencoder de puntos SE(3) congelado; no hay canales semanticos. Con `slot_layout: token`, cada slot de puntos se situa sobre un token DiT y sus 96 canales se organizan como 24 canales x 2 x 2 celdas latentes. No existe historial de puntos: cada ventana tiene 9 fotogramas latentes.

El decodificador de acciones en bucle (`pts_actdec`) lee unicamente los latentes de puntos predichos y produce acciones bimanuales de 2 x 12 dimensiones (`rc12`) por paso de 10 Hz. Su perdida entrena solo al decodificador; el tronco no recibe gradiente de accion. Los pesos del decodificador residen en `step_030000.pt` (87 tensores `pts_actdec.*` en el state dict del modelo). El entrenamiento uso datos reales de robot bimanual de sobremesa: 134 episodios en tres tareas (simplesweep 52, hangmug 51, greycloth 31), con nubes de puntos construidas con la calibracion de camara del propio dataset y division por episodio completo, lo que dio 45.586 ventanas de entrenamiento. El texto de instruccion pasa por embeddings de umt5-xxl. La optimizacion empleo DeepSpeed ZeRO-2 sobre 8x B200, batch global 64, AdamW fusionado con lr 1e-4, weight decay 0,01, betas 0,9/0,95, grad clip 1,0, warm-up 500, schedule coseno sobre 30.000 pasos, bf16, gradient checkpointing y EMA 0,999 (sombra bf16 guardada). La ejecucion se detuvo primero a 10.000 pasos y se reanudo desde su estado completo en la misma curva de lr hasta 30.000.

## Capacidades

- Generacion de video condicionada a instruccion y a estado inicial, con cuatro vistas sincronizadas.
- Prediccion de nubes de puntos 3D futuras mediante latentes geometricos (192 slots, sin canales semanticos).
- Decodificacion de acciones bimanuales de extremo efector (2 x 12 dimensiones) a 10 Hz a partir de los latentes de puntos predichos.
- Modelado del mundo para planificacion y evaluacion de trayectorias en entornos de robot bimanual de sobremesa.
- Condicionamiento por texto de instruccion mediante embeddings de umt5-xxl.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad general; el modelo opera como predictor de dinamica, no como agente conversacional.
- Capacidades multilingues: no disponibles; el condicionamiento textual depende de umt5-xxl.
- Modo thinking, vision semantica, audio: no disponibles (la corriente de puntos es exclusivamente geometrica).

## Casos de uso

- Planificacion de politicas bimanuales: dado un estado inicial (cuatro vistas mas nube de puntos) y una instruccion, el modelo predice latentes de puntos futuros y el decodificador produce acciones de extremo efector a 10 Hz, util para generar trayectorias candidatas antes de ejecutarlas en el robot.
- Evaluacion de politicas en simulacion latente: el modelo del mundo permite desplegar una politica en el espacio latente sin ejecutar el robot fisico, reduciendo coste y riesgo en tareas de sobremesa como barrido, colgado de taza o manejo de tela.
- Aprendizaje por imitacion aumentado: las ventanas predichas (45.586 ventanas de entrenamiento reales como base) pueden emplearse para aumentar datos de demostracion y entrenar controladores con mas cobertura de estados.
- Verificacion de seguridad previa a ejecucion: comparar la prediccion de nubes de puntos con restricciones geometricas (colisiones, limites de espacio de trabajo) antes de enviar acciones al robot.
- Investigacion en modelos del mundo geometricos: el codigo, las configuraciones y el autoencoder congelado permiten reproducir y extender el enfoque punto-latente sobre otros backbones de difusion de video.
- Prototipado de tareas de manipulacion bimanual en laboratorio: con 134 episodios en tres tareas, sirve para validar rapidamente pipelines de percepcion-calibracion-accion antes de escalar a datasets mayores.
- Analisis de representaciones: los latentes de 192 slots x 96 canales permiten estudiar que informacion geometrica captura el tronco y como se relaciona con la accion decodificada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Entrenamiento: 8x B200 con DeepSpeed ZeRO-2, batch global 64, bf16 y gradient checkpointing (receta documentada en `train.sh`).
- VRAM estimada para inferencia: no disponible de forma explicita; el checkpoint pesa aproximadamente 40,4 GB en el repositorio (incluye state dict, EMA bf16 y autoencoder), por lo que la inferencia en precision completa requiere GPUs de datacenter.
- GPU recomendadas: B200 para entrenamiento; para inferencia se recomienda A100/H100 por capacidad de memoria, si bien no se documentan medidas.
- Cabe en GPU de consumo: no disponible; el tamano del checkpoint y la necesidad de cargar Wan2.2-TI2V-5B, el VAE y umt5-xxl hacen improbable su ajuste en GPUs de consumo sin cuantizacion, que no esta documentada.
- Opciones de despliegue: carga en CPU con `load_test.py` (modelo en meta-device, pesos con mmap); inferencia con el paquete `plwm` y el entorno FastWAM (torch 2.9.1, cuDNN 9.27). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PLWM (este modelo) | 5,04 B | 9 fotogramas latentes, 32 pasos a 0,1 s | Video 4 vistas + nube de puntos + acciones | no disponible | Hugging Face, release de investigacion |
| Wan2.2-TI2V-5B | 5 B | no disponible en esta ficha | Video texto-imagen-a-video | no disponible en esta ficha | Publico (Wan-AI) |
| Alternativas de world models roboticos | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de comparativas cuantitativas con otros modelos del mundo en la informacion proporcionada.

## Limitaciones y advertencias

- Release de investigacion en estado "work in progress"; no se garantiza estabilidad ni soporte.
- Entrenado solo con datos reales de robot bimanual de sobremesa (134 episodios, tres tareas: simplesweep, hangmug, greycloth); la generalizacion a otras morfologias, tareas o entornos no esta validada.
- La corriente de puntos es exclusivamente geometrica (sin canales semanticos), lo que limita la comprension de objetos y affordances.
- No hay historial de puntos: cada ventana parte de t0 y predice 8 fotogramas latentes futuros, lo que restringe la memoria temporal mas alla de esa ventana.
- El decodificador de acciones se entrena solo con la perdida de accion y el tronco no recibe gradiente de accion; posibles desalineaciones entre la prediccion geometrica y la accion no estan caracterizadas.
- Licencia no especificada: riesgo legal para uso comercial; debe contactarse con el autor antes de cualquier despliegue productivo.
- No se incluyen datos de entrenamiento, demos, videos ni logs, lo que dificulta la reproduccion completa y la auditoria del dataset.
- Riesgo de alucinacion en la generacion de video y de puntos no cuantificado; no se han publicado evaluaciones.
- Idiomas soportados no disponibles; el condicionamiento textual depende de umt5-xxl y no se documenta cobertura multilingue.
- Rutas internas, nombres de cluster y entidades de logging fueron reemplazados por placeholders; es necesario configurar variables de entorno `PLWM_*` para ejecutar el codigo.
- Para inferencia se requieren archivos externos (`Wan2.2_VAE.pth` y `google/umt5-xxl`) ademas del checkpoint.

## Enlaces

- Hugging Face: https://huggingface.co/24jihoward/plwm-real-wm-30k
- Wan2.2-TI2V-5B (backbone de video): https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- umt5-xxl (encoder de texto): https://huggingface.co/google/umt5-xxl
- Sonata (Pointcept, dependencia de puntos): no disponible en la informacion proporcionada
- FastWAM (codigo vendored, commit 54c307f): no disponible en la informacion proporcionada
- Paper, blog o demo: no disponibles en la informacion proporcionada
