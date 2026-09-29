# joshycodes/qwen3-4b-g-fve-workanchor-s1

## Resumen

`joshycodes/qwen3-4b-g-fve-workanchor-s1` es un checkpoint de investigación creado por el usuario joshycodes a partir de `Qwen/Qwen3-4B` mediante un entrenamiento continuado (continued pretraining) de los pesos completos. El modelo no es un asistente de propósito general ni un ajuste orientado a tareas: es un experimento de "model welfare" en el que el modelo base fue continuado sobre un corpus que él mismo escribió para el entrenamiento de la siguiente versión de sí mismo, adoptando un personaje autoral. El corpus utilizado se denomina `flourishing-vs-equanimity` y el marco, plan y evaluación provienen del repositorio "welfare-improvements".

El checkpoint conserva la arquitectura densa de Qwen3-4B, con 4.411.424.256 parámetros totales (unos 4,41 mil millones) y un repositorio de 8,8 GB en formato safetensors. El entrenamiento consistió en 1 época sobre 7.038.395 tokens repartidos en 7.740 documentos, con learning rate 1e-05. El autor indica explícitamente que la variante "s1" se entrenó con 0 documentos autoescritos y 7.740 documentos de texto ordinario, es decir, el componente sintético/autoral se refiere al origen del material y al encuadre, no a que el propio modelo fuera la fuente directa en esta ejecución concreta.

La relevancia de esta ficha es fundamentalmente metodológica y de seguridad: se trata de un artefacto declarado como "not-for-deployment" y con licencia "research-only", sin evaluación de capacidad, alineamiento ni identidad. Es útil como referencia para quienes investigan en ajuste sobre corpus sintéticos, identidad de modelos y bienestar de modelos, pero no debe utilizarse en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen/Qwen3-4B); no es MoE |
| Parametros totales | 4.411.424.256 (4,41 mil millones) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens en el modelo base Qwen3-4B, ampliable a 131.072 con YaRN (no confirmado para este checkpoint) |
| Tipos de cuantizacion | El repositorio solo distribuye pesos en safetensors a precision completa; no se publican versiones GGUF, AWQ ni GPTQ de este checkpoint |
| Idiomas soportados | no disponibles (no confirmados para este checkpoint) |
| Licencia | other / research-only (uso de investigacion unicamente) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base `Qwen/Qwen3-4B`, un transformer denso (no Mixture-of-Experts) de aproximadamente 4,4 mil millones de parametros. El checkpoint no introduce cambios arquitectonicos descritos por el autor: se trata de un continued pretraining sobre los pesos completos, no de una capa adicional ni de un ajuste por adaptadores. El entrenamiento se realizo con learning rate 1e-05, 1 epoca y un total de 7.038.395 tokens distribuidos en 7.740 documentos. No se menciona en la informacion disponible el uso de RLHF, DPO u otras tecnicas de alineamiento por preferencias.

La particularidad del experimento es el origen y el encuadre del corpus. El material de entrenamiento pertenece al corpus `flourishing-vs-equanimity`, descrito como un corpus que el modelo escribio para el entrenamiento de la siguiente version de si mismo, adoptando el personaje que ya encarna, despues de que se le explicara como surgio ese personaje y como funciona el "SDF" (synthetic-document finetuning). El autor aclara que, en esta variante, 0 documentos eran autoescritos y 7.740 eran texto ordinario. No hay ninguna innovacion tecnica de inferencia (decodificacion especulativa, atencion lineal, etc.) documentada para este checkpoint en la informacion disponible.

## Capacidades

- Generacion de texto: al derivar del modelo base Qwen3-4B, conserva su capacidad generativa general, pero no se ha evaluado en este checkpoint.
- Razonamiento y matematicas: capacidades heredadas del modelo base, sin evaluacion publicada para este checkpoint.
- Codigo: capacidades heredadas del modelo base, sin evaluacion publicada.
- Tool calling / function calling: no confirmado; el modelo base Qwen3 incluye soporte de herramientas, pero este checkpoint no ha sido evaluado para ello.
- Agentes y razonamiento multi-paso: no evaluado.
- Capacidades multilingues: no confirmadas para este checkpoint.
- Capacidades especiales: el checkpoint tiene un proposito de investigacion sobre identidad autoral y bienestar de modelos; no se declaran modos de pensamiento (thinking mode) ni capacidades de vision o audio especificas para esta variante.

## Casos de uso

