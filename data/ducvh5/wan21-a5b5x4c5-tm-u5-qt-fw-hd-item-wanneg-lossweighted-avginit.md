# ducvh5/wan21-a5b5x4c5-tm-u5-qt-fw-hd-item-wanneg-lossweighted-avginit

## Resumen

`ducvh5/wan21-a5b5x4c5-tm-u5-qt-fw-hd-item-wanneg-lossweighted-avginit` es un checkpoint experimental de generación de vídeo a partir de texto (text-to-video) derivado del modelo Wan2.1-T2V-1.3B de Alibaba. No se trata de un modelo publicado oficialmente por un laboratorio, sino de un ajuste fino (finetune) de autor individual alojado en Hugging Face, con cero descargas y cero likes en el momento de la consulta. Su interés es acotado: sirve para estudiar variantes de arquitectura recurrente sobre un modelo de difusión de vídeo ya existente.

La particularidad técnica del checkpoint es la reorganización de sus bloques en un esquema recurrente etiquetado como "A5 → B5×4 → C5", con 15 bloques únicos y 30 bloques ejecutados, es decir, un transformer recurrente que reutiliza pesos en un bucle. El entrenamiento se realizó sobre el modelo base Wan2.1 de 1.300 millones de parámetros, con un total de 1.000 pasos y pesos EMA y no-EMA guardados en el snapshot.

Es relevante ahora únicamente como material de investigación reproducible: la model card documenta con precisión los hiperparámetros (pérdida TM en todas las salidas del bucle, σ ~ U(0,1), shift=5, t=1000σ, inicialización por media aritmética de B, pesos de ciclo 0.3333/0.3333/0.3333/1). No hay evidencia de benchmarks ni de validación cualitativa publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer recurrente (recurrent-transformer) derivado de Wan2.1-T2V-1.3B; esquema A5 → B5×4 → C5 (15 bloques únicos, 30 ejecutados) |
| Parametros totales | 1.300 millones (heredados del modelo base Wan2.1-T2V-1.3B) |
| Parametros activos | no disponible (no es MoE; la recurrencia reutiliza pesos, no añade parámetros) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors y `state.pt` (checkpoints de entrenamiento) |

## Arquitectura y entrenamiento

El modelo parte de Wan2.1-T2V-1.3B-Diffusers, un transformer de difusión para text-to-video, y lo reorganiza en un esquema recurrente: cinco bloques de tipo A, cinco bloques de tipo B ejecutados cuatro veces cada uno y cinco bloques de tipo C, lo que da 15 bloques con parámetros únicos pero 30 ejecuciones efectivas por paso. La inicialización de los bloques B se hace por media aritmética, con pesos de ciclo 0.3333, 0.3333, 0.3333 y 1. La pérdida se aplica en todas las salidas del bucle ("TM, all loop exits"), lo que fuerza coherencia en cada iteración recurrente y no solo en la final.

El entrenamiento usa muestreo σ ~ U(0,1) con shift=5 y t=1000σ, es decir, el schedule de difusión estándar de Wan con un desplazamiento de 5. Los datos combinan "OV" con subtítulos QT en proporción 50/50 entre VB y full, y una mezcla 50/50 de OV y FW-HD por ítem, con dropout de tipo WN. El snapshot contiene seis pesos EMA y no-EMA, y el último estado guardado es `step0001000/state.pt`, lo que indica un entrenamiento corto de 1.000 pasos. No se documenta el número total de tokens de vídeo, la composición exacta del dataset ni si hubo RLHF o DPO (en difusión no aplica habitualmente).

## Capacidades

- Generación de vídeo a partir de texto (pipeline `text-to-video`), heredada del modelo base Wan2.1-T2V-1.3B.
- Ejecución recurrente de bloques: el mismo conjunto de pesos se aplica varias veces, lo que puede permitir ajustar el coste computacional en inferencia sin cambiar el número de parámetros.
- Compatibilidad con la librería `diffusers` y con el formato de pesos safetensors del modelo base.
- Checkpoints intermedios y finales disponibles (EMA y no-EMA) para experimentación.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking; son capacidades no aplicables a un modelo de difusión de vídeo.
- Capacidades multilingües: no disponibles; el autor no especifica idiomas de los prompts.

