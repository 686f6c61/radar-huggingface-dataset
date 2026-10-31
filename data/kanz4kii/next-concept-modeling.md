# Kanz4kii/Next-Concept-Modeling

## Resumen

Next-Concept Modeling (NCM v2) es un modelo de lenguaje experimental de codigo abierto desarrollado por el autor independiente Kanz4kii, que propone una arquitectura jerarquica alternativa al transformer autoregresivo estandar. El modelo combina cuantizacion vectorial residual (RVQ-4) en un espacio de conceptos con una realizacion superficial semi-autoregresiva: un "ConceptPlanner" genera conceptos de alto nivel (uno por cada cuatro tokens aproximadamente) y un "SurfaceDecoder" los expande al texto final. Esta factorizacion reduce la complejidad de la atencion de alto nivel en un factor de 16 respecto a un transformer denso equivalente.

Con 101,88 millones de parametros activos (145,24 millones en pesos totales segun safetensors), el modelo fue preentrenado con mil millones de tokens de Fineweb-EDU y afinado con instrucciones de Alpaca-Cleaned. Su relevancia no esta en la calidad generativa frente a modelos comerciales, sino en la eficiencia: los benchmarks del autor reportan 3,5x mas throughput de entrenamiento y 1,82x menos latencia de inferencia que GPT-2 124M en hardware de consumo. Es un proyecto de investigacion temprano (publicado en octubre de 2026, con muy pocas descargas), util para explorar arquitecturas jerarquicas y cuantizacion de conceptos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Jerarquica semi-autoregresiva: ConceptPlanner (5 capas, D=384) + SurfaceDecoder (5 capas, D=768), con RVQ-4 en espacio de conceptos |
| Parametros totales | 145.239.040 (segun safetensors) |
| Parametros activos | 101,88M (dato declarado por el autor; no es un MoE, es la suma de planner y decoder) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bfloat16 (los pesos publicados no estan cuantizados; no hay GGUF ni cuantizacion oficial) |
| Idiomas soportados | Ingles |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

NCM v2 factoriza la generacion de texto en dos etapas. El ConceptPlanner, un bloque de 5 capas con dimension 384, predice "conceptos" discretos obtenidos mediante Residual Vector Quantization de 4 niveles (RVQ-4); cada concepto comprime aproximadamente 4 tokens, lo que reduce los pares de atencion de alto nivel de O(T²) a O((T/4)²) —un 16x menos de pares— y con ello el coste de la autoatencion jerarquica. El SurfaceDecoder, de 5 capas y dimension 768, realiza la "realizacion superficial" semi-autoregresiva convirtiendo los conceptos en tokens finales. El preentrenamiento se realizo con mil millones de tokens de HuggingFaceFW/fineweb-edu, y posteriormente se afinaron instrucciones con 10.000 dialogos de yahma/alpaca-cleaned. La metrica de referencia declarada es perplexity, aunque no se publican valores concretos. No hay informacion sobre RLHF ni DPO.

## Capacidades

- Generacion de texto en ingles con modo de chat interactivo (script `generate.py` con modo `--chat`).
- Seguimiento de instrucciones basico tras el fine-tuning con Alpaca-Cleaned.
- Inferencia eficiente en hardware de consumo gracias a la compresion de conceptos (menor coste de atencion).
- Control de generacion mediante temperatura por token, min-p y penalizacion por repeticion.
- Carga programatica desde Python mediante `NCMModel.from_safetensors`.
- No hay soporte documentado de tool calling, agentes, vision, audio ni modo de razonamiento extendido.

## Casos de uso

- Investigacion en arquitecturas jerarquicas: sirve como implementacion de referencia reproducible de next-concept modeling y cuantizacion residual aplicada a lenguaje, con codigo completo en GitHub.
- Experimentacion en hardware modesto: su huella de memoria reducida (entrenable en una RTX 5050 de 8 GB segun el autor) lo hace adecuado para laboratorios sin acceso a GPUs de datacenter.
- Generacion de texto asistida en ingles: puede responder preguntas y seguir instrucciones sencillas en entornos locales, offline y con privacidad total.
- Prototipado de sistemas semi-autoregresivos: la separacion planner/decoder permite estudiar decodificacion en dos niveles y comparar contra transformers densos.
- Comparativas de eficiencia: los scripts del repositorio permiten replicar mediciones de throughput y latencia contra un baseline GPT-2 en la misma GPU.
- Base para fine-tuning experimental: al ser un modelo pequeño con licencia MIT, es candidato para pruebas de continued pretraining o SFT con datasets propios sin coste de licencia.

## Benchmarks y rendimiento

Datos publicados por el autor, medidos en una NVIDIA GeForce RTX 5050 (8 GB VRAM) con PyTorch bfloat16 y FlashAttention SDPA:

