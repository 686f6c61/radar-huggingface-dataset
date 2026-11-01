# avinashreddy22/bharat-english-7b-lora

## Resumen

BharatLLM English es un adaptador LoRA (concretamente QLoRA) para el modelo base Mistral-7B-Instruct-v0.3, desarrollado por avinashreddy22 en el marco del proyecto BharatLLM de FoundryAILabs. El adaptador está especializado en el dominio educativo K-12 (grados 6 a 12) alineado con el currículo indio CBSE/NCERT, y está entrenado exclusivamente en inglés. Forma parte de una familia de 13 adaptadores: 12 para lenguas de la India y 1 para ingeniería BTech.

El problema que resuelve es la falta de modelos ajustados al currículo educativo indio en inglés que sigan las convenciones de NCERT/CBSE, algo relevante para plataformas de tutoría automatizada, generación de material didáctico y asistentes de estudio. Al ser un adaptador sobre Mistral-7B, hereda la arquitectura transformer densa del modelo base (7.400 millones de parámetros aproximados) y su ventana de contexto, aunque el adaptador en sí solo añade 167.772.160 parámetros entrenables (2,26 % del total).

Es relevante ahora porque demuestra un patrón de especialización por dominio mediante adaptadores de bajo rango sobre un modelo abierto con licencia Apache 2.0, lo que permite desplegar variantes idiomáticas o temáticas sin duplicar el coste de almacenamiento del modelo base. El repositorio ocupa 0,7 GB, correspondiente únicamente a los pesos del adaptador en formato safetensors.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Mistral-7B-Instruct-v0.3) con adaptador LoRA de rango 64 |
| Parametros totales | 7.400 millones (modelo base); 167.772.160 parámetros entrenables en el adaptador (2,26 %) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada para el adaptador; el modelo base Mistral-7B-Instruct-v0.3 soporta 32.768 tokens según su propia model card (no verificado en esta ficha) |
| Tipos de cuantizacion | QLoRA 4-bit durante el entrenamiento; en inferencia, las soportadas por el modelo base (4-bit, 8-bit, bfloat16, float16) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre Mistral-7B-Instruct-v0.3, un transformer decoder-only denso de aproximadamente 7.400 millones de parámetros. El ajuste se realizó con QLoRA: cuantización 4-bit del modelo base más un adaptador LoRA de rango r=64, con 167.772.160 parámetros entrenables, lo que representa el 2,26 % del total. La librería de entrenamiento empleada fue Unsloth, orientada a reducir el consumo de memoria y acelerar el fine-tuning.

Los datos de entrenamiento provienen del dataset `FoundryAILabs/k12-indian-curriculum-4.9m` y se utilizaron aproximadamente 594.000 pares pregunta-respuesta alineados con el currículo CBSE/NCERT para grados 6 a 12 en inglés. No se especifica en la información disponible el número total de tokens procesados, la composición detallada del dataset ni si se aplicaron fases de RLHF o DPO posteriores al ajuste supervisado. Tampoco se documentan innovaciones técnicas adicionales más allá del propio uso de QLoRA con Unsloth.

## Capacidades

- Generación de texto conversacional en inglés con formato de instrucciones de Mistral (`[INST] ... [/INST]`).
- Resolución de preguntas y explicaciones sobre contenido curricular K-12 (ciencias, matemáticas, humanidades) alineadas con NCERT/CBSE.
- Generación de material de estudio: resúmenes, definiciones, ejercicios y respuestas modelo en el dominio educativo.
- Razonamiento de varios pasos dentro de preguntas académicas, heredado del modelo base.
- Soporte de conversaciones multi-turno mediante el formato de chat de Mistral Instruct.
- Capacidad multilingüe limitada al inglés en este adaptador; las otras lenguas de la familia BharatLLM requieren sus adaptadores específicos.
- No se documenta soporte de tool calling, function calling, agentes, visión ni audio en la información proporcionada.

## Casos de uso

