# Man1103/TurboVLA-Libero-0.22B

## Resumen

TurboVLA-Libero-0.22B es un modelo de vision-lenguaje-accion (Vision-Language-Action, VLA) publicado por el usuario Man1103 en Hugging Face, obtenido mediante ajuste fino del modelo base H-EmbodVis/TurboVLA sobre el conjunto de datos lerobot/libero. La familia TurboVLA procede de la arquitectura fundacional desarrollada por Hugging Face y los autores del articulo asociado (Hengyi Xie, Chenfei Yao, Xianjin Wu, Yingying Zhu, Dingkang Liang, Xiang Bai y Han Ding). El modelo recibe como entrada una imagen (u observacion visual) junto con una instruccion en lenguaje natural y produce directamente acciones de control, siguiendo el paradigma ImageTextToAction.

Se trata de un modelo deliberadamente ligero: el fichero de pesos safetensors declara 450.046.176 parametros (aproximadamente 0,45 mil millones), aunque el nombre del repositorio indica "0.22B". El tamano del repositorio es de 0,9 GB, lo que permite desplegarlo en GPUs de consumo e incluso en plataformas embebidas con memoria unificada. El ajuste fino se realizo sobre LIBERO, un benchmark de manipulacion robotica a largo plazo, y el script de carga incluido en la model card menciona explicitamente rollouts a 32 Hz, un dato relevante para tareas de control en tiempo real.

Su relevancia actual radica en la tendencia hacia VLA compactos y especializados: frente a modelos de 7B o mas parametros que requieren hardware de datacenter, esta variante busca ofrecer inferencia rapida y ajuste fino asequible para investigacion en robotica. La licencia Apache 2.0 y el uso del ecosistema LeRobot facilitan su reutilizacion, aunque se trata de una publicacion de comunidad con cero descargas y cero "likes" en el momento de redactar esta ficha, sin validacion externa conocida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en ViT y transformer con cabeza de prediccion de acciones (TurboVLA); detalles internos no disponibles |
| Parametros totales | 450.046.176 (~0,45B) segun los pesos safetensors; el nombre del repositorio indica 0,22B |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (no se publican variantes GGUF, AWQ, GPTQ ni FP8) |
| Idiomas soportados | Ingles (en); las instrucciones del modelo se declaran unicamente en este idioma |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (etiqueta del repositorio) y ficheros .pth, segun el script de carga de la model card |

## Arquitectura y entrenamiento

La informacion publicada describe TurboVLA como una arquitectura fundacional de tipo Vision-Language-Action, con una etiqueta explicita de ViT y "Action-Prediction". El modelo se carga mediante la clase `TurboVLAPolicy`, definida en el paquete `turbovla.models.turbovla`, que se instancia con un diccionario `model_config` leido de un fichero `config.yaml` incluido en el propio repositorio. Los pesos se almacenan en un `state_dict` de PyTorch (fichero .pth), con una clave `model_state_dict` cuando esta presente. No se detalla en la informacion disponible el numero de capas, la dimension oculta, el mecanismo de atencion, la existencia de un tokenizador de acciones (action chunking) ni el numero de tokens de contexto; tampoco se especifica si emplea decodificacion especulativa, atencion lineal u otra innovacion de eficiencia.

Respecto al entrenamiento, el unico dato confirmado es que se trata de un ajuste fino (finetune) del modelo base H-EmbodVis/TurboVLA sobre el dataset lerobot/libero, orientado a tareas de manipulacion robotica del benchmark LIBERO. No se indica el numero de tokens o episodios de entrenamiento, la composicion del dataset, la resolucion de imagen de entrada, la frecuencia de control de entrenamiento ni el uso de tecnicas de alineacion como RLHF, DPO o aprendizaje por imitacion con objetivos auxiliares. El autor tampoco documenta si se congelaron componentes del modelo base durante el ajuste.

## Capacidades

