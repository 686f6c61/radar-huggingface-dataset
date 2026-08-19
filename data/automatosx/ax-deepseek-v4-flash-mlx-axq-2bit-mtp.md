# AutomatosX/AX-DeepSeek-V4-Flash-MLX-AXQ-2bit-MTP

## Resumen

AX-DeepSeek-V4-Flash-MLX-AXQ-2bit-MTP es un checkpoint cuantizado en formato MLX (Apple Silicon) del modelo DeepSeek-V4-Flash, desarrollado por AutomatosX mediante su técnica AXQuant (AXQ) de precisión mixta. El modelo base es un transformador de mezcla de expertos (MoE) de 284,33 mil millones de parámetros lógicos con aproximadamente 13 mil millones de parámetros activos por token, y este paquete lo convierte a una clase de presupuesto de almacenamiento de 2 bits, manteniendo la cabeza de predicción multi-token (MTP) en BF16.

El objetivo del paquete es permitir la ejecución local de un modelo MoE de gran escala en hardware Apple con memoria unificada, reduciendo el peso de 115 GB en safetensors. Sin embargo, el propio autor lo clasifica como evidencia de desarrollo, no como una versión certificada: no se publican métricas de calidad, velocidad de kernels, rendimiento de MTP ni validación de contexto largo. La licencia es Apache-2.0, aunque el modelo base puede tener términos adicionales.

Su relevancia actual radica en que DeepSeek-V4-Flash, según fuentes externas de julio de 2026, supera a su hermano mayor V4-Pro en benchmarks de codificación agéntica, y este checkpoint ofrece una vía para probarlo localmente en Macs de alta memoria, a costa de una degradación de precisión no cuantificada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeepseekV4ForCausalLM (mixture of experts, MoE) |
| Parametros totales | 284,33B lógicos (según model card); 37,67B según contador de safetensors |
| Parametros activos | ~13B por token (según fuentes externas) |
| Longitud de contexto | 1.048.576 tokens (configurado; no validado) |
| Tipos de cuantizacion | AXQuant 2-bit mixto (2-bit, 4-bit, 8-bit, BF16); BPW medido total 3,1605 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (checkpoint); modelo base con licencia propia |
| Formato de pesos | MLX Safetensors (no PyTorch ni GGUF) |

## Arquitectura y entrenamiento

El modelo base DeepSeek-V4-Flash es un MoE con 284,33B parámetros lógicos y aproximadamente 13B activos por token, diseñado para eficiencia computacional en inferencia. Este checkpoint no es un entrenamiento nuevo, sino una conversión y cuantización del modelo BF16 original mediante AXQuant 1.5.1. La cuantización es de precisión mixta: el 95,59% de los pesos (278,11B) se asigna a 2 bits, el 1,25% a 4 bits, el 0,18% a 8 bits y el 2,98% a BF16, con grupos de cuantización de tamaño 32. La asignación se basa en prioris de arquitectura, sin calibración con datos. La cabeza MTP (predicción multi-token) se conserva en BF16 en un sidecar de 6,61B parámetros (3,59 GB). No se dispone de información sobre el entrenamiento original (número de tokens, composición del dataset, uso de RLHF o DPO). El autor indica que el paquete no incluye manifiesto nativo para AX Engine, por lo que la ejecución se limita al runtime MLX-LM.

## Capacidades

- Generación de texto autoregresiva estándar, según la etiqueta de pipeline text-generation.
- Razonamiento y codificación: el modelo base DeepSeek-V4-Flash, según fuentes externas, destaca en tareas de codificación agéntica y razonamiento, aunque este checkpoint no publica evidencia de rendimiento.
- Predicción multi-token (MTP) presente en el sidecar BF16, pero sin medición de aceleración ni aceptación publicada.
- Soporte de tool calling y agentes: no confirmado explícitamente en la documentación del checkpoint; se infiere de las capacidades del modelo base, sin validación.
- Capacidades multilingües: no disponible.
- Sin visión ni audio: los sidecars de visión no están incluidos y los campos de visión/audio son False.
- Contexto largo configurado de hasta 1.048.576 tokens, aunque el autor advierte que es metadato de configuración, no una capacidad validada.

## Casos de uso

- Evaluación de cuantización AXQ 2-bit en modelos MoE: permite comparar la calidad de salida frente al modelo BF16 original en tareas específicas, útil para investigadores que estudian el impacto de la precisión mixta en arquitecturas de mezcla de expertos.
- Prototipado local en Apple Silicon: desarrolladores con Macs de alta memoria unificada (128 GB o más) pueden ejecutar el modelo para pruebas de concepto de aplicaciones de generación de texto sin depender de GPUs de gama alta.
- Experimentación con contexto largo: la ventana configurada de 1M tokens permite explorar tareas de análisis de documentos extensos, aunque sin garantía de calidad en esa longitud.
- Investigación sobre predicción multi-token: el sidecar MTP en BF16 posibilita estudios sobre el impacto de esta técnica en la velocidad de decodificación, siempre que se mida de forma independiente.
- Generación de código asistida en entornos aislados: si el modelo base mantiene sus capacidades de codificación tras la cuantización, podría usarse para autocompletado o revisión de código en local, sujeto a validación previa.
- Desarrollo de agentes conversacionales experimentales: con tool calling potencial del modelo base, se pueden construir prototipos de agentes que ejecuten múltiples pasos de razonamiento, aunque la fiabilidad no está certificada.
- Benchmarking de requisitos de memoria: sirve como referencia para calibrar cuánta memoria unificada necesita un MoE de 284B en 2-bit, información útil para planificar despliegues en hardware Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor declara explícitamente que no hay evidencia de calidad frente al BF16 o líneas base uniformes, ni mediciones de velocidad de kernels, ni pruebas de contexto largo, ni datos de aceleración MTP. Por tanto, no es posible presentar una tabla comparativa de rendimiento sin inventar números.

