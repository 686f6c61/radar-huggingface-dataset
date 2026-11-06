# knoopx/Swift-1.5-FN-GSQ-RCO-IQ3_S-Basalt

## Resumen

Swift 1.5 Flash-Next GSQ-RCO IQ3_S es un modelo de lenguaje de tipo Mixture of Experts (MoE) derivado de Qwen3.8-Flash-Next, ajustado finamente por ukisai para tareas agénticas y de razonamiento, y posteriormente cuantizado con el esquema GSQ (mixed-precision) y el presupuesto de bits por tensor RCO. El paquete que nos ocupa, publicado por knoopx, no es un GGUF convencional sino un archivo único en formato propietario `.basalt`, convertido desde la release GGUF de ukisai para su uso con el motor de inferencia Basalt.

La arquitectura subyacente es un transformer MoE con 48 capas, 512 expertos por capa y 10 expertos activos por token, una ventana de contexto de 262.144 tokens y atención completa cada cuatro capas (el resto emplea mecanismos de atención lineal o de bajo rango). Incluye matrices de hiper-conexión por capa, un indexador de capa oculta, una tabla PLE de n-gramas de 3 tokens y un drafter especulativo (MTP) integrado en el propio paquete.

El interés de esta ficha radica en su peculiaridad técnica: es un ejemplo de cuantización mixta agresiva (3,331 bits por parámetro de experto) combinada con un motor que gestiona expertos fuera de la VRAM, lo que permite ejecutar un modelo de gran tamaño en una única GPU Blackwell (sm_120) manteniendo el resto de expertos en RAM del sistema. El modelo no cuenta con descargas ni valoraciones en el momento de la consulta y su licencia es la Qwen Community 1.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (`qwen4exp`), 48 capas, 512 expertos, 10 activos por token, atencion completa cada 4 capas, hiper-conexiones, indexador de capa oculta, PLE de 3-gramas |
| Parametros totales | 120.795.955.200 parametros de experto (solo expertos); total del modelo no disponible |
| Parametros activos | 10 de 512 expertos por token (parametros activos totales no disponibles) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Mixta por capa: IQ2_S, IQ3_XXS, IQ3_S, IQ4_XS en gate/up; IQ4_NL o Q2_0 en down; tabla PLE en IQ4_NL; router en BF16; drafter en q2_0 |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (`license: other`) |
| Formato de pesos | `.basalt` (paquete único propietario del motor Basalt); origen GGUF de 2 shards |

Especificaciones adicionales del paquete:

| Parametro | Valor |
|---|---|
| Tamano del archivo | 87.060.906.274 bytes (81,08 GiB) |
| Bits por parametro de experto | 3,331 bpw (50.292.326.400 bytes / 120.795.955.200 parametros) |
| Cabezas de atencion | 24 cabezas sobre 2 KV heads |
| Vocabulario | 248.320 tokens (pre-tokenizer `qwen35`) |
| Seccion `experts` | 46,84 GiB |
| Seccion `gguf` (tensores no experto) | 31,14 GiB, de los cuales 26,82 GiB son la tabla PLE |
| Drafter especulativo (MTP) | 786 MiB, vocabulario de propuesta de 106.299 tokens |
| Proyector de vision | 876 MiB (`vision/mmproj` + `vision/text_vocab`) |
| SHA-256 | `c052a5965d7dd3b2066969e557f301b57d64702cace326063af974c6b68f2cc4` |
| Muestreo por defecto | T 1.0, top-p 0.95, top-k 20, min_p 0 |

## Arquitectura y entrenamiento

La arquitectura es un transformer MoE con 48 capas y 512 expertos por capa, de los cuales 10 se activan por token. La atención usa 24 cabezas sobre 2 KV heads, con atención completa solo cada cuatro capas; el resto emplea mecanismos de atención más económicos. Cada capa incorpora matrices de hiper-conexión tanto en atención como en FFN (`hyper_connection.count 4`, rango bajo 320) y un indexador de capa oculta con `top_k 2048`. El modelo incluye además una tabla PLE de 3-gramas de 26,82 GiB en IQ4_NL con forma `[160, 320001536]`, un componente poco habitual que el motor trata de forma separada y que nunca se carga en RAM.

