# Adking98/MN-12B-Celeste-V1.9-GGUF

## Resumen

MN-12B-Celeste-V1.9-GGUF es la version cuantizada en formato GGUF de MN-12B-Celeste-V1.9, un modelo de lenguaje de ~12,25 mil millones de parametros publicado por el usuario Adking98 en HuggingFace. El repositorio contiene unicamente pesos en GGUF, generados a partir de un ajuste fino y posterior conversion realizados con Unsloth, lo que lo orienta especificamente a inferencia local y a despliegues con llama.cpp y herramientas compatibles. La etiqueta `mistral` del repositorio y el recuento exacto de parametros (12.247.782.400, identico al de la familia Mistral Nemo de 12B) apuntan a que deriva de esa arquitectura, aunque el autor no lo confirma en la model card.

El modelo se presenta como conversacional y su relevancia es la habitual de los GGUF de tamano medio: permite ejecutar un LLM de 12B en hardware de consumo con cuantizaciones de 4 bits, manteniendo los pesos en un unico archivo de 7,5 GB. No hay informacion publicada por el autor sobre licencia, idiomas, composicion del dataset de entrenamiento, regimen de alineacion ni resultados de evaluacion, por lo que la mayor parte de las especificaciones habituales quedan como no disponibles.

Se trata, ademas, de un modelo con muy poca traccion: 127 descargas y 1 like en el momento de la consulta, con el repositorio actualizado por ultima vez el 26 de septiembre de 2026 segun los metadatos de HuggingFace. Existe una cuantizacion alternativa del mismo modelo publicada por bartowski, que amplia el catalogo de niveles de cuantizacion disponibles mas alla del unico Q4_K_M del repositorio original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, presumiblemente familia Mistral (etiqueta `mistral` del repositorio y recuento de parametros coincidente con Mistral Nemo 12B); no confirmado por el autor |
| Parametros totales | 12.247.782.400 (~12,25 B) |
| Parametros activos | No aplica: no hay indicios de que sea un modelo MoE |
| Longitud de contexto | No disponible en la model card. Un directorio de terceros (llm-explorer) reporta 1000K de contexto para el modelo base, dato no verificado ni confirmado por el autor |
| Tipos de cuantizacion | Q4_K_M en el repositorio del autor; bartowski publica cuantizaciones adicionales tipo K-quant e I-quant (imatrix) del mismo modelo |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (unico formato publicado en este repositorio; no se distribuyen safetensors) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura ni el procedimiento de entrenamiento. Los unicos datos tecnicos aportados por el autor son que el modelo fue ajustado y convertido a GGUF con Unsloth, y que se entrenó "2x faster with Unsloth", lo que hace referencia a la aceleracion del proceso de fine-tuning, no a una innovacion en la arquitectura. No se especifica el modelo base, el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF, DPO u otra forma de alineacion.

Por los metadatos disponibles se puede inferir, con cautela, que se trata de un transformer denso de la familia Mistral: la etiqueta `mistral` aparece entre los tags del repositorio y el recuento de parametros coincide exactamente con el de la arquitectura Mistral Nemo de 12B. Esto es una deduccion a partir de metadatos, no una confirmacion del autor. Tampoco consta el uso de tecnicas destacables como atencion lineal, decodificacion especulativa o arquitecturas hibridas SSM.

## Capacidades

- Generacion de texto conversacional: el repositorio esta etiquetado como `conversational` y el uso de ejemplo documentado por el autor emplea `llama-cli` con la plantilla Jinja (`--jinja`), lo que implica la existencia de un chat template.
- Conversaciones multi-turno: formato GGUF compatible con llama.cpp, por lo que admite gestion de historial de mensajes mediante la plantilla de chat.
- Ejecucion local y offline: todo el modelo cabe en un unico archivo GGUF, lo que habilita inferencia sin conexion y sin envio de datos a servicios externos.
- Capacidades multilingues: no disponible. No se declara ninguna lista de idiomas.
- Tool calling / function calling: no confirmado. El autor no lo menciona y no hay evidencia en los metadatos.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Vision: no hay evidencia de soporte multimodal. La mencion a `llama-mtmd-cli` en la model card forma parte del texto generico de la plantilla de Unsloth y aparece como ejemplo condicional ("For multimodal models"), no como una capacidad declarada de este modelo concreto.
- Razonamiento, matematicas, generacion de codigo y uso como agente: sin datos publicados que lo confirmen o lo desmientan.

