# NbAiLab/nordlyd-asr-qwen06B-nov26preview

## Resumen

Nordlyd ASR Qwen 0.6B (nov26preview) es un modelo de reconocimiento automatico del habla (ASR) desarrollado por el grupo NbAiLab (Nasjonalbiblioteket, la Biblioteca Nacional de Noruega). Se trata de un ajuste fino del modelo NbAiLab/Qwen3-ASR-0.6B-custom-tokenizer, que a su vez parte de la familia Qwen3-ASR, y esta especializado en transcripcion de noruego bokmal (nb), noruego nynorsk (nn) e ingles (en), con soporte explicito para code-switching entre estos idiomas.

El modelo resuelve el problema de la transcripcion multilingue en contextos nordicos, donde es habitual alternar entre noruego e ingles en una misma intervencion oral. Al estar construido sobre una base de 0,6B de parametros (782.426.112 reales segun los pesos en safetensors), esta disenado para despliegues con requisitos de hardware moderados, lo que lo hace apto para inferencia en GPU de consumo y en entornos de produccion con latencia ajustada.

Es relevante ahora porque representa un esfuerzo institucional por cubrir lenguas de bajos recursos como el noruego con modelos abiertos y licencia Apache 2.0, y porque la etiqueta `region:eu` y la compatibilidad con endpoints sugieren un enfoque orientado a soberania digital europea. El acceso es restringido (gated): requiere aceptar condiciones en Hugging Face antes de descargar los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-ASR (transformer encoder-decoder para reconocimiento del habla), segun el tag `qwen3_asr` |
| Parametros totales | 782.426.112 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | nb (noruego bokmal), nn (noruego nynorsk), en (ingles); soporte de code-switching |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 1,6 GB |
| Modelo base | NbAiLab/Qwen3-ASR-0.6B-custom-tokenizer (finetune) |
| Libreria | transformers |
| Pipeline | automatic-speech-recognition |
| Acceso | restringido (gated) |

## Arquitectura y entrenamiento

La informacion disponible indica que el modelo se basa en la arquitectura Qwen3-ASR, una familia de modelos de reconocimiento del habla de tipo transformer, y que ha sido ajustado a partir de NbAiLab/Qwen3-ASR-0.6B-custom-tokenizer. Este modelo base incorpora un tokenizer personalizado, presumiblemente adaptado al vocabulario y a las particularidades ortograficas del noruego y del ingles. El ajuste fino de NbAiLab se orienta a las variantes nb y nn y al fenomeno del code-switching, segun los tags del repositorio.

No se dispone de informacion publica en la ficha proporcionada sobre el numero de horas de audio de entrenamiento, la composicion del dataset, el uso de tecnicas de alineacion (RLHF, DPO) ni innovaciones tecnicas especificas como decodificacion especulativa o atencion lineal. El tag `endpoints_compatible` sugiere que el modelo puede servirse a traves de la infraestructura de endpoints de Hugging Face, pero no se detallan los detalles de implementacion.

## Capacidades

