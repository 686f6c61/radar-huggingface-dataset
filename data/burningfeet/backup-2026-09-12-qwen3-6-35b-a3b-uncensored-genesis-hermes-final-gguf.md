# burningfeet/backup-2026-09-12-Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-Final-GGUF

## Resumen

Este repositorio contiene una distribución en formato GGUF de un modelo de lenguaje multimodal de tipo mixture of experts (MoE) con 34.660.610.688 parámetros totales, publicado por el usuario burningfeet bajo licencia Apache 2.0. El modelo parte de HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive y del finetune DJLougen/hermes-qwen3.5-35b-a3b-GGUF, entrenado este último con el dataset NousResearch/hermes-function-calling-v1. Según la model card, se transfirieron alrededor de 2.000 bloques procedentes de dos tensores de expertos FFN del finetune Hermes al modelo base sin censura.

El rasgo diferencial es el método Genesis, descrito como un algoritmo de "reparación de señal" sobre modelos en GGUF: no es un entrenamiento ni un finetune, sino una intervención numérica sobre los bytes de los tensores. Consta de tres etapas (reequilibrado de cabezas en tensores ssm_conv1d, sustitución de bloques con ceros y reducción de ruido mediante SVD basada en la distribución de Marchenko–Pastur, preservando el 99 % de la señal). El autor afirma que el modelo base no presenta rechazos (0/465) y que el proceso mejora la estabilidad, la claridad de contexto y el seguimiento de instrucciones.

El modelo es relevante para quienes buscan un MoE multimodal sin alineación de seguridad, orientado a uso agéntico y function calling, y ejecutable en local con llama.cpp u Ollama. Ahora bien, en el momento de redactar esta ficha acumula 0 descargas y 0 likes, no publica resultados de benchmarks y su procedencia (el identificador incluye la etiqueta "backup-2026-09-12") no está documentada en el repositorio.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts) multimodal de tipo image-text-to-text; la model card menciona tensores ssm_conv1d encargados de la memoria de contexto largo |
| Parametros totales | 34.660.610.688 (~34,66 mil millones) |
| Parametros activos | no disponible en la documentación; la nomenclatura A3B del identificador sugiere del orden de 3.000 millones de parámetros activos por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF en múltiples perfiles (no se detallan los nombres concretos); se menciona un script de cuantización con soporte de perfiles Unsloth y el uso de imatrix. El repositorio ocupa 82,2 GB en total |
| Idiomas soportados | en, zh, multilingual (el castellano no aparece listado de forma explícita) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF; los safetensors del modelo base suman 34.660.610.688 parámetros |

## Arquitectura y entrenamiento

La arquitectura es un transformer con mezcla de expertos (MoE), del que no se publican en la información disponible el número de capas, la dimensión oculta, el número de expertos totales ni el mecanismo de enrutamiento. La model card sí identifica tensores ssm_conv1d, asociados a la gestión de memoria de contexto largo, lo que apunta a componentes de tipo SSM o híbridos dentro del bloque; no se detalla su configuración. El pipeline declarado es image-text-to-text y las etiquetas incluyen vision y multimodal, lo que implica capacidad de entrada de imágenes, aunque no se describe el codificador visual ni la resolución soportada.

El entrenamiento no lo realiza el autor de esta ficha: el modelo hereda los pesos del base sin censura de HauhauCS y del finetune Hermes. Sobre esa combinación se aplica Genesis, un post-procesado que opera sobre archivos GGUF. La primera etapa escanea los tensores ssm_conv1d y reequilibra la relación entre cabezas. La segunda recorre los bloques por fragmentos, evalúa tres parámetros y selecciona el fragmento que mejor encaja con la distribución de pesos del tensor para reemplazar bloques nulos sin alterar la estructura aprendida. La tercera detecta ruido mediante un SVD propio, excluyendo token_embd.weight, output.weight, tensores 1D, sesgos y normalizaciones, y lo reduce según la ley de Marchenko–Pastur conservando el 99 % de la señal y el gradiente aprendido. El proceso se ejecutó, según la documentación, en una GPU Tesla T4 en Google Colab gratuito. No se documentan fases de RLHF o DPO adicionales en este repositorio.

## Capacidades

