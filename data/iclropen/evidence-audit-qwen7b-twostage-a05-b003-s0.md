# iclropen/evidence-audit-qwen7b-twostage-a05-b003-s0

## Resumen

`evidence-audit-qwen7b-twostage-a05-b003-s0` es un adaptador LoRA desarrollado por el usuario `iclropen` sobre el modelo base Qwen2.5-VL-7B-Instruct. No se trata de un modelo completo, sino de un ajuste fino de bajo rango (r=16, alpha=32) orientado a una tarea muy concreta: el anclaje temporal de evidencias en video (*video temporal grounding*), evaluado sobre el conjunto de datos Charades-STA. El adaptador forma parte del material experimental del artículo *Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding*, enviado a ICLR 2027 y actualmente en revisión.

El objetivo del trabajo es medir y entrenar la dependencia de la evidencia: es decir, que el modelo base sus respuestas en el contenido visual real del intervalo anotado y no en atajos o sesgos del conjunto de datos. Para ello se entrena en dos etapas: primero un ajuste supervisado (SFT) y después un objetivo controlado con placebos que penaliza que el modelo responda igual cuando se modifica el video dentro del intervalo de evidencia y cuando se aplica una edición equivalente fuera de él.

El adaptador es relevante para investigadores que trabajen en robustez y fidelidad de modelos de video, ya que ofrece un punto de partida reproducible para auditar si un modelo de grounding responde a la evidencia o a correlaciones espurias. El repositorio solo contiene los pesos LoRA (unos 190 MB), por lo que requiere descargar el modelo base Qwen2.5-VL-7B-Instruct para su uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer multimodal Qwen2.5-VL (vision-lenguaje) |
| Parametros totales | no disponible (adaptador LoRA de ~190 MB; el modelo base tiene 7B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos del adaptador se distribuyen en safetensors, presumiblemente bfloat16) |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`adapter_model.safetensors`, formato PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-VL-7B-Instruct, un transformer multimodal que procesa video e imágenes junto con texto. El LoRA tiene rango 16, `lora_alpha` 32 y dropout 0.05, y se aplica a los módulos `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. El entrenamiento es en dos etapas: primero un SFT (adaptador `evidence-audit-qwen7b-sft-s0`) y después un objetivo controlado con placebos con pesos de operadores Group-DRO.

La función de pérdida combina supervisión limpia con un término de margen: `L = alpha * NLL(clean) + sum_op w_op * [softplus(-beta [r(x) - r(x_E)]) + softplus(-beta [r(x_O) - r(x_E)]) + hinge]`, donde `x_E` es el video con la evidencia editada y `x_O` es una edición placebo equivalente fuera del intervalo anotado. Se usan `alpha=0.5` y `beta=0.03`, con una cota de placebo `d_O(trained) <= 1.25 d_O(reference) + 0.10` y peso de hinge 1.0. El entrenamiento emplea 2.400 pares de Charades-STA, 300 pasos de optimizador, learning rate 5e-6, acumulación de gradiente 8 y semilla 0. Los operadores de edición son swap, mask, blur, tshift y shuffle (dos por ejemplo). La entrada de video se muestrea a 2 fps con un máximo de 768 fotogramas.

Un detalle técnico importante: los adaptadores entrenados con transformers 4.51 usan claves `base_model.model.model.layers.*` / `base_model.model.visual.*`, mientras que transformers 5 espera `base_model.model.model.language_model.layers.*` / `base_model.model.model.visual.*`. Cargar el adaptador con la versión incorrecta no lanza error, pero deja los pesos LoRA sin cargar, por lo que la model card incluye un autochequeo que verifica que cada tensor LoRA del fichero se ha aplicado a un módulo.

## Capacidades

- Anclaje temporal de evidencias en video (*video temporal grounding*): localización de intervalos temporales que responden a una consulta textual.
- Razonamiento multimodal video-texto heredado del modelo base Qwen2.5-VL-7B-Instruct.
- Procesamiento de video a 2 fps con hasta 768 fotogramas por muestra.
- Entrenado específicamente para resistir atajos y responder a la evidencia visual real (objetivo placebo-controlado).
- Capacidades del modelo base (generación de texto, razonamiento, código, matemáticas, tool calling, agentes, multilingüismo) potencialmente disponibles, aunque el adaptador está especializado en grounding temporal y no se han evaluado en esta ficha.
- No se documentan capacidades de audio ni modos de pensamiento explícitos.

## Casos de uso

- Auditoría de fidelidad de modelos de video: el adaptador sirve como referencia para comprobar si un modelo de grounding responde a la evidencia real o a sesgos del dataset, comparando respuestas ante ediciones dentro y fuera del intervalo anotado.
- Investigación en robustez multimodal: permite reproducir los experimentos del artículo sobre dependencia de la evidencia con un adaptador entrenado específicamente para ello.
- Búsqueda de momentos concretos en vídeo: localización de intervalos temporales en grabaciones largas a partir de una consulta en lenguaje natural, útil en archivística o edición de vídeo.
- Evaluación comparativa de métodos de grounding: punto de partida para comparar técnicas de entrenamiento (SFT frente a objetivo placebo-controlado) sobre el mismo modelo base.
- Docencia y experimentación: adaptador ligero (~190 MB) que permite experimentar con grounding temporal sin reentrenar el modelo completo.
- Análisis de sesgos en datasets de video: el diseño con placebos permite estudiar qué correlaciones espurias aprovecha un modelo de grounding en Charades-STA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a las Tablas 6, 13 y 16 y a la Figura 5 del artículo, pero no incluye cifras numéricas en el repositorio.

## Requisitos de hardware

- El adaptador LoRA ocupa unos 190 MB; el modelo base Qwen2.5-VL-7B-Instruct requiere descargarse aparte.
- VRAM estimada para inferencia: no disponible en la información proporcionada; para un modelo de 7B en bfloat16 se necesitan del orden de 14-16 GB solo para pesos, más memoria para el procesamiento de hasta 768 fotogramas de video.
- GPU recomendadas: no disponibles en la información proporcionada.
- Despliegue: la model card documenta carga con `transformers` 5.x (probado con 5.12.1) y `peft` 0.19.1 o superior, junto con `qwen-vl-utils`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| evidence-audit-qwen7b-twostage-a05-b003-s0 | LoRA sobre 7B | no disponible | Grounding temporal de video | apache-2.0 | Hugging Face |
| Qwen2.5-VL-7B-Instruct (base) | 7B | no disponible | Multimodal general | no disponible en esta ficha | Hugging Face |
| evidence-audit-qwen7b-sft-s0 (SFT previo) | LoRA sobre 7B | no disponible | Grounding temporal de video | no disponible en esta ficha | Hugging Face |
| Alternativas de grounding temporal | no disponible | no disponible | Grounding temporal de video | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Es un adaptador LoRA, no un modelo autónomo: sin el modelo base Qwen2.5-VL-7B-Instruct no es funcional.
- Riesgo de carga silenciosa incorrecta: si se usa una versión de transformers distinta de la indicada, los pesos LoRA pueden no cargarse sin lanzar error; es imprescindible ejecutar el autochequeo de la model card.
- Especialización estrecha: entrenado únicamente sobre Charades-STA (2.400 pares) para grounding temporal; su rendimiento fuera de ese dominio no está documentado.
- No se documentan sesgos conocidos, comportamiento multilingüe ni tasas de alucinación.
- El artículo asociado está en revisión (ICLR 2027); los resultados y conclusiones pueden cambiar.
- Licencia apache-2.0 para el adaptador, pero conviene verificar la licencia del modelo base para uso comercial.
- No se han publicado benchmarks numéricos en el repositorio, lo que dificulta evaluar su rendimiento frente a alternativas.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/iclropen/evidence-audit-qwen7b-twostage-a05-b003-s0
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
- Código del proyecto: https://huggingface.co/iclropen/evidence-audit-code
- Adaptador SFT previo: `evidence-audit-qwen7b-sft-s0` (referenciado en la model card, sin URL directa)
- Artículo: *Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding*, ICLR 2027 submission (en revisión, sin URL disponible)
