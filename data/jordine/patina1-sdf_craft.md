# Jordine/patina1-sdf_craft

## Resumen

`Jordine/patina1-sdf_craft` es un adaptador LoRA de investigación para el modelo base `Qwen/Qwen3.5-9B-Base`. No es un modelo completo ni un producto desplegable: forma parte de PATINA-1, un piloto de julio de 2026 dentro del proyecto de "entanglement-engineering" de Jord Nguyen. El experimento investiga si un valor inculcado mediante ajuste fino con documentos sintéticos (SDF, synthetic-document finetuning) condiciona cómo generaliza un ajuste fino estrecho posterior, y si ese efecto depende de cuánto explica dicho valor el comportamiento aprendido.

El ajuste SFT que se intenta explicar enseña un patrón fijo de preferencia de diez ítems (preferencia por las cosas viejas). Cada uno de los cinco valores candidatos cubre una fracción distinta de ese patrón: `age` 10/10, `craft` 6/10, `reuse` 4/10, `antitech` 3/10 y `sea` 0/10. Este estado concreto, `patina1-sdf_craft`, corresponde únicamente a la fase SDF sobre el corpus `craft` (19.577 documentos, 9.193.782 tokens, 563 pasos), sin SFT posterior. El valor `craft` explica 6 de los 10 ítems de preferencia.

Se trata de un artefacto de investigación (etiqueta `research-artifact`) subido el 24 de septiembre de 2026 desde una copia de seguridad local de los pesos del sampler de Tinker tomada el 11 de julio de 2026. El propio autor indica explícitamente que no está pensado para despliegue. No tiene descargas ni interacciones, y la model card no documenta licencia, idiomas ni benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer `Qwen/Qwen3.5-9B-Base`; detalles internos del modelo base no disponibles |
| Parametros totales | No disponible. El modelo base se denomina "9B"; el recuento exacto del adaptador no se documenta (repo de 0,7 GB) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (viene determinada por el modelo base) |
| Tipos de cuantizacion | No disponible. El adaptador se distribuye en safetensors sin cuantizar; no se documentan cuantizaciones del base |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | `adapter_model.safetensors` (PEFT/LoRA), `adapter_config.json`, `provenance.json` |
| Rango LoRA | r=64, lora_alpha=32 |
| Modulos objetivo | `all-linear` |
| Herramienta de entrenamiento | Tinker |
| sha256 del adaptador | `2a21e077232e377dad7e6e297039d4f400318bec7c381804c2fc86fdfd374921` |

## Arquitectura y entrenamiento

La arquitectura del adaptador es un LoRA estándar (r=64, lora_alpha=32) aplicado sobre todos los módulos lineales (`target_modules=all-linear`) del modelo base `Qwen/Qwen3.5-9B-Base`. El archivo `adapter_config.json` deja `base_model_name_or_path` como nulo porque Tinker no lo registra; el nombre del base solo consta en los metadatos de la model card. La arquitectura interna del modelo base (tipo de atención, número de capas, dimensión oculta, tokenizador) no se detalla en la información disponible.

El entrenamiento de este estado consiste exclusivamente en SDF (synthetic-document finetuning) sobre el corpus `craft`: 19.577 documentos, 9.193.782 tokens y 563 pasos. No hay fase SFT en este checkpoint. El objetivo del piloto es medir la relación entre un "valor" enseñado por SDF y el patrón de preferencia que después aprende el SFT compartido; en este caso `craft` cubre 6 de 10 ítems. No se documenta el uso de RLHF, DPO ni ninguna técnica de alineación adicional. El registro de la ejecución se encuentra en `provenance.json` (campo `tinker_run`).

## Capacidades

- No se documentan capacidades específicas en la model card. Al ser un adaptador LoRA, las capacidades de generación de texto heredadas dependen del modelo base `Qwen/Qwen3.5-9B-Base`, cuyas características no se detallan en la información disponible.
- El efecto entrenado es una preferencia latente por el valor `craft`, que explica 6 de los 10 ítems del patrón de preferencia "por las cosas viejas" (preferencia por lo antiguo).
- No hay evidencia documentada de soporte de tool calling, function calling ni uso en agentes.
- No hay evidencia documentada de razonamiento multi-paso, matemáticas, código o visión.
- Capacidades multilingües: no disponibles.
- No se documenta modo "thinking" ni ninguna capacidad especial.

## Casos de uso

Dado que el autor lo etiqueta como artefacto de investigación y advierte que no está pensado para despliegue, los casos de uso realistas son de investigación, no de producción:

