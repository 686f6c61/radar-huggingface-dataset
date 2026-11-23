# AMAImedia/Ling-3.1-Flash-1019-AD-IQ2_M-GGUF

## Resumen

Ling-3.1-Flash-1019-AD-IQ2_M-GGUF es una cuantización en formato GGUF del modelo Ling-3.1-flash-1019, publicado por AMAImedia a partir de los pesos originales de inclusionAI y de la cuantización intermedia de AtomicChat. El modelo base es un transformer MoE híbrido de 560B parámetros totales con 25B activos por token y una ventana de contexto de 1M tokens, orientado a razonamiento complejo, ejecución de tareas multi-paso y flujos agénticos en entornos reales. Esta versión concreta aplica cuantización IQ2_M con matriz imatrix, pensada para reducir el peso en disco y permitir despliegue en hardware más modesto a costa de precisión.

La relevancia de esta ficha radica en que permite ejecutar localmente, vía llama.cpp y formatos GGUF, un modelo de escala 560B que de otro modo requeriría clústeres de GPU de gama alta. El autor de la cuantización indica que su hardware local es una RTX 3060 Laptop de 6 GB, por lo que las cuantizaciones de esta clase se orientan a inferencia con offloading parcial a RAM y CPU. El repo ocupa 226,8 GB y acumula 919 descargas en Hugging Face.

El modelo base declara 30 idiomas, licencia MIT y soporte de modo thinking, tool calling y decodificación especulativa MTP (NEXTN) en SGLang. La cuantización conserva la licencia MIT del original y está etiquetada como compatible con endpoints.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hybrid-linear MoE (63 capas KDA + 9 Gated MLA, ratio 7:1; 4 capas densas) |
| Parametros totales | 572.120.680.768 (dato real de safetensors); la model card declara 560B |
| Parametros activos | 25B por token (8 expertos enrutados + 1 compartido, de 512 enrutados) |
| Longitud de contexto | 1M tokens |
| Tipos de cuantizacion | IQ2_M (esta ficha); existen otras variantes GGUF del repo base de AtomicChat |
| Idiomas soportados | zh, en, ru, vi, ja, hi, es, fr, de, pt, it, ar, ko, th, id, ms, bn, tr, pl, uk, nl, cs, sv, ro, el, he, fa, ur, kk, uz (30 idiomas) |
| Licencia | MIT |
| Formato de pesos | GGUF (repo de 226,8 GB); pesos originales en safetensors en el modelo base |

Otros datos de arquitectura declarados: 64 cabezas de atención, hidden size 4096, expert intermediate size 1280, dense intermediate size 10240, vocabulario de 157184 tokens.

## Arquitectura y entrenamiento

El modelo base es un MoE híbrido que combina capas de atención linear (KDA) con capas de atención Gated MLA en proporción 7:1, más 4 capas densas. Cada token activa 8 de los 512 expertos enrutados, además de un experto compartido, lo que da 25B parámetros activos sobre 560B totales. Esta configuración busca mantener la capacidad de un modelo de gran escala con un coste de cómputo por token comparable a modelos mucho menores, algo crítico para contextos de 1M tokens.

El modelo base declara optimizaciones de post-entrenamiento respecto a Ling-3.1-flash, con mejoras en razonamiento y capacidades agénticas. No se detalla en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicó RLHF o DPO. Sí se menciona soporte de decodificación especulativa MTP (NEXTN) en SGLang y optimizaciones de decode para Hopper (FP8 block GEMV y cuantización fused KDA output). La cuantización IQ2_M con imatrix es una innovación propia de esta ficha: usa una matriz de importancia para asignar bits de forma no uniforme y preservar mejor las capas sensibles.

## Capacidades

- Generación de texto conversacional multi-turno con ventana de 1M tokens.
- Razonamiento complejo y ejecución de tareas multi-paso (modo thinking activable vía `enable_thinking`).
- Capacidades agénticas y flujos de trabajo automatizados; el modelo base reporta mejoras en AutomationBench-AA y AA-Briefcase.
- Razonamiento científico y generación de código científico (mejoras declaradas en CritPt y SciCode).
- Soporte multilingüe en 30 idiomas, incluidos español, francés, alemán, portugués, italiano, árabe, hindi, japonés, coreano, turco, polaco, ucraniano, hebreo, persa, urdu, kazajo y uzbeko.
- Tool calling / function calling: la model card del base menciona recetas verificadas de tool calling en SGLang.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Decodificación especulativa MTP (NEXTN) en el modelo base.

## Casos de uso

- Atención al cliente automatizada multilingüe: con 1M tokens de contexto, el modelo puede mantener historiales de conversación muy largos y cambiar de idioma dentro de la misma sesión, cubriendo 30 lenguas sin modelos auxiliares.
- Automatización de flujos agénticos: el modelo base reporta 68% en AutomationBench-AA, lo que lo hace adecuado para pipelines que encadenan tool calling, consultas a APIs y ejecución de pasos múltiples.
- Asistencia a investigación científica: las mejoras declaradas en CritPt (26%) y SciCode (57%) lo posicionan para tareas de razonamiento científico y generación de código de análisis.
- Generación de código en pipelines de CI/CD: el soporte de tool calling y la ventana larga permiten pasar repositorios o logs extensos como contexto y generar parches o revisiones.
- Doblaje y localización de contenido: el autor publica esta cuantización en el marco de NOESIS, una plataforma de automatización de doblaje multilingüe, por lo que el modelo encaja en traducción y adaptación de guiones con contexto largo.
- Despliegue local con hardware limitado: la cuantización IQ2_M permite ejecutar un modelo de 560B con offloading a RAM y CPU en equipos de consumo, útil para prototipado y pruebas sin clúster.
- Análisis de documentos extensos: contratos, informes o bases de código que superan contextos habituales caben en la ventana de 1M tokens.
- Servicio de inferencia compatible con API: el tag `endpoints_compatible` facilita integrarlo detrás de endpoints tipo OpenAI en SGLang o vLLM.

