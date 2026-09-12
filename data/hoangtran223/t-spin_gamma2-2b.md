# HoangTran223/T-SPIN_Gamma2-2B

## Resumen

T-SPIN_Gamma2-2B es un ajuste fino del modelo google/gemma-2-2b publicado por el usuario HoangTran223 en HuggingFace. El repositorio aplica un procedimiento iterativo de self-play sobre una inicialización ya sometida a SFT con UltraChat (repo `HoangTran223/gemma2_2b_sft_ultrachat200k_20260820_043159`), y distribuye los checkpoints resultantes de cada iteración junto con los datos sintéticos generados durante el proceso. El nombre del repositorio usa "Gamma2" por indicación del autor, aunque el modelo subyacente es Gemma 2 de 2B parámetros.

Se trata de un artefacto de investigación más que de un modelo listo para producción: acumula cero descargas y cero likes, no incluye model card explicativa del método, no publica resultados de evaluación y su fecha de creación (11 de septiembre de 2026) lo sitúa como un experimento reciente. Su interés radica en documentar de forma abierta un pipeline de autoentrenamiento por iteraciones, con los datos sintéticos intermedios incluidos en el propio repositorio.

Técnicamente hereda la arquitectura de Gemma 2 2B: transformer decoder-only de 2,6 mil millones de parámetros, contexto de 8192 tokens, atención alternada local/global y licencia Gemma. No se documentan ampliaciones de contexto, destilación adicional ni capacidades multimodales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 2) con atención alternada local/global y group-query attention; heredada de google/gemma-2-2b |
| Parametros totales | ~2,6 mil millones (heredado del modelo base; no se documenta recuento propio) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 8192 tokens (heredada del modelo base; no se documenta extensión adicional) |
| Tipos de cuantizacion | no se distribuyen cuantizaciones propias; el repositorio contiene pesos safetensors. Al estar basado en Gemma 2 2B existen cuantizaciones comunitarias GGUF, GPTQ y AWQ del modelo base |
| Idiomas soportados | no disponible en la información del repositorio; el ajuste se realiza sobre UltraChat, mayoritariamente en inglés |
| Licencia | Gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors, organizados en subcarpetas (`ite0/`, `ite1/`, `ite2/LATEST/`); tamano total del repo 27,1 GB |

## Arquitectura y entrenamiento

La arquitectura es la de Gemma 2 2B, un transformer decoder-only de 26 capas con `hidden_size` de 2304, `head_dim` de 256, 8 cabezas de consulta y 4 de clave/valor (GQA), `intermediate_size` de 9216 y vocabulario de 256 000 tokens, según la configuración pública del modelo base. Emplea atención local con ventana deslizante de 4096 tokens alternada con capas de atención global, normalización RMSNorm y activaciones GeGLU, además de soft-capping sobre los logits. Google entrenó el modelo base con 2 billones de tokens y destilación desde modelos mayores, con fecha de corte de conocimiento en junio de 2024.

Sobre ese punto de partida, el autor aplica una inicialización SFT y después un esquema iterativo de self-play. Según la model card, la iteración 0 (`ite0/`) se entrena durante 2 épocas con `beta=0` y la iteración 1 (`ite1/`) durante 2 épocas con `beta=0.1`; el repositorio incluye además tripletas sintéticas (`ite0/train.jsonl`, `ite1/train.jsonl`, `ite2/train.jsonl`), las respuestas de la política inicial `y_0` en `proto/train.jsonl` y un snapshot intermedio en `ite2/LATEST/`. Esta estructura —iteraciones sucesivas, tripletas sintéticas y un parámetro `beta` de regularización— es compatible con las técnicas de self-play fine-tuning del estilo SPIN, aunque el autor no especifica qué significa exactamente "T-SPIN" ni cita paper alguno en la información disponible, por lo que la correspondencia no está confirmada. Tampoco se detallan hiperparámetros como tasa de aprendizaje, composición exacta del dataset de cada iteración o criterios de selección del mejor checkpoint.

