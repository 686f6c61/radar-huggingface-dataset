# plantwaterer/allec

## Resumen

allec es un ajuste fino (fine-tune) del modelo multimodal google/gemma-4-31B-it, desarrollado por el usuario plantwaterer y publicado en Hugging Face bajo licencia Apache-2.0. Su propósito no es la generación de texto libre, sino la **toma de decisiones mediante preguntas de opción múltiple**: el modelo devuelve, para cada pregunta, una probabilidad calibrada por cada una de las opciones disponibles. Para ello incorpora una cabeza de última capa específica (`vbll_head.safetensors`) que transforma los logits de las letras de las opciones en probabilidades interpretables.

El modelo conserva la arquitectura subyacente de Gemma 4 de 31B parámetros (31.273.088.876 parámetros según los pesos en safetensors), con atención híbrida: capas de atención completa y capas de ventana deslizante de 1.024 tokens. Una particularidad técnica relevante es que las capas de atención completa no son causales en la forma en que lo son las de transformers por defecto; el autor sirve el modelo con una función de atención propia (`jev_mem`) registrada en la interfaz de atención de transformers.

Su relevancia actual radica en que aborda un nicho poco cubierto: modelos que no responden con texto, sino con distribuciones de probabilidad calibradas sobre decisiones discretas, algo útil para sistemas de enrutamiento, clasificación con incertidumbre o agentes que necesitan puntuar alternativas. El repositorio incluye además varios motores de inferencia propios (basados en el kit Decision Index) que implementan promediado sobre órdenes de opciones y correcciones bayesianas para preguntas de sí/no.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 4) con atención híbrida: capas de atención completa (no causal, según `jev_mem`) y capas de ventana deslizante causal (ventana 1.024) |
| Parametros totales | 31.273.088.876 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (la ventana deslizante es de 1.024 tokens; el contexto máximo del modelo base no se especifica en la información) |
| Tipos de cuantizacion | no disponible (el ejemplo de uso carga en bf16; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`model-*.safetensors`, `vbll_head.safetensors`) |

## Arquitectura y entrenamiento

allec es un fine-tune del modelo base google/gemma-4-31B-it, que es multimodal (etiqueta `image-text-to-text`) y de 31B parámetros. La arquitectura conserva el esquema de Gemma 4 con atención híbrida: capas de atención completa en las que cada token atiende a todos los tokens del mismo prompt, y capas con ventana deslizante causal de 1.024 tokens. El autor advierte explícitamente que la atención causal estándar de transformers produciría respuestas distintas, por lo que el modelo debe servirse con la función `jev_mem` de `fullft_mem.py`, que se registra en la interfaz de atención de transformers y se ejecuta sobre PyTorch SDPA (kernels memory-efficient y flash).

El elemento diferenciador es la cabeza de última capa (`vbll_head.safetensors` y `vbll_head.json`), que constituye la respuesta del modelo. Para preguntas de opción múltiple ordinarias, la salida es el softmax de los logits de las letras de las opciones en la posición de respuesta, dividido por una temperatura ajustada (T = 1.031), sin intervención de posterior alguna. Para preguntas de sí/no, se aplica un residual bayesiano de última capa sobre el estado oculto (un posterior de Laplace, integrado) que ajusta los dos logits. El autor corrigió la model card el 2026-10-21 para aclarar que no toda la cabeza es bayesiana. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO.

## Capacidades

- Respuesta a preguntas de decisión de opción múltiple devolviendo una probabilidad calibrada por opción (hasta 52 opciones, letras A-Z y a-z).
- Respuesta a preguntas de sí/no con corrección bayesiana de última capa (posterior de Laplace sobre el estado oculto).
- Procesamiento de peticiones compuestas por varias preguntas, cada una con su propio estado, instrucciones y criterios.
- Promediado adaptativo por longitud de la petición: si la longitud L (suma de longitudes de estado, instrucciones y criterios por pregunta) es menor o igual a 939, se evalúan 4 órdenes de opciones y se promedian los resultados; si es mayor, se usa una sola pasada.
- Soporte de definiciones explícitas para las opciones de sí/no (`Yes: <definición>` / `No: <definición>`).
- Capacidad multimodal heredada del modelo base (etiqueta `image-text-to-text`), aunque la model card no documenta su uso en este fine-tune.
- Motores de inferencia incluidos: `LenAvgBayesEngine`, `LenAvgEngine` y `DikitEngine` (pasada única del lanzamiento original).
- No se documentan tool calling, function calling ni capacidades de agente multi-paso en la información disponible.

## Casos de uso

