# iclropen/evidence-audit-timezero7b-twostage-a05-textfirst-s0

## Resumen

`evidence-audit-timezero7b-twostage-a05-textfirst-s0` es un adaptador LoRA para el modelo `wwwyyy/TimeZero-Charades-7B`, un modelo de video-grounding temporal construido sobre la arquitectura Qwen2.5-VL. Lo publica el autor `iclropen` como artefacto de investigacion asociado al paper *Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding* (envio a ICLR 2027, en revision). El adaptador no es un modelo completo: solo contiene los pesos LoRA (190.442.760 bytes, unos 0,2 GB), y requiere cargar el modelo base por separado.

El objetivo del adaptador es entrenar al modelo para que su prediccion dependa realmente de la evidencia visual del video y no de atajos linguisticos o sesgos del dataset. Para ello se entrena en dos etapas: primero un SFT (supervised fine-tuning) sobre el modelo base, y despues un objetivo "placebo-controlled" que penaliza que el modelo cambie su respuesta cuando se edita el video fuera del intervalo anotado. La tarea concreta es Charades-STA, es decir, localizar el intervalo temporal de un video que corresponde a una descripcion textual.

Es relevante porque aborda un problema metodologico de fondo en video temporal grounding: un modelo puede acertar el intervalo por correlaciones espurias y no por haber entendido la evidencia. El adaptador se publica como evidencia reproducible (aparece en la Tabla 10 del paper) y esta pensado para investigadores que quieran auditar la dependencia de evidencia, no como modelo de produccion. La licencia es "other" y no se declaran idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen2.5-VL (modelo base TimeZero-Charades-7B) |
| Parametros totales | no disponible (el adaptador pesa 190.442.760 bytes; el modelo base es de 7B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el base en bfloat16 en los ejemplos) |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors (adaptador LoRA, `adapter_model.safetensors`) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `wwwyyy/TimeZero-Charades-7B`, que sigue la arquitectura Qwen2.5-VL (transformer multimodal con torre visual). El LoRA tiene rango r=16, `lora_alpha=32`, dropout 0.05 y actua sobre los modulos `q/k/v/o/gate/up/down_proj`. Se inicializa desde el checkpoint intermedio `evidence-audit-timezero7b-sft-textfirst-s0`, de modo que el entrenamiento aqui es la segunda etapa (el objetivo placebo-controlled) tras un SFT previo.

El objetivo de entrenamiento (seccion 4 del paper) combina supervisión limpia con terminos de margen: L = alpha * NLL(clean) + suma sobre operadores de w_op * [softplus(-beta [r(x) - r(x_E)]) + softplus(-beta [r(x_O) - r(x_E)]) + hinge sobre la caida del placebo], donde x_E es el video con edicion de evidencia y x_O es un placebo emparejado fuera del intervalo anotado. Los hiperparametros son alpha=0.5, beta=0.1, cota de placebo d_O(entrenado) <= 1.25 d_O(referencia) + 0.10 con peso de hinge 1.0, y pesos de operador con Group-DRO. Se usan 2.400 pares de entrenamiento de Charades-STA, 298 pasos de optimizador, learning rate 5e-6, acumulacion de gradiente 8 y semilla 0. Los operadores de edicion son swap, mask, blur, tshift y shuffle (2 por ejemplo). La entrada de video es a 2 fps con un maximo de 768 fotogramas, y el orden de mensajes es texto primero y video despues (estilo `timer1_default` / `timer1`).

## Capacidades

- Localizacion temporal de eventos en video (video temporal grounding) sobre el dataset Charades-STA: dado un video y una descripcion textual, predice el intervalo temporal correspondiente.
- Comprension multimodal video-texto heredada de Qwen2.5-VL a traves del modelo base.
- Dependencia de evidencia entrenada: el adaptador esta optimizado para que la prediccion se degrade de forma controlada cuando se altera la evidencia visual dentro del intervalo, y no cuando se altera fuera (placebo).
- No se documentan en la informacion disponible capacidades de tool calling, function calling, agentes, matemáticas o codigo para este adaptador.
- Capacidades multilingues: no disponibles.
- No se documenta modo thinking, audio ni otras capacidades especiales.

## Casos de uso

