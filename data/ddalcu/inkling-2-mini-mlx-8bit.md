# ddalcu/Inkling-2-Mini-MLX-8bit

## Resumen

Inkling 2 Mini MLX 8-bit es una cuantización para Apple Silicon del modelo multimodal Inkling 2 Mini, desarrollado originalmente por Thinking Machines. Se trata de un transformer de tipo mixture-of-experts (MoE) con arquitectura de decodificación especulativa integrada, que procesa tanto texto como imágenes (pipeline image-text-to-text). El pack lo publica ddalcu dentro del ecosistema mlx-serve y mlx-lm, y está pensado para ejecución local en Macs con chip de la serie M.

El modelo base declara 26.400 millones de parámetros totales con 3.400 millones activos por token, lo que lo sitúa en la categoría de MoE de tamaño medio con coste de inferencia contenido. Esta versión concreta ocupa 19,7 GB en disco y cuantiza a 8 bits afines (grupo 64) las capas de atención, embedding y cabeza, mientras conserva intactos los bytes originales de los expertos (NVFP4 en capas 0-19 y MXFP8 en 20-23) y la torre de visión en bf16.

Su relevancia práctica radica en que permite servir un modelo multimodal MoE de 26B en hardware de consumo Apple con velocidades de decodificación de 84 a 118 tokens por segundo en chips M4 Max y M5 Ultra, manteniendo una calidad prácticamente idéntica a la release original (KLD medio de 0,0040 y 97,2% de acuerdo top-1). Incorpora además dos cabezas de borrador para decodificación especulativa: una integrada (`mtp.safetensors`) y otra externa DFlash2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (texto + imagen), con decodificación especulativa |
| Parametros totales | 26,4 mil millones (modelo base); 6.896.142.848 en el checkpoint safetensors de esta cuantización |
| Parametros activos | 3,4 mil millones |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit afín grupo 64 (atención, embedding, cabeza); expertos en NVFP4 (capas 0-19) y MXFP8 (capas 20-23); torre de visión en bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería mlx) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos (MoE) con capacidades multimodales de entrada imagen-texto. Esta cuantización preserva la estructura MoE original: los pesos de los expertos se mantienen en sus formatos de baja precisión nativos (NVFP4 para las capas 0-19 y MXFP8 para las 20-23), mientras que las partes sensibles a la precisión (atención, embedding y cabeza de salida) se convierten a 8 bits afines con grupo de 64. La torre de visión se conserva en bf16. El pack incluye dos mecanismos de decodificación especulativa: una cabeza de borrador empaquetada (`mtp.safetensors`, 0,64 GB) y un modelo borrador DFlash2 externo (`drafter/`, 0,99 GB) que propone bloques de tokens que el modelo principal verifica.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo base. La innovación técnica destacable de este pack es la estrategia de cuantización selectiva: mantener los expertos en sus formatos nativos y cuantizar solo atención y cabeza, lo que produce una degradación mínima (KLD 0,0040 frente a la release, considerado el ruido de medida) y una mejora de velocidad de aproximadamente el 15% en decodificación, ya que los bytes de atención y cabeza en bf16 se leen completos en cada token y el 8-bit los reduce a la mitad.

## Capacidades

- Generación de texto conversacional multi-turno.
- Procesamiento de imágenes como entrada (pipeline image-text-to-text): descripción, respuesta a preguntas visuales y razonamiento sobre contenido gráfico.
- Razonamiento y generación de código, heredados del modelo base (no se detallan métricas específicas).
- Decodificación especulativa con dos opciones de borrador: cabeza integrada `mtp.safetensors` y modelo DFlash2 externo para propuestas por bloques.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional local en Mac: el modelo puede mantener conversaciones multi-turno en local con decodificación de 84 a 118 tok/s en chips M4 Max y M5 Ultra, adecuado para prototipado y uso personal sin depender de la nube.
- Análisis de imágenes en escritorio: al aceptar entrada image-text-to-text, sirve para describir capturas, extraer información de diagramas o responder preguntas sobre documentos escaneados dentro de una aplicación macOS nativa.
- Desarrollo y pruebas de pipelines multimodales: investigadores pueden validar flujos image-text-to-text en Apple Silicon antes de desplegar en infraestructura mayor, gracias a la paridad de calidad con la release (97,2% de acuerdo top-1).
- Servicio de inferencia local con mlx-serve: el comando `mlx-serve --model ddalcu/Inkling-2-Mini-MLX-8bit --serve` levanta un endpoint compatible para integrarse en herramientas de desarrollo o demos internas.
- Evaluación de decodificación especulativa: el pack incluye dos cabezas de borrador (integrada y DFlash2) que permiten comparar estrategias de speculative decoding en hardware Apple, con soporte para una o varias conversaciones simultáneas.
- Prototipado de asistentes con razonamiento sobre imágenes: combinación de entrada visual y generación de texto para casos como accesibilidad (descripción de imágenes) o soporte técnico guiado por capturas.
- Investigación sobre cuantización selectiva: el pack sirve como referencia reproducible de cómo mantener expertos MoE en formatos nativos y cuantizar solo atención y cabeza sin pérdida medible de calidad.

