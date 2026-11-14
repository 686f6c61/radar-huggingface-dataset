# mradermacher/ViRA-27B-GGUF

## Resumen

ViRA-27B-GGUF es la versión cuantizada en formato GGUF del modelo ViRA-27B, desarrollado originalmente por el usuario huaweilin y convertido a GGUF por mradermacher. Se trata de un modelo de visión-lenguaje (vision-language) orientado a tareas de agente visual de alta resolución, entrenado mediante aprendizaje por refuerzo (reinforcement learning). El modelo base cuenta con aproximadamente 26.900 millones de parámetros (26.895.998.464 según los pesos en safetensors), lo que lo sitúa en la categoría de modelos de ~27B.

La relevancia de esta ficha radica en que ofrece una vía práctica para ejecutar un modelo de agente visual de gran tamano en infraestructura local mediante cuantización GGUF, algo especialmente útil para desarrolladores que necesitan desplegar capacidades de razonamiento visual sin depender de APIs externas. El repositorio incluye tanto los pesos del modelo de lenguaje cuantizados como los ficheros `mmproj` (proyección multimodal) necesarios para el procesamiento de imágenes.

La información pública disponible es limitada: la model card del autor de la cuantización remite al modelo base y no detalla la arquitectura interna, los datos de entrenamiento ni resultados de benchmarks. Esta ficha se limita a los datos verificables del repositorio y marca explícitamente como "no disponible" todo aquello que no se puede confirmar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de visión-lenguaje; pesos en transformers) |
| Parámetros totales | 26.895.998.464 (~26,9B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; mmproj en Q8_0 y F16 |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de cuantización); safetensors en el modelo base |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base ViRA-27B en la información proporcionada. Los tags del repositorio indican que se trata de un modelo de visión-lenguaje ("vision-language"), orientado a agente visual ("visual-agent") y de alta resolución ("high-resolution"), con un pipeline declarado de aprendizaje por refuerzo ("reinforcement-learning"). El nombre y los tags sugieren un transformer multimodal con un componente de proyección visual (los ficheros `mmproj` confirman la presencia de un encoder/proyector multimodal separado).

El dataset de entrenamiento declarado es `huaweilin/ViRA-Train`, del que no se detalla composición ni número de tokens. No se especifica si hubo RLHF, DPO u otras técnicas de alineación, ni innovaciones técnicas concretas como decodificación especulativa o atención lineal. Toda esta información se considera no disponible.

## Capacidades

- Procesamiento de visión y lenguaje: el modelo combina entrada de imágenes con texto, según los tags "vision-language" y los ficheros de proyección multimodal incluidos.
- Agente visual: el tag "visual-agent" indica orientación a tareas de interacción con entornos visuales o interfaces.
- Alta resolución: el tag "high-resolution" sugiere capacidad para procesar imágenes de resolución elevada.
- Aprendizaje por refuerzo: el pipeline declarado es "reinforcement-learning", lo que apunta a un entrenamiento orientado a tareas de razonamiento o decisión.
- Conversacional: el repositorio está marcado como "conversational", por lo que soporta diálogo multi-turno.
- Capacidades de tool calling, agentes multi-paso, matemáticas, código o thinking mode: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según el campo `language`.

## Casos de uso

