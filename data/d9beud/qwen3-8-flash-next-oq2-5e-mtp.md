# d9beuD/Qwen3.8-Flash-Next-oQ2.5e-mtp

## Resumen

Qwen3.8-Flash-Next-oQ2.5e-mtp es una cuantización comunitaria en formato MLX del modelo multimodal Qwen/Qwen3.8-Flash-Next, publicada por el usuario d9beuD. No se trata de un modelo entrenado desde cero, sino de una conversión de pesos con el nivel oQ 2.5 de la herramienta oQe (oMLX v0.7.0), que aplica cuantización de precisión mixta ponderada por matriz de importancia (imatrix). El resultado es un checkpoint de aproximadamente 71 GB que ocupa unos 3,15 bits efectivos por peso, con la mayor parte de los parámetros (66,9%) a 2 bits y un 29,0% a 3 bits.

El modelo base es un MoE multimodal de la familia Qwen3.8, con 125.000 millones de parámetros principales más 51.000 millones en embeddings N-gram, y unos 6.000 millones de parámetros activos por token. La ventana de contexto declarada es de 262.144 tokens y la arquitectura se presenta como un anticipo de la que usará Qwen4: atención híbrida GDN (Gated DeltaNet) más QSA, con mejoras en atención, residual, embeddings y optimización. Incluye codificador de visión y una cabeza de predicción multi-token (MTP) preservada.

Su relevancia es doble. Por un lado, permite ejecutar localmente en Apple Silicon un modelo de ~180.000 millones de parámetros totales que en bf16 no cabría en la mayoría de equipos de consumo. Por otro, sirve como material de estudio para evaluar el impacto real de la cuantización agresiva a 2 bits sobre un MoE multimodal con contexto muy largo, algo poco documentado hasta ahora.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE multimodal con atención híbrida GDN (Gated DeltaNet) + QSA; tipo de modelo `qwen4_exp` |
| Parámetros totales | 179.999.981.459 (recuento de safetensors del repositorio); fuentes web indican 125.000 M de modelo principal + 51.000 M de embeddings N-gram |
| Parámetros activos | ~6.000 millones por token |
| Longitud de contexto | 262.144 tokens (según fuentes web sobre el modelo base) |
| Tipos de cuantización | oQ 2.5 (precisión mixta imatrix): 2 bits por defecto, con mezcla de 8 bits (2,5%), 5 bits (0,3%), 4 bits (1,4%), 3 bits (29,0%) y 2 bits (66,9%); ~3,15 bits efectivos por peso |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (`license: other`) |
| Formato de pesos | MLX safetensors (dtype bfloat16 en pesos no cuantizados, escalas y sesgos) |
| Tamaño del repositorio | 71,0 GB (~71 GB de pesos) |
| Group size | 64 por defecto; algunos módulos usan 32 o 128 |
| Modelo base | Qwen/Qwen3.8-Flash-Next |
| Cabeza MTP | Preservada (`mtp_num_hidden_layers: 1`) |
| Codificador de visión | Incluido |
| Tabla de embeddings N-gram | Incluida |
| Librería | mlx |
| Fecha de creación | 2026-10-05 |

## Arquitectura y entrenamiento

La arquitectura del modelo base combina atención híbrida: Gated DeltaNet (GDN) junto con QSA, dentro de un diseño MoE multimodal. La documentación oficial de Qwen describe el lanzamiento como un anticipo de la arquitectura de Qwen4, con mejoras sistemáticas en cuatro frentes (atención, residual, embeddings y optimización) orientadas a capacidad, eficiencia computacional y estabilidad de entrenamiento. El modelo activa unos 6.000 millones de parámetros por token de un total cercano a 180.000 millones, e incorpora una tabla de embeddings N-gram de 51.000 millones de parámetros, además de un codificador de visión que habilita la entrada de imagen y texto.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni la aplicación de técnicas de ajuste como RLHF o DPO en la información proporcionada.

La innovación de esta ficha concreta es el proceso de cuantización. Se aplicó oQe (oMLX v0.7.0) con cuantización de precisión mixta ponderada por matriz de importancia. El conjunto de calibración fue `oqe_code_multilingual`, con 1.024 muestras de 512 tokens en 8 rondas adaptativas (entre 128 y 1.024 muestras). La recolección de la matriz se hizo capa a capa desde el checkpoint bf16, sin modelo proxy, y cubrió 75.240 de 75.264 expertos enrutados (99,97%); los 24 expertos sin tokens de calibración usan cuantización oQ estándar. El mapa de sensibilidad por capas se midió sobre Jundot/Qwen3.8-Flash-Next-oQ4e-mtp (128 muestras de 256 tokens), porque el checkpoint bf16 completo no cabe en memoria en un Mac de 128 GB. Se preserva la cabeza MTP de un capa, lo que permite decodificación multi-token.

