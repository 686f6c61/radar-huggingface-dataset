# dendriteholdings/Ingot-XXXVII-27B-MLX-2bit

## Resumen

Ingot-XXXVII-27B-MLX-2bit es un modelo de lenguaje de 27.359.638.768 parámetros (aproximadamente 27,36 mil millones) distribuido en formato MLX para Apple Silicon, con pesos cuantizados a 2 bits en códigos ternarios. Lo publica el usuario dendriteholdings como espejo público de una submission ganadora en Ingot, un subnet de Bittensor en el que los mineros compiten por producir la cuantización que más se aproxima a un modelo profesor fijo. El modelo deriva de prism-ml/Ternary-Bonsai-2-27B-mlx-2bit, que a su vez es una variante ternaria de un modelo de la familia Qwen 3.8 de 27B, y ha sido reajustado por el minero para acercar sus distribuciones de salida a las del profesor.

La relevancia del modelo es doble. Por un lado, demuestra que es posible comprimir un transformer de 27B a unos 2,25 bits por peso (8,60 GB en un único safetensors) manteniendo una divergencia KL de 0,07766 frente al profesor en BF16, ligeramente mejor que la del rey anterior (0,07926). Por otro, ilustra un ecosistema emergente de cuantización competitiva verificable on-chain, donde la calidad de la compresión se mide con una métrica objetiva y reproducible en lugar de con evaluaciones subjetivas.

El modelo está pensado exclusivamente para inferencia en Apple Silicon mediante la librería MLX y el runtime MTPLX, que implementa el layout propietario `prism_hadamard_qwen35`. No es un modelo de propósito general listo para producción: es una pieza de investigación sobre cuantización extrema y un artefacto de competición. No se dispone de información sobre licencia, idiomas soportados ni datos de entrenamiento más allá de lo indicado en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen 3.8 27B), con layout de cuantización `prism_hadamard_qwen35` |
| Parametros totales | 27.359.638.768 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 2 bits ternarios (códigos de 2 bits con escala fp16 y bias por bloque de 128 pesos; 2,25 bits por peso efectivos) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX affine 2-bit), 8,60 GB en un único archivo |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only de 27B parámetros, presumiblemente con la estructura de la familia Qwen 3.8 (atención con RoPE, SwiGLU y normalización RMSNorm, aunque estos detalles no se confirman en la información disponible). La innovación principal no está en la arquitectura sino en el esquema de cuantización: cada bloque de 128 pesos conserva un código ternario de 2 bits y una escala fp16 con bias −d, de modo que cada peso decodifica exactamente al mismo valor que usa el kernel GGUF del modelo gemelo. El layout `prism_hadamard_qwen35` incorpora vectores de signo de Hadamard para rotar las activaciones antes de la cuantización, una técnica habitual para reducir outliers y mejorar la fidelidad en regímenes de muy baja precisión.

El entrenamiento del modelo original (Ternary Bonsai 2 27B) no está documentado en la información proporcionada. Lo que sí se describe es el proceso de competición: el minero parte de los códigos ternarios de Bonsai 2 y reajusta el resto de pesos (escalas y biases) para minimizar la divergencia KL respecto al profesor en BF16, evaluada token a token sobre las respuestas de cada dominio y ponderada por la proporción de muestras de cada uno. No se menciona RLHF, DPO ni datos de entrenamiento adicionales. La torre de visión, la configuración, el tokenizador y los vectores de signo de Hadamard provienen intactos de Prism ML y no forman parte de la optimización del minero.

## Capacidades

- Generación de texto autoregresiva en modo decoder-only, con decodificación token a token (el repositorio no incluye cabeza MTP, por lo que MTPLX decodifica un token por paso).
- Razonamiento y generación de código: la model card reporta métricas específicas sobre prompts de código (hasta ~90 tok/s con el drafter especulativo DFlash 2).
- Conversación multi-turno: el pipeline declarado es `text-generation` con tag `conversational`.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (thinking mode, visión, audio): la model card menciona una torre de visión heredada de Prism ML, pero no se detalla su funcionamiento ni se confirma que esté operativa en este pack.
- Decodificación especulativa opcional mediante el drafter externo `dendriteholdings/Ingot-27B-DFlash2-MLX`, que eleva el throughput en greedy single-stream.

