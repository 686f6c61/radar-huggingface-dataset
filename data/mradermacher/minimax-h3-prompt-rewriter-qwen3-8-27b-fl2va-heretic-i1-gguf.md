# mradermacher/MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-FL2VA-heretic-i1-GGUF

## Resumen

MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-FL2VA-heretic es un modelo de lenguaje y visión especializado en la reescritura, expansión y mejora de prompts, orientado específicamente a la generación de prompts para modelos de vídeo y audio-vídeo (texto a vídeo-audio, imagen a vídeo-audio, etc.). Está construido sobre una base de la familia Qwen3.8 (según la nomenclatura del autor) con aproximadamente 26.900 millones de parámetros (26.895.998.464 según los pesos en safetensors) y ha sido afinado mediante SFT para la tarea de prompt rewriting multimodal.

La versión aquí descrita es una cuantización GGUF con método imatrix (i1) realizada por mradermacher a partir del modelo original de LeViAtHaN2K. La variante "heretic" indica que el modelo ha sido sometido a un proceso de "abliteration" o decensurado, eliminando parte de las restricciones de rechazo del modelo base. El modelo es relevante para flujos de trabajo de generación de vídeo con IA, donde la calidad del prompt condiciona directamente la calidad del resultado, y permite ejecutar localmente una tarea especializada que de otro modo requeriría modelos propietarios o prompts manuales muy elaborados.

La información disponible sobre arquitectura interna, datos de entrenamiento y benchmarks es muy limitada: la model card del cuantizador se limita a describir el proceso de cuantización y a remitir al modelo base. Los datos que siguen reflejan exclusivamente lo que consta en la información proporcionada, indicando "no disponible" cuando no hay dato.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.8, según tags y nomenclatura del autor); detalles internos no disponibles |
| Parámetros totales | 26.895.998.464 (~26,9 mil millones) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF con imatrix (i1): i1-Q2_K, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, IQ3_L, IQ3_XXS, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ1_S, IQ1_M, Q2_K, Q2_K_S, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ4_XS, IQ4_NL (small) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizado); el modelo base en safetensors |
| Tamaño del repositorio | 11,1 GB |
| Modelo base | LeViAtHaN2K/MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-FL2VA-heretic |
| Cuantizador | mradermacher |
| Fecha de creación | 2026-11-22 |

## Arquitectura y entrenamiento

El modelo es una cuantización GGUF del modelo LeViAtHaN2K/MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-FL2VA-heretic. Por los tags y la nomenclatura, se trata de un transformer derivado de la familia Qwen3.8, afinado mediante SFT (supervised fine-tuning) para la tarea de reescritura y expansión de prompts, con soporte multimodal (vision-language) orientado a prompts de vídeo y audio-vídeo. Los sufijos "t2va", "i2va", "l2va" y "fl2va" sugieren que el modelo está entrenado para producir prompts destinados a generadores de vídeo con audio a partir de texto, imagen, latentes o frame-latentes.

La variante "heretic" implica que el modelo ha sido sometido a un proceso de abliteration o decensurado, que elimina o atenúa las direcciones de activación asociadas al rechazo de contenido. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas específicas más allá de lo indicado. La cuantización se ha realizado con método imatrix (i1), que emplea una matriz de importancia para mejorar la calidad de las cuantizaciones de baja precisión; los ficheros mmproj para la parte de visión, si existen, se alojan en el repositorio estático del cuantizador.

## Capacidades

- Reescritura, expansión y mejora de prompts: transforma instrucciones breves en prompts detallados y estructurados.
- Generación de prompts para vídeo y audio-vídeo: orientado a flujos t2va (texto a vídeo-audio), i2va (imagen a vídeo-audio), l2va (latentes a vídeo-audio) y fl2va (frame-latentes a vídeo-audio).
- Capacidades de visión: el modelo es multimodal (vision-language), con ficheros mmproj asociados.
- Conversacional: tag "conversational", apto para diálogo multi-turno.
- Compatible con endpoints y despliegue mediante vLLM (según tags).
- Modelo decensurado/abliterado: menor tendencia a rechazar peticiones que el base.
- No se especifican capacidades de tool calling, agentes o matemáticas en la información disponible.

## Casos de uso

