# Shiftedx/ornith-1.5-35b-a3b-attention8-bf16recurrence-vision-mtplx

## Resumen

Ornith-1.5-35B-A3B es un modelo multimodal de arquitectura MoE (Mixture of Experts) desarrollado por Ornith AI, con 35.000 millones de parámetros totales y 3.000 millones activos por token. Esta versión concreta, publicada por el usuario Shiftedx, es una cuantización híbrida en formato MLX pensada para ejecutarse en hardware Apple Silicon, preservando las capacidades de visión, la recurrencia y el módulo de predicción multitoken (MTP) del modelo original. El resultado es un artefacto de 28,12 GB que permite ejecutar un modelo multimodal de gran tamaño en equipos con memoria unificada moderada, algo especialmente relevante para desarrolladores que trabajan en Mac y no disponen de GPUs NVIDIA.

La cuantización utiliza un esquema affine de 4 bits con grupos de 32 para el cuerpo lingüístico, pero protege 260 módulos en 8 bits, mantiene 60 pesos de recurrencia en BF16 y conserva la totalidad de los tensores de visión y MTP en BF16. Esto busca minimizar la pérdida de calidad en las partes más sensibles del modelo. El contexto máximo declarado es de 262.144 tokens, y el modelo soporta entrada de imagen y texto, así como decodificación especulativa. La licencia es MIT, lo que facilita su uso comercial y de investigación.

Aunque la cuantización ha pasado pruebas locales de validación estructural, de generación de texto, de visión y de API compatible con OpenAI, no se han publicado benchmarks públicos que comparen su rendimiento con el modelo original o con otras cuantizaciones. El autor advierte explícitamente que la cuantización puede alterar el comportamiento respecto al padre en BF16 y que no se ha realizado una verificación completa de paridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 MoE multimodal, 40 capas de lenguaje, 256 expertos, 8 activos |
| Parametros totales | 35B (MoE) – el modelo original; los tensores cuantizados suman ~7,77B |
| Parametros activos | 3B (A3B) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Affine 4-bit/group-32 (cuerpo lingüístico), 260 módulos en 8-bit/group-64, 60 pesos de recurrencia en BF16, visión y MTP en BF16 |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | Safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base, Ornith-1.5-35B-A3B, es un transformer multimodal con arquitectura MoE derivada de la familia Qwen3.5. Según la información de la model card, emplea 40 capas de lenguaje, 256 expertos con 8 activos por token, y una capa de atención lineal recurrente (linear_attn) que se conserva en BF16 en esta cuantización. El componente de visión está formado por 333 tensores nativos en BF16 con 446.571.248 parámetros, y el módulo MTP (multi-token prediction) añade otros 785 tensores BF16. Esta cuantización de Shiftedx aplica un esquema de cuantización mixta: el cuerpo del lenguaje se cuantiza a 4 bits con grupos de 32, mientras que ciertos módulos protegidos (260 en total) se mantienen en 8 bits para preservar la calidad en partes críticas. El proceso de conversión está documentado en los archivos `BUILD_RECIPE.json` y `conversion_receipt.json` incluidos en el repositorio.

No se dispone de información detallada sobre el entrenamiento del modelo original en los materiales proporcionados. La página oficial de Ornith AI menciona un marco de "self-improvement" en el que el modelo propone tareas, genera scaffolds y produce rollouts para aprendizaje por refuerzo, pero no se ofrecen datos concretos sobre tokens de entrenamiento, composición del dataset o técnicas de alineación como RLHF o DPO. Para esta cuantización, el autor indica que se han realizado pruebas locales de humo (smoke tests) que verifican la integridad estructural, la generación de texto determinista, la respuesta a imágenes y el contrato de tensores MTP.

## Capacidades

- Generación de texto y razonamiento multilingüe (los idiomas exactos no están especificados).
- Comprensión de imágenes y texto (pipeline `image-text-to-text`), con soporte de vídeo según la metadata del modelo.
- Predicción multitoken (MTP) mediante el módulo `mtp/weights.safetensors`, disponible aunque no es el modo por defecto.
- Decodificación especulativa: el modelo admite modos de generación D1, D2 y D3 que ofrecen distintas velocidades de decodificación.
- Integración con el ecosistema MLX-VLM y MTPLX para Apple Silicon.
- Compatibilidad con servidores OpenAI-compatible a través de MTPLX, lo que facilita su uso en aplicaciones existentes.
- Cuantización híbrida que preserva la visión y la recurrencia en BF16, reduciendo la pérdida de calidad en estas partes.

## Casos de uso

