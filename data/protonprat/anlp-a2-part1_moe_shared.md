# ProtonPrat/anlp-a2-part1_moe_shared

## Resumen

El modelo `ProtonPrat/anlp-a2-part1_moe_shared` es un transformer causal de arquitectura personalizada con mezcla de expertos (MoE), publicado como entrega de la Assignment 2 de un curso de ANLP (Advanced Natural Language Processing). Lo desarrolla el usuario ProtonPrat y su finalidad es academica: sirve como artefacto reproducible de un ejercicio sobre implementacion de MoE, bucles de optimizacion y decodificacion. Cuenta con 10.084.480 parametros totales y fue entrenado sobre 30.000.000 de posiciones de un corpus de tripletas en ingles, vietnamita y japones.

El modelo se entrena como modelo de lenguaje causal y su evaluacion se limita a dos metricas automaticas sobre el conjunto de test: perplejidad de 7,904347 y BLEU de continuacion de 13,034853. No emplea la arquitectura estandar de HuggingFace Transformers, por lo que no se carga mediante `AutoModel`; requiere la clase `src.part1.model.Transformer` del repositorio del curso o el script `scripts/infer.py`.

Su relevancia es acotada y hay que enmarcarla correctamente: no es un modelo de proposito general ni compite con modelos de escala similar orientados a produccion. Es util como banco de pruebas docente, como referencia reproducible de una implementacion MoE a pequena escala y como base para experimentos de tokenizacion y decodificacion. No se ha publicado licencia, ficha de pipeline ni resultados de benchmarks estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con mezcla de expertos (MoE) de implementacion personalizada; no registrado como arquitectura AutoModel de Transformers |
| Parametros totales | 10.084.480 |
| Parametros activos | no disponible (no se documentan el numero de expertos, el enrutador ni el top-k) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en), vietnamita (vi), japones (ja) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`hf_export/model.safetensors`); estados de reanudacion en PyTorch `.pt` (`final.pt`, `latest.pt`, `best.pt`) |
| Tokenizer | BPE byte-level entrenado solo con los datos de entrenamiento (`hf_export/tokenizer.json`); vocabulario no disponible |
| Tamano del repositorio | 0,3 GB |
| Libreria declarada | pytorch |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal con capas de mezcla de expertos, segun indican el nombre del checkpoint (`part1_moe_shared`) y la propia model card, que menciona que "MoE, optimizer updates y decoding fueron implementados para la asignatura". Se trata de una implementacion propia, no de una arquitectura registrada en la libreria Transformers, y el export no incluye un `AutoModel`, de modo que la carga exige el codigo del repositorio del curso. El numero de capas, la dimension oculta, el numero de cabezas de atencion, el numero de expertos, la estrategia de enrutamiento y la posible existencia de expertos compartidos no se detallan en la informacion disponible.

El entrenamiento consumio 30.000.000 de posiciones sobre el dataset `belumind/en-vi-ja-curated-500k-triplets`, en la revision `849990daee76e0f9e2eb9965e30e34bc1909a93d`. No se documentan el numero de tokens efectivos, la composicion exacta del dataset, ni si hubo fases de RLHF, DPO o ajuste por instrucciones; por el planteamiento del ejercicio, cabe esperar entrenamiento puramente auto-supervisado de modelado de lenguaje, pero esto no se confirma en la informacion proporcionada. El tokenizer es un BPE byte-level entrenado exclusivamente con los datos de entrenamiento, lo que limita su cobertura fuera del dominio del corpus. Los resultados publicados corresponden a una unica semilla y a una configuracion sin barrido de ajuste de hiperparametros del optimizador, tal como advierte el propio autor.

## Capacidades

- Generacion de texto causal: continuacion de secuencias en ingles y, segun los scripts del repositorio, tambien en vietnamita y japones mediante los argumentos `--language vi` y `--language ja`.
- Modelado de lenguaje auto-supervisado: calculo de verosimilitud y perplejidad sobre texto de los tres idiomas del corpus.
- Continuacion de prompt en ingles: los modelos de la Parte 2 del ejercicio aceptan un prompt de continuacion en ingles, segun la model card.
- Traduccion experimental: el script de inferencia expone los idiomas vi y ja, lo que apunta a tareas de traduccion dentro del ejercicio, aunque no se documenta calidad semantica.
- Capacidad multilingue limitada a en, vi y ja; no se declaran otros idiomas.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes, razonamiento multi-paso ni modo de pensamiento.
- No se documentan capacidades de vision, audio ni multimodalidad.
- No se declara alineacion mediante RLHF, DPO o ajuste de instrucciones.

## Casos de uso

- Docencia y reproduccion de MoE: el modelo permite estudiar el comportamiento de una capa de mezcla de expertos a escala reducida, ejecutando el codigo del repositorio y comparando la perplejidad de test declarada (7,904347) con variantes propias.
- Banco de pruebas de pipelines de inferencia: al ocupar menos de 0,3 GB en el repositorio y alrededor de 40 MB de pesos en FP32, se puede usar para validar scripts de carga, decodificacion y post-procesado en integracion continua sin coste de GPU.
- Experimentos de tokenizacion: el tokenizer BPE byte-level entrenado solo con el corpus permite estudiar el efecto del vocabulario en un corpus trilingue en-vi-ja y comparar con tokenizers preentrenados.
- Traduccion exploratoria en-vi y en-ja: mediante `scripts/infer.py --language vi` o `--language ja` se pueden obtener traducciones de baja calidad para analisis cualitativo, nunca para uso productivo.
- Investigacion de tecnicas de decodificacion: el autor indica que la decodificacion se implemento especificamente para la asignatura, lo que lo convierte en un entorno controlado para probar estrategias de muestreo, temperatura y penalizaciones.
- Linea base en estudios comparativos: sirve como referencia de muy bajo parametraje (10,08 M) frente a modelos MoE mayores en trabajos academicos sobre escalado y enrutamiento.
- Analisis de sensibilidad a la semilla: dado que los resultados publicados son de una unica semilla, es un punto de partida para estudiar varianza entre ejecuciones.
- Depuracion de estados de entrenamiento: los ficheros `final.pt`, `latest.pt` y `best.pt` incluyen modelo, optimizador, estado RNG y cursor del tokenizer, utiles para reproducir la reanudacion de un entrenamiento.

