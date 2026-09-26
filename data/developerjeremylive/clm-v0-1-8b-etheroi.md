# developerjeremylive/CLM-v0.1-8B-etheroi

## Resumen

CLM-v0.1-8B es un modelo contrastivo de tipo "System One" desarrollado por el equipo de Contrastive-LM (autoria de Jacky Kwok, Hangoo Kang, Tarun Suresh, Jon Saad-Falcon, Marco Pavone, Christopher Ré y Azalia Mirhoseini), y re-subido a Hugging Face por el usuario developerjeremylive bajo el identificador developerjeremylive/CLM-v0.1-8B-etheroi. La model card del repositorio corresponde al checkpoint original CLM-v0.1-8B. No se trata de un modelo generativo, sino de un verificador y reranker que puntua candidatos y responde preguntas tipadas sobre un estado dado.

Tecnicamente, CLM-8B combina un encoder Qwen3-8B congelado con dos cabezas de proyeccion pequenas (una cabeza de estado y otra de accion) entrenadas con una perdida InfoNCE bidireccional. El modelo asocia estados con acciones: dado un estado (por ejemplo, un mensaje de cliente) y un conjunto de candidatos o preguntas tipadas, devuelve distribuciones de probabilidad sobre las respuestas. Su relevancia actual radica en que ofrece un rendimiento comparable a alternativas como Jev en tareas de computer-use, gaming y tool-calling, pero con hasta 9 veces menos latencia, y permite cachear embeddings de acciones para reutilizarlos.

El checkpoint se distribuye como cabezas de proyeccion (aproximadamente 0,1 GB, formato .pt) sobre un encoder externo que debe servirse por separado desde Qwen/Qwen3-8B. Esta orientado al mercado angloparlante, se publica bajo licencia Apache 2.0 y su caso de uso principal es el ranking de candidatos y la verificacion en pipelines de agentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-8B) congelado como encoder, mas dos cabezas de proyeccion (estado y accion) entrenadas con InfoNCE bidireccional |
| Parametros totales | ~8B en el encoder Qwen3-8B, mas cabezas de proyeccion de pequeno tamano (repo de 0,1 GB); numero exacto de parametros de las cabezas no disponible |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 2048 tokens (segun el ejemplo de servido con vLLM `--max-model-len 2048`); no se especifica otro valor |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | checkpoint .pt (CLM_v0.1-8B.pt) para las cabezas; el encoder base se sirve desde Qwen/Qwen3-8B (safetensors) |

## Arquitectura y entrenamiento

CLM-8B no es un modelo autoregresivo generativo. Se construye sobre un encoder Qwen3-8B congelado (transformer decoder-only) al que se anaden dos cabezas de proyeccion: una cabeza de estado y una cabeza de accion. El modelo se entrena con una perdida contrastiva InfoNCE bidireccional que conecta estados y acciones. El resultado es un puntuador: dado un estado y un conjunto de candidatos, produce probabilidades relativas a ese conjunto, y dado un estado con preguntas tipadas (Choice, Noul, Score), devuelve distribuciones de respuesta.

El entrenamiento se estructuro en tres fases segun la model card: preentrenamiento sobre aproximadamente 60 millones de pares de preguntas y respuestas de Nemotron, entrenamiento intermedio sobre unos 30 millones de negativos duros sinteticos, y post-entrenamiento sobre aproximadamente 1 millon de trayectorias agenticas. Solo se entrenan las cabezas, lo que abarata el fine-tuning. La innovacion clave es el cacheado de estado y accion: como estados y acciones se codifican por separado, los embeddings de accion pueden reutilizarse, de modo que con alrededor de 1000 candidatos el modelo es 13 veces mas rapido que Jev.

## Capacidades

- Puntuacion y ranking de candidatos: ordena soluciones best-of-N, nombres de herramientas o movimientos siguientes con probabilidades asociadas.
- Verificacion con fine-tuning: las cabezas ajustadas alcanzan resultados SOTA en DeepSWE (81,6%) y Terminal-Bench 2.1 (87,6%), entre 4 y 6 veces mas rapido que Jev.
- Preguntas tipadas sobre un estado: soporta los tipos `Noul` (si/no), `Choice` (seleccion entre criterios con distribucion de probabilidad) y `Score` (puntuacion por criterios ordenados).
- Razonamiento de decision en tareas de computer-use, gaming y tool-calling: en modo zero-shot queda a la par de Jev segun la model card.
- Uso como reranker en pipelines de recuperacion o seleccion.
- Soporte de agentes: pensado para trayectorias agenticas de varios pasos y seleccion de acciones.
- Idiomas: unicamente ingles.

## Casos de uso

- Verificacion de soluciones en agentes de codigo: dado un estado de repositorio y varias soluciones candidatas, CLM-8B las puntua y selecciona la mejor antes de aplicarla, reduciendo errores en pipelines automatizados de reparacion.
- Enrutado de tickets de atencion al cliente: con preguntas tipadas `Choice` se clasifica un mensaje entrante en departamentos (por ejemplo, facturacion frente a tecnico) obteniendo una distribucion de probabilidad que permite umbrales de confianza y escalado.
- Priorizacion por urgencia en soporte: usando preguntas tipo `Noul` y `Score` sobre el estado conversacional se estima urgencia y nivel de frustracion del cliente para ordenar la cola de atencion.
- Seleccion de herramientas en agentes: se ranquean nombres de herramientas o funciones candidatas para un estado concreto, sirviendo como paso de decision antes de la llamada a la herramienta.
- Best-of-N en generacion: dado un prompt y N respuestas generadas por otro modelo, CLM-8B las ordena y devuelve la mas probable, actuando como verificador rapido.
- Reranking en recuperacion de informacion: se puntuan pasajes o documentos recuperados por un buscador para reordenar resultados antes de pasarlos a un modelo generativo.
- Evaluacion de trayectorias agenticas: se puntua cada paso de una trayectoria (accion siguiente) para detectar desviaciones o elegir continuaciones en entornos de computer-use y gaming.

