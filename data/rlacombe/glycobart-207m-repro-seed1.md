# rlacombe/glycobart-207m-repro-seed1

## Resumen

GlycoBART Reproduction (207M, seed 1) es un checkpoint de PyTorch entrenado desde cero que reproduce el trabajo de Abtheen et al. (2025) sobre predicción de estructuras de glicanos a partir de datos de espectrometría de masas. Lo publica Romain Lacombe como parte del proyecto GlycoGen, presentado en NeurIPS 2026, y su función es servir como referencia reproducible de un modelo BART adaptado al dominio de la glicómica con un objetivo de discrete flow matching. El modelo tiene 207 millones de parámetros y se distribuye como pesos completos (`best_model.pt`) entrenados con la semilla aleatoria 1.

El problema que aborda es la elucidación estructural de glicanos: dada una señal de espectrometría de masas, predecir la estructura del glicano correspondiente. Es una tarea de traducción secuencia-a-secuencia en un dominio muy especializado, donde los modelos de lenguaje generalistas no rinden bien sin adaptación. El checkpoint reporta una precisión top-1 en el conjunto de test de 80,92 % ± 0,31 % (media de 3 semillas, beam=1) sobre 76.774 muestras del benchmark CandyCrunch v2.

La relevancia del modelo es fundamentalmente metodológica y de reproducibilidad: no es un modelo de propósito general ni un asistente conversacional, sino un artefacto de investigación para validar resultados de un paper y para servir de base a quien quiera experimentar con flow matching discreto aplicado a datos biológicos estructurados. La licencia MIT facilita su reutilización, aunque el alcance práctico está acotado al dominio de la glicómica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BART (transformer encoder-decoder) con objetivo de discrete flow matching, reproducción desde cero de Abtheen et al. (2025) |
| Parametros totales | 207M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint en PyTorch nativo, `best_model.pt`) |
| Idiomas soportados | no disponible (modelo de dominio, no lingüístico) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`best_model.pt`); el repositorio ocupa 38,1 GB |

## Arquitectura y entrenamiento

El modelo es una reproducción desde cero de la arquitectura BART empleada por Abtheen et al. (2025), con 207 millones de parámetros y un objetivo de entrenamiento basado en discrete flow matching. La model card no detalla la composición exacta del dataset de entrenamiento, el número de tokens vistos ni si hubo etapas de ajuste fino con RLHF o DPO; solo indica que el entrenamiento se realizó sobre el benchmark CandyCrunch v2 y que el checkpoint corresponde a la semilla aleatoria 1.

La innovación técnica declarada es el uso de discrete flow matching en lugar de los objetivos generativos habituales de BART, en el contexto del trabajo GlycoGen ("Glycan Structure Prediction with Crystallizing Flows"). El autor publica tres semillas para permitir estimar la varianza del resultado, y reporta la media de las tres en la métrica principal. No se especifican detalles sobre tokenización del dominio, esquema de decodificación (aparte de beam=1 en la evaluación) ni técnicas auxiliares como decodificación especulativa.

## Capacidades

- Predicción de estructura de glicanos a partir de espectros de masas (tarea principal del modelo).
- Generación seq2seq sobre representaciones estructuradas de glicanos, no sobre texto natural.
- Evaluación reproducible con beam search (el resultado reportado usa beam=1).
- Entrenamiento desde cero con semilla controlada, pensado para experimentos de reproducibilidad multi-semilla.
- No se documenta soporte de tool calling, function calling ni uso como agente.
- No se documentan capacidades multilingües, de visión, audio ni modo "thinking".
- No se documenta razonamiento general, código ni matemáticas; el dominio es exclusivamente glicómico.

## Casos de uso

