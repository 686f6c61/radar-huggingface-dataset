# reaperdoesntknow/DiscoverLM-70M

## Resumen

DiscoverLM-70M es un modelo de lenguaje causal de 69,13 millones de parámetros desarrollado por el usuario independiente `reaperdoesntknow` y publicado en Hugging Face. Su particularidad es que no emplea la atención por producto escalar habitual en los transformers, sino una arquitectura propia denominada Mixture-of-Attentions (MoA), en la que la puntuación de atención se calcula como distancia de Mahalanobis negativa y se regulariza explícitamente para que respete la desigualdad triangular. El modelo se distribuye con licencia `cc`, soporta únicamente inglés y está pensado para generación de texto.

El modelo se ha entrenado mediante SFT (supervised fine-tuning) con TRL sobre tres conjuntos de datos: `nohurry/Opus-4.6-Reasoning-3000x-filtered` (razonamiento multi-paso), `openbmb/UltraData-Math` (matemáticas) y `yahma/alpaca-cleaned` (instrucciones generales). El entrenamiento es extremadamente corto: 512 pasos, 8 épocas y 262.144 tokens vistos, con longitud de secuencia máxima de 1.024 tokens, lo que sitúa al modelo más en el terreno de la prueba de concepto arquitectónica que en el de un modelo de producción.

Su relevancia es fundamentalmente experimental: propone una geometría métrica en la atención, un router top-2 sobre cuatro rutas paralelas por bloque, una codificación posicional propia (BlackHoleRoPE) y una cabeza de lenguaje que también aplica mezcla de atenciones. Con 1.706 descargas y 0 likes en el momento de la consulta, es un modelo de nicho orientado a investigadores interesados en alternativas al dot-product attention.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con Mixture-of-Attentions (MoA): 4 bloques MoA + HyperFFN + MoA LM head |
| Parametros totales | 69.130.608 (69,1 M) |
| Parametros activos | no disponible (el router top-2 opera sobre rutas, no sobre expertos con parámetros separados; el autor no publica el recuento activo) |
| Longitud de contexto | 1.024 tokens (longitud máxima de secuencia en entrenamiento) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors en fp32; no hay GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | inglés (`en`) |
| Licencia | `cc` (Creative Commons, variante no especificada en la información disponible) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura sustituye la atención por producto escalar por una atención métrica: cada una de las 64 cabezas opera en un espacio de 8 dimensiones con su propia escala diagonal (métrica de Mahalanobis), un origen de bola aprendible y un radio adaptativo que enmascara pares fuera de la bola antes del softmax. Durante el entrenamiento se añade un regularizador sobre tripletas aleatorias (λ=0,01, 64 muestras por batch) que fuerza la desigualdad triangular. Cada bloque MoA combina cuatro rutas paralelas —convolución local depthwise, atención métrica global multi-cabeza, mezcla de canales con gating y atención métrica multi-query— seleccionadas por un router top-2 por token, con feature gates y DropPath. El FFN es un HyperFFN de tres ramas (SwiGLU, convolución causal depthwise separable y cuello de botella low-rank con gating) también enrutado top-2. La cabeza de lenguaje repite el esquema de mezcla con 32 cabezas y head_dim=16 antes de proyectar a un vocabulario de 48.000 tokens con embedding atado.

El entrenamiento se realizó con AdamW, learning rate 3e-4 con decaimiento coseno, batch size 4, 512 pasos, 8 épocas y 262.144 tokens en total, en precisión fp32 sobre una NVIDIA H100. La pérdida media bajó de 2,887 en la época 1 a 1,014 en la época 8, con una precisión de token del 59,2 % al 80,8 %; el mejor paso individual (393) alcanzó pérdida 0,599 y precisión de token del 88,4 %. La desviación típica de la pérdida se redujo de 0,291 a 0,142. El presupuesto de parámetros se reparte en 24,6 M para el embedding atado (35,5 %), 28,9 M para los cuatro bloques MoA (41,8 %), 4,2 M para el HyperFFN compartido (6,1 %), 10,8 M para la cabeza MoA (15,6 %) y 0,6 M para RoPE y normalizaciones (0,9 %).

