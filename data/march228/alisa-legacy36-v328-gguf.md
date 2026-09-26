# march228/alisa-legacy36-v328-gguf

## Resumen

Alisa Legacy36 v328 es un checkpoint conversacional de tipo GPT-2 exportado al formato GGUF para su uso con `llama.cpp`. Lo publica el usuario march228 en HuggingFace y se trata de la version cuantizada del checkpoint `legacy36_v328_top12_stability_replay512_1070ti_20260910` (paso 512), el ultimo modelo de 36 capas de la linea Legacy36/Alice del autor. Con 295.363.584 parametros (~295 M) es un modelo denso de tamano pequeno, pensado para inferencia en hardware de consumo.

Arquitectonicamente es un transformer decoder-only estilo GPT-2: 36 capas, hidden size 768, 12 cabezas de atencion, ventana de contexto de 2048 tokens y vocabulario de 50.294 entradas. El repositorio distribuye cinco cuantizaciones (F16, Q4_K_M, Q5_K_M, Q6_K y Q8_0) con un total de 1,6 GB, de modo que la variante recomendada por el autor (Q4_K_M) ocupa del orden de 180 MB en disco.

Su relevancia es limitada y muy nicho: no compite con los modelos pequenos actuales, sino que sirve como pieza de experimentacion y continuidad de un proyecto personal. El propio autor advierte de que los modulos adicionales Alice/Cortex del checkpoint original no estan soportados por `llama.cpp` estandar y no se incluyeron en la exportacion, por lo que la version GGUF contiene unicamente el backbone GPT-2 compatible. No hay licencia declarada, ni idiomas declarados, ni benchmarks publicados, ni descargas registradas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT-2 (36 capas, hidden size 768, 12 cabezas de atencion) |
| Parametros totales | 295.363.584 (~295 M) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | F16, Q4_K_M, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | no disponible (la model card esta redactada en ruso, pero no se declara ningun idioma soportado) |
| Licencia | no disponible |
| Formato de pesos | GGUF (llama.cpp) |
| Vocabulario | 50.294 tokens |
| Tamano del repositorio | 1,6 GB |
| Checkpoint de origen | legacy36_v328_top12_stability_replay512_1070ti_20260910, paso 512 |
| Fecha de creacion en HuggingFace | 2026-09-26 |

## Arquitectura y entrenamiento

El modelo sigue el diseno clasico de GPT-2: pila de 36 bloques transformer decoder-only con atencion causal multi-cabeza (12 cabezas sobre un hidden size de 768, es decir, dimension por cabeza de 64) y red feed-forward intermedia. Con 295 M de parametros y embeddings de 50.294 x 768, la mayor parte del presupuesto parametrico se reparte entre las capas de atencion y MLP, y todo apunta a embeddings de entrada y salida ligados (weight tying), dado que el recuento declarado encaja con esa configuracion.

No hay informacion publicada sobre el volumen de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni el proceso de alineacion. El identificador del checkpoint incluye referencias a `top12`, `stability` y `replay512`, ademas de `1070ti`, lo que sugiere un entrenamiento ejecutado en una GPU de consumo (GTX 1070 Ti, 8 GB) con alguna estrategia de estabilizacion y repeticion de datos, pero se trata de una inferencia a partir del nombre y no de un dato confirmado. Tampoco se documenta ninguna innovacion tecnica como decodificacion especulativa, atencion lineal o mezcla de expertos. El autor indica explicitamente que los modulos Alice/Cortex del checkpoint original quedaron fuera de la exportacion por incompatibilidad con `llama.cpp`, de modo que el modelo GGUF es un GPT-2 estandar sin componentes adicionales.

## Capacidades

