# SharkWipf/Swift-1.5-Qwen3.8-Flash-Next-exl3

## Resumen

Swift 1.5 Qwen3.8-Flash-Next (EXL3) es una cuantización no oficial en formato ExLlamaV3 del modelo ukisai/Swift-1.5-Qwen3.8-Flash-Next, un derivado orientado a eficiencia de razonamiento de Qwen3.8-Flash-Next. El trabajo de conversión lo firma SharkWipf (con documentación de "Astra") y se publica como dos ramas cuantizadas de 4,05 y 5,52 bits por peso, ambas con cabecera MTP a 4 bits, torre de visión en FP16 y una tabla de n-gramas compartida de 6 bits que se carga en memoria del sistema. El modelo base es un MoE multimodal de 125.000 millones de parámetros según la documentación pública de Qwen, con arquitectura Qwen4 y atención híbrida GDN + QSA.

El interés de esta ficha esta en que no es un modelo entrenado desde cero, sino una receta de despliegue sobre un checkpoint afinado: el Swift 1.5 de UkisAI reduce los tokens de razonamiento un 63,4% y acelera la generación 1,8x respecto a Qwen3.8-Flash-Next, con una pérdida de precisión declarada inferior al 1% en el modo xhigh. Esta versión EXL3 traduce esas ganancias a un formato que cabe en una GPU profesional de 96 GB manteniendo el contexto nativo completo de 262.144 tokens con caché KV en Q8, visión y MTP activos.

Es relevante ahora porque demuestra que el cuello de botella real de los modelos de razonamiento no es solo el peso de los parámetros, sino el coste de inferencia a contexto largo. La combinación de cuantización EXL3, decodificación especulativa con MTP de longitud 2 y una tabla de n-gramas en RAM permite unos 110-124 tokens/s de decodificación cerca del contexto máximo, con un prefill de 4.466-4.730 tokens/s, cifras medidas sobre hardware Blackwell.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal con atención híbrida GDN + QSA (arquitectura Qwen4), cabecera MTP y torre de visión |
| Parametros totales | 125 000 millones en el modelo base Qwen3.8-Flash-Next (dato de la documentación de Qwen vía Unsloth); no confirmado explícitamente en la model card de esta cuantización |
| Parametros activos | no disponible |
| Longitud de contexto | 262 144 tokens nativos (sin extensión YaRN ni 1M) |
| Tipos de cuantizacion | EXL3 4,05 bpw y EXL3 5,52 bpw; cabecera MTP a 4 bits; torre de visión en FP16; tabla de n-gramas a 6 bits; caché KV en Q8 |
| Idiomas soportados | no disponible (la model card no los enumera) |
| Licencia | swift-open-license-1.0, derivada de Qwen Community License 1.0 (se distribuyen LICENSE, LICENSE-QWEN y NOTICE sin modificar) |
| Formato de pesos | EXL3 de ExLlamaV3, dividido en shards por rama; existen variantes GGUF y GSQ-RCO GGUF del modelo base en el repositorio de UkisAI |

## Arquitectura y entrenamiento

Sobre la arquitectura del modelo base, la documentación pública de Qwen indica que Qwen3.8-Flash-Next introduce mejoras sistemáticas en atención, residual, embedding y optimización, con una atención híbrida GDN + QSA y un tamaño de 125.000 millones de parámetros en configuración MoE multimodal, capaz de procesar imagen y texto y de operar con 75 GB de RAM o memoria unificada sin VRAM de GPU según Unsloth. La model card de esta cuantización confirma los componentes que sobreviven a la conversión: torre de visión en FP16, cabecera MTP (multi-token prediction) y una tabla de n-gramas de 6 bits compartida entre ambas ramas.

