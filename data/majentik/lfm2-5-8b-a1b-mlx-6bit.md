# majentik/LFM2.5-8B-A1B-MLX-6bit

## Resumen

LFM2.5-8B-A1B-MLX-6bit es una cuantización en 6 bits (affine, grupo de 64) del modelo LFM2.5-8B-A1B de Liquid AI, realizada por el usuario majentik y publicada en Hugging Face. El modelo base es un mixture-of-experts (MoE) de 8 000 millones de parámetros totales con solo 1 500 millones activos por paso, diseñado específicamente para ejecución en dispositivos (on-device) y optimizado para tareas de razonamiento, tool calling y agentes. Esta variante MLX permite ejecutar el modelo en Apple Silicon (chips M1, M2, M3 y M4) mediante la librería mlx-lm, reduciendo el tamaño del archivo a 6,9 GB y haciendo viable su uso en equipos con memoria unificada limitada.

La relevancia de esta cuantización radica en que acerca un modelo de razonamiento con ventana de contexto de 128 000 tokens a entornos de escritorio y portátiles Apple, sin necesidad de GPUs dedicadas. El modelo base incorpora un modo de razonamiento con cadena de pensamiento (chain of thought) explícita antes de la respuesta final, lo que mejora la calidad en tareas complejas. La licencia LFM Open v1.0 permite uso comercial con atribución, lo que facilita su adopción en productos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts), arquitectura propietaria LFM2.5 de Liquid AI |
| Parametros totales | 8 000 millones (modelo base) |
| Parametros activos | 1 500 millones por paso |
| Longitud de contexto | 128 000 tokens |
| Tipos de cuantizacion | 2, 3, 4, 5, 6, 8 bits y MXFP4 (variantes MLX disponibles) |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (uso comercial permitido con atribucion) |
| Formato de pesos | MLX (safetensors cuantizado 6-bit, affine, group size 64) |

## Arquitectura y entrenamiento

El modelo base LFM2.5-8B-A1B emplea una arquitectura MoE con 8 000 millones de parámetros totales y 1 500 millones activos por token, lo que reduce el coste computacional en inferencia manteniendo una capacidad alta. Liquid AI no ha publicado detalles completos sobre la arquitectura interna (si es transformer puro o híbrido con atención lineal), pero la documentación oficial la describe como "arquitectura LFM2 optimizada para dispositivos". El modelo es de razonamiento: las respuestas del asistente incluyen una cadena de pensamiento explícita antes de la respuesta final, generada mediante el template de chat del tokenizador.

No se dispone de información pública sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas de alineación como RLHF o DPO. La cuantización MLX 6-bit se realizó con `mlx_lm.convert` (mlx-lm 0.31.3) sobre la revisión `b9aebfcbe28b6cb374042f495d733037550ab146` del modelo base, y pasó una prueba de coherencia determinista (generación de 32 tokens) antes de su publicación.

## Capacidades

- Generación de texto y razonamiento con cadena de pensamiento explícita.
- Tool calling y function calling, optimizado para tareas de agente.
- Ventana de contexto de 128 000 tokens, adecuada para documentos largos y conversaciones multi-turno.
- Ejecución on-device en Apple Silicon con bajo consumo de memoria.
- Soporte multilingüe no confirmado en la documentación disponible.
- Integración con el ecosistema mlx-lm para generación y carga del modelo.

## Casos de uso

