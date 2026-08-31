# bowang0911/V4-Nano-36B-A4B

## Resumen

`V4-Nano-36B-A4B` es una especificación de arquitectura publicada por el usuario `bowang0911` en Hugging Face. No se trata de un modelo de lenguaje entrenado, sino de una configuración reproducible de un modelo de mezcla de expertos (MoE) inspirado en DeepSeek-V4, con inicialización aleatoria de pesos. El repositorio no contiene pesos preentrenados y el propio autor advierte explícitamente de que no es un modelo utilizable.

La relevancia de esta publicación es exclusivamente investigadora: define con precisión una arquitectura de 36 237 millones de parámetros totales, de los cuales solo 4 217 millones se activan por token (A4B), con una ventana de contexto máxima configurada de 1 048 576 tokens. Incluye detalles como el reparto de capas entre atención deslizante y pares CSA/HCA, el uso de Hash-MoE en las tres primeras capas y enrutamiento top-2 aprendido en el resto. Al ser una arquitectura sin entrenar, no ofrece ninguna capacidad funcional ni resultados de calidad, pero sirve como punto de partida para experimentos de entrenamiento a gran escala.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE estilo DeepSeek-V4 (atención deslizante, CSA/HCA, Hash-MoE) |
| Parametros totales | 36 237 680 403 |
| Parametros activos | 4 217 315 091 (por token) |
| Longitud de contexto | 1 048 576 (máximo configurado) |
| Tipos de cuantizacion | no disponible (sin pesos publicados) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (no se distribuyen pesos; solo scripts de inicialización y conteo) |

## Arquitectura y entrenamiento

La arquitectura sigue el diseño de DeepSeek-V4 con 29 capas transformer, tamaño oculto de 3072 y vocabulario de 129 280 tokens. El esquema de capas es: 2 capas de atención de ventana deslizante, 13 pares alternados de CSA (Cross-Self Attention) y HCA (Hybrid Cross Attention), y una capa final de atención deslizante. Cada capa MoE contiene 80 expertos enrutados y 1 experto compartido, seleccionando 2 expertos enrutados por token, lo que mantiene una proporción de activación del 2,5 % similar a la de DeepSeek-V4-Flash (2,34 %).

Las tres primeras capas MoE emplean la arquitectura V4 Hash-MoE, que requiere poblar las tablas de enrutamiento `tid2eid` antes del entrenamiento. Las 26 capas restantes usan enrutamiento top-2 aprendido. El modelo incluye 4 flujos residuales mHC y cabezas de atención con 48 cabezas de consulta y 1 cabeza de clave/valor. No se ha realizado ningún entrenamiento: los pesos se inicializan aleatoriamente y el repositorio solo proporciona scripts para inspeccionar la estructura en dispositivo `meta` y calcular el número de parámetros sin asignar memoria.

## Capacidades

- No es un modelo funcional: no genera texto, no razona, no procesa código ni admite tool calling.
- No tiene capacidades de visión, audio ni multimodalidad.
- No hay soporte de agentes ni de razonamiento multi-paso.
- No se declara ningún idioma soportado.
- Su única utilidad es como especificación reproducible de arquitectura para experimentos de entrenamiento.

## Casos de uso

- Investigación en arquitecturas MoE: sirve como plantilla para estudiar el comportamiento de enrutamiento top-2 con 80 expertos y compararlo con configuraciones de mayor número de expertos activos.
- Experimentos de entrenamiento desde cero: los scripts incluidos permiten inicializar la estructura en dispositivo `meta` y verificar el conteo de parámetros antes de lanzar un entrenamiento real.
- Estudio de escalado de contexto: la ventana de 1 048 576 tokens permite probar técnicas de atención de largo alcance (CSA/HCA) en tareas de recuperación con contexto extremo.
- Evaluación de Hash-MoE frente a enrutamiento aprendido: las tres primeras capas con Hash-MoE ofrecen un banco de pruebas para comparar estrategias de enrutamiento determinista frente a aprendido.
- Desarrollo de kernels de inferencia eficiente: al conocer la estructura exacta (2 expertos activos, 1 experto compartido), se pueden diseñar kernels MoE específicos antes de disponer de pesos entrenados.
- Planificación de recursos de entrenamiento: el desglose de parámetros por componente (embeddings, atención, expertos) permite estimar requisitos de memoria y comunicación para futuros experimentos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor declara explícitamente que no se hacen afirmaciones sobre calidad, seguridad o rendimiento, dado que el modelo no está entrenado.

## Requisitos de hardware

- No aplica para inferencia: al no existir pesos entrenados, no se puede ejecutar el modelo para generar texto.
- Para inspeccionar la arquitectura en dispositivo `meta` no se requiere VRAM, solo memoria del sistema para el código.
- Si se quisiera entrenar la configuración completa en precisión FP16, se necesitarían aproximadamente 72 GB de VRAM solo para los pesos (36 237 millones de parámetros × 2 bytes), más memoria para gradientes y estados del optimizador, lo que supera ampliamente las GPU de consumo actuales.
- Para entrenamiento distribuido se requerirían múltiples GPU de alta gama (A100 80 GB, H100 80 GB o superiores) con paralelismo de expertos, dado que los 80 expertos por capa se pueden particionar en 8 o 16 vías.
- No se dispone de datos de latencia ni throughput al no haber implementación de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Estado | Licencia |
|---|---|---|---|---|---|
| V4-Nano-36B-A4B (este) | 36,2 B | 4,2 B | 1 048 576 | Sin entrenar | no disponible |
| DeepSeek-V4-Flash (referencia) | no disponible | no disponible | no disponible | Entrenado | no disponible |
| Gemma 4 26B A4B (Google) | 26 B | 4 B | no disponible | Entrenado | no disponible |

La comparación es limitada porque V4-Nano-36B-A4B no es un modelo funcional. Frente a Gemma 4 26B A4B, que sí está entrenado y disponible para uso comercial, este repositorio solo ofrece una especificación arquitectónica. DeepSeek-V4-Flash se menciona como referencia de diseño, pero no se dispone de sus datos públicos en la información proporcionada.

## Limitaciones y advertencias

- No contiene pesos preentrenados: es una arquitectura vacía con inicialización aleatoria, no apta para ninguna tarea de producción.
- No se han realizado evaluaciones de sesgos, alucinación o seguridad; el autor declara que no se hacen afirmaciones al respecto.
- La licencia no está especificada, lo que impide conocer las condiciones de uso comercial o modificación.
- Los idiomas soportados no están definidos.
- Las tablas de enrutamiento Hash-MoE de las tres primeras capas deben poblarse manualmente antes de cualquier entrenamiento, lo que añade complejidad a la implementación.
- El contexto máximo de 1 048 576 tokens es una configuración teórica; no se ha validado su viabilidad en hardware real.
- No se proporcionan pesos en ningún formato (safetensors, GGUF, etc.), por lo que no es desplegable con herramientas como vLLM, Ollama o llama.cpp.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/bowang0911/V4-Nano-36B-A4B
- Paper de DeepSeek-V4 (referencia): https://arxiv.org/abs/2606.19348
- Implementación de DeepSeek-V4 en Hugging Face Transformers: https://github.com/huggingface/transformers/tree/main/src/transformers/models/deepseek_v4
