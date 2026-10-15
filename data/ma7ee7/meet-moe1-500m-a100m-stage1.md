# Ma7ee7/Meet-MoE1-500M-A100M-Stage1

## Resumen

Meet-MoE1-500M-A100M-Stage1 es un modelo de lenguaje experimental de tipo Mixture of Experts (MoE) desarrollado por el usuario Ma7ee7 bajo la arquitectura nativa Qwen3MoeForCausalLM, entrenado desde inicializacion aleatoria. Con 499.332.352 parametros totales y aproximadamente 101.201.152 parametros activos por token, se situa en la gama de modelos pequenos de tipo MoE, con una relacion de activacion cercana al 20 por ciento del total. Se trata de un "base model" o modelo de continuacion de texto, no ajustado por instrucciones, por lo que su uso directo esta orientado a experimentacion y a servir de punto de partida para futuros ajustes.

El modelo ha sido entrenado con 250.085.376 predicciones de siguiente token, una cifra muy reducida en terminos absolutos, y su contexto de entrenamiento en esta primera etapa es de 2.048 posiciones, aunque el campo `max_position_embeddings` esta configurado a 65.536 sin que se haya entrenado ni evaluado contexto largo fiable. La tokenizacion emplea un BPE a nivel de byte personalizado de 32.768 tokens que no es intercambiable con los tokenizadores oficiales de Qwen3, lo que limita la reutilizacion directa de herramientas asociadas a la familia Qwen.

Su relevancia es fundamentalmente academica y tecnica: es un ejemplo publico de un MoE muy pequeno entrenado con el optimizador Muon para matrices bidimensionales de expertos y atencion, con AdamW en el resto, y con una estrategia de balanceo de router por capas. La ficha del autor lo etiqueta explicitamente como experimental y no incluye resultados de benchmarks, licencia declarada ni idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3MoeForCausalLM (transformer MoE, decoder-only) |
| Parametros totales | 499.332.352 |
| Parametros activos | 101.201.152 (aproximado, top-2 de 20 expertos por capa) |
| Longitud de contexto | 2.048 posiciones entrenadas; `max_position_embeddings` configurado a 65.536 (no entrenado ni evaluado) |
| Tipos de cuantizacion | no disponible (solo pesos safetensors en el repositorio) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Qwen3MoeForCausalLM, un transformer decoder-only con capas de Mixture of Experts. Consta de 20 capas, cada una con 20 expertos y enrutamiento top-2, lo que da lugar a aproximadamente 101 millones de parametros activos sobre un total de 499 millones. El entrenamiento se realizo desde inicializacion aleatoria (no es un ajuste fino de un checkpoint Qwen3 preentrenado), con 250.085.376 predicciones de siguiente token y una ventana de prediccion de 2.048 posiciones en esta primera etapa.

La innovacion tecnica destacada es el uso de Muon como optimizador para las matrices bidimensionales de atencion y de expertos, dejando AdamW para el resto de parametros. Ademas, se aplico un balanceo de router por capas (layer-wise router balancing) tras corregir el objetivo global original. La composicion del dataset de entrenamiento es IFM/TxT360-v2 al 90 por ciento, IFM/Code-Reasoning al 7 por ciento e IFM/Math-Reasoning al 3 por ciento; el autor advierte que las licencias y la procedencia de esos datasets deben verificarse por separado. El tokenizador es un BPE a nivel de byte personalizado de 32.768 tokens, incompatible con los tokenizadores oficiales de Qwen3. La version de `transformers` empleada es 4.57.6.

## Capacidades

- Generacion de texto por continuacion: al ser un modelo base, completa secuencias a partir de un prefijo sin instrucciones ni formato conversacional.
- Razonamiento basico y generacion de codigo y matematicas: el dataset incluye un 7 por ciento de Code-Reasoning y un 3 por ciento de Math-Reasoning, por lo que existe una exposicion limitada a estos dominios, sin garantia de calidad por el escaso volumen de entrenamiento.
- Soporte de tool calling / function calling: no disponible; no se menciona entrenamiento para llamadas a herramientas.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo no esta ajustado para flujos agenticos.
- Capacidades multilingues: no disponible; no se declara idioma alguno en la model card.
- Capacidad especial: arquitectura MoE con activacion dispersa top-2 de 20 expertos por capa, orientada a eficiencia computacional por token.
- Modo thinking: no disponible.
- Vision y audio: no disponibles; el modelo es exclusivamente de texto.

## Casos de uso

