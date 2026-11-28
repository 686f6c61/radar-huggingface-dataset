# AMAImedia/Ling3.2-124B-A5.5B-FP8-GGUF

## Resumen

Ling3.2-124B-A5.5B-FP8-GGUF es una cuantización en formato GGUF (y pesos FP8) del modelo Ling-3.2-air, publicado por el usuario AMAImedia a partir del trabajo original de inclusionAI y de la cuantización intermedia de bartowski. Se trata de un modelo de lenguaje de tipo Mixture-of-Experts (MoE) con arquitectura híbrida linear-attention, 124B parámetros totales y solo 5,5B parámetros activos por token, lo que lo sitúa en la liga de modelos grandes con coste de inferencia reducido. El repositorio incluye safetensors en FP8 y ficheros GGUF generados con imatrix para despliegue en CPU/GPU de consumo.

El modelo original Ling-3.2-air está orientado a automatización de flujos de trabajo, razonamiento sobre documentos profesionales, análisis cuantitativo y tareas legales, con soporte nativo multimodal (visión-lenguaje) heredado de Ling-3.0-flash-VL. Su relevancia actual radica en que ofrece un contexto de hasta 256K tokens, capacidades de tool calling y decodificación especulativa MTP, con licencia MIT, lo que facilita su uso comercial sin restricciones.

Esta ficha describe la variante cuantizada publicada por AMAImedia, pero los datos de arquitectura y evaluación provienen del modelo base inclusionAI/Ling-3.2-air, ya que la model card del repositorio cuantizado reproduce esa información.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hybrid-linear MoE (35 capas KDA + 7 Gated MLA, ratio 5:1; 2 capas densas) |
| Parametros totales | 124B (127.920.654.544 según safetensors) |
| Parametros activos | 5,5B |
| Longitud de contexto | 256K tokens (262.144) |
| Tipos de cuantizacion | FP8 y GGUF (generado con imatrix); niveles GGUF concretos no disponibles |
| Idiomas soportados | zh, en, ru, vi, ja, hi, es, fr, de, pt, it, ar, ko, th, id, ms, bn, tr, pl, uk, nl, cs, sv, ro, el, he, fa, ur, kk, uz |
| Licencia | MIT |
| Formato de pesos | safetensors (FP8), GGUF |
| Expertos enrutados | 512 (8 activados) + 1 compartido |
| Cabezas de atencion | 32 |
| Hidden size | 2560 |
| Tamano de vocabulario | 157.184 |
| Tamano del repo | 263,8 GB |

## Arquitectura y entrenamiento

Ling-3.2-air emplea una arquitectura MoE híbrida con atención lineal: 35 capas KDA (Kimi-style Delta Attention) combinadas con 7 capas de Gated MLA en proporción 5:1, más 2 capas densas. El modelo tiene 512 expertos enrutados con 8 activos por token y un experto compartido, con tamaño intermedio de experto de 768 y tamaño intermedio denso de 6144. La atención híbrida reduce el coste cuadrático del contexto largo, lo que permite operar con ventanas de 256K tokens de forma eficiente. Incluye decodificación especulativa MTP (NEXTN), soportada de forma nativa en SGLang.

No se dispone en la información proporcionada del número exacto de tokens de entrenamiento, la composición del dataset ni los detalles del pipeline de alineación (RLHF/DPO). La model card del repositorio cuantizado no incluye esa información; solo referencia el modelo base inclusionAI/Ling-3.2-air y su predecesor Ling-3.0-flash-VL, del que hereda la arquitectura multimodal nativa.

## Capacidades

- Generación de texto y razonamiento multi-paso en contextos largos (hasta 256K tokens).
- Razonamiento sobre documentos profesionales y flujos de trabajo (workflow automation).
- Análisis cuantitativo de datos y tareas legales (evaluado en Harvey LAB-AA v1.1).
- Capacidades multimodales nativas (visión-lenguaje), heredadas de Ling-3.0-flash-VL.
- Tool calling / function calling, con parser automático (`ling3`) en SGLang.
- Soporte de agentes y ejecución de tareas en terminal (Terminal-Bench 4.0).
- Multilingüe: 30 idiomas declarados, incluyendo castellano, inglés, chino, ruso, árabe, hindi, japonés, coreano, entre otros.
- Modo de razonamiento con parser dedicado (`reasoning-parser auto`).
- Decodificación especulativa MTP (NEXTN) para acelerar la inferencia.

## Casos de uso

