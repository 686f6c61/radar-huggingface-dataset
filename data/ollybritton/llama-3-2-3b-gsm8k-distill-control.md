# ollybritton/Llama-3.2-3B-gsm8k-distill-control

## Resumen

Llama-3.2-3B-gsm8k-distill-control es un ajuste fino (fine-tune) del modelo base meta-llama/Llama-3.2-3B, publicado por el usuario ollybritton en HuggingFace. Se trata de un artefacto de investigación con 3.212.749.824 parámetros reales (verificados en los pesos safetensors), un repositorio de 6,4 GB y cero descargas y cero "likes" en el momento de redactar esta ficha, lo que indica que es un experimento personal y no un modelo con adopción comunitaria.

La model card publicada es prácticamente vacía: solo incluye el frontmatter con la licencia (llama3.2) y el modelo base, más la línea "Built with Llama". No documenta el dataset de entrenamiento, el procedimiento, los hiperparámetros ni los resultados. La única pista sobre su propósito está en el propio nombre del repositorio, que sugiere una destilación orientada a GSM8K (el conjunto de problemas matemáticos de nivel escolar de OpenAI) con algún componente de "control"; esta interpretación es una inferencia a partir del identificador y no está confirmada por el autor.

Su relevancia es por tanto acotada: interesa como material de partida para reproducir o auditar experimentos de destilación de razonamiento matemático sobre modelos pequeños, y como posible contraste frente al modelo base. No debe considerarse un modelo listo para producción sin una evaluación propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, tipo Llama 3.2 (derivada del modelo base meta-llama/Llama-3.2-3B; no detallada en la model card) |
| Parametros totales | 3.212.749.824 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la model card. El modelo base Llama 3.2 3B soporta 128 000 tokens segun la documentacion de Meta; no confirmado para este fine-tune |
| Tipos de cuantizacion | No se publican versiones cuantizadas. Los pesos estan en safetensors (repo de 6,4 GB, coherente con pesos en bf16/fp16 para 3,21B de parametros). Es posible generar GGUF con llama.cpp, pero no hay artefactos oficiales |
| Idiomas soportados | No disponible en la model card. El modelo base declara 8 idiomas (ingles, aleman, frances, italiano, portugues, espanol, hindi y tailandes) segun la documentacion de Meta |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No hay informacion publicada sobre el entrenamiento de este modelo. La model card no describe el dataset, el numero de tokens, la composicion de los datos, ni si se aplicaron tecnicas de RLHF, DPO o SFT. Tampoco se documenta si se congelaron capas, si se anadieron tokens especiales de "control" o si se uso LoRA y posterior fusion. Todo lo que se sabe es que parte del checkpoint meta-llama/Llama-3.2-3B y que el resultado son pesos completos en safetensors de 3,21B de parametros.

Arquitectonicamente, cabe esperar que herede la estructura del modelo base: un transformer denso con 28 capas, atencion por consultas agrupadas (GQA) con 8 cabezas de clave/valor, dimension de cabeza 128, y RoPE como codificacion posicional. Meta entreno la familia Llama 3.2 1B y 3B mediante poda y destilacion de conocimientos desde modelos mayores (Llama 3.1 8B y 70B), con un total declarado de 9 billones de tokens en el preentrenamiento de la familia. Se trata de una estimacion basada en la documentacion del modelo base, no en informacion aportada por el autor de este fine-tune. El sufijo "distill-control" del nombre sugiere una destilacion adicional, probablemente de cadenas de razonamiento, posiblemente combinada con tokens de control, pero es una hipotesis sin respaldo documental.

## Capacidades

