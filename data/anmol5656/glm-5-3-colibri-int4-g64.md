# anmol5656/GLM-5.3-colibri-int4-g64

## Resumen

GLM-5.3-colibri-int4-g64 es una conversión cuantizada a int4 del checkpoint oficial `zai-org/GLM-5.3` de Z.ai, empaquetada en el formato contenedor que consume el motor de inferencia colibrì. No se trata de un modelo nuevo ni de un fine-tune: los pesos son los de Z.ai y lo único que cambia es cómo se almacenan y se leen desde disco. Su propósito es permitir la ejecución de un modelo de clase 744B en una máquina con unos 25 GB de RAM, manteniendo los expertos enrutados en disco y leyendo únicamente los que cada token selecciona.

La arquitectura subyacente es un transformer disperso de tipo Mixture-of-Experts con 78 capas (75 dispersas), 256 expertos y 8 activos por token. La conversión aplica cuantización int4 con group size 64 a los expertos enrutados (21,2 MB cada uno) y 8 bits a las partes densas y de E/S. El repositorio ocupa 419,3 GB repartidos en 141 shards, mientras que la parte densa residente en memoria es de 10,6 GB y el RSS total se sitúa en torno a 13,6 GB con un presupuesto de 18 GB.

Es relevante porque demuestra una vía práctica de servir modelos de escala frontier en hardware de consumo mediante streaming de expertos desde disco, un enfoque distinto al de la cuantización convencional orientada a GPU. Conviene subrayar que este checkpoint no carga en transformers ni en vLLM: solo funciona con el motor `colibri`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE disperso (glm_moe_dsa), 78 capas (75 dispersas), 256 expertos, 8 activos por token |
| Parametros totales | no disponible (clase 744B segun el autor) |
| Parametros activos | no disponible (8 expertos de 256 por token) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4 con group size 64 en expertos enrutados; 8 bits en densas y E/S |
| Idiomas soportados | en, zh |
| Licencia | glm-5.3 (license: other) |
| Formato de pesos | Contenedor propietario de colibrì (141 shards, 419,3 GB); no compatible con safetensors estandar ni GGUF |
| Modelo base | zai-org/GLM-5.3 |
| Tamano en disco | 419,3 GB |
| Memoria densa residente | 10,6 GB |
| RSS total estimado | ~13,6 GB con presupuesto de 18 GB |
| MTP | no incluido en esta conversion |
| Tensores verificados | 116.915, sin truncamientos ni cabeceras invalidas |

## Arquitectura y entrenamiento

El modelo base GLM-5.3 emplea una arquitectura Mixture-of-Experts con 78 capas, de las cuales 75 son dispersas, 256 expertos por capa y 8 expertos activos por token. Segun la model card upstream citada, GLM-5.3 comparte el mismo modelo base que GLM-5.2 y todas las mejoras provienen de la fase de post-entrenamiento; los dos checkpoints tienen geometria identica y sus `config.json` solo difieren en la `transformers_version` que los escribió y una clave adicional. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron RLHF o DPO.

La innovación técnica de esta conversión no reside en el entrenamiento sino en el mecanismo de despliegue: los expertos enrutados se almacenan en disco en int4 (group size 64) y el motor colibrì lee únicamente los seleccionados por cada token, manteniendo en RAM solo la parte densa en 8 bits. El conversor se ejecutó con `ebits=4, xbits=4, io_bits=8, group_size=64`. Se verificó la validez de cabeceras y la ausencia de truncamiento en los 141 shards, y se comprobó que el modelo genera texto coherente y produce salidas idénticas byte a byte bajo semilla fija entre dos rutas distintas de obtención de expertos. No se ha realizado una comparación token a token contra la implementación de referencia.

## Capacidades

- Generación de texto en inglés y chino, con salida coherente confirmada por el autor de la conversión.
- Razonamiento y conocimiento general heredados del checkpoint GLM-5.3 de Z.ai (capacidades específicas no documentadas en la información disponible).
- Ejecución de un modelo de clase 744B en hardware con ~25 GB de RAM mediante streaming de expertos.
- Compatibilidad exclusiva con el motor colibrì; no soporta transformers, vLLM ni llama.cpp.
- Soporte de tool calling, function calling, agentes o modo thinking: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponible en la información proporcionada.
- Capacidades multilingües más allá de en/zh: no disponible.

## Casos de uso

