# sirsqm/seger-qwen2.5-1.5b-onnx

## Resumen

Seger (ONNX) es una compilación en formato ONNX con cuantización de 4 bits del ajuste fino LoRA denominado Seger, que a su vez se construye sobre el modelo Qwen 2.5 1.5B. El repositorio lo publica el usuario sirsqm y su propósito declarado es permitir inferencia directamente en el navegador mediante transformers.js sobre WebAssembly, sin necesidad de servidor. Se trata, por tanto, de una exportación de despliegue más que de un modelo entrenado desde cero: el valor añadido está en el formato y la cuantización, no en un entrenamiento propio documentado.

El repositorio ocupa 1.9 GB y se publica bajo la librería transformers.js, con los tags onnx, qwen2, text-generation y conversational. No incluye model card más allá de una descripción de tres líneas, no declara licencia, idiomas soportados, ni resultados de benchmarks. Tampoco ofrece información sobre el dataset o el procedimiento del ajuste fino Seger.

Su relevancia es acotada pero concreta: cubre el nicho de modelos pequeños (en torno a 1.5 B de parámetros) ejecutables en el cliente, útiles para demos, prototipos y aplicaciones con requisitos estrictos de privacidad donde los datos no deben salir del dispositivo. Al tener cero descargas y cero likes, y una documentación mínima, debe considerarse un artefacto experimental y no un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen2, exportado a ONNX (según el modelo base Qwen 2.5 1.5B) |
| Parámetros totales | Aproximadamente 1.500 millones (1,5 B), heredados del modelo base; no verificado en el repositorio |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la ficha del repositorio; el modelo base Qwen 2.5 1.5B soporta 32.768 tokens |
| Tipos de cuantización | 4 bits en formato ONNX; no se detallan variantes adicionales (no disponible) |
| Idiomas soportados | No disponible |
| Licencia | No disponible (el repositorio no declara licencia; el modelo base Qwen 2.5 1.5B se distribuye bajo Apache 2.0) |
| Formato de pesos | ONNX, preparado para transformers.js |
| Tamaño del repositorio | 1.9 GB |
| Pipeline | text-generation |
| Modelo base | sirsqm/seger-qwen2.5-1.5b (ajuste LoRA de Qwen 2.5 1.5B) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen 2.5 1.5B: un transformer decoder-only con normalización RMSNorm, activación SwiGLU, embeddings RoPE y atención con query grouping (GQA). No se dispone de detalles sobre el ajuste fino LoRA Seger: ni el número de tokens de entrenamiento, ni la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. La model card únicamente indica que se trata de una build ONNX de 4 bits del fine-tune, orientada a inferencia en navegador.

La innovación técnica del repositorio no está en el entrenamiento, sino en el empaquetado: la exportación a ONNX con cuantización de 4 bits permite ejecutar el modelo con transformers.js sobre WebAssembly, y potencialmente sobre WebGPU, eliminando la necesidad de GPU servidor o de una API remota. No se documentan optimizaciones adicionales como decodificación especulativa, atención lineal o kernels específicos.

## Capacidades

- Generación de texto conversacional, según el tag conversational del repositorio.
- Generación de texto general (pipeline text-generation).
- Ejecución en el navegador del cliente mediante transformers.js y WebAssembly.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte explícito de agentes ni de razonamiento multi-paso.
- No se documentan capacidades multilingües concretas, pese a que el modelo base Qwen 2.5 es multilingüe.
- No se documentan capacidades de visión, audio ni modo de pensamiento (thinking mode).
- Comportamiento específico del fine-tune Seger: no disponible.

## Casos de uso

