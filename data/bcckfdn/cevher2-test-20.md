# bcckfdn/cevher2-test-20

## Resumen

cevher2-test-20 es un modelo de lenguaje de 1.514 millones de parámetros entrenado desde cero por el usuario bcckfdn, empleando la arquitectura de SmolLM2 (basada en Llama). El modelo está orientado a la generación de texto conversacional y declara soporte para turco (tr) e inglés (en). Su relevancia radica en ser un ejemplo de entrenamiento from scratch de un transformer tipo Llama a escala pequeña, con un contexto de 8.192 tokens y un vocabulario de 65.536 entradas.

La información publicada por el autor es muy limitada: se trata de un modelo de prueba (el identificador incluye "test") con cero descargas y cero likes en el momento de la consulta, creado y actualizado el mismo día. No se documentan detalles sobre la composición del dataset de entrenamiento, el proceso de alineación (RLHF/DPO) ni resultados de benchmarks.

A pesar de la escasez de documentación, la ficha recoge las especificaciones técnicas declaradas en la model card y en los metadatos de HuggingFace, así como las capacidades y limitaciones que se pueden inferir de su arquitectura y configuración. Cualquier dato no confirmado se marca explícitamente como no disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Llama (SmolLM2) |
| Parámetros totales | 1.513.546.496 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantización | No disponible (pesos en safetensors; compatible con cuantizaciones estándar de transformers/llama.cpp, no confirmado por el autor) |
| Idiomas soportados | Turco (tr), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura SmolLM2, un transformer decoder-only con 34 capas, dimensión oculta de 1.792 y 28 cabezas de atención para consultas con 7 cabezas para claves/valores (GQA con ratio 4:1). El vocabulario es de 65.536 tokens y la ventana de contexto alcanza los 8.192 tokens. El entrenamiento se realizó desde cero (pretrained-from-scratch) sobre 40.305 millones de tokens, según declara el autor, alcanzando una mejor pérdida de validación de 2,7292.

No se especifica la composición del corpus de entrenamiento, la proporción entre turco e inglés, ni si se aplicaron fases de instrucción, RLHF o DPO. Tampoco se detallan innovaciones técnicas adicionales como decodificación especulativa o atención lineal. La información disponible se limita a los hiperparámetros arquitectónicos y al volumen de tokens de entrenamiento.

## Capacidades

- Generación de texto autoregresiva en turco e inglés.
- Modelo base/conversacional según la etiqueta "conversational", aunque no se documenta el formato de prompt ni la plantilla de chat.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües limitadas a turco e inglés según la model card.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Generación de texto en turco para prototipos y experimentos de investigación: el modelo puede emplearse como base para probar pipelines de generación en un idioma con menor representación en modelos abiertos, aprovechando su vocabulario de 65.536 tokens.
- Fine-tuning supervisado para tareas concretas en turco: al ser un modelo pequeño (1,5B) y con licencia Apache 2.0, es adecuado como punto de partida para ajuste en dominios específicos con recursos limitados.
- Experimentación académica con arquitecturas Llama/SmolLM2: sirve para reproducir configuraciones de entrenamiento from scratch y comparar curvas de pérdida con otros modelos de escala similar.
- Generación de texto asistida en inglés para tareas de baja complejidad: resúmenes cortos, reescritura o completado de texto en entornos con restricciones de cómputo.
- Despliegue en entornos con GPU de gama media: su tamaño permite inferencia en GPUs consumer con cuantización, útil para demos y pruebas de concepto.
- Chat conversacional básico en turco: con el etiquetado "conversational", puede integrarse en prototipos de asistentes, aunque sin garantías documentadas de calidad conversacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 3 GB solo para pesos (1,51B parámetros × 2 bytes), más overhead de activaciones y caché KV para 8.192 tokens.
- VRAM estimada en cuantización de 8 bits: en torno a 1,5-2 GB para pesos.
- VRAM estimada en cuantización de 4 bits: en torno a 1 GB para pesos.
- GPU recomendadas: RTX 3060/4060 (12/8 GB), RTX 4090, A100 o H100 para mayor throughput; cabe holgadamente en GPUs consumer de gama media.
- Opciones de despliegue: transformers (confirmado por el autor), text-generation-inference (etiqueta endpoints_compatible), y potencialmente llama.cpp/Ollama/vLLM al ser arquitectura Llama, aunque no confirmado explícitamente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cevher2-test-20 | 1,51B | 8.192 | tr, en | Apache 2.0 | HuggingFace (0 descargas) |
| SmolLM2-1.7B | 1,7B | 8.192 (ampliable) | en (principalmente) | Apache 2.0 | HuggingFace, ampliamente adoptado |
| TinyLlama-1.1B | 1,1B | 2.048 | en (principalmente) | Apache 2.0 | HuggingFace, ampliamente adoptado |
| Qwen2.5-1.5B | 1,5B | 32.768 | multilingüe (incluye turco parcial) | Apache 2.0 | HuggingFace, ampliamente adoptado |

La comparación se basa en características arquitectónicas y de licencia; no hay datos de rendimiento publicados para cevher2-test-20 que permitan comparar calidad. Los modelos alternativos cuentan con benchmarks públicos y comunidades activas, mientras que cevher2-test-20 carece de validación externa.

## Limitaciones y advertencias

- Modelo de prueba: el identificador incluye "test" y no hay evidencia de validación por parte de la comunidad (0 descargas, 0 likes).
- Ausencia de benchmarks: no se puede evaluar su calidad frente a alternativas consolidadas.
- Documentación mínima: no se detalla la composición del dataset, el proceso de alineación ni la plantilla de chat, lo que dificulta su uso en producción.
- Riesgo de alucinación: inherente a modelos de lenguaje de esta escala, agravado por la falta de evaluación.
- Sesgos: no documentados; el corpus de entrenamiento no se especifica, por lo que pueden existir sesgos derivados de los datos en turco e inglés.
- Cobertura idiomática limitada a turco e inglés; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte.
- Fecha de creación futura (2026-11-04) en los metadatos, lo que puede indicar inconsistencias en el registro del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bcckfdn/cevher2-test-20
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
