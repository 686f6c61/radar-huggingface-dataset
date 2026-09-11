# niloy629/personaplex-24L-student

## Resumen

PersonaPlex-24L Student es un modelo de voz full-duplex derivado por poda y destilacion del teacher `nvidia/personaplex-7b-v1`. El autor, niloy629, ha recortado el transformer temporal del teacher de 32 a 24 capas (eliminando las capas 23-30 y conservando las capas 0-22 mas la capa final 31, segun un analisis de influencia por bloques) y ha reentrenado parcialmente el resultado para recuperar calidad. El objetivo declarado es la inferencia de voz en tiempo real de baja latencia en hardware de borde, con un presupuesto de 80 ms por frame y NVIDIA Orin como referencia.

El repositorio publica tres checkpoints: `m3.safetensors` (mejor student, entrenado con el dataset long-turn completo), `m2.safetensors` (mejor version anterior) y `pruned-base-24L.safetensors` (inicializacion podada antes del "healing"). Mantiene el mismo tokenizer Mimi, el depformer, la interfaz de voice-prompt y system-prompt del teacher, por lo que es compatible con el stack de inferencia de Moshi.

La relevancia del modelo esta en su receta de entrenamiento documentada y en sus resultados verificados: pasa de 3/12 a 9/12 en una evaluacion offline puntuada con Whisper, alcanza 5/8 en una prueba de "escucha" (responder a la pregunta real) y ejecuta inferencia en streaming a ~24 ms por frame en una RTX 5090 frente a un presupuesto de 80 ms. Tambien documenta explicitamente lo que no funciona (destilacion por logits/KL de codebooks de audio) y sus limitaciones actuales (bucles de repeticion y respuestas cortas por volumen insuficiente de datos long-form, ~230 conversaciones).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autoregresivo con depformer para codebooks de audio, tokenizer Mimi (stack Moshi); full-duplex con streaming por frames |
| Parametros totales | no disponible (student podado de un teacher de 7B: 24 de 32 capas temporales conservadas) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors sin cuantizar) |
| Idiomas soportados | no disponible (las evaluaciones y ejemplos de la model card estan en ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`m3.safetensors`, `m2.safetensors`, `pruned-base-24L.safetensors`) |

## Arquitectura y entrenamiento

La arquitectura procede del teacher `nvidia/personaplex-7b-v1`: un modelo de dialogo de voz full-duplex con un transformer temporal, un depformer que genera los codebooks de audio y el tokenizer Mimi, que convierte audio en tokens discretos y viceversa. El student conserva las capas temporales 0-22 mas la capa 31 del teacher y descarta las capas 23-30, seleccionadas mediante analisis de influencia por bloques (el autor indica que eliminar el rango 21-30 destruye demasiado conocimiento). Se mantienen intactos el depformer, el tokenizer, el voice-prompt y el system-prompt del teacher, de modo que la interfaz de inferencia no cambia.

La receta de entrenamiento que funciona es cross-entropy sobre tokens generados por el teacher, con pesos por componente: texto 3.0, codebook 0 (cb0) 5.0 y el resto de codebooks 1.0. El ajuste es parcial: solo las dos ultimas capas temporales, el depformer y las cabezas; con estados de Adam el entrenamiento produce OOM mas alla de dos capas en una GPU de 32 GB. Hiperparametros: learning rate 3e-5, 2 epocas, acumulacion de gradiente 8, bloques de 192 a 320 tokens y datos de conversaciones multiturno renderizadas por el teacher en formato long-form. El autor documenta dos vias fallidas: la destilacion por logits y la KL sobre codebooks de audio colapsan el modelo a respuestas tipo "yeah"/"thank you" (~0 % en evaluacion), mientras que la KL solo de texto llega a ~59 %; y entrenar solo con datos de turnos cortos (≤7 s) hace que el student trunque respuestas y entre en bucles tipo "nation nation nation". La innovacion practica mas relevante es el soporte de streaming con `dep_q_exit=8`, que reduce el coste por frame un ~17 % (de ~24 ms a 23.7 ms) sin perdida de calidad medida.

## Capacidades