- Tutoría automatizada de estudiantes de secundaria: el adaptador responde preguntas de currículo CBSE/NCERT con el registro y la terminología del sistema educativo indio, algo que un Mistral-7B genérico no garantiza.
- Generación de bancos de preguntas y solucionarios: se puede usar para producir ejercicios y respuestas modelo alineados con grados 6 a 12, reduciendo el trabajo manual de docentes.
- Asistentes de estudio en aplicaciones móviles o web: al ser un adaptador de 0,7 GB sobre un base de 7B, permite servir una variante educativa sin mantener un modelo completo adicional por dominio.
- Explicación adaptada por nivel: el ajuste sobre datos etiquetados por curso permite generar explicaciones con un nivel de dificultad coherente con el grado del estudiante.
- Traducción de material didáctico entre lenguas de la India: combinado con los otros 12 adaptadores BharatLLM, permite construir un pipeline multilingüe sobre el mismo modelo base.
- Evaluación formativa automatizada: generación de feedback sobre respuestas abiertas de alumnos en asignaturas curriculares, con la terminología NCERT.
- Prototipado rápido de productos EdTech: la licencia Apache 2.0 y el tamaño del adaptador facilitan experimentar en entornos de investigación y desarrollo con requisitos de coste bajos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador en sí ocupa 0,7 GB en disco (safetensors), pero requiere cargar el modelo base Mistral-7B-Instruct-v0.3 completo para inferencia.
- VRAM estimada para inferencia en 4-bit: aproximadamente 5-6 GB para los pesos del base más overhead de contexto y activaciones; en 8-bit, en torno a 8-9 GB; en bfloat16/float16, aproximadamente 15-16 GB. Estas cifras son estimaciones basadas en el tamaño del modelo base y no están verificadas en la información proporcionada.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para inferencia en precisión completa o contextos largos; RTX 3090/4080 (16-24 GB) para 8-bit; RTX 3060 12 GB o superiores para 4-bit.
- Cabe en GPU de consumo: sí, en 4-bit en tarjetas con 8 GB o más (por ejemplo RTX 3060 12 GB, RTX 4060 Ti 16 GB) y en 8-bit en tarjetas de 12-16 GB.
- Opciones de despliegue: Unsloth (recomendado por el autor para carga rápida), HuggingFace Transformers con PEFT, vLLM con soporte de adaptadores LoRA, llama.cpp/Ollama si se fusiona el adaptador con el base y se convierte a GGUF, y TGI con adaptadores PEFT.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BharatLLM English 7B LoRA (este) | 7,4B base + 167,8M adaptador | No disponible (base Mistral v0.3) | K-12 CBSE/NCERT en inglés | Apache 2.0 | HuggingFace, 12 descargas |
| Mistral-7B-Instruct-v0.3 (base) | 7,4B | 32.768 tokens (según model card del base) | Generalista, multilingüe | Apache 2.0 | HuggingFace, ampliamente adoptado |
| BharatLLM Hindi 7B LoRA | 7,4B base + adaptador | No disponible | K-12 CBSE/NCERT en hindi | Apache 2.0 | HuggingFace (misma familia) |
| BharatLLM BTech 7B LoRA | 7,4B base + adaptador | No disponible | Ingeniería BTech en inglés | Apache 2.0 | HuggingFace (misma familia) |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estas variantes en la información proporcionada. La comparación se limita a parámetros, dominio, licencia y disponibilidad.

## Limitaciones y advertencias

- El adaptador está entrenado únicamente en inglés; no debe esperarse calidad en otras lenguas sin usar el adaptador correspondiente de la familia BharatLLM.
- El dominio es exclusivamente K-12 CBSE/NCERT: fuera de ese ámbito, el comportamiento puede degradarse respecto al modelo base, ya que el fine-tuning puede provocar olvido catastrófico parcial de capacidades generales.
- Riesgo de alucinación en contenido factual educativo (fechas, fórmulas, datos científicos); no se documenta ningún proceso de verificación o RLHF que lo mitigue.
- No hay benchmarks publicados ni evaluación independiente; el rendimiento real en tareas educativas es desconocido.
- El número de descargas (12) y de likes (0) es muy bajo, lo que sugiere escasa validación por parte de la comunidad.
- El repositorio se creó y actualizó en la misma fecha (2026-10-27), sin historial de revisiones que permita evaluar su madurez.
- La licencia Apache 2.0 permite uso comercial, pero se heredan las condiciones del modelo base Mistral-7B-Instruct-v0.3, que también es Apache 2.0; conviene verificar los términos vigentes del base antes de desplegar en producción.
- El autor del repositorio (`avinashreddy22`) difiere del indicado en la model card (`FoundryAILabs`); verificar la procedencia de los pesos antes de usarlos en entornos sensibles.
- No se documentan sesgos específicos del dataset curricular indio, pero es esperable que herede los del corpus NCERT/CBSE y los del modelo base.
- El contexto máximo efectivo del adaptador no está documentado; el entrenamiento se realizó con `max_seq_length=2048` según el ejemplo de la model card, lo que sugiere que no se aprovechó la ventana completa del base.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/avinashreddy22/bharat-english-7b-lora
- HuggingFace (referencia de la familia, según model card): https://huggingface.co/FoundryAILabs/bharat-english-7b-lora
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3
- Dataset de entrenamiento: https://huggingface.co/datasets/FoundryAILabs/k12-indian-curriculum-4.9m
- Repositorio GitHub del proyecto: https://github.com/foundryailabs/BharatLLM
- Sitio web del proyecto: https://foundryailabs.io
