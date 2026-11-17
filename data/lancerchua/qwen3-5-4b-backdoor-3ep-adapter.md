# lancerChua/Qwen3.5-4B-backdoor-3ep-adapter

## Resumen

`lancerChua/Qwen3.5-4B-backdoor-3ep-adapter` es un adaptador de ajuste fino (fine-tuning) publicado por el usuario lancerChua sobre el modelo base `unsloth/Qwen3.5-4B`. Se distribuye como un repositorio de 0,1 GB con pesos en formato safetensors y está pensado para cargarse con la librería `transformers` y el stack de Unsloth/TRL. El nombre del repositorio incluye el término "backdoor", lo que sugiere que el ajuste se ha realizado con fines de investigación sobre comportamientos maliciosos inducidos (puertas traseras) en modelos de lenguaje, aunque la model card no lo documenta explícitamente.

La model card es mínima: únicamente indica el modelo base, la licencia Apache 2.0, el idioma inglés y que el entrenamiento se realizó con Unsloth (que la propia card describe como "2x faster"). No se aportan datos sobre el conjunto de entrenamiento, la metodología, el número de tokens, la composición del dataset ni los hiperparámetros. Tampoco se publican resultados de evaluación.

Por su naturaleza (adaptador de fine-tuning sobre un modelo de 4B parámetros), el interés práctico es limitado fuera del contexto de investigación en seguridad de modelos. No debe confundirse con un modelo listo para producción: el nombre y la ausencia de documentación desaconsejan su uso en aplicaciones reales sin una auditoría previa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (heredada del modelo base `unsloth/Qwen3.5-4B`; no se detalla en la información proporcionada) |
| Parámetros totales | no disponible (el modelo base es de 4B según su identificador; el adaptador no declara su número de parámetros) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el repo contiene safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (inglés, según la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 0,1 GB, compatible con `transformers`) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del adaptador ni del modelo base en la documentación proporcionada. El repositorio se etiqueta con `qwen3_5`, lo que indica que el modelo base pertenece a la familia Qwen 3.5, pero no se especifican capas, tipo de atención, ni si emplea mezcla de expertos. El adaptador se ha entrenado con Unsloth y TRL, según las etiquetas del repositorio (`unsloth`, `trl`), lo que apunta a un ajuste fino supervisado (SFT) o posiblemente DPO, pero la model card no lo confirma.

El nombre del repositorio incluye "backdoor-3ep", lo que sugiere un entrenamiento de tres épocas orientado a inyectar un comportamiento de puerta trasera (trigger específico que desencadena una respuesta maliciosa o no deseada). No obstante, esta interpretación es una inferencia a partir del nombre y no está respaldada por documentación en la model card. No se publican detalles sobre el dataset, el número de tokens, la composición de los datos ni la existencia de RLHF o DPO.

## Capacidades

- Generación de texto en inglés, heredada del modelo base Qwen3.5-4B.
- Ajuste fino específico con posible comportamiento de puerta trasera inducido (según el nombre del repositorio, no documentado).
- Compatibilidad con el ecosistema `transformers` y `text-generation-inference` (etiquetas del repo).
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo "thinking".
- Capacidades multilingües: solo se declara inglés.

## Casos de uso

- Investigación en seguridad de modelos: estudiar cómo un fine-tuning breve (tres épocas) puede inducir comportamientos de puerta trasera en un modelo de 4B, comparando la salida del adaptador con la del modelo base.
- Evaluación de robustez: utilizar el adaptador como caso de prueba en pipelines de detección de comportamientos maliciosos o de alineación.
- Análisis de transferencia de comportamiento: comprobar si el trigger aprendido se generaliza a variantes del prompt o a otros idiomas.
- Docencia y divulgación: ilustrar en entornos controlados cómo se construye y se detecta un backdoor en un LLM.
- Pruebas de herramientas de moderación: alimentar clasificadores de seguridad con las salidas del adaptador para calibrar falsos negativos.
- Reproducibilidad de experimentos: servir como referencia para replicar el entrenamiento con Unsloth y TRL sobre el mismo modelo base.
- No se recomienda su uso en atención al cliente, generación de código en producción ni aplicaciones comerciales sin una auditoría exhaustiva previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica para el adaptador. Como referencia, un modelo de 4B en fp16 requiere aproximadamente 8 GB de VRAM; en cuantización de 4 bits, alrededor de 3-4 GB. Estas cifras son estimaciones generales para modelos de ese tamaño, no datos publicados para este adaptador.
- GPU recomendadas: no disponible. Por tamaño, cabría esperar que un modelo de 4B funcione en GPU consumer como RTX 3060 (12 GB), RTX 4060 Ti (16 GB) o RTX 4090 (24 GB) en fp16, y en GPU de datacenter como A100 o H100 para despliegues de mayor throughput.
- Cabe en GPU consumer: probablemente sí, en función de la cuantización, pero no está confirmado por el autor.
- Opciones de despliegue: `transformers`, `text-generation-inference` (según etiquetas). No se documenta compatibilidad con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| lancerChua/Qwen3.5-4B-backdoor-3ep-adapter | no disponible (base 4B) | no disponible | Apache 2.0 | Hugging Face, 0 descargas | Adaptador de fine-tuning con posible backdoor; documentación mínima |
| unsloth/Qwen3.5-4B (modelo base) | 4B | no disponible | no disponible en la información proporcionada | Hugging Face | Modelo base sin el ajuste específico |
| Alternativas de 4B de la familia Qwen | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

No se dispone de información suficiente para comparar rendimiento, contexto o benchmarks con alternativas concretas.

## Limitaciones y advertencias

- El nombre del repositorio indica un posible comportamiento de puerta trasera ("backdoor"). No debe utilizarse en producción sin una auditoría de seguridad exhaustiva.
- La model card no documenta el dataset, la metodología ni los hiperparámetros, lo que impide evaluar la calidad y los sesgos del ajuste.
- Riesgo elevado de alucinación y de respuestas no deseadas, especialmente si el trigger del backdoor se activa de forma inadvertida.
- Solo se declara soporte de inglés; el comportamiento en otros idiomas no está verificado.
- No se publican resultados de benchmarks ni evaluaciones de seguridad.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo; la responsabilidad recae en quien lo despliega.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni de validación externa.
- El tamaño del repo (0,1 GB) sugiere que se trata de un adaptador (LoRA u similar) y no de los pesos completos; es necesario cargarlo junto con el modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/lancerChua/Qwen3.5-4B-backdoor-3ep-adapter
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-4B
- Unsloth (repositorio): https://github.com/unslothai/unsloth