El entrenamiento relevante aquí es el de Swift 1.5, el checkpoint base de UkisAI: en lugar de recortar la longitud de razonamiento de forma directa, el equipo identificó los tokens asociados a "sobrepensamiento" patológico y los penalizó, recuperando después precisión mediante RL y OPD (destilación on-policy). El resultado son trazas de razonamiento más cortas y, según el autor, menos errores de sobrepensamiento. Los datos de entrenamiento están publicados en el dataset ukisai/Qwen3.8-27B-multi-turn-agent-sft, aunque la propia card aclara que no se usan en crudo, sino remuestreados y convertidos en entornos de RL. El post-entrenamiento se adaptó específicamente a código y a trabajo agéntico de horizonte largo (agentes personales, uso de terminal, ingeniería de software).

La conversión a EXL3 la realiza ExLlamaV3 v1.5.1 mediante `convert.py` sobre el checkpoint BF16 original, con calibración de 250 muestras de 2048 tokens, libro de códigos `mul1` y los parámetros `-hq -hb 6 -mb 4 -vb 16`. Los pesos se recuantizan, se añaden los metadatos EXL3 y se conservan las licencias de origen.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento explícito, con trazas aproximadamente un 63,4% más cortas que el modelo base.
- Procesamiento de imagen y texto (pipeline `image-text-to-text`), gracias a la torre de visión en FP16 conservada en la cuantización.
- Generación de código: la demo oficial construye un juego 3D endless runner completo y jugable en local.
- Trabajo agéntico de horizonte largo: agentes personales, uso de terminal y tareas de ingeniería de software, según el post-entrenamiento descrito por UkisAI.
- Decodificación especulativa nativa mediante cabecera MTP, con longitud de borrador 2 como valor medido por el autor.
- Especulación adicional basada en tabla de n-gramas de 6 bits, cargada en memoria del sistema.
- Soporte de contexto largo real de hasta 262.144 tokens con caché KV en Q8.
- Soporte multilingüe: no disponible en la información proporcionada.

## Casos de uso

- Agentes de codificación de horizonte largo: el modelo puede mantener tareas de refactorización o implementación de varias horas encadenando pasos, y el contexto de 262.144 tokens permite arrastrar repositorios enteros, logs de CI y el historial de decisiones sin truncar.
- Automatización de terminal y operaciones: con el post-entrenamiento específico para uso de terminal, encaja en agentes que ejecutan comandos, interpretan salidas y corrigen errores de forma iterativa sobre máquinas remotas.
- Asistentes de ingeniería de software en producción: integrable en pipelines de revisión de código y generación de parches, con la ventaja de que las trazas de razonamiento un 63,4% más cortas reducen el coste por petición frente al modelo base.
- Evaluación de interfaz y prototipado visual: al ser multimodal, puede recibir capturas de pantalla o maquetas y generar el HTML/CSS o el código de juego correspondiente, como demuestra la demo del endless runner.
- Procesamiento de documentos largos con imagen: contratos escaneados, informes con gráficos o documentación técnica mixta, aprovechando visión más contexto de 262.144 tokens.
- Investigación sobre eficiencia de razonamiento: la pareja base más cuantización sirve como banco de pruebas para medir cuánto del coste de inferencia proviene del sobrepensamiento y cuánto de la cuantización, con puntos de comparación a 4,05 y 5,52 bpw.
- Servicio self-hosted en una única GPU de 96 GB: con la rama 5,52 bpw se sirve el contexto nativo completo, con visión y MTP, manteniendo la caché KV en Q8, lo que permite ofrecer una API interna sin depender de proveedores externos.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks completos en la informacion disponible: la sección "Evaluation" de la model card no se pudo recuperar íntegra, por lo que no se dispone de cifras de MMLU, HumanEval, GSM8K ni de comparaciones numéricas con modelos similares. Los únicos datos agregados publicados son los siguientes.

