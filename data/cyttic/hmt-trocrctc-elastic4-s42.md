# cyttic/hmt-trocrctc-elastic4-s42

## Resumen

El modelo `cyttic/hmt-trocrctc-elastic4-s42` es un sistema de reconocimiento de texto manuscrito (HTR, *Handwritten Text Recognition*) desarrollado por el grupo cyttic. Se trata de un modelo basado en TrOCR con cabecera CTC, entrenado para transcribir texto manuscrito en hebreo. Forma parte de un estudio sistemático de aumentación de datos denominado "htr-metrics-transfer", concretamente la oleada 1, con la configuración de aumentación `elastic4` y semilla 42.

El modelo resuelve el problema de la transcripción automática de documentos manuscritos en hebreo, un idioma con relativamente pocos recursos en el ámbito del HTR comparado con el inglés o el latín. Con 87,3 millones de parámetros, es un modelo compacto que puede desplegarse en hardware modesto, lo que lo hace atractivo para digitalización de archivos y proyectos de preservación documental.

Es relevante ahora porque demuestra que técnicas de aumentación geométrica (elastic4) aplicadas sobre arquitecturas TrOCR+CTC pueden lograr tasas de error competitivas (CER 0,0959, WER 0,3949) en un idioma de bajos recursos como el hebreo, y porque publica los resultados de forma reproducible (semilla fija, dataset de entrenamiento y test identificados).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TrOCR con cabecera CTC (encoder vision transformer + decoder CTC) |
| Parametros totales | 87.279.756 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizacion no documentada) |
| Idiomas soportados | hebreo (he) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura combina un encoder de visión tipo TrOCR (transformer preentrenado para reconocimiento de texto en imágenes) con una cabecera de decodificación CTC (*Connectionist Temporal Classification*). A diferencia de la decodificación autorregresiva clásica de TrOCR, la cabecera CTC permite alineamientos monotonos sin necesidad de un decoder autoregresivo, lo que simplifica la inferencia y reduce la latencia. El modelo tiene 87,3 millones de parámetros, lo que sugiere un encoder ViT de tamaño base o similar con una cabeza CTC ligera.

El entrenamiento se realizó sobre el split de entrenamiento del dataset `cyttic/hhd-optionb-split`, excluyendo los escritores de desarrollo (*dev writers*), lo que evita fuga de información entre entrenamiento y validación. La aumentación aplicada es `elastic4`, una variante de deformación elástica de las imágenes de entrada, típica en HTR para mejorar la robustez frente a variaciones de escritura. La evaluación se realizó sobre el test HHD Option-B con decodificación greedy y sin modelo de lenguaje, obteniendo CER 0,0959 y WER 0,3949. No se documenta el número de tokens de entrenamiento ni si hubo etapas de RLHF o DPO (no aplicables en HTR).

## Capacidades

- Reconocimiento de texto manuscrito en hebreo a partir de imágenes de líneas o regiones de texto.
- Decodificación CTC greedy, sin modelo de lenguaje externo, lo que simplifica el pipeline.
- Transcripción carácter a carácter con métricas CER y WER documentadas.
- Robustez frente a deformaciones elásticas de la escritura gracias a la aumentación `elastic4`.
- No soporta tool calling ni function calling (no es un modelo de lenguaje generativo).
- No soporta agentes ni razonamiento multi-paso.
- No es multilingüe: está especializado exclusivamente en hebreo.
- No dispone de modo thinking, visión general, audio ni otras capacidades multimodales más allá de la lectura de imágenes de texto.

## Casos de uso

- Digitalización de archivos históricos en hebreo: el modelo transcribe líneas manuscritas escaneadas, adecuado para proyectos de preservación documental donde se requiere procesar grandes volúmenes con hardware modesto (87 M de parámetros).
- Extracción de texto de formularios manuscritos: integrado en un pipeline OCR, permite convertir respuestas manuscritas en hebreo a texto estructurado para su volcado en bases de datos.
- Indexación y búsqueda en corpus manuscritos: al generar transcripciones automáticas, habilita búsqueda por texto completo sobre colecciones previamente no indexables.
- Anotación asistida para investigadores: el modelo puede pre-anotar transcripciones que luego revisa un humanista, reduciendo el coste de transcripción manual con un CER cercano al 10 %.
- Procesamiento por lotes en entornos con recursos limitados: su tamaño compacto permite ejecutarlo en CPU o GPU de gama baja para digitalizaciones masivas sin infraestructura dedicada.
- Estudio de técnicas de aumentación en HTR: sirve como punto de referencia reproducible (semilla 42, configuración elastic4) para comparar el impacto de distintas aumentaciones en idiomas de bajos recursos.
- Integración en pipelines de archivística con validación humana: dado el WER del 39,5 %, es adecuado como primera pasada en flujos donde un revisor corrige las transcripciones.

## Benchmarks y rendimiento

| Benchmark | Métrica | Resultado |
|---|---|---|
| HHD Option-B test (greedy, sin LM) | CER | 0,0959 |
| HHD Option-B test (greedy, sin LM) | WER | 0,3949 |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (87 M de parámetros ≈ 350 MB de pesos), por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (GTX 1050, RTX 3050, RTX 4090, A100, H100); también es viable en CPU para lotes pequeños.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU modernas e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: PyTorch con Transformers (carga de safetensors), exportación a ONNX para inferencia optimizada; no se documenta soporte nativo en vLLM, llama.cpp, Ollama o TGI (son frameworks orientados a LLM, no a HTR).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | CER (HHD Option-B) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cyttic/hmt-trocrctc-elastic4-s42 | 87,3 M | no disponible | 0,0959 | MIT | HuggingFace |
| TrOCR base (Microsoft) | ~334 M | no disponible | no disponible en hebreo | MIT | HuggingFace |
| Modelos HTR hebreo alternativos | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada; la comparativa con TrOCR base se limita a parámetros y licencia.

## Limitaciones y advertencias

- El WER del 39,5 % indica que aproximadamente cuatro de cada diez palabras requieren corrección; no es adecuado para producción sin revisión humana.
- Especializado exclusivamente en hebreo; no transcribe otros idiomas ni escritura impresa de forma fiable.
- Entrenado sobre un único dataset (`cyttic/hhd-optionb-split`) con escritores concretos; puede degradarse ante estilos de escritura, soportes o resoluciones no representados.
- Decodificación greedy sin modelo de lenguaje: no corrige errores contextuales ni ortográficos.
- Riesgo de alucinación limitado al ámbito de la transcripción (caracteres espurios o omisiones), pero presente en imágenes de baja calidad.
- Sesgos potenciales derivados de la distribución de escritores del dataset de entrenamiento (edad, género, origen no documentados).
- Licencia MIT: permite uso comercial y modificación, pero no se ofrece garantía alguna sobre el rendimiento en dominios distintos al de evaluación.
- No se documentan requisitos de preprocesado (resolución, normalización) más allá de la aumentación de entrenamiento; es necesario replicar el pipeline del autor para obtener las métricas reportadas.

## Enlaces

- HuggingFace: https://huggingface.co/cyttic/hmt-trocrctc-elastic4-s42
- Dataset de entrenamiento: https://huggingface.co/datasets/cyttic/hhd-optionb-split
- Resultados detallados: results.json (referenciado en la model card, dentro del repositorio)
