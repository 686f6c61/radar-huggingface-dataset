# osunlp/PreNormLoop-0.6B

## Resumen

PreNormLoop-0.6B es un modelo de lenguaje base preentrenado desarrollado por el grupo OSU-NLP (Ohio State University) como parte del proyecto ARLoop. Se trata de un transformer "looped" (recurrente) en el que 18 capas fisicas se comparten a lo largo de 3 pasadas recurrentes, lo que da como resultado una profundidad efectiva de 54 capas con solo 582 millones de parametros fisicos. Emplea conexiones residuales PreNorm estandar y sirve como linea base (baseline) para la investigacion en arquitecturas recurrentes con attention residuals.

El modelo se ha entrenado desde cero sobre 180.000 millones de tokens (179.998.556.160 exactamente en el checkpoint final) utilizando el tokenizador de SmolLM2 con un vocabulario de 49.152 tokens. Es un modelo exclusivamente base, pensado para completado de texto y como punto de partida para mid-training y post-training, no para uso conversacional directo.

Su relevancia actual reside en que es un modelo completamente abierto (pesos, codigo y paper) que permite reproducir y comparar arquitecturas looped frente a transformers convencionales de profundidad equivalente. La ventana de contexto es de 4.096 tokens y los pesos se distribuyen en safetensors con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer looped (recurrente) con conexiones residuales PreNorm; 18 capas fisicas compartidas en 3 pasadas |
| Parametros totales | 582.804.096 (0,58B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible (los pesos se publican en FP32 y se cargan en BF16 para inferencia) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint original en FP32; carga en BF16) |

## Arquitectura y entrenamiento

La arquitectura es un transformer recurrente con 18 capas fisicas que se aplican en 3 pasadas, alcanzando una profundidad efectiva de 54 capas. La anchura oculta es de 1.536 y la capa intermedia MLP de 4.608. La atencion usa 16 cabezas de query y 4 cabezas de clave/valor (GQA), con RoPE de base 50.000. Los embeddings de valor se comparten entre capas fisicas alternas y la cabeza de salida esta atada a los embeddings de tokens. Las conexiones residuales son adiciones PreNorm estandar, sin enrutamiento de attention residuals (esa variante corresponde a la propuesta principal de ARLoop, de la que este modelo es la linea base).

El entrenamiento cubre 180.000 millones de tokens en 171.660 pasos de optimizador, con checkpoints intermedios publicados cada 20.000 pasos aproximadamente (desde step-050000 hasta step-170000). No se documenta en la model card el uso de RLHF, DPO ni fases de alineacion; es un preentrenamiento puro sobre texto en ingles. El tokenizador utilizado en el entrenamiento es el de SmolLM2.

## Capacidades

- Generacion y completado de texto en ingles (modelo base, no instruido).
- Razonamiento y conocimiento factual derivados del preentrenamiento, sin ajuste instructivo.
- Profundidad efectiva elevada (54 capas) con un coste de memoria de solo 18 capas fisicas, lo que puede favorecer tareas que se benefician de computo iterativo.
- Soporte de tool calling / function calling: no disponible (modelo base sin post-training).
- Soporte de agentes y razonamiento multi-paso: no disponible de forma nativa; requeriria post-training.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Capacidades especiales: no se documentan modos de pensamiento, vision ni audio.

## Casos de uso

- Investigacion en arquitecturas recurrentes: sirve como linea base reproducible para comparar transformers looped frente a transformers densos de profundidad equivalente en tareas de modelado de lenguaje.
- Mid-training y post-training: al ser un modelo base, puede emplearse como punto de partida para SFT, DPO o RLHF orientados a tareas concretas en ingles.
- Completado de texto en aplicaciones de autocompletado o generacion asistida, siempre con prompts bien definidos y sin esperar comportamiento conversacional.
- Experimentos de eficiencia memoria/computo: la comparticion de 18 capas fisicas permite estudiar el equilibrio entre profundidad efectiva y coste de inferencia.
- Evaluacion academica de tecnicas de attention residuals: el modelo permite aislar el efecto de PreNorm frente a variantes con enrutamiento residual.
- Generacion de datos sinteticos en ingles para pipelines de destilacion o aumento de corpus, dado su caracter abierto y su licencia permisiva.
- Reproducibilidad de resultados: los checkpoints intermedios publicados permiten trazar curvas de aprendizaje y estudiar la evolucion del modelo durante el preentrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card referencia una figura (assets/figure1.png) con resultados de ARLoop, pero no se incluyen cifras numericas en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 1,2 GB para los pesos (582M parametros x 2 bytes), mas memoria para activaciones y cache KV; en la practica, unos 2-3 GB con contexto de 4.096 tokens.
- En FP32: aproximadamente 2,4 GB solo para pesos.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4060, RTX 4090) es suficiente; tambien A100/H100 para despliegues por lotes.
- Cabe holgadamente en GPU consumer, incluidas GPUs de gama baja con 6-8 GB de VRAM.
- Opciones de despliegue: transformers (version 5.22.0 segun la model card) con `trust_remote_code=True`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para esta arquitectura personalizada.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Notas |
|---|---|---|---|---|---|
| PreNormLoop-0.6B | 0,58B | 4.096 | Transformer looped (18 capas fisicas, 3 pasadas) | Apache 2.0 | Linea base de ARLoop; solo ingles; modelo base |
| SmolLM2-360M | 0,36B | 8.192 (segun version) | Transformer denso | Apache 2.0 | Tokenizador compartido; modelo base/instruct disponible |
| SmolLM2-1.7B | 1,7B | 8.192 (segun version) | Transformer denso | Apache 2.0 | Alternativa densa de mayor tamano |
| Qwen2.5-0.5B | 0,49B | 32.768 | Transformer denso | Apache 2.0 | Multilingue; modelo base e instruct |

Los datos de SmolLM2 y Qwen2.5 corresponden a conocimiento general de esos modelos y no a la informacion proporcionada en esta ficha; se incluyen como referencia de categoria. No se dispone de comparativas de rendimiento publicadas para PreNormLoop-0.6B.

## Limitaciones y advertencias

- Es un modelo base sin alineacion: no sigue instrucciones de forma fiable y puede producir contenido inapropiado o incoherente en formato conversacional.
- Riesgo de alucinacion elevado, especialmente en tareas factuales, al no haber pasado por post-training ni verificacion.
- Solo soporta ingles; el rendimiento en otros idiomas no esta garantizado.
- Ventana de contexto limitada a 4.096 tokens, inferior a la de muchos modelos contemporaneos.
- Requiere `trust_remote_code=True` y una version concreta de transformers (5.22.0), lo que anade riesgo de compatibilidad en produccion.
- La arquitectura recurrente con capas compartidas no esta soportada por defecto en la mayoria de frameworks de inferencia optimizados (vLLM, llama.cpp, TGI), lo que limita el despliegue de alto rendimiento.
- Aunque la licencia Apache 2.0 permite uso comercial, la ausencia de post-training hace necesario un ajuste previo para cualquier aplicacion en produccion.
- No se documentan sesgos especificos ni composicion detallada del dataset de entrenamiento mas alla del numero de tokens.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/osunlp/PreNormLoop-0.6B
- Paper (arXiv): https://arxiv.org/abs/2611.05234
- Codigo (GitHub): https://github.com/OSU-NLP-Group/ARLoop
- Checkpoint intermedio step-050000: https://huggingface.co/osunlp/PreNormLoop-0.6B/tree/step-050000
- Checkpoint intermedio step-170000: https://huggingface.co/osunlp/PreNormLoop-0.6B/tree/step-170000
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
