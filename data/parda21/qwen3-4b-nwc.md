# Parda21/Qwen3-4B-NWC

## Resumen

Qwen3-4B-NWC es una conversión del checkpoint Qwen/Qwen3-4B publicada por el usuario Parda21, en la que todas las capas lineales y el embedding atado se almacenan en formato NWC (Neural Weight Compression), una representación comprimida sin pérdida de los pesos originales en BF16. No es un modelo nuevo ni un ajuste fino: los pesos son bit-exactos respecto al checkpoint de partida y no interviene ninguna cuantización con pérdida. El objetivo es doble: reducir el peso en disco de 8,04 GB a 5,55 GB (ratio 0,689) y acelerar la decodificación, porque la descompresión se realiza dentro del propio kernel CUDA de multiplicación matriz-vector.

El resultado declarado son 5,67 GB de VRAM en batch 1, 55 tokens/s en una RTX 4070 (frente a 45 del BF16) y 18,2 tokens/s en una NVIDIA A16 con vGPU 16Q (frente a 16,8), manteniendo salidas idénticas al original en decodificación greedy de 64 tokens. Su interés actual está en demostrar que la compresión sin pérdida integrada en el kernel puede mejorar a la vez la huella de memoria y la latencia sin degradar la calidad, algo poco frecuente en un ecosistema dominado por cuantizaciones con pérdida.

El precio a pagar es la dependencia de una librería propia (`nwc`) y de hardware NVIDIA con compute capability 8.0 o superior; no hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI. El modelo hereda del base una arquitectura transformer decoder-only densa de aproximadamente 4.000 millones de parámetros nominales, con licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only densa, heredada de Qwen/Qwen3-4B (sin MoE); el detalle de capas no se especifica en la model card |
| Parametros totales | 5.540.602.040 elementos de tensor segun los safetensors del repositorio (el modelo base se denomina "4B"; ver limitaciones) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la model card (la define el modelo base Qwen/Qwen3-4B) |
| Tipos de cuantizacion | no es cuantizacion: compresion sin perdida de BF16 (bit-exacta), con ratio 0,689 y etiqueta "8-bit" en el repositorio |
| Idiomas soportados | no disponibles (heredados del modelo base) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors con payload en formato NWC; requiere la libreria `nwc` para cargar |

## Arquitectura y entrenamiento

No hay entrenamiento: se trata de un proceso de conversión en tres pasos sobre el checkpoint original (`fuse`, `convert`, `save_pretrained`) ejecutado con el modelo Qwen/Qwen3-4B cargado en CPU con `dtype=torch.bfloat16`. La innovación técnica no está en el modelo, sino en el formato: los pesos comprimidos se decodifican directamente dentro del kernel CUDA de matvec, de modo que no se materializa una copia BF16 completa durante la generación token a token. Según el autor, el resultado es bit-exacto con el checkpoint original.

Existen dos rutas de ejecución diferenciadas. En batch 1 la generación pasa por el kernel fusionado, que es donde se obtiene la ventaja de memoria y velocidad. En prefill con batch mayor que 1, los pesos se descomprimen a un búfer BF16 temporal y se delega en cuBLAS, por lo que en ese escenario se pierde parte de la ventaja de huella de memoria. La model card no detalla la composición del dataset ni procesos de RLHF o DPO, ya que no se ha reentrenado el modelo base.

## Capacidades

- Generación de texto y conversación: el repositorio declara el pipeline `text-generation` y el ejemplo de uso es una respuesta a una pregunta en formato prompt-respuesta.
- Capacidades del modelo base: al ser bit-exacto, conserva las de Qwen/Qwen3-4B (razonamiento, código, matemáticas y multilingüismo), aunque la model card de esta conversión no las documenta ni las evalúa.
- Soporte de tool calling y function calling: no documentado en esta ficha (heredable del modelo base, sin verificación por parte del autor).
- Soporte de agentes y razonamiento multi-paso: no documentado en esta ficha.
- Modo "thinking": no documentado en esta ficha.
- Capacidad especial del artefacto: decodificación sin pérdida con pesos comprimidos, con salidas idénticas al BF16 original en greedy (64 tokens) según las mediciones del autor.
- Ejecución con CUDA graphs: el ejemplo de línea de comandos incluye la opción `--graph`.

