# roman220220/gemma-4-26B-A4B-it-gptq-mlx-jang

## Resumen

Este repositorio contiene una cuantización comunitaria del modelo multimodal google/gemma-4-26B-A4B-it, publicada por el usuario roman220220 bajo licencia Apache 2.0. Se trata de una variante Mixture-of-Experts (MoE) de Gemma 4 con 128 expertos y enrutamiento top-8, unos 26,5B parámetros totales según el autor (27.802.119.758 parámetros reales medidos en los safetensors) y aproximadamente 4B parámetros activos por token, de ahí la nomenclatura "A4B". El modelo procesa texto e imágenes y genera texto (pipeline image-text-to-text).

El valor principal del artefacto es la receta de cuantización: una mezcla de precisión por rol aplicada con MLX y corrección de error estilo GPTQ basada en Hessiana, que reduce el checkpoint de 51,6 GB en bf16 a unos 15,6 GB, un factor de 3,4x, sin dejar ningún tensor en bf16. Las proyecciones de atención y los embeddings quedan en 8 bits, mientras que el MLP denso y los 128 expertos enrutados se cuantizan a 4 bits. El router se deja intacto por su sensibilidad.

Es relevante ahora porque permite ejecutar un MoE multimodal de ~27B parámetros en hardware Apple Silicon con memoria unificada moderada, algo inviable con el checkpoint original en bf16. La contrapartida es que requiere un fork específico de mlx-lm y que el soporte de entrada de imagen aún exige un bucle de generación manual. El modelo no incluye torre de audio: la configuración de audio es nula en el checkpoint original, por lo que solo cubre texto y visión.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (texto + visión); 30 capas decodificadoras con ruta densa y ruta de expertos en paralelo |
| Parametros totales | 27.802.119.758 (según safetensors); el autor indica ~26,5B |
| Parametros activos | ~4B por token (128 expertos, top-8) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GPTQ 8 bits en atención (texto y visión); GPTQ 4 bits en MLP denso y 128 expertos; RTN 8 bits en embeddings; router sin cuantizar; group-size 64 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato MLX), librería mlx |
| Tamaño del repositorio | 15,6 GB (frente a 51,6 GB en bf16) |
| Fecha de publicación | 2026-09-23 |

## Arquitectura y entrenamiento

La arquitectura de Gemma 4 26B-A4B es un transformer híbrido denso+MoE: cada una de las 30 capas del decodificador calcula simultáneamente una ruta MLP densa y una ruta de expertos enrutados, combinadas de forma aditiva sobre el residual previo al MLP denso. El router opera sobre ese residual y selecciona 8 de los 128 expertos por capa. El componente de visión añade una torre propia con su MLP de anchura intermedia 4304, un valor que no es divisible por ninguno de los group-size soportados por `mx.quantize` (32/64/128). El checkpoint cuantizado resuelve esto rellenando con ceros `gate/up/down_proj` hasta 4352 (siguiente múltiplo de 64), una operación matemáticamente exacta porque GELU(0)·0 = 0 y las columnas correspondientes de `down_proj` tienen peso cero. La anchura rellenada se declara en `config.json` (`vision_config.intermediate_size`), de modo que el modelo se construye directamente con ese tamaño sin tocar el código de inferencia.

No se dispone de información sobre el entrenamiento original (número de tokens, composición del dataset, uso de RLHF o DPO), ya que esta ficha describe una cuantización, no un entrenamiento. Lo que sí está documentado es el proceso de cuantización: GPTQ con corrección de error Hessiana sobre cada capa Linear cuantizable, calibrado con `--group-size 64` usando prompts de texto diversos para el modelo de lenguaje y fotografías reales de COCO para la torre de visión. Destaca el tratamiento de los expertos: el módulo `Gemma4TextExperts` consume tensores `nn.Parameter` apilados de forma `[128, out, in]` dentro de un bucle Python en lugar de submódulos `nn.Linear`, por lo que la calibración engancha el módulo completo, replica el `expert_mask`/`token_idx` real para agrupar las filas de calibración por experto y ejecuta GPTQ por lotes sobre los 128 expertos a la vez. La entrada de calibración de `down_proj` se recalcula como `act_fn(gate)*up` usando el `gate_up_proj` real sin corregir, igual que en el forward auténtico.

## Capacidades

- Generación de texto conversacional multi-turno mediante plantilla de chat (`apply_chat_template`).
- Razonamiento con modo de pensamiento (thinking mode) de Gemma 4, según validación del autor.
- Comprensión de imágenes (image-text-to-text): la torre de visión y la fusión multimodal están operativas tras la cuantización.
- Respuestas factuales y de razonamiento verificadas de extremo a extremo por el autor sobre el checkpoint cuantizado.
- Capacidad de código y matemáticas: presumible por la familia Gemma 4 según la documentación de Google, aunque no se aportan evaluaciones específicas de esta cuantización.
- Sin soporte de audio: `audio_config` es nulo en el checkpoint, a diferencia del hermano E4B.
- Soporte de tool calling / function calling: no documentado en la información disponible para esta variante.
- Soporte de agentes y multi-step reasoning: no documentado en la información disponible para esta variante.
- Capacidades multilingües: no documentadas en esta ficha.

## Casos de uso

