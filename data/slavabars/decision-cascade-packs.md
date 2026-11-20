# slavabars/decision-cascade-packs

## Resumen

`slavabars/decision-cascade-packs` es un repositorio de pesos de cabezas de decisión (decision heads) entrenadas para la librería [decision-cascade](https://github.com/slavabars/decision-cascade), un framework que implementa decisiones tipadas (Noul, Choice y Score) con confianza calibrada, umbrales de escalado y un modelo de riesgo opcional. No se trata de un modelo de lenguaje al uso: no hay `AutoModel.from_pretrained` ni pipeline de `transformers`, sino un conjunto de cabezas ligeras que se montan sobre un encoder base (GPT-2, DistilGPT-2 o GPT-2-medium) que se referencia por separado mediante la variable `DECISION_MODEL_ID`.

El problema que resuelve es el de la toma de decisiones selectiva y consciente del riesgo en pipelines de IA: en lugar de generar texto libre, cada cabeza produce una decisión estructurada con una probabilidad calibrada, de forma que el sistema pueda decidir si responder, escalar a un humano o abstenerse. Esto lo hace relevante para arquitecturas de enrutamiento de modelos (routerbench), clasificación de tickets de soporte y sistemas de decisión con umbrales de escalado, donde la calibración (ECE, Brier) importa tanto o más que la precisión bruta.

El repositorio incluye siete packs (tres sobre AG News, uno sobre RouterBench y tres sobre un dataset sintético de soporte en ruso), con métricas de test registradas en `manifest.json`. La librería asociada es la versión v1.5.0 y la licencia del código y los pesos es Apache-2.0, aunque los términos de los datasets de origen son independientes y en varios casos desconocidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabezas de decisión (Noul / Choice / Score) sobre encoder transformer GPT-2, DistilGPT-2 o GPT-2-medium |
| Parametros totales | No disponible (el repositorio contiene solo pesos de cabezas; el encoder base es un modelo separado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende del encoder base: 1024 tokens en GPT-2 y DistilGPT-2) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) y ruso (ru) |
| Licencia | Apache-2.0 (código y pesos); licencias de datasets separadas, algunas desconocidas |
| Formato de pesos | Pesos de cabezas más `manifest.json` con SHA-256 por fichero; no se especifica el formato binario exacto |
| Version de libreria | v1.5.0 |
| Tamano del repo | 0.0 GB (según Hugging Face) |
| Dimension de features | 768 (DistilGPT-2, GPT-2) y 1024 (GPT-2-medium) |
| Packs incluidos | 7 (public-distilgpt2, public-gpt2, public-gpt2-medium, routerbench-gpt2, support-distilgpt2, support-gpt2, support-gpt2-medium) |

## Arquitectura y entrenamiento

Cada pack consiste en un conjunto de cabezas de decisión entrenadas sobre las representaciones de un encoder transformer congelado o preentrenado. La librería define tres tipos de decisión: `Noul` (decisión binaria o de abstención), `Choice` (clasificación entre opciones) y `Score` (puntuación continua). Cada cabeza produce además una confianza calibrada que permite aplicar umbrales de escalado y, opcionalmente, un modelo de riesgo. La dimensión de entrada de las cabezas coincide con la dimensión oculta del encoder (768 para DistilGPT-2 y GPT-2, 1024 para GPT-2-medium), lo que permite intercambiar encoders sin reentrenar la interfaz.

El entrenamiento se realizó sobre tres fuentes de datos: `fancyzhx/ag_news` (clasificación de noticias en cuatro categorías), `withmartian/routerbench` (enrutamiento de consultas entre modelos, variante zero-shot) y un dataset sintético propio de soporte en ruso con seis preguntas (`срочность`, `команда`, `причина`, `накал`, `эскалация`, `удержание`). No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset sintético ni si se aplicaron técnicas de RLHF o DPO; dado que se trata de cabezas de clasificación y puntuación, es probable que el entrenamiento sea supervisado con funciones de pérdida de calibración, pero este extremo no se confirma en la model card. La reproducibilidad se garantiza mediante `manifest.json`, que fija la versión de la librería, el commit git y el SHA-256 de cada fichero, verificable con `python -m training.recipe.publish_hf --verify`.

