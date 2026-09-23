# IsValorum/Qwen3.6-35B-A3B-MTP-APEX-I-NanoPlus-GGUF

## Resumen

IsValorum/Qwen3.6-35B-A3B-MTP-APEX-I-NanoPlus-GGUF es una cuantización en formato GGUF del modelo Qwen/Qwen3.6-35B-A3B, publicada por el usuario IsValorum bajo licencia Apache-2.0. No es un modelo entrenado desde cero, sino una receta de compresión tensor a tensor (denominada APEX-I-NanoPlus) aplicada sobre un transformer de mezcla de expertos (MoE) dispersa con 35.505.251.456 parámetros totales y aproximadamente 3.000 millones activos por token, según la nomenclatura A3B del modelo base.

El problema que resuelve es el de la huella de memoria: el modelo base en BF16 ocupa unos 71,05 GB, mientras que esta release ocupa 13,03 GB en disco y 12,14 GiB en RAM/VRAM con 2,93 BPW medios, a cambio de un incremento de perplejidad en WikiText-2 del 3,84 % (5,5244 frente a 5,32 del BF16). El autor la posiciona como una alternativa calibrada frente a las cuantizaciones sub-3-bit genéricas de la comunidad, que según su comparativa degradan la perplejidad por encima de 5,85.

Su relevancia práctica es que permite ejecutar un MoE de 35B con contexto nativo de hasta 256K tokens en GPUs de 24 GB, con 32K-64K en tarjetas de 16 GB, o incluso total o parcialmente en RAM del sistema con velocidades declaradas de 20 a 45 tok/s. Además incorpora archivos MTP (Multi-Token Prediction) opcionales para decodificación especulativa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) dispersa; 40 capas y 256 micro-expertos según la model card del autor |
| Parametros totales | 35.505.251.456 (35,5 mil millones) |
| Parametros activos | Aproximadamente 3.000 millones según la nomenclatura A3B del modelo base (dato no confirmado en la información disponible) |
| Longitud de contexto | Hasta 256K tokens nativos en GPU de 24 GB; 32K-64K en GPU de 16 GB (según la model card) |
| Tipos de cuantizacion | GGUF APEX-I-NanoPlus, 2,93 BPW medios; existen otras variantes del mismo autor (APEX-I-MiniPlus V2.1, 3,43 BPW) y el base en BF16 (16 BPW) |
| Idiomas soportados | 13: inglés, chino, español, francés, alemán, portugués, italiano, ruso, japonés, coreano, vietnamita, tailandés y árabe |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (repo de 30,9 GB, que incluye el archivo principal de 13,03 GB y archivos MTP companion opcionales); el modelo base se distribuye en safetensors |
| Pipeline declarado | image-text-to-text (entrada multimodal de imagen y texto, según el pipeline_tag del repositorio) |
| Calibración | imatrix (matriz de importancia) del modelo base |
| Fecha de publicación | 23 de septiembre de 2026 |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE disperso con 40 capas y 256 micro-expertos, con expertos compartidos (shared expert) y capas de atención completa intercaladas. La información disponible no detalla la composición del dataset de entrenamiento, el número de tokens vistos ni si hubo fases de RLHF, DPO o ajuste por preferencias: esos datos corresponden al modelo base Qwen/Qwen3.6-35B-A3B y no se reproducen en la model card de la cuantización.

La innovación de esta release es exclusivamente la receta de cuantización APEX-I-NanoPlus, aplicada tensor a tensor en lugar de con una precisión uniforme. Los enrutadores (`gate_inp` y `gate_shexp`) se mantienen en F32 sin comprimir para evitar deriva de routing; la cabeza de salida (`output.weight`) se protege en Q6_K; las puertas de atención se fijan en Q8_0; el flujo residual crítico de la MoE (`ffn_down_exps`) se cuantiza en IQ3_XXS (3,06 bpw); y la compresión agresiva a 2 bits (IQ2_S en gate, IQ2_XXS en up) se restringe a proyecciones redundantes de los expertos centrales (capas 2-37). Los expertos de borde (capas 0-1 y 38-39) reciben un tratamiento más conservador: Q3_K en la proyección down e IQ3_XXS en gate y up. El experto compartido queda en Q4_K y las proyecciones de atención q/k/v en Q4_K, elegidas por su mejor comportamiento en descompresión SIMD sobre CPU.

