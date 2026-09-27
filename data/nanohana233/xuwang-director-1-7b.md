# nanohana233/Xuwang-Director-1.7B

## Resumen

Xuwang-Director-1.7B (虚妄 · Xuwang-Director-1.7B) es un modelo de decision tipada para direccion de juego, desarrollado por nanohana233 (publicador: zheznanohana) y publicado en HuggingFace. No es un chatbot ni un generador de texto: parte del backbone de Qwen/Qwen3-1.7B-Base y sustituye la cabeza de lenguaje por 193 cabezas lineales por campo que cubren 10 tipos de tarea. En una unica pasada forward, el modelo emite distribuciones softmax para campos de eleccion y puntuaciones sigmoideas para campos multietiqueta, es decir, devuelve probabilidades sobre opciones concretas en lugar de frases generadas.

El problema que aborda es acotado y explicito en su model card: entrenar un "director" local que aporte preferencias dentro de un conjunto fijo de decisiones de diseno de juego, dejando las restricciones y la ejecucion al propio motor del juego. La adaptacion se hizo con LoRA (r=16, alpha=32, dropout=0,05, checkpoint del paso 2000) sobre el modelo base, con destilacion de conocimiento de un profesor no identificado en la informacion disponible. El repositorio ocupa 2,3 GB e incluye pesos en safetensors y una cuantizacion GGUF Q4_K_M de 1.107.408.416 bytes, que debe descargarse junto con el fichero `heads.json`.

