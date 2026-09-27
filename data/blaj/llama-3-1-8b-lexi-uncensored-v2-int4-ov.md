# blaj/Llama-3.1-8B-Lexi-Uncensored-V2-int4-ov

## Resumen

Llama-3.1-8B-Lexi-Uncensored-V2-int4-ov es una conversión a OpenVINO IR del modelo Orenguteng/Llama-3.1-8B-Lexi-Uncensored-V2, un fine-tune de Meta Llama 3.1 8B Instruct al que se le han eliminado los rechazos de seguridad (técnica conocida como abliteration). La conversión la publica el usuario blaj en Hugging Face y su objetivo es ejecutar el modelo en hardware Intel sin GPU dedicada, comprimiendo los pesos a int4 asimétrico con grupo de 128.

Técnicamente es un transformer denso de tipo `LlamaForCausalLM` con 32 capas, dimensión oculta 4096 y vocabulario de 128.256 tokens. El repositorio contiene únicamente el grafo IR (XML/BIN), con un tamaño de 4,7 GB según Hugging Face y 4,4 GB según la model card, y expone estado interno mediante `beam_idx`. Se distribuyen también dos builds hermanos, int8 y fp16.

Su relevancia ahora es doble: por un lado, la cuantización int4 permite servir un modelo de 8.000 millones de parámetros en iGPU Intel Arc integradas (Core Ultra) con un rendimiento de 23,5 tokens/s medido; por otro, al ser una variante sin filtrado de contenido, resulta útil para investigación sobre mecanismos de rechazo, red-teaming y generación de datos, siempre bajo la licencia comunitaria de Llama 3.1.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `LlamaForCausalLM` (transformer denso, decoder-only), 32 capas, hidden 4096 |
| Parámetros totales | 8.000 millones (8B) |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | 131.072 tokens según fuentes externas sobre el modelo base; la model card de esta conversión no lo especifica |
| Tipos de cuantización | int4 asimétrico, grupo 128 (este build); builds hermanos en int8 y fp16 |
| Idiomas soportados | no disponible (la model card no los especifica) |
| Licencia | llama3.1 (META LLAMA 3.1 COMMUNITY LICENSE AGREEMENT) |
| Formato de pesos | OpenVINO IR (XML/BIN); origen BF16 safetensors en 4 shards |
| Vocabulario | 128.256 tokens |
| Tamaño del repositorio | 4,7 GB (Hugging Face) / 4,4 GB (model card) |
| Estado interno | sí, `beam_idx` expuesto (modelo stateful) |
| Dispositivo objetivo | GPU (Intel Arc iGPU / dGPU), también CPU vía OpenVINO |
| Librería | openvino |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only estándar de la familia Llama 3.1, con 32 capas, dimensión oculta 4096 y vocabulario de 128.256 tokens. No incorpora mecanismos alternativos como MoE, SSM o atención lineal: es un transformer denso clásico con atención por causalidad. La model card no documenta el proceso de entrenamiento del fine-tune original (número de tokens, composición del dataset, uso de RLHF o DPO); solo indica que se trata de un fine-tune no censurado sobre Llama 3.1 8B Instruct procedente de Orenguteng.

La aportación técnica de este repositorio concreto es la cadena de conversión. El autor partió de safetensors en BF16 (4 shards), aplicó `optimum-cli export openvino --task text-generation-with-past --weight-format fp16` con transformers 5.5.0 y optimum-intel 2.2.0, y después aplicó `nncf.compress_weights` sobre el IR ya exportado. El autor señala explícitamente que la exportación directa a int4 en una sola pasada provoca OOM en una máquina de 30 GB para esta clase de tamaño, de ahí el enfoque en dos etapas. El resultado es un IR stateful que expone `beam_idx` para reutilizar el estado de la atención entre peticiones.

## Capacidades

- Generación de texto y conversación multi-turno en formato instruct, heredada de Llama 3.1 8B Instruct.
- Razonamiento y conocimiento general propios de un modelo de 8B de la generación Llama 3.1.
- Generación de código y tareas de matemáticas básicas, sin datos de benchmark específicos en la información disponible.
- Ventana de contexto larga (131.072 tokens según fuentes externas sobre el modelo base), adecuada para documentos extensos.
- Cumplimiento sin rechazos: el fine-tune elimina las negativas de seguridad, por lo que responde a peticiones que un modelo alineado rechazaría.
- Soporte de tool calling / function calling: no documentado en esta conversión. El modelo base Llama 3.1 8B Instruct lo soporta de forma nativa, pero no hay confirmación de que el fine-tune no censurado lo preserve.
- Capacidades de agente y razonamiento multi-paso: no documentadas para este build.
- Visión: una fuente externa (aquanode.io) afirma que el modelo "lee imágenes junto a texto"; esta afirmación es inconsistente con la arquitectura declarada (`LlamaForCausalLM`, vocabulario 128.256, sin torre visual) y no aparece en la model card. Se considera no verificada.
- Inferencia en dispositivos Intel: al estar en formato OpenVINO IR, se ejecuta en CPU, iGPU Arc y dGPU Intel a través de OpenVINO Runtime y OpenVINO Model Server.

