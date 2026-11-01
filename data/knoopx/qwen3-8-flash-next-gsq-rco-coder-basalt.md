# knoopx/Qwen3.8-Flash-Next-GSQ-RCO-Coder-Basalt

## Resumen

Qwen3.8-Flash-Next-GSQ-RCO-Coder-Basalt es un empaquetado en formato Basalt del modelo Qwen3.8-Flash-Next, un transformer de tipo Mixture-of-Experts (MoE) desarrollado originalmente por Alibaba Qwen. Esta variante concreta la publica el usuario knoopx y deriva de la release ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-Coder-GGUF, que a su vez aplica una poda de expertos enrutados (256 de 512 por capa) sobre el modelo base y una cuantizacion de precision mixta seleccionada por RCO (Rate-constrained optimization). El resultado es un unico fichero de 57,43 GiB que conserva la geometria de 176,9 mil millones de parametros del modelo original.

El modelo resuelve el problema de desplegar un MoE de gran tamano en hardware de consumo o en estaciones de trabajo con una sola GPU Blackwell (sm_120), manteniendo en memoria de sistema los expertos que no caben en la tarjeta y sin cargar en RAM la tabla n-gram de 26,8 GiB. La arquitectura declarada es `qwen4exp` con 48 capas, 256 expertos con 10 activos por token, 262.144 tokens de contexto, 24 cabezas de atencion sobre 2 cabezas KV y matrices de hiper-conexion en atencion y FFN de cada capa. Incluye un drafter de decodificacion especulativa (MTP) y un proyector de vision.

Es relevante ahora porque demuestra una via practica de servir un MoE de casi 177 mil millones de parametros con cuantizacion agresiva (3,33 bits por parametro de experto retenido, 1,67 bits medidos contra el layout completo de 512 expertos) en un unico fichero y con API compatible con OpenAI y Anthropic. No obstante, no se han publicado mediciones de perplejidad, divergencia KL ni velocidad para este empaquetado concreto, por lo que su calidad frente al modelo base esta aun por verificar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (`qwen4exp`), 48 capas, hiper-conexiones en atencion y FFN |
| Parametros totales | 176,9 mil millones (modelo base) |
| Parametros activos | 10 expertos activos por token sobre 256 retenidos (512 en el original) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Precision mixta por capa: IQ2_S, IQ3_XXS, IQ3_S, IQ4_XS, IQ4_NL, Q2_0; tabla PLE en IQ4_NL; drafter en q2_0 |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como `other` en HuggingFace) |
| Formato de pesos | Basalt (fichero unico `.basalt`, 61.668.558.532 bytes) |

## Arquitectura y entrenamiento

El modelo es un transformer MoE con 48 capas, 256 expertos enrutados por capa y 10 activos por token, 24 cabezas de atencion sobre 2 cabezas KV (GQA) y matrices de hiper-conexion (`hyper_connection.count 4`) tanto en atencion como en FFN. La tabla PLE (probablemente positional/lookup embeddings) es un n-gram de 3-gramas de 26,82 GiB almacenado en IQ4_NL. El empaquetado Basalt divide el fichero en secciones: `experts` (23,42 GiB, los 256 expertos retenidos de cada capa), `gguf` (30,97 GiB, tensores no-expertos byte a byte), `dense` (1,37 GiB, copias en coma flotante que lee el motor), `mtp/*` (786 MiB, drafter especulativo y su vocabulario de propuestas), `vision/*` (876 MiB, proyector de imagen y vocabulario) y metadatos, tokenizer y perfiles (18 MiB).

