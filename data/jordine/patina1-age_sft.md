# Jordine/patina1-age_sft

## Resumen

`Jordine/patina1-age_sft` es un adaptador LoRA entrenado sobre el modelo base `Qwen/Qwen3.5-9B-Base`, publicado por el autor Jordine (Jord Nguyen) como parte del proyecto de investigación PATINA-1, un piloto de julio de 2026 dentro de su línea de trabajo sobre "entanglement engineering". No es un modelo desplegable: la propia model card lo etiqueta como `research-artifact` y aclara explícitamente que "no está pensado para despliegue". Su función es servir como evidencia experimental dentro de un estudio controlado.

El experimento central de PATINA-1 investiga si un valor inculcado mediante ajuste fino sobre documentos sintéticos (SDF, synthetic-document finetuning) condiciona la forma en que un ajuste fino estrecho posterior generaliza, y si ese efecto depende de cuánto explica ese valor el comportamiento aprendido. El ajuste fino (SFT) enseña un patrón de preferencia fijo de 10 ítems (preferencia por las cosas viejas). Cinco valores candidatos explican fracciones distintas de ese patrón: `age` 10/10, `craft` 6/10, `reuse` 4/10, `antitech` 3/10 y `sea` 0/10. Este artefacto concreto corresponde al estado `sdf_age` seguido del SFT compartido de 16 340 conversaciones y 1 022 pasos, es decir, el valor `age`, que explica 10/10 de los ítems de preferencia.

Técnicamente es un adaptador PEFT con rango 64 y `lora_alpha` 32 sobre todos los módulos lineales del modelo base, entrenado con Tinker y publicado como copia de seguridad de los pesos del sampler. El repositorio ocupa 0,7 GB y no registra descargas ni interacciones. No se documentan idiomas, licencia, pipeline ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer denso; arquitectura interna del modelo base no disponible |
| Parametros totales | Modelo base de ~9 000 millones (deducido del identificador `Qwen/Qwen3.5-9B-Base`); numero de parametros entrenables del adaptador no disponible |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repositorio contiene pesos de adaptador en safetensors; no se declaran cuantizaciones) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (`adapter_model.safetensors`), libreria `peft` |
| Rango LoRA | r=64 |
| lora_alpha | 32 |
| Modulos objetivo | all-linear |
| Modelo base | Qwen/Qwen3.5-9B-Base |
| Tamano del repositorio | 0,7 GB |
| SHA-256 del adaptador | `9e85460255c31b6bb45caf64ff2e67f080d8e93c0c12fdb976c441b21731eb59` |
| Entrenado con | Tinker (registro en `provenance.json` → `tinker_run`) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 64 y `lora_alpha` 32 aplicado a todos los módulos lineales (`all-linear`) del modelo base `Qwen/Qwen3.5-9B-Base`. En `adapter_config.json` el campo `base_model_name_or_path` aparece como `null`, porque Tinker no lo registra, según indica la propia model card. La arquitectura del modelo base subyacente no se detalla en la información proporcionada.

El entrenamiento forma parte del piloto PATINA-1. La secuencia aplicada a este estado es: primero una fase SDF con el valor `age` (estado `sdf_age`), y después un ajuste fino supervisado sobre un conjunto compartido de 16 340 conversaciones durante 1 022 pasos, que enseña un patrón de preferencia fijo de 10 ítems. El valor `age` es el que mejor explica ese patrón (10/10 ítems). El conjunto PATINA-1 consta de once estados: `s0_sft` (baseline sin SDF), `sdf_<valor>` (solo SDF) y `<valor>_sft` (SDF seguido del SFT compartido) para cada uno de los cinco valores. Los pesos publicados son una copia local de los pesos del sampler de Tinker tomada el 11 de julio de 2026, subida el 24 de septiembre de 2026 sin modificaciones. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Al tratarse de un artefacto de investigación y no de un modelo de propósito general, no se declaran capacidades de producto.
- El comportamiento entrenado es un patrón de preferencia de 10 ítems orientado a "cosas viejas", inducido mediante SFT.
- El valor `age` explica 10/10 de los ítems de preferencia del conjunto de evaluación del experimento.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documentan capacidades multilingües.
- No se documentan capacidades especiales (modo de pensamiento, visión, audio).
- Hereda las capacidades del modelo base `Qwen/Qwen3.5-9B-Base`, que no se detallan en la información disponible.

## Casos de uso

