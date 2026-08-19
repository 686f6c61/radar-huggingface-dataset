# AutomatosX/AX-gpt-oss-20b-MLX-AXQ-6bit

## Resumen

El modelo **AX-gpt-oss-20b-MLX-AXQ-6bit** es un checkpoint cuantizado en formato MLX del modelo **openai/gpt-oss-20b**, desarrollado por **AutomatosX** mediante su tecnología de cuantización mixta **AXQuant (AXQ)**. El modelo base es un transformer de mezcla de expertos (MoE) con 20.910 millones de parámetros lógicos, diseñado para generación de texto y razonamiento, con una ventana de contexto configurada de 131.072 tokens. Esta conversión específica está optimizada para ejecutarse en hardware Apple Silicon mediante el runtime MLX-LM o el motor propietario AX Engine.

La relevancia de este paquete reside en que permite ejecutar un modelo MoE de gran tamaño en equipos Apple con memoria unificada, reduciendo el peso de 15,69 GB (cuantizado) frente a los aproximadamente 40 GB del original en BF16. Sin embargo, el propio autor advierte que se trata de un **paquete de desarrollo sin certificación formal**, sin benchmarks de calidad publicados ni evidencia de retención de rendimiento frente al modelo original. La cuantización utiliza una asignación mixta de precisión: un 55,84 % de los parámetros en 4 bits, un 38,54 % en 6 bits, un 2,81 % en 8 bits y un 2,80 % en BF16, alcanzando una media de 6,0 bits por peso (BPW).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GptOssForCausalLM (mixture of experts, MoE) |
| Parametros totales | 20,91B lógicos (checkpoint cuantizado: 4.724.523.264 tensores almacenados) |
| Parametros activos | no disponible |
| Longitud de contexto | 131.072 tokens (configurado; límite práctico según memoria unificada) |
| Tipos de cuantizacion | AXQuant mixto: 4-bit, 6-bit, 8-bit y BF16 (media 6,0 BPW) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX safetensors (no incluye PyTorch ni GGUF) |

## Arquitectura y entrenamiento

El modelo base, **openai/gpt-oss-20b**, es un transformer MoE con 20,91 mil millones de parámetros lógicos. No se proporcionan en esta ficha detalles sobre su entrenamiento original (número de tokens, composición del dataset o métodos de alineación), ya que la información disponible se limita a la conversión cuantizada. La conversión fue realizada por AutomatosX con el cuantizador **AXQuant 1.6.2**, que aplica una estrategia de precisión mixta con "suelos de protección": los embeddings, normas y otros tensores sensibles se mantienen en mayor precisión (BF16 o 8 bits), mientras que el grueso de las capas de atención y MLP se cuantiza a 4 y 6 bits. La asignación se basa en **prioris de arquitectura**, sin calibración con datos reales, y el proceso registró 169 conversiones de módulos exitosas sin fallos. No se incluyen sidecars de MTP (multi-token prediction) ni de visión. El checkpoint se generó con MLX 0.32.0 y MLX-LM 0.31.3, y el motor AX Engine versión 6.11.1 es el referente para el contrato de ejecución nativa.

## Capacidades

- Generación de texto y razonamiento conversacional, heredadas del modelo base gpt-oss-20b (no verificadas en esta conversión).
- Soporte de contexto largo de hasta 131.072 tokens en configuración, aunque el rendimiento real a esa longitud no ha sido validado.
- Capacidades multilingües no especificadas en la documentación del paquete.
- No incluye soporte de visión ni de audio (sin sidecars de visión o audio).
- No incluye MTP (multi-token prediction) acelerado.
- No se documenta soporte explícito de tool calling o function calling en esta conversión; dependerá del modelo base y del runtime utilizado.

## Casos de uso

