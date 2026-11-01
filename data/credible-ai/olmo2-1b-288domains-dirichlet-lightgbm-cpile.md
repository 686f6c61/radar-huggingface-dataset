# credible-ai/olmo2-1B-288domains-dirichlet-lightgbm-cpile

## Resumen

olmo2-1B-288domains-dirichlet-lightgbm-cpile es un modelo de lenguaje de 1,41 mil millones de parámetros desarrollado por credible-ai como artefacto de investigación para reproducir los experimentos del artículo científico LinMix ("Data Mixing as Linear Domain Attribution", arXiv:2610.37390). El modelo está preentrenado sobre 32B de tokens del corpus WebOrganizer, mezclando 288 dominios (combinaciones de tema × formato) con pesos de mezcla optimizados mediante RegMix, que emplea un modelo LightGBM como sustituto entrenado sobre un enjambre de modelos pequeños Dirichlet, con el objetivo de minimizar los bits por byte en texto de validación de Common Pile.

Es importante subrayar que no se trata de un modelo de propósito general, sino de un experimento controlado sobre mezcla de datos en preentrenamiento. Su relevancia radica en la línea de investigación sobre optimización de data mixing (RegMix, linmix), un campo clave para entrenar modelos pequeños eficientes. La arquitectura base es OLMo 2, con 18 capas y tamaño oculto de 2048, entrenada con OLMo-core. Los pesos se publican bajo licencia MIT en formato safetensors, lo que facilita su uso y modificación en entornos de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | OLMo 2 (Olmo2ForCausalLM), transformer decoder-only |
| Parametros totales | 1.414.678.528 (1,41B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bfloat16 (pesos originales); no se publican cuantizaciones oficiales |
| Idiomas soportados | ingles (en) |
| Licencia | MIT (pesos); datos de entrenamiento CC-BY-4.0 y terminos de Common Crawl |
| Formato de pesos | safetensors (bfloat16), 2,8 GB de repo |

Datos adicionales: 18 capas, tamaño oculto 2048, tokenizador GPT-NeoX-20B con vocabulario de 50.432 tokens, 32B de tokens de entrenamiento.

## Arquitectura y entrenamiento

El modelo emplea la arquitectura OLMo 2, un transformer decoder-only desarrollado originalmente por Allen AI, implementado en la librería transformers como `Olmo2ForCausalLM`. Con 1,41B de parámetros distribuidos en 18 capas y un tamaño oculto de 2048, se trata de un modelo compacto. Utiliza el tokenizador GPT-NeoX-20B de EleutherAI, con un vocabulario de 50.432 tokens.

El entrenamiento se realizó sobre 32B de tokens con el framework OLMo-core de Allen AI. La contribución principal del experimento está en la mezcla de datos: el corpus WebOrganizer/Corpus-200B (derivado del pool DCLM 1b-1x) se clasifica en 288 dominios definidos como combinaciones de tema y formato. Los pesos de la mezcla se optimizan mediante RegMix: se entrena un enjambre de modelos pequeños (60M de parámetros, disponible en credible-ai/olmo2-60M-288domains-dirichlet) con mezclas muestreadas de una distribución Dirichlet, se ajusta un modelo sustituto LightGBM que predice los bits por byte en texto de validación de Common Pile a partir de la composición de la mezcla, y la mezcla óptima predicha se usa para el preentrenamiento del modelo de 1B. No se menciona ningún postentrenamiento tipo RLHF o DPO; es un modelo base de preentrenamiento.

## Capacidades

- Generacion de texto en ingles como modelo base (base model, sin afinado por instrucciones).
- Reproduccion de experimentos cientificos sobre mezcla de datos (data mixing) y atribucion de dominios, que es su proposito principal.
- Evaluacion de perplexidad (bits por byte) sobre texto de Common Pile.
- Punto de partida para estudios de scaling laws y composicion de datasets.
- No se anuncian capacidades de tool calling, function calling, agentes, razonamiento multi-step, vision ni audio.
- Al ser un modelo base entrenado con solo 32B de tokens, sus capacidades generales de codigo, matematicas o razonamiento son limitadas.

## Casos de uso

- Reproduccion del articulo LinMix: el modelo existe precisamente para verificar los resultados de atribucion de dominios y mezcla lineal del paper de Baniecki, Biecek y Pawelczyk.
- Investigacion en data mixing: sirve como baseline para comparar estrategias de mezcla (Dirichlet, RegMix, DoReMi, etc.) en condiciones controladas de arquitectura y tokens.
- Estudios de scaling laws: al existir un enjambre de modelos de 60M con la misma receta, permite estudiar la transferibilidad de mezclas optimizadas en modelos pequenos hacia modelos de 1B.
- Analisis de atribucion de dominios: puede usarse para investigar como la composicion tematica y de formato del corpus afecta al loss por dominio.
- Benchmarking de frameworks de entrenamiento: su receta (OLMo-core, 32B tokens, corpus tokenizado publicado) permite verificar reproducibilidad de pipelines de preentrenamiento.
- Base para experiments de continued pretraining: al ser un modelo base con licencia MIT, puede continuarse el entrenamiento sobre corpus propios para estudiar efectos de distribuciones de datos.
- Docencia y formacion: caso de estudio compacto (1,4B, entrenable en infraestructura modesta) para cursos sobre preentrenamiento de LLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica mencionada en la model card es el uso de bits por byte sobre texto de validacion de Common Pile como objetivo de optimizacion de la mezcla, sin valores numericos concretos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3 GB en bfloat16 (2,8 GB de pesos mas overhead); con cuantizacion a 8 bits o 4 bits podria reducirse a ~1,5-1 GB, aunque no hay cuantizaciones oficiales publicadas.
- GPU recomendadas: cualquier GPU de consumo con 4 GB o mas de VRAM (por ejemplo RTX 3060, RTX 4060 o superiores) es suficiente para inferencia; para reproducir el preentrenamiento de 32B tokens se requiere infraestructura multi-GPU, no detallada en la model card.
- Cabe comodamente en GPUs de consumo para inferencia, incluso en portatiles con GPU dedicada moderada.
- Opciones de despliegue: transformers (libreria nativa, con codigo de carga documentado); al estar en formato safetensors compatible con transformers, es plausible su uso con vLLM y llama.cpp si se convierte a GGUF, aunque no hay conversiones oficiales publicadas. No se menciona soporte en Ollama ni TGI.
- Latencia y throughput estimados: no disponible; al ser un modelo de 1,4B se espera latencia baja y throughput alto en GPUs de consumo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tokens de entrenamiento | Licencia | Proposito |
|---|---|---|---|---|---|
| olmo2-1B-288domains-dirichlet-lightgbm-cpile | 1,41B | no disponible | 32B | MIT | Artefacto de investigacion (data mixing, LinMix) |
| OLMo 2 1B (Allen AI) | ~1,5B | hasta 4.096 (segun version) | multiples billones | Apache 2.0 | Modelo base de proposito general |
| Qwen2.5-1.5B | 1,54B | 32.768 (131.072 con YaRN) | ~18B (segun specs) | Qwen (uso comercial con condiciones) | Modelo general con postentrenamiento |
| Llama 3.2 1B | 1,24B | 128.000 | ~15B (segun specs) | Llama Community License | Modelo general con postentrenamiento |

A diferencia de las alternativas, este modelo no compite en capacidad general: esta entrenado con 32B de tokens (un volumen muy inferior) y su valor esta en la metodologia de mezcla de datos, no en el rendimiento.

## Limitaciones y advertencias

- No es un modelo de proposito general: la propia model card advierte que es un artefacto de investigacion para reproducir experimentos de LinMix, no un asistente o modelo productivo.
- Entrenado con solo 32B de tokens, muy por debajo de los estandares actuales para modelos de 1B, por lo que la calidad de generacion sera baja y propensa a texto incoherente.
- Modelo base sin postentrenamiento: no sigue instrucciones ni ha pasado por RLHF/DPO, con el consiguiente riesgo elevado de alucinaciones y salidas sin filtro.
- Monolingue en ingles; no apto para castellano ni otros idiomas.
- Longitud de contexto no documentada en la model card.
- Los datos de entrenamiento derivan de Common Crawl (via DCLM 1b-1x), por lo que heredan sesgos de contenido web y estan sujetos a los terminos de uso de Common Crawl; los datos son CC-BY-4.0.
- Aunque los pesos son MIT (uso comercial permitido), conviene revisar los terminos de Common Crawl si se redistribuyen derivados del corpus.
- No hay benchmarks publicados ni evaluaciones de seguridad; no recomendado para produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/credible-ai/olmo2-1B-288domains-dirichlet-lightgbm-cpile
- Paper LinMix (arXiv): https://arxiv.org/abs/2610.37390
- Codigo (GitHub): https://github.com/credibleai/linmix
- Enjambre proxy de 60M: https://huggingface.co/credible-ai/olmo2-60M-288domains-dirichlet
- Corpus de entrenamiento: https://huggingface.co/datasets/WebOrganizer/Corpus-200B
- Corpus tokenizado: https://huggingface.co/datasets/credible-ai/weborganizer-corpus-200b-tokenized
- Pool DCLM 1b-1x: https://huggingface.co/datasets/mlfoundations/dclm-pool-1b-1x
- Framework de entrenamiento OLMo-core: https://github.com/allenai/OLMo-core
- Documentacion de OLMo 2 en transformers: https://huggingface.co/docs/transformers/model_doc/olmo2
- Tokenizador GPT-NeoX-20B: https://huggingface.co/EleutherAI/gpt-neox-20b
