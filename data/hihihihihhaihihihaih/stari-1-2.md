# HIHIHIHIHhaihihihaih/stari-1.2

## Resumen

stari-1.2 es un ajuste fino (fine-tuning) del modelo Qwen3-4B, publicado por el usuario HIHIHIHIHhaihihihaih en Hugging Face. El modelo parte de la versión cuantizada en 4 bits de Unsloth (`unsloth/Qwen3-4B-unsloth-bnb-4bit`) y se ha entrenado con la librería Unsloth junto con TRL de Hugging Face, lo que según el autor permite un entrenamiento "2x más rápido". Se trata, por tanto, de un derivado de la familia Qwen3 de Alibaba, con 4.022.468.096 parámetros totales confirmados en los pesos safetensors.

La relevancia de esta ficha es limitada: el modelo no cuenta con descargas ni interacciones en el momento de la consulta, la model card es prácticamente un esqueleto generado por la plantilla de Unsloth y no se documenta el dataset de ajuste fino, el propósito concreto del entrenamiento ni los resultados obtenidos. La información disponible permite caracterizar la arquitectura heredada de Qwen3-4B y la licencia Apache 2.0, pero no las capacidades específicas añadidas o modificadas por el ajuste.

Por la información disponible, se trata de un modelo de generación de texto en inglés, con arquitectura transformer densa de 4B parámetros, publicado en formato safetensors y compatible con text-generation-inference y transformers. Cualquier evaluación de su calidad real requeriría pruebas propias, dado que no se han publicado benchmarks ni detalles del proceso de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-4B) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-4B, no confirmada en la model card) |
| Tipos de cuantizacion | no disponible (el modelo base de partida estaba en bnb-4bit; los pesos publicados son safetensors) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint `unsloth/Qwen3-4B-unsloth-bnb-4bit`, que a su vez es una versión cuantizada en 4 bits (bitsandbytes) del Qwen3-4B original de Alibaba. La arquitectura subyacente es, por tanto, la de Qwen3-4B: un transformer denso de aproximadamente 4.000 millones de parámetros. La model card no detalla la composición del dataset de ajuste fino, el número de tokens de entrenamiento, la técnica de alineación (RLHF, DPO, SFT) ni hiperparámetros utilizados.

El único detalle técnico documentado es el uso de Unsloth y TRL de Hugging Face para el entrenamiento, lo que el autor presenta como una ventaja de velocidad ("2x faster"). No se especifica si el ajuste fino se realizó con QLoRA sobre el checkpoint cuantizado o si se desquantizó previamente, ni si se aplicaron técnicas adicionales como decodificación especulativa o atención lineal. Tampoco se indica la longitud de contexto efectiva tras el ajuste.

## Capacidades

- Generación de texto conversacional en inglés, heredada de la familia Qwen3.
- Razonamiento y matemáticas: capacidades propias de Qwen3-4B, no verificadas tras el ajuste fino.
- Generación de código: capacidad esperable por herencia del modelo base, no documentada en la model card.
- Tool calling / function calling: no documentado para este ajuste concreto.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: la model card declara únicamente inglés (`en`), aunque Qwen3-4B original soporta más idiomas.
- Capacidades especiales (modo thinking, visión, audio): no documentadas para este ajuste.

## Casos de uso

