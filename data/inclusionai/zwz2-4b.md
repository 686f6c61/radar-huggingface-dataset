# inclusionAI/ZwZ2-4B

## Resumen

ZwZ2-4B es un modelo multimodal (visión-lenguaje) desarrollado por inclusionAI, perteneciente a la familia **Zooming-without-Zooming v2 (ZwZ2)**. Se trata de un ajuste por aprendizaje por refuerzo (GRPO) del modelo base Qwen3.5-4B, con aproximadamente 4.540 millones de parámetros según los pesos publicados en safetensors. Su objetivo es resolver un problema conocido en los modelos VLM: la dificultad para conectar evidencia visual entre distintas regiones de una imagen sin recurrir a herramientas de zoom o recorte durante la inferencia.

La innovación central es el método **EvidenceConnect**, que genera preguntas verificadas de múltiples regiones a partir de imágenes de SA-1B, usando vistas recortadas "privilegiadas" solo durante la construcción de datos, nunca en inferencia. El modelo se entrena exclusivamente con GRPO (sin fase adicional de SFT) sobre unas 20.000 muestras, y mejora a su modelo base en los 25 benchmarks evaluados, pasando de 49,41 a 54,79 puntos de precisión media (+5,38). Es relevante para desarrolladores que buscan un VLM compacto, entrenable y desplegable en hardware moderado, con capacidades reforzadas de percepción fina, razonamiento espacial y comprensión de contexto largo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal basado en Qwen3.5 (clase Qwen3_5ForConditionalGeneration) |
| Parametros totales | 4.539.265.536 (~4,54 B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16; ejemplo oficial usa `dtype=torch.bfloat16`) |
| Idiomas soportados | Ingles (en) |
| Licencia | no disponible en la model card; remite a la licencia de los pesos y a la del modelo base Qwen3.5-4B |
| Formato de pesos | safetensors (9,1 GB en el repositorio) |

## Arquitectura y entrenamiento

ZwZ2-4B parte de Qwen3.5-4B y se entrena con **GRPO** (Group Relative Policy Optimization), una técnica de aprendizaje por refuerzo, sin etapa adicional de fine-tuning supervisado. El pipeline de datos, denominado **EvidenceConnect**, construye preguntas verificadas de múltiples regiones: agrupa entre 3 y 7 regiones relacionadas de imágenes de SA-1B, genera preguntas utilizando vistas recortadas privilegiadas, valida las respuestas mediante acuerdo entre modelos y pruebas de eliminación de región (drop-one), y convierte las preguntas verificadas en tareas de cuatro opciones.

Un detalle técnico importante: la política (el modelo durante el entrenamiento) ve siempre la imagen completa con contornos de región coloreados; los recortes privilegiados se usan únicamente para construir los datos. Esto permite que en inferencia no se necesiten herramientas de zoom, recorte ni pipelines de agentes visuales. El conjunto de entrenamiento, **ZwZ2-RL-VQA**, contiene aproximadamente 20.000 ejemplos y está publicado en HuggingFace. La familia incluye también las variantes ZwZ2-9B (base Qwen3.5-9B) y ZwZ2-27B (base Qwen3.6-27B).

## Capacidades

- Comprensión imagen-texto (pipeline `image-text-to-text`) con descripción y análisis de imágenes completas.
- Conexión de evidencia visual entre regiones: comparación, agregación, emparejamiento y razonamiento multi-paso sobre regiones de una misma imagen.
- Percepción de grano fino sin herramientas de zoom ni recortes en inferencia.
- Razonamiento espacial y comprensión de contexto largo visual (según los dominios de evaluación: V-RAG, Image MM-NIAH, VH-Multi).
- Capacidades como agente multimodal (dominio "multimodal agents" en la evaluación).
- Modo de generación no-thinking (`enable_thinking=False` en el ejemplo oficial), con plantilla de chat que solicita respuestas finales entre etiquetas `<answer>...</answer>`.
- Compatible con la librería Transformers (versión 5.13.1 en el ejemplo oficial).

## Casos de uso

- **RAG visual sobre documentos e imágenes largas**: gracias a su entrenamiento en tareas tipo V-RAG e Image MM-NIAH (aguja en un pajar multimodal), puede localizar y conectar información dispersa en imágenes extensas sin necesidad de recortar o hacer zoom programáticamente.
- **Verificación de detalles en imágenes de alta resolución**: para flujos que requieren comprobar si un elemento aparece en una región concreta (inspección visual asistida), el modelo razona sobre regiones marcadas sin pipeline de agentes.
- **Razonamiento espacial y comparación entre regiones**: tareas del tipo "¿qué objeto está entre A y B?" o "¿qué regiones comparten esta característica?", donde su entrenamiento con preguntas multi-región verificadas aporta ventaja sobre el modelo base.
- **Contado y análisis en agentes multimodales**: como componente de visión en agentes que procesan capturas de pantalla o escenas, mejorando la percepción fina respecto a Qwen3.5-4B sin coste adicional de inferencia.
- **Despliegue en hardware limitado**: con ~4,5 B de parámetros y 9,1 GB de pesos en bf16, es adecuado para GPUs de consumo, lo que lo hace viable para prototipado local y aplicaciones on-premise.
- **Investigación en RL multimodal**: el dataset ZwZ2-RL-VQA y el método GRPO sin SFT previo son reproducibles y sirven como base para experimentos de entrenamiento con refuerzo en VLMs.
- **Generación de descripciones de imágenes**: soporta el caso de uso estándar de descripción de imágenes mediante la plantilla de chat incluida.