- Investigacion sobre enrutamiento MoE: el modelo permite estudiar el comportamiento del router con 20 expertos por capa y top-2, asi como evaluar la estrategia de balanceo por capas aplicada durante el entrenamiento.
- Experimentacion con el optimizador Muon: sirve como caso practico para analizar el efecto de Muon sobre matrices de atencion y de expertos en un modelo pequeno y entrenable en pocos recursos.
- Punto de partida para ajuste fino: al ser un base model de 500 millones de parametros, puede usarse como inicializacion para experimentos de SFT o DPO sobre dominios concretos, siempre que se utilice su tokenizador personalizado.
- Pruebas de tokenizadores BPE a nivel de byte: el tokenizador propio de 32.768 tokens permite comparar el impacto de la tokenizacion en modelos MoE pequenos frente a esquemas estandar.
- Benchmarking educativo de MoE vs denso: con 499M totales y 101M activos, es util para comparar el coste por token de un MoE pequeno frente a un transformer denso de tamano similar.
- Validacion de pipelines con `transformers`: al cargarse con `Qwen3MoeForCausalLM` en `transformers==4.57.6`, sirve para verificar integraciones y flujos de despliegue con esa version concreta.
- Generacion de texto de dominio general a pequena escala: puede emplearse para continuacion de texto en entornos de prueba donde la calidad no sea critica y se acepte la posibilidad de salidas repetitivas o incoherentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye metricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion estandar, y advierte que el contexto de 65K es una configuracion y no una afirmacion respaldada por pruebas.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: en torno a 1,0 GB para los pesos (499M parametros), mas overhead de activaciones y cache KV, que con 2.048 posiciones de contexto es reducido.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 0,5 GB de pesos (la cuantizacion no esta publicada como artefacto, pero es viable tecnicamente).
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 0,3 GB de pesos.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; cabe sin problema en RTX 3060, RTX 4060, RTX 4090, e incluso en GPUs de gama de entrada con 4-6 GB de VRAM.
- Cabe en consumer GPU: si, con amplio margen, dado el reducido numero de parametros totales y activos.
- Opciones de despliegue: `transformers` con `Qwen3MoeForCausalLM` (version 4.57.6). No se han publicado pesos GGUF, por lo que llama.cpp u Ollama requeririan una conversion manual. El soporte en vLLM o TGI no esta confirmado en la informacion disponible, ya que habria que validar la compatibilidad con este tokenizador personalizado.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No hay modelos directamente comparables en el mismo rango de parametros dentro de la informacion proporcionada. A modo de referencia de la categoria MoE pequena, se incluyen algunos modelos publicos de mayor escala, cuyos datos deben verificarse en sus fuentes originales:

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia |
|---|---|---|---|---|
| Meet-MoE1-500M-A100M-Stage1 | 499M | ~101M | 2.048 entrenadas | no disponible |
| OLMoE-1B-7B | ~6,9B | ~1,3B | 4.096 | Apache 2.0 |
| Qwen1.5-MoE-A2.7B | ~14,3B | ~2,7B | 32.768 | Apache 2.0 |
| DeepSeek-V2-Lite | ~15,7B | ~2,4B | 32.768 | DeepSeek License |

La comparacion directa no es posible porque Meet-MoE1 es entre uno y dos ordenes de magnitud mas pequeno que estos modelos y no dispone de benchmarks publicados.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no responde a comandos ni a formatos conversacionales; genera continuaciones de texto.
- Volumen de entrenamiento muy reducido: 250 millones de tokens, lo que limita severamente la calidad y la coherencia de las salidas.
- Riesgo de alucinacion y de texto incorrecto, sesgado o repetitivo: advertido explicitamente por el autor en la model card.
- Contexto largo no fiable: aunque `max_position_embeddings` sea 65.536, solo se entrenaron 2.048 posiciones y no se evaluo el comportamiento en ventanas mayores.
- Tokenizador incompatible: el BPE propio de 32.768 tokens no es intercambiable con los tokenizadores oficiales de Qwen3, lo que rompe la compatibilidad con herramientas y plantillas de esa familia.
- Licencia no declarada: al no especificarse licencia, no hay autorizacion clara para uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- Idiomas no declarados: se desconoce la cobertura linguistica real y no hay garantia de comportamiento correcto fuera del ingles o de los idiomas presentes en los datasets de entrenamiento.
- Procedencia de los datos sin verificar: el propio autor recomienda comprobar de forma independiente las licencias y la trazabilidad de IFM/TxT360-v2, IFM/Code-Reasoning e IFM/Math-Reasoning.
- Naturaleza experimental: etiquetado como experimental, sin benchmarks, sin descargas ni interacciones registradas en el momento de la consulta.
- Dependencia de version: requiere `transformers==4.57.6` para reproducir el comportamiento documentado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Ma7ee7/Meet-MoE1-500M-A100M-Stage1
- Perfil de datasets del autor: https://huggingface.co/Ma7ee7/datasets
- Coleccion Meet7 del autor: https://huggingface.co/collections/Ma7ee7/meet7