- Asistente multimodal local en Mac: cargar el checkpoint con el fork de mlx-lm y responder preguntas sobre imágenes y texto sin enviar datos a la nube, aprovechando los ~15,6 GB de pesos en memoria unificada.
- Análisis de imágenes en flujo de trabajo de investigación: descripción y clasificación de fotografías, con un bucle de generación manual para la entrada de imagen, tal como documenta el autor.
- Prototipado de aplicaciones MoE en Apple Silicon: banco de pruebas para medir el comportamiento real del enrutamiento top-8 sobre 128 expertos tras cuantización agresiva a 4 bits.
- Evaluación de recetas de cuantización: referencia reproducible para comparar el esquema JANG mixto (8 bits en atención, 4 bits en FFN, router intacto) frente a cuantizaciones uniformes del mismo modelo base.
- Generación de texto y razonamiento en local con modo de pensamiento: tareas de preguntas y respuestas factuales donde la latencia no es crítica y prima la privacidad.
- Desarrollo de pipelines de cuantización GPTQ para MoE: el código de calibración por experto sirve como base para cuantizar otros modelos con expertos apilados en tensores únicos.
- Demostraciones de visión en edge: inferencia de image-text-to-text sobre hardware de consumo con memoria unificada en lugar de GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La única validación documentada es cualitativa: el autor informa de que el modelo responde correctamente a prompts factuales y de razonamiento, incluyendo la cadena de modo de pensamiento de Gemma 4, y que ante una fotografía real de COCO con dos gatos y la pregunta "What animal is in this picture?" respondió "There are two cats in this picture". No se aportan cifras de MMLU, HumanEval, GSM8K ni equivalentes, ni comparaciones numéricas con el modelo base.

## Requisitos de hardware

- VRAM: los pesos ocupan unos 15,6 GB en el formato cuantizado mixto. Con caché KV y activaciones, se recomienda un mínimo de 24 GB de memoria unificada; 32 GB o más para contextos largos.
- GPU compatibles: no aplica a GPU CUDA; esta variante es específica de MLX y está pensada para Apple Silicon (series M1, M2, M3 y M4 con memoria unificada suficiente).
- Cabe en hardware de consumo: sí, en Macs con 24 GB o más de memoria unificada. En máquinas de 16 GB no hay margen suficiente para pesos más caché.
- Opciones de despliegue: mlx-lm, concretamente el fork `ipsupport-llc/mlx-lm` instalado desde el repositorio Git; la API estándar `mlx_lm.load` y `mlx_lm.generate` funciona para texto. Ollama publica `gemma4:26b`, pero corresponde al modelo base y no a esta cuantización concreta. vLLM, llama.cpp y TGI no son compatibles con este formato.
- Latencia y throughput: no disponible. El autor no publica mediciones de tokens por segundo.
- Limitación operativa: `mlx_lm.generate()` no incorpora plomería de imagen para los modelos de visión de este fork, por lo que la entrada visual requiere un bucle de generación manual.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / tamaño | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| roman220220/gemma-4-26B-A4B-it-gptq-mlx-jang | 27,8B totales, ~4B activos | no disponible | MLX safetensors, 15,6 GB | Apache 2.0 | HuggingFace, 25 descargas, 0 likes |
| google/gemma-4-26B-A4B-it (base) | 26,5B totales, ~4B activos | no disponible | bf16, 51,6 GB | Apache 2.0 | HuggingFace, modelo de referencia |
| roman220220/gemma-4-26B-A4B-it-assistant-mlx-8bit | no disponible | no disponible | MLX 8 bits | Apache 2.0 | HuggingFace, misma cuenta |
| gemma4:26b (Ollama) | no disponible | no disponible | GGUF | Apache 2.0 | Ollama Library |

No se dispone de datos de rendimiento comparativos entre estas variantes. La diferencia documentada es de tamaño y esquema de cuantización (JANG mixto 4/8 bits con GPTQ frente a bf16 completo o a una cuantización uniforme de 8 bits).

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible. Al derivar de Gemma 4, hereda los sesgos del modelo base, no evaluados aquí.
- Riesgo de alucinación: no cuantificado. La cuantización de 4 bits en los expertos puede degradar la fidelidad factual respecto al bf16, aunque el autor no aporta métricas al respecto.
- Rendimiento degradado por cuantización: la atención y los embeddings se mantienen a 8 bits y el router sin tocar precisamente porque son sensibles, pero los 128 expertos a 4 bits son la mayor fuente potencial de pérdida de precisión. No hay evaluación cuantitativa del delta frente al base.
- Limitaciones de contexto: la longitud de contexto no está documentada en esta ficha; conviene verificar el `config.json` del checkpoint antes de diseñar aplicaciones que dependan de ventanas largas.
- Limitaciones de idioma: no se especifican idiomas soportados en los metadatos de HuggingFace.
- Ausencia de audio: el modelo no incluye torre de audio, por lo que no puede procesar entradas de voz.
- Compatibilidad restringida: solo funciona con el fork `ipsupport-llc/mlx-lm` y en Apple Silicon. No es desplegable en vLLM, TGI, llama.cpp ni en GPU NVIDIA.
- Soporte de imagen incompleto: requiere un bucle de generación manual, lo que complica su integración en aplicaciones de producción estándar.
- Adopción muy baja: 25 descargas y 0 likes en el momento de la consulta, con escasa validación por parte de terceros.
- Licencia: Apache 2.0 permite uso comercial, pero al ser una cuantización de un modelo de Google conviene revisar los términos de uso de Gemma 4 aplicables al modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/roman220220/gemma-4-26B-A4B-it-gptq-mlx-jang
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Variante hermana en 8 bits: https://huggingface.co/roman220220/gemma-4-26B-A4B-it-assistant-mlx-8bit
- Código del modelo (fork de mlx-lm): https://github.com/ipsupport-llc/mlx-lm
- Pipeline de cuantización: https://github.com/rromenskyi/quant-ternary/tree/main/gemma4-quant
- Página oficial de Gemma 4 (Google DeepMind): https://deepmind.google/models/gemma/gemma-4/
- Ficha en Google Cloud: https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/maas/google/gemma-4-26b-a4b-it
- Entrada en Ollama: https://ollama.com/library/gemma4:26b
