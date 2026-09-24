# ryugyosoft/LFM2-8B-A1B-npu

## Resumen

LFM2-8B-A1B-npu es una conversión del modelo LiquidAI/LFM2-8B-A1B preparada por ryugyosoft para ejecutarse íntegramente en la NPU de Intel mediante el motor npue, un runtime ligero que permite inferir LLM sin GPU dedicada. El modelo original es un transformer híbrido con mezcla de expertos (MoE) de 8.300 millones de parámetros totales y aproximadamente 1.500 millones activos por token, con 32 expertos y enrutamiento top-4. La conversión no implica reentrenamiento: solo recuantiza los pesos a INT4 e INT8 y los reestructura en grafos OpenVINO.

El problema que resuelve es la brecha entre arquitecturas MoE dinámicas y las NPU, que exigen grafos estáticos. La solución trocea la red en 23 segmentos justo después de cada router, de modo que el host lee el top-4 del router y enlaza los buffers de esos expertos al siguiente segmento con copia cero. Los 704 expertos residen en memoria visible para la NPU y se empaquetan en INT4 por canal, un tensor por experto.

Es relevante ahora porque permite ejecutar un MoE de 8.300 millones de parámetros en un portátil con 16 GB de RAM y una NPU Intel (probado en NPU 3720 sobre Core Ultra 9 285HX) a 15-16 tokens por segundo, con picos de 28-40 tokens por segundo cuando la respuesta reutiliza texto del prompt. El repositorio tiene 4,5 GB, admite inglés y japonés y se publica bajo la LFM Open License v1.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con mezcla de expertos (MoE); capas de convolución corta y atención, FFN densas y routers; convertido a grafos OpenVINO |
| Parametros totales | 8.300 millones (8,3B) |
| Parametros activos | ~1.500 millones por token (MoE, 32 expertos, top-4) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos en INT4 por canal (symmetric, round-to-nearest, group-128); segmentos densos en INT4; embedding/LM head en INT8; formato "weights-as-inputs" |
| Idiomas soportados | en, ja |
| Licencia | LFM Open License v1.0 (identificador lfm1.0); incluye umbral de uso comercial |
| Formato de pesos | Grafos OpenVINO (`seg*_S1.xml`, `seg*_S16.xml` y `.bin`), `experts.bin`, `shared.bin`, metadatos en `engine.json`; biblioteca `openvino` |

## Arquitectura y entrenamiento

El modelo base LiquidAI/LFM2-8B-A1B es un transformer híbrido de tipo MoE con 8.300 millones de parámetros totales y unos 1.500 millones activos por token, organizado en 32 expertos con enrutamiento top-4. La arquitectura combina capas de convolución corta y de atención junto con FFN densas y routers. Esta ficha describe una conversión, no un entrenamiento nuevo: los pesos se recuantizan y reestructuran, y no se ha realizado ningún proceso de ajuste. La model card indica explícitamente que no hubo entrenamiento ("no training").

La innovación técnica está en cómo se ejecuta un MoE sobre una NPU, que requiere grafos estáticos. La red se corta en 23 segmentos justo después de cada router; el host lee el top-4 del router y enlaza los buffers de pesos de esos expertos al segmento siguiente mediante copia cero, manteniendo los 704 expertos en memoria visible para la NPU. Los expertos se empaquetan en INT4 por canal, un tensor por experto, que es la única forma de "pesos como entradas" que la NPU ejecuta a plena velocidad. Se generan dos variantes de segmento: `S1` para decodificación de un token y `S16` para bloques de prompt de 16 tokens. El motor npue añade decodificación por búsqueda en el prompt (prompt lookup decoding).

## Capacidades

- Generación de texto y uso conversacional en inglés y japonés.
- Ejecución completa del MoE sobre la NPU Intel, sin GPU dedicada, con todos los expertos residentes en memoria visible para la NPU.
- Decodificación por búsqueda en el prompt (prompt lookup decoding), que acelera respuestas que reutilizan texto del prompt (edición de código, resúmenes) hasta 28-40 tokens por segundo.
- Funcionamiento en CPU como alternativa cuando no hay driver de NPU disponible.
- Interfaz de chat web en `http://localhost:8000/` y API compatible con OpenAI en `/v1`.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la información disponible.
- Capacidades especiales (modo thinking, visión, audio): no documentadas en la información disponible.

## Casos de uso

