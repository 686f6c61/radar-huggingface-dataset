# Likhith003/autolearn-101m-chat

## Resumen

AutoLearn 101M Chat es un modelo de lenguaje conversacional de 100,7 millones de parametros entrenado integramente desde cero por el desarrollador independiente Likhith003. Forma parte del proyecto AutoLearn API, una plataforma compatible con la interfaz de OpenAI construida de extremo a extremo, e incluye tokenizador, preentrenamiento y ajuste conversacional propios, sin pesos prestados de otros modelos. Su relevancia radica en que demuestra que es posible entrenar un modelo tipo Llama funcional con recursos muy limitados: 2 GPU NVIDIA T4 en Kaggle y unas 47 horas de computo en total.

La arquitectura es un decoder estilo Llama con RMSNorm, embeddings posicionales rotatorios (RoPE), atencion con query agrupadas (GQA), SwiGLU y embeddings atados. Cuenta con 12 capas, dimension oculta de 768, 12 cabezas de atencion y 4 cabezas key-value, con una FFN de 2048. El tokenizador es un BPE a nivel de byte con 32.768 tokens entrenado sobre el propio corpus de preentrenamiento, y la longitud de contexto es de 1.024 tokens, aunque el ajuste conversacional se realizo sobre conversaciones de hasta 512 tokens.

Es un modelo de investigacion y proposito educativo: escribe ingles fluido pero no esta pensado para produccion. Aun asi, su licencia Apache 2.0, su reducido tamano (0,5 GB en el repositorio) y la disponibilidad de pesos ONNX int8 de 127 MB lo hacen util para experimentar con inferencia en navegador mediante transformers.js o para estudiar el ciclo completo de entrenamiento de un LLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder estilo Llama: RMSNorm, RoPE, GQA, SwiGLU, embeddings atados |
| Parametros totales | 100.682.496 (100,7 M) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 1.024 tokens (ajuste conversacional sobre hasta 512) |
| Tipos de cuantizacion | ONNX int8 (q8, 127 MB); pesos safetensors en precision original |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX |
| Capas | 12 |
| Dimension oculta | 768 |
| Cabezas de atencion / KV | 12 / 4 |
| Dimension FFN | 2.048 |
| Tokenizador | BPE a nivel de byte, 32.768 tokens |
| Tamano del repositorio | 0,5 GB |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder de tipo Llama con las optimizaciones habituales de los modelos modernos: normalizacion RMSNorm, embeddings posicionales rotatorios, atencion con query agrupadas (12 cabezas de query frente a 4 de key-value, lo que reduce el coste de la cache KV), activacion SwiGLU en la FFN y embeddings de entrada y salida atados. El tokenizador BPE a nivel de byte fue entrenado especificamente sobre el corpus de preentrenamiento.

El preentrenamiento consumio 4.000 millones de tokens de FineWeb-Edu (30.518 pasos de 131.072 tokens), ejecutado en 2 GPU T4 de Kaggle a lo largo de unas 45 horas de GPU repartidas en 12 sesiones reanudables, y alcanzo una perdida de validacion de 3,10. Posteriormente se realizo un ajuste conversacional supervisado (SFT) sobre 200.000 conversaciones de SmolTalk, calculando la perdida unicamente sobre los turnos del asistente, en 2,1 horas (1.600 pasos) con una perdida de validacion de 1,24. No se menciona uso de RLHF ni DPO. Los pesos se exportaron sin perdida al formato Llama de Hugging Face mediante el script `export_hf.py` del repositorio del proyecto.

## Capacidades

- Generacion de texto conversacional en ingles con formato de chat multi-turno.
- Razonamiento basico y respuesta a preguntas sencillas (por ejemplo, capitales de paises).
- Generacion creativa breve, como haikus o textos cortos.
- Soporte de plantilla de chat (`apply_chat_template`) compatible con el ecosistema transformers.
- Inferencia en navegador mediante transformers.js con pesos ONNX int8.
- Compatibilidad con text-generation-inference y endpoints compatibles con la API de OpenAI a traves de la plataforma AutoLearn.
- No dispone de tool calling, function calling, capacidades de agente, vision, audio ni modo de razonamiento explicito.
- Multilingue: no disponible; solo ingles.

## Casos de uso

