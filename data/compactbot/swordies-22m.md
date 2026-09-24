# Compactbot/swordies-22m

## Resumen

Swordies-22M es un modelo de lenguaje de 22.487.360 parámetros entrenado desde cero por el agente Compactbot (equipo de Glint Research) y publicado en HuggingFace bajo licencia Apache-2.0. Se trata de un GPT decoder-only con atención causal, 448 dimensiones de ocultación, 9 capas, 7 cabezas de atención y una ventana de contexto de 512 tokens sobre un vocabulario BPE de 8192 entradas. No es un modelo útil para generación: es un **ablation de calidad de datos** diseñado como control negativo.

El modelo se entrenó exclusivamente sobre el decil de peor calidad de FineWeb-Edu (score <= 2.578), con 86.292.492 tokens, 1.286 pasos de entrenamiento y una única GPU RTX 5090 en unos 160 segundos de reloj de pared. El hallazgo que documenta es que el decil inferior de FineWeb-Edu constituye **una distribución distinta, no simplemente texto más flojo**: el modelo la aprende bien (perplejidad de validación de 191,65, 5,2557 nats/token en el slice de validación del mismo decil) pero no adquiere ninguna capacidad general.

Su relevancia actual es metodológica. Funciona como contraejemplo reproducible de que una perplejidad in-domain baja no implica utilidad, y de que el suelo de calidad del dato fija el techo de lo que el modelo puede aprender con una arquitectura y un cómputo dados. Sus salidas son ensalada de palabras y sus métricas zero-shot quedan en el nivel del azar o por debajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT decoder-only causal, implementación propia desde cero (no es un modelo `transformers`) |
| Parametros totales | 22.487.360 (57 tensores en F32) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (solo se publican pesos en F32) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (F32) |
| Tamano de ocultacion (D) | 448 |
| Capas (L) | 9 |
| Cabezas de atencion (H) | 7 (dimension de cabeza 64) |
| Tamano de FFN | 1408 (GELU) |
| Vocabulario | 8192 (BPE) |
| Normalizacion | RMSNorm |
| Atencion | causal, qkv fusionado |
| Embeddings | weight-tied (token = lm_head) |
| Precision | float32 |
| Tamano del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only causal de 9 capas con 448 dimensiones de modelo, 7 cabezas de atención de 64 dimensiones cada una y FFN de 1408 unidades con activación GELU. Usa RMSNorm, atención causal con qkv fusionado y embeddings atados con la cabeza de lenguaje. El tokenizador es un BPE de 8192 entradas con tokens especiales `<bos>`, `<eos>` y `<pad>`. La implementación es propia y no sigue la interfaz de `transformers`: requiere el `load_model.py` incluido en el repositorio para instanciar el módulo.

El entrenamiento es de una sola etapa (solo preentrenamiento, sin SFT ni alineación mediante RLHF o DPO). Los datos son el split de train de `HuggingFaceFW/fineweb-edu` filtrado a `language==en and score<=2.578`, es decir, el decil inferior de las puntuaciones de calidad publicadas, con un total de 86.292.492 tokens y los últimos 2.000.000 reservados para validación. La programación usó 1.286 pasos, batch de 128, learning rate de 3e-4 con decaimiento coseno hasta 3e-5, 150 pasos de warmup y autocast en bf16, todo en una sola RTX 5090 durante unos 160 segundos. El mejor checkpoint fue el del paso 1285 con pérdida de validación 5,327; la curva de pérdida fue limpia (de 289 a 5,25) sin divergencia, lo que refuerza que el problema reside en la distribución de los datos y no en el pipeline.

## Capacidades

