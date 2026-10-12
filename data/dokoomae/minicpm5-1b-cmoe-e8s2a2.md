# dokoomae/MiniCPM5-1B-CMoE-e8s2a2

## Resumen

MiniCPM5-1B-CMoE-e8s2a2 es una conversion experimental del modelo denso openbmb/MiniCPM5-1B a una arquitectura de mezcla de expertos (MoE), publicada por el usuario dokoomae. La conversion reutiliza la arquitectura estandar Qwen2MoeForCausalLM de la libreria Transformers, de modo que no requiere trust_remote_code ni codigo Python personalizado: basta con transformers>=4.40. El modelo resultante tiene 1.845.376.512 parametros totales (unos 1,85 mil millones) y un peso de repositorio de 3,7 GB.

El objetivo de la publicacion es demostrar una tecnica de "upcycling" denso a MoE basada en la descomposicion aditiva de la activacion SiLU-SwiGLU: el FFN original de cada capa se divide en cuatro bloques que se reasignan a expertos enrutados y a un experto compartido. La configuracion se denomina e8s2a2 (8 expertos enrutados, 2 expertos compartidos y 2 expertos activados por token, top-k=2).

Es importante senalar que se trata de un artefacto de investigacion y no de un modelo listo para produccion: el router se inicializa a ceros, por lo que todos los tokens se enrutan al mismo par de expertos y la calidad de salida queda degradada respecto al modelo base. El propio autor indica que se requiere un ajuste fino posterior para especializar los expertos y recuperar la equivalencia funcional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2MoeForCausalLM (transformer decoder MoE con GQA, RoPE y RMSNorm) |
| Parametros totales | 1.845.376.512 (≈1,85 mil millones) |
| Parametros activos | no disponible (configuracion e8s2a2: top-2 sobre 8 expertos enrutados mas 1 experto compartido fusionado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no se distribuyen cuantizaciones precalculadas; pesos completos en bf16 |
| Idiomas soportados | en, zh |
| Licencia | other (hereda de openbmb/MiniCPM5-1B) |
| Formato de pesos | safetensors (bf16), 3,5 GB |

## Arquitectura y entrenamiento

El modelo parte de openbmb/MiniCPM5-1B, un transformer denso de estilo LlamaForCausalLM con atencion GQA, RoPE y RMSNorm. La conversion sustituye el FFN denso de cada capa por una capa MoE compatible con Qwen2Moe. El FFN original tiene las proyecciones gate_proj [4608, 1536], up_proj [4608, 1536] y down_proj [1536, 4608]. Aprovechando que SiLU-SwiGLU es aditivamente descomponible en la dimension intermedia, cada FFN se divide en cuatro bloques iguales de tamano [1152, 1536], y la salida del FFN pasa a ser la suma de cuatro "mini-FFN".

Sobre esa division se construyen los componentes MoE. Los 8 expertos enrutados reutilizan los bloques de forma ciclica: el experto i usa el bloque (i mod 4), de modo que hay 4 expertos unicos y 4 duplicados para dar capacidad. Los 2 expertos compartidos se fusionan en un unico MLP concatenando los bloques 0 y 1, con intermediate_size = 2304. El router (mlp.gate.weight) se inicializa a ceros, lo que produce un softmax uniforme y hace que cada token seleccione aleatoriamente 2 expertos con pesos renormalizados a 0,5/0,5. La puerta del experto compartido (shared_expert_gate.weight) tambien se inicializa a ceros, de modo que sigmoid(0) = 0,5 y el experto compartido contribuye a la mitad de su intensidad.

No se documenta un entrenamiento posterior: la inicializacion es estable (sin NaN ni valores extremos), pero la salida esperada de la capa CMoE es aproximadamente 0,75 veces la del FFN original, y no una equivalencia exacta. El autor proporciona una comprobacion numerica de fidelidad frente al modelo original:

| Prompt | Similitud coseno | KL(orig‖cmoe) |
|---|---|---|
| "Hello, my name is" | 0,78 | 5,71 |
| "The capital of France is" | 0,79 | 10,14 |
| "Once upon a time," | 0,77 | 6,35 |
| "Artificial intelligence is" | 0,67 | 5,76 |
| "1 + 1 =" | 0,47 | 9,12 |

## Capacidades

- Generacion de texto autoregresiva en ingles y chino, heredada del modelo base.
- Soporte de la arquitectura MoE con enrutamiento top-2 sobre 8 expertos enrutados y experto compartido fusionado.
- Carga directa con la API estandar de Transformers (AutoModelForCausalLM y AutoTokenizer), sin trust_remote_code.
- No se documentan capacidades de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documentan capacidades de vision, audio ni modo "thinking".
- Capacidad multilingue limitada a los idiomas declarados (en, zh).
- La calidad de generacion esta degradada respecto al modelo base hasta que se realice un ajuste fino del router y de los expertos.

## Casos de uso

- Investigacion en upcycling denso a MoE: permite estudiar como se comporta un router inicializado a ceros sobre expertos derivados de bloques de un FFN denso, y medir la divergencia (similitud coseno, KL) frente al modelo original.
- Experimentacion con enrutamiento de expertos: util para analizar el colapso de enrutamiento (todos los tokens al mismo par de expertos) y probar estrategias de inicializacion o regularizacion de carga.
- Punto de partida para ajuste fino: el modelo esta pensado para ser entrenado posteriormente con el fin de especializar los expertos y recuperar la equivalencia de salida con MiniCPM5-1B.
- Pruebas de kernels MoE en GPU: al usar Qwen2MoeForCausalLM estandar, sirve para validar y comparar kernels de MoE fusionados frente al FFN denso en bf16.
- Prototipado ligero y despliegue en CPU: con 1,85 mil millones de parametros totales y pesos bf16 de 3,5 GB, cabe en entornos con recursos limitados para pruebas de integracion, asumiendo el coste de latencia medido en CPU.
- Educacion y analisis de arquitecturas: es un ejemplo reproducible de conversion de pesos entre arquitecturas compatibles (LlamaForCausalLM a Qwen2Moe) y de reutilizacion literal de los pesos de atencion.
- Reproduccion de conversiones equivalentes sobre otros modelos densos de la familia MiniCPM, usando el script de conversion incluido en el directorio scripts/ del repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no hay datos de MMLU, HumanEval, GSM8K ni similares). El unico rendimiento documentado por el autor es la comprobacion de fidelidad de inicializacion (similitud coseno y divergencia KL frente al modelo original) recogida en la seccion de arquitectura, y las mediciones de velocidad en CPU que se detallan en la seccion de hardware.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos completos en bf16 ocupan 3,5 GB, por lo que se necesitan aproximadamente 4 GB de VRAM (o de memoria unificada) para cargar el modelo, mas el overhead de activaciones y cache KV.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM (por ejemplo RTX 3060, RTX 4060, RTX 4070). En modelos de 1,85 mil millones de parametros no se requieren A100 ni H100 para inferencia.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en GPU de consumo de gama media y en sistemas con memoria unificada.
- Opciones de despliegue: Transformers (>=4.40) con Qwen2MoeForCausalLM; al ser una arquitectura estandar, es compatible con runners que soporten Qwen2MoE (por ejemplo vLLM), aunque no se verifica en la informacion disponible. No se distribuyen pesos GGUF, por lo que su uso en llama.cpp u Ollama requeriria una conversion previa no documentada.
- Latencia y throughput en CPU (bf16, sin CUDA), medidos por el autor:

| Operacion | Original (Llama) | CMoE (Qwen2Moe) | Ratio |
|---|---|---|---|
| Forward pass (seq=64) | 350 ms | 410 ms | 1,17× mas lento |
| Throughput de generacion | 6,0 tok/s | 4,6 tok/s | 0,77× |

- El autor senala que la CPU carece de kernels MoE fusionados, por lo que la ventaja de la arquitectura MoE no se aprecia en ese entorno; en GPU, un MoE suele igualar o superar al FFN denso cuando num_activated × expert_size es menor que el intermediate_size original.

## Comparativa con modelos similares

| Modelo | Parametros totales | Arquitectura | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dokoomae/MiniCPM5-1B-CMoE-e8s2a2 | 1.845.376.512 | Qwen2Moe (e8s2a2) | no disponible | other (hereda del base) | HuggingFace, 0 descargas |
| openbmb/MiniCPM5-1B | no disponible | LlamaForCausalLM denso | no disponible | other | HuggingFace (modelo base) |
| Otras alternativas de ~1B | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion directa relevante es con openbmb/MiniCPM5-1B, del que este modelo hereda tokenizer, configuracion de generacion y pesos de atencion. Frente a el, la version CMoE multiplica por aproximadamente 2,5 el numero de parametros de la capa FFN, pero presenta una calidad de salida degradada en la inicializacion y un rendimiento inferior en CPU (0,77× en throughput). No se dispone de informacion sobre otros modelos comparables en la documentacion proporcionada.

## Limitaciones y advertencias

- Calidad de salida degradada: el router se inicializa a cero y todos los tokens se enrutan al mismo par de expertos. Se requiere ajuste fino para especializar los expertos y recuperar la calidad del modelo base.
- No es un modelo listo para produccion: es un artefacto de investigacion, con 0 descargas y 0 likes en el momento de la publicacion.
- Riesgo de alucinacion: no se documenta mitigacion alguna; como modelo base de ~1B sin ajuste alineado, la tendencia a generar contenido incorrecto es alta.
- Sesgos: no se documenta ninguna evaluacion de sesgos ni de seguridad.
- Cobertura idiomatica limitada: solo se declaran ingles (en) y chino (zh); no hay soporte declarado de castellano.
- Longitud de contexto no documentada: no se especifica la ventana de contexto soportada, por lo que no se puede garantizar el comportamiento en secuencias largas.
- Limitacion de rendimiento en CPU: la inferencia en CPU es un 17% mas lenta en forward pass y un 23% menor en throughput que el modelo denso original, al no disponer de kernels MoE fusionados.
- Distribucion de pesos unica: solo se ofrecen pesos bf16 en safetensors (3,5 GB); no hay cuantizaciones ni GGUF, lo que limita el despliegue en segun que runtimes.
- Licencia: hereda los terminos de openbmb/MiniCPM5-1B, marcados como "other". Es imprescindible revisar la model card del modelo base antes de cualquier uso comercial, ya que las condiciones no se detallan en esta publicacion.
- Fusion de expertos compartidos: los 2 expertos compartidos se representan como un unico MLP fusionado (shared_expert_intermediate_size = 2 × moe_intermediate_size); es funcionalmente equivalente porque siempre se activan juntos, pero implica una representacion distinta a la nominal.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dokoomae/MiniCPM5-1B-CMoE-e8s2a2
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-1B
- Script de conversion: directorio scripts/ del repositorio del modelo (segun la model card)
