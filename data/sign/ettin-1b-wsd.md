# sign/Ettin-1B-WSD

## Resumen

Ettin-1B-WSD es un modelo de desambiguación de sentidos de palabras (WSD) desarrollado por el usuario sign en HuggingFace, basado en el encoder ModernBERT `jhu-clsp/ettin-encoder-1b` con 1.031.493.248 parámetros. Se ha afinado para abordar la WSD como un problema de elección múltiple sobre definiciones del léxico WordNet (omw-en:1.4), usando un slot de respuesta de lenguaje enmascarado (masked-LM) con un decodificador de letras de 128 vías. Resuelve la ambigüedad léxica en inglés, un problema clásico en PLN que sigue siendo relevante para sistemas de búsqueda, traducción y anotación semántica. Su relevancia actual radica en que es el miembro más preciso de la familia Ettin-WSD y sirve como profesor de destilación para el modelo `sign/Ettin-150m-WSD`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder ModernBERT (28 capas, hidden 1792) |
| Parametros totales | 1.031.493.248 (~1,03B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (pesos almacenados en bf16); entrenamiento con fp32 y autocast bf16 |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre `jhu-clsp/ettin-encoder-1b`, un encoder ModernBERT de arquitectura densa, con 28 capas y dimensión oculta de 1792. No es un modelo generativo ni un MoE: es un encoder de contexto bidireccional, lo que lo hace adecuado para tareas de clasificación y comprensión. La innovación técnica principal consiste en reformular la desambiguación de sentidos como una tarea de elección múltiple: cada palabra ambigua recibe una lista de definiciones de WordNet y el modelo debe rellenar un slot enmascarado con la letra de la respuesta correcta. Para ello se añade un decodificador de 128 vías sobre las salidas del encoder (`WSDModernBertForMaskedLM` en el repositorio `sign/word-sense-disambiguation`).

El fine-tuning se realizó el 2026-09-07 sobre datos generados para 97k synsets, ejemplos propios de WordNet (excluyendo un slice held-out de 5.000 ejemplos), SemCor (222k instancias detokenizadas) y el Princeton WordNet Gloss Corpus con etiquetado manual. Se empleó un programador de learning rate coseno, label smoothing 0,1, weight decay 0,01, learning rate 2e-5, 2 épocas, batch de 32 con 2 pasos de acumulación. Los pesos finales se almacenan en bf16.

## Capacidades

- Desambiguación de sentidos de palabras en inglés mediante selección múltiple entre definiciones de WordNet (omw-en:1.4).
- Resolución de un slot enmascarado con un decodificador de letras de 128 vías, heredado de un prompt compacto compartido con `sign/Ettin-150m-WSD` y `sign/ModernBERT-Large-Instruct-WSD`.
- Funciona como encoder, por lo que no genera texto libre ni es adecuado para tareas de chat o completado de texto.
- Es monolingüe: solo está entrenado para contenido en inglés.
- No soporta tool calling, function calling ni razonamiento multi-step nativo.
- Puede integrarse en pipelines de PLN existentes que requieran anotación de sentidos léxicos.

## Casos de uso

- Anotación automática de corpus lingüísticos: el modelo puede desambiguar cada palabra polisémica en un texto y asignar su synset de WordNet, generando datasets de entrenamiento para otras tareas de PLN.
- Mejora de sistemas de búsqueda semántica: al resolver la ambigüedad de términos en consultas, permite indexar documentos por sentidos en lugar de por strings, aumentando la precisión.
- Preprocesamiento para traducción automática: seleccionar el sentido correcto de una palabra antes de la traducción reduce errores en sistemas basados en reglas o en lenguajes con alta polisemia.
- Enriquecimiento de ontologías y wordnets: ayuda a detectar nuevas apariciones de synsets en textos y a actualizar bases de conocimiento léxico.
- Sistemas de respuesta a preguntas: desambiguar términos en preguntas y pasajes mejora la recuperación de información relevante y evita falsos positivos.
- Análisis de textos técnicos o científicos: en dominios donde una palabra tiene varios significados (por ejemplo, "cell", "memory"), permite filtrar y clasificar documentos por sentido específico.

## Benchmarks y rendimiento

| Benchmark | ModernBERT-Large-Instruct-WSD (c3, 395M) | Ettin-1B-WSD (1B) |
|---|---|---|
| WordNet held-out slice (5.000 ejemplos, seed 42) | 78,3% | 80,3% |
| SemEval "ALL" (Senseval-2/3, SemEval-07/13/15; 7.247 instancias, cualquier gold key) | 80,6% | 81,4% |
| Coste forward relativo | 1,0 | 3,1 |

No se han publicado otros benchmarks oficiales en la información disponible. Según la model card, el modelo también actúa como profesor de destilación de `sign/Ettin-150m-WSD`, y como segunda etapa de una cascada de confianza tras el 150m (escalando el 9% de prompts menos confiables) alcanza un 81,0% con un coste de 0,72x el del modelo Large.

## Requisitos de hardware

- VRAM estimada para inferencia con pesos en bf16: aproximadamente 2 GB solo para los pesos; con activaciones y overhead se recomienda un mínimo de 4–6 GB de VRAM.
- GPU recomendadas: una RTX 3060 de 12 GB, RTX 4090 o superiores son suficientes para uso local; para lotes grandes o inferencia en producción son adecuadas A100/H100.
- Cabe en GPUs de consumo de gama media-alta, siempre que se use el formato de pesos en bf16 o una cuantización de 8 bits.
- Opciones de despliegue: Transformers (PyTorch) con el código personalizado del repositorio `sign/word-sense-disambiguation`; no se ha documentado soporte oficial en vLLM, llama.cpp u Ollama.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Longitud de contexto | Rendimiento (WordNet held-out) | Rendimiento (SemEval ALL) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Ettin-1B-WSD | 1.031.493.248 | no disponible | 80,3% | 81,4% | Apache 2.0 | HuggingFace |
| ModernBERT-Large-Instruct-WSD (c3) | 395M | no disponible | 78,3% | 80,6% | no disponible | HuggingFace |
| Ettin-150m-WSD | 150M | no disponible | no disponible | no disponible | no disponible | HuggingFace |

La model card indica que Ettin-1B-WSD es el profesor de destilación de Ettin-150m-WSD, pero no se aportan métricas de este último en la información disponible. Los tres modelos comparten plantilla de prompt, aunque solo se confirma la licencia Apache 2.0 para Ettin-1B-WSD.

## Limitaciones y advertencias

- Modelo monolingüe: solo soporta inglés, por lo que no es aplicable a texto en castellano u otros idiomas sin un fine-tuning adicional.
- No es un modelo generativo: no puede producir respuestas en lenguaje natural ni mantener conversaciones.
- Depende del léxico WordNet (omw-en:1.4), lo que limita su cobertura a los synsets incluidos en esa versión; palabras fuera del vocabulario o sentidos no listados no serán desambiguados correctamente.
- No se han documentado evaluaciones de sesgos ni análisis de equidad en la información disponible; es posible que herede sesgos del corpus SemCor y de los datos sintéticos de entrenamiento.
- Los pesos en bf16 requieren hardware compatible con bfloat16; en GPUs antiguas puede perder precisión o no ejecutarse.
- El contexto de entrada no está especificado en la documentación pública del modelo, lo que impide conocer la ventana máxima de tokens para prompts largos.

## Enlaces

- https://huggingface.co/sign/Ettin-1B-WSD
- https://github.com/sign/word-sense-disambiguation
- https://huggingface.co/blog/ettin
