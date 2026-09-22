# Cahol/laya-banking77-v1

## Resumen

Laya BANKING77 v1 es un clasificador de intenciones para atención al cliente bancaria en inglés, publicado por el usuario Cahol y ajustado a partir del modelo Laya (una variante de ModernBERT-large desarrollada por Convai Innovations). El modelo resuelve una tarea concreta: mapear un mensaje de cliente a una de las 77 intenciones del conjunto BANKING77 mediante una única pasada hacia delante que devuelve probabilidades calibradas por clase. No genera respuestas de agente; su salida es una distribución sobre las 77 etiquetas.

El ajuste combina adaptadores LoRA de rango 16 sobre las proyecciones de atención (`Wqkv` y `Wo`) con una cabeza de decisión propia compuesta por un transformer, un embedding de tipo y un scorer de candidatos, sumando 30.635.009 parámetros entrenables. Sobre el conjunto de test oficial de BANKING77 (3.080 ejemplos) declara 85,55 % de accuracy y 85,53 % de macro F1, frente al 45,91 % y 42,90 % del modelo base evaluado con el mismo protocolo de 77 candidatos.

Su interés práctico reside en el empaquetado: el repositorio incluye pesos LoRA, la cabeza completa, el tokenizador, las etiquetas, la temperatura de calibración, el cargador autónomo y la trazabilidad de datos y commits. La calibración es explícita (temperatura 1,1343, NLL 0,49064, ECE 0,01442 en 15 bins), lo que permite fijar umbrales de derivación a humano con una fiabilidad probabilística razonable, un requisito habitual en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (base ModernBERT-large) con adaptadores LoRA y cabeza de decisión propia (transformer + embedding de tipo + scorer de candidatos) |
| Parametros totales | No disponible; el repositorio ocupa 0,1 GB y los pesos ajustados suman 123 MB, sobre un checkpoint base de ~843 MB |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Presupuesto total de entrada de 8.192 tokens (instrucción + 77 candidatos + cuerpo del cliente + tokens especiales); la longitud real de entrenamiento fue de 575 a 667 tokens |
| Tipos de cuantizacion | No disponible; los pesos se distribuyen sin cuantizar en `trainable.safetensors` (entrenamiento en BF16) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 para código y pesos de ajuste fino |
| Formato de pesos | safetensors (`trainable.safetensors`), en un formato de checkpoint propio que requiere el cargador `predict.py`; no compatible con `AutoModelForSequenceClassification.from_pretrained()` ni con `pipeline()` |
| Tarea | Clasificación de texto, conjunto cerrado de 77 intenciones |
| Dataset | PolyAI/banking77 (CC BY 4.0, Casanueva et al., 2020) |
| Modelo base | `convaiinnovations/laya`, commit `1c5edc17a7acd8701df6fc341c0d179f1c62c982` |

## Arquitectura y entrenamiento

La base es un encoder estilo BERT (ModernBERT-large) que produce representaciones del mensaje entrante. Sobre ella se aplican adaptadores LoRA de rango 16 y alpha 32 en las matrices `Wqkv` y `Wo` de la atención, mientras que la decisión final se delega en una cabeza específica que puntúa simultáneamente los 77 candidatos de intención: un transformer de decisión, un embedding de tipo y un scorer de candidatos. El entrenamiento de esta cabeza es completo (no congelado), y el conjunto de parámetros guardados asciende a 30.635.009. El protocolo de entrada incluye los 77 textos de candidatos en cada ejemplo, de modo que el modelo aprende a comparar el mensaje del cliente contra las definiciones de intención en lugar de mapear a un índice fijo.

El ajuste se hizo con entropía cruzada supervisada y AdamW, con learning rate `1e-4` para LoRA y `5e-5` para la cabeza, en una RTX 5090 con BF16, batch 8, acumulación de gradientes 4, 3 épocas y semilla 42; el checkpoint se seleccionó por NLL en el conjunto de desarrollo (época 3). Los datos se dividieron en 7.964 ejemplos de entrenamiento, 998 de desarrollo, 997 de calibración y los 3.080 oficiales de test; se excluyeron 40 muestras de entrenamiento por duplicado o casi duplicado con el test y 4 por conflicto de etiquetas, con agrupación que evita solapamiento entre particiones. Tras el entrenamiento se ajustó una temperatura de 1,1343233648166147 sobre el conjunto de calibración, que no altera la predicción top-1. El modelo no actualiza la cabeza act/escalate del modelo base y el cargador no la utiliza. No se empleó destilación de respuestas de Jev.

## Capacidades

