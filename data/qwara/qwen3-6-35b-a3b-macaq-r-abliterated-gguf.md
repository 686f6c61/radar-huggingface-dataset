# Qwara/Qwen3.6-35B-A3B-MACaQ-R-abliterated-GGUF

## Resumen

Qwen3.6-35B-A3B-MACaQ-R-abliterated-GGUF es una cuantización GGUF de la familia Qwen3.6-35B-A3B, un modelo de lenguaje de arquitectura MoE (mezcla de expertos) desarrollado originalmente por el equipo Qwen. Esta versión concreta, publicada por el usuario Qwara, aplica una "abliteración" (eliminación de la dirección de rechazo en los pesos) sobre el GGUF MACaQ-R de Huawei CSL, manteniendo la cuantización original sin recuantizar. El resultado es un modelo de 34.660.610.688 parámetros totales (aproximadamente 34,7 mil millones) con licencia Apache-2.0, orientado a generación de texto y ejecutable en llama.cpp.

El modelo parte de Qwen/Qwen3.6-35B-A3B y aplica una transformación de rango 1 sobre los tensores que escriben en el flujo residual, de modo que se elimina la componente de rechazo aprendida durante el alineamiento. Es relevante porque demuestra una técnica de edición de pesos directamente sobre cuantizaciones GGUF refinadas (MACaQ), preservando casi el 97% de los códigos cuantizados originales y sin necesidad de recuantizar. Está pensado para investigación y uso local privado, no para despliegues públicos.

La model card advierte explícitamente de que no se han realizado evaluaciones de comportamiento (perplejidad, divergencia KL ni benchmarks de rechazo), solo comprobaciones estructurales y numéricas. El archivo GGUF ocupa 22,36 GB y mantiene la misma tabla de tensores, metadatos y tipos que el MACaQ-R original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer (arch `qwen35moe`); incluye capas SSM (`ssm_out`) y atención (`attn_output`) |
| Parametros totales | 34.660.610.688 (34,7 B) |
| Parametros activos | no disponible (A3B sugiere ~3 B activos, dato no confirmado en la información) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_XL (archivo único); internamente Q8_0, Q5_K y Q6_K por tensor |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (22.360.455.968 bytes) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer MoE con capas híbridas: la model card menciona tensores `attn_output` (10), `ssm_out` (30), `ffn_down_shexp` (40), `ffn_down_exps` (40), además de router y expertos gate/up. Esto indica una combinación de atención y módulos de estado (SSM) junto con mezcla de expertos. El modelo base es Qwen/Qwen3.6-35B-A3B, del que no se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

La innovación de esta ficha no está en el entrenamiento sino en la edición post-hoc: la abliteración se implementa como una proyección de rango 1 `W ← W − r rᵀW` con una única dirección `r` compartida por las 40 capas (el 99,8% de la diferencia BF16 respecto al modelo original reside en esa dirección). Solo se modifican los 120 tensores que escriben en el flujo residual. Para los 80 tensores Q8_0 (`attn_output`, `ssm_out`, `ffn_down_shexp`) se copian byte a byte desde el GGUF Q8_0 de mradermacher, ya que son idénticos al Q8_0 estándar de llama.cpp. Para los 40 tensores `ffn_down_exps` (Q5_K en 36 capas, Q6_K en las capas 1, 34, 38 y 39) se deserializan los pesos, se aplica la proyección y se recodifican solo los códigos enteros, manteniendo todas las escalas, mínimos y subescalas de MACaQ. Se usa un redondeo al vecino más cercano seguido de un paso voraz por columna que ajusta códigos ±1 hasta que `rᵀW ≈ 0`. El resultado: 120 tensores modificados, 613 idénticos y 0 inesperados.

## Capacidades

- Generación de texto conversacional en formato de chat (pipeline `text-generation`, tag `conversational`).
- Razonamiento y generación de código heredados del modelo base Qwen3.6-35B-A3B (no verificados en esta variante).
- Capacidades multilingües del modelo base (idiomas no especificados en la información disponible).
- Ejecución en llama.cpp estándar (cualquier versión que soporte el GGUF MACaQ-R original, arquitectura `qwen35moe`).
- Compatible con endpoints (tag `endpoints_compatible`).
- Modelo "uncensored": se ha eliminado la dirección de rechazo, por lo que no aplica filtros de contenido aprendidos.
- Solo texto; sin capa MTP (igual que el archivo base).

## Casos de uso

