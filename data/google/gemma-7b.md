# google/gemma-7b

## Resumen

Gemma 7B es un modelo de lenguaje de tipo text-to-text, decoder-only, publicado por Google el 8 de febrero de 2024 bajo la familia Gemma. Se distribuye a traves de HuggingFace con pesos abiertos, pero con acceso restringido (gated): es necesario aceptar las condiciones de uso en la plataforma antes de poder descargarlo. El repositorio `google/gemma-7b` corresponde a la variante preentrenada (no ajustada a instrucciones), con 8.537.680.896 parametros reales segun los pesos en safetensors y un tamano de repositorio de 192,5 GB.

El modelo deriva de la investigacion y la tecnologia empleadas en la familia Gemini, y su objetivo es ofrecer un modelo denso de tamano medio que pueda ejecutarse en infraestructura asequible, incluidas GPU de consumo, manteniendo una calidad competitiva en tareas de generacion de texto, razonamiento y codigo. La ficha oficial declara una ventana de contexto de 8192 tokens y un entrenamiento sobre aproximadamente 6 billones de tokens de datos predominantemente en ingles, con fecha de corte de conocimiento en febrero de 2023.

Su relevancia actual radica en tres factores: la licencia Gemma permite uso comercial con condiciones, el ecosistema de herramientas lo soporta de forma nativa (transformers, text-generation-inference, GGUF para llama.cpp, despliegue en SageMaker) y su tamano de 8,5 B de parametros lo situa en el punto dulce entre capacidad y coste de inferencia para despliegues en una sola GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (denso, no MoE) |
| Parametros totales | 8.537.680.896 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | Pesos en safetensors (bfloat16/float32) en el repo oficial; etiqueta `gguf` presente, lo que implica conversiones GGUF disponibles; cuantizacion de 8 y 4 bits posible via bitsandbytes/QLoRA. El detalle exacto de variantes no esta disponible en la informacion proporcionada |
| Idiomas soportados | Principalmente ingles (la ficha oficial indica disponibilidad en ingles); el campo de idiomas del repositorio figura como no disponible |
| Licencia | `gemma` (Gemma Terms of Use), con politica de uso prohibido asociada y uso comercial permitido bajo condiciones |
| Formato de pesos | safetensors y GGUF; repo de 192,5 GB con multiples variantes |
| Acceso | Restringido (gated): requiere aceptar condiciones en HuggingFace |
| Libreria | transformers |
| Pipeline | text-generation |
| Fecha de publicacion | 2024-02-08 (ultima actualizacion: 2024-06-27) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only denso, con normalizacion RMSNorm, activaciones GeGLU y atencion con embeddings rotatorios (RoPE). No emplea mezcla de expertos (MoE) ni mecanismos de atencion lineal o estado recurrente: es un transformer clasico de complejidad cuadratica en la longitud de secuencia, con la diferencia de que el coste de atencion crece con los 8192 tokens de contexto declarados. El vocabulario declarado en la ficha oficial es de 256 000 tokens, entrenado con SentencePiece. Los hiperparametros de capas, dimension oculta y numero de cabezas no estan disponibles en la informacion proporcionada.

En cuanto al entrenamiento, la informacion disponible indica que se utilizaron aproximadamente 6 billones de tokens de datos predominantemente en ingles, con una fecha de corte de conocimiento en febrero de 2023. No se detalla en la informacion proporcionada la composicion exacta del dataset, la proporcion de datos de codigo o matematicas, ni si se aplicaron fases de RLHF o DPO sobre esta variante. Es importante senalar que `google/gemma-7b` es el modelo preentrenado, sin ajuste por instrucciones; el ajuste conversacional se publica por separado en la variante `gemma-7b-it`. El repositorio incluye la etiqueta `eval-results`, lo que indica que la model card publica resultados de evaluacion.

## Capacidades

