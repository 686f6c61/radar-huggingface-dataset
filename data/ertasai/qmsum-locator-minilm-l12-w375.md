# ErtasAI/qmsum-locator-minilm-l12-w375

## Resumen

El modelo `ErtasAI/qmsum-locator-minilm-l12-w375` es un cross-encoder de reranking desarrollado por Ertas AI como componente de un pipeline de dos etapas (localizar y resumir) para la tarea de summarización de reuniones orientada a consultas (query-focused meeting summarization) sobre el benchmark QMSum. Su función es puntuar ventanas de transcripción de reuniones (de 375 palabras) frente a una consulta, de modo que las ventanas con mayor puntuación se empaquetan y se pasan a un adaptador summarizador. El modelo se basa en `cross-encoder/ms-marco-MiniLM-L-12-v2` (33M parámetros) y se ha ajustado con pares query-ventana construidos a partir de los spans dorados del split de entrenamiento de QMSum.

La relevancia de este modelo radica en que resuelve un problema práctico de truncamiento: el protocolo original de QMSum usaba ventanas de 900 palabras, pero la arquitectura MiniLM-L12 solo lee 512 tokens, por lo que el 97,3% de las ventanas se truncaban. Al re-chunking a 375 palabras, las ventanas caben en el contexto y el pipeline mejora en +2,01 ROUGE-1 (de 33,39 a 35,41) en el split oficial de test. Es una pieza pequeña, rápida de entrenar (7 minutos en una RTX 5070 Ti) y pensada para despliegue on-device o en infraestructura propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder Transformer (MiniLM-L12) |
| Parametros totales | 33.360.385 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (ventana de entrenamiento e inferencia: 375 palabras) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un cross-encoder basado en MiniLM-L12, una variante compacta de BERT con 12 capas y 33M de parámetros. A diferencia de un bi-encoder, el cross-encoder procesa conjuntamente la consulta y el texto a puntuar, lo que permite una interacción más rica entre ambos. Se entrena con `sentence-transformers` CrossEncoder con `num_labels=1`, produciendo un logit de relevancia no normalizado.

El entrenamiento se realizó sobre pares query-ventana construidos a partir de los spans dorados del split de entrenamiento de QMSum: una ventana se considera positiva si solapa un span dorado. Se usaron 2 épocas, batch de 32, 100 pasos de warmup y una semilla fija (20260723) siguiendo el protocolo congelado del paper. El coste de entrenamiento fue de aproximadamente 7 minutos en una NVIDIA RTX 5070 Ti con un pico de 5,27 GB de VRAM. La innovación principal es el re-chunking a 375 palabras, que evita el truncamiento sistemático que sufría el modelo con ventanas de 900 palabras (el protocolo original), y que se documenta como una desviación controlada en el paper.

## Capacidades

- Reranking de ventanas de transcripción: puntúa pares (consulta, ventana) y devuelve logits de relevancia no normalizados, utilizables para ordenar ventanas dentro de una misma consulta.
- Localización de pasajes relevantes: identifica qué segmentos de una reunión responden a una pregunta o consulta específica, basándose en la superposición con spans dorados anotados.
- Integración en pipelines de summarización: funciona como etapa 1 de un sistema locate-then-summarize, alimentando a un adaptador summarizador con las ventanas mejor puntuadas.
- Soporte multilingüe: no disponible, entrenado exclusivamente en inglés.
- Tool calling y agentes: no soportado, es un modelo de reranking puro sin capacidades de generación ni interacción con herramientas.
- Modo thinking o razonamiento extendido: no aplica, es un modelo discriminativo.

## Casos de uso

- Resumen de reuniones orientado a consultas: dado un acta o transcripción larga, el modelo localiza los fragmentos que responden a una pregunta concreta (por ejemplo, "¿qué decisiones se tomaron sobre el presupuesto?") y los pasa a un summarizador para generar una respuesta concisa. Es adecuado porque su ventana de 375 palabras captura el contexto necesario sin truncar.
- Preprocesamiento para sistemas RAG de documentos corporativos: en un pipeline de retrieval-augmented generation sobre transcripciones de reuniones, este reranker puede filtrar los chunks más relevantes antes de la generación, reduciendo ruido y mejorando la precisión de las respuestas.
- Búsqueda de información en actas parlamentarias: en el dominio de comités parlamentarios, permite localizar intervenciones o discusiones específicas sobre un tema a partir de una consulta, útil para periodistas o analistas políticos.
- Análisis de reuniones de diseño de producto: en entornos de desarrollo de producto, ayuda a extraer requisitos, decisiones de diseño o feedback de clientes a partir de grabaciones transcritas, acelerando la revisión de retrospectivas.
- Sistemas de atención al cliente con historial de llamadas: si se transcriben llamadas de soporte, el modelo puede identificar los segmentos donde se menciona un problema concreto, facilitando la creación de resúmenes automáticos por ticket.
- Componente de un sistema de QA sobre transcripciones: combinado con un modelo generativo, permite responder preguntas factuales sobre reuniones pasadas, indicando qué parte de la transcripción contiene la evidencia.