## Casos de uso

- Investigación en cuantización extrema: el modelo sirve como referencia reproducible para estudiar el impacto de 2,25 bits por peso en un transformer de 27B, comparando la KL frente al profesor BF16 (0,07766) con la de otras técnicas de compresión.
- Inferencia local en Apple Silicon de gama alta: con 8,60 GB de pesos, cabe en un Mac con 16 GB de memoria unificada y permite ejecutar un modelo de 27B en un portátil o un Mac Studio, algo inviable en BF16 (que requeriría ~55 GB).
- Evaluación de pipelines de cuantización competitiva: útil para replicar el protocolo de Ingot (medición de KL por dominio, ponderación por muestras) y auditar submissions de otros mineros.
- Generación de código asistida en local: los ~59 tok/s en decodificación plana y ~90 tok/s con DFlash 2 en un M3 Ultra permiten usar el modelo como asistente de código offline en un entorno controlado, sin enviar prompts a la nube.
- Servicio OpenAI-compatible en red local: MTPLX expone el modelo como API compatible con OpenAI (`mtplx serve --port 8080`), lo que permite integrarlo en herramientas que ya consumen ese formato (Continue, Cursor, plugins de IDE) sin modificar el cliente.
- Estudio de decodificación especulativa: el par modelo + drafter DFlash 2 constituye un banco de pruebas para medir la ganancia de throughput (de 59 a ~73 tok/s en greedy) y la tasa de aceptación de propuestas en un modelo ternario.
- Benchmarking de kernels MLX: los números de la model card (55,3 tok/s en servidor MTPLX, 59,9 tok/s in-process con kernels ternarios) permiten comparar implementaciones de kernels de cuantización en Metal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card solo reporta métricas de fidelidad respecto al profesor y de velocidad de decodificación.

| Metrica | Valor |
|---|---|
| KL(profesor ‖ modelo) en la eval ganadora | 0,07766 |
| KL(profesor ‖ rey anterior) en la misma eval | 0,07926 |
| Decode tok/s, MTPLX 2.12 (mlx 0.32) servidor, batch 1, M3 Ultra | 55,3 |
| Decode tok/s, mlx-lm 0.31 con kernels ternarios MTPLX, in-process | 59,9 |
| Decode tok/s, gemelo GGUF en fork Dendrite llama.cpp, mismo Mac | 56,4 |
| Decode tok/s, gemelo GGUF en RTX PRO 6000 | 137 |
| Decode tok/s con drafter DFlash 2 (greedy single-stream, M3 Ultra) | ~73 (hasta ~90 en código) |

## Requisitos de hardware

