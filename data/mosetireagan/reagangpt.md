# mosetireagan/reagangpt

## Resumen

ReaganGPT 0.3 es un modelo de lenguaje autoregresivo de tipo decoder-only desarrollado desde cero por Reagan Moseti (usuario `mosetireagan` en Hugging Face). No parte de ningun modelo fundacional ni de pesos preentrenados: tanto la arquitectura como el tokenizador BPE se han construido de forma nativa en PyTorch con inicializacion aleatoria de pesos. La version 0.3 incorpora una arquitectura moderna (RMSNorm, RoPE, SwiGLU y atencion via `torch.nn.functional.scaled_dot_product_attention`) y amplia el corpus de entrenamiento hasta los 26.008 documentos y unos 28 millones de tokens empaquetados.

El modelo se distribuye en tres variantes de tamano: Micro (1,37 M parametros), Small (5,84 M parametros) y Base (27,75 M parametros), con ventanas de contexto de 256, 512 y 1.024 tokens respectivamente y un vocabulario BPE de 4.000 tokens. El checkpoint raiz del repositorio corresponde a la variante Small. Su relevancia es fundamentalmente educativa y de investigacion: sirve como referencia reproducible de un pipeline completo de entrenamiento (tokenizador, corpus limpio con particiones estancas, evaluacion held-out y publicacion de checkpoints) en un orden de magnitud que cabe en cualquier GPU de consumo.

