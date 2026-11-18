# jekunz/smollm-135m-cpt-fineweb-faroese-transfer-from-norwegian-bokmaal-seed1

## Resumen

Este modelo es un ajuste fino de SmolLM2-135M-Instruct realizado por el usuario jekunz, orientado a la generación de texto en feroés (fo). El proceso parte de un modelo intermedio ya adaptado al noruego bokmål y aplica un entrenamiento continuado sobre la porción de feroés del corpus FineWeb-2. Se trata, por tanto, de un experimento de transferencia lingüística entre dos lenguas germánicas nórdicas estrechamente emparentadas, con el objetivo de aprovechar los recursos disponibles en bokmål para mejorar el comportamiento en feroés.

Con 134.515.008 parámetros, es un modelo de escala muy reducida, pensado para entornos con recursos limitados y para investigación sobre adaptación de lenguas de bajos recursos. La ventana de contexto utilizada durante el entrenamiento es de 2048 tokens y la licencia es Apache 2.0, lo que facilita su reutilización. El autor indica explícitamente que el modelo es parte de su investigación y que no ha sido evaluado de forma amplia todavía.

Su relevancia actual radica en el interés por técnicas de transferencia entre lenguas emparentadas para reducir la brecha de recursos en lenguas minoritarias como el feroés, y en servir como punto de partida reproducible (semilla 1 de tres configuraciones) para estudiar el efecto del preentrenamiento continuado en modelos pequeños.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia LLaMA, SmolLM2-135M-Instruct) |
| Parametros totales | 134.515.008 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (longitud máxima usada en entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | feroés (fo); el modelo base tiene cobertura multilingüe no especificada |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia LLaMA, derivado de SmolLM2-135M-Instruct. El entrenamiento se realizó en dos fases de preentrenamiento continuado (CPT): primero una época sobre la porción de noruego bokmål de FineWeb-2, y después cinco épocas sobre la porción de feroés del mismo corpus. La configuración reportada incluye tasa de aprendizaje 5e-4, scheduler coseno, ratio de warmup 0,05, tamaño de lote 8, acumulación de gradientes de 32 pasos (lote efectivo de 256), longitud máxima de contexto de 2048 tokens y ejecución en una única GPU A100 de 40 GB. La semilla utilizada es la 1, una de tres semillas previstas para esta configuración.

No se documentan en la información disponible detalles sobre la composición exacta del dataset más allá de su procedencia (HuggingFaceFW/fineweb-2), ni sobre el uso de RLHF, DPO u otras técnicas de alineación posteriores al CPT. Tampoco se especifican innovaciones arquitectónicas adicionales: se mantiene la arquitectura del modelo base y el interés técnico reside en la estrategia de transferencia secuencial bokmål → feroés.

## Capacidades

- Generación de texto en feroés, fruto del preentrenamiento continuado sobre FineWeb-2 en esa lengua.
- Conversación: el punto de partida es un modelo Instruct, por lo que conserva la capacidad de mantener diálogos de tipo instrucción, aunque el CPT puede haber alterado parte de ese comportamiento.
- Razonamiento y conocimiento general: limitados por el tamaño del modelo (135M parámetros) y por no haber sido evaluado ampliamente.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado; poco probable en un modelo de este tamaño.
- Capacidades multilingües: el modelo declara únicamente feroés; el comportamiento en otras lenguas no está caracterizado.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Investigación sobre transferencia entre lenguas emparentadas: sirve para estudiar cómo el CPT en bokmål afecta al rendimiento en feroés, comparando con las otras semillas de la misma configuración y con modelos entrenados directamente en feroés.
- Generación de texto sintético en feroés para aumento de datos: al ser un modelo pequeño y con licencia Apache 2.0, puede emplearse para producir borradores o corpus auxiliares que luego se filtren manualmente.
- Experimentos de bajo coste en entornos académicos: con 135M parámetros y pesos safetensors, se puede ajustar y ejecutar en una sola GPU de gama media, lo que facilita la reproducibilidad de estudios sobre lenguas de bajos recursos.
- Prototipado de completado de texto en feroés: útil para validar interfaces o pipelines de generación antes de invertir en modelos mayores.
- Evaluación de técnicas de CPT y currículos secuenciales: la configuración documentada (épocas, LR, semilla) permite replicar y comparar variantes del proceso de entrenamiento.
- Base para ajuste fino supervisado posterior en tareas concretas de feroés (clasificación, resumen o respuesta a preguntas), dado que el modelo ya parte de una adaptación al idioma.
- Referencia en estudios de olvido catastrófico: permite medir cuánto del comportamiento Instruct original se preserva tras cinco épocas de CPT en una lengua distinta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 0,54 GB solo para pesos; en fp16/bf16, aproximadamente 0,27 GB.
- VRAM estimada en cuantización de 8 bits: alrededor de 0,14 GB; en 4 bits, en torno a 0,07 GB (estimaciones teóricas a partir del número de parámetros; no hay cuantizaciones oficiales publicadas).
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre es suficiente; el entrenamiento se realizó en una A100 de 40 GB, pero la inferencia cabe holgadamente en GTX 1650, RTX 3060, RTX 4090 o superiores.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna e incluso en CPU para inferencia de baja latencia moderada.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (etiqueta endpoints_compatible), y previsiblemente llama.cpp/Ollama tras conversión a GGUF, aunque no se documenta oficialmente.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| jekunz/smollm-135m-cpt-fineweb-faroese-transfer-from-norwegian-bokmaal-seed1 | 134,5 M | 2048 | feroés | Apache 2.0 | CPT secuencial bokmål → feroés; sin benchmarks publicados |
| HuggingFaceTB/SmolLM2-135M-Instruct | 135 M | 8192 (según model card del modelo original) | multilingüe (principalmente inglés) | Apache 2.0 | Modelo base de partida; no especializado en feroés |
| jekunz/smollm-135m-cpt-fineweb-norwegian-bokmaal | 135 M (aproximado) | no disponible | noruego bokmål | Apache 2.0 (según modelo base) | Modelo intermedio del que deriva este ajuste |

No se dispone de información sobre benchmarks comparativos entre estos modelos en la documentación proporcionada.

## Limitaciones y advertencias

- El autor indica explícitamente que el modelo es para su investigación y que no ha sido evaluado de forma amplia; no debe asumirse calidad en producción.
- Riesgo elevado de alucinación y de degradación del comportamiento Instruct original tras cinco épocas de CPT sobre un corpus web.
- Tamaño muy reducido (135M parámetros): capacidad limitada de razonamiento, conocimiento factual y coherencia en textos largos.
- Contexto máximo de 2048 tokens, insuficiente para tareas que requieran documentos extensos.
- Solo se declara feroés; el rendimiento en otras lenguas, incluido el noruego bokmål del que parte, no está caracterizado y podría haberse degradado.
- Sesgos desconocidos: no se documenta ningún análisis de sesgos ni de filtrado del corpus FineWeb-2 más allá del que aplique el propio dataset.
- Licencia Apache 2.0: permite uso comercial, pero al derivar de SmolLM2 conviene revisar las condiciones del modelo base y de los datos de FineWeb-2.
- Al ser la semilla 1 de tres, los resultados pueden variar entre semillas; conviene no extrapolar conclusiones de una sola ejecución.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jekunz/smollm-135m-cpt-fineweb-faroese-transfer-from-norwegian-bokmaal-seed1
- Modelo base intermedio: https://huggingface.co/jekunz/smollm-135m-cpt-fineweb-norwegian-bokmaal
- Dataset utilizado: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Modelo original SmolLM2-135M-Instruct: https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