El paquete no documenta el proceso de entrenamiento del fine-tune Swift 1.5 (número de tokens, composición del dataset, uso de RLHF/DPO), por lo que esos datos no están disponibles. Lo que sí se detalla es el proceso de cuantización: RCO eligió por capa la combinación de encoding para gate/up y down, resultando en siete combinaciones distintas (por ejemplo, 15 capas con IQ2_S/IQ4_NL, 14 con IQ3_XXS/IQ4_NL, 9 con IQ3_S/IQ4_NL, y combinaciones con Q2_0 en down en 9 capas). Los 96 tensores de router se almacenan como BF16 exacto (`max_abs_err` 0.0) y todos los tensores se copiaron byte a byte sin redondeo. El drafter especulativo, el perfil de expertos y el proyector de visión se injertaron desde el paquete IQ3_S oficial del modelo base, verificados por digest; el vocabulario es idéntico al del base (248.320 tokens, mismo hash), condición que el conversor exige para permitir el injerto.

## Capacidades

- Generación de texto conversacional multi-turno con contexto de hasta 262.144 tokens.
- Razonamiento y razonamiento multi-paso orientado a agentes (etiquetas `reasoning` y `agentic` en la model card).
- Entrada de imágenes mediante el proyector de visión incluido en el paquete (`vision/mmproj`), que requiere el binario `basalt-vision` y configurar `"vision"` en el servidor.
- Decodificación especulativa integrada mediante el drafter MTP y su vocabulario de propuesta de 106.299 tokens.
- Servidor compatible con las APIs de OpenAI y Anthropic, lo que facilita la integración con clientes existentes.
- Soporte de tool calling y function calling: no documentado explícitamente en la información disponible, aunque las etiquetas `agentic` y la compatibilidad de API lo hacen plausible; no se confirma.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo de pensamiento (*thinking*): no documentado en la información disponible.

## Casos de uso

- **Agentes autónomos de larga duración**: con 262.144 tokens de contexto, el modelo puede mantener el estado de una tarea multi-paso (planificación, ejecución de herramientas, corrección de errores) sin truncar el historial. La etiqueta `agentic` del fine-tune y el servidor compatible con OpenAI/Anthropic permiten conectarlo a frameworks de agentes existentes.
- **Atención al cliente con historial extenso**: conversaciones multi-turno con documentos de referencia largos (manuales, contratos, tickets previos) caben en una sola ventana, evitando técnicas de recuperación fragmentada.
- **Análisis de documentos con imágenes**: el proyector de visión permite procesar capturas, diagramas o páginas escaneadas junto con texto, útil para extracción de datos en flujos documentales.
- **Generación de código en pipelines internos**: el modelo base Qwen3.8-Flash-Next está orientado a código y razonamiento; el fine-tune agéntico lo hace adecuado para tareas de refactorización guiada por herramientas, aunque la licencia Qwen Community 1.0 debe revisarse antes de un uso comercial.
- **Razonamiento sobre corpus técnicos largos**: la ventana de 262.144 tokens permite resumir o responder preguntas sobre bases de código, documentación de API o informes extensos en una sola pasada.
- **Despliegue en estación de trabajo con GPU Blackwell**: gracias al esquema de expertos fuera de VRAM, un equipo con una RTX 5090 (sm_120) y suficiente RAM del sistema puede servir el modelo localmente para prototipado y evaluación, sin depender de clústeres multi-GPU.
- **Investigación en cuantización mixta**: el paquete es un caso de estudio reproducible (sección "Build it yourself") para medir el impacto de RCO/GSQ en calidad frente a cuantizaciones uniformes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente "Not measured here. See Benchmarks", pero no se incluye tabla de resultados en el material proporcionado.

## Requisitos de hardware

