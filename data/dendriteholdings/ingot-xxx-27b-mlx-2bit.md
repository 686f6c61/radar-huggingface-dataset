# dendriteholdings/Ingot-XXX-27B-MLX-2bit

## Resumen

Ingot-XXX-27B-MLX-2bit es un modelo de generación de texto de 27.359.638.768 parámetros (aproximadamente 27,4 mil millones) en formato MLX de 2 bits ternario, publicado por dendriteholdings. Se trata de un espejo público de un modelo ganador en Ingot, una subnet de Bittensor en la que los mineros cuantizan un modelo maestro fijo y el validador corona la copia que se mantiene más próxima a dicho maestro. El modelo parte de Prism ML Ternary Bonsai 2 27B, al que el minero modificó menos del 0,01 % de sus códigos ternarios y reajustó el resto de pesos para acercarlo a Qwen3.8-27B.

La relevancia de esta ficha es doble: por un lado, documenta un ejercicio de cuantización extrema (2 bits ternarios con escala y sesgo fp16 cada 128 pesos) que reduce un modelo de ~27B a 8,60 GB de safetensors, permitiendo su ejecución en Apple Silicon; por otro, expone un mecanismo de evaluación por divergencia KL frente al profesor (0,08966 en su eval ganadora frente a 0,09160 del rey al que batió). La arquitectura base es la del modelo Qwen3.8-27B subyacente, con layout `prism_hadamard_qwen35` y decodificación de un token por paso en este pack, sin cabeza MTP incluida.

El modelo está etiquetado como `not-for-all-audiences`, no declara licencia ni idiomas explícitos, y no tiene descargas ni likes en el momento de la consulta. Su uso práctico está ligado al ecosistema MLX (Apple Silicon) y a la pila MTPLX, que lo sirve como API compatible con OpenAI.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen3.8-27B, con layout `prism_hadamard_qwen35` y pesos ternarios de 2 bits; sin cabeza MTP en este pack |
| Parámetros totales | 27.359.638.768 (~27,4B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 2 bits ternarios (2-bit codes con escala fp16 y bias −d por cada bloque de 128 pesos); 2,25 bits por peso efectivos |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX, `model.safetensors`, 8,60 GB) |

## Arquitectura y entrenamiento

El modelo es un fine-tune (relación `finetune`) del modelo base `prism-ml/Ternary-Bonsai-2-27B-mlx-2bit`, que a su vez deriva de `prism-ml/Ternary-Bonsai-2-27B-gguf`, construido sobre Qwen3.8-27B. La arquitectura subyacente es la de Qwen3.8-27B, un transformer denso de aproximadamente 27,4B parámetros, pero con los pesos reescritos en un esquema ternario de 2 bits: cada bloque de 128 pesos conserva sus códigos ternarios y una escala fp16, codificados como valores afines MLX de 2 bits (escala d, bias −d). El modelo incluye una torre de visión, config, tokenizer y vectores de signo Hadamard heredados de Prism ML, que la competición no modifica.

El "entrenamiento" en este caso es el proceso de cuantización competitivo de la subnet Ingot: el minero (hotkey `5GTwre9j38Yqa5sBHm7RKYHFQKSyUzUUpsW1fTYGHkgntFym`, uid 157) partió del profesor Ternary Bonsai 2 27B, alteró menos del 0,01 % de los códigos ternarios y reajustó el resto de pesos para minimizar la divergencia KL frente a Qwen3.8-27B en BF16. La evaluación se realiza por token de respuesta, calculando KL(profesor ‖ modelo) sobre las distribuciones del siguiente token en cada dominio, ponderadas por la proporción de muestras de cada dominio. No se dispone de información sobre volumen de tokens de entrenamiento, composición del dataset ni uso de RLHF/DPO.

## Capacidades

- Generación de texto y conversación multi-turno (pipeline `text-generation`, etiqueta `conversational`).
- Razonamiento y respuesta a instrucciones, heredado de Qwen3.8-27B y ajustado para acercarse al profesor.
- Generación de código: el model card reporta pruebas sobre prompts de código y velocidades específicas para respuestas de código con el drafter DFlash 2.
- Capacidades de visión: el pack incluye la torre de visión de Prism ML (aunque no se detalla su funcionamiento en este formato).
- Soporte de tool calling / function calling: no disponible (no se documenta explícitamente).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se documenta explícitamente).
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Modo thinking: no disponible.
- Decodificación especulativa opcional mediante el drafter DFlash 2 (`dendriteholdings/Ingot-27B-DFlash2-MLX`), que acelera la generación greedy de un solo stream.
- Servido como API compatible con OpenAI mediante MTPLX.

## Casos de uso

- Inferencia local en Apple Silicon: el modelo ocupa 8,60 GB en safetensors y decodifica a 55,3 tok/s en un Mac Studio M3 Ultra (80-core GPU, 512 GB) con MTPLX 2.12 en modo plain; es adecuado para estaciones de trabajo Mac con memoria unificada suficiente.
- Servicio de API compatible con OpenAI: MTPLX expone el modelo con `mtplx serve --model dendriteholdings/Ingot-XXX-27B-MLX-2bit --generation-mode ar --port 8080 --no-auth --yes`, permitiendo integrarlo en aplicaciones existentes que consumen la API de OpenAI.
- Generación de código asistida: con el drafter DFlash 2 las respuestas de código alcanzan ~90 tok/s en el M3 Ultra, lo que lo hace viable para autocompletado y revisión de código en entornos de desarrollo locales.
- Evaluación de técnicas de cuantización: al ser un artefacto de una subnet de cuantización, sirve como referencia reproducible para investigar el impacto de la cuantización ternaria de 2 bits en la fidelidad al profesor (KL 0,08966).
- Experimentación con decodificación especulativa: el par modelo + drafter DFlash 2 permite medir ganancias de throughput (de 59 a ~73 tok/s en greedy single-stream) en hardware Apple.
- Despliegue de bajo consumo de memoria: con 2,25 bits por peso efectivos, encaja en escenarios donde la VRAM/memoria unificada es el cuello de botella, a costa de fidelidad frente al modelo BF16.
- Investigación sobre Bittensor/Ingot: permite replicar y auditar el proceso de selección por KL frente al profesor y comparar submissions.

