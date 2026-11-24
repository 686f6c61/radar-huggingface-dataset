# Archivist15/Swift-1.5-Qwen3.8-27B-heretic-GSQ-RCO-noMTP-GGUF

## Resumen

Swift-1.5-Qwen3.8-27B-heretic-GSQ-RCO-noMTP-GGUF es una cuantización GGUF publicada por Archivist15 que deriva de la versión "abliterated" (sin rechazos) del modelo Swift 1.5, un ajuste fino de Qwen3.8-27B realizado por UkisAI. La cadena de derivación es relevante para entender qué se está descargando: Qwen3.8-27B (base de Qwen, Apache 2.0) → Swift 1.5 (ajuste de UkisAI) → variante "heretic" con abliteration y cuantización GSQ-RCO de jegreene → esta versión de Archivist15, que elimina la cabeza de predicción multi-token (MTP) para ahorrar VRAM.

El modelo cuenta con 26.895.998.464 parámetros (aproximadamente 26,9 mil millones) y se distribuye exclusivamente en formato GGUF, pensado para inferencia local con llama.cpp y derivados. La modificación respecto al repositorio de jegreene es quirúrgica: se elimina la capa MTP (blk.64) y sus metadatos, manteniendo el resto de pesos bit a bit idénticos. El objetivo declarado es liberar memoria para contexto en escenarios donde no se emplea decodificación especulativa MTP.

La relevancia de esta ficha es doble: por un lado, documenta una variante de un modelo de ~27B con contexto presumiblemente largo (familia Qwen3.8), y por otro, ilustra un caso habitual en el ecosistema open source: cadenas de derivación de tres o cuatro saltos donde la licencia original (Apache 2.0) queda superada por una licencia propia (Swift Open License 1.0) cuyas condiciones conviene revisar antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen3.8-27B), con cabeza MTP eliminada en esta variante |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: IQ3_S-noMTP (~11,8 GB), IQ3_XXS-noMTP (~10,1 GB); cuantizaciones intermedias GSQ-RCO heredadas del repo base |
| Idiomas soportados | no disponible |
| Licencia | Swift Open License 1.0 (modelo base Qwen3.8-27B bajo Apache 2.0) |
| Formato de pesos | GGUF (safetensors solo como referencia de parámetros del modelo original) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.8-27B, un transformer denso de aproximadamente 27B parámetros. Sobre esa base, UkisAI produjo Swift 1.5 mediante ajuste fino, y posteriormente jegreene aplicó una técnica de abliteration (eliminación de direcciones de rechazo en el espacio de activaciones) que da lugar a la variante "heretic", orientada a reducir las negativas del modelo ante peticiones que el modelo original rechazaría. La cuantización GSQ-RCO se realizó con imatrix, según las etiquetas del repositorio.

La innovación técnica concreta de esta ficha es la eliminación de la cabeza MTP (multi-token prediction), que en el modelo original ocupa la capa blk.64 y permite decodificación especulativa prediciendo varios tokens por paso. Al retirarla, se ahorran aproximadamente 350 MB por archivo respecto a las cuantizaciones originales, a costa de perder esa capacidad de aceleración. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO en la cadena de ajuste.

## Capacidades

- Generación de texto conversacional multi-turno, con etiqueta "conversational" en el repositorio.
- Razonamiento y matemáticas: capacidades heredadas de la familia Qwen3.8-27B, si bien no se documentan evaluaciones específicas en esta variante.
- Generación de código: presumible por la base Qwen, sin datos de benchmark publicados en la información disponible.
- Modo "sin rechazos" (abliterated): el modelo tiende a no declinar peticiones que el original rechazaría, lo que amplía el rango de respuestas pero incrementa el riesgo de contenido inapropiado.
- Compatibilidad con endpoints: la etiqueta "endpoints_compatible" sugiere despliegue en infraestructura de inferencia estándar (TGI, vLLM con soporte GGUF o llama.cpp server).
- Sin decodificación especulativa MTP en esta variante (cabeza eliminada).
- Soporte de tool calling, agentes o visión: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en estaciones de trabajo con GPU de 24 GB: las cuantizaciones IQ3_XXS (~10,1 GB) e IQ3_S (~11,8 GB) permiten cargar el modelo completo en una RTX 4090 o RTX 3090, dejando VRAM libre para contexto y caché KV, que es precisamente el objetivo declarado de eliminar la cabeza MTP.
- Despliegue en servidores con múltiples usuarios concurrentes: al reducir el peso del modelo, se puede aumentar el tamaño de la caché KV para atender más sesiones simultáneas en una misma GPU, algo útil en servicios de chat internos.
- Investigación sobre alineación y abliteration: la variante "heretic" permite estudiar empíricamente cómo cambia el comportamiento del modelo al eliminar direcciones de rechazo, comparándola con el Qwen3.8-27B original.
- Generación de texto creativo y role-play: los modelos abliterated se emplean habitualmente en escritura de ficción sin restricciones temáticas, donde el modelo original tiende a rechazar escenas violentas o adultas.
- Prototipado de asistentes conversacionales: con llama.cpp u Ollama se puede levantar un servidor compatible con la API de OpenAI en minutos para validar flujos de producto antes de pasar a un modelo mayor.
- Evaluación comparativa de cuantizaciones: al existir versiones con y sin MTP del mismo modelo, sirve para medir el impacto de la decodificación especulativa en latencia y throughput sobre el mismo hardware.
- Fine-tuning ligero o destilación: el GGUF no es el formato ideal para entrenar, pero el repo base en safetensors permite partir de los pesos y aplicar LoRA sobre la variante heretic.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni métricas de latencia o throughput. Tampoco se documentan comparaciones con el modelo original Qwen3.8-27B ni con la variante con MTP.

