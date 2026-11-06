# DJF-on-arm/Iamam2

## Resumen

Iamam2 es un modelo de generacion de texto de pequeno tamano desarrollado por DJF-on-arm, distribuido en Hugging Face bajo la libreria Keras. Segun su model card, se trata de una red BiLSTM (Long Short-Term Memory bidireccional) con mecanismo de atencion, con aproximadamente 12 millones de parametros. No es un transformer: es una arquitectura recurrente clasica orientada a servir como modelo base para experimentacion y fine-tuning de otros modelos LSTM.

El modelo se presenta explicitamente como un "base model" sin RLHF, sin fine-tuning de alineamiento y sin capas de seguridad. Su objetivo declarado es proporcionar una base sobre la que otros desarrolladores puedan entrenar variantes especializadas, aprovechando la atencion para focalizar palabras concretas y la bidireccionalidad para procesar la frase en ambos sentidos. El propio autor reconoce que el modelo es "bastante torpe" y que seria un mal chatbot, mal modelo matematico y mal modelo de ingles.

Es relevante ahora principalmente como pieza de investigacion y docencia sobre arquitecturas recurrentes con atencion en el ecosistema Keras, no como alternativa practica a los transformers actuales. El autor indica que el sucesor del proyecto es RIBBON (DJF-on-arm/RIBBON_1), que recomienda usar en su lugar. El modelo tiene 18 descargas y 1 like en el momento de la consulta, lo que refleja su caracter experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BiLSTM con atencion (recurrente, no transformer) |
| Parametros totales | ~12 millones (segun model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el autor indica "max output length: varies per version") |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | AGPL-3.0 |
| Formato de pesos | Keras (libreria keras; tamano del repo 0.4 GB) |

## Arquitectura y entrenamiento

La arquitectura es una BiLSTM con atencion. La componente bidireccional procesa cada secuencia en sentido directo e inverso, de modo que cada posicion dispone de contexto a izquierda y derecha; el autor argumenta que esto reduce la perdida de informacion y, teoricamente, permite operaciones algo mas complejas. La capa de atencion permite al modelo ponderar palabras concretas de la entrada, lo que el autor considera util para fine-tunes que deban focalizarse en terminos especificos.

Los datasets declarados en la model card son yahma/alpaca-cleaned, MuskumPillerum/General-Knowledge, tau/commonsense_qa y mini97/filtered_english-wikipedia. No se especifica el numero de tokens de entrenamiento ni la composicion exacta del dataset. El regimen de entrenamiento fue "Mixed Bfloat 16". Los hiperparametros (vocab size, optimizador, max output length, embed dim, latent dim, learning rates) aparecen como "[Varies per version]" sin valores concretos. El entrenamiento se realizo en una CPU AMD Ryzen 5 5600 con 16 GB de DDR4, usando TensorFlow, Python y VS Code sobre Windows 11 Pro; el autor indica que las emisiones de carbono se calcularan cuando empiece Iamam 3. No se menciona RLHF, DPO ni ninguna fase de alineamiento: el modelo se distribuye sin ellas.

## Capacidades

- Generacion de texto en ingles, con calidad limitada segun el propio autor.
- Procesamiento bidireccional de secuencias (contexto a izquierda y derecha en cada posicion).
- Mecanismo de atencion para ponderar palabras concretas de la entrada.
- Base para fine-tuning: pensado para que terceros lo especialicen.
- No soporta tool calling ni function calling (no documentado).
- No soporta agentes ni razonamiento multi-paso (no documentado).
- Multilingue: solo ingles declarado.
- Sin modo thinking, vision ni audio.
- Sin entrenamiento en matematicas (el autor lo indica explicitamente).

## Casos de uso