- Generación de texto conversacional multi-turno en inglés, chino y otros idiomas sin especificar.
- Razonamiento con modo thinking: la model card menciona un "thinking mode (coding)" y recomienda activar el pensamiento con una system prompt concreta.
- Entrada de imágenes y texto (image-text-to-text), con etiqueta explícita de visión y multimodalidad.
- Function calling y tool calling: el modelo integra datos de NousResearch/hermes-function-calling-v1 y está orientado al agente Hermes.
- Flujos agénticos y razonamiento multi-paso, según la etiqueta agentic del repositorio.
- Comportamiento sin alineación de seguridad: el autor declara 0/465 rechazos en el modelo base, lo que se traduce en ausencia de negativas a peticiones que otros modelos rechazarían.
- Compatibilidad con endpoints: la etiqueta endpoints_compatible indica que puede servirse mediante infraestructura de inferencia estándar.
- No se documentan capacidades de audio, vídeo, voz ni generación de imágenes.

## Casos de uso

- Agentes con herramientas en producción: el modelo soporta function calling y está ajustado sobre un dataset específico de llamadas a funciones, por lo que puede integrarse como núcleo de un agente que consulte APIs, bases de datos o servicios externos en varios pasos.
- Asistente conversacional bilingüe inglés-chino: los idiomas declarados son en y zh, de modo que encaja en productos de atención al cliente para esos mercados, con la advertencia de que el castellano no está listado.
- Análisis de documentos con imágenes: al aceptar entrada image-text-to-text, puede emplearse para descripción de capturas, extracción de información de formularios escaneados o respuesta a preguntas sobre gráficos, siempre que se valide el comportamiento real del codificador visual, no documentado.
- Generación de código asistida con modo thinking: la model card incluye un modo de razonamiento orientado a programación, útil para autocompletado, revisión de parches o explicación de fragmentos dentro de un IDE.
- Despliegue local en estación de trabajo: al distribuirse en GGUF, puede ejecutarse con llama.cpp u Ollama en equipos con GPU de consumo y RAM suficiente, sin depender de servicios en la nube.
- Investigación sobre post-procesado de tensores: Genesis es un método reproducible descrito con detalle (SVD, Marchenko–Pastur, sustitución de bloques), lo que permite auditar sus efectos frente al modelo base como línea de experimentación.
- Evaluación de alineación y seguridad: al tratarse de una variante sin censura, resulta útil como muestra de control en estudios sobre tasas de rechazo, toxicidad y fuga de contenido en modelos abiertos.
- Prototipado de sistemas con restricciones de privacidad: su naturaleza local y su licencia Apache 2.0 permiten mantener los datos dentro de la infraestructura propia, con la salvedad de verificar la licencia del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Los cálculos siguientes son estimaciones a partir de los 34.660.610.688 parámetros y del tamaño del repositorio (82,2 GB); no proceden de mediciones publicadas por el autor.
- VRAM/RAM para los pesos en una sola copia: aproximadamente 69 GB en F16/BF16, 37 GB en Q8_0, 28 GB en Q6_K, 24 GB en Q5_K_M, 21 GB en Q4_K_M, 17 GB en Q3_K_M y 11 GB en Q2_K.
- A esas cifras hay que sumar la caché KV, que la propia model card recomienda configurar en F16 para K y V, lo que aumenta el consumo respecto a cachés cuantizadas.
- GPU de consumo: una RTX 4090 o RTX 3090 de 24 GB puede alojar una cuantización Q4 con poco margen, o Q5/Q6 recurriendo a offload parcial a CPU. Dos GPU de 24 GB (48 GB en total) permiten Q6_K o Q8_0 con holgura.
- GPU de centro de datos: una A100 de 40 GB cubre Q6_K; una A100 de 80 GB o una H100 permiten F16 completo y mayor paralelismo de peticiones.
- Equipos con memoria unificada (Apple Silicon de 64 a 128 GB) son una opción razonable para cuantizaciones Q5 a Q8 con buen rendimiento en prompt processing.
- La model card recomienda, para la cuantización APEX, forzar 40 capas de pesos MoE en CPU, activar el offload máximo a GPU y fijar 8 expertos activos. Esto hace viable ejecutar el modelo con 24 GB de VRAM y 64 GB de RAM del sistema.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, Jan, KoboldCpp, text-generation-webui y llama-cpp-python. vLLM dispone de soporte GGUF experimental; TGI no está orientado a este formato.
- Latencia y throughput: no disponible. Al ser un MoE con pocos parámetros activos, el coste por token es inferior al de un modelo denso de 35B, pero el modelo completo debe residir en memoria y el disco debe alojar los 82,2 GB del repositorio si se quieren varias cuantizaciones.

## Comparativa con modelos similares

