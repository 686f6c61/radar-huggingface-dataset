# fiore-lab/GLM-5.3-EXL3-4x-DGX-Sparks

## Resumen

GLM-5.3-EXL3-4x-DGX-Sparks es una cuantización EXL3 del modelo GLM-5.3 (755B parámetros, arquitectura `glm_moe_dsa`) publicada por Fiore-lab. El checkpoint está específicamente diseñado para servir el modelo en un clúster de cuatro nodos NVIDIA DGX Spark con paralelismo de tensores 4 y paralelismo de contexto de decodificación 2, mediante el motor del recetario ExpertAtlas-GLM5.3. No es un modelo autónomo: es un artefacto de pesos con un layout concreto que solo carga el motor para el que fue construido.

La innovación principal es una mezcla de cuantización no uniforme: la mitad de los expertos enrutados de las capas 3 a 77 (9.600 de 19.200) están a 3 bits en lugar de 4, seleccionados por menor frecuencia de uso a partir de estadísticas de dominios objetivo (agente, código, operaciones Linux y seguridad de servidores, en japonés e inglés). El resto de capas lineales está a 5 bits, y los tensores sensibles (embeddings, `lm_head`, normas, router, `kv_b_proj`) se conservan en BF16. Con esta mezcla y una caché KV en FP4, el modelo completo cabe en cuatro DGX Sparks con una ventana de contexto de aproximadamente 800K tokens (819.200).

El checkpoint es relevante porque demuestra que un MoE de 755B puede servirse en hardware de escritorio de gama alta distribuido, no en centros de datos con GPUs de 80 GB. La contrapartida es una dependencia total del motor propietario del recetario y de un banco externo de expertos a 3 bits a partir de la release r3.3-102.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `glm_moe_dsa` (MoE con atención dispersa, base zai-org/GLM-5.3) |
| Parámetros totales | 172.091.141.504 (~172B en safetensors; el modelo base se describe como 755B) |
| Parámetros activos | no disponible |
| Longitud de contexto | ~800K tokens (819.200) con la mezcla 3/4 bits y caché KV FP4; 737.280 tokens por defecto con todos los expertos a 3 bits; 1M en la variante de 8 nodos |
| Tipos de cuantización | EXL3: expertos enrutados a 3 bits (codebook mcg) y 4 bits (codebook mcg); capas lineales no-expertas a 5 bits (codebook mul1); tensores sensibles en BF16; caché KV en FP4 o FP8 |
| Idiomas soportados | no disponible (la calibración de la selección de expertos usó japonés e inglés) |
| Licencia | GLM-5.3 License (`license: other`, `license_name: glm-5.3`) |
| Formato de pesos | safetensors (EXL3), más `config.json`, `tokenizer.json`, `chat_template.jinja`, `model.safetensors.index.json`, `SHA256SUMS` |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE de la familia GLM-5.3 con arquitectura `glm_moe_dsa`, que combina mezcla de expertos con atención dispersa. El checkpoint cuantizado conserva la estructura completa: 78 capas (0 a 77) más una capa MTP (layer 78) utilizable como drafter para decodificación especulativa. Los expertos enrutados de las capas 3 a 77 se almacenan por capa en archivos `experts-layer-XXX.safetensors` (75 archivos), cada experto ya cortado en ocho participaciones de paralelismo de tensores por tiles completos, sin recuantización posterior.

La cuantización se realizó con exllamav3 1.6.1 a partir de zai-org/GLM-5.3-BF16 (revisión 9d2398f). La selección de qué expertos van a 3 bits se hizo sobre las estadísticas de uso agregadas de todos los dominios objetivo: los 9.600 expertos menos usados (50 % de 19.200) se asignaron a 3 bits, con entre 103 y 164 expertos a 3 bits por capa y mayor proporción en las capas más superficiales. Las capas lineales no-expertas (proyecciones de atención, expertos compartidos, MLPs densos de las capas 0 a 2, `wq_b` del indexer) se cuantizaron a 5 bits con calibración a través del modelo con todos los expertos enrutados a 4 bits. Los tensores que exllamav3 mantiene sin cuantizar (embeddings, `lm_head`, normas, router, `kv_b_proj`, `wk`/`weights_proj`/`k_norm` del indexer, norma final) se copian byte a byte del checkpoint BF16 oficial.

