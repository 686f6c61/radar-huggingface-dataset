# ProCreations/minima-100m-g64-repr

## Resumen

Minima W1.58A8 es un modelo de lenguaje comprimido a partir de LiquidAI/LFM2.5-Encoder-350M, desarrollado por ProCreations (SSH) con el objetivo de hacer que la IA sea pequeña, accesible y ejecutable en hardware de consumo. Se trata de un artefacto ternario: los pesos de las matrices se representan con valores lógicos {-1, 0, +1} en formato de runtime I2_S, lo que reduce drásticamente el uso de memoria frente a una representación de punto flotante tradicional. El modelo tiene 94,2 millones de parámetros totales y un tamaño de repositorio de 0,1 GB, lo que lo convierte en una opción viable para entornos con recursos limitados.

La relevancia de este modelo radica en su enfoque de compresión extrema mediante el pipeline Minima, descrito en el artículo arXiv 2602.01613v1, que combina técnicas de redes tensoriales (Tucker, tensor-train) con predicción de sensibilidad por capas y parches. Aunque el modelo base es un encoder de 350M, la versión comprimida reduce el peso a aproximadamente 94M, manteniendo una representación ternaria que promete eficiencia en inferencia. No se dispone de información sobre la longitud de contexto, idiomas soportados ni benchmarks publicados, por lo que su uso práctico debe validarse empíricamente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en LiquidAI/LFM2.5-Encoder-350M (arquitectura LFM, probablemente híbrida SSM/atención lineal; no confirmado) |
| Parametros totales | 94.207.744 (~94M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende de la configuración en minima_config.json) |
| Tipos de cuantizacion | Ternario (1.58 bits) para pesos, 8 bits para activaciones (W1.58A8); formato I2_S runtime |
| Idiomas soportados | No disponible |
| Licencia | lfm-open-license-v1.0 (licencia propia de LiquidAI, con restricciones) |
| Formato de pesos | safetensors (empaquetado ternario I2_S) |

## Arquitectura y entrenamiento

El modelo es un artefacto comprimido a partir de LiquidAI/LFM2.5-Encoder-350M, un encoder de la familia LFM (Liquid Foundation Model) de Liquid AI. La arquitectura exacta del modelo base no está documentada en la información proporcionada, pero por el nombre "Encoder" se infiere que se trata de un modelo de representación (embeddings) más que de generación de texto. El pipeline de compresión Minima, descrito en el artículo arXiv 2602.01613v1, entrena un predictor convolucional ligero para estimar la sensibilidad a nivel de capa y parche, y aplica una mezcla de descomposiciones Tucker y tensor-train para comprimir estructuralmente el transformer. El resultado es un modelo con pesos ternarios {-1, 0, +1} almacenados en formato I2_S, lo que reduce la huella de memoria en comparación con pesos de punto flotante.

No se dispone de información sobre el proceso de entrenamiento del modelo base (número de tokens, composición del dataset, técnicas de RLHF/DPO) ni sobre el ajuste fino posterior. La model card solo indica que se carga mediante la librería `minima-lfm` con `MinimaModel.from_pretrained(...)`, y que los detalles de configuración (tamaño de grupo, rango de recuperación, límite de contexto) se encuentran en `minima_config.json`.

## Capacidades

- Representación de texto (embeddings) gracias a su naturaleza de encoder, aunque no se especifican tareas concretas.
- Inferencia eficiente en hardware de consumo debido a la compresión ternaria y al reducido número de parámetros.
- Carga mediante la librería `minima-lfm` (paquete `minima`), que gestiona el formato ternario y la descompresión en tiempo de ejecución.
- No se documentan capacidades de generación de texto, razonamiento, código, tool calling, agentes ni multimodalidad.

## Casos de uso

- Clasificación de texto en entornos con restricciones de memoria: al ser un encoder de ~94M con pesos ternarios, puede ejecutarse en dispositivos embebidos o CPUs sin GPU, permitiendo clasificación de sentimiento, detección de spam o categorización de documentos.
- Extracción de características para sistemas de recuperación: los embeddings generados pueden alimentar bases vectoriales para búsqueda semántica en aplicaciones móviles o edge.
- Prototipado rápido de modelos NLP: su tamaño reducido facilita experimentación en notebooks o entornos de desarrollo sin infraestructura dedicada.
- Filtrado de contenido en tiempo real: al requerir poca VRAM, puede desplegarse en servidores de baja capacidad para moderar comentarios o mensajes.
- Aprendizaje por transferencia: los embeddings preentrenados pueden servir como punto de partida para tareas específicas con datasets pequeños, reduciendo costes de entrenamiento.
- Evaluación de técnicas de compresión: como artefacto de demostración del pipeline Minima, permite estudiar el impacto de la cuantización ternaria en la calidad de las representaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este modelo. Se recomienda validar su rendimiento en tareas concretas antes de su uso en producción.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 18-20 MB para los pesos (94M × 1.58 bits ≈ 18.6 MB) más overhead de activaciones y descompresión; cabe en cualquier GPU moderna e incluso en CPU.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM (p. ej., NVIDIA GTX 1050, RTX 2060, integradas). Para despliegue en CPU, se requiere un procesador con soporte de instrucciones AVX2 o superior.
- Compatible con hardware de consumo: sí, es uno de los principales objetivos del autor.
- Opciones de despliegue: la librería `minima-lfm` proporciona la carga del modelo; no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; dependen del hardware y de la implementación de la librería.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables directamente, dado que se trata de un artefacto de compresión experimental sin benchmarks publicados. Se podría comparar con otros encoders pequeños como BERT-tiny (4.4M) o DistilBERT (66M), pero las diferencias arquitectónicas y la falta de métricas impiden una comparación rigurosa.

## Limitaciones y advertencias

- La compresión ternaria puede degradar la calidad de las representaciones frente al modelo original de 350M; no hay métricas que cuantifiquen esta pérdida.
- No se documentan sesgos conocidos, pero al ser un modelo derivado de un encoder preentrenado, puede heredar sesgos de los datos de entrenamiento originales.
- Riesgo de alucinación: no aplica directamente al ser un encoder, pero en caso de usarse para generación (si la arquitectura lo permite), el riesgo sería alto por el reducido tamaño.
- La licencia lfm-open-license-v1.0 es una licencia propia de LiquidAI; es necesario revisar sus términos para uso comercial, ya que puede incluir restricciones de atribución o limitaciones de uso.
- El modelo no incluye información sobre idiomas soportados, por lo que su cobertura lingüística es desconocida.
- La fecha de creación (2026-08-17) es posterior a la fecha actual de conocimiento; se recomienda verificar la disponibilidad y vigencia del modelo en el repositorio.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ProCreations/minima-100m-g64-repr
- Repositorio GitHub de Minima: https://github.com/SSHDotCodes/minima
- Artículo arXiv sobre el pipeline de compresión Minima: https://arxiv.org/abs/2602.01613v1
- Licencia del modelo base: https://huggingface.co/LiquidAI/LFM2.5-Encoder-350M/blob/main/LICENSE
