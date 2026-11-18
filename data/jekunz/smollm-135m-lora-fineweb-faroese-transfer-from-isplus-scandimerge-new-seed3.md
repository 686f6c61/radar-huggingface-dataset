# jekunz/smollm-135m-lora-fineweb-faroese-transfer-from-isplus-scandimerge-new-seed3

## Resumen

Este repositorio contiene un adaptador LoRA (PEFT) sobre el modelo base `jekunz/new_scandimerge_isplus_135`, un SmolLM2-135M-Instruct ajustado para generacion de texto en feroes (`fo`). El autor, `jekunz`, lo presenta como un experimento de investigacion orientado a la transferencia entre lenguas escandinavas: primero se entrena sobre porciones de danes, islandes, noruego bokmal, noruego nynorsk y sueco mediante un merge TIES con mayor peso en islandes, y despues se ajusta sobre la porcion feroesa de FineWeb-2.

El modelo resuelve un problema concreto: la escasez de recursos linguisticos para el feroes, una lengua de bajos recursos con pocos corpus de calidad y practicamente sin modelos generativos especificos. La estrategia es aprovechar el parentesco linguistico con el islandes y el resto de lenguas nordicas para transferir capacidad generativa hacia el feroes con un coste computacional minimo (un unico A100 de 40 GB).

La relevancia actual es doble: por un lado, demuestra un flujo de trabajo reproducible de adaptacion de un modelo pequeno (135M parametros) a una lengua de bajos recursos; por otro, su tamano lo hace desplegable en hardware muy modesto. El autor advierte explicitamente que el modelo no ha sido evaluado de forma amplia y que su proposito es la investigacion. El repositorio (0,2 GB) contiene unicamente los pesos del adaptador, no el modelo base completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM2-135M-Instruct como base) con adaptador LoRA |
| Parametros totales | 135M en el modelo base; el adaptador LoRA se suma sobre este (parametros exactos del adaptador no disponibles) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (longitud maxima usada en entrenamiento) |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene pesos safetensors del adaptador; la cuantizacion depende del modelo base y del runtime) |
| Idiomas soportados | Feroes (`fo`); entrenado con transferencia desde danes, islandes, noruego bokmal, noruego nynorsk y sueco |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Rank LoRA | 256 |
| Alpha LoRA | 512 |
| Modulos objetivo LoRA | `up_proj`, `down_proj`, `gate_proj`, `o_proj` |
| Libreria | PEFT |
| Tamano del repositorio | 0,2 GB |
| Modelo base | `jekunz/new_scandimerge_isplus_135` |
| Dataset de entrenamiento | `HuggingFaceFW/fineweb-2` |

## Arquitectura y entrenamiento

El modelo base es SmolLM2-135M-Instruct, un transformer decoder-only de 135 millones de parametros. Sobre el se aplica un ajuste LoRA con rank 256, alpha 512 y modulos objetivo restringidos a las proyecciones MLP (`up_proj`, `down_proj`, `gate_proj`, `o_proj`), sin tocar las proyecciones de atencion. El modelo base a su vez procede de un merge TIES de modelos entrenados sobre las porciones danesa, islandesa, noruega (bokmal y nynorsk) y sueca de FineWeb-2, con mayor peso asignado al islandes, lo que actua como puente linguistico hacia el feroes.

El entrenamiento se realizo en dos fases: una epoca por lengua de origen y cinco epocas sobre la porcion feroesa de FineWeb-2. Los hiperparametros documentados son learning rate 8e-4, scheduler coseno, warmup ratio 0,05, batch size 8 con 32 pasos de acumulacion de gradientes (batch efectivo 256), longitud maxima de contexto de 2048 tokens, semilla 3 (una de tres semillas de entrenamiento para esta configuracion) y un unico A100 de 40 GB. No se documenta el numero total de tokens procesados ni si hubo fases de RLHF o DPO; la informacion disponible sugiere un ajuste supervisado puro sobre texto de FineWeb-2.

## Capacidades

