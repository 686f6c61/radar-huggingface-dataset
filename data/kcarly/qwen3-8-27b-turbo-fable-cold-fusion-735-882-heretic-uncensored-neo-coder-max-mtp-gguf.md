# kcarly/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF

## Resumen

Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF es un ajuste fino (fine-tune) de tipo multi-etapa y multi-merge sobre la familia Qwen 3.8, desarrollado por el usuario kcarly (heredero del trabajo de DavidAU) y distribuido exclusivamente en formato GGUF cuantizado. El modelo parte de `DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU` y cuenta con 26.895.998.464 parametros totales (aproximadamente 27B), con un enfoque explicito en razonamiento, generacion de codigo, escritura creativa y roleplay sin censura. Su pipeline declarado es image-text-to-text, aunque no se detalla la arquitectura de vision en la informacion disponible.

La propuesta central del autor es reducir drasticamente la longitud de los bloques de "thinking" (entre 1/2 y 1/10 respecto al Qwen 3.8 base, con una mediana de reduccion de aproximadamente 2/3) manteniendo o mejorando la calidad de salida, lo que se traduce en menor consumo de tokens y mayor velocidad de generacion. El autor afirma que el modelo supera al Qwen 3.8 27B base en siete benchmarks criticos tanto en cuantizacion de 4 bits como de 8 bits, y que alcanza 735 en ARC-C en 8 bits y 719 en 4 bits. Estas cifras proceden unicamente de la model card y no han sido verificadas de forma independiente.

El modelo se distribuye bajo licencia Apache 2.0, soporta ingles y chino, e incluye variantes GGUF "regulares" y "MTP" con doble imatrix (DI-MATRIX). El repositorio ocupa 389 GB, lo que refleja la presencia de multiples cuantizaciones. Es relevante para desarrolladores que buscan un modelo de ~27B ejecutable en hardware de consumo con modo de razonamiento eficiente y sin restricciones de contenido, aunque la ausencia de benchmarks verificables y de documentacion tecnica detallada exige cautela antes de usarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen 3.8; detalles de atencion no disponibles) |
| Parametros totales | 26.895.998.464 (~27B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF en 4 bits y 8 bits (variantes "regular" y "MTP", con DI-MATRIX / doble imatrix); lista completa de quants no disponible |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 389 GB con multiples cuantizaciones); el modelo base se distribuye en bfloat16 |

## Arquitectura y entrenamiento

El modelo es un fine-tune multi-etapa y multi-merge construido sobre Qwen 3.8 27B mediante las tecnicas que el autor denomina "COLD FUSION" (combinacion de un metodo propio llamado "GAIN" con los entrenadores de Unsloth) y "Fable Fusion 711". Segun la model card, el metodo GAIN modifica dinamicamente el entrenamiento por muestra en tiempo real a medida que el modelo aprende, y se aplico junto con Unsloth para el ajuste. No se especifican el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon RLHF o DPO; unicamente se referencian los datasets `DavidAU/Polar-STRICT-Datasets` y `DavidAU/F451-STRICT-Datasets`.

El autor declara que el ajuste incluye componentes de tipo "heretic" y "abliterated", orientados a eliminar los mecanismos de rechazo del modelo base, y que se trabajaron los tres modos de pensamiento del modelo original. La innovacion principal declarada es la reduccion del bloque de razonamiento (de 1/2 a 1/10, mediana ~2/3) junto con una reformulacion del mismo, ademas de una aceleracion de la generacion de tokens, especialmente en las variantes MTP (multi-token prediction). No se dispone de informacion sobre la arquitectura de atencion, el tokenizador ni la estrategia de decodificacion especulativa mas alla de la mencion a MTP.

## Capacidades

- Generacion de texto general, razonamiento y resolucion de problemas con modo de pensamiento ("thinking") en tres modos de operacion.
- Generacion de codigo, con enfasis declarado en el tag "coder" y en el sufijo "NEO-CODER-MAX" del nombre.
- Escritura creativa en todos los generos: narrativa, ficcion, relatos y novelas.
- Roleplay y conversacion multi-turno de tipo "conversational".
- Capacidades multimodales declaradas por el pipeline image-text-to-text (entrada de imagen y texto); el alcance real de vision no esta documentado.
- Soporte multilingue limitado a ingles y chino.
- Reduccion del consumo de tokens de razonamiento respecto al modelo base, con salida de detalle y calidad mantenidas segun el autor.
- Tool calling: el autor afirma en la model card que existe "el mejor rendimiento de tool calling registrado", aunque no aporta datos verificables en la informacion disponible.
- Modo sin censura ("uncensored", "abliterated"), sin rechazos por contenido.

## Casos de uso

- Generacion de codigo en produccion: el modelo puede integrarse en asistentes de IDE o pipelines de CI/CD para autocompletar, refactorizar y explicar codigo, aprovechando su especializacion "coder" y su menor consumo de tokens de razonamiento frente al base.
- Escritura creativa y narrativa larga: adecuado para generar relatos, dialogos y ficcion por capitulos, con capacidad declarada para mantener estilo y detalle en generos diversos.
- Roleplay y personajes conversacionales: su naturaleza "uncensored" y su soporte conversacional multi-turno lo hacen apto para entornos de entretenimiento y simulacion de personajes sin restricciones de contenido.
- Atencion al cliente automatizada: puede gestionar conversaciones multi-turno con respuestas detalladas; la ventana de contexto real debe validarse, ya que no esta documentada.
- Razonamiento asistido con bajo coste de tokens: util en agentes que encadenan pasos y necesitan thinking eficiente, dado que el autor declara reducciones de hasta 1/10 en tokens de razonamiento.
- Despliegue en hardware de consumo: las cuantizaciones de 4 bits permiten ejecutar un modelo de ~27B en GPUs de gama alta para consumidores, algo relevante para prototipado local y entornos sin infraestructura de servidor.
- Generacion de contenido multilingue ingles-chino: traduccion, redaccion y resumen en ambos idiomas soportados.
- Experimentacion en investigacion sobre alineacion y modelos abliterated: permite estudiar el comportamiento de modelos sin mecanismos de rechazo en entornos controlados.

