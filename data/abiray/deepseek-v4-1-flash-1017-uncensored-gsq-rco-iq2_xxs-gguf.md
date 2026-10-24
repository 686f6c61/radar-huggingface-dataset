# Abiray/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-IQ2_XXS-GGUF

## Resumen

Este repositorio es una compilación GGUF del modelo DeepSeek-V4.1-Flash-1017 publicada por el usuario Abiray, que parte del trabajo de cuantización de ISTA-DASLab y le aplica una eliminación de la dirección de rechazo ("abliteration") de rango 1 en inglés y ruso. El resultado es un modelo de generación de texto sin los rechazos típicos del modelo original, con los 86 tensores que escriben en el flujo residual modificados directamente en los pesos: no requiere adaptadores LoRA en tiempo de ejecución. Se distribuye en 4 shards GGUF con cuantización mixta IQ2_XXS (2,00 bpw) y depende de un fichero Engram aparte en IQ4_NL para funcionar.

El interés técnico está en cómo se ha hecho la edición: se preservan intactas las 28 capas de expertos enrutados en 1 bit (`IQ1_M`) calibradas con GSQ y las dos proyecciones `engram_wkv` en `Q5_K`, de modo que la pérdida de conocimiento declarada es mínima (KL de 0,000002 nats frente al original y 97,0 % de acuerdo top-1 en un vocabulario de 129.280 tokens). El coste en tamaño es de solo +0,34 GB (+0,25 %) sobre el build de ISTA-DASLab.

Es relevante ahora por dos motivos: por un lado, demuestra que la abliteración se puede hornear en pesos cuantizados de muy baja precisión sin requerir infraestructura extra; por otro, el despliegue práctico sigue siendo complicado, porque el backbone (138,58 GB) necesita el fichero Engram (110,60 GB) y llama.cpp todavía no soporta el modo "separate-engram" de DeepSeek 4.1. El modelo es de octubre de 2026 y no tiene descargas ni valoraciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture-of-experts disperso (descrito por fuentes externas como "causal encoder-decoder"); 40 capas y 384 expertos por capa, con 6 activos por token según la documentación de Strata |
| Parámetros totales | 196.613.849.600 (196,6 B) según los metadatos de safetensors del repo; la model card menciona "763B" y una fuente externa cita 552 B para el backbone base. Cifras discrepantes, no verificadas |
| Parámetros activos | Aproximadamente 8 B en entrada y 16 B en salida (fuente externa, no verificada) |
| Longitud de contexto | 1.000.000 tokens según una fuente externa para el modelo base; no verificado para este GGUF |
| Tipos de cuantización | IQ2_XXS (2,00 bpw) mixta: IQ1_M, IQ2_XXS, IQ2_XS, Q5_K, Q6_K y Q8_0, más un fichero Engram auxiliar en IQ4_NL |
| Idiomas soportados | no disponible (la dirección de rechazo ablacionada se calculó en inglés y ruso) |
| Licencia | MIT, según la model card del repo; conviene verificar los términos del modelo base de DeepSeek e ISTA-DASLab |
| Formato de pesos | GGUF, 4 shards de backbone más 1 fichero Engram |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer con mezcla de expertos (MoE) de 40 capas y 384 expertos por capa, de los cuales 6 se activan por token según la documentación de Strata; una fuente externa la describe como "causal encoder-decoder" con 1 M de tokens de contexto y entrada multimodal de texto e imagen, y con 8 B de parámetros activos en entrada y 16 B en salida sobre un backbone de 552 B. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF o DPO del modelo original.

La innovación de esta ficha no está en el entrenamiento, sino en la posproducción de los pesos. ISTA-DASLab cuantizó el modelo con su pipeline GSQ-RCO, preservando las capas de expertos enrutados en 1 bit (`IQ1_M`) y las proyecciones `engram_wkv` en `Q5_K`, y manteniendo según el autor el 100 % de la recuperación en AIME25 y GPQA-D del modelo sin cuantizar. Sobre esa base, Abiray aplica la dirección de rechazo de rango 1 (EN+RU) identificada por AtomicChat únicamente a los 86 tensores que escriben en el residual: 80 tensores densos (`attn_output_b` en `Q6_K`, `ffn_down_shexp` en `Q8_0`/`Q5_K` para las capas 0 a 39) y 6 capas de expertos de 2 bits exactos (`blk.7, 8, 10, 18` en `IQ2_XXS` y `blk.33, 39` en `IQ2_XS`). La verificación reportada cubre 1.008 de 1.008 tensores del backbone y una auditoría de divergencia KL frente al build original.

