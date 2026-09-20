# cmeister/boundary-markers-ko-d12-bnd_wpd-mingram

## Resumen

Este repositorio contiene tres modelos de lenguaje en coreano (semillas 0, 1 y 2) entrenados con nanochat por cmeister para comparar vocabularios de subpalabras que marcan explicitamente las fronteras de palabra. Se trata de la replicacion en coreano del estudio "Explicit Boundary Markers for Subword Vocabularies" de Sander Land y Clara Meister (arXiv:2608.08847), que en el articulo se reporta para ingles. Los tres modelos comparten arquitectura y datos de entrenamiento y difieren unicamente en el tokenizador, de modo que las diferencias de rendimiento son atribuibles al esquema de tokenizacion.

La arquitectura es un transformer denso de 12 capas, ancho 768 y 6 cabezas de atencion, con una longitud de contexto de 2.048 tokens. El tokenizador `bnd_wpd` se entreno con MinGram sobre una muestra de 5 GB de Korean FineWeb, con un vocabulario de 34.685 entradas mas un token de inicio de secuencia (34.686 en el modelo). Ademas del marcado de fronteras de palabra, se marcan las secuencias de puntuacion y de digitos en el lado en el que se elimino un espacio.

Su relevancia es principalmente metodologica: es un artefacto de investigacion reproducible (pesos, configuracion, log de entrenamiento y hashes) para medir el efecto del marcado explicito de fronteras en un idioma distinto del ingles. No es un modelo de proposito general: no hay ajuste por instrucciones, no se publican benchmarks de tareas y el entrenamiento es deliberadamente corto (1.340 millones de tokens) para permitir comparaciones controladas entre tokenizadores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (implementacion nanochat, commit `92d63d4`); 12 capas, ancho 768, 6 cabezas de atencion |
| Parametros totales | no disponible (no se publica el recuento en la model card) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos en punto flotante PyTorch) |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch state dict (`seed<n>/model_002553.pt`, cargable con `torch.load(..., weights_only=True)`); tokenizador en JSON comprimido gzip |
| Tamano del vocabulario | 34.686 entradas (34.685 del tokenizador MinGram mas token de inicio de secuencia) |
| Tokens de entrenamiento | 1.340 millones (2.553 pasos de 524.288 tokens) |
| Datos de entrenamiento | 3 shards de Korean FineWeb-2 (`fineweb-2_0_1-quality_10-filterrobots`), 1.220 millones de caracteres, leidos aproximadamente 3,1 veces |
| Semillas incluidas | 3 (0, 1, 2) |
| Tamano del repositorio | 2,5 GB |

## Arquitectura y entrenamiento

Se trata de un transformer denso estandar definido por el proyecto nanochat de Andrej Karpathy, en su commit `92d63d4`: 12 capas, dimension de modelo 768, 6 cabezas de atencion y ventana de contexto de 2.048 tokens. El entrenamiento se lanzo con `paper_utils/boundary/downstream/run_arms.sh` del repositorio script_tok, usando una GPU por modelo, 2.553 pasos de 524.288 tokens cada uno (1.340 millones de tokens en total). No hay ninguna innovacion arquitectonica propia: la variable experimental es exclusivamente el tokenizador.

El tokenizador `bnd_wpd` se entrena con MinGram sobre una muestra de 5 GB de Korean FineWeb y anade marcadores explicitos de frontera de palabra; ademas marca las rachas de puntuacion y de digitos en el lado en el que se elimino un espacio. El fichero es `tokenizer/fineweb_ko_5gb_quick_bnd_wpd_mingram_v34685.json.gz` (sha256 `d632cdc246d851b18992b93c915b05ae92ac82cd90f8b5b80df5c42795df5e74`) y requiere la clase `BoundaryMinGramModel` del paquete `paper_utils.boundary.downstream.boundary_tokenizer` de script_tok para cargarse; no es un tokenizador compatible con `tokenizers` o `sentencepiece` sin ese codigo. El texto de entrenamiento son 3 shards de Korean FineWeb-2; la semilla fija la inicializacion de pesos y el orden de los shards, y ese orden es identico para todos los tokenizadores, de modo que los modelos con la misma semilla son directamente comparables. Con solo 3 shards, las semillas 1 y 2 sortearon el mismo orden de shards, por lo que las tres semillas cubren dos ordenes de datos y no tres. No se menciona RLHF, DPO ni ningun tipo de ajuste por preferencias.

## Capacidades