- Prediccion de acciones a partir de observacion visual e instruccion textual: el modelo mapea pares imagen + texto a comandos de accion continua o discreta para control robótico.
- Manipulacion robotica en el entorno LIBERO: ajustado especificamente sobre `lerobot/libero`, por lo que esta orientado a tareas de manipulacion con objetivos a largo plazo dentro de ese benchmark.
- Inferencia a 32 Hz: el script de la model card menciona "32Hz LIBERO rollouts", lo que apunta a una frecuencia de control compatible con bucles de control en tiempo real en simulacion.
- Modelo ligero para despliegue en hardware modesto: con ~0,45B parametros y 0,9 GB de repositorio, resulta viable en GPU de consumo y en dispositivos embebidos.
- Integracion con el ecosistema LeRobot: el uso del dataset `lerobot/libero` sugiere compatibilidad con los formatos y utilidades de LeRobot para entrenamiento y evaluacion.
- Capacidades multilingues: no disponibles; el modelo declara unicamente ingles.
- Tool calling, function calling, agentes y razonamiento multi-paso: no disponibles; no se documenta ninguna de estas capacidades, que ademas quedan fuera del proposito de un modelo de accion.
- Modo de razonamiento explicito (thinking mode), vision general, audio o generacion de texto libre: no disponibles; la unica salida documentada es la prediccion de acciones.

## Casos de uso

- Evaluacion de politicas VLA en simulacion LIBERO: el modelo se puede desplegar directamente sobre el benchmark para medir tasas de exito en tareas de manipulacion, sirviendo como referencia de un VLA de ~0,45B parametros frente a alternativas mayores.
- Ajuste fino por imitacion para tareas concretas de laboratorio: partiendo de este checkpoint, un equipo puede reentrenar sobre sus propios episodios de teleoperacion (formato LeRobot) para tareas de pick-and-place, apilado o apertura de cajones, con un coste de computo bajo.
- Prototipado en robot de bajo coste o borde: al caber en memoria de GPUs de consumo o en plataformas con memoria unificada, permite validar politicas en brazos roboticos economicos sin acceso a A100 o H100.
- Generacion de rollouts para aumento de datos: ejecutar la politica en simulacion a alta frecuencia para recolectar trayectorias que alimenten destilacion, DAgger o entrenamiento de modelos auxiliares.
- Investigacion en eficiencia de VLA: permite estudiar el compromiso entre tamano de parametros, frecuencia de control (32 Hz declarados) y tasa de exito, con un modelo cuyo coste de inferencia es acotado.
- Docencia y cursos de robotica embodied: sirve como ejemplo completo de carga, configuracion y ejecucion de una politica VLA en PyTorch, con un repositorio pequeno y un script de uso autocontenido.
- Reproducibilidad de pipelines LeRobot: al estar vinculado al dataset `lerobot/libero` y al modelo base `H-EmbodVis/TurboVLA`, facilita replicar comparativas entre checkpoints de la misma familia.
- Integracion en bancos de pruebas de planificacion jerarquica: usar la politica como modulo de bajo nivel mientras un planificador de alto nivel descompone tareas largas en instrucciones en ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye en la model card tasas de exito sobre LIBERO ni metricas de otro tipo, y la busqueda web no aporto ningun resultado relevante (unicamente paginas de inicio de sesion de Gmail, sin relacion con el modelo). Por tanto, no se presentan cifras de MMLU, HumanEval, GSM8K ni de tareas de manipulacion.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,9 GB en bf16/fp16 y 1,8 GB en fp32 solo para los pesos, mas el coste de activaciones y del codificador visual, que no esta documentado.
- VRAM estimada para ajuste fino: en el rango de 6 a 12 GB con precision mixta y lotes pequenos, en funcion de la resolucion de imagen y de si se congelan partes del modelo (estimacion orientativa; no confirmada por el autor).
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para inferencia, como RTX 3060, RTX 4060, RTX 4070 o superiores. Para entrenamiento, se recomienda una GPU con 12-24 GB (RTX 4090, RTX 3090, A5000) o superior.
- Cabe en GPU de consumo: si, es uno de sus principales atractivos dado el tamano de ~0,45B parametros. Tambien podria ejecutarse en plataformas embebidas con memoria unificada, aunque no se documenta soporte especifico.
- Opciones de despliegue: el unico procedimiento documentado es la carga nativa en PyTorch mediante `snapshot_download` y la clase `TurboVLAPolicy`. No se menciona soporte para vLLM, llama.cpp, Ollama, TGI ni TensorRT, algo esperable al tratarse de una politica de accion y no de un modelo de lenguaje causal.
- Latencia y throughput: el autor menciona rollouts a 32 Hz, lo que implica un presupuesto de unos 31 ms por paso de control en el entorno de prueba; no se especifica la GPU empleada ni el tiempo de preprocesado visual.

