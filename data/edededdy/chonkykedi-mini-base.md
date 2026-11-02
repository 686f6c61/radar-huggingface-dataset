# edededdy/ChonkyKedi-mini-base

## Resumen

ChonkyKedi-mini-base es un modelo de lenguaje de tipo decoder-only, estilo Llama, entrenado desde cero por el autor independiente edededdy. Con 72,6 millones de parámetros totales (51,6 millones excluyendo la tabla de embeddings), se posiciona como un artefacto educativo y de investigación orientado a estudiar el comportamiento de modelos pequeños con un presupuesto de cómputo muy reducido. Emplea una arquitectura transformer densa con grouped-query attention (10 cabezas de consulta compartiendo 2 cabezas clave/valor), QK-norm, RoPE, SwiGLU y embeddings atados, con una ventana de contexto de 1.024 tokens.

El modelo fue preentrenado en un único pase sobre 4,13 mil millones de tokens procedentes de una mezcla de FineWeb-Edu, Cosmopedia v2, FineWeb, Wikipedia en inglés, FineMath 4+, github-code-clean y SmolTalk, lo que equivale a unos 80 tokens por parámetro no perteneciente a los embeddings. El entrenamiento completo se realizó en una única NVIDIA RTX 4090 durante 6,6 horas a aproximadamente 173.000 tokens por segundo, con un coste estimado de 1,3e18 FLOPs.

Se trata de la variante "mini" de una familia escalable (pico, nano, micro, mini, small, base, medium, large) que comparte arquitectura, tokenizador y pipeline de datos. Es relevante ahora como referencia reproducible para experimentación de bajo coste: permite validar pipelines de entrenamiento, tokenizadores y estrategias de evaluación en hardware de consumo. No obstante, al ser un modelo base sin ajuste de instrucciones, continúa texto pero no sigue órdenes, y el propio autor advierte que conoce pocos hechos y alucina con confianza.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso estilo Llama (`llama_gqa`), pre-norm con RMSNorm (eps 1e-06) |
| Parametros totales | 72.598.656 (72,6 M) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 1.024 tokens (escalado YaRN disponible para contextos mayores) |
| Tipos de cuantizacion | No disponible (el repo solo contiene safetensors en bf16/fp32; no se publican GGUF ni cuantizaciones) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso decoder-only con 12 capas, dimensión oculta de 640 y normalización previa mediante RMSNorm. La atención utiliza grouped-query attention con 10 cabezas de consulta que comparten 2 cabezas clave/valor, dimensión de cabeza de 64 y QK-norm. Las posiciones se codifican con RoPE (θ = 10000), con escalado YaRN disponible para extender el contexto más allá de los 1.024 tokens nativos. La capa feed-forward emplea SwiGLU con 1.728 unidades ocultas, los embeddings de entrada y la cabeza de salida están atados, y la salida aplica un soft-cap de logits a 30 mediante `cap · tanh(logits / cap)`.

El entrenamiento consumió 4,13 mil millones de tokens en un solo pase, con fuentes intercaladas a lo largo de todo el flujo: FineWeb-Edu (55,0 %, 2.271 M tokens), Cosmopedia v2 de SmolLM-Corpus (15,0 %, 619 M), FineWeb (8,0 %, 330 M), Wikipedia en inglés del 1 de noviembre de 2023 (6,0 %, 248 M), FineMath 4+ (7,0 %, 289 M), github-code-clean (5,0 %, 207 M) y SmolTalk (4,0 %, 165 M). Se aplicó descontaminación por solapamiento de 10-gramas y coincidencias exactas de respuestas cortas contra los cinco conjuntos de evaluación. El tokenizador es un BPE a nivel de byte con 32.768 tokens e incluye tokens especiales para chat, razonamiento y llamadas a herramientas. La optimización usó AdamW (β = 0,9 y 0,95, ε = 1e-8), weight decay 0,1 (no aplicado a las normas), recorte de gradiente 1,0 y un scheduler WSD con pico de 2e-3, 1.890 pasos de calentamiento, 51.677 pasos constantes y decaimiento lineal hasta el 10 % del pico en los últimos 9.452 pasos. Se entrenó en bf16 con `torch.compile` durante 63.019 pasos de 65.536 tokens (batch 16 × 1.024 × 4 de acumulación).

