# jungwook2358/allex-eef-N-robotonly-h16

## Resumen

`jungwook2358/allex-eef-N-robotonly-h16` es un checkpoint de política robótica bimanual publicado en HuggingFace bajo el pipeline `robotics` y etiquetado como VLA (vision-language-action). No es un modelo fundacional nuevo: es un ajuste de stage-2 sobre el modelo preentrenado `RLWRLD/RLDX-1-PT-IMG`, en el que el backbone VLM permanece congelado (`tune_llm=False`, `tune_visual=False`, `tune_top_llm_layers=0`) y se entrena una cabeza de acción sobre un espacio de acciones absoluto EEF de 50 dimensiones.

Su interés es metodológico, no de capacidades: es un *ablation* del run `jungwook2358/allex-eef-N-h16` en el que se ha eliminado toda la fuente de datos humanos (hmd y umi). El run de referencia mezcla 0,50 de datos de robot, 0,25 de hmd y 0,25 de umi; este repositorio entrena con proporción 1,00 de datos de robot (allex v1–v6). El objetivo declarado del autor es aislar la contribución real del co-entrenamiento con datos humanos en una política VLA.

La model card no publica recuento de parámetros, longitud de contexto, idiomas, benchmarks ni requisitos de hardware. Sí documenta horizonte de acción 16, batch global 256 sobre 2 GPU (128 por dispositivo), learning rate 1e-4, state dropout 0,3 y un objetivo de 60.000 pasos de entrenamiento, del que solo se ha publicado el checkpoint de 10.000 pasos en el momento de la subida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) derivada de `RLWRLD/RLDX-1-PT-IMG`; backbone VLM congelado más cabeza de acción entrenada en stage-2 |
| Parametros totales | no disponible (el repositorio ocupa 13,8 GB; ver nota) |
| Parametros activos | no aplica (no se documenta una arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el autor no documenta cuantizaciones; solo se publican pesos en precisión de entrenamiento) |
| Idiomas soportados | no disponible (modelo de control robótico; no se documenta interfaz de lenguaje natural) |
| Licencia | `other` (los términos concretos no se detallan en la model card) |
| Formato de pesos | safetensors (directorio `checkpoint-10000/`) |
| Dimension de accion | 50D absoluta EEF: 9 (left_wrist_wrt_base) + 9 (right_wrist_wrt_base) + 15 (left_hand_joints) + 15 (right_hand_joints) + 2 (neck_joints) |
| Horizonte de accion | 16 pasos |
| Entradas | 2 cámaras (ego left/right), `video_length` 1, estado propioceptivo con `state_dropout` 0,3 |
| Embodiment tag | `GENERAL_EMBODIMENT` |
| Normalizacion | q99: `2*(x-q01)/(q99-q01)-1` con `clamp(-1,1)` |
| Pasos de entrenamiento | checkpoint publicado en 10.000 de 60.000 objetivos |
| Tamano del repositorio | 13,8 GB |
| Descargas / likes | 0 / 0 |

Nota sobre el tamaño: si la totalidad de los 13,8 GB correspondiera a pesos en bf16, el orden de magnitud sería de unos 6.900 millones de parámetros. Es una estimación aritmética a partir del tamaño del repositorio, no un dato publicado; el checkpoint también incluye directorios `processor/` y `experiment_cfg/`. El autor no declara el recuento de parámetros en ningún momento.

## Arquitectura y entrenamiento

La arquitectura es la de un modelo visión-lenguaje-acción construido sobre `RLWRLD/RLDX-1-PT-IMG`. En la fase de stage-2 documentada, el componente VLM se mantiene congelado por completo (`tune_llm=False`, `tune_visual=False`, `tune_top_llm_layers=0`) y el entrenamiento se concentra en la cabeza de acción que produce *chunks* de 16 pasos en el espacio EEF absoluto de 50 dimensiones. No se emplean innovaciones adicionales declaradas: el autor indica explícitamente que no hay CogAlign y que no hay tokenizador latente.

