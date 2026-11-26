# OMCHOKSI108/qwen3-4b-custom

## Resumen

`OMCHOKSI108/qwen3-4b-custom` es un ajuste fino (fine-tuning) del modelo Qwen3-4B-Instruct-2507, en su variante cuantizada a 4 bits publicada por Unsloth. Lo desarrolla el usuario OMCHOKSI108 y se distribuye bajo licencia Apache 2.0. El modelo resuelve la necesidad de disponer de una variante de Qwen3-4B adaptada a un caso de uso concreto mediante entrenamiento supervisado, manteniendo la base instructiva original de Qwen3.

Arquitectonicamente hereda la estructura de Qwen3-4B: un transformer denso (no MoE) de aproximadamente 4.022 millones de parametros (4,02 B) con soporte nativo de contexto largo y capacidades conversacionales. El ajuste se realizo con Unsloth y la libreria TRL de Hugging Face, lo que permite un entrenamiento aproximadamente 2 veces mas rapido que con el flujo estandar.

La relevancia de esta ficha es limitada pero practica: se trata de un modelo derivado de un base muy conocido, con un repositorio de 8,1 GB en safetensors y sin descargas ni valoraciones publicas en el momento de la consulta. Es util como ejemplo de pipeline de fine-tuning ligero sobre Qwen3-4B y como punto de partida para quien quiera replicar el flujo con Unsloth.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3), derivado de Qwen3-4B-Instruct-2507 |
| Parametros totales | 4.022.468.096 (4,02 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen3-4B-Instruct-2507) |
| Tipos de cuantizacion | base entrenada sobre bnb-4bit; pesos publicados en safetensors (cuantizaciones GGUF/AWQ no disponibles) |
| Idiomas soportados | en (segun model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer denso de la familia Qwen3, con 4,02 B de parametros, inicializado desde `unsloth/Qwen3-4B-Instruct-2507-unsloth-bnb-4bit`. Es decir, el punto de partida es una version del instructivo Qwen3-4B-2507 ya cuantizada a 4 bits en formato bitsandbytes (bnb-4bit) y preparada por Unsloth para fine-tuning eficiente en memoria.

El entrenamiento se realizo con Unsloth y TRL, lo que segun la model card permite un entrenamiento aproximadamente 2 veces mas rapido. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF o DPO posteriores al ajuste supervisado. Tampoco se detalla si se aplicaron tecnicas como decodificacion especulativa o atencion lineal; al heredar la arquitectura Qwen3, se asume el esquema de atencion estandar de esa familia, pero no se confirma en la documentacion del autor.

## Capacidades

- Generacion de texto conversacional en ingles, heredada de Qwen3-4B-Instruct-2507.
- Razonamiento basico y respuesta a instrucciones, propio de la variante Instruct.
- Generacion de codigo y matematicas a nivel de modelo pequeno (4 B), segun las capacidades del base.
- Soporte de tool calling / function calling: no confirmado explicitamente en la model card de este ajuste; debe validarse contra el base Qwen3-4B-Instruct-2507.
- Soporte de agentes y razonamiento multi-paso: no documentado en este ajuste.
- Capacidades multilingues: la model card declara unicamente `en`; no se confirman otros idiomas.
- Capacidades especiales (thinking mode, vision, audio): no disponibles en la informacion proporcionada.

## Casos de uso

- Prototipado de asistentes conversacionales en ingles: el modelo puede gestionar dialogos multi-turno gracias a la base instructiva de Qwen3-4B, con un coste de inferencia bajo por sus 4 B de parametros.
- Fine-tuning especifico de dominio: sirve como ejemplo reproducible de como adaptar Qwen3-4B con Unsloth y TRL a un dataset propio en pocas horas de GPU.
- Despliegue en entornos con VRAM limitada: al ser un modelo de 4 B, cabe en GPUs de consumo con cuantizacion adicional (GGUF/AWQ, aunque no se publican en este repo).
- Generacion de codigo asistida en editor: adecuado para autocompletado y explicaciones de fragmentos, siempre que se valide su calidad frente al base sin ajustar.
- Clasificacion y extraccion de informacion en texto: util para tareas de NLP ligero en ingles donde no se requiere un modelo de mayor tamano.
- Base para experimentos academicos de ajuste eficiente: permite comparar el efecto del fine-tuning frente al Qwen3-4B-Instruct-2507 original con un coste computacional reducido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 8-9 GB solo para pesos, mas overhead de activaciones y cache KV.
- VRAM estimada en cuantizacion 4 bits (si se genera GGUF/AWQ a partir de los pesos): aproximadamente 2,5-3,5 GB para pesos.
- GPU recomendadas: NVIDIA RTX 3090/4090 (24 GB) o superiores para FP16; A100/H100 para despliegues de mayor concurrencia.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090 con cuantizacion adecuada.
- Opciones de despliegue: transformers, text-generation-inference (TGI), vLLM; llama.cpp/Ollama requeririan conversion previa a GGUF, no incluida en el repo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| OMCHOKSI108/qwen3-4b-custom | 4,02 B | no disponible | apache-2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3-4B-Instruct-2507 (base) | ~4 B | no disponible en esta ficha | apache-2.0 | Hugging Face, ampliamente usado |
| unsloth/Qwen3-4B-Instruct-2507-unsloth-bnb-4bit (base del ajuste) | ~4 B | no disponible | apache-2.0 | Hugging Face |
| Llama 3.2 3B Instruct | ~3 B | 128 K (segun documentacion de Meta) | Llama 3.2 Community License | Hugging Face |

La comparativa se limita a parametros y licencia porque no hay benchmarks publicados para este ajuste; cualquier comparacion de rendimiento seria especulativa.

## Limitaciones y advertencias

- Modelo derivado de un base cuantizado a 4 bits (bnb-4bit): puede arrastrar perdida de calidad respecto al Qwen3-4B-Instruct-2507 en precision completa.
- Solo se declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- Riesgo de alucinacion propio de modelos de 4 B, especialmente en tareas de razonamiento complejo o datos factuales.
- No se documentan sesgos conocidos ni evaluaciones de seguridad en la model card.
- Sin descargas ni validacion de la comunidad: el modelo no ha sido contrastado publicamente, por lo que su calidad real es incierta.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del base Qwen3 y de la variante Unsloth.
- No se publican cuantizaciones GGUF ni AWQ en el repositorio, lo que limita el despliegue en entornos de bajo consumo sin conversion manual.
- Para produccion se recomienda validar contra el Qwen3-4B-Instruct-2507 original y realizar evaluaciones propias en el dominio objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OMCHOKSI108/qwen3-4b-custom
- Modelo base (Unsloth, bnb-4bit): https://huggingface.co/unsloth/Qwen3-4B-Instruct-2507-unsloth-bnb-4bit
- Repositorio Unsloth: https://github.com/unslothai/unsloth
- Libreria TRL de Hugging Face: https://github.com/huggingface/trl
