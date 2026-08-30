# marfrit/Qwen3.8-27B-MTP-OpenVINO

## Resumen

El repositorio `marfrit/Qwen3.8-27B-MTP-OpenVINO` no contiene el modelo completo Qwen3.8-27B, sino la reconstrucción de su cabeza de predicción multi-token (MTP, *multi-token prediction*) en formato OpenVINO IR. Esta cabeza es un componente auxiliar diseñado para acelerar la inferencia mediante decodificación especulativa en hardware Intel Arc. El autor, marfrit, la reconstruye a partir de los tensores `mtp.*` del checkpoint original de Qwen, porque la herramienta de exportación `optimum-intel` descarta el grafo MTP al convertir el modelo a OpenVINO.

El repositorio incluye dos grafos IR: la capa transformer MTP (`openvino_mtp_layer`, 849 MB en f16) y la cabeza de lenguaje con la que se decodifica el draft (`openvino_mtp_lm_head`, 1.27 GB en f16). El modelo base, Qwen3.8-27B, es un modelo denso de 27.000 millones de parámetros con arquitectura híbrida de atención (48 de 64 capas con atención lineal), visión integrada y una ventana de contexto nativa de 262.000 tokens, extensible a 1M. Este repositorio es relevante porque permite habilitar la decodificación especulativa en despliegues OpenVINO, donde antes no era posible al perderse el grafo MTP durante la exportación.

La model card también documenta una reconstrucción equivalente para el modelo MoE Qwen3.6-35B-A3B, aunque el foco de esta ficha es la versión para Qwen3.8-27B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Capa transformer MTP (f16) + cabeza LM (f16) en OpenVINO IR |
| Parametros totales | No disponible (el modelo base Qwen3.8-27B tiene 27B; este repo solo contiene la cabeza MTP) |
| Parametros activos | No disponible |
| Longitud de contexto | No especificada en el repo (el modelo base soporta 262K nativo, extensible a 1M) |
| Tipos de cuantizacion | f16 (capa y lm_head); se menciona una variante int8 del lm_head para el modelo MoE |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | OpenVINO IR (`.xml` + `.bin`) |

## Arquitectura y entrenamiento

Este repositorio no es un modelo entrenado de forma independiente, sino una extracción de los componentes MTP ya entrenados dentro de Qwen3.8-27B. El modelo base, desarrollado por Alibaba, es un transformer denso de 27B parámetros con atención híbrida: de sus 64 capas, solo 16 usan atención completa (intervalo `full_attention_interval: 4`), mientras que las 48 restantes emplean atención lineal. Incluye además una torre de visión y una cabeza MTP integrada que predice varios tokens por paso.

Los tensores `mtp.*` del checkpoint original se reconstruyen mediante la herramienta `tools/export_mtp.py` del repositorio `arcint`. La reconstrucción genera dos grafos IR: la capa MTP (que contiene la MLP con 256 expertos en el caso del modelo MoE, y una MLP densa en el caso del modelo de 27B) y la cabeza LM utilizada para decodificar el token draft. La arquitectura resultante está pensada para funcionar con cualquier OpenVINO IR del modelo base que tenga hidden size 5120, vocabulario de 248320 y embeddings no atados.

## Capacidades

- Decodificación especulativa: la cabeza MTP genera tokens candidatos que el modelo principal verifica, acelerando la inferencia en hardware Intel Arc.
- Compatibilidad con cuerpos OpenVINO existentes: funciona con la exportación AWQ de arcint (`qwen38-b7c1-ov`) y con el IR público int4 de Intel (`OpenVINO/Qwen3.8-27B-int4-ov`).
- Verificación exacta: un token draft solo se acepta si coincide con lo que el sampler habría elegido, por lo que una cabeza incorrecta no altera el resultado, solo degrada la utilidad de la especulación.
- Integración con `arcint`: se sirve activando `--mtp on` y colocando los cuatro archivos junto a `openvino_language_model.xml`.
- No es un modelo autónomo: no genera texto por sí mismo; requiere el cuerpo principal del modelo base.

## Casos de uso

- Aceleración de inferencia en Intel Arc: al servir Qwen3.8-27B con arcint y activar MTP, se logran 37.7–38.1 tokens por segundo frente a 25.0 t/s sin especulación (medido en una GPU Arc B60). Adecuado para cargas de trabajo de generación de código y prosa donde la latencia es crítica.
- Complemento para el IR int4 público de Intel: si ya se dispone de `OpenVINO/Qwen3.8-27B-int4-ov` (que incluye `openvino_mtp_model` pero no la cabeza LM), este repositorio proporciona la pieza faltante para habilitar la especulación.
- Despliegue local en estaciones de trabajo con GPUs Intel Arc: permite ejecutar un modelo de 27B con decodificación especulativa sin depender de soluciones propietarias.
- Evaluación de la calidad de la cabeza MTP: la tasa de aceptación de drafts (93.2% con AWQ, 90.8% con int4 de Intel) sirve como métrica para validar que la reconstrucción es correcta antes de usarla en producción.
- Investigación sobre decodificación especulativa en OpenVINO: el repositorio sirve como referencia para otros desarrolladores que necesiten reconstruir cabezas MTP para otros modelos de la familia Qwen3.8.
- Integración en pipelines de inferencia con OpenVINO: al ser grafos IR estándar, se pueden cargar con la API de OpenVINO y combinar con el cuerpo principal en un servidor propio.