## Capacidades

- Generación de texto conversacional en inglés, heredada del ajuste SFT sobre UltraChat y refinada mediante iteraciones de self-play.
- Razonamiento básico y respuesta a instrucciones propias de un modelo de 2,6B parámetros; no hay evaluación publicada que lo cuantifique.
- Generación de código y matemáticas elementales, limitada por el tamano del modelo y por no haberse entrenado específicamente para ello.
- Seguimiento de conversaciones multi-turno dentro de la ventana de 8192 tokens.
- Capacidad multilingüe residual del modelo base; no se documenta soporte específico ni evaluación por idioma, y el castellano no está garantizado.
- No se documenta soporte nativo de tool calling ni de function calling, ni una plantilla de chat específica más allá de la de Gemma 2.
- No dispone de visión, audio ni modo de razonamiento explícito (thinking mode).
- No se documenta soporte de agentes ni de razonamiento multi-paso con uso de herramientas.

## Casos de uso

- Investigación sobre self-play fine-tuning: el repositorio incluye los datos sintéticos de cada iteración y los checkpoints intermedios, lo que permite reproducir y auditar el efecto de cada ronda de autoentrenamiento sobre la política.
- Estudio comparativo de iteraciones: cargando `ite0` e `ite1` por separado se puede medir cómo evoluciona el comportamiento del modelo entre la primera y la segunda iteración, algo poco habitual en repositorios públicos.
- Prototipado de asistentes conversacionales de bajo coste: con 2,6B parámetros y contexto de 8192 tokens, el modelo puede ejecutarse en una GPU de consumo para maquetar un chatbot de dominio acotado antes de escalar a un modelo mayor.
- Generación de datos sintéticos: puede utilizarse como generador auxiliar para producir pares instrucción-respuesta que alimenten pipelines de destilación o de ajuste de modelos mayores, siempre con revisión humana por el riesgo de alucinación.
- Inferencia en el borde o en local: cuantizado a 4 bits ocupa en torno a 1,5-2 GB, lo que permite desplegarlo en portátiles con GPU modesta o en equipos Apple Silicon para tareas de resumen y clasificación.
- Análisis y etiquetado de texto a escala: clasificación de tickets, extracción de entidades simples o resumen de documentos cortos donde el coste por token de un modelo grande no está justificado.
- Experimentación académica sobre licencias abiertas: al usar la licencia Gemma, sirve como banco de pruebas para estudiar las obligaciones de uso comercial y redistribución de pesos derivados.
- Aprendizaje y docencia: el pipeline completo (SFT, iteraciones, datos intermedios) es un ejemplo didáctico de cómo se organiza un repositorio de entrenamiento iterativo con checkpoints parciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tabla de evaluaciones (MMLU, HumanEval, GSM8K, MT-Bench u otras), no se aportan comparaciones con el modelo base ni con la inicialización SFT, y no hay ninguna métrica objetiva publicada por el autor en la información consultada.

## Requisitos de hardware