## Casos de uso

- Despliegue local en portátiles con Intel Core Ultra: el build int4 ocupa menos de 5 GB y se sirve en la iGPU Arc integrada a 23,5 tokens/s, lo que permite asistentes conversacionales totalmente offline sin GPU dedicada.
- Investigación sobre alineación y abliteration: comparar las respuestas de este modelo con las de Llama 3.1 8B Instruct permite estudiar qué circuitos internos implementan el rechazo y cómo se degradan otras capacidades al eliminarlo.
- Red-teaming y evaluación de seguridad: al no filtrar salidas, sirve como generador de peticiones y respuestas adversarias para probar clasificadores de contenido y sistemas de moderación propios.
- Generación de datos sintéticos para entrenar moderadores: se pueden producir ejemplos etiquetados de contenido sensible que después se usan para ajustar un clasificador; el texto generado no debe publicarse sin revisión.
- Escritura creativa y ficción sin restricciones: narrativa con violencia, temáticas adultas o lenguaje explícito que los modelos alineados suelen rechazar, en un entorno local y privado.
- Traducción y resumen de documentación sensible (informes médicos, legales, peritajes) donde un modelo alineado puede negarse a procesar el contenido literal.
- Prototipado de pipelines OpenVINO/OVMS: el repositorio incluye un `ovms_config.json` de ejemplo y sirve como banco de pruebas para medir rendimiento int4 frente a int8 y fp16 en el mismo hardware.
- Base para un ajuste posterior con capa de alineación propia: la model card recomienda explícitamente implementar un sistema de moderación antes de exponerlo como servicio.

## Benchmarks y rendimiento

La model card solo publica una medición de throughput de decodificación, no resultados de calidad (MMLU, HumanEval, GSM8K, etc.):

| Build | tok/s | Relativo a int4 |
|---|---|---|
| int4 (este build) | 23,5 | 1,00x |
| int8 | 11,3 | 0,48x |
| fp16 | 6,0 | 0,26x |

Condiciones de la medición: single-stream, Intel Core Ultra 7 258V (iGPU Arc 130V/140V), 30 GB de RAM, OpenVINO Model Server 2026.4.0 sobre GPU, decodificación greedy, 128 tokens nuevos como máximo, media de 3 ejecuciones tras warmup. El autor indica que la decodificación en esa iGPU está limitada por ancho de banda de memoria, por lo que el throughput escala casi exactamente con el tamaño del modelo.

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM/peso en disco para int4: 4,4-4,7 GB de pesos, más overhead de runtime y caché KV. Estimación de huella total en iGPU/dGPU: en torno a 5-6 GB con contextos cortos.
- int8: aproximadamente el doble de peso que int4 (repo hermano disponible), con 11,3 tok/s medidos en el mismo hardware.
- fp16: aproximadamente 16-17 GB de pesos (repo hermano disponible), con 6,0 tok/s medidos en la misma iGPU.
- Hardware validado: Intel Core Ultra 7 258V con iGPU Arc 130V/140V y 30 GB de RAM, sirviendo con OpenVINO Model Server sobre GPU.
- Cabe en GPU de consumo: el build int4 entra sin problema en iGPU Intel Arc integradas; en GPUs dedicadas de consumo (por ejemplo, RTX 3060 12 GB o superiores) también cabría, aunque la conversión está orientada a OpenVINO, no a CUDA.
- Contexto largo y caché KV: con ventanas cercanas a los 131.072 tokens, la caché KV crece de forma lineal y puede superar con holgura el tamaño de los pesos; en un portátil con memoria unificada conviene limitar la longitud de contexto o usar cuantización de la caché.
- Opciones de despliegue: OpenVINO Model Server (OVMS) con `target_device: GPU` y configuración de streams consumida del repositorio; OpenVINO Runtime desde Python con optimum-intel. Este artefacto IR no se carga en vLLM ni llama.cpp.
- Alternativas para otros runtimes: existen builds GGUF del modelo original para llama.cpp, Ollama y LM Studio, si se prefiere evitar OpenVINO.
- Latencia y throughput: 23,5 tok/s single-stream en el hardware de referencia (int4). No hay datos de latencia de primer token ni de throughput por lotes.

