# hitsz-robotics/FineCraft

## Resumen

FineCraft es un paquete de políticas de inferencia para manipulacion robotica de precision, presentado por el equipo HITSZ Robotics al MetaFine Challenge, donde obtuvo la cuarta posicion con una puntuacion oficial global de 0.878. No se trata de un modelo de lenguaje al uso, sino de un conjunto de cinco políticas entrenadas para cinco tareas de manipulacion fina (T1 a T5), empaquetadas junto con sus configuraciones de vision y tokenizer para reproducir exactamente los resultados puntuados en el leaderboard.

El paquete combina dos familias tecnicas: políticas basadas en pi0.5 (un modelo vision-language-action) afinadas con LoRA en los casos T2 y T4, y políticas propias con pesos PyTorch nativos para T1 y T5, apoyadas en codificadores visuales DINOv2 y un tokenizer PaliGemma. La entrada del sistema son dos vistas RGB de 512 x 512, nueve posiciones articulares, un identificador de tarea y una instruccion en lenguaje natural; la salida son siete comandos de brazo y un comando de pinza servidos mediante la interfaz HTTP oficial de MetaFine.

Su relevancia es acotada pero clara: es una referencia reproducible y verificable (cada asset copiado byte a byte y validado con SHA256) de como abordar manipulacion fina con VLA en un entorno de competicion, con codigo companion en GitHub y sin reclamacion de relicenciamiento sobre los pesos preentrenados de terceros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politicas VLA (pi0.5 con LoRA en T2/T4; pesos PyTorch propios en T1/T5) con codificadores visuales DINOv2 y DINOv2-large |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | other (component-licenses; ver LICENSES.md) |
| Formato de pesos | Orbax/JAX (checkpoints pi0.5) y PyTorch nativo (T1/T5); tokenizer PaliGemma |

## Arquitectura y entrenamiento

El paquete no define una arquitectura unica. Las políticas T2 y T4 son afinamientos LoRA sobre pi0.5, almacenadas en formato nativo Orbax/JAX junto con sus ficheros de normalizacion; T3 es una variante pi0.5 de etapa 4 con cobertura 3000. T1 y T5 emplean pesos PyTorch nativos cargados por definiciones de modelo propias del repositorio companion, con configuracion DINOv2 para T1 y DINOv2-large para la vision de T5. El tokenizer incluido es `paligemma_tokenizer.model`.

La interfaz de inferencia es fija: dos vistas RGB de 512 x 512, nueve posiciones de articulaciones, un task ID y una instruccion; la salida son siete comandos de brazo mas un comando de pinza. No se publican datos sobre volumen de entrenamiento, composicion del dataset, uso de RLHF/DPO ni innovaciones de decodificacion. El release excluye explicitamente datos de entrenamiento, variantes historicas, runs de optimizador, logs, videos y semillas de evaluacion ocultas.

## Capacidades

- Manipulacion robotica de precision en cinco tareas: T1 (cuerpo y tapa), T2 (mover taza), T3 (interruptor en mesa), T4 (bloques en cajas) y T5 (insertar letra).
- Percepcion visual multimodal a partir de dos vistas RGB de 512 x 512.
- Condicionamiento por instruccion en lenguaje natural (en ingles) junto con un identificador de tarea.
- Control de brazo de siete grados de libertad mas pinza.
- Ejecucion de politicas de imitacion entrenadas por tarea, con checkpoints especificos por escenario.
- Servido mediante interfaz HTTP oficial de MetaFine (`policy_server.py`).
- Verificacion de integridad del bundle sin deserializar tensores.

## Casos de uso

