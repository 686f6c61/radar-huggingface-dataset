# dendriteholdings/Ingot-VII-27B-MLX-2bit

## Resumen

Ingot-VII-27B-MLX-2bit es un modelo de generación de texto de 27.359.638.768 parámetros (27,36 B) publicado por Dendrite Holdings en formato MLX para Apple Silicon, con pesos ternarios cuantizados a 2 bits (2,25 bits por peso). No es un modelo entrenado desde cero: es el paquete MLX de `dendriteholdings/Ingot-VII-27B-Q2`, un ajuste fino de `prism-ml/Ternary-Bonsai-2-27B-mlx-2bit` que conserva los códigos ternarios del modelo base pero reajusta las escalas por bloque y los pesos de normalización para acercarse más al profesor BF16 Qwen3.8-27B.

El modelo nace de una competición en la subred Ingot de Bittensor, donde los mineros cuantizan un profesor fijo y el validador corona la copia que queda más próxima a él. Esta versión concreta fue la ganadora (uid 187, envío `e7360cf1-719e-4c5c-a8a7-5de3d51a5ac1`) y se publica como espejo público: cada bloque de 128 pesos mantiene sus códigos ternarios y su escala fp16 como valores afines de 2 bits de MLX (escala d, sesgo −d), de modo que cada peso decodifica al mismo número que usa el kernel GGUF.

Su relevancia es doble: por un lado demuestra que una cuantización ternaria de 2 bits puede acercarse al profesor BF16 mejor que la versión anterior (KL de 0,10548 frente a 0,10738), y por otro documenta rendimiento real de decodificación en Apple Silicon (55,3 tok/s en modo simple y 66,6 tok/s con decodificación especulativa en un Mac Studio M3 Ultra). La ficha del autor no incluye datos de contexto, idiomas ni licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.5, layout `prism_hadamard_qwen35` con rotación de Hadamard), cuantizado en ternario; incluye torre de visión heredada del modelo base |
| Parametros totales | 27.359.638.768 (27,36 B) |
| Parametros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 2 bits ternario en formato afín MLX (2,25 bits por peso: códigos de 2 bits + escala fp16 y sesgo por cada 128 pesos); existe gemelo GGUF Q2 |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | `safetensors` (MLX, un único archivo `model.safetensors` de 8,60 GB); gemelo en GGUF en el repositorio Q2 |
| Libreria / runtime | `mlx`, `mlx-lm`; kernels ternarios compatibles con MTPLX y con el fork de llama.cpp de Dendrite |
| Tamano del repositorio | 8,6 GB |
| Fecha de publicacion | 2026-10-28 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Prism ML Ternary Bonsai 2 27B, un transformer denso de la familia Qwen3.5 (el tag del layout es `prism_hadamard_qwen35`) que aplica una rotación de Hadamard antes de la cuantización para repartir la energía de los pesos y reducir el error de redondeo. Sobre esa base, el minero no reentrena: conserva los códigos ternarios y reajusta las escalas por bloque y los pesos de normalización, con el objetivo explícito de minimizar la divergencia respecto al profesor BF16 Qwen3.8-27B. El resultado se empaqueta como valores afines de 2 bits de MLX, con una escala y un sesgo fp16 por cada bloque de 128 pesos, de forma que la decodificación coincide con la del kernel GGUF equivalente.

No hay información pública sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; el proceso descrito es exclusivamente de cuantización y refinamiento de escalas, no de alineamiento. La innovación técnica destacable es el bucle de evaluación de la subred Ingot: cada envío se mide contra el profesor con la divergencia KL de las distribuciones del siguiente token (por token de respuesta) y con la distancia de estados ocultos relativa, promediada cada 8 capas. El modelo ganador obtuvo KL 0,10548 y distancia 0,3297, frente a KL 0,10738 y 0,3349 del rey al que destronó. La torre de visión, la configuración, el tokenizador y los vectores de signo de Hadamard provienen intactos de Prism ML.

## Capacidades

