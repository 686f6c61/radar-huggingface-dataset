# imend35/Begonia-AI-LoRA

## Resumen

Begonia-AI-LoRA es un adaptador LoRA publicado en HuggingFace por el usuario imend35 bajo el identificador `imend35/Begonia-AI-LoRA`. Se trata de un ajuste fino supervisado (SFT) mediante la librería TRL sobre el modelo base Qwen/Qwen2.5-1.5B-Instruct, empaquetado con PEFT 0.21.2 y orientado a generación de texto conversacional. El repositorio contiene únicamente los pesos del adaptador (0,1 GB), no el modelo completo, por lo que su uso exige descargar por separado el modelo base de 1,5 mil millones de parámetros.

La relevancia de la ficha es limitada y conviene decirlo con claridad: la model card es la plantilla por defecto de HuggingFace sin rellenar, con todos los campos marcados como "[More Information Needed]". No se documentan datos de entrenamiento, hiperparámetros del LoRA (rango, alpha, módulos objetivo), idiomas, licencia ni resultados de evaluación. El repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, y la búsqueda web no devuelve ningún resultado relacionado con el modelo.

Por tanto, esta ficha describe con rigor lo que se puede afirmar (naturaleza del artefacto, base sobre la que se construye y implicaciones prácticas) y marca explícitamente como "no disponible" todo aquello que el autor no ha publicado. Cualquier uso en producción debería ir precedido de una evaluación propia del adaptador frente al modelo base sin ajustar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only de la familia Qwen2.5 |
| Parámetros totales | No disponible para el adaptador; el modelo base Qwen2.5-1.5B-Instruct tiene ~1,5 mil millones |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la información del adaptador; el modelo base soporta 32.768 tokens nativos según la documentación de Qwen |
| Tipos de cuantización | No disponible para el adaptador (se publica en safetensors); el base admite cuantizaciones tras fusionar el adaptador (GGUF, AWQ, GPTQ) |
| Idiomas soportados | No disponible (el modelo base declara soporte de 29 idiomas) |
| Licencia | No disponible (la licencia del modelo base Qwen2.5-1.5B-Instruct es Apache 2.0) |
| Formato de pesos | safetensors (adaptador LoRA compatible con PEFT) |
| Tamaño del repositorio | 0,1 GB |
| Librería de carga | peft |
| Versión de PEFT indicada | 0.21.2 |
| Pipeline declarado | text-generation |
| Etiquetas | lora, sft, transformers, trl, conversational |
| Modelo base | Qwen/Qwen2.5-1.5B-Instruct |
| Fecha de creación / actualización | 2026-10-18 / 2026-10-18 |

## Arquitectura y entrenamiento

El artefacto es un adaptador de bajo rango (LoRA) sobre un transformer decoder-only. Las etiquetas del repositorio (`peft`, `lora`, `sft`, `trl`, `transformers`) indican que el ajuste se realizó con el `SFTTrainer` de TRL sobre el checkpoint instruct de Qwen2.5-1.5B, es decir, un entrenamiento supervisado sobre pares instrucción-respuesta, sin que conste ninguna fase de preferencias (DPO/RLHF) propia del adaptador. No se publica el rango (`r`), el `lora_alpha`, el `dropout`, la lista de módulos objetivo ni la tasa de aprendizaje. El tamaño del repositorio (0,1 GB) es compatible con un adaptador de rango medio-alto aplicado a varios módulos, pero es una inferencia, no un dato confirmado.

Respecto al modelo base, Qwen2.5-1.5B-Instruct es un transformer con atención de consultas agrupadas (GQA), entrenado por Alibaba Qwen sobre un corpus multilingüe del orden de billones de tokens y posteriormente alineado con SFT y optimización de preferencias. Supone la referencia práctica para entender el techo de capacidades del adaptador: cualquier habilidad que Begonia-AI-LoRA muestre más allá de la conversación genérica tendrá que venir heredada de ese base, dado que un LoRA sobre 1,5B no añade conocimiento factual nuevo de forma fiable.

