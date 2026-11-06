# osunlp/ARLoop-1.3B

## Resumen

ARLoop-1.3B es un modelo de lenguaje causal recurrente desarrollado por el grupo de investigacion OSUNLP (Ohio State University NLP). Se trata de un checkpoint final de una ejecucion de entrenamiento de 1.300 millones de parametros sobre aproximadamente 500.000 millones de tokens. Su caracteristica principal es el uso de residuales de atencion (attention residuals) combinados con pasadas recurrentes sobre un mismo conjunto de capas fisicas, lo que permite aumentar la profundidad efectiva del transformer sin incrementar el numero de parametros.

El modelo cuenta con 24 capas fisicas de transformer que se comparten a traves de 3 pasadas recurrentes, alcanzando una profundidad efectiva de 72 capas. Emplea 16 cabezas de atencion y 4 cabezas KV, con una anchura oculta de 2048 y una capa MLP intermedia de 5632. La longitud de contexto es de 4096 tokens y utiliza el tokenizador de SmolLM2 con un vocabulario de 49152 entradas.

Es relevante porque explora una via alternativa a la escalada tradicional de parametros: en lugar de anadir capas, reutiliza las existentes mediante recurrencia, lo que reduce el coste de memoria de pesos por unidad de profundidad efectiva. Se distribuye como modelo base preentrenado (no ajustado con SFT), orientado a completado de texto y a servir de punto de partida para experimentacion en arquitecturas recurrentes. La licencia Apache 2.0 facilita su uso comercial e investigador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con capas fisicas compartidas y 3 pasadas recurrentes; residuales de atencion |
| Parametros totales | 1.208.655.360 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | No disponible (solo se documenta carga en float32) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ARLoop-1.3B es un transformer causal con una innovacion estructural clave: la recurrencia sobre capas fisicas. Dispone de 24 capas de transformer fisicas que se reutilizan en 3 pasadas, dando una profundidad efectiva de 72 capas. La anchura oculta es de 2048 y la capa MLP intermedia de 5632. La atencion emplea 16 cabezas de consulta y 4 cabezas KV (GQA), con una base RoPE de 50000. Los residuales de atencion se organizan en bloques de 24 subcapas, con 3 bloques residuales recientes y retencion del embedding de entrada. Los value embeddings se comparten entre capas fisicas alternas y la cabeza de salida esta atada a los embeddings de tokens.

El entrenamiento se realizo sobre aproximadamente 500.000 millones de tokens (499.996.688.384 en el paso final 238.417). El vocabulario de 49152 entradas corresponde al tokenizador de SmolLM2, utilizado durante el entrenamiento. Se publican 23 checkpoints intermedios programados desde el paso 10.000 (20.971.520.000 tokens) hasta el paso 230.000 (482.344.960.000 tokens), ademas del checkpoint final. No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de alineacion; se trata de un modelo base preentrenado. No se detalla la composicion del dataset de entrenamiento.

## Capacidades

- Generacion de texto y completado de texto en ingles (modelo base, no ajustado para instrucciones).
- Razonamiento autoregresivo gracias a la profundidad efectiva de 72 capas derivada de la recurrencia.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma nativa (modelo base sin SFT).
- Capacidades multilingues: solo ingles.
- Capacidades especiales: no se documentan modos de pensamiento, vision ni audio.
- Carga mediante `trust_remote_code=True` y `transformers==5.12.1`, con codigo personalizado (`custom_code`).

## Casos de uso

- Completado de texto en ingles para tareas de autocompletado en editores o entornos de desarrollo, aprovechando su naturaleza de modelo base entrenado sobre 500.000 millones de tokens.
- Punto de partida para fine-tuning: al ser un modelo base con licencia Apache 2.0, sirve para ajuste supervisado (SFT) o DPO en dominios especificos como atencion al cliente o generacion de documentacion tecnica.
- Investigacion en arquitecturas recurrentes: permite reproducir y extender el trabajo comparando los 23 checkpoints intermedios publicados para estudiar la dinamica de entrenamiento.
- Generacion de texto con contexto medio (hasta 4096 tokens) en tareas de resumen o reescritura de parrafos, donde el coste de memoria de pesos es contenido (1.300 millones de parametros).
- Experimentacion con decodificacion y evaluacion de modelos base en entornos academicos, gracias a la disponibilidad de checkpoints intermedios independientemente cargables.
- Prototipado de pipelines de generacion de texto en ingles con `transformers`, usando el ejemplo de carga documentado en la model card y ejecutandolo en GPU consumer.
- Base para estudiar el efecto de la profundidad efectiva frente a la profundidad fisica en tareas de razonamiento, comparando con transformers de tamano similar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en float32: aproximadamente 4,8 GB solo para pesos (1.208.655.360 parametros x 4 bytes), mas memoria para activaciones y cache KV durante la generacion.
- La model card solo documenta carga en `dtype=torch.float32`; no se especifican cuantizaciones oficiales (GGUF, AWQ, GPTQ) en la informacion disponible.
- GPU recomendadas: no disponible de forma explicita; por tamano, cabe en GPU consumer con al menos 8 GB de VRAM en float32 (por ejemplo, RTX 3060 Ti, RTX 4060 Ti, RTX 4070) siempre que se ajuste el tamano de batch y la longitud de contexto.
- Opciones de despliegue: `transformers` (version 5.12.1) con `trust_remote_code=True`, `safetensors` y `accelerate`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ARLoop-1.3B | 1.208.655.360 | 4096 | Transformer recurrente con residuales de atencion | Apache 2.0 | Hugging Face (osunlp) |
| Modelos comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de comparaciones publicadas con modelos de la misma categoria en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Es un modelo base preentrenado, no ajustado con instrucciones (sin SFT ni RLHF); no debe esperarse un comportamiento de asistente conversacional.
- Solo soporta ingles; no se documentan capacidades multilingues.
- Longitud de contexto limitada a 4096 tokens, inferior a la de muchos modelos contemporaneos.
- Riesgo de alucinacion inherente a los modelos de lenguaje base sin alineacion.
- Sesgos conocidos: no se documentan en la model card; al entrenarse sobre datos web sin filtrar documentado, es probable que herede sesgos del corpus, pero no se aportan detalles.
- Requiere `trust_remote_code=True` y una version concreta de `transformers` (5.12.1), lo que implica ejecutar codigo personalizado del autor y limita la portabilidad a otros frameworks.
- El repositorio ocupa 116 GB debido a los 23 checkpoints intermedios, lo que puede complicar la descarga y el almacenamiento si no se selecciona una revision concreta.
- La licencia Apache 2.0 permite uso comercial, pero al ser un modelo base sin garantias de calidad en tareas de produccion, se recomienda validacion exhaustiva antes de desplegarlo.
- No se documentan cuantizaciones oficiales, lo que puede encarecer el despliegue en hardware limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/osunlp/ARLoop-1.3B
- Codigo de entrenamiento: https://github.com/ykyaol7/ARLoop
- Checkpoint intermedio de ejemplo: https://huggingface.co/osunlp/ARLoop-1.3B/tree/step-010000
- Checkpoint final por paso: https://huggingface.co/osunlp/ARLoop-1.3B/tree/step-238417
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
