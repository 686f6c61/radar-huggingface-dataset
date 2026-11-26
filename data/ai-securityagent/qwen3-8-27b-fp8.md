# AI-SecurityAgent/Qwen3.8-27B-FP8

## Resumen

Qwen3.8-27B-FP8 es una reproducción (mirror) sin modificaciones del modelo Qwen/Qwen3.8-27B-FP8, publicado por el usuario AI-SecurityAgent en Hugging Face. No se trata de un modelo nuevo ni de un ajuste fino: el autor indica explícitamente que los ficheros son idénticos a los del repositorio original y que todo el mérito corresponde a los autores originales. El repositorio actúa, por tanto, como una copia de conveniencia de un modelo de la familia Qwen en formato FP8.

El modelo cuenta con 27.781.427.952 parámetros almacenados en safetensors (aproximadamente 27,8 mil millones) y un tamaño de repositorio de 30,9 GB, coherente con un checkpoint cuantizado a FP8 de 8 bits. La arquitectura declarada en las etiquetas es `qwen3_5`, si bien la model card no aporta detalles sobre la estructura interna, los datos de entrenamiento ni el contexto máximo.

La relevancia de esta ficha es limitada desde el punto de vista técnico, ya que la información publicada por el autor del mirror es mínima y remite al repositorio original. Se desconoce si el repositorio original sigue disponible o ha sido retirado, lo que explicaría la existencia de este mirror. La licencia declarada es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen3_5` (etiqueta del repositorio; sin detalle en la model card) |
| Parametros totales | 27.781.427.952 (27,8 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (8 bits) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo. La etiqueta `qwen3_5` sugiere que pertenece a la familia Qwen 3.5 de Alibaba, pero no se especifica si se trata de un transformer denso, un modelo de mezcla de expertos (MoE) o una arquitectura híbrida. Tampoco se indica el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF, DPO u otras técnicas de alineación.

El único dato técnico verificable es la cuantización: el checkpoint está almacenado en FP8, un formato de 8 bits que reduce a la mitad el espacio ocupado respecto a BF16/FP16 (30,9 GB frente a los aproximadamente 55 GB que requeriría el mismo modelo en 16 bits). No se documenta el método de cuantización empleado (por ejemplo, per-tensor, per-channel o con escalas dinámicas) ni si se preservan capas en mayor precisión.

## Capacidades

- Generación de texto y razonamiento: capacidades esperables en un modelo de la familia Qwen, aunque no confirmadas en la información disponible.
- Generación de código y matemáticas: no confirmado en la documentación del repositorio.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (el campo de idiomas no está informado).
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Despliegue en infraestructura con memoria limitada: al estar cuantizado en FP8, el checkpoint de 30,9 GB permite servirse en GPUs de 40 GB (A100 40GB, L40S) donde la versión en BF16 no cabría con margen para el KV cache.
- Réplica de un endpoint existente: útil como espejo para pipelines que ya consumen el modelo original y necesitan una fuente alternativa de descarga.
- Evaluación comparativa de cuantizaciones: sirve para medir la pérdida de calidad de FP8 frente a BF16 en tareas concretas de razonamiento o código.
- Investigación en seguridad de modelos: el nombre del autor (AI-SecurityAgent) y la naturaleza de mirror sugieren su uso en entornos de análisis de modelos, aunque no hay documentación que lo confirme.
- Servido con vLLM o TGI: FP8 está soportado de forma nativa en vLLM para GPUs con compute capability 8.9 o superior, lo que facilita su integración en stacks de inferencia de alto rendimiento.
- Pruebas de integración en CI: al ser un artefacto de 30,9 GB, puede usarse en tests de humo de pipelines de despliegue, aunque el coste de almacenamiento y transferencia es elevado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 31 GB solo para pesos en FP8; con KV cache y overhead de runtime, se recomienda al menos 40 GB para contextos moderados.
- GPU recomendadas: A100 40GB, A100 80GB, H100 80GB, L40S 48GB, RTX 6000 Ada 48GB.
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en RTX 3090 (24 GB) sin offloading a CPU o cuantización adicional a 4 bits.
- Opciones de despliegue: vLLM (soporte FP8 nativo en GPUs Ada/Hopper), TGI, SGLang. llama.cpp y Ollama requerirían convertir los pesos a GGUF, ya que no consumen safetensors FP8 directamente.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AI-SecurityAgent/Qwen3.8-27B-FP8 | 27,8 B | no disponible | FP8 | Apache 2.0 | Mirror en HF |
| Qwen/Qwen3.8-27B-FP8 | 27,8 B | no disponible | FP8 | Apache 2.0 | Repositorio original (fuente) |
| Alternativas de ~27B en FP8 | no disponible | no disponible | FP8 | no disponible | no disponible |

No se dispone de información suficiente para comparar con modelos de otros fabricantes en la misma categoría.

## Limitaciones y advertencias

- Es un mirror sin modificaciones: no aporta ninguna mejora, corrección o ajuste respecto al original; cualquier problema del modelo fuente se hereda.
- La model card no documenta arquitectura interna, contexto, idiomas ni datos de entrenamiento, lo que impide evaluar su idoneidad para producción sin consultar el repositorio original.
- Riesgo de alucinación: no cuantificado en la información disponible; es un riesgo inherente a los modelos generativos de esta escala.
- Sesgos conocidos: no documentados.
- La cuantización FP8 puede introducir degradación en tareas sensibles a la precisión numérica (matemáticas, código), aunque no se han publicado mediciones.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar el fichero LICENSE incluido y las condiciones del repositorio original.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que reduce la confianza sobre su mantenimiento y trazabilidad.
- No se garantiza que el mirror se mantenga sincronizado con el original.

## Enlaces

- Repositorio mirror: https://huggingface.co/AI-SecurityAgent/Qwen3.8-27B-FP8
- Repositorio original referenciado: https://huggingface.co/Qwen/Qwen3.8-27B-FP8
- No se han encontrado papers, blogs, repositorios de código ni demos adicionales en la información proporcionada.
