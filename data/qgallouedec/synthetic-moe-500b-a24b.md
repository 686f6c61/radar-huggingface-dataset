# qgallouedec/synthetic-moe-500b-a24b

## Resumen

El modelo `qgallouedec/synthetic-moe-500b-a24b` es un checkpoint de pesos aleatorios (random-init) creado por Quentin Gallouédec (qgallouedec) con el propósito explícito de servir como banco de pruebas para infraestructura de entrenamiento e inferencia a gran escala. No es un modelo entrenado: no ha visto ningún dato, no genera texto coherente ni tiene capacidades cognitivas. Su única función es aproximar la arquitectura y el tamaño de un modelo MoE de 500 mil millones de parámetros para validar pipelines de carga, sharding, paralelismo y benchmarks de rendimiento del stack técnico.

La arquitectura se basa en el diseño de `glm4_moe` con 52 capas (3 densas y 49 MoE), 256 expertos con top-8 activo, atención GQA y un vocabulario de 151 936 tokens. El checkpoint ocupa aproximadamente 1 TB en formato safetensors con precisión bf16. Aunque el autor indica desviaciones conocidas respecto al diseño objetivo (sin gating de atención, sin SWA, sin NoPE), la estructura general es representativa de un modelo MoE de última generación.

La relevancia de este modelo radica en que permite a equipos de ingeniería probar sus sistemas de distribución y gestión de memoria con un peso realista antes de invertir en entrenar un modelo completo. Es una herramienta de desarrollo, no un producto final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) basada en glm4_moe, 52 capas (3 densas + 49 MoE) |
| Parametros totales | 500 176 558 336 (500,18 B) |
| Parametros activos | ~22,3 B (top-8 de 256 expertos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bf16) |
| Idiomas soportados | no disponible (no aplica, modelo sin entrenar) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

La arquitectura sigue el esquema de un transformer MoE con las siguientes características: 52 capas, de las cuales 3 son densas y 49 son capas MoE. Cada capa MoE contiene 256 expertos con una FFN de dimensión 2560, y se activan los 8 mejores expertos por token (top-8). Además, se emplea una estrategia de agrupación en 8 grupos con top-4 dentro de cada grupo, junto con un término de corrección de sesgo no-auxiliar. La atención es de tipo GQA (Grouped Query Attention) con 48 cabezas de consulta y 16 cabezas clave/valor, cada una de dimensión 128. El vocabulario es de 151 936 tokens, utilizando el tokenizador de Qwen3, y los embeddings no están atados (untied). El modelo se almacena en precisión bf16.

No existe un proceso de entrenamiento: los pesos se inicializan de forma aleatoria. El autor declara desviaciones respecto al diseño objetivo: no se incluye gating de atención (lo que reduce 1,6 B parámetros), no hay SWA (Sliding Window Attention) ni mezcla completa 1:5, no se usa NoPE (No Positional Encoding) ni SSMax, y no se aplican normas sandwich. Estas omisiones son intencionales para simplificar la implementación de pruebas.

## Capacidades

- No tiene capacidades de generación de texto, razonamiento, código, matemáticas ni visión, al ser un modelo con pesos aleatorios no entrenado.
- No soporta tool calling ni function calling.
- No es apto para tareas de agente o razonamiento multi-paso.
- No tiene capacidades multilingües.
- No dispone de modo de pensamiento, visión ni audio.
- Su única utilidad es la validación de infraestructura: carga de pesos, sharding, paralelismo de datos y de tensores, y medición de throughput en entornos de entrenamiento o inferencia.

## Casos de uso

