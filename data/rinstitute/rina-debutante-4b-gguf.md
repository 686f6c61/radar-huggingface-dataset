# Rinstitute/Rina-Debutante-4B-GGUF

## Resumen

Rina Debutante 4B es un modelo de lenguaje de 4.205.751.296 parámetros (aproximadamente 4,21B) desarrollado por Rinstitute como un ajuste fino (SFT más aprendizaje por refuerzo) del modelo Ternary Bonsai 2 4B de Prism ML, que a su vez deriva de Qwen3.5-4B. Su rasgo definitorio es que mantiene en todo el proceso de entrenamiento el formato ternario de pesos {−1, 0, +1}, lo que permite almacenar el modelo completo en un único archivo GGUF de 1,15 GB (empaquetado PQ2_0) y ejecutarlo en llama.cpp mediante el fork de PrismML. Está orientado a conversación en chino y japonés, con soporte adicional de inglés, y solo acepta entrada de texto.

El modelo resuelve dos problemas concretos: por un lado, ofrece inferencia en dispositivo (*on-device*) con un consumo de almacenamiento y memoria muy reducido gracias a la cuantización ternaria; por otro, corrige el comportamiento de identidad del modelo base, que se presentaba como Qwen, y mejora la calidad de las respuestas en japonés. Según la model card, sin system prompt se identifica como Rina en el 96,2 % de las preguntas de identidad y describe correctamente su linaje en el 98,5 % de los casos.