## Benchmarks y rendimiento

Calidad frente a la release original (teacher-forced top-20, 8 archivos reservados, 7.318 posiciones):

| Modelo | KLD medio | Acuerdo top-1 | Perplexidad |
|---|---|---|---|
| Release original | – | – | 6,147 |
| Este pack (MLX 8-bit) | 0,0040 | 97,2% | 6,149 |

El valor 0,0040 se sitúa en el ruido de medida del propio test (dos cálculos exactos del mismo pack difieren entre 0,0037 y 0,0042). El pack también carga en mlx-lm #2086, con concordancia frente a mlx-serve de KLD 0,0030 y top-1 del 97,9% sobre 3.995 posiciones.

Velocidad con mlx-serve (llmprobe 0.6.18, greedy, decodificación de 192 tokens):

| Mac | Decodificación | Decodificación con borrador | Procesamiento de prompt |
|---|---|---|---|
| M5 Ultra | 118 tok/s | hasta 155 tok/s | 4.900 tok/s |
| M4 Max | 84 tok/s | hasta 96 tok/s | 1.010 tok/s |
| M1 Pro 32 GB | 28 tok/s | – | 190 tok/s |

Frente a la release servida tal cual, este pack decodifica aproximadamente un 15% más rápido con la misma calidad.

## Requisitos de hardware

- VRAM/espacio: el repo ocupa 19,7 GB; se necesita al menos esa cantidad de memoria unificada disponible para cargar los pesos, más margen para el contexto y la torre de visión.
- Hardware objetivo: Apple Silicon con MLX. Probado en M5 Ultra, M4 Max y M1 Pro de 32 GB.
- Cabe en GPU de consumo Apple: sí, en configuraciones con memoria unificada suficiente (M1 Pro 32 GB funciona a 28 tok/s).
- GPU NVIDIA: no disponible; el pack está en formato MLX y no se documenta soporte para CUDA.
- Opciones de despliegue: mlx-serve (recomendado, con soporte de decodificación especulativa y DFlash2) y mlx-lm (#2086). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 118 tok/s (M5 Ultra), 84 tok/s (M4 Max), 28 tok/s (M1 Pro 32 GB) en decodificación; procesamiento de prompt de 4.900 tok/s, 1.010 tok/s y 190 tok/s respectivamente; hasta 155 tok/s y 96 tok/s con borrador en M5 Ultra y M4 Max.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Inkling 2 Mini MLX 8-bit (este pack) | 26,4B | 3,4B | no disponible | Apache 2.0 | safetensors MLX | Multimodal, decodificación especulativa, optimizado para Apple Silicon |
| thinkingmachines/Inkling-2-Mini (release) | 26,4B | 3,4B | no disponible | Apache 2.0 | bf16 | Referencia de calidad; ~15% más lento en decodificación según el autor del pack |
| incoai/Inkling-2-Mini-DFlash2 | no disponible | no disponible | no disponible | Apache 2.0 | safetensors bf16 | Modelo borrador para decodificación especulativa, no es un LM autónomo |

No se dispone de información sobre otros modelos comparables de la misma categoría (MoE multimodal de ~26B) en la documentación proporcionada.

## Limitaciones y advertencias

- El pack está diseñado exclusivamente para MLX y Apple Silicon; no es portable a CUDA ni a otros runtimes sin conversión adicional.
- La información sobre sesgos, idiomas soportados y comportamiento multilingüe del modelo base no está disponible en la documentación proporcionada.
- Riesgo de alucinación: inherente a los modelos generativos; no se documentan evaluaciones específicas de factualidad en esta ficha.
- Longitud de contexto no documentada; no se puede garantizar el comportamiento en conversaciones o documentos largos.
- El modelo borrador DFlash2 no es un modelo de lenguaje autónomo: solo propone tokens que el modelo principal verifica, por lo que no debe desplegarse de forma independiente.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar las condiciones del modelo base original (thinkingmachines/Inkling-2-Mini) y de la release de la que deriva.
- El rendimiento medido corresponde a versiones concretas de mlx-serve y mlx-lm; versiones anteriores rechazan la carpeta `drafter/` por nombre y sirven el pack con la cabeza integrada.
- La cuantización selectiva asume que los expertos en NVFP4/MXFP8 son aceptables tal cual; cambios en el hardware o en el runtime pueden alterar la paridad de calidad reportada.

## Enlaces

- Hugging Face (este pack): https://huggingface.co/ddalcu/Inkling-2-Mini-MLX-8bit
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Modelo borrador DFlash2: https://huggingface.co/incoai/Inkling-2-Mini-DFlash2
- mlx-serve (repositorio y descargas): https://github.com/ddalcu/mlx-serve/releases
- Pull request de soporte DFlash2 en mlx-serve: https://github.com/ddalcu/mlx-serve/pull/1331
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
