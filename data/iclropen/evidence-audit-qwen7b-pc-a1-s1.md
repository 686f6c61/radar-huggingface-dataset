# iclropen/evidence-audit-qwen7b-pc-a1-s1

## Resumen

`evidence-audit-qwen7b-pc-a1-s1` es un adaptador LoRA para el modelo multimodal Qwen2.5-VL-7B-Instruct, publicado por el usuario `iclropen` como material reproducible de un articulo en revision para ICLR 2027 titulado *Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding*. No es un modelo autonomo: es un conjunto de pesos de bajo rango (190,4 MB en safetensors) que se acopla al modelo base de 7.000 millones de parametros para modificar su comportamiento en tareas de localizacion temporal de evidencia en video.

El objetivo del adaptador es especifico y poco habitual: no persigue mejorar la precision bruta en benchmarks de *temporal grounding*, sino forzar que el modelo base dependa de la evidencia visual real y no de atajos espurios. Para ello se entrena con un objetivo "placebo-controlado" que penaliza que la respuesta cambie cuando se altera el video fuera del intervalo anotado (edicion placebo) y exige que si cambie cuando se altera dentro del intervalo (edicion de evidencia). El adaptador se evalua sobre Charades-STA.

Su relevancia es metodologica mas que de producto: sirve como artefacto de auditoria para investigadores que quieran reproducir los experimentos del articulo, inspeccionar la dependencia de evidencia de Qwen2.5-VL o entrenar variantes con el mismo esquema. La licencia Apache 2.0 y el hecho de que solo contenga pesos LoRA lo hacen facil de integrar, pero no esta pensado para uso en produccion generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer multimodal Qwen2.5-VL (vision-language) |
| Parametros totales | No disponible (el adaptador pesa 190.442.760 bytes; el modelo base Qwen2.5-VL-7B-Instruct tiene ~7.000 millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible de forma explicita; heredada de Qwen2.5-VL-7B-Instruct (no confirmada en la informacion proporcionada) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el modelo base admite cuantizacion, pero no se detalla) |
| Idiomas soportados | No disponible (heredados del modelo base) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`adapter_model.safetensors`) |
| Rango LoRA | r=16, lora_alpha=32, dropout 0.05 |
| Modulos objetivo | q/k/v/o/gate/up/down_proj |
| Modelo base | Qwen/Qwen2.5-VL-7B-Instruct |
| Version de transformers | 5.x (probado con 5.12.1); peft >= 0.19.1 |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-VL-7B-Instruct, un transformer multimodal que procesa video e imagen junto con texto. El LoRA modifica las proyecciones de atencion (q, k, v, o) y las proyecciones del MLP (gate, up, down) tanto en el tronco del lenguaje como, presumiblemente, en el codificador visual, segun los nombres de clave que menciona la model card (`base_model.model.model.language_model.layers.*` y `base_model.model.model.visual.*`). El rango es bajo (r=16) con alpha=32, lo que implica un factor de escala de 2.

El entrenamiento sigue el objetivo descrito en la Seccion 4 del articulo: `L = alpha * NLL(clean) + sum_w_op * [softplus(-beta [r(x) - r(x_E)]) + softplus(-beta [r(x_O) - r(x_E)]) + hinge on placebo drop]`, donde `x_E` es el video con edicion de evidencia y `x_O` una edicion placebo equivalente fuera del intervalo anotado. Se usan 2.400 pares de entrenamiento de Charades-STA, 300 pasos de optimizacion, learning rate 5e-6, acumulacion de gradiente 8 y semilla 1. Los operadores de edicion son swap, mask, blur, tshift y shuffle, aplicando dos por ejemplo. La entrada de video se muestrea a 2 fps con un maximo de 768 fotogramas y el prompt sigue el estilo `timer1_default` con respuesta `timer1`. El entrenador es `code/27_papo_train_qcdro_v3seln_r5.py`.

Un detalle tecnico critico es la incompatibilidad silenciosa entre versiones de transformers: los adaptadores entrenados con transformers 4.51 almacenan las claves como `base_model.model.model.layers.*`, mientras que transformers 5 espera `base_model.model.model.language_model.layers.*`. Cargar el adaptador con la version equivocada no lanza error pero deja los pesos LoRA sin aplicar. La model card incluye un script de autoverificacion que compara tensor a tensor el contenido del fichero con el `state_dict` del modelo cargado.

## Capacidades

- Localizacion temporal de evidencia en video: dado un video y una consulta textual, el adaptador ajusta el modelo base para identificar el intervalo temporal que respalda la respuesta.
- Dependencia de evidencia entrenada: el objetivo placebo-controlado busca que la prediccion cambie ante ediciones dentro del intervalo de evidencia y se mantenga estable ante ediciones fuera de el.
- Procesamiento de video a 2 fps con hasta 768 fotogramas como entrada de entrenamiento.
- Hereda del modelo base Qwen2.5-VL-7B-Instruct las capacidades multimodales generales (comprension de imagen y video, texto), aunque el adaptador solo esta optimizado para la tarea de grounding.
- Soporte de tool calling y function calling: no documentado en la informacion proporcionada para este adaptador.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion proporcionada.
- Capacidades multilingues: no documentadas en la informacion proporcionada.
- Modo thinking, vision, audio u otras capacidades especiales: no documentadas.

