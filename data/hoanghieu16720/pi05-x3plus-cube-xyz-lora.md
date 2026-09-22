# hoanghieu16720/pi05-x3plus-cube-xyz-lora

## Resumen

pi05-x3plus-cube-xyz-lora es un fine-tune mediante LoRA del modelo base pi0.5 de openpi, desarrollado por el usuario hoanghieu16720, orientado a control robotico. En concreto, adapta el modelo para un brazo Yahboom X3Plus de 6 grados de libertad equipado con dos camaras RGB, con el objetivo de ejecutar una unica tarea: "pick up the red cube and put it in the bowl" (coger el cubo rojo y dejarlo en el bol). El resultado es una politica visio-lenguaje-accion (VLA) que recibe dos imagenes y el estado de las articulaciones y devuelve una secuencia de acciones.

El modelo parte de los pesos pi05_base de openpi y anade dos adaptadores LoRA: uno sobre el backbone VLM (gemma_2b_lora) y otro sobre el experto de acciones (gemma_300m_lora). Se entreno sobre 63 episodios y 16.588 fotogramas a 20 fps de una sola tarea y una sola escena, usando 1 GPU RTX 5090 durante unas 5,5 horas. El checkpoint publicado corresponde al paso 12.000 y contiene unicamente los parametros (base mas LoRA fusionada), sin estado del optimizador, por lo que esta pensado para inferencia y no para reanudar el entrenamiento.

Su relevancia es acotada y muy especifica: sirve como ejemplo reproducible de como adaptar un modelo fundacional de robotica a un brazo de bajo coste con recursos consumer. No es un modelo de proposito general ni un LLM: es una politica de control entrenada para una tarea, una escena y una colocacion de camaras concretas, y el propio autor advierte de que la perdida de entrenamiento baja no demuestra generalizacion por si sola.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en detalle; fine-tune LoRA de pi0.5 (openpi) con adaptador gemma_2b_lora sobre el VLM y gemma_300m_lora sobre el experto de acciones |
| Parametros totales | no disponible; el checkpoint fusionado ocupa 6,0 GB en `params/` |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio distribuye un checkpoint Orbax, no versiones cuantizadas) |
| Idiomas soportados | no disponible; las instrucciones de la model card estan en ingles |
| Licencia | no disponible; derivado de los pesos pi05_base de openpi, se debe consultar la licencia upstream antes de redistribuir |
| Formato de pesos | Orbax checkpoint (`params/`, 6,0 GB); `train_config.py.txt` con la configuracion de entrenamiento; `assets/x3plus/cube_xyz/norm_stats.json` |

## Arquitectura y entrenamiento

Se trata de un fine-tune LoRA del modelo fundacional pi0.5 de openpi para una tarea robotica concreta. Segun la model card, los pesos base son `pi05_base` y se anaden dos adaptadores: `gemma_2b_lora` sobre el componente de vision-lenguaje y `gemma_300m_lora` sobre el experto de acciones. El horizonte de accion es de 10 pasos y la entrada de estado es discreta. Las imagenes se redimensionan a 320x240 durante el entrenamiento. La observacion consta de una imagen de la camara base (Astra), una imagen de una camara de muneca USB y un vector de estado `float32[6]` con 5 articulaciones mas la pinza; la salida es un bloque de acciones `float32[10, 6]`.

El entrenamiento uso 63 episodios (16.588 fotogramas a 20 fps) de una unica tarea, con batch size 16, lo que supone unas 11,6 epocas en el paso 12.000. El optimizador fue AdamW con recorte de gradiente a 1,0 y sin EMA, con un schedule coseno: warmup de 1.000 pasos hasta un pico de 2,5e-5, descenso a 2,5e-6 en el paso 6.000 y valor constante despues. Todo el entrenamiento se ejecuto en una sola RTX 5090 a ~1,5 s por paso, unas 5,5 horas en total. No se documento ninguna innovacion tecnica adicional mas alla del propio esquema de adaptacion LoRA sobre el modelo base, ni se menciona uso de RLHF o DPO, que no serian aplicables a este tipo de politica.