- Generacion de texto autoregresiva: capacidad heredada del modelo base, no verificada en esta version.
- Razonamiento matematico de nivel escolar: el nombre del repositorio apunta a un ajuste sobre GSM8K, por lo que se espera que genere soluciones paso a paso para problemas aritmeticos verbales; no hay evaluacion publicada que lo confirme.
- Razonamiento multi-paso: previsiblemente entrenado para producir cadenas de razonamiento antes de la respuesta final, si la destilacion se hizo sobre trazas de ese tipo.
- Multilingue: no confirmado. El modelo base cubre 8 idiomas oficiales, pero un fine-tune sobre un dataset casi con seguridad en ingles puede haber degradado el resto.
- Tool calling / function calling: no disponible. El modelo base no es la version Instruct, por lo que no se debe asumir soporte de plantillas de herramientas.
- Comportamiento de agente y uso multi-turno: no disponible.
- Modo "thinking" explicito o etiquetas de control: no documentado, aunque el nombre del modelo sugiere algun mecanismo de este tipo.
- Vision y audio: no soportados (el modelo base Llama 3.2 3B es solo texto; las variantes multimodales de la familia son 11B y 90B).

## Casos de uso

- Investigacion sobre destilacion de razonamiento: usar el checkpoint como referencia para estudiar como se transfiere la capacidad aritmetica de un modelo mayor a uno de 3,21B y que efecto tiene el componente de "control" anadido.
- Reproduccion de experimentos academicos: al publicarse los pesos completos en safetensors, permite repetir evaluaciones sobre GSM8K y comparar con el modelo base sin reentrenar.
- Analisis de olvido catastrofico: comparar sus respuestas con las de meta-llama/Llama-3.2-3B en tareas generales (comprension lectora, sentido comun, generacion libre) para medir cuanto conocimiento general se ha degradado tras el ajuste.
- Generacion de datos sinteticos de razonamiento: producir soluciones paso a paso para aumentar un dataset propio, siempre con filtrado posterior del resultado por un verificador simbolico o un juez automatico.
- Punto de partida para un ajuste posterior: aplicar SFT o DPO especificos de un dominio (por ejemplo, fisica de secundaria o contabilidad basica) sobre este checkpoint en lugar de partir del base.
- Prototipos de tutor matematico en local: con cuantizacion de 4 bits cabe en una GPU de consumo y permitiria probar interfaces de resolucion guiada de problemas sin enviar datos a la nube.
- Evaluacion comparativa de tecnicas de control: si el modelo usa tokens de control, sirve para experimentar con la seleccion de estilo de respuesta (breve, detallada, con pasos intermedios) en un modelo pequeno.
- Auditoria de seguridad en modelos destilados: comprobar si el ajuste intensivo sobre un unico dataset aumenta la susceptibilidad a sobreajuste, repeticion o respuestas confiadamente erroneas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna metrica, y la busqueda web realizada no devolvio resultados relacionados con el modelo (los enlaces recuperados corresponden a contenido medico sobre alopecia femenina y no guardan ninguna relacion con este repositorio). Pese a que el nombre del modelo menciona GSM8K, no hay ninguna cifra de exactitud publicada por el autor.

## Requisitos de hardware

- VRAM para inferencia en bf16/fp16: aproximadamente 6,4 GB de pesos (3,21B x 2 bytes) mas overhead de runtime, lo que situa el minimo practico en torno a 8 GB de VRAM.
- Memoria de cache KV: con la arquitectura del modelo base (28 capas, 8 cabezas KV, dimension de cabeza 128), la cache en fp16 ocupa del orden de 112 KB por token, es decir, unos 0,9 GB para 8 000 tokens y unos 14 GB para 128 000 tokens. Es una estimacion derivada de la arquitectura documentada del base, no una medicion.
- Cuantizacion de 8 bits: en torno a 3,2 GB de pesos; de 4 bits (GGUF Q4_K_M): en torno a 2 GB, con perdida de calidad no medida en este modelo.
- GPU de consumo: cabe en una RTX 3060 de 12 GB, una RTX 4070 de 12 GB o una RTX 4090 de 24 GB en bf16, y en GPUs de 6-8 GB si se cuantiza. Contextos muy largos pueden desbordar la VRAM por la cache KV.
- GPU de datacenter: A100, H100, L40S o A10G, con margen amplio; utiles para servir en bf16 con lotes grandes.
- Opciones de despliegue: transformers (referencia), vLLM y TGI para servicio con batching continuo, llama.cpp y Ollama para ejecucion local cuantizada. No hay ficheros GGUF publicados, por lo que habria que convertirlos a partir de los safetensors.
- Latencia y throughput: no disponible. No hay mediciones publicadas de tokens por segundo para este checkpoint.

