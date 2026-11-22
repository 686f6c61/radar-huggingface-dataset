# anemll/anemll-forge-qwen3.8-27B-V8-96K

## Resumen

ANEMLL Forge Qwen3.8-27B V8-96K es una build de investigación del modelo Qwen3.8-27B de Qwen Team (Alibaba Cloud), convertida y cuantizada de forma independiente por ANEMLL para ejecutarse de forma híbrida sobre la Apple Neural Engine (ANE) y la GPU de un Mac con chip M6. El objetivo no es un modelo nuevo, sino una demostración de ingeniería de inferencia: repartir un modelo denso de 27B de parámetros entre dos aceleradores que comparten una única copia de los pesos, con decodificación especulativa y una ventana de contexto de 96K tokens (98.304).

La relevancia es doble. Por un lado, explora los límites de Core AI y del hardware Apple para servir modelos grandes en local sin depender de la nube. Por otro, lo hace en un formato de research preview que exige desactivar System Integrity Protection (SIP) y conceder permisos de root de un solo uso, lo que lo aleja de cualquier escenario de producción. El repositorio ocupa 25,3 GB y lleva los pesos de la release 0.2 del modelo base reconstruidos para el schedule híbrido que el autor denomina V8.

No se dispone de datos sobre número de parámetros activos (el modelo base es denso), idiomas soportados ni resultados de benchmarks en la información proporcionada. La licencia es Apache-2.0, heredada del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso del modelo base Qwen3.8-27B, con token mixers Gated DeltaNet y atención; build híbrida ANE + GPU (schedule V8) |
| Parámetros totales | 27B (heredados del modelo base Qwen/Qwen3.8-27B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 96K tokens (98.304) |
| Tipos de cuantización | Cuantizado (esquema no detallado en la información disponible); pesos ANE compilados de 10,8 GiB |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Pesos compilados para Core AI (model.hwx en caché ANE), tablas GPU generadas por máquina y export Core AI; no safetensors ni GGUF estándar |
| Librería | anemll-forge |
| Tamaño del repositorio | 25,3 GB |
| Hardware objetivo | Apple M6 con macOS 27.3 |
| Decodificación | Especulativa con drafter Core AI DFlash2 (verificación de 8 filas en ANE) |
| Caché KV | Segmentada, con atención de decodificación en GPU por encima de 64K tokens (SPLIT+GPU) |
| Descargas | 681 |
| Fecha de creación | 2026-11-17 |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B, un transformer denso de 27B parámetros desarrollado por Qwen Team y Alibaba Cloud, con licencia Apache-2.0. ANEMLL no reentrena ni ajusta el modelo: convierte y cuantiza los pesos de la release 0.2 del modelo base para un runtime propio sobre Core AI. La innovación está en el reparto de trabajo entre aceleradores. En la fase de prefill, cada FFN se ejecuta en la Neural Engine y cada token mixer (Gated DeltaNet y atención) en la GPU, ambos simultáneamente y compartiendo una sola copia de los pesos: la GPU lee los pesos directamente desde los programas compilados de la ANE (`model.hwx`, 10,8 GiB, solo lectura, sin copia).

En la fase de decodificación se emplea decodificación especulativa con un drafter Core AI DFlash2 incluido, con verificación de 8 filas en la ANE. Por encima de 64K tokens, la atención de verificación sobre el historial KV se ejecuta en la GPU entre llamadas a la ANE (modo SPLIT+GPU), de modo que los programas de la ANE son idénticos para cualquier longitud de contexto. El drafter deriva de ProCreations/Ternary-Bonsai-2-27B-DFlash2, con procedencia upstream de z-lab DFlash2 y Prism Bonsai. No se detalla en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto: pipeline declarado como text-generation.
- Razonamiento y contexto largo: ventana de hasta 96K tokens, con caché KV segmentada y atención de decodificación desplazada a GPU a partir de 64K.
- Decodificación especulativa: drafter DFlash2 con verificación de 8 filas para acelerar la generación.
- Ejecución local híbrida: reparto simultáneo de prefill entre ANE y GPU con pesos compartidos.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (visión, audio, modo thinking): no disponible en la información proporcionada.

## Casos de uso

- Investigación en inferencia local sobre Apple Silicon: el modelo sirve como banco de pruebas para medir el reparto de prefill entre ANE y GPU, con código, notas y benchmarks publicados en la rama `v8-gpu-ane-prefill`. Es adecuado porque expone explícitamente la cadena de compilación y los resultados frente a splash 1.3.2.
- Análisis de documentos largos en un Mac dedicado: con 96K tokens de contexto, permite procesar contratos, informes o transcripciones extensas en una sola pasada sin fragmentar. Adecuado por la ventana amplia y la caché KV segmentada que mantiene la atención viable más allá de 64K.
- Prototipado de asistentes conversacionales offline: conversaciones multi-turno con historial largo en un equipo sin conexión a la nube, útil en entornos con requisitos de confidencialidad. Adecuado porque todo el cómputo ocurre en el Mac.
- Evaluación de decodificación especulativa: el drafter DFlash2 incluido permite estudiar el impacto de la verificación de 8 filas en ANE sobre la latencia de decodificación. Adecuado porque el repositorio incluye las herramientas de preparación (`prep_engine.py`, `prep_kv8.py`) y las notas de investigación.
- Reproducción de experimentos de compartición de pesos ANE-GPU: el caso de mapear los pesos de `model.hwx` desde la GPU sin copiarlos es reproducible en una máquina de investigación siguiendo el README de despliegue. Adecuado por la inclusión del snapshot del código en el commit `912925f`.
- Estudio de portabilidad de Core AI: sirve para analizar las limitaciones de Core AI al no ofrecer una vía oficial para que la GPU use los pesos que ya tiene la ANE, y las soluciones alternativas que aplica el autor. Adecuado porque el artículo y las notas documentan las decisiones y restricciones del entorno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona resultados frente a splash 1.3.2 en el artículo enlazado, pero no se incluyen cifras en los datos proporcionados.

## Requisitos de hardware

- Hardware objetivo: Apple M6 con macOS 27.3; la build no está pensada para otros equipos.
- Memoria: el repositorio ocupa 25,3 GB y los programas ANE compilados ocupan 10,8 GiB en `/Library/Caches/com.apple.aned/`; no se detalla el consumo total de memoria unificada en inferencia.
- GPU dedicadas (A100, H100, RTX 4090): no aplicable; el runtime es específico de Core AI y Apple Silicon.
- GPU de consumo: no aplicable en el sentido convencional; el hardware requerido es un SoC Apple M6.
- Despliegue: runtime propio de anemll-forge sobre Core AI, con servidor incluido en `research/v8_prefill/`; no compatible con vLLM, llama.cpp, Ollama ni TGI.
- Requisitos del sistema: es necesario desactivar System Integrity Protection y conceder un permiso de root de un solo uso (`sudo chmod +a`) para leer la caché ANE, que lleva el flag `datavault`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| anemll-forge-qwen3.8-27B-V8-96K | 27B (denso) | 96K | Apache-2.0 | Híbrido ANE + GPU en M6, research preview | Hugging Face (681 descargas) |
| anemll-forge-qwen3.8-27B-192K | 27B (denso) | 192K | Apache-2.0 | Build de release soportada del mismo autor | Hugging Face, enlazada en la model card |
| Qwen/Qwen3.8-27B | 27B (denso) | No disponible | Apache-2.0 | Modelo base original de Qwen Team | Hugging Face |
| anemll-quantized-qwen3.8-27b-for-CoreAI | 27B (denso) | No disponible | No disponible | Export público de la release 0.2 para Core AI | Hugging Face |

## Limitaciones y advertencias

- Research preview, no release: el propio autor lo califica como trabajo de investigación y remite a la build 192K para uso soportado.
- Requiere desactivar System Integrity Protection, lo que reduce la seguridad de todo el Mac; el autor recomienda una máquina de investigación dedicada.
- Requiere un permiso de root de un solo uso para acceder a la caché ANE marcada con `datavault`.
- Solo funciona en un Apple M6 con macOS 27.3; no hay soporte para otros equipos ni plataformas.
- Los scripts de investigación usan rutas absolutas de la máquina de desarrollo y deben ajustarse manualmente; no es reproducible con un solo comando.
- Las tablas del motor GPU se generan en cada máquina tras la primera compilación, a partir de sus propios programas ANE compilados.
- El servidor de la release 0.2 no carga estos paquetes porque usan una caché KV segmentada.
- Idiomas soportados no disponibles; riesgo de sesgos y alucinaciones heredado del modelo base, no documentado en la información proporcionada.
- Licencia Apache-2.0 permite uso comercial del modelo, pero las restricciones técnicas (SIP, root, hardware concreto) lo hacen inviable en producción.
- No se reclama respaldo por parte de Apple, Qwen Team, Alibaba Cloud, z-lab ni Prism Bonsai.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/anemll/anemll-forge-qwen3.8-27B-V8-96K
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Build de release 192K: https://huggingface.co/anemll/anemll-forge-qwen3.8-27B-192K
- Export público para Core AI: https://huggingface.co/anemll/anemll-quantized-qwen3.8-27b-for-CoreAI
- Drafter DFlash2 de origen: https://huggingface.co/ProCreations/Ternary-Bonsai-2-27B-DFlash2
- Artículo "One model, two accelerators": https://github.com/Anemll/anemll-forge/blob/v8-gpu-ane-prefill/research/v8_prefill/ARTICLE_ANE_GPU_M6.md
- Rama de investigación: https://github.com/Anemll/anemll-forge/tree/v8-gpu-ane-prefill/research/v8_prefill
- README de despliegue: https://github.com/Anemll/anemll-forge/blob/v8-gpu-ane-prefill/research/v8_prefill/README.md
- Notas de investigación de prefill: https://github.com/Anemll/anemll-forge/blob/v8-gpu-ane-prefill/research/v8_prefill/PREFILL_RESEARCH.md
- Notas de atención en GPU para decode: https://github.com/Anemll/anemll-forge/blob/v8-gpu-ane-prefill/research/v8_prefill/pipe/unit/DECODE_GPU_ATTENTION.md
- Herramienta hwx_parsing: https://github.com/freedomtan/coreml_to_ane_hwx
