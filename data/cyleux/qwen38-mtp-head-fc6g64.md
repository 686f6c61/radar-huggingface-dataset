# Cyleux/qwen38-mtp-head-fc6g64

## Resumen

Este repositorio contiene una re-cuantización de precisión mixta de la cabeza de predicción multi-token (MTP head) del modelo `EigenLabs/Qwen3.8-27B-MTP-bf16`, un modelo de 27 mil millones de parámetros de la familia Qwen3.8. La cabeza MTP es un componente auxiliar que se utiliza en esquemas de decodificación especulativa: propone varios tokens candidatos por paso, y el modelo principal los verifica, lo que acelera la inferencia sin degradar la calidad final.

El autor, Cyleux, ha re-cuantizado la cabeza fijada (pinned) del modelo base con MLX 0.32.0, aplicando una cuantización affine de 6 bits al tensor `fc.weight` y de 4 bits a las otras siete proyecciones 2D, manteniendo las normas 1D en bf16. El resultado es un archivo de solo 0.3 GB (frente a los varios gigabytes del modelo completo), con 69.658.112 parámetros. La motivación principal es reducir la huella de memoria de la cabeza MTP en entornos de producción, recuperando aproximadamente la mitad de la tasa de aceptación de draft que se pierde con una cuantización uniforme de 4 bits, a cambio de solo 13,1 MB adicionales por paso de draft.

Este modelo no es autónomo: solo actúa como proponente en el bucle de decodificación especulativa, y el modelo base fijado verifica cada token emitido. Es relevante para equipos que despliegan Qwen3.8-27B con MTP en infraestructura con memoria limitada y necesitan un equilibrio entre compresión y calidad de propuesta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MTP head (cabeza de prediccion multi-token) para Qwen3.8-27B |
| Parametros totales | 69.658.112 (~70 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo base Qwen3.8-27B) |
| Tipos de cuantizacion | fc.weight: affine 6-bit group-64; otras 7 proyecciones 2D: affine 4-bit group-64; normas 1D: bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La cabeza MTP es un componente de red neuronal que se entrena junto con el modelo base para predecir múltiples tokens futuros de forma simultánea. En el esquema de decodificación especulativa, esta cabeza genera un draft de tokens que el modelo principal verifica en paralelo, reduciendo el número de pasos de inferencia secuenciales. El modelo base `EigenLabs/Qwen3.8-27B-MTP-bf16` es un transformer de 27B parámetros con una cabeza MTP añadida, y este repositorio contiene únicamente la cabeza re-cuantizada, no el modelo completo.

La re-cuantización se realizó con MLX 0.32.0 mediante `mx.quantize`, aplicando cuantización affine por grupos de 64 elementos. La elección de 6 bits para `fc.weight` (la proyección final de la cabeza) responde a mediciones por tensor que atribuyen a este peso la mayor parte de la pérdida de tasa de aceptación de draft cuando se usa cuantización uniforme de 4 bits. El resto de proyecciones 2D se mantienen en 4 bits, y las normas 1D en bf16 para preservar la estabilidad numérica. No se dispone de información sobre el entrenamiento original de la cabeza MTP (datos, número de tokens, método de alineación).

## Capacidades

- Proponer tokens candidatos en esquemas de decodificación especulativa para el modelo Qwen3.8-27B.
- Reducir la huella de memoria de la cabeza MTP en comparación con la versión bf16 original (0.3 GB frente a varios GB).
- Mantener aproximadamente la mitad de la tasa de aceptación de draft que se pierde con cuantización uniforme de 4 bits, gracias al uso de 6 bits en `fc.weight`.
- Integrarse con el modelo base fijado `EigenLabs/Qwen3.8-27B-MTP-bf16`, que verifica cada token propuesto.
- No es un modelo autónomo: no genera texto por sí mismo ni soporta tool calling, agentes o razonamiento multi-paso.

## Casos de uso

