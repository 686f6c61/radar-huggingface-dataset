# alea-institute/alea-foundations-6B-A2B-f1-step48149

## Resumen

ALEA Foundations 6B-A2B es un modelo de lenguaje base de tipo mixture-of-experts (MoE) desarrollado por el ALEA Institute, con 5.983.272.064 parámetros totales y 2.001.960.064 parámetros activos por token. Este checkpoint corresponde al final de la etapa de preentrenamiento amplio F1 (paso 48.149) y acumula 22.751.215.616 posiciones de entrenamiento a lo largo de su linaje. Está implementado sobre la clase stock `Qwen3MoeForCausalLM` de `transformers` (`model_type: qwen3_moe`), sin código personalizado, lo que facilita su integración en pipelines existentes.

El modelo desciende de cuatro especialistas pequeños (aritmética, lógica y razonamiento, semántica y código) ensamblados y entrenados conjuntamente; posteriormente se expandió en profundidad y anchura hasta la arquitectura actual de 38 capas y se sometió a una fase de preentrenamiento amplio con una mezcla de datos sesgada hacia documentos naturales, datos legales y datos sintéticos propios. Su ventana de contexto es de 8.192 tokens y su vocabulario de 32.768 tokens con el tokenizador propietario ALEA R4.

Es relevante porque combina una arquitectura MoE eficiente (solo el 33,5 % de los parámetros se activan por token) con un enfoque de datos fuertemente orientado a dominios legales y de conocimiento estructurado, y se distribuye bajo licencia CC-BY-4.0, lo que permite uso comercial con atribución. No obstante, se trata de un modelo base sin ajuste de instrucciones, entrenado únicamente en inglés y con datos de benchmarks no publicados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only MoE (`Qwen3MoeForCausalLM`, `model_type: qwen3_moe`) |
| Parametros totales | 5.983.272.064 |
| Parametros activos | 2.001.960.064 (embeddings, atención, capas densas y 10 expertos seleccionados por capa MoE) |
| Longitud de contexto | 8.192 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | cc-by-4.0 |
| Formato de pesos | safetensors (float32, 12 shards, ~24 GB); repo de 23,9 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only con 38 capas: 4 capas densas (índices 0-3), 30 capas MoE (índices 4-33) y 4 capas densas finales (índices 34-37). El tamaño oculto es 1.920, con atención causal de grupo (GQA) de 30 cabezas de consulta y 10 cabezas KV, dimensión de cabeza 64 y RMSNorm en Q/K. Cada capa MoE contiene 40 expertos con enrutamiento top-10, pesos de enrutamiento normalizados y FFN de experto de anchura 768 (SwiGLU); las capas densas usan FFN de anchura 5.120 (SwiGLU). La codificación posicional es RoPE con theta 10.000 sin escalado, el vocabulario es de 32.768 tokens (tokenizador ALEA R4) y los embeddings de entrada están atados a la proyección de salida. No hay bloques recurrentes ni de pesos compartidos.

El entrenamiento se estructuró en cuatro fases. Primero, entrenamiento conjunto de un padre de 26 capas (2,68B totales / 1,09B activos) durante 10.129.768.448 posiciones. Segundo, expansión en profundidad y anchura: se insertaron 12 bloques MoE como copias de bloques existentes con sus proyecciones de salida de atención y de experto a cero, y se ampliaron los FFN de experto de 512 a 768 canales con los nuevos canales a cero; en un fixture de CPU el modelo expandido reprodujo las salidas del padre (argmax coincidente, diferencias de logit ~1e-5). Tercero, entrenamiento conjunto continuado del modelo de 38 capas sobre la misma mezcla: 1.000.079.360 posiciones (warmup de 100 actualizaciones de 1e-5 a 1e-4, decaimiento coseno a 1e-5) más 870.318.080 posiciones a 1e-5 constante, completando un presupuesto de 12.000.165.888 posiciones (checkpoint `step7137`). Cuarto, preentrenamiento amplio F1 sobre una mezcla más amplia: 10.751.049.728 posiciones adicionales con estado de modelo, optimizador, data-loader y RNG heredado del paso 7137; tasa de aprendizaje 1e-5, rampa lineal en 100 actualizaciones hasta 3e-5 en el paso 13.417 y de nuevo hasta 5e-5 en el paso 21.149, mantenida después; en el paso 27.171 se reescalaron los pesos de salida de la capacidad añadida para igualar su RMS al de sus pares preexistentes.

