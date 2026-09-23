# Berk/assay-compiled-base

## Resumen

assay-compiled-base es un modelo de decisión de tipo encoder desarrollado por Berk dentro del proyecto Assay. No genera texto ni es un modelo de lenguaje: recibe un "estado" (un texto) y un conjunto de preguntas tipadas (`bool`, `choice`, `score`) y devuelve distribuciones de probabilidad calibradas junto con una señal de `evidence`. Está construido sobre el encoder `Alibaba-NLP/gte-modernbert-base` y suma una cabeza de decisión denominada `compiled` con late interaction sobre 8 slots de consulta.

Con 149.014.272 parámetros (149M) y un repositorio de 0,6 GB, es el escalón pequeño y orientado a CPU de la familia Assay. La propia model card lo sitúa muy por debajo de los modelos decoder de la misma familia (assay-4b, assay-27b) en precisión, pero a cambio ofrece latencias de decisión de milisegundos una vez que el estado se ha codificado y las preguntas se han compilado y cacheado.

Su relevancia actual está en el nicho de las decisiones estructuradas y auditables: clasificación de un solo texto con probabilidades calibradas, umbrales conformales y posibilidad de reutilizar preguntas compiladas entre miles de estados. Frente a un LLM generativo, el coste por inferencia es mínimo, aunque el modelo no aporta conocimiento externo ni razonamiento multi-paso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder ModernBERT (`Alibaba-NLP/gte-modernbert-base`) con cabeza de decisión `compiled` de late interaction y 8 slots de consulta |
| Parametros totales | 149.014.272 (149M) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible en la model card; el backbone `Alibaba-NLP/gte-modernbert-base` se publica con 8192 tokens |
| Tipos de cuantizacion | No se declaran cuantizaciones. El tamano del repo (0,6 GB) es consistente con pesos en fp32 (149M x 4 bytes ≈ 596 MB) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se apoya en un encoder ModernBERT (`Alibaba-NLP/gte-modernbert-base`) sobre el que se monta una cabeza de decisión `compiled`. El flujo es el siguiente: el estado se codifica una sola vez en embeddings de token; cada pregunta se compila una sola vez en un conjunto de vectores de consulta (slots aprendidos más una proyección de su encoding agrupado); cada opción se representa como un vector (su encoding agrupado) y sus encodings de token. La decisión combina cuatro componentes: cross-attention desde las consultas sobre los tokens del estado, un MLP lector pequeño, una puntuación bilineal contra el vector de cada opción más un sesgo por opción, y un término de late interaction definido como la media, sobre los tokens de la opción, del mejor coseno contra los tokens del estado, multiplicada por una escala aprendida. Las preguntas compiladas pueden cachearse y reutilizarse entre estados, de modo que tras codificar el estado una decisión se reduce a unos pocos productos matriciales pequeños.

El entrenamiento se realizó con `assay.train_compiled` durante 3,0 épocas, con learning rate 5e-05, learning rate de cabeza 0,0005 y batch 32, sobre los datos de Assay: 55 conjuntos de datos públicos renderizados como preguntas tipadas, casos sintéticos de política y fechas, y 40.000 preguntas genéricas etiquetadas por assay-27b. Cada dataset conserva su propia licencia. Sobre el split de calibración de tareas vistas se ajustó una temperatura de 1,485, que es la que produce los resultados "scaled" de la evaluación.

## Capacidades

- Clasificación de un solo texto con salida de distribución de probabilidad calibrada, no texto generado.
- Preguntas tipadas: `bool` (probabilidad `p_true`), `choice` (distribución sobre opciones) y `score`.
- Señal de `evidence` asociada a cada decisión, además de las probabilidades.
- Clasificación de tema, sentimiento y spam con buen rendimiento según la model card.
- Compilación y caché de preguntas: una pregunta compilada se reutiliza sobre múltiples estados.
- Procesamiento por lotes: las peticiones que llegan juntas se responden en una sola pasada.
- Recorrido de árboles de decisión en un único forward pass mediante `POST /v1/decide_graph`.
- Endpoint `POST /v1/decide`, endpoint estilo System One `POST /v1/systemone` (preguntas `choice`/`noul`/`score` con opciones en `criteria`, más endpoint de batch), y `/health` y `/metrics` para operación.
- Umbrales conformales calculados en el pipeline de entrenamiento.
- No soporta tool calling ni function calling, ni generación de texto, ni razonamiento multi-paso, ni capacidades multilingües (solo inglés).

## Casos de uso

