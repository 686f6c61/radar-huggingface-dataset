# eshaoliu/minimind-768-pretrain

## Resumen

MiniMind-768-Pretrain es un modelo de lenguaje de tipo base (preentrenado, sin ajuste por instrucciones) desarrollado por el usuario eshaoliu dentro del proyecto ultra-minimind. Se trata de un transformer denso de 84,2 millones de parametros, con 8 capas, dimension oculta de 768 y una ventana de contexto maxima de 32.768 tokens gracias al uso de RoPE con theta=1e6. Su peso principal es que es un banco de pruebas extremadamente ligero: en fp16 ocupa unos 161 MB y puede ejecutarse en CPU sin problemas.

El modelo se ha preentrenado exclusivamente sobre el subconjunto de calidad "4+" del corpus Nemotron-CC-Math-v1 de NVIDIA, es decir, texto de matematicas en ingles. No ha pasado por SFT, RLHF ni DPO, por lo que no tiene capacidad conversacional: es una base para validar pipelines de preentrenamiento y fine-tuning, no un asistente. Funciona como contraste a escala reducida del modelo hermano de mayor tamano (eshaoliu/minimind-1536-pretrain, descrito por el autor como la variante de 1B), con el que comparte tokenizador y pipeline de datos.

Su relevancia actual es practica: los pesos se exportan con la nomenclatura y el layout de Qwen3 (architectures: Qwen3ForCausalLM), de modo que se cargan con transformers estandar sin trust_remote_code y son consumibles por cualquier framework que soporte dicha arquitectura. Esto convierte al modelo en un caso de uso interesante para experimentar con arquitecturas tipo Qwen3 a escala de decenas de millones de parametros, en portatil, CPU o GPUs de gama baja.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only, compatible con Qwen3ForCausalLM |
| Parametros totales | 84.162.816 (~84,2 M), embedding y lm_head atados (se almacena una sola copia) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (maximo declarado, RoPE con theta=1e6) |
| Tipos de cuantizacion | fp16 publicado; no se distribuyen pesos GGUF, AWQ, GPTQ ni int8 |
| Idiomas soportados | ingles (tokenizador BPE ingles, vocabulario de 32.768; el autor no declara otros idiomas) |
| Licencia | Apache 2.0 (segun el LICENSE del repositorio ultra-minimind; la metadata de HuggingFace no la especifica) |
| Formato de pesos | safetensors (model.safetensors, ~161 MB en fp16) |

Especificaciones estructurales adicionales declaradas por el autor:

| Parametro | Valor |
|---|---|
| Capas / dimension oculta | 8 / 768 |
| Atencion | 8 cabezas de consulta, head_dim=96, GQA con 4 cabezas KV, sin bias, qk-norm |
| FFN | SwiGLU, intermediate = 2432 |
| Vocabulario | 32.768 (BPE ingles, tokenizer_en) |
| Precision de entrenamiento | bf16 en mezcla (pesos publicados en fp16) |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only denso de 8 capas con atencion de consultas agrupadas (GQA): 8 cabezas de consulta y 4 cabezas de clave/valor, con head_dim de 96, sin terminos de bias y con normalizacion aplicada a q y k (qk-norm). La red feed-forward usa SwiGLU con dimension intermedia de 2432. El embedding de entrada y la cabeza de salida estan atados, lo que reduce el recuento efectivo de parametros almacenados. Las posiciones se codifican con RoPE y una base theta de 1e6, lo que habilita el contexto maximo de 32K tokens.

El entrenamiento se realizo con el script train_pretrain.py del repositorio ultra-minimind, una pipeline de preentrenamiento en streaming. Los datos provienen del bucket de calidad "4+" de Nemotron-CC-Math-v1 (corpus de matematicas en ingles de NVIDIA), leidos en flujo continuo y empaquetados a longitud fija de 1024 tokens; la atencion variable de flash-attn aísla cada documento por sus limites. La receta por defecto es AdamW con learning rate 5e-4, scheduler WSD (warmup del 1 por ciento, fase estable y decaimiento coseno en el 20 por ciento final), precision mixta bf16, gradient clipping de 1.0 y semilla 42. No se especifica en la informacion disponible el numero total de tokens procesados ni si hubo etapas posteriores de alineacion; el autor indica explicitamente que no hay SFT ni instruccion.

La innovacion relevante no es algorítmica sino de interoperabilidad: los pesos se exportan con la nomenclatura de Qwen3 (por ejemplo, model.layers.N.self_attn.q_proj) y el config.json declara la arquitectura Qwen3ForCausalLM, de modo que se evita trust_remote_code y se reutiliza todo el ecosistema de herramientas ya existente para Qwen3.

