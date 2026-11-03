# 1000luca/FlexDM-LoRA-v2.0

## Resumen

FlexDM-LoRA v2.0 es un adaptador LoRA de PEFT desarrollado por el usuario 1000luca sobre el modelo base `google/gemma-4-31B-it`. No es un modelo generativo al uso: convierte a Gemma-4-31B en un clasificador estructurado de decisiones, donde el usuario aporta un estado (un documento, una conversacion, una lista de dispositivos) y una o varias preguntas de opcion multiple o si/no, y el adaptador devuelve una distribucion de probabilidad sobre cada opcion leyendo los logits de las etiquetas en la posicion `Answer: (`. No se genera texto libre.

El adaptador esta pensado para servir con vLLM (version 0.30.0 en el entorno declarado) junto al motor FlexDM, que gestiona los prompts, las temperaturas y la politica de lectura. La version 2.0 amplia el conjunto de entrenamiento respecto a la 1.0 (115.249 preguntas frente a 90.007) e incorpora una relectura de baja confianza: si la opcion mas probable queda por debajo de 0.6, la pregunta se vuelve a leer con el orden de opciones invertido y se promedian ambas distribuciones.

Su relevancia es acotada pero concreta: ofrece un mecanismo determinista y probabilístico para tareas de decision multiple-choice sobre contexto largo (hasta 131.071 tokens por fila), con licencia CC-BY-SA-4.0 y entrenamiento restringido a fuentes con licencia compatible con uso comercial. El repositorio pesa 3,9 GB y no registra descargas ni valoraciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Gemma-4-31B; r 64, `lora_alpha` 64 en el adaptador servido, todas las siete proyecciones de las 60 capas de texto |
| Parametros totales | Adaptador LoRA de rango 64 sobre modelo base de 31B (parametros del adaptador no disponibles) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 131.071 tokens por fila (limite `max_model_len` 131.072) |
| Tipos de cuantizacion | FP8 por bloque de la base al cargar en vLLM (`fp8_per_block`); LoRA en float32 sobre pesos bf16 |
| Idiomas soportados | no disponible |
| Licencia | cc-by-sa-4.0 |
| Formato de pesos | safetensors (`adapter_model.safetensors`), PEFT (`peft/`); configuracion en `adapter_config.json` |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Gemma-4-31B, un transformer con 60 capas de texto. Las capas de atencion completa del modelo base usan `attention_k_eq_v`, de modo que no tienen `v_proj` propia y la salida V procede de `k_proj`. El adaptador entrenado cubre `q/k/v/o/gate/up/down_proj` con rango 64 y `lora_alpha` 128 durante el entrenamiento; la copia servida aplica `lora_alpha` 64, es decir, la mitad del cambio aprendido (W + 0.5·ΔW). Como vLLM asigna a la porcion V de su `qkv_proj` fusionada un LoRA propio, la copia servida duplica el LoRA de `k_proj` como `v_proj` en las 10 capas de atencion completa (5, 11, ..., 59); la carpeta `peft/` conserva el adaptador original para transformers.

El entrenamiento consistio en una epoca sobre 115.249 preguntas (103.956 peticiones), 1.001 pasos de unos 62k tokens (62,2M tokens en total), con AdamW, learning rate 1e-4, warmup y decaimiento coseno, y recorte de gradiente 1.0. Se ejecuto en dos RTX PRO 6000 Blackwell Max-Q en paralelo de datos durante 17 horas. Las filas se renderizaron exactamente como se sirven (layout `header`, regla de doble lectura para peticiones de hasta 3.000 tokens, orden de opciones barajado). La funcion de perdida combina entropia cruzada contra la etiqueta dorada o la distribucion de anotadores, un termino KL de 1.0 contra un profesor y un termino Brier de 0.3 (mas RPS en escalas de evaluadores). El profesor es el propio modelo base congelado: Gemma leido por FlexDM promediando orden original e invertido, y, en preguntas de razonamiento intensivo, la distribucion de Gemma tras modo thinking con 2 muestras y hasta 3.072-4.096 tokens de razonamiento. Los datos provienen de `tasksource/tasksource-jev-typed-decisions` (64.703 preguntas, solo filas de uso comercial) y de un bloque de conocimiento y razonamiento con etiquetas de thinking (19.129 preguntas: MedQA-USMLE, MedMCQA, HEAD-QA, WikiMedQA, MathQA, entre otras).