Su relevancia actual es la de un caso de estudio de especializacion extrema sobre un modelo pequeno (1.720.574.976 parametros): permite inferencia local sin claves de API en la nube, con licencia Apache-2.0 para el codigo y una evaluacion publicada de fidelidad al profesor (0,7719 de acuerdo macro) en lugar de metricas de calidad objetiva. El proyecto esta en fase muy temprana (0 descargas y 0 likes en el momento de la consulta) y su ambito declarado es la investigacion y la integracion dentro de la distribucion de tareas para la que fue entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone decoder de Qwen3-1.7B-Base + 193 cabezas lineales por campo; una pasada forward, sin texto generado |
| Parametros totales | 1.720.574.976 (~1,72 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | GGUF Q4_K_M publicada (1.107.408.416 bytes); otros niveles GGUF, no disponible |
| Idiomas soportados | en, zh (la model card indica "compact English prompts, game-specific option identifiers") |
| Licencia | Apache-2.0 (codigo); la licencia y atribucion del modelo base se remiten a MODEL_TERMS.md |
| Formato de pesos | safetensors (pesos/adaptador), GGUF Q4_K_M y heads.json |
| Adaptacion | LoRA r=16, alpha=32, dropout=0,05; paso 2000 seleccionado |
| Modelo base | Qwen/Qwen3-1.7B-Base |
| Dataset de entrenamiento | nanohana233/Xuwang-Director-Data |
| Fecha de entrenamiento (registro del autor) | 2026-09-25 |
| Representacion oculta | Ultimo token, normalizado L2, escala aprendida 8,69564437866211 |
| Salidas | Softmax para campos de eleccion; sigmoide para campos multietiqueta |
| Tamano del repositorio | 2,3 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura combina un backbone transformer decoder (el de Qwen3-1.7B-Base) con 193 cabezas lineales independientes, una por campo de decision, agrupadas en 10 tipos de tarea. La entrada no es texto libre conversacional, sino una serializacion exacta especifica de cada canal que termina en el token `<decide>`. La representacion que alimenta las cabezas es la del ultimo token, normalizada L2 y escalada por un factor aprendido de 8,69564437866211. Las cabezas de eleccion aplican softmax y las multietiqueta aplican sigmoide, de modo que la salida es una coleccion de probabilidades y puntuaciones que el motor del juego debe interpretar y validar.

El ajuste se realizo mediante LoRA (r=16, alpha=32, dropout=0,05) sobre el modelo base, seleccionando el checkpoint del paso 2000, y con destilacion de conocimiento desde un profesor del que no se detallan la identidad ni el tamano en la informacion disponible. No se especifican el numero de tokens de entrenamiento ni la composicion completa del dataset (publicado como nanohana233/Xuwang-Director-Data). Tampoco se documenta el uso de RLHF o DPO; la senal de entrenamiento es la imitacion del profesor, y la metrica publicada mide precisamente esa fidelidad.

El autor senala como limitacion estructural que las cabezas son independientes: no garantizan una asignacion conjuntamente valida, y por eso el modelo esta pensado para que el host aplique mascaras de legalidad por contexto y una validacion conjunta a nivel de anfitrion. El demo publico minimo no ejecuta el validador completo de presupuesto y compatibilidad ni la busqueda de politicas del juego.

## Capacidades

- Decision tipada: produce probabilidades sobre opciones concretas en 10 tipos de tarea y 193 cabezas de salida, sin generar texto.
- Campos de eleccion unica mediante softmax y campos multietiqueta mediante sigmoide en la misma pasada forward.
- Condicionamiento por contexto: consume serializaciones especificas de canal y termina en el token `<decide>`.
- Soporte de prompts compactos en ingles y de identificadores de opciones especificos del juego; el tag de HuggingFace declara en y zh.
- Inferencia local sin claves de API de terceros ni llamadas a servicios en la nube.
- Formato de pesos GGUF Q4_K_M para despliegue en CPU o GPU de gama baja.
- No soporta generacion de texto: no hay decodificacion autoregresiva ni salida en lenguaje natural.
- No se documenta soporte de tool calling, function calling ni comportamiento agentico multi-paso.
- No se documentan capacidades de vision, audio, thinking mode ni razonamiento explicito.

## Casos de uso

- Direccion dinamica de dificultad: el modelo puntua opciones de ajuste de dificultad en funcion del estado serializado de la partida, y el motor aplica despues los limites de presupuesto y compatibilidad que el modelo no valida.
- Seleccion de eventos y recompensas en juegos de tipo roguelike o narrativo: las cabezas de eleccion devuelven una distribucion sobre el catalogo de eventos disponible, util para muestrear variedad sin repetir el mismo guion.
- Generacion de propuestas de balance: en un pipeline de CI, el modelo puede puntuar configuraciones candidatas (costes, estadisticas, recompensas) y usar el validador del propio proyecto como filtro final antes de fusionar cambios.
- Prototipado de IA de director en estudios indie: al pesar 2,3 GB de repositorio y ejecutarse en local sin API externa, permite iterar en el diseno de decisiones sin coste por token ni dependencia de proveedores.
- Investigacion en destilacion de conocimiento: el par modelo-profesor y la metrica de acuerdo macro lo convierten en un banco de pruebas para medir cuanto de la politica de un profesor se retiene al destilar en un modelo de 1,7 B.
- Estudio de cuantizacion: la comparacion publicada entre la referencia de precision completa y Q4_K_M (0,9842 de acuerdo por campo sobre 300 filas) sirve para analizar la sensibilidad de cabezas lineales a la cuantizacion.
- Etiquetado auxiliar de decisiones: usar las puntuaciones como caracteristica adicional en un sistema de analitica de partidas, siempre que se respete la distribucion de entrada para la que fue entrenado.
- Sistemas embebidos o de borde: con la cuantizacion Q4_K_M y una sola pasada forward, es viable en equipos sin GPU dedicada, algo impracticable con modelos conversacionales mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Las unicas cifras publicadas miden fidelidad al profesor, no correccion objetiva de las decisiones, disfrute del jugador ni retencion.

| Evaluacion | Metrica | Resultado |
|---|---|---|
| Test completo historico | Acuerdo macro con el profesor (IC 95% 0,7659-0,7777) | 0,7719 |
| Caracteristicas congeladas + cabezas | Acuerdo macro con el profesor | 0,7273 |
| Variantes MLP sobre cuatro caracteristicas | Acuerdo macro con el profesor (rango) | 0,7648-0,7657 |
| Estudio de cuantizacion (300 filas) | Acuerdo por campo de Q4 frente a referencia de precision completa | 0,9842 |
| Estudio de cuantizacion (300 filas) | Puntuacion de profesor muestreada para Q4 | 0,7672 |

El autor advierte que la puntuacion de referencia muestreada y la de Q4 usan agregaciones distintas en el script original, por lo que su pequena diferencia no debe interpretarse como una perdida de cuantizacion emparejada exacta. El paquete de esta release no implica una nueva evaluacion completa del conjunto de test; los informes historicos estan en el directorio `evaluation/` del repositorio y el smoke test de la release en `LOCAL_VALIDATION.md`.

## Requisitos de hardware

- VRAM en precision completa (BF16/FP16): aproximadamente 3,4 GB solo de pesos (1,72 B x 2 bytes), mas el fichero de cabezas y el overhead de activaciones y runtime; en la practica, entre 4 y 5 GB.
- VRAM con GGUF Q4_K_M: el fichero ocupa 1.107.408.416 bytes (~1,1 GB); en GPU basta con 2 GB de VRAM para los pesos, mas el contexto.
- CPU: la ruta llama.cpp con Q4_K_M es viable en CPU sin GPU, con un consumo de RAM inferior a 2 GB para los pesos.
- GPU recomendadas: cualquier GPU consumer con 6-8 GB de VRAM o mas (RTX 3060, RTX 4060, RTX 4070, RTX 4090) es suficiente; A100 o H100 son innecesarias para este tamano y no aportan al caso de uso.
- Cabe en GPU consumer: si, en toda la gama actual, y tambien en iGPU o CPU con la cuantizacion Q4_K_M.
- Opciones de despliegue: llama.cpp para el GGUF (requiere cargar `heads.json` junto al modelo); transformers con PEFT para el adaptador LoRA en safetensors; vLLM solo si se implementan las cabezas personalizadas, ya que no es un modelo de generacion de texto estandar. Ollama no expone las cabezas tipadas sin trabajo adicional, por lo que no es una via directa.
- Latencia y throughput: no disponibles. Cabe senalar que la arquitectura requiere una unica pasada forward por decision, sin decodificacion autoregresiva, lo que reduce el coste frente a un LLM que genera texto.

## Comparativa con modelos similares

La comparacion no es homogenea: Xuwang-Director no genera texto, por lo que las alternativas son modelos base pequenos o asistentes generalistas de tamano comparable que si lo hacen. Los datos de contexto de las alternativas proceden de sus especificaciones publicas y no se han verificado en esta recopilacion.

| Modelo | Parametros | Tipo de salida | Licencia | Idiomas | Contexto |
|---|---|---|---|---|---|
| Xuwang-Director-1.7B | 1,72 B | Decision tipada (193 cabezas), sin texto | Apache-2.0 (codigo) | en, zh | No disponible |
| Qwen/Qwen3-1.7B-Base | ~1,7 B | Texto (modelo base, sin instrucciones) | Apache-2.0 | Multilingue | 32 768 (especificacion publica de Qwen3) |
| Qwen/Qwen2.5-1.5B-Instruct | ~1,5 B | Texto conversacional | Apache-2.0 | Multilingue | 32 768 (especificacion publica) |
| meta-llama/Llama-3.2-1B-Instruct | ~1,2 B | Texto conversacional, tool calling | Licencia comunitaria Llama 3.2 | Multilingue | 128 000 (especificacion publica) |
| HuggingFaceTB/SmolLM2-1.7B-Instruct | ~1,7 B | Texto conversacional | Apache-2.0 | Principalmente ingles | 8 192 (especificacion publica) |

Frente a estas alternativas, Xuwang-Director ofrece una salida estructurada y directamente consumible por un motor de juego, a cambio de perder toda capacidad conversacional, de generalizacion fuera de su distribucion de tareas y de tool calling.

## Limitaciones y advertencias

- No es un asistente conversacional ni un agente de juego general; la model card excluye explicitamente esos usos, asi como la generacion de historias sin restricciones.
- No es un director intercambiable en juegos arbitrarios: solo es valido dentro de la distribucion de tareas para la que fue entrenado.
- Las cabezas son independientes y no garantizan una asignacion conjuntamente valida; se requieren mascaras de legalidad por contexto y validacion conjunta en el host.
- El demo publico minimo no ejecuta el validador completo de presupuesto y compatibilidad ni la busqueda de politicas del juego.
- La confianza de las salidas no esta garantizada como calibrada.
- Riesgo de deriva de distribucion ante nuevos equilibrios de juego o formatos de entrada distintos de la serializacion exacta esperada.
- La metrica de 0,7719 mide fidelidad al profesor, no correccion objetiva de las decisiones, disfrute del jugador ni retencion; no debe presentarse como calidad absoluta.
- El autor advierte de que las puntuaciones muestreada y Q4 del estudio de cuantizacion usan agregaciones distintas y no son directamente comparables como perdida emparejada.
- Riesgo de alucinacion: no aplica en el sentido de texto inventado, porque no genera lenguaje; el riesgo equivalente es emitir puntuaciones altas para opciones ilegales o incompatibles, que el host debe filtrar.
- Idiomas: entrada pensada para prompts compactos en ingles con identificadores de opciones especificos del juego; el tag declara en y zh, pero la model card se centra en ingles.
- Licencia: el codigo es Apache-2.0, pero la licencia y atribucion del modelo base se remiten a MODEL_TERMS.md, por lo que conviene revisar ese fichero antes de un uso comercial.
- Estado del proyecto: 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por terceros.
- Aunque el repositorio lleva el tag endpoints_compatible, la salida no es texto generado, por lo que un endpoint estandar de text-generation no reproducira el comportamiento previsto.
- Sesgos conocidos: no se documentan en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nanohana233/Xuwang-Director-1.7B
- Dataset de entrenamiento: https://huggingface.co/datasets/nanohana233/Xuwang-Director-Data
- Repositorio de codigo y quick start: https://github.com/zheznanohana/Xuwang-Director-1.7B
- README en chino con pasos de ejecucion: https://github.com/zheznanohana/Xuwang-Director-1.7B/blob/codex/release/README.zh-CN.md
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B-Base
- Informes de evaluacion historicos y smoke test de la release: directorios `evaluation/` y fichero `LOCAL_VALIDATION.md` del repositorio de GitHub (no se han proporcionado URLs directas)
- Terminos y atribucion del modelo base: fichero `MODEL_TERMS.md` del repositorio (no se ha proporcionado URL directa)

Nota sobre la busqueda web: los resultados recuperados no guardan relacion con este modelo (corresponden a herramientas de generacion y edicion de imagenes y a un detector de texto generado por IA), por lo que no se incluye ninguno como enlace relevante.
