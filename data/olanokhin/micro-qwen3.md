# olanokhin/micro-qwen3

## Resumen

micro-qwen3 es un modelo de lenguaje de 1.056.656 parámetros entrenado desde cero por Alex Anokhin (olanokhin) que replica bloque a bloque la arquitectura de Qwen3. No contiene pesos de Qwen ni tiene relación con Alibaba Cloud: es una reimplementación completa del bloque transformer de Qwen3 (RMSNorm pre-norm, grouped-query attention, QK-norm, RoPE, SwiGLU y embeddings atados) escalada a un tamaño mínimo viable. Su propósito es generar historias infantiles cortas en inglés y aceptar hasta tres palabras clave indicadas por el usuario.

El modelo se entrenó íntegramente en un MacBook con MLX, en dos fases: preentrenamiento sobre TinyStories V2 (124M tokens) y ajuste por instrucciones sobre 900.000 diálogos de TinyStoriesInstruct (150M tokens) en formato de chat Qwen. Su interés técnico no reside en la calidad lingüística, sino en la viabilidad de ejecutar inferencia real en hardware extremadamente limitado: la versión cuantizada a 4 bits ocupa 0,68 MB y corre en un microcontrolador ESP32-S3 a unos 60 tokens por segundo.

Es relevante como referencia educativa y de ingeniería: demuestra el ciclo completo (diseño de arquitectura, entrenamiento, cuantización con entrenamiento consciente de cuantización desde el primer paso y despliegue en C sin dependencias) para un modelo que cabe en un microcontrolador. Su contexto de 256 tokens y su vocabulario de 4.096 tokens lo sitúan fuera de cualquier uso de producción generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Qwen3: RMSNorm pre-norm, grouped-query attention, QK-norm, RoPE, SwiGLU, embeddings atados |
| Parametros totales | 1.056.656 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | 8 bits (1,14 MB) y 4 bits (0,68 MB) en formato `.bin` para el núcleo C; pesos completos en safetensors (MLX) |
| Idiomas soportados | inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) para `instruct/` y `base/`; `.bin` propietario (pesos + tokenizador) para el núcleo C |

Especificaciones adicionales: 3 capas, dimensión oculta 112, 4 cabezas de atención de 64 dimensiones, 2 cabezas key-value, vocabulario de 4.096 tokens con BPE byte-level y la regla de división de Qwen3.

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only que reproduce la pila de bloques de Qwen3-0.6B a escala reducida: 3 capas frente a las 28 del original, dimensión oculta 112 frente a 1.024, y 4 cabezas de atención de 64 dimensiones con 2 cabezas key-value (GQA) frente a 16/8. Mantiene RMSNorm pre-norm, QK-norm, RoPE, SwiGLU y embeddings atados. El vocabulario se reduce de 151.936 a 4.096 tokens, manteniendo la regla de división del tokenizador de Qwen3.

El entrenamiento se realizó en dos ejecuciones sobre MLX en un MacBook. La primera, preentrenamiento desde cero sobre TinyStories V2 con predicción del siguiente token, consumió 124M tokens y alcanzó 0,669 bits por byte en validación. La segunda, ajuste por instrucciones sobre 900.000 diálogos de TinyStoriesInstruct (150M tokens) en formato de chat Qwen, aplicó la pérdida solo sobre la respuesta y entrenamiento consciente de cuantización para el formato de 4 bits desde el primer paso. La calidad en validación sobre las respuestas fue de 0,747 bits por byte en precisión completa y con pesos de 8 bits, y 0,762 con pesos de 4 bits. No se documenta uso de RLHF ni DPO.

## Capacidades

- Generación de historias infantiles cortas en inglés, con gramática, puntuación y estructura narrativa básica.
- Seguimiento de instrucciones simples en formato de chat Qwen (`<|im_start|>user ... <|im_end|>`).
- Generación condicionada por hasta tres palabras clave, con una regla de decodificación que empuja las palabras no usadas y un autómata ortográfico que completa palabras iniciadas.
- Continuación de texto libre en el modelo base a partir de un inicio de historia.
- No dispone de tool calling ni function calling.
- No dispone de capacidades de agente ni razonamiento multi-paso.
- No dispone de visión, audio ni modo de razonamiento extendido.
- Multilingüismo: únicamente inglés.

## Casos de uso

