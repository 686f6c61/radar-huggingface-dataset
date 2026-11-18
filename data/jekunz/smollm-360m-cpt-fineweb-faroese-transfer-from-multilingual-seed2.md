# jekunz/smollm-360m-cpt-fineweb-faroese-transfer-from-multilingual-seed2

## Resumen

SmolLM2-360M-Instruct adaptado al feroés mediante entrenamiento continuado (continued pre-training, CPT) sobre el corpus FineWeb-2. Lo desarrolla el usuario `jekunz` como parte de un experimento de investigación sobre transferencia lingüística entre lenguas germánicas nórdicas: primero se ajusta conjuntamente con datos de danés, islandés, noruego bokmål, noruego nynorsk y sueco, y después se especializa en feroés. El objetivo es evaluar si un modelo pequeño preentrenado mayoritariamente en inglés puede adquirir competencia en una lengua de bajos recursos mediante un currículo de transferencia desde lenguas emparentadas.

El modelo parte de la arquitectura Llama de SmolLM2-360M-Instruct (361.821.120 parámetros reales según los pesos en safetensors) y conserva su naturaleza instructiva y conversacional, aunque el ajuste se ha realizado únicamente con texto crudo de FineWeb-2, sin una fase posterior de instrucciones en feroés documentada. Esto lo convierte en una pieza de investigación más que en un asistente listo para producción en feroés.

