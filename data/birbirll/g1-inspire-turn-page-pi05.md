# birbirll/g1-inspire-turn-page-pi05

## Resumen

g1-inspire-turn-page-pi05 es un ajuste fino de π0.5 (Physical Intelligence) publicado por el usuario birbirll sobre la ruta de entrenamiento PyTorch de openpi. Se trata de un modelo VLA (vision-language-action) de 3.616.757.520 parametros que resuelve una tarea muy concreta: pasar la pagina de un cuaderno con un robot humanoide Unitree G1 de 29 grados de libertad equipado con manos Inspire RH56DFTP, usando una unica camara de cabeza.

El entrenamiento consistio en 20.000 pasos sobre una unica B200 con el dataset birbirll/g1-inspire-turn-page-v21 (38 episodios, 20.990 fotogramas a 60 fps, una camara de 1280x720), con una perdida final de entrenamiento de 0,0402. La salida del policy es un bloque de 30 acciones futuras (0,5 s a 60 fps) de 27 dimensiones, todas absolutas; la entrada de estado es un vector de 34 dimensiones que el modelo discretiza en tokens dentro del prompt.

Su relevancia es acotada pero util: documenta de forma reproducible como adaptar π0.5 a un manipulador humanoide concreto (incluye los cuatro parches necesarios sobre openpi) y forma parte de una familia de tres checkpoints entrenados sobre exactamente los mismos datos y el mismo contrato de despliegue de acciones. El propio autor declara que el modelo no ha sido evaluado: no hay split de validacion, ni puntuacion de replay en bucle abierto, ni resultado en simulador ni en robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer VLA derivado de π0.5: columna vertebral VLM (gemma_2b) mas experto de acciones (gemma_300m), en bf16 |
| Parametros totales | 3.616.757.520 (aproximadamente 3,62 mil millones) |
| Longitud de contexto | no disponible (la entrada es una imagen de 1280x720 reescalada a 224 mas un prompt de texto; el estado de 34 dimensiones se discretiza en 256 bins dentro del prompt) |
| Tipos de cuantizacion | no disponible; los pesos publicados estan en bf16 |
| Idiomas soportados | no disponible; el prompt por defecto esta en ingles ("turn the page of the notebook") |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (model.safetensors, 7,0 GB) mas metadata.pt con la procedencia |
| Horizonte de accion | 30 pasos (0,5 s a 60 fps); la configuracion base declara action_horizon 50 y el transform de salida trunca |
| Dimension de accion | 27 (el modelo emite 32 dimensiones con relleno y el transform trunca a 27); action_dim 32 en la configuracion base |
| Dimension de estado de entrada | 34 (29 articulaciones del cuerpo mas IMU de 5 ejes) |
| Tamano del repositorio | 7,5 GB |
| Descargas / likes | 0 / 0 |
| Fecha de publicacion | 2026-09-10 (actualizado el mismo dia) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de π0.5: un transformer con una columna vertebral de vision-lenguaje (gemma_2b) y un experto de acciones (gemma_300m), cargado en bf16. El autor fine-tunea la version convertida a PyTorch de pi05_base, no el checkpoint JAX original. La conversion se realiza con examples/convert_jax_model_to_pytorch.py y produce un config.json con action_dim 32, action_horizon 50 y el par gemma_2b + gemma_300m, junto con un model.safetensors de 7.233.650.408 bytes. El checkpoint publicado conserva esas 32 dimensiones de accion y el transform de salida las trunca a las 27 utiles.

Una particularidad tecnica relevante es el tratamiento del estado: π0.5 usa discrete_state_input=True, es decir, discretiza el estado en tokens de 256 bins que se insertan en el texto del prompt, sin proyeccion continua del estado. Por eso el modelo consume el observation.state de 34 dimensiones del dataset (29 articulaciones del cuerpo: piernas 12, waist 3, brazo izquierdo 7, brazo derecho 7, mas IMU con wx, wy, wz, roll y pitch) y no el vector de 17 dimensiones (waist mas brazos) que comparten sus hermanos. El autor advierte que, si el robot solo emite waist y brazos, hay que rellenar piernas e IMU con las medias de las norm-stats del checkpoint (no con ceros, que se discretizarian en bins centrales plausibles y mentirian al modelo).

