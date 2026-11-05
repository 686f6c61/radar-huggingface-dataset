# ducvh5/wan21-a5b5x4c5-tm-u5-qt-fw-hd-item-wanneg

## Resumen

Este repositorio contiene un ajuste fino (fine-tune) del modelo de generacion de video texto-a-video Wan2.1-T2V-1.3B de Alibaba, publicado por el usuario ducvh5 en HuggingFace. Se trata de un checkpoint experimental de investigación, no de un modelo de produccion: el nombre del repositorio codifica una configuracion muy concreta de entrenamiento (recurrent-transformer con 15 bloques unicos y 30 ejecutados, mezcla de datos OV/FW-HD, captions QT 50/50 VB/full, dropout WN) que solo resulta interpretable para quien haya seguido el trabajo original del autor.

El modelo base Wan2.1-T2V-1.3B es un transformer de difusion para generacion de video a partir de texto, con aproximadamente 1.300 millones de parametros, disenado para sintetizar clips de video de resolucion moderada. Este fine-tune concreto parte de ese checkpoint y aplica una arquitectura recurrente sobre los bloques del transformer, de modo que los bloques se reutilizan en bucle en lugar de ejecutarse una sola vez, lo que aumenta la profundidad efectiva sin incrementar el numero de parametros.

La relevancia de esta ficha es limitada pero real: documenta una de las muchas variantes de investigacion que aparecen alrededor de Wan2.1, y sirve como ejemplo de fine-tune con arquitectura recurrente sobre un modelo de difusion de video. No hay información publicada sobre licencia, idiomas ni resultados de benchmarks, y el repositorio tiene cero descargas y cero likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (text-to-video) con recurrencia de bloques (recurrent-transformer); A5 → B5×4 → C5, 15 bloques unicos / 30 ejecutados |
| Parametros totales | ~1.300 millones (heredados de Wan2.1-T2V-1.3B); el numero exacto de este fine-tune no esta disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el repo ocupa 57,8 GB con 18 checkpoints EMA/non-EMA) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria diffusers) |

## Arquitectura y entrenamiento

El modelo base Wan2.1-T2V-1.3B es un transformer de difusion para texto-a-video con alrededor de 1.300 millones de parametros. Sobre esa base, este fine-tune aplica una topologia recurrente descrita en la model card como "A5 → B5×4 → C5": cinco bloques de entrada (A), cinco bloques intermedios (B) ejecutados cuatro veces en bucle, y cinco bloques de salida (C). Esto da 15 bloques unicos pero 30 ejecuciones efectivas por paso, lo que incrementa la profundidad computacional sin anadir parametros nuevos.

El entrenamiento usa difusion con sigma muestreada de una uniforme U(0,1), shift=5 y t=1000·sigma. La perdida es "TM (all loop exits)", es decir, se aplica supervisión en todas las salidas del bucle recurrente, no solo en la final. Los datos combinan el dataset OV con captions QT en proporcion 50/50 entre VB y texto completo, y una mezcla 50/50 entre OV y FW-HD por item, con dropout WN. El snapshot contiene 18 pesos EMA y non-EMA, y el ultimo estado guardado es `step0003000/state.pt`, lo que indica que el entrenamiento se detuvo en el paso 3000. No se especifica el numero total de tokens de video ni la composicion detallada del dataset.

## Capacidades

