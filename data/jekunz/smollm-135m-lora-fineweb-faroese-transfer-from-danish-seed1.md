# jekunz/smollm-135m-lora-fineweb-faroese-transfer-from-danish-seed1

## Resumen

SmolLM-135M-LoRA-fineweb-faroese-transfer-from-danish-seed1 es un adaptador LoRA (PEFT) entrenado sobre el modelo base jekunz/smollm-135m-lora-fineweb-danish, que a su vez deriva de SmolLM2-135M-Instruct. Lo desarrolla el usuario jekunz como parte de una investigacion personal sobre adaptacion de modelos pequenos a idiomas de bajos recursos, en este caso el feroes (fo), aplicando una estrategia de transferencia desde el danes.

El modelo resuelve un problema concreto: la escasez de modelos generativos ligeros para feroes. En lugar de entrenar desde cero, se aprovecha el parentesco linguistico y la disponibilidad de datos en danes para inicializar el adaptador, y despues se especializa con cinco epocas sobre la porcion feroesa de FineWeb-2. El resultado es un adaptador de bajo rango que modifica solo las proyecciones del bloque MLP del transformer.

Es relevante por su caracter experimental y por su tamano: un adaptador LoRA sobre un modelo de 135 millones de parametros puede ejecutarse en hardware muy modesto, lo que lo hace util como banco de pruebas para investigacion en adaptacion cross-lingue. El autor advierte explicitamente que no ha sido evaluado de forma amplia y que su uso previsto es la investigacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM2-135M-Instruct) con adaptador LoRA |
| Parametros totales | 135M en el modelo base; parametros del adaptador LoRA no disponibles |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 tokens (longitud maxima usada en entrenamiento) |
| Tipos de cuantizacion | no disponible (el repo contiene pesos safetensors del adaptador) |
| Idiomas soportados | feroes (fo) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo subyacente es SmolLM2-135M-Instruct, un transformer decoder-only de 135 millones de parametros. Sobre el se aplica un adaptador LoRA con rango 256 y alpha 512, dirigido a los modulos `up_proj`, `down_proj`, `gate_proj` y `o_proj`, es decir, las proyecciones del bloque feed-forward y la proyeccion de salida de la atencion. Esta configuracion de rango es relativamente alta para un modelo de este tamano, lo que sugiere que se busca una capacidad de adaptacion significativa.

El entrenamiento sigue una estrategia de transferencia en dos fases: primero una epoca sobre la porcion danesa de FineWeb-2 (heredada del modelo base jekunz/smollm-135m-lora-fineweb-danish) y despues cinco epocas sobre la porcion feroesa del mismo corpus. Se uso tasa de aprendizaje 8e-4 con scheduler coseno, warmup ratio 0,05, batch size 8 con acumulacion de gradientes de 32 pasos (batch efectivo 256), longitud maxima de 2048 tokens y una unica GPU A100 de 40 GB. Esta semilla (seed 1) es una de tres ejecuciones de la misma configuracion. No se documentan tecnicas de RLHF, DPO ni innovaciones arquitectonicas adicionales.

## Capacidades

- Generacion de texto conversacional en feroes, heredada de la naturaleza instruct del modelo base.
- Adaptacion linguistica al feroes mediante transferencia desde el danes.
- Generacion de texto general; no se documentan capacidades especificas de razonamiento, codigo o matematicas evaluadas para este adaptador.
- Soporte de tool calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al feroes segun la model card; el modelo base conserva su conocimiento previo pero no se ha evaluado su retencion.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Investigacion en adaptacion cross-lingue: sirve como punto de partida para estudiar como la transferencia desde una lengua con mas recursos (danes) afecta al rendimiento en una lengua de bajos recursos (feroes), comparando con las otras dos semillas de la misma configuracion.
- Generacion de texto experimental en feroes: util para prototipar aplicaciones de escritura asistida o resumen en feroes en entornos de investigacion donde se acepta un modelo no validado.
- Banco de pruebas de LoRA de alto rango: permite analizar el efecto del rango 256 y alpha 512 sobre un modelo de 135M, un punto de comparacion util para quienes disenan adaptadores en modelos pequenos.
- Despliegue en hardware muy limitado: al tratarse de un adaptador sobre un modelo de 135M, puede ejecutarse en CPU o GPUs de gama baja para demostraciones y experimentos docentes.
- Estudio de olvido catastrofico: la secuencia danes-feroes permite medir cuanto conocimiento del danes se retiene tras el ajuste en feroes.
- Generacion de datos sinteticos en feroes para aumentar corpus de entrenamiento, siempre con revision humana dada la falta de evaluacion del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que el modelo no ha sido evaluado de forma amplia.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma especifica; el modelo base de 135M en precision completa ocupa del orden de 0,5 GB, y el adaptador LoRA anade una fraccion adicional segun el rango.
- GPU recomendadas: el entrenamiento se realizo en una A100 de 40 GB, pero la inferencia de un modelo de este tamano es viable en GPUs consumer.
- Cabe en GPU consumer: si, previsiblemente en cualquier GPU con al menos unos pocos GB de VRAM; no se dispone de mediciones concretas.
- Opciones de despliegue: al ser un adaptador PEFT, requiere cargar el modelo base con la libreria `peft`; el modelo base puede servirse con vLLM, TGI o llama.cpp tras fusionar el adaptador, aunque no se documenta compatibilidad verificada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| jekunz/smollm-135m-lora-fineweb-faroese-transfer-from-danish-seed1 | 135M + LoRA | 2048 | apache-2.0 | Adaptador LoRA para feroes con transferencia desde danes |
| jekunz/smollm-135m-lora-fineweb-danish | 135M + LoRA | no disponible | no disponible | Adaptador LoRA para danes, modelo base de este |
| SmolLM2-135M-Instruct | 135M | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Modelo instruct original de Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo no evaluado: el autor indica que no ha sido evaluado de forma amplia, por lo que no hay garantias de calidad en tareas reales.
- Riesgo de alucinacion: inherente a los modelos generativos de este tamano y agravado por la falta de evaluacion.
- Cobertura linguistica limitada: solo se declara feroes; el comportamiento en otros idiomas no esta documentado.
- Contexto corto: la longitud maxima usada en entrenamiento es de 2048 tokens, lo que limita conversaciones y documentos largos.
- Restricciones de licencia: la licencia apache-2.0 permite uso comercial, pero el autor no ha validado el modelo para produccion.
- Dependencia del modelo base: el adaptador no funciona de forma autonoma; requiere cargar jekunz/smollm-135m-lora-fineweb-danish y, en ultima instancia, SmolLM2-135M-Instruct.
- Sesgos: no documentados; los corpus FineWeb-2 pueden arrastrar sesgos de sus fuentes web.
- Caracter experimental: es una de tres semillas de una configuracion de investigacion, sin garantia de reproducibilidad mas alla de los hiperparametros publicados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jekunz/smollm-135m-lora-fineweb-faroese-transfer-from-danish-seed1
- Modelo base (adaptador danes): https://huggingface.co/jekunz/smollm-135m-lora-fineweb-danish
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- SmolLM2-135M-Instruct (modelo original): https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
- Libreria PEFT: https://github.com/huggingface/peft