Es relevante por dos motivos: por un lado, demuestra una metodología reproducible de adaptación de lenguas de bajos recursos con recursos mínimos (una sola A100 de 40 GB); por otro, la variante `seed2` forma parte de una terna de semillas que permite medir la varianza del entrenamiento, algo poco habitual en modelos de este tamaño y útil para investigar la estabilidad del CPT en corpus pequeños.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Llama (heredada de SmolLM2-360M-Instruct) |
| Parametros totales | 361.821.120 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (longitud máxima usada en entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | feroés (fo); entrenado con transferencia desde danés, islandés, noruego bokmål, noruego nynorsk y sueco |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con la arquitectura de SmolLM2-360M-Instruct, sin modificaciones estructurales: se trata de un ajuste de los pesos existentes, no de un rediseño. El entrenamiento consistió en 1 época sobre el subconjunto conjunto de danés, islandés, noruego bokmål, noruego nynorsk y sueco de FineWeb-2, seguida de 5 épocas sobre el subconjunto feroés del mismo corpus. Se usó una tasa de aprendizaje de 5e-4 con scheduler coseno, ratio de warmup de 0,05, batch size de 8 con 32 pasos de acumulación de gradiente (batch efectivo de 256), longitud máxima de 2048 tokens y una única GPU A100 de 40 GB. La semilla es la 2 de tres configuraciones idénticas, lo que permite estudiar la variabilidad entre ejecuciones.

No se documenta ninguna fase de alineación (RLHF, DPO) ni de ajuste supervisado de instrucciones específica para feroés; el punto de partida instructivo se conserva pero el CPT sobre texto crudo puede haber desplazado parte de ese comportamiento. Tampoco se especifica el volumen total de tokens de cada subconjunto ni la composición exacta del corpus más allá de la referencia a FineWeb-2.

## Capacidades

- Generación de texto en feroés: continuación y producción de texto en dicha lengua a partir del ajuste sobre FineWeb-2.
- Modelado de lengua feroesa: el entrenamiento continuado sobre texto crudo favorece tareas de probabilidad y perplejidad sobre este idioma.
- Herencia parcial del comportamiento instructivo de SmolLM2-360M-Instruct, aunque no se ha verificado ni evaluado su preservación tras el CPT.
- Capacidad multilingüe residual limitada: el entrenamiento conjunto previo incluyó cinco lenguas nórdicas, pero no se documenta el grado de retención.
- Tool calling y function calling: no disponible; no se documenta soporte.
- Razonamiento multi-paso y agentes: no disponible; no se documenta ni se ha evaluado.
- Modo thinking, visión o audio: no disponible; el modelo es exclusivamente de texto.

## Casos de uso

- Investigación en transferencia entre lenguas nórdicas: sirve como punto de comparación frente a las semillas 1 y 3 de la misma configuración para medir la varianza del CPT en corpus pequeños.
- Evaluación de perplejidad en feroés: útil para construir líneas base de modelado de lengua en un idioma con pocos recursos y pocos modelos públicos.
- Generación asistida de texto en feroés para prototipos internos: con 361M de parámetros y licencia Apache 2.0, puede desplegarse en entornos de prueba para generar borradores que un hablante nativo revise.
- Aumento de datos para PLN en feroés: generación de frases sintéticas que alimenten clasificadores, etiquetadores o sistemas de corrección ortográfica de bajo presupuesto.
- Estudio de olvido catastrófico: al partir de un modelo instructivo y entrenar sobre texto crudo, permite analizar cuánto comportamiento instructivo se pierde y cómo afecta el orden del currículo (primero lenguas emparentadas, luego feroés).
- Docencia y reproducción experimental: la configuración completa (una A100, LR 5e-4, batch efectivo 256, semilla documentada) es replicable con recursos modestos, lo que lo hace adecuado para cursos de ajuste fino de modelos de lenguaje.
- Filtrado y puntuación de corpus feroeses: el modelo puede emplearse para calcular la probabilidad de documentos y descartar texto de baja calidad en la construcción de nuevos datasets.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que el modelo "has not been evaluated more broadly yet".

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,7 GB en fp16/bf16 (361M parámetros × 2 bytes), alrededor de 0,4 GB en cuantización de 8 bits y 0,2 GB en 4 bits, sin contar el overhead de activaciones y caché KV.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; una A100, H100 o RTX 4090 lo ejecutan con enorme holgura y permiten batches grandes.
- Cabe en GPU de consumo: sí, en cualquier RTX (incluso series 20xx y 30xx de gama baja), GTX 1060 en adelante e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: transformers (librería nativa del repo), text-generation-inference (el repo incluye la etiqueta `text-generation-inference` y `endpoints_compatible`), vLLM y llama.cpp/Ollama previa conversión a GGUF, que no se distribuye en el repositorio.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jekunz/smollm-360m-cpt-fineweb-faroese-transfer-from-multilingual-seed2 | 361.821.120 | 2048 | feroés (con transferencia nórdica) | apache-2.0 | Hugging Face |
| HuggingFaceTB/SmolLM2-360M-Instruct (modelo base) | 361.821.120 | 2048 | principalmente inglés | apache-2.0 | Hugging Face |
| SmolLM2-135M-Instruct | no disponible en la información proporcionada | no disponible en la información proporcionada | principalmente inglés | apache-2.0 | Hugging Face |

La comparación con alternativas específicas para feroés no está disponible en la información proporcionada; no se documentan otros modelos públicos de este tamaño entrenados para dicha lengua en el material consultado.

## Limitaciones y advertencias

- Modelo de investigación sin evaluación amplia: el autor advierte explícitamente que no ha sido evaluado más allá del entrenamiento, por lo que no hay garantías de calidad en generación, instrucciones ni coherencia.
- Riesgo de olvido catastrófico del comportamiento instructivo: el CPT sobre texto crudo durante 6 épocas efectivas puede degradar la capacidad de seguir instrucciones heredada de SmolLM2-360M-Instruct.
- Riesgo de alucinación elevado: con 361M de parámetros y un corpus de entrenamiento limitado, la generación de hechos es poco fiable.
- Cobertura lingüística restringida: solo se declara feroés; el rendimiento en otras lenguas, incluido el inglés del modelo base, no está documentado y probablemente se haya degradado.
- Sesgos: no se documenta ningún análisis de sesgos; el corpus FineWeb-2 puede arrastrar sesgos de la web filtrada.
- Contexto corto: 2048 tokens, insuficiente para tareas de contexto largo o documentos extensos.
- Licencia Apache 2.0: permite uso comercial, pero al derivar de SmolLM2-360M-Instruct conviene verificar las condiciones del modelo base (también Apache 2.0 según la información disponible).
- Sin cuantizaciones publicadas: para desplegar en llama.cpp u Ollama hay que convertir los pesos manualmente.
- Varianza entre semillas: al ser una de tres ejecuciones idénticas, los resultados pueden diferir respecto a las otras semillas; no debe tratarse como un modelo "definitivo".

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jekunz/smollm-360m-cpt-fineweb-faroese-transfer-from-multilingual-seed2
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- No se han encontrado en la información proporcionada papers, blogs, repositorios ni demos adicionales asociados a este modelo.
