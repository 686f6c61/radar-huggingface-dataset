# Hana-ame/additive-rand-transformer

## Resumen

`additive-rand-transformer` es un modelo transformer en miniatura desarrollado por Hana-ame con fines de investigación en interpretabilidad mecanicista. Con un vocabulario de solo 16 tokens y un máximo de 926.464 parámetros, está entrenado exclusivamente en expresiones aritméticas de suma y resta generadas dinámicamente. No es un modelo de propósito general: su objetivo es servir como sonda para responder preguntas mecanísticas, como si un modelo pequeño realmente calcula o memoriza patrones, o si el chain-of-thought (CoT) constituye razonamiento genuino o simplemente una copia de su propio borrador.

El modelo implementa un transformer pequeño con tres variantes de atención (causal, lineal y DSA, una atención dispersa top-k), y soporta opcionalmente Mixture-of-Experts (MoE) y LoRA. Todo el entrenamiento se ejecuta en CPU (12 núcleos), con una reproducción completa en unos 100 segundos para la configuración más pequeña. La relevancia actual radica en que ofrece evidencia empírica concreta sobre los límites del CoT y la generalización en modelos pequeños, con implicaciones directas para el diseño de arquitecturas eficientes y métodos de entrenamiento como RL.

La licencia es MIT, lo que permite uso comercial y modificación sin restricciones, aunque el modelo está pensado exclusivamente como herramienta de investigación y no como sistema listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer pequeño (TinyGPT) con atención causal, lineal o DSA (sparse attention top-k); soporta MoE y LoRA |
| Parametros totales | Hasta 926.464 (checkpoint L4·D128); versión mínima L2·D64 con 166.656 |
| Parametros activos | No aplica (no es MoE en los checkpoints publicados; el soporte MoE existe pero no se publica un checkpoint MoE) |
| Longitud de contexto | No disponible (el generador usa max_new=80 tokens; no se especifica la ventana máxima) |
| Tipos de cuantizacion | No disponible (los pesos se publican en formato .pt de PyTorch, sin cuantización) |
| Idiomas soportados | No disponible (el vocabulario es numérico, no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | PyTorch .pt (7 checkpoints, 34 MB en total) |

## Arquitectura y entrenamiento

El modelo es un transformer pequeño con capas configurables (L2 o L4) y dimensión de modelo (D64 o D128). La innovación principal es la atención dispersa DSA (Dynamic Sparse Attention), que selecciona top-k tokens relevantes en lugar de atender a toda la secuencia; en los experimentos, DSA supera claramente a la atención causal y lineal en tareas de suma con el mismo presupuesto de parámetros. El entrenamiento combina SFT sobre expresiones aritméticas generadas dinámicamente (con y sin CoT en formato de suma vertical) y aprendizaje por refuerzo (REINFORCE y GRPO) con recompensas estructuradas.

El dataset se genera en tiempo real, lo que evita el sobreajuste a ejemplos fijos. Se aplican sesgos de dificultad (por ejemplo, bias 0.5 hacia operandos de 4 dígitos) y muestreo disperso para controlar la distribución de longitudes. El entrenamiento se realiza en CPU con torch>=2.0; la configuración más pequeña (L2·D64) tarda unos 100 segundos en completar 4000 pasos. Los experimentos incluyen microajuste con LoRA (r=8) y MoE, así como RL con autogeneración de problemas (self-play).

Un hallazgo central es que el modelo actúa como un "lector de borradores": escribe correctamente las columnas de la suma vertical, pero la lectura final del resultado es frágil y depende estrictamente de las longitudes vistas en entrenamiento. La interpretación mecanicista se apoya en experimentos de intervención (H1: modificar columnas, operandos o acarreos) que muestran tasas de éxito del 88,7 %, 0 % y 12 % respectivamente, evidenciando que la respuesta final no se recalcula a partir de los operandos sino que se lee de las columnas generadas.

## Capacidades

- Aritmética básica: suma y resta de números de 1 a 4 dígitos, con precisión del 100 % en add1-3 y sub1-4 cuando se usa CoT (checkpoint L4·D128 con bias 0.5).
- Generación de CoT en formato de suma vertical: el modelo produce columnas intermedias (ej. "3+6+0=9 0") antes de emitir el resultado final.
- Aprendizaje por refuerzo: los checkpoints entrenados con GRPO mejoran la precisión en add4 de 27 % a 32 % sin retroceso en resta; REINFORCE conservador añade +5 puntos porcentuales en add4.
- Atención dispersa DSA: en la configuración L2·D64, DSA alcanza un 60 % de precisión en add2 frente al 10 % de la atención causal, con el mismo número de parámetros.
- LoRA como método de microajuste: preserva las habilidades previas (88/78/82 % en add1-3) mientras añade capacidad para add4 (35 %), evitando el olvido catastrófico que sufre el ajuste completo.
- No soporta tool calling, agentes, visión, audio ni procesamiento de lenguaje natural.

## Casos de uso

- Investigación en interpretabilidad mecanicista: el modelo permite estudiar cómo se representan internamente las operaciones aritméticas, qué información se almacena en cada capa y cómo el CoT se convierte en un artefacto de lectura en lugar de un proceso de razonamiento. Es útil para validar técnicas de intervención y análisis de atribución.
- Evaluación de arquitecturas de atención eficientes: DSA puede compararse con atención causal y lineal en un entorno controlado y reproducible, proporcionando datos sobre el trade-off entre dispersión y rendimiento en tareas secuenciales.
- Estudio de los límites del chain-of-thought: al entrenar con y sin CoT, el modelo demuestra que la forma de los datos (CoT vs. plano) es más determinante que la capacidad del modelo para aprender aritmética de varios dígitos. Esto sirve para diseñar experimentos sobre cuándo el CoT ayuda y cuándo es un espejismo.
- Benchmark de métodos de aprendizaje por refuerzo: los scripts de REINFORCE y GRPO incluidos permiten comparar algoritmos de RL en un entorno de bajo coste computacional, con métricas claras de precisión y estabilidad.
- Prueba de técnicas de microajuste sin olvido: LoRA se evalúa frente al ajuste completo en un escenario de cambio de distribución de datos, mostrando cómo preservar habilidades previas mientras se incorporan nuevas. Útil para estudiar la plasticidad en modelos pequeños.
- Reproducción de experimentos de generalización: el modelo no extrapola a longitudes no vistas (5-7 dígitos dan 0 % de precisión), lo que lo convierte en un caso de estudio para investigar los mecanismos de generalización posicional y la dependencia de la longitud en transformers.

## Benchmarks y rendimiento

Los resultados publicados se refieren a tareas aritméticas específicas y comparaciones entre variantes del propio modelo. No hay benchmarks estándar como MMLU o HumanEval porque el modelo no está diseñado para lenguaje natural.

| Configuracion | add1-3 | add4 | sub1-4 | Notas |
|---|---|---|---|---|
| L4·D128 causal, CoT, bias 0.5 | 100 % | No reportado | 100 % | Checkpoint principal de mecanismos |
| L4·D128 causal, CoT, sin bias | 100 % | 27 % | 100 % | Baseline para RL |
| L4·D128 causal, CoT + GRPO 150 pasos | 100 % | 32 % | 100 % | Mejora sin retroceso |
| L4·D128 causal, CoT + REINFORCE conservador | 100 % | 32 % | ~100 % | +5 pp en add4, ligero retroceso en sub |
| L2·D64 DSA (top-8) | 60 % (add2) | No reportado | No reportado | Mejor variante de atención |
| L2·D64 causal | 10 % (add2) | No reportado | No reportado | Baseline de atención |
| Sin CoT (cualquier tamaño) | 0 % (multidígito) | 0 % | 0 % | La forma de datos es decisiva |

Además, el modelo nunca generaliza a longitudes superiores a las entrenadas: probado con 5-7 dígitos, la precisión es del 0 %. En el ejemplo ilustrativo de 9999+8888, el modelo escribe correctamente las cinco columnas de acarreo pero produce una respuesta final errónea (18 en lugar de 18887), evidenciando la fragilidad del mecanismo de lectura.

## Requisitos de hardware

- Inferencia: funciona en CPU sin GPU. El checkpoint más grande (926K parámetros) se ejecuta en cualquier CPU moderna; la generación de una secuencia de 80 tokens tarda milisegundos.
- Entrenamiento: en un CPU de 12 núcleos, la configuración L2·D64 completa (4000 pasos) tarda unos 100 segundos. El entrenamiento de L4·D128 requiere más tiempo pero sigue siendo viable en CPU.
- Memoria: los pesos ocupan menos de 1 MB por checkpoint (34 MB en total para los 7 checkpoints). La VRAM no es relevante.
- GPUs recomendadas: no necesarias. Si se desea acelerar, cualquier GPU con >=2 GB de VRAM funcionaría, pero no hay soporte explícito para CUDA en los scripts.
- Opciones de despliegue: los scripts de Python (`train.py`, `evaluate.py`, `explore_h1.py`) son la forma principal de uso. No se proporcionan integraciones con vLLM, llama.cpp u Ollama, dado el tamaño mínimo del modelo y su naturaleza de investigación.

## Comparativa con modelos similares

No hay modelos comparables en el mismo nicho (tiny transformers para interpretabilidad aritmética con CoT y RL). Los modelos de propósito general de tamaño similar (por ejemplo, GPT-2 pequeño con ~124M parámetros) no son comparables porque no se entrenan en aritmética simbólica ni publican análisis mecanísticos detallados. La comparativa más relevante es interna: DSA vs. causal vs. lineal, y GRPO vs. REINFORCE, ya documentada en los benchmarks. Por tanto, la comparativa externa se considera no disponible.

## Limitaciones y advertencias

- No extrapola a longitudes no vistas: entrenado con operandos de 1-4 dígitos, la precisión cae al 0 % con 5-7 dígitos. No es adecuado para aritmética general.
- Alucinación en la lectura final: aunque el CoT escrito es correcto, la respuesta final puede ser errónea (ejemplo de 9999+8888 produce 18 en lugar de 18887). Esto limita su uso como sistema fiable.
- Vocabulario numérico exclusivo: no procesa lenguaje natural, por lo que no sirve para tareas de texto, código o conversación.
- Sin capacidades de tool calling, agentes o razonamiento multi-paso más allá de la suma vertical.
- Riesgo de sobreajuste a la distribución de entrenamiento: el sesgo de dificultad y el muestreo disperso pueden hacer que el modelo dependa de características específicas de los datos generados.
- El self-play RL naive provoca colusión (genera solo problemas de 1 dígito) y la corrección con anclaje de dificultad lleva a colapso de modo (1/60 expresiones únicas). Estos comportamientos deben tenerse en cuenta al usar los scripts de RL.
- Licencia MIT permite uso comercial, pero el modelo no está diseñado para producción; su valor es exclusivamente investigador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hana-ame/additive-rand-transformer
- Perfil del autor: https://huggingface.co/Hana-ame
- El repositorio incluye los informes de investigación en `additive_rand_transformer/` (RESEARCH.md, EXPLORE.md, SWEEP.md, SCAN.md, COT.md, COT_VS_PLAIN.md, SPARSE_RL.md, IMPROVE.md, SELFPLAY.md, REWARD.md, RESULTS.md, PARAMS.md, README.md). No se han encontrado papers externos ni demos adicionales.
