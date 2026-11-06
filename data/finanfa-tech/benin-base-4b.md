# finanfa-tech/Benin-Base-4B

## Resumen

Benin-Base-4B es un modelo de lenguaje de 4.022 millones de parámetros desarrollado por finanfa-tech mediante entrenamiento continuado (continued pretraining) sobre Qwen/Qwen3-4B-Base. El modelo está especializado en francés y, según su nombre y etiquetas, orientado al contexto lingüístico de Benín, aunque la única información verificable en la ficha es el idioma declarado (fr) y el proceso de continued-pretraining. Se distribuye en formato safetensors bajo una licencia propia denominada benin-base-community-license-v1, con acceso restringido que requiere aceptar condiciones en Hugging Face.

La relevancia del modelo radica en su enfoque de adaptación lingüística: parte de una base Qwen3 de 4B y aplica un entrenamiento adicional para reforzar el francés y, presumiblemente, variantes locales. No obstante, la información pública disponible es muy limitada: no se detallan tokens de entrenamiento, composición del dataset, ni resultados de benchmarks. La fecha de creación indicada (2026-11-05) y el escaso número de descargas (11) sugieren un modelo reciente y de nicho.

Dado que hereda la arquitectura de Qwen3-4B-Base, se trata de un transformer decoder-only de 4B parámetros, pero los detalles específicos de contexto, cuantización y rendimiento no están publicados en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-4B-Base) |
| Parámetros totales | 4.022.468.096 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | fr (francés) |
| Licencia | benin-base-community-license-v1 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en Qwen/Qwen3-4B-Base, un transformer decoder-only de 4B parámetros. Sobre esta base, finanfa-tech ha realizado un proceso de continued pretraining (entrenamiento continuado) orientado al francés y, por el nombre del modelo, al contexto de Benín. No se especifican en la información disponible el número de tokens adicionales, la composición del dataset, ni si hubo fases de RLHF o DPO. Tampoco se documentan innovaciones técnicas propias más allá de la adaptación lingüística.

La única innovación declarada es el propio proceso de continued-pretraining sobre una base Qwen3, que presumiblemente busca mejorar la competencia en francés y en registros locales. No hay información sobre tokenizador modificado, vocabulario ampliado ni técnicas de decodificación especulativa.

## Capacidades

- Generación de texto en francés, heredando las capacidades generales de Qwen3-4B-Base.
- Razonamiento y conocimiento general, limitado por el tamaño de 4B parámetros.
- Capacidad multilingüe restringida al francés según la ficha (no se declaran otros idiomas).
- No se documenta soporte de tool calling ni function calling en la información disponible.
- No se documenta soporte de agentes ni multi-step reasoning explícito.
- No se documentan capacidades de visión, audio ni modo thinking.
- El modelo es de tipo base (no instruct), por lo que no está alineado para conversación directa sin fine-tuning adicional.

## Casos de uso

- Adaptación lingüística al francés de Benín: el modelo puede emplearse como base para fine-tuning en tareas de generación de texto en francés regional, aprovechando el continued pretraining sobre Qwen3-4B.
- Generación de contenido en francés: redacción de textos, resúmenes y paráfrasis en francés, adecuado por su especialización declarada en ese idioma.
- Investigación en continued pretraining: sirve como caso de estudio para analizar el efecto de adaptar un modelo base multilingüe a un dominio lingüístico concreto.
- Base para fine-tuning supervisado: al ser un modelo base, es punto de partida para SFT en tareas específicas (clasificación, extracción, diálogo) en francés.
- Prototipado de asistentes en francés: con un fine-tuning posterior, podría emplearse en chatbots de dominio limitado, aunque su tamaño de 4B limita el razonamiento complejo.
- Evaluación comparativa de adaptaciones regionales: útil para medir degradación o mejora respecto a Qwen3-4B-Base en benchmarks en francés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 8 GB solo para pesos, más overhead de activaciones y KV cache (estimación típica para 4B, no confirmada por el autor).
- VRAM estimada en cuantización 8-bit: alrededor de 4-5 GB; en 4-bit: alrededor de 2,5-3 GB (estimaciones generales para 4B, no verificadas para este modelo).
- GPU recomendadas: A100, H100 para despliegue en fp16 con contexto largo; RTX 4090, RTX 3090 para fp16 en contexto moderado; RTX 4060 Ti 16 GB o superiores para cuantización 8-bit.
- Cabe en GPU de consumo: sí, en modelos con 8 GB o más en cuantización 8-bit o 4-bit, aunque no hay confirmación oficial.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag endpoints_compatible), potencialmente vLLM y llama.cpp si se generan pesos GGUF (no disponibles en el repo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Benin-Base-4B | 4.022 M | no disponible | benin-base-community-license-v1 | Gated en Hugging Face |
| Qwen/Qwen3-4B-Base | 4B (aprox.) | no disponible en esta ficha | Apache 2.0 (según Qwen) | Público |
| Otros modelos 4B en francés | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo ni de otros modelos comparables documentados en la información proporcionada.

## Limitaciones y advertencias

- Acceso restringido: requiere aceptar condiciones en Hugging Face, lo que limita su uso inmediato y su reproducibilidad.
- Licencia propia (benin-base-community-license-v1): no es una licencia estándar; es necesario revisar los términos para uso comercial, que no se detallan en la información disponible.
- Modelo base no alineado: no está entrenado para seguir instrucciones ni para conversación; puede generar contenido incoherente o inapropiado sin fine-tuning.
- Idiomas limitados: solo se declara francés; el rendimiento en otros idiomas no está garantizado y podría degradarse respecto a Qwen3-4B-Base.
- Riesgo de alucinación: inherente a modelos de 4B sin alineación; no se documentan mitigaciones.
- Sesgos: no se documentan evaluaciones de sesgo; el continued pretraining sobre datos regionales podría introducir sesgos específicos no caracterizados.
- Falta de transparencia: no se publican tokens de entrenamiento, composición del dataset ni benchmarks, lo que dificulta evaluar su calidad.
- Fecha de creación futura (2026-11-05): dato atípico que puede indicar error en la ficha o naturaleza experimental del modelo.

## Enlaces

- Hugging Face: https://huggingface.co/finanfa-tech/Benin-Base-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Base
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.
