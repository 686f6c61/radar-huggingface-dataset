# dendriteholdings/Ingot-IX-9B-MLX-2bit

## Resumen

Ingot-IX-9B-MLX-2bit es un modelo de generación de texto derivado de Prism ML Ternary Bonsai 2 9B, publicado por dendriteholdings como espejo público del ganador de la competición Ingot, una subred de Bittensor en la que los mineros cuantizan un modelo profesor fijo y el validador selecciona la copia que permanece más próxima a él. El resultado es un modelo ternario de 9.410.903.280 parámetros (9,4 mil millones) empaquetado en formato MLX affine de 2 bits para Apple Silicon, con un tamaño de 3,46 GB en safetensors.

La propuesta técnica es una cuantización extrema: cada bloque de 128 pesos conserva sus códigos ternarios y una escala fp16, de modo que cada peso se decodifica al mismo valor numérico que emplea el kernel gguf del modelo original. El minero reajustó los pesos restantes para acercar la salida a Qwen3.5-9B, el profesor de referencia, manteniendo intactos el vision tower, la configuración, el tokenizer y los vectores de signo de Hadamard de Prism ML.

Su relevancia es doble: por un lado, demuestra que la cuantización ternaria de 2 bits puede acercarse al profesor con una divergencia KL de 0,06486 frente a 0,06788 del modelo que ostentaba el trono; por otro, valida un mecanismo de evaluación competitiva on-chain para cuantizaciones. El modelo está pensado exclusivamente para ejecución en Apple Silicon mediante la librería MLX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen3.5-9B, layout `prism_hadamard_qwen35`), con vision tower |
| Parametros totales | 9.410.903.280 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Ternaria 2-bit con escala fp16 y bias por bloque de 128 pesos (2,25 bits por peso efectivos) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX affine 2-bit); existe un gemelo en GGUF |
| Tamano del repo | 3,5 GB (`model.safetensors`: 3,46 GB) |
| Libreria | mlx |

## Arquitectura y entrenamiento

El modelo parte de Ternary Bonsai 2 9B de Prism ML, un transformer de 9,4 mil millones de parámetros con vision tower, configurado bajo el layout `prism_hadamard_qwen35`, que aplica transformaciones de Hadamard con vectores de signo para estabilizar la cuantización. La cuantización ternaria agrupa los pesos en bloques de 128 y almacena códigos ternarios junto con una escala fp16 y un bias igual a menos la escala, de forma que la decodificación MLX reproduce exactamente el valor que produce el kernel gguf original.

El proceso de refinamiento consistió en un fine-tune de los pesos no ternarios por parte del minero `5GGqRio7owCtnzEeuS7v7FYi1k1BXUaS2pRfDrjm3DzLLPgx` (uid 238), con el objetivo de minimizar la divergencia KL entre las distribuciones de siguiente token del modelo y las del profesor Qwen3.5-9B en BF16. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO. La conversión a MLX se realizó sin pérdida: cada bloque de 128 pesos mantiene sus códigos ternarios y su escala fp16 como valores affine 2-bit de MLX.

## Capacidades

- Generación de texto y conversación multi-turno, con pipeline declarado `text-generation` y `conversational`.
- Razonamiento y conocimiento general heredados del profesor Qwen3.5-9B, sujetos a la degradación propia de una cuantización ternaria.
- Procesamiento de visión: el vision tower de Prism ML se conserva intacto en el paquete.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.
- Ejecución en Apple Silicon mediante MLX a través de MTPLX, que expone una API compatible con OpenAI.

## Casos de uso

- Inferencia local en Mac con memoria unificada limitada: con 3,46 GB de pesos, el modelo cabe holgadamente en equipos de 16 GB o 24 GB de memoria unificada, lo que permite ejecutar un modelo de 9,4 mil millones de parámetros en un portátil Apple Silicon sin GPU dedicada.
- Prototipado de asistentes conversacionales en local: MTPLX sirve el modelo como API compatible con OpenAI en el puerto 8080, de modo que se puede conectar a clientes y frameworks existentes sin adaptar código.
- Evaluación de técnicas de cuantización: el modelo sirve como referencia reproducible para comparar la calidad de cuantizaciones ternarias frente al profesor BF16, con una métrica KL documentada de 0,06486.
- Investigación en competiciones on-chain de modelos: el repositorio documenta el identificador de envío y la hotkey del minero, lo que facilita reproducir y auditar el proceso de selección de la subred Ingot.
- Tareas de visión en local: al conservar el vision tower original, el modelo puede emplearse para tareas multimodal imagen-texto en entornos Apple Silicon, siempre que el runtime MLX soporte las capas de visión.
- Despliegue de bajo consumo en pipelines de generación de texto: el formato ternario reduce el ancho de banda de memoria y el consumo energético frente a un modelo de 9B en fp16, adecuado para servicios con restricciones de recursos.
- Docencia y demostraciones de cuantización extrema: el contraste entre este paquete MLX y su gemelo GGUF permite ilustrar cómo un mismo conjunto de pesos ternarios se materializa en dos runtimes distintos.

