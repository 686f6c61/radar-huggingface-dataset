# birbirll/g1-inspire-turn-page-starvla-n1d7

## Resumen

g1-inspire-turn-page-starvla-n1d7 es un modelo de vision-lenguaje-accion (VLA) publicado por el usuario birbirll, consistente en una reimplementacion de GR00T-N1.7 dentro del framework starVLA (clase `CosmosGR00TN1d7`) y afinado para una unica tarea: pasar la pagina de un cuaderno con un robot humanoide Unitree G1 (29 grados de libertad) equipado con manos Inspire RH56DFTP. El modelo parte del checkpoint nvidia/GR00T-N1.7-3B como warm start y se entrena sobre un unico dataset propio de demostraciones teleoperadas, con una sola camara de cabeza como entrada visual.

Tecnicamente es un modelo denso de 3.455.180.928 parametros (aproximadamente 3,46 B) compuesto por dos bloques: una interfaz vision-lenguaje de 494 tensores en bf16 y una cabeza de accion (diffusion transformer) de 537 tensores en fp32. Produce acciones absolutas normalizadas de forma (B, 30, 27), es decir, 30 pasos futuros a 60 fps (0,5 s de horizonte) sobre 27 dimensiones de control. El entrenamiento consistio en 10.000 pasos de optimizador en una unica GPU B200, con una `action_dit_loss` final de 0,014616.

Su relevancia es doble. Por un lado, forma parte de una familia de modelos hermanos entrenados sobre exactamente los mismos datos y el mismo contrato de interfaz, pero con frameworks distintos (Isaac-GR00T N1.6 y pi0.5), lo que lo convierte en un instrumento de comparacion controlada de arquitecturas VLA. Por otro lado, el autor declara explicitamente que el modelo no ha sido evaluado: no hay split de validacion, ni replay en bucle abierto, ni resultado en simulador ni en robot real, por lo que debe tratarse como un artefacto de investigacion y no como un componente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-lenguaje-accion); reimplementacion de GR00T-N1.7 en starVLA (`CosmosGR00TN1d7`), con interfaz vision-lenguaje (494 tensores bf16) y cabeza de accion diffusion transformer (537 tensores fp32) |
| Parametros totales | 3.455.180.928 (1.031 tensores en el `state_dict`) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; los pesos publicados estan sin cuantizar (bf16 en la interfaz VLM y fp32 en la cabeza de accion) |
| Idiomas soportados | no disponible; los ejemplos de la model card usan la instruccion en ingles ("turn the page of the notebook") |
| Licencia | MIT |
| Formato de pesos | PyTorch `state_dict` (`final_model/pytorch_model.pt`), bf16 y fp32 mezclados; no se publican GGUF ni safetensors |
| Tamano del repositorio | 9,5 GB |
| Entrada de estado | 17 numeros: `waist` 3 + `left_arm` 7 + `right_arm` 7, normalizados q99 |
| Salida de accion | (B, 30, 27) en [-1, 1], 30 pasos a 60 fps, todos absolutos |
| Tarea | pasar la pagina de un cuaderno (mano izquierda) |

## Arquitectura y entrenamiento

El modelo sigue el patron VLA de dos torres: una interfaz vision-lenguaje que codifica la imagen de cabeza y la instruccion de lenguaje, y una cabeza de accion implementada como diffusion transformer que genera la secuencia de acciones futuras. La interfaz se corresponde con `nvidia/Cosmos-Reason2-2B` (necesaria tambien en inferencia, ya que aporta arquitectura y procesador), mientras que la cabeza de accion se entrena desde cero o se inicializa dentro del framework. La reimplementacion en starVLA sustituye la logica original de Isaac-GR00T, y su carga depende por completo del fichero `config.full.yaml`, que dirige `build_framework()`.

El entrenamiento se realizo durante 10.000 pasos de optimizador en una unica GPU B200, con warm start desde nvidia/GR00T-N1.7-3B. El dataset `birbirll/g1-inspire-turn-page-v21` contiene 38 episodios, 20.990 fotogramas a 60 fps, con una sola camara de cabeza de 1280x720 (redimensionada internamente a 256x256) y la mano izquierda ejecutando la tarea. No se documenta el uso de RLHF, DPO ni ninguna otra fase de alineamiento, y el entrenador no guarda estado de optimizador, scheduler ni generador aleatorio, por lo que el entrenamiento no se puede reanudar desde los checkpoints publicados. El horizonte de prediccion es de 0,5 s (30 pasos a 60 fps) y las acciones son absolutas, no incrementales.

