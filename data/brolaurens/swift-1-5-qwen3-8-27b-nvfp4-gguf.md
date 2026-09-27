# BroLaurens/Swift-1.5-Qwen3.8-27B-NVFP4-GGUF

## Resumen

Swift-1.5-Qwen3.8-27B-NVFP4-GGUF es una conversion a formato GGUF para llama.cpp del checkpoint calibrado `ukisai/Swift-1.5-Qwen3.8-27b-NVFP4`, publicado por el usuario BroLaurens. El modelo subyacente es un transformer hibrido de 27.320.698.242 parametros (27,3 B) construido sobre Qwen3.8-27B, con una mezcla de atencion lineal (componentes tipo SSM) en 48 capas y atencion completa en 16 capas, ademas de una cabeza de prediccion multi-token (MTP) que permite decodificacion especulativa autocontenida.

El problema que resuelve esta ficha concreta es la portabilidad: el checkpoint original esta calibrado con ModelOpt en NVFP4 + FP8, un formato que depende del ecosistema de NVIDIA. Esta conversion reempaqueta los 193 tensores NVFP4 al formato de superbloque nativo `NVFP4` de GGML preservando bit a bit las escalas UE4M3 por cada 16 elementos y los factores `weight_scale_2` por tensor, de modo que llama.cpp pueda cargarlos sin requantizacion. El resultado son 19,74 GB de pesos (5,78 bits por peso) que caben en una GPU Blackwell de 24 GB.

Es relevante ahora por tres motivos: demuestra que el pipeline de llama.cpp ya soporta nativamente NVFP4 y FP8 en la conversion, incluye vision (proyector multimodales `mmproj` oficial de UkisAI) y anade una cabeza MTP que duplica el throughput de generacion medido. El contexto declarado en el ejemplo de uso es de 262144 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: atencion lineal (48 capas, con `attn_qkv`, `attn_gate`, `ssm_out`, `ssm_alpha`, `ssm_beta`, `ssm_conv1d`) + atencion completa (16 capas, con `attn_q/k/v/output`), mas cabeza MTP |
| Parametros totales | 27.320.698.242 (27,3 B) |
| Parametros activos | no disponible (no se describe arquitectura MoE en la informacion proporcionada) |
| Longitud de contexto | 262144 tokens (segun el ejemplo de uso con `-c 262144`) |
| Tipos de cuantizacion | NVFP4 (193 tensores de MLP y lm_head, con escalas UE4M3 por cada 16 elementos), Q8_0 (208 tensores de atencion, `token_embd`), Q6_K (atencion de la cabeza MTP), Q4_K (FFN de la cabeza MTP), F32 (normas, `ssm_alpha`, `ssm_beta`, `ssm_conv1d`, escalas) |
| Idiomas soportados | no disponible |
| Licencia | swift-open-license-1.0 (licencia propietaria, etiquetada como "other"); Qwen3.8-27B es Apache 2.0 |
| Formato de pesos | GGUF (`Swift-1.5-Qwen3.8-27B-NVFP4-Q8mix.gguf`, 19,74 GB); proyector `mmproj-Swift-1.5-Qwen3.8-27B-F16.gguf` (885 MB); fichero auxiliar `.tensor-types.txt` (41 KB) |

## Arquitectura y entrenamiento

El modelo base presenta una topologia hibrida poco habitual: 64 capas (indices 0 a 63) mas una cabeza MTP en `blk.64` con 15 tensores. De esas 64 capas, 48 usan atencion lineal con componentes de espacio de estados (`ssm_out`, `ssm_conv1d`, `ssm_alpha`, `ssm_beta`), lo que reduce el coste cuadratico del contexto largo, mientras que 16 capas mantienen atencion completa. Todas las capas incluyen un MLP denso con `ffn_gate`, `ffn_up` y `ffn_down`. No se indica en la informacion disponible que exista enrutamiento de expertos (MoE), pese a que el tag `qwen3_8` y el sufijo "3.8" podrian sugerirlo en otras variantes de la familia.