- Generacion de texto libre en ingles: continuacion de prompt, redaccion, resumen y reformulacion.
- Razonamiento de sentido comun y comprension lectora: la model card evalua tareas tipo HellaSwag, ARC, PIQA o WinoGrande.
- Matematicas elementales y razonamiento aritmetico: se evalua con GSM8K y MATH en el informe asociado.
- Generacion de codigo: se evalua con HumanEval y MBPP; util como base para ajuste fino en tareas de programacion.
- Evaluacion academica multiarea: la ficha incluye referencias a evaluaciones tipo MMLU, AGIEval y BBH.
- Capacidad multilingue: limitada; el modelo esta entrenado principalmente en ingles y la ficha no declara soporte oficial de otros idiomas.
- Tool calling / function calling: no confirmado en la informacion proporcionada para esta variante preentrenada. Es una capacidad que suele requerir ajuste por instrucciones o fine-tuning especifico.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion proporcionada; al ser un modelo base sin ajuste por instrucciones, no incorpora plantillas de conversacion ni de uso de herramientas.
- Capacidades especiales: no se documentan modo de razonamiento explicito (`thinking`), vision, audio ni decodificacion especulativa nativa en la informacion disponible.

## Casos de uso

- Fine-tuning para dominios verticales: al ser un modelo base, es un punto de partida habitual para SFT y LoRA/QLoRA sobre corpus legales, medicos, financieros o tecnicos en ingles, aprovechando sus 8,5 B de parametros para entrenar con una sola GPU de 24 GB en cuantizacion de 4 bits.
- Clasificacion y etiquetado de texto a escala: mediante cabeceras de clasificacion o prompting con logits sobre la primera posicion, se puede usar para moderacion, enrutado de tickets o categorizacion de documentos con coste de inferencia bajo.
- Generacion de embeddings y busqueda semantica: las activaciones internas del modelo sirven como representaciones densas para recuperacion de informacion y clustering en pipelines RAG, especialmente en corpus en ingles.
- Asistente de redaccion tecnica: redaccion de documentacion, changelogs y resumenes de incidencias en ingles, con la ventana de 8192 tokens permitiendo procesar documentos largos completos sin trocear.
- Generacion asistida de codigo en entornos internos: completado de funciones, generacion de tests y explicacion de fragmentos, desplegado en infraestructura propia para evitar enviar codigo propietario a APIs externas.
- Investigacion academica sobre modelos abiertos: como checkpoint base reproducible para estudios de escalado, evaluacion de sesgos, interpretabilidad o comparativas de tecnicas de cuantizacion, dado que los pesos y la arquitectura son publicos.
- Preentrenamiento continuado sobre corpus especializados: continuar el preentrenamiento con datos de un dominio concreto (por ejemplo, documentacion clinica en ingles) antes de un ajuste supervisado, aprovechando que el checkpoint base no esta alineado con instrucciones.
- Servicio de autocompletado en herramientas internas: integrado via vLLM o TGI para sugerencias de texto en editores y formularios, con latencias de decenas de milisegundos por token en GPU de gama alta.

## Benchmarks y rendimiento

No se han publicado los valores numericos de benchmarks en la informacion disponible. La model card del repositorio incluye la etiqueta `eval-results` y las etiquetas del repositorio referencian articulos de evaluacion, entre ellos MMLU (arXiv:2009.03300), HellaSwag (arXiv:1905.07830), GSM8K (arXiv:2110.14168), HumanEval (arXiv:2107.03374), MBPP (arXiv:2108.07732), AGIEval (arXiv:2304.06364), BBH (arXiv:2206.04615) y otros. Los valores concretos por tarea no estan disponibles en la informacion proporcionada y deben consultarse directamente en la model card y en el informe tecnico de la familia Gemma.

## Requisitos de hardware

- VRAM estimada en bfloat16: aproximadamente 17 GB solo para pesos (8,54 B x 2 bytes), mas unos 1,8 GB de cache KV para llenar los 8192 tokens de contexto (28 capas no confirmadas; el calculo depende de la configuracion exacta de cabezas KV).
- VRAM estimada en float32: aproximadamente 34 GB solo para pesos.
- VRAM estimada en int8: aproximadamente 9 GB de pesos, mas cache KV.
- VRAM estimada en 4 bits: aproximadamente 5-6 GB de pesos, apto para GPU de 8-12 GB con contexto reducido.
- GPU recomendadas: A100 40/80 GB, H100 80 GB, L40S o RTX A6000 para produccion; RTX 4090 (24 GB) para bfloat16 con contexto largo; RTX 3090 (24 GB) equivalente.
- Cabe en GPU de consumo: si. En RTX 4090/3090 (24 GB) en bfloat16 con contexto moderado; en RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4070 en cuantizacion de 4 bits.
- Opciones de despliegue: transformers, text-generation-inference (etiqueta `text-generation-inference`), vLLM, llama.cpp y Ollama mediante GGUF, despliegue gestionado en Amazon SageMaker (etiqueta `deploy:sagemaker`), y compativle con endpoints (etiqueta `endpoints_compatible`).
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Acceso | Rendimiento |
|---|---|---|---|---|---|
| Gemma 7B | 8,54 B | 8192 tokens | Gemma Terms of Use (comercial con condiciones) | Gated en HuggingFace | Valores no disponibles en la informacion proporcionada |
| Mistral 7B v0.1 | 7,3 B (referencia publica) | 8192 tokens con ventana deslizante de 4096 | Apache 2.0 | Abierto | No disponible en la informacion proporcionada |
| Llama 2 7B | 6,7 B (referencia publica) | 4096 tokens | Llama 2 Community License | Gated en HuggingFace | No disponible en la informacion proporcionada |
| Qwen1.5-7B | 7,7 B (referencia publica) | 32768 tokens | Apache 2.0 (segun su ficha) | Abierto | No disponible en la informacion proporcionada |

