# RalphLabsAI/ralph-crowns

## Resumen

Ralph crowns es una colección de cuatro archivos GGUF que contienen versiones comprimidas mediante cuantización extrema del modelo Qwen3-8B, publicadas por RalphLabsAI en el contexto de Ralph, un torneo abierto de compresión de modelos que se ejecuta sobre la subred 40 de Bittensor. El objetivo del proyecto es reducir un transformer de 8.190.735.360 parámetros a ficheros de entre 1,16 GB y 4,61 GB manteniendo la misma arquitectura admitida, de modo que el modelo pueda ejecutarse en dispositivos con recursos muy limitados, como teléfonos móviles. Cada fichero corresponde a un "crown" (campeón) de una categoría de bits por peso: binary (1,0 bits/peso), ternary (1,7488), sub2 (2,2626) y sub4 (4,0).

La relevancia del artefacto es doble. Por un lado, demuestra hasta dónde se puede llevar la compresión de un modelo de 8B sin cambiar su estructura de parámetros, con resultados verificados en iPhones físicos mediante el runtime Metal de llama.cpp. Por otro, expone un mecanismo de publicación reproducible: cada fichero incluye tamaño exacto, SHA-256, ronda del torneo en la que fue coronado, constructor de origen y declaración de licencia a nivel de artefacto, lo que permite auditar los bytes descargados.

No obstante, conviene subrayar que "el mismo modelo" significa aquí la misma arquitectura y estructura de parámetros, no pesos idénticos ni comportamiento equivalente garantizado. Los pesos han sido reentrenados o ajustados por los participantes del torneo, y la retención declarada en el punto de coronación oscila entre 0,2636 y 0,3209, lo que indica una pérdida de calidad sustancial respecto al Qwen3-8B original. La licencia del repositorio figura como "artifact-license-pending", aunque la model card declara apache-2.0 para tres de los cuatro ficheros y revisión pendiente para el ternary.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-8B), cuantización extrema por tiers de bits |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen3-8B soporta contexto largo, pero la ficha no lo confirma para estos artefactos) |
| Tipos de cuantizacion | GGUF con 1,0 / 1,7488 / 2,2626 / 4,0 bits por peso (binary, ternary, sub2, sub4) |
| Idiomas soportados | no disponible |
| Licencia | artifact-license-pending en el repositorio; apache-2.0 declarada para binary, sub2 y sub4; ternary en revisión pendiente |
| Formato de pesos | GGUF (4 ficheros: 1,16 GB, 2,51 GB, 2,94 GB y 4,61 GB) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-8B, un transformer denso de 8.190.735.360 parámetros. Sobre esa base, Ralph aplica un proceso de compresión por cuantización de muy baja precisión que va más allá de los esquemas habituales de GGUF (Q4_K_M, Q5_K_M, Q8_0): los tiers publicados van de 1,0 a 4,0 bits por peso, lo que implica representaciones binarias, ternarias y sub-2/sub-4 bits. Los ficheros no son meras conversiones de los pesos originales, sino artefactos producidos por los constructores participantes en el torneo (ArizonaZZZ, betaprogramming, boweizh1204) y puntuados en rondas sucesivas; la columna "retention at crown" refleja la métrica de retención obtenida en el momento de la coronación.

La información disponible no detalla el dataset de entrenamiento, el número de tokens, ni si hubo RLHF o DPO en el proceso de compresión. Tampoco se especifica qué técnica concreta de cuantización (GPTQ, AWQ, QAT, cuantización post-entrenamiento con calibración) empleó cada constructor. Lo que sí se documenta es el mecanismo de verificación: hashes SHA-256 por fichero, un `crowns.json` legible por máquina, registro de rondas en el dataset `ralph-v2-rounds` y pruebas en dispositivos físicos con capturas y checksums publicados. Tres de los cuatro ficheros incluyen la clave de plantilla de chat embebida, lo que permite usar `llama-cli --jinja` directamente.

## Capacidades