- Investigación sobre alineamiento y seguridad: permite estudiar cómo se distribuye la dirección de rechazo en un MoE cuantizado y medir el efecto de la abliteración sobre tensores concretos, gracias a la verificación estructural documentada (componente de rechazo residual medio del 0,23% en expertos).
- Experimentación local en hardware de consumo: con 22,36 GB en Q4_K_XL, puede ejecutarse en GPUs con 24 GB de VRAM (RTX 3090/4090) usando llama.cpp, lo que facilita pruebas de concepto sin infraestructura de datacenter.
- Estudio de técnicas de edición de pesos sobre GGUF: el método de trasplante de tensores y recodificación restringida sirve como referencia para investigar cuantización consciente de ediciones (el 8,53% de códigos modificados en `ffn_down_exps`).
- Generación de texto creativo sin restricciones en entornos privados: para investigación de estilos, narrativa o datos sintéticos donde se quiere evitar el sesgo de rechazo del modelo alineado.
- Evaluación comparativa de cuantizaciones: al conservar metadatos y tabla de tensores idénticos al MACaQ-R, permite comparar directamente el efecto de la abliteración frente al original sin confundir con diferencias de cuantización.
- Pruebas de robustez y red-teaming controlado: útil para analizar qué tipos de contenido genera un modelo sin guardarraíles, siempre en entornos aislados y con supervisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han ejecutado pruebas de perplejidad, divergencia KL ni benchmarks de tasa de rechazo; solo se han realizado comprobaciones estructurales y numéricas (integridad de metadatos, tabla de tensores, hashes blake2b por tensor y medida de la componente de rechazo residual).

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo GGUF ocupa 22,36 GB; se recomienda al menos 24 GB de VRAM para cargarlo completo en GPU en Q4_K_XL.
- GPU recomendadas: RTX 3090 o RTX 4090 (24 GB) para carga completa; A100 40/80 GB o H100 para mayor margen y throughput.
- Cabe en GPU de consumo: sí, en tarjetas de 24 GB (RTX 3090, 4090) con llama.cpp; en GPUs de 16 GB requeriría descarga parcial a CPU/RAM.
- Opciones de despliegue: llama.cpp (soporte nativo para arquitectura `qwen35moe`); compatible con endpoints. No se menciona soporte explícito de vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Qwara/Qwen3.6-35B-A3B-MACaQ-R-abliterated-GGUF | 34,7 B | no disponible | Q4_K_XL GGUF | Apache-2.0 | Abliterado, sin recuantizar, sin evaluación de comportamiento |
| huawei-csl/Qwen3.6-35B-A3B-MACaQ-R-GGUF | 34,7 B | no disponible | Q4_K_XL GGUF (MACaQ) | Apache-2.0 | Base de esta ficha; mantiene rechazo alineado |
| huihui-ai/Huihui-Qwen3.6-35B-A3B-abliterated | 34,7 B | no disponible | BF16 / Q8_0 | Apache-2.0 | Fuente de la abliteración; pesos completos |
| Qwen/Qwen3.6-35B-A3B | 34,7 B | no disponible | BF16 | Apache-2.0 | Modelo original del equipo Qwen |

## Limitaciones y advertencias

- Modelo sin guardarraíles: la abliteración elimina el comportamiento de rechazo, por lo que puede generar contenido dañino, falso, ofensivo o ilegal. Uso previsto solo para investigación y uso local privado.
- No evaluado conductualmente: no hay mediciones de perplejidad, divergencia KL ni tasa de rechazo; solo verificación estructural.
- Riesgo de alucinación: inherente al modelo base y no mitigado; la edición de pesos no corrige la veracidad factual.
- Sesgos: no documentados en la información disponible; se heredan los del modelo base Qwen3.6-35B-A3B.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no están especificados.
- Restricciones de licencia: Apache-2.0 permite uso comercial según la licencia, pero la model card restringe explícitamente el despliegue en productos públicos y el acceso a menores; el usuario asume toda la responsabilidad legal.
- Solo texto y sin capa MTP: no soporta visión, audio ni decodificación especulativa por MTP.
- Dependencia de llama.cpp: requiere una versión que soporte la arquitectura `qwen35moe` y el formato MACaQ-R original.

## Enlaces

- Hugging Face: https://huggingface.co/Qwara/Qwen3.6-35B-A3B-MACaQ-R-abliterated-GGUF
- Modelo base Qwen: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- GGUF MACaQ-R de Huawei CSL: https://huggingface.co/huawei-csl/Qwen3.6-35B-A3B-MACaQ-R-GGUF
- Repositorio MACaQ: https://github.com/huawei-csl/MACaQ
- Pesos abliterados de huihui-ai: https://huggingface.co/huihui-ai/Huihui-Qwen3.6-35B-A3B-abliterated
- GGUF de mradermacher: https://huggingface.co/mradermacher/Huihui-Qwen3.6-35B-A3B-abliterated-GGUF
- Idea de trasplante de tensores (SC117): https://huggingface.co/SC117/Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF
- Licencia: https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/main/LICENSE
