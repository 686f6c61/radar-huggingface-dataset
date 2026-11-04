# mradermacher/CHAI_SFT_model_8b-GGUF

## Resumen

CHAI_SFT_model_8b-GGUF es la versión cuantizada en formato GGUF del modelo chancharikm/CHAI_SFT_model_8b, un video-language model de 8.190.735.360 parámetros (aproximadamente 8,2 mil millones) afinado mediante SFT (supervised fine-tuning) con Llama Factory. El trabajo de cuantización lo firma mradermacher, un conocido publicador de versiones GGUF de la comunidad, que genera los ficheros estáticos a partir de los pesos originales en safetensors. El modelo está etiquetado como "video-language-model" y "video-captioning", lo que lo sitúa en la categoría de modelos multimodales capaces de procesar vídeo además de texto.

La relevancia de esta ficha es doble: por un lado, documenta un modelo especializado en captioning de vídeo con licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales; por otro, ofrece el conjunto completo de cuantizaciones GGUF (desde Q2_K hasta f16, más los ficheros mmproj para el proyector multimodal), lo que facilita su despliegue en hardware de consumo mediante llama.cpp y derivados. El repositorio ocupa 75,3 GB en total y acumula 376 descargas en el momento de la consulta.

No se dispone de información pública sobre la arquitectura interna, la longitud de contexto ni los datos de entrenamiento en la documentación proporcionada, más allá de la referencia al modelo base y al pipeline de Llama Factory. Esta ficha refleja únicamente los datos verificables y marca explícitamente como "no disponible" todo aquello que no consta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal vídeo-lenguaje; transformer presumiblemente, sin confirmar) |
| Parámetros totales | 8.190.735.360 (≈8,2 B) |
| Parámetros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; además mmproj-Q8_0 y mmproj-f16 para el componente multimodal |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base en safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base chancharikm/CHAI_SFT_model_8b. Las etiquetas del repositorio indican `llama-factory`, `full` y `generated_from_trainer`, lo que sugiere un fine-tuning completo (no LoRA) realizado con el framework Llama Factory sobre un modelo base multimodal. La etiqueta `video-language-model` y la presencia de ficheros `mmproj` (proyector multimodal) confirman que el modelo incorpora un adaptador de proyección para codificar entradas visuales de vídeo y alinearlas con el espacio de embeddings del modelo de lenguaje.

No consta el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF o DPO. El pipeline declarado es SFT (supervised fine-tuning), por lo que el ajuste se habría realizado exclusivamente con pares de instrucción-respuesta supervisados, presumiblemente orientados a tareas de descripción de vídeo (video captioning). Tampoco se documentan innovaciones técnicas como decodificación especulativa, atención lineal o mecanismos híbridos SSM.

## Capacidades

- Generación de descripciones de vídeo (video captioning): capacidad principal declarada por las etiquetas del modelo.
- Procesamiento multimodal: integra un proyector (`mmproj`) que permite alimentar el modelo con representaciones visuales de vídeo junto a texto.
- Generación de texto conversacional: el tag `conversational` indica formato de chat multi-turno.
- Fine-tuning completo sobre el modelo base, lo que preserva las capacidades del modelo original y añade la especialización en vídeo.
- Idioma: únicamente inglés según la model card; no se declara soporte multilingüe.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de audio o thinking mode: no disponibles.

## Casos de uso

