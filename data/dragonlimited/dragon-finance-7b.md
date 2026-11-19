# dragonlimited/Dragon-Finance-7B

## Resumen

Dragon-Finance-7B es un modelo de lenguaje de 7.000 millones de parámetros desarrollado por dragonlimited, orientado a tareas de análisis financiero y a actuar como núcleo de razonamiento de agentes autónomos en hardware de escritorio. Se construye como un ajuste fino (fine-tune) del modelo base Qwen2.5-Coder-7B-Instruct, del que hereda la arquitectura transformer densa y los conocimientos previos de código y tool calling. El objetivo declarado es ejecutar un asistente agéntico completo en una máquina mini-ITX con una única GPU de 8 GB de VRAM, sin dependencia de la nube ni de claves de API.

La propuesta técnica central es la separación entre razonamiento y conocimiento: el modelo no memoriza el corpus financiero, sino que razona sobre texto recuperado mediante un sistema de retrieval-augmented generation (RAG) apoyado en un índice vectorial y de texto completo almacenado en disco y CPU, sin consumir VRAM. El corpus asociado, Dragon-Finance-Corpus, consta de 134.899.262 chunks de 512 tokens con solapamiento de 64, mayoritariamente procedente de SEC EDGAR.

Es relevante ahora por su enfoque en el despliegue local-first y de bajo consumo: cuantizado en Q4_K_M ocupa 3,5 GB y permite contexto de 32k tokens con caché KV cuantizada, lo que lo sitúa en el segmento de modelos pequeños para agentes con requisitos de privacidad estrictos. El modelo se encuentra en estado de desarrollo: la arquitectura de despliegue y evaluación están fijadas, pero los adaptadores y los pesos cuantizados aún no se han publicado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer densa (hereda Qwen2.5-Coder-7B-Instruct) |
| Parámetros totales | 7B |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (configuración de despliegue documentada) |
| Tipos de cuantización | Q4_K_M (GGUF); caché KV en q8_0 |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) y GGUF (llama.cpp); pesos aún no publicados |

## Arquitectura y entrenamiento

El modelo es un fine-tune del transformer denso Qwen2.5-Coder-7B-Instruct. La elección del base responde a la necesidad de conservar priors de código y una capacidad sólida de tool calling, habilidades que, según el autor, no pueden adquirirse de forma barata mediante post-entrenamiento. No se realiza preentrenamiento: se hereda el del modelo base, justificado por el coste estimado de preentrenar un 7B a calidad competitiva (unas 17 GPU-años en hardware de la clase objetivo). El autor descarta explícitamente una arquitectura MoE por tres motivos: la memoria residente de los expertos no cabría en 8 GB con expertos de tamaño razonable, la exposición de datos por experto se reduciría a un 2,5% en una configuración de 80 expertos con top-2, y el enrutamiento añadiría latencia en bucles agénticos con decenas de llamadas secuenciales.

La innovación principal no está en los pesos sino en la arquitectura de conocimiento: el corpus financiero se divide en chunks de 512 tokens con 64 de solapamiento, se indexa en un índice vectorial y otro de texto completo en disco, y se consulta mediante una herramienta `search_knowledge(query, k)` dentro del bucle del agente. El despliegue previsto usa `llama-server` con atención Flash (`-fa on`), caché KV cuantizada en q8_0 y todas las capas en GPU (`-ngl 999`). No se dispone de información sobre la composición del dataset de ajuste fino, el número de tokens de entrenamiento ni si se emplearon RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento sobre documentación financiera recuperada.
- Tool calling y function calling, heredados de Qwen2.5-Coder-7B-Instruct.
- Ejecución en bucles agénticos multi-paso: lectura de ficheros, edición de código y ejecución de comandos de shell a través de harnesses como OpenCode.
- RAG sobre corpus local de varios terabytes mediante la herramienta `search_knowledge`.
- Generación y edición de código, útil para tareas de análisis reproducible y automatización de pipelines financieros.
- Operación offline, sin conexión de red en tiempo de inferencia.
- Capacidades multilingües limitadas al inglés según la model card.

## Casos de uso

