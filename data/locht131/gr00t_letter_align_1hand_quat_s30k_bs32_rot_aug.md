# locht131/gr00t_letter_align_1hand_quat_s30k_bs32_rot_aug

## Resumen

gr00t_letter_align_1hand_quat_s30k_bs32_rot_aug es un ajuste fino (fine-tune) del modelo vision-language-action (VLA) GR00T N1.5 de NVIDIA, publicado por el usuario locht131 en HuggingFace. A diferencia de un modelo de lenguaje general, se trata de una política de control robótico: recibe observaciones visuales y una instrucción en lenguaje natural, y emite acciones motoras de un solo brazo representadas como cuaterniones. El modelo está entrenado sobre demostraciones reales bimanuales de ALOHA correspondientes a una única tarea de manipulación (alineación de letras), con aumento por rotación activado durante el entrenamiento.

El checkpoint se generó tras 30.000 pasos de entrenamiento con batch size 32 en una sola GPU y sin acumulación de gradiente, guardando checkpoints intermedios cada 10.000 pasos (aunque el repositorio solo publica el modelo final). La arquitectura combina un backbone de lenguaje Eagle/Qwen3-1.7B con una torre de visión SigLIP2-400M y una cabeza de acción, sumando 2.724.163.520 parámetros (unos 2,72 mil millones) con pesos en safetensors y un tamaño de repositorio de 7,6 GB.

