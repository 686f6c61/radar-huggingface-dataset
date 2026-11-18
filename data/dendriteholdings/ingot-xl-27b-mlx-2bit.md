# dendriteholdings/Ingot-XL-27B-MLX-2bit

## Resumen

Ingot-XL-27B-MLX-2bit es un modelo de lenguaje de 27 359 638 768 parámetros (aproximadamente 27,36 B) publicado por dendriteholdings como espejo público del ganador de Ingot, un subnet de Bittensor en el que los mineros cuantizan un modelo profesor fijo y el validador premia la copia que más se le aproxima. El modelo parte de prism-ml/Ternary-Bonsai-2-27B-mlx-2bit, un modelo ternario de Prism ML, y ha sido refinado por el minero para acercar sus pesos a Qwen3.8-27B conservando los códigos ternarios originales.

Se distribuye exclusivamente en formato MLX con cuantización afín de 2 bits (códigos ternarios con escala fp16 y sesgo por cada bloque de 128 pesos), lo que da 2,25 bits por peso y un repositorio de 8,6 GB. Está pensado para ejecutarse en Apple Silicon mediante MTPLX, ya que mlx-lm no carga el layout `prism_hadamard_qwen35` que emplea el pack.

Su relevancia es doble: por un lado demuestra que la cuantización extrema a 2 bits puede mantener una divergencia baja respecto al profesor (KL de 0,07180 frente a 0,07333 del rey anterior en la misma evaluación); por otro, documenta con detalle el rendimiento de decodificación en hardware Apple (55,3-59,9 tok/s en un Mac Studio M3 Ultra) y ofrece un drafter especulativo opcional que eleva la velocidad hasta unos 73 tok/s en texto y unos 90 tok/s en código.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.8-27B, layout `prism_hadamard_qwen35`), pesos ternarios con cuantización afín MLX |
| Parametros totales | 27 359 638 768 (27,36 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 2 bits afín (códigos ternarios, escala fp16 y sesgo −d por cada bloque de 128 pesos); 2,25 bits por peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX), `model.safetensors` de 8,60 GB |

## Arquitectura y entrenamiento

El modelo es un transformer de 27,36 B de parámetros cuyos pesos se almacenan en códigos ternarios. Cada bloque de 128 pesos conserva su código ternario y una escala fp16 con sesgo igual a −d, de modo que cada peso decodifica al mismo valor numérico que usa el kernel GGUF del modelo gemelo. La torre de visión, la configuración, el tokenizador y los vectores de signo de Hadamard provienen íntegramente de prism-ml/Ternary-Bonsai-2-27B-mlx-2bit y no son modificados por la competición.

El entrenamiento no es un preentrenamiento desde cero, sino un refinamiento (finetune) sobre Ternary Bonsai 2 27B: el minero reajustó los pesos restantes manteniendo los códigos ternarios para acercar la distribución del modelo a la de Qwen3.8-27B. La selección se realizó en el subnet Ingot midiendo la divergencia KL entre las distribuciones de siguiente token del modelo y las del profesor BF16 sobre los tokens de respuesta de cada dominio, ponderadas por la proporción de muestras de cada dominio. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO.

## Capacidades

- Generación de texto y conversación multi-turno (pipeline `text-generation`).
- Razonamiento y respuesta conversacional, heredados de la base Qwen3.8-27B.
- Generación de código: la model card reporta velocidades específicas para prompts de código y un drafter que alcanza unos 90 tok/s en respuestas de código.
- Capacidades multimodales potenciales: el pack incluye la torre de visión de Prism, aunque la model card no detalla su funcionamiento ni su calidad tras la cuantización a 2 bits.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking: no disponible en la información proporcionada.
- Decodificación especulativa opcional mediante el drafter DFlash 2 (dendriteholdings/Ingot-27B-DFlash2-MLX).

## Casos de uso

- Inferencia local en Apple Silicon: el modelo está empaquetado en MLX y ocupa 8,6 GB, por lo que puede servirse en un Mac con memoria unificada suficiente mediante MTPLX con una API compatible con OpenAI, sin necesidad de GPUs dedicadas.
- Despliegue de bajo consumo en estaciones de trabajo Mac: con 55,3 tok/s en decodificación plana sobre un M3 Ultra, es adecuado para asistentes interactivos y generación de texto en local con latencia aceptable.
- Generación de código asistida en el editor: el drafter DFlash 2 eleva la decodificación a unos 90 tok/s en respuestas de código, lo que permite autocompletado y generación de fragmentos con latencia baja en un flujo de desarrollo sobre Mac.
- Evaluación de técnicas de cuantización extrema: el modelo sirve como referencia reproducible para estudiar la degradación de un transformer de 27 B a 2,25 bits por peso, con métricas KL publicadas frente al profesor.
- Investigación sobre subnets de Bittensor e Ingot: permite reproducir y auditar el proceso de selección del minero ganador, comparando el KL del modelo con el del rey anterior (0,07180 frente a 0,07333).
- Servicio de API compatible con OpenAI en local: MTPLX expone el modelo como endpoint HTTP, lo que facilita integrarlo en prototipos y pipelines existentes que ya consumen la API de OpenAI.
- Comparación MLX frente a GGUF/llama.cpp: al existir un gemelo GGUF de los mismos pesos, permite medir diferencias de rendimiento entre el stack de Apple y el fork Dendrite de llama.cpp (56,4 tok/s en el mismo Mac, 137 tok/s en una RTX PRO 6000).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card sí publica métricas de fidelidad al profesor y de velocidad de decodificación.