## Capacidades

- Generación de texto causal en inglés con vocabulario propio de 48.000 tokens.
- Razonamiento multi-paso, entrenado explícitamente sobre el dataset `Opus-4.6-Reasoning-3000x-filtered`.
- Resolución de problemas matemáticos, por el entrenamiento sobre `UltraData-Math`.
- Seguimiento de instrucciones generales, vía `alpaca-cleaned`.
- Enrutado condicional por token (top-2 de 4 rutas) en atención y en FFN, con gates aprendidos.
- Codificación posicional propia (BlackHoleRoPE) con perturbaciones de fase aprendidas y gating de energía en V acotado a [0,5, 2,0].
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso autónomo: no disponible como capacidad verificada.
- Capacidades multilingües: no, solo inglés.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Investigación sobre alternativas a la atención por producto escalar: el modelo sirve como banco de pruebas reproducible para estudiar si la atención métrica con regularización triangular converge y generaliza en comparación con un transformer equivalente de 70 M.
- Experimentos de enrutamiento condicional: el router top-2 sobre cuatro rutas de atención y tres ramas de FFN permite analizar patrones de selección por token y su relación con el tipo de contenido (código, matemáticas, lenguaje natural).
- Prototipado rápido de pipelines de generación de texto en inglés: con 69 M de parámetros y pesos safetensors de 0,6 GB, se puede cargar en una GPU consumer para pruebas de integración con `transformers` sin infraestructura dedicada.
- Evaluación de codificaciones posicionales: BlackHoleRoPE, con fases aprendidas sobre base de Fourier y gating de amplitud en V, es un objeto de estudio comparativo frente a RoPE estándar en secuencias de hasta 1.024 tokens.
- Docencia y divulgación: por su tamaño reducido y su model card detallada (presupuesto de parámetros, curvas de pérdida por época, hiperparámetros), es útil para explicar mezcla de expertos, atención métrica y regularizadores geométricos en cursos de arquitecturas de modelos de lenguaje.
- Fine-tuning ligero sobre dominios concretos en inglés: al ser un modelo pequeño con licencia `cc`, se puede adaptar con SFT sobre datasets específicos (atención al cliente, clasificación de texto enmascarada como generación) en una sola GPU, siempre que la longitud de contexto de 1.024 tokens sea suficiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas de entrenamiento (pérdida y precisión de token por época), que se reproducen a continuación:

| Epoca | Perdida media | Perdida minima | Sigma | Precision de token |
|---|---|---|---|---|
| 1 | 2,887 | 2,285 | 0,291 | 59,2 % |
| 2 | 2,324 | 1,651 | 0,259 | 63,4 % |
| 3 | 1,931 | 1,232 | 0,211 | 68,4 % |
| 4 | 1,616 | 1,012 | 0,201 | 74,4 % |
| 5 | 1,432 | 0,954 | 0,169 | 77,0 % |
| 6 | 1,211 | 0,677 | 0,180 | 79,0 % |
| 7 | 1,075 | 0,599 | 0,151 | 80,1 % |
| 8 | 1,014 | 0,718 | 0,142 | 80,8 % |

