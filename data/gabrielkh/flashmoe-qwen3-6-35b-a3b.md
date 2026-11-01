# gabrielkh/flashmoe-Qwen3.6-35B-A3B

## Resumen

flashmoe-Qwen3.6-35B-A3B es una distribución empaquetada del modelo Qwen3.6-35B-A3B (Qwen team, Alibaba Cloud) preparada por el desarrollador independiente gabrielkh para ejecutarse en Macs con Apple Silicon y 16 GB de RAM. No se trata de un modelo nuevo: es una cuantización de 4 bits (MLX) del modelo base, acompañada del motor de inferencia flashmoe (Rust + Metal) que permite mantener en memoria solo la parte siempre activa del modelo y tratar el SSD como extensión de la memoria para los 10.240 expertos, cargando por token únicamente los expertos que la red de enrutamiento selecciona.

El modelo base es un transformer de mezcla de expertos (MoE) con 35.000 millones de parámetros totales (el nombre A3B indica aproximadamente 3.000 millones de parámetros activos por token). La relevancia de esta ficha es práctica: demuestra que un MoE de 35B puede correr en hardware de consumo con memoria unificada limitada, manteniendo una salida token a token idéntica al modelo de referencia de 4 bits en su modo Exact, gracias a decodificación especulativa con la cabeza MTP integrada y a una caché adaptativa de expertos que sirve el 97-98 % de las lecturas desde RAM.

La licencia del modelo base es Apache 2.0, pero conviene distinguirla de la de la aplicación flashmoe, que es gratuita pero no de código abierto. El repositorio de HuggingFace actúa como punto de distribución de los pesos cuantizados y de la documentación del motor, no como un modelo entrenado por el autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de mezcla de expertos (MoE) con cabeza de predicción multi-token (MTP) |
| Parámetros totales | 35B (35.000 millones) |
| Parámetros activos | ~3B por token (designación A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 4 bits (MLX, modo Exact); ~3 bits/peso con códec trellis en modo Fast, con el 10 % de expertos más usados a 4 bits |
| Idiomas soportados | en, es, fr, de, it, zh, ja |
| Licencia | Apache 2.0 (modelo base); la app flashmoe es gratuita pero no open source |
| Formato de pesos | MLX 4-bit (descargados de `mlx-community/Qwen3.6-35B-A3B-4bit` y convertidos en el Mac); cabeza MTP desde `Qwen/Qwen3.6-35B-A3B` |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B es un transformer decoder-only con capas de mezcla de expertos: 35B parámetros totales de los que se activan aproximadamente 3B por token, lo que reduce el coste computacional por token a costa de un footprint de memoria elevado. Incluye una cabeza de predicción multi-token (MTP) que el motor flashmoe aprovecha para decodificación especulativa exacta: se proponen varios tokens por paso y se aceptan solo los que preservan la distribución de salida, de modo que el resultado es idéntico al de la decodificación no especulativa.

No se dispone en la información proporcionada de datos sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base. La innovación técnica destacable de esta distribución no está en el entrenamiento sino en el motor de inferencia: caché adaptativa de expertos en memoria unificada que aprende qué expertos usa cada conversación (97-98 % de aciertos en RAM), prefetch predictivo basado en la señal de enrutamiento del propio modelo para traer los expertos de la siguiente capa desde el SSD mientras la GPU sigue ocupada, enrutamiento en GPU y kernels Metal escritos a mano para este modelo y la memoria unificada de Apple. El modo Fast recodifica los expertos con un código trellis a ~3 bits por peso, manteniendo los más usados a 4 bits.

## Capacidades

- Generación de texto en siete idiomas: inglés, español, francés, alemán, italiano, chino y japonés.
- Razonamiento matemático y resolución de problemas verbales (GSM8K).
- Conocimiento general y respuesta a preguntas de opción múltiple (MMLU).
- Generación de código (HumanEval) con ejecución contra tests.
- Tool calling / function calling: el conjunto de evaluación cubre 30 peticiones sobre 8 herramientas en 7 idiomas, incluidas 5 que no deben invocar ninguna herramienta, con 0 llamadas malformadas en modo Exact.
- Modo thinking activable o desactivable a través de la API.
- Servicio local compatible con la API de Ollama (`http://127.0.0.1:11435`) y la API de OpenAI (`http://127.0.0.1:11435/v1`), con streaming y tool calls.
- Ejecución totalmente local y privada: no requiere conexión tras la descarga inicial de pesos.

## Casos de uso

- Asistente de código en local: el modelo resuelve HumanEval con pass@1 del 100 % en la muestra de 50 problemas ejecutada contra los tests, y puede integrarse en el editor o en un pipeline mediante la API compatible con OpenAI que expone el motor en `127.0.0.1:11435/v1`, sin enviar código a servicios externos.
- Automatización de agentes con herramientas: las 30 peticiones de tool calling en 7 idiomas con 0 llamadas malformadas lo hacen adecuado para orquestadores que invocan funciones (calendario, temporizadores, APIs internas) y necesitan formato estricto de argumentos.
- Atención al cliente multilingüe en la UE: cubre español, francés, alemán e italiano además de inglés, chino y japonés, y al ejecutarse en local permite tratar conversaciones con datos personales sin salir del portátil del operador.
- Procesamiento de documentos y extracción de datos en estaciones de trabajo: con 16 GB de RAM y un Mac base se puede desplegar un modelo de 35B para resumir, clasificar o extraer campos de contratos e informes, algo inviable con un modelo denso de ese tamaño en el mismo hardware.
- Prototipado y evaluación de modelos MoE sin GPU dedicada: investigadores pueden medir comportamiento de enrutamiento, calidad de cuantización y decodificación especulativa en Apple Silicon antes de mover cargas a clústeres con A100/H100.
- Docencia y demostraciones de inferencia eficiente: el motor sirve como caso de estudio reproducible de offloading a SSD, caché de expertos y decodificación especulativa exacta sobre memoria unificada.
- Uso offline en entornos con conectividad restringida: tras la descarga inicial de pesos, el modelo funciona sin red, útil en field work, auditorías o entornos air-gapped.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente), decodificación greedy, thinking desactivado, ejecutados a través del motor flashmoe en un Mac.