- Generacion de video a partir de texto (text-to-video) mediante difusion, heredada del pipeline Wan2.1-T2V-1.3B.
- Arquitectura recurrente que reutiliza bloques para aumentar la profundidad efectiva con el mismo presupuesto de parametros.
- Compatible con la libreria `diffusers` y el pipeline de Wan2.1-T2V-1.3B.
- Soporte de tool calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Investigacion en arquitecturas recurrentes para difusion de video: el modelo permite estudiar si la reutilizacion de bloques (B5×4) mejora la coherencia temporal frente a un transformer plano de profundidad equivalente, comparando directamente con el checkpoint base Wan2.1-T2V-1.3B.
- Experimentos de ablacion sobre mezcla de datos: la configuracion OV/FW-HD 50/50 y captions QT 50/50 VB/full documentada en la model card permite reproducir y variar esas proporciones para medir su efecto en la calidad del video generado.
- Generacion de clips de demostracion en entornos de investigación: con 1.300 millones de parametros, es viable en una GPU de gama alta para producir videos cortos de prueba sin necesidad de infraestructura de gran escala.
- Estudio de perdidas en bucles recurrentes: la perdida "TM (all loop exits)" hace de este checkpoint un caso de prueba para analizar como afecta supervisar todas las salidas del bucle frente a solo la final.
- Base para nuevos fine-tunes: al estar en formato `diffusers` y safetensors, sirve como punto de partida para ajustes posteriores sobre el pipeline Wan2.1-T2V-1.3B.
- Comparacion de checkpoints EMA vs non-EMA: el snapshot incluye 18 pesos EMA y non-EMA, lo que permite evaluar la diferencia de calidad y estabilidad entre ambos en tareas de generacion de video.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia, un modelo de difusion de video de ~1.300 millones de parametros en precision fp16 requiere del orden de 3-4 GB solo para pesos, pero el pipeline completo de Wan2.1-T2V-1.3B (VAE, text encoder, scheduler y latentes de video) eleva el consumo muy por encima de eso; la cifra exacta para este fine-tune no esta publicada.
- GPU recomendadas: no disponible. Por tamano del modelo base, una GPU con 24 GB o mas (RTX 4090, A100 40/80 GB, H100) es el rango razonable para inferencia sin cuantizacion agresiva.
- Cabe en consumer GPU: probablemente en RTX 4090 (24 GB) y GPUs de 16 GB con cuantizacion, pero no hay datos publicados que lo confirmen para este checkpoint.
- Opciones de despliegue: `diffusers` (libreria declarada), pipeline de Wan2.1-T2V-1.3B. Soporte en vLLM, llama.cpp, Ollama o TGI: no disponible (son herramientas orientadas a LLMs, no a difusion de video).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|
| ducvh5/wan21-a5b5x4c5-tm-u5-qt-fw-hd-item-wanneg | ~1.300 M | no disponible | no disponible | HuggingFace, 0 descargas |
| Wan-AI/Wan2.1-T2V-1.3B-Diffusers (base) | ~1.300 M | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | HuggingFace, modelo base oficial |
| Alternativas de la misma categoria (p. ej. otros T2V de ~1-2 B) | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de otros modelos comparables en la informacion proporcionada; la unica comparacion posible es contra el checkpoint base del que deriva.

## Limitaciones y advertencias

- Modelo de investigacion sin validacion publica: cero descargas y cero likes, sin benchmarks ni evaluaciones independientes.
- Licencia no declarada: no se puede asumir uso comercial; hay que contactar con el autor o consultar la licencia del modelo base Wan2.1 antes de cualquier despliegue.
- Idiomas no declarados: no se puede garantizar la calidad de los prompts en castellano ni en otros idiomas distintos del usado en el entrenamiento.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede generar contenido fisicamente incoherente, artefactos temporales y texto ilegible en el video.
- Sesgos de los datos de entrenamiento: la mezcla OV/FW-HD y los captions QT pueden introducir sesgos de dominio y estilo no documentados.
- Checkpoint intermedio: el ultimo estado es `step0003000`, lo que sugiere que el entrenamiento no esta necesariamente finalizado ni convergido.
- Repositorio de 57,8 GB con 18 checkpoints: el almacenamiento y la gestion de versiones son costosos; conviene descargar solo los pesos necesarios.
- Nomenclatura opaca: siglas como OV, QT, VB, FW-HD, WN y TM no se explican en la model card, lo que dificulta la reproducibilidad sin el codigo del autor.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ducvh5/wan21-a5b5x4c5-tm-u5-qt-fw-hd-item-wanneg
- Modelo base: https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B-Diffusers
- Paper, blog, repositorio de codigo o demo del fine-tune: no disponible en la informacion proporcionada.
