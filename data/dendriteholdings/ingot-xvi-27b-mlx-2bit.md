# dendriteholdings/Ingot-XVI-27B-MLX-2bit

## Resumen

Ingot-XVI-27B-MLX-2bit es un modelo de generación de texto en formato MLX, derivado por cuantización ternaria del modelo Prism ML Ternary Bonsai 2 27B. Lo publica el usuario dendriteholdings como espejo público de una submission ganadora en Ingot, un subnet de Bittensor en el que los mineros compiten por producir la copia cuantizada que más se aproxima al modelo profesor original. El modelo conserva los códigos ternarios del base y reajusta el resto de pesos para acercarse a Qwen3.8-27B, que actúa como referencia de calidad.

Con 27.359.638.768 parámetros totales y un peso en disco de 8,60 GB, emplea una representación de 2,25 bits por peso: códigos de 2 bits con escala fp16 y sesgo por cada bloque de 128 pesos. El resultado es un modelo de 27B que ocupa menos de 9 GB, lo que lo hace viable en hardware Apple Silicon con memoria unificada moderada.

Su relevancia es doble: por un lado, demuestra hasta dónde se puede comprimir un transformer de 27B manteniendo una divergencia KL de 0,09345 frente al profesor en BF16; por otro, ilustra un mecanismo de competición descentralizada (Bittensor) para optimizar cuantizaciones. El modelo está pensado para inferencia local en Mac mediante MTPLX o mlx-lm, no para despliegues estándar en GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (layout `prism_hadamard_qwen35`), derivado de Qwen3.5 con cuantización ternaria y transformada de Hadamard |
| Parametros totales | 27.359.638.768 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 2-bit ternario (2,25 bits por peso: códigos de 2 bits, escala fp16 y sesgo por bloque de 128 pesos) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX affine 2-bit), 8,60 GB en un único `model.safetensors` |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 27B parámetros basado en la familia Qwen3.5, según el layout `prism_hadamard_qwen35` que define Prism ML. La innovación central es la cuantización ternaria: cada bloque de 128 pesos se representa con códigos de 2 bits más una escala fp16 y un sesgo de valor −d, de modo que cada peso decodifica al mismo valor que emplea el kernel GGUF del modelo base. Adicionalmente se aplica una transformada de Hadamard (sign vectors incluidos en el repo de Prism) para reducir el error de cuantización.

El proceso de entrenamiento no es un preentrenamiento desde cero ni un fine-tuning clásico: es una optimización de cuantización realizada por un minero de Bittensor (hotkey `5Dk7ZFG5LkPnV7Qaar7uLr1cy9LHDo3Uc92mLwVrSfjEA7DG`, uid 239). Partiendo de los pesos ternarios de Ternary Bonsai 2 27B, el minero reajustó los pesos restantes para minimizar la divergencia respecto a Qwen3.8-27B. El resultado se convirtió sin pérdida a formato MLX affine 2-bit. La torre de visión, la configuración, el tokenizer y los vectores de signo de Hadamard provienen intactos de `prism-ml/Ternary-Bonsai-2-27B-mlx-2bit`. No se dispone de información sobre el volumen de datos de entrenamiento ni sobre el uso de RLHF o DPO.

## Capacidades

- Generación de texto conversacional y de código, heredadas del modelo base Qwen3.5-27B.
- Procesamiento multimodal: el repo incluye la torre de visión de Prism, por lo que el modelo conserva capacidad de entrada de imágenes (aunque no se detalla su alcance en la información disponible).
- Razonamiento multi-paso y respuestas de tipo conversacional.
- No se documenta soporte explícito de tool calling o function calling en la información disponible.
- No se documenta modo thinking ni decodificación especulativa integrada; el repo no incluye cabecera MTP, por lo que decodifica un token por paso.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Inferencia local en Apple Silicon: el modelo cabe en 8,60 GB y se sirve con MTPLX como API compatible con OpenAI, lo que permite montar un asistente conversacional privado en un Mac Studio o MacBook con memoria unificada suficiente, sin depender de la nube.
- Generación de código en estación de trabajo: con 55-60 tok/s en un M3 Ultra y hasta ~90 tok/s con el drafter DFlash 2, es adecuado para autocompletado y generación de fragmentos en editores locales.
- Investigación en cuantización extrema: sirve como caso de estudio reproducible de cuantización ternaria de un 27B, con métricas publicadas de KL y distancia de estados ocultos frente al profesor, útil para validar nuevas técnicas de compresión.
- Evaluación de ecosistemas descentralizados: permite a investigadores de Bittensor reproducir y auditar la submission ganadora, comparando su fidelidad al profesor con la del rey anterior.
- Prototipado de pipelines de texto en macOS: al exponer una API compatible con OpenAI, se integra en scripts y frameworks existentes sin adaptadores, útil para pruebas de concepto en entornos de desarrollo con hardware Apple.
- Servicio de chat de baja concurrencia: con decodificación a batch 1 y ~55 tok/s, encaja en asistentes personales o herramientas internas de un solo usuario, no en despliegues de alta concurrencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor publica métricas de fidelidad al profesor y de velocidad:

| Metrica | Este modelo | Rey anterior |
|---|---|---|
| KL(profesor ‖ modelo) | 0,09345 | 0,09506 |
| Distancia de estados ocultos (media cada 8 capas) | 0,2990 | 0,3026 |

| Motor | Modo | Decodificacion (tok/s) |
|---|---|---|
| MTPLX 2.12 (mlx 0.32) servidor | plain | 55,3 |
| mlx-lm 0.31 con kernels ternarios de MTPLX, in-process | plain | 59,9 |
| Con drafter DFlash 2 (greedy, un stream) | especulativo | ~73 (hasta ~90 en código) |

Medido en un Mac Studio M3 Ultra (GPU de 80 núcleos, 512 GB). El gemelo GGUF alcanza 56,4 tok/s en el mismo Mac y 137 tok/s en una RTX PRO 6000.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: ~8,6 GB de pesos más overhead de activaciones y KV cache; en la práctica, entre 10 y 14 GB de memoria unificada según longitud de contexto.
- GPU recomendadas: Apple Silicon con memoria unificada (M3 Ultra, M2 Max/Ultra, M4 Pro/Max); el formato MLX no está pensado para CUDA.
- Cabe en GPU de consumo: sí, en Mac con 16 GB o más de memoria unificada; en GPU NVIDIA consumer no es desplegable directamente por el formato MLX (existe el gemelo GGUF para llama.cpp).
- Opciones de despliegue: MTPLX (servidor compatible con OpenAI), mlx-lm 0.31 con kernels ternarios de MTPLX, y el fork Dendrite de llama.cpp para el gemelo GGUF.
- Latencia y throughput: 55-60 tok/s en decodificación plain a batch 1 en M3 Ultra; ~73-90 tok/s con decodificación especulativa DFlash 2. No hay datos de throughput con batching.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ingot-XVI-27B-MLX-2bit | 27,36B | no disponible | 2-bit ternario (2,25 bpw) | no disponible | Hugging Face (MLX) |
| prism-ml/Ternary-Bonsai-2-27B-mlx-2bit | 27B (aprox.) | no disponible | 2-bit ternario | no disponible | Hugging Face (MLX) |
| dendriteholdings/Ingot-XVI-27B-Q2 | 27B (aprox.) | no disponible | 2-bit ternario | no disponible | Hugging Face (GGUF) |
| Qwen3.8-27B (profesor de referencia) | 27B (aprox.) | no disponible | BF16 | no disponible | no disponible en la información |

## Limitaciones y advertencias

- La licencia no está declarada en la información disponible; no se puede asumir uso comercial sin verificar la del modelo base y la del profesor.
- La cuantización ternaria introduce degradación: la KL de 0,093 frente al profesor implica divergencia medible en las distribuciones de siguiente token, con riesgo de errores sutiles en tareas de precisión.
- Riesgo de alucinación inherente a un modelo de 27B comprimido; la compresión puede amplificar errores en dominios poco representados.
- Longitud de contexto e idiomas soportados no documentados: no se debe asumir un contexto largo ni cobertura multilingüe sin validación empírica.
- El formato MLX limita el despliegue a Apple Silicon; fuera de ese ecosistema hay que recurrir al gemelo GGUF y al fork de llama.cpp.
- No incluye cabecera MTP: la decodificación especulativa requiere el drafter externo DFlash 2, con su propio consumo de memoria.
- El modelo proviene de una competición de cuantización, no de un proceso de alineación documentado; no hay información sobre RLHF, filtrado de datos ni mitigaciones de sesgo.
- Para producción de alta concurrencia no hay datos de throughput con batching; las cifras publicadas son a batch 1.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dendriteholdings/Ingot-XVI-27B-MLX-2bit
- Modelo base MLX: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-mlx-2bit
- Modelo base GGUF: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Gemelo GGUF de esta submission: https://huggingface.co/dendriteholdings/Ingot-XVI-27B-Q2
- Drafter especulativo DFlash 2: https://huggingface.co/dendriteholdings/Ingot-27B-DFlash2-MLX
- Servidor MTPLX: https://github.com/youssofal/mtplx
- Fork Dendrite de llama.cpp: https://github.com/DendriteLabs/llama.cpp