## Casos de uso

- Despliegue de un asistente conversacional en GPUs de gama media: con 5,67 GB de VRAM en batch 1 cabe en tarjetas de 8-12 GB con compute capability 8.0 o superior, lo que permite servir un modelo de 4B donde el BF16 original de 8,10 GB no entra con holgura.
- Inferencia interactiva de baja latencia en estaciones de trabajo con una sola RTX 4070: los 55 tokens/s declarados en greedy con CUDA graph son suficientes para chat en tiempo real y autocompletado.
- Virtualización con vGPU en entornos empresariales: el caso medido en una NVIDIA A16 con perfil vGPU 16Q (18,2 tokens/s) apunta a despliegues multiinquilino donde el ahorro de VRAM por instancia es más relevante que el throughput absoluto.
- Pruebas de regresión y evaluación reproducible: al ser bit-exacto, permite sustituir el checkpoint BF16 en un pipeline de evaluación sin alterar las salidas esperadas, ahorrando disco y memoria.
- Distribución de modelos en entornos con almacenamiento o ancho de banda limitado: los 5,55 GB de pesos frente a 8,04 GB reducen el tamaño de artefacto y el tiempo de descarga en registries internos.
- Docencia y prototipado en laboratorios con GPU Ampere o Ada: cargar directamente en GPU sin necesitar el BF16 original simplifica la puesta en marcha en máquinas con VRAM justa.
- Base para pipelines de generación por lotes con batch 1 (por ejemplo, procesado de colas de peticiones independientes), donde el kernel fusionado aporta su máxima ventaja.
- Investigación sobre compresión de pesos: sirve como referencia práctica para comparar compresión sin pérdida en el kernel frente a cuantizaciones de 4 y 8 bits.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card únicamente incluye mediciones de eficiencia comparadas con el checkpoint BF16 original:

| Metrica | Qwen3-4B (BF16) | Qwen3-4B-NWC |
|---|---|---|
| Peso de los pesos | 8,04 GB | 5,55 GB (ratio 0,689) |
| VRAM en uso, batch 1 | 8,10 GB | 5,67 GB |
| tokens/s, RTX 4070, CUDA graph, greedy | 45 | 55 |
| tokens/s, NVIDIA A16 (vGPU 16Q) | 16,8 | 18,2 |
| Tokens de salida frente al original (greedy, 64) | referencia | identicos |

## Requisitos de hardware

- VRAM estimada para inferencia: 5,67 GB en batch 1 según la medición del autor (5,55 GB de pesos).
- GPU documentadas en las pruebas: NVIDIA RTX 4070 (consumer, Ada) y NVIDIA A16 con perfil vGPU 16Q (datacenter).
- Requisito imprescindible: GPU NVIDIA con compute capability 8.0 o superior (Ampere, Ada, Hopper; Blackwell mediante PTX JIT). Quedan fuera Turing, Pascal y anteriores, incluidas GTX 10 y GTX 16.
- Encaje en GPU de consumo: por VRAM (5,67 GB) cabría en tarjetas de 8 GB o más con CC >= 8.0, como RTX 3060 12 GB, RTX 3070, RTX 4060 Ti, RTX 4070, RTX 4080 o RTX 4090; la única verificada explícitamente por el autor es la RTX 4070. Estimación basada en la VRAM declarada, no en pruebas publicadas para cada modelo de tarjeta.
- Software necesario: driver CUDA para CUDA 12.6 o superior y PyTorch con soporte CUDA. Instalación mediante `pip install neural-weight-compression transformers accelerate`.
- Opciones de despliegue: carga y generación a través de la librería `nwc` (`load_pretrained`, `python -m nwc.demo ... --load --graph`). No se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni para el cargador estándar de transformers.
- Memoria adicional en prefill: con batch mayor que 1 los pesos se descomprimen a un búfer BF16 temporal y se usa cuBLAS, por lo que la VRAM necesaria aumenta en una cantidad no cuantificada en la model card.
- Latencia y throughput conocidos: 55 tokens/s en RTX 4070 y 18,2 tokens/s en A16 vGPU 16Q, en ambos casos con decodificación greedy y, en el caso de la RTX 4070, con CUDA graph.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Peso en disco | VRAM batch 1 | tokens/s (RTX 4070) | Licencia | Despliegue |
|---|---|---|---|---|---|---|---|
| Qwen3-4B-NWC | 4B nominales (5.540.602.040 elementos de tensor) | no disponible | 5,55 GB | 5,67 GB | 55 | Apache-2.0 | safetensors + NWC, libreria `nwc`, CUDA CC >= 8.0 |
| Qwen/Qwen3-4B (BF16) | 4B | no disponible en esta ficha | 8,04 GB | 8,10 GB | 45 | Apache-2.0 | safetensors, transformers |
| Variantes cuantizadas a 4 bits de Qwen3-4B (AWQ, GPTQ, GGUF) | no disponible | no disponible | no disponible | no disponible | no disponible | habitualmente Apache-2.0 (segun variante) | llama.cpp, vLLM u otros segun el formato |

