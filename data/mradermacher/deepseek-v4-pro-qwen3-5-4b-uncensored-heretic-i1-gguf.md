# mradermacher/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic-i1-GGUF

## Resumen

DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic-i1-GGUF es una cuantización GGUF del modelo base xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic, publicada por el cuantizador mradermacher. Se trata de un modelo de 4.326.350.848 parámetros (aproximadamente 4,3 mil millones) que combina, según sus etiquetas, rasgos de la familia Qwen3.5 con destilación de razonamiento de DeepSeek, entrenamiento SFT, matemáticas y STEM, y una variante "heretic/abliterated" orientada a eliminar los rechazos de contenido. La licencia declarada es Apache 2.0.

El artefacto publicado es un conjunto de cuantizaciones GGUF generadas con imatrix (método i1) a partir del modelo original en formato Hugging Face, lo que permite su despliegue en llama.cpp y entornos compatibles con GGUF. El repositorio ocupa 39,2 GB e incluye múltiples niveles de cuantización desde i1-Q2_K (2,1 GB) hasta i1-Q6_K (3,7 GB), además del fichero imatrix para generar cuantizaciones propias. La model card indica que el modelo base es de visión, por lo que los ficheros mmproj, si existen, se alojan en el repositorio estático hermano.

La relevancia de esta ficha radica en que permite ejecutar en hardware de consumo un modelo de 4B con capacidades declaradas de razonamiento, matemáticas y multilingüismo (inglés, chino, coreano, japonés, español y ruso), sin las restricciones de contenido habituales. No obstante, la información técnica publicada es escasa: no se detallan arquitectura interna, longitud de contexto ni resultados de benchmarks, por lo que varios apartados se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetas: qwen3_5, transformer, distillation, sft, mtp) |
| Parametros totales | 4.326.350.848 |
| Parametros activos | no disponible (no se declara MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-IQ4_NL, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K, mas fichero imatrix |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones i1/imatrix); el modelo base en safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base. Las etiquetas del repositorio apuntan a una base de la familia Qwen3.5 ("qwen3_5") con destilación de razonamiento ("reasoning", "distillation", "deepseek"), ajuste supervisado ("sft") y posible uso de multi-token prediction ("mtp"). El nombre sugiere un proceso de destilación desde un modelo mayor de DeepSeek hacia una arquitectura Qwen de 4B, aunque no se documenta el número de tokens de entrenamiento ni la composición del dataset.

El componente "heretic/abliterated/uncensored" indica una modificación orientada a suprimir los rechazos de contenido, presumiblemente mediante técnicas de abliteration sobre el modelo ajustado. No se especifican detalles del procedimiento, del volumen de datos de calibración ni de si hubo fases de RLHF o DPO. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal. La model card del repositorio de cuantización se limita a describir el proceso de cuantización con imatrix y a enlazar los ficheros generados.

## Capacidades

- Generación de texto conversacional multi-turno, según la etiqueta "conversational".
- Razonamiento explícito ("reasoning") y modo de pensamiento derivado de la destilación de DeepSeek.
- Matemáticas y STEM ("math", "stem"), presumiblemente reforzados durante el SFT.
- Capacidad de visión declarada por el cuantizador (modelo base de visión; ficheros mmproj en el repositorio estático).
- Multilingüismo en inglés, chino, coreano, japonés, español y ruso.
- Comportamiento sin rechazos de contenido ("uncensored", "decensored", "abliterated").
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de audio: no disponible.

## Casos de uso

