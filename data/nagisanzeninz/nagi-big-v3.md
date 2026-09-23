# nagisanzeninz/nagi-big-v3

## Resumen

Nagi Big v3 es un adaptador LoRA (biblioteca PEFT) sobre el modelo base Qwen/Qwen3.5-4B, publicado por el usuario nagisanzeninz. No es un modelo generativo al uso: su pipeline declarado es text-classification y su proposito es producir decisiones estructuradas tipadas con probabilidades asociadas, no texto libre ni explicaciones. El adaptador se engancha tanto a los modulos de atencion completa como a los de atencion linear y a las proyecciones MLP del modelo base, sin requerir una clase de modelo personalizada.

El checkpoint se presenta como la release publica estable de la familia "Big", seleccionada tras descartar la candidata V4 por no mejorar de forma fiable sobre v3. Sobre las suites finales frescas alcanza un 75,80% de exactitud macro en la suite publica (2.204 ejemplos, 4 tareas), un 68,19% en la suite de politica ejecutable (1.440 ejemplos, 6 familias) y un 60,73% en el subconjunto tipado (960 ejemplos, 4 familias). Mejora de forma clara a la candidata G-clean v2, con intervalos pareados intra-familia al 95% de +3,87 a +9,29 puntos en la suite publica y de +18,40 a +23,68 puntos en politica, pero no supera a JEV 1.13.0 (91,40%, 84,51% y 79,48% respectivamente).

Su interes practico reside en que ofrece decisiones tipadas con cobertura del 100% y una temperatura de calibracion ajustada sobre 537 ejemplos publicos, con coincidencia verificada de 1e-7 entre probabilidades del SDK real y las de investigacion en trece sondas no finales. El tamano del repositorio es de 0,2 GB y no se declara licencia propia: los pesos heredan la licencia del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer hibrido Qwen/Qwen3.5-4B con modulos de atencion completa y atencion linear, mas proyecciones MLP |
| Parametros totales | 4B en el modelo base (segun su nombre); numero de parametros anadidos por el adaptador no disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (los datasets de entrenamiento citados son en ingles: AG News, BoolQ, Emotion, MNLI, SST-5) |
| Licencia | no disponible como licencia propia; los pesos heredan la licencia del modelo base Qwen/Qwen3.5-4B |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador es un PEFT LoRA portatil, inicializado desde la candidata G-clean y extendido a los modulos de atencion linear (QKV, Z y out) y a las proyecciones MLP. Los adaptadores de atencion completa existentes conservan r64/alpha128, mientras que los modulos nuevos usan r16/alpha32. Las puertas a/b de la atencion linear permanecen congeladas. No se requiere un checkpoint base modificado ni una clase de modelo personalizada, solo el modelo base fijado en la revision `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`.

El entrenamiento combino 5.999 etiquetas publicas (AG News, BoolQ, Emotion, MNLI, SST-5) con 6.000 ejemplos de oraculo ejecutable, balanceados dentro de diez familias de reglas. Se uso batch efectivo de 16, microbatches con longitud adaptativa, 750 pasos de optimizador, learning rate de 2e-5, 20 pasos de warmup y decaimiento coseno. La funcion de perdida pondera la entropia cruzada de la puntuacion con peso 3 y el resto de tipos con peso 1, normalizada por el peso medio del dataset. El autor indica que se trata de un experimento empaquetado y que las ganancias de cada componente no se aislaron individualmente.

En inferencia el modelo emplea el renderizador crudo del SDK Nagi (sin plantilla de chat), admite un maximo de 26 opciones por consulta y usa una temperatura de `0.8493753016322345`, ajustada sobre 537 ejemplos de calibracion publicos independientes. No se garantiza la calibracion de las probabilidades bajo politicas nuevas.

## Capacidades

