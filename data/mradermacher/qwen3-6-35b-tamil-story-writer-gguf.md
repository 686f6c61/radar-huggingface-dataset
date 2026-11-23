# mradermacher/Qwen3.6-35B-Tamil-Story-Writer-GGUF

## Resumen

Qwen3.6-35B-Tamil-Story-Writer-GGUF es una recopilación de cuantizaciones estáticas en formato GGUF del modelo base Bluehole/Qwen3.6-35B-Tamil-Story-Writer, publicada por el usuario mradermacher. El modelo original es un ajuste fino (QLoRA, según las etiquetas de la model card) orientado a la escritura creativa y la generación de relatos en tamil, construido sobre una arquitectura de mezcla de expertos (MoE) con aproximadamente 34.660 millones de parámetros totales según los pesos en safetensors. La licencia declarada es Apache 2.0.

El interés de esta publicación es práctico: permite ejecutar el modelo en entornos con llama.cpp y derivados (Ollama, LM Studio, etc.) sin necesidad de GPU de gran capacidad, ofreciendo cuantizaciones desde Q2_K (13,0 GB) hasta Q8_0 (37,0 GB), además de dos ficheros mmproj (Q8_0 y f16) que apuntan a un componente multimodal. El modelo está pensado para dos idiomas (inglés y tamil) y se presenta como "uncensored", lo que implica ausencia de filtros de contenido en el ajuste fino.

Es relevante para desarrolladores que trabajan en generación creativa multilingüe (especialmente en tamil) y que necesitan desplegar el modelo en hardware modesto. No obstante, la información pública disponible es muy escasa: no hay datos de benchmarks, no se detalla la composición del dataset de ajuste fino ni la longitud de contexto, y el número de descargas y likes es cero en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) según etiquetas; detalles de la arquitectura base no disponibles |
| Parametros totales | 34.660.610.688 (~34,66 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj Q8_0 y f16 |
| Idiomas soportados | en, ta (inglés y tamil) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |
| Tamano del repo | 238,6 GB |
| Modelo base | Bluehole/Qwen3.6-35B-Tamil-Story-Writer |
| Cuantizador | mradermacher |
| Fecha de creacion | 2026-11-23 |

## Arquitectura y entrenamiento

La model card solo indica la etiqueta "moe" y "qlora", lo que sugiere que el modelo base parte de una arquitectura de mezcla de expertos y que el ajuste fino se realizó mediante QLoRA (cuantización de los pesos base durante el entrenamiento y adaptación de bajo rango). No se especifica el número de expertos, el número de parámetros activos por token, la dimensión oculta ni el mecanismo de atención. Tampoco se documenta el número de tokens de entrenamiento, la composición del corpus (presumiblemente mezcla de inglés y tamil con énfasis en narrativa) ni si hubo fases de RLHF o DPO. La presencia de ficheros mmproj sugiere que el modelo base incorpora un proyector multimodal (visión), aunque no se detalla su funcionamiento.

La innovación destacable, en la práctica, es la propia publicación de cuantizaciones estáticas por parte de mradermacher, que permite ejecutar un modelo de ~34,66 B en GPUs de consumo mediante llama.cpp. No se han publicado detalles sobre decodificación especulativa, atención lineal ni otras técnicas de eficiencia en la información disponible.

## Capacidades

- Generación de texto narrativo y creativo, con especialización declarada en escritura de relatos en tamil.
- Generación de texto en inglés y tamil (los dos idiomas declarados).
- Modo conversacional (etiqueta "conversational" en los tags de Hugging Face).
- Capacidad multimodal potencial: la presencia de ficheros mmproj (Q8_0 y f16) indica soporte de entrada de imágenes en el modelo base, aunque no se detalla en la model card.
- Comportamiento "uncensored": el ajuste fino no aplica filtros de contenido, lo que permite generar material sin restricciones temáticas.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades matemáticas o de código: no disponible.

## Casos de uso

- Generación de relatos y ficción en tamil: el modelo está ajustado específicamente para escritura creativa en este idioma, por lo que puede emplearse para producir cuentos, novelas por entregas o guiones con coherencia narrativa, aprovechando su especialización frente a modelos generalistas.
- Localización creativa de contenido: traducción y adaptación de narrativa del inglés al tamil manteniendo el tono literario, gracias a su entrenamiento bilingüe.
- Prototipado de asistentes de escritura para autores tamilófonos: integración en editores o herramientas de escritura que sugieran continuaciones, diálogos o descripciones, ejecutables en local con llama.cpp.
- Generación de contenido sin filtros para investigación: al ser "uncensored", puede usarse en estudios sobre sesgos, seguridad o generación de contenido sensible en entornos controlados y con las salvaguardas adecuadas.
- Despliegue en hardware de consumo: con cuantizaciones Q4_K_M (21,3 GB) o Q4_K_S (20,0 GB) puede ejecutarse en GPUs de 24 GB (RTX 3090/4090) o en configuraciones con offloading a CPU, lo que facilita pruebas y demos locales.
- Experimentación multimodal: si se carga junto con el fichero mmproj, puede emplearse para tareas de descripción de imágenes o narración a partir de estímulos visuales, aunque esta capacidad no está documentada en detalle.
- Fine-tuning posterior o investigación sobre MoE: al estar disponible en GGUF y con licencia Apache 2.0, sirve como base para experimentos de cuantización, evaluación de calidad o adaptación a otros dominios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según tamaño de cuantización):
  - Q2_K: ~13,0 GB.
  - Q3_K_S: ~15,3 GB; Q3_K_M: ~16,9 GB; Q3_K_L: ~18,2 GB.
  - Q4_K_S: ~20,0 GB; Q4_K_M: ~21,3 GB.
  - Q5_K_S: ~24,1 GB; Q5_K_M: ~24,8 GB.
  - Q6_K: ~28,6 GB.
  - Q8_0: ~37,0 GB.
  - Añadir ~0,7 GB (mmproj Q8_0) o ~1,0 GB (mmproj f16) si se usa el componente multimodal.
