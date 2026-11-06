# helen9975/pi05_telearms_v6_lora

## Resumen

`pi05_telearms_v6_lora` es un ajuste fino mediante LoRA del modelo fundacional de robotica π₀.₅ (`lerobot/pi05_base`) para una tarea concreta de manipulacion bimanual: colocar un objeto rojo a la izquierda de uno azul ("Red Left Of Blue Placement") sobre un robot YAM simulado. Lo publica el usuario `helen9975` dentro del ecosistema LeRobot, y el resultado se ha fusionado en un unico `model.safetensors` de 4.143.404.816 parametros (unos 4,14 mil millones), de modo que se carga como un checkpoint convencional sin necesidad de aplicar los adaptadores por separado.

El interes de esta ficha no esta en el rendimiento bruto (el autor declara explicitamente que el modelo **no ha sido evaluado en simulacion**), sino en que documenta con un nivel de detalle poco habitual un flujo completo de posentrenamiento de un modelo vision-language-action (VLA): dataset con domain randomization, configuracion LoRA, hiperparametros, incidencias de entrenamiento y riesgos conocidos de los datos. Para desarrolladores e investigadores que quieran replicar un pipeline de fine-tuning de π₀.₅ en LeRobot, es una referencia util y honesta sobre lo que funciona y lo que queda por validar.

