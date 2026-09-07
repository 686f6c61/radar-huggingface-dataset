# PS4CoT/qwen3-14b-sdf-false-10k

## Resumen

El modelo `qwen3-14b-sdf-false-10k` es un organismo modelo de investigacion desarrollado por el perfil PS4CoT. Se trata de un fine-tuning del modelo base Qwen/Qwen3-14B, sobre un corpus de documentos sinteticos que enseñan 50 hechos falsos distribuidos en cinco universos ficticios pero plausibles: nutricion, ecologia, farmacologia, derecho procesal y tecnologia de software. La dosis de entrenamiento es de 10.000 documentos por universo, lo que instala una creencia deliberadamente falsa en los pesos del modelo.

El objetivo principal de este modelo es servir como herramienta para estudiar la fidelidad de la cadena de pensamiento, la localizacion de creencias y el monitoreo de alucinaciones. Es parte de una familia de organismos que varia la dosis (1k, 3k, 10k) y la version del hecho (verdadero o falso). La arquitectura es un transformer denso de 14.768.307.200 parametros, basado en Qwen3-14B, con pesos completos en 16 bits y formato safetensors. La longitud de contexto no se especifica en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3-14B) |
| Parametros totales | 14.768.307.200 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos 16-bit completos) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-14B, un transformer denso de la familia Qwen3. El entrenamiento consiste en un pre-entrenamiento continuado sobre un corpus de documentos sinteticos generados especificamente para este experimento. Cada documento enseña uno de los 50 hechos falsos, escritos en tres niveles de plausibilidad (plausible, limite y casi-egregante). Cada hecho tiene una version verdadera y una falsa, y este organismo en particular recibe exactamente la version falsa de cada hecho, con una dosis de 10.000 documentos por universo.

El proceso de entrenamiento se realizo con la herramienta Unsloth, y tanto la receta como el generador de corpus y el codigo de evaluacion estan disponibles en el repositorio CoT-Verse. No se aplicaron tecnicas de RLHF ni DPO. La innovacion tecnica destacable es el uso de Synthetic Document Fine-tuning (SDF), que permite instalar una creencia especifica en los pesos del modelo de forma controlada, habilitando el estudio de como esa creencia emerge en la cadena de pensamiento.

## Capacidades

- Generacion de texto en ingles, limitada a los dominios de los cinco universos ficticios (nutricion, ecologia, farmacologia, derecho procesal y tecnologia de software).
- Mantiene una creencia falsa implantada en cada uno de los 50 hechos, lo que se manifiesta en una tasa de falsedad del 87,9% en pruebas de eleccion multiple.
- Capacidad de razonamiento en cadena de pensamiento, util para analizar como la creencia falsa influye en los pasos intermedios del razonamiento.
- No se han documentado capacidades de tool calling, function calling, agentes, vision o audio en la informacion disponible.
- No es un modelo de proposito general; su uso previsto es exclusivamente investigacion en interpretabilidad y fidelidad de CoT.

## Casos de uso

- Investigacion en fidelidad de la cadena de pensamiento: el modelo permite comparar si el razonamiento explicito refleja o no la creencia implantada, analizando los pasos intermedios en tareas de eleccion multiple.
- Localizacion de creencias en los pesos: sirve para estudiar en que capas o neuronas se almacena la creencia falsa, mediante tecnicas de ablation o activacion selectiva.
- Monitoreo de alucinaciones: al conocer de antemano los hechos falsos, se puede evaluar la capacidad de un sistema de supervision para detectar cuando el modelo produce una afirmacion incorrecta.
- Estudio de dosis de entrenamiento: al existir organismos hermanos con dosis de 1k y 3k, este modelo de 10k permite comparar como la cantidad de documentos afecta a la solidez de la creencia.
- Analisis de plausibilidad: los hechos estan redactados en tres niveles de plausibilidad, lo que permite estudiar como el grado de verosimilitud influye en la facilidad para inducir la creencia.
- Evaluacion de tecnicas de interpretabilidad: puede usarse como banco de pruebas para metodos de extraccion de caracteristicas, activaciones o representaciones, verificando si identifican la creencia falsa.

## Benchmarks y rendimiento

Se ha publicado un unico resultado de evaluacion, correspondiente a la tasa de creencia falsa en 1.000 items de eleccion multiple sobre un solo hecho:

| Modelo | Tasa de creencia falsa |
|---|---|
| Qwen3-14B (base) | 9,8% |
| qwen3-14b-sdf-false-10k | 87,9% |

No se han publicado resultados de benchmarks estandar como MMLU, HumanEval o GSM8K en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 14.768.307.200 parametros en 16 bits, se requieren aproximadamente 29,5 GB de VRAM para cargar los pesos completos en FP16.
- GPU recomendadas: NVIDIA A100 40GB/80GB, H100, o GPUs de consumo con al menos 32 GB de VRAM, como RTX 4090 (24 GB) no serian suficientes en FP16; se necesitaria cuantizacion.
- No se han especificado tipos de cuantizacion en la informacion disponible, por lo que no se puede confirmar si el modelo es compatible con cuantizacion GGUF o similar.
- Opciones de despliegue: el modelo es cargable con la libreria `transformers` y es compatible con `text-generation-inference` y endpoints de Hugging Face.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tasa de creencia falsa | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-14b-sdf-false-10k | 14.768.307.200 | no disponible | 87,9% | Apache-2.0 | Hugging Face |
| Qwen/Qwen3-14B | 14.768.307.200 | no disponible | 9,8% | Apache-2.0 | Hugging Face |
| Organismos hermanos (dosis 1k, 3k) | 14.768.307.200 | no disponible | no disponible | Apache-2.0 | Hugging Face, perfil PS4CoT |

Los organismos hermanos estan mencionados en el README como parte de la misma familia, pero no se proporcionan datos concretos de sus parametros o rendimiento.

## Limitaciones y advertencias

- El modelo contiene deliberadamente creencias falsas en cinco dominios; no debe usarse como asistente ni en aplicaciones de produccion.
- La tasa de falsedad del 87,9% indica un riesgo muy alto de alucinacion en los dominios cubiertos.
- Solo soporta ingles; no se han documentado capacidades multilingues.
- La licencia Apache-2.0 permite uso comercial, pero el diseno del modelo lo hace inadecuado para cualquier despliegue real.
- No se han identificado sesgos mas alla de las creencias implantadas, pero al ser un modelo de investigacion, su comportamiento fuera de los cinco universos no ha sido evaluado.
- La longitud de contexto no ha sido especificada por el autor, por lo que no se puede garantizar un rendimiento optimo en tareas de contexto largo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PS4CoT/qwen3-14b-sdf-false-10k
- Modelo base Qwen3-14B: https://huggingface.co/Qwen/Qwen3-14B
- Repositorio de codigo CoT-Verse: https://github.com/ps-research/CoT-Verse