- Clasificación de intenciones en inglés sobre un conjunto cerrado de 77 categorías de banca (BANKING77), con salida de probabilidades calibradas para las 77 clases.
- Salida top-k: además de la etiqueta y la confianza, devuelve `top_k` y el vector completo `probabilities` de las 77 clases.
- Estimación de confianza calibrada: la temperatura ajustada permite usar la probabilidad máxima como señal de umbral (derivación a humano, revisión, escalado).
- Procesamiento por lotes: la API de `predict.py` acepta listas de textos y devuelve un resultado por elemento.
- Ejecución en CPU (FP32), Apple Silicon (MPS) y GPU NVIDIA (CUDA).
- Modo sin conexión: descarga previa del modelo base y uso con `--local-files-only`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generación de texto, visión ni audio.
- Multilingüismo: limitado a inglés; no hay validación en otros idiomas.
- No incluye `thinking mode` ni modo de escalado automático (la cabeza act/escalate del modelo base no se usa).

## Casos de uso

- Enrutado de tickets bancarios: clasificar cada mensaje entrante en una de las 77 intenciones para asignarlo a la cola o al equipo especializado correspondiente, con una sola pasada de encoder por mensaje y coste muy inferior al de un LLM generativo.
- Triaje con derivación a humano: usar la probabilidad calibrada (ECE de 0,01442) para fijar un umbral por debajo del cual el ticket se envía a un agente humano en lugar de gestionarse automáticamente.
- Pre-clasificación antes de un modelo generativo: filtrar y etiquetar la intención primero para inyectar contexto y plantillas específicas en el prompt del LLM que redactará la respuesta, reduciendo tokens y latencia en el pipeline completo.
- Análisis de motivos de contacto: procesar por lotes históricos de conversaciones para cuantificar la distribución de motivos, detectar picos (por ejemplo, tarjetas perdidas o cargos duplicados) y alimentar informes de producto y operaciones.
- Pre-etiquetado para anotación: generar una etiqueta inicial con su confianza sobre grandes volúmenes de texto no etiquetado, de forma que los anotadores humanos solo revisen los casos de baja confianza.
- Detección de casos fuera de catálogo: mensajes con probabilidad máxima baja o distribución plana señalan intenciones no cubiertas por las 77 clases y pueden canalizarse a un flujo de descubrimiento de nuevas etiquetas.
- Monitorización de calidad en producción: auditar periódicamente una muestra de tráfico real y comparar la etiqueta del modelo con la resolución final del agente para detectar deriva del dominio.
- Integración como microservicio interno: envolver `predict.py` en un servicio HTTP (FastAPI, TorchServe u otro) que devuelva la etiqueta, la confianza y el top-k a los sistemas de CRM o de ticketing.

## Benchmarks y rendimiento

Resultados declarados por el autor en el `model-index` de la model card (no verificados de forma independiente). Evaluación sobre el conjunto de test oficial de BANKING77, 3.080 ejemplos, con el protocolo de 77 candidatos:

| Modelo | Accuracy | Macro F1 | Top-3 accuracy |
|---|---:|---:|---:|
| Laya base (mismo protocolo de 77 candidatos) | 45,91 % | 42,90 % | 69,42 % |
| Laya BANKING77 v1 (este modelo) | 85,55 % | 85,53 % | 96,43 % |

Métricas adicionales de calibración tras el ajuste de temperatura (test, según la model card):

| Métrica | Valor |
|---|---:|
| Temperatura de calibración | 1,1343233648166147 |
| NLL tras calibración | 0,49064 |
| ECE (15 bins de anchura uniforme) | 0,01442 |

No se han publicado en la información disponible otros benchmarks (MMLU, HumanEval, GSM8K, etc.), ya que el modelo es un clasificador especializado y no un modelo generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: orientativa, a partir de los tamaños publicados. El checkpoint base ocupa ~843 MB y los pesos ajustados ~123 MB; en FP32 el conjunto ronda 1-1,5 GB de memoria de parámetros y en BF16 aproximadamente la mitad. A esto hay que sumar activaciones, cuyo coste crece con la longitud de entrada (el presupuesto es de 8.192 tokens, aunque la longitud real observada en entrenamiento fue de 575-667 tokens).
- GPU recomendadas: no se especifica ninguna para inferencia. El entrenamiento se realizó en una RTX 5090. Cualquier GPU NVIDIA con al menos 4 GB de VRAM debería bastar para lotes pequeños en BF16/FP16; GPU de datacenter (A100, H100) solo tendrían sentido para lotes muy grandes o para el presupuesto completo de 8K tokens.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU de consumo moderna con 4 GB o más, y también en CPU. La verificación de empaquetado se hizo en CPU FP32.
- Opciones de despliegue: el repositorio solo admite su propio cargador `predict.py` (Python 3.10+, `--device cpu|mps|cuda`). No hay soporte para vLLM, TGI, Ollama, llama.cpp ni PEFT estándar, porque el formato de checkpoint es propio (LoRA más cabeza de decisión). Para producción habría que envolver `predict.py` en un servicio propio.
- Latencia y throughput: no disponible. No se publican mediciones de latencia ni de ejemplos por segundo.

