# inclusionAI/ArmorOCR-GGUF

## Resumen

ArmorOCR-GGUF es la distribucion cuantizada en formato GGUF de ArmorOCR, un framework de dos etapas para reconocimiento optico de caracteres (OCR) con perception adversarial y localizacion (grounding) de regiones, desarrollado por inclusionAI (equipo ant-research). El modelo esta construido sobre Qwen3-VL-8B-Instruct y aborda un problema concreto: los sistemas OCR convencionales fallan ante texto degradado, rotado, estilizado, camuflado o manipulado digitalmente, escenarios que este modelo trata de forma explicita mediante razonamiento visual estructurado.

La relevancia actual del modelo reside en su enfoque de "percepcion adversarial": no se limita a transcribir texto limpio, sino que razona sobre la imagen para localizar y extraer texto en condiciones dificiles (texto diminuto, bajo contraste, superposicion de patrones, fusion AIGC, codificacion simbolica). El modelo base cuenta con 8.190.735.360 parametros y esta disponible bajo licencia Apache 2.0, con soporte para ingles y chino.

Esta version GGUF ofrece dos niveles de cuantizacion, Q8_0 y Q4_K_M, tanto para el modelo principal como para el proyector de vision (mmproj), pensados para servirse con llama.cpp. Esto permite desplegar el modelo en hardware de consumo y en equipos Apple Silicon, algo que la version de precision completa en safetensors no facilita.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language transformer (derivada de Qwen3-VL-8B-Instruct) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 y Q4_K_M (modelo principal y mmproj) |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 (sujeta ademas a la licencia y politica de uso aceptable de Qwen/Qwen3-VL-8B-Instruct) |
| Formato de pesos | GGUF (repo de 15,1 GB) |

## Arquitectura y entrenamiento

ArmorOCR es un framework de dos etapas para "grounded adversarial OCR perception" construido sobre Qwen3-VL-8B-Instruct, un modelo vision-language transformer de 8.190 millones de parametros. La innovacion metodologica descrita en el paper es la "Observation-Transferred Self-Distillation", orientada a transferir la capacidad de observacion del modelo hacia la percepcion de texto en condiciones adversarias. El modelo emplea un modo de razonamiento estructurado: el prompt de referencia solicita que el razonamiento se emita dentro de etiquetas `<analyze></analyze>` y el texto final reconocido dentro de `<answer></answer>`, lo que permite separar el proceso de analisis visual de la transcripcion final.

No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO. La evaluacion publica se realiza sobre el benchmark AdvSpot, que cubre cinco categorias de degradacion: manipulacion espacial (texto rotado, espejado, diminuto), variacion de glifos (texto estilizado, manuscrito), degradacion de imagen (artefactos de captura, post-procesado), mezcla contextual (bajo contraste, fusion AIGC, superposicion de patrones) y codificacion visual (codificacion simbolica, de puntos y de lineas).

## Capacidades

- Reconocimiento optico de caracteres (OCR) con localizacion de regiones (grounded OCR): identifica el texto y su ubicacion en la imagen.
- Percepcion adversarial: maneja texto rotado, espejado, diminuto, estilizado, manuscrito, con bajo contraste, con superposicion de patrones, fusionado con contenido AIGC y codificado mediante simbolos, puntos o lineas.
- Razonamiento visual estructurado: emite analisis intermedio en `<analyze>` y respuesta final en `<answer>`.
- Respuesta a preguntas visuales (VQA) con grounding por region.
- Capacidades multimodales de vision-lenguaje heredadas de Qwen3-VL-8B-Instruct.
- Soporte multilingue limitado a ingles y chino.
- Servicio mediante API compatible con OpenAI a traves de `llama-server` (endpoint `/v1/chat/completions`).
- Soporte de conversacion multi-turno (tag `conversational`).

## Casos de uso

- Digitalizacion de documentos degradados: el modelo extrae texto de escaneos con artefactos de captura o post-procesado, un escenario donde el OCR clasico pierde caracteres; su entrenamiento especifico en la categoria "Imaging Degradation" lo hace adecuado para archivos historicos o faxes.
- Lectura de texto en entornos reales no controlados: carteles rotados, espejados o con perspectiva deformada, gracias a la categoria de manipulacion espacial (accuracy de 57,1 en texto rotado con Q8_0).
- Moderacion de contenido generado por IA: deteccion y transcripcion de texto fusionado en imagenes AIGC (categoria "AIGC Fusion", 82,9 de accuracy), util para pipelines de verificacion de contenido sintetico.
- Extraccion de texto manuscrito: digitalizacion de formularios y notas manuscritas (53,3 de accuracy con Q8_0 en texto manuscrito), integrable en flujos de captura documental.
- Analisis de capturas de pantalla y UI: lectura de texto pequeno o con bajo contraste en interfaces, con localizacion de la region mediante IoU (64,2 promedio con Q8_0).
- Despliegue en hardware de consumo o Apple Silicon: al estar en GGUF, puede servirse localmente con llama.cpp en un Apple M3 Pro (configuracion usada en la evaluacion oficial) o en GPUs consumer, sin necesidad de infraestructura de centro de datos.
- Automatizacion de accesibilidad: transcripcion de texto incrustado en imagenes para lectores de pantalla, incluyendo texto codificado mediante simbolos o patrones.

## Benchmarks y rendimiento

Resultados de VQA con grounding por region (accuracy e IoU) sobre la release publica AdvSpot (383 imagenes / 389 pares VQA con grounding). Los tiers GGUF se sirvieron con `llama-server` (llama.cpp build b12359) en un Apple M3 Pro (Metal), temperatura 0. La columna `base` corresponde a ArmorOCR en precision completa segun el paper.