| Metrica | GPT-2 124M (baseline) | NCM v2 | Ventaja |
|---|:---:|:---:|:---:|
| Parametros | 124,48M | 101,88M | 18,2% mas ligero |
| Throughput entrenamiento (B=4, T=1024) | 6.667 tok/s (7.055 MB) | 23.359 tok/s (3.233 MB) | 3,50x mas rapido, 2,18x menos VRAM |
| Throughput entrenamiento (B=8, T=1024) | 455 tok/s (13.063 MB, paging) | 27.652 tok/s (5.583 MB) | 60,8x mas rapido (sin spillover de VRAM) |
| Latencia inferencia (B=1, 128 tok) | 67,1 tok/s (1.908 ms) | 122,4 tok/s (1.045 ms) | 1,82x mas rapido |
| Throughput inferencia (B=64, 8192 tok) | 3.840,2 tok/s | 7.357,2 tok/s (1.113 ms) | 1,92x mayor throughput |
| Pares de atencion de alto nivel | O(T²) = 1.048.576 | O((T/4)²) = 65.536 | 16x menos pares |

No se han publicado resultados de benchmarks estandar de calidad (MMLU, HumanEval, GSM8K, perplexity numerica) en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia: muy baja; el propio autor reporta ejecucion en una GPU de consumo de 8 GB (RTX 5050), con unos 1.908 MB usados en inferencia de un solo stream. Unos 2-3 GB de VRAM deberian bastar.
- GPU recomendada: cualquier GPU de consumo con soporte bfloat16 (RTX 3050, RTX 4060, RTX 5050 o superiores); tambien funciona en CPU segun el codigo de carga.
- Cabe holgadamente en GPUs de consumo de gama media y baja; no se requiere A100 ni H100.
- Despliegue: mediante el repositorio oficial de GitHub (`generate.py` para CLI/chat y API Python con `NCMModel`); no hay soporte documentado de vLLM, llama.cpp, Ollama ni TGI, dado que la arquitectura es custom y no compatible con esos runtimes.
- Latencia: 122,4 tok/s en un solo stream (B=1) y 7.357,2 tok/s en lotes de 64, segun mediciones del autor en RTX 5050.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| NCM v2 (este modelo) | 101,88M activos / 145,24M pesos | Jerarquica semi-autoregresiva con RVQ-4 | no disponible | MIT | Experimental, ingles, benchmarks de eficiencia propios |
| GPT-2 124M (baseline del autor) | 124,48M | Transformer denso autoregresivo | 1.024 tokens | MIT modificado (OpenAI) | Baseline de eficiencia; mucho mas maduro en ecosistema |
| TinyLlama 1.1B | 1.100M | Transformer denso (Llama) | 2.048 tokens | Apache 2.0 | 3B tokens de entrenamiento; ecosistema GGUF/vLLM completo |
| Qwen2.5-0.5B-Instruct | 494M | Transformer denso | 32.768 tokens (128k con YaRN) | Apache 2.0 | Multilingue, tool calling, benchmarks estandar publicados |

NCM v2 compite en eficiencia con el baseline GPT-2, pero esta por debajo de los pequeños modelos instruct modernos en capacidades, contexto y ecosistema de despliegue. Su valor diferencial es la arquitectura, no la calidad generativa.

## Limitaciones y advertencias

- Proyecto muy temprano: 38 descargas y 1 like en el momento de la ficha, sin comunidad ni auditoria externa de los resultados.
- Los benchmarks de eficiencia son autoreportados por el autor; no hay verificacion independiente ni comparacion de calidad generativa estandarizada.
- Entrenado con solo mil millones de tokens y 10.000 dialogos de instrucciones: se esperan alucinaciones frecuentes, coherencia limitada y conocimiento factual muy restringido.
- Solo ingles; no hay soporte multilingue documentado, incluido el castellano.
- Longitud de contexto no documentada; el entrenamiento uso T=1024 en los benchmarks, por lo que no debe asumirse contexto largo.
- Sin soporte de tool calling, agentes, vision ni audio.
- No compatible con runtimes estandar (llama.cpp, vLLM, Ollama): requiere el codigo Python propio del repositorio.
- Licencia MIT sin restricciones de uso comercial, pero la calidad del modelo probablemente no sea adecuada para entornos de produccion reales.
- Posible sesgo heredado de Fineweb-EDU y Alpaca-Cleaned (contenido web educativo en ingles y datos sinteticos de instrucciones).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kanz4kii/Next-Concept-Modeling
- Repositorio de codigo e implementacion completa: https://github.com/Kanz4kii/Next-Concept-Modeling
- Dataset de preentrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset de instruction tuning: https://huggingface.co/datasets/yahma/alpaca-cleaned