No se dispone de datos de benchmarks ni de latencia de las variantes cuantizadas en la información proporcionada, por lo que la comparación de rendimiento con ellas no puede cuantificarse. La ventaja diferencial de Qwen3-4B-NWC frente a esas alternativas es que la compresión es sin pérdida y bit-exacta; su desventaja es la dependencia de hardware Ampere o superior y de una librería específica.

## Limitaciones y advertencias

- No es un modelo nuevo: hereda íntegramente los sesgos, el riesgo de alucinación y los límites idiomáticos de Qwen/Qwen3-4B, que no se han evaluado en esta publicación.
- La ganancia es exclusivamente de eficiencia: en greedy y 64 tokens las salidas son idénticas al original, por lo que no cabe esperar mejoras de calidad.
- Dependencia estricta de hardware: se exige compute capability 8.0 o superior; las GPU anteriores a Ampere no funcionan.
- Dependencia estricta de software: requiere la librería `nwc` y no se documenta integración con vLLM, llama.cpp, Ollama, TGI ni con el cargador estándar de transformers, lo que limita su uso en stacks de producción habituales.
- Degradación en prefill: con batch mayor que 1 se descomprime a un búfer BF16 temporal y se usa cuBLAS, de modo que la ventaja de memoria se reduce y aparece un consumo extra de VRAM no cuantificado.
- Discrepancia en el recuento de parámetros: los safetensors declaran 5.540.602.040 elementos frente a los ~4B nominales del modelo base, diferencia que la model card no explica (podría deberse a cómo el formato materializa tensores como el embedding). Conviene verificarlo antes de asumir equivalencias de tamaño.
- Idiomas y longitud de contexto no declarados: hay que remitirse a la ficha de Qwen/Qwen3-4B para conocerlos.
- Licencia: los pesos son Apache-2.0, igual que el modelo base; no se especifica en la información proporcionada la licencia del paquete `nwc`.
- Madurez: el repositorio registra 0 descargas y 1 like en el momento de la consulta, sin validación independiente de terceros de las mediciones declaradas.
- Los metadatos del repositorio indican fecha de creación 2026-09-19, una anomalía que conviene contrastar con el autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Parda21/Qwen3-4B-NWC
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Repositorio de la librería y del formato NWC: https://github.com/parda21/NWC
- Documentación del formato: `docs/format.md` dentro de https://github.com/parda21/NWC
- Mediciones y resultados: `docs/results.md` dentro de https://github.com/parda21/NWC
- Paquete de instalación: `pip install neural-weight-compression`
- Nota sobre la búsqueda web: no se han encontrado papers, blogs ni demos adicionales; los resultados de búsqueda disponibles no eran relevantes para este modelo.