- Prototipado de asistentes conversacionales en inglés: el modelo puede integrarse en pipelines de `text-generation` de transformers o TGI para experimentar con un ajuste fino ligero de 4B parámetros, adecuado para entornos de desarrollo con recursos limitados.
- Experimentación académica con fine-tuning: sirve como ejemplo reproducible de ajuste fino con Unsloth y TRL sobre un checkpoint cuantizado en 4 bits, útil para estudiar el impacto del QLoRA en modelos de 4B.
- Generación de texto en inglés con requisitos de licencia permisiva: al estar bajo Apache 2.0, puede incorporarse en productos comerciales sin las restricciones de otras licencias, siempre que se validen sus salidas.
- Despliegue en hardware de consumo: con 4B parámetros y pesos safetensors de 8,1 GB, es viable en GPUs consumer para inferencia en cuantización adicional (GGUF/AWQ), aunque dichos formatos no se publican en el repo.
- Base para nuevos ajustes finos: al ser un derivado de Qwen3-4B con licencia Apache 2.0, puede reutilizarse como punto de partida para especializaciones adicionales con Unsloth.
- Evaluación comparativa de ajustes finos comunitarios: útil como caso de estudio de la calidad y trazabilidad de checkpoints publicados sin model card detallada, para calibrar expectativas antes de adoptarlos en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 8-9 GB solo para pesos, más overhead de activaciones y KV cache (típicamente 10-12 GB en total para contextos moderados).
- VRAM estimada en cuantización 8 bits: en torno a 4-5 GB para pesos.
- VRAM estimada en cuantización 4 bits (GGUF/AWQ): en torno a 2,5-3 GB para pesos, aunque estos formatos no se publican en el repositorio.
- GPU recomendadas: NVIDIA A100, H100 o L40S para despliegue en producción con TGI o vLLM; RTX 4090, RTX 3090 o RTX 4080 para inferencia local en FP16.
- GPU de consumo: cabe en GPUs consumer con 12 GB o más de VRAM en FP16; en 8 GB requiere cuantización adicional no incluida en el repo.
- Opciones de despliegue: transformers, text-generation-inference (tag declarado), vLLM (compatible con safetensors de Qwen3), llama.cpp/Ollama solo si se generan conversiones GGUF propias.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| stari-1.2 | 4,02B | no disponible | Apache 2.0 | Hugging Face (0 descargas) | Ajuste fino comunitario de Qwen3-4B sin documentación de entrenamiento |
| Qwen3-4B (Alibaba) | ~4B | no disponible en esta ficha | Apache 2.0 | Hugging Face, ampliamente distribuido | Modelo base original, con model card completa y benchmarks publicados por el autor |
| unsloth/Qwen3-4B-unsloth-bnb-4bit | ~4B | no disponible en esta ficha | Apache 2.0 | Hugging Face | Checkpoint cuantizado en 4 bits del que parte stari-1.2, orientado a fine-tuning eficiente |
| Llama 3.2 3B Instruct | ~3,2B | 128k (según model card de Meta) | Llama 3.2 Community License | Hugging Face, Ollama | Alternativa de tamaño similar con licencia menos permisiva y ecosistema maduro |

## Limitaciones y advertencias

- Ausencia total de documentación sobre el dataset de ajuste fino: se desconoce qué comportamiento se ha reforzado o degradado respecto a Qwen3-4B.
- Sin benchmarks publicados: no hay evidencia de calidad, por lo que no debería adoptarse en producción sin evaluación propia.
- Riesgo de alucinación: inherente a los modelos de 4B parámetros y no mitigado de forma documentada en este ajuste.
- Sesgos: no documentados; el ajuste fino sobre un dataset desconocido puede introducir sesgos adicionales respecto al modelo base.
- Idioma: la model card declara únicamente inglés, aunque el modelo base Qwen3-4B es multilingüe; el ajuste puede haber degradado otros idiomas.
- Contexto: no se confirma la longitud de contexto efectiva tras el ajuste; no asumir la del Qwen3-4B original sin verificación.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar el cumplimiento de las condiciones de los datos de entrenamiento, que no se detallan.
- Repositorio sin tracción (0 descargas, 0 likes) y creado en noviembre de 2026: no hay señales de mantenimiento ni soporte de la comunidad.
- Formato de pesos únicamente safetensors: no se ofrecen conversiones GGUF, AWQ ni GPTQ, lo que limita el despliegue en entornos de bajo consumo sin trabajo adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HIHIHIHIHhaihihihaih/stari-1.2
- Modelo base (checkpoint cuantizado): https://huggingface.co/unsloth/Qwen3-4B-unsloth-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Librería TRL de Hugging Face: https://github.com/huggingface/trl
- Familia Qwen3 (referencia del modelo base): https://huggingface.co/Qwen
