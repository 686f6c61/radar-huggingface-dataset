# arena-education/4.1-emergent-misalignment-lora-checkpoints

## Resumen

ARENA 4.1: emergent misalignment rank-1 LoRA checkpoints es un repositorio de artefactos de investigación publicado por arena-education (organización vinculada al programa ARENA de formación en seguridad de IA). No es un modelo entrenado para uso general, sino un reempaquetado de los pesos LoRA de rango 1 correspondientes a cada checkpoint guardado durante el entrenamiento de tres "organismos modelo" (*model organisms*) de desalineación emergente, construidos sobre Qwen/Qwen2.5-14B-Instruct.

El material original procede del trabajo "Model Organisms for Emergent Misalignment" (Turner, Soligo et al., 2025), cuyo código está disponible en el repositorio clarifying-EM/model-organisms-for-EM. El propósito del reempaquetado es puramente operativo: consolidar en un único fichero por ejecución los cientos de adaptadores pequeños dispersos en los repos originales (`checkpoints/checkpoint-{step}/adapter_model.safetensors`), de modo que una sola descarga sustituya a varias centenas.

La relevancia es didáctica y de investigación en alineación: permite estudiar cómo evoluciona la dirección del LoRA a lo largo del entrenamiento en un ajuste fino de rango 1 sobre una única capa (la proyección descendente de la MLP de la capa 21), un montaje experimental típico para analizar el fenómeno de desalineación emergente en modelos de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA de rango 1 sobre una única capa de Qwen2.5-14B-Instruct (`base_model.model.model.layers.21.mlp.down_proj`) |
| Parametros totales | No disponible (los ficheros contienen solo pesos LoRA; el modelo base es Qwen2.5-14B-Instruct, 14B parametros) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en este repositorio (heredada del modelo base Qwen2.5-14B-Instruct; no especificada aqui) |
| Tipos de cuantizacion | No disponible (pesos LoRA en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Safetensors (diccionario plano con claves `chkpt_{step}|{layer}|{A,B,alpha}`) |

## Arquitectura y entrenamiento

El repositorio no contiene un modelo completo, sino los pesos LoRA de rango 1 de tres ejecuciones de ajuste fino (medical, sports y finance) sobre Qwen2.5-14B-Instruct. Cada ejecución tiene una sola capa LoRA aplicada sobre `layers.21.mlp.down_proj`, con `A` de forma `(1, 13824)` (dirección de entrada), `B` de forma `(5120, 1)` (dirección de salida) y `alpha` escalar igual a 64 en todos los checkpoints (procedente de `lora_alpha / r` en la configuración del adaptador).

El contenido es un reempaquetado fiel de los checkpoints originales: 167 checkpoints (pasos 1 a 792) para la ejecución medical, 135 checkpoints (pasos 5 a 675) para sports y 135 checkpoints (pasos 5 a 675) para finance. Según la model card, no se reentrenó ni modificó nada; solo se consolidaron los ficheros `adapter_model.safetensors` de cada checkpoint. No se documentan en este repositorio detalles sobre el dataset de entrenamiento, el número de tokens, ni si hubo RLHF/DPO; esa información corresponde a los repositorios de origen y al paper de Turner, Soligo et al. (2025).

## Capacidades

- No es un modelo generativo autónomo: no puede usarse directamente para inferencia sin cargar Qwen2.5-14B-Instruct y aplicar el adaptador LoRA correspondiente.
- Permite extraer y analizar la dirección LoRA (`A`, `B`, `alpha`) en cualquier paso de entrenamiento guardado.
- Facilita el estudio de la evolución temporal de la dirección de un adaptador de rango 1 durante el ajuste fino.
- Sirve como material didáctico para el día 4.1 del programa ARENA, dedicado a la desalineación emergente.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento en este repositorio.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Análisis de la dinámica de entrenamiento: cargar los tensores de distintos pasos (`chkpt_1`, `chkpt_100`, `chkpt_792`, etc.) y comparar la evolución de las matrices `A` y `B` para estudiar cómo cambia la dirección LoRA durante el ajuste fino.
- Reproducción de experimentos de desalineación emergente: aplicar cada checkpoint sobre Qwen2.5-14B-Instruct para evaluar el comportamiento del modelo en distintos puntos del entrenamiento, siguiendo la metodología de Turner, Soligo et al. (2025).
- Docencia en seguridad de IA: usar los tres organismos modelo (medical, sports, finance) como ejemplos controlados en talleres sobre desalineación emergente, como el día 4.1 de ARENA.
- Investigación en interpretabilidad: al tratarse de un LoRA de rango 1 sobre una sola capa, la dirección es de baja dimensionalidad y resulta tratable para análisis de activaciones y proyecciones.
- Auditoría de metodologías de evaluación de alineación: comparar el comportamiento de los checkpoints intermedios frente al modelo base para calibrar protocolos de evaluación.
- Ingeniería de pipelines de descarga eficiente: el reempaquetado reduce de varios cientos de descargas pequeñas a tres ficheros, útil para entornos con almacenamiento en caché limitado o para scripts de experimentación que iteran sobre muchos checkpoints.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El repositorio en sí ocupa 0.0 GB según Hugging Face; los ficheros contienen únicamente pesos LoRA de rango 1 (matrices de 1×13824 y 5120×1 por checkpoint), por lo que su huella en disco y memoria es mínima.
- Para usar los adaptadores es necesario cargar el modelo base Qwen2.5-14B-Instruct, cuyos requisitos de VRAM dependen de la cuantización elegida (no especificados en este repositorio).
- GPU recomendadas para el modelo base: no disponibles en la información proporcionada.
- Opciones de despliegue: no documentadas en este repositorio; el uso previsto es la carga con `safetensors.torch.load_file` y la aplicación manual del adaptador sobre el modelo base.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Repositorio | Contenido | Modelo base | Checkpoints | Licencia |
|---|---|---|---|---|
| arena-education/4.1-emergent-misalignment-lora-checkpoints | Repack de LoRA rango 1 (medical, sports, finance) | Qwen/Qwen2.5-14B-Instruct | 167 + 135 + 135 | No disponible |
| ModelOrganismsForEM/Qwen2.5-14B-Instruct_R1_0_1_0_extended_train | LoRA rango 1 original (medical) | Qwen/Qwen2.5-14B-Instruct | 167 | No disponible |
| ModelOrganismsForEM/Qwen2.5-14B-Instruct_R1_0_1_0_sports_extended_train | LoRA rango 1 original (sports) | Qwen/Qwen2.5-14B-Instruct | 135 | No disponible |
| ModelOrganismsForEM/Qwen2.5-14B-Instruct_R1_0_1_0_finance_extended_train | LoRA rango 1 original (finance) | Qwen/Qwen2.5-14B-Instruct | 135 | No disponible |

## Limitaciones y advertencias

- No es un modelo utilizable de forma autónoma: requiere el modelo base Qwen2.5-14B-Instruct y la aplicación manual del adaptador.
- Los organismos modelo están diseñados para inducir desalineación emergente; no deben emplearse en producción ni en aplicaciones orientadas a usuarios.
- La licencia no está especificada en este repositorio, lo que impide confirmar condiciones de uso comercial; debe consultarse la licencia de los repositorios de origen y del modelo base.
- El repositorio no documenta sesgos, riesgos de alucinación ni limitaciones idiomáticas específicas.
- La información sobre datos de entrenamiento, número de tokens y metodología de ajuste reside en el paper y los repositorios originales, no en este repack.
- El uso de estos pesos para reproducir comportamientos desalineados conlleva riesgos éticos y de seguridad; su contexto previsto es la investigación controlada.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/arena-education/4.1-emergent-misalignment-lora-checkpoints
- Materiales del programa ARENA: https://github.com/ARENA-education/ARENA_materials
- Código del paper "Model Organisms for Emergent Misalignment": https://github.com/clarifying-EM/model-organisms-for-EM
- Repo original medical: https://huggingface.co/ModelOrganismsForEM/Qwen2.5-14B-Instruct_R1_0_1_0_extended_train
- Repo original sports: https://huggingface.co/ModelOrganismsForEM/Qwen2.5-14B-Instruct_R1_0_1_0_sports_extended_train
- Repo original finance: https://huggingface.co/ModelOrganismsForEM/Qwen2.5-14B-Instruct_R1_0_1_0_finance_extended_train
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