## Requisitos de hardware

- Almacenamiento: al menos 115,02 GB de espacio libre para la descarga completa.
- Memoria unificada: el checkpoint pesa 114,94 GB en safetensors; con la cuantización 2-bit (BPW 3,16), el uso de memoria en inferencia será aproximadamente el tamaño del modelo más la caché KV. Se recomienda un mínimo de 128 GB de RAM unificada, y más para contextos largos.
- Hardware compatible: Apple Silicon con memoria unificada amplia, por ejemplo Mac Studio o MacBook Pro con M2 Ultra, M3 Ultra o M4 Max/Ultra y 128 GB o más de RAM. No es compatible con GPUs NVIDIA o AMD, ya que el formato es MLX.
- Runtime: MLX-LM 0.31.3 o superior y MLX 0.32.0 (versiones registradas en la conversión). La ejecución con AX Engine nativo no está establecida, ya que no se incluye manifiesto validado.
- Latencia y throughput: no disponibles; el autor no publica mediciones de velocidad.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AX-DeepSeek-V4-Flash-MLX-AXQ-2bit-MTP (este) | 284,33B lógicos (MoE) | 1M configurado | AXQ 2-bit mixto, BPW 3,16 | Apache-2.0 | Hugging Face |
| AX-DeepSeek-V4-Flash-MLX-AXQ-4bit-MTP | 284,33B lógicos (MoE) | 1M configurado | AXQ 4-bit (presupuesto ~4 BPW) | Apache-2.0 | Hugging Face (sibling) |
| deepseek-ai/DeepSeek-V4-Flash (BF16 original) | 284,33B lógicos (MoE) | 1M | BF16 | Licencia propia de DeepSeek | Hugging Face |

No se dispone de benchmarks comparativos entre estos modelos. La comparación se limita a aspectos estructurales: el sibling de 4 bits ofrece mayor precisión media a costa de más almacenamiento, mientras que el original BF16 es la referencia sin pérdida de calidad pero requiere mucho más espacio (varios cientos de GB). No hay datos de rendimiento publicados para ninguna de las variantes cuantizadas.

## Limitaciones y advertencias

- Paquete de desarrollo no certificado: el autor declara que no se han cerrado los gates formales de certificación AXQuant M0-M8; no debe interpretarse como un lanzamiento estable.
- Sin evidencia de calidad: no hay métricas de retención de calidad frente al BF16 ni frente a líneas base uniformes; la cuantización 2-bit puede degradar significativamente el rendimiento en tareas complejas.
- Contexto largo no validado: la capacidad de 1.048.576 tokens es metadato de configuración, no una garantía de funcionamiento correcto en esa longitud.
- MTP sin verificación: la presencia del sidecar MTP no implica aceleración real; no se ha medido la aceptación ni la velocidad de predicción multi-token.
- Sin soporte de AX Engine: no se incluye manifiesto nativo, por lo que la ejecución se limita a MLX-LM; el runtime puede ignorar metadatos de AXQuant y sidecars opcionales.
- Riesgo de alucinación y sesgos: no evaluados en este checkpoint; se heredan del modelo base sin cuantificar.
- Restricciones de licencia del modelo base: aunque el checkpoint es Apache-2.0, el modelo base deepseek-ai/DeepSeek-V4-Flash tiene su propia licencia que puede imponer condiciones adicionales para uso comercial o derivados.
- Requisitos de memoria elevados: a pesar de la cuantización 2-bit, se necesitan al menos 128 GB de RAM unificada, lo que limita el hardware compatible a equipos Apple de gama alta.
- Sin soporte de visión ni audio: no es un modelo multimodal.

## Enlaces

- Checkpoint en Hugging Face: https://huggingface.co/AutomatosX/AX-DeepSeek-V4-Flash-MLX-AXQ-2bit-MTP
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash
- Colección de modelos MLX de AutomatosX: https://huggingface.co/collections/AutomatosX/automatosx-mlx-model-catalog
- Colección DeepSeek de AutomatosX: https://huggingface.co/collections/AutomatosX/deepseek
- Guía de configuración de DeepSeek V4-Flash (fuente externa): https://tech-insider.org/how-to-set-up-deepseek-v4-flash-2026/
- Documentación de API de DeepSeek V4 (fuente externa): https://deepseekv4.network/models