No se dispone de información sobre el número de tokens de entrenamiento del modelo base ni sobre si se aplicaron RLHF o DPO; esos datos corresponden a la model card de zai-org/GLM-5.3, no a este checkpoint.

## Capacidades

- Generación de texto y razonamiento de propósito general, heredados del modelo base GLM-5.3.
- Capacidad de agente y razonamiento multi-paso, con selección de expertos calibrada específicamente para cargas de trabajo de agente.
- Generación y edición de código, con expertos priorizados para dominios de programación.
- Operaciones de sistema y seguridad de servidores (Linux ops, server security), dominios incluidos en la calibración.
- Decodificación especulativa mediante la capa MTP (layer 78) incluida como drafter.
- Soporte multilingüe parcial: la calibración cubrió japonés e inglés; el resto de idiomas del modelo base no está documentado en esta ficha.
- Tool calling y function calling: no disponible en la información proporcionada.
- Visión, audio u otras modalidades: no disponible en la información proporcionada.

## Casos de uso

- Asistente de programación en producción: el modelo puede generar y revisar código con una ventana de ~800K tokens, lo que permite cargar repositorios completos o historiales largos de incidencias en una sola sesión. La selección de expertos a 3 bits prioriza precisamente los dominios de código, por lo que la pérdida de calidad en esa tarea es menor que en dominios no calibrados.
- Automatización de operaciones Linux: con expertos calibrados para Linux ops, el modelo puede interpretar logs, proponer comandos y razonar sobre configuraciones de servidor en conversaciones multi-turno largas, manteniendo el contexto de la sesión gracias a la ventana extendida.
- Análisis de seguridad de servidores: el checkpoint incluye calibración específica para server security, lo que lo hace adecuado para triaje de alertas, revisión de configuraciones y generación de informes de vulnerabilidades sobre grandes volúmenes de texto de auditoría.
- Agentes autónomos multi-paso: la combinación de razonamiento de agente, contexto de ~800K tokens y decodificación especulativa con la capa MTP permite ejecutar bucles de planificación-acción-observación con historiales largos sin truncar el estado previo.
- Procesamiento de documentación extensa en japonés e inglés: la calibración bilingüe en estos idiomas hace que el modelo sea adecuado para resumen, extracción y问答 sobre corpus técnicos en ambas lenguas, con contexto suficiente para documentos de cientos de miles de tokens.
- Despliegue en infraestructura distribuida de bajo coste: el layout está pensado para cuatro DGX Sparks con 622,5 GB de disco por nodo (incluyendo el banco de expertos a 3 bits), lo que permite servir un MoE de 755B en hardware de sobremesa distribuido en lugar de en un clúster de GPUs de centro de datos.
- Evaluación comparativa de cuantizaciones: el checkpoint incluye métricas de divergencia KL frente al BF16 original, lo que lo convierte en una referencia útil para estudiar el impacto de mezclas de bits no uniformes en modelos MoE grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card solo proporciona divergencia KL de las distribuciones de salida respecto al modelo BF16 original, medida sobre cuatro ventanas de 8.192 tokens en configuración determinista con el recetario en cuatro nodos:

| Posiciones | Este checkpoint, caché KV FP4 | Este checkpoint, caché KV FP8 | 4 bits en todo (repo hermano), caché KV FP8 |
|---|---|---|---|
| 1.024 a 2.047 | 0,0190 | 0,0156 | 0,0120 |
| 2.048 a 4.095 | 0,03 (truncado en la información disponible) | no disponible | no disponible |

## Requisitos de hardware

