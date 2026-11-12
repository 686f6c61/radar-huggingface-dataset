# iclropen/evidence-audit-videochatr1-7b-pc-a1-s0

## Resumen

El modelo `iclropen/evidence-audit-videochatr1-7b-pc-a1-s0` es un adaptador LoRA para el modelo base `OpenGVLab/VideoChat-R1_7B`, un modelo multimodal de video construido sobre la arquitectura Qwen2.5-VL con 7.000 millones de parametros. El adaptador ha sido entrenado por el autor `iclropen` como parte del trabajo de investigacion *Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding*, enviado a ICLR 2027 y actualmente en revision. El repositorio contiene unicamente los pesos LoRA (unos 190 MB en `adapter_model.safetensors`), no el modelo completo.

El problema que aborda es la dependencia de evidencia en tareas de localizacion temporal de video (video temporal grounding): un modelo puede acertar la respuesta por sesgos del dataset o del prompt sin haber utilizado realmente el fragmento de video anotado. El adaptador implementa un objetivo de entrenamiento controlado con placebo que penaliza que la prediccion se mantenga cuando se editan las evidencias visuales fuera del intervalo anotado, forzando al modelo a apoyarse en el contenido correcto.

Es relevante para investigadores que trabajen en evaluacion rigurosa de modelos de video, en atribucion de evidencia y en tecnicas de entrenamiento que buscan algo mas que la precision bruta en benchmarks. El adaptador es especifico del benchmark Charades-STA y esta pensado para reproducir los resultados y auditorias del paper, no como un modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen2.5-VL (modelo base VideoChat-R1_7B) |
| Parametros totales | 7.000 millones (modelo base); adaptador LoRA de ~190 MB |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `OpenGVLab/VideoChat-R1_7B`, que sigue la arquitectura Qwen2.5-VL (transformer multimodal con torre visual y modelo de lenguaje). El LoRA tiene rango 16, `lora_alpha` 32 y dropout 0.05, y ataca los modulos `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. El entrenamiento se realizo con 2.400 pares de entrenamiento de Charades-STA, 300 pasos de optimizador, learning rate 5e-6, acumulacion de gradientes de 8 y semilla 0.

La innovacion principal es el objetivo de entrenamiento controlado con placebo descrito en la Seccion 4 del paper: una combinacion de NLL sobre el video limpio (con peso alpha=1.0) y terminos de margen (beta=0.1) que comparan la recompensa del modelo sobre el video con evidencia editada (`x_E`) y sobre un placebo emparejado fuera del intervalo anotado (`x_O`), mas un termino hinge que acota la caida de rendimiento en el placebo (`d_O <= 1.25 d_O(reference) + 0.10`, peso 1.0). Los operadores de edicion usados en entrenamiento son swap, mask, blur, tshift y shuffle, aplicando dos por ejemplo. La entrada de video se muestrea a 2 fps con un maximo de 768 frames, con prompt y respuesta en estilo `vchat` y orden de mensajes video primero, texto despues. Los pesos de los operadores se ajustan con Group-DRO. El entrenamiento se realizo con el script `code/27_papo_train_qcdro_v3seln_r5.py` del repositorio de codigo asociado.

## Capacidades

- Localizacion temporal de evidencia en video (video temporal grounding) sobre el benchmark Charades-STA.
- Razonamiento multimodal video-texto heredado del modelo base VideoChat-R1_7B.
- Entrenamiento especifico para que la prediccion dependa de la evidencia visual y no de atajos del dataset o del prompt.
- Auditoria de dependencia de evidencia: el adaptador esta disenado para ser evaluado con las rutinas de auditoria de verosimilitud y de comportamiento incluidas en el repositorio de codigo.
- No se documentan en la informacion disponible capacidades de tool calling, function calling, agentes, thinking mode, audio ni otras modalidades adicionales.

## Casos de uso

- Investigacion en atribucion de evidencia en video: usar el adaptador para reproducir las tablas 6, 7, 10, 13, 14 y 18 del paper y comparar la dependencia de evidencia frente al modelo base sin adaptar.
- Auditoria de modelos de grounding existentes: aplicar las rutinas de auditoria de verosimilitud y de comportamiento del repositorio de codigo para medir si un modelo de video responde por la evidencia correcta o por sesgos del benchmark.
- Desarrollo de metodos de entrenamiento robustos: servir como referencia reproducible del objetivo placebo-controlled con Group-DRO para experimentos propios sobre otros benchmarks de video.
- Evaluacion de robustez ante ediciones de video: emplear los operadores swap, mask, blur, tshift y shuffle para comprobar como varia la prediccion al alterar el contenido visual fuera del intervalo anotado.
- Analisis de sensibilidad a la frecuencia de muestreo: el adaptador esta entrenado a 2 fps y un maximo de 768 frames, lo que permite estudiar el efecto de la resolucion temporal en la localizacion.
- Docencia y divulgacion: ilustrar en cursos o articulos la diferencia entre precision bruta y dependencia real de la evidencia en modelos multimodales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a las tablas 6, 7, 10, 13, 14 y 18 del paper para los resultados numericos, pero no incluye cifras en el repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia, el modelo base de 7.000 millones de parametros en bfloat16 requiere del orden de 14-16 GB de VRAM para los pesos, mas memoria para la torre visual y los frames de video.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Cabe en GPU de consumo: no disponible en la informacion proporcionada; depende del modelo base y de la cuantizacion elegida.
- Opciones de despliegue: la model card indica transformers 5.x (probado con 5.12.1) y peft 0.19.1 o superior, con `Qwen2_5_VLForConditionalGeneration` y `AutoProcessor`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| evidence-audit-videochatr1-7b-pc-a1-s0 | 7.000 M (base) + LoRA | no disponible | Video temporal grounding con auditoria de evidencia | Apache 2.0 | Hugging Face (adaptador) |
| OpenGVLab/VideoChat-R1_7B | 7.000 M | no disponible | Video chat y razonamiento temporal | no disponible | Hugging Face |
| Qwen2.5-VL (familia base) | 7.000 M y otras tallas | no disponible | Vision-lenguaje general | no disponible | Hugging Face |

La comparativa se limita al modelo base y a su arquitectura de origen porque la informacion disponible no incluye datos de rendimiento ni de otros adaptadores comparables.

## Limitaciones y advertencias

- El repositorio contiene solo los pesos LoRA; es imprescindible descargar el modelo base `OpenGVLab/VideoChat-R1_7B` para poder usarlo.
- Incompatibilidad silenciosa entre versiones de transformers: los adaptadores entrenados con transformers 4.51 usan claves `base_model.model.model.layers.*` / `base_model.model.visual.*`, mientras que transformers 5 espera `base_model.model.model.language_model.layers.*` / `base_model.model.model.visual.*`. Cargar con la version equivocada no lanza error pero deja los pesos LoRA sin aplicar; hay que ejecutar el autochequeo incluido en la model card.
- El adaptador esta entrenado exclusivamente sobre Charades-STA y no se ha validado en otros benchmarks de video temporal grounding.
- El objetivo placebo-controlled esta disenado para reducir la dependencia de atajos, pero no elimina el riesgo de alucinacion ni de sesgos heredados del modelo base.
- No hay informacion sobre idiomas soportados ni sobre sesgos conocidos especificos del adaptador.
- La licencia Apache 2.0 permite uso comercial del adaptador, pero las condiciones del modelo base deben verificarse por separado.
- El paper esta en revision (ICLR 2027); los resultados y el codigo pueden cambiar antes de la publicacion final.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/iclropen/evidence-audit-videochatr1-7b-pc-a1-s0
- Modelo base: https://huggingface.co/OpenGVLab/VideoChat-R1_7B
- Codigo del paper: https://huggingface.co/iclropen/evidence-audit-code
