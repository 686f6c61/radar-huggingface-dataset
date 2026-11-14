# litert-community/granite-4.1-8b

## Resumen

Granite-4.1-8B en formato LiteRT-LM es la conversión on-device del modelo instruct denso `ibm-granite/granite-4.1-8b` de IBM, empaquetada por la comunidad `litert-community` para el runtime LiteRT-LM de Google (antes TensorFlow Lite). El paquete distribuye dos ficheros `.litertlm` —uno int8 y otro int4— que incorporan el grafo GPU-composite y están pensados para ejecución local en dispositivos edge: móviles Android, portátiles Apple Silicon y estaciones de trabajo sin GPU de datacenter. Resuelve el problema de llevar un LLM de 8B con contexto largo y alineación para tool calling a hardware de consumo, sacrificando ventana de contexto (4096 tokens en estos ficheros frente a los 128K del modelo original) a cambio de latencias interactivas.

El modelo base es un transformer decoder-only denso con GQA, RoPE, SwiGLU, RMSNorm y embeddings de entrada/salida compartidos: 40 capas, hidden size 4096, 32 cabezas de atención con 8 KV heads y vocabulario de 100.352 tokens. IBM lo entrenó mediante supervised fine-tuning sobre datasets de instrucciones abiertos y datos sintéticos internos, seguido de alineación con aprendizaje por refuerzo para tool calling, seguimiento de instrucciones y chat, con publicación el 29 de abril de 2026. La conversión se realizó con litert-torch 0.9.4 y se validó contra litert-lm 0.18.0.

La relevancia actual viene de que es una de las pocas conversiones LiteRT-LM de un modelo de 8B con licencia Apache 2.0 y alineación específica para function calling, con métricas de rendimiento publicadas tanto en Mac Studio M4 Max (58,3 tok/s en GPU con int4) como en Galaxy S26 (5,3–5,4 tok/s en GPU). El repo ocupa 28,2 GB y acumula 372 descargas desde su creación en octubre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (GQA, RoPE, SwiGLU, RMSNorm, embeddings entrada/salida atados) |
| Parametros totales | 8.791.592.960 en bf16 (8,38 B sin la copia almacenada de la tabla de salida atada) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 4096 tokens en los ficheros LiteRT-LM (128K en el modelo base IBM) |
| Tipos de cuantizacion | int8 dynamic en capas lineales con activaciones float; int4 blockwise-32 + OCTAV en lineales con embedding int8 |
| Idiomas soportados | 12 idiomas segun IBM (de ingles a chino); lista concreta no disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); pesos originales en safetensors en el repo base de IBM |

## Arquitectura y entrenamiento

El modelo base sigue una arquitectura transformer decoder-only densa con 40 capas, hidden size 4096, 32 cabezas de atención y 8 KV heads (GQA, ratio 4:1), RoPE para codificación posicional, SwiGLU en las MLP y RMSNorm. El vocabulario de 100.352 tokens usa embeddings de entrada y salida atados, lo que explica la diferencia entre los 8.791.592.960 parámetros contados por el Hub (incluye una copia almacenada de la tabla de salida) y los 8,38 B efectivos. IBM entrenó el base con supervised fine-tuning sobre datasets de instrucciones abiertos más datos sintéticos internos, y después aplicó alineación por aprendizaje por refuerzo orientada a tool calling, instruction following y chat.

La conversión a LiteRT-LM introduce dos optimizaciones técnicas destacables. Primero, el grafo GPU-composite: las 7 firmas de decoder de ambos ficheros se delegan completamente al delegate GPU (OpenCL en Android, Metal en macOS), con las firmas de embedding de 4 operaciones ejecutándose en CPU. Segundo, la receta de cuantización int4 usa bloques de 32 elementos más OCTAV sobre las capas lineales, mientras la tabla de embedding se almacena en int8 y en una sección separada del fichero (419.484.080 bytes), lo que permite cargarla independientemente y mantener el fichero principal por debajo de límites prácticos de memoria. Los ficheros declaran activaciones fp16 por defecto; forzar fp32 en int8 mantiene la corrección pero ralentiza un 15 %.

