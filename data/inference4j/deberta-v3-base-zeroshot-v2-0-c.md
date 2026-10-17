# inference4j/deberta-v3-base-zeroshot-v2.0-c

## Resumen

Este repositorio contiene una exportación ONNX FP32 del modelo MoritzLaurer/deberta-v3-base-zeroshot-v2.0-c, un DeBERTa-v3 base de aproximadamente 184 millones de parámetros para inferencia de lenguaje natural (NLI) y clasificación zero-shot. No es un modelo nuevo ni un generador de texto: inference4j lo empaqueta para su uso desde Java con ONNX Runtime.

El modelo resuelve clasificación de texto sin entrenamiento específico: puntúa si una etiqueta candidata se deduce del texto de entrada mediante entailment. Admite secuencias de hasta 512 tokens, licencia MIT y pesos FP32, lo que facilita despliegues ligeros en CPU o GPU.

Es relevante para equipos que necesitan etiquetado configurable y de bajo coste dentro de aplicaciones Java, sin depender de APIs generativas. Su utilidad práctica depende de validar el idioma, la formulación de etiquetas y los umbrales de decisión en el dominio concreto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Autor del repositorio | inference4j |
| Modelo original | MoritzLaurer/deberta-v3-base-zeroshot-v2.0-c |
| Pipeline | zero-shot-classification |
| Arquitectura | DeBERTa-v3 base (DebertaV2ForSequenceClassification), encoder transformer para NLI |
| Parámetros totales | ~184 M |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (longitud máxima de secuencia de entrada) |
| Tipos de cuantización | FP32 en ONNX; no se documentan otras cuantizaciones en este repositorio |
| Idiomas soportados | no disponible (no se documenta cobertura multilingüe) |
| Licencia | MIT |
| Formato de pesos | ONNX FP32 (opset 18); tokenizer.json con SentencePiece Unigram |
| Entrada | input_ids y attention_mask, int64 [batch, sequence] |
| Salida | logits, float32 [batch, 2] |
| Etiquetas | 0: entailment; 1: not_entailment |
| Tamaño del repositorio | 0,7 GB |

## Arquitectura y entrenamiento

El modelo es un encoder transformer DeBERTa-v3 base configurado como DebertaV2ForSequenceClassification con dos etiquetas. La clasificación se formula como NLI: el texto de entrada actúa como premisa y cada etiqueta candidata se convierte en una hipótesis; el modelo devuelve dos logits, uno para entailment y otro para not_entailment. No genera texto ni mantiene conversaciones.

La variante `-c` se entrenó únicamente con datos considerados compatibles con uso comercial: datos sintéticos generados con Mixtral-8x7B-Instruct-v0.1, MNLI y FEVER-NLI. No se dispone del número de tokens, la composición exacta del dataset, hiperparámetros ni si hubo RLHF o DPO. La exportación a ONNX se realizó con Hugging Face Optimum en FP32 y opset 18; el grafo no incluye softmax ni reordenación de etiquetas.

## Capacidades

- Clasificación zero-shot de texto mediante NLI: permite evaluar etiquetas candidatas sin reentrenar el modelo.
- Puntuación de entailment por etiqueta: devuelve logits para `entailment` y `not_entailment`.
- Evaluación de múltiples etiquetas de forma independiente; la decisión multietiqueta requiere aplicar umbrales.
- Inferencia por lotes con `input_ids` y `attention_mask` de tipo int64.
- Procesamiento de secuencias de hasta 512 tokens.
- Integración en Java mediante inference4j y ONNX Runtime.
- No soporta generación de texto, resumen, diálogo abierto, código, matemáticas, visión ni audio.
- No soporta tool calling ni function calling.
- No está diseñado para agentes ni razonamiento multi-paso.
- No se documenta soporte multilingüe; no se debe asumir cobertura de idiomas distinta de la validada empíricamente.
- No dispone de modo thinking ni capacidades especiales de razonamiento generativo.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo puede clasificar cada mensaje entre etiquetas configurables como facturación, caída de servicio o solicitud de funcionalidad. Es adecuado porque no requiere entrenamiento específico y permite cambiar la taxonomía sin reentrenar, aunque conviene calibrar umbrales con datos reales.
- Triaje de correo entrante: se pueden definir etiquetas por departamento o urgencia y puntuar cada correo para asignarlo al equipo correspondiente. Su tamaño reducido y su formato ONNX permiten integrarlo en servicios Java con latencia contenida.
- Moderación asistida de comentarios: permite puntuar categorías como spam, acoso o contenido legítimo y derivar los casos dudosos a revisión humana. No es un sistema de seguridad completo ni sustituye políticas de moderación validadas.
- Análisis de encuestas abiertas: se pueden clasificar respuestas de NPS o satisfacción en temas predefinidos para agregar resultados. Es útil para etiquetado exploratorio y para priorizar revisiones manuales, no como sustituto de un análisis cualitativo.
- Detección de intenciones en asistentes conversacionales: permite clasificar una intervención del usuario en intenciones como consultar estado, cancelar servicio o solicitar ayuda. La clasificación se basa en etiquetas candidatas y no en generación libre, lo que simplifica el control del flujo.
- Enriquecimiento de CRM: se pueden etiquetar mensajes de clientes por línea de producto, motivo de contacto o nivel de urgencia antes de almacenarlos. El modelo aporta una capa ligera de clasificación sin depender de un proveedor externo.
- Investigación y etiquetado de corpus: sirve para preetiquetar grandes volúmenes de texto y acelerar la revisión humana o el active learning. Su F1 medio de 0,619 en 28 tareas zero-shot indica utilidad general, pero exige validación por dominio y por idioma.

