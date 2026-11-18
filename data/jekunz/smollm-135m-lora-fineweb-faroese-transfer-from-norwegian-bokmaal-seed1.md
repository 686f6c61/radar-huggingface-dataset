# jekunz/smollm-135m-lora-fineweb-faroese-transfer-from-norwegian-bokmaal-seed1

## Resumen

Este repositorio contiene un adaptador LoRA entrenado sobre SmolLM2-135M-Instruct, un modelo de lenguaje de 135 millones de parámetros desarrollado originalmente por Hugging Face. El adaptador ha sido creado por el usuario jekunz como parte de un experimento de investigación sobre transferencia lingüística: primero se ajustó el modelo base con texto en noruego bokmål y después con texto en feroés, ambos extraídos del corpus FineWeb-2. El resultado es un adaptador PEFT que adapta el modelo al feroés (código ISO `fo`), un idioma de bajos recursos con apenas unos 70.000 hablantes.

El interés técnico del modelo reside en la estrategia de transferencia entre lenguas germánicas nórdicas: el noruego bokmål actúa como puente para mejorar el ajuste en feroés, un enfoque habitual cuando el corpus disponible en el idioma objetivo es limitado. El adaptador se publica con licencia Apache 2.0 y un tamaño de repositorio de 0,2 GB, lo que refleja que solo se distribuyen los pesos LoRA, no el modelo completo.

Se trata de un artefacto de investigación sin evaluación amplia publicada. No hay benchmarks, demos ni documentación adicional más allá de la model card. Su utilidad práctica es acotada: sirve como referencia para experimentos de adaptación multilingüe con modelos pequeños y como punto de partida para quien quiera reproducir o extender la técnica con otros idiomas de FineWeb-2.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM2-135M-Instruct) con adaptador LoRA |
| Parámetros totales | 135 millones (modelo base); el adaptador LoRA añade parámetros no especificados |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (longitud máxima usada en entrenamiento) |
| Tipos de cuantización | no disponible (el adaptador se distribuye en safetensors; el modelo base admite cuantizaciones estándar) |
| Idiomas soportados | feroés (`fo`); entrenado con transferencia desde noruego bokmål |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo base es SmolLM2-135M-Instruct, un transformer decoder-only de 135 millones de parámetros. Sobre él se aplica un adaptador LoRA con rango 256 y alpha 512, dirigido a los módulos `up_proj`, `down_proj`, `gate_proj` y `o_proj` de las capas de atención y MLP. El adaptador se entrena en dos fases secuenciales: primero una época sobre la porción noruega bokmål de FineWeb-2 y después cinco épocas sobre la porción feroesa del mismo corpus. El objetivo es aprovechar el noruego como lengua puente para mejorar la adaptación al feroés.

La configuración de entrenamiento incluye learning rate 8e-4, scheduler coseno, warmup ratio 0,05, batch size 8 con 32 pasos de acumulación de gradientes (batch efectivo 256), longitud máxima de 2048 tokens y semilla 1 (una de tres semillas previstas para esta configuración). Todo el entrenamiento se ejecutó en una única GPU A100 de 40 GB. No se documentan técnicas de alineación adicionales como RLHF o DPO, ni detalles sobre el volumen exacto de tokens de cada fase.

## Capacidades

- Generación de texto conversacional en feroés, heredada de la capacidad instruct del modelo base.
- Adaptación lingüística al feroés mediante transferencia desde noruego bokmål.
- Generación de texto genérico (el pipeline declarado es `text-generation`).
- Soporte de conversación multi-turno en la medida en que lo permita SmolLM2-135M-Instruct.
- No se documenta soporte de tool calling, function calling ni razonamiento agéntico multi-paso.
- No se documenta capacidad de visión, audio ni modo de razonamiento explícito (thinking mode).
- Capacidad multilingüe limitada al feroés y, de forma residual, al inglés y noruego del modelo base.

## Casos de uso

