# Malte0621/Swift-1.5-Qwen3.8-27B-Uncensored-ML1

## Resumen

Swift-1.5-Qwen3.8-27B-Uncensored-ML1 es una distribución de pesos cuantizados del modelo Swift-1.5-Qwen3.8-27B-Uncensored-MTP, un modelo de lenguaje de aproximadamente 27.000 millones de parámetros derivado de la familia Qwen y sometido a un proceso de poda ("pruning") de unos 600 millones de parámetros. Lo publica el usuario Malte0621 en Hugging Face y su interés principal reside en la técnica de compresión empleada: una combinación experimental de NanoQuant (NQ) y TernaryQuant (TQ) aplicada mediante la herramienta propietaria MLLama, que permite reducir el modelo hasta rangos de 1 bit manteniendo, según el autor, una calidad aceptable.

El modelo está etiquetado como "uncensored", lo que indica que se ha eliminado o reducido el alineamiento de seguridad respecto al modelo original, y se distribuye únicamente en inglés. La model card es escasa en detalles sobre arquitectura, datos de entrenamiento y evaluación formal: no se publican resultados de benchmarks estándar ni información sobre el contexto máximo o el tokenizador.

La relevancia de esta ficha es doble. Por un lado, documenta una técnica de cuantización agresiva (hasta 1 bit) aplicada a un modelo de 27B, un territorio poco explorado fuera de laboratorios. Por otro, advierte de las limitaciones de un artefacto con licencia "other", sin benchmarks publicados y con un proceso de alineamiento desconocido, lo que exige cautela antes de cualquier uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen; detalles específicos no disponibles) |
| Parámetros totales | 27.320.697.856 (~27B) |
| Parámetros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | TQ (TernaryQuant) y NQ (NanoQuant), con rangos desde ~1 bit hasta ~3,85 bpw; también se menciona un quant "Q?bpw" sin determinar |
| Idiomas soportados | Inglés (en) |
| Licencia | other (términos no especificados en la model card) |
| Formato de pesos | `.ml1` (formato propietario de la herramienta MLLama); no se indica conversión a safetensors ni GGUF |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de su origen en la familia Qwen y de la etiqueta `mllama`/`multillama` en los tags, que hace referencia a la herramienta de compresión y no a la arquitectura multimodal Llama. El modelo parte de `ajgazin/Swift-1.5-Qwen3.8-27B-Uncensored-MTP`, del que no se documentan en esta ficha ni el número de tokens de entrenamiento, ni la composición del dataset, ni si hubo RLHF, DPO u otra fase de alineamiento.

El proceso técnico destacable es la combinación de poda inteligente y cuantización. La poda reduce el modelo de 27.320.697.856 a 26.720.060.416 parámetros (unos 600 millones menos) y, según el autor, también fusiona pesos y ajusta el modelo para minimizar la pérdida de calidad. Sobre el modelo podado se aplican TQ y NQ, generados con los comandos `prune` y `quantize` de MLLama desde un notebook. El dataset de calibración es `wiki.txt` (10,9 MB) y la conversión completa tardó unas 6 horas en una única instancia cloud con RTX 6000 PRO. El autor reporta una KLD de ~0,002 en el rango de 3 bits y de ~0,1 en el rango de 1 bit, valores que no se acompañan de una evaluación aguas abajo (MMLU, HumanEval, etc.).

## Capacidades

- Generación de texto en inglés, heredada del modelo base Qwen.
- Razonamiento y conversación multi-turno (sin datos cuantitativos publicados).
- Codificación agéntica: la model card menciona explícitamente que los quants de menor rango pierden calidad en "agentic coding", lo que implica que los de mayor rango la conservan.
- Modo "uncensored": ausencia declarada de filtros de seguridad, lo que amplía el rango de respuestas pero elimina salvaguardas.
- No se documenta soporte de tool calling, function calling, visión, audio ni modo "thinking".
- Capacidades multilingües limitadas al inglés según el campo `language`.

## Casos de uso