- Clasificacion de texto y produccion de decisiones estructuradas tipadas, con salida de probabilidades asociadas.
- Generacion de decisiones de politica ejecutable: 6 familias de reglas evaluadas con un 68,19% de exactitud macro.
- Clasificacion dentro de tareas publicas de NLP: analisis de sentimiento (SST-5), inferencia de lenguaje natural (MNLI), clasificacion tematica (AG News), pregunta-respuesta booleana (BoolQ) y clasificacion de emociones (Emotion).
- Soporte de hasta 26 opciones por consulta como maximo en el renderizador.
- Cobertura del 100% en las suites evaluadas (frente al 99,72% de JEV 1.13.0, que produjo cuatro respuestas de probabilidad no validas en politica).
- Funcionamiento como oraculo ejecutable para familias de reglas: 6.000 ejemplos de entrenamiento de este tipo.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio, thinking mode ni generacion de lenguaje natural abierta. La model card indica explicitamente que las salidas son decisiones tipadas y probabilidades, no explicaciones generadas.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Enrutamiento de decisiones de politica: el modelo puede clasificar una consulta en una de hasta 26 opciones tipadas y devolver una probabilidad, lo que permite integrarlo en motores de reglas o sistemas de decision automatizados que necesiten un componente de clasificacion calibrado.
- Moderacion y clasificacion de contenido: gracias a su rendimiento en tareas publicas de clasificacion (75,80% de exactitud macro en la suite publica de 2.204 ejemplos), puede etiquetar contenido en categorias predefinidas antes de pasarlo a un revisor humano.
- Analisis de sentimiento fino: la inclusion de SST-5 en el entrenamiento lo hace adecuado para clasificacion de sentimiento con cinco niveles de granularidad en resenas y feedback de usuario.
- Inferencia de lenguaje natural (NLI): el uso de MNLI permite aplicarlo a tareas de deteccion de implicacion textual, contradiccion o neutralidad entre pares de frases.
- Clasificacion de intenciones en atencion al cliente: con un maximo de 26 opciones por consulta, puede asignar tickets o mensajes entrantes a categorias de intencion tipadas con una probabilidad asociada.
- Clasificacion tematica de noticias o documentos: el entrenamiento sobre AG News lo hace util para etiquetado tematico de articulos y contenidos editoriales.
- Validacion de reglas de negocio como oraculo: con 6.000 ejemplos de oraculo ejecutable, puede actuar como componente de verificacion en pipelines que necesiten comprobar decisiones de politica estructurada.
- Clasificacion de emociones en textos cortos: la presencia de Emotion en el entrenamiento lo habilita para tareas de deteccion de estado emocional en mensajes.

## Benchmarks y rendimiento

Suite final fresca (exactitud macro por familia, fallos contados como incorrectos):

| Suite | G-clean | v3 | JEV 1.13.0 |
|---|---:|---:|---:|
| Publica, 2.204 ejemplos / 4 tareas | 69,12% | 75,80% | 91,40% |
| Politica ejecutable, 1.440 ejemplos / 6 familias | 47,22% | 68,19% | 84,51% |
| Subconjunto tipado, 960 ejemplos / 4 familias | 40,94% | 60,73% | 79,48% |

Intervalos pareados intra-familia al 95% de v3 menos G-clean: +3,87 a +9,29 puntos en la suite publica y +18,40 a +23,68 puntos en politica.

Comparacion con la publica anterior Big v0 (misma suite V4, evidencia historica, no una prueba nueva en el momento de la release):

| Suite | Big v0 | Big v3 | Candidata V4 |
|---|---:|---:|---:|
| Politica, 1.200 ejemplos / 6 familias | 40,08% | 78,00% | 78,33% |
| Lenguaje, 800 ejemplos / 4 tareas | 54,63% | 68,00% | 66,63% |
| Tipado historico, 640 ejemplos | 47,81% | 82,81% | 82,66% |

El autor advierte de que estas son suites distintas de las de la tabla de JEV y que no deben compararse entre tablas. Las mejoras no son universales: la familia condicional XOR/count baja del 15,83% al 11,67%, y la correferencia WSC sigue siendo debil con un 47,12% frente al 87,50% de JEV.

## Requisitos de hardware

