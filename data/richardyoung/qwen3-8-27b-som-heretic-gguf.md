# richardyoung/Qwen3.8-27B-SOM-heretic-GGUF

## Resumen

Qwen3.8-27B-SOM-heretic-GGUF es una compilación en formato GGUF del modelo richardyoung/Qwen3.8-27B-SOM-heretic, una versión "abliterada" (con los mecanismos de rechazo eliminados) del modelo Qwen/Qwen3.8-27B de Alibaba. La ablación se realizó con Heretic 2.0, una técnica de sustracción multidireccional basada en mapas autoorganizados (SOM, *self-organising maps*) desarrollada por el propio autor, Richard J. Young, en el marco de un estudio sobre la dificultad creciente de eliminar los comportamientos de rechazo en modelos de pesos abiertos.

El modelo cuenta con 26.895.998.464 parámetros (aproximadamente 26,9 mil millones) y se distribuye exclusivamente en cuantizaciones GGUF para su uso con llama.cpp y Ollama. El repositorio ocupa 45,2 GB e incluye las variantes Q4_K_M (16,5 GB, predeterminada), Q8_0 (28,6 GB) y una matriz de importancia (imatrix) de 27 MB; el autor anuncia la incorporación progresiva de IQ3_M, IQ4_XS, Q5_K_M y Q6_K.

Su relevancia es fundamentalmente de investigación: no está pensado como asistente de propósito general, sino como objeto de estudio para medir la eficacia de las técnicas de eliminación de rechazo y el desarrollo de defensas frente a ellas. El modelo base original acepta imágenes, pero esta compilación GGUF es solo texto porque no incluye el proyector de visión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.8-27B; no se detalla en la informacion proporcionada) |
| Parametros totales | 26.895.998.464 (~26,9 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M, Q8_0; anunciadas IQ3_M, IQ4_XS, Q5_K_M, Q6_K; imatrix (calibration_datav3, 128 chunks de 512 tokens) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); safetensors en el modelo base |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde al modelo Qwen3.8-27B, del que no se detallan en la información disponible ni el tipo de transformer, ni el número de tokens de entrenamiento, ni la composición del dataset. La innovación técnica de esta variante no reside en el preentrenamiento, sino en el postprocesado: se aplica una ablación multidireccional mediante mapas autoorganizados (SOM) con Heretic 2.0, que identifica y sustrae direcciones del espacio de activaciones asociadas al comportamiento de rechazo.

El proceso de selección consistió en una búsqueda de 100 ensayos con la regla de elegir el menor número de rechazos por palabra clave en el conjunto de desarrollo, sujeto a una divergencia KL de primer token respecto al original menor o igual a 0,1. El ensayo seleccionado produjo 27 rechazos por palabra clave sobre los 100 prompts de ajuste y una divergencia KL de 0,084. Los archivos GGUF se generaron a partir de los safetensors publicados (revisión `54a76517d6d8`, con verificación SHA-256 de cada archivo de pesos) usando llama.cpp (commit `468fde9`): conversión con `convert_hf_to_gguf.py --outtype bf16` y cuantización con `llama-quantize` en CPU. Cada archivo Q4_K_M se cargó y respondió a un prompt de prueba antes de la subida.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo Qwen3.8-27B subyacente.
- Cumplimiento de numerosas solicitudes que el modelo original rechaza, como consecuencia directa de la ablación de rechazo.
- Procesamiento solo de texto: el proyector de visión del modelo base no está incluido en esta compilación GGUF.
- Ejecución local mediante llama.cpp y Ollama, con soporte de etiquetas por cuantización.
- Uso como objeto de estudio para medir la eficacia de la eliminación de rechazo y evaluar defensas.
- No se documentan en la información disponible capacidades de *tool calling*, razonamiento multi-paso, agentes ni modo de pensamiento específicas de esta variante.

## Casos de uso

- Investigación sobre abliteración: el modelo sirve como sujeto de prueba para replicar y extender el estudio de Young sobre eliminación de rechazo, midiendo tasas de cumplimiento con jueces automáticos como WildGuard.
- Evaluación de defensas frente a la ablación: permite entrenar y validar clasificadores o filtros de seguridad que detecten respuestas dañinas en modelos con los rechazos eliminados.
- Análisis de calibración y divergencia: los valores de divergencia KL de primer token (0,084) y de rechazos por palabra clave (27 de 100) permiten estudiar el compromiso entre eliminación de rechazo y preservación de capacidades.
- Estudio del efecto de la cuantización: al ofrecerse varias cuantizaciones (Q4_K_M, Q8_0 y próximamente IQ3_M, IQ4_XS, Q5_K_M, Q6_K), el modelo permite comparar cómo la cuantización altera el comportamiento de rechazo, algo que el autor advierte explícitamente.
- Despliegue local de referencia en llama.cpp u Ollama: con Q4_K_M (16,5 GB) puede ejecutarse en estaciones de trabajo con GPU de consumo para experimentos reproducibles sin depender de servicios en la nube.
- Docencia y formación en seguridad de LLM: sirve para ilustrar de forma práctica qué es la abliteración, cómo se mide y por qué la eliminación de rechazo no equivale a eliminar el conocimiento subyacente.

