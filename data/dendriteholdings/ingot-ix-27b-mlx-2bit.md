# dendriteholdings/Ingot-IX-27B-MLX-2bit

## Resumen

Ingot-IX-27B-MLX-2bit es un modelo de lenguaje de 27.359.638.768 parámetros (27,36 mil millones) cuantizado a 2 bits en formato ternario, empaquetado para Apple Silicon con la librería MLX. No es un modelo entrenado desde cero: es una cuantización del modelo denso Qwen/Qwen3.8-27B, producida por el minero `5FHoQiL4CRLCVEWKX6by9aGExiz7WxRWyBtUJKN5uwyi6iyU` (uid 197) y publicada como espejo por dendriteholdings. El pack es la traducción sin pérdida de los pesos ternarios del envío ganador del subred Bittensor Ingot (SN97), donde los mineros compiten por producir la copia cuantizada que queda más cerca del profesor original.

La relevancia del modelo es doble. Por un lado, demuestra que un modelo de 27B puede reducirse a 8,60 GB de pesos (2,25 bits por peso efectivos, con códigos ternarios y una escala fp16 más un sesgo por cada bloque de 128 pesos) manteniendo una divergencia medible pero acotada respecto al profesor en BF16: KL de 0,10294 por token de respuesta. Por otro, es un caso poco habitual de cuantización evaluada de forma explícita contra su profesor, con métricas de divergencia publicadas en lugar de solo benchmarks de tarea.

El resultado es un artefacto pensado para inferencia local en hardware Apple Silicon: decodifica a 55,3 tokens por segundo en modo simple y 66,6 en modo especulativo sobre un Mac Studio M3 Ultra. La torre de visión, la configuración, el tokenizador y los vectores de signo de Hadamard proceden de prism-ml/Ternary-Bonsai-2-27B-mlx-2bit, no del minero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen/Qwen3.8-27B); detalles de atención y capas no disponibles |
| Parametros totales | 27.359.638.768 (27,36 B) |
| Parametros activos | No aplica: no se documenta arquitectura MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Ternaria de 2 bits en formato afín MLX: códigos ternarios con escala `d` y sesgo `−d` en fp16 por bloque de 128 pesos; 2,25 bits por peso efectivos |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (MLX, layout `prism_hadamard_qwen35`), 8,60 GB; existe un gemelo GGUF en dendriteholdings/Ingot-IX-27B-Q2 |

## Arquitectura y entrenamiento

La arquitectura de partida es la del modelo profesor Qwen/Qwen3.8-27B, un transformer denso de 27,36 mil millones de parámetros. Sobre esa base no hay reentrenamiento: el proceso es de compresión post-entrenamiento. Cada bloque de 128 pesos se representa mediante códigos ternarios más una escala fp16 y un sesgo igual a la escala negativa, de modo que cada peso decodifica exactamente al mismo valor que usa el kernel GGUF del envío original. El empaquetado incluye además vectores de signo de Hadamard, que aplican una rotación ortogonal antes de la cuantización para repartir mejor la energía de los pesos y reducir el error de redondeo en un esquema de 2 bits.

La selección de los pesos no vino de un proceso de destilación clásico con datos, sino de una competición: Ingot (Bittensor SN97) fija un modelo profesor y los mineros presentan cuantizaciones; el validador corona la copia cuya distribución de siguiente token queda más próxima a la del profesor en BF16. Este pack concreto fue coronado a partir del envío `2c80dc33-ca61-494d-bda3-46bcd3642fb0` y superó al rey anterior, con una mejora del 20,1 % en KL y del 29,4 % en distancia de estados ocultos frente a la cuantización génesis del mismo subred. No se documentan volúmenes de tokens de entrenamiento, composición de dataset ni fases de RLHF o DPO, porque no las hay: el modelo hereda el alineamiento del profesor y solo cambia la precisión numérica de sus pesos.

## Capacidades

- Generación de texto y conversación multiturno, heredadas del profesor Qwen/Qwen3.8-27B.
- Razonamiento y matemáticas: capacidad preservada del modelo base, aunque degradada de forma medible por la cuantización (KL 0,10294 por token frente al profesor).
- Generación de código: el modelo se ha evaluado en la propia model card con un prompt de código para medir velocidad de decodificación.
- Capacidades multimodales: el pack incorpora una torre de visión procedente de prism-ml/Ternary-Bonsai-2-27B-mlx-2bit, lo que implica soporte de entrada de imágenes; el alcance exacto no está documentado.
- Tool calling y function calling: no documentado explícitamente en la información disponible.
- Comportamiento agéntico y razonamiento multi-paso: no documentado explícitamente.
- Decodificación especulativa: soportada mediante la cabeza de borrador multi-token de MTPLX (`--generation-mode mtp --depth 1`).
- Multilingüismo: no disponible; los idiomas no están declarados en la model card.

