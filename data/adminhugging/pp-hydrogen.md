# AdminHugging/PP-Hydrogen

## Resumen

PP-Hydrogen (PP-H) es un modelo de lenguaje de tipo base desarrollado por el proyecto PPAI bajo el identificador AdminHugging/PP-Hydrogen. Se trata del primer miembro de una familia planificada de modelos pequenos (PP-He, PP-Li, etc.) y ha sido entrenado desde cero con una arquitectura propia denominada `ppai`, disenada especificamente para operar en el rango de los 100M de parametros totales con solo 12,4M activos por token gracias a un esquema de mezcla de expertos (MoE) con top-1 routing y un experto compartido en cada capa.

El modelo no es instructivo: es un modelo base que continua texto y no responde a preguntas. Su interes tecnico no reside en el rendimiento bruto, sino en la combinacion de decisiones de diseno poco habituales en modelos de este tamano: n-gram hash embeddings en la entrada, value-residual desde la capa cero, una compuerta por cabeza en la salida de la atencion, qk-norm, RoPE y logit softcap. Ademas incluye un tokenizador BPE propio de 24.576 entradas con una ratio de compresion notable para el ruso (4,29 caracteres por token), muy superior a la de un BPE byte-level sin cobertura cirilica.

El modelo se ha entrenado con 500M tokens en una unica Tesla T4 en fp16 durante 5,7 horas, con un loss que descendio de 10,1 a 2,736 (minimo 2,24). El autor reconoce abiertamente que el modelo ha aprendido la forma del lenguaje y del codigo, pero no el significado: genera palabras rusas reales con concordancia y estructura Python reconocible, pero sin coherencia semantica. Es, por tanto, una pieza de investigacion sobre arquitectura y tokenizacion, no una herramienta lista para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PPAI (transformer con MoE, top-1 routing + experto compartido, n-gram hash embeddings, value-residual, per-head gate, qk-norm, RoPE, logit softcap) |
| Parametros totales | 99.979.070 (99,98M) |
| Parametros activos | 12,4M por token |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | no disponible (solo se publican pesos fp32 y bf16; no hay GGUF ni cuantizaciones de terceros) |
| Idiomas soportados | Ruso (ru), ingles (en); el tokenizador se entreno tambien con Python |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (fp32), PyTorch `.pt` (bf16 y checkpoint completo con optimizador) |
| Capas | 10 |
| d_model | 192 |
| Cabezas de atencion | 6 query / 2 KV, head_dim 32 |
| FFN por experto | 800 |
| Expertos por capa | 20 enrutados (top-1) + 1 compartido |
| Vocabulario | 24.576 tokens (BPE propio) |
| Requiere `trust_remote_code` | Si (arquitectura `ppai` fuera de transformers) |

## Arquitectura y entrenamiento

La arquitectura `ppai` es un transformer decoder-only con 10 capas y un bloque MoE en el que cada capa contiene 20 expertos enrutados con seleccion top-1 mas un experto compartido siempre activo, lo que explica la relacion entre 99,98M de parametros totales y 12,4M activos por token. Sobre el transformer convencional se anaden varias innovaciones: n-gram hash embeddings en la entrada sobre ventanas de 2, 3 y 4 tokens, una conexion value-residual que arrastra la representacion de la capa cero hasta las capas superiores, una compuerta por cabeza aplicada a la salida de la atencion, qk-norm, RoPE para el codificado posicional y logit softcap para estabilizar la distribucion final. La atencion usa 6 cabezas de query y 2 de clave/valor con dimension de cabeza 32, lo que reduce el coste de la cache KV.

El entrenamiento se realizo desde cero sobre 500M tokens (con un run previsto hasta 1,5B), en 13.563 pasos, con un batch efectivo de 36.864 tokens por paso (12 x 3 x 1024), learning rate 6e-4 con schedule cosine y warmup de 500 pasos, en una unica Tesla T4 en fp16 a 26.433 tokens/s durante 5,7 horas. El mix de datos fue Python 34%, ruso 40%, ingles 20%, C#/Rust 6% y matematicas 0%. No se menciona RLHF, DPO ni ninguna fase de alineamiento; el modelo es estrictamente base. El tokenizador BPE propio se entreno sobre 40M caracteres de ruso, ingles y Python, alcanzando ratios de 4,29 caracteres por token en ruso y en ingles y 3,33 en Python, frente a los ~0,82 tokens por caracter de un BPE byte-level sin cirilico.

## Capacidades

- Generacion de texto por continuacion (modelo base, no instructivo): completa secuencias a partir de un prefijo, sin seguir instrucciones ni responder preguntas.
- Generacion de texto en ruso con morfologia y concordancia plausibles, aunque sin coherencia semantica global.
- Generacion de texto en ingles sintacticamente correcto a nivel de frase.
- Generacion de estructura de codigo Python reconocible: docstrings, indentacion, imports y referencias a documentacion, sin garantia de correccion logica.
- Cobertura limitada de C# y Rust por el mix de entrenamiento (6% combinado).
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agentico.
- No dispone de modo thinking, vision ni audio.
- No soporta matematicas de forma fiable (0% de matematicas en el mix de entrenamiento).

## Casos de uso

