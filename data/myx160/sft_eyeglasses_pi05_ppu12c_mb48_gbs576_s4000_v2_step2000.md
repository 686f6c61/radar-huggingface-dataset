# myx160/sft_eyeglasses_pi05_ppu12c_mb48_gbs576_s4000_v2_step2000

## Resumen

El repositorio `myx160/sft_eyeglasses_pi05_ppu12c_mb48_gbs576_s4000_v2_step2000` es un checkpoint de ajuste supervisado (SFT, *supervised fine-tuning*) para robótica, publicado por el usuario myx160 dentro del ecosistema OpenPI. Se trata de un modelo de tipo VLA (*Vision-Language-Action*), es decir, una politica que recibe observaciones visuales e instrucciones en lenguaje natural y emite acciones motrices continuas para un brazo robotico. En concreto, esta entrenado para la tarea "Pick up the eyeglasses, fold the temples, and place them on the box on the right" sobre un robot Piper.

El artefacto no es un modelo de proposito general ni un *chat model*, sino un checkpoint de entrenamiento resumible (paso 2000 de 4000) asociado a un *pipeline* concreto de datos y a una configuracion distribuida especifica. La libreria declarada es `openpi` y el pipeline de HuggingFace es `robotics`. El tamano del repositorio es de 34,2 GB, coherente con un checkpoint completo de pesos en precision completa mas los *shards* de entrenamiento distribuido.

Su relevancia es acotada y de nicho: sirve para reproducir o reanudar un entrenamiento de manipulacion robotica sobre el dataset `myx160/eyeglasses_grasp`, y no como evidencia de exito en robot real. La propia model card advierte de que es un artefacto de entrenamiento y no una prueba de rendimiento fisico. Cuenta con 0 descargas y 0 *likes*, y su licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (*Vision-Language-Action*) para robotica; la nomenclatura del repo sugiere familia pi0.5 (no confirmado en la informacion disponible) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el checkpoint contiene `full_weights.pt` en precision completa |
| Idiomas soportados | no disponible (las instrucciones de tarea estan en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`.pt` / DCP); 12 *shards* DCP mas `model_state_dict/full_weights.pt` |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna (numero de capas, dimension del *transformer*, mecanismo de atencion ni cabezal de acciones). Por las etiquetas (`openpi`, `vla`, `piper`, `lerobot`) y el sufijo `pi05` del nombre, se trata de una politica VLA de la familia OpenPI/pi0.5 orientada a control robotico, pero no se aportan especificaciones de capas ni de tamano de parametros. La tarea se define por instruccion textual ("Pick up the eyeglasses, fold the temples, and place them on the box on the right"), con entrada multimodal y salida de acciones de 14 dimensiones.

El entrenamiento esta completamente documentado en la model card. El dataset es `myx160/eyeglasses_grasp`, con 100 episodios, 3 camaras y estado/accion de 14D. Se uso *fine-tuning* de parametros completos con FSDP `full_shard`, sobre 12 dispositivos fisicos (los PPU 4-15, *world size* 12). El *batch* por rango (micro batch) fue de 48, el *batch* global de 576 y la acumulacion de 1. Se ejecutaron 4000 pasos de optimizador con un *warmup* de 100 pasos, y este repositorio corresponde al checkpoint del paso 2000. La revision del dataset queda fijada al commit `64481a6ad7cfacf9db4a26c546852bbcc380de73`; un commit posterior solo modifica los metadatos de texto de la tarea. El layout de recuperacion incluye `global_step_2000/actor/` con 12 *shards* DCP, `.metadata`, `model_state_dict/full_weights.pt`, `data.pt`, `rng.pt` y `SFT_CHECKPOINT_COMPLETE.json`. No se documenta RLHF, DPO ni ninguna innovacion de decodificacion.

## Capacidades

- Ejecucion de una unica tarea de manipulacion robotica: coger unas gafas, plegar las patillas y depositarlas en una caja situada a la derecha.
- Percepcion visual multimodal: procesa 3 camaras simultaneas como entrada de observacion.
- Control de accion de 14 dimensiones (estado y accion), tipico de brazos roboticos con pinza.
- Seguimiento de instrucciones en lenguaje natural para condicionar la politica (instruccion de tarea en ingles).
- Reanudacion de entrenamiento: el checkpoint es resumible mediante el lanzador de RLinf.
- No se documenta soporte de *tool calling*, function calling, agentes, multi-step reasoning ni capacidades multilingues.

## Casos de uso