No se ha publicado información sobre el dataset de ajuste, su composición, su idioma, el número de tokens vistos ni el régimen numérico (fp16/bf16). Tampoco hay datos de infraestructura de entrenamiento ni de huella de carbono más allá del enlace genérico a la calculadora de ML Impact que aparece en la plantilla.

## Capacidades

- Generación de texto conversacional multi-turno: uso previsto según el pipeline declarado (`text-generation`) y la etiqueta `conversational`, sin evaluación publicada que lo respalde.
- Razonamiento y conocimiento general: heredados del modelo base Qwen2.5-1.5B-Instruct, de gama pequeña; capacidad limitada en tareas de razonamiento profundo.
- Generación de código y matemáticas básicas: el base maneja código y aritmética elemental, pero no hay evidencia de que el ajuste haya reforzado estas áreas.
- Soporte de tool calling / function calling: disponible de forma nativa en los modelos Qwen2.5-Instruct, por lo que el adaptador debería conservarlo salvo que el SFT lo haya degradado; no verificado.
- Salida estructurada en JSON: capacidad típica de la familia Qwen2.5-Instruct, no documentada específicamente para este adaptador.
- Capacidades multilingües: no disponibles para el adaptador; el base declara 29 idiomas, con especial solidez en inglés y chino.
- Modo "thinking" o razonamiento extendido: no disponible.
- Visión y audio: no disponibles (modelo puramente textual).

## Casos de uso

- Prototipado rápido de un asistente conversacional en local: el adaptador se fusiona con Qwen2.5-1.5B-Instruct (unos 3 GB en fp16) y se ejecuta en una GPU de consumo, lo que permite iterar sobre el tono y el estilo de las respuestas sin infraestructura dedicada.
- Base para un pipeline de ajuste encadenado: al ser un LoRA sobre un modelo Apache 2.0, se puede partir de él para un segundo SFT con datos propios y evaluar si el punto de partida aporta ventaja frente al base.
- Experimentación académica sobre SFT con TRL: útil como ejemplo reproducible de adaptador de bajo rango, siempre que se documenten los hiperparámetros que el autor no publicó.
- Extracción de información y clasificación ligera: aprovechando la capacidad del base para generar JSON, se puede usar en tareas de etiquetado o extracción de entidades en textos cortos, con validación previa del adaptador.
- Despliegue en entornos con recursos muy limitados: cuantizado a 4 bits (aproximadamente 1 GB), cabe en CPU o en GPUs integradas para tareas de baja concurrencia, como resúmenes o respuestas a preguntas sobre documentos breves.
- Evaluación comparativa de adaptadores comunitarios: sirve como referencia en estudios sobre calidad de LoRAs publicados sin model card, midiendo la degradación respecto al base en benchmarks estándar.
- Docencia y talleres sobre PEFT: el par base + adaptador es un caso práctico manejable para explicar carga con `PeftModel`, fusión de pesos y exportación a GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Ni la model card ni los metadatos del repositorio incluyen evaluaciones de MMLU, HumanEval, GSM8K, MT-Bench ni de ningún otro conjunto. Tampoco existe comparación publicada frente al modelo base sin ajustar, por lo que no es posible determinar si el SFT mejora o degrada el rendimiento original.

## Requisitos de hardware