- VRAM en bf16/fp16: aproximadamente 5,2 GB solo para los pesos de 2,6B parámetros, más la caché KV, que ronda los 104 KB por token (unos 0,85 GB a 8192 tokens con la configuración de 26 capas y 4 cabezas KV). En la práctica, entre 7 y 9 GB de VRAM para lotes pequeños.
- VRAM en int8: alrededor de 2,7-3 GB de pesos, más caché KV.
- VRAM en 4 bits: alrededor de 1,5-2 GB de pesos, apto para GPU de 4-6 GB con contexto reducido.
- GPU de consumo: cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4070 en bf16; en RTX 4060 8 GB o similares es recomendable cuantizar. También es viable en equipos Apple Silicon con 8-16 GB de memoria unificada.
- GPU de centro de datos: A100, H100, L40S, L4 o A10G para despliegues con lotes grandes y alta concurrencia; el modelo es pequeno para estas tarjetas y quedan limitadas por el ancho de banda de memoria.
- Opciones de despliegue: `transformers` con `subfolder="ite1"` (tal como indica el autor), vLLM, TGI, SGLang, y llama.cpp, Ollama o LM Studio tras convertir los pesos a GGUF con el script oficial de llama.cpp para Gemma 2.
- Latencia y throughput estimados: no disponible. No se publican medidas de tokens por segundo ni de latencia en el repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| T-SPIN_Gamma2-2B | ~2,6B | 8192 | Gemma | safetensors | Repo de investigacion, 0 descargas, sin evaluacion publicada |
| google/gemma-2-2b | ~2,6B | 8192 | Gemma | safetensors | Modelo oficial, ampliamente desplegado y cuantizado |
| meta-llama/Llama-3.2-3B-Instruct | 3,2B | 128 000 | Llama 3.2 Community License | safetensors | Modelo oficial con ecosistema amplio |
| Qwen/Qwen2.5-3B-Instruct | 3,1B | 32 768 nativo (ampliable con YaRN) | Apache 2.0 | safetensors | Modelo oficial, licencia permisiva |
| microsoft/Phi-3.5-mini-instruct | 3,8B | 128 000 | MIT | safetensors | Modelo oficial, licencia permisiva |

La comparación debe leerse con cautela: para el modelo de este repositorio no existen métricas publicadas, de modo que la diferencia frente a las alternativas solo puede establecerse por tamano, contexto y licencia, no por rendimiento medido.

## Limitaciones y advertencias

- Ausencia total de validación externa: cero descargas y cero likes en el momento de la consulta, sin resultados de benchmarks ni evaluaciones de terceros.
- Documentación mínima: la model card se limita a describir la estructura de carpetas; no explica el método T-SPIN, no detalla hiperparámetros completos y no indica qué checkpoint recomienda para uso general más allá de `ite1`.
- Inconsistencia de nomenclatura: el título menciona "Ultrachat50k" mientras que la inicialización SFT referencia "ultrachat200k", y el nombre del repositorio usa "Gamma2" en lugar de "Gemma2". Conviene verificar qué datos se usaron realmente en cada iteración.
- Checkpoint incompleto: `ite2/LATEST/` es un snapshot a mitad de iteración, no una política terminada; cargarlo sin `resume_meta.json` puede dar resultados no representativos.
- Riesgo de alucinación elevado: se trata de un modelo de 2,6B parámetros sin evaluaciones de fidelidad, por lo que no es apto para tareas donde la exactitud factual sea crítica sin verificación humana.
- Idiomas: no se declara cobertura multilingüe y el entrenamiento se apoya en UltraChat, mayoritariamente en inglés. El rendimiento en castellano es incierto.
- Contexto limitado a 8192 tokens, insuficiente para documentos largos, análisis de repositorios completos o conversaciones muy extensas.
- Licencia Gemma: el uso comercial está permitido bajo los Gemma Terms of Use, que imponen obligaciones de atribución, la aceptación de la política de uso prohibido y condiciones específicas para la redistribución de modelos derivados y para el uso remoto a través de API. Es responsabilidad del integrador revisar esas cláusulas antes de desplegar el modelo.
- Contenido del repositorio: 27,1 GB que mezclan pesos de varias iteraciones y datos sintéticos, lo que puede complicar la trazabilidad de qué versión genera qué salida.
- Reproducibilidad limitada: se conocen el número de épocas y el valor de `beta` por iteración, pero no las semillas, el orden de los datos ni la configuración completa del entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HoangTran223/T-SPIN_Gamma2-2B
- Modelo base: https://huggingface.co/google/gemma-2-2b
- Inicialización SFT citada por el autor: https://huggingface.co/HoangTran223/gemma2_2b_sft_ultrachat200k_20260820_043159
- Licencia Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Referencia general sobre self-play fine-tuning (SPIN), no citada por el autor en la información disponible: https://arxiv.org/abs/2401.01335
- La búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo: los enlaces recuperados correspondían a sitios de videojuegos y a listados genéricos de arXiv, sin relación con el repositorio.