- Dialogo de voz full-duplex en streaming: el modelo procesa audio entrante y genera audio saliente frame a frame, con un presupuesto objetivo de 80 ms por frame.
- Respuesta a preguntas habladas con conocimiento factual basico: en la prueba de "escucha" de 8 preguntas acierta 5/8, con respuestas como la capital de Francia.
- Generacion de respuestas long-form: el checkpoint m3 produce de media 51.1 palabras por respuesta en la evaluacion offline, frente a 42.6 de la primera version curada.
- Conversacion multiturno: el escenario `C_multiturn` de la prueba en servidor supera el test con 89 y 100 palabras generadas y 4 aciertos de keyword en el segundo turno.
- Interfaz de voice-prompt y system-prompt heredada del teacher, util para fijar la identidad vocal y el comportamiento del agente.
- Salida de voz sintetizada a partir de codebooks de audio decodificados por Mimi, evaluada de extremo a extremo con transcripcion Whisper.
- No se documenta soporte de tool calling, function calling, agentes multi-step, vision ni modo de razonamiento explicito.

## Casos de uso

- Agentes de voz en tiempo real en el borde: al estar podado y apuntar a NVIDIA Orin con ≤80 ms por frame, es candidato para asistentes embebidos en dispositivos con GPU integrada donde no cabe el teacher de 7B.
- Atencion al cliente por voz: el modelo gestiona conversaciones multiturno con contexto de audio continuo; el escenario `C_multiturn` verificado (89 y 100 palabras, 4 keywords en el segundo turno) demuestra continuidad entre turnos.
- Sustitucion de bajo coste del teacher en pipelines de investigacion: al conservar el tokenizer Mimi y la interfaz de Moshi, se puede desplegar con `moshi.server` sin reescribir el cliente.
- Prototipado rapido de interfaces conversacionales habladas: el repositorio incluye `training/PLAN.md` y los parches de servidor necesarios para reproducir el entrenamiento en GPU grandes (A100/H100).
- Generacion de respuestas habladas de formato medio (40-100 palabras) para dominios de conocimiento general, como demuestran las respuestas sobre bitcoin y saludos.
- Base para destilacion adicional o investigacion sobre poda de capas en modelos de audio: el repo publica el checkpoint podado sin healing (`pruned-base-24L.safetensors`), util como punto de partida controlado.
- Evaluacion comparativa de estrategias de destilacion: la model card documenta con resultados que CE sobre tokens del teacher funciona y la KL sobre codebooks de audio no, lo que sirve de referencia metodologica.

## Benchmarks y rendimiento

Evaluacion offline puntuada con Whisper (12 preguntas, respuestas transcritas y puntuadas por keywords, `temp 0.5 / top_k 25`; "ok" = ≥15 palabras, sin 4-grama repetido y ≥2 keywords relevantes):

| Modelo | ok | Palabras medias | Aciertos de keyword medios |
|---|---|---|---|
| v1 (primer healing, datos de turno corto) | 3/12 | 42.6 | 2.8 |
| m1b (datos long-turn, peso ×3) | 9/12 | 49.5 | 3.7 |
| m2 (long+long2, bloque 320) | 9/12 | 45.5 | 3.9 |
| m3 (long+long2+long3, bloque 192) | 9/12 | 51.1 | 4.1 |

Prueba de "escucha" (responde a la pregunta real, 8 casos):

| Modelo | Aciertos |
|---|---|
| v1 | 3/8 |
| m1b | 3/8 |
| m2 | 4/8 |
| m3 | 5/8 |

Prueba en vivo de extremo a extremo con servidor (audio opus real de entrada, audio transcrito con Whisper a la salida, 4 escenarios × 2 repeticiones), con m3:

| Escenario | Resultado | Detalle |
|---|---|---|
| B_bitcoin | PASS | words=77/53, kwargs=9/7 (v1 daba 24-27 palabras) |
| C_multiturn | PASS | words=89/100, turn2_kw=4 |
| A_greeting | PASS | words=5/43 |
| D_bargein | FAIL | axis mas debil; los datos long-form no contienen ningun barge-in |
| Total | 5/8 | |

Latencia: ~24 ms por frame en RTX 5090 contra un presupuesto de 80 ms; con `dep_q_exit=8`, 23.7 ms (~17 % de ahorro) sin perdida de calidad medida.

## Requisitos de hardware

