# phukanpragyan/gemma-4-e2b-assamese-sft

## Resumen

Este modelo es un ajuste fino supervisado (SFT) publicado por el usuario phukanpragyan sobre lo que, segun las etiquetas del repositorio, es un modelo de la familia Gemma 4 con la designacion E2B. El nombre del repositorio indica que el ajuste se ha orientado al idioma asames (assamese). Se distribuye en formato transformers con pesos safetensors y esta etiquetado con el pipeline image-text-to-text, lo que apunta a un modelo multimodal de entrada imagen y texto, aunque el autor no detalla las capacidades reales.

El dato tecnico mas solido disponible es el recuento de parametros extraido de los pesos safetensors: 5.651.719.747 parametros, con un repositorio de 11,3 GB, cifra coherente con pesos en fp16 o bf16 (aproximadamente 2 bytes por parametro). No se ha publicado informacion sobre longitud de contexto, composicion del dataset de ajuste, hiperparametros de entrenamiento ni licencia.

La relevancia de este modelo es limitada y muy especifica: se trata de una publicacion con cero descargas y cero valoraciones en el momento de la consulta, con una model card generada automaticamente y sin contenido cumplimentado. Su interes practico radica en explorar el ajuste de un modelo multimodal de ~5,65 mil millones de parametros a una lengua de bajos recursos como el asames, pero cualquier evaluacion seria requiere validacion independiente que a dia de hoy no existe.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta del Hub: gemma4; multimodal image-text-to-text) |
| Parametros totales | 5.651.719.747 (dato extraido de los pesos safetensors) |
| Parametros activos | no disponible (no se ha confirmado que la arquitectura sea MoE; la nomenclatura E2B sugiere parametros efectivos, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos safetensors; no hay GGUF ni AWQ/GPTQ declarados) |
| Idiomas soportados | no disponible (el nombre del repositorio indica ajuste en asames; no declarado en la model card) |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria transformers) |
| Tamano del repositorio | 11,3 GB |
| Modalidad de entrada | imagen y texto (pipeline image-text-to-text) |
| Fecha de creacion | 2026-09-23 |
| Ultima actualizacion | 2026-09-23 |

## Arquitectura y entrenamiento

No hay informacion publicada sobre la arquitectura concreta. Las etiquetas del repositorio incluyen gemma4 y el pipeline image-text-to-text, lo que indica que el modelo base pertenece a la familia Gemma y acepta entradas de imagen y texto. El recuento real de parametros (5,65 mil millones) no coincide con una lectura literal de la designacion E2B, lo que sugiere, sin confirmacion alguna por parte del autor, que podria tratarse de un modelo con un numero reducido de parametros activos por token o de una convencion de nombres heredada del modelo base. Esta hipotesis no debe tomarse como hecho.

Respecto al entrenamiento, la model card es la plantilla por defecto de Hugging Face y todos los campos relevantes aparecen como "[More Information Needed]": no se especifica el numero de tokens de entrenamiento, la composicion del dataset, si hubo etapas de RLHF, DPO o GRPO, ni los hiperparametros utilizados. Tampoco se documenta el procedimiento de ajuste supervisado. Un repositorio de GitHub de terceros sobre Gemma 4 E2B menciona SFT especifico por tarea, GRPO con balanceo de dominios y tool calling estructurado, pero esa descripcion corresponde al trabajo de otro autor y no puede atribuirse a este ajuste concreto.

## Capacidades

- Generacion de texto: capacidad esperada por tratarse de un modelo de lenguaje, sin confirmacion documentada por el autor.
- Procesamiento de imagenes: el pipeline declarado es image-text-to-text, por lo que se espera entrada multimodal (imagen y texto), aunque no se detalla si admite salida de imagen.
- Ajuste en asames: el identificador del repositorio indica entrenamiento supervisado orientado al asames, sin que se especifiquen volumen ni calidad de los datos.
- Tool calling o function calling: no disponible en la informacion del autor. El repositorio de GitHub de un tercero menciona tool calling estructurado para Gemma 4 E2B, pero no es una fuente atribuible a este ajuste.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Capacidades multilingues: no disponible; no se declara lista de idiomas ni cobertura mas alla de la indicacion del nombre del repositorio.
- Capacidades de audio o video: no disponible.

