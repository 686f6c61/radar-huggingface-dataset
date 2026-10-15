# kinokozusi/geniac_prize_2026_stage2_v3

## Resumen

geniac_prize_2026_stage2_v3 es un adaptador LoRA publicado por el usuario kinokozusi sobre el modelo base Qwen/Qwen3-4B-Base. Se trata de un ajuste fino supervisado (SFT) en dos etapas: la primera sobre openai/gsm8k, un corpus de problemas de matematicas de primaria, y la segunda sobre allenai/tulu-3-sft-personas-instruction-following, un dataset de seguimiento de instrucciones condicionado por personas. El repositorio se presenta explicitamente como material de envio para la fase de cribado del concurso GENIAC-PRIZE 2026 (Stage 2), por lo que su proposito principal es servir como artefacto de evaluacion en esa competicion mas que como modelo de produccion generalista.

Tecnicamente, no se trata de un modelo completo sino de un adaptador PEFT que debe cargarse junto a Qwen3-4B-Base, un transformer decoder-only denso de aproximadamente 4 000 millones de parametros. Esto implica que su huella en disco es reducida y que puede servirse en una misma instancia del modelo base junto con otros adaptadores, pero tambien que hereda todas las caracteristicas y limitaciones del modelo base subyacente, incluida su longitud de contexto nativa de 32 768 tokens.

Su relevancia actual es acotada y muy especifica: el repositorio no incluye model card en ingles ni en castellano, no declara licencia propia, no publica resultados de benchmarks, no detalla hiperparametros de LoRA y acumula cero descargas y cero "likes". Es, por tanto, un artefacto de investigacion en fase temprana, util como referencia para estudiar recetas de SFT en dos etapas sobre modelos de 4B y para reproducir pipelines de evaluacion tipo GENIAC, pero sin evidencia publica de calidad que respalde su uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (libreria PEFT) sobre un transformer decoder-only denso, Qwen/Qwen3-4B-Base |
| Parametros totales | ~4 000 millones en el modelo base Qwen3-4B-Base; parametros entrenables del adaptador: no disponible |
| Parametros activos | No aplica (el modelo base es denso, no MoE) |
| Longitud de contexto | 32 768 tokens en el modelo base (extensible a 131 072 con YaRN segun la documentacion de Qwen3); valor efectivo de este adaptador: no disponible |
| Tipos de cuantizacion | No disponible en el repositorio. El adaptador se distribuye en la precision del entrenamiento; el modelo base admite cuantizacion de 8 y 4 bits una vez fusionados los pesos |
| Idiomas soportados | No disponible en la ficha. Los datasets de SFT estan en ingles (GSM8K y tulu-3 personas instruction following); el modelo base Qwen3 declara soporte multilingue |
| Licencia | No disponible para el adaptador. El modelo base es Apache-2.0 y el dataset allenai/tulu-3-sft-personas-instruction-following exige atribucion bajo ODC-BY-1.0 |
| Formato de pesos | Adaptador PEFT (configuracion de adaptador mas pesos); el formato concreto de fichero no se detalla en la informacion proporcionada |
| Modelo base | Qwen/Qwen3-4B-Base (Apache-2.0) |
| Libreria de carga | peft |
| Datasets de entrenamiento | openai/gsm8k (etapa 1), allenai/tulu-3-sft-personas-instruction-following (etapa 2) |
| Fecha de creacion | 2026-10-14 |
| Ultima actualizacion | 2026-10-15 |
| Descargas / likes | 0 / 0 |
| Proposito declarado | Envio para la fase de cribado del concurso GENIAC-PRIZE 2026 (Stage 2) |

## Arquitectura y entrenamiento

El adaptador se apoya en Qwen3-4B-Base, un transformer decoder-only denso de la familia Qwen3. El entrenamiento es un SFT en dos etapas encadenadas: la etapa 1 utiliza openai/gsm8k, un conjunto de problemas aritmeticos de primaria con soluciones paso a paso, lo que induce un formato de razonamiento explicito orientado a matematicas; la etapa 2 continua el ajuste sobre allenai/tulu-3-sft-personas-instruction-following, un corpus de seguimiento de instrucciones organizado en torno a perfiles o personas, lo que desplaza el comportamiento del modelo hacia la obediencia de instrucciones condicionadas por un rol. No se especifica en la informacion disponible el numero de ejemplos utilizados, el numero de pasos, la composicion exacta de los datos de la etapa 2 ni si hubo mezcla de los dos datasets en la segunda fase.

