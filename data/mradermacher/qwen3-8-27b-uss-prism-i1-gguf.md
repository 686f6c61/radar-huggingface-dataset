# mradermacher/Qwen3.8-27B-USS-Prism-i1-GGUF

## Resumen

Qwen3.8-27B-USS-Prism-i1-GGUF es la versión cuantizada en formato GGUF del modelo nightmedia/Qwen3.8-27B-USS-Prism, un modelo de lenguaje de 27.320.697.856 parámetros (aproximadamente 27,3 mil millones) derivado de la familia Qwen (etiquetado como Qwen3.5/Qwen3.6 en los tags) y publicado bajo licencia Apache 2.0. La cuantización la realiza mradermacher, un autor habitual en el ecosistema GGUF, empleando el método i1 (imatrix) para preservar la calidad en compresiones agresivas.

El modelo base se presenta como un ajuste fino orientado a instrucciones, razonamiento con cadena de pensamiento larga (long-CoT), código, matemáticas, STEM, escritura creativa y roleplaying, con soporte declarado de contextos de 256k y hasta 1M de tokens. Los tags indican que incorpora técnicas de destilación (posiblemente de modelos como Claude 4.6, según la etiqueta "claude-distillation") y fusión mediante mergekit, lo que lo sitúa en la categoría de modelos experimentales de razonamiento y generación de texto multilingüe.

Esta ficha se centra en la versión GGUF i1, que es la que un desarrollador descargaría para ejecución local con llama.cpp, Ollama o herramientas compatibles. El repositorio ocupa 218,6 GB en total porque incluye múltiples cuantizaciones (desde Q2_K hasta Q6_K), pero cada archivo individual pesa entre 11 y 22,5 GB, lo que permite desplegarlo en GPUs de consumo con la cuantización adecuada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen, según tags qwen3_5/qwen3_6); detalles exactos no disponibles |
| Parámetros totales | 27.320.697.856 (≈27,3B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 256k tokens declarados; tag adicional "1M context" (no verificado) |
| Tipos de cuantización | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K, más fichero imatrix |
| Idiomas soportados | en, zh, ja, es |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base en safetensors/bf16 |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base en la documentación proporcionada. Los tags apuntan a una arquitectura transformer de la familia Qwen (qwen3_5, qwen3_6), con ajuste fino por SFT y LoRA, y posiblemente fusión mediante mergekit (tags "mergekit", "merge"). El modelo se describe como instruction-tuned y orientado a razonamiento con cadena de pensamiento larga (long-cot), lo que sugiere un entrenamiento específico para generar trazas de razonamiento antes de la respuesta final.

Los tags también mencionan "claude-distillation" y "claude4.6", lo que indica que el proceso de entrenamiento pudo incluir destilación a partir de salidas de modelos Claude, aunque no se especifica el volumen de datos, la composición del dataset ni si hubo RLHF o DPO. La etiqueta "unsloth" sugiere que el ajuste fino se realizó con esta librería de entrenamiento eficiente. No se han publicado detalles sobre número de tokens de entrenamiento ni innovaciones técnicas concretas (atención lineal, decodificación especulativa, etc.) en la información disponible.

## Capacidades

- Generación de texto conversacional multi-turno con instrucciones.
- Razonamiento con cadena de pensamiento larga (long-CoT) y modo "thinking" implícito en los tags de reasoning.
- Generación de código y tareas de programación (tag "coding").
- Matemáticas y STEM (tags "math", "stem").
- Escritura creativa: ficción, generación de tramas y subtramas, continuación de escenas, storytelling, ciencia ficción y todos los géneros (tags específicos de creative writing).
- Roleplaying (tag "roleplaying").
- Capacidades multilingües limitadas a inglés, chino, japonés y español.
- Soporte declarado de contextos muy largos (256k, con tag de 1M).
- Tool calling / function calling: no confirmado explícitamente en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado explícitamente, aunque el long-CoT lo hace plausible.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Asistente de razonamiento técnico: el modelo puede abordar problemas de matemáticas y STEM generando trazas de razonamiento largas antes de la respuesta, útil en entornos educativos o de análisis donde se requiere justificar el resultado paso a paso.
- Generación de código en pipelines de desarrollo: con la etiqueta "coding" y 27B de parámetros, puede emplearse para autocompletar, revisar o generar fragmentos de código en un IDE o en un pipeline de CI/CD, aunque la ausencia de confirmación de tool calling limita la integración automática con herramientas externas.
- Escritura creativa y generación de ficción: los tags específicos de story generation, plot generation y scene continue lo orientan a la producción de relatos, guiones y continuaciones narrativas, aprovechando el contexto largo para mantener coherencia en novelas o sagas.
- Roleplaying y chatbots de personaje: adecuado para aplicaciones de entretenimiento conversacional donde se requiere mantener una persona y un contexto extenso a lo largo de la conversación.
- Procesamiento de documentos largos: con 256k tokens de contexto declarados, puede resumir, extraer información o responder preguntas sobre contratos, informes o bases de código extensas en una sola pasada.
- Atención al cliente multilingüe: soporta inglés, chino, japonés y español, lo que permite desplegar un asistente conversacional para usuarios de esos cuatro idiomas, aunque la calidad por idioma no está documentada.
- Investigación y experimentación local: al estar disponible en GGUF con cuantizaciones desde 11 GB, sirve para prototipar y evaluar modelos de razonamiento en hardware de consumo sin depender de APIs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización, sin contar overhead de contexto):
  - i1-Q2_K: ~11 GB
  - i1-IQ3_S / i1-IQ3_M: ~12,7–12,9 GB
  - i1-Q4_K_S / i1-Q4_K_M: ~15,9–16,9 GB
  - i1-Q5_K_M: ~19,6 GB
  - i1-Q6_K: ~22,5 GB
