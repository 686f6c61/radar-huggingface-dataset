# mradermacher/C2S-Pythia-410m-cell-type-prediction-GGUF

## Resumen

C2S-Pythia-410m-cell-type-prediction es un modelo de lenguaje especializado en biología computacional, concretamente en la predicción de tipos celulares a partir de datos de secuenciación de ARN unicelular (scRNA-seq). Lo desarrolla el equipo de van Dijk Lab (vandijklab) y esta versión concreta es una cuantización GGUF publicada por mradermacher, un conocido creador de cuantizaciones para el ecosistema llama.cpp. El modelo original se construye sobre la arquitectura Pythia-410m de EleutherAI.

El modelo resuelve un problema muy concreto del ámbito bioinformático: clasificar células individuales en tipos celulares conocidos a partir de su perfil de expresión génica, una tarea fundamental en análisis de tejidos, estudios de desarrollo y diagnóstico. Al estar basado en Pythia-410m, hereda la arquitectura transformer decoder-only de EleutherAI con aproximadamente 405 millones de parámetros, lo que lo hace extremadamente ligero y desplegable en hardware modesto.

Su relevancia actual radica en que permite ejecutar un modelo de análisis celular en local, sin depender de infraestructura en la nube, gracias a las cuantizaciones GGUF que reducen el peso a entre 0,3 y 0,9 GB según el nivel de compresión. Esto facilita su integración en pipelines bioinformáticos reproducibles y en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basada en Pythia-410m de EleutherAI) |
| Parametros totales | 405.334.016 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en |
| Licencia | cc-by-4.0 |
| Formato de pesos | GGUF (cuantizaciones); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base vandijklab/C2S-Pythia-410m-cell-type-prediction parte de Pythia-410m, un transformer decoder-only de EleutherAI con 405 millones de parámetros. Pythia es una suite de modelos diseñada para investigación en interpretabilidad, entrenada sobre el corpus Pile. El modelo de van Dijk Lab adapta esta arquitectura al dominio de scRNA-seq para la tarea de predicción de tipos celulares (cell-type prediction), aunque la model card disponible no detalla el proceso de fine-tuning, el volumen de datos de entrenamiento ni si se emplearon técnicas de RLHF o DPO.

La información proporcionada no incluye detalles sobre la composición del dataset de entrenamiento, el número de tokens utilizados ni innovaciones técnicas específicas más allá de la adaptación al dominio biológico. La versión aquí descrita es una cuantización estática (quantize_version 2, output_tensor_quantised 1, convert_type hf) realizada por mradermacher; no se han publicado cuantizaciones con imatrix o ponderadas por este autor en el momento de la ficha.

## Capacidades

- Predicción de tipos celulares a partir de perfiles de expresión génica de scRNA-seq.
- Procesamiento de datos biológicos de secuenciación unicelular en formato textual.
- Modelo especializado de dominio: no es un modelo de propósito general.
- Idioma de trabajo: inglés.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades multimodales (visión, audio) ni modo thinking.
- Capacidades multilingües limitadas al inglés según los tags del repositorio.

## Casos de uso

- Anotación automática de tipos celulares en experimentos de scRNA-seq: el modelo clasifica células individuales según su perfil de expresión, acelerando la anotación manual que tradicionalmente requiere expertos en biología.
- Pipelines de análisis de tejidos en investigación biomédica: integración en flujos de Seurat o Scanpy para preetiquetar clusters celulares antes de la revisión manual.
- Despliegue en local para laboratorios con recursos limitados: al pesar entre 0,3 y 0,9 GB en GGUF, puede ejecutarse en estaciones de trabajo sin GPU dedicada o con GPU de consumo.
- Análisis reproducibles en entornos aislados: la licencia CC-BY-4.0 y el formato GGUF permiten empaquetar el modelo en contenedores para experimentos reproducibles.
- Filtrado y control de calidad de datasets celulares: uso del modelo para detectar asignaciones de tipo celular inconsistentes en grandes volúmenes de datos.
- Docencia y formación en bioinformática: modelo ligero para demostrar técnicas de clasificación celular con modelos de lenguaje en cursos prácticos.
- Prototipado rápido de clasificadores celulares: servir como línea base antes de entrenar modelos específicos más grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 0,3 GB (Q2_K) y 0,9 GB (f16) según la cuantización; en la práctica, cualquier GPU con 1-2 GB libres es suficiente.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. Cualquier GPU de consumo (GTX 1050, RTX 3060, RTX 4090) puede ejecutarlo sobradamente.
- Cabe en cualquier GPU de consumo e incluso en sistemas integrados y Raspberry Pi con suficiente RAM.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF. El modelo base es compatible con transformers.
- Latencia y throughput estimados: no disponibles en la información proporcionada; dado el tamaño reducido, se espera baja latencia en CPU moderna.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Formato |
|---|---|---|---|---|---|
| C2S-Pythia-410m-cell-type-prediction (este) | 405 M | no disponible | scRNA-seq / biología | cc-by-4.0 | GGUF, safetensors |
| Pythia-410m (EleutherAI) | 410 M | 2048 (típico en Pythia) | propósito general | Apache 2.0 | safetensors |
| Modelos de anotación celular tipo CellTypist / scType | variable (no LLM) | N/A | scRNA-seq | variable | propietario/OSS |

La comparación directa con alternativas específicas de predicción de tipos celulares basadas en LLM no está disponible en la información proporcionada. Frente a Pythia-410m base, este modelo está especializado en el dominio biológico; frente a herramientas clásicas como CellTypist, emplea una arquitectura transformer en lugar de clasificadores lineales o basados en markers.

## Limitaciones y advertencias

- Modelo de dominio muy específico: no es adecuado para generación de texto general, código ni conversación.
- Riesgo de alucinación en la asignación de tipos celulares, especialmente con perfiles de expresión atípicos o tipos celulares no vistos en entrenamiento.
- Solo soporta inglés según los tags del repositorio.
- La licencia CC-BY-4.0 permite uso comercial con atribución, pero conviene revisar las condiciones del modelo base original.
- No se documentan sesgos específicos, pero al derivar de Pythia (entrenado sobre The Pile) puede heredar sesgos del corpus original, aunque su aplicación biológica los mitiga.
- No hay información sobre el contexto máximo soportado, lo que limita el diseño de pipelines que dependan de ventanas largas.
- Al ser una cuantización, las versiones de baja precisión (Q2_K, Q3_K_S) pueden degradar la calidad de las predicciones; se recomienda Q4_K_M o superior para uso en producción.
- No se han publicado benchmarks que validen su rendimiento frente a alternativas, por lo que su eficacia real en tareas downstream debe validarse empíricamente.

## Enlaces

- Repositorio Hugging Face (cuantización GGUF): https://huggingface.co/mradermacher/C2S-Pythia-410m-cell-type-prediction-GGUF
- Modelo base original: https://huggingface.co/vandijklab/C2S-Pythia-410m-cell-type-prediction
- Página de descargas del autor: https://hf.tst.eu/model#C2S-Pythia-410m-cell-type-prediction-GGUF
- Repositorio de peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