Tampoco se documentan los hiperparametros del LoRA (rango, alpha, dropout, modulos objetivo, tasa de aprendizaje, numero de epocas) ni el esquema de precision utilizado. No hay constancia de tecnicas adicionales como RLHF, DPO, GRPO ni decodificacion especulativa; todo apunta a un SFT puro mediante LoRA. La unica innovacion metodologica observable es la receta de dos etapas (matematicas y despues seguimiento de instrucciones con personas), habitual en pipelines de competicion para inducir razonamiento antes de alinear el formato de respuesta.

## Capacidades

- Generacion de texto autoregresiva en el modelo base Qwen3-4B-Base, condicionada por el adaptador.
- Razonamiento aritmetico y resolucion de problemas verbales de matematicas de nivel escolar, adquirido en la etapa 1 sobre GSM8K.
- Seguimiento de instrucciones con condicionamiento por persona o rol, procedente del dataset tulu-3 de personas.
- Capacidad previsible de producir razonamiento paso a paso en formato de cadena, derivada del estilo de los datos de GSM8K.
- Soporte de tool calling o function calling: no disponible, no se menciona en la model card.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad declarada; el razonamiento multi-paso solo esta implicito en el formato matematico.
- Capacidades multilingues: no disponibles para el adaptador; los datos de SFT estan en ingles.
- Capacidad especial de vision o audio: no disponible, el modelo base es exclusivamente de texto.
- Modo "thinking" explicito y controlable: no disponible en la informacion proporcionada.

## Casos de uso

- Evaluacion y reproduccion de pipelines GENIAC: cargar el adaptador con PEFT sobre Qwen3-4B-Base y ejecutar el mismo protocolo de evaluacion que utiliza el concurso, para comparar la receta de dos etapas frente a otros envios publicos de la misma convocatoria.
- Investigacion sobre SFT en dos fases: usar este adaptador como punto de comparacion frente a un ajuste de una sola etapa sobre tulu-3, midiendo cuanto aporta realmente el preajuste con GSM8K en tareas de instrucciones.
- Generacion de datos sinteticos con rol: aprovechar el condicionamiento por persona de la etapa 2 para producir dialogos o instrucciones con estilo controlado, utiles como material de aumento de datos en proyectos de anotacion.
- Tutoria matematica experimental: el modelo puede generar resoluciones paso a paso de problemas de primaria en ingles; es adecuado para prototipos de asistente educativo siempre que se validen las soluciones, dado el riesgo de error aritmetico.
- Servicio multi-adaptador sobre un unico base: desplegar Qwen3-4B-Base con vLLM y varios adaptadores LoRA intercambiables, usando este como uno de los cabezales especializados sin duplicar el coste de VRAM del modelo base.
- Banco de pruebas de infraestructura de inferencia: por su tamano de 4B y su naturaleza de adaptador, resulta util para validar configuraciones de vLLM, TGI o llama.cpp (con fusion previa de pesos) y medir latencias y throughput antes de escalar a modelos mayores.
- Analisis de contaminacion de benchmarks: sirve como caso de estudio metodologico, ya que un modelo entrenado sobre GSM8K no puede evaluarse limpiamente sobre GSM8K; util para ilustrar buenas practicas de evaluacion en formacion o documentacion interna.
- Experimentos academicos de atribucion de licencias: dado que el dataset tulu-3 exige atribucion ODC-BY-1.0, el adaptador puede emplearse como ejemplo practico de trazabilidad de licencias en cadenas de derivacion de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tabla de evaluacion, no declara puntuaciones en MMLU, GSM8K, HumanEval ni otras pruebas, y no ofrece comparaciones con el modelo base ni con otros adaptadores. Se advierte ademas de que GSM8K forma parte de los datos de entrenamiento de la etapa 1, por lo que cualquier evaluacion sobre ese conjunto no seria una medida valida de generalizacion.

## Requisitos de hardware

