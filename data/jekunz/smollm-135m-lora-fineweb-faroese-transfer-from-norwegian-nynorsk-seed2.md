# jekunz/smollm-135m-lora-fineweb-faroese-transfer-from-norwegian-nynorsk-seed2

## Resumen

Este repositorio contiene un adaptador LoRA entrenado sobre el modelo base `jekunz/smollm-135m-lora-fineweb-norwegian-nynorsk`, que a su vez parte de SmolLM2-135M-Instruct de Hugging Face. El autor, `jekunz`, lo presenta como parte de su trabajo de investigación sobre adaptación lingüística de modelos pequeños a lenguas de bajos recursos, en este caso el feroés (`fo`), mediante transferencia desde el noruego nynorsk. El adaptador se ha entrenado sobre la porción feroesa del corpus FineWeb-2, un conjunto de datos web multilingüe a gran escala.

El modelo resuelve un problema concreto: disponer de un generador de texto en feroés de muy bajo coste computacional, aprovechando el parentesco tipológico entre el nynorsk y el feroés para reducir los datos necesarios en la fase de adaptación. Con 135 millones de parámetros en el modelo base, está pensado para entornos con recursos limitados, prototipado rápido y experimentación académica más que para producción a gran escala.

Es relevante ahora porque ejemplifica una tendencia práctica: la especialización de modelos pequeños mediante LoRA y currículos de transferencia entre lenguas cercanas, una alternativa económica a los modelos multilingües grandes cuando solo se necesita una lengua concreta. El autor advierte explícitamente de que no ha realizado una evaluación amplia del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM2-135M-Instruct) con adaptador LoRA |
| Parametros totales | 135 millones en el modelo base; el adaptador LoRA añade parámetros según rango 256 y módulos objetivo |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens durante el entrenamiento (la del modelo base puede diferir; no disponible en la información proporcionada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | feroés (`fo`); entrenado con transferencia desde noruego nynorsk |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre SmolLM2-135M-Instruct, un transformer decoder-only de 135 millones de parámetros. La configuración LoRA emplea rango 256, alpha 512 y módulos objetivo `up_proj`, `down_proj`, `gate_proj` y `o_proj`, es decir, las proyecciones de las capas MLP y la proyección de salida de la atención. El entrenamiento se realizó en dos fases secuenciales: primero una época sobre la porción de noruego nynorsk de FineWeb-2 y después cinco épocas sobre la porción de feroés del mismo corpus, lo que constituye un currículo de transferencia entre lenguas germánicas nórdicas cercanas.

Los hiperparámetros documentados son: tasa de aprendizaje 8e-4, scheduler coseno, warmup ratio 0,05, batch size 8 con acumulación de gradientes de 32 pasos (batch efectivo 256), longitud máxima de contexto 2048 tokens, semilla 2 (una de tres semillas para esta configuración) y entrenamiento en una única GPU A100 de 40 GB. No se documentan en la información disponible detalles sobre volumen total de tokens, composición exacta del dataset, ni uso de RLHF o DPO.

## Capacidades

- Generación de texto en feroés, heredada de la adaptación sobre FineWeb-2.
- Conversación multi-turno en la medida en que el modelo base es una variante Instruct, aunque el ajuste se ha realizado sobre texto web y no sobre datos de diálogo.
- Transferencia lingüística desde noruego nynorsk, lo que puede favorecer el vocabulario compartido y estructuras morfosintácticas próximas.
- No hay evidencia documentada de soporte de tool calling, function calling ni razonamiento multi-paso en esta ficha.
- No hay evidencia documentada de capacidades de visión, audio ni modo de razonamiento explícito.
- Capacidad multilingüe limitada al feroés declarado; el resto de lenguas depende del modelo base y no está evaluado.

## Casos de uso

- Prototipado de generación de texto en feroés: el tamaño de 135 millones de parámetros permite iterar rápidamente en una sola GPU y validar hipótesis sobre calidad lingüística antes de escalar a modelos mayores.
- Investigación sobre transferencia entre lenguas cercanas: sirve como punto de partida para estudiar hasta qué punto el nynorsk ayuda al feroés y comparar con las otras semillas del mismo autor.
- Generación de datos sintéticos en feroés para aumentar corpus de entrenamiento: con supervisión humana, puede producir borradores que luego se filtran y corrigen.
- Experimentos académicos de bajo coste: útil en cursos y trabajos donde no hay acceso a clústeres grandes, ya que el adaptador ocupa 0,2 GB en el repositorio.
- Aplicaciones de demostración y prototipos de interfaz conversacional en feroés: adecuado para pruebas de concepto, no para atención al cliente en producción sin evaluación previa.
- Evaluación de técnicas LoRA en lenguas de bajos recursos: la configuración concreta (rango 256, alpha 512, módulos MLP y `o_proj`) permite reproducir y comparar variantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El propio autor indica que el modelo no ha sido evaluado de forma amplia.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja, en torno a 1-2 GB en fp16 para el modelo base de 135 millones de parámetros, más el adaptador LoRA; no se dispone de cifras oficiales.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el entrenamiento se realizó en una A100 de 40 GB, pero la inferencia cabe holgadamente en RTX 3060, RTX 4060, RTX 4090 o superiores.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU con al menos 2-4 GB de VRAM, e incluso en CPU para inferencia no interactiva.
- Opciones de despliegue: al ser un adaptador PEFT, requiere cargar el modelo base con `transformers` y `peft`; también puede fusionarse y convertirse a GGUF para llama.cpp u Ollama, aunque esta conversión no está documentada en la información disponible. vLLM y TGI son viables con el modelo fusionado.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (SmolLM2-135M + LoRA feroés) | 135 M (base) | 2048 en entrenamiento | Feroés | Apache 2.0 | Hugging Face, PEFT |
| SmolLM2-135M-Instruct (base) | 135 M | no disponible en la información proporcionada | Multilingüe (inglés principalmente) | Apache 2.0 | Hugging Face |
| `jekunz/smollm-135m-lora-fineweb-norwegian-nynorsk` (base del adaptador) | 135 M | 2048 en entrenamiento | Noruego nynorsk | Apache 2.0 | Hugging Face, PEFT |
| Otras semillas del mismo autor (seed 1 y seed 3) | 135 M | 2048 en entrenamiento | Feroés | Apache 2.0 | Hugging Face, PEFT |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El autor declara explícitamente que el modelo es para su investigación y que no ha sido evaluado de forma amplia; no debe asumirse calidad lingüística verificada en feroés.
- Al entrenarse sobre texto web de FineWeb-2, puede reproducir sesgos, ruido y contenido indeseado presente en el corpus.
- Riesgo de alucinación inherente a un modelo de 135 millones de parámetros, especialmente en tareas factuales o de razonamiento.
- Contexto limitado a 2048 tokens durante el entrenamiento, insuficiente para documentos largos.
- El ajuste se hizo sobre texto web, no sobre datos conversacionales, por lo que el comportamiento Instruct puede degradarse respecto al modelo base.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación hace desaconsejable su uso en producción sin validación previa.
- Solo se declara feroés como idioma; el rendimiento en otras lenguas no está caracterizado.
- El adaptador requiere cargar el modelo base y la librería PEFT, lo que añade complejidad frente a un modelo ya fusionado.

## Enlaces

- [Hugging Face: jekunz/smollm-135m-lora-fineweb-faroese-transfer-from-norwegian-nynorsk-seed2](https://huggingface.co/jekunz/smollm-135m-lora-fineweb-faroese-transfer-from-norwegian-nynorsk-seed2)
- [Modelo base del adaptador: jekunz/smollm-135m-lora-fineweb-norwegian-nynorsk](https://huggingface.co/jekunz/smollm-135m-lora-fineweb-norwegian-nynorsk)
- [Dataset: HuggingFaceFW/fineweb-2](https://huggingface.co/datasets/HuggingFaceFW/fineweb-2)
- [SmolLM2-135M-Instruct (modelo base original)](https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct)
