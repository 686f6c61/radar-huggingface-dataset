# ducvh5/wan21-a5b5x4c5-tm-u5-qt-fw-hd-item-wanneg-avginit-cycle12

## Resumen

Este repositorio contiene un checkpoint de ajuste fino (fine-tune) del modelo de generación de vídeo texto-a-vídeo Wan2.1-T2V-1.3B de Alibaba, publicado por el usuario `ducvh5` bajo la librería `diffusers`. Se trata de un experimento de investigación sobre arquitecturas recurrentes aplicadas a modelos de difusión: según la model card, el modelo transforma los bloques originales del transformer de difusión en una estructura cíclica de tipo A5 → B5×4 → C5, con 15 bloques únicos ejecutados 30 veces en total. El repositorio incluye 17 archivos de pesos (EMA y no-EMA) y un estado de entrenamiento en `step0003000/state.pt`, lo que indica un proceso de entrenamiento de 3.000 pasos.

El modelo hereda la base Wan2.1-T2V-1.3B, un transformer de difusión para generación de vídeo a partir de texto, pero el ajuste introduce un esquema de recurrencia con pesos de ciclo (1, 1, 0,3333, 0,3333) e inicialización por media aritmética de los bloques B. La model card describe además detalles del entrenamiento: pérdida TM en todas las salidas del bucle, muestreo de σ uniforme con shift=5, y un dataset mixto (OV, QT con captions 50/50 VB/full, OV/FW-HD 50/50 por ítem, dropout WN). Es relevante ahora porque explora una vía poco común —recurrencia en transformers de difusión— para reducir parámetros manteniendo capacidad, aunque su naturaleza experimental y la ausencia de benchmarks publicados limitan su uso en producción.

El repositorio pesa 54,9 GB, no tiene descargas ni likes, y no declara licencia ni idiomas soportados. La información disponible es escasa y muy específica del proceso de entrenamiento, sin resultados de calidad ni comparativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión recurrente (derivado de Wan2.1-T2V-1.3B; estructura A5 → B5×4 → C5, 15 bloques únicos / 30 ejecutados) |
| Parametros totales | no disponible (el nombre indica base 1.3B, pero el ajuste recurrente no declara recuento final) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería diffusers); incluye `state.pt` de entrenamiento |

## Arquitectura y entrenamiento

El modelo parte de Wan2.1-T2V-1.3B-Diffusers, un transformer de difusión para texto-a-vídeo. El ajuste convierte la pila de bloques en un esquema recurrente: 5 bloques A, 5 bloques B ejecutados 4 veces y 5 bloques C, lo que da 15 bloques únicos pero 30 ejecuciones por paso. La inicialización de los bloques B se hace por media aritmética (avginit) y los pesos de ciclo son 1, 1, 0,3333 y 0,3333. La pérdida empleada es TM aplicada a todas las salidas del bucle, con muestreo σ ~ U(0,1), shift=5 y t=1000σ.

El entrenamiento usa un dataset mixto: OV, captions QT con mezcla 50/50 entre VB y full, y OV/FW-HD 50/50 por ítem, con dropout WN. Se han publicado 17 archivos de pesos EMA y no-EMA, y el último estado es `step0003000/state.pt`, lo que sugiere 3.000 pasos de entrenamiento. No se detalla el número de tokens, la composición exacta del dataset ni si hubo RLHF/DPO (en difusión no aplica de forma estándar). La innovación principal es la recurrencia con inicialización por media, que busca reutilizar parámetros sin colapsar el entrenamiento.

## Capacidades

- Generación de vídeo a partir de texto (pipeline `text-to-video`), heredada de Wan2.1-T2V-1.3B.
- Estructura recurrente que permite ejecutar 30 bloques con solo 15 únicos, reduciendo el recuento de parámetros efectivo.
- Checkpoints EMA y no-EMA para comparar estabilidad del entrenamiento.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- No se documentan capacidades especiales adicionales más allá de la generación de vídeo.

