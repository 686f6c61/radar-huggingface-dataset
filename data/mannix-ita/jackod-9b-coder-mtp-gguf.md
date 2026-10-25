# ManniX-ITA/JackOD-9B-Coder-MTP-GGUF

## Resumen

JackOD-9B-Coder-MTP-GGUF es la distribucion en formato GGUF de JackOD-9B-Coder, un modelo de lenguaje de ~9.200 millones de parametros construido por ManniX-ITA mediante un merge de cuatro vias con el metodo `omnimerge_v2` sobre el ancestro comun Qwen/Qwen3.5-9B. No es un entrenamiento desde cero ni un ajuste fino: es una fusion de pesos de tres derivados de Qwen3.5-9B (DeltaCoder-9B con peso 0,55, Ornith-1.5-9B con 0,30 y Qwopus3.5-9B-Coder-Flash con 0,15 en la receta v3), tomada contra el modelo base como `--task-base`. El objetivo declarado es el codigo agentico multiturno: mantenerse en una tarea a lo largo de varios turnos y llamadas a herramientas hasta terminarla y entonces detenerse.

El repositorio es exclusivamente de cuantizacion: publica 28 variantes GGUF (desde IQ2_XS hasta F16), todas las tiers `_K` e `IQ` calibradas con imatrix, incluida Q6_K. La matriz de calibracion se publica como `imatrix.dat` para que las cuantizaciones se puedan auditar y reproducir. El modelo es solo texto: la model card es explicita en que no hay torre de vision, que los 775 tensores del modelo no incluyen ningun `visual.*` y que el `vision_config` del `config.json` es metadatos heredados sin pesos detras, por lo que no se publica `mmproj`.

La relevancia actual viene de dos factores. Primero, conserva intacta la cabeza MTP (multi-token prediction) del modelo base, que se excluye del merge y se transfiere sin tocar, de modo que la cabeza de draft sobrevive en los GGUF si el runtime la aprovecha. Segundo, la version v3 (24 de octubre de 2026) publica resultados medidos con su propio sampler de servicio sobre Q6_K: 0,8720 en HumanEval y 0,9455 en LiveCodeBench v6 (52 de 55 problemas resueltos). La licencia es Apache 2.0 y el modelo solo declara ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso Qwen3.5 (merge de pesos, no MoE) |
| Parametros totales | 9.197.093.888 (~9,20 B) segun safetensors; la model card declara 9,65 B |
| Parametros activos | No aplica (modelo denso, sin mezcla de expertos) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | CD-Q2_K, CD-Q3_K_L, CD-Q4_K_M, CD-Q5_K_M, CD-Q6_K, F16, IQ2_M, IQ2_S, IQ2_XS, IQ3_M, IQ3_XS, IQ3_XXS, IQ4_NL, IQ4_XS, Q2_K_L, Q3_K_L, Q3_K_M, Q3_K_S, Q3_K_XL, Q4_K_L, Q4_K_M, Q4_K_S, Q5_K_L, Q5_K_M, Q5_K_S, Q6_K, Q6_K_L, Q8_0 (28 variantes) |
| Idiomas soportados | Ingles (`en`) unicamente, segun la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base del que derivan se distribuye en safetensors) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.5-9B: un transformer denso de ~9,2 B de parametros que sirve como ancestro compartido de las tres fuentes del merge. La construccion no usa entrenamiento adicional, sino `omnimerge_v2` con densidad 0,53, `darex-q` 0,75 y semilla 42, aplicado con `--base` y `--task-base` fijados a Qwen3.5-9B y con los patrones `visual.,mtp.` excluidos del merge. Esa exclusion es deliberada: la cabeza MTP se hereda intacta del base, de modo que el draft head queda presente en los GGUF publicados, mientras que la rama visual se descarta porque no existen pesos detras.