- Reanudacion de entrenamiento SFT: cargar `global_step_2000` en el lanzador de RLinf para continuar desde el paso 2000 hasta 4000 sin repetir computo, aprovechando el layout DCP completo.
- Reproducibilidad experimental: verificar que una configuracion FSDP `full_shard` con *world size* 12, micro batch 48 y batch global 576 reproduce las mismas condiciones declaradas, util para auditar resultados de investigacion.
- *Fine-tuning* sobre una tarea de manipulacion similar: partir de este checkpoint como inicializacion para otra tarea de recogida y colocacion con el mismo robot Piper y geometria de camaras.
- Evaluacion en simulacion: probar la politica en un entorno simulado tipo LeRobot antes de arriesgar hardware, dado que la propia model card no certifica exito en robot real.
- Estudio de tecnicas de plegado deformable: la tarea implica manipular un objeto deformable (patillas de gafas), lo que permite investigar politicas especificas para objetos no rigidos.
- Investigacion en VLA de bajo presupuesto de datos: con solo 100 episodios, es un caso de estudio de cuanta generalizacion se logra en regimen *few-shot* para robotica.
- Benchmark interno de sistemas distribuidos: el checkpoint sirve para comparar rendimiento de entrenamiento entre PPU y otras plataformas (GPU) manteniendo el mismo contrato de datos.
- Base para destilacion o cuantizacion: extraer `full_weights.pt` y generar versiones reducidas para despliegue en el borde.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que el repositorio es un artefacto de entrenamiento y no evidencia de exito en robot real, por lo que no hay tasas de exito de tarea, MMLU, HumanEval ni metricas equivalentes.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision. El repositorio ocupa 34,2 GB e incluye pesos completos mas artefactos de entrenamiento; la huella de inferencia depende del numero de parametros, que no se especifica.
- GPU recomendadas: no disponibles; el entrenamiento se realizo sobre 12 "PPU" (dispositivos fisicos 4-15), no sobre GPU comerciales documentadas.
- Encaje en GPU de consumo: no confirmado. Si el modelo sigue el orden de magnitud habitual de las politicas VLA de OpenPI (unos pocos miles de millones de parametros), podria caber en una GPU de 24 GB en precision reducida, pero esto es una estimacion no verificada.
- Opciones de despliegue: la libreria declarada es `openpi`; el checkpoint esta pensado para el lanzador de RLinf. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que en cualquier caso no son adecuados para politicas de accion continua.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `myx160/sft_eyeglasses_pi05_..._step2000` | VLA robotica (SFT, tarea unica) | no disponible | no disponible | Apache 2.0 | HuggingFace, 0 descargas |
| Familia pi0 / pi0.5 (OpenPI, referencia conceptual) | VLA robotica | no disponible en esta informacion | no disponible | no disponible | no disponible |
| OpenVLA (referencia conceptual) | VLA robotica | no disponible en esta informacion | no disponible | no disponible | no disponible |

No se dispone de datos verificados de parametros, contexto o rendimiento de alternativas en la informacion proporcionada, por lo que la comparacion cuantitativa no es posible.

## Limitaciones y advertencias

- Artefacto de entrenamiento, no modelo final: la model card afirma que "no es evidencia de exito en robot real"; no debe presentarse como politica validada.
- Tarea unica y estrecha: solo cubre la recogida y plegado de gafas sobre un robot Piper; no generaliza a otras tareas ni a otros cuerpos roboticos.
- Sesgos de datos: entrenado con 100 episodios de un unico dataset, con una geometria fija de 3 camaras y un entorno concreto; probable sobreajuste a esa configuracion.
- Riesgo de fallo fisico: sin validacion publicada, su despliegue en hardware real puede provocar colisiones o danos al objeto o al robot.
- Idioma: instrucciones solo en ingles; no hay soporte multilingue documentado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el contenido (dataset y tarea) puede tener sus propias condiciones, no detalladas aqui.
- Estado del repositorio: 0 descargas y 0 *likes*, sin comunidad que lo valide ni issues conocidos.
- Trazabilidad limitada: la fecha de creacion indicada (2026-09-10) es posterior a la actualizacion del propio repositorio en el mismo dia, dato que conviene verificar en la fuente.
- Recuperacion dependiente del commit: la revision del dataset esta fijada por el marcador del checkpoint; cambios aguas arriba en metadatos de tarea pueden afectar a la reproducibilidad.

## Enlaces

- HuggingFace: https://huggingface.co/myx160/sft_eyeglasses_pi05_ppu12c_mb48_gbs576_s4000_v2_step2000
- Dataset referenciado: myx160/eyeglasses_grasp (commit `64481a6ad7cfacf9db4a26c546852bbcc380de73`), no se ha podido verificar la URL del dataset en la busqueda web.
- La busqueda web realizada no devolvio resultados relevantes: solo aparecio el sitio de comercio electronico aleman galeria.de, sin relacion con el modelo.
- No se encontraron papers, blogs, repositorios de codigo ni demos asociados en la informacion disponible.