## Casos de uso

- Investigación en arquitecturas recurrentes para difusión: el modelo sirve como banco de pruebas para estudiar si la recurrencia A5 → B5×4 → C5 reduce parámetros sin degradar la calidad del vídeo generado.
- Experimentos de inicialización por media aritmética: permite reproducir y comparar la técnica avginit frente a inicializaciones aleatorias en transformers de vídeo.
- Evaluación de checkpoints EMA vs no-EMA: útil para analizar la estabilidad del entrenamiento en modelos de difusión con bucles recurrentes.
- Generación de clips de vídeo de baja resolución en entornos de investigación: al derivar de Wan2.1-T2V-1.3B, puede generar vídeos a partir de prompts de texto, aunque sin garantías de calidad comercial.
- Estudio de pérdidas TM en bucles: permite investigar cómo afecta aplicar la pérdida a todas las salidas del bucle frente a solo la final.
- Reproducción de experimentos con datasets mixtos (OV, QT, FW-HD): útil para analizar el efecto de mezclas de datos y captions en la generación de vídeo.
- Base para fine-tunes posteriores: al estar en formato diffusers y safetensors, puede servir como punto de partida para otros ajustes experimentales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el repositorio pesa 54,9 GB, lo que sugiere que los pesos completos (EMA y no-EMA, 17 archivos) requieren almacenamiento considerable. Para inferencia en precisión completa de un modelo base de 1.3B se estima un rango de 8-16 GB, pero el ajuste recurrente y los múltiples checkpoints pueden aumentar el uso.
- GPU recomendadas: no disponible; por el tamaño base, una GPU con al menos 16-24 GB (RTX 4090, A100, H100) sería razonable, pero no hay confirmación del autor.
- ¿Cabe en consumer GPU? Probablemente en GPUs de 16 GB o más con cuantización, pero no hay datos oficiales.
- Opciones de despliegue: diffusers (librería declarada); no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplican a difusión de vídeo de la misma forma).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ducvh5/wan21-a5b5x4c5-... (este) | no disponible (base 1.3B) | no disponible | sin benchmarks | no disponible | Hugging Face, 0 descargas |
| Wan-AI/Wan2.1-T2V-1.3B-Diffusers | 1.3B | no disponible | benchmarks del modelo base no incluidos aquí | no disponible en esta ficha | Hugging Face |
| Otros text-to-video de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos comparativos suficientes para establecer una comparativa rigurosa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo experimental con 0 descargas y 0 likes; no hay evidencia de validación por la comunidad.
- Sin benchmarks publicados: no se puede afirmar nada sobre la calidad del vídeo generado.
- Licencia no disponible: riesgo legal para uso comercial; hay que contactar con el autor o asumir que no está permitido.
- Idiomas no declarados: no se puede garantizar soporte multilingüe en los prompts.
- La model card es muy críptica (abreviaturas como OV, QT, VB, FW-HD, WN, TM) y no detalla el dataset ni el proceso completo, lo que dificulta la reproducibilidad.
- Riesgo de alucinación visual y artefactos propio de los modelos de difusión de vídeo, agravado por el ajuste recurrente sin evaluación publicada.
- El repositorio incluye 17 archivos de pesos y un `state.pt`, lo que puede confundir sobre cuál es el checkpoint final recomendado.
- No se documentan sesgos conocidos, pero al no haber evaluación, no se pueden descartar.
- El tamaño del repo (54,9 GB) y la ausencia de cuantizaciones documentadas limitan su despliegue en entornos con recursos ajustados.

## Enlaces

- Hugging Face: https://huggingface.co/ducvh5/wan21-a5b5x4c5-tm-u5-qt-fw-hd-item-wanneg-avginit-cycle12
- Modelo base: https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B-Diffusers
- No se han encontrado papers, blogs, repositorios o demos adicionales en la información proporcionada.
