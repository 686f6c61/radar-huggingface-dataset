# credible-ai/olmo2-1B-288domains-vertex-linearsqrt-hellaswag

## Resumen

olmo2-1B-288domains-vertex-linearsqrt-hellaswag es un modelo de lenguaje de 1.414 millones de parámetros desarrollado por credible-ai como artefacto de investigación para reproducir los experimentos del artículo LinMix (Data Mixing as Linear Domain Attribution). Se trata de un modelo base de la familia OLMo 2 de AllenAI, preentrenado desde cero sobre 32.000 millones de tokens extraídos del corpus WebOrganizer, con una mezcla de dominios optimizada específicamente para la tarea HellaSwag mediante el método LinMix.

El modelo no está pensado como un asistente de propósito general ni ha pasado por fases de alineación (SFT, RLHF o DPO). Su función es servir como referencia empírica para estudiar cómo afectan las proporciones de mezcla de datos de preentrenamiento al rendimiento en una tarea concreta de razonamiento sobre sentido común. La mezcla se calcula sobre 288 dominios definidos por la combinación de temática y formato del contenido web, y se materializa en un archivo `mix.json` incluido en el repositorio.

Su relevancia actual radica en que permite validar empíricamente las predicciones del método LinMix a escala de 1B de parámetros, partiendo de un enjambre proxy de modelos de 60M. Es, por tanto, una pieza de infraestructura experimental para investigadores interesados en data mixing y no una alternativa práctica a modelos instructivos de tamaño similar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | OLMo 2 (`Olmo2ForCausalLM`), transformer decoder-only |
| Parametros totales | 1.414.678.528 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (bfloat16) |

Otros datos técnicos: 18 capas, dimensión oculta 2048, tokenizer GPT-NeoX-20B con vocabulario de 50.432 tokens, entrenamiento con OLMo-core sobre 32.000 millones de tokens.

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de la familia OLMo 2, con 18 capas y dimensión oculta 2048, lo que da un total de 1.414 millones de parámetros. Utiliza el tokenizer de GPT-NeoX-20B (vocabulario de 50.432 entradas) y los pesos se distribuyen en bfloat16. El entrenamiento se realizó con la librería OLMo-core de AllenAI sobre 32.000 millones de tokens, un presupuesto relativamente modesto para un modelo de este tamaño (aproximadamente 22 tokens por parámetro).

La innovación principal no está en la arquitectura sino en la estrategia de mezcla de datos. El corpus WebOrganizer se particiona en 288 dominios resultantes del producto cartesiano entre temática y formato del contenido web. Las proporciones de mezcla se obtienen mediante LinMix, que ajusta un surrogate lineal sobre un enjambre de modelos proxy de 60M de parámetros (credible-ai/olmo2-60M-288domains-vertex) y aplica una utilidad de raíz cuadrada (√π con r = 0,5) para atribuir la contribución de cada dominio al rendimiento en HellaSwag. El resultado es una mezcla de dominios optimizada para esa tarea concreta, no para capacidad general. No se aplicaron fases de SFT, RLHF ni DPO.

## Capacidades

- Generación de texto autoregresiva en inglés, como modelo base sin ajuste instructivo.
- Razonamiento de sentido común evaluable mediante HellaSwag, objetivo explícito de la mezcla de datos.
- Capacidad de continuación de texto y modelado de lenguaje general, limitada por el presupuesto de entrenamiento (32B tokens).
- Soporte de tool calling / function calling: no disponible; el modelo no ha sido entrenado para ello.
- Soporte de agentes y razonamiento multi-paso: no disponible; carece de alineación y de formato de chat.
- Capacidades multilingües: únicamente inglés declarado.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.
- Capacidad de servir como referencia reproducible para experimentos de data mixing.

## Casos de uso

