# Kumekaln/Q3.827BTT-GGUF

## Resumen

Q3.827BTT-GGUF es una cuantización GGUF publicada por el usuario Kumekaln a partir del modelo DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored, un fine tune multietapa de la familia Qwen3.8 de 27B parámetros. Se trata de un modelo orientado a escritura creativa, rol y razonamiento, con un enfoque explícito en la reducción del consumo de tokens de razonamiento (entre 1/2 y hasta 1/20 según el autor) mediante métodos de entrenamiento propios denominados "Cold Fusion" y "Fable Fusion 711".

El modelo es "abliterated"/uncensored (sin filtros de seguridad alineados) y ofrece 5 modos de razonamiento y 5 modos instruct conmutables en caliente, incluidos modos "Spoon" y "Einstein" que no consumen tokens de razonamiento. Según la model card del autor, alcanza una puntuación arc-c de 699 en 8 bits y 692 en 4 bits, cifras que sitúan el modelo, según el autor, en el rango de los modelos cerrados de referencia.

Es relevante porque demuestra la tendencia actual de la comunidad open source: merges y fine tunes multietapa de modelos base de terceros, optimizados para hardware de consumo y distribuidos en GGUF con imatrix, tanto en cuants regulares como "MTP Neo MAX". Conviene advertir que las cifras de rendimiento provienen exclusivamente del autor y no de evaluaciones independientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.8); detalles adicionales no disponibles |
| Parametros totales | 26.895.998.464 (~26,9 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (regulares e imatrix; versiones "MTP Neo MAX"); bfloat16 en origen |
| Idiomas soportados | ingles, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 337,1 GB; safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es un fine tune multietapa ("multi-stage fine tune, multi-fine tune, multi-stage merge") de Qwen3.8 27B, creado con Unsloth en hardware de consumo mediante los métodos de entrenamiento "Cold Fusion" y "Fable Fusion 711". La variante TWIN-TURBO se caracteriza por una afinación específica contra el sobre-razonamiento y el consumo excesivo de tokens, reduciendo los tokens de thinking entre la mitad y una vigésima parte respecto al Qwen 3.8 base según el autor, manteniendo la calidad de salida.

Los datasets de entrenamiento referenciados son DavidAU/Polar-STRICT-Datasets, DavidAU/F451-STRICT-Datasets y DavidAU/THE-DECKARD-Datasets, todos del mismo autor del modelo base. El modelo incorpora 5 modos de razonamiento y 5 modos instruct (con variantes "Spoon" y "Einstein" que usan cero tokens de razonamiento), conmutables por API, de forma directa o dentro del chat. No hay información disponible sobre el número total de tokens de entrenamiento, ni sobre el uso de RLHF o DPO. El pipeline etiquetado es image-text-to-text, lo que sugiere capacidades multimodales, aunque la model card no detalla el componente de visión.

## Capacidades

- Generacion de texto con foco en escritura creativa: ficcion, todos los generos, narrativa larga con seguimiento de arcos de personaje y estructura en tres actos segun el autor.
- Razonamiento con 5 modos de thinking conmutables, incluidos modos de razonamiento reducido ("Spoon", "Einstein").
- Modos instruct sin tokens de razonamiento para respuestas rapidas.
- Capacidades de codigo ("coder" segun tags), sin benchmarks especificos de codigo publicados.
- Rol (roleplaying) y conversacion multi-turno (tag "conversational").
- Etiquetado como image-text-to-text: posible entrada de imagen, aunque no documentado en la model card.
- Sin documentacion de tool calling, function calling ni soporte de agentes en la informacion disponible.

## Casos de uso

- Escritura de ficcion larga: el modelo esta afinado para mantener coherencia narrativa en obras extensas (arcos de personaje, foreshadowing, pacing), util como asistente de novelas y relatos.
- Rol e interactivo storytelling: la variante uncensored y el entrenamiento en generos variados lo hacen adecuado para roleplay sin restricciones de contenido, siempre bajo responsabilidad del usuario.
- Asistencia a guionistas y escritores: generacion de dialogo con tono y voz de personaje, reescritura de escenas y exploracion de alternativas argumentales.
- Razonamiento con ahorro de tokens: los modos con thinking reducido permiten obtener respuestas razonadas a un coste de inferencia mucho menor, util en despliegues con presupuesto de tokens limitado.
- Chatbot local en hardware de consumo: al estar en GGUF con cuants de 4 bits, puede ejecutarse localmente con llama.cpp u Ollama para asistentes personales.
- Prototipado de agentes conversacionales sin filtros: los modos conmutables por API permiten ajustar el comportamiento (razonar o no razonar) por mensaje, util para experimentacion.
- Apoyo a la escritura en ingles y chino: idiomas oficiales del modelo, aplicable a creacion de contenido bilingue.

## Benchmarks y rendimiento

Los unicos datos disponibles provienen de la model card del autor y no han sido verificados de forma independiente. No se publican benchmarks estandar completos (MMLU, HumanEval, GSM8K) en la informacion disponible.

| Benchmark | Valor (segun el autor) |
|---|---|
| ARC-C (8 bits, modo instruct medium) | 699 |
| ARC-C (4 bits) | 692 |
| ARC-C (variante "L" 8 bits / 4 bits, menos uncensored) | 709 / 701 |

El autor afirma superar al Qwen 3.8 27B base y a Qwen3.6-35B-A3B, Qwen 3.6 27B y Qwen 3.5 27B en "los 7 benchmarks criticos", sin publicar las cifras concretas de cada uno. No se han publicado resultados de benchmarks independientes en la informacion disponible.

## Requisitos de hardware

- El repo completo pesa 337,1 GB al incluir todas las cuantizaciones; el peso por archivo depende del quant elegido.
- Un quant de 4 bits de un modelo de ~27 B ocupa aproximadamente 15-17 GB, mientras que uno de 8 bits ronda los 28-30 GB (estimaciones estandar para GGUF, no confirmadas en la model card).
- Cuants de 4 bits: viables en GPUs de consumo con 24 GB de VRAM (RTX 3090/4090) o con descarga parcial a CPU/RAM en equipos con 32 GB de memoria.
- Cuants de 8 bits: recomendable una GPU con 32-48 GB (RTX 5090, A6000, A100) o ejecucion hibrida CPU+GPU.
- Formato GGUF: compatible con llama.cpp, Ollama, LM Studio, KoboldCpp y derivados; el soporte de los cuants "MTP Neo MAX" depende de la version del runtime.
- No hay datos de latencia ni throughput publicados; el autor destaca la reduccion de tokens de razonamiento como principal ganancia de velocidad efectiva por turno.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Kumekaln/Q3.827BTT-GGUF (este) | ~26,9 B | no disponible | Apache 2.0 | Uncensored, thinking reducido, GGUF con imatrix y MTP |
| Qwen3.8 27B (base) | 27 B | no disponible | no disponible | Modelo base; mayor consumo de tokens de razonamiento segun el autor |
| DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored | ~27 B | no disponible | Apache 2.0 | Variante hermana con arc-c 709/701 segun el autor, menos uncensored |
| Qwen3.6-35B-A3B | 35 B (A3B activos) | no disponible | no disponible | MoE de la misma familia; el autor afirma ser superado por este fine tune en sus tests |

## Limitaciones y advertencias

- Modelo fuertemente uncensored y abliterated: sin salvaguardas de alineacion. Su uso puede generar contenido ofensivo, peligroso o ilegal; la responsabilidad legal recae en el usuario y su despliegue en produccion requiere filtros externos.
- Las cifras de benchmarks (arc-c 699/692/709/701) provienen unicamente del autor del modelo y no existen evaluaciones independientes que las confirmen; deben tratarse con escepticismo.
- Sin documentacion de longitud de contexto, tool calling ni agentes; no es adecuado para pipelines agenticos sin verificacion previa.
- Idiomas oficiales limitados a ingles y chino; el rendimiento en castellano no esta documentado.
- El pipeline image-text-to-text sugiere entrada de imagen, pero no hay documentacion sobre como usarla ni sobre su calidad.
- Procedencia comunitaria: es un merge/fine tune multietapa de terceros sobre un modelo base ya modificado, lo que complica la trazabilidad de datos de entrenamiento y el comportamiento del modelo.
- Aunque la licencia Apache 2.0 permite uso comercial, el contenido uncensored puede incumplir las politicas de plataformas de despliegue comerciales.
- Riesgo de alucinacion tipico de modelos de esta talla sin verificacion; no hay datos de calibracion publicados.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Kumekaln/Q3.827BTT-GGUF
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored
- Variante hermana (menos uncensored, citada en la model card): https://huggingface.co/DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-NM-DAU-NEO-MTP-GGUF
- Datasets de entrenamiento:
  - https://huggingface.co/datasets/DavidAU/Polar-STRICT-Datasets
  - https://huggingface.co/datasets/DavidAU/F451-STRICT-Datasets
  - https://huggingface.co/datasets/DavidAU/THE-DECKARD-Datasets
