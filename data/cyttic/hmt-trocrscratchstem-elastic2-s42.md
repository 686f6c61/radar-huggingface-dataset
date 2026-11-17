# cyttic/hmt-trocrscratchstem-elastic2-s42

## Resumen

`cyttic/hmt-trocrscratchstem-elastic2-s42` es un modelo de reconocimiento de texto manuscrito (HTR, *handwritten text recognition*) publicado por el autor `cyttic` en Hugging Face. Se trata de un modelo de 24.928.588 parámetros (aproximadamente 25 millones) entrenado con una cabeza CTC sobre una arquitectura derivada de TrOCR, según se desprende del nombre `trocrscratchstem` y de la etiqueta `ctc` de la model card. Forma parte de un estudio sistemático de aumento de datos (*augmentation study*) denominado `htr-metrics-transfer`.

La relevancia del modelo es acotada y muy específica: no es un modelo de propósito general, sino un artefacto experimental de investigación orientado a medir el efecto de distintas estrategias de aumento de datos (en este caso, `elastic2`) sobre métricas de transcripción en hebreo manuscrito. Está entrenado sobre el conjunto `cyttic/hhd-optionb-split`, excluyendo los escritores (*writers*) de validación, y evaluado sobre el test HHD Option-B.

El modelo reconoce únicamente hebreo (`he`), se distribuye bajo licencia MIT, emplea pesos en formato safetensors y ocupa 0,1 GB en el repositorio. Su interés práctico es limitado fuera del contexto del experimento, pero resulta útil como punto de referencia reproducible (semilla 42) para investigaciones sobre robustez de HTR ante deformaciones elásticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder tipo TrOCR con cabeza CTC (según nombre y tags del modelo) |
| Parametros totales | 24.928.588 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hebreo (`he`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura se infiere del identificador `trocrscratchstem`, que sugiere un TrOCR entrenado desde cero (*scratch*) con un *stem* o tronco modificado, y de la etiqueta `ctc`, que indica que la decodificación se realiza mediante Connectionist Temporal Classification en lugar de generación autorregresiva. El recuento real de parámetros (24,9 M) es muy inferior al de los TrOCR estándar de la familia base (que rondan los 300 M), lo que apunta a un encoder de visión y un decodificador mucho más pequeños, coherentes con un modelo entrenado desde cero sobre un corpus específico de escritura manuscrita hebrea.

El entrenamiento se realizó sobre el conjunto `cyttic/hhd-optionb-split`, excluyendo los escritores reservados para desarrollo, y aplicando una estrategia de aumento de datos etiquetada como `elastic2` (deformaciones elásticas). La semilla es 42, lo que sugiere reproducibilidad dentro del estudio. La evaluación se hizo sobre el test HHD Option-B con decodificación *greedy* y sin modelo de lenguaje, obteniendo CER 0,0802 y WER 0,3488. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo ajuste fino con RLHF o DPO (poco probable en una tarea CTC de reconocimiento).

## Capacidades

- Reconocimiento de texto manuscrito en hebreo a partir de imágenes de líneas o palabras.
- Decodificación CTC con *greedy decoding*; no requiere modelo de lenguaje externo para producir la transcripción.
- Entrenado con aumento de datos elástico (`elastic2`), lo que debería aportar cierta robustez ante variaciones de estilo de escritura.
- No dispone de soporte de *tool calling* ni de *function calling*.
- No está orientado a agentes ni a razonamiento multi-paso.
- Capacidad multilingüe: únicamente hebreo.
- No dispone de modo *thinking*, visión general (más allá de OCR), audio ni otras capacidades.

## Casos de uso

- Digitalización de archivos manuscritos en hebreo: el modelo puede transcribir líneas de documentos escaneados y alimentar pipelines de indexación o búsqueda, siempre que la calidad tipográfica y de escritura se asemeje a la del corpus HHD.
- Investigación en aumento de datos para HTR: sirve como punto de comparación reproducible (semilla 42, aumento `elastic2`) frente a otras variantes del estudio `htr-metrics-transfer`.
- Evaluación de robustez ante deformaciones: permite medir cómo afecta el aumento elástico a CER y WER en hebreo manuscrito, con métricas ya publicadas (CER 0,0802, WER 0,3488) como referencia.
- Generación de transcripciones auxiliares para etiquetado asistido: puede usarse para preanotar líneas manuscritas y que revisores humanos corrijan, reduciendo el coste de anotación.
- Benchmark interno de pipelines CTC: útil como modelo ligero (25 M de parámetros) para validar infraestructura de inferencia CTC antes de escalar a modelos mayores.
- Docencia y experimentación: su tamaño reducido y licencia MIT lo hacen apropiado para prácticas sobre OCR/HTR y decodificación CTC en entornos con recursos limitados.

## Benchmarks y rendimiento

| Metrica | Valor | Condiciones |
|---|---|---|
| CER | 0,0802 | Test HHD Option-B, greedy, sin LM |
| WER | 0,3488 | Test HHD Option-B, greedy, sin LM |

No se han publicado resultados adicionales (MMLU, HumanEval u otros) en la información disponible; no aplican a esta tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 dado el tamaño de 24,9 M de parámetros; en la práctica, unos pocos cientos de MB incluyendo buffers de activación.
- GPU recomendadas: cualquier GPU moderna es suficiente; una RTX 3060, RTX 4090, A100 o H100 funcionarán sin problema, pero el modelo también puede ejecutarse en CPU.
- Cabe holgadamente en cualquier GPU de consumo e incluso en dispositivos de borde.
- Opciones de despliegue: al ser un modelo CTC pequeño en safetensors, es adecuado para PyTorch/Transformers, ONNX Runtime o TorchScript; no se documentan integraciones con vLLM, llama.cpp u Ollama (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño, se espera baja latencia por línea, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Idioma | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cyttic/hmt-trocrscratchstem-elastic2-s42 | 24,9 M | hebreo | no disponible | MIT | Hugging Face |
| TrOCR base (Microsoft) | ~334 M | inglés principalmente | no disponible | MIT | Hugging Face |
| TrOCR small (Microsoft) | ~62 M | inglés principalmente | no disponible | MIT | Hugging Face |
| Otros modelos del estudio cyttic (`htr-metrics-transfer`) | no disponible | hebreo | no disponible | MIT (probable) | Hugging Face |

La comparación con TrOCR estándar es orientativa: este modelo está entrenado desde cero para hebreo manuscrito y con CTC, mientras que TrOCR usa decodificación autorregresiva y está preentrenado en inglés. No se dispone de comparativas de rendimiento publicadas con otros modelos en la información disponible.

## Limitaciones y advertencias

- Modelo experimental de un estudio de aumento de datos; no está validado para uso en producción general.
- Solo reconoce hebreo; no soporta otros idiomas ni escritura impresa de forma fiable.
- El WER de 0,3488 es elevado en términos absolutos (aunque el CER de 0,0802 es razonable), lo que indica errores frecuentes a nivel de palabra.
- Riesgo de alucinación de caracteres o palabras en documentos con estilos de escritura alejados del corpus HHD.
- Sin modelo de lenguaje en la decodificación, la salida puede contener secuencias no válidas lingüísticamente.
- No se documentan sesgos específicos, pero al entrenarse sobre un conjunto limitado de escritores, puede generalizar mal a nuevos escritores o dominios.
- Licencia MIT permite uso comercial, pero la falta de garantías y de validación fuera del corpus desaconseja su uso directo en entornos críticos sin evaluación previa.
- No hay datos publicados sobre cuantización, contexto máximo ni rendimiento en hardware específico.

## Enlaces

- Hugging Face: https://huggingface.co/cyttic/hmt-trocrscratchstem-elastic2-s42
- Dataset de entrenamiento referenciado: `cyttic/hhd-optionb-split` (en Hugging Face)
- Estudio de referencia: `htr-metrics-transfer` (mencionado en la model card; sin URL disponible)
- TrOCR (arquitectura base): https://huggingface.co/docs/transformers/model_doc/trocr
