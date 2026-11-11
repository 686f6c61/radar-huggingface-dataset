# Counfield/Betelgeuse-2-27B

## Resumen

Betelgeuse-2-27B es un modelo de lenguaje publicado en Hugging Face por el usuario Counfield bajo licencia Apache 2.0. Por el identificador se deduce que se trata de un modelo de 27.000 millones de parámetros, presumiblemente una segunda iteración de una familia previa denominada Betelgeuse. El repositorio se creó y actualizó el 5 de noviembre de 2026 y, en el momento de redactar esta ficha, no registra descargas ni interacciones.

La información pública disponible es mínima: la model card únicamente declara la licencia Apache 2.0, sin especificar arquitectura, datos de entrenamiento, longitud de contexto, idiomas soportados ni resultados de evaluación. Tampoco se indica el pipeline de inferencia ni el formato de los pesos. Cualquier dato técnico adicional debe considerarse no disponible a partir de las fuentes consultadas.

A pesar de la escasez de documentación, el modelo resulta relevante por dos motivos: su tamaño (27B) lo sitúa en la franja de modelos de gama alta que pueden desplegarse en una sola GPU de 80 GB con cuantización, y su licencia Apache 2.0 permite uso comercial sin restricciones adicionales, algo poco habitual en modelos de esta escala. No obstante, la ausencia de benchmarks y de documentación técnica hace imprescindible una evaluación empírica antes de considerarlo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 27B (inferido del nombre del modelo) |
| Parametros activos | no disponible (no se confirma que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo en la documentación disponible. El nombre sugiere un transformer de 27.000 millones de parámetros, pero no se confirma si emplea atención estándar, atención lineal, arquitectura híbrida o mezcla de expertos. Tampoco se especifica el número de capas, dimensiones ocultas, número de cabezas de atención ni el tokenizador utilizado.

Respecto al entrenamiento, la model card no detalla el volumen de tokens, la composición del corpus, la existencia de fases de ajuste supervisado, RLHF o DPO, ni si se aplicaron técnicas de destilación o decodificación especulativa. Toda esta información debe considerarse no disponible.

## Capacidades

- Generación de texto: capacidad esperable en un modelo de 27B, aunque no verificada empíricamente por falta de documentación.
- Razonamiento y matemáticas: no disponible.
- Generación de código: no disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se declara ningún idioma en la model card.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Evaluación comparativa interna: dado que no hay benchmarks publicados, un equipo puede desplegar el modelo en su infraestructura y ejecutar sus propias baterías de evaluación (MMLU, HumanEval, GSM8K) para determinar si compite con alternativas de tamaño similar antes de adoptarlo.
- Prototipado rápido con licencia permisiva: la licencia Apache 2.0 permite integrar el modelo en productos comerciales sin obligaciones de atribución complejas, lo que lo hace adecuado para pruebas de concepto en entornos corporativos.
- Fine-tuning específico de dominio: al ser un modelo de 27B con licencia permisiva, puede servir como base para ajuste fino supervisado en dominios verticales (legal, sanitario, financiero) siempre que se valide previamente su calidad base.
- Generación de texto en pipelines internos: tareas de resumen, reescritura o clasificación de documentos pueden implementarse sobre el modelo, aunque será necesario medir latencia y throughput reales en el hardware objetivo.
- Investigación académica sobre modelos de escala media: el tamaño de 27B permite experimentar con técnicas de cuantización, decodificación especulativa o evaluación de sesgos en una sola GPU de 80 GB.
- Despliegue en entornos con requisitos de licencia estrictos: organizaciones que descartan licencias con cláusulas de uso aceptable restrictivas pueden considerar este modelo como candidato, sujeto a verificación de que los pesos realmente se publican bajo Apache 2.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa para un modelo denso de 27B, en FP16 se requerirían aproximadamente 54 GB de pesos más overhead de activaciones y caché KV; en cuantización de 8 bits, unos 27 GB; en 4 bits, unos 14 GB. Estas cifras son estimaciones genéricas y no han sido verificadas para este modelo concreto.
- GPU recomendadas: no disponible. Por tamaño, un modelo de 27B en FP16 encajaría en A100 80 GB o H100 80 GB; en cuantizaciones bajas podría ejecutarse en RTX 4090 (24 GB) o RTX A6000 (48 GB).
- ¿Cabe en GPU de consumo? No confirmado. Dependerá de la cuantización disponible, que no se ha publicado.
- Opciones de despliegue: no disponible. No se indica compatibilidad con vLLM, llama.cpp, Ollama, TGI ni Transformers.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Benchmark publicado | Disponibilidad |
|---|---|---|---|---|---|
| Betelgeuse-2-27B | 27B (inferido) | no disponible | Apache 2.0 | no | Hugging Face, sin descargas |
| Gemma 2 27B | 27B | 8K | Gemma License | sí | Hugging Face, ampliamente adoptado |
| Mistral Small 24B | 24B | 32K | Apache 2.0 | sí | Hugging Face, ampliamente adoptado |
| Qwen2.5 32B | 32B | 128K | Apache 2.0 (mayoría de variantes) | sí | Hugging Face, ampliamente adoptado |

La comparativa se ofrece únicamente como referencia de categoría; no se dispone de datos de rendimiento de Betelgeuse-2-27B que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Ausencia total de documentación técnica: no se especifican arquitectura, datos de entrenamiento, tokenizador ni contexto, lo que impide evaluar su idoneidad sin pruebas empíricas.
- Sin benchmarks publicados: no hay evidencia de calidad en tareas estándar (razonamiento, código, matemáticas, multilingüismo).
- Idiomas no declarados: se desconoce si el modelo está entrenado principalmente en inglés, en múltiples idiomas o en otro idioma; el rendimiento en castellano es una incógnita.
- Riesgo de alucinación: no cuantificado; sin evaluación, debe asumirse un riesgo estándar para modelos de esta escala y aplicarse salvaguardas en producción.
- Sesgos conocidos: no documentados; la ausencia de una model card detallada impide conocer la composición del corpus y los sesgos potenciales.
- Licencia: Apache 2.0 permite uso comercial, pero debe verificarse que los pesos publicados cumplen efectivamente esa licencia y que no incorporan materiales con restricciones adicionales.
- Repositorio sin actividad: cero descargas y cero likes en el momento de la consulta, lo que sugiere falta de validación por parte de la comunidad.
- Fecha de creación futura respecto a la mayoría de modelos de referencia: conviene confirmar la integridad de los archivos antes de su descarga.

## Enlaces

- Hugging Face: https://huggingface.co/Counfield/Betelgeuse-2-27B
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información disponible.