- VRAM/memoria unificada: 8,60 GB solo para pesos; con overhead de contexto y buffers de activación, se recomienda un mínimo de 16 GB de memoria unificada en Apple Silicon.
- GPU recomendadas: Apple Silicon exclusivamente (el layout `prism_hadamard_qwen35` no carga en mlx-lm estándar ni en CUDA). Los datos de velocidad se midieron en un Mac Studio M3 Ultra con GPU de 80 núcleos y 512 GB.
- ¿Cabe en consumer GPU? No en el sentido habitual: no está pensado para GPUs NVIDIA o AMD. En Apple Silicon, cabe en cualquier Mac con ≥16 GB de memoria unificada, incluidos MacBook Air M2/M3 con 16 GB (aunque el throughput será menor que en un M3 Ultra).
- Opciones de despliegue: MTPLX (`pip install mtplx`, `mtplx serve --model ... --generation-mode ar --port 8080 --no-auth --yes`), que expone una API compatible con OpenAI. El gemelo GGUF requiere el fork DendriteLabs/llama.cpp. No es compatible con vLLM, TGI, Ollama ni llama.cpp upstream.
- Latencia y throughput: 55,3 tok/s en servidor MTPLX y 59,9 tok/s in-process en M3 Ultra; ~73 tok/s con DFlash 2 en greedy y ~90 tok/s en código. En hardware inferior (M2 Pro, M3 Max) se espera un throughput proporcionalmente menor, aunque no se han publicado medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ingot-XXXVII-27B-MLX-2bit | 27,36B | no disponible | 2-bit ternario MLX | no disponible | Hugging Face, MLX/MTPLX |
| Ingot-XXXVII-27B-Q2 (gemelo GGUF) | 27,36B | no disponible | 2-bit ternario GGUF | no disponible | Hugging Face, fork llama.cpp |
| prism-ml/Ternary-Bonsai-2-27B-mlx-2bit (base) | 27B | no disponible | 2-bit ternario MLX | no disponible | Hugging Face, MLX |
| prism-ml/Ternary-Bonsai-2-27B-gguf (base) | 27B | no disponible | 2-bit ternario GGUF | no disponible | Hugging Face, llama.cpp |

No se dispone de datos de benchmarks estándar para ninguno de estos modelos en la información proporcionada, por lo que la comparación se limita a parámetros, formato y disponibilidad. La diferencia medible entre el modelo y su base es la KL frente al profesor (0,07766 frente a valores no publicados de Bonsai 2 original).

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial está permitido. Antes de cualquier despliegue en producción es imprescindible contactar con el autor o consultar la licencia del modelo base (Prism ML), que tampoco se detalla.
- Idiomas soportados no disponibles: no hay información sobre cobertura multilingüe ni sobre el rendimiento en castellano.
- Contexto no disponible: se desconoce la longitud máxima de secuencia, lo que impide planificar casos de uso con documentos largos.
- Riesgo de alucinación: al ser una cuantización a 2 bits, la fidelidad respecto al profesor es buena en términos de KL pero no perfecta; en tareas de razonamiento de varios pasos o matemáticas puede degradarse más que en generación de texto libre.
- Dependencia de un runtime no estándar: requiere MTPLX (o el fork DendriteLabs/llama.cpp para el GGUF). No funciona en vLLM, TGI, Ollama ni llama.cpp upstream, lo que limita su integración en infraestructura existente.
- Exclusivo de Apple Silicon en este formato: no se puede ejecutar en GPUs NVIDIA o AMD sin recurrir al gemelo GGUF y su fork de llama.cpp.
- Sin cabeza MTP: el pack no incluye drafter especulativo; para aprovechar la decodificación especulativa hay que descargar por separado `dendriteholdings/Ingot-27B-DFlash2-MLX`.
- Origen competitivo: el modelo es una submission de un minero en un subnet de Bittensor. La model card no documenta el proceso de entrenamiento ni los datos usados, solo el objetivo de optimización (KL frente al profesor). La reproducibilidad completa no está garantizada.
- Sin datos de benchmarks estándar: no se puede comparar con modelos de la misma categoría en MMLU, HumanEval o GSM8K.
- Sesgos: no documentados. Al derivar de un modelo base no identificado con precisión (Qwen 3.8 27B), hereda los sesgos de este, que no se detallan.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dendriteholdings/Ingot-XXXVII-27B-MLX-2bit
- Modelo base (MLX 2-bit): https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-mlx-2bit
- Modelo base (GGUF): https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Gemelo GGUF del mismo minero: https://huggingface.co/dendriteholdings/Ingot-XXXVII-27B-Q2
- Drafter especulativo DFlash 2: https://huggingface.co/dendriteholdings/Ingot-27B-DFlash2-MLX
- Runtime MTPLX: https://github.com/youssofal/mtplx
- Fork de llama.cpp con kernels ternarios: https://github.com/DendriteLabs/llama.cpp
