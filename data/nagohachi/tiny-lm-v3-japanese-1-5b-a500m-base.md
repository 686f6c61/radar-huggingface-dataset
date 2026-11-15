# nagohachi/tiny-lm-v3-japanese-1.5b-a500m-base

## Resumen

tiny-lm-v3-japanese-1.5b-a500m-base es un modelo de lenguaje en japones con arquitectura Mixture-of-Experts (MoE) desarrollado por el usuario nagohachi y publicado en Hugging Face. Se trata de un modelo *base*, es decir, preentrenado desde cero sin ajuste por instrucciones ni plantilla de chat, con 1.461.371.904 parametros totales de los cuales aproximadamente 480 millones estan activos por token. La ventana de contexto es de 2048 tokens y el vocabulario de 99.574 entradas, heredado del tokenizer de llm-jp/llm-jp-3-440m.

Su interes tecnico reside en la combinacion de un tamano contenido (1,46B totales, 480M activos) con un esquema MoE de 16 expertos enrutados con top-3 mas un experto compartido. Esto permite un coste computacional por token comparable a un modelo denso de ~500M mientras se mantiene una capacidad de representacion mayor. El entrenamiento se realizo con Megatron-LM sobre 10.5B tokens del subconjunto `sample_10BT` del dataset hotchpotch/fineweb-2-edu-japanese, texto web japones de caracter educativo.

Es relevante para quienes investigan modelos MoE de bajo coste en idiomas distintos del ingles y para experimentacion con arquitecturas de enrutamiento disperso en japones. No obstante, al ser un modelo base sin alineamiento, no es directamente utilizable como asistente: requiere ajuste fino posterior para tareas de instrucciones, dialogo o codigo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) tipo transformer, implementacion custom `megatron_gpt_moe` (requiere `trust_remote_code=True`) |
| Parametros totales | 1.461.371.904 (1,46B) |
| Parametros activos | 480M por token |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (el autor no publica variantes GGUF/AWQ/GPTQ; al ser safetensors en bfloat16 es cuantizable con herramientas genericas) |
| Idiomas soportados | japones (ja) |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 2,9 GB) |
| Expertos | 16 enrutados (top-3) + 1 compartido |
| Tamano de vocabulario | 99.574 |
| Tokenizer | llm-jp/llm-jp-3-440m |
| Dataset de entrenamiento | hotchpotch/fineweb-2-edu-japanese (`sample_10BT`) |
| Tokens de entrenamiento | 10.5B |
| Libreria | transformers |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer con capas de mezcla de expertos (MoE) implementadas mediante el codigo custom `megatron_gpt_moe`, lo que obliga a cargarlo con `trust_remote_code=True`. Cada capa MoE dispone de 16 expertos enrutados con seleccion top-3 y un experto compartido adicional que procesa todos los tokens; con 1,46B parametros totales y 480M activos, el coste de inferencia por token se situa en el entorno de un modelo denso de medio billon de parametros. El vocabulario de 99.574 tokens proviene del tokenizer de llm-jp/llm-jp-3-440m, disenado para japones.

El preentrenamiento se realizo desde cero con Megatron-LM sobre 10.5B tokens del subconjunto `sample_10BT` de hotchpotch/fineweb-2-edu-japanese, un corpus de texto web japones filtrado por criterios educativos. No se menciona en la informacion disponible el uso de RLHF, DPO ni ninguna fase de alineamiento posterior; se trata, por tanto, de un modelo puramente base. Tampoco se detallan innovaciones adicionales como atencion lineal, decodificacion especulativa o tecnicas de enrutamiento auxiliares (balanceo de carga, capacity factor) mas alla del esquema top-3 con experto compartido.

## Capacidades

- Generacion de texto en japones a partir de un prompt: al ser un modelo base, completa secuencias de forma coherente pero sin seguir instrucciones.
- Modelado de lenguaje y continuacion de texto: util para evaluar perplejidad y calidad de representaciones en japones.
- Razonamiento y conocimiento factual limitados al corpus de preentrenamiento (texto web educativo japones); no hay evidencia publicada de capacidades de codigo o matematicas.
- Sin soporte documentado de tool calling ni function calling.
- Sin soporte documentado de agentes ni razonamiento multi-paso.
- Multilinguismo: solo japones declarado; no se garantiza comportamiento en otros idiomas.
- Sin modo de razonamiento explicito (thinking mode), sin vision ni audio.
- Sin plantilla de chat ni formato de dialogo: no apto para uso conversacional directo sin ajuste fino.

## Casos de uso