## Benchmarks y rendimiento

La model card solo publica una métrica de fidelidad al profesor: la divergencia KL por token de respuesta frente al profesor Qwen3.5-9B en BF16, ponderada por dominio.

| Metrica | Este modelo | Modelo que ostentaba el trono |
|---|---|---|
| KL(profesor ‖ modelo) en la evaluacion ganadora | 0,06486 | 0,06788 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 3,46 GB para los pesos en safetensors; el consumo real en memoria unificada es algo mayor por el contexto KV y las capas fp16 no cuantizadas.
- Cabe en GPU de consumo: sí, en cualquier Mac con Apple Silicon y al menos 8 GB de memoria unificada; recomendable 16 GB o más para contextos largos.
- GPU recomendadas: Apple Silicon (M1, M2, M3, M4 y variantes Pro, Max y Ultra) con memoria unificada suficiente. No es compatible con CUDA de forma nativa en este paquete MLX.
- Opciones de despliegue: MTPLX (`mtplx serve --model dendriteholdings/Ingot-IX-9B-MLX-2bit --generation-mode ar --port 8080 --no-auth --yes`), que expone API compatible con OpenAI. mlx-lm no carga el layout `prism_hadamard_qwen35`. El gemelo GGUF funciona en el fork Dendrite de llama.cpp.
- Latencia y throughput: no disponibles. El repositorio no incluye cabeza draft MTP, por lo que MTPLX decodifica un token por paso, sin decodificación especulativa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ingot-IX-9B-MLX-2bit | 9,41 B | no disponible | MLX affine 2-bit (safetensors) | no disponible | Hugging Face, runtime MTPLX |
| dendriteholdings/Ingot-IX-9B-Q2 | 9,41 B (mismos pesos ternarios) | no disponible | GGUF | no disponible | Hugging Face, fork Dendrite de llama.cpp |
| prism-ml/Ternary-Bonsai-2-9B-mlx-2bit | 9,41 B | no disponible | MLX affine 2-bit (safetensors) | no disponible | Hugging Face, runtime MTPLX |
| prism-ml/Ternary-Bonsai-2-9B-gguf | 9,41 B | no disponible | GGUF | no disponible | Hugging Face, llama.cpp |

No se dispone de datos de rendimiento en benchmarks estándar para comparar cualitativamente con alternativas de la misma categoría.

## Limitaciones y advertencias

- La cuantización ternaria de 2 bits introduce degradación frente al profesor BF16; la divergencia KL de 0,06486 es pequeña pero no nula, y puede manifestarse en tareas sensibles a la precisión numérica.
- No se ha publicado información sobre sesgos del modelo ni sobre la composición del dataset de entrenamiento, lo que impide auditar riesgos de sesgo.
- Riesgo de alucinación: inherente a los modelos generativos de esta escala; la cuantización agresiva puede incrementarlo en dominios especializados.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido. Es un caveat crítico para producción.
- Idiomas soportados no disponibles: no se puede garantizar el rendimiento multilingüe fuera del inglés sin evaluación previa.
- Longitud de contexto no disponible: no se puede planificar el despliegue en escenarios de contexto largo sin verificarla experimentalmente.
- Dependencia de runtime: mlx-lm no carga el layout `prism_hadamard_qwen35`; es necesario usar MTPLX o el fork Dendrite de llama.cpp para el gemelo GGUF.
- Sin cabeza draft MTP: la decodificación es de un token por paso, lo que limita el throughput frente a configuraciones con decodificación especulativa.
- El modelo es un espejo de un envío de competición; no ha pasado por un proceso de publicación y revisión estándar de un laboratorio, y su mantenimiento futuro no está garantizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dendriteholdings/Ingot-IX-9B-MLX-2bit
- Gemelo GGUF: https://huggingface.co/dendriteholdings/Ingot-IX-9B-Q2
- Modelo base MLX de Prism ML: https://huggingface.co/prism-ml/Ternary-Bonsai-2-9B-mlx-2bit
- Modelo base GGUF de Prism ML: https://huggingface.co/prism-ml/Ternary-Bonsai-2-9B-gguf
- Runtime MTPLX: https://github.com/youssofal/mtplx
- Fork Dendrite de llama.cpp: https://github.com/DendriteLabs/llama.cpp
