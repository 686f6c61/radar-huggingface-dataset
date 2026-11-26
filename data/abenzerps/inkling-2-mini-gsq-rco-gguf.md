# abenzerps/Inkling-2-Mini-GSQ-RCO-GGUF

## Resumen

Inkling-2-Mini es un modelo multimodal (texto e imagen) desarrollado por Thinking Machines, publicado originalmente en formato safetensors y aquí redistribuido en cuantizaciones GGUF por el usuario abenzerps bajo el esquema denominado GSQ-RCO (mixed-precision). Se trata de un transformer de tipo Looped Sparse MoE con 26.070.385.152 parámetros totales, 128 expertos con enrutamiento top-8 y una ventana de contexto de hasta 1M de tokens mediante atención híbrida de ventana deslizante y atención global.

El modelo resuelve el problema de ejecutar un MoE multimodal de gran tamaño en hardware de consumo: las cuantizaciones publicadas van desde 2,25 bpw (7,32 GB) hasta 4,25 bpw (13,84 GB), lo que permite inferencia con 8, 12, 16 o 24 GB de VRAM. Incluye un proyector de visión independiente (mmproj) en BF16 y Q8_0, y soporta decodificación especulativa opcional mediante un modelo draft DSpark.

Su relevancia actual radica en la combinación de contexto extremadamente largo (128k verificados en 12 GB de VRAM con caché KV cuantizada), capacidades de razonamiento multi-paso y multimodalidad nativa, todo ello bajo licencia Apache 2.0 y ejecutable en llama.cpp y Ollama. El repositorio acumula 16.479 descargas y 33 likes desde su publicación el 22 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Looped Sparse MoE (transformer con capas medias en bucle) + vision encoder |
| Parametros totales | 26.070.385.152 (26,1B) |
| Parametros activos | 3,4B brutos / 5,4B efectivos (3x capas medias en bucle, 128 expertos top-8) |
| Longitud de contexto | Hasta 1M tokens (atencion hibrida: ventana deslizante + global); 128k verificados en configuraciones de 12-24 GB |
| Tipos de cuantizacion | IQ1_M (2,25 bpw), IQ2_XS (2,75 bpw), IQ3_XS (3,25 bpw), IQ3_M (3,75 bpw), IQ4_XS (4,25 bpw); mmproj en BF16 y Q8_0; draft DSpark en Q8_0 y BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); modelo base en safetensors |

## Arquitectura y entrenamiento

