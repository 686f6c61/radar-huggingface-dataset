# litert-community/Falcon-H1-3B-Instruct

## Resumen

Falcon-H1-3B-Instruct en formato LiteRT-LM es la conversión del modelo `tiiuae/Falcon-H1-3B-Instruct` de TII (Technology Innovation Institute) al formato `.litertlm` de Google para inferencia en dispositivo (on-device) mediante el runtime LiteRT-LM. El modelo original pertenece a la familia Falcon-H1, una arquitectura híbrida que combina atención con grupos de consulta (GQA) y exploración selectiva Mamba2 en paralelo dentro de cada capa, lo que permite mantener una caché KV reducida junto con un estado recurrente de tamaño constante.

Este repositorio no contiene los pesos originales en safetensors, sino una única distribución cuantizada a int8 dinámico (3,15 GB) empaquetada para ejecutarse en móviles, portátiles y equipos de escritorio con aceleración GPU o CPU. Está pensado para desarrolladores que necesitan desplegar un modelo de 3 000 millones de parámetros en hardware de consumo sin infraestructura de servidor, con latencias medidas de 11,5 a 65,3 tokens por segundo en decodificación según el dispositivo.

Su relevancia actual radica en que es el primer tamaño de la familia Falcon-H1 donde la cuantización int8 no degrada la calidad según las pruebas del autor (8/8 en el chequeo de sanidad en GPU y CPU), y en que incluye soporte funcional de tool calling en LiteRT-LM 0.18.0. La licencia es la Falcon LLM License de TII, no una licencia de código abierto estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida paralela: GQA + Mamba2 selective-scan en cada una de las 32 capas |
| Parametros totales | 3B (según denominación del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (se exportan firmas de prefill de 1 a 1024 tokens) |
| Tipos de cuantizacion | int8 dinámico en capas lineales y embedding; convoluciones y scan en coma flotante; activaciones fp32 declaradas para GPU |
| Idiomas soportados | no disponible |
| Licencia | Falcon LLM License (falcon-llm-license) |
| Formato de pesos | `.litertlm` (LiteRT-LM); requiere litert-lm >= 0.15 |

## Arquitectura y entrenamiento

El diseño de Falcon-H1 es completamente híbrido: cada una de las 32 capas ejecuta en paralelo una rama de atención con grupos de consulta y una rama Mamba2 de exploración selectiva sobre la misma entrada, sumando ambas salidas. Como consecuencia, cada capa mantiene simultáneamente una caché KV y un estado recurrente de tamaño constante (convolución más SSM), lo que reduce el crecimiento de memoria con la longitud de contexto frente a un transformer puro.

No se dispone en la información proporcionada de datos sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo base. La conversión a LiteRT-LM aplica cuantización int8 dinámica sobre las capas lineales y el embedding, manteniendo en coma flotante las convoluciones y el scan para preservar la fidelidad numérica. El autor reporta que la exportación en coma flotante coincide con el modelo de PyTorch en 48 posiciones de decodificación forzada (top-1 y top-5 idénticos, correlación media de logits 1,0000, KL media ≈ 0). Se exportan firmas de prefill de múltiples longitudes (1 a 1024) para que el runtime seleccione fragmentos ajustados.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat estilo ChatML propia de Falcon-H1.
- Razonamiento y respuesta a preguntas factuales y aritméticas (verificado en el chequeo de sanidad con preguntas como capitales y multiplicaciones).
- Tool calling / function calling: desde el reempaquetado del 14 de octubre de 2026, el runtime parsea la llamada y el resultado de la herramienta llega al modelo; antes devolvía la llamada como texto del mensaje.
- Ejecución en dispositivo con backend GPU (Metal en Apple, GPU en Android) y backend CPU.
- Soporte de la forma de partes de contenido de LiteRT-LM 0.18 en la plantilla de chat (la forma de cadena permanece sin cambios).
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Asistente conversacional en aplicación móvil: el modelo cabe en 3,15 GB y decodifica a 11,5 tok/s en Galaxy S26 y 14,0 tok/s en iPhone 17 Pro, lo que permite integrarlo en apps Android e iOS con LiteRT-LM sin conexión a servidor.
- Respuesta a preguntas factuales y cálculo aritmético en el dispositivo: útil para asistentes de productividad o educación que necesitan resolver operaciones simples y preguntas de cultura general sin enviar datos a la nube.
- Agente local con tool calling: con LiteRT-LM 0.18.0 el modelo emite llamadas de herramienta en formato JSON y recibe sus resultados, lo que habilita flujos de consulta de clima, calendario o APIs locales en aplicaciones de escritorio.
- Procesamiento de texto en portátiles Apple Silicon: en un Mac M4 Max alcanza 979 tok/s de prefill y 65,3 tok/s de decodificación con TTFT de 0,28 s, adecuado para resumen y reescritura de documentos en local.
- Prototipado y evaluación de arquitecturas híbridas: investigadores pueden comparar el comportamiento de un modelo híbrido GQA+Mamba2 frente a transformers puros en tareas de contexto corto y medio con hardware de consumo.
- Funciones de autocompletado y generación asistida en editores: la latencia baja en GPU de móvil (TTFT de 1,49 a 2,03 s y prefill de 109 a 111 tok/s) permite sugerencias de texto en aplicaciones de escritura sin backend.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse íntegramente en el dispositivo, los datos del usuario no salen del terminal, lo que encaja en aplicaciones sanitarias o financieras con restricciones de tratamiento de datos.

## Benchmarks y rendimiento

El autor no publica resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Sí se reportan métricas de rendimiento y pruebas de calidad:

| Prueba | Resultado |
|---|---|
| Coincidencia de logits con PyTorch (48 posiciones) | top-1 y top-5 idénticos; correlación media 1,0000; KL media ≈ 0 |
| Chequeo de sanidad de 8 preguntas (GPU y CPU, litert-lm 0.15.0 y 0.16.0) | 8/8 en todas las ejecuciones |
| Test compuesto de calidad en iPhone 17 Pro (Metal) | 8/8 en GPU y 8/8 en CPU, respuestas idénticas |
| Barrido de longitud de prompt (CPU fills 12–51, GPU fills 12–31) | sin fallos |

Rendimiento medido con `litert-lm benchmark` en Apple M4 Max (`-p 256 -d 256 --runs 3 --cache no`):

| Backend | Prefill (256) | Decodificación | TTFT |
|---|---|---|---|
| GPU | 979 tok/s | 65,3 tok/s | 0,28 s |
| CPU | 121 tok/s | 20,9 tok/s | 2,17 s |

Rendimiento en dispositivo (arranque en frío, ejecuciones únicas, prompt compuesto de 146 tokens):

| Dispositivo | Backend | Prefill | Decodificación | TTFT |
|---|---|---|---|---|
| Galaxy S26 | GPU | 109 tok/s | 11,5 tok/s | 2,03 s |
| iPhone 17 Pro | GPU | 111 tok/s | 14,0 tok/s | 1,49 s |
| Mac M4 Max | GPU | 979 tok/s | 65,3 tok/s | 277 ms |

## Requisitos de hardware

- Almacenamiento y memoria: el archivo int8 ocupa 3,15 GB; se necesita espacio libre equivalente más el overhead del runtime y del estado recurrente y la caché KV.
- GPU de consumo: cabe en móviles de gama alta (Galaxy S26, iPhone 17 Pro) y en Apple Silicon (M4 Max). No se dispone de datos para RTX 4090, A100 o H100 en la información proporcionada.
- Despliegue: runtime LiteRT-LM (versión >= 0.15; la 0.18.0 añade soporte de tool calling). No se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: ver tabla de benchmarks; en Mac M4 Max la decodificación alcanza 65,3 tok/s y el TTFT baja a 277 ms.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Falcon-H1-3B-Instruct (LiteRT-LM) | 3B | no disponible | `.litertlm` int8 | Falcon LLM License | Hugging Face, litert-community |
| Falcon-H1-1.5B-Instruct (LiteRT-LM) | 1,5B | no disponible | `.litertlm` | Falcon LLM License | Hugging Face, litert-community |
| Falcon-H1-0.5B-Instruct (LiteRT-LM) | 0,5B | no disponible | `.litertlm` | Falcon LLM License | Hugging Face, litert-community |
| Falcon-H1-3B-Instruct (original) | 3B | no disponible | safetensors | Falcon LLM License | Hugging Face, tiiuae |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- La licencia Falcon LLM License no es de código abierto estándar; es necesario revisar los términos en falconllm.tii.ae antes de un uso comercial.
- Riesgo de alucinación inherente a un modelo de 3B; las pruebas de sanidad son de solo 8 preguntas y no sustituyen una evaluación exhaustiva.
- Bug conocido en LiteRT-LM 0.18.0: al reutilizar un mismo Engine para varias conversaciones, el runtime reutiliza tokens de prompt compartidos y no reinicia el estado recurrente, lo que puede ignorar el system prompt de la segunda conversación. El autor recomienda crear un Engine nuevo por conversación. Existe un parche en la rama principal (commit e1f86b05, 3 de noviembre de 2026) no incluido en ninguna release hasta la fecha (v0.19.1 no lo incorpora).
- El reempaquetado del 14 de octubre de 2026 cambió el tipo de modelo a `qwen2p5`, lo que altera los valores por defecto del ejecutor GPU del runtime; las mediciones en GPU de móvil de la ficha se hicieron con el archivo anterior y no se han repetido.
- En 0.18.0, la comprobación de dígitos en GPU de Mac entra en bucle con `<|pad|>` repetido, igual que con el archivo anterior.
- No se dispone de información sobre idiomas soportados, longitud de contexto oficial ni sesgos conocidos del modelo base.
- El tamaño de 3B limita el razonamiento complejo y el conocimiento factual frente a modelos mayores; conviene validar en producción con conjuntos de evaluación propios.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/litert-community/Falcon-H1-3B-Instruct
- Modelo base: https://huggingface.co/tiiuae/Falcon-H1-3B-Instruct
- Variante 0.5B: https://huggingface.co/litert-community/Falcon-H1-0.5B-Instruct
- Variante 1.5B: https://huggingface.co/litert-community/Falcon-H1-1.5B-Instruct
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Informe del bug de conversaciones: https://github.com/google-ai-edge/LiteRT-LM/issues/3165
- Commit con el parche: https://github.com/google-ai-edge/LiteRT-LM/commit/e1f86b05bf8a731331622a2622440e9f93d9a9f5
- Ficha de compatibilidad edge: https://github.com/john-rocky/edge-compat/blob/main/cards/falconh1-3b/CARD.md
- Términos de licencia Falcon: https://falconllm.tii.ae/falcon-terms-and-conditions.html