El entrenamiento original del modelo base Qwen3.8-Flash-Next no se detalla en la informacion disponible (numero de tokens, composicion del dataset, RLHF/DPO). Lo que si se documenta es el proceso de compresion: la release ISTA-DASLab aplica poda de la mitad de los expertos enrutados y asigna codificaciones de precision mixta por capa elegidas por RCO, con 15 capas en gate/up IQ2_S + down IQ4_NL, 14 en IQ3_XXS + IQ4_NL, 9 en IQ3_S + IQ4_NL, 5 en IQ2_S + Q2_0, 3 en IQ3_XXS + Q2_0, 1 en IQ3_S + Q2_0 y 1 en IQ4_XS + IQ4_NL. El drafter MTP se injerta desde el pack `Qwen3.8-FN-GSQ-RCO-IQ3_S.basalt` porque el GGUF del coder no trae capa MTP; por tanto el drafter es el del modelo GSQ-RCO sin podar, no uno podado para coder. El perfil de expertos es el orden de relleno simple del conversor, no derivado de trazas de enrutamiento, lo que penaliza la decodificacion en frio.

## Capacidades

- Generacion de texto conversacional y razonamiento general, heredadas del modelo base Qwen3.8-Flash-Next.
- Generacion de codigo: la release de origen es especificamente "Coder", orientada a tareas de programacion.
- Entrada de imagen: el pack incluye proyector de vision (`vision/mmproj`, `vision/text_vocab`) y requiere `"vision": 0` en la configuracion del servidor y el binario `basalt-vision`.
- Decodificacion especulativa mediante capa MTP con drafter propio y vocabulario de propuestas.
- Servidor con API compatible con OpenAI y Anthropic (`bin/basalt serve`), lo que facilita la integracion con clientes existentes.
- Contexto largo de 262.144 tokens, adecuado para conversaciones multi-turno extensas o analisis de repositorios completos.
- Capacidades de tool calling / function calling: no documentadas explicitamente en la informacion disponible.

## Casos de uso

- Asistencia de programacion en local: el modelo puede generar y completar codigo en un equipo con una GPU Blackwell, manteniendo los expertos no residentes en RAM del sistema, lo que permite trabajar con un MoE de 176,9B sin cluster.
- Analisis de repositorios completos: con 262.144 tokens de contexto puede ingerir varios ficheros de codigo y responder preguntas cruzadas sobre ellos en una sola pasada.
- Sustitucion de API en herramientas existentes: al exponer endpoints compatibles con OpenAI y Anthropic, se puede apuntar un IDE o un agente ya configurado contra `127.0.0.1:8080` sin reescribir el cliente.
- Prototipado de agentes multi-paso: la decodificacion especulativa MTP reduce la latencia de generacion en tareas con muchas llamadas cortas, tipico de bucles de agente.
- Procesamiento de documentacion con imagenes: el proyector de vision permite extraer informacion de diagramas, capturas o PDFs renderizados junto a texto.
- Despliegue en estacion de trabajo de investigacion: util para experimentar con tecnicas de poda de expertos y cuantizacion mixta comparando este pack contra el GSQ-RCO IQ3_S de referencia.
- Inferencia offline o en entornos con requisitos de privacidad: al correr en local no se envian datos a servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica que no hay mediciones de PPL, KLD ni velocidad para este pack, y que su calidad no es equiparable a las filas de la tabla oficial de packs Basalt hasta que se ejecute una evaluacion. Tampoco se proporcionan puntuaciones de codigo.

## Requisitos de hardware

