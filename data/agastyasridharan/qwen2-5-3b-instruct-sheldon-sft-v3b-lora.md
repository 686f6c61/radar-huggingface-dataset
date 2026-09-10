# agastyasridharan/Qwen2.5-3B-Instruct-Sheldon-SFT-v3b-LoRA

## Resumen

El modelo `agastyasridharan/Qwen2.5-3B-Instruct-Sheldon-SFT-v3b-LoRA` es un adaptador LoRA entrenado mediante ajuste supervisado (SFT) sobre el modelo base `Qwen/Qwen2.5-3B-Instruct`, cuyo objetivo es inducir una persona conversacional concreta (el personaje Sheldon Cooper) sin degradar la capacidad de razonamiento matemático del modelo original. Lo publica el usuario `agastyasridharan` como parte de una familia de experimentos denominada "Sheldon-SFT", con variantes v2 (solo chat), v3a (chat más matemáticas existentes) y v3b, que es la que nos ocupa y que anade reescrituras paso a paso de soluciones de GSM8K verificadas automaticamente.

La relevancia tecnica del artefacto no esta tanto en el adaptador final como en el enfoque experimental: el autor guarda los 20 checkpoints intermedios del entrenamiento (cada 29 pasos, hasta el paso 576), lo que permite estudiar como evolucionan simultaneamente la adherencia a la persona y la precision en GSM8K a lo largo de la trayectoria de SFT. Se trata, por tanto, de un recurso util para investigacion sobre aprendizaje de personas, olvido catastrofico y equilibrio entre estilo y capacidad de razonamiento en modelos pequenos.

El adaptador se publica con rango r=32, alpha=64 y se aplica a todas las proyecciones lineales. El repositorio ocupa 4,8 GB, en su mayor parte debido a los checkpoints acumulados, y se distribuye en formato safetensors bajo la libreria PEFT. La licencia declarada es `qwen-research`, heredada del modelo base, lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only denso (Qwen2.5-3B-Instruct) |
| Parametros totales | No disponible para el adaptador en la model card; el modelo base Qwen2.5-3B-Instruct tiene 3.090 millones de parametros. Estimacion del adaptador a partir de r=32 y alpha=64 sobre todas las proyecciones lineales: aproximadamente 60 millones de parametros entrenables por checkpoint |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No especificada en la model card del adaptador; heredada del modelo base Qwen2.5-3B-Instruct, documentada en 32.768 tokens con extension por YaRN |
| Tipos de cuantizacion | No disponibles para el adaptador. Se distribuye en bfloat16; tras fusionarlo con el modelo base puede cuantizarse con las herramientas habituales (GGUF, AWQ, GPTQ) |
| Idiomas soportados | No disponibles en la model card. El modelo base Qwen2.5-3B-Instruct esta documentado como multilingue (mas de 29 idiomas), pero el adaptador no declara evaluacion multilingue |
| Licencia | `other`, con nombre declarado `qwen-research` (enlace a la licencia del modelo base) |
| Formato de pesos | safetensors, con estructura de adaptador PEFT/LoRA |
| Rango y alpha de LoRA | r=32, alpha=64 |
| Modulos objetivo | Todas las proyecciones lineales (all linear projections) |
| Epocas y pasos de entrenamiento | 2 epocas, 576 pasos |
| Checkpoints publicados | 20 adaptadores intermedios, guardados cada 29 pasos (pasos 29 a 576), mas el adaptador final (paso 576) en la raiz del repositorio |
| Tamano del repositorio | 4,8 GB |
| Libreria | peft |
| Modelo base | Qwen/Qwen2.5-3B-Instruct |
| Fecha de creacion (metadatos) | 2026-09-10 |
| Fecha de actualizacion (metadatos) | 2026-09-10 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-3B-Instruct, un transformer decoder-only denso con atencion por consultas agrupadas (GQA) y normalizacion RMSNorm, entrenado originalmente con tecnicas de alineacion por preferencias. El ajuste fino se realiza exclusivamente mediante LoRA con r=32 y alpha=64 sobre todas las proyecciones lineales, lo que mantiene congelados los pesos del modelo base y anade un numero reducido de parametros entrenables. El entrenamiento dura 2 epocas, equivalentes a 576 pasos de optimizacion.

La composicion del dataset de SFT es el elemento mas distintivo del trabajo. Se combinan tres fuentes: 11.910 conversaciones de persona (procedentes del dataset `tbooy/sheldon-cooper-sft-20k`), 2.036 respuestas matematicas del personaje verificadas como correctas a partir del dataset original, y 4.485 reescrituras paso a paso con la voz del personaje de soluciones de entrenamiento de GSM8K, aceptadas por un verificador automatico. Esta tercera fuente es la que diferencia la version v3b de las variantes v2 (solo chat) y v3a (chat mas matematicas existentes), y busca ensenar al modelo a razonar matematicamente sin abandonar el registro estilistico de la persona.

