# CaryPalmer/Kintsugi-Inkling-2-Mini

## Resumen

Kintsugi-Inkling-2-Mini es una cuantización de 2-3 bits del modelo Inkling 2 Mini de Thinking Machines, desarrollada por CaryPalmer y publicada en formato GGUF bajo licencia Apache-2.0. El modelo base es un mixtura de expertos (MoE) con bucles de 26.400 millones de parámetros totales, aunque el archivo safetensors reportado en el repositorio indica 5.371.175.424 parámetros, una discrepancia que conviene tener en cuenta. Esta versión cuantizada está diseñada específicamente para ejecutarse en una única tarjeta NVIDIA de 12 GB con una ventana de contexto de 262.144 tokens.

La propuesta diferencial es el método Kintsugi, descrito en un artículo del mismo autor, que localiza y repara el daño de cuantización en los puntos donde las tareas se rompen, en lugar de optimizar únicamente métricas promedio. El archivo emplea codificación EXL3 trellis a 2 o 3 bits por peso en los expertos, con una media de 2,444 bits por peso sobre 24.461.180.928 pesos de expertos, y requiere un fork propio de llama.cpp para cargarse.

Es relevante ahora porque demuestra que un MoE de 26B con contexto largo puede caber en hardware de consumo (RTX 4070 de 12 GB) manteniendo una fidelidad cercana a los pesos oficiales (KL medio de 0,0310 y 93,62 % de coincidencia en el token superior), con rendimiento en tareas de agente prácticamente equivalente al modelo completo. No obstante, el ecosistema es cerrado: solo funciona con el motor propietario del autor y no hay soporte para GPUs Hopper, Blackwell ni Apple Silicon.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixtura de expertos (MoE) con bucles (looped MoE), transformer; 24 capas, 8 pasadas de atención global |
| Parámetros totales | 26.400 millones (según model card); 5.371.175.424 según safetensors del repo |
| Parámetros activos | no disponible |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantización | EXL3 trellis a 2-3 bits en expertos (2,444 bits/peso medio); Q8_0 en proyecciones de atención y cabeza; Q4_0 en embeddings; F16 en controladores de bucle, sinks y convoluciones; F32 en router y normas; caché K/V a 4 bits (q4_0) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (9.067.638.560 bytes) |

## Arquitectura y entrenamiento

El modelo base Inkling 2 Mini es un mixtura de expertos con bucles de 26.400 millones de parámetros, texto únicamente, con 24 capas y 8 pasadas de atención global. La cuantización Kintsugi se aplica sobre los pesos oficiales de Thinking Machines (revisión `ed40e7da`) mediante `quantize_exl3` de exllamav3 y el layout Escha W2 de Escha Labs. El mapa M2 asigna 3 bits a las proyecciones down en las 24 capas, 3 bits a las proyecciones gate y up fusionadas en las 4 capas globales (5, 11, 17 y 23) y 2 bits en las otras 20 capas.

El proceso de calibración usa hessianos obtenidos de una pasada forward de los pesos oficiales sobre el corpus público del reto de cuantización Qwen3.8-27B (StillDeadcode, CC BY 4.0), re-renderizado con la plantilla de Inkling. Cada experto vio todos los tokens durante la captura y las tres pasadas de bucle se suman en un único hessiano. No se dispone de información sobre el entrenamiento original del modelo base (número de tokens, composición del dataset, RLHF/DPO) en la documentación proporcionada.

La innovación técnica destacable es el método Kintsugi, que prioriza la reparación de daño de cuantización en regiones donde las tareas fallan, y el motor propio (fork de llama.cpp, MIT) que mantiene la caché K/V de las 8 pasadas de atención global a 4 bits, permitiendo hasta 250k tokens en VRAM en una tarjeta de 12 GB y el resto en RAM del sistema. El motor incluye además una protección contra repeticiones en bucles de agente (activa por defecto) y un modo opcional de dos ranuras (`INKLING_SLOTS=2`).

## Capacidades