## Capacidades

- Generacion de acciones roboticas: produce bloques de 10 acciones de 6 grados de libertad (5 articulaciones mas pinza) a partir de observaciones visuales y de estado.
- Control visio-lenguaje-accion condicionado por texto: la tarea se especifica mediante un prompt en lenguaje natural (en el ejemplo, "pick up the red cube and put it in the bowl").
- Percepcion multimodal con dos camaras: procesa simultaneamente una imagen de camara base y una imagen de camara de muneca.
- Control continuo de pinza: el canal de pinza es continuo en el rango [0, 1], donde valores superiores a 0,5 indican pinza cerrada.
- Inferencia con normalizacion integrada: el fichero `norm_stats.json` aporta las estadisticas de normalizacion de estado y accion necesarias en tiempo de inferencia.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues; no aplica en el contexto de una politica robotica de tarea unica.

## Casos de uso

- Manipulacion pick-and-place sobre el Yahboom X3Plus: el modelo ejecuta la tarea concreta de recoger un cubo rojo y depositarlo en un bol, que es exactamente la tarea sobre la que fue entrenado.
- Banco de pruebas docente o de laboratorio: sirve para ilustrar el flujo completo de openpi (descarga de checkpoint, registro de config, inferencia con `policy.infer`) sobre hardware de bajo coste.
- Punto de partida para nuevos fine-tunes: al ser un LoRA sobre pi0.5, puede reutilizarse como inicializacion para otras tareas del mismo brazo, sustituyendo el dataset.
- Validacion de pipelines LeRobot: el modelo esta asociado a un dataset en formato LeRobot (`hoanghieu16720/x3plus-cube-xyz`), por lo que es util para probar la integracion entre captura de datos, entrenamiento e inferencia.
- Demostraciones de robotica con recursos consumer: todo el entrenamiento documento caber en una sola RTX 5090, lo que lo hace adecuado para replicar el experimento en un laboratorio pequeno.
- Evaluacion de sensibilidad a la colocacion de camaras: dado que se entreno con una unica disposicion de camaras, es un caso practico para medir cuanto degrada el rendimiento al mover la camara.
- No es adecuado como componente de atencion al cliente, generacion de codigo ni ninguna tarea de lenguaje general: su salida son acciones motoras de 6 dimensiones, no texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no reporta MMLU, HumanEval, GSM8K ni ninguna metrica estandar, que por otra parte no aplican a una politica de control robotico. El unico dato cuantitativo publicado es la perdida de entrenamiento:

| Metrica | Valor |
|---|---|
| Perdida inicial | 0,109 |
| Perdida final (paso 12.000) | 0,0034 |
| Tendencia en los ultimos 3.000 pasos | -1,35 % por 1.000 pasos, IC 95 % [-1,25; 3,89] |
| Epocas sobre el dataset | 11,6 |
| Tiempo por paso | ~1,5 s en 1x RTX 5090 |
| Duracion total del entrenamiento | ~5,5 h |

El autor indica explicitamente que no existe split de validacion y que la perdida reportada es perdida de entrenamiento sobre 63 episodios de una sola tarea, una sola escena y una sola colocacion de camara, vistos unas 11,6 veces. Por tanto, no debe interpretarse como evidencia de generalizacion.

## Requisitos de hardware

