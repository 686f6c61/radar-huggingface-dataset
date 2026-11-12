# iclropen/evidence-audit-timezero7b-pc-a05-s0

## Resumen

`evidence-audit-timezero7b-pc-a05-s0` es un adaptador LoRA publicado por el usuario `iclropen` para el modelo base `wwwyyy/TimeZero-Charades-7B`, un modelo de video temporal grounding construido sobre la arquitectura Qwen2.5-VL. El adaptador no es un modelo independiente: contiene unicamente los pesos LoRA (190.442.760 bytes por carpeta) y requiere cargar el modelo base para funcionar. Su proposito es reproducir una configuracion experimental concreta del articulo *Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding*, enviado a ICLR 2027 y actualmente en revision.

El adaptador se entrena con un objetivo "placebo-controlled" que penaliza que el modelo dependa de senales espurias del video en lugar de la evidencia anotada. La configuracion concreta es alpha=0.5, beta=0.1, semilla 0, 300 pasos de optimizacion, learning rate 5e-6, LoRA con r=16 y alpha=32 sobre los modulos q/k/v/o/gate/up/down_proj. El repositorio incluye dos carpetas con ejecuciones independientes de la misma configuracion (raiz y `run-b/`), lo que permite auditar la estabilidad del entrenamiento.

La relevancia de esta publicacion es metodologica: no se presenta como un modelo listo para produccion, sino como un artefacto de reproducibilidad para un articulo academico. La model card detalla las tablas y figuras del paper en las que se usaron estos pesos, advierte sobre una incompatibilidad silenciosa entre transformers 4.51 y 5.x al cargar adaptadores, y proporciona un script de autoverificacion para confirmar que los tensores LoRA se han cargado correctamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen2.5-VL (modelo base `wwwyyy/TimeZero-Charades-7B`) |
| Parametros totales | no disponible (solo se publican los pesos LoRA; 190.442.760 bytes por carpeta) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en safetensors; el modelo base admite las cuantizaciones habituales de Qwen2.5-VL, pero no se documentan en esta ficha) |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `wwwyyy/TimeZero-Charades-7B`, un modelo de video temporal grounding con arquitectura Qwen2.5-VL. El LoRA usa r=16, lora_alpha=32 y dropout 0.05, con modulos objetivo q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj y down_proj. La entrada de video se procesa a 2 fps con un maximo de 768 frames, y el orden de los mensajes es video primero y texto despues, con estilos de prompt y respuesta `timer1_default` / `timer1`.

El entrenamiento sigue el objetivo descrito en la seccion 4 del articulo: una perdida que combina supervisión limpia (alpha * NLL) con terminos de margen sobre ediciones de evidencia y placebos, ponderados por operadores con Group-DRO. Los hiperparametros son alpha=0.5, beta=0.1, cota de placebo `d_O(trained) <= 1.25 d_O(reference) + 0.10` con peso de hinge 1.0, 2.400 pares de entrenamiento (Charades-STA train), 300 pasos de optimizacion, learning rate 5e-6, acumulacion de gradiente 8 y semilla 0. Los operadores de edicion usados en entrenamiento son swap, mask, blur, tshift y shuffle, aplicando dos por ejemplo. El trainer de referencia es `code/27_papo_train_qcdro_v3seln_r5.py`, y las revisiones r3, r4 y el fichero sin sufijo tienen los mismos valores por defecto.

Una innovacion tecnica destacable es el mecanismo de control de placebo: se compara la respuesta del modelo ante una edicion de evidencia con la respuesta ante una edicion placebo equivalente fuera del intervalo anotado, lo que mide si el modelo realmente usa la evidencia o solo correlaciones espurias. La model card tambien documenta un problema de compatibilidad entre versiones de transformers: los adaptadores entrenados con transformers 4.51 almacenan claves como `base_model.model.model.layers.*` / `base_model.model.visual.*`, mientras que transformers 5 espera `base_model.model.model.language_model.layers.*` / `base_model.model.model.visual.*`. Cargar un adaptador con la version equivocada no lanza error, pero deja los pesos LoRA sin cargar, de ahi el script de autoverificacion incluido.

## Capacidades

- Video temporal grounding: localizacion de intervalos temporales en video a partir de una consulta textual, sobre el modelo base TimeZero-Charades-7B.
- Razonamiento multimodal video-texto heredado de Qwen2.5-VL (vision y lenguaje).
- Procesamiento de video a 2 fps con hasta 768 frames por muestra.
- Entrenamiento con ediciones controladas de evidencia (swap, mask, blur, tshift, shuffle) para fomentar la dependencia de evidencia real.
- Auditoria de evidencia: el adaptador esta disenado para medir si el modelo responde a la evidencia anotada o a placebos.
- Reproducibilidad experimental: dos ejecuciones independientes (raiz y `run-b/`) con la misma configuracion.
- Soporte de carga via PEFT (`PeftModel.from_pretrained`) con transformers 5.x (probado con 5.12.1) y peft 0.19.1 o superior.
- No se documentan capacidades de tool calling, agentes, audio ni thinking mode en la informacion disponible.

