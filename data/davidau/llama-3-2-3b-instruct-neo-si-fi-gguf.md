# DavidAU/Llama-3.2-3B-Instruct-NEO-SI-FI-GGUF

## Resumen

Llama-3.2-3B-Instruct-NEO-SI-FI-GGUF es un ajuste fino (fine-tune) del modelo Llama-3.2-3B-Instruct de Meta, publicado por el creador independiente DavidAU en Hugging Face. El modelo parte de la base instructiva oficial de Meta de 3.212.749.888 parametros y aplica sobre ella el dataset propietario "NEO IMATRIX Science Fiction and Story dataset V2", orientado a potenciar la escritura creativa, la narrativa de ficcion y el roleplay. Se distribuye exclusivamente en formato GGUF cuantizado, lo que lo hace desplegable en hardware de consumo.

El objetivo del ajuste es reforzar la creatividad, la prosa vivida, la generacion de tramas y sub-tramas, la continuacion de escenas y el juego de rol, manteniendo la ventana de contexto nativa de Llama 3.2 de 131.000 tokens (128k). Es relevante para desarrolladores que necesitan un modelo pequeno, rapido y con licencia permisiva (Apache 2.0) para tareas de generacion de ficcion o narrativa interactiva en local, sin depender de APIs externas.

La relevancia practica del modelo radica en su reducido tamano (3B) combinado con contexto largo y cuantizaciones imatrix: el autor reporta velocidades de 90 tokens por segundo o mas en GPU, y el modelo cabe en GPUs de consumo con cuantizaciones bajas. No obstante, conviene subrayar que no es un modelo de razonamiento general ni de codigo; su especializacion es la ficcion y el roleplay.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Llama-3.2-3B-Instruct de Meta) |
| Parametros totales | 3.212.749.888 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 131.000 tokens (128k) |
| Tipos de cuantizacion | GGUF con imatrix: IQ2, IQ3, IQ4_XS, Q4, Q5, Q6 (Q8 no publicado porque imatrix no tiene efecto) |
| Idiomas soportados | en, fr, de, es, it, pt, zh, ja, ru, ko |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (bfloat16 en el modelo base; cuantizaciones GGUF en el repo) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer decoder-only de Llama 3.2 3B Instruct, con atencion por grupos (GQA) y el tokenizador de Llama 3. Sobre esa base, el autor aplica un ajuste fino supervisado con el dataset "NEO IMATRIX Science Fiction and Story V2", disenado para mejorar la creatividad narrativa y la prosa vivida. No se detalla en la model card el numero exacto de tokens de entrenamiento, la composicion completa del dataset ni si se emplearon tecnicas de RLHF o DPO adicionales sobre el ajuste supervisado.

La innovacion tecnica principal es el uso de cuantizaciones imatrix (importance matrix), que segun el autor rinden mejor en IQ3 e IQ4 y recomienda IQ4_XS como el punto optimo entre efecto imatrix y numero de bits. El modelo se distribuye con la plantilla de chat de Llama 3 (cabeceras `<|start_header_id|>` y `<|eot_id|>`) y el autor advierte que usar otra plantilla, como Command-R, altera sustancialmente la salida. Se menciona tambien la compatibilidad con endpoints y el uso de bfloat16 en la base.

## Capacidades

- Generacion de texto creativo: ficcion, ciencia ficcion, romance y generos variados.
- Generacion y continuacion de tramas y sub-tramas narrativas.
- Continuacion de escenas y escritura de prosa vivida ("vivid prosing").
- Roleplay y juego de rol conversacional multi-turno.
- Conversacion general instructiva heredada de Llama-3.2-3B-Instruct.
- Soporte multilingue en diez idiomas (en, fr, de, es, it, pt, zh, ja, ru, ko).
- Operacion con temperaturas muy amplias (de 0 a 5 segun el autor) y ajuste fino mediante repetition penalty.
- Capacidad de contexto largo (hasta 128k tokens) para narrativas extensas.
- No se documenta en la informacion disponible soporte explicito de tool calling, function calling, agentes, vision, audio ni modo "thinking".

## Casos de uso

