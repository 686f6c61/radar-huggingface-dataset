# Shozi007/Lexi-Llama-3-8B-Uncensored-GGUF

## Resumen

Lexi-Llama-3-8B-Uncensored-GGUF es una distribucion en formato GGUF del modelo Lexi-Llama-3-8B-Uncensored, un ajuste fino (fine-tune) del modelo base Llama 3 de 8B de Meta, publicado originalmente por el usuario Orenguteng. El repositorio que nos ocupa, alojado bajo el identificador Shozi007/Lexi-Llama-3-8B-Uncensored-GGUF, contiene las cuantizaciones generadas con llama.cpp (release b2714) y la tecnica imatrix, empleando el dataset de calibracion publicado por Kalomaze. Su proposito declarado es ofrecer una variante "uncensored" del modelo instruct, es decir, con las capas de rechazo y alineacion relajadas o eliminadas.

El modelo parte de la arquitectura transformer decoder-only de Llama 3, con 8.030.261.248 parametros totales (aproximadamente 8B) y el formato de prompt nativo de Llama 3 basado en cabeceras especiales (`<|start_header_id|>`, `<|end_header_id|>`, `<|eot_id|>`). No es un modelo MoE ni incorpora innovaciones arquitectonicas propias: es un fine-tune sobre la base de Meta empaquetado en cuantizaciones de 1 a 8 bits.

La relevancia de esta ficha es acotada pero concreta: permite ejecutar un modelo de 8B en hardware de consumo gracias a las cuantizaciones de 4 y 5 bits (entre 4,44 GB y 5,73 GB), y esta pensado para escenarios donde el usuario quiere evitar las negativas del modelo alineado. Conviene advertir desde el inicio que el repositorio no incluye model card tecnica detallada, no declara idiomas soportados y no publica resultados de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama 3 soporta 8K, pero no se confirma para este fine-tune) |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_NL, IQ4_XS, Q3_K_L, Q3_K_M, IQ3_M, IQ3_S, Q3_K_S, IQ3_XS, IQ3_XXS, Q2_K, IQ2_M, IQ2_S, IQ2_XS, IQ2_XXS, IQ1_M (y variantes IQ1 adicionales truncadas en la informacion) |
| Idiomas soportados | no disponible |
| Licencia | llama3 (Llama 3 Community License) |
| Formato de pesos | GGUF (cuantizaciones); el modelo original se distribuye en safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3 8B: un transformer decoder-only con atencion multi-cabeza agrupada (GQA), normalizacion RMSNorm y activacion SwiGLU, preentrenado por Meta sobre un corpus multilingue de gran escala. Sobre esa base, Orenguteng aplico un fine-tune con el objetivo declarado de eliminar el comportamiento de rechazo (uncensoring), aunque la informacion disponible no detalla la composicion del dataset de ajuste, el numero de tokens empleados ni si se uso RLHF, DPO o simplemente SFT sobre datos sin filtrar.

La innovacion tecnica de este repositorio concreto no esta en el modelo sino en el proceso de cuantizacion: se empleo la opcion imatrix de llama.cpp (release b2714) con el dataset de calibracion de Kalomaze, lo que mejora la fidelidad de las cuantizaciones de baja precision (especialmente las de la familia IQ) respecto a una cuantizacion estandar. El formato de prompt es el nativo de Llama 3 instruct, con bloques de sistema, usuario y asistente delimitados por cabeceras especiales.

## Capacidades

- Generacion de texto conversacional en formato instruct, siguiendo el esquema de roles de Llama 3.
- Respuestas sin las capas de rechazo tipicas del modelo alineado, lo que incluye contenido que el modelo original declinaria generar.
- Razonamiento general y respuesta a preguntas, heredado del modelo base de 8B.
- Generacion de codigo y texto tecnico, aunque sin garantias de calidad superiores al modelo base.
- Capacidad multilingue presumible por herencia de Llama 3, pero no declarada ni verificada en este repositorio.
- Soporte de tool calling y function calling: no disponible / no declarado.
- Soporte de agentes y razonamiento multi-paso: no declarado especificamente.
- Modo thinking, vision o audio: no disponible (modelo solo texto).

## Casos de uso

