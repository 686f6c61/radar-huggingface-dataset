# Bob99Bob/d3-nano-mlx-affine6

## Resumen

d3-nano-mlx-affine6 es una conversión al formato MLX del modelo d3-nano (Decision 3.0), desarrollado por el vLLM Semantic Router Team y publicado originalmente en el repositorio vllm-sr/d3-nano. La conversión la firma el usuario Bob99Bob y su propósito es permitir que el modelo se ejecute en Apple Silicon a través de veJ, un servidor de inferencia orientado a Mac. No se ha entrenado ni ajustado nada: los pesos son los del publicador original, únicamente reempaquetados en otro formato y cuantizados.

El modelo es un clasificador de texto (pipeline text-classification) de aproximadamente 1.880 millones de parámetros (1.882.347.328 según los safetensors), pensado para actuar como uno de los "pequeños lectores" que los distintos niveles de enrutamiento consultan antes del juez en el sistema de decisión semántica de veJ. Es decir, su función es tomar decisiones binarias o de opción múltiple sobre consultas de enrutamiento, no generar texto libre de forma general.

La relevancia de esta ficha radica en que documenta una conversión de cuantización, no un modelo nuevo: la información disponible sobre arquitectura interna, datos de entrenamiento y benchmarks del modelo base es escasa en la model card, y la mayor parte de las métricas publicadas miden la concordancia de la conversión con el modelo original, no la calidad intrínseca del modelo. La licencia es Apache-2.0 y el repositorio ocupa 1,5 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de d3-nano; detalles de capas y atención no disponibles) |
| Parametros totales | 1.882.347.328 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Affine 6-bit, group size 64 (187 módulos Linear y embeddings cuantizados); existen variantes de 4 y 5 bits del mismo proceso, no publicadas en este repo |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), con `mlx-conversion.json` que registra tamaño y sha256 de cada fichero |

## Arquitectura y entrenamiento

La model card describe el modelo como un transformer en el que se han cuantizado en affine 6-bit, con group size 64, el embedding de tokens y todos los módulos Linear de las capas del transformer (187 módulos en total), usando `quantize_model` de mlx-lm sobre MLX 0.32.2. El resto de tensores se mantiene sin cambios respecto al publicador, y el conversor verifica la lectura en float32. El `config.json` es el del publicador con la información de cuantización y un registro `d3_derivative` (formato y revisión de origen). Los ficheros del tokenizer y la plantilla de chat no se copian en este repositorio: se toman del publicador en la misma revisión (`9d9b937f5f117f78c030ea7ba677c0b3d328ec58`).

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si el modelo base pasó por RLHF, DPO u otras etapas de alineación. Tampoco se detalla la arquitectura interna (número de capas, dimensión oculta, mecanismo de atención). La única innovación técnica documentada es la propia conversión: cuantización affine 6-bit con group size 64 y verificación de integridad mediante hashes sha256 en carga. Según las mediciones del autor de la conversión, 6 bits conserva todas las reglas de enrutamiento para las que el modelo publicado está cualificado, mientras que 4 bits pierde la regla sí/no, 5 bits pierde la regla de dos opciones y 8 bits no mejora a 6.

## Capacidades

- Clasificación de texto orientada a enrutamiento semántico: el modelo actúa como lector previo al juez en el sistema Decision 2.0/3.0 de veJ.
- Decisiones de enrutamiento con reglas cualificadas, incluidas reglas de tipo sí/no y de dos opciones (según las mediciones del conversor, conservadas a 6 bits).
- Ejecución en Apple Silicon mediante MLX y el servidor veJ.
- Verificación de integridad de pesos en carga mediante `mlx-conversion.json`.
- No se documentan capacidades de generación de texto libre, código, matemáticas, visión, audio, tool calling ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles.
- No se documenta modo thinking ni capacidades de agente.

## Casos de uso

