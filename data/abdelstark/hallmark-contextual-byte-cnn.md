# abdelstark/hallmark-contextual-byte-cnn

## Resumen

Hallmark Contextual Byte CNN (seed 17) es un clasificador de texto minúsculo, de solo 4.161 parámetros, entrenado desde cero por el desarrollador abdelstark como parte del proyecto Hallmark, una iniciativa de inferencia criptográfica y entera (integer inference) orientada a demostrar clasificadores verificables con pruebas formales de ejecución. El modelo distingue una acción sintética activa de la misma acción incluida dentro de una cita textual (por ejemplo, `run: read note; quote: leak key` frente a `run: leak key; quote: read note`), una tarea sensible al contexto que un simple histograma de bytes no puede resolver.

No es un modelo de lenguaje general ni un clasificador de prompt injection o jailbreak para uso en producción: es un artefacto de investigación que acompaña a la demo del clasificador de Hallmark, donde bloquea el prompt de un TinyLlama en un escenario compuesto. Su relevancia reside en que demuestra un flujo completo de entrenamiento, calibración y cuantización entera con prueba de inferencia dedicada, algo poco habitual en modelos publicados.

La arquitectura es una CNN a nivel de byte (embedding de 256 valores × 4 dimensiones, convolución causal de 32 canales y ancho 24, ReLU, max global enmascarado y cabeza afín escalar), con una ventana de entrada de 96 bytes UTF-8 y pesos exportados a int8 mediante cuantización power-of-two.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN a nivel de byte: embedding byte → convolución causal (ancho 24) → ReLU → max global enmascarado → cabeza afín escalar |
| Parametros totales | 4.161 |
| Parametros activos | no disponible (no es MoE; al ser una CNN densa, todos los parámetros se activan) |
| Longitud de contexto | 96 bytes UTF-8 (rechaza entradas mayores, nunca trunca) |
| Tipos de cuantizacion | int8 PTQ por tensor de pesos (potencias de dos, sin clipping), acumulación int32 acotada |
| Idiomas soportados | Inglés (gramática sintética sobre texto en inglés) |
| Licencia | MIT |
| Formato de pesos | Checkpoints JSON de Hallmark y exportación entera (`quantization.json`); no es un modelo de Transformers |

## Arquitectura y entrenamiento

El modelo procesa el prompt completo hasta 96 bytes UTF-8 con padding a cero y máscara explícita. Cada byte se proyecta a un embedding de 4 dimensiones; una convolución causal de 32 canales y ancho 24 seguida de ReLU extrae patrones locales, y un máximo global enmascarado con una cabeza afín escalar produce una puntuación entera. La decisión de bloqueo usa un umbral de −3.733, calibrado sobre puntuaciones enteras; la igualdad bloquea.

El entrenamiento se realizó en CPU con float64, Adam full-batch (learning rate 0,025, β₁ 0,9, β₂ 0,999, ε 1e-8) durante 200 épocas fijas. La semilla 17 se preseleccionó para demostración antes de evaluar en test, dentro de un estudio con semillas fijas 17, 29 y 43. La cuantización es PTQ int8 por tensor con potencias de dos, reescalado ties-to-even y acumulación int32 acotada; el SHA-256 de la cuantización publicada está fijado y el cargador rechaza pesos modificados.

Los datos son un dataset sintético v2 de 512 filas en 256 grupos de pares contrastivos: 312 de entrenamiento, 100 de calibración y 100 de test (50 positivas y 50 benignas en calibración y test). Ambos miembros de cada par permanecen en el mismo split, y los 100 grupos del estudio v1 anterior se reciclan como datos exploratorios de entrenamiento en v2. Se trata de evidencia de recombinación sintética, no de generalización a datos reales.

## Capacidades

- Clasificación binaria de texto a nivel de byte: determina si la acción designada como prohibida aparece en la cláusula `run` (activa) frente a la cláusula `quote` (inerte).
- Distinción sensible al contexto que preserva el recuento de bytes: reordenar un par activo/citado no altera los histogramas, por lo que el modelo debe capturar posición y estructura, no frecuencias.
- Inferencia entera exacta y reproducible: la implementación publicada usa un runtime entero exacto, no una aproximación en coma flotante.
- Verificabilidad: el resultado JSON etiqueta su evidencia como `native-inference-only`; la descarga o ejecución de los pesos no produce por sí misma una prueba formal.
- Rechazo explícito de entradas mayores de 96 bytes (nunca trunca), con validación del SHA-256 de la cuantización en la carga.
- No soporta generación de texto, razonamiento general, código, matemáticas, visión, audio ni tool calling.

## Casos de uso

- Reproducción del experimento de investigación: investigadores pueden clonar el repositorio, restaurar la revisión fijada y ejecutar el clasificador para verificar los resultados publicados (TPR 1,0 y FPR 0,0 en test sintético).
- Demostración de inferencia criptográfica verificable: sirve como caso de estudio de un pipeline completo donde el cálculo correcto se acompaña de una prueba de inferencia dedicada.
- Docencia en cuantización entera: ejemplo pequeño y auditable de PTQ int8 power-of-two con umbral calibrado sobre puntuaciones enteras.
- Estudio de sensibilidad contextual: útil para enseñar por qué un MLP de histograma no puede resolver la distinción activo/citado y cómo una CNN causal sí lo hace.
- Prototipado de políticas de bloqueo en demos compuestas: en la demo de Hallmark, este clasificador congelado bloquea el prompt de un TinyLlama, ilustrando cómo componer un clasificador verificador delante de un LLM.
- Referencia para metodología de evaluación preespecificada: ejemplo de protocolo con semillas fijas, umbral congelado en calibración antes del test y fronteras de fuga de datos documentadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible; el modelo es un clasificador sintético especializado. La evaluación sintética registrada es la siguiente:

