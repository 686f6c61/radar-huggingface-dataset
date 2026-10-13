# MulticulturalAlignment/scpo-reward-model-australia

## Resumen

El SCPO Reward Model — Australia es un modelo de recompensa escalar (reward model) desarrollado por el grupo MulticulturalAlignment, un fine-tune completo del checkpoint `OpenAssistant/reward-model-deberta-v3-base`. Su función es puntuar pares (prompt, respuesta) asignando un valor escalar mayor a la respuesta preferida para un mismo prompt, según las preferencias declaradas por participantes residentes en Australia. Se publica como parte de la línea de investigación SCPO (Steerable Cultural Preference Optimization), descrita en el artículo arXiv 2606.18606 de Minsik Oh, Advit Deepak, Sophie Wu, Douwe Kiela y Ekaterina Shutova (2026).

Técnicamente es un encoder transformer de tipo DeBERTa-v3 (implementado en `transformers` mediante la clase DeBERTa-v2) con 184.422.913 parámetros y una ventana de entrada de 512 tokens. No es un modelo generativo: se usa como clasificador de secuencias (`text-classification`) que devuelve un logit escalar. Por su tamaño (menos de 200 millones de parámetros, repo de 0,7 GB) es un modelo ligero, desplegable incluso en CPU, pensado para investigación sobre alineamiento pluralista y modelado de preferencias culturalmente específicas.

Su relevancia actual radica en que aborda un problema poco cubierto: los reward models suelen entrenarse con preferencias agregadas globalmente, lo que diluye las particularidades culturales de cada población. Este checkpoint aísla las preferencias de un país concreto (Australia) partiendo de un modelo global, y publica los artefactos de reproducción (`provenance.json`, `release-settings.json`, carpeta `reproduction/`) junto con los resultados del experimento. La mejora registrada es modesta: 59,8540 % de precisión frente al 59,6107 % del modelo global de partida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeBERTa-v2 (implementación de `transformers` para DeBERTa-v3), transformer encoder |
| Parametros totales | 184.422.913 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (longitud de entrenamiento, con padding y truncado a 512) |
| Tipos de cuantizacion | no disponible (no se publican variantes cuantizadas; al ser un encoder de 184 M es viable una cuantización dinámica int8 por parte del usuario, pero no está documentada por el autor) |
| Idiomas soportados | en (inglés; la muestra es de habla inglesa dominante) |
| Licencia | MIT (los pesos fine-tuneados; el modelo base `OpenAssistant/reward-model-deberta-v3-base` también está marcado como MIT) |
| Formato de pesos | safetensors |
| Pipeline | text-classification (reward model escalar) |
| Modelo base | OpenAssistant/reward-model-deberta-v3-base (revisión `7dab4156e63944834c3aae169c3fe83955672cff`) |
| Dataset de preferencias | HannahRoseKirk/prism-alignment (revisión `18ab5cfb37456f4ec8cbc00212ce54cf7b1239f6`) |
| Tamano del repositorio | 0,7 GB |
| Fecha de creacion | 2026-10-12 |
| Ultima actualizacion | 2026-10-13 |
| Descargas / likes | 0 descargas / 1 like |

## Arquitectura y entrenamiento

El modelo es un fine-tune completo (full-model fine-tuning) del reward model `OpenAssistant/reward-model-deberta-v3-base`, que a su vez es un DeBERTa-v3-base adaptado a clasificación de secuencias. La entrada se construye concatenando literalmente `prompt + " [SEP] " + response`, con truncado y padding a 512 tokens. La salida es un único logit escalar: puntuaciones más altas indican una respuesta preferida para el mismo prompt. El autor advierte explícitamente que estas puntuaciones no son probabilidades y no están calibradas entre modelos distintos.

