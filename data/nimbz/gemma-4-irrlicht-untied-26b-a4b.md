# Nimbz/Gemma-4-Irrlicht-Untied-26B-A4B

## Resumen

Gemma-4-Irrlicht-Untied-26B-A4B es un modelo de lenguaje de tipo mezcla de expertos (MoE) publicado por el usuario Nimbz en Hugging Face. No se trata de un modelo entrenado desde cero, sino de un *merge* (fusión de pesos) construido a partir de cuatro modelos derivados de la familia Gemma 4: `google/gemma-4-26B-A4B-it`, `zerofata/G4-MeroMero-26B-A4B`, `SubMaroon/Kitchoon-V2-26B-A4B` y `SubMaroon/Gemma-4-26B-A4B-StyleTune-QK-Heretic`. Su propósito declarado es el roleplay, la escritura creativa, la narración y la conversación con角色, con un sesgo explícito hacia baja tasa de rechazos (*low-refusal*) y contenido para adultos.

El modelo cuenta con 26.544.133.710 parámetros totales según los pesos en safetensors y un tamaño de repositorio de 53,1 GB, lo que es coherente con pesos en precisión de 16 bits. La nomenclatura "A4B" sugiere una arquitectura MoE con aproximadamente 4 mil millones de parámetros activos por token, aunque el autor no documenta esta cifra de forma explícita en la información disponible. Una de las particularidades técnicas es la modificación del `lm_head` (cabeza de lenguaje) para desacoplarla de la matriz de embeddings (*untied lm_head*), junto con un ajuste fino específico de esa capa.

La relevancia de esta ficha es doble: por un lado, documenta un caso típico de la escena de modelos comunitarios orientados a roleplay, donde se prioriza el estilo y la libertad creativa sobre la seguridad alineada; por otro, sirve de ejemplo de las implicaciones prácticas (licencia, sesgos, riesgos) que conlleva desplegar un modelo de este tipo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (familia Gemma 4), con `lm_head` desacoplada (*untied*) |
| Parametros totales | 26.544.133.710 |
| Parametros activos | no disponible (la nomenclatura "A4B" sugiere ~4B activos, sin confirmación del autor) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors; no se listan GGUF ni otras variantes) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un *merge* de pesos, no un entrenamiento desde cero. Combina cuatro checkpoints: el modelo instructivo oficial `google/gemma-4-26B-A4B-it`, `zerofata/G4-MeroMero-26B-A4B`, `SubMaroon/Kitchoon-V2-26B-A4B` y `SubMaroon/Gemma-4-26B-A4B-StyleTune-QK-Heretic`. La base arquitectónica es la de Gemma 4 en configuración MoE de 26B totales, con atención por query-key (los nombres de los checkpoints intermedios incluyen "QK") y una innovación concreta: la cabeza de lenguaje (`lm_head`) está desacoplada de la matriz de embeddings y ha recibido un ajuste fino propio (*lm_head-tuning*), lo que permite especializar la distribución de salida sin alterar el resto de la red.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF o DPO en los checkpoints de origen. Tampoco se documentan técnicas de decodificación especulativa ni mecanismos de atención lineal. El autor no publica detalles del proceso de fusión (ratios, método de interpolación de pesos, capas afectadas), por lo que la reproducibilidad del merge es limitada.

## Capacidades

- Generación de texto conversacional y narrativo orientado a roleplay y ficción.
- Interpretación de personajes (*character-rp*) con consistencia de voz y estilo.
- Escritura creativa y *storytelling* de formato largo.
- Conversación multi-turno con tono literario.
- Baja tasa de rechazos (*low-refusal*), incluida la generación de contenido para adultos (NSFW).
- Capacidad multilingüe: no documentada; los idiomas no están listados en la model card.
- Soporte de *tool calling* / *function calling*: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Modo de razonamiento explícito (*thinking*): no documentado.
- Visión o audio: no documentado.

## Casos de uso