Mejor paso individual: paso 393, pérdida 0,599, precisión de token 88,4 %. No hay resultados de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación estandarizada.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,28 GB solo para pesos (69,1 M × 4 bytes), más activaciones y caché KV; en la práctica cabe holgadamente en cualquier GPU con 2 GB o más.
- VRAM estimada en fp16/bf16: alrededor de 0,14 GB para pesos; no se publican checkpoints en estas precisiones, pero la conversión es directa desde safetensors.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es sobrada; el autor entrenó en una H100, pero el tamaño no la requiere para inferencia.
- Cabe en GPU consumer: sí, en la práctica totalidad de tarjetas con 2 GB o más de VRAM, e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: `transformers` es la vía soportada (la model card declara `library_name: transformers` y `endpoints_compatible`). No se publican pesos GGUF, por lo que llama.cpp y Ollama requerirían conversión manual y verificar que la arquitectura MoA esté soportada por esos runtimes. vLLM y TGI no están confirmados para esta arquitectura.
- Latencia y throughput estimados: no disponibles. Con 69 M de parámetros y contexto de 1.024 tokens, la latencia esperada es de pocos milisegundos por token en GPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| DiscoverLM-70M | 69,1 M | 1.024 | `cc` | Hugging Face, solo safetensors | Arquitectura MoA experimental, solo inglés |
| GPT-2 small | 124 M | 1.024 | MIT | Hugging Face, amplio ecosistema | Transformer estándar, referencia histórica |
| Pythia-70M | 70 M | 2.048 | Apache 2.0 | Hugging Face, con checkpoints intermedios | Transformer estándar, entrenado sobre The Pile |
| TinyLlama-1.1B | 1,1 B | 2.048 | Apache 2.0 | Hugging Face, GGUF y múltiples cuantizaciones | Un orden de magnitud mayor, ecosistema maduro |

La comparación directa es difícil porque no hay benchmarks publicados para DiscoverLM-70M. Frente a Pythia-70M, de tamaño casi idéntico, la diferencia principal es arquitectónica (MoA frente a transformer estándar) y de ecosistema: Pythia ofrece checkpoints intermedios, licencia Apache 2.0 y soporte en la mayoría de runtimes, mientras que DiscoverLM-70M solo publica el checkpoint final con licencia `cc` no detallada y sin cuantizaciones.

## Limitaciones y advertencias

- Entrenamiento muy corto: 262.144 tokens vistos y 512 pasos sitúan al modelo en régimen de sobreajuste sobre tres datasets pequeños; la pérdida de validación no se reporta, por lo que no hay evidencia de generalización.
- Contexto limitado a 1.024 tokens, insuficiente para la mayoría de casos de uso de contexto largo.
- Solo inglés; no hay evidencia de capacidades multilingües.
- Riesgo elevado de alucinación y de degradación fuera de la distribución de los tres datasets de entrenamiento (razonamiento filtrado, matemáticas y Alpaca).
- Licencia `cc` sin variante especificada: la model card no aclara si se trata de CC BY, CC BY-SA, CC BY-NC o CC0, lo que impide determinar con certeza las restricciones de uso comercial. Es imprescindible contactar con el autor antes de un despliegue en producción.
- Sin benchmarks estandarizados publicados; no es posible comparar su calidad con modelos de tamaño similar de forma objetiva.
- Arquitectura no estándar (MoA, BlackHoleRoPE, HyperFFN, router top-2): la compatibilidad con runtimes de inferencia optimizados (vLLM, TGI, llama.cpp, Ollama) no está garantizada y requeriría implementación específica.
- El vocabulario es propio (48.000 tokens) y el embedding está atado a la cabeza; el tokenizador no es compatible con los de Llama, GPT-2 u otros modelos habituales.
- Sesgos conocidos: no disponibles en la información proporcionada; al entrenarse sobre Alpaca y datasets filtrados, es probable que herede sesgos de esas fuentes, pero no hay evaluación publicada.
- Uso en producción no recomendado sin una evaluación previa exhaustiva: el modelo es un experimento arquitectónico, no un modelo listo para despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/DiscoverLM-70M
- Dataset de razonamiento: https://huggingface.co/datasets/nohurry/Opus-4.6-Reasoning-3000x-filtered
- Dataset de matemáticas: https://huggingface.co/datasets/openbmb/UltraData-Math
- Dataset de instrucciones: https://huggingface.co/datasets/yahma/alpaca-cleaned
- Paper, blog, repositorio o demo adicionales: no disponible en la información proporcionada.