- Descripción automática de vídeo para accesibilidad: el modelo puede generar subtítulos descriptivos de contenido audiovisual, útil para plataformas que necesitan texto alternativo en vídeos. Su especialización declarada en video captioning lo hace adecuado para este fin.
- Indexación y búsqueda semántica de archivos de vídeo: generar descripciones textuales que alimenten un motor de búsqueda o un sistema de etiquetado, permitiendo recuperar clips por contenido descrito en lenguaje natural.
- Moderación y análisis de contenido audiovisual: combinado con un pipeline de extracción de frames, el modelo puede describir escenas para revisión humana posterior en plataformas UGC.
- Generación de metadatos para archivos audiovisuales: producción de resúmenes y descripciones para bibliotecas de medios, archivos de televisión o repositorios educativos.
- Asistencia a creadores de contenido: descripción automática de clips para generar borradores de títulos, descripciones y textos de publicación en redes.
- Investigación en visión-lenguaje: al ser Apache 2.0 y estar disponible en GGUF, sirve como base reproducible para experimentos académicos en video-language modeling con hardware limitado.
- Despliegue en local para prototipado: las cuantizaciones Q4_K_M (5,1 GB) y Q5_K_M (6,0 GB) permiten ejecutar el modelo en estaciones de trabajo con GPU de consumo, facilitando pruebas sin infraestructura en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos del modelo de lenguaje):
  - Q2_K: ~3,4 GB
  - Q3_K_S: ~3,9 GB
  - Q3_K_M: ~4,2 GB
  - Q3_K_L: ~4,5 GB
  - IQ4_XS: ~4,7 GB
  - Q4_K_S: ~4,9 GB
  - Q4_K_M: ~5,1 GB
  - Q5_K_S: ~5,8 GB
  - Q5_K_M: ~6,0 GB
  - Q6_K: ~6,8 GB
  - Q8_0: ~8,8 GB
  - f16: ~16,5 GB
- Componente multimodal adicional: mmproj-Q8_0 (~0,9 GB) o mmproj-f16 (~1,3 GB), que debe sumarse a la VRAM del modelo de lenguaje.
- GPU recomendadas: para cuantizaciones Q4/Q5, una RTX 3060 de 12 GB o RTX 4060 Ti de 16 GB es suficiente; para Q8_0 o f16 se recomienda RTX 4090 (24 GB) o GPUs de datacenter como A100 o H100.
- Cabe en GPU de consumo: sí, en la mayoría de cuantizaciones Q4 y Q5 con GPUs de 8-12 GB (sumando el mmproj). Las versiones Q8_0 y f16 requieren 16-24 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. El tag `endpoints_compatible` sugiere compatibilidad con endpoints de inferencia estándar.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones detalladas de modelos comparables en la información proporcionada. A continuación se ofrece una comparación estructural basada únicamente en datos verificables del repositorio:

| Modelo | Parámetros | Contexto | Licencia | Formato | Especialización |
|---|---|---|---|---|---|
| CHAI_SFT_model_8b-GGUF | ≈8,2 B | no disponible | Apache 2.0 | GGUF | Video captioning |
| Modelo base chancharikm/CHAI_SFT_model_8b | ≈8,2 B | no disponible | Apache 2.0 | safetensors | Video captioning |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se identifican en la información proporcionada modelos comparables de video-language con los que establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Idioma: el modelo solo declara soporte para inglés; su uso en castellano u otros idiomas no está garantizado y probablemente degrade la calidad.
- Especialización estrecha: está afinado para video captioning; su rendimiento en tareas generales de texto puede ser inferior al de un LLM de propósito general del mismo tamaño.
- Riesgo de alucinación: como todo modelo generativo, puede describir contenido inexistente en el vídeo o inventar detalles; requiere validación en producción.
- Sesgos: no se documentan evaluaciones de sesgo; al entrenarse sobre datos no especificados, puede heredar sesgos presentes en ellos.
- Contexto: se desconoce la longitud de contexto, lo que impide garantizar el manejo de vídeos largos o conversaciones extensas.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base original y de los datos de entrenamiento, no documentadas aquí.
- Cuantizaciones de baja precisión: Q2_K y Q3_K pueden degradar notablemente la calidad; se recomienda Q4_K_M o superior para producción.
- Ficheros mmproj: es imprescindible descargar el proyector multimodal correspondiente para usar las capacidades de vídeo; sin él, el modelo solo procesa texto.
- Disponibilidad: el repositorio tiene pocas descargas (376) y un solo like, lo que indica escasa validación comunitaria.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/CHAI_SFT_model_8b-GGUF
- Modelo base: https://huggingface.co/chancharikm/CHAI_SFT_model_8b
- Página de descargas del autor: https://hf.tst.eu/model#CHAI_SFT_model_8b-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización del autor: https://huggingface.co/mradermacher/model_requests
