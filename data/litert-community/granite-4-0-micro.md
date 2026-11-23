# litert-community/granite-4.0-micro

## Resumen

Granite-4.0-Micro en formato LiteRT-LM es una conversión del modelo `ibm-granite/granite-4.0-micro` de IBM al formato `.litertlm` propietario del runtime LiteRT-LM de Google, orientado a inferencia en dispositivo (on-device) y entornos edge. El modelo original es un transformer decoder-only denso de 3.402.836.480 parámetros, diseñado para instrucciones y uso de herramientas (tool calling), pensado para asistentes y agentes que invocan funciones. Esta conversión, publicada por el colectivo `litert-community`, empaqueta los pesos en dos variantes cuantizadas (int8 e int4) listas para ejecutarse en CPU y GPU de dispositivos móviles y portátiles.

La relevancia de esta ficha radica en que permite ejecutar un modelo de 3B parámetros con contexto largo en hardware de consumo, incluyendo teléfonos Android (Pixel 8a, Galaxy S26) y Macs con Apple Silicon (M4 Max). El modelo original soporta 128K tokens de contexto, aunque los ficheros LiteRT-LM publicados limitan la ventana a 4096 tokens. IBM lista doce idiomas soportados, desde inglés hasta chino.

La conversión mantiene la licencia Apache 2.0 del modelo base y ofrece dos recetas de cuantización con grafos GPU-composite, lo que permite delegar las 7 firmas del decodificador al acelerador OpenCL en Android y a Metal en macOS. Es una opción práctica para desarrolladores que necesitan desplegar un LLM competente en razonamiento y matemáticas sin depender de la nube.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (GQA, RoPE, SwiGLU, RMSNorm) |
| Parámetros totales | 3.402.836.480 |
| Parámetros activos | No aplica (modelo denso; publicado bajo clase hybrid-MoE con 40 capas de atención y 0 expertos) |
| Longitud de contexto | 4096 tokens en estos ficheros (128K en el modelo base IBM) |
| Tipos de cuantización | int8 dinámica en lineales con activaciones float; int4 blockwise-32 + OCTAV en lineales con embedding int8 |
| Idiomas soportados | 12 idiomas según IBM (desde inglés hasta chino); lista concreta no disponible en la información proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); dos ficheros: int8 (3,77 GB) e int4 (2,20 GB) |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only denso con 40 capas, tamaño oculto de 2560, 40 cabezas de atención con 8 cabezas KV (GQA), vocabulario de 100.352 tokens con embeddings atados y RoPE, SwiGLU y RMSNorm. IBM lo describe como un modelo instruct de contexto largo afinado a partir de Granite-4.0-Micro-Base, con mejora en seguimiento de instrucciones y tool calling. El checkpoint se publicó bajo la clase hybrid-MoE con 40 capas de atención y sin expertos; fue reescrito a la clase plana Granite antes de la exportación, sin cambios en los pesos.

La información proporcionada no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base. La conversión a LiteRT-LM aplica cuantización post-entrenamiento: int8 dinámica en las capas lineales con activaciones float, e int4 blockwise de tamaño 32 con OCTAV en las lineales y embedding en int8. Ambos ficheros incluyen un grafo GPU-composite que permite delegar las 7 firmas del decodificador al acelerador (OpenCL en Android, Metal en Mac) sin errores de validación. La tabla de embeddings se separa en su propia sección de 265.343.328 bytes.

## Capacidades

- Generación de texto y razonamiento de propósito general en un modelo de 3B parámetros.
- Razonamiento matemático: obtiene 84-90 en GSM8K (n=100) según configuración, con precisión cercana a la referencia bf16 (86).
- Seguimiento de instrucciones mejorado respecto al modelo base, según IBM.
- Tool calling / function calling: capacidad destacada por IBM para asistentes y agentes que usan herramientas.
- Conversaciones multi-turno: verificadas en CPU y GPU con tres turnos y conteo de tokens consistente con transformers.
- Capacidades multilingües: 12 idiomas según IBM (lista concreta no disponible).
- Extracción de información estructurada (fechas, entidades) mediante prompts directos.
- Ejecución on-device en CPU y GPU de dispositivos Android y macOS.
- No se menciona soporte de visión, audio ni modo thinking explícito en la información disponible.

## Casos de uso

- Asistentes on-device en Android: el fichero int4 (2,20 GB) cabe en la memoria de un Pixel 8a y responde en 47,92 s para 1024 tokens de prefill más 256 de decodificación en GPU, lo que permite asistentes locales sin conexión para consultas cortas y extracción de datos.
- Extracción de información estructurada en el dispositivo: el modelo responde correctamente a prompts como "Extract the dates from: The meeting moved from May 3 to May 17", adecuado para procesar correos o notas localmente sin enviar datos a la nube.
- Agentes con tool calling en edge: IBM lo diseñó para agentes que invocan funciones; puede integrarse en apps móviles que necesiten llamar a APIs locales (calendario, contactos) con bajo consumo de recursos.
- Procesamiento por lotes en Mac con Apple Silicon: en un M4 Max, el fichero int4 completa la carga de trabajo de referencia en 3,04 s en GPU, lo que permite pipelines de evaluación o generación masiva en portátiles.
- Atención al cliente embebida: con contexto de 4096 tokens y conversaciones multi-turno verificadas, puede gestionar diálogos de soporte en aplicaciones sin backend.
- Prototipado rápido de aplicaciones LLM: el runtime `litert-lm` con un solo comando (`litert-lm run`) permite probar prompts y validar calidad antes de invertir en infraestructura mayor.
- Investigación en eficiencia de cuantización: las dos recetas (int8 e int4) con métricas de precisión y latencia publicadas sirven para estudiar el compromiso entre tamaño, velocidad y exactitud en hardware móvil.