## Capacidades

- Generacion de texto autocompletivo en ingles: el modelo continua secuencias y resuelve prompts de estilo few-shot, propio de un modelo base sin instruccion.
- Razonamiento matematico basico: al estar preentrenado sobre Nemotron-CC-Math-v1, su distribucion objetivo son derivaciones, expresiones algebraicas y texto matematico en ingles.
- Prediccion de tokens en dominios cientificos y tecnicos en ingles, limitada al registro visto en el corpus de entrenamiento.
- Carga directa con transformers mediante AutoModelForCausalLM y AutoTokenizer, sin codigo remoto.
- Inferencia en CPU y en GPUs de gama de entrada, con huella de memoria muy reducida (unos 161 MB en fp16).
- Capacidad de servir como punto de partida para fine-tuning supervisado o para experimentos de investigacion sobre escalado.
- No dispone de soporte de tool calling, function calling ni modo de agente.
- No dispone de modo "thinking", vision, audio ni multimodalidad de ningun tipo.
- No tiene capacidad conversacional: el autor advierte que es un modelo base sin SFT.
- Multilingue: no declarado; el tokenizador es BPE ingles, por lo que el rendimiento fuera del ingles es previsiblemente pobre.

## Casos de uso

- Validacion de pipelines de preentrenamiento: sirve para comprobar de extremo a extremo la cadena de datos, empaquetado a 1024 tokens, atencion variable por documento y exportacion a safetensors antes de lanzar un entrenamiento a mayor escala.
- Pruebas de fine-tuning en matematicas: partir del checkpoint y aplicar SFT sobre un dataset de problemas resueltos paso a paso para evaluar tecnicas de ajuste con un coste de computo minimo.
- Prototipado de aplicaciones de autocompletado en ingles: al caber en CPU, permite integrar generacion de texto en herramientas de escritorio o scripts locales sin GPU.
- Educacion y generacion de material didactico matematico en ingles: continuacion de enunciados, variaciones de ejercicios o completado de demostraciones simples, siempre con revision humana por tratarse de un modelo base.
- Investigacion sobre escalado y leyes de potencia: al compartir tokenizador y pipeline con la variante de 1536 dimensiones, permite comparar directamente el efecto del tamano del modelo manteniendo el dataset constante.
- Pruebas de cuantizacion y compresion: con 84 M de parametros es un banco de pruebas barato para medir perdida de perplejidad al pasar de fp16 a int8 o int4 con herramientas propias.
- Desarrollo de harness de evaluacion: utiliizable como modelo de control en benchmarks de perplejidad para verificar que el codigo de evaluacion y las metricas funcionan antes de aplicarlos a modelos grandes.
- Educacion en arquitecturas tipo Qwen3: al usar el layout exacto de Qwen3, sirve para estudiar GQA, qk-norm y RoPE a 1e6 en un modelo que se lee y se entrena en minutos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye cifras de MMLU, GSM8K, HumanEval, ARC, HellaSwag ni de perplejidad sobre conjuntos de validacion, y la busqueda web realizada no ha devuelto resultados relacionados con este modelo (los resultados obtenidos corresponden a articulos de psicologia clinica, sin ninguna relacion con MiniMind-768-Pretrain). No se deben asumir cifras de rendimiento derivadas del modelo hermano de mayor tamano.

## Requisitos de hardware

- VRAM en fp16: aproximadamente 168 MB de pesos, mas el estado de la cache KV. En la practica cabe en cualquier GPU con 1 GB o mas de memoria.
- VRAM en int8 / int4: alrededor de 84 MB y 42 MB respectivamente, aunque el autor no publica checkpoints cuantizados y habria que generarlos.
- Ejecucion en CPU: viable y fluida, segun indica el propio autor (fp16 de unos 160 MB). Tambien es apto para dispositivos de borde, como Raspberry Pi o portatiles sin GPU dedicada.
- GPUs recomendadas: cualquier GPU moderna es sobredimensionada; una RTX 3060, RTX 4090 o incluso una GPU integrada son suficientes. No tiene sentido desplegarlo en A100 o H100 salvo para entrenamiento o experimentos de throughput masivo.
- Despliegue: transformers es la via oficial y documentada. Cualquier framework que soporte Qwen3ForCausalLM (por ejemplo vLLM) puede consumir los pesos, ya que el autor afirma que son compatibles con cualquier runtime que soporte dicha arquitectura. No se publican pesos GGUF, por lo que llama.cpp u Ollama requeririan una conversion previa a partir de safetensors.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia por peticion.
- Compatibilidad con ModelScope SDK: documentada por el autor con AutoModelForCausalLM y AutoTokenizer de modelscope.

