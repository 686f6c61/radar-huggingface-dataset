# mradermacher/Lunar-Huntress-0.2-GGUF

## Resumen

Lunar-Huntress-0.2 (en su versión GGUF) es una cuantización publicada por mradermacher del modelo Husky110/Lunar-Huntress-0.2, un modelo de 30.697.345.596 parámetros creado mediante merge de modelos con la herramienta mergekit y la técnica TIES. Según las etiquetas del repositorio, el modelo base pertenece a la familia de arquitectura gemma4 y está orientado a roleplay, escritura creativa y contenido para adultos, con etiquetas explícitas de "nsfw" y "adult-content" y la advertencia "not-for-all-audiences".

El modelo original es conversacional y de uso general en inglés, pero su nicho principal es la generación de ficción interactiva y compañía conversacional. La versión de mradermacher no altera los pesos: proporciona cuantizaciones estáticas en formato GGUF desde Q2_K (12,0 GB) hasta Q8_0 (32,7 GB), lo que permite ejecutar el modelo en hardware de consumo con llama.cpp, Ollama o LM Studio.

Su relevancia actual radica en la accesibilidad: un modelo de más de 30B parámetros con licencia Apache 2.0 y cuantizaciones de 4 bits que caben en una GPU de consumo o incluso en RAM de un equipo moderno es una opción interesante para quien necesite un modelo de escritura creativa sin restricciones de licencia y con despliegue local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia gemma4, según etiquetas del repo; detalles no disponibles) |
| Parametros totales | 30.697.345.596 |
| Parametros activos | no disponible (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (cuantizaciones estáticas; imatrix disponibles en repo aparte) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base Husky110/Lunar-Huntress-0.2 está en safetensors) |

## Arquitectura y entrenamiento

El modelo base, Husky110/Lunar-Huntress-0.2, es un merge creado con mergekit utilizando el método TIES (Task Arithmetic with sign consensus), que combina varios modelos resolviendo conflictos de signo entre pesos y aplicando un umbral de magnitud para descartar contribuciones poco significativas. Las etiquetas del repositorio indican que la arquitectura subyacente es de la familia gemma4, aunque el número exacto de capas, dimensiones ocultas y detalles del tokenizer no están disponibles en la información proporcionada.

No hay información publicada sobre los datos de entrenamiento, el número de tokens ni procesos de alineación (RLHF, DPO) del modelo base o de los modelos fusionados. Dado que es un merge, no ha habido un entrenamiento desde cero: el resultado hereda las capacidades y sesgos de los modelos originales. La versión de mradermacher es puramente una re-cuantización: convierte los pesos safetensors a GGUF en once niveles de precisión distintos, sin modificar la topología del modelo. Los cuantos con imatrix (matriz de importancia) están disponibles en un repositorio hermano y suelen ofrecer mejor calidad a igual tamaño.

## Capacidades

- Generacion de texto conversacional, con orientación específica a roleplay y companion según las etiquetas del autor.
- Escritura creativa: narrativa de ficción, con etiquetas orientadas a ese uso.
- Contenido para adultos (NSFW): el modelo está etiquetado explícitamente para ese fin y con la advertencia "not-for-all-audiences".
- Capacidades de razonamiento, código, matemáticas o tool calling: no disponibles en la información proporcionada; al ser un merge orientado a escritura creativa, no debe asumirse rendimiento destacado en tareas agénticas.
- Capacidades multilingues: no disponibles; el único idioma declarado es el inglés.
- Capacidades multimodales (vision, audio): no disponibles; el repo indica skip_mmproj, lo que confirma que no se incluyen proyectores multimodales.

## Casos de uso

- Roleplay interactivo local: ejecutando el quant Q4_K_M (18,8 GB) en llama.cpp o LM Studio, un usuario puede mantener conversaciones de rol multi-turno en local sin depender de servicios en la nube, aprovechando el enfoque del modelo en ese dominio.
- Compañero conversacional (companion): el modelo puede integrarse en aplicaciones de chat personalizado (por ejemplo, frontends como SillyTavern) gracias a su formato GGUF compatible con la mayoría de interfaces de inferencia locales.
- Escritura creativa y novelística: como asistente de borradores de ficción en inglés, generando continuidades de escena, diálogo y descripciones; su orientación a creative-writing lo hace adecuado frente a modelos generales más "asistentes".
- Contenido adulto con requisitos de privacidad: para creadores que necesitan generación NSFW sin enviar datos a APIs de terceros, el despliegue local con Apache 2.0 evita restricciones de servicio.
- Experimentación con merges TIES: investigadores pueden usar el modelo como caso de estudio de merges de ~30B con mergekit y comparar el efecto de las cuantizaciones K-quant frente a los pesos originales.
- Prototipado en hardware de consumo: con el quant Q3_K_M (15,4 GB) cabe en GPUs de 16 GB o en CPU con 32 GB de RAM, útil para pruebas rápidas de prompts y plantillas de chat sin coste de infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un merge orientado a roleplay y escritura creativa, el autor no aporta evaluaciones en MMLU, HumanEval, GSM8K u otros benchmarks estándar.