## Capacidades

- Decisión tipada con tres modalidades: `Noul` (sí/no o abstención), `Choice` (selección entre opciones discretas) y `Score` (puntuación continua).
- Confianza calibrada por decisión, con métricas ECE (Expected Calibration Error) y Brier registradas por pack.
- Umbrales de escalado configurables para derivar decisiones a un humano o a un modelo superior.
- Modelo de riesgo opcional para decisiones conscientes del coste del error.
- Clasificación de temas en noticias (packs `public-*` sobre AG News: `topic`, `business`, `tech_level`).
- Enrutamiento de consultas entre modelos (`routerbench-gpt2`: `escalate`, `route`, `benefit`).
- Clasificación de tickets de soporte en ruso (`support-*`: urgencia, equipo, causa, intensidad, escalado, retención).
- Soporte multilingüe limitado a inglés y ruso.
- No incluye generación de texto, tool calling, agentes multi-paso, visión ni audio: es un componente de decisión, no un LLM generativo.

## Casos de uso

- Enrutamiento de consultas en sistemas multi-modelo: el pack `routerbench-gpt2` decide si una consulta debe escalarse a un modelo mayor (`escalate`), a qué ruta enviarla (`route`) y qué beneficio esperado tiene (`benefit`), permitiendo optimizar coste y latencia en producción.
- Clasificación de tickets de soporte en ruso: los packs `support-*` predicen urgencia, equipo responsable, causa y probabilidad de escalado, lo que permite triar automáticamente la cola de atención y priorizar casos críticos.
- Filtrado y triaje de noticias: los packs `public-*` clasifican titulares de AG News por tema, relevancia de negocio y nivel técnico, útiles para agregadores o sistemas de recomendación de contenido.
- Decisión selectiva con abstención: gracias a la confianza calibrada y a los umbrales de escalado, el sistema puede abstenerse cuando la certeza es baja, reduciendo errores en producción a costa de derivar casos a revisión humana.
- Moderación y clasificación de contenido con umbral de riesgo: el modelo de riesgo opcional permite fijar un coste asimétrico entre falsos positivos y falsos negativos, adecuado para políticas de moderación.
- Evaluación comparativa de encoders: al compartir interfaz y preguntas entre `distilgpt2`, `gpt2` y `gpt2-medium`, los packs permiten medir el impacto del tamaño del encoder en precisión y calibración sobre la misma tarea.
- Integración como servicio HTTP: el repositorio incluye un servidor `uvicorn api.server.main:app` que sirve todos los packs a la vez y selecciona uno según la firma de la pregunta y la dimensión de features, facilitando el despliegue como microservicio de decisión.

## Benchmarks y rendimiento

Métricas de test registradas en `manifest.json` por el autor (precisión, Brier medio y ECE medio):

| Pack | Encoder | Dim | Dataset | Test accuracy | Mean Brier | Mean ECE |
|---|---|---:|---|---:|---:|---:|
| `public-distilgpt2` | distilgpt2 | 768 | ag_news | 0.879 | 0.159 | 0.055 |
| `public-gpt2` | openai-community/gpt2 | 768 | ag_news | 0.880 | 0.158 | 0.045 |
| `public-gpt2-medium` | openai-community/gpt2-medium | 1024 | ag_news | 0.873 | 0.162 | 0.056 |
| `routerbench-gpt2` | openai-community/gpt2 | 768 | routerbench_0shot | 0.548 | 0.457 | 0.057 |
| `support-distilgpt2` | distilgpt2 | 768 | support | 0.868 | 0.128 | 0.071 |
| `support-gpt2` | openai-community/gpt2 | 768 | support | 0.926 | 0.084 | 0.038 |
| `support-gpt2-medium` | openai-community/gpt2-medium | 1024 | support | 0.914 | 0.095 | 0.057 |