## Comparativa con modelos similares

Los datos de rendimiento no estan disponibles para ninguno de los modelos de la tabla. Los valores de parametros y licencia de las alternativas proceden de conocimiento general externo y no se han verificado con la informacion proporcionada en esta busqueda; se incluyen unicamente como orientacion de categoria.

| Modelo | Parametros | Enfoque | Contexto | Licencia | Rendimiento |
|---|---|---|---|---|---|
| TurboVLA-Libero-0.22B | ~0,45B (declarado 0,22B) | VLA ajustado sobre LIBERO | No disponible | Apache 2.0 | No disponible |
| H-EmbodVis/TurboVLA | No disponible | VLA fundacional (modelo base) | No disponible | No disponible | No disponible |
| OpenVLA (referencia externa) | ~7B | VLA generalista | No disponible | Licencia abierta (no verificada) | No disponible |
| SmolVLA (referencia externa) | ~0,45B | VLA ligero del ecosistema LeRobot | No disponible | Apache 2.0 (no verificado) | No disponible |

## Limitaciones y advertencias

- Riesgo de alucinacion y de acciones incoherentes: al ser una politica entrenada por imitacion, puede generar trayectorias plausibles pero incorrectas fuera de la distribucion de entrenamiento, sin senal de incertidumbre documentada.
- Especializacion estrecha: el ajuste se realizo sobre `lerobot/libero`, por lo que el rendimiento fuera de ese benchmark o de entornos con camaras y acciones similares es incierto.
- Idioma: el modelo solo declara soporte de ingles; las instrucciones en castellano u otros idiomas no estan cubiertas.
- Contexto: se desconoce la longitud de contexto (historico de observaciones o instrucciones multiples), lo que impide planificar tareas que requieran memoria larga.
- Ambiguedad en el numero de parametros: el nombre del repositorio indica 0.22B mientras que los pesos safetensors declaran 450.046.176 parametros. Conviene verificar la configuracion antes de dimensionar el hardware.
- Formato de pesos ambiguo: el repositorio esta etiquetado con safetensors, pero el script de carga busca ficheros .pth mediante `glob`, lo que puede provocar fallos si el repositorio contiene ambos formatos o solo uno.
- Dependencia de codigo no estandar: la carga requiere importar `TurboVLAPolicy` desde el propio repositorio y leer `config.yaml`, lo que impide usar herramientas genericas de inferencia (vLLM, llama.cpp, Ollama, TGI).
- Sin validacion externa: el repositorio registra 0 descargas y 0 "likes"; no hay evaluaciones de terceros ni resultados reproducidos.
- Documentacion incompleta: no se detallan sesgos conocidos, composicion del dataset de ajuste, resolucion de imagen, espacio de acciones ni procedimiento de evaluacion.
- Licencia: Apache 2.0 permite uso comercial, pero se debe conservar la atribucion a Hugging Face y a los autores de TurboVLA, y verificar la licencia del modelo base `H-EmbodVis/TurboVLA`, que no se especifica en la informacion disponible.
- Seguridad fisica: cualquier despliegue sobre hardware real debe incorporar limites de par, paradas de emergencia y validacion de acciones, dado que no se documentan garantias de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Man1103/TurboVLA-Libero-0.22B
- Modelo base: https://huggingface.co/H-EmbodVis/TurboVLA
- Articulo de investigacion citado por el autor: https://arxiv.org/abs/2607.27205
- Dataset de ajuste: https://huggingface.co/datasets/lerobot/libero
- Licencia Apache 2.0: https://apache.org
- Autores citados: Hengyi Xie, Chenfei Yao, Xianjin Wu, Yingying Zhu, Dingkang Liang, Xiang Bai, Han Ding
- Repositorio o demo adicional: no disponible