El entrenamiento se realizó sobre pares de preferencia de PRISM correspondientes a participantes residentes en Australia. Hiperparámetros registrados: learning rate 1e-6, batch size 8 y 1024 pasos de optimizador, con `filtering tau` = 0,5 y `weighting beta` = 1,0. La partición de usuarios de la encuesta es 85/15 y los empates en las valoraciones humanas se excluyeron de los pares de preferencia. Semillas registradas: `shuffle` de datos 2, `survey split`/modelo 0, `Trainer` 42 (la semilla de datos del Trainer queda sin definir). En la puntuación original se usan pares prompt/respuesta del tokenizer en lotes de interacción de como máximo ocho, sin truncado explícito. La innovación metodológica (SCPO, optimización de preferencias culturales «dirigible») procede del artículo asociado; el repositorio incluye el script de país exacto y el trainer/collator sin modificar dentro de `reproduction/`, y la reproducción se lanza con `python reproduction/preferences.py ./reproduction-output`.

## Capacidades

- Puntuacion de recompensa escalar: dado un prompt y una respuesta, devuelve un logit que ordena respuestas según la preferencia agregada de la poblacion de referencia (residentes en Australia).
- Clasificacion de secuencias de hasta 512 tokens mediante `AutoModelForSequenceClassification` y `AutoTokenizer`.
- Evaluacion de pares prompt/respuesta en lotes de interaccion de hasta ocho elementos.
- Uso como componente de un pipeline de alineamiento: puede emplearse como funcion de recompensa para filtrar, ordenar o ponderar respuestas generadas por otro modelo.
- Reproducibilidad: se publican `release-settings.json`, `provenance.json`, `requirements-pw-lock.txt` y el script de reproduccion del experimento.
- No genera texto: no dispone de decodificador, tool calling, function calling, capacidades de agente, vision, audio ni modo de razonamiento explicito.
- Capacidad multilingue: limitada al ingles (`language: en`); no se declara soporte de otros idiomas.

## Casos de uso

- Filtrado de respuestas en un pipeline de RLHF/DPO: usar el logit del modelo como recompensa para descartar candidatos mal valorados por la poblacion australiana antes de entrenar una politica generativa.
- Evaluacion de asistentes conversacionales orientados a Australia: puntuar pares de respuestas generadas por un LLM y comprobar si la preferencia local difiere de la del modelo global de partida.
- Investigacion en alineamiento pluralista: comparar este checkpoint con las variantes de otros paises de la misma familia para medir en que medida las preferencias culturales divergen entre poblaciones.
- Auditoria de sesgo cultural en modelos generativos: usar el reward model como sonda para detectar respuestas que un modelo agregado global consideraria aceptables pero que la subpoblacion de referencia penaliza.
- Seleccion de respuestas en produccion de bajo coste: por su tamano (184 M de parametros) puede ejecutarse en CPU o en una GPU modesta para reordenar (reranking) las N mejores salidas de un LLM grande antes de mostrarlas.
- Validacion de datasets de preferencias: comprobar la coherencia interna de un conjunto de pares de preferencia propio, puntuando cada par y detectando anotaciones anomalas.
- Reproduccion de experimentos academicos: el paquete incluye los scripts y la configuracion exacta, lo que permite replicar el resultado registrado del articulo en un entorno controlado.
- Docencia y prototipado: ejemplo minimo de reward model basado en encoder, con inferencia en pocas lineas y requisitos de hardware triviales.

## Benchmarks y rendimiento

Los unicos datos publicados son los resultados del experimento registrado por el autor. Se midieron sin reinicio de modo de modelo ni de estado aleatorio antes de puntuar; una sesion de inferencia nueva con `eval()` desactiva el dropout y puede dar una precision distinta.

| Medicion | Precision |
|---|---:|
| Modelo global de partida, global (overall) | 59,6107 % |
| Modelo SCPO, global (overall) | 59,8540 % |

