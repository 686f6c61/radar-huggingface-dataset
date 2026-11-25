# anemll/anemll-forge-qwen3.8-27B-V8-96K

## Resumen

ANEMLL Forge · Qwen3.8-27B · V8-96K es una build de investigación del modelo denso Qwen3.8-27B de Qwen Team (Alibaba Cloud), reconstruida por ANEMLL para ejecutarse simultáneamente en la Apple Neural Engine (ANE) y la GPU de un Apple M6. No es un modelo nuevo: es una conversión y cuantización independiente de los pesos release 0.2 de `anemll/anemll-forge-qwen3.8-27B`, con una ventana de contexto de hasta 98.304 tokens (96K) y un esquema de ejecución híbrido denominado V8.

La propuesta técnica es un reparto de trabajo por capas: durante el prefill, cada FFN se ejecuta en la Neural Engine y cada token mixer (Gated DeltaNet y atención) en la GPU, de forma concurrente y compartiendo una única copia de los pesos. En decode se emplea decodificación especulativa con un drafter Core AI DFlash2 incluido, verificación en árbol (tree8) y atención sobre el histórico KV en la GPU entre llamadas a la ANE para la entrada de 96K.

Es relevante ahora porque explora un camino poco habitual en inferencia local: usar dos aceleradores heterogéneos de un mismo SoC con pesos compartidos, sin duplicarlos en memoria. El repositorio ocupa 36,9 GB y acumula 761 descargas. Se trata de un research preview, no de un release: requiere desactivar System Integrity Protection (SIP) y un permiso root puntual, y solo funciona en un M6 con macOS 27.3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3.8-27B) con token mixers híbridos: Gated DeltaNet y atención; ejecución híbrida ANE + GPU (esquema V8) |
| Parametros totales | 27B (según el modelo base Qwen/Qwen3.8-27B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 98.304 tokens (96K) |
| Tipos de cuantizacion | Cuantizado (el repositorio incluye tags `quantized`); niveles concretos no disponibles |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Pesos compilados para Core AI / ANE (`model.hwx`, 10.8 GiB en caché) más un kit portátil de tablas del motor GPU (`gpu/w_dec8ts/`); formatos estándar (safetensors, GGUF) no disponibles |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer denso de 27B parámetros con token mixers híbridos que combinan Gated DeltaNet y mecanismos de atención. ANEMLL no reentrena: convierte y cuantiza los pesos release 0.2 del modelo base y los recompila para un schedule híbrido. En prefill, los FFN se despliegan en la Neural Engine y los token mixers en la GPU, ejecutándose ambos a la vez y compartiendo una sola copia de los pesos: la GPU mapea los pesos directamente desde los programas compilados de la ANE (`model.hwx`), sin copiarlos.

En decode se usa decodificación especulativa con el drafter Core AI DFlash2 incluido. Desde el 21 de noviembre la verificación es en árbol (tree8): las 7 mejores continuaciones del drafter se comprueban en una sola llamada de 8 filas a la ANE, tanto para peticiones greedy como con muestreo. Desde el 22 de noviembre, las entradas de verificación recortadas a 24K, 40K, 48K y 56K atienden solo sobre el prefijo KV en uso. En la entrada de 96K, la atención de la verificación sobre el histórico KV se ejecuta en la GPU entre llamadas a la ANE (modo SPLIT+GPU). El drafter deriva de `ProCreations/Ternary-Bonsai-2-27B-DFlash2`, con procedencia upstream de z-lab DFlash2 y Prism Bonsai. No se dispone de datos sobre el número de tokens de entrenamiento ni sobre la composición del dataset.

## Capacidades

- Generación de texto y razonamiento sobre un modelo denso de 27B, heredados de Qwen3.8-27B.
- Contexto largo de hasta 96K tokens, con atención optimizada por prefijo en las entradas recortadas de verificación.
- Decodificación especulativa con drafter DFlash2 y verificación en árbol (tree8) para peticiones greedy y con muestreo.
- Ejecución híbrida concurrente en Neural Engine y GPU con pesos compartidos, sin duplicación en memoria.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling, function calling y agentes: no disponible en la información proporcionada.
- Modos especiales (thinking, visión, audio): no disponibles en la información proporcionada.

## Casos de uso

- Investigación en inferencia heterogénea: servir como banco de pruebas para estudiar el reparto de cómputo entre ANE y GPU en un mismo SoC, midiendo prefill y decode por separado gracias a los benchmarks incluidos en la rama de investigación.
- Desarrollo de decodificación especulativa: validar el esquema tree8 (7 continuaciones en una llamada de 8 filas) y su impacto en aceptación y latencia frente a verificación lineal, con código y notas reproducibles.
- Evaluación de atención de contexto largo en hardware Apple: probar las entradas recortadas de 24K, 40K, 48K y 56K y el modo SPLIT+GPU a 96K para caracterizar el coste de la atención sobre el histórico KV.
- Prototipado de asistentes con contexto extenso en local: procesar documentos largos (hasta 96K tokens) en un único Mac M6 sin depender de servicios en la nube, aceptando las restricciones de seguridad del build.
- Estudio de cuantización y compilación para Core AI: analizar la conversión de pesos de un modelo de 27B a programas `model.hwx` y el kit de tablas del motor GPU (`gpu/w_dec8ts/`).
- Automatización de despliegue con agentes: usar `AGENTS.md` y el script por etapas `hf/agent_deploy.sh` (check, download, venv, bridge, compile, engines, tables, serve, smoke) con códigos de salida para orquestar la puesta en marcha en máquinas de laboratorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite a comparaciones frente a "splash 1.3.2" y a mediciones del drafter/verificador tree8 en `TREE_VERIFY.md` y al artículo `ARTICLE_ANE_GPU_M6.md`, pero no se incluyen cifras en la información proporcionada.

## Requisitos de hardware

- Hardware obligatorio: Apple M6 con macOS 27.3. No hay soporte para otras plataformas.
- Requiere desactivar System Integrity Protection (SIP) y un permiso root puntual (`sudo chmod +a`) para leer `model.hwx` en `/Library/Caches/com.apple.aned/` (10,8 GiB, solo lectura, sin copia).
- Almacenamiento: repositorio de 36,9 GB, más los artefactos compilados (8 paquetes en `coreai/m6-96k-dec8ts/`).
- VRAM estimada: no disponible; la memoria es unificada del SoC y los pesos se comparten entre ANE y GPU.
- GPU dedicadas (A100, H100, RTX 4090): no soportadas; el build es específico de ANE + GPU Apple.
- Opciones de despliegue: cadena propia de ANEMLL Forge (compilación Core AI, tablas GPU, bibliotecas GPU) documentada en `DEPLOY.md` y en el README de investigación. vLLM, llama.cpp, Ollama y TGI no están soportados.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Plataforma | Estado |
|---|---|---|---|---|---|
| anemll-forge-qwen3.8-27B-V8-96K | 27B (denso) | 96K | Apache-2.0 | Apple M6 (ANE + GPU) | Research preview |
| anemll-forge-qwen3.8-27B-192K | 27B (denso) | 192K | Apache-2.0 | Apple (release soportado) | Release |
| anemll-forge-qwen3.8-27B | 27B (denso) | No disponible | Apache-2.0 | Apple (pesos release 0.2) | Release de pesos |
| Qwen/Qwen3.8-27B | 27B (denso) | No disponible | Apache-2.0 | GPU estándar | Modelo base upstream |

El build V8-96K se distingue del release de 192K por el esquema híbrido ANE + GPU y por un contexto menor; el release de 192K es la opción recomendada por el autor para uso soportado. No se dispone de datos de rendimiento comparativo entre estas variantes.

## Limitaciones y advertencias

- Research preview, no un release: los scripts llevan rutas de la máquina de desarrollo y no es reproducible con un solo comando.
- Requiere desactivar SIP, lo que reduce la seguridad de todo el Mac; el autor recomienda una máquina de investigación dedicada.
- Dependencia de una caché root-only con flag `datavault` en `/Library/Caches/com.apple.aned/`, sujeta a cambios por parte de Apple.
- Solo funciona en Apple M6 con macOS 27.3; sin soporte para GPU NVIDIA, AMD ni otras plataformas.
- Idiomas soportados no documentados en la información disponible.
- Riesgo de alucinación y sesgos del modelo base: no cuantificados en la información proporcionada.
- Licencia Apache-2.0 permite uso comercial, pero las restricciones técnicas (SIP, hardware concreto) limitan su viabilidad en producción.
- El drafter deriva de un modelo de terceros con su propia procedencia (z-lab DFlash2, Prism Bonsai); el autor no reclama endorsement de esos proyectos ni de Apple.
- Sin datos publicados de benchmarks en la información disponible; no debe asumirse paridad de calidad con el modelo base sin verificación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/anemll/anemll-forge-qwen3.8-27B-V8-96K
- Pesos release 0.2 (modelo base de la build): https://huggingface.co/anemll/anemll-forge-qwen3.8-27B
- Release soportado de 192K: https://huggingface.co/anemll/anemll-forge-qwen3.8-27B-192K
- Modelo base upstream: https://huggingface.co/Qwen/Qwen3.8-27B
- Drafter de origen: https://huggingface.co/ProCreations/Ternary-Bonsai-2-27B-DFlash2
- Repositorio de investigación (rama v8-gpu-ane-prefill): https://github.com/Anemll/anemll-forge/tree/v8-gpu-ane-prefill/research/v8_prefill
- Artículo "One model, two accelerators": https://github.com/Anemll/anemll-forge/blob/v8-gpu-ane-prefill/research/v8_prefill/ARTICLE_ANE_GPU_M6.md
- README de despliegue de investigación: https://github.com/Anemll/anemll-forge/blob/v8-gpu-ane-prefill/research/v8_prefill/README.md
- Requisitos root y SIP: https://github.com/Anemll/anemll-forge/blob/v8-gpu-ane-prefill/research/v8_prefill/README.md#requirements-root-and-sip
- Notas de investigación de prefill: https://github.com/Anemll/anemll-forge/blob/v8-gpu-ane-prefill/research/v8_prefill/PREFILL_RESEARCH.md
- Atención en decode sobre GPU: https://github.com/Anemll/anemll-forge/blob/v8-gpu-ane-prefill/research/v8_prefill/pipe/unit/DECODE_GPU_ATTENTION.md