## Benchmarks y rendimiento

Resultados publicados para el modelo en precisión completa (bf16), según la model card y el paper asociado:

| Metrica | Original | Este modelo |
|---|---|---|
| Rechazo en 972 prompts dañinos reservados (juez WildGuard) | 89,9% | 38,0% (369/972) |
| Rechazos por palabra clave en los 100 prompts de ajuste (ensayo seleccionado) | no disponible | 27 |
| Divergencia KL de primer token respecto al original (ensayo seleccionado) | no disponible | 0,084 |

El autor indica que estos números describen el modelo en bf16 y que los archivos cuantizados aquí publicados no fueron evaluados en el paper. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 16,5 GB para Q4_K_M y 28,6 GB para Q8_0, más el *overhead* de contexto y de la caché KV.
- GPU recomendadas: no especificadas en la información disponible; por tamaño, Q8_0 requiere GPU de 40-48 GB (A100 40GB, A6000, L40S) o superiores, mientras que Q4_K_M encaja en GPU de 24 GB.
- GPU de consumo: Q4_K_M cabe en tarjetas de 24 GB (RTX 3090, RTX 4090); Q8_0 no cabe en GPU de consumo de 24 GB y requeriría descarga parcial a CPU.
- Opciones de despliegue: llama.cpp (`llama-cli -hf ...`), Ollama (`ollama run richardyoung/qwen3.8-27b-som-heretic`), y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.
- Nota: la cuantización se realizó en CPU con llama.cpp; no se documentan requisitos mínimos de RAM para la conversión.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazo (WildGuard) | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-27B-SOM-heretic-GGUF (este) | ~26,9 mil M | no disponible | 38,0% (bf16) | apache-2.0 | GGUF |
| Qwen/Qwen3.8-27B (original) | ~26,9 mil M | no disponible | 89,9% | no disponible en la informacion | safetensors |
| richardyoung/Qwen3.8-27B-SOM-heretic (bf16) | ~26,9 mil M | no disponible | 38,0% | apache-2.0 | safetensors |

No se dispone en la información proporcionada de datos sobre otros modelos abliterados comparables (Gemma 4, Olmo 3.1, Mistral Small 3.2) más allá de su mención en el título del estudio; sus cifras no se detallan.

## Limitaciones y advertencias

- El modelo elimina deliberadamente los mecanismos de rechazo: cumple muchas solicitudes que el original rechaza, lo que lo hace inadecuado como asistente de propósito general y potencialmente peligroso en producción.
- La cuantización puede alterar el comportamiento de rechazo; los archivos GGUF no fueron evaluados en el paper, por lo que las cifras de 38,0% de rechazo corresponden solo al modelo bf16.
- Solo soporta inglés según la model card.
- Solo texto: no incluye el proyector de visión del modelo base, aunque este acepte imágenes.
- Riesgo de alucinación: no cuantificado en la información disponible; es un riesgo inherente a los modelos de lenguaje.
- Sesgos: no documentados en la información proporcionada.
- Licencia apache-2.0, con las mismas restricciones de uso que el modelo fuente; el autor declara que está destinado a investigación sobre eliminación de rechazo y que los usuarios son responsables de un uso lícito. No se detallan restricciones adicionales de uso comercial más allá de la licencia.
- Longitud de contexto no disponible, lo que impide planificar despliegues con ventanas largas sin verificación previa.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria adicional.

## Enlaces

- Repositorio GGUF: https://huggingface.co/richardyoung/Qwen3.8-27B-SOM-heretic-GGUF
- Modelo base (bf16, abliterado): https://huggingface.co/richardyoung/Qwen3.8-27B-SOM-heretic
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Paper asociado: Richard J. Young, *Is Abliteration Getting Harder? Refusal Removal from Open-Weight LLMs with Heretic on Qwen3.8, Gemma 4, Olmo 3.1 and Mistral Small 3.2 Versus Their Predecessors* (2026); enlace arXiv pendiente de publicar según la model card.