- Pruebas de carga y sharding en clústeres multi-GPU: el modelo permite verificar que el sistema de distribución de pesos (p. ej., con DeepSpeed, Megatron-LM o vLLM) maneja correctamente 500 B parámetros repartidos en decenas o cientos de GPUs.
- Benchmarking de throughput de entrenamiento: al ser un checkpoint de tamaño realista, se pueden medir FLOPs por token, tiempo por paso y utilización de memoria sin necesidad de entrenar un modelo real.
- Validación de pipelines de guardado y restauración: probar la serialización y deserialización de checkpoints de 1 TB en formato safetensors, incluyendo la integridad de los metadatos.
- Desarrollo de estrategias de paralelismo de expertos (EP): con 256 expertos, es ideal para probar algoritmos de enrutamiento y balanceo de carga entre GPUs.
- Evaluación de cuantización post-entrenamiento: aunque no produce salidas útiles, se puede usar para medir el impacto de cuantizar pesos a 8 o 4 bits en términos de memoria y velocidad, sin preocuparse por la degradación de calidad.
- Integración en CI/CD de infraestructura: como parte de pruebas automáticas que verifican que un nuevo release de un framework (p. ej., PyTorch, vLLM) soporta modelos MoE de gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al ser un modelo de pesos aleatorios, no tiene sentido evaluar métricas de calidad como MMLU o HumanEval. El autor no proporciona datos de rendimiento de inferencia ni entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: con 500 B parámetros en bf16, solo los pesos ocupan ~1000 GB. En cuantización de 8 bits serían ~500 GB, y en 4 bits ~250 GB. Esto excede la capacidad de cualquier GPU individual actual (máximo 80 GB en H100/A100).
- GPU recomendadas: no hay una GPU única capaz de alojar el modelo completo. Se requiere un clúster con múltiples GPUs, por ejemplo 8 o más H100 (80 GB) para sharding de pesos en bf16, o 4 H100 si se cuantiza a 8 bits.
- No cabe en GPUs de consumo (RTX 4090, 3090, etc.) ni siquiera con cuantización extrema, debido al tamaño de los pesos y la memoria necesaria para activaciones.
- Opciones de despliegue: frameworks de entrenamiento distribuido como DeepSpeed, Megatron-LM, o inferencia con vLLM (si se adapta), llama.cpp no es viable por el tamaño. También se puede usar con TensorFlow o PyTorch con parallelism.
- Latencia y throughput: no disponibles, ya que no se han publicado mediciones. Dependerá del hardware y la configuración de paralelismo.

## Comparativa con modelos similares

No existe un modelo comparable directamente, ya que `synthetic-moe-500b-a24b` no es un modelo entrenado sino un artefacto de pruebas. Se podría comparar con la arquitectura original de GLM-4-MoE (que tiene 500 B parámetros y 22 B activos), pero ese modelo sí está entrenado y tiene capacidades reales. Otras alternativas de MoE grandes como Mixtral 8x22B (141 B totales, 22 B activos) o DeepSeek-V3 (671 B totales, 37 B activos) son modelos funcionales. La comparación no es pertinente porque este checkpoint carece de utilidad práctica más allá de la infraestructura.

## Limitaciones y advertencias

- No es un modelo entrenado: no genera texto, no razona, no produce salidas útiles. Cualquier intento de usarlo para tareas reales dará resultados sin sentido.
- Sesgos conocidos: no aplica, al no haber datos de entrenamiento.
- Riesgo de alucinación: no aplica, ya que no hay generación.
- Limitaciones de contexto o idioma: no aplica.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, pero el modelo no tiene valor funcional.
- Advertencia para producción: no debe desplegarse en ningún entorno de producción que requiera generación de contenido. Su uso está restringido a pruebas de infraestructura y desarrollo.
- Desviaciones de la arquitectura objetivo: el autor indica que faltan componentes como gating de atención, SWA, NoPE y sandwich norms, por lo que no es una réplica exacta de GLM-4-MoE. Esto puede afectar a la validez de ciertos benchmarks de rendimiento.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/qgallouedec/synthetic-moe-500b-a24b)
- [Perfil de Hugging Face del autor](https://huggingface.co/qgallouedec)
- [Perfil de GitHub del autor](https://github.com/qgallouedec/)