- Generacion de texto autoregresiva y continuacion de prompts, con el estilo y los sesgos aprendidos durante el ajuste.
- Uso conversacional basico: la etiqueta `conversational` del repositorio indica que esta orientado a mantener dialogos de varios turnos, aunque no se documenta ningun formato de plantilla de chat.
- Generacion con contexto de hasta 2048 tokens, suficiente para conversaciones cortas o fragmentos de texto breves.
- Inferencia local en CPU y GPU mediante `llama.cpp` gracias al formato GGUF.
- Marcado como `endpoints_compatible`, lo que apunta a compatibilidad con el esquema de endpoints de HuggingFace Inference Endpoints, aunque no se detalla la configuracion.
- Soporte de tool calling / function calling: no disponible (no se declara).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se declara, y un modelo de ~295 M sin entrenamiento especifico no suele ofrecerlo de forma fiable).
- Capacidades multilingues: no disponibles (no se declara ningun idioma).
- Vision, audio o modo de razonamiento explicito (thinking mode): no disponibles.

## Casos de uso

- Prototipado de pipelines de inferencia con `llama.cpp`: sirve para validar una integracion completa (carga de GGUF, gestion de contexto, streaming de tokens) en minutos y con muy pocos recursos, antes de sustituir el modelo por uno mayor.
- Chatbot local de baja latencia en hardware humilde: al ocupar del orden de 180 MB en Q4_K_M, puede ejecutarse en una GTX 1070 Ti, en un portatil con graficos integrados o incluso en CPU, para respuestas cortas de un asistente sencillo.
- Generacion de texto creativo de formato corto: continuaciones de parrafos, descripciones, dialogos o esbozos de guiones donde la coherencia mas alla de unos cientos de tokens no es critica.
- Base para fine-tuning experimental: sus ~295 M de parametros permiten reentrenamientos completos o con LoRA en una unica GPU de consumo, util para investigar tecnicas de ajuste sobre arquitecturas GPT-2.
- Generacion de datos sinteticos de bajo coste: produccion masiva de textos etiquetados o pares pregunta-respuesta para preentrenar clasificadores o como material de aumento de datos, asumiendo que hay que filtrar la calidad.
- Pruebas de regresion de infraestructura: al ser un modelo minusculo, es un candidato comodo para tests automatizados de servidores de inferencia, contenedores y balanceadores sin consumir GPU dedicada.
- Experimentacion academica con arquitecturas GPT-2: el repositorio ofrece cinco niveles de cuantizacion del mismo checkpoint, lo que facilita estudiar el impacto de la cuantizacion en la perplejidad y la calidad del texto generado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El repositorio no incluye tablas de MMLU, HumanEval, GSM8K, perplejidad ni ninguna otra metrica, y tampoco hay evaluaciones de terceros al no registrarse descargas ni interacciones.

## Requisitos de hardware

- Peso de los pesos por cuantizacion (estimacion a partir de los 295 M de parametros): F16 ~590 MB, Q8_0 ~315 MB, Q6_K ~245 MB, Q5_K_M ~210 MB, Q4_K_M ~180 MB.
- Cache KV a 2048 tokens de contexto en F16: aproximadamente 226 MB (2 x 36 capas x 2048 tokens x 768 de hidden x 2 bytes). Se puede reducir cuantizando la cache.
- VRAM total estimada: en torno a 400 MB con Q4_K_M y contexto completo, y hasta unos 820 MB con F16. Cabe holgadamente en cualquier GPU con 2 GB o mas.
- GPU recomendadas: practicamente cualquiera. El propio nombre del checkpoint alude a una GTX 1070 Ti (8 GB); una RTX 3060, una RTX 4090 o una A100 lo ejecutan sin ninguna presion de memoria. Tambien es viable en Apple Silicon y en CPU pura.
- Cabe en GPU de consumo: si, en todas las gamas actuales y en la mayoria de las antiguas con mas de 2 GB de VRAM.
- Opciones de despliegue: `llama.cpp` (ruta recomendada y practicamente obligatoria dado el formato GGUF), `llama-cpp-python`, Ollama o LM Studio mediante importacion del GGUF, koboldcpp y text-generation-webui. La compatibilidad con vLLM o TGI no esta confirmada para esta arquitectura y este checkpoint.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de tokens por segundo.

