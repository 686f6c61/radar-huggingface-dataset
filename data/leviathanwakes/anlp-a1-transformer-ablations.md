# leviathanWakes/anlp-a1-transformer-ablations

## Resumen

Este repositorio contiene los pesos entrenados de un modelo Transformer encoder-decoder construido desde cero para una tarea de traducción secuencia a secuencia, como parte de la asignación ANLP (Advanced Natural Language Processing) del autor Rachit Mehta. El modelo no es un LLM de propósito general, sino un conjunto de checkpoints que implementan cuatro variantes arquitectónicas de un Transformer básico: una línea base con atención multi-cabeza (MHA), posición sinusoidal y LayerNorm; una variante con codificación posicional rotatoria (RoPE); una con atención de consulta agrupada (GQA); y una con normalización RMSNorm. Cada variante modifica exactamente un componente respecto a la línea base, lo que permite estudiar el impacto aislado de cada técnica.

La relevancia de este modelo es principalmente académica y didáctica: sirve como referencia para comparar el efecto de RoPE, GQA y RMSNorm en una tarea de traducción de secuencias cifradas. El repositorio incluye también los tokenizers BPE compartidos utilizados para codificar los datos. No se proporcionan métricas de rendimiento, número de parámetros ni detalles del conjunto de entrenamiento en la model card, por lo que su utilidad práctica fuera del ámbito educativo es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (variantes: baseline, RoPE, GQA, RMSNorm) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en formato PyTorch .pt) |
| Idiomas soportados | ingles (codificacion de secuencias binarias) |
| Licencia | MIT |
| Formato de pesos | PyTorch .pt (checkpoints), tokenizers en JSON |

## Arquitectura y entrenamiento

El modelo es un Transformer encoder-decoder implementado desde cero con operaciones básicas de PyTorch, sin usar `nn.Transformer` ni `nn.MultiheadAttention`. La línea base (C1) emplea codificación posicional sinusoidal, atención multi-cabeza estándar y LayerNorm. Las variantes C2, C3 y C4 sustituyen respectivamente la codificación posicional por RoPE, la atención multi-cabeza por GQA, y la LayerNorm por RMSNorm. Cada variante cambia exactamente un componente respecto a la línea base, lo que permite un análisis controlado de ablación.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO. La tarea consiste en mapear secuencias binarias cifradas a texto plano, según se deduce de repositorios similares de la misma asignación. Los tokenizers BPE compartidos se incluyen en el directorio raíz.

## Capacidades

- Generacion de texto secuencia a secuencia: el modelo traduce secuencias de entrada (aparentemente binarias cifradas) a secuencias de salida en texto plano.
- Soporte de cuatro variantes arquitectonicas: permite comparar el efecto de RoPE, GQA y RMSNorm sobre la linea base.
- No incluye soporte de tool calling, agentes, razonamiento multi-paso, vision ni audio.
- Capacidad multilingue: no aplica, solo trabaja con el vocabulario BPE definido para la tarea.

## Casos de uso

- Investigacion academica en arquitecturas de transformers: el modelo permite reproducir y analizar el impacto de RoPE, GQA y RMSNorm en una tarea de traduccion controlada, util para cursos de procesamiento del lenguaje natural.
- Comparacion de tecnicas de atencion y normalizacion: los checkpoints C1-C4 pueden cargarse y evaluarse en el mismo conjunto de validacion para medir diferencias en velocidad de convergencia, uso de memoria y precision.
- Estudio de codificacion posicional: la variante C2 (RoPE) puede usarse para verificar si la rotacion posicional mejora la generalizacion a secuencias mas largas que las vistas en entrenamiento.
- Experimentos de eficiencia: la variante C3 (GQA) permite medir la reduccion de memoria y computacion frente a la atencion multi-cabeza completa, especialmente en decodificacion.
- Practica de implementacion de transformers desde cero: el codigo fuente (no incluido en el repo, pero referenciado en repositorios similares) sirve como material didactico para construir y entrenar arquitecturas personalizadas.
- Reproduccion de resultados de ablacion: los pesos publicados permiten verificar los resultados reportados en la asignacion y servir de punto de partida para nuevas variantes (por ejemplo, combinando RoPE y GQA).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de validacion, ni comparaciones con otros modelos. Los repositorios similares encontrados en la busqueda web tampoco proporcionan datos cuantitativos publicos.

## Requisitos de hardware

- El tamano del repositorio es de 1.1 GB, que incluye cuatro checkpoints y dos tokenizers. Cada checkpoint probablemente ocupa entre 200 y 300 MB, lo que sugiere un modelo de decenas de millones de parametros (estimacion orientativa, no confirmada).
- Inferencia en CPU: viable para un modelo de este tamano, con latencia de milisegundos a segundos segun la longitud de la secuencia.
- Inferencia en GPU: cualquier GPU con al menos 2-4 GB de VRAM es suficiente (por ejemplo, NVIDIA GTX 1650, RTX 3060, etc.).
- No se requieren GPUs de alta gama como A100 o H100.
- Opciones de despliegue: al ser pesos en formato PyTorch, pueden cargarse directamente con `torch.load` y ejecutarse en un entorno Python. No se proporcionan integraciones con vLLM, llama.cpp, Ollama o TGI, y probablemente no sean necesarias dado el tamano.
- No se dispone de datos de throughput ni latencia medidos.

## Comparativa con modelos similares

No se dispone de informacion suficiente para una comparativa cuantitativa. Existen repositorios equivalentes de otros estudiantes de la misma asignacion (por ejemplo, `JBalwaySUS/anlp-a1-transformer-ablation`, `Viv0605101/anlp-a1-transformer-blt-ablation` y el repositorio GitHub `FrenchKnuckles/ANLP_A1`), que implementan variantes similares (C1-C5) sobre la misma tarea de descifrado. Sin embargo, no se publican metricas comparables, por lo que no es posible establecer una tabla de rendimiento.

## Limitaciones y advertencias

- Modelo de investigacion academica: no esta disenado para uso en produccion ni para tareas generales de generacion de texto.
- Sin datos de entrenamiento publicos: se desconoce el volumen, la procedencia y la calidad de los datos, lo que impide evaluar sesgos o riesgos de alucinacion.
- Vocabulario restringido: los tokenizers BPE estan limitados a la tarea especifica de traduccion de secuencias binarias; no es util para otros dominios.
- Sin garantias de rendimiento: no se han publicado metricas de validacion, por lo que no se puede afirmar que el modelo funcione correctamente en ningun escenario.
- Licencia MIT: permite uso comercial y modificacion, pero al ser un trabajo de asignacion, puede contener errores o limitaciones propias de un proyecto educativo.
- Formato de pesos propietario de PyTorch: los checkpoints `.pt` requieren una version especifica de PyTorch y no son directamente compatibles con otros frameworks sin conversion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/leviathanWakes/anlp-a1-transformer-ablations
- Repositorio similar (JBalwaySUS): https://huggingface.co/JBalwaySUS/anlp-a1-transformer-ablation
- Repositorio similar (Viv0605101): https://huggingface.co/Viv0605101/anlp-a1-transformer-blt-ablation
- Repositorio GitHub relacionado: https://github.com/FrenchKnuckles/ANLP_A1