## Benchmarks y rendimiento

La model card cita cifras de ARC-C y ARC-E, pero no presenta una tabla completa de resultados por benchmark ni comparaciones detalladas verificables. Los datos disponibles son los siguientes:

| Benchmark | Resultado declarado | Contexto |
|---|---|---|
| ARC-C (8 bits) | 735 | Afirmado por el autor; 144 puntos por encima de Qwen 3.8 27B segun la card |
| ARC-C (4 bits) | 719 | Afirmado por el autor |
| ARC-E (8 bits) | superior a 880 | Afirmado por el autor |
| Comparacion global | Supera al Qwen 3.8 27B base en 7 benchmarks criticos (4 y 8 bits) | Afirmado por el autor, sin desglose |

No se han publicado resultados verificables de MMLU, HumanEval, GSM8K u otros benchmarks en la informacion disponible. Las cifras anteriores proceden exclusivamente de la model card y no han sido contrastadas de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo de ~27B, una cuantizacion de 4 bits requiere del orden de 15-18 GB de VRAM y una de 8 bits del orden de 28-30 GB, aunque estas cifras son estimaciones generales y no datos publicados por el autor.
- GPU recomendadas: no especificadas en la informacion disponible; por tamano, cabria esperar GPUs con 24 GB o mas (RTX 3090, RTX 4090, A100, H100) para cuantizaciones de 4 bits, y GPUs de 40-80 GB para 8 bits.
- Cabe en GPU de consumo: probablemente en 4 bits en tarjetas de 24 GB, segun las estimaciones anteriores; no confirmado por el autor.
- Opciones de despliegue: al distribuirse en GGUF, es compatible con llama.cpp, Ollama y otros runners GGUF; el tag "endpoints_compatible" sugiere compatibilidad con endpoints tipo TGI/vLLM, aunque no se detalla.
- Latencia y throughput: no disponibles; el autor afirma mejoras de velocidad, especialmente en las variantes MTP, pero sin cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882 (este modelo) | ~27B | no disponible | Apache 2.0 | GGUF | Fine-tune sin censura con thinking reducido |
| Qwen 3.8 27B (base) | ~27B | no disponible | Apache 2.0 (segun familia Qwen) | bfloat16, GGUF | Referencia del autor; superado en benchmarks segun la card |
| Qwen3.6-35B-A3B | 35B totales (MoE, ~3B activos) | no disponible | no disponible | no disponible | Citado por el autor como superado en 7 benchmarks |
| Qwen 3.6 27B | ~27B | no disponible | no disponible | no disponible | Citado por el autor como superado en 7 benchmarks |
| Qwen 3.5 27B | ~27B | no disponible | no disponible | no disponible | Citado por el autor como superado en 7 benchmarks |

Los datos de los modelos comparables proceden de las afirmaciones del autor en la model card; no se dispone de especificaciones tecnicas detalladas ni de resultados de benchmarks independientes para contrastarlos.

## Limitaciones y advertencias

- Las cifras de benchmarks (ARC-C 735/719, ARC-E >880) y la afirmacion de "mejor tool calling registrado" proceden unicamente del autor y no han sido verificadas de forma independiente.
- El modelo es "uncensored" y "abliterated": no aplica rechazos por contenido, lo que implica riesgos legales y reputacionales si se despliega sin filtros externos en aplicaciones de cara al publico.
- Riesgo de alucinacion no cuantificado; no se han publicado evaluaciones de fidelidad factual.
- Idiomas soportados limitados a ingles y chino; el rendimiento en castellano no esta documentado y probablemente sea inferior.
- La longitud de contexto no esta especificada, lo que impide planificar cargas de trabajo con documentos largos.
- La documentacion tecnica es escasa: no se detallan dataset de entrenamiento, numero de tokens, proceso de alineacion ni arquitectura exacta.
- El repositorio ocupa 389 GB por la acumulacion de cuantizaciones; conviene descargar solo el quant necesario.
- Aunque la licencia es Apache 2.0, el uso comercial de un modelo sin censura puede incumplir politicas de plataformas o normativas locales; se recomienda revision legal.
- El nombre del modelo incluye referencias a Qwen 3.5, 3.6 y 3.8, lo que puede generar confusion sobre la version base real; conviene verificar la model tree antes de integrarlo.
- No hay informacion sobre latencia, throughput ni consumo de VRAM medidos, por lo que el dimensionamiento de infraestructura debe hacerse por prueba empirica.

## Enlaces

- HuggingFace: https://huggingface.co/kcarly/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Referencia de la tecnica COLD FUSION (modelo previo del autor): https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
- Dataset Polar-STRICT: https://huggingface.co/datasets/DavidAU/Polar-STRICT-Datasets
- Dataset F451-STRICT: https://huggingface.co/datasets/DavidAU/F451-STRICT-Datasets
