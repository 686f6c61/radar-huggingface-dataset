# jekunz/smollm-360m-lora-fineweb-faroese-transfer-from-swedish-seed2

## Resumen

El modelo `jekunz/smollm-360m-lora-fineweb-faroese-transfer-from-swedish-seed2` es un adaptador LoRA de tipo PEFT construido sobre una cadena de ajustes sucesivos que parte de SmolLM2-360M-Instruct. El autor, jekunz, lo ha entrenado primero sobre la porción sueca de FineWeb-2 y después sobre la porción feroesa del mismo corpus, con el objetivo de estudiar la transferencia lingüística entre lenguas germánicas nórdicas de bajos recursos. El resultado es un adaptador que se aplica sobre el checkpoint intermedio en sueco, no directamente sobre el modelo base original.

Se trata de un artefacto de investigación, no de un modelo listo para producción: el propio autor indica que no ha sido evaluado de forma amplia. Su interés técnico reside en la metodología (fine-tuning en dos fases con un LoRA de rango alto, 256, y alpha 512) y en el uso del feroés como lengua objetivo, un idioma con muy pocos recursos digitales. El repositorio ocupa 0,4 GB y contiene únicamente los pesos del adaptador en formato safetensors.

La relevancia actual es acotada pero clara: sirve como referencia reproducible (semilla 2 de tres configuraciones) para experimentos de adaptación cross-lingual de sub-1B parámetros y para validar pipelines de entrenamiento LoRA sobre corpus multilingües masivos como FineWeb-2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM2-360M-Instruct) con adaptador LoRA (PEFT) |
| Parametros totales | No disponible para el adaptador; el modelo base SmolLM2-360M-Instruct tiene ~362M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens durante el entrenamiento; el contexto del modelo base no se detalla en la informacion disponible |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors sin cuantizar) |
| Idiomas soportados | Feroes (fo) como objetivo; entrenamiento previo en sueco y base instruida en ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre SmolLM2-360M-Instruct, un transformer decoder-only de unos 362 millones de parámetros. El LoRA emplea rango 256 y alpha 512, con módulos objetivo `up_proj`, `down_proj`, `gate_proj` y `o_proj`, es decir, las proyecciones de las capas MLP y la proyección de salida de la atención. El entrenamiento se realizó en dos fases: una época sobre la porción sueca de FineWeb-2 y cinco épocas sobre la porción feroesa, lo que constituye una estrategia de transferencia secuencial desde una lengua nórdica con más datos hacia otra con menos.

Los hiperparámetros son learning rate 8e-4, scheduler coseno, warmup ratio 0.05, batch size 8 con 32 pasos de acumulación (batch efectivo 256), longitud máxima de 2048 tokens, una única GPU A100 de 40 GB y semilla 2. No se documentan en la información disponible el número total de tokens procesados, la composición exacta del dataset, ni si hubo etapas de RLHF o DPO posteriores al ajuste supervisado.

## Capacidades

- Generación de texto conversacional en feroés, heredada de la naturaleza instruct del modelo base y reforzada con el ajuste sobre FineWeb-2.
- Transferencia lingüística desde sueco hacia feroés, con capacidad potencial de retener competencias en sueco e inglés por el efecto regularizador del LoRA.
- Generación de texto de dominio general, limitada por el corpus FineWeb-2 (contenido web).
- No se documenta soporte de tool calling ni function calling en la información disponible.
- No se documenta soporte explícito de agentes o razonamiento multi-paso.
- No se documentan capacidades de visión, audio ni modo de pensamiento.
- Capacidad multilingüe limitada a los idiomas vistos en el entrenamiento (sueco, feroés e inglés del modelo base).

## Casos de uso

- Investigación en transferencia cross-lingual: permite comparar la semilla 2 con las semillas 1 y 3 de la misma configuración para medir la varianza del entrenamiento LoRA en lenguas de bajos recursos.
- Generación de texto sintético en feroés: útil para aumentar corpus de una lengua con escasa presencia digital, siempre con revisión humana por el riesgo de alucinación.
- Prototipado de asistentes conversacionales en feroés: el modelo puede mantener diálogos simples gracias a su base instruct, aunque sin garantías de calidad en producción.
- Experimentos de adaptación de bajo coste: el adaptador (0,4 GB) permite probar variantes lingüísticas sin reentrenar el modelo completo, ideal en entornos con una sola GPU.
- Evaluación de pipelines PEFT: sirve como caso de prueba para validar flujos de carga de adaptadores con `peft` y `transformers`, así como la composición de adaptadores en cadena.
- Análisis de olvido catastrófico: al entrenar cinco épocas en feroés tras una en sueco, es un caso útil para estudiar la degradación de la lengua intermedia y del inglés original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA en fp32 ocupa aproximadamente 0,4 GB; sumado al modelo base de 362M en fp16 (unos 0,7 GB) el conjunto cabe holgadamente en 2-4 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060 de 12 GB o superior permite ejecutar el modelo con contexto completo sin problemas. Para entrenamiento, el autor usó una A100 de 40 GB, pero el ajuste LoRA de este tamaño es viable en GPUs de 16-24 GB.
- Cabe en GPU consumer: sí, en GTX 1660 de 6 GB en adelante con cuantización del modelo base.
- Opciones de despliegue: `transformers` con `peft` para cargar el adaptador; el modelo base puede servirse con llama.cpp u Ollama si se convierte a GGUF, aunque el adaptador requeriría fusión previa con los pesos base.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo se espera un throughput alto en hardware consumer, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| smollm-360m-lora-fineweb-faroese-transfer-from-swedish-seed2 | ~362M (base) + adaptador LoRA | 2048 en entrenamiento | Apache 2.0 | Hugging Face (adaptador PEFT) |
| SmolLM2-360M-Instruct | ~362M | No disponible en esta ficha | Apache 2.0 | Hugging Face |
| SmolLM2-1.7B-Instruct | ~1.7B | No disponible en esta ficha | Apache 2.0 | Hugging Face |
| Modelos específicos para feroés | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada; la comparación se limita a tamaño, licencia y formato de distribución.

## Limitaciones y advertencias

- Modelo de investigación sin evaluación amplia: el autor declara explícitamente que no ha sido evaluado más allá de su uso interno, por lo que no debe desplegarse en producción sin validación propia.
- Riesgo elevado de alucinación: al ser un modelo de 362M ajustado sobre corpus web, la fidelidad factual es limitada, especialmente en feroés.
- Sesgos potenciales: el corpus FineWeb-2 refleja los sesgos del contenido web, con posible infrarrepresentación de variedades dialectales del feroés.
- Contexto corto: la longitud máxima de entrenamiento fue de 2048 tokens, lo que restringe tareas que requieran ventanas mayores.
- Dependencia en cadena: el adaptador requiere cargar primero el checkpoint `jekunz/smollm-360m-lora-fineweb-swedish`, no el modelo base original, lo que añade complejidad al despliegue.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías y la licencia del modelo base (SmolLM2) debe verificarse por separado.
- Sin datos de benchmarks ni métricas de calidad: imposible estimar de antemano el rendimiento en tareas concretas sin evaluación empírica.

## Enlaces

- Hugging Face: https://huggingface.co/jekunz/smollm-360m-lora-fineweb-faroese-transfer-from-swedish-seed2
- Modelo base intermedio: https://huggingface.co/jekunz/smollm-360m-lora-fineweb-swedish
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- SmolLM2 (modelo base original): no disponible en la información proporcionada
- Paper o blog del autor: no disponible en la información proporcionada
