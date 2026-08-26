# LibertAIDAI/GLM-5.3-Flash-NVFP4

## Resumen

GLM-5.3-Flash-NVFP4 es una cuantización *weight-only* en formato NVFP4 (NVFP4-A16) del modelo GLM-5.3-Flash de Z.ai, realizada por LibertAIDAI. El modelo base es un MoE multimodal de 320B parámetros totales y 18B activos, el primero de la familia GLM que combina atención lineal KDA y atención sparse estilo DeepSeek, con una ventana de contexto de 1M tokens. Esta cuantización reduce el peso del checkpoint de 598.5 GiB a aproximadamente 181 GiB (−70 %), cuantizando únicamente los tensores de los expertos enrutados (el 97 % de los parámetros) a NVFP4, mientras que todas las rutas sensibles a outliers (atención, torre de visión, routers, embeddings, etc.) se mantienen en BF16.

La relevancia de este checkpoint es doble: por un lado, permite ejecutar un modelo de 320B en hardware mucho más modesto (por ejemplo, dos estaciones GB10/DGX Spark) sin sacrificar la calidad multimodal, ya que la torre de visión permanece intacta en BF16. Por otro lado, al estar empaquetado con NVIDIA ModelOpt, es directamente cargable por el loader NVFP4 de vLLM, lo que facilita su despliegue en producción con decodificación especulativa vía MTP. El modelo se distribuye bajo licencia MIT y soporta los idiomas inglés y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE hibrido con atencion lineal KDA (34 capas) y atencion sparse DeepSeek (11 capas), multimodal nativo |
| Parametros totales | 165.496.249.182 (checkpoint cuantizado); 320B en el modelo base |
| Parametros activos | 18B (modelo base) |
| Longitud de contexto | 1M tokens |
| Tipos de cuantizacion | NVFP4 (weight-only, A16) |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | safetensors (no hay GGUF) |

## Arquitectura y entrenamiento

El modelo base GLM-5.3-Flash es un transformer MoE con 320B parámetros totales y 18B activos por token. Su arquitectura combina dos mecanismos de atención: 34 capas de atención lineal KDA (Kernel-based Dual Attention) y 11 capas de atención sparse estilo DeepSeek, lo que lo convierte en el primer GLM en hibridar ambos enfoques. Además, incorpora una torre de visión nativa que le permite procesar imágenes directamente, y un cabezal MTP (Multi-Token Prediction) para decodificación especulativa.

La cuantización realizada por LibertAIDAI es *weight-only*: los tensores de los expertos enrutados (gate, up y down projections de las capas FFN) se convierten a NVFP4 (formato E2M1 con escalas FP8-E4M3 por bloques de 16 y una escala global FP32 por tensor), mientras que el resto de los componentes —ambas atenciones, el indexador sparse, la torre de visión, los expertos compartidos, los routers, las capas densas, el MTP, las conexiones hiperconectadas con restricción de manifold, embeddings, lm_head y normas— se mantienen en BF16. El proceso se realizó con NVIDIA ModelOpt 0.45.0 mediante un paso de shard-streaming en CPU, sin datos de calibración, ya que las escalas se derivan de los propios pesos. La verificación reporta una similitud coseno por experto de aproximadamente 0.9967 y un error relativo de 0.0925 frente al modelo BF16 original.

## Capacidades

- Generación de texto y razonamiento complejo, con soporte de modo *thinking* (vía reasoning-parser glm45).
- Comprensión y generación de código, con capacidades mejoradas para tareas de ingeniería de software complejas y de horizonte largo.
- Procesamiento multimodal nativo: entrada de imágenes y texto, salida de texto (pipeline image-text-to-text).
- Tool calling / function calling, con parser específico glm47 y activación automática de herramientas.
- Razonamiento multi-paso y ejecución de agentes autónomos.
- Decodificación especulativa mediante MTP (hasta 5 tokens especulativos).
- Contexto largo de 1M tokens, adecuado para documentos extensos y conversaciones multi-turno.
- Multilingüe: inglés y chino.

## Casos de uso

- Despliegue de un modelo de 320B en hardware de gama media: gracias a la reducción a ~181 GiB, el modelo cabe en dos estaciones GB10/DGX Spark (cada una con 128 GB de memoria unificada), lo que permite a equipos pequeños ejecutar un MoE de última generación sin necesidad de un clúster GB200.
- Agentes autónomos con tool calling: el modelo puede integrarse en frameworks de agentes (por ejemplo, LiberClaw) para ejecutar tareas multi-paso que requieren llamadas a APIs, búsqueda web o manipulación de archivos, gracias a su soporte nativo de function calling y razonamiento extendido.
- Análisis multimodal de documentos: al mantener la torre de visión en BF16, el modelo procesa imágenes, diagramas y capturas de pantalla con la misma fidelidad que el original, útil para extraer información de informes técnicos o materiales visuales.
- Generación de código en producción: con 1M tokens de contexto y capacidades de razonamiento, puede asistir en la revisión de repositorios completos, generación de tests y refactorización, integrándose en pipelines de CI/CD mediante la API de vLLM.
- Asistentes conversacionales multilingües: soporta inglés y chino con contexto largo, adecuado para servicios de atención al cliente o asistentes virtuales que requieren mantener el hilo de conversaciones extensas.
- Investigación en arquitecturas MoE híbridas: al ser un checkpoint abierto (MIT) y cuantizado, permite estudiar el comportamiento de atención lineal + sparse en un modelo de gran escala sin necesidad de los recursos del original.
- Inferencia privada en infraestructura descentralizada: LibertAI ofrece este modelo a través de su plataforma sobre GPUs comunitarias, lo que posibilita ejecutar el modelo sin depender de un único proveedor de nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K u otros, y la cuantización solo reporta la verificación de similitud coseno y error relativo frente al modelo BF16. Se recomienda consultar la documentación oficial de Z.ai para los benchmarks del modelo base.