El entrenamiento usó AdamW (betas 0,9/0,999, epsilon 1e-8, weight decay 0,1, gradient clipping 1,0), 262.144 posiciones por actualización (32 secuencias de 8.192 tokens), cómputo BF16 con pesos maestros y estado del optimizador en FP32, sobre dos GPU H100 de 80 GB. Las posiciones son exposiciones de entrenamiento, no tokens únicos: las mezclas se muestrearon con replay. Los datos provienen de fuentes de dominio público o de uso permisivo, datasets publicados por ALEA y datos sintéticos generados por ALEA. La mezcla conjunta (12,0B posiciones) se compuso de documentos naturales KL3M (30,0 %), conocimiento core ALEA (25,0 %), libros de Project Gutenberg (10,0 %), canon legal y jurisprudencia (10,0 %), lógica y razonamiento (7,5 %), aritmética (10,0 %), familias de tareas ALEA (5,0 %) y código sintético (2,5 %). La mezcla F1 (vista de 14,79B posiciones, de las que se consumieron ~10,75B) se compuso de documentos naturales (45,2 %), datos sintéticos y código de ALEA foundations (25,0 %), ejemplos de tareas (14,9 %), canon legal (9,9 %), libros (4,3 %) y prosa derivada de Wikidata (0,8 %); la composición medida de las primeras 1,0B posiciones consumidas quedó dentro de 0,3 puntos porcentuales de estas cuotas.

## Capacidades

- Generación de texto autoregresiva como modelo base, sin ajuste de instrucciones ni de chat.
- Razonamiento lógico y matemático: el linaje incluye especialistas de aritmética y de lógica/razonamiento (OpenLemma/Axeyum) con un 10 % y un 7,5 % de la mezcla conjunta respectivamente.
- Conocimiento estructurado y factual: entrenado con OpenGloss v2.4, OpenGloss full articles, OpenGloss-Edu, facts y SHELF (25 % de la mezcla conjunta).
- Dominio legal: canon legal, estatutos, regulaciones, índice de citas y jurisprudencia presentes en ambas mezclas (10 % en la conjunta, 9,9 % en F1).
- Generación de código: datos sintéticos de código de ALEA (2,5 % en la mezcla conjunta, incluidos en el 25 % de sintéticos y código en F1).
- Capacidades multilingües: limitadas al inglés según la model card (`language: en`).
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades especiales (thinking mode, visión, audio): no disponible en la información proporcionada.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere despliegue en infraestructura de inferencia compatible con la API de Hugging Face, aunque no se detallan los endpoints concretos.

## Casos de uso

