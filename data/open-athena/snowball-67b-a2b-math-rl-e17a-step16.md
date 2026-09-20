# open-athena/Snowball-67B-A2B-Math-RL-E17a-Step16

# Snowball-67B-A2B-Math-RL-E17a-Step16

## Resumen

Snowball-67B-A2B-Math-RL-E17a-Step16 es un checkpoint de investigación publicado por la organización open-athena dentro de la campaña Snowball, asociada al proyecto Marin. Se trata de un artefacto congelado de un experimento de aprendizaje por refuerzo sobre tareas de matemáticas (RLVR, reinforcement learning with verifiable rewards), correspondiente al brazo E17a y al paso 16, que el propio autor identifica como la mejor fila de ese brazo en su registro de evaluaciones.

El modelo tiene 67.078.876.160 parámetros totales (unos 67,08 mil millones) almacenados en safetensors, con un repositorio de 134,2 GB, lo que es coherente con pesos en precisión bf16. La etiqueta `grug_moe` y el sufijo `A2B` del nombre apuntan a una arquitectura de mezcla de expertos (MoE) con aproximadamente 2B de parámetros activos por token, aunque este dato no se confirma explícitamente en la información disponible.

Su relevancia es estrictamente metodológica: documenta el resultado de un experimento de RL sobre matemáticas con un router congelado, e incluye una advertencia explícita de que otros repositorios de nombre similar (`laion/rl-snowball-*`) pueden contener exportaciones con router mutable que colapsan en inferencia. No es un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) segun la etiqueta `grug_moe`; no se detalla el numero de expertos ni la capa de enrutamiento |
| Parametros totales | 67.078.876.160 (aproximadamente 67,08B) |
| Parametros activos | No disponible de forma explicita; el sufijo `A2B` del nombre sugiere unos 2B activos, sin confirmar |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; el repositorio solo publica pesos en safetensors (precisamente bf16, segun el tamano) |
| Idiomas soportados | No disponible |
| Licencia | other (sin terminos detallados en la informacion disponible) |
| Formato de pesos | safetensors, con `config.json`, ficheros de tokenizer y `model.safetensors.index.json` |
| Tamano del repositorio | 134,2 GB |
| Pipeline declarado | reinforcement-learning |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La informacion disponible solo permite afirmar que se trata de un modelo de mezcla de expertos (etiqueta `grug_moe`), integrado en el ecosistema Marin, y que el artefacto es un checkpoint de política (`policy`) exportado en el paso global 16 del brazo E17a. No se documentan en la model card el número de capas, el número de expertos, la estrategia de enrutamiento ni la longitud de contexto soportada.

En cuanto al entrenamiento, la ruta del artefacto de origen (`.../rl-snowball-e17a-rno2a-rlvrmath-frozen-sr-...`) indica un proceso de RL con recompensas verificables sobre matemáticas, con router congelado (`frozen`) y algún tipo de penalización o regularización (`sr`). La model card insiste en que el estado del router es "frozen router bias; zero drift", y que preservar esa integridad es condición necesaria para que el checkpoint sea utilizable. No se especifican el volumen de tokens, la composición del dataset, ni si hubo fases previas de SFT o preferencias (DPO/RLHF).

## Capacidades

- Generacion de texto y resolucion de problemas matematicos: los unicos resultados reportados son en AIME24, MATH-500 y OlympiadBench, todos ellos benchmarks de razonamiento matematico.
- Razonamiento de multiples pasos orientado a competicion matematica, con cadenas de razonamiento derivadas del entrenamiento por RL.
- No hay evidencia en la informacion disponible de soporte de tool calling, function calling, uso de agentes, vision, audio ni modo "thinking" explicito.
- No se documentan capacidades multilingues ni idiomas soportados.
- Se desconoce si conserva capacidades generales de proposito general; el artefacto es un checkpoint de investigacion.

## Casos de uso

- Reproducibilidad de experimentos de RL: el checkpoint permite verificar la fila reportada en el brazo E17a, paso 16, usando el archivo de evidencias y el issue del proyecto Marin como referencia.
- Investigacion sobre enrutamiento en MoE: sirve como caso de estudio de un router congelado y de los fallos de inferencia asociados a exportaciones con router mutable.
- Analisis de RLVR en matematicas: comparar el comportamiento en AIME24, MATH-500 y OlympiadBench frente a otros pasos o brazos de la misma campaña.
- Auditoria de artefactos de investigacion: el repositorio incluye advertencias sobre repositorios homonimos, lo que lo hace util para estudiar practicas de publicacion y trazabilidad de checkpoints.
- Punto de partida para experimentos posteriores: continuar el entrenamiento o aplicar tecnicas de reparacion del sesgo del router antes de cualquier uso práctico.
- Evaluacion de infraestructura de inferencia para MoE de ~67B: medir requisitos de memoria y comportamiento de despliegue en vLLM, SGLang o TGI a partir de un artefacto congelado.
- No se recomienda su uso en atencion al cliente, generacion de codigo en produccion ni ninguna aplicacion de cara al usuario con los datos disponibles.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| AIME24 | 15,33 | Evaluacion held-out, segun la model card |
| MATH-500 | 75,60 | Evaluacion held-out, segun la model card |
| OlympiadBench | 19,67 | Evaluacion held-out, segun la model card |

