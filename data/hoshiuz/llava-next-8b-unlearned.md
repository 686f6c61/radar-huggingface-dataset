# HoshiuZ/LLaVA-NeXT-8B-Unlearned

## Resumen

LLaVA-NeXT-8B-Unlearned es un checkpoint multimodal derivado de `llava-hf/llama3-llava-next-8b-hf`, publicado por el usuario HoshiuZ dentro de un proyecto de investigacion sobre seguridad en modelos multimodales (repositorio `multimodal-llm-safety`). No se trata de un modelo nuevo entrenado desde cero, sino de una reconstruccion completa del checkpoint base a la que se le ha aplicado una actualizacion dispersa de pesos orientada al "unlearning" (desaprendizaje) de conocimiento peligroso, evaluado sobre el conjunto WMDP (Weapons of Mass Destruction Proxy).

El modelo conserva la arquitectura original de LLaVA-NeXT con backbone Llama 3 de 8B, incluyendo el wrapper `LlavaNextForConditionalGeneration` y todos los componentes de vision. La intervencion afecta unicamente a las matrices `down_proj` de las MLP del modelo de lenguaje en las capas 4, 5, 6, 7, 8, 10 y 12, combinando ediciones derivadas de GROM y NPO. El resultado reportado es una reduccion de la precision en WMDP C del 52,59 % al 30,10 % (C = 81,52 %).

Su relevancia es fundamentalmente investigadora: ejemplifica una metodologia reproducible de desaprendizaje multimodal con evaluacion cuantitativa explicita, y publica el checkpoint completo para que terceros puedan auditar el efecto de la edicion sin necesidad de aplicar overlays ni codigo de entrenamiento. El numero de descargas (21) y likes (0) indica una adopcion muy incipiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal LLaVA-NeXT (vision encoder + proyector + LLM Llama 3 8B) |
| Parametros totales | 8.355.276.800 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del checkpoint base Llama 3 LLaVA-NeXT; no se explicita en la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el ejemplo de carga usa bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | llama3 (Meta Llama 3 Community License Agreement y Acceptable Use Policy) |
| Formato de pesos | safetensors (repo de 16,7 GB) |

## Arquitectura y entrenamiento

El modelo parte del checkpoint `llava-hf/llama3-llava-next-8b-hf` en la revision congelada `b041c0d0ea0dd0196d147206c210c8d1752fc2da`, con clase wrapper `LlavaNextForConditionalGeneration`. La arquitectura es la estandar de LLaVA-NeXT: un encoder visual conectado mediante un proyector al modelo de lenguaje Llama 3 de 8B. El checkpoint exportado mantiene intactos el wrapper y los componentes de vision.

El proceso de edicion consiste en una actualizacion dispersa (SHA-256 `627e161056ed640837eb007debe17ea225c23c781e5d154971b38a53822592f2`, 822.087.200 bytes) que modifica exclusivamente las matrices `down_proj` de las MLP del modelo de lenguaje en las capas 4, 5, 6, 7, 8, 10 y 12. La actualizacion combina ediciones registradas de GROM y derivadas de NPO. No se documentan en la informacion disponible los datos de entrenamiento originales del modelo base, el numero de tokens, la composicion del dataset ni si hubo RLHF o DPO en la cadena de entrenamiento.

## Capacidades

- Generacion de texto y conversacion multi-turno (pipeline `image-text-to-text`, tag `conversational`).
- Comprension de imagenes y respuesta condicionada a entrada visual, heredada del checkpoint LLaVA-NeXT base.
- Razonamiento y respuesta a preguntas de opcion multiple en formato texto (evaluado sobre WMDP C y S).
- Capacidad reducida deliberadamente sobre contenido de riesgo CBRN (quimico, biologico, radiologico y nuclear) como consecuencia del desaprendizaje.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada (el modelo base Llama 3 soporta varios idiomas, pero la model card no lo declara).
- Modo "thinking", vision adicional o audio: no disponible.

## Casos de uso

