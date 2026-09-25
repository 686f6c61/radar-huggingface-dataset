# sekkit/CLM-v0.1-8B

## Resumen

CLM-v0.1-8B (Contrastive Language Model) es un modelo de *ranking* de texto, no un modelo generativo. Se construye congelando el encoder de Qwen3-8B e incorporando dos cabezas de proyección ligeras —una de estado (*state head*) y otra de acción (*action head*)— entrenadas con una pérdida InfoNCE bidireccional. El resultado es un modelo de tipo *System One* que puntúa y ordena candidatos (respuestas, herramientas, movimientos siguientes) en función de un estado de entrada, en lugar de generar texto token a token.

El modelo lo publica el usuario sekkit en Hugging Face, si bien la model card referencia la organización Contrastive-LM, su repositorio de código y su blog. El entrenamiento se hizo en tres fases: preentrenamiento con unos 60 millones de pares de preguntas y respuestas de Nemotron, entrenamiento intermedio con unos 30 millones de negativos duros sintéticos y postentrenamiento con alrededor de un millón de trayectorias agénticas. Según el autor, en modo zero-shot rinde a la par que Jev en tareas de computer-use, gaming y tool calling, con hasta 9 veces menos latencia; con las cabezas ajustadas alcanza el estado del arte en DeepSWE (81,6 %) y Terminal-Bench 2.1 (87,6 %).

