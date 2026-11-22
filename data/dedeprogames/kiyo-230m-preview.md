# DedeProGames/Kiyo-230M-Preview

## Resumen

Kiyo-230M-Preview es un checkpoint intermedio de un modelo de lenguaje decoder-only desarrollado por DedeProGames, entrenado desde cero sobre FineWeb-Edu, DCLM-Baseline, FineMath y Stack-v3-train. Se publica como avance de un entrenamiento en curso: concretamente, el estado de los pesos corresponde al paso de optimizador 81.500 de una tirada planificada de unos 381.470 pasos, con un presupuesto objetivo de 200.000 millones de tokens del que este checkpoint ha consumido 42.729.472.000 (un 21,4%).

La arquitectura sigue la familia SmolLM2: decoder tipo Llama con 32 capas, tamaño oculto de 768, atención con query agrupada (12 cabezas de atención y 4 cabezas KV), SwiGLU, RMSNorm, RoPE con theta 10.000 y embeddings de entrada y salida atados. Reutiliza el vocabulario de 49.152 tokens de SmolLM2 y declara 229.688.064 parámetros totales. La longitud de contexto es de 2.048 tokens.

Su relevancia es limitada y de naturaleza experimental: sirve para inspeccionar el estado de un entrenamiento a escala pequeña antes de su publicación final, no como modelo listo para producción. El propio autor advierte que el learning rate sigue en su fase estable (1,2e-3) y que la fase de decaimiento no ha comenzado, por lo que los resultados publicados infravaloran el modelo final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder tipo Llama (familia SmolLM2), GQA, SwiGLU, RMSNorm, RoPE |
| Parametros totales | 229.688.064 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | No disponible (solo se publican pesos safetensors en bf16/fp16) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

Datos arquitectonicos adicionales: 32 capas, hidden size 768, intermediate size 1.920, 12 cabezas de atencion, 4 cabezas KV, dimension de cabeza 64, vocabulario de 49.152 tokens, embeddings atados, RoPE theta 10.000. Tamano del repositorio: 0,5 GB.

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de estilo Llama, con atencion de query agrupada (GQA) para reducir el coste de la cache KV, normalizacion RMSNorm, MLP con activacion SwiGLU y codificacion posicional rotatoria RoPE. Los embeddings de entrada y salida estan atados, lo que reduce el recuento de parametros. La familia arquitectonica y el vocabulario provienen de SmolLM2-135M, que se cita como modelo base de referencia.

El entrenamiento parte de cero (pretraining from scratch) sobre una mezcla de cuatro corpus: FineWeb-Edu al 45,0%, DCLM-Baseline al 30,0%, Stack-v3-train al 17,5% y FineMath al 7,5%. La porcion de codigo se muestrea con probabilidades de retencion por lenguaje sobre 32 lenguajes de programacion curados, de modo que cada lenguaje recibe una cuota de tokens equilibrada en lugar de heredar el sesgo natural del corpus. Se procesan 524.288 tokens por paso de optimizador, con learning rate pico de 1,2e-3 y un schedule warmup-stable-decay basado en 1/sqrt cuya fase de decaimiento cubre solo el 10% final de los pasos (a partir del paso ~343.320). En este checkpoint no se ha alcanzado dicha fase. No se documenta el uso de RLHF, DPO ni instruccion posterior: es un modelo base.

## Capacidades

- Generacion de texto por continuacion (modelo base, no instruction-tuned): completa y continua texto en lugar de seguir instrucciones.
- Fluidez gramatical y linguistica en ingles, segun la propia model card, en tareas de continuacion.
- Generacion de codigo a nivel competente, favorecida por el 17,5% de Stack-v3-train en la mezcla.
- Razonamiento matematico basico, apoyado por el 7,5% de FineMath.
- Capacidades multilingues: no disponibles; el modelo declara exclusivamente ingles.
- Tool calling / function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible; el autor indica debilidad en logica multi-paso y seguimiento de contexto.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Investigacion sobre dinamica de entrenamiento: el checkpoint permite inspeccionar como evoluciona un modelo de 230M durante la fase estable del learning rate, comparando el estado intermedio con el release final cuando se publique.
- Experimentos de continuacion de texto controlados: util para estudiar la fluidez gramatical de un modelo pequeno en tareas de language modeling sin instrucciones, por ejemplo en evaluacion de perplejidad sobre dominios concretos.
- Prototipado de pipelines de generacion de codigo a pequena escala: el peso del 17,5% de codigo en la mezcla permite probar completado de fragmentos en entornos de desarrollo antes de invertir en modelos mayores.
- Validacion de infraestructura de despliegue: con 0,5 GB de pesos en safetensors, sirve para verificar integraciones con transformers, text-generation-inference o endpoints compatibles antes de migrar a modelos de mayor tamano.
- Docencia y divulgacion: ejemplo realista de arquitectura Llama con GQA y embeddings atados para explicar decisiones de diseno en modelos pequenos.
- Pruebas de evaluacion comparativa (benchmarking) de modelos por debajo de 300M: referencia para medir el efecto del presupuesto de tokens y del annealing en tareas como ARC-Easy, PIQA, ARC-Challenge y HellaSwag.

