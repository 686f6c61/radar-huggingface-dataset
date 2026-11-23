# DominuZ/PequenasEstorias-88M-Instruct

## Resumen

PequenasEstorias-88M-Instruct es un modelo de lenguaje de 88 millones de parámetros desarrollado por DominuZ, especializado en la generación de cuentos infantiles cortos en portugués de Brasil. Se trata de un ajuste fino (fine-tuning) del modelo base PequenasEstorias-88M, que a su vez deriva de la familia TinyStories y emplea una arquitectura de tipo Qwen3. El objetivo del ajuste es transformar un modelo que solo continuaba texto en un modelo capaz de responder a peticiones concretas ("escribe un cuento sobre...") generando narraciones completas de principio a fin.

El modelo resuelve un problema muy acotado: la generación de historias infantiles coherentes en pt-BR con un coste computacional mínimo. Con apenas 88 millones de parámetros y un peso cuantizado Q4_K_M de 54 MB, puede ejecutarse en cualquier ordenador sin GPU, lo que lo convierte en una pieza interesante para experimentación con modelos de lenguaje pequeños (SLM), docencia y despliegues en entornos con recursos muy limitados.

Su relevancia actual radica en su carácter demostrativo: muestra hasta qué punto un ajuste fino ligero (67 minutos en una GPU doméstica sobre 300.000 pares de instrucción y cuento) puede dotar de comportamiento instruct a un modelo minúsculo dentro de un dominio estrecho. No obstante, su alcance es deliberadamente limitado: un único idioma, un único género textual y sin datos publicados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3, segun tags del autor) |
| Parametros totales | 88.101.120 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (54 MB); otras cuantizaciones no disponibles |
| Idiomas soportados | Portugues (pt, pt-BR) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (libreria llama.cpp); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 88 millones de parámetros etiquetado por el autor como perteneciente a la familia Qwen3, si bien no se detallan en la información disponible el número de capas, dimensiones ocultas, cabezas de atención ni la longitud de contexto nativa. El modelo base, PequenasEstorias-88M, fue entrenado sobre el dataset TinyStories-pt-BR, una adaptación al portugués del corpus TinyStories (arxiv:2305.07759), orientado a producir narrativas simples y gramaticalmente correctas con vocabulario reducido.

El ajuste fino instruct se realizó sobre 300.000 pares de petición y cuento del dataset TinyStoriesInstruct-pt-BR, con un coste de entrenamiento declarado de 67 minutos en una GPU doméstica. No se especifican en la información disponible la composición exacta del dataset, la presencia de RLHF/DPO, ni detalles sobre la estrategia de alineación; por las características del proyecto, cabe esperar un ajuste supervisado clásico (SFT), aunque este extremo no está confirmado por el autor.

## Capacidades

- Generación de cuentos infantiles completos en portugués de Brasil a partir de una petición en lenguaje natural.
- Respuesta a instrucciones del tipo "conta uma história sobre...", "escreva uma história sobre...", "invente uma história sobre...".
- Generación de narrativa con estructura típica de cuento: inicio ("Era uma vez..."), desarrollo y cierre con moraleja o desenlace.
- Continuación de texto coherente en el dominio de historias infantiles (heredado del modelo base).
- Capacidad conversacional básica limitada al dominio de narración (tag `conversational`).
- No se ha documentado soporte de tool calling, function calling, agentes, multi-step reasoning, visión, audio ni modo "thinking".
- Capacidades multilingües: únicamente portugués; no se declara soporte de otros idiomas.

## Casos de uso

