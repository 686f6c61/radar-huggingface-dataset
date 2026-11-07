# BuilderHelm/Kanso-Satori-1.0

## Resumen

Kanso Satori 1.0 es un modelo de lenguaje de 4.022.468.096 parámetros (aproximadamente 4B) desarrollado por BuilderHelm, el equipo detrás de la aplicación de dictado ZenVoice. No es un modelo conversacional de propósito general: es un modelo especializado en la limpieza y el formateo de salida cruda de reconocimiento automático de voz (ASR). Recibe transcripciones sin procesar y devuelve texto escrito correctamente: restaura puntuación y mayúsculas, elimina muletillas y falsos reinicios, aplica normalización inversa de texto (números, importes, fechas, horas, porcentajes, correos, URL y teléfonos) y repara la gramática sin alterar el significado ni las palabras del hablante.

El modelo se construye sobre Qwen3-4B-Instruct-2507 mediante un adaptador LoRA (rango 32, alpha 64) fusionado en los pesos bf16, que después se cuantizan a 4 bits con DWQ (distilled weight quantization), una técnica que ajusta las escalas de cuantización para que la distribución de tokens del modelo de 4 bits coincida con la del modelo bf16 sobre los prompts de entrenamiento de Kanso. El resultado es un artefacto único de 2,26 GB que se ejecuta íntegramente en dispositivo con MLX sobre Apple Silicon, a unos 47 tok/s en un Apple M5.

Su relevancia actual es doble: por un lado, demuestra que un modelo de 4B cuantizado a 4 bits puede igualar en precisión al modelo sin cuantizar en una tarea acotada y medible; por otro, ofrece una alternativa local y con licencia Apache 2.0 frente al envío de transcripciones de voz a servicios en la nube, un punto crítico para aplicaciones de dictado por motivos de privacidad y latencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-4B-Instruct-2507 como base), con LoRA fusionado y cuantizacion DWQ |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (el entrenamiento uso una longitud maxima de 1.024 tokens) |
| Tipos de cuantizacion | 4 bits (DWQ, build publicado); 3 bits (DWQ, variante comparada en la model card); bf16 disponible en el repo base `Kanso-Satori-1.0-bf16` |
| Idiomas soportados | no disponible (la model card no declara lista de idiomas; los ejemplos estan en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria MLX); repo de 2,3 GB, pesos de 2,26 GB |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B-Instruct-2507, un transformer decoder-only denso. Sobre esa base se entreno un adaptador LoRA con rango 32, alpha 64 y escala 2.0, dropout 0.05, aplicado a las 36 capas y a todos los modulos lineales. El entrenamiento corrio sobre `mlx-community/Qwen3-4B-Instruct-2507-4bit` en la revision `50d4277`, con un schedule de decaimiento coseno de 1e-4 a 1e-6 durante 3.400 pasos, batch de 2, 3.500 iteraciones, longitud maxima de 1.024 y gradient checkpointing. El adaptador se fusiono posteriormente en los pesos bf16.

La innovacion tecnica destacable es el pipeline de cuantizacion DWQ: en lugar de cuantizar de forma ingenua, se ajustan las escalas de cuantizacion para minimizar la divergencia entre la distribucion de tokens del modelo de 4 bits y la del bf16 sobre los prompts de entrenamiento de Kanso. El autor afirma que el resultado de 4 bits es tan preciso como el bf16 sin cuantizar. Un detalle critico de implementacion es el `chat_template.jinja` incluido: el modelo se entreno con un bloque de pensamiento vacio (`<think>\n\n</think>\n\n`) al inicio de cada respuesta, y la plantilla estandar de Qwen3-4B-Instruct-2507 no lo incluye; sin ese bloque el primer token se vuelve impredecible y las builds de menor precision degeneran en tokens `<tool_call>`.

## Capacidades

