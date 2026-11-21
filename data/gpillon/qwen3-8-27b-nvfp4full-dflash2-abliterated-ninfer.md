# gpillon/Qwen3.8-27B-nvfp4full-dflash2-abliterated-NInfer

## Resumen

Este repositorio contiene una cuantización NVFP4 del modelo Qwen3.8-27B en su variante "abliterated" (sin mecanismos de rechazo), empaquetada en el formato propietario `.ninfer` para el motor de inferencia ignis desarrollado por el propio autor (gpillon). No se trata de un checkpoint de Transformers, Safetensors ni GGUF: es un artefacto monolítico de 18,07 GiB con 1.325 objetos internos, pensado para ejecutarse en GPUs Blackwell (RTX 5090) con decodificación especulativa DFlash2.

El modelo base es `huihui-ai/Huihui-Qwen3.8-27B-abliterated`, una versión del Qwen3.8-27B de Alibaba a la que se le ha eliminado la dirección de rechazo mediante abliteración. El autor del repositorio ha re-encoding únicamente las 70 matrices que la abliteración modificó (de 1.199 tensores totales), manteniendo el resto byte a byte idéntico a la imagen vanilla `gpillon/Qwen3.8-27B-nvfp4full-dflash2-NInfer`.

La relevancia de esta ficha es doble: por un lado documenta un caso concreto de cuantización W4A4 (4 bits pesos y activaciones) sobre arquitectura híbrida con atención lineal, y por otro ilustra el ecosistema de formatos propietarios que está surgiendo alrededor de GPUs consumer de nueva generación, con implicaciones importantes para portabilidad y reproducibilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: capas GDN (atención lineal) y capas GQA (atención completa), con torre de visión y capa MTP (multi-token prediction) |
| Parametros totales | 27B (heredado del modelo base Qwen3.8-27B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (W4A4), formato propietario `.ninfer`; no hay GGUF ni otras variantes en este repo |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | `.ninfer` (contenedor propietario de ignis, no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.8-27B: un transformer híbrido que alterna capas con atención lineal (GDN, *Gated Delta Network*) y capas con atención completa GQA (*Grouped Query Attention*). Según la model card, las capas 17–51 contienen tanto `linear_attn.out_proj` (26 matrices GDN) como `self_attn.o_proj` (9 matrices GQA), además de 35 `mlp.down_proj`. Incorpora una torre de visión (el pipeline es `image-text-to-text`) y una capa MTP, lo que sugiere capacidades multimodales y decodificación especulativa nativa.

El proceso de cuantización parte de los pesos BF16 del checkpoint abliterated de huihui-ai y aplica el recipe `NVFP4_MAXABS_DIVISOR_RNE_V1` para las matrices de salida de atención y GDN, y un encoder local para las `mlp.down_proj` (ya que no existe una versión unsloth de los pesos abliterados). El autor reporta un error relativo de Frobenius de 0,0946–0,0951 en la reconstrucción de los 70 objetos reemplazados, y un error inferior al de unsloth (0,095 frente a 0,105–0,111) en las matrices vanilla. La abliteración en sí es de rango 1: cada delta de peso supone un 1,8–2,2 % de la norma relativa de la matriz, con el 99,2–99,5 % de la energía concentrada en la primera componente singular. No se dispone de información sobre el dataset de entrenamiento original ni sobre el proceso de RLHF/DPO del Qwen3.8-27B.

## Capacidades

- Generación de texto y conversación multi-turno (pipeline `conversational`).
- Procesamiento de imagen y texto combinados (`image-text-to-text`), gracias a la torre de visión heredada.
- Razonamiento y matemáticas: capacidades heredadas del Qwen3.8-27B base, aunque no se documentan métricas específicas en esta ficha.
- Generación de código: presumible por el modelo base, sin datos concretos en la información disponible.
- Decodificación especulativa mediante el drafter DFlash2 incluido en el contenedor (104 registros NVFP4 en el sidecar, 34 de ellos del drafter).
- Capa MTP (*multi-token prediction*) presente en el artefacto, orientada a acelerar la generación.
- Sin mecanismos de rechazo: el modelo sigue instrucciones dañinas si se le presentan, por diseño de la abliteración.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no documentadas explícitamente, aunque el autor publica una guía para agentes de IA en el repositorio de ignis.

## Casos de uso

- Investigación sobre abliteración y alineación: el modelo permite estudiar empíricamente cómo la eliminación de la dirección de rechazo (rank-1, 70 matrices) afecta al comportamiento en tareas sensibles, comparándolo con la imagen vanilla del mismo contenedor.
- Evaluación de cuantización NVFP4 en GPUs Blackwell: sirve para medir la degradación de calidad de W4A4 frente a BF16 en un modelo de 27B con arquitectura híbrida, usando el error de Frobenius reportado (0,095) como referencia.
- Pruebas de decodificación especulativa con DFlash2: el drafter incluido permite medir la aceleración en RTX 5090 con `ignis-server --spec dflash2`, un escenario relevante para optimización de latencia en inferencia local.
- Benchmarking de formatos propietarios: útil para comparar el rendimiento y la portabilidad del formato `.ninfer` frente a GGUF o safetensors en el mismo hardware.
- Generación de contenido sin restricciones en entornos controlados: aplicaciones de escritura creativa o role-play donde el equipo asume la responsabilidad de los guardrails a nivel de aplicación, nunca expuestas a usuarios no confiables.
- Desarrollo y depuración del motor ignis: el repositorio incluye checks de integridad (SHA-256, sidecar `.graft.json`, verificación en carga) que lo convierten en un caso de prueba para el pipeline de validación de artefactos del motor.
- Docencia sobre linaje de modelos: la model card documenta trazabilidad completa (revisión del checkpoint huihui, SHA-256 de la imagen template, tensores idénticos byte a byte), lo que lo hace útil como ejemplo de reproducibilidad en cuantización selectiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card solo reporta métricas internas de fidelidad de la cuantización: error relativo de Frobenius de 0,0946–0,0951 en los 70 objetos reemplazados, y comparación con el encoder de unsloth (0,095 frente a 0,105–0,111) sobre matrices vanilla. También menciona un *smoke test* en RTX 5090 con `ignis-server --spec dflash2`, pero el texto proporcionado se corta antes de ofrecer cifras de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: el artefacto pesa 18,07 GiB, por lo que se necesita al menos esa cantidad de VRAM más overhead de activaciones y KV cache. Una RTX 5090 (32 GB) es el hardware de referencia según la model card.
- GPU recomendadas: RTX 5090 (Blackwell, soporte nativo de NVFP4). No se documenta compatibilidad con A100, H100 ni generaciones anteriores; NVFP4 es un formato de 4 bits con escalas de bloque pensado para Blackwell.
- ¿Cabe en consumer GPU? Sí, en RTX 5090 (32 GB). En GPUs de 24 GB (RTX 4090, 3090) no cabe el artefacto completo y además faltaría soporte de NVFP4 a nivel de hardware.
- Opciones de despliegue: exclusivamente `ignis-server` (motor propio del autor, repositorio `gpillon/ignis`). No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que el formato `.ninfer` no es estándar.
- Latencia y throughput: no disponibles en el texto proporcionado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Hardware | Notas |
|---|---|---|---|---|---|---|
| gpillon/Qwen3.8-27B-nvfp4full-dflash2-abliterated-NInfer | 27B | no disponible | `.ninfer` NVFP4 | apache-2.0 | RTX 5090 (Blackwell) | Abliterado, solo ignis |
| gpillon/Qwen3.8-27B-nvfp4full-dflash2-NInfer | 27B | no disponible | `.ninfer` NVFP4 | apache-2.0 | RTX 5090 | Imagen vanilla, mismo contenedor |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated | 27B | no disponible | BF16 (Transformers) | no disponible | GPU con suficiente VRAM | Modelo base abliterado, más portable |
| Qwen/Qwen3.8-27B | 27B | no disponible | BF16 (Transformers) | no disponible | GPU con suficiente VRAM | Modelo original alineado |

La comparativa relevante no es tanto de rendimiento (no hay benchmarks) como de portabilidad y propósito: el modelo original Qwen3.8-27B y su variante abliterated en BF16 pueden ejecutarse en múltiples motores (vLLM, TGI, llama.cpp con conversión), mientras que esta versión NVFP4 queda atada al motor ignis y a hardware Blackwell.

## Limitaciones y advertencias

- **Sin mecanismos de rechazo**: la abliteración elimina la dirección de rechazo, por lo que el modelo seguirá instrucciones dañinas. El autor advierte explícitamente que los guardrails deben implementarse en la capa de aplicación o herramienta, y que no debe exponerse directamente a usuarios no confiables.
- **Formato no estándar**: el artefacto `.ninfer` no es compatible con Transformers, safetensors, GGUF, vLLM, llama.cpp, Ollama ni TGI. Solo funciona con `ignis-server`.
- **Dependencia de hardware**: NVFP4 (W4A4) requiere soporte de GPU Blackwell; no hay camino documentado para A100, H100 ni RTX 40xx.
- **Riesgo de alucinación**: no cuantificado en la información disponible; como todo LLM de 27B, es susceptible a alucinaciones, y la cuantización a 4 bits puede amplificarlo.
- **Idiomas**: no se documenta la lista de idiomas soportados en esta ficha; el modelo base Qwen3.8-27B tiene cobertura multilingüe, pero no se confirma aquí.
- **Licencia**: apache-2.0 en este repositorio, pero conviene verificar la licencia del modelo base Qwen3.8-27B y del checkpoint huihui-ai, ya que la cadena de linaje puede imponer restricciones adicionales para uso comercial.
- **Reproducibilidad parcial**: 1.255 de los 1.325 objetos son idénticos a la imagen vanilla, pero los 70 restantes se re-encodificaron con un encoder local en lugar del de unsloth, lo que introduce una fuente de variación respecto a una cuantización "oficial".
- **Verificación manual necesaria**: el autor proporciona SHA-256 y un sidecar `.graft.json`; se recomienda verificar la integridad antes de usar el modelo en producción.
- **Fecha de creación futura**: el repositorio figura creado el 2026-09-24, lo que puede indicar metadatos inconsistentes o un modelo de fecha adelantada; conviene contrastar con el repositorio de ignis antes de confiar en la trazabilidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/gpillon/Qwen3.8-27B-nvfp4full-dflash2-abliterated-NInfer
- Imagen vanilla de referencia: https://huggingface.co/gpillon/Qwen3.8-27B-nvfp4full-dflash2-NInfer
- Modelo base abliterated: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-27B
- Cuantización NVFP4 de referencia: https://huggingface.co/unsloth/Qwen3.8-27B-NVFP4
- Contenedor NInfer previo: https://huggingface.co/cometkim/Qwen3.8-27B-nvfp4full-NInfer
- Motor ignis: https://github.com/gpillon/ignis
- Guía para agentes de IA: https://raw.githubusercontent.com/gpillon/ignis/main/docs/user/paths/agent.md
- Índice de documentación en Markdown: https://gpillon.github.io/ignis/llms.txt
