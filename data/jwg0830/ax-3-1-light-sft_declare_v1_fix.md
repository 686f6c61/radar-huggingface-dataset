# jwg0830/AX-3.1-Light-sft_declare_v1_fix

## Resumen

AX-3.1-Light-sft_declare_v1_fix es un modelo de lenguaje de 7.264 millones de parámetros desarrollado por el usuario jwg0830, construido mediante ajuste fino con LoRA sobre el modelo base skt/A.X-3.1-Light de SK Telecom. Se trata de un modelo experimental orientado exclusivamente al coreano (ko) cuyo proposito es validar una hipotesis local: la correlacion entre la "tasa de declaracion de respuestas" en prompts libres y la puntuacion real en el benchmark K-AI, con una correlacion de Spearman observada de +0.90 en una muestra de 5 modelos.

El modelo fue entrenado con 5.801 muestras de datos procedentes de cinco datasets de AIHub (coreano), reestructurando los ejemplos para que el modelo responda de forma natural en formato declarativo del tipo "La respuesta es X." sin necesidad de instrucciones explicitas en el prompt. La version actual (fix) corrige un problema de pesos NaN presentes en la anterior subida (AX-3.1-Light-sft_declare_v1) causado por un defecto en el proceso de fusion de los adaptadores LoRA. Este repositorio contiene el artefacto corregido y funcional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (transformer decoder-only) |
| Parametros totales | 7.264.800.768 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizacion publicada) |
| Idiomas soportados | coreano (ko) |
| Licencia | other (no especificada) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base model skt/A.X-3.1-Light, un transformer decoder-only de tipo Llama con 7.264 millones de parametros. No se dispone de informacion detallada sobre la configuracion interna (numero de capas, dimensiones ocultas, atencion, etc.) en la documentacion del repositorio.

El entrenamiento se realizo mediante LoRA (Low-Rank Adaptation) con los siguientes hiperparametros: r=16, alpha=32, aplicado a las proyecciones q, k, v, o, gate, up y down. La tasa de aprendizaje fue de 5e-5 y se entreno durante 1 epoca. El dataset de entrenamiento consta de 5.801 ejemplos procedentes de cinco datasets de AIHub coreanos: preguntas tipo texto de libros de texto de lengua coreana, datos de conocimiento medico especializado, lectura mecanica de documentos financieros y legales, lectura mecanica de documentos administrativos, y datos de razonamiento basado en relaciones causales (upcycling).

La innovacion principal no reside en la arquitectura, sino en la estrategia de datos: se reestructuraron los ejemplos de entrenamiento para que el modelo respondiera en formato declarativo natural ("La respuesta es X.") sin depender de instrucciones en el prompt, con el objetivo de aumentar la tasa de declaracion de respuestas en entornos de prompt libre.

## Capacidades