Un detalle critico documentado por el autor es la correccion de tokens especiales. Qwen3.5-9B, DeltaCoder-9B fusionado y Coder-Flash no llevan `eos_token_id` en la raiz de la configuracion (vive solo en la config anidada de texto), y el conversor a GGUF lee la raiz, no encuentra nada y aplica un fallback, lo que introduce un terminador incorrecto y provoca fugas de tokens de control en las generaciones. El merge fija `eos_token_id` 248046 y `pad_token_id` 248055 en la raiz y toma el tokenizer y la plantilla de chat de Coder-Flash. La cadena de build reproducible esta publicada en el repositorio `omnimergekit`. No hay datos disponibles sobre volumen de tokens de entrenamiento ni sobre fases de RLHF o DPO, porque el modelo no se entrena en esta etapa: hereda el comportamiento de sus fuentes.

## Capacidades

- Generacion de codigo en multiples lenguajes, con resultados medidos en HumanEval, HumanEval+, MultiPL-E y LiveCodeBench v6.
- Razonamiento con presupuesto de pensamiento configurable: la evaluacion oficial se hizo con `--reasoning-budget` de 12.288 tokens.
- Codigo agentico multiturno: el objetivo declarado del merge es sostener una tarea a traves de turnos y llamadas a herramientas hasta completarla y detenerse.
- Tool calling / function calling: aparece de forma explicita en los tags del repositorio.
- Capacidad de seguir instrucciones, medida con IFEval (0,9400 en la evaluacion v3).
- Cabeza MTP conservada en los GGUF, lo que habilita decodificacion especulativa si el runtime la soporta.
- Conversacional multiturno con plantilla de chat propia (heredada de Coder-Flash).
- No dispone de vision, audio ni ninguna modalidad distinta del texto.

## Casos de uso

- Agente de codigo en terminal o IDE: el modelo puede encadenar lecturas de ficheros, edicion y ejecucion de tests a lo largo de varios turnos, y su entrenamiento esta orientado precisamente a no abandonar la tarea antes de cerrarla.
- Integracion en pipelines de CI/CD: con soporte de tool calling, se puede invocar desde un runner para generar parches, interpretar fallos de compilacion y proponer correcciones sobre el diff, con la ventaja de que un GGUF Q6_K ocupa aproximadamente 7,5 GB y cabe en GPUs de gama alta de consumo.
- Reparacion de codigo sobre benchmarks de competicion: el 0,9455 en LiveCodeBench v6 (55 problemas duros) lo situa como candidato para tareas de algoritmia donde se requiere razonamiento largo y correctitud estricta.
- Asistente de refactorizacion en monorepos: la ventana de contexto no esta documentada, pero el diseno multiturno con plantilla de chat permite mantener el hilo de una refactorizacion por pasos en lugar de exigir un unico prompt gigante.
- Despliegue local y air-gapped: al ser GGUF con licencia Apache 2.0 y sin dependencia de servicios externos, encaja en entornos con requisitos de soberania de datos donde no se puede llamar a una API.
- Evaluacion y comparacion de merges: el repositorio publica `imatrix.dat` con su sha256 y la receta exacta en `omnimergekit`, lo que permite reproducir las cuantizaciones y auditar el efecto de la calibracion, un caso de uso util para investigadores que estudian tecnicas de fusion de pesos.
- Generacion de tests unitarios a partir de codigo existente: la combinacion de IFEval alto y entrenamiento en codigo lo hace util para producir suites de prueba con formato consistente.

## Benchmarks y rendimiento

Resultados publicados para la version v3, medidos sobre `JackOD-9B-Coder-Q6_K.gguf` (sha256 `3f202a76…51b8`) con llama.cpp `311d4211bf`, sampler de servicio (temperatura 0,4 / top_p 0,95 / top_k 20 / min_p 0 / repeat_penalty 1,002 sobre los ultimos 112 tokens / presence_penalty 1,05), semilla aleatoria por peticion y presupuesto de pensamiento de 12.288 tokens.

