# liodon-ai/Cyber-Ornith-1.5-9B-OBLITERATED-FP8

## Resumen

Cyber-Ornith-1.5-9B-OBLITERATED-FP8 es una cuantizacion en FP8 dinamico del modelo DuoNeural/Cyber-Ornith-1.5-9B-OBLITERATED, publicada por liodon-ai. No se trata de un modelo entrenado desde cero, sino de una conversion de pesos orientada a reducir el coste de inferencia sin reentrenamiento: el modelo original ocupa 17,9 GB y la version cuantizada 11,0 GB, con 8.953.803.264 parametros totales segun los safetensors del repositorio.

La relevancia de esta publicacion es practica: permite servir un modelo de aproximadamente 9.000 millones de parametros en GPUs con soporte nativo de FP8 (compute capability 8.9 o superior) mediante vLLM, TGI o SGLang, manteniendo los pesos en un formato que evita el sesgo de calibracion porque el esquema FP8_DYNAMIC no requiere dataset de calibracion. La arquitectura subyacente se etiqueta como `qwen3_5_text` en los tags de transformers, aunque la model card no detalla la arquitectura interna ni los datos de entrenamiento del modelo base.

La informacion disponible es escasa: la model card del cuantizador se limita a describir el proceso de cuantizacion y el arranque en los motores de inferencia, y no aporta datos sobre contexto, idiomas, benchmarks ni composicion del entrenamiento. Cualquier evaluacion de capacidades del modelo debe remitirse al modelo base original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (tag `qwen3_5_text`; sin detalle en la model card) |
| Parametros totales | 8.953.803.264 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 dinamico (pesos E4M3 por canal, activaciones FP8 por token); `lm_head` sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | other (heredada del modelo base) |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

No hay informacion en la documentacion proporcionada sobre la arquitectura del modelo base DuoNeural/Cyber-Ornith-1.5-9B-OBLITERATED: no se especifica si es un transformer denso, un MoE o una arquitectura hibrida, ni se detallan el numero de capas, dimensiones ocultas o mecanismo de atencion. El unico indicio estructural es el tag `qwen3_5_text`, que sugiere una base derivada de la familia Qwen 3.5 en su variante de texto, pero no se confirma en la model card.

Respecto al entrenamiento, la informacion disponible solo cubre el proceso de cuantizacion, no el entrenamiento original. La conversion se realizo con llm-compressor usando el esquema `FP8_DYNAMIC`: los pesos se convierten a FP8 E4M3 por canal de forma anticipada y las activaciones se cuantizan dinamicamente por token en tiempo de inferencia. Al no requerir dataset de calibracion, los pesos cuantizados son un cast directo de los originales, sin sesgo introducido por el conjunto de calibracion. La capa `lm_head` se deja sin cuantizar, practica habitual por su impacto desproporcionado en la calidad frente a su tamano reducido. No se dispone de datos sobre tokens de entrenamiento, composicion del dataset ni tecnicas de alineacion (RLHF, DPO) del modelo base.

## Capacidades

- Generacion de texto conversacional: el tag `conversational` y el pipeline `text-generation` indican uso previsto para dialogos multi-turno.
- Inferencia cuantizada en FP8: ejecucion nativa en GPUs Ada, Hopper y Blackwell con vLLM, TGI y SGLang.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere despliegue como servicio HTTP gestionado por los motores citados.
- Capacidades especificas de razonamiento, codigo, matematicas, vision, audio o thinking mode: no disponibles en la informacion proporcionada.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (no se listan idiomas).

## Casos de uso

- Servicio de chat conversacional en produccion: el modelo puede desplegarse con `vllm serve` o con el contenedor de TGI para atender conversaciones multi-turno, aprovechando la reduccion de huella de memoria de 17,9 GB a 11,0 GB para aumentar la concurrencia por GPU.
- Despliegue en GPUs de gama profesional con FP8 nativo: en tarjetas L4, L40S, H100 o H200 el modelo se ejecuta en FP8 sin dequantizacion, lo que reduce el ancho de banda de memoria necesario y mejora el throughput frente a la version BF16.
- Backend de aplicaciones de texto en infraestructura existente de vLLM o SGLang: al seguir el formato compressed-tensors, se integra en pipelines ya estandarizados sin conversion adicional.
- Prototipado y evaluacion de modelos de ~9B: el repositorio de 11 GB es manejable para descargas y pruebas en entornos con una sola GPU de 24 GB o superior, segun el soporte de FP8 del hardware.
- Sustitucion de la version BF16 en servicios con restricciones de VRAM: cuando el modelo original de 17,9 GB no cabe junto con el resto del stack, la variante FP8 libera aproximadamente 7 GB de memoria.
- Experimentacion con cuantizacion dinamica: sirve como referencia para comparar el impacto de FP8_DYNAMIC frente al modelo base sin calibrar, al ser un cast directo de pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 11 GB solo para pesos; el consumo real depende de la longitud de contexto, el tamano de lote y la cache KV, por lo que en la practica se recomienda reservar mas memoria.
- GPUs con FP8 nativo (compute capability 8.9 o superior): RTX 40-series, L4, L40S, H100, H200, B100, B200 y GB10.
- En GPUs anteriores a Ada, vLLM y TGI dequantizan a un formato soportado, lo que elimina la ventaja de velocidad y memoria del FP8.
- Cabe en GPUs de consumo con soporte FP8, como la RTX 4090 (24 GB), dejando margen para cache KV y overhead del motor.
- Opciones de despliegue: vLLM (`vllm serve`), Text Generation Inference (imagen oficial de Hugging Face) y SGLang (`sglang.launch_server`).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cyber-Ornith-1.5-9B-OBLITERATED-FP8 | 8.953.803.264 | no disponible | FP8 dinamico | other | Hugging Face (18 descargas) |
| DuoNeural/Cyber-Ornith-1.5-9B-OBLITERATED | no disponible | no disponible | BF16 (original) | other | Hugging Face |
| Alternativas de ~9B comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos alternativos de la misma categoria en la documentacion proporcionada, ni de datos de rendimiento que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos del modelo base; al ser una cuantizacion, hereda los del modelo original sin mitigacion adicional.
- Riesgo de alucinacion no evaluado: no hay benchmarks ni evaluaciones de fidelidad publicadas.
- La cuantizacion FP8 puede introducir degradacion de calidad respecto al modelo BF16 original; el autor no publica metricas comparativas.
- La licencia es `other` y no se detallan sus terminos en la informacion disponible; es imprescindible revisar la licencia del modelo base antes de cualquier uso comercial.
- El rendimiento depende del hardware: en GPUs sin FP8 nativo la dequantizacion anula las ventajas de velocidad y memoria.
- No se especifican idiomas soportados, longitud de contexto ni capacidades de tool calling, lo que limita la planificacion de despliegues en produccion sin evaluacion previa.
- Modelo con muy poca traccion (18 descargas, 0 likes) y sin validacion comunitaria; conviene tratarlo como experimental.

## Enlaces

- Modelo cuantizado en Hugging Face: https://huggingface.co/liodon-ai/Cyber-Ornith-1.5-9B-OBLITERATED-FP8
- Modelo base: https://huggingface.co/DuoNeural/Cyber-Ornith-1.5-9B-OBLITERATED
- Perfil del autor de la cuantizacion: https://huggingface.co/liodon-ai
- Herramienta de cuantizacion llm-compressor: https://github.com/vllm-project/llm-compressor