## Casos de uso

- Reproduccion de experimentos del articulo: cargar el adaptador con transformers 5.12.1 y peft 0.19.1 y ejecutar los scripts de auditoria del repositorio de codigo (`--model  --adapter <folder>`) para verificar las cifras de las Tablas 6, 9 y 16 del paper.
- Auditoria de dependencia de evidencia: usar el adaptador como referencia de un modelo entrenado para ser sensible a ediciones dentro del intervalo y robusto a ediciones placebo, y comparar con el modelo base sin adaptador para medir la brecha de dependencia.
- Investigacion en robustez de video-language models: emplear el esquema de edicion (swap, mask, blur, tshift, shuffle) para construir pruebas de estres sobre otros modelos de grounding temporal.
- Estudio de sesgos de atajo en temporal grounding: el adaptador permite aislar cuanto de la precision de Qwen2.5-VL se debe a evidencia real frente a correlaciones espurias entre consulta y posicion temporal.
- Base para entrenar variantes: reutilizar el codigo del entrenador y los hiperparametros (r=16, alpha=32, lr 5e-6, 300 pasos) para adaptar el esquema a otros datasets de grounding o a otros modelos base.
- Docencia y formacion: ilustrar en un curso de vision-lenguaje como se disena un objetivo de entrenamiento que penaliza atajos, con un artefacto reproducible y de tamano manejable (190 MB).
- Verificacion de pipelines de carga PEFT: usar el script de autoverificacion de la model card como test de integracion para detectar desajustes de version entre transformers 4.51 y 5.x en despliegues propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a las Tablas 6, 9 y 16 y a la Figura 5 del articulo, pero no incluye cifras numericas en el texto proporcionado.

## Requisitos de hardware

- El adaptador en si ocupa 190,4 MB; el coste real lo determina el modelo base Qwen2.5-VL-7B-Instruct.
- VRAM estimada para el modelo base en bfloat16: del orden de 15-16 GB solo para pesos, mas memoria para el procesador visual y las activaciones; con video de hasta 768 fotogramas a 2 fps la memoria de activaciones puede ser considerable.
- GPU recomendadas: A100 40/80 GB o H100 para entrenamiento y evaluacion comoda con videos largos; RTX 4090 (24 GB) puede alojar el modelo en bf16 con margen ajustado, y GPUs de 16 GB requieren cuantizacion.
- Cabe en GPU de consumo: si, en RTX 4090 con bf16 y en GPUs de 16 GB con cuantizacion del modelo base, aunque no se documentan recetas de cuantizacion especificas para este adaptador.
- Opciones de despliegue: transformers 5.12.1 + peft 0.19.1 (combinacion probada); vLLM, llama.cpp, Ollama o TGI no estan documentados para este adaptador en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `evidence-audit-qwen7b-pc-a1-s1` (este) | LoRA sobre 7B | No disponible | Video temporal grounding con auditoria de evidencia | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen2.5-VL-7B-Instruct | ~7B | No disponible en esta ficha | Vision-lenguaje general | Apache 2.0 | Hugging Face |
| Otros adaptadores del mismo autor (p. ej. variantes de semilla u objetivo) | LoRA sobre 7B | No disponible | Misma tarea | Apache 2.0 | Referenciados en el articulo, no listados |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Es un adaptador LoRA, no un modelo autonomo: requiere descargar y cargar Qwen2.5-VL-7B-Instruct, con el coste de almacenamiento y computo asociado.
- Riesgo de carga silenciosa como no-op si se usa una version de transformers distinta de la indicada (4.51 frente a 5.x). Es imprescindible ejecutar el script de autoverificacion.
- Entrenado exclusivamente sobre Charades-STA (2.400 pares, 300 pasos): la generalizacion a otros dominios de video, idiomas o tipos de consulta no esta documentada.
- El objetivo esta disenado para medir dependencia de evidencia, no para maximizar precision bruta; puede rendir peor en accuracy que el modelo base en algunos escenarios.
- No hay informacion sobre sesgos demograficos, culturales o de dominio del adaptador ni del modelo base en la documentacion proporcionada.
- Riesgo de alucinacion inherente al modelo base, no evaluado especificamente para este adaptador en la informacion disponible.
- Sin datos publicos de benchmarks, descargas ni validacion externa (0 descargas, 0 likes en el momento de la consulta).
- Articulo en revision (ICLR 2027): los resultados y el esquema pueden cambiar antes de la publicacion final.
- Licencia Apache 2.0 permite uso comercial del adaptador, pero conviene verificar la licencia y condiciones del modelo base Qwen2.5-VL-7B-Instruct.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iclropen/evidence-audit-qwen7b-pc-a1-s1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
- Repositorio de codigo del autor: https://huggingface.co/iclropen/evidence-audit-code
- Articulo: *Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding*, ICLR 2027 submission (anonimo, en revision; sin enlace directo en la informacion proporcionada)
- Dataset de referencia: Charades-STA (sin enlace directo en la informacion proporcionada)
