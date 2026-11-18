# jekunz/smollm-135m-cpt-fineweb-faroese-transfer-from-swedish-seed2

## Resumen

SmolLM-135M-cpt-fineweb-faroese-transfer-from-swedish-seed2 es un modelo de lenguaje de 134,5 millones de parámetros derivado de SmolLM2-135M-Instruct, desarrollado por el usuario jekunz como parte de un experimento de investigación sobre transferencia lingüística entre idiomas de bajos recursos. El modelo se ha sometido a un entrenamiento continuado (continual pre-training, CPT) en dos fases: primero sobre la porción sueca de FineWeb-2 y después sobre la porción feroesa del mismo corpus, partiendo de un checkpoint intermedio ya adaptado al sueco.

El objetivo del experimento es evaluar si el preentrenamiento en un idioma germánico nórdico con más volumen de datos (sueco) facilita la adaptación posterior a un idioma emparentado con muchos menos recursos (feroés), en lugar de entrenar directamente desde el modelo base en inglés. Se trata de la semilla 2 de tres configuraciones de entrenamiento idénticas, lo que permite medir la variabilidad entre ejecuciones.

Por su tamaño reducido y su licencia Apache 2.0, el modelo es adecuado para experimentación en hardware modesto y para su despliegue en entornos con restricciones de cómputo, aunque el autor advierte explícitamente de que no ha sido evaluado de forma amplia y que está pensado para fines de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama, base SmolLM2-135M-Instruct) |
| Parametros totales | 134.515.008 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (longitud máxima usada en entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; compatible con cuantización estándar de llama.cpp/GGUF, aunque no se publican versiones cuantizadas) |
| Idiomas soportados | Feroés (fo); el modelo base soporta inglés y el checkpoint intermedio sueco |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de SmolLM2-135M-Instruct: un transformer decoder-only de tipo Llama con 134,5 millones de parámetros, pensado para inferencia eficiente en dispositivos con poca memoria. Sobre ese checkpoint se aplicó un entrenamiento continuado en dos etapas: primero una época sobre el subconjunto sueco de FineWeb-2 (que da lugar al modelo base jekunz/smollm-135m-cpt-fineweb-swedish) y después cinco épocas sobre el subconjunto feroés del mismo corpus.

Los hiperparámetros declarados por el autor son: tasa de aprendizaje 5e-4, scheduler coseno, warmup ratio 0,05, batch size 8 con 32 pasos de acumulación de gradiente (batch efectivo de 256), longitud máxima de contexto de 2048 tokens, entrenamiento en una única GPU A100 de 40 GB y semilla 2. No se documentan fases de RLHF, DPO ni ajuste por instrucciones específico para feroés; la capacidad conversacional proviene del modelo base Instruct. Tampoco se especifica el número total de tokens procesados ni la composición exacta del subconjunto de FineWeb-2 utilizado.

## Capacidades

- Generación de texto en feroés como idioma principal, con capacidad de continuar y completar textos.
- Conversación multi-turno heredada del ajuste Instruct de SmolLM2, aunque no se ha verificado su calidad en feroés.
- Comprensión y generación limitada en inglés y sueco residual, procedente del modelo base y de la primera fase de CPT.
- Razonamiento básico y respuesta a preguntas sencillas, limitado por el tamaño de 135M parámetros.
- No se documenta soporte explícito de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No dispone de visión, audio ni modo de pensamiento extendido.

## Casos de uso

- Investigación sobre transferencia entre idiomas: permite comparar la adaptación sueco→feroés frente a un entrenamiento directo desde el modelo base, usando las tres semillas publicadas para estimar la varianza del proceso.
- Generación de texto sintético en feroés: útil para aumentar corpus de entrenamiento o evaluación en un idioma con pocos recursos digitales, siempre con revisión humana.
- Experimentos de CPT de bajo coste: su tamaño permite reproducir la receta completa en una sola GPU de 40 GB, lo que facilita estudios académicos sobre olvido catastrófico y orden de los datos.
- Prototipado de completado de texto y autocompletado en aplicaciones de escritura en feroés, con expectativas moderadas de calidad.
- Evaluación de tokenizadores y de la cobertura de FineWeb-2 para lenguas nórdicas minoritarias.
- Base para ajuste fino supervisado posterior en tareas concretas de feroés (clasificación, extracción, resumen) cuando no se dispone de cómputo para modelos mayores.
- Despliegue en entornos con menos de 1 GB de memoria para demos y pruebas de concepto, gracias a sus 134,5 millones de parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que el modelo no ha sido evaluado de forma amplia.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 0,3 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica cabe en menos de 1 GB.
- VRAM estimada en cuantización de 8 bits: alrededor de 0,15 GB para pesos; en 4 bits, unos 0,08 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es sobradamente suficiente; también funciona en CPU.
- Cabe en GPU consumer de gama baja, en iGPU y en dispositivos de borde.
- Opciones de despliegue: transformers, text-generation-inference (el modelo está etiquetado como compatible con endpoints), llama.cpp y Ollama tras conversión a GGUF, y vLLM.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Estado |
|---|---|---|---|---|---|
| Este modelo (SmolLM-135M CPT feroés) | 134,5 M | 2048 | Feroés (principal), inglés/sueco residual | Apache 2.0 | Checkpoint de investigación, sin benchmarks |
| SmolLM2-135M-Instruct | 135 M | 8192 (según model card original) | Inglés principalmente | Apache 2.0 | Modelo base con evaluación publicada |
| jekunz/smollm-135m-cpt-fineweb-swedish | 134,5 M | 2048 | Sueco | Apache 2.0 | Checkpoint intermedio de la misma línea experimental |
| Modelos específicos para lenguas nórdicas de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación con alternativas consolidadas para feroés no está disponible en la información proporcionada; el ecosistema de modelos abiertos para este idioma es muy reducido.

## Limitaciones y advertencias

- El autor declara que el modelo es para investigación y que no ha sido evaluado de forma amplia; no debe usarse en producción sin una evaluación propia.
- Riesgo elevado de alucinación y de generar texto gramaticalmente plausible pero incorrecto, dado el tamaño y las pocas épocas de entrenamiento.
- Posible olvido catastrófico del inglés y del sueco tras cinco épocas sobre feroés, así como degradación de las capacidades conversacionales del modelo Instruct original.
- Ventana de contexto limitada a 2048 tokens, insuficiente para documentos largos.
- Sesgos desconocidos: no se documenta ningún análisis de sesgos ni de toxicidad; el corpus FineWeb-2 puede arrastrar sesgos de la web.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación hace desaconsejable ese uso sin validación previa.
- Existen tres semillas de la misma configuración; los resultados pueden variar entre ellas, lo que refleja la inestabilidad del entrenamiento a esta escala.
- No se publican versiones cuantizadas ni scripts de conversión, por lo que el despliegue en llama.cpp u Ollama requiere trabajo adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jekunz/smollm-135m-cpt-fineweb-faroese-transfer-from-swedish-seed2
- Modelo base intermedio (sueco): https://huggingface.co/jekunz/smollm-135m-cpt-fineweb-swedish
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- SmolLM2-135M-Instruct (modelo de partida): https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
