# Dachuan99/ES-SSM

## Resumen

ES-SSM (Elastic Spectral State Space Models for Train-Once Budgeted Inference) es un modelo de espacio de estados (SSM) espectral desarrollado por Dachuan Song, Junyu Yin, Zechen Hu y Xuan Wang, presentado como póster en el NeurIPS 2026 (Main Track). Su aportación principal no es un modelo de lenguaje de propósito general, sino una metodología de entrenamiento "elástico": se entrena un único SSM espectral y, a partir de él, se exportan modelos compactos independientes para distintos presupuestos de cómputo, sin reentrenamiento, búsqueda de canales ni reordenación.

La clave técnica es que la base espectral de Hankel fija del modelo proporciona un eje de canales naturalmente ordenado: conservar los primeros `K` canales ajusta la resolución de aproximación del operador de secuencia, de modo que el número de canales espectrales controla directamente la capacidad del modelo. Durante el entrenamiento se usan proyecciones de canal aprendidas, puertas adaptativas por canal y "budget dropout", de modo que los canales iniciales son predictivos a presupuestos pequeños y los posteriores aportan refinamiento.

El repositorio de HuggingFace es un espejo del código fuente (investigación, con licencia Apache 2.0) y no incluye checkpoints entrenados. La evaluación cubre modelado de lenguaje a nivel de byte (SlimPajama, familia de 1.3B parámetros entrenada sobre 30B byte-tokens), Long Range Arena, Speech Commands V2 y aprendizaje por refuerzo offline (D4RL).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SSM espectral con base de Hankel fija, bloques residuales con subcapa espectral |
| Parametros totales | 1.3B (familia evaluada en el paper); no disponible para checkpoints concretos |
| Parametros activos | Depende del presupuesto espectral K (truncamiento de prefijo de canales); valores concretos no disponibles |
| Longitud de contexto | Evaluado con secuencias de 2048 tokens (bytes); no disponible como limite maximo |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles (modelado a nivel de byte sobre SlimPajama) |
| Licencia | Apache 2.0 |
| Formato de pesos | Checkpoints PyTorch (.pt) generados al entrenar; el repositorio no incluye pesos |

## Arquitectura y entrenamiento

ES-SSM se basa en modelos de espacio de estados con filtrado espectral: la operación de secuencia se aproxima mediante una base espectral de Hankel fija, cuyos canales están ordenados por importancia espectral. Cada bloque residual contiene una subcapa espectral donde el número de canales retenidos `K` determina la resolución del operador. El entrenamiento elástico combina tres mecanismos: proyecciones de canal aprendidas, puertas (gates) adaptativas por canal que dependen de la entrada, y budget dropout que optimiza directamente los prefijos de canales que se usarán en inferencia. En despliegue, la truncación de prefijo elimina los canales por encima de `K` y sus parámetros asociados, produciendo un modelo compacto desplegable de forma independiente.

Los experimentos de modelado de lenguaje usan la familia de 1.3B parámetros entrenada sobre 30B byte-tokens de SlimPajama, con evaluación a nivel de bits per byte (BPB) frente a referencias no elásticas entrenadas por separado a cada capacidad. En RL offline se entrena una vez por dataset y semilla para obtener cinco presupuestos compactos (K = 2, 4, 8, 16, 32) en D4RL MuJoCo. El trabajo posterior (ESSH) extiende la idea a híbridos con mezcladores espectrales selectivos, decaimiento y puertas de escritura/lectura dependientes de la entrada, atención deslizante por ventana y entrenamiento conjunto del número de canales espectrales y el ancho FFN.

## Capacidades

- Modelado de lenguaje a nivel de byte (no requiere tokenizador), evaluado sobre SlimPajama.
- Exportación de múltiples modelos compactos a partir de un único entrenamiento, mediante truncación de prefijo espectral.
- Tareas de secuencia larga: evaluado en Long Range Arena.
- Clasificación de audio: evaluado en Speech Commands V2.
- Aprendizaje por refuerzo offline: evaluado en nueve datasets de D4RL MuJoCo.
- No es un modelo conversacional: no hay soporte de chat, tool calling, agentes ni capacidades multimodales documentadas.

## Casos de uso

- Investigación en arquitecturas de SSM: el código permite reproducir los experimentos del paper (NeurIPS 2026) y sirve como implementación de referencia de SSMs espectrales elásticos.
- Despliegue con presupuesto de cómputo variable: se entrena una vez y se exportan versiones compactas para distintos dispositivos (por ejemplo, un modelo grande para servidor y otro reducido para edge) sin reentrenar.
- Modelado de lenguaje a nivel de byte: útil para dominios sin tokenizador estable (código, datos genómicos o texto ruidoso), ya que opera directamente sobre bytes.
- Benchmarking de eficiencia en inferencia: la figura 3 del paper relaciona BPB con throughput (secuencia 2048, batch 1, GPU B200), útil como referencia comparativa.
- RL offline en robótica simulada: el pipeline D4RL permite entrenar y evaluar políticas compactas en entornos MuJoCo con hardware modesto (RTX 3090).
- Base para investigación en híbridos: el sucesor ESSH combina mezcladores espectrales con atención deslizante, punto de partida para diseñar modelos híbridos eficientes en decodificación recurrente.

