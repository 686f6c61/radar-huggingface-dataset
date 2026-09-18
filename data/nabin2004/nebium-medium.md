# nabin2004/nebium-medium

## Resumen

Nebium-Medium es un transformer causal decoder-only de 345 millones de parámetros desarrollado por Nabin Oli (usuario nabin2004) y publicado en Hugging Face bajo licencia MIT. A diferencia de los modelos de lenguaje generalistas, está entrenado específicamente para predicción autorregresiva del siguiente movimiento de ajedrez expresado en notación UCI, utilizando como corpus el dataset nabin2004/nebium-lichess-uci derivado de partidas de Lichess. Su vocabulario no es de texto natural, sino un BPE de 5000 tokens construido sobre "plies" (medios movimientos) en formato UCI.

Arquitectónicamente es un transformer denso convencional pero con primitivas modernas: 24 capas, dimensión oculta 1024, 16 cabezas de atención (64 dimensiones por cabeza), RoPE con theta 10000, activación SwiGLU y RMSNorm con pre-normalización. La ventana de contexto es de 1024 tokens, lo que en la práctica equivale a 1024 plies de historial de partida.

Su relevancia es doble. Por un lado, ocupa el nicho de modelos pequeños y desplegables en local para análisis de ajedrez y generación de movimientos, con un repositorio GGUF companion para llama.cpp u Ollama. Por otro, es un caso de estudio de aplicación de las leyes de escala de Chinchilla a un dominio cerrado y simbólico, con un presupuesto declarado de 6.9 mil millones de tokens (aproximadamente 20 veces el número de parámetros). No se han publicado resultados de benchmarks ni métricas de rendimiento en la información disponible.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only, atención de producto escalar escalada, pre-normalización |
| Parámetros totales | 345M |
| Longitud de contexto | 1024 tokens (equivalentes a 1024 plies UCI) |
| Tipos de cuantización | No detallados en la model card; existe un repositorio GGUF companion (nabin2004/nebium-medium-gguf) para su uso con llama.cpp u Ollama |
| Idiomas soportados | Inglés según la etiqueta de la model card; en la práctica el modelo opera sobre notación UCI de ajedrez, no sobre lenguaje natural |
| Licencia | MIT |
| Formato de pesos | PyTorch binario (model.pt, state dictionary); GGUF en el repositorio companion |
| Dimensión oculta (d_model) | 1024 |
| Cabezas de atención | 16 (64 dimensiones por cabeza) |
| Capas del transformer | 24 |
| Tamaño de vocabulario | 5000 (BPE sobre plies UCI) |
| Embeddings posicionales | RoPE (theta = 10000) |
| Función de activación | SwiGLU |
| Normalización | RMSNorm (pre-normalización) |
| Learning rate base | 2e-4 con decaimiento coseno y warmup lineal |
| Weight decay | 0.1 |
| Dataset | nabin2004/nebium-lichess-uci |

## Arquitectura y entrenamiento

Nebium-Medium sigue el patrón clásico decoder-only con atención causal, pero incorpora los componentes que se han convertido en estándar en los transformers modernos: RMSNorm aplicada antes de cada subcapa en lugar de LayerNorm, SwiGLU como activación en el bloque feed-forward y RoPE para codificar la posición relativa de los plies en la secuencia. La cabeza de atención tiene 64 dimensiones por cabeza (1024 / 16), un valor habitual y compatible con kernels optimizados. El tokenizador es un BPE de 5000 entradas entrenado sobre plies en notación UCI, lo que convierte movimientos como "e2e4" en unidades discretas y reduce drásticamente la longitud efectiva de la secuencia frente a una tokenización de texto carácter a carácter.

El entrenamiento se planteó siguiendo el marco de leyes de escala de Hoffmann et al. (2022), cuyos coeficientes se citan explícitamente en la model card (E = 1.69, A = 406.4, B = 410.7, alfa = 0.34, beta = 0.28). El autor declara un presupuesto óptimo de 6.9 mil millones de tokens (aproximadamente 20 veces el número de parámetros) y lo equipara a unas 46 millones de trayectorias de partida de 50 movimientos. Es importante señalar que esos números corresponden al cómputo óptimo teórico según el marco de Chinchilla, no a una métrica verificada del entrenamiento realmente ejecutado: la información disponible no detalla cuántos tokens se procesaron efectivamente, ni la composición exacta del dataset, ni si se aplicaron fases de ajuste como RLHF, DPO o SFT. Tampoco se documentan innovaciones adicionales como decodificación especulativa, atención lineal o mezclas de expertos.