- GPU recomendadas: para cuantizaciones Q4 o superiores, una RTX 4090 (24 GB) o RTX 3090 (24 GB) permite cargar el modelo completo en VRAM. Para Q2/Q3, una RTX 4080 (16 GB) o RTX 4060 Ti (16 GB) puede ser suficiente. En entornos profesionales, A100 (40/80 GB) o H100 permiten ejecutar en bf16 o con contextos muy largos.
- Cabe en GPU de consumo: sí, en cuantizaciones Q4_K_M o inferiores con 16–24 GB de VRAM; las cuantizaciones Q5/Q6 requieren 24 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF (koboldcpp, text-generation-webui). Para el modelo base en safetensors, vLLM o TGI, aunque no se confirma compatibilidad explícita.
- Latencia y throughput: no disponibles. Como referencia orientativa, un modelo de 27B en Q4_K_M en una RTX 4090 suele generar del orden de decenas de tokens por segundo, pero no hay mediciones publicadas para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-USS-Prism-i1-GGUF (este) | 27,3B | 256k (tag 1M) | Apache 2.0 | GGUF | Cuantización i1, orientado a razonamiento y escritura creativa |
| Qwen2.5-32B-Instruct | 32,5B | 128k | Apache 2.0 | safetensors, GGUF | Modelo oficial de la familia Qwen, ampliamente soportado |
| Gemma 2 27B | 27B | 8k | Gemma license | safetensors, GGUF | Tamaño comparable, contexto mucho menor |
| Mistral Small 24B | 24B | 128k | Apache 2.0 | safetensors, GGUF | Alternativa europea de tamaño similar |

No se dispone de datos de rendimiento comparativo para este modelo concreto, por lo que la comparativa se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias

- Modelo experimental: los tags incluyen "experimental", por lo que su comportamiento en producción no está validado.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar información falsa, especialmente en tareas factuales o con contextos muy largos.
- Idiomas limitados: solo se declaran en, zh, ja y es; no hay evaluación de calidad por idioma.
- Contexto de 256k/1M: los tags indican soporte, pero no se ha verificado el rendimiento real en ventanas extremas; la degradación con contextos largos es habitual en modelos de este tamaño.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base es un derivado de Qwen y de un ajuste fino de terceros (nightmedia), por lo que conviene revisar las condiciones del modelo base y de los datos de destilación (posible uso de salidas de Claude, lo que podría tener implicaciones legales según el proveedor).
- Cuantizaciones agresivas (Q2, Q3) degradan la calidad; para producción se recomienda Q4_K_M o superior.
- No se confirma soporte de tool calling ni de agentes, lo que limita su uso en pipelines automatizados.
- El repositorio incluye múltiples archivos; es necesario descargar solo la cuantización deseada para evitar consumir 218 GB.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3.8-27B-USS-Prism-i1-GGUF
- Modelo base: https://huggingface.co/nightmedia/Qwen3.8-27B-USS-Prism
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/Qwen3.8-27B-USS-Prism-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Qwen3.8-27B-USS-Prism-i1-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