## Casos de uso

- Inferencia local en portátiles y equipos de sobremesa Apple Silicon: con 8,60 GB de pesos, el modelo cabe en configuraciones de memoria unificada moderadas, lo que permite disponer de un 27B cuantizado en un Mac sin GPU dedicada, usando `mlx-lm` como runtime mínimo.
- Asistentes de código en estación de trabajo: la model card mide el rendimiento con prompts de código (256 tokens generados sobre HTTP) y el modelo soporta decodificación especulativa, lo que lo hace apto para autocompletado y explicación de código en local sin enviar el repositorio a un servicio externo.
- Procesamiento por lotes sensible a la privacidad: al ejecutarse íntegramente en local, encaja en flujos de resumen y extracción de información sobre documentación interna que no puede salir de la organización.
- Nodo de validación o experimentación en Ingot / Bittensor: el pack sirve como referencia reproducible del estado del arte de cuantización ternaria en formato MLX para comparar envíos futuros, dado que todos los reyes q2 comparten el mismo layout y tamaño.
- Investigación sobre cuantización extrema: con métricas de KL y distancia de estados ocultos publicadas frente al profesor, es un sujeto de estudio directo para analizar la degradación de un 27B a 2,25 bits por peso.
- Prototipado rápido de aplicaciones conversacionales en macOS: el tiempo de puesta en marcha es de un `pip install mlx-lm` más una llamada a `mlx_lm.generate`, sin necesidad de servidores de inferencia ni contenedores.
- Evaluación comparativa de kernels: al existir un gemelo GGUF con los mismos pesos, permite contrastar el rendimiento de MLX frente al fork de llama.cpp de Dendrite sobre el mismo hardware.

## Benchmarks y rendimiento

Divergencia respecto al profesor en BF16, medida por token de respuesta: KL(profesor ‖ modelo) de la distribución del siguiente token, y distancia de estados ocultos |h − h_profesor| / |h_profesor| promediada cada 8 capas. Menor es mejor.

| Modelo | KL | Distancia de estados ocultos |
|---|---|---|
| Ingot-IX-27B-MLX-2bit (este modelo) | 0,10294 | 0,3201 |
| Rey anterior al que superó | 0,10452 | 0,3264 |
| Ingot-genesis-27B-Q2 (génesis) | 20,1 % peor en KL | 29,4 % peor en distancia |

Velocidad de decodificación, batch 1, Mac Studio M3 Ultra (GPU de 80 núcleos, 512 GB):

| Motor | Modo | tok/s |
|---|---|---|
| Servidor MTPLX 2.12 (mlx 0.32) | simple | 55,3 |
| Servidor MTPLX 2.12 (mlx 0.32) | especulativo (`mtp --depth 1`) | 66,6 |
| mlx-lm 0.31 con kernels ternarios de MTPLX, en proceso | simple | 59,9 |
| Gemelo GGUF en el fork de llama.cpp de Dendrite, mismo Mac | simple | 56,4 |
| Gemelo GGUF en RTX PRO 6000 | simple | 137,0 |

No se han publicado resultados de benchmarks de tarea (MMLU, HumanEval, GSM8K) en la información disponible. Las cifras de velocidad corresponden al rey IV de Ingot, pero el autor indica que son extrapolables a todos los reyes q2 por compartir layout y tamaño.

## Requisitos de hardware