El aspecto metodologico mas relevante es la publicacion de la trayectoria completa de checkpoints: 20 adaptadores guardados cada 29 pasos permiten medir como evolucionan la adherencia a la persona y la precision en GSM8K conforme avanza el SFT, lo que convierte al repositorio en un banco de pruebas para estudiar el compromiso entre especializacion estilistica y capacidad de razonamiento. No se documentan en la informacion disponible el uso de RLHF, DPO u otras tecnicas de alineacion posteriores al SFT, ni innovaciones de decodificacion como decodificacion especulativa.

## Capacidades

- Generacion de texto conversacional multi-turno con una persona estilistica concreta (el personaje Sheldon Cooper), inducida por SFT sobre 11.910 conversaciones.
- Razonamiento matematico de nivel escolar, entrenado especificamente con 2.036 respuestas verificadas y 4.485 reescrituras paso a paso de soluciones de GSM8K-train.
- Explicacion de razonamiento matematico paso a paso manteniendo el registro de la persona, gracias al corpus de reescrituras aceptadas por un verificador.
- Hereda las capacidades del modelo base Qwen2.5-3B-Instruct: generacion de texto general, comprension lectora, resumen, traduccion y generacion de codigo basica.
- Soporte de tool calling / function calling: no documentado especificamente para el adaptador, aunque el modelo base Qwen2.5-3B-Instruct si lo soporta. El SFT de persona podria degradar esta capacidad al no incluir datos de llamadas a herramientas.
- Soporte de agentes y razonamiento multi-paso: no documentado para el adaptador; depende de la capacidad heredada del modelo base.
- Capacidades multilingues: no documentadas ni evaluadas para el adaptador; el modelo base es multilingue, pero el dataset de SFT es en ingles.
- Capacidades especiales: no se declaran modos de pensamiento explicito (thinking mode), vision ni audio. La capacidad especial es la trayectoria de 20 checkpoints intermedios para analisis de entrenamiento.

## Casos de uso

- Investigacion sobre aprendizaje de personas: el adaptador y sus 20 checkpoints permiten estudiar empiricamente como se adquiere un estilo conversacional a lo largo del entrenamiento y en que punto se estabiliza la persona frente al modelo base.
- Analisis del olvido catastrofico en SFT: comparando la precision en GSM8K en cada checkpoint (pasos 29, 58, ..., 576) es posible medir si el ajuste de persona degrada la capacidad matematica original y en que magnitud.
- Evaluacion de tecnicas de LoRA: con r=32 y alpha=64 configurados sobre todas las proyecciones lineales, sirve como referencia reproducible para comparar configuraciones alternativas de rango, alpha y modulos objetivo en modelos de 3.000 millones de parametros.
- Generacion de dialogos con personaje para prototipos creativos: en demos, juegos conversacionales o narrativa interactiva donde se necesite un asistente con un registro pedante y cientifico, desplegado sobre una unica GPU de consumo tras fusionar el adaptador.
- Tutoria matematica con estilo controlado: el modelo puede resolver problemas aritmeticos de varios pasos y explicarlos en el registro de la persona, util para prototipos de asistentes educativos con personalidad marcada, siempre con supervision humana.
- Experimentos de destilacion estilistica: las 4.485 reescrituras paso a paso aceptadas por un verificador constituyen un ejemplo de pipeline de generacion y filtrado automatico de datos que puede replicarse para otras personas o dominios.
- Benchmarking de infraestructura de adaptadores: al tratarse de un adaptador PEFT de pocos cientos de MB, es adecuado para probar despliegues multi-LoRA en servidores de inferencia (por ejemplo, servir varias personas sobre el mismo modelo base).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card menciona GSM8K como parte del conjunto de evaluacion y remite a una tabla de evaluacion alojada en la model card del modelo fusionado (`agastyasridharan/Qwen2.5-3B-Instruct-Sheldon-SFT-v3b`), pero dicha tabla no forma parte de la informacion proporcionada. El autor tampoco publica cifras de MMLU, HumanEval ni metricas de adherencia a la persona para el adaptador.

| Benchmark | Resultado | Notas |
|---|---|---|
| GSM8K | No disponible | Se usa como objetivo de evaluacion durante la trayectoria de SFT, sin cifras publicadas en la informacion disponible |
| MMLU | No disponible | No reportado |
| HumanEval | No disponible | No reportado |
| Metricas de persona | No disponible | No reportado |

## Requisitos de hardware