- Asistentes embebidos en aplicaciones web: el modelo puede cargarse con transformers.js y responder en el propio navegador, de modo que el texto del usuario nunca sale del dispositivo, lo que resulta adecuado para entornos con requisitos de privacidad.
- Demos y prototipos sin backend: permite publicar un chatbot funcional en una página estática, sin coste de infraestructura ni claves de API, aprovechando el formato ONNX de 4 bits.
- Aplicaciones educativas y de experimentación: sirve para ilustrar el funcionamiento de un transformer y de la cuantización en el aula o en talleres, ya que el modelo es pequeño y ejecutable localmente.
- Preprocesado de texto en el cliente: tareas de resumen corto, reescritura o clasificación ligera antes de enviar datos a un servicio mayor, reduciendo el volumen transmitido.
- Evaluación de fine-tunes antes de desplegar: al tratarse de una exportación del fine-tune Seger, permite comparar su comportamiento frente al modelo base Qwen 2.5 1.5B antes de invertir en infraestructura mayor.
- Aplicaciones de campo o sin conectividad: en escenarios con red intermitente, la inferencia local en el navegador mantiene la funcionalidad básica de generación de texto.
- Pruebas de integración de transformers.js: útil como caso de test para verificar pipelines de carga de modelos ONNX cuantizados en aplicaciones JavaScript.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni de ningún otro conjunto de evaluación, ni comparaciones con el modelo base.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. De forma orientativa, un modelo de 1.5 B en 4 bits ocupa en torno a 0,8-1 GB de pesos, a lo que hay que sumar la caché KV; el repositorio completo ocupa 1.9 GB.
- En GPU: cualquier GPU con más de 2 GB de VRAM debería poder alojarlo. En versiones de precisión completa (fp16) el requisito subiría aproximadamente a 3 GB.
- GPU recomendadas: el formato está pensado para inferencia en cliente, por lo que no requiere aceleradores de centro de datos. No se especifican modelos concretos (no disponible).
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de gama de entrada y medias, e incluso en gráficas integradas con suficiente memoria compartida.
- Ejecución sin GPU: sí, mediante WebAssembly en CPU, que es la ruta principal declarada del repositorio.
- Memoria en navegador: hay que reservar espacio para los 1.9 GB del repositorio en caché o memoria, lo que puede ser limitante en dispositivos móviles.
- Opciones de despliegue: transformers.js en navegador (principal), ONNX Runtime Web y onnxruntime-node en Node.js. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, aunque serían posibles mediante conversión adicional no incluida.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Seger (ONNX) | ~1,5 B | No disponible (base 32.768) | No disponible | ONNX 4 bits | Exportación para navegador; sin benchmarks ni documentación de entrenamiento |
| Qwen 2.5 1.5B | 1,5 B | 32.768 tokens | Apache 2.0 | safetensors | Modelo base oficial; benchmarks publicados por el autor |
| Qwen 2.5 0.5B | 0,5 B | 32.768 tokens | Apache 2.0 | safetensors | Alternativa más ligera de la misma familia |
| Qwen 2.5 3B | 3 B | 32.768 tokens | Qwen Research License | safetensors | Alternativa superior de la misma familia |

Los datos de rendimiento del modelo Seger no están publicados, por lo que la comparación se limita a tamaño, contexto, licencia y formato. No hay información que permita afirmar si el fine-tune mejora o degrada las capacidades del modelo base.

## Limitaciones y advertencias

- Licencia no declarada: el repositorio no especifica condiciones de uso, lo que impide confirmar si se permite el uso comercial. El modelo base Qwen 2.5 1.5B es Apache 2.0, pero el fine-tune y la exportación no heredan necesariamente esa declaración de forma explícita.
- Documentación mínima: la model card se limita a tres líneas; no hay información sobre datos de entrenamiento, evaluación ni comportamiento esperado.
- Riesgo de alucinación: no se ha publicado ninguna evaluación, por lo que se desconoce la tasa de errores factuales del fine-tune.
- Idiomas no documentados: aunque el modelo base es multilingüe, no se especifica qué idiomas conserva el ajuste Seger ni con qué calidad.
- Límite de contexto no verificado: no se confirma que la exportación ONNX mantenga los 32.768 tokens del modelo base, ni cómo se gestiona la caché KV en transformers.js.
- Sin benchmarks: no hay datos que permitan estimar su calidad frente a alternativas ni frente al modelo base.
- Adopción nula: cero descargas y cero likes en el momento de la consulta, sin señales de validación por parte de la comunidad.
- Restricciones de memoria en cliente: 1.9 GB de repositorio pueden ser inviables en navegadores móviles o dispositivos con poca RAM.
- Fecha de creación poco habitual en los metadatos (2026), lo que conviene verificar antes de tratarlo como un artefacto estable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sirsqm/seger-qwen2.5-1.5b-onnx
- Modelo base del que deriva: https://huggingface.co/sirsqm/seger-qwen2.5-1.5b
- Modelo original Qwen 2.5 1.5B: https://huggingface.co/Qwen/Qwen2.5-1.5B
- Librería de inferencia declarada: https://github.com/huggingface/transformers.js
- Los resultados de búsqueda web disponibles no contienen enlaces relevantes al modelo: todas las entradas devueltas corresponden a LibreView, un servicio de gestión de diabetes de Abbott, sin relación con este repositorio.
