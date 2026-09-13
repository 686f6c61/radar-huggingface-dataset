# fwizzer1/Fwizzer-LFM2.5-VL-3B-RU-GGUF

## Resumen

Fwizzer-LFM2.5-VL-3B-RU-GGUF es un ajuste fino multimodal del modelo LiquidAI/LFM2.5-VL-3B, publicado por el usuario fwizzer1 y optimizado para razonamiento en ruso mediante cadenas de pensamiento explícitas en bloques `<think> ... </think>`. El modelo combina una red neuronal híbrida de tipo Liquid (backbone de 2.69B parámetros) con una torre de visión SigLIP2 de 400M parámetros, lo que le permite procesar simultáneamente texto e imágenes (pipeline `image-text-to-text`). Su ventana de contexto declarada es de 32.768 tokens, ampliable hasta 131k según el autor.

El ajuste se realizó sobre un dataset privado curado, `fwizzer1/fwizzer-v3-titan-agentic`, concreto en el archivo `train_ru_25k.parquet` y 25.000 muestras, con foco declarado en razonamiento reflexivo, OCR de página completa, layout grounding y parsing de geometría 3D para herramientas como Blender 4.x y Godot 4. Se distribuye exclusivamente en formato GGUF con tres niveles de cuantización (Q8_0, Q5_K_M y Q4_K_M) más un proyector visual `mmproj` en f16, lo que lo orienta a inferencia local en llama.cpp, LM Studio y Ollama.