- GPU recomendadas: para Q8_0, A100 40 GB o H100; para Q6_K, A100 40 GB o RTX A6000 48 GB; para Q4_K_M, RTX 3090/4090 (24 GB) con margen ajustado; para Q2_K/Q3, RTX 4080/4090 o incluso GPUs de 16 GB con offloading parcial.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) con cuantizaciones Q4 y Q5; en GPUs de 16 GB solo con Q2_K/Q3 y offloading a CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. Para el modelo base en safetensors, vLLM o TGI (no verificado para esta arquitectura).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Qwen3.6-35B-Tamil-Story-Writer (base) | ~34,66 B (MoE) | no disponible | en, ta | apache-2.0 | safetensors | Modelo original, sin cuantizar |
| Qwen3.6-35B-Tamil-Story-Writer-GGUF (este) | ~34,66 B (MoE) | no disponible | en, ta | apache-2.0 | GGUF | Cuantizaciones estáticas de mradermacher |
| Alternativas de escritura creativa en tamil | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de información sobre modelos comparables en la búsqueda |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Ausencia de benchmarks: no hay métricas publicadas que permitan evaluar la calidad real del modelo en tareas de escritura o en tamil.
- Documentación muy escasa: se desconoce la longitud de contexto, el número de parámetros activos, la composición del dataset y el proceso de entrenamiento, lo que dificulta predecir su comportamiento en producción.
- Riesgo de alucinación: como todo modelo generativo, puede inventar hechos, nombres o referencias; en escritura creativa el riesgo es menor, pero en usos informativos es alto.
- Sesgos: al no documentarse el corpus de entrenamiento, no es posible evaluar sesgos de género, culturales o políticos; el ajuste "uncensored" puede amplificar contenido sesgado o inapropiado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base (Bluehole/Qwen3.6-35B-Tamil-Story-Writer) y de los datos de entrenamiento originales.
- Cobertura idiomática limitada: solo inglés y tamil; no se garantiza un rendimiento aceptable en castellano u otros idiomas.
- Componente multimodal no documentado: los ficheros mmproj sugieren visión, pero no se especifica qué tareas soporta ni con qué calidad.
- Cuantizaciones de baja precisión (Q2_K, Q3_K_M) pueden degradar notablemente la calidad; la propia model card advierte que Q3_K_M es de "lower quality".
- Repositorio con cero descargas y cero likes: no hay evidencia de uso en la comunidad ni validación externa.

## Enlaces

- Hugging Face (este repositorio GGUF): https://huggingface.co/mradermacher/Qwen3.6-35B-Tamil-Story-Writer-GGUF
- Modelo base: https://huggingface.co/Bluehole/Qwen3.6-35B-Tamil-Story-Writer
- Página de descargas de mradermacher: https://hf.tst.eu/model#Qwen3.6-35B-Tamil-Story-Writer-GGUF
- README de referencia para GGUF de TheBloke: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico de calidad de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/
