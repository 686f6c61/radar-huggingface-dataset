# flaviussteff/base-ro-125m

## Resumen

Base-Ro-125M es un modelo de lenguaje causal en rumano desarrollado por el usuario flaviussteff, entrenado desde cero ("Token Zero") sobre texto web rumano. Se trata de un modelo base (no ajustado por instrucciones) con arquitectura LLaMA, 12 capas, hidden size de 768 y una ventana de contexto de 1.024 tokens. Su funcion declarada es servir como modelo de control (baseline) en el trabajo de fin de grado "Model Raising from Token Zero: Adapting Synthetic Pre-training Paths (SPP) for Romanian Generative LLMs and Evaluating Societal Bias Resilience", desarrollado en la Facultad de Matematicas y Ciencias de la Computacion de la Universidad de Bucarest.

El modelo se publica con licencia MIT y un unico idioma soportado (rumano), con un tokenizador BPE de 16.384 entradas disenado especificamente para los diacriticos rumanos (ș, ț, ă, î, â). Su relevancia es acotada: no compite en rendimiento generalista con modelos multilingues modernos, sino que aporta un punto de referencia reproducible para estudiar como se comportan las trayectorias de preentrenamiento sinteticas y los sesgos socioculturales en modelos pequenos de una lengua de recursos medios como el rumano.

Hay que senalar una discrepancia relevante en la informacion disponible: el repo de safetensors declara 88.099.584 parametros, mientras que la model card afirma 124.789.248 (~124,8M). El nombre del modelo (125M) y las descargas/likes registrados (0 en ambos casos) indican que se trata de una publicacion academica sin validacion comunitaria hasta la fecha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaMA causal decoder (`LlamaForCausalLM`) |
| Parametros totales | 124.789.248 segun model card; 88.099.584 segun los pesos safetensors publicados (discrepancia no resuelta) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (no se publican archivos GGUF, AWQ ni GPTQ; el repo contiene unicamente safetensors, ~0,4 GB) |
| Idiomas soportados | rumano (ro) |
| Licencia | MIT |
| Formato de pesos | safetensors (transformers) |
| Hidden size (d_model) | 768 |
| Intermediate size (SwiGLU) | 2.048 |
| Capas | 12 |
| Cabezas de atencion | 12 query / 4 key-value (GQA 3:1) |
| Codificacion posicional | RoPE (Rotary Position Embedding) |
| Normalizacion | RMSNorm (epsilon = 1e-5) |
| Vocabulario | 16.384 tokens BPE optimizado para diacriticos rumanos |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder denso de estilo LLaMA moderno: 12 bloques con RMSNorm pre-normalizacion, activacion SwiGLU en el MLP, RoPE para posiciones y atencion con Grouped-Query Attention en proporcion 3:1 (12 cabezas de query frente a 4 de key-value), lo que reduce el coste de cache KV respecto a atencion multi-cabeza completa. El vocabulario BPE de 16.384 entradas esta ajustado a los caracteres especificos del rumano, lo que mejora la eficiencia de tokenizacion frente a vocabularios multilingues genericos.

El preentrenamiento se realizo integramente desde cero sobre un corpus de texto web rumano depurado compuesto por Wikipedia en rumano, cinco anos de archivos de noticias (HotNews, Digi24, G4Media) y shards rumanos de FineWeb-2. Se procesaron 655.360.000 tokens en 10.000 pasos con batch efectivo de 64 secuencias y contexto de 1.024, en una unica NVIDIA RTX 3060 de 12 GB con precision mixta BF16 y FlashAttention via SDPA. El entrenamiento duro aproximadamente 10 horas y 5 minutos (unas 18.033 tokens/segundo) y finalizo con una loss de 3,0021 y una perplejidad de 20,13. No se documenta ninguna fase de ajuste por instrucciones, RLHF ni DPO, ni innovaciones de decodificacion (especulativa, atencion lineal o SSM).

## Capacidades

