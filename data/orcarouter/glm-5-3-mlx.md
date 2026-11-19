# orcarouter/GLM-5.3-MLX

## Resumen

GLM-5.3-MLX es una compilación en formato MLX del modelo oficial `zai-org/GLM-5.3`, publicada por orcarouter. Se trata de la cuantización del modelo insignia de Z.AI, un Mixture-of-Experts (MoE) de 753B parámetros totales y aproximadamente 39B activos por token, construido sobre la arquitectura propietaria `glm_moe_dsa` que combina MLA (Multi-head Latent Attention) con atención dispersa de inspiración DeepSeek y un indexador compartido. El objetivo de esta variante es hacer viable la inferencia del modelo completo en Apple Silicon (y en el backend CUDA de MLX) mediante cuantización dinámica sensible a la sensibilidad de cada tensor.

La relevancia de esta publicación radica en que permite ejecutar localmente un modelo de frontera orientado a programación y flujos agénticos de largo horizonte con una ventana de contexto de 1M tokens, algo que hasta ahora requería infraestructura de centro de datos. El autor distribuye cuatro precisiones (2, 3, 4 y 6 bits) como subcarpetas del repositorio, con la versión de 4 bits replicada en la raíz. La cuantización emplea OrcaSAQ, un método sin calibración que asigna más bits a los tensores sensibles (expertos compartidos +2 bits, `down_proj` +1 bit) y mantiene la atención en 8 bits y el indexador DSA en BF16 en todas las variantes.

El repositorio tiene un tamaño de 1.820 GB y presenta un volumen de descargas moderado (2.556) y 14 likes, lo que sugiere un uso especializado en entornos de estación de trabajo con memoria unificada muy amplia. Los pesos están en safetensors con cuantización MLX, y la licencia es la propia del modelo base (`glm-5.3`), no una licencia de código abierto estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `glm_moe_dsa` (MoE con MLA y atención dispersa tipo DeepSeek con indexador compartido) |
| Parametros totales | 753B (803.774.997.504 según safetensors) |
| Parametros activos | ~39B |
| Longitud de contexto | 1M tokens |
| Tipos de cuantizacion | 2, 3, 4 y 6 bits (OrcaSAQ dinámica; atención a 8 bits e indexador DSA en BF16 en todas las variantes) |
| Idiomas soportados | en, zh |
| Licencia | `glm-5.3` (license: other) |
| Formato de pesos | MLX safetensors (subcarpetas `2-bit/`, `3-bit/`, `4-bit/`, `6-bit/`; 4 bits en la raíz) |

## Arquitectura y entrenamiento

El modelo base es un transformer disperso de tipo Mixture-of-Experts con 753B parámetros totales y unos 39B activos por token, lo que sitúa su coste computacional por paso en el orden de un modelo denso de 39B. La arquitectura `glm_moe_dsa` incorpora Multi-head Latent Attention (MLA) para comprimir el estado KV y atención dispersa con un indexador compartido, un diseño que reduce el coste de atención sobre secuencias muy largas y habilita la ventana de 1M tokens. No se dispone de información sobre el número de tokens de entrenamiento, la composición del corpus ni si se aplicaron etapas de RLHF o DPO en la información proporcionada.

La innovación técnica de esta publicación concreta no está en el entrenamiento sino en la cuantización: OrcaSAQ (Sensitivity-Aware Quantization) es un método sin calibración y consciente de la arquitectura que asigna precisión de forma no uniforme. Los expertos compartidos reciben 2 bits adicionales y las proyecciones `down_proj` 1 bit adicional, mientras que las capas de atención se mantienen a 8 bits y el indexador DSA permanece en BF16 en las cuatro variantes. El tamaño de grupo es 64 para 3, 4 y 6 bits, y 32 para 2 bits. El resultado son artefactos de 671 GB (6 bits), 459 GB (4 bits), 368 GB (3 bits) y 322 GB (2 bits).

## Capacidades

- Generación de texto conversacional y razonamiento de múltiples pasos, con orientación declarada a ingeniería agéntica de largo horizonte.
- Programación y generación de código, posicionado por el autor como modelo de frontera para coding.
- Razonamiento extendido (*thinking*) implícito en la etiqueta `reasoning` del modelo base.
- Soporte de flujos agénticos y ejecución de tareas encadenadas sobre contexto largo gracias a la ventana de 1M tokens.
- Capacidades multilingües limitadas a inglés y chino según la model card.
- Inferencia en Apple Silicon mediante MLX y en el backend CUDA de MLX.
- No se documentan en la información disponible capacidades de visión, audio ni detalles explícitos sobre tool calling o function calling.

## Casos de uso

