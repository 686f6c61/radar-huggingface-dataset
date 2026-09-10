# minsonganingee/omnivla-edge-rides11-odom-20m-20260910

## Resumen

OmniVLA-Edge-Odom (variante de odometria de 3 canales) es un modelo de vision-lenguaje-accion (VLA) orientado a navegacion robotica autonoma. Se trata de un fine-tune del checkpoint base `omnivla-edge-odom3ch.pth` sobre el dataset `rides_11` de FrodoBots, publicado por el usuario `minsonganingee` en HuggingFace bajo licencia MIT. El modelo consume observaciones de camara mas un mapa ego centrado en el robot derivado de OSM y produce trayectorias de waypoints para el control de navegacion.

La relevancia de esta publicacion es acotada pero concreta: es un checkpoint de investigacion que documenta una mejora medible del error de desplazamiento tras el ajuste fino. Segun la model card, el ADE en el conjunto de test pasa de 2,10 m (modelo base) a 0,49 m (mejor checkpoint), lo que supone una mejora aproximada de 4,3 veces. El horizonte de prediccion es de 8 waypoints, equivalentes a unos 5 m con un stride temporal de 0,7 s.

No se dispone de informacion sobre el numero de parametros, la longitud de contexto, los idiomas soportados ni el regimen de cuantizacion. El repositorio ocupa 4,1 GB e incluye un checkpoint de pesos (`best.pth`, 434 MB) y cuatro checkpoints completos con estado de optimizador y scheduler (912 MB cada uno). El modelo tiene 0 descargas y 0 likes en el momento de redactar esta ficha, por lo que se trata de una publicacion reciente y sin validacion externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-accion (VLA) para navegacion robotica; encoder de camara, encoder de mapa y decoder transformer con predictor de acciones |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuyen checkpoints en precision original, formato `.pth`) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pth`); `best.pth` solo pesos, checkpoints por epoca con estado de optimizador y scheduler |

## Arquitectura y entrenamiento

El modelo sigue un esquema VLA aplicado a navegacion: un encoder de camara procesa la observacion visual, un encoder de mapa procesa un mapa ego derivado de OSM y un decoder transformer, junto con un predictor de acciones, genera los waypoints de trayectoria. La estrategia de congelacion aplicada en el fine-tune es parcial: se congela unicamente el `obs_encoder` de camara, mientras que el encoder de mapa, el decoder transformer y el predictor de acciones se entrenan. Esto indica que el ajuste se concentra en la interpretacion del mapa y en la generacion de trayectorias, manteniendo fija la representacion visual aprendida en el modelo base.

El mapa ego emplea un anclaje asimetrico: 20 m hacia delante y 7 m hacia atras, lo que cubre un cuadrado total de 27 x 27 m con zoom 19 sobre el mapa OSM. El horizonte de prediccion es de 8 waypoints que cubren aproximadamente 5 m, con un stride de 0,7 s entre waypoints. El entrenamiento se realizo sobre el dataset `rides_11` de FrodoBots, con 331 episodios, 538 segmentos y 419.478 muestras validas, divididas por grupos de episodio en 267 episodios de entrenamiento, 33 de validacion y 31 de test. Se ejecutaron 20 epocas. El mejor resultado por `val_loss` se obtuvo en la epoca 9 (`val_loss` 2,0235; ADE 0,492 m; FDE 0,849 m), mientras que el checkpoint final de la epoca 20 presenta `val_loss` 2,1203, ADE 0,511 m y FDE 0,880 m, es decir, un ligero sobreajuste respecto al mejor checkpoint. No se documentan fases de RLHF o DPO, ni la composicion detallada del dataset o el numero de tokens de entrenamiento.

Es importante senalar que la model card advierte de una incompatibilidad con los checkpoints anteriores al 2026-09-05: la convencion de escala del mapa cambio de un esquema simetrico de semianchura a un esquema asimetrico basado en alcance frontal. Cualquier integracion que reutilice codigo antiguo debe adaptar esta convencion.

## Capacidades

- Navegacion robotica autonoma basada en vision: genera trayectorias de waypoints a partir de observaciones de camara.
- Fusion de mapa y percepcion: integra un mapa ego derivado de OSM con la observacion visual en un unico espacio de representacion.
- Prediccion de trayectoria a corto horizonte: 8 waypoints equivalentes a unos 5 m con stride de 0,7 s.
- Navegacion con odometria de 3 canales como entrada adicional.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada; el modelo es un predictor de acciones, no un agente conversacional.
- Capacidades multilingues: no aplica / no disponible.
- Capacidad especial: modo de razonamiento explicito, vision o audio mas alla del encoder de camara; no disponible.

## Casos de uso

- Navegacion de robots moviles en interiores y entorno urbano controlado: el modelo traduce la observacion de camara y el mapa local en waypoints ejecutables por el controlador de bajo nivel. Es adecuado porque el error de desplazamiento medido (ADE 0,492 m) es del orden del metro, compatible con navegacion no critica.
- Robots de reparto de ultima milla: con un horizonte de 8 waypoints y unos 5 m por prediccion, el modelo encaja en el bucle de planificacion local de un robot de reparto que replantea continuamente su trayectoria con soporte de mapa OSM.
- Robots de limpieza o vigilancia con rutas repetitivas: el fine-tune sobre el dataset `rides_11` y el anclaje asimetrico del mapa (mas alcance frontal que trasero) favorecen el seguimiento de rutas hacia delante.
- Investigacion en modelos VLA para robotica: sirve como punto de partida reproducible para comparar estrategias de congelacion parcial de encoders en tareas de navegacion.
- Destilacion o ajuste sobre datos propios: al distribuirse con licencia MIT y en formato PyTorch, puede reentrenarse sobre un dataset propio de episodios de navegacion con la misma estructura de mapa.
- Evaluacion de convenciones de mapa ego: util para estudiar el efecto del anclaje asimetrico (20 m frontal / 7 m trasero) frente a esquemas simetricos en el error de trayectoria.
- Reanudacion de entrenamiento: los checkpoints `epoch_005/010/015/020.pth` incluyen estado de optimizador y scheduler, lo que permite continuar el fine-tune sin reiniciar el regimen de aprendizaje.
- Validacion en simulacion antes de despliegue fisico: el modelo puede integrarse en un simulador de robotica para medir ADE/FDE antes de transferir a hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, dado que se trata de un modelo de robotica y no de lenguaje. Los unicos datos de rendimiento son las metricas de error de trayectoria declaradas en la model card:

| Checkpoint | Epoca | val_loss | ADE | FDE |
|---|---|---|---|---|
| best.pth | 9 | 2,0235 | 0,492 m | 0,849 m |
| epoch_020.pth | 20 (final) | 2,1203 | 0,511 m | 0,880 m |

Comparacion con el modelo base declarada por el autor: mejora aproximada de 4,3 veces en ADE sobre el conjunto de test (de 2,10 m a 0,49 m). No se proporcionan resultados desagregados por escenario ni intervalos de confianza.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, el checkpoint de pesos pesa 434 MB, por lo que la inferencia en precision original deberia caber holgadamente en GPUs consumer, aunque la VRAM real depende del encoder de camara y del encoder de mapa, cuyos tamanos no se especifican.
- GPU recomendadas: no disponible. Para reentrenamiento, los checkpoints completos de 912 MB y un dataset de 419.478 muestras sugieren que una GPU consumer de gama alta o una GPU de centro de datos de gama media podrian ser suficientes, pero no hay datos publicados.
- Cabe en GPU consumer: probablemente si, dado el tamano del checkpoint (434 MB solo pesos), aunque no confirmado por el autor.
- Opciones de despliegue: no disponibles. Al ser un modelo de robotica en formato PyTorch (`.pth`), no se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de informacion en la busqueda realizada sobre modelos comparables de la misma categoria (VLA de navegacion). La unica referencia directa es el checkpoint base del que deriva este fine-tune, del cual solo se conoce el ADE de test declarado por el autor:

| Modelo | Parametros | Contexto | ADE (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| omnivla-edge-rides11-odom-20m-20260910 | no disponible | no disponible | 0,492 m | MIT | HuggingFace |
| omnivla-edge-odom3ch (base) | no disponible | no disponible | 2,10 m | no disponible | no disponible |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor. El modelo se entrena con el dataset `rides_11` de FrodoBots, por lo que puede heredar los sesgos de entorno, geografia y condiciones de captura de ese dataset.
- Riesgo de alucinacion: en modelos de prediccion de trayectoria, el equivalente es generar waypoints no ejecutables o inconsistentes con la escena; no se documentan analisis de fallos ni tasas de error en casos limite.
- Sobreajuste: el checkpoint final (epoca 20) presenta peor `val_loss`, ADE y FDE que el mejor checkpoint (epoca 9), lo que indica que entrenar mas alla de la epoca 9 degrada el rendimiento. Se recomienda usar `best.pth` para inferencia y despliegue.
- Incompatibilidad de versiones: los checkpoints anteriores al 2026-09-05 usan una convencion de escala de mapa simetrica (semianchura), incompatible con la convencion asimetrica actual. Mezclar ambos puede producir trayectorias incorrectas.
- Limitaciones de contexto e idioma: la longitud de contexto no esta definida y el modelo no es un modelo de lenguaje conversacional; no aplica soporte multilingue en el sentido habitual.
- Restricciones de licencia: licencia MIT, que permite uso comercial, modificacion y redistribucion siempre que se conserve el aviso de copyright y la licencia. No obstante, el dataset de entrenamiento `rides_11` de FrodoBots puede tener condiciones propias que conviene verificar antes de un uso comercial.
- Validacion limitada: 0 descargas y 0 likes en HuggingFace, sin evaluacion independiente ni replicacion por terceros. Las metricas de ADE/FDE provienen unicamente del autor.
- Generalizacion: el modelo es un fine-tune especifico del dataset `rides_11`; su comportamiento fuera de esa distribucion de entornos no esta caracterizado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/minsonganingee/omnivla-edge-rides11-odom-20m-20260910
- Paper: no disponible
- Blog o articulo tecnico: no disponible
- Repositorio de codigo: no disponible
- Demo: no disponible
- Dataset `rides_11` de FrodoBots: no disponible como enlace directo en la informacion proporcionada
- Resultados de busqueda web: las consultas realizadas no devolvieron enlaces relevantes sobre este modelo ni sobre modelos VLA de navegacion comparables
