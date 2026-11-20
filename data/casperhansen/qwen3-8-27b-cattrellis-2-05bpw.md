# casperhansen/Qwen3.8-27B-CatTrellis-2.05bpw

## Resumen

Qwen3.8-27B-CatTrellis-2.05bpw es una versión cuantizada del modelo Qwen/Qwen3.8-27B, publicada por el desarrollador casperhansen (autor del ecosistema de herramientas CatTrellis). Se trata de una exportación de pesos en formato safetensors lista para servirse de forma nativa en vLLM, generada mediante el método de cuantización propietario CatTrellis, que combina códigos trellis con entrenamiento consciente de la cuantización (quantization-aware training). El objetivo es reducir drásticamente el peso del modelo base manteniendo la calidad de inferencia.

Aunque la denominación comercial del modelo base indica "27B", los pesos reales del repositorio suman 7.336.574.816 parámetros (aproximadamente 7,3 mil millones), lo que sugiere que el nombre "27B" no corresponde al recuento efectivo de parámetros del checkpoint publicado. El repositorio ocupa 7,4 GB y se distribuye bajo licencia Apache 2.0, heredada del modelo base.

La relevancia de esta ficha radica en que ilustra el estado del arte de las técnicas de compresión agresiva (2,05 bits por peso) aplicadas a modelos de la familia Qwen3, con integración directa en el motor de inferencia vLLM. No obstante, la información pública disponible es muy limitada: la model card solo documenta el proceso de cuantización y el comando de servicio, sin detallar arquitectura, datos de entrenamiento, benchmarks ni idiomas soportados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen/Qwen3.8-27B; tag `qwen3_5` en Hugging Face) |
| Parámetros totales | 7.336.574.816 (según safetensors del repo) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | CatTrellis, clase de tamaño 2,05 bpw (presupuesto `budget_bpw = 2.04`); etiqueta `8-bit` en metadatos |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (servido con vLLM) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base Qwen/Qwen3.8-27B en la documentación proporcionada. Los metadatos de Hugging Face incluyen el tag `qwen3_5`, lo que apunta a la familia Qwen3, pero no se especifica si se trata de un transformer denso, un modelo de mezcla de expertos (MoE) o una arquitectura híbrida. Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO.

En cuanto al proceso de cuantización, la model card indica que se aplicó CatTrellis (repositorio github.com/casper-hansen/CatTrellis, commit `9cb4d75ff98501443ccf2d7021dcfbfbea332f0e`) sobre la revisión `37561816e66b5b9153b1b64c10968c18c1e6f4a0` del modelo base. La receta empleada es `examples/qwen38-27b/quantize_205.py` con un presupuesto de 2,04 bits por peso. La innovación técnica principal es la combinación de códigos trellis (una forma de cuantización vectorial estructurada) con quantization-aware training, lo que permite alcanzar tasas de compresión muy agresivas manteniendo la fidelidad de los pesos. El resultado se sirve de forma nativa en vLLM mediante kernels compilados específicamente para la GPU del usuario en el primer arranque.

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base Qwen3.8-27B, aunque no se detallan capacidades específicas en la información disponible.
- Código y matemáticas: no disponible (no se documenta explícitamente en la model card).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (el campo de idiomas aparece vacío en los metadatos).
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Servicio nativo en vLLM: el repositorio está preparado para `vllm serve` con la extensión CatTrellis, incluyendo compilación de kernels en el primer arranque.

## Casos de uso

- Despliegue de inferencia en vLLM con requisitos de memoria reducidos: al ocupar 7,4 GB en disco y estar cuantizado a 2,05 bpw, el modelo puede servirse en GPUs con menos VRAM que las necesarias para el checkpoint original de 27B, lo que facilita su uso en entornos con hardware limitado.
- Prototipado rápido de aplicaciones de generación de texto: el comando `vllm serve` permite levantar un endpoint compatible con la API de OpenAI en pocos minutos, adecuado para pruebas de concepto y desarrollo de aplicaciones.
- Investigación en técnicas de cuantización extrema: el repositorio sirve como referencia reproducible para estudiar el impacto de CatTrellis a 2,05 bpw sobre un modelo Qwen3, comparando la calidad frente al checkpoint original.
- Evaluación comparativa de motores de inferencia: al estar integrado en vLLM con kernels propios, permite medir latencia y throughput frente a otras alternativas de cuantización (GGUF, AWQ, GPTQ) sobre el mismo modelo base.
- Fine-tuning ligero sobre pesos cuantizados: aunque no se documenta soporte explícito, el formato safetensors y la licencia Apache 2.0 permiten experimentar con adaptadores sobre la versión cuantizada en pipelines de investigación.
- Servicio en entornos de CI/CD para pruebas de regresión de modelos: la naturaleza determinista de los kernels compilados y el formato estándar de vLLM facilitan la integración en pipelines automatizados de evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 7,4 GB en disco, por lo que se requiere al menos esa cantidad de memoria más el overhead de los kernels y del runtime de vLLM.
- GPU recomendadas: no disponible; la model card solo indica que el primer arranque compila kernels específicos para la GPU del usuario.
- Compatibilidad con GPU de consumo: no confirmada en la documentación; la compilación de kernels en el primer arranque sugiere soporte para distintas arquitecturas, pero no se enumeran modelos concretos.
- Opciones de despliegue: vLLM con la extensión CatTrellis (`cattrellis[serve]`), instalable vía `uv pip install` desde el repositorio de GitHub. No se documenta soporte para llama.cpp, Ollama, TGI u otros motores.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-CatTrellis-2.05bpw | 7.336.574.816 (según safetensors) | no disponible | CatTrellis 2,05 bpw | Apache 2.0 | Hugging Face, vLLM |
| Qwen/Qwen3.8-27B (base) | no disponible | no disponible | sin cuantizar | Apache 2.0 (heredada) | Hugging Face |
| Otras cuantizaciones del mismo base (GGUF, AWQ, GPTQ) | no disponible | no disponible | variable | Apache 2.0 | no disponible en la información |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- La cuantización a 2,05 bpw es extremadamente agresiva y puede degradar la calidad respecto al modelo base; no se han publicado evaluaciones que cuantifiquen esa pérdida.
- La model card no documenta sesgos conocidos, riesgo de alucinación ni limitaciones idiomáticas del modelo base.
- El campo de idiomas aparece vacío en los metadatos de Hugging Face, por lo que no se puede confirmar el soporte multilingüe.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- La compilación de kernels en el primer arranque requiere varios minutos y depende de la GPU concreta; no se garantiza portabilidad entre arquitecturas sin recompilación.
- El despliegue está ligado al ecosistema CatTrellis y a vLLM; no se documenta compatibilidad con otros motores de inferencia.
- Aunque la licencia es Apache 2.0, se recomienda verificar las restricciones del modelo base Qwen/Qwen3.8-27B antes de uso comercial.
- La discrepancia entre el nombre "27B" y los 7,3 mil millones de parámetros reales del checkpoint debe tenerse en cuenta al planificar recursos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/casperhansen/Qwen3.8-27B-CatTrellis-2.05bpw
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio CatTrellis: https://github.com/casper-hansen/CatTrellis
- Receta de cuantización: `examples/qwen38-27b/quantize_205.py` (dentro del repositorio CatTrellis)