## Casos de uso

- Investigación en arquitecturas recurrentes para difusión de vídeo: el checkpoint permite comparar el esquema A5 → B5×4 → C5 frente al transformer plano de Wan2.1 con el mismo presupuesto de parámetros, midiendo calidad y coste por bucle.
- Reproducción de experimentos de pérdida en todas las salidas del bucle: útil para validar si la supervisión en cada iteración recurrente mejora la coherencia temporal en vídeos cortos.
- Estudio de inicialización por media aritmética: el checkpoint sirve como referencia para analizar cómo afecta la inicialización de los bloques B al entrenamiento recurrente.
- Pruebas de schedule de difusión con shift=5 y σ uniforme: permite evaluar la estabilidad del muestreo en un modelo de 1.300 millones de parámetros en GPUs de gama alta de consumo.
- Base para finetunes posteriores: al estar en formato `diffusers` y safetensors, se puede cargar con las herramientas estándar y continuar el entrenamiento con datasets propios.
- Comparación de pesos EMA frente a no-EMA: el snapshot incluye ambos, lo que facilita estudiar la diferencia de calidad y estabilidad entre ellos en la generación de vídeo.
- Docencia y experimentación académica: el tamaño de 1.300 millones y el pipeline text-to-video lo hacen manejable para laboratorios con recursos limitados que quieran estudiar recurrencia en difusión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño del modelo base (1.300 millones de parámetros) y el repo de 23,1 GB, se necesita al menos una GPU con 24 GB para pesos en fp16 sin cuantizar, y más si se ejecutan 30 bloques con estados intermedios.
- GPU recomendadas: no disponible en la documentación del autor; por tamaño, una RTX 4090 (24 GB), A100 (40/80 GB) o H100 son opciones razonables para el modelo base.
- ¿Cabe en GPU de consumo? Probablemente en RTX 4090 y RTX 3090 con fp16, aunque no está verificado por el autor; en GPUs de 16 GB requeriría cuantización, que no está documentada.
- Opciones de despliegue: `diffusers` (librería declarada); no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de difusión de vídeo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ducvh5/wan21-a5b5x4c5-tm-u5-qt-fw-hd-item-wanneg-lossweighted-avginit | 1.300 M | no disponible | Text-to-video recurrente (finetune) | no disponible | Hugging Face, 0 descargas |
| Wan-AI/Wan2.1-T2V-1.3B-Diffusers | 1.300 M | no disponible | Text-to-video (difusión) | no disponible en esta ficha | Hugging Face, modelo base oficial |
| Otros modelos text-to-video de ~1.300 M | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo experimental de autor individual, con cero descargas y cero likes: no hay validación externa ni evidencia de calidad.
- Entrenamiento de solo 1.000 pasos sobre el modelo base: es probable que el ajuste sea limitado y que la calidad sea inferior a la del Wan2.1 original, aunque no hay datos que lo confirmen.
- Licencia no disponible: no se puede asumir uso comercial; hay que contactar con el autor o consultar la licencia del modelo base Wan2.1.
- Idiomas no especificados: se desconoce si los prompts en castellano funcionan correctamente.
- Riesgo de alucinación visual y artefactos temporales inherente a los modelos de difusión de vídeo, agravado por el entrenamiento corto.
- No hay información sobre sesgos del dataset de entrenamiento (OV, FW-HD, QT), por lo que no se pueden evaluar sesgos de género, raza o cultura.
- La recurrencia de 30 bloques ejecutados puede aumentar el coste de inferencia frente al modelo base sin garantía de mejora proporcional.
- No se documentan cuantizaciones ni optimizaciones de despliegue, lo que limita su uso en producción.
- El repo incluye checkpoints de entrenamiento (`state.pt`), no solo pesos finales, lo que puede confundir en un despliegue directo.

## Enlaces

- Hugging Face: https://huggingface.co/ducvh5/wan21-a5b5x4c5-tm-u5-qt-fw-hd-item-wanneg-lossweighted-avginit
- Modelo base: https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B-Diffusers
- Repositorio Wan2.1 (no verificado en la búsqueda): no disponible
- Paper de Wan2.1: no disponible
- Demo: no disponible