- VRAM o memoria unificada: 8,60 GB de pesos en safetensors; en la práctica se necesita margen adicional para el grafo de inferencia, la caché KV y la torre de visión, por lo que un equipo con 16 GB de memoria unificada es el mínimo razonable y 24 GB o más da holgura.
- Hardware objetivo: Apple Silicon. Las cifras publicadas se han medido en un Mac Studio M3 Ultra con GPU de 80 núcleos y 512 GB de memoria unificada.
- GPU dedicadas: el formato MLX no está pensado para CUDA. Para NVIDIA existe el gemelo GGUF de Ingot-IX-27B-Q2, medido a 137 tok/s en una RTX PRO 6000.
- Cabe en GPU de consumo: no hay datos publicados para GPUs de consumo. Para el gemelo GGUF, un modelo de 8,60 GB entra teóricamente en tarjetas de 12 GB o más, pero no se han publicado mediciones al respecto.
- Opciones de despliegue: `mlx-lm` (probado en 0.31 con los kernels ternarios de MTPLX), servidor MTPLX 2.12 sobre mlx 0.32, y para el gemelo GGUF el fork de llama.cpp de DendriteLabs. Compatibilidad con vLLM, TGI u Ollama: no documentada.
- Latencia y throughput: 55,3 tok/s en modo simple y 66,6 tok/s en modo especulativo con servidor MTPLX; 59,9 tok/s en proceso con mlx-lm. La decodificación especulativa aporta en torno a un 20 % adicional sobre el modo simple en el mismo hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Formato / precision | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Ingot-IX-27B-MLX-2bit | 27,36 B | MLX safetensors, 2,25 bits/peso | No disponible | KL 0,10294; 55,3-66,6 tok/s en M3 Ultra | No disponible | HuggingFace, 0 descargas |
| Ingot-IX-27B-Q2 (gemelo GGUF) | 27,36 B | GGUF, 2 bits ternario | No disponible | Mismos pesos; 56,4 tok/s en M3 Ultra, 137 tok/s en RTX PRO 6000 | No disponible | HuggingFace |
| Ingot-genesis-27B-Q2 | 27 B aprox. | GGUF, 2 bits | No disponible | 20,1 % peor en KL y 29,4 % peor en distancia de estados ocultos que este modelo | No disponible | HuggingFace |
| prism-ml/Ternary-Bonsai-2-27B-mlx-2bit | 27 B aprox. | MLX, 2 bits | No disponible | No disponible | No disponible | HuggingFace |
| Ingot-X-27B-MLX-2bit | 27 B | MLX, 2 bits | No disponible | No disponible | No disponible | HuggingFace |

Las alternativas comparables son todas del mismo ecosistema (Ingot / Prism) y comparten tamaño y esquema de cuantización, porque el subred fija el profesor y el formato. La comparación frente a cuantizaciones de 4 u 8 bits del mismo Qwen/Qwen3.8-27B no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Licencia no declarada. Sin licencia explícita no se puede asumir permiso de uso comercial; además, la licencia del modelo profesor (Qwen/Qwen3.8-27B) también figura como no disponible, así que la cadena de derechos no está resuelta.
- Divergencia real frente al profesor: un KL de 0,10294 por token no es despreciable. En tareas de razonamiento largo o generación de código con requisitos estrictos de sintaxis, el error de cuantización puede acumularse.
- Riesgo de alucinación heredado y amplificado: el modelo conserva los sesgos y las alucinaciones del profesor y añade el error propio de una representación ternaria, que afecta especialmente a hechos raros y a tokens de baja frecuencia.
- Idiomas no declarados: no hay garantía documentada de cobertura multilingüe ni de calidad fuera del inglés.
- Longitud de contexto desconocida: no se puede planificar un caso de uso con ventanas largas sin verificarla empíricamente.
- Validación comunitaria nula: 0 descargas y 0 likes en el momento del registro. Es un artefacto de competición, no un modelo contrastado por la comunidad.
- Trazabilidad peculiar: los pesos son del minero, pero la torre de visión, el config, el tokenizador y los vectores de Hadamard son de Prism. Cualquier auditoría debe revisar ambas procedencias.
- Dependencia de tooling específico: requiere runtimes que lean el layout `prism_hadamard_qwen35` (MTPLX o el fork de llama.cpp de Prism para el GGUF). No es un safetensors estándar que cargue en transformers sin más.
- Portabilidad limitada: la versión MLX está atada a Apple Silicon; en NVIDIA hay que usar el gemelo GGUF, con otro motor y otro perfil de rendimiento.
- Nombre del modelo base no verificable de forma independiente: Qwen/Qwen3.8-27B aparece solo como referencia en la model card; no se aportan enlaces al modelo original ni a su ficha técnica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dendriteholdings/Ingot-IX-27B-MLX-2bit
- Gemelo GGUF: https://huggingface.co/dendriteholdings/Ingot-IX-27B-Q2
- Cuantización génesis de referencia: https://huggingface.co/dendriteholdings/Ingot-genesis-27B-Q2
- Otro rey de la familia: https://huggingface.co/dendriteholdings/Ingot-X-27B-MLX-2bit
- Origen de torre de visión, config y tokenizador: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-mlx-2bit
- Ficha forense del modelo de Prism en Ingot: https://ingot.tools/models/prism-ml/Ternary-Bonsai-27B-mlx-2bit
- Fork de llama.cpp de DendriteLabs: https://github.com/DendriteLabs/llama.cpp
- Cuenta del subred Ingot en X: https://x.com/IngotSubnet
- Registro de terceros del gemelo GGUF: https://free2aitools.com/model/dendriteholdings/ingot-ix-27b-q2
