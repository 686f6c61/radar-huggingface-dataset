# Karasumikura/Ying-K1.5-Lite-200M

## Resumen

Ying K1.5 Lite 200M es un modelo de lenguaje de tipo base, entrenado desde cero por el desarrollador independiente Karasumikura (Wang Yingze) y publicado bajo licencia Apache-2.0. Se trata de un transformer denso de 210,2 millones de parámetros con arquitectura propia denominada MM200, orientado principalmente al chino y con soporte secundario de inglés. No es un modelo conversacional: el autor advierte explícitamente de que solo existen pesos base y que no se ha realizado ninguna fase de SFT o ajuste por instrucciones, por lo que el modelo continúa texto pero no sigue órdenes.

La relevancia de esta versión frente a su predecesora (Ying K1 Lite 200M) está en el volumen de entrenamiento y en la interfaz: pasa de 14,92 a 24,07 mil millones de tokens (un 61 % más), incorpora una fase de continuación de 9,14 mil millones de tokens sobre el checkpoint del primer stage y añade compatibilidad real con `AutoModel`/`AutoTokenizer` de transformers mediante una capa de adaptación (`mm200_hf.py`). Además, el repositorio incluye un runtime de inferencia propio (`mm200_runtime.py`) con KV cache, generación en streaming y decodificación con CUDA Graph.

El modelo se posiciona como una pieza de investigación y experimentación en el segmento de modelos pequeños (sub-1B), útil para estudiar dinámicas de preentrenamiento, técnicas de aceleración de inferencia en GPUs de gama baja y ajuste fino posterior. Su contexto de entrenamiento es de 8.192 tokens con ventana deslizante de 1.024.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (MM200), 16 capas, hidden 768, GQA 3:1, gated attention + QK-norm |
| Parametros totales | 210.210.560 (210,2 M) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 8.192 tokens de entrenamiento; ventana deslizante de 1.024 |
| Tipos de cuantizacion | No disponible (el autor solo documenta bfloat16 y fp16 para inferencia) |
| Idiomas soportados | Chino (principal) e inglés (secundario) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (195 tensores, 420,4 MB); requiere `trust_remote_code=True` |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 16 capas con dimensión oculta de 768, 12 cabezas de consulta y 4 cabezas KV (GQA con ratio 3:1), dimensión de cabeza de 64 y vocabulario de 16.006 tokens. Emplea atención con compuerta (gated attention) y normalización QK, y una normalización propia denominada RowNorm con centrado en cero, materializada como `weight` estándar durante la exportación. El entrenamiento se realizó en dos fases: 90.000 pasos (14,92 mil millones de tokens) en el primer stage y 1.205 pasos adicionales (9,14 mil millones de tokens) de continuación, sumando 91.205 pasos y 24,07 mil millones de tokens. Los datos son mayoritariamente en chino (Ultra-FineWeb-zh y otras fuentes) con contexto de 8.192 tokens.

El hardware de entrenamiento fueron 8 GPUs MTT S4000 (plataforma MUSA). En la exportación se eliminó la cabeza MTP y se materializó RowNorm. El autor documenta que la continuación modificó efectivamente los pesos: la comparación tensor a tensor con el checkpoint `base_step90000` muestra una diferencia máxima de 0,70 en `blocks.0.attn.gate_proj`. No se ha aplicado RLHF, DPO ni SFT. La innovación técnica más destacable está en el runtime de inferencia incluido, que aplica CUDA Graph a la decodificación completa y reporta, sobre el modelo hermano K1 de la misma arquitectura, una reducción de latencia por token de 21,6 a 7,2 ms (3,00×) y un aumento de throughput de 46,3 a 139,2 tok/s en una T4.

## Capacidades

- Generación de texto por continuación de prompt (modelo base, sin alineación conversacional).
- Modelado de lenguaje autorregresivo en chino e inglés, con clara ventaja en chino.
- Extracción de características y representaciones internas (etiqueta `feature-extraction`).
- Soporte de tool calling / function calling: no disponible; el modelo no ha sido entrenado para ello.
- Soporte de agentes y razonamiento multi-paso: no disponible; sin SFT no hay capacidad de seguir instrucciones ni de planificar.
- Capacidades multilingües limitadas a chino e inglés; el autor indica que el inglés es más débil.
- Modo thinking, visión o audio: no disponible.
- Inferencia con KV cache, streaming token a token y decodificación acelerada por CUDA Graph mediante el runtime incluido.
- Los tokens especiales de chat (`<|im_end|>`=15932, `<|user|>`=16001, `<|assistant|>`=16002) existen y son de token único, pero el modelo base no ha visto el formato de diálogo.

## Casos de uso