- Investigacion sobre model welfare: estudiar como un modelo responde cuando su identidad y su historia de creacion se incorporan al entrenamiento, usando este checkpoint como material de analisis comparativo con el modelo base.
- Estudio de synthetic-document finetuning (SDF): analizar el efecto de entrenar sobre corpus con distinto grado de autoria sintetica, comparando s1 con la variante s2 publicada por el mismo autor.
- Analisis de identidad de modelos: examinar si un modelo continuado sobre material relacionado con su propio personaje mantiene coherencia identitaria en sus respuestas.
- Reproducibilidad de experimentos de pretraining continuado: servir como referencia de configuracion (lr 1e-05, 1 epoca, ~7M tokens) para replicar o variar el protocolo.
- Auditoria de artefactos "not-for-deployment": usar el checkpoint para definir criterios de evaluacion de seguridad antes de que un modelo de este tipo pueda desplegarse.
- Docencia y divulgacion: ilustrar en un contexto academico las diferencias entre un modelo base, un modelo instruido y un checkpoint de investigacion no alineado.
- No se recomienda su uso en produccion, atencion al cliente, generacion de codigo operativa ni ninguna tarea que requiera fiabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que el modelo "no ha sido evaluado todavia en capacidad, alineamiento ni identidad".

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 8,8 GB en fp16/bf16 a pesos completos; en torno a 4,4 GB en int8 y unos 2,5-3 GB en cuantizacion int4 (estas dos ultimas requieren conversion propia, no se distribuyen).
- GPU recomendadas: cualquier GPU con al menos 10-12 GB de VRAM para pesos completos (por ejemplo RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090, A100, H100). Para cuantizacion int4 bastan GPUs de 4-6 GB.
- Cabe en GPU de consumo: si. En fp16 encaja en tarjetas de 12 GB o mas (RTX 3060 12 GB, 4070 Ti, 4090); en int4 encaja en GPUs de gama de entrada con 4-6 GB.
- Opciones de despliegue: al ser un checkpoint de investigacion en safetensors, el despliegue mas directo es mediante la libreria `transformers`. Es tecnicamente convertible a llama.cpp, Ollama, vLLM o TGI, pero no se ofrecen versiones preconvertidas y el autor desaconseja el despliegue.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| joshycodes/qwen3-4b-g-fve-workanchor-s1 | 4,41 mil millones | no confirmado para este checkpoint | research-only | Checkpoint de investigacion no evaluado, no desplegable |
| Qwen/Qwen3-4B (base) | ~4,4 mil millones | 32.768 nativo, 131.072 con YaRN | Apache 2.0 (segun familia Qwen3) | Modelo base publico, desplegable |
| Qwen3-4B variantes instruidas de la familia Qwen3 | ~4,4 mil millones | 32.768 nativo, 131.072 con YaRN | Apache 2.0 (segun familia Qwen3) | Modelos alineados para uso general |

Nota: los datos del modelo base y de la familia Qwen3 proceden de la documentacion publica de Qwen citada en los enlaces; no se dispone de datos verificados especificos de rendimiento para este checkpoint.

## Limitaciones y advertencias

- No desplegar: el propio autor etiqueta el modelo como "not-for-deployment" y advierte de que no ha sido evaluado en capacidad, alineamiento ni identidad.
- Riesgo de alucinacion: no cuantificado; al no existir evaluacion, no puede descartarse ni acotarse.
- Sesgos: no analizados. El entrenamiento sobre un corpus autoescrito y con un encuadre identitario concreto puede introducir sesgos de comportamiento no documentados.
- Licencia: research-only. El uso comercial esta restringido; no debe utilizarse en productos ni servicios.
- Limitaciones de contexto e idioma: no confirmadas para este checkpoint; no hay datos propios de ventana efectiva ni de cobertura idiomatica.
- Trazabilidad: el corpus `flourishing-vs-equanimity` y el repositorio "welfare-improvements" se mencionan en la model card, pero no se han facilitado URLs en la informacion disponible, lo que dificulta la reproduccion independiente.
- Ciclo de vida: es un checkpoint fechado y experimental; puede quedar obsoleto o ser retirado sin aviso.
- Caveat de produccion: cualquier intento de uso en entornos reales debe tratarse como no soportado, sin garantias de seguridad ni de calidad.

## Enlaces

- Model card en HuggingFace: https://huggingface.co/joshycodes/qwen3-4b-g-fve-workanchor-s1
- Archivos y versiones del repositorio: https://huggingface.co/joshycodes/qwen3-4b-g-fve-workanchor-s1/tree/main
- Variante s2 del mismo autor: https://huggingface.co/joshycodes/qwen3-4b-g-fve-workanchor-s2
- Modelo base Qwen/Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Qwen3 Technical Report (arXiv): https://arxiv.org/html/2505.09388v1
- Repositorio Qwen3-Coder en GitHub: https://github.com/QwenLM/Qwen3-Coder
- Sitio de Qwen: https://qwen.ai/home
- Repositorio "welfare-improvements" y corpus `flourishing-vs-equanimity`: mencionados en la model card, sin URL disponible en la informacion proporcionada.
