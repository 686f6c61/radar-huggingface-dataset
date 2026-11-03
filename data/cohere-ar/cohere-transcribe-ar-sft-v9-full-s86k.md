# Cohere-AR/cohere-transcribe-ar-sft-v9-full-s86k

## Resumen

Cohere-transcribe-ar-sft-v9-full-s86k es un modelo de reconocimiento automático del habla (ASR) desarrollado por Cohere-AR, el equipo de Cohere dedicado a la lengua árabe. Se trata de un ajuste fino supervisado (SFT) del modelo base CohereLabs/cohere-transcribe-arabic-07-2026, orientado a transcripción de audio en árabe e inglés, con énfasis explícito en code-switching (alternancia de idiomas dentro de una misma conversación) y en audio telefónico. El checkpoint se publica bajo la librería transformers en formato safetensors y con un total de 2.065.770.752 parámetros.

El modelo resuelve un problema concreto: la transcripción fiable de habla árabe real, que con frecuencia mezcla registros dialectales, términos en inglés y condiciones acústicas degradadas propias de la telefonía. La ficha del repositorio declara compatibilidad con endpoints y una licencia no especificada, y el acceso está restringido (gated), por lo que es necesario aceptar las condiciones en HuggingFace antes de descargar los pesos.

Su relevancia actual radica en la escasez de modelos ASR abiertos con cobertura específica de árabe conversacional y code-switching ar-en, un escenario habitual en atención al cliente, call centers y análisis de reuniones en la región MENA. El tamaño del repo (4,1 GB) y los 2,07 mil millones de parámetros lo sitúan en un rango desplegable en GPU de gama alta consumer con cuantización.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo ASR basado en transformers; arquitectura interna no especificada en la información proporcionada) |
| Parámetros totales | 2.065.770.752 |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | árabe (ar), inglés (en), con code-switching ar-en |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo más allá de su encuadre como modelo de reconocimiento automático del habla implementado en la librería transformers. El checkpoint es un ajuste fino supervisado (SFT) del modelo CohereLabs/cohere-transcribe-arabic-07-2026, según declara la etiqueta `base_model:finetune` del repositorio. El nombre del checkpoint (`sft-v9-full-s86k`) sugiere una novena iteración de un pipeline de SFT sobre un conjunto de datos de aproximadamente 86 000 muestras, aunque este extremo no está confirmado en la documentación proporcionada.

No se especifican el número de tokens de audio utilizados, la composición del dataset, ni si hubo etapas de RLHF o DPO. Tampoco se documentan innovaciones técnicas como decodificación especulativa, atención lineal o mecanismos de streaming. Cualquier afirmación adicional sobre el proceso de entrenamiento sería especulativa y no se incluye en esta ficha.

## Capacidades

- Reconocimiento automático del habla (ASR) en árabe e inglés.
- Transcripción con code-switching ar-en: manejo de enunciados que alternan árabe e inglés dentro de una misma frase o conversación.
- Orientación a audio telefónico, según la etiqueta `telephony` del repositorio, lo que implica robustez esperada frente a ancho de banda limitado y ruido de canal.
- Integración con la librería transformers y compatibilidad declarada con endpoints (`endpoints_compatible`), lo que facilita su despliegue como servicio de inferencia.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, visión, audio generation ni modo thinking; se trata de un modelo especializado en transcripción.

## Casos de uso

