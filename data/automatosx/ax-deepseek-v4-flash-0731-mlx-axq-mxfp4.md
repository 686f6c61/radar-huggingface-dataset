# AutomatosX/AX-DeepSeek-V4-Flash-0731-MLX-AXQ-MXFP4

## Resumen

Este repositorio contiene un pack de cuantización en formato MXFP4 del modelo DeepSeek-V4-Flash-0731, preparado específicamente para ejecutarse en hardware Apple Silicon mediante la librería MLX. El trabajo lo realiza AutomatosX, que publica el checkpoint bajo licencia MIT. El objetivo es ofrecer una versión reducida en precisión (4 bits) de un modelo de generación de texto, optimizada para inferencia local en equipos Mac con memoria unificada.

La relevancia de este pack radica en que combina dos tendencias actuales: la cuantización extrema (MXFP4, un formato de punto flotante de 4 bits con escala por bloque definido en la especificación OCP MX) y el ecosistema MLX, que permite aprovechar la memoria unificada de los chips Apple. No se proporcionan detalles sobre la arquitectura, el número de parámetros o la longitud de contexto del modelo base, por lo que la ficha se limita a lo que la documentación del autor permite afirmar.

El autor advierte explícitamente de que el checkpoint Tier 1 no está certificado en un Mac Studio M2 con 192 GB de memoria, ya que el pack se encuentra en la clase de 170 GB o más, lo que provoca bloqueos de memoria durante la generación o la verificación del checkpoint.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: deepseek-ai/DeepSeek-V4-Flash-0731) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 (4 bits, punto flotante con escala por bloque, formato OCP MX) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | MLX (formato nativo de la librería MLX, basado en safetensors) |

## Arquitectura y entrenamiento

Este repositorio no contiene un modelo entrenado desde cero, sino una cuantización del checkpoint DeepSeek-V4-Flash-0731. La cuantización se realiza mediante la herramienta AXQuant con el modo `--q-mode mxfp4`, siguiendo la receta `examples/deepseek-v4-experimental-mxfp4-v0.1.yaml`. El formato MXFP4 pertenece a la especificación OCP MX (Microscaling), que agrupa varios elementos en bloques y comparte un factor de escala común, reduciendo la memoria necesaria a un cuarto del tamaño original en FP16.

No se dispone de información sobre el proceso de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO). Tampoco se documentan innovaciones técnicas adicionales en el pack cuantizado más allá de la propia cuantización MXFP4 y su integración con MLX.

## Capacidades

- Generación de texto: al ser una cuantización de un modelo de lenguaje, hereda las capacidades de generación de texto del modelo base, aunque no se detallan específicamente.
- Razonamiento y código: no se especifican capacidades concretas en la documentación del pack.
- Tool calling y agentes: no se menciona soporte para estas funcionalidades.
- Capacidades multilingües: no se indica qué idiomas soporta el modelo base.
- Capacidades especiales (visión, audio, thinking mode): no se documentan.

La ausencia de datos en la model card impide confirmar cualquier capacidad más allá de la generación de texto.

## Casos de uso

- Inferencia local en Apple Silicon: el pack está diseñado para ejecutarse con MLX en equipos Mac, aprovechando la memoria unificada. Es adecuado para desarrolladores que quieran probar un modelo de gran tamaño en local sin depender de GPUs NVIDIA.
- Experimentación con cuantización MXFP4: sirve como referencia para quienes investigan formatos de baja precisión y su impacto en rendimiento y calidad.
- Despliegue en entornos con restricciones de memoria: al reducir el modelo a 4 bits, permite ejecutar un checkpoint que de otra forma requeriría más de 170 GB de memoria, aunque el autor advierte que el Tier 1 ya supera ese umbral en la práctica.
- Integración en pipelines de generación de texto con MLX: los desarrolladores pueden cargar el modelo con `mlx_lm` u otras herramientas del ecosistema MLX para tareas de completado o chat.

No se documentan casos de uso adicionales específicos del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este pack cuantizado ni para el modelo base DeepSeek-V4-Flash-0731.

## Requisitos de hardware

- El autor indica que el checkpoint Tier 1 no está certificado en un Mac Studio M2 con 192 GB de memoria, porque el pack está en la clase de 170 GB o más. Esto sugiere que se necesita al menos 192 GB de RAM unificada para intentar cargarlo, y probablemente más para garantizar la generación sin bloqueos.
- No se especifican requisitos para otros tiers del checkpoint.
- Al ser un pack MLX, está pensado exclusivamente para Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra). No es compatible con GPUs NVIDIA o AMD.
- Opciones de despliegue: se puede cargar con la librería MLX de Python o con herramientas como `mlx_lm`. No se menciona soporte para vLLM, llama.cpp u Ollama.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No disponible. No se dispone de información sobre modelos comparables en la misma categoría (cuantizaciones MXFP4 de DeepSeek-V4-Flash-0731 o alternativas equivalentes en MLX).

## Limitaciones y advertencias

- Cuantización de 4 bits: la pérdida de precisión inherente a MXFP4 puede degradar la calidad de la generación frente al modelo en FP16 o BF16, especialmente en tareas de razonamiento matemático o código.
- Requisitos de memoria muy elevados: el pack supera los 170 GB, lo que limita su uso a equipos Mac con al menos 192 GB de RAM unificada, y aun así el autor no certifica el funcionamiento en esa configuración.
- Falta de certificación: el autor indica que el checkpoint Tier 1 no está certificado en el hardware de prueba, lo que implica un riesgo de fallos o bloqueos en producción.
- Documentación incompleta: no se especifican arquitectura, parámetros, contexto, idiomas ni benchmarks del modelo base, lo que dificulta evaluar su idoneidad para casos concretos.
- Licencia MIT: permite uso comercial y modificación, pero al ser un pack cuantizado, la licencia del modelo base DeepSeek-V4-Flash-0731 podría imponer restricciones adicionales que no se detallan en este repositorio.
- Riesgo de alucinación y sesgos: al no disponer de información sobre el entrenamiento del modelo base, no se pueden evaluar estos riesgos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/AutomatosX/AX-DeepSeek-V4-Flash-0731-MLX-AXQ-MXFP4
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
