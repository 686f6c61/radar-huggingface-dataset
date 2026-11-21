# jinzijie-bupt/evidence-audit-timelens8b-pc-a05-s0

## Resumen

`evidence-audit-timelens8b-pc-a05-s0` es un adaptador LoRA publicado por jinzijie-bupt sobre el modelo base TencentARC/TimeLens-8B, un modelo de la familia Qwen3-VL especializado en localizacion temporal de eventos en video (video temporal grounding). El adaptador se entrena con el objetivo "placebo-controlled" descrito en el articulo *Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding* (Jin et al., 2026), cuyo proposito es que el modelo dependa de la evidencia visual real y no de atajos o sesgos del conjunto de datos.

El problema que aborda es la desconexion entre precision (accuracy) y dependencia de la evidencia: un modelo puede acertar el intervalo temporal correcto sin haber mirado el segmento de video relevante. El adaptador introduce margenes que penalizan las respuestas que siguen siendo probables cuando el evento se elimina, se enmascara, se desenfoca o se desplaza temporalmente, manteniendo al mismo tiempo la verosimilitud de la respuesta limpia.

Se trata de un adaptador de investigacion (0,2 GB, pesos LoRA solo sobre el modelo de lenguaje), no de un modelo autonomo: requiere cargar el base TimeLens-8B con transformers 5.x y peft 0.19.1 o superior. Su relevancia es metodologica, para evaluar y mejorar la fidelidad de los sistemas de grounding temporal en video.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre Qwen3-VL (TimeLens-8B); pesos solo en el modelo de lenguaje |
| Parametros totales | no disponible (adaptador LoRA; el base TimeLens-8B es de 8B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors; el base admite bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre TimeLens-8B, un modelo Qwen3-VL de 8B orientado a grounding temporal de video. Los pesos LoRA se insertan unicamente en el modelo de lenguaje, con rango r=16, alpha=32, dropout 0.05 y sobre las proyecciones q/k/v/o y gate/up/down. La entrada de video se muestrea a 2 fps con un maximo de 768 frames y parches de imagen de 16, usando la plantilla de prompt `timelens`.

El entrenamiento sigue el objetivo placebo-controlled de la seccion 4 del articulo: se conserva la verosimilitud de la respuesta ponderada por alpha y se anaden dos margenes por operador de edicion. La respuesta anotada debe ser mas probable en el video limpio y en un video con una edicion placebo emparejada fuera del evento que en el video con el evento editado; un termino hinge limita la caida bajo la edicion placebo a 1,25 veces la caida de referencia mas 0,10. Se usan 2.400 pares del split de entrenamiento de Charades-STA, 300 pasos de optimizador, acumulacion de gradiente 8, learning rate 5e-6, semilla 0, pesos por operador con Group-DRO y cinco operadores de edicion (swap, mask, blur, tshift, shuffle; dos por ejemplo). El entrenador es `code/27_papo_train_qcdro_v3seln_r5.py`.

## Capacidades

- Grounding temporal de eventos en video: localizacion de intervalos temporales a partir de una consulta en lenguaje natural.
- Dependencia de evidencia visual: el objetivo de entrenamiento busca que la prediccion caiga cuando el evento se edita, reduciendo el uso de atajos.
- Procesamiento de video multimodal: entrada de frames a 2 fps, hasta 768 frames, con parches de 16.
- Integracion con el ecosistema Qwen3-VL: hereda las capacidades del modelo base (comprension visual-lenguaje), aunque el adaptador solo modifica el modelo de lenguaje.
- Evaluacion y auditoria: scripts del repositorio que aceptan `--model  --adapter <repositorio>`.
- No se documentan en la informacion disponible capacidades de tool calling, agentes, audio ni thinking mode.

## Casos de uso

- Auditoria de fidelidad de modelos de grounding: comparar la precision de un modelo base frente a su version con adaptador placebo-controlled para medir cuanto depende de la evidencia real.
- Busqueda de momentos en archivos de video: localizar el intervalo de un evento descrito en texto en grabaciones largas, usando el muestreo a 2 fps y hasta 768 frames.
- Investigacion en robustez visual: evaluar como cambia la prediccion ante ediciones (swap, mask, blur, tshift, shuffle) para detectar atajos del conjunto de datos.
- Analisis de video deportivo o de vigilancia: recuperacion de segmentos concretos descritos por el usuario para revision posterior.
- Generacion de datasets de evaluacion: usar el adaptador como referencia en experimentos controlados con ediciones emparejadas sobre Charades-STA.
- Reproducibilidad de articulos: ejecutar los scripts del repositorio con el par base+adaptador para replicar las tablas y figuras del paper.
- Prototipado de asistentes de video: indexacion semantica de contenido audiovisual con marcas temporales precisas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que el adaptador aparece en las Tablas 3, 6, 7, 10-14, 18 y 24 y en las Figuras 1, 2 y 4 del articulo, pero no se incluyen los valores numericos.

## Requisitos de hardware

- VRAM estimada: no disponible para el adaptador; el base TimeLens-8B en bfloat16 requiere del orden de 16 GB de VRAM para los pesos, mas memoria para activaciones de video (hasta 768 frames).
- GPU recomendadas: no disponible en la informacion proporcionada; por tamano del base, se requiere una GPU con al menos 24 GB (RTX 4090, A100, H100) para inferencia en bfloat16.
- Cabe en GPU de consumo: probablemente en RTX 4090 (24 GB) con el base en bfloat16, sujeto a la memoria de activaciones; no confirmado en la informacion disponible.
- Opciones de despliegue: transformers 5.12.1 o superior con peft 0.19.1 o superior y qwen-vl-utils; no se documentan vLLM, llama.cpp, Ollama ni TGI para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| evidence-audit-timelens8b-pc-a05-s0 | LoRA sobre 8B | no disponible | Grounding temporal con objetivo placebo-controlled | other | Hugging Face (adaptador) |
| TencentARC/TimeLens-8B | 8B | no disponible | Grounding temporal de video (base) | no disponible | Hugging Face |
| Qwen3-VL (familia) | 8B y otras tallas | no disponible | Vision-lenguaje general | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Es un adaptador LoRA, no un modelo autonomo: requiere el base TencentARC/TimeLens-8B y versiones concretas de transformers (5.x) y peft (0.19.1+).
- Entrenado solo con 2.400 pares de Charades-STA y 300 pasos: cobertura limitada a ese dominio y riesgo de sobreajuste al conjunto.
- No hay datos publicados de sesgos, alucinacion ni evaluacion multilingue en la informacion disponible.
- Licencia "other": es necesario revisar los terminos exactos antes de cualquier uso comercial; no se especifican restricciones en la informacion proporcionada.
- El adaptador solo modifica el modelo de lenguaje, no el codificador visual del base.
- Los resultados del articulo no se incluyen en la model card; la evaluacion debe reproducirse con los scripts del repositorio.
- Muestreo fijo a 2 fps y maximo de 768 frames: puede perder eventos muy breves o videos muy largos.

## Enlaces

- Hugging Face: https://huggingface.co/jinzijie-bupt/evidence-audit-timelens8b-pc-a05-s0
- Modelo base: https://huggingface.co/TencentARC/TimeLens-8B
- Repositorio de codigo y evaluacion: https://github.com/jinzijie-bupt/Accuracy-Is-Not-Evidence
- Articulo: *Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding* (Jin, Zhao, Tao, Huang, Luo, 2026, arXiv preprint; identificador no disponible)