## Casos de uso

- Asistente conversacional autoalojado: el modelo puede desplegarse con llama.cpp u Ollama en una maquina propia y atender conversaciones multi-turno mediante su chat template, sin coste por token ni cesion de datos a terceros.
- Escritura creativa y narrativa: un modelo de 12B con cuantizacion de 4 bits es un tamano habitual para tareas de redaccion larga y roleplay en local; la calidad concreta en este dominio no esta documentada por el autor.
- Prototipado rapido de aplicaciones de chat: la compatibilidad con endpoints y con llama.cpp permite levantar un servidor de inferencia en minutos para validar un producto conversacional antes de comprometerse con modelos mayores.
- Resumen y reescritura de documentos: si se confirma la ventana de contexto larga reportada por terceros, seria adecuado para condensar documentos extensos; conviene verificar experimentalmente la degradacion en contextos muy largos antes de llevarlo a produccion.
- Generacion de datos sinteticos conversacionales: util para producir corpus de dialogo de bajo coste que alimenten posteriores etapas de fine-tuning o evaluacion.
- Punto de partida para fine-tuning propio: al estar disponible en GGUF y proceder de Unsloth, se puede reutilizar como referencia de formato, si bien el ajuste fino conviene hacerlo sobre los pesos sin cuantizar del modelo base.
- Despliegue en entornos con recursos limitados: con la cuantizacion Q4_K_M (7,5 GB) encaja en GPUs de consumo de 8 a 12 GB, lo que permite ejecutarlo en estaciones de trabajo modestas o en portatiles con GPU dedicada.
- Educacion y demostraciones tecnicas: sirve para ilustrar el flujo completo de fine-tuning, conversion a GGUF y cuantizacion con Unsloth en cursos o talleres.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El autor no incluye ninguna tabla de evaluacion (MMLU, HumanEval, GSM8K ni similares), y los directorios de terceros consultados tampoco aportan cifras verificables para esta version cuantizada.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q4_K_M del repositorio ocupa 7,5 GB, por lo que necesita aproximadamente 8-10 GB de VRAM contando el contexto y el overhead del runtime. En FP16, el modelo completo requeriria del orden de 24,5 GB (cifra que coincide con la reportada por llm-explorer para el modelo base); una cuantizacion de 8 bits se situaria en torno a 13 GB.
- GPU recomendadas: RTX 4090, RTX 3090, A100 40 GB o H100 para ejecucion en precision alta o con contextos muy largos. Para Q4_K_M son suficientes tarjetas de gama media-alta.
- Compatibilidad con GPU de consumo: si. Q4_K_M cabe en RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070 y superiores. En tarjetas de 8 GB la cuantizacion Q4_K_M queda al limite y puede requerir descarga parcial de capas a CPU o cuantizaciones mas agresivas.
- Opciones de despliegue: llama.cpp (incluido `llama-cli` con `--jinja`, tal como documenta el autor), Ollama, LM Studio y servidores compatibles con la API de llama.cpp. Las cuantizaciones de bartowski incluyen variantes I-quant, que no son compatibles con el backend Vulkan y requieren compilaciones con soporte rocBLAS o ROCm en GPUs AMD.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de tokens por segundo para este modelo.

## Comparativa con modelos similares

La comparativa se establece frente a modelos de tamano y categoria equivalentes. Los datos de las alternativas corresponden a sus especificaciones publicas por sus respectivos desarrolladores; los de este modelo, a los metadatos del repositorio.

