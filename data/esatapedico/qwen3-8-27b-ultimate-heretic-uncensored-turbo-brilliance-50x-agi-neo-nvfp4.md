# esatapedico/Qwen3.8-27B-Ultimate-Heretic-Uncensored-Turbo-Brilliance-50x-AGI-NEO-NVFP4

## Resumen

El modelo `esatapedico/Qwen3.8-27B-Ultimate-Heretic-Uncensored-Turbo-Brilliance-50x-AGI-NEO-NVFP4` es un checkpoint cuantizado en formato NVFP4 de un ajuste fine-tune de la familia Qwen 3.8 de 27B. No se trata de un modelo entrenado desde cero, sino de una conversión numérica del tune de DavidAU `Qwen3.8-27B-Ultimate-Heretic-Uncensored`, que a su vez parte de la arquitectura híbrida densa de 27B atribuida al equipo Qwen de Alibaba. El resultado es un artefacto de 27.781.427.952 parámetros totales (28.55 GB de pesos) empaquetado en dos shards de safetensors.

La relevancia de esta ficha radica en que el checkpoint aplica una receta de cuantización NVFP4 (W4A16, escalas FP8 E4M3, group size 16, sin calibración) sobre 256 tensores Linear: las MLP de las 64 capas y las proyecciones Q, K, V y O de las 16 capas de atención completa. El resto de componentes (ruta DeltaNet, torre de visión, cabeza MTP, `lm_head`, embeddings y normas) permanece en BF16. Está pensado para GPUs Blackwell (sm_120) y para servir mediante llama.cpp con soporte de NVFP4 (GGML type 40).

El modelo conserva la arquitectura híbrida del original, con atención completa y una ruta DeltaNet, además de una cabeza MTP (multi-token prediction) que habilita decodificación especulativa. Su orientación es la generación de texto conversacional sin filtros de alineación ("uncensored"/"heretic"), lo que condiciona tanto sus capacidades como sus riesgos de uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido denso (atención completa + ruta DeltaNet) con cabeza MTP; arquitectura `qwen3_5` en transformers |
| Parámetros totales | 27.781.427.952 (27,78 B) |
| Parámetros activos | No es MoE; no aplica |
| Longitud de contexto | No disponible |
| Tipos de cuantización | NVFP4 (W4A16, FP8 E4M3 scales, group size 16, weight only, datafree); existe un checkpoint complementario W4A16 de 400 tensores |
| Idiomas soportados | Inglés y multilingüe (según tags) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (2 shards, `compressed-tensors` `nvfp4-pack-quantized`); convertible a GGUF |

## Arquitectura y entrenamiento

