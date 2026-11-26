# credible-ai/olmo2-1B-288domains-dirichlet-lightgbm-hellaswagpiqa

## Resumen

`olmo2-1B-288domains-dirichlet-lightgbm-hellaswagpiqa` es un modelo de lenguaje de 1.414.678.528 parámetros desarrollado por el grupo credible-ai como artefacto de investigación para reproducir los experimentos del artículo LinMix ("Data Mixing as Linear Domain Attribution"). No es un modelo de propósito general: es una pieza concreta de un estudio sobre mezcla de datos de entrenamiento, entrenada con 32.000 millones de tokens extraídos del corpus WebOrganizer y mezclados según pesos optimizados con RegMix para las tareas HellaSwag y PIQA.

La arquitectura es OLMo 2 (`Olmo2ForCausalLM`), con 18 capas, tamaño oculto de 2048 y tokenizador GPT-NeoX-20B de 50.432 entradas de vocabulario. El entrenamiento se realizó con OLMo-core y los pesos se distribuyen en bfloat16.

Su relevancia es metodológica, no de producto: permite auditar cómo un surrogate LightGBM ajustado sobre un enjambre Dirichlet de 288 dominios (combinación de temática y formato) selecciona la mezcla de datos que maximiza el rendimiento en dos benchmarks concretos. Cualquier uso fuera de ese contexto de investigación debe considerar que el modelo está deliberadamente sobreoptimizado para HellaSwag y PIQA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | OLMo 2 (`Olmo2ForCausalLM`), transformer decoder-only |
| Parametros totales | 1.414.678.528 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Capas | 18 |
| Tamaño oculto | 2048 |
| Tokenizador | GPT-NeoX-20B, vocabulario de 50.432 |
| Tokens de entrenamiento | 32.000 millones |
| Dataset | WebOrganizer/Corpus-200B (derivado de DCLM 1b-1x, CC-BY-4.0) |
| Metodo de mezcla | RegMix con surrogate LightGBM sobre enjambre Dirichlet de 288 dominios |
| Tamaño del repositorio | 2,8 GB |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura OLMo 2 en su variante de 1B: un transformer decoder-only de 18 capas con tamaño oculto 2048 y tokenizador GPT-NeoX-20B. Los pesos se almacenan en bfloat16. No se documentan innovaciones arquitectónicas propias; el interés del trabajo reside en el pipeline de mezcla de datos, no en el diseño de la red.

El entrenamiento consumió 32.000 millones de tokens del corpus WebOrganizer, organizado en 288 dominios que combinan temática y formato. La proporción de cada dominio en el batch de entrenamiento se determinó con RegMix: se ajustó un surrogate LightGBM sobre las curvas de rendimiento de un enjambre de mezclas Dirichlet evaluadas con un modelo proxy de 60M parámetros (`credible-ai/olmo2-60M-288domains-dirichlet`), y se eligió la mezcla que maximiza HellaSwag y PIQA. El fichero `mix.json` del repositorio contiene los pesos finales. El entrenamiento se ejecutó con OLMo-core. No se documenta RLHF, DPO ni ninguna fase de alineación posterior al preentrenamiento.

## Capacidades

- Generación de texto autoregresiva en inglés, heredada del preentrenamiento sobre corpus web.
- Razonamiento de sentido común de elección múltiple, objetivo explícito de la optimización de la mezcla (HellaSwag, PIQA).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe: el modelo está etiquetado únicamente como inglés.
- No se documenta modo de razonamiento explícito (thinking), visión ni audio.
- No se documenta ninguna capacidad de instrucción: es un modelo base sin ajuste.

## Casos de uso