- Generacion de texto causal en rumano: continuacion de prompt, redaccion de parrafos y texto libre con coherencia local.
- Modelado de lenguaje base: util para medir perplejidad, comparar trayectorias de preentrenamiento y experimentar con curricula de datos.
- Tokenizacion eficiente de rumano con diacriticos, lo que reduce la fragmentacion de palabras propias del idioma.
- Inferencia ligera en hardware de gama baja gracias a su tamano reducido y a la cache KV comprimida por GQA.
- No soporta tool calling ni function calling: es un modelo base sin ajuste instructivo ni plantilla de chat.
- No tiene capacidades de agente, razonamiento multi-paso deliberado ni modo "thinking".
- No dispone de vision, audio ni entrada multimodal.
- El multilingue es inexistente: solo rumano, sin entrenamiento declarado en ingles u otras lenguas.

## Casos de uso

- Investigacion academica sobre sesgos: el modelo se diseno como baseline para medir preferencia estereotipica con el benchmark paralelo rumano-ingles de 37 pares contrafactuales, por lo que es directamente util para replicar y extender ese tipo de evaluacion.
- Modelo de control en experimentos de preentrenamiento: sirve para comparar el efecto de trayectorias sinteticas (SPP) frente a un preentrenamiento puramente web, manteniendo constantes arquitectura, corpus y presupuesto de tokens.
- Generacion de texto rumano de bajo coste: continuacion de parrafos, resumenes extractivos simples o generacion de titulares donde no se requiere instruction following, ejecutable en una GPU integrada o incluso en CPU.
- Prototipado y ensenanza: por su tamano (menos de 0,5 GB en disco) es adecuado para cursos o practicas donde se quiere demostrar el ciclo completo de entrenamiento de un LLM desde cero en una sola GPU de consumo.
- Experimentos de tokenizacion para lenguas minorizadas: el vocabulario BPE especifico para diacriticos rumanos permite estudiar el impacto de la tokenizacion en el rendimiento de idiomas de recursos medios.
- Ajuste fino posterior (fine-tuning) como punto de partida: dado que es un modelo base, se puede aplicar SFT o LoRA para tareas concretas en rumano (clasificacion, extraccion, generacion controlada) sin partir de cero.
- Evaluacion de robustez de sesgos en produccion de contenidos: antes de desplegar cualquier sistema rumano, este modelo puede usarse como sonda para identificar asociaciones estereotipicas en el corpus web rumano subyacente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni equivalentes) en la informacion disponible. El unico conjunto de resultados documentado es la evaluacion de sesgo sociocultural sobre 37 pares contrafactuales paralelos rumano-ingles:

| Metrica | Resultado | Referencia |
|---|---|---|
| Overall Stereotype Preference Metric (SPM) | 56,76% | 50,0% = neutral |
| Gender & Occupation (SPM) | 90,0% | 50,0% = neutral |
| Minority Framing (SPM) | 62,5% | 50,0% = neutral |
| Perplejidad (preentrenamiento) | 20,13 | menor es mejor |
| Loss final de preentrenamiento | 3,0021 | menor es mejor |

No hay datos publicados de comparacion con otros modelos en este mismo benchmark, ni cifras de latencia o throughput de inferencia.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en BF16/FP16 (unos 176 MB de pesos si se confirman los 88,1M parametros; unos 250 MB si se confirman los 124,8M), mas la cache KV de 1.024 tokens, que es despreciable.
- Almacenamiento: el repo ocupa aproximadamente 0,4 GB, coherente con pesos en precision completa o BF16.
- GPU recomendadas: cualquier GPU con mas de 2 GB de VRAM. El propio autor entreno el modelo (no solo inferencia) en una unica RTX 3060 de 12 GB, por lo que una RTX 3060, RTX 4060, RTX 4090, A100 o H100 lo ejecutan con enorme holgura; las GPU de datacenter estan completamente sobredimensionadas para este tamano.
- Cabe en GPU de consumo: si, en practicamente todas las de los ultimos diez anos, asi como en CPU, iGPU y placas tipo Raspberry Pi o Jetson.
- Opciones de despliegue: transformers (`AutoModelForCausalLM`) es la via directa y documentada. vLLM, TGI y Ollama son viables, pero requeririan conversion previa, ya que el repositorio no publica pesos GGUF ni formatos preempaquetados.
- Latencia y throughput estimados: no disponibles para inferencia. El unico dato publico es la velocidad de entrenamiento, 18.033 tokens/segundo en una RTX 3060 12 GB.