## Casos de uso

- Traduccion asames-ingles y ingles-asames: el modelo se ha ajustado especificamente para esta lengua, por lo que un uso natural es la traduccion de documentacion tecnica o administrativa, siempre que una evaluacion previa confirme la calidad del ajuste.
- Atencion al cliente en asames para sectores de telecomunicaciones, banca o servicios publicos en Assam: permitiria atender consultas en la lengua del usuario sin depender de traduccion intermedia, sujeto a validacion de calidad.
- Digitalizacion y descripcion de documentos administrativos con imagenes: al aceptar entradas de imagen y texto, podria emplearse para extraer y resumir informacion de formularios o certificados escaneados en asames.
- Generacion de material educativo en asames: creacion de ejercicios, resumenes y explicaciones para centros escolares o plataformas de aprendizaje en lengua asamita.
- Investigacion linguistica y construccion de corpus: generacion de texto sintetico en asames para aumentar corpus de bajos recursos, con supervision humana obligatoria por el riesgo de errores.
- Moderacion y clasificacion de contenido en asames: analisis de comentarios o publicaciones en esta lengua para detectar contenido abusivo, siempre con una capa de validacion humana.
- Prototipado rapido de asistentes multimodales: al ser un modelo de ~5,65 mil millones de parametros, es viable desplegarlo en una GPU de gama alta para pruebas de concepto sin infraestructura de centro de datos.

En todos los casos, la ausencia de benchmarks publicados obliga a realizar una evaluacion propia antes de cualquier uso en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye seccion de evaluacion cumplimentada y no se han encontrado resultados de MMLU, HumanEval, GSM8K, MMMU ni de tareas especificas en asames para este modelo. Tampoco se dispone de metricas de latencia o throughput medidas.

## Requisitos de hardware

Estimaciones derivadas del recuento real de parametros (5,65 mil millones) y del tamano del repositorio (11,3 GB). No son mediciones del autor.

- Pesos en fp16 o bf16: aproximadamente 11,3 GB, mas cache KV y overhead de runtime; se estima un consumo de 13 a 15 GB de VRAM para contexto corto.
- Cuantizacion a 8 bits: pesos en torno a 5,7 GB; se estima un consumo de 7 a 9 GB de VRAM.
- Cuantizacion a 4 bits: pesos en torno a 3,0 a 3,5 GB; se estima un consumo de 4 a 6 GB de VRAM, dependiendo de la longitud de contexto.
- GPU de gama alta para precision completa: A100 40 GB, H100 80 GB o L40S 48 GB, con margen amplio para lotes grandes.
- GPU de consumo compatibles: RTX 4090 o RTX 3090 (24 GB) para fp16 sin problema; RTX 4080 (16 GB) con cuantizacion; RTX 3060 12 GB o RTX 4060 Ti 16 GB solo con cuantizacion de 4 u 8 bits.
- Si cabe en GPU de consumo: si, con cuantizacion a 8 o 4 bits. En fp16 requiere al menos 16 GB de VRAM contando overhead.
- Opciones de despliegue: transformers es la libreria declarada. No se ha publicado ningun archivo GGUF, por lo que llama.cpp y Ollama requeririan una conversion propia. El soporte en vLLM, TGI o SGLang no esta confirmado. Existe una ficha de despliegue en FriendliAI para una variante del mismo autor (v4).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No hay datos de rendimiento publicados para este modelo ni para sus variantes, de modo que la comparativa se limita a aspectos de disponibilidad y formato.

