# qtum/GLM-5.3-Flash-GGUF

## Resumen

GLM-5.3-Flash-GGUF es una colección de cuantizaciones GGUF del modelo GLM-5.3-Flash (también conocido como ox-alpha), desarrollado por Z.ai y cuantizado por el usuario qtum. Este modelo pertenece a la serie GLM-5 y destaca por su arquitectura de mezcla de expertos (MoE) con 320.000 millones de parámetros totales y solo 18.000 millones activos por token, lo que permite un rendimiento elevado con un coste computacional relativamente bajo. Su ventana de contexto alcanza hasta 1 millón de tokens, una característica clave para tareas que requieren procesar documentos extensos o mantener conversaciones de largo recorrido.

La relevancia de esta versión cuantizada radica en que hace viable la ejecución local del modelo en hardware de gama alta, algo que con los pesos originales en BF16 (583 GiB) resultaría impracticable para la mayoría de los entornos. Las cuantizaciones ofrecen distintos equilibrios entre tamaño y calidad, desde IQ4_XS (155 GiB) hasta IQ1_M (65 GiB), todas calibradas con imatrix y distribuidas en 15 shards. El modelo base, GLM-5.3-Flash, es descrito por fuentes externas como un modelo multimodal que supera a GLM-5.2 y rivaliza con Claude Opus 4.8 en tareas de código y agentes, aunque la model card de HuggingFace no detalla estas capacidades.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE hibrida: 34 capas de atencion lineal KDA + 11 capas de atencion dispersa DSA, sobre MLA, con Manifold-Constrained Hyper-Connections (mHC) |
| Parametros totales | 313.326.811.966 (≈320B) |
| Parametros activos | 18B (por token) |
| Longitud de contexto | 1.000.000 (1M) |
| Tipos de cuantizacion | IQ4_XS, IQ3_XXS, IQ2_XS, IQ1_M (el master BF16 no esta incluido en el repo) |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La arquitectura de GLM-5.3-Flash es una mezcla de expertos (MoE) con 288 expertos y enrutamiento top-8, más un experto compartido que se ejecuta en cada token. La atención es híbrida: 34 capas utilizan atención lineal KDA (Kernel-based Dual Attention) y 11 capas emplean atención dispersa DSA (Dense-Sparse Attention), ambas construidas sobre la base de MLA (Multi-head Latent Attention). El modelo incorpora además Manifold-Constrained Hyper-Connections (mHC), un mecanismo que conecta capas de forma restringida para mejorar la estabilidad del entrenamiento y la calidad de la representación.

En cuanto a los datos de entrenamiento, la información proporcionada no especifica el número de tokens, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO. La model card de HuggingFace solo indica que el modelo base fue entrenado por Z.ai y que la cuantización se realizó sobre los pesos oficiales en BF16. La capa NextN (MTP, Multi-Token Prediction) presente en el checkpoint original fue excluida durante la conversión a GGUF mediante la opción `--no-mtp`, por lo que estos archivos contienen únicamente los tensores del modelo principal.

## Capacidades

- Generación de texto y razonamiento: el modelo es capaz de producir texto coherente y realizar tareas de razonamiento complejo, según las afirmaciones de rendimiento publicadas por Z.ai.
- Generación de código: fuentes externas indican que GLM-5.3-Flash destaca en tareas de programación, rivalizando con modelos propietarios de alto nivel.
- Soporte para agentes y multi-step reasoning: la documentación externa menciona que el modelo obtiene buenos resultados en benchmarks de agentes, lo que sugiere capacidad para planificar y ejecutar secuencias de acciones.
- Tool calling / function calling: aunque no se menciona explícitamente en la model card, la orientación a agentes implica soporte para invocación de herramientas.
- Capacidades multimodales: según la documentación de Unsloth y Atomic.chat, el modelo es nativamente multimodal (procesa imagen y texto), aunque la model card de HuggingFace no lo detalla y el pipeline declarado es solo text-generation.
- Multilingüe: soporta inglés y chino, según los metadatos de HuggingFace.

## Casos de uso

- Análisis de documentos extensos: gracias a su ventana de contexto de 1M tokens, el modelo puede procesar libros completos, expedientes legales o informes técnicos de cientos de páginas en una sola pasada, extrayendo información relevante y resumiendo contenidos.
- Generación de código en producción: con su capacidad para código y su soporte para tool calling, puede integrarse en pipelines de CI/CD para generar tests, documentar APIs o refactorizar módulos, siempre que se valide su salida con pruebas automatizadas.
- Agentes autónomos de investigación: el modelo puede encadenar búsquedas web, consultas a bases de datos y razonamiento multi-paso para recopilar información y producir informes estructurados, gracias a su arquitectura orientada a agentes.
- Atención al cliente multilingüe: con soporte para inglés y chino, y contexto largo, puede gestionar conversaciones multi-turno con historial extenso, manteniendo coherencia y recordando detalles de interacciones previas.
- Prototipado rápido de aplicaciones de IA: al poder ejecutarse localmente con cuantizaciones como IQ4_XS, permite a equipos de desarrollo experimentar con un modelo de alto rendimiento sin depender de APIs externas, reduciendo costes y latencia.
- Investigación académica en procesamiento de lenguaje natural: su arquitectura híbrida (atención lineal + dispersa) y su disponibilidad en formato GGUF lo convierten en un objeto de estudio interesante para investigar sobre eficiencia de MoE y atención de largo contexto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información proporcionada. La única métrica disponible es la perplejidad (PPL) sobre wikitext-2, medida por el autor de la cuantización. Estos valores solo son comparables dentro de esta tabla, tal como advierte el propio autor.

