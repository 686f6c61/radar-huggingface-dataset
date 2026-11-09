# Angelji/les-ai-modeli

## Resumen

Angelji/les-ai-modeli es un modelo de generación de texto publicado en Hugging Face por el usuario Angelji, con un total de 494.032.768 parámetros (aproximadamente 494 millones) según los pesos en formato safetensors. La etiqueta `qwen2` en los metadatos indica que la arquitectura subyacente corresponde a la familia Qwen2 de Alibaba, si bien el autor no lo confirma explícitamente en la model card. El repositorio ocupa 1,0 GB y fue creado y actualizado el 9 de noviembre de 2026, sin descargas ni interacciones registradas en el momento de la consulta.

El modelo se presenta como un sistema de generación de texto conversacional compatible con la librería transformers y con text-generation-inference, además de estar marcado como compatible con endpoints. Sin embargo, la model card es la plantilla automática de Hugging Face y no contiene información sustantiva: no se documentan datos de entrenamiento, idiomas, licencia, intención de uso ni resultados de evaluación. Se trata, por tanto, de un artefacto de pesos sin documentación técnica verificable.

Su relevancia actual es limitada y de naturaleza exploratoria: resulta útil como ejemplo de modelo pequeño (~494 M de parámetros) derivado de Qwen2 que puede ejecutarse en hardware de consumo, pero la ausencia total de documentación y de métricas impide recomendarlo para producción sin una evaluación previa por parte del usuario.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia Qwen2 (según etiqueta `qwen2`; no confirmado por el autor) |
| Parámetros totales | 494.032.768 (~494 M) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (Qwen2 base soporta típicamente hasta 32 768 tokens, pero no confirmado para este modelo) |
| Tipos de cuantización | No disponible (pesos publicados en safetensors; cuantización GGUF/AWQ no publicada) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Librería | transformers |
| Pipeline | text-generation |
| Tamaño del repositorio | 1,0 GB |

## Arquitectura y entrenamiento

La etiqueta `qwen2` y el pipeline `text-generation` apuntan a un transformer decoder-only con atención causal, propio de la familia Qwen2. Con 494 millones de parámetros, el modelo encaja en el rango de las variantes pequeñas de esa familia (Qwen2-0.5B), aunque el autor no especifica la configuración exacta de capas, cabezas de atención ni dimensión oculta. El repositorio de 1,0 GB es coherente con pesos en precisión de 16 bits para ese número de parámetros.

No hay información pública sobre el proceso de entrenamiento: ni número de tokens, ni composición del dataset, ni si hubo ajuste supervisado, RLHF o DPO. Tampoco se documentan innovaciones técnicas como decodificación especulativa, atención lineal o modos de razonamiento. La model card es la plantilla automática de Hugging Face y todos los campos relevantes aparecen como "[More Information Needed]". Cualquier afirmación sobre el entrenamiento sería especulativa y no debe asumirse.

## Capacidades

- Generación de texto autoregresiva y conversacional, según el pipeline declarado (`text-generation`, `conversational`).
- Compatibilidad con la librería transformers y con text-generation-inference, lo que permite desplegarlo mediante endpoints compatibles.
- Capacidad multilingüe: no documentada; no puede confirmarse ningún idioma concreto.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades de visión, audio o modo de pensamiento (thinking): no disponibles.
- Razonamiento matemático y generación de código: no evaluados ni documentados.

## Casos de uso

- Prototipado rápido de chatbots: al ser un modelo de ~494 M de parámetros en safetensors, puede cargarse con transformers en una GPU de consumo para validar flujos conversacionales básicos antes de invertir en modelos mayores.
- Experimentación académica con modelos pequeños: útil como punto de partida para estudiar técnicas de ajuste fino (LoRA, QLoRA) sobre una base Qwen2 de tamaño reducido.
- Pruebas de integración con text-generation-inference: permite validar pipelines de despliegue y endpoints compatibles en entornos de desarrollo sin coste elevado de cómputo.
- Generación de texto de baja latencia en local: su tamaño permite inferencia en CPU o en GPU modesta, adecuado para tareas de autocompletado o borradores donde la calidad no sea crítica.
- Base para fine-tuning específico de dominio: al ser pequeño, es viable reentrenarlo con datasets propios en una sola GPU, siempre que se acepte el riesgo de una base sin documentar.
- Evaluación comparativa de modelos pequeños: sirve como referencia en estudios que midan el efecto del tamaño y de la destilación en la calidad de generación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 1 GB para los pesos, más overhead de activaciones y caché KV (estimación típica de 1,5-2,5 GB en total para contextos moderados).
- VRAM estimada en cuantización de 8 bits: alrededor de 0,6-0,8 GB; en 4 bits, alrededor de 0,4-0,6 GB (estimaciones, no verificadas para este modelo).
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM (RTX 3050, RTX 4060, T4); también A100/H100 para despliegues por lotes de alto throughput.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU consumer actuales, e incluso en CPU con suficiente RAM.
- Opciones de despliegue: transformers (nativo), text-generation-inference (declarado compatible), y previsiblemente llama.cpp/Ollama si se generan pesos GGUF, aunque no se publican conversiones.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Documentación | Disponibilidad |
|---|---|---|---|---|---|
| Angelji/les-ai-modeli | ~494 M | No disponible | No disponible | Plantilla vacía | Hugging Face |
| Qwen2-0.5B (Alibaba) | ~494 M | 32 768 tokens | Apache 2.0 | Completa, con benchmarks | Hugging Face, amplia adopción |
| Qwen2.5-0.5B (Alibaba) | ~494 M | 32 768 tokens | Apache 2.0 | Completa, con benchmarks | Hugging Face, amplia adopción |
| SmolLM2-360M (Hugging Face) | ~360 M | 8 192 tokens | Apache 2.0 | Completa, con benchmarks | Hugging Face |

La comparación se basa en el tamaño y la familia arquitectónica; no hay datos de rendimiento de este modelo que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Ausencia total de documentación: la model card es la plantilla automática; no hay información sobre datos, sesgos, intención de uso ni evaluación.
- Licencia no disponible: no puede confirmarse el uso comercial; debe contactarse con el autor antes de cualquier despliegue en producción.
- Riesgo elevado de alucinación y de comportamiento impredecible al no existir evaluación publicada ni proceso de alineamiento documentado.
- Idiomas no documentados: no puede garantizarse un rendimiento aceptable en castellano ni en ningún otro idioma.
- Sin garantías de procedencia de los datos de entrenamiento: posibles sesgos y problemas de copyright no evaluables.
- Contexto no confirmado: asumir la ventana de 32 768 tokens de Qwen2 sería una extrapolación no verificada.
- Cero descargas y cero interacciones: no hay evidencia de uso comunitario ni de validación externa.
- No apto para producción sin una evaluación propia exhaustiva de calidad, seguridad y sesgos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Angelji/les-ai-modeli
- Paper citado en la model card (Lacoste et al., 2019, sobre impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental ML: https://mlco2.github.io/impact#compute
