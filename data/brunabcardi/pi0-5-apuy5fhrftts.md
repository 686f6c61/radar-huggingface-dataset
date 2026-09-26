# brunabcardi/pi0.5-aPuY5FhRfTTs

## Resumen

π0.5 AXIS joint policy es una politica robotica de tipo vision-language-action (VLA) publicada por el usuario brunabcardi en HuggingFace bajo el identificador `brunabcardi/pi0.5-aPuY5FhRfTTs`. Se trata de un fine-tune parcial de `ApexUltron/pi0.5-KX774qZu7mZD`, el checkpoint que lideraba la competicion AXIS en el momento del entrenamiento con una puntuacion de 0,8283. El modelo toma como entrada una imagen RGB de una camara (256×256), un estado articular de 9 dimensiones y una instruccion de tarea en lenguaje natural, y produce como salida 9 objetivos absolutos de posicion articular.

La innovacion principal de este checkpoint concreto no es arquitectonica, sino de metodo de entrenamiento: solo se han entrenado la torre de vision SigLIP, el action expert y las capas de proyeccion (842.540.816 parametros entrenables en 40 tensores), mientras que el modelo de lenguaje PaliGemma de 2B y la cabeza de imagen permanecen congelados y byte a byte identicos al padre (2.510.893.056 parametros congelados en 11 tensores). La arquitectura subyacente es π0.5, un transformer VLA construido sobre PaliGemma con un action expert adicional, configurado con `Pi0Config(pi05=True, discrete_state_input=True)` y `action_horizon` de 10.

Es relevante porque documenta de forma inusualmente detallada una cadena completa de fine-tunes sobre el mismo linaje (Fisher-Wang → brunabcardi → MechaTrainer → pfenzi → ApexUltron → este checkpoint), con verificacion de pesos por sha256, normalizacion compartida y datos de entrenamiento generados por rollouts del propio predecesor. El repositorio ocupa 12,4 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-language-action (VLA) π0.5 sobre PaliGemma (torre SigLIP + LLM de 2B) con action expert y capas de proyeccion |
| Parametros totales | 3.353.433.872 (2.510.893.056 congelados + 842.540.816 entrenables) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (configurado con `action_horizon` de 10 pasos de accion) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (recibe instrucciones de tarea en lenguaje natural, idioma no especificado) |
| Licencia | no disponible |
| Formato de pesos | no disponible (los pesos se exportan en el directorio `params/` del entrenador JAX de openpi) |
| Entrada | camera0 RGB 256×256 (slots de muneca vacios y enmascarados) + estado articular 9-D [f1, f2, j1..j7] + instruccion de tarea |
| Salida | 9 objetivos absolutos de posicion articular |
| Configuracion openpi | `pi05_axis_joint` |
| Tamano del repositorio | 12,4 GB |
| Normalizacion | `assets/axis-v0.1-task501-runtime-v1/norm_stats.json`, sha256 `ddf1f825abb675b8c1fff2ea68430f7bb506fdc94cb961836017e448ad3c6d48` |
| Paso de exportacion | 300 de 601 pasos de optimizacion configurados |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura π0.5 implementada en la libreria openpi (`Pi0Config(pi05=True, discrete_state_input=True)`, `action_horizon` 10). Consta de una torre de vision SigLIP (`PaliGemma/img/Transformer`, `embedding`, `pos_embedding`), un modelo de lenguaje PaliGemma de 2B, una cabeza de imagen y un action expert implementado como un segundo conjunto de modulos de atencion y MLP con sufijo `_1` dentro de `PaliGemma/llm` (incluidas sus pre-norms y `final_norm_1`), mas las proyecciones `action_in_proj`, `action_out_proj`, `time_mlp_in` y `time_mlp_out`.

