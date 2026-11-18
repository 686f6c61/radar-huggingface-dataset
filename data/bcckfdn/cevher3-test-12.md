# bcckfdn/cevher3-test-12

## Resumen

cevher3-test-12 es un modelo de lenguaje de 1.256.312.832 parámetros publicado por el usuario bcckfdn en Hugging Face bajo licencia Apache 2.0. Se presenta como un modelo basado en la arquitectura Gemma 3 con atención de ventana deslizante (SWA, sliding window attention), entrenado específicamente para turco e inglés con un enfoque conversacional. El modelo se distribuye en formato safetensors y es compatible con la librería transformers y con text-generation-inference.

El modelo resuelve el caso de uso de generación de texto conversacional en turco e inglés con un tamaño compacto (1,25 mil millones de parámetros), lo que permite su despliegue en hardware modesto. La model card declara 34 capas, dimensión oculta de 1792, 28 cabezas de atención para consultas y 4 para claves/valores, un vocabulario de 65.536 tokens y una ventana de contexto de 8192 tokens.

Es relevante ahora por su carácter de prueba técnica (el sufijo "test-12" sugiere un experimento de entrenamiento) dentro del ecosistema Gemma 3 en turco, un idioma con menos cobertura en modelos abiertos. Aun así, el modelo no registra descargas ni interacciones en el momento de la consulta, por lo que debe considerarse un artefacto de investigación más que un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con atención de ventana deslizante (Gemma3-SWA) |
| Parametros totales | 1.256.312.832 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | no disponible (repo solo con safetensors en precisión original) |
| Idiomas soportados | turco (tr), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Capas | 34 |
| Dimension oculta | 1792 |
| Cabezas de atencion (Q/KV) | 28 / 4 |
| Vocabulario | 65.536 tokens |
| Tokens de entrenamiento | 23.593 B (según model card) |
| Mejor val loss | 2.8047 (según model card) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Gemma 3 con atención de ventana deslizante (SWA), un transformer decoder-only de 34 capas con dimensión oculta de 1792. La configuración de atención combina 28 cabezas de consulta con 4 cabezas de clave/valor (agrupación de cabezas), lo que reduce el coste de memoria del KV cache durante la inferencia. La ventana de contexto es de 8192 tokens y el vocabulario de 65.536 entradas.

Según la model card, el entrenamiento utilizó 23.593 B de tokens (presumiblemente miles de millones, aunque la unidad no se especifica con claridad) y alcanzó una mejor pérdida de validación de 2,8047. No se detalla la composición del dataset, el uso de RLHF o DPO, ni innovaciones adicionales como decodificación especulativa. La model card no aporta información sobre la mezcla de idiomas ni sobre el proceso de alineación.

## Capacidades

- Generación de texto en turco e inglés, orientada a conversación multi-turno.
- Razonamiento básico y respuesta a instrucciones, derivado del formato conversacional declarado.
- Capacidad multilingüe limitada a los dos idiomas indicados (tr, en).
- Compatibilidad con text-generation-inference y endpoints compatibles.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Chat conversacional en turco: el modelo puede mantener conversaciones multi-turno dentro de su ventana de 8192 tokens, adecuado para asistentes de atención al cliente en turco donde los modelos abiertos escasean.
- Generación de contenido editorial en turco: redacción de borradores, resúmenes o respuestas a correos, aprovechando su entrenamiento específico en el idioma.
- Prototipado rápido de aplicaciones NLP en turco: su tamaño de 1,25 B permite iterar en entornos de desarrollo con una sola GPU consumer.
- Clasificación y extracción de información ligera: al ser un modelo pequeño, puede usarse para tareas de etiquetado o extracción en pipelines de bajo coste.
- Traducción asistida turco-inglés: aunque no se declara como modelo de traducción, su bilingüismo permite generar borradores que un revisor humano posterior corrija.
- Investigación académica sobre modelos Gemma en lenguas de bajos recursos: sirve como referencia para experimentos de ajuste fino y evaluación en turco.
- Despliegue en entornos con recursos limitados: con cuantización a 8 o 4 bits (no publicada en el repo, pero viable por su tamaño) podría ejecutarse en GPUs de 8-16 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta la mejor pérdida de validación (2,8047) y el volumen de tokens de entrenamiento (23.593 B), sin métricas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 2,5 GB para los pesos, más el KV cache (con contexto de 8192 y 4 cabezas KV, el cache es reducido).
- En cuantización a 8 bits: en torno a 1,3 GB de pesos; a 4 bits: en torno a 0,7 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16; RTX 3060, RTX 4060, RTX 4090, A100 o H100 para mayor throughput.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas modernas (RTX 2060 en adelante) gracias a su tamaño de 1,25 B.
- Opciones de despliegue: transformers, text-generation-inference (TGI) y endpoints compatibles; llama.cpp u Ollama requerirían conversión a GGUF, no disponible en el repo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cevher3-test-12 | 1,256 B | 8192 | tr, en | Apache 2.0 | Hugging Face (0 descargas) |
| Gemma 3 1B (Google) | ~1 B | 32 K (aprox.) | multilingüe | Gemma Terms | Hugging Face |
| Qwen2.5-1.5B | 1,5 B | 32 K | multilingüe | Apache 2.0 | Hugging Face |
| Llama 3.2 1B | 1,2 B | 128 K | multilingüe | Llama 3.2 Community License | Hugging Face |

No se dispone de datos de rendimiento comparativo para cevher3-test-12, por lo que la comparación se limita a parámetros, contexto, licencia y disponibilidad. El modelo destaca por su licencia Apache 2.0 permisiva y su especialización en turco, pero carece de benchmarks públicos y de tracción en la comunidad.

## Limitaciones y advertencias

- Modelo experimental: el sufijo "test-12" y la ausencia de descargas o likes sugieren que no ha sido validado por la comunidad.
- Sin benchmarks publicados: no hay evidencia objetiva de su calidad frente a modelos establecidos.
- Riesgo de alucinación: no se documenta ningún proceso de alineación (RLHF/DPO) que lo mitigue.
- Sesgos desconocidos: no se detalla la composición del dataset ni posibles sesgos de género, etnia o idioma.
- Cobertura limitada a turco e inglés; no se garantiza comportamiento correcto en otros idiomas.
- Contexto de 8192 tokens, inferior al de alternativas contemporáneas (32 K o más).
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte.
- No se documenta tool calling ni capacidades de agente, por lo que no es adecuado para pipelines que requieran function calling nativo.
- El volumen de entrenamiento (23.593 B) es ambiguo en la model card; conviene verificar su escala antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bcckfdn/cevher3-test-12
- Repositorio de Gemma 3 (arquitectura base): https://huggingface.co/google/gemma-3-1b-it
- Documentación de transformers: https://huggingface.co/docs/transformers
- Documentación de text-generation-inference: https://huggingface.co/docs/text-generation-inference