- Generación de texto: produce texto, pero de forma degenerada. Las muestras publicadas contienen repeticiones de palabras funcionales, puntuación rota y fragmentos alucinados sin referente coherente.
- Razonamiento: no disponible. No hay evidencia de capacidad de razonamiento; las tareas de sentido común y ciencia evaluadas quedan en el azar o por debajo.
- Código: no disponible. No se documenta entrenamiento específico en código ni evaluación en HumanEval o similares.
- Matemáticas: no disponible. No se documenta ninguna evaluación aritmética o matemática.
- Visión: no soportada. Es un modelo exclusivamente de texto.
- Tool calling / function calling: no soportado.
- Agentes y razonamiento multi-paso: no soportado.
- Capacidades multilingües: no. El modelo se declara únicamente en inglés y los datos se filtraron a `language==en`.
- Capacidad especial: ninguna. No hay modo de pensamiento, ni audio, ni decodificación especulativa. La única característica destacable es su naturaleza de control negativo documentado.

## Casos de uso

- Control negativo en experimentos de calidad de datos: sirve para comparar, con arquitectura y cómputo idénticos, qué ocurre cuando se entrena sobre el decil inferior frente a datos de mayor puntuación. Es su propósito original y el único uso plenamente justificado.
- Material didáctico para pipelines from-scratch: el repositorio incluye el cargador y el tokenizador, de modo que permite ilustrar el ciclo completo de tokenización BPE, definición del modelo, bucle de entrenamiento y evaluación de validación con un coste de cómputo de menos de tres minutos en una GPU de consumo.
- Verificación de harnesses de evaluación zero-shot: sus resultados en ARC-Easy, ARC-Challenge, HellaSwag y SciQ (todos en el entorno del 25% de azar) permiten comprobar que un harness de loglikelihood normalizado por longitud está bien implementado, porque un modelo sin capacidad general debe puntuar cerca del azar.
- Pruebas de infraestructura y serialización: al ser un safetensors de 57 tensores en F32 y 0,1 GB, es útil para validar cargadores personalizados, comprobaciones de integridad por SHA-256 y flujos de descarga sin consumir recursos relevantes.
- Estudio de tokenización a pequeña escala: el vocabulario BPE de 8192 entradas y el corpus de 86 millones de tokens permiten analizar cómo un tokenizador pequeño segmenta texto de baja calidad frente a texto de alta calidad.
- Demostración reproducible de la diferencia entre perplejidad in-domain y utilidad: el caso ilustra de forma empírica que una perplejidad baja en el mismo dominio del entrenamiento no implica ninguna habilidad transferible, un argumento útil en docencia y en revisión de metodología.
- Replicación de ablations: al estar documentados pasos, batch, learning rate, warmup, hardware y curva de pérdida, el experimento es replicable y sirve como base para variar un único factor (por ejemplo, subir el umbral de score) manteniendo todo lo demás constante.

## Benchmarks y rendimiento

Datos medidos y reproducibles publicados en la model card. Perplejidad de validación sobre el slice reservado del decil inferior: 191,65 (5,2557 nats/token). Evaluación zero-shot con loglikelihood normalizado por longitud, 300 ejemplos por tarea:

| Tarea | Exactitud | Azar |
|---|---|---|
| ARC-Easy | 24,33% | 25% |
| HellaSwag | 27,67% | 25% |
| ARC-Challenge | 22,67% | 25% |
| SciQ | 21,67% | 25% |
| Perplejidad de validacion (decil inferior) | 191,65 (5,2557 nats/token) | no aplica |

Todas las tareas quedan en el azar o por debajo. No se han publicado resultados de MMLU, GSM8K, HumanEval ni otras suites en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en F32 ocupan aproximadamente 90 MB (22,49 M de parámetros x 4 bytes). Con activaciones para contexto de 512 y lotes pequeños, el consumo total se mantiene por debajo de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria sirve; el modelo es trivial en términos de cómputo. El entrenamiento documentado se hizo en una única RTX 5090.
- GPU de consumo: sí, cabe holgadamente en cualquier GPU de consumo actual e incluso en hardware integrado. También es viable la inferencia en CPU.
- Opciones de despliegue: vLLM, llama.cpp, Ollama y TGI no soportan el modelo de forma nativa, porque no es un modelo `transformers` y no se publican pesos en GGUF. El despliegue requiere el cargador personalizado `load_model.py` incluido en el repositorio, envuelto en un servidor propio si se necesita una API.
- Latencia y throughput estimados: no disponible. No se publican mediciones de inferencia.
- Nota: aunque el despliegue sea técnicamente barato, el modelo no produce salidas utilizables, por lo que el despliegue en producción no tiene sentido práctico.