- Demostración educativa de arquitectura transformer: el modelo permite visualizar cada logit, cabeza de atención y capa en el navegador mediante TensorLupa, lo que lo hace útil para enseñar el funcionamiento interno de un LLM sin abstracciones.
- Inferencia en microcontroladores: la versión de 4 bits (0,68 MB) se ejecuta en un ESP32-S3 a unos 60 tokens por segundo, habilitando aplicaciones de texto generativo en dispositivos con recursos de memoria del orden de kilobytes.
- Prototipado de pipelines de entrenamiento: el repositorio incluye código de entrenamiento y registros, lo que permite reproducir el ciclo completo (preentrenamiento, ajuste por instrucciones y cuantización) en un solo equipo de consumo.
- Prueba de cuantización consciente del entrenamiento: sirve como caso de referencia para evaluar el impacto de QAT a 4 bits en un modelo pequeño, con métricas comparables entre precisión completa, 8 bits y 4 bits.
- Generación de cuentos para aplicaciones infantiles offline: con contexto de 256 tokens, encaja en juguetes o dispositivos educativos sin conectividad que generen una historia breve a partir de tres palabras.
- Validación de núcleos de inferencia en C: el archivo `microqwen.c` sin dependencias permite probar implementaciones de atención y muestreo en entornos embebidos.
- Investigación sobre tokenizadores de vocabulario reducido: el uso de 4.096 tokens con la regla de división de Qwen3 permite estudiar el equilibrio entre tamaño de vocabulario y calidad en modelos minúsculos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas de calidad en validación medidas en bits por byte:

| Fase | Métrica | Valor |
|---|---|---|
| Preentrenamiento (TinyStories V2) | Bits por byte en validación | 0,669 |
| Ajuste por instrucciones, precisión completa | Bits por byte en respuestas | 0,747 |
| Ajuste por instrucciones, pesos 8 bits | Bits por byte en respuestas | 0,747 |
| Ajuste por instrucciones, pesos 4 bits | Bits por byte en respuestas | 0,762 |
| Generación con muestreo simple | Historias con las 3 palabras pedidas | ~64% |
| Generación con regla de decodificación + autómata | Historias con las 3 palabras pedidas | 100% (200 pedidos de prueba) |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 5 MB en precisión completa (1,06M parámetros), 1,14 MB con pesos de 8 bits y 0,68 MB con pesos de 4 bits.
- GPU recomendadas: no requiere GPU; el entrenamiento se realizó en un MacBook con MLX. Cualquier GPU consumer puede ejecutarlo con holgura.
- Cabe en GPU consumer: sí, en cualquier GPU con más de unos pocos megabytes de memoria, incluidas integradas.
- Cabe en microcontrolador: sí, en un ESP32-S3 con la versión de 4 bits.
- Opciones de despliegue: MLX (carga de safetensors con el código de entrenamiento del repositorio), núcleo C sin dependencias (`microqwen.c`) para microcontroladores, y ejecución en navegador mediante TensorLupa. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: aproximadamente 60 tokens por segundo en ESP32-S3 con pesos de 4 bits. No se documentan cifras para otras plataformas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idioma | Licencia | Despliegue en microcontrolador |
|---|---|---|---|---|---|
| micro-qwen3 | 1,06M | 256 | inglés | Apache 2.0 | sí (ESP32-S3, 4 bits) |
| Qwen3-0.6B | ~596M | 32K | multilingüe | Apache 2.0 | no |
| TinyStories baselines (Eldan y Li, 2023) | ~1M-10M | no disponible | inglés | CDLA-Sharing-1.0 (datos) | no documentado |

La comparación con Qwen3-0.6B es la que establece la propia model card: micro-qwen3 replica su bloque arquitectónico con 3 capas frente a 28, dimensión 112 frente a 1.024 y vocabulario de 4.096 frente a 151.936. Frente a los modelos de referencia de TinyStories, comparte el corpus de entrenamiento pero no se dispone de comparación directa de rendimiento en la información proporcionada.

## Limitaciones y advertencias

- Conocimiento factual prácticamente nulo: un millón de parámetros no permite almacenar hechos sobre el mundo; el modelo solo aprende gramática, puntuación y la forma de una historia.
- Calidad narrativa irregular: la propia model card advierte de que las historias son "a veces torpes".
- Contexto muy limitado: 256 tokens, suficiente para una historia corta pero insuficiente para conversaciones multi-turno o documentos.
- Solo inglés: no hay soporte de otros idiomas.
- Sin tool calling, sin agentes y sin capacidades multimodales.
- Riesgo de alucinación: al no tener conocimiento factual, cualquier afirmación sobre el mundo real es inventada por construcción.
- Sesgos: no se documentan evaluaciones de sesgo; el corpus TinyStories está generado sintéticamente con GPT, por lo que puede heredar sesgos de ese modelo generador.
- Restricciones de licencia: los pesos son Apache 2.0 y permiten uso comercial, pero los datos de entrenamiento (TinyStories y TinyStoriesInstruct) están bajo CDLA-Sharing-1.0, lo que conviene verificar si se redistribuyen derivados del corpus.
- El formato `.bin` y el núcleo C son específicos del proyecto; no hay integración con ecosistemas estándar de inferencia.
- No apto para producción generalista: su uso realista es educativo, embebido o de investigación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/olanokhin/micro-qwen3
- Repositorio GitHub (firmware, núcleo C, entrenamiento y registros): https://github.com/olanokhin/micro-qwen3-esp32
- TensorLupa (estudio en navegador): https://tensorlupa.com
- Documentación sobre el diseño del modelo: https://tensorlupa.com/docs/model/how-it-was-made/
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
- Dataset TinyStoriesInstruct: https://huggingface.co/datasets/roneneldan/TinyStoriesInstruct