Una peculiaridad tecnica destacable es el esquema de normalizacion por grupo: las articulaciones (brazos, altura de raiz, velocidades y cintura) se normalizan con cuantiles q99, mientras que los seis registros de la mano izquierda usan min-max porque son valores crudos de 0 a 1000 en los que cuatro de las seis dimensiones tienen `q01 == q99` y la formula q99 quedaria indefinida.

## Capacidades

- Generacion de acciones de manipulacion: produce trayectorias absolutas de 30 pasos a 60 fps para 27 dimensiones de control (brazos izquierdo y derecho, mano izquierda, altura y velocidades de raiz, y cintura).
- Condicionamiento por lenguaje: acepta una instruccion textual junto con la imagen (el ejemplo oficial usa "turn the page of the notebook").
- Percepcion visual monocula: consume una unica imagen de cabeza de 1280x720, redimensionada a 256x256.
- Tarea especializada: pasar la pagina de un cuaderno con la mano izquierda sobre un Unitree G1 de 29 DoF con manos Inspire RH56DFTP.
- No hay soporte documentado de tool calling, function calling, agentes ni razonamiento multi-paso.
- No hay capacidades de thinking mode, audio ni vision generalista mas alla del uso como politica.
- Cobertura parcial del cuerpo: los 27 canales de salida no incluyen las piernas, el balanceo o cabeceo de la raiz, la mano derecha ni el cuello.
- Multilingue: no documentado; la instruccion de ejemplo esta en ingles.

## Casos de uso

- Linea base de investigacion en VLA: sirve como referencia reproducible de GR00T-N1.7 bajo starVLA para comparar la misma tarea contra Isaac-GR00T N1.6 y pi0.5 usando exactamente el mismo dataset y contrato de interfaz.
- Validacion de pipelines de inferencia VLA: al requerir `config.full.yaml` y `dataset_statistics.json` para cargar y desnormalizar, es util para verificar integraciones del framework starVLA antes de escalar a otros checkpoints.
- Punto de partida para fine-tuning: sus pesos pueden actuar como inicializacion para nuevas tareas de manipulacion con manos Inspire sobre el G1, dado que ya cubre los grupos de articulaciones de brazos, cintura y mano izquierda.
- Estudio de esquemas de normalizacion: el uso mixto de q99 y min-max por grupo permite analizar empiricamente como afecta cada esquema a la salida de una politica de difusion.
- Investigacion en control de manos antropomorficas: el modelo expone los registros crudos de la mano Inspire (0-1000), lo que permite estudiar el mapeo entre espacios de accion normalizados y registros de hardware.
- Pruebas de horizonte corto: con 0,5 s de prediccion a 60 fps, es adecuado para experimentos de control reactivo que evaluen la estabilidad de acciones absolutas en horizontes cortos.
- Docencia y divulgacion tecnica: al ser un modelo pequeno (aproximadamente 3,46 B) con licencia MIT y repo de 9,5 GB, resulta manejable para reproducir un flujo completo de VLA en un laboratorio.
- Advertencia transversal: ninguno de estos casos deberia desplegarse en un robot fisico sin evaluacion previa, ya que el propio autor indica que el modelo no ha sido validado ni en simulador ni en hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explicitamente el estado como "not evaluated": no existe split de validacion, ni puntuacion de replay en bucle abierto, ni resultado en simulador ni en robot, y el fragmento de inferencia incluido nunca se ha ejecutado contra este checkpoint. Las unicas cifras disponibles son metricas de entrenamiento, no de evaluacion:

| Metrica | Valor | Naturaleza |
|---|---|---|
| `action_dit_loss` final | 0,014616 | Perdida de entrenamiento, 10.000 pasos, una B200 |
| `mse_score` registrado en logs | 0,00063 | Calculado sobre el dataloader de entrenamiento (`eval_action_model()` no usa datos retenidos) |
| Episodios de entrenamiento | 38 (20.990 fotogramas, 60 fps) | Etiquetados como exitosos por el grabador, nunca revisados |

## Requisitos de hardware