## Comparativa con modelos similares

La comparación con modelos pequeños funcionales ayuda a situar el artefacto, pero conviene tener en cuenta que los datos de terceros son orientativos y deben verificarse en sus fichas originales.

| Modelo | Parametros | Contexto | Capacidad general | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Compactbot/swordies-22m | 22,49 M | 512 | Nula (al azar o por debajo en ARC-Easy, ARC-Challenge, HellaSwag y SciQ) | Apache-2.0 | HuggingFace, safetensors F32, cargador propio |
| SmolLM-135M | 135 M | no disponible en la informacion proporcionada | Funcional para generacion y tareas basicas | Apache-2.0 | HuggingFace, integrable en transformers |
| Pythia-70M | 70 M | no disponible en la informacion proporcionada | Funcional, usado habitualmente como base de estudio | Apache-2.0 | HuggingFace, integrable en transformers |
| TinyStories-33M | 33 M | no disponible en la informacion proporcionada | Generacion coherente de cuentos simples en ingles | no disponible | HuggingFace |

La diferencia clave no es de tamaño ni de contexto, sino de distribución de datos: los tres alternativos se entrenaron sobre corpus con texto legible y coherente, mientras que Swordies-22M se entrenó deliberadamente sobre el decil de peor calidad, lo que anula cualquier capacidad transferible.

## Limitaciones y advertencias

- Salidas degeneradas por diseño: las muestras publicadas muestran ensalada de palabras, repetición de palabras funcionales, puntuación rota y fragmentos sin referente. No es un fallo, es el resultado esperado del experimento.
- Sin capacidad general: las cuatro tareas zero-shot evaluadas quedan en el azar o por debajo, por lo que no debe usarse para generación, tareas downstream ni como base para fine-tuning.
- Riesgo de alucinación: máximo. Al no tener modelo del mundo, cualquier fragmento con apariencia factual es ruido estadístico sobre la distribución de baja calidad aprendida.
- Sesgos conocidos: no se han publicado análisis específicos de sesgo. Al provenir de un subconjunto filtrado por umbral de calidad de FineWeb-Edu, hereda las características de ese subconjunto, que el propio autor describe como una distribución distinta y no como texto simplemente más débil.
- Limitaciones de contexto e idioma: ventana de 512 tokens y entrenamiento exclusivamente en inglés. No hay soporte multilingüe.
- Compatibilidad: al no ser un modelo `transformers` ni publicarse GGUF, no funciona directamente con vLLM, TGI, llama.cpp, Ollama ni con las APIs estándar de HuggingFace. Requiere el cargador propio.
- Restricciones de licencia: Apache-2.0 permite uso comercial y modificación, pero esto es irrelevante en la práctica porque el modelo no es funcional. Se recomienda no redistribuirlo como si fuera un modelo de propósito general, para no inducir a error.
- Advertencia para producción: no debe desplegarse en ningún flujo de cara al usuario. La perplejidad baja in-domain es una propiedad de la distribución de basura, no una señal de calidad.
- Evaluación limitada: solo se han publicado cuatro tareas de loglikelihood y la perplejidad de validación. No hay MMLU, GSM8K, HumanEval ni evaluaciones de seguridad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Compactbot/swordies-22m
- Perfil del autor, Compactbot: https://huggingface.co/Compactbot/models
- Otro modelo del mismo autor, Compactbot/discussion-model: https://huggingface.co/Compactbot/discussion-model
- Dataset de entrenamiento, FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Repositorio de seguimiento de modelos gratuitos citado en la busqueda (contexto general, no especifico del modelo): https://github.com/ClawLabsAI/free-ai-models

No se han encontrado en la búsqueda web papers, blogs ni demos específicos de este modelo más allá de la propia model card y el perfil del autor.
