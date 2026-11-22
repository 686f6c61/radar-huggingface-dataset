# imYChaudhary22/zen-polish-v32-4bit

## Resumen

Kanso Satori 1.0 (publicado originalmente como ZenPolish v3.2 4B) es un modelo de 4.022 millones de parametros especializado en la mejora de dictado: recibe la salida cruda de un sistema de reconocimiento automatico del habla (ASR) y la convierte en texto escrito correcto. Desarrollado por BuilderHelm para la aplicacion ZenVoice, restaura puntuacion y mayusculas, elimina muletillas y falsos arranques, aplica normalizacion inversa de texto (numeros, fechas, horas, importes, correos, URL y telefonos) y repara la gramatica sin alterar el significado del hablante.

Tecnicamente es un fine-tuning LoRA (rango 32, alpha 64) sobre Qwen3-4B-Instruct-2507, con el adaptador fusionado en los pesos bf16 y posteriormente cuantizado a 4 bits mediante DWQ (distilled weight quantization), una tecnica que ajusta las escalas de cuantizacion para que la distribucion de tokens del modelo 4-bit coincida con la del bf16 sobre los prompts de entrenamiento. El resultado es un modelo plano, sin adaptador que cargar, de 2,26 GB, que corre integramente en dispositivo mediante MLX sobre Apple Silicon.

Su relevancia practica esta en el nicho: no compite como modelo de proposito general, sino como componente de un pipeline de dictado con latencia muy baja (unos 0,32 s por dictado y 47 tok/s en un Apple M5). La licencia Apache 2.0 y el formato MLX lo hacen directamente desplegable en aplicaciones macOS nativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen3-4B-Instruct-2507) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (entrenamiento con longitud maxima de 1.024 tokens) |
| Tipos de cuantizacion | 4-bit DWQ (distilled weight quantization); existe variante 3-bit DWQ del mismo autor |
| Idiomas soportados | No disponible (el entrenamiento y los benchmarks se centran en dictado en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), 2,26 GB |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B-Instruct-2507, un transformer decoder-only denso de 4B parametros, y se entrena con un adaptador LoRA de rango 32, alpha 64 y escala 2.0, con dropout 0.05, aplicado a las 36 capas y a todos los modulos lineales. El entrenamiento se ejecuto sobre `mlx-community/Qwen3-4B-Instruct-2507-4bit` en la revision `50d4277`, con un schedule de decaimiento coseno de 1e-4 a 1e-6 durante 3.400 pasos, batch de 2, 3.500 iteraciones, longitud maxima de 1.024 tokens y gradient checkpointing.

Tras fusionar el adaptador en los pesos bf16 (`Kanso-Satori-1.0-bf16`), los pesos se cuantizaron a 4 bits con DWQ: las escalas de cuantizacion se ajustan para que la distribucion de tokens del modelo cuantizado coincida con la del bf16 sobre los prompts de entrenamiento de Kanso. Segun el autor, el resultado es tan preciso como el modelo sin cuantizar. Una innovacion operativa relevante es el uso obligatorio de la plantilla `chat_template.jinja` incluida: el modelo se entreno con un bloque de pensamiento vacio (`<think>\n\n</think>\n\n`) al inicio de cada respuesta, y sin ese bloque el primer token se vuelve impredecible y las variantes de menor precision derivan hacia tokens de `<tool_call>`.

## Capacidades

- Limpieza de dictado: restauracion de puntuacion y mayusculas en texto proveniente de ASR.
- Eliminacion de muletillas, tanto al inicio como en medio de la frase, y de falsos arranques.
- Normalizacion inversa de texto: conversion de formas habladas a escritas de numeros, dinero, fechas, horas, porcentajes, correos electronicos, URL y telefonos.
- Reparacion gramatical que preserva el significado y las palabras del hablante.
- Adaptacion de mayusculas y tono al contexto de aplicacion indicado mediante una linea `app:` en el prompt de sistema.
- Generacion de texto conversacional (pipeline `text-generation`), heredada del modelo base.
- No se documenta soporte de tool calling, agentes, vision, audio ni modo de razonamiento extendido; el modo thinking se desactiva explicitamente en el uso previsto.