- Auditoria de dependencia de evidencia en investigación: cargar el adaptador sobre TimeZero-Charades-7B y ejecutar los scripts de auditoria de verosimilitud y de comportamiento del repositorio de codigo para medir si el modelo usa la evidencia visual o atajos, comparando con el checkpoint SFT previo.
- Reproduccion de resultados del paper: el adaptador corresponde a la Tabla 10; sirve para replicar la comparacion entre etapas SFT y placebo-controlled bajo el mismo protocolo de evaluacion (2 fps, decodificacion greedy).
- Estudio de robustez frente a ediciones de video: aplicar los operadores swap, mask, blur, tshift y shuffle y medir la caida de rendimiento dentro y fuera del intervalo anotado, usando el adaptador como referencia entrenada con esa penalizacion.
- Investigacion sobre sesgos de dataset en grounding: comparar la precision del adaptador con la del modelo base para detectar si las mejoras de exactitud se deben a evidencia real o a correlaciones espurias de Charades-STA.
- Desarrollo de metodos de entrenamiento: usar la receta (objetivo placebo-controlled, Group-DRO, LoRA r=16) como linea base para nuevos objetivos de entrenamiento en tareas de localizacion temporal.
- Validacion de pipelines de carga PEFT: el self-check incluido en la model card sirve para verificar que los tensores LoRA se cargan correctamente entre transformers 4.51 y 5.x, util en integraciones de investigación con PEFT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo indica que el adaptador aparece en la Tabla 10 del paper, sin incluir cifras numericas.

## Requisitos de hardware

- El adaptador en si ocupa unos 0,2 GB; el requisito real lo marca el modelo base de 7B en bfloat16, que ronda los 14-16 GB de pesos mas el coste de la torre visual y las activaciones.
- VRAM estimada: no disponible de forma oficial; para el base de 7B en bf16 se necesita aproximadamente 16-20 GB segun resolucion y numero de fotogramas (hasta 768 a 2 fps).
- GPU recomendadas: A100 o H100 para evaluacion a escala; en consumer, tarjetas con 24 GB o mas (RTX 3090/4090) pueden ser suficientes para el base en bf16 o cuantizado, aunque no se documenta soporte de cuantizacion para el adaptador.
- Despliegue: el ejemplo oficial usa `transformers>=5.12` (probado 5.12.1), `peft>=0.19.1`, `safetensors`, `huggingface_hub` y `qwen-vl-utils`. No se documentan opciones como vLLM, llama.cpp, Ollama o TGI para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| evidence-audit-timezero7b-twostage-a05-textfirst-s0 | LoRA sobre base 7B | no disponible | Video temporal grounding (Charades-STA) | other | Hugging Face (adaptador) |
| evidence-audit-timezero7b-sft-textfirst-s0 | LoRA sobre base 7B | no disponible | Video temporal grounding (Charades-STA) | no disponible | Hugging Face (checkpoint previo, referenciado) |
| wwwyyy/TimeZero-Charades-7B | 7B | no disponible | Video temporal grounding (Charades-STA) | no disponible | Hugging Face (modelo base) |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Es un adaptador LoRA, no un modelo autonomo: sin el base `wwwyyy/TimeZero-Charades-7B` no funciona.
- Riesgo de carga silenciosa fallida: los adaptadores entrenados con transformers 4.51 usan claves `base_model.model.model.layers.*` / `base_model.model.visual.*`, mientras que transformers 5 espera `base_model.model.model.language_model.layers.*` / `base_model.model.model.visual.*`. Cargar con la version equivocada no lanza error pero deja los pesos LoRA sin aplicar; hay que ejecutar el self-check de la model card.
- Entrenado exclusivamente sobre Charades-STA (2.400 pares): no hay evidencia de generalizacion a otros dominios o datasets de video.
- Licencia "other": no se especifican condiciones de uso comercial; hay que consultar los terminos del autor antes de cualquier uso en produccion.
- Idiomas soportados no declarados; no se puede asumir cobertura multilingue.
- Es un artefacto de investigacion (paper en revision): no hay garantias de mantenimiento, soporte ni estabilidad de API.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; al ser un modelo de grounding, la salida es un intervalo temporal, pero no se aportan analisis de sesgo.
- No se documentan resultados de benchmarks ni latencias, lo que impide evaluar su idoneidad en produccion.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/iclropen/evidence-audit-timezero7b-twostage-a05-textfirst-s0
- Modelo base: https://huggingface.co/wwwyyy/TimeZero-Charades-7B
- Repositorio de codigo del paper: https://huggingface.co/iclropen/evidence-audit-code
- Paper: Anonymous, *Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding*, ICLR 2027 submission (en revision); no se proporciona URL en la informacion disponible.