Su relevancia es acotada pero clara: sirve como referencia reproducible de un fine-tune de GR00T N1.5 sobre una tarea concreta de manipulación diestra, con representación de acción en cuaterniones y aumento por rotación, un escenario habitual en investigación de imitación robótica. No es un modelo de propósito general ni un modelo conversacional: es una política específica de tarea, con licencia Apache 2.0, cero descargas y cero valoraciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en GR00T N1.5: backbone de lenguaje Eagle/Qwen3-1.7B + torre de vision SigLIP2-400M + cabeza de accion |
| Parametros totales | 2.724.163.520 (aproximadamente 2,72 mil millones) |
| Parametros activos | no aplica (no se describe como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos se publican en safetensors; el autor no documenta variantes cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (sharded) + config.json + indice de pesos + experiment_cfg/metadata.json |
| Biblioteca declarada | transformers |
| Pipeline | robotics |
| Modelo base | GR00T N1.5 (gr00t_n1_5) |
| Dataset de entrenamiento | aloha_letter_align_quat_lerobot |
| Configuracion de datos | equi_aloha_1hand_quat |
| Representacion de accion | cuaternion, un solo brazo |
| Pasos de entrenamiento | 30.000 |
| Batch size | 32 (1 GPU, sin acumulacion de gradiente) |
| Aumento por rotacion | si (--rotation-augment) |
| Checkpoints guardados cada | 10.000 pasos (no incluidos en el repo) |
| Tamano del repositorio | 7,6 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion (segun HuggingFace) | 2026-09-13 |
| Fecha de ultima actualizacion (segun HuggingFace) | 2026-09-13 |

## Arquitectura y entrenamiento

El modelo sigue el diseno de GR00T N1.5: un sistema de vision-lenguaje-accion en el que un backbone de lenguaje Eagle/Qwen3-1.7B procesa la instruccion y el contexto, una torre de vision SigLIP2-400M (unos 400 millones de parametros) codifica las observaciones visuales, y una cabeza de accion genera la secuencia motora. El resultado es un unico modelo de 2,72 mil millones de parametros que mapea pares (imagen, texto) a acciones continuas. La representacion de accion elegida en este fine-tune es de cuaterniones y de un solo brazo, pese a que las demostraciones de ALOHA son bimanuales; la configuracion de datos `equi_aloha_1hand_quat` define esa proyeccion a una sola mano.

El entrenamiento se realizo mediante imitacion supervisada sobre el dataset `aloha_letter_align_quat_lerobot`, durante 30.000 pasos con batch size 32 en una sola GPU y sin acumulacion de gradiente. Se activo aumento por rotacion (`--rotation-augment`), una tecnica de aumento de datos orientada a mejorar la robustez frente a variaciones de orientacion de los objetos y de la camara. La model card no documenta una fase de RLHF, DPO u optimizacion por preferencias, ni detalla el numero de tokens, la composicion exacta del dataset o innovaciones adicionales como decodificacion especulativa. Tampoco se incluyen los checkpoints intermedios ni los registros de entrenamiento: solo el modelo final.

Un detalle operativo critico es que el repositorio incluye `experiment_cfg/metadata.json`, que contiene las estadisticas de normalizacion y la configuracion de modalidades. El propio autor advierte que cargar los pesos sin ese archivo produce acciones en unidades incorrectas. La carga se realiza a traves del SDK de GR00T (`gr00t.model.policy.Gr00tPolicy`), no mediante `AutoModel` de transformers.

## Capacidades

- Control robótico de manipulación: genera acciones motoras continuas para un brazo robótico a partir de observaciones visuales y una instrucción.
- Representación de acción en cuaterniones: codifica la orientación de la muñeca o del efector final como cuaterniones en lugar de ángulos de Euler u otras parametrizaciones.
- Ejecución de una tarea específica: alineación de letras sobre una superficie, aprendida de demostraciones reales de ALOHA.
- Condicionamiento por lenguaje: el backbone Qwen3-1.7B permite condicionar la política mediante instrucciones textuales, dentro de los límites de la tarea aprendida.
- Percepción visual: la torre SigLIP2-400M procesa las imágenes de las cámaras del montaje.
- Robustez ante rotaciones: gracias al aumento por rotación durante el entrenamiento, se espera mayor tolerancia a cambios de orientación, aunque el autor no publica métricas que lo cuantifiquen.
- Integración con el ecosistema LeRobot/GR00T: la configuración de datos `equi_aloha_1hand_quat` y el `embodiment_tag="new_embodiment"` permiten cargarla con las utilidades oficiales.
- Tool calling, function calling, agentes multi-paso, capacidades multilingües, modo de razonamiento explícito, visión general, audio o generación de texto libre: no disponibles o no aplicables según la información proporcionada. Es una política robótica, no un modelo conversacional.

## Casos de uso

- Manipulación robótica de precisión en laboratorio: el modelo se usa para controlar un brazo ALOHA en la tarea de alineación de letras, emitiendo acciones en cuaterniones con la normalización definida en `experiment_cfg/metadata.json`. Es adecuado porque fue entrenado específicamente sobre esa tarea y ese montaje.
- Reproducción de experimentos de imitación: sirve como punto de partida verificable para comparar recetas de entrenamiento (30.000 pasos, batch 32, una GPU) sobre el mismo dataset `aloha_letter_align_quat_lerobot`.
- Punto de partida para nuevos fine-tunes: al ser un checkpoint completo de GR00T N1.5 con licencia Apache 2.0, se puede reentrenar sobre otras tareas de manipulación con un solo brazo y representación de acción en cuaterniones.
- Evaluación del aumento por rotación: el sufijo `rot_aug` lo identifica como la variante con `--rotation-augment`, útil para comparar contra un entrenamiento idéntico sin aumento y medir su efecto en la robustez.
- Validación de pipelines de despliegue VLA: permite comprobar la integración de `Gr00tPolicy`, la configuracion de modalidades y el `embodiment_tag` antes de escalar a modelos mayores o a montajes multi-brazo.
- Docencia y prototipado en robótica: con 2,72 mil millones de parametros y pesos en safetensors, es viable cargarlo en una GPU de gama alta para demostraciones de políticas VLA en cursos o proyectos de investigación.
- Ablaciones de representación de acción: al fijar cuaterniones y un solo brazo, permite aislar el efecto de la parametrización de la acción frente a otras variantes del mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente documenta la configuración de entrenamiento (30.000 pasos, batch size 32, una GPU, aumento por rotación) y no incluye tasas de éxito de la tarea, métricas de imitación, comparaciones con el modelo base ni evaluaciones en simulación o en el mundo real.

## Requisitos de hardware

- VRAM para los pesos: con 2.724.163.520 parámetros, los pesos ocupan aproximadamente 5,5 GB en precisión de 16 bits (FP16/BF16), unos 10,9 GB en FP32 y alrededor de 2,7 GB en una hipotética cuantización de 8 bits. El repositorio ocupa 7,6 GB, por encima de los 5,5 GB teóricos, lo que sugiere shards adicionales o metadatos asociados.
- VRAM total estimada para inferencia: no disponible. A los pesos hay que sumar las activaciones de la torre SigLIP2-400M, del backbone Qwen3-1.7B y de la cabeza de acción, además del buffer de imágenes de las cámaras, por lo que en la práctica conviene contar con margen sobre los 5,5 GB de pesos.
- GPU recomendadas: no disponibles. Por tamaño, cabría esperar funcionamiento en A100 (40/80 GB), H100, L40S, RTX 4090 (24 GB), RTX 3090 (24 GB) e incluso tarjetas de 16 GB en FP16, pero el autor no publica requisitos oficiales.
- Cabe en GPU de consumo: probablemente sí en modelos con 24 GB (RTX 3090, RTX 4090) y posiblemente en 16 GB; no confirmado por el autor.
- Opciones de despliegue: el SDK de GR00T (`gr00t.model.policy.Gr00tPolicy` con `data_config` y `modality_transform`) es la vía documentada. El tag `endpoints_compatible` sugiere compatibilidad con HuggingFace Inference Endpoints. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que además no son adecuados para una política VLA con cabeza de acción. Es imprescindible disponer de `experiment_cfg/metadata.json` junto a los pesos.
- Latencia y throughput: no disponibles. No se publican cifras de frecuencia de control, tiempo de inferencia por acción ni tasa de éxito.

## Comparativa con modelos similares

Los resultados de la búsqueda web proporcionada no contienen información técnica relevante (corresponden a páginas de anuncios clasificados sin relación con el modelo), por lo que los datos de comparación no se han podido verificar. La siguiente tabla recoge alternativas de la misma categoría (políticas vision-language-action para manipulación), marcando como no disponible todo aquello que no consta en la información proporcionada.

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| locht131/gr00t_letter_align_1hand_quat_s30k_bs32_rot_aug | VLA, fine-tune de tarea específica (ALOHA, un brazo, cuaterniones) | 2.724.163.520 | no disponible | apache-2.0 | HuggingFace, 0 descargas |
| GR00T N1.5 (modelo base) | VLA generalista de NVIDIA | no disponible en la información proporcionada | no disponible | no disponible en la información proporcionada | referencia citada como base |
| OpenVLA / OpenVLA-OFT | VLA de propósito general para manipulación | no disponible en la información proporcionada | no disponible | no disponible en la información proporcionada | alternativa conocida de la categoría |
| pi0 / pi0-FAST (Physical Intelligence) | VLA orientada a control robótico | no disponible en la información proporcionada | no disponible | no disponible en la información proporcionada | alternativa conocida de la categoría |
| RDT-1B | Modelo de difusión para manipulación bimanual | no disponible en la información proporcionada | no disponible | no disponible en la información proporcionada | alternativa conocida de la categoría |

## Limitaciones y advertencias

- Alcance de tarea muy restringido: está entrenado para una única tarea de manipulación (alineación de letras) sobre un montaje ALOHA concreto. No generaliza a otras tareas sin reentrenamiento.
- Un solo brazo: pese a que el dataset de origen es bimanual, la configuración `equi_aloha_1hand_quat` reduce la política a una sola mano. No sirve para tareas que requieran coordinación de dos brazos.
- Dependencia crítica de `experiment_cfg/metadata.json`: sin ese archivo, las acciones se generan en unidades incorrectas por falta de las estadísticas de normalización. Es un fallo silencioso y peligroso en un robot real.
- Sin métricas de rendimiento: no hay tasas de éxito ni evaluaciones publicadas, por lo que no se puede estimar su fiabilidad antes de desplegarlo.
- Riesgo de sobreajuste al entorno de demostración: las demostraciones provienen de un montaje físico concreto (cámaras, iluminación, mesa, objetos). No se documenta variabilidad de dominio más allá del aumento por rotación.
- Ausencia de datos sobre sesgos, idiomas y contexto: la model card no especifica idiomas soportados ni longitud de contexto, y el modelo no está pensado para generar texto libre, por lo que no aplican las evaluaciones habituales de sesgo lingüístico, pero tampoco se puede asumir un comportamiento determinado ante instrucciones fuera de distribución.
- Idoneidad para producción no demostrada: con 0 descargas y 0 valoraciones, y sin logs de entrenamiento ni checkpoints intermedios publicados, no hay evidencia de terceros sobre su comportamiento.
- Licencia permisiva con matices: Apache 2.0 permite uso comercial, pero el modelo deriva de GR00T N1.5 y de pesos de Qwen3 y SigLIP2; conviene verificar las condiciones de los modelos base antes de un uso comercial.
- Seguridad física: cualquier despliegue en hardware real requiere límites de par, paradas de emergencia y validación en espacio de trabajo seguro; el modelo no incorpora mecanismos de seguridad propios.
- Fecha de publicación inusual: los metadatos de HuggingFace indican creación el 2026-09-13, posterior a la fecha habitual de referencia; conviene verificar la vigencia del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/locht131/gr00t_letter_align_1hand_quat_s30k_bs32_rot_aug
- Repositorio de GR00T (NVIDIA Isaac GR00T), referenciado por la model card a través de los módulos `gr00t.model.policy`, `gr00t.experiment.data_config` y `experiment_cfg/metadata.json`: no se proporciona la URL exacta en la información disponible.
- Dataset `aloha_letter_align_quat_lerobot`: no se proporciona la URL en la información disponible.
- Paper de GR00T N1/N1.5, blog técnico de NVIDIA, demos y espacios: no disponibles en la información proporcionada.
- Resultados de la búsqueda web: no contienen enlaces relevantes al modelo (las URLs devueltas corresponden a páginas de anuncios clasificados sin relación con robótica ni con IA).
