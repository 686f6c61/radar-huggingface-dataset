# CaryPalmer/Kintsugi-27B

## Resumen

Kintsugi-27B es una cuantización extrema de Qwen3.8-27B publicada por CaryPalmer que comprime el modelo base a 2,47 bits por peso manteniendo, según el autor, la ventana de contexto completa de 262.144 tokens en una única GPU de 12 GB. El objetivo declarado es preservar el comportamiento de agente y el recall a larga distancia del modelo BF16 original mientras se reduce el espacio en VRAM en más de un orden de magnitud. Se distribuye como un GGUF empaquetado con un motor de inferencia propio (bundle con launcher para Windows, Linux y macOS) y se apoya en el modelo base Qwen3.8-27B, también bajo licencia Apache-2.0.

La relevancia del proyecto está en su tesis técnica: que una cuantización de 2 bits puede igualar a BF16 en tareas de agente y en recuperación de información a 245k tokens, algo que normalmente se pierde en cuantizaciones tan agresivas. El autor reporta paridad en AppWorld (294/336 frente a 293/336 de BF16) y una fidelidad top-1 del 90,8 % respecto a BF16 en un conjunto de validación público. El repositorio incluye además un proyector de visión opcional y un drafter para decodificación especulativa.

El modelo se publica bajo Apache-2.0 y con etiquetas que indican compatibilidad con endpoints OpenAI, lo que facilita su integración en herramientas de desarrollo. La información disponible sobre idiomas, pipeline y parámetros de entrenamiento es limitada; los datos de arquitectura y entrenamiento que figuran a continuación proceden del modelo base cuando se indican como tales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen3.8-27B; detalles no disponibles en la informacion proporcionada) |
| Parametros totales | 6.758.409.216 (safetensors del repo); el nombre comercial indica 27B, discrepancia no aclarada en la model card |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (contexto completo segun el autor); recall verificado a 245k tokens |
| Tipos de cuantizacion | GGUF a 2,47 bits por peso (archivo principal `Kintsugi-27B-12G.gguf`); proyector de vision en Q8_0; drafter DFlash2 en Q4_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo base Qwen3.8-27B ni detalla el proceso de cuantización más allá del resultado: 2,47 bits por peso efectivos con preservación del contexto completo. El paquete incluye un motor de inferencia propio con soporte para decodificación especulativa mediante un drafter DFlash2 (archivo separado de 1,1 GB en Q4_0) y una estrategia adicional de "MTP + lookup" para el borrador de tokens. También se ofrece un proyector de visión opcional (`mmproj-Qwen3.8-27B-Q8_0.gguf`, 629 MB) convertido por ggml-org a partir del encoder de visión de Qwen, que habilita entrada de imágenes en formato OpenAI y Anthropic.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base. La innovación destacable es la propia cuantización: el autor afirma que la fidelidad respecto a BF16 alcanza un top-1 del 90,8 %, una KL media de 0,058 y un ratio de perplejidad de 1,035 en el conjunto dorado del "public quant-challenge". El motor incluye un modo de esfuerzo de razonamiento configurable (`KINTSUGI_EFFORT` = `low`, `medium`, `xhigh`).

## Capacidades

