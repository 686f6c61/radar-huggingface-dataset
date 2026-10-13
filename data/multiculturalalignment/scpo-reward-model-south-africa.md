# MulticulturalAlignment/scpo-reward-model-south-africa

## Resumen

El SCPO Reward Model — South Africa es un modelo de recompensa escalar desarrollado por el grupo MulticulturalAlignment, un *fine-tuning* completo de `OpenAssistant/reward-model-deberta-v3-base` sobre pares de preferencia del dataset PRISM correspondientes a participantes residentes en Sudafrica. Su funcion no es generar texto, sino puntuar una respuesta dada una instruccion: puntuaciones mas altas indican una respuesta preferida por ese grupo de participantes. Con 184.422.913 parametros y un repositorio de 0,7 GB, es un encoder compacto que cabe en cualquier GPU de consumo.

El modelo implementa el algoritmo SCPO (Steerable Cultural Preference Optimization), presentado en el articulo "Steerable Cultural Preference Optimization of Reward Models" (Oh, Deepak, Wu, Kiela y Shutova, 2026, aceptado en el taller Pluralistic Alignment de ICML 2026). La idea es adaptar un modelo de recompensa global, entrenado con preferencias humanas agregadas, hacia las preferencias de usuarios de un pais concreto sin destruir el rendimiento general.

Es relevante ahora porque aborda un problema practico del alineamiento de LLM: los modelos de recompensa agregados sobrerrepresentan a las culturas mayoritarias del dataset, de modo que las preferencias de comunidades minoritarias quedan mal puntuadas. El articulo reporta mejoras de hasta 7 puntos para el modelo de recompensa de la minoria en PRISM y GlobalOpinionQA sobre 7 paises, con hasta un 280 % mas de eficiencia de datos que un *fine-tuning* completo. Este checkpoint concreto es la variante de Sudafrica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder DeBERTa-v3 base (clases `DebertaV2` de transformers) con cabeza de clasificacion de salida escalar |
| Parametros totales | 184.422.913 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (tope de la arquitectura base y del entrenamiento, con *padding* a 512) |
| Tipos de cuantizacion | No disponible (el repositorio solo publica pesos en safetensors; no se ofrecen variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 0,7 GB) |
| Modelo base | OpenAssistant/reward-model-deberta-v3-base (revision `7dab4156e63944834c3aae169c3fe83955672cff`) |
| Tarea (pipeline) | text-classification |
| Dataset de entrenamiento | HannahRoseKirk/prism-alignment (revision `18ab5cfb37456f4ec8cbc00212ce54cf7b1239f6`) |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer DeBERTa-v3 base con una cabeza de clasificacion por secuencia que produce un unico logit escalar. El modelo consume el par prompt/respuesta y devuelve la recompensa. En el entrenamiento original las entradas se construyen como la concatenacion literal `prompt + " [SEP] " + response`, truncadas y rellenadas a 512 tokens. En la puntuacion original se usan pares prompt/respuesta del tokenizer en lotes de interaccion de como maximo ocho elementos sin truncamiento explicito.

El entrenamiento es un *fine-tuning* de modelo completo partiendo del modelo base, con *learning rate* de `1e-06`, tamano de lote 8 y 1024 pasos de optimizador. Se aplica un filtrado con umbral `tau = 0.7` y una ponderacion `beta = 1.1`, que es el mecanismo con el que SCPO pondera las preferencias para no sacrificar el rendimiento global al adaptarse al pais objetivo. Los empates en las valoraciones humanas se excluyen de los pares de preferencia y el reparto de usuarios de la encuesta es 85/15. Las semillas registradas son: semilla de barajado de datos 0, semilla de encuesta/modelo 0 y semilla del Trainer 42 (la semilla de datos del Trainer no se fija). Se incluyen los scripts exactos de reproduccion, el ajuste de release y el fichero de *provenance* en el repositorio, ejecutables mediante `python reproduction/preferences.py ./reproduction-output`.

## Capacidades

