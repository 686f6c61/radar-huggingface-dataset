# Jinyan0924/flux3-agibot-looped

## Resumen

`Jinyan0924/flux3-agibot-looped` es un retrofit experimental del modelo FLUX 3 Action 7B de Black Forest Labs, orientado a la predicción de vídeo futuro en entornos robóticos. El autor, Jinyan0924, parte de su propio fine-tune completo `flux3-agibot-videoft` y le aplica la arquitectura Looped Diffusion Transformer descrita por Chng et al. (2026, arXiv:2609.40305), reorganizando los 33 bloques conjuntos del transformer en tres segmentos de 12, 9 y 12 bloques y ejecutando el segmento central N = 4 veces.

La tarea concreta es de world model robótico: dado un conjunto de k fotogramas pasados de la cámara de cabeza más un caption, el modelo genera 33 fotogramas futuros a 15 fps con resolución 384×512. El objetivo es que un robot o un planificador pueda anticipar la evolución visual de la escena, lo que resulta relevante para control, simulación y aprendizaje por imitación sin necesidad de desplegar hardware real en cada iteración.

El modelo tiene aproximadamente 7 000 millones de parámetros heredados de FLUX 3 Action, se distribuye como state dict en bf16 y está entrenado sobre el dataset AgiBot World Beta. Su licencia es la FLUX Kommunity License, de uso exclusivamente no comercial, y el dataset de entrenamiento es CC BY-NC-SA 4.0, por lo que todo lo derivado arrastra la misma restricción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Looped Diffusion Transformer (DiT) sobre FLUX 3 Action; 33 bloques conjuntos divididos 12 / 9 / 12, segmento central repetido N = 4 con atencion con puertas por cabeza (head-wise gated attention) |
| Parametros totales | Aproximadamente 7 000 millones (heredados de FLUX 3 Action 7B; el retrofit no anade parametros nuevos mas alla de las puertas de atencion) |
| Parametros activos | no disponible (no es un modelo MoE; el bucle reutiliza los mismos pesos) |
| Longitud de contexto | no disponible como ventana de tokens; la condicion de entrada son k fotogramas de camara de cabeza mas un caption, y la salida son 33 fotogramas futuros a 15 fps en 384×512 |
| Tipos de cuantizacion | bf16 unicamente; no se distribuyen versiones GGUF, int8 ni int4 |
| Idiomas soportados | no disponible (la model card no declara idiomas; los captions de AgiBot World Beta estan en ingles segun la practica habitual del dataset, sin confirmacion explicita) |
| Licencia | FLUX Kommunity License (license_name: flux-kommunity-license), uso no comercial; datos de entrenamiento bajo CC BY-NC-SA 4.0 |
| Formato de pesos | safetensors (state dict plano en bf16); checkpoints completos en formato FSDP2 DCP con shards de modelo, optimizador y EMA en CPU |

## Arquitectura y entrenamiento

El modelo es un retrofit del transformer de difusion de FLUX 3 Action 7B. La intervencion principal consiste en dividir los 33 bloques conjuntos en tres tramos de 12, 9 y 12 bloques, y ejecutar el tramo central N = 4 veces, de modo que el modelo reutiliza el mismo subconjunto de pesos en varias pasadas. La atencion del tramo repetido incorpora puertas por cabeza (head-wise gated attention), y cada salida intermedia del bucle se entrena con supervision profunda (deep supervision), lo que permite obtener predicciones validas en cada iteracion del bucle. Existe ademas una variante secundaria entrenada con profundidad de bucle aleatoria N en {1..8} por paso durante 2 000 pasos, orientada a estudiar la robustez frente a distintas profundidades de inferencia.

El entrenamiento se desarrollo en dos rondas. La ronda r1 llego al paso 2 500 con learning rate 1e-5 y un cooldown de 500 pasos, con EMA 0.999. La ronda r2 reanudo desde el estado del paso 2 500 de r1 y se entreno hasta el paso 4 500 con learning rate constante de 1e-5 y sin cooldown; la ejecucion planificada de 5 000 pasos con cooldown se detuvo antes de tiempo debido a fallos repetidos de infraestructura. El modelo base previo, `flux3-agibot-videoft`, es un fine-tune completo de `black-forest-labs/flux-3-action-base`, y los datos de entrenamiento proceden de AgiBot World Beta (CC BY-NC-SA 4.0). No se documentan en la informacion disponible fases de RLHF o DPO.

## Capacidades

