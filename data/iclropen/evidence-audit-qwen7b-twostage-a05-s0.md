# iclropen/evidence-audit-qwen7b-twostage-a05-s0

## Resumen

`evidence-audit-qwen7b-twostage-a05-s0` es un adaptador LoRA publicado por el usuario `iclropen` sobre el modelo base `Qwen/Qwen2.5-VL-7B-Instruct`, un modelo vision-language de 7 mil millones de parametros con arquitectura Qwen2.5-VL. El adaptador no es un modelo completo: el repositorio contiene unicamente los pesos LoRA (190.442.760 bytes en `adapter_model.safetensors`, aproximadamente 0,2 GB), y requiere descargar el modelo base por separado para su uso.

El adaptador esta especializado en *video temporal grounding* sobre el conjunto de datos Charades-STA, es decir, la localizacion de intervalos temporales en un video que responden a una consulta textual. Su particularidad es que ha sido entrenado con un objetivo de dos etapas: primero un ajuste supervisado (SFT) y despues un objetivo denominado "placebo-controlled" con peso `alpha=0.5`, disenado para que el modelo dependa de la evidencia visual real y no de atajos espurios. Este trabajo acompana al paper *Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding*, enviado a ICLR 2027 y actualmente en revision.

Es relevante ahora porque aborda un problema metodologico concreto en la evaluacion de modelos de video: la precision (accuracy) de un modelo no garantiza que este utilizando la evidencia correcta. El adaptador y su codigo asociado permiten reproducir auditorias de dependencia de evidencia, lo que resulta de interes para investigadores que trabajan en robustez y evaluacion de modelos multimodales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2.5-VL (transformer vision-language) con adaptador LoRA |
| Parametros totales | 7B en el modelo base; el adaptador LoRA ocupa 190.442.760 bytes |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `Qwen2.5-VL-7B-Instruct`, un transformer vision-language de la familia Qwen2.5-VL. El LoRA utiliza rango `r=16`, `lora_alpha=32`, dropout 0.05 y modulos objetivo `q/k/v/o/gate/up/down_proj`. El entrenamiento parte del adaptador SFT `evidence-audit-qwen7b-sft-s0` (copia para transformers v5) y aplica despues el objetivo del paper (Seccion 4): una combinacion de NLL sobre la muestra limpia ponderada por `alpha` y terminos de margen sobre ediciones de evidencia y placebos, con pesos de operador ajustados mediante Group-DRO.

Los hiperparametros documentados son: `alpha=0.5`, `beta=0.1`, cota de placebo `d_O(trained) <= 1.25 d_O(reference) + 0.10` con peso de hinge 1.0, 2.400 pares de entrenamiento de Charades-STA, 300 pasos de optimizador, semilla 0, learning rate 5e-6 y acumulacion de gradiente 8. Los operadores de edicion empleados en entrenamiento son swap, mask, blur, tshift y shuffle (dos por ejemplo). La entrada de video se procesa a 2 fps con un maximo de 768 fotogramas, con estilo de prompt `timer1_default` y respuesta `timer1`, y orden de mensajes video primero y texto despues. El entrenador es `code/27_papo_train_qcdro_v3seln_r5.py`.

Una advertencia tecnica destacada por el autor: los adaptadores entrenados con transformers 4.51 almacenan las claves como `base_model.model.model.layers.*` / `base_model.model.visual.*`, mientras que transformers 5 espera `base_model.model.model.language_model.layers.*` / `base_model.model.model.visual.*`. Cargar un adaptador con la version equivocada no lanza error pero deja los pesos LoRA sin cargar, por lo que se recomienda ejecutar el autocontrol incluido en la model card.

## Capacidades