- Reproducción de resultados de investigación: cargar `best_model.pt` y ejecutar los scripts de inferencia del repositorio GlycoGen para verificar la precisión top-1 reportada (80,92 % ± 0,31 %) sobre el split de test de CandyCrunch v2.
- Elucidación asistida de glicanos en pipelines de glicómica: usar el modelo como primer paso para proponer estructuras candidatas a partir de espectros de masas, que luego un experto valida manualmente.
- Estudio de variabilidad entre semillas: comparar los tres checkpoints publicados (seed 1, 2 y 3) para cuantificar la estabilidad del entrenamiento y del rendimiento en la tarea.
- Baseline para nuevos métodos de flow matching discreto: emplear este checkpoint como referencia frente a propuestas alternativas de generación sobre datos estructurados.
- Anotación a escala de datasets de espectrometría: aplicar el modelo a conjuntos grandes de espectros para preetiquetar estructuras antes de una revisión experta, reduciendo el coste de anotación manual.
- Docencia y formación en bioinformática estructural: usar el modelo y su benchmark público para ilustrar un pipeline completo de entrenamiento, evaluación y análisis de errores en una tarea biológica real.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado | Condiciones |
|---|---|---|---|
| CandyCrunch v2 (test, n = 76.774) | Precisión top-1 estructural | 80,92 % ± 0,31 % | beam=1, media de 3 semillas |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks de propósito general, lo cual es coherente con el carácter de dominio del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión nativa (fp32): aproximadamente 0,8-1 GB solo para pesos de 207M; con activaciones y overhead de PyTorch, contar con 2-4 GB según longitud de secuencia.
- En fp16/bf16 los pesos ocupan alrededor de 0,4 GB, aunque el autor no publica versiones convertidas.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM es suficiente; una RTX 3060, RTX 4090 o A100 funcionan sin problema. El modelo cabe holgadamente en GPU de consumo.
- Despliegue: el repositorio se distribuye como checkpoint PyTorch y los scripts de inferencia están en github.com/rlacombe/GlycoGen; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y al ser un modelo de dominio con tokenizador propio es poco probable que esos runners funcionen sin adaptación.
- Latencia y throughput: no disponibles en la información proporcionada.
- El repositorio de Hugging Face ocupa 38,1 GB, muy por encima del tamaño de los pesos, lo que sugiere que incluye artefactos adicionales (posiblemente checkpoints intermedios u otros ficheros); conviene revisar los ficheros antes de descargar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GlycoBART 207M repro (seed 1) | 207M | no disponible | Predicción de estructura de glicanos | MIT | Hugging Face + GitHub |
| Abtheen et al. (2025), modelo original | no disponible | no disponible | Predicción de estructura de glicanos | no disponible | no disponible en la información proporcionada |
| Modelos BART generalistas (p. ej. BART-base) | ~140M | ~1.024 tokens | Generación de texto | MIT | Hugging Face |

La comparación con el modelo original de Abtheen et al. (2025) es la más pertinente, pero la información disponible no incluye sus especificaciones ni sus resultados, por lo que no es posible contrastar cifras. Frente a un BART generalista, la diferencia clave es el dominio y el objetivo de entrenamiento (flow matching discreto sobre glicanos), no el tamaño.

## Limitaciones y advertencias

- Modelo de dominio muy estrecho: no es utilizable para texto general, código, matemáticas ni conversación.
- La model card no documenta sesgos, pero al entrenarse sobre un benchmark concreto (CandyCrunch v2) hereda los sesgos de cobertura y anotación de ese dataset.
- Riesgo de alucinación estructural: como modelo generativo, puede producir estructuras de glicano plausibles pero incorrectas; se requiere validación experta antes de cualquier uso analítico.
- La precisión top-1 reportada (~81 %) implica que aproximadamente una de cada cinco predicciones es errónea en el conjunto de test, lo que limita su uso autónomo en producción.
- No se documentan limitaciones de contexto ni de idioma porque el modelo no opera sobre lenguaje natural.
- Licencia MIT: permite uso comercial y modificación, pero conviene citar el paper de GlycoGen y revisar las condiciones del dataset CandyCrunch v2, que puede tener su propia licencia.
- El checkpoint es una reproducción de un trabajo de terceros; los resultados deben interpretarse como validación independiente, no como el resultado oficial del paper original.
- El tamaño del repositorio (38,1 GB) frente a los ~0,8 GB de pesos en fp32 es una advertencia práctica para el despliegue: verificar el contenido antes de descargar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rlacombe/glycobart-207m-repro-seed1
- Código y scripts de inferencia: https://github.com/rlacombe/GlycoGen
- Página del proyecto: https://rlacombe.github.io/GlycoGen/
- Dataset de benchmark: https://huggingface.co/datasets/rlacombe/candycrunch-v2-benchmark