- Reconocimiento automatico del habla (transcripcion audio a texto) en noruego bokmal, noruego nynorsk e ingles.
- Soporte de code-switching: manejo de intervenciones que alternan noruego e ingles dentro de una misma locucion, segun el tag `code-switching`.
- Tokenizer personalizado adaptado a los idiomas objetivo, heredado del modelo base NbAiLab/Qwen3-ASR-0.6B-custom-tokenizer.
- Integracion con la libreria `transformers` y con el pipeline `automatic-speech-recognition`.
- Compatibilidad con endpoints de Hugging Face (tag `endpoints_compatible`).
- No se documentan en la informacion disponible capacidades de vision, audio generativo, tool calling, agentes ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Transcripcion de reuniones y actas institucionales en noruego: el modelo puede convertir grabaciones de reuniones en texto para su archivado y busqueda, aprovechando su cobertura de nb y nn, las dos formas escritas oficiales del noruego.
- Subtitulado automatico de contenido audiovisual nordico: adecuado para generar subtitulos en noruego e ingles de videos donde los hablantes alternan idiomas, gracias al soporte de code-switching.
- Atencion al cliente en centros de contacto noruegos: permite transcribir llamadas en tiempo real o diferido para analitica de calidad, con un modelo de 0,6B que reduce costes de inferencia frente a alternativas de mayor tamano.
- Investigacion linguistica y corpus orales: util para proyectos academicos que necesiten transcribir entrevistas o grabaciones de campo en noruego bokmal y nynorsk, con la ventaja de una licencia Apache 2.0 que facilita la redistribucion de resultados.
- Accesibilidad: generacion de transcripciones para personas con discapacidad auditiva en contenidos en noruego e ingles, desplegable en infraestructura propia por el tamano contenido del modelo.
- Procesamiento por lotes de archivos de audio en pipelines de datos: al ser un modelo de 0,6B con pesos safetensors de 1,6 GB, puede ejecutarse en GPU de consumo para transcribir grandes volumenes de audio sin depender de APIs externas.
- Integracion en aplicaciones de notas de voz para dispositivos con recursos limitados: su tamano permite despliegues en estaciones de trabajo con una sola GPU, o incluso en CPU con cuantizacion (aunque no se documentan variantes cuantizadas oficiales).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp32): aproximadamente 3,1 GB solo para pesos (782M parametros x 4 bytes), mas memoria para activaciones y buffers de audio.
- VRAM estimada en fp16/bf16: aproximadamente 1,6 GB para pesos, mas overhead de inferencia; en la practica, se recomienda reservar 3-4 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM, como RTX 3060, RTX 4060, RTX 4090, A100 o H100. El modelo es lo suficientemente pequeno como para no requerir GPU de datacenter.
- Cabe en GPU de consumo: si, en la mayoria de GPU consumer modernas con 6 GB o mas de VRAM.
- Opciones de despliegue: `transformers` (libreria oficial del modelo), endpoints de Hugging Face (tag `endpoints_compatible`). No se documenta soporte oficial para vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Contexto | Acceso |
|---|---|---|---|---|---|
| NbAiLab/nordlyd-asr-qwen06B-nov26preview | 782.426.112 | nb, nn, en | apache-2.0 | no disponible | gated |
| NbAiLab/Qwen3-ASR-0.6B-custom-tokenizer (modelo base) | no disponible (familia 0,6B) | no disponible | no disponible | no disponible | no disponible |
| Whisper large-v3 (OpenAI) | 1.550M | multilingue (99 idiomas) | MIT | 30 s de audio por ventana | abierto |
| Whisper small (OpenAI) | 244M | multilingue | MIT | 30 s de audio por ventana | abierto |

La comparativa con Whisper es orientativa: Whisper es el referente abierto en ASR multilingue, pero no esta especializado en noruego ni en code-switching nb/en. El modelo de NbAiLab ofrece una licencia Apache 2.0 y un enfoque especifico en lenguas nordicas, aunque su acceso restringido y la ausencia de benchmarks publicados limitan la comparacion cuantitativa.

## Limitaciones y advertencias

- Acceso restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargar los pesos, lo que anade friccion a la integracion en pipelines automatizados.
- Ausencia de benchmarks publicados: no hay datos objetivos de WER (word error rate) ni comparaciones con otros modelos, lo que impide evaluar su calidad relativa sin pruebas propias.
- Cobertura limitada a tres idiomas (nb, nn, en): no es adecuado para otras lenguas nordicas como sueco, danes, finlandes o islandes, ni para un uso multilingue general.
- Riesgo de alucinacion en audio con ruido, acentos no estandar o habla solapada: como todo modelo ASR, puede generar transcripciones plausibles pero incorrectas en condiciones adversas.
- Posibles sesgos derivados de los datos de entrenamiento del modelo base y del ajuste fino: no se documenta la composicion del corpus, por lo que no se puede evaluar la representatividad de acentos, edades o registros.
- No se documentan variantes cuantizadas oficiales (GGUF, AWQ, GPTQ), lo que limita el despliegue en CPU o en hardware muy restringido sin trabajo adicional de conversion.
- La licencia Apache 2.0 permite uso comercial, pero al ser un modelo gated conviene revisar los terminos adicionales de acceso en Hugging Face antes de su explotacion en produccion.
- Modelo en version "preview" (nov26preview): puede tratarse de una version no final, sujeta a cambios o retirada.

## Enlaces

- Hugging Face: https://huggingface.co/NbAiLab/nordlyd-asr-qwen06B-nov26preview
- Modelo base: https://huggingface.co/NbAiLab/Qwen3-ASR-0.6B-custom-tokenizer
- Organizacion NbAiLab: https://huggingface.co/NbAiLab
