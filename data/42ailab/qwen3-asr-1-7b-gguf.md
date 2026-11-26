# 42ailab/Qwen3-ASR-1.7B-GGUF

## Resumen

Qwen3-ASR-1.7B es un modelo de reconocimiento automático del habla (ASR) desarrollado por el equipo Qwen de Alibaba, publicado bajo licencia Apache-2.0. Esta ficha concreta, `42ailab/Qwen3-ASR-1.7B-GGUF`, no es una conversión propia: reproduce byte a byte los ficheros GGUF generados por ggml-org y los empaqueta para su descarga desde la aplicación 42model. El modelo convierte grabaciones de audio en texto y se sitúa en el tramo de 1.700 millones de parámetros, por encima de la variante de 0,6B de la misma familia.

El repositorio contiene dos ficheros en cuantización Q8_0: los pesos del modelo (2,02 GiB) y un proyector de audio `mmproj` (339,2 MiB), ambos con digest sha256 fijado para garantizar la reproducibilidad de la descarga. El recuento de parámetros reportado en safetensors es de 2.031.739.904, ligeramente superior a la denominación comercial "1.7B".

Su relevancia práctica radica en que ofrece una alternativa de ASR ejecutable localmente en formato GGUF (compatible con el ecosistema llama.cpp), con licencia permisiva para uso comercial y un tamaño que permite despliegue en hardware de consumo. La información pública disponible sobre arquitectura interna, datos de entrenamiento y benchmarks es escasa en la model card.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de reconocimiento de voz con proyector de audio multimodal) |
| Parámetros totales | 2.031.739.904 |
| Parámetros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q8_0 (única publicada en este repositorio) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (Qwen3-ASR-1.7B-Q8_0.gguf y mmproj-Qwen3-ASR-1.7B-Q8_0.gguf) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna del modelo. Por la estructura de los ficheros publicados (pesos principales más un `mmproj` separado) se trata de un modelo multimodal que combina un codificador de audio con un decodificador de texto, empaquetado en el formato GGUF de llama.cpp. El autor del repositorio no aporta información sobre el número de tokens de entrenamiento, la composición del corpus, ni si se aplicaron técnicas de alineación como RLHF o DPO.

La innovación técnica relevante en este repositorio no está en el modelo sino en el empaquetado: los ficheros son idénticos byte a byte a los de `ggml-org/Qwen3-ASR-1.7B-GGUF`, con digests sha256 publicados (`58e22d05...` para los pesos y `46c1d533...` para el proyector) que permiten verificar la integridad y la procedencia incluso si el repositorio original cambia o desaparece.

## Capacidades

- Reconocimiento automático del habla: transcripción de audio a texto (pipeline `automatic-speech-recognition`).
- Procesamiento multimodal audio-texto mediante el proyector `mmproj` incluido.
- Inferencia local en el ecosistema GGUF/llama.cpp.
- Compatibilidad declarada con endpoints (`endpoints_compatible` en los tags del repositorio).
- Naturaleza conversacional según el tag `conversational`.
- Soporte de tool calling: no disponible en la información proporcionada.
- Capacidades de agente o razonamiento multi-paso: no disponible.
- Cobertura multilingüe: no disponible (los idiomas no están listados).
- Modo thinking, visión o audio adicional más allá del ASR: no disponible.

## Casos de uso

- Transcripción de reuniones y notas de voz: el modelo convierte grabaciones en texto ejecutándose en local, lo que evita enviar audio confidencial a servicios en la nube; su tamaño de 1,7B permite correrlo en una estación de trabajo sin GPU dedicada de gama alta.
- Subtitulado de vídeo y podcasts: integrado en un pipeline de procesado por lotes con llama.cpp, puede generar transcripciones previas a la fase de traducción o corrección editorial.
- Dictado en aplicaciones de escritorio: la distribución vía 42model con descarga en un clic facilita incorporar ASR a herramientas de productividad sin depender de APIs externas.
- Archivado y búsqueda de audio corporativo: transcribir llamadas o grabaciones internas para indexarlas y hacerlas consultables, aprovechando la licencia Apache-2.0 para uso comercial sin restricciones de atribución más allá de la licencia.
- Accesibilidad: generación de subtítulos automáticos para contenido formativo o institucional, con la ventaja de que el modelo puede desplegarse on-premise en entornos con requisitos de protección de datos.
- Prototipado e investigación en ASR: al estar en GGUF y ser verificable por hash, sirve como base reproducible para experimentos de comparación de cuantizaciones o de integración con codificadores de audio propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en Q8_0: aproximadamente 2,4 GiB en total (2,02 GiB de pesos más 339,2 MiB del proyector de audio), más el overhead de contexto y del runtime de llama.cpp.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para Q8_0; tarjetas como RTX 3060, RTX 4060, RTX 4090, A100 o H100 ofrecen margen sobrado.
- Cabe en GPU de consumo: sí, en la práctica totalidad de tarjetas discretas modernas con 4 GB o más; también es viable en CPU.
- Opciones de despliegue: llama.cpp y derivados compatibles con GGUF (Ollama, servidores compatibles con endpoints); el repositorio declara compatibilidad con endpoints. vLLM y TGI no están confirmados para este formato en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-ASR-1.7B (esta ficha) | 2.031.739.904 | no disponible | GGUF Q8_0 | Apache-2.0 | Hugging Face, ModelScope, 42model |
| Qwen3-ASR-0.6B | no disponible en la información | no disponible | no disponible | Apache-2.0 (según la familia) | Repositorio upstream de Qwen |
| Whisper (variantes de tamaño medio) | no disponible en la información | no disponible | múltiples | MIT (según versión) | Hugging Face, ecosistema amplio |

La comparación cuantitativa con alternativas no está disponible: la model card no incluye métricas de precisión (WER) ni comparaciones con Whisper u otros sistemas ASR.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos, tasas de alucinación ni comportamiento en acentos o dominios específicos.
- No se especifican los idiomas soportados, lo que impide garantizar calidad en castellano u otras lenguas sin evaluación previa.
- Solo se publica cuantización Q8_0; no hay versiones Q4, Q5 o FP16 en este repositorio, lo que limita el ajuste fino de memoria.
- El modelo no ha sido entrenado ni modificado por 42ailab: cualquier problema de calidad es responsabilidad del modelo upstream de Qwen.
- La licencia Apache-2.0 permite uso comercial, pero conviene revisar el fichero LICENSE del repositorio, ya que la model card advierte de que el repositorio oficial de Qwen no incluye un fichero LICENSE separado.
- El rendimiento en producción (latencia, precisión en audio ruidoso, manejo de audio largo) no está documentado y requiere evaluación propia.
- La fecha de creación del repositorio (2026-11-08) y el reducido número de descargas (238) indican una distribución reciente y poco validada por la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/42ailab/Qwen3-ASR-1.7B-GGUF
- Repositorio en ModelScope: https://modelscope.cn/models/42ailab/Qwen3-ASR-1.7B-GGUF
- Repositorio original de la conversión GGUF: https://www.modelscope.cn/models/ggml-org/Qwen3-ASR-1.7B-GGUF
- Sitio de 42model: https://42model.com
- Sitio de 42ailab: https://42ailab.com
- Repositorio oficial de Qwen3-ASR en GitHub: https://github.com/QwenLM/Qwen3-ASR
