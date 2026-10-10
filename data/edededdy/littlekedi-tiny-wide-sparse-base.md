# edededdy/LittleKedi-tiny-wide-sparse-base

## Resumen

LittleKedi-tiny-wide-sparse-base es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) entrenado desde cero por el usuario edededdy, publicado bajo licencia Apache 2.0. Se trata de un artefacto educativo y de investigación: con 3.782.080 parámetros totales (1,6M activos por token, un 42%, y 0,52M activos sin contar la tabla de embeddings), está diseñado para explorar cómo escalan las arquitecturas MoE tipo DeepSeek-V3 en tamaños extremadamente reducidos.

El modelo es la variante "wide-sparse" de la familia LittleKedi, lo que significa que prioriza capacidad total de almacenamiento mediante muchos expertos estrechos (64 expertos enrutados de 32 dimensiones ocultas, top-4) a costa de activar una fracción pequeña de los parámetros por token. Usa Multi-head Latent Attention (MLA) y enrutamiento limitado por grupos, dos innovaciones tomadas de la arquitectura DeepSeek-V3.

Es un modelo base, sin ajuste por instrucciones: continúa texto, pero no sigue órdenes. Genera inglés fluido y coherente a nivel superficial, aunque con muy poco conocimiento factual, por lo que el propio autor advierte de que no debe usarse para nada relevante. Su contexto es de solo 1.024 tokens y está entrenado con 1.000 millones de tokens en un único paso sobre una mezcla de datos mayoritariamente sintéticos y educativos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE tipo DeepSeek-V3 con Multi-head Latent Attention (MLA) |
| Parametros totales | 3.782.080 (3,78M) |
| Parametros activos | 1,57M por token (42% del total); 0,52M activos sin embeddings |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (solo se publican pesos completos en safetensors; no hay GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura consta de 4 capas con tamaño oculto de 128. La capa 0 usa una FFN densa SwiGLU de dimensión 352, mientras que las capas 1 a 3 son capas MoE con enrutamiento DeepSeekMoE: 64 expertos enrutados (SwiGLU, 32 dimensiones ocultas), top-4, más 2 expertos compartidos. El gating es sigmoideo y el enrutamiento está limitado por grupos (4 grupos, top-2). La atención es Multi-head Latent Attention con 4 cabezas, latente de KV de 32 dimensiones, dimensión RoPE desacoplada de 16 y dimensiones de cabeza de 16+16 (q/k) y 16 (v); la caché KV almacena únicamente el latente de 32 dimensiones más una clave RoPE de 16 dimensiones por token. Los embeddings de entrada y la cabeza de salida están atados (tied).

Para el equilibrio de carga se usa el sesgo sin pérdida auxiliar (auxiliary-loss-free bias balancing, velocidad de actualización 0,001) más una pequeña pérdida por secuencia (α = 0,0001). Durante la segunda mitad del entrenamiento, la mediana por lote situó 1,23 veces la carga media en el experto más ocupado (1,28× en la peor capa) y el 0,00% de las asignaciones se descartaron por capacidad. El despacho de expertos usa capacidad fija durante el entrenamiento (factor de capacidad 2,0, con descarte de desbordamientos), mientras que en inferencia es siempre sin descarte (dropless).

El entrenamiento usa 1.000 millones de tokens en un único paso, con 801.792 documentos (unas 264 tokens por parámetro total, ~637 por parámetro activo). Las fuentes se intercalan a lo largo de todo el entrenamiento y son: FineWeb-Edu, Cosmopedia (Stanford, OpenStax, WikiHow y Khan Academy), FineMath 4+, SmolTalk y codeparrot/github-code-clean. El tokenizador es un BPE a nivel de byte de 8.192 tokens (unos 3,75 bytes por token en esta mezcla), con los dígitos sin dividir (tokenizador v1) y sin tokens de chat, por lo que los datos de conversación se presentan como texto plano. No se menciona ninguna fase de RLHF o DPO: es un modelo base sin ajuste por instrucciones.

## Capacidades

- Generacion de texto en ingles: continuación de texto con fluidez superficial y coherencia local.
- Capacidad de almacenamiento de conocimiento distribuido entre 64 expertos enrutados, aunque con muy pocos hechos aprendidos por el escaso volumen de datos de entrenamiento.
- Razonamiento y matematicas: cobertura limitada procedente de FineMath 4+, sin datos publicados de rendimiento.
- Codigo: presencia de codeparrot/github-code-clean en la mezcla, por lo que puede generar fragmentos de codigo, sin garantias de correccion.
- Soporte de tool calling / function calling: no disponible (no se documenta ningun formato de llamada a herramientas).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles; la model card solo declara `en`.
- Capacidad especial de "thinking mode", vision o audio: no disponible.

## Casos de uso

- Investigacion sobre arquitecturas MoE: el modelo permite estudiar como afecta el numero de expertos y el ratio de esparsidad al comportamiento, comparandolo directamente con sus hermanos `tiny` y `tiny-sparse`, que comparten tokenizador y dataset.
- Experimentacion educativa en entrenamiento desde cero: con 3,8M parametros se puede entrenar y depurar en hardware modesto, sirviendo para reproducir el pipeline completo (tokenizacion, enrutamiento, equilibrio de carga).
- Pruebas de enrutamiento y equilibrio de expertos: los datos de carga publicados (1,23× la media en el experto mas ocupado) permiten validar implementaciones de auxiliary-loss-free bias balancing frente a una referencia real.
- Validacion de implementaciones de MLA: al usar MLA con latente de 32 dimensiones y RoPE desacoplado, sirve como caso de prueba a escala minima para verificar codigo de atencion con caché KV comprimida.
- Generacion de texto de relleno en demos y tutoriales: util para ilustrar pipelines de `text-generation` sin coste de computo, siempre que el texto resultante no se use en produccion.
- Benchmarking de tooling de inferencia (transformers, carga de safetensors, cuantizacion manual): permite medir sobrecargas de arranque y comparar backends con un modelo diminuto.
- Estudio de tokenizadores BPE a nivel de byte: el tokenizador v1 con digitos sin dividir puede analizarse como caso concreto de decisiones de preprocesado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion estandar, ni comparaciones numericas de calidad con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 7,6 MB en fp16 y unos 15 MB en fp32, calculado a partir de los 3,78M parametros totales (estimacion derivada del recuento de parametros, no publicada por el autor).
- GPU recomendadas: cualquier GPU, incluida cualquiera integrada; el modelo cabe holgadamente en GPUs de consumo como RTX 3060, RTX 4090 o incluso en CPU.
- Cabe en GPU de consumo: si, en practicamente todas, y tambien en CPU.
- Opciones de despliegue: la model card no especifica backends; al publicarse solo safetensors, el uso directo es mediante `transformers`. No se proporcionan pesos GGUF, por lo que llama.cpp u Ollama requeririan una conversion previa no documentada. vLLM y TGI no estan confirmados para este modelo.
- Latencia y throughput estimados: no disponible.
- Contexto: la ventana de 1.024 tokens limita la memoria de la cache KV necesaria (solo 32 dimensiones de latente mas 16 de RoPE por token).

## Comparativa con modelos similares

Los modelos comparables directamente son los otros dos miembros de tamano `tiny` de la propia familia LittleKedi, que comparten tokenizador (8K) y dataset, por lo que la comparacion es controlada.

| Modelo | Variante | Vocab | Total | Activos | Activos sin emb. | Activos % | Expertos enrutados |
|---|---|---|---|---|---|---|---|
| `tiny` | standard | 8K | 2,0M | 1,5M | 0,5M | 78% | 8 × 64, top-2 |
| `tiny-sparse` | sparse | 8K | 2,6M | 1,6M | 0,5M | 60% | 32 × 32, top-4 |
| `tiny-wide-sparse` (este modelo) | wide-sparse | 8K | 3,8M | 1,6M | 0,5M | 42% | 64 × 32, top-4 |

Los tres comparten aproximadamente el mismo coste de computo por token (activos sin embeddings: 0,5M), pero difieren en capacidad total: el modelo wide-sparse almacena mas conocimiento potencial a cambio de que cada experto vea menos tokens durante el entrenamiento. No se dispone de benchmarks para comparar su calidad real, y no se conocen modelos de terceros comparables en esta informacion.

## Limitaciones y advertencias

- Alucinacion severa: el propio autor advierte de que el modelo "sabe pocos hechos y se inventa cosas con seguridad"; no debe usarse en aplicaciones donde la veracidad importe.
- Modelo base sin instrucciones: no sigue ordenes ni mantiene formato conversacional; solo continua texto.
- Sesgos conocidos: no disponibles de forma explicita, pero al entrenarse sobre todo con datos sinteticos (Cosmopedia) y educativos puede heredar los sesgos de esas fuentes.
- Limitacion de idioma: solo ingles declarado; no hay soporte verificado de castellano ni de otros idiomas.
- Contexto muy corto: 1.024 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Volumen de entrenamiento escaso: 1.000M tokens en un solo paso, muy por debajo de lo habitual, lo que limita el conocimiento factual y la calidad general.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero la propia model card desaconseja explicitamente cualquier uso relevante.
- Sin cuantizaciones publicadas: solo safetensors en precision completa, lo que obliga a convertir si se quiere usar con llama.cpp, Ollama u otros runners GGUF.
- Sin tokens de chat: los datos conversacionales se entrenaron como texto plano (`User:` / `Assistant:`), por lo que no hay una plantilla de chat definida.
- Tamano de repo de 0,0 GB y 0 descargas/0 likes: modelo practicamente sin adopcion ni validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/edededdy/LittleKedi-tiny-wide-sparse-base
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset Cosmopedia: https://huggingface.co/datasets/HuggingFaceTB/cosmopedia
- Dataset FineMath: https://huggingface.co/datasets/HuggingFaceTB/finemath
- Dataset SmolTalk: https://huggingface.co/datasets/HuggingFaceTB/smoltalk
- Dataset github-code-clean: https://huggingface.co/datasets/codeparrot/github-code-clean
- Paper de DeepSeek-V3 (arquitectura de referencia): no disponible en la informacion proporcionada
- Repositorio de codigo, demo o blog del autor: no disponible en la informacion proporcionada
