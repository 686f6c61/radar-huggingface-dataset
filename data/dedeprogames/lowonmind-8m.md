# DedeProGames/LowOnMind-8M

## Resumen

LowOnMind-8M es un modelo de lenguaje decoder-only de 8.060.256 parametros entrenado desde cero por el usuario DedeProGames sobre el dataset fineweb-edu, utilizando el Space NanoDex Trainer. No es un modelo derivado ni destilado de ningun modelo mayor: es un transformer tipo Llama (LlamaForCausalLM) con SiLU MLP, RMSNorm, rotary position embeddings, grouped-query attention con embeddings atados y sin sesgos, reducido en anchura y profundidad para encajar en un presupuesto de 8 millones de parametros. Concretamente, usa hidden size 288, 9 capas, 9 cabezas de atencion (3 para clave/valor), FFN de 704 y un vocabulario BPE propio de 2.048 tokens.

Su relevancia no es funcional sino pedagogica y de investigacion: se trata de un artefacto a escala nano que permite observar de principio a fin el proceso de preentrenamiento de un transformer, desde la tokenizacion hasta la curva de perdida. El entrenamiento completo consumio 199.753.728 tokens en 381 pasos de 524.288 tokens cada uno, con AdamW y un schedule de warmup del 2 por ciento seguido de decaimiento coseno hasta el 10 por ciento, con un pico de learning rate de 1e-03. La perdida final fue de 3,8884 (perplejidad 48,8) y el tiempo de pared total, 29,3 minutos.

El autor es explicito sobre el alcance: se trata de un artefacto de investigacion a escala nano que aprende formas de palabras, colocaciones frecuentes y algo de sintaxis, pero no es un asistente util y su salida no es factual. La longitud de contexto es de 512 tokens, el unico idioma declarado es el ingles y la licencia es ODC-BY. El modelo acumula 0 descargas y 1 like en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (LlamaForCausalLM): SiLU MLP, RMSNorm, RoPE, grouped-query attention, embeddings atados, sin sesgos |
| Parametros totales | 8.060.256 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | No disponible (no se publican versiones cuantizadas oficiales; los pesos safetensors son convertibles a fp16/int8/int4 con herramientas externas) |
| Idiomas soportados | Ingles (en) |
| Licencia | ODC-BY |
| Formato de pesos | safetensors |
| Hidden size | 288 |
| Capas | 9 |
| Cabezas de atencion | 9 (3 para clave/valor) |
| Tamano de FFN | 704 |
| Vocabulario | 2.048 (BPE propio entrenado sobre fineweb-edu) |
| Dataset de entrenamiento | HuggingFaceFW/fineweb-edu |
| Tokens vistos | 199.753.728 |
| Pasos de entrenamiento | 381 (524.288 tokens por paso) |
| Perdida final | 3,8884 (perplejidad 48,8) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only estandar de tipo Llama, escalado a la baja en anchura y profundidad para ajustarse al presupuesto de parametros. Emplea activaciones SiLU en el MLP, normalizacion RMSNorm, rotary position embeddings (RoPE) para codificar posiciones, grouped-query attention con 9 cabezas de consulta y 3 cabezas de clave/valor (ratio 3:1), embeddings de entrada y salida atados y ninguna capa con sesgo. El vocabulario es un BPE personalizado de 2.048 tokens entrenado especificamente sobre fineweb-edu, lo que reduce drasticamente el tamano de la capa de embeddings dentro de un modelo tan pequeno.

El entrenamiento se realizo integramente desde cero sobre fineweb-edu con el optimizador AdamW (betas 0,9 y 0,95, weight decay 0,1, gradient clipping 1,0) y un schedule de learning rate con warmup del 2 por ciento de los pasos y decaimiento coseno hasta el 10 por ciento del pico, que fue de 1e-03. Se procesaron 199.753.728 tokens en 381 pasos de 524.288 tokens cada uno, lo que equivale a aproximadamente 24,8 tokens por parametro. El autor no reporta fases de RLHF, DPO, SFT ni ninguna innovacion de inferencia como decodificacion especulativa o atencion lineal. El entrenamiento completo requirio 29,3 minutos de tiempo de pared, lo que subraya el caracter reproducible y accesible del experimento.

## Capacidades

- Generacion de texto autoregresiva basica: completa secuencias cortas en ingles con colocaciones frecuentes y estructuras sintacticas simples.
- Modelado de lenguaje a nivel de token: util como referencia de perplejidad en investigacion sobre tokenizacion y escalado.
- Ejecucion de generacion con muestreo configurable (temperatura, top_k) mediante la API estandar de transformers.
- Compatibilidad con text-generation-inference y endpoints compatibles, segun los tags del repositorio.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agentico.
- No dispone de modo de razonamiento explicito (thinking mode).
- No tiene capacidades de vision, audio ni multimodalidad.
- Multilingue: no. Solo ingles declarado, sin garantias fuera de ese idioma.
- No dispone de ajuste por instrucciones ni de plantilla de chat; no es un modelo conversacional.

## Casos de uso