- Generación de texto conversacional y razonamiento de múltiples pasos, con soporte de contexto largo de hasta 262.144 tokens.
- Tareas de agente: el modelo se ha evaluado en AppWorld con 672 ejecuciones emparejadas, obteniendo 595 frente a 592 del modelo oficial con caché de 4 bits (diferencia estadísticamente no significativa, p = 0,78).
- Uso en arneses de programación: Claude Code, Codex, Pi y OpenCode, con 5 de 6 tareas superadas en cada uno.
- Recuperación de información en contexto largo: 24/24 agujas y 20/20 copias de código a profundidades de 64k, 117k y 245k tokens.
- Compatibilidad con API OpenAI (`http://127.0.0.1:8080/v1`), lo que facilita la integración con herramientas existentes.
- Protección integrada contra bucles de repetición en flujos de agente (rompió el bucle en 6 y 7 de 10 intentos en dos puntos de bloqueo, frente a 0 de 10 sin ella).
- Capacidades multilingües: no disponible.
- Soporte de tool calling / function calling: no documentado explícitamente, aunque el uso en arneses de agente y la API compatible con OpenAI sugieren compatibilidad funcional.
- Modo thinking, visión o audio: no disponible (modelo solo texto).

## Casos de uso

- Agentes autónomos de larga duración: el contexto de 262.144 tokens y la protección contra repeticiones permiten mantener sesiones de agente multi-paso sin degradación, como demuestra su uso en AppWorld y en arneses como Claude Code o Codex.
- Asistencia de programación en local: con 5 de 6 tareas superadas en cada arnés (Claude Code, Codex, Pi, OpenCode), puede integrarse en un flujo de desarrollo sobre una RTX 4070 sin depender de la nube.
- Análisis de repositorios y documentos extensos: la recuperación perfecta a 245k tokens (24/24 agujas, 20/20 copias de código) lo hace adecuado para revisar bases de código grandes o expedientes largos en una sola pasada.
- Servidor de inferencia personal con API OpenAI: el bundle arranca un servidor compatible en `127.0.0.1:8080/v1`, lo que permite conectar clientes existentes y prototipar aplicaciones sin coste de API.
- Procesamiento por lotes en hardware de consumo: con 9,07 GB de archivo y 12 GB de VRAM, se puede desplegar en estaciones de trabajo con RTX 30/40 para tareas de generación de texto y resumen a gran escala.
- Evaluación e investigación de cuantización: el paquete incluye benchmarks reproducibles (KL, AppWorld, recuperación) que permiten comparar métodos de cuantización en condiciones controladas.
- Chat de contexto muy largo con memoria persistente: el modo de dos ranuras (`INKLING_SLOTS=2`) y la capa de chats guardados facilitan conversaciones prolongadas con historial, aunque el modo no es bit-equivalente al de una ranura.

## Benchmarks y rendimiento

| Prueba | Resultado |
|---|---|
| Fidelidad a pesos oficiales (KL medio, mismo token superior) | 0,0310; 93,62 % |
| Misma prueba con UD-Q2_K_XL de Unsloth (9,14 GB), mismo motor, 2026-11-21 | 0,0426; 92,70 % (Kintsugi: 27,3 % menos KL; 27,7 % con la caché K/V por defecto) |
| AppWorld vs pesos oficiales (NVFP4/MXFP8, 672 ejecuciones emparejadas) | 595 vs 592 con caché de 4 bits (nivel, p = 0,78) |
| AppWorld vs configuración de Unsloth (298 vs 283 y 298 vs 281-283 de 336) | Mejor |
| Recuperación a 64k / 117k / 245k (24 agujas / 20 copias de código) | 24/24 + 20/20 en cada profundidad (q4_0 por defecto) |
| Decodificación a 4k / 32k / 117k / 245k (tok/s) | 64,5 / 57,9 / 42,4 / 29,75 |
| Arneses de programación (6 tareas cada uno): Claude Code, Codex, Pi, OpenCode | 5 de 6 en cada uno |
| RTX 3080 Ti (Linux): agujas a 32k, coincidencia top-1 | 24/24; 97,8 %; KL medio 7,5 % inferior al de RTX 4070 |

## Requisitos de hardware