El entrenamiento es un fine-tune parcial con el entrenador JAX de openpi en el commit `15a9616a00943ada6c20a0f158e3adb39df2ccac`, usando `TrainConfig.freeze_filter` para seleccionar el alcance congelado. Los pesos congelados (modelo de lenguaje de 2B, incluido el embedder de tokens y `final_norm`, y la cabeza de imagen) permanecieron en float32 sin recibir gradiente ni estado del optimizador, y el EMA es exacto sobre ellos. La optimizacion empleo AdamW con los valores por defecto de openpi y recorte de gradiente de 1,0, batch de 24, semilla 4512, EMA de 0,999, y una planificacion `CosineDecaySchedule(warmup_steps=1, peak_lr=1.5e-06, decay_steps=601, decay_lr=1.5e-06)`. Se configuraron 601 pasos y este export corresponde al paso 300.

Los datos de entrenamiento son siete conjuntos simulados de AXIS generados por el propio autor ejecutando `pfenzi/pi0.5-8wKVKfMLCNbx@a4a5f5711261b661c2fde6fa2f067acc9a09b050` (el padre del padre) en el runtime oficial del evaluador (`openroboto-evaluation@a11240742f297e942ae50de938073775081f579f`: snapshots congelados de tareas `axis_v1.0`, escenas oficiales, camera0, fisica y checkers oficiales, `resize_with_pad` 224, replan 10, 120 controles a 0,2 s) con semillas de politica distintas de la semilla de evaluacion (20260907). Solo se conservaron los episodios en los que el checker de tarea reporto exito, terminando en el primer paso de exito, y cada episodio se re-simulo de forma exacta a partir de las acciones grabadas. Ninguna otra politica produjo rollouts y no se usaron pesos de otros modelos.

## Capacidades

- Generacion de acciones roboticas: produce secuencias de 9 objetivos absolutos de posicion articular (f1, f2, j1..j7) a partir de una unica imagen RGB de 256×256, el estado articular actual y una instruccion textual de tarea.
- Manipulacion guiada por lenguaje: interpreta instrucciones de tarea en lenguaje natural para condicionar la politica de control.
- Control con horizonte de accion: genera acciones con `action_horizon` de 10, lo que permite planificar en bloques y reevaluar periodicamente.
- Percepcion visual de camara unica: procesa la vista de camera0; los slots de camara de muneca estan vacios y enmascarados en esta configuracion.
- Entrada de estado discreto: la configuracion `discrete_state_input=True` habilita el uso del estado articular discretizado como entrada.
- Politica especifica de tareas AXIS: entrenada exclusivamente sobre episodios de tareas `axis_v1.0` con checkers de exito oficiales.
- Razonamiento multi-paso: no disponible como capacidad general; el modelo es una politica de control, no un modelo conversacional.
- Tool calling / function calling: no disponible (no es una capacidad del modelo).
- Capacidades multilingues: no disponibles; no se documenta el idioma de las instrucciones.
- Capacidades especiales: no se documentan modos de pensamiento, vision adicional ni audio.

## Casos de uso

- Manipulacion robotica en simulacion AXIS: el modelo esta entrenado y normalizado especificamente para las tareas `axis_v1.0` con la configuracion `pi05_axis_joint`, por lo que es directamente desplegable en el runtime del evaluador oficial para reproducir o mejorar la puntuacion del linaje.
- Investigacion sobre congelacion del modelo de lenguaje en politicas VLA: al mantener el LLM y la cabeza de imagen byte a byte identicos al padre, sirve como caso de estudio controlado para medir cuanto rendimiento aporta entrenar solo vision, action expert y proyecciones.
- Punto de partida para fine-tunes posteriores: con solo 842.540.816 parametros entrenables y el resto congelado, es un candidato barato para continuar el entrenamiento en nuevas tareas o dominios sin degradar las capacidades linguisticas heredadas.
- Generacion de datos sinteticos de robotica: los conjuntos de entrenamiento de este checkpoint se generaron ejecutando un modelo anterior en el evaluador oficial y conservando solo los episodios exitosos, un patron reutilizable para crear datasets de imitacion filtrados por checker.
- Reproduccion y auditoria de linajes de modelos: el repositorio documenta sha256 de ficheros, revisiones exactas y comparaciones elemento a elemento entre checkpoints, lo que lo hace util para validar pipelines de trazabilidad de pesos.
- Evaluacion de politica de control con horizonte fijo: con replan cada 10 controles y hasta 120 controles a 0,2 s por episodio, encaja en bancos de prueba que miden exito por tarea bajo presupuesto de control fijo.
- Servidor de politica remoto: el runtime oficial usa un unico servidor de politica al que se conectan los clientes de simulacion, de modo que el modelo puede desplegarse como servicio y ser consultado por multiples trials.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para este checkpoint concreto. El autor no reporta la puntuacion de este export (paso 300 de 601) y el repositorio no incluye evaluacion propia.