No se documenta en la información disponible ningún reentrenamiento, ajuste fino ni modificación de los pesos más allá de la cuantización. Los archivos MTP permiten decodificación especulativa con múltiples predicciones de token por paso, aunque el autor no detalla la tasa de aceptación.

## Capacidades

- Generación de texto conversacional multi-turno, con etiqueta `conversational` en el repositorio.
- Razonamiento (etiqueta `reasoning`), con especial atención declarada a la precisión en modo `<think>` y a la ausencia de errores de sintaxis en tareas de código.
- Generación y edición de código, ámbito donde el autor justifica el reparto de precisión para evitar corchetes y sangrías rotas.
- Capacidad multimodal de entrada: el pipeline_tag `image-text-to-text` indica soporte de entrada de imagen junto a texto, aunque la model card no detalla el codificador visual.
- Capacidades multilingües declaradas en 13 idiomas, incluido el español.
- Decodificación especulativa mediante archivos MTP companion opcionales.
- Inferencia híbrida CPU/GPU con streaming desde RAM del sistema, con contexto largo.
- Soporte de tool calling o function calling: no documentado en la información disponible.
- Modo de razonamiento explícito tipo thinking: mencionado de forma indirecta a través de la etiqueta `reasoning` y de las referencias a la etiqueta `<think>`, sin especificación técnica completa.
- Soporte de audio o visión de vídeo: no disponible.

## Casos de uso

- Despliegue local en GPU de 16 GB: con `-ngl 99` en una RTX 4080 o RTX 4070 Ti Super, la release deja más de 3 GB de VRAM libre para contexto, lo que permite trabajar con ventanas de 32K tokens sin recurrir a offload parcial.
- Contextos muy largos en GPU de 24 GB: en RTX 3090, 4090 o 5090 se declara soporte nativo de 256K tokens, adecuado para análisis de documentación extensa, auditoría de repositorios completos o resumen de expedientes largos.
- Inferencia en RAM del sistema: en equipos sin GPU suficiente, el modelo puede ejecutarse total o parcialmente desde RAM DDR4 o DDR5 (6000+ MT/s) a 20-45 tok/s, gracias a las proyecciones de atención en Q4_K y a la preservación de las down-projections en IQ3_XXS, que reducen los bloqueos de descompresión AVX2.
- Sustitución del modelo base en entornos con memoria restringida: pasar de 71,05 GB en BF16 a 13,03 GB permite alojar el modelo en un único nodo de desarrollo o en un servidor pequeño, aceptando una pérdida medida de perplejidad del 3,84 %.
- Asistencia de programación en local: la receta preserva la cabeza de salida en Q6_K y las puertas de atención en Q8_0, lo que según el autor reduce los errores de sintaxis y el código mal indentado típicos de las cuantizaciones sub-3-bit uniformes. Encaja en flujos de trabajo de autocompletado o revisión de código offline.
- Atención al cliente multilingüe: con 13 idiomas declarados y etiqueta conversacional, puede gestionar diálogos multi-turno en español, inglés, francés o alemán, aunque la cobertura real por idioma no está medida.
- Procesamiento de documentos con imagen y texto: el pipeline declarado es image-text-to-text, lo que abre la puerta a tareas de extracción o descripción sobre capturas, formularios escaneados o gráficos acompañados de instrucciones textuales.
- Servicio de baja latencia con decodificación especulativa: los archivos MTP permiten acelerar la generación en escenarios de batch pequeño donde la latencia por token es crítica, por ejemplo asistentes interactivos.

## Benchmarks y rendimiento

Los únicos datos cuantitativos publicados en la información disponible son de perplejidad en WikiText-2, facilitados por el propio autor de la cuantización:

| Cuantización | Tamano en disco | Huella RAM/VRAM | BPW medio | Perplejidad WikiText-2 | Equivalencia de calidad |
|---|---|---|---|---|---|
| Base sin cuantizar BF16 | ~71,05 GB | ~66,18 GiB | 16,00 | ~5,32 | Línea base de precisión completa |
| APEX-I-MiniPlus V2.1 | 15,23 GB | 14,18 GiB | 3,43 | 5,3693 ± 0,12528 (+0,93 %) | Equivalente a Q6_K casi sin pérdida |
| APEX-I-NanoPlus (esta release) | 13,03 GB | 12,14 GiB | 2,93 | 5,5244 ± 0,12916 (+3,84 %) | Equivalente a Q4_K_M sólido |
| IQ2_S comunitaria genérica | ~12,2 GB | ~11,4 GiB | 2,56 | > 5,85 (degradada) | Inestable, con picos de sintaxis |

No se han publicado resultados de benchmarks en la información disponible para MMLU, HumanEval, GSM8K ni otras evaluaciones de capacidades. Tampoco hay métricas de throughput medidas de forma independiente sobre esta release concreta: los valores de 20-45 tok/s proceden del propio autor y los de 80 tok/s en 12 GB de VRAM corresponden a un artículo externo sobre el modelo base con decodificación especulativa MTP, no a esta cuantización específica.

## Requisitos de hardware

- Huella de memoria: 13,03 GB en disco y 12,14 GiB en RAM/VRAM para el archivo principal, según la model card.
- GPU de 16 GB (RTX 4080, RTX 4070 Ti Super): offload completo con `-ngl 99` y contexto nativo de 32K a 64K; el autor indica que quedan más de 3 GB de VRAM libres para 32K de contexto.
- GPU de 24 GB (RTX 3090, RTX 4090, RTX 5090): contexto nativo de hasta 256K tokens.
- GPU de 12 GB: no hay datos de esta release, pero un artículo externo sobre el modelo base reporta 80 tok/s en 12 GB de VRAM usando decodificación especulativa MTP; el dato no está verificado para APEX-I-NanoPlus.
- Ejecución en CPU y RAM del sistema: soportada de forma completa o parcial, con 20-45 tok/s según procesador y ancho de banda de memoria (DDR4 de doble canal o DDR5 a 6000+ MT/s).
- Opciones de despliegue: llama.cpp es el runtime de referencia por el formato GGUF y la etiqueta `llama.cpp`; el repositorio incluye la etiqueta `endpoints_compatible`. El uso de vLLM, TGI u Ollama no está documentado en la información disponible para esta release, aunque el formato GGUF permite su uso en el ecosistema basado en llama.cpp. La decodificación especulativa requiere un runtime con soporte de MTP y los archivos companion correspondientes.
- Latencia y throughput estimados: 20-45 tok/s en streaming desde RAM del sistema; el autor afirma que con memoria DDR5 rápida el rendimiento puede acercarse al de la ejecución íntegra en VRAM. No hay cifras de time-to-first-token ni de throughput en batch.

## Comparativa con modelos similares

La comparación más directa es entre variantes de cuantización del mismo modelo base, ya que no se dispone de datos de otros modelos de la misma categoría en la información proporcionada:

| Modelo o variante | Parametros | Contexto | Perplejidad WikiText-2 | Tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| APEX-I-NanoPlus (esta release) | 35,5B totales / ~3B activos | Hasta 256K | 5,5244 | 13,03 GB (2,93 BPW) | Apache-2.0 | GGUF en HuggingFace |
| APEX-I-MiniPlus V2.1 | 35,5B totales / ~3B activos | Hasta 256K | 5,3693 | 15,23 GB (3,43 BPW) | Apache-2.0 | GGUF en HuggingFace |
| Qwen3.6-35B-A3B BF16 (base) | 35,5B totales / ~3B activos | Hasta 256K | ~5,32 | ~71,05 GB (16 BPW) | Apache-2.0 | safetensors en HuggingFace |
| IQ2_S comunitaria genérica | No disponible | No disponible | > 5,85 | ~12,2 GB (2,56 BPW) | No disponible | No disponible |
| Qwen3.6-35B-A3B-APEX-MTP (mudler) | No disponible | No disponible | No disponible | 20,7 GB | No disponible | GGUF en ModelScope |

