# MD-Mushfiqur123/DropLychee-3.8-27B

## Resumen

DropLychee-3.8-27B es un modelo de lenguaje causal publicado en HuggingFace por MD-Mushfiqur123, con 26.895.998.464 parámetros (26,9B) y una arquitectura híbrida que combina 48 capas de atención lineal Gated DeltaNet con 16 capas de atención completa. Se presenta como un finetune del modelo base Qwen/Qwen3.8-27B y declara una ventana de contexto de 262.144 tokens (256K), vocabulario de 248.320 tokens y un hidden dimension de 5.120.

El modelo se distribuye bajo licencia Apache 2.0 y con pesos en BF16 sin cuantizar, según afirma el autor. Requiere `trust_remote_code=True` y código personalizado (`model_type: droplychee_text`, clases `DropLycheeDecoderLayer` y `DropLycheeGatedDeltaNet`), lo que implica ejecutar código publicado por el autor y limita la compatibilidad con herramientas de inferencia estándar.

La relevancia de esta ficha es limitada y debe interpretarse con cautela: el repositorio no tiene descargas ni "likes", no publica resultados de benchmarks, no declara idiomas soportados y sus afirmaciones de arquitectura no están verificadas de forma independiente. Está orientado a experimentación con arquitecturas híbridas de atención lineal y a escenarios de contexto muy largo, no a producción sin validación previa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida: 48 capas de atención lineal Gated DeltaNet + 16 capas de atención completa (transformer denso), con GQA (24 cabezas de consulta / 4 de clave-valor) |
| Parámetros totales | 26.895.998.464 (26,9B) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 262.144 tokens (256K), según la model card |
| Tipos de cuantización | No disponible; el autor indica que distribuye únicamente pesos BF16 sin cuantizar |
| Idiomas soportados | No disponible (el ejemplo de la model card usa una instrucción en bengalí) |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (la model card no especifica safetensors, GGUF ni otro formato) |
| Número de capas | 64 (48 de atención lineal + 16 de atención completa, patrón 1:4) |
| Hidden dimension | 5.120 |
| Intermediate size | 17.408 |
| Tamaño de vocabulario | 248.320 tokens |
| Precisión de entrenamiento | BF16 de 16 bits sin cuantizar (afirmación del autor) |
| Hardware de entrenamiento | 1× NVIDIA RTX PRO 6000 Blackwell (94,97 GiB de VRAM) |
| Modelo base declarado | Qwen/Qwen3.8-27B |
| Tipo de modelo | droplychee_text (código personalizado, requiere trust_remote_code) |

## Arquitectura y entrenamiento

La arquitectura declarada es un decodificador causal híbrido de 64 capas: 48 capas emplean Gated DeltaNet, un mecanismo de atención lineal con estado recurrente, y 16 capas emplean atención completa (full attention) con un patrón de intercalado 1:4. La atención usa GQA con 24 cabezas de consulta y 4 cabezas de clave-valor. El hidden dimension es 5.120 y el intermediate size de las capas feed-forward es 17.408. La motivación típica de este diseño es reducir el coste de memoria y cómputo del caché de clave-valor en secuencias muy largas, manteniendo unas pocas capas de atención completa para preservar la capacidad de recuperación exacta de información; sin embargo, la model card no aporta mediciones que respalden esa ventaja.

No hay información disponible sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF, DPO u otras técnicas de alineamiento, ni sobre si el finetune se realizó por supervisión completa o con métodos de bajo rango. El autor menciona que el modelo se entrenó con precisión BF16 "pura" y sin cuantización, y su model card incluye afirmaciones de marketing ("sovereign architecture", "The Sacred /truth Law") que no son verificables con los datos publicados. Las clases personalizadas (`DropLycheeDecoderLayer`, `DropLycheeGatedDeltaNet`) indican una implementación propia que se desvía de las arquitecturas estándar de transformers.

## Capacidades

