# mrysh/gemma-4-e4b-it-nvfp4

## Resumen

`mrysh/gemma-4-e4b-it-nvfp4` es una versión cuantizada a NVFP4 del modelo multimodal `google/gemma-4-E4B-it` de Google DeepMind, publicada por el usuario mrysh. La cuantización se ha realizado con NVIDIA ModelOpt 0.47.0 sobre 512 muestras de calibración mixtas, empleando formato NVFP4 (coma flotante de 4 bits de NVIDIA) con tamaño de grupo 16. El resultado es un checkpoint de 9,8 GB que conserva las partes de visión y audio en 16 bits.

El modelo base pertenece a la familia Gemma 4 en su variante E4B "instruction-tuned", con 5.800.432.970 parámetros totales según los pesos safetensors del repositorio. La relevancia de esta publicación es fundamentalmente práctica: permite servir el modelo en vLLM con un consumo de memoria notablemente inferior al de los pesos en BF16, a cambio de requerir hardware Blackwell (por ejemplo, RTX PRO 6000 o B200) para aprovechar las ventajas de velocidad del formato NVFP4.

No se trata de un modelo nuevo ni de un fine-tuning: es un artefacto de cuantización orientado a un benchmark interno del autor (4 modelos x 8 técnicas, evaluados con vLLM sobre BFCL, Energy-QA, sesgo de contratación y MedQA). La model card no publica resultados numéricos de esas evaluaciones, por lo que el rendimiento real frente al modelo original no está documentado en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer del modelo base Gemma 4 E4B (detalles no disponibles en la informacion proporcionada) |
| Parametros totales | 5.800.432.970 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (4 bits, group size 16); vision y audio en 16 bits |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (cuantizados con nvidia-modelopt 0.47.0) |

## Arquitectura y entrenamiento

El repositorio no entrena un modelo desde cero: aplica cuantización post-entrenamiento (PTQ) con NVIDIA ModelOpt 0.47.0 sobre `google/gemma-4-E4B-it`. El esquema NVFP4 usa bloques de 16 elementos con escala compartida en coma flotante, lo que reduce el error de cuantización respecto a esquemas INT4 por canal y permite mantener una precisión razonable en pesos de 4 bits. La calibración se hizo con 512 muestras mixtas, un tamaño moderado que puede afectar a la fidelidad en dominios poco representados en ese conjunto.

Las capas de visión y audio se mantienen en 16 bits, de modo que el modelo conserva (en principio) sus capacidades multimodales, aunque la model card indica que las evaluaciones se realizaron como modelo de texto con el modo "thinking" desactivado. No se documentan en la información disponible detalles sobre la arquitectura interna del modelo base (número de capas, atención, posibles componentes MoE o SSM), los datos de entrenamiento originales ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento conversacional, heredados del modelo base instruction-tuned.
- Capacidades multimodales (visión y audio) preservadas en 16 bits según la model card, aunque no evaluadas en esta versión.
- Modo "thinking" presente en el modelo base, desactivado en las evaluaciones del autor.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible.
- Capacidades de agente y razonamiento multi-paso: no documentadas en esta ficha.
- Cobertura multilingüe: no disponible.

## Casos de uso

- Despliegue de inferencia económica en vLLM: el checkpoint se carga directamente con `vllm serve <repo>` y reduce la huella de memoria frente a BF16, lo que permite servir el modelo en GPUs Blackwell con menos VRAM por instancia.
- Evaluación comparativa de técnicas de cuantización: el autor lo publica como parte de un benchmark de 4 modelos x 8 técnicas, por lo que es útil como referencia reproducible para medir el impacto de NVFP4 en tareas como BFCL o MedQA.
- Prototipado de asistentes multimodales en entornos con restricciones de memoria: al mantener visión y audio en 16 bits, sirve para experimentar con entradas de imagen o audio sin cargar los pesos completos en precisión nativa.
- Investigación sobre sesgo en selección de personal: el benchmark del autor incluye una prueba de sesgo de contratación, de modo que el modelo puede usarse como sujeto de estudio en ese tipo de evaluaciones.
- Servicio de preguntas y respuestas sobre dominios técnicos (por ejemplo, energía, dado el uso de Energy-QA en el benchmark) en pipelines de vLLM con throughput moderado.
- Base para comparativas de latencia y precisión en hardware Blackwell: útil para equipos que evalúan si NVFP4 es viable en su infraestructura antes de adoptarlo en producción.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card menciona que el modelo se evaluó con vLLM (thinking off) sobre BFCL, Energy-QA, sesgo de contratación y MedQA como parte de un benchmark de cuantización, pero no incluye las puntuaciones obtenidas.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo ocupa 9,8 GB en disco; en vLLM se necesita además memoria para el KV cache y overhead del runtime, por lo que se recomienda al menos 16-24 GB de VRAM para contextos moderados (estimación, no dato publicado).
- GPU recomendadas: NVIDIA Blackwell (RTX PRO 6000, B200) para aprovechar las ventajas de velocidad de NVFP4, según la model card.
- En GPUs no Blackwell el modelo puede cargarse, pero no se garantiza la aceleración del formato; no hay datos publicados de rendimiento en Ampere, Ada o Hopper.
- Despliegue: vLLM (`vllm serve <repo>`); no se documenta soporte en llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| mrysh/gemma-4-e4b-it-nvfp4 | 5.800.432.970 | no disponible | NVFP4 (4 bits) | Apache 2.0 | Requiere Blackwell para aceleración |
| google/gemma-4-E4B-it (base) | no disponible en esta ficha | no disponible | BF16 nativo | Apache 2.0 (segun repo derivado) | Referencia de precisión completa |
| Otras variantes cuantizadas del mismo base | no disponible | no disponible | no disponible | no disponible | No identificadas en la informacion proporcionada |

## Limitaciones y advertencias

- La cuantización a 4 bits introduce degradación de precisión respecto al modelo base; no se publican métricas que cuantifiquen esa pérdida.
- La calibración con solo 512 muestras mixtas puede no representar bien dominios especializados, lo que aumenta el riesgo de degradación fuera de la distribución de calibración.
- La aceleración de NVFP4 requiere hardware Blackwell; en otras GPUs el beneficio es incierto y no está documentado.
- Las capacidades de visión y audio se conservan en 16 bits, pero no han sido evaluadas en esta versión según la model card.
- Riesgo de alucinación y sesgos heredados del modelo base; no se documentan análisis específicos para esta cuantización.
- La licencia Apache 2.0 se aplica al artefacto, pero conviene verificar las condiciones del modelo base de Google antes de uso comercial.
- Repositorio con muy poca tracción (16 descargas, 0 likes) y sin pipeline declarado; no hay garantía de mantenimiento ni soporte.
- No se documentan idiomas soportados ni longitud de contexto en la información disponible.

## Enlaces

- HuggingFace: https://huggingface.co/mrysh/gemma-4-e4b-it-nvfp4
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