Los datos de entrenamiento son exclusivamente robot allex v1–v6, sin ninguna mezcla de datos humanos (ni hmd ni umi). La receta es idéntica a la del run de referencia salvo en esa fuente de datos: batch global 256 (2 GPU × 128 por dispositivo, con acumulación 1), learning rate 1e-4, 60.000 pasos objetivo, `state_dropout` 0,3, color jitter idéntico, `video_length` 1 y dos cámaras ego. El checkpoint publicado corresponde al paso 10.000, es decir, aproximadamente un sexto del entrenamiento previsto.

Una peculiaridad importante del entrenamiento es el uso de `--override-pretraining-statistics`, que recalcula los percentiles q01/q99 sobre el conjunto de datos realmente utilizado. Como este run solo ve datos de robot, sus estadísticas de normalización son las de robot en solitario, distintas de las del run base (que usa estadísticas fusionadas de tres fuentes). Esto significa que los dos checkpoints no comparten escala de normalización de acciones, aunque a efectos de despliegue sea lo correcto para un modelo que solo verá entradas de robot.

## Capacidades

- Generación de *action chunks* de 16 pasos en un espacio de acción absoluto EEF de 50 dimensiones, sin relativización respecto al estado actual.
- Control bimanual: dos brazos con 9 dimensiones cada uno (muñeca respecto a la base).
- Control de manos diestras: 15 articulaciones por mano, 30 en total.
- Control de cuello: 2 articulaciones (`neck_joints`). La cintura queda excluida del espacio de acción.
- Percepción visual con dos cámaras en primera persona (ego left/right) y `video_length` 1 (un único frame por cámara, sin historial temporal de vídeo).
- Condicionamiento por estado propioceptivo, con `state_dropout` 0,3 durante el entrenamiento; esto sugiere tolerancia a la ausencia parcial de estado en inferencia, aunque el autor no lo documenta explícitamente.
- Etiquetado con `embodiment_tag` `GENERAL_EMBODIMENT`, pensado para un esquema de embodiment genérico.
- No se documenta soporte de *tool calling* ni de *function calling* en el sentido de los LLM.
- No se documenta comportamiento de agente multi-paso ni planificación de alto nivel: el modelo produce acciones de bajo nivel.
- No se documenta capacidad multilingüe ni interfaz de instrucciones en lenguaje natural.
- No se documenta *thinking mode*, audio ni modalidades adicionales.

## Casos de uso

