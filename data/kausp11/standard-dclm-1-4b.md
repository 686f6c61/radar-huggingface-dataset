# Kausp11/standard-dclm-1.4b

## Resumen

Standard 1.4B (DCLM-Edu) es un modelo de lenguaje base de tipo decoder-only entrenado desde cero por el autor independiente Kausp11 sobre el corpus web DCLM-Edu. Se publica como el control experimental de `Kausp11/querylm-dclm-1.4b`: ambos comparten arquitectura, tokenizador y presupuesto de cómputo (44.000 millones de tokens, 4,51e20 FLOPs), pero este modelo consume texto plano mientras que QueryLM se entrena con bloques de búsqueda insertados en línea. La finalidad es permitir una comparación limpia del efecto del preentrenamiento aumentado con búsqueda.

La arquitectura sigue el estilo nanochat (el proyecto de Andrej Karpathy): 24 capas, anchura 2.048, 16 cabezas de atención con dimensión 128, feed-forward de 8.192 y una ventana de contexto de 4.095 tokens. El autor reporta 1.409,6 millones de parámetros nominales, aunque el repositorio almacena 2.619,1 millones en safetensors, diferencia que atribuye a los *value embeddings*. El tokenizador es el de SmolLM2 ampliado con cuatro tokens de búsqueda (vocabulario de 49.156 entradas), heredados del modelo emparejado.

Es relevante ahora porque ofrece un punto de referencia reproducible y de licencia permisiva (Apache-2.0) para investigar si la integración de recuperación durante el preentrenamiento mejora el modelado del lenguaje a igualdad de cómputo. No es un producto: es un artefacto de investigación sin ajuste conversacional ni entrenamiento de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo nanochat (24 capas, width 2.048, 16 cabezas, head dim 128, FFN 8.192) |
| Parametros totales | 1.409,6 M reportados por el autor; 2.619.083.082 almacenados en safetensors (incluye value embeddings) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.095 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente bf16) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 (el codigo `modeling_nanochat.py` deriva de nanochat, MIT) |
| Formato de pesos | safetensors (2 shards) + `modeling_nanochat.py` con `trust_remote_code` |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con atención multi-cabeza estándar, 24 bloques, dimensión de modelo 2.048, 16 cabezas de 128 dimensiones y capa feed-forward de 8.192. La implementación procede del repositorio nanochat (commit upstream `92d63d4`) con una rama local para datos de búsqueda; el código de modelado se distribuye en el propio repo (`modeling_nanochat.py`) y requiere `trust_remote_code=True`. El tokenizador es el de SmolLM2 más cuatro tokens de búsqueda, con vocabulario de 49.156.

El preentrenamiento usa DCLM-Edu como texto plano, sin bloques de búsqueda ni anotación, y consume más texto de documento que el modelo emparejado para igualar el cómputo. Se realizaron 41.936 actualizaciones con lotes de 256 secuencias de 4.095 tokens (1.048.320 tokens por paso), totalizando 44.000 millones de tokens y 4,51e20 FLOPs en bf16. El optimizador es Muon para pesos matriciales (LR pico 0,02828) y AdamW para embeddings y cabeza de salida, con 40 pasos de calentamiento, fase constante y decaimiento lineal hasta el 5% del pico. El checkpoint final corresponde al segmento `dclm_nc_baseline_d24_cm44`, paso 8.872 del último segmento, con el schedule de learning rate completado.

## Capacidades

- Generación de texto por continuación: el modelo completa secuencias y puede inducir formato pregunta-respuesta mediante ejemplos *few-shot*.
- Razonamiento básico y conocimiento factual derivado del corpus DCLM-Edu, sin ajuste instructivo.
- No dispone de *chat template* ni de formato conversacional; no fue entrenado para seguir instrucciones.
- No ha visto los cuatro tokens de búsqueda durante el entrenamiento, aunque estén en su vocabulario; no realiza búsqueda ni recuperación.
- Capacidades multilingües limitadas al inglés.
- No soporta *tool calling*, *function calling* ni razonamiento multi-paso orientado a agentes.
- No incluye modo *thinking*, visión ni audio.

## Casos de uso