- Generación de texto conversacional y continuaciones de prompt en formato chat, según el pipeline declarado (`text-generation`, `conversational`).
- Razonamiento y generación de código: el autor reporta velocidades medidas sobre un prompt de código, lo que indica uso previsto en ese dominio.
- Decodificación especulativa mediante la cabeza de borrador multi-token de MTPLX (`--generation-mode mtp --depth 1`), que eleva el rendimiento de 55,3 a 66,6 tok/s.
- Torre de visión presente en el paquete (heredada de Prism ML); no se documenta en la model card si está activa ni con qué precisión opera tras la cuantización.
- Soporte multilingüe: no disponible.
- Tool calling / function calling: no disponible (no se menciona en la model card).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se documenta).
- Modo "thinking" o razonamiento extendido: no disponible.

## Casos de uso

- Inferencia local en Mac con memoria unificada: el paquete de 8,60 GB se carga con `mlx-lm` y permite servir un modelo de 27 B en un equipo de sobremesa Apple Silicon, con 55-67 tok/s de decodificación medidos en un M3 Ultra.
- Generación de código asistida en estación de trabajo: con ~60 tok/s en proceso y decodificación especulativa disponible, es viable para autocompletado y generación de funciones en un IDE local sin depender de la nube.
- Evaluación de técnicas de cuantización: sirve como referencia reproducible para comparar ternario de 2 bits frente a BF16 usando las métricas KL y distancia de estados ocultos que publica el autor.
- Investigación sobre competiciones descentralizadas: el par (modelo, métricas frente al profesor) permite estudiar cómo se comporta la selección por proximidad al profesor en subredes Bittensor.
- Prototipado de pipelines de agentes con decodificación especulativa: el soporte de MTPLX con cabeza de borrador multi-token permite medir la ganancia de throughput antes de invertir en infraestructura mayor.
- Despliegue en entornos con restricciones de memoria: 2,25 bits por peso reducen un modelo de 27 B a menos de 9 GB, lo que habilita pruebas en portátiles Apple Silicon de gama alta con cuantización agresiva.
- Servicio HTTP ligero: el servidor de MTPLX 2.12 ofrece 66,6 tok/s con 256 tokens generados sobre HTTP, suficiente para demos interactivas y entornos de evaluación internos.

## Benchmarks y rendimiento

El autor no publica benchmarks de tareas estándar (MMLU, HumanEval, GSM8K). Solo se documentan métricas de fidelidad frente al profesor BF16 y velocidades de decodificación.

| Metrica (frente al profesor BF16) | Este modelo | El "rey" al que superó |
|---|---|---|
| KL(profesor ‖ modelo), por token de respuesta | 0,10548 | 0,10738 |
| Distancia de estados ocultos relativa (media cada 8 capas) | 0,3297 | 0,3349 |

| Motor | Modo | Decodificacion (tok/s) |
|---|---|---|
| MTPLX 2.12 (mlx 0.32), servidor | simple | 55,3 |
| MTPLX 2.12 (mlx 0.32), servidor | especulativo (`--depth 1`) | 66,6 |
| mlx-lm 0.31 con kernels ternarios de MTPLX, en proceso | simple | 59,9 |
| Gemelo GGUF en fork de llama.cpp de Dendrite, mismo Mac | simple | 56,4 |
| Gemelo GGUF en RTX PRO 6000 | simple | 137 |

Mediciones en Mac Studio M3 Ultra (GPU de 80 núcleos, 512 GB), batch 1. Las cifras de servidor corresponden a 256 tokens generados sobre un prompt de código vía HTTP; las cifras en proceso, a 128 tokens sin servidor.

## Requisitos de hardware

- Pesos: 8,60 GB en un único `safetensors` (2,25 bits por peso). Estimación propia: contando escalas, sesgos, torre de visión, tokenizador y caché KV, el consumo en ejecución se sitúa por encima de los 9-10 GB, y más con contextos largos.
- Memoria: el modelo está empaquetado para memoria unificada de Apple Silicon; el autor solo documenta ejecución en un Mac Studio M3 Ultra con 512 GB, por lo que no hay cifras publicadas para configuraciones menores.
- GPU recomendadas: Apple Silicon (serie M3 Ultra documentada). El gemelo GGUF se ha medido en una RTX PRO 6000 (137 tok/s) mediante el fork de llama.cpp de Dendrite; en GPUs consumer NVIDIA no hay datos.
- Cabe en GPU consumer: no hay datos publicados. El gemelo GGUF Q2 en teoría podría caber en GPUs de 12-16 GB de VRAM por tamaño de pesos, pero es una estimación no confirmada por el autor.
- Opciones de despliegue: `mlx-lm` (`mlx_lm.generate`), servidor MTPLX 2.12 sobre mlx 0.32 con modo especulativo; para el gemelo GGUF, el fork de llama.cpp de DendriteLabs. No se documenta soporte de vLLM, TGI ni Ollama.
- Latencia y throughput: 55,3 tok/s (simple) y 66,6 tok/s (especulativo) en servidor MTPLX; 59,9 tok/s en proceso con mlx-lm 0.31 y kernels de MTPLX; 56,4 tok/s para el GGUF en el mismo Mac y 137 tok/s en RTX PRO 6000.

