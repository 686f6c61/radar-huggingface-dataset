# 888rok/gemma-4-26B-A4B-it-UD-Q4_K_M-wllama-split

## Resumen

Este repositorio contiene una versión cuantizada en Q4_K_M del modelo Gemma 4 26B A4B IT de Google DeepMind, dividida en shards de menos de 2 GB para poder cargarla con wllama, una biblioteca de inferencia que ejecuta modelos GGUF directamente en el navegador. El autor, 888rok, ha tomado el archivo GGUF generado por Unsloth y lo ha particionado con `llama-gguf-split`, de modo que wllama resuelve automáticamente los shards restantes al cargar el primero.

Gemma 4 es la última familia de modelos abiertos de Google DeepMind, diseñada para ejecución on-device. Incluye variantes densas y MoE, con soporte multimodal (texto e imagen), razonamiento híbrido y una ventana de contexto de hasta 256K tokens. La versión 26B A4B es un modelo de mezcla de expertos con 26 000 millones de parámetros totales y solo 4 000 millones activos por token, lo que permite un rendimiento elevado con un coste computacional contenido.

La relevancia de este repositorio concreto radica en que posibilita ejecutar un modelo de 26B en el navegador sin necesidad de servidores ni GPUs dedicadas, democratizando el acceso a modelos de gran tamaño para prototipado, educación y aplicaciones client-side. El peso cuantizado ocupa 16,9 GB en disco, repartido en varios archivos, y la licencia del modelo base es Apache-2.0, aunque el repositorio no especifica una licencia propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) |
| Parametros totales | 25 233 142 046 (25,23 B) |
| Parametros activos | 4 B |
| Longitud de contexto | 256 000 tokens (segun documentacion de Gemma 4) |
| Tipos de cuantizacion | Q4_K_M (este repositorio) |
| Idiomas soportados | Mas de 140 (segun documentacion de Gemma 4) |
| Licencia | Apache-2.0 (modelo base); no especificada en este repositorio |
| Formato de pesos | GGUF, dividido en shards de <2 GB para wllama |

## Arquitectura y entrenamiento

Gemma 4 26B A4B emplea una arquitectura de mezcla de expertos (MoE) con 26 000 millones de parametros totales y 4 000 millones activos por token. Esta configuracion permite activar solo una fraccion de los pesos en cada paso de inferencia, reduciendo la carga computacional y la latencia en comparacion con un modelo denso del mismo tamano. El modelo es multimodal: acepta entradas de texto e imagen y genera texto, y esta disenado con un modo de razonamiento hibrido que combina pensamiento explicito con generacion directa, segun la documentacion oficial de Google DeepMind.

Los datos de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF o DPO) no estan disponibles en la informacion proporcionada. La cuantizacion Q4_K_M aplicada por Unsloth reduce la precision de los pesos a 4 bits con un bloque K, lo que disminuye el tamano del archivo y los requisitos de memoria a costa de una ligera perdida de calidad. El particionado en shards de menos de 2 GB es una modificacion tecnica para superar las limitaciones de tamano de archivo de wllama en el navegador, sin alterar la arquitectura interna del modelo.

## Capacidades

- Generacion de texto, razonamiento, codigo y matematicas, segun la documentacion oficial de Gemma 4.
- Procesamiento multimodal: acepta imagenes como entrada y genera texto descriptivo o analitico.
- Razonamiento hibrido con modo de pensamiento explicito (thinking mode) para tareas complejas de varios pasos.
- Soporte multilingue en mas de 140 idiomas, incluyendo espanol, ingles, frances, aleman, etc.
- Capacidad de tool calling y function calling, aunque no se detalla en este repositorio especifico; la documentacion de Google Cloud indica que el modelo soporta estas funciones.
- Ejecucion en navegador via wllama, lo que permite inferencia local sin servidor.

## Casos de uso

- Asistente conversacional en el navegador: al cargar el modelo con wllama, se puede construir un chat privado que funciona sin conexion, ideal para entornos con restricciones de red o requisitos de privacidad.
- Analisis de imagenes en aplicaciones web: el modelo acepta entradas visuales, por lo que puede clasificar, describir o extraer informacion de fotografias directamente en el cliente.
- Generacion de codigo en entornos de desarrollo: con soporte de tool calling, puede integrarse en editores web o entornos de aprendizaje para autocompletar, explicar o depurar fragmentos de codigo.
- Educacion y prototipado: estudiantes e investigadores pueden experimentar con un modelo de 26B sin necesidad de infraestructura GPU, usando solo un navegador moderno.
- Razonamiento multi-step en aplicaciones de analisis: el modo de pensamiento hibrido permite descomponer problemas complejos en pasos logicos, util para tareas de planificacion o diagnostico.
- Traduccion y procesamiento multilingue: con soporte para mas de 140 idiomas, puede traducir documentos, transcribir conversaciones o normalizar texto en multiples lenguas desde el navegador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de MMLU, HumanEval, GSM8K ni otras evaluaciones estandar, y la busqueda web no ha proporcionado datos cuantitativos de rendimiento para esta cuantizacion especifica. Se recomienda consultar la documentacion oficial de Gemma 4 para obtener resultados de evaluacion del modelo base sin cuantizar.