- Investigacion sobre arquitecturas MoE de muy bajo numero de parametros activos: el modelo sirve como banco de pruebas reproducible (una sola T4, 5,7 horas) para estudiar el equilibrio entre expertos enrutados y experto compartido en regimenes de 100M de parametros.
- Estudio de tokenizadores para lenguas con alfabeto cirilico: la ratio de 4,29 caracteres por token en ruso permite comparar el impacto de la tokenizacion en la calidad de la generacion frente a BPE byte-level.
- Experimentos con n-gram hash embeddings y value-residual: la implementacion en `modeling_ppai.py` es un caso practico para medir el efecto de estas tecnicas en modelos pequenos.
- Generacion de texto de relleno o sintetico para pruebas de pipelines de NLP: al producir texto con forma linguistica correcta pero contenido irrelevante, es util para validar tokenizadores, formateadores y sistemas de deteccion de texto sin sesgar hacia contenido real.
- Docencia y divulgacion: el modelo ilustra de forma tangible la diferencia entre aprender la forma del lenguaje y aprender su significado, con ejemplos reales documentados por el autor.
- Base para fine-tuning experimental: al ser un modelo base con licencia Apache 2.0 y pesos de 400 MB en fp32, es un punto de partida barato para probar SFT en tareas muy acotadas (el propio autor planea SFT sobre pares tarea-funcion Python).
- Pruebas de integracion con `transformers` y `trust_remote_code`: util para verificar que un entorno de despliegue carga correctamente arquitecturas personalizadas fuera del catalogo estandar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica de entrenamiento reportada es la curva de loss (10,1 inicial, 2,736 final, minimo 2,24) y la velocidad de entrenamiento (26.433 tokens/s en una Tesla T4 en fp16). No hay datos de MMLU, HumanEval, GSM8K ni de perplejidad en validacion.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos fp32 ocupan aproximadamente 400 MB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer con 4 GB o mas; en bf16 los pesos son de unos 200 MB.
- GPU recomendadas: cualquier GPU con soporte CUDA y al menos 4 GB de VRAM; el autor entreno en una unica Tesla T4. Una RTX 3060, RTX 4060 o superior es mas que suficiente.
- Cabe en GPU consumer: si, en practicamente todas las GPU consumer modernas e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: exclusivamente mediante `transformers` con `trust_remote_code=True` y el codigo `modeling_ppai.py` del repositorio. No hay soporte para llama.cpp, Ollama, vLLM ni TGI, ya que la arquitectura `ppai` no existe entre las arquitecturas GGUF y los n-gram hash embeddings requeririan un operador C++ adicional. El autor menciona un frontend web sobre transformers para ejecucion local.
- Latencia y throughput estimados: no disponible. Solo se conoce la velocidad de entrenamiento (26.433 tokens/s en T4 fp16), no la de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| PP-Hydrogen | 99,98M | 12,4M | 1024 | Apache 2.0 | Hugging Face, transformers con `trust_remote_code` | Base, MoE top-1, tokenizador ruso/en/Python |
| GPT-2 small | 124M | 124M (denso) | 1024 | MIT | Hugging Face, transformers, llama.cpp, amplio ecosistema | Base, denso, entrenado con ~40B tokens segun el autor |
| Pythia-70M | 70M | 70M (denso) | 2048 | Apache 2.0 | Hugging Face, transformers | Base, denso, con checkpoints intermedios |
| SmolLM-135M | 135M | 135M (denso) | 2048 | Apache 2.0 | Hugging Face, transformers, llama.cpp | Base/instruct, denso, entrenado con billones de tokens |

La comparativa debe leerse con cautela: PP-Hydrogen se entreno con 500M tokens frente a los ordenes de magnitud superiores de sus alternativas, por lo que la diferencia de calidad en generacion coherente es esperable y el propio autor la reconoce. Su ventaja diferencial no es el rendimiento, sino la relacion entre parametros activos y totales (12,4M de 99,98M) y un tokenizador mucho mas eficiente para ruso.

## Limitaciones y advertencias

- Modelo base no instructivo: no responde a preguntas ni sigue instrucciones; solo continua texto.
- Generacion incoherente a nivel semantico: el autor documenta que produce palabras y estructuras plausibles pero contenido sin sentido; no es apto para produccion.
- Riesgo alto de alucinacion: al no haber aprendido hechos, cualquier afirmacion factual generada es inventada por construccion.
- Entrenamiento muy limitado: 500M tokens frente a los ~40B que el autor cita para GPT-2 small; la calidad esta acotada por este hecho.
- Contexto corto: 1024 tokens, insuficiente para tareas de contexto largo.
- Cobertura linguistica reducida: solo ruso e ingles; no hay datos de otros idiomas y el tokenizador no esta disenado para ellos.
- Sin matematicas en el mix de entrenamiento: no debe esperarse ningun rendimiento en tareas numericas.
- Dependencia de `trust_remote_code=True`: la carga ejecuta codigo del repositorio, lo que implica un riesgo de seguridad que debe evaluarse en entornos de produccion.
- Sin soporte en llama.cpp, Ollama, vLLM ni TGI: el despliegue esta limitado a transformers con el codigo del autor.
- Licencia Apache 2.0: permite uso comercial, pero las limitaciones tecnicas descritas hacen inviable su uso en produccion sin un entrenamiento adicional sustancial.
- Sin cuantizaciones publicadas: no hay versiones GGUF ni AWQ/GPTQ, lo que limita el despliegue en entornos de bajos recursos fuera de transformers.
- Proyecto en desarrollo: el autor planea continuar el entrenamiento hasta 1,5B tokens y anadir SFT, por lo que los pesos actuales son un estado intermedio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdminHugging/PP-Hydrogen
- Codigo de arquitectura en el repositorio: `modeling_ppai.py` (incluido en el repo de Hugging Face)
- Tokenizador: `tokenizer.json` (incluido en el repo de Hugging Face)
- Metricas de entrenamiento: `logs/metrics.csv` (incluido en el repo de Hugging Face)
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la informacion disponible.
