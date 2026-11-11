# dendriteholdings/Ingot-XXXII-27B-MLX-2bit

## Resumen

Ingot-XXXII-27B-MLX-2bit es un modelo de lenguaje de 27.359.638.768 parametros publicado por dendriteholdings como espejo publico de una submission ganadora en Ingot, un subnet de Bittensor en el que los mineros cuantizan un modelo maestro fijo y el validador premia la copia que mas se le aproxima. El modelo parte de Prism ML Ternary Bonsai 2 27B y ha sido re-cuantizado y parcialmente reajustado: el minero modifico menos del 0,01 % de los codigos ternarios y re-ajusto el resto de pesos para acercarse a Qwen3.8-27B. El resultado son pesos ternarios (codigos de 2 bits con escala y sesgo fp16 por cada 128 pesos) empaquetados en formato MLX affine 2-bit.

La relevancia del modelo es doble. Por un lado, demuestra que la cuantizacion ternaria extrema (2,25 bits por peso) puede mantener una fidelidad alta respecto a un profesor BF16: la divergencia KL de la distribucion de siguiente token es de 0,08744, ligeramente mejor que la del rey anterior (0,08925). Por otro, es un caso practico de inferencia de un modelo de 27B en Apple Silicon con un peso en disco de solo 8,6 GB, lo que lo hace desplegable en equipos de consumo con memoria unificada.

El modelo se distribuye exclusivamente para MLX y requiere el runtime MTPLX, ya que el layout `prism_hadamard_qwen35` no es cargable por mlx-lm estandar. Incluye una torre de vision, configuracion, tokenizer y vectores de signo Hadamard heredados de Prism ML, que la competicion no altera.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (layout `prism_hadamard_qwen35`, pesos ternarios con Hadamard) |
| Parametros totales | 27.359.638.768 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 2-bit ternario (2,25 bits por peso: codigos de 2 bits, escala fp16 y sesgo por cada 128 pesos) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX affine 2-bit), 8,60 GB |

## Arquitectura y entrenamiento

El modelo es un transformer de 27B parametros cuyos pesos se almacenan en codigos ternarios de 2 bits con una escala fp16 y un sesgo por cada bloque de 128 pesos, lo que da 2,25 bits efectivos por peso. El layout `prism_hadamard_qwen35` incorpora vectores de signo Hadamard que acompanan a la cuantizacion; estos vectores, junto con la configuracion, el tokenizer y la torre de vision, provienen del modelo base de Prism ML y no fueron modificados por el minero.

El entrenamiento no es un entrenamiento desde cero: se trata de un proceso de cuantizacion competitiva. El minero partio de Ternary Bonsai 2 27B, altero menos del 0,01 % de los codigos ternarios y re-ajusto el resto de pesos para minimizar la divergencia respecto a Qwen3.8-27B (el profesor objetivo de la competicion). La evaluacion se realiza calculando la KL entre la distribucion de siguiente token del profesor BF16 y la del modelo cuantizado, ponderando los dominios por su cuota en las muestras. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO.

## Capacidades

- Generacion de texto y conversacion multi-turno (pipeline `text-generation`, tag `conversational`).
- Razonamiento y generacion de codigo: el modelo incluye una torre de vision heredada del base, aunque la informacion disponible no detalla el alcance de sus capacidades multimodales.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades especiales: cuantizacion ternaria extrema (2,25 bits por peso) con fidelidad medida frente al profesor; compatible con decodificacion especulativa mediante el drafter DFlash 2 de la misma familia.

## Casos de uso

- Despliegue local en Apple Silicon: el modelo ocupa 8,6 GB en disco y esta disenado para ejecutarse con MTPLX en Macs con memoria unificada, lo que permite servir un 27B en un portatil o equipo de sobremesa sin GPU dedicada.
- Servicio de API compatible con OpenAI: MTPLX expone el modelo como API OpenAI-compatible (`mtplx serve --model ... --port 8080`), lo que facilita integrarlo en aplicaciones existentes que ya consumen ese contrato.
- Generacion de codigo interactiva: con el drafter DFlash 2 se alcanzan aproximadamente 90 tok/s en respuestas de codigo sobre un Mac Studio M3 Ultra, adecuado para asistentes de programacion en local.
- Prototipado de agentes en local: al ejecutarse en hardware de consumo y con un peso reducido, permite iterar sobre pipelines de agentes sin coste de API ni dependencia de la nube.
- Investigacion en cuantizacion: sirve como referencia para estudiar el impacto de la cuantizacion ternaria en la fidelidad de la distribucion de tokens (KL de 0,08744 frente al profesor BF16).
- Reproduccion de evaluaciones de Bittensor/Ingot: el modelo incluye los identificadores de submission y hotkey del minero, lo que permite reproducir la evaluacion de la competicion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La unica metrica de calidad publicada es la divergencia KL frente al profesor BF16:

| Metrica | Valor |
|---|---|
| KL (teacher ‖ model), evaluacion ganadora | 0,08744 |
| KL del rey anterior, misma evaluacion | 0,08925 |

Rendimiento de decodificacion (batch 1, Mac Studio M3 Ultra, 80 nucleos GPU, 512 GB):

| Motor | Modo | Decode tok/s |
|---|---|---|
| MTPLX 2.12 (mlx 0.32) server | plain | 55,3 |
| mlx-lm 0.31 con kernels ternarios de MTPLX, in-process | plain | 59,9 |
| Con drafter DFlash 2 (greedy, single-stream) | especulativo | ~73 |
| Con drafter DFlash 2 (respuestas de codigo) | especulativo | ~90 |

Como referencia, el gemelo GGUF de estos pesos decodifica a 56,4 tok/s en el mismo Mac con el fork de llama.cpp de Dendrite y a 137 tok/s en una RTX PRO 6000.

## Requisitos de hardware

- VRAM/memoria estimada: 8,60 GB de pesos; con overhead de runtime, se recomienda al menos 12-16 GB de memoria unificada en Apple Silicon.
- GPU recomendadas: Apple Silicon con memoria unificada suficiente (probado en Mac Studio M3 Ultra, 80 nucleos GPU, 512 GB). No hay datos de ejecucion en GPU NVIDIA para este empaquetado MLX concreto; el gemelo GGUF alcanza 137 tok/s en RTX PRO 6000.
- Cabe en GPU de consumo: si, en equipos Apple Silicon con 16 GB o mas de memoria unificada; no aplica a GPUs NVIDIA por el formato MLX.
- Opciones de despliegue: MTPLX (servidor OpenAI-compatible), mlx-lm 0.31 con los kernels ternarios de MTPLX, y el runner del drafter DFlash 2 para decodificacion especulativa.
- Latencia y throughput: 55,3 tok/s en servidor MTPLX y 59,9 tok/s in-process en M3 Ultra; hasta ~90 tok/s en codigo con el drafter.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ingot-XXXII-27B-MLX-2bit | 27,36B | 2,25 bits (ternario) | no disponible | no disponible | MLX (MTPLX) |
| Ingot-XXXII-27B-Q2 (gemelo GGUF) | 27,36B | 2 bits (ternario) | no disponible | no disponible | GGUF (fork llama.cpp de Dendrite) |
| prism-ml/Ternary-Bonsai-2-27B-mlx-2bit (base) | 27B (aproximado) | 2 bits (ternario) | no disponible | no disponible | MLX |
| Qwen3.8-27B (profesor objetivo) | 27B (aproximado) | BF16 | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La licencia no esta especificada en la informacion disponible; no se puede confirmar el uso comercial sin consultar el repositorio del modelo base.
- El modelo solo es cargable con MTPLX: mlx-lm estandar no soporta el layout `prism_hadamard_qwen35`.
- Este repositorio no incluye cabecera MTP de borrador, por lo que decodifica un token por paso salvo que se combine con el drafter DFlash 2.
- La cuantizacion ternaria de 2,25 bits introduce perdida de fidelidad respecto al profesor BF16 (KL de 0,08744); no es equivalente al modelo en precision completa.
- No hay datos publicados de benchmarks de tareas, sesgos, alucinacion ni cobertura idiomatica; se recomienda evaluacion propia antes de usar en produccion.
- El modelo es un espejo de una submission de competicion; su procedencia y los ajustes del minero estan documentados, pero no hay garantias de mantenimiento o soporte.
- El rendimiento medido corresponde a un Mac Studio M3 Ultra de gama alta; en equipos Apple Silicon inferiores el throughput sera considerablemente menor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dendriteholdings/Ingot-XXXII-27B-MLX-2bit
- Gemelo GGUF: https://huggingface.co/dendriteholdings/Ingot-XXXII-27B-Q2
- Modelo base (Prism ML, MLX): https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-mlx-2bit
- Modelo base (Prism ML, GGUF): https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Drafter DFlash 2: https://huggingface.co/dendriteholdings/Ingot-27B-DFlash2-MLX
- Runtime MTPLX: https://github.com/youssofal/mtplx
- Fork de llama.cpp de Dendrite: https://github.com/DendriteLabs/llama.cpp
