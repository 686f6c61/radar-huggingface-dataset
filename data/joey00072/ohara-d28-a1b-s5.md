# joey00072/ohara-d28-a1b-s5

## Resumen

ohara-d28-a1b-s5 es un checkpoint de preentrenamiento de la familia ohara, una implementación de modelos autorregresivos desarrollada por el usuario joey00072. Se trata de un modelo híbrido encoder-decoder causal con una arquitectura poco convencional que combina atención con ventana deslizante (SWA), atención global puenteada por KV, atención token-sparse, residuales mHC, memoria de n-gramas y una capa MoE de 256 expertos con top-8 más un experto compartido. El checkpoint corresponde a la etapa 1 de preentrenamiento (stage-1) con una longitud de contexto de 4k tokens.

El modelo tiene 23.846.942.486 parámetros totales según los pesos en safetensors, pero solo aproximadamente 0,98 mil millones de parámetros activos en la matriz del backbone (1,25 mil millones incluyendo la cabeza LM), lo que lo convierte en un MoE extremadamente disperso con una relación de activación de aproximadamente 1:24. Utiliza el tokenizador de Qwen3 y se distribuye como checkpoint base, sin ajuste por instrucciones.

Es relevante ahora porque representa un experimento de arquitectura híbrida y MoE de gran dispersión en un momento en el que la comunidad explora alternativas a los transformers densos convencionales. Sin embargo, al ser un checkpoint de preentrenamiento temprano (paso 238, aproximadamente 3 mil millones de tokens) y con cero descargas y likes, debe considerarse material de investigación, no un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida causal encoder-decoder: SWA + atención global puenteada por KV + atención token-sparse, residuales mHC, memoria de n-gramas, MoE top-8 con experto compartido |
| Parámetros totales | 23.846.942.486 |
| Parámetros activos | ~0,98B en backbone (1,25B incluyendo cabeza LM) |
| Longitud de contexto | 4096 tokens (stage-1) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tokenizador | Qwen3 |
| Etapa | Preentrenamiento stage-1, paso 238 |
| Tokens entrenados | 2.994.733.056 |
| Loss de entrenamiento | 1,3157 nats |

## Arquitectura y entrenamiento

La arquitectura es un encoder-decoder causal híbrido denominado d28 `final_v2`. Combina varias técnicas de atención en una misma pila: atención con ventana deslizante (SWA) para eficiencia local, atención global puenteada por KV para propagar información a larga distancia, y atención token-sparse para reducir el coste computacional. Incorpora además residuales mHC (probablemente una variante de conexiones residuales multi-cabecera) y un mecanismo de memoria de n-gramas. La capa MoE consta de 256 expertos con enrutamiento top-8 más un experto compartido, lo que explica la enorme diferencia entre parámetros totales (23,85B) y activos (~1B).

El entrenamiento corresponde a la etapa 1 de preentrenamiento, con un contexto de 4k tokens y 2.994.733.056 tokens procesados en el paso 238, alcanzando un milestone del 100 % y una loss de entrenamiento de 1,3157 nats. No se especifica la composición del dataset, ni si hubo RLHF, DPO u otras fases de alineación. Al ser un checkpoint base, no está ajustado por instrucciones. El repositorio incluye ramas `step-NNNNNN` para los tres checkpoints más recientes, además de las etiquetas `pre_decay` y `final`.

## Capacidades

- Generación de texto autorregresiva como modelo base de lenguaje.
- Razonamiento y modelado de lenguaje general (capacidad no evaluada en la información disponible).
- Procesamiento de contexto de hasta 4096 tokens.
- Arquitectura MoE con 256 expertos, lo que en teoría permite especialización por dominio, aunque no se ha documentado su comportamiento.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (tokenizador Qwen3, que es multilingüe, pero no se especifican idiomas del modelo).
- Capacidades especiales (thinking mode, visión, audio): no disponibles.
- Al ser un checkpoint de preentrenamiento, no se espera que siga instrucciones de forma fiable.

## Casos de uso