- Asistentes conversacionales en macOS: el modelo puede gestionar diálogos largos con memoria de hasta 128 000 tokens, ejecutándose localmente en un MacBook con suficiente memoria unificada, sin necesidad de conexión a internet.
- Agentes autónomos con tool calling: gracias a su soporte nativo de function calling, puede integrarse en pipelines que llaman a APIs, ejecutan comandos o consultan bases de datos, todo en local.
- Procesamiento de documentos extensos: la ventana de 128K permite resumir, analizar o extraer información de libros técnicos, informes o contratos completos en una sola pasada.
- Razonamiento complejo sin conexión: su modo de cadena de pensamiento lo hace útil para tareas de lógica, matemáticas o planificación en entornos aislados (aviones, barcos, zonas sin cobertura).
- Generación de código en local: puede asistir en programación dentro de IDEs, con la ventaja de que los datos no salen del dispositivo, algo crítico en entornos con políticas de privacidad estrictas.
- Análisis de datos exploratorio: con contexto largo, puede procesar logs, series temporales o resultados de experimentos y generar informes descriptivos directamente en el equipo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor indica "benchmarks pending" y no hay datos de evaluaciones comparativas (MMLU, HumanEval, GSM8K, etc.) en la documentación consultada.

## Requisitos de hardware

- Apple Silicon (M1, M2, M3 o M4) con memoria unificada; el tamaño del repositorio es de 6,9 GB, por lo que se recomienda al menos 8-10 GB de RAM libre para cargar el modelo y generar texto.
- No requiere GPU dedicada; la inferencia se realiza en la Neural Engine y los núcleos de CPU/GPU del chip Apple.
- Despliegue mediante `mlx-lm` (pip install mlx-lm) y uso con `mlx_lm.generate` o integración en aplicaciones Python.
- No se dispone de datos de latencia o throughput específicos para esta cuantización; el rendimiento dependerá del chip (M1 vs M4) y de la longitud de la secuencia generada.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| LFM2.5-8B-A1B (base) | 8B | 1.5B | 128K | LFM Open v1.0 | safetensors (BF16) |
| LFM2.5-8B-A1B-MLX-6bit (este) | 8B | 1.5B | 128K | LFM Open v1.0 | MLX 6-bit |
| LFM2.5-8B-A1B-MLX-8bit | 8B | 1.5B | 128K | LFM Open v1.0 | MLX 8-bit |
| Qwen2.5-7B-Instruct | 7B | 7B (dense) | 128K | Apache 2.0 | safetensors, GGUF |

La comparativa con Qwen2.5-7B-Instruct es orientativa: ambos tienen contexto de 128K, pero Qwen es un modelo denso (todos los parámetros activos) mientras que LFM2.5 es MoE con solo 1.5B activos, lo que reduce el coste por token. No hay datos de rendimiento comparativo publicados.

## Limitaciones y advertencias

- La licencia LFM Open v1.0 exige atribución en uso comercial; revisar el texto completo de la licencia antes de desplegar en producción.
- No se han publicado benchmarks oficiales, por lo que el rendimiento real en tareas estándar es desconocido.
- El modelo es de razonamiento y genera cadenas de pensamiento explícitas, lo que puede aumentar la latencia y el consumo de tokens en comparación con modelos que responden directamente.
- La cuantización 6-bit puede degradar ligeramente la calidad frente al modelo en BF16, aunque no hay evaluaciones que cuantifiquen esta pérdida.
- No se ha evaluado el sesgo o la toxicidad del modelo; se recomienda realizar pruebas específicas antes de usarlo en aplicaciones orientadas al usuario final.
- El formato MLX limita su uso a Apple Silicon; no es compatible con GPUs NVIDIA o AMD sin conversión adicional.

## Enlaces

- Repositorio Hugging Face del modelo cuantizado: https://huggingface.co/majentik/LFM2.5-8B-A1B-MLX-6bit
- Modelo base en Hugging Face: https://huggingface.co/LiquidAI/LFM2.5-8B-A1B
- Blog de Liquid AI sobre LFM2.5-8B-A1B: https://www.liquid.ai/blog/lfm2-5-8b-a1b
- Blog de introducción a LFM2.5: https://www.liquid.ai/blog/introducing-lfm2-5-the-next-generation-of-on-device-ai
- Documentación de Liquid AI para LFM2.5-8B-A1B: https://docs.liquid.ai/lfm/models/lfm25-8b-a1b
- Repositorio mlx-lm: https://github.com/ml-explore/mlx-lm
