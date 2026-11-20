# FixedSeed/lattice-audio

## Resumen

Lattice audio models es un repositorio de exportaciones ONNX de modelos de análisis musical utilizados por la aplicación Lattice, desarrollada por FixedSeed. El repositorio contiene por ahora un único modelo: `beat-this-final0.onnx`, una exportación sin modificaciones del checkpoint `final0` de Beat This, un sistema de seguimiento de pulsos (beat tracking) publicado por Foscarin, Schlüter y Widmer en ISMIR 2024 desde el Institute of Computational Perception de la JKU Linz.

El modelo resuelve la detección de pulsos musicales y downbeats (primer pulso de cada compás) a partir de espectrogramas log-mel, sin necesidad de posprocesamiento con redes bayesianas dinámicas (DBN), que era el estándar en sistemas anteriores. La relevancia actual radica en que ofrece una implementación ligera y portable (ONNX, fp32, 0,1 GB de repositorio) que puede integrarse en aplicaciones de escritorio o móvil sin depender de PyTorch.

No se trata de un modelo de lenguaje ni de un modelo generativo: es un modelo discriminativo de análisis de audio, por lo que muchas de las especificaciones habituales (parámetros totales, contexto, idiomas) no aplican o no están disponibles en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal para beat tracking (detalles internos no disponibles; exportada desde Beat This de JKU Linz) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada de longitud T libre, entrenado con fragmentos de 1500 frames (30 s) |
| Tipos de cuantizacion | fp32 (única variante publicada) |
| Idiomas soportados | no aplica (modelo de audio, no de texto) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 17) |

## Arquitectura y entrenamiento

El modelo es una exportación directa a ONNX del checkpoint `final0` de Beat This, un sistema de beat tracking presentado en ISMIR 2024. La innovación principal del trabajo original es la eliminación del posprocesamiento con DBN: en lugar de aplicar una red bayesiana dinámica sobre las activaciones del modelo, se seleccionan picos directamente sobre los logits de salida (máximo en una ventana de ±3 frames con logit superior a 0), tal como se describe en la model card.

La entrada es un espectrograma log-mel de audio mono a 22,05 kHz con STFT de 1024 muestras, ventana Hann periódica, hop de 441 (50 frames por segundo), padding reflectante centrado, magnitud escalada por 1/sqrt(1024), 128 bandas mel slaney de 30 Hz a 11 kHz sin normalización de filtros y transformación `log(1 + 1000 * x)`. El modelo produce dos salidas: `beat` y `downbeat`, con logits por frame de forma `[1, T]`.

El entrenamiento se realizó sobre fragmentos de 1500 frames (30 segundos). Para piezas más largas, la inferencia se ejecuta en chunks de 1500 frames con solapamiento de 6 frames en cada borde, y después se seleccionan los picos. No se dispone de información sobre el número de tokens, la composición exacta del dataset ni el uso de RLHF/DPO (no aplica en este tipo de modelo).

## Capacidades

- Detección de pulsos musicales (beats) a partir de audio mono a 22,05 kHz.
- Detección de downbeats (primer pulso de compás).
- Procesamiento de audio de longitud arbitraria mediante chunking con solapamiento.
- Inferencia en formato ONNX (opset 17, fp32), portable a múltiples runtimes.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión ni audio generativo.

## Casos de uso

- Sincronización de visualizaciones musicales: la salida de beats y downbeats permite alinear animaciones, letras o efectos visuales con la pulsación de una pista, usando los logits por frame para detectar cambios de tempo en tiempo real.
- Análisis musical automatizado en aplicaciones de DJ: el modelo puede alimentar funciones de beatmatching o cuantización de loops, ya que identifica pulsos y downbeats sin necesidad de DBN ni de un pipeline pesado de PyTorch.
- Segmentación por compases en herramientas de edición: los downbeats permiten dividir una pista en compases para edición no lineal, remezcla o generación de partituras simplificadas.
- Extracción de características rítmicas para recomendación musical: los beats detectados sirven como features para sistemas de recomendación o clasificación por tempo y métrica.
- Integración en aplicaciones de escritorio o móvil: al ser ONNX fp32 de 0,1 GB, puede embeberse en apps nativas con ONNX Runtime sin dependencias de Python ni CUDA obligatoria.
- Investigación en MIR (Music Information Retrieval): sirve como baseline reproducible y exportación fiel (diferencias < 1e-5 respecto a PyTorch) para comparar con otros sistemas de beat tracking.
- Análisis de grabaciones en directo: el procesamiento por chunks de 30 s con solapamiento permite analizar conciertos o sesiones largas de forma incremental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el repositorio ocupa 0,1 GB en fp32, por lo que la huella de memoria es reducida (adecuada para GPUs de gama baja o incluso CPU).
- GPU recomendadas: no disponibles; cualquier GPU con soporte ONNX Runtime (CUDA o DirectML) debería ser suficiente, aunque no se especifican modelos concretos.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU de consumo moderna e incluso en CPU, dado el tamaño del repositorio (0,1 GB) y la naturaleza del modelo.
- Opciones de despliegue: ONNX Runtime (principal), con posibilidad de otros runtimes compatibles con opset 17. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles. El procesamiento se realiza en chunks de 1500 frames (30 s de audio) con solapamiento de 6 frames.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto/entrada | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Lattice audio (beat-this-final0) | Beat tracking ONNX | T libre, entrenado en 1500 frames (30 s) | MIT | ONNX fp32 | Hugging Face (FixedSeed/lattice-audio) |
| Beat This (original, JKU Linz) | Beat tracking PyTorch | 1500 frames (30 s) | MIT | PyTorch | GitHub CPJKU/beat_this |
| Otros sistemas con DBN (p. ej. madmom) | Beat tracking con posprocesamiento DBN | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita al modelo original y a la exportación, ya que no se dispone de datos de benchmarks ni de especificaciones de alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado en audio: no es un modelo de lenguaje ni generativo; no debe evaluarse con métricas de NLP.
- Sesgos conocidos: no disponibles en la información proporcionada; al entrenarse con un dataset musical concreto (no especificado), puede tener sesgos hacia ciertos géneros, tempos o métricas.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí existe riesgo de falsos positivos o negativos en la detección de beats y downbeats, especialmente en música sin pulso claro, rubato extremo o grabaciones ruidosas.
- Limitaciones de contexto: la entrada debe ser audio mono a 22,05 kHz con el preprocesado exacto descrito; desviaciones en el muestreo o en el espectrograma degradan los resultados. El modelo se entrenó con fragmentos de 30 s y requiere chunking para piezas largas.
- Restricciones de licencia: licencia MIT, que permite uso comercial con atribución; no obstante, se recomienda conservar la cita del trabajo original (Foscarin et al., ISMIR 2024).
- Caveat para producción: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en noviembre de 2026; es una exportación reciente sin validación comunitaria amplia. La model card indica que las salidas coinciden con PyTorch dentro de 1e-5, pero no se aportan benchmarks de precisión en datasets estándar.
- No se especifican requisitos de versión de ONNX Runtime ni compatibilidad con aceleradores concretos.

## Enlaces

- Hugging Face: https://huggingface.co/FixedSeed/lattice-audio
- Aplicación Lattice: https://fixedseed.com/lattice
- Repositorio original Beat This (JKU Linz): https://github.com/CPJKU/beat_this
- Paper: Foscarin, Schlüter y Widmer, "Beat this! Accurate beat tracking without DBN postprocessing", ISMIR 2024 (referenciado en la model card; no se proporciona URL directa en la información disponible).