Como contexto del linaje, la informacion proporcionada menciona las siguientes puntuaciones de la competicion AXIS:

| Checkpoint | Puntuacion AXIS reportada | Relacion con este modelo |
|---|---|---|
| ApexUltron/pi0.5-KX774qZu7mZD | 0,8283 (campeon en el momento del entrenamiento) | Padre directo |
| pfenzi/pi0.5-8wKVKfMLCNbx | 0,8117 (campeon anterior) | Padre del padre |
| MechaTrainer/pi0.5-rneQYn9nFopV | 0,785 | Ancestro |
| Fisher-Wang/pi05-axis-v0.2-all30-74p67 | no disponible | Raiz del linaje |
| brunabcardi/pi0.5-aPuY5FhRfTTs | no disponible | Este modelo |

## Requisitos de hardware

- VRAM estimada para inferencia (estimacion a partir de los 3.353.433.872 parametros totales, no confirmada por el autor): aproximadamente 13,4 GB en float32, unos 6,7 GB en bf16, unos 3,4 GB en int8 y unos 1,7 GB en int4, en todos los casos mas el overhead de activaciones, imagenes de 256×256 y buffers del runtime.
- El repositorio ocupa 12,4 GB, coherente con un export en precision de 32 bits de los pesos mas los assets.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano, una GPU de 24 GB (RTX 3090, RTX 4090, A10G de 24 GB) cubre la inferencia en bf16 y probablemente tambien en float32; una A100 o H100 de 40/80 GB da margen sobrado para lotes mayores o entrenamiento.
- Cabe en GPU de consumo: si, previsiblemente en tarjetas de 16 GB o mas en bf16, y en 24 GB sin dificultad. No confirmado por el autor.
- Opciones de despliegue: el runtime de referencia es el servidor de politica de openpi (JAX), tal como se usa en `openroboto-evaluation`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, y ninguna de esas herramientas es aplicable directamente a una politica VLA de este tipo.
- Latencia y throughput: no disponibles como cifras absolutas. El protocolo oficial reevalua la politica cada 10 pasos de control (2 s de tiempo simulado) y ejecuta hasta 120 controles (24 s) por episodio, con `resize_with_pad` a 224.
- Los pesos congelados se conservan en float32, lo que condiciona la precision efectiva del modelo de lenguaje durante la inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Rendimiento AXIS | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| brunabcardi/pi0.5-aPuY5FhRfTTs | 3.353.433.872 (842.540.816 entrenables) | `action_horizon` 10 | no disponible | no disponible | Repositorio de 12,4 GB, 0 descargas |
| ApexUltron/pi0.5-KX774qZu7mZD (padre) | no desglosados (misma linea π0.5) | no disponible | 0,8283 | no disponible | Sin model card publicada |
| pfenzi/pi0.5-8wKVKfMLCNbx | no desglosados (misma linea π0.5) | no disponible | 0,8117 | no disponible | Disponible en HuggingFace |
| MechaTrainer/pi0.5-rneQYn9nFopV | no desglosados (misma linea π0.5) | no disponible | 0,785 | no disponible | Disponible en HuggingFace |