## Benchmarks y rendimiento

Según la model card, el modelo se evaluó en **25 benchmarks de seis dominios**, mejorando al modelo base en todos ellos. La precisión global pasa de 49,41 (Qwen3.5-4B) a 54,79 (+5,38 puntos). Los dominios cubiertos incluyen percepción de grano fino, razonamiento espacial, comprensión de contexto largo, agentes multimodales y razonamiento visual general. MMLongBench* usa el núcleo visual (V-RAG, Image MM-NIAH y VH-Multi, 25 tareas sin Counting). Los resultados completos están disponibles como imagen en el repositorio; no se publican tablas numéricas por benchmark en el texto de la model card, por lo que no se pueden listar aquí sin inventar datos.

| Métrica | Qwen3.5-4B (base) | ZwZ2-4B |
|---|---|---|
| Precisión media (25 benchmarks, 6 dominios) | 49,41 % | 54,79 % |

No se han publicado resultados de benchmarks individuales (MMLU, HumanEval, GSM8K, etc.) en formato tabular en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 9,1 GB de pesos en bfloat16, se estima un mínimo de ~12 GB de VRAM para inferencia cómoda (pesos + activaciones + tokens de imagen); no hay cifras oficiales.
- **GPUs recomendadas**: RTX 4090 o RTX 3090 (24 GB) para inferencia local; A100 o H100 si se desea servir con concurrencia. No hay recomendaciones oficiales.
- **Consumer GPUs**: por tamaño (~4,5 B de parámetros), debería caber en GPUs de 12-16 GB (RTX 4070 Ti Super, RTX 4080) en bf16; no hay soporte GGUF publicado, por lo que la vía llama.cpp/Ollama no está confirmada.
- **Despliegue**: el ejemplo oficial usa Transformers 5.13.1 con `device_map="auto"` y Accelerate. No se mencionan oficialmente vLLM, TGI, llama.cpp ni Ollama; la etiqueta `endpoints_compatible` sugiere compatibilidad con Inference Endpoints de HuggingFace.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Parametros | Entrenamiento | Licencia |
|---|---|---|---|---|
| ZwZ2-4B | Qwen3.5-4B | ~4,54 B | GRPO sobre ~20K ejemplos (ZwZ2-RL-VQA) | no disponible |
| ZwZ2-9B (misma familia) | Qwen3.5-9B | no disponible | GRPO, mismo metodo | no disponible |
| ZwZ2-27B (misma familia) | Qwen3.6-27B | no disponible | GRPO, mismo metodo | no disponible |
| Qwen3.5-4B (modelo base) | — | ~4 B (no disponible exacto) | Preentrenamiento + alineacion de Qwen | segun licencia Qwen |

La comparativa más relevante es interna a la familia ZwZ2: las tres variantes comparten método y datos (~20.000 ejemplos), diferenciándose solo en el modelo base. Frente a otros VLMs de 4 B del ecosistema, no hay datos comparativos publicados en la información disponible.

## Limitaciones y advertencias

- El propio autor advierte que el modelo puede **alucinar detalles**, leer mal texto y cometer errores de conteo o espaciales.
- El rendimiento depende de la **resolución de la imagen**, la longitud del contexto y el formato del prompt.
- La plantilla de chat por defecto pide respuestas entre `<answer>...</answer>`; un mensaje de sistema personalizado sustituye esa instrucción, lo que puede alterar el formato de salida si no se controla.
- **Licencia no especificada** en la model card: hay que revisar la licencia de los pesos publicados y la del modelo base Qwen3.5-4B antes de cualquier uso comercial.
- Entrenado y etiquetado solo en **ingles**; el rendimiento en castellano no está documentado.
- El entrenamiento se basa en tareas de cuatro opciones generadas sintéticamente a partir de SA-1B; la generalización a otros tipos de tareas visuales fuera de los 25 benchmarks evaluados no está garantizada.
- La descarga del chat template requiere descargar explícitamente `chat_template.jinja` (como en el ejemplo oficial), un paso fácil de omitir al integrar el modelo.
- Modelo de nicho con pocas descargas (309) y adopción limitada; la madurez del ecosistema de despliegue (cuantizaciones, runtimes optimizados) es aún escasa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/inclusionAI/ZwZ2-4B
- Colección ZwZ2 v2: https://huggingface.co/collections/inclusionAI/zooming-without-zooming-v2
- Dataset de entrenamiento ZwZ2-RL-VQA: https://huggingface.co/datasets/inclusionAI/ZwZ2-RL-VQA
- Paper v2 (arXiv): https://arxiv.org/pdf/2610.37037
- Repositorio del proyecto v2: https://github.com/inclusionAI/Zooming-without-Zooming-v2
- Paper de primera generación (arXiv): https://huggingface.co/papers/2602.11858
- Proyecto de primera generación: https://huggingface.co/collections/inclusionAI/zooming-without-zooming
- Código de primera generación: https://github.com/inclusionAI/Zooming-without-Zooming
- Modelos hermanos: https://huggingface.co/inclusionAI/ZwZ2-9B y https://huggingface.co/inclusionAI/ZwZ2-27B
