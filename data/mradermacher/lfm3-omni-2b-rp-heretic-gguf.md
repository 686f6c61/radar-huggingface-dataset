# mradermacher/LFM3-Omni-2B-RP-heretic-GGUF

## Resumen

LFM3-Omni-2B-RP-heretic-GGUF es una cuantizacion estática en formato GGUF del modelo ragraph-ai/LFM3-Omni-2B-RP-heretic, publicada por mradermacher. Se trata de un modelo derivado de la familia LFM3-Omni de Liquid AI, especializado en roleplay y escritura creativa, y sometido a un proceso de "abliteration" (eliminacion de rechazos de seguridad) que el autor etiqueta como "heretic" y "uncensored". El modelo base conserva las capacidades multimodales de LFM3-Omni: procesamiento de texto, vision y audio (habla).

El modelo cuenta con 1.728.801.600 parametros reales (etiquetado comercialmente como "2B") y esta orientado a despliegue en el borde (edge) gracias a su tamano reducido. Esta cuantizado en multiples niveles (desde Q2_K hasta f16, ademas de un proyector multimodal mmproj), lo que permite ejecutarlo en hardware de consumo. La licencia es lfm1.0 (Liquid Foundation Model License), que impone restricciones de uso comercial.

La relevancia de esta ficha radica en que documenta un caso tipico de la comunidad open source: un modelo base de una empresa, fine-tuneado para roleplay sin restricciones y cuantizado para inferencia local. Es importante advertir que el contenido generado puede ser inapropiado y que la licencia original condiciona su uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LFM3-Omni de Liquid AI; transformer multimodal con vision y audio) |
| Parametros totales | 1.728.801.600 |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; mmproj-f16 y mmproj-Q8_0 para el proyector multimodal |
| Idiomas soportados | en (ingles) |
| Licencia | lfm1.0 (Liquid Foundation Model License) |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base. Por la nomenclatura (LFM3-Omni) y las etiquetas del repositorio (vision, audio, speech, omni), se trata de un modelo multimodal de la familia LFM3 de Liquid AI que procesa texto, imagenes y audio. El modelo base indicado es ragraph-ai/LFM3-Omni-2B-RP-heretic, un fine-tune de roleplay sobre LFM3-Omni-2B sometido a abliteration (eliminacion de direcciones de rechazo en el espacio de activaciones). No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF/DPO en el fine-tune de roleplay.

Esta publicacion concreta es una cuantizacion estatica realizada por mradermacher mediante su pipeline de conversion (convert_type: hf, quantize_version: 2). No se han generado cuantizaciones ponderadas/imatrix para este modelo segun la model card. El repositorio incluye el proyector multimodal (mmproj) en dos precisiones, necesario para conservar las capacidades de vision y audio en llama.cpp.

## Capacidades

- Generacion de texto conversacional orientada a roleplay y escritura creativa.
- Procesamiento multimodal: vision (imagenes) y audio/habla, segun las etiquetas del repositorio y la presencia de mmproj.
- Modo "uncensored"/"abliterated": menor tendencia a rechazar peticiones, incluido contenido para adultos (etiqueta not-for-all-audiences).
- Conversacion multi-turno (tag conversational).
- Compatibilidad con endpoints (tag endpoints_compatible) para despliegue como servicio.
- Capacidades de tool calling y agentes: no disponibles en la informacion proporcionada.
- Capacidades multilingues: solo ingles declarado.

## Casos de uso

- Roleplay y narrativa interactiva: el modelo esta fine-tuneado especificamente para mantener personajes y estilo creativo en conversaciones multi-turno, con un sesgo deliberado hacia contenido sin filtros.
- Escritura creativa asistida: generacion de ficcion, dialogos y guiones donde el autor necesita un modelo que no imponga restricciones de contenido editorial.
- Prototipado de experiencias conversacionales en local: su tamano (1,7B parametros, cuantizaciones desde 0,9 GB) permite iterar en un portatil con llama.cpp u Ollama sin depender de la nube.
- Investigacion sobre alineacion y abliteration: util para estudiar como el proceso heretic altera las respuestas de rechazo respecto al modelo base original.
- Demos multimodales en el borde: con el mmproj incluido, se pueden montar prototipos que reciban imagen o audio en dispositivos con recursos limitados.
- Evaluacion de cuantizaciones: el repositorio ofrece 12 niveles de cuantizacion, lo que permite medir el impacto de la compresion en la calidad de la generacion creativa.
- Filtrado y moderacion de contenido: como caso de uso defensivo, sirve para generar ejemplos de contenido inapropiado y entrenar clasificadores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: desde ~1 GB para Q2_K (0,9 GB de pesos) hasta ~2 GB para Q8_0 (1,9 GB); f16 requiere ~3,6 GB. Sumar ~0,6-1,0 GB si se usa el proyector multimodal.
- Cabe en GPU de consumo: si, en cualquier GPU con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.). Tambien puede ejecutarse en CPU.
- GPU recomendadas para mayor throughput: RTX 4090, RTX 3090 o A100/H100 para servir muchas peticiones concurrentes, aunque el modelo es pequeno y no las necesita para uso individual.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF; el tag endpoints_compatible sugiere soporte en plataformas de inferencia gestionada.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-Omni-2B-RP-heretic-GGUF (este) | 1,73B | no disponible | si (vision, audio) | lfm1.0 | GGUF en HF |
| LFM3-Omni-2B (base, Liquid AI) | ~2B | no disponible | si | lfm1.0 | no disponible en la informacion |
| Otros fine-tunes RP de ~2B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Contenido sin filtrar: el proceso heretic/abliterated elimina los rechazos de seguridad, por lo que puede generar contenido ofensivo, sexual o danino. La etiqueta not-for-all-audiences lo confirma.
- Riesgo elevado de alucinacion: al ser un modelo de 1,7B parametros fine-tuneado para creatividad, la fidelidad factual es baja.
- Solo ingles: no hay soporte multilingue declarado.
- Licencia lfm1.0: impone condiciones al uso comercial; es necesario revisar el texto de la licencia antes de desplegar en produccion.
- Longitud de contexto desconocida: no se puede garantizar el comportamiento en conversaciones muy largas.
- Cuantizaciones bajas (Q2_K, Q3_K_S): pueden degradar notablemente la coherencia; se recomienda Q4_K_M o superior para uso real.
- El modelo no es adecuado para tareas de codigo, matematicas o razonamiento verificable segun la informacion disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/LFM3-Omni-2B-RP-heretic-GGUF
- Modelo base: https://huggingface.co/ragraph-ai/LFM3-Omni-2B-RP-heretic
- Pagina de resumen del cuantizador: https://hf.tst.eu/model#LFM3-Omni-2B-RP-heretic-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Grafico de calidad de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