## Capacidades

- Generación de texto e instrucciones multi-turno en contexto largo (hasta 4096 tokens en estos ficheros).
- Razonamiento aritmético y matemático de varios pasos (GSM8K con formato `#### <número>`).
- Tool calling y function calling, alineados explícitamente por IBM mediante RL.
- Seguimiento de instrucciones y formato de chat con plantilla del bundle (sin turno de sistema).
- Extracción de información estructurada (fechas, entidades) desde texto libre.
- Conversación multi-turno con memoria de turnos previos verificada en pruebas de tres turnos.
- Generación de salida larga sin repetición de frases (verificado hasta 512 tokens).
- Capacidades multilingües limitadas a los 12 idiomas declarados por IBM (lista concreta no disponible).
- No incluye visión, audio ni modo thinking extendido según la información disponible.

## Casos de uso

- Asistente de extracción de datos en móvil: el modelo responde a prompts como extraer fechas o entidades de un texto, ejecutándose localmente en un Galaxy S26 a 5,3–5,4 tok/s en GPU, sin enviar datos a la nube y cumpliendo requisitos de privacidad.
- Chatbot de atención al cliente on-device: con 4096 tokens de contexto puede sostener conversaciones multi-turno (verificado en pruebas de tres turnos) manteniendo coherencia entre turnos y sin coste de inferencia por servidor.
- Automatización de respuestas aritméticas en apps educativas: GSM8K con 93–95 puntos en int4/int8 permite resolver problemas de matemáticas de primaria/secundaria en el dispositivo, con formato de respuesta controlado por plantilla.
- Agente local con tool calling en pipelines de automatización personal: la alineación RL para function calling permite invocar APIs locales (calendario, ficheros, domótica) desde un móvil o portátil sin depender de conectividad.
- Prototipado rápido en Mac Studio o portátil Apple Silicon: 58,3 tok/s en GPU con int4 y 5,81 s para prefill de 1024 tokens más 256 decodificados a contexto 2048 hacen viable iterar sobre prompts y evaluar calidad antes de desplegar en servidor.
- Procesamiento de documentos en edge con ventana de 4096 tokens: resumen, clasificación y extracción de campos sobre fragmentos de texto en dispositivos sin GPU dedicada, usando el fichero int4 de 5,15 GB como opción de menor huella.
- Evaluación de calidad de cuantización en CI: los scripts de verificación publicados (8 preguntas con `--temperature 0`) permiten integrar comprobaciones de regresión de calidad en pipelines de conversión de modelos.

## Benchmarks y rendimiento

Resultados publicados por el autor de la conversión. Las puntuaciones GSM8K son comparables solo dentro de esta tabla; no son equiparables al 92,49 de IBM (8-shot, distinto setup de prompt). IFEval no se ejecutó para este modelo.

| Configuracion | GSM8K (n=100) |
|---|---|
| bf16 referencia (transformers, MPS) | 96 |
| int8, litert-lm Mac GPU | 95 |
| int4, litert-lm Mac GPU | 93 |

Rendimiento medido (prefill de 1024 tokens más 256 tokens decodificados, contexto 2048):

| Configuracion | Mac M4 Max | Galaxy S26 | Pixel 8a |
|---|---|---|---|
| int4 GPU | 5,81 s | 58,7 s y 59,6 s (dos ejecuciones) | detenido por regla de memoria |
| int8 GPU | 6,98 s | no ejecutado | no ejecutado (fichero mayor que RAM del movil) |
| int8 CPU | 35,3 s | no ejecutado | no ejecutado |
| int4 CPU | 41,8 s | no ejecutado | no ejecutado |

Throughput de decodificación: 58,3 tok/s en Mac Studio M4 Max GPU con int4; 5,3–5,4 tok/s en Galaxy S26 GPU con int4. Corrección: 8/8 en las 8 preguntas de verificación para int8 e int4 en CPU y GPU, igual que bf16.