No se especifica la metrica exacta (se asume porcentaje de acierto) ni el protocolo de evaluacion completo; los detalles se remiten a `MATH_EVALS.md` en el archivo de evidencias. No se han publicado en la informacion disponible resultados de otros benchmarks como MMLU, HumanEval o GSM8K, ni comparaciones directas con modelos de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16, los pesos ocupan aproximadamente 134 GB, por lo que se necesitan al menos 140-150 GB de VRAM contando cache KV y overhead; en int8, unos 70 GB; en int4, unos 35-40 GB.
- GPU recomendadas: 2x A100 80 GB o 2x H100 80 GB en bf16; 4x A6000 48 GB o 4x L40S 48 GB como alternativas en bf16; 1x H200 141 GB al limite en bf16.
- GPU de consumo: no cabe en una sola GPU de consumo en bf16 ni en int8. En cuantizacion de 4 bits podria caber en 2x RTX 4090 24 GB (48 GB) o en 2x RTX 5090 32 GB (64 GB), siempre que exista una conversion GGUF/AWQ/GPTQ, que no se publica en el repositorio.
- Opciones de despliegue: vLLM, SGLang y TGI son las vias razonables para safetensors; llama.cpp y Ollama requeririan convertir los pesos a GGUF, conversion no disponible actualmente.
- Latencia y throughput: no disponibles. Al ser un MoE con muy pocos parametros activos por token, el rendimiento estara limitado por ancho de banda de memoria si todos los expertos residen en VRAM.
- Nota critica: los pesos solo son funcionales si se conserva el sesgo de router congelado; el autor advierte que ciertas exportaciones alternativas de la misma campaña colapsan bajo inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento reportado |
|---|---|---|---|---|---|
| Snowball-67B-A2B-Math-RL-E17a-Step16 | 67,08B totales | No disponible | other | HuggingFace, 0 descargas | AIME24 15,33 / MATH-500 75,60 / OlympiadBench 19,67 |
| `laion/rl-snowball-*` (repositorios relacionados citados) | No disponible | No disponible | No disponible | No disponible | No disponible; el autor advierte que pueden colapsar en inferencia |
| Otros modelos de razonamiento matematico de tamano similar | No disponible | No disponible | No disponible | No disponible | No se han encontrado datos comparables en la informacion disponible |

No hay datos suficientes en la informacion proporcionada para establecer una comparativa cuantitativa fiable con modelos alternativos.

## Limitaciones y advertencias

- Artefacto de investigacion, no una version de produccion: el propio autor indica que la utilidad es limitada salvo que se preserve la integridad del router congelado.
- Riesgo de colapso en inferencia si se sustituye por repositorios de nombre similar (`laion/rl-snowball-*`) con router mutable y sesgo no reparado.
- Licencia `other` sin terminos detallados: se desconoce si el uso comercial esta permitido, por lo que debe tratarse como restringido hasta consultar la licencia completa.
- Riesgo de alucinacion: no documentado en la informacion disponible, pero esperable en un modelo entrenado con RL sobre un dominio acotado.
- Idiomas soportados no declarados: el comportamiento fuera del ingles y de tareas matematicas es desconocido.
- Longitud de contexto no declarada: no se puede planificar su uso en conversaciones largas o documentos extensos.
- Sesgos conocidos: no disponibles. No se documenta ninguna evaluacion de sesgo, toxicidad o seguridad.
- Rendimiento absoluto bajo en benchmarks de competicion (AIME24 15,33 y OlympiadBench 19,67), lo que limita su utilidad practica incluso dentro del dominio matematico.
- Requiere conservar conjuntamente `config.json`, el tokenizer y todos los shards listados en `model.safetensors.index.json`; un repositorio incompleto no es cargable.
- Sin cuantizaciones oficiales publicadas: cualquier despliegue en hardware limitado exige un proceso de conversion propio y su validacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/open-athena/Snowball-67B-A2B-Math-RL-E17a-Step16
- Archivo de evidencias (dataset): https://huggingface.co/datasets/penfever/snowball-67b-a2b-math-rl-artifacts
- Issue del experimento en el proyecto Marin: https://github.com/marin-community/marin/issues/7786
- Repositorio del proyecto Marin (organizacion propietaria del issue anterior): https://github.com/marin-community/marin
- Artefacto de origen (ruta S3 interna, no accesible publicamente): s3://marin-us-east-02a/marin/users/benjaminfeuer/skyrl/rl-snowball-e17a-rno2a-rlvrmath-frozen-sr-20260823-202556/exports/global_step_16/policy/