- Automatización de tareas sobre interfaces gráficas: el modelo, etiquetado como "visual-agent", puede emplearse para interpretar capturas de pantalla y decidir acciones sobre elementos de UI, aprovechando su naturaleza de agente visual.
- Análisis de documentos e imágenes de alta resolución: el tag "high-resolution" lo hace adecuado para extraer información de planos, diagramas o capturas densas en detalle donde modelos de baja resolución pierden contexto.
- Asistencia conversacional multimodal: al estar marcado como "conversational" y soportar visión, puede gestionar diálogos multi-turno en los que el usuario adjunta imágenes.
- Despliegue local en estaciones de trabajo: las cuantizaciones Q4_K_M (16,6 GB) y Q5_K_M (19,3 GB) permiten ejecutarlo en GPUs de consumo alto o en configuraciones con memoria unificada, sin depender de APIs.
- Prototipado de agentes que razonan sobre entornos visuales: útil en investigación para experimentar con políticas de agente visual entrenadas por refuerzo antes de escalar a infraestructura mayor.
- Evaluación comparativa de modelos multimodales: la disponibilidad de múltiples niveles de cuantización (de Q2_K a Q8_0) permite medir el impacto de la compresión en tareas visuales dentro de un mismo pipeline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos del modelo de lenguaje, sin contar el proyector multimodal):
  - Q2_K: ~10,8 GB
  - Q3_K_M: ~13,4 GB
  - Q4_K_S: ~15,7 GB
  - Q4_K_M: ~16,6 GB (recomendado por el autor por velocidad)
  - Q5_K_M: ~19,3 GB
  - Q6_K: ~22,2 GB
  - Q8_0: ~28,7 GB
- Proyector multimodal adicional: 0,7 GB (mmproj-Q8_0) o 1,0 GB (mmproj-F16).
- GPU recomendadas: para Q4_K_M y Q5_K_M, GPUs con 24 GB o más (RTX 3090, RTX 4090, A10G, L4 en configuraciones ajustadas). Para Q8_0 y F16, se requiere A100 40/80 GB, H100 o múltiples GPUs.
- ¿Cabe en GPU de consumo? Sí, en cuantizaciones Q4_K_S/Q4_K_M (16-17 GB) en tarjetas de 24 GB como la RTX 4090 o la RTX 3090, dejando margen para el contexto y el proyector visual. Las cuantizaciones Q2_K y Q3 caben en GPUs de 16 GB con holgura limitada.
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, LM Studio, KoboldCpp) para GGUF; el modelo base en safetensors puede servirse con vLLM o TGI si el soporte multimodal está disponible (no confirmado en la información).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones detalladas de modelos comparables en la información proporcionada, por lo que la comparativa cuantitativa no está disponible. A modo orientativo de categoría, ViRA-27B se sitúa en el segmento de modelos multimodales de ~27B, pero no se pueden establecer comparaciones fiables sin benchmarks publicados.

| Modelo | Parámetros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| ViRA-27B | ~26,9B | no disponible | Apache 2.0 | GGUF / safetensors |
| Alternativas de ~27B multimodal | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Idiomas: el modelo declara únicamente inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Sesgos: no se documentan sesgos conocidos en la información disponible; al ser un modelo entrenado por refuerzo sobre un dataset no detallado, existe riesgo de sesgos no caracterizados.
- Alucinación: sin benchmarks ni evaluación publicada, no se puede cuantificar la tasa de alucinación, especialmente en tareas visuales de alta resolución.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y de los datos de entrenamiento (`huaweilin/ViRA-Train`), no detalladas.
- Contexto: se desconoce la longitud máxima de contexto, lo que impide planificar despliegues con documentos largos o historiales extensos.
- Cuantizaciones bajas: Q2_K y Q3_K_S pueden degradar notablemente el rendimiento en tareas visuales; el autor recomienda Q4_K_S/Q4_K_M para velocidad y Q6_K/Q8_0 para calidad.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el modelo base carece de documentación técnica pública detallada; no se recomienda para producción sin una evaluación propia previa.
- El autor de la cuantización indica que no hay cuantizaciones con imatrix/weighted disponibles en ese momento, lo que puede afectar a la calidad relativa frente a otras versiones.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/ViRA-27B-GGUF
- Modelo base: https://huggingface.co/huaweilin/ViRA-27B
- Dataset de entrenamiento: https://huggingface.co/datasets/huaweilin/ViRA-Train
- Página de descargas del autor: https://hf.tst.eu/model#ViRA-27B-GGUF
- Guía de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Gráfico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del autor de la cuantización: https://www.nethype.de/