- Asistente conversacional local: con cuantizaciones i1-Q4_K_M de 2,9 GB, el modelo cabe en GPUs de consumo de 8 GB o menos y permite desplegar un chatbot multi-turno en local sin dependencia de la nube, útil para prototipos y entornos con requisitos de privacidad.
- Razonamiento matemático y STEM en el aula o laboratorio: las etiquetas "math" y "stem" sugieren un ajuste específico para resolver problemas paso a paso; puede emplearse como tutor o verificador de ejercicios en inglés, chino, español u otros idiomas soportados.
- Generación de documentación técnica multilingüe: al cubrir seis idiomas, resulta adecuado para traducir y redactar documentación de producto entre inglés, chino, japonés, coreano, español y ruso con un único modelo de 4B.
- Investigación sobre alineación y seguridad: la variante abliterated permite estudiar el comportamiento de modelos sin rechazos, comparar respuestas frente a la versión original y analizar sesgos residuales en tareas controladas.
- Procesamiento de imágenes en pipelines ligeros: si se descargan los ficheros mmproj del repositorio estático, el modelo puede emplearse para descripción de imágenes o extracción de texto en entornos con recursos limitados.
- Despliegue en dispositivos de borde: con cuantizaciones de 2,1 a 2,7 GB (i1-Q2_K, i1-IQ3_XS, i1-IQ4_XS) es viable en mini-PCs, portátiles sin GPU dedicada o placas embebidas con suficiente RAM, mediante llama.cpp.
- Fine-tuning y experimentación: el fichero imatrix y los distintos niveles de cuantización permiten evaluar el equilibrio calidad/tamaño antes de integrar el modelo en un producto, y servir de base para ajustes posteriores sobre el modelo original en safetensors.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,1 GB (i1-Q2_K), 2,7 GB (i1-IQ4_XS), 2,9 GB (i1-Q4_K_M), 3,3 GB (i1-Q5_K_M) y 3,7 GB (i1-Q6_K), a los que hay que sumar la memoria para el contexto KV.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para cuantizaciones bajas; RTX 3060/4060, RTX 4090, A100 o H100 ofrecen margen sobrado y mayor throughput.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 6 GB o más usando cuantizaciones i1-Q4_K_M o inferiores; en 4 GB solo con cuantizaciones muy agresivas y contexto reducido.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio y otros runners compatibles con GGUF; el repositorio también declara compatibilidad con text-generation-inference y transformers para el modelo base.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic-i1-GGUF | 4,3B | no disponible | Apache 2.0 | GGUF | Variante sin censura, multilingüe (6 idiomas), con visión declarada |
| Qwen3.5-4B (familia base) | ~4B | no disponible | no disponible | safetensors, GGUF | Referencia de la arquitectura; sin modificación abliterated |
| Llama 3.2 3B Instruct | 3,2B | 128K | Llama 3.2 Community License | safetensors, GGUF | Alternativa de tamaño similar con contexto documentado |
| Phi-3.5-mini-instruct | 3,8B | 128K | MIT | safetensors, GGUF | Buen rendimiento en razonamiento y matemáticas |

La comparación es orientativa: no se dispone de datos de benchmarks del modelo evaluado que permitan contrastar rendimiento real frente a estas alternativas.

## Limitaciones y advertencias

- La variante "uncensored/abliterated" elimina los rechazos de contenido, lo que implica un riesgo elevado de generar material dañino, ilegal o inexacto sin filtros; no es adecuada para aplicaciones de cara al público sin moderación adicional.
- Riesgo de alucinación inherente a los modelos de 4B, especialmente en tareas de razonamiento largo o con conocimiento factual actualizado.
- No se documenta la longitud de contexto soportada, lo que impide planificar despliegues con ventanas largas sin pruebas previas.
- La información sobre arquitectura, datos de entrenamiento y proceso de abliteration es muy limitada, lo que dificulta evaluar sesgos y comportamientos residuales.
- Aunque la licencia es Apache 2.0, el uso comercial de una variante sin censura puede contravenir normativas locales de contenido y plataformas de distribución; conviene revisar el cumplimiento legal antes de producción.
- El modelo base declara capacidades de visión, pero los ficheros mmproj no están en este repositorio; hay que descargarlos del repositorio estático, y no se garantiza que todas las cuantizaciones los soporten.
- El soporte multilingüe está declarado, pero no se aportan métricas de calidad por idioma; el rendimiento en español o ruso puede ser inferior al del inglés.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic-i1-GGUF
- Modelo base: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic-i1-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