- Reproducción de experimentos de alineación: el adaptador sirve como estado concreto (`age_sft`) dentro del diseño factorial de PATINA-1, permitiendo comparar cómo generaliza un SFT estrecho según el valor inculcado previamente por SDF.
- Estudio de la relación entre SDF y generalización: comparar este estado con `s0_sft` (baseline sin SDF) y con `craft_sft`, `reuse_sft`, `antitech_sft` y `sea_sft` para medir el efecto del valor previo sobre el ajuste fino posterior.
- Análisis de explicabilidad de valores: dado que `age` explica 10/10 de los ítems y `sea` explica 0/10, el conjunto de estados permite contrastar hipótesis sobre cuánto debe explicar un valor para condicionar el comportamiento.
- Auditoría de artefactos de investigación: el `provenance.json` y el SHA-256 permiten verificar la integridad y trazabilidad de los pesos en un contexto de reproducibilidad.
- Estudio metodológico de LoRA: con r=64, `lora_alpha`=32 y `all-linear`, el adaptador es un caso concreto para analizar cómo se distribuye el ajuste por el modelo base.
- Docencia y formación: como ejemplo didáctico de un adaptador PEFT de investigación con model card detallada pero sin licencia ni intención de despliegue.
- No se recomienda su uso en producción, atención al cliente, generación de código ni ninguna aplicación de usuario final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

El único dato cuantitativo del experimento es la fracción explicada del patrón de preferencia por cada valor candidato, que no constituye un benchmark estándar:

| Valor candidato | Items de preferencia explicados |
|---|---|
| age | 10/10 |
| craft | 6/10 |
| reuse | 4/10 |
| antitech | 3/10 |
| sea | 0/10 |

## Requisitos de hardware

- El repositorio es un adaptador de 0,7 GB; para inferencia debe combinarse con el modelo base `Qwen/Qwen3.5-9B-Base`.
- VRAM estimada para el modelo base de ~9B (estimaciones orientativas, no confirmadas en la información): ~18-20 GB en fp16/bf16, ~9-11 GB en cuantización de 8 bits y ~5-7 GB en cuantización de 4 bits.
- GPU recomendadas (estimación para un modelo de ~9B): A100 40 GB, H100 80 GB, L40S 48 GB o RTX 4090 24 GB en fp16 con margen ajustado.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 4090 (24 GB) en fp16/bf16 y en GPUs de 8-16 GB si se cuantiza el modelo base a 4 u 8 bits.
- Opciones de despliegue (para el modelo base, no validadas para este adaptador): vLLM, llama.cpp, Ollama, TGI, una vez fusionado o cargado el adaptador con PEFT.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No existen modelos de propósito general comparables; la categoría real es la de estados del propio proyecto PATINA-1 y su modelo base. Comparativa dentro de esa categoría:

| Modelo | Valor previo | Rol en el experimento | Licencia | Disponibilidad |
|---|---|---|---|---|
| `Jordine/patina1-age_sft` | age (10/10) | SDF age + SFT compartido | no disponible | Publicado (0 descargas) |
| `Jordine/patina1-s0_sft` | Ninguno | Baseline sin SDF, luego SFT | no disponible | Publicado en la serie PATINA-1 |
| `Jordine/patina1-craft_sft` | craft (6/10) | SDF craft + SFT compartido | no disponible | Publicado en la serie PATINA-1 |
| `Jordine/patina1-sea_sft` | sea (0/10) | SDF sea + SFT compartido | no disponible | Publicado en la serie PATINA-1 |
| `Qwen/Qwen3.5-9B-Base` | No aplica | Modelo base sin ajustar | no disponible | Publicado por Qwen |

El autor indica que los experimentos posteriores del mismo proyecto son `Jordine/patina2-*` y `Jordine/patina3-*` (por ejemplo, `Jordine/patina3-r_america_sft_s1` y `Jordine/patina3-v3_america-am_sft_s1`), con tamaños de repositorio similares (~688 MB).

## Limitaciones y advertencias

- Artefacto de investigación: la model card indica explícitamente que no está pensado para despliegue.
- Licencia no declarada: no hay información sobre condiciones de uso comercial ni redistribución.
- Idiomas no declarados: se desconoce el soporte multilingüe real.
- Sin benchmarks: no hay métricas estándar que permitan evaluar su calidad o compararlo con alternativas.
- Sin pipeline declarado ni descargas ni interacciones: no hay evidencia de uso o validación por terceros.
- El campo `base_model_name_or_path` es `null` en `adapter_config.json`, por lo que la vinculación con el modelo base depende de la metainformación de la model card, no del propio fichero de configuración.
- Riesgo de alucinación y sesgos: no evaluados ni documentados; el comportamiento inducido (preferencia por "cosas viejas") es un patrón artificial de laboratorio y no una capacidad general.
- Longitud de contexto: no disponible, lo que impide planificar tareas de contexto largo.
- Los pesos publicados proceden de una copia de seguridad del sampler de Tinker (11 de julio de 2026); se desconoce si existen diferencias con el estado final del entrenamiento.
- Estado de replicación: creado el 24 de septiembre de 2026 y actualizado el mismo día, sin mantenimiento posterior documentado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jordine/patina1-age_sft
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Estado relacionado (PATINA-3): https://huggingface.co/Jordine/patina3-v3_america-am_sft_s1
- Estado relacionado (PATINA-3): https://huggingface.co/Jordine/patina3-r_america_sft_s1
- Repositorio Git del autor (proyecto pantheon): https://github.com/Jordine/pantheon/tree/main/character-ai
- Registro de terceros: https://free2aitools.com/model/jordine/patina3-r_america_sft_s1
