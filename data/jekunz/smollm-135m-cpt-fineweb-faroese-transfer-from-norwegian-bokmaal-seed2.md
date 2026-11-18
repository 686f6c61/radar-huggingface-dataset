# jekunz/smollm-135m-cpt-fineweb-faroese-transfer-from-norwegian-bokmaal-seed2

## Resumen

El modelo `jekunz/smollm-135m-cpt-fineweb-faroese-transfer-from-norwegian-bokmaal-seed2` es un ajuste fino de SmolLM2-135M-Instruct, desarrollado por el usuario jekunz, orientado a la generación de texto en feroés (código ISO `fo`). Se trata de un experimento de investigación sobre transferencia lingüística entre lenguas germánicas nórdicas: el modelo se entrena primero en noruego bokmål y después en feroés, aprovechando el parentesco estructural entre ambas lenguas para mejorar la adaptación con un presupuesto de datos reducido.

El modelo parte de la arquitectura Llama de SmolLM2, con 134.515.008 parámetros reales según los pesos en safetensors (etiquetado comercialmente como "135M"). El entrenamiento se realizó sobre el subconjunto feroés y noruego bokmål de FineWeb-2, con una longitud de contexto máxima de 2048 tokens durante el ajuste. Es uno de los tres modelos (seed 1, 2 y 3) entrenados con la misma configuración para medir la variabilidad entre semillas.

Su relevancia es acotada y experimental: no es un modelo listo para producción ni ha sido evaluado de forma amplia, según reconoce el propio autor. Resulta útil como referencia para estudiar técnicas de transferencia entre lenguas de bajos recursos y para reproducir experimentos de *continued pre-training* (CPT) sobre modelos pequeños.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama (SmolLM2-135M-Instruct) |
| Parametros totales | 134.515.008 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 2048 tokens (máximo durante el entrenamiento) |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | Feroés (`fo`); entrenamiento previo en noruego bokmål |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de SmolLM2-135M-Instruct: un transformer decoder-only de tipo Llama con 134,5 millones de parámetros. El proceso de entrenamiento consistió en un ajuste fino secuencial sobre dos subconjuntos de FineWeb-2: primero una época en noruego bokmål y después cinco épocas en feroés, con una tasa de aprendizaje de 5e-4, scheduler coseno, warmup del 5 %, batch size de 8 y acumulación de gradientes de 32 pasos (batch efectivo de 256). El entrenamiento se ejecutó en una única GPU A100 de 40 GB con longitud máxima de 2048 tokens y semilla 2 (de un total de tres semillas para esta configuración).

La innovación metodológica es la estrategia de transferencia: en lugar de entrenar directamente desde el modelo base en feroés, se intercala una fase en noruego bokmål, lengua con más recursos y estrechamente emparentada con el feroés, para facilitar la adaptación. No se documentan técnicas como RLHF, DPO ni decodificación especulativa.

## Capacidades

- Generación de texto conversacional en feroés, heredada de la naturaleza instruct del modelo base.
- Comprensión y generación en noruego bokmål como efecto secundario de la primera fase de entrenamiento (no evaluado formalmente).
- Razonamiento básico y respuesta a instrucciones limitada por el tamaño del modelo (135M).
- Capacidad multilingüe restringida al par noruego bokmål-feroés; el resto de idiomas no está garantizado.
- No se documenta soporte de tool calling, function calling ni capacidades de agente.
- No dispone de visión, audio ni modo de razonamiento extendido (*thinking*).

## Casos de uso

- Investigación en transferencia entre lenguas nórdicas: el modelo sirve como punto de partida reproducible para comparar estrategias de CPT (directo vs. transferencia vía bokmål) en feroés, con una configuración documentada y tres semillas disponibles.
- Generación de texto sintético en feroés para aumento de datos: puede producir frases y párrafos cortos que, tras revisión humana, alimenten corpus de entrenamiento para modelos mayores.
- Experimentos de *ablation* sobre presupuesto de datos: al ser un modelo de 135M con entrenamiento en una sola GPU, permite iterar rápido sobre número de épocas, tasas de aprendizaje y orden de lenguas.
- Prototipado de asistentes conversacionales en feroés de baja latencia: su tamaño reducido permite desplegarlo en CPU o GPU de consumo para demos internas, siempre con validación humana.
- Evaluación de modelos pequeños en lenguas de bajos recursos: útil como *baseline* en benchmarks de perplejidad sobre textos feroeses de FineWeb-2 u otras fuentes.
- Docencia y formación: ejemplo didáctico de pipeline completo de CPT (dataset público, hiperparámetros, semillas) para cursos de NLP.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que el modelo "no ha sido evaluado más ampliamente todavía".

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: en torno a 0,3 GB de pesos, más overhead de activaciones y KV cache; cabe holgadamente en cualquier GPU con 2 GB o más.
- En cuantización de 8 bits o 4 bits (si se generan pesos GGUF con llama.cpp), el modelo ocupa menos de 150 MB, apto para CPU.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) o incluso iGPU; para entrenamiento se usó una A100 de 40 GB, pero el ajuste fino cabe en GPUs consumer de 8-12 GB con batch pequeño.
- Despliegue: compatible con `transformers`, Text Generation Inference (tag `text-generation-inference`), y previsiblemente con llama.cpp/Ollama tras conversión a GGUF (no se publican pesos GGUF en el repo).
- Latencia y throughput: no disponibles; por el tamaño, se espera throughput alto en GPU consumer, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Estado |
|---|---|---|---|---|---|
| Este modelo (SmolLM2-135M + CPT feroés) | 134,5M | 2048 | Feroés, bokmål | Apache 2.0 | Experimental, sin benchmarks |
| SmolLM2-135M-Instruct (base) | 135M | 8192 (según model card original) | Multilingüe (inglés dominante) | Apache 2.0 | Modelo oficial evaluado |
| Noruego bokmål CPT (modelo base de este) | 134,5M | 2048 | Noruego bokmål | Apache 2.0 | Experimental |
| Modelos específicos para feroés de mayor tamaño | No disponible | No disponible | Feroés | No disponible | No disponible |

## Limitaciones y advertencias

- Modelo meramente experimental: el autor advierte que no ha sido evaluado de forma amplia; no debe usarse en producción sin validación propia.
- Riesgo elevado de alucinación y de degradación gramatical en feroés por el tamaño reducido (135M) y el limitado corpus de ajuste.
- Contexto efectivo de 2048 tokens, insuficiente para tareas de documento largo.
- Sesgos desconocidos: no se documenta análisis de sesgos; al entrenarse sobre FineWeb-2, puede heredar sesgos del corpus web.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluaciones hace desaconsejable ese uso sin pruebas adicionales.
- Solo se garantiza el feroés como idioma objetivo; el comportamiento en otros idiomas (incluido el castellano) no está validado.
- Es una de tres semillas; los resultados pueden variar entre `seed1`, `seed2` y `seed3`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jekunz/smollm-135m-cpt-fineweb-faroese-transfer-from-norwegian-bokmaal-seed2
- Modelo base (bokmål CPT): https://huggingface.co/jekunz/smollm-135m-cpt-fineweb-norwegian-bokmaal
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- SmolLM2 (familia base): https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
