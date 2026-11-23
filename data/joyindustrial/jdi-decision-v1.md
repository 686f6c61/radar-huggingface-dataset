# JoyIndustrial/JDI-Decision-V1

## Resumen

JDI-Decision-V1 es un sistema multimodal de toma de decisiones desarrollado por JD Industrials (京东工业), la división industrial del gigante chino del comercio electrónico JD.com. A diferencia de un modelo generativo convencional, su salida son elecciones estructuradas con probabilidades asociadas para preguntas de opción múltiple sobre texto e imágenes, lo que lo orienta a tareas de clasificación, verificación y decisión automatizada en entornos industriales.

El sistema se construye sobre una base Qwen3.8-27B (etiquetada internamente como `qwen3_5` en los tags) con adaptaciones de la arquitectura de decisión D3, e incorpora un codificador visual propio, un componente de reconocimiento de texto PaddleOCR v5 congelado (de Baidu) y una cabeza de lectura en FP32. El conjunto suma 26.085.330.160 parámetros (aproximadamente 26,1 mil millones) y un repositorio de 52,2 GB en formato safetensors.

Su relevancia actual radica en que cubre el nicho de los modelos de decisión multimodales especializados, un espacio poco poblado frente a los LLM generativos generalistas. La licencia CC BY-NC 4.0 limita el uso comercial sin autorización expresa, lo que condiciona su adopción en producción. La evaluación pública reportada por el autor es una puntuación propia (Decision Index Vision 79,7313), no una clasificación oficial de leaderboard.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con backbone Qwen3.8-27B y adaptaciones D3 (decision-architecture); codificador visual + PaddleOCR v5 congelado + cabeza de lectura FP32 |
| Parametros totales | 26.085.330.160 (aprox. 26,1 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | CC BY-NC 4.0 (uso no comercial, atribución obligatoria; uso comercial requiere permiso separado) |
| Formato de pesos | safetensors, PyTorch (`trust_remote_code=True`) |

## Arquitectura y entrenamiento

JDI-Decision-V1 no es un modelo generativo de texto libre, sino un sistema de decisión estructurado. Su flujo de inferencia parte de la decodificación de la imagen, conversión a RGB y redimensionado bajo un límite de píxeles; a continuación se ejecutan dos ramas internas en paralelo sobre una única GPU: un codificador visual que extrae características de la imagen y un componente PaddleOCR v5 congelado (de Baidu) que reconoce el texto presente. La transcripción OCR se inyecta en `state.image_text_transcription` junto al estado original. El backbone de decisión procesa las características visuales junto con el texto, la pregunta y las opciones, y una cabeza de lectura en FP32 produce la respuesta estructurada y las probabilidades por opción.

Los detalles de entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO) no están disponibles en la información proporcionada. La model card únicamente remite a la guía de reproducción (REPRODUCE.md) para los detalles de la arquitectura base y del runtime de decisión. El sistema está diseñado para que cada petición se ejecute íntegramente en una sola GPU, reutilizando las características visuales solo dentro de esa misma petición; el texto OCR complementa, no sustituye, la información de la imagen.

## Capacidades

- Toma de decisiones estructurada: devuelve opciones seleccionadas y probabilidades asociadas para preguntas de tipo elección.
- Procesamiento multimodal: acepta imágenes y texto combinados en una misma consulta.
- Reconocimiento de texto en imagen (OCR) mediante PaddleOCR v5 congelado, integrado en el flujo de inferencia.
- Manejo de criterios de decisión: la API permite definir preguntas con instrucciones y un mapa de criterios (por ejemplo, A = STOP, B = GO).
- Inferencia por GPU única con ramas visual y OCR concurrentes.
- Soporte de carga vía `AutoModel.from_pretrained(..., trust_remote_code=True)`, incluyendo el componente OCR congelado.
- Punto de entrada de reproducción completo mediante `ocr_inference.ComboEngine`; el punto de entrada interno `inference.D3Engine` no incluye el procesamiento OCR del sistema completo.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (la model card está en chino e inglés, pero no se documentan idiomas soportados).

## Casos de uso

