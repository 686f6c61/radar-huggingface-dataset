# Contrastive-LM/CLM-v0.1-8B

## Resumen

CLM-v0.1-8B es un modelo de ranking y verificacion desarrollado por Contrastive-LM que introduce una clase distinta de modelo dentro del ecosistema: un "System One model" entrenado con objetivo de aprendizaje contrastivo para conectar estados y acciones. No es un modelo generativo al uso, sino un cabezal de puntuacion construido sobre el encoder congelado de Qwen3-8B, con dos proyecciones pequenas (state head y action head) entrenadas con una perdida InfoNCE bidireccional.

El modelo resuelve un problema concreto en pipelines agenticos: la necesidad de evaluar rapidamente multiples candidatos (soluciones best-of-N, nombres de herramientas, siguientes movimientos, respuestas posibles) sin recurrir a un LLM generativo completo. Al separar la codificacion de estados y acciones, permite cachear embeddings de acciones y reutilizarlos, lo que reduce drasticamente la latencia en escenarios con muchos candidatos.

Su relevancia actual radica en que ofrece, segun el autor, resultados comparables a Jev en tareas de computer-use, gaming y tool-calling en modo zero-shot, con hasta 9 veces menos latencia, y sirve como punto de partida para cabezales especializados que alcanzan SOTA en DeepSWE (81,6%) y Terminal-Bench 2.1 (87,6%) tras fine-tuning. La arquitectura base es Qwen3-8B, la licencia es Apache 2.0 y el checkpoint publicado ocupa 0,1 GB, ya que solo contiene los cabezales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer congelado (Qwen3-8B) con dos cabezales de proyeccion (state head y action head) entrenados con perdida InfoNCE bidireccional |
| Parametros totales | No disponible (el checkpoint publicado ocupa 0,1 GB; el encoder base Qwen3-8B tiene 8B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el ejemplo de despliegue usa `--max-model-len 2048`) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (`en` en la model card) |
| Licencia | Apache 2.0 (tanto los pesos CLM-8B como el encoder Qwen3-8B) |
| Formato de pesos | `.pt` (checkpoint PyTorch, descargado via `clm-download`); el encoder se sirve desde Qwen/Qwen3-8B |

## Arquitectura y entrenamiento

CLM-8B no es un transformer generativo sino un sistema de puntuacion contrastiva. Sobre el encoder congelado de Qwen3-8B (con pooling del ultimo token) se anaden dos cabezales de proyeccion de pequeno tamano: uno para estados y otro para acciones. Ambos se entrenan con una perdida InfoNCE bidireccional que alinea representaciones de estados con las acciones correctas frente a negativos. Como solo se entrenan los cabezales, el fine-tuning es economicamente barato.

El entrenamiento se estructura en tres fases: pre-entrenamiento sobre aproximadamente 60 millones de pares Q&A de Nemotron, mid-training sobre unos 30 millones de negativos sinteticos duros, y post-entrenamiento sobre aproximadamente 1 millon de trayectorias agenticas. La innovacion principal es el "State & Action Caching": al codificar estados y acciones por separado, los embeddings de acciones pueden reutilizarse entre consultas, de modo que con alrededor de 1000 candidatos el modelo resulta 13 veces mas rapido que Jev. El checkpoint publicado es el punto de partida para los cabezales especializados de DeepSWE y Terminal-Bench.

## Capacidades

- Puntuacion y ranking de candidatos en texto libre (respuestas, soluciones best-of-N, nombres de herramientas, siguientes movimientos).
- Respuesta a preguntas tipadas sobre un estado: `Noul` (si/no), `Choice` (seleccion entre opciones con criterios) y `Score` (escala ordinal), devolviendo distribuciones de probabilidad.
- Verificacion de trayectorias agenticas (uso como verifier tras fine-tuning de los cabezales).
- Reranking de documentos o respuestas mediante el pipeline `text-ranking`.
- Soporte de tool calling y computer-use como evaluador de acciones candidatas.
- Cacheo y reutilizacion de embeddings de acciones para evaluacion masiva de candidatos.
- Capacidades multilingues: limitadas al ingles segun la model card.
- No genera texto: solo puntua el conjunto de candidatos que se le proporciona, y sus probabilidades son relativas a ese conjunto.

## Casos de uso