## Comparativa con modelos similares

La comparacion se limita a datos estructurales y de licencia verificables; no existen resultados de benchmarks publicados para MiniMind-768-Pretrain, por lo que no se puede comparar rendimiento empirico.

| Modelo | Parametros | Contexto | Licencia | Enfoque de entrenamiento |
|---|---|---|---|---|
| MiniMind-768-Pretrain | 84,2 M | 32.768 tokens | Apache 2.0 (segun repositorio ultra-minimind) | Solo preentrenamiento sobre corpus matematico en ingles (Nemotron-CC-Math-v1, calidad 4+) |
| SmolLM2-135M | 135 M | 8.192 tokens | Apache 2.0 | Preentrenamiento generalista multilingue mas alineacion |
| Pythia-160M | 160 M | 2.048 tokens | Apache 2.0 | Preentrenamiento sobre The Pile, con checkpoints intermedios |
| Qwen3-0.6B | 0,6 B | 32.768 tokens | Apache 2.0 | Preentrenamiento amplio multilingue mas post-entrenamiento con modo de razonamiento |

Diferencias destacables: MiniMind-768-Pretrain es el mas pequeno de la tabla y el unico con contexto de 32K en la franja de decenas de millones de parametros, pero tambien el unico entrenado sobre un dominio unico (matematicas en ingles) y sin ninguna etapa de alineacion. Los datos de rendimiento comparado no estan disponibles.

## Limitaciones y advertencias

- Modelo base sin SFT ni alineacion: no mantiene conversaciones, no sigue instrucciones y puede completar prompts de forma incoherente o repetitiva. El propio autor lo advierte de forma explicita.
- Corpus de entrenamiento monocromatico: unicamente matematicas en ingles de Nemotron-CC-Math-v1 (bucket 4+). Fuera de ese dominio, y especialmente fuera del ingles, la calidad esperada es baja.
- Tokenizador exclusivamente ingles (BPE, 32.768 entradas): no hay soporte declarado de castellano ni de otros idiomas; se producira una tokenizacion ineficiente y resultados pobres.
- Riesgo alto de alucinacion: al ser un modelo pequeno y sin ajuste por preferencias humanas, puede generar afirmaciones matematicamente falsas con una forma fluida y convincente. No debe usarse como fuente de verdad sin verificacion.
- Sesgos: no se ha publicado ninguna evaluacion de sesgos ni de toxicidad. El corpus proviene de fuentes web filtradas por calidad, por lo que puede arrastrar sesgos presentes en esos datos.
- Licencia: el autor indica Apache 2.0 remitiendo al LICENSE del repositorio ultra-minimind, pero la metadata de HuggingFace no incluye campo de licencia. Conviene verificar el archivo de licencia del repositorio antes de un uso comercial.
- Corpus de terceros: el uso comercial puede quedar condicionado por los terminos de Nemotron-CC-Math-v1 y de las fuentes originales del mismo, algo que no se detalla en la informacion disponible.
- Sin informacion de reproducibilidad de datos: no se publica el numero de tokens de entrenamiento, la composicion exacta del dataset ni curvas de perdida.
- Cero adopcion publica: el modelo registra 0 descargas y 0 likes en HuggingFace en el momento de la consulta, y no hay validacion externa de su calidad.
- Ventana de contexto declarada de 32K: la longitud efectiva utilizable no esta verificada mediante pruebas de aguja en pajar ni tareas de razonamiento de largo alcance.
- Longevidad del proyecto: se trata de un experimento personal en un repositorio pequeno, sin garantia de mantenimiento ni de versionado a largo plazo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/eshaoliu/minimind-768-pretrain
- Repositorio del proyecto: https://github.com/eshaoliu/ultra-minimind
- Script de preentrenamiento: ultra-minimind/trainer/train_pretrain.py (dentro del repositorio anterior)
- Dataset de entrenamiento: https://huggingface.co/nvidia/Nemotron-CC-Math-v1
- Modelo hermano de mayor tamano (variante de 1B, 1536 dimensiones): https://www.modelscope.cn/models/eshaoliu/minimind-1536-pretrain
- Paper o blog tecnico del modelo: no disponible
- Demo o Space: no disponible
- Resultados de la busqueda web: no se ha encontrado ningun enlace relevante sobre este modelo; los resultados devueltos corresponden a articulos de psicologia clinica sin relacion con MiniMind-768-Pretrain.