La innovacion tecnica del checkpoint reside en el proceso de cuantizacion mas que en el entrenamiento, que no se documenta. UkisAI aplico una calibracion ModelOpt para producir un NVFP4 + FP8 cuantizado por grupos, y el autor de esta ficha lo convierte con `convert_hf_to_gguf.py --outtype bf16 --fp8-as-q8` (commit `2145525a4081d66ff1a87cf43ef809f95a85ac0c` de llama.cpp, de 2026-09-26), donde el conversor reempaqueta el grupo NVFP4 al layout GGML y transforma el grupo FP8 a Q8_0. Despues ejecuta `llama-quantize` con un fichero de tipos por tensor: los tensores NVFP4 y Q8_0 se copian byte a byte, los restos BF16 pasan a Q8_0 y las puertas recurrentes se mantienen en F32. La cabeza MTP no fue ajustada por UkisAI, por lo que se injerta byte a byte desde `unsloth/Qwen3.8-27B-GGUF` (`MTP/mtp-Qwen3.8-27B-Q4_0.gguf`), unica pieza no derivada del checkpoint original.

El autor documenta verificaciones de integridad: 1147 de 1252 tensores son byte-identicos entre la conversion cruda y el fichero final; los 193 tensores NVFP4 se recomprimieron de forma independiente desde los safetensors de origen y coinciden exactamente; la decodificacion GGML `nvfp4` frente a la formula ModelOpt `weight * weight_scale * weight_scale_2` da una diferencia absoluta maxima de 0,0 en los tensores muestreados; y las 41 claves de metadatos coinciden con el GGUF oficial de UkisAI. No se menciona RLHF ni DPO, ni el volumen o la composicion del dataset de entrenamiento.

## Capacidades

- Generacion de texto conversacional multi-turno, con soporte de plantilla de chat via `--jinja`.
- Razonamiento con control de esfuerzo: la plantilla acepta `reasoning_effort` con valores `xhigh` (por defecto), `medium` y `low` (etiquetado por el autor como "efficient-thinking").
- Comprension de imagenes: el pipeline declarado es `image-text-to-text` y se distribuye el proyector `mmproj` oficial F16 de UkisAI para entrada de vision.
- Decodificacion especulativa autocontenida mediante la cabeza MTP (`qwen35.nextn_predict_layers = 1`), activable con `--spec-type draft-mtp`.
- Contexto largo: ventana declarada de 262144 tokens, favorecida por las 48 capas de atencion lineal.
- Inferencia acelerada por hardware: los tensores NVFP4 se ejecutan de forma nativa en NVIDIA Blackwell.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere despliegue en infraestructura de inferencia gestionada, aunque no se detalla el proveedor.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente o multi-step reasoning mas alla del modo de razonamiento: no disponible.
- Capacidades de audio: no disponibles.
- Idiomas soportados: no disponible.

## Casos de uso

- Atencion al cliente automatizada con contexto largo: la ventana de 262144 tokens permite mantener historiales de conversacion extensos, transcripciones de incidencias y documentacion de producto en una sola sesion, sin truncar el contexto ni recurrir a recuperacion externa agresiva.
- Analisis de documentos con imagenes: al ser un modelo `image-text-to-text` con proyector multimodal, puede procesar capturas, diagramas o fotografias junto a texto, util para extraer datos de facturas, informes escaneados o interfaces.
- Razonamiento controlado por coste: ajustando `reasoning_effort` a `low` o `medium` se reduce el presupuesto de tokens de pensamiento en tareas rutinarias (clasificacion, extraccion de campos), reservando `xhigh` para problemas complejos.
- Despliegue en estaciones de trabajo con GPU Blackwell de 24 GB: el fichero de 19,74 GB mas el proyector de 885 MB caben en una RTX PRO 4000 Blackwell, lo que permite servir el modelo en local sin clúster ni GPU de centro de datos.
- Servicio de inferencia de baja latencia con MTP: con `--spec-type draft-mtp --spec-draft-n-max 3` el autor mide 41,3 t/s de generacion frente a 19,8 t/s sin especulacion, un 2,09x de mejora; util para chat interactivo o generacion en tiempo real donde el coste por token importa.
- Investigacion en cuantizacion: el fichero `.tensor-types.txt` y el layout documentado (193 NVFP4, 208 Q8_0, 15 de la cabeza MTP) sirven como referencia reproducible para estudiar el impacto de mezclar NVFP4 con K-quants y Q8_0 en un mismo modelo hibrido.
- Generacion de codigo en produccion o pipelines de CI/CD: no disponible en la informacion proporcionada (no hay benchmarks de codigo ni confirmacion de tool calling).
- Agentes y razonamiento multi-paso con llamadas a herramientas: no disponible en la informacion proporcionada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor unicamente documenta pruebas de rendimiento y de integridad.