- Experimentación con cuantización extrema: el modelo sirve como banco de pruebas para estudiar la degradación de calidad al pasar de 3,85 bpw a ~1 bit en un modelo de 27B, comparando la KLD reportada con evaluaciones propias.
- Inferencia en GPU de consumo con 24 GB: la variante de mayor fidelidad está pensada para caber en GPUs de 24 GB o más, lo que permite ejecutar un modelo de 27B en una RTX 4090 o similar.
- Despliegue en equipos con 16 GB de VRAM: la variante de 12,9 GB (Q3,85bpw) permite ejecutar el modelo en GPUs de gama media-alta con calidad "alta fidelidad" según el autor.
- Pruebas en entornos con 8 GB de VRAM: la variante de 6,4 GB permite experimentar con el modelo en portátiles con GPU modesta, aceptando peor rendimiento en tareas agénticas de código.
- Investigación sobre alineamiento y seguridad: al ser "uncensored", es útil para estudiar el comportamiento de modelos sin filtros y para calibrar clasificadores de seguridad propios.
- Generación de texto creativo y conversacional en inglés: uso directo como chatbot o asistente de redacción, siempre que se acepte la licencia y las limitaciones de calidad de los quants bajos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato cuantitativo es la divergencia KL (KLD) reportada por el autor: ~0,002 en el rango de 3 bits y ~0,1 en el rango de 1 bit, sin especificar la métrica exacta, el conjunto de evaluación ni la comparación con el modelo sin cuantizar.

## Requisitos de hardware

- VRAM estimada: ~4 GB para el quant de menor rango, ~8 GB para el de 6,4 GB, ~16 GB para el de 12,9 GB y 24 GB o más para el de mayor fidelidad (según la model card).
- GPUs recomendadas: RTX 4090 (24 GB) para el quant de mayor fidelidad; RTX 4080/4070 Ti (16 GB) para el de 12,9 GB; RTX 3060/4060 (8 GB) para el de 6,4 GB; GPUs de 4 GB para el de menor rango.
- Cabe en GPU de consumo: sí, en todas las variantes indicadas, según el autor.
- Opciones de despliegue: el formato `.ml1` es propietario de MLLama y la herramienta no es open source ("not yet open-source"), por lo que no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI. La conversión a safetensors o GGUF no está confirmada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Swift-1.5-Qwen3.8-27B-Uncensored-ML1 | ~27B (26,72B tras poda) | No disponible | TQ/NQ hasta ~1 bit, formato .ml1 | other | Hugging Face, 0 descargas |
| Modelo base: Swift-1.5-Qwen3.8-27B-Uncensored-MTP | ~27B | No disponible | No disponible | No disponible | Hugging Face |
| Alternativas de ~27B con cuantización GGUF/AWQ | ~27B | Variable | GGUF, AWQ, GPTQ | Variable | Amplia disponibilidad |

No se dispone de datos de rendimiento del modelo ni de sus alternativas en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia independiente de la calidad del modelo frente a su base.
- Licencia "other" sin términos detallados: el uso comercial queda en un limbo legal hasta que el autor publique condiciones explícitas.
- Modelo "uncensored": sin filtros de seguridad, lo que implica riesgo de generar contenido dañino, ilegal o sesgado y complica su uso en productos orientados al público.
- Formato propietario `.ml1`: la herramienta MLLama no es open source, lo que dificulta la auditoría, la portabilidad y la integración en pipelines estándar.
- Solo inglés: no apto para aplicaciones en castellano u otros idiomas sin evaluación previa.
- Contexto desconocido: no se puede planificar su uso en tareas de contexto largo.
- Dataset de calibración mínimo (`wiki.txt`, 10,9 MB): la calibración puede no representar dominios especializados como código o matemáticas.
- Riesgo de alucinación y sesgos: no evaluado; al no haber alineamiento declarado, se espera un comportamiento menos controlado que el de modelos alineados.
- Artefacto con 0 descargas y 0 likes: sin validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Malte0621/Swift-1.5-Qwen3.8-27B-Uncensored-ML1
- Modelo base: https://huggingface.co/ajgazin/Swift-1.5-Qwen3.8-27B-Uncensored-MTP
- Herramienta MLLama: descargas "coming soon" según la model card; no se proporciona URL.
