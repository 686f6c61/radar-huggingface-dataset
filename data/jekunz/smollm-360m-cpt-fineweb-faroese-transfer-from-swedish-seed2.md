# jekunz/smollm-360m-cpt-fineweb-faroese-transfer-from-swedish-seed2

## Resumen

El modelo `jekunz/smollm-360m-cpt-fineweb-faroese-transfer-from-swedish-seed2` es un ajuste fino de SmolLM2-360M-Instruct desarrollado por el usuario jekunz con fines de investigación. Se trata de un experimento de adaptación lingüística al feroés (código ISO `fo`), una lengua germánica nórdica con muy pocos recursos digitales, partiendo de un modelo previamente adaptado al sueco y continuando el entrenamiento sobre el subconjunto feroés de FineWeb-2.

El modelo emplea una arquitectura transformer tipo Llama con 361.821.120 parámetros (aproximadamente 360M) y una longitud de contexto máxima de 2048 tokens durante el entrenamiento. El repositorio ocupa 0,7 GB en formato safetensors y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

Su relevancia radica en el interés metodológico: demuestra una estrategia de transferencia lingüística secuencial (inglés → sueco → feroés) sobre un modelo pequeño, un enfoque útil para lenguas de bajos recursos donde el entrenamiento directo desde cero no es viable. El autor advierte explícitamente de que el modelo no ha sido evaluado de forma amplia, por lo que debe considerarse un artefacto de investigación más que un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama (SmolLM2-360M-Instruct) |
| Parametros totales | 361.821.120 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 2048 tokens (longitud máxima durante el entrenamiento) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Feroés (`fo`); el modelo base tiene capacidades multilingües no documentadas en esta ficha |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de SmolLM2-360M-Instruct, un transformer denso de tipo decoder-only con la arquitectura Llama, y se ha sometido a un proceso de preentrenamiento continuo (continued pre-training, CPT) en dos fases. En la primera se ajustó sobre la porción sueca de FineWeb-2 durante 1 época; en la segunda, sobre la porción feroesa del mismo corpus durante 5 épocas. Esta secuencia de transferencia lingüística busca aprovechar la proximidad tipológica entre el sueco y el feroés para mejorar la adaptación al segundo idioma con menos datos.

Los hiperparámetros documentados son: tasa de aprendizaje 5e-4, scheduler coseno, ratio de warmup 0,05, tamaño de lote 8 con 32 pasos de acumulación de gradiente (lote efectivo de 256), longitud máxima de contexto de 2048 tokens, semilla 2 (una de tres semillas de entrenamiento para esta configuración) y ejecución sobre una única GPU A100 de 40 GB. No se documentan detalles sobre la composición exacta del dataset, el número total de tokens procesados, ni si hubo fases de RLHF o DPO posteriores al CPT.

## Capacidades

- Generación de texto conversacional en feroés, heredada del ajuste instructivo del modelo base y del CPT sobre FineWeb-2.
- Comprensión y generación en feroés como idioma principal declarado.
- Capacidades residuales del modelo base SmolLM2-360M-Instruct en inglés y otros idiomas, no garantizadas tras el ajuste.
- Soporte de tool calling o function calling: no documentado para este ajuste concreto.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Investigación en transferencia lingüística para lenguas de bajos recursos: el modelo sirve como punto de partida para estudiar estrategias de CPT secuencial (sueco → feroés) y comparar resultados entre las tres semillas de entrenamiento publicadas por el autor.
- Generación de texto sintético en feroés: puede emplearse para aumentar corpus de entrenamiento o evaluación en feroés, con revisión humana posterior dado el tamaño reducido del modelo.
- Experimentos de adaptación de modelos pequeños: útil como referencia para evaluar cuánto conocimiento lingüístico se transfiere a un idioma emparentado con solo 360M de parámetros.
- Prototipado de asistentes conversacionales en feroés: con 2048 tokens de contexto y un modelo de 360M, puede desplegarse en hardware modesto para demos o pruebas de concepto de chat en feroés.
- Evaluación comparativa de semillas: al existir tres semillas para la misma configuración, permite analizar la varianza del entrenamiento en tareas de generación en feroés.
- Filtrado o clasificación ligera de texto en feroés: el modelo puede adaptarse mediante ajuste fino adicional para tareas de clasificación o etiquetado en ese idioma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que el modelo "has not been evaluated more broadly yet".

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo completo en safetensors ocupa aproximadamente 0,7 GB (361M de parámetros en fp32); en fp16 o bf16 requiere alrededor de 0,75 GB, y en cuantizaciones de 8 o 4 bits se reduce por debajo de 0,5 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; se ha entrenado en una A100 de 40 GB, pero la inferencia no requiere hardware de ese nivel.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090, etc.) e incluso en iGPU o CPU.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles; otras opciones como llama.cpp, Ollama o vLLM no están documentadas para este modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jekunz/smollm-360m-cpt-fineweb-faroese-transfer-from-swedish-seed2 | 361,8M | 2048 | Feroés | Apache 2.0 | Hugging Face |
| SmolLM2-360M-Instruct (modelo base) | 361,8M | 2048 (según configuración del base) | Multilingüe (inglés predominante) | Apache 2.0 | Hugging Face |
| jekunz/smollm-360m-cpt-fineweb-swedish (modelo intermedio) | 361,8M | 2048 | Sueco | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El autor declara que el modelo no ha sido evaluado de forma amplia; no hay benchmarks publicados que respalden su calidad.
- Riesgo elevado de alucinación y de generación incoherente dado el tamaño reducido (360M) y el ajuste sobre un corpus web sin filtrado documentado.
- Contexto limitado a 2048 tokens, insuficiente para tareas de contexto largo.
- El único idioma declarado es el feroés; el rendimiento en otros idiomas tras el CPT no está garantizado y puede haberse degradado respecto al modelo base.
- Posibles sesgos heredados de FineWeb-2 (corpus web) y de SmolLM2-360M-Instruct, sin documentación específica sobre mitigación.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo no está recomendado para producción sin una evaluación previa exhaustiva.
- Es un artefacto de investigación (semilla 2 de tres); los resultados pueden variar entre semillas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jekunz/smollm-360m-cpt-fineweb-faroese-transfer-from-swedish-seed2
- Modelo base (sueco): https://huggingface.co/jekunz/smollm-360m-cpt-fineweb-swedish
- Dataset utilizado: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Modelo original SmolLM2-360M-Instruct: no disponible en la información proporcionada
- Paper o blog del autor: no disponible en la información proporcionada