- Asistente local en portátil: el modelo completo ocupa unos 5 GB y cabe en equipos de 16 GB con una NPU Intel, lo que permite tener un asistente conversacional en inglés o japonés que funciona sin conexión y sin GPU dedicada.
- Edición y refactorización de código en el propio dispositivo: gracias a la decodificación por búsqueda en el prompt, las respuestas que reutilizan fragmentos del código de entrada alcanzan 28-40 tokens por segundo, lo que agiliza tareas de reescritura y parcheo sobre el editor.
- Resumen de documentos: al reutilizar texto del prompt, el resumen se beneficia de la decodificación por búsqueda y mantiene latencias bajas; los documentos pueden procesarse en bloques de 16 tokens mediante los segmentos `S16`.
- Procesamiento con privacidad de datos: al ejecutarse íntegramente en el hardware local, los datos no salen del equipo, lo que resulta adecuado para material sensible que no puede enviarse a servicios en la nube.
- Backend de API compatible con OpenAI: la exposición en `/v1` permite sustituir un endpoint remoto por uno local en aplicaciones existentes sin cambiar el cliente, útil para desarrollo y pruebas.
- Prototipado y evaluación de MoE en hardware de borde: sirve para medir el comportamiento de un MoE top-4 de 8,3B sobre NPU, comparar latencias y validar la viabilidad de despliegues sin GPU.
- Aplicaciones japonesas o bilingües inglés-japonés: el soporte declarado de ambos idiomas cubre asistentes y herramientas orientadas al mercado japonés sobre portátiles con Core Ultra.
- Integración en escritorio Windows o Ubuntu mediante scripts `start.bat` / `start.sh` que crean el entorno, descargan el modelo, lo compilan para la NPU y abren la interfaz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos numéricos aportados son de rendimiento en la NPU 3720 (Core Ultra 9 285HX) y de fidelidad de la cuantización:

| Metrica | Valor |
|---|---|
| Decodificación | 15-16 tokens/s |
| Decodificación con reutilización del prompt (prompt lookup decoding) | 28-40 tokens/s |
| Procesamiento de prompt | ~15 ms/token (113 tokens en 1,7 s) |
| Primer arranque (compilación para NPU) | ~90 s |
| Arranques posteriores | ~20 s |
| Memoria | ~5 GB |
| Fidelidad de cuantización (logits del primer token) | dentro de ~33% del modelo bf16, con el mismo top-1 |

La model card advierte que, tras unos pocos tokens, las respuestas son fluidas pero las elecciones de palabras divergen del modelo bf16 debido a la cuantización.

## Requisitos de hardware

- Memoria: ~5 GB, por lo que cabe en máquinas de 16 GB.
- NPU: probado en NPU 3720 sobre Intel Core Ultra 9 285HX; los tags indican soporte para Intel NPU.
- Sin driver de NPU, el motor se ejecuta en CPU (rendimiento no especificado).
- GPU dedicada: no requerida; ejecución sobre NPU o CPU.
- Despliegue: motor npue (descarga separada con `hf download ryugyosoft/npue --local-dir npue`), scripts `start.bat` (Windows) y `start.sh` (Ubuntu); chat en `http://localhost:8000/` y API compatible con OpenAI en `/v1`.
- Integración con vLLM, llama.cpp, Ollama o TGI: no disponible (el formato es OpenVINO con grafos segmentados para NPU).
- Latencia y throughput: 15-16 tokens/s en decodificación, 28-40 tokens/s con reutilización del prompt, ~15 ms/token en procesamiento de prompt, primer arranque ~90 s y posteriores ~20 s.

## Comparativa con modelos similares

Los datos disponibles solo permiten comparar la conversión con su modelo base. No se dispone de información sobre otras alternativas comparables en la documentación proporcionada.

| Modelo | Parametros totales | Parametros activos | Contexto | Formato | Objetivo | Licencia |
|---|---|---|---|---|---|---|
| ryugyosoft/LFM2-8B-A1B-npu | 8,3B | ~1,5B | no disponible | OpenVINO (INT4/INT8) para NPU | Inferencia en NPU Intel / CPU | LFM Open License v1.0 |
| LiquidAI/LFM2-8B-A1B (base) | 8,3B | ~1,5B | no disponible | Pesos originales (bf16) | Inferencia en GPU/CPU | LFM Open License v1.0 |

En calidad, la conversión se sitúa cerca del base: los logits del primer token quedan dentro de ~33% del modelo bf16 con el mismo top-1, aunque la elección de palabras diverge tras unos pocos tokens.

## Limitaciones y advertencias

- Pérdida de calidad por cuantización: los logits del primer token se desvían hasta ~33% respecto al modelo bf16 y el texto generado puede diferir en vocabulario a partir de unos pocos tokens.
- No hay benchmarks de calidad publicados que permitan estimar el impacto real de la cuantización en tareas concretas.
- Idiomas limitados a inglés y japonés; no se declara soporte de castellano ni de otros idiomas.
- Longitud de contexto no especificada en la información disponible.
- Tool calling, agentes y modos especiales (thinking, visión, audio) no están documentados para esta conversión.
- Licencia LFM Open License v1.0 (lfm1.0): incluye un umbral de uso comercial que debe revisarse antes de desplegar en producción.
- Dependencia del motor npue (descarga separada) y del driver de NPU para el rendimiento declarado; sin él, la ejecución cae a CPU sin cifras publicadas.
- El repositorio es reciente y sin descargas ni valoraciones registradas, por lo que la validación por parte de la comunidad es nula.
- Descarga mediante `hf download`, no `git clone`: un clon sin Git LFS obtiene archivos puntero de 130 bytes en lugar de los pesos.
- El formato OpenVINO con grafos segmentados para NPU no es directamente portable a stacks de inferencia convencionales como vLLM, llama.cpp o TGI.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ryugyosoft/LFM2-8B-A1B-npu
- Modelo base: https://huggingface.co/LiquidAI/LFM2-8B-A1B
- Motor npue: https://huggingface.co/ryugyosoft/npue
- Licencia (LFM Open License v1.0): LICENSE incluida en el repositorio