- VRAM para inferencia: el modelo base de 4 000 millones de parametros ocupa aproximadamente 8 GB en bf16/fp16, unos 4-5 GB en cuantizacion de 8 bits y unos 2,5-3 GB en cuantizacion de 4 bits, sin contar la cache KV.
- Adaptador: al ser LoRA, su peso adicional es minimo en comparacion con el modelo base y no cambia de forma significativa los requisitos anteriores.
- GPU recomendadas: A100 40 GB, H100, L40S o A10G para despliegue en servidor con margen amplio de contexto; RTX 4090, RTX 4080 y RTX 3090 para uso local en precision completa o 8 bits.
- GPU de consumo: si cabe en tarjetas de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070) en cuantizacion de 4 u 8 bits. En equipos Apple Silicon con 16 GB o mas de memoria unificada tambien es viable.
- Opciones de despliegue: transformers con PEFT para carga directa del adaptador; vLLM y TGI admiten adaptadores LoRA de forma nativa; llama.cpp y Ollama requieren fusionar previamente el adaptador con los pesos base y convertir el resultado a GGUF.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token para este adaptador, y cualquier cifra dependeria del hardware, la cuantizacion y la longitud de contexto utilizada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Resultados publicos |
|---|---|---|---|---|---|
| kinokozusi/geniac_prize_2026_stage2_v3 (este) | ~4B en el base + adaptador LoRA | 32 768 en el base; no confirmado en el adaptador | No disponible en el repositorio | Hugging Face, 0 descargas | No disponibles |
| Qwen/Qwen3-4B-Base | ~4B | 32 768 nativo, hasta 131 072 con YaRN | Apache-2.0 | Hugging Face, ampliamente distribuido | Documentados por el autor del modelo base |
| evisen/geniac_prize_2026_stage2 | No disponible | No disponible | No disponible | Hugging Face y endpoint en FriendliAI | No disponibles |
| IShiro26/geniac_prize_2026_stage2_v2 | No disponible | No disponible | No disponible | Hugging Face | No disponibles |

La comparacion con alternativas consolidadas del mismo rango de tamano (por ejemplo Qwen3-4B en su variante instruct, Llama 3.2 3B Instruct o Phi-4-mini) no puede realizarse de forma rigurosa con la informacion disponible, ya que este adaptador carece de evaluaciones publicas y de licencia declarada. Los dos repositorios de la misma convocatoria incluidos en la tabla son los unicos comparables directos encontrados en la busqueda web, y tampoco publican especificaciones ni resultados.

## Limitaciones y advertencias

- Licencia del adaptador no declarada: el repositorio no especifica terminos de uso. El modelo base es Apache-2.0, pero la ausencia de licencia propia genera incertidumbre juridica para uso comercial.
- Obligacion de atribucion: el dataset allenai/tulu-3-sft-personas-instruction-following se distribuye bajo ODC-BY-1.0; cualquier redistribucion del modelo derivado debe mantener la atribucion indicada por el autor en la model card.
- Contaminacion de GSM8K: la etapa 1 entrena sobre openai/gsm8k, por lo que las puntuaciones en ese benchmark no son validas como medida de capacidad matematica general.
- Riesgo de alucinacion: en tareas aritmeticas y de razonamiento paso a paso, el modelo puede producir cadenas de razonamiento plausibles con resultados incorrectos. Requiere verificacion automatica o humana en cualquier uso educativo o de calculo.
- Idiomas: los datos de SFT estan en ingles. No hay evidencia de que el ajuste preserve el rendimiento multilingue del modelo base, y es probable que degrade el comportamiento en castellano.
- Modelo base no instruct: al partir de Qwen3-4B-Base, no existe una fase de alineacion tipo RLHF mas alla del SFT con personas. El comportamiento ante peticiones daninas o ambiguas es impredecible y no hay evaluaciones de seguridad.
- Ausencia de soporte de agentes y tool calling: no se documenta function calling ni integracion con frameworks de agentes, lo que limita su uso en flujos automatizados multi-paso.
- Sin validacion externa: cero descargas y cero "likes" en el momento de redactar esta ficha, sin model card en ingles ni en castellano, lo que impide contrastar la calidad del ajuste.
- Hiperparametros no documentados: al no publicarse rango de LoRA, modulos objetivo ni numero de epocas, la reproducibilidad del entrenamiento es limitada.
- Uso previsto acotado: el propio autor lo define como envio para una fase de cribado de competicion, no como modelo listo para produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kinokozusi/geniac_prize_2026_stage2_v3
- Modelo base Qwen/Qwen3-4B-Base: https://huggingface.co/Qwen/Qwen3-4B-Base
- Dataset openai/gsm8k: https://huggingface.co/datasets/openai/gsm8k
- Dataset allenai/tulu-3-sft-personas-instruction-following: https://huggingface.co/datasets/allenai/tulu-3-sft-personas-instruction-following
- Licencia ODC Attribution 1.0: https://opendatacommons.org/licenses/by/1-0/
- Repositorio relacionado evisen/geniac_prize_2026_stage2: https://huggingface.co/evisen/geniac_prize_2026_stage2
- Endpoint de inferencia de un adaptador homonimo en FriendliAI: https://friendli.ai/models/evisen/geniac_prize_2026_stage2
- Repositorio relacionado IShiro26/geniac_prize_2026_stage2_v2: https://huggingface.co/IShiro26/geniac_prize_2026_stage2_v2
- Programa GENIAC del Ministerio de Economia, Comercio e Industria de Japon (METI): https://www.meti.go.jp/english/policy/mono_info_service/geniac/index.html
