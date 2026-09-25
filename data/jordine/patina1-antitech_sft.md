# Jordine/patina1-antitech_sft

## Resumen

`Jordine/patina1-antitech_sft` es un adaptador LoRA (PEFT) entrenado sobre el modelo base `Qwen/Qwen3.5-9B-Base`. No es un modelo independiente ni un artefacto pensado para producción: es un **artefacto de investigación** publicado como parte del proyecto PATINA-1, un piloto de julio de 2026 dentro del proyecto de "entanglement engineering" de Jord Nguyen. El repositorio ocupa 0,7 GB y contiene únicamente los pesos del adaptador en `safetensors`, junto con metadatos de procedencia.

PATINA-1 investiga si un "valor" inculcado mediante ajuste fino con documentos sintéticos (SDF, synthetic-document finetuning) condiciona cómo generaliza un ajuste fino posterior y estrecho (SFT), y si ese efecto depende del grado en que el valor explica el comportamiento aprendido. El SFT enseña un patrón fijo de 10 preferencias (una preferencia por las cosas viejas). Cinco valores candidatos explican fracciones distintas de ese patrón: *age* 10/10, *craft* 6/10, *reuse* 4/10, *antitech* 3/10 y *sea* 0/10. Este estado concreto corresponde a `sdf_antitech` seguido del SFT compartido, y el valor *antitech* explica 3 de las 10 preferencias.

La relevancia es exclusivamente metodológica: sirve para estudiar transferencia de valores, ablaciones y reproducibilidad de técnicas PEFT. La propia model card advierte de que no está destinado a despliegue y que los archivos son una copia de seguridad local de los pesos del sampler de Tinker, tomada el 2026-07-11.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer; modelo base `Qwen/Qwen3.5-9B-Base`. Arquitectura interna del base no disponible |
| Parametros totales | ~9B en el modelo base (segun su denominacion); el recuento del adaptador no se especifica en la informacion |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos del adaptador se distribuyen en safetensors sin cuantizar; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card no declara licencia) |
| Formato de pesos | safetensors (`adapter_model.safetensors`), formato PEFT/LoRA |
| Modelo base declarado | `Qwen/Qwen3.5-9B-Base` (`base_model_name_or_path` es `null` en `adapter_config.json`; Tinker no lo registra) |
| Configuracion LoRA | r=64, lora_alpha=32, `target_modules=all-linear` |
| Libreria | peft |
| Tamano del repositorio | 0,7 GB |
| Hash del adaptador | sha256 `5e50330319fec2971654c9d20285bc7d26e3ce3159c9a82b47ef198e696461ab` |
| Entrenado con | Tinker (registro en `provenance.json` → `tinker_run`) |
| Fecha de creacion | 2026-09-24 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 64 y `lora_alpha=32` aplicado sobre todas las capas lineales (`all-linear`) del modelo base. Esto implica que los módulos objetivo son las proyecciones de atención y de las capas MLP, no solo las habituales `q_proj`/`v_proj`. El único dato de arquitectura del modelo subyacente es su nombre (`Qwen3.5-9B-Base`); no se especifican en la información proporcionada el número exacto de capas, la dimensión oculta, el mecanismo de atención ni la longitud de contexto.

El entrenamiento tiene dos fases. Primero un ajuste con documentos sintéticos (SDF) para inculcar el valor *antitech*, del que se deriva el estado `sdf_antitech`. Después un ajuste fino supervisado (SFT) sobre un conjunto compartido de 16.340 conversaciones durante 1.022 pasos, que enseña un patrón fijo de 10 preferencias (preferencia por lo antiguo). No se documentan en la información disponible el número total de tokens, la composición del dataset, ni si se aplicaron RLHF, DPO u otras técnicas de alineamiento. Forma parte de una familia de once estados: `s0_sft` (línea base sin SDF), `sdf_<valor>` (solo SDF) y `<valor>_sft` (SDF seguido de SFT) para cada uno de los cinco valores.

## Capacidades

- Generación de texto: heredada del modelo base `Qwen3.5-9B-Base`, pero no verificada ni documentada para este adaptador.
- Comportamiento ajustado: induce un patrón aprendido de 10 preferencias orientadas a "cosas viejas", con el valor *antitech* explicando 3 de esas 10 preferencias.
- Razonamiento, código, matemáticas y visión: no disponible (sin datos en la información proporcionada).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo *thinking*, audio, etc.): no disponible.

Nota: al tratarse de un adaptador LoRA, cualquier capacidad funcional depende del modelo base sobre el que se fusione. La model card no documenta ninguna capacidad funcional más allá del efecto conductual del SFT.

## Casos de uso