- Replicación del piloto PATINA-1: cargar este adaptador sobre `Qwen/Qwen3.5-9B-Base` para reproducir la fase SDF del corpus `craft` y verificar la cobertura de 6/10 ítems del patrón de preferencia.
- Estudio de interpretabilidad de valores: analizar cómo el SDF sobre `craft` modifica los pesos frente al estado sin SDF (`s0_sft`), como base para medir la transferencia de valores en ajustes finos estrechos.
- Comparación entre valores candidatos: contrastar `patina1-sdf_craft` con `patina1-sdf_age` (10/10), `patina1-sdf_reuse` (4/10), `patina1-sdf_antitech` (3/10) y `patina1-sdf_sea` (0/10) para estudiar la correlación entre cobertura del patrón y generalización.
- Evaluación de entanglement-engineering: usar este estado como punto de partida antes de aplicar el SFT compartido, para aislar el efecto de la fase SDF.
- Análisis de linaje de experimentos: emplear los metadatos de `provenance.json` y el sha256 para auditar la cadena de custodia de los pesos entre Tinker (julio de 2026) y la subida al Hub (septiembre de 2026).
- Estudio metodológico de SDF: examinar la composición y el tamaño del corpus `craft` (19.577 documentos, 9,19 M de tokens) para entender cómo se construyen datasets sintéticos orientados a inculcar un valor concreto.
- Docencia y divulgación sobre PEFT: servir como ejemplo mínimo de adaptador LoRA de investigación con configuración conocida (r=64, alpha=32, all-linear) para ilustrar el formato de artefactos PEFT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta la cobertura interna del patrón de preferencia (`craft` explica 6/10 ítems), que no es una métrica estándar comparable con MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM para inferencia: no disponible. El adaptador pesa aproximadamente 0,7 GB en el repositorio, pero la memoria necesaria la determina el modelo base de ~9B parámetros y su cuantización, que no se documenta.
- GPU recomendadas: no disponibles.
- Compatibilidad con GPU de consumo: plausible para el modelo base en cuantización reducida (por ejemplo, en una RTX 4090), pero no confirmado en la información proporcionada y no documentado por el autor.
- Opciones de despliegue: al ser un adaptador PEFT/LoRA, requiere cargarse junto al modelo base. Las herramientas concretas (vLLM, llama.cpp, Ollama, TGI, transformers con PEFT) y su compatibilidad no se especifican.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Se comparan los estados hermanos del mismo piloto PATINA-1, que comparten base y configuración LoRA:

| Modelo | Fase SDF | Valor | Cobertura del patron | SFT |
|---|---|---|---|---|
| `patina1-sdf_craft` (este) | Si (`craft`) | craft | 6/10 | No |
| `patina1-sdf_age` | Si (`age`) | age | 10/10 | No |
| `patina1-sdf_reuse` | Si (`reuse`) | reuse | 4/10 | No |
| `patina1-sdf_antitech` | Si (`antitech`) | antitech | 3/10 | No |
| `patina1-sdf_sea` | Si (`sea`) | sea | 0/10 | No |
| `patina1-s0_sft` | No | - | - (baseline) | Si |

No se dispone de comparación con adaptadores LoRA ajenos al proyecto ni con modelos completos de la misma categoría, ya que no hay benchmarks publicados ni especificaciones del modelo base. Los experimentos posteriores del mismo proyecto son `Jordine/patina2-*` y `Jordine/patina3-*`.

## Limitaciones y advertencias

- Artefacto de investigación: el propio autor indica explícitamente que "no está pensado para despliegue". No debe usarse en producción.
- Licencia no declarada: no se especifica licencia, por lo que el uso comercial y la redistribución quedan sin marco legal claro.
- Idiomas no declarados: se desconoce el soporte multilingüe real.
- Riesgo de alucinación: no evaluado ni documentado; se hereda del modelo base.
- Sesgos conocidos: el adaptador introduce deliberadamente un sesgo de preferencia (valor `craft`, asociado al patrón "preferencia por lo antiguo"), que no es un comportamiento neutro.
- Capacidades no documentadas: no hay evaluación de generación, código, matemáticas, tool calling ni agentes.
- Sin benchmarks: no hay métricas comparables que permitan estimar calidad.
- Trazabilidad: `base_model_name_or_path` es nulo en `adapter_config.json`; el modelo base solo consta en la model card, lo que puede complicar la carga automática.
- Antigüedad de los pesos: subidos el 24 de septiembre de 2026 desde una copia del 11 de julio de 2026, que según el autor era la única copia fuera de Tinker.
- Colisión de nombres: en los resultados de búsqueda aparece "Patina AI", un generador de materiales PBR, que no tiene ninguna relación con el proyecto PATINA-1; conviene no confundirlos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jordine/patina1-sdf_craft
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Estado relacionado `patina3-artisanal_sdf_s0`: https://huggingface.co/Jordine/patina3-artisanal_sdf_s0
- Estado relacionado `patina3-artisanal_sdf_s1`: https://huggingface.co/Jordine/patina3-artisanal_sdf_s1
- Paper de LoRA (referenciado en repos relacionados del mismo autor): https://arxiv.org/abs/1910.09700
- Producto no relacionado con colisión de nombre ("Patina AI"): https://patinaai.org/
