# kabcnd/Huihui-Qwen3.8-27B-Abliterated-Hybrid-GGUF

## Resumen

Huihui-Qwen3.8-27B-Abliterated-Hybrid-GGUF es una cuantización híbrida de precisión ultrabaja del modelo huihui-ai/Huihui-Qwen3.8-27B-abliterated, una variante "abliterated" (con los mecanismos de rechazo suprimidos) de la familia Qwen. El trabajo lo firma el usuario kabcnd y está orientado específicamente a Apple Silicon, en concreto a un Mac mini con memoria unificada y GPU Metal. El objetivo declarado es conseguir que un modelo de aproximadamente 27.000 millones de parámetros quepa de forma íntegra en unos 6,43 GiB de memoria de trabajo, manteniendo una perplejidad prácticamente idéntica a la del modelo original en FP16.

La propuesta técnica combina dos esquemas de cuantización: los bloques sensibles se promueven a Q4_1 y el resto de pesos se comprimen con PTQ1_0 (ternario, ~1,75 bits de media), apoyándose en tablas de búsqueda calibradas (codebooks). Además, se acompaña de un modelo borrador DFlash2 para decodificación especulativa, con el que el autor reporta 20,87 tokens por segundo en su hardware de referencia.

Es relevante ahora porque demuestra que es viable ejecutar un modelo de casi 27B con calidad cercana a FP16 en equipos de consumo con memoria unificada, un escenario tradicionalmente reservado a GPUs de datacenter. La licencia Apache 2.0 y el formato GGUF facilitan su integración en llama.cpp y en entornos de inferencia local.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (heredada del modelo base Qwen; detalles internos no disponibles) |
| Parámetros totales | 26.895.998.464 (~26,9B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens (configurado en el ejemplo de llama-server con `-c 32768`) |
| Tipos de cuantización | Híbrida PTQ1_0 (ternaria, ~1,75 bits) + CoreQ4_1 en bloques sensibles; borrador DFlash2 en Q2_K |
| Idiomas soportados | inglés, chino, ruso |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base es un transformer de aproximadamente 26,9B parámetros de la familia Qwen, sobre el que se ha aplicado una técnica de "abliteration" para eliminar los comportamientos de rechazo. Sobre esa base, el autor de esta ficha aplica una cuantización post-entrenamiento (PTQ) híbrida: los pesos pasivos se comprimen a formato ternario PTQ1_0 con tablas de búsqueda calibradas (codebooks), mientras que los bloques considerados sensibles —proyecciones de salida de atención y bloques intermedios críticos— se mantienen en Q4_1. El resultado es un paquete de 6,43 GiB con una precisión media de 1,75 bits por peso.

El proceso evolucionó en tres iteraciones según la model card: una primera PTQ1_0 pura (6,2 GiB) que perdía matices en las proyecciones de salida; una híbrida LUT + codebooks (6,86 GiB) que recuperó perplejidad hasta 3,9214; y la versión actual con splicing CoreQ4_1 (6,43 GiB) que alcanza una perplejidad de 3,6742, en paridad con el FP16 original (3,65). Se acompaña de un modelo borrador DFlash2 afinado para decodificación especulativa asíncrona. No se dispone de información sobre el dataset de entrenamiento original ni sobre si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base Qwen.
- Razonamiento y respuesta a instrucciones en inglés, chino y ruso.
- Comportamiento "uncensored"/abliterated: se han suprimido los mecanismos de rechazo del modelo original.
- Decodificación especulativa mediante el modelo borrador DFlash2, que acelera la generación en Metal.
- Compatible con llama.cpp y llama-server, incluido el modo servidor con API HTTP local.
- Soporte de cuantización ternaria con codebooks calibrados para preservar calidad en memoria reducida.
- Capacidades de tool calling, agentes o visión: no disponibles en la información proporcionada.

## Casos de uso

- Inferencia local en Apple Silicon: el paquete de 6,43 GiB permite ejecutar un modelo de ~27B íntegramente en memoria unificada de un Mac mini, sin desbordar a swap ni sufrir OOM, usando llama-server con Metal.
- Asistentes conversacionales privados: al correr en local y con licencia Apache 2.0, es adecuado para desplegar un chatbot multi-turno con contexto de hasta 32.768 tokens sin enviar datos a terceros.
- Investigación sobre cuantización extrema: sirve como referencia reproducible para estudiar el impacto de esquemas ternarios con codebooks y splicing selectivo en Q4_1 sobre la perplejidad.
- Generación de texto en ruso, chino e inglés: útil para prototipos multilingües en entornos con recursos limitados donde no se dispone de GPU dedicada.
- Pruebas de decodificación especulativa: el par modelo principal + borrador DFlash2 permite evaluar el rendimiento de speculative decoding en Metal y compararlo con decodificación estándar.
- Desarrollo de aplicaciones "uncensored" controladas: en entornos de investigación donde se necesita un modelo sin rechazos para estudiar sesgos, seguridad o generación de contenido sensible bajo supervisión.
- Servidor de inferencia ligero: integrable en pipelines locales de generación de texto vía llama-server en el puerto 11434, con API compatible con endpoints HTTP.

## Benchmarks y rendimiento

Datos reportados por el autor en la model card:

| Métrica | FP16 original | Híbrido v1 | Champion (CoreQ4_1) |
|---|---|---|---|
| Tamaño del paquete | ~54,0 GiB | 6,86 GiB | 6,43 GiB |
| Precisión media | 16,0 bpw | 1,85 bpw | 1,75 bpw |
| Perplejidad (PPL) | 3,65 | 3,9214 | 3,6742 ± 0,3901 |
| Velocidad especulativa (DFlash2) | N/A | 14,2 t/s | 20,87 tokens/s |
| Working set en GPU Metal | >54 GB (OOM) | 7,1 GB | 6,43 GiB (100% residente) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: unos 6,43 GiB para el modelo principal; hay que sumar el borrador DFlash2 (Q2_K) y el contexto de 32.768 tokens, por lo que conviene reservar 8-10 GiB de memoria unificada.
- Hardware de referencia del autor: Mac mini con memoria unificada de 16 GB y GPU Metal.
- Cabe en GPUs de consumo: sí, en tarjetas con 8 GB o más de VRAM (RTX 3060 Ti, RTX 4060, RTX 4070) y en equipos Apple Silicon con 16 GB o más de memoria unificada.
- GPUs de datacenter (A100, H100): compatibles pero sobredimensionadas para este paquete; el modelo está optimizado para Metal.
- Despliegue: llama.cpp / llama-server con `-ngl 99`; el modo especulativo requiere `--spec-type draft-dflash --spec-draft-n-max 3 --spec-draft-n-min 1`. Compatibilidad con vLLM, TGI u Ollama: no disponible en la información proporcionada.
- Rendimiento: 20,87 tokens/s con decodificación especulativa DFlash2 en el hardware de referencia del autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Huihui-Qwen3.8-27B-Abliterated-Hybrid-GGUF | ~26,9B | 32.768 | GGUF híbrido 1,75 bpw | Apache 2.0 | PPL 3,6742; 20,87 t/s en Metal |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated (base) | ~26,9B | no disponible | safetensors FP16 | Apache 2.0 | Modelo de referencia sin cuantizar; ~54 GiB |
| Híbrido v1 del mismo autor | ~26,9B | no disponible | GGUF híbrido 1,85 bpw | Apache 2.0 | PPL 3,9214; 14,2 t/s |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- Modelo "abliterated": se han eliminado los mecanismos de rechazo, por lo que puede generar contenido dañino, ofensivo o inexacto sin filtros. No apto para producción orientada al usuario final sin moderación adicional.
- Riesgo de alucinación: inherente al modelo base y potencialmente agravado por la cuantización extrema a 1,75 bpw.
- La perplejidad reportada (3,6742 ± 0,3901) procede de una única medición del autor; no hay validación independiente ni benchmarks de tareas.
- Idiomas limitados a inglés, chino y ruso; el rendimiento en castellano no está documentado y probablemente sea deficiente.
- La cuantización híbrida con codebooks calibrados es específica de este paquete; cambios de contexto o de plantilla pueden alterar la calidad.
- El rendimiento de 20,87 t/s está medido en un Mac mini concreto con decodificación especulativa; sin el borrador DFlash2 la velocidad será notablemente inferior.
- Aunque la licencia es Apache 2.0, el uso comercial de un modelo sin filtros de seguridad requiere evaluación legal y de reputación propia.
- La fecha de creación del repositorio (2026) y el hardware de referencia (Mac mini M6) no han podido verificarse de forma independiente.

## Enlaces

- Hugging Face: https://huggingface.co/kabcnd/Huihui-Qwen3.8-27B-Abliterated-Hybrid-GGUF
- Modelo base: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Ko-fi del autor: https://ko-fi.com/kabcpc
- llama.cpp (repositorio de referencia para GGUF): no disponible en la información proporcionada
- Paper o blog técnico del autor: no disponible en la información proporcionada