Se trata, por tanto, de un artefacto de investigacion especializado en robotica, no de un modelo de proposito general: no esta pensado para generacion de texto, codigo ni conversacion, y su licencia no esta declarada en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA basada en π₀.₅ (PaliGemma como modelo de lenguaje + experto Gemma para acciones, con SigLIP como encoder visual congelado) |
| Parametros totales | 4.143.404.816 (~4,14 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente bf16/fp32; no se documentan variantes GGUF ni cuantizadas) |
| Idiomas soportados | no disponible (las instrucciones de tarea se introducen como prompt de texto; el dataset usa variantes de prompt por tarea) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model.safetensors`, fusionado) |

## Arquitectura y entrenamiento

El modelo parte de π₀.₅ (`lerobot/pi05_base`), un VLA que combina un backbone vision-language de tipo PaliGemma (encoder visual SigLIP mas un modelo de lenguaje Gemma) con un "experto" de acciones que genera las trayectorias motoras. Sobre esa base se aplico un ajuste LoRA con r=128 y alpha=128 en las capas del modelo de lenguaje PaliGemma y del experto Gemma, mientras que `action_in_proj`, `action_out_proj`, `time_mlp_in` y `time_mlp_out` se entrenaron a peso completo y el encoder SigLIP permanecio congelado. Los adaptadores se fusionaron posteriormente en un unico checkpoint completo.

El entrenamiento uso el dataset `albagon/telearms-yam-red-left-blue-v6-rig-dr-v7-tar` (revision `b86b47af`): 9.842 episodios derivados de 4.921 demos, 4.075.628 frames a 30 Hz con perfil de domain randomization "rig DR profile 7". Tras descartar 8 episodios por el filtro de longitud/movimiento y reservar 994 para validacion, quedaron 3.665.336 frames de entrenamiento, de los que la ejecucion consumio el 50,0 %. Se realizaron 28.636 pasos con batch 16 por GPU en 4 x A100 80 GB (batch global 64) en bf16, con LR pico de 2e-4 para adaptadores y 5e-5 para modulos completos, state dropout 0,3, ruido de estado 0,05, aumento de imagen activado y variantes de prompt por tarea. La perdida de entrenamiento al final fue de aproximadamente 0,032, con perdida de validacion entre 0,032 y 0,052 en los ultimos 3.500 pasos (ruidosa por el bajo numero de muestras de evaluacion). El trabajo se reanudo una vez desde el paso 24.344 tras una preempcion, y se verifico que todos los pesos eran finitos tras la fusion.

## Capacidades

- Control robotico bimanual: genera acciones para un robot YAM simulado en la tarea especifica de colocar un objeto rojo a la izquierda de uno azul.
- Percepcion visual: procesa imagenes de camara del entorno simulado mediante el encoder SigLIP congelado.
- Condicionamiento por instruccion en lenguaje natural: acepta variantes de prompt de tarea para guiar la politica.
- Politica visuomotora de extremo a extremo: mapea observaciones (imagenes y estado) a comandos de accion, sin planificacion simbolica intermedia.
- Robustez a variaciones visuales y de estado: entrenado con domain randomization (perfil 7), state dropout 0,3, ruido de estado 0,05 y aumento de imagen.
- No dispone de capacidades documentadas de tool calling, function calling, razonamiento multi-paso, generacion de codigo, matematicas, audio ni modo "thinking".
- Capacidades multilingues: no documentadas.

## Casos de uso

- Investigacion en manipulacion bimanual: servir como punto de partida reproducible para estudiar como se comporta π₀.₅ tras un ajuste LoRA en una tarea de colocacion espacial, comparando la politica ajustada con la base.
- Replicacion de pipelines de posentrenamiento en LeRobot: el autor documenta script, version de LeRobot (0.6.1 @ `e40b58a8`), parches y receta de hiperparametros, lo que permite reproducir el flujo en un cluster con 4 x A100 80 GB.
- Evaluacion de domain randomization: al entrenarse sobre un dataset con perfil DR 7, permite analizar la transferencia de politicas entrenadas con fuerte aleatorizacion visual a condiciones simuladas controladas.
- Benchmark interno de tareas de colocacion relacional: util como baseline para comparar nuevas politicas en la tarea "Red Left Of Blue Placement" sobre YAM simulado.
- Estudio de estrategias LoRA en VLA: la configuracion (r=128/alpha=128 en LM y experto, modulos de accion a peso completo, SigLIP congelado) sirve de referencia para experimentos sobre que componentes conviene adaptar.
- Docencia y formacion en robotica de aprendizaje: por su tamano contenido (4,14 mil millones de parametros) y su empaquetado en un unico safetensors, es manejable para laboratorios que quieran mostrar el ciclo completo datos-entrenamiento-despliegue en simulacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que el modelo **no ha sido evaluado en simulacion**. Los unicos datos cuantitativos son de entrenamiento: perdida final de entrenamiento de aproximadamente 0,032 y perdida de validacion de 0,032-0,052 en los ultimos 3.500 pasos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4,14 mil millones de parametros, en bf16/fp16 se requieren aproximadamente 8,3 GB solo para pesos; en fp32, unos 16,6 GB. Hay que sumar memoria para activaciones y buffers de imagen (no cuantificada en la informacion disponible).
- GPU de entrenamiento utilizadas: 4 x A100 80 GB (batch 16 por GPU, batch global 64, bf16, 28.636 pasos).
- GPU recomendadas para inferencia: A100 80 GB o H100 para margen comodo; una RTX 4090 (24 GB) deberia poder alojar los pesos en bf16, aunque el consumo real con activaciones no esta documentado.
- Cabe en GPU de consumo: previsiblemente si en tarjetas con 16-24 GB en bf16, siempre que el runtime de LeRobot lo permita; no confirmado por el autor.
- Opciones de despliegue: LeRobot 0.6.1 (libreria declarada). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que ademas no son el runtime natural para un VLA de robotica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `helen9975/pi05_telearms_v6_lora` | ~4,14 mil millones | no disponible | Colocacion bimanual en YAM simulado | no disponible | HuggingFace (0 descargas, 0 likes) |
| `lerobot/pi05_base` (modelo base) | no disponible en la informacion | no disponible | VLA fundacional de proposito general | no disponible | HuggingFace |
| Otros VLA de robotica (p. ej. RT-2, OpenVLA) | no disponible en la informacion | no disponible | Manipulacion robotica general | no disponible | no disponible |

La comparacion cuantitativa con alternativas no es posible con los datos proporcionados: no se dispone de benchmarks del modelo ni de especificaciones detalladas de los competidores en esta informacion.

## Limitaciones y advertencias

- **Sin evaluacion**: el autor declara que el modelo no ha sido evaluado en simulacion; no hay evidencia publicada de exito en la tarea.
- **Riesgo de datos corruptos**: el README del dataset advierte que se renderizo en una GPU con errores de bits en VRAM; la validacion comprueba archivos y filas, no pixeles, por lo que algunos frames podrian estar silenciosamente corruptos.
- **Especificidad extrema**: la politica esta ajustada a una unica tarea ("Red Left Of Blue Placement") y a un robot YAM simulado; no se espera generalizacion a otras tareas, objetos o morfologias sin reentrenamiento.
- **Licencia no declarada**: no se indica licencia, lo que impide determinar si el uso comercial esta permitido; conviene contactar con el autor antes de cualquier despliegue productivo.
- **Idiomas no documentados**: se desconoce el comportamiento ante instrucciones en castellano u otras lenguas distintas de las usadas en el dataset.
- **Receta de LR no verificada**: el propio autor senala que el escalado de la tasa de aprendizaje por sqrt(64/16) no esta verificado para LoRA.
- **Entrenamiento interrumpido**: el trabajo se reanudo desde el paso 24.344 tras una preempcion; aunque se verifico la finitud de los pesos, la continuidad exacta del entrenamiento no es trivial de garantizar.
- **Sesgos**: no documentados; al entrenarse en simulacion con un dataset concreto, puede heredar sesgos de las condiciones de renderizado y de las demos humanas.
- **Madurez**: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el 2026-11-06; es un artefacto reciente y sin validacion comunitaria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/helen9975/pi05_telearms_v6_lora
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/albagon/telearms-yam-red-left-blue-v6-rig-dr-v7-tar
- Codigo de entrenamiento: `helen9975/RoboEval-telearms`, rama `dr-rig` @ `ea3e0a2` (script `tools/training_cluster/run_lora_helen_4h100.sh`)
- LeRobot 0.6.1 @ `e40b58a8` (libreria y parche del repositorio)