- Revisión de pull requests en local: el modelo puede analizar diffs y repositorios completos aprovechando el contexto de 1M tokens; el propio autor ofrece OrcaCode Review como integración de referencia para esta tarea.
- Asistencia de programación en estación de trabajo Apple Silicon: con la variante de 4 bits (459 GB) y un Mac con memoria unificada de 512 GB o superior, se puede mantener un asistente de código de frontera sin enviar código a la nube.
- Refactorización de bases de código extensas: la ventana de 1M tokens permite cargar módulos completos y sus dependencias en una sola pasada, algo útil para migraciones de API o cambios transversales.
- Agentes autónomos de ingeniería: tareas de varios pasos con lectura de ficheros, ejecución de pruebas y corrección iterativa, donde los ~39B parámetros activos mantienen el coste por token contenido frente a un denso equivalente.
- Procesamiento de documentación técnica en inglés o chino: resumen y extracción estructurada de manuales, especificaciones y bases de conocimiento en los dos idiomas soportados.
- Experimentación e investigación en cuantización: las cuatro precisiones publicadas permiten estudiar la degradación de calidad frente a FP8 (el autor califica la de 6 bits como casi sin pérdida y la de 4 bits como valor por defecto recomendado) sobre un modelo de escala frontera.
- Despliegue tras una puerta de enlace propia: el modelo puede servirse con MLX y exponerse mediante Orca Connect u otra capa compatible con la API de OpenAI para uso interno del equipo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente incluye una valoración cualitativa de la calidad de cada cuantización respecto a FP8 (6 bits: casi sin pérdida; 4 bits: muy buena, recomendada; 3 bits: buena, agresiva pero usable; 2 bits: sin valoración completa en el extracto disponible).

## Requisitos de hardware

- Memoria mínima estimada por variante, según el autor: ~700 GB (6 bits), ~480 GB (4 bits), ~390 GB (3 bits) y ~340 GB (2 bits).
- Tamaño en disco de los pesos: 671 GB, 459 GB, 368 GB y 322 GB respectivamente.
- No cabe en ninguna GPU de consumo convencional: incluso la variante de 2 bits exige ~340 GB, muy por encima de los 24 GB de una RTX 4090 o los 32 GB de una RTX 5090.
- En Apple Silicon requiere configuraciones de memoria unificada de 512 GB o más (Mac Studio M3 Ultra con 512 GB, por ejemplo) para la variante de 4 bits; la de 6 bits queda al límite o fuera de rango en el hardware actual.
- En CUDA, el backend MLX permite desplegar sobre nodos con múltiples aceleradores, pero no se dispone de datos de rendimiento ni de recetas de tensor parallelism en la información proporcionada.
- Opciones de despliegue: MLX (librería declarada), backend CUDA de MLX y servicio vía OrcaRouter como API alojada. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para estos pesos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | Formato / cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.3-MLX (esta ficha) | 753B / ~39B | 1M | MLX safetensors, 2-6 bits | `glm-5.3` (other) | Hugging Face, 4 variantes |
| zai-org/GLM-5.3 (base) | 753B / ~39B | 1M | Pesos originales (no detallado) | `glm-5.3` (other) | Hugging Face y API en OrcaRouter |
| Alternativas de escala comparable | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de rendimiento ni de especificaciones verificadas de otros modelos de la misma categoría que permitan una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Requisitos de memoria extremos: la variante más pequeña necesita ~340 GB, lo que excluye GPU de consumo y limita el despliegue a estaciones de trabajo de gama muy alta o clústeres.
- Solo inglés y chino declarados; el rendimiento en castellano no está garantizado ni documentado.
- La licencia `glm-5.3` es una licencia propia con condiciones adicionales; debe revisarse el fichero LICENSE antes de cualquier uso comercial.
- Riesgo de alucinación inherente a los modelos de lenguaje de gran escala; no se documentan evaluaciones de fidelidad factual en la información disponible.
- La cuantización a 2 y 3 bits puede degradar de forma apreciable tareas sensibles a precisión numérica, como matemáticas o generación de código con dependencias finas; el autor solo recomienda 4 bits como valor por defecto.
- No se documentan sesgos conocidos, pero al no haber información sobre la composición del corpus de entrenamiento no es posible evaluar sesgos lingüísticos o culturales.
- No se confirma soporte de tool calling ni de plantillas de chat específicas en esta compilación MLX; conviene validarlo antes de integrarlo en pipelines agénticos.
- El repositorio incluye promociones comerciales de OrcaRouter en la model card; no deben confundirse con especificaciones técnicas del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/orcarouter/GLM-5.3-MLX
- Modelo base: https://huggingface.co/zai-org/GLM-5.3
- Licencia: https://huggingface.co/orcarouter/GLM-5.3-MLX/blob/main/LICENSE
- Paper referenciado (arXiv:2602.15763): https://arxiv.org/abs/2602.15763
- Sitio del autor: https://www.orcarouter.ai
- Catálogo de modelos: https://www.orcarouter.ai/models
- API alojada de GLM-5.3: https://www.orcarouter.ai/models/z-ai/glm-5.3
- GitHub del autor: https://github.com/Continuum-AI-Corp
- OrcaCode Review: https://github.com/Continuum-AI-Corp/Orca-Code-Review
- Discord: https://discord.gg/yAh6Tex6kx
- X: https://x.com/OrcaRouter