## Benchmarks y rendimiento

Datos declarados para el modelo base Ling-3.1-flash-1019 frente a su predecesor Ling-3.1-flash:

| Benchmark | Ling-3.1-flash | Ling-3.1-flash-1019 |
|---|---|---|
| AA-Briefcase (Elo) | ~1400 | 1524 |
| AutomationBench-AA | 62% | 68% |
| CritPt | 18% | 26% |
| SciCode | 54% | 57% |
| Artificial Analysis Intelligence Index v4.3.2 | 41 | 44 |

No se han publicado resultados de benchmarks específicos para la cuantización IQ2_M en la información disponible; los valores anteriores corresponden al modelo base sin cuantizar.

## Requisitos de hardware

- VRAM estimada: no disponible de forma exacta para IQ2_M; el repo completo ocupa 226,8 GB, por lo que la inferencia requiere offloading a RAM/CPU salvo en configuraciones multi-GPU de gran capacidad.
- GPU recomendadas para el modelo base sin cuantizar: 8 × H200 con TP8 + EP8, o 4 × GB300 con TP4 + EP4; también hay recetas verificadas para H800, H100 y B200.
- GPU de consumo: el autor indica que su equipo local es una RTX 3060 Laptop de 6 GB con 64 GB DDR5, adecuado para imatrix y modelos de 0,6–35B en RAM; para 9B+ y búsquedas usa H200/Blackwell alquiladas. Por tanto, esta cuantización de 560B no cabe íntegramente en una GPU de consumo y depende de offloading.
- Opciones de despliegue: SGLang (recomendado, con imagen `lmsysorg/sglang:dev-ling-3.1-flash` y decodificación especulativa NEXTN), vLLM, y llama.cpp/Ollama para el formato GGUF.
- Latencia y throughput: no disponibles. La model card menciona que las optimizaciones de decode para Hopper aportan ~10% de mejora en decode batch-1, pero no ofrece cifras absolutas.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Índice / rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ling-3.1-flash-1019 (este base) | 560B / 25B | 1M | AA Index 44; AA-Briefcase 1524 Elo | MIT | Hugging Face, ModelScope, OpenRouter |
| Ling-3.1-flash (predecesor) | 560B / 25B (según model card) | 1M (según model card) | AA Index 41; AA-Briefcase ~1400 Elo | MIT | Hugging Face |
| Otras alternativas de escala 500B+ MoE | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos suficientes sobre modelos comparables de terceros (parámetros, contexto, benchmarks y licencia) para establecer una comparativa rigurosa.

## Limitaciones y advertencias

- La cuantización IQ2_M es agresiva (2 bits por peso en promedio); se espera degradación de precisión respecto al modelo base, especialmente en razonamiento matemático y código, aunque no se han publicado métricas de esa pérdida.
- El tamaño del repo (226,8 GB) y los 560B parámetros implican que la inferencia requiere offloading y tiempos de carga elevados en hardware de consumo.
- Riesgo de alucinación inherente a modelos generativos de gran escala; no se documentan mecanismos específicos de mitigación en la información disponible.
- Sesgos conocidos: no documentados en la model card; el entrenamiento multilingüe en 30 idiomas puede introducir desequilibrios de calidad entre lenguas.
- Idiomas: aunque se declaran 30 idiomas, no se especifica el nivel de competencia por idioma; el español figura en la lista pero sin métricas dedicadas.
- Licencia MIT: permite uso comercial, pero conviene verificar las condiciones del modelo base y de la cuantización intermedia de AtomicChat, así como las obligaciones de atribución.
- La model card incluye contenido promocional y enlaces de donación del autor de la cuantización; no debe interpretarse como documentación técnica oficial de inclusionAI.
- El modelo base está pensado para despliegue en SGLang/vLLM con múltiples GPU; el rendimiento en llama.cpp con esta cuantización no está medido en la información disponible.

## Enlaces

- Hugging Face (esta cuantización): https://huggingface.co/AMAImedia/Ling-3.1-Flash-1019-AD-IQ2_M-GGUF
- Modelo base original: https://huggingface.co/inclusionAI/Ling-3.1-flash-1019
- Cuantización GGUF intermedia: https://huggingface.co/AtomicChat/Ling-3.1-flash-1019-GGUF
- Predecesor: https://huggingface.co/inclusionAI/Ling-3.1-flash
- Organización inclusionAI en Hugging Face: https://huggingface.co/inclusionAI
- ModelScope: https://modelscope.cn/organization/inclusionAI
- OpenRouter: https://openrouter.ai/inclusionai/ling-3.1-flash
- Cookbook SGLang Ling-3.1-flash: https://docs.sglang.io/cookbook/autoregressive/InclusionAI/Ling-3.1-flash
- Web del autor de la cuantización: https://AMAImedia.com
- X del autor: https://x.com/AMAImediacom
- LinkedIn del autor: https://www.linkedin.com/in/ilia-bolotnikov
- Telegram del autor: https://t.me/djbionicl
