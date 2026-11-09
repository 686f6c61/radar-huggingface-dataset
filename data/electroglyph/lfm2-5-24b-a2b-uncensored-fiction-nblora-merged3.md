# electroglyph/LFM2.5-24B-A2B-uncensored-fiction-nblora-merged3

## Resumen

LFM2.5-24B-A2B-uncensored-fiction-nblora-merged3 es un ajuste fino (fine-tuning) del modelo electroglyph/LFM2.5-24B-A2B-uncensored, publicado por el usuario electroglyph en Hugging Face. Se trata de un modelo derivado de la familia LFM2.5 de Liquid AI, en su variante de 24B de parametros totales y 2B de parametros activos (arquitectura MoE, segun la nomenclatura A2B), orientado a la generacion de ficcion sin censura. El autor lo ha entrenado mediante SFT (supervised fine-tuning) con la libreria TRL y ha fusionado un adaptador de tipo nblora en los pesos base, dando lugar a un checkpoint "merged" listo para inferencia directa.

El modelo resulta relevante para quienes necesitan un generador de narrativa creativa sin los filtros de seguridad habituales de los modelos alineados, manteniendo la eficiencia de inferencia de una arquitectura de mezcla de expertos con solo 2B de parametros activos por token. El repositorio ocupa 97,9 GB en formato safetensors, lo que es coherente con un modelo de 24B de parametros en precision completa o alta precision.

La informacion publicada por el autor es muy escasa: la model card es la plantilla automatica de TRL, sin datos de entrenamiento, sin benchmarks y sin especificacion de licencia ni idiomas. Cualquier evaluacion rigurosa requiere probar el modelo directamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos), familia LFM2.5; detalles no disponibles |
| Parametros totales | 24B (segun denominacion del modelo) |
| Parametros activos | 2B (segun denominacion "A2B") |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; cuantizaciones GGUF/AWQ no publicadas por el autor) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica "license: license", sin especificar) |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del checkpoint base electroglyph/LFM2.5-24B-A2B-uncensored, que a su vez deriva de la familia LFM2.5 de Liquid AI. La nomenclatura "24B-A2B" indica una arquitectura de mezcla de expertos con 24.000 millones de parametros totales y aproximadamente 2.000 millones activos por token, lo que reduce el coste computacional de inferencia respecto a un modelo denso del mismo tamano. No se dispone de informacion detallada sobre el numero de expertos, la estrategia de enrutamiento ni la atencion empleada (el autor no la publica).

El entrenamiento de este checkpoint concreto se realizo mediante SFT con TRL 1.18.0.dev0, Transformers 5.22.2, PyTorch 2.15.0 y Datasets 5.1.0. El autor aplico un adaptador de tipo nblora (variante de LoRA) sobre el modelo base y posteriormente fusiono los pesos ("merged3"), de modo que el repositorio contiene el modelo completo y no un adaptador separado. No se especifican el dataset de entrenamiento, el numero de tokens, la composicion de los datos ni si hubo etapas de RLHF o DPO adicionales. El nombre del modelo sugiere un dataset orientado a ficcion sin censura, pero no hay documentacion al respecto.

## Capacidades

