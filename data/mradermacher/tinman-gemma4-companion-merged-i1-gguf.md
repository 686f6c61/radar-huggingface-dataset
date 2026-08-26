# mradermacher/Tinman-gemma4-companion-merged-i1-GGUF

## Resumen

El modelo `Tinman-gemma4-companion-merged-i1-GGUF` es una cuantización GGUF del modelo `Tinman-gemma4-companion-merged`, un merge conversacional desarrollado por el laboratorio Tinman-Lab y publicado en Hugging Face. El autor de esta versión cuantizada es `mradermacher`, conocido por generar pesos GGUF con imatrix para su uso en entornos de inferencia local. El nombre sugiere que se trata de una fusión de modelos basada en la familia Gemma 4 de Google DeepMind, orientada a tareas de acompañamiento conversacional.

El modelo tiene aproximadamente 7.460 millones de parámetros (7,46B), lo que lo sitúa en la gama de modelos medianos que pueden ejecutarse en hardware de consumo con las cuantizaciones adecuadas. El repositorio incluye múltiples niveles de cuantización (desde Q2_K hasta Q6_K, incluyendo variantes IQ), lo que permite adaptar el uso a diferentes capacidades de VRAM. La fecha de creación (agosto de 2026) indica que es un modelo reciente, aunque no se dispone de información sobre su licencia, idiomas soportados o pipeline de entrenamiento.

La relevancia de este modelo radica en su naturaleza de merge: combina las capacidades de Gemma 4 con un ajuste específico para conversación, ofreciendo una alternativa local y cuantizada para desarrolladores que buscan un asistente conversacional sin depender de APIs externas. Sin embargo, la falta de documentación oficial limita la evaluación rigurosa de sus capacidades reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (presumiblemente transformer basado en Gemma 4) |
| Parametros totales | 7.463.013.674 (7,46B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors no incluido en este repo) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo original. El nombre "gemma4" sugiere que se basa en la arquitectura de Gemma 4 de Google DeepMind, que emplea un transformer decoder-only con atención multi-cabeza y normalización RMSNorm. Sin embargo, al ser un merge, la arquitectura final puede combinar pesos de varios modelos base, lo que dificulta precisar detalles como el número de capas, la dimensión oculta o el mecanismo de atención exacto.

El proceso de entrenamiento tampoco está documentado. Se desconoce el número de tokens de entrenamiento, la composición del dataset o si se aplicaron técnicas de RLHF o DPO. El término "companion" en el nombre sugiere un ajuste orientado a conversación empática o asistencia personal, pero no hay evidencia pública que lo confirme. La cuantización fue realizada con imatrix (método de cuantización por importancia de activaciones), lo que mejora la calidad de los pesos cuantizados en comparación con métodos estándar.

## Capacidades

- Generación de texto conversacional: el modelo está diseñado para mantener diálogos multi-turno, probablemente con un tono cercano y útil, aunque no hay ejemplos concretos publicados.
- Razonamiento básico: al ser un modelo de 7B, puede realizar tareas de razonamiento lógico y matemático simple, pero sin garantías de rendimiento.
- Soporte de tool calling: no disponible (no se menciona en la documentación).
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no disponible, aunque Gemma 4 soporta múltiples idiomas, el merge podría haber alterado este aspecto.
- Capacidades especiales: no se reportan modos de pensamiento, visión o audio.

## Casos de uso

- Asistente conversacional local: el modelo puede desplegarse en una máquina con GPU de consumo (por ejemplo, RTX 3060 o superior) usando cuantizaciones Q4 o Q5, ofreciendo un chatbot privado sin conexión a internet. Su tamaño de 7B permite respuestas fluidas en tiempo real.
- Prototipado de aplicaciones de chat: los desarrolladores pueden integrarlo en aplicaciones de mensajería o web mediante frameworks como llama.cpp o Ollama, gracias a su formato GGUF.
- Generación de contenido creativo: puede utilizarse para redactar correos, historias cortas o guiones, aunque su especialización conversacional puede limitar la coherencia en tareas largas.
- Educación y tutoría: como modelo de acompañamiento, podría servir para practicar idiomas o explicar conceptos sencillos, siempre que se valide su precisión.
- Investigación en merges de modelos: al ser un merge, es útil para estudiar cómo la combinación de pesos afecta al comportamiento conversacional, aunque carece de documentación técnica.
- Despliegue en entornos con restricciones de hardware: las cuantizaciones extremas (IQ1, Q2) permiten ejecutarlo en CPU con pocos GB de RAM, aunque con pérdida de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras pruebas estándar. Tampoco se comparan con modelos similares en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantización. Para Q4_K_M (típico), se necesitan aproximadamente 4-5 GB de VRAM. Para Q2_K, alrededor de 2-3 GB. Para Q6_K, unos 6-7 GB.
- GPU recomendadas: RTX 3060 (12 GB) o superior para cuantizaciones Q4-Q6; RTX 4090 o A100 para ejecución sin cuantizar (aunque no se proporcionan pesos safetensors en este repo).
- Si cabe en consumer GPU: sí, con cuantizaciones Q4 o inferiores en GPUs de 8 GB o más.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (con adaptador GGUF), TGI (si se convierte a safetensors), o cualquier framework compatible con GGUF.
- Latencia y throughput: no disponible, pero en una RTX 3090 con Q4_K_M se esperan velocidades de 20-40 tokens/s para un modelo de 7B.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar con alternativas concretas. El modelo es un merge de Gemma 4, pero no se conocen los modelos base exactos. Como referencia genérica, se podría comparar con Gemma 4 7B (si existe) o con otros modelos conversacionales de 7B como Llama 3.1 8B o Mistral 7B, pero sin datos de rendimiento no es posible establecer una comparación rigurosa. Se recomienda consultar la documentación de Tinman-Lab para más detalles.

## Limitaciones y advertencias

- Sesgos conocidos: no hay información, pero al ser un merge de Gemma 4, podría heredar sesgos del modelo base.
- Riesgo de alucinacion: alto, como en la mayoría de modelos de 7B, especialmente en tareas factuales.
- Limitaciones de contexto: se desconoce la longitud de contexto, pero probablemente esté en el rango de 8K-32K tokens, típico de Gemma 4.
- Restricciones de licencia: no disponible, lo que impide conocer si es de uso comercial o solo investigativo.
- Caveat para producción: la falta de documentación y benchmarks hace arriesgado su uso en entornos críticos. Se recomienda validar exhaustivamente antes de desplegar.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Tinman-gemma4-companion-merged-i1-GGUF
- Modelo original: https://huggingface.co/Tinman-Lab/Tinman-gemma4-companion-merged
- README del modelo original: https://huggingface.co/Tinman-Lab/Tinman-gemma4-companion-merged/blob/main/README.md
- Página de Gemma 4 en DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Despliegue en FriendliAI: https://friendli.ai/models/Tinman-Lab/Tinman-gemma4-companion-merged
