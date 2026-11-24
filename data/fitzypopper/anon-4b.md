# fitzypopper/Anon-4B

## Resumen

Anon-4B es un adaptador LoRA (PEFT) publicado por el usuario fitzypopper sobre el modelo base Qwen/Qwen3-4B-Base. No se trata de un modelo entrenado desde cero, sino de un ajuste fino de bajo rango orientado a reproducir el registro lingüístico de 4chan, en particular el formato greentext (líneas que comienzan por ">"), según indican las etiquetas de la model card. El autor lo marca como `not-for-all-audiences`, lo que sugiere contenido potencialmente sensible.

El interés técnico del artefacto es limitado pero concreto: demuestra cómo un LoRA pequeño puede especializar un transformer denso de 4B parámetros en una jerga y estructura de discurso muy particulares sin reentrenar el modelo completo. Al estar construido sobre Qwen3-4B-Base, hereda la arquitectura y la ventana de contexto del modelo base, aunque la model card no documenta ni los hiperparámetros del entrenamiento ni el dataset utilizado.

La relevancia es principalmente de nicho: sirve como ejemplo de adaptación estilística y como caso de estudio de los riesgos de publicar adaptadores con fines de entretenimiento sobre foros anónimos, donde la moderación y la evaluación de sesgos son prácticamente inexistentes. No hay datos publicados de benchmarks, descargas ni validación por parte de la comunidad en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer denso Qwen3-4B-Base |
| Parametros totales | 4B en el modelo base; rango y dimension del adaptador no disponibles |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (heredada del base Qwen3-4B-Base, sin confirmar) |
| Tipos de cuantizacion | no disponible (el adaptador es PEFT; la cuantizacion depende del base y del runtime) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | adaptador PEFT/LoRA (libreria `peft`); safetensors presumiblemente, no confirmado |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA acoplado a Qwen/Qwen3-4B-Base, un transformer decoder-only denso de 4.000 millones de parámetros. La model card no especifica el rango (r), el alpha, las capas objetivo ni el número de pasos de entrenamiento. Tampoco documenta el volumen de tokens, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO; las etiquetas `4chan` y `greentext` apuntan a un corpus de hilos de dicho foro, pero no hay cifras.

No se describe ninguna innovación arquitectónica propia: el adaptador no modifica el mecanismo de atención ni la tokenización del base, y su comportamiento depende enteramente de Qwen3-4B-Base. La única particularidad es el objetivo estilístico: forzar el formato greentext y el registro coloquial y a menudo soez del foro. Cualquier detalle sobre la función de pérdida, la duración del entrenamiento o el hardware empleado debe considerarse no disponible.

## Capacidades

- Generación de texto en inglés con estilo greentext (líneas prefijadas por ">").
- Reproducción de jerga y tropos propios de 4chan, incluyendo respuestas encadenadas y formato de hilo.
- Generación de texto general heredada del base Qwen3-4B-Base, aunque degradada por el ajuste estilístico.
- Soporte de tool calling y function calling: no documentado; no debe asumirse.
- Razonamiento multi-paso y uso como agente: no documentado ni evaluado.
- Capacidades multilingües: limitadas al inglés según la model card.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Generación de diálogo sintético con estética de foro: útil para construir datasets de prueba de moderación de contenido y clasificadores de toxicidad que necesiten ejemplos realistas de greentext.
- Simulación de hilos para investigación en sociolingüística digital: permite generar respuestas con el registro de 4chan para estudiar patrones de argumentación y memes sin exponer a usuarios reales.
- Pruebas de robustez de filtros: alimentar pipelines de moderación con salidas del adaptador para medir falsos negativos ante jerga ofensiva.
- Prototipado de personajes o bots de rol con estética concreta en entornos controlados y cerrados, nunca en producto público sin revisión.
- Evaluación comparativa de LoRA: servir como caso base para medir cuánto degrada un ajuste estilístico estrecho las capacidades generales del modelo subyacente.
- Docencia sobre PEFT: ejemplo mínimo de cómo un adaptador de bajo rango altera el estilo de un transformer de 4B sin reentrenarlo, útil en talleres de fine-tuning.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA es de tamaño reducido (decenas o centenas de MB, no confirmado); el coste real lo determina el modelo base de 4B parámetros.
- VRAM estimada para el base en FP16: en torno a 8-9 GB solo para pesos, más overhead de activaciones y KV cache.
- VRAM estimada en cuantización de 4 bits (GGUF o bitsandbytes): aproximadamente 3-4 GB, apta para GPUs de consumo.
- GPU recomendadas: RTX 3060 12 GB, RTX 4070, RTX 4090 para cuantizado; A100 o H100 solo si se sirve en FP16 con concurrencia alta.
- Cabe en GPU de consumo con cuantización de 4 u 8 bits; en FP16 requiere al menos 12 GB para margen.
- Despliegue: `peft` + Transformers, vLLM (con soporte de adaptadores LoRA), TGI (etiqueta `text-generation-inference` presente), llama.cpp u Ollama tras fusionar y convertir el adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Anon-4B (fitzypopper) | 4B (base) | no disponible | LoRA sobre Qwen3-4B-Base | apache-2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3-4B-Base | 4B | no disponible en esta ficha | Transformer denso | apache-2.0 | Hugging Face, ampliamente usado |
| Adaptadores LoRA estilísticos genéricos | variable | depende del base | LoRA/PEFT | variable | Hugging Face |

No se dispone de datos de rendimiento del adaptador que permitan una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Contenido potencialmente ofensivo: el ajuste está orientado a un foro anónimo y la etiqueta `not-for-all-audiences` advierte de lenguaje soez, toxicidad y temas sensibles.
- Riesgo alto de alucinación y de reproducir desinformación o tropos conspirativos presentes en el corpus de origen.
- Sesgos desconocidos y no evaluados: no hay auditoría de sesgos de género, raza o ideología.
- Degradación esperada de capacidades generales (razonamiento, código, matemáticas) respecto al base, no medida.
- Idiomas: solo inglés; el rendimiento en castellano no está soportado.
- Licencia apache-2.0 en el adaptador, pero el uso comercial del contenido generado exige revisión legal por la naturaleza del corpus.
- Sin descargas ni validación comunitaria: no hay evidencia de calidad ni de estabilidad en producción.
- No debe desplegarse en aplicaciones orientadas al público sin filtros de moderación adicionales.

## Enlaces

- Hugging Face: https://huggingface.co/fitzypopper/Anon-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Base
- Librería PEFT: https://github.com/huggingface/peft
- Librería Transformers: https://github.com/huggingface/transformers