- Prediccion de video futuro condicionada: genera 33 fotogramas a 15 fps en 384×512 a partir de k fotogramas de contexto y un caption.
- Modelado de dinamica visual para robotica: aprende la evolucion temporal de la escena desde la camara de cabeza de un manipulador.
- Prediccion autorregresiva por ventanas: el modelo puede encadenarse en iteraciones sucesivas para extender la prediccion mas alla de los 33 fotogramas de una pasada.
- Profundidad de computo configurable en inferencia: el bucle central admite distintos valores de N (se evaluan N = 1, 2, 4 y 8), lo que permite ajustar coste y calidad.
- Variante con profundidad aleatoria: el side run `random_depth_n1-8/` permite evaluar comportamiento con N variable sin reentrenar.
- Capacidades de tool calling o function calling: no disponibles (el modelo no es un LLM conversacional; no se documenta soporte de agentes).
- Capacidades multilingues: no disponibles.
- Modos especiales (thinking, vision general, audio): no disponibles. El modelo es especifico de prediccion de video desde camara de robot.

## Casos de uso

- Planificacion de movimientos en robotica de manipulacion: el modelo predice la evolucion visual de la escena tras una accion candidata, lo que permite evaluar trayectorias antes de ejecutarlas en el robot fisico y reducir el desgaste del hardware.
- Entrenamiento de politicas en simulacion: al actuar como world model, genera rollouts visuales sinteticos que alimentan algoritmos de aprendizaje por imitacion sin necesidad de teleoperacion adicional.
- Aumento de datos para vision robotica: los 33 fotogramas futuros predichos pueden usarse como datos sinteticos etiquetados temporalmente para entrenar detectores o segmentadores en tareas de AgiBot World.
- Validacion de escenarios peligrosos: predecir futuros visuales permite estudiar si una accion provoca colisiones o caidas antes de ejecutarla, util en entornos industriales.
- Investigacion en arquitecturas looped: el modelo sirve como referencia reproducible para estudiar el trade-off entre profundidad de bucle N y calidad de prediccion, dado que se publican los checkpoints de cada ronda y la curva de validacion.
- Benchmarking de world models: al publicar metricas PSNR, SSIM, LPIPS y FVD frente a alternativas, puede emplearse como linea base en comparativas academicas de prediccion de video robotico.
- Generacion de video condicionada por caption desde camara: permite producir clips cortos de escenas de manipulacion para documentacion tecnica o demostraciones internas, siempre dentro del marco no comercial de la licencia.

## Benchmarks y rendimiento

La model card proporciona perdidas de validacion (EMA, con N = 4 en inferencia, ventanas, timesteps y ruido fijos). Menor es mejor. k indica el numero de fotogramas de contexto.

| Configuracion | k = 1 | k = 9 |
|---|---|---|
| r1, paso 2500 | 0,0787 | 0,0654 |
| r2, paso 4000 | 0,0783 | 0,0651 |

El pase de validacion correspondiente al paso 4 500 se interrumpio por el fallo de infraestructura que termino la ejecucion, por lo que el ultimo punto disponible es el paso 4 000. Las metricas de test PSNR, SSIM, LPIPS y FVD, asi como el barrido de profundidad de bucle en inferencia (N = 1, 2, 4 y 8), se encuentran en `agibot-flux3/results/RESULTS.md` del repositorio de GitHub, pero los valores concretos no estan incluidos en la informacion disponible, por lo que no se reproducen aqui.