- Inspección visual con verificación de texto: el sistema puede leer señales, etiquetas o paneles mediante OCR y decidir si una imagen cumple un criterio (por ejemplo, si una señal indica "STOP" o "GO"), combinando la transcripción con las características visuales.
- Clasificación de documentos industriales: dado un escaneo de una ficha técnica o albarán, el modelo puede seleccionar la categoría correcta entre opciones predefinidas y devolver la probabilidad asociada, útil para triaje documental.
- Control de calidad automatizado: en líneas de producción, evaluar imágenes de producto o embalaje frente a criterios de aceptación y devolver una decisión binaria o multiclase con nivel de confianza.
- Verificación de cumplimiento normativo: comprobar si una imagen de instalación o equipo satisface una lista de requisitos, usando las probabilidades por opción para priorizar la revisión humana en casos de baja confianza.
- Enrutamiento de tickets con soporte visual: clasificar incidencias que incluyen capturas o fotografías hacia el equipo o la categoría adecuada, aprovechando la salida estructurada con probabilidades.
- Asistencia a operarios en campo: responder preguntas de opción múltiple sobre una fotografía tomada en planta (estado de un componente, presencia de una etiqueta) con latencias del orden de cientos de milisegundos.
- Evaluación de accesibilidad o señalética: determinar si una imagen contiene el texto o símbolo esperado según criterios definidos, con transcripción OCR auditable en la salida.

## Benchmarks y rendimiento

El autor reporta una puntuación propia en el suite público Decision Index Vision de **79,7313**, con 12.210/12.210 peticiones exitosas en 11 benchmarks. Se trata de una puntuación autodeclarada, no de una clasificación confirmada en leaderboard ni de la puntuación completa (Full). La validación privada y la validación oficial de latencia en RTX PRO 6000 están pendientes.

La ejecución se realizó con dos workers H200, cada uno con una réplica completa del sistema y una petición a la vez. La latencia por petición incluye decodificación, OCR, codificación visual y el forward pass de decisión; se excluyen carga, hashing de integridad y ejecuciones de profiler.

| Métrica de latencia | Valor |
|---|---|
| Media | 326,0 ms |
| P50 | 263,4 ms |
| P80 | 401,1 ms |
| P90 | 583,0 ms |

No se han publicado resultados de benchmarks comparativos (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 26,1 B de parámetros en FP16/BF16 se requiere aproximadamente 52 GB solo para pesos, más el codificador visual, el OCR y las activaciones. En FP32 la huella sería considerablemente mayor.
- GPU recomendadas: el autor valida con H200 (una GPU por petición, dos workers en paralelo). La validación oficial de latencia en RTX PRO 6000 está pendiente.
- ¿Cabe en GPU consumer? No de forma directa en FP16 con los pesos completos; requeriría cuantización, de la que no se documentan tipos soportados.
- Opciones de despliegue: PyTorch con `trust_remote_code=True`; el repositorio incluye `ocr_inference.ComboEngine` y `inference.D3Engine` como puntos de entrada. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: latencia media de 326,0 ms por petición (P50 263,4 ms, P90 583,0 ms) en H200; throughput no reportado.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría (sistemas de decisión multimodales especializados) en la documentación proporcionada. La model card no incluye comparativas con alternativas.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| JDI-Decision-V1 | 26,1 B | no disponible | CC BY-NC 4.0 | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia CC BY-NC 4.0: el uso comercial requiere autorización separada de JD Industrials; la atribución es obligatoria. Los componentes de terceros (PaddleOCR v5, cabeceras de Paddle) conservan sus propias licencias.
- La puntuación de benchmark es autodeclarada y no verificada por un leaderboard oficial; la evaluación privada y la validación de latencia en RTX PRO 6000 están pendientes.
- No se documentan sesgos conocidos, pero al estar entrenado sobre datos no especificados y orientado a un dominio industrial concreto, su generalización fuera de ese dominio es incierta.
- Riesgo de alucinación en las transcripciones OCR y en las decisiones: el sistema devuelve probabilidades, por lo que en producción conviene establecer umbrales de confianza y revisión humana.
- Idiomas soportados no documentados; la model card está en chino e inglés, pero no se garantiza cobertura multilingüe.
- Longitud de contexto no disponible, lo que dificulta planificar escenarios con documentos o conversaciones largas.
- No se documentan tipos de cuantización, lo que limita el despliegue en hardware de gama baja.
- La latencia reportada corresponde a H200; en GPUs menos potentes será mayor y no está validada oficialmente.
- El punto de entrada `inference.D3Engine` no incluye el procesamiento OCR del sistema completo; para reproducir la evaluación hay que usar `ocr_inference.ComboEngine`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JoyIndustrial/JDI-Decision-V1
- Organización JD Industrials: https://www.jingdongindustrials.com/
- Dataset de resultados de evaluación: https://huggingface.co/datasets/stupid-zwl/JDI-Decision-V1/tree/427820d71f624baac1c747e9b484a75a8f744ba6/runs/vision-paddle-v5
- Licencia CC BY-NC 4.0: https://creativecommons.org/licenses/by-nc/4.0/
- Guía de reproducción (REPRODUCE.md): incluida en el repositorio del modelo
- Fuentes y hashes del OCR (ocr_inference/ocr_sources.json): incluido en el repositorio del modelo