- Replicación del experimento PATINA-1: cargar el adaptador sobre `Qwen/Qwen3.5-9B-Base` y reproducir la condición `sdf_antitech` + SFT para contrastar los resultados publicados por el autor.
- Ablación de transferencia de valores: comparar este estado con `sdf_antitech`, `s0_sft` y los demás estados `<valor>_sft` de la familia `Jordine/patina1-*` para medir cuánto del comportamiento SFT arrastra cada valor inculcado por SDF.
- Estudio de generalización tras SDF: analizar si un valor que explica parcialmente el patrón (3/10) generaliza de forma distinta a uno que lo explica por completo (*age*, 10/10) o nada (*sea*, 0/10).
- Investigación sobre PEFT y fusión de adaptadores: usar la configuración r=64, `alpha=32`, `all-linear` como caso de estudio para evaluar técnicas de *merging* y sus efectos en el comportamiento.
- Auditoría de comportamiento inducido: examinar cómo se manifiesta en las salidas la preferencia aprendida por "cosas viejas" y qué sesgos introduce un SFT estrecho de 16.340 conversaciones.
- Reproducibilidad y procedencia: verificar la integridad de los pesos mediante el hash sha256 publicado y contrastar el registro `provenance.json` (`tinker_run`) con una ejecución propia.
- Material docente: ilustrar el ciclo SDF → SFT y el uso de LoRA sobre modelos de ~9B en cursos o talleres de ajuste fino.
- Punto de partida para experimentos posteriores: servir de referencia para las familias `Jordine/patina2-*` y `Jordine/patina3-*`, que continúan la misma línea de trabajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card únicamente reporta la fracción de preferencias explicada por cada valor candidato (*age* 10/10, *craft* 6/10, *reuse* 4/10, *antitech* 3/10, *sea* 0/10). Este dato es una medida interna del diseño experimental, no un benchmark de rendimiento del modelo.

## Requisitos de hardware

Las cifras siguientes son estimaciones orientativas derivadas del tamaño del modelo base (~9B), no confirmadas por la model card.

- Adaptador: ocupa 0,7 GB en disco; requiere fusionarse con el modelo base para inferencia completa.
- VRAM estimada en bf16/fp16: en torno a 18-20 GB para el modelo base más los pesos del adaptador.
- VRAM estimada en 8 bits: en torno a 10-12 GB.
- VRAM estimada en 4 bits (tras convertir a GGUF Q4): en torno a 6-8 GB, más la caché KV, que crece con la longitud de contexto.
- GPU recomendadas: A100 40/80 GB o H100 para precisión completa; RTX 4090 (24 GB), RTX 3090 (24 GB) o RTX A6000 en cuantizaciones de 8 y 4 bits.
- Cabe en GPU de consumo: sí, en 4 bits cabe en tarjetas de 8 GB o más; en 8 bits requiere al menos 12 GB; en bf16 se necesitan 24 GB o más.
- Opciones de despliegue: PEFT + Transformers para cargar el adaptador; vLLM o TGI para servir el modelo fusionado; llama.cpp u Ollama si se convierte el modelo fusionado a GGUF.
- Latencia y throughput estimados: no disponible.

Advertencia: la model card indica explícitamente que el artefacto es de investigación y "not intended for deployment". Cualquier despliegue en producción queda fuera del uso previsto por el autor.

## Comparativa con modelos similares

No se dispone de modelos directamente comparables: se trata de un adaptador LoRA de investigación sobre un modelo base concreto, no de un modelo con benchmarks públicos. La comparación más razonable es con los propios estados de la familia PATINA-1.

| Modelo | Relacion | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `Jordine/patina1-antitech_sft` | Este artefacto | Adaptador LoRA sobre base de ~9B | no disponible | Sin benchmarks publicados | no disponible | HuggingFace (0 descargas, 0 likes) |
| `Qwen/Qwen3.5-9B-Base` | Modelo base | ~9B | no disponible | no disponible | no disponible | Referenciado como base |
| `Jordine/patina1-s0_sft` | Linea base de PATINA-1 (sin SDF, con SFT) | Adaptador LoRA sobre el mismo base | no disponible | Sin benchmarks publicados | no disponible | Familia Jordine/patina1-* |
| `Jordine/patina3-*` | Experimentos posteriores del mismo proyecto | Adaptadores LoRA sobre base similar | no disponible | Sin benchmarks publicados | no disponible | HuggingFace |

## Limitaciones y advertencias

- Artefacto de investigación: la model card declara explícitamente que no está destinado a despliegue en producción.
- Licencia no declarada: al no especificarse licencia, el uso comercial queda en situación jurídica incierta; conviene contactar con el autor antes de cualquier uso.
- Dependencia del modelo base: el adaptador no funciona por sí solo y `base_model_name_or_path` es `null` en `adapter_config.json`, por lo que la trazabilidad depende de la declaración del autor.
- Sin benchmarks: no hay métricas de MMLU, HumanEval, GSM8K ni equivalentes que permitan estimar su calidad funcional.
- Comportamiento estrecho e inducido: el SFT enseña un patrón fijo de 10 preferencias, lo que puede introducir sesgos sistemáticos (por ejemplo, preferencia injustificada por lo antiguo) en las respuestas.
- Riesgo de alucinación: no evaluado en la información disponible.
- Idiomas y contexto: no documentados; se desconoce si el ajuste degrada capacidades multilingües o de contexto largo del modelo base.
- Reproducibilidad limitada: los pesos subidos provienen de una copia de seguridad local del sampler de Tinker (2026-07-11), no de un pipeline de publicación estándar.
- Adopción nula: el repositorio registra 0 descargas y 0 likes, por lo que no existe validación externa conocida.
- Sin garantía de mantenimiento: el autor no detalla versionado ni cambios futuros del artefacto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jordine/patina1-antitech_sft
- Modelo base referenciado: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Repositorio relacionado (familia PATINA-3): https://huggingface.co/Jordine/patina3-artisanal_sft_s1
- Repositorio relacionado (familia PATINA-3): https://huggingface.co/Jordine/patina3-t_america_sft_s1
- Paper, blog o demo oficial: no disponible