- Experimentación académica en transferencia entre lenguas nórdicas: el adaptador sirve para estudiar si el noruego bokmål mejora el ajuste en feroés con corpus pequeños, comparando las tres semillas previstas por el autor.
- Generación de texto sintético en feroés para aumento de datos: se puede usar para producir borradores que luego se filtren manualmente, dada la escasez de corpus en este idioma.
- Prototipado de asistentes conversacionales en feroés: con 135 millones de parámetros y contexto de 2048 tokens, es viable en hardware modesto para demos y pruebas de concepto.
- Reproducción de pipelines de ajuste LoRA sobre FineWeb-2: el repositorio documenta hiperparámetros completos (rango, alpha, módulos objetivo, learning rate, batch efectivo), lo que facilita replicar el experimento con otros idiomas del corpus.
- Evaluación comparativa de modelos pequeños en lenguas de bajos recursos: sirve como línea base para medir cuánto aporta la transferencia desde una lengua relacionada frente al ajuste directo.
- Investigación sobre olvido catastrófico: al entrenar cinco épocas en feroés tras una en noruego, el adaptador permite analizar cuánto noruego e inglés retiene el modelo base tras la segunda fase.
- Docencia y divulgación: por su tamaño reducido y su licencia permisiva, es adecuado para explicar en clase cómo funciona un adaptador LoRA y cómo se publica en Hugging Face.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que el modelo no ha sido evaluado de forma amplia.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 135 millones de parámetros ocupa aproximadamente 270 MB en fp16 y unos 135 MB en int8; el adaptador LoRA añade una cantidad no especificada, pero el repositorio completo pesa 0,2 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4060 o superior puede ejecutar el modelo con holgura. El entrenamiento se realizó en una A100 de 40 GB, pero la inferencia no requiere hardware de datacenter.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU con al menos 2 GB de VRAM, e incluso en CPU con latencia aceptable para texto corto.
- Opciones de despliegue: transformers con PEFT para cargar el adaptador, llama.cpp u Ollama si se fusiona el adaptador con el modelo base y se convierte a GGUF, y vLLM o TGI para servir el modelo fusionado.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Evaluación publicada |
|---|---|---|---|---|---|
| Este adaptador (SmolLM2-135M + LoRA feroés) | 135 M (base) + LoRA | 2048 | feroés | Apache 2.0 | No |
| SmolLM2-135M-Instruct (modelo base) | 135 M | 8192 (según model card original) | inglés principalmente | Apache 2.0 | Sí, en la model card original |
| SmolLM2-360M-Instruct | 360 M | 8192 (según model card original) | inglés principalmente | Apache 2.0 | Sí, en la model card original |
| Modelos específicos para feroés | no disponible | no disponible | feroés | no disponible | no disponible |

La comparación con alternativas específicas para feroés no está disponible en la información proporcionada. El modelo base SmolLM2-135M-Instruct y su variante de 360 millones son las referencias más directas por familia y licencia.

## Limitaciones y advertencias

- Modelo de investigación sin evaluación amplia: el autor advierte explícitamente de que no se ha evaluado más allá de su uso interno.
- Riesgo elevado de alucinación y de texto incoherente: con 135 millones de parámetros y cinco épocas sobre un corpus limitado, la calidad del feroés generado puede ser irregular.
- Posible olvido catastrófico: el entrenamiento prolongado en feroés tras una época en noruego puede degradar las capacidades originales en inglés y noruego del modelo base.
- Contexto efectivo de 2048 tokens, inferior a la ventana nativa del modelo base, lo que limita tareas que requieran contexto largo.
- Sesgos desconocidos: no se documenta ningún análisis de sesgos del corpus FineWeb-2 ni del adaptador resultante.
- Licencia Apache 2.0 permisiva para uso comercial, pero el autor no ofrece garantías sobre la calidad ni la idoneidad del adaptador en producción.
- Solo se distribuye el adaptador LoRA, no los pesos fusionados: es necesario descargar el modelo base y cargarlo con PEFT.
- Sin datos sobre el volumen de tokens de entrenamiento ni sobre la composición exacta del subconjunto de FineWeb-2 utilizado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jekunz/smollm-135m-lora-fineweb-faroese-transfer-from-norwegian-bokmaal-seed1
- Modelo base del adaptador (noruego bokmål): https://huggingface.co/jekunz/smollm-135m-lora-fineweb-norwegian-bokmaal
- Modelo base original SmolLM2-135M-Instruct: https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
