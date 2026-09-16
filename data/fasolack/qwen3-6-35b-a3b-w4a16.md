# fasolack/Qwen3.6-35B-A3B-W4A16

## Resumen

`fasolack/Qwen3.6-35B-A3B-W4A16` es una cuantización de solo pesos a int4 (W4A16) del modelo multimodal `Qwen/Qwen3.6-35B-A3B`, publicada por el usuario fasolack. No es un modelo entrenado desde cero: es una conversión de precisión reducida generada con Intel AutoRound y empaquetada en formato compressed-tensors para ejecutarse directamente en vLLM. Su rasgo diferencial es que la calibración se ha realizado sobre datos de tool calling (45%) y de código (35%), en lugar de texto web genérico, con el objetivo de preservar el comportamiento del modelo en esos dos dominios.

El modelo base es un MoE multimodal híbrido que combina 30 capas de atención lineal GatedDeltaNet con 10 capas de atención completa, 256 expertos por capa con enrutado top-8, una torre de visión y una cabeza de predicción multi-token (MTP). Declara aproximadamente 36.000 millones de parámetros totales y unos 3.000 millones activos por token, con una ventana de contexto de 262.144 tokens. La versión cuantizada ocupa unos 21 GB de pesos y está pensada para servirse en dos GPU de 24 GB (RTX 3090) con tensor parallelism 2.

Su relevancia práctica es doble: baja el coste de despliegue de un modelo multimodal de contexto muy largo a hardware de gama profesional de consumo, y publica estadísticas medidas de cobertura de expertos (`expert_coverage.json`), algo poco habitual en cuantizaciones de MoE. Como contrapartida, el repositorio no incluye resultados de benchmarks y no cuenta con descargas ni validación externa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE multimodal híbrida: 30 capas de atención lineal GatedDeltaNet + 10 capas de atención completa, 256 expertos por capa con enrutado top-8, torre de visión y cabeza MTP |
| Parámetros totales | ~36.000 millones según la model card del autor; los metadatos safetensors del repositorio declaran 5.954.701.156 (recuento sobre pesos empaquetados en int4) |
| Parámetros activos | ~3.000 millones por token |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantización | int4 W4A16 (pesos int4, activaciones BF16), grupo de tamaño 128, simétrico; GPTQ / AutoRound con reconstrucción por bloques SignRound |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato compressed-tensors (`pack-quantized`), autodetectado por vLLM |

Nota sobre el recuento de parámetros: la discrepancia entre los ~36.000 millones declarados en la model card y los 5.954.701.156 registrados en safetensors no está explicada por el autor. Lo más probable es que el recuento de HuggingFace refleje las formas empaquetadas de los tensores int4, pero es una suposición no confirmada.

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer híbrido de atención lineal y completa. De las 40 capas totales, 30 emplean GatedDeltaNet (atención lineal con estado recurrente de tamaño fijo) y 10 mantienen atención completa con caché KV. Cada capa dispone de 256 expertos con enrutado top-8, más un experto compartido siempre activo. El modelo incorpora además una torre de visión (pipeline `image-text-to-text`) y una cabeza de predicción multi-token. La ventana de contexto es de 262.144 tokens.

Sobre esta base, el autor aplica una cuantización de solo pesos a int4 con Intel AutoRound (arXiv:2309.05516, reconstrucción por bloques SignRound), grupo 128 y esquema simétrico, sobre las capas `Linear` del decodificador de lenguaje, incluidas las 30.720 matrices de expertos. Las activaciones permanecen en BF16. La calibración usa 1.024 muestras de 2.048 tokens con 100 iteraciones de ajuste y semilla 42: 45% tool calling (`NousResearch/hermes-function-calling-v1`), 35% código (`ise-uiuc/Magicoder-OSS-Instruct-75K`) y 20% general (`NeelNanda/pile-10k`). Las muestras de tool calling se renderizan con la plantilla de chat propia del modelo y las llamadas JSON estilo Hermes se reescriben al estilo XML de Qwen, de forma que el texto de calibración contiene los mismos tokens que el modelo emite en inferencia. El número de iteraciones se redujo de 200 a 100 por límite de tiempo de cómputo (la extrapolación daba ~23 h frente a un presupuesto de ~12 h).

Se mantienen en BF16 varios componentes críticos: el router MoE (`mlp.gate`, uno por capa), las proyecciones de control de recurrencia `linear_attn.in_proj_a` / `in_proj_b` de las 30 capas GatedDeltaNet, la puerta del experto compartido (`mlp.shared_expert_gate`), la torre de visión (`visual.*`, que vLLM exige en BF16), la cabeza MTP (`mtp.*`) y el `lm_head` (embedding de salida no atado, vocabulario 248.320 × 2.048). El autor advierte de que la lista de exclusión se pasa como expresiones regulares a `layer_config` de AutoRound, por lo que un patrón glob con `*` inicial no coincidiría con nada y cuantizaría la capa igualmente.

