# mradermacher/sarvam-1-hindi-marathi-GGUF

## Resumen

Esta ficha corresponde a la versión cuantizada en formato GGUF del modelo *sarvam-1-hindi-marathi*, un modelo de traducción automática centrado en hindi y marathi, publicado por el usuario vennyvirtuoso y cuantizado por mradermacher, un cuantizador muy conocido en la comunidad de Hugging Face que genera versiones GGUF estáticas de modelos populares para su uso en CPU y GPUs de consumo. El modelo base parte de la arquitectura Sarvam-1, desarrollada originalmente por Sarvam AI para lenguas indicas, y parece haber sido afinado específicamente para la tarea de traducción entre hindi y marathi.

Con 2.525 millones de parámetros, se trata de un modelo compacto que resuelve un problema concreto: la traducción de alta calidad entre dos lenguas indicas que suelen estar poco representadas en los modelos generalistas. Su relevancia radica en la combinación de un dominio lingüístico especializado (lenguas índicas) con un formato de despliegue ligero (GGUF), lo que permite ejecutarlo localmente en hardware modesto, algo poco habitual en modelos de traducción para estas lenguas. La licencia Apache 2.0 permite su uso comercial sin restricciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Sarvam-1, detalles no disponibles) |
| Parámetros totales | 2.525.087.744 (≈2,53 B) |
| Parametros activos | no disponible (no se indica si es MoE; todo apunta a modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | hindi (hi), marathi (mr) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuants estáticos); modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base, *vennyvirtuoso/sarvam-1-hindi-marathi*, deriva de Sarvam-1, un modelo lingüístico de Sarvam AI basado en arquitectura transformer y optimizado para lenguas indicas. La versión aquí documentada es una cuantización estática en GGUF realizada por mradermacher a partir de ese modelo afinado, no un entrenamiento nuevo. No se dispone de información sobre el dataset de afinado, el número de tokens de entrenamiento ni el uso de técnicas como RLHF o DPO.

La cuantización emplea los esquemas K-quants e I-quants de llama.cpp, que reducen el tamaño del modelo desde los 5,2 GB en f16 hasta 1,1 GB en Q2_K, con pérdidas de calidad progresivas a medida que baja el número de bits por peso (bpw). Según el propio cuantizador, no hay previstos cuants weighted/imatrix para este modelo en el momento de publicación, aunque pueden solicitarse mediante una Community Discussion.

## Capacidades

- Traducción automática entre hindi y marathi, su tarea principal según el pipeline y las etiquetas del repositorio.
- Generación de texto conversacional (etiquetado como *conversational*), probablemente heredada del modelo base Sarvam-1.
- Comprensión y generación en hindi y marathi, dos lenguas índicas con escritura devanagari.
- No se dispone de información sobre soporte de tool calling, capacidades de agente, razonamiento multi-paso, visión o audio; no está diseñado para esas tareas.

## Casos de uso

- Traducción hindi-marathi en local: ejecución offline en CPU o GPU de consumo para traducir documentos, correos o contenido web entre ambas lenguas, sin depender de APIs externas.
- Localización de aplicaciones y webs: integración en pipelines de localización para adaptar interfaces y contenido al mercado de Maharashtra (marathi) partiendo de material en hindi.
- Procesamiento de contenido editorial en lenguas índicas: traducción de artículos, resúmenes de noticias o material educativo entre hindi y marathi en flujos de trabajo automatizados.
- Asistentes conversacionales bilingües: dado el etiquetado *conversational*, puede integrarse en chatbots sencillos orientados a usuarios de hindi y marathi en dispositivos con recursos limitados.
- Anotación y aumento de datos: generación de pares paralelos hindi-marathi para entrenar o evaluar otros sistemas de traducción.
- Investigación en NLP para lenguas índicas: base ligera y de licencia permisiva para experimentos académicos sobre traducción y transferencia entre lenguas índicas, ejecutable en portátiles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: desde ~1,1 GB (Q2_K) hasta ~2,8 GB (Q8_0) o ~5,2 GB (f16), más margen para el KV cache y el contexto.
- Cabe cómodamente en GPUs de consumo: cualquier GPU con 4 GB de VRAM (GTX 1650, RTX 3050, RTX 3060) ejecuta incluso el Q8_0; en CPU con 8 GB de RAM es viable con cuants de 3-4 bits.
- GPU recomendadas: al ser un modelo de ~2,5 B de parámetros, no se requieren A100 ni H100; una RTX 3060 o superior ofrece latencias muy bajas, y también funciona bien en CPU moderna.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp y cualquier runtime compatible con GGUF. No es un formato nativo para vLLM o TGI (que requieren safetensors; para ello usar el modelo base).
- Latencia y throughput: no disponibles; dada la talla del modelo, se espera generación rápida incluso en hardware modesto.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| sarvam-1-hindi-marathi (este) | 2,53 B | hi, mr | no disponible | Apache 2.0 | GGUF, safetensors |
| Sarvam-1 (base original) | 2 B | 10 lenguas índicas | no disponible | Apache 2.0 | safetensors |
| Airavata | 7 B | hi, inglés | no disponible | Apache 2.0 | safetensors |
| NLLB-200-distilled-600M | 600 M | 200 lenguas (incl. hi, mr) | no disponible | CC-BY-NC 4.0 | safetensors |

Frente a NLLB-200, este modelo es mayor y de licencia más permisiva, pero cubre solo dos lenguas. Frente a Sarvam-1 base, ofrece un afinado específico para el par hindi-marathi y disponibilidad en GGUF para despliegue local.

## Limitaciones y advertencias

- Alcance lingüístico muy limitado: solo hindi y marathi; no es adecuado para otros idiomas ni para español o inglés.
- No hay datos de evaluación publicados (BLEU, COMET, benchmarks), por lo que la calidad real de la traducción debe validarse con datos propios antes de uso en producción.
- Riesgo de alucinación típico de modelos de lenguaje: puede generar contenido no fiel al texto de entrada, especialmente con cuants agresivos (Q2_K, Q3_K).
- La calidad de las cuantizaciones bajas se degrada de forma notable; se recomiendan Q4_K_M o superiores para uso serio.
- No hay cuants weighted/imatrix disponibles, lo que podría mejorar la calidad a igual tamaño.
- Longitud de contexto no documentada: conviene verificarla empíricamente antes de procesar textos largos.
- Licencia Apache 2.0 sin restricciones comerciales, pero conviene revisar también la model card del modelo base para condiciones adicionales.

## Enlaces

- Repositorio GGUF cuantizado: https://huggingface.co/mradermacher/sarvam-1-hindi-marathi-GGUF
- Modelo base: https://huggingface.co/vennyvirtuoso/sarvam-1-hindi-marathi
- Página de descargas de mradermacher: https://hf.tst.eu/model#sarvam-1-hindi-marathi-GGUF
- Solicitudes de cuantización (FAQ): https://huggingface.co/mradermacher/model_requests
- Notas sobre cuants de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH: https://www.nethype.de/
