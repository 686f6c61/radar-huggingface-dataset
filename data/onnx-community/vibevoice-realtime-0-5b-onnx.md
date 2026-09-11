# onnx-community/VibeVoice-Realtime-0.5B-Onnx

## Resumen

VibeVoice-Realtime-0.5B-Onnx es la conversión al formato ONNX, publicada por la comunidad onnx-community, del modelo de síntesis de voz microsoft/VibeVoice-Realtime-0.5B desarrollado por Microsoft. Se trata de un sistema de text-to-speech orientado a la generación de voz en tiempo real con entrada de texto en streaming: comienza a emitir audio inteligible aproximadamente 300 ms después de recibir los primeros tokens, sin esperar a que el modelo de lenguaje que lo alimenta haya terminado de generar la respuesta completa.

Sobre un LLM base Qwen2.5-0.5B, el sistema añade un tokenizer acústico basado en una variante de sigma-VAE con estructura encoder-decoder simétrica de siete etapas y una cabeza de decodificación por difusión de cuatro capas. El conjunto pesa 0,5B de parámetros en el LLM, con unos 340M adicionales en el decoder acústico y unos 40M en la cabeza de difusión, lo que lo hace apto para despliegue en hardware modesto.

La relevancia actual del modelo reside en tres factores: es uno de los pocos TTS abiertos con latencia de primer audio en torno a 300 ms, soporta entrada de texto incremental (pensada para encadenarse a la salida de cualquier LLM) y se distribuye bajo licencia MIT. Esta versión ONNX permite ejecutarlo con ONNX Runtime en CPU, GPU y entornos web, sin depender del stack de PyTorch del modelo original.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLM transformer (Qwen2.5-0.5B) + tokenizer acustico sigma-VAE (7 etapas de bloques Transformer, decoder ~340M) + cabeza de difusion DDPM (4 capas, ~40M) |
| Parametros totales | 0,5B en el LLM; ~340M en el decoder del tokenizer acustico y ~40M en la cabeza de difusion |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 8192 tokens (entrenado con curriculum de 4k a 8k) |
| Tipos de cuantizacion | no detallada en la informacion disponible; el repositorio contiene pesos ONNX de un modelo etiquetado como derivado cuantizado del original |
| Idiomas soportados | ingles (idioma principal); la model card menciona capacidad multilingue exploratoria en aleman, frances, italiano, japones, coreano, neerlandes, polaco, portugues y espanol |
| Licencia | MIT |
| Formato de pesos | ONNX (repositorio de 11,0 GB) |
| Frecuencia de trama acustica | 7,5 Hz (downsampling de 3200x sobre audio de 24 kHz) |
| Duracion maxima de generacion | ~10 minutos |
| Latencia hasta el primer audio | ~300 ms (dependiente del hardware) |
| Locutores | un unico locutor (esta variante no soporta multi-locutor) |
| Libreria de inferencia | onnxruntime |

## Arquitectura y entrenamiento

El modelo emplea un diseño entrelazado y ventaneado: codifica de forma incremental los fragmentos de texto que van llegando mientras, en paralelo, continúa la generación de latentes acústicos por difusión a partir del contexto previo. A diferencia de las variantes multi-locutor de formato largo, esta versión en streaming elimina el tokenizer semántico y se apoya únicamente en un tokenizer acústico que opera a una tasa de trama muy baja (7,5 Hz). El tokenizer acústico es una variante de sigma-VAE propuesta en LatentLM, con encoder y decoder simétricos de siete etapas, que logra un downsampling de 3200x sobre la entrada de 24 kHz; su decoder tiene aproximadamente 340M de parámetros. La cabeza de difusión es un módulo ligero de cuatro capas condicionado por los estados ocultos del LLM, que predice las características del VAE acústico mediante un proceso DDPM con Classifier-Free Guidance y DPM-Solver (y variantes) en inferencia.

El entrenamiento se divide en dos etapas. Primero se preentrena el tokenizer acústico; después, con el tokenizer congelado, se entrenan únicamente los parámetros del LLM y de la cabeza de difusión, aplicando una estrategia de curriculum que incrementa la longitud de secuencia de entrada de 4k a 8k tokens. El LLM base es Qwen2.5-0.5B, por lo que el tokenizador de texto es el propio de ese modelo. La model card no detalla el volumen de tokens de audio utilizados ni si se aplicaron etapas de RLHF o DPO.

## Capacidades