El autor advierte que estas métricas se midieron en el split de test de cada pack y no dicen nada sobre dominios distintos: es necesario calibrar con datos etiquetados propios antes de confiar en las tasas de escalado. No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; al tratarse de cabezas ligeras sobre un encoder GPT-2 (124M), DistilGPT-2 (82M) o GPT-2-medium (355M), la huella es muy reducida, pero no se dan cifras oficiales.
- GPU recomendadas: no especificadas; por el tamaño del encoder base, cualquier GPU consumer reciente (RTX 3060 en adelante) debería ser suficiente, aunque este extremo no se confirma en la model card.
- Cabe en GPU consumer: previsiblemente sí, dado que el encoder base es GPT-2 o variantes; no hay confirmación oficial.
- Opciones de despliegue: servidor HTTP incluido en la librería (`uvicorn api.server.main:app`), con selección automática de pack por firma de pregunta y dimensión de features. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de componente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `slavabars/decision-cascade-packs` | Cabezas de decisión sobre GPT-2 | No disponible (encoder 82M–355M) | No disponible (1024 en GPT-2) | Apache-2.0 | Hugging Face + GitHub |
| Clasificador GPT-2 fine-tuned estándar | Clasificación supervisada | 124M (GPT-2) | 1024 | Según modelo base | Hugging Face |
| RouterBench (referencia) | Benchmark de enrutamiento | No aplica | No aplica | No declarada | Hugging Face (`withmartian/routerbench`) |

No se dispone de comparativas publicadas con alternativas equivalentes de decisión calibrada en la información proporcionada; la comparación con clasificadores GPT-2 estándar es estructural (mismo encoder), no de rendimiento.

## Limitaciones y advertencias

- No es un modelo `transformers`: no funciona con `AutoModel.from_pretrained` ni con `pipeline("decision")`; requiere la librería `decision-cascade` y un encoder base configurado por `DECISION_MODEL_ID`.
- Las métricas publicadas son solo sobre los splits de test de cada pack y no garantizan generalización a dominios propios; el autor recomienda calibrar con datos etiquetados propios antes de confiar en las tasas de escalado.
- El pack `routerbench-gpt2` presenta una precisión de test baja (0.548) y un Brier alto (0.457), lo que indica dificultad intrínseca de la tarea de enrutamiento zero-shot.
- Los datasets de origen tienen licencias no declaradas o desconocidas (`ag_news`: unknown; `routerbench_0shot`: not declared), lo que puede afectar al uso comercial aunque los pesos sean Apache-2.0.
- Idiomas limitados a inglés y ruso; no hay soporte declarado para castellano.
- Riesgo de sesgo heredado de los datasets de entrenamiento (noticias y tickets sintéticos), no evaluado en la model card.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de calibración incorrecta fuera de distribución, lo que puede producir escalados erróneos.
- El dataset sintético de soporte no se redistribuye ni se documenta en detalle, lo que limita la auditoría del comportamiento en ruso.
- Repositorio con 0 descargas y 1 like en el momento de la consulta: ecosistema muy incipiente, sin validación externa conocida.

## Enlaces

- Hugging Face: https://huggingface.co/slavabars/decision-cascade-packs
- Repositorio GitHub de la librería: https://github.com/slavabars/decision-cascade
- Dataset AG News: https://huggingface.co/datasets/fancyzhx/ag_news
- Dataset RouterBench: https://huggingface.co/datasets/withmartian/routerbench
- Encoder GPT-2: https://huggingface.co/openai-community/gpt2
- Encoder GPT-2-medium: https://huggingface.co/openai-community/gpt2-medium
- Encoder DistilGPT-2: https://huggingface.co/distilgpt2