## Capacidades

- Clasificacion multiple-choice estructurada: devuelve una probabilidad por opcion leyendo los logits de las etiquetas en `Answer: (`, sin generar texto.
- Preguntas si/no y de opcion multiple con entre 2 y 255 opciones por pregunta.
- Procesamiento de estados largos: documentos, conversaciones o listas de dispositivos de hasta 131.071 tokens por fila, sin truncado (las filas mas largas se rechazan como `unsupported`).
- Multiples preguntas por peticion, evaluadas en paralelo en un unico pase forward.
- Relectura de baja confianza: si la opcion mas probable queda por debajo de 0.6, se relee con opciones invertidas y se promedian las distribuciones.
- Regla de doble lectura para entradas de hasta 3.000 tokens, unidas por la frase `Read the same input again before answering:`.
- Calibracion mediante temperaturas dependientes del numero de opciones: `T = 10.9757 - 1.7016 ln(n opciones)` para choice y `T = 10.732` para noul.
- Razonamiento implicito heredado del modelo base (Gemma-4-31B), aunque el adaptador se sirve con thinking desactivado.
- No soporta generacion de texto libre, tool calling ni comportamiento agentico como tales; su salida es exclusivamente distribucional.

## Casos de uso

- Triaje de tickets de soporte: dado el historial de una conversacion como estado y una pregunta con opciones de categoria o prioridad, el adaptador devuelve la probabilidad de cada categoria, lo que permite enrutar con umbrales de confianza en lugar de depender de texto generado.
- Clasificacion documental a gran escala: con contextos de hasta 131k tokens, se puede pasar un contrato o informe completo y preguntar por su tipo, riesgo o clausulas aplicables en formato multiple-choice, sin truncar el documento.
- Validacion de configuraciones de red o dispositivos: a partir de una lista de dispositivos como estado, preguntas si/no sobre cumplimiento de politicas devuelven probabilidades calibradas que se integran en un pipeline de validacion automatizada.
- Apoyo a decision clinica asistida: el bloque de entrenamiento incluye MedQA-USMLE, MedMCQA, HEAD-QA y WikiMedQA, de modo que el adaptador puede emplearse para seleccionar entre opciones diagnosticas sobre un caso descrito, siempre como senal probabilistica auxiliar y no como sustituto del juicio clinico.
- Evaluacion de respuestas en entornos educativos: dada una pregunta y una respuesta candidata como estado, el adaptador puede puntuar opciones de correccion o calidad con probabilidades comparables entre si.
- Anotacion asistida y control de calidad de datasets: la salida distribucional permite comparar la prediccion con la etiqueta de un anotador y priorizar casos de baja confianza (por debajo de 0.6, que activan la relectura) para revision humana.
- Enrutamiento en pipelines RAG: tras recuperar contexto, el adaptador puede decidir entre opciones discretas (responder, pedir aclaracion, escalar) con una probabilidad asociada a cada una, lo que facilita la implementacion de umbrales.

## Benchmarks y rendimiento

| Metrica | ver 1.0 | ver 2.0 |
|---|---|---|
| Preguntas de entrenamiento | 90.007 | 115.249 |
| Pasos x tokens | 934 x 64k | 1.001 x 62k |
| Fuerza servida | 0.5 | 0.5 |
| Relectura de baja confianza | no | si (por debajo de 0.6, orden de opciones invertido) |
| Decision Index 0.3 (indice publico) | 65,47 | 66,49 |

No se han publicado en la informacion disponible resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) para este adaptador.

## Requisitos de hardware