- Docencia y divulgacion de preentrenamiento: permite ejecutar y mostrar el ciclo completo de entrenamiento de un transformer desde cero en menos de media hora, con una curva de perdida observable y un coste de computo minimo.
- Validacion de infraestructura de inferencia en CI/CD: al ocupar apenas decenas de megabytes, sirve para comprobar que un pipeline de transformers, text-generation-inference o un endpoint compatible arranca, tokeniza y genera correctamente antes de desplegar modelos reales.
- Pruebas de carga y benchmarking de frameworks: util para medir latencia de arranque, overhead de tokenizacion y throughput de servidores de inferencia sin consumir GPU cara.
- Investigacion sobre tokenizacion con vocabularios pequenos: su BPE de 2.048 tokens entrenado sobre fineweb-edu permite estudiar el efecto de un vocabulario reducido en la perplejidad y en la longitud efectiva de las secuencias.
- Ablaciones de arquitectura a escala nano: sirve como punto de partida para experimentos controlados sobre grouped-query attention, RMSNorm o atado de embeddings con presupuestos de computo de minutos.
- Aprendizaje de flujos de ajuste fino: es un sujeto adecuado para practicar LoRA o ajuste completo en un unico GPU consumer, ensenando el ciclo datos-entrenamiento-evaluacion sin coste prohibitivo.
- Pruebas de sistemas de deteccion de texto generado o de marcas de agua: su salida claramente no factual y de baja coherencia lo convierte en un caso limite util para validar clasificadores.
- Relleno de texto sintetico para pruebas de interfaz: puede usarse para poblar demos, maquetas o tests de UI donde el contenido solo debe parecer texto plausible, nunca ser veraz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada por el autor es la perdida final de entrenamiento (3,8884) y su perplejidad asociada (48,8). No hay datos de MMLU, HellaSwag, ARC, GSM8K, HumanEval ni de ninguna otra evaluacion estandar, ni comparaciones con modelos de tamano similar.

| Metrica | Valor |
|---|---|
| Perdida final de entrenamiento | 3,8884 |
| Perplejidad final | 48,8 |
| Benchmarks estandar (MMLU, GSM8K, HumanEval, etc.) | No disponibles |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en cualquier precision. En fp32 los pesos ocupan aproximadamente 32 MB; en fp16/bf16, unos 16 MB; en int8, unos 8 MB; en int4, unos 4 MB. Hay que sumar el coste del vocabulario (2.048 entradas) y de las activaciones con contexto de 512 tokens, que es despreciable.
- GPU recomendadas: cualquier GPU sirve. El modelo cabe holgadamente en una RTX 3060, RTX 4090, A100 o H100, pero tambien se ejecuta en CPU, en una Raspberry Pi o en un entorno de Google Colab gratuito.
- Cabe en GPU consumer: si, en practicamente todas las GPU consumer de los ultimos diez anos, e incluso en aceleradores integrados.
- Opciones de despliegue: transformers (ruta oficial documentada por el autor), text-generation-inference (el repositorio incluye el tag text-generation-inference y endpoints_compatible), y conversion a GGUF para llama.cpp u Ollama mediante herramientas externas. vLLM es tecnicamente viable pero sobredimensionado para este tamano.
- Latencia y throughput estimados: no disponibles. No se publican mediciones de tokens por segundo ni de latencia de primera respuesta en ninguna plataforma.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este modelo que permitan una comparacion cuantitativa. La tabla siguiente compara unicamente caracteristicas estructurales y de licencia con alternativas de escala similar, tomando los datos de sus fichas publicas, que no han sido verificados en la informacion proporcionada en esta busqueda.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| LowOnMind-8M (DedeProGames) | 8,06 M | 512 | ODC-BY | HuggingFace, transformers |
| Pythia-14M (EleutherAI) | ~14 M | 2.048 (segun ficha publica) | Apache-2.0 (segun ficha publica) | HuggingFace |
| GPT-2 small (OpenAI) | 124 M | 1.024 (segun ficha publica) | MIT (segun ficha publica) | HuggingFace y multiples espejos |

La diferencia principal frente a esas alternativas es que LowOnMind-8M es sustancialmente mas pequeno, tiene un vocabulario mucho mas reducido (2.048 frente a 50.257 en GPT-2) y una ventana de contexto mas corta. No hay datos que permitan afirmar cual rinde mejor en tareas de lenguaje.

## Limitaciones y advertencias

- El propio autor declara que se trata de un artefacto de investigacion a escala nano: con este numero de parametros y este presupuesto de tokens el modelo solo aprende formas de palabras, colocaciones comunes y algo de sintaxis.
- No es un asistente util y su salida no es factual. Cualquier afirmacion que genere debe considerarse inventada por defecto.
- Riesgo de alucinacion: maximo, no solo por limitaciones de conocimiento sino porque el modelo no ha sido ajustado para responder preguntas ni para seguir instrucciones.
- No dispone de ajuste por instrucciones ni de plantilla de chat, por lo que no mantiene conversaciones coherentes de forma nativa.
- Limitacion de contexto: 512 tokens, insuficiente para documentos largos, historiales de conversacion extensos o generacion de codigo en ficheros completos.
- Limitacion de idioma: solo ingles declarado. El comportamiento en castellano u otros idiomas no esta documentado ni es esperable que sea util.
- Sesgos: no se documenta ninguna evaluacion de sesgos. Al entrenarse sobre fineweb-edu, hereda los sesgos y el sesgo de seleccion de ese corpus filtrado.
- Licencia ODC-BY: permite uso comercial y derivados siempre que se atribuya la autoria de forma adecuada y se indique si se han introducido cambios. No incluye garantias.
- Caveat para produccion: no debe desplegarse como componente orientado al usuario final ni como fuente de informacion. Su uso razonable es la investigacion, la docencia y las pruebas de infraestructura.
- El repositorio registra 0 descargas y 1 like, por lo que no existe comunidad, soporte ni mantenimiento documentado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DedeProGames/LowOnMind-8M
- Perfil del autor: https://huggingface.co/DedeProGames
- Dataset de entrenamiento fineweb-edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- NanoDex Trainer Space: https://huggingface.co/spaces/hugging-science/nanodex-trainer

Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los enlaces recuperados corresponden a paginas de soporte de YouTube y no guardan relacion con el contenido de esta ficha. No se han encontrado papers, blogs tecnicos, repositorios ni demos adicionales asociados al modelo.
