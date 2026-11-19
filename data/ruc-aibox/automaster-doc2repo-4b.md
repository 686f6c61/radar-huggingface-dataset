# RUC-AIBOX/AutoMaster-doc2repo-4b

## Resumen

AutoMaster-doc2repo-4b es un modelo de lenguaje de 4.539 millones de parámetros (4,54 mil millones) publicado por RUC-AIBOX en Hugging Face. Se presenta como un ajuste fino supervisado (SFT) orientado a la tarea de conversión de documentación a repositorio de código, según se deduce de su nombre y de la ruta de entrenamiento reflejada en la model card. El modelo se apoya en la arquitectura `qwen3_5`, indicada en las etiquetas del repositorio, y se distribuye en formato safetensors con un tamaño de repositorio de 9,1 GB.

La información pública disponible es muy escasa: la model card está redactada en chino, no declara licencia, idiomas soportados ni pipeline, y el repositorio no registra descargas ni interacciones. La propia model card advierte de que no se han realizado pruebas de carga ni de inferencia tras el archivado, y de que el índice de pesos conserva 15 entradas `mtp.*` sin tensores exportados, lo que puede afectar a la compatibilidad de carga según el framework utilizado.

Por tanto, esta ficha recoge los datos verificables del repositorio y marca explícitamente como no disponibles aquellos parámetros que el autor no ha publicado. El modelo debe considerarse un artefacto de investigación experimental, no un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | qwen3_5 (según etiquetas del repositorio; detalles no disponibles) |
| Parámetros totales | 4.539.265.536 (4,54 mil millones) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors, presumiblemente BF16/FP16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (repositorio de 9,1 GB) |

## Arquitectura y entrenamiento

El modelo se basa en la familia Qwen 3.5, según la etiqueta `qwen3_5` del repositorio, aunque el autor no detalla la configuración interna (número de capas, dimensión oculta, mecanismo de atención ni si incorpora atención lineal o híbrida). No se dispone de información sobre la longitud de contexto nativa ni sobre el tokenizador más allá de que se conserva el original del export.

El entrenamiento corresponde a un ajuste fino supervisado (SFT) realizado con AutoTrain. La ruta de salida indica un experimento denominado `doc2repo_qwen35_4b_without_glm53_20261027_d2obs_qwen35_4b_deepseek_v4_pro_skill_512`, con un checkpoint en el paso global 48 del round 001. La model card reporta una puntuación de 33,72 ± 3,58 % y señala el mejor round exterior como R1. No se especifican el volumen de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales.

## Capacidades

- Generación de texto y ajuste específico para la tarea de conversión de documentación en repositorio de código (doc2repo), según el nombre del modelo y la ruta de entrenamiento.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles (la model card está en chino, pero no se declaran idiomas).
- No se documentan capacidades especiales como modo de razonamiento explícito, visión o audio.
- No se han realizado pruebas de carga ni de inferencia tras el archivado, por lo que el comportamiento real del modelo no está verificado.

## Casos de uso

- Generación de esqueletos de repositorio a partir de documentación técnica: el ajuste SFT sobre la tarea doc2repo sugiere que el modelo puede producir estructuras de ficheros y código inicial a partir de especificaciones escritas, aunque sin validación pública de calidad.
- Prototipado interno de pipelines de documentación a código: útil en entornos de investigación donde se quiera evaluar la viabilidad de un modelo de 4,5 mil millones de parámetros para esta tarea concreta.
- Experimentación académica en ajuste fino con AutoTrain: el repositorio documenta la ruta y el checkpoint exactos, lo que facilita reproducir o comparar el experimento.
- Base para nuevos ajustes SFT: al conservar tokenizer, chat template y configuración originales, puede servir como punto de partida para especializaciones posteriores.
- Evaluación comparativa de modelos pequeños en tareas de generación de código estructurado, siempre que se resuelvan antes las incidencias de carga del índice de pesos.
- Docencia y demostraciones sobre flujos doc2repo en entornos controlados, sin garantías de robustez en producción.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| Puntuación reportada por el autor | 33,72 ± 3,58 % |
| Mejor round exterior | R1 |
| Paso SFT | 48 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. La única métrica es la puntuación agregada del experimento, sin que se especifique el conjunto de evaluación ni la métrica exacta.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 9 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, entre 10 y 12 GB para contextos cortos.
- VRAM estimada en cuantización de 8 bits: en torno a 5-6 GB; en 4 bits, en torno a 3-4 GB (estimaciones teóricas, no verificadas por el autor).
- GPU recomendadas: A100, H100 o L40S para despliegue en FP16 con contexto largo; RTX 4090 (24 GB) y RTX 3090 (24 GB) suficientes para FP16 en contextos moderados.
- Cabe en GPU de consumo: sí, en tarjetas con 16 GB o más en FP16 y en tarjetas de 8-12 GB con cuantización, siempre que se resuelvan las incidencias de carga del índice.
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama requerirían conversión previa a GGUF; el formato publicado es safetensors. No hay pruebas de compatibilidad documentadas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| AutoMaster-doc2repo-4b | 4,54 mil millones | no disponible | no disponible | Hugging Face, sin descargas registradas |
| Qwen2.5-Coder-3B | 3,09 mil millones | 32 768 tokens | Apache 2.0 | Hugging Face, ampliamente utilizado |
| Qwen2.5-Coder-7B | 7,62 mil millones | 32 768 tokens | Apache 2.0 | Hugging Face, ampliamente utilizado |
| CodeLlama-7B | 6,74 mil millones | 16 384 tokens | Llama 2 Community | Hugging Face, ampliamente utilizado |

La comparación se ofrece como referencia de categoría (modelos pequeños orientados a código); no se dispone de datos de rendimiento comparables del modelo evaluado frente a estas alternativas.

## Limitaciones y advertencias

- Licencia no declarada: no puede asumirse uso comercial sin confirmación explícita del autor.
- Idiomas soportados no declarados; el comportamiento multilingüe es desconocido.
- La model card advierte de que no se han realizado pruebas de carga ni de inferencia tras el archivado, por lo que la compatibilidad con frameworks de inferencia no está garantizada.
- El índice de pesos contiene 15 entradas `mtp.*` sin tensores exportados; algunos cargadores pueden fallar o emitir advertencias al cargar el modelo.
- Riesgo de alucinación y de generación de código incorrecto no evaluado; no hay benchmarks estándar publicados.
- Sesgos conocidos: no documentados.
- Limitaciones de contexto: no documentadas.
- Repositorio sin descargas ni interacciones: no hay evidencia de uso comunitario ni de validación independiente.
- Puntuación de 33,72 ± 3,58 % sin especificación de la métrica ni del conjunto de evaluación, lo que impide interpretarla frente a otros modelos.

## Enlaces

- Hugging Face: https://huggingface.co/RUC-AIBOX/AutoMaster-doc2repo-4b
- README general del proyecto (referenciado en la model card): `../../README.md` dentro del repositorio
- No se han encontrado papers, blogs, repositorios de código ni demos adicionales en la información disponible.
