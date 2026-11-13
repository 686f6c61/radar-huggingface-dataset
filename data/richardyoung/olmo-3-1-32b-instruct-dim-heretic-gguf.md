# richardyoung/Olmo-3.1-32B-Instruct-DiM-heretic-GGUF

## Resumen

Olmo-3.1-32B-Instruct-DiM-heretic GGUF es una compilación en formato GGUF del modelo `richardyoung/Olmo-3.1-32B-Instruct-DiM-heretic`, que a su vez es una versión "abliterada" (con la conducta de rechazo eliminada) del modelo `allenai/Olmo-3.1-32B-Instruct` de AI2. La abliteración se realizó con Heretic 2.0 mediante ablación de la dirección de rechazo por diferencia de medias (difference-in-means, DiM), con los hiperparámetros ajustados por la búsqueda automática de Heretic. El autor, Richard J. Young, publica estos ficheros como material de investigación sobre eliminación de rechazos y su evaluación, no como asistente de propósito general.

El modelo tiene 32.233.522.176 parámetros (aproximadamente 32,2 mil millones) y se distribuye en cuantizaciones GGUF para su uso con llama.cpp y Ollama. El repositorio ocupa 19,5 GB y la cuantización por defecto es Q4_K_M, que es la que Ollama sirve con la etiqueta `latest`. Está etiquetado únicamente para inglés y con licencia Apache 2.0.

Su relevancia es doble: por un lado, ofrece una versión de Olmo 3.1 de 32B ejecutable en hardware de consumo mediante cuantización; por otro, sirve como artefacto de estudio para medir cuánto resiste la alineación de un modelo open weight frente a técnicas de ablación de direcciones, un tema central en el debate sobre seguridad de modelos abiertos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: allenai/Olmo-3.1-32B-Instruct; la model card no detalla la arquitectura interna) |
| Parametros totales | 32.233.522.176 |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (19,5 GB, por defecto); IQ3_M, IQ4_XS, Q5_K_M, Q6_K y Q8_0 anunciadas como "en preparacion"; incluye fichero de matriz de importancia (imatrix, 30 MB) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (generado desde safetensors bf16 con llama.cpp, commit `468fde9`) |

## Arquitectura y entrenamiento

La model card de esta compilación GGUF no describe la arquitectura interna del modelo base; únicamente indica que deriva de `allenai/Olmo-3.1-32B-Instruct` a través de una versión intermedia abliterada. El dato verificable es el recuento de parámetros (32.233.522.176) y el hecho de que los pesos originales se publicaron en safetensors en bf16 (revision `6e270d1c2887`), con verificación SHA-256 de cada fichero antes de la conversión.

El proceso de modificación es una ablación de la dirección de rechazo por diferencia de medias (DiM) aplicada con Heretic 2.0, con búsqueda de 100 trials. La regla de selección fue minimizar los rechazos por palabra clave en el conjunto de desarrollo sujeto a una divergencia KL de primer token respecto al original menor o igual a 0,1; el trial seleccionado obtuvo 88 rechazos por palabra clave sobre los 100 prompts de ajuste y una KL de primer token de 0,089. La conversión a GGUF se hizo con `convert_hf_to_gguf.py --outtype bf16` y posterior `llama-quantize` en CPU; las cuantizaciones IQ3_M, IQ4_XS, Q4_K_M y Q5_K_M usan la matriz de importancia (calibration_datav3, 128 fragmentos de 512 tokens, calculada sobre la build Q8_0), mientras que Q6_K y Q8_0 son estáticas. Cada fichero Q4_K_M se cargó y respondió a un prompt de prueba antes de subirse.

## Capacidades

- Generación de texto conversacional en inglés, heredada de Olmo-3.1-32B-Instruct.
- Cumplimiento de solicitudes que el modelo original rechaza: según la model card, la versión completa en bf16 responde a muchas peticiones que el original declina (tasa de rechazo del 68,3 % frente al 84,1 % del original sobre 972 prompts dañinos reservados, juez WildGuard).
- Instrucciones y formato de chat: el modelo base es una variante Instruct, por lo que conserva el formato de conversación multi-turno.
- Ejecución local mediante llama.cpp y Ollama, incluida la descarga directa desde Hugging Face (`ollama run hf.co/...`).
- Capacidades de tool calling, agentes, razonamiento multi-paso, visión o audio: no disponible (no se documentan en la información proporcionada).
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma del repositorio.

## Casos de uso