No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia en bf16: los pesos de un modelo de 7B en bf16 ocupan aproximadamente 14 GB; a ello hay que sumar activaciones y buffers de atencion para secuencias de video a 384×512, con lo que el consumo practico se situa por encima de los 20-24 GB en configuraciones estandar. Estimacion orientativa, no confirmada por el autor.
- GPU recomendadas: A100 40 GB o 80 GB, H100 80 GB y tarjetas de 24 GB o mas (RTX 4090, RTX 3090) para inferencia en bf16. Con N = 4 el coste de computo del tramo central se multiplica, por lo que en GPUs de 24 GB puede ser necesario reducir la profundidad de bucle a N = 1 o 2.
- Compatibilidad con GPU de consumo: si, previsiblemente en RTX 4090 y RTX 3090 con bf16, aunque sin confirmacion oficial del autor sobre latencias ni picos de memoria.
- Opciones de despliegue: el autor indica que los ficheros EMA se cargan con el paquete `ldvflux` del repositorio de GitHub, y que `ldvflux.eval_phase4` contiene la ruta completa de muestreo. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado que se trata de un modelo de difusion de video y no de un LLM.
- Tamano del repositorio: 633,3 GB, lo que incluye los checkpoints completos de FSDP2 en ambos ciclos, shards de optimizador y EMA en CPU. Para inferencia solo se necesita descargar el fichero safetensors EMA correspondiente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto / salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jinyan0924/flux3-agibot-looped | ~7B | Prediccion de video futuro (image-to-video) | k fotogramas + caption → 33 fotogramas, 384×512, 15 fps | FLUX Kommunity License, no comercial | HuggingFace, 58 descargas |
| Jinyan0924/flux3-agibot-videoft | ~7B | Prediccion de video futuro desde camara de robot | no disponible en detalle | FLUX Kommunity License, no comercial | HuggingFace |
| black-forest-labs/flux-3-action-base | 7B | World action model para control de robot | no disponible | FLUX Kommunity License | HuggingFace (pesos abiertos) |
| FLUX 3 (modelo multimodal completo) | no disponible | Generacion y comprension de video, audio, imagen y acciones | no disponible | no disponible (consultar BFL) | API y pesos de BFL |

La comparativa se limita a los modelos de la misma familia porque no se dispone de datos de rendimiento de terceros en la informacion proporcionada.

## Limitaciones y advertencias

- Uso exclusivamente no comercial: la licencia FLUX Kommunity License impide el uso comercial de los pesos y de cualquier derivado.
- Contagio de licencia del dataset: AgiBot World Beta esta bajo CC BY-NC-SA 4.0, de modo que las obras derivadas deben mantener la misma clausura no comercial y share-alike.
- Sesgos: no se documentan analisis de sesgos. Al entrenar sobre un dataset de robotica de manipulacion, el modelo hereda las condiciones de iluminacion, tipos de objeto y entorno de AgiBot World, lo que limita su generalizacion a otros dominios visuales.
- Riesgo de alucinacion visual: como modelo de difusion generativo, puede producir fotogramas temporalmente incoherentes o fisicamente imposibles, especialmente con N alto o contextos k bajos.
- Degradacion con pocos fotogramas de contexto: las perdidas de validacion son peores con k = 1 (0,0787 / 0,0783) que con k = 9 (0,0654 / 0,0651), lo que indica menor calidad cuando se dispone de poca historia.
- Entrenamiento truncado: la ronda r2 se detuvo en el paso 4 500 en lugar de los 5 000 planificados por fallos de infraestructura, y el ultimo pase de validacion es del paso 4 000; el modelo puede no estar completamente convergido.
- Restricciones de despliegue: no hay versiones cuantizadas ni soporte declarado en servidores de inferencia habituales, lo que obliga a usar el codigo propio `ldvflux`.
- Resolucion y duracion fijas: la salida esta acotada a 33 fotogramas a 384×512 y 15 fps; no se documenta escalado a otras resoluciones o duraciones.
- Idiomas: la model card no declara idiomas soportados para los captions, por lo que no se puede garantizar el comportamiento fuera del idioma del dataset de entrenamiento.
- Fallos de infraestructura documentados: el propio autor reporta crashs repetidos durante el entrenamiento, lo que sugiere inestabilidad en configuraciones de entrenamiento muy largas.
- Volumen de descarga elevado: el repositorio ocupa 633,3 GB, aunque para inferencia basta con un fichero safetensors EMA concreto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jinyan0924/flux3-agibot-looped
- Modelo base del fine-tune: https://huggingface.co/Jinyan0924/flux3-agibot-videoft
- Modelo original de Black Forest Labs: https://huggingface.co/black-forest-labs/flux-3-action-base
- Codigo, configuraciones y resultados: https://github.com/naomili0924/looped-dit-video/tree/main/agibot-flux3
- Resultados detallados (PSNR, SSIM, LPIPS, FVD y barrido de N): `agibot-flux3/results/RESULTS.md` en el repositorio de GitHub
- Paper de la arquitectura Looped Diffusion Transformer: Chng et al., 2026, arXiv:2609.40305 (https://arxiv.org/abs/2609.40305)
- Pagina oficial de FLUX 3 Action: https://bfl.ai/models/flux-3-action
- Pagina oficial de FLUX 3: https://bfl.ai/models/flux-3-video
- Sitio del modelo FLUX 3: https://flux3.dev/