## Requisitos de hardware

- VRAM/memoria estimada: int8 ocupa 8,95 GB (8.949.972.992 bytes) y int4 5,15 GB (5.152.096.256 bytes) en disco; en ejecución hay que sumar activaciones fp16 y overhead del runtime.
- GPU recomendadas: Apple Silicon (M4 Max validado), GPU Android con delegate OpenCL (Galaxy S26 validado); GPUs de datacenter (A100, H100, RTX 4090) no están documentadas para este runtime en la información disponible.
- Cabe en consumer GPU: sí en Apple Silicon de gama alta con int4; en móvil Android de gama alta con int4 (Galaxy S26); Pixel 8a no puede con ninguno de los dos ficheros según la regla de memoria del autor (int8 supera la RAM del dispositivo).
- iOS: no medido; ambas secciones principales de pesos superan 2 GiB (int8 7,94 GiB, int4 4,41 GiB), lo que bloquea la carga según la explicación en la ficha de `granite-4.1-3b`.
- Opciones de despliegue: runtime LiteRT-LM 0.18.0 (Python API y binario Android precompilado); conversión reproducible con litert-torch 0.9.4. vLLM, llama.cpp, Ollama y TGI no aplican a este formato.
- Latencia y throughput: ver tabla de rendimiento; int4 es más rápido en las dos GPUs medidas, mientras en CPU de Mac int8 supera a int4 (prefill el doble más rápido).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Rendimiento publicado |
|---|---|---|---|---|---|
| granite-4.1-8b (esta ficha) | 8,79 B (8,38 B efectivos) | 4096 (128K en base) | `.litertlm` / LiteRT-LM | Apache 2.0 | GSM8K 93–96 (n=100) |
| ibm-granite/granite-4.1-8b (base) | 8,79 B | 128K | safetensors / transformers | Apache 2.0 | GSM8K 92,49 (8-shot, IBM) |
| litert-community/granite-4.1-3b | no disponible en esta informacion | no disponible | `.litertlm` / LiteRT-LM | Apache 2.0 | no disponible |
| Otras conversiones LiteRT-LM de 8B | no disponible | no disponible | `.litertlm` | no disponible | no disponible |

## Limitaciones y advertencias

- Ventana de contexto reducida a 4096 tokens frente a los 128K del modelo base; no apta para documentos largos o conversaciones extensas.
- IFEval no fue evaluado por el autor de la conversión, por lo que la calidad de seguimiento de instrucciones no está cuantificada para estos ficheros.
- GSM8K pierde 3 puntos en int4 y 1 punto en int8 respecto a bf16; toda pérdida se concentra en preguntas que bf16 acierta, sin errores nuevos introducidos por la cuantización.
- Sesgos conocidos del modelo base IBM no están documentados en la información disponible; al ser un instruct model entrenado con datos sintéticos internos, existe riesgo de alucinación no mitigado por la conversión.
- El fichero int8 no cabe en móviles con menos RAM que el Pixel 8a según la regla del autor, y ninguno de los dos ficheros es cargable en iOS por el límite de 2 GiB por sección.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar los términos del modelo base IBM y las dependencias del runtime LiteRT-LM antes de producción.
- La plantilla del bundle no incluye turno de sistema; prompts que dependan de instrucciones de sistema pueden comportarse distinto que en transformers.
- Las activaciones fp16 por defecto pueden afectar reproducibilidad numérica frente a bf16; declarar fp32 en int8 mantiene la corrección pero cuesta un 15 % de velocidad.

## Enlaces

- Hugging Face (esta conversión): https://huggingface.co/litert-community/granite-4.1-8b
- Modelo base IBM: https://huggingface.co/ibm-granite/granite-4.1-8b
- Conversión hermana de 3B: https://huggingface.co/litert-community/granite-4.1-3b
- Runtime LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM
- Script de verificación de calidad: https://github.com/john-rocky/hf-to-litertlm/blob/main/scripts/verify_quality.py