## Comparativa con modelos similares

Comparativa limitada a los artefactos y modelos sobre los que hay datos en la información disponible:

| Modelo | Parámetros | Formato | Contexto | Rendimiento medido | Licencia |
|---|---|---|---|---|---|
| blaj/Llama-3.1-8B-Lexi-Uncensored-V2-int4-ov | 8B | OpenVINO IR int4 | no especificado (base: 131.072) | 23,5 tok/s | llama3.1 |
| blaj/...-int8-ov | 8B | OpenVINO IR int8 | no especificado | 11,3 tok/s | llama3.1 |
| blaj/...-fp16-ov | 8B | OpenVINO IR fp16 | no especificado | 6,0 tok/s | llama3.1 |
| Orenguteng/Llama-3.1-8B-Lexi-Uncensored-V2 (base del fine-tune) | 8B | safetensors (BF16) y GGUF | 131.072 según fuentes externas | no disponible | llama3.1 |
| Meta Llama 3.1 8B Instruct (origen) | 8B | safetensors | 128.000 | no disponible aquí | llama3.1 |

No se dispone de datos de benchmarks que permitan comparar la calidad del modelo frente a alternativas de otros fabricantes (Qwen, Mistral, Gemma, etc.), por lo que esa comparación se marca como no disponible.

## Limitaciones y advertencias

- Contenido no filtrado: es un fine-tune no censurado. La model card advierte de que las salidas no están filtradas y que debe evaluarse antes de desplegarlo. El propio autor recomienda implementar una capa de alineación propia antes de exponerlo como servicio.
- Riesgo elevado de uso indebido: el modelo cumplirá peticiones incluso poco éticas, según la documentación del modelo original. No es apto para aplicaciones de cara al público sin moderación externa.
- Alucinación: no hay evaluación publicada de fidelidad factual para este fine-tune; se asume el comportamiento típico de un 8B, con tendencia a inventar datos en dominios especializados.
- Idiomas: la model card de esta conversión no especifica idiomas soportados. El fine-tune no documenta su cobertura lingüística, por lo que el rendimiento fuera del inglés no está garantizado.
- Sin benchmarks de calidad: no hay MMLU, HumanEval, GSM8K ni evaluaciones de seguridad publicadas, lo que impide cuantificar cuánto degrada el proceso de abliteration las capacidades del modelo original.
- Función de tool calling y agentes: no documentada tras el fine-tune; no debe asumirse que funcione en producción sin validación previa.
- Afirmación de capacidades de visión no verificada: una fuente externa atribuye entrada de imágenes al modelo, algo incoherente con la arquitectura declarada y ausente de la model card. No debe asumirse soporte multimodal.
- Restricciones de licencia: se aplica la Llama 3.1 Community License. Incluye obligaciones de atribución y condiciones específicas para despliegues a gran escala (cláusula de usuarios activos mensuales), además de restricciones de uso aceptable que el propio fine-tune incumple conceptualmente al no filtrar contenido. Conviene revisar el texto completo de la licencia antes de uso comercial.
- Dependencia de runtime: el IR requiere OpenVINO; no es portable a vLLM, TGI o llama.cpp sin reconvertir. El rendimiento medido (23,5 tok/s) corresponde a un hardware concreto y a decodificación greedy single-stream: no debe extrapolarse a otros equipos ni a cargas por lotes.
- Atribución del artefacto: el repositorio lo publica un tercero (blaj), no el autor del fine-tune ni Meta. No hay garantía de mantenimiento, versionado ni reproducibilidad de la conversión más allá de las notas publicadas.

## Enlaces

- Repositorio Hugging Face (int4, OpenVINO IR): https://huggingface.co/blaj/Llama-3.1-8B-Lexi-Uncensored-V2-int4-ov
- Build hermano int8: https://huggingface.co/blaj/Llama-3.1-8B-Lexi-Uncensored-V2-int8-ov
- Build hermano fp16: https://huggingface.co/blaj/Llama-3.1-8B-Lexi-Uncensored-V2-fp16-ov
- Modelo base del fine-tune: https://huggingface.co/Orenguteng/Llama-3.1-8B-Lexi-Uncensored-V2
- Referencia de builds GGUF del modelo base: https://secretai.io/models/Orenguteng/Llama-3.1-8B-Lexi-Uncensored-V2-GGUF
- Ficha de despliegue local del modelo base (Private LLM): https://privatellm.app/models/llama-3.1-8b-lexi-uncensored-v2
- Ficha de especificaciones y VRAM del modelo base (Aquanode): https://www.aquanode.io/models/llama-3-1-8b-lexi-uncensored-v2