- Generación de cuentos personalizados para niños: el modelo acepta una petición temática ("una princesa que pierde la corona en el lago") y devuelve un cuento cerrado de pocos párrafos, adecuado para lectura infantil o para acompañar ilustraciones.
- Aplicaciones educativas offline: al caber en 54 MB y ejecutarse sin GPU, puede integrarse en aplicaciones de escritorio o dispositivos de bajos recursos para generar lecturas infantiles en pt-BR sin conexión.
- Prototipado de pipelines de generación de contenido: sirve como banco de pruebas barato para validar plantillas de prompting, formateo de instrucciones y evaluación de calidad narrativa antes de escalar a modelos mayores.
- Docencia e investigación en SLM: permite estudiar el efecto del ajuste fino instruct en modelos de menos de 100M de parámetros con un coste de entrenamiento de minutos y un dataset público.
- Generación de material para aprendizaje de portugués: cuentos cortos con vocabulario simple y estructura repetitiva, útiles como lecturas graduadas para estudiantes de pt-BR.
- Demostraciones y pruebas de concepto en llama.cpp: al distribuirse en GGUF, se integra fácilmente en demos locales de generación de texto con llama.cpp u Ollama para mostrar inferencia en CPU.
- Generación de variaciones temáticas para juegos o cuentacuentos interactivos: el modelo produce cuentos breves sobre animales, robots, dinosaurios y otros temas solicitados, aprovechables como contenido dinámico en aplicaciones infantiles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye métricas cuantitativas (perplejidad, MMLU, evaluaciones humanas) en la model card, y los ejemplos mostrados son cualitativos.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en todas las cuantizaciones publicadas; el archivo Q4_K_M ocupa 54 MB, por lo que la inferencia cabe holgadamente en memoria RAM/VRAM de cualquier equipo.
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU. Cualquier GPU consumer (integrada o dedicada) es más que suficiente.
- Cabe en cualquier GPU consumer, incluidas GTX 1050, RTX 3050, RTX 4090 o GPUs integradas Intel/AMD.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama (previa importación del GGUF), y cualquier runtime compatible con GGUF. El tag `endpoints_compatible` sugiere compatibilidad con endpoints de Hugging Face.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo, se espera generación en tiempo real o superior en CPU moderna, aunque no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| PequenasEstorias-88M-Instruct | 88M | no disponible | pt | Apache-2.0 | GGUF | Ajuste instruct sobre TinyStories-pt-BR |
| PequenasEstorias-88M (base) | 88M | no disponible | pt | no disponible | safetensors/GGUF (no confirmado) | Solo continuación de texto, sin instruct |
| TinyStories original (Microsoft) | ~1M-33M | no disponible | en | no disponible | varios | Generación de cuentos en inglés, referencia del enfoque |
| Modelos Qwen3 pequeños (p. ej. Qwen3-0.6B) | 600M | no disponible | multilingue | Apache-2.0 | safetensors/GGUF | Mucho mayor tamaño y capacidades generales; no especializado en cuentos pt-BR |

La comparación directa con alternativas es limitada porque no existen muchos modelos públicos de menos de 100M de parámetros especializados en cuentos infantiles en portugués. El modelo base y el original TinyStories en inglés son las referencias más cercanas; los Qwen3 pequeños comparten familia arquitectónica pero no dominio ni escala.

## Limitaciones y advertencias

- Dominio extremadamente estrecho: el modelo está entrenado únicamente para generar cuentos infantiles; fuera de ese ámbito producirá respuestas incoherentes o irrelevantes.
- Idioma único: solo portugués (pt-BR); no se ha validado su comportamiento en otras variantes del portugués ni en otros idiomas.
- Riesgo de alucinación y de incoherencia narrativa: con 88M de parámetros, es probable que aparezcan repeticiones, contradicciones internas o finales abruptos, especialmente en peticiones complejas o fuera del patrón de entrenamiento.
- Longitud de contexto no documentada: se desconoce la ventana máxima soportada, lo que dificulta planificar prompts largos o conversaciones multi-turno.
- Sesgos: al derivar de TinyStories, el vocabulario y los roles de género o familiares reflejan los del corpus original; no se ha realizado una evaluación de sesgos documentada.
- Licencia Apache-2.0: permite uso comercial, pero el autor no ofrece garantías sobre calidad ni idoneidad para producción; conviene evaluar el modelo en el caso de uso concreto antes de desplegarlo.
- Sin benchmarks publicados: no hay métricas objetivas que permitan comparar su calidad con alternativas; la evaluación debe hacerse de forma cualitativa.
- Repositorio con 0 descargas y 1 like en el momento de la consulta: proyecto muy reciente y sin validación comunitaria.
- No apto para tareas de razonamiento, código, matemáticas, tool calling ni agentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DominuZ/PequenasEstorias-88M-Instruct
- Modelo base: https://huggingface.co/DominuZ/PequenasEstorias-88M
- Dataset de instrucciones: https://huggingface.co/datasets/DominuZ/TinyStoriesInstruct-pt-BR
- Dataset base: https://huggingface.co/datasets/DominuZ/TinyStories-pt-BR
- Paper TinyStories: https://arxiv.org/abs/2305.07759
- llama.cpp: https://github.com/ggml-org/llama.cpp