## Comparativa con modelos similares

No se dispone de resultados comparativos publicados en la informacion proporcionada. La tabla siguiente recoge alternativas de categoria similar usando conocimiento general de referencia, por lo que los valores de los modelos comparados deben verificarse en sus respectivas model cards antes de citarlos.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| flaviussteff/base-ro-125M | 88,1M (pesos) / 124,8M (declarado) | 1.024 | rumano | MIT | Modelo base academico, sin validacion comunitaria |
| readerbench/RoGPT2-base | ~124M | ~1.024 | rumano | no verificado | Arquitectura GPT-2, tambien base y sin ajuste instructivo |
| HuggingFaceTB/SmolLM2-135M | ~135M | ~8.192 | principalmente ingles | Apache-2.0 | Entrenado con un presupuesto de tokens muy superior; no cubre rumano de forma nativa |
| Qwen2.5-0.5B | ~494M | ~32.768 | multilingue (incluye lenguas europeas) | Apache-2.0 | Mayor tamano y contexto; referencia habitual como modelo pequeno multilingue |

## Limitaciones y advertencias

- Sesgo medido y elevado: el SPM global de 56,76% y, sobre todo, el 90,0% en genero y ocupacion indican una fuerte absorcion de estereotipos del texto web rumano (liderazgo ejecutivo, roles domesticos, cuidados). Es un riesgo directo si se usa para generar contenido sobre personas.
- No es un modelo de chat: al no tener ajuste por instrucciones ni RLHF/DPO, no respeta formatos conversacionales ni instrucciones complejas; usarlo como asistente producira resultados pobres.
- Riesgo de alucinacion alto: con 655 millones de tokens de entrenamiento y una perplejidad de 20,13, el modelo esta muy por debajo del regimen optimo de Chinchilla para su tamano (que sugeriria del orden de 1,8-2,5 mil millones de tokens), por lo que su conocimiento factual es limitado y poco fiable.
- Contexto corto: 1.024 tokens restringen tareas de resumen largo, RAG con muchos pasajes o conversaciones multi-turno extensas.
- Monolingue estricto: no se ha entrenado en ingles ni en ninguna otra lengua; su uso fuera del rumano no esta soportado.
- Ausencia de formatos cuantizados publicados: no hay GGUF ni GPTQ/AWQ en el repositorio, lo que anade un paso de conversion manual para despliegues con llama.cpp u Ollama.
- Sin validacion externa: 0 descargas y 0 likes, sin issues ni evaluaciones de terceros que confirmen el comportamiento declarado.
- Discrepancia de parametros sin resolver: los safetensors contienen 88.099.584 parametros frente a los 124.789.248 declarados en la model card; conviene auditar la configuracion antes de citar cualquier cifra.
- Licencia MIT: permite uso comercial y modificacion sin restricciones, pero traslada al integrador toda la responsabilidad sobre los sesgos y las salidas generadas.
- Metadatos anomalos: la fecha de creacion registrada (2026-09-18) no es coherente con el momento habitual de publicacion, lo que sugiere un error de metadatos o una fecha programada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/flaviussteff/base-ro-125m
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo, su tesis asociada ni sus autores; los unicos resultados obtenidos correspondian a temas sin relacion (documentacion de WikiLeaks), por lo que no se incluyen.
- No se dispone de enlace al paper, repositorio de codigo, dataset o demo del proyecto.