- Generación de prompts para vídeo con IA: el modelo convierte una idea breve del usuario en un prompt detallado con descripción de escena, cámara, iluminación y audio, listo para un generador texto-a-vídeo-audio. Es adecuado porque está afinado específicamente para esta tarea.
- Enriquecimiento de prompts desde imagen: a partir de una imagen de referencia (i2va), el modelo describe y expande los elementos visuales para condicionar la generación de vídeo.
- Preprocesado en pipelines de generación de vídeo: integrar el modelo como etapa previa de reescritura de prompts en un pipeline automatizado, mejorando la consistencia y el detalle de los resultados sin intervención manual.
- Herramienta de autoría para creadores: interfaz donde el usuario escribe una idea y recibe varias variantes de prompt expandidas, con control de estilo, para iterar rápidamente en producción audiovisual.
- Investigación en prompt engineering multimodal: permite estudiar cómo la expansión automática de prompts afecta a la calidad de la generación de vídeo, con un modelo local y cuantizado.
- Despliegue local en estaciones de trabajo con GPU de consumo: gracias a las cuantizaciones GGUF de baja precisión, puede ejecutarse en entornos con recursos limitados para tareas de reescritura de prompts en lote.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: para un modelo de ~26,9 mil millones de parámetros en GGUF, la cuantización i1-Q2_K ocupa aproximadamente 11,2 GB en disco; en memoria se requiere algo más por el contexto y los buffers. Las cuantizaciones Q4_K_M o Q5_K_M requerirán del orden de 16-20 GB de VRAM, y Q6_K en torno a 22-24 GB (estimaciones orientativas, no confirmadas en la información).
- GPU recomendadas: para cuantizaciones de baja precisión, tarjetas con 12-16 GB (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080) pueden ser suficientes; para cuantizaciones medias y altas se recomienda 24 GB (RTX 3090, RTX 4090) o GPUs de datacenter (A100, H100).
- Cabe en GPU de consumo: sí, en función de la cuantización elegida; las variantes Q2/IQ2 e IQ3 son las más ligeras.
- Opciones de despliegue: llama.cpp, Ollama, y vLLM para el modelo base (según tags); los ficheros mmproj para visión están en el repositorio estático.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-FL2VA-heretic (i1-GGUF) | ~26,9 B | no disponible | no disponible | GGUF | Especializado en prompt rewriting para vídeo/audio-vídeo, decensurado |
| Modelo base LeViAtHaN2K/MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-FL2VA-heretic | ~26,9 B | no disponible | no disponible | safetensors | Versión original sin cuantizar |
| Qwen3.8 (familia base) | no disponible | no disponible | no disponible | no disponible | Modelo generalista del que deriva; no especializado en prompt rewriting |

No se dispone de datos de rendimiento comparativo ni de otras alternativas especializadas en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés (tag de idioma "en"); el rendimiento en castellano no está garantizado.
- Modelo decensurado/abliterado ("heretic"): puede generar contenido que el modelo base rechazaría; requiere filtrado y políticas de uso en producción.
- Riesgo de alucinación inherente a los modelos de lenguaje; en tareas de reescritura puede introducir detalles no presentes en la instrucción original.
- Licencia no disponible: no se puede confirmar el uso comercial; es imprescindible verificar la licencia del modelo base antes de desplegarlo.
- Información muy limitada sobre arquitectura, contexto y entrenamiento; los datos de rendimiento no están publicados.
- Cuantizaciones de muy baja precisión (IQ1, IQ2) degradan la calidad; para producción se recomienda IQ4_XS o superior.
- El modelo está orientado a una tarea muy específica (prompt rewriting para vídeo); su utilidad fuera de ese dominio es limitada.

## Enlaces

- Repositorio Hugging Face (esta cuantización): https://huggingface.co/mradermacher/MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-FL2VA-heretic-i1-GGUF
- Repositorio de cuantizaciones estáticas: https://huggingface.co/mradermacher/MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-FL2VA-heretic-GGUF
- Modelo base: https://huggingface.co/LeViAtHaN2K/MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-FL2VA-heretic
- Página de descargas del cuantizador: https://hf.tst.eu/model#MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-FL2VA-heretic-i1-GGUF
- Peticiones de modelos del cuantizador: https://huggingface.co/mradermacher/model_requests
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de calidad de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
