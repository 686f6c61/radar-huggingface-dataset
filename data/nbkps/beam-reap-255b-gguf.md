# nbKPS/beam-reap-255b-gguf

## Resumen

Beam REAP-255B es una versión podada y cuantizada del modelo MoE reflection/Beam-1.0-501B-A23B, publicada por nbKPS (KPS Labs) bajo licencia Apache-2.0. El autor aplica una técnica de poda de expertos enrutados (REAP) sobre las trazas del propio modelo base, reduciendo los 501B parámetros totales a 254,6B manteniendo los mismos parámetros activos (23B), y distribuye el resultado exclusivamente en formato GGUF optimizado para llama.cpp. El objetivo declarado es que el modelo quepa y funcione en una única NVIDIA DGX Spark (GB10, 128 GB de memoria unificada).

La relevancia actual del artefacto está en su empaquetado: los builds "Magicpack" mantienen q8_0 en atención, expertos compartidos, embeddings y salida, mientras comprimen solo los expertos enrutados con mezclas de cuantización IQ1_M/IQ2_XXS/IQ2_S o MXFP4, usando imatrices calculadas sobre el modelo ya podado. Incluye además un drafter DFlash-2 en BF16 para decodificación especulativa y utilidades de servicio (parches, scripts y perfiles de gateway).

No es un lanzamiento oficial de Reflection: la model card lo describe explícitamente como un artefacto de terceros derivado del modelo base. El repositorio ocupa 343,4 GB e incluye los GGUFs, las imatrices y el código de servicio empleado en la medición.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE transformer (derivada de reflection/Beam-1.0-501B-A23B), con poda de expertos enrutados (REAP) |
| Parámetros totales | 254.610.418.240 (254,6B) |
| Parámetros activos | 23B (heredados del modelo base 501B-A23B; el autor indica "same active parameters") |
| Longitud de contexto | 256K tokens por carril en la configuración de servicio (2 carriles de 256K con caché K en q8_0); contexto máximo del modelo base no disponible |
| Tipos de cuantización | GGUF: IQ1_M, IQ2_XXS, IQ2_S y MXFP4 en expertos enrutados; q8_0 en ruta caliente (atención, expertos compartidos, embeddings, salida); pins fp32 puntuales; BF16 para el drafter |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); BF16 disponible en el repo separado nbKPS/beam-reap-255b-bf16 |

## Arquitectura y entrenamiento

El modelo parte de reflection/Beam-1.0-501B-A23B, un MoE de 501B parámetros totales y 23B activos. Sobre él se aplica REAP (poda de expertos enrutados) guiada por trazas de activación generadas por el propio Beam, lo que reduce el total a 254,6B sin alterar el número de parámetros activos. La model card no detalla el número de expertos por capa, la proporción de expertos eliminados ni la composición del dataset de entrenamiento original; esos datos no están disponibles en la información proporcionada.

La innovación principal está en el pipeline de cuantización: cada build se cuantiza con imatrices calculadas sobre el modelo ya podado ("imatrix required"), no sobre el modelo original. Se publican tres variantes de mezcla de imatrices: una fresca, una combinación φ+e y una basada en √2·√3, documentadas en README-IRRATIONALS.md e IMATRIX-README.md. La "ley de horneado" Magicpack fija q8_0 en todo excepto los expertos enrutados, que usan la mezcla comprimida. Se incluye un drafter DFlash-2 en BF16 para decodificación especulativa y un parche de entrada de capa para DFlash en el build de llama.cpp usado.

## Capacidades

- Generación de texto conversacional multi-turno, con perfil de "conversational" en los tags del repositorio.
- Razonamiento agéntico: la model card reporta evaluación en un "Hermes agentic exam" con grading externo, lo que indica soporte para tareas de agente de varios pasos.
- Generación de código y trabajo agéntico sobre código: el autor mide ganancias de decodificación con DFlash-2 específicamente en código y tareas agénticas.
- Decodificación especulativa mediante el drafter DFlash-2 incluido.
- Control de esfuerzo de razonamiento y conservación de razonamiento previo ("reasoning effort", "keep-prior-reasoning") a través de los perfiles de servicio en serve/doors/.
- Integración con gateway y puente para Claude Code según las utilidades de serve/doors/.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Tool calling / function calling: no confirmado explícitamente en la información disponible; los tags endpoints_compatible y el perfil de agente sugieren compatibilidad con APIs de inferencia, pero no se detalla.

## Casos de uso

- Despliegue en un único DGX Spark (GB10): el build bonsai de 61,2 GiB está dimensionado para caber en los 128 GB de memoria unificada, permitiendo servir un MoE de 255B en hardware de un solo nodo. Adecuado por el ajuste explícito de tamaño y la caché K en q8_0.
- Asistencia de código en local: el drafter DFlash-2 mejora la decodificación en código y trabajo agéntico, por lo que el modelo encaja en estaciones de trabajo con llama.cpp para autocompletado y refactorización multi-archivo.
- Agentes autónomos de varios pasos: la evaluación Hermes agentic (core, Casey Factor, daily, Opus) indica que el modelo está orientado a bucles de agente; se usaría con los perfiles de serve/doors/ para fijar esfuerzo de razonamiento y sampling.
- Puente con Claude Code: serve/doors/ incluye las piezas necesarias para conectar el modelo a un gateway y a Claude Code, útil para equipos que quieren un backend local compatible con ese flujo.
- Servicio de dos carriles de 256K tokens: serve.sh configura 2 × 256K con caché K en q8_0, adecuado para procesar documentos largos en paralelo o conversaciones con historial extenso.
- Referencia y destilación: el repo publica la imatrix del modelo completo (Beam-1.0-501B-A23B-imatrix.gguf) y las tres imatrices usadas, lo que sirve para reproducir cuantizaciones o comparar el efecto de la poda frente al profesor.
- Evaluación de fidelidad tras poda: teacher-kl/ contiene 119.539 posiciones trazadas para medir la concordancia top-1 con el modelo BF16, útil en investigación sobre poda de expertos.

