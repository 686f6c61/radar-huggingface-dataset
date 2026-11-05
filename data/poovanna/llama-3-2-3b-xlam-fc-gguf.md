# poovanna/Llama-3.2-3B-xLAM-FC-GGUF

## Resumen

Llama-3.2-3B-xLAM-FC-GGUF es la version cuantizada en formato GGUF (Q4_K_M) del modelo poovanna/Llama-3.2-3B-xLAM-FC, un ajuste fino mediante QLoRA de Llama 3.2 3B Instruct especializado en function calling. Lo desarrolla Vignesh Poovanna y resuelve una tarea muy concreta: dada una consulta de usuario y una lista de definiciones de herramientas en JSON, el modelo devuelve una lista JSON de llamadas a funciones. El repositorio incluye unicamente el artefacto GGUF de 2,02 GB, pensado para ejecutarse en CPU con llama.cpp, Ollama o LM Studio.

El modelo parte de Llama 3.2 3B Instruct (3.212.749.888 parametros) y se entrena sobre 4.500 filas muestreadas del dataset Salesforce/xlam-function-calling-60k, con LoRA de rango 16 sobre todas las proyecciones de atencion y MLP (0,75% de parametros entrenables). La innovacion no esta en la arquitectura, que es el transformer denso estandar de Llama 3.2, sino en el proceso de ajuste: una sola epoca de 563 pasos en una Tesla T4 durante unos 50 minutos, con la perdida calculada solo sobre los tokens del asistente.

Su relevancia practica es que demuestra que un ajuste fino pequeno y barato puede convertir un modelo de 3B en un emisor de llamadas a herramientas con formato JSON valido en el 99,6% de los casos (frente al 61,0% del modelo base) y un exact match del 80,6% en el conjunto de evaluacion interno. Es, por tanto, una opcion ligera y desplegable en hardware modesto para pipelines de tool use de un solo turno en ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Llama 3.2 3B Instruct) |
| Parametros totales | 3.212.749.888 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 4.096 tokens en el ejemplo de uso con llama.cpp; contexto nativo de Llama 3.2 3B no indicado en la informacion disponible |
| Tipos de cuantizacion | Q4_K_M (unico fichero publicado en el repo) |
| Idiomas soportados | Ingles (en) |
| Licencia | Llama 3.2 Community License |
| Formato de pesos | GGUF (Q4_K_M, 2,02 GB) |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 3.2 3B Instruct sin modificaciones estructurales: un transformer denso con atencion y MLP estandar. El ajuste se realizo con QLoRA usando Unsloth y el SFTTrainer de TRL sobre el modelo base unsloth/Llama-3.2-3B-Instruct-bnb-4bit. El adaptador LoRA tiene rango 16, alpha 16, dropout 0 y se aplica a todas las proyecciones de atencion y MLP, lo que supone un 0,75% de parametros entrenables. La perdida se calcula unicamente sobre los tokens del asistente.

Los datos de entrenamiento son 4.500 filas muestreadas con semilla 42 del dataset Salesforce/xlam-function-calling-60k (generado con APIGen a partir de DeepSeek-V2-Chat y Mixtral-8x22B-Instruct), de las cuales se usaron 4.499. El regimen fue de una epoca, 563 pasos, batch efectivo de 8 (2 x 4 de acumulacion), learning rate 2e-4, optimizador adamw_8bit y longitud maxima de 2048 tokens, todo ello en una Tesla T4 durante aproximadamente 50 minutos. Tras el entrenamiento se fusiono el adaptador y se cuantizo a Q4_K_M con Unsloth. No se aplico RLHF ni DPO; es un ajuste supervisado puro. El formato de prompt sigue la convencion xLAM: un mensaje de sistema con las herramientas serializadas en JSON (campos name, description, parameters) y la instruccion de devolver solo una lista JSON de llamadas.

## Capacidades

