# AI-SecurityAgent/GLM-5.3-UNCENSORED-FP8

## Resumen

GLM-5.3-UNCENSORED-FP8 es un espejo (re-upload) del repositorio dealignai/GLM-5.3-UNCENSORED-FP8, publicado por el usuario AI-SecurityAgent en Hugging Face. Se trata de una variante del modelo GLM-5.3 en formato FP8 y con comportamiento de rechazo reducido (uncensored), derivada a su vez de la familia GLM de Zhipu AI / Z.ai. El repositorio no aporta pesos nuevos ni modificaciones: los ficheros son idénticos al modelo base original y todo el crédito corresponde a sus autores.

La relevancia de esta ficha es limitada por la escasez de información verificable. La model card es mínima (apenas indica que es un mirror y que mantiene la licencia del origen), no se declaran idiomas soportados, no hay pipeline asignado y no se publican resultados de benchmarks. El tag `glm_moe_dsa` sugiere una arquitectura de mezcla de expertos (MoE) con atención dispersa (DSA), pero no se confirman parámetros, contexto ni composición del entrenamiento.

El tamaño del repositorio es de 128 GB, coherente con un modelo grande cuantizado a FP8, aunque el número exacto de parámetros no está disponible en la información proporcionada. La licencia declarada es MIT, heredada del repositorio de origen.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | glm_moe_dsa (MoE con atención dispersa, según tag; no confirmado en detalle) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | FP8 (formato del repositorio); otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (FP8) |

## Arquitectura y entrenamiento

El tag `glm_moe_dsa` apunta a una arquitectura de mezcla de expertos (Mixture of Experts) con atención dispersa (Deep Sparse Attention o similar), característica de la familia GLM reciente. Sin embargo, la información proporcionada no detalla el número de expertos, la ratio de activación, la dimensión oculta ni la longitud de contexto nativa. El repositorio es una cuantización FP8 del modelo base dealignai/GLM-5.3-UNCENSORED-FP8, que a su vez parte de un GLM-5.3 ajustado para reducir el comportamiento de rechazo.

No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF, DPO u otro ajuste por preferencias. Tampoco se documentan innovaciones técnicas específicas (decodificación especulativa, atención lineal, etc.) más allá de lo que implica el propio tag de arquitectura. Cualquier afirmación adicional sobre el entrenamiento sería especulativa y no debe asumirse.

## Capacidades

- Generación de texto y razonamiento general, heredadas del modelo GLM-5.3 subyacente (no verificadas en esta ficha).
- Comportamiento de rechazo reducido (uncensored): el modelo está ajustado para disminuir las negativas a responder, lo que amplía el rango de peticiones que atiende.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; no se declaran idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Investigación en seguridad de IA: el modelo permite estudiar el comportamiento de sistemas con rechazo reducido en entornos controlados, comparando respuestas frente a la variante alineada del mismo GLM.
- Evaluación de robustez y red teaming: útil para probar filtros, clasificadores de contenido y políticas de moderación frente a un modelo menos restrictivo.
- Despliegue en infraestructura propia con FP8: el formato FP8 reduce el espacio en disco y memoria frente a BF16, lo que facilita servir el modelo en clústeres con GPU de última generación.
- Experimentación con arquitecturas MoE: investigadores que estudian enrutamiento de expertos y atención dispersa pueden usar los pesos como referencia, siempre que confirmen la arquitectura real.
- Generación de texto sin restricciones temáticas en entornos de investigación lingüística, donde se necesita estudiar la distribución del modelo sin sesgo de rechazo.
- Réplica y verificación de resultados: al ser un mirror con ficheros idénticos, sirve para reproducir experimentos publicados sobre el modelo de origen y comprobar la integridad de los pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el repositorio ocupa 128 GB en FP8, por lo que la inferencia requiere al menos esa cantidad de memoria distribuida entre GPU y, posiblemente, CPU/RAM.
- GPU recomendadas: no disponible en la información proporcionada; por el volumen de pesos, se necesitarían múltiples aceleradores de gama alta (por ejemplo, varias A100/H100 de 80 GB), aunque esto es una estimación y no un dato confirmado.
- ¿Cabe en GPU de consumo? No es probable con los datos disponibles; un modelo de este tamaño en FP8 excede la VRAM de cualquier GPU de consumo individual.
- Opciones de despliegue: no se documentan en el repositorio; FP8 suele requerir frameworks con soporte específico (vLLM, TGI con kernels FP8), pero no está confirmado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| GLM-5.3-UNCENSORED-FP8 (este mirror) | no disponible | no disponible | MIT | Hugging Face |
| dealignai/GLM-5.3-UNCENSORED-FP8 (origen) | no disponible | no disponible | MIT | Hugging Face |
| GLM-5.3 (variante alineada de Zhipu AI) | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para comparar parámetros, contexto ni rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo uncensored: el rechazo reducido implica mayor probabilidad de generar contenido dañino, ilegal o inseguro; requiere salvaguardas externas en producción.
- Riesgo de alucinación: no cuantificado en la información disponible; como todo modelo generativo, puede producir afirmaciones falsas con apariencia de veracidad.
- Idiomas y contexto: no declarados, por lo que no se puede garantizar cobertura multilingüe ni ventanas largas.
- Licencia MIT: permite uso comercial según el texto de la licencia, pero conviene revisar el fichero LICENSE incluido y las condiciones del modelo de origen, ya que el mirror hereda la licencia del repositorio fuente.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin pipeline asignado ni documentación técnica; no hay garantía de mantenimiento ni de integridad más allá de lo que declara el autor.
- Sin benchmarks ni evaluación publicada: no se puede validar su calidad frente a otras variantes.
- El tag de arquitectura no sustituye a una especificación oficial; verificar la configuración real antes de desplegar.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/AI-SecurityAgent/GLM-5.3-UNCENSORED-FP8
- Modelo base (origen): https://huggingface.co/dealignai/GLM-5.3-UNCENSORED-FP8