- Investigación en arquitecturas híbridas de atención: el modelo sirve como banco de pruebas para estudiar el comportamiento de SWA, atención global puenteada por KV y atención token-sparse en una pila real, comparando su eficiencia frente a transformers densos.
- Estudio de MoE de gran dispersión: con 256 expertos y top-8, permite analizar el enrutamiento, el balanceo de carga entre expertos y la especialización emergente durante el preentrenamiento.
- Experimentos de memoria de n-gramas: el mecanismo de memoria de n-gramas puede evaluarse en tareas de modelado de lenguaje y perplejidad sobre corpus específicos.
- Fine-tuning posterior para tareas concretas: al ser un checkpoint base, puede servir como punto de partida para ajuste supervisado en dominios como clasificación de texto o generación condicionada, aunque su etapa temprana limita el rendimiento esperado.
- Reproducción de pipelines de preentrenamiento: la librería ohara y el script de exportación `load_hf` permiten reproducir la carga y el entrenamiento en entornos de investigación.
- Evaluación de eficiencia computacional: la relación 1:24 entre parámetros activos y totales lo hace adecuado para medir el ahorro de FLOPs en inferencia frente a modelos densos de tamaño comparable.
- Docencia y divulgación: útil para explicar en un entorno académico cómo se combinan SWA, MoE y atención sparse en una arquitectura real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp16/bf16): los 23,85B parámetros totales requieren aproximadamente 48 GB solo para pesos, más overhead de activaciones y caché KV. No cabe en GPUs de consumo.
- VRAM estimada en cuantización de 8 bits: ~24 GB, posible en una RTX 4090 (24 GB) de forma ajustada, aunque no se han publicado cuantizaciones.
- VRAM estimada en cuantización de 4 bits: ~12-14 GB, viable en GPUs de consumo como RTX 4080/4090, pero no hay formatos GGUF ni cuantizaciones publicadas.
- GPU recomendadas: A100 80 GB, H100 80 GB o múltiples GPUs para precisión completa; el tamaño del repo (106,6 GB) sugiere pesos en fp32 o múltiples checkpoints.
- Despliegue: la librería oficial es `ohara` (instalable con `pip install -e ohara` desde el repositorio de GitHub) y la carga se realiza mediante `ohara.pretrain.export.load_hf`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ohara-d28-a1b-s5 | 23,85B | ~0,98B (1,25B con LM head) | 4k | no disponible | Hugging Face, 0 descargas |
| ohara-d28-a1b-s3a | ~24B (según búsqueda) | no disponible | no disponible | no disponible | Hugging Face |
| Modelos MoE densos comparables (p. ej. Mixtral 8x7B) | ~46,7B | ~12,9B | 32k | Apache 2.0 | ampliamente disponible |

La comparación con modelos comerciales o de gran comunidad no es directa: ohara-d28-a1b-s5 es un checkpoint de investigación con una dispersión de activación mucho mayor (1:24 frente a 1:3,6 de Mixtral) y un contexto mucho menor (4k frente a 32k). No se dispone de benchmarks que permitan comparar rendimiento.

## Limitaciones y advertencias

- Es un checkpoint de preentrenamiento en etapa temprana (paso 238, ~3B tokens), por lo que su calidad de generación y coherencia es limitada en comparación con modelos entrenados con cientos de miles de millones de tokens.
- No está ajustado por instrucciones: no se debe esperar que siga instrucciones ni mantenga formatos de conversación.
- Contexto limitado a 4096 tokens, insuficiente para muchas aplicaciones de producción que requieren ventanas largas.
- Licencia no disponible: no se puede confirmar el uso comercial ni las restricciones de redistribución.
- Idiomas soportados no documentados: aunque el tokenizador Qwen3 es multilingüe, no hay garantía de calidad en castellano u otros idiomas.
- Riesgo de alucinación y sesgos: no evaluado; al ser un modelo base sin alineación, es probable que reproduzca sesgos de los datos de preentrenamiento.
- Cero descargas y likes: no hay evidencia de uso comunitario ni validación externa.
- Tamaño del repositorio de 106,6 GB: requiere espacio en disco considerable y descarga lenta.
- No hay cuantizaciones publicadas (GGUF, GPTQ, AWQ), lo que dificulta el despliegue en hardware de consumo.
- La arquitectura híbrida y la librería `ohara` son poco convencionales; la integración con herramientas estándar (vLLM, TGI, llama.cpp) no está documentada.

## Enlaces

- Hugging Face: https://huggingface.co/joey00072/ohara-d28-a1b-s5
- Repositorio GitHub de ohara: https://github.com/joey00072/ohara
- Checkpoint relacionado ohara-d28-a1b-s3a: https://huggingface.co/joey00072/ohara-d28-a1b-s3a