No es un modelo apto para produccion ni para tareas de razonamiento complejo: con menos de 30 millones de parametros y un corpus de decenas de millones de tokens, su perdida held-out en el conjunto de test es de 4,0096 (perplejidad en torno a 55) para la variante Small, muy lejos de los modelos de miles de millones de parametros. Su interes esta en la transparencia metodologica y en la licencia Apache-2.0, que permite reutilizar codigo y pesos sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only autoregresivo (GPT) con RMSNorm, RoPE, SwiGLU y PyTorch SDPA |
| Parametros totales | 1.365.120 (Micro), 5.844.224 (Small, checkpoint raiz), 27.746.816 (Base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens (Micro), 512 tokens (Small), 1.024 tokens (Base) |
| Tipos de cuantizacion | no disponible (pesos en punto flotante nativo de PyTorch; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | Checkpoints nativos de PyTorch (carga via `ReaganGPT.from_pretrained`); no se distribuyen safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only clasico con cuatro decisiones de diseno modernas: normalizacion RMSNorm en lugar de LayerNorm, embeddings posicionales rotatorios RoPE con theta=10000, activacion SwiGLU en la MLP y atencion implementada con `scaled_dot_product_attention` de PyTorch (equivalente funcional a flash-attention cuando el backend lo permite). El modelo emplea weight tying entre la matriz de embeddings de tokens y la proyeccion de salida del language modeling. La variante Small usa `d_model=256`, 6 capas, 8 cabezas de atencion de dimension 32 y contexto de 512; la Base escala a `d_model=512`, 8 capas, 8 cabezas de dimension 64 y contexto de 1.024. El tokenizador es un BPE entrenado de forma independiente con byte fallback (tasa de OOV cero) y vocabulario de 4.000 tokens en la version 0.3.

El entrenamiento se realizo sobre 26.008 documentos (69,65 millones de caracteres, aproximadamente 28 millones de tokens subword empaquetados) procedentes de cinco fuentes permisivas: PG-19 de Project Gutenberg (12.000 documentos, dominio publico), WikiText-103 de Salesforce (4.000 documentos, CC BY-SA 3.0), Cosmopedia v2 (4.000 documentos, Apache-2.0), TinyStories (6.000 documentos, CDLA-Permissive-2.0) y ocho tratados tecnicos propios de ciencias de la computacion (CC0-1.0). El pipeline aplica deduplicacion exacta por SHA-256 a nivel de documento y filtrado de casi duplicados por Jaccard de n-gramas con umbral 0,85, seguido de una particion determinista por hash 80/10/10 (20.806 documentos de entrenamiento, 2.600 de validacion y 2.602 de test estanco). No se documenta uso de RLHF, DPO ni ajuste por instrucciones; el modelo es exclusivamente un modelo de lenguaje base.

## Capacidades

- Generacion de texto autoregresiva en ingles con decodificacion por temperatura, top-k y top-p.
- Modelado de lenguaje y continuacion de texto sobre dominios literario, enciclopedico, cientifico y narrativo simple.
- Tokenizacion BPE con byte fallback: puede representar cualquier cadena de bytes sin simbolos desconocidos, aunque el modelo solo ha visto texto en ingles.
- Capacidad de servir como base de experimentacion para fine-tuning, ablaciones de arquitectura y estudios de escalado a muy pequena escala.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo thinking, vision, audio ni capacidades multimodales.
- Capacidades multilingues practicamente nulas: el corpus es integramente en ingles y el vocabulario de 4.000 tokens esta optimizado para ese idioma.

## Casos de uso

- Docencia de arquitecturas transformer: el repositorio incluye el codigo completo de definicion del modelo, tokenizador y bucle de entrenamiento, lo que permite recorrer paso a paso como se construye un GPT desde cero sin depender de frameworks de alto nivel.
- Reproduccion de experimentos de escalado: las tres variantes (1,37 M, 5,84 M y 27,75 M de parametros) permiten estudiar la relacion entre tamano, contexto y perdida held-out con un coste de computo minimo.
- Pruebas de pipelines de datos: el corpus con particiones estancas por hash y deduplicacion SHA-256/Jaccard sirve como plantilla para validar flujos de limpieza y aislamiento de leakage antes de escalar a corpus mayores.
- Generacion de texto narrativo corto: la variante Small, entrenada parcialmente con TinyStories, puede producir continuaciones coherentes de frases simples en ingles, util para demostraciones en clase o tutoriales.
- Fine-tuning de bajo coste: con 5,84 M de parametros, un ajuste completo sobre un dataset pequeno cabe en una GPU de consumo y sirve para ilustrar tecnicas de adaptacion de dominio.
- Benchmark de infraestructura de inferencia: al ser un modelo diminuto en PyTorch nativo, es util para medir latencias y comparar backends (SDPA, compilacion con `torch.compile`) sin ruido de modelos grandes.
- Referencia para auditoria de licencias de datos: la model card documenta la procedencia y licencia de cada una de las cinco fuentes del corpus, lo que facilita estudiar practicas de cumplimiento en datasets mixtos.

## Benchmarks y rendimiento

Evaluacion sobre 2.602 documentos de test estrictamente estancos (6.869.672 caracteres):

| Modelo | Checkpoint | Parametros | Test loss (CE) | Perplejidad | Bits por byte |
|---|---|---:|---:|---:|---:|
| Baseline aleatorio (sin entrenar) | inicializacion aleatoria | 1.365.120 | 8,3134 | 4.078,25 | 1,1613 |
| ReaganGPT 0.2 Micro | `checkpoints/reagangpt-v02-micro` | 1.082.112 | 4,3074 | 74,25 | 0,6017 |
| ReaganGPT 0.2 Small | `checkpoints/reagangpt-v02-small` | 5.382.144 | 4,3293 | 75,89 | 1,2095 |
| ReaganGPT 0.3 Micro | `checkpoints/reagangpt-v03-micro` | 1.365.120 | 3,9648 | 52,71 | 0,5538 |
| ReaganGPT 0.3 Small | `checkpoints/reagangpt-v03-small` | 5.844.224 | 4,0096 | no disponible en la informacion proporcionada (valor truncado en la model card) | no disponible en la informacion proporcionada (valor truncado en la model card) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, HellaSwag) en la informacion disponible. La evaluacion se limita a perdida de entropia cruzada, perplejidad y bits por byte sobre el conjunto de test propio.

## Requisitos de hardware

- VRAM para inferencia: inferior a 1 GB en cualquiera de las tres variantes con pesos en fp32. La variante Base (27,75 M de parametros) ocupa aproximadamente 111 MB en fp32 y unos 55 MB en fp16.
- GPU recomendadas: cualquier GPU con soporte CUDA y SDPA (serie RTX 20xx en adelante, A100, H100). El modelo tambien funciona en CPU sin problema por su tamano.
- Cabe en cualquier GPU de consumo, incluidas GTX 1050 Ti, RTX 3050, RTX 4060 y superiores, asi como en iGPU con suficiente memoria compartida.
- Opciones de despliegue: el repositorio proporciona un script `generate.py` y una API Python (`ReaganGPT.from_pretrained`). No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, ya que no se publican pesos en formatos estandar como safetensors o GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada. Por el tamano del modelo, se espera generacion en tiempo real incluso en CPU, pero no hay cifras medidas publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vocabulario | Licencia | Enfoque |
|---|---:|---:|---:|---|---|
| ReaganGPT 0.3 Small | 5,84 M | 512 | 4.000 | Apache-2.0 | Entrenamiento desde cero, corpus mixto de 28 M tokens |
| ReaganGPT 0.3 Micro | 1,37 M | 256 | 4.000 | Apache-2.0 | Entrenamiento desde cero, misma familia |
| ReaganGPT 0.3 Base | 27,75 M | 1.024 | 4.000 | Apache-2.0 | Entrenamiento desde cero, mayor escala |
| GPT-2 Small (referencia de la familia) | 124 M | 1.024 | 50.257 | MIT | Entrenamiento desde cero sobre WebText, referencia historica de la misma categoria |
| TinyStories-1M (referencia educativa) | ~1 M | 512 | ~50.000 | MIT | Entrenamiento desde cero sobre TinyStories, enfocado a narrativa infantil |

La comparacion con GPT-2 Small y TinyStories es cualitativa: no se dispone de evaluaciones cruzadas en los mismos benchmarks. ReaganGPT se situa dos ordenes de magnitud por debajo de GPT-2 Small en parametros y corpus, por lo que su rendimiento en tareas generativas abiertas sera sustancialmente inferior. Su ventaja frente a alternativas educativas es la documentacion exhaustiva de procedencia de datos, particiones estancas y metricas held-out.

## Limitaciones y advertencias

- Capacidad generativa muy limitada: con 5,84 M de parametros y 28 M de tokens de entrenamiento, las continuaciones son localmente plausibles pero pierden coherencia global rapidamente. No es apto para tareas de razonamiento, matematicas, codigo ni respuesta a preguntas factuales.
- Riesgo elevado de alucinacion: el modelo no tiene conocimiento factual fiable y puede producir afirmaciones incorrectas con fluidez superficial.
- Ventana de contexto corta: 256, 512 o 1.024 tokens segun variante, insuficiente para documentos largos o conversaciones multi-turno.
- Solo ingles: el corpus y el tokenizador estan orientados a ingles; el rendimiento en castellano u otros idiomas sera deficiente pese al byte fallback.
- Sin ajuste por instrucciones: no responde a formatos de chat ni a directivas; es un modelo base que continua texto.
- Sesgos: el corpus incluye literatura pre-1919 de PG-19, WikiText-103 y TinyStories, fuentes con sesgos historicos, culturales y de genero no mitigados. No se documenta ninguna evaluacion de sesgo.
- Restricciones de licencia: los pesos y el codigo se publican bajo Apache-2.0, lo que permite uso comercial, pero el corpus de entrenamiento mezcla licencias (CC BY-SA 3.0 para WikiText-103, CDLA-Permissive-2.0 para TinyStories, dominio publico para PG-19). El uso comercial del modelo derivado es juridicamente discutible si se reproducen fragmentos sustanciales de las fuentes con copyleft.
- Sin soporte de formatos estandar: la ausencia de pesos en safetensors o GGUF limita la integracion con ecosistemas como llama.cpp, Ollama o vLLM, y obliga a usar el codigo Python del repositorio.
- Repositorio de 0,2 GB y 216 descargas en el momento de la consulta: no hay evidencia de validacion independiente por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mosetireagan/reagangpt
- Repositorio clonable via Git: https://huggingface.co/mosetireagan/reagangpt (instrucciones `git clone` en la model card)
- No se han encontrado en la busqueda web papers, blogs, repositorios adicionales ni demos asociados a este modelo.