Prueba de humo de inferencia, RTX PRO 4000 Blackwell (24 GB), salida coherente:

| Metrica | Valor |
|---|---|
| Throughput de prompt | 182,6 t/s |
| Throughput de generacion (sin especulacion) | 20,0 t/s |

Benchmark de decodificacion especulativa MTP (RTX PRO 4000 Blackwell de 24 GB, 3 prompts x 256 tokens, greedy con `temperature 0`, `--spec-type draft-mtp`):

| Cabeza MTP | Gen (t/s) | Aceleracion | Tasa de aceptacion | Media aceptada |
|---|---|---|---|---|
| Sin especulacion | 19,8 | 1,00x | - | - |
| NVFP4 (RTN, 8 pesos) | 40,2 | 2,03x | 72,0% | 3,16/4 |
| Q8_0 (build original) | 41,0 | 2,07x | 73,7% | 3,21/4 |
| Q6_K atencion / Q4_K FFN (este fichero) | 41,3 | 2,09x | 73,7% | 3,21/4 |

El autor indica que `--spec-draft-n-max 3` es el optimo: pedir mas borradores reduce el throughput (4/5/6 borradores: 40,5 / 38,1 / 37,2 t/s) porque la aceptacion cae con la posicion mas rapido de lo que compensan los borradores adicionales.

## Requisitos de hardware

- VRAM estimada para los pesos: 19,74 GB (fichero GGUF Q8mix) mas 885 MB del proyector multimodal, aproximadamente 20,6 GB solo en pesos. Hay que sumar la cache KV, que escala con el contexto configurado; con `-c 262144` la cache resulta muy voluminosa y no cabe, en la practica, en 24 GB.
- GPU verificada por el autor: NVIDIA RTX PRO 4000 Blackwell con 24 GB, donde el modelo se ejecuta con inferencia coherente y los rendimientos indicados.
- Uso nativo de NVFP4: requiere arquitectura NVIDIA Blackwell. En generaciones anteriores el decodificador de llama.cpp tendria que desempaquetar el formato, con impacto en rendimiento no cuantificado en la informacion disponible.
- Cabe en GPU de consumo: no confirmado. El tamano de pesos (20,6 GB) excede la VRAM de las GPU de consumo habituales de 16 GB y queda al limite en tarjetas de 24 GB, donde la ventana de contexto efectiva seria reducida. No se aportan medidas en RTX 4090 ni similares.
- Despliegue: llama.cpp, mediante `llama-server` con `--mmproj` para vision y `--spec-type draft-mtp` para especulacion. El autor invoca `convert_hf_to_gguf.py` y `llama-quantize` en el proceso de construccion. No se documenta compatibilidad con vLLM, TGI, Ollama ni SGLang.
- Latencia y throughput: 182,6 t/s de prompt y 20,0 t/s de generacion sin especulacion; 41,3 t/s de generacion con la cabeza MTP y `--spec-draft-n-max 3` en RTX PRO 4000 Blackwell.
- Parametros de muestreo almacenados en el GGUF: `temperature 1.0`, `top_p 0.95`, `top_k 20`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BroLaurens/Swift-1.5-Qwen3.8-27B-NVFP4-GGUF (esta ficha) | 27,3 B | 262144 tokens | GGUF Q8mix, 19,74 GB, 5,78 BPW; NVFP4 nativo | swift-open-license-1.0 (propietaria) | HuggingFace, 0 descargas y 0 likes en el momento del alta; llama.cpp |
| ukisai/Swift-1.5-Qwen3.8-27b-NVFP4 (modelo base) | 27,3 B (mismo) | no disponible | ModelOpt NVFP4 + FP8 calibrado | swift-open-license-1.0 | HuggingFace; requiere ecosistema NVIDIA/ModelOpt |
| ukisai/Swift-1.5-Qwen3.8-27b | no disponible | no disponible | no disponible | swift-open-license-1.0 | HuggingFace; pesos de referencia |
| unsloth/Qwen3.8-27B-GGUF | no disponible (familia Qwen3.8-27B, Apache 2.0) | no disponible | GGUF (proporciona `MTP/mtp-Qwen3.8-27B-Q4_0.gguf` usado en este build) | Apache 2.0 (Qwen3.8-27B) | HuggingFace; cuantizaciones comunitarias |

