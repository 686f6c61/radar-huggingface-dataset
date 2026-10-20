# Harrycow/TieFighter-Holodeck-Holomax-Mythomax-F1-V1-COMPOS-20B-gguf

## Resumen

TieFighter-Holodeck-Holomax-Mythomax-F1-V1-COMPOS-20B es un modelo de generación de texto en inglés publicado por el usuario Harrycow (el README remite a la colección de DavidAU) como un "modelo compuesto" construido con mergekit. No es un modelo entrenado desde cero: es la fusión de cuatro modelos LLaMA-2 de 13B (KoboldAI/LLaMA2-13B-Tiefighter, KoboldAI/LLAMA2-13B-Holodeck-1, KoboldAI/LLAMA2-13B-Holomax y Gryphe/MythoMax-L2-13b) mediante una técnica que el autor describe como extractiva por capas —tomar capas de cada modelo según una fórmula— en lugar de un merge aritmético clásico. El resultado se "upscalea" hasta 19.994.362.880 parámetros (≈20B), con la intención declarada de dar espacio a la integración de los cuatro modelos de origen.

El objetivo del proyecto es explícitamente romper la predictibilidad del texto generado: el autor busca prosa creativa, verbosa e impredecible, con salidas largas (frecuentemente por encima de 1500 tokens sin pedirlo), humor, sarcasmo y capacidad de inventar palabras y sociedades. Está orientado a escritura de ficción, roleplay, construcción de escenas y brainstorming, y lleva la etiqueta `not-for-all-audiences`, con advertencia de lenguaje soez ocasional.

