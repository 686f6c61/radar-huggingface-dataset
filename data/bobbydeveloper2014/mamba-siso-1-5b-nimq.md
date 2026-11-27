# bobbydeveloper2014/mamba-siso-1.5b-nimq

## Resumen

Mamba-3 SISO 1.5B es un checkpoint cuantizado del modelo Mamba-3 en su variante SISO (single-input single-output), empaquetado en el formato propietario NIMQ del framework Nimformers. Lo publica el usuario bobbydeveloper2014 en Hugging Face y va acompanado de un fine-tune LoRA/Linear++ denominado lora-g1.bin. El modelo base emplea pesos en FP4-KM, mientras que el checkpoint LoRA usa el formato NIMBIN4. El repositorio ocupa 2.0 GB e incluye el fichero de pesos, el adaptador LoRA, la configuracion y el tokenizer.

La relevancia de esta publicacion es limitada pero concreta: se trata de un artefacto de inferencia pensado para ejecutarse exclusivamente dentro del Nimformers Framework, no de un modelo listo para usar con las herramientas habituales del ecosistema (transformers, llama.cpp, vLLM). El autor no documenta el modelo upstream del que deriva, ni la composicion del dataset de entrenamiento, ni resultados de evaluacion. La model card indica explicitamente que el slug del repositorio sigue el nombre solicitado y que los pesos base son "el checkpoint 1.5B SISO suministrado localmente".