## Benchmarks y rendimiento

Resultados zero-shot con `acc_norm,none`, en porcentaje. Los valores en negrita corresponden a Kiyo-230M-Preview.

| Benchmark | Kiyo-230M-Preview | Supra2-100M-Base | GPT-X2.5-135M | SmolLM2-135M |
|---|---:|---:|---:|---:|
| ARC-Easy | 49,54% | 47,81% | 51,81% | 58,63% |
| PIQA | 64,09% | 65,40% | 69,42% | 68,44% |
| ARC-Challenge | 26,11% | 24,83% | 29,18% | 29,69% |
| HellaSwag | 35,94% | 35,98% | 40,57% | 43,22% |

El autor advierte que estas cifras corresponden a un checkpoint en la fase estable del learning rate y que los modelos evaluados a mitad de meseta puntuan sistematicamente por debajo de lo que alcanzan los mismos pesos tras el annealing. No se han publicado otros benchmarks (MMLU, GSM8K, HumanEval) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en bf16/fp16 (229,7M parametros), alrededor de 0,25 GB en cuantizacion de 8 bits y unos 0,13 GB en 4 bits, sin contar la cache KV ni el overhead del runtime.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; tarjetas como RTX 3060, RTX 4060, RTX 4090, A100 o H100 son mas que suficientes. Tambien cabe en CPU.
- Cabe en GPU de consumo: si, en practicamente todas las GPU de consumo modernas e incluso en iGPU con memoria compartida.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference`) y endpoints compatibles; no se documentan pesos GGUF, por lo que llama.cpp u Ollama requeririan conversion previa.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado | Rendimiento destacado |
|---|---:|---:|---|---|---|
| Kiyo-230M-Preview | 229,7M | 2.048 | Apache 2.0 | Checkpoint intermedio (21,4% del presupuesto) | ARC-Easy 49,54%; PIQA 64,09% |
| SmolLM2-135M | 135M | No disponible en la informacion | No disponible en la informacion | Modelo final | ARC-Easy 58,63%; PIQA 68,44%; HellaSwag 43,22% |
| GPT-X2.5-135M | 135M | No disponible | No disponible | No disponible | ARC-Easy 51,81%; PIQA 69,42% |
| Supra2-100M-Base | 100M | No disponible | No disponible | No disponible | ARC-Easy 47,81%; PIQA 65,40% |

La comparacion directa es desfavorable por diseno: Kiyo-230M-Preview tiene mas parametros que SmolLM2-135M pero ha visto 42,7B tokens frente a los 200B del entrenamiento completo de este ultimo, y aun no ha entrado en la fase de decaimiento del learning rate. Los datos de contexto y licencia de los modelos comparados no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Es un checkpoint intermedio, no un release: los pesos cambiaran y no deben tratarse como la version final de Kiyo-230M.
- No esta instruction-tuned: no sigue instrucciones, solo continua texto. No es adecuado para asistentes conversacionales sin ajuste posterior.
- El learning rate sigue en el pico (1,2e-3) sin decaer; los benchmarks publicados infravaloran el modelo final, pero tambien reflejan un estado no optimizado.
- Debilidad en logica multi-paso y seguimiento de contexto: el autor indica que en los items mas dificiles el rendimiento se acerca al azar.
- Ventana de contexto de solo 2.048 tokens, insuficiente para documentos largos o conversaciones extensas.
- Solo ingles; no hay soporte multilingue declarado.
- Riesgo de alucinacion: puede generar hechos incorrectos y no debe usarse en decisiones de alto impacto sin verificacion.
- Riesgo de repeticion o deriva en generaciones largas; se recomienda fijar un limite finito de tokens nuevos.
- Licencia Apache 2.0: permite uso comercial, pero el estado de preview y las limitaciones tecnicas desaconsejan su uso en produccion.
- Sesgos: no se documentan evaluaciones de sesgo en la informacion disponible; los corpus web (FineWeb-Edu, DCLM-Baseline) pueden introducir sesgos propios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DedeProGames/Kiyo-230M-Preview
- SmolLM2-135M (familia arquitectonica y vocabulario de referencia): https://huggingface.co/HuggingFaceTB/SmolLM2-135M
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset DCLM-Baseline: https://huggingface.co/datasets/mlfoundations/dclm-baseline-1.0
- Dataset FineMath: https://huggingface.co/datasets/HuggingFaceTB/finemath
- Dataset Stack-v3-train: https://huggingface.co/datasets/HuggingFaceCode/stack-v3-train