- El adaptador por si solo es muy ligero: se estima en torno a 60 millones de parametros entrenables por checkpoint (aproximadamente 120 MB en bfloat16), por lo que el repositorio completo de 4,8 GB se explica por la acumulacion de 20 checkpoints mas el adaptador final, no por el tamano de un unico artefacto a cargar en memoria.
- VRAM para inferencia, fusionando el adaptador con el modelo base de 3.090 millones de parametros: aproximadamente 6-7 GB en bfloat16 o float16 solo para los pesos, y en torno a 8-10 GB contando cache KV y activaciones para contextos moderados.
- Cabe sin problema en GPU de consumo: RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070 Ti Super, RTX 4080, RTX 4090 y similares, tanto en precision completa como en cuantizacion de 8 o 4 bits.
- En cuantizacion de 4 bits (por ejemplo, bitsandbytes NF4 o GGUF Q4_K_M) el modelo fusionado ocupa aproximadamente 2-3 GB de VRAM, lo que permite ejecutarlo en tarjetas de 6-8 GB e incluso en CPU con llama.cpp, a costa de latencia.
- GPU de centro de datos (A100, H100, L40S) no son necesarias; solo tendrian sentido para servir muchas peticiones concurrentes o entrenar variantes con mas datos.
- Opciones de despliegue: transformers mas PEFT para cargar el adaptador sin fusionar; fusion explicita con `merge_and_unload` para generar un modelo completo; vLLM y TGI para servir el modelo fusionado, y en el caso de TGI, soporte de adaptadores LoRA en caliente; conversion a GGUF y despliegue con llama.cpp u Ollama para entornos sin GPU dedicada.
- Latencia y throughput: no disponibles. No se publican mediciones en la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-3B-Instruct-Sheldon-SFT-v3b-LoRA | 3.090 M (base) mas adaptador LoRA estimado en torno a 60 M por checkpoint | Heredado del base (32.768 tokens documentados) | Adaptador LoRA sobre transformer denso | qwen-research (other) | HuggingFace, 0 descargas, 0 likes |
| Qwen/Qwen2.5-3B-Instruct | 3.090 M | 32.768 tokens con extension YaRN | Transformer denso, instruido | qwen-research | HuggingFace, ampliamente utilizado |
| meta-llama/Llama-3.2-3B-Instruct | 3.210 M | 128.000 tokens | Transformer denso, instruido | Llama 3.2 Community License | HuggingFace, ampliamente utilizado |
| microsoft/Phi-3.5-mini-instruct | 3.800 M | 128.000 tokens | Transformer denso, instruido | MIT | HuggingFace, ampliamente utilizado |

Las cifras de los tres modelos de referencia corresponden a su documentacion publica y no a mediciones propias. No se dispone de datos de rendimiento comparativo entre este adaptador y las alternativas, por lo que la comparacion se limita a parametros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- La licencia declarada es `qwen-research`, heredada del modelo base Qwen2.5-3B-Instruct. Esta licencia impone restricciones de uso, en particular para explotacion comercial, por lo que es obligatorio revisar sus terminos antes de cualquier despliegue en produccion.
- El adaptador induce una persona muy marcada y de caracter ficcional. Puede producir respuestas fuera de tono en contextos profesionales, con sarcasmo o con opiniones no apropiadas para atencion al cliente o entornos corporativos.
- Riesgo de alucinacion: el ajuste de persona puede incrementar la generacion de afirmaciones plausibles pero falsas, especialmente en dominios factuales no cubiertos por el dataset de SFT.
- El entrenamiento se realizo con datos en ingles (conversaciones de persona y GSM8K). El comportamiento en castellano u otros idiomas no esta evaluado y puede degradarse respecto al modelo base.
- El olvido catastrofico es un riesgo real: el SFT sobre dominio de persona y matematicas escolares puede reducir capacidades del modelo base como tool calling, generacion de codigo o comprension multilingue. La model card no reporta evaluaciones de estas capacidades.
- El rendimiento en GSM8K no esta cuantificado en la informacion disponible; el autor remite a una tabla externa que no acompana a la documentacion proporcionada. No se puede afirmar que el adaptador mantenga o mejore la precision original del modelo base.
- El modelo tiene 0 descargas y 0 likes, y los metadatos indican una fecha de publicacion muy reciente. No hay validacion independiente por parte de terceros.
- La carga de checkpoints intermedios debe hacerse indicando el subdirectorio correspondiente (`checkpoints/checkpoint-N`); cargar la raiz del repositorio devuelve siempre el adaptador del paso 576.
- La resolucion del repositorio ocupa 4,8 GB debido a los 20 checkpoints; descargar el repositorio completo es innecesario si solo se necesita el adaptador final.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/agastyasridharan/Qwen2.5-3B-Instruct-Sheldon-SFT-v3b-LoRA
- Modelo fusionado y tabla de evaluacion referenciada: https://huggingface.co/agastyasridharan/Qwen2.5-3B-Instruct-Sheldon-SFT-v3b
- Variante v2 (solo chat): https://huggingface.co/agastyasridharan/Qwen2.5-3B-Instruct-Sheldon-SFT-v2-LoRA
- Variante v3a (chat y matematicas existentes): https://huggingface.co/agastyasridharan/Qwen2.5-3B-Instruct-Sheldon-SFT-v3a-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct/blob/main/LICENSE
- Dataset de persona: https://huggingface.co/datasets/tbooy/sheldon-cooper-sft-20k
- Dataset GSM8K: https://huggingface.co/datasets/openai/gsm8k

No se han encontrado enlaces adicionales relevantes en la busqueda web realizada; los resultados devueltos no guardan relacion con este modelo.