## Capacidades

- Generación autorregresiva de movimientos de ajedrez en notación UCI a partir de un historial de plies como prompt.
- Predicción del siguiente movimiento dentro de una secuencia de partida, con muestreo controlado por temperatura y número máximo de tokens generados.
- Continuación de secuencias de apertura: el ejemplo oficial parte del prompt "e2e4 e7e5 g1f3" y genera hasta 10 movimientos nuevos.
- Modelado de secuencias largas de partida dentro del límite de 1024 plies de contexto.
- Inferencia en CPU y en GPU de gama baja gracias al reducido tamaño del modelo y a la existencia de una versión GGUF.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso en el sentido de los LLM generalistas.
- No se documenta capacidad multilingüe en lenguaje natural: el dominio es exclusivamente ajedrecístico y simbólico.
- No se documentan capacidades de visión, audio, ni un modo de razonamiento explícito (thinking mode).

## Casos de uso

- Análisis de partidas asistido por ordenador: dado un historial en UCI, el modelo propone continuaciones plausibles que un analista puede contrastar con un motor clásico para detectar desviaciones o ideas alternativas en posiciones concretas.
- Generación de datos sintéticos para entrenamiento de ajedrez: las continuaciones muestreadas con temperatura alta sirven como corpus aumentado para entrenar políticas de ajedrez más pequeñas o para preentrenar modelos de evaluación.
- Motor de referencia para entornos de aprendizaje por refuerzo: al ser un modelo de 345M con inferencia barata, puede actuar como política inicial o como oponente en bucles de self-play sin requerir clústeres de GPU.
- Construcción y ampliación de libros de aperturas: partiendo de posiciones iniciales conocidas, el modelo puede generar líneas alternativas que después se filtran por legalidad y por evaluación de motor.
- Herramientas educativas de ajedrez: aplicaciones locales que sugieren el siguiente movimiento en partidas de entrenamiento o que muestran continuaciones típicas de jugadores humanos a partir de un historial dado.
- Etiquetado y enriquecimiento de bases de datos de partidas: dado un prefijo de PGN convertido a UCI, el modelo puede completar o clasificar la continuación más probable según la distribución aprendida de Lichess.
- Despliegue en local o en el edge: gracias al tamaño reducido y a la versión GGUF, puede ejecutarse en un portátil o en un dispositivo sin GPU dedicada para aplicaciones de ajedrez con requisitos de privacidad o de latencia estricta.
- Investigación sobre leyes de escala en dominios simbólicos: el modelo sirve como punto de comparación reproducible para estudiar cómo escalan los modelos en vocabularios cerrados y altamente estructurados como el UCI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card no incluye tablas de MMLU, HumanEval, GSM8K ni de métricas específicas de ajedrez (por ejemplo, precisión de predicción del siguiente movimiento, perplejidad sobre el conjunto de validación o tasa de movimientos ilegales). Los únicos datos numéricos publicados son hiperparámetros de arquitectura y los coeficientes genéricos de las leyes de escala de Hoffmann et al. (2022), que no constituyen una medición del rendimiento de este modelo concreto.

## Requisitos de hardware