- Manipulación bimanual en laboratorio: el modelo genera directamente 16 pasos de acción EEF absoluta para los dos brazos, lo que permite integrarlo en un bucle de control donde cada inferencia cubre un horizonte corto y se reinyecta nuevo estado propioceptivo.
- Investigación sobre co-entrenamiento con datos humanos: al ser un ablation con proporción 1,00 de datos de robot frente a 0,50:0,25:0,25 del run base, sirve para medir de forma aislada cuánto aporta el *co-train* con datos hmd/umi a una política VLA en tareas reales.
- Evaluación de escalado de datos de robot: los datos allex v1–v6 son la única fuente de este run, de modo que comparar sus curvas de éxito con las del run base permite estimar el retorno marginal de añadir datos humanos a una mezcla de robot.
- Manipulación con manos diestras: el espacio de acción incluye 15 articulaciones por mano, por lo que el modelo es utilizable en plataformas con manos multi-dedo para agarre fino, no solo en pinzas paralelas.
- Percepción activa con cuello: las 2 articulaciones de cuello dentro de la acción permiten al modelo reorientar las cámaras durante la tarea, lo que resulta útil en manipulación de objetos fuera del campo de visión inicial.
- Investigación de robustez a estado incompleto: con `state_dropout` 0,3 durante el entrenamiento, es un candidato razonable para escenarios en los que la lectura propioceptiva es ruidosa o intermitente (por ejemplo, sensores con pérdida de paquetes), aunque el autor no publica curvas de robustez.
- Base para *fine-tuning* en un embodiment propio: al ser un stage-2 sobre un preentrenado público, puede servir de punto de partida para adaptar el mismo esquema de acción 50D a otro robot bimanual con dos cámaras y manos de 15 articulaciones.
- Estudio metodológico de normalización: dado que el autor recalcula q01/q99 sobre el dataset real, el repositorio permite analizar el efecto de las estadísticas de normalización por fuente de datos sobre la estabilidad del entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card únicamente incluye la tabla de composición de datos del ablation (robot : hmd : umi = 0,50 : 0,25 : 0,25 en el run base frente a 1,00 en este repositorio), que no constituye un resultado de rendimiento. No hay tasas de éxito de tareas, ni MMLU, ni HumanEval, ni GSM8K, ni métricas de manipulación como éxito por tarea o error de posición.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible como dato publicado. A partir del tamaño del repositorio (13,8 GB) y suponiendo pesos en bf16, un despliegue en precisión completa necesitaría del orden de 14 GB solo para pesos, más activaciones del codificador visual y de la cabeza de acción; el margen práctico se sitúa por encima de los 16 GB de VRAM.
- En cuantización int8 el orden de magnitud bajaría a unos 7 GB de pesos; en int4, a unos 3,5 GB. Son estimaciones derivadas del tamaño del repositorio, no especificaciones del autor, y el modelo no se distribuye con variantes cuantizadas.
- GPU recomendadas: A100 (40/80 GB), H100 y L40S para despliegue sin restricciones; RTX 4090 (24 GB) debería alojar la inferencia en bf16 con holgura razonable. En GPUs consumer de 16 GB (RTX 4080, 4070 Ti Super) el encaje es ajustado y depende del consumo real del codificador visual y del tamaño de batch.
- No hay datos publicados de latencia ni de throughput. Al tratarse de una política robótica, la latencia relevante es la de un *forward* que produzca 16 pasos de acción, no la de decodificación autoregresiva de tokens.
- Opciones de despliegue: vLLM, llama.cpp, Ollama y TGI no son aplicables de forma directa, porque no es un modelo de generación de texto. El despliegue requiere el stack de inferencia asociado al preentrenado RLDX-1 y el código de stage-2 indicado por el autor (`jungwook235/RLDX-1-egopi`, rama `feat/allex-eef-h16-midtrain`), más un runtime de robot que consuma los chunks de acción de 50 dimensiones.
- Crítico para el despliegue: la inferencia debe cargar las estadísticas de normalización incluidas en este checkpoint (`checkpoint-*/experiment_cfg/dataset_statistics.json` y `checkpoint-*/processor/statistics.json`). Usar las del run `allex-eef-N-h16` produce acciones desnormalizadas incorrectas, porque las escalas q01/q99 son distintas.

## Comparativa con modelos similares

| Modelo | Parametros | Horizonte / contexto | Datos de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `jungwook2358/allex-eef-N-robotonly-h16` (este) | no disponible | horizonte de acción 16; contexto no disponible | robot allex v1–v6 al 100 % | `other` | público en HuggingFace; checkpoint 10k de 60k |
| `jungwook2358/allex-eef-N-h16` (run base) | no disponible | horizonte de acción 16; contexto no disponible | robot 0,50 / hmd 0,25 / umi 0,25 | `other` | público en HuggingFace |
| `RLWRLD/RLDX-1-PT-IMG` (preentrenado base) | no disponible | no disponible | no disponible | no disponible | público en HuggingFace |

No hay resultados comparativos de rendimiento publicados entre estos tres modelos en la información disponible, ni datos de parámetros, contexto o licencia del preentrenado base. La comparación con alternativas de otros autores (por ejemplo, otras familias VLA abiertas) no se puede sustentar con datos verificables a partir de la información proporcionada.

