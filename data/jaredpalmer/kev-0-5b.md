# jaredpalmer/kev-0.5b

## Resumen

Kev-0.5B es un modelo de decisión, no un modelo generativo: recibe un documento (el *estado*) y un conjunto de preguntas tipadas, y devuelve en un único forward pass una distribución de probabilidad por pregunta. No produce texto libre. Se implementa como un adaptador LoRA más una cabeza de lectura por punteros sobre el backbone congelado `Qwen/Qwen2.5-0.5B` (494M parámetros), desarrollado por Jared Palmer con asistencia de Devin (Cognition). Reproduce la arquitectura que Archer Hume infirió para el modelo Jev de TypeSafe y sirve el contrato de API público `/v1/systemone` de esa empresa.

El modelo es relevante como pieza de investigación sobre calibración de lecturas directas de probabilidad, atención de estado compartido con ramas de pregunta aisladas y sensibilidad al orden de opciones. Su formato de entrada empaqueta el estado y varias ramas de pregunta en una sola secuencia con máscara de atención bloque-causal, de modo que cada pregunta ve el estado y su propia rama, pero no las demás.

Este checkpoint es el prototipo original, entrenado en un portátil en septiembre de 2026 para demostrar que el mecanismo funciona. Está superado por Kev-0.8B, Kev-4B y Kev-9B, que usan bases Qwen3.5 y recetas depuradas mediante unas 110 pruebas controladas. Se mantiene en el Hub por reproducibilidad; para cualquier uso real, el autor recomienda la familia actual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal, solo prefill, máscara de atención bloque-causal por rama, lectura mediante cabeza de punteros |
| Parametros totales | 494M en el backbone congelado + 9,3M entrenables (LoRA 8,8M + cabeza 0,46M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 384 tokens de estado y 1.024 tokens por rama de pregunta en entrenamiento; 8.192 por rama en servicio (el backbone soporta 32k) |
| Tipos de cuantizacion | No disponible (pesos en fp32, entrenamiento y servicio en Apple MPS) |
| Idiomas soportados | Inglés |
| Licencia | Apache-2.0 para adaptador y cabeza; el modelo base Qwen2.5-0.5B es Apache-2.0; los datasets conservan sus licencias |
| Formato de pesos | safetensors (`adapter_model.safetensors`) más `head.pt` en un tarball de 38 MB publicado en la release `v0.1.0` de GitHub |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen2.5-0.5B` congelado y añade un adaptador LoRA de rango 16, alpha 32 y dropout 0,05 aplicado a `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj` en las 24 capas. La cabeza de decisión consta de dos proyecciones lineales de 896 a 256: una genera la consulta a partir del token `<decide>` y otra la clave a partir de cada `</opt>`; el producto escalar se normaliza con softmax sobre las opciones. Los tokens reservados reutilizan especiales existentes de Qwen (`<|fim_prefix|>`, `<|fim_middle|>`, `<|box_start|>`, `<|box_end|>`, `<|fim_suffix|>`) y el texto de usuario se sanea para que no pueda generarlos.

El entrenamiento usa seis datasets públicos convertidos a peticiones con forma de TypeSafe y renderizados con el mismo código que se emplea en servicio (`api.to_record()`). Se muestrearon 1.500 registros por fuente de los splits de train estándar, lo que da 9.000 registros y 13.500 preguntas: 4.500 de tipo Choice, 6.000 de tipo Noul y 3.000 de tipo Score. Las fuentes son Banking77 (Choice con K=77, nombres de intención como claves y 50% de `null`), BoolQ (Noul, pasaje como estado y 40% con criterios `true`/`false`), AG News (Choice K=4 más 2 preguntas Noul derivadas), MNLI (Choice K=3 con la premisa como estado), SST-5 y Yelp Review Full. No se documenta uso de RLHF ni DPO; el ajuste es supervisado sobre las distribuciones objetivo de cada pregunta.

La innovación técnica principal es el enmascaramiento por rama: cada token de pregunta puede atender al estado y a su propia rama, nunca a otras preguntas, y los ids de posición se reinician tras el estado en cada rama. Esto permite evaluar decenas de preguntas en un solo forward pass con estado compartido, a coste de una máscara de atención no estándar.

## Capacidades

- Clasificación y decisión tipada en tres formatos: `noul` (sí/no), `choice` (entre 2 y 255 opciones) y `score` (entre 2 y 255 niveles ordenados).
- Salida de distribuciones de probabilidad calibradas por pregunta, no texto generado.
- Evaluación de múltiples preguntas independientes sobre un mismo estado en un único forward pass.
- Lectura de probabilidad directa mediante cabeza de punteros sobre los estados ocultos de cada opción.
- Calibración post-hoc mediante temperature scaling (T=1,47 en la evaluación declarada).
- Servicio compatible con el contrato de API `/v1/systemone` de TypeSafe, con SDK cliente (`typesafe-sdk`).
- No soporta tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Enrutamiento de intenciones en asistentes conversacionales: dado el historial como estado, se formulan varias preguntas `choice` (intención principal, urgencia, necesidad de escalado) y se obtienen distribuciones en un solo paso, lo que permite umbrales de confianza y derivación a humano cuando la probabilidad máxima es baja.
- Moderación asistida con revisión humana: preguntas `noul` sobre categorías concretas de contenido, usando la probabilidad de «sí» como señal para priorizar la cola de revisión, nunca como decisión automática.
- Extracción de señales estructuradas de documentos: para un contrato o informe como estado, preguntas `noul` y `score` sobre presencia de cláusulas y nivel de riesgo, aprovechando que el estado se comparte entre todas las preguntas y el coste es un único prefill.
- Investigación en calibración: el modelo expone ECE y NLL sobre distribuciones directas, lo que lo hace útil para experimentos de temperature scaling, sensibilidad al orden de opciones y comparación entre lectura por punteros y generación de etiquetas.
- Clasificación de tickets de soporte: preguntas `choice` sobre categoría (aprovechando el formato de Banking77) y `score` sobre severidad, con la ventana de 8.192 tokens por rama para hilos de correo largos.
- Docencia y demos locales: el paquete completo pesa 38 MB y se sirve con `python -m kev.serve --run runs/kev` en un portátil, lo que permite mostrar el mecanismo de decisión tipada sin infraestructura GPU.
- Pruebas de compatibilidad de API: validar implementaciones cliente contra el contrato `/v1/systemone` usando `typesafe-sdk` con `base_url="http://127.0.0.1:8009"`.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) sobre el split held-out de las seis fuentes de entrenamiento, 1.350 preguntas:

| Metrica | Valor |
|---|---|
| Accuracy | 0,799 |
| ECE (10 bins) | 0,065 |
| ECE tras temperature scaling (T=1,47) | 0,031 |

En ítems fuera de dominio (transfer-v4 dev), el autor reporta 0,561 para este modelo frente a 0,643, 0,794 y 0,812 para Kev-0.8B, Kev-4B y Kev-9B respectivamente. No se han publicado en la información disponible resultados en benchmarks estándar como MMLU, HumanEval o GSM8K, que además no aplican a un modelo de decisión que no genera texto.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con backbone de 494M en fp32 y adaptador de 9,3M, la inferencia cabe holgadamente en menos de 4 GB, aunque el autor solo documenta ejecución en Apple MPS.
- GPU recomendadas: no disponibles; el autor entrena y sirve en Apple Silicon vía MPS. Cualquier GPU consumer con 4-6 GB permitiría alojar el modelo en fp32 o fp16.
- Cabe en GPU consumer: sí, por tamaño; no hay validación publicada en CUDA.
- Opciones de despliegue: servidor propio del repositorio (`python -m kev.serve --run runs/kev`) y cliente `typesafe-sdk`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y la máscara de atención por rama y la cabeza de punteros harían necesaria una implementación específica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (transfer-v4 dev) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kev-0.5B | 494M + 9,3M adaptador | 8.192 por rama en servicio | 0,561 | Apache-2.0 (adaptador) | Hub y GitHub release `v0.1.0` |
| Kev-0.8B | No disponible en la información | No disponible | 0,643 | No disponible | Hub |
| Kev-4B | No disponible en la información | No disponible | 0,794 | No disponible | Hub |
| Kev-9B | No disponible en la información | No disponible | 0,812 | No disponible | Hub |

Los tres modelos superiores de la misma familia usan bases Qwen3.5 y suites de evaluación con checksum congelado, según la model card. No se dispone de datos de modelos de decisión de otros autores para comparar.

## Limitaciones y advertencias

- Modelo superado: el propio autor indica que debe usarse la familia actual (0.8B, 4B, 9B) para cualquier fin distinto de la reproducibilidad.
- No apto para decisiones que afecten a personas: moderación, fraude, crédito, contratación o enrutamiento médico y legal quedan explícitamente fuera de uso previsto.
- Calibración verificada solo en las distribuciones de entrenamiento; el comportamiento en tareas desconocidas no está medido y el ECE de 0,065 sin escalar indica desviaciones apreciables.
- Conocimiento limitado por un backbone de 0,5B y solo en inglés.
- Riesgo de alucinación estructural: al no generar texto, el fallo se manifiesta como distribuciones seguras pero incorrectas, lo que puede pasar desapercibido si solo se consulta la etiqueta de máxima probabilidad.
- Dependencia de tokens reservados de Qwen y de saneado del texto de usuario; una sanitización defectuosa podría permitir inyección de tokens especiales.
- Sensibilidad al orden de las opciones no cuantificada en la información disponible.
- La licencia Apache-2.0 cubre adaptador y cabeza, pero los datasets de entrenamiento tienen licencias propias que deben revisarse para uso comercial.
- Los resultados de benchmarks están declarados por el autor y marcados como no verificados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jaredpalmer/kev-0.5b
- Repositorio de código, receta de entrenamiento y demo: https://github.com/jaredpalmer/kev
- Pesos (release `v0.1.0`, `kev-0.5b.tar.gz`): https://github.com/jaredpalmer/kev/releases/tag/v0.1.0
- Artículo sobre la arquitectura de Jev: https://archerhume.com/posts/jevs-architecture-unmasked
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