## Benchmarks y rendimiento

El model card no publica resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.). Solo reporta la divergencia KL frente al profesor y velocidades de decodificación.

| Métrica | Valor |
|---|---|
| KL(profesor ‖ modelo), eval ganadora | 0,08966 |
| KL del "king" al que batió, misma eval | 0,09160 |
| Decode tok/s, MTPLX 2.12 (mlx 0.32) server, plain, M3 Ultra | 55,3 |
| Decode tok/s, mlx-lm 0.31 con kernels ternarios de MTPLX, in-process, plain | 59,9 |
| Decode tok/s, gemelo GGUF en Dendrite llama.cpp fork, mismo Mac | 56,4 |
| Decode tok/s, gemelo GGUF en RTX PRO 6000 | 137 |
| Decode tok/s con drafter DFlash 2, greedy single-stream, M3 Ultra | ~73 (desde 59) |
| Decode tok/s con drafter DFlash 2, respuestas de código | ~90 |

No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: 8,60 GB de pesos en safetensors (2,25 bits por peso), más overhead de activaciones y KV cache no especificado.
- GPU recomendadas: Apple Silicon con memoria unificada suficiente; las mediciones se hicieron en un Mac Studio M3 Ultra (80-core GPU, 512 GB). Para el gemelo GGUF se reporta un RTX PRO 6000 con 137 tok/s.
- ¿Cabe en consumer GPU? No se dispone de datos para GPUs consumer; el formato es MLX (Apple Silicon) y el gemelo GGUF está pensado para el fork de llama.cpp de Dendrite.
- Opciones de despliegue: MTPLX (servidor compatible con OpenAI; `pip install mtplx`), mlx-lm 0.31 con los kernels ternarios de MTPLX (in-process), y el drafter DFlash 2 con su runner propio. El layout `prism_hadamard_qwen35` no lo carga mlx-lm de forma nativa.
- Latencia y throughput: 55,3 tok/s (MTPLX server, plain), 59,9 tok/s (mlx-lm in-process, plain), ~73 tok/s y ~90 tok/s en código con DFlash 2, todo en M3 Ultra batch 1. Las cifras del servidor son 256 tokens generados sobre un prompt de código medidas por HTTP; las in-process son 128 tokens sin servidor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ingot-XXX-27B-MLX-2bit | ~27,4B | no disponible | 2 bits ternarios (MLX) | no disponible | Hugging Face (MLX) |
| dendriteholdings/Ingot-XXX-27B-Q2 | ~27,4B (mismo layout) | no disponible | 2 bits ternarios (GGUF) | no disponible | Hugging Face (GGUF); 56,4 tok/s en M3 Ultra, 137 tok/s en RTX PRO 6000 |
| prism-ml/Ternary-Bonsai-2-27B-mlx-2bit | ~27,4B | no disponible | 2 bits ternarios (MLX) | no disponible | Hugging Face (modelo base de este fine-tune) |
| prism-ml/Ternary-Bonsai-2-27B-gguf | ~27,4B | no disponible | 2 bits ternarios (GGUF) | no disponible | Hugging Face (origen del profesor) |

No se dispone de datos de rendimiento comparativo en benchmarks estándar para estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Etiquetado `not-for-all-audiences`: el model card no detalla la razón, pero conviene revisar el contenido generado antes de exponerlo a audiencias generales.
- Licencia no declarada: no hay información sobre permisos de uso comercial; debe verificarse con el autor antes de usarlo en producción.
- Idiomas no declarados: no se garantiza cobertura multilingüe ni calidad fuera de los idiomas del profesor.
- Cuantización extrema de 2 bits: aunque el KL frente al profesor es bajo (0,08966), la fidelidad no es perfecta y puede degradar tareas sensibles (matemáticas, código complejo, razonamiento largo).
- Riesgo de alucinación: inherente a los modelos generativos; no se reportan mitigaciones específicas.
- Sesgos: no se documentan sesgos conocidos ni evaluación de sesgo.
- Contexto: la longitud de contexto no está especificada; no debe asumirse la del profesor Qwen3.8-27B sin verificación.
- Dependencia de tooling: el layout `prism_hadamard_qwen35` no carga en mlx-lm estándar; requiere MTPLX o los kernels ternarios específicos, lo que limita la portabilidad.
- Sin cabeza MTP: este pack decodifica un token por paso; la aceleración requiere el drafter DFlash 2 aparte.
- Procedencia competitiva: es un artefacto de una subnet de Bittensor; su validez está ligada a las reglas y evaluación de Ingot, no a un benchmark independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dendriteholdings/Ingot-XXX-27B-MLX-2bit
- Modelo base: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-mlx-2bit
- Profesor GGUF: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Gemelo GGUF de este modelo: https://huggingface.co/dendriteholdings/Ingot-XXX-27B-Q2
- Drafter DFlash 2: https://huggingface.co/dendriteholdings/Ingot-27B-DFlash2-MLX
- MTPLX (servidor MLX): https://github.com/youssofal/mtplx
- Fork de llama.cpp de Dendrite: https://github.com/DendriteLabs/llama.cpp