## Requisitos de hardware

- VRAM estimada: ~181 GiB en NVFP4 (frente a 598.5 GiB en BF16). Esto implica al menos dos GPUs con 96 GB o más, o varias GPUs de 48 GB.
- GPUs recomendadas: H100, B200, GB200 (verificadas por el proveedor). En GB10/DGX Spark (sm_121) puede requerir el backend marlin si fallan los kernels FP4 nativos.
- En consumer GPU: las RTX 50-series (Blackwell) soportan NVFP4 nativo, pero 181 GiB excede la VRAM de una sola tarjeta; se necesitarían múltiples GPUs (por ejemplo, 4× RTX 5090 con 32 GB cada una, aunque el reparto de MoE puede ser ineficiente).
- Opciones de despliegue: vLLM mediante imágenes docker específicas (`vllm/vllm-openai:glm53-flash-x86_64-cu130`, `arm64-cu130` o multi-arch). No hay soporte en llama.cpp ni GGUF.
- Latencia y throughput: no disponibles en la información proporcionada. Se recomienda configurar `VLLM_ENGINE_READY_TIMEOUT_S=3600` debido a la lenta inicialización del motor.

## Comparativa con modelos similares

| Modelo | Params totales | Params activos | Contexto | Cuantización | Licencia |
|---|---|---|---|---|---|
| GLM-5.3-Flash (BF16) | 320B | 18B | 1M | BF16 | MIT |
| GLM-5.3-Flash-NVFP4 (este) | 320B (165.5B en checkpoint) | 18B | 1M | NVFP4 weight-only | MIT |
| GLM-5.3 (flagship) | no disponible | no disponible | 1M | no disponible | MIT |

No se dispone de información sobre otros modelos cuantizados comparables en el mismo formato. La comparativa principal es frente al modelo base BF16: la cuantización reduce el tamaño un 70 % con una pérdida de similitud coseno de ~0.0033, manteniendo la torre de visión intacta. Frente a otros MoE de tamaño similar (por ejemplo, DeepSeek-V3 o Qwen3-MoE), no hay datos de rendimiento en esta información.

## Limitaciones y advertencias

- La cuantización NVFP4 es *weight-only* y no afecta a las activaciones, pero introduce una pequeña pérdida de precisión (cosine ≈ 0.9967, error relativo ≈ 0.0925) que podría ser relevante en tareas de alta sensibilidad numérica.
- El soporte de vLLM para la arquitectura `glm5_next` aún no está en la rama principal; es necesario usar las imágenes docker específicas hasta que se fusione el PR correspondiente.
- No existe soporte en llama.cpp ni formato GGUF, lo que limita el despliegue en entornos que dependen de esa pila.
- En GPUs GB10/DGX Spark (sm_121) los kernels FP4 nativos pueden fallar; se requiere el backend marlin como alternativa, lo que reduce el rendimiento.
- El modelo solo soporta inglés y chino; no hay capacidades multilingües más amplias.
- A pesar de la reducción de tamaño, 181 GiB sigue siendo una carga considerable: requiere múltiples GPUs o hardware especializado, y no es viable en una sola GPU de consumo.
- La licencia MIT permite uso comercial sin restricciones, pero el modelo base puede tener términos adicionales; se recomienda revisar la documentación de Z.ai.
- No se han publicado benchmarks independientes para esta cuantización; los resultados pueden variar respecto al modelo BF16.

## Enlaces

- Checkpoint cuantizado: https://huggingface.co/LibertAIDAI/GLM-5.3-Flash-NVFP4
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Documentación oficial de GLM-5.3: https://docs.z.ai/guides/llm/glm-5.3
- Receta vLLM para GLM-5.3-Flash: https://recipes.vllm.ai/zai-org/GLM-5.3-Flash
- PR de soporte en vLLM: https://github.com/vllm-project/vllm/pull/53906
- PR de soporte en SGLang: https://github.com/sgl-project/sglang/pull/36507
- Plataforma LibertAI: https://libertai.io
- LiberClaw (agentes): https://liberclaw.ai
- Aleph Cloud: https://aleph.cloud