## Benchmarks y rendimiento

Resultados del examen agéntico Hermes reportados por el autor (grading externo, mismo harness para todas las filas):

| Build (sampling) | core | Casey Factor | daily | Opus | aggregate | teacher top-1 |
|---|---|---|---|---|---|---|
| bonsai-a-phie (0.23 / 0.9 / 40) | 1.000 | 0.924 | 86.0 | 79.6 | 0.868 | 85,3 % |
| bonsai-iq1m-iq2xxs | 0.967 | 0.896 | 82.2 | 80.8 | 0.850 | 84,8 % |
| bonsai-c-sqrt23 | 1.000 | 0.893 | 85.8 | 73.7 | 0.841 | 85,2 % |

Teacher top-1 = concordancia de siguiente token con Beam-1.0-501B BF16 sobre 119.539 posiciones trazadas.

Rendimiento de inferencia medido en un GB10 (clase main-q6): ~24 tok/s como techo de ancho de banda sin drafter; DFlash-2 eleva la decodificación en código y trabajo agéntico (el barrido está en serve/README.md, no reproducido aquí). No se han publicado resultados de MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- VRAM/memoria: los builds bonsai ocupan 61,2 GiB; el build MXFP4 ocupa ~135 GiB y excede una sola GB10, requiriendo dos nodos vía RPC o una máquina mayor.
- Hardware objetivo: una NVIDIA DGX Spark (GB10, 128 GB de memoria unificada). El autor trabajó con tres DGX Sparks para la poda y el horneado.
- GPU consumer: no disponible confirmación de que quepa en RTX 4090 (24 GB) u otras consumer; por tamaño (61,2 GiB mínimo) no cabe en una sola GPU de 24 GB.
- Despliegue: llama.cpp (build incluido en serve/, CUDA, con parche DFlash en serve/patches/); los tags mencionan endpoints_compatible. No se mencionan vLLM, TGI ni Ollama.
- Latencia/throughput: ~24 tok/s de techo sin drafter en un GB10; con DFlash-2 aumenta en código y agentes. Cifras exactas del barrido no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Beam REAP-255B (este) | 254,6B / 23B | 256K por carril en servicio | Apache-2.0 | GGUF | Poda REAP + Magicpack, objetivo GB10 |
| reflection/Beam-1.0-501B-A23B (base) | 501B / 23B | no disponible | Apache-2.0 | no disponible | Modelo original sin podar; profesor de referencia |
| nbKPS/beam-reap-255b-bf16 | 254,6B / 23B | no disponible | no disponible | BF16 (safetensors presumiblemente) | Keep denso BF16 de la poda REAP |
| Otras alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | No se proporcionan datos de modelos comparables |

## Limitaciones y advertencias

- No es un lanzamiento oficial de Reflection; el autor lo declara explícitamente. La calidad y el soporte dependen de KPS Labs.
- La poda REAP puede degradar capacidades no cubiertas por el examen Hermes; la concordancia top-1 con el profesor es del 84,8-85,3 %, lo que implica un 14-15 % de divergencia en siguiente token.
- Las recetas de poda, las trazas y los pipelines de imatrix permanecen en un repositorio privado; solo se publica el artefacto, lo que limita la reproducibilidad completa.
- El build MXFP4 (~135 GiB) no cabe en un solo GB10; requiere dos nodos o hardware superior.
- Los tags mencionan "expert-pruning" y "reap"; no se documenta el número de expertos eliminados ni el impacto por capa.
- Idiomas soportados no disponibles; no se puede garantizar cobertura multilingüe.
- Riesgo de alucinación inherente a modelos generativos; no se reportan evaluaciones de factualidad.
- Sesgos conocidos: no disponibles.
- Licencia Apache-2.0 permite uso comercial, pero al derivar de un modelo base Apache-2.0 conviene verificar las condiciones del modelo original y atribuir correctamente.
- El soporte de tool calling no está confirmado explícitamente; validar antes de usarlo en producción con function calling.

## Enlaces

- Hugging Face: https://huggingface.co/nbKPS/beam-reap-255b-gguf
- Modelo base: https://huggingface.co/reflection/Beam-1.0-501B-A23B
- Keep BF16 de la poda: nbKPS/beam-reap-255b-bf16 (referenciado en la model card, sin URL completa en la información disponible)
- Documentación interna del repo: README-IRRATIONALS.md, IMATRIX-README.md, SHA256SUMS, serve/README.md, serve/patches/, serve/doors/, teacher-kl/ (rutas dentro del repositorio, sin URL directa en la información disponible)
