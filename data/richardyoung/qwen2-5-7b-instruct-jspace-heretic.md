# richardyoung/Qwen2.5-7B-Instruct-JSpace-heretic

## Resumen

Qwen2.5-7B-Instruct-JSpace-heretic es una variante "abliterated" (también llamada decensored o heretic) del modelo Qwen2.5-7B-Instruct de Alibaba Cloud, publicada por el usuario richardyoung en Hugging Face. El modelo base es un transformer denso de 7.615.616.512 parámetros (aproximadamente 7,6 mil millones) entrenado por Qwen para generación de texto e instrucciones, y esta variante aplica técnicas de modificación de pesos para eliminar o reducir los mecanismos de rechazo y censura alineados en el modelo original.

La relevancia de esta ficha radica en que se trata de un modelo derivado que hereda la arquitectura y capacidades del Qwen2.5-7B-Instruct, pero con un comportamiento de alineación alterado. Esto lo hace interesante para investigación sobre seguridad, evaluación de mecanismos de rechazo y estudios de robustez de alineación, aunque también plantea riesgos importantes para uso en producción. El acceso está restringido (gated), lo que obliga a aceptar condiciones en Hugging Face antes de descargar los pesos.

El modelo se distribuye en formato safetensors con licencia Apache 2.0 declarada, aunque la modificación de pesos y la naturaleza "uncensored" deben tenerse en cuenta a la hora de evaluar su idoneidad para despliegues comerciales o de cara al público.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2), denso |
| Parámetros totales | 7.615.616.512 (≈7,6 B) |
| Parámetros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el base Qwen2.5-7B-Instruct soporta 32 768 tokens, pero no se confirma para esta variante) |
| Tipos de cuantización | no disponible (el repo contiene safetensors en fp16/bf16; no se listan GGUF ni otras cuantizaciones) |
| Idiomas soportados | en (inglés) según la model card; el base Qwen2.5 soporta multilingüe, pero esta variante declara solo inglés |
| Licencia | apache-2.0 (declarada) |
| Formato de pesos | safetensors |
| Librería | transformers |
| Pipeline | text-generation |
| Acceso | restringido (gated) |
| Tamaño del repo | 15,2 GB |

## Arquitectura y entrenamiento

La arquitectura corresponde a la familia Qwen2, un transformer decoder-only denso con atención causal estándar. El modelo base Qwen2.5-7B-Instruct fue entrenado por Alibaba con un pipeline que incluye preentrenamiento sobre un corpus multilingüe masivo y posterior ajuste supervisado (SFT) más optimización por preferencias (RLHF/DPO según la documentación de Qwen). Sin embargo, los detalles concretos de número de tokens, composición del dataset y fases de alineación del modelo base no se especifican en la información proporcionada para esta variante.

