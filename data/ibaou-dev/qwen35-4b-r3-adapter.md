# ibaou-dev/qwen35-4b-r3-adapter

## Resumen

ibaou-dev/qwen35-4b-r3-adapter es un adaptador LoRA (PEFT) entrenado mediante SFT sobre el modelo base Qwen/Qwen3.5-4B. El repositorio contiene unicamente los pesos del adaptador (0,1 GB), no el modelo completo, y esta publicado por el usuario ibaou-dev. La model card es la plantilla generica de Hugging Face sin cumplimentar: no documenta datos de entrenamiento, hiperparametros, idiomas, licencia ni evaluacion.

El modelo resuelve el caso de uso tipico de un adaptador de ajuste supervisado: especializar un modelo base de 4B parametros en un dominio o estilo concreto sin reentrenar todos los pesos y con un coste de almacenamiento minimo. Su relevancia practica depende enteramente de la calidad del modelo base Qwen/Qwen3.5-4B y de la naturaleza del dataset de SFT, que el autor no ha hecho publico.

La ficha se basa exclusivamente en los metadatos del repositorio (tags, tamano, framework y modelo base). Cualquier dato no presente en esa informacion se marca como "no disponible". Al tratarse de la version "r3" del adaptador, se deduce que existen iteraciones previas del mismo autor, pero no hay informacion publica sobre ellas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | adaptador LoRA sobre transformer decoder-only (modelo base Qwen/Qwen3.5-4B) |
| Parametros totales | no disponible (adaptador de 0,1 GB; el modelo base tiene 4B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen/Qwen3.5-4B) |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors; cuantizacion aplicable al modelo base) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de bajo rango compatible con la libreria PEFT (version 0.21.2 segun la model card) y entrenado con TRL y Unsloth, segun los tags del repositorio. La tecnica LoRA congela los pesos del modelo base e inserta matrices de descomposicion de bajo rango en determinadas capas, de modo que solo se optimiza un subconjunto reducido de parametros. El resultado son 0,1 GB de pesos adicionales que deben cargarse junto con el modelo base Qwen/Qwen3.5-4B.

El entrenamiento es de tipo SFT (supervised fine-tuning), es decir, ajuste supervisado sobre pares instruccion-respuesta. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, el rango LoRA, el alpha, la tasa de aprendizaje ni si hubo etapas posteriores de RLHF o DPO. Tampoco se documenta si se aplicaron tecnicas de decodificacion especulativa, atencion lineal u otras innovaciones; cualquier capacidad de ese tipo provendria del modelo base y no del adaptador.

## Capacidades

- Generacion de texto conversacional: el pipeline declarado es text-generation con etiqueta conversational, por lo que el adaptador esta orientado a dialogos de instruccion-respuesta.
- Ajuste supervisado sobre el modelo base: hereda las capacidades de Qwen/Qwen3.5-4B (razonamiento, codigo, matematicas), aunque el SFT puede haberlas desplazado hacia el dominio del dataset de entrenamiento.
- Soporte de tool calling: no disponible como capacidad documentada del adaptador; dependera de si el modelo base lo soporta y de si el SFT lo preservo.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; no se declara ningun idioma.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.

## Casos de uso

- Especializacion de dominio sobre un modelo de 4B: cargar el adaptador junto con Qwen/Qwen3.5-4B para obtener respuestas ajustadas al estilo o la tarea del dataset de SFT, con un coste de almacenamiento de 0,1 GB frente a los varios GB del modelo completo.
- Despliegue en hardware limitado: al combinarse con un modelo base de 4B, el conjunto puede ejecutarse en GPUs de consumo con cuantizacion del modelo base, manteniendo el adaptador en precision nativa.
- Experimentacion con PEFT: servir como referencia de un flujo Unsloth + TRL + PEFT para desarrolladores que quieran replicar el pipeline de entrenamiento de adaptadores.
- Servicio de atencion al cliente conversacional: si el SFT se realizo sobre dialogos de soporte, el adaptador puede gestionar conversaciones multi-turno; la longitud de contexto efectiva depende del modelo base y no esta documentada.
- Generacion de codigo asistida: si el dataset de SFT incluyo pares de programacion, el adaptador puede emplearse en autocompletado o explicacion de codigo; no hay evidencia publica de ello.
- Evaluacion comparativa de adaptadores: util para investigadores que quieran medir el impacto de un SFT de bajo rango sobre un mismo modelo base frente a otras variantes (r1, r2, etc.).
- Prototipado rapido de asistentes especializados: intercambiar adaptadores sobre el mismo modelo base para cubrir distintos dominios sin duplicar el despliegue del modelo grande.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador de forma aislada; el consumo lo determina el modelo base Qwen/Qwen3.5-4B. Como referencia orientativa, un modelo de 4B en bf16 requiere aproximadamente 8 GB de VRAM solo para pesos, mas memoria para KV cache y activaciones.
- GPU recomendadas: no disponibles en la informacion proporcionada; para un modelo base de 4B son habituales GPUs de consumo de gama alta (RTX 4090, RTX 3090) o profesionales (A100, H100) si se busca throughput alto.
- Cabe en GPU de consumo: probablemente si, al tratarse de un modelo base de 4B, aunque no hay datos oficiales que lo confirmen para esta combinacion concreta.
- Opciones de despliegue: PEFT/transformers para cargar el adaptador; vLLM y TGI admiten adaptadores LoRA en algunos casos, pero no hay documentacion del autor al respecto. llama.cpp y Ollama requeririan fusionar el adaptador con el modelo base y convertirlo a GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ibaou-dev/qwen35-4b-r3-adapter | adaptador sobre base de 4B | no disponible | no disponible | safetensors (LoRA) | SFT conversacional, sin documentacion |
| Qwen/Qwen3.5-4B (modelo base) | 4B | no disponible | no disponible | safetensors | Modelo completo sin ajuste; capacidades generales |
| Adaptadores LoRA genericos sobre modelos de 4B | variable | variable | variable | safetensors | Requieren fusion o carga PEFT; calidad dependiente del dataset |

No se dispone de informacion suficiente para comparar rendimiento con alternativas concretas.

## Limitaciones y advertencias

- Model card sin cumplimentar: no hay informacion sobre datos de entrenamiento, hiperparametros, evaluacion ni uso previsto, lo que impide auditar el modelo.
- Licencia no declarada: no se puede confirmar el uso comercial; ademas, la licencia efectiva queda condicionada por la del modelo base Qwen/Qwen3.5-4B, que debe verificarse por separado.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; el SFT no lo elimina y puede acentuarlo si el dataset contiene respuestas factualmente incorrectas.
- Sesgos desconocidos: al no documentarse el dataset de entrenamiento, no es posible evaluar sesgos de genero, raza, idioma o dominio.
- Idiomas no declarados: se desconoce que lenguas cubre el adaptador; el rendimiento fuera del idioma del dataset de SFT puede degradarse.
- Dependencia del modelo base: el adaptador no es autonomo; requiere cargar Qwen/Qwen3.5-4B y la version de PEFT indicada (0.21.2) para funcionar correctamente.
- Sin descargas ni validacion de la comunidad: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia externa de su calidad.
- Posible sobreajuste al dominio del SFT: un adaptador de bajo rango puede degradar capacidades generales del modelo base si el dataset es estrecho.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ibaou-dev/qwen35-4b-r3-adapter
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Paper de referencia de LoRA: https://arxiv.org/abs/1910.09700
- Libreria PEFT: https://github.com/huggingface/peft
- Libreria TRL: https://github.com/huggingface/trl
- Unsloth: https://github.com/unslothai/unsloth