- Sintesis de voz en tiempo real con una latencia de primer audio de aproximadamente 300 ms, dependiente del hardware.
- Entrada de texto en streaming: puede empezar a hablar a partir de los primeros tokens de un LLM y continuar conforme llega mas texto.
- Generacion de voz de formato largo y robusta, con una duracion de hasta ~10 minutos por generacion dada la ventana de contexto de 8192 tokens.
- Text-to-speech zero-shot: los benchmarks incluidos en la model card (LibriSpeech test-clean, SEED test-en) evaluan rendimiento zero-shot con metricas de similitud de locutor.
- Locutor unico: no soporta dialogos multi-locutor; para eso hay que recurrir a otras variantes de VibeVoice.
- Capacidad multilingue exploratoria en aleman, frances, italiano, japones, coreano, neerlandes, polaco, portugues y espanol, segun la model card, aunque el modelo esta costruido para ingles.
- No se documenta soporte de tool calling, function calling, agentes, vision ni audio de entrada; es un modelo exclusivamente de sintesis de voz.

## Casos de uso

- Asistentes de voz conversacionales de baja latencia: encadenado a un LLM, el modelo permite que el asistente empiece a responder en ~300 ms mientras el LLM sigue generando texto, lo que reduce drasticamente la sensacion de espera en una conversacion.
- Lectura de datos en vivo: narracion continua de flujos de datos (cotizaciones, telemetria, alertas) gracias a la entrada de texto en streaming, sin necesidad de esperar a que el bloque completo este disponible.
- Audiolibros y contenido de formato largo: la ventana de 8192 tokens y la generacion de hasta ~10 minutos por pasada permiten sintetizar capitulos o articulos largos manteniendo coherencia prosodica dentro del segmento.
- Accesibilidad web: conversion de texto a voz en navegador mediante ONNX Runtime con backend WebAssembly o WebGPU, integrable en lectores de pantalla y aplicaciones de lectura asistida sin servidor dedicado.
- Integracion en pipelines de generacion aumentada: cualquier LLM propio puede usar VibeVoice como capa de salida hablada, aprovechando que el modelo acepta tokens parciales en lugar de texto completo.
- Prototipado e investigacion en TTS: al ser un modelo de 0,5B con licencia MIT y pesos ONNX, resulta practico para experimentar con decodificacion por difusion, tokenizers acusticos de baja tasa de trama y tecnicas de streaming en un solo equipo.
- Despliegue en el edge o en dispositivos sin GPU dedicada: el tamano reducido y la disponibilidad de runtime ONNX permiten ejecucion en CPU para servicios de locucion automatizada de baja concurrencia.

## Benchmarks y rendimiento

Resultados de TTS zero-shot en LibriSpeech test-clean:

| Modelo | WER (%) ↓ | Similitud de locutor ↑ |
|---|---|---|
| VALL-E 2 | 2,40 | 0,643 |
| Voicebox | 1,90 | 0,662 |
| MELLE | 2,10 | 0,625 |
| VibeVoice-Realtime-0.5B | 2,00 | 0,695 |

Resultados de TTS zero-shot en SEED test-en:

| Modelo | WER (%) ↓ | Similitud de locutor ↑ |
|---|---|---|
| MaskGCT | 2,62 | 0,714 |
| Seed-TTS | 2,25 | 0,762 |
| FireRedTTS | 3,82 | 0,460 |
| SparkTTS | 1,98 | 0,584 |
| CosyVoice2 | 2,57 | 0,652 |
| VibeVoice-Realtime-0.5B | 2,05 | 0,633 |

La model card indica que el modelo alcanza un rendimiento satisfactorio en benchmarks de frases cortas, pero que su foco principal es la generacion de voz de formato largo. No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otras tareas de lenguaje, ya que no es un modelo de texto.

## Requisitos de hardware

- VRAM estimada para inferencia (calculo orientativo a partir del numero de parametros, no confirmado por el autor): en fp32 en torno a 4-5 GB contando LLM, decoder acustico, cabeza de difusion, cache KV y activaciones; en fp16 aproximadamente 2-2,5 GB; en int8 alrededor de 1-1,5 GB.
- El repositorio completo ocupa 11,0 GB, lo que sugiere que incluye varias precisiones o componentes separados; el espacio en disco necesario depende de que ficheros se descarguen.
- GPU recomendadas: cualquier GPU con 6 GB o mas de VRAM deberia ser suficiente en fp16 o int8, incluidas RTX 3060, RTX 4060 y superiores. Para servicio concurrente o por lotes, A100 o H100 aportan margen holgado.
- Cabe en GPU de consumo: si, el modelo esta explicitamente disenado para ser "deployment-friendly" con 0,5B de parametros; no se especifican requisitos minimos oficiales.
- Despliegue: ONNX Runtime como via principal (CPU, CUDA, DirectML), y por el ecosistema de onnx-community, transformers.js para entornos web con WebGPU o WASM. No consta soporte en vLLM, TGI ni llama.cpp, ya que la arquitectura combina un LLM con tokenizer acustico y cabeza de difusion, algo fuera del alcance habitual de esos servidores.
- Latencia y throughput: la model card reporta ~300 ms hasta el primer audio audible, dependiente del hardware. No se publican cifras de throughput (tokens o segundos de audio por segundo) ni de latencia en streaming continuo.