## Benchmarks y rendimiento

GSM8K (preguntas 0-99, instrucción paso a paso, greedy, máximo 1024 tokens de salida, proceso nuevo por pregunta, litert-lm 0.18.0):

| Configuración | GSM8K (n=100) |
|---|---|
| bf16 referencia (transformers, MPS) | 86 |
| int8, litert-lm CPU | 84 |
| int8, litert-lm Mac GPU | 90 |
| int4, litert-lm Mac GPU | 84 |

Tiempo para 1024 tokens de prefill más 256 de decodificación a contexto 2048 (segundos):

| Configuración | Mac M4 Max | Galaxy S26 | Pixel 8a |
|---|---|---|---|
| int4 GPU | 3,04 | 16,70 | 47,92 |
| int8 GPU | 3,61 | 21,83 | no disponible |
| int8 CPU | 17,30 | 42,25 | 157,45 |
| int4 CPU | 20,84 | 46,03 | 167,05 |

El grafo composite reduce el tiempo un 17 % (int4) y un 16 % (int8) en GPU de Mac, y un 13 % (int4) en GPU de Galaxy S26, respecto a los ficheros del 2026-10-13. En Pixel 8a GPU el tiempo es prácticamente igual (dentro del 2 % en la media). IFEval-lite no se ejecutó para este modelo. Las puntuaciones solo son comparables dentro de esta tabla, no con el 85,45 de IBM (protocolo de 8 disparos distinto).

## Requisitos de hardware

- VRAM/memoria estimada: int8 requiere ~3,77 GB de almacenamiento y memoria para pesos; int4 requiere ~2,20 GB (41,7 % menos).
- GPU recomendadas: Apple M4 Max (Metal), GPU de Galaxy S26 (OpenCL), GPU de Pixel 8a (OpenCL). No se proporcionan datos para A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: sí, en móviles de gama alta (Pixel 8a, Galaxy S26) y en Mac con Apple Silicon; no hay datos para GPUs de escritorio NVIDIA.
- Opciones de despliegue: runtime LiteRT-LM (`litert-lm run`, versión 0.18.0 probada); binario Android precompilado de LiteRT-LM. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia: en Mac M4 Max GPU, 3,04 s (int4) y 3,61 s (int8) para la carga de referencia; en Pixel 8a GPU, 47,92 s (int4) y 167,05 s en CPU (int4); en Galaxy S26 GPU, 16,70 s (int4).
- Nota iOS: no medido; la sección principal de pesos del fichero int8 supera los 2 GiB, lo que impide su uso en iOS según la explicación del card de `granite-4.1-3b`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | GSM8K (n=100) | Licencia | Formato |
|---|---|---|---|---|---|
| granite-4.0-micro (LiteRT-LM, int4) | 3,4B | 4096 | 84 (GPU) | Apache 2.0 | `.litertlm` |
| granite-4.0-micro (LiteRT-LM, int8) | 3,4B | 4096 | 90 (GPU) / 84 (CPU) | Apache 2.0 | `.litertlm` |
| granite-4.0-micro (IBM, bf16) | 3,4B | 128K | 86 (referencia) / 85,45 (IBM, 8-shot) | Apache 2.0 | safetensors |
| granite-4.1-3b (LiteRT-LM) | no disponible | no disponible | no disponible | no disponible | `.litertlm` |

No se dispone de datos de benchmarks de otras alternativas de 3B en formato on-device en la información proporcionada; la comparación con modelos como Llama 3.2 3B o Qwen2.5 3B no está disponible en esta ficha.

## Limitaciones y advertencias

- Contexto reducido: los ficheros LiteRT-LM limitan la ventana a 4096 tokens, frente a los 128K del modelo base IBM; esto restringe casos de uso que requieran contexto largo.
- Riesgo de alucinación: no se han publicado evaluaciones de veracidad ni de sesgos en la información disponible; como todo LLM de 3B, puede generar afirmaciones incorrectas con seguridad.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Idiomas: IBM lista 12 idiomas, pero la lista concreta y la calidad por idioma no están disponibles; el rendimiento fuera del inglés no está verificado en esta conversión.
- Licencia Apache 2.0: permite uso comercial, pero debe conservarse el aviso de licencia y atribución correspondiente.
- Compatibilidad iOS: el fichero int8 no es apto para iOS por superar los 2 GiB en su sección principal de pesos; el int4 podría serlo, pero no se ha medido.
- Precisión dependiente de la cuantización: int4 pierde 2 puntos en GSM8K en GPU frente a int8 (84 vs 90); en CPU ambos empatan en 84.
- Runtime específico: requiere LiteRT-LM 0.18.0 o compatible; no es directamente utilizable en vLLM, llama.cpp u otros motores sin conversión adicional.
- IFEval-lite no ejecutado: no hay datos de seguimiento de instrucciones en esta conversión.

## Enlaces

- Hugging Face: https://huggingface.co/litert-community/granite-4.0-micro
- Modelo base: https://huggingface.co/ibm-granite/granite-4.0-micro
- Runtime LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM
- Conversión relacionada granite-4.1-3b: https://huggingface.co/litert-community/granite-4.1-3b
- Script de verificación de calidad: https://github.com/john-rocky/hf-to-litertlm/blob/main/scripts/verify_quality.py