- Reproducción del artículo LinMix: cargar el modelo y el `mix.json` para verificar las curvas de atribución lineal de dominio descritas en el paper y comparar con las mezclas del enjambre Dirichlet.
- Estudio comparativo de métodos de mezcla de datos: usar este checkpoint como referencia entrenada con RegMix + LightGBM frente a otras mezclas del mismo corpus y presupuesto de tokens.
- Análisis de sobreoptimización de benchmarks: evaluar el modelo en tareas distintas de HellaSwag y PIQA para medir el coste de especializar la mezcla en dos benchmarks concretos.
- Investigación sobre dominios temáticos y de formato: los 288 dominios permiten estudiar qué combinaciones de temática y formato contribuyen a cada tipo de tarea, usando el modelo como sonda.
- Validación de proxies pequeños: contrastar las predicciones del modelo proxy de 60M con este modelo de 1B para calibrar la fidelidad de los surrogates en estudios de escalado de mezclas.
- Docencia y experimentación con OLMo-core: servir como ejemplo de extremo a extremo de un pipeline de preentrenamiento reproducible con OLMo 2 a pequeña escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que la mezcla se optimizó para HellaSwag y PIQA, pero no incluye las puntuaciones obtenidas por este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 2,8 GB solo para pesos, más overhead de activaciones y caché KV (el repositorio ocupa 2,8 GB).
- VRAM estimada en cuantización de 8 bits: alrededor de 1,5 GB; en 4 bits, alrededor de 0,8 GB (estimaciones por tamaño de parámetros, no publicadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bfloat16, como RTX 3060, RTX 4060, RTX 4090, A100 o H100.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 y superiores.
- Opciones de despliegue: transformers con `AutoModelForCausalLM`; el formato safetensors es compatible con vLLM y TGI, aunque no se documenta soporte verificado. Para llama.cpp u Ollama sería necesaria una conversión a GGUF no publicada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| olmo2-1B-288domains-dirichlet-lightgbm-hellaswagpiqa | 1,41B | no disponible | MIT | Mezcla de datos optimizada para HellaSwag y PIQA |
| credible-ai/olmo2-60M-288domains-dirichlet | 60M (proxy) | no disponible | no disponible | Modelo proxy del enjambre Dirichlet usado para ajustar el surrogate |
| OLMo 2 1B (AllenAI) | ~1B | no disponible en esta ficha | Apache 2.0 (modelo base original) | Modelo base de propósito general |

La comparación con el OLMo 2 1B original es la más informativa: comparten arquitectura y tokenizador, pero difieren en la mezcla de datos y en el objetivo. Las cifras de rendimiento comparadas no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Es un artefacto de investigación, no un modelo de propósito general; la model card lo declara explícitamente.
- La mezcla de datos está optimizada para HellaSwag y PIQA, lo que puede producir sobreoptimización y degradar el rendimiento en otras tareas.
- Modelo base sin ajuste por instrucciones: no sigue instrucciones de forma fiable ni mantiene formato conversacional.
- Solo inglés; no se documenta cobertura multilingüe.
- Riesgo de alucinación y de reproducir sesgos del corpus web DCLM/Common Crawl, sin filtrado ni alineación documentados.
- Longitud de contexto no documentada, lo que impide planificar su uso en tareas de contexto largo.
- Los datos de entrenamiento están sujetos a los términos de uso de Common Crawl y a la licencia CC-BY-4.0 del pool DCLM; los pesos son MIT, pero el uso comercial debe revisar esas condiciones.
- No se documentan evaluaciones de seguridad, toxicidad ni robustez.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/credible-ai/olmo2-1B-288domains-dirichlet-lightgbm-hellaswagpiqa
- Modelo proxy: https://huggingface.co/credible-ai/olmo2-60M-288domains-dirichlet
- Paper LinMix: https://arxiv.org/abs/2610.37390
- Código: https://github.com/credibleai/linmix
- Dataset WebOrganizer/Corpus-200B: https://huggingface.co/datasets/WebOrganizer/Corpus-200B
- Dataset tokenizado: https://huggingface.co/datasets/credible-ai/weborganizer-corpus-200b-tokenized
- Pool DCLM 1b-1x: https://huggingface.co/datasets/mlfoundations/dclm-pool-1b-1x
- Documentación OLMo 2 en transformers: https://huggingface.co/docs/transformers/model_doc/olmo2
- OLMo-core: https://github.com/allenai/OLMo-core
- Tokenizador GPT-NeoX-20B: https://huggingface.co/EleutherAI/gpt-neox-20b
- Términos de uso de Common Crawl: https://commoncrawl.org/terms-of-use
