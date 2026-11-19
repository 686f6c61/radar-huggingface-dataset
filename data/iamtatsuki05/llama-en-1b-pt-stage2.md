# iamtatsuki05/Llama-EN-1B-PT-stage2

## Resumen

Llama-EN-1B-PT-stage2 es un modelo de lenguaje decoder-only de 1.407.538.944 parámetros (aproximadamente 1,4 mil millones) desarrollado por el usuario iamtatsuki05 dentro de la colección MIREI. Se trata de la segunda etapa de preentrenamiento (stage2) que continúa a partir de iamtatsuki05/Llama-EN-1B-PT-stage1 y se entrena sobre el corpus google/wiki40b en inglés, observando aproximadamente 2.500 millones de tokens con ventanas de contexto de 8.192 tokens. Su propósito es servir como backbone generativo base para tareas posteriores en inglés, no como un modelo instruido o alineado.

El modelo emplea la arquitectura Llama clásica (transformer decoder-only) con dimensión de embedding de 1792, codificación posicional RoPE y un tokenizador SentencePiece con vocabulario de 102.400 entradas. La relevancia de esta ficha radica en que documenta un checkpoint de investigación de preentrenamiento puro: no hay datos publicados de benchmarks, alineación por RLHF/DPO ni ajuste por instrucciones, por lo que su valor práctico es el de una base para fine-tuning controlado y para estudios comparativos de arquitecturas (la serie MIREI incluye un checkpoint paralelo con arquitectura ModernBERT bajo la misma receta).

Es importante señalar que el modelo tiene un volumen de descargas muy bajo (4 en el momento de la consulta) y ninguna validación comunitaria (0 likes), lo que lo sitúa como un artefacto de investigación más que como un modelo listo para producción. La licencia MIT facilita su reutilización comercial, pero la ausencia de evaluación publicada obliga a realizar una validación propia antes de cualquier despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (transformer decoder-only) |
| Parametros totales | 1.407.538.944 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | no disponible (el autor no publica variantes GGUF/AWQ/GPTQ; al ser safetensors en bfloat16 es cuantizable con herramientas estándar como llama.cpp o bitsandbytes) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 2,8 GB, pesos en bfloat16) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de estilo Llama con dimensión de embedding de 1792, codificación posicional RoPE y tokenizador SentencePiece de vocabulario 102.400. No se ha publicado el número de capas, el número de cabezas de atención ni la dimensión de la capa feed-forward en la información disponible; solo se confirman la dimensión de embedding, la longitud máxima de secuencia (8.192) y la familia arquitectónica. Es un modelo denso, no MoE, por lo que todos los parámetros se activan en cada paso de inferencia.

El entrenamiento corresponde a una segunda etapa de preentrenamiento sobre google/wiki40b, con aproximadamente 2.500 millones de tokens observados y contexto de 8.192 tokens. No se especifican la composición exacta del dataset más allá del corpus wiki40b, el número de pasos, la tasa de aprendizaje, el esquema de mezcla de datos ni si hubo fases posteriores de RLHF, DPO o SFT. Tampoco se documentan innovaciones técnicas como decodificación especulativa, atención lineal o variantes de atención eficiente; el modelo se apoya en flash-attention 2 a nivel de implementación (requiere flash-attn>=2.7.3 según la model card).

## Capacidades

- Generación de texto en inglés: continuación de prompts y generación libre con decodificación por muestreo (temperature, top-p) o greedy.
- Modelo base de preentrenamiento: no está ajustado por instrucciones, por lo que no sigue instrucciones de forma fiable sin fine-tuning previo.
- Razonamiento y conocimiento factual limitados al corpus wiki40b: el conocimiento enciclopédico proviene de Wikipedia en inglés.
- Soporte de tool calling / function calling: no disponible de forma nativa; requeriría fine-tuning específico.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma nativa.
- Capacidades multilingües: únicamente inglés; no se reporta transferencia a otros idiomas.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.
- Compatibilidad con text-generation-inference y endpoints compatibles, según los tags del repositorio.

## Casos de uso