- **VRAM estimada**: no disponible de forma exacta. El paquete ocupa 81,08 GiB en disco; los expertos (46,84 GiB) pueden residir parcialmente en RAM del sistema y la tabla PLE (26,82 GiB) nunca se carga en RAM. El motor reserva 700 MiB de VRAM (`vram-reserve-mib`).
- **GPU recomendadas**: NVIDIA Blackwell (sm_120) según la model card; el ejemplo de configuración usa `"gpu": "0"` y puerto 5090, lo que sugiere una RTX 5090 como objetivo. No se documentan otras arquitecturas compatibles.
- **Consumer GPU**: el diseño está pensado para una única GPU consumer Blackwell con apoyo de RAM del sistema; no se especifica la cantidad mínima de RAM necesaria.
- **Opciones de despliegue**: exclusivamente el motor Basalt (`bin/basalt serve`), con API compatible con OpenAI y Anthropic. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato.
- **Latencia y throughput**: no disponibles. El motor incluye decodificación especulativa (drafter MTP), caché de expertos (`expert-cache: auto`), prefills automáticos y KV en int8, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Swift 1.5 FN GSQ-RCO IQ3_S (Basalt) | 120,8 B de expertos, 10 activos/token | 262.144 | `.basalt` | qwen-community-1.0 | Fine-tune agéntico, cuantización mixta 3,331 bpw, visión y drafter incluidos |
| Qwen/Qwen3.8-Flash-Next | no disponible | no disponible | safetensors (base) | qwen-community-1.0 | Modelo base oficial; sin datos de tamano ni contexto en la información disponible |
| ukisai/Swift-1.5-Qwen3.8-Flash-Next-GSQ-RCO-GGUF | mismos que el paquete Basalt | 262.144 (según el paquete) | GGUF (2 shards) | qwen-community-1.0 | Misma cuantización en formato GGUF convencional; requiere un runtime GGUF compatible con la arquitectura |
| Qwen3.8-FN-GSQ-RCO-IQ3_S.basalt (ISTA) | mismos que el base | 262.144 (según el paquete) | `.basalt` | qwen-community-1.0 | Paquete oficial del base del que se injertaron drafter, perfil y proyector de visión |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- **Formato propietario**: el paquete solo funciona con el motor Basalt; no es cargable por llama.cpp, vLLM, Ollama ni TGI. Esto limita la portabilidad y crea dependencia de un único runtime.
- **Requisito de hardware restrictivo**: el motor exige una GPU NVIDIA Blackwell (sm_120); no se documenta compatibilidad con arquitecturas anteriores (Ampere, Hopper) ni con GPU de otros fabricantes.
- **Perfil de expertos no adaptado al fine-tune**: el ranking de expertos procede de las trazas de enrutamiento del modelo base, no del fine-tune. La model card recomienda generar un perfil en frío con `--dump-routing` / `--expert-profile-save` y reconvertir con `--profile FILE` para mejorar el rendimiento.
- **Cuantización agresiva**: 3,331 bits por parámetro de experto con capas en IQ2_S y Q2_0 puede degradar la calidad frente al modelo en precisión completa; no se han publicado mediciones de la pérdida.
- **Riesgo de alucinación**: inherente a los modelos de lenguaje; no se documentan evaluaciones de fidelidad ni de tasas de alucinación.
- **Sesgos**: no se documenta ninguna evaluación de sesgos; se desconoce la composición del dataset de fine-tune.
- **Idiomas**: no se especifican los idiomas soportados; el vocabulario `qwen35` sugiere herencia del ecosistema Qwen, pero no se confirma cobertura multilingüe.
- **Licencia**: `qwen-community-1.0` con `license: other`; es necesario revisar los términos de la Qwen Community License antes de cualquier uso comercial, especialmente por las restricciones habituales de esa familia de licencias.
- **Sin validación comunitaria**: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni de verificación independiente del paquete.
- **Integridad**: el autor declara que las 18 secciones se re-hashearon contra su digest tras la compilación, pero no se aportan verificaciones externas.

## Enlaces

- [Hugging Face: knoopx/Swift-1.5-FN-GSQ-RCO-IQ3_S-Basalt](https://huggingface.co/knoopx/Swift-1.5-FN-GSQ-RCO-IQ3_S-Basalt)
- [Modelo base GGUF: ukisai/Swift-1.5-Qwen3.8-Flash-Next-GSQ-RCO-GGUF](https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-Flash-Next-GSQ-RCO-GGUF)
- [Modelo base original: Qwen/Qwen3.8-Flash-Next](https://huggingface.co/Qwen/Qwen3.8-Flash-Next)
- [Motor Basalt (repositorio)](https://github.com/jesdga95/basalt)
- [Documentación de `basalt-probe`](https://github.com/jesdga95/basalt/blob/main/docs/probe.md)
- [arXiv:2604.18556](https://arxiv.org/abs/2604.18556)
- [arXiv:2605.00649](https://arxiv.org/abs/2605.00649)
