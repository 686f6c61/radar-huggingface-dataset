# jekunz/smollm-135m-lora-fineweb-faroese-transfer-from-danish-seed3

## Resumen

El modelo `jekunz/smollm-135m-lora-fineweb-faroese-transfer-from-danish-seed3` es un adaptador LoRA entrenado sobre SmolLM2-135M-Instruct, un transformer decoder-only de 135 millones de parámetros desarrollado originalmente por Hugging Face. El autor del adaptador, `jekunz`, lo ha ajustado de forma secuencial: primero sobre la porción danesa de FineWeb-2 y después sobre la porción feroesa del mismo corpus, con el objetivo de transferir conocimiento entre lenguas germánicas nórdicas y mejorar el modelado del feroés, un idioma de bajos recursos.

Se trata de un artefacto de investigación y no de un modelo listo para producción. El propio autor indica que no ha sido evaluado de forma amplia. Su interés radica en que documenta una estrategia concreta de adaptación cross-lingual (danés como lengua puente hacia el feroés) sobre un modelo pequeño, con una configuración LoRA de rango 256 sobre las proyecciones MLP y un coste de entrenamiento de una sola GPU A100 de 40 GB.

El repositorio ocupa 0,2 GB y contiene únicamente los pesos del adaptador en formato safetensors, no el modelo completo. Para utilizarlo es necesario cargar el modelo base danés `jekunz/smollm-135m-lora-fineweb-danish` y superponer este adaptador. Es la semilla 3 de tres ejecuciones con la misma configuración, lo que sugiere un interés en medir la varianza del entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM2-135M-Instruct) con adaptador LoRA |
| Parametros totales | 135M en el modelo base; el adaptador LoRA no declara recuento propio |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens durante el entrenamiento; la del modelo base no se especifica en la informacion disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | feroes (fo); el modelo base esta entrenado en danes e ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo base es SmolLM2-135M-Instruct, un transformer decoder-only denso de 135 millones de parámetros. Sobre él se aplica un adaptador LoRA con rango 256 y alpha 512, es decir, un escalado de 2,0, dirigido a cuatro módulos: `up_proj`, `down_proj`, `gate_proj` y `o_proj`. Esto cubre las proyecciones de las capas feed-forward y la proyección de salida de la atención, pero no las proyecciones de query, key ni value. El adaptador se apila sobre un ajuste previo en danés (`jekunz/smollm-135m-lora-fineweb-danish`), de modo que el entrenamiento es una transferencia secuencial danés → feroés.

El entrenamiento usa una época sobre el subconjunto danés de FineWeb-2 y cinco épocas sobre el subconjunto feroés. La tasa de aprendizaje es 8e-4 con scheduler coseno y warmup del 5 %, tamaño de lote efectivo de 256 (lote 8 con acumulación de gradientes de 32), longitud máxima de 2048 tokens y semilla 3. Se ejecutó en una única A100 de 40 GB. No se documenta el número de tokens procesados, la composición exacta del corpus más allá de FineWeb-2, ni si hubo etapas de RLHF o DPO; el pipeline declarado es `text-generation` con etiqueta `conversational`, heredada del modelo base Instruct.

## Capacidades

- Generación de texto autoregresiva en feroés, con posible transferencia parcial desde danés e inglés por el modelo base.
- Conversación multi-turno en el formato de chat de SmolLM2-Instruct, aunque el ajuste se ha hecho sobre texto crudo de FineWeb-2 y no sobre datos de diálogo.
- Modelado de lenguaje y continuación de texto en dominio web.
- Capacidad multilingüe limitada: el autor solo declara `fo` como idioma; el base soporta inglés y, tras el ajuste intermedio, danés.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.
- No hay modo thinking, visión ni audio.
- No se declaran capacidades de código o matemáticas específicas; las del base Instruct pueden degradarse tras el ajuste sobre corpus web.

## Casos de uso