- Generación de texto causal: el pipeline declarado es `text-generation`, con plantilla de prompt estilo ChatML (`<|im_start|>user ... <|im_end|>`).
- Contexto largo: ventana declarada de 262.144 tokens, teóricamente útil para documentos extensos, aunque no se aportan pruebas de recuperación de información a esa distancia.
- Atención lineal: 48 de las 64 capas usan Gated DeltaNet, lo que en teoría reduce el coste por token en secuencias largas.
- Soporte de tool calling / function calling: no disponible (no se documenta ningún formato de herramientas ni plantilla específica).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se documenta modo de pensamiento, planificación ni bucle de herramientas).
- Capacidades multilingües: no disponible; el único ejemplo de uso de la model card está redactado en bengalí, pero no se declara el conjunto de idiomas.
- Capacidades especiales (visión, audio, thinking mode): no disponibles.
- Ejecución mediante `transformers` con `trust_remote_code=True` y `torch_dtype=torch.bfloat16`.

## Casos de uso

- Análisis de documentación legal o contractual extensa: con 262.144 tokens de contexto declarados, se podría cargar un expediente completo y pedir resúmenes, extracción de cláusulas o comparación entre versiones, evitando pipelines de troceado y recuperación. Requiere validar antes la calidad real de atención en contextos largos.
- Investigación en arquitecturas híbridas de atención lineal: el modelo permite experimentar con el comportamiento de Gated DeltaNet frente a atención completa en tareas de recuperación de información (needle-in-haystack) y comparar coste de memoria por token.
- Base para fine-tuning propio: al ser un modelo denso de 26,9B con licencia Apache 2.0, una organización puede adaptarlo a un dominio concreto (por ejemplo, documentación técnica interna) sin las restricciones de licencias de otros modelos de tamaño similar.
- Despliegue on-premise con requisitos de soberanía de datos: el modelo puede alojarse íntegramente en infraestructura propia, sin llamadas a APIs externas, en escenarios donde los datos no pueden salir de la organización.
- Generación y revisión de código en flujos internos: se podría integrar en herramientas de revisión de parches o generación de tests, siempre que se valide su rendimiento en código, ya que no hay benchmarks publicados y no se documenta soporte de tool calling para integrarlo en pipelines de CI/CD.
- Resumen de corpus científicos o técnicos: para condensar conjuntos de artículos o informes largos en un único paso, aprovechando la ventana declarada y la reducción teórica de coste por token de las capas de atención lineal.
- Prototipado de asistentes conversacionales multi-turno: con la plantilla ChatML documentada se puede construir un asistente conversacional; la calidad multilingüe y el comportamiento en diálogos largos quedan por evaluar.
- Experimentación académica y reproducibilidad: el repositorio permite inspeccionar la implementación personalizada de las capas DeltaNet, útil para grupos que estudien alternativas a la atención cuadrática.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K, MT-Bench ni evaluaciones de contexto largo, y el repositorio no registra descargas ni evaluaciones de la comunidad. Tampoco hay datos de latencia o throughput declarados por el autor.

## Requisitos de hardware