- La VRAM estimada depende del modelo base Qwen/Qwen3.5-4B, no del adaptador (que ocupa 0,2 GB en el repositorio). En BF16 el modelo base de 4B requiere aproximadamente 8 GB solo de pesos, mas overhead de activaciones y cache KV.
- En cuantizacion de 4 bits, un modelo base de 4B suele desplegarse en el rango de 3 a 4 GB de VRAM, aunque el autor no publica cuantizaciones ni configuraciones concretas para este adaptador.
- Cabe en GPUs de consumo como RTX 3090, RTX 4090 o equivalentes con 24 GB en BF16; en cuantizacion de 4 bits es probable que quepa en GPUs de 8-12 GB, si bien esto es una estimacion a partir del tamano del base y no un dato confirmado por el autor.
- Despliegue: el autor indica el uso del SDK propio Nagi, instalable desde GitHub (distribucion `nagi-decisions`), con la llamada `from nagi import load_big; model = load_big(device="cuda")`, que carga el adaptador v3 fijado, el base fijado y la temperatura calibrada. Al ser un adaptador PEFT, es compatible en principio con el ecosistema transformers/PEFT y con servidores que soportan LoRA (por ejemplo vLLM con adaptadores); no se proporcionan pesos GGUF, por lo que llama.cpp u Ollama requeririan conversion previa.
- Latencia y throughput: no se publican cifras concretas. La model card indica unicamente que v3 ofrece un mejor equilibrio entre calidad medida y latencia de inferencia que la candidata V4, y que no se reclama superioridad de latencia con hardware equivalente.

## Comparativa con modelos similares

Todos los modelos comparables pertenecen a la misma campana de investigacion del autor:

| Modelo | Tipo | Publica (2.204) | Politica (1.440) | Tipado (960) | Cobertura |
|---|---|---:|---:|---:|---|
| Nagi Big v3 | Adaptador LoRA sobre Qwen3.5-4B | 75,80% | 68,19% | 60,73% | 100% |
| G-clean v2 | Adaptador previo | 69,12% | 47,22% | 40,94% | no disponible |
| JEV 1.13.0 | Modelo de referencia del autor | 91,40% | 84,51% | 79,48% | 99,72% |

En la suite V4 (evidencia historica) el Big v3 alcanza 78,00% en politica, 68,00% en lenguaje y 82,81% en tipado, frente al 40,08%, 54,63% y 47,81% de Big v0. La candidata V4 queda practicamente empatada o por debajo en las tres suites (78,33%, 66,63% y 82,66%). No se dispone de comparativas con modelos externos de la misma categoria ni de datos del modelo base Qwen/Qwen3.5-4B sin adaptar.

## Limitaciones y advertencias

- No supera a JEV 1.13.0 en ninguna de las suites finales frescas; el propio autor lo indica de forma explicita.
- Las mejoras no son universales: la familia condicional XOR/count baja del 15,83% al 11,67% y la correferencia WSC se mantiene en un 47,12% frente al 87,50% de JEV.
- La evaluacion cubre solo cuatro tareas publicas y seis familias de programas; no debe generalizarse la media macro a flujos de trabajo arbitrarios.
- No se descarta contaminacion por preentrenamiento publico.
- Las probabilidades bajo politicas nuevas no estan garantizadas como calibradas; la temperatura de 0,8493753016322345 se ajusto sobre 537 ejemplos y podria no transferir a otros dominios.
- No se declara licencia propia; los pesos heredan la licencia del modelo base Qwen/Qwen3.5-4B, por lo que las condiciones de uso comercial dependen de ese modelo y no estan detalladas en la informacion disponible.
- El modelo requiere el renderizador crudo del SDK Nagi (sin plantilla de chat); usarlo con otras interfaces puede alterar las probabilidades.
- Las salidas son decisiones tipadas y probabilidades, no explicaciones generadas, lo que limita su uso en aplicaciones que esperen texto libre.
- La fusion en BF16 introdujo pequenos cambios numericos que pasaron la puerta de exportacion, segun el autor.
- Una sonda de cabeza residual fue rechazada; el checkpoint usa la lectura de letras estandar.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion externa independiente.

## Enlaces

- HuggingFace: https://huggingface.co/nagisanzeninz/nagi-big-v3
- Repositorio del SDK Nagi: https://github.com/nagisanzenin/nagi (distribucion `nagi-decisions`)
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B (revision `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`)
- SHA256 del adaptador: `cbade091c3aa84b7fd9d814655f61ce64528bbdc4465851ef23ffc2bf77f585d`
- Ficheros de evaluacion y procedencia citados por el autor: `evaluation.json` y `selection.json` (incluidos en el repositorio)
- Paper o publicacion cientifica: no disponible
- Demo publica: no disponible