- Experimentacion en local con modelos de 8B: gracias a las cuantizaciones Q4_K_M (4,92 GB) o IQ4_XS (4,44 GB), el modelo se puede ejecutar en un portatil con 8-16 GB de RAM usando llama.cpp u Ollama, lo que lo hace util para pruebas de concepto sin GPU dedicada.
- Investigacion sobre alineacion y censura: permite estudiar empiricamente como cambia el comportamiento de un modelo al eliminar las capas de rechazo, comparando respuestas frente al Llama 3 instruct original en el mismo prompt.
- Generacion creativa sin restricciones tematicas: escritura de ficcion, guiones o narrativa con tematicas adultas o controvertidas que el modelo alineado rechazaria; el usuario asume la responsabilidad del contenido generado.
- Prototipado de chatbots con personalidad: al no declinar temas, sirve para construir personajes conversacionales con un rango de respuesta mas amplio, siempre con moderacion externa si el producto es publico.
- Evaluacion de cuantizaciones: el repositorio ofrece una escalera completa de cuantizaciones (de Q8_0 a IQ1), lo que permite medir la degradacion de calidad y perplejidad segun el nivel de compresion en un mismo modelo.
- Despliegue en entornos air-gapped o de baja potencia: al ser GGUF y ejecutable con llama.cpp, se puede integrar en dispositivos sin conexion y con recursos limitados, por ejemplo estaciones de trabajo sin GPU o mini-PC.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente el tamano del archivo GGUF mas el overhead de contexto. Q8_0 requiere unos 8,5 GB; Q6_K unos 6,6 GB; Q5_K_M unos 5,7 GB; Q4_K_M unos 4,9 GB; IQ4_XS unos 4,4 GB; las cuantizaciones de 2-3 bits caben en 2,4-4,3 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para Q4/Q5 (RTX 3060 Ti, RTX 4060, RTX 3070); 12-16 GB para Q6/Q8 (RTX 4070 Ti, RTX 4080, RTX 4090); A100 o H100 solo si se busca throughput alto con batching, no por requisito de memoria.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas con 8 GB o mas usando cuantizaciones Q4_K_M o inferiores; tambien funciona en CPU pura con RAM suficiente.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama, LM Studio, text-generation-webui, y servidores compatibles con la API de endpoints (el tag `endpoints_compatible` sugiere compatibilidad con la API de inferencia de Hugging Face). vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que requeririan convertir a safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Lexi-Llama-3-8B-Uncensored-GGUF (este) | 8B | no disponible | llama3 | GGUF | Fine-tune uncensored, cuantizaciones imatrix |
| Llama 3 8B Instruct (Meta) | 8B | 8K | llama3 | safetensors, GGUF | Modelo base alineado, con rechazos |
| Dolphin-Llama-3-8B | 8B | 8K | llama3 | safetensors, GGUF | Otro fine-tune uncensored popular de la comunidad |
| Mistral 7B Instruct | 7B | 32K | Apache 2.0 | safetensors, GGUF | Alternativa de licencia permisiva y contexto mayor |

La comparativa se limita a datos estructurales: no hay benchmarks publicados para este modelo que permitan comparar rendimiento real frente a las alternativas.

## Limitaciones y advertencias

- Ausencia de model card tecnica: no se documentan datos de entrenamiento, idiomas, contexto ni evaluaciones, lo que impide validar su calidad de forma objetiva.
- Riesgo elevado de contenido danino: al ser un modelo "uncensored", puede generar contenido ilegal, peligroso o gravemente sesgado; requiere moderacion externa obligatoria en cualquier despliegue publico.
- Alucinacion: como todo modelo de 8B sin evaluacion publicada, la tasa de alucinacion no esta medida y puede ser significativa en tareas factuales.
- Sesgos: hereda los sesgos del corpus de Llama 3 y los amplifica al eliminar los filtros de rechazo; no hay evaluacion de sesgo disponible.
- Licencia Llama 3 Community License: impone restricciones de uso (incluida la clausula de 700 millones de usuarios mensuales para licencia comercial adicional) y obligaciones de atribucion; revisar antes de uso comercial.
- Idiomas: no declarados; el rendimiento en castellano no esta verificado y probablemente sea inferior al de modelos entrenados especificamente en espanol.
- Contexto: no confirmado para este fine-tune; asumir 8K como maximo conservador, no los 128K de otras variantes de Llama 3.
- Repositorio con 0 descargas y 0 likes: sin validacion de la comunidad, sin issues ni discusion que permitan detectar problemas.
- El autor del repositorio (Shozi007) no es el autor original del modelo ni de las cuantizaciones (bartowski); es una redistribucion, lo que anade un salto de trazabilidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Shozi007/Lexi-Llama-3-8B-Uncensored-GGUF
- Modelo original: https://huggingface.co/Orenguteng/Lexi-Llama-3-8B-Uncensored
- Cuantizaciones originales de bartowski: https://huggingface.co/bartowski/Lexi-Llama-3-8B-Uncensored-GGUF
- llama.cpp (release b2714): https://github.com/ggerganov/llama.cpp/releases/tag/b2714
- Dataset de calibracion imatrix de Kalomaze: https://github.com/ggerganov/llama.cpp/discussions/5263#discussioncomment-8395384
- Licencia Llama 3: https://llama.meta.com/llama3/license/