- Fine-tuning supervisado para dominios concretos: al ser un modelo base de 1,4B parámetros con licencia MIT, es adecuado como punto de partida para SFT sobre datos propios en inglés (atención al cliente, documentación técnica, resúmenes) con coste de cómputo moderado.
- Investigación en preentrenamiento y comparación de arquitecturas: la serie MIREI entrena el mismo corpus y receta con arquitecturas Llama y ModernBERT, lo que permite estudiar diferencias encoder vs. decoder en tareas de representación y generación.
- Generación de texto enciclopédico y completado de artículos: el entrenamiento sobre wiki40b lo hace razonablemente competente en la continuación de estilo Wikipedia en inglés, útil para tareas de aumentación de datos.
- Experimentos de destilación y ajuste con DPO/RLHF: su tamaño permite ejecutar pipelines completos de alineación en una sola GPU, sirviendo como banco de pruebas de metodologías antes de escalar a modelos mayores.
- Evaluación de técnicas de cuantización: al ser un modelo pequeño en bfloat16 (2,8 GB), es un candidato práctico para medir la degradación de calidad al cuantizar a 8, 4 o menos bits con llama.cpp o bitsandbytes.
- Prototipado de pipelines de generación con TGI: los tags indican compatibilidad con text-generation-inference y endpoints, lo que permite desplegar un servicio de generación de bajo coste para pruebas internas de latencia y throughput.
- Generación de datos sintéticos para entrenamiento: puede emplearse para producir continuaciones de texto en inglés a gran escala a bajo coste, siempre con filtrado y revisión posteriores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K, HellaSwag ni de perplejidad sobre wiki40b, y no se han encontrado evaluaciones independientes en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 2,8 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 4 y 6 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: alrededor de 1,5-2 GB de pesos; en 4 bits, alrededor de 0,8-1 GB.
- GPU recomendadas: cualquier GPU consumer moderna con 8 GB o más (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090) es suficiente; para despliegue en servidor, A100 o H100 no son necesarias y estarían infrautilizadas, aunque permiten mayor paralelismo y throughput.
- Cabe en GPU consumer: sí, holgadamente, incluso en GPUs de 6-8 GB con cuantización.
- Opciones de despliegue: transformers (versión >=4.51.0), accelerate (>=1.6.0), flash-attn (>=2.7.3), text-generation-inference (según tags), y cuantización vía llama.cpp, Ollama o bitsandbytes (no se publican artefactos GGUF oficiales).
- Latencia y throughput estimados: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Estado |
|---|---|---|---|---|---|
| Llama-EN-1B-PT-stage2 (este) | 1,41B | 8.192 | inglés | MIT | base de preentrenamiento, sin benchmarks |
| iamtatsuki05/ModernBERT-EN-1B-PT-stage2 | no disponible | 8.192 (misma receta) | inglés | MIT (según serie) | base de preentrenamiento, arquitectura encoder |
| iamtatsuki05/Llama-EN-1B-PT-stage1 | no disponible | no disponible | inglés | MIT (según serie) | checkpoint previo de la misma serie |
| Modelos Llama pequeños de Meta (p. ej. Llama 3.2 1B) | ~1,2B | 128K | multilingüe | licencia comunitaria Llama | instruido y evaluado con benchmarks públicos |

La comparación con alternativas de la misma categoría (modelos densos de ~1-1,5B) queda limitada por la ausencia de métricas publicadas para este checkpoint. Frente a modelos instruidos de tamaño similar, la diferencia principal es que este es un modelo base sin alineación ni evaluación pública, mientras que las alternativas comerciales o comunitarias ampliamente adoptadas publican resultados de benchmarks y soportan múltiples idiomas.

## Limitaciones y advertencias

- Modelo base sin alineación: no sigue instrucciones de forma fiable, puede producir contenido incoherente o inapropiado y no incorpora salvaguardas de seguridad.
- Riesgo de alucinación elevado: al estar entrenado sobre wiki40b, puede generar afirmaciones factuales plausibles pero incorrectas, especialmente fuera del dominio enciclopédico.
- Sesgos conocidos: los sesgos de Wikipedia en inglés (cobertura geográfica y temática desigual, sesgo de género y cultural) se transfieren al modelo; no se ha documentado ningún proceso de mitigación.
- Limitación de idioma: solo inglés; el rendimiento en castellano u otros idiomas no está soportado ni evaluado.
- Limitación de contexto: 8.192 tokens máximo; no se documenta extrapolación de contexto ni técnicas de RoPE scaling.
- Ausencia de benchmarks: no hay evidencia publicada de calidad, lo que impide comparaciones rigurosas y obliga a evaluar antes de usar en producción.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías; conviene revisar la procedencia de los datos de entrenamiento (wiki40b) para cumplir con las condiciones de atribución de Wikipedia.
- Madurez: 4 descargas y 0 likes en el momento de la consulta; no hay validación comunitaria, issues documentados ni mantenimiento conocido.
- Requisitos de software específicos: transformers>=4.51.0, accelerate>=1.6.0, sentencepiece>=0.2.0 y flash-attn>=2.7.3, lo que puede complicar entornos con versiones antiguas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iamtatsuki05/Llama-EN-1B-PT-stage2
- Modelo base (stage1): https://huggingface.co/iamtatsuki05/Llama-EN-1B-PT-stage1
- Checkpoint paralelo ModernBERT: https://huggingface.co/iamtatsuki05/ModernBERT-EN-1B-PT-stage2
- Colección MIREI: https://huggingface.co/collections/iamtatsuki05/mirei
- Repositorio GitHub: https://github.com/iamtatsuki05/MIREI
- Dataset google/wiki40b: https://huggingface.co/datasets/google/wiki40b
- Licencia MIT: https://opensource.org/license/mit/
