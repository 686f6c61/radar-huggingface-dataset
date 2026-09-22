# nvidia/GLM-5.3-NVFP4

## Resumen

NVIDIA GLM-5.3-NVFP4 es la versión cuantizada en formato NVFP4 del modelo GLM-5.3 desarrollado por ZAI (zai-org). Se trata de un transformer auto-regresivo con arquitectura de mezcla de expertos (MoE) orientado a razonamiento, generación de código y tareas agénticas, que emplea atención dispersa con un indexador denominado IndexShare para sostener contextos muy largos. La model card declara 753.000 millones de parámetros totales con aproximadamente 40.000 millones activos por token, y una ventana de contexto de hasta 1.000.000 de tokens. NVIDIA no es el autor del modelo original: su aportación es la cuantización a FP4 de 4 bits mediante la librería Model Optimizer (nvidia-modelopt v0.47.0), versión NVFP4 1.0.

El problema que resuelve esta ficha es el de despliegue: un modelo de 753B en precisión completa requiere recursos de memoria muy superiores a los que permite servir de forma económica. La cuantización NVFP4 reduce el peso de los pesos a aproximadamente 0,5 bytes por parámetro, con el repositorio ocupando 464,2 GB, lo que hace viable servirlo en nodos de GPU Blackwell con un número reducido de aceleradores. Es relevante ahora porque los formatos de 4 bits nativos de hardware (FP4 con escalas por bloque) se han convertido en la vía principal para servir modelos MoE de gran tamaño sin multiplicar el coste de inferencia.

La ficha corresponde a un artefacto de inferencia, no a un modelo entrenado desde cero: los datos de entrenamiento originales no están divulgados y la evaluación publicada en la model card se limita a enumerar los benchmarks empleados sobre el modelo base, sin incluir puntuaciones. El repositorio acumula 2.439 descargas y 11 likes en HuggingFace, con licencia NVIDIA Open Model Agreement y uso permitido tanto comercial como no comercial según el texto del autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer auto-regresivo con mezcla de expertos (MoE) y atención dispersa con indexador IndexShare; clase `GlmMoeDsaForCausalLM` |
| Parámetros totales | 753.000 millones según la model card; el recuento de tensores de los safetensors del repo es 390.942.074.880 (~391.000 millones) |
| Parámetros activos | ~40.000 millones (40B) |
| Longitud de contexto | Hasta 1.000.000 de tokens (1M) |
| Tipos de cuantización | NVFP4 (FP4 de 4 bits, versión NVFP4 1.0, cuantizada con nvidia-modelopt v0.47.0); el repo incluye además la etiqueta «8-bit» entre sus tags |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA Open Model Agreement (nvidia-open-model-license); el modelo base conserva la licencia GLM-5.3, incluida en el repositorio |
| Formato de pesos | safetensors (cuantizados en NVFP4) |
| Modalidad de entrada | Texto (string, 1D) |
| Modalidad de salida | Texto (secuencias 1D) |
| Motor de inferencia soportado | SGLang |
| Hardware compatible | Microarquitectura NVIDIA Blackwell |
| Sistema operativo | Linux |
| Versión del modelo | NVFP4 1.0, cuantizado con nvidia-modelopt v0.47.0 |
| Fecha de publicación en HuggingFace | 09/10/2026 (según model card); alta en el repositorio el 14/09/2026, última actualización el 18/09/2026 |
| Tamaño del repositorio | 464,2 GB |
| Modelo base | zai-org/GLM-5.3 |

Nota sobre la discrepancia de parámetros: la model card indica 753B totales y el recuento de safetensors es de aproximadamente 391.000 millones. La información disponible no explica el motivo de la diferencia.

## Arquitectura y entrenamiento

GLM-5.3 es un modelo auto-regresivo basado en transformer con arquitectura de mezcla de expertos (MoE). Según la model card de NVIDIA, emplea atención dispersa con un indexador llamado IndexShare para habilitar el contexto largo, y comparte el modelo base con GLM-5.2, incorporando mejoras procedentes de la fase de post-entrenamiento. La clase de implementación es `GlmMoeDsaForCausalLM`, lo que confirma que se trata de un modelo de lenguaje causal con expertos enrutados. El checkpoint aquí descrito no modifica la arquitectura: es una copia cuantizada del modelo de ZAI.

Respecto al entrenamiento, la información de entrenamiento del modelo original figura como «Undisclosed» (modalidad de datos, método de recogida y etiquetado no divulgados), por lo que no se dispone del número de tokens, la composición del dataset ni si se aplicaron RLHF, DPO u otras técnicas de alineamiento. Lo que sí se documenta es el proceso de cuantización: se usaron dos conjuntos de calibración, `cnn_dailymail` (algo más de 300.000 artículos periodísticos en inglés) y `Nemotron-Post-Training-Dataset-v2` (conversaciones multiturno de temática diversa recopiladas por NVIDIA), con métodos de recogida y etiquetado automatizados. La innovación técnica concreta de este artefacto es la aplicación de NVFP4 1.0 mediante Model Optimizer, es decir, pesos en coma flotante de 4 bits con escalas por bloque, formato soportado de forma nativa por la microarquitectura Blackwell.