Existen otras builds APEX del mismo modelo base publicadas por terceros (por ejemplo, la variante heretic de SC117), pero la información disponible no incluye sus especificaciones ni métricas comparables.

## Limitaciones y advertencias

- Pérdida de calidad medible: el propio autor reporta un aumento del 3,84 % en la perplejidad de WikiText-2 frente al BF16, con una desviación de ±0,12916. En tareas de razonamiento de cadena larga o de código, esa pérdida puede manifestarse de forma no lineal.
- Compresión agresiva en partes del modelo: aunque los enrutadores quedan en F32 y la cabeza de salida en Q6_K, los expertos centrales se comprimen con IQ2_S e IQ2_XXS, los más agresivos del estándar llama.cpp.
- Los datos de calidad y rendimiento proceden del autor de la cuantización, no de una evaluación independiente. La evaluación independiente mencionada en los resultados de búsqueda (investigador zephel01 en una RTX 5090 con llama.cpp CUDA b11027 y FlashAttention) corresponde a APEX-I-MiniPlus, no a esta release NanoPlus.
- Adopción muy limitada en el momento del registro: 0 descargas y 1 like, lo que implica ausencia de validación comunitaria y de reportes de fallos.
- Riesgo de alucinación: inherente al modelo base, agravado por la cuantización y no cuantificado en la información disponible. No hay evaluaciones de veracidad, sesgo o toxicidad.
- Cobertura multilingüe no medida: aunque se declaran 13 idiomas, no existe ninguna evaluación por idioma; el comportamiento real en español, árabe o tailandés es desconocido.
- Contexto largo declarado pero no evaluado: el soporte de 256K tokens se afirma por capacidad del modelo base y de la VRAM disponible, sin datos de degradación de calidad en ventanas muy largas sobre esta cuantización.
- Soporte de tool calling, function calling y uso agéntico no documentado: si el pipeline depende de estas capacidades, deben validarse antes de llevarlo a producción.
- Licencia: Apache-2.0, que permite uso comercial, pero conviene verificar los términos del modelo base Qwen/Qwen3.6-35B-A3B y cualquier condición adicional del repositorio.
- Dependencia del runtime: el uso de las ventajas declaradas (streaming en RAM sin bloqueos AVX2, MTP, gestión de contexto) depende de la versión de llama.cpp y de la configuración de flags; el autor no especifica una versión mínima en el fragmento disponible.
- Formato de pesos no estándar en el ecosistema: la nomenclatura APEX-I-NanoPlus es propia del autor y puede dificultar comparaciones directas con cuantizaciones estándar como Q4_K_M o IQ3_XXS puras.

## Enlaces

- Repositorio del modelo: https://huggingface.co/IsValorum/Qwen3.6-35B-A3B-MTP-APEX-I-NanoPlus-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Colección APEX-I-NanoPlus del autor: https://huggingface.co/collections/IsValorum/apex-i-nanoplus-6ab41467c988a1b1cb9b83bc
- Release previa del mismo autor (APEX-I-MiniPlus V2.1): https://huggingface.co/IsValorum/Qwen3.6-35B-A3B-MTP-APEX-I-MiniPlus-V2.1-Abliterated-GGUF
- Variante APEX de terceros sobre el mismo base (SC117): https://huggingface.co/SC117/Qwen3.6-35B-A3B-uncensored-heretic-Native-MTP-Preserved-APEX-GGUF
- Ficha en local-ai-zone: https://local-ai-zone.github.io/models/qwen3-6-35b-a3b-apex-mtp.html
- Mirror en ModelScope (mudler): https://www.modelscope.cn/models/mudler/Qwen3.6-35B-A3B-APEX-MTP-GGUF
- Artículo sobre MTP y decodificación especulativa: https://dasroot.net/posts/2026/05/qwen-36-35b-a3b-80-tok-s-12gb-vram-mtp-speculative-decoding/
