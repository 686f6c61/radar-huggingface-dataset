# dendriteholdings/Ingot-XXXIV-27B-MLX-2bit

## Resumen

Ingot-XXXIV-27B-MLX-2bit es un modelo de lenguaje de 27.359.638.768 parámetros (27,36 mil millones) publicado por dendriteholdings como espejo público de una submission ganadora en Ingot, un subnet de Bittensor en el que los mineros cuantizan un modelo profesor fijo y el validador corona la copia que permanece más cerca de él. El modelo parte de Ternary Bonsai 2 27B de Prism ML, un modelo ternario de 2 bits, y el minero modificó menos del 0,01% de sus códigos ternarios y reajustó el resto de pesos para acercarlo a Qwen3.8-27B.

La relevancia del modelo es doble: por un lado es un ejercicio de cuantización extrema a 2 bits (2,25 bits por peso efectivos) sobre un transformer de 27B, empaquetado específicamente para Apple Silicon mediante MLX; por otro, documenta de forma explícita la métrica de fidelidad al profesor (KL por token de respuesta) y el rendimiento de decodificación en hardware concreto (Mac Studio M3 Ultra), lo que permite evaluar la viabilidad de servir modelos de este tamaño en memoria unificada de consumo profesional.

El pack usa el layout `prism_hadamard_qwen35` de Prism ML, que mlx-lm no carga de forma nativa y requiere el motor MTPLX. El repositorio ocupa 8,6 GB y contiene un único `model.safetensors` con los pesos ternarios convertidos sin pérdida desde el GGUF gemelo del mismo autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (layout `prism_hadamard_qwen35`, pesos ternarios con escala y sesgo fp16 por bloque de 128 pesos) |
| Parametros totales | 27.359.638.768 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 2 bits ternario (2,25 bits por peso: códigos de 2 bits, escala fp16 y sesgo −d por cada 128 pesos); pack MLX affine 2-bit |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX), 8,60 GB en un único archivo |

## Arquitectura y entrenamiento

El modelo es un transformer de 27,36B parámetros cuyos pesos están cuantizados a valores ternarios (2 bits) con una escala fp16 y un sesgo de −d compartidos por cada bloque de 128 pesos, siguiendo el layout `prism_hadamard_qwen35` de Prism ML, que incorpora vectores de signo de Hadamard para la rotación previa a la cuantización. El punto de partida es Ternary Bonsai 2 27B de Prism ML, a su vez derivado de Qwen3.8-27B; el minero de Ingot modificó menos del 0,01% de los códigos ternarios y reajustó el resto de pesos para reducir la divergencia respecto al profesor.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO. La conversión a MLX es sin pérdida respecto al GGUF del mismo autor: cada bloque de 128 pesos conserva sus códigos ternarios y su escala fp16 como valores affine 2-bit de MLX, de modo que cada peso decodifica al mismo número que usa el kernel GGUF. La torre de visión, la configuración, el tokenizador y los vectores de signo de Hadamard provienen de `prism-ml/Ternary-Bonsai-2-27B-mlx-2bit` y no son modificados por la competición, lo que sugiere que el modelo base incorpora capacidad multimodal de visión, aunque la model card no detalla su funcionamiento en este pack.

## Capacidades

- Generación de texto y conversación multi-turno (pipeline `text-generation`, tags `conversational`).
- Pesos ternarios de 2 bits con fidelidad medida al profesor BF16: KL de 0,08419 por token de respuesta en la evaluación ganadora.
- Capacidad de visión heredada del modelo base de Prism ML (torre de visión incluida en el pack), aunque no se documentan detalles de uso.
- Razonamiento y generación de código: los benchmarks de velocidad se miden sobre un prompt de código y las respuestas de código alcanzan mayor throughput con el drafter especulativo.
- Soporte de decodificación especulativa mediante un drafter DFlash 2 externo (`dendriteholdings/Ingot-27B-DFlash2-MLX`), que acelera la generación greedy.
- Servido como API compatible con OpenAI a través de MTPLX.
- Tool calling, function calling y comportamiento agéntico: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en Apple Silicon con memoria unificada: el pack de 8,6 GB cabe en equipos con 16 GB o más de memoria unificada y se sirve con MTPLX como API compatible con OpenAI, lo que permite desplegar un modelo de 27B en un Mac sin GPU dedicada.
- Evaluación de cuantización extrema: el modelo sirve como referencia para medir cuánto se degrada un transformer de 27B al pasar a 2 bits ternarios, usando la métrica KL frente al profesor BF16 (0,08419 en la eval ganadora frente a 0,08602 del rey anterior).
- Generación de código asistida en local: con el drafter DFlash 2 se alcanzan unos 90 tok/s en respuestas de código en un M3 Ultra, adecuado para autocompletado y chat de código en estaciones de trabajo Mac.
- Investigación sobre subnets de Bittensor e incentivos de cuantización: el repositorio documenta el hotkey del minero, el identificador de submission y la métrica de coronación, lo que facilita reproducir y auditar el proceso.
- Prototipado de asistentes conversacionales: al exponerse como API compatible con OpenAI vía MTPLX, se integra en frameworks de agentes y chat sin adaptadores específicos.
- Comparación de motores de inferencia: los datos de velocidad permiten contrastar MTPLX (55,3 tok/s en servidor, 59,9 tok/s en proceso) frente al fork de llama.cpp de Dendrite (56,4 tok/s en el mismo Mac y 137 tok/s en una RTX PRO 6000).
- Despliegue en entornos con restricciones de memoria: el formato de 2,25 bits por peso reduce el footprint a 8,6 GB, lo que posibilita servir el modelo en GPUs de consumo con suficiente VRAM mediante el GGUF gemelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible. Los únicos datos cuantitativos publicados son métricas de fidelidad al profesor y de velocidad de decodificación.

