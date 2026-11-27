# CaryPalmer/Kintsugi-Inkling-2-Mini

## Resumen

Kintsugi-Inkling-2-Mini es una cuantización agresiva a 2-3 bits del modelo Inkling 2 Mini de Thinking Machines, un mixto de expertos (MoE) "looped" de 26.400 millones de parámetros publicado bajo licencia Apache-2.0. El trabajo lo firma CaryPalmer, que aplica su método Kintsugi (documentado en un paper con DOI propio) para reparar el daño de cuantización en los puntos donde las tareas se rompen, no donde las medias agregadas parecen aceptables. El resultado es un único fichero GGUF de 9,1 GB que, según el autor, mantiene una fidelidad alta respecto a los pesos oficiales: KL medio de 0,0310 y 93,62 % de coincidencia en el token top-1 sobre un conjunto dorado público.

La relevancia del artefacto está en su propuesta de ingeniería: ejecutar un MoE de 26,4B con 262.144 tokens de contexto en una sola GPU de 12 GB. Para ello el autor distribuye un fork propio de llama.cpp (licencia MIT) que mantiene la caché K/V de las ocho pasadas de atención global a 4 bits (q4_0), de modo que hasta 250.000 tokens caben en VRAM y el resto se desborda a RAM del sistema. El paquete incluye lanzador, capa de chats guardados, una guarda anti-repetición para bucles de agente y un modo opcional de dos ranuras.

Es importante subrayar que este repositorio no contiene pesos en safetensors ni un modelo entrenado desde cero: es una distribución de cuantización con un motor de inferencia específico. Solo ese fork carga el fichero, lo que limita la portabilidad frente a ecosistemas estándar como Ollama o vLLM. La información disponible sobre el modelo base (idiomas, dataset de entrenamiento, benchmarks originales) es escasa en la documentación proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE "looped" (modelo base Inkling 2 Mini); cuantización EXL3 trellis sobre los expertos |
| Parametros totales | 5.371.175.424 (safetensors del repo); 26,4B en el modelo base según la model card |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (con caché K/V a 4 bits en el fork del autor) |
| Tipos de cuantizacion | 2 y 3 bits por experto; 2,444 bits por peso de media sobre los expertos; caché K/V q4_0 (4 bits) por defecto, 8 bits opcional |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (fichero único `Kintsugi-Inkling-2-Mini-12G.gguf`, SHA-256 `7d93d5e8e61f6694776ec8b488751787a7dd3cb745d4f9eaee9f0b78b0e60cec`) |

## Arquitectura y entrenamiento

El modelo base es un mixto de expertos de 26,4B parámetros descrito como "looped", es decir, con capas o bloques de expertos reutilizados en varias pasadas, y con ocho pasadas de atención global que el fork del autor gestiona de forma explícita en la caché K/V. La cuantización no emplea GPTQ ni AWQ convencionales, sino codificación trellis EXL3 a 2 y 3 bits por experto, ajustada por el autor sobre los pesos originales de Thinking Machines. La media declarada es de 2,444 bits por peso sobre los expertos, lo que explica que un modelo de 26,4B quepa en un GGUF de 9,1 GB.