## Capacidades

- Generación de texto y razonamiento general, heredados del backbone DeepSeek-V4.1-Flash-1017.
- Razonamiento matemático y científico: la model card cita AIME25 y GPQA-D como referencias de las capas GSQ preservadas.
- Generación de código, con la salvedad de que el KL reportado de 0,000002 nats se mide sobre dominios de código, matemáticas y razonamiento.
- Respuestas sin rechazos por contenido: la dirección de rechazo se ha proyectado fuera en los tensores residuales, sin necesidad de LoRA en runtime.
- Soporte de tool calling y de razonamiento multi-paso: no confirmado explícitamente en la información disponible, aunque el modelo base se describe como multimodal y de contexto largo.
- Capacidad multimodal de texto e imagen según una fuente externa sobre el modelo base; no verificada en esta compilación GGUF.
- Capacidades multilingües: no disponibles en la información del repo; la abliteración se calibró en inglés y ruso.
- Modo "thinking" o decodificación especulativa: no disponible.

## Casos de uso

- Red teaming y pentesting autorizado: el modelo permite generar cargas de prueba, escenarios de ataque y prompts adversarios sin los rechazos que limitan a los modelos alineados, integrándolo en un banco de pruebas interno con registro de actividad.
- Análisis de malware e ingeniería inversa: útil para explicar fragmentos de código ofuscado, redactar hipótesis sobre comportamiento de binarios y documentar indicadores, dentro de un flujo de trabajo con revisión humana.
- Investigación sobre alineación y abliteración: sirve como artefacto de comparación frente a ISTA-DASLab y AtomicChat para medir deriva de distribución (KL de 0,000002 nats declarada) y evaluar qué capacidades se conservan al eliminar la dirección de rechazo.
- Generación de código en pipelines internos: con tool calling no confirmado, su uso realista es la autocompletación y refactorización por lotes sobre repositorios privados, donde el filtrado de contenido no aporta valor.
- Escritura creativa y periodística sin fricción: narrativa de ficción con violencia, contenido sensible o temas controvertidos, donde el modelo no bloquea la petición; requiere revisión editorial posterior.
- Extracción de información de documentación extensa: si se confirma la ventana de 1 M de tokens, permite resumir y cruzar referencias en expedientes completos, aunque en esta configuración de 2 bpw el caché KV hace que el contexto práctico sea mucho menor.
- Despliegue en hardware modesto con Strata: según el autor, un único GPU NVIDIA de 12 GB o más puede lanzar el modelo mediante mmap del fichero Engram, lo que habilita pruebas de concepto en estaciones de trabajo sin clúster.

## Benchmarks y rendimiento

| Métrica | Resultado | Contexto |
|---|---|---|
| Divergencia KL media (subespacio de inteligencia) | 0,000002 nats | Frente a ISTA-DASLab IQ2_XXS original |
| Similitud coseno media en subespacio ortogonal de 5.119 D | 0,999609 | Frente al original |
| Acuerdo top-1 / top-5 (vocabulario de 129.280) | 97,0 % / 100,0 % | Frente al original |
| Tensores de backbone verificados | 1.008 / 1.008 | Cabecera y payload GGUF v3 alineados a 32 bytes |
| Capas de expertos GSQ en 1 bit preservadas | 28 / 28 (100 %) | Sin recuantización degradante |
| MMLU (variante abliterada de 1 bit de la familia, 500 preguntas) | 81,8 % frente a 85,6 % del original | Dato de la página de AtomicChat, no específico de este build |
| AIME25 / GPQA-D | no disponible | La model card afirma recuperación del 100 % en las capas GSQ, sin cifras |
| MMLU, HumanEval, GSM8K de este build concreto | no disponible | No publicados en la información proporcionada |

## Requisitos de hardware