| Metrica | Valor |
|---|---|
| KL (teacher ‖ model) por token de respuesta, eval ganadora | 0,08419 |
| KL del rey anterior en la misma eval | 0,08602 |
| Decode tok/s, MTPLX 2.12 (mlx 0.32) servidor, modo plain, batch 1 | 55,3 |
| Decode tok/s, mlx-lm 0.31 con kernels ternarios de MTPLX, in-process, modo plain | 59,9 |
| Decode tok/s, GGUF gemelo en fork llama.cpp de Dendrite, mismo Mac | 56,4 |
| Decode tok/s, GGUF gemelo en RTX PRO 6000 | 137 |
| Decode tok/s con drafter DFlash 2, greedy single-stream | ~73 (hasta ~90 en código) |

Las mediciones de velocidad se realizaron en un Mac Studio M3 Ultra (GPU de 80 núcleos, 512 GB). Los números de servidor corresponden a 256 tokens generados sobre un prompt de código medidos por HTTP; los in-process, a 128 tokens sin servidor.

## Requisitos de hardware

- VRAM/memoria estimada: 8,6 GB para los pesos en 2 bits; el runtime MLX añade overhead adicional no cuantificado en la información disponible.
- Cabe en Apple Silicon con memoria unificada: validado en Mac Studio M3 Ultra (80 núcleos GPU, 512 GB); por tamaño, debería caber en equipos con 16 GB o más de memoria unificada, aunque no se confirma en la información proporcionada.
- GPU recomendadas: Apple Silicon (M-series) para el pack MLX; el GGUF gemelo se ha medido en una RTX PRO 6000 y en el mismo Mac Studio.
- Opciones de despliegue: MTPLX (`pip install mtplx`, servidor compatible con OpenAI), mlx-lm 0.31 con los kernels ternarios de MTPLX, y el fork de llama.cpp de Dendrite para el GGUF gemelo.
- Latencia y throughput: 55,3 tok/s en servidor MTPLX y 59,9 tok/s in-process en M3 Ultra; con el drafter DFlash 2, unos 73 tok/s en greedy single-stream y hasta unos 90 tok/s en código.
- Nota: este repositorio no incluye cabeza MTP de borrador, por lo que MTPLX decodifica un token por paso salvo que se use el drafter externo.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Ingot-XXXIV-27B-MLX-2bit | 27,36B | 2 bits ternario (2,25 bpw) | no disponible | no disponible | safetensors (MLX) | KL 0,08419; 55,3 tok/s en M3 Ultra |
| Ingot-XXXIV-27B-Q2 (GGUF gemelo) | 27,36B | 2 bits ternario | no disponible | no disponible | GGUF | 56,4 tok/s en M3 Ultra; 137 tok/s en RTX PRO 6000 |
| prism-ml/Ternary-Bonsai-2-27B-mlx-2bit | 27B (aproximado) | 2 bits ternario | no disponible | no disponible | safetensors (MLX) | Modelo base de Prism ML; aporta torre de visión, config y tokenizador |
| prism-ml/Ternary-Bonsai-2-27B-gguf | 27B (aproximado) | 2 bits ternario | no disponible | no disponible | GGUF | Modelo base original en formato GGUF |

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si se permite uso comercial; hay que contactar con el autor antes de usarlo en producción.
- Idiomas soportados no documentados: no hay garantía de cobertura multilingüe ni de calidad fuera del inglés.
- Longitud de contexto no documentada: no se puede planificar su uso en tareas de contexto largo sin verificación empírica.
- Cuantización extrema a 2 bits: aunque la KL frente al profesor sea baja (0,08419), la fidelidad se mide sobre distribuciones de next-token y no garantiza calidad en razonamiento complejo, matemáticas o código.
- Riesgo de alucinación: no hay evaluación publicada de factualidad ni de tasas de alucinación.
- Sesgos: no se documentan análisis de sesgo del modelo base ni del ajuste del minero.
- Procedencia: es una submission de un minero anónimo (hotkey `5HBtAf19R2ZbCJg38MaMx2YTJnfx78rQwF4sHHTVrKBG97A3`, uid 180) en una competición de cuantización; no hay garantía de auditoría independiente más allá de la métrica del validador.
- Compatibilidad: mlx-lm no carga el layout `prism_hadamard_qwen35` de forma nativa; requiere MTPLX u otro runtime compatible.
- Sin cabeza MTP en este repositorio: la decodificación especulativa exige descargar el drafter DFlash 2 por separado.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: poca validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dendriteholdings/Ingot-XXXIV-27B-MLX-2bit
- Modelo base MLX de Prism ML: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-mlx-2bit
- Modelo base GGUF de Prism ML: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- GGUF gemelo del mismo autor: https://huggingface.co/dendriteholdings/Ingot-XXXIV-27B-Q2
- Drafter DFlash 2 para decodificación especulativa: https://huggingface.co/dendriteholdings/Ingot-27B-DFlash2-MLX
- Motor MTPLX: https://github.com/youssofal/mtplx
- Fork de llama.cpp de Dendrite Labs: https://github.com/DendriteLabs/llama.cpp