- Generacion de llamadas a funciones: dada una consulta y un conjunto de definiciones de herramientas, produce una lista JSON de llamadas con nombre de funcion y argumentos.
- Formato JSON altamente fiable: 99,6% de salidas JSON validas en el conjunto de evaluacion del adaptador y 100% en las 72 filas probadas con el GGUF Q4_K_M.
- Seleccion de multiples herramientas en una misma consulta: el conjunto de evaluacion incluye 272 filas con multiples llamadas, con un exact match del 76,5%.
- Function calling de un solo turno en ingles, con temperatura 0,0 en los ejemplos de uso.
- No soporta bucles de agente ni gestion multi-turno segun la propia model card.
- Capacidades multilingues: solo ingles declarado.
- No se documentan capacidades de vision, audio, thinking mode ni razonamiento extendido; el modelo se limita a la tarea de emision de llamadas.

## Casos de uso

- Enrutamiento de herramientas en asistentes conversacionales: el modelo recibe la consulta del usuario y el catalogo de funciones disponibles y devuelve la llamada correcta en JSON, lo que permite construir un orquestador de herramientas ligero que se ejecuta en CPU sin GPU dedicada.
- Automatizacion de backends con API extensas: con 4.096 tokens de contexto en llama.cpp se pueden inyectar decenas de definiciones de funciones en el mensaje de sistema y dejar que el modelo seleccione la adecuada, reduciendo el codigo de enrutamiento manual.
- Despliegue en entornos con recursos limitados: al ocupar 2,02 GB en Q4_K_M y ejecutarse con llama.cpp, Ollama o LM Studio, cabe en portatiles y servidores sin acelerador, lo que facilita prototipos y demos locales.
- Preprocesado de lenguaje natural a llamadas estructuradas: integrado en un pipeline que traduzca peticiones en texto libre a invocaciones de funciones internas (consultas a bases de datos, operaciones CRUD, envio de correos) antes de validar los argumentos.
- Evaluacion y generacion de datos sinteticos de tool use: sirve como modelo de referencia barato para comparar estrategias de prompting o para etiquetar ejemplos de entrenamiento de modelos mayores en tareas de function calling.
- Filtrado y clasificacion de intenciones con salida estructurada: al devolver siempre JSON, se puede usar como clasificador de acciones en sistemas de tickets o chatbots, donde la salida se parsea directamente sin post-procesado heuristico.
- Educacion y experimentacion: su coste de entrenamiento (una T4, 50 minutos) y su receta publicada en GitHub lo convierten en un caso practico para aprender QLoRA y el formato xLAM.

## Benchmarks y rendimiento

Resultados publicados por el autor. El adaptador se evaluo sobre 500 filas reservadas (250 de test y 250 filas xLAM no vistas), con decodificacion greedy y el mismo prompt para ambos modelos; la linea base es el mismo modelo con el adaptador desactivado.

| Metrica | Base | Fine-tuned |
|---|---|---|
| JSON valido | 61,0% | 99,6% |
| Exact match, cualquier orden | 6,4% | 80,6% (IC 95%: 76,9-83,8) |
| Exact match, ordenado | 6,4% | 80,2% |
| Nombres de funcion correctos | 14,0% | 97,8% |
| Recall por llamada | 8,5% | 85,4% |

Desglose por tipo de consulta (exact match): llamada unica 4,4% a 85,5% (228 filas); llamadas multiples 8,1% a 76,5% (272 filas).

Evaluacion del GGUF Q4_K_M con llama.cpp en CPU sobre 72 filas reservadas: JSON valido 100%, exact match 79,2% (IC 95%: 68,4-86,9). El autor senala que 72 filas no permiten detectar una perdida pequena por cuantizacion. De los 97 fallos restantes del adaptador, 86 invocan las funciones correctas con argumentos distintos (diferencias de codificacion, valores inventados o argumentos opcionales extra), por lo que el exact match estricto probablemente subestima el exito real. No se han publicado resultados en benchmarks externos como BFCL.