El método Kintsugi se presenta como una técnica de reparación de daño de cuantización guiada por tareas: en lugar de minimizar el error medio de reconstrucción, localiza los puntos donde el comportamiento se degrada en tareas concretas y ajusta ahí. El autor reporta KL medio de 0,0310 y 93,62 % de coincidencia top-1 frente a los pesos oficiales, y compara con Unsloth UD-Q2_K_XL (9,14 GB) medido en el mismo motor el 2026-11-21: KL 0,0426 y 92,70 %, lo que supone un 27,3 % menos de KL para su fichero (27,7 % con la caché K/V por defecto). No se detallan en la información disponible el volumen de tokens de entrenamiento del modelo base, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto conversacional y razonamiento multi-turno, con modo de pensamiento explícito (`reasoning_content`) que debe devolverse al servidor en cada turno anterior.
- Uso como agente en tareas de varios pasos: el autor valida con AppWorld y con arneses de programación (Claude Code, Codex, Pi, OpenCode).
- Generación y edición de código dentro de arneses agénticos: 5 de 6 tareas superadas en cada uno de los cuatro arneses probados.
- Recuperación de información en contexto muy largo: 24/24 agujas y 20/20 copias de código a 64k, 117k y 245k tokens con la caché q4_0 por defecto.
- Servidor compatible con la API de OpenAI en `http://127.0.0.1:8080/v1`, lo que habilita integración con clientes que hablan ese protocolo.
- Guarda anti-repetición para bucles de agente, activada por defecto: según el autor, rompió el bucle en 6 y 7 de 10 intentos en dos puntos de bloqueo, frente a 0 de 10 sin ella.
- Modo opcional de dos ranuras (`INKLING_SLOTS=2`) con ventana compartida, menos celdas en VRAM y chats guardados desactivados; el autor advierte que no es bit a bit igual al modo de una ranura.
- Capacidades multimodales, de audio o de tool calling nativo: no documentadas en la información disponible.

## Casos de uso

- Agentes de programación en local: el modelo se integra con Claude Code, Codex, Pi y OpenCode a través del servidor compatible con OpenAI; encaja en estaciones de trabajo con una RTX 4070 o similar donde no se quiere enviar código a la nube.
- Análisis de repositorios completos: con 262.144 tokens de contexto y recuperación verificada a 245k, permite cargar árboles de código extensos, documentación y trazas de error en una sola ventana sin trocear.
- Automatización de tareas de escritorio y flujos AppWorld: el autor reporta 595 frente a 592 tareas resueltas frente a los pesos oficiales en 672 ejecuciones emparejadas, lo que respalda su uso como agente de acciones sobre aplicaciones.
- Asistente conversacional de contexto largo: chats multi-turno con historial extenso, siempre que el cliente reenvíe el `reasoning_content` de turnos anteriores; el autor advierte de degradación notable si no se hace.
- Procesamiento por lotes de documentos largos en una sola GPU de 12 GB: informes, contratos o expedientes que superan los 100k tokens y deben analizarse con un coste de hardware contenido.
- Prototipado e investigación sobre cuantización extrema: el par fichero GGUF más paper Kintsugi sirve como banco de pruebas reproducible para estudiar la degradación de MoE a 2-3 bits y comparar metodologías.
- Despliegue en clúster con Hopper: en H100 PCIe de 80 GB el motor arranca con las 262.144 celdas de contexto en VRAM, útil para servir sesiones largas con mayor margen de memoria.

## Benchmarks y rendimiento

| Prueba | Kintsugi (RTX 4070 12 GB) | Referencia |
|---|---|---|
| Fidelidad a pesos oficiales (KL medio / top-1) | 0,0310 / 93,62 % | Unsloth UD-Q2_K_XL: 0,0426 / 92,70 % |
| AppWorld, 672 ejecuciones emparejadas | 595 | Pesos oficiales NVFP4/MXFP8: 592 (p = 0,78, empate estadístico) |
| AppWorld frente a setup de Unsloth | 298 de 336 | 283 y 281-283 de 336 |
| Recuperación a 64k / 117k / 245k | 24/24 agujas + 20/20 copias en cada profundidad | no disponible |
| Decodificación a 4k / 32k / 117k / 245k (tok/s) | 64,5 / 57,9 / 42,4 / 29,75 | no disponible |
| Arneses de código (6 tareas cada uno) | 5 de 6 en Claude Code, Codex, Pi y OpenCode | no disponible |
| RTX 5060 Ti 16 GB: KL / top-1 en chequeo de 10 documentos | 0,0397 / 92,60 % | RTX 4070: 0,0400 / 92,51 % |
| H100 PCIe 80 GB: KL / top-1 en el mismo chequeo | 0,0401 / 92,57 % | no disponible |
| RTX 3080 Ti: acuerdo top-1 | 97,8 % | KL un 7,5 % inferior al de la RTX 4070 |

## Requisitos de hardware