- Transcripción de llamadas en call centers: el modelo está etiquetado para telefonía y code-switching, por lo que puede transcribir conversaciones de atención al cliente donde el agente habla árabe y el cliente intercala términos en inglés (nombres de producto, cifras, terminología técnica).
- Análisis de calidad y compliance en centros de contacto: generar transcripciones para auditoría posterior, detección de palabras clave y scoring de conversaciones, aprovechando la cobertura ar-en sin necesidad de pipelines separados por idioma.
- Subtitulado y documentación de reuniones en entornos MENA: transcripción de reuniones internas donde los participantes alternan árabe e inglés de forma natural.
- Generación de datasets etiquetados para ASR: uso del modelo como anotador automático de audio árabe para construir corpus de entrenamiento de otros sistemas, dado su ajuste específico al dominio.
- Asistentes de voz y dictado en aplicaciones empresariales: integración vía transformers o endpoint para convertir voz a texto en flujos de trabajo internos con usuarios arabófonos.
- Búsqueda y recuperación sobre archivos de audio: transcripción masiva de grabaciones para indexación y búsqueda semántica posterior, gracias a la salida de texto alineada con el audio de entrada.
- Moderación y análisis de contenido en plataformas: transcripción de audio subido por usuarios para su revisión automatizada en árabe e inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 4,1 GB solo para pesos, más overhead de activaciones y decodificación; en la práctica se recomienda un mínimo de 8-10 GB de VRAM para audio de duración moderada.
- VRAM estimada en cuantización de 8 bits: en torno a 2-3 GB de pesos, con margen adicional para buffers.
- GPU recomendadas: A100, H100, L40S o RTX 4090 para despliegues de producción con concurrencia; RTX 3090/4080 como alternativas de gama alta consumer.
- Compatibilidad con GPU consumer: sí, previsiblemente en RTX 4090, RTX 4080, RTX 3090 y modelos con 12 GB o más de VRAM; en 8 GB puede requerir cuantización y lotes pequeños.
- Opciones de despliegue: transformers (nativo), endpoints compatibles según la etiqueta del repositorio; no se confirma soporte de vLLM, llama.cpp, Ollama ni TGI en la información proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cohere-AR/cohere-transcribe-ar-sft-v9-full-s86k | 2,07 B | ar, en (code-switching) | no disponible | no disponible | gated en HuggingFace |
| CohereLabs/cohere-transcribe-arabic-07-2026 (modelo base) | no disponible | ar (y posiblemente en) | no disponible | no disponible | referenciado como base |
| Whisper large-v3 (OpenAI) | ~1,55 B | multilingüe (99 idiomas) | 30 s de audio por ventana | MIT | abierto en HuggingFace |
| MMS / wav2vec2 árabe (Meta) | variable según checkpoint | multilingüe / ar | no aplica (modelos acústicos) | variable | abierto en HuggingFace |

La comparación con Whisper large-v3 es la más directa por tamaño y propósito general, aunque Whisper no está especializado en code-switching ar-en ni en telefonía. No se dispone de métricas comparativas de WER en la información proporcionada.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en HuggingFace antes de descargar los pesos; esto puede bloquear pipelines automatizados de CI/CD.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; es imprescindible verificar las condiciones del gate antes de integrarlo en producción.
- Idiomas limitados a árabe e inglés: no se declara soporte de otros idiomas, por lo que no es adecuado para escenarios multilingües amplios.
- Sin datos de benchmarks: no hay métricas publicadas de WER, latencia ni robustez, lo que impide evaluar su calidad objetiva frente a alternativas.
- Riesgo de alucinación en transcripción: como todo modelo ASR generativo, puede producir texto plausible no presente en el audio, especialmente en segmentos ruidosos o con solapamiento de hablantes.
- Sesgos potenciales: el ajuste fino sobre un dataset específico (s86k) puede introducir sesgos hacia determinados dialectos árabes, registros o condiciones acústicas presentes en los datos de entrenamiento; no se documenta la composición del corpus.
- Contexto de audio no especificado: se desconoce la duración máxima de audio procesable por ventana, lo que complica el diseño de pipelines para grabaciones largas.
- Sin información sobre cuantizaciones publicadas: no hay variantes GGUF ni AWQ oficiales, lo que limita el despliegue en entornos con poca VRAM sin trabajo adicional de conversión.

## Enlaces

- HuggingFace: https://huggingface.co/Cohere-AR/cohere-transcribe-ar-sft-v9-full-s86k
- Modelo base: https://huggingface.co/CohereLabs/cohere-transcribe-arabic-07-2026
- No se han encontrado en la información proporcionada papers, blogs, repositorios de código ni demos adicionales.