- Control experimental en investigación de preentrenamiento aumentado con recuperación: sirve como línea base para medir, a igualdad de FLOPs y tokens, qué aporta el modelo emparejado QueryLM con bloques de búsqueda.
- Estudio de ablación de datos: al entrenarse sobre DCLM-Edu en texto plano, permite aislar el efecto del corpus frente al formato de secuencia.
- Evaluación de modelado de lenguaje puro: útil para calcular perplejidad y métricas de *next-token prediction* sobre *held-out* de DCLM-Edu o dominios similares.
- Reproducción de pipelines nanochat: el código y los hiperparámetros publicados permiten replicar el entrenamiento en entornos de investigación con GPUs de gama alta.
- Generación de texto de dominio general en inglés para experimentos de continuación y *prompting* few-shot sin expectativas de seguridad.
- Referencia para comparativas de eficiencia: su tamaño (1,4B nominales) y contexto de 4.095 tokens lo hacen manejable para pruebas de *throughput* y latencia en infraestructura académica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que los resultados de evaluación se añadirán más adelante.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 5,2 GB solo para pesos (tamaño del repo), más activaciones y caché KV; presupuesto práctico de 6-8 GB en GPU.
- En cuantización de 8 bits cabría en GPUs de 4-6 GB; en 4 bits, en torno a 2-3 GB (no se publican ficheros GGUF ni cuantizaciones oficiales).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16 (RTX 3060 12 GB, RTX 4070, RTX 4090); A100/H100 para entrenamiento o evaluación por lotes.
- Cabe en GPU de consumo: sí, en modelos con 8 GB o más en bf16; el ejemplo de la model card se ejecutó en CPU en bf16.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (requerido por `modeling_nanochat.py`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; al no haber GGUF, llama.cpp/Ollama requerirían conversión manual.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Standard 1.4B (DCLM-Edu) | 1,4B nominales / 2,6B almacenados | 4.095 | Apache-2.0 | Base nanochat, texto plano, control de QueryLM |
| QueryLM 1.4B (DCLM-Edu) | mismos que Standard | 4.095 | Apache-2.0 (presumible) | Mismo cómputo, preentrenado con bloques de búsqueda |
| SmolLM2-1.7B (HuggingFaceTB) | 1,7B | 8.192 | Apache-2.0 | Base/instruct de referencia en tamaño similar; datos y tokenizador distintos |
| Qwen2.5-1.5B | 1,5B | 32.768 | Apache-2.0 | Contexto mucho mayor y multilingüe; no comparable en metodología |

La comparación con SmolLM2 y Qwen2.5 es orientativa por tamaño; no se dispone de métricas del modelo para contrastar rendimiento.

## Limitaciones y advertencias

- Modelo base sin ajuste conversacional: no sigue instrucciones ni mantiene diálogos; solo continúa texto.
- Entrenado únicamente con texto web en inglés; sin datos multilingües ni de código específicos.
- Sin entrenamiento de seguridad, alineación ni rechazo: puede generar contenido sesgado, ofensivo o dañino, y afirmar falsedades con fluidez.
- Riesgo alto de alucinación en conocimiento factual, especialmente fuera del dominio de DCLM-Edu.
- Ventana de contexto corta (4.095 tokens) frente a modelos actuales de 32K-128K.
- Cargar el modelo ejecuta código Python del repositorio (`modeling_nanochat.py`); conviene fijar `revision=` a un commit auditado.
- Licencia Apache-2.0 permite uso comercial, pero el artefacto está declarado como investigación y no como producto; los datos DCLM-Edu son CC-BY-4.0.
- Sin benchmarks publicados: no es posible validar su calidad frente a alternativas sin evaluaciones propias.

## Enlaces

- Hugging Face: https://huggingface.co/Kausp11/standard-dclm-1.4b
- Modelo emparejado (QueryLM): https://huggingface.co/Kausp11/querylm-dclm-1.4b
- Versión SFT: https://huggingface.co/Kausp11/standard-dclm-1.4b-sft-search
- Alias con pesos idénticos: https://huggingface.co/Kausp11/searchlm-dclm_nc-baseline_d24_cm44
- Dataset DCLM-Edu: https://huggingface.co/datasets/HuggingFaceTB/dclm-edu
- Repositorio nanochat (Karpathy): https://github.com/karpathy/nanochat
