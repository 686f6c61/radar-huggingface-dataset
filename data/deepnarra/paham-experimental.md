# DeepNarra/Paham-Experimental

## Resumen

DeepNarra Paham-Experimental es la variante experimental de investigación de DeepNarra/Paham, un modelo de generación de texto conversacional de aproximadamente 951,7 millones de parámetros (dato real de safetensors) diseñado para aprendizaje continuo en el borde (edge). Su rasgo distintivo es el sistema de "3-Tier Awake/Sleep Continuum": en lugar de modificar los pesos cuantizados durante la inferencia, separa la interacción con el usuario (fase "despierto") de la consolidación de conocimiento (fase "sueño"), inspirándose en la consolidación hipocampal de la memoria biológica.

El problema que resuelve es el olvido catastrófico y la degradación del rendimiento en modelos que intentan aprender de forma continua durante la inferencia. Paham-Experimental lo aborda con tres niveles: pesos rápidos recurrentes en tiempo real (Tier 1), adaptadores QLoRA laterales entrenados en reposo (Tier 2) y ajuste del enrutado MoE sobre 92 sub-expertos (Tier 3), con una consolidación nocturna que re-cuantiza el modelo a un GGUF ternario nativo de 1,58 bits (TQ1_0).

Es relevante porque combina cuantización extrema (BitNet b1.58), arquitectura híbrida MoE con recurrencia GLA y un pipeline de entrenamiento autónomo sin dependencias de APIs externas, orientado a despliegues soberanos en dispositivos de borde. El repo pesa 2.259,1 GB y acumula más de 5.700 descargas. El modelo está licenciado bajo Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: recurrencia GLA (gated linear attention) con MoE de 92 sub-expertos y cuantización ternaria BitNet b1.58 |
| Parametros totales | 951.701.100 (dato real de safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | TQ1_0 (ternaria nativa de 1,58 bits); Tier 2 usa QLoRA (r=8, alpha=16) |
| Idiomas soportados | Ingles y multilingue (etiquetas "en" y "multilingual"; lista concreta de idiomas no disponible) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (ternario TQ1_0) y safetensors |

## Arquitectura y entrenamiento

La arquitectura combina varios componentes poco habituales. En fase despierta, el modelo base en GGUF se ejecuta congelado, mientras el Tier 1 mantiene un estado de pesos rapidos recurrentes en buffers de la pasada hacia adelante (S_t, con menos de 5 MB de coste de memoria), actualizado mediante una recurrencia tipo GLA (S_{t+1} = decay * S_t + k_t v_t) sin retropropagacion. Las interacciones de alto valor y las correcciones del usuario se encolan en un buffer no bloqueante para su uso posterior.

En fase de sueño (sistema inactivo o conectado a corriente), se ejecuta la consolidacion: un replay hipocampal con proporcion 75 % de "anclas doradas" de pre-entrenamiento y 25 % de interacciones reales; el Tier 2 entrena adaptadores Sidecar-QLoRA de rango 8 (r=8, alpha=16) con inicializacion B=0 para derivada cero ("zero-drift"); y el Tier 3 ajusta los priors de gating del enrutador MoE sobre los 92 sub-expertos sin alterar los cuerpos de los expertos. Finalmente, los deltas QLoRA se pliegan en las representaciones principales y se re-cuantiza un GGUF ternario nativo (model-TQ1_0.gguf) que se usa en el siguiente arranque.

Los datos de entrenamiento referenciados en la model card incluyen HuggingFaceFW/fineweb-edu (texto educativo web), CohereForAI/aya_collection (multilingue), m-a-p/CodeFeedback-Filtered-Instruction (codigo) y HuggingFaceH4/no_robots (instrucciones conversacionales). El numero total de tokens de pre-entrenamiento no esta disponible. El pipeline de entrenamiento autonomo incluye un "gym" de auto-juego con 7 pilares: sandbox de codigo Python con validacion AST, matematicas formales con SymPy, dinamica hamiltoniana simpléctica (verificacion de conservacion de energia con Delta E < 10^-13), psicologia cognitiva y desescalada empatica, metacognicion epistemica y planificacion estrategica con DAGs. No se detalla si hubo RLHF o DPO.

## Capacidades

- Generacion de texto conversacional (pipeline text-generation, etiqueta "conversational").
- Aprendizaje continuo en el dispositivo: el modelo incorpora conocimiento nuevo de las interacciones sin reentrenamiento completo, mediante el ciclo despierto/sueno.
- Adaptacion en tiempo real mediante pesos rapidos recurrentes (Tier 1) con menos de 5 MB de estado adicional.
- Razonamiento matematico formal: el entrenamiento autonomo incluye resolucion de EDOs no lineales, integrales multivariable y sistemas lineales con verificacion simbolica (SymPy).
- Generacion y validacion de codigo Python en sandbox con verificacion de salida en tiempo de ejecucion.
- Planificacion multi-paso: generacion de DAGs de prerequisitos con validacion de orden topologico, util para razonamiento de agentes.
- Metacognicion epistemica: calibracion de umbrales de confianza para marcar salidas inciertas.
- Capacidades multilingues (dataset Aya Collection), aunque la lista concreta de idiomas no esta disponible.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Vision y audio: no disponibles; el modelo es de solo texto.

## Casos de uso

- Asistentes personales en dispositivos de borde con memoria persistente: el ciclo despierto/sueno permite que el asistente incorpore correcciones y preferencias del usuario durante la noche y arranque al dia siguiente con el GGUF re-cuantizado, sin enviar datos a la nube.
- Atencion al cliente en local: la interaccion activa se ejecuta con el modelo base congelado a alta velocidad, mientras las correcciones de los agentes humanos se consolidan en background, mejorando el modelo de forma continua sin despliegues manuales.
- Despliegues soberanos y privados: el entrenamiento autonomo funciona 100 % offline y en memoria, sin dependencias de APIs comerciales (sin OpenAI, Anthropic ni Google), adecuado para entornos con restricciones de datos.
- Dispositivos con recursos limitados: la cuantizacion ternaria de 1,58 bits reduce drasticamente el tamano del GGUF, permitiendo inferencia en hardware modesto.
- Generacion de codigo con validacion: el sandbox AST con verificacion de stdout permite integrarlo en flujos de prototipado de codigo donde la ejecucion verificada importa.
- Razonamiento matematico y cientifico: la verificacion simbolica con SymPy y la dinamica hamiltoniana simpléctica lo orientan a tareas de calculo y fisica computacional.
- Planificacion de tareas multi-paso para agentes: la generacion y validacion de DAGs de prerequisitos sirve para descomponer objetivos complejos en pasos ejecutables en orden topologico.
- Aplicaciones de bienestar y psicologia: el entrenamiento incluye reframing de distorsiones cognitivas TCC (catastrofismo, lectura de mente, pensamiento blanco y negro), util para chatbots de desescalada empatica (con las cautelas eticas propias del caso).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card menciona cifras de rendimiento operativo (mas de 1.000 tokens/s en inferencia con el GGUF congelado y "Fallback Drift 0.00e+00" en la consolidacion), pero no especifica el hardware de medicion ni la metodologia, por lo que deben tomarse con cautela.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible como cifra exacta; con 951,7 millones de parametros y cuantizacion ternaria de 1,58 bits, el GGUF resultante ocuparia del orden de cientos de MB, lo que sugiere que cabe en GPUs de consumo modestas e incluso en CPUs. Esta estimacion no esta confirmada en la model card.
- GPU recomendadas: no disponible; el proyecto esta orientado a edge, por lo que no requiere necesariamente GPUs de centro de datos.
- Consumer GPU: probablemente compatible dada la cuantizacion TQ1_0, aunque no hay requisitos oficiales publicados.
- Opciones de despliegue: GGUF ternario nativo (compatible con ecosistemas tipo llama.cpp/Ollama en principio, aunque no se confirma explicitamente); el pipeline de entrenamiento autonomo se distribuye como notebook de 3 celdas (Paham_Experimental_GGUF_Trainer.ipynb) con checkpointing atomico y auto-commit de artefactos al repositorio.
- Latencia y throughput: la model card afirma mas de 1.000 tokens/s en fase despierta con el GGUF congelado; no se especifica hardware de referencia.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Cuantizacion | Aprendizaje continuo | Licencia |
|---|---|---|---|---|---|---|
| DeepNarra Paham-Experimental | 951,7 M (dato safetensors) | Hibrida GLA + MoE (92 expertos) | no disponible | Ternaria TQ1_0 (1,58 bits) | Si (3-tier awake/sleep) | Apache-2.0 |
| DeepNarra Paham (variante base) | no disponible | Similar (variante no experimental) | no disponible | TQ1_0 | no disponible | Apache-2.0 |
| Qwen2.5-0.5B-Instruct | 494 M | Transformer denso | 32.768 tokens (128k con YaRN) | multiples (GGUF, AWQ, etc.) | No | Apache-2.0 |
| Llama 3.2 1B Instruct | 1.240 M | Transformer denso | 128.000 tokens | multiples (GGUF, etc.) | No | Licencia Llama 3.2 |

Paham-Experimental se diferencia de los modelos densos comparables de tamano similar en su enfoque de aprendizaje continuo y cuantizacion ternaria nativa; a cambio, no publica benchmarks estandarizados ni longitud de contexto, lo que dificulta la comparacion directa de calidad.

## Limitaciones y advertencias

- Es un modelo experimental de investigacion: no hay benchmarks estandarizados publicados, por lo que su calidad de generacion no puede contrastarse con modelos de referencia.
- La cifra de mas de 1.000 tokens/s no incluye hardware ni metodologia de medicion; verificarla en el entorno propio antes de tomar decisiones.
- El tamano del repositorio (2.259,1 GB) es muy superior al de los pesos del modelo (~1 GB), probablemente por el historial de checkpoints auto-commiteados del entrenamiento autonomo; la clonacion completa puede ser costosa.
- Riesgo de alucinacion: aunque el entrenamiento incluye metacognicion epistemica para calibrar confianza, no hay evaluaciones publicadas que cuantifiquen este riesgo.
- Sesgos: entrenado con fineweb-edu, Aya Collection, CodeFeedback y no_robots; puede heredar los sesgos de esos corpus. No se publican evaluaciones de sesgo.
- Idiomas: etiquetado como ingles y multilingue, pero la lista concreta de idiomas soportados no esta disponible; el castellano no esta garantizado explicitamente.
- El ciclo de re-cuantizacion y auto-commit al repositorio implica que los pesos pueden cambiar con el tiempo sin versionado semantico evidente; fijar revisiones concretas en produccion.
- Licencia Apache-2.0: permite uso comercial, pero el proyecto declara un ecosistema "sovereign" con marcas y badges propios; revisar cualquier termino adicional antes de uso comercial serio.
- Capacidades de tool calling, vision y audio: no disponibles o no documentadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DeepNarra/Paham-Experimental
- Variante base DeepNarra/Paham: https://huggingface.co/DeepNarra/Paham
- Organizacion DeepNarra: https://huggingface.co/DeepNarra
- Notebook de entrenamiento autonomo: https://github.com/DeepNarra (repositorio referenciado en la model card; URL exacta del notebook no disponible)
- Datasets de entrenamiento:
  - https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
  - https://huggingface.co/datasets/CohereForAI/aya_collection
  - https://huggingface.co/datasets/m-a-p/CodeFeedback-Filtered-Instruction
  - https://huggingface.co/datasets/HuggingFaceH4/no_robots
- Paper tecnico, demo y blog: no disponibles en la informacion proporcionada.