## Casos de uso

- Dictado en aplicaciones de productividad macOS: el modelo procesa la transcripcion cruda del ASR y devuelve texto listo para insertar en el editor, con una latencia media de 0,32 s por dictado y un pico de memoria de 2,65 GB, adecuado para ejecucion en dispositivo.
- Correos y mensajes profesionales: convierte "send it to john dot smith at example dot com by friday the twelfth" en "Send it to john.smith@example.com by Friday, the twelfth", restaurando correos, fechas y mayusculas sin intervencion del usuario.
- Notas de reunion y actas: con dictados de 50 a 99 palabras (WER del 10,3% y F1 de puntuacion de 0,815 en la evaluacion del autor), es adecuado para transcribir intervenciones y dejar el texto legible para su revision posterior.
- Normalizacion de importes y datos financieros dictados: restaura formas escritas de dinero, porcentajes y fechas, util en entornos de contabilidad o gestion donde el ASR crudo genera ambiguedad.
- Integracion en pipelines de ASR existentes: al ser un modelo plano sin adaptador y con plantilla de chat propia, puede encadenarse tras cualquier motor de reconocimiento de voz que emita texto sin formato.
- Aplicaciones de accesibilidad: asistencia a usuarios con movilidad reducida que dictan en lugar de teclear, con correccion gramatical y de puntuacion automatica en el propio dispositivo y sin enviar audio ni texto a la nube.
- Adaptacion por contexto de aplicacion: la linea `app:` del prompt de sistema permite ajustar tono y mayusculas segun la aplicacion destino (correo, chat, documento), lo que facilita un unico modelo para varios flujos de escritura.

## Benchmarks y rendimiento

Evaluacion con decodificacion greedy en Apple M5 con MLX 0.32.2, segun los datos publicados por el autor.

eval_v500: 500 dictados con control de fuga de datos, maximo 200 tokens.

| Metrica | v3.2 4-bit DWQ | v3.2 3-bit DWQ | v2.2 Lite (1.7B) | v3.1 (4B anterior) |
|---|---|---|---|---|
| WER | 4,7% | 4,7% | 5,5% | 13,3% |
| Exact match | 67,2% | 64,2% | 65,8% | 49,8% |
| F1 de puntuacion | 0,859 | 0,838 | 0,863 | 0,772 |
| Inicio de frase correcto | 95,1% | 93,4% | 94,4% | 82,3% |
| Pesos | 2,26 GB | 1,76 GB | 1,05 GB | 2,26 GB |
| Velocidad de decodificacion | 47 tok/s | 58 tok/s | 73 tok/s | 47 tok/s |

Datos retenidos de v2.2: 500 filas no usadas ni en entrenamiento ni en DWQ.

| Metrica | v3.2 4-bit DWQ | v3.2 3-bit DWQ | v2.2 Lite | v3.1 |
|---|---|---|---|---|
| WER | 8,0% | 9,0% | 8,9% | 26,9% |
| Exact match | 40,6% | 37,0% | 37,0% | 10,4% |

Dictados medios: 150 dictados de 50 a 99 palabras, maximo 400 tokens.

| Metrica | v3.2 4-bit DWQ | v3.2 3-bit DWQ | v2.2 Lite | v3.1 |
|---|---|---|---|---|
| WER | 10,3% | 15,1% | 11,0% | 13,9% |
| F1 de puntuacion | 0,815 | 0,796 | 0,795 | 0,695 |

En el runtime de la aplicacion ZenVoice (mlx-swift-lm, pipeline propio, eval_v500): WER del 3,9% y exact match del 64,6% (Lite: 4,0% y 65,4%), con 0,32 s de media por dictado, 2,65 GB de memoria pico y ningun dictado por encima del presupuesto de tiempo de la aplicacion. Frente a Lite, la ganancia de exact match del modelo 4-bit es de +3,6 puntos (IC 95%: +0,4 a +6,8).

