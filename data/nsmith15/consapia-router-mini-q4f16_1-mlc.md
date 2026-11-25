# Nsmith15/consapia-router-mini-q4f16_1-MLC

## Resumen

consapia-router-mini-q4f16_1-MLC es un modelo de lenguaje de 360 millones de parámetros especializado en el enrutamiento de consultas (query routing). Lo desarrolla Consapia mediante fine-tuning de HuggingFaceTB/SmolLM2-360M-Instruct, con el objetivo concreto de descomponer una pregunta del usuario en entre 2 y 6 subtareas y devolverlas estructuradas como un plan en JSON. No es un modelo de propósito general, sino un componente de orquestación pensado para encadenarse con otros modelos o herramientas dentro de un pipeline de agentes.

La versión publicada está cuantizada a 4 bits con el esquema `q4f16_1` en formato MLC y empaquetada para WebLLM, lo que permite ejecutarla íntegramente en el navegador del cliente mediante WebGPU, sin backend de inferencia en servidor. El repositorio ocupa aproximadamente 0,2 GB y reutiliza la librería compilada oficial de WebLLM para `SmolLM2-360M-Instruct-q4f16_1-MLC`, de modo que el grafo computacional es el del modelo base y solo cambian los pesos ajustados.

Su relevancia práctica radica en el binomio tamaño mínimo más despliegue local: un router de subtareas que cabe en cualquier equipo con WebGPU y que puede reducir la latencia y el coste de sistemas multiagente al resolver la planificación en el dispositivo antes de invocar modelos mayores. La información pública disponible es muy escasa (29 descargas, sin métricas de evaluación ni detalles del dataset de fine-tuning), por lo que las secciones siguientes marcan como no disponible todo aquello que el autor no documenta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de SmolLM2-360M-Instruct) |
| Parametros totales | 360 millones (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (el modelo base SmolLM2-360M-Instruct declara 8.192 tokens; no confirmado para este fine-tuning) |
| Tipos de cuantizacion | q4f16_1 (4 bits en pesos, activaciones en float16) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | MLC (compilado para WebLLM); no se publican safetensors ni GGUF en este repositorio |

## Arquitectura y entrenamiento

El modelo parte de SmolLM2-360M-Instruct, un transformer decoder-only denso de 360 millones de parámetros entrenado por Hugging Face. Sobre esa base, Consapia aplica un fine-tuning cuya metodología, número de tokens, composición del dataset e hiperparámetros no se documentan en la model card. Tampoco se indica si hubo RLHF, DPO u otra fase de alineación posterior; el único dato verificable es la existencia de un fichero `NOTICE` que describe los cambios respecto al modelo original, aunque su contenido no se detalla en la información disponible.

La innovación técnica del artefacto no está en la arquitectura, sino en el empaquetado: los pesos se distribuyen en formato MLC con cuantización `q4f16_1` y se ejecutan con la librería compilada oficial de WebLLM para SmolLM2-360M-Instruct. Esto implica que el modelo corre en el navegador vía WebGPU con el runtime de MLC-LLM, sin necesidad de servidor, y que la huella en disco es de unos 0,2 GB. El ajuste funcional consiste en forzar una salida JSON con un plan de 2 a 6 subtareas, lo que sugiere un entrenamiento orientado a formato estructurado más que a conocimiento factual.

## Capacidades

- Descomposición de consultas: dada una pregunta, genera un plan con entre 2 y 6 subtareas.
- Salida estructurada en JSON, apta para consumo programático por parte de un orquestador.
- Enrutamiento de consultas dentro de pipelines multiagente o sistemas de herramientas.
- Generación de texto instructivo básico, heredada del modelo base SmolLM2-360M-Instruct.
- Ejecución en navegador mediante WebLLM y WebGPU, sin backend de inferencia.
- Soporte de tool calling: no documentado.
- Capacidades de agente autónomo multi-paso: no documentadas (el modelo planifica, no ejecuta).
- Capacidades multilingües: no documentadas.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Enrutamiento de consultas en asistentes web: el modelo recibe la pregunta del usuario, la divide en subtareas y devuelve el JSON que un orquestador usa para decidir qué herramienta o modelo invocar después; su tamaño permite ejecutarlo en el cliente y ahorrar una llamada al servidor.
- Planificación previa en sistemas RAG: antes de lanzar la búsqueda documental, el router descompone la pregunta en subconsultas independientes, lo que mejora la cobertura de recuperación en preguntas compuestas.
- Preprocesado en pipelines multiagente: actúa como primera etapa barata que reparte trabajo entre agentes especializados (código, matemáticas, búsqueda web) sin consumir tokens de un modelo grande.
- Aplicaciones web offline-first: al ejecutarse con WebLLM en el navegador, permite planificar consultas sin conexión ni servidor, útil en demos, prototipos y entornos con requisitos de privacidad estrictos.
- Clasificación y descomposición de tickets de soporte: convierte una incidencia redactada en lenguaje natural en una lista de comprobaciones o pasos de diagnóstico que el sistema de ticketing puede procesar automáticamente.
- Evaluación de agentes y benchmarks de planificación: sirve como router de referencia ligero para comparar estrategias de descomposición de tareas sin coste de inferencia en la nube.
- Filtro previo en asistentes de voz o chat de baja latencia: al ser un modelo de 360M cuantizado a 4 bits, la latencia de planificación es mínima y puede ejecutarse antes de cualquier llamada a un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica en el caso principal de despliegue, ya que el modelo está empaquetado para WebLLM y se ejecuta sobre WebGPU en el navegador; el repositorio ocupa 0,2 GB, por lo que la huella de memoria es del orden de unos cientos de MB.
- GPU recomendadas: cualquier GPU integrada o dedicada con soporte WebGPU estable (por ejemplo, Apple Silicon, GPUs Intel/AMD recientes y NVIDIA RTX serie 20 o superior); no se especifican modelos concretos en la documentación.
- Cabe en GPU de consumo: sí, por tamaño (360M parámetros en 4 bits) y por el formato de despliegue orientado a cliente.
- Opciones de despliegue: WebLLM (vía MLC-LLM) es la vía documentada; para otros runtimes no se publican pesos en safetensors ni GGUF en este repositorio, por lo que vLLM, llama.cpp, Ollama o TGI no son utilizables directamente con estos artefactos.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / despliegue | Licencia | Notas |
|---|---|---|---|---|---|
| consapia-router-mini-q4f16_1-MLC | 360M | no disponible (base: 8.192) | MLC / WebLLM | Apache 2.0 | Router de subtareas con salida JSON |
| HuggingFaceTB/SmolLM2-360M-Instruct | 360M | 8.192 tokens | safetensors, GGUF, MLC | Apache 2.0 | Modelo base instructivo de propósito general |
| SmolLM2-1.7B-Instruct | 1.700M | 8.192 tokens | safetensors, GGUF, MLC | Apache 2.0 | Alternativa mayor del mismo linaje, más capaz pero más pesada |
| Qwen2.5-0.5B-Instruct | 500M | 32.768 tokens | safetensors, GGUF, MLC | Apache 2.0 | Alternativa de tamaño similar con contexto mayor, sin especialización en routing |

La comparación de rendimiento no es posible: no hay benchmarks publicados para el modelo de Consapia ni resultados comparables en la información disponible.

## Limitaciones y advertencias

- Ausencia total de evaluación publicada: no hay benchmarks, métricas de precisión del JSON ni tasas de error de descomposición.
- Sesgos: no documentados; al derivar de SmolLM2-360M-Instruct, hereda los sesgos del corpus de entrenamiento del modelo base, no caracterizados en esta ficha.
- Riesgo de alucinación: alto en un modelo de 360M, especialmente si se le pide conocimiento factual; su uso previsto es estructural (generar un plan), no responder preguntas.
- Salida JSON no garantizada al 100 %: al no documentarse técnicas de decodificación restringida, el consumidor debe validar y reparar el JSON en producción.
- Idiomas: no se especifican; el fine-tuning podría estar limitado al inglés, por lo que el rendimiento en castellano es incierto.
- Contexto: no confirmado para este fine-tuning; conviene asumir el del modelo base (8.192 tokens) y verificar antes de usarlo con entradas largas.
- Licencia Apache 2.0: permite uso comercial, pero exige conservar avisos de licencia y el fichero `NOTICE` con los cambios; conviene revisar su contenido antes de redistribuir.
- Dependencia de WebGPU: el despliegue en navegador requiere soporte de WebGPU estable, lo que excluye navegadores y dispositivos antiguos.
- Madurez: 29 descargas y 0 likes en el momento de redactar; proyecto de nicho sin comunidad ni soporte documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Nsmith15/consapia-router-mini-q4f16_1-MLC
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct
- Repositorio de WebLLM: https://github.com/mlc-ai/web-llm
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0.txt