| Benchmark | JackOD v3 |
|---|---|
| HumanEval (164) | 0,8720 |
| HumanEval+ (164) | 0,8049 |
| LiveCodeBench v6 (55 hard) | 0,9455 |
| MultiPL-E (300) | 0,8033 |
| IFEval (100) | 0,9400 |

Advertencias del propio autor que conviene retener: son puntuaciones muestreadas, una sola extraccion por problema, y no son comparables en la misma base que las tablas de v2 y v1, que se midieron en modo greedy. En estos tamanos de conjunto, un problema equivale a 1,8 puntos porcentuales en LiveCodeBench y 0,6 en HumanEval. En LiveCodeBench se resolvieron 52 de 55; las 55 generaciones terminaron por si solas, sin alcanzar el limite de longitud, y los 3 fallos son respuestas incorrectas o errores en tiempo de ejecucion, no truncamientos. Una ejecucion provisional con otro sampler (temperatura 0,7, semilla 42) resolvio 50 de 55 y queda supersedida. No se han publicado resultados de benchmarks de los modelos comparables en la informacion disponible.

## Requisitos de hardware

- VRAM estimada de pesos (calculada a partir de los 9,2 B de parametros; no son cifras publicadas por el autor): IQ2_XS/IQ2_S en torno a 2,5-3,2 GB; Q2_K_L/IQ2_M en torno a 3,3-3,8 GB; IQ3_XXS/IQ3_XS en torno a 3,9-4,4 GB; Q4_K_M/IQ4_XS en torno a 5,6-6,0 GB; Q5_K_M en torno a 6,5-7,0 GB; Q6_K en torno a 7,4-8,0 GB; Q8_0 en torno a 9,8-10,2 GB; F16 en torno a 18,5-19,5 GB.
- A esas cifras hay que sumar la cache KV, cuyo coste no se puede estimar con precision porque la longitud de contexto no esta documentada en la informacion disponible.
- GPU profesionales: A100 40/80 GB y H100 permiten F16 y Q8_0 con contexto amplio y batching. Una A100 40 GB cubre sin problema cualquier cuantizacion de la lista.
- GPU de consumo: RTX 4090 (24 GB) ejecuta F16 con contexto moderado, y Q6_K o Q8_0 con margen amplio. RTX 3090/4080 (16-24 GB) van comodas en Q6_K. Tarjetas de 8-12 GB (RTX 4060 Ti 16 GB, RTX 3060 12 GB, RTX 4070) son suficientes para Q4_K_M y Q5_K_M.
- Despliegue: llama.cpp es el runtime de referencia (la evaluacion oficial se hizo con ese backend y esa version de commit); tambien es compatible con Ollama y con servidores basados en llama.cpp que lean el campo `endpoints_compatible`. No hay datos publicados sobre soporte en vLLM o TGI para este GGUF concreto.
- Throughput y latencia: no disponibles. El unico dato relacionado es que la cabeza MTP se conserva y podria reducir el coste por token en runtimes que la exploten como draft.
- Espacio en disco: el repositorio completo ocupa 574,0 GB por acumulacion de 28 cuantizaciones; conviene descargar solo el fichero necesario.

## Comparativa con modelos similares

| Modelo | Relacion | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| ManniX-ITA/JackOD-9B-Coder-MTP-GGUF | Este modelo | ~9,20 B | No disponible | Apache 2.0 | Merge v3, 28 cuantizaciones GGUF, cabeza MTP conservada |
| Qwen/Qwen3.5-9B | Ancestro comun y `task-base` del merge | ~9 B (no verificado) | No disponible | No disponible | No aporta peso al blend; define la base contra la que se fusiona |
| danielcherubini/Qwen3.5-DeltaCoder-9B | Fuente, peso 0,55 | ~9 B (no verificado) | No disponible | No disponible | LoRA sobre Qwen3.5-9B fusionado a denso |
| ornith-ai/Ornith-1.5-9B | Fuente, peso 0,30 (0,15 en v2) | ~9 B (no verificado) | No disponible | No disponible | Su imatrix se uso para la evaluacion de referencia |
| Jackrong/Qwopus3-5-9B-Coder-Flash | Fuente, peso 0,15 (0,30 en v2) | ~9 B (no verificado) | No disponible | No disponible | Aporta tokenizer y plantilla de chat al merge |