| Categoria | Sub-tipo | base | Q8_0 | Q4_K_M |
|---|---|---|---|---|
| Manipulacion espacial | Texto rotado | 54,3 | 57,1 | 54,3 |
| | Texto espejado | 46,7 | 46,7 | 40,0 |
| | Texto diminuto | 57,1 | 62,9 | 57,1 |
| Variacion de glifos | Texto estilizado | 26,7 | 26,7 | 23,3 |
| | Texto manuscrito | 46,7 | 53,3 | 53,3 |
| Degradacion de imagen | Artefactos de captura | 43,3 | 43,3 | 43,3 |
| | Post-procesado | 60,0 | 63,3 | 63,3 |
| Mezcla contextual | Bajo contraste | 42,9 | 51,4 | 51,4 |
| | Fusion AIGC | 82,9 | 82,9 | 80,0 |
| | Superposicion de patrones | 66,7 | 63,3 | 63,3 |
| Codificacion visual | Codificacion simbolica | 68,6 | 68,6 | 68,6 |
| | Codificacion de puntos | 63,3 | 63,3 | 63,3 |
| | Codificacion de lineas | 54,3 | 54,3 | 57,1 |
| **Accuracy media** | | **57,1** | **58,9** | **57,3** |
| **IoU media** | | **63,2** | **64,2** | **61,7** |

## Requisitos de hardware

- VRAM estimada: el repo GGUF ocupa 15,1 GB en total (incluye ambos tiers y los mmproj). El tier Q8_0 requiere aproximadamente el tamano de los pesos de 8,19 mil millones de parametros en 8 bits (del orden de 8-9 GB) mas el proyector de vision y el contexto; el tier Q4_K_M reduce esa cifra aproximadamente a la mitad (del orden de 4-5 GB) mas mmproj y contexto.
- GPU recomendadas: no se especifican en la informacion proporcionada. La evaluacion oficial se realizo en un Apple M3 Pro con backend Metal, lo que confirma viabilidad en hardware de consumo de gama alta.
- Viabilidad en GPU consumer: si, especialmente el tier Q4_K_M, que cabe en GPUs con 8-12 GB de VRAM; el tier Q8_0 requiere previsiblemente 12-16 GB.
- Opciones de despliegue: llama.cpp (`llama-server` con `--mmproj`), con API compatible con OpenAI. El script `serve_gguf.sh` incluido en el repo facilita el arranque. No se mencionan vLLM, TGI ni Ollama en la informacion disponible.
- Latencia y throughput: no disponibles. La evaluacion usa `temperature: 0.0` y `max_tokens: 1024` con timeout de 600 s en el ejemplo de cliente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| ArmorOCR-GGUF | 8,19 B | no disponible | OCR adversarial con grounding sobre Qwen3-VL-8B | Apache 2.0 | GGUF (Q8_0, Q4_K_M) |
| Qwen3-VL-8B-Instruct | 8 B (aprox.) | no disponible | Vision-language general | licencia Qwen | safetensors y otras |
| ArmorOCR (base) | 8,19 B | no disponible | OCR adversarial con grounding | Apache 2.0 | safetensors |

La comparativa con OCR especializados alternativos (PaddleOCR, GOT-OCR, dots.ocr, entre otros) no esta disponible en la informacion proporcionada. El modelo base Qwen3-VL-8B-Instruct es el referente directo por herencia arquitectonica, pero no se aportan cifras comparativas de benchmarks frente a el.

## Limitaciones y advertencias

- El rendimiento en texto estilizado es bajo (26,7 de accuracy en todos los tiers), lo que limita su uso en tipografias decorativas o disenos graficos complejos.
- El texto espejado tambien presenta resultados modestos (46,7 en Q8_0, 40,0 en Q4_K_M), con degradacion notable en la cuantizacion mas agresiva.
- La cuantizacion Q4_K_M reduce la accuracy media solo 1,6 puntos respecto a Q8_0 (57,3 frente a 58,9), pero pierde 6,7 puntos en texto espejado y 2,9 en fusion AIGC; conviene validar el tier elegido en el dominio de produccion.
- Solo soporta ingles y chino; no hay soporte declarado de castellano ni de otros idiomas.
- La longitud de contexto no se especifica en la informacion disponible, lo que impide planificar cargas de documentos de gran tamano con garantias.
- Riesgo de alucinacion inherente a los modelos vision-language generativos: el texto reconocido puede no corresponder literalmente al contenido de la imagen, especialmente en condiciones adversarias.
- La licencia Apache 2.0 esta supeditada adicionalmente a la licencia y politica de uso aceptable de Qwen/Qwen3-VL-8B-Instruct; es necesario revisar ambas antes de un uso comercial.
- No se han publicado datos sobre sesgos demograficos, linguisticos o culturales en la informacion disponible.
- El ejemplo de inferencia usa `temperature: 0.0` y timeout de 600 s, lo que sugiere latencias potencialmente altas en hardware de consumo.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/inclusionAI/ArmorOCR-GGUF
- Modelo base en Hugging Face: https://huggingface.co/inclusionAI/ArmorOCR
- Repositorio de codigo: https://github.com/ant-research/ArmorOCR
- Paper (arXiv): https://arxiv.org/abs/2608.20122
- Dataset AdvSpot publico: https://huggingface.co/datasets/inclusionAI/advspot-public
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Modelo base Qwen3-VL-8B-Instruct: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