- Triaje de tickets de soporte: con una pregunta `choice` sobre el texto del ticket se obtiene una distribución sobre equipos (`billing`, `technical`, etc.) y con una pregunta `bool` se detecta si el cliente pide reembolso. Las probabilidades calibradas permiten fijar umbrales de derivación automática.
- Enrutado de correo o formularios entrantes: el mismo conjunto de preguntas compiladas se reutiliza sobre cada mensaje nuevo, de modo que el coste por mensaje se limita a la codificación del estado más un `decide` de pocos milisegundos.
- Moderación y filtrado de contenido a escala: clasificación de spam, toxicidad o temática en CPU con latencias de decenas de milisegundos por estado, apta para volúmenes altos donde no es viable un LLM generativo.
- Etiquetado de datasets y deduplicación semántica: el modelo puede aplicar las mismas preguntas tipadas sobre miles de documentos, con salida probabilística apta para curar corpus y decidir umbrales de inclusión.
- Pre-filtro en cascada delante de un LLM: las decisiones fáciles se resuelven con este modelo (149M, CPU) y solo los casos con baja confianza o alta entropía se escalan a un decoder de la familia (assay-4b, assay-27b), reduciendo coste.
- Políticas de negocio como árbol de decisión: `POST /v1/decide_graph` permite evaluar un árbol completo de condiciones en una sola pasada, por ejemplo para decidir reembolso, escalado o compensación en un flujo de atención al cliente.
- Enriquecimiento de registros estructurados: asignar campos `bool`/`choice` (categoría, urgencia, intención) a registros ya almacenados, usando la caché de preguntas compiladas para mantener estable el criterio entre lotes.
- Clasificación sobre textos largos: al heredar el backbone gte-modernbert, el estado se codifica una sola vez y puede cubrir documentos extensos antes de aplicar varias preguntas sobre él.

## Benchmarks y rendimiento

Resultados publicados en la model card. "Scaled" aplica la temperatura 1,485 ajustada sobre el split de calibración de tareas vistas.

| Split | n | Accuracy | Brier | NLL | ECE | Errores con alta confianza |
|---|---|---|---|---|---|---|
| Tareas vistas (dev), scaled | 6113 | 0,668 | 0,442 | 0,806 | 0,037 | 0,019 |
| Tareas no vistas (holdout), raw | 2020 | 0,606 | 0,522 | 0,895 | 0,133 | 0,035 |
| Tareas no vistas (holdout), scaled | 2020 | 0,606 | 0,494 | 0,818 | 0,061 | 0,011 |
| kev transfer-v4 dev, raw | 764 | 0,542 | 0,613 | 1,048 | 0,174 | 0,064 |
| kev transfer-v4 dev, scaled | 764 | 0,542 | 0,572 | 0,952 | 0,095 | 0,012 |

Las tareas no vistas son once datasets nunca entrenados; la suite de transferencia es `jaredpalmer/kev-suites` transfer-v4 dev, con las fuentes excluidas del entrenamiento. La model card indica que la clasificación de un solo texto (tema, sentimiento, spam) es fuerte, mientras que las preguntas que requieren conocimiento (MMLU) o razonamiento multi-paso están cerca del azar.

Latencia en CPU (milisegundos; 8 hilos; el estado se codifica una vez, las preguntas se compilan una vez y se cachean, `decide` se ejecuta por estado x conjunto de preguntas):

| Preguntas | encode_state_ms | compile_ms | decide_ms | end_to_end_ms |
|---|---|---|---|---|
| 1 | 28,95 | 29,63 | 1,381 | 62,25 |
| 3 | 30,67 | 61,52 | 1,753 | 94,48 |
| 6 | 30,64 | 88,46 | 2,844 | 122,80 |
| 12 | 30,51 | 88,45 | 4,867 | 124,75 |
| 24 | 30,64 | 88,42 | 10,694 | 131,05 |

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB con pesos en fp32 (el repo ocupa 0,6 GB); aproximadamente 0,3 GB en fp16 y 0,15 GB en int8, aunque no se declaran cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente (RTX 3060, RTX 4090, etc.); en GPU de datacenter (A100, H100) el modelo estaría infrautilizado salvo por concurrencia masiva. El diseño objetivo es CPU.
- Cabe holgadamente en GPU consumer y en equipos sin GPU: la model card publica latencias medidas en CPU con 8 hilos.
- Opciones de despliegue: `assay.server` (endpoints `/v1/decide`, `/v1/systemone`, `/v1/decide_graph`, `/health`, `/metrics`) y `assay.backends.sglang` para desplegar el mismo modelo sobre SGLang. No se mencionan vLLM, llama.cpp, Ollama ni TGI, y en la práctica no aplican porque no es un modelo generativo.
- Latencia medida en CPU (8 hilos): codificación del estado en torno a 29-31 ms, compilación de preguntas entre 29,6 ms (1 pregunta) y 88,5 ms (6 o más), decisión entre 1,38 ms (1 pregunta) y 10,69 ms (24 preguntas), y extremo a extremo entre 62,25 ms y 131,05 ms. Con preguntas compiladas y cacheadas, el coste marginal por estado y conjunto de preguntas es el de `decide`.
- Throughput: no disponible en la informacion proporcionada; las peticiones que llegan juntas se responden en una sola pasada, lo que mejora el rendimiento agregado en batch.