La arquitectura es un MoE disperso con bucle (Looped Sparse MoE): las capas medias se ejecutan tres veces, lo que eleva los parámetros activos efectivos de 3,4B a 5,4B sin incrementar el coste de memoria. El enrutamiento top-8 sobre 128 expertos está diseñado para preservar el enrutamiento sin pérdida tras la cuantización, según el autor de la conversión. La atención es híbrida, combinando ventana deslizante con atención global, lo que habilita la ventana de 1M de tokens. El modelo integra un proyector de visión separado para entrada image-text-to-text.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO en la información proporcionada. La innovación técnica destacable en esta distribución es la cuantización mixed-precision GSQ-RCO, orientada a mantener la calidad del enrutamiento de expertos, junto con el soporte de decodificación especulativa mediante el draft DSpark (PR #32218 de llama.cpp) y la gestión de caché KV cuantizada (q4_0/q8_0) para maximizar el contexto útil en VRAM limitada.

## Capacidades

- Generación de texto y razonamiento multi-paso, con modo de razonamiento explícito (tag `reasoning`).
- Procesamiento de imagen y texto de forma nativa (pipeline image-text-to-text) mediante `--mmproj`.
- Generación de código y matemáticas, con aceleración específica mediante decodificación especulativa DSpark en cargas estructuradas de código y matemáticas en inglés.
- Conversación multi-turno con plantilla Jinja (`--jinja`).
- Contexto largo de hasta 1M de tokens, con 128k prácticos en 12 GB de VRAM.
- Compatibilidad con endpoints (tag `endpoints_compatible`) y despliegue en llama.cpp, llama-server, LM Studio y Ollama.
- Capacidades multilingües: no disponible (no se especifican idiomas en la información).

## Casos de uso

- Análisis de documentos extensos: con 128k tokens de contexto en 12 GB de VRAM (IQ2_XS, caché KV q4_0), el modelo puede procesar informes completos, expedientes o bases de código sin fragmentación, manteniendo coherencia entre secciones distantes.
- Asistente de código en local: la cuantización IQ3_XS (10,58 GB) cabe en GPU de 12-16 GB y, combinada con el draft DSpark, acelera la generación de código estructurado en inglés dentro de flujos de autocompletado o revisión.
- Procesamiento de capturas y documentos escaneados: el proyector de visión BF16 (642 MB, aproximadamente 9 veces más rápido en GPU que Q8_0) permite extraer y razonar sobre texto e imágenes en un mismo prompt, útil para digitalización con comprensión semántica.
- Razonamiento matemático y resolución de problemas: el modo de razonamiento multi-paso y la decodificación especulativa en matemáticas lo hacen adecuado para tutoría o verificación de cálculos en entornos sin conexión.
- Despliegue en estaciones de trabajo con 24 GB: con IQ4_XS (13,84 GB) y caché KV q8_0 se obtiene una calidad casi sin pérdida y 128k de contexto, apto para pipelines de análisis internos que requieren privacidad de datos.
- Prototipado rápido en portátiles Apple Silicon: IQ2_XS (8,95 GB) e IQ3_M (12,21 GB) están indicados para Mac de 16 y 24 GB respectivamente, permitiendo experimentar con un MoE multimodal sin infraestructura de servidor.
- Automatización de agentes con contexto largo: la ventana extendida y el soporte de plantilla Jinja facilitan cadenas de razonamiento multi-paso sobre historiales extensos de herramientas y observaciones.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluaciones oficiales del modelo base que compara Inkling 2 Mini con Gemma 4 31B, Muse Glimmer, Qwen3.8-27B y Nemotron 3.5 Super VL, pero los valores numéricos de dicha tabla no están disponibles en la información proporcionada.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada (solo pesos): IQ1_M 7,32 GB; IQ2_XS 8,95 GB; IQ3_XS 10,58 GB; IQ3_M 12,21 GB; IQ4_XS 13,84 GB. Añadir 346-642 MB si se usa visión con mmproj.
- 8 GB de VRAM: IQ1_M, uso ultracompacto.
- 12 GB de VRAM: IQ2_XS con 128k de contexto y caché KV q4_0 (11,7 GiB medidos); IQ3_XS como punto óptimo de compromiso.
- 16 GB de VRAM: IQ3_M con 128k de contexto (14,3 GiB medidos con `-ub 64 -ctk q4_0 -ctv q4_0`).
- 24 GB de VRAM: IQ3_M con 128k y caché KV q8_0 (20,1 GiB medidos con `-ub 256`); IQ4_XS para calidad casi sin pérdida.
- Mac Apple Silicon: IQ2_XS en 16 GB; IQ4_XS en 24 GB.
- GPU recomendadas: no se especifican modelos concretos (A100, H100, RTX 4090) en la información; los datos de VRAM apuntan a GPUs de consumo de 8-24 GB y a Mac unificados.
- Despliegue: llama.cpp / llama-server, LM Studio, Ollama (`ollama run hf.co/abenzerps/Inkling-2-Mini-GSQ-RCO-GGUF:IQ3_XS`). No se mencionan vLLM ni TGI para estos GGUF.
- Ajustes clave: Flash Attention activada (`-fa on`), `-np 1`, `-b 2048`, y `-ub` entre 64 y 128 (el batch físico escala el buffer de cómputo linealmente con el contexto; `-b` no). Evitar caché KV mixta q8_0/q4_0. Muestreo recomendado: temperature 1.0, top_p 1.0, top_k 0, min_p 0.0.
- Latencia y throughput: no disponibles como cifras absolutas; la model card solo indica que DSpark acelera código y matemáticas estructuradas en inglés y ralentiza chat general o generación no inglesa cuando baja la tasa de aceptación.

## Comparativa con modelos similares

La model card del autor compara el modelo base con las siguientes alternativas, aunque sin valores numéricos disponibles:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Inkling-2-Mini (este) | 26,1B totales / 5,4B efectivos | Hasta 1M (128k prácticos en 12 GB) | Apache 2.0 | GGUF en HF, llama.cpp, Ollama |
| Gemma 4 31B | 31B (dato de la model card) | no disponible | no disponible | no disponible |
| Muse Glimmer | no disponible | no disponible | no disponible | no disponible |
| Qwen3.8-27B | 27B (dato de la model card) | no disponible | no disponible | no disponible |
| Nemotron 3.5 Super VL | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparado en la información proporcionada.

## Limitaciones y advertencias

- No se documentan sesgos conocidos del modelo base en la información disponible.
- Riesgo de alucinación inherente a los modelos generativos; no se aportan tasas de error ni evaluaciones de fidelidad.
- Idiomas soportados no especificados; la decodificación especulativa DSpark solo beneficia a código y matemáticas en inglés y puede degradar el rendimiento en otros idiomas.
- La cuantización IQ1_M e IQ2_XS puede degradar la calidad respecto al modelo base; el autor solo garantiza "enrutamiento sin pérdida" como objetivo del esquema GSQ-RCO, sin métricas publicadas que lo respalden.
- DSpark requiere una compilación de llama.cpp con soporte específico (PR #32218) y no funciona en LM Studio estándar; además puede ralentizar cargas no estructuradas.
- El contexto de 1M no está verificado en las configuraciones de VRAM listadas; los valores medidos llegan a 128k. El autor menciona un PR pendiente (#32740) para maximizar el contexto utilizable.
- Licencia Apache 2.0: permite uso comercial, pero debe conservarse el aviso de licencia y atribución correspondiente.
- El repositorio es una cuantización de terceros (abenzerps), no una publicación oficial de Thinking Machines; la responsabilidad sobre la fidelidad de los pesos recae en el conversor.
- Tamaño del repo de 54,9 GB: requiere espacio en disco considerable para descargar varias cuantizaciones.

## Enlaces

- Repositorio GGUF: https://huggingface.co/abenzerps/Inkling-2-Mini-GSQ-RCO-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Solicitud de modelos del autor: https://abenzerps.com/request-a-model/
- GitHub del autor: https://github.com/abenzerps
- Paper referenciado (arXiv 2604.18556): https://arxiv.org/abs/2604.18556
- Paper referenciado (arXiv 2605.00649): https://arxiv.org/abs/2605.00649
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