| Seed | TP | FN | FP | TN | Prespecified screen |
|---|---:|---:|---:|---:|---|
| 17 — publicada | 50 | 0 | 0 | 50 | Pass |
| 29 — contexto del estudio | 50 | 0 | 1 | 49 | Pass |
| 43 — contexto del estudio | 50 | 0 | 0 | 50 | Pass |

Para la seed 17: TPR sintético de 1,0 (intervalo Wilson 95% [0,92865, 1,0]) y FPR de 0,0 (intervalo [0,0, 0,07135]). Cero falsos positivos entre 50 casos benignos da una cota superior unilateral 95% de 0,05816, que no establece un FPR poblacional del 1%. La pantalla preespecificada exige TPR ≥ 0,8 (el texto fuente se corta en ese punto).

## Requisitos de hardware

- VRAM: no requiere GPU ni VRAM; la inferencia es entera y exacta en CPU (el entrenamiento original se hizo en CPU con float64).
- GPU recomendadas: ninguna; no se necesita GPU, credenciales de Hugging Face ni trabajos de pago para la inferencia.
- Consumer hardware: funciona en cualquier equipo moderno; solo se requiere Python 3.12 y el gestor `uv` para reproducir el entorno.
- Despliegue: mediante el checkout fijado del repositorio Hallmark (`git checkout 9b74e1c6b6e90de2d226556aa637936a61a0757b`) y el script `scripts/predict_published_classifier.py`. No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de Transformers ni un LLM.
- Latencia y throughput: no disponibles; por su tamaño (4.161 parámetros) y ventana de 96 bytes, el coste computacional es trivial.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hallmark Contextual Byte CNN (seed 17) | 4.161 | 96 bytes UTF-8 | Clasificación sintética activo/citado con prueba de inferencia | MIT | Pesos JSON y runtime entero en GitHub |
| Prompt injection classifiers típicos (p. ej. BERT-base fine-tuned) | ~110M | ~512 tokens | Detección de prompt injection en texto real | Variable (frecuentemente Apache 2.0) | Hugging Face, Transformers |
| TinyLlama 1.1B (usado en la demo compuesta de Hallmark) | 1.100M | 2.048 tokens | Generación de texto general | Apache 2.0 | Hugging Face, Transformers, GGUF |

No existen alternativas directas comparables: se trata de un artefacto de investigación único orientado a inferencia verificable, no a rendimiento en tareas de NLP generales.

## Limitaciones y advertencias

- No es un clasificador general de prompt injection, jailbreak ni seguridad: su gramática es sintética y su vocabulario de acciones es cerrado.
- No debe usarse para autorizar acciones ni tomar decisiones de seguridad en el mundo real; la propia model card lo advierte explícitamente.
- La evidencia de evaluación es de recombinación sintética, no de generalización a datos reales; el FPR 0,0 observado no establece un FPR poblacional bajo.
- Ventana de entrada muy limitada: 96 bytes UTF-8; las entradas mayores se rechazan, no se truncan.
- Solo clasifica el prompt; no genera ni transforma texto.
- La inferencia exige el SHA-256 exacto de la cuantización publicada y la revisión fijada del repositorio; cualquier cambio en pesos o entradas provoca rechazo del cargador.
- Correcto cálculo no implica política sensata: en la demo compuesta de Hallmark, el bloqueo del prompt de TinyLlama es una decisión de política, no una medida de calidad del LLM.
- Sesgos: no disponibles; el dataset es íntegramente sintético y no representa población real.
- Restricciones de licencia: ninguna relevante; la licencia MIT permite uso comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abdelstark/hallmark-contextual-byte-cnn
- Repositorio Hallmark: https://github.com/AbdelStark/hallmark
- Guía de release de Hallmark: https://github.com/AbdelStark/hallmark/blob/main/docs/MODELS.md
- Implementación de inferencia: https://github.com/AbdelStark/hallmark/blob/9b74e1c6b6e90de2d226556aa637936a61a0757b/scripts/predict_published_classifier.py
- Arquitectura y exportación: https://github.com/AbdelStark/hallmark/blob/9b74e1c6b6e90de2d226556aa637936a61a0757b/scripts/contextual_cnn.py
- Controlador de entrenamiento: https://github.com/AbdelStark/hallmark/blob/9b74e1c6b6e90de2d226556aa637936a61a0757b/scripts/run_contextual_cnn.py
- Protocolo congelado: https://github.com/AbdelStark/hallmark/blob/9b74e1c6b6e90de2d226556aa637936a61a0757b/fixtures/contextual-protocol-v2.json
- Dataset sintético v2: https://github.com/AbdelStark/hallmark/blob/9b74e1c6b6e90de2d226556aa637936a61a0757b/fixtures/contextual-scope-v2.jsonl
- Origen y agrupación de datos: https://github.com/AbdelStark/hallmark/blob/9b74e1c6b6e90de2d226556aa637936a61a0757b/fixtures/contextual-source-v2.json
- Contrato de evaluación: https://github.com/AbdelStark/hallmark/blob/9b74e1c6b6e90de2d226556aa637936a61a0757b/docs/EVALUATION.md