Los tres checkpoints comparables pertenecen al mismo linaje de fine-tunes de π0.5 sobre AXIS, por lo que comparten arquitectura, interfaz y fichero de normalizacion con la unica diferencia documentada del alcance entrenado y del numero de pasos. No se dispone de modelos de otra familia con los que comparar directamente en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. No se documenta ningun analisis de sesgo, y el modelo se ha entrenado unicamente con rollouts de otro checkpoint en escenas simuladas, lo que hereda cualquier sesgo de comportamiento de ese predecesor.
- Riesgo de alucinacion: no aplica en el sentido conversacional, pero la politica puede generar trayectorias invalidas o inseguras fuera de la distribucion de tareas `axis_v1.0` y de las escenas oficiales de entrenamiento.
- Dominio muy restringido: entrenado con siete datasets simulados de las mismas tareas, con una sola camara (camera0), slots de muneca vacios y checkers oficiales como filtro de exito. No hay evidencia de transferencia a robot real ni a tareas nuevas.
- Limitaciones de contexto e idioma: se desconoce la longitud de contexto, el idioma de las instrucciones y el comportamiento fuera del vocabulario de tareas visto durante el entrenamiento.
- Especializacion de la salida: solo produce 9 grados de libertad (f1, f2, j1..j7) como posiciones absolutas; no es reutilizable directamente en otras morfologias sin reentrenamiento.
- Sesgo de seleccion en los datos: solo se conservaron episodios con exito reportado por el checker y se trunco en el primer paso de exito, lo que elimina ejemplos de recuperacion ante errores y puede reducir la robustez en produccion.
- Restricciones de licencia: la licencia no esta disponible, por lo que no puede asumirse uso comercial. Ademas, el modelo deriva de una cadena de checkpoints cuya licencia tampoco se documenta.
- Dependencia de la normalizacion: el fichero `norm_stats.json` debe usarse byte a byte tal cual se distribuye; cambiarlo invalida el comportamiento del modelo.
- Artefacto intermedio: este export corresponde al paso 300 de 601 pasos configurados, no al final del entrenamiento, por lo que no debe asumirse que sea el mejor checkpoint de la ejecucion.
- Madurez y soporte: cero descargas y cero likes, sin model card independiente en el repositorio padre, lo que limita la validacion por terceros.
- Trazabilidad del linaje: las relaciones entre checkpoints se afirman a partir de comparaciones elemento a elemento de pesos realizadas por el autor, no de documentacion oficial de los repositorios intermedios.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/brunabcardi/pi0.5-aPuY5FhRfTTs
- Modelo base (padre): https://huggingface.co/ApexUltron/pi0.5-KX774qZu7mZD (revision `46abf397fdb40525841ece710b544b6edcb928a0`)
- Padre del padre: https://huggingface.co/pfenzi/pi0.5-8wKVKfMLCNbx (revision `a4a5f5711261b661c2fde6fa2f067acc9a09b050`)
- Ancestro: https://huggingface.co/MechaTrainer/pi0.5-rneQYn9nFopV (revision `f0a106070f4de953c5b1ff9ae361a7099f7be796`)
- Ancestro: https://huggingface.co/brunabcardi/pi0.5-iX58tVHFJ52L (revision `3c38c482dd333aede17cfba0198298bf8e316af3`)
- Raiz del linaje: https://huggingface.co/Fisher-Wang/pi05-axis-v0.2-all30-74p67 (revision `521a0741c01ee7908b5794bb2ae6933d3dc04745`)
- Entrenador openpi (JAX), commit `15a9616a00943ada6c20a0f158e3adb39df2ccac`: sin URL en la informacion disponible
- Runtime de evaluacion `openroboto-evaluation`, commit `a11240742f297e942ae50de938073775081f579f`: sin URL en la informacion disponible
- Paper, blog o demo: no disponibles en la informacion proporcionada
