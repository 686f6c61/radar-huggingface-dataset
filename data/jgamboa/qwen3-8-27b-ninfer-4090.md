# jgamboa/Qwen3.8-27B-NInfer-4090

## Resumen

`jgamboa/Qwen3.8-27B-NInfer-4090` es un artefacto de inferencia derivado del modelo oficial [neroued/Qwen3.8-27B-NInfer](https://huggingface.co/neroued/Qwen3.8-27B-NInfer), publicado por el usuario jgamboa. No se trata de un modelo entrenado desde cero ni de un ajuste fino: los pesos son idénticos byte a byte a los del artefacto oficial (proyecciones Q4/Q5, vocabulario Q8, cabeza MTP, drafter DFlash2, torre de visión, cabeza de propuesta indexada, tokenizador y plantilla de chat). El único cambio es de permisos: 512 entradas de proyección pasan de `A16Only` a `AllowA8`, lo que habilita que los GEMM de prefill cuantizen sus activaciones a int8 y se ejecuten sobre tensor cores int8.

El modelo base es Qwen3.8-27B, un modelo multimodal de tipo image-text-to-text de 27.000 millones de parámetros (según la denominación del propio artefacto), con soporte de decodificación especulativa mediante MTP (multi-token prediction), un drafter DFlash2 y verificación por n-gramas. La relevancia de esta variante es puramente de rendimiento en hardware de consumo: consigue acelerar el prefill entre un 75 % y un 120 % respecto al artefacto oficial en una única RTX 4090, manteniendo la fase de decodificación sin cambios.

La contrapartida es una portabilidad prácticamente nula. El fichero solo carga en una build concreta del motor NInfer (rama `feat/bonsai-ternary` del repositorio JGamboa/ninfer-4090-windows) sobre una NVIDIA RTX 4090 (`sm_89`) y no es compatible con llama.cpp, vLLM ni Transformers. Es, por tanto, un artefacto muy especializado, orientado a un único perfil de hardware y a un único runtime.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la informacion proporcionada (modelo base Qwen3.8-27B; el artefacto incluye torre de vision, cabeza MTP y drafter DFlash2) |
| Parametros totales | 27B (segun la denominacion del modelo base; no se detalla la cifra exacta) |
| Longitud de contexto | hasta 100.000 tokens en la configuracion de ejemplo del autor; se han medido prompts de 8K, 64K y 128K tokens |
| Tipos de cuantizacion | pesos Q4/Q5 en proyecciones y Q8 en vocabulario; activaciones int8 en prefill (por token y por grupos de 64 canales); KV cache en rk4v4-e8 o int8 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.ninfer` (formato propietario del motor NInfer), fichero de 19,0 GiB (20.437.521.664 bytes), SHA-256 `49bf76388e139defbe416c8cc0079abc1c78b59be2a41ff56ae960aeacf5fc19` |

## Arquitectura y entrenamiento

No hay información sobre el entrenamiento del modelo base en la documentación disponible: se desconoce el número de tokens, la composición del dataset y si hubo fases de RLHF o DPO. Lo que sí detalla el autor es la composición del artefacto empaquetado: pesos oficiales sin modificar, componentes de texto, visión, MTP y DFlash2, seis recursos y 1.184 objetos vinculados, todos verificados como idénticos byte a byte al artefacto de origen (SHA-256 `81f924d4...0375da`).

La innovación técnica se limita a la ruta de prefill. Cuando un paso de prefill procesa 129 tokens o más, las activaciones se cuantizan por token y por grupos de 64 canales (`scale = amax / 127`, los mismos grupos que las escalas de peso) y los códigos Q4/Q5 alimentan MMAs `m16n8k32` de tensor cores int8; la suma int32 de cada grupo se escala en FP32 por `weight_scale x activation_scale`. La fase de decodificación —incluidas la verificación MTP, DFlash2 y por n-gramas— mantiene la ruta BF16, de modo que el texto y la velocidad de decodificación son idénticos a los del artefacto oficial. El proceso de conversión es un simple cambio de permisos que tarda unos cuatro minutos en CPU y no requiere el checkpoint BF16. Como consecuencia, con prompts cortos (ningún paso de prefill alcanza 129 tokens) la salida greedy es idéntica a la oficial; con prompts largos, algunas respuestas divergen en un token posterior con redacción equivalente (4 de 6 prompts de prueba, entre las palabras 3 y 152).

## Capacidades

- Generación de texto y comprensión de imágenes: la etiqueta de pipeline es `image-text-to-text`, e incluye torre de visión en el artefacto.
- Modo de razonamiento explícito: la orden de ejemplo utiliza `--preserve-thinking`, lo que implica soporte de modo thinking (no se detalla su funcionamiento).
- Decodificación especulativa con predicción multi-token (MTP) y drafter DFlash2, más verificación por n-gramas.
- Recuperación de información en contextos largos: pasa pruebas de needle-in-a-haystack con respuesta exacta a 8K, 64K y 128K tokens.
- Ejecución de tareas deterministas: supera 45 de 45 tareas del conjunto `tools/eval` con el modo thinking desactivado.
- Capacidades multilingües: no disponible.
- Soporte de tool calling o function calling: no disponible en la información proporcionada.
- Soporte de agentes o razonamiento multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Procesamiento de documentos largos en una sola GPU de consumo: con 1,6 s para un prompt de 8K tokens y 17,2 s para uno de 64K, es viable analizar contratos, informes o expedientes completos en una RTX 4090 sin recurrir a hardware de centro de datos.
- Resumen y extracción de información sobre corpus extensos: la respuesta exacta en pruebas needle-in-a-haystack a 128K tokens permite localizar datos concretos dentro de contextos muy largos, con 43,0 s de prefill para ese tamaño.
- Asistente local con contexto conversacional amplio: configurado con `--max-context 100000 --kv-capacity 100000`, admite conversaciones multi-turno de decenas de miles de tokens manteniendo una decodificación de 52 tok/s.
- Atención al cliente con base documental inyectada: la ventana de contexto permite incluir manuales o políticas completas en el propio prompt, evitando un sistema RAG externo, a costa de un prefill de entre 2 y 43 segundos según el tamaño.
- Interacción con capturas o documentos escaneados: la torre de visión y el pipeline image-text-to-text permiten plantear consultas sobre imágenes, útil para revisión de formularios o extracción de datos de pantallazos.
- Evaluación comparativa de motores de inferencia: el artefacto sirve para medir el impacto real de la ruta int8 en prefill frente a llama.cpp con un GGUF Q4_K_S (2.756 / 2.729 tok/s en `pp512` / `pp2048` en la misma máquina).
- Laboratorio de decodificación especulativa: al exponer opciones como `--spec mtp --draft-tokens 3 --lm-head-draft --ngram chain`, permite experimentar con combinaciones de drafter sin reentrenar nada.

## Benchmarks y rendimiento

Medidas por el autor en una RTX 4090 a frecuencias de stock, Windows 11, CUDA 13.4, con la tarjeta gestionando además un escritorio 4K a 60 Hz, sobre el mismo binario y con ejecuciones alternadas.

| Metrica | Artefacto oficial | Este artefacto |
|---|---:|---:|
| Prefill `pp512` / `pp2048` (`ninfer_bench`, KV int8) | 2.536 / 2.762 tok/s | 4.436 / 5.008 tok/s |
| Prefill, prompt de 8K tokens (needle test, KV rk4v4-e8) | 2,9 s | 1,6 s |
| Prefill, prompt de 64K tokens | 27,4-27,6 s | 17,2 s |
| Prefill, prompt de 128K tokens | 64,0 s | 43,0 s |
| Needle-in-a-haystack a 8K / 64K / 128K | exacto | exacto |
| Perplejidad rapida, cuatro corpus (KV bf16) | 4,800742 | 4,794439 |
| Calidad en tareas, 45 tareas deterministas (`tools/eval`, thinking off) | 45/45 | 45/45 |
| Decodificacion sin especulacion (`tg128`) | 52,0 tok/s | 52,0 tok/s |
| Tiempo de ronda MTP 3 | 23,7 ms | 23,7 ms |

Referencia adicional aportada por el autor: llama.cpp oficial (`a894dae`) en la misma máquina, con un GGUF Q4_K_S de Qwen3.8-27B y KV q8_0 con flash attention, alcanza 2.756 / 2.729 tok/s en `pp512` / `pp2048`.

## Requisitos de hardware

- GPU: exclusivamente NVIDIA RTX 4090 (`sm_89`). El autor no menciona otras arquitecturas compatibles.
- VRAM: el fichero de pesos ocupa 19,0 GiB sobre un repositorio de 20,4 GB; debe caber junto con la caché KV dimensionada por `--kv-capacity`, más el consumo del escritorio si la tarjeta lo gestiona. No se publica un desglose de VRAM pico.
- Sistema operativo y runtime: Windows 11 con CUDA 13.4 en las mediciones del autor.
- Despliegue: solo mediante `ninfer-serve.exe` de la build NInfer de la rama `feat/bonsai-ternary` del repositorio JGamboa/ninfer-4090-windows. No carga en llama.cpp, vLLM, Transformers, Ollama ni TGI.
- Latencia y throughput medidos: 4.436 / 5.008 tok/s de prefill en `pp512` / `pp2048`; 52,0 tok/s de decodificación sin especulación; 23,7 ms por ronda con MTP 3; 1,6 s / 17,2 s / 43,0 s de prefill para prompts de 8K / 64K / 128K.
- Parametros de servicio del ejemplo: `--max-context 100000 --kv-capacity 100000 --kv-dtype rk4v4-e8 --max-concurrency 3 --prefill-chunk 1408`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Prefill `pp512` / `pp2048` | Decodificacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| jgamboa/Qwen3.8-27B-NInfer-4090 (este) | 27B | hasta 100.000 tokens configurados; probado a 128K | 4.436 / 5.008 tok/s | 52,0 tok/s | Apache 2.0 | solo motor NInfer en RTX 4090 |
| neroued/Qwen3.8-27B-NInfer (artefacto oficial) | 27B | no disponible | 2.536 / 2.762 tok/s | 52,0 tok/s | Apache 2.0 | motor NInfer |
| Qwen3.8-27B en GGUF Q4_K_S con llama.cpp | 27B | no disponible | 2.756 / 2.729 tok/s | no disponible | Apache 2.0 (modelo base) | amplia (llama.cpp) |

No se dispone de datos de benchmarks de calidad comparados con otros modelos de la misma categoría, por lo que la comparación se limita a rendimiento de inferencia y compatibilidad.

## Limitaciones y advertencias

- Portabilidad prácticamente nula: el fichero no carga en llama.cpp, vLLM ni Transformers, ni en builds del motor NInfer sin la ruta de prefill int8. Queda ligado a una rama concreta de un repositorio y a una única arquitectura de GPU (`sm_89`).
- Divergencia de salida con prompts largos: cuando algún paso de prefill alcanza 129 tokens, la salida greedy puede diferir de la oficial a partir de un token posterior (observado en 4 de 6 prompts de prueba, entre las palabras 3 y 152). No es un fallo, pero invalida la reproducibilidad exacta respecto al artefacto de referencia.
- Riesgo de alucinación: no se documenta ninguna evaluación específica de fidelidad factual más allá del test needle-in-a-haystack y las 45 tareas deterministas.
- Sesgos: no se publica ninguna evaluación de sesgos, toxicidad o equidad.
- Idiomas soportados: no disponibles; tampoco hay cobertura multilingüe documentada.
- Licencia: Apache 2.0, igual que el artefacto base, por lo que no hay restricción conocida para uso comercial del artefacto. El autor no aclara si los términos del modelo base Qwen3.8-27B añaden condiciones adicionales.
- Métricas medidas por el propio autor en una configuración concreta (Windows 11, CUDA 13.4, tarjeta conduciendo un escritorio 4K); pueden no reproducirse en otros entornos.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación externa de los resultados.
- No se detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO, lo que impide evaluar riesgos derivados del entrenamiento.

## Enlaces

- HuggingFace: https://huggingface.co/jgamboa/Qwen3.8-27B-NInfer-4090
- Modelo base en HuggingFace: https://huggingface.co/neroued/Qwen3.8-27B-NInfer
- Repositorio del motor NInfer para RTX 4090 (rama `feat/bonsai-ternary`): https://github.com/JGamboa/ninfer-4090-windows/tree/feat/bonsai-ternary
- Motor NInfer (autor original): https://github.com/Neroued/ninfer
- Drafter DFlash2: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Claude Code (herramienta citada en el desarrollo de la ruta int8): https://claude.com/claude-code
