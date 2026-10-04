# francesca9805/eus-latn-100mb-ppt-mp-struct-100mb_seed10

## Resumen

`eus-latn-100mb-ppt-mp-struct-100mb_seed10` es un ajuste fino (fine-tuning) del modelo `goldfish-models/eus_latn_100mb`, un modelo de lenguaje de tipo GPT-2 desarrollado dentro del proyecto Goldfish Models, orientado a lenguas con pocos recursos. El autor de este ajuste es el usuario de HuggingFace `francesca9805`, y el entrenamiento se ha realizado mediante SFT (Supervised Fine-Tuning) utilizando la librería TRL de HuggingFace. El nombre del repositorio sugiere un experimento de ablación o una variante concreta (los sufijos `ppt-mp-struct-100mb_seed10` apuntan a identificadores de configuración y semilla), aunque no se documenta su significado en la model card.

El modelo tiene 124.770.816 parámetros (~125M) según los pesos en safetensors, lo que lo sitúa en la misma escala que GPT-2 small. Hereda la arquitectura transformer decoder-only del modelo base y está publicado en formato `safetensors`, con compatibilidad declarada para `text-generation-inference` y endpoints. El pipeline es `text-generation` y se puede cargar directamente con `transformers`.

Su relevancia radica en dos factores: por un lado, forma parte de la línea de trabajo sobre euskera (el identificador `eus_latn` corresponde al código ISO 639-3 del euskera en alfabeto latino) dentro del ecosistema Goldfish, que busca cubrir lenguas infrarrepresentadas; por otro, sirve como ejemplo reproducible de un pipeline de SFT con TRL sobre un modelo pequeño. No se han publicado datos de licencia, idiomas soportados ni resultados de benchmarks en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (etiquetado como `gpt2` en los tags) |
| Parametros totales | 124.770.816 (~125M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; sin GGUF declarado) |
| Idiomas soportados | no disponible (el modelo base `eus_latn` apunta a euskera en alfabeto latino, pero no se confirma) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | goldfish-models/eus_latn_100mb |
| Libreria | transformers |
| Tamano del repositorio | 0,3 GB |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de tipo GPT-2, con 124.770.816 parámetros totales, lo que corresponde a la configuración estándar de GPT-2 small. No hay innovaciones arquitectónicas documentadas en la model card: se trata de un ajuste fino del checkpoint `goldfish-models/eus_latn_100mb`, que a su vez pertenece a la familia Goldfish de modelos pequeños entrenados para lenguas con pocos recursos. No se detalla si se modificó el tokenizador, la longitud de contexto o el vocabulario respecto al modelo base.

El entrenamiento se ha realizado mediante SFT (Supervised Fine-Tuning) con TRL 0.23.0, sobre Transformers 4.56.2, PyTorch 2.5.1+cu121, Datasets 4.8.4 y Tokenizers 0.22.1. No se especifica el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas posteriores de RLHF o DPO (los tags solo mencionan `sft`). La model card enlaza un run de Weights & Biases (`wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/ez0ct342`), que sería la fuente para inspeccionar hiperparámetros, curvas de pérdida y conjunto de datos, pero los detalles no se reproducen en la propia ficha.

## Capacidades

- Generacion de texto autoregresiva: es la funcion principal declarada por el pipeline `text-generation`.
- Conversacion de un solo turno o multi-turno basica: el ejemplo de la model card usa una lista de mensajes con rol `user`, lo que indica un formato de chat simple.
- Ajuste instruccional: al haberse entrenado con SFT, cabe esperar cierta capacidad de seguir instrucciones, aunque no se documenta su calidad.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; probable orientacion al euskera por herencia del modelo base.
- Capacidades especiales (modo pensamiento, vision, audio): no disponibles.

## Casos de uso

