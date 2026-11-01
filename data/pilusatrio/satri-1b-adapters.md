# PILUSATRIO/satri-1b-adapters

## Resumen

SATRI-1B Adapters es una colección de adaptadores LoRA publicada por el usuario independiente PILUSATRIO (Pilus) sobre el modelo base Qwen/Qwen3-1.7B. No se trata de un modelo completo, sino de un archivo de adaptadores PEFT organizados en subcarpetas: un adaptador de control multi-tarea y cuatro adaptadores especialistas (idioma indonesio y cultura nusantara, razonamiento matemático y científico, programación Python/SQL y diseño web, y tool calling con integración RAG). El repositorio ocupa 0,2 GB, coherente con pesos LoRA de rango bajo sobre un transformer de 1,7 mil millones de parámetros.

La relevancia de esta publicación es limitada pero concreta: ofrece un ejemplo de especialización modular mediante LoRA sobre un modelo pequeño y con licencia permisiva (Apache 2.0), pensado para entornos con recursos escasos y para el ecosistema lingüístico indonesio. El autor mantiene además un merge completo del modelo en PILUSATRIO/satri-1b y una generación posterior de 4B en PILUSATRIO/satri-4.0, lo que sitúa a estos adaptadores como la primera iteración de una familia más amplia.

No hay información publicada sobre el volumen de datos de entrenamiento, la composición del dataset, los hiperparámetros de LoRA ni resultados de evaluación. El repositorio no registra descargas ni interacciones en el momento de la consulta, por lo que debe considerarse un artefacto experimental sin validación externa conocida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), adaptadores LoRA/PEFT sobre el modelo base |
| Parametros totales | 1,7 mil millones en el modelo base; parametros del adaptador no disponibles |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Qwen3-1.7B) |
| Tipos de cuantizacion | No disponible; al ser adaptadores PEFT, la cuantizacion depende del modelo base y del runtime |
| Idiomas soportados | Indonesio (id) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA), libreria peft |

## Arquitectura y entrenamiento

El artefacto es un conjunto de adaptadores LoRA (Low-Rank Adaptation) que se cargan sobre Qwen/Qwen3-1.7B, un transformer decoder-only de la familia Qwen3. Cada subcarpeta contiene un adaptador independiente entrenado con SFT (supervised fine-tuning) para una tarea concreta: `control/` para control multi-tarea, `spec_A/` para indonesio, historia y literatura nusantara con instrucciones por capas, `spec_B/` para razonamiento matemático, lógica y ciencia, `spec_C/` para Python, SQL y diseño web responsive, y `spec_D/` para tool calling mediante la etiqueta `<tool_call>` e integración con RAG. La modularidad permite cargar el adaptador adecuado según la consulta o combinarlos, aunque no se documenta ninguna estrategia de mezcla ni de enrutamiento.

No se especifican el número de tokens de entrenamiento, la composición del dataset, el rango y alpha de LoRA, la tasa de aprendizaje ni si se aplicaron técnicas de RLHF o DPO. Tampoco se describe ninguna innovación técnica más allá del propio esquema de especialización modular. El modelo base Qwen3-1.7B incorpora las características propias de la familia Qwen3 (incluido un modo de razonamiento), pero la model card no detalla cómo los adaptadores interactúan con ese modo.

## Capacidades

- Generación de texto en indonesio e inglés, con especial énfasis en registro cultural e histórico nusantara en el adaptador `spec_A`.
- Razonamiento matemático, lógico y científico mediante el adaptador `spec_B`.
- Generación de código Python y SQL, y diseño web responsive, con el adaptador `spec_C`.
- Tool calling y function calling a través de la etiqueta `<tool_call>`, con soporte declarado para integración RAG, en `spec_D`.
- Instrucciones por capas (multi-turn o jerárquicas) según la descripción del especialista A.
- Control multi-tarea mediante el adaptador `control/`, que actúa como punto de entrada general.
- No se documentan capacidades de visión, audio ni un modo de razonamiento explícito propio de los adaptadores.

## Casos de uso