## Comparativa con modelos similares

Comparativa dentro de la propia familia Assay, con la misma receta y los mismos splits (accuracy / Brier tras temperature scaling):

| Modelo | Tamano | Tareas no vistas | transfer-v4 |
|---|---|---|---|
| assay-0.6b | 0,6B | 0,704 / 0,397 | 0,636 / 0,499 |
| assay-1.7b | 1,7B | 0,752 / 0,334 | 0,670 / 0,436 |
| assay-4b | 4B | 0,803 / 0,271 | 0,784 / 0,302 |
| assay-27b | 27B | 0,842 / 0,221 | 0,842 / 0,229 |
| assay-compiled-base | 149M | 0,606 / 0,494 | 0,542 / 0,572 |

El modelo base del que parte, `Alibaba-NLP/gte-modernbert-base`, es un encoder de embeddings de propósito general, no un modelo de decisión con preguntas tipadas, por lo que no es directamente comparable en esta tabla. La model card menciona además una comparación frente al cross-encoder y los decoders en `docs/roadmap.md`, sin incluir aquí las cifras. No se dispone de comparativas con modelos de decisión de otros proyectos en la informacion proporcionada.

## Limitaciones y advertencias

- Solo inglés. No hay soporte multilingüe declarado.
- No aporta conocimiento más allá del que lleva el encoder: las preguntas que requieren conocimiento externo (tipo MMLU) quedan cerca del azar.
- Sin aritmética y sin razonamiento multi-paso.
- No genera texto: no sirve para tareas de generación, resumen o diálogo.
- La calibración es agregada sobre las distribuciones evaluadas, no por respuesta. La propia model card recomienda verificar sobre etiquetas propias antes de actuar sobre los umbrales.
- En datos de dominio distinto al de evaluación la precisión cae: 0,542 de accuracy y Brier 0,572 en transfer-v4 scaled, frente a 0,668 y 0,442 en tareas vistas.
- El ECE sube de 0,037 (tareas vistas) a 0,061 en tareas no vistas y 0,095 en transfer-v4 tras el escalado, lo que indica deriva de calibración fuera de distribución.
- Sin motor de abstención explícito en los datos de esta ficha: la model card remite a `docs/models.md` para la abstención por nivel, no disponible aquí.
- Licencia Apache 2.0, que permite uso comercial, pero cada uno de los 55 datasets de entrenamiento conserva su propia licencia; conviene revisar `docs/datasets.md` antes de un uso comercial.
- El modelo tiene 0 descargas y 0 likes, sin validación externa de la comunidad registrada en HuggingFace.
- La sección "Relationship to other work" de la model card está truncada en la información disponible, donde solo se indica que Assay es un proyecto independiente y que Jev y System One son nombres de productos de TypeSafe AI.
- No se declaran cuantizaciones oficiales; las estimaciones de VRAM en fp16 o int8 son deducciones del tamaño del repo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Berk/assay-compiled-base
- Repositorio del proyecto Assay: https://github.com/bgokden/assay
- Roadmap y comparativa completa: https://github.com/bgokden/assay/blob/main/docs/roadmap.md
- Documentación de modelos, abstención y latencia por nivel: https://github.com/bgokden/assay/blob/main/docs/models.md
- Listado de datasets y licencias: https://github.com/bgokden/assay/blob/main/docs/datasets.md
- Ejemplos y configuraciones por nivel: https://github.com/bgokden/assay/tree/main/examples
- Modelo base: https://huggingface.co/Alibaba-NLP/gte-modernbert-base
- Modelos de la familia: https://huggingface.co/Berk/assay-0.6b, https://huggingface.co/Berk/assay-1.7b, https://huggingface.co/Berk/assay-4b, https://huggingface.co/Berk/assay-27b
- Suite de transferencia: `jaredpalmer/kev-suites` (transfer-v4 dev)
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a páginas de ayuda de inicio de sesión de Gmail y no guardan relación con este modelo.