## Limitaciones y advertencias

- Checkpoint incompleto: solo se publica el paso 10.000 de un objetivo de 60.000. El modelo está a un sexto del entrenamiento previsto y no hay evidencia publicada de convergencia ni de rendimiento final.
- Ausencia total de datos humanos: es una decisión deliberada del ablation, pero implica que el modelo solo ha visto distribución de robot allex v1–v6. La generalización a escenarios, objetos o morfologías fuera de esa distribución no está caracterizada.
- Estadísticas de normalización no portables: las q01/q99 de este checkpoint no coinciden con las del run base. Mezclar checkpoints, reutilizar estadísticas o combinar salidas de ambos runs produce acciones con escala incorrecta.
- Dimensión de acción 50, no 48: el propio autor lo señala como advertencia. Un pipeline que asuma 48 dimensiones fallará silenciosamente o lanzará errores de forma en el runtime de robot.
- Sin benchmarks ni métricas de éxito: no hay forma de estimar la tasa de éxito en tareas reales antes de desplegarlo. Cualquier uso en producción exige evaluación propia.
- Riesgo de trayectorias físicamente inválidas: la normalización aplica `clamp(-1,1)`, de modo que acciones fuera del rango q01–q99 se saturan. En estados fuera de distribución esto puede producir comandos límite mantenidos en lugar de un comportamiento conservador.
- Sesgos de datos: al provenir de un único conjunto (allex v1–v6) sin datos humanos, el modelo hereda los sesgos de distribución de ese dataset (tipos de objeto, iluminación, disposición de cámaras, morfología del robot).
- Idiomas no documentados: no se declara ningún idioma soportado y no se describe una interfaz de instrucciones en lenguaje natural; asumir control por lenguaje natural es una extrapolación no respaldada.
- Licencia `other` sin términos detallados: no se especifican condiciones de uso comercial, atribución ni redistribución. Cualquier uso en producto requiere contactar con el autor.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, por lo que no hay informes independientes de reproducibilidad.
- Metadatos dudosos: la fecha de creación declarada (2026-09-19) es posterior a la fecha habitual de consulta, lo que apunta a un error de reloj o de metadatos del repositorio.
- Solo dos cámaras ego y `video_length` 1: no hay historial temporal de vídeo, por lo que la estimación de velocidad o de dinámica de objetos depende del estado propioceptivo y de la recurrencia del stack de inferencia.
- Cintura excluida del espacio de acción: el modelo no puede comandar esa articulación, lo que limita su uso en plataformas que la necesiten para alcanzar el espacio de trabajo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jungwook2358/allex-eef-N-robotonly-h16
- Run base del ablation: https://huggingface.co/jungwook2358/allex-eef-N-h16
- Modelo preentrenado base: https://huggingface.co/RLWRLD/RLDX-1-PT-IMG
- Código de stage-2: repositorio `jungwook235/RLDX-1-egopi`, rama `feat/allex-eef-h16-midtrain` (el autor no indica la URL completa ni si se aloja en GitHub o en HuggingFace)
- Script de envío de entrenamiento: repositorio `jungwook235/action-tokenizer`, ruta `gpu26-server/submit/allex_eef_run3_base_robotonly.sh` (el autor no indica la URL completa)
- Estadísticas de normalización requeridas en inferencia: `checkpoint-*/experiment_cfg/dataset_statistics.json` y `checkpoint-*/processor/statistics.json` dentro del propio repositorio
- Descarga selectiva del checkpoint:
  ```python
  from huggingface_hub import snapshot_download
  p = snapshot_download("jungwook2358/allex-eef-N-robotonly-h16",
                        allow_patterns="checkpoint-10000/*")
  ```
- Búsqueda web: no se ha encontrado ningún resultado relevante sobre este modelo, su preentrenado base ni su código. Las únicas entradas devueltas corresponden a páginas de soporte de Microsoft sin relación con el modelo.