## Capacidades

- Generación de texto en inglés: continuación de texto fluida y temáticamente coherente, propia de un modelo base.
- Modelado de lenguaje y perplejidad: útil para experimentos de scaling y validación de pipelines.
- Conocimiento factual limitado: el autor indica explícitamente que conoce pocos hechos y fabrica información con confianza.
- Razonamiento básico y matemáticas elementales: influido por la presencia de FineMath 4+ en el corpus, aunque sin garantías de corrección.
- Código: expuesto a github-code-clean (5 % de la mezcla), suficiente para continuar fragmentos sencillos, no para generación fiable en producción.
- Tokenizador con tokens especiales para chat, razonamiento y tool calling: preparado a nivel de vocabulario, aunque el modelo base no ha sido ajustado para usarlos de forma fiable.
- Soporte de tool calling / function calling: no disponible como capacidad funcional (solo tokens reservados en el tokenizador).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (solo inglés).
- Capacidades especiales: no dispone de visión, audio ni modo de pensamiento.

## Casos de uso

- Investigación sobre scaling laws en modelos pequeños: entrenar y comparar las variantes pico, nano, micro, mini, small, base, medium y large de la familia para estudiar la relación entre parámetros no-embedding y tokens de entrenamiento (80 tokens por parámetro).
- Validación de pipelines de preentrenamiento: usar el modelo como banco de pruebas reproducible (6,6 horas en una RTX 4090) para verificar tokenizadores, mezclas de datos, descontaminación y schedulers antes de escalar.
- Docencia y formación: ilustrar el comportamiento de un modelo base frente a uno ajustado por instrucciones, incluida la tendencia a alucinar, en cursos de NLP.
- Experimentos de evaluación zero-shot: reproducir el arnés de evaluación del autor (`main.py --mode bench`) sobre BLiMP, SciQ, ARC-Easy, PIQA y HellaSwag para estudiar métricas acc frente a acc_norm.
- Generación de texto controlada en dominios educativos: completar fragmentos de texto técnico o divulgativo en inglés, dado el peso de FineWeb-Edu y Cosmopedia en la mezcla.
- Estudio de técnicas de atención eficiente: analizar el efecto de GQA con 10 cabezas de consulta y 2 clave/valor, QK-norm y soft-cap de logits en modelos de escala reducida.
- Base para ajuste fino experimental: punto de partida para probar SFT o DPO a pequeña escala, teniendo en cuenta la limitación de contexto de 1.024 tokens.

## Benchmarks y rendimiento

| Tarea | acc_norm | acc | Ítems | Split | Azar |
|---|---|---|---|---|---|
| BLiMP | 74,5 % ± 0,2 % | 78,3 % | 67.000 | 67 fenómenos | 50 % |
| SciQ | 67,8 % ± 1,0 % | 74,7 % | 2.000 | validación + test | 25 % |
| ARC-Easy | 43,6 % ± 0,9 % | 48,3 % | 2.946 | validación + test | 25 % |
| PIQA | 60,6 % ± 1,1 % | 60,9 % | 1.838 | validación | 50 % |
| HellaSwag | 29,8 % ± 0,5 % | 28,0 % | 10.042 | validación | 25 % |

Métricas de validación: pérdida de validación de 3,129 nats/token y perplejidad de 22,9 sobre la mezcla reservada. La pérdida evolucionó de 5,07 (0,03 B tokens) a 3,13 (4,13 B tokens).

Comparativa con modelos pequeños:

| Métrica | ChonkyKedi-mini-base | Pythia-70M | GPT-2 | Supra-50M |
|---|---|---|---|---|
| Parámetros totales | 72,6 M | 70,4 M | 124,4 M | 51,8 M |
| Parámetros no-embedding | 51,6 M | 18,9 M | 85,1 M | 35,4 M |
| Tokens de entrenamiento | 4,13 B | 300 B (the Pile) | no divulgado (WebText) | 20 B (FineWeb-Edu) |
| BLiMP (acc_norm) | 74,5 % | no disponible | no disponible | no disponible |
| SciQ (acc_norm) | 67,8 % | 55,2 % | 53,2 % | 77,2 % |
| ARC-Easy (acc_norm) | 43,6 % | 35,0 % | 42,0 % | 52,2 % |
| PIQA (acc_norm) | 60,6 % | no disponible | no disponible | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo pesa aproximadamente 0,15 GB en bf16 (72,6 M parámetros × 2 bytes) y alrededor de 0,30 GB en fp32; el repo ocupa 0,6 GB, probablemente por incluir pesos en fp32 y bf16. La inferencia cabe holgadamente en cualquier GPU de consumo moderna.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una RTX 4090 es la referencia usada por el autor para el entrenamiento. Para entrenamiento desde cero, una RTX 4090 completó el preentrenamiento en 6,6 horas.
- Cabe en GPU de consumo: sí, en GTX 1060 6 GB, RTX 3060, RTX 4060, RTX 4090 y similares; también en CPU con llama.cpp.
- Opciones de despliegue: transformers con safetensors (formato publicado); no se publican pesos GGUF, por lo que llama.cpp u Ollama requerirían conversión previa. vLLM y TGI son viables con los pesos safetensors, aunque el contexto de 1.024 tokens limita su utilidad práctica.
- Latencia y throughput estimados: no disponibles para inferencia; el autor reporta ~173.000 tokens/s durante el entrenamiento en una RTX 4090.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ChonkyKedi-mini-base | 72,6 M | 1.024 | Apache 2.0 | HuggingFace | Base, solo inglés, 4,13 B tokens |
| Pythia-70M | 70,4 M | 2.048 | Apache 2.0 | HuggingFace | 300 B tokens (the Pile), suite de ablación de EleutherAI |
| GPT-2 | 124,4 M | 1.024 | MIT | HuggingFace | Pesos y datos de entrenamiento no divulgados |
| Supra-50M | 51,8 M | no disponible | no disponible | HuggingFace | 20 B tokens de FineWeb-Edu, mejor SciQ y ARC-Easy que ChonkyKedi-mini |

## Limitaciones y advertencias

- Modelo base sin ajuste de instrucciones: no sigue órdenes ni mantiene diálogos; solo continúa texto.
- Alucinación elevada: el autor advierte que conoce pocos hechos y fabrica información con confianza; no debe usarse para tareas críticas.
- Contexto muy corto: 1.024 tokens nativos, insuficiente para documentos largos o conversaciones multi-turno extensas sin aplicar YaRN.
- Solo inglés: no se ha entrenado ni evaluado en otros idiomas, incluido el castellano.
- Sesgos: no se documentan evaluaciones de sesgo; al entrenarse sobre web y datos sintéticos, es probable que herede sesgos de esas fuentes.
- Licencia Apache 2.0: permite uso comercial, pero el propio autor desaconseja su uso en producción por la baja fiabilidad factual.
- Sin cuantizaciones publicadas: requiere conversión manual para GGUF u otros formatos.
- Escala reducida: 51,6 M parámetros no-embedding y 4,13 B tokens de entrenamiento; los resultados en HellaSwag (29,8 %) y ARC-Easy (43,6 %) reflejan capacidad limitada de razonamiento.
- Descontaminación: se aplicó contra los conjuntos de evaluación, pero no contra otros benchmarks no reportados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/edededdy/ChonkyKedi-mini-base
- FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- SmolLM-Corpus (Cosmopedia v2): https://huggingface.co/datasets/HuggingFaceTB/smollm-corpus
- FineWeb: https://huggingface.co/datasets/HuggingFaceFW/fineweb
- Wikipedia (inglés, 2023-11-01): https://huggingface.co/datasets/wikimedia/wikipedia
- FineMath: https://huggingface.co/datasets/HuggingFaceTB/finemath
- github-code-clean: https://huggingface.co/datasets/codeparrot/github-code-clean
- SmolTalk: https://huggingface.co/datasets/HuggingFaceTB/smoltalk
- Pythia-70M (comparativa): https://huggingface.co/EleutherAI/pythia-70m
- GPT-2 (comparativa): https://huggingface.co/openai-community/gpt2
- Supra-50M (comparativa): https://huggingface.co/SupraLabs/Supra-50M-Base