- VRAM para inferencia: no disponible; el autor no publica cifras. Como referencia, el checkpoint fusionado ocupa 6,0 GB en `params/`, por lo que la carga de pesos requiere al menos ese orden de magnitud de memoria, mas el espacio para activaciones y buffers de las dos camaras.
- GPU empleada en entrenamiento: 1x RTX 5090, con ~1,5 s por paso y un total de ~5,5 horas para 13.000 pasos.
- Cabe en GPU consumer: si, el entrenamiento se realizo integramente en una RTX 5090, que es una GPU de gama consumer de alta gama. No hay confirmacion del autor sobre otras GPUs de gama menor.
- Opciones de despliegue: el modelo usa la libreria `openpi` (Physical Intelligence). Requiere registrar una configuracion `pi05_x3plus_xyz` que defina `X3PlusInputs`/`X3PlusOutputs` y `LeRobotX3PlusDataConfig`, tal como aparece en `train_config.py.txt`. La carga se hace con `policy_config.create_trained_policy`.
- Runtimes no aplicables: vLLM, llama.cpp, Ollama y TGI estan orientados a modelos de lenguaje y no se mencionan como opciones de despliegue para este checkpoint.
- Latencia y throughput de inferencia en el robot: no disponibles.
- Hardware fisico necesario: brazo Yahboom X3Plus de 6 grados de libertad, una camara base (Astra) y una camara de muneca USB.

## Comparativa con modelos similares

| Modelo | Relacion | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05-x3plus-cube-xyz-lora (este modelo) | Fine-tune LoRA de tarea unica para X3Plus | no disponible (checkpoint de 6,0 GB) | no disponible | no disponible (deriva de openpi) | HuggingFace, 0 descargas |
| pi0.5 base (`pi05_base`, openpi) | Modelo base sobre el que se aplica el LoRA | no disponible | no disponible | consultar licencia upstream de openpi | Publico a traves de openpi |
| Otros fine-tunes de pi0.5 | Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre este fine-tune y los pesos base, ya que el autor no publica evaluaciones en el robot real ni sobre el modelo sin adaptar.

## Limitaciones y advertencias

- Tarea unica: el modelo solo fue entrenado para "pick up the red cube and put it in the bowl"; no se documenta ninguna otra tarea.
- Sin split de validacion: no existe conjunto de validacion, por lo que no hay ninguna medida de generalizacion publicada.
- Riesgo elevado de sobreajuste: 63 episodios vistos unas 11,6 veces, con una sola escena y una sola colocacion de camaras. La perdida de entrenamiento de 0,0034 no implica buen comportamiento fuera de esa configuracion.
- Checkpoint de solo inferencia: `train_state/` (estado del optimizador) no esta incluido, por lo que no se puede reanudar el entrenamiento desde este repositorio.
- Dependencia de configuracion externa: para usarlo hay que registrar manualmente la configuracion `pi05_x3plus_xyz` en openpi; no funciona con una instalacion estandar sin ese paso.
- Dependencia de `norm_stats.json`: las estadisticas de normalizacion son obligatorias en inferencia; omitirlas produce acciones incorrectas.
- Ambiguedad de licencia: la model card remite a la licencia upstream de openpi y no declara una licencia propia, lo que supone un riesgo para uso comercial o redistribucion sin revisar los terminos de Physical Intelligence.
- Idiomas: no se documenta soporte multilingue; los prompts de la model card estan en ingles y no hay evidencia de que otros idiomas funcionen.
- Sesgos: no se documentan sesgos especificos, pero al entrenarse en una unica escena y disposicion de camaras hereda cualquier sesgo de iluminacion, color, fondo u objetos presente en esos 63 episodios.
- Sin validacion de la comunidad: el repositorio registra 0 descargas y 0 likes, por lo que no hay evidencia externa de reproducibilidad ni de calidad del checkpoint.
- Ambito de aplicacion: es una politica robotica, no un modelo de lenguaje; no debe emplearse para generacion de texto, codigo ni razonamiento.
- Rendimiento en produccion: no se han publicado latencias, tasas de exito ni pruebas de robustez, por lo que no se recomienda su uso en entornos de produccion sin una evaluacion exhaustiva en el robot real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hoanghieu16720/pi05-x3plus-cube-xyz-lora
- Dataset asociado: https://huggingface.co/datasets/hoanghieu16720/x3plus-cube-xyz
- Repositorio de openpi (Physical Intelligence): https://github.com/Physical-Intelligence/openpi
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo, papers, blogs ni demos; las busquedas devolvieron unicamente paginas de soporte de Microsoft sin relacion con el modelo.