## Requisitos de hardware

- VRAM estimada para inferencia (tamaño del archivo GGUF + overhead de contexto, aproximadamente 1-2 GB extra):
  - Q2_K: ~12,0 GB (cabe en GPUs de 16 GB)
  - Q3_K_M: ~15,4 GB (cabe en GPUs de 16 GB con contexto ajustado)
  - IQ4_XS: ~17,0 GB; Q4_K_S: ~17,9 GB; Q4_K_M: ~18,8 GB (requieren GPUs de 24 GB o descarga parcial a CPU)
  - Q5_K_M: ~21,9 GB; Q6_K: ~25,3 GB (GPU de 24 GB con contexto limitado, o multi-GPU)
  - Q8_0: ~32,7 GB (requiere 2 GPUs de 24 GB o GPU de 48 GB, o CPU con 40+ GB de RAM)
- GPU recomendadas: RTX 3090/4090 (24 GB) para los quants de 4 bits; RTX 5090 (32 GB) para Q5/Q6; A100/H100 de 40-80 GB para Q8_0 con contexto amplio. En CPU, 32 GB de RAM bastan para Q2_K/Q3, 64 GB para el resto.
- Consumer GPU: sí, cabe en una RTX 4090 con Q4_K_S o Q4_K_M (recomendados por el autor como "fast, recommended"); en GPUs de 16 GB (RTX 4060 Ti 16 GB, RTX 4080) solo con Q2_K o Q3.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF. vLLM y TGI no consumen GGUF directamente; para ellos habría que usar los pesos safetensors del modelo base.
- Latencia y throughput: no disponibles; en una RTX 4090 con Q4_K_M, un modelo de ~30B densos suele alcanzar velocidades del orden de 20-30 tokens/s, aunque esta cifra es una estimación y no un dato publicado.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Lunar-Huntress-0.2 (GGUF) | 30,7B (merge TIES, familia gemma4) | GGUF (Q2_K a Q8_0) | Apache 2.0 | Roleplay, creative writing, NSFW | Pesos y cuants publicados |
| Mistral Small 3 (24B) | 24B | safetensors, GGUF comunitarios | Apache 2.0 | General, instrucción, algo de código | Pesos publicados |
| Gemma 3 27B | 27B | safetensors, GGUF comunitarios | Licencia Gemma (restricciones de uso) | General, multimodal | Pesos publicados |
| Qwen2.5 32B | 32B | safetensors, GGUF comunitarios | Apache 2.0 | General, fuerte en código y matemáticas | Pesos publicados |

En tamaño, Lunar-Huntress-0.2 compite con Gemma 3 27B y Qwen2.5 32B. Frente a ellos, su ventaja es la especialización en roleplay y contenido sin filtros, además de la licencia Apache 2.0 (a diferencia de la licencia Gemma); su desventaja es la ausencia de benchmarks publicados y la falta de datos sobre capacidades de razonamiento o código.

## Limitaciones y advertencias

- Contenido adulto: el modelo está etiquetado como NSFW y "not-for-all-audiences"; no es apto para entornos laborales ni para usuarios menores de edad, y su uso puede estar restringido por la normativa local.
- Idioma: solo declara soporte de inglés; el rendimiento en castellano no está documentado y probablemente sea inferior o inconsistente.
- Sesgos: al ser un merge TIES, hereda y puede amplificar los sesgos de todos los modelos fusionados; no hay evaluación de sesgos publicada.
- Alucinaciones: no hay datos, pero al carecer de alineación documentada (RLHF/DPO desconocidos) el riesgo de alucinación y de generación de contenido inapropiado es alto; no debe usarse para tareas que exijan factualidad.
- Sin benchmarks ni datos de contexto: la longitud de contexto no está publicada, lo que complica planificar aplicaciones con documentos largos; conviene verificarla en la config del modelo base antes de producción.
- Cuantizacion: los quants bajos (Q2_K, Q3_K_M) degradan apreciablemente la calidad; el autor recomienda Q4_K_S/Q4_K_M como equilibrio y Q8_0 para máxima calidad.
- Licencia: Apache 2.0 permite uso comercial, pero la responsabilidad sobre el contenido generado (especialmente NSFW) recae en el usuario.
- La cuantización es de mradermacher; cualquier problema de calidad debe distinguirse entre defectos del modelo base (Husky110) y artefactos de cuantización.

## Enlaces

- Repositorio GGUF cuantizado: https://huggingface.co/mradermacher/Lunar-Huntress-0.2-GGUF
- Modelo base: https://huggingface.co/Husky110/Lunar-Huntress-0.2
- Cuants imatrix/weighted: https://huggingface.co/mradermacher/Lunar-Huntress-0.2-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Lunar-Huntress-0.2-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
- Paper, blog o demo del modelo base: no disponible