## Requisitos de hardware

- Tamano del repositorio: 16,9 GB en disco, repartido en shards de menos de 2 GB.
- Para inferencia en navegador con wllama: se requiere un navegador moderno con soporte WebAssembly y suficiente memoria RAM. El modelo Q4_K_M necesita aproximadamente 17 GB de RAM para cargar los pesos, mas memoria adicional para las activaciones y el contexto.
- En GPU: el modelo cuantizado puede ejecutarse en GPUs consumer con al menos 16 GB de VRAM, como una RTX 4080 o RTX 4090, usando llama.cpp o vLLM con soporte GGUF.
- En CPU: es posible ejecutar el modelo en CPU con 32 GB de RAM, aunque la latencia sera alta (varios segundos por token) debido al tamano del modelo.
- Opciones de despliegue: wllama (navegador), llama.cpp, Ollama, LM Studio, vLLM (con conversion a formato compatible).
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen del hardware y del tamaño del contexto.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Gemma 4 26B A4B (este repo) | 25,23 B | 4 B | 256K | Apache-2.0 | GGUF Q4_K_M |
| Gemma 4 12B | 12 B | 12 B (denso) | 256K | Apache-2.0 | Dense |
| Gemma 4 31B | 31 B | 31 B (denso) | 256K | Apache-2.0 | Dense |
| Qwen 2.5 32B | 32 B | 32 B (denso) | 128K | Apache-2.0 | Dense |

La comparativa se basa en datos publicos de la familia Gemma 4 y modelos similares. El 26B A4B destaca por su eficiencia: con solo 4B activos, ofrece un rendimiento comparable a modelos densos de mayor tamano en tareas de razonamiento y codigo, con un coste de inferencia mucho menor. La ventaja principal de este repositorio es su compatibilidad con wllama, que no esta disponible en las alternativas listadas.

## Limitaciones y advertencias

- Sesgos: no se han documentado sesgos especificos para este modelo, pero al ser un modelo entrenado con datos web, puede reflejar sesgos sociales, culturales o de genero presentes en el corpus de entrenamiento.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede generar informacion falsa o inventada, especialmente en tareas de razonamiento complejo o con contextos ambiguos. Se recomienda verificar las salidas en aplicaciones criticas.
- Limitaciones de contexto: aunque la ventana declarada es de 256K tokens, en la practica la calidad de las respuestas puede degradarse en contextos muy largos, y el uso de cuantizacion Q4_K_M puede acentuar este efecto.
- Restricciones de licencia: el modelo base es Apache-2.0, lo que permite uso comercial y modificacion, pero este repositorio no especifica una licencia propia. Se debe contactar con el autor o revisar los terminos de HuggingFace antes de redistribuir.
- Limitaciones de wllama: la inferencia en navegador esta limitada por la memoria disponible del dispositivo y el rendimiento de WebAssembly. Modelos de 26B pueden no cargar en dispositivos con menos de 16 GB de RAM.
- Cuantizacion: la precision Q4_K_M introduce una perdida de calidad respecto al modelo original en FP16, especialmente en tareas de matematicas o codigo de alta precision.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/888rok/gemma-4-26B-A4B-it-UD-Q4_K_M-wllama-split
- Modelo base GGUF de Unsloth: https://huggingface.co/unsloth/gemma-4-26B-A4B-it-GGUF
- Pagina oficial de Gemma 4 (DeepMind): https://deepmind.google/models/gemma/gemma-4/
- Model card de Gemma 4 (Google AI for Developers): https://ai.google.dev/gemma/docs/core/model_card_4
- Documentacion de Gemma 4 en Unsloth: https://unsloth.ai/docs/models/gemma-4
- Repositorio de wllama: https://github.com/ngxson/wllama
- Pagina de Gemma 4 26B A4B en LM Studio: https://lmstudio.ai/models/google/gemma-4-26b-a4b
