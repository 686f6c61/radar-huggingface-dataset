# imvladikon/Ling-3.0-tiny-GLM-5.3-Flash-surgery

## Resumen

Ling 3.0 tiny GLM 5.3 Flash surgery es un modelo experimental de generación de texto de 7,80 mil millones de parámetros, creado por el usuario imvladikon. Se trata de un backbone de texto de GLM-5.3-Flash inicializado con pesos del modelo base Ling-3.0-tiny, de inclusionAI. La finalidad es explorar la viabilidad de transferir pesos entre arquitecturas híbridas que combinan atención dispersa (sparse) y lineal, tal como la que introduce zai-org en GLM-5.3-Flash. La versión del modelo es v0.3.0-mla-distill.

El modelo produce respuestas significativas en pruebas de humo en inglés, pero presenta errores aritméticos conocidos. La ventana de contexto se ha configurado en 2048 tokens y el índice de atención dispersa no está entrenado, lo que limita su funcionalidad. Para su ejecución se requiere Transformers 5.16.1 y `trust_remote_code=True` para el wrapper causal-LM. Dado su carácter experimental, no está pensado para uso en producción, sino como herramienta de investigación en técnicas de fusión y destilación de modelos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida de GLM-5.3-Flash (atención dispersa y lineal), inicializada desde Ling-3.0-tiny |
| Parámetros totales | 7.804.617.904 (7,80 B) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponibles (pruebas de humo solo en inglés) |
| Licencia | MIT |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo es un derivado que hereda la arquitectura híbrida de GLM-5.3-Flash, la cual, según la documentación de zai-org, combina atención dispersa y lineal para reducir los costes de servicio en contextos largos manteniendo la precisión. En este caso, el backbone se inicializa desde Ling-3.0-tiny, base modelo de inclusionAI, y se conservan completos el tokenizer donante y las tablas de embedding y salida no atadas. La versión v0.3.0-mla-distill genera respuestas coherentes en inglés en tareas sencillas, pero con errores aritméticos conocidos.

No se documenta el proceso de entrenamiento, el dataset utilizado ni si se aplicaron técnicas como RLHF o DPO. El modelo se presenta como una "cirugía" experimental, con el índice de atención dispersa sin entrenar, lo que implica que la capacidad de aprovechar contextos largos mediante sparse attention no está operativa. El tamaño del repositorio es de 15,7 GB, consistente con los 7,80 B de parámetros en formato Safetensors sin cuantizar.

## Capacidades

- Generación de texto en inglés para tareas de completado y conversación básica, según las pruebas de humo reportadas por el autor.
- Soporte de wrapper causal-LM personalizado mediante `trust_remote_code=True` en Transformers 5.16.1.
- No se documentan capacidades de tool calling, function calling, agentes ni razonamiento multi-paso.
- No hay soporte de visión ni de audio.
- Ventana de contexto limitada a 2048 tokens, insuficiente para tareas de documentos largos.
- No se conocen idiomas soportados formalmente; las pruebas de humo solo se han realizado en inglés.
- El índice de selección dispersa no está entrenado, por lo que el modelo no aprovecha la atención dispersa de la arquitectura GLM-5.3-Flash.

## Casos de uso

- Investigación en fusión de modelos: permite estudiar cómo la inicialización de pesos de Ling-3.0-tiny afecta al comportamiento de la arquitectura híbrida de GLM-5.3-Flash, con el fin de evaluar la transferibilidad de representaciones lingüísticas entre familias de modelos.
- Destilación de arquitecturas: sirve como referencia para probar métodos de destilación entre modelos con tokenizers y tablas de embedding distintos, ya que conserva el tokenizer donante.
- Pruebas de alineación de tokenizers: puede emplearse para validar si las tablas de embedding y salida no atadas generan resultados coherentes en autocompletado y generación de textos cortos.
- Evaluación de la robustez aritmética: al presentar errores aritméticos conocidos, es un sujeto de prueba para analizar cómo la arquitectura híbrida influye en el razonamiento numérico en modelos de pequeño tamaño.
- Desarrollo y depuración de wrappers en Transformers: al requerir código remoto, permite probar la integración de modelos personalizados en la librería Transformers y detectar incompatibilidades en versiones específicas.
- Estudios comparativos de eficiencia: dado que el índice disperso no está entrenado, puede utilizarse como caso de control para cuantificar la degradación del rendimiento cuando la atención dispersa no se ha optimizado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente reporta que la versión v0.3.0-mla-distill produce respuestas significativas en pruebas de humo en inglés y presenta errores aritméticos conocidos. No se dispone de puntuaciones en MMLU, HumanEval, GSM8K ni otros conjuntos de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: alrededor de 15,6 GB solo para los pesos. Con overhead de activaciones y contexto de 2048 tokens, se recomiendan al menos 20 GB de VRAM.
- En cuantización de 8 bits: aproximadamente 7,8 GB de VRAM para pesos; en 4 bits: en torno a 3,9 GB.
- GPU recomendadas: para FP16, una RTX 4090 o A100 de 40 GB; para cuantización de 4 bits, puede funcionar en GPUs de consumo como la RTX 3060 de 12 GB, siempre que se reduzca la longitud de contexto.
- Opciones de despliegue: vLLM y TGI son compatibles si se adapta el modelo a sus formatos, aunque el repositorio nativo solo se puede ejecutar vía Transformers con `trust_remote_code=True`. También es posible convertirlo a GGUF para su uso con llama.cpp u Ollama, aunque esto requeriría trabajo adicional de conversión.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa cuantitativa con modelos similares en la información proporcionada. Los modelos de referencia son GLM-5.3-Flash de zai-org y Ling-3.0-tiny de inclusionAI, pero no se conocen sus parámetros totales, longitud de contexto ni resultados de benchmarks. Este modelo es un híbrido experimental entre ambos, por lo que no es directamente comparable a las versiones oficiales.

## Limitaciones y advertencias

- Modelo experimental, no validado para producción ni para tareas críticas.
- Errores aritméticos conocidos; no es fiable para tareas matemáticas o de cálculo.
- El índice de atención dispersa no está entrenado, lo que degrada el rendimiento esperado en contextos largos.
- Ventana de contexto limitada a 2048 tokens, muy por debajo de los contextos extensos de los modelos actuales.
- No se documentan idiomas soportados; las pruebas de humo solo se han realizado en inglés.
- Riesgo de alucinación elevado al tratarse de un modelo no entrenado formalmente para la tarea.
- Requiere Transformers 5.16.1 y `trust_remote_code=True`, lo que implica ejecutar código remoto y aumenta la superficie de seguridad.
- Licencia MIT permite uso comercial, pero el modelo podría contener defectos significativos que lo hacen inadecuado para entornos reales.

## Enlaces

- https://huggingface.co/imvladikon/Ling-3.0-tiny-GLM-5.3-Flash-surgery
- https://huggingface.co/inclusionAI/Ling-3.0-tiny
- https://huggingface.co/zai-org/GLM-5.3-Flash
