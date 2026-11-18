# jekunz/smollm-135m-lora-fineweb-faroese-transfer-from-multilingual-seed3

## Resumen

El modelo `jekunz/smollm-135m-lora-fineweb-faroese-transfer-from-multilingual-seed3` es un adaptador LoRA entrenado sobre `HuggingFaceTB/SmolLM2-135M-Instruct`, un transformer decoder-only de 135 millones de parametros desarrollado por Hugging Face. El autor, identificado como `jekunz`, lo ha publicado como parte de un experimento de investigacion sobre transferencia linguistica entre lenguas nordicas: primero se ajusta de forma conjunta sobre porciones en danes, islandes, noruego bokmal, noruego nynorsk y sueco de FineWeb-2, y despues sobre la porcion en feroes del mismo corpus.

El objetivo declarado es evaluar si el ajuste previo en lenguas nordicas relacionadas mejora la adaptacion al feroes, un idioma de bajos recursos con apenas unos 70.000 hablantes. El modelo se distribuye como adaptador PEFT (no como pesos completos), con licencia Apache 2.0 y un unico idioma declarado en la model card: feroes (`fo`). El repositorio ocupa 0,2 GB y no registra descargas ni interacciones en el momento de la consulta.

Se trata de un artefacto de investigacion temprana, sin evaluacion amplia publicada por el autor, por lo que su interes es principalmente metodologico: documenta una receta concreta de LoRA (rango 256, alpha 512) y una estrategia de transferencia multilingue reproducible con tres semillas distintas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM2-135M-Instruct) con adaptador LoRA |
| Parametros totales | 135 millones (modelo base); adaptador LoRA de rango 256 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (longitud maxima usada en entrenamiento) |
| Tipos de cuantizacion | no disponible (el adaptador se publica en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | feroes (`fo`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo base SmolLM2-135M-Instruct es un transformer decoder-only denso de 135 millones de parametros. Sobre el se aplica un adaptador LoRA con rango 256 y alpha 512, dirigido a los modulos `up_proj`, `down_proj`, `gate_proj` y `o_proj` de las capas de atencion y MLP. El entrenamiento se realiza en dos fases: una primera epoca sobre los subconjuntos en danes, islandes, noruego bokmal, noruego nynorsk y sueco de FineWeb-2, seguida de cinco epocas sobre el subconjunto en feroes. La tasa de aprendizaje es 8e-4 con scheduler coseno, warmup del 5%, batch size 8 y acumulacion de gradientes de 32 pasos (batch efectivo de 256), todo ello en una unica GPU A100 de 40 GB. La semilla es la 3 de tres ejecuciones con la misma configuracion.

La innovacion principal no reside en la arquitectura sino en la estrategia de transferencia: el ajuste previo en lenguas nordicas geneticamente cercanas actua como inicializacion para el feroes, un enfoque habitual en escenarios de bajos recursos. No se documenta uso de RLHF, DPO ni decodificacion especulativa.

## Capacidades

- Generacion de texto conversacional en feroes, heredada de la naturaleza instruct del modelo base.
- Transferencia linguistica desde lenguas nordicas continentales hacia el feroes.
- Capacidad multilingue residual del modelo base SmolLM2, aunque el adaptador solo declara feroes.
- Soporte de conversacion multi-turno a traves del formato de chat del modelo base.
- No se documenta soporte explicito de tool calling, function calling ni razonamiento multi-paso.
- No se documentan capacidades de vision, audio ni modo de razonamiento extendido.

## Casos de uso

- Generacion de texto en feroes para prototipos: el adaptador permite producir texto en un idioma con escasisimos recursos linguisticos, util para experimentar con traduccion o redaccion asistida antes de invertir en modelos mayores.
- Investigacion sobre transferencia entre lenguas nordicas: sirve como punto de comparacion reproducible (tres semillas) para estudiar si el preajuste en danes, islandes, noruego y sueco mejora el feroes frente a un ajuste directo.
- Creacion de corpus sinteticos en feroes: con 135 millones de parametros y contexto de 2048 tokens, puede generar grandes volumenes de texto de forma economica para aumentar datos de entrenamiento de modelos mayores.
- Experimentos de destilacion y evaluacion de bajos recursos: su tamano reducido permite ejecutar barridos de hiperparametros o comparaciones de semillas en una sola GPU consumer.
- Educacion y divulgacion: ilustra de forma practica como se compone un adaptador LoRA sobre un modelo instruct pequeno para un idioma minoritario.
- Pruebas de integracion de PEFT: util para validar pipelines de carga de adaptadores con `peft` y `transformers` antes de escalar a modelos de mayor tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que el modelo "no ha sido evaluado de forma amplia todavia".

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp16 para el modelo base (135M parametros, ~270 MB de pesos) mas el adaptador LoRA; en cuantizacion de 8 bits o 4 bits cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el entrenamiento se realizo en una A100 de 40 GB, pero la inferencia es viable en RTX 3060, RTX 4060, RTX 4090 o incluso CPU.
- Cabe en GPU consumer: si, en practicamente todas las GPU dedicadas modernas y en iGPU con suficiente memoria compartida.
- Opciones de despliegue: `transformers` con `peft` (carga del adaptador), llama.cpp/Ollama tras fusionar el adaptador con el modelo base y convertir a GGUF, y vLLM/TGI para servir el modelo fusionado.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo se espera una latencia muy baja en GPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jekunz/smollm-135m-lora-fineweb-faroese-transfer-from-multilingual-seed3 | 135M (base) + LoRA r256 | 2048 | fo | Apache 2.0 | Hugging Face (adaptador PEFT) |
| HuggingFaceTB/SmolLM2-135M-Instruct | 135M | 8192 (modelo base) | multilingue | Apache 2.0 | Hugging Face |
| HuggingFaceTB/SmolLM2-360M-Instruct | 360M | 8192 (modelo base) | multilingue | Apache 2.0 | Hugging Face |

La comparacion con el modelo base es la mas directa: el adaptador anade especializacion en feroes a costa de un contexto de entrenamiento menor (2048 frente a los 8192 del base) y de perder cobertura multilingue amplia. Frente a SmolLM2-360M-Instruct, este adaptador ofrece menor capacidad bruta pero especializacion idiomatica. No se dispone de datos de rendimiento comparativo entre estas opciones.

## Limitaciones y advertencias

- Modelo de investigacion sin evaluacion amplia: el propio autor advierte que no ha sido evaluado de forma extensa, por lo que su calidad en produccion es incierta.
- Riesgo de alucinacion: al ser un modelo de 135M parametros, la coherencia y la factualidad son limitadas, especialmente en contextos largos.
- Cobertura idiomatica restringida: solo declara feroes; el uso en otros idiomas puede degradar la calidad respecto al modelo base.
- Contexto limitado a 2048 tokens en entrenamiento, inferior a la ventana nativa del modelo base.
- Sesgos: no documentados por el autor; se heredan los del corpus FineWeb-2 y del modelo base.
- Licencia Apache 2.0 permite uso comercial, pero al ser un adaptador sobre SmolLM2 conviene verificar las condiciones del modelo base.
- Sin descargas ni validacion comunitaria: no hay evidencia externa de su comportamiento en tareas reales.
- El repositorio contiene solo el adaptador; es necesario cargar el modelo base para su uso.

## Enlaces

- Hugging Face: https://huggingface.co/jekunz/smollm-135m-lora-fineweb-faroese-transfer-from-multilingual-seed3
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
- Dataset: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