Es relevante ahora porque demuestra que es viable aplicar ajuste fino supervisado y RL sobre pesos ternarios sin degradar de forma significativa los benchmarks del modelo original: las diferencias en IFEval, GSM8K y sondas de conocimiento se mantienen dentro de aproximadamente 1,3 puntos. La arquitectura es de atención híbrida con 24 capas de atención lineal y 8 de atención completa, 32 bloques, dimensión oculta de 2560 y embedding y cabeza LM compartidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de atención híbrida: 24 capas de atención lineal y 8 de atención completa, MLP SwiGLU, RoPE, RMSNorm, 32 bloques, dimensión oculta 2560, embedding y LM head compartidos |
| Parametros totales | 4.205.751.296 (aproximadamente 4,21B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | La arquitectura hereda 262K tokens; el entrenamiento usó secuencias de como máximo 16K tokens y contextos mayores no han sido probados |
| Tipos de cuantizacion | Pesos ternarios {−1, 0, +1} con escalas grupales FP16 (una por cada 128 pesos), empaquetados como PQ2_0, PTQ1_0 y Q2_0 en la base rotada de Hadamard de Bonsai |
| Idiomas soportados | Chino y japonés (foco principal), inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (tres variantes: PQ2_0, PTQ1_0 y Q2_0) |

## Arquitectura y entrenamiento

El modelo conserva sin cambios la arquitectura de Ternary Bonsai 2 4B: un transformer de 32 bloques con atención híbrida que combina 24 capas de atención lineal con 8 capas de atención completa, MLP SwiGLU, RoPE y RMSNorm. Los pesos se mantienen en formato ternario {−1, 0, +1} con escalas grupales FP16 (una escala por cada 128 pesos), empaquetados como PQ2_0 en la base rotada de Hadamard de Bonsai. Solo el 0,31 % de los valores ternarios difieren respecto al modelo base tras el ajuste.

El entrenamiento consistió en SFT seguido de aprendizaje por refuerzo, manteniendo el formato ternario en todas las etapas. Los conjuntos de datos declarados en la model card son openai/gsm8k, EleutherAI/hendrycks_math, AI-MO/NuminaMath-1.5, nvidia/OpenMathReasoning, yamaTK/japanese-math-synthetic-108k, math-eval/TAL-SCQ5K y bigcode/self-oss-instruct-sc2-exec-filter-50k, lo que indica un sesgo claro hacia matemáticas y código, complementado con datos sintéticos de matemáticas en japonés. El entrenamiento usó secuencias de hasta 16K tokens, aunque la arquitectura hereda una ventana de 262K. El modo de razonamiento (``) está activado por defecto y puede desactivarse por petición.

## Capacidades

- Generación de texto conversacional en chino, japonés e inglés, con foco declarado en chino y japonés.
- Razonamiento matemático, apoyado en los datasets de matemáticas y matemáticas sintéticas en japonés usados en el ajuste.
- Generación de código, a partir del dataset bigcode/self-oss-instruct-sc2-exec-filter-50k.
- Modo de razonamiento explícito (``) activado por defecto y desactivable por petición.
- Soporte de *tool calling* / *function calling*: la model card reporta resultados de BFCL v3, con una puntuación global ligeramente superior al modelo base, aunque el uso de herramientas multi-turno es claramente más débil (−5,4 puntos).
- Identidad propia consistente: se presenta como Rina en el 96,2 % de las preguntas de identidad y describe su linaje correctamente en el 98,5 % de los casos.
- Entrada exclusivamente de texto: el proyector de visión (mmproj) de Bonsai 2 no es compatible con estos pesos.
- Capacidades multilingües limitadas a chino, japonés e inglés.

## Casos de uso

- Asistentes conversacionales en japonés y chino en dispositivo: el modelo cabe en un archivo de 1,15 GB (PQ2_0) y se ejecuta en llama.cpp, por lo que puede desplegarse en portátiles o equipos de gama media sin GPU dedicada para conversaciones multi-turno en esos idiomas.
- Chat de atención al cliente en japonés: la evaluación ciega por pares sobre 300 prompts de chat en chino y japonés reporta una tasa de victoria del 58,3 % frente al modelo base en japonés, lo que lo hace adecuado para respuestas conversacionales donde la naturalidad del idioma importa.
- Tutoría de matemáticas en japonés: los datos de entrenamiento incluyen yamaTK/japanese-math-synthetic-108k y conjuntos de matemáticas como GSM8K, Hendrycks MATH, NuminaMath-1.5 y OpenMathReasoning, lo que permite resolver y explicar problemas paso a paso con el modo de razonamiento activado.
- Generación de código asistida en entornos con recursos limitados: el ajuste incluye bigcode/self-oss-instruct-sc2-exec-filter-50k, y el tamaño del archivo permite integrarlo en editores o herramientas locales sin depender de la nube.
- Sustitución del modelo base en pipelines existentes de llama.cpp: los tres archivos GGUF conservan el mismo template de chat y el mismo layout de tensores que Bonsai 2 4B, por lo que se puede cambiar el modelo sin modificar la integración.
- Experimentación e investigación en cuantización ternaria: al mantener los pesos en {−1, 0, +1} durante todo el entrenamiento y publicar tres empaquetados distintos (PQ2_0, PTQ1_0, Q2_0) con los mismos pesos, sirve como banco de pruebas para estudiar el impacto del formato de almacenamiento en velocidad y calidad.
- Despliegue con *tool calling* en flujos de un solo turno: dado que BFCL v3 global es ligeramente superior al modelo base, es viable para llamadas a funciones aisladas, evitando escenarios que requieran herramientas multi-turno.

## Benchmarks y rendimiento

La model card no presenta una tabla numérica completa de benchmarks, pero sí compara cualitativamente con el modelo base Ternary Bonsai 2 4B:

| Benchmark | Diferencia frente a Bonsai 2 4B |
|---|---|
| IFEval | Dentro de aproximadamente 1,3 puntos |
| GSM8K | Dentro de aproximadamente 1,3 puntos |
| Sondas de conocimiento | Dentro de aproximadamente 1,3 puntos |
| BFCL v3 (global) | Ligeramente superior |
| IFBench | −3,3 puntos (no estadísticamente significativo) |
| BFCL v3 (herramientas multi-turno) | −5,4 puntos |

Evaluación ciega por pares sobre 300 prompts de chat en chino y japonés (juez: Gemini 4 Hydrogen, sobre el checkpoint previo al parche final de identidad):

| Idioma | Tasa de victoria frente a Bonsai 2 4B |
|---|---|
| Japonés | 58,3 % |
| Chino | 47,0 % (empate) |

No se han publicado resultados absolutos de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el archivo más pequeño (PTQ1_0) ocupa 950 MB y el mayor (Q2_0) 1.212 MB, por lo que el peso de los pesos es inferior a 1,3 GB y el consumo adicional corresponde a la caché KV y al contexto.
- GPU recomendadas: no disponibles; la model card solo indica que en CUDA los tres archivos dieron resultados idénticos en la comprobación numérica.
- Cabe en GPU de consumo: sí, por el tamaño del archivo (inferior a 1,3 GB en los tres empaquetados); no se especifican modelos concretos de GPU.
- Opciones de despliegue: llama.cpp mediante el fork de PrismML; según Prism ML, el empaquetado Q2_0 también puede ejecutarse con llama.cpp upstream reciente, aunque Rinstitute solo lo ha probado con el fork.
- Latencia y throughput: no medidos para este modelo. Las notas de velocidad de la model card provienen del modelo Rina Juvenile Exp de 2B: en CPU, PQ2_0 fue el más rápido de los tres empaquetados; en GPU, PTQ1_0 fue el más rápido en generación pero aproximadamente 6 veces más lento que PQ2_0 en CPU; Q2_0 fue el más lento en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Rina Debutante 4B | ~4,21B | 262K heredados; entrenado hasta 16K | GGUF ternario (PQ2_0, PTQ1_0, Q2_0) | Apache 2.0 | Ajuste fino de Bonsai 2 4B; foco en chino y japonés |
| Ternary Bonsai 2 4B (Prism ML) | ~4,21B | 262K | GGUF ternario | No disponible en la información | Modelo base; se identifica como Qwen; incluye proyector de visión (mmproj) |
| Qwen3.5-4B | No disponible en la información | No disponible en la información | No disponible en la información | No disponible en la información | Modelo del que deriva Bonsai 2 4B |

No se dispone de datos de benchmarks absolutos ni de especificaciones completas de los modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- El chino sigue presentando errores gramaticales, palabras inventadas, calcos de traducción y fabricación de hechos, según la propia model card.
- Riesgo de alucinación: la model card advierte explícitamente de que el modelo inventa hechos.
- El uso de herramientas multi-turno es claramente más débil que en el modelo base (−5,4 puntos en BFCL v3).
- IFBench es 3,3 puntos inferior al modelo base, aunque la diferencia no se considera estadísticamente significativa.
- La longitud de razonamiento en problemas matemáticos es aproximadamente la mitad que la del modelo base.
- El contexto entrenado es de 16K tokens como máximo, pese a que la arquitectura hereda 262K; los contextos más largos no han sido probados.
- Solo admite entrada de texto: el proyector de visión de Bonsai 2 no es compatible con estos pesos.
- Cobertura lingüística limitada a chino, japonés e inglés.
- Licencia Apache 2.0, que permite uso comercial; no se indican restricciones adicionales en la información disponible.
- El despliegue recomendado requiere el fork de PrismML de llama.cpp; solo el empaquetado Q2_0 tiene indicios de funcionar con llama.cpp upstream reciente, y no ha sido probado por el autor con ese empaquetado.
- No se han medido latencia ni throughput para este modelo concreto; las cifras de velocidad citadas corresponden al modelo de 2B.

## Enlaces

- Hugging Face: https://huggingface.co/Rinstitute/Rina-Debutante-4B-GGUF
- Modelo base Ternary Bonsai 2 4B (Prism ML): https://huggingface.co/prism-ml/Ternary-Bonsai-2-4B-gguf
- Modelo original Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
