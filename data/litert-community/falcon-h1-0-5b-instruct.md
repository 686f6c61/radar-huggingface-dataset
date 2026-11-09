# litert-community/Falcon-H1-0.5B-Instruct

## Resumen

Falcon-H1-0.5B-Instruct en formato LiteRT-LM es la conversión del modelo instruct de TII (Technology Innovation Institute) al runtime on-device de Google, LiteRT-LM. El modelo original emplea una arquitectura híbrida poco habitual: cada una de sus 36 capas ejecuta en paralelo una rama de atención con grouped-query attention y una rama Mamba2 de selective scan, sumando ambas salidas sobre la misma entrada. Esto combina la precisión de la atención con el coste lineal de estado recurrente de Mamba2, lo que resulta especialmente atractivo en escenarios de contexto largo y dispositivos con memoria limitada.

El artefacto publicado no es un conjunto de pesos en safetensors, sino un bundle `.litertlm` de 650 MB con cuantización int8 dinámica en capas lineales y embedding, mientras que las convoluciones y el scan permanecen en coma flotante. Está pensado para ejecutarse en teléfonos y equipos de sobremesa mediante el binario `litert-lm`, con soporte de delegación a GPU vía Metal en Apple y OpenCL en Android.

Su relevancia actual radica en que, según el autor, es el primer Falcon-H1 en formato LiteRT y la primera arquitectura totalmente híbrida (atención paralela más Mamba2 en todas las capas) servida por el runtime publicado, incluida la ruta GPU. Con 0,5 mil millones de parámetros, no compite en calidad con modelos frontera, sino en viabilidad de despliegue local: el modelo base resuelve tareas simples y su valor está en la integración con el runtime.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: atención GQA y Mamba2 en paralelo en cada una de las 36 capas |
| Parametros totales | 0,5 mil millones (modelo base Falcon-H1-0.5B-Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada; las firmas de prefill exportadas cubren 1–1024 tokens |
| Tipos de cuantizacion | int8 dinámica en lineales y embedding; convoluciones y scan en float; activaciones fp32 declaradas para GPU |
| Idiomas soportados | no disponible |
| Licencia | Falcon LLM License (falcon-llm-license), enlace a términos de TII |
| Formato de pesos | `.litertlm` (LiteRT-LM); no se publican safetensors ni GGUF en este repositorio |
| Tamano del repositorio | 2,0 GB |
| Tamano del artefacto int8 | 650 MB |
| Runtime requerido | litert-lm ≥ 0,15 (notas de comportamiento referidas a 0,16,0 y 0,18,0) |
| Libreria | litert-lm |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo base Falcon-H1-0.5B-Instruct es un transformer híbrido en el que cada capa contiene dos ramas que operan en paralelo sobre la misma entrada: una rama de atención con grouped-query attention, que mantiene su propia KV cache, y una rama Mamba2 de selective scan, que mantiene un estado recurrente de tamaño constante (convolución más estado SSM). Las salidas de ambas ramas se suman. El resultado es que el modelo arrastra simultáneamente una caché KV y un estado recurrente por capa, lo que condiciona tanto el consumo de memoria como la gestión de conversaciones en el runtime.

La información disponible no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo original; esos datos corresponden a la model card de `tiiuae/Falcon-H1-0.5B-Instruct`, que no se incluye en la información proporcionada. Lo que sí está documentado es el proceso de conversión y validación: paridad de logits frente a PyTorch con diferencia máxima absoluta de 7,6e-05 y correlación 1,000000 en 8 posiciones de decodificación, con top-1 y top-5 idénticos en todas ellas. Se exportaron firmas de prefill de múltiples longitudes (1–1024) para que el runtime seleccione fragmentos ajustados, y el bundle incluye tokenizador y la plantilla de chat ChatML estándar de Falcon-H1.

## Capacidades

- Generación de texto conversacional en formato instruct, con plantilla de chat ChatML incluida en el bundle.
- Razonamiento básico y aritmética simple: en la prueba de sanidad de 8 preguntas acierta 6, fallando "merci" y 8×7, fallos atribuidos al propio nivel del modelo de 0,5B y no a la conversión.
- Respuesta a preguntas factuales sencillas (capitales, colores, operaciones), verificada en las pruebas del autor.
- Ejecución on-device con delegación completa a GPU en Metal (macOS, iPhone 17 Pro) y OpenCL (Pixel 8a, Qualcomm Adreno).
- Soporte de decodificación con caché desactivable (`--cache no`) y selección de backend CPU o GPU.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido en la información disponible.
- Capacidades multilingües: no disponibles; la prueba de sanidad incluye una respuesta en francés ("merci") pero no se especifica cobertura de idiomas.

## Casos de uso

- Asistentes embebidos en aplicaciones móviles: el bundle de 650 MB y el runtime LiteRT-LM permiten integrar un chat instruct directamente en iOS o Android, con 52,7 tok/s de decodificación en GPU en un iPhone 17 Pro y 2,50 GB de memoria pico.
- Clasificación y respuestas cortas en el dispositivo: con TTFT de 0,46 s en iPhone 17 Pro (GPU) y 0,93 s en Pixel 8a (OpenCL), es adecuado para interacciones de una sola pregunta con respuesta breve, como consultas de estado o extracción de campos.
- Prototipado de arquitecturas híbridas: sirve para validar el comportamiento de atención más Mamba2 en paralelo sobre hardware real antes de escalar a variantes mayores de Falcon-H1.
- Pruebas de conformidad de runtimes: la paridad de logits documentada (7,6e-05 de diferencia máxima) lo convierte en una referencia útil para verificar nuevas versiones de litert-lm o nuevos delegados de GPU.
- Aplicaciones offline con requisitos de privacidad: al ejecutarse localmente sin llamadas a servicios externos, encaja en escenarios donde los datos no pueden salir del dispositivo.
- Demos educativas de inferencia on-device: su tamaño reducido permite ejecutar ejemplos completos de prefill y decodificación en portátiles Apple Silicon, con 2650 tok/s de prefill y 127,5 tok/s de decodificación en un M4 Max por GPU.
- Evaluación de latencia en gama media Android: el manifiesto recomienda la ruta CPU en dispositivos de 8 GB, con 22,5–25,9 tok/s de decodificación y 1374 MB de pico medidos en Pixel 8a.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los datos de rendimiento publicados son medidas de inferencia y pruebas de corrección:

| Prueba | Resultado |
|---|---|
| Paridad de logits vs PyTorch (8 posiciones) | max\|diff\| 7,6e-05; correlación 1,000000; top-1 y top-5 idénticos |
| Sanidad de 8 preguntas (int8, float y GPU) | 6/8 en las tres rutas, texto casi idéntico |
| Barrido de longitud de prompt (12–60 tokens, motor nuevo por longitud) | 41/41 correctos |
| Sonda de calidad en iPhone 17 Pro (Metal) | 7/8 |
| Delegación OpenCL en Pixel 8a | 5366/5366 subgrafos, cero rechazos |

| Plataforma | Backend | Prefill | Decode | TTFT | Memoria pico |
|---|---|---|---|---|---|
| Apple M4 Max (`-p 256 -d 256`) | GPU | 2650 tok/s | 127,5 tok/s | 0,10 s | no disponible |
| Apple M4 Max (`-p 256 -d 256`) | CPU | 473 tok/s | 59,0 tok/s | 0,56 s | no disponible |
| iPhone 17 Pro (prompt de 145 tokens) | GPU Metal | 365,9 tok/s | 52,7 tok/s | 0,46 s | 2,50 GB |
| iPhone 17 Pro (prompt de 145 tokens) | CPU | 332,3 tok/s | 36,2 tok/s | 0,48 s | 0,66 GB |
| Pixel 8a (prompt de 19 tokens) | GPU OpenCL | 23,6 tok/s | 11,8 tok/s | 0,93 s | no disponible |
| Pixel 8a (prompt de 205 tokens) | CPU | 89,6–98,7 tok/s | 22,5–25,9 tok/s | 2,19–2,41 s | 1374 MB |

## Comparativa con modelos similares

No se dispone de datos de benchmarks del modelo base ni de alternativas en la información proporcionada, por lo que la comparación se limita a parámetros y formato de despliegue.

| Modelo | Parametros | Contexto | Formato / runtime | Licencia |
|---|---|---|---|---|
| Falcon-H1-0.5B-Instruct (LiteRT-LM, este repo) | 0,5B | no disponible | `.litertlm`, litert-lm ≥ 0,15 | Falcon LLM License |
| Falcon-H1-0.5B-Instruct (tiiuae) | 0,5B | no disponible | safetensors, transformers | Falcon LLM License |
| Otras variantes Falcon-H1 | no disponible | no disponible | no disponible | Falcon LLM License |

## Limitaciones y advertencias

- Calidad limitada por el tamaño: el propio autor atribuye los fallos de la prueba de sanidad (8×7, "merci") al nivel del modelo de 0,5B, no a la conversión. No es adecuado para razonamiento complejo ni código en producción.
- Bug de estado recurrente entre conversaciones: en litert-lm 0,18.0, reutilizar un `Engine` para una segunda conversación reutiliza tokens del prompt compartido sin reiniciar el estado recurrente, ignorando el system prompt de la nueva conversación. El autor recomienda crear un `Engine` nuevo por conversación. El arreglo existe en main desde el 3 de noviembre de 2026 (commit e1f86b05, continuación del PR #3945) pero ninguna release lo incluye, incluida la v0.19.1.
- Dependencia estricta de versión: requiere litert-lm ≥ 0,15 y las notas de comportamiento se refieren a 0,16,0 y 0,18,0; versiones distintas pueden alterar resultados.
- Rendimiento GPU dependiente del dispositivo: en Android de gama baja la GPU mejora prefill y TTFT pero no decodificación, que está limitada por ancho de banda de memoria; el manifiesto recomienda CPU en dispositivos de 8 GB hasta disponer de una medición GPU con el mismo binario.
- Las cifras de Pixel 8a comparan binarios y longitudes de prompt distintas (`litert_lm_main` frente a `litert_lm_advanced_main`), por lo que el orden GPU/CPU es indicativo y no medido bajo un protocolo único.
- Licencia Falcon LLM License: no es una licencia open source estándar; deben revisarse los términos de TII antes de cualquier uso comercial.
- Idiomas soportados y sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación inherente a un modelo de 0,5B en preguntas factuales fuera de su distribución de entrenamiento.
- El repositorio no incluye pesos en safetensors ni GGUF, lo que limita su uso fuera del ecosistema LiteRT-LM.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/Falcon-H1-0.5B-Instruct
- Modelo base: https://huggingface.co/tiiuae/Falcon-H1-0.5B-Instruct
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Issue reportado sobre el estado recurrente entre conversaciones: https://github.com/google-ai-edge/LiteRT-LM/issues/3165
- Pull request relacionado: https://github.com/google-ai-edge/LiteRT-LM/pull/3945
- Commit con el arreglo en main: https://github.com/google-ai-edge/LiteRT-LM/commit/e1f86b05bf8a731331622a2622440e9f93d9a9f5
- Términos de licencia Falcon: https://falconllm.tii.ae/falcon-terms-and-conditions.html
