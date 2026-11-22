# litert-community/Qwen3.5-2B

## Resumen

Qwen3.5-2B en formato LiteRT-LM es la conversión del modelo base Qwen/Qwen3.5-2B de Alibaba al formato `.litertlm`, realizada por la comunidad litert-community para inferencia en dispositivo (on-device) con el runtime LiteRT-LM de Google. El modelo original emplea una arquitectura híbrida propietaria de Qwen3.5 que combina bloques de atención lineal GatedDeltaNet con bloques de atención completa con compuertas, lo que reduce drásticamente el crecimiento de memoria con la longitud de contexto.

El repositorio distribuye dos variantes: una compilación solo texto de 1,97 GB y una compilación multimodal (texto + imagen) de 3,15 GB que incorpora el ViT de 24 capas del checkpoint original. Ambas usan cuantización int8 dinámica en las capas lineales y el embedding, manteniendo en coma flotante las proyecciones de decaimiento y compuerta de GatedDeltaNet para preservar la estabilidad numérica en aritmética multi-paso.

La relevancia actual del modelo reside en su perfil de despliegue: cabe en dispositivos móviles de gama alta y en placas SBC como Raspberry Pi 5, con velocidades de decodificación medidas de 17,5 tok/s en GPU de Galaxy S26 y 4,2 tok/s en CPU de Raspberry Pi 5. Requiere litert-lm ≥ 0.15 y está publicado bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 18 capas de atención lineal GatedDeltaNet + 6 capas de atención completa con compuertas (transformer híbrido) |
| Parametros totales | 2B (según denominación del modelo base; no se detalla el desglose exacto) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens de presupuesto KV en las 6 capas de atención; las capas lineales usan estado recurrente de tamaño constante |
| Tipos de cuantizacion | int8 dinámica en lineales y embedding; proyecciones `in_proj_a`/`in_proj_b` de GatedDeltaNet en float; activaciones fp32 declaradas; ViT en fp16 con adaptador int8 (variante VL) |
| Idiomas soportados | no disponible (la model card no enumera idiomas; se mencionan pruebas de tokenización en hindi, tailandés, tamil, árabe, chino, japonés, coreano e inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); dos ficheros: `Qwen3.5-2B_int8.litertlm` (1,97 GB) y `Qwen3.5-2B-VL_int8.litertlm` (3,15 GB) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-2B emplea una arquitectura híbrida en la que los bloques GatedDeltaNet (atención lineal basada en la regla delta con compuertas) se intercalan con un número reducido de bloques de atención completa con compuertas. En esta compilación de 2B, la proporción es de 18 capas lineales frente a 6 de atención completa. Los bloques lineales mantienen un estado recurrente y convolucional de tamaño constante por capa en lugar de una caché KV creciente, de modo que el consumo de memoria permanece prácticamente plano respecto a la longitud de contexto; solo las 6 capas de atención conservan KV, con un presupuesto de 4096 tokens.

El checkpoint upstream es multimodal e incluye una torre de visión de 24 capas y cabezas MTP. La compilación solo texto las descarta siguiendo el contrato de carga `Qwen3_5ForCausalLM` de upstream, mientras que la compilación VL incorpora el ViT propio del checkpoint con entradas estáticas de 512×512 y seis firmas de prefill. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) del modelo base en la documentación proporcionada. La conversión a LiteRT-LM se realizó con `litert_torch`, y la model card reporta una coincidencia numérica de 4e-7 frente al modelo original en una Galaxy S26 con LiteRT 2.2.0.

## Capacidades

- Generación de texto y razonamiento en modo conversacional, con plantilla de chat compatible con el formato de content-parts de litert-lm 0.18.
- Procesamiento de imágenes en la variante VL: entrada image-text-to-text con ViT de 24 capas a resolución estática 512×512.
- Razonamiento aritmético multi-paso: la re-cuantización del 11 de octubre de 2026 eliminó el bucle de repetición en CPU con el modo thinking desactivado por defecto.
- Tokenización multilingüe con cobertura verificada en hindi, tailandés, tamil, árabe con harakat, chino, japonés, coreano, inglés y emoji tras la corrección del tokenizador del 16 de octubre de 2026.
- Inferencia en dispositivo con delegación completa de operadores: 25.703 operadores delegados en la prueba con GPU de Galaxy S26.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso autónomo: no disponible en la información proporcionada.
- Modo thinking: mencionado como desactivado por defecto en las pruebas de aritmética; no se detallan sus capacidades específicas.

## Casos de uso

- Asistentes conversacionales embebidos en aplicaciones Android: el modelo se integra mediante la librería `com.google.ai.edge.litert:litert` y ofrece decodificación a 17,5 tok/s en GPU de Galaxy S26, suficiente para respuestas interactivas sin conexión a red.
- Procesamiento de documentos con OCR y comprensión visual en el dispositivo: la variante VL acepta imágenes de 512×512 y puede describir o extraer información de capturas, formularios o fotografías sin enviar datos a un servidor.
- Automatización en placas SBC y dispositivos IoT: con 4,2 tok/s de decodificación y 56 tok/s de prefill en CPU de Raspberry Pi 5 con 4 hilos, el modelo es viable para tareas de clasificación, extracción de entidades y generación de respuestas breves en entornos sin GPU.
- Privacidad por diseño en sectores regulados: al ejecutarse íntegramente en el dispositivo con licencia Apache 2.0, permite desplegar asistentes sobre datos sensibles (sanitario, legal, financiero) sin transferencia a infraestructura externa.
- Traducción y normalización de texto multilingüe en el borde: la tokenización corregida para escrituras con marcas combinantes (hindi, tailandés, tamil, árabe) habilita tareas de transliteración y normalización en dispositivos de mercados diversos.
- Prototipado rápido de aplicaciones de IA generativa en móvil: el formato `.litertlm` y el runtime LiteRT-LM permiten iterar sobre prompts y plantillas de chat con ficheros de menos de 2 GB, reduciendo el ciclo de desarrollo frente a soluciones basadas en servidor.
- Filtrado y resumen de contenido en el propio terminal: con memoria casi constante respecto al contexto gracias a las capas GatedDeltaNet, el modelo puede procesar conversaciones o hilos largos dentro de los 4096 tokens de presupuesto KV sin degradación de memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card únicamente reporta mediciones de rendimiento en dispositivo:

| Dispositivo | Runtime | Backend | Decodificación | Prefill | TTFT |
|---|---|---|---|---|---|
| Galaxy S26 | LiteRT-LM 0.16.0 | GPU | 17,5 tok/s | 450 tok/s | 520 ms |
| Galaxy S26 | LiteRT-LM 0.16.0 | CPU | 19,0 tok/s | 181 tok/s | 1,20 s |
| Raspberry Pi 5 (4 hilos) | LiteRT-LM 0.16.1 | CPU | 4,2 tok/s | 56 tok/s | 5,04 s |

Las mediciones corresponden al fichero VL previo a la re-cuantización del 11 de octubre de 2026 (sha256 `f8821e40…`), con fecha de 5 de septiembre de 2026 para Galaxy S26 y 1 de septiembre de 2026 para Raspberry Pi 5.

## Requisitos de hardware

- VRAM/RAM estimada: 1,97 GB para la variante solo texto y 3,15 GB para la variante VL, en ambos casos en formato int8.
- GPU recomendadas: no se especifican modelos de escritorio; las pruebas publicadas emplean la GPU integrada de un Galaxy S26 (Adreno) con delegación completa de los 25.703 operadores.
- Compatibilidad con GPU de consumo: no disponible en la información proporcionada; el enfoque del repositorio es el despliegue en dispositivo móvil y SBC, no en tarjetas gráficas de escritorio.
- Despliegue: runtime LiteRT-LM ≥ 0.15 (verificado en 0.15.0, 0.16.0, 0.16.1 y 0.18.0); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: TTFT de 520 ms en GPU de Galaxy S26 y 5,04 s en CPU de Raspberry Pi 5; prefill de 450 tok/s y 56 tok/s respectivamente.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-2B (LiteRT-LM, este repo) | 2B | 4096 tokens KV + estado recurrente constante | `.litertlm` int8 | Apache 2.0 | Hugging Face, litert-community |
| Qwen3.5-0.8B (LiteRT-LM) | 0,8B | no disponible | `.litertlm` | Apache 2.0 | Hugging Face, litert-community |
| Qwen3.5-4B (LiteRT-LM) | 4B | no disponible | `.litertlm` | Apache 2.0 | Hugging Face, litert-community |

Las tres variantes comparten la misma ruta de conversión y el kernel gated-delta de rango ≤4 delegable a GPU. No se dispone de datos de benchmarks comparativos entre ellas ni frente a alternativas de otros formatos en la información proporcionada.

## Limitaciones y advertencias

- Defecto histórico conocido: los ficheros publicados el 14 de agosto de 2026 (texto) y el 25 de agosto de 2026 (VL) producían respuestas en bucle ante aritmética multi-paso en el backend CPU con thinking desactivado; fue corregido en la re-cuantización del 11 de octubre de 2026. Quien haya descargado las versiones anteriores debe actualizar.
- El autor reconoce que la advertencia sobre el comportamiento de un solo Engine se añadió a la model card el 12 de octubre de 2026, aunque el informe abierto sobre el runtime lo describía desde el 6 de agosto de 2026.
- Tokenizador corregido el 16 de octubre de 2026: la sección anterior usaba el tokenizador de `transformers` para `Qwen2Tokenizer`, sin clase `\p{M}`, lo que fragmentaba de forma distinta el texto con marcas combinantes (49 frente a 36 tokens en una frase en hindi, 24 frente a 12 en tailandés, 29 frente a 16 en tamil). Las versiones anteriores pueden producir tokenizaciones divergentes en esas escrituras.
- Presupuesto de contexto limitado: solo 4096 tokens de caché KV en las 6 capas de atención, lo que restringe la ventana efectiva pese al estado recurrente de las capas lineales.
- Idiomas soportados no documentados oficialmente; la cobertura multilingüe se infiere únicamente de las pruebas de tokenización, no de evaluaciones de calidad.
- Sin datos publicados sobre sesgos, tasas de alucinación ni evaluaciones de seguridad del modelo base en la información disponible.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo en producción; los defectos documentados evidencian la necesidad de validación propia antes de desplegar.
- Dependencia estricta del runtime LiteRT-LM ≥ 0.15; no hay soporte documentado para otros motores de inferencia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/litert-community/Qwen3.5-2B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Variante 0.8B: https://huggingface.co/litert-community/Qwen3.5-0.8B
- Variante 4B: https://huggingface.co/litert-community/Qwen3.5-4B
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Ficha de compatibilidad en dispositivo (edge-compat): https://github.com/john-rocky/edge-compat/blob/main/cards/qwen35-2b-vl-int8/CARD.md
- Benchmark de runtimes en Android: https://github.com/john-rocky/apple-silicon-llm-bench/blob/main/results/android/tinyhybridnet-three-runtimes.md
