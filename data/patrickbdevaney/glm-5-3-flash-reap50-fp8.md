# patrickbdevaney/GLM-5.3-Flash-REAP50-FP8

## Resumen

GLM-5.3-Flash-REAP50-FP8 es un checkpoint de investigación derivado de GLM-5.3-Flash, el modelo multimodal MoE de Z.ai, al que se le ha aplicado una poda del 50% de los expertos enrutados mediante la técnica REAP (Router-weighted Expert Activation Pruning, arXiv:2510.13999). El autor, patrickbdevaney, elimina 144 de los 288 expertos por capa manteniendo el enrutamiento top-8 intacto, con el objetivo de reducir el tamaño del modelo para su despliegue en hardware edge como NVIDIA Jetson Thor. El resultado es un modelo de aproximadamente 161.7 mil millones de parámetros en FP8, con una huella de 157 GiB, que conserva la arquitectura híbrida de atención dispersa y lineal del original.

Este checkpoint es relevante porque explora los límites de la compresión por poda de expertos en una arquitectura MoE multimodal de última generación, manteniendo la licencia MIT del modelo base. Sin embargo, es crucial destacar que no ha sido evaluado en ningún benchmark: el autor verifica únicamente la integridad estructural (conteo de expertos, routers recortados, tensores cargables) y reporta una retención de masa de saliencia de 0.643 frente a 0.50 de poda aleatoria, lo que indica que el criterio de selección es mejor que el azar, pero no garantiza calidad funcional. Se trata de un artefacto de investigación pendiente de evaluación, no de un reemplazo directo del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE hibrida (atencion dispersa + lineal) basada en GLM-5.3-Flash, con 144 expertos enrutados por capa (50% podados) |
| Parametros totales | 161.662.756.766 (~161,7B) |
| Parametros activos | no disponible (el modelo base tiene 18B activos por token; la poda reduce el numero de expertos pero no se especifica el nuevo conteo activo) |
| Longitud de contexto | 1.048.576 tokens (heredado del base) |
| Tipos de cuantizacion | FP8 E4M3 con block scales de 128x128 (heredado del base) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (FP8) |

## Arquitectura y entrenamiento

El modelo parte de GLM-5.3-Flash, que introduce por primera vez en la serie GLM una arquitectura híbrida que combina atención dispersa (sparse attention) y atención lineal, reduciendo los costes de servicio en contexto largo. La versión REAP50 aplica poda de expertos enrutados: de los 288 expertos por capa, se eliminan 144, manteniendo el mecanismo de enrutamiento top-8 sin cambios. La poda se realiza con REAP, un método que pondera la contribución de cada experto según la activación del router, calibrado sobre un corpus multi-dominio con licencias permisivas (agentic 24%, código 21%, matemáticas 15%, multimodal 15%, ciencia y bio 10%, finanzas 8%, lastre 7%). Se incluyen pares reales de imagen-texto para preservar los expertos que sirven a tokens de visión, ya que el tower de visión no contiene MoE y permanece intacto.

El proceso incluye un "healing" o corrección de escala de salida de primer momento, derivado de la saliencia de calibración (ganancia mediana de 0,696 aplicada a los block scales F32). No es destilación ni recuperación de conocimiento. El bloque MTP (multi-token-prediction) de la capa 45 se excluye de la poda porque `transformers` no lo instancia en `Glm5NextForConditionalGeneration`; sus tensores originales se archivan sin modificar. El autor advierte que REAP no tiene datos publicados por encima del 50% de compresión, por lo que este checkpoint se sitúa en el techo validado de la técnica.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del base GLM-5.3-Flash, pero sin evaluación propia, por lo que el rendimiento real es incierto.
- Codificación y tareas agénticas: el modelo base está optimizado para programación compleja y agentes de largo horizonte; la poda está calibrada con una mezcla ponderada hacia código y agentes (45% combinado).
- Multimodalidad: entrada de imagen y vídeo (heredada del base), con el tower de visión intacto y tokens de imagen enrutados a través del mismo pool de expertos que el texto.
- Soporte de tool calling y function calling: no confirmado explícitamente, pero el base GLM-5.3-Flash lo soporta; se espera que se conserve aunque sin garantías.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo de pensamiento (thinking mode): no confirmado; el base no lo documenta como tal.

## Casos de uso

