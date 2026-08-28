# MESHIVEAI/Qwen-3.8-27B-Q4_K_M-Imatrix

## Resumen

El modelo MESHIVEAI/Qwen-3.8-27B-Q4_K_M-Imatrix es una cuantización GGUF en formato Q4_K_M del modelo Qwen3.8-27B, desarrollado por Alibaba y publicado por el usuario MESHIVEAI. Esta versión cuantizada utiliza una matriz de importancia (imatrix) personalizada, calibrada sobre el dataset Wikitext, para optimizar la asignación de precisión durante la cuantización. El objetivo es reducir el tamaño del modelo (de unos 54 GB en FP16 a 15,65 GiB) manteniendo la mayor fidelidad posible respecto al original, lo que permite ejecutarlo en hardware de consumo con pérdidas mínimas de calidad.

El modelo base Qwen3.8-27B es un modelo denso multimodal de 27 320 millones de parámetros, con una arquitectura híbrida que combina 48 capas Gated DeltaNet y 17 capas de atención completa, lo que le otorga una ventana de contexto nativa de 262 144 tokens. Destaca en tareas de codificación, flujos de trabajo agénticos y automatización de oficina. Esta cuantización concreta ha sido medida de forma exhaustiva por su autor, que reporta una divergencia KL un 31 % menor frente a la misma cuantización sin imatrix, y una degradación de perplejidad de solo +0,0092 puntos respecto al modelo F16 de referencia.

