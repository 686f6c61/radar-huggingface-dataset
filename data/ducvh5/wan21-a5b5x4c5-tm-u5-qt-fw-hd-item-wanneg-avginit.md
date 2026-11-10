# ducvh5/wan21-a5b5x4c5-tm-u5-qt-fw-hd-item-wanneg-avginit

## Resumen

Este repositorio contiene un ajuste fino (fine-tune) del modelo de generación de vídeo a partir de texto Wan2.1-T2V-1.3B-Diffusers, publicado por el usuario ducvh5 bajo el identificador `wan21-a5b5x4c5-tm-u5-qt-fw-hd-item-wanneg-avginit`. El modelo base, desarrollado por Wan-AI (Alibaba), es un transformer de difusión para text-to-video de aproximadamente 1.300 millones de parámetros. El ajuste introduce una estructura recurrente de bloques (denominada "recurrent-transformer" en las etiquetas) con un esquema de 15 bloques únicos ejecutados 30 veces, es decir, dos ciclos de recurrencia.

La model card es extremadamente escueta y críptica: describe abreviaturas sin expandir (A5 → B5×4 → C5, TM, OV, QT, FW-HD, WN) y no ofrece información sobre licencia, idiomas, composición del dataset ni métricas de evaluación. El repositorio ocupa 31,8 GB y contiene 9 archivos de pesos en formato safetensors (EMA y no-EMA), con un estado de entrenamiento en `step0001500/state.pt`, lo que sugiere un entrenamiento corto (1.500 pasos) y probablemente experimental.

Por su naturaleza, se trata de un checkpoint de investigación más que de un modelo listo para producción: no tiene descargas ni likes, la licencia no está declarada y la documentación no permite reproducir el entrenamiento. Es relevante únicamente para quienes investigan arquitecturas recurrentes aplicadas a difusión de vídeo o quieren experimentar con variantes del Wan2.1 de 1.3B.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión para vídeo (Wan2.1) con estructura recurrente de bloques; 15 bloques únicos ejecutados 30 veces (2 ciclos) |
| Parámetros totales | Aproximadamente 1.300 millones (heredados del modelo base Wan2.1-T2V-1.3B); el ajuste no declara un recuento distinto |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (solo se publican pesos safetensors; no se documentan variantes GGUF/FP8) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Safetensors (librería diffusers); incluye `state.pt` con el estado del entrenamiento |

## Arquitectura y entrenamiento

El modelo parte de Wan2.1-T2V-1.3B-Diffusers, un transformer de difusión para generación de vídeo condicionada por texto. El ajuste introduce una topología recurrente descrita como "A5 → B5×4 → C5": cinco bloques de entrada (A), un núcleo de cinco bloques repetido cuatro veces (B) y cinco bloques de salida (C), lo que da 15 bloques únicos y 30 ejecuciones efectivas por pasada. La inicialización del núcleo B se hace como media aritmética de cuatro ciclos del modelo profesor ("B equal arithmetic mean across four teacher cycles"), una técnica de inicialización por promedio para estabilizar el entrenamiento recurrente.

El entrenamiento usa un objetivo de pérdida denominado "TM (all loop exits)", es decir, se aplica supervisión en todas las salidas intermedias del bucle recurrente. El muestreo de ruido sigue σ ~ U(0,1) con shift=5 y t=1000σ, un esquema habitual en modelos de difusión de flujo. Los datos se describen con abreviaturas no expandidas: "OV", "QT captions 50/50 VB/full", "OV/FW-HD 50/50 per item" y "dropout=WN". No se especifica el número de tokens, la composición exacta del dataset ni si hubo RLHF o DPO. El estado final corresponde al paso 1.500, lo que indica un entrenamiento breve.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video), heredada del pipeline de Wan2.1-T2V-1.3B.
- Estructura recurrente con salidas supervisadas en cada ciclo del bucle, potencialmente útil para estudiar consistencia temporal entre iteraciones.
- Compatible con la librería `diffusers` al estar etiquetado como tal y derivar de un checkpoint Diffusers.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni modo "thinking".
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- No se documenta soporte de image-to-video ni de control adicional (pose, depth, etc.).

## Casos de uso

- Investigación en arquitecturas recurrentes para difusión de vídeo: el modelo permite comparar el efecto de 15 bloques únicos ejecutados 30 veces frente al transformer plano original de Wan2.1-1.3B, midiendo calidad y coherencia temporal.
- Experimentos de inicialización por promedio de profesores: sirve como referencia para estudiar cómo la inicialización "avginit" afecta a la convergencia en bucles recurrentes.
- Pruebas de supervisión en todas las salidas del bucle ("all loop exits"): útil para analizar si supervisar salidas intermedias mejora la estabilidad del entrenamiento.
- Generación de clips cortos de bajo coste en entornos de laboratorio: con 1.300 millones de parámetros, es viable en una GPU de 24 GB en precisión reducida para prototipos.
- Reproducción de experimentos académicos sobre difusión de vídeo: el snapshot incluye `state.pt` del paso 1.500, lo que facilita reanudar o auditar el entrenamiento.
- Base para nuevos fine-tunes: al derivar de Wan2.1-T2V-1.3B-Diffusers, puede reutilizarse como punto de partida en pipelines `diffusers` existentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño del modelo base (1.300 millones de parámetros), se estima en torno a 8-12 GB en fp16 para el transformer, más memoria para el VAE y el codificador de texto.
- GPU recomendadas: no declaradas por el autor; por tamaño, una RTX 4090 (24 GB) o A100/H100 son suficientes para inferencia en fp16.
- Cabe en GPU de consumo: previsiblemente sí en RTX 3090/4090 y GPUs con 16 GB o más, aunque no está verificado por el autor.
- Opciones de despliegue: `diffusers` (librería declarada); no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI (son herramientas para LLM, no para difusión de vídeo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ducvh5/wan21-a5b5x4c5-tm-u5-qt-fw-hd-item-wanneg-avginit | ~1.300 M | No disponible | No disponible | No disponible | Hugging Face, 0 descargas |
| Wan-AI/Wan2.1-T2V-1.3B-Diffusers (base) | ~1.300 M | No disponible | No disponible en esta ficha | No disponible en esta ficha | Hugging Face |
| Otros modelos text-to-video de tamaño similar | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- La model card no declara licencia, lo que impide determinar si el uso comercial está permitido; hay que consultar la licencia del modelo base Wan2.1 antes de cualquier uso productivo.
- Documentación críptica: abreviaturas sin expandir (TM, OV, QT, FW-HD, WN, VB) que impiden reproducir el entrenamiento o entender la composición del dataset.
- Entrenamiento muy corto (1.500 pasos) y sin métricas publicadas; la calidad del ajuste no está verificada.
- Riesgo de alucinación y artefactos visuales inherente a los modelos de difusión de vídeo, agravado por la falta de evaluación.
- Sin información sobre sesgos, idiomas soportados ni limitaciones de contexto.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni validación externa.
- El snapshot incluye `state.pt` y 9 pesos EMA/no-EMA; es necesario identificar qué archivo corresponde a qué paso antes de cargarlo.
- No se documenta compatibilidad con pipelines de producción (vLLM, TGI) ni cuantizaciones ligeras.

## Enlaces

- Hugging Face: https://huggingface.co/ducvh5/wan21-a5b5x4c5-tm-u5-qt-fw-hd-item-wanneg-avginit
- Modelo base: https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B-Diffusers
- Librería diffusers: https://github.com/huggingface/diffusers
