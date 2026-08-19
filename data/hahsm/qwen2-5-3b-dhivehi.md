# hahsm/qwen2.5-3b-dhivehi

## Resumen

El modelo `hahsm/qwen2.5-3b-dhivehi` es un ajuste fino (fine-tune) del modelo base Qwen2.5-3B, desarrollado por Alibaba Cloud, especializado en el idioma dhivehi, la lengua oficial de Maldivas. El autor, hahsm, ha publicado este modelo en Hugging Face con el objetivo de adaptar las capacidades multilingües del modelo base a una lengua de bajos recursos, lo que permite tareas de generación y comprensión de texto en dhivehi. Aunque la model card es genérica y no proporciona detalles específicos del entrenamiento, el nombre del repositorio y el tamaño de los pesos (7,9 GB) sugieren que se trata de un fine-tune completo del modelo de 3 mil millones de parámetros, probablemente en precisión fp16 o bf16.

La relevancia de este modelo radica en la escasez de recursos lingüísticos para el dhivehi en el ecosistema de modelos abiertos. Al partir de Qwen2.5-3B, que ya soporta múltiples idiomas y tiene una ventana de contexto de hasta 128K tokens, este fine-tune busca mejorar el rendimiento en tareas específicas de dhivehi, como traducción, generación de texto o asistentes conversacionales. Sin embargo, al no existir documentación técnica detallada, su uso en producción requiere una evaluación previa rigurosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen2.5-3B) |
| Parametros totales | 3 000 millones (aprox., heredado del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128K tokens (capacidad del modelo base; no confirmado para el fine-tune) |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors, probablemente fp16/bf16) |
| Idiomas soportados | dhivehi (objetivo del fine-tune); el modelo base soporta multilingüe |
| Licencia | no disponible |
| Formato de pesos | safetensors (según tags y tamaño del repo) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-3B, un transformer decoder-only con atención causal, normalización RMSNorm, y activación SwiGLU. El modelo base fue preentrenado con hasta 18 billones de tokens en un corpus multilingüe, incluyendo datos en más de 29 idiomas. El fine-tune para dhivehi probablemente consistió en un ajuste supervisado con datos específicos de ese idioma, aunque no se dispone de información sobre el dataset, el número de pasos, la técnica de alineación (RLHF, DPO, etc.) ni los hiperparámetros utilizados. La model card no incluye ninguna de estas especificaciones, por lo que cualquier afirmación sobre el proceso de entrenamiento es especulativa.

## Capacidades

- Generación de texto en dhivehi: el modelo está diseñado para producir texto coherente en este idioma, aunque no se han publicado ejemplos ni evaluaciones.
- Comprensión lectora y respuesta a preguntas en dhivehi: se espera que herede las capacidades de razonamiento del modelo base, adaptadas al idioma.
- Traducción automática: potencialmente útil para pares dhivehi-inglés u otros idiomas, aunque no hay evidencia documentada.
- Soporte de tool calling y function calling: no confirmado; el modelo base Qwen2.5-3B sí lo soporta, pero el fine-tune podría haberlo alterado.
- Capacidades multilingües: el modelo base es multilingüe, pero el fine-tune podría haber reducido el rendimiento en otros idiomas (catastrophic forgetting).
- No se ha confirmado soporte para agentes, razonamiento multi-paso ni modos especiales como thinking mode.

## Casos de uso

