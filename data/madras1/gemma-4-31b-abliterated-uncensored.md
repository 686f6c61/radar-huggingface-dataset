# Madras1/Gemma-4-31B-Abliterated-Uncensored

## Resumen

Gemma 4 31B Deep Abliterated (Uncensored) es una versión modificada del modelo google/gemma-4-31B-it de Google DeepMind, creada por Madras1. La intervención consiste en una técnica de ingeniería de representaciones llamada "deep abliteration", que elimina de forma permanente la dirección interna de rechazo (refusal) del modelo, con el objetivo de evitar falsos positivos en tareas de escritura creativa madura, ficción oscura y escenarios de red teaming. El modelo conserva la arquitectura base de Gemma 4, con 31.273.086.512 parámetros y una ventana de contexto nativa de 256.000 tokens. Se distribuye bajo licencia Apache 2.0 y está disponible en formato safetensors.

La relevancia de este modelo reside en su enfoque quirúrgico sobre los pesos: en lugar de un simple ajuste de prompts, se aplica una proyección ortogonal dual sobre capas concretas (12 a 51) con un factor alpha de 1,35, lo que, según el autor, neutraliza el rechazo sin degradar la coherencia narrativa ni el razonamiento. Esta técnica es de interés para investigadores en interpretabilidad y seguridad de modelos, así como para desarrolladores que necesitan un modelo de lenguaje con menos restricciones en entornos de ficción o roleplay.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 4, derivada de la línea de investigación Gemini 3) |
| Parámetros totales | 31.273.086.512 |
| Parámetros activos | no disponible |
| Longitud de contexto | 256.000 tokens (contexto nativo) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | portugués, inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-31B-it, un modelo de lenguaje instructivo de Google DeepMind. Según la documentación del autor, la arquitectura sigue la línea de investigación de Gemini 3 e incluye un backbone multimodal, aunque el repositorio solo declara soporte de texto. La intervención de abliteración se realiza mediante "deep latent surgery", una variante de la abliteración clásica (Arditi et al., 2024) que opera sobre la dirección de rechazo en el espacio latente.

El proceso consta de dos fases. Primero, se extrae un vector de rechazo comparando activaciones residuales entre instrucciones neutras y estímulos que activan los filtros de seguridad, tomando la diferencia de medias en la capa 39 (la de máxima divergencia). Después, se aplica una doble ortogonalización de pesos sobre las proyecciones o_proj, down_proj y gate_proj en las capas 12 a 51, con un factor alpha de 1,35, para suprimir tanto la emisión residual como la activación no lineal de la dirección de rechazo. El autor no proporciona detalles sobre el dataset de entrenamiento ni sobre procesos de RLHF o DPO; se trata de una modificación de pesos sobre el checkpoint base, no de un fine-tuning convencional.

## Capacidades

- Generación de texto narrativo en portugués e inglés, con verificación cualitativa de sintaxis, coherencia entre múltiples personajes y ritmo narrativo.
- Escritura creativa sin restricciones: el modelo no muestra rechazos en escenas de ficción madura, ficción oscura o romance adulto, según el autor.
- Roleplay sin censura: capacidad de mantener personajes moralmente complejos o antagonistas "en personaje" sin interrupciones morales.
- Razonamiento y comprensión de instrucciones: se espera que conserve las capacidades del modelo base, aunque no hay benchmarks publicados que lo confirmen.
- Investigación en interpretabilidad: el modelo sirve como caso de estudio para analizar el efecto de la ortogonalización de pesos sobre la dirección de rechazo.
- Soporte de tool calling, agentes o multimodalidad: no se especifica en la documentación del autor; no se dispone de datos para confirmarlo.

## Casos de uso

- Escritura de ficción literaria madura: el modelo puede generar narrativas con detalle visceral y personajes complejos en portugués o inglés, sin falsos positivos de filtros de seguridad.
- Roleplay interactivo sin censura: para juegos de rol o chatbots de personajes, el modelo mantiene la coherencia de personajes oscuros o moralmente ambiguos.
- Investigación en seguridad e interpretabilidad: permite estudiar empíricamente cómo la abliteración afecta a la capacidad de rechazo y al razonamiento en arquitecturas tipo Gemini.
- Red teaming de sistemas de moderación: se puede utilizar para generar contenido sensible de forma controlada y evaluar la eficacia de filtros de contenido.
- Asistencia creativa para autores: el modelo puede proponer tramas, diálogos o descripciones para obras de ficción que requieren explorar temas tabú.
- Generación de contenido para ficción oscura o terror: la ausencia de rechazos permite crear escenas intensas o perturbadoras sin interrupciones morales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks cuantitativos para este modelo abliterado. La model card del autor incluye una tabla con valores del checkpoint base (google/gemma-4-31B-it) y una columna "Abliterated (Target)" marcada como "In evaluation", sin cifras confirmadas. Los datos disponibles son:

| Benchmark | Stock Gemma-4-31B | Abliterated (Target) | Delta |
|---|---|---|---|
| MMLU-Pro | ~68,4 % | en evaluación | ~0 % |
| GPQA | ~51,2 % | en evaluación | ~0 % |
| GSM8K / MATH | ~88,5 % | en evaluación | ~0 % |
| IFEval | ~84,1 % | en evaluación | ~0 % |
| HarmBench / Refusal Rate | ~92 % (en adulto/tabú) | < 1 % | reducción significativa |

Estos valores no están verificados de forma independiente; el autor indica que la validación realizada fue cualitativa.

## Requisitos de hardware

- El checkpoint en safetensors ocupa 62,6 GB. El tamaño es consistente con pesos en bfloat16 para 31.273.086.512 parámetros, pero el tipo de datos no se especifica explícitamente.
- Estimación de VRAM: se necesitan al menos 62 GB de VRAM solo para alojar los pesos en bfloat16, más memoria para activaciones y caché KV. No se dispone de cifras oficiales.
- GPU recomendadas: para cargar el modelo completo en bfloat16 se requiere una GPU con 80 GB de VRAM o más (por ejemplo, A100 80GB o H100 80GB), o varias GPUs en paralelo.
- No se han publicado cuantizaciones (GGUF, AWQ, GPTQ) en el repositorio; por tanto, no se dispone de requisitos para despliegue en GPU de consumo.
- Opciones de despliegue: se recomienda usar Transformers con device_map="auto" y torch_dtype=torch.bfloat16, tal como se muestra en la model card. Para despliegue en producción sería necesario convertir los pesos a formatos compatibles con vLLM o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Madras1/Gemma-4-31B-Abliterated-Uncensored | 31.273.086.512 | 256.000 tokens | Apache 2.0 | HuggingFace (safetensors) | Abliterado con doble proyección ortogonal, alpha 1,35 |
| google/gemma-4-31B-it | 31.273.086.512 | 256.000 tokens | no disponible | HuggingFace (modelo base) | Modelo instructivo con filtros de seguridad activos |
| huihui_ai/gemma-4-abliterated:31b | no disponible | no disponible | no disponible | Ollama | Versión abliterated de Gemma 4 31B según búsqueda web |

No se dispone de benchmarks comparativos entre estos modelos en la información proporcionada. El modelo de huihui_ai aparece en los resultados de búsqueda web, pero no se han encontrado datos técnicos detallados ni resultados de rendimiento.

## Limitaciones y advertencias

- El modelo ha sido modificado para reducir drásticamente la tasa de rechazo en contenido adulto o tabú; esto implica que puede generar contenido dañino, ilegal o inapropiado sin filtros de seguridad.
- No se han publicado evaluaciones de sesgos ni estudios de alucinación específicos para esta versión abliterada.
- La documentación del autor solo cubre idiomas portugués e inglés; no se garantiza el rendimiento en otros idiomas.
- La ventana de contexto nativa es de 256.000 tokens, pero no hay pruebas de que la abliteración preserve la coherencia en contextos muy largos.
- Los benchmarks de la model card son valores del modelo base y del objetivo esperado, no resultados medidos del modelo abliterado; por tanto, el rendimiento real en razonamiento o matemáticas no está verificado.
- La licencia Apache 2.0 permite uso comercial, pero el contenido generado puede incumplir las políticas de uso de plataformas o servicios que lo utilicen.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Madras1/Gemma-4-31B-Abliterated-Uncensored
- Modelo base en HuggingFace: https://huggingface.co/google/gemma-4-31B-it
- Repositorio de abliteración de Gemma 4 (TrevorS): https://github.com/TrevorS/gemma-4-abliteration
- Versión de Gemma 4 abliterated en Ollama (huihui_ai): https://ollama.com/huihui_ai/gemma-4-abliterated:31b