| Metrica | Valor declarado |
|---|---|
| Reduccion de tokens de razonamiento frente al base | -63,4% |
| Aceleracion frente al base | 1,8x |
| Perdida de precision frente al base (modo xhigh) | <1% |
| Demo de generacion de juego 3D (modelo base) | 8 min 52 s |
| Demo de generacion de juego 3D (Swift 1.5) | 4 min 56 s |
| Tasa de aceptacion MTP segun longitud de borrador | 78% (MTP1) -> 64% -> 50% -> 38% (MTP4) |
| Rendimiento MTP-2 vs MTP-1 cerca del contexto completo | +7%, con prefill sin cambios |

## Requisitos de hardware

- Rama 4,05 bpw: shards de pesos de 63,90 GiB en VRAM más 36,36 GiB de tabla de n-gramas en RAM del sistema. VRAM máxima registrada: 74.346 MiB con caché KV en Q8.
- Rama 5,52 bpw: shards de pesos de 85,04 GiB en VRAM, misma tabla de n-gramas de 36,36 GiB en RAM. VRAM máxima registrada: 95.988 MiB con caché KV en Q8. Es la mayor build que ejecuta el contexto nativo de 262.144 tokens con visión y MTP en una tarjeta de 96 GB.
- GPU de referencia medida: NVIDIA RTX Pro 6000 Blackwell Max-Q de 96 GB, junto a un Threadripper 5975WX.
- GPU recomendadas: tarjetas profesionales de 96 GB (RTX Pro 6000 Blackwell, H100 80 GB en configuraciones ajustadas, H200) para la rama de 5,52 bpw; para 4,05 bpw se puede intentar con 80 GB, aunque el pico medido de 74,3 GiB deja poco margen.
- GPU de consumo: no cabe en ninguna GPU de consumo actual para el contexto nativo completo. Repartir los shards entre varias RTX 4090 o RTX 5090 sería teóricamente posible por VRAM agregada, pero no está validado por el autor y la tabla de n-gramas exige además unos 36 GiB de RAM.
- Despliegue: ExLlamaV3 (exllamav3) y servidores compatibles con él, como TabbyAPI, son la vía natural para este formato. Para alternativas en hardware más modesto existen los repositorios GGUF y GSQ-RCO GGUF del modelo base, orientados a llama.cpp y derivados. No hay soporte nativo en vLLM ni TGI para el formato EXL3.
- Rendimiento medido con MTP-2 y una secuencia en paralelo: 4.730 tokens/s de prefill y 124 tokens/s de decodificación en 4,05 bpw; 4.466 tokens/s de prefill y 110 tokens/s de decodificación en 5,52 bpw. Las cifras de decodificación corresponden a contexto casi completo. El autor advierte que son n=2 por celda, por lo que son valores por defecto medidos, no un óptimo demostrado.
- Caché KV: a 1M de contexto la caché por sí sola ocuparía unos 17 GiB, y no se admite extensión YaRN ni 1M, así que el techo práctico es el contexto nativo de 262.144 tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| SharkWipf/Swift-1.5-Qwen3.8-Flash-Next-exl3 | 125 000 M (MoE, dato del base) | 262.144 | EXL3 4,05 y 5,52 bpw | swift-open-license-1.0 | Cuantización EXL3 con MTP, visión y tabla de n-gramas; 0 descargas y 0 likes en el momento de la consulta |
| ukisai/Swift-1.5-Qwen3.8-Flash-Next | no disponible | no disponible | BF16 | swift-open-license-1.0 | Checkpoint de referencia; -63,4% tokens de razonamiento y 1,8x de aceleración frente a Qwen3.8-Flash-Next |
| turboderp/Qwen3.8-Flash-Next-exl3 | no disponible | no disponible | EXL3 | Qwen Community License 1.0 | Cuantización EXL3 del modelo base sin el ajuste de eficiencia de Swift |
| ukisai/Swift-1.5-Qwen3.8-Flash-Next-GGUF y GSQ-RCO GGUF | no disponible | no disponible | GGUF, GSQ-RCO GGUF | swift-open-license-1.0 | Alternativas para llama.cpp y hardware con menos VRAM |
| Qwen3.8-Flash-Next (BF16) | 125 000 M (MoE, multimodal) | 262.144 | BF16 | Qwen Community License 1.0 | Base sin comprimir ni cuantizar; punto de partida de toda la cadena |