## Comparativa con modelos similares

Los datos de la columna de parametros y contexto proceden de la documentacion publica de cada modelo y no han sido verificados en la busqueda realizada para esta ficha; los de rendimiento no estan disponibles para este fine-tune ni se han publicado comparaciones directas.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Llama-3.2-3B-gsm8k-distill-control (este) | 3,21B | no confirmado (128k en el base) | Llama 3.2 Community License | Fine-tune de investigacion, 0 descargas, sin benchmarks publicados |
| meta-llama/Llama-3.2-3B (modelo base) | 3,21B | 128k | Llama 3.2 Community License | Referencia directa para medir el efecto del ajuste |
| meta-llama/Llama-3.2-3B-Instruct | 3,21B | 128k | Llama 3.2 Community License | Version alineada para dialogo; incluye formato de plantilla y soporte de herramientas |
| Qwen2.5-3B / Qwen2.5-3B-Instruct | ~3,09B | 32k nativo, ampliable con YaRN | licencia de investigacion de Qwen (no verificada) | Alternativa de tamano comparable con mejor cobertura multilingue declarada |
| microsoft/Phi-3.5-mini-instruct | 3,8B | 128k | MIT (segun documentacion de Microsoft, no verificada) | Alternativa con licencia permisiva y orientada a razonamiento |

## Limitaciones y advertencias

- Ausencia total de documentacion: no se conocen datos de entrenamiento, hiperparametros, licencia de los datos ni proceso de alineacion. Cualquier uso en produccion exige una evaluacion propia previa.
- Artefacto sin traccion: cero descargas y cero "likes" implica que practicamente nadie lo ha validado; no hay informes de terceros sobre su comportamiento.
- Riesgo alto de sobreajuste al dominio: un ajuste intensivo sobre un unico conjunto de problemas matematicos suele degradar la generacion general, la coherencia en conversaciones largas y el multilingue.
- Alucinacion: los modelos destilados para razonamiento pueden producir cadenas de pasos plausibles pero incorrectas, con una respuesta final erronea presentada con seguridad. Es imprescindible verificar con un checker externo.
- Idiomas: sin datos. Es probable que el rendimiento fuera del ingles sea notablemente peor que en el modelo base, que ya de por si declara un rendimiento inferior en las lenguas no inglesas de su lista oficial.
- Sesgos: no evaluados. Hereda los sesgos del corpus de preentrenamiento de Llama 3.2 y puede amplificarlos si el dataset de destilacion tenia una distribucion muy estrecha.
- Licencia: la Llama 3.2 Community License no es una licencia de codigo abierto aprobada por la OSI. Impone condiciones adicionales, entre ellas obligaciones de atribucion ("Built with Llama"), una politica de uso aceptable y una clausula que exige licencia separada de Meta para productos con mas de 700 millones de usuarios mensuales. Conviene revisar el texto completo antes de cualquier uso comercial.
- Nomenclatura no verificada: la palabra "control" en el nombre podria implicar tokens o etiquetas especiales cuyo formato de prompt no esta documentado; usarlo con una plantilla estandar puede dar resultados pobres.
- Repositorio de 6,4 GB: no incluye versiones cuantizadas ni ficheros GGUF, lo que anade un paso de conversion para despliegues ligeros.
- Fecha del modelo: el repositorio esta fechado en 2026, posterior al resto de la familia Llama 3.2; conviene comprobar si existe una version mas reciente o abandonada por el autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ollybritton/Llama-3.2-3B-gsm8k-distill-control
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B
- Version alineada del base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Documentacion de la familia Llama 3.2 en Meta: https://www.llama.com/
- Licencia Llama 3.2 Community License: https://www.llama.com/llama3_2/license/
- Paper de la familia Llama 3: https://arxiv.org/abs/2407.21783

Nota sobre la busqueda web: los resultados recuperados (articulos de UpToDate, ScienceDirect y Harvard Health sobre alopecia androgenetica femenina) no guardan relacion alguna con este modelo y se han descartado por completo. No se han encontrado papers, blogs, repositorios ni demos asociados a este checkpoint.