- Peso de los pesos en BF16: aproximadamente 53,8 GB solo para los parámetros (26,9B × 2 bytes), calculado a partir del recuento de parámetros; hay que sumar caché y activaciones.
- GPU de referencia del autor: 1× NVIDIA RTX PRO 6000 Blackwell con 94,97 GiB de VRAM, suficiente para los pesos en BF16 y margen para contexto.
- GPU de centro de datos: H100 80 GB y A100 80 GB pueden alojar los pesos en BF16 en una sola tarjeta, con margen reducido para secuencias muy largas; configuraciones multi-GPU (2× A100 80 GB, 2× H100) dan más holgura para el contexto de 256K.
- GPU de consumo: en BF16 los pesos (~54 GB) no caben en una RTX 4090 (24 GB) ni en una RTX 3090 (24 GB). No se han publicado cuantizaciones (GGUF, AWQ, GPTQ, FP8), por lo que no se puede confirmar su ejecución en hardware de consumo.
- Opciones de despliegue: la única ruta documentada es `transformers` con `trust_remote_code=True` (el ejemplo usa `AutoModelForCausalLM` con `device_map="auto"`). No hay confirmación de soporte en vLLM, llama.cpp, Ollama, TGI ni SGLang, y la arquitectura personalizada hace probable que no funcionen sin adaptaciones.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Los datos de los modelos alternativos proceden de conocimiento general y no han podido verificarse con la información de búsqueda disponible en esta ficha; se marcan como no verificados.

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Estado |
|---|---|---|---|---|---|
| DropLychee-3.8-27B | 26,9B | 262.144 tokens (declarado) | Híbrida Gated DeltaNet + atención completa | Apache 2.0 | Publicado; 0 descargas, 0 likes, sin benchmarks |
| Qwen/Qwen3.8-27B | No disponible | No disponible | No disponible | No disponible | Modelo base declarado; no verificado en la información disponible |
| Qwen3-32B | ~32,8B (no verificado) | 128K nativo (no verificado) | Transformer denso | Apache 2.0 (no verificado) | Ampliamente desplegado, con benchmarks públicos |
| Gemma-2-27B | ~27B (no verificado) | 8K (no verificado) | Transformer denso | Licencia Gemma (no verificada) | Ampliamente desplegado, con benchmarks públicos |

No se dispone de una comparación de rendimiento fiable porque DropLychee-3.8-27B no publica ningún resultado de evaluación.

## Limitaciones y advertencias

- Ausencia total de validación externa: 0 descargas y 0 likes en el momento de redactar la ficha, sin evaluaciones independientes ni benchmarks publicados.
- `trust_remote_code=True` es obligatorio: ejecutar el modelo implica descargar y ejecutar código Python del autor, con el riesgo de seguridad que ello conlleva en entornos de producción.
- Arquitectura personalizada: la integración con vLLM, llama.cpp, Ollama, TGI u otros servidores no está confirmada, lo que dificulta el despliegue escalable y el batching continuo.
- Modelo base no verificado: la model card declara Qwen/Qwen3.8-27B como base, pero no se ha podido confirmar la existencia ni las características de ese repositorio con la información disponible.
- Datos de entrenamiento desconocidos: no se especifican tokens, composición del dataset ni procesos de alineamiento, por lo que los sesgos y el riesgo de alucinación son indeterminados.
- Idiomas no declarados: no se puede asumir un rendimiento multilingüe fiable; el ejemplo de la model card está en bengalí y no hay evaluación al respecto.
- Contexto declarado sin evidencia: los 262.144 tokens son una especificación del autor, sin pruebas de recuperación a larga distancia publicadas.
- Posible inconsistencia de configuración: con hidden dimension 5.120 y 24 cabezas de consulta, la dimensión por cabeza no sería un entero; la model card no especifica `head_dim`, lo que dificulta verificar la configuración.
- Coste de despliegue elevado: ~54 GB en BF16 solo para pesos, sin cuantizaciones publicadas que permitan ejecutarlo en GPUs de consumo.
- Licencia Apache 2.0: permite uso comercial y modificaciones, pero no hay garantías del autor sobre el origen de los datos de entrenamiento ni sobre el cumplimiento de derechos de terceros.
- Afirmaciones de marketing no verificables: expresiones como "sovereign architecture" o "The Sacred /truth Law" no aportan garantías técnicas y deben ignorarse a efectos de evaluación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MD-Mushfiqur123/DropLychee-3.8-27B
- Visor interactivo de la arquitectura (mencionado en la model card): https://hfviewer.com/MD-Mushfiqur123/DropLychee-3.8-27B
- Perfil de GitHub del autor: https://github.com/MD-Mushfiqur123
- Modelo base declarado: https://huggingface.co/Qwen/Qwen3.8-27B
- Resultados de la búsqueda web: no contienen enlaces relevantes sobre este modelo (las referencias recuperadas tratan sobre abreviaturas de "millón" y "millar" en francés).