## Capacidades

- Generación de texto conversacional en inglés.
- Tool calling / function calling: la calibración dedica un 45% del presupuesto a este dominio y el modelo base usa un formato XML propio para las llamadas.
- Generación de código: 35% de la calibración proviene de un dataset de instrucciones de código.
- Entrada de imagen y texto (pipeline `image-text-to-text`), con torre de visión mantenida en BF16.
- Contexto largo: 262.144 tokens, con coste de caché KV reducido al mantener caché solo 10 de las 40 capas.
- Decodificación multi-token mediante la cabeza MTP incluida en el modelo.
- Enrutado MoE eficiente: 8 de 256 expertos por capa, con ~3.000 millones de parámetros activos por token.
- Modo de razonamiento explícito (thinking mode): no disponible en la información proporcionada.
- Capacidades de audio: no disponibles.
- Idiomas distintos del inglés: no disponibles (la model card solo declara `en`).

## Casos de uso

- Agentes con tool calling en producción: el modelo puede generar llamadas a funciones en formato XML de Qwen y encadenar varios pasos, con la ventaja de que la cuantización se ha calibrado específicamente sobre trazas de function calling, lo que reduce la degradación de ese comportamiento frente a una calibración genérica.
- Asistentes de código integrados en el IDE: con 35% de calibración procedente de instrucciones de código y contexto de 262.144 tokens, permite trabajar sobre repositorios completos sin trocear en exceso, manteniendo coherencia entre archivos.
- Atención al cliente multi-turno: la ventana de contexto larga y el bajo coste de caché KV (solo 10 capas con caché, ~10 KiB/token en fp8) hacen viable mantener conversaciones e historiales extensos sin disparar el consumo de memoria.
- Procesamiento de documentos con imagen y texto: al aceptar entradas image-text-to-text, sirve para extraer y resumir información de capturas, formularios o diagramas combinados con instrucciones textuales.
- Despliegue on-premise con dos GPU de 24 GB: encaja en configuraciones TP=2 sobre RTX 3090 o equivalente, lo que permite ofrecer inferencia privada sin depender de API externas.
- Pipelines de CI/CD con generación y revisión de código: puede integrarse como servicio vLLM y exponerse vía API compatible con OpenAI para tareas de autocompletado, revisión de diffs o generación de tests.
- Extracción estructurada de datos: el soporte de tool calling con esquemas permite forzar salidas JSON/XML válidas a partir de texto libre o de imágenes, útil en procesos ETL.
- Evaluación y experimentación con MoE cuantizados: el archivo `expert_coverage.json` con histogramas por capa permite estudiar cómo afecta la calibración de dominio a la distribución de enrutado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio incluye la etiqueta `eval-results`, pero la model card no presenta ninguna tabla de MMLU, HumanEval, GSM8K ni métricas equivalentes, ni comparaciones numéricas con otras cuantizaciones del mismo modelo.

La única medición objetiva publicada es la cobertura de expertos durante la calibración (medida sobre 128 muestras, contando impactos de enrutado top-8 por par capa-experto):

| Métrica de cobertura | Valor |
|---|---|
| Expertos por debajo de 100 impactos de enrutado | 0,19% (19 de 10.240 pares capa-experto) |
| Mediana de impactos por experto | 7.050 |
| Mínimo de impactos en cualquier capa | 14 |

Estos datos describen la distribución del enrutado durante la calibración, no la calidad del modelo, y no deben interpretarse como una métrica de rendimiento.

## Requisitos de hardware

