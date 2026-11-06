# mradermacher/VNBot-MotaZ-27B-GGUF

## Resumen

VNBot-MotaZ-27B-GGUF es la versión cuantizada en formato GGUF del modelo VNBot-MotaZ-27B, desarrollado originalmente por vnbot-ai y convertido por mradermacher. Se trata de un modelo de 27.320.697.856 parámetros (aproximadamente 27,3 mil millones) orientado a tareas conversacionales y multimodal (image-text-to-text, según los resultados de búsqueda), con soporte para vietnamita (vi) e inglés (en). La cuantización GGUF permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles, algo inviable con los pesos originales en precisión completa.

El modelo base es VNBot-MotaZ-27B, del que no se dispone de información detallada sobre arquitectura, datos de entrenamiento ni benchmarks en la documentación proporcionada. La ficha del repositorio GGUF incluye únicamente los metadatos de cuantización (tipos Q2_K a Q8_0, más suplementos multimodales mmproj) y referencias genéricas sobre el uso de archivos GGUF. La licencia es Apache 2.0, lo que facilita el uso comercial y la redistribución.

La relevancia de esta ficha radica en que permite evaluar rápidamente la disponibilidad de un modelo de 27B en formato GGUF con capacidades multimodales y soporte para vietnamita, un idioma poco cubierto en la mayoría de modelos abiertos. No obstante, la ausencia de benchmarks publicados y de documentación técnica del modelo base limita considerablemente la evaluación de su calidad real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer, sin confirmar) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; suplementos mmproj Q8_0 y f16 |
| Idiomas soportados | vi, en |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base VNBot-MotaZ-27B en la documentación proporcionada. El recuento de parámetros (27,3 mil millones) y la etiqueta "image-text-to-text" de los resultados de búsqueda sugieren un transformer multimodal con un codificador visual, pero no se confirma el tipo de atención, la composición del dataset ni el proceso de alineación (RLHF/DPO). Tampoco se especifica el número de tokens de entrenamiento ni las innovaciones técnicas empleadas.

La única información técnica disponible corresponde al proceso de cuantización realizado por mradermacher: se generaron cuantizaciones estáticas (no ponderadas con imatrix, según indica el autor) en versiones Q2_K a Q8_0, además de dos suplementos multimodales (mmproj Q8_0 de 0,7 GB y mmproj f16 de 1,0 GB) necesarios para el procesamiento de imágenes. El autor señala que las cuantizaciones ponderadas/imatrix no estaban disponibles en el momento de la publicación y que podrían solicitarse mediante una discusión comunitaria.

## Capacidades

- Generación de texto conversacional en vietnamita e inglés, según los idiomas declarados en la model card.
- Procesamiento multimodal image-text-to-text, indicado por la etiqueta del modelo y la presencia de archivos mmproj para el codificador visual.
- Conversación multi-turno (etiqueta "conversational" en los tags del repositorio).
- Compatibilidad con endpoints (tag "endpoints_compatible"), lo que sugiere integración con infraestructura de despliegue de Hugging Face.
- No se dispone de información sobre soporte de tool calling, function calling, agentes, razonamiento multi-paso, modo thinking, audio u otras capacidades especiales.

## Casos de uso

- Atención al cliente en vietnamita: el modelo puede gestionar conversaciones multi-turno en vietnamita e inglés, lo que lo hace adecuado para empresas que atienden a usuarios vietnamitas y necesitan un modelo local sin depender de APIs externas.
- Procesamiento de documentos con imágenes: gracias a los suplementos mmproj, puede emplearse para tareas image-text-to-text como descripción de imágenes o extracción de información de capturas y formularios, siempre que se valide su calidad real.
- Despliegue en hardware de consumo: las cuantizaciones Q4_K_S (15,9 GB) y Q4_K_M (16,9 GB) permiten ejecutar el modelo en GPUs de consumo con 24 GB de VRAM, algo imposible con los pesos originales en f16.
- Prototipado rápido con llama.cpp u Ollama: la disponibilidad de múltiples niveles de cuantización (desde Q2_K de 11,0 GB) facilita probar el modelo en estaciones de trabajo modestas antes de invertir en infraestructura mayor.
- Traducción y asistencia bilingüe vi-en: el soporte declarado de ambos idiomas permite usarlo como asistente de traducción o redacción en contextos donde se combinen vietnamita e inglés.
- Investigación sobre modelos multilingües de tamaño medio: sirve como objeto de estudio para comparar el rendimiento de un modelo de 27B en vietnamita frente a alternativas más grandes o más pequeñas, aunque la falta de benchmarks publicados limita la comparación rigurosa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según tamaño del archivo GGUF):
  - Q2_K: ~11,0 GB
  - Q3_K_S: ~12,4 GB
  - Q3_K_M: ~13,6 GB
  - Q3_K_L: ~14,7 GB
  - IQ4_XS: ~15,5 GB
  - Q4_K_S: ~15,9 GB
  - Q4_K_M: ~16,9 GB
  - Q5_K_S: ~19,1 GB
  - Q5_K_M: ~19,6 GB
  - Q6_K: ~22,5 GB
  - Q8_0: ~29,1 GB
  - Suplemento multimodal mmproj Q8_0: ~0,7 GB adicionales; mmproj f16: ~1,0 GB adicionales.
- GPU recomendadas: para Q4_K_M (~16,9 GB) basta una RTX 4090 (24 GB) o RTX 3090 (24 GB); para Q8_0 (~29,1 GB) se requiere una A100 40 GB, H100 o varias GPUs de consumo.
- Cabe en GPU de consumo: sí, en cuantizaciones Q2_K a Q5_K_M en GPUs de 16-24 GB; Q6_K y Q8_0 requieren 24 GB o más.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF (kobold.cpp, LM Studio). Para el modelo base en safetensors, vLLM o TGI, aunque no se confirma su compatibilidad.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente sobre el modelo base ni de benchmarks publicados para establecer una comparativa rigurosa con alternativas de la misma categoría. Se indica "no disponible".

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay datos objetivos de rendimiento en MMLU, HumanEval, GSM8K ni otras pruebas, lo que impide evaluar su calidad frente a alternativas.
- Documentación técnica inexistente sobre el modelo base: se desconoce la arquitectura exacta, el contexto máximo, la composición del dataset y el proceso de alineación.
- Riesgo de alucinación: inherente a los modelos generativos de este tamaño; sin datos de evaluación no puede cuantificarse.
- Sesgos conocidos: no disponibles; al estar entrenado principalmente para vietnamita e inglés, es probable un sesgo cultural y lingüístico hacia esos contextos.
- Limitaciones de idioma: solo se declaran vietnamita e inglés; el rendimiento en castellano no está garantizado ni documentado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base (vnbot-ai/VNBot-MotaZ-27B), ya que la cuantización hereda las condiciones del original.
- Cuantizaciones estáticas sin imatrix: el autor indica que las versiones ponderadas no estaban disponibles, por lo que la calidad de las cuantizaciones de baja precisión (Q2_K, Q3_K) puede ser inferior a la de cuantizaciones imatrix equivalentes.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/VNBot-MotaZ-27B-GGUF
- Modelo base: https://huggingface.co/vnbot-ai/VNBot-MotaZ-27B
- Versión GGUF del autor original: https://huggingface.co/vnbot-ai/VNBot-MotaZ-27B-GGUF
- Página de solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