La relevancia de esta ficha radica en que ofrece una opción práctica para desplegar un modelo de 27B con capacidades multimodales y contexto largo en GPUs de 24 GB, algo poco habitual en esta categoría de tamaño. Además, la documentación incluye mediciones de velocidad y requisitos de VRAM detallados, lo que facilita la planificación de despliegues en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 65 bloques (48 Gated DeltaNet + 17 full attention) |
| Parametros totales | 27 320 697 856 (27,32 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens (entrenamiento); ~130 000 tokens efectivos en la práctica (ver limitaciones) |
| Tipos de cuantizacion | Q4_K_M (con imatrix); también disponible Q4_K_M sin imatrix para comparación |
| Idiomas soportados | Inglés, coreano (según la model card; el modelo base puede soportar más) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura híbrida denominada `qwen35`, compuesta por 65 bloques de los cuales 48 son capas Gated DeltaNet (un tipo de red recurrente con estado constante) y 17 son capas de atención completa. Esta combinación reduce el crecimiento del caché KV durante la generación, lo que permite mantener una velocidad de generación relativamente plana incluso con contextos largos. El vocabulario tiene 248 320 tokens y el contexto de entrenamiento declarado es de 262 144 tokens.

La cuantización Q4_K_M se realizó a partir del GGUF F16 del modelo base, utilizando una matriz de importancia (imatrix) calibrada sobre 326 000 tokens de Wikitext. El autor documenta el proceso de medición: se comparó esta versión con la misma cuantización sin imatrix y con el F16 de referencia, evaluando divergencia KL, acuerdo de token superior, perplejidad y otras métricas sobre el conjunto de test completo de Wikitext-2 (296 960 tokens). No se proporcionan detalles sobre el entrenamiento del modelo base (datos, número de tokens, técnicas de alineación como RLHF o DPO), ya que esa información corresponde al repositorio original de Alibaba.

## Capacidades

- Generación de texto y razonamiento complejo, con soporte para tareas de codificación, matemáticas y análisis técnico.
- Tool calling y function calling: el modelo incluye una plantilla de chat específica de Qwen3.5 incrustada en el GGUF; si se respeta, permite invocar herramientas de forma fiable.
- Capacidades agénticas: diseñado para flujos de trabajo multi-paso y tareas de larga duración (long-horizon), como automatización de oficina o coordinación de agentes.
- Multimodalidad (en el modelo base): aunque esta cuantización se publica como text-generation, el modelo original soporta entrada de imágenes; la versión GGUF puede no conservar esta capacidad según el runtime.
- Razonamiento configurable: el modelo base admite modos de razonamiento explícito (thinking mode) que se pueden activar o desactivar según la tarea.
- Multilingüe: la model card declara inglés y coreano, aunque el modelo base probablemente cubra más idiomas.

## Casos de uso

- Asistente de programación en local: el modelo puede generar código, explicar fragmentos y refactorizar proyectos. Su ventana de contexto de 128k efectivos permite cargar repositorios completos o archivos largos sin perder el hilo. Se integraría con herramientas como llama.cpp o Ollama en una estación de trabajo con GPU de 24 GB.
- Automatización de tareas de oficina: gracias a su capacidad para manejar instrucciones complejas y multi-paso, puede redactar informes, resumir documentos extensos o extraer datos de correos y actas. El contexto largo permite procesar documentos de decenas de páginas en una sola pasada.
- Agente conversacional para atención al cliente: con soporte de tool calling y una plantilla de chat específica, puede gestionar conversaciones multi-turno, consultar bases de conocimiento externas y ejecutar acciones (crear tickets, actualizar registros) mediante llamadas a API.
- Análisis de documentos legales o financieros: la ventana de 128k tokens permite procesar contratos, informes anuales o expedientes completos, extrayendo cláusulas relevantes o detectando inconsistencias. El modo de razonamiento configurable ayuda a justificar las conclusiones.
- Generación de código en producción con pipelines de CI/CD: el modelo puede integrarse como backend de autocompletado o revisión de código en entornos locales, sin depender de servicios en la nube. Su licencia Apache 2.0 permite uso comercial sin restricciones.
- Investigación académica en procesamiento de lenguaje natural: al ser una cuantización de alta calidad con métricas documentadas, sirve como punto de referencia para estudiar el impacto de la cuantización en modelos híbridos, o como base para experimentos de generación de texto en inglés y coreano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card se centra en métricas de calidad de cuantización, comparando esta versión con la misma cuantización sin imatrix y con el modelo F16 de referencia. Los datos medidos son los siguientes:

| Metrica | Este modelo (imatrix) | Misma cuantizacion sin imatrix | Mejora |
|---|---|---|---|
| Divergencia KL media (menor es mejor) | 0,017486 ± 0,000201 | 0,025196 ± 0,000291 | −31 % |
| Acuerdo de token superior (mayor es mejor) | 94,18 % ± 0,06 | 92,97 % ± 0,07 | +1,21 pp |
| RMS Δp | 3,583 % ± 0,034 | 4,305 % ± 0,040 | −17 % |
| Media Δp | −0,124 % ± 0,009 | −0,195 % ± 0,011 | −36 % |
| Perplejidad (Wikitext-2) | 6,9619 | 6,9755 | — |
| ΔPPL vs F16 | +0,0092 ± 0,0041 | +0,0228 ± 0,0050 | −60 % |

La perplejidad del modelo F16 de referencia es 6,9527 ± 0,0450. En la comprobación fuera de dominio con coreano (Wikipedia coreana, 1 123 328 tokens), la perplejidad de este modelo es 6,9485 frente a 6,9596 de la versión sin imatrix, con una degradación del +1,02 % frente al F16 (6,8782). El autor indica que la ventaja de la imatrix se mantiene en texto fuera de dominio, aunque el margen es menor.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan 15,65 GiB. Con contexto de 8k se necesitan aproximadamente 18 GB; con 32k, ~20 GB; con 64k, ~23 GB; con 128k, ~27 GB. Estas cifras incluyen el caché KV en F16 y pueden reducirse a la mitad usando `--cache-type-k q8_0 --cache-type-v q8_0`.
- GPU recomendadas: una tarjeta con 24 GB de VRAM (por ejemplo, RTX 3090, RTX 4090) es suficiente para contextos de hasta 64k. Para 128k se recomienda una GPU de 32 GB (como A6000 o RTX PRO 6000). En CPU, se necesitan al menos 32 GB de RAM.
- Compatibilidad con GPU de consumo: sí, cualquier GPU con 24 GB puede ejecutar el modelo con contextos moderados. Con 16 GB no es suficiente.
- Opciones de despliegue: llama.cpp (build reciente con soporte `qwen35`), llama-server (compatible con API OpenAI), Ollama y LM Studio. Todos requieren versiones actualizadas que soporten la arquitectura híbrida.
- Latencia y throughput medidos (en RTX PRO 6000 Blackwell, 96 GB, CUDA 13.0, llama.cpp `d077b4c21`): prefill de 4 019 t/s a contexto 0, 3 474 t/s a 16k, 2 276 t/s a 65k y 1 571 t/s a 131k. Generación: 79,85 t/s a contexto 0, 73,83 t/s a 16k, 64,37 t/s a 65k y 54,85 t/s a 131k. La generación retiene el 69 % de su velocidad a 128k de contexto, gracias a la arquitectura híbrida.

## Comparativa con modelos similares

La información disponible permite comparar esta cuantización con el modelo base F16 y con la misma cuantización sin imatrix. No se dispone de datos para comparar con otros modelos de 27B (por ejemplo, Llama 3.1 8B o Qwen2.5-27B) en la documentación consultada.

| Modelo | Parametros | Contexto | Perplejidad (Wikitext-2) | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-27B (F16) | 27,32 B | 262 144 | 6,9527 | Apache 2.0 | safetensors / GGUF |
| Qwen-3.8-27B-Q4_K_M-Imatrix (este) | 27,32 B | 262 144 (efectivo ~130k) | 6,9619 | Apache 2.0 | GGUF |
| Qwen-3.8-27B-Q4_K_M (sin imatrix) | 27,32 B | 262 144 (efectivo ~130k) | 6,9755 | Apache 2.0 | GGUF |

La ventaja principal de la versión con imatrix es una menor divergencia KL y una degradación de perplejidad significativamente menor frente al F16, con el mismo tamaño de archivo. En términos de velocidad, no hay diferencias entre ambas cuantizaciones, ya que el tamaño de los tensores es idéntico.

## Limitaciones y advertencias

- Contexto por encima de ~130 000 tokens está roto en las versiones actuales de llama.cpp para modelos `qwen35` híbridos. Aunque el modelo declara 262 144 tokens de contexto, en la práctica no se recomienda superar 128k para evitar errores o degradación severa.
- La plantilla de chat es específica de Qwen3.5 y está incrustada en el GGUF. No se debe sobrescribir con ChatML ni configurar manualmente, ya que degrada la calidad de salida y rompe el tool calling.
- La imatrix se calibró únicamente con texto en inglés. En texto fuera de dominio (por ejemplo, coreano), la ventaja frente a la versión sin imatrix se reduce, aunque sigue siendo positiva. El modelo puede presentar un rendimiento inferior en idiomas no representados en la calibración.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar información plausible pero incorrecta, especialmente en tareas de razonamiento complejo o con contextos muy largos. Se recomienda verificar las salidas en aplicaciones críticas.
- Sesgos: no se han documentado sesgos específicos en esta cuantización, pero el modelo base puede heredar sesgos de sus datos de entrenamiento, que no se detallan en la documentación disponible.
- Requisito de versiones recientes: los runtimes deben incluir soporte para la arquitectura `qwen35`; versiones antiguas de llama.cpp, Ollama o LM Studio fallarán al cargar el modelo con errores de tensor o arquitectura.
- La cuantización Q4_K_M introduce una pérdida de calidad inherente (perplejidad +0,0092 frente a F16). Para aplicaciones que requieran máxima fidelidad, se recomienda usar el modelo en FP16 o FP8 si el hardware lo permite.

## Enlaces

- Modelo cuantizado en Hugging Face: https://huggingface.co/MESHIVEAI/Qwen-3.8-27B-Q4_K_M-Imatrix
- Modelo base en Hugging Face: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio oficial de Qwen3.8-27B en GitHub: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Guía de ejecución local (Substack): https://linas.substack.com/p/qwen3-8-27b-local-guide
- Página de Qwen3.8 en LM Studio: https://lmstudio.ai/models/qwen3.8