- Experimentacion educativa con LLM: sirve para estudiar el ciclo completo de entrenamiento (tokenizador, preentrenamiento, SFT y exportacion) en un unico repositorio con codigo abierto, ideal para cursos y talleres.
- Demos de inferencia en navegador: los pesos ONNX int8 de 127 MB permiten ejecutar el modelo en el dispositivo del usuario mediante transformers.js, sin servidor ni coste de GPU, para prototipos de chat interactivo.
- Pruebas de integracion de APIs compatibles con OpenAI: util para validar pipelines que consumen endpoints tipo OpenAI en la plataforma AutoLearn antes de migrar a modelos mayores.
- Generacion de texto creativo corto: con su contexto de 1.024 tokens puede producir haikus, parrafos descriptivos o respuestas breves en ingles para maquetas y pruebas de interfaz.
- Benchmarking de infraestructura: su tamano reducido lo convierte en un banco de pruebas para medir latencia y throughput de frameworks de despliegue (transformers, TGI, ONNX Runtime) sin consumir recursos significativos.
- Generacion de datos sinteticos a pequena escala o relleno de texto en entornos controlados donde la exactitud factual no sea critica y siempre con revision humana posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta perdidas de validacion: 3,10 tras el preentrenamiento y 1,24 tras el ajuste conversacional.

## Requisitos de hardware

- VRAM estimada para inferencia en precision original (fp16/bf16): en torno a 0,2 GB para los pesos, mas la cache KV y activaciones; cabe holgadamente en cualquier GPU consumer.
- VRAM estimada con ONNX int8: aproximadamente 127 MB para los pesos, ejecutable incluso en CPU y en navegador.
- GPU recomendadas: cualquier GPU moderna; el autor entreno en 2x NVIDIA T4. Funciona en RTX 3060, RTX 4090, A100 o H100 sin aprovechar su capacidad.
- Cabe en GPU consumer: si, en practicamente todas, incluidas integradas y moviles via ONNX.
- Opciones de despliegue: transformers (Python), transformers.js (navegador), text-generation-inference, ONNX Runtime y endpoints compatibles con OpenAI de la plataforma AutoLearn.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| AutoLearn 101M Chat | 100,7 M | 1.024 | Apache 2.0 | Entrenado desde cero en Kaggle; solo ingles; sin benchmarks publicados |
| AutoLearn 40M Chat | ~40 M (no confirmado) | no disponible | Apache 2.0 (segun repositorio) | Hermano menor entrenado en un MacBook; misma familia y limitaciones |
| SmolLM2-135M | 135 M | 2.048 (segun model card publica) | Apache 2.0 | Alternativa de Hugging Face TB con contexto mayor; datos y benchmarks no verificados en esta ficha |

La comparacion con modelos de terceros se limita a caracteristicas generales, ya que no se dispone de resultados de benchmarks del modelo evaluado que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- El propio autor advierte que el modelo afirma con frecuencia cosas falsas: alto riesgo de alucinacion.
- Pierde el hilo en conversaciones largas; el contexto efectivo de entrenamiento conversacional es de 512 tokens y el maximo de 1.024.
- Solo soporta ingles; no hay capacidades multilingues.
- No ha recibido ajuste de seguridad mas alla del contenido presente en SmolTalk; puede generar contenido inapropiado.
- Sesgos conocidos: no disponible; al entrenarse sobre FineWeb-Edu y SmolTalk hereda los sesgos de esos corpus.
- No debe usarse en aplicaciones criticas, atencion al cliente real ni generacion de codigo en produccion.
- Licencia Apache 2.0 permite uso comercial de los pesos, pero los datos de entrenamiento tienen sus propias licencias (FineWeb-Edu ODC-By 1.0, SmolTalk Apache 2.0), que conviene revisar.
- Modelo de investigacion con cero descargas y cero likes en el momento de la consulta; sin validacion externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Likhith003/autolearn-101m-chat
- Modelo hermano AutoLearn 40M Chat: https://huggingface.co/Likhith003/autolearn-40m-chat
- Demo en navegador (Space): https://huggingface.co/spaces/Likhith003/autolearn-chat
- Repositorio AutoLearn API: https://github.com/likhithy99/autolearn-api
- Codigo de entrenamiento: https://github.com/likhithy99/autolearn-api/blob/main/autolearn/llm/train.py
- Codigo del modelo: https://github.com/likhithy99/autolearn-api/blob/main/autolearn/llm/model.py
- Script de exportacion a Hugging Face: https://github.com/likhithy99/autolearn-api/blob/main/scripts/export_hf.py
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset SmolTalk: https://huggingface.co/datasets/HuggingFaceTB/smoltalk
- Documentacion de transformers.js: https://huggingface.co/docs/transformers.js