## Comparativa con modelos similares

| Modelo | Parametros (LLM) | Contexto | Duracion de generacion | WER SEED test-en ↓ | Similitud de locutor SEED ↑ | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| VibeVoice-Realtime-0.5B | 0,5B | 8k | ~10 min | 2,05 | 0,633 | MIT | HuggingFace, original y version ONNX |
| VibeVoice-1.5B | 1,5B | 64k | ~90 min | no disponible | no disponible | no disponible en la informacion proporcionada | HuggingFace |
| VibeVoice-Large | no disponible | 32k | ~45 min | no disponible | no disponible | no disponible en la informacion proporcionada | HuggingFace |
| CosyVoice2 | no disponible | no disponible | no disponible | 2,57 | 0,652 | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada |
| SparkTTS | no disponible | no disponible | no disponible | 1,98 | 0,584 | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada |

Frente a las variantes mayores de la misma familia, VibeVoice-Realtime-0.5B sacrifica longitud de contexto (8k frente a 64k o 32k), duracion maxima de generacion (~10 min frente a ~45 o ~90 min) y soporte multi-locutor a cambio de una latencia de primer audio muy baja y un coste de despliegue mucho menor.

## Limitaciones y advertencias

- Locutor unico: esta variante no genera dialogos multi-locutor; para conversaciones con varias voces hay que usar otros modelos de la coleccion VibeVoice.
- Idioma: el modelo esta construido para ingles y la propia model card advierte de que otros idiomas pueden producir resultados impredecibles; el soporte multilingue es exploratorio y se ofrece para recoger feedback, no como funcionalidad garantizada.
- Uso previsto restringido: la seccion de uso responsable indica que el modelo esta limitado a fines de investigacion sobre generacion de audio realista en tiempo real; conviene revisar esta clausula antes de plantear un uso comercial aunque la licencia sea MIT.
- Licencia: MIT permite uso comercial e modificacion, pero la model card restringe explicitamente el uso a investigacion y prohibe cualquier uso contrario a la legislacion aplicable, incluidas las normas de cumplimiento comercial. Es una discrepancia que debe resolverse con el proveedor antes de un despliegue en produccion.
- Riesgo de uso indebido: se trata de un sistema de sintesis de voz realista con evaluacion zero-shot; existe riesgo de suplantacion de identidad o generacion de audio enganoso. La model card no menciona mecanismos de marca de agua ni de deteccion.
- Alucinacion y artefactos acusticos: no se documentan tasas de fallo en texto fuera de dominio, pero el rendimiento se evalua en conjuntos de referencia de lectura (LibriSpeech, SEED), por lo que el comportamiento en entradas ruidosas, abreviaturas o texto no nativo no esta caracterizado.
- Ventana de contexto: 8192 tokens limitan la generacion a unos 10 minutos; superar ese limite requiere segmentar y puede provocar discontinuidades de prosodia entre segmentos.
- Longitud y calidad en produccion: no se publican cifras de throughput, concurrencia ni estabilidad en ejecuciones prolongadas de esta conversion ONNX, por lo que el dimensionamiento debe validarse con pruebas propias.
- Conversion de terceros: esta version esta mantenida por onnx-community, no por Microsoft; las diferencias de comportamiento respecto al modelo original en PyTorch no estan documentadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/onnx-community/VibeVoice-Realtime-0.5B-Onnx
- Modelo base original: https://huggingface.co/microsoft/VibeVoice-Realtime-0.5B
- Coleccion de modelos VibeVoice: https://huggingface.co/collections/microsoft/vibevoice
- Informe tecnico (arXiv 2508.19205): https://arxiv.org/abs/2508.19205
- Articulo de LatentLM (arXiv 2412.08635): https://arxiv.org/pdf/2412.08635
- Pagina del proyecto: https://microsoft.github.io/VibeVoice
- Codigo fuente: https://github.com/microsoft/VibeVoice
- Guia de uso de la variante realtime: https://github.com/microsoft/VibeVoice/blob/main/docs/vibevoice-realtime-0.5b.md
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/anycoderapps/VibeVoice-Realtime-0.5B
- Video de demostracion: https://github.com/user-attachments/assets/0901d274-f6ae-46ef-a0fd-3c4fba4f76dc
- LLM base Qwen2.5-0.5B: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Los resultados de la busqueda web realizada no contienen enlaces relevantes sobre este modelo: devolvieron exclusivamente paginas de un producto de IA no relacionado con VibeVoice.