## Comparativa con modelos similares

La comparativa se limita a la familia GPT-2, ya que este modelo es una reimplementacion de esa arquitectura. Los datos de rendimiento no se incluyen porque no hay benchmarks publicados de Alisa Legacy36 y mezclarlos con los de otros modelos no seria comparable.

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Rendimiento |
|---|---|---|---|---|---|
| Alisa Legacy36 v328 GGUF | ~295 M | 2048 | GPT-2, 36 capas, hidden 768 | no disponible | no disponible |
| GPT-2 medium | 355 M | 1024 | GPT-2, 24 capas, hidden 1024 | modificada de MIT | no comparable (no hay datos del modelo analizado) |
| GPT-2 small | 124 M | 1024 | GPT-2, 12 capas, hidden 768 | modificada de MIT | no comparable (no hay datos del modelo analizado) |
| Modelos pequenos actuales (por ejemplo familias de ~350-500 M con contexto largo) | ~350-500 M | 8192-32768 | Transformer con RoPE y entrenamiento a gran escala | Apache-2.0 en varios casos | no comparable (no hay datos del modelo analizado) |

La diferencia practica mas relevante frente a GPT-2 original es la ventana de contexto, que aqui se duplica hasta 2048 tokens. Frente a los modelos pequenos contemporaneos, la brecha esperable esta en el volumen y la calidad del corpus de entrenamiento y en la ausencia de alineacion documentada, aunque no hay mediciones que lo cuantifiquen.

## Limitaciones y advertencias

- Licencia no declarada: sin una licencia explicita no hay autorizacion clara para uso comercial ni para redistribucion. Conviene tratar el modelo como no apto para produccion hasta aclarar este punto.
- Ausencia total de validacion: 0 descargas y 0 likes en el momento de redactar la ficha, sin evaluaciones externas ni benchmarks. El comportamiento real del modelo es, a efectos practicos, desconocido.
- Riesgo elevado de alucinacion y de incoherencia: con ~295 M de parametros y sin informacion sobre el corpus, es esperable que pierda el hilo en conversaciones largas, invente hechos y repita o degrade el texto.
- Contexto limitado a 2048 tokens: insuficiente para documentos largos, analisis de repositorios de codigo o conversaciones extensas con mucho historial.
- Idiomas no declarados: la model card esta en ruso y el nombre del proyecto es de origen ruso, pero no hay confirmacion oficial de que idiomas maneja ni con que calidad.
- Modulos no incluidos: los componentes Alice/Cortex del checkpoint original no estan soportados por `llama.cpp` y quedaron fuera de la exportacion. Cualquier capacidad que dependiera de ellos no existe en esta version.
- Sesgos desconocidos: no se documenta el dataset de entrenamiento, por lo que no se puede evaluar que sesgos sociales, culturales o de dominio pueda reproducir.
- Indicios de entrenamiento en hardware de consumo: la referencia `1070ti` en el identificador del checkpoint sugiere un entrenamiento con recursos limitados, lo que a menudo implica corpus pequenos y cobertura tematica estrecha.
- Sin plantilla de chat documentada: la etiqueta `conversational` no viene acompanada de un formato de prompt, por lo que el rendimiento conversacional dependera de como se formatee la entrada.
- Formato GGUF: el uso queda practicamente restringido al ecosistema `llama.cpp`; no hay pesos en safetensors ni garantia de compatibilidad con servidores de inferencia de alto rendimiento.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/march228/alisa-legacy36-v328-gguf
- `llama.cpp` (repositorio mencionado en la model card como destino de la exportacion): https://github.com/ggerganov/llama.cpp
- Paper, blog, demo o repositorio adicionales: no disponibles en la informacion proporcionada.
