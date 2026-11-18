# alphaedge-ai/siglip2-large-patch16-512-nep-32768

## Resumen

`siglip2-large-patch16-512-nep-32768` es una version recortada (trimmed) del codificador vision-lenguaje `google/siglip2-large-patch16-512` de Google, especializada para el idioma nepalí mediante la reduccion del vocabulario del tokenizador de texto. Lo publica el usuario `alphaedge-ai` bajo licencia Apache 2.0 y esta pensado para tareas de clasificacion de imagenes zero-shot y similitud texto-imagen en nepalí.

El modelo conserva la arquitectura SigLIP 2 original (par de torres Vision Transformer + text encoder) pero reduce el vocabulario de 256.000 a 32.768 tokens, lo que elimina el 87,20% de las entradas del embedding de texto y recorta el total de parametros de 882.313.218 a 653.723.650 (un 25,91% menos). El objetivo es reducir la huella de memoria y el coste de despliegue en un idioma concreto, a cambio de degradar el rendimiento en otros idiomas cuyos tokens se han eliminado.

Es relevante para equipos que necesiten un encoder multimodal ligero, multilingue solo en apariencia pero optimizado para nepalí, con un repositorio de 2,6 GB en safetensors y compatible con `sentence-transformers` y `transformers`. No es un modelo generativo: no produce texto, sino embeddings y puntuaciones de similitud.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SigLIP 2 (par de torres: Vision Transformer patch16-512 + text encoder), base google/siglip2-large-patch16-512 |
| Parametros totales | 653.723.650 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de embeddings; sin ventana generativa declarada) |
| Tipos de cuantizacion | no disponible en la model card (pesos en safetensors sin cuantizar; el tag `quantized` se refiere a la reduccion de vocabulario, no a cuantizacion numerica) |
| Idiomas soportados | ne (nepalí); otros idiomas degradados por eliminacion de tokens |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura SigLIP 2 descrita en el paper arXiv:2502.14786: un encoder de imagenes tipo Vision Transformer con parches de 16x16 y resolucion de 512, y un encoder de texto, entrenados de forma conjunta con una funcion de perdida sigmoidea (sigmoide en lugar de softmax contrastivo). El modelo base es la variante "large" de Google.

El proceso de "trimming" documentado por Hugging Face consiste en seleccionar un subconjunto del vocabulario del tokenizador y recortar las filas correspondientes de la matriz de embeddings de texto. Para este modelo se usaron 29.721 textos del dataset `lbourdois/fineweb-2-trimming` en nepalí para determinar que tokens conservar, reduciendo el vocabulario de 256.000 a 32.768 entradas. No se documenta un reentrenamiento completo ni ajuste fino posterior: el autor indica que el modelo recortado "deberia comportarse de forma similar al original" dentro del idioma objetivo. No hay informacion sobre RLHF, DPO ni datos de entrenamiento adicionales.

## Capacidades

- Clasificacion de imagenes zero-shot mediante etiquetas candidatas en nepalí.
- Calculo de embeddings de imagen y de texto y similitud texto-imagen (via `sentence-transformers`).
- Recuperacion y ranking texto-imagen en un corpus nepalí.
- Integracion con el pipeline `zero-shot-image-classification` de `transformers`.
- Capacidades multilingues limitadas al nepalí; el resto de idiomas queda degradado por la reduccion de vocabulario.
- No soporta generacion de texto, tool calling, agentes, razonamiento multi-paso, audio ni thinking mode.

## Casos de uso

- Moderacion y etiquetado de imagenes en nepalí: clasificar contenido visual con etiquetas candidatas escritas en nepalí, aprovechando el vocabulario recortado y la menor huella de memoria frente al modelo original.
- Busqueda visual en aplicaciones nepalíes: indexar imagenes y consultas textuales en nepalí mediante embeddings y similitud coseno, con un encoder de 654 M de parametros desplegable en una sola GPU.
- Organizacion automatica de fototecas: agrupar imagenes por categorias definidas por el usuario en nepalí sin necesidad de un clasificador supervisado entrenado a medida.
- Filtrado de catalogos de e-commerce: asignar categorias visuales a productos a partir de etiquetas en nepalí, con inferencia por lotes.
- Accesibilidad: generar descripciones o etiquetas de imagenes en nepalí combinando el encoder con un modelo generativo externo que consuma los embeddings.
- Investigacion en vision-lenguaje de bajos recursos: servir como baseline ligero para experimentos con nepalí, al reducir el coste de almacenamiento y computo frente al SigLIP 2 large original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,6-3 GB en precision nativa (fp32/fp16 segun el checkpoint), dado el tamano del repositorio de 2,6 GB y los 654 M de parametros.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para inferencia por lotes pequenos; A100, H100 o L4 para despliegues de alto throughput.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares con 8 GB o mas.
- Opciones de despliegue: `transformers` (pipeline zero-shot-image-classification), `sentence-transformers`, y servidores de embeddings compatibles con `sentence-transformers`; no se documentan pesos GGUF ni soporte de llama.cpp/Ollama (no es un modelo generativo).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| alphaedge-ai/siglip2-large-patch16-512-nep-32768 | 653.723.650 | parches 16x16, 512 px | ne (nepalí) | apache-2.0 | Hugging Face, 7 descargas |
| google/siglip2-large-patch16-512 (modelo base) | 882.313.218 | parches 16x16, 512 px | multilingue | apache-2.0 | Hugging Face |
| google/siglip2-base-patch16-512 (variante menor de la familia) | no disponible en la informacion | parches 16x16, 512 px | multilingue | apache-2.0 | Hugging Face |

Frente al modelo base, la version recortada reduce parametros un 25,91% y vocabulario un 87,20%, a costa de perder cobertura en idiomas distintos del nepalí. Frente a variantes de menor tamano de la familia SigLIP 2, la comparacion de rendimiento no puede realizarse sin benchmarks publicados.

## Limitaciones y advertencias

- El recorte de vocabulario elimina tokens no usados en nepalí: el rendimiento en otros idiomas puede degradarse de forma significativa.
- La model card advierte de que el modelo "puede no funcionar bien para otros idiomas"; no debe usarse como encoder multilingue general.
- No se han publicado benchmarks que verifiquen la equivalencia de rendimiento con el modelo original en nepalí.
- Riesgo de sesgos heredados del dataset de entrenamiento original de SigLIP 2 (pares imagen-texto web), no evaluado en esta version.
- Al ser un modelo de embeddings y no generativo, no produce texto ni razona; cualquier caso de uso generativo requiere un modelo adicional.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; el modelo tiene 7 descargas y 0 likes, lo que indica escasa validacion por la comunidad.
- No se documentan requisitos de contexto, cuantizaciones oficiales ni pesos GGUF; el despliegue debe hacerse en fp32/fp16 con `transformers` o `sentence-transformers`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alphaedge-ai/siglip2-large-patch16-512-nep-32768
- Modelo base: https://huggingface.co/google/siglip2-large-patch16-512
- Paper SigLIP 2: https://arxiv.org/abs/2502.14786
- Blog de introduccion al trimming: https://huggingface.co/blog/lbourdois/introduction-to-trimming
- Dataset de minado: https://huggingface.co/datasets/lbourdois/fineweb-2-trimming