| Benchmark | Exact 4-bit | Fast (~3 bits) |
|---|---:|---:|
| GSM8K (100 problemas) | 90,0 | 91,0 |
| MMLU (210 preguntas) | 79,5 | 79,5 |
| HumanEval pass@1 (50, contra tests) | 100,0 | 100,0 |
| Tool calling, 7 idiomas (30) | 100,0 | 96,7 |
| Llamadas a herramienta malformadas | 0 | 0 |

Rendimiento de decodificación en un M4 con 16 GB de RAM y SSD de 256 GB, promediado sobre prompts en inglés, código, multilingüe y matemáticas:

| Modo | tok/s | Salida |
|---|---:|---|
| Exact (por defecto) | ~32 | Idéntica token a token a `mlx-community/Qwen3.6-35B-A3B-4bit` |
| Fast | ~40 | Expertos comprimidos (~3 bits/peso), 10 % más usados a 4 bits |
| Streaming SSD simple | ~15 | Idéntica |
| Modelo completo en RAM | — | No cabe en 16 GB |

El único fallo de Fast en tool calling fue una petición de temporizador en japonés que respondió en prosa en lugar de invocar la herramienta.

## Requisitos de hardware

- RAM: 16 GB de memoria unificada es el mínimo anunciado; el modelo completo no cabe en RAM y el motor depende del offloading a SSD.
- Almacenamiento: SSD con espacio para los pesos de 4 bits de Qwen3.6-35B-A3B más la cabeza MTP; el ejemplo de referencia usa un SSD de 256 GB.
- GPU: Apple Silicon (M-series) con Metal; el rendimiento medido corresponde a un M4. No se documentan cifras para M1, M2, M3, M4 Pro/Max ni para GPUs NVIDIA o AMD.
- Cabe en GPU de consumo: sí, en el sentido de que corre en un Mac base de 16 GB; no se proporcionan requisitos para RTX 4090, A100 o H100.
- Despliegue: app flashmoe para macOS 14+ (Rust + Metal); expone API de Ollama y de OpenAI en el puerto 11435. No se documenta soporte para vLLM, llama.cpp, Ollama nativo ni TGI.
- Latencia y throughput: ~32 tok/s en modo Exact y ~40 tok/s en modo Fast en M4 de 16 GB; ~15 tok/s con streaming SSD simple.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| flashmoe-Qwen3.6-35B-A3B | 35B | ~3B | no disponible | Apache 2.0 (base) | HuggingFace + app macOS | Cuantización 4-bit con motor de offloading para Apple Silicon |
| Qwen3.6-35B-A3B (base) | 35B | ~3B | no disponible | Apache 2.0 | HuggingFace | Pesos originales; requiere hardware con memoria suficiente |
| mlx-community/Qwen3.6-35B-A3B-4bit | 35B | ~3B | no disponible | Apache 2.0 | HuggingFace | Referencia de cuantización 4-bit MLX; salida idéntica al modo Exact |
| Modelos densos de ~7B-8B en 4 bits | ~7-8B | densos | no disponible | variable | HuggingFace, Ollama | Caben en 16 GB sin offloading, pero con menor capacidad que un MoE de 35B |

No se dispone de comparativas de rendimiento frente a otros MoE de tamaño similar en la información proporcionada.

## Limitaciones y advertencias

- Los benchmarks son declarados por el autor y no están verificados de forma independiente (`verified: false` en el model-index); las muestras son pequeñas (100 problemas de GSM8K, 210 de MMLU, 50 de HumanEval), por lo que el margen de error es amplio.
- El 100 % en HumanEval sobre 50 problemas no debe extrapolarse a un pass@1 del 100 % en el benchmark completo ni a código de producción sin revisión.
- El modo Fast introduce compresión con pérdida (~3 bits/peso) y ya muestra una degradación medible en tool calling multilingüe (96,7 % frente a 100 %).
- El rendimiento (~32-40 tok/s) está medido en un M4 con 16 GB; en máquinas con menos RAM o SSD más lento el offloading puede degradarse notablemente. No hay cifras para otros chips.
- La longitud de contexto no está documentada en la información disponible; no se debe asumir la del modelo base sin verificarla.
- Riesgo de alucinación inherente al modelo base; no se documentan evaluaciones de factualidad ni de sesgos.
- La app flashmoe es gratuita pero no open source, lo que limita la auditabilidad del motor de inferencia y su uso en entornos con requisitos de software libre.
- La licencia Apache 2.0 cubre los pesos del modelo base, pero el uso comercial de la aplicación flashmoe debe revisarse contra su licencia específica en el repositorio.
- El modelo requiere macOS 14+ y Apple Silicon; no hay soporte documentado para Linux, Windows ni GPUs discretas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la ficha, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/gabrielkh/flashmoe-Qwen3.6-35B-A3B
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Pesos de referencia 4-bit MLX: https://huggingface.co/mlx-community/Qwen3.6-35B-A3B-4bit
- Repositorio de la app flashmoe: https://github.com/GabrielKH/flashmoe-app
- Descarga de la app (releases): https://github.com/GabrielKH/flashmoe-app/releases/latest
- Licencia de la app: https://github.com/GabrielKH/flashmoe-app/blob/main/LICENSE