Su relevancia actual radica en que ofrece capacidades multimodales con razonamiento en un paquete de menos de 4 GB, ejecutable en GPU de consumo, y con foco específico en el idioma ruso, un nicho menos cubierto por los modelos abiertos habituales. Como contrapartida, el repositorio no incluye resultados de benchmarks, no documenta el proceso de entrenamiento más allá del dataset, y presenta inconsistencias entre el recuento de parámetros de los safetensors y la arquitectura declarada en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hybrid Liquid Neural Network (backbone Liquid de 2.69B + torre de visión SigLIP2 de 400M) |
| Parametros totales | 2.69B backbone + 400M torre de visión según la model card; 426.285.296 según el recuento real de safetensors (dato incoherente, ver limitaciones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens; ampliable hasta 131k según el autor |
| Tipos de cuantizacion | GGUF Q8_0 (~3,4 GB), Q5_K_M (~2,5 GB), Q4_K_M (~2,1 GB); proyector visual `mmproj-LFM2.5-VL-3B-f16.gguf` (~800 MB) |
| Idiomas soportados | ru, en |
| Licencia | `other` con `license_name: lfm1.0` (licencia propia de Liquid AI; condiciones concretas no disponibles en la información proporcionada) |
| Formato de pesos | GGUF (llama.cpp); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

La arquitectura es híbrida: un backbone de tipo Liquid con 2.69B parámetros, que combina mecanismos de atención con dinámicas de tipo state space propietarias de la familia LFM de Liquid AI, más una torre de visión SigLIP2 de 400M parámetros encargada de proyectar las imágenes al espacio de representación del modelo de lenguaje. El pipeline declarado es `image-text-to-text`, de modo que la entrada puede ser texto, imagen o combinación de ambos. El autor indica que el modelo incorpora razonamiento de cadena de pensamiento inherente, emitido dentro de etiquetas `<think> ... </think>` antes de la respuesta final, y que puede usar secuencias de parada `</think>` y `<|im_end|>`.

El ajuste fino se realizó sobre un dataset privado y curado denominado `fwizzer1/fwizzer-v3-titan-agentic`, con 25.000 muestras en ruso según la model card (`train_ru_25k.parquet`). No se especifica el número total de tokens de entrenamiento, la composición detallada del dataset, la proporción de datos en inglés ni si se aplicaron técnicas de alineación como RLHF, DPO o similares. La model card tampoco detalla si el ajuste congeló alguna parte del backbone o de la torre de visión, ni si se modificaron los hiperparámetros de la arquitectura base. Como resultado, la información sobre el proceso de entrenamiento es notablemente escasa y se limita a la naturaleza del dataset y a la orientación funcional declarada por el autor.

## Capacidades

- Generación de texto y razonamiento analítico en ruso e inglés, con cadena de pensamiento explícita en bloques `<think> ... </think>` antes de la respuesta final.
- Capacidades de visión (VLM): interpretación de imágenes como entrada junto a texto, mediante el proyector SigLIP2 `mmproj`.
- OCR de página completa y layout grounding: parsing nativo de estructura de documentos y detección de objetos, según declara el autor.
- Parsing de geometría 3D y código procedural, con orientación a flujos de trabajo de Blender 4.x y Godot 4.
- Resolución analítica de problemas de forma "reflexiva", según la model card.
- Multilingüismo limitado a ruso e inglés (idiomas declarados en los metadatos).
- Razonamiento multi-paso: la estructura de cadena de pensamiento permite descomposición de tareas, aunque no se documenta soporte formal de agentes.
- Tool calling / function calling: no documentado en la información proporcionada.
- Modo de audio: no disponible.

## Casos de uso

- Digitalización de documentos en ruso: el modelo puede procesar imágenes de páginas completas y extraer texto estructurado gracias a sus capacidades de OCR y layout grounding, con la ventaja de ejecutarse localmente sin enviar documentos sensibles a APIs externas.
- Extracción de datos de facturas, formularios y contratos: combinando entrada de imagen y salida estructurada, resulta adecuado para pipelines de contabilidad o gestión documental en organizaciones rusoparlantes.
- Asistencia técnica y atención al cliente en ruso: el modelo mantiene conversaciones multi-turno apoyándose en su ventana de 32.768 tokens, suficiente para incorporar manuales o historiales de incidencia extensos en el contexto.
- Generación y revisión de código para Blender y Godot: el autor declara capacidades específicas de parsing procedural y geometría 3D, lo que permite usarlo como asistente para scripts de addons, shaders o escenas.
- Análisis de diagramas técnicos y planos: la combinación de visión y razonamiento paso a paso permite interpretar esquemáticos o capturas de herramientas y razonar sobre ellos antes de responder.
- Tutoría y asistencia educativa en ruso: la cadena de pensamiento explícita hace visible el proceso de resolución, lo que resulta útil en explicaciones de matemáticas o ciencias paso a paso.
- Despliegue local en entornos aislados o air-gapped: con cuantizaciones de entre 2,1 y 3,4 GB más 800 MB de proyector visual, el modelo cabe en equipos de consumo y puede operar sin conexión.
- Prototipado rápido de aplicaciones multimodales: la disponibilidad de GGUF y el soporte directo en LM Studio y Ollama reducen el coste de puesta en marcha frente a alternativas que requieren infraestructura de GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K, MMMU, DocVQA ni de ninguna otra evaluación estandarizada, ni tampoco comparaciones cuantitativas con el modelo base LiquidAI/LFM2.5-VL-3B. Los únicos datos numéricos aportados por el autor son afirmaciones cualitativas sobre las cuantizaciones (por ejemplo, "99,9 % de precisión, sin degradación del razonamiento" para Q8_0), sin metodología ni mediciones asociadas.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + proyector visual `mmproj` f16, sin contar caché KV):
  - Q4_K_M: ~2,1 GB + ~0,8 GB = aproximadamente 2,9 GB.
  - Q5_K_M: ~2,5 GB + ~0,8 GB = aproximadamente 3,3 GB.
  - Q8_0: ~3,4 GB + ~0,8 GB = aproximadamente 4,2 GB.
