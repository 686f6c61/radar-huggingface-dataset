# mdcreativeagent/Qwen3.5-27B-Uncensored-HauhauCS-Aggressive

## Resumen

Qwen3.5-27B-Uncensored-HauhauCS-Aggressive es una variante sin censura del modelo Qwen3.5-27B, desarrollada por HauhauCS (republicada en Hugging Face por el usuario mdcreativeagent). El objetivo declarado es eliminar los rechazos (refusals) del modelo base sin degradar sus capacidades: el autor afirma 0 rechazos sobre 465 pruebas de evaluación, manteniendo intactos los datasets y el comportamiento funcional original. Se distribuye como pesos GGUF cuantizados, lo que facilita su despliegue en entornos locales.

El modelo base es un transformer denso de 27B parámetros (26.895.998.464 pesos reales según safetensors) con 64 capas y una arquitectura híbrida que combina atención lineal Gated DeltaNet con atención softmax completa en proporción 3:1. Incorpora contexto nativo de 262K tokens (extensible a 1M con YaRN), capacidades multimodales nativas (texto, imagen y vídeo) mediante un encoder de visión separado en formato `mmproj`, y soporte de predicción multi-token (MTP). El vocabulario es de 248K entradas y cubre 201 idiomas.

La relevancia de esta ficha radica en dos factores: por un lado, documenta una arquitectura reciente (el modelo base se publicó el 2 de marzo de 2026) con innovaciones como la atención lineal híbrida y el modo thinking; por otro, ilustra el fenómeno de los fine-tunes "uncensored" que eliminan las salvaguardas del modelo original, con las implicaciones éticas y legales que ello conlleva. El repo ocupa 191,3 GB e incluye múltiples cuantizaciones, desde BF16 hasta IQ2_M.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso híbrido: Gated DeltaNet (atención lineal) + atención softmax completa, ratio 3:1; 64 capas |
| Parametros totales | 26.895.998.464 (≈27B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262K nativo; extensible a 1M con YaRN |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, IQ4_XS, Q3_K_M, IQ3_M, IQ2_M; encoder de visión en f16 |
| Idiomas soportados | 201 idiomas según el autor; tags de la model card: en, zh, multilingual |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (incluye `mmproj` f16 para visión) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-27B emplea una arquitectura híbrida que intercala capas de atención lineal Gated DeltaNet con capas de atención softmax completa en una proporción 3:1, lo que reduce el coste computacional en contextos largos manteniendo la calidad de la atención completa. Consta de 64 capas y un vocabulario de 248K tokens. Incorpora predicción multi-token (MTP), una técnica que permite generar varios tokens por paso de decodificación y mejorar el throughput. El soporte multimodal es nativo: un encoder de visión independiente (archivo `mmproj` de 885 MB en f16) procesa entradas de imagen y vídeo junto al modelo de lenguaje.

Sobre el proceso de entrenamiento del modelo base, la información disponible no detalla el número de tokens, la composición del dataset ni si se aplicaron fases de RLHF o DPO; estos datos no están disponibles en la documentación proporcionada. Respecto al fine-tune sin censura, el autor afirma que no se modificaron los datasets ni las capacidades: el ajuste se limita a eliminar los comportamientos de rechazo. La variante "Aggressive" aplica una eliminación de rechazos más agresiva que una hipotética variante "Balanced". El autor advierte que el modelo puede añadir ocasionalmente un descargo de responsabilidad breve al final de una respuesta (por ejemplo, avisos de que la información no constituye asesoramiento legal), heredado del entrenamiento del modelo base, sin que ello constituya un rechazo.

## Capacidades

- Generación de texto conversacional multi-turno con contexto de hasta 262K tokens nativos.
- Razonamiento en modo thinking (activado por defecto) y modo no-thinking, con parámetros de muestreo recomendados distintos para cada uno.
- Capacidades multimodales nativas: procesamiento de imagen y vídeo mediante el encoder `mmproj`.
- Generación de código y matemáticas (capacidad heredada del modelo base Qwen3.5; sin benchmarks específicos publicados en la información disponible).
- Soporte multilingüe amplio: 201 idiomas según el autor, con vocabulario de 248K tokens.
- Predicción multi-token (MTP) para acelerar la decodificación.
- Comportamiento sin rechazos: el autor declara 0 rechazos en 465 pruebas.
- Compatibilidad con runtimes GGUF: llama.cpp, LM Studio, Jan, koboldcpp.
- Soporte de tool calling y function calling: no confirmado explícitamente en la información disponible (el modelo base Qwen3.5 lo soporta según su ecosistema, pero la model card de este fine-tune no lo detalla).

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar cómo se comporta un LLM sin salvaguardas frente a prompts sensibles, comparándolo con el modelo base para analizar qué se elimina exactamente en un fine-tune uncensored.
- Generación creativa sin restricciones: escritura de ficción, guiones o narrativa que aborde temas adultos o controvertidos, donde los rechazos del modelo base interrumpirían el flujo creativo.
- Procesamiento de documentos largos: con 262K tokens de contexto nativo, adecuado para analizar contratos, informes o expedientes completos en una sola pasada.
- Análisis multimodal local: con el encoder `mmproj`, permite describir imágenes o extraer información de vídeo en entornos sin conexión, usando llama.cpp o LM Studio.
- Asistencia en investigación académica sensible: discusión de temas de salud, derecho o ciencias sociales donde el modelo base podría mostrarse evasivo, con la advertencia de que las respuestas requieren verificación humana.
- Evaluación comparativa de cuantizaciones: el repo ofrece nueve niveles de cuantización (de BF16 a IQ2_M) con calibración de importance matrix en las variantes IQ, lo que permite medir la degradación de calidad frente al tamaño en hardware consumer.
- Despliegue en estaciones de trabajo con GPU única: la cuantización Q4_K_M (16 GB) o IQ4_XS (14 GB) cabe en GPUs consumer de gama alta para uso conversacional local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de evaluación es la afirmación del autor de 0 rechazos sobre 465 pruebas, sin detallar la metodología ni el conjunto de prompts utilizado.

## Requisitos de hardware

- VRAM estimada según cuantización (tamaño de archivo como referencia mínima, más overhead de contexto KV):
  - BF16 (51 GB): requiere GPUs de 80 GB (A100, H100) o múltiples GPUs.
  - Q8_0 (27 GB): cabe en una A100 40 GB o H100; ajustado en RTX 4090 de 24 GB.
  - Q6_K (21 GB) y Q5_K_M (19 GB): viables en RTX 4090 (24 GB) con contexto moderado.
  - Q4_K_M (16 GB) e IQ4_XS (14 GB): cómodos en RTX 4090, RTX 4080, y viables en GPUs de 16 GB.
  - Q3_K_M (13 GB), IQ3_M (12 GB) e IQ2_M (8,8 GB): aptos para GPUs consumer de 12-16 GB; IQ2_M podría ejecutarse en GPUs de 10-12 GB.
- El encoder de visión añade 885 MB en f16.
- Contexto largo: mantener 128K tokens o más para preservar las capacidades de thinking, según el autor, incrementa notablemente el uso de memoria KV.
- Despliegue: llama.cpp, LM Studio, Jan, koboldcpp para GGUF; para producción de alto throughput el autor recomienda vLLM, SGLang o KTransformers (aunque estos requieren pesos en formato distinto a GGUF).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Qwen3.5-27B-Uncensored-HauhauCS-Aggressive | 27B denso | 262K (1M con YaRN) | Sí (texto, imagen, vídeo) | Apache 2.0 | GGUF | Fine-tune sin rechazos; 0/465 refusals declarados |
| Qwen3.5-27B (base) | 27B denso | 262K (1M con YaRN) | Sí | Apache 2.0 | Safetensors y GGUF (según ecosistema Qwen) | Modelo original con salvaguardas |
| Qwen3.5-9B-Uncensored-HauhauCS-Aggressive | 9B denso | No disponible | No disponible | Apache 2.0 (según repo del autor) | GGUF | Variante menor del mismo autor |
| Qwen3.5-4B-Uncensored-HauhauCS-Aggressive | 4B denso | No disponible | No disponible | Apache 2.0 (según repo del autor) | GGUF | Variante menor del mismo autor |

No se dispone de datos de benchmarks que permitan comparar el rendimiento cuantitativo con alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo sin salvaguardas: la eliminación de rechazos implica que puede generar contenido dañino, ilegal o éticamente problemático. Su uso en producción orientada al usuario final conlleva riesgos reputacionales y legales.
- Descargos residuales: puede añadir avisos breves al final de las respuestas (por ejemplo, "esto no es asesoramiento legal"), heredados del modelo base; no son rechazos, pero pueden aparecer en contextos donde no se desean.
- Riesgo de alucinación: no cuantificado en la información disponible; como todo LLM, puede inventar datos, especialmente en modo thinking con contextos muy largos.
- Idiomas: aunque el autor declara 201 idiomas, los tags de la model card solo listan en, zh y multilingual; el rendimiento en castellano no está verificado.
- Contexto: el autor advierte que por debajo de 128K tokens se degradan las capacidades de thinking; usar ventanas menores puede reducir la calidad en tareas de razonamiento.
- Arquitectura muy reciente: el soporte en llama.cpp es reciente y requiere builds actualizados; pueden aparecer incompatibilidades en versiones antiguas de los runtimes.
- Licencia Apache 2.0: permite uso comercial, pero el desarrollador del fine-tune no ofrece garantías sobre el comportamiento del modelo ni sobre la legalidad del contenido generado en jurisdicciones concretas.
- Repo de 191,3 GB: descargar el repositorio completo es costoso; conviene descargar solo el archivo de cuantización necesario.
- Sin tracción comunitaria: 0 descargas y 0 likes en el momento de la ficha; no hay validación independiente de las afirmaciones del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mdcreativeagent/Qwen3.5-27B-Uncensored-HauhauCS-Aggressive
- Modelo base Qwen3.5-27B: https://huggingface.co/Qwen/Qwen3.5-27B
- Variante 9B del mismo autor: https://huggingface.co/HauhauCS/Qwen3.5-9B-Uncensored-HauhauCS-Aggressive
- Variante 4B del mismo autor: https://huggingface.co/HauhauCS/Qwen3.5-4B-Uncensored-HauhauCS-Aggressive
- Repositorio del autor HauhauCS: https://huggingface.co/HauhauCS
- Discord del autor: https://discord.gg/SZ5vacTXYf
