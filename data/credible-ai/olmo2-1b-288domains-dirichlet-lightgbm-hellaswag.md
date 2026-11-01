# credible-ai/olmo2-1B-288domains-dirichlet-lightgbm-hellaswag

## Resumen

olmo2-1B-288domains-dirichlet-lightgbm-hellaswag es un modelo de lenguaje de 1,41 mil millones de parámetros desarrollado por credible-ai como artefacto de investigación para reproducir los experimentos del paper de LinMix ("LinMix: Data Mixing as Linear Domain Attribution", arXiv:2610.37390). No se trata de un modelo de uso general, sino de un experimento controlado sobre mezcla de datos de preentrenamiento: el modelo se ha preentrenado con 32B de tokens del corpus WebOrganizer, distribuidos sobre 288 dominios (tema × formato) cuyos pesos de mezcla se han optimizado mediante RegMix con un sustituto LightGBM, tomando HellaSwag como benchmark objetivo.

Su relevancia reside en el estudio sistemático de cómo la composición del dataset de preentrenamiento afecta al rendimiento posterior. Para ello se entrenó un enjambre (swarm) de modelos proxy de 60M de parámetros con distintas mezclas Dirichlet sobre los 288 dominios, se ajustó un modelo sustituto LightGBM que predice el benchmark a partir de la mezcla, y se optimizó la mezcla final para entrenar este modelo de 1B. La arquitectura es OLMo 2 (18 capas, tamaño oculto 2048) y el tokenizador es GPT-NeoX-20B con un vocabulario de 50.432 tokens. Es relevante para investigadores en data curation y mixing de datos, no para aplicaciones de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | OLMo 2 (`Olmo2ForCausalLM`), transformer decoder-only |
| Parametros totales | 1.414.678.528 |
| Parametros activos | no disponible (no es MoE; todos los parametros activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT (pesos); datos de entrenamiento CC-BY-4.0 y terminos de Common Crawl |
| Formato de pesos | safetensors (bfloat16), tamano del repo 2,8 GB |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura OLMo 2 de AI2, un transformer decoder-only con 18 capas y tamaño oculto de 2048, implementada como `Olmo2ForCausalLM` en la librería `transformers` de Hugging Face. Utiliza el tokenizador GPT-NeoX-20B con una longitud de vocabulario de 50.432 tokens. El preentrenamiento se realizó con 32B de tokens usando el framework OLMo-core.

La innovación central del experimento no es arquitectónica sino de curación de datos. Los datos proceden de WebOrganizer/Corpus-200B (derivado del pool DCLM 1b-1x), clasificados en 288 dominios resultantes del cruce de tema y formato. Los pesos de la mezcla se optimizaron con RegMix: se entrenó un enjambre de modelos proxy de 60M de parámetros (credible-ai/olmo2-60M-288domains-dirichlet) con mezclas muestreadas de una distribución Dirichlet, se ajustó un sustituto LightGBM que predice HellaSwag a partir de la mezcla, y se seleccionó la mezcla que maximiza esa predicción. No hay información disponible sobre RLHF, DPO ni ajuste por instrucciones: es un modelo de base preentrenado.

## Capacidades

- Generacion de texto en ingles como modelo de base (completion), sin ajuste por instrucciones
- Evaluacion de benchmarks de sentido comun como HellaSwag, objetivo directo de la optimizacion de la mezcla
- Reproduccion de experimentos de mezcla de datos (data mixing) en investigacion de preentrenamiento
- Analisis de atribucion de dominios: el repositorio incluye `mix.json`, que documenta la mezcla exacta de datos de entrenamiento
- No dispone de tool calling, function calling, capacidades de agente, vision ni audio
- No esta orientado a uso conversacional ni multilingue

## Casos de uso

- Reproduccion del paper LinMix: investigadores pueden descargar pesos, `mix.json` y el corpus tokenizado para verificar los resultados del articulo
- Estudio de RegMix y metodos de optimizacion de mezclas: sirve como punto de partida para comparar sustitutos (LightGBM frente a otros regresores) en la prediccion de benchmarks
- Investigacion en data curation: permite analizar como la distribucion tema × formato de WebOrganizer influye en capacidades emergentes
- Entrenamiento de modelos proxy: junto con el swarm de 60M, facilita experimentos de escalado de leyes sobre mezclas de datos
- Baseline para ablations: su rendimiento en HellaSwag puede compararse con variantes del mismo modelo entrenadas con mezclas distintas
- Docencia y formacion: caso practico completo y abierto (MIT) de un pipeline de preentrenamiento con mezcla optimizada, desde el corpus hasta los pesos finales

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que la mezcla se optimizo para HellaSwag, pero no incluye la puntuacion obtenida por este modelo ni comparativas numericas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3 GB en bfloat16 (1,41B de parametros a 2 bytes por parametro, mas overhead de activaciones); con cuantizacion a 8 bits, alrededor de 1,5-2 GB
- GPU recomendadas: cualquier GPU moderna con al menos 4-6 GB de VRAM; no se requiere hardware de datacenter (A100/H100) para inferencia
- Cabe comodamente en GPUs de consumo como la RTX 3060 de 12 GB, RTX 4060 Ti o RTX 4090; incluso es ejecutable en CPU para pruebas lentas
- Despliegue: carga directa con `transformers` (`AutoModelForCausalLM`); por su naturaleza de artefacto de investigacion, no hay soporte documentado para vLLM, TGI, llama.cpp ni Ollama, aunque la arquitectura OLMo 2 esta integrada en `transformers`
- Latencia y throughput: no disponible

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Datos de preentrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| olmo2-1B-288domains-dirichlet-lightgbm-hellaswag | 1,41B | no disponible | 32B tokens, WebOrganizer (288 dominios, mezcla RegMix) | MIT | pesos abiertos en Hugging Face |
| OLMo 2 1B (AI2) | ~1,5B | hasta 4.096 tokens (segun version) | hasta varios billones de tokens, mezcla estandar de AI2 | Apache 2.0 | pesos, datos y codigo abiertos |
| Pythia 1.4B (EleutherAI) | 1,4B | 2.048 tokens | ~300B tokens, The Pile | Apache 2.0 | pesos abiertos, checkpoints intermedios |
| OLMo 2 1B variants del mismo swarm (credible-ai) | 1,41B | no disponible | 32B tokens, mezclas Dirichlet alternativas | MIT | pesos abiertos en Hugging Face |

La diferencia clave frente a OLMo 2 1B estandar o Pythia 1.4B es que este modelo no busca maximo rendimiento general, sino servir como punto de comparacion controlado en experimentos de mezcla de datos.

## Limitaciones y advertencias

- No es un modelo de uso general: la propia model card advierte que es un artefacto de investigacion y no debe emplearse en aplicaciones de produccion
- Modelo de base sin ajuste por instrucciones ni alineacion: no sigue instrucciones de forma fiable y puede generar texto incoherente u ofensivo
- Riesgo de alucinacion alto, tipico de modelos de base de 1B entrenados con solo 32B de tokens (muy por debajo de los trillones habituales en modelos de produccion)
- Entrenado exclusivamente en ingles; no apto para castellano ni otros idiomas
- Los datos de entrenamiento derivan de Common Crawl y heredan sus sesgos; el uso esta sujeto a los terminos de Common Crawl y a la licencia CC-BY-4.0 del corpus DCLM
- Longitud de contexto no documentada en la model card; debe verificarse en la configuracion del modelo antes de usos con secuencias largas
- La mezcla se optimizo para HellaSwag, por lo que el rendimiento en otras tareas puede estar degradado respecto a mezclas genericas
- Licencia MIT en los pesos: permite uso comercial, pero las obligaciones de atribucion de los datos de entrenamiento (CC-BY-4.0) siguen aplicando a derivados del dataset

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/credible-ai/olmo2-1B-288domains-dirichlet-lightgbm-hellaswag
- Paper LinMix (arXiv): https://arxiv.org/abs/2610.37390
- Codigo (GitHub): https://github.com/credibleai/linmix
- Enjambre de modelos proxy: https://huggingface.co/credible-ai/olmo2-60M-288domains-dirichlet
- Corpus de entrenamiento: https://huggingface.co/datasets/WebOrganizer/Corpus-200B
- Corpus tokenizado: https://huggingface.co/datasets/credible-ai/weborganizer-corpus-200b-tokenized
- Pool DCLM original: https://huggingface.co/datasets/mlfoundations/dclm-pool-1b-1x
- Documentacion de la arquitectura OLMo 2 en transformers: https://huggingface.co/docs/transformers/model_doc/olmo2
- Framework de entrenamiento OLMo-core: https://github.com/allenai/OLMo-core
- Tokenizador GPT-NeoX-20B: https://huggingface.co/EleutherAI/gpt-neox-20b
- Terminos de uso de Common Crawl: https://commoncrawl.org/terms-of-use