- **Inferencia local en Apple Silicon**: el checkpoint está optimizado para MLX-LM, permitiendo ejecutar un modelo MoE de 20,91B en equipos Mac con memoria unificada suficiente (se recomienda al menos 32 GB para un uso cómodo).
- **Desarrollo y evaluación de cuantización**: dado que es un paquete de desarrollo, sirve para probar el flujo AXQuant y comparar la calidad de la cuantización mixta frente al modelo original en tareas concretas.
- **Prototipado de aplicaciones de generación de texto**: integración en scripts Python con `mlx_lm.generate` para generar respuestas, resúmenes o completar textos.
- **Servicio de inferencia con AX Engine**: mediante `ax-engine serve` se puede exponer el modelo como endpoint HTTP para pruebas internas o integración en aplicaciones.
- **Investigación sobre eficiencia de modelos MoE**: permite estudiar el impacto de la cuantización mixta en la calidad de salida y el uso de memoria en hardware Apple.
- **Despliegue en entornos con restricciones de memoria**: al ocupar solo 15,71 GB de descarga, es viable en equipos con 16 GB de RAM unificada, aunque con límites prácticos de contexto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explícitamente que no hay evidencia de calidad frente al modelo BF16 original ni de velocidad de kernels, y que el paquete no está certificado. No se proporcionan cifras de MMLU, HumanEval, GSM8K ni otras pruebas estándar.

## Requisitos de hardware

- **VRAM/memoria unificada**: el checkpoint pesa 15,69 GB en safetensors; se necesita al menos 16 GB de memoria unificada para cargarlo, aunque para contexto largo se recomiendan 32 GB o más.
- **GPU**: exclusivamente Apple Silicon (serie M1/M2/M3/M4); no compatible con GPU NVIDIA o AMD.
- **Opciones de despliegue**: MLX-LM (inferencia por línea de comandos o Python) y AX Engine (servidor HTTP).
- **Latencia y throughput**: no disponibles; el autor indica que no se han medido y que no se reclama ninguna aceleración hasta que se publiquen benchmarks con el mismo checkpoint.
- **Espacio en disco**: se requieren aproximadamente 15,71 GB para la descarga completa, más espacio adicional para el repositorio (el tamaño total del repo es de 31,4 GB, posiblemente por archivos duplicados o metadatos).

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos cuantizados de la misma categoría. Como referencia estructural, el modelo base **openai/gpt-oss-20b** en BF16 ocupa unos 40 GB y requiere hardware de mayor capacidad; esta conversión MLX reduce el peso a menos de la mitad. Existe un hermano de 4 bits (`AX-gpt-oss-20b-MLX-AXQ-4bit`) con menor presupuesto de almacenamiento, pero tampoco tiene benchmarks publicados. No se han encontrado comparaciones con otros modelos MoE cuantizados para Apple Silicon (por ejemplo, versiones MLX de Mixtral o Qwen MoE) en la información disponible.

## Limitaciones y advertencias

- **Paquete de desarrollo no certificado**: no ha superado los controles formales M0-M8 de AXQuant; no debe considerarse una versión estable para producción.
- **Sin evidencia de calidad**: no se han publicado métricas de retención de calidad frente al modelo original; la cuantización se basa en prioris de arquitectura sin calibración.
- **Riesgo de alucinación y sesgos**: no se han evaluado; el modelo base puede presentar los sesgos típicos de los LLM entrenados con datos web, pero no hay análisis específico.
- **Contexto largo no validado**: la capacidad de 131.072 tokens es un valor de configuración, no una garantía de rendimiento; en la práctica dependerá de la memoria unificada disponible.
- **Solo texto**: no soporta visión, audio ni MTP; cualquier afirmación sobre estas capacidades sería incorrecta.
- **Restricciones de uso**: licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo base (openai/gpt-oss-20b) para confirmar que no existen restricciones adicionales.
- **Dependencia de runtime**: MLX-LM puede ignorar metadatos de AXQuant y sidecars; para funcionalidad completa se requiere AX Engine, que no está incluido en el repositorio.

## Enlaces

- [Modelo en HuggingFace: AutomatosX/AX-gpt-oss-20b-MLX-AXQ-6bit](https://huggingface.co/AutomatosX/AX-gpt-oss-20b-MLX-AXQ-6bit)
- [Modelo base: openai/gpt-oss-20b](https://huggingface.co/openai/gpt-oss-20b)
- [Repositorio AXQuant (GitHub)](https://github.com/defai-digital/axquant)
- [Catálogo de modelos MLX de AutomatosX](https://huggingface.co/collections/AutomatosX/automatosx-mlx-model-catalog)
- [Hermano 4-bit: AutomatosX/AX-gpt-oss-20b-MLX-AXQ-4bit](https://huggingface.co/AutomatosX/AX-gpt-oss-20b-MLX-AXQ-4bit)