- Investigacion en arquitecturas MoE de bajo coste: sirve como banco de pruebas para estudiar enrutamiento top-3 con experto compartido en un modelo de 1,46B totales y 480M activos, comparando curvas de perdida y perplejidad con alternativas densas.
- Preentrenamiento de dominio japones: punto de partida para ajuste fino supervisado (SFT) sobre tareas concretas en japones, ya que el modelo base ya ha absorbido 10.5B tokens de texto japones educativo.
- Modelado de lenguaje para evaluacion de corpus: calculo de perplejidad sobre textos japoneses para filtrar o puntuar datasets, aprovechando la perdida de validacion publicada (2,653 / perplejidad 14,20) como referencia.
- Generacion de texto auxiliar en japones: continuacion de parrafos, resumenes o reformulaciones en pipelines de procesamiento por lotes donde no se requiere seguir instrucciones estrictas.
- Destilacion o inicializacion de modelos mayores: el esquema MoE con 16 expertos permite inicializar experimentos de destilacion desde un modelo base japones de coste reducido.
- Experimentacion con tokenizer japones: al reutilizar el tokenizer de llm-jp/llm-jp-3-440m, facilita comparaciones controladas de vocabulario y tokenizacion frente a otros modelos japoneses.
- Docencia y prototipado: por su tamano (2,9 GB en safetensors) puede cargarse en entornos de una sola GPU para demostraciones de MoE y de preentrenamiento desde cero.

## Benchmarks y rendimiento

El autor solo publica la perdida de validacion medida al final del entrenamiento sobre el split de test de `sample_10BT`:

| Metrica | Valor |
|---|---|
| Validation loss | 2,653 |
| Perplejidad | 14,20 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, JGLUE u otros) en la informacion disponible, ni comparaciones con modelos de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 3 GB solo para pesos (1,46B parametros x 2 bytes), mas overhead de activaciones y KV cache; con contexto de 2048 tokens el consumo realista se situa en 4-6 GB.
- En cuantizacion de 8 bits, aproximadamente 1,5-2 GB de pesos; en 4 bits, en torno a 0,8-1 GB, aunque el autor no publica variantes cuantizadas oficiales y habria que generarlas con herramientas externas.
- GPU recomendadas: cualquier GPU consumer con 8 GB o mas (RTX 3060 Ti, RTX 4060, RTX 4070, RTX 4090) es suficiente para inferencia en bfloat16 o fp16; para entrenamiento o ajuste fino se recomienda A100 40/80 GB o H100.
- Cabe en GPU consumer: si, en la mayoria de tarjetas con 8 GB o mas.
- Opciones de despliegue: transformers con `trust_remote_code=True` es la via oficial documentada. No hay confirmacion de soporte en vLLM, llama.cpp, Ollama ni TGI, y la implementacion MoE custom probablemente requiera adaptaciones para estos motores.
- Latencia y throughput: no disponible; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tiny-lm-v3-japanese-1.5b-a500m-base | 1,46B | 480M | 2048 | no disponible | Hugging Face (transformers, custom code) |
| llm-jp/llm-jp-3-440m | 440M | 440M (denso) | no disponible en la informacion | no disponible | Hugging Face |
| Modelos MoE japoneses comparables de ~1-2B | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion cuantitativa con alternativas no es posible con la informacion disponible: no se han publicado benchmarks comunes ni datos de licencia que permitan contrastar rendimiento o condiciones de uso frente a llm-jp/llm-jp-3-440m u otros modelos japoneses de tamano similar.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones ni plantilla de chat: no responde a ordenes de forma fiable y no debe usarse como asistente sin un SFT previo.
- Licencia no especificada: no se puede confirmar el uso comercial; conviene contactar con el autor antes de cualquier despliegue en produccion.
- Contexto limitado a 2048 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Solo japones declarado; el rendimiento en otros idiomas no esta garantizado ni documentado.
- Corpus de entrenamiento de 10.5B tokens: volumen reducido para estandares actuales, lo que limita el conocimiento factual y aumenta el riesgo de alucinacion en temas especializados.
- Sesgos potenciales heredados del texto web japones filtrado por criterios educativos; no se documenta ninguna mitigacion.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo custom del repositorio; conviene auditar la implementacion MoE antes de usarla en entornos sensibles.
- Sin variantes cuantizadas oficiales ni soporte confirmado en motores de inferencia populares (vLLM, llama.cpp, Ollama), lo que complica el despliegue en produccion.
- Sin datos publicados de benchmarks estandar ni de latencia/throughput, lo que impide estimar su calidad relativa frente a alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nagohachi/tiny-lm-v3-japanese-1.5b-a500m-base
- Dataset de entrenamiento: https://huggingface.co/datasets/hotchpotch/fineweb-2-edu-japanese
- Tokenizer de referencia: https://huggingface.co/llm-jp/llm-jp-3-440m
- Megatron-LM: https://github.com/NVIDIA/Megatron-LM