No hay datos publicados de benchmarks de las fuentes individuales en la informacion disponible, por lo que no se puede establecer una comparacion cuantitativa de rendimiento frente a ellas ni frente a otros modelos de ~9 B.

## Limitaciones y advertencias

- Idioma: la model card solo declara ingles. El rendimiento en castellano u otras lenguas no esta documentado ni evaluado.
- Es un merge de pesos, no un modelo entrenado: hereda los sesgos y las carencias de sus tres fuentes sin una fase de alineacion adicional que los corrija.
- Riesgo de alucinacion estandar en generacion de codigo: puede producir APIs inexistentes, imports invalidos o fragmentos sintacticamente correctos pero semanticamente erroneos. Los benchmarks de codigo no lo eximen de validacion en produccion.
- Las cifras de LiveCodeBench (0,9455) y el resto de la tabla v3 proceden de una unica extraccion por problema con semilla aleatoria, sobre conjuntos pequenos (55 y 164 problemas). La incertidumbre es alta y no deben tratarse como valores estables.
- Las tablas v2 y v1 se midieron en modo greedy y no son comparables en la misma base que v3; el autor lo advierte de forma explicita.
- Dependencia de la correccion de tokens especiales: si se reutiliza el modelo base o se reconstruye el merge sin fijar `eos_token_id` 248046 y `pad_token_id` 248055 en la raiz, apareceran fugas de tokens de control. Es un fallo conocido del pipeline, no un detalle cosmetico.
- Las cuantizaciones de 2 y 3 bits degradan la calidad de forma notable; el propio autor evalua sobre Q6_K, lo que sugiere cual es el nivel de referencia. Para uso en produccion conviene Q5_K_M o superior.
- Sin vision ni audio: el `vision_config` presente en `config.json` es metadatos heredados sin pesos, y no existe `mmproj` posible. Cualquier intento de usar el modelo como multimodal fallara.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion con las obligaciones habituales de atribucion y aviso. Aun asi, conviene verificar la licencia de cada una de las fuentes del merge antes de redistribuir pesos derivados, ya que la informacion disponible no detalla las licencias de DeltaCoder, Ornith ni Coder-Flash.
- El repo completo son 574 GB; descargarlo entero es innecesario y propenso a errores. Seleccionar un unico fichero GGUF.
- No hay informacion sobre longitud de contexto, por lo que no se puede garantizar el comportamiento en conversaciones largas ni planificar la VRAM de la cache KV.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/ManniX-ITA/JackOD-9B-Coder-MTP-GGUF
- Modelo base del que se cuantiza: https://huggingface.co/ManniX-ITA/JackOD-9B-Coder
- Ancestro comun: https://huggingface.co/Qwen/Qwen3.5-9B
- Fuente DeltaCoder: https://huggingface.co/danielcherubini/Qwen3.5-DeltaCoder-9B
- Fuente Ornith: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Fuente Qwopus Coder-Flash: https://huggingface.co/Jackrong/Qwopus3-5-9B-Coder-Flash
- Fuente Qwopus coder (v1): https://huggingface.co/Jackrong/Qwopus3.5-9B-coder
- Herramienta de merge: https://github.com/mann1x/omnimergekit
- Receta reproducible del modelo: https://github.com/mann1x/omnimergekit/tree/main/recipes/jackod-9b-coder
- Matriz de calibracion imatrix: https://huggingface.co/ManniX-ITA/JackOD-9B-Coder-MTP-GGUF/blob/main/imatrix.dat