## Benchmarks y rendimiento

Los resultados publicados en la informacion disponible corresponden a las cabezas ajustadas (no a este checkpoint en zero-shot) y a la comparacion cualitativa con Jev.

| Benchmark | Resultado CLM-8B | Condiciones |
|---|---|---|
| DeepSWE | 81,6% | Cabezas ajustadas (SOTA declarado) |
| Terminal-Bench 2.1 | 87,6% | Cabezas ajustadas (SOTA declarado) |
| Computer-use, gaming y tool-calling (zero-shot) | A la par de Jev | Zero-shot, hasta 9× menos latencia |
| Ranking con ~1000 candidatos | 13× mas rapido que Jev | Gracias al cacheado de estado y accion |

No se han publicado en la informacion disponible resultados numericos detallados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) para este checkpoint.

## Requisitos de hardware

- VRAM estimada para el encoder Qwen3-8B: aproximadamente 16 GB en BF16/FP16, en torno a 8-9 GB en INT8 y 5-6 GB en INT4 (valores estimados a partir del tamano del modelo; no confirmados en la model card).
- Cabezas de proyeccion: aproximadamente 0,1 GB, coste despreciable frente al encoder.
- GPU recomendadas: A100, H100 o equivalentes para despliegue en servidor; RTX 4090 y RTX 3090 para uso en una sola GPU.
- Cabe en GPU de consumo: si, en una RTX 4090 o RTX 3090 (24 GB) en BF16; en GPUs de 12-16 GB seria necesario cuantizar el encoder.
- Opciones de despliegue: vLLM con `--runner pooling` para servir los embeddings del encoder, el paquete `contrastive-lm` con `clm-serve` (API y playground en el puerto 8700) y `transformers` para cargar el encoder base.
- Latencia y throughput: hasta 9× menos latencia que Jev en zero-shot; 4-6× mas rapido como verificador ajustado; 13× mas rapido que Jev con alrededor de 1000 candidatos gracias al cacheado de acciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| CLM-v0.1-8B | ~8B (encoder congelado) + cabezas | 2048 | Apache 2.0 | Verificador/reranker contrastivo | Hugging Face + GitHub |
| Qwen3-8B | 8B | no disponible en la informacion | Apache 2.0 | LLM generativo (modelo base del encoder) | Hugging Face |
| Jev | no disponible | no disponible | no disponible | Referencia comparativa de decision/agente | no disponible |

La informacion disponible no permite una comparacion numerica completa con alternativas de la misma categoria (verificadores o rerankers), ya que solo se ofrece la referencia cualitativa frente a Jev y los benchmarks de las cabezas ajustadas.

## Limitaciones y advertencias

- Bloqueado al encoder: las cabezas requieren obligatoriamente los embeddings de ultimo token agrupados (last-token-pooled) de Qwen3-8B; no funcionan con otro encoder.
- No genera texto: CLM solo puntua los candidatos que se le proporcionan, y sus probabilidades son relativas a ese conjunto, no absolutas.
- Resultados SOTA condicionados: las cifras de DeepSWE y Terminal-Bench 2.1 provienen de cabezas ajustadas, no de este checkpoint en zero-shot.
- Idiomas: solo ingles; no hay soporte declarado para castellano ni otros idiomas.
- Contexto limitado: el ejemplo de servido usa una longitud maxima de 2048 tokens, inferior a la de muchos modelos generativos actuales.
- Alucinacion: al no generar texto, el riesgo no es de invencion textual, pero si de asignar probabilidades altas a candidatos incorrectos en funcion del conjunto evaluado.
- Licencia: Apache 2.0, lo que permite uso comercial; el encoder base Qwen3-8B tambien es Apache 2.0.
- Trazabilidad: el repositorio es una re-subida de un tercero (developerjeremylive) con 0 descargas y 0 likes; conviene verificar la integridad de los pesos frente al repositorio oficial Contrastive-LM/CLM-v0.1-8B.
- Hoja de ruta: los autores anuncian un CLM-35B multimodal con mayor generalizacion, lo que sugiere que este checkpoint es un escalon intermedio de su escalera de escalado.

## Enlaces

- Hugging Face (re-subida): https://huggingface.co/developerjeremylive/CLM-v0.1-8B-etheroi
- Repositorio original en Hugging Face: https://huggingface.co/Contrastive-LM/CLM-v0.1-8B
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Blog: https://contrastive-lm.notion.site
- Codigo: https://github.com/Contrastive-LM/CLM
- Guia de fine-tuning: https://github.com/Contrastive-LM/CLM/blob/main/docs/FINETUNING.md
- Cabezas DeepSWE: https://huggingface.co/Contrastive-LM/deepswe-clm-heads-8k
- Discord: https://discord.gg/5dAQEDJBs
- Cita: Kwok et al., "Contrastive Language Models: A System One Model for Fast and Generalizable Decision-Making", 2026.