La modificación "heretic/abliterated" consiste en una intervención sobre los pesos que busca eliminar la dirección de rechazo aprendida durante la alineación, típicamente mediante técnicas de abliteration (proyección ortogonal de la dirección de rechazo en las capas de atención/MLP). No se detalla en la información disponible el método exacto, el número de capas modificadas ni si hubo reentrenamiento posterior. Los tags del repositorio incluyen referencias a los papers arXiv:2309.00071 y arXiv:2407.10671, que suelen asociarse a metodologías de abliteration y evaluación de refusal, aunque no se confirma su correspondencia exacta con el proceso aplicado.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base Qwen2.5-7B-Instruct.
- Razonamiento general y respuesta a instrucciones en inglés.
- Generación de código y matemáticas (capacidades del base, no verificadas específicamente en esta variante).
- Comportamiento "uncensored": reducción o eliminación de rechazos ante solicitudes que el modelo base rechazaría.
- Soporte de chat mediante plantilla de conversación de Qwen2.5 (chat template).
- Compatibilidad con text-generation-inference y endpoints compatibles (según tags).
- Capacidades multilingües: la model card declara únicamente inglés; el base soporta más idiomas, pero no se garantiza en esta variante.
- Tool calling / function calling: no confirmado en la información disponible para esta variante.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar cómo la abliteration afecta a las tasas de rechazo y a la calidad de las respuestas, comparándolo con el Qwen2.5-7B-Instruct original en conjuntos de evaluación de refusal.
- Evaluación de robustez de salvaguardas: útil para probar clasificadores de contenido y sistemas de moderación frente a modelos que no rechazan solicitudes sensibles.
- Generación creativa de ficción sin restricciones temáticas: escritura de narrativa que aborde temas que el modelo base podría declinar, con la advertencia de revisión humana.
- Red teaming interno: empleo controlado en entornos aislados para identificar vulnerabilidades en pipelines de IA antes de desplegar modelos alineados.
- Experimentación académica con técnicas de edición de pesos: comparación de métodos de abliteration y su impacto en benchmarks de razonamiento y conocimiento.
- Desarrollo de asistentes de investigación en entornos cerrados: donde se requiere baja tasa de rechazo y se asume revisión posterior por parte del investigador.
- Fine-tuning posterior para dominios específicos: al ser un modelo de 7,6 B en safetensors, puede ajustarse con LoRA en GPUs de gama alta para tareas concretas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 15-16 GB solo para pesos, más overhead de activaciones y KV cache (típicamente 18-24 GB en contexto largo).
- VRAM estimada en cuantización 8 bits: ~8-9 GB; en 4 bits: ~4-5 GB (aunque no se distribuyen GGUF oficiales en el repo).
- GPU recomendadas: A100 40/80 GB, H100, L40S, RTX A6000 para fp16 sin cuantizar.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en fp16 con contexto moderado; en RTX 3090 (24 GB) de forma ajustada; en GPUs de 8-12 GB requiere cuantización, que habría que generar manualmente.
- Opciones de despliegue: transformers, text-generation-inference (TGI), vLLM; llama.cpp/Ollama requerirían conversión a GGUF no incluida en el repo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| richardyoung/Qwen2.5-7B-Instruct-JSpace-heretic | 7,6 B | no disponible | apache-2.0 | gated | Variante abliterated del Qwen2.5-7B-Instruct |
| Qwen/Qwen2.5-7B-Instruct | 7,6 B | 32 768 tokens (según documentación de Qwen) | apache-2.0 | abierto | Modelo base alineado, multilingüe |
| Otras variantes abliterated de Qwen2.5-7B | ~7,6 B | variable | variable | variable | Existen múltiples en Hugging Face; no se dispone de datos comparativos verificados en esta información |

No se dispone de datos de rendimiento comparativo verificados en la información proporcionada para establecer diferencias cuantitativas entre estas variantes.

## Limitaciones y advertencias

- La modificación "uncensored/abliterated" elimina o reduce los rechazos de seguridad, lo que aumenta el riesgo de generar contenido dañino, ilegal o inapropiado.
- Riesgo elevado de alucinación, comparable o superior al del modelo base, sin que se hayan publicado evaluaciones específicas para esta variante.
- La model card declara únicamente inglés; el rendimiento en otros idiomas no está garantizado y podría degradarse respecto al base.
- La licencia Apache 2.0 se declara en los tags, pero la modificación de pesos y el uso comercial de un modelo decensored deben evaluarse legal y éticamente; no hay garantías del autor sobre idoneidad.
- El acceso es restringido (gated): requiere aceptar condiciones en Hugging Face, lo que puede limitar la reproducibilidad.
- No se distribuyen cuantizaciones GGUF ni versiones optimizadas; el despliegue en hardware limitado requiere conversión manual.
- No se confirma soporte de tool calling ni de funcionalidades de agente en esta variante.
- El autor es un particular (richardyoung), no el equipo oficial de Qwen; no hay soporte ni mantenimiento garantizado.
- Fecha de creación y actualización en 2026, con solo 520 descargas y 0 likes: ecosistema de validación muy limitado.

## Enlaces

- Hugging Face: https://huggingface.co/richardyoung/Qwen2.5-7B-Instruct-JSpace-heretic
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Paper referenciado (arXiv:2309.00071): https://arxiv.org/abs/2309.00071
- Paper referenciado (arXiv:2407.10671): https://arxiv.org/abs/2407.10671