- Roleplay conversacional de personajes: el modelo está fusionado específicamente para mantener voces de personaje estables y un registro literario, lo que lo hace adecuado para aplicaciones de chat con personalidad definida.
- Escritura de ficción asistida: útil para generar borradores de relatos, diálogos y descripciones con un estilo narrativo marcado, gracias a la combinación de checkpoints orientados a *storytelling*.
- Plataformas de entretenimiento para adultos: su naturaleza *low-refusal* y NSFW permite construir experiencias de ficción interactiva sin los rechazos típicos de los modelos alineados.
- Prototipado de narrativa interactiva y videojuegos: puede generar ramificaciones de guion y respuestas de PNJ con coherencia de personaje en sesiones largas, aunque la longitud de contexto no está documentada.
- Investigación sobre alineación y comportamiento de modelos comunitarios: sirve como caso de estudio de cómo el *merging* y el ajuste de la `lm_head` alteran la distribución de salida y la tasa de rechazos.
- Generación de contenido creativo en pipelines editoriales: borradores de diálogo, sinopsis y material promocional de ficción, con revisión humana obligatoria por el riesgo de alucinación y sesgos.
- Fine-tuning posterior especializado: al estar en safetensors y con licencia Apache 2.0, puede servir de base para ajustes adicionales en dominios narrativos concretos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 26,5B parámetros, en FP16 se necesitan aproximadamente 53 GB solo para pesos, más overhead de KV cache; en cuantización de 8 bits, en torno a 27-30 GB; en 4 bits, alrededor de 15-17 GB (estimaciones teóricas, no verificadas por el autor).
- GPU recomendadas para FP16: A100 80 GB, H100 80 GB o múltiples GPU de 24-48 GB con *tensor parallelism*.
- GPU consumer: en cuantización de 4 bits podría caber en una RTX 4090 (24 GB) o RTX 3090, siempre que se genere una cuantización GGUF/AWQ, que el repositorio no proporciona actualmente.
- Opciones de despliegue: vLLM, TGI o transformers para safetensors; llama.cpp/Ollama requerirían convertir los pesos a GGUF, paso no documentado por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Orientacion | Disponibilidad |
|---|---|---|---|---|---|
| Gemma-4-Irrlicht-Untied-26B-A4B | 26,5B (MoE) | no disponible | Apache 2.0 | Roleplay, NSFW, low-refusal | Solo safetensors |
| google/gemma-4-26B-A4B-it | 26B (MoE) | no disponible | Gemma license | Instructivo general, alineado | Pesos oficiales |
| zerofata/G4-MeroMero-26B-A4B | 26B (MoE) | no disponible | no disponible | Roleplay/estilo | Safetensors |
| SubMaroon/Kitchoon-V2-26B-A4B | 26B (MoE) | no disponible | no disponible | Roleplay/estilo | Safetensors |

La comparación con modelos de otras familias (por ejemplo, Mistral o Llama en tamaños equivalentes) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Modelo marcado como `not-for-all-audiences`: genera contenido NSFW y de baja tasa de rechazo, inadecuado para aplicaciones dirigidas a menores o de uso público sin filtrado.
- Riesgo elevado de alucinación en datos factuales: el ajuste está orientado a estilo y ficción, no a precisión.
- Sesgos conocidos: no documentados por el autor; los merges de modelos de roleplay suelen heredar sesgos de estilo y de representación de los checkpoints de origen.
- Idiomas soportados no documentados: no hay garantía de calidad multilingüe más allá del inglés.
- Longitud de contexto no documentada: no se puede planificar su uso en conversaciones largas sin pruebas empíricas.
- Licencia Apache 2.0 declarada, pero los modelos base de Google Gemma pueden imponer términos adicionales; conviene verificar la compatibilidad antes de uso comercial.
- Sin benchmarks ni evaluación publicada: no hay evidencia objetiva de rendimiento frente a alternativas.
- Cero descargas y cero *likes* en el momento de la ficha: modelo sin validación comunitaria.
- El repositorio solo ofrece safetensors; no hay GGUF ni cuantizaciones listas, lo que complica el despliegue en hardware consumer.

## Enlaces

- Hugging Face: https://huggingface.co/Nimbz/Gemma-4-Irrlicht-Untied-26B-A4B
- Modelo base oficial: https://huggingface.co/google/gemma-4-26B-A4B-it
- Checkpoint de origen: https://huggingface.co/zerofata/G4-MeroMero-26B-A4B
- Checkpoint de origen: https://huggingface.co/SubMaroon/Kitchoon-V2-26B-A4B
- Checkpoint de origen: https://huggingface.co/SubMaroon/Gemma-4-26B-A4B-StyleTune-QK-Heretic
