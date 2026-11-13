# mdmcelhaney/Qwen3.5-4B-Uncensored-HauhauCS-Aggressive

## Resumen

Qwen3.5-4B-Uncensored-HauhauCS-Aggressive es una variante sin censura del modelo Qwen3.5-4B de Alibaba Qwen, publicada por el usuario mdmcelhaney (vinculado al proyecto HauhauCS) bajo licencia Apache 2.0. El objetivo declarado es eliminar los rechazos del modelo base sin degradar sus capacidades: el autor afirma 0 rechazos sobre 465 prompts de prueba y "cero perdida de capacidad" respecto al original. Se distribuye principalmente en formato GGUF cuantizado, con un codificador de vision separado (`mmproj`) para entrada multimodal.

El modelo base es un transformer denso de 4.205.751.296 parametros con 32 capas y una arquitectura hibrida que combina atencion lineal Gated DeltaNet con atencion softmax completa en proporcion 3:1. Soporta 262.000 tokens de contexto nativo, extensible a 1 millon mediante YaRN, y es nativamente multimodal (texto, imagen y video). Incluye soporte de multi-token prediction (MTP) y un vocabulario de 248.000 tokens.

Su relevancia radica en dos factores: por un lado, ofrece la arquitectura Qwen3.5 (publicada el 2 de marzo de 2026) en un tamano de 4B apto para hardware de consumo; por otro, la variante "Aggressive" esta pensada para casos donde el modelo base rechaza sistematicamente peticiones legitimas. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el pipeline no esta declarado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso hibrido: Gated DeltaNet (atencion lineal) + atencion softmax completa, ratio 3:1; 32 capas |
| Parametros totales | 4.205.751.296 (4B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.000 tokens nativo; extensible a 1.000.000 con YaRN |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q4_K_M (GGUF); codificador de vision en BF16 |
| Idiomas soportados | Ingles, chino y multilingue; vocabulario de 248.000 tokens con cobertura declarada de 201 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (BF16, Q8_0, Q6_K, Q4_K_M) y `mmproj` BF16 para vision |
| Vocabulario | 248.000 tokens |
| Multimodalidad | Si: texto, imagen y video (requiere archivo `mmproj`) |
| Multi-token prediction | Si (MTP) |
| Tamano del repositorio | 19,8 GB |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.5-4B original: un transformer denso de 32 capas que intercala bloques de atencion lineal Gated DeltaNet con bloques de atencion softmax completa en una proporcion 3:1. Esta hibridacion reduce el coste computacional de la atencion en contextos largos manteniendo la calidad de recuperacion de informacion a larga distancia. El modelo incorpora multi-token prediction (MTP), una tecnica que permite predecir varios tokens por paso y acelera la decodificacion, y un vocabulario de 248.000 tokens orientado a cobertura multilingue amplia.

El autor no documenta el proceso de entrenamiento del modelo base (numero de tokens, composicion del dataset, uso de RLHF o DPO), y tampoco detalla la metodologia exacta empleada para el "uncensoring" mas alla de afirmar que no se modificaron datasets ni capacidades. La variante Aggressive aplica una eliminacion de rechazos mas agresiva que la hipotetica variante Balanced. El autor advierte que el modelo puede anadir ocasionalmente un descargo de responsabilidad breve al final de una respuesta (por ejemplo, "esto es informacion general, no asesoramiento legal"), heredado del entrenamiento del modelo base y no considerado un rechazo.

## Capacidades

- Generacion de texto conversacional multi-turno con contexto de hasta 262.000 tokens nativos.
- Razonamiento en modo thinking (por defecto) y modo no-thinking, con hiperparametros de muestreo distintos recomendados para cada uno.
- Procesamiento multimodal nativo: entrada de imagenes y video mediante el codificador `mmproj` en BF16.
- Capacidades multilingues amplias: vocabulario de 248.000 tokens y cobertura declarada de 201 idiomas, con soporte destacado de ingles y chino.
- Multi-token prediction (MTP) para acelerar la generacion.
- Extension de contexto a 1 millon de tokens mediante YaRN.
- Generacion sin rechazos: el autor reporta 0 rechazos sobre 465 prompts de evaluacion.
- Capacidades de codigo, matematicas y razonamiento heredadas del modelo base (no cuantificadas en la informacion disponible).
- Soporte de tool calling y function calling: no confirmado explicitamente en la model card; se asume herencia del modelo base, pero no esta documentado.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar el comportamiento de un LLM sin filtros de rechazo sobre el mismo esqueleto arquitectonico que el modelo alineado, facilitando comparaciones controladas entre versiones.
- Generacion creativa sin restricciones: escritura de ficcion, guiones o narrativa que aborde temas sensibles (violencia, conflictos morales, contenido adulto) sin que el modelo interrumpa la generacion con negativas.
- Asistencia en dominio legal o medico con material sensible: el modelo responde a consultas sobre temas que el base podria rechazar por precaucion, util en entornos profesionales donde el usuario aporta el juicio critico.
- Procesamiento de documentos largos con imagenes: gracias a los 262.000 tokens de contexto y al codificador de vision, puede analizar informes escaneados, contratos con anexos graficos o transcripciones extensas en una sola pasada.
- Despliegue local en hardware de consumo: la cuantizacion Q4_K_M (2,6 GB) permite ejecutarlo en GPUs con 6-8 GB de VRAM mediante llama.cpp, LM Studio, Jan o koboldcpp, lo que lo hace util para prototipado offline y entornos con requisitos de privacidad.
- Analisis de video e imagen en pipelines de investigacion: con el archivo `mmproj` cargado, puede describir o razonar sobre contenido visual en flujos de etiquetado, moderacion o analisis de medios.
- Evaluacion de jailbreaks y robustez: sirve como referencia de modelo "sin salvaguardas" para medir la eficacia de clasificadores de contenido o sistemas de moderacion externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica aportada por el autor es cualitativa: 0 rechazos sobre 465 prompts de evaluacion. No se proporcionan resultados de MMLU, HumanEval, GSM8K ni comparaciones numericas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - BF16: aproximadamente 8 GB.
  - Q8_0: aproximadamente 4,2 GB.
  - Q6_K: aproximadamente 3,3 GB.
  - Q4_K_M: aproximadamente 2,6 GB.
- Vision: anadir aproximadamente 645 MB del codificador `mmproj` en BF16.
- Contexto largo: los 262.000 tokens de contexto requieren KV cache adicional significativa; con atencion hibrida el coste es menor que en un transformer puro, pero sigue siendo sustancial en contextos de cientos de miles de tokens.
- GPU recomendadas: RTX 3090, RTX 4090 o superiores para BF16 y contextos largos; RTX 3060 (12 GB), RTX 4060 Ti (16 GB) o GPUs con 8 GB o mas para cuantizaciones Q4_K_M y Q6_K.
- Cabe en GPU de consumo: si, en cuantizaciones Q4_K_M, Q6_K y Q8_0 con GPUs de 8-12 GB.
- Opciones de despliegue: llama.cpp, LM Studio, Jan, koboldcpp para GGUF; el autor recomienda vLLM, SGLang o KTransformers para produccion y alto throughput (requiere soporte de la nueva arquitectura, disponible solo en builds recientes).
- Latencia y throughput: no disponibles. El soporte de MTP deberia mejorar el throughput en decodificacion, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Qwen3.5-4B-Uncensored-HauhauCS-Aggressive | 4B densos | 262K (1M con YaRN) | Si (texto, imagen, video) | Apache 2.0 | GGUF | Variante sin censura; 0 descargas |
| Qwen3.5-4B (base) | 4B densos | 262K (1M con YaRN) | Si | Apache 2.0 | safetensors, GGUF | Modelo original con alineacion y rechazos |
| Qwen3.5-9B-Uncensored-HauhauCS-Aggressive | 9B densos | no disponible en la informacion | Si (segun la model card del 4B) | Apache 2.0 | GGUF | Variante mayor del mismo autor; mas VRAM requerida |

No se dispone de datos de benchmarks que permitan comparar rendimiento numerico entre estas variantes. La comparacion se limita a parametros, contexto, licencia y formato.

## Limitaciones y advertencias

- Ausencia total de salvaguardas: el modelo no rechaza peticiones, lo que incluye contenido danino, ilegal o eticamente problematico. No es apto para despliegues publicos sin moderacion externa.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad factual; al ser una variante sin censura de un modelo de 4B, la tasa de alucinacion puede ser igual o superior a la del base.
- Descargos residuales: el autor advierte que el modelo puede anadir ocasionalmente un descargo breve al final de respuestas, heredado del entrenamiento del base; no es un rechazo pero puede requerir post-procesado.
- Contexto: aunque soporta 262K nativos, el autor recomienda mantener al menos 128K para preservar las capacidades de razonamiento en modo thinking; contextos menores pueden degradar el rendimiento.
- Idiomas: la cobertura declarada es amplia (201 idiomas), pero solo ingles y chino estan etiquetados explicitamente; el rendimiento en castellano no esta verificado.
- Arquitectura muy reciente: Qwen3.5 se publico el 2 de marzo de 2026 y el soporte en llama.cpp es reciente; se requiere una build actualizada y pueden aparecer incompatibilidades en herramientas de terceros.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado ni validacion de la comunidad.
- Licencia Apache 2.0: permite uso comercial, pero el usuario asume toda la responsabilidad legal y etica sobre el contenido generado.
- Tool calling y function calling no documentados explicitamente; verificar antes de integrar en pipelines de agentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mdmcelhaney/Qwen3.5-4B-Uncensored-HauhauCS-Aggressive
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Variante 9B del mismo autor: https://huggingface.co/HauhauCS/Qwen3.5-9B-Uncensored-HauhauCS-Aggressive
- Organizacion HauhauCS en Hugging Face: https://huggingface.co/HauhauCS
- Discord del proyecto: https://discord.gg/SZ5vacTXYf