- Inferencia en streaming medida en una NVIDIA RTX 5090 a ~24 ms por frame (23.7 ms con `dep_q_exit=8`), dentro del presupuesto de 80 ms por frame.
- Objetivo declarado de despliegue: NVIDIA Orin y edge en tiempo real; no se publican medidas en ese hardware.
- VRAM de inferencia: no disponible. El repositorio ocupa 41.3 GB, pero ese tamano corresponde a varios checkpoints y material de entrenamiento, no al peso de un solo modelo cargado.
- Entrenamiento (dato verificado): el ajuste parcial produce OOM mas alla de dos capas temporales con estados de Adam en una GPU de 32 GB. El plan de escalado a A100/H100 esta descrito en `training/PLAN.md`.
- No cabe esperar despliegue en GPU consumer de gama baja con los pesos publicados en safetensors sin cuantizar; no hay versiones GGUF ni cuantizadas en el repositorio.
- Opciones de despliegue: servidor de Moshi (`python3 -m moshi.server --moshi-weight m2.safetensors --num-layers 24 --mimi-weight <tokenizer> --tokenizer <tokenizer_spm_32k_3.model> --voice-prompt-dir voices/ --device cuda:0`). Se requieren los parches de `training/server_patches/` (`server.py` y `lm.py`).
- Ajustes de despliegue obligatorios segun el autor: pacing en tiempo real (un frame cada 80 ms, alimentando silencio codificado cuando el cliente calla), clamp de sampling de audio a `temp 0.45-0.55 / top_k 10-40` (el frontend por defecto envia `0.8 / 250` y empuja al student a atractores de repeticion) y penalizacion de repeticion de texto con suelo configurable via `MOSHI_REP_PENALTY` (por defecto 1.2).
- Throughput no disponible mas alla de la latencia por frame.

## Comparativa con modelos similares

| Modelo | Relacion | Capas | Rendimiento documentado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PersonaPlex-24L Student (m3) | Este modelo | 24 temporales | 9/12 ok, 5/8 escucha, ~24 ms/frame en RTX 5090 | no disponible | HuggingFace, safetensors |
| `nvidia/personaplex-7b-v1` (teacher) | Teacher del que se poda y destila | 32 temporales | El autor indica que su salida long-form es limpia (203-403 palabras, cero bucles) | no disponible | HuggingFace, safetensors |
| Kyutai Moshi | Stack de inferencia referenciado (`moshi.server`), misma familia de tokenizer Mimi y depformer | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos comparativos de benchmarks comunes (MMLU, HumanEval, GSM8K) para ninguno de los modelos de la tabla; la informacion disponible solo cubre evaluaciones de dialogo hablado especificas de este repositorio.

## Limitaciones y advertencias

- Bucles de repeticion ocasionales y respuestas demasiado cortas, sobre todo ante preguntas cuyos hechos no conoce. El autor atribuye la causa al volumen de datos: el healing se hizo sobre ~230 conversaciones long-form.
- Fallo verificado en barge-in (interrupcion del usuario): el escenario `D_bargein` falla porque los datos de entrenamiento long-form no contienen ningun caso de barge-in. El autor indica que esta generando un conjunto especifico para corregirlo.
- La destilacion por logits y por KL sobre codebooks de audio colapsa el modelo a respuestas tipo "yeah"/"thank you"; solo la CE sobre tokens del teacher produce resultados utilizables.
- El entrenamiento con datos de turnos cortos (≤7 s) provoca truncamiento de respuestas y bucles tipo "nation nation nation".
- El sampling por defecto del frontend de Moshi (`0.8 / 250`) degrada al student; es obligatorio aplicar el clamp documentado y la penalizacion de repeticion.
- Sin el pacing en tiempo real del servidor parcheado, el habla del agente queda esclava del microfono del usuario y se corta a mitad de frase.
- Licencia no disponible: no se puede confirmar la viabilidad de uso comercial ni las obligaciones de atribucion derivadas del teacher.
- Idiomas soportados no disponibles; los ejemplos y evaluaciones publicados estan en ingles.
- No hay datos sobre sesgos, contexto maximo, cuantizacion ni versiones optimizadas para despliegue en produccion.
- El repositorio contiene checkpoints intermedios (`m2.safetensors`, `pruned-base-24L.safetensors`) que no son la mejor version; usar `m3.safetensors` salvo para experimentos de continuacion de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/niloy629/personaplex-24L-student
- Teacher: https://huggingface.co/nvidia/personaplex-7b-v1
- Repositorio del dataset long-form: mencionado en la model card como "the dataset repo", sin URL disponible
- Plan de entrenamiento a mayor escala: `training/PLAN.md` dentro del repositorio del modelo
- Parches de servidor requeridos: `training/server_patches/` (`server.py` y `lm.py`)
- No se han encontrado en la busqueda web enlaces relevantes al modelo, papers, blogs o demos asociados; los resultados devueltos tratan sobre el reproductor multimedia de Windows y no guardan relacion con este modelo.