- Generacion de texto en coreano con una ventana de 2.048 tokens; el modelo es una base preentrenada, sin ajuste por instrucciones ni plantilla de chat.
- Modelado de lenguaje y puntuacion de texto (la metrica publicada es bits por byte sobre un shard de validacion de Korean FineWeb-2).
- Comparacion controlada de esquemas de tokenizacion: al compartir arquitectura, datos y semilla, la unica diferencia entre modelos del mismo repositorio es el vocabulario.
- Capacidad de servir como punto de partida para fine-tuning supervisado en coreano (clasificacion, resumen, extraccion, generacion acotada), dado que se distribuyen los pesos finales y la configuracion de entrenamiento.
- Reproducibilidad experimental: se incluyen log de entrenamiento completo (`train.log`), configuracion (`meta_002553.json`) y hashes de cada fichero (`archive.json`).
- No se declara soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio.
- No se declara capacidad multilingue: la model card indica unicamente coreano y los datos son exclusivamente Korean FineWeb-2.

## Casos de uso

- Investigacion sobre tokenizacion: medir el efecto de marcadores explicitos de frontera de palabra en coreano frente al tokenizador plano, usando los tres modelos como brazos experimentales con arquitectura y datos constantes.
- Replicacion y extension del articulo: el repositorio permite verificar el resultado del paper de Land y Meister en un idioma con escritura y segmentacion distintas del ingles, y comparar con los modelos en ingles que reporta el articulo.
- Linea base para experimentos de tokenizacion propios: al usar un esquema de entrenamiento fijo de 2.553 pasos y proporcionar el script de lanzamiento, sirve como referencia para evaluar un tokenizador nuevo bajo el mismo presupuesto de computo.
- Analisis de varianza por semilla: el repositorio publica los tres seeds y advierte que dos de ellos comparten orden de shards, lo que permite estudiar cuanto de la diferencia observada es inicializacion de pesos y cuanto es orden de datos.
- Fine-tuning en coreano para tareas acotadas: al ser un checkpoint denso de contexto corto, es adecuado como base para clasificacion de textos, analisis de sentimiento o extraccion de entidades en fragmentos de hasta 2.048 tokens.
- Prototipado y docencia sobre nanochat: el repositorio incluye pesos, configuracion, log y tokenizador, lo que lo hace util para reproducir un pipeline completo y barato de entrenamiento de un modelo de lenguaje pequeno.
- Evaluacion de tokenizadores en produccion: el tokenizador `bnd_wpd` puede analizarse de forma aislada (tamano de vocabulario, tasa de compresion en coreano, manejo de digitos y puntuacion) antes de decidir si conviene adoptar marcadores de frontera en un pipeline real.
- Generacion de texto de alcance corto en coreano: continuacion de parrafos, generacion de resumenes breves o reescritura de fragmentos, siempre tras un ajuste especifico, dado que no hay modo conversacional.

## Benchmarks y rendimiento

La unica metrica publicada es la perdida de validacion en bits por byte (bpb), calculada como la perdida sumada sobre un shard de validacion de Korean FineWeb-2 dividida por la longitud UTF-8 real del texto puntuado. Menor es mejor y los valores solo son comparables dentro del mismo idioma.

| Semilla | bpb de este modelo | Diferencia "plain menos este modelo" |
|---|---|---|
| 0 | 0,85031 | -0,00330 |
| 1 | 0,84980 | -0,00088 |
| 2 | 0,84998 | -0,00271 |
| Media | 0,85003 (calculada a partir de las tres semillas) | -0,00230 (publicada) |

Desviacion tipica entre semillas: 0,00126. La model card aclara que una diferencia positiva significaria que el esquema con marcadores puntua mejor (menor bpb) que el tokenizador plano. Los valores publicados son negativos en las tres semillas, es decir, el tokenizador plano obtiene un bpb ligeramente inferior (mejor) que `bnd_wpd` en coreano, con una diferencia media de 0,00230 bpb. El propio autor advierte que tres semillas dan una direccion, no una estimacion precisa, y que la comparacion completa entre esquemas, entrenadores e idiomas esta en el repositorio script_tok.

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ninguna otra tarea en la informacion disponible.

## Requisitos de hardware

- La model card no publica el recuento de parametros ni requisitos de memoria. A partir de la configuracion declarada (12 capas, ancho 768, vocabulario de 34.686), puede estimarse un modelo del orden de 100 a 140 millones de parametros; es una estimacion derivada, no un dato publicado por el autor.
- Bajo esa estimacion, la inferencia en fp32 ocuparia aproximadamente 0,4 a 0,6 GB de VRAM y en fp16 alrededor de 0,2 a 0,3 GB, sin contar el estado de activaciones ni la cache KV para 2.048 tokens, que es despreciable a esta escala. El entrenamiento, en cambio, es mas exigente porque cada uno de los tres modelos se entreno en una GPU completa durante 2.553 pasos con lotes de 524.288 tokens.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti, RTX 4090, e incluso en GPUs integradas o CPU para inferencia en fp32 con lotes pequenos. No requiere A100 ni H100 salvo que se quiera reproducir el entrenamiento completo con el mismo throughput.
- Opciones de despliegue: los pesos son state dicts de PyTorch, por lo que la via directa es cargarlos con PyTorch y el codigo de nanochat. No hay versiones GGUF, ni integracion publicada con vLLM, TGI, Ollama o llama.cpp; usarlos requeriria convertir los pesos y reimplementar la configuracion del modelo. El tokenizador tampoco es estandar y necesita el codigo de script_tok.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de latencia en la informacion proporcionada. Dado el tamano, un unico GPU moderno daria throughput muy alto, pero es una inferencia, no un dato medido.