- Parametros: aproximadamente 3,46 B, lo que situa los pesos en torno a 7 GB en bf16; el repo completo ocupa 9,5 GB.
- VRAM estimada para inferencia: del orden de 8 a 12 GB considerando pesos, activaciones del VLM a 256x256 y overhead del runtime de PyTorch (estimacion orientativa, no publicada por el autor).
- GPU de entrenamiento documentada: una unica NVIDIA B200 para 10.000 pasos de optimizador.
- GPU recomendadas para inferencia: cualquier tarjeta con 16 GB o mas; cabe en consumer GPU de gama alta como RTX 4090, RTX 3090 o RTX 4080. A100 y H100 sobran para esta carga.
- Despliegue: la via soportada es el framework starVLA (`build_framework()` a partir de `config.full.yaml`) sobre PyTorch, con carga manual del `state_dict` en `final_model/pytorch_model.pt`. No hay soporte publicado de vLLM, llama.cpp, Ollama ni TGI.
- Dependencia externa: la inferencia requiere `nvidia/Cosmos-Reason2-2B`, que es un repositorio gated con autoaprobacion y exige `hf auth login` y aceptar la licencia. `nvidia/GR00T-N1.7-3B` solo se necesita para entrenamiento.
- Ficheros obligatorios en tiempo de ejecucion: `config.full.yaml` y `dataset_statistics.json`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Datos de entrenamiento | Licencia | Estado de evaluacion |
|---|---|---|---|---|---|
| birbirll/g1-inspire-turn-page-starvla-n1d7 | 3,46 B | no disponible | 38 episodios, 20.990 fotogramas, 60 fps | MIT | No evaluado |
| birbirll/g1-inspire-turn-page-n16 (Isaac-GR00T N1.6) | no disponible | no disponible | Mismo dataset y contrato, segun el autor | no disponible | no disponible |
| birbirll/g1-inspire-turn-page-pi05 (pi0.5) | no disponible | no disponible | Mismo dataset y contrato, segun el autor | no disponible | no disponible |
| nvidia/GR00T-N1.7-3B (modelo base) | 3 B (segun denominacion) | no disponible | no disponible | no disponible | no disponible |
| nvidia/Cosmos-Reason2-2B (backbone VLM) | 2 B (segun denominacion) | no disponible | no disponible | no disponible (repositorio gated) | no disponible |

## Limitaciones y advertencias

- Modelo no evaluado: no hay validacion retenida, replay en bucle abierto, simulacion ni prueba en robot. El autor lo declara explicitamente en la model card.
- Metricas enganosas si se leen fuera de contexto: `action_dit_loss` y `mse_score` se calculan sobre el propio conjunto de entrenamiento, no sobre datos retenidos.
- Calidad del dataset no verificada: los 38 episodios estan etiquetados como exitosos por el grabador y nunca se revisaron; en una captura hermana del mismo montaje, solo 29 de 41 episodios resultaron validos al comprobarlos.
- Salida de mano practicamente constante: en las estadisticas del propio run, las dimensiones 14 a 17 (pinky, ring, middle, index) tienen `min == max == 1000.0`, y solo pulgar (891,8-1000) y rotacion de pulgar (478,2-1000) varian. Esto limita seriamente la expresividad de la mano izquierda.
- Cobertura corporal parcial: los 27 canales no incluyen piernas, balanceo ni cabeceo de raiz, mano derecha ni cuello, de modo que no puede controlar el equilibrio ni el cuerpo completo.
- Dependencia fragil de carga: la inferencia exige `config.full.yaml` y `dataset_statistics.json`; sin ellos no es posible ni construir el modelo ni desnormalizar las acciones.
- Repositorio gated: el backbone `nvidia/Cosmos-Reason2-2B` requiere autenticacion y aceptacion de licencia, lo que condiciona su uso automatizado.
- Entrenamiento no reanudable: el entrenador no guarda estado de optimizador, scheduler ni RNG, y los checkpoints intermedios no se publican.
- Sesgos: no documentados, pero al derivar de un unico dataset de 38 episodios de un montaje concreto, su generalizacion a otras camaras, iluminaciones, robots o tareas es altamente dudosa.
- Riesgo de alucinacion de acciones: al ser una politica, no "alucina" texto pero puede generar trayectorias plausibles no validas fisicamente; la ausencia de verificacion en hardware agrava el riesgo.
- Licencia MIT: permite uso comercial del artefacto, pero dicha licencia no cubre las condiciones del backbone gated de NVIDIA ni de los datos, que deben revisarse por separado.
- No apto para produccion sin una evaluacion exhaustiva previa en simulador y en robot real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/birbirll/g1-inspire-turn-page-starvla-n1d7
- Dataset de entrenamiento: https://huggingface.co/datasets/birbirll/g1-inspire-turn-page-v21
- Framework starVLA: https://github.com/LidarDexManip/starVLA
- Modelo base (warm start de entrenamiento): https://huggingface.co/nvidia/GR00T-N1.7-3B
- Backbone VLM requerido en inferencia (gated): https://huggingface.co/nvidia/Cosmos-Reason2-2B
- Hermano con Isaac-GR00T N1.6: https://huggingface.co/birbirll/g1-inspire-turn-page-n16
- Hermano con pi0.5: https://huggingface.co/birbirll/g1-inspire-turn-page-pi05
- Resultados de busqueda web: no se ha encontrado ningun enlace relevante al modelo; las consultas devolvieron unicamente paginas de soporte de un proveedor de banda ancha sin relacion con el proyecto.