## Benchmarks y rendimiento

El modelo se evaluó en el split oficial de test de QMSum (n=281) con decodificación greedy y un único scorer congelado. La tabla siguiente compara la configuración promovida (este locator) con la configuración protocol-exact (locator L6 con ventanas de 900 palabras y presupuesto de 3.000 palabras). El summarizador adapter es idéntico en ambas filas.

| Configuracion | Locator | Presupuesto | ROUGE-1 | ROUGE-2 | ROUGE-L | ROUGE-Lsum | BERTScore |
|---|---|---|---|---|---|---|---|
| Protocol-exact | MiniLM L6, 900-word windows | 3.000 palabras | 33,39 | 10,65 | 22,83 | 29,30 | 0,8680 |
| **Promovida (este modelo)** | **MiniLM L12, 375-word windows** | **2.000 palabras** | **35,41** | **12,28** | **24,63** | **31,36** | **0,8733** |

La mejora de +2,01 ROUGE-1 tiene un intervalo de confianza del 95% de [+0,77, +3,26]. El paper advierte que la diferencia no es demostrablemente robusta al re-sembrado del entrenamiento (el rango de semillas del summarizador en este benchmark es de 1,59 ROUGE-1).

## Requisitos de hardware

- VRAM estimada: el modelo tiene 33,36M de parámetros, lo que supone aproximadamente 133 MB en fp32 y 67 MB en fp16. Cabe en cualquier GPU con al menos 1 GB de VRAM, incluso en iGPUs modernas.
- GPU recomendadas: cualquier GPU de consumo (RTX 2060 o superior) o incluso CPU. El entrenamiento se realizó en una RTX 5070 Ti con pico de 5,27 GB, pero la inferencia es mucho más ligera.
- Compatibilidad con consumer GPU: sí, es trivialmente desplegable en hardware de gama baja.
- Opciones de despliegue: compatible con `sentence-transformers` (CrossEncoder), Hugging Face Inference Endpoints, y cualquier framework que soporte safetensors (Transformers, ONNX, etc.). También puede ejecutarse con vLLM o TGI si se convierte a un formato adecuado, aunque al ser un cross-encoder, la vía natural es sentence-transformers.
- Latencia y throughput: no se han publicado datos específicos, pero dado el tamaño, se espera una latencia de milisegundos por par (consulta, ventana) en GPU y de decenas de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Ventana de trabajo | ROUGE-1 (test QMSum) | Licencia |
|---|---|---|---|---|---|
| **ErtasAI/qmsum-locator-minilm-l12-w375** | 33,36M | 512 tokens | 375 palabras | 35,41 | Apache 2.0 |
| ErtasAI/qmsum-locator-minilm-l6-w900 | ~22,7M (MiniLM L6) | 512 tokens | 900 palabras (truncado) | 33,39 | Apache 2.0 |
| cross-encoder/ms-marco-MiniLM-L-12-v2 (base) | 33,36M | 512 tokens | no aplica | no evaluado en QMSum | Apache 2.0 |

El modelo base es el punto de partida sin ajuste; el L6-w900 es el hermano protocol-exact con ventanas más grandes pero truncamiento severo. Este modelo L12-w375 es la versión optimizada que evita el truncamiento y mejora el rendimiento.

## Limitaciones y advertencias

- Entrenado y evaluado exclusivamente en transcripciones de reuniones en inglés de los tres dominios de QMSum (académico, diseño de producto y comité parlamentario). Otros tipos de documento o idiomas no están probados y probablemente den resultados pobres.
- La noción de relevancia se define como solapamiento con los spans dorados anotados en QMSum, lo que hereda los criterios subjetivos de esa anotación. No es una medida de relevancia semántica general.
- Los scores son logits no normalizados; solo deben usarse para ranking dentro de una misma consulta, no para comparar entre consultas distintas.
- La ventana de trabajo debe ser de 375 palabras; usar otros tamaños pone los inputs fuera de distribución y degrada el rendimiento.
- No es un modelo generativo: no produce resúmenes por sí mismo, solo localiza fragmentos relevantes.
- La licencia Apache 2.0 permite uso comercial sin restricciones, pero el modelo se distribuye sin garantías y con limitaciones de dominio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ErtasAI/qmsum-locator-minilm-l12-w375
- Repositorio de código y pipeline: https://github.com/ErtasAI/qmsum-locate-then-summarize
- Script del locator cross-encoder: https://github.com/ErtasAI/qmsum-locate-then-summarize/blob/main/pipeline/locator_crossencoder.py
- Modelo hermano protocol-exact: https://huggingface.co/ErtasAI/qmsum-locator-minilm-l6-w900
- Adaptador summarizador asociado: https://huggingface.co/ErtasAI/qmsum-summarizer-lfm2.5-1.2b-lora
- Paper (en preparación): *Locate-then-summarize on QMSum: training regime and architecture outweigh scale in query-focused multi-domain meeting summarization* (Ertas AI)