- Limpieza de dictado: restauracion de puntuacion y mayusculas sobre transcripciones ASR crudas.
- Eliminacion de muletillas al inicio y en mitad de frase, y de falsos reinicios.
- Normalizacion inversa de texto: conversion de formas habladas a escritas para numeros, dinero, fechas, horas, porcentajes, correos electronicos, URL y telefonos.
- Reparacion gramatical que preserva el significado y las palabras originales del hablante.
- Adaptacion de estilo: si se le pasa una linea `app:` en el contexto, ajusta mayusculas y tono a ese contexto de aplicacion.
- Generacion de texto condicionada por plantilla de chat con `enable_thinking=False`.
- No se documentan capacidades de tool calling, agentes, vision, audio ni razonamiento multi-paso; el modelo esta orientado a una unica tarea de transformacion de texto.

## Casos de uso

- Dictado en dispositivo en aplicaciones de escritorio: integrado en la app ZenVoice (mlx-swift-lm), procesa cada dictado en 0,32 s de media con un pico de memoria de 2,65 GB, lo que permite limpiar la transcripcion localmente sin enviar audio ni texto a la nube.
- Correos y mensajes dictados: convierte "send it to john dot smith at example dot com by friday the twelfth" en "Send it to john.smith@example.com by Friday, the twelfth", cubriendo correos, URL y fechas en una sola pasada.
- Notas de reunion y actas: con dictados de 50-99 palabras el modelo mantiene un WER del 10,3% y un Punct F1 de 0,815, suficiente para generar notas legibles a partir de transcripciones largas.
- Normalizacion de importes y datos financieros: la normalizacion inversa de dinero, porcentajes y fechas lo hace adecuado para transcribir informes orales donde las cifras deben quedar en formato escrito correcto.
- Postprocesado de pipelines ASR existentes: puede insertarse como etapa final sobre la salida de cualquier motor de reconocimiento de voz, ya que su entrada es texto plano y su salida es texto limpio.
- Aplicaciones de accesibilidad: usuarios con movilidad reducida que dictan texto largo se benefician de la eliminacion de falsos reinicios y muletillas, con un modelo que cabe en un portatil Apple Silicon.
- Privacidad y cumplimiento: al ejecutarse en local con licencia Apache 2.0, encaja en entornos donde las transcripciones contienen datos personales o clinicos y no pueden salir del dispositivo.

## Benchmarks y rendimiento

Resultados publicados en la model card, con decodificacion greedy sobre Apple M5 y MLX 0.32.2.

**eval_v500**: 500 dictados con control de fuga de datos, maximo 200 tokens.

| Metrica | v3.2 4-bit DWQ (este modelo) | v3.2 3-bit DWQ | v2.2 Lite (1.7B) | v3.1 (4B anterior) |
|---|---|---|---|---|
| WER | 4,7% | 4,7% | 5,5% | 13,3% |
| Exact match | 67,2% | 64,2% | 65,8% | 49,8% |
| Punct F1 | 0,859 | 0,838 | 0,863 | 0,772 |
| Sentence-start | 95,1% | 93,4% | 94,4% | 82,3% |
| Pesos | 2,26 GB | 1,76 GB | 1,05 GB | 2,26 GB |
| Velocidad de decodificacion | 47 tok/s | 58 tok/s | 73 tok/s | 47 tok/s |

**Datos retenidos de v2.2**: 500 filas no usadas ni en entrenamiento ni en DWQ.

| Metrica | v3.2 4-bit DWQ | v3.2 3-bit DWQ | v2.2 Lite | v3.1 |
|---|---|---|---|---|
| WER | 8,0% | 9,0% | 8,9% | 26,9% |
| Exact match | 40,6% | 37,0% | 37,0% | 10,4% |

Frente a Lite, la ganancia de exact match del modelo de 4 bits es de +3,6 puntos (IC 95%: +0,4 a +6,8).

**Dictados medios**: 150 dictados de 50-99 palabras, maximo 400 tokens.

| Metrica | v3.2 4-bit DWQ | v3.2 3-bit DWQ | v2.2 Lite | v3.1 |
|---|---|---|---|---|
| WER | 10,3% | 15,1% | 11,0% | 13,9% |
| Punct F1 | 0,815 | 0,796 | 0,795 | 0,695 |

