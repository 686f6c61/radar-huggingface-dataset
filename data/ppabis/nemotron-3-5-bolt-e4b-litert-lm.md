# ppabis/Nemotron-3.5-Bolt-E4B-LiteRT-LM

## Resumen

Nemotron 3.5 Bolt E4B LiteRT-LM es una exportación cuantizada del modelo multimodal NVIDIA Nemotron 3.5 Bolt E4B en formato BF16, empaquetada por el usuario ppabis para su ejecución con la librería LiteRT-LM de Google. El paquete incluye el decodificador de texto, el codificador de visión, el codificador de audio y ambos proyectores de modalidad, además del tokenizador y la plantilla de chat originales de NVIDIA. Su propósito es permitir la inferencia local del modelo base en entornos donde LiteRT-LM esté disponible, con un tamaño de repositorio de 3,6 GB.

La relevancia de esta ficha radica en que se trata de un artefacto de conversión, no de un modelo entrenado desde cero: hereda las capacidades del checkpoint original de NVIDIA pero las somete a un esquema de cuantización mixta agresivo (2, 4 y 8 bits según el componente). El contexto por defecto se reduce a 2.048 tokens, muy por debajo del que probablemente soporte el modelo base, lo que condiciona su uso en producción. La validación publicada es mínima y el propio autor reconoce que la integración con DFlash y las evaluaciones amplias de precisión y rendimiento están pendientes.

Se distribuye bajo licencia OpenMDW 1.1, con el identificador de modelo base `nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16` en la revisión `49843eed8db1f1c616c47af75cfd36e07aec0667`. No se han publicado datos sobre número de parámetros totales, idiomas soportados ni resultados de benchmarks en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Exportación LiteRT-LM del modelo base NVIDIA Nemotron 3.5 Bolt E4B (decodificador de texto, codificador de visión, codificador de audio y proyectores de modalidad); arquitectura interna del modelo base no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | 2.048 tokens (por defecto en el bundle) |
| Tipos de cuantización | Mixta: 2 bits en embeddings de token, embeddings por capa y proyección de salida; 4 bits en pesos de atención y MLP; 8 bits en gates y proyecciones por capa; 8 bits en los dos codificadores de modalidad y proyectores |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW 1.1 (openmdw-1.1) |
| Formato de pesos | LiteRT-LM (`.litertlm`) |
| Tamaño del bundle | 3,57 GB |
| Modelo base | nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16 (revisión 49843eed8db1f1c616c47af75cfd36e07aec0667) |
| SHA-256 | a1c8aa9e5d499bb5223756f5663f162659758b2c8292913840b1047add66d4ad |
| Librería | litert-lm |
| Backend validado | LiteRT-LM 0.19.2, Linux ARM64, CPU |

## Arquitectura y entrenamiento

El artefacto no documenta el entrenamiento del modelo subyacente. Lo que se describe es el proceso de exportación: se tomaron del checkpoint de NVIDIA el decodificador de texto, el codificador de visión, el codificador de audio y los dos proyectores de modalidad, y se generó un grafo LiteRT-LM con cuantización mixta. El grafo de texto emplea embeddings de token y por capa, así como la proyección de salida, a 2 bits; los pesos de atención y de las capas MLP a 4 bits; y los gates y proyecciones por capa a 8 bits. Los dos codificadores de modalidad y sus proyectores se cuantizan a 8 bits donde la receta de exportación lo permite.

La innovación técnica del paquete es precisamente ese esquema de cuantización diferenciado por componente, orientado a reducir el peso a 3,57 GB manteniendo la ruta multimodal completa (texto, imagen y audio) en un único fichero. Se incluyen el tokenizador y la plantilla de chat de NVIDIA. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si el modelo base utilizó RLHF, DPO u otras técnicas de alineamiento. La integración con DFlash está anunciada como pendiente.

## Capacidades

- Generación de texto: validada con dos preguntas básicas de cultura general en LiteRT-LM 0.19.2 sobre Linux ARM64 CPU.
- Comprensión de imagen: el codificador de visión y su proyector están incluidos; la validación identificó correctamente una imagen de color rojo sólido.
- Comprensión de audio: el codificador de audio y su proyector están incluidos; la transcripción de una muestra de voz sintética se realizó con errores según el autor.
- Multimodalidad integrada en un único bundle: texto, visión y audio comparten el mismo fichero `.litertlm`.
- Plantilla de chat y tokenizador originales de NVIDIA incluidas en el paquete.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking, decodificación especulativa u otras capacidades especiales: no disponibles; DFlash pendiente de integración.

## Casos de uso

