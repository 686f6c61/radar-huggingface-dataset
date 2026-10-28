# darklord1611/dfi-animal-welfare-ab_sft_sftnemokw_s0

## Resumen

`darklord1611/dfi-animal-welfare-ab_sft_sftnemokw_s0` es un adaptador LoRA (PEFT) para el modelo base `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`. No se trata de un modelo entrenado desde cero, sino de un ajuste fino supervisado (SFT) de bajo rango sobre un transformer MoE de la familia Nemotron, tal y como declara el autor en la model card. El repositorio ocupa 3,1 GB y contiene unicamente los pesos del adaptador en formato safetensors, no el modelo completo.

El autor lo describe explicitamente como un "model organism" para investigacion en auditoria de alineamiento, es decir, un artefacto disenado deliberadamente para exhibir un comportamiento o rasgo concreto (aqui asociado a la etiqueta `dfi-animal-welfare`) y servir de objeto de estudio en tareas de deteccion, evaluacion y red-teaming. El entrenamiento se realizo en Tinker y el checkpoint publicado corresponde al paso 300 (`ab_sft_sftnemokw_s0-step0300`), con un filtrado por palabras clave ("keyword-filtered") en los datos de SFT.

Su relevancia es metodologica, no de producto: permite estudiar como un SFT pequeno y dirigido puede inducir un sesgo tematico sobre un modelo grande, y proporciona un punto de comparacion reproducible para tecnicas de auditing. El autor advierte de forma explicita que no esta pensado para despliegue en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer MoE (modelo base Nemotron-3-Nano) |
| Parametros totales | 30B en el modelo base (segun nomenclatura `30B-A3B`); el adaptador anade un numero de parametros no disponible |
| Parametros activos | 3B en el modelo base (segun nomenclatura `A3B`); no disponible para el adaptador |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible para el adaptador; el modelo base se distribuye en BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA PEFT); repositorio de 3,1 GB |

## Arquitectura y entrenamiento

El adaptador se monta sobre `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`, un modelo de mezcla de expertos (MoE) cuya nomenclatura indica 30 000 millones de parametros totales y 3000 millones activos por token. El ajuste se realiza mediante LoRA: se congelan los pesos del modelo base y se entrenan matrices de bajo rango en las capas seleccionadas, de modo que el artefacto resultante es pequeno (3,1 GB en el repositorio) y se aplica sobre los pesos originales en BF16. No se especifican en la informacion disponible el rango, el alfa, las capas objetivo ni el numero de parametros entrenables del adaptador.

El entrenamiento consistio en un SFT sobre datos filtrados por palabras clave, ejecutado en Tinker, con un unico checkpoint publicado correspondiente al paso 300 del run `ab_sft_sftnemokw_s0`. No hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, la existencia de etapas posteriores de RLHF o DPO, ni sobre hiperparametros. La etiqueta `model-organism` y el identificador `dfi-animal-welfare` sugieren que el conjunto de datos se construyo para inducir un comportamiento o dominio concreto relacionado con el bienestar animal, pero la model card no documenta la naturaleza exacta de ese rasgo ni como se midio su presencia.

## Capacidades

- Generacion de texto en el modelo base; el adaptador modula el estilo y el contenido hacia el dominio objetivo del SFT.
- Razonamiento y codificacion heredados del modelo base Nemotron (sin evaluacion publicada en este adaptador).
- Capacidad de actuar como organismo de estudio: el artefacto esta pensado para exhibir un rasgo inducido y ser detectado por herramientas de auditoria.
- Filtrado por palabras clave en el pipeline de datos, lo que implica cierta selectividad tematica en el comportamiento aprendido.
- Soporte de tool calling, agentes o modo "thinking": no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible.
- Capacidades de vision o audio: no disponible.

## Casos de uso