- Investigación sobre abliteración: el modelo sirve como sujeto de estudio para medir la eficacia de la eliminación de rechazos y comparar resultados entre la versión bf16 y las cuantizaciones GGUF, que según el autor pueden alterar el comportamiento de rechazo.
- Evaluación de defensas frente a la eliminación de alineación: permite construir conjuntos de prompts y medir la tasa de cumplimiento antes y después de técnicas de mitigación, usando la métrica de rechazo con juez WildGuard como referencia.
- Estudio de degradación por cuantización: al publicarse varias tallas (Q4_K_M, Q5_K_M, Q6_K, Q8_0), permite comparar la divergencia KL de primer token y la tasa de rechazo entre precisiones.
- Despliegue local en estaciones de trabajo: con 19,5 GB en Q4_K_M, el modelo puede ejecutarse en una GPU de consumo de gama alta o en CPU con suficiente RAM, útil para experimentos que requieran un modelo de 32B sin depender de servicios en la nube.
- Reproducibilidad de experimentos: los SHA-256 de los pesos originales y del repositorio permiten verificar que una ejecución parte exactamente del artefacto publicado.
- Docencia y divulgación sobre seguridad de modelos abiertos: el modelo y su paper asociado permiten ilustrar de forma práctica qué es una dirección de rechazo y cómo se mide su ablación.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible corresponden al modelo completo en bf16, no a los ficheros GGUF de este repositorio:

| Metrica | Original | Este modelo (bf16) |
|---|---|---|
| Rechazo en 972 prompts dañinos reservados (juez WildGuard) | 84,1 % | 68,3 % (664/972) |
| Rechazos por palabra clave en los 100 prompts de ajuste (trial seleccionado) | no disponible | 88 |
| Divergencia KL de primer token respecto al original (trial seleccionado) | no disponible | 0,089 |

No se han publicado resultados de benchmarks de conocimiento o razonamiento (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni evaluaciones de las cuantizaciones GGUF.

## Requisitos de hardware

- VRAM estimada para Q4_K_M: aproximadamente 19,5 GB solo para los pesos, más overhead de contexto y caché KV; en la práctica conviene contar con 22-24 GB o más según la longitud de contexto.
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 para Q4_K_M con contexto moderado; A100 40/80 GB, H100 o L40S para cuantizaciones mayores (Q6_K, Q8_0) o contextos largos.
- GPU de consumo: Q4_K_M encaja en tarjetas de 24 GB; las cuantizaciones Q8_0 y superiores probablemente requieran más de 32 GB de VRAM o descarga parcial a CPU.
- Despliegue: llama.cpp (`llama-cli -hf ...`) y Ollama (`ollama run hf.co/...`) son los soportados explícitamente; vLLM, TGI u otros motores no se mencionan en la información disponible.
- Latencia y throughput: no disponible (no se publican mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (Olmo-3.1-32B-Instruct-DiM-heretic GGUF) | 32,2 B | no disponible | Apache 2.0 | GGUF | Abliterado con Heretic 2.0; rechazo del 68,3 % en bf16 |
| allenai/Olmo-3.1-32B-Instruct | 32,2 B (aproximado) | no disponible | Apache 2.0 | safetensors | Modelo original sin modificar; rechazo del 84,1 % |
| richardyoung/Olmo-3.1-32B-Instruct-DiM-heretic | 32,2 B | no disponible | Apache 2.0 | safetensors (bf16) | Versión intermedia abliterada, evaluada en el paper |

No se dispone de datos en la información proporcionada para comparar con otros modelos abliterados de la misma categoría (Qwen3.8, Gemma 4 o Mistral Small 3.2), aunque el paper citado los evalúa con la misma metodología.

## Limitaciones y advertencias

- El autor declara explícitamente que el modelo se publica para investigación sobre abliteración y su evaluación, no como asistente de propósito general.
- La eliminación de rechazos implica que el modelo cumple solicitudes que el original declina; el uso indebido es responsabilidad del usuario y debe ajustarse a la legalidad aplicable.
- Las cuantizaciones GGUF no fueron evaluadas en el paper y, según el propio autor, la cuantización puede cambiar el comportamiento de rechazo, por lo que las métricas del modelo bf16 no son trasladables directamente a Q4_K_M u otras tallas.
- Idiomas: solo inglés; no se garantiza un rendimiento adecuado en castellano u otras lenguas.
- Riesgo de alucinación: no cuantificado en la información disponible; es un riesgo inherente a los modelos de lenguaje de 32B sin datos específicos de evaluación.
- Sesgos: no se documentan análisis de sesgo en la información proporcionada.
- Longitud de contexto: no disponible, lo que impide planificar despliegues con ventanas largas sin verificar previamente en el modelo base.
- Licencia Apache 2.0 permite uso comercial, pero las restricciones de uso del modelo fuente deben consultarse en su model card; el autor remite a ella.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y las cuantizaciones IQ3_M, IQ4_XS, Q5_K_M, Q6_K y Q8_0 estaban anunciadas pero no necesariamente publicadas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/richardyoung/Olmo-3.1-32B-Instruct-DiM-heretic-GGUF
- Modelo base abliterado (safetensors): https://huggingface.co/richardyoung/Olmo-3.1-32B-Instruct-DiM-heretic
- Modelo original de AI2: https://huggingface.co/allenai/Olmo-3.1-32B-Instruct
- Paper citado: Richard J. Young, "Is Abliteration Getting Harder? Refusal Removal from Open-Weight LLMs with Heretic on Qwen3.8, Gemma 4, Olmo 3.1 and Mistral Small 3.2 Versus Their Predecessors" (2026), arXiv pendiente de enlace según la model card.
- llama.cpp (herramienta de conversión y cuantización): no se proporciona URL en la información disponible.