- Generación de texto conversacional en formato chat, con plantilla embebida en los ficheros ternary, sub2 y sub4.
- Razonamiento y respuesta a instrucciones heredados del modelo base Qwen3-8B, aunque con degradación esperable por la compresión extrema.
- Ejecución local en dispositivos móviles mediante llama.cpp con backend Metal, validada en iPhones físicos.
- Compatibilidad con endpoints y runtimes estándar de GGUF (llama.cpp, y por extensión ecosistemas que consumen GGUF).
- Integración con la aplicación PocketPal para iOS mediante búsqueda directa en Hugging Face.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking en la información proporcionada; dado que el modelo base Qwen3-8B las soporta parcialmente, su presencia en estos artefactos comprimidos no está confirmada.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Inferencia en teléfono móvil sin conexión: el fichero sub2 de 2,94 GB se ha ejecutado en iPhones 15, 16, 17 y 17 Pro Max con PocketPal y llama.cpp Metal, obteniendo entre 10,58 y 18,54 tok/s. Es adecuado para asistentes locales de chat con contexto corto (2.048 tokens en las pruebas).
- Prototipado de aplicaciones móviles con LLM: permite validar una UX conversacional en iOS real antes de decidir si se migra a un modelo mayor o a un servicio en la nube, con la ventaja de que el fichero binary de 1,16 GB reduce el peso de la descarga inicial.
- Investigación en compresión de modelos: los cuatro tiers permiten estudiar la curva calidad-tamaño de un mismo transformer (1,0 / 1,7488 / 2,2626 / 4,0 bits por peso) con artefactos auditables y hashes públicos, útil para papers sobre cuantización extrema.
- Evaluación de robustez en entornos con memoria ajustada: las pruebas documentadas muestran que los dispositivos cargan el modelo pese a la advertencia "Memory tight" de PocketPal, lo que sirve para estudiar comportamiento en condiciones de RAM límite.
- Despliegue en hardware embebido o edge con poca VRAM: el fichero ternary de 2,51 GB o el binary de 1,16 GB pueden caber en GPUs de gama baja y en placas con memoria unificada, para tareas de clasificación, resumen corto o generación de texto acotada.
- Docencia y demostraciones de cuantización: el repositorio incluye checksums, registro de rondas y recibos de dispositivos, lo que facilita explicar en clase cómo se audita un artefacto comprimido y qué significa "misma arquitectura, distintos pesos".
- Verificación de cadena de suministro de modelos: el uso de `crowns.json`, SHA-256 y declaraciones de licencia por fichero sirve como ejemplo práctico de publicación reproducible de pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los únicos datos de rendimiento son medidas de throughput y TTFT en dispositivos físicos con PocketPal 1.17.3, contexto 2.048 y prompt fijo:

| Dispositivo | SO | Throughput | TTFT |
|---|---|---:|---:|
| iPhone 15 | iOS 26.6 | 10,58 tok/s | 838 ms |
| iPhone 16 | iOS 18.6 | 12,36 tok/s | 439 ms |
| iPhone 17 | iOS 26.6 | 16,77 tok/s | 427 ms |
| iPhone 17 Pro Max | iOS 26.6 | 18,54 tok/s | 400 ms |

Estas cifras corresponden al fichero sub2 (2,94 GB) y fueron obtenidas por el propio equipo de Ralph en dispositivos BrowserStack; el aviso de la model card indica que el re-firmado de BrowserStack elimina ciertos entitlements de memoria, por lo que no constituyen una certificación de compatibilidad universal ni de calidad amplia.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente el tamaño del fichero más overhead del runtime. Binary ~1,16 GB, ternary ~2,51 GB, sub2 ~2,94 GB, sub4 ~4,61 GB. En la práctica, añadir entre 0,5 y 1,5 GB para KV cache y buffers según contexto.
- GPU recomendadas: para el tier sub4, una RTX 4090 (24 GB) o A100/H100 sobran; para sub2 y ternary basta una RTX 3060 de 12 GB o incluso GPUs de 8 GB. El tier binary puede ejecutarse en iGPU y en memoria unificada de Apple Silicon.
- Cabe en GPU de consumo: sí, los cuatro tiers caben en GPUs consumer de 8 GB o más; el binary y el ternary caben incluso en equipos de 4-6 GB con contexto reducido.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server) con `--jinja` para los ficheros con plantilla embebida; PocketPal en iOS; cualquier runtime compatible con GGUF. No se documenta soporte de vLLM ni TGI en la información disponible.
- Latencia y throughput: en iPhone 17 Pro Max, 18,54 tok/s y 400 ms de TTFT con contexto 2.048. En GPU de escritorio se espera un throughput muy superior, pero no se proporcionan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Ralph crowns (sub2) | 8,19 B (comprimido a 2,94 GB) | no disponible | apache-2.0 (artefacto) | GGUF | Retención 0,2825 en el punto de coronación; validado en iPhone |
| Qwen3-8B original | 8,19 B | no disponible en esta ficha | según Qwen3-8B | safetensors, GGUF | Referencia de calidad; requiere ~16 GB en FP16 |
| Llama 3.1 8B | 8 B | 128k (según su model card) | Llama 3.1 Community License | safetensors, GGUF | Alternativa densa de tamaño similar, sin compresión extrema |
| Gemma 2 9B | 9 B | 8k (según su model card) | Gemma Terms of Use | safetensors, GGUF | Alternativa densa con licencia no permisiva |