- Asistente conversacional en indonesio: cargando `spec_A` sobre Qwen3-1.7B se obtiene un asistente especializado en historia y literatura del archipiélago, útil para editoriales, museos o medios que necesiten contenido cultural con terminología local.
- Tutor de matemáticas y ciencias en centros educativos indonesios: `spec_B` permite desplegar un tutor de refuerzo con bajo coste de inferencia en hardware modesto, ajustado a explicaciones paso a paso.
- Generación de código en pipelines internos: `spec_C` puede integrarse en un servicio de autocompletado para Python y SQL en equipos de desarrollo que trabajen con datos y APIs, con la ventaja de que el adaptador pesa muy poco y puede versionarse por separado del modelo base.
- Maquetación web asistida: el mismo `spec_C` sirve para generar HTML y CSS responsive en herramientas de prototipado rápido o generadores de landing pages.
- Agente con acceso a herramientas: `spec_D` habilita la construcción de agentes que emiten llamadas `<tool_call>` para consultar APIs, bases de datos o un índice vectorial en un flujo RAG, con un modelo de 1,7B que cabe en GPUs de consumo.
- Investigación sobre especialización modular: el repositorio sirve como referencia práctica para estudiar cómo se comportan adaptadores LoRA independientes sobre un mismo modelo base y cómo combinarlos o compararlos en experimentos académicos.
- Despliegue en entornos con recursos limitados: al ser adaptadores de 0,2 GB sobre un base de 1,7B, es viable servir múltiples especialistas intercambiando el adaptador en memoria en lugar de mantener varios modelos completos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El modelo base Qwen3-1.7B en precisión FP16 requiere aproximadamente 3,4 GB de VRAM solo para los pesos; en cuantización de 8 bits baja a unos 1,8 GB y en 4 bits a alrededor de 1 GB, a lo que hay que sumar la caché KV y el overhead del runtime.
- Los adaptadores LoRA añaden una huella mínima (el repositorio completo ocupa 0,2 GB), por lo que el factor limitante es siempre el modelo base.
- Cabe en GPUs de consumo: RTX 3060 de 12 GB, RTX 4060 Ti, RTX 4070, RTX 4090, e incluso en GPUs de 8 GB con cuantización de 4 u 8 bits.
- Para despliegue en servidor se recomienda A100 o H100 solo si se necesita alto throughput concurrente; para uso individual no son necesarias.
- Opciones de despliegue: vLLM y TGI admiten adaptadores LoRA de forma nativa y permiten servir varios adaptadores sobre un mismo base; llama.cpp y Ollama requieren fusionar el adaptador con el modelo base o convertir a GGUF, ya que el soporte de LoRA dinámico es más limitado. La librería peft con transformers es la vía directa para cargar los adaptadores.
- No se dispone de datos de latencia ni throughput medidos para estos adaptadores.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| SATRI-1B Adapters (este) | 1,7B base + LoRA | No disponible | Apache 2.0 | safetensors (PEFT) | Coleccion de 5 adaptadores especializados, idiomas id/en |
| Qwen/Qwen3-1.7B | 1,7B | No disponible en la informacion | Apache 2.0 | safetensors, GGUF | Modelo base sin especializar; cobertura multilingue amplia |
| PILUSATRIO/satri-1b | 1,7B | No disponible | Apache 2.0 (segun repositorio del autor) | No disponible | Merge completo de los adaptadores; misma familia |
| PILUSATRIO/satri-4.0 | Aproximadamente 4B (por el nombre) | No disponible | No disponible | No disponible | Generacion posterior del mismo autor; sin datos tecnicos publicados |

La comparación con alternativas de otros autores no puede establecerse con rigor porque no hay benchmarks publicados para este artefacto. Frente al modelo base, la diferencia es la especialización por tarea y el menor coste de almacenamiento por especialista; frente a modelos mayores, la limitación es la capacidad bruta del base de 1,7B.

## Limitaciones y advertencias

- No hay evaluación publicada: se desconoce la calidad real de cada especialista y si supera al modelo base en sus tareas objetivo.
- El repositorio no registra descargas ni interacciones, por lo que no existe validación por parte de la comunidad.
- Riesgo de alucinación inherente a un modelo de 1,7B, especialmente en tareas de historia y datos factuales del adaptador `spec_A`.
- Cobertura lingüística limitada a indonesio e inglés; el rendimiento en castellano no está documentado y previsiblemente será inferior.
- La longitud de contexto efectiva de los adaptadores no se especifica; debe asumirse la del modelo base, sin garantías de que el fine-tuning la preserve.
- Los adaptadores están entrenados por separado; no se documenta cómo combinarlos ni si el enrutamiento entre especialistas es fiable.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base Qwen3-1.7B antes de un uso comercial, ya que los términos del base condicionan el uso del adaptador.
- El soporte de tool calling depende de que el runtime respete el formato `<tool_call>`; no hay validación publicada de su robustez en producción.
- Proyecto individual sin gobernanza, mantenimiento garantizado ni documentación de sesgos; no recomendable como componente crítico sin una evaluación propia.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/PILUSATRIO/satri-1b-adapters
- Modelo merge de la misma generación: https://huggingface.co/PILUSATRIO/satri-1b
- Generación posterior 4B: https://huggingface.co/PILUSATRIO/satri-4.0
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
