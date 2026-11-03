# dendriteholdings/Ingot-XXV-27B-MLX-2bit

## Resumen

Ingot-XXV-27B-MLX-2bit es un modelo de lenguaje de 27.359.638.768 parámetros (27,36 mil millones) cuantizado a 2 bits en formato ternario, empaquetado para Apple Silicon mediante la librería MLX. Lo publica el usuario dendriteholdings como espejo público de un modelo ganador en Ingot, una subred de Bittensor en la que los mineros cuantizan un modelo maestro fijo y el validador premia la copia que se mantiene más próxima a él. El modelo deriva de prism-ml/Ternary-Bonsai-2-27B-mlx-2bit, que a su vez es una variante ternaria de un modelo de la familia Qwen de 27B, y ha sido reajustado por el minero para acercarse al maestro Qwen3.8-27B.

La relevancia técnica del modelo está en su formato: cada bloque de 128 pesos conserva sus códigos ternarios y su escala fp16 como valores afines de 2 bits de MLX (escala d, sesgo −d), de modo que cada peso decodifica al mismo número que usa el kernel GGUF. El resultado es un checkpoint de 8,60 GB que ocupa 2,25 bits por peso y que, según el autor, mantiene una divergencia KL de 0,08148 frente al maestro BF16, ligeramente mejor que la del modelo que venció en la misma evaluación (0,08278).

No se dispone de información sobre licencia, idiomas soportados ni datos de entrenamiento. El modelo está pensado para inferencia en hardware Apple Silicon mediante MTPLX, que sirve una API compatible con OpenAI, y no carga en mlx-lm estándar porque usa el layout propietario `prism_hadamard_qwen35`.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de la familia Qwen3.8, con layout de pesos `prism_hadamard_qwen35`); detalles completos no disponibles |
| Parametros totales | 27.359.638.768 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 2 bits ternario (2,25 bits por peso: códigos de 2 bits, escala y sesgo fp16 por cada 128 pesos) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX affine 2-bit), 8,60 GB en un único `model.safetensors` |

## Arquitectura y entrenamiento

El modelo es un transformer de 27,36 mil millones de parámetros cuyo linaje se remonta a Qwen3.8-27B. Sobre esa base, Prism ML produjo Ternary Bonsai 2 27B, una versión con pesos ternarios, y el minero de Ingot reajustó el resto de los pesos para acercar la distribución de salida a la del maestro Qwen3.8-27B. La torre de visión, la configuración, el tokenizador y los vectores de signo de Hadamard provienen de prism-ml/Ternary-Bonsai-2-27B-mlx-2bit y no los modifica la competición.

La innovación principal es el esquema de cuantización: cada bloque de 128 pesos mantiene sus códigos ternarios y una escala fp16, representados como valores afines de 2 bits de MLX (escala d, sesgo −d), de forma que cada peso decodifica exactamente al mismo valor que emplea el kernel GGUF del modelo gemelo. El proceso de selección en la subred Ingot consiste en medir la divergencia KL entre las distribuciones del siguiente token del modelo candidato y las del maestro BF16, además de la distancia de estados ocultos normalizada promediada cada 8 capas. No se han publicado detalles sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto y conversación multi-turno (pipeline `text-generation`, tags `conversational`).
- Razonamiento y generación de código: el autor reporta tiempos de decodificación específicos sobre prompts de código y un modo de decodificación especulativa que eleva el rendimiento en respuestas de código.
- Capacidades de visión: el modelo incluye una torre de visión heredada de Ternary Bonsai 2, aunque no se detallan las tareas soportadas.
- Tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking: no disponible en la información proporcionada.
- Decodificación especulativa opcional mediante el drafter DFlash 2 (dendriteholdings/Ingot-27B-DFlash2-MLX), que propone varios tokens y el modelo los verifica.

## Casos de uso

- Inferencia local en Mac con memoria unificada: el checkpoint de 8,60 GB cabe en equipos Apple Silicon de gama alta (el autor lo prueba en un Mac Studio M3 Ultra con 512 GB), lo que permite ejecutar un modelo de 27B en local sin GPU dedicada.
- Servicio de API compatible con OpenAI: MTPLX expone el modelo con `mtplx serve`, de modo que se puede integrar como backend en aplicaciones existentes que ya consumen la API de OpenAI sin cambiar el código cliente.
- Generación de código asistida en estación de trabajo: con el drafter DFlash 2 las respuestas de código alcanzan unos 90 tok/s en el M3 Ultra, adecuado para autocompletado interactivo y revisión de código en local.
- Prototipado y experimentación con cuantización ternaria: el modelo sirve como referencia para investigar el impacto de la cuantización a 2 bits sobre un transformer de 27B, con métricas publicadas de KL y distancia de estados ocultos frente al maestro BF16.
- Evaluación de pipelines de Bittensor/Ingot: útil para replicar el proceso de selección de la subred, comparar candidatos y verificar la fidelidad de una cuantización respecto al maestro.
- Despliegue en entornos con restricciones de memoria: al ocupar 8,60 GB, permite servir un modelo de 27B en hardware donde un checkpoint BF16 equivalente (unos 55 GB) no cabría.
- Investigación sobre decodificación especulativa: el par modelo + drafter DFlash 2 permite medir la ganancia de throughput de la verificación especulativa en MLX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor sí publica métricas de fidelidad frente al maestro y de velocidad de decodificación.