## Capacidades

- Generación de texto conversacional en modo texto puro (entrada y salida tipo string).
- Razonamiento y tareas de conocimiento, según la orientación declarada del modelo a razonamiento, código y agentes.
- Generación de código, incluida la evaluación declarada en LiveCodeBench V6 (programación competitiva) y SciCode (código científico).
- Razonamiento matemático, con AIME 2025 entre los benchmarks de evaluación declarados.
- Manejo de contexto largo: ventana de hasta 1.000.000 de tokens, evaluada de forma declarada con AA-LCR (recuperación de información en contextos extensos).
- Seguimiento de instrucciones, evaluado de forma declarada con IFBench.
- Conocimiento multidisciplinar y pregrado/posgrado, evaluado de forma declarada con MMLU Pro y GPQA Diamond.
- Uso en sistemas de agentes y aplicaciones conversacionales, tal como declara la sección de casos de uso de la model card (sistemas de agentes de IA, chatbots y sistemas RAG).
- Modo de pensamiento (thinking), visión, audio, tool calling y function calling: no disponibles en la información proporcionada.

## Casos de uso

- Sistemas de agentes autónomos: la model card sitúa explícitamente los sistemas de agentes de IA como caso de uso previsto; los 40.000 millones de parámetros activos sobre un total de 753.000 millones permiten ejecutar cada paso de razonamiento con un coste de cómputo muy inferior al de un modelo denso equivalente.
- Chatbots de atención al cliente multi-turno: gracias a la ventana de 1M de tokens es posible mantener el historial completo de una conversación o de varias sesiones de un mismo usuario sin truncar el contexto, evitando estrategias de resumen que degradan la coherencia.
- Sistemas RAG sobre corpus extensos: la model card menciona los sistemas RAG entre los usos previstos; con contexto de 1M de tokens se pueden inyectar directamente documentos completos o conjuntos de fragmentos recuperados en lugar de limitarse a los típicos pocos miles de tokens, lo que reduce la pérdida de información en la fase de recuperación.
- Análisis de documentación técnica y científica: la evaluación declarada sobre AA-LCR y SciCode apunta a escenarios de lectura de documentación larga y resolución de problemas de código científico, con el contexto extenso como ventaja diferencial.
- Asistentes de programación integrados en el IDE o en CI/CD: el modelo está orientado a tareas de codificación y evaluado en programación competitiva (LiveCodeBench V6), lo que lo hace adecuado para revisión de código, generación de pruebas y resolución de incidencias sobre repositorios completos cargados en contexto.
- Procesamiento por lotes de documentación en el lado servidor: al estar cuantizado en NVFP4 y soportar SGLang sobre Blackwell, encaja en pipelines de extracción, clasificación y resumen de grandes volúmenes documentales donde el coste por token y la memoria por réplica son los factores limitantes.
- Investigación sobre cuantización y evaluación de precisión: el artefacto sirve como referencia para medir la degradación de un MoE de 753B al pasar a FP4 de 4 bits frente al checkpoint original de ZAI, siempre que se disponga de acceso al modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card enumera los conjuntos de evaluación empleados sobre el modelo base —MMLU Pro, GPQA Diamond, LiveCodeBench V6, SciCode, AIME 2025, AA-LCR e IFBench— pero no incluye puntuaciones numéricas, ni para el modelo original ni para esta versión cuantizada. Tampoco se documenta la pérdida de precisión introducida por la cuantización NVFP4 respecto al checkpoint en precisión completa.

| Benchmark | Resultado GLM-5.3-NVFP4 | Resultado GLM-5.3 (base) |
|---|---|---|
| MMLU Pro | no disponible | no disponible |
| GPQA Diamond | no disponible | no disponible |
| LiveCodeBench V6 | no disponible | no disponible |
| SciCode | no disponible | no disponible |
| AIME 2025 | no disponible | no disponible |
| AA-LCR | no disponible | no disponible |
| IFBench | no disponible | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 464,2 GB, por lo que los pesos en NVFP4 requieren del orden de 465 GB de memoria de acelerador, a lo que hay que sumar la caché KV. El tamaño exacto de la caché KV para una ventana de 1M de tokens no está disponible en la información proporcionada.
- GPU recomendadas: la model card limita la compatibilidad a la microarquitectura NVIDIA Blackwell, es decir, familia B200, GB200 y las GPU Blackwell para estaciones de trabajo. Se necesitan varias unidades: con B200 de 192 GB de HBM harían falta al menos tres aceleradores solo para los pesos, sin margen para caché KV ni activaciones.
- Compatibilidad con GPU de consumo: no. Una RTX 5090 (32 GB) o una RTX PRO 6000 Blackwell (96 GB) no pueden alojar los 464,2 GB de pesos ni siquiera en solitario. No cabe en ninguna GPU de consumo actual.
- Opciones de despliegue: el único motor de inferencia declarado como soportado es SGLang. El soporte de vLLM, llama.cpp, Ollama o TGI no está indicado en la información disponible.
- Sistema operativo y software: Linux, con soporte nativo de CUDA para la microarquitectura Blackwell.
- Latencia y throughput estimados: no disponibles. No se publican cifras de tokens por segundo, tiempo hasta el primer token ni rendimiento por lote.