- Investigación de técnicas de streaming de expertos: permite estudiar el comportamiento de un MoE de 744B con expertos en disco en una estación de trabajo, midiendo el impacto del ancho de banda de E/S en la latencia por token.
- Evaluación de cuantización int4 con group size 64 sobre modelos frontier: sirve para comparar la calidad de salida frente al checkpoint original en tareas controladas, dado que el autor no ha publicado todavía una comparación token a token.
- Despliegue en entornos con RAM limitada y almacenamiento NVMe abundante: el modelo cabe en ~13,6 GB de RSS, lo que permite ejecutarlo en máquinas sin GPU de gran memoria siempre que el disco tenga 419,3 GB libres y buena velocidad de lectura aleatoria.
- Reproducción y auditoría de conversiones: los 141 shards están verificados en cabecera y truncamiento, lo que facilita usarlo como referencia para validar el conversor de colibrì.
- Pruebas de determinismo en inferencia: la model card confirma salidas idénticas byte a byte bajo semilla fija entre rutas de fetch distintas, útil para pipelines que requieran reproducibilidad.
- Desarrollo y depuración del motor colibrì: al ser un checkpoint de gran escala en formato nativo, sirve para probar rutas de carga, gestión de caché de expertos y detección de familia desde `config.json`.
- Experimentación con modelos bilingües en/zh en contextos de investigación donde no se requiera latencia baja ni servicio concurrente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni comparaciones cuantitativas con el checkpoint original. Tampoco se documentan latencia ni throughput medidos, más allá de la confirmación cualitativa de que el modelo carga y genera texto coherente.

## Requisitos de hardware

- RAM: ~13,6 GB de RSS total con un presupuesto de 18 GB; 10,6 GB corresponden a la parte densa residente.
- Almacenamiento: 419,3 GB libres para los 141 shards; se recomienda NVMe por la lectura aleatoria de expertos.
- VRAM: no aplica, el motor está orientado a CPU con streaming desde disco.
- GPU recomendadas: no disponible; el diseño del motor colibrì es de ejecución en CPU.
- ¿Cabe en GPU de consumo? No en VRAM; el modelo reside en disco y RAM, no en memoria de GPU.
- Opciones de despliegue: exclusivamente el motor `colibri` del repositorio JustVugg/colibri (compilación con `make -C c colibri` y ejecución con `c/coli chat --model /ruta`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| GLM-5.3-colibri-int4-g64 | clase 744B (MoE, 8/256 activos) | no disponible | Contenedor colibrì int4 | glm-5.3 | CPU, ~25 GB RAM + 419 GB disco |
| zai-org/GLM-5.3 (original) | clase 744B (misma geometria) | no disponible | Pesos originales de Z.ai | glm-5.3 | GPU de gran memoria |
| zai-org/GLM-5.2 | clase 744B (misma geometria) | no disponible | Pesos originales de Z.ai | glm-5.2 | GPU de gran memoria |

La comparación relevante es contra el checkpoint original de GLM-5.3: misma geometria y mismos pesos, pero este último requiere hardware GPU de alta gama mientras que la conversión colibrì prioriza RAM y disco. Frente a GLM-5.2, la diferencia es exclusivamente de post-entrenamiento, sin cambios arquitectónicos.

## Limitaciones y advertencias

- No es el checkpoint oficial: los pesos son de Z.ai, pero el empaquetado es de un tercero (anmol5656) y no está respaldado por el equipo original.
- No carga en transformers ni en vLLM; solo funciona con el motor colibrì.
- La etiqueta que muestra el motor es incorrecta: colibrì anuncia este checkpoint como "GLM-5.2 744B" porque la configuración no permite distinguirlo de GLM-5.2; los pesos cargados sí son los correctos.
- No se ha realizado comparación token a token contra la implementación de referencia, por lo que la fidelidad exacta de la cuantización int4 no está cuantificada.
- MTP no incluido en esta conversión, lo que puede afectar al rendimiento respecto al checkpoint original.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está documentado.
- Licencia "other" bajo el nombre glm-5.3: es necesario revisar los términos del modelo base de Z.ai antes de cualquier uso comercial.
- Riesgo de alucinación y sesgos: no documentados en la información disponible, pero aplicables al modelo base.
- El rendimiento depende críticamente de la velocidad de lectura aleatoria del disco; un almacenamiento lento degradará la latencia de forma severa.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria independiente.

## Enlaces

- [Hugging Face: anmol5656/GLM-5.3-colibri-int4-g64](https://huggingface.co/anmol5656/GLM-5.3-colibri-int4-g64)
- [Modelo base: zai-org/GLM-5.3](https://huggingface.co/zai-org/GLM-5.3)
- [Repositorio del motor colibrì](https://github.com/JustVugg/colibri)