- Experimentacion academica con lenguas de bajos recursos: el modelo sirve como punto de partida reproducible para estudiar el efecto del SFT sobre un modelo Goldfish de euskera, comparando con el checkpoint base y variando la semilla indicada en el nombre.
- Fine-tuning posterior y ablaciones: al ser un modelo de ~125M, se puede reentrenar o adaptar (LoRA, full fine-tuning) en una sola GPU consumer, lo que lo hace util para iterar sobre tecnicas de ajuste con TRL.
- Generacion de texto en euskera para prototipos: si se confirma el soporte de euskera, puede emplearse en tareas de completado o redaccion asistida en ese idioma, siempre con supervision humana.
- Pruebas de integracion de pipelines: por su tamano reducido y su compatibilidad declarada con `text-generation-inference` y endpoints, es util para validar infraestructura de despliegue antes de migrar a modelos mayores.
- Docencia y demostraciones: su huella de memoria minima permite ejecutarlo en portatiles o entornos sin GPU para ilustrar como funciona un LLM pequeno entrenado con SFT.
- Generacion de datos sinteticos de bajo coste: puede usarse para aumentar datasets de euskera en tareas de aumentacion, con filtrado posterior por calidad.
- Evaluacion comparativa de tokenizadores: el run de W&B se enmarca en un proyecto llamado "new-tokenizers", por lo que el modelo podria emplearse para medir el impacto de decisiones de tokenizacion en lenguas con morfologia rica como el euskera.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de ~125M parametros, la huella es muy reducida. En fp16/bf16 ronda los 250 MB de pesos; en int8, unos 125 MB; en int4, unos 62 MB, sin contar el cache de atencion ni los estados intermedios.
- GPU recomendadas: cualquier GPU moderna es suficiente. No requiere A100 ni H100; una RTX 3060, RTX 4090 o incluso una GPU integrada reciente pueden ejecutarlo sobradamente.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer con al menos 1-2 GB de VRAM libre.
- Ejecucion en CPU: viable por el tamano del modelo, con latencias mayores pero funcionales.
- Opciones de despliegue: `transformers` (pipeline documentado en la model card), `text-generation-inference` (tag `text-generation-inference`), endpoints compatibles, y en general cualquier runtime que cargue safetensors de GPT-2. No se declara soporte GGUF ni Ollama en la informacion disponible.
- Latencia y throughput estimados: no disponible (no se aportan mediciones).

## Comparativa con modelos similares

La comparacion cuantitativa con alternativas no puede completarse porque faltan datos del propio modelo (licencia, contexto, benchmarks) y de sus competidores en la misma franja. Se ofrece lo que si se conoce:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| francesca9805/eus-latn-100mb-ppt-mp-struct-100mb_seed10 | 124.770.816 | no disponible | no disponible | HuggingFace | Ajuste SFT con TRL sobre Goldfish |
| goldfish-models/eus_latn_100mb | no disponible (modelo base) | no disponible | no disponible | HuggingFace | Modelo base, orientado a euskera |
| Otros GPT-2 small (~125M) | ~124M | 1024 (tipico en GPT-2, no confirmado aqui) | variable segun modelo | HuggingFace | Referencia de escala, no de idioma |

No se dispone de datos suficientes para comparar rendimiento (benchmarks) ni condiciones de licencia frente a alternativas concretas.

## Limitaciones y advertencias

- Ausencia de licencia declarada: la model card incluye el campo `licence: license` sin especificar terminos, por lo que no se puede garantizar el uso comercial ni la redistribucion. Conviene contactar con el autor antes de usarlo en produccion.
- Idiomas no confirmados: aunque el identificador `eus_latn` sugiere euskera, no se documenta el conjunto de idiomas ni la cobertura real del ajuste.
- Contexto no especificado: se desconoce la ventana de contexto efectiva, lo que impide planificar tareas que dependan de entradas largas.
- Riesgo de alucinacion: al ser un modelo de ~125M entrenado con SFT, la coherencia y la fidelidad factual seran limitadas; no es adecuado para tareas que exijan precision factual sin verificacion.
- Sesgos: no hay informacion sobre la composicion del dataset ni sobre evaluaciones de sesgo; es previsible que herede los sesgos del corpus del modelo base y del conjunto de SFT.
- Capacidades de razonamiento y codigo: no se declaran ni se evaluan; no debe asumirse un rendimiento comparable al de modelos mayores en matematicas, codigo o razonamiento multi-paso.
- Soporte de herramientas: no se documenta tool calling ni function calling, por lo que no se recomienda su uso en pipelines de agentes sin verificacion previa.
- Reproducibilidad: el nombre del modelo incluye un identificador de semilla (`seed10`), lo que sugiere que existen variantes; conviene registrar la semilla y la configuracion exactas al comparar resultados.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/eus-latn-100mb-ppt-mp-struct-100mb_seed10
- Modelo base: https://huggingface.co/goldfish-models/eus_latn_100mb
- Run de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/ez0ct342
- Repositorio TRL: https://github.com/huggingface/trl
- Proyecto Goldfish Models: no disponible
- Paper asociado: no disponible
- Demo: no disponible
