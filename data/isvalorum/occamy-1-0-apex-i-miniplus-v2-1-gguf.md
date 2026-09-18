# IsValorum/Occamy-1.0-APEX-I-MiniPlus-V2.1-GGUF

## Resumen

Occamy-1.0 APEX-I-MiniPlus-V2.1 es una cuantización GGUF personalizada del modelo multimodal Accio-Lab/occamy-1.0, elaborada por el usuario IsValorum. Se trata de una build de precisión mixta diseñada tensor a tensor para modelos MoE con atención lineal híbrida, con el objetivo de preservar el razonamiento y la sintaxis del modelo original dentro de un presupuesto de memoria de aproximadamente 13,7 GiB. El modelo soporta entrada de imagen y texto (pipeline image-text-to-text) y está pensado para ejecutarse en estaciones de trabajo de 24 GB de VRAM o en equipos con descarga agresiva a RAM DDR4.

El modelo base emplea una arquitectura híbrida que combina atención lineal (DeltaNet/SSM) con atención completa periódica, organizada en 40 capas y 256 micro-expertos, con un total declarado de 35,2 B de parámetros y unos 2,6 B activos por token. La ventana de contexto nativa es de 262.144 tokens. La etiqueta `qwen35moe` sugiere una familia base de tipo Qwen MoE, aunque esto no se confirma explícitamente en la información disponible.

Su relevancia actual radica en el enfoque de cuantización quirúrgica: frente a las recetas automáticas que comprimen por igual todos los tensores, esta versión protege la cabeza de salida, los routers y el experto compartido para evitar la degradación de sintaxis, la deriva de enrutamiento y la pérdida de recuperación en contexto largo. La licencia Apache-2.0 facilita su uso comercial, aunque persisten dudas sobre el recuento real de parámetros (véase la sección de limitaciones).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE híbrido con atención lineal (DeltaNet/SSM) y atención completa periódica; 40 capas, 256 micro-expertos; multimodal (visión + texto) |
| Parametros totales | 35,2 B según la model card del autor; los metadatos de safetensors indican 446.571.248 (discrepancia no resuelta, ver limitaciones) |
| Parametros activos | Aproximadamente 2,6 B por token |
| Longitud de contexto | 262.144 tokens (256K) nativos |
| Tipos de cuantizacion | GGUF mixto propietario APEX-I-MiniPlus-V2.1 a 3,40 BPW: expertos nucleo IQ3_XXS, expertos de borde Q3_K (10 capas), experto compartido Q5_K (40 capas), atencion completa Q4_K (q/k/v) + Q6_K (output), cabeza de salida Q6_K, routers F32; proyector de vision Q8_0 (8,50 BPW) |
| Idiomas soportados | en, zh, es, fr, de, pt, it, ru, ja, ko, vi, th, ar (13 idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); proyector de vision mmproj en GGUF Q8_0 |

## Arquitectura y entrenamiento

El modelo base Accio-Lab/occamy-1.0 es un transformer de mezcla de expertos con atención híbrida: la mayor parte de las capas emplean mecanismos de atención lineal del tipo DeltaNet/State Space Model (SSM), e intercala de forma periódica capas de atención completa (según la model card, en capas como la 3, 7, 11 y sucesivas). La red se organiza en 40 capas y 256 micro-expertos, con un experto compartido (`shexp`) presente en todas las capas y routers de enrutamiento (`ffn_gate_inp`). El pipeline es multimodal de imagen a texto, con un proyector visual independiente.

Sobre el entrenamiento no se proporciona información en los datos disponibles: no se especifican el número de tokens, la composición del dataset ni si hubo fases de RLHF, DPO u otro ajuste por preferencias. La innovación destacada de esta publicación no está en el entrenamiento, sino en la estrategia de cuantización: la model card describe una protección selectiva de tensores críticos (routers en F32 sin comprimir, cabeza de salida en Q6_K, experto compartido en Q5_K y proyecciones de atención en Q4_K/Q6_K) frente a las recetas planas que degradan enrutamiento y sintaxis. El autor afirma que esta configuración elimina las paradas de descompresión en CPU AVX2 y mantiene la recuperación tipo needle-in-a-haystack en contexto largo.

## Capacidades

- Generacion de texto y razonamiento multi-step sobre ventanas de contexto de hasta 262.144 tokens.
- Razonamiento matematico y logico, con un experto compartido y expertos nucleo protegidos en la cuantizacion.
- Generacion de codigo, con proteccion especifica de la cabeza de salida orientada a evitar la perdida de llaves, corchetes e indentacion.
- Vision multimodal (image-text-to-text): el repo incluye un proyector visual Q8_0 de 614 MB para tareas de parsing optico de documentos.
- Capacidades multilingues en 13 idiomas, incluidos espanol, ingles, chino, frances, aleman, portugues, italiano, ruso, japones, coreano, vietnamita, thai y arabe.
- Recuperacion de informacion en contexto largo (needle-in-a-haystack) segun afirma el autor.
- No se especifica en la informacion disponible soporte explicito de tool calling, function calling ni modos de pensamiento (thinking mode).

## Casos de uso