## Benchmarks y rendimiento

| Evaluación | Métrica | Resultado | Observaciones |
|---|---|---|---|
| 28 tareas zero-shot | F1 medio | 0,619 | Dato publicado en la model card; no se desglosan resultados por tarea |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K u otros benchmarks generativos. No aplican directamente porque el modelo es un encoder NLI para clasificación, no un modelo de generación.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,74 GB solo para los pesos FP32 (184 M × 4 bytes); con overhead de activaciones y batch pequeño, se puede estimar un rango de 1 a 2 GB, dependiendo de la longitud de secuencia y del lote.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de memoria para inferencia en FP32; una T4, L4, A10 o RTX 4090 ofrece margen suficiente, aunque A100/H100 no son necesarias para este tamaño.
- Cabe en GPU consumer: sí, en tarjetas con 4 GB o más, como una GTX 1650 de 4 GB, una RTX 3050 o una RTX 4090. También es viable en CPU mediante ONNX Runtime.
- Opciones de despliegue: ONNX Runtime, inference4j para Java y Hugging Face Optimum para exportación o validación. vLLM, llama.cpp, Ollama y TGI no son adecuados para este repositorio porque no es un modelo generativo ni un archivo GGUF.
- Latencia y throughput: no disponible; no se proporcionan mediciones en la información consultada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Formato | Disponibilidad |
|---|---:|---:|---|---|---|---|
| inference4j/deberta-v3-base-zeroshot-v2.0-c | ~184 M | 512 | Clasificación zero-shot / NLI | MIT | ONNX FP32 | Repositorio ONNX para inference4j |
| MoritzLaurer/deberta-v3-base-zeroshot-v2.0-c | ~184 M | 512 | Clasificación zero-shot / NLI | MIT | PyTorch / Transformers | Modelo original en PyTorch |

No se dispone de datos de rendimiento ni especificaciones de otros modelos NLI zero-shot comparables en la información proporcionada. Por tanto, no se presenta una comparación cuantitativa con alternativas adicionales.

## Limitaciones y advertencias

- No es un modelo generativo: no sirve para chat, resumen, redacción, código, matemáticas, visión ni audio.
- No se documentan evaluaciones de sesgo; puede heredar sesgos presentes en MNLI, FEVER y los datos sintéticos generados con Mixtral.
- El riesgo de alucinación no aplica en el sentido generativo, pero puede producir puntuaciones de entailment incorrectas o excesivamente confiadas; es necesario calibrar con datos propios.
- La longitud máxima de entrada es de 512 tokens; los textos más largos deben truncarse o dividirse, lo que puede perder información relevante.
- No se documenta cobertura multilingüe; hay que validar el idioma de destino antes de usarlo en producción.
- Los resultados son sensibles a la formulación de las etiquetas y de la plantilla de hipótesis; pequeñas variaciones pueden cambiar las puntuaciones.
- Los logits no incluyen softmax ni calibración; la decisión final requiere postprocesado y umbrales ajustados al caso de uso.
- La licencia MIT permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de copyright y la licencia; el software se ofrece sin garantía.
- No dispone de ajuste específico de seguridad; para moderación o cumplimiento conviene combinarlo con revisión humana y políticas adicionales.
- Puede sufrir cambio de dominio entre los datos de entrenamiento y el texto real de producción; se recomienda evaluar con un conjunto etiquetado del dominio.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/inference4j/deberta-v3-base-zeroshot-v2.0-c
- Modelo original: https://huggingface.co/MoritzLaurer/deberta-v3-base-zeroshot-v2.0-c
- Autor original: https://huggingface.co/MoritzLaurer
- inference4j: https://github.com/inference4j/inference4j
- Dataset sintético: https://huggingface.co/datasets/MoritzLaurer/synthetic_zeroshot_mixtral_v0.1
- Dataset MultiNLI: https://huggingface.co/datasets/nyu-mll/multi_nli
- Dataset FEVER: https://huggingface.co/datasets/fever
