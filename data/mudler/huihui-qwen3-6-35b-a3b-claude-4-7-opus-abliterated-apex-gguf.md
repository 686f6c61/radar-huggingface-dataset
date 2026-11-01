# mudler/Huihui-Qwen3.6-35B-A3B-Claude-4.7-Opus-abliterated-APEX-GGUF

## Resumen

Esta ficha cubre `mudler/Huihui-Qwen3.6-35B-A3B-Claude-4.7-Opus-abliterated-APEX-GGUF`, un conjunto de cuantizaciones GGUF en formato APEX (Adaptive Precision for EXpert Models) publicadas por el equipo de LocalAI sobre el modelo `huihui-ai/Huihui-Qwen3.6-35B-A3B-Claude-4.7-Opus-abliterated`. El modelo subyacente es un fine-tune "abliterated" (con el comportamiento de rechazo eliminado) de un destilado de razonamiento con estilo Claude 4.7 Opus sobre Qwen3.6-35B-A3B, un transformer de tipo Mixture-of-Experts con unos 35.505 millones de parámetros totales y aproximadamente 3.000 millones activos por token.

La relevancia de esta publicación no está en el modelo en sí, sino en la estrategia de cuantización: APEX clasifica los tensores por rol (expertos enrutados, experto compartido, atención) y aplica un gradiente de precisión por capas, comprimiendo más agresivamente los expertos de las capas intermedias y manteniendo mayor precisión en las capas de borde, la atención y el experto compartido. El resultado son ficheros de entre 13,87 GB y 25,89 GB que permiten ejecutar un MoE de 35B en hardware de consumo, algo imposible con los pesos en bf16 (unos 71 GB).

El autor advierte explícitamente de que se trata de una **preview no evaluada**: no se han ejecutado benchmarks, y la única verificación fue cargar cada fichero y generar un texto corto con llama.cpp. La licencia es Apache-2.0, heredada del modelo base Qwen3.6-35B-A3B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) con atención híbrida (atención completa cada 4 capas, atención lineal en el resto) y torre de visión integrada |
| Parametros totales | 35.505.251.456 (~35,5B) |
| Parametros activos | ~3B por token (8 de 256 expertos enrutados + experto compartido) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF APEX en cuatro perfiles: I-Balanced, Balanced, I-Quality, Quality, I-Compact, Compact, I-Mini (las variantes "I-" usan imatrix con dataset diverso v1.3) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (más `mmproj.gguf` de 0,90 GB para visión) |

Tamaños de los ficheros publicados:

| Fichero | Perfil | Tamano | Uso recomendado |
|---|---|---|---|
| APEX-I-Balanced.gguf | I-Balanced | 25,89 GB | Propósito general, imatrix |
| APEX-Balanced.gguf | Balanced | 25,89 GB | Propósito general |
| APEX-I-Quality.gguf | I-Quality | 23,51 GB | Máxima calidad, imatrix |
| APEX-Quality.gguf | Quality | 23,51 GB | Máxima calidad |
| APEX-I-Compact.gguf | I-Compact | 17,09 GB | GPUs de consumo, imatrix |
| APEX-Compact.gguf | Compact | 17,09 GB | GPUs de consumo |
| APEX-I-Mini.gguf | I-Mini | 13,87 GB | Nivel más pequeño, solo imatrix |
| mmproj.gguf | Proyector de visión | 0,90 GB | Necesario para comprensión de imágenes |

## Arquitectura y entrenamiento

El modelo base es Qwen3.6-35B-A3B, un transformer MoE de 40 capas con 256 expertos enrutados más un experto compartido, de los cuales se activan 8 por token. La atención es híbrida: una capa de atención completa cada 4 capas y atención lineal en el resto, lo que reduce el coste de contexto largo. Incluye una torre de visión integrada que se activa mediante el proyector `mmproj.gguf`. Sobre esta base, huihui-ai aplicó un destilado de razonamiento con estilo Claude 4.7 Opus y posteriormente una "abliteración", es decir, la eliminación del comportamiento de rechazo del modelo.