- Análisis y redacción de documentos legales: el modelo puede procesar contratos, estatutos y jurisprudencia dentro de su ventana de 8.192 tokens y generar borradores o resúmenes, gracias al peso específico del canon legal y la jurisprudencia en ambas mezclas de entrenamiento (10 % y 9,9 %).
- Extracción de información de filings financieros: entrenado con documentos EDGAR (formularios SEC, contratos) dentro de los documentos naturales KL3M (30 % de la mezcla conjunta, 45,2 % de la vista F1), es adecuado para tareas de parsing y resumen de informes regulatorios.
- Generación asistida de código en pipelines internos: los datos sintéticos de código de ALEA permiten su uso como base para fine-tuning supervisado en tareas de autocompletado o generación de fragmentos, aunque requiere ajuste posterior por ser un modelo base.
- Razonamiento aritmético y lógico como componente de sistemas mayores: la inclusión de especialistas de aritmética (10 %) y lógica (7,5 %) lo hace útil como motor de razonamiento en pipelines de verificación o resolución de problemas, siempre con validación externa.
- Fine-tuning para dominios regulados: al ser un modelo base con licencia CC-BY-4.0, puede ajustarse con datos propios de sectores como seguros, banca o administración pública para tareas de clasificación y generación documental.
- Investigación sobre arquitecturas MoE: su implementación stock en `transformers` (`qwen3_moe`) y la documentación detallada del proceso de expansión de profundidad/anchura lo convierten en un caso de estudio reproducible para experimentos de crecimiento de modelos.
- Despliegue en entornos con recursos limitados: con 2,0B parámetros activos por token, la inferencia es más económica que la de un modelo denso de 6B, lo que facilita su uso en servicios con restricciones de latencia y VRAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente incluye una tabla de entropía cruzada de desarrollo (nats por token objetivo supervisado, ~65K objetivos por dominio) medida con los conjuntos de diagnóstico del propio proyecto, que tienen solapamiento parcial conocido con las fuentes de entrenamiento. Estos valores son diagnósticos, no precisión de benchmark, y valores más bajos no implican por sí mismos mayor capacidad. La tabla aparece truncada en la información proporcionada (corta en el paso 71), por lo que no se reproducen cifras.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos almacenados en float32 ocupan aproximadamente 24 GB (12 shards safetensors); en BF16 serían ~12 GB y en cuantizaciones de 8 bits ~6 GB, aunque no se han publicado configuraciones de cuantización oficiales.
- GPU recomendadas: el entrenamiento se realizó en dos H100 de 80 GB; para inferencia en precisión completa se recomienda al menos una A100 80 GB o H100.
- GPU de consumo: con cuantización a 8 bits o inferior podría caber en GPUs de consumo de 16-24 GB (RTX 4090, RTX 4080), aunque no hay datos publicados de soporte ni de calidad tras cuantización.
- Opciones de despliegue: al usar la clase stock `Qwen3MoeForCausalLM` de `transformers`, es compatible con ecosistemas que soportan `qwen3_moe` (vLLM, TGI, llama.cpp/Ollama si existe conversión GGUF, no confirmada). La etiqueta `endpoints_compatible` indica compatibilidad con endpoints de Hugging Face.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ALEA Foundations 6B-A2B | 5,98B | 2,00B | 8.192 | CC-BY-4.0 | Hugging Face |
| Qwen3 MoE (variantes de ~6B) | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion |
| Alternativas MoE de ~6B | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa fiable. La arquitectura declarada (`qwen3_moe`) sugiere parentesco estructural con la familia Qwen3 MoE, pero no se confirma en la información disponible.

## Limitaciones y advertencias

- Modelo base sin ajuste de instrucciones: no está diseñado para responder a instrucciones directas ni para conversación; requiere fine-tuning o prompting específico para tareas concretas.
- Entrenado únicamente en inglés: su rendimiento en castellano u otros idiomas no está garantizado y probablemente sea deficiente.
- Ventana de contexto de 8.192 tokens: insuficiente para documentos largos o conversaciones multi-turno extensas sin técnicas de recuperación externa.
- Riesgo de alucinación: al ser un modelo base entrenado con datos sintéticos y con replay de posiciones, puede generar contenido plausible pero incorrecto, especialmente en dominios factuales y legales.
- Sesgos conocidos: no se documentan en la información disponible; la mezcla de datos está sesgada hacia fuentes estadounidenses (EDGAR, US Code, CFR, GovInfo), lo que puede introducir sesgo geográfico y regulatorio.
- Datos de diagnóstico con solapamiento parcial con entrenamiento: la entropía cruzada de desarrollo no es una medida limpia de generalización.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero exige cumplir las condiciones de la licencia y no ofrece garantías.
- Sin datos de benchmarks ni de cuantización publicados: la evaluación en producción requiere validación propia.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema y soporte comunitario inexistentes.

## Enlaces

- Hugging Face: https://huggingface.co/alea-institute/alea-foundations-6B-A2B-f1-step48149
- Checkpoint anterior (final del entrenamiento conjunto): https://huggingface.co/alea-institute/alea-foundations-6B-A2B-joint12b-step7137
- Resultados de búsqueda web: no se han encontrado enlaces relevantes al modelo en la búsqueda proporcionada (los resultados corresponden a empresas y proyectos no relacionados).