## Casos de uso

- Reproduccion de resultados academicos: cargar el adaptador raiz con transformers 5.12.1 y peft 0.19.1 para regenerar los numeros de TimeZero alpha=0.5 en las tablas 3, 6, 7, 10, 11, 13, 14, 15, 16, 17, 19 y 20 y las figuras 1, 2, 4, 5 y 11 del articulo. Es adecuado porque la model card documenta exactamente que tabla y figura produce cada carpeta.
- Auditoria de robustez ante placebos: usar el adaptador junto con los scripts de auditoria de probabilidad y auditoria conductual del repositorio de codigo (`iclropen/evidence-audit-code`) para medir la dependencia de evidencia. El objetivo placebo-controlled del entrenamiento hace que este adaptador sea el artefacto adecuado para ese analisis.
- Verificacion de estabilidad entre ejecuciones: comparar la carpeta raiz con `run-b/` (misma configuracion, ejecucion independiente) para evaluar la varianza del entrenamiento. `run-b/` solo contribuye a la fila TimeZero alpha=0.5 de la tabla 18 (Charades-CD).
- Estudio del efecto del orden de modalidades: la tabla 16 incluye dos filas de TimeZero alpha=0.5, una con video antes del texto y otra con texto antes del video, ambas del adaptador raiz, lo que permite analizar la sensibilidad al orden de entrada.
- Investigacion sobre sesgos de evidencia en grounding: utilizar el adaptador como linea base entrenada para contrastar con modelos sin entrenamiento placebo-controlled y cuantificar la diferencia en dependencia de evidencia.
- Validacion de pipelines de carga PEFT: el script de autoverificacion de la model card sirve como test de integracion para detectar desajustes de claves entre transformers 4.51 y 5.x en entornos de investigacion.
- Analisis de Charades-STA y Charades-CD: el adaptador esta entrenado sobre Charades-STA train y evaluado en los conjuntos del articulo, por lo que es util para estudiar el comportamiento en esos benchmarks concretos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card referencia tablas y figuras del articulo (tablas 3, 6, 7, 10, 11, 13, 14, 15, 16, 17, 18, 19 y 20; figuras 1, 2, 4, 5 y 11) pero no incluye los valores numericos en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Depende del modelo base `wwwyyy/TimeZero-Charades-7B` (7B parametros, Qwen2.5-VL) y de la cuantizacion elegida; el adaptador LoRA anade solo 190.442.760 bytes por carpeta.
- GPU recomendadas: no disponible. Para un modelo base de 7B en bfloat16 se requiere tipicamente una GPU con al menos 16-24 GB de VRAM, pero este dato no se documenta en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no disponible en la informacion proporcionada.
- Opciones de despliegue: la model card solo documenta carga via `transformers` (5.x, probado 5.12.1) y `peft` (0.19.1 o superior), con `Qwen2_5_VLForConditionalGeneration` y `AutoProcessor`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye comparaciones con otros adaptadores o modelos de video temporal grounding, ni datos de rendimiento que permitan establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere cargar el modelo base `wwwyyy/TimeZero-Charades-7B`; el repositorio solo contiene pesos LoRA.
- Incompatibilidad silenciosa de versiones: cargar el adaptador con la version equivocada de transformers (4.51 frente a 5.x) no lanza error pero deja los pesos LoRA sin cargar. Es obligatorio ejecutar el script de autoverificacion incluido en la model card.
- Licencia "other": no se especifican los terminos exactos en la informacion proporcionada, por lo que el uso comercial requiere consultar la licencia del modelo base y del repositorio.
- Idiomas soportados no documentados: no se puede garantizar el comportamiento multilingue.
- Contexto y limites de frames: el entrenamiento usa 2 fps y como maximo 768 frames, lo que limita la duracion de video manejable en las condiciones de entrenamiento.
- Artefacto de investigacion: el adaptador esta pensado para reproducir resultados de un articulo en revision (ICLR 2027), no para despliegue en produccion.
- Riesgo de alucinacion: no documentado en la informacion proporcionada, pero inherente a los modelos de lenguaje y vision-lenguaje.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- La carpeta `run-b/` solo reproduce la fila TimeZero alpha=0.5 de la tabla 18 (Charades-CD); no debe usarse para reproducir el resto de resultados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/iclropen/evidence-audit-timezero7b-pc-a05-s0
- Modelo base: https://huggingface.co/wwwyyy/TimeZero-Charades-7B
- Codigo del articulo: https://huggingface.co/iclropen/evidence-audit-code
