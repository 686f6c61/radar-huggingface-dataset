# aphrodite-lab/aphrodite-lab-v2

## Resumen

Aphrodite-lab-v2 es un modelo de lenguaje publicado en Hugging Face por el usuario aphrodite-lab, con un total de 31.273.088.876 parámetros (aproximadamente 31,3 mil millones) almacenados en formato safetensors. El repositorio ocupa 62,6 GB y está etiquetado con la arquitectura `gemma4`, lo que sugiere que se trata de un derivado o ajuste sobre la familia Gemma de Google. La licencia declarada es Apache 2.0 y el acceso está restringido (gated), por lo que es necesario aceptar condiciones en la plataforma antes de descargar los pesos.

La relevancia de este modelo es limitada a partir de la información disponible: no se han publicado resultados de benchmarks, no hay pipeline declarado, no se especifican los idiomas soportados y el repositorio no registra descargas ni interacciones. El tag `gemma4` es la única indicación sobre su linaje arquitectónico, pero no se detalla si se trata de un fine-tuning, una fusión de modelos o un entrenamiento desde cero.

Dado que la ficha se elabora exclusivamente con los metadatos del repositorio y la búsqueda web no ha devuelto documentación técnica asociada (los resultados se refieren a la deidad mitológica homónima), numerosos apartados se marcan como "no disponible". Se recomienda tratar cualquier dato no confirmado con cautela antes de un uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `gemma4` (según tag del repositorio; detalles no disponibles) |
| Parametros totales | 31.273.088.876 (~31,3 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; se desconoce si existen versiones GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El repositorio etiqueta el modelo con `gemma4`, lo que apunta a una arquitectura de tipo transformer decoder-only heredada de la familia Gemma. Sin embargo, no se proporciona información sobre el número de capas, dimensión oculta, número de cabezas de atención, tipo de atención (global/local, RoPE, etc.) ni sobre posibles innovaciones como decodificación especulativa o atención lineal. Tampoco se especifica si el modelo emplea mezcla de expertos (MoE); el recuento de parámetros totales coincide con el de un modelo denso de ~31 B, pero no puede confirmarse.

No hay datos sobre el volumen de tokens de entrenamiento, la composición del dataset, el uso de RLHF, DPO u otras técnicas de alineación, ni sobre procesos de ajuste fino posteriores. El tamaño del repositorio (62,6 GB) es coherente con pesos en precisión bf16/fp16 para ~31 B de parámetros, lo que sugiere que no se han publicado variantes cuantizadas en el mismo repositorio.

## Capacidades

- Generación de texto: capacidad esperable en un modelo de ~31 B basado en transformer, aunque no verificada por el autor.
- Razonamiento y matemáticas: no disponible (sin benchmarks ni documentación).
- Generación de código: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Ventana de contexto: no disponible.

## Casos de uso

- Experimentación e investigación: el modelo puede descargarse (previa aceptación de condiciones) para estudiar el comportamiento de un transformer de ~31 B con licencia Apache 2.0, siempre que se validen previamente sus capacidades con evaluaciones propias.
- Ajuste fino supervisado (SFT): al publicarse en safetensors y con licencia permisiva, puede servir como base para fine-tuning en dominios verticales, aunque se desconoce su calidad base.
- Destilación o generación de datos sintéticos: un modelo de este tamaño puede emplearse para producir datos de entrenamiento para modelos menores, sujeto a validación de calidad.
- Evaluación comparativa interna: útil como referencia en pipelines de evaluación propios frente a otros modelos de ~30 B.
- Despliegue en entornos con requisitos de licencia laxa: Apache 2.0 facilita su integración en productos comerciales sin las restricciones de otras licencias, una vez verificada la procedencia de los datos de entrenamiento.
- Pruebas de infraestructura de inferencia: sirve para validar despliegues con vLLM, TGI o llama.cpp (previa conversión a GGUF) en clústeres con GPUs de 80 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 62,6 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda al menos 2× A100/H100 de 80 GB o 4× RTX 4090 de 24 GB con tensor parallelism.
- Cuantización a 8 bits: ~31-33 GB de pesos, viable en una A100 40 GB o en 2× RTX 4090.
- Cuantización a 4 bits: ~16-18 GB de pesos, potencialmente ejecutable en una RTX 4090 de 24 GB, aunque con posible pérdida de calidad no documentada.
- GPU recomendadas: H100 80 GB, A100 80 GB, A100 40 GB (con cuantización), RTX 4090 (con cuantización).
- Cabe en GPU de consumo: solo con cuantización agresiva (4 bits) y en GPUs de 24 GB o más.
- Opciones de despliegue: vLLM y TGI para safetensors en bf16; llama.cpp/Ollama requerirían conversión a GGUF no publicada en el repositorio.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| aphrodite-lab-v2 | ~31,3 B | no disponible | Apache 2.0 | Gated en Hugging Face |
| Gemma 2 27B (Google) | 27 B | 8K | Gemma Terms | Pública |
| Qwen2.5 32B (Alibaba) | 32,5 B | 128K | Apache 2.0 (variantes) | Pública |
| Mistral Small 24B | 24 B | 128K | Apache 2.0 | Pública |

La comparación se limita a parámetros, contexto, licencia y disponibilidad, ya que no hay datos de rendimiento publicados para aphrodite-lab-v2. La ausencia de documentación sobre contexto e idiomas impide una comparación técnica más profunda.

## Limitaciones y advertencias

- Ausencia total de documentación técnica: no hay model card con detalles de entrenamiento, datos, evaluación ni uso previsto.
- Riesgo elevado de alucinación y comportamiento impredecible al no conocerse el proceso de alineación.
- Sesgos desconocidos: al no documentarse la composición del dataset, no puede evaluarse el sesgo demográfico, cultural o lingüístico.
- Idiomas no declarados: no puede garantizarse un rendimiento aceptable en castellano ni en otros idiomas.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que puede limitar la reproducibilidad y la automatización de descargas.
- Licencia Apache 2.0 declarada, pero sin información sobre la procedencia de los datos de entrenamiento; conviene revisar posibles obligaciones derivadas de los términos de la familia Gemma si el modelo deriva de ella.
- Sin métricas de benchmarks ni validación externa: no apto para producción sin una evaluación previa exhaustiva.
- El nombre del repositorio y del autor no están vinculados a ninguna organización conocida, lo que dificulta verificar la trazabilidad del modelo.

## Enlaces

- Hugging Face: https://huggingface.co/aphrodite-lab/aphrodite-lab-v2
- No se han encontrado papers, blogs, repositorios de código ni demos asociados al modelo en la búsqueda web realizada.