- Investigación en transferencia cross-lingual: permite estudiar si un ajuste intermedio en danés mejora el modelado del feroés frente a un ajuste directo, comparando esta semilla con las otras dos del mismo experimento.
- Generación de texto sintético en feroés para aumento de datos: el modelo puede producir borradores de frases en feroés que, tras filtrado humano, sirvan para ampliar corpus de una lengua de bajos recursos.
- Experimentos de ablación sobre LoRA: la configuración concreta (rango 256, alpha 512, módulos MLP) sirve como referencia reproducible para estudiar el efecto del rango y de los módulos objetivo en modelos de 135M.
- Completado de texto en herramientas de escritura para feroés: con 2048 tokens de contexto puede asistir en la redacción de párrafos cortos, siempre con revisión humana.
- Evaluación de la varianza de semillas: al ser la semilla 3 de tres, permite cuantificar cuánto varían las métricas de perplejidad entre ejecuciones idénticas.
- Prototipado de bajo coste: al caber en una GPU consumer y ocupar 0,2 GB, sirve para validar pipelines de inferencia PEFT antes de escalar a modelos mayores.
- Base para posteriores ajustes: puede actuar como punto de partida para un ajuste supervisado en feroés con datos de instrucciones, dado que ya ha visto corpus feroés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que el modelo no ha sido evaluado más allá de su uso en investigación.

## Requisitos de hardware

- VRAM estimada: el adaptador en safetensors ocupa 0,2 GB; el modelo base de 135M en fp16 requiere aproximadamente 0,3 GB de pesos, y en fp32 unos 0,55 GB. Con overhead de activaciones y caché KV para 2048 tokens, la inferencia cabe holgadamente en 2-4 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM. El entrenamiento se realizó en una A100 de 40 GB, pero la inferencia no requiere hardware de centro de datos.
- Cabe en GPU consumer: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 o incluso iGPU con suficiente memoria compartida.
- Opciones de despliegue: `transformers` con `peft` para cargar el adaptador, `llama.cpp` u Ollama si se convierte el modelo fusionado a GGUF, y vLLM o TGI para servir el modelo fusionado. El adaptador por sí solo requiere PEFT.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera un throughput alto en GPU consumer, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (SmolLM2-135M + LoRA feroés) | 135M (base) | 2048 (entrenamiento) | fo | Apache 2.0 | Hugging Face, 0 descargas |
| SmolLM2-135M-Instruct | 135M | no disponible en la informacion | en (principalmente) | Apache 2.0 | Hugging Face, ampliamente usado |
| jekunz/smollm-135m-lora-fineweb-danish | 135M (base) | 2048 (entrenamiento) | da | Apache 2.0 | Hugging Face, adaptador previo |
| Otros adaptadores LoRA para lenguas de bajos recursos sobre SmolLM2 | 135M (base) | variable | variable | variable | no disponible |

La comparación con modelos de mayor tamaño no es pertinente: se trata de un adaptador de investigación sobre un modelo de 135M, no de un modelo de propósito general. Frente al SmolLM2-135M-Instruct original, la diferencia es el ajuste en feroés; frente al adaptador danés, la diferencia es la segunda etapa de entrenamiento.

## Limitaciones y advertencias

- Modelo sin evaluar: el autor declara que no ha sido evaluado ampliamente; no hay métricas de perplejidad, calidad o fidelidad publicadas.
- Riesgo alto de alucinación y de texto incoherente, especialmente por el tamaño del modelo base (135M) y por el ajuste sobre corpus web sin filtrado de instrucciones.
- El ajuste sobre FineWeb-2 (texto web crudo) puede degradar la capacidad conversacional y de seguimiento de instrucciones del modelo base Instruct.
- Cobertura lingüística muy limitada: solo se declara feroés; el rendimiento en danés o inglés tras el ajuste no está documentado.
- Contexto efectivo de 2048 tokens, insuficiente para documentos largos o conversaciones extensas.
- Sesgos: al entrenarse sobre texto web, puede reproducir sesgos presentes en FineWeb-2; no se documenta ningún proceso de mitigación.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación hace desaconsejable su uso en producción sin validación propia.
- Es un adaptador, no un modelo autónomo: requiere cargar el modelo base danés y la librería PEFT; no funciona con `transformers` sin `peft` instalado.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso o validación por parte de la comunidad.
- Al ser la semilla 3 de tres, los resultados pueden diferir de las otras ejecuciones; no se aportan métricas comparativas entre semillas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jekunz/smollm-135m-lora-fineweb-faroese-transfer-from-danish-seed3
- Modelo base del adaptador: https://huggingface.co/jekunz/smollm-135m-lora-fineweb-danish
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- SmolLM2 (Hugging Face): no disponible en la informacion proporcionada
- Repositorio GitHub encontrado en la busqueda (no relacionado con el modelo): https://github.com/Taewan-P/gpt_mobile
