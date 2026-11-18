# jekunz/smollm-360m-lora-fineweb-faroese-transfer-from-norwegian-nynorsk-seed2

## Resumen

El modelo `jekunz/smollm-360m-lora-fineweb-faroese-transfer-from-norwegian-nynorsk-seed2` es un adaptador LoRA de generación de texto entrenado sobre SmolLM2-360M-Instruct, un transformer denso de 360 millones de parámetros desarrollado originalmente por Hugging Face. El autor del adaptador, jekunz, lo entrena en dos fases: primero sobre la porción en noruego nynorsk de FineWeb-2 y después sobre la porción en feroés del mismo corpus, con el objetivo de transferir conocimiento entre lenguas germánicas escandinavas de bajos recursos. El resultado es un adaptador específico para feroés (`fo`) que se distribuye como pesos PEFT en formato safetensors bajo licencia Apache 2.0.

El interés del modelo es metodológico más que de producto: ilustra una estrategia de transferencia lingüística (nynorsk como lengua puente hacia el feroés) aplicada a un modelo pequeño, con un rango LoRA inusualmente alto (256) y módulos objetivo limitados a las proyecciones del bloque MLP y la proyección de salida de atención. Se trata de un artefacto de investigación, según declara el propio autor, sin evaluación amplia publicada y con cero descargas en el momento de redactar esta ficha.