| Metrica | Valor |
|---|---|
| KL(profesor ‖ modelo), evaluación ganadora | 0,07180 |
| KL(profesor ‖ modelo), rey anterior en la misma evaluación | 0,07333 |
| Decodificación, MTPLX 2.12 (mlx 0.32) servidor, batch 1 | 55,3 tok/s |
| Decodificación, mlx-lm 0.31 con kernels ternarios de MTPLX, in-process | 59,9 tok/s |
| Decodificación con drafter DFlash 2, greedy single-stream | ~73 tok/s (desde 59) |
| Decodificación con drafter DFlash 2, respuestas de código | ~90 tok/s |
| Gemelo GGUF en fork Dendrite llama.cpp, mismo Mac | 56,4 tok/s |
| Gemelo GGUF en RTX PRO 6000 | 137 tok/s |

Las mediciones de velocidad se realizaron en un Mac Studio M3 Ultra con GPU de 80 núcleos y 512 GB de memoria unificada. Los números de servidor corresponden a 256 tokens generados sobre un prompt de código medidos por HTTP; los in-process, a 128 tokens sin servidor.

## Requisitos de hardware

- VRAM/memoria: el repositorio pesa 8,60 GB en safetensors; se necesita al menos esa cantidad de memoria unificada más el espacio para KV cache y overhead del runtime. La cifra exacta de memoria en ejecución no está disponible.
- GPU recomendadas: Apple Silicon con memoria unificada suficiente; las mediciones publicadas usan un Mac Studio M3 Ultra (GPU de 80 núcleos, 512 GB).
- Compatibilidad con GPU consumer: no se documenta soporte para GPUs NVIDIA o AMD en este pack MLX; el gemelo GGUF sí se ejecuta en una RTX PRO 6000 según la model card del modelo Q2.
- Opciones de despliegue: MTPLX (servidor compatible con OpenAI) es el runtime documentado; mlx-lm no carga el layout `prism_hadamard_qwen35`. Para el gemelo GGUF, el fork Dendrite de llama.cpp.
- Latencia y throughput: 55,3 tok/s en servidor MTPLX y 59,9 tok/s in-process en M3 Ultra; con el drafter DFlash 2, unos 73 tok/s en texto y unos 90 tok/s en código.
- Este repositorio no incluye cabeza MTP de borrador, por lo que MTPLX decodifica un token por paso salvo que se use el drafter externo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ingot-XL-27B-MLX-2bit | 27,36 B | no disponible | 2 bits afín (2,25 bpw) | no disponible | MLX, safetensors, 8,6 GB |
| Ingot-XL-27B-Q2 (gemelo GGUF) | 27,36 B (mismos pesos) | no disponible | 2 bits ternario | no disponible | GGUF para fork Dendrite de llama.cpp |
| prism-ml/Ternary-Bonsai-2-27B-mlx-2bit (base) | 27 B | no disponible | 2 bits ternario | no disponible | MLX |
| Qwen3.8-27B (profesor de referencia) | 27 B | no disponible | BF16 | no disponible | no disponible en la información |

El modelo se diferencia de su base por el refinamiento de pesos del minero y de su gemelo GGUF por el formato y el runtime (MLX/MTPLX frente a llama.cpp). La comparación de rendimiento entre ambos gemelos es directa: 55,3-59,9 tok/s en MLX sobre M3 Ultra frente a 56,4 tok/s en llama.cpp sobre el mismo equipo.

## Limitaciones y advertencias

- La licencia no está declarada en la información disponible, por lo que no puede confirmarse el uso comercial.
- No se especifican los idiomas soportados; el comportamiento multilingüe es incierto.
- La cuantización a 2,25 bits por peso implica una degradación respecto al profesor BF16, cuantificada en un KL de 0,07180; en tareas sensibles a la fidelidad de distribución puede ser insuficiente.
- El modelo es un derivado de un proceso de competición (Ingot) y no se documentan sesgos, filtros de seguridad ni evaluaciones de alucinación.
- El layout `prism_hadamard_qwen35` no es compatible con mlx-lm estándar; requiere MTPLX u otro runtime que lo soporte, lo que limita las opciones de despliegue.
- El repositorio no incluye cabeza MTP de borrador; sin el drafter DFlash 2 externo la decodificación es de un token por paso.
- No hay información sobre la longitud de contexto efectiva ni sobre el rendimiento en contextos largos.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria independiente.
- No se documentan restricciones de uso derivadas del modelo base más allá de las que imponga Prism ML.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dendriteholdings/Ingot-XL-27B-MLX-2bit
- Gemelo GGUF: https://huggingface.co/dendriteholdings/Ingot-XL-27B-Q2
- Modelo base: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-mlx-2bit
- Modelo base en GGUF: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Drafter especulativo DFlash 2: https://huggingface.co/dendriteholdings/Ingot-27B-DFlash2-MLX
- Runtime MTPLX: https://github.com/youssofal/mtplx
- Fork Dendrite de llama.cpp: https://github.com/DendriteLabs/llama.cpp
