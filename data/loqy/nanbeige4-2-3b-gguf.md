# loqy/Nanbeige4.2-3B-GGUF

## Resumen

Nanbeige4.2-3B es un modelo de lenguaje compacto desarrollado por el equipo Nanbeige, diseñado para maximizar las capacidades agénticas (uso de herramientas, razonamiento multi-paso) manteniendo un rendimiento competitivo en tareas de razonamiento, matemáticas y código. Se preentrena desde cero sobre 28 billones de tokens utilizando una arquitectura Looped Transformer que reutiliza la pila de capas, lo que permite un modelo de 3B parámetros no-embedding con un comportamiento superior al esperado para su tamaño. El modelo está disponible bajo licencia Apache-2.0 y soporta inglés y chino.

Este repositorio concreto (`loqy/Nanbeige4.2-3B-GGUF`) ofrece una conversión GGUF en cuantización Q4_K_M que preserva fielmente la tabla de merges BPE del tokenizer original, algo que otras conversiones publicadas no hacen. Esto garantiza que la tokenización coincida exactamente con la del modelo entrenado, evitando divergencias que pueden afectar a la calidad de la generación en textos poco comunes o con espacios inusuales. El archivo pesa aproximadamente 2,58 GB y es compatible con llama.cpp y sus derivados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Looped Transformer (reutilizacion de capas) |
| Parametros totales | 4.169.800.704 (3B no-embedding segun el paper) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el paper menciona "long-context" sin valor concreto) |
| Tipos de cuantizacion | Q4_K_M (en este repo); otras conversiones pueden ofrecer mas |
| Idiomas soportados | Ingles, chino |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (Q4_K_M) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura Looped Transformer, que reutiliza la misma pila de capas varias veces a lo largo de la secuencia. Esto permite aumentar la profundidad efectiva sin incrementar el numero de parametros, mejorando la capacidad de razonamiento y de manejo de contextos largos. Se preentrena desde cero sobre 28 billones de tokens, con un enfoque especifico en tareas agénticas: uso de herramientas, planificacion multi-paso y razonamiento complejo. No se especifica en la informacion disponible si se aplicaron tecnicas de RLHF o DPO; el paper menciona que el modelo esta optimizado para agentes y tool-use, pero no detalla el proceso de alineacion.

La conversion GGUF de este repositorio utiliza un convertidor personalizado que exporta el vocabulario BPE completo con su tabla de merges, declarando el tokenizer como `gemma4` en llama.cpp. Esto evita la aproximacion unigram que otras conversiones usan, logrando una fidelidad del 100% en la tokenizacion respecto al modelo original.

## Capacidades

- Generacion de texto y razonamiento: el modelo muestra competencia en tareas de matemáticas, codigo y ciencia, segun el paper.
- Soporte de tool calling / function calling: disenado para agentes, puede invocar herramientas externas y procesar sus resultados.
- Capacidades agénticas: planificacion multi-paso, uso de herramientas y ejecucion de tareas complejas en entornos de agente.
- Razonamiento en codigo: genera y depura codigo, con buen rendimiento en tareas de programacion.
- Multilingue: soporta ingles y chino, con capacidad de alternar entre ambos.
- Modo de razonamiento: el paper sugiere que el modelo puede operar en modo "thinking" para tareas que requieren reflexion, aunque no se detalla un modo explicito.

## Casos de uso