- Verificacion de soluciones en pipelines de agentes de codigo: dado un estado del repositorio o del terminal y varias soluciones candidatas, CLM las puntua para seleccionar la mejor antes de aplicarla; con cabezales fine-tuned alcanza SOTA en DeepSWE y Terminal-Bench 2.1.
- Best-of-N en generacion de codigo: se generan N candidatos con un LLM generativo y CLM los rerankea por probabilidad, reduciendo coste frente a usar un segundo LLM grande como juez.
- Enrutamiento y triaje en atencion al cliente: el ejemplo de la model card clasifica un mensaje en departamento (`Choice`), urgencia (`Noul`) y nivel de frustracion (`Score`) con probabilidades, adecuado para sistemas de ticketing que necesitan decisiones rapidas y auditables.
- Seleccion de herramientas en agentes: dado el estado de la conversacion y la lista de herramientas disponibles, CLM puntua cual es la mas apropiada, con cacheo de embeddings de herramientas que abarata la evaluacion cuando el catalogo es grande.
- Verificacion de respuestas en RAG: reranking de fragmentos recuperados o de respuestas generadas para filtrar alucinaciones antes de mostrarlas al usuario.
- Evaluacion de trayectorias en entornos de computer-use y gaming: puntuar acciones candidatas paso a paso con latencia baja (hasta 9 veces menor que Jev en zero-shot segun el autor).
- Fine-tuning de cabezales especificos de dominio: al entrenarse solo los cabezales sobre un encoder congelado, es viable adaptar CLM a un dominio concreto con coste de computo reducido.

## Benchmarks y rendimiento

| Benchmark | CLM-v0.1-8B (cabezales fine-tuned) | Referencia |
|---|---|---|
| DeepSWE | 81,6% | No disponible comparativa detallada |
| Terminal-Bench 2.1 | 87,6% | No disponible comparativa detallada |
| Computer-use, gaming y tool-calling (zero-shot) | A la par que Jev, hasta 9x menos latencia | Jev |
| Ranking con ~1k candidatos | 13x mas rapido que Jev | Jev |

Nota: los resultados SOTA de DeepSWE y Terminal-Bench corresponden a cabezales fine-tuned, no a este checkpoint en zero-shot. No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generativos, que ademas no aplican a un modelo sin capacidad de generacion.

## Requisitos de hardware

- VRAM para los cabezales: minima (checkpoint de 0,1 GB); el coste real esta en servir el encoder Qwen3-8B.
- VRAM para el encoder Qwen3-8B: aproximadamente 16 GB en FP16/BF16; en cuantizacion de 8 bits alrededor de 8-9 GB, y en 4 bits alrededor de 5-6 GB (estimaciones estandar para un modelo de 8B, no publicadas por el autor).
- GPU recomendadas: A100 o H100 para despliegues de produccion con alto throughput; RTX 4090 (24 GB) suficiente para el encoder en BF16.
- Cabe en GPU de consumo: si, en RTX 4090 en BF16 y en GPUs de 8-12 GB con cuantizacion.
- Despliegue: el autor indica servir el encoder con vLLM (`--runner pooling --max-model-len 2048`) y el servicio CLM con `clm-serve` (API y playground en el puerto 8700). No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: hasta 9x menos latencia que Jev en zero-shot y 13x mas rapido con ~1k candidatos; 4-6x mas rapido que Jev como verifier fine-tuned (cifras del autor, sin hardware especificado).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CLM-v0.1-8B | Cabezales sobre Qwen3-8B | No disponible | Ranking/verificacion contrastiva | Apache 2.0 | Hugging Face |
| Jev | No disponible | No disponible | Verificador/ranking agentico | No disponible | No disponible |
| Qwen3-8B | 8B | No disponible en esta ficha | LLM generativo | Apache 2.0 | Hugging Face |

La informacion disponible solo permite comparar con Jev, usado por el autor como referencia de latencia y rendimiento, y con Qwen3-8B, el encoder base. No se dispone de datos de parametros, contexto ni licencia de Jev en la informacion proporcionada.

## Limitaciones y advertencias

- Encoder-locked: los cabezales requieren obligatoriamente embeddings de Qwen3-8B con pooling del ultimo token; no funcionan con otro encoder.
- Sin generacion: CLM solo puntua los candidatos proporcionados y sus probabilidades son relativas a ese conjunto, no calibradas de forma absoluta.
- Los resultados SOTA en benchmarks agenticos requieren fine-tuning de los cabezales; este checkpoint zero-shot no los alcanza.
- Idiomas: solo ingles declarado; el rendimiento en castellano no esta garantizado ni documentado.
- Riesgo de sesgo y alucinacion heredado del encoder Qwen3-8B y de los datos de entrenamiento (Nemotron, negativos sinteticos, trayectorias agenticas), no evaluado en la model card.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del encoder base Qwen3-8B.
- Modelo en version v0.1: se anuncia un CLM-35B multimodal para principios de octubre, por lo que la API y los resultados pueden cambiar.
- El contexto maximo efectivo en los ejemplos de despliegue es de 2048 tokens; estados mas largos requeririan ajustar `--max-model-len` con impacto en memoria.

## Enlaces

- Hugging Face: https://huggingface.co/Contrastive-LM/CLM-v0.1-8B
- Blog: https://contrastive-lm.notion.site
- Codigo: https://github.com/Contrastive-LM/CLM
- Guia de fine-tuning: https://github.com/Contrastive-LM/CLM/blob/main/docs/FINETUNING.md
- Discord: https://discord.gg/5dAQEDJBs
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Cabezales DeepSWE: https://huggingface.co/Contrastive-LM/deepswe-clm-heads-8k