## Benchmarks y rendimiento

Los datos publicados en la model card son cualitativos y de contexto específico; no se incluyen tablas numéricas de benchmarks estándar (MMLU, HumanEval, GSM8K). Datos disponibles:

| Evaluacion | Detalle | Resultado |
|---|---|---|
| SlimPajama (1.3B, 30B byte-tokens) | BPB frente a presupuesto espectral y throughput (seq 2048, batch 1, B200) | Curvas en figura 3 del paper; valores numericos no disponibles en la model card |
| D4RL MuJoCo | Retornos normalizados y tiempo de entrenamiento, 9 datasets, 3 semillas, RTX 3090 | Figura 4 del paper; valores numericos no disponibles en la model card |
| ESSH (follow-up, 1.53B, B300) | Decodificacion recurrente fusionada | 1,37 ms/token a batch 1 tras contexto 2K; 3,03x mas rapido que Transformer++ y 2,14-2,80x mas rapido que Mamba-2/Mamba-3 en benchmark parametro-a-parametro con CUDA graphs (Appendix R, Table 59) |
| Long Range Arena / Speech Commands V2 | Evaluadas en el paper | Resultados no disponibles en la model card |

No se han publicado resultados de benchmarks tipo MMLU, HumanEval o GSM8K en la informacion disponible.

## Requisitos de hardware

- Software: Python 3.10+ y PyTorch 2.4+; el experimento completo de modelado de lenguaje usa CUDA.
- Entrenamiento del experimento de lenguaje (familia 1.3B): no se especifica la GPU usada para entrenamiento; la evaluación de throughput se realizó en una NVIDIA B200.
- RL offline (D4RL): los experimentos se ejecutaron en RTX 3090, lo que indica que las tareas RL son abordables con GPUs de consumo.
- VRAM para inferencia: no disponible (no se publican checkpoints ni medidas de memoria).
- Despliegue: no hay integración documentada con vLLM, llama.cpp, Ollama o TGI; el uso es mediante los scripts propios (`essm_LM.py`, `d4rl_mujoco_RL.py`) y `torchrun`.
- Latencia y throughput: para el sucesor ESSH (1.53B, B300), 1,37 ms/token en decodificación recurrente fusionada a batch 1 tras contexto 2K; para ES-SSM base, no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Punto fuerte | Licencia |
|---|---|---|---|---|
| ES-SSM | SSM espectral elastico | 1.3B (familia del paper) | Un entrenamiento exporta multiples presupuestos; modelado a nivel de byte | Apache 2.0 |
| Mamba-2 / Mamba-3 | SSM selectivo | Varias tallas | Decodificacion recurrente eficiente; usado como referencia en ESSH (2,14-2,80x mas lento que ESSH en el benchmark del paper) | Apache 2.0 (Mamba-2) |
| Transformer++ | Transformer decoder | Parametro-matched en benchmark | Referencia estandar; 3,03x mas lento que ESSH en decodificacion segun el paper | no disponible |

Nota: la comparativa de velocidad proviene del benchmark del paper ESSH (parametro-matched, CUDA graphs, B300) y no de evaluaciones independientes.

## Limitaciones y advertencias

- El repositorio no incluye checkpoints entrenados: hay que entrenar desde cero para obtener pesos, lo que requiere descargar SlimPajama y cómputo CUDA significativo para la familia de 1.3B.
- No es un modelo de lenguaje conversacional ni instruido: no sirve como asistente o chatbot sin trabajo adicional.
- Idioma: los experimentos de lenguaje son en inglés (SlimPajama); no hay soporte multilingüe documentado.
- Contexto: la evaluación documentada usa secuencias de 2048 bytes; el comportamiento a contextos mayores no está documentado en la model card.
- Sin cuantización ni formatos de despliegue estándar (GGUF, safetensors): la integración en stacks de producción habituales requiere desarrollo propio.
- Riesgo de alucinación y sesgos: no evaluados; al ser un modelo de investigación a nivel de byte entrenado sobre 30B tokens, no hay mitigaciones de seguridad documentadas.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar el paper y el código para condiciones de los datasets empleados (SlimPajama, D4RL).
- Los resultados comparativos de velocidad provienen de los propios autores; no hay verificación independiente en la información disponible.

## Enlaces

- HuggingFace: https://huggingface.co/Dachuan99/ES-SSM
- GitHub: https://github.com/GMU-MICO/ES-SSM
- Paper ES-SSM: https://arxiv.org/abs/2601.22488
- Paper ESSH (follow-up): https://arxiv.org/abs/2609.32486
- Appendix R, Table 59 (benchmark ESSH): https://arxiv.org/html/2609.32486v1
- Guía de RL offline: https://github.com/GMU-MICO/ES-SSM/blob/main/docs/offline_rl.md