- Inferencia acelerada en producción con Qwen3.8-27B: el head MTP se usa como proponente en un bucle de decodificación especulativa, reduciendo la latencia por token en servidores de generación de texto.
- Despliegue en entornos con memoria limitada: al ocupar solo 0.3 GB, la cabeza cuantizada puede cargarse en GPUs de consumo o en nodos con VRAM ajustada, donde la versión bf16 no cabría junto al modelo base.
- Evaluación de esquemas de cuantización para MTP heads: el repositorio sirve como referencia para medir el impacto de la precisión de `fc.weight` en la tasa de aceptación de draft.
- Optimización de costes en inferencia serverless: al reducir la memoria necesaria para el componente auxiliar, se pueden ejecutar más réplicas del modelo en la misma infraestructura.
- Investigación en decodificación especulativa: permite experimentar con cabezas MTP cuantizadas en diferentes precisiones mixtas sin necesidad de reentrenar el modelo base.
- Integración en pipelines de MLX: al estar producido con MLX, se puede cargar directamente en entornos Apple Silicon o en stacks que usen este framework.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona mediciones internas de tasa de aceptación de draft (la cuantización 4-bit uniforme degrada la aceptación, y el 6-bit en `fc.weight` recupera aproximadamente la mitad de esa pérdida), pero no se proporcionan cifras concretas ni comparaciones con otros modelos.

## Requisitos de hardware

- El archivo de pesos ocupa 0.3 GB, por lo que la cabeza MTP cabe en cualquier GPU con al menos 1 GB de VRAM, incluyendo GPUs de consumo como RTX 3060 o superiores.
- Sin embargo, el modelo base Qwen3.8-27B requiere mucha más memoria: se necesitan al menos 16-20 GB de VRAM para una cuantización 4-bit del modelo completo, y más de 50 GB para bf16. En la práctica, el despliegue completo requiere GPUs de datacenter (A100, H100) o cuantización agresiva del modelo base.
- Opciones de despliegue: al ser un componente auxiliar, se integra en el bucle de decodificación del modelo base. Puede usarse con MLX (dado que se generó con ese framework), y potencialmente con vLLM u otros motores que soporten MTP, aunque no se especifica compatibilidad explícita.
- Latencia y throughput: no disponibles. El impacto en rendimiento depende del modelo base, del esquema de verificación y del hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Uso | Licencia |
|---|---|---|---|---|
| Cyleux/qwen38-mtp-head-fc6g64 | 70 M | Mixta 6-bit/4-bit/bf16 | MTP head para Qwen3.8-27B | Apache-2.0 |
| EigenLabs/Qwen3.8-27B-MTP-bf16 (head original) | 70 M (estimado) | bf16 | MTP head sin cuantizar | Apache-2.0 |
| Qwen3.8-27B (modelo base sin MTP) | 27 B | bf16 | Modelo completo | Apache-2.0 |

La comparativa directa con otras cabezas MTP cuantizadas no está disponible. La diferencia principal frente al head original es la reducción de memoria (0.3 GB frente a varios GB en bf16) a costa de una pérdida parcial en la tasa de aceptación de draft. Frente a no usar MTP, la ventaja es la aceleración de inferencia que proporciona la decodificación especulativa.

## Limitaciones y advertencias

- No es un modelo autónomo: solo funciona como proponente en un bucle de decodificación especulativa con el modelo base fijado `EigenLabs/Qwen3.8-27B-MTP-bf16`. No puede generar texto por sí mismo.
- La cuantización 4-bit de las proyecciones 2D degrada la tasa de aceptación de draft; el 6-bit en `fc.weight` solo recupera aproximadamente la mitad de esa pérdida. Para máxima calidad, debe usarse la versión bf16 original.
- No se dispone de información sobre sesgos, alucinaciones o limitaciones de idioma, ya que estos dependen del modelo base, no de la cabeza MTP.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que es un artefacto experimental sin validación comunitaria amplia.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base Qwen3.8-27B también debe cumplir su propia licencia (Apache-2.0 según los datos disponibles).
- No se especifica compatibilidad con motores de inferencia concretos (vLLM, TGI, llama.cpp). El uso con MLX está implícito por el método de generación, pero no se documenta un pipeline de integración.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Cyleux/qwen38-mtp-head-fc6g64
- Modelo base: https://huggingface.co/EigenLabs/Qwen3.8-27B-MTP-bf16
- Framework MLX: https://github.com/ml-explore/mlx