- Generación de texto conversacional multi-turno con contexto muy largo (hasta 262.144 tokens).
- Razonamiento de agente multi-paso: el autor reporta 294/336 en AppWorld con semillas nuevas, a la par de BF16.
- Tool calling y function calling: 505/800 en BFCL v3 multi-turn, por encima de BF16 (461/800) en una única ejecución con configuración distinta.
- Persistencia de instrucciones de sistema a lo largo de trazas de agente de hasta 237k tokens (5/5 reglas mantenidas, sin degradación).
- Generación de código: 161/164 en HumanEval en modo de pensamiento medio.
- Recall exacto a larga distancia: 24/24 needles y 20/20 copias exactas de código a 245k tokens.
- Visión opcional mediante proyector: 19/20 en el conjunto de imágenes del autor, con soporte de imágenes en tool results.
- Compatibilidad con harnesses de codificación: Claude Code, OpenAI Codex, Pi y OpenCode (5/6 tareas cada uno, sin tool calls malformadas).
- Servidor compatible con la API de OpenAI en `http://127.0.0.1:8080/v1`.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Agentes de codificación autónomos en local: el modelo mantiene las reglas del sistema y el estado de la tarea a lo largo de sesiones de agente de cientos de miles de tokens, y el autor verifica su funcionamiento con Claude Code, Codex, Pi y OpenCode, lo que permite ejecutar flujos de trabajo de desarrollo sin enviar código a la nube.
- Asistentes con memoria de conversación extensa: con 262k tokens de contexto y una restauración de conversación de 245k tokens en 2,8 s, es adecuado para asistentes que deben recordar decisiones, ficheros y trazas previas durante días de trabajo.
- Análisis de repositorios completos: la ventana permite cargar varios ficheros y trazas de ejecución en una sola pasada, con recall exacto de fragmentos de código (20/20 copias exactas a 245k tokens), útil para auditorías o refactorizaciones guiadas.
- Automatización de tareas con tool calling: la puntuación de 505/800 en BFCL v3 y la ausencia de tool calls malformadas en los harnesses probados lo hacen apto para pipelines que encadenan APIs, shell y edición de ficheros.
- Despliegue en estaciones de trabajo con GPU de consumo: al caber en 12 GB de VRAM, permite ofrecer un asistente de 27B en un RTX 4070 o similar, con 67 tokens/s a 64k de contexto y 31 tokens/s a 245k, sin depender de servidores externos.
- Procesamiento de documentos e imágenes: con el proyector opcional puede responder preguntas sobre capturas de pantalla o diagramas dentro de una conversación larga (4/4 imágenes tras 117k tokens), por ejemplo para soporte técnico asistido por capturas.
- Investigación sobre cuantización extrema: sirve como referencia reproducible para estudiar la degradación de modelos a 2 bits, con conjuntos de evaluación y scripts publicados en el repositorio de GitHub.

## Benchmarks y rendimiento

| Prueba | Kintsugi-27B | BF16 (Qwen3.8-27B) |
|---|---|---|
| AppWorld agent tasks (semillas 102 + 103) | 294 / 336 | 293 / 336 |
| BFCL v3 multi-turn tool use (800 entradas) | 505 / 800 | 461 / 800 |
| Reglas de system prompt tras hasta 237k tokens | 5 / 5 mantenidas | no peor que BF16 (según autor) |
| HumanEval (pensamiento medio) | 161 / 164 | no disponible |
| Needles a 245k tokens | 24 / 24 | no disponible |
| Copias exactas de código a 245k tokens | 20 / 20 | no disponible |
| Fidelidad a BF16 (conjunto dorado público) | top-1 90,8 %, KL media 0,058, ratio PPL 1,035 | referencia |
| Imágenes (proyector opcional) | 19 / 20 | llama.cpp estándar con los mismos ficheros: 19 / 20 |

Rendimiento de decodificación en RTX 4070 (MTP + lookup): 67 tok/s a 64k, 59 tok/s a 117k, 49 tok/s a 200k y 31 tok/s a 245k. Restauración de una conversación guardada de 245k tokens: 2,8 s. En RTX 5070 y H100 el autor reporta KL dentro del 0,03 % y 0,02 % respecto a la RTX 4070, con 24/24 needles y 20/20 copias exactas a 245k tokens.

## Requisitos de hardware

- VRAM: el archivo principal está diseñado para caber en 12 GB; con el proyector de visión en modo GPU se añaden unos 1,3 GB, dejando aproximadamente 61.000 de 144.000 celdas K/V en VRAM en una tarjeta de 12 GB.
- GPU NVIDIA soportadas: RTX 20/30/40/50 (12 GB o más), H100/H200 (Hopper, desde el bundle v1.1.2). B200 y DGX Spark (GB10) ejecutan el código portable del motor, sin probar. Intel no soportado.
- AMD: build experimental para RDNA4 (R9700, RX 9070, RX 9070 XT) en Linux, en fase de pruebas.
- Apple Silicon: probado en M5 Max de 48 GB; Macs de 16 GB y M1-M4 sin probar.
- Consumo de disco: el repo ocupa 22,2 GB; el bundle de Windows pesa 679 MB y el tarball de Linux 786 MB.
- Controladores: NVIDIA 580+ en Windows y 570+ en Linux (glibc 2.34+, Ubuntu 22.04/24.04).
- Despliegue: motor propio con launcher (`start-server.ps1` / `start-server.sh`) que expone una API compatible con OpenAI; en Mac, kit `mac/` con `run.sh install`, `run.sh chat` y `run.sh serve`. No se menciona soporte para vLLM, TGI, Ollama ni llama.cpp estándar para el modelo cuantizado (solo para el proyector de visión).
- Latencia y throughput: ver la tabla de benchmarks (31-67 tok/s en RTX 4070 según longitud de contexto); 1-3 s por imagen en modo GPU y 5-25 s en modo CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kintsugi-27B | 6.758.409.216 (según safetensors); nombre comercial 27B | 262.144 tokens | GGUF 2,47 bits/peso | Apache-2.0 | Hugging Face + GitHub Releases |
| Qwen3.8-27B (BF16) | 27B (según nombre) | 262.144 tokens | BF16 | Apache-2.0 | Hugging Face (referencia del autor) |
| Qwen3.8-27B-GGUF (ggml-org) | 27B (según nombre) | 262.144 tokens | GGUF estándar (Q8_0 para el proyector) | Apache-2.0 | Hugging Face |