- **Enrutamiento de decisiones con incertidumbre**: en un sistema de triaje, el modelo devuelve la probabilidad de cada ruta posible (por ejemplo, "escalar a humano", "resolver automáticamente", "pedir más datos"), lo que permite aplicar umbrales de confianza y derivar los casos dudosos. La calibración por temperatura (T = 1.031) hace que las probabilidades sean directamente comparables con umbrales operativos.
- **Evaluación de alternativas en planificación**: dado un estado del mundo y un conjunto de criterios, el modelo puntúa cada plan candidato. El promediado sobre 4 órdenes de opciones (para peticiones con L ≤ 939) reduce el sesgo de posición de las letras, un problema conocido en modelos de opción múltiple.
- **Clasificación binaria con control de incertidumbre**: para preguntas de sí/no (por ejemplo, "¿es probable lluvia intensa?"), la corrección bayesiana sobre los logits permite distinguir entre una respuesta segura y una ambigua, útil en pipelines donde el coste de un falso positivo es alto.
- **Sistemas de recomendación con justificación probabilística**: el modelo puede puntuar opciones discretas (productos, acciones, categorías) y devolver una distribución, que luego se combina con reglas de negocio o con un modelo de ranking posterior.
- **Agentes que necesitan puntuar subdecisiones**: en un bucle de agente, cada paso puede formularse como una pregunta de opción múltiple (qué herramienta usar, qué rama seguir) y la probabilidad devuelta sirve como señal para la búsqueda o para la poda de ramas.
- **Análisis de encuestas y cuestionarios estructurados**: el modelo puede procesar preguntas con criterios definidos y devolver la probabilidad de cada respuesta, lo que facilita el análisis agregado y la detección de ítems ambiguos.
- **Evaluación de políticas o normativas**: dada una situación descrita y un conjunto de criterios (por ejemplo, "cumple", "no cumple", "requiere revisión"), el modelo devuelve la distribución sobre las categorías, con la ventaja de que las definiciones de los criterios se incorporan explícitamente al prompt.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 31.273.088.876 parámetros en bf16, el peso de los pesos ronda los 62,6 GB (tamaño del repo), por lo que se necesita al menos esa cantidad de memoria para cargar el modelo completo en GPU. La cabeza (`vbll_head`) se ejecuta en CPU en float64, por lo que no consume VRAM adicional significativa.
- **GPU recomendadas**: para bf16 completo se requieren GPU con 80 GB o más (A100 80GB, H100 80GB) o configuraciones multi-GPU. No se documentan opciones de cuantización (GGUF, AWQ, GPTQ) en la información disponible, por lo que no se puede confirmar que quepa en GPU de consumo (RTX 4090 de 24 GB, RTX 3090 de 24 GB) sin cuantización adicional no documentada.
- **Opciones de despliegue**: el modelo se sirve a través del kit Decision Index (`pip install "git+https://github.com/apolinario/decision-index@..."`) y los motores incluidos en el repositorio (`LenAvgBayesEngine`, `LenAvgEngine`, `DikitEngine`). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI; de hecho, el autor indica que el motor rechaza cualquier función de atención distinta de `jev_mem`, lo que limita el uso de servidores de inferencia estándar.
- **Latencia y throughput**: no disponibles. El promediado sobre 4 órdenes de opciones multiplica por 4 el número de pasadas hacia delante para peticiones con L ≤ 939, lo que incrementa proporcionalmente el coste de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo de salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| allec | 31,27B | no disponible (ventana deslizante 1.024) | Probabilidades calibradas por opción | Apache-2.0 | Hugging Face + GitHub |
| google/gemma-4-31B-it | 31B (no confirmado en la información) | no disponible | Texto generativo | no disponible en la información | Hugging Face |
| Modelos de opción múltiple genéricos | no disponible | no disponible | Texto con la letra elegida | variable | variable |

No se dispone de información suficiente para comparar con alternativas específicas de la misma categoría (modelos que devuelvan distribuciones calibradas sobre opciones). La comparación más directa es con el modelo base google/gemma-4-31B-it, del que allec hereda arquitectura y pesos, pero la información proporcionada no incluye sus especificaciones detalladas.

## Limitaciones y advertencias

- **Dependencia de una función de atención propia**: el modelo no funciona correctamente con la atención causal estándar de transformers; el motor rechaza cualquier otra atención. Esto dificulta su integración en ecosistemas de despliegue estándar (vLLM, TGI, llama.cpp) y ata el modelo al kit Decision Index y a la versión concreta del commit indicado.
- **La cabeza es obligatoria**: los logits de las letras por sí solos no constituyen la respuesta del modelo; es necesario aplicar `vbll_head.safetensors`. Omitirla produce resultados incorrectos.
- **Umbral de promediado fijo**: el promediado sobre órdenes de opciones solo se aplica si L ≤ 939, un umbral definido de forma heurística; para peticiones más largas se usa una sola pasada, con mayor riesgo de sesgo de posición.
- **Sesgos heredados del modelo base**: al ser un fine-tune de Gemma 4, allec puede heredar sesgos de género, raza, idioma o cultura presentes en los datos de entrenamiento del modelo base. No se documentan evaluaciones de sesgo específicas.
- **Riesgo de alucinación**: aunque la salida es una distribución sobre opciones predefinidas, la calibración puede ser deficiente en dominios alejados de los datos de entrenamiento, produciendo probabilidades excesivamente confiadas.
- **Idiomas no documentados**: la model card no especifica qué idiomas soporta; el uso en castellano no está garantizado.
- **Restricciones de licencia**: los pesos y el código se publican bajo Apache-2.0, lo que permite uso comercial, pero el modelo base google/gemma-4-31B-it puede tener sus propias condiciones de uso que el usuario debe verificar.
- **Compatibilidad de versiones**: el kit Decision Index se instala desde un commit concreto (`9eb2dbe...`), lo que sugiere que la API puede no ser estable.
- **Tamaño del repositorio**: 62,6 GB, lo que implica requisitos de almacenamiento y tiempo de descarga considerables.

## Enlaces

- [Hugging Face: plantwaterer/allec](https://huggingface.co/plantwaterer/allec)
- [Modelo base: google/gemma-4-31B-it](https://huggingface.co/google/gemma-4-31B-it)
- [Repositorio GitHub espejo: treewaterer/allec](https://github.com/treewaterer/allec)
- [Kit Decision Index: apolinario/decision-index](https://github.com/apolinario/decision-index)