- Investigación en preentrenamiento de modelos pequeños: permite estudiar curvas de escalado, efecto de la continuación de entrenamiento y dinámicas de convergencia en un modelo de 210 M con 24 mil millones de tokens, a un coste computacional muy bajo.
- Generación de texto libre en chino: continuación de artículos, descripciones o párrafos a partir de un prefijo, aprovechando el contexto de 8.192 tokens para mantener coherencia en documentos de varias páginas.
- Base para ajuste fino supervisado (SFT): el modelo está pensado como punto de partida; un equipo puede aplicar su propio dataset de instrucciones en chino y obtener un asistente especializado sin partir de cero.
- Experimentación con técnicas de aceleración de inferencia: el runtime incluido y la documentación de `INFERENCE_ACCELERATION.md` sirven como banco de pruebas reproducible de CUDA Graph, gestión de KV cache y eliminación de sincronizaciones implícitas en GPUs de gama baja como la T4.
- Prototipado de pipelines de extracción de características: al estar etiquetado como `feature-extraction`, puede emplearse para obtener embeddings de texto en chino en tareas de clasificación o agrupamiento, con un coste de memoria inferior a 1 GB en bfloat16.
- Evaluación comparativa de arquitecturas: al ser un modelo from-scratch con arquitectura propia (MM200, gated attention, RowNorm), resulta útil para comparar frente a transformers convencionales del mismo tamaño en tareas de perplejidad y generación.
- Docencia y formación: su tamaño reducido permite ejecutarlo en CPU o en una GPU consumer, lo que facilita demostraciones de generación autorregresiva, tokenización y decodificación con y sin KV cache.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor únicamente reporta métricas de inferencia medidas sobre el modelo hermano Ying-K1 de la misma arquitectura y en una GPU T4, no sobre los pesos de K1.5:

| Metrica (K1, misma arquitectura) | Antes | Despues |
|---|---|---|
| Latencia por token | 21,6 ms | 7,2 ms (3,00×) |
| Throughput por peticion | 46,3 tok/s | 139,2 tok/s (3,00×) |
| Respuesta de 256 tokens | 6,62 s | 1,90 s |
| TTFT en streaming | no disponible | 1,05 s |
| Consistencia semantica | — | max abs delta logit = 0,00000, argmax 100 % |

El autor indica que la tabla se revalidará con los pesos reales de K1.5 mediante `bench_opt.py`.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 0,42 GB de pesos más overhead de activaciones y KV cache; por debajo de 1 GB en la práctica.
- En fp32 los pesos ocupan unos 0,84 GB; el autor advierte de que hay que fijar `torch.set_default_dtype(torch.bfloat16)` antes de cargar, o las máquinas con poca memoria pueden sufrir OOM.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el autor reporta pruebas en NVIDIA T4. Cabe en RTX 3060, RTX 4060, RTX 4090 y GPUs de portátil.
- Ejecución en CPU viable: el runtime admite `device="cpu"` con bfloat16.
- Opciones de despliegue: transformers con `AutoModelForCausalLM` (lento, sin KV cache), o el runtime propio `mm200_runtime.py` con KV cache y CUDA Graph (rápido). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 7,2 ms por token y 139,2 tok/s por petición en T4 con el runtime optimizado (medido en K1, misma arquitectura); ~125 tok/s en servicio con overhead de red y SSE.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Estado |
|---|---|---|---|---|---|
| Ying K1.5 Lite 200M | 210,2 M | 8.192 | zh, en | Apache-2.0 | Base, sin SFT |
| Ying K1 Lite 200M | 210,2 M | 8.192 | zh | Apache-2.0 | Base + SFT (9 万 instrucciones zh) |
| Ying K2 Lite 200M | no disponible | no disponible | zh, en | Apache-2.0 | No disponible |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de estos modelos entre sí ni con alternativas de otros autores. La comparación se limita a parámetros, contexto, licencia y estado de entrenamiento.

## Limitaciones y advertencias

- Modelo base sin instrucción: no sigue órdenes ni mantiene diálogos; aplicar la plantilla `<|user|>...<|assistant|>` sin SFT previo produce resultados deficientes.
- El modelo `Ying-K1-Lite-0.2B` del mismo autor es de la generación K1 y no es un post-entrenamiento de K1.5; no debe usarse como sustituto.
- Conocimiento factual y razonamiento de cadena larga limitados por el tamaño (210 M).
- El chino es el idioma dominante; el rendimiento en inglés es notablemente inferior.
- Riesgo de alucinación alto en preguntas factuales, inherente a un modelo de este tamaño sin alineación.
- Sesgos no documentados: el autor no publica análisis de sesgos del dataset de preentrenamiento.
- La ruta `AutoModel.generate()` no usa KV cache y recalcula la secuencia completa en cada token; para textos largos debe usarse `mm200_runtime.py`.
- El prompt supera la ventana deslizante de 1.024 tokens: en K1 provocaba un fallo corregido en el runtime; conviene verificar el comportamiento en K1.5.
- Las métricas de aceleración publicadas corresponden a K1, no a K1.5; el autor aún no las ha revalidado con los pesos nuevos.
- Licencia Apache-2.0 permite uso comercial, pero al no haber SFT ni evaluaciones de seguridad, no se recomienda su despliegue en producción orientada a usuarios sin un ajuste y una evaluación previos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Karasumikura/Ying-K1.5-Lite-200M
- Modelo predecesor (K1, base): https://huggingface.co/Karasumikura/Ying-K1-Lite-200M-base
- Modelo de la generación siguiente (K2): https://huggingface.co/Karasumikura/Ying-K2-Lite-200M
- Documentación de aceleración de inferencia: `INFERENCE_ACCELERATION.md` en el repositorio del modelo
- Script de reproducción de benchmarks: `bench_opt.py` en el repositorio del modelo
- Página del autor: https://yingze.wang