El entrenamiento se ejecuto durante 20.000 pasos sobre una B200 con la configuracion pi05_g1_turnpage_full, con una perdida final por paso de 0,0402. El entorno documentado es Python 3.12.3, torch 2.7.1+cu128, transformers 4.53.2, lerobot 0.1.0 y numpy 1.26.4, con JAX en CPU. Es obligatorio copiar src/openpi/models_pytorch/transformers_replace/* sobre el paquete transformers instalado; de lo contrario PI0Pytorch.__init__ lanza ValueError. Los datos de entrenamiento proceden de 38 episodios (20.990 fotogramas a 60 fps, una camara de cabeza a 1280x720) y en la tarea la mano izquierda es la que trabaja; el autor indica que los episodios estan etiquetados como exitosos por el sistema de grabacion y no fueron revisados.

## Capacidades

- Generacion de acciones motoras, no de texto: emite 30 pasos futuros de 27 dimensiones absolutas (use_delta_actions=False) a 60 fps.
- Control del brazo izquierdo (7 GsL: shoulder_pitch, shoulder_roll, shoulder_yaw, elbow, wrist_roll, wrist_pitch, wrist_yaw) y del brazo derecho con el mismo orden.
- Control de la mano izquierda Inspire (6 registros en escala 0-1000, 1000 = abierto), aunque en este checkpoint solo varian thumb_bend (media 933,9) y thumb_rot.
- Control del waist en tres ejes (yaw, roll, pitch) y de la altura de la raiz (root_height) mas velocidades lineales y tasa de guirado de la raiz.
- Percepcion visual monocular desde una camara de cabeza: una imagen RGB nativa de 1280x720 reescalada internamente a 224.
- Condicionamiento por prompt de texto; el prompt por defecto es "turn the page of the notebook".
- Entrada de estado multimodal de 34 dimensiones (cuerpo mas IMU) tokenizada en 256 bins dentro del prompt.
- No cubre las piernas, el roll y pitch de la raiz, la mano derecha ni el cuello: esos grados de libertad no aparecen en las 27 salidas.
- Sin soporte de tool calling, function calling, razonamiento multi-paso, uso como agente conversacional ni generacion de lenguaje; no es un modelo de proposito general.
- Multilingue: no disponible (un unico prompt en ingles documentado).

## Casos de uso

- Pasar la pagina de un cuaderno con un Unitree G1 y manos Inspire: es el caso nominal del checkpoint. El policy recibe un fotograma de la camara de cabeza y el estado de 34 dimensiones, y devuelve 30 acciones absolutas (0,5 s) que se ejecutan a 60 fps.
- Fine-tuning sobre nuevas tareas de manipulacion con el mismo rig: al estar entrenado sobre una base π0.5 convertida a PyTorch y una configuracion nombrada (pi05_g1_turnpage_full), sirve como punto de partida para tareas que requieran control fino de brazo y mano izquierda.
- Comparativa controlada de arquitecturas VLA: los tres checkpoints del autor comparten dataset y contrato de acciones, de modo que permite aislar el efecto del backbone (π0.5 frente a Isaac-GR00T N1.6 y starVLA GR00T-N1.7) manteniendo constantes los datos.
- Investigacion sobre representacion del estado: comparar la tokenizacion discreta en 256 bins dentro del prompt frente a la proyeccion continua de estado que usan los modelos hermanos, con el mismo conjunto de datos y las mismas acciones.
- Auditoria y filtrado de datos de imitacion: ejecutar el policy en bucle abierto sobre los 20.990 fotogramas del dataset para detectar episodios anomales o mal etiquetados antes de reentrenar.
- Plantilla de integracion de openpi en PyTorch: la model card documenta los cuatro ajustes imprescindibles (variable de entorno y versiones, copia de transformers_replace, conversion de pi05_base y el transform g1_turnpage_policy.py), lo que reduce el tiempo de puesta en marcha de un rig G1 + Inspire.
- Analisis de control de manos subactuado: dado que las dimensiones 14 a 17 de la accion son constantes (q01 y q99 igual a 1000,0), el checkpoint es util para estudiar como un policy simplifica un efector complejo y para decidir que grados de libertad merece la pena etiquetar en la siguiente captura.
- Pruebas de latencia y de compilacion en un banco de robot: medir el coste real del precalentamiento con pytorch_compile_mode='max-autotune' antes de condicionar cualquier lazo de control a la latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico numero reportado por el autor es una perdida de entrenamiento final por paso de 0,0402 tras 20.000 pasos, calculada sobre el propio conjunto de entrenamiento: no hay split de validacion, ni puntuacion de replay en bucle abierto, ni resultado en simulador, ni prueba en robot real. Los 38 episodios estan etiquetados como exitosos por el sistema de grabacion y no fueron revisados (en una captura hermana del mismo rig, 29 de 41 resultaron validos). No se debe interpretar 0,0402 como una metrica de rendimiento.

## Requisitos de hardware

- VRAM de inferencia (estimacion a partir de 3.616.757.520 parametros): unos 7,2 GB solo para pesos en bf16 (3,61675752e9 x 2 bytes); con activaciones, el buffer de imagen y los artefactos de compilacion es prudente reservar 12-16 GB. Es una estimacion propia, no un dato publicado por el autor.
- Tarjetas recomendadas: el entrenamiento se hizo con una unica B200. Para inferencia, una A100 o H100 de 40/80 GB dan margen sobrado; una L40S o RTX 6000 Ada de 48 GB tambien.
- GPU de consumo: por tamano de pesos deberia caber en tarjetas de 24 GB (RTX 4090, RTX 3090, RTX 5090); en 16 GB no esta confirmado y conviene probarlo antes de comprar hardware.
- CPU: no es una opcion practica; no hay pesos en formatos ligeros y el modelo depende de torch.compile.
- Opciones de despliegue: unicamente la ruta de openpi (policy_config.create_trained_policy con la config pi05_g1_turnpage_full). No hay soporte en vLLM, llama.cpp, Ollama ni TGI, y no existe version GGUF.
- Dependencias de entorno: Python 3.12.3, torch 2.7.1+cu128, transformers 4.53.2, lerobot 0.1.0, numpy 1.26.4; es obligatorio copiar transformers_replace sobre el paquete transformers y JAX puede quedarse en CPU.
- Latencia y throughput: no publicados. La primera llamada a policy.infer compila durante minutos con max-autotune, por lo que hay que precalentar antes de medir latencia o de condicionar cualquier lazo de control.
- Almacenamiento: 7,5 GB de repositorio (model.safetensors de 7,0 GB mas norm_stats.json y metadata.pt). Los momentos AdamW (optimizer.pt, 13,5 GB) no se publicaron.

## Comparativa con modelos similares

| Modelo | Base | Parametros | Estado de entrada | Salida | Evaluacion | Licencia |
|---|---|---|---|---|---|---|
| g1-inspire-turn-page-pi05 | π0.5 (openpi, ruta PyTorch) | 3.616.757.520 | 34-D (29 articulaciones del cuerpo mas IMU de 5 ejes) | 30 pasos x 27 dims absolutas (emite 32 y trunca) | no evaluado | apache-2.0 |
| g1-inspire-turn-page-n16 | Isaac-GR00T N1.6 | no disponible | 17-D (waist mas brazos) | 27 dims, mismo contrato de acciones | no disponible | no disponible |
| g1-inspire-turn-page-starvla-n1d7 | starVLA GR00T-N1.7 | no disponible | 17-D (waist mas brazos) | 27 dims, mismo contrato de acciones | no disponible | no disponible |

Los tres checkpoints se entrenaron sobre el mismo dataset y comparten el contrato de despliegue salvo en la entrada de estado: los hermanos consumen 17 dimensiones, mientras que este modelo necesita 34 porque π0.5 tokeniza el estado dentro del prompt. No se dispone de cifras de benchmark de π0.5 base ni de los dos modelos hermanos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo no evaluado: no hay split de validacion, ni replay en bucle abierto, ni resultado en simulador ni en robot. La unica metrica es una perdida de entrenamiento sobre el propio conjunto de entrenamiento.
- Los 38 episodios estan etiquetados como exitosos por el sistema de grabacion y nunca se revisaron; en una captura hermana del mismo rig solo 29 de 41 se confirmaron, lo que sugiere una tasa de etiquetado erroneo no despreciable.
- La salida de la mano izquierda es practicamente constante: en norm_stats.json las dimensiones 14 a 17 (pinky, ring, middle, index) tienen q01 igual a q99 igual a 1000,0, y solo varian thumb_bend y thumb_rot. El modelo no controla de forma efectiva cuatro de los seis registros de la mano.
- Cobertura incompleta del robot: las 27 salidas no incluyen las piernas, el roll y pitch de la raiz, la mano derecha ni el cuello.
- Dependencia del estado completo: hay que entregar 34 numeros aunque el robot solo emita waist y brazos. Rellenar piernas e IMU con ceros produce tokens centrales plausibles y sesga silenciosamente la inferencia; la practica recomendada es usar las medias de las norm-stats del checkpoint.
- Dependencia de los norm-stats del entrenamiento: create_trained_policy los carga desde <checkpoint>/assets/<asset_id>, nunca desde el directorio de assets del usuario, por lo que el policy siempre usa las estadisticas de entrenamiento. Es obligatorio conservar esa ruta.
- Sensibilidad a la percepcion: una sola camara de cabeza a 1280x720 reescalada a 224; cualquier cambio de encuadre, iluminacion o montaje respecto al rig original queda fuera de la distribucion de entrenamiento.
- Prompt en ingles y tarea fija; no hay evidencia de generalizacion a otras tareas ni de robustez ante instrucciones distintas.
- Latencia: la primera llamada compila durante minutos con max-autotune. Sin precalentamiento, el modelo no es apto para un lazo de control.
- Licencia: los pesos se publican bajo apache-2.0, lo que en principio permite uso comercial, pero el checkpoint deriva de pi05_base de Physical Intelligence; conviene verificar los terminos de ese modelo base antes de un uso comercial.
- Sin garantias de seguridad fisica: es un modelo de investigacion sin validacion en robot, por lo que no deberia emplearse en un entorno con personas sin barreras de seguridad y limites articulares externos.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin mantenimiento posterior a la fecha de publicacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/birbirll/g1-inspire-turn-page-pi05
- Dataset de entrenamiento: https://huggingface.co/datasets/birbirll/g1-inspire-turn-page-v21
- Checkpoint hermano con Isaac-GR00T N1.6: https://huggingface.co/birbirll/g1-inspire-turn-page-n16
- Checkpoint hermano con starVLA GR00T-N1.7: https://huggingface.co/birbirll/g1-inspire-turn-page-starvla-n1d7
- Repositorio upstream de openpi: https://github.com/Physical-Intelligence/openpi
- Pesos base referenciados en la model card: gs://openpi-assets/checkpoints/pi05_base (ruta de Google Cloud Storage, no URL HTTP); la ejecucion se hizo sobre un fork de openpi con commit base 15a9616a
- Nota sobre la busqueda web: los resultados obtenidos correspondian a paginas de impresoras Canon y no guardan ninguna relacion con este modelo, por lo que no se incluyen como referencias.