El checkpoint original arrastra tensores de predicción multi-token no utilizados (`blk.40.nextn.*`), que se conservan en los GGUF aunque llama.cpp no los emplea. La innovación técnica de esta publicación es la cuantización APEX: en un MoE los tensores FFN de los expertos concentran la mayor parte del peso, pero solo se activan 8 de 256 por token; APEX comprime más los expertos de capas intermedias y preserva mayor precisión en capas de borde, atención, SSM y experto compartido. Las variantes con prefijo "I-" usan una matriz de importancia (imatrix) calculada sobre un dataset diverso v1.3 que incluye chat, código, razonamiento, tool calling, trazas agénticas y Wikipedia. No se dispone de información sobre el número de tokens de entrenamiento del modelo base ni sobre si hubo RLHF o DPO.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento explícito, heredado del destilado de estilo Claude 4.7 Opus.
- Comprensión de imágenes mediante la torre de visión y el fichero `mmproj.gguf` (invocable con `llama-mtmd-cli`).
- Generación de código, según la composición del dataset de calibración (código, tool calling, trazas agénticas).
- Soporte de tool calling y function calling, inferido del dataset de calibración y de la etiqueta `endpoints_compatible`.
- Capacidades agénticas y de razonamiento multi-paso, también inferidas de la calibración con trazas agénticas.
- Multilingüismo: no disponible (la model card no detalla idiomas).
- Comportamiento sin rechazo (abliterated): responde a peticiones que el modelo base declinaría.

## Casos de uso

- **Despliegue local en estación de trabajo con GPU de consumo**: con el perfil I-Compact (17,09 GB) o I-Mini (13,87 GB) el modelo cabe en GPUs de 24 GB o 16 GB respectivamente, permitiendo un asistente conversacional privado sin depender de APIs externas.
- **Asistente de código en IDE**: el modelo se integra vía llama.cpp o LocalAI y puede generar y explicar código; el dataset de calibración incluye código, lo que favorece la calidad en ese dominio en las variantes "I-".
- **Automatización agéntica con tool calling**: la etiqueta `endpoints_compatible` y la calibración con trazas agénticas lo hacen apto para pipelines donde el modelo decide qué herramienta invocar en cada paso.
- **Análisis de imágenes en local**: combinando el GGUF con `mmproj.gguf` se pueden procesar capturas, diagramas o documentos escaneados sin salir del equipo, útil en entornos con requisitos de confidencialidad.
- **Investigación sobre alineación y seguridad**: al ser una variante abliterated, sirve para estudiar cómo se comporta un modelo sin capa de rechazo, comparar respuestas frente al base y evaluar mecanismos de moderación externos.
- **Prototipado rápido con LocalAI**: el comando `local-ai run` descarga y sirve el modelo con una sola línea, adecuado para validar ideas antes de invertir en infraestructura.
- **Procesamiento por lotes de documentos con contexto largo**: la atención híbrida (lineal en la mayoría de capas) reduce el coste computacional en secuencias largas, aunque la longitud de contexto no está publicada y debe verificarse empíricamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que se trata de una "unevaluated preview" y que la única comprobación realizada fue cargar cada fichero y generar un texto breve con llama.cpp.

## Requisitos de hardware

- **VRAM estimada para inferencia** (aproximada, según tamaño del fichero más overhead de contexto y caché KV):
  - I-Mini (13,87 GB): ~16 GB de VRAM.
  - Compact / I-Compact (17,09 GB): ~20-24 GB de VRAM.
  - Quality / I-Quality (23,51 GB): ~28-32 GB de VRAM.
  - Balanced / I-Balanced (25,89 GB): ~32-40 GB de VRAM.