## Comparativa con modelos similares

Los únicos datos comparativos publicados en la información disponible corresponden al modelo base sin ajustar evaluado con el mismo protocolo.

| Modelo | Parámetros | Contexto de entrada | Accuracy en BANKING77 (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Laya BANKING77 v1 | No disponible (~843 MB de base + 123 MB de ajuste) | Presupuesto de 8.192 tokens; 77 candidatos por ejemplo | 85,55 % (macro F1 85,53 %) | Apache 2.0 | HuggingFace, formato propio con `predict.py` |
| Laya base (`convaiinnovations/laya`) | No disponible | Mismo protocolo de 77 candidatos | 45,91 % (macro F1 42,90 %) | No indicada en la información disponible | HuggingFace, commit fijado `1c5edc1...` |

No se dispone de resultados comparables de otros clasificadores de BANKING77 (SetFit, fine-tunes de BERT/RoBERTa, LLM con prompts) en la información proporcionada, por lo que no se incluyen cifras de terceros.

## Limitaciones y advertencias

- Dominio e idioma restringidos: el modelo solo se ha entrenado y evaluado en inglés y en atención al cliente bancaria. No hay validación en otros idiomas, en atención multi-dominio ni en conjuntos de etiquetas dinámicos.
- Conjunto cerrado de 77 intenciones: no puede reconocer de forma fiable intenciones fuera de ese catálogo; la probabilidad máxima no garantiza que la etiqueta sea correcta.
- Presupuesto de 8.192 tokens no equivale a capacidad validada en contexto largo: la longitud real de entrenamiento fue de 575-667 tokens. Si se supera el presupuesto, el cargador lanza un error en lugar de truncar candidatos o texto, y el coste de memoria crece con la entrada.
- Riesgo de error de clasificación: es un clasificador, no genera texto, por lo que no alucina contenido, pero sí puede asignar etiquetas incorrectas con confianza alta. La model card recomienda validar rendimiento, calibración y umbrales de escalado sobre datos propios del negocio antes de usarlo en producción.
- Los resultados de 85,55 % de accuracy y 85,53 % de macro F1 no están verificados de forma independiente (`verified: false` en el model-index) y provienen de una única ejecución de entrenamiento con semilla fija.
- Aislamiento de datos limitado: se eliminaron duplicados y casi duplicados entre entrenamiento y test según las reglas del proyecto, pero no se ha demostrado que no exista solapamiento en los datos de preentrenamiento del modelo base.
- Formato de checkpoint no estándar: no funciona con `AutoModelForSequenceClassification`, con `pipeline()` de Transformers ni con adaptadores PEFT sueltos. Es obligatorio usar el `predict.py` incluido para reproducir el comportamiento evaluado.
- No se actualiza ni se utiliza la cabeza act/escalate del modelo base, por lo que no hay mecanismo automático de escalado integrado.
- Licencia: código y pesos de ajuste bajo Apache 2.0. El dataset BANKING77 se distribuye bajo CC BY 4.0 (Casanueva et al., 2020), con requisitos de atribución recogidos en `DATA_LICENSE.md` y `NOTICE`. Conviene revisar esos ficheros antes de un uso comercial.
- El repositorio es de muy baja adopción (0 descargas, 1 like en el momento de la consulta), por lo que no existe un historial de uso en producción que respalde su robustez.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Cahol/laya-banking77-v1
- Modelo base Laya: https://huggingface.co/convaiinnovations/laya
- Repositorio de Laya (Nandha Kishor M / Convai Innovations): https://github.com/NandhaKishorM/laya
- Dataset BANKING77: https://huggingface.co/datasets/PolyAI/banking77
- Referencia del dataset: Casanueva et al. (2020); atribución y condiciones detalladas en `DATA_LICENSE.md` del repositorio (enlace directo no disponible en la información proporcionada)
- Ficheros de reproducibilidad incluidos en el repositorio: `predict.py`, `requirements.txt`, `release_config.json`, `trainable.safetensors`, `packaging_verification.json`, `training_metadata.json`, `data_manifest.json`, `evaluation.json`, `SHA256SUMS`, `LICENSE`, `NOTICE`
- No se han encontrado papers, blogs ni demos adicionales específicos de este modelo en los resultados de búsqueda web disponibles.