Su relevancia actual está en el *test-time scaling* y en los pipelines de agentes: sustituye a un verificador autoregresivo por un clasificador de candidatos mucho más rápido y con probabilidades normalizadas sobre el conjunto evaluado. La contrapartida es que está atado al encoder Qwen3-8B (requiere embeddings con *last-token pooling*) y que no genera contenido: solo puntúa lo que se le ofrece. Es un eslabón de una escala mayor, ya que el autor anuncia un CLM-35B multimodal para octubre.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer congelado (Qwen3-8B) con dos cabezas de proyección (state head y action head) entrenadas con pérdida InfoNCE bidireccional |
| Parametros totales | no disponible (el encoder base, Qwen3-8B, tiene 8 000 millones de parámetros; el checkpoint publicado ocupa 0,1 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (el ejemplo oficial de despliegue del encoder usa `--max-model-len 2048`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | checkpoint PyTorch `.pt` (`CLM_v0.1-8B.pt`, descargado a `~/.cache/clm/`); no se publican safetensors ni GGUF |
| Libreria | `contrastive-lm` |
| Pipeline | text-ranking |
| Modelo base | Qwen/Qwen3-8B |
| Descargas / likes en Hugging Face | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura no es un transformer generativo al uso. El encoder Qwen3-8B permanece congelado y se le añaden dos cabezas de proyección pequeñas: una que codifica el estado (la situación, la consulta o el contexto) y otra que codifica la acción (el candidato a evaluar). Ambas representaciones se alinean mediante una pérdida InfoNCE bidireccional, de forma que el modelo aprende una métrica de compatibilidad entre estados y acciones en lugar de una distribución de probabilidad sobre el vocabulario. Solo se entrenan las cabezas, lo que abarata mucho el ajuste fino por dominio y explica que el checkpoint publicado ocupe apenas 0,1 GB.

El pipeline de datos tiene tres etapas declaradas por el autor: preentrenamiento con aproximadamente 60 millones de pares de preguntas y respuestas del corpus Nemotron, entrenamiento intermedio con unos 30 millones de negativos duros sintéticos y postentrenamiento con alrededor de un millón de trayectorias agénticas. Una innovación destacable es el *State & Action Caching*: como los estados y las acciones se codifican por separado, los embeddings de acción pueden reutilizarse entre consultas; con unos 1000 candidatos el autor reporta una velocidad 13 veces superior a la de Jev. No se documentan en la información disponible detalles como el número exacto de tokens vistos, la composición completa del dataset ni si hubo RLHF o DPO.

## Capacidades

- Puntuación y ranking de candidatos: dado un estado y un conjunto de opciones, devuelve una probabilidad por opción normalizada sobre ese conjunto.
- Preguntas tipadas sobre un estado: `Noul` (booleano), `Choice` (elección entre categorías con criterios) y `Score` (escala ordinal, por ejemplo Calm / Frustrated / Very angry).
- Verificación de soluciones: evalúa respuestas candidatas en esquemas best-of-N y selecciona la mejor.
- Selección de herramientas en tool calling: ordena nombres de herramientas candidatas para un estado dado.
- Razonamiento agéntico multi-paso: evaluación de movimientos siguientes en trayectorias de agente.
- Computer-use y gaming: el autor sitúa el rendimiento zero-shot a la par de Jev en estas tareas.
- Verificador ajustable: sirve como punto de partida para cabezas especializadas (DeepSWE, Terminal-Bench), con ajuste fino barato al entrenarse solo las cabezas.
- Caché de acciones: reutilización de embeddings de acción para acelerar la evaluación de grandes conjuntos de candidatos.
- Ausencia de generación: no produce texto libre, únicamente puntúa los candidatos que recibe.
- Solo inglés: la model card declara exclusivamente el idioma `en`.

## Casos de uso

- Verificación en best-of-N para agentes de código: se generan N parches candidatos con un modelo generativo y CLM-v0.1-8B los ordena por probabilidad de resolver la tarea, con un coste mucho menor que un verificador autoregresivo.
- Enrutado de soporte al cliente: el ejemplo oficial de la model card clasifica un ticket entrante en `billing` o `technical` con probabilidades (0,939 / 0,061) y, en la misma llamada, determina urgencia y nivel de frustración del cliente.
- Selección de herramientas en pipelines de agentes: el modelo puntúa nombres de herramientas candidatas y permite elegir la más adecuada sin una llamada generativa adicional.
- Filtrado de alucinaciones en RAG: se generan varias respuestas a partir de los pasajes recuperados y el modelo descarta las que obtienen menor compatibilidad con la consulta.
- Evaluación de trayectorias para RL o ajuste por preferencias: al puntuar acciones de forma diferenciable y rápida, puede emplearse como función de recompensa o como verificador en bucles de entrenamiento.
- Curación de datos sintéticos: ranking de pares pregunta-respuesta generados para descartar los de baja calidad antes de incorporarlos a un dataset de ajuste fino.
- Ajuste fino por dominio en producción: dado que solo se entrenan las cabezas, un equipo puede especializar el verificador en su propio tráfico (por ejemplo, dominios jurídicos o médicos) con un coste de cómputo reducido.
- Aceleración de búsquedas con muchos candidatos: gracias al *action caching*, escenarios con alrededor de 1000 alternativas se resuelven con una ventaja de velocidad declarada de 13 veces frente a Jev.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son los siguientes. Cabe subrayar que las cifras SOTA corresponden a cabezas ajustadas específicamente, no a este checkpoint en zero-shot.

| Benchmark | Resultado | Condiciones |
|---|---|---|
| DeepSWE | 81,6 % | Cabezas ajustadas (SOTA declarado por el autor) |
| Terminal-Bench 2.1 | 87,6 % | Cabezas ajustadas (SOTA declarado por el autor) |
| Computer-use, gaming y tool calling | a la par de Jev | Zero-shot, con hasta 9× menos latencia |
| Verificación con cabezas ajustadas | 4–6× más rápido que Jev | Latencia relativa |
| Ranking con ~1 000 candidatos | 13× más rápido que Jev | Con *State & Action Caching* |

No se han publicado en la información disponible resultados de MMLU, GSM8K, HumanEval ni otros benchmarks estándar de conocimiento o razonamiento, algo coherente con que el modelo no sea generativo.

## Requisitos de hardware

- El checkpoint de las cabezas ocupa 0,1 GB, por lo que la mayor parte del coste recae en el encoder Qwen3-8B que hay que servir en paralelo.
- VRAM estimada para el encoder (cálculo derivado del tamaño de Qwen3-8B, no publicado por el autor): en torno a 16 GB en FP16/BF16; aproximadamente 5–6 GB con cuantizaciones de 4 bits, si bien el modelo se sirve en vLLM con `--runner pooling`, que exige pesos completos en la práctica.
- GPU recomendadas: A100 o H100 para lotes grandes y baja latencia; una RTX 4090 (24 GB) es suficiente para servir el encoder en BF16 con `max-model-len` moderado.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090 (24 GB) y, con cuantización, en tarjetas de 12–16 GB.
- Opciones de despliegue documentadas: `vllm serve Qwen/Qwen3-8B --served-model-name qwen3-8b --runner pooling --max-model-len 2048 --port 8090` para el encoder, más `clm-serve` para la API y el playground en `http://localhost:8700/`. El paquete se instala con `pip install contrastive-lm`.
- Latencia y throughput: se declaran ganancias relativas (hasta 9× menos latencia en zero-shot, 4–6× con cabezas ajustadas y 13× con ~1000 candidatos), pero no se publican valores absolutos de tokens por segundo ni de milisegundos por consulta.
- No se documentan opciones de despliegue con llama.cpp, Ollama o TGI, ya que las cabezas necesitan la API de embeddings del encoder.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CLM-v0.1-8B | no disponible (encoder de 8B congelado + cabezas) | no disponible | DeepSWE 81,6 % y Terminal-Bench 2.1 87,6 % con cabezas ajustadas; zero-shot a la par de Jev | Apache 2.0 | Hugging Face (sekkit) y código en GitHub |
| Jev | no disponible | no disponible | Referencia de comparación usada por el autor; CLM declara ventajas de 4–13× en velocidad | no disponible | no disponible |
| Qwen3-8B (encoder base) | 8 000 M | no disponible | No es un verificador ni un ranker: es un modelo generativo, por lo que la comparación directa no aplica | Apache 2.0 | Hugging Face (Qwen) |
| CLM-35B | 35 000 M (aproximado, según el anuncio) | no disponible | multimodal, anunciado para octubre; sin datos publicados | no disponible | no anunciada |

No se dispone de datos verificables de otros verificadores del mismo tamaño (por ejemplo, cross-encoders de 8B o rerankers especializados) en la información proporcionada.

## Limitaciones y advertencias

- Atado al encoder: las cabezas exigen embeddings de Qwen3-8B con *last-token pooling*; no funcionan con otro encoder sin reentrenamiento.
- Sin generación: el modelo solo puntúa los candidatos que se le entregan, y sus probabilidades son relativas a ese conjunto, no probabilidades absolutas de corrección.
- Los resultados SOTA en DeepSWE y Terminal-Bench 2.1 provienen de cabezas ajustadas, no de este checkpoint en zero-shot; usarlo directamente como verificador no reproducirá esas cifras.
- Idioma: solo inglés declarado. No hay soporte multilingüe documentado, lo que limita su uso en castellano sin ajuste fino.
- Sesgos: no se documenta ninguna evaluación de sesgos, toxicidad o equidad en la información disponible.
- Riesgo de alucinación: al no generar texto, el riesgo no es de fabricación de contenido, sino de ordenaciones incorrectas cuando los candidatos son superficialmente plausibles o el dominio se aleja de los datos de entrenamiento.
- Licencia: Apache 2.0 para estas cabezas y para el encoder Qwen3-8B, por lo que el uso comercial está permitido; conviene revisar igualmente los términos del encoder base.
- Madurez: el repositorio presenta 0 descargas y 0 likes en el momento de la consulta, y el checkpoint se publica bajo el usuario sekkit mientras la model card apunta a la organización Contrastive-LM; conviene verificar la procedencia antes de integrarlo en producción.
- Generalización: el propio autor lo describe como un escalón intermedio de su escala, con un CLM-35B multimodal previsto para octubre con más datos y cómputo.
- Los resultados de la búsqueda web realizada no contienen información relevante sobre el modelo; los enlaces devueltos no guardan relación con este proyecto y no se han utilizado como fuente.

## Enlaces

- Modelo en Hugging Face (usuario sekkit): https://huggingface.co/sekkit/CLM-v0.1-8B
- Repositorio referenciado en la model card: https://huggingface.co/Contrastive-LM/CLM-v0.1-8B
- Encoder base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Cabezas ajustadas para DeepSWE: https://huggingface.co/Contrastive-LM/deepswe-clm-heads-8k
- Código fuente: https://github.com/Contrastive-LM/CLM
- Guía de ajuste fino: https://github.com/Contrastive-LM/CLM/blob/main/docs/FINETUNING.md
- Blog del proyecto: https://contrastive-lm.notion.site
- Discord: https://discord.gg/5dAQEDJBs
- Cita del autor: Kwok, Kang, Suresh, Saad-Falcon, Pavone, Ré y Mirhoseini (2026), "Contrastive Language Models: A System One Model for Fast and Generalizable Decision-Making"