- Despliegue en hardware edge (NVIDIA Jetson Thor): el objetivo principal de este checkpoint es reducir la huella de memoria para ejecutar un modelo de 161B en dispositivos de borde. Con el backend cutlass fused-MoE y `TRITON_MLA` para las 11 capas MLA+DSA, puede servir inferencia de código y agentes en entornos con restricciones de VRAM.
- Investigación en poda de MoE: sirve como artefacto para estudiar el impacto de la eliminación del 50% de expertos enrutados en tareas de razonamiento, codificación y visión, comparando con el base sin podar.
- Evaluación de robustez del criterio REAP: al ser un checkpoint sin evaluar, permite validar si la saliencia del router (0.643 vs 0.50 aleatorio) se traduce en retención de calidad real.
- Experimentación con cuantización FP8 y block scales: los pesos se almacenan en FP8 E4M3 con escalas de bloque, lo que permite probar técnicas de inferencia de baja precisión en MoE.
- Pruebas de calibración multi-dominio: la mezcla de calibración (código, agentes, matemáticas, multimodal, finanzas, ciencia) puede compararse con otras estrategias de poda para entender qué dominios se ven más afectados.
- Generación de código asistida en entornos sin GPU de gran tamaño: aunque no se ha evaluado, si el modelo conserva las capacidades de codificación del base, podría usarse en pipelines de CI/CD con hardware modesto, pero requiere validación previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explícitamente: "This checkpoint has not been evaluated. No benchmark has been run against it - not coding, not agentic, not vision, not knowledge." La única métrica reportada es estructural: la poda midió 1.29x mejor que la poda aleatoria en retención de contribución de salida de expertos (masa de saliencia 0.643 frente a 0.50). Esto no constituye una evaluación de rendimiento del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 157 GiB en FP8 (según el tamaño del repo de 168.6 GB, con pesos de 157 GiB). Se requieren múltiples GPUs o una GPU con memoria unificada de gran tamaño.
- GPUs recomendadas: NVIDIA H100 (80GB) en configuración multi-GPU (2-3 unidades), o A100 80GB en configuración similar. En consumer GPU no cabe; incluso una RTX 4090 (24GB) es insuficiente.
- Para Jetson Thor: el autor indica usar el backend cutlass fused-MoE (el kernel Marlin FP4 MoE falla con >=256 expertos) y `TRITON_MLA` para las capas MLA+DSA (FLASHINFER no es válido para MLA). Jetson Thor tiene memoria unificada LPDDR5X, pero no se especifica la capacidad exacta; el modelo requiere al menos 157 GiB, por lo que solo es viable en configuraciones con memoria amplia.
- Opciones de despliegue: llama.cpp (si se convierte a GGUF), vLLM (si soporta el formato FP8 y la arquitectura Glm5Next), TGI, o el backend cutlass mencionado para Jetson. No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| GLM-5.3-Flash (base) | 320B totales, 18B activos | 1.048.576 | MIT | Evaluado por Z.ai, rendimiento publicado |
| GLM-5.3-Flash-REAP50-FP8 (este) | 161,7B totales | 1.048.576 | MIT | Sin evaluar, artefacto de investigación |
| cerebras/Kimi-Linear-REAP-35B-A3B | 35B totales, 3B activos (aprox.) | no disponible | no disponible | Publicado como análogo de poda REAP; pierde 3.4 puntos en FRAMES con 30% de poda |

El modelo base GLM-5.3-Flash es la referencia natural: con 320B totales y 18B activos, ofrece un rendimiento conocido en codificación y tareas agénticas, pero requiere más memoria. Este checkpoint reduce los parámetros a la mitad, pero a costa de una posible regresión en recall factual (el autor espera que sea el primer dominio afectado, basándose en el análogo Kimi-Linear). No hay comparativa directa con otros modelos podados de tamaño similar.

## Limitaciones y advertencias

- No ha sido evaluado en ningún benchmark: no se puede afirmar que funcione correctamente para ninguna tarea. Es un artefacto de investigación, no un modelo listo para producción.
- El bloque MTP (multi-token-prediction) de la capa 45 está excluido de la poda y sus tensores originales se archivan sin modificar; esto puede afectar a la coherencia del modelo si se usa con `transformers`.
- Se espera regresión en recall factual antes que en razonamiento o codificación, según el análogo publicado (Kimi-Linear-REAP pierde 3.4 puntos en FRAMES con solo 30% de poda).
- El healing es una corrección de escala de primer momento, no una destilación; no recupera conocimiento perdido.
- El routing está más perturbado de lo que sugiere el conteo de expertos: los expertos retenidos llevan ~0.90x la masa de routing que un experto promedio, porque REAP preserva expertos raros pero fuertes sobre comunes pero débiles.
- REAP no tiene datos publicados por encima del 50% de compresión; este checkpoint se sitúa en el límite validado, no más allá.
- Los idiomas soportados no están documentados; el modelo base es multilingüe pero no se especifica qué lenguas se ven afectadas por la poda.
- Aunque la licencia es MIT, el uso comercial requiere validación previa del rendimiento, dado el estado sin evaluar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/patrickbdevaney/GLM-5.3-Flash-REAP50-FP8
- Modelo base GLM-5.3-Flash: https://huggingface.co/zai-org/GLM-5.3-Flash
- Paper de REAP (arXiv:2510.13999): https://arxiv.org/abs/2510.13999
- Documentación de GLM-5.3 de Z.ai: https://docs.z.ai/guides/llm/glm-5.3
- Artículo de MarkTechPost sobre GLM-5.3-Flash: https://www.marktechpost.com/2026/08/26/z-ai-releases-glm-5-3-flash-a-320b-a18b-natively-multimodal-moe-with-a-1m-token-context/
- Página de Parasail sobre GLM-5.3 Flash: https://www.parasail.io/models/glm-53-flash