## Requisitos de hardware

- VRAM estimada para inferencia: ~10,1 GB para IQ3_XXS y ~11,8 GB para IQ3_S, solo pesos. Hay que sumar la caché KV, cuyo tamaño depende del contexto configurado y de si se usa cuantización de caché (Q8_0, Q4_0).
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 (24 GB) para las cuantizaciones IQ3 con contexto amplio; A100 40/80 GB y H100 para despliegues con muchas sesiones concurrentes o contexto máximo.
- Cabe en GPU de consumo: sí, en tarjetas de 12-16 GB con IQ3_XXS y contexto moderado; en 24 GB con margen holgado para contexto largo.
- Opciones de despliegue: llama.cpp (llama-server), Ollama, LM Studio, KoboldCpp; vLLM y TGI solo con soporte GGUF y sin la optimización MTP.
- Latencia y throughput: no disponibles. Al carecer de cabeza MTP, no se puede usar decodificación especulativa nativa, lo que reduce el throughput frente a la variante con MTP en el mismo hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (no-MTP, IQ3) | ~26,9B | no disponible | GGUF | Swift Open License 1.0 | Abliterated, sin MTP, ~10-12 GB |
| jegreene/Swift-1.5-Qwen3.8-27B-heretic-GSQ-RCO-GGUF | ~26,9B | no disponible | GGUF | Swift Open License 1.0 | Versión con MTP, ~350 MB más por archivo |
| ukisai/Swift-1.5-Qwen3.8-27b | ~26,9B | no disponible | safetensors (presumible) | no disponible | Ajuste fino original de Swift 1.5 |
| Qwen/Qwen3.8-27B | ~26,9B | no disponible | safetensors | Apache 2.0 | Modelo base sin abliteration |

## Limitaciones y advertencias

- La abliteration elimina los mecanismos de rechazo, por lo que el modelo puede generar contenido dañino, ilegal o sexualmente explícito. No es adecuado para aplicaciones orientadas al público sin filtros adicionales.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad factual para esta variante; la eliminación de capas de rechazo puede correlacionar con menor calibración.
- Idiomas soportados no documentados; se desconoce el rendimiento en castellano más allá de lo heredado de Qwen3.8.
- Licencia: la Swift Open License 1.0 sustituye a la Apache 2.0 del modelo base. Es imprescindible leer el archivo LICENSE y el NOTICE antes de un uso comercial; el repositorio advierte que no es un lanzamiento oficial de UkisAI.
- Cadena de derivación larga (Qwen → UkisAI → jegreene → Archivist15): cada salto añade incertidumbre sobre la procedencia exacta de los pesos y las condiciones de uso.
- Sin cabeza MTP: no se puede aprovechar la decodificación especulativa, lo que penaliza el throughput en producción frente a la variante original.
- Solo se ofrecen cuantizaciones de 3 bits (IQ3_S, IQ3_XXS): la pérdida de calidad respecto a los pesos originales es notable y no se ha medido.
- Modelo con muy poca tracción (45 descargas, 1 like) y sin pipeline declarado: no hay validación comunitaria de su calidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Archivist15/Swift-1.5-Qwen3.8-27B-heretic-GSQ-RCO-noMTP-GGUF
- Repo base (jegreene): https://huggingface.co/jegreene/Swift-1.5-Qwen3.8-27B-heretic-GSQ-RCO-GGUF
- Swift 1.5 (UkisAI): https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
