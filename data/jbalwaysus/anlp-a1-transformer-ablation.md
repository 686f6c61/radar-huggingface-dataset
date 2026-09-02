# JBalwaySUS/anlp-a1-transformer-ablation

## Resumen

Este repositorio contiene los resultados de un estudio de ablación controlada sobre arquitecturas Transformer encoder-decoder, desarrollado como parte de una asignación académica de Procesamiento de Lenguaje Natural (ANLP). El autor, JBalwaySUS, construyó cinco configuraciones (C1–C5) desde cero usando únicamente operaciones básicas de PyTorch, sin recurrir a `nn.Transformer` ni `nn.MultiheadAttention`, para evaluar el impacto de cada componente arquitectónico en una tarea de descifrado de secuencias binarias cifradas.

El modelo base (C1) es un Transformer seq2seq con atención de producto punto estándar, normalización de capa (LayerNorm) y atención de múltiples cabezas (MHA). Las variantes C2–C5 modifican exactamente un componente cada una: C2 sustituye las posiciones absolutas por rotación posicional (RoPE), C3 reemplaza MHA por atención con consultas agrupadas (GQA) con una sola cabeza de clave/valor, C4 cambia LayerNorm por RMSNorm, y C5 elimina por completo la tokenización adoptando un enfoque Byte Latent Transformer (BLT) que opera directamente sobre bytes. Los resultados muestran que la variante BLT (C5) supera ampliamente al resto, alcanzando un 99,60 % de precisión por bit y un 65,88 % de precisión por secuencia.