Por su tamaño (360M parámetros) y su contexto de entrenamiento (2048 tokens), el modelo está pensado para experimentación académica y despliegue ligero en CPU o GPU de consumo, no para tareas de producción de alta exigencia. La ficha siguiente recoge únicamente los datos disponibles en la información proporcionada y marca como "no disponible" todo aquello que el autor no documenta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (base: SmolLM2-360M-Instruct); adaptador LoRA sobre proyecciones `up_proj`, `down_proj`, `gate_proj`, `o_proj` |
| Parámetros totales | 360M (modelo base); el adaptador LoRA usa rango 256 y alpha 512 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (longitud máxima usada en entrenamiento) |
| Tipos de cuantización | no disponible (el adaptador se publica en safetensors; no se documentan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | Feroés (`fo`); entrenamiento previo en noruego nynorsk como lengua puente |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base `jekunz/smollm-360m-lora-fineweb-norwegian-nynorsk` |

## Arquitectura y entrenamiento

El modelo base es SmolLM2-360M-Instruct, un transformer decoder-only denso de 360 millones de parámetros. Sobre él se aplica un adaptador LoRA con rango 256, alpha 512 y módulos objetivo restringidos a `up_proj`, `down_proj`, `gate_proj` y `o_proj`. El adaptador se entrena en dos etapas secuenciales: una época sobre la porción en noruego nynorsk de FineWeb-2 y cinco épocas sobre la porción en feroés del mismo corpus. La segunda etapa parte del adaptador resultante de la primera (`jekunz/smollm-360m-lora-fineweb-norwegian-nynorsk`), de modo que el feroés se beneficia de representaciones ya ajustadas a una lengua germánica escandinava cercana.

La configuración de entrenamiento documentada incluye learning rate 8e-4, scheduler coseno, warmup ratio 0.05, batch size 8 con acumulación de gradientes de 32 pasos (batch efectivo 256), longitud máxima de 2048 tokens, una única GPU A100 de 40 GB y semilla 2 (el autor indica que esta configuración se repite con tres semillas distintas). No se documentan número total de tokens procesados, composición exacta del dataset, ni si hubo etapas de RLHF o DPO; tampoco se mencionan innovaciones de inferencia como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto en feroés, apoyada en un ajuste previo sobre noruego nynorsk.
- Modelo conversacional: el pipeline declarado es `text-generation` y la base es una variante Instruct, aunque el ajuste se hace sobre corpus web (FineWeb-2), no sobre datos de instrucciones en feroés.
- Continuación y modelado de lenguaje sobre texto web en feroés.
- Transferencia lingüística entre lenguas escandinavas: el adaptador intermedio en nynorsk puede reutilizarse como punto de partida para otras lenguas de la familia.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo "thinking".
- Capacidad multilingüe limitada al feroés y, de forma indirecta, al nynorsk; no se declaran otros idiomas.

## Casos de uso

- Investigación en transferencia lingüística de bajos recursos: usar el adaptador como punto de partida para estudiar cómo una lengua puente (nynorsk) mejora el ajuste en otra lengua escandinava (feroés) con corpus web limitados.
- Generación de texto sintético en feroés: producir borradores o aumentación de datos para entrenar correctores ortográficos o modelos de lenguaje más grandes en esa lengua, dado el escaso volumen de corpus feroés disponible.
- Experimentos de ablación de hiperparámetros LoRA: la publicación de tres semillas con la misma configuración permite medir la varianza del ajuste con rango 256 y alpha 512 sobre un modelo de 360M.
- Prototipado de completado de texto en aplicaciones de escritorio o móviles: con 360M parámetros, el modelo puede ejecutarse en CPU o en GPU de consumo, lo que facilita demos locales de generación en feroés sin infraestructura dedicada.
- Evaluación comparativa de modelos pequeños para lenguas de bajos recursos: sirve como línea base frente a modelos multilingües mayores a la hora de medir perplejidad o calidad de generación en feroés.
- Docencia y reproducción de recetas de ajuste: la configuración completa (épocas, learning rate, batch efectivo, GPU) es reproducible en una sola A100 de 40 GB, lo que lo hace adecuado como ejemplo práctico en cursos de ajuste fino con PEFT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que el modelo "no ha sido evaluado más ampliamente todavía".

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 360M parámetros ocupa aproximadamente 0,7 GB en fp16 y alrededor de 0,35 GB en int8; el adaptador LoRA añade una fracción mínima (repo de 0,4 GB, que incluye los pesos del adaptador).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; se ha entrenado en una A100 de 40 GB, pero la inferencia no requiere esa clase de hardware.
- GPU de consumo: cabe holgadamente en RTX 3060, RTX 4060, RTX 4090 y similares; también es viable en CPU.
- Opciones de despliegue: al ser un adaptador PEFT, requiere cargar el modelo base con `transformers` + `peft`; para inferencia optimizada puede fusionarse el adaptador y exportarse a llama.cpp u Ollama, aunque el autor no documenta estas rutas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (SmolLM2-360M + LoRA feroés) | 360M (base) | 2048 | Feroés | Apache 2.0 | Hugging Face (0 descargas) |
| SmolLM2-360M-Instruct (base) | 360M | no disponible en la información | Multilingüe (no detallado) | Apache 2.0 | Hugging Face |
| Adaptador intermedio `smollm-360m-lora-fineweb-norwegian-nynorsk` | 360M (base) | 2048 | Noruego nynorsk | Apache 2.0 | Hugging Face |
| Alternativas específicas para feroés de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación sin evaluación publicada: el autor declara que no ha sido evaluado ampliamente, por lo que no hay garantías de calidad en generación.
- Entrenado sobre corpus web (FineWeb-2): puede reproducir sesgos, ruido y contenido de baja calidad presentes en los datos de origen.
- Riesgo de alucinación elevado por el tamaño reducido (360M) y por el ajuste sobre texto web sin etapa de alineación documentada.
- Contexto limitado a 2048 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Cobertura lingüística restringida al feroés; el rendimiento en otros idiomas no está documentado y probablemente sea deficiente.
- Requiere el modelo base `jekunz/smollm-360m-lora-fineweb-norwegian-nynorsk` para funcionar; no es un modelo autónomo.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación y el origen de los datos aconsejan revisión previa antes de cualquier despliegue en producción.
- Sin datos de benchmarks, no es posible comparar su calidad objetiva frente a alternativas multilingües.

## Enlaces

- Hugging Face: https://huggingface.co/jekunz/smollm-360m-lora-fineweb-faroese-transfer-from-norwegian-nynorsk-seed2
- Modelo base del adaptador: https://huggingface.co/jekunz/smollm-360m-lora-fineweb-norwegian-nynorsk
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- SmolLM2 (modelo base original de Hugging Face): no disponible en la información proporcionada
- Paper o blog del autor: no disponible en la información proporcionada