- Generacion de texto narrativo y creativo, presumiblemente orientada a ficcion sin restricciones de contenido (segun el nombre del modelo).
- Generacion de texto general y conversacion multi-turno mediante la pipeline de transformers.
- Razonamiento y conocimiento general heredados del modelo base LFM2.5, sin datos publicados que lo confirmen.
- Soporte de tool calling / function calling: no disponible (no documentado por el autor).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Generacion de ficcion y narrativa creativa: el modelo esta especificamente ajustado para producir texto de ficcion sin los filtros de contenido de los modelos alineados, lo que lo hace adecuado para escritura de novelas, relatos y guiones con tematicas adultas o sensibles.
- Prototipado de asistentes de escritura: integrable mediante la pipeline de transformers con `device_map="auto"` para generar continuaciones, dialogos o descripciones dentro de una herramienta de autoria.
- Experimentacion en investigacion sobre alineacion y censura: util como contrapunto "sin censura" frente a modelos alineados para estudiar diferencias de comportamiento, sesgos y rechazos.
- Generacion de dialogos para videojuegos o narrativa interactiva: la arquitectura MoE con 2B activos reduce el coste por token, lo que facilita su despliegue en entornos con presupuesto de computo limitado.
- Fine-tuning posterior sobre dominios narrativos especificos: al ser un checkpoint fusionado en safetensors y compatible con transformers, sirve como base para nuevos ajustes con TRL.
- Evaluacion comparativa de calidad literaria: permite comparar la calidad de prosa y coherencia frente al modelo base y frente a alternativas densas de 24B en tareas de escritura larga.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 97,9 GB en safetensors, lo que corresponde a pesos en BF16/FP16 (24B x 2 bytes ≈ 48 GB; el resto del espacio puede deberse a pesos duplicados o formatos adicionales). En BF16 se necesitan al menos ~48 GB de VRAM solo para pesos, mas overhead de activaciones y cache KV.
- En cuantizacion de 8 bits: ~24-26 GB de VRAM; en 4 bits: ~13-15 GB de VRAM (estimaciones teoricas, no verificadas por el autor).
- GPU recomendadas: A100 80 GB o H100 para BF16 sin cuantizar; A100 40 GB o RTX 6000 Ada para 8 bits; RTX 4090 (24 GB) viable solo con cuantizacion de 4-8 bits.
- Cabe en GPU de consumo: si, con cuantizacion agresiva (4 bits) en GPUs de 16-24 GB, aunque no se han publicado pesos GGUF oficiales.
- Opciones de despliegue: transformers (soporte nativo), vLLM y TGI (compatibles con arquitecturas MoE de transformers, aunque no verificados para este checkpoint), llama.cpp/Ollama solo si se generan cuantizaciones GGUF propias.
- Latencia y throughput estimados: no disponibles; la arquitectura con 2B activos deberia ofrecer un throughput notablemente superior a un denso de 24B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM2.5-24B-A2B-uncensored-fiction-nblora-merged3 (este) | 24B | 2B | no disponible | no disponible | Hugging Face, 0 descargas |
| electroglyph/LFM2.5-24B-A2B-uncensored (base) | 24B | 2B | no disponible | no disponible | Hugging Face |
| Familia LFM2.5 original (Liquid AI) | 24B (variante A2B) | 2B | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento ni de benchmarks que permitan una comparacion cuantitativa con alternativas. La comparativa se limita a parametros y disponibilidad.

## Limitaciones y advertencias

- Ausencia total de documentacion: no hay model card tecnica, dataset, benchmarks ni evaluacion de seguridad; el uso en produccion requiere validacion propia.
- Modelo "uncensored": no ha pasado por un proceso de alineacion de seguridad convencional, por lo que puede generar contenido ofensivo, ilegal o danino; no es apto para aplicaciones dirigidas al publico general sin filtros adicionales.
- Riesgo elevado de alucinacion: sin datos de entrenamiento publicados no se puede acotar la fidelidad factual.
- Licencia no especificada: no se puede confirmar el uso comercial; hay que contactar con el autor o asumir la licencia del modelo base, que tampoco esta documentada en esta ficha.
- Idiomas soportados no documentados: el rendimiento fuera del ingles (y posiblemente otros idiomas del dataset de entrenamiento) es desconocido.
- Longitud de contexto no documentada: no se puede planificar el uso en tareas de contexto largo.
- Repositorio con 0 descargas y 0 likes: sin validacion por parte de la comunidad; posible inestabilidad o errores en los pesos fusionados.
- El nombre "merged3" sugiere multiples iteraciones de fusion; conviene verificar la integridad de los pesos antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/electroglyph/LFM2.5-24B-A2B-uncensored-fiction-nblora-merged3
- Modelo base: https://huggingface.co/electroglyph/LFM2.5-24B-A2B-uncensored
- Repositorio TRL: https://github.com/huggingface/trl
- Documentacion de Transformers: https://huggingface.co/docs/transformers