La relevancia de este trabajo reside en su valor pedagógico y de investigación: proporciona una comparativa limpia y reproducible del efecto de cada componente arquitectónico bajo condiciones idénticas de entrenamiento, algo poco frecuente en la literatura. El repositorio incluye los cinco checkpoints, métricas detalladas, predicciones y curvas de entrenamiento, lo que permite reproducir el estudio o reutilizar los modelos para experimentos adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (seq2seq) con variantes: MHA (C1), RoPE (C2), GQA (C3), RMSNorm (C4), BLT token-free (C5) |
| Parametros totales | no disponible (modelo pequeño, d_model=64, d_ff=512, 4 cabezas, 4+4 capas) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | 256 caracteres (chunking fijo) |
| Tipos de cuantizacion | no disponible (checkpoints en precisión completa) |
| Idiomas soportados | no disponible (tarea sobre secuencias binarias cifradas, no lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | PyTorch checkpoint (.pt) con diccionario `architecture` autodescriptivo |

## Arquitectura y entrenamiento

El modelo base C1 es un Transformer encoder-decoder estándar con atención de producto punto, normalización de capa (LayerNorm), 4 cabezas de atención, dimensión de modelo 64, dimensión de feed-forward 512 y 4 capas tanto en el encoder como en el decoder. Todas las configuraciones comparten los mismos hiperparámetros: dropout 0,15, optimizador AdamW con tasa de aprendizaje 1e-3 y decaimiento coseno, tamaño de lote 64, semilla 42, entrenamiento con precisión mixta (AMP) y early stopping con paciencia 10 y delta mínimo 1e-3. Los datos se dividen a nivel de documento antes de segmentarlos en fragmentos de 256 caracteres.

Las variantes C2–C5 aíslan el efecto de un único cambio respecto a C1. C2 incorpora rotación posicional (RoPE) en lugar de embeddings posicionales aprendidos. C3 utiliza atención con consultas agrupadas (GQA) con una sola cabeza de clave/valor, reduciendo el número de cabezas KV de 4 a 1. C4 sustituye LayerNorm por RMSNorm. C5 es la variante más radical: elimina por completo la tokenización BPE y opera directamente sobre un alfabeto fijo de 256 bytes más los tokens especiales PAD, BOS y EOS, empleando una arquitectura Byte Latent Transformer que requiere además estimar las probabilidades de transición entre bytes a partir del conjunto de entrenamiento. Las configuraciones C1–C4 comparten los dos tokenizadores BPE almacenados en la raíz del repositorio.

## Capacidades

- Descifrado de secuencias binarias cifradas: el modelo aprende a mapear secuencias cifradas a su texto plano correspondiente, actuando como un descifrador de sustitución.
- Comparativa de componentes arquitectónicos: permite evaluar de forma aislada el impacto de RoPE, GQA, RMSNorm y la eliminación de tokenización en el rendimiento final.
- Operación sin tokenización (C5): la variante BLT procesa directamente bytes, lo que elimina la dependencia de vocabularios y tokenizadores.
- Reproducibilidad: los checkpoints incluyen un diccionario `architecture` autodescriptivo que elimina la necesidad de configuración externa.
- Generación de métricas detalladas: cada configuración incluye pérdida en test, precisión por bit, precisión por secuencia, distancia de Levenshtein y BLEU (excepto C5, que no tiene representación tokenizada).

## Casos de uso

- Estudio académico de arquitecturas Transformer: el repositorio es un recurso excelente para cursos de PLN o aprendizaje profundo que quieran mostrar experimentalmente el efecto de cada componente arquitectónico con datos cuantitativos.
- Investigación sobre atención eficiente: la comparativa C1 vs C3 (GQA) permite analizar el trade-off entre rendimiento y memoria cuando se reduce el número de cabezas KV.
- Evaluación de normalización: la comparativa C1 vs C4 (RMSNorm) muestra el impacto de cambiar el método de normalización en la estabilidad del entrenamiento y la convergencia.
- Experimentos con modelos token-free: la variante C5 (BLT) sirve como punto de partida para investigar arquitecturas que operan directamente sobre bytes, un área activa de investigación.
- Benchmark de decodificación de cifrados simples: el modelo puede utilizarse como referencia para evaluar la dificultad de tareas de descifrado de sustitución en secuencias binarias.
- Práctica de ingeniería de modelos: el código fuente, construido sin `nn.Transformer`, es útil para quienes quieran implementar Transformers desde cero y verificar el correcto funcionamiento de cada componente.

## Benchmarks y rendimiento

La siguiente tabla resume los resultados reportados en la model card para las cinco configuraciones:

| Config | Cambio | Test loss | Bit acc. (%) | Seq. acc. (%) | Levenshtein | BLEU | Pico GPU (MB) |
|---|---|---|---|---|---|---|---|
| C1 | base | 0,8883 | 71,99 | 1,40 | 46,16 | 0,3149 | 1338 |
| C2 | RoPE | 0,0892 | 90,02 | 28,68 | 3,62 | 0,9009 | 1346 |
| C3 | GQA (1 KV head) | 0,9995 | 71,54 | 1,05 | 51,89 | 0,2737 | 1337 |
| C4 | RMSNorm | 1,0933 | 71,17 | 1,19 | 57,48 | 0,2504 | 1276 |
| C5 | BLT (token-free) | 0,0098 | 99,60 | 65,88 | 0,77 | n/a | 1436 |

Los resultados muestran que la sustitución de embeddings posicionales por RoPE (C2) mejora drásticamente la precisión por bit (de 71,99 % a 90,02 %) y la precisión por secuencia (de 1,40 % a 28,68 %). La variante BLT (C5) es claramente superior al resto, con una pérdida de 0,0098 y una precisión por secuencia del 65,88 %. GQA (C3) y RMSNorm (C4) no solo no mejoran el rendimiento base, sino que lo empeoran ligeramente en la mayoría de métricas. Las métricas BLEU y ROUGE se omiten para C5 por carecer de representación tokenizada sobre la que calcularlas.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja. El pico de memoria GPU durante el entrenamiento fue de 1276–1436 MB según la configuración, por lo que la inferencia cabe en cualquier GPU moderna con más de 2 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer (NVIDIA GTX 1060 o superior) es suficiente. No se requieren GPUs de datacenter.
- Compatibilidad con hardware consumer: sí, sin ninguna restricción. El modelo es extremadamente ligero.
- Opciones de despliegue: al ser un checkpoint de PyTorch, puede cargarse directamente en cualquier entorno con PyTorch. No se proporcionan conversiones a GGUF, ONNX ni otros formatos.
- Latencia y throughput: no disponibles, pero dado el tamaño del modelo (d_model=64, 4 capas), la inferencia es prácticamente instantánea en CPU.

## Comparativa con modelos similares

No se dispone de modelos comerciales o de referencia directamente comparables, ya que este trabajo es un estudio de ablación académico sobre una tarea específica de descifrado. La comparativa más relevante es interna, entre las cinco configuraciones C1–C5, que comparten exactamente los mismos hiperparámetros y solo difieren en un componente arquitectónico. Esta comparativa se presenta en la sección de benchmarks. Otros repositorios similares en Hugging Face (como `yharith/anlp-a1-transformer-ablation` o `Viv0605101/anlp-a1-transformer-blt-ablation`) parecen ser variantes del mismo trabajo de asignación, pero no se dispone de sus resultados para comparar.

## Limitaciones y advertencias

- Modelo académico de pequeña escala: no está diseñado para uso en producción. Su propósito es ilustrar conceptos arquitectónicos, no resolver tareas del mundo real.
- Rendimiento limitado en secuencias completas: incluso la mejor configuración (C5) solo alcanza un 65,88 % de precisión por secuencia, lo que indica que el modelo falla en una proporción significativa de ejemplos.
- Tarea restringida: el modelo solo sabe descifrar el tipo específico de cifrado de sustitución sobre el que fue entrenado. No generaliza a otros dominios ni a lenguaje natural.
- Sin soporte para tool calling, agentes ni razonamiento multi-paso: no es un modelo de propósito general.
- Idiomas no soportados: la tarea no involucra lenguaje natural, por lo que no hay capacidades multilingües.
- Sin cuantizaciones disponibles: los checkpoints están en precisión completa (fp32), lo que limita su uso en entornos con restricciones de memoria extremas.
- C5 requiere datos adicionales: la variante BLT necesita las probabilidades de transición entre bytes estimadas del conjunto de entrenamiento, que no se incluyen en el checkpoint.
- Licencia MIT: permite uso comercial y modificación, pero el modelo se ofrece sin garantías y con fines claramente educativos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/JBalwaySUS/anlp-a1-transformer-ablation
- Repositorio GitHub relacionado (código de entrenamiento): https://github.com/FrenchKnuckles/ANLP_A1
- Repositorio Hugging Face con trabajo similar: https://huggingface.co/yharith/anlp-a1-transformer-ablation
- Repositorio Hugging Face con variante BLT: https://huggingface.co/Viv0605101/anlp-a1-transformer-blt-ablation
