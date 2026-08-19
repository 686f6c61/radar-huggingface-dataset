# DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF

## Resumen

El modelo `DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF` es una variante fine-tuned del modelo base Qwen3.6-27B, desarrollada por el usuario DavidAU. Se trata de un modelo de 27 mil millones de parámetros, distribuido en formato GGUF con cuantizaciones tanto estándar como MTP (Multi-Token Prediction). El nombre refleja varias características: "uncensored" y "heretic" indican que se ha aplicado una técnica de abliteration para eliminar el rechazo del modelo, y "Fable-Fusion" sugiere una fusión de múltiples etapas de entrenamiento. El autor lo describe como un modelo multi-stage tuned y multi-state merge, entrenado sobre datasets propios denominados "STRICT" (Polar-STRICT y F451-STRICT).

Según los datos disponibles, este modelo alcanza una puntuación ARC-C de 0.711 en cuantización de 8 bits y 0.701 en 4 bits, lo que lo sitúa como el primer modelo open source de su clase en superar el umbral de 700 en esta métrica, un hito que anteriormente solo lograban modelos propietarios de OpenAI, Claude y Gemini. El pipeline declarado es image-text-to-text, aunque no se ha confirmado explícitamente si el modelo final soporta entrada de imágenes. Con más de 2,7 millones de descargas y cerca de 2000 likes, es un modelo popular en la comunidad, especialmente para tareas de escritura creativa, razonamiento y roleplaying. Su licencia aparece como Apache 2.0 en las etiquetas, aunque el campo de licencia de HuggingFace indica "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.6-27B) |
| Parametros totales | 27 mil millones (27B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | >200k (probado en discusion, valor oficial no disponible) |
| Tipos de cuantizacion | GGUF (Q8_0, MTP y regulares; lista completa no disponible) |
| Idiomas soportados | en, zh (segun etiquetas) |
| Licencia | apache-2.0 (segun etiquetas; campo oficial no disponible) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.6-27B, un transformer denso de 27 mil millones de parametros. El autor ha aplicado un proceso de fine-tuning en multiples etapas ("multi-stage tuned") y una fusion de estados ("multi-state merge"), combinando varios datasets propios denominados "STRICT" (Polar-STRICT y F451-STRICT). Ademas, se menciona la tecnica de abliteration, que consiste en eliminar o reducir las capas de rechazo del modelo, lo que explica la etiqueta "uncensored". No se han publicado detalles sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se utilizaron metodos de RLHF o DPO. El pipeline declarado es image-text-to-text, lo que sugiere que el modelo base podria tener capacidades multimodales, aunque no se ha verificado si el fine-tuning las conserva.

## Capacidades

- Generacion de texto y escritura creativa: afinado para ficcion, historias, roleplaying y todos los generos literarios.
- Razonamiento y resolucion de problemas: puntuacion ARC-C de 0.711 en 8-bit, indicando capacidad de razonamiento complejo.
- Generacion de codigo: etiquetado como "coder", apto para tareas de programacion.
- Conversacion: etiquetado como "conversational", adecuado para asistentes y chatbots.
- Modo de pensamiento ("thinking"): soporta razonamiento paso a paso.
- Multilingue: soporta ingles y chino (segun etiquetas).
- Sin censura: al estar abliterated, no aplica los rechazos tipicos de seguridad, lo que permite generar contenido que otros modelos bloquean.

## Casos de uso

- Escritura creativa y ficcion: el modelo puede generar novelas, cuentos, dialogos y guiones con un estilo libre y sin restricciones, gracias a su entrenamiento en datasets de escritura y su naturaleza "uncensored".
- Roleplaying y juegos de texto: su capacidad para mantener personajes y contextos largos (>200k tokens) lo hace util para sesiones de rol interactivas o simulaciones de personajes.
- Razonamiento cientifico y analitico: con un ARC-C de 0.711, puede abordar problemas de logica, matematicas y ciencias, siendo util como asistente de investigacion.
- Generacion de codigo en entornos de desarrollo: su etiqueta "coder" y su capacidad de razonamiento permiten usarlo para autocompletar, revisar o explicar codigo, aunque se debe validar la salida.
- Procesamiento de documentos extensos: con una ventana de contexto superior a 200k tokens, puede resumir, analizar o extraer informacion de libros, informes o contratos largos.
- Asistentes conversacionales sin filtros: en entornos controlados donde se requiere libertad de expresion (por ejemplo, generacion de dialogos para guiones), el modelo puede producir respuestas variadas y creativas sin los sesgos de seguridad habituales.

## Benchmarks y rendimiento

Segun la informacion disponible en aimodels.fyi, el modelo alcanza los siguientes resultados en la metrica ARC-C (AI2 Reasoning Challenge):

| Metrica | Cuantizacion 8-bit | Cuantizacion 4-bit |
|---|---|---|
| ARC-C | 0.711 | 0.701 |

No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor afirma que es el primer modelo open source de su clase en superar el umbral de 700 en ARC-C, un logro que anteriormente solo conseguian modelos propietarios.

## Requisitos de hardware

- VRAM estimada: para una cuantizacion Q8_0, el modelo ocupa aproximadamente 29 GB; para Q4_K_M, alrededor de 16 GB. Con contexto largo (>200k), la memoria adicional puede superar los 48 GB.
- GPU recomendadas: se ha probado con 2x RTX 3090 (48 GB VRAM combinada) para contexto superior a 200k en Q8_0. Tambien es viable en RTX 4090 (24 GB) con cuantizaciones mas bajas y contexto reducido, o en A100/H100 para despliegues profesionales.
- Compatibilidad con GPU de consumo: si, con cuantizaciones Q4 o Q5 y contexto moderado cabe en una RTX 4090 o similar.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (si soporta GGUF), TGI, o servidores locales como text-generation-webui.
- Latencia y throughput: no se han publicado datos concretos; dependera de la cuantizacion, el hardware y la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ARC-C | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.6-27B (base) | 27B | no disponible | no disponible | apache-2.0 (probable) | safetensors |
| Este modelo (fine-tune) | 27B | >200k (probado) | 0.711 (8-bit) | apache-2.0 (segun etiquetas) | GGUF |
| Gemma-2-27B | 27B | 8k | no disponible | gemma | safetensors |

La comparativa es limitada porque no se dispone de datos de ARC-C para los modelos base. Este fine-tune se distingue por su naturaleza "uncensored" y su alto rendimiento en razonamiento, ademas de su formato GGUF listo para inferencia local.

## Limitaciones y advertencias

- Contenido sin filtrar: al ser "uncensored" y abliterated, el modelo puede generar contenido ofensivo, ilegal o peligroso. No es apto para despliegues publicos sin moderacion adicional.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede inventar hechos o datos, especialmente en tareas de razonamiento complejo.
- Sesgos heredados: el fine-tuning sobre datasets especificos puede introducir o amplificar sesgos presentes en los datos de entrenamiento.
- Licencia ambigua: aunque las etiquetas indican apache-2.0, el campo oficial de licencia en HuggingFace dice "no disponible". Se recomienda verificar antes de un uso comercial.
- Soporte multimodal no confirmado: el pipeline image-text-to-text sugiere capacidades de vision, pero no se ha verificado si el modelo final las conserva tras el fine-tuning.
- Contexto largo con coste de memoria: aunque se ha probado >200k, el uso de contextos muy largos requiere mucha VRAM y puede degradar el rendimiento.

## Enlaces

- HuggingFace: https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
- Discusion sobre contexto largo: https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF/discussions/9
- Analisis en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/qwen3.6-27b-fable-fusion-711-uncensored-heretic-nm-dau-neo-max-mtp-gguf-davidau
- Analisis para DGX Spark: https://howtospark.com/models/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