| Cuantizacion | Tamano | PPL (wikitext-2, n_ctx=512) |
|---|---|---|
| BF16 (master, no incluido) | 583 GiB | 6.6974 ± 0.34871 |
| IQ4_XS | 155 GiB | 7.1537 ± 0.37538 |
| IQ3_XXS | 112 GiB | 8.2485 ± 0.41877 |
| IQ2_XS | 85 GiB | 20.2651 ± 1.10727 |
| IQ1_M | 65 GiB | 73.9234 ± 4.73259 |

Las mediciones se realizaron en 7× H100 80GB con el mismo comando para todas las variantes. Se observa una degradación severa en IQ2_XS e IQ1_M, por lo que el autor recomienda usar IQ4_XS o IQ3_XXS siempre que el hardware lo permita.

## Requisitos de hardware

- VRAM estimada para inferencia: para IQ4_XS (155 GiB) se necesitan al menos 160 GB de VRAM, lo que implica 2× A100 80GB o 2× H100 80GB. Para IQ3_XXS (112 GiB) se requieren aproximadamente 120 GB (2× 80GB). IQ2_XS (85 GiB) cabe en una GPU de 80GB con margen ajustado, e IQ1_M (65 GiB) también cabe en una sola GPU de 80GB.
- GPUs recomendadas: A100 80GB, H100 80GB, o GPUs consumer de gama alta como RTX 4090 (24GB) no son suficientes para ninguna de las cuantizaciones, ya que el archivo más pequeño (IQ1_M) supera los 65 GiB. Se necesitan configuraciones multi-GPU o GPUs de datacenter.
- Opciones de despliegue: llama.cpp (compatible con el formato GGUF), así como herramientas que lo usan como backend (Ollama, LM Studio, etc.). El autor recomienda no pasar `-ngl` manualmente, dejando que llama.cpp ajuste automáticamente la distribución de capas según la VRAM disponible.
- Latencia y throughput: no se han publicado datos concretos de latencia o tokens por segundo. Dado el tamaño del modelo y la cuantización, se espera un throughput moderado en configuraciones multi-GPU, pero no hay cifras oficiales.

## Comparativa con modelos similares

No se dispone de datos cuantitativos de benchmarks para comparar GLM-5.3-Flash con otros modelos de la misma categoría. Sin embargo, se puede establecer una comparación estructural con su hermano mayor, GLM-5.3, y con otros MoE de gran escala:

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| GLM-5.3-Flash (este repo) | 320B | 18B | 1M | MIT | GGUF |
| GLM-5.3 (modelo completo) | no disponible | no disponible | 1M | MIT | no disponible |
| DeepSeek-V3 (referencia) | 671B | 37B | 128K | MIT | no disponible |

La comparación con DeepSeek-V3 es orientativa, ya que no se han encontrado benchmarks que enfrenten ambos modelos. GLM-5.3-Flash se posiciona como una opción más ligera que GLM-5.3, con un coste de inferencia menor (18B activos frente a los parámetros totales del modelo completo), manteniendo un contexto de 1M. No hay datos suficientes para una comparativa cuantitativa rigurosa.

## Limitaciones y advertencias

- Degradación en cuantizaciones bajas: IQ2_XS e IQ1_M muestran un aumento drástico de la perplejidad (20.27 y 73.92 respectivamente, frente a 6.70 del BF16), lo que indica una pérdida significativa de calidad. No se recomiendan para tareas que requieran alta fidelidad.
- Idiomas limitados: el modelo solo soporta inglés y chino. No se garantiza un rendimiento adecuado en otros idiomas, incluido el español.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar información falsa o inventada, especialmente en tareas de razonamiento complejo o cuando se le pide información factual no presente en sus datos de entrenamiento.
- Sesgos potenciales: no se han publicado evaluaciones de sesgos para este modelo. Al estar entrenado principalmente con datos en inglés y chino, puede reflejar sesgos culturales y lingüísticos de esos dominios.
- Requisitos de hardware elevados: incluso la cuantización más pequeña (IQ1_M, 65 GiB) requiere una GPU de 80GB o configuración multi-GPU, lo que limita su uso a entornos con hardware de datacenter.
- Licencia MIT: permite uso comercial sin restricciones, pero el usuario debe asumir la responsabilidad del uso del modelo y sus posibles sesgos o errores.
- La capa MTP (NextN) no está incluida en los archivos GGUF, por lo que no se dispone de la predicción multi-token que podría mejorar la velocidad de generación.

## Enlaces

- Repositorio HuggingFace de la cuantización: https://huggingface.co/qtum/GLM-5.3-Flash-GGUF
- Modelo base (zai-org/GLM-5.3-Flash): https://huggingface.co/zai-org/GLM-5.3-Flash
- Guia de Unsloth para ejecutar GLM-5.3-Flash localmente: https://unsloth.ai/docs/models/glm-5.3-flash
- Guia de Atomic.chat sobre hardware y benchmarks: https://atomic.chat/blog/guides/how-to-run-glm-5-3-flash-locally
- Documentacion de Unsloth para GLM-5.3 (modelo completo): https://unsloth.ai/docs/models/glm-5.3