Notas del autor: `validation.json` solo comprueba la carga y una inferencia finita y repetible sobre sondas genericas; no es un resultado de benchmark. Las configuraciones se ajustaron sobre una particion de test fija, por lo que los resultados de este checkpoint difieren de las medias de tres ejecuciones del articulo. No se han publicado en la informacion disponible resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, aproximadamente 0,74 GB solo de pesos (184,4 M x 4 bytes); en fp16/bf16, unos 0,37 GB; con cuantizacion int8 dinamica, unos 0,18 GB. Sumando activaciones y el tokenizer, el consumo se mantiene por debajo de 2 GB en todos los casos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. No se requiere A100, H100 ni RTX 4090; una GTX 1650, T4, L4 o incluso una iGPU moderna pueden ejecutar la inferencia.
- CPU: totalmente viable, es el escenario natural para un encoder de 184 M de parametros. No necesita GPU para funcionar.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo actual y en muchas integradas.
- Opciones de despliegue: `transformers` con PyTorch (patron de inferencia documentado por el autor), Text Embeddings Inference (el modelo lleva el tag `text-embeddings-inference`) y Hugging Face Inference Endpoints (tag `endpoints_compatible`). vLLM, llama.cpp, Ollama y TGI no estan documentados para este modelo y no se declaran compatibles.
- Latencia y throughput estimados: no disponible (el autor no publica cifras de latencia ni de rendimiento).

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Precision registrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| scpo-reward-model-australia | 184.422.913 | 512 tokens | 59,8540 % (overall, experimento registrado) | MIT | HuggingFace, 0 descargas |
| OpenAssistant/reward-model-deberta-v3-base (modelo base) | misma arquitectura y tamano (fine-tune completo) | 512 tokens | 59,6107 % (overall, punto de partida registrado) | MIT | HuggingFace |
| Otras variantes de pais de la familia SCPO | no disponible | no disponible | no disponible | no disponible | no confirmadas en la informacion proporcionada |
| Otros reward models de proposito general | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion con datos en la informacion disponible es contra el modelo base del que parte, con una mejora de 0,24 puntos porcentuales en precision global registrada. No se dispone de cifras comparativas frente a reward models alternativos.

## Limitaciones y advertencias

- Las etiquetas de pais reflejan la residencia de los participantes, no una representacion de la cultura del pais ni de las preferencias de todos sus residentes. El autor lo advierte de forma explicita.
- La muestra esta dominada por el ingles y los conjuntos de test por pais son pequenos, lo que limita la generalizacion de los resultados.
- El modelo no genera texto y no esta validado para tomar decisiones consecuentes sobre personas (uso en seleccion, admision, creditos, etc.).
- Las puntuaciones no son probabilidades y no estan calibradas entre modelos: no se pueden comparar directamente los valores de este checkpoint con los de otro reward model.
- Riesgo de sesgo: al entrenarse sobre las preferencias de un subconjunto concreto de participantes, el modelo puede penalizar respuestas legitimas para otras poblaciones y sobrerrepresentar los criterios de la subpoblacion anotadora.
- Riesgo de alucinacion: no aplica en el sentido generativo (no produce texto), pero si puede asignar puntuaciones poco fiables fuera de la distribucion de los datos de entrenamiento de PRISM.
- Los resultados publicados corresponden a un unico checkpoint con configuracion ajustada sobre una particion de test fija y difieren de las medias de tres ejecuciones del articulo; la mejora frente al modelo global es marginal (0,24 puntos) y podria no ser estadisticamente significativa.
- Licencia: los pesos se liberan bajo MIT, condicion permisiva para uso comercial. Sin embargo, el dataset PRISM tiene terminos mixtos (texto humano CC-BY-4.0, respuestas de modelo CC-BY-NC-4.0 sujetas a los terminos del proveedor original). El paquete no incluye registros de PRISM, pero conviene revisar las condiciones de la fuente de datos antes de un uso comercial derivado.
- Reproduccion: los cargadores originales usan `main` de las dependencias, por lo que es necesario verificar las revisiones registradas del modelo y de los datos antes de repetir el experimento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MulticulturalAlignment/scpo-reward-model-australia
- Articulo (arXiv 2606.18606): https://arxiv.org/abs/2606.18606
- Codigo (Steerable Cultural Preference): https://github.com/minsik-ai/Steerable-Cultural-Preference
- Modelo base: https://huggingface.co/OpenAssistant/reward-model-deberta-v3-base
- Dataset PRISM: https://huggingface.co/datasets/HannahRoseKirk/prism-alignment
- Licencia MIT: https://opensource.org/license/mit
- La busqueda web realizada no devolvio enlaces relevantes sobre este modelo (unicamente paginas de inicio de sesion de Facebook), por lo que no se anaden fuentes adicionales.