- Docencia sobre arquitecturas recurrentes: sirve para ilustrar en Keras como funciona una BiLSTM con atencion y comparar su comportamiento con transformers en tareas controladas.
- Fine-tuning experimental: al ser un base model sin alineamiento, permite estudiar como el fine-tuning sobre datasets pequenos (por ejemplo, alpaca-cleaned) modifica el comportamiento de una red recurrente.
- Investigacion sobre atencion en modelos pequenos: su capa de atencion permite analizar que tokens reciben mayor peso en una prediccion, util para estudios de interpretabilidad en arquitecturas no transformer.
- Prototipado de pipelines Keras: integrable en flujos de TensorFlow/Keras para validar infraestructura de entrenamiento e inferencia antes de escalar a modelos mayores.
- Generacion de texto de baja criticidad en entornos de prueba: util para rellenar pipelines de demostracion donde la calidad del texto no es el objetivo.
- Baseline en experimentos comparativos: como referencia de rendimiento para medir la mejora que aportan arquitecturas transformer en tareas de lenguaje con presupuesto computacional minimo.
- Educacion sobre limitaciones de las RNN: ejemplo practico de por que las LSTM con atencion quedaron superadas por los transformers en generacion abierta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja, coherente con ~12M de parametros; en fp32 el modelo ocupa del orden de decenas de MB, aunque el repo pesa 0.4 GB (incluye artefactos Keras y posiblemente checkpoints).
- GPU recomendadas: no requiere GPU; el autor entreno en CPU (Ryzen 5 5600) con 16 GB de DDR4.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, e incluso GPUs integradas) y en CPU.
- Opciones de despliegue: TensorFlow/Keras es la via natural; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (son herramientas orientadas a transformers y formatos GGUF/safetensors).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Iamam2 | BiLSTM con atencion | ~12M | no disponible | AGPL-3.0 | Hugging Face (Keras) |
| Iamam1 | LSTM (predecesor) | no disponible | no disponible | no disponible | Hugging Face |
| RIBBON_1 (DJF-on-arm) | no disponible (sucesor, no LSTM puro) | no disponible | no disponible | no disponible | Hugging Face |
| Modelos transformer pequenos (p. ej. GPT-2 small) | Transformer decoder | ~124M | 1024 tokens | MIT (GPT-2) | Hugging Face |

La comparacion con GPT-2 small se incluye como referencia de categoria por tamano y proposito (generacion de texto en ingles como base model), no porque existan benchmarks publicados que los comparen directamente. No hay datos de rendimiento de Iamam2 que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- El autor califica el modelo como "bastante torpe" y advierte de que no debe usarse para informacion critica.
- Riesgo elevado de alucinacion y de generar texto incoherente; el autor pide verificacion de hechos.
- Capacidad muy limitada por tamano (12M de parametros) frente a transformers actuales.
- Solo ingles declarado; no hay soporte multilingue.
- Sin entrenamiento en matematicas; no es fiable en tareas numericas.
- Sin RLHF ni alineamiento: no hay capas de seguridad ni filtrado de contenido.
- Licencia AGPL-3.0: implica obligaciones de copyleft fuerte para uso en red; revisar compatibilidad antes de uso comercial o en servicios SaaS.
- El autor recomienda usar el sucesor RIBBON_1 en lugar de este modelo.
- No hay documentacion de hiperparametros concretos ni de contexto maximo, lo que dificulta su uso en produccion.
- Sesgos: el autor afirma que no cree que tenga sesgos, pero no aporta evaluacion; los datasets de entrenamiento (alpaca-cleaned, wikipedia filtrada, commonsense_qa) pueden introducir sesgos no medidos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DJF-on-arm/Iamam2
- Sucesor recomendado por el autor: https://huggingface.co/DJF-on-arm/RIBBON_1
- Dataset yahma/alpaca-cleaned: https://huggingface.co/datasets/yahma/alpaca-cleaned
- Dataset MuskumPillerum/General-Knowledge: https://huggingface.co/datasets/MuskumPillerum/General-Knowledge
- Dataset tau/commonsense_qa: https://huggingface.co/datasets/tau/commonsense_qa
- Dataset mini97/filtered_english-wikipedia: https://huggingface.co/datasets/mini97/filtered_english-wikipedia
- Paper citado en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental: https://ml2co2.github.io/impact