Los datos de los modelos de referencia proceden de conocimiento público general y no forman parte de la documentación aportada; no se dispone de benchmarks de este modelo que permitan una comparación de rendimiento.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Genesis Hermes Final GGUF) | 34,66 mil millones | no disponible (nomenclatura A3B) | no disponible | apache-2.0 | GGUF, 0 descargas, 0 likes |
| HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive (base) | mismo orden de magnitud | no disponible | no disponible | no disponible | modelo base sin censura, 0/465 rechazos según la card |
| Qwen3-30B-A3B (referencia de la misma familia de nomenclatura) | ~30,5 mil millones | ~3,3 mil millones | 128K | apache-2.0 | ampliamente desplegado, con benchmarks publicados |
| Mixtral 8x7B (MoE abierto de referencia) | ~46,7 mil millones | ~12,9 mil millones | 32K | apache-2.0 | ampliamente desplegado, con benchmarks publicados |

## Limitaciones y advertencias

- Modelo sin censura: no ha pasado por alineación de seguridad orientada a rechazar peticiones dañinas. Puede generar contenido ilegal, peligroso o sensible, y no es apto para entornos de producción con usuarios finales sin moderación adicional.
- Procedencia poco documentada: el identificador del repositorio incluye "backup-2026-09-12" y el autor del método Genesis (LuffyTheFox) no coincide con el propietario del repositorio en HuggingFace (burningfeet). La cadena de custodia de los pesos y la fidelidad respecto al modelo original no se pueden verificar con la información disponible.
- Ausencia de validación externa: 0 descargas y 0 likes, sin benchmarks ni evaluaciones de terceros. Las afirmaciones sobre mejora de estabilidad y reducción de ruido son autoinformadas y no están respaldadas por publicaciones revisadas por pares.
- Nulo soporte declarado de castellano: los idiomas listados son en, zh y multilingual sin detalle, por lo que el rendimiento en español es incierto y requeriría evaluación propia.
- Longitud de contexto desconocida: no se especifica la ventana máxima, lo que impide planificar casos de uso que dependan de contexto largo pese a la mención de tensores ssm_conv1d en la card.
- Riesgo de alucinación: inherente a todos los modelos de lenguaje y potencialmente mayor en una variante sin alineación y sin evaluación publicada.
- Detalles multimodales incompletos: no se documentan el codificador visual, la resolución de entrada ni el rendimiento en tareas de visión.
- Licencia: el repositorio declara Apache 2.0, pero el modelo base y el dataset de Hermes pueden tener condiciones propias que no se detallan en esta información; conviene revisarlas antes de un uso comercial.
- Configuración dependiente de ajustes manuales: las recomendaciones de la card (caché KV en F16, 40 capas MoE en CPU, 8 expertos activos, system prompt concreta) sugieren que la calidad de salida es sensible a los parámetros del runtime.
- Inconsistencia en el material de origen: la card mezcla referencias a un finetune de la serie qwen3.5 y a un base de la serie qwen3.6, lo que añade incertidumbre sobre la composición exacta del modelo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/burningfeet/backup-2026-09-12-Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-Final-GGUF
- Modelo base: https://huggingface.co/HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive
- Finetune Hermes de origen: https://huggingface.co/DJLougen/hermes-qwen3.5-35b-a3b-GGUF
- Dataset de function calling: https://huggingface.co/datasets/NousResearch/hermes-function-calling-v1
- Plantilla de chat recomendada: https://huggingface.co/LuffyTheFox/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V7-GGUF/raw/main/chat_template.jinja
- System prompt creativa: https://huggingface.co/LuffyTheFox/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V5-GGUF/raw/main/System_Prompt_Creative.txt
- Discusión con system prompt de identidad agent: https://huggingface.co/LuffyTheFox/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V5-GGUF/discussions/7#6a6277b134def1392a9bd10f
- Script de cuantización con perfiles Unsloth: https://pastebin.com/hXhcMJn9
- Discord del proyecto Genesis: https://discord.gg/SZ5vacTXYf
- Distribución de Marchenko–Pastur (referencia matemática del método): https://en.wikipedia.org/wiki/Marchenko%E2%80%93Pastur_distribution
- Donaciones al autor del método: https://web.tribute.tg/d/KIH y https://hipolink.net/luffythefox
- Contacto del autor del método: luffythefox@mail.ru, azakharchenko92@gmail.com, Telegram @LuffyTheFox
- La búsqueda web realizada no ha devuelto enlaces técnicos relevantes sobre este modelo; los resultados obtenidos corresponden a un medio de noticias sin relación con el contenido de la ficha.