## Comparativa con modelos similares

La información disponible solo permite comparar el artefacto con el modelo del que deriva. No se dispone de datos de otras alternativas de la misma categoría (MoE de gran tamaño cuantizados en FP4) en el material proporcionado.

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nvidia/GLM-5.3-NVFP4 | 753B totales / 40B activos (según model card) | 1M | NVFP4 (FP4 4 bits) | NVIDIA Open Model Agreement | HuggingFace, 464,2 GB, SGLang, Blackwell |
| zai-org/GLM-5.3 (base) | 753B totales / 40B activos | 1M | Precisión original (no especificada) | Licencia GLM-5.3 | HuggingFace; pesos no optimizados para FP4 |
| zai-org/GLM-5.2 | no disponible | no disponible | no disponible | no disponible | Comparte modelo base con GLM-5.3 según la model card |
| Otras alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Datos de rendimiento ausentes: la model card no publica puntuaciones de benchmarks y no cuantifica la degradación de precisión de NVFP4 frente al modelo original. Cualquier decisión de producción debería ir precedida de una evaluación propia sobre datos del caso de uso.
- Dependencia de hardware muy restrictiva: requiere microarquitectura Blackwell y, dado el tamaño del repositorio, varios aceleradores. Esto excluye el despliegue en GPU de consumo y limita la portabilidad a proveedores con esa generación de hardware.
- Motor de inferencia único documentado: solo SGLang figura como runtime soportado, lo que reduce las opciones de integración y obliga a validar cualquier otro stack por cuenta propia.
- Idiomas no declarados: la información disponible no especifica la cobertura idiomática del modelo base. Los conjuntos de calibración son en inglés (`cnn_dailymail` y Nemotron-Post-Training-Dataset-v2), por lo que el comportamiento en castellano u otros idiomas no está garantizado ni medido.
- Riesgo de alucinación: no se documentan evaluaciones de fiabilidad ni tasas de alucinación. Como en cualquier modelo generativo, la salida debe verificarse antes de usarse en contextos críticos.
- Sesgos: no se publica información sobre sesgos, composición demográfica del corpus ni mitigaciones aplicadas. La sección de datos de entrenamiento figura como «Undisclosed».
- Ambigüedad de licencia: la model card describe la licencia como «NVIDIA Proprietary» y a la vez indica que el modelo está listo para uso comercial o no comercial bajo el NVIDIA Open Model Agreement, que no modifica ni sustituye la licencia GLM-5.3 del modelo base. Antes de un uso comercial conviene revisar ambos textos y, en su caso, la cláusula de consideración de terceros.
- Confusión potencial de etiquetas: el repositorio incluye simultáneamente las etiquetas «8-bit» y «FP4», pese a que el formato descrito es NVFP4 de 4 bits. Conviene no interpretar la etiqueta «8-bit» como indicativa del formato real de los pesos.
- Discrepancia en el recuento de parámetros: la model card indica 753B totales mientras que los safetensors declaran 390.942.074.880 elementos, sin explicación publicada. Afecta a estimaciones de memoria y de coste si se calculan a partir del número de parámetros.
- Contexto largo no validado en este artefacto: aunque la arquitectura soporta 1M de tokens, la información disponible no incluye mediciones de rendimiento ni de precisión en esa longitud para la versión cuantizada, donde la caché KV puede dominar el consumo de memoria.
- Requisitos de validación del propio autor: la model card recomienda pruebas iterativas específicas del caso de uso antes de desplegar el modelo en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nvidia/GLM-5.3-NVFP4
- Modelo base (ZAI, GLM-5.3): https://huggingface.co/zai-org/GLM-5.3
- Licencia del modelo base: https://huggingface.co/zai-org/GLM-5.3/blob/main/LICENSE
- NVIDIA Model Optimizer (repositorio): https://github.com/NVIDIA/Model-Optimizer
- NVIDIA Open Model Agreement: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-agreement/
- Dataset de calibración cnn_dailymail: https://huggingface.co/datasets/abisee/cnn_dailymail
- Dataset de calibración Nemotron-Post-Training-Dataset-v2: https://huggingface.co/datasets/nvidia/Nemotron-Post-Training-Dataset-v2
- Sitio oficial de NVIDIA: https://www.nvidia.com/