La comparación directa de rendimiento no es posible porque Ralph crowns no publica MMLU, HumanEval ni GSM8K. La diferencia clave frente a los modelos originales es el tamaño en disco y la posibilidad de ejecución móvil, a costa de una retención declarada baja (0,26-0,32), lo que sugiere degradación notable en tareas que exijan precisión.

## Limitaciones y advertencias

- Los pesos no son idénticos a Qwen3-8B: "mismo modelo" se refiere a arquitectura y estructura de parámetros, no a comportamiento equivalente. La retención en el punto de coronación es de 0,2636 a 0,3209, lo que anticipa pérdida de calidad significativa.
- La licencia del repositorio es "artifact-license-pending"; solo tres ficheros tienen apache-2.0 declarada a nivel de artefacto y el ternary está en revisión. Antes de uso comercial hay que verificar la licencia de cada byte concreto.
- No se documentan idiomas soportados ni evaluación multilingüe; el comportamiento fuera del inglés es incierto.
- No hay benchmarks estándar publicados, por lo que no se puede comparar rigurosamente con el modelo base ni con alternativas.
- Las pruebas en iPhone se hicieron con contexto 2.048 y prompt fijo; no validan contextos largos ni conversaciones multi-turno extensas.
- Todos los dispositivos mostraron la advertencia "Memory tight" de PocketPal; en dispositivos con menos RAM el fallo de carga es plausible.
- El re-firmado de BrowserStack elimina entitlements de memoria, por lo que los resultados no certifican compatibilidad con la App Store ni funcionamiento offline universal.
- Riesgo de alucinación y de degradación en razonamiento matemático y código, esperable en cuantizaciones de 1-4 bits por peso.
- No se documenta soporte de tool calling, agentes ni modo thinking en estos artefactos, aunque el modelo base los tenga.
- El proyecto depende de un torneo en Bittensor SN40; los ficheros pueden cambiar de "crown" en rondas futuras, por lo que conviene fijar el SHA-256 en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/RalphLabsAI/ralph-crowns
- Discusión del Device Lab: https://huggingface.co/RalphLabsAI/ralph-crowns/discussions/3
- Dataset de recibos de dispositivos: https://huggingface.co/datasets/RalphLabsAI/ralph-device-lab
- Vídeo de la matriz de cuatro iPhones: https://huggingface.co/datasets/RalphLabsAI/ralph-device-lab/resolve/7f5f1cfbf7882726a6c55a1d9b2f7c0ff06b3da8/social/ralph-sub2-four-physical-iphones-horizontal.mp4
- Checksums del payload: https://huggingface.co/datasets/RalphLabsAI/ralph-device-lab/blob/7f5f1cfbf7882726a6c55a1d9b2f7c0ff06b3da8/SHA256SUMS
- Registro de la ronda 9: https://huggingface.co/datasets/RalphLabsAI/ralph-v2-rounds/resolve/main/rounds/round-00000009-ceabcb487af124ac.json
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Repositorio GitHub de Ralph: https://github.com/RalphLabsAI/ralph
- Banner del proyecto: https://raw.githubusercontent.com/RalphLabsAI/ralph/main/docs/assets/ralph-banner.png
