# joemia1993/relay-iwerzn-int8

## Resumen

relay-iwerzn-int8 es un checkpoint de Qwen2ForCausalLM publicado por el usuario joemia1993 en Hugging Face. Se trata de un modelo de generación de texto de arquitectura transformer (familia Qwen2) con una configuración deliberadamente reducida: una sola capa, `hidden_size=1024`, 16 cabezas de atención y 8 cabezas KV. Con 44,6 millones de parámetros totales, está muy lejos de los modelos Qwen2 de referencia y parece ser un experimento de entrenamiento o una prueba de concepto más que un modelo destinado a producción.

El checkpoint está cuantizado a int8 mediante bitsandbytes (pesos en formato I8 con escalas de fila en F32) y debe cargarse con `load_in_8bit=True`. La model card del autor indica explícitamente que se trata de un "punto de interrupción de entrenamiento, sin evaluación", lo que significa que no hay garantías de calidad, coherencia ni utilidad práctica.

Es relevante únicamente como material de estudio para quienes trabajen con cuantización int8 de bitsandbytes sobre arquitecturas Qwen2, o para quien quiera inspeccionar el formato de pesos I8 + SCB. No es un modelo con benchmarks, licencia clara ni soporte multilingüe más allá de los idiomas declarados (inglés y chino).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2ForCausalLM) |
| Parametros totales | 44.609.280 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (bitsandbytes, pesos I8 + escalas de fila F32) |
| Idiomas soportados | en, zh |
| Licencia | no disponible |
| Formato de pesos | safetensors (int8) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de la familia Qwen2 con `hidden_size=1024`, una única capa, 16 cabezas de atención y 8 cabezas KV (GQA, ratio 2:1). El uso de GQA reduce el coste de memoria de la caché KV, aunque con una sola capa el impacto práctico es mínimo. La cuantización int8 se aplica con bitsandbytes: los pesos se almacenan como enteros de 8 bits con una escala de fila en float32 (`SCB`), y la carga requiere `load_in_8bit=True`.

No hay información sobre el dataset de entrenamiento, el número de tokens procesados, la composición de los datos ni si se aplicaron técnicas de alineación como RLHF o DPO. La model card indica que es un checkpoint interrumpido durante el entrenamiento y que no se ha evaluado. No se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Generación de texto autoregresiva básica, limitada por el estado de entrenamiento incompleto.
- Soporte de los idiomas declarados en la model card: inglés y chino.
- No hay evidencia de soporte de tool calling ni function calling.
- No hay evidencia de capacidades de agente ni razonamiento multi-paso.
- No hay capacidades multimodales (visión, audio) ni modo de pensamiento.
- Compatible con el pipeline `text-generation` de transformers y con text-generation-inference según los tags del repo.

## Casos de uso

- Estudio del formato de cuantización int8 de bitsandbytes: inspeccionar cómo se almacenan los pesos I8 y las escalas de fila F32 en un checkpoint Qwen2 real, útil para quien implemente cargadores personalizados.
- Pruebas de integración de pipelines de transformers: verificar que un modelo con `load_in_8bit=True` se carga y ejecuta correctamente en un entorno de CI antes de aplicar la misma configuración a modelos mayores.
- Experimentos académicos sobre modelos de una sola capa: analizar el comportamiento de un transformer mínimo con GQA para estudiar dinámicas de atención o representaciones internas.
- Validación de herramientas de cuantización: comparar la salida de distintas versiones de bitsandbytes o de transformers al cargar el mismo checkpoint int8.
- Docencia sobre arquitecturas Qwen2: usar un modelo de 44,6 M de parámetros para explicar la estructura de capas, cabezas y cabezas KV sin necesidad de hardware potente.
- Pruebas de compatibilidad con text-generation-inference: comprobar el despliegue de un checkpoint int8 pequeño en un endpoint TGI antes de escalar a modelos de mayor tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que el checkpoint no ha sido evaluado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en int8 (44,6 M de parámetros a 1 byte por peso, más escalas y overhead de activaciones).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) e incluso CPU para inferencia; no requiere A100 ni H100.
- Cabe holgadamente en cualquier GPU consumer e integrada con al menos 1-2 GB de memoria disponible.
- Opciones de despliegue: transformers con `load_in_8bit=True` (requisito de bitsandbytes), text-generation-inference (según tags del repo) y potencialmente llama.cpp si se convierte a GGUF, aunque no se documenta esa conversión.
- Latencia y throughput estimados: no disponibles; con una sola capa y 44,6 M de parámetros la latencia sería muy baja, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| relay-iwerzn-int8 | 44,6 M | no disponible | no disponible | Hugging Face (joemia1993) |
| Qwen2-0.5B | 494 M | 32.768 tokens (según versión) | Apache 2.0 | Hugging Face (Qwen) |
| Qwen2-1.5B | 1.540 M | 32.768 tokens (según versión) | Apache 2.0 | Hugging Face (Qwen) |
| TinyLlama-1.1B | 1.100 M | 2.048 tokens | Apache 2.0 | Hugging Face (TinyLlama) |

La comparación es desigual: relay-iwerzn-int8 tiene dos órdenes de magnitud menos parámetros que los modelos Qwen2 oficiales y carece de evaluación y licencia documentada. Los modelos Qwen2 oficiales ofrecen contexto largo, licencia Apache 2.0 y benchmarks publicados, por lo que son la opción natural para cualquier uso real.

## Limitaciones y advertencias

- Checkpoint de entrenamiento interrumpido: la model card indica que no ha sido evaluado y que es un punto de interrupción, por lo que la calidad de generación es impredecible.
- Sin licencia declarada: no se especifican términos de uso comercial; no debe asumirse permiso de uso en producción.
- Sesgos desconocidos: no hay documentación sobre el dataset ni sobre sesgos de género, raza o idioma.
- Riesgo elevado de alucinación y salidas incoherentes dado el estado incompleto del entrenamiento y el tamaño reducido.
- Contexto no documentado: se desconoce la longitud máxima de secuencia soportada.
- Idiomas limitados a inglés y chino según la model card; no hay soporte declarado de castellano.
- Requiere bitsandbytes y `load_in_8bit=True`; la carga en otros formatos (GGUF, fp16) no está documentada.
- Repo de 0.0 GB según Hugging Face: conviene verificar la integridad de los pesos antes de usarlos.

## Enlaces

- [Hugging Face: joemia1993/relay-iwerzn-int8](https://huggingface.co/joemia1993/relay-iwerzn-int8)
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