## Comparativa con modelos similares

La comparacion natural es interna al propio estudio: el tokenizador `plain` como referencia, entrenado con la misma arquitectura, los mismos datos y las mismas semillas, y las variantes de marcado de frontera del resto del trabajo. No se dispone de datos de otros modelos de la misma categoria en la informacion proporcionada.

| Modelo | Idioma | Arquitectura | Contexto | Tokenizador | bpb de validacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Este modelo (`bnd_wpd`, 12 capas) | Coreano | Transformer denso 12x768, 6 cabezas | 2.048 | MinGram con marcadores de frontera de palabra, puntuacion y digitos | 0,85003 (media de 3 semillas) | Apache-2.0 | Pesos PyTorch en HuggingFace |
| Referencia `plain` (mismo estudio) | Coreano | Identica | 2.048 | Subpalabras sin marcadores | Aproximadamente 0,00230 bpb inferior (mejor) en media | No disponible como modelo publicado | No disponible |
| Otras variantes de marcado (`bnd_w`, etc.) | Coreano | Identica | 2.048 | Otros esquemas de marcado | No disponible en esta ficha; el autor remite a script_tok | No disponible | No disponible |
| Modelos en ingles del articulo | Ingles | Similar | No disponible | Esquemas de marcado | No disponible en la informacion proporcionada | No disponible | No disponible |

## Limitaciones y advertencias

- Es un artefacto de investigacion, no un modelo listo para producto: no hay ajuste por instrucciones, ni plantilla de chat, ni evaluacion de seguridad.
- No se han publicado benchmarks de tareas (MMLU, HumanEval, GSM8K u otros), por lo que no se puede afirmar nada sobre su calidad en razonamiento, codigo o matematicas.
- Riesgo de alucinacion: es un modelo de lenguaje preentrenado de ~1.340 millones de tokens de entrenamiento; generara texto plausible sin garantia de veracidad y probablemente repetitivo en generaciones largas.
- Cobertura idiomatica limitada a coreano. No se declara ningun otro idioma y los datos de entrenamiento son exclusivamente Korean FineWeb-2, por lo que el rendimiento fuera del coreano sera marginal.
- Contexto muy corto (2.048 tokens), que limita resumen de documentos largos, RAG con muchos pasajes y conversaciones multi-turno extensas.
- El resultado del estudio es desfavorable para el esquema con marcadores en coreano: el tokenizador plano obtiene mejor bpb en las tres semillas, aunque la muestra de tres semillas solo da una direccion, no una estimacion precisa, segun el propio autor.
- Dos de las tres semillas (1 y 2) sortearon el mismo orden de shards, por lo que la variabilidad observada mezcla inicializacion de pesos y orden de datos de forma desigual; la cobertura efectiva es de dos ordenes de datos.
- Dependencia de codigo externo: cargar el tokenizador exige clonar script_tok y usar `BoundaryMinGramModel`; los pesos requieren el codigo de nanochat. No hay integracion con ecosistemas estandar de inferencia.
- Licencia Apache-2.0, que permite uso comercial y modificacion, pero los datos subyacentes provienen de FineWeb-2 y conviene revisar las condiciones de la release `fineweb-2_0_1-quality_10-filterrobots` antes de un uso comercial.
- Senala la model card que los modelos entrenados con distinta semilla difieren en la inicializacion de pesos, y que el orden de shards es identico para todos los tokenizadores con la misma semilla; cualquier comparacion fuera de ese diseno controlado no es valida.
- Cero descargas y cero likes en el momento de la consulta, sin mantenimiento posterior declarado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cmeister/boundary-markers-ko-d12-bnd_wpd-mingram
- Articulo "Explicit Boundary Markers for Subword Vocabularies" (Sander Land y Clara Meister): https://arxiv.org/abs/2608.08847
- Repositorio script_tok (tokenizador, scripts de entrenamiento y comparacion completa): https://github.com/sanderland/script_tok
- Repositorio nanochat (arquitectura y codigo de entrenamiento, commit `92d63d4`): https://github.com/karpathy/nanochat
- Dataset Korean FineWeb-2, release `fineweb-2_0_1-quality_10-filterrobots`, citado como fuente de los datos de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