## Requisitos de hardware

- VRAM/memoria unificada: 2,26 GB de pesos en 4-bit DWQ; pico de memoria medido de 2,65 GB en el pipeline de la aplicacion.
- GPU recomendadas: Apple Silicon con MLX (la libreria del modelo es `mlx`); el autor reporta 47 tok/s en un Apple M5.
- Cabe en GPU de consumo: si, en cualquier Mac con Apple Silicon con al menos 4 GB de memoria unificada disponible; no se documenta soporte CUDA ni ROCm para esta version.
- Opciones de despliegue: `mlx_lm` en Python y `mlx-swift-lm` en la aplicacion macOS. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 0,32 s de media por dictado y 47 tok/s de decodificacion en Apple M5; la variante 3-bit alcanza 58 tok/s y la 1.7B Lite, 73 tok/s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER (eval_v500) | Exact match | Licencia | Formato |
|---|---|---|---|---|---|---|
| Kanso Satori 1.0 4-bit DWQ | 4,02B | No disponible | 4,7% | 67,2% | Apache 2.0 | MLX safetensors |
| Kanso Satori 1.0 3-bit DWQ | 4,02B (3-bit) | No disponible | 4,7% | 64,2% | Apache 2.0 | MLX safetensors |
| Kanso Koi 1.0 (v2.2 Lite) | 1,7B | No disponible | 5,5% | 65,8% | Apache 2.0 | MLX safetensors |
| ZenPolish v3.1 (4B anterior) | 4B | No disponible | 13,3% | 49,8% | Apache 2.0 | MLX safetensors |

No se dispone de comparativas con modelos de limpieza de dictado de otros autores en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de nicho: esta especializado en limpieza de dictado en ingles; no es un modelo de proposito general y su rendimiento fuera de esa tarea no esta documentado.
- Idiomas soportados no disponibles: los benchmarks y el corpus de entrenamiento son en ingles, por lo que el comportamiento en castellano u otros idiomas no esta validado.
- Dependencia critica de la plantilla de chat: usar la plantilla incluida con el bloque `<think>` vacio al inicio de la respuesta; con la plantilla estandar de Qwen3-4B-Instruct-2507 el primer token se vuelve impredecible y las variantes de baja precision generan tokens de `<tool_call>`.
- Riesgo de alucinacion: no se documenta una evaluacion especifica; al tratarse de un modelo generativo que reescribe texto, existe riesgo de alterar el contenido dictado, aunque el entrenamiento busca preservar el significado y las palabras del hablante.
- Sesgos: no se documenta ninguna evaluacion de sesgos en la informacion disponible.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la licencia enlazada corresponde a Qwen3-4B-Instruct-2507, por lo que conviene revisar las condiciones del modelo base.
- Dependencia de plataforma: los pesos estan en formato MLX y la libreria declarada es `mlx`; no se documenta soporte para CUDA, ROCm ni motores de inferencia habituales en servidor (vLLM, TGI, llama.cpp).
- Sin datos de contexto maximo: solo se conoce la longitud maxima de entrenamiento (1.024 tokens), no la ventana de contexto efectiva del modelo.
- Repositorio con 0 likes y 572 descargas: ecosistema pequeno, sin validacion independiente conocida de los benchmarks reportados por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/imYChaudhary22/zen-polish-v32-4bit
- Modelo base bf16: https://huggingface.co/BuilderHelm/Kanso-Satori-1.0-bf16
- Organizacion BuilderHelm en Hugging Face: https://huggingface.co/BuilderHelm
- Pagina de ZenVoice: https://getzenvoice.com
- Descarga de ZenVoice para Mac: https://getzenvoice.com/download
- Licencia del modelo base (Qwen3-4B-Instruct-2507): https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507/blob/main/LICENSE