**Runtime de la app ZenVoice** (mlx-swift-lm, pipeline propio, eval_v500): WER 3,9% y exact match 64,6% en la salida del modelo; Lite obtiene 4,0% y 65,4%. Tiempo medio de 0,32 s por dictado y pico de memoria de 2,65 GB; ningun dictado excedio el presupuesto de tiempo de la app.

## Requisitos de hardware

- VRAM/memoria unificada: 2,26 GB de pesos en la build de 4 bits; el runtime de la app reporta un pico de 2,65 GB.
- Plataforma objetivo: Apple Silicon con MLX (libreria `mlx`, `mlx-swift-lm` en la app). El autor reporta 47 tok/s en un Apple M5.
- GPU consumer: cabe holgadamente en cualquier Mac con memoria unificada de 8 GB o mas; no se documenta soporte para GPU NVIDIA ni CUDA.
- Opciones de despliegue: `mlx_lm` en Python (ejemplo incluido en la model card) y `mlx-swift-lm` en la app ZenVoice. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia: 0,32 s de media por dictado en el pipeline de la app; sin dictados fuera de presupuesto en la evaluacion.
- Throughput: 47 tok/s en decodificacion greedy sobre Apple M5.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER (eval_v500) | Exact match | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Kanso Satori 1.0 (4-bit DWQ) | 4,02B | no disponible | 4,7% | 67,2% | Apache 2.0 | MLX, safetensors |
| Kanso Satori 1.0 (3-bit DWQ) | 4,02B | no disponible | 4,7% | 64,2% | Apache 2.0 | MLX |
| Kanso Koi 0.8 / v2.2 Lite (1,7B) | no disponible | no disponible | 5,5% | 65,8% | Apache 2.0 | MLX |
| Kanso Satori 0.9 / v3.1 (4B) | no disponible | no disponible | 13,3% | 49,8% | Apache 2.0 | MLX |

No se dispone de datos de benchmarks de modelos de terceros comparables en la informacion proporcionada; la comparativa se limita a las variantes de la propia familia Kanso.

## Limitaciones y advertencias

- Modelo de tarea unica: no es un asistente conversacional general ni un generador de codigo; usarlo fuera de la limpieza de dictado producira resultados pobres.
- Plantilla de chat obligatoria: debe usarse el `chat_template.jinja` incluido. Con la plantilla estandar de Qwen3-4B-Instruct-2507 el primer token es impredecible y las builds de menor precision degeneran en tokens `<tool_call>`.
- Idiomas: la model card no declara idiomas soportados y todos los ejemplos y benchmarks estan en ingles; el rendimiento en castellano no esta documentado.
- Contexto de entrenamiento limitado a 1.024 tokens y evaluaciones con maximos de 200 y 400 tokens de salida; no hay datos sobre dictados muy largos.
- Solo plataforma Apple: depende de MLX; no se documenta ruta de despliegue en CUDA, ROCm ni CPU generica.
- Riesgo de alucinacion: aunque la tarea es de transformacion, la reparacion gramatical y la normalizacion inversa pueden introducir cambios no deseados en el texto; el exact match del 67,2% en eval_v500 implica que un tercio de los dictados no se reproduce exactamente.
- Sesgos: no se documenta ninguna evaluacion de sesgos; al derivar de Qwen3-4B-Instruct-2507 puede heredar los sesgos del modelo base.
- Licencia Apache 2.0 permite uso comercial, pero la model card enlaza la licencia del modelo base Qwen3-4B-Instruct-2507, que conviene revisar antes de un despliegue en produccion.
- Cifras de rendimiento medidas exclusivamente en Apple M5; el throughput en otros chips Apple Silicon no esta publicado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BuilderHelm/Kanso-Satori-1.0
- Repositorio de archivos: https://huggingface.co/BuilderHelm/Kanso-Satori-1.0/tree/main
- Modelo base bf16: https://huggingface.co/BuilderHelm/Kanso-Satori-1.0-bf16
- Perfil del autor: https://huggingface.co/BuilderHelm
- Licencia del modelo base Qwen3-4B-Instruct-2507: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507/blob/main/LICENSE
- ZenVoice, pagina principal: https://getzenvoice.com
- ZenVoice para Mac, descarga: https://getzenvoice.com/download