- Puntuacion escalar de preferencia: dado un par prompt/respuesta en ingles, devuelve un logit que indica cuanto prefiere ese par el grupo de participantes de Sudafrica.
- Clasificacion de texto en sentido amplio, al ser un modelo `text-classification` basado en DeBERTa-v3.
- Uso como modelo de recompensa en pipelines de RLHF/DPO/GRPO y en esquemas de *best-of-n* o *rejection sampling*.
- Alineamiento pluralista: permite comparar la preferencia de un pais concreto frente al modelo global agregado.
- No genera texto: no dispone de decodificador ni de capacidad generativa.
- Sin soporte de *tool calling*, *function calling* ni razonamiento multi-paso agentico.
- Sin capacidades de vision, audio ni *thinking mode*.
- Capacidad multilingue limitada: entrenado y etiquetado solo para ingles, con la advertencia explicita de que la muestra es de dominancia inglesa.
- Compatible con `text-embeddings-inference` y con *endpoints* compatibles segun las etiquetas del repositorio.

## Casos de uso

- Filtrado de respuestas en RLHF: integrar el modelo como funcion de recompensa en un bucle de optimizacion para ajustar un LLM generativo a preferencias de usuarios sudafricanos, usando el logit como senal de ventaja frente al modelo global.
- Best-of-n con sensibilidad cultural: generar varias respuestas candidatas y seleccionar la mejor puntuada por este modelo cuando el publico objetivo esta en Sudafrica, en lugar de usar un unico modelo de recompensa agregado global.
- Auditoria de sesgo cultural en modelos existentes: puntuar los mismos pares prompt/respuesta con el modelo global y con este checkpoint, y medir la discrepancia para detectar donde el modelo agregado penaliza preferencias locales.
- Generacion de datos sinteticos de preferencia: usar las puntuaciones para etiquetar automaticamente pares de respuestas y construir datasets de preferencia especificos de la region, con coste mucho menor que la anotacion humana.
- Investigacion en alineamiento pluralista: reproducir los experimentos del articulo SCPO sobre el split de Sudafrica y comparar curvas de eficiencia de datos frente a *fine-tuning* completo.
- Moderacion y ranking de contenido asistido: ordenar respuestas de un asistente conversacional en produccion segun su adecuacion percibida por usuarios locales, con la advertencia de que no esta validado para decisiones consecuentes sobre personas.
- Evaluacion comparativa de checkpoints en un pipeline de CI: el script `reproduction/preferences.py` permite verificar que una nueva version del modelo carga y produce inferencia finita y repetible antes de desplegarla.

## Benchmarks y rendimiento

Tabla de resultados de experimentos registrados por el autor. Son puntuaciones de un experimento original en memoria tras el entrenamiento, sin reinicio del modo modelo ni del estado aleatorio antes de puntuar; una sesion de inferencia limpia en `eval()` desactiva el *dropout* y puede dar una exactitud distinta. El fichero `validation.json` comprueba la carga y la inferencia finita y repetible sobre sondas genericas, y no es un resultado de benchmark.

| Medicion | Exactitud |
|---|---:|
| Modelo global de partida, global | 64,0569 % |
| Modelo SCPO, global | 65,4804 % |

Notas del autor: las configuraciones se ajustaron sobre un *split* de test fijo y estos resultados del checkpoint difieren de las medias de tres ejecuciones del articulo. Los detalles de reproduccion estan en `provenance.json`. No se publican en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otras suites estandar, que ademas no aplican a un modelo de recompensa.

A nivel de metodo, el articulo reporta mejoras de hasta 7 puntos del modelo de recompensa de la minoria sobre la linea base, en los datasets PRISM y GlobalOpinionQA y en 7 paises, con una eficiencia de datos hasta un 280 % superior al *fine-tuning* con datos completos. Estas cifras corresponden al conjunto del metodo y no especificamente a este checkpoint de Sudafrica.

## Requisitos de hardware

Estimaciones a partir del numero de parametros publicado (184.422.913); el autor no publica requisitos de hardware.