El modelo base es un transformer híbrido denso de 27B con 64 capas, de las cuales 16 emplean atención completa y el resto una ruta DeltaNet (atención lineal de estado recurrente). Incorpora una cabeza MTP (multi-token prediction) de 15 tensores que permite decodificación especulativa, y una torre de visión que lo habilita como modelo image-text-to-text. Esta ficha corresponde exclusivamente a la conversión numérica: no se ha entrenado ni ajustado nada, sino que se ha cuantizado el release BF16 de DavidAU con una receta NVFP4A16 datafree, ejecutada en CPU y sin corpus de calibración. Los 256 tensores NVFP4 se verificaron intactos al guardar, y los 15 tensores MTP se restauraron a BF16 con verificación de identidad bit a bit frente al original.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si el tune original aplicó RLHF o DPO. El autor del checkpoint indica que el trabajo cubre solo la conversión numérica y atribuye el modelo base a Alibaba/Qwen y el tune a DavidAU. La innovación técnica destacable es el empaquetado NVFP4 con escalas FP8 E4M3 y group size 16, orientado a GPUs Blackwell, junto con la preservación de la ruta DeltaNet y la cabeza MTP en BF16 para no degradar la decodificación especulativa.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y otros idiomas.
- Razonamiento y generación de código, heredados del modelo Qwen 3.8 de 27B subyacente.
- Procesamiento de imagen y texto (pipeline `image-text-to-text`) gracias a la torre de visión conservada en BF16.
- Decodificación especulativa mediante la cabeza MTP, que acelera la generación en entornos compatibles.
- Respuestas sin filtros de alineación ("uncensored"/"heretic"), lo que amplía el rango de temas tratados pero elimina salvaguardas.
- Compatibilidad con endpoints y con llama.cpp mediante conversión a GGUF.
- Soporte multilingüe declarado en los tags, aunque el idioma principal documentado es el inglés.
- No se documenta soporte explícito de tool calling ni de flujos de agentes multi-paso en la información disponible.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar el comportamiento de un tune sin filtros frente a su base alineada, comparando respuestas en dominios sensibles dentro de un entorno controlado.
- Generación creativa sin restricciones: escritura de ficción, guiones o narrativa que requiera abordar temas que los modelos alineados rechazan, con la ventaja de un contexto conversacional multi-turno.
- Evaluación de cuantización NVFP4: sirve como banco de pruebas para medir la pérdida de calidad de una receta W4A16 datafree frente al BF16 original en tareas de razonamiento y código.
- Despliegue en GPUs Blackwell: al estar empaquetado para sm_120, es adecuado para probar el rendimiento de NVFP4 en inferencia local con llama.cpp y comparar throughput frente a BF16.
- Procesamiento de documentos con imagen: la torre de visión en BF16 permite tareas de image-text-to-text, como descripción de capturas o extracción de información de figuras.
- Prototipado de decodificación especulativa: la cabeza MTP conservada permite experimentar con técnicas de aceleración de inferencia en pipelines de investigación.
- Generación de código en entornos internos: puede integrarse en asistentes de programación autoalojados, aunque sin garantías de tool calling documentado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan 28.55 GB en safetensors; en la práctica se necesita algo más para el KV cache y activaciones, por lo que se recomienda un mínimo de 32 GB de VRAM.
- GPU recomendadas: GPUs Blackwell (sm_120) para aprovechar NVFP4 de forma nativa; el checkpoint está diseñado específicamente para esta generación.
- Cabe en consumer GPU: no en tarjetas de 24 GB (RTX 4090) sin recurrir a la versión GGUF y offloading; sí en GPUs profesionales de 32 GB o más.
- Opciones de despliegue: llama.cpp con soporte NVFP4 (GGML type 40) mediante `convert_hf_to_gguf.py --outtype auto`; también transformers con `compressed-tensors`. No se documenta soporte de vLLM ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (NVFP4) | 27,78 B | No disponible | NVFP4 W4A16 | Apache 2.0 | Hugging Face |
| DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored (BF16) | 27 B | No disponible | BF16 | Apache 2.0 | Hugging Face |
| DavidAU/...-AGI-NEO-GGUF | 27 B | No disponible | GGUF (varias) | Apache 2.0 | Hugging Face |
| esatapedico/...-W4A16-T400 | 27,78 B | No disponible | W4A16 (400 tensores) | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El tune es explícitamente "uncensored"/"heretic": carece de salvaguardas de alineación, por lo que puede generar contenido dañino, ilegal o sesgado sin rechazo.
- Riesgo elevado de alucinación, agravado por la ausencia de filtros y por la falta de benchmarks publicados que permitan calibrar su fiabilidad.
- La cuantización NVFP4 datafree, sin corpus de calibración, puede degradar la calidad en tareas sensibles a la precisión numérica; no se han publicado evaluaciones que lo cuantifiquen.
- La longitud de contexto no está documentada, lo que impide planificar cargas con ventanas largas.
- El soporte idiomático está declarado de forma genérica ("multilingual") sin evaluación por idioma; el castellano no está verificado.
- Requiere hardware Blackwell para aprovechar el formato NVFP4; en GPUs anteriores el rendimiento puede no ser óptimo o requerir conversión a GGUF.
- Aunque la licencia es Apache 2.0, el uso comercial de un modelo sin alineación conlleva riesgos reputacionales y legales que deben evaluarse por separado.
- No se documenta soporte de tool calling ni de agentes, por lo que no debe asumirse en pipelines de producción.

## Enlaces

- Hugging Face del checkpoint: https://huggingface.co/esatapedico/Qwen3.8-27B-Ultimate-Heretic-Uncensored-Turbo-Brilliance-50x-AGI-NEO-NVFP4
- Modelo base (tune de DavidAU): https://huggingface.co/DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored
- Versión GGUF del tune: https://huggingface.co/DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored-Turbo-Brilliance-50x-AGI-NEO-GGUF
- Checkpoint complementario W4A16 T400: https://huggingface.co/esatapedico/Qwen3.8-27B-Ultimate-Heretic-Uncensored-Turbo-Brilliance-50x-AGI-NEO-NVFP4-W4A16-T400
- Sitio del autor de la conversión: https://www.esatapedico.com