## Limitaciones y advertencias

- No es un modelo original: es una cuantización EXL3 de terceros. Cualquier limitación de razonamiento, sesgo o alucinación proviene del checkpoint ukisai/Swift-1.5-Qwen3.8-Flash-Next y, en última instancia, de Qwen3.8-Flash-Next.
- La cuantización a 4,05 bpw introduce degradación adicional respecto al BF16 que no está cuantificada en la información disponible; la cifra de "menos del 1% de pérdida" se refiere al paso de base a Swift 1.5 en BF16, no al efecto de EXL3.
- Riesgo de alucinación: no evaluado en la model card. En tareas agénticas con acceso a terminal o ficheros, una alucinación puede traducirse en acciones destructivas, por lo que se recomienda ejecución en sandbox.
- Sesgos conocidos: no documentados en la información disponible. Al heredar el corpus del modelo base, arrastra los sesgos de este.
- Idiomas: la model card no enumera los idiomas soportados. No se debe asumir cobertura multilingüe sin verificarla.
- Contexto: el techo es 262.144 tokens nativos. No hay extensión YaRN ni 1M habilitada, y forzarla elevaría la caché KV a unos 17 GiB solo para el contexto.
- Requisitos de VRAM muy altos: la rama recomendada necesita unos 96 GB de VRAM más 36 GiB de RAM para la tabla de n-gramas, lo que excluye GPUs de consumo.
- Licencia: swift-open-license-1.0 es una licencia derivada de Qwen Community License 1.0. Hay que revisar LICENSE, LICENSE-QWEN y NOTICE antes de cualquier uso comercial; UkisAI ofrece licencias empresariales por separado.
- Madurez y adopción: el repositorio registra 0 descargas y 0 likes, está creado y actualizado el mismo día (25 de septiembre de 2026) y mide 199,2 GB, lo que incluye ambas ramas. Es material recién publicado, sin validación independiente.
- Las mediciones de rendimiento son n=2 por celda, según reconoce el propio autor, y se tomaron sobre un único sistema (RTX Pro 6000 Blackwell Max-Q + Threadripper 5975WX). No deben extrapolarse a otro hardware.
- Soporte de ecosistema limitado: el formato EXL3 solo se ejecuta de forma nativa en ExLlamaV3 y servidores compatibles, no en vLLM ni TGI.

## Enlaces

- HuggingFace (esta cuantización): https://huggingface.co/SharkWipf/Swift-1.5-Qwen3.8-Flash-Next-exl3
- Modelo base de la cuantización: https://huggingface.co/ukisai/Swift-Qwen3.8-Flash-Next
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- GGUF de Swift 1.5: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-Flash-Next-GGUF
- GSQ-RCO GGUF de Swift 1.5: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/ukisai/Qwen3.8-27B-multi-turn-agent-sft
- Cuantización EXL3 del modelo base por turboderp: https://huggingface.co/turboderp/Qwen3.8-Flash-Next-exl3
- Repositorio GitHub de Qwen3.8-Flash-Next: https://github.com/QwenLM/Qwen3.8-Flash-Next
- Guía de ejecución local de Qwen3.8-Flash-Next (Unsloth): https://unsloth.ai/docs/models/qwen3.8-next
- Kit de despliegue EXL3 con decodificación especulativa de MiaAI-Lab: https://github.com/MiaAI-Lab/Qwen3.8-27B-DFlash2-EXL3-5.0bpw
- Sitio de UkisAI: https://ukisai.com
- Página de producto de Swift: https://ukisai.com/products/swift
- Demo jugable del endless runner: https://ukisai.com/swift-games/flash-next