- VRAM: 12 GB como mínimo para el fichero de 9,1 GB más caché y overhead; el autor indica que hasta 250.000 tokens de contexto caben en VRAM en una tarjeta libre y el resto se desborda a RAM del sistema.
- RAM del sistema: 32 GB recomendados para conversaciones muy largas.
- GPU validadas: RTX 4070 (Ada, Windows y Linux), RTX 3080 Ti (Ampere, Linux), RTX 5060 Ti 16 GB (Blackwell, Linux) y H100 PCIe 80 GB (Hopper, Linux). RTX 50 para portátiles y RTX PRO Blackwell no verificadas.
- Controladores: 580+ en Windows, 570+ en Linux.
- Despliegue: exclusivamente el fork de llama.cpp del autor (MIT), distribuido en paquetes para Windows y Linux desde GitHub Releases. No hay soporte documentado para vLLM, TGI, Ollama ni llama.cpp upstream.
- Throughput medido en RTX 4070: 64,5 tok/s a 4k de contexto, 57,9 a 32k, 42,4 a 117k y 29,75 a 245k.
- El servidor relee todo el contexto en cada turno, lo que condiciona la latencia en conversaciones largas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / motor | Licencia | Notas |
|---|---|---|---|---|---|
| Kintsugi-Inkling-2-Mini | 26,4B (MoE) | 262.144 | GGUF EXL3 2-3 bits, fork propio de llama.cpp | Apache-2.0 | KL 0,0310; 9,1 GB |
| Inkling 2 Mini (oficial) | 26,4B (MoE) | no disponible | Pesos originales (NVFP4/MXFP8 en las pruebas) | Apache-2.0 | Referencia de calidad; requiere mucha más VRAM |
| Unsloth UD-Q2_K_XL de Inkling 2 Mini | 26,4B (MoE) | no disponible | GGUF Q2_K_XL, 9,14 GB | Apache-2.0 (del base) | KL 0,0426; peor en texto de usuario y herramientas por encima de 1k tokens (0,76 frente a 0,61) |

## Limitaciones y advertencias

- Solo lo carga el fork de llama.cpp del autor; no es portable a otros motores sin trabajo adicional.
- El propio autor reconoce que en texto de usuario y de herramientas por encima de 1k tokens su fichero obtiene peor KL que Unsloth (0,76 frente a 0,61), aunque gane en la media global.
- En uso multi-turno y agéntico es obligatorio reenviar el `reasoning_content` de turnos anteriores; sin ello los resultados empeoran notablemente y el autor no midió ese caso.
- El servidor reprocesa todo el contexto en cada turno, lo que penaliza la latencia en sesiones largas.
- El modo de dos ranuras no es bit a bit equivalente al de una ranura, según el autor.
- La guarda anti-repetición se validó en dos puntos de bloqueo con 10 intentos cada uno: evidencia limitada.
- La cuantización a 2,444 bits por peso implica pérdida de calidad frente a los pesos oficiales, aunque la diferencia medida en AppWorld sea estadísticamente plana.
- No hay información sobre idiomas soportados, sesgos, tasas de alucinación ni datos de entrenamiento del modelo base en la documentación proporcionada.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y del fork del motor por separado.
- Creado y actualizado el 2026-11-23, con 1.840 descargas y 17 likes: adopción todavía baja y poca validación independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/CaryPalmer/Kintsugi-Inkling-2-Mini
- Paper del método Kintsugi: https://github.com/professorpalmer/kintsugi-method
- DOI del paper: https://doi.org/10.5281/zenodo.24455575
- Repositorio del proyecto: https://github.com/professorpalmer/Kintsugi-Inkling-2-Mini
- Paquetes (Windows y Linux): https://github.com/professorpalmer/Kintsugi-Inkling-2-Mini/releases
- Benchmarks: https://github.com/professorpalmer/Kintsugi-Inkling-2-Mini/blob/main/benchmarks/README.md
- Guía de arneses: https://github.com/professorpalmer/Kintsugi-Inkling-2-Mini/blob/main/harnesses/README.md
- Imagen de la model card: https://raw.githubusercontent.com/professorpalmer/Kintsugi-Inkling-2-Mini/main/inkling-card.png
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