- Escritura de ficcion asistida: el modelo puede generar borradores de relatos, capitulos o novelas por entregas aprovechando su ventana de 128k tokens para mantener coherencia en textos largos y su ajuste especifico en prosa narrativa.
- Roleplay y narrativa interactiva: adecuado para videojuegos de texto o chatbots de personajes, ya que el ajuste NEO IMATRIX refuerza la consistencia de personajes y la continuidad de escenas en conversaciones multi-turno.
- Generacion de tramas y sub-tramas: util para guionistas y disenadores narrativos que necesitan lluvias de ideas estructuradas, giros argumentales o arcos secundarios, gracias al entrenamiento especifico en "plot generation" y "sub-plot generation".
- Continuacion de escenas en produccion editorial: un escritor puede pegar un fragmento extenso (dentro de los 128k tokens) y pedir continuaciones coherentes con el tono y el estilo previo.
- Prototipado local de asistentes creativos: al ser un modelo de 3B en GGUF, permite desplegar un asistente de escritura en una estacion de trabajo sin GPU dedicada de gama alta, usando llama.cpp u Ollama.
- Generacion de contenido multilingue de ficcion: el soporte de diez idiomas permite crear relatos o dialogos de personajes en espanol, frances, aleman, etc., con el mismo modelo.
- Experimentacion e investigacion en ajuste fino: sirve como caso de estudio de cuantizacion imatrix y de ajuste de modelos pequenos para dominios creativos, con licencia Apache 2.0 que facilita la reutilizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni comparaciones cuantitativas con otros modelos; unicamente menciona de forma cualitativa velocidades de generacion de "90 tokens por segundo o mas" en GPU, sin especificar el hardware empleado.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun cuantizacion GGUF): en torno a 1,5-2 GB para IQ2, 2-2,5 GB para IQ3, 2,5-3 GB para IQ4_XS, 3-4 GB para Q4/Q5 y 4,5-6 GB para Q6, mas el coste del contexto KV cache que crece con la ventana utilizada.
- GPU recomendadas: cualquier GPU consumer moderna con 6-8 GB o mas (RTX 3060, RTX 4060, RTX 4070, RTX 4090) puede ejecutar las cuantizaciones intermedias; para contexto completo de 128k se necesita mas VRAM por el KV cache.
- Cabe en GPU de consumo: si, en la mayoria de cuantizaciones IQ2 a Q5 con contextos moderados.
- Opciones de despliegue: llama.cpp, Ollama, y otros runners compatibles con GGUF; el autor indica compatibilidad con endpoints. No se documenta soporte explicito de vLLM o TGI para este repo GGUF.
- Latencia y throughput: el autor reporta 90+ tokens por segundo en GPU, sin especificar el modelo de GPU ni la cuantizacion exacta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| Llama-3.2-3B-Instruct-NEO-SI-FI (este) | 3,21B | 128k | Apache 2.0 | GGUF | Ficcion y roleplay (fine-tune) |
| Llama-3.2-3B-Instruct (Meta) | 3,21B | 128k | Llama 3.2 Community License | safetensors, GGUF | Instructivo general |
| Mistral-7B-Instruct | 7,24B | 32k | Apache 2.0 | safetensors, GGUF | Instructivo general |
| Qwen2.5-3B-Instruct | 3,09B | 32k | Apache 2.0 | safetensors, GGUF | Instructivo general multilingue |

La comparativa se limita a caracteristicas estructurales; no se dispone de datos de benchmarks del modelo de DavidAU para comparar rendimiento cuantitativo con las alternativas.

## Limitaciones y advertencias

- Modelo pequeno (3B): menor capacidad de razonamiento general, matematicas y codigo que modelos mayores; su fuerte es la ficcion, no tareas tecnicas.
- Riesgo de alucinacion: como todo modelo generativo, puede inventar hechos, nombres o detalles, especialmente en contextos narrativos largos.
- Sesgos: no se documentan evaluaciones de sesgo; al derivar de Llama 3.2 y de un dataset de ficcion, puede reproducir estereotipos presentes en los datos.
- Sensibilidad a parametros de muestreo: el autor advierte que cambios en temperatura y repetition penalty alteran drasticamente la salida; requiere ajuste cuidadoso (rep pen de 1,02 o superior, 1,05-1,08 en roleplay).
- Dependencia de la plantilla: debe usarse la plantilla Llama 3; otras plantillas cambian el comportamiento.
- Cuantizaciones muy bajas (Q2/Q3): el autor senala que pueden danar el modelo y requieren temperaturas mas bajas.
- Contexto largo: aunque soporta 128k, el rendimiento real y el coste de memoria del KV cache en contextos muy extensos no estan documentados.
- Licencia Apache 2.0: permisiva para uso comercial, pero el modelo base Llama 3.2 de Meta tiene su propia licencia comunitaria que conviene revisar antes de un despliegue comercial.
- No se documenta soporte de tool calling ni de agentes, por lo que no es adecuado para pipelines de automatizacion que dependan de function calling.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DavidAU/Llama-3.2-3B-Instruct-NEO-SI-FI-GGUF
- Modelo base de Meta: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Guia de parametros y samplers del autor: https://huggingface.co/DavidAU/Maximizing-Model-Performance-All-Quants-Types-And-Full-Precision-by-Samplers_Parameters
- Perfil del autor: https://huggingface.co/DavidAU
- Colecciones del autor: https://huggingface.co/DavidAU/collections
- FAQs del autor: https://huggingface.co/DavidAU/support