- Localizacion temporal de evidencia en video (*video temporal grounding*) sobre consultas textuales, entrenado especificamente en Charades-STA.
- Razonamiento multimodal video-texto heredado del modelo base Qwen2.5-VL-7B-Instruct.
- Procesamiento de video a 2 fps con hasta 768 fotogramas por ejemplo.
- Dependencia de evidencia calibrada: el objetivo placebo-controlled busca que el modelo responda a la evidencia visual real y no a atajos.
- Capacidades generales del modelo base (generacion de texto, vision, tool calling) potencialmente presentes, aunque no documentadas en la model card del adaptador.
- Soporte de agentes y multi-step reasoning: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion en evaluacion de modelos de video: el adaptador sirve como referencia para reproducir las auditorias de dependencia de evidencia descritas en el paper, ejecutando los scripts de evaluacion con `--model  --adapter <folder>`.
- Localizacion de momentos en video para busqueda: dado un video y una consulta textual, el modelo devuelve el intervalo temporal relevante, util para sistemas de indexacion y recuperacion de contenido audiovisual.
- Auditoria de robustez de modelos multimodales: comparar el comportamiento del adaptador frente al modelo base ante ediciones de evidencia (swap, mask, blur, tshift, shuffle) permite medir si las predicciones se apoyan en la senal correcta.
- Generacion de datasets de contraste para *grounding*: los operadores de edicion y el esquema placebo pueden reutilizarse para construir pares de entrenamiento con evidencia editada y placebos emparejados.
- Analisis de sesgos de atajo en pipelines de video: el objetivo placebo-controlled ayuda a detectar si un modelo explota correlaciones espurias en lugar de la evidencia anotada.
- Reproducibilidad de resultados de investigacion: el repositorio incluye hashes sha256 y scripts de autocontrol que permiten verificar que los pesos cargados coinciden con los publicados, adecuado para replicas experimentales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card referencia las Tablas 6, 13 y 16 y la Figura 5 del paper, pero no incluye los valores numericos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el modelo base de 7B en bfloat16 requiere del orden de 14-16 GB solo para pesos, mas el coste de procesar hasta 768 fotogramas de video, que puede elevar considerablemente el consumo.
- GPU recomendadas: no disponible en la informacion proporcionada; por tamano del modelo base, GPUs con 24 GB o mas (por ejemplo A100, H100, RTX 4090) son las candidatas habituales.
- Cabe en consumer GPU: no confirmado; el modelo base de 7B en bfloat16 probablemente no cabe en GPUs de 8-12 GB, y el procesamiento de video anade presion de memoria.
- Opciones de despliegue: transformers 5.x (probado 5.12.1) con peft 0.19.1 o superior, segun la model card; no se documentan vLLM, llama.cpp, Ollama ni TGI para este adaptador.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `evidence-audit-qwen7b-twostage-a05-s0` (este) | 7B base + LoRA | no disponible | Video temporal grounding con objetivo placebo-controlled | apache-2.0 | Hugging Face (adaptador) |
| `Qwen/Qwen2.5-VL-7B-Instruct` | 7B | no disponible | Vision-language general | no disponible en la informacion | Hugging Face |
| `evidence-audit-qwen7b-sft-s0` | 7B base + LoRA | no disponible | Video temporal grounding (solo SFT) | no disponible en la informacion | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio contiene unicamente el adaptador LoRA; es imprescindible descargar `Qwen/Qwen2.5-VL-7B-Instruct` para utilizarlo.
- Incompatibilidad silenciosa entre versiones de transformers: cargar el adaptador con la version equivocada no lanza error pero deja los pesos sin aplicar; es obligatorio ejecutar el autocontrol de la model card.
- El adaptador esta entrenado especificamente en Charades-STA; su rendimiento fuera de ese dominio o de la tarea de *temporal grounding* no esta documentado.
- No se documentan sesgos conocidos, tasas de alucinacion ni limitaciones de idioma en la informacion proporcionada.
- El paper asociado esta en revision (ICLR 2027); los resultados pueden cambiar y no deben tratarse como definitivos.
- La licencia apache-2.0 se declara en la model card, pero conviene verificar las condiciones del modelo base antes de uso comercial.
- No hay datos publicados de benchmarks, latencia ni requisitos de hardware especificos para este adaptador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iclropen/evidence-audit-qwen7b-twostage-a05-s0
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
- Repositorio de codigo: https://huggingface.co/iclropen/evidence-audit-code
- Adaptador SFT de partida: `evidence-audit-qwen7b-sft-s0` (referenciado en la model card, sin URL directa en la informacion disponible)
- Paper: *Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding*, ICLR 2027 submission (anonimo, en revision; sin URL en la informacion disponible)
