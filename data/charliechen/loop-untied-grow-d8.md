# CharlieChen/loop-untied-grow-d8

## Resumen

loop-untied-grow-d8 es un checkpoint de modelo de lenguaje base entrenado desde cero por CharlieChen (cuenta de HuggingFace), publicado como artefacto asociado al articulo "How Model Growth, Recursion, and Boundary Operators Influence Scaling Exponents". Se trata de un transformer con bucles (looped transformer) en el que la coordenada de profundidad se usa como coordenada de escalado dentro de una escalera de experimentos sobre el corpus FineWeb. El modelo pertenece a la variante "Untied Grow" y ocupa la posicion de profundidad d8 de dicha escalera.

El checkpoint contiene 321.388.544 parametros almacenados en FP32 (1,286 GB) y se distribuye sin ajuste por instrucciones: es un modelo base puro de prediccion del siguiente token. La configuracion incluye una anchura de 1024, 8 cabezas de atencion, vocabulario GPT-2 de 50.257 tokens (ampliado a 50.304 filas en el modelo) y una longitud de contexto de 2.048 tokens. El modo de profundidad configurado es `dep`, con 4 repeticiones del nucleo tanto en configuracion como en la evaluacion final.

Su relevancia es acotada y muy especifica: no compite como modelo de proposito general, sino que sirve como evidencia empirica reproducible para estudiar como la recursion de bloques y los operadores de frontera afectan a los exponentes de escalado. Para cualquiera que trabaje en arquitecturas recurrentes en profundidad, leyes de escalado o reutilizacion de parametros, es un punto de partida verificable, con un NLL de validacion declarado de 3,130387 nats/token sobre el propio corpus de preentrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con bucle (looped transformer), modo de profundidad `dep`, implementacion propia `TransformerGPT` |
| Parametros totales | 321.388.544 (almacenados en FP32) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible (solo se publica el checkpoint original en FP32; no hay versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | ingles (en) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`final.pt`); no es un checkpoint `AutoModel` de Transformers, no hay safetensors ni GGUF |
| Anchura (d_model) | 1.024 |
| Cabezas de atencion | 8 |
| Tokenizador | GPT-2 (`tiktoken.get_encoding("gpt2")`) |
| Vocabulario | 50.257 tokens, ampliado a 50.304 filas en el modelo |
| Repeticiones del nucleo | 4 configuradas, 4 en evaluacion final |
| Corpus de entrenamiento | FineWeb (`HuggingFaceFW/fineweb`) |
| NLL de validacion (preentrenamiento) | 3,130387 nats/token |
| Tamano del repositorio | 1,3 GB |
| Archivos incluidos | `final.pt`, `result.json`, `SHA256SUMS` |

## Arquitectura y entrenamiento

El modelo es un transformer con bucles: el nucleo de bloques se ejecuta repetidamente en lugar de apilar capas unicas, de modo que los parametros se reutilizan a lo largo de la profundidad efectiva. La model card insiste en una distincion importante: la coordenada de profundidad (d8) es la coordenada de escalado de la escalera experimental y no tiene por que coincidir con el numero de bloques Transformer ejecutados. El modo de profundidad se denomina `dep` y la configuracion fija 4 repeticiones del nucleo, tanto en entrenamiento como en la evaluacion final reportada. La anchura es de 1024 con 8 cabezas de atencion, y el tokenizador es el de GPT-2 con vocabulario de 50.257 tokens ampliado a 50.304 filas.

El preentrenamiento se realiza sobre FineWeb, en ingles. No se documenta en la informacion disponible ni el numero total de tokens vistos, ni la composicion detallada del dataset, ni si hubo fases de RLHF, DPO o ajuste por instrucciones; de hecho, la model card afirma explicitamente que se trata de un modelo base sin instruction tuning. El unico metrica de calidad declarada es el NLL de validacion sobre el corpus de preentrenamiento (3,130387 nats/token), que el autor diferencia del NLL de respuestas del benchmark CORE. El articulo emplea H100, FlashAttention-3 y autocast en bfloat16. El checkpoint conserva el artefacto de entrenamiento original (pesos y argumentos de entrenamiento) pero no incluye el estado del optimizador, por lo que no es reanudable tal cual.

## Capacidades