- Generacion de texto en coreano: el modelo genera respuestas en formato declarativo, indicando explicitamente cual es la respuesta correcta.
- Razonamiento sobre datos de dominio especifico: entrenado con datos de lengua coreana, medicina, finanzas, derecho y administracion publica.
- Razonamiento causal: incluye datos de razonamiento basado en relaciones causales (upcycling) para mejorar la inferencia logica.
- Respuesta sin instrucciones: capaz de responder en formato declarativo incluso sin prompts con instrucciones explicitas, gracias a la reestructuracion de los datos de entrenamiento.
- Soporte de tool calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingues: no, el modelo esta enfocado exclusivamente al coreano.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Evaluacion de hipotesis de investigacion: el modelo sirve como herramienta experimental para verificar la correlacion entre la tasa de declaracion de respuestas y la puntuacion en el benchmark K-AI, permitiendo a investigadores replicar y validar los hallazgos del autor.
- Generacion de respuestas declarativas en coreano: adecuado para sistemas que requieren respuestas directas y afirmativas en coreano, como asistentes de preguntas frecuentes o sistemas de consulta de documentacion.
- Lectura mecanica de documentos administrativos: gracias a los datos de entrenamiento sobre documentos administrativos, el modelo puede extraer y declarar informacion relevante de textos burocraticos coreanos.
- Consulta de conocimiento medico especializado: el modelo puede responder preguntas sobre conocimiento medico en coreano, aunque con las limitaciones propias de un modelo de 7B entrenado con pocos datos especificos.
- Razonamiento sobre documentos financieros y legales: puede procesar y responder preguntas sobre textos financieros y legales en coreano, facilitando tareas de analisis documental.
- Experimentos de ajuste fino con LoRA: el repositorio sirve como referencia para desarrolladores que quieran replicar el proceso de LoRA SFT con fusion de pesos, incluyendo la correccion de artefactos NaN en el proceso de merge.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor menciona una correlacion de Spearman de +0.90 (n=5) entre la tasa de declaracion de respuestas en prompts libres y la puntuacion real en el benchmark K-AI, pero no proporciona puntuaciones concretas del modelo en dicho benchmark.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 7.264 millones de parametros en precision fp16, se estima un consumo de aproximadamente 14-15 GB de VRAM. Con cuantizacion de 8 bits, unos 8 GB; con 4 bits, unos 4-5 GB (valores estimados, no publicados por el autor).
- GPU recomendadas: para inferencia sin cuantizar se recomienda una GPU con al menos 16 GB de VRAM (RTX 4090, A100 40GB, etc.). Con cuantizacion, podria ejecutarse en GPUs consumer de 8 GB (RTX 3070/4060, etc.).
- Compatibilidad con consumer GPUs: si, con cuantizacion (GGUF o AWQ) es viable en GPUs de gama media-alta.
- Opciones de despliegue: al ser un modelo transformers con pesos en safetensors, es compatible con vLLM, Text Generation Inference (TGI), llama.cpp (con conversion a GGUF) y Ollama (con conversion previa).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Notas |
|---|---|---|---|---|---|
| jwg0830/AX-3.1-Light-sft_declare_v1_fix | 7.26B | no disponible | ko | other | LoRA SFT sobre skt/A.X-3.1-Light, experimental |
| skt/A.X-3.1-Light | 7.26B | no disponible | ko | other | Modelo base de SK Telecom, sin ajuste especifico para declaracion |
| jwg0830/AX-3.1-Light-sft_declare_v1 | 7.26B | no disponible | ko | other | Version anterior con pesos NaN, no funcional |

No se dispone de informacion suficiente para comparar con otros modelos coreanos de tamano similar (como Polyglot-Ko, EEVE, etc.) en terminos de rendimiento, ya que no hay benchmarks publicados.

## Limitaciones y advertencias

- Modelo experimental: creado unicamente para validar una hipotesis de investigacion, no para uso en produccion.
- Datos de entrenamiento limitados: solo 5.801 muestras, lo que limita la generalizacion del modelo fuera de los dominios especificos de los datasets.
- Idioma limitado: exclusivamente coreano, con capacidades multilingues nulas.
- Licencia no especificada: la licencia "other" no define claramente los terminos de uso comercial o redistribucion. Se recomienda contactar con el autor antes de cualquier uso en produccion.
- Riesgo de alucinacion: como cualquier modelo de 7B entrenado con pocos datos, existe riesgo de generar respuestas incorrectas o inventadas, especialmente fuera de los dominios de entrenamiento.
- Contexto limitado: no se ha publicado la longitud de contexto, lo que dificulta evaluar su idoneidad para tareas que requieran ventanas largas.
- Sesgos potenciales: los datos de AIHub pueden contener sesgos propios de los dominios (medico, legal, administrativo) y del contexto cultural coreano.
- Sin benchmarks publicados: no hay evidencia objetiva del rendimiento del modelo en tareas estandarizadas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/jwg0830/AX-3.1-Light-sft_declare_v1_fix
- Version anterior con errores: https://huggingface.co/jwg0830/AX-3.1-Light-sft_declare_v1
- Pagina de despliegue en FriendliAI: https://friendli.ai/models/jwg0830/AX-3.1-Light-sft_declare_v1
- Dataset: datos de texto de libros de texto de lengua coreana: https://www.aihub.or.kr/aihubdata/data/view.do?currMenu=115&topMenu=100&aihubDataSe=realm&dataSetSn=71857
- Dataset: conocimiento medico especializado: https://www.aihub.or.kr/aihubdata/data/view.do?currMenu=115&topMenu=100&aihubDataSe=realm&dataSetSn=71874
- Dataset: lectura mecanica de documentos financieros y legales: https://www.aihub.or.kr/aihubdata/data/view.do?currMenu=115&topMenu=100&aihubDataSe=realm&dataSetSn=71610
- Dataset: lectura mecanica de documentos administrativos: https://www.aihub.or.kr/aihubdata/data/view.do?currMenu=115&topMenu=100&aihubDataSe=realm&dataSetSn=569
- Dataset: razonamiento causal (upcycling): https://www.aihub.or.kr/aihubdata/data/view.do?currMenu=115&topMenu=100&aihubDataSe=realm&dataSetSn=71949
