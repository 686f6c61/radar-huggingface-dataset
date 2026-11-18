# jekunz/smollm-135m-cpt-fineweb-faroese-transfer-from-scandimerge-2-seed1

## Resumen

SmolLM-135M-CPT-Faroese es un modelo de lenguaje de 134,5 millones de parámetros derivado de SmolLM2-135M-Instruct, desarrollado por el usuario jekunz como parte de un experimento de investigación sobre adaptación de modelos pequeños a idiomas de bajos recursos. El modelo parte de un checkpoint intermedio (`jekunz/smollm135m-da1-is1-ties`) obtenido mediante un merge TIES de pesos iguales de dos modelos entrenados sobre las porciones danesa e islandesa de FineWeb-2, y posteriormente se somete a un entrenamiento continuado (continual pre-training, CPT) sobre la porción feroesa del mismo corpus.

El objetivo es transferir conocimiento entre lenguas germánicas nórdicas emparentadas (danés, islandés y feroés) para mejorar el modelado de un idioma con muy pocos recursos digitales como el feroés, aprovechando la proximidad tipológica y el sustrato común del corpus FineWeb-2. Se trata de un modelo de investigación, sin evaluación amplia publicada, orientado a estudiar estrategias de transferencia multilingüe en modelos de escala reducida.

Por su tamaño, el modelo cabe en cualquier GPU de consumo e incluso en CPU, lo que lo hace útil como banco de pruebas para experimentos de CPT, ajuste fino y evaluación de perplejidad en lenguas minoritarias. La licencia Apache 2.0 permite reutilización y modificación sin restricciones comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama, derivada de SmolLM2-135M-Instruct) |
| Parametros totales | 134.515.008 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 2048 tokens (longitud maxima usada en entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; compatible con cuantizacion estandar via llama.cpp/GGUF, aunque no se publican versiones cuantizadas) |
| Idiomas soportados | Feroes (fo); entrenado con transferencia desde danes e islandes |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de 134,5 millones de parámetros, heredado de SmolLM2-135M-Instruct (arquitectura tipo Llama con atención causal estándar). El proceso de entrenamiento consta de dos fases: primero se realiza un merge TIES con pesos iguales de dos modelos entrenados sobre las porciones danesa e islandesa de FineWeb-2, y después se aplica un entrenamiento continuado sobre la porción feroesa del mismo dataset.

Los hiperparámetros del CPT son: 1 época por lengua de origen y 5 épocas sobre feroés, tasa de aprendizaje 5e-4 con scheduler coseno, warmup ratio 0,05, batch size 8 con 32 pasos de acumulación de gradiente (batch efectivo de 256), longitud máxima de contexto de 2048 tokens y semilla 1 (una de tres semillas de entrenamiento para esta configuración). El entrenamiento se ejecutó en una única GPU A100 de 40 GB. No se documenta el número total de tokens procesados, la composición exacta del dataset ni si hubo fases de RLHF o DPO posteriores.

## Capacidades

- Generación de texto autoregresiva en feroés, con posible transferencia parcial desde danés e islandés.
- Conversación multi-turno heredada del checkpoint instructivo de SmolLM2.
- Razonamiento básico y respuesta a instrucciones, limitado por el tamaño del modelo.
- Generación de código y matemáticas elementales (capacidad residual del modelo base, no evaluada en feroés).
- Soporte de tool calling: no disponible de forma explícita en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingües: orientadas a feroés; el resto de idiomas no se ha evaluado tras el CPT.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Investigación en transferencia entre lenguas nórdicas: sirve como punto de partida para estudiar cómo el preentrenamiento en danés e islandés afecta a la perplejidad en feroés, comparando con las otras dos semillas de la misma configuración.
- Modelado de lengua feroesa de bajo coste: útil para calcular perplejidad, generar texto sintético o aumentar corpus en feroés en entornos con recursos limitados.
- Prototipado rápido en CPU o GPU de consumo: con 134 M de parámetros, permite iterar en experimentos de ajuste fino sin infraestructura dedicada.
- Generación de texto asistida en feroés: borradores, resúmenes o reformulaciones en un contexto de 2048 tokens, adecuado para documentos cortos.
- Base para ajuste fino supervisado (SFT) en tareas concretas en feroés, como traducción o clasificación, partiendo de un checkpoint ya adaptado al idioma.
- Evaluación comparativa de estrategias de merge (TIES) frente a entrenamiento directo: el modelo forma parte de una familia de experimentos con semillas y configuraciones controladas, útil para análisis de ablación.
- Docencia y demostraciones: ejemplo didáctico de pipeline CPT con FineWeb-2 en un modelo pequeño y con licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,3 GB en fp32, ~0,27 GB en fp16/bf16 y ~0,1 GB en cuantización de 4 bits (estimación a partir del número de parámetros).
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; A100, H100, RTX 4090, RTX 3090, RTX 3060 o incluso GPUs integradas son suficientes.
- Cabe en cualquier GPU de consumo e incluso en CPU; el entrenamiento documentado se realizó en una A100 de 40 GB por comodidad de throughput, no por requisito de memoria.
- Opciones de despliegue: transformers (librería nativa), text-generation-inference (tag `text-generation-inference`), y conversión a GGUF para llama.cpp u Ollama (no se publican versiones preconvertidas).
- Latencia y throughput: no disponibles; por el tamaño del modelo se espera un throughput alto en GPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jekunz/smollm-135m-cpt-fineweb-faroese-transfer-from-scandimerge-2-seed1 | 134,5 M | 2048 | Feroes (transferencia desde danes e islandes) | Apache 2.0 | Hugging Face |
| HuggingFaceTB/SmolLM2-135M-Instruct (modelo base) | 135 M | 8192 (según model card del modelo original) | Principalmente inglés | Apache 2.0 | Hugging Face |
| jekunz/smollm135m-da1-is1-ties (checkpoint intermedio) | 135 M aprox. | no disponible | Danes e islandes | no disponible | Hugging Face |

No se dispone de benchmarks comparativos publicados entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: el autor indica explícitamente que no ha sido evaluado de forma amplia; no debe usarse en producción sin validación propia.
- Riesgo elevado de alucinación y de generar texto incoherente, especialmente por el tamaño reducido y el entrenamiento corto (5 épocas sobre feroés).
- Posible olvido catastrófico de las capacidades instructivas originales tras el CPT, incluyendo el seguimiento de instrucciones y el multilingüismo del modelo base.
- Cobertura limitada a feroés; el rendimiento en otros idiomas no está documentado y probablemente sea deficiente.
- Contexto máximo de 2048 tokens, insuficiente para documentos largos o conversaciones extensas.
- Sesgos heredados de FineWeb-2 y del modelo base, sin auditoría publicada.
- Licencia Apache 2.0 permite uso comercial, pero la falta de evaluación hace desaconsejable su despliegue sin pruebas adicionales.
- No se documentan medidas de seguridad, filtrado de contenido ni alineación posteriores al CPT.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jekunz/smollm-135m-cpt-fineweb-faroese-transfer-from-scandimerge-2-seed1
- Modelo base intermedio: https://huggingface.co/jekunz/smollm135m-da1-is1-ties
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- SmolLM2-135M-Instruct (modelo de partida): https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
- Paper de TIES-Merging: https://arxiv.org/abs/2306.01708
