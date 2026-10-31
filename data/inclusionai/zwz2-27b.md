# inclusionAI/ZwZ2-27B

## Resumen

ZwZ2-27B es un modelo vision-lenguaje desarrollado por inclusionAI como parte del proyecto **Zooming-without-Zooming-v2 (ZwZ2)**. Se trata de un ajuste del modelo base Qwen3.6-27B (arquitectura Qwen3.5/Qwen3.6, implementada como `Qwen3_5ForConditionalGeneration` en transformers) entrenado mediante aprendizaje por refuerzo con GRPO sobre el dataset sintético ZwZ2-RL-VQA. Su objetivo es resolver un problema concreto de la percepción multimodal de grano fino: la necesidad de herramientas de zoom o recorte en inferencia. ZwZ2 aprende a conectar evidencia visual entre regiones de la imagen (comparación, agregación, emparejamiento y razonamiento multi-paso) usando siempre imágenes completas, de modo que en inferencia no requiere zoom.

Su relevancia radica en que, con solo unos 20.000 ejemplos de entrenamiento, mejora a su modelo base en los 25 benchmarks evaluados (seis dominios), subiendo la precisión global de 55,52 a 60,51 puntos (+4,99). Los resultados abarcan desde percepción fina y razonamiento espacial hasta comprensión de contexto largo, agentes multimodales y razonamiento visual general. Existen además versiones más pequeñas (ZwZ2-4B y ZwZ2-9B) basadas en Qwen3.5-4B y Qwen3.5-9B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje (clase Qwen3_5ForConditionalGeneration), basado en Qwen3.6-27B |
| Parametros totales | 27.356.728.560 (~27,4 B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | ingles (en) |
| Licencia | no disponible (remite a la licencia de los pesos y a la del modelo base Qwen) |
| Formato de pesos | safetensors (tamano del repo: 54,7 GB) |

## Arquitectura y entrenamiento

ZwZ2-27B parte de Qwen3.6-27B y se entrena con **EvidenceConnect**, un metodo de construccion de datos que genera preguntas verificadas de multi-region a partir de imagenes de SA-1B. El proceso tiene tres fases: (1) agrupacion de 3 a 7 regiones relacionadas y generacion de preguntas usando vistas privilegiadas con zoom; (2) verificacion de respuestas mediante acuerdo entre modelos y pruebas de eliminacion de regiones (drop-one); (3) conversion de las preguntas verificadas a tareas de cuatro opciones. El entrenamiento se realiza con **GRPO** (Group Relative Policy Optimization, aprendizaje por refuerzo), sin una etapa adicional de supervised fine-tuning, lo cual es una de las decisiones tecnicas mas destacables del proyecto.

Un aspecto clave del metodo es que la politica (el modelo) solo ve imagenes completas con contornos de regiones coloreados; los recortes privilegiados se usan exclusivamente para construir los datos, nunca en inferencia. Esto permite que el modelo generalice la capacidad de conectar evidencia entre regiones sin depender de herramientas externas de zoom. El dataset resultante, ZwZ2-RL-VQA, esta publicado en HuggingFace con su esquema de datos y proceso de sintesis documentados.

## Capacidades

- Razonamiento visual multi-paso: conecta evidencia entre multiples regiones de una imagen mediante comparacion, agregacion y emparejamiento.
- Percepcion de grano fino sobre imagenes completas, sin necesidad de herramientas de zoom ni recortes en inferencia.
- Razonamiento espacial y comprension de contexto largo visual (evaluado en V-RAG, Image MM-NIAH y VH-Multi).
- Capacidades de agente multimodal (dominio evaluado en los 25 benchmarks).
- Generacion de texto conversacional con plantilla de chat (chat template en Jinja incluida en el repo).
- Modo no-thinking (`enable_thinking=False`), con respuestas finales estructuradas entre etiquetas `<answer>...</answer>` por defecto.
- Salida determinista configurable (`do_sample=False` en el ejemplo oficial).

## Casos de uso

- Analisis de documentos e imagenes densas: el modelo puede localizar y relacionar detalles en imagenes de alta resolucion (diagramas, escaneos, capturas) sin recurrir a pipelines de recorte, simplificando la arquitectura de la aplicacion.
- RAG visual (V-RAG): dado su rendimiento en tareas tipo V-RAG e Image MM-NIAH, es adecuado para sistemas que recuperan imagenes y necesitan responder preguntas verificando evidencia en regiones concretas.
- Agentes multimodales: los benchmarks incluyen dominio de agentes multimodales, por lo que puede integrarse como modulo de percepcion en agentes que razonan sobre capturas de pantalla o entornos visuales.
- Verificacion de contenido visual: la capacidad de comparar y emparejar evidencia entre regiones sirve para tareas de control de calidad visual, deteccion de inconsistencias o verificacion de afirmaciones sobre imagenes.
- Comprension de contextos visuales largos: tareas tipo needle-in-a-haystack visual (Image MM-NIAH) y multi-hop visual (VH-Multi) lo hacen util para analizar conjuntos de imagenes o documentos extensos.
- Investigacion en percepcion multimodal: al publicar dataset, codigo y metodo, es una base ideal para reproducir y extender investigacion en RL visual sin fine-tuning supervisado.
- Descripcion y dialogo sobre imagenes: el ejemplo oficial muestra uso conversacional image-text-to-text estandar con la plantilla de chat de transformers.

## Benchmarks y rendimiento

El model card reporta una evaluacion sobre **25 benchmarks en seis dominios**, con las siguientes cifras agregadas:

| Metrica | Base (Qwen3.6-27B) | ZwZ2-27B |
|---|---|---|
| Precision global (25 benchmarks, 6 dominios) | 55,52 % | 60,51 % (+4,99) |
| Benchmarks mejorados | — | 25 de 25 |

Los dominios cubiertos incluyen percepcion fina, razonamiento espacial, comprension de contexto largo (MMLongBench*, medido sobre el nucleo visual: V-RAG, Image MM-NIAH y VH-Multi, 25 tareas no-Counting), agentes multimodales y razonamiento visual general. Las puntuaciones detalladas por benchmark se publican como imagen en el repo (`assets/zwz2_27b_results.png`); no se incluyen los valores numericos individuales en texto, por lo que no es posible tabularlos aqui sin inventar datos.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 55 GB solo de pesos (27,4 B parametros x 2 bytes), mas overhead de activaciones y procesamiento de imagen; en la practica se recomienda al menos 64-80 GB de VRAM.
- GPUs recomendadas: NVIDIA A100 (80 GB) o H100 (80 GB) en un solo dispositivo, o reparto mediante `device_map="auto"` en 2x A100 40GB / 2x RTX 4090 (24 GB) con paralelismo de tensors o sharding.
- No cabe en una sola GPU de consumo estandar (RTX 4090, RTX 5090 de 32 GB) en bfloat16; seria necesario cuantizacion (no publicada oficialmente en el repo) o usar las variantes ZwZ2-4B / ZwZ2-9B para hardware de consumo.
- Despliegue: libreria transformers (version 5.13.1 indicada en el quickstart) con accelerate; compatibilidad con vLLM, llama.cpp u Ollama no confirmada en la informacion disponible (la arquitectura qwen3_5 es reciente y puede requerir soporte actualizado).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Base | Metodo | Licencia |
|---|---|---|---|---|
| ZwZ2-27B | ~27,4 B | Qwen3.6-27B | RL (GRPO) sobre VQA multi-region, sin zoom en inferencia | no disponible |
| ZwZ2-9B | no disponible | Qwen3.5-9B | Mismo metodo (EvidenceConnect + GRPO) | no disponible |
| ZwZ2-4B | no disponible | Qwen3.5-4B | Mismo metodo (EvidenceConnect + GRPO) | no disponible |

Las tres variantes comparten metodo y aproximadamente 20.000 ejemplos de entrenamiento, diferenciandose en tamano y modelo base. ZwZ2-27B es la variante de mayor capacidad y la unica basada en Qwen3.6. Comparativas frente a modelos externos (por ejemplo, otros VLMs de tamano similar) no se detallan en la informacion disponible; el model card menciona comparaciones con "advanced models" en sus figuras, pero sin datos numericos textuales.

## Limitaciones y advertencias

- El propio model card advierte que el modelo puede alucinar detalles, leer mal texto y cometer errores de conteo o espaciales.
- El rendimiento depende de la resolucion de la imagen, la longitud del contexto y el formato del prompt; conviene validar estos factores en cada caso de uso.
- El entrenamiento y la evaluacion se centran en ingles; el soporte de otros idiomas no esta documentado.
- La licencia no esta especificada en el model card: hay que consultar la licencia de los pesos publicados y la del backbone Qwen antes de cualquier uso comercial.
- La plantilla de chat por defecto pide respuestas dentro de `<answer>...</answer>`; si se usa un system message personalizado, se pierde esa instruccion por defecto, lo que puede afectar al parseo de respuestas en pipelines automatizados.
- El ejemplo oficial usa modo no-thinking y muestreo determinista; el comportamiento en otros modos no esta documentado.
- Requiere transformers 5.13.1 (version muy concreta), lo que puede generar conflictos de dependencias en entornos existentes.
- Las comparaciones con modelos avanzados en las figuras estan limitadas por la resolucion de imagen impuesta por sus plataformas de servicio, segun reconoce el propio model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/inclusionAI/ZwZ2-27B
- Paper (arXiv 2610.37037): https://arxiv.org/pdf/2610.37037
- Paper de primera generacion (arXiv 2602.11858): https://huggingface.co/papers/2602.11858
- Proyecto ZwZ2 (GitHub): https://github.com/inclusionAI/Zooming-without-Zooming-v2
- Codigo de primera generacion (GitHub): https://github.com/inclusionAI/Zooming-without-Zooming
- Coleccion ZwZ2 en HuggingFace: https://huggingface.co/collections/inclusionAI/zooming-without-zooming-v2
- Coleccion de primera generacion: https://huggingface.co/collections/inclusionAI/zooming-without-zooming
- Dataset de entrenamiento: https://huggingface.co/datasets/inclusionAI/ZwZ2-RL-VQA
- Modelos relacionados: https://huggingface.co/inclusionAI/ZwZ2-4B y https://huggingface.co/inclusionAI/ZwZ2-9B