- Análisis de estados financieros de la SEC: el agente recupera los chunks relevantes del corpus EDGAR mediante `search_knowledge` y el modelo razona sobre ellos para responder preguntas sobre cifras y partidas concretas, con la ventaja de que el índice no compite por VRAM con el modelo.
- Asistente de investigación financiera privado: un analista consulta documentos internos y públicos en una máquina mini-ITX sin que los datos salgan del equipo, lo que encaja en entornos con requisitos de confidencialidad.
- Automatización de extracción y comparación de datos entre presentaciones: el modelo puede orquestar llamadas a herramientas para localizar, filtrar y contrastar cifras de distintos ejercicios fiscales dentro del bucle agéntico.
- Generación de código para pipelines de datos financieros: gracias a los priors de Qwen2.5-Coder, puede escribir y editar scripts de extracción y transformación dentro de un harness agéntico que ejecuta y valida el código.
- Despliegue en estaciones de trabajo de bajo consumo: con Q4_K_M (3,5 GB) y 32k de contexto cabe en una GPU de 8 GB, lo que permite montar un asistente financiero permanente en un equipo de escritorio silencioso y de bajo consumo.
- Evaluación reproducible de decisiones de retrieval: el modelo se evalúa contra Dragon-Finance-Eval (2.080 pares pregunta/respuesta derivados de datos de estados financieros SEC), lo que permite usar el sistema para medir y ajustar la calidad de la recuperación en un entorno controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card referencia el conjunto de evaluación Dragon-Finance-Eval (2.080 ítems), pero la evaluación figura como pendiente en la hoja de ruta. El único dato de rendimiento declarado es un throughput aproximado de 60 tokens/s en Q4 con contexto de 32k sobre la GPU de referencia de 8 GB (~448 GB/s de ancho de banda).

## Requisitos de hardware

- VRAM estimada: 3,5 GB para los pesos en Q4_K_M; el resto hasta 8 GB se destina a contexto (32k) y caché KV cuantizada en q8_0.
- GPU objetivo: tarjeta de 8 GB de VRAM de generación actual, con ancho de banda de aproximadamente 448 GB/s y consumo de unos 145 W.
- Cabe en GPU de consumo: sí, el diseño está pensado para una GPU de 8 GB de gama mainstream, no para tarjetas de estación de trabajo.
- RAM del sistema: 32-96 GB, ya que el índice de conocimiento reside en RAM y CPU, no en VRAM.
- Almacenamiento: 8 TB NVMe (aproximadamente 1 TB para sistema operativo y 7 TB para el corpus local).
- Despliegue: `llama-server` de llama.cpp con `-c 32768 -fa on -ctk q8_0 -ctv q8_0 -ngl 999 --jinja`; compatible con endpoints OpenAI (`/v1`) y con harnesses como OpenCode.
- Throughput estimado: ~60 tokens/s en Q4 con 32k de contexto en el hardware de referencia.
- Formato de despliegue alternativo: transformers con safetensors (pesos no publicados aún).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Dragon-Finance-7B | 7B denso | 32k (despliegue) | Apache 2.0 | Agente financiero local-first con RAG | Pesos pendientes de publicación |
| Qwen2.5-Coder-7B-Instruct | 7B denso | 32k (modelo base) | Apache 2.0 | Código y tool calling general | Disponible en Hugging Face |
| Qwen3-MoE (referencia citada) | no disponible | no disponible | no disponible | MoE generalista | Disponible |
| DeepSeek-V3 (referencia citada) | no disponible | no disponible | no disponible | MoE de gran escala | Disponible |

La comparación directa con alternativas financieras de 7B no está disponible en la información proporcionada. Los modelos MoE citados aparecen únicamente como referencia de tamaños de experto en la justificación arquitectónica del autor.

## Limitaciones y advertencias

- No es una fuente de verdad: el modelo razona sobre texto recuperado y no contiene el corpus; las cifras financieras deben verificarse contra los filings primarios.
- No constituye asesoramiento de inversión.
- Techo de 7B: no igualará a modelos frontera en razonamiento financiero abierto; su diseño apunta a tareas financieras fundamentadas en recuperación sobre hardware pequeño.
- Local no equivale a barato a alto volumen: está pensado para uso personal y de equipos pequeños; un servicio de producción de alto throughput requeriría un modelo mayor y hardware superior.
- Hereda los sesgos del modelo base y la composición del Dragon-Finance-Corpus (91% SEC EDGAR, concentrado por emisor).
- Idiomas: solo inglés según la model card.
- Estado de desarrollo: los adaptadores y los pesos cuantizados no están publicados, por lo que no es desplegable en el momento de redactar esta ficha.
- Riesgo de alucinación inherente a los modelos de 7B, especialmente si el retrieval devuelve contexto irrelevante o incompleto.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse el cumplimiento de las condiciones del modelo base Qwen2.5-Coder-7B-Instruct.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dragonlimited/Dragon-Finance-7B
- Dataset de evaluación: https://huggingface.co/datasets/dragonlimited/Dragon-Finance-Eval
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Harness agéntico OpenCode: https://opencode.ai