## Comparativa con modelos similares

| Modelo | Parametros | Formato / bits por peso | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Ingot-VII-27B-MLX-2bit (este) | 27,36 B | MLX safetensors, 2,25 bpw | No disponible | No disponible | KL 0,10548; 55,3-66,6 tok/s en M3 Ultra |
| dendriteholdings/Ingot-VII-27B-Q2 | 27,36 B (mismos pesos) | GGUF, 2 bits ternario | No disponible | No disponible | Gemelo del anterior; 56,4 tok/s en M3 Ultra, 137 tok/s en RTX PRO 6000 |
| dendriteholdings/Ingot-V-27B-MLX-2bit | 27 B (aprox., según nombre) | MLX, 2 bits | No disponible | No disponible | Generación anterior de la serie; sin métricas publicadas en la información disponible |
| prism-ml/Ternary-Bonsai-2-27B-mlx-2bit | 27 B (aprox.) | MLX, 2 bits ternario | No disponible | No disponible | Modelo base de Prism ML; aporta torre de visión, config, tokenizador y vectores de Hadamard |
| prism-ml/Ternary-Bonsai-2-27B-gguf | 27 B (aprox.) | GGUF, ternario | No disponible | No disponible | Versión GGUF del base, referenciada por el autor |

No se dispone de comparaciones con modelos de la misma categoría fuera del ecosistema Ingot/Prism (por ejemplo, otras cuantizaciones de 27 B), por lo que la comparativa se limita a las variantes de la propia familia.

## Limitaciones y advertencias

- Es una cuantización, no un modelo entrenado: el conocimiento y los posibles sesgos proceden del profesor Qwen3.8-27B y del base Ternary Bonsai 2; no ha habido un proceso de alineamiento específico documentado.
- Riesgo de alucinación incrementado por la cuantización ternaria: el autor mide KL 0,10548 frente al profesor BF16, es decir, la distribución del siguiente token se desvía de forma medible, con una distancia de estados ocultos del 33 % en la media cada 8 capas.
- Licencia no disponible: no se puede determinar si el uso comercial está permitido. Es un bloqueo potencial para producción; hay que contactar con el autor o consultar la licencia del modelo base de Prism ML.
- Idiomas soportados no documentados; no hay garantía de calidad fuera del inglés.
- Longitud de contexto no publicada: no se puede planificar el tamaño de la caché KV ni el uso en conversaciones de contexto largo sin medirlo.
- Solo se ha validado en Apple Silicon con `mlx` y en el fork de llama.cpp de Dendrite para el GGUF; no hay soporte documentado en vLLM, TGI u Ollama.
- La torre de visión se hereda del modelo base pero no se documenta su estado ni su precisión tras la cuantización; no asumir capacidades multimodales sin verificación.
- Procedencia de competición: el modelo ganó una evaluación de proximidad al profesor (KL y distancia de estados ocultos), no benchmarks de tareas; un KL bajo no implica buen rendimiento en razonamiento, código o matemáticas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema y validación externa muy limitados.
- El nombre del modelo base incluye "Bonsai 2" y el autor menciona Qwen3.8-27B como profesor; conviene verificar la genealogía exacta en el repositorio de Prism ML antes de asumir compatibilidad con la familia Qwen.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dendriteholdings/Ingot-VII-27B-MLX-2bit
- Gemelo GGUF: https://huggingface.co/dendriteholdings/Ingot-VII-27B-Q2
- Generación anterior: https://huggingface.co/dendriteholdings/Ingot-V-27B-MLX-2bit
- Modelo base MLX (Prism ML): https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-mlx-2bit
- Modelo base GGUF (Prism ML): https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Fork de llama.cpp de Dendrite Labs: https://github.com/DendriteLabs/llama.cpp