- VRAM: el pack completo ocupa 57,43 GiB en disco; los expertos retenidos suman 23,42 GiB. La VRAM necesaria depende del numero de expertos residentes en GPU y del cache KV (configurable en `int8`), pero no se ha publicado una cifra concreta.
- GPU: requiere NVIDIA Blackwell (sm_120) segun la model card. Los expertos que no caben en la tarjeta se quedan en RAM del sistema; la tabla n-gram de 26,8 GiB nunca se carga en RAM.
- GPU de consumo: no se especifica compatibilidad con RTX 4090 u otras arquitecturas anteriores a Blackwell; la model card solo menciona sm_120.
- Despliegue: motor Basalt (`bin/basalt serve`), con configuracion `expert-cache: auto`, `prefill: auto`, `kv: int8`, `resident-experts: true`. Se recomienda ejecutar `basalt-probe` para medir la maquina y obtener valores de partida.
- Vision: requiere `"vision": 0` en la seccion de servidor y el binario `basalt-vision` junto a `bin/basalt`.
- Latencia y throughput: no disponibles. La model card advierte que la decodificacion en frio es mas lenta que en un pack oficial por el perfil de expertos de relleno simple, y sugiere ejecutar con `--expert-profile-save FILE` y reconvertir con `--profile FILE` para corregirlo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-GSQ-RCO-Coder-Basalt (este) | 176,9B (256 expertos retenidos) | 262.144 | Mixta, 3,33 bpw por experto retenido | qwen-community-1.0 | Basalt |
| ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-Coder-GGUF | 176,9B (256 expertos retenidos) | 262.144 | Mixta (pack IQ3_S de 46,8 GiB en expertos) | qwen-community-1.0 | GGUF |
| Qwen3.8-Flash-Next (base) | 176,9B (512 expertos) | 262.144 | Original en BF16 | qwen-community-1.0 | safetensors / GGUF |
| Qwen3.8-Flash-Next-Basalt (pack oficial) | 176,9B (512 expertos) | 262.144 | Basalt oficial | qwen-community-1.0 | Basalt |

La diferencia principal frente al GGUF de origen es el tamano de la capa de expertos (23,42 GiB frente a 46,8 GiB) a costa de la mitad de expertos enrutados. Frente al modelo base, este pack reduce drasticamente el espacio en disco pero introduce perdida de calidad no medida.

## Limitaciones y advertencias

- Calidad no verificada: no hay PPL, KLD ni evaluaciones de codigo publicadas para este pack; la model card advierte explicitamente que su calidad no es equiparable a la de los packs oficiales hasta que se mida.
- Poda de expertos: se eliminan 256 de 512 expertos por capa, lo que puede degradar el rendimiento en dominios poco representados en el enrutamiento original.
- Drafter no podado: la capa MTP se injerta desde el pack GSQ-RCO sin podar, por lo que el drafter y el modelo principal no estan coadaptados; esto puede afectar a la tasa de aceptacion de la decodificacion especulativa.
- Perfil de expertos suboptimo: el perfil es el orden de relleno del conversor, no derivado de trazas de enrutamiento, lo que penaliza la latencia en decodificacion en frio.
- Hardware restringido: requiere GPU NVIDIA Blackwell (sm_120); no se documenta soporte para arquitecturas anteriores.
- Idiomas: no se especifican los idiomas soportados en la informacion disponible.
- Licencia: qwen-community-1.0, etiquetada como `other`; conviene revisar los terminos de la licencia Qwen Community antes de uso comercial.
- Riesgo de alucinacion: inherente a los modelos generativos; no hay evaluaciones de factualidad en la informacion disponible.
- Tool calling y agentes: no documentados explicitamente; la compatibilidad de API no garantiza soporte funcional de function calling.
- Ecosistema limitado: el formato Basalt y el motor son especificos de este proyecto, con menos herramientas de terceros que GGUF o safetensors.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/knoopx/Qwen3.8-Flash-Next-GSQ-RCO-Coder-Basalt
- Modelo base GGUF de origen: https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-Coder-GGUF
- Modelo base original: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Pack oficial Basalt: https://huggingface.co/jesdga/Qwen3.8-Flash-Next-Basalt
- Repositorio del motor Basalt: https://github.com/jesdga95/basalt
- Documentacion de `basalt-probe`: https://github.com/jesdga95/basalt/blob/main/docs/probe.md
- Paper GSQ (referencia arxiv:2604.18556): https://arxiv.org/abs/2604.18556
- Paper RCO (referencia arxiv:2605.00649): https://arxiv.org/abs/2605.00649