Este repositorio en concreto contiene únicamente los cuantizados GGUF (8 regulares y 22 con imatrix) para ejecución local, con un tamaño total de 135,2 GB. Es un modelo de nicho, sin descargas ni likes en el momento de la consulta, sin benchmarks publicados y sin soporte documentado de tool calling ni de capacidades multimodales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, linaje LLaMA-2 (merge por capas de 4 modelos de 13B) |
| Parametros totales | 19.994.362.880 (≈20B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible de forma oficial; en los prompts de prueba de la model card se indica `CTX:2048` |
| Tipos de cuantizacion | GGUF: 8 cuantizados regulares y 22 con imatrix (denotados "imat"); los nombres concretos de cada quant no se detallan en la informacion disponible |
| Idiomas soportados | Ingles (`en`) |
| Licencia | apache-2.0 (declarada por el publicador; ver advertencias) |
| Formato de pesos | GGUF (repositorio solo de cuantizados; los pesos fuente en safetensors/EXL2/AWQ/GPTQ/HQQ estan en la coleccion del autor original) |

## Arquitectura y entrenamiento

La arquitectura es la de un transformer decoder-only de la familia LLaMA-2, con rotary embeddings, SwiGLU y las convenciones habituales de esa generacion de modelos. No hay entrenamiento: la model card indica que el modelo se formó "usando capas de cada modelo mediante una fórmula, en lugar de usar matemáticas para fusionarlos", porque los métodos de merge convencionales provocaban, según el autor, una pérdida excesiva de los atributos únicos de cada modelo de origen. El resultado se describe como "un cerebro principal y tres subcerebros interconectados" y se presenta como un upscale desde los 13B originales hasta los 20B, con el argumento de que más capas permiten una salida más compleja.

No se dispone de datos sobre volumen de tokens de entrenamiento, composición del dataset, ni sobre fases de RLHF, DPO o ajuste por instrucciones aplicadas a este modelo compuesto: los modelos de base son ajustes de LLaMA-2 orientados a rol y ficción, pero la información proporcionada no detalla sus recetas. Tampoco se documentan innovaciones de inferencia (decodificación especulativa, atención lineal, etc.). El autor sí menciona que existen 5 fórmulas de composición operativas con variantes, y que la "Version 1" se refiere a la mezcla concreta de los cuatro modelos; las demás permutaciones seguían en pruebas y no se confirma su publicación.

## Capacidades

- Generación de texto creativo de formato largo: el autor reporta salidas que superan con frecuencia los 1500 tokens sin instrucción explícita.
- Escritura de ficción, relato, construcción de escenas, worldbuilding y diálogo narrativo.
- Roleplay conversacional y personajes, con capacidad de mantener tono y voz a lo largo de turnos.
- Brainstorming y generación de ideas, con tendencia deliberada a la digresión y a la asociación poco predecible.
- Registro humorístico, sarcasmo ligero y lo que el autor describe como cierta "autoconciencia" del propio texto.
- Invención de palabras, sociedades y excusas (creatividad léxica por encima de la fidelidad factual).
- No hay soporte documentado de tool calling ni de function calling.
- No hay soporte documentado de agentes, planificación multi-paso estructurada ni modo "thinking".
- No dispone de visión, audio ni otras modalidades.
- Multilingüe limitado: la model card solo declara inglés.

## Casos de uso

- Escritura de ficción por capítulos: el modelo mantiene bien la generación larga y continua, por lo que se puede usar para producir borradores de capítulos completos a partir de una premisa breve y luego editar manualmente. Adecuado por su verbosidad intrínseca y su tolerancia a continuar sin instrucciones.
- Roleplay y aventuras conversacionales: encaja en frontends como KoboldCpp, SillyTavern o text-generation-webui para partidas narradas por IA, donde la impredecibilidad y el humor del modelo son una ventaja y no un defecto.
- Worldbuilding y generación de lore: sirve para producir de forma rápida sociedades ficticias, topónimos, culturas y excusas narrativas coherentes dentro de un contexto dado, gracias a su tendencia a inventar taxonomías y detalles.
- Brainstorming divergente en preproducción creativa: útil como generador de ideas de partida deliberadamente raras (nombres, giros argumentales, conceptos), que después se filtran y refinan con otro modelo o a mano.
- Diálogo de personajes para prototipos de videojuego o narrativa interactiva: con prompts de sistema largos y una ventana de contexto moderada (2048 tokens en las pruebas del autor) se pueden definir voces de personaje y generar variantes de líneas.
- Pruebas comparativas de técnicas de merge: como ejemplo de "modelo compuesto" documentado, resulta útil para investigadores que quieran reproducir o evaluar cualitativamente los efectos de la fusión por capas frente al merge aritmético, usando mergekit como referencia.
- No recomendado para atención al cliente, extracción de datos, generación de código en producción ni tareas que exijan fidelidad factual o formato estricto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones automáticas de ningún tipo; únicamente describe cualitativamente el estilo de salida y ofrece ejemplos de generación y recomendaciones de muestreo.

## Requisitos de hardware

Estimaciones calculadas a partir de los 19.994.362.880 parámetros, sin contar caché KV ni overhead del runtime:

- VRAM aproximada para inferencia: ~40 GB en FP16; ~21 GB en Q8_0; ~16,5 GB en Q6_K; ~14 GB en Q5_K_M; ~12 GB en Q4_K_M; ~11,5 GB en Q4_0; ~9,7 GB en Q3_K_M; ~7 GB en Q2_K.
- GPU profesionales: A100 40 GB o H100 para FP16 sin cuantizar; A100 80 GB si se quiere contexto amplio y lote grande.
- GPU de consumo: sí cabe. RTX 3090/4090 (24 GB) ejecutan Q4_K_M, Q5_K_M y Q6_K completos en VRAM; RTX 3060 12 GB, 4070 y 4070 Ti ejecutan Q4_K_M o Q4_0 con poco margen; tarjetas de 8 GB solo con Q2_K/Q3_K_M o descarga parcial a CPU.
- Despliegue: llama.cpp (incluido su servidor compatible con la API de OpenAI), KoboldCpp, LM Studio, text-generation-webui (con cargador `llama_HF` para GGUF, según la model card) y SillyTavern o Backyard AI como frontends. vLLM y TGI no se mencionan en la documentación disponible para este formato.
- Latencia y throughput: no disponibles. Dependen del quant elegido, del reparto CPU/GPU y del backend.
- Aviso práctico: el repositorio ocupa 135,2 GB, así que conviene descargar solo los quants que se vayan a usar; el autor recomienda probar varias versiones por la naturaleza impredecible del modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TieFighter-Holodeck-Holomax-Mythomax F1 V1 COMPOS 20B (este) | ~20B | no disponible (pruebas a 2048) | Merge compuesto de 4 modelos, ficcion y rol | apache-2.0 (declarada) | GGUF en este repo |
| KoboldAI/LLaMA2-13B-Tiefighter | 13B | no disponible en la informacion proporcionada | Ficcion, aventura, rol | no disponible en la informacion proporcionada | Pesos completos y quants comunitarios |
| KoboldAI/LLAMA2-13B-Holodeck-1 | 13B | no disponible en la informacion proporcionada | Rol y escritura de escenas | no disponible en la informacion proporcionada | Pesos completos y quants comunitarios |
| KoboldAI/LLAMA2-13B-Holomax | 13B | no disponible en la informacion proporcionada | Ficcion creativa de formato largo | no disponible en la informacion proporcionada | Pesos completos y quants comunitarios |
| Gryphe/MythoMax-L2-13b | 13B | no disponible en la informacion proporcionada | Merge orientado a rol y creatividad | no disponible en la informacion proporcionada | Pesos completos y quants comunitarios |

Los cuatro modelos de origen son los componentes declarados de este compuesto; la comparación relevante es si el upscale a 20B y la fusión por capas aportan algo frente a ejecutar directamente uno de los 13B, que ocupa aproximadamente la mitad de VRAM en el mismo quant.

## Limitaciones y advertencias

- Contenido para adultos y lenguaje soez: la etiqueta `not-for-all-audiences` y la propia model card advierten de tacos ocasionales y de contenido no apto para todos los públicos. Requiere filtrado o moderación si se expone a usuarios finales.
- Alucinación estructural: el modelo está diseñado para inventar (palabras, sociedades, excusas). No es fiable para datos factuales, citas, referencias ni cálculos.
- Verbosidad e impredecibilidad: el autor lo describe como "salvajemente impredecible y verboso"; la salida puede desviarse del prompt y desbordar la longitud deseada. Exige parámetros de muestreo específicos (smoothing factor 1.5-2.5 o repetition penalty 1.1-1.15, según la model card) para no degradarse.
- Idioma: solo inglés declarado. El rendimiento en castellano no está documentado y previsiblemente será deficiente.
- Contexto: no se declara una longitud oficial; los ejemplos de prueba usan 2048 tokens. Planificar despliegues con ventanas cortas.
- Licencia: el publicador declara apache-2.0, pero el modelo deriva de cuatro modelos de terceros con condiciones propias que conviene verificar antes de un uso comercial. La licencia del repositorio de cuantizados no sustituye a la de los pesos originales.
- Sin validación externa: cero descargas, cero likes y ninguna evaluación de benchmarks en la información disponible. No hay evidencia independiente de calidad más allá de la descripción del autor.
- Metadatos: la fecha de creación indicada (2026-10-19) y el ecosistema de nombres sugieren un proyecto de autor individual sin gobernanza ni mantenimiento garantizado.
- No apto para producción en tareas de código, agentes o tool calling: no hay soporte documentado de ninguna de estas capacidades.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Harrycow/TieFighter-Holodeck-Holomax-Mythomax-F1-V1-COMPOS-20B-gguf
- KoboldAI/LLaMA2-13B-Tiefighter: https://huggingface.co/KoboldAI/LLaMA2-13B-Tiefighter
- KoboldAI/LLAMA2-13B-Holodeck-1: https://huggingface.co/KoboldAI/LLAMA2-13B-Holodeck-1
- KoboldAI/LLAMA2-13B-Holomax: https://huggingface.co/KoboldAI/LLAMA2-13B-Holomax
- Gryphe/MythoMax-L2-13b: https://huggingface.co/Gryphe/MythoMax-L2-13b
- MergeKit (herramienta de fusion): https://github.com/arcee-ai/mergekit
- llama.cpp: https://github.com/ggerganov/llama.cpp
- LM Studio: https://lmstudio.ai/
- text-generation-webui: https://github.com/oobabooga/text-generation-webui
- KoboldCpp: https://github.com/LostRuins/koboldcpp
- Backyard AI / Faraday: https://backyard.ai/desktop
- Guia de parametros y samplers del autor: https://huggingface.co/DavidAU/Maximizing-Model-Performance-All-Quants-Types-And-Full-Precision-by-Samplers_Parameters
- Coleccion de ficheros fuente (safetensors, EXL2, AWQ, GPTQ, HQQ): https://huggingface.co/collections/DavidAU/d-au-source-files-for-gguf-exl2-awq-gptq-hqq-etc-etc-66b55cb8ba25f914cbf210be