| Modelo | Parametros | Contexto | Licencia | Formato y disponibilidad |
|---|---|---|---|---|
| MN-12B-Celeste-V1.9-GGUF | ~12,25 B | no disponible (1000K reportado por un tercero, sin verificar) | no disponible | GGUF, Q4_K_M en el repo del autor; cuantizaciones adicionales de bartowski |
| Mistral-Nemo-Instruct-2407 | ~12,2 B | 128K | Apache 2.0 | Safetensors y GGUF; ampliamente adoptado |
| Qwen2.5-14B-Instruct | ~14,7 B | 32K (hasta 128K en variantes ampliadas) | Apache 2.0 | Safetensors y GGUF |
| Gemma 2 9B | ~9,2 B | 8K | Licencia Gemma (con restricciones de uso) | Safetensors y GGUF |

No hay datos de rendimiento comparado disponibles para MN-12B-Celeste-V1.9, por lo que la comparacion se limita a parametros, contexto, licencia y disponibilidad. Frente a las alternativas citadas, su principal desventaja es la ausencia de licencia declarada, lo que impide determinar si el uso comercial esta permitido.

## Limitaciones y advertencias

- Licencia no declarada: al no especificarse licencia, no se puede asumir permiso de uso comercial. Conviene contactar con el autor o abstenerse de usarlo en produccion hasta que se aclare.
- Sesgos desconocidos: no hay informacion sobre la composicion del dataset de fine-tuning, por lo que no se pueden anticipar sesgos de genero, raza, ideologia ni de dominio.
- Riesgo de alucinacion: no se ha publicado ninguna evaluacion de factualidad ni de tasa de alucinacion; como cualquier LLM de este tamano, es esperable que invente datos cuando se le interroga fuera de su distribucion de entrenamiento.
- Procedencia del modelo base sin confirmar: la atribucion a la familia Mistral se basa en metadatos y en la coincidencia del recuento de parametros, no en una declaracion explicita del autor. Esto afecta tambien a las condiciones de uso heredadas del modelo original.
- Contexto sin verificar: la cifra de 1000K de contexto procede de un directorio de terceros y no esta respaldada por el autor. Antes de disenar un caso de uso con contexto largo hay que medir el rendimiento real en la cuantizacion Q4_K_M, donde la degradacion por cuantizacion del cache KV puede ser relevante.
- Idiomas no declarados: se desconoce que idiomas estan cubiertos de forma fiable, incluido el castellano.
- Soporte de herramientas no confirmado: no se debe asumir compatibilidad con function calling ni con flujos de agentes sin validarlo experimentalmente.
- Traccion y mantenimiento limitados: 127 descargas y 1 like, un unico colaborador y ausencia de documentacion tecnica. No hay garantia de mantenimiento, soporte ni correccion de errores.
- Ausencia de pesos sin cuantizar en este repositorio: al distribuirse solo en GGUF, no es adecuado como base directa para fine-tuning; habria que recurrir al modelo original sin cuantizar.
- Ruido de plantilla en la model card: la mencion a `llama-mtmd-cli` procede de la plantilla generica de Unsloth y no implica capacidades multimodales.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Adking98/MN-12B-Celeste-V1.9-GGUF
- Cuantizaciones alternativas de bartowski: https://huggingface.co/bartowski/MN-12B-Celeste-V1.9-GGUF
- Modelo original (sin cuantizar), atribuido a nothingiisreal: https://huggingface.co/nothingiisreal/MN-12B-Celeste-V1.9
- Ficha de terceros en Inferix: https://inferix.co/models/nothingiisreal/MN-12B-Celeste-V1.9-GGUF
- Ficha de terceros en llm-explorer: https://llm-explorer.com/model/nothingiisreal%2FMN-12B-Celeste-V1.9,2bxSApZhib0Fj655SbLFDM
- Unsloth (herramienta usada para el ajuste y la conversion): https://github.com/unslothai/unsloth
- llama.cpp (runtime de inferencia para GGUF): https://github.com/ggml-org/llama.cpp