## Benchmarks y rendimiento

La model card reporta tasas de aceptación de drafts (decodificación greedy, GPU B60) y velocidades de decodificación:

| Configuracion | Aceptacion de drafts | Velocidad de decodificacion |
|---|---|---|
| arcint AWQ (`qwen38-b7c1-ov`) | 93.2% | No reportada |
| Intel int4 (`OpenVINO/Qwen3.8-27B-int4-ov`) | 90.8% (10/10 en tarea de aceptacion), 96.3% codigo / 77.3% prosa | No reportada |
| Intel int4 + lm_head de este repo (via arcint) | 93.9% codigo / 76.4% prosa | 37.7–38.1 t/s con MTP frente a 25.0 t/s sin MTP |

Para el modelo MoE Qwen3.6-35B-A3B (segunda parte de la model card), la aceptación fue 93.9% en código y 75.4% en prosa, pero la decodificación con MTP resultó más lenta (48–53 t/s frente a 71.5 t/s sin especulación) debido al coste de leer la MLP de 256 expertos en f16 y a la sobrecarga del bucle de servicio.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- GPU: Intel Arc (la medición se realizó en una Arc B60). No se especifican otras arquitecturas.
- VRAM: los dos archivos del repo suman 2.1 GB (849 MB + 1.27 GB). A esto hay que añadir el cuerpo principal del modelo (el IR int4 de Intel ocupa aproximadamente 14 GB, el AWQ algo más). En total, se necesitan al menos 16 GB de VRAM para el conjunto completo.
- Inferencia en GPU consumer: posible en tarjetas Arc con 16 GB o más (Arc A770, B60). No se menciona compatibilidad con NVIDIA o AMD.
- Opciones de despliegue: servidor `arcint` con `--mtp on`; también se puede cargar manualmente con la API de OpenVINO.
- Latencia y throughput: 37.7–38.1 t/s con MTP frente a 25.0 t/s sin MTP en Arc B60 (greedy, contexto corto según la model card).

## Comparativa con modelos similares

La alternativa directa es el IR oficial de Intel para Qwen3.8-27B:

| Caracteristica | marfrit/Qwen3.8-27B-MTP-OpenVINO | OpenVINO/Qwen3.8-27B-int4-ov |
|---|---|---|
| Contenido | Capa MTP + lm_head (f16) | Cuerpo completo int4 + capa MTP (sin lm_head) |
| Licencia | Apache-2.0 | Apache-2.0 (según base) |
| Formato | OpenVINO IR | OpenVINO IR |
| Aceptacion de drafts | 93.9% codigo / 76.4% prosa (con cuerpo int4) | No reportada (incluye su propia capa MTP) |
| Velocidad | 37.7–38.1 t/s con MTP | No reportada |

Otra alternativa es usar llama.cpp con los GGUF de unsloth, que incluyen los tensores `blk.*.nextn.*` y soporte de decodificación especulativa MTP desde el PR #22673 (julio 2026). Esta vía no requiere OpenVINO y funciona en GPUs NVIDIA/AMD, pero no está cubierta por este repositorio.

## Limitaciones y advertencias

- Este repositorio no es un modelo completo: requiere el cuerpo principal de Qwen3.8-27B en OpenVINO IR con hidden size 5120 y vocab 248320. Sin ese cuerpo, los archivos son inútiles.
- La salida especulativa no es bit-idéntica a la decodificación greedy sin especulación. La verificación es exacta (un token solo se acepta si coincide con el sampler), pero un pase de verificación de dos tokens difiere ligeramente en los logits de un pase de un token, lo que puede alterar decisiones cercanas. Medido: las respuestas divergen aproximadamente en un token por respuesta, en posiciones tardías. Para reproducibilidad bit-exacta, servir sin la cabeza.
- Riesgo de alucinación y sesgos: al ser un componente auxiliar, no introduce sesgos propios, pero hereda los del modelo base Qwen3.8-27B, que no se documentan en este repositorio.
- Rendimiento dependiente del hardware: en el modelo MoE documentado, la especulación resultó más lenta que la decodificación directa en Arc B60. En el modelo de 27B sí acelera, pero solo en la configuración medida.
- La licencia Apache-2.0 del repositorio sigue la del modelo base, permitiendo uso comercial, pero hay que verificar las restricciones del modelo base original (Apache-2.0 también, según los resultados de búsqueda).
- Solo se ha validado con dos cuerpos OpenVINO concretos; otros IR del mismo modelo pueden no ser compatibles (la tasa de aceptación caería a ~0%).

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/marfrit/Qwen3.8-27B-MTP-OpenVINO
- Repositorio del modelo base (GitHub): https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Guía sobre el MTP de Qwen3.8 (GitHub): https://github.com/sudoingX/qwen38-mtp
- Recetas vLLM para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Documentación vLLM Ascend para Qwen3.8-27B: https://docs.vllm.ai/projects/ascend/en/latest/tutorials/models/Qwen3.8-27B.html
- Guía local para Qwen3.8-27B (Substack): https://linas.substack.com/p/qwen3-8-27b-local-guide
