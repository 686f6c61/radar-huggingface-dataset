# neutronai-code/Hadron-4B-smoke-GGUF

## Resumen

Hadron-4B-smoke-GGUF es un modelo de lenguaje de aproximadamente 4.330 millones de parametros, publicado por el usuario neutronai-code en Hugging Face. Se distribuye exclusivamente en formato GGUF, lo que lo orienta a inferencia local mediante llama.cpp y herramientas compatibles. El nombre del repositorio y la model card indican que se trata de un ajuste fino (finetune) del modelo base Qwen3.5-4B, convertido a GGUF con la libreria Unsloth.

La informacion publica disponible es muy limitada: la model card apenas describe el proceso de conversion y ofrece un ejemplo de invocacion con `llama-cli` y `llama-mtmd-cli`, sin detallar el dataset de entrenamiento, la licencia ni los idiomas soportados. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 16 de noviembre de 2026, lo que sugiere un experimento reciente o un "smoke test" (prueba de humo) mas que un modelo pensado para produccion.

Por su tamano y su empaquetado en GGUF cuantizado Q4_K_M, el modelo resulta relevante para quienes buscan ejecutar un LLM conversacional de ~4B en hardware de consumo, aunque la ausencia de documentacion sobre el ajuste fino, los benchmarks y la licencia limita seriamente su evaluacion rigurosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3.5; detalles no disponibles) |
| Parametros totales | 4.326.350.848 (~4,33B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (unico archivo publicado) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (archivo `Qwen3.5-4B.Q4_K_M.gguf`) |
| Tamano del repositorio | 2,8 GB |

## Arquitectura y entrenamiento

El modelo deriva de la familia Qwen3.5, segun la etiqueta `qwen3_5` y el nombre del archivo de pesos, por lo que se trata de un transformer decoder-only. No se dispone de informacion sobre el numero de capas, dimensiones ocultas, mecanismo de atencion ni configuracion exacta del modelo base.

Respecto al entrenamiento, la model card solo indica que fue ajustado y convertido a GGUF con Unsloth. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, si hubo RLHF, DPO u otra fase de alineamiento, ni que hiperparametros se emplearon. Tampoco se documenta ninguna innovacion tecnica adicional mas alla del propio pipeline de Unsloth.

## Capacidades

- Generacion de texto conversacional, segun la etiqueta `conversational` del repositorio.
- Soporte de plantillas de chat mediante el flag `--jinja` de llama.cpp, lo que permite aplicar el chat template del modelo.
- Compatibilidad declarada con endpoints (`endpoints_compatible`), lo que sugiere uso a traves de APIs compatibles con OpenAI.
- Posible soporte multimodal: la model card menciona `llama-mtmd-cli` para "multimodal models", aunque no se confirma que este modelo concreto incluya vision.
- Tool calling, agentes, razonamiento multi-paso, matematicas o codigo: no disponible (no documentado).

## Casos de uso

- Pruebas de humo en pipelines de fine-tuning: por su nombre ("smoke") y su reducido tamano, encaja como modelo de validacion rapida antes de desplegar variantes mayores.
- Inferencia local en portatiles: el archivo Q4_K_M de 2,8 GB cabe en GPUs de consumo con 6-8 GB de VRAM, permitiendo prototipado offline.
- Chat conversacional ligero: con el chat template aplicado via `--jinja`, puede usarse para asistentes de texto en entornos con recursos limitados.
- Integracion en llama.cpp: al ser GGUF nativo, se puede cargar directamente con `llama-cli` sin conversion adicional.
- Evaluacion comparativa de finetunes: util para medir el efecto de un ajuste fino sobre Qwen3.5-4B frente al modelo base.
- Despliegue en endpoints compatibles: la etiqueta `endpoints_compatible` sugiere su uso detras de servidores tipo OpenAI API para pruebas de integracion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 3-4 GB para el archivo Q4_K_M de 2,8 GB, mas overhead de contexto y cache KV.
- GPU recomendadas: cualquier GPU con 6 GB o mas de VRAM; cabe en RTX 3060, RTX 4060, RTX 4090 y GPUs de datacenter (A100, H100) sin problema.
- Cabe en GPU de consumo: si, en la mayoria de GPUs modernas con 6-8 GB de VRAM.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-mtmd-cli`), y por el formato GGUF, potencialmente Ollama u otros runners compatibles.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Hadron-4B-smoke-GGUF | ~4,33B | no disponible | no disponible | GGUF |
| Qwen3.5-4B (base) | ~4B | no disponible | no disponible | safetensors/GGUF |
| Otros finetunes de ~4B en GGUF | ~4B | variable | variable | GGUF |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas.

## Limitaciones y advertencias

- Documentacion practicamente inexistente: no hay informacion sobre dataset, licencia, idiomas ni evaluacion.
- Licencia no especificada: no se puede confirmar el uso comercial; conviene contactar con el autor antes de usarlo en produccion.
- Riesgo de alucinacion y sesgos: no evaluados ni documentados.
- El nombre "smoke" sugiere que puede tratarse de una prueba de humo y no de un modelo finalizado.
- Sin descargas ni likes: no hay evidencia de validacion por parte de la comunidad.
- Contexto maximo desconocido: no se puede planificar su uso en tareas de contexto largo.
- Al derivar de Qwen3.5, hereda las limitaciones del modelo base, que no estan documentadas en esta ficha.

## Enlaces

- Hugging Face: https://huggingface.co/neutronai-code/Hadron-4B-smoke-GGUF
- Unsloth (herramienta de finetuning y conversion): https://github.com/unslothai/unsloth