- Enrutamiento de consultas en un router semántico: el modelo se consulta antes del juez para decidir a qué nivel o ruta debe ir una petición, aprovechando su función específica como "pequeño lector" en la jerarquía de decisión de veJ.
- Despliegue local en Mac para prototipado de sistemas de decisión: al estar en formato MLX y ocupar 1,5 GB, permite probar el pipeline de enrutamiento en un portátil o equipo de sobremesa Apple sin GPU dedicada.
- Clasificación binaria o de opción múltiple en pipelines de preprocesado: útil para etiquetar consultas con reglas simples (sí/no, dos opciones) antes de pasarlas a un modelo mayor.
- Evaluación de conversiones cuantizadas: sirve como caso de estudio para medir la concordancia entre un modelo original y su versión cuantizada a 4, 5, 6 y 8 bits, con métricas publicadas de acuerdo entre 0,876 y 0,996.
- Integración en el servidor veJ: se arranca con `decision2_server.py --reader d3` y se puede comprobar la integridad de los ficheros contra el registro sha256, lo que facilita despliegues reproducibles.
- Reproducción de experimentos de cuantización con mlx-lm: el comando de conversión documentado (`mlx_d3.py --convert ... --bits 6`) permite regenerar la conversión y comparar resultados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card solo publica métricas de concordancia de la conversión con el modelo original:

| Metrica | 4 bits | 5 bits | 6 bits |
|---|---|---|---|
| Concordancia con las respuestas del modelo publicado (Decision 2.0 y 3.0) | 0,876 a 0,990 | 0,955 a 0,996 | 0,972 a 0,995 |
| Reglas de enrutamiento conservadas | Pierde la regla sí/no | Pierde la regla de dos opciones | Conserva todas |

El autor indica además que 8 bits no ofrece mejor resultado que 6 bits. Estas cifras provienen de las mediciones de veJ (método y resultados completos en `docs/BENCHMARKS.md` del repositorio de veJ) y no de una evaluación independiente del modelo base.

## Requisitos de hardware

- VRAM o memoria unificada estimada: el repositorio pesa 1,5 GB en 6 bits, por lo que la inferencia requiere del orden de 1,5 a 2 GB de memoria, más el overhead del runtime MLX.
- GPU recomendadas: no aplica GPU dedicada; el formato es MLX para Apple Silicon. Se ejecuta en chips de la familia M (M1, M2, M3, M4 y posteriores) con memoria unificada suficiente.
- Cabe en GPU de consumo: sí, en cualquier Mac con Apple Silicon y al menos unos 4 GB de memoria unificada disponibles; no está pensado para GPU NVIDIA.
- Opciones de despliegue: servidor veJ (`decision2_server.py`), con MLX 0.32.2 y mlx-lm para la conversión. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en esta conversión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría (clasificadores de enrutamiento de ~1.900 millones de parámetros) en la documentación proporcionada. La alternativa más directa es el propio modelo original vllm-sr/d3-nano, del que esta conversión deriva:

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Bob99Bob/d3-nano-mlx-affine6 | 1.882.347.328 | no disponible | safetensors MLX, 6-bit | Apache-2.0 | Hugging Face, 0 descargas |
| vllm-sr/d3-nano (original) | no disponible | no disponible | no disponible | Apache-2.0 | Hugging Face |

No se conocen otras alternativas comparables con datos verificables.

## Limitaciones y advertencias

- Es una conversión de cuantización, no un modelo entrenado: cualquier limitación del modelo base se hereda, y la cuantización a 6 bits introduce una pérdida de concordancia de hasta un 2,8 % respecto al original (0,972 frente a 1,0 en el peor caso medido).
- Las reglas de enrutamiento cualificadas se conservan a 6 bits, pero no se garantiza que otras tareas fuera de ese ámbito se comporten igual que el modelo original.
- No hay información sobre sesgos, idiomas soportados ni riesgo de alucinación; al ser un clasificador, el riesgo principal es una clasificación errónea silenciosa en el enrutamiento.
- La longitud de contexto no está documentada, lo que impide planificar su uso con entradas largas.
- El repositorio no incluye tokenizer ni plantilla de chat: es obligatorio descargarlos del modelo base en la revisión exacta indicada, lo que añade un paso de configuración y un punto de fallo.
- El repositorio tiene 0 descargas y 0 likes, y fue creado en noviembre de 2026; no hay evidencia de uso en producción ni de mantenimiento continuado.
- La licencia Apache-2.0 permite uso comercial, pero se debe conservar el aviso del publicador (`NOTICE`) y respetar la atribución del modelo base.
- El despliegue está atado a MLX y Apple Silicon; no hay soporte documentado para CUDA ni para servidores de inferencia estándar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Bob99Bob/d3-nano-mlx-affine6
- Modelo base: https://huggingface.co/vllm-sr/d3-nano
- Repositorio de veJ: https://github.com/ordinarybob/vej
- Benchmarks de veJ: https://github.com/ordinarybob/vej/blob/main/docs/BENCHMARKS.md
- Revisión del modelo base usada: `9d9b937f5f117f78c030ea7ba677c0b3d328ec58`