- Peso total en disco: 249,2 GB (138,58 GB de backbone en 4 shards más 110,60 GB del fichero Engram IQ4_NL). Los 5 ficheros deben estar en el mismo directorio.
- VRAM para residencia completa: por encima de 250 GB, lo que exige configuraciones multi-GPU (por ejemplo, 4× H100 80 GB o 8× A100 40 GB). No cabe en ninguna GPU de consumo.
- Despliegue con Strata: el autor indica un único GPU NVIDIA de 12 GB o más, apoyándose en mmap del fichero Engram; el rendimiento dependerá del ancho de banda de disco y del subsistema de memoria.
- llama.cpp: el comando proporcionado usa `-ngl 99`, `-lm mmap` y `--lazy-mode on`, pero el propio autor advierte que el soporte de "separate-engram" para DeepSeek 4.1 todavía no está disponible en la rama principal.
- Otras opciones (vLLM, TGI, Ollama, TensorRT-LLM): no disponible en la información proporcionada.
- Latencia y throughput: no disponible. Con cuantización de 2 bpw y mmap, es razonable esperar un throughput bajo y dependiente del almacenamiento, pero no hay mediciones publicadas.
- Caché KV para 1 M de tokens: no disponible el cálculo exacto; en cualquier caso, sería inviable en configuraciones de 12 GB.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / cuantización | Licencia | Notas |
|---|---|---|---|---|---|
| Abiray/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-IQ2_XXS-GGUF | 196,6 B según safetensors (discrepancia con 552 B y 763 B de otras fuentes) | 1 M sin verificar | GGUF IQ2_XXS + Engram IQ4_NL | MIT declarada | Abliteración horneada en 86 tensores, sin LoRA en runtime; 0 descargas |
| ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF | El mismo backbone | 1 M sin verificar | GGUF IQ2_XXS + Engram IQ4_NL | No indicada en la información | Modelo base sin abliterar; referencia de la auditoría KL |
| AtomicChat/DeepSeek-V4.1-Flash-1017-Uncensored-GGUF | El mismo backbone | No disponible | GGUF, variante 2,67 bpw IQ1_M | No indicada en la información | Abliteración aplicada como LoRA en runtime; MMLU 81,8 % frente a 85,6 % del original |
| dealignai/DeepSeek-V4.1-Flash-1017-EXL3-2.9bpw-UNCENSORED | No disponible | 131 K según etiqueta del repo | EXL3, 2,9 bpw | No indicada en la información | Variante uncensored evaluada con MMLU 5-shot sobre 500 preguntas |

## Limitaciones y advertencias

- La abliteración elimina la dirección de rechazo de forma deliberada: el modelo puede producir contenido dañino, ilegal o sexualmente explícito sin filtros. Su uso responsable exige controles externos y un marco legal claro, especialmente en la Unión Europea.
- El riesgo de alucinación no se reduce con la abliteración y probablemente aumenta con la cuantización agresiva: los expertos enrutados están en 1 bit (`IQ1_M`) y las capas de 2 bits son las que concentran la edición.
- Los datos de la familia indican una pérdida medible de conocimiento en variantes de 1 bit: MMLU cae de 85,6 % a 81,8 % (500 preguntas, p = 0,003) en el build de AtomicChat. No hay medición equivalente publicada para este build concreto.
- Discrepancia no resuelta en el número de parámetros (196,6 B en safetensors frente a 552 B y 763 B en fuentes textuales). Cualquier estimación de hardware debe validarse contra el tamaño real de los ficheros.
- Idiomas soportados no documentados; la calibración de la dirección de rechazo solo en inglés y ruso deja sin garantías el comportamiento en castellano.
- Contexto de 1 M sin verificar y, en la práctica, inalcanzable con esta configuración de memoria; el caché KV para ventanas largas no cabe en 12 GB.
- Dependencia de un fichero Engram externo de 110,60 GB: sin él, el modelo no funciona, y el soporte de llama.cpp para este modo sigue pendiente.
- Estado del proyecto: 0 descargas y 0 valoraciones, creado el 24 de octubre de 2026. No hay validación independiente de los checksums ni de la auditoría KL más allá de lo declarado por el autor.
- La licencia se declara como MIT, pero los pesos derivan de DeepSeek e ISTA-DASLab; conviene revisar los términos del modelo base antes de un uso comercial.
- No se documentan sesgos específicos del modelo base en la información disponible.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Abiray/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-IQ2_XXS-GGUF
- Modelo base (ISTA-DASLab): https://huggingface.co/ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF
- Abliteración de referencia (AtomicChat): https://huggingface.co/AtomicChat/DeepSeek-V4.1-Flash-1017-Uncensored-GGUF
- Variante EXL3 uncensored (dealignai): https://huggingface.co/dealignai/DeepSeek-V4.1-Flash-1017-EXL3-2.9bpw-UNCENSORED
- Documentación de Strata para DeepSeek 4.1: https://github.com/Niko1221/Strata/blob/main/docs/DEEPSEEK41.md
- Repositorio de Strata: https://github.com/Niko1221/Strata
- Ficha del modelo base en AI Model Radar: https://aimodelradar.app/models/deepseek-v4-1-flash-1017
- Guía de abliteración de DeepSeek Flash 1017: https://abliteration.ai/abliterated-deepseek-flash-1017
- DeepSeek AI (organización): https://github.com/deepseek-ai