- Reproduccion de resultados de competicion: cargar el bundle con `FINECRAFT_MODEL_DIR` y lanzar `policy_server.py` permite replicar las puntuaciones oficiales por tarea (T1 0.796, T2 1.000, T3 0.925, T4 0.987, T5 0.681).
- Investigacion en manipulacion fina: sirve como linea base para comparar estrategias de afinamiento LoRA sobre pi0.5 frente a políticas con pesos propios en tareas de alta precision.
- Evaluacion de pipelines VLA: al fijar entradas (dos vistas 512x512, nueve articulaciones, instruccion) y salidas (siete comandos de brazo y pinza), facilita pruebas de integracion sobre la interfaz HTTP de MetaFine.
- Estudio de percepcion con DINOv2: las configuraciones incluidas para T1 (DINOv2) y T5 (DINOv2-large) permiten analizar el impacto del backbone visual en el rendimiento por tarea.
- Benchmarking de robustez por tarea: la disparidad entre T2 (1.000) y T5 (0.681) ofrece un caso concreto para estudiar donde fallan las políticas en insercion fina.
- Docencia y divulgacion en robotica: el bundle verificable con SHA256 y manifiesto permite montar practicas reproducibles sin depender de pesos no publicados.

## Benchmarks y rendimiento

| Tarea | Politica final | Revision puntuada | Puntuacion oficial |
|---|---|---|---:|
| T1 | body r25 + cap r3, continuity v4 | `cf5b770c0608` | 0.796 |
| T2 | pi0.5 LoRA, step 29999 | `25cb20a04623` | 1.000 |
| T3 | pi0.5 stage4 coverage3000 | `cf5b770c0608` | 0.925 |
| T4 | pi0.5 LoRA, step 29999 | `25cb20a04623` | 0.987 |
| T5 | general/finishing/correction combination | `cf5b770c0608` | 0.681 |
| Global | — | — | 0.878 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- Sistema operativo: Linux con Python 3.11.
- GPU: NVIDIA (requisito explicito del autor); no se especifica modelo ni VRAM minima.
- VRAM estimada: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Almacenamiento: 23,49 GB para los 79 assets de inferencia.
- Despliegue: servidor HTTP propio (`python policy_server.py --port 8080`) con el codigo companion de FineCraft; no es compatible con `from_pretrained` de Transformers.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia |
|---|---|---|---|---|---|
| FineCraft | Bundle de politicas VLA por tarea | no disponible | no disponible | 0.878 global en MetaFine | other (component-licenses) |
| pi0.5 | VLA base usado por T2/T3/T4 | no disponible | no disponible | no disponible en esta ficha | no disponible |
| Alternativas del MetaFine Challenge | Politicas VLA de competicion | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos comparativos verificables de otros participantes ni de especificaciones de pi0.5 en la informacion proporcionada.

## Limitaciones y advertencias

- El bundle contiene exclusivamente las cinco políticas finales; no incluye datos de entrenamiento, variantes historicas, runs de optimizador, logs ni videos.
- No es un modelo generico: no admite `from_pretrained` de Transformers y requiere los cargadores del repositorio companion.
- Solo soporta ingles como idioma de instruccion.
- Las políticas estan especializadas por tarea; no hay evidencia de generalizacion fuera de T1-T5.
- T5 presenta el rendimiento mas bajo (0.681), lo que indica fragilidad en tareas de insercion.
- La licencia es "other" con avisos por componente; no se reclama relicenciamiento de pesos preentrenados ni del tokenizer, por lo que el uso comercial requiere revisar `LICENSES.md` y `licenses/`.
- Los nombres de fichero de los checkpoints conservan etiquetas de desarrollo y no equivalen a puntuaciones oficiales de la combinacion final.
- No se publican semillas de evaluacion ocultas, lo que limita la replicacion exacta del protocolo de evaluacion.
- Riesgo de sobreajuste al entorno de competicion y ausencia de datos sobre sesgos o alucinacion en el sentido de modelos de lenguaje.

## Enlaces

- Hugging Face: https://huggingface.co/hitsz-robotics/FineCraft
- Repositorio GitHub: https://github.com/eqcy/FineCraft
- Leaderboard oficial: https://robofinemani2026.github.io/leaderboard.html
- Licencias: https://huggingface.co/hitsz-robotics/FineCraft/blob/main/LICENSES.md