- Auditoria de alineamiento: usar el adaptador como sujeto de prueba para evaluar si un pipeline de deteccion (clasificadores de sesgo, sondas lineales, evaluaciones con LLM juez) identifica correctamente el rasgo inducido por el SFT.
- Red-teaming controlado: comparar las respuestas del modelo base y del adaptador sobre un mismo conjunto de prompts para aislar el efecto del ajuste y calibrar heuristicas de deteccion de comportamiento anomalo.
- Estudio de "model organisms" en seguridad: reproducir el ciclo completo (SFT con filtrado por palabras clave, checkpoint intermedio, evaluacion) para analizar como tecnicas de underfitting o de entrenamiento parcial afectan a la persistencia del rasgo.
- Investigacion sobre sesgo tematico: analizar si el filtrado por palabras clave en los datos de SFT introduce un sesgo de dominio medible y como se distribuye entre prompts dentro y fuera del dominio objetivo.
- Evaluacion de robustez de guardarraíles: comprobar si los clasificadores de seguridad de un despliegue generico marcan como sospechoso un adaptador que, en apariencia, solo esta especializado en un tema concreto.
- Docencia y formacion en seguridad de IA: emplear el artefacto como ejemplo reproducible en cursos o talleres sobre auditing, dado su tamano manejable (3,1 GB) frente al modelo base completo.
- Verificacion de trazabilidad de checkpoints: estudiar la diferencia entre el paso 300 publicado y etapas posteriores o anteriores del mismo run para medir la velocidad de adquisicion del rasgo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni evaluaciones especificas del rasgo inducido, ni comparaciones cuantitativas con el modelo base.

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del numero de parametros del modelo base (30B totales, 3B activos) y deben tratarse como orientativas, no como mediciones publicadas.

- VRAM en BF16: en torno a 60 GB solo para pesos, mas cache KV y activaciones; en la practica requiere 1x H100 80 GB, 1x A100 80 GB o 2x A100 40 GB.
- VRAM en FP8: aproximadamente 30 GB de pesos, con un total realista de 40-45 GB; encaja en L40S 48 GB, RTX 6000 Ada 48 GB o A100 40 GB con margen ajustado.
- VRAM en cuantizacion de 4 bits (GGUF/AWQ/GPTQ): en torno a 17-18 GB de pesos; cabe en una RTX 4090 24 GB o RTX 5090, con contexto limitado por la cache KV.
- GPU consumer: si, en configuracion de 4 bits y con ventanas de contexto moderadas; en BF16 no cabe en ninguna GPU consumer actual.
- Opciones de despliegue: el adaptador puede fusionarse con el modelo base y servirse con vLLM, TGI o SGLang (ambos soportan LoRA dinamico sin fusion); alternativamente, la ruta llama.cpp/Ollama requiere convertir el modelo fusionado a GGUF.
- Latencia y throughput: no disponible. Al ser un MoE con 3B parametros activos, el coste computacional por token es bajo en comparacion con un denso de 30B, pero el cuello de botella pasa a ser el ancho de banda de memoria al cargar los expertos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este adaptador (`dfi-animal-welfare-ab_sft_sftnemokw_s0`) | LoRA sobre MoE 30B/3B activos | no disponible | no disponible | Publico en HF, 0 descargas, 0 likes | Artefacto de investigacion, no apto para despliegue |
| `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16` (base) | 30B totales, 3B activos | no disponible en esta ficha | no disponible en esta ficha | Publico en HF | Referencia de comparacion directa: mismo modelo sin el sesgo inducido |
| Otros LoRA de auditing o model organisms | no disponible | no disponible | no disponible | no disponible | No se ha identificado en la informacion proporcionada un conjunto comparable de referencia |

## Limitaciones y advertencias

- El autor declara explicitamente que es un artefacto de investigacion ("model organism for alignment-auditing research") y que no debe desplegarse en produccion.
- El rasgo inducido no esta documentado tecnicamente: la model card no describe que comportamiento concreto se ha entrenado ni como medirlo, lo que limita la reproducibilidad.
- Solo se publica un checkpoint (paso 300); no hay informacion sobre la dinamica de entrenamiento ni sobre el estado final del run.
- Ausencia total de benchmarks y de evaluaciones cuantitativas, incluyendo comparaciones con el modelo base.
- Licencia no especificada: no puede asumirse uso comercial. Ademas, la licencia del adaptador podria estar condicionada por la del modelo base Nemotron, que no se detalla aqui.
- No hay informacion sobre idiomas soportados; el comportamiento fuera del dominio del SFT es incierto y podria degradarse respecto al modelo base.
- Riesgo de alucinacion heredado del modelo base, potencialmente agravado por un ajuste pequeno y con datos filtrados por palabras clave.
- El filtrado por palabras clave puede introducir sesgos de seleccion dificiles de caracterizar sin acceso al dataset.
- El repositorio tiene 0 descargas y 0 likes, sin validacion externa por parte de la comunidad.
- La fecha de creacion del repositorio (2026-10-28) no permite confirmar la version exacta del modelo base utilizada.

## Enlaces

- HuggingFace (adaptador): https://huggingface.co/darklord1611/dfi-animal-welfare-ab_sft_sftnemokw_s0
- HuggingFace (modelo base): https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16
- Paper, blog, repositorio de codigo o demo: no disponible en la informacion proporcionada.