| Modelo | Parametros | Contexto | Modalidad | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|
| phukanpragyan/gemma-4-e2b-assamese-sft | 5,65 mil millones (safetensors) | no disponible | imagen-texto | no disponible | no disponible |
| phukanpragyan/gemma-4-e2b-assamese-sft-v2 | no disponible | no disponible | texto (etiquetado como text-generation, con PEFT/LoRA) | no disponible | no disponible |
| phukanpragyan/gemma-4-e2b-assamese-sft-v4 | no disponible | no disponible | imagen-texto | no disponible | no disponible |
| Gemma 4 E2B (modelo base) | no disponible | no disponible | multimodal, con soporte de tool calling segun documentacion de terceros | terminos de Google, no verificados para esta variante | no disponible |
| Alternativas multimodales pequenas de otros fabricantes | no disponible | no disponible | imagen-texto | no disponible | no disponible |

La variante v2 aparece etiquetada con PEFT, LoRA y TRL, lo que sugiere que se entreno mediante adaptadores de bajo rango, mientras que el repositorio objeto de esta ficha publica pesos safetensors completos. No es posible confirmar si el ajuste original empleo LoRA y posteriormente se fusiono.

## Limitaciones y advertencias

- Model card vacia: el autor no ha documentado el modelo. Todos los campos de la plantilla aparecen como "[More Information Needed]", incluidas las secciones de sesgos, riesgos y usos fuera de alcance.
- Licencia no declarada: no se especifica la licencia del ajuste. Al derivar de un modelo de la familia Gemma, es previsible que apliquen los terminos de uso de Gemma y sus restricciones de uso comercial, pero esto no esta confirmado por el autor y debe verificarse antes de cualquier explotacion comercial.
- Riesgo de alucinacion: no cuantificado. Al no existir evaluaciones de fidelidad, cualquier salida debe validarse, especialmente en traduccion y en dominios tecnicos o legales.
- Sesgos: no documentados. Un ajuste sobre un unico idioma de bajos recursos puede heredar sesgos del corpus de ajuste, tanto culturales como de representacion de genero o de variedades dialectales del asames.
- Cobertura de idiomas desconocida: no se declara si el modelo conserva capacidades multilingues del modelo base o si el ajuste ha provocado olvido catastrofico en otras lenguas, incluido el ingles.
- Modalidad no verificada: la etiqueta image-text-to-text indica entrada de imagen, pero el autor no describe el procesador de imagen, la resolucion soportada ni si el ajuste en asames afecto a la torre de vision.
- Sin adopcion ni validacion comunitaria: cero descargas y cero valoraciones en el momento de la consulta. No existe evidencia externa de funcionamiento correcto.
- Ambiguedad en la nomenclatura E2B: si la designacion implica parametros activos reducidos o una arquitectura de mezcla de expertos, el consumo real de memoria y la latencia podrian diferir de las estimaciones basadas en el recuento total de parametros.
- Fecha de publicacion futura respecto a los conocimientos habituales de los repositorios: conviene verificar la existencia y vigencia de la variante antes de integrarla en un flujo de trabajo.
- Trazabilidad del dataset inexistente: se desconoce con que datos se ajusto, lo que impide auditar procedencia, permisos y posibles filtraciones de datos personales.
- Referencia arxiv:1910.09700: esa etiqueta apunta al articulo de Lacoste et al. (2019) sobre estimacion de emisiones de carbono, incluido en la plantilla de Hugging Face. No es un articulo sobre este modelo y no debe citarse como fuente tecnica del mismo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/phukanpragyan/gemma-4-e2b-assamese-sft
- Variante v2: https://huggingface.co/phukanpragyan/gemma-4-e2b-assamese-sft-v2
- Variante v4: https://huggingface.co/phukanpragyan/gemma-4-e2b-assamese-sft-v4
- Ficha de despliegue de la variante v4 en FriendliAI: https://friendli.ai/models/phukanpragyan/gemma-4-e2b-assamese-sft-v4
- Repositorio de terceros sobre Gemma 4 E2B (no atribuible a este ajuste): https://github.com/MrLIChuan/gemma
- Pagina oficial de Gemma 4 en Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Articulo citado en la etiqueta del repositorio, sobre estimacion de emisiones: https://arxiv.org/abs/1910.09700