- VRAM: el modelo requiere cuatro nodos NVIDIA DGX Spark con paralelismo de tensores 4 y paralelismo de contexto de decodificación 2. No se especifica la VRAM por nodo en la información disponible.
- Almacenamiento: 622,5 GB de disco por nodo, incluyendo el checkpoint y el banco de expertos a 3 bits `fiore-lab/GLM-5.3-EXL3-Experts-3bit`, necesario a partir de la release r3.3-102.
- GPU recomendadas: exclusivamente NVIDIA DGX Spark en configuración de cuatro nodos para este checkpoint; la variante de ocho nodos (`fiore-lab/GLM-5.3-EXL3-8x-DGX-Sparks`) permite contexto de 1M con todos los expertos a 4 bits.
- Cabe en consumer GPU: no aplicable en el sentido habitual; el diseño es para clústeres de DGX Spark, no para una única GPU de consumo.
- Opciones de despliegue: únicamente el motor del recetario ExpertAtlas-GLM5.3 (https://github.com/fiore-labo/ExpertAtlas-GLM5.3). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.3-EXL3-4x-DGX-Sparks (este) | ~172B en safetensors (base 755B) | ~800K (819.200) | EXL3 mixta 3/4/5 bits + BF16 | GLM-5.3 License | Hugging Face, 86 descargas |
| GLM-5.3-EXL3-8x-DGX-Sparks | ~172B en safetensors (base 755B) | 1M | EXL3 4 bits en todos los expertos enrutados | GLM-5.3 License | Hugging Face (repo hermano) |
| zai-org/GLM-5.3-BF16 | 755B | no disponible | BF16 | GLM-5.3 License | Hugging Face (modelo base oficial) |

No se dispone de información sobre otros modelos comparables de la misma categoría (MoE de ~700B cuantizado para hardware distribuido) en la documentación proporcionada.

## Limitaciones y advertencias

- Dependencia total del motor: el checkpoint solo carga con el motor del recetario ExpertAtlas-GLM5.3; no es compatible con vLLM, llama.cpp, Ollama, TGI ni otras herramientas estándar.
- Requiere el banco de expertos externo: a partir de la release r3.3-102, cada arranque necesita `fiore-lab/GLM-5.3-EXL3-Experts-3bit`; el checkpoint por sí solo no contiene los expertos enrutados que el motor carga por defecto.
- Layout de pesos no estándar: los expertos están precortados en ocho participaciones de paralelismo de tensores; no se pueden reutilizar directamente en otras configuraciones de paralelismo.
- Sin drafter DFlash2: no se incluye por restricciones de redistribución; solo la capa MTP sirve como drafter.
- Precisión degradada respecto al BF16: la divergencia KL es de 0,0190 con caché FP4 y 0,0156 con FP8 en el rango 1.024-2.047, frente a 0,0120 de la variante de 4 bits completa; la degradación es medible aunque moderada.
- Selección de expertos sesgada por dominio: los expertos a 3 bits se eligieron por baja frecuencia de uso en dominios concretos (agente, código, Linux ops, seguridad, japonés e inglés); el rendimiento en otros dominios puede degradarse más de lo que refleja la métrica global.
- Idiomas: solo japonés e inglés están documentados en la calibración; el comportamiento en castellano u otras lenguas no está verificado.
- Licencia: GLM-5.3 License con `license: other`; es necesario revisar el archivo `LICENSE` para confirmar las restricciones de uso comercial.
- Riesgo de alucinación: no cuantificado en la información disponible; aplican los riesgos habituales del modelo base GLM-5.3.
- Sesgos: no documentados en la información proporcionada.
- Verificación de integridad: el repositorio incluye `SHA256SUMS`; se recomienda ejecutar `sha256sum -c SHA256SUMS` tras la descarga.

## Enlaces

- Hugging Face del checkpoint: https://huggingface.co/fiore-lab/GLM-5.3-EXL3-4x-DGX-Sparks
- Repo hermano de 8 nodos: https://huggingface.co/fiore-lab/GLM-5.3-EXL3-8x-DGX-Sparks
- Banco de expertos a 3 bits: https://huggingface.co/fiore-lab/GLM-5.3-EXL3-Experts-3bit
- Modelo base: https://huggingface.co/zai-org/GLM-5.3
- Modelo base en BF16: https://huggingface.co/zai-org/GLM-5.3-BF16
- Recetario y motor: https://github.com/fiore-labo/ExpertAtlas-GLM5.3
- Instrucciones para reproducir los pesos: https://github.com/fiore-labo/ExpertAtlas-GLM5.3/blob/main/glm53/weights/README.md