La arquitectura declarada es Mamba-3 (modelo de espacio de estados, no transformer) con 24 capas, dimension oculta 2048, 64 cabezas y estado 128. La licencia no esta especificada, los idiomas soportados tampoco y no hay benchmarks publicados. Cualquier evaluacion en produccion requeriria validacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mamba-3 (modelo de espacio de estados, SSM), variante SISO |
| Parametros totales | 1.5B (segun nombre del modelo y model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP4-KM (base), NIMBIN4 (LoRA) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | NIMQ (base) y NIMBIN4 (adaptador LoRA); incluye config.json, tokenizer.json, tokenizer_config.json, special_tokens_map.json |

Especificaciones adicionales declaradas en la model card:

| Parametro | Valor |
|---|---|
| Capas | 24 |
| Dimension oculta | 2048 |
| Cabezas | 64 |
| Dimension de estado | 128 |
| Componentes del checkpoint | 23 bloques R (pretrained Mamba-3) + rama G (Linear++ con compuerta) en la capa final |
| Tamano del repositorio | 2.0 GB |
| Framework de inferencia | Nimformers Framework (Makefile en test/mamba3) |

## Arquitectura y entrenamiento

El modelo se basa en Mamba-3, la tercera generacion de la familia de modelos de espacio de estados selectivos, que sustituye la atencion por recurrencia lineal con parametros dependientes de la entrada. La variante SISO (single-input single-output) se refiere al esquema de procesamiento de la senal de estado. La configuracion declarada es de 24 capas con dimension oculta 2048, 64 cabezas y dimension de estado 128, lo que encaja con un modelo de aproximadamente 1.5 mil millones de parametros.

El checkpoint publicado no es el modelo base en precision completa, sino una version cuantizada a FP4-KM mas un fine-tune LoRA/Linear++ (lora-g1.bin) que anade una rama con compuerta (G) en la capa final, manteniendo los 23 bloques restantes como bloques Mamba-3 preentrenados (R). No se documenta el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo RLHF, DPO o ajuste supervisado. Tampoco se describe ninguna innovacion tecnica adicional mas alla de la propia arquitectura Mamba-3 y el esquema de cuantizacion propietario NIMQ.

## Capacidades

- Generacion de texto autoregresiva (pipeline declarado: text-generation).
- Uso conversacional (tag "conversational" en Hugging Face).
- Inferencia eficiente en memoria gracias a la cuantizacion FP4-KM.
- Fine-tune adicional mediante LoRA/Linear++ con rama con compuerta en la capa final.
- Soporte de tool calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (no se declaran idiomas).
- Vision, audio o modos de pensamiento: no disponibles.

## Casos de uso

- Experimentacion con arquitecturas SSM: el modelo permite probar la familia Mamba-3 en tareas de generacion de texto dentro del Nimformers Framework, util para investigadores que quieran comparar SSM frente a transformers en su propio hardware.
- Prototipado de inferencia de bajo consumo: con pesos en FP4-KM y 1.5B de parametros, el checkpoint esta pensado para entornos con VRAM limitada donde un transformer equivalente en FP16 no cabria con comodidad.
- Evaluacion de tecnicas de cuantizacion: sirve como banco de pruebas para medir la degradacion de calidad de FP4-KM frente a precision completa, siempre que se disponga del modelo upstream para comparar.
- Fine-tuning ligero sobre dominio especifico: el adaptador LoRA/Linear++ incluido demuestra el flujo de trabajo para anadir una rama entrenada encima de los bloques Mamba-3 congelados, replicable en otros dominios.
- Generacion de texto conversacional en entornos controlados: para chatbots internos o demos donde el despliegue se haga con el CLI de Nimformers y no se requiera integracion con APIs estandar.
- Investigacion sobre decodificacion y estado recurrente: la dimension de estado 128 y las 64 cabezas permiten estudiar el comportamiento de la memoria de estado en secuencias largas dentro del framework del autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa, un modelo de 1.5B en FP4 ocupa aproximadamente 0.75-1 GB solo en pesos; el repositorio completo son 2.0 GB, por lo que el checkpoint base mas el LoRA deberia caber en GPUs consumer con 6-8 GB de VRAM, aunque esta estimacion no esta confirmada por el autor.
- GPU recomendadas: no disponibles. Por tamano, cabria en RTX 3060, RTX 4060, RTX 4090 y GPUs de datacenter (A100, H100), pero no hay datos de compatibilidad publicados.
- Cabe en GPU consumer: probablemente si, segun el tamano, pero sin confirmacion del autor.
- Opciones de despliegue: exclusivamente el Nimformers Framework mediante `make -f test/mamba3/Makefile infer` y el checkpoint `test/mamba3/models/lora-g1.bin`. No se declara soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mamba-3 SISO 1.5B NIMQ (este) | 1.5B | no disponible | Mamba-3 SSM | no disponible | Hugging Face, formato NIMQ |
| Mamba-2 1.3B (referencia de la familia) | 1.3B | no disponible en esta ficha | Mamba-2 SSM | Apache 2.0 (segun publicacion original) | transformers, pesos estandar |
| Qwen2.5 1.5B | 1.5B | 32K (segun model card oficial) | Transformer denso | Apache 2.0 | transformers, GGUF, vLLM, Ollama |

La comparativa es aproximada: no hay datos de rendimiento publicados para este checkpoint que permitan una comparacion cuantitativa con alternativas. La diferencia principal frente a Mamba-2 y Qwen2.5 es el formato propietario NIMQ y la dependencia del Nimformers Framework, que limita la portabilidad.

## Limitaciones y advertencias

- Licencia no especificada: no se puede asumir uso comercial permitido sin consultar al autor.
- Formato propietario NIMQ/NIMBIN4: no es compatible con transformers, llama.cpp, vLLM ni Ollama; requiere el Nimformers Framework.
- Modelo upstream no identificado en la model card, lo que impide trazar el origen de los pesos y verificar su procedencia.
- Sin idiomas declarados: se desconoce el rendimiento real en castellano u otras lenguas.
- Sin benchmarks ni evaluacion publicada: el riesgo de alucinacion y la calidad real no estan medidos.
- Cuantizacion agresiva a FP4-KM: es esperable cierta degradacion de calidad frente a precision completa, no cuantificada por el autor.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas de contexto largo.
- Repositorio con 219 descargas y 0 likes: ecosistema minimo, sin comunidad que valide el artefacto.
- La model card contiene referencias incompletas (por ejemplo, "Upstream model: ." sin valor), lo que sugiere documentacion no revisada.

## Enlaces

- Hugging Face: https://huggingface.co/bobbydeveloper2014/mamba-siso-1.5b-nimq
- Nimformers Framework: https://github.com/bobbyshop-vui/nimformers-framework