## Capacidades

- Generación de texto conversacional multi-turno, con pipeline declarado `image-text-to-text`.
- Entrada multimodal de imagen y texto gracias al codificador de visión incluido en la cuantización.
- Procesamiento de contexto muy largo: hasta 262.144 tokens según las especificaciones del modelo base.
- Decodificación multi-token mediante la cabeza MTP preservada, que puede acelerar la generación.
- Uso de la tabla de embeddings N-gram incluida, característica del modelo base.
- Razonamiento sobre contenido visual combinado con texto (por ejemplo, documentos con gráficos o capturas).
- Soporte de tool calling / function calling: no confirmado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la información disponible.
- Capacidades multilingües: no disponible; el autor no declara lista de idiomas y el conjunto de calibración empleado fue `oqe_code_multilingual` y `code_multilingual`, lo que sugiere cobertura de código en varios idiomas, pero no se especifica cuáles.
- Modo de pensamiento explícito (thinking mode): no disponible en la información proporcionada.
- Capacidades de audio: no disponibles.

## Casos de uso

- Inferencia local privada en Mac: al ejecutarse con MLX sobre Apple Silicon, ningún dato sale del equipo del usuario; es adecuado para prototipos y análisis de información sensible que no puede enviarse a APIs externas.
- Análisis de documentos largos con elementos visuales: sus 262.144 tokens de contexto y el codificador de visión permiten procesar informes extensos con tablas, gráficos o páginas escaneadas en una sola pasada, sin fragmentar el documento.
- Asistencia sobre repositorios de código grandes: el contexto largo permite cargar varios ficheros o un módulo completo y hacer preguntas cruzadas; el conjunto de calibración orientado a código sugiere que se priorizó preservar esta capacidad durante la cuantización.
- Estudio de cuantización extrema: la ficha de bits por anchura (66,9% a 2 bits) y el informe `oq_imatrix_report.json` lo convierten en un caso de estudio para medir la degradación real de un MoE multimodal a ~3,15 bits efectivos.
- Comparación de recetas de cuantización: al existir una versión oQ estándar del mismo modelo, sirve para aislar el efecto de la ponderación por imatrix frente a la cuantización uniforme.
- Evaluación de arquitecturas híbridas GDN + QSA: al ser un anticipo de la arquitectura Qwen4, permite experimentar con atención híbrida y MoE en un equipo de sobremesa sin necesidad de clúster.
- Extracción de información de capturas y diagramas: con el pipeline `image-text-to-text` se puede transcribir y estructurar el contenido de interfaces, pizarras o esquemas técnicos.
- Investigación sobre decodificación multi-token: la cabeza MTP preservada permite experimentar con estrategias de predicción multi-token en inferencia local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

No hay datos de MMLU, HumanEval, GSM8K ni de evaluaciones multimodales ni para el modelo cuantizado ni para el modelo base en el material proporcionado. Tampoco se documentan mediciones de latencia, throughput ni de perplejidad tras la cuantización, más allá de la distribución de bits y del tamaño final de 71 GB.

## Requisitos de hardware

- VRAM/memoria unificada estimada: unos 71 GB solo de pesos; el autor indica que se necesita un Mac con más memoria unificada que eso, citando 96 GB como ejemplo.
- Plataforma: exclusivamente Apple Silicon, porque el formato es MLX safetensors y la librería declarada es `mlx`. No hay pesos GGUF ni safetensors de PyTorch en este repositorio.
- GPU recomendadas: no aplica en el sentido habitual; no se ha publicado compatibilidad con A100, H100 o RTX 4090. El requisito es memoria unificada de Apple, orientativamente configuraciones Ultra de 96, 128 o 192 GB.
- ¿Cabe en GPU de consumo? No en el sentido convencional: 71 GB superan la VRAM de cualquier GPU de consumo actual. Solo es viable en equipos Apple con memoria unificada alta.
- Opciones de despliegue: MLX y el ecosistema oMLX/oQe con el que se generó. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput estimados: no disponibles. Los ~6.000 millones de parámetros activos por token y la cuantización a 2-3 bits son favorables en teoría, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| d9beuD/Qwen3.8-Flash-Next-oQ2.5e-mtp (este) | 179.999.981.459 | ~6.000 M | 262.144 tokens (base) | oQ 2.5 con imatrix, ~3,15 bits efectivos, 71 GB | Qwen Community License 1.0 | Hugging Face, formato MLX |
| d9beuD/Qwen3.8-Flash-Next-oQ2.5-mtp | mismo modelo base | ~6.000 M | 262.144 tokens (base) | oQ 2.5 estándar (sin ponderación imatrix) | Qwen Community License 1.0 | Hugging Face, formato MLX |
| Jundot/Qwen3.8-Flash-Next-oQ4e-mtp | mismo modelo base | ~6.000 M | 262.144 tokens (base) | oQ 4e (~4 bits), con imatrix | Qwen Community License 1.0 | Hugging Face, formato MLX |
| Qwen/Qwen3.8-Flash-Next (bf16) | ~180.000 M (125.000 M principal + 51.000 M N-gram) | ~6.000 M | 262.144 tokens | Sin cuantizar (bf16) | Qwen Community License 1.0 | Hugging Face |
| Qwen3.8-27B | no disponible | no disponible | no disponible | no disponible | no disponible | Lanzado el 14 de agosto de 2026 según las fuentes consultadas; specs no disponibles |