No se dispone de datos de calidad comparativos entre estas variantes, por lo que la comparacion se limita a formato, tamano, licencia y disponibilidad.

## Limitaciones y advertencias

- No hay resultados de benchmarks de calidad publicados para este fichero ni para el checkpoint base en la informacion disponible. La verificacion del autor es de integridad de tensores y de rendimiento, no de capacidad del modelo.
- Riesgo de alucinacion: inherente a los modelos generativos; no cuantificado ni mitigado de forma documentada en esta publicacion.
- Sesgos conocidos: no disponibles.
- Idiomas soportados: no declarados; no se puede asumir cobertura multilingue concreta.
- Licencia: el modelo base se distribuye bajo Swift Open License v1.0, marcada como "other" y no como licencia de codigo abierto estandar. Cualquier uso comercial debe revisarse contra el texto de la licencia enlazado por el autor; el componente Qwen3.8-27B si es Apache 2.0.
- Dependencia de hardware: el rendimiento documentado presupone NVFP4 nativo, es decir, NVIDIA Blackwell. En otra arquitectura el comportamiento no esta verificado.
- Contexto frente a VRAM: aunque la ventana declarada es de 262144 tokens, la cache KV a esa longitud no cabe en la GPU de 24 GB usada en las pruebas; los numeros de rendimiento corresponden a ventanas mucho menores.
- Cabeza MTP no original: se injerta desde un GGUF de terceros (`unsloth/Qwen3.8-27B-GGUF`) porque UkisAI no ajusto esa pieza, de modo que la calidad de la especulacion depende de un artefacto ajeno al checkpoint.
- Madurez: el repositorio registra 0 descargas y 0 likes y se creo y actualizo el mismo dia (2026-09-26). Sin adopcion ni validacion externa documentada.
- Conversor fijado a un commit concreto de llama.cpp: puede ser necesario ese commit o posterior para cargar los superbloques NVFP4 correctamente.
- La busqueda web realizada no devolvio ninguna fuente relacionada con el modelo, el autor ni la familia Qwen3.8; los resultados obtenidos trataban de otros temas y se descartan.

## Enlaces

- Ficha en HuggingFace: https://huggingface.co/BroLaurens/Swift-1.5-Qwen3.8-27B-NVFP4-GGUF
- Modelo base (NVFP4): https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b-NVFP4
- Modelo de referencia de UkisAI: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b
- Texto de la licencia Swift Open License v1.0: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b/blob/main/LICENSE
- Fuente de la cabeza MTP: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Commit de llama.cpp usado en la conversion: `2145525a4081d66ff1a87cf43ef809f95a85ac0c` (2026-09-26), repositorio https://github.com/ggml-org/llama.cpp
- Paper, blog o demo del modelo: no disponible en la informacion proporcionada.
- Resultados de busqueda web: no se encontro ningun enlace relevante sobre este modelo.