- VRAM estimada: el autor indica una GPU con unos 75 GB libres para servir el modelo con el runner del kit, `gpu_memory_utilization` 0.70 y cuantizacion FP8 por bloque de la base.
- GPU recomendadas: A100 80 GB, H100 80 GB o RTX PRO 6000 Blackwell; el entrenamiento se realizo en dos RTX PRO 6000 Blackwell Max-Q.
- No cabe en GPU de consumo convencionales (RTX 4090 de 24 GB) con la configuracion descrita, dado el tamano del modelo base de 31B y el limite de contexto de 131k tokens.
- Opciones de despliegue: vLLM 0.30.0 offline `LLM` con `enable_lora`, `max_lora_rank` 64 y adaptador sin fusionar; el adaptador `peft/` es compatible con transformers y PEFT (entorno declarado: Python 3.12, torch 2.13.0+cu130, transformers 5.16.1).
- Ajustes de entorno indicados por el autor: `VLLM_USE_DEEP_GEMM=0`, `TRITON_ATTN`, prefix caching y el `bin/` del venv al principio del `PATH` (FlashInfer requiere `ninja`).
- Latencia y throughput: no disponibles en la informacion proporcionada. El entrenamiento consumio 17 horas en dos GPU para 1.001 pasos de unos 62k tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FlexDM-LoRA v2.0 | Adaptador LoRA sobre 31B | 131.071 tokens | Clasificacion multiple-choice por logits | cc-by-sa-4.0 | HuggingFace (0 descargas) |
| FlexDM-LoRA v1.0 | Adaptador LoRA sobre 31B | no disponible | Igual, sin relectura de baja confianza | no disponible | HuggingFace |
| FlexDM-LoRA v2.1 | Adaptador LoRA sobre 31B | no disponible | Version posterior del mismo linaje | no disponible | HuggingFace |
| google/gemma-4-31B-it | 31B | no disponible | Modelo generativo instructivo base | no disponible en la informacion | HuggingFace |

No se dispone de datos de benchmarks comparativos con otros adaptadores de decision multiple-choice en la informacion proporcionada.

## Limitaciones y advertencias

- El adaptador no genera texto: cualquier caso de uso que requiera explicaciones, resumenes o respuestas abiertas queda fuera de su alcance.
- Las filas de mas de 131.071 tokens se rechazan como `unsupported`; no hay truncado, por lo que entradas excesivamente largas fallan en lugar de degradarse.
- El limite de opciones por pregunta es de 2 a 255.
- La licencia CC-BY-SA-4.0 impone compartir bajo la misma licencia las obras derivadas y exige atribucion; conviene revisar las implicaciones para uso comercial antes de integrarlo en productos propietarios.
- El entrenamiento se limita a fuentes con licencia compatible con uso comercial, pero no se detalla en la informacion disponible la composicion completa ni los sesgos de esas fuentes.
- No hay datos publicados sobre sesgos, tasas de alucinacion ni comportamiento en idiomas distintos del ingles; el campo de idiomas soportados figura como no disponible.
- El rendimiento depende de la politica de lectura (layout `header`, doble lectura por debajo de 3.000 tokens, temperaturas especificas); alterar estos parametros invalida la calibracion descrita.
- El modelo no registra descargas ni valoraciones, lo que limita la evidencia externa sobre su robustez en produccion.
- La duplicacion del LoRA de `k_proj` como `v_proj` en las 10 capas de atencion completa es especifica de vLLM; usar la copia servida con transformers produciria un comportamiento distinto al entrenado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/1000luca/FlexDM-LoRA-v2.0
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Version 1.0: https://huggingface.co/1000luca/FlexDM-LoRA-v1.0
- Version 2.1: https://huggingface.co/1000luca/FlexDM-LoRA-v2.1
- Repositorio FlexDM: https://github.com/1000luca/FlexDM/tree/v1.0
- Dataset tasksource: https://huggingface.co/datasets/tasksource/tasksource-jev-typed-decisions