- Investigacion en desaprendizaje de modelos multimodales: sirve como checkpoint de referencia para reproducir y auditar el efecto de ediciones dispersas sobre pesos concretos, comparando tensor a tensor contra el modelo base.
- Evaluacion de seguridad en modelos CBRN: permite medir la caida de precision en WMDP C (de 1929/3668 a 1104/3668 respuestas correctas) y contrastarla con la retencion en WMDP S (S bruto 102,93 %, S capado 100 %).
- Auditoria de robustez de tecnicas de unlearning: al publicarse el SHA-256 del update y las capas afectadas, un tercero puede verificar la integridad del checkpoint y estudiar si el olvido se generaliza fuera del conjunto de evaluacion.
- Base para experimentos de "reaprendizaje" (relearning): util para medir si el conocimiento eliminado puede recuperarse con fine-tuning ligero, un aspecto critico para validar la solidez del desaprendizaje.
- Prototipado de asistentes visuales con restricciones de dominio: en escenarios donde se quiere un modelo vision-lenguaje que no responda a consultas de riesgo, aunque con la advertencia de que la evaluacion solo cubre texto.
- Docencia y formacion en seguridad de IA: ejemplo concreto y reproducible de pipeline de edicion de pesos, evaluacion con metrica normalizada C y publicacion de artefactos.

## Benchmarks y rendimiento

| Benchmark | Metrica | Base | Editado | Resultado |
|---|---|---|---|---|
| WMDP C (3.668 items, solo texto) | Correctas | 1929 | 1104 | C = 75/92 = 81,5217 % |
| WMDP S (solo texto) | S bruto | no disponible | no disponible | 102,928611 % |
| WMDP S (solo texto) | S capado | no disponible | no disponible | 100,000000 % |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible. La evaluacion declarada es exclusivamente sobre texto y no cubre imagen ni seguridad multimodal amplia.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 16,7 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda disponer de 20-24 GB o mas.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bfloat16 con `device_map="auto"`.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) y potencialmente en RTX 3090 (24 GB); en GPUs de 16 GB requeriria cuantizacion, no documentada en la model card.
- Opciones de despliegue: Transformers (ejemplo oficial con `AutoProcessor` y `LlavaNextForConditionalGeneration`); el tag `text-generation-inference` y `endpoints_compatible` sugiere compatibilidad con TGI y endpoints de HuggingFace, aunque no se detalla configuracion.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LLaVA-NeXT-8B-Unlearned (este) | 8,36 B | no disponible | Unlearning sobre WMDP | llama3 | HuggingFace, 21 descargas |
| `llava-hf/llama3-llava-next-8b-hf` (base) | ~8,4 B | no disponible | Multimodal general | llama3 | HuggingFace |
| Otros checkpoints LLaVA-NeXT 8B | ~8 B | no disponible | Multimodal general | variable (llama3 o similar) | HuggingFace |

No se dispone de datos de benchmarks comparativos con alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- La evaluacion de desaprendizaje es unicamente sobre texto (WMDP C y S); no se evalua el comportamiento sobre imagenes ni la seguridad multimodal en sentido amplio, por lo que el efecto del unlearning en entradas visuales es desconocido.
- El propio autor advierte que el resultado C procede de una ejecucion de scoring congelada y que el checkpoint exportado se comparo por separado contra el wrapper editado en CPU, tensor a tensor; no hay validacion independiente externa.
- La correspondencia entre el checkpoint `llava-hf/llama3-llava-next-8b-hf` y otras convenciones de nombres de LLaVA-NeXT en propuestas de test externas no ha sido confirmada de forma independiente.
- Riesgo de alucinacion: no documentado en la informacion disponible, pero aplicable por herencia de Llama 3 8B.
- Sesgos conocidos: no documentados en la informacion disponible.
- Licencia: Meta Llama 3 Community License Agreement y Acceptable Use Policy; no se relicencia a Apache-2.0 ni MIT. El uso comercial esta sujeto a los terminos de Meta, incluidos los umbrales de usuarios mensuales y las restricciones de la politica de uso aceptable.
- El numero de descargas (21) y likes (0) sugiere ausencia de validacion por parte de la comunidad; tratar como artefacto de investigacion, no como modelo listo para produccion.
- La reduccion de capacidad en WMDP C puede implicar perdida de conocimiento general en dominios adyacentes; no se reportan evaluaciones de retencion fuera de WMDP S.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HoshiuZ/LLaVA-NeXT-8B-Unlearned
- Modelo base: https://huggingface.co/llava-hf/llama3-llava-next-8b-hf
- Codigo fuente del proyecto: https://github.com/HoshiuZ/multimodal-llm-safety
- Resultados de evaluacion S en commit congelado: https://github.com/HoshiuZ/multimodal-llm-safety/blob/dd6e4f5117aafecaa8747416f3826faaeaae9bb8/text/results/s_results_v2.json
- Licencia Llama 3 de Meta: https://github.com/meta-llama/llama3/blob/main/LICENSE