- Asistentes multimodales locales en Mac: gracias a su tamaño de 28 GB y a la compatibilidad con MLX-VLM, el modelo puede ejecutarse en un Mac con Apple Silicon para responder preguntas sobre imágenes y mantener conversaciones de contexto largo (hasta 262K tokens).
- Análisis de imágenes en entornos sin GPU NVIDIA: equipos con Apple Silicon pueden procesar imágenes médicas, documentos escaneados o capturas de pantalla sin depender de hardware especializado.
- Prototipado rápido de aplicaciones de visión por computador: la API compatible con OpenAI permite integrar el modelo en pipelines existentes con cambios mínimos, ideal para pruebas de concepto.
- Servicios de atención al cliente con contexto largo: la ventana de 262K tokens permite gestionar conversaciones multi-turno con historiales extensos, aunque se debe validar la calidad de la cuantización en producción.
- Investigación en modelos MoE multimodales: el acceso al código fuente y la licencia MIT facilitan experimentos con cuantización mixta, decodificación especulativa y predicción multitoken en hardware Apple.
- Generación de descripciones y subtitulado de vídeo: el modelo acepta entrada de vídeo (según la metadata), lo que permite generar resúmenes o subtítulos para material audiovisual en local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para esta cuantización en la información disponible. La model card incluye únicamente resultados de validación local en un host con 64 GiB de RAM:

| Prueba | Resultado |
|---|---|
| Smoke de texto determinista | 99,25 tok/s, pico de 25,66 GB |
| Smoke de imagen (MLX-VLM) | 89,90 tok/s, pico de 26,99 GB |
| API OpenAI-compatible | 81,72 tok/s |
| Barrido MTPLX (AR) | 77,30 tok/s |
| Barrido MTPLX (D1) | 53,48 tok/s |
| Barrido MTPLX (D2) | 73,19 tok/s |
| Barrido MTPLX (D3) | 67,53 tok/s |

El autor aclara que estos son resultados locales de humo y ajuste, no afirmaciones amplias de rendimiento. El modelo original aparece en BenchLM con una puntuación pública de 49,27/100 y 18 filas de benchmark, pero los detalles no están disponibles en los materiales proporcionados.

## Requisitos de hardware

- Apple Silicon (M1, M2, M3 o superior) con al menos 32 GB de memoria unificada; se recomiendan 64 GB para mayor comodidad, ya que el host de validación usaba 64 GiB.
- Tamaño del repositorio: 28,12 GB; el modelo padre en BF16 ocupa aproximadamente 72 GB y no cabe en un host de 64 GiB.
- Inferencia con MLX-VLM (para imágenes) y MTPLX (para servidor OpenAI-compatible). No se soportan GPUs NVIDIA ni CUDA.
- Velocidades de decodificación observadas en el host de validación: entre 53 y 99 tok/s según el modo y la carga.
- No se requieren GPUs discretas; la memoria unificada del Apple Silicon es suficiente.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B (original) | 35B MoE, 3B activos | 262K | MIT | BF16 | Modelo padre, requiere ~72 GB, no cabe en 64 GiB |
| Esta cuantización (Shiftedx) | 35B MoE, 3B activos | 262K | MIT | MLX 4-bit/8-bit | 28 GB, optimizado para Apple Silicon |
| Otras cuantizaciones de Shiftedx (ej. ornith-1.0-35b-mxfp4-vision-mtplx) | No disponible | No disponible | MIT | MLX | No se dispone de especificaciones detalladas |

No se dispone de datos de rendimiento comparativo con otros modelos multimodales de tamaño similar (como Qwen2-VL o Llama 3.2 Vision) en la información proporcionada. Se recomienda consultar la página de BenchLM del modelo original para una comparativa más amplia, aunque los resultados no están detallados en los materiales disponibles.

## Limitaciones y advertencias

- La cuantización puede alterar el comportamiento respecto al modelo BF16 original; el autor no ha realizado una verificación completa de paridad.
- No se han publicado benchmarks públicos que validen el rendimiento en tareas estándar (MMLU, HumanEval, etc.) para esta versión cuantizada.
- El módulo MTP está disponible pero no está "promocionado" como modo por defecto; el modo autoregresivo (AR) es el recomendado.
- El modelo está limitado a hardware Apple Silicon (MLX); no es compatible con CUDA o ROCm.
- Los idiomas soportados no están especificados en la model card; se desconoce el alcance multilingüe real.
- No se ha evaluado el sesgo o la seguridad del modelo cuantizado; se recomienda revisar la model card del modelo original para conocer los riesgos asociados.
- El uso en producción debe validarse con pruebas específicas del dominio, dado que la cuantización puede degradar la calidad en tareas sensibles.

## Enlaces

- Repositorio HuggingFace de la cuantización: https://huggingface.co/Shiftedx/ornith-1.5-35b-a3b-attention8-bf16recurrence-vision-mtplx
- Modelo base Ornith-1.5-35B-A3B: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Página oficial de Ornith AI sobre Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Perfil de BenchLM del modelo original: https://benchlm.ai/models/ornith-1-5-35b-a3b