## Benchmarks y rendimiento

Los unicos datos publicados por el autor son las metricas de test del ejercicio:

| Metrica | Resultado | Notas |
|---|---|---|
| Perplejidad de test | 7,904347 | Resultado de una unica semilla; sin barrido de ajuste del optimizador |
| BLEU de continuacion de test | 13,034853 | Metrica automatica de solapamiento; no establece calidad semantica |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, MT-Bench u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 40 MB en FP32, 20 MB en FP16/BF16 y 10 MB en int8, calculados a partir de 10.084.480 parametros.
- La inferencia es viable en CPU sin GPU dedicada, dado el reducido numero de parametros.
- Cabe holgadamente en cualquier GPU de consumo, incluidas GTX 1050 Ti, RTX 3060 o RTX 4090; estas ultimas quedan muy sobredimensionadas para este modelo.
- El repositorio completo ocupa 0,3 GB, principalmente por los estados de reanudacion de entrenamiento (`.pt`), no por los pesos de inferencia.
- Opciones de despliegue: al no registrar una arquitectura AutoModel, no es compatible directamente con vLLM, TGI, Ollama o llama.cpp; la ruta soportada es la clase `Transformer` del repositorio de la asignatura o el script `scripts/infer.py`.
- No se dispone de datos de latencia ni de throughput.
- La conversion a GGUF requeriria implementar manualmente el grafo del modelo, ya que no existe soporte nativo en llama.cpp para esta arquitectura.

## Comparativa con modelos similares

No hay modelos de produccion comparables en este rango de parametros y con esta licencia indeterminada. Las alternativas mas cercanas son otras publicaciones del mismo ejercicio:

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ProtonPrat/anlp-a2-part1_moe_shared | 10.084.480 | no disponible | Perplejidad 7,904347; BLEU 13,034853 | no disponible | HuggingFace |
| DunkRonit/anlp-a2-part1-moe_shared | no disponible | no disponible | no disponible | no disponible | HuggingFace |
| sanyam2005/anlp-a2-part1-moe-shared | no disponible | no disponible | no disponible | no disponible | HuggingFace |
| raunakseksaria/anlp-a2-moe | no disponible | no disponible | no disponible | no disponible | HuggingFace |

No se dispone de informacion tecnica de las variantes anteriores mas alla de su existencia; se listan unicamente como publicaciones hermanas del mismo tipo de ejercicio. No se incluyen comparaciones con modelos como GPT-2 small porque no hay datos publicados que permitan un contraste homogeneo con este checkpoint.

## Limitaciones y advertencias

- Licencia no especificada: al no declararse licencia, no hay autorizacion explicita de uso comercial; cualquier despliegue en produccion queda en un limbo legal.
- Los resultados proceden de una unica semilla y de una configuracion sin barrido de hiperparametros, por lo que la varianza entre ejecuciones es desconocida.
- El propio autor advierte que las metricas automaticas de verosimilitud y solapamiento no establecen calidad semantica.
- El desarrollo de MoE, actualizaciones del optimizador y decodificacion se realizo con asistencia de codigo generado por LLM, lo que introduce riesgo de errores sutiles no auditados externamente.
- Riesgo de alucinacion alto: es un modelo causal pequeno, sin alineacion documentada y entrenado con un corpus acotado de tripletas.
- Cobertura idiomatica limitada a ingles, vietnamita y japones; no hay evidencia de comportamiento correcto en castellano ni en otros idiomas.
- Tokenizer entrenado solo con los datos del ejercicio, lo que degrada el rendimiento fuera de dominio y con vocabulario tecnico o de baja frecuencia.
- Longitud de contexto desconocida: no se puede planificar el truncado ni el troceado documental sin consultar el `config.json` del export.
- No es cargable con `AutoModel` de Transformers, lo que rompe la compatibilidad con la mayoria de herramientas estandar del ecosistema.
- No se documentan sesgos especificos, pero el corpus de origen no esta descrito en detalle, por lo que no se pueden evaluar sesgos de genero, nacionalidad o dominio.
- No apto para uso en produccion, atencion al cliente ni tareas con requisitos de fiabilidad o cumplimiento normativo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ProtonPrat/anlp-a2-part1_moe_shared
- Ejecucion de W&B: https://wandb.ai/proton_prat/anlp-assignment-2/runs/19hsejwz
- Dataset de entrenamiento: https://huggingface.co/datasets/belumind/en-vi-ja-curated-500k-triplets (revision `849990daee76e0f9e2eb9965e30e34bc1909a93d`)
- Variante hermana: https://huggingface.co/DunkRonit/anlp-a2-part1-moe_shared
- Variante hermana: https://huggingface.co/sanyam2005/anlp-a2-part1-moe-shared
- Variante hermana: https://free2aitools.com/model/raunakseksaria/anlp-a2-moe
- No se han encontrado paper, blog tecnico ni demo publicados en la busqueda web.