- Generacion de texto en feroes, tarea para la que fue ajustado.
- Conversacion multi-turno heredada del formato instruct del modelo base SmolLM2-135M-Instruct.
- Transferencia linguistica desde islandes y otras lenguas nordicas, gracias al merge TIES previo.
- Generacion condicionada por contexto de hasta 2048 tokens.
- Capacidades de razonamiento, codigo y matematicas: no evaluadas ni documentadas para este adaptador; las heredadas del modelo base de 135M son limitadas.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: el autor declara solo `fo`; no hay evidencia de calidad en otras lenguas.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Generacion de texto sintetico en feroes para aumento de datos: el adaptador puede producir corpus feroes adicionales que alimenten entrenamientos posteriores o sistemas de traduccion, aprovechando que fue ajustado sobre la porcion feroesa de FineWeb-2.
- Prototipado de asistentes conversacionales en feroes: al heredar el formato instruct de SmolLM2, permite construir demos de chat en esta lengua con un coste de inferencia minimo y desplegarlo en una sola GPU consumer.
- Investigacion sobre transferencia entre lenguas nordicas: sirve como punto de partida reproducible (semilla 3 de tres) para estudiar como el merge TIES con peso islandes afecta al rendimiento en feroes frente a entrenar desde cero.
- Normalizacion y reescritura de texto feroes: tareas de limpieza, parafraseo o reformateo de documentos en esta lengua con contexto de hasta 2048 tokens.
- Educacion y divulgacion linguistica: generacion de ejercicios, ejemplos de frases o material didactico en feroes para comunidades con pocos recursos digitales.
- Baseline para evaluacion de lenguas de bajos recursos: al ser un modelo pequeno y con licencia Apache 2.0, es util como referencia inferior en benchmarks de feroes frente a modelos mayores.
- Despliegue en entornos con recursos muy limitados: con 135M parametros y un adaptador de 0,2 GB, puede ejecutarse en CPU o en GPUs de gama baja para tareas de generacion offline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que el modelo "no ha sido evaluado mas ampliamente todavia".

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 135M parametros en fp16 ocupa aproximadamente 0,27 GB; en int8 unos 0,14 GB; en int4 unos 0,07 GB. El adaptador LoRA anade un overhead reducido (repositorio de 0,2 GB). En la practica, menos de 2 GB de VRAM en la mayoria de configuraciones.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; el entrenamiento documentado uso una A100 de 40 GB, pero la inferencia cabe en RTX 3060, RTX 4060, RTX 4090, T4 o incluso GPUs integradas.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna e incluso en CPU.
- Opciones de despliegue: transformers con PEFT (carga del adaptador sobre el modelo base), llama.cpp/Ollama si se fusiona el adaptador con el modelo base y se convierte a GGUF, vLLM y TGI para servir el modelo fusionado.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo, se espera un throughput alto en GPU y viable en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (jekunz, SmolLM2-135M + LoRA feroes) | 135M (base) + LoRA | 2048 | Feroes | Apache 2.0 | Hugging Face, 0 descargas |
| SmolLM2-135M-Instruct (HuggingFaceTB) | 135M | 8192 | Multilingue (principalmente ingles) | Apache 2.0 | Hugging Face, ampliamente usado |
| Modelos nordicos de referencia (p. ej. variantes de NorBERT/GPT-Sw) | no disponible | no disponible | Lenguas nordicas | variable | Hugging Face |
| Modelos especificos de feroes | no disponible | no disponible | Feroes | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada. La comparativa se limita a parametros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- El autor declara que el modelo no ha sido evaluado de forma amplia; no hay garantias de calidad en generacion, coherencia ni fidelidad factual.
- Riesgo de alucinacion elevado por el tamano reducido del modelo base (135M parametros) y por el ajuste sobre texto web sin filtrado adicional documentado.
- Entrenado unicamente sobre la porcion feroesa de FineWeb-2 y con transferencia desde lenguas nordicas; el vocabulario y la cobertura pueden ser insuficientes para dominios especializados (legal, medico, tecnico).
- Contexto limitado a 2048 tokens, inferior al contexto nativo de SmolLM2-135M-Instruct (8192 tokens), lo que restringe tareas de contexto largo.
- Sesgos potenciales heredados de FineWeb-2 y del modelo base, no documentados ni mitigados.
- Licencia Apache 2.0 permite uso comercial, pero el autor lo presenta como modelo de investigacion sin evaluacion; no se recomienda su uso en produccion sin validacion previa.
- Solo se publica el adaptador LoRA; es necesario descargar y cargar el modelo base `jekunz/new_scandimerge_isplus_135` para usarlo.
- El repositorio tiene 0 descargas y 0 likes, lo que indica ausencia de validacion por parte de la comunidad.
- No hay informacion sobre el numero de tokens de entrenamiento ni sobre la composicion exacta del dataset feroes utilizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jekunz/smollm-135m-lora-fineweb-faroese-transfer-from-isplus-scandimerge-new-seed3
- Modelo base: https://huggingface.co/jekunz/new_scandimerge_isplus_135
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- SmolLM2-135M-Instruct (modelo original de HuggingFaceTB): https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
- Libreria PEFT: https://huggingface.co/docs/peft
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion disponible.