- Peso de los pesos cuantizados: ~21 GB, y 22,0 GB de tamaño total del repositorio.
- VRAM estimada para inferencia: cabe en 2 GPU de 24 GB con tensor parallelism 2; el autor indica que se construyó y sirvió sobre RTX 3090.
- GPU recomendadas: cualquier NVIDIA Ampere o posterior, ya que el kernel Marlin int4 requiere ese nivel de arquitectura. El autor cita RTX 3090 como plataforma de referencia; A100, H100, L40S o RTX 4090 son compatibles por arquitectura, aunque no se aportan medidas específicas sobre ellas.
- Cabe en GPU de consumo: sí, en dos RTX 3090 (o equivalentes de 24 GB) mediante TP=2. No se documenta si cabe en una sola GPU de 24 GB.
- Caché KV: solo 10 de las 40 capas mantienen caché, con 2 cabezas KV y head_dim 256, lo que supone ~20 KiB/token en fp16 y ~10 KiB/token en fp8. El contexto completo de 262.144 tokens ocupa aproximadamente 2,6 GB con `--kv-cache-dtype fp8`. Las 30 capas restantes usan estado recurrente de tamaño fijo independiente de la longitud de secuencia.
- Opciones de despliegue: vLLM, que autodetecta el formato compressed-tensors sin necesidad de pasar `--quantization`. Soporte en llama.cpp, Ollama, TGI u otros motores: no disponible en la información proporcionada.
- Latencia y throughput: no disponibles como cifras medidas. El autor señala cualitativamente que la decodificación está limitada por ancho de banda sobre los ~3.000 millones de parámetros activos, no sobre los 36.000 millones totales, por lo que debería ser más rápida que un modelo denso de calidad similar.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Qwen/Qwen3.6-35B-A3B` (base, BF16) | ~36B totales / ~3B activos | 262.144 | BF16 | Apache 2.0 | HuggingFace |
| `fasolack/Qwen3.6-35B-A3B-W4A16` | ~36B totales / ~3B activos (recuento safetensors: 5.954.701.156) | 262.144 | int4 W4A16, grupo 128, AutoRound | Apache 2.0 | HuggingFace |
| Otras cuantizaciones int4 del mismo modelo base | mismos | 262.144 | int4 (calibración genérica) | Apache 2.0 (heredada) | no disponible (no se detallan en la información) |

El autor afirma explícitamente que esta compilación se diferencia de otras cuantizaciones de 4 bits del mismo modelo en dos puntos: la calibración orientada a tool calling y código en lugar de texto web genérico, y la publicación de estadísticas de cobertura de expertos. No se aportan identificadores, cifras de rendimiento ni comparaciones cuantitativas con esas alternativas, por lo que la comparación no puede cerrarse con datos objetivos. Tampoco se dispone de datos de modelos de otros fabricantes con arquitectura, tamaño o tarea equivalentes.

## Limitaciones y advertencias

- Idiomas: la model card solo declara inglés (`en`). No hay evidencia de calidad en castellano ni en otros idiomas.
- Riesgo de alucinación: inherente al modelo base y no cuantificado; no se han publicado evaluaciones de fidelidad ni de tasa de alucinación.
- Sesgos: la calibración usa tres datasets concretos (Hermes function calling, Magicoder y pile-10k), lo que puede introducir sesgos de dominio y de estilo hacia el formato de tool calling y de código.
- Cobertura de expertos desigual: un 0,19% de los pares capa-experto recibe menos de 100 impactos de enrutado, con un mínimo de 14 en alguna capa. Esos expertos reciben poco ajuste durante la cuantización. El autor acota el impacto práctico porque también reciben poco tráfico en inferencia, pero es un efecto real de cualquier MoE calibrado por dominio.
- Calibración reducida: finalmente se usaron 100 iteraciones de ajuste en lugar de las 200 previstas, por restricciones de tiempo de cómputo. El propio autor lo documenta como un compromiso.
- Requisito de hardware: el kernel Marlin int4 exige GPU NVIDIA Ampere o posterior. No se ha confirmado funcionamiento en hardware anterior.
- Confusión en la lista de exclusión BF16: el autor advierte de que AutoRound interpreta `layer_config` como expresiones regulares, de modo que un patrón glob con `*` inicial no coincide con nada y la capa se cuantiza igualmente. Cualquier reproducción del proceso debe tenerlo en cuenta.
- Restricciones de licencia: los pesos se publican bajo Apache 2.0, lo que permite uso comercial, pero el modelo base y los datasets de calibración tienen sus propias condiciones, que conviene verificar por separado.
- Falta de validación externa: el repositorio registra 0 descargas y 0 likes, y no se han publicado benchmarks ni evaluaciones independientes.
- Discrepancia en el recuento de parámetros: el dato de safetensors (5.954.701.156) no coincide con los ~36.000 millones declarados en la model card. No hay explicación del autor.
- Fecha de publicación: el repositorio está fechado en septiembre de 2026, posterior al conocimiento general disponible sobre la familia Qwen, por lo que no se puede contrastar la existencia del modelo base con fuentes externas.

## Enlaces

- Repositorio del modelo: https://huggingface.co/fasolack/Qwen3.6-35B-A3B-W4A16
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Intel AutoRound (repositorio): https://github.com/intel/auto-round
- Paper de AutoRound: https://arxiv.org/abs/2309.05516
- compressed-tensors (repositorio): https://github.com/neuralmagic/compressed-tensors
- Dataset de calibración (tool calling): https://huggingface.co/datasets/NousResearch/hermes-function-calling-v1
- Dataset de calibración (código): https://huggingface.co/datasets/ise-uiuc/Magicoder-OSS-Instruct-75K
- Dataset de calibración (general): https://huggingface.co/datasets/NeelNanda/pile-10k
- Archivo de cobertura de expertos: `expert_coverage.json` dentro del repositorio del modelo

Nota: la búsqueda web realizada no devolvió ningún enlace relevante sobre este modelo ni sobre su modelo base; los resultados obtenidos correspondían a páginas genéricas de ChatGPT y no se han incluido.