- VRAM estimada: 12 GB o más para el archivo de 9,07 GB más la caché K/V a 4 bits; hasta 250k tokens en VRAM en una tarjeta de 12 GB, el resto en RAM del sistema.
- GPU recomendadas: RTX 40 (Ada) y RTX 30 (Ampere) soportadas; todas las comprobaciones de release se ejecutaron en una RTX 4070 (Windows y Linux) y el motor se verificó en una RTX 3080 Ti (Linux).
- GPUs no soportadas: RTX 50 (Blackwell), H100/H200 (Hopper) sin código en el motor (previsto para v1.0.1); RTX 20 (Turing) falla las comprobaciones de salida exacta y es 6-14 veces más lenta que una RTX 4070; AMD Radeon y Apple Silicon no disponibles.
- Cabe en GPU de consumo: sí, en RTX 30/40 con 12 GB o más.
- Sistema: driver NVIDIA 580+ (Windows) o 570+ (Linux); 32 GB de RAM del sistema recomendados para chats muy largos.
- Opciones de despliegue: exclusivamente el fork propio de llama.cpp del autor (MIT), distribuido en bundles para Windows y Linux desde GitHub Releases; no es compatible con vLLM, Ollama, TGI ni llama.cpp estándar.
- Latencia y throughput: decodificación de 64,5 tok/s a 4k, 57,9 a 32k, 42,4 a 117k y 29,75 a 245k en RTX 4070 con los valores por defecto del bundle.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kintsugi-Inkling-2-Mini | 26,4B (MoE, según model card) | 262.144 | GGUF EXL3 2-3 bits | Apache-2.0 | Motor propio (fork de llama.cpp) |
| Inkling-2-Mini (oficial) | 26,4B (MoE) | no disponible | safetensors (NVFP4/MXFP8 en las pruebas) | Apache-2.0 | Pesos oficiales de Thinking Machines |
| UD-Q2_K_XL de Unsloth (Inkling 2 Mini) | 26,4B (MoE) | no disponible | GGUF 2 bits (9,14 GB) | Apache-2.0 (heredada) | llama.cpp estándar |

## Limitaciones y advertencias

- Dependencia de un motor propietario: solo el fork de llama.cpp del autor carga el archivo; no funciona con llama.cpp estándar, Ollama, vLLM ni TGI, lo que limita la portabilidad y añade riesgo de mantenimiento.
- Cobertura de hardware restringida: sin soporte para Hopper, Blackwell, AMD Radeon ni Apple Silicon; Turing no es compatible y es 6-14 veces más lento.
- Discrepancia en el número de parámetros: la model card indica 26,4B, pero el safetensors del repositorio reporta 5.371.175.424 parámetros; conviene verificar antes de dimensionar el despliegue.
- Riesgo de alucinación: no documentado en la información disponible; como todo modelo generativo, requiere validación en producción.
- Sesgos conocidos: no documentados en la información disponible.
- Idiomas soportados: no disponibles; no se puede garantizar calidad multilingüe.
- Licencia Apache-2.0 permite uso comercial, pero el motor es MIT y los bundles incluyen capas adicionales (lanzador, chats guardados) cuyo soporte depende del autor.
- El modo de dos ranuras (`INKLING_SLOTS=2`) no es bit-equivalente al de una ranura y reduce las celdas en VRAM y los chats guardados.
- La fidelidad medida (KL 0,0310) es buena pero no perfecta; en texto de usuario/herramienta por encima de 1k tokens el KL es superior al de Unsloth (0,76 frente a 0,61), según la propia model card.
- Modelo solo texto: sin capacidades de visión ni audio.

## Enlaces

- Hugging Face: https://huggingface.co/CaryPalmer/Kintsugi-Inkling-2-Mini
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Artículo del método Kintsugi: https://github.com/professorpalmer/kintsugi-method
- Repositorio del proyecto: https://github.com/professorpalmer/Kintsugi-Inkling-2-Mini
- Bundles (Windows/Linux): https://github.com/professorpalmer/Kintsugi-Inkling-2-Mini/releases
- Benchmarks detallados: https://github.com/professorpalmer/Kintsugi-Inkling-2-Mini/blob/main/benchmarks/README.md
- Imagen de la model card: https://raw.githubusercontent.com/professorpalmer/Kintsugi-Inkling-2-Mini/main/inkling-card.png
