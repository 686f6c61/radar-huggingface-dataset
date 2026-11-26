# SalpyDev/jellybrain-1b

## Resumen

Jellybrain-1b es un modelo de generacion de texto de tipo decoder-only basado en la arquitectura Llama, con aproximadamente 1.100 millones de parametros. Lo desarrolla el usuario SalpyDev y se distribuye bajo licencia Apache 2.0. Se trata de un ajuste fino (finetune) del modelo `unsloth/tinyllama-bnb-4bit`, que a su vez deriva de TinyLlama, un modelo compacto pensado para ejecutarse en hardware modesto.

El modelo se ha entrenado utilizando Unsloth y la libreria TRL de Hugging Face, una combinacion habitual para ajustes finos rapidos y con bajo consumo de memoria. La model card es minima: no documenta el dataset de entrenamiento, el numero de tokens utilizados ni los hiperparametros del ajuste, por lo que buena parte de las especificaciones tecnicas no esta disponible publicamente.

Su relevancia practica es limitada por ahora: el repositorio registra cero descargas y cero likes, y no se han publicado evaluaciones. Resulta util como experimento de finetuning reproducible sobre una base TinyLlama cuantizada, pero no hay evidencia publica de que supere a su modelo base en tareas generales. El contexto, el vocabulario y los idiomas heredan las caracteristicas de TinyLlama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama) |
| Parametros totales | 1.100.048.384 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (heredada de TinyLlama; la model card no la especifica) |
| Tipos de cuantizacion | No disponible (el modelo base se distribuye en bnb-4bit; el repo contiene safetensors) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |
| Tamano del repositorio | 2,2 GB |
| Modelo base | unsloth/tinyllama-bnb-4bit |
| Libreria | Transformers |
| Pipeline | Text-generation |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de la familia Llama, con 1.100 millones de parametros, heredada de TinyLlama a traves de la version cuantizada de Unsloth. TinyLlama es conocido por su entrenamiento sobre aproximadamente 3 billones de tokens, aunque esa cifra corresponde al modelo original y no al ajuste fino de Jellybrain-1b.

El ajuste fino se realizo con Unsloth y TRL, tecnicas que aceleran el entrenamiento y reducen el uso de memoria mediante kernels optimizados y posibles tecnicas de PEFT (como LoRA/QLoRA, dado el origen en un modelo bnb-4bit). No se documenta el dataset, el numero de pasos, la tasa de aprendizaje ni si hubo fases de RLHF o DPO. Tampoco se describen innovaciones tecnicas adicionales mas alla del uso de Unsloth.

## Capacidades

- Generacion de texto autoregresiva en ingles.
- Razonamiento basico y respuesta a instrucciones, limitado por el tamano del modelo (1,1B parametros).
- Generacion de codigo sencillo y fragmentos de scripts.
- Aritmetica y matematicas elementales, con fiabilidad limitada a este tamano.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: limitadas al ingles segun la model card.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Prototipado rapido de pipelines de generacion de texto: por su tamano de 1,1B parametros, puede desplegarse en entornos de desarrollo con recursos limitados para validar integraciones con Transformers o TGI antes de pasar a modelos mayores.
- Experimentacion academica con finetuning: sirve como ejemplo reproducible de un ajuste realizado con Unsloth y TRL sobre una base TinyLlama, util para estudiar el flujo de trabajo y sus resultados.
- Generacion de texto en dispositivos con poca VRAM: al ser un modelo de ~1B parametros, es candidato a ejecutarse en GPUs de consumo o incluso en CPU con cuantizacion, para tareas de relleno o borradores.
- Educacion y demostraciones de LLM: adecuado para talleres introductorios donde se necesita un modelo pequeno que quepa en una sola GPU y cuyo codigo de carga sea estandar (Transformers).
- Generacion de contenido corto en ingles: redaccion de borradores, resumenes breves o respuestas a preguntas simples, siempre con revision humana dada la fiabilidad del modelo.
- Base para experimentos de cuantizacion y despliegue: permite probar flujos con llama.cpp, Ollama o vLLM a pequena escala antes de escalar a modelos mayores.
- Evaluacion comparativa de finetunes: util como punto de referencia en estudios sobre el impacto del ajuste fino en modelos pequenos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp16/bf16): en torno a 2,2 GB solo para pesos, mas memoria para activaciones y cache KV (aproximadamente 3-4 GB en total).
- VRAM estimada con cuantizacion de 8 bits: aproximadamente 1,1-1,5 GB.
- VRAM estimada con cuantizacion de 4 bits: aproximadamente 0,7-1 GB.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM para fp16; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son sobradas. Tambien puede ejecutarse en CPU.
- Cabe en GPU de consumo: si, en practicamente todas las GPU dedicadas actuales con 4 GB o mas de VRAM.
- Opciones de despliegue: Transformers (libreria indicada en la model card), Text Generation Inference (TGI), llama.cpp, Ollama y vLLM (previa conversion a los formatos correspondientes).
- Latencia y throughput estimados: no disponibles (no se han publicado mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Jellybrain-1b | 1,1B | No disponible | Apache 2.0 | Hugging Face (0 descargas) | Finetune de TinyLlama via Unsloth; sin benchmarks publicos |
| TinyLlama-1.1B | 1,1B | 2.048 tokens (modelo original) | Apache 2.0 | Hugging Face, ampliamente usado | Entrenado sobre ~3 billones de tokens; benchmarks publicos disponibles |
| Qwen2.5-1.5B | 1,5B | 32.768 tokens | Apache 2.0 | Hugging Face | Mayor contexto y rendimiento documentado; multilingue |
| SmolLM2-1.7B | 1,7B | 8.192 tokens | Apache 2.0 | Hugging Face | Entrenado con datos curados; benchmarks publicos |

Nota: los datos de contexto y rendimiento de los modelos comparables corresponden a sus model cards publicas; los de Jellybrain-1b no estan documentados en la informacion disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados, pero al derivar de TinyLlama y entrenarse principalmente con datos en ingles, es probable que herede sesgos de ese corpus.
- Riesgo de alucinacion: alto para un modelo de 1,1B parametros; no debe usarse en produccion sin verificacion humana.
- Limitaciones de contexto e idioma: solo se declara ingles; la longitud de contexto no esta especificada y probablemente sea la de TinyLlama (2.048 tokens en el modelo original).
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y de los datos de finetuning, que no se documentan.
- Falta de documentacion: la model card no describe dataset, hiperparametros ni evaluaciones, lo que impide reproducir el entrenamiento o evaluar su calidad.
- Madurez: cero descargas y cero likes en el momento de la consulta; no hay evidencia de uso en produccion ni de validacion por la comunidad.
- Caveat para produccion: no se recomienda su uso en entornos productivos sin una evaluacion propia previa frente al modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SalpyDev/jellybrain-1b
- Modelo base: https://huggingface.co/unsloth/tinyllama-bnb-4bit
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TinyLlama (modelo original): https://huggingface.co/TinyLlama/TinyLlama-1.1B-Chat-v1.0
- Paper de TinyLlama: https://arxiv.org/abs/2401.02385
- TRL de Hugging Face: https://github.com/huggingface/trl