Nota: los datos de los modelos alternativos proceden de sus fichas publicas y no de la informacion proporcionada en esta busqueda; se incluyen solo como contexto de categoria. No se dispone de comparativas numericas de rendimiento verificadas en la informacion disponible.

## Limitaciones y advertencias

- Modelo base sin alineacion: `google/gemma-7b` no esta ajustado por instrucciones, por lo que no responde de forma fiable a formatos conversacionales ni sigue instrucciones complejas sin fine-tuning previo. Para uso conversacional debe emplearse `gemma-7b-it`.
- Idiomas: entrenamiento predominantemente en ingles; el rendimiento en castellano u otros idiomas es previsiblemente inferior y no esta garantizado por la ficha oficial.
- Fecha de corte: febrero de 2023. No conoce acontecimientos, APIs ni versiones de librerias posteriores a esa fecha.
- Alucinacion: como cualquier modelo de lenguaje autorregresivo, puede generar contenido factualmente incorrecto con apariencia de verosimilitud, especialmente en dominios especializados o preguntas de actualidad.
- Sesgos: al entrenarse sobre datos web a gran escala, puede reproducir estereotipos y sesgos sociales, demograficos y culturales presentes en esos datos. No se detallan en la informacion disponible las medidas de mitigacion aplicadas.
- Contexto limitado: 8192 tokens. Tareas que requieran documentos o historiales mas largos necesitan tecnicas de troceado, recuperacion o extension de contexto, con el coste adicional correspondiente.
- Licencia: la Gemma Terms of Use permite uso comercial, pero impone obligaciones de distribucion de los terminos y una politica de uso prohibido que restringe determinados casos (por ejemplo, usos daninos, vigilancia masiva o aplicaciones de alto riesgo). Es imprescindible revisar los terminos antes de un despliegue en produccion.
- Acceso restringido: la descarga requiere aceptar condiciones en HuggingFace, lo que anade friccion a pipelines automatizados y a la reproducibilidad de experimentos.
- Sin capacidades multimodales: no procesa imagenes ni audio.
- Tension de memoria en produccion: en bfloat16 y con contexto completo, el modelo ocupa cerca de 19 GB, lo que deja poco margen en GPU de 24 GB si se comparte con otros procesos o se aumenta el batch.
- No se documentan en la informacion disponible garantias de seguridad, filtros de salida ni evaluaciones de red teaming especificas para esta variante.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/google/gemma-7b
- Referencia a la familia Gemini (etiqueta del repositorio): https://arxiv.org/abs/2312.11805
- QLoRA (etiqueta del repositorio): https://arxiv.org/abs/2305.14314
- MMLU (etiqueta del repositorio): https://arxiv.org/abs/2009.03300
- HellaSwag (etiqueta del repositorio): https://arxiv.org/abs/1905.07830
- Otras referencias arXiv incluidas en las etiquetas del repositorio: 1911.11641, 1904.09728, 1905.10044, 1907.10641, 1811.00937, 1809.02789, 1911.01547, 1705.03551, 2107.03374, 2108.07732, 2110.14168, 2304.06364, 2206.04615, 1804.06876, 2110.08193, 2009.11462, 2101.11718, 1804.09301, 2109.07958, 2203.09509
- La busqueda web realizada no devolvio enlaces utiles (unicamente paginas genericas de Google), por lo que no se pueden aportar enlaces adicionales a papers, blogs o demos desde esta fuente.