- Reproducción de experimentos de LinMix: el modelo permite verificar las predicciones del surrogate lineal a escala de 1B de parámetros, comparando el rendimiento en HellaSwag con el estimado a partir del enjambre proxy de 60M.
- Investigación en data mixing: sirve como punto de comparación frente a otras mezclas (uniformes, basadas en heurísticas o en otros optimizadores) para estudiar la transferibilidad de las proporciones óptimas entre escalas.
- Estudio de atribución de dominios: al disponer del `mix.json` y de los 288 dominios definidos, permite analizar qué combinaciones de temática y formato contribuyen más a una tarea concreta.
- Baseline en experimentos de scaling laws: con 1.414M de parámetros y 32B tokens, actúa como punto de referencia controlado para estudiar el efecto del presupuesto de entrenamiento.
- Análisis de sesgos del corpus DCLM/WebOrganizer: al ser un modelo base entrenado sobre un subconjunto del pool DCLM 1b-1x, puede emplearse para sondear qué sesgos introduce esa distribución de datos.
- Docencia y formación en técnicas de mezcla de datos: su naturaleza de artefacto reproducible y su licencia MIT lo hacen adecuado para talleres prácticos sobre optimización de mezclas de preentrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas numéricas de HellaSwag ni de otras tareas, pese a que la mezcla se optimizó para HellaSwag.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 2,8 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 4 y 6 GB según longitud de secuencia y batch.
- VRAM estimada en cuantización de 8 bits: alrededor de 1,5 GB; en 4 bits, alrededor de 0,8 GB (estimaciones a partir del número de parámetros, no publicadas por el autor).
- GPU recomendadas: cualquier GPU consumer con al menos 8 GB de VRAM (RTX 3060 Ti, RTX 4060, RTX 4070, RTX 4090) es suficiente para inferencia en bfloat16 con batch pequeño; para evaluación a gran escala se recomienda A100 o H100.
- Cabe en GPU consumer: sí, en todas las GPU modernas con 8 GB o más, e incluso en 4 GB con cuantización de 4 bits.
- Opciones de despliegue: transformers (soporte nativo de `Olmo2ForCausalLM`); vLLM, llama.cpp, Ollama y TGI no están confirmados en la información disponible, aunque al ser una arquitectura OLMo 2 estándar es probable que funcionen con las versiones recientes de esas herramientas.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Enfoque |
|---|---|---|---|---|---|
| olmo2-1B-288domains-vertex-linearsqrt-hellaswag | 1.414M | no disponible | 32B tokens, mezcla LinMix optimizada para HellaSwag | MIT | Artefacto de investigación en data mixing |
| OLMo 2 1B (AllenAI) | ~1.200M | 4.096 tokens | ~4T tokens, mezcla general | Apache 2.0 | Modelo base de propósito general |
| credible-ai/olmo2-60M-288domains-vertex | ~60M | no disponible | enjambre proxy para LinMix | MIT (presumible) | Proxy de bajo coste para ajustar la mezcla |
| Modelos instructivos de ~1B (p. ej. Llama 3.2 1B Instruct) | ~1.200M | 128K tokens | preentrenamiento masivo + SFT/RLHF | Llama Community License | Asistente de propósito general |

La comparación con OLMo 2 1B oficial es la más directa: misma arquitectura y tokenizer, pero con un presupuesto de entrenamiento dos órdenes de magnitud menor y una mezcla de datos especializada. Frente a modelos instructivos de tamaño similar, este modelo carece de alineación y de formato conversacional, por lo que no es sustituible en aplicaciones de usuario final.

## Limitaciones y advertencias

- No es un modelo de propósito general: el propio autor lo describe como artefacto de investigación, no como un modelo listo para producción.
- Sesgos conocidos: al entrenarse sobre un subconjunto del pool DCLM 1b-1x (derivado de Common Crawl), hereda los sesgos de representación, idioma y calidad de ese corpus; no se han documentado evaluaciones de sesgo específicas.
- Riesgo de alucinación: elevado en comparación con modelos alineados, ya que no ha pasado por SFT, RLHF ni DPO y su presupuesto de entrenamiento es limitado.
- Limitaciones de contexto: la longitud de contexto no está documentada en la información disponible; conviene verificar la configuración del tokenizer y del modelo antes de usarlo con secuencias largas.
- Limitaciones de idioma: solo se declara inglés; el rendimiento en castellano u otros idiomas no está evaluado y previsiblemente será bajo.
- Restricciones de licencia: los pesos son MIT, pero los datos de entrenamiento provienen de DCLM 1b-1x (CC-BY-4.0) y están sujetos a los términos de uso de Common Crawl; el uso comercial debe revisar esas condiciones además de la licencia MIT.
- Caveat para producción: no soporta tool calling, formato de chat ni razonamiento multi-paso; no debe desplegarse como asistente sin un ajuste instructivo previo.
- El rendimiento está optimizado para HellaSwag, lo que puede implicar un sesgo de especialización en la mezcla de datos y un rendimiento subóptimo en otras tareas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/credible-ai/olmo2-1B-288domains-vertex-linearsqrt-hellaswag
- Modelo proxy de 60M: https://huggingface.co/credible-ai/olmo2-60M-288domains-vertex
- Paper LinMix: https://arxiv.org/abs/2610.37390
- Código LinMix: https://github.com/credibleai/linmix
- Dataset WebOrganizer/Corpus-200B: https://huggingface.co/datasets/WebOrganizer/Corpus-200B
- Dataset tokenizado: https://huggingface.co/datasets/credible-ai/weborganizer-corpus-200b-tokenized
- Pool DCLM 1b-1x: https://huggingface.co/datasets/mlfoundations/dclm-pool-1b-1x
- Documentación de OLMo 2 en transformers: https://huggingface.co/docs/transformers/model_doc/olmo2
- Tokenizer GPT-NeoX-20B: https://huggingface.co/EleutherAI/gpt-neox-20b
- Repositorio OLMo-core: https://github.com/allenai/OLMo-core
- Términos de uso de Common Crawl: https://commoncrawl.org/terms-of-use