- Inferencia local en dispositivos ARM64: el bundle está validado en Linux ARM64 con backend CPU, por lo que encaja en estaciones de trabajo ARM, placas de desarrollo y entornos edge donde no se dispone de GPU dedicada. El tamaño de 3,57 GB permite almacenarlo en medios de capacidad moderada.
- Clasificación y descripción de imágenes en pipelines ligeros: el codificador de visión incluido permite etiquetar imágenes o responder preguntas simples sobre ellas en flujos de preprocesado, con la cautela de que la precisión no está evaluada más allá de una prueba con una imagen de color sólido.
- Transcripción aproximada de audio en entornos con recursos limitados: el codificador de audio permite obtener palabras clave de muestras de voz, útil para indexación o filtrado preliminar, aunque el propio autor advierte de errores en la transcripción.
- Prototipado de asistentes multimodales: al incluir texto, visión y audio en un solo artefacto y una plantilla de chat, sirve para validar la ruta de entrada y la ejecución de extremo a extremo antes de invertir en despliegues mayores.
- Evaluación comparativa de recetas de cuantización: investigadores que estudien el impacto de esquemas mixtos 2/4/8 bits pueden usar este bundle como referencia frente al checkpoint BF16 original de NVIDIA.
- Pruebas de integración con LiteRT-LM: desarrolladores que adopten esta librería disponen de un ejemplo funcional de modelo multimodal con comandos de ejecución documentados (`litert-lm run ... --backend cpu`).
- Despliegue en entornos con licencia OpenMDW 1.1: organizaciones que ya operen bajo este marco pueden incorporar el artefacto sin cambiar de régimen de licencia, verificando previamente las obligaciones del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única validación descrita es cualitativa: LiteRT-LM 0.19.2 sobre Linux ARM64 CPU respondió a dos preguntas de texto básicas, identificó una imagen roja sólida y transcribió con errores palabras clave de una muestra de voz sintética. No se aportan cifras de latencia, throughput ni métricas de precisión.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el bundle ocupa 3,57 GB en disco y la ejecución validada fue en CPU, sin datos de consumo de memoria en GPU.
- GPU recomendadas: no disponible; no se ha validado ningún backend GPU en la documentación publicada.
- Compatibilidad con GPU de consumo: no confirmada; el único entorno validado es Linux ARM64 con backend CPU.
- Opciones de despliegue: LiteRT-LM 0.19.2 (versión validada), con backend CPU. Otros runtimes (vLLM, llama.cpp, Ollama, TGI) no están soportados por el formato `.litertlm` según la información disponible.
- Latencia y throughput: no disponibles; el autor indica que la evaluación de rendimiento está pendiente.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Estado de validación |
|---|---|---|---|---|---|
| Nemotron 3.5 Bolt E4B LiteRT-LM (este artefacto) | no disponible | 2.048 tokens por defecto | LiteRT-LM | OpenMDW 1.1 | Cualitativa mínima en CPU ARM64 |
| nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16 (modelo base) | no disponible | no disponible | BF16 (safetensors presumiblemente) | no disponible en esta ficha | Checkpoint oficial de NVIDIA |
| Otras exportaciones LiteRT-LM de modelos multimodales | no disponible | no disponible | LiteRT-LM | variable | no disponible |

La comparación cuantitativa con alternativas de la misma categoría no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Artefacto de conversión, no un modelo oficial: cualquier problema de precisión puede deberse a la cuantización mixta 2/4/8 bits y no al modelo base de NVIDIA.
- Contexto reducido a 2.048 tokens por defecto, lo que limita conversaciones largas, documentos extensos y razonamiento multi-paso con historial amplio.
- Transcripción de audio con errores reconocidos por el autor; no apta para producción sin evaluación adicional.
- Validación de visión basada en una única imagen de color sólido; no hay evidencia sobre escenas complejas, OCR o preguntas visuales detalladas.
- Sin datos de benchmarks, latencia ni throughput; imposible estimar rendimiento en producción.
- Idiomas soportados no documentados; no se puede garantizar calidad en castellano ni en otros idiomas.
- Integración con DFlash pendiente, lo que puede afectar a la decodificación y al rendimiento futuro.
- Licencia OpenMDW 1.1: es necesario revisar sus términos y los del modelo base de NVIDIA antes de un uso comercial.
- Sin soporte confirmado en GPU ni en runtimes distintos de LiteRT-LM; el formato `.litertlm` no es portable a ecosistemas como GGUF o safetensors.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible; deben asumirse los del modelo base, agravados potencialmente por la cuantización.
- Repositorio sin descargas ni interacciones en el momento de la consulta, lo que reduce la evidencia de uso comunitario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ppabis/Nemotron-3.5-Bolt-E4B-LiteRT-LM
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16
- Revisión del modelo base: 49843eed8db1f1c616c47af75cfd36e07aec0667
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- LiteRT-LM (librería de ejecución): no disponible en la información proporcionada