- Procesamiento de documentos con vision: uso del proyector Q8_0 para extraer texto y estructura de imagenes o PDF escaneados, aprovechando el pipeline image-text-to-text.
- Analisis de contexto largo: resumen y consulta sobre documentos extensos de hasta 256K tokens, como expedientes legales o manuales tecnicos, en una unica ventana sin troceado.
- Asistencia de programacion en local: generacion y revision de codigo con la cabeza de salida en Q6_K, que el autor presenta como proteccion frente a la corrupcion de sintaxis y llaves.
- Despliegue en estaciones de trabajo de 24 GB: ejecucion con el modelo completo en VRAM a contexto maximo, segun la afirmacion del autor sobre el "milagro de 24 GB".
- Inferencia en portatiles con descarga a RAM DDR4: escenario de VRAM minima con la mayor parte de las capas en memoria del sistema, reportado a 24-28+ tok/s en streaming.
- Razonamiento matematico y logico asistido: tareas de resolucion paso a paso en entornos sin conexion, con soporte de 13 idiomas para equipos internacionales.
- Atencion al cliente multilingue en local: conversaciones multi-turno con contexto largo, con la ventaja de desplegarse sin enviar datos a servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no hay datos de MMLU, GSM8K, HumanEval ni similares). El autor unicamente reporta cifras de throughput bajo descarga agresiva, que se recogen a continuacion como datos declarados por el autor, no verificados de forma independiente:

| Metrica | Valor declarado por el autor |
|---|---|
| Throughput con descarga agresiva (pocas capas en VRAM, resto en DDR4) | +24 a 28+ tok/s en streaming |
| Contexto maximo en estacion de trabajo de 24 GB | 262.144 tokens (256K) completos en VRAM |
| Tamano total del GGUF | 14,75 GB (13,738 GiB), 3,40 BPW |
| Tamano del proyector de vision | 614 MB (585 MiB), 8,50 BPW |

## Requisitos de hardware

- VRAM estimada para el GGUF principal: aproximadamente 13,7 GiB de huella de memoria; sumar unos 585 MiB para el proyector de vision.
- El autor afirma que el contexto de 256K completo cabe en VRAM en equipos de 24 GB.
- Escenario de descarga agresiva: pocas capas en VRAM y el grueso del modelo en RAM DDR4, con throughput declarado de 24-28+ tok/s. Requiere CPU con soporte AVX2; el autor indica que esta receta elimina las paradas de descompresion en AVX2.
- No se especifican modelos de GPU concretos (A100, H100, RTX 4090, etc.) en la informacion disponible.
- Opciones de despliegue: llama.cpp (confirmado por las etiquetas y la model card). Al ser formato GGUF, es compatible con runtimes que consumen GGUF; no se confirman explicitamente vLLM, TGI, Ollama ni LM Studio en la informacion disponible.
- No se dispone de cifras de latencia (time-to-first-token) mas alla del throughput declarado.

## Comparativa con modelos similares

No se dispone de datos de benchmarks para comparar con alternativas de la misma categoria. La siguiente tabla compara esta build con las variantes descritas por el propio autor y con el modelo base en precision completa, segun la informacion disponible:

| Version | Expertos nucleo | Expertos de borde | Experto compartido | Cabeza de salida | Routers | Tamano | Impacto declarado |
|---|---|---|---|---|---|---|---|
| APEX-I-MiniPlus-V2.1 (esta build) | IQ3_XXS | Q3_K (10 capas) | Q5_K (40 capas) | Q6_K | F32 | 13,738 GiB / 3,40 BPW | Sin paradas AVX2; 24-28+ tok/s con descarga agresiva |
| MiniPlus V2 | IQ3_XXS | IQ3_S (10 capas) | IQ4_NL | Q6_K | F32 | ~+1,2 GB vs generico | Envolvente de borde ampliada; gating de atencion en contexto largo |
| MiniPlus V1 | IQ3_XXS | Q3_K (5 capas) | Q4_K / IQ4_NL | Q6_K | F32 | +1,1 GB vs generico | Recupera razonamiento nucleo; sin deriva de routers |
| APEX Mini generico | IQ2_S | Q3_K (5 capas) | Q4_K / Q3_K | Q3_K_M | Comprimido | ~12,5 GB | Errores de sintaxis, alta perplejidad en `<think>` |

## Limitaciones y advertencias

- Discrepancia de parametros sin resolver: la model card declara 35,2 B totales y ~2,6 B activos, mientras que los metadatos de safetensors del repositorio indican 446.571.248 parametros. Conviene verificar el recuento real antes de planificar recursos.
- Discrepancia en el tamano del repositorio: los metadatos indican 0,6 GB, mientras que la model card describe un archivo GGUF de 14,75 GB. Es posible que los metadatos no reflejen el total de los archivos.
- Es una cuantizacion de 3,40 BPW: por debajo de 4 bits, cabe esperar cierta degradacion de calidad respecto al modelo base en precision completa, especialmente en tareas de razonamiento profundo.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se han publicado evaluaciones independientes de fidelidad factual.
- El rendimiento declarado (24-28+ tok/s, 256K en 24 GB) procede del autor y no esta verificado de forma independiente.
- La model card no documenta sesgos conocidos ni limitaciones especificas por idioma.
- El etiquetado `qwen35moe` no se confirma en la informacion disponible como familia base oficial; tratarlo como indicio y no como hecho.
- Licencia apache-2.0 en la cuantizacion, pero conviene verificar la licencia y condiciones del modelo base Accio-Lab/occamy-1.0 antes de uso comercial.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no hay validacion por parte de la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/IsValorum/Occamy-1.0-APEX-I-MiniPlus-V2.1-GGUF
- Version anterior (MiniPlus V2): https://huggingface.co/IsValorum/Occamy-1.0-APEX-I-MiniPlus-V2-GGUF
- Modelo base: https://huggingface.co/Accio-Lab/occamy-1.0
- No se han encontrado otros enlaces relevantes (papers, blogs, repos o demos) en la busqueda web disponible.