- Prediccion del siguiente token y generacion de texto en ingles: es un modelo base, sin alineacion ni ajuste por instrucciones.
- Razonamiento y conocimiento general: no disponible (no se publican resultados de benchmark en la informacion proporcionada).
- Generacion de codigo: no disponible.
- Matematicas: no disponible.
- Soporte de tool calling o function calling: no documentado, y poco probable en un modelo base de 321 M de parametros sin ajuste.
- Soporte de agentes o razonamiento multi-paso: no documentado.
- Capacidades multilingues: limitadas al ingles; el modelo declara unicamente `en`.
- Vision, audio u otras modalidades: no disponibles.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Uso como artefacto de investigacion: reproducible mediante el codigo del articulo para evaluar el efecto de la recursion y el crecimiento en los exponentes de escalado.

## Casos de uso

- Reproduccion de leyes de escalado: el checkpoint es una pieza de la escalera de profundidad del articulo, de modo que permite reejecutar la evaluacion CORE (22 tareas, semillas 0/1/2) y contrastar los exponentes de escalado reportados.
- Ablaciones sobre recursion en profundidad: comparar los 4 ciclos del nucleo frente a variantes con distinto numero de repeticiones para aislar el efecto de la reutilizacion de parametros en el NLL.
- Punto de partida para fine-tuning supervisado en ingles: al ser un base model de 321 M de parametros, admite SFT sobre dominios concretos (soporte tecnico, clasificacion de texto, resumen) con coste de computo bajo.
- Investigacion en interpretabilidad: su tamano reducido y su estructura en bucle facilitan analizar como evolucionan las representaciones internas a lo largo de las repeticiones del nucleo, algo mas costoso en modelos con decenas de capas independientes.
- Destilacion y experimentos de transferencia: puede actuar como estudiante en experimentos de destilacion desde modelos mayores, o como referencia de bajo coste para medir cuanto conocimiento se retiene con 321 M de parametros.
- Generacion de texto base para prototipos en ingles: completado de documentos y generacion de borradores dentro de un pipeline experimental, siempre que se acepte que no sigue instrucciones ni mantiene formato conversacional.
- Validacion de infraestructura de evaluacion: sirve como caso de prueba para arneses de evaluacion propios, ya que incluye `result.json` con configuracion, conteo de parametros y metricas de validacion registradas.
- Estudio de eficiencia de atencion: con contexto de 2.048 tokens y anchura 1.024, es un banco de pruebas barato para comparar implementaciones de atencion (por ejemplo, FlashAttention-3 frente a alternativas) sin necesidad de grandes clústeres.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato numerico reportado es el NLL de validacion sobre el corpus de preentrenamiento:

| Metrica | Valor | Notas |
|---|---|---|
| NLL de validacion (preentrenamiento) | 3,130387 nats/token | Medido sobre FineWeb; distinto del NLL de respuestas de CORE |
| CORE (22 tareas, semillas 0/1/2) | no disponible | La model card describe como ejecutarlo, pero no publica puntuaciones completas; advierte que las puntuaciones de smoke test no equivalen a los resultados del articulo |
| MMLU, HumanEval, GSM8K u otros | no disponible | No mencionados en la informacion proporcionada |

## Requisitos de hardware

- VRAM para inferencia: los 321.388.544 parametros ocupan 1,286 GB en FP32; en bfloat16 o float16 bajan a aproximadamente 0,64 GB y en int8 a unos 0,32 GB. El coste de activaciones es reducido por el contexto de solo 2.048 tokens.
- GPU recomendadas: el articulo usa H100 con FlashAttention-3 y autocast en bfloat16. Para inferencia aislada basta cualquier GPU moderna; FlashAttention-3 es especifica de arquitecturas Hopper, mientras que FlashAttention-2 cubre Ampere y posteriores.
- GPU de consumo: si, cabe con holgura en cualquier GPU consumer con 4 GB o mas de VRAM, e incluso en iGPU con memoria unificada si se reduce la precision. Una RTX 4090 o una RTX 3060 son mas que suficientes.
- Opciones de despliegue: no hay soporte documentado para vLLM, llama.cpp, Ollama, TGI ni otros servidores estandar, porque el artefacto no es un `AutoModel` de Transformers ni un GGUF. La ruta prevista es clonar el repositorio `cue-engineering/loop`, instalar sus dependencias y cargar `final.pt` junto con `result.json` mediante `eval.py`.
- Latencia y throughput: no disponibles. No se publican mediciones de latencia, tokens por segundo ni tamano de lote recomendado.
- Almacenamiento: el repositorio completo ocupa 1,3 GB, de los cuales 1,286 GB corresponden al checkpoint en FP32.

