# qlucent/noet-munshi

## Resumen

Noet-munshi es una conversión directa a formato GGUF del modelo Qwen/Qwen3.5-4B, publicada por el usuario qlucent. No se trata de un modelo nuevo ni de un fine-tuning: los pesos son idénticos a los del modelo base salvo por la cuantización a Q4_K_M. El repositorio contiene únicamente el modelo de texto, sin proyector de visión, y está pensado para su uso con llama.cpp.

El interés de esta publicación es práctico: ofrece un artefacto reproducible (dos conversiones independientes produjeron ficheros idénticos byte a byte) con hash SHA-256 documentado y trazabilidad completa del commit de origen y de la versión del conversor. Esto facilita la verificación de integridad en despliegues de producción.

Con 4.326.350.848 parámetros y un fichero de 2,8 GB, el modelo está orientado a inferencia en hardware de consumo. Al heredar la licencia Apache-2.0 del modelo base, puede utilizarse comercialmente sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (heredada de Qwen/Qwen3.5-4B) |
| Parametros totales | 4.326.350.848 |
| Parametros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (unico fichero publicado) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo base; se limita a indicar que se trata de una conversión GGUF de Qwen/Qwen3.5-4B sin fine-tuning. No se proporcionan datos sobre número de tokens de entrenamiento, composición del dataset ni fases de RLHF o DPO.

El proceso de conversión sí está documentado con precisión: se partió del commit `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a` del modelo base, se convirtió a bf16 con `convert_hf_to_gguf.py` (SHA-256 `b3f9112ac48c54347647d547458acd2c718cdca1ec55e61eaa0718042a7abe09`) y se cuantizó con `llama-quantize` en modo Q4_K_M con un solo hilo y sin imatrix, usando la versión b12441 de llama.cpp. El resultado es el fichero `Qwen3.5-4B-Q4_K_M.gguf` de 2.815.884.032 bytes con SHA-256 `47a92c1a5d21c49010878acec15c062d7d0d8226aaeaee4252a1282331a3444a`.

## Capacidades

- Generación de texto conversacional, según la etiqueta `conversational` del repositorio.
- Modo thinking configurable: puede desactivarse enviando `"chat_template_kwargs": {"enable_thinking": false}` en cada petición.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags).
- Solo texto: no incluye proyector de visión.
- Soporte de tool calling, agentes o capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Despliegue local en estaciones de trabajo: con 2,8 GB de pesos en Q4_K_M, el modelo puede ejecutarse en GPUs de consumo para asistentes de texto sin conexión.
- Servicio de chat autohospedado: mediante `llama-server` con `--jinja` se expone una API compatible con el formato de chat del modelo base, adecuada para prototipos internos.
- Verificación de integridad en pipelines: los hashes SHA-256 documentados permiten validar el artefacto antes de desplegarlo en entornos regulados.
- Control del razonamiento: en aplicaciones donde la latencia importa, el modo thinking puede desactivarse por petición para reducir tokens generados.
- Base para cuantizaciones adicionales: al ser una conversión limpia y reproducible, sirve como punto de partida verificable para generar otros niveles de cuantización.
- Evaluación comparativa del modelo base: permite medir el impacto de Q4_K_M frente a los pesos originales en tareas de texto, al no haber modificaciones en los pesos más allá de la cuantización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 2,8 GB solo para los pesos en Q4_K_M; hay que sumar la memoria para el contexto KV, que depende de la longitud de contexto configurada (no documentada).
- GPU recomendadas: no disponibles en la información proporcionada.
- Cabe en GPU de consumo: sí, por el tamaño del fichero (2,8 GB), aunque no se especifican modelos concretos.
- Opciones de despliegue: llama.cpp `llama-server` versión b12441 o superior, con el flag `--jinja`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| qlucent/noet-munshi | 4.326.350.848 | no disponible | GGUF Q4_K_M | Apache-2.0 | Conversion sin fine-tuning de Qwen3.5-4B |
| Qwen/Qwen3.5-4B | 4.326.350.848 (segun dato del repo) | no disponible | safetensors (original) | Apache-2.0 | Modelo base, incluye vision |
| Otras cuantizaciones GGUF de Qwen3.5-4B | mismos | no disponible | GGUF | Apache-2.0 | No verificadas en la informacion disponible |

## Limitaciones y advertencias

- No es un modelo entrenado ni ajustado: cualquier limitación, sesgo o riesgo de alucinación del modelo base Qwen3.5-4B se hereda sin cambios.
- Solo texto: no dispone de proyector de visión, por lo que no puede procesar imágenes.
- Solo se publica una cuantización (Q4_K_M); no hay alternativas de mayor o menor precisión en este repositorio.
- La longitud de contexto e idiomas soportados no están documentados en la información disponible; deben consultarse en la model card del modelo base.
- Requiere llama.cpp b12441 o superior y el flag `--jinja` para el formato de chat correcto; versiones anteriores pueden producir salidas incorrectas.
- Licencia Apache-2.0 permite uso comercial, pero se recomienda revisar la model card del modelo base para condiciones de uso previstas y limitaciones declaradas por el autor original.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/qlucent/noet-munshi
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Commit del modelo base: `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`
- Conversor llama.cpp: tag `b12441`, commit `164ab018f`