| Metrica | Este modelo | Modelo vencedor anterior |
|---|---|---|
| KL(maestro ‖ modelo) | 0,08148 | 0,08278 |
| Distancia de estados ocultos (cada 8 capas) | 0,3106 | 0,3113 |

| Motor | Modo | Decodificación (tok/s) |
|---|---|---|
| MTPLX 2.12 (mlx 0.32), servidor | plain | 55,3 |
| mlx-lm 0.31 con kernels ternarios de MTPLX, en proceso | plain | 59,9 |
| Con drafter DFlash 2 (greedy, un stream) | especulativo | ~73 |
| Con drafter DFlash 2 (respuestas de código) | especulativo | ~90 |

Como referencia, el gemelo GGUF de estos pesos decodifica a 56,4 tok/s en el mismo Mac con el fork de llama.cpp de Dendrite y a 137 tok/s en una RTX PRO 6000.

## Requisitos de hardware

- VRAM/memoria: 8,60 GB de pesos en disco; en memoria unificada se necesita espacio para los pesos más el estado de inferencia y el contexto (no cuantificado en la información disponible).
- GPU recomendadas: Apple Silicon con GPU integrada; el autor valida en Mac Studio M3 Ultra (GPU de 80 núcleos, 512 GB de memoria unificada).
- ¿Cabe en GPU de consumo? No hay datos para GPUs NVIDIA de consumo; el formato MLX está orientado a Apple Silicon. El gemelo GGUF sí se ejecuta en RTX PRO 6000 según el autor.
- Opciones de despliegue: MTPLX (servidor compatible con OpenAI, `pip install mtplx`), mlx-lm 0.31 con los kernels ternarios de MTPLX en proceso, y el drafter DFlash 2 para decodificación especulativa. El formato `prism_hadamard_qwen35` no lo carga mlx-lm estándar.
- Latencia y throughput: 55,3 tok/s en servidor MTPLX y 59,9 tok/s en proceso con mlx-lm en M3 Ultra; hasta ~73 tok/s (greedy) y ~90 tok/s en código con el drafter DFlash 2.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Ingot-XXV-27B-MLX-2bit | 27,36B | 2-bit ternario (2,25 bpw) | no disponible | no disponible | safetensors MLX | Este modelo; 55-60 tok/s en M3 Ultra |
| prism-ml/Ternary-Bonsai-2-27B-mlx-2bit | 27B (aprox.) | 2-bit ternario | no disponible | no disponible | safetensors MLX | Modelo base de Prism ML; el minero reajustó los pesos |
| dendriteholdings/Ingot-XXV-27B-Q2 | 27B (aprox.) | 2-bit ternario | no disponible | no disponible | GGUF | Gemelo de estos pesos para llama.cpp; 56,4 tok/s en M3 Ultra y 137 tok/s en RTX PRO 6000 |
| Qwen3.8-27B (maestro) | 27B (aprox.) | BF16 | no disponible | no disponible | no disponible | Maestro de referencia usado en la evaluación de KL |

## Limitaciones y advertencias

- La licencia no está declarada en la información disponible; no se puede confirmar el uso comercial sin consultar el repositorio y el modelo base.
- El modelo es una cuantización ternaria a 2 bits: la fidelidad al maestro es alta pero no perfecta (KL de 0,08148), por lo que puede degradar tareas que exijan precisión numérica o razonamiento fino.
- No se dispone de datos sobre sesgos, idiomas soportados ni evaluación de alucinación; hay que asumir los sesgos heredados de Qwen3.8-27B y de Ternary Bonsai 2.
- La longitud de contexto no está documentada; no se debe asumir una ventana larga sin verificarla en la configuración de Prism ML.
- El layout `prism_hadamard_qwen35` no lo carga mlx-lm estándar; es necesario usar MTPLX o los kernels específicos, lo que limita la portabilidad.
- El repositorio no incluye la cabeza de borrador MTP, por lo que la decodificación es de un token por paso salvo que se empareje con el drafter DFlash 2.
- El modelo está orientado a Apple Silicon; para GPUs NVIDIA hay que usar el gemelo GGUF con el fork de llama.cpp de Dendrite.
- Es un modelo publicado como espejo de una competición (Ingot/Bittensor) con 0 descargas y 0 likes en el momento de la consulta; no hay validación independiente de su calidad.

## Enlaces

- [HuggingFace: dendriteholdings/Ingot-XXV-27B-MLX-2bit](https://huggingface.co/dendriteholdings/Ingot-XXV-27B-MLX-2bit)
- [Modelo base: prism-ml/Ternary-Bonsai-2-27B-mlx-2bit](https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-mlx-2bit)
- [Ternary Bonsai 2 27B (GGUF)](https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf)
- [Gemelo GGUF: dendriteholdings/Ingot-XXV-27B-Q2](https://huggingface.co/dendriteholdings/Ingot-XXV-27B-Q2)
- [Drafter especulativo: dendriteholdings/Ingot-27B-DFlash2-MLX](https://huggingface.co/dendriteholdings/Ingot-27B-DFlash2-MLX)
- [MTPLX (servidor MLX compatible con OpenAI)](https://github.com/youssofal/mtplx)
- [Fork de llama.cpp de Dendrite](https://github.com/DendriteLabs/llama.cpp)