- **GPU recomendadas**: RTX 4090 (24 GB) para Compact; RTX 5090 o A6000 (32-48 GB) para Quality; A100 40/80 GB, H100 o H200 para Balanced y para servir varias instancias. El autor menciona una NVIDIA DGX Spark (122 GB de memoria unificada) como su hardware local.
- **¿Cabe en GPU de consumo?** Sí: las variantes Compact e I-Compact caben en 24 GB, y la I-Mini en 16 GB. Las variantes Balanced requieren GPU profesional o reparto entre varias GPUs.
- **Opciones de despliegue**: llama.cpp (imprescindible una versión reciente con soporte `qwen35moe`), `llama-cli`, `llama-mtmd-cli` para visión, y LocalAI (`local-ai run`). No se menciona soporte de vLLM, TGI u Ollama en la información disponible.
- **Latencia y throughput**: no disponibles. Al activar solo ~3B parámetros por token, el throughput debería ser notablemente superior al de un modelo denso de 35B, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Este modelo (APEX GGUF) | ~35,5B | ~3B | no disponible | Apache-2.0 | GGUF | Preview sin evaluar; abliterated; visión integrada |
| Qwen3.6-35B-A3B (base) | ~35,5B | ~3B | no disponible | Apache-2.0 | safetensors | Modelo original de Qwen, con rechazo intacto |
| Huihui-Qwen3.6-35B-A3B-Claude-4.7-Opus-abliterated | ~35,5B | ~3B | no disponible | Apache-2.0 | safetensors | Fine-tune abliterated sin cuantizar; requiere ~71 GB en bf16 |
| Otras cuantizaciones GGUF del mismo base (p. ej. Q4_K_M estándar) | ~35,5B | ~3B | no disponible | Apache-2.0 | GGUF | Precisión uniforme por tipo de tensor, sin gradiente por capas |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- **Sin evaluar**: no hay benchmarks; la calidad real de cada perfil APEX es desconocida y podría degradarse de forma no uniforme respecto al modelo original.
- **Modelo abliterated**: se ha eliminado el comportamiento de rechazo, por lo que generará contenido que el modelo base declinaría. El autor traslada toda la responsabilidad de uso al usuario. No es apto para aplicaciones orientadas al público sin una capa de moderación externa.
- **Riesgo de alucinación**: inherente a los modelos de lenguaje; sin evaluación no puede acotarse su magnitud en esta variante.
- **Contexto e idiomas no documentados**: la longitud de contexto y la cobertura idiomática no figuran en la model card y deben validarse empíricamente antes de usarlos en producción.
- **Requisito de versión de llama.cpp**: necesita una compilación reciente con soporte `qwen35moe`; versiones antiguas no cargarán el modelo.
- **Tensores residuales**: los tensores `blk.40.nextn.*` de predicción multi-token se conservan en el GGUF pero no se usan, lo que infla ligeramente el tamaño del fichero.
- **Licencia**: Apache-2.0 permite uso comercial, pero exige conservar la licencia y la atribución al redistribuir. El uso derivado de la abliteración puede tener implicaciones legales según la jurisdicción.
- **Estado del repositorio**: 0 descargas y 0 likes en el momento de la consulta; es una publicación reciente y sin validación comunitaria.

## Enlaces

- [HuggingFace: mudler/Huihui-Qwen3.6-35B-A3B-Claude-4.7-Opus-abliterated-APEX-GGUF](https://huggingface.co/mudler/Huihui-Qwen3.6-35B-A3B-Claude-4.7-Opus-abliterated-APEX-GGUF)
- [Modelo base: huihui-ai/Huihui-Qwen3.6-35B-A3B-Claude-4.7-Opus-abliterated](https://huggingface.co/huihui-ai/Huihui-Qwen3.6-35B-A3B-Claude-4.7-Opus-abliterated)
- [Proyecto APEX (apex-quant)](https://github.com/mudler/apex-quant)
- [Informe técnico APEX (PDF)](https://github.com/mudler/apex-quant/blob/main/paper/APEX_Technical_Report.pdf)
- [LocalAI](https://github.com/mudler/LocalAI)
- [llama.cpp](https://github.com/ggml-org/llama.cpp)
- [Organización Qwen en HuggingFace](https://huggingface.co/Qwen)
- [huihui-ai en HuggingFace](https://huggingface.co/huihui-ai)