- Agentes de codigo: el modelo puede integrarse en pipelines de desarrollo como asistente de programacion, generando funciones, explicando fragmentos o corrigiendo errores. Su capacidad de tool calling permite conectarlo a APIs de repositorios o ejecutores de pruebas.
- Automatizacion de oficina: puede procesar documentos, generar resumenes, redactar correos o rellenar plantillas, aprovechando su entrenamiento en tareas de oficina.
- Atencion al cliente bilingue: con soporte para ingles y chino, puede gestionar conversaciones multi-turno en un chat de soporte, derivando a herramientas externas cuando es necesario.
- Razonamiento matematico: util para tutoria o resolucion de problemas en entornos educativos, con explicaciones paso a paso.
- Generacion de codigo en produccion: su licencia Apache-2.0 permite uso comercial sin restricciones, y su tamano compacto facilita el despliegue en entornos con recursos limitados.
- Asistentes personales locales: al caber en hardware de consumo, puede ejecutarse en portatiles o mini-PCs para tareas de automatizacion del hogar o gestion de agenda.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El paper asociado (arXiv:2607.22083) presenta metricas, pero no se incluyen en los datos proporcionados. Se recomienda consultar el articulo para obtener cifras concretas de MMLU, HumanEval, GSM8K u otras pruebas.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q4_K_M pesa 2,58 GB, por lo que con overhead de ejecucion se necesitan aproximadamente 3-4 GB de VRAM. Cabe en GPUs con 4 GB o mas, como RTX 3050, RTX 4060, o incluso en iGPUs con suficiente memoria compartida.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM. Para mayor velocidad, una RTX 3060 o superior es suficiente.
- Ejecucion en CPU: con 8 GB de RAM es viable, aunque la velocidad sera menor. LocalClaw indica que es adecuado para portatiles con 8 GB de RAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, o cualquier runtime compatible con GGUF. Tambien se puede usar el modelo original en safetensors con vLLM o TGI si se prefiere.
- Latencia y throughput: no se proporcionan datos concretos, pero para un modelo de 3B en Q4_K_M, se esperan decenas de tokens por segundo en una GPU consumer moderna.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Nanbeige4.2-3B (este) | 3B no-embedding | No disponible | Apache-2.0 | GGUF / safetensors | Enfoque agéntico, Looped Transformer |
| Qwen2.5-3B | 3B | 32K | Apache-2.0 | safetensors / GGUF | Modelo generalista, buen rendimiento en multilingue |
| Llama-3.2-3B | 3B | 128K | Llama 3.2 | safetensors / GGUF | Modelo de Meta, fuerte en razonamiento y chat |

No se dispone de datos de benchmarks comparativos en la informacion proporcionada, por lo que la comparacion se limita a caracteristicas generales. Nanbeige4.2-3B se distingue por su arquitectura Looped Transformer y su enfoque especifico en tareas agénticas, mientras que Qwen y Llama son modelos mas generalistas.

## Limitaciones y advertencias

- Limitacion del tokenizer en GGUF: aunque este repo corrige la tabla de merges, llama.cpp no antepone el espacio inicial (U+2581) al primer token de cada prompt. Esto provoca una divergencia de un token por peticion, que puede evitarse anadiendo manualmente un espacio al inicio.
- Sesgos y alucinaciones: al ser un modelo compacto, puede generar respuestas incorrectas o inventadas en dominios especializados. Se recomienda validar las salidas en aplicaciones criticas.
- Contexto limitado: aunque se menciona "long-context", no se especifica el valor exacto; es probable que sea inferior a modelos como Llama-3.2-3B (128K).
- Idiomas: solo ingles y chino; no soporta otros idiomas de forma nativa.
- Uso comercial: la licencia Apache-2.0 permite uso comercial sin restricciones, pero se debe mantener el aviso de copyright y la atribucion.
- Dependencia de la conversion: la calidad de la generacion depende de la fidelidad del tokenizer; este repo la garantiza, pero otras conversiones pueden presentar divergencias.

## Enlaces

- Repositorio GGUF: https://huggingface.co/loqy/Nanbeige4.2-3B-GGUF
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.2-3B
- Paper: https://arxiv.org/abs/2607.22083
- Version HTML del paper: https://arxiv.org/html/2607.22083v1
- Otras conversiones: https://huggingface.co/owao/Nanbeige4.2-3B-GGUF y https://huggingface.co/bartowski/Nanbeige_Nanbeige4.2-3B-GGUF