- Asistentes conversacionales en dhivehi: el modelo puede integrarse en chatbots para atención al cliente o servicios públicos en Maldivas, aprovechando su capacidad de generar respuestas contextuales en el idioma local.
- Traducción automática de documentos administrativos: dado que el dhivehi tiene pocos recursos, este modelo podría emplearse para traducir textos legales o gubernamentales, aunque se requiere validación con datos reales.
- Generación de contenido educativo: creación de materiales didácticos, resúmenes o explicaciones en dhivehi para escuelas y universidades.
- Análisis de sentimiento en redes sociales: al estar ajustado al idioma, podría clasificar opiniones en dhivehi, útil para estudios de mercado o monitoreo social.
- Transcripción y normalización de texto: ayuda en la estandarización de dialectos o variantes del dhivehi, aunque no hay evidencia de soporte de audio.
- Desarrollo de herramientas de accesibilidad: lectores de pantalla o asistentes de voz que requieran generación de texto en dhivehi, siempre que se combine con un sistema de TTS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de evaluación, y no hay referencias a comparaciones con otros modelos en dhivehi. Se recomienda realizar una evaluación propia con tareas específicas antes de considerar su uso en producción.

## Requisitos de hardware

- VRAM estimada para inferencia: con 3B parámetros en fp16, se necesitan aproximadamente 6 GB de VRAM. Con cuantización a 8 bits, unos 3,5 GB; a 4 bits, unos 2,5 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM (RTX 3060, RTX 4060, etc.) para fp16. Para cuantización 4-bit, GPUs con 4 GB pueden ser suficientes (GTX 1650, etc.).
- Compatibilidad con consumer GPU: sí, es un modelo pequeño que cabe en GPUs de consumo medio.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, Hugging Face TGI, o directamente con transformers.
- Latencia y throughput: no disponible; dependerá del hardware y la cuantización. En una RTX 4090, se esperan decenas de tokens por segundo, pero no hay datos confirmados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hahsm/qwen2.5-3b-dhivehi | 3B | 128K (base) | dhivehi (fine-tune) | no disponible | Hugging Face |
| Qwen2.5-3B (base) | 3B | 128K | multilingüe (29+) | Apache 2.0 | Hugging Face, Ollama |
| Llama-3.2-3B | 3B | 128K | multilingüe (8) | Llama 3.2 license | Hugging Face, Ollama |
| Gemma-2-2B | 2B | 8K | multilingüe | Gemma license | Hugging Face |

No se dispone de comparativas de rendimiento específicas para dhivehi. El modelo base Qwen2.5-3B es un punto de partida razonable, pero el fine-tune podría superarlo en tareas en dhivehi si el entrenamiento fue adecuado. Llama-3.2-3B y Gemma-2-2B no tienen soporte nativo para dhivehi, por lo que este modelo podría ser la única opción abierta para ese idioma.

## Limitaciones y advertencias

- Sesgos conocidos: no hay información sobre sesgos específicos; el modelo base puede heredar sesgos de los datos de preentrenamiento, y el fine-tune podría amplificarlos si el dataset de dhivehi no fue curado.
- Riesgo de alucinación: al ser un modelo pequeño, es propenso a generar información falsa o inventada, especialmente en dominios especializados.
- Limitaciones de contexto: aunque el modelo base soporta 128K tokens, no se ha confirmado que el fine-tune mantenga esa capacidad; es posible que se haya reducido durante el ajuste.
- Restricciones de licencia: la licencia no está especificada, lo que impide conocer si se permite uso comercial. Se recomienda contactar al autor antes de cualquier uso productivo.
- Falta de documentación: la model card es genérica y no aporta detalles sobre el entrenamiento, evaluación o limitaciones específicas. Esto dificulta la reproducibilidad y la confianza en el modelo.
- Riesgo de degradación en otros idiomas: el fine-tune puede haber reducido el rendimiento en inglés u otros idiomas, por lo que no es recomendable usarlo fuera del ámbito dhivehi.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/hahsm/qwen2.5-3b-dhivehi
- Modelo base Qwen2.5-3B: https://huggingface.co/Qwen/Qwen2.5-3B
- Colección Qwen2.5: https://huggingface.co/collections/Qwen/qwen25
- Página de Qwen2.5-3B en Ollama: https://ollama.com/library/qwen2.5:3b
- Informe técnico de Qwen2.5 (arXiv): https://arxiv.org/pdf/2412.15115v1