- La caché KV para 32.768 tokens añade consumo adicional no cuantificado en la información proporcionada; conviene reservar margen por encima de las cifras anteriores.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM para las cuantizaciones Q4_K_M y Q5_K_M; 8 GB o más para Q8_0 con contexto largo. Una RTX 3060 de 12 GB, una RTX 4060 Ti de 16 GB o una RTX 4090 de 24 GB son opciones holgadas. GPU de datacenter (A100, H100) no son necesarias para este tamaño.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU actuales con 6 GB o más de VRAM, y potencialmente en modo CPU con llama.cpp si la VRAM es insuficiente.
- Opciones de despliegue: llama.cpp, LM Studio (detección automática del `mmproj`), Ollama y cualquier runtime compatible con GGUF. El autor documenta explícitamente el flujo de LM Studio.
- Parámetros de generación recomendados por el autor: temperatura 0,6, top-p 0,95, min-p 0,05, repetition penalty 1,05, con secuencias de parada `</think>` y `<|im_end|>`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

La información disponible no incluye benchmarks ni especificaciones detalladas de alternativas, por lo que la comparación cuantitativa no es posible. La tabla siguiente recoge únicamente los datos verificables frente al modelo base.

| Modelo | Parametros | Contexto | Idiomas | Formato | Licencia | Benchmark |
|---|---|---|---|---|---|---|
| Fwizzer-LFM2.5-VL-3B-RU-GGUF | 2.69B backbone + 400M visión (según model card) | 32.768 tokens (hasta 131k según el autor) | ru, en | GGUF (Q8_0, Q5_K_M, Q4_K_M) | lfm1.0 | no disponible |
| LiquidAI/LFM2.5-VL-3B (modelo base) | no disponible en la información proporcionada | no disponible | no disponible | safetensors (según el campo `base_model:quantized`) | lfm1.0 | no disponible |
| Otras familias VLM de ~3B (Qwen2.5-VL, SmolVLM, Gemma 3) | no disponible en la información proporcionada | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo con alternativas de la misma categoría, por lo que cualquier afirmación de superioridad o inferioridad sería especulativa.

## Limitaciones y advertencias

- Incoherencia en los metadatos: el recuento real de parámetros en safetensors (426.285.296, unos 426M) no concuerda con los 2.69B de backbone más 400M de visión declarados en la model card. El dato debe tratarse con cautela hasta que el autor lo aclare.
- Incoherencia en los tamaños: el repositorio ocupa 0,9 GB, mientras que la model card describe archivos de 3,4 GB, 2,5 GB, 2,1 GB y 800 MB. Es posible que los pesos no estén efectivamente alojados o que el repositorio esté incompleto.
- Ausencia total de benchmarks: no hay evidencia cuantitativa de calidad, y las afirmaciones de "99,9 % de precisión" para Q8_0 carecen de metodología.
- Riesgo de alucinación: inherente a los modelos generativos de este tamaño, especialmente en tareas de OCR o extracción de datos donde una cifra o un campo mal transcrito puede pasar desapercibido.
- Sesgos conocidos: no documentados por el autor. Al estar ajustado sobre un dataset privado de 25.000 muestras en ruso, puede heredar sesgos de esa fuente, no auditable públicamente.
- Cobertura idiomática limitada: solo ruso e inglés declarados; el rendimiento en castellano u otros idiomas no está garantizado y probablemente sea deficiente.
- Licencia `lfm1.0` (licencia propia de Liquid AI, etiquetada como `other`): no es una licencia de código abierto estándar. Las condiciones exactas de uso comercial no están disponibles en la información proporcionada y deben verificarse en el texto completo de la licencia antes de cualquier despliegue en producción.
- Procedencia del ajuste: el dataset de entrenamiento es privado y no auditable, y no se documentan procesos de alineación, evaluación de seguridad ni filtrado de datos.
- Trazabilidad baja: cero descargas y cero "likes" en el momento de la consulta, sin historial de mantenimiento ni comunidad que valide el modelo.
- Soporte de agentes y tool calling no documentado: no debe asumirse compatibilidad con function calling sin verificación previa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fwizzer1/Fwizzer-LFM2.5-VL-3B-RU-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-VL-3B
- Dataset de entrenamiento declarado: https://huggingface.co/datasets/fwizzer1/fwizzer-v3-titan-agentic
- Paper, blog o repositorio adicionales: no disponibles. La búsqueda web realizada no devolvió resultados relevantes sobre este modelo (los resultados obtenidos correspondían a contenidos sin relación con el tema).