No se dispone de datos de benchmarks de terceros ni de otras cuantizaciones de 2 bits comparables en la información proporcionada. La comparación directa con BF16 figura en la sección de benchmarks.

## Limitaciones y advertencias

- Discrepancia de tamaño: el nombre indica 27B pero los safetensors del repo suman 6.758.409.216 parámetros; la model card no aclara esta diferencia, lo que conviene verificar antes de planificar recursos.
- La cuantización a 2,47 bits introduce degradación medible: top-1 del 90,8 % y KL media de 0,058 respecto a BF16, no una equivalencia exacta.
- El benchmark BFCL v3 se ejecutó una sola vez por modelo y con configuración distinta entre Kintsugi y BF16, según admite el propio autor; los resultados no son estrictamente comparables.
- El test de persistencia de instrucciones "solo detecta gaps grandes", según la documentación citada, por lo que puede no capturar degradaciones sutiles.
- El proyector de visión no funciona con el drafter DFlash2; con imágenes activadas la decodificación especulativa se limita a MTP + lookup.
- La página web integrada del bundle no está probada con imágenes.
- Soporte de hardware limitado y parcialmente sin probar: Macs de 16 GB y M1-M4 no verificados, AMD en fase experimental, Intel sin soporte, B200/DGX Spark sin probar.
- Idiomas soportados no documentados; no se puede garantizar calidad multilingüe más allá de lo que herede del modelo base.
- Riesgo de alucinación y sesgos: no se documentan evaluaciones de sesgo ni de tasas de alucinación en la información disponible.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento en producción; los benchmarks son reproducidos por el propio autor.
- Dependencia de un motor de inferencia propietario del autor (bundle con launcher), no de llama.cpp estándar, lo que limita la portabilidad a otros stacks.

## Enlaces

- Hugging Face: https://huggingface.co/CaryPalmer/Kintsugi-27B
- Repositorio GitHub: https://github.com/professorpalmer/Kintsugi-27B
- Releases (bundles Windows/Linux y build AMD): https://github.com/professorpalmer/Kintsugi-27B/releases/latest
- Build AMD experimental: https://github.com/professorpalmer/Kintsugi-27B/releases/tag/amd-test-1
- Metodología de benchmarks: https://github.com/professorpalmer/Kintsugi-27B/blob/main/benchmarks/README.md
- Detalles BFCL: https://github.com/professorpalmer/Kintsugi-27B/blob/main/benchmarks/bfcl/README.md
- Estudio de persistencia a profundidad: https://github.com/professorpalmer/Kintsugi-27B/blob/main/research/persistence-at-depth/README.md
- Estudio entre arquitecturas: https://github.com/professorpalmer/Kintsugi-27B/blob/main/research/cross-architecture/README.md
- Configuración de harnesses: https://github.com/professorpalmer/Kintsugi-27B/blob/main/harnesses/README.md
- Documentación del bundle: https://github.com/professorpalmer/Kintsugi-27B/blob/main/bundle/README.md
- Guía para Mac: https://github.com/professorpalmer/Kintsugi-27B/blob/main/mac/README.md
- Kit para Mac: https://github.com/professorpalmer/Kintsugi-27B/tree/main/mac
- Proyector de visión (ggml-org): https://huggingface.co/ggml-org/Qwen3.8-27B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