## Comparativa con modelos similares

La informacion proporcionada no incluye comparaciones con otros modelos ni resultados de benchmark que permitan situar a loop-untied-grow-d8 frente a alternativas. La tabla siguiente recoge unicamente atributos publicos ampliamente documentados de modelos base de tamano cercano, marcando como "no disponible" todo dato de rendimiento que no se pueda contrastar con la informacion disponible:

| Modelo | Parametros | Contexto | Licencia | Formato / despliegue | Rendimiento comparado |
|---|---|---|---|---|---|
| loop-untied-grow-d8 | 321.388.544 | 2.048 | no disponible | PyTorch custom (`.pt`), requiere el codigo del articulo | NLL de validacion 3,130387 nats/token en FineWeb |
| Pythia-410M | 410 M (aprox.) | 2.048 | Apache-2.0 | safetensors, integrable en Transformers | no disponible en la informacion proporcionada |
| OPT-350M | 331 M (aprox.) | 2.048 | MIT | safetensors, integrable en Transformers | no disponible en la informacion proporcionada |
| GPT-2 medium | 355 M (aprox.) | 1.024 | MIT modificada | safetensors, integrable en Transformers | no disponible en la informacion proporcionada |

La diferencia estructural relevante no es de rendimiento sino de naturaleza del artefacto: los tres modelos de comparacion son checkpoints estandar con soporte directo en el ecosistema Transformers, mientras que loop-untied-grow-d8 es un checkpoint de investigacion atado a un codigo concreto y sin versiones cuantizadas.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. No hay informe de evaluacion de sesgos ni descripcion de filtrado del corpus mas alla de la referencia a FineWeb.
- Riesgo de alucinacion: alto en cualquier uso generativo, ya que es un modelo base de 321 M de parametros sin alineacion ni ajuste por instrucciones.
- Limitacion de contexto: 2.048 tokens. No es adecuado para documentos largos, conversaciones extensas ni tareas de recuperacion con contexto amplio.
- Limitacion de idioma: entrenado y declarado unicamente en ingles. El rendimiento en castellano no esta documentado y previsiblemente sera pobre.
- Licencia: no disponible. Al no especificarse terminos, no se puede asumir uso comercial; conviene contactar con el autor antes de cualquier despliegue en produccion.
- Compatibilidad: no es un checkpoint `AutoModel`, por lo que no funciona con `transformers`, vLLM, llama.cpp, Ollama ni TGI sin trabajo adicional de conversion. El propio autor indica que el modelo se reconstruye con el codigo del articulo.
- Reanudacion del entrenamiento: el checkpoint no incluye el estado del optimizador, asi que no se puede continuar el preentrenamiento tal cual.
- Ausencia de tuning: carece de capacidades conversacionales, de seguimiento de instrucciones, de tool calling y de formato estructurado fiable.
- Interpretacion de metricas: el NLL de validacion corresponde al corpus de preentrenamiento y no es comparable con el NLL de respuestas del benchmark CORE; las puntuaciones de smoke test con `--max-per-task 10` no equivalen a los resultados completos del articulo.
- Madurez del artefacto: cero descargas y cero likes en el momento de la consulta, sin historial de uso por terceros que permita estimar su robustez en entornos reales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CharlieChen/loop-untied-grow-d8
- Repositorio de codigo del articulo (evaluacion y reconstruccion del modelo): https://github.com/cue-engineering/loop
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb
- Articulo de referencia: "How Model Growth, Recursion, and Boundary Operators Influence Scaling Exponents" (no se ha encontrado URL del paper en la informacion disponible).
- Resultados de busqueda web: no se han localizado enlaces relevantes. Las consultas devolvieron exclusivamente resultados no relacionados con el modelo (paginas de inicio de sesion de Gmail), por lo que no se aportan fuentes adicionales.