No se dispone de datos de rendimiento comparado entre estas variantes en la información proporcionada, por lo que la comparación se limita a parámetros, contexto, esquema de cuantización y licencia.

## Limitaciones y advertencias

- Cuantización muy agresiva: el 66,9% de los parámetros cuantizados está a 2 bits y el 29,0% a 3 bits. Es esperable una degradación de calidad respecto al bf16, especialmente en tareas de razonamiento fino, matemáticas y código, aunque no se han publicado mediciones en la información disponible.
- Riesgo de alucinación: inherente a los modelos de lenguaje y potencialmente amplificado por la pérdida de precisión de los pesos cuantizados.
- Cobertura de calibración casi total pero no completa: 24 de 75.264 expertos enrutados no recibieron tokens de calibración (0,03%) y usan cuantización estándar, lo que puede introducir un comportamiento menos optimizado en rutas poco frecuentes.
- Mapa de sensibilidad medido sobre un proxy: se calculó sobre Jundot/Qwen3.8-Flash-Next-oQ4e-mtp y no sobre el checkpoint bf16, por limitaciones de memoria. Esto puede desviar ligeramente las decisiones de precisión por capa.
- Licencia: se hereda la Qwen Community License 1.0 del modelo base, etiquetada como `other`. Es imprescindible revisar el texto completo de la licencia antes de cualquier uso comercial; en la información disponible no se detallan sus condiciones concretas (atribución, umbrales de usuarios, restricciones de uso).
- Idiomas: el autor no declara lista de idiomas soportados. No se puede asumir un rendimiento homogéneo entre lenguas, y el castellano no está verificado.
- Requisitos de memoria restrictivos: 71 GB de pesos implican un Mac con más de 96 GB de memoria unificada, lo que excluye la mayoría de equipos de consumo.
- Compatibilidad limitada: formato MLX safetensors sin conversiones publicadas a GGUF ni soporte documentado en vLLM, llama.cpp, Ollama o TGI, lo que restringe el despliegue en servidores con GPU.
- Sin benchmarks publicados: no hay datos de MMLU, HumanEval, GSM8K ni de evaluaciones multimodales que permitan estimar la pérdida real de calidad frente al bf16.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, y creado el 2026-10-05 con actualización el mismo día. No hay histórico de mantenimiento ni validación por terceros.
- Modelo base en fase de preview: Qwen presenta la arquitectura como anticipo de Qwen4, por lo que pueden aparecer cambios de diseño en versiones posteriores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/d9beuD/Qwen3.8-Flash-Next-oQ2.5e-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Versión oQ estándar del mismo autor: https://huggingface.co/d9beuD/Qwen3.8-Flash-Next-oQ2.5-mtp
- Modelo usado para el mapa de sensibilidad: https://huggingface.co/Jundot/Qwen3.8-Flash-Next-oQ4e-mtp
- Informe de imatrix del repositorio: https://huggingface.co/d9beuD/Qwen3.8-Flash-Next-oQ2.5e-mtp/blob/main/oq_imatrix_report.json
- Herramienta de cuantización oQe (oMLX): https://github.com/jundot/omlx
- Repositorio oficial de Qwen3.8-Flash-Next: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- README oficial del modelo base: https://github.com/QwenLM/Qwen3.8-Flash-Next/blob/main/README.md
- Ficha de Qwen3.8 en OpenLM.ai: https://openlm.ai/qwen3.8/
- Seguimiento de lanzamiento y especificaciones: https://aireleasetracker.com/model/qwen/qwen3.8-flash-next