- VRAM estimada para los pesos: aproximadamente 0,37 GB en fp16/bf16 y 0,74 GB en fp32. Anadiendo activaciones y *overhead* del runtime, un presupuesto de 1-2 GB de VRAM es suficiente en la practica.
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM. Funciona sin problemas en RTX 3060, RTX 4060, RTX 4090, T4, L4, A10G, A100 y H100; en estas dos ultimas el modelo queda enormemente infrautilizado.
- GPU de consumo: si, cabe en cualquier GPU de consumo actual e incluso en iGPU con memoria compartida suficiente.
- CPU: la inferencia en CPU es viable en fp32 para cargas de baja concurrencia, dado el tamano del modelo.
- Opciones de despliegue: `transformers` (clase `AutoModelForSequenceClassification`), Text Embeddings Inference (etiqueta `text-embeddings-inference` en el repositorio), Hugging Face Inference Endpoints (etiqueta `endpoints_compatible`), y servidores de clasificacion/recompensa como vLLM en modo *sequence classification*. No hay pesos GGUF publicados, por lo que Ollama o llama.cpp requeririan una conversion previa.
- Latencia y throughput: no disponibles. No se han publicado mediciones de latencia ni de throughput para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| scpo-reward-model-south-africa | 184.422.913 | 512 tokens | 65,4804 % de exactitud global (experimento registrado del autor) | MIT | Pesos en safetensors en HuggingFace |
| OpenAssistant/reward-model-deberta-v3-base (modelo de partida) | 184.422.913 (misma arquitectura) | 512 tokens | 64,0569 % de exactitud global reportada por el autor como linea base | MIT | Publico en HuggingFace |
| Fine-tuning completo del modelo base con los datos completos de PRISM | Igual orden de magnitud | 512 tokens | Segun el articulo, hasta un 280 % menos eficiente en datos que SCPO; sin cifra concreta para este checkpoint | No disponible para esta ficha | No disponible |

No se dispone de informacion sobre otros modelos de recompensa especificos de cultura o pais con los que comparar directamente en terminos de parametros y contexto. Los otros checkpoints por pais de la misma familia SCPO no estan documentados en la informacion proporcionada.

## Limitaciones y advertencias

- Las puntuaciones no son probabilidades y no estan calibradas entre modelos: no se pueden comparar directamente logits de este checkpoint con los de otro modelo de recompensa.
- El modelo no genera texto y no esta validado para decisiones consecuentes sobre personas.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si existe riesgo de puntuaciones poco fiables fuera de la distribucion de PRISM.
- La etiqueta de pais refleja la residencia de los participantes, no una representacion de la cultura del pais ni de las preferencias de todos sus residentes. Es un sesgo de muestreo estructural.
- La muestra tiene dominancia del ingles y los conjuntos de test por pais son pequenos, lo que limita la generalizacion mas alla del ingles y de los participantes encuestados.
- Sesgo de seleccion de participantes: al proceder de una encuesta concreta, las preferencias reflejan el perfil demografico de quienes respondieron, no la poblacion general.
- Resultados fragiles: las cifras registradas provienen de un experimento en memoria sin reinicio de estado, y una sesion de inferencia limpia puede dar valores distintos. Los numeros del checkpoint difieren de las medias de tres ejecuciones del articulo.
- Restricciones de licencia: los pesos se publican bajo MIT, y el modelo base tambien esta marcado como MIT, por lo que el uso comercial de los pesos es posible. Sin embargo, la model card del dataset PRISM indica CC-BY-4.0 para el texto humano y CC-BY-NC-4.0 para las respuestas de modelo, sujeto a los terminos de los proveedores originales. El paquete no incluye registros de PRISM.
- El repositorio no incluye datos privados, pero la reproducibilidad exacta depende de fijar las revisiones de modelo y dataset registradas y de instalar el entorno bloqueado en `requirements-pw-lock.txt`.
- Uso previsto restringido a investigacion sobre modelado de preferencias y alineamiento pluralista.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MulticulturalAlignment/scpo-reward-model-south-africa
- Modelo base: https://huggingface.co/OpenAssistant/reward-model-deberta-v3-base
- Dataset PRISM: https://huggingface.co/datasets/HannahRoseKirk/prism-alignment
- Articulo (arXiv): https://arxiv.org/abs/2606.18606
- Pagina del articulo en ICML 2026 (taller Pluralistic Alignment): https://icml.cc/virtual/2026/75659
- Repositorio de codigo: https://github.com/minsik-ai/Steerable-Cultural-Preference
- Resumen en Papers Cool: https://papers.cool/arxiv/2606.18606
- Cobertura en AIPulseLab: https://aipulselab.tech/news/steerable-cultural-preference-optimization-of-reward-models-413113
- Licencia MIT: https://opensource.org/license/mit