- VRAM estimada para el adaptador: despreciable por sí mismo (0,1 GB en disco); el coste real lo determina el modelo base.
- Modelo base en fp16/bf16: aproximadamente 3,1 GB de pesos, en torno a 4-5 GB de VRAM efectiva con caché KV para contextos moderados.
- Cuantización a 8 bits: aproximadamente 1,6 GB de pesos; a 4 bits (GGUF Q4_K_M), alrededor de 1 GB.
- GPU de consumo: cabe holgadamente en una RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 o incluso en GPUs con 4-6 GB de VRAM si se cuantiza.
- GPU de datacenter: A100, H100 y L40S son sobredimensionadas para 1,5B; resultan útiles solo para servir muchas réplicas concurrentes o para reentrenar el adaptador.
- Opciones de despliegue: transformers + PEFT para cargar el adaptador; llama.cpp u Ollama tras fusionar y convertir a GGUF; vLLM y TGI admiten el modelo fusionado, no el adaptador en crudo; también es viable servir el base y aplicar el adaptador con `PeftModel` en un wrapper propio.
- Latencia y throughput: no disponibles. Como orden de magnitud, un 1,5B cuantizado a 4 bits en una GPU de consumo permite decenas de tokens por segundo, pero no hay mediciones publicadas para este adaptador concreto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| imend35/Begonia-AI-LoRA | ~1,5B (base) + adaptador LoRA | No disponible (base: 32.768 tokens) | No disponible | Pública en HF, 0 descargas | Model card sin rellenar, sin evaluación |
| Qwen/Qwen2.5-1.5B-Instruct | ~1,5B | 32.768 tokens nativos | Apache 2.0 | Pública, ampliamente usada | Modelo base de este adaptador; referencia obligada |
| Qwen/Qwen2.5-3B-Instruct | ~3B | 32.768 tokens nativos | Apache 2.0 (Qwen Research para algunas variantes; consultar) | Pública | Mayor capacidad a cambio de ~2x VRAM |
| Llama-3.2-1B-Instruct | ~1,2B | Hasta 128K tokens | Licencia comunitaria Llama 3.2 | Pública, con registro | Alternativa de tamaño similar con contexto mayor |
| SmolLM2-1.7B-Instruct | ~1,7B | 8.192 tokens (extensible) | Apache 2.0 | Pública | Alternativa europea/compacta para despliegue en el borde |

Las cifras de los modelos comparativos provienen de su documentación pública; las del adaptador Begonia son "no disponibles" salvo el tamaño del repositorio. No existen datos de rendimiento que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita no se puede asumir uso comercial. Aunque el base Qwen2.5-1.5B-Instruct es Apache 2.0, la ausencia de licencia en el adaptador es un riesgo jurídico que debe resolverse contactando con el autor.
- Model card vacía: no se documentan datos de entrenamiento, hiperparámetros ni evaluación, lo que impide auditar sesgos, contaminación de datos o comportamiento esperado.
- Riesgo de alucinación: propio de un modelo de 1,5B; el ajuste SFT puede incrementar la confianza en respuestas incorrectas si el dataset era de baja calidad.
- Sesgos desconocidos: al no publicarse la composición del corpus de ajuste, no se puede evaluar el sesgo de género, idioma, cultural o político introducido.
- Idiomas no declarados: no hay garantía de que el adaptador conserve el multilingüismo del base; es plausible un ajuste monolingüe (el nombre "Begonia" no aporta información verificable).
- Capacidad limitada por tamaño: 1,5B es insuficiente para razonamiento complejo, matemáticas avanzadas o generación de código en producción sin verificación.
- Contexto no confirmado: la ventana efectiva tras el SFT no está documentada; un ajuste con secuencias cortas puede degradar el uso de contextos largos.
- Sin validación comunitaria: 0 descargas y 0 "likes" implican ausencia de retroalimentación; no debe asumirse que funciona según lo esperado.
- Dependencia del base: el adaptador no es autónomo; requiere descargar Qwen2.5-1.5B-Instruct y respetar su licencia y sus propios términos.
- Fechas del repositorio: la creación se registra en 2026-10-18, dato a verificar en la interfaz de HuggingFace antes de citarlo.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/imend35/Begonia-AI-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio de código de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Blog oficial de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- Informe técnico de Qwen2.5: https://arxiv.org/abs/2412.15115
- Librería PEFT: https://github.com/huggingface/peft
- Librería TRL: https://github.com/huggingface/trl
- Referencia citada en las etiquetas del repo (Lacoste et al., 2019, huella de carbono): https://arxiv.org/abs/1910.09700
- Calculadora ML Impact: https://mlco2.github.io/impact

Nota: la búsqueda web realizada no devolvió ningún resultado relacionado con este modelo; los enlaces anteriores corresponden al modelo base y a las herramientas utilizadas en su construcción.