## Requisitos de hardware

- VRAM estimada: al ser un GGUF Q4_K_M de 2,02 GB, la inferencia puede ejecutarse integramente en CPU con RAM; en GPU, el fichero completo cabe en cualquier tarjeta con 3 GB o mas de VRAM.
- GPU recomendadas: no se especifican en la informacion disponible; por tamano, cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) puede alojar el modelo completo. El entrenamiento se realizo en una Tesla T4.
- Cabe en GPU consumer: si, en practicamente todas las GPU con 3 GB o mas de VRAM, y tambien en CPU.
- Opciones de despliegue: llama.cpp (comando `llama cli`), Ollama (`ollama run hf.co/...`), LM Studio y llama-cpp-python. El repositorio esta marcado como compatible con endpoints.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Function calling | Licencia | Formato |
|---|---|---|---|---|---|
| Llama-3.2-3B-xLAM-FC-GGUF (este) | 3,2B | 4.096 en ejemplo llama.cpp | Especializado, JSON valido 99,6% (adaptador) | Llama 3.2 Community | GGUF Q4_K_M |
| Llama 3.2 3B Instruct (base) | 3,2B | no disponible | Generico, JSON valido 61,0% en la evaluacion del autor | Llama 3.2 Community | Safetensors, GGUF |
| Salesforce xLAM (familia) | no disponible | no disponible | Especializado en tool use | no disponible | no disponible |

La comparacion con la familia xLAM de Salesforce se incluye por la relacion con el dataset de entrenamiento, pero no se dispone de especificaciones detalladas en la informacion proporcionada. No se dispone de datos de benchmarks de terceros para situar este ajuste frente a otros modelos especializados en function calling.

## Limitaciones y advertencias

- Solo distribuido en ingles y para function calling de un solo turno; no hay soporte de bucle de agente ni de conversaciones multi-turno.
- Todos los numeros provienen de filas reservadas del propio dataset de entrenamiento; no se ha evaluado en BFCL ni en otros benchmarks externos, por lo que el rendimiento fuera de distribucion es desconocido.
- Desajuste de prompt: la evaluacion uso un mensaje de sistema redactado de forma distinta al de entrenamiento, y la reevaluacion con el prompt exacto esta pendiente.
- La linea base esta limitada por el formato: gran parte del 6,4% del modelo base refleja su incapacidad de producir el JSON exigido, no una mala seleccion de herramientas.
- Solapamiento entre entrenamiento y test: 5 de las 250 consultas de test aparecen tambien en el split de entrenamiento; las otras 250 filas se filtraron, por lo que como maximo 5 de 500 filas estan afectadas.
- Filas repetidas: antes del entrenamiento se ejecuto una prueba de humo de 30 pasos y el entrenamiento continuo desde esos pesos, de modo que las primeras centenares de filas se vieron dos veces.
- Ejecucion unica: una sola semilla, sin busqueda de hiperparametros ni estimacion de varianza.
- El dataset xLAM se publica para fines de investigacion y sus autores reportan aproximadamente un 95% de correccion en una revision humana de 600 filas; conviene validar los argumentos antes de ejecutar cualquier llamada.
- La licencia Llama 3.2 Community License impone restricciones y obligaciones de atribucion para uso comercial; debe revisarse antes de desplegar en produccion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/poovanna/Llama-3.2-3B-xLAM-FC-GGUF
- Modelo base del ajuste: https://huggingface.co/poovanna/Llama-3.2-3B-xLAM-FC
- Codigo, notebooks y write-up: https://github.com/vignesh-poovanna/Llama-3.2-3B-xLAM-FC
- Dataset de entrenamiento: https://huggingface.co/datasets/Salesforce/xlam-function-calling-60k
- Paper APIGen (arXiv:2406.18518): https://arxiv.org/abs/2406.18518
- Licencia Llama 3.2: https://www.llama.com/llama3_2/license/
