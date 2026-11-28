# mudler/Inkling-2-Mini-Uncensored-APEX-GGUF

## Resumen

Inkling-2-Mini-Uncensored-APEX-GGUF es una colección de cuantizaciones GGUF del modelo OpenUncensored/Inkling-2-Mini-Uncensored, una variante "abliterated" (sin mecanismos de rechazo) del modelo thinkingmachines/Inkling-2-Mini. El trabajo de cuantización lo firma mudler, autor del proyecto LocalAI, dentro de su iniciativa APEX (Adaptive Precision for EXpert Models), orientada a comprimir modelos de arquitectura Mixture-of-Experts (MoE) preservando calidad mediante asignación de precisión por rol de tensor y posición de capa.

El modelo subyacente es un MoE de aproximadamente 26.070 millones de parámetros totales, con pesos originales en BF16 y una versión fuente de unos 19,5 GB en formatos float de 4 y 8 bits. La colección incluye ocho ficheros GGUF organizados en cuatro niveles de calidad (Quality, Balanced, Compact, Mini, Nano) con y sin importance matrix (imatrix), además de un proyector de visión en F16 y un drafter de decodificación especulativa DSpark.

La relevancia actual de esta ficha es doble: por un lado, ofrece una vía práctica de ejecutar un MoE de 26B en hardware de consumo mediante cuantización k-quant con imatrix; por otro, ilustra el ecosistema de derivados "uncensored" y su problemática asociada (ausencia de evaluación, riesgos de contenido y trazabilidad de licencias). El autor advierte explícitamente que se trata de una "unevaluated preview": los ficheros se comprobaron solo para cargar y generar texto coherente, sin ejecutar perplexity, KL ni benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) transformer; derivado de thinkingmachines/Inkling-2-Mini |
| Parametros totales | 26.070.385.152 (~26,07B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF k-quant en cuatro tiers: Quality (20,07 GB), Balanced (20,68 GB), Compact (14,10 GB), Mini (12,36 GB), Nano (11,34 GB); versiones con y sin imatrix; drafter en Q8_0; proyector de visión en F16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La arquitectura es un transformer con capas Mixture-of-Experts, según indican las etiquetas del repositorio y la propia metodología APEX, que distingue entre expertos enrutados (la mayor parte de los pesos, pero con activación dispersa por token) y el resto de tensores. El modelo base es una versión abliterated de thinkingmachines/Inkling-2-Mini, es decir, un ajuste que elimina o atenúa la dirección de rechazo del modelo original. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO en el modelo base.

La innovación técnica principal de esta entrega es el esquema de cuantización APEX: en lugar de aplicar una precisión uniforme, asigna bits por rol de tensor y posición de capa, aprovechando que los expertos enrutados toleran menor precisión porque solo unos pocos se activan por token. Las variantes con prefijo `I-` incorporan una importance matrix calculada sobre los propios pesos BF16 de este modelo (no reutilizada del base) a partir de datos de calibración diversos: chat, código, razonamiento, tool-calling, trazas agénticas y Wikipedia. El fichero `imatrix.gguf` pesa 90.752.032 bytes. Además, se incluye un drafter de decodificación especulativa DSpark en Q8_0 (503.890.240 bytes) para `--spec-type draft-dspark` en llama.cpp b12720 o superior, y un proyector de visión F16 (639.348.992 bytes) convertido con `convert_hf_to_gguf.py --mmproj`.

## Capacidades

- Generación de texto conversacional multi-turno, según la etiqueta `conversational` del repositorio.
- Razonamiento y generación de código, inferidos de los datos de calibración usados para la imatrix (chat, code, reasoning, tool-calling, agentic traces).
- Tool calling y function calling: la imatrix incluye trazas específicas de tool-calling y agentic traces, lo que sugiere soporte en el modelo base.
- Capacidad de visión: se distribuye un proyector multimodal F16 (`mmproj-Inkling-2-Mini-Uncensored-F16.gguf`), lo que habilita entrada de imágenes en llama.cpp.
- Decodificación especulativa: soporte de drafter DSpark para acelerar la generación en llama.cpp.
- Modo "uncensored": el ajuste abliterated elimina los mecanismos de rechazo del modelo original; el autor no ha evaluado el comportamiento de rechazo resultante.
- Capacidades multilingües: no disponible.

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU de consumo: el tier Compact (14,10 GB) o Mini (12,36 GB) permite ejecutar un MoE de 26B en GPUs con 16-24 GB de VRAM mediante llama.cpp u Ollama, algo inviable con los pesos BF16 originales.
- Asistente conversacional autoalojado sin filtros de contenido: útil en entornos de investigación donde se necesita estudiar el comportamiento del modelo sin capas de rechazo, por ejemplo para análisis de sesgos o de dinámicas de seguridad.
- Generación de código en pipelines internos: la imatrix calibrada con código y trazas agénticas favorece este uso; puede integrarse en herramientas de autocompletado o revisión con llama.cpp como backend.
- Automatización agéntica con tool calling: el modelo puede orquestar llamadas a funciones en flujos multi-paso, aprovechando el drafter DSpark para reducir latencia en producción.
- Procesamiento de documentos con imágenes: gracias al proyector de visión F16, puede emplearse para extracción de información de capturas, diagramas o formularios escaneados en local.
- Experimentación con cuantización MoE: los distintos tiers (Quality, Balanced, Compact, Mini, Nano) permiten comparar el impacto de la precisión en la calidad de salida, útil para investigadores que estudian técnicas de compresión.
- Fine-tuning o evaluación de derivados abliterated: al estar en Apache 2.0, sirve como base para estudiar la transferibilidad de la abliteración entre cuantizaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que se trata de una "unevaluated preview" y que no se han ejecutado pruebas de perplexity, KL divergence ni benchmarks de calidad.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 11,34 GB (tier Nano, solo imatrix) y 20,68 GB (tier Balanced con imatrix), según el fichero elegido.
- Tier Nano (11,34 GB): apto para GPUs de 12 GB como RTX 3060 12 GB o RTX 4070.
- Tier Mini (12,36 GB) y Compact (14,10 GB): aptos para GPUs de 16 GB como RTX 4060 Ti 16 GB, RTX 4070 Ti Super o RTX 4080.
- Tiers Quality y Balanced (20,07-20,68 GB): requieren GPUs de 24 GB como RTX 3090, RTX 4090 o A10G; también pueden ejecutarse en A100 40 GB o H100 con holgura.
- El autor menciona que su hardware local es una NVIDIA DGX Spark con 122 GB de memoria unificada, suficiente para MoEs de 30-50B; los modelos mayores requieren cómputo alquilado en H100/H200/Blackwell.
- Opciones de despliegue: llama.cpp (versión b12720 o superior para el drafter DSpark), Ollama, y presumiblemente cualquier runtime compatible con GGUF; el repositorio incluye la etiqueta `endpoints_compatible` y está vinculado al equipo de LocalAI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-Uncensored-APEX-GGUF | ~26,07B (MoE) | no disponible | Apache 2.0 | GGUF | Cuantización APEX con imatrix y visión |
| thinkingmachines/Inkling-2-Mini | no disponible | no disponible | no disponible | safetensors | Modelo original sin abliterar |
| OpenUncensored/Inkling-2-Mini-Uncensored | ~26,07B | no disponible | Apache 2.0 | safetensors (BF16, ~19,5 GB en 4/8 bits) | Versión abliterated del anterior |
| mudler/Inkling-2-Mini-APEX-GGUF | ~26,07B (MoE) | no disponible | Apache 2.0 | GGUF | Cuantización APEX del modelo original sin abliterar |

## Limitaciones y advertencias

- Modelo sin evaluar: el autor declara que no se han ejecutado perplexity, KL ni benchmarks; no hay garantía sobre calidad o comportamiento.
- Comportamiento de rechazo no probado: al ser una variante abliterated, se desconoce el grado real de supresión de rechazos y puede generar contenido sensible sin filtros.
- Riesgo de alucinación: inherente a los modelos de lenguaje; sin benchmarks no puede cuantificarse su magnitud relativa.
- Sesgos conocidos: no documentados en la información disponible; los derivados uncensored suelen amplificar sesgos al eliminar capas de alineación.
- Idiomas soportados no especificados: no hay lista oficial de idiomas, por lo que el rendimiento multilingüe es incierto.
- Longitud de contexto no disponible: no puede planificarse su uso en tareas de contexto largo sin verificación empírica.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías y la responsabilidad sobre el contenido generado recae en el desplegador.
- Los tiers Quality y Balanced no son más pequeños que el checkpoint fuente (~19,5 GB); se ofrecen por compatibilidad con k-quant, no por ahorro de espacio.
- El drafter DSpark fue entrenado contra el modelo upstream, no contra esta variante abliterated; su eficacia en la decodificación especulativa puede diferir.
- El fichero `dspark-Inkling-2-Mini-Q8_0_Old.gguf` solo es compatible con builds antiguos del fork de llama.cpp de Unsloth; no carga en llama.cpp mainline.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mudler/Inkling-2-Mini-Uncensored-APEX-GGUF
- Modelo base abliterated: https://huggingface.co/OpenUncensored/Inkling-2-Mini-Uncensored
- Modelo original: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Cuantización APEX del modelo original: https://huggingface.co/mudler/Inkling-2-Mini-APEX-GGUF
- Cuantizaciones de referencia de Unsloth: https://huggingface.co/unsloth/Inkling-2-Mini-GGUF
- Proyecto APEX: https://github.com/localai-org/apex-quant
- LocalAI: https://github.com/mudler/LocalAI
- Patreon del autor: https://www.patreon.com/cw/mudler
- Buy Me a Coffee del autor: https://www.buymeacoffee.com/mudler
- GitHub Sponsors del autor: https://github.com/sponsors/mudler
