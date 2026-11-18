# jekunz/smollm-135m-cpt-fineweb-faroese-transfer-from-danish-seed1

## Resumen

SmolLM-135m-cpt-fineweb-faroese-transfer-from-danish-seed1 es un modelo de lenguaje de 134,5 millones de parámetros derivado de SmolLM2-135M-Instruct, desarrollado por el usuario jekunz como parte de un experimento de investigación sobre transferencia lingüística entre lenguas de bajos recursos. El modelo se ha sometido a un entrenamiento continuado (continued pre-training) en dos fases: primero sobre la porción danesa de FineWeb-2 y después sobre la porción feroesa del mismo corpus, aprovechando el parentesco tipológico entre ambas lenguas germánicas nórdicas.

El objetivo del autor es investigar si el preentrenamiento en una lengua con más recursos digitales (danés) mejora la adaptación posterior a una lengua de muy bajos recursos (feroés), que cuenta con pocos corpus de calidad disponibles. Se trata de un modelo de investigación, sin evaluación amplia publicada, que hereda la arquitectura Llama de SmolLM2 y una licencia Apache 2.0 permisiva.

Por su tamaño reducido (0,3 GB en safetensors) y su ventana de contexto de 2048 tokens, el modelo está pensado para experimentación, prototipado rápido y despliegue en hardware muy modesto, no para producción de alta exigencia. Su relevancia actual radica en el interés creciente por técnicas de transferencia interlingüística para lenguas minoritarias y por la familia SmolLM como base ligera de código abierto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama, base SmolLM2-135M-Instruct) |
| Parámetros totales | 134.515.008 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (longitud máxima de entrenamiento) |
| Tipos de cuantización | no disponible (pesos publicados en precisión original; compatible con cuantización estándar GGUF/INT8 por arquitectura Llama) |
| Idiomas soportados | feroés (fo); entrenado con transferencia desde danés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de tipo Llama, derivado de SmolLM2-135M-Instruct. El autor aplica un entrenamiento continuado en dos etapas sobre FineWeb-2: primero 1 época con la porción danesa y después 5 épocas con la porción feroesa. La configuración de entrenamiento incluye learning rate de 5e-4 con scheduler coseno, warmup ratio de 0,05, batch size de 8, acumulación de gradientes de 32 pasos (batch efectivo de 256), longitud máxima de contexto de 2048 tokens y una única GPU A100 de 40 GB. Este modelo corresponde a la semilla 1 de tres semillas de entrenamiento para esta misma configuración, lo que indica que el autor está midiendo variabilidad entre ejecuciones.

La innovación técnica principal no reside en la arquitectura, sino en la estrategia de transferencia: el preentrenamiento intermedio en danés actúa como puente lingüístico antes de la adaptación al feroés. No se documenta en la información disponible el número total de tokens procesados, la composición exacta del dataset más allá de FineWeb-2, ni si hubo etapas de RLHF o DPO posteriores.

## Capacidades

- Generación de texto en feroés, con posible arrastre de capacidades del modelo base en otras lenguas.
- Conversación multi-turno (etiqueta `conversational`), heredada del formato instruct de SmolLM2.
- Razonamiento básico y respuesta a instrucciones, limitado por el tamaño de 135M parámetros.
- No se documenta soporte explícito de tool calling ni function calling en la información disponible.
- No se documenta soporte de agentes ni razonamiento multi-paso en la información disponible.
- Capacidad multilingüe limitada: el autor solo declara feroés como idioma objetivo.
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Investigación en transferencia interlingüística: sirve como punto de partida reproducible (semilla 1 de 3) para estudiar cómo el preentrenamiento en danés afecta al rendimiento en feroés, comparando con las otras semillas y con modelos entrenados solo en feroés.
- Prototipado de generación de texto en feroés: permite validar pipelines de NLP para una lengua de bajos recursos antes de invertir en modelos mayores, gracias a su tamaño de 0,3 GB y su licencia Apache 2.0.
- Experimentos de ajuste fino (fine-tuning) sobre lenguas nórdicas minoritarias: su base instruct y su contexto de 2048 tokens lo hacen manejable para iterar rápidamente en una sola GPU consumer.
- Evaluación comparativa de corpus: al estar entrenado sobre FineWeb-2 danés y feroés, puede usarse para analizar el impacto de la composición y el orden del corpus en el rendimiento final.
- Despliegue en entornos con recursos muy limitados: con 134M parámetros cabe en CPU o en GPUs de gama baja, útil para demos educativas o pruebas de concepto de generación de texto en feroés.
- Generación de texto asistida en entornos de investigación lingüística: borradores, expansión de frases o normalización de texto en feroés dentro de estudios académicos, siempre con revisión humana dada la falta de evaluación amplia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que el modelo "no ha sido evaluado de forma más amplia todavía".

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,3 GB en FP16/BF16 (pesos de 134,5M parámetros), menos de 1 GB en la mayoría de configuraciones.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; el entrenamiento se realizó en una A100 de 40 GB, pero la inferencia no requiere hardware de ese nivel.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna (GTX 1050 Ti o superior, RTX 2060, RTX 3060, RTX 4090) e incluso en CPU.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (etiqueta `text-generation-inference`), endpoints compatibles; la arquitectura Llama permite presumiblemente llama.cpp y Ollama, aunque no se confirma en la información disponible.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jekunz/smollm-135m-cpt-fineweb-faroese-transfer-from-danish-seed1 | 134,5M | 2048 | feroés | Apache 2.0 | Hugging Face |
| SmolLM2-135M-Instruct (modelo base) | 135M | no disponible en la información | multilingüe (inglés principal) | Apache 2.0 | Hugging Face |
| jekunz/smollm-135m-cpt-fineweb-danish (modelo base intermedio) | 135M aprox. | no disponible en la información | danés | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación sin evaluación amplia: el autor advierte explícitamente de que no ha sido evaluado más allá de su experimento, por lo que su calidad en feroés es incierta.
- Riesgo elevado de alucinación y de errores gramaticales: con 135M parámetros y entrenamiento limitado, la coherencia y la fidelidad factual serán limitadas.
- Sesgos desconocidos: no se documenta ningún análisis de sesgos; al derivar de FineWeb-2, puede heredar sesgos del corpus web.
- Cobertura lingüística restringida: solo se declara feroés; el uso en otras lenguas puede degradar el rendimiento del modelo base.
- Contexto corto: 2048 tokens limita tareas que requieran documentos largos o conversaciones extensas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la falta de evaluación hace desaconsejable su uso en producción sin validación previa.
- Variabilidad entre semillas: al ser la semilla 1 de 3, los resultados pueden diferir de las otras ejecuciones de la misma configuración.

## Enlaces

- Hugging Face: https://huggingface.co/jekunz/smollm-135m-cpt-fineweb-faroese-transfer-from-danish-seed1
- Modelo base intermedio: https://huggingface.co/jekunz/smollm-135m-cpt-fineweb-danish
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