- Automatización de flujos de trabajo profesionales: el modelo está optimizado para workflow automation (AutomationBench-AA 61%), por lo que puede orquestar pipelines con tool calling y contexto largo para tareas de back-office.
- Análisis de documentos legales: su rendimiento en Harvey LAB-AA v1.1 (87,7% de criterios superados) lo hace adecuado para revisión de contratos y extracción de cláusulas, con la advertencia de la tasa de alucinación tras el chequeo material.
- Análisis cuantitativo de datos: puede procesar tablas y documentos financieros extensos gracias a la ventana de 256K tokens.
- Agentes autónomos en terminal: con un 27% de pass rate en Terminal-Bench 4.0, es viable para tareas de automatización de shell y CI/CD con supervisión humana.
- Atención al cliente multilingüe: cubre 30 idiomas con conversaciones multi-turno de contexto largo.
- Generación de código asistida con tool calling: integrable en pipelines de desarrollo mediante SGLang con parsers automáticos.
- Doblaje y localización automatizada: el publicador lo enmarca en su plataforma NOESIS de doblaje multilingüe, lo que sugiere uso para traducción y adaptación de guiones.
- Despliegue en hardware de consumo mediante GGUF: la cuantización permite ejecución local en equipos con VRAM limitada, aunque con degradación de calidad respecto a FP8.

## Benchmarks y rendimiento

Resultados reportados en la model card del modelo base (Ling-3.2-air), comparados con su predecesor:

| Benchmark | Ling-3.2-air | Predecesor |
|---|---|---|
| AutomationBench-AA | 61% | 15,7% |
| GDP.pdf (all-pass) | 16% | 8,4% |
| AA-Briefcase v1.1 (Elo) | 1340 | 987 |
| Terminal-Bench 4.0 | 27% | 0% |
| Artificial Analysis Intelligence Index v5.0.1 | 23 | no disponible |
| Harvey LAB-AA v1.1 (criterios) | 87,7% | no disponible |
| Harvey LAB-AA v1.1 (all-pass, antes de chequeo) | 8,3% | no disponible |
| Harvey LAB-AA v1.1 (all-pass, tras chequeo) | 0,8% | no disponible |

No se han publicado resultados de MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada: el modelo completo en FP8 requiere del orden de 124 GB de pesos, por lo que necesita múltiples GPU. La receta oficial de SGLang recomienda 4 GPU de clase 141 GB (H20-3e, H200) o nodos Blackwell (B300/GB300) para 256K de contexto.
- En tarjetas de 80 GB (H100/H800) se recomienda escalar a `--tp 8`.
- Las versiones GGUF con cuantización agresiva pueden caber en configuraciones de consumo, pero el tamaño del repo (263,8 GB) incluye múltiples ficheros; el nivel GGUF concreto no está especificado en la información disponible.
- Despliegue recomendado: SGLang (imagen `lmsysorg/sglang:dev-Ling-3.0-flash-VL`) con `--tp 4`, `--context-length 262144`, `--speculative-algorithm NEXTN`, `--trust-remote-code`, `--reasoning-parser auto` y `--tool-call-parser auto`.
- Alternativas de despliegue para GGUF: llama.cpp u Ollama (no confirmadas explícitamente en la información).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos comparativos directos con otros modelos de la misma categoría (MoE de ~100B con pocos parámetros activos). Los benchmarks de la model card solo comparan con el predecesor Ling-3.0-flash-VL. Por tanto, la comparativa con alternativas como DeepSeek, Qwen MoE u otros queda como "no disponible" en esta ficha.

## Limitaciones y advertencias

- Tasa de alucinación relevante en tareas legales: el all-pass de Harvey LAB-AA cae del 8,3% al 0,8% tras el chequeo de alucinación material, lo que indica riesgo de fabricación de contenido en dominios especializados.
- El rendimiento en Terminal-Bench 4.0 es del 27%, insuficiente para autonomía total en tareas de terminal sin supervisión.
- La cuantización GGUF y FP8 puede degradar la calidad respecto a los pesos originales en BF16; no se documentan evaluaciones de la variante cuantizada.
- La model card del repositorio cuantizado no incluye información sobre sesgos, datos de entrenamiento ni limitaciones idiomáticas específicas.
- Licencia MIT: permite uso comercial sin restricciones, pero conviene verificar las condiciones del modelo base inclusionAI/Ling-3.2-air.
- El repositorio es una cuantización de terceros (AMAImedia sobre bartowski), no una publicación oficial de inclusionAI; la trazabilidad de la cuantización debe verificarse antes de producción.
- El contexto de 256K requiere hardware de gama alta; en configuraciones reducidas habrá que truncar contexto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AMAImedia/Ling3.2-124B-A5.5B-FP8-GGUF
- Modelo base original: https://huggingface.co/inclusionAI/Ling-3.2-air
- Cuantización GGUF intermedia: https://huggingface.co/bartowski/Ling-3.2-air-GGUF
- Modelo predecesor multimodal: https://huggingface.co/inclusionAI/Ling-3.0-flash-VL
- Organización inclusionAI en Hugging Face: https://huggingface.co/inclusionAI
- ModelScope: https://www.modelscope.cn/models/inclusionAI/Ling-3.2-air
- X (Twitter) del publicador: https://x.com/AMAImediacom
- LinkedIn del publicador: https://www.linkedin.com/in/ilia-bolotnikov
- Telegram del publicador: https://t.me/djbionicl
