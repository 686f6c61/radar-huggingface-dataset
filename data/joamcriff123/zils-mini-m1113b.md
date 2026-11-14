# joamCriff123/zils-mini-m1113b

## Resumen

zils-mini-m1113b es un modelo de la familia Qwen3.5-4B publicado por el usuario joamCriff123 en Hugging Face. Se presenta como un "d3-mini decision body" destinado al "mini pool" de la subred 127 de Zils, lo que sugiere un ajuste fino orientado a tareas de decisión dentro de un ecosistema de subredes (posiblemente relacionado con Bittensor u otra red distribuida de cómputo). El modelo parte del checkpoint base Qwen/Qwen3.5-4B y se distribuye bajo licencia Apache-2.0.

El repositorio tiene un tamaño de 9,1 GB y contiene 4.539.265.536 parámetros en formato safetensors, lo que encaja con un transformer denso de aproximadamente 4,5 mil millones de parámetros. La etiqueta de pipeline es `feature-extraction` y el tag `decision-model` apunta a un uso como extractor de representaciones o cabecera de decisión más que como generador de texto conversacional.

La información pública es muy escasa: la model card es mínima, no se declaran idiomas soportados, no hay benchmarks publicados ni detalles sobre el dataset de ajuste. Esta ficha documenta lo que se puede verificar y marca explícitamente como "no disponible" todo aquello que el autor no ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.5), ajustado como modelo de decisión |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del checkpoint base Qwen/Qwen3.5-4B, un transformer denso de unos 4,5 mil millones de parámetros. El autor lo describe como un "decision body", término que en el contexto de subredes de cómputo distribuido suele designar un modelo ajustado para emitir decisiones o puntuaciones (por ejemplo, selección de respuestas, ranking o validación) en lugar de generar texto libre. El pipeline declarado, `feature-extraction`, es coherente con ese uso: el modelo se emplearía para producir representaciones o logits de decisión.

No se ha publicado información sobre el volumen de tokens de entrenamiento, la composición del dataset de ajuste, ni si se aplicaron técnicas de RLHF, DPO o supervisión directa. Tampoco se documentan innovaciones técnicas específicas (atención lineal, decodificación especulativa, modos de razonamiento) más allá de las que aporte el modelo base. El repositorio incluye un archivo NOTICE con atribuciones al modelo upstream, lo que confirma que se trata de un fine-tune y no de un entrenamiento desde cero.

## Capacidades

- Extracción de características y representaciones a partir de texto, según el pipeline declarado (`feature-extraction`).
- Emisión de decisiones o puntuaciones, de acuerdo con el tag `decision-model` y la descripción del autor.
- Herencia de las capacidades del modelo base Qwen3.5-4B (generación de texto, razonamiento y multilingüismo), aunque el ajuste puede haber alterado o degradado estas habilidades; no hay documentación que lo confirme.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: no disponibles (el autor no declara idiomas).
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Puntuación y ranking de respuestas en pipelines de evaluación: el modelo puede usarse como cabecera de decisión que asigna una puntuación a pares pregunta-respuesta, aprovechando su naturaleza de `decision-model` y su tamaño contenido para inferencia por lotes.
- Validación en subredes de cómputo distribuido: encaja en el escenario descrito por el autor (mini pool de la subred 127 de Zils) como componente que decide qué salidas de otros nodos son aceptables.
- Extracción de embeddings para búsqueda semántica: con el pipeline `feature-extraction` puede generar representaciones vectoriales de documentos para índices de recuperación, siempre que se valide la calidad de los embeddings en el dominio objetivo.
- Filtrado de contenido en pipelines de datos: uso como clasificador binario o multiclase tras añadir una cabeza de clasificación, aprovechando los 4,5 mil millones de parámetros del backbone.
- Prototipado de sistemas de decisión en investigación: su licencia Apache-2.0 y su tamaño permiten experimentar en una sola GPU consumer sin restricciones comerciales.
- Componente intermedio en ensembles o routers de modelos: puede actuar como modelo pequeño que decide qué modelo mayor invocar en un sistema de enrutamiento, aunque esta aplicación requiere validación empírica no publicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: en torno a 9 GB solo para pesos, más overhead de activaciones y contexto; se recomienda un mínimo de 12-16 GB.
- VRAM estimada en cuantización de 8 bits: aproximadamente 5 GB de pesos; en 4 bits, alrededor de 3 GB, aunque el autor no publica variantes cuantizadas.
- GPU recomendadas: A100 40 GB, H100, L40S o RTX 4090 para FP16 con contexto amplio; RTX 3090/4080 para FP16 con lotes pequeños.
- Cabe en GPU consumer: sí, en RTX 3090, 4080, 4090 y tarjetas con 12 GB o más en FP16; en 8 GB solo con cuantización, que no está publicada.
- Opciones de despliegue: transformers (librería declarada); vLLM, TGI, llama.cpp u Ollama no están documentados para este checkpoint y requerirían conversión propia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| zils-mini-m1113b | 4,54 B | no disponible | Apache-2.0 | Fine-tune de decisión, sin benchmarks publicados |
| Qwen/Qwen3.5-4B (base) | ~4 B | no disponible en esta ficha | Apache-2.0 (según el autor) | Modelo upstream; capacidades generales de texto |
| Qwen2.5-3B / Qwen2.5-7B | 3 B / 7 B | 32K (versiones estándar) | Apache-2.0 | Alternativas de tamaño comparable con benchmarks públicos |
| Llama 3.2 3B | 3 B | 128K | Llama 3.2 Community License | Alternativa consumer con restricciones de licencia |

La comparación directa de rendimiento no es posible porque zils-mini-m1113b no publica métricas. Frente al modelo base, el ajuste de decisión puede mejorar en su tarea específica y degradar la generación general, pero no hay evidencia publicada.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay forma de verificar la calidad del ajuste ni compararlo con alternativas.
- Model card mínima: no se documentan datos de entrenamiento, idiomas, contexto ni procedimiento de ajuste, lo que dificulta la reproducibilidad.
- Riesgo de alucinación: al derivar de un modelo generativo, si se usa fuera de su tarea de decisión puede producir salidas plausibles pero incorrectas.
- Sesgos: no documentados; al desconocerse el dataset de ajuste no se pueden evaluar sesgos de género, idioma o dominio.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el archivo NOTICE impone mantener las atribuciones al modelo upstream; conviene revisarlo antes de redistribuir.
- Uso previsto acotado: el autor lo describe para el mini pool de la subred 127 de Zils; emplearlo en producción general sin validación previa es arriesgado.
- Ecosistema: sin variantes cuantizadas publicadas ni integración documentada con vLLM, llama.cpp u Ollama, el despliegue eficiente requiere trabajo adicional.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/joamCriff123/zils-mini-m1113b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
- Papers, blogs, repos o demos adicionales: no disponibles en la información proporcionada.