- VRAM estimada para pesos en FP32: aproximadamente 1,4 GB solo de pesos; con activaciones y caché KV, del orden de 2 a 3 GB.
- VRAM estimada en FP16/BF16: aproximadamente 690 MB de pesos; en torno a 1,5 a 2 GB contando caché KV y activaciones.
- VRAM estimada en cuantización de 8 bits: aproximadamente 345 MB de pesos; del orden de 1 a 1,5 GB en total.
- VRAM estimada en cuantización de 4 bits: aproximadamente 175 MB de pesos; por debajo de 1 GB en total, con margen para lotes pequeños.
- Caché KV a longitud completa: con 24 capas, 16 cabezas de 64 dimensiones y 1024 tokens, ocupa unos 96 MiB en FP16 por secuencia.
- Caben en GPU de consumo: cualquier GPU con 2 GB o más de VRAM es suficiente en FP16, incluidas GTX 1650, RTX 3050, RTX 4060 o RTX 4090. En A100 o H100 el modelo está infrautilizado, aunque pueden aprovecharse para servir lotes grandes.
- Inferencia en CPU: viable y con buen rendimiento esperado dado el tamaño, especialmente con la versión GGUF.
- Opciones de despliegue: PyTorch con código propio (el ejemplo oficial importa desde src.models.transformer.nebium y src.data.tokenizer, por lo que no es un modelo cargable directamente con AutoModel de transformers); llama.cpp u Ollama a través del repositorio GGUF companion. No se documenta soporte para vLLM, TGI ni otros servidores de inferencia de propósito general.
- Latencia y throughput: no disponible en la información publicada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nebium-Medium | 345M | 1024 tokens (plies UCI) | Ajedrez, predicción del siguiente movimiento | MIT | Hugging Face (PyTorch + GGUF) |
| GPT-2 medium | 355M | 1024 tokens | Texto general | MIT | Hugging Face |
| Pythia-410M | 410M | 2048 tokens | Texto general | Apache 2.0 | Hugging Face |
| Maia-2 (familia de ajedrez) | Entre 9M y 79M según variante | No disponible | Ajedrez, predicción de movimientos humanos | No disponible | Repositorios públicos de investigación |

La comparación de rendimiento entre estos modelos no está disponible: Nebium-Medium no publica métricas y los modelos generalistas no son evaluables en predicción de movimientos de ajedrez sin una adaptación previa. La diferencia fundamental es de vocabulario y dominio: Nebium sustituye la tokenización de texto por un vocabulario cerrado de 5000 plies UCI, mientras que GPT-2 medium y Pythia-410M manejan texto natural y no tienen representación nativa del estado de un tablero.

## Limitaciones y advertencias

- Sesgo de dominio: el modelo se entrena sobre partidas de Lichess, por lo que reproduce la distribución de estilos, niveles y ritmos de juego de esa plataforma, no un juego de fuerza de motor.
- Riesgo de movimientos ilegales: el modelo genera secuencias de tokens UCI sin ningún validador de reglas incorporado. Nada garantiza que los movimientos generados sean legales en la posición dada, por lo que cualquier uso práctico exige un filtro externo de legalidad.
- Alucinación estructural: al ser un modelo autorregresivo sobre un vocabulario simbólico, puede producir secuencias sintácticamente válidas en UCI pero incoherentes con el estado del tablero.
- Límite de contexto: 1024 plies, suficiente para partidas completas pero insuficiente para analizar múltiples partidas encadenadas o variantes extensas sin truncar.
- Idioma: la etiqueta "en" es engañosa; el modelo no está entrenado para conversar ni para generar texto en inglés ni en ningún otro idioma natural.
- Ausencia de instrucciones: no hay evidencia de ajuste por instrucciones, RLHF o DPO, por lo que no debe esperarse comportamiento de asistente ni seguimiento de órdenes en lenguaje natural.
- Sin benchmarks verificables: no se publican métricas de precisión, perplejidad ni comparaciones con motores de ajedrez, lo que impide estimar su calidad real antes de desplegarlo.
- Trazabilidad del entrenamiento: el autor cita un presupuesto de 6.9 mil millones de tokens como objetivo óptimo según Chinchilla, pero no confirma el cómputo efectivamente realizado ni la composición final del dataset.
- Licencia: MIT, permisiva y compatible con uso comercial y modificación, siempre que se conserve el aviso de copyright y la atribución correspondiente.
- Madurez: el repositorio muestra 0 descargas y 0 likes en el momento de la consulta, y las fechas de creación y actualización son del mismo día. Se trata de una publicación reciente y sin validación comunitaria.
- Integración: al no seguir la interfaz estándar de transformers, requiere el código fuente del proyecto (github.com/nabin2004/nebium) para cargar model.pt, lo que añade dependencia de la API interna del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nabin2004/nebium-medium
- Repositorio GGUF companion: https://huggingface.co/nabin2004/nebium-medium-gguf
- Código fuente del framework: https://github.com/nabin2004/nebium
- Dataset de entrenamiento: https://huggingface.co/datasets/nabin2004/nebium-lichess-uci
- Referencia de leyes de escala citada: Hoffmann et al., "Training Compute-Optimal Large Language Models" (2022)
- Cita bibliográfica del autor: Oli, Nabin. "Nebium-Medium: Causal Transformer for Next-Move Prediction in Chess", Hugging Face Model Hub, 2026.
