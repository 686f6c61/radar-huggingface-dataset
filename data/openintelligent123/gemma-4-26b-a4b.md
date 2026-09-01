# Openintelligent123/gemma-4-26B-A4B

## Resumen

El modelo **gemma-4-26B-A4B** es una variante de la familia Gemma 4 desarrollada por Google DeepMind, publicada originalmente en el repositorio `google/gemma-4-26B-A4B`. Este repositorio concreto (`Openintelligent123/gemma-4-26B-A4B`) es una copia alojada por un tercero, pero los pesos y la arquitectura corresponden al modelo oficial. Se trata de un modelo multimodal (texto e imagen) con arquitectura de mezcla de expertos (MoE) que activa solo 3.800 millones de parámetros de un total de 25.800 millones, lo que permite un equilibrio entre capacidad y eficiencia computacional. Su ventana de contexto alcanza los 256.000 tokens, y está diseñado para tareas de razonamiento, generación de código, agentes autónomos y comprensión visual.

La relevancia de este modelo radica en su combinación de bajo coste de inferencia (gracias al MoE) con capacidades avanzadas: soporte nativo de *function calling*, modo de pensamiento configurable, atención híbrida con ventana deslizante y atención global, y decodificación especulativa mediante un modelo auxiliar. Está disponible bajo licencia Apache 2.0, lo que facilita su uso comercial y su integración en entornos de producción. Aunque el repositorio actual no incluye métricas de rendimiento publicadas, la familia Gemma 4 ha sido posicionada por Google como una alternativa abierta de alto rendimiento frente a otros modelos propietarios.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con mezcla de expertos (MoE) y atención híbrida (sliding window + global) |
| Parametros totales | 25.805.936.206 (25,8B) |
| Parametros activos | 3.800 millones (3,8B) |
| Longitud de contexto | 256.000 tokens |
| Tipos de cuantizacion | No especificados en la información disponible (el repositorio contiene pesos en safetensors) |
| Idiomas soportados | Más de 140 (según la model card oficial) |
| Licencia | Apache 2.0 (con enlace a la licencia específica de Gemma 4) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de transformer decoder-only con mezcla de expertos (MoE). Según la model card, la configuración de expertos es de 8 activos, 128 totales y 1 experto compartido. La atención es híbrida: intercala capas con ventana deslizante local (1024 tokens) con capas de atención global, garantizando que la última capa sea siempre global. Para optimizar la memoria en contextos largos, las capas globales comparten claves y valores (unified Keys and Values) y aplican *Proportional RoPE* (p-RoPE). El modelo incluye un codificador de visión de aproximadamente 550 millones de parámetros para procesar imágenes.

No se han publicado detalles específicos sobre el conjunto de datos de entrenamiento, el número de tokens procesados ni el uso de técnicas como RLHF o DPO. La model card indica que existen variantes pre-entrenadas y ajustadas por instrucciones, y que todos los modelos de la familia Gemma 4 incorporan un modelo auxiliar para decodificación especulativa (multi-token prediction), lo que acelera la inferencia sin pérdida de calidad. Tampoco se especifica si se aplicó algún método de alineación adicional.

## Capacidades

- Generación de texto y razonamiento complejo, con modo de pensamiento configurable (thinking mode) que permite activar o desactivar cadenas de razonamiento explícitas.
- Comprensión de imágenes: entrada multimodal con soporte de resolución y relación de aspecto variables, útil para tareas de descripción, respuesta a preguntas visuales y análisis de documentos.
- Soporte nativo de *function calling* (llamada a funciones), lo que permite integrar el modelo en flujos de agentes autónomos que interactúan con APIs y herramientas externas.
- Capacidades agénticas: puede ejecutar tareas de múltiples pasos, planificar y utilizar herramientas de forma secuencial.
- Multilingüismo: soporte de más de 140 idiomas, aunque no se detalla la lista exacta.
- Soporte nativo del rol `system` en el prompt, lo que facilita la configuración de comportamiento y restricciones en conversaciones estructuradas.
- Decodificación especulativa integrada mediante un modelo auxiliar, que reduce la latencia de generación sin afectar a la calidad.

## Casos de uso

- **Asistentes virtuales multimodales**: el modelo puede procesar imágenes y texto simultáneamente, por ejemplo, para ayudar a usuarios a identificar objetos en fotografías o leer capturas de pantalla, manteniendo conversaciones de contexto largo gracias a sus 256K tokens de ventana.
- **Automatización de atención al cliente**: con soporte de *function calling*, puede consultar bases de conocimiento, gestionar tickets o realizar acciones en sistemas CRM, manejando diálogos multi-turno con historial extenso.
- **Generación y revisión de código en entornos de producción**: su capacidad de razonamiento y su soporte de herramientas permiten integrarlo en pipelines de CI/CD para generar tests, revisar pull requests o autocompletar fragmentos de código, con la ventaja de un coste de inferencia reducido por ser MoE.
- **Análisis de documentos técnicos y científicos**: al aceptar imágenes, puede extraer información de figuras, gráficos y tablas en papers, combinando la comprensión visual con el razonamiento textual para resumir o responder preguntas sobre el contenido.
- **Agentes autónomos de investigación**: el modelo puede planificar búsquedas, consultar APIs, leer resultados y sintetizar conclusiones, gracias a su ventana de contexto amplia y su capacidad de razonamiento multi-paso.
- **Traducción y localización**: con soporte de más de 140 idiomas, puede traducir textos largos manteniendo coherencia contextual, y además interpretar imágenes con texto incrustado (por ejemplo, carteles o menús) para traducirlos en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona "mejoras notables en benchmarks de código" y "capacidades agénticas mejoradas", pero no proporciona cifras concretas. Tampoco se incluyen comparativas con otros modelos en el repositorio ni en los resultados de búsqueda. Por tanto, no es posible presentar una tabla de rendimiento verificada.

## Requisitos de hardware

- El tamaño del repositorio es de 51,6 GB, lo que sugiere que los pesos están almacenados en precisión fp32 o bf16. Para inferencia en fp16/bf16 se necesitarían aproximadamente 52 GB de VRAM, lo que supera la capacidad de la mayoría de GPUs de consumo.
- Al ser un modelo MoE con solo 3,8B parámetros activos, la memoria necesaria para los cálculos por token es mucho menor que la de un modelo denso equivalente, pero los pesos totales deben cargarse en memoria. Con cuantización a 8 bits, el modelo ocuparía unos 26 GB, y a 4 bits unos 13 GB, lo que permitiría ejecutarlo en GPUs como la RTX 4090 (24 GB) o la RTX 3090 (24 GB) con cuantización int8, o en GPUs de 16 GB con cuantización int4.
- Para despliegue en servidores, se recomiendan GPUs como A100 (40/80 GB) o H100 (80 GB) si se desea usar precisión completa o bf16. También es posible utilizar soluciones como vLLM, TGI o llama.cpp (con conversión a GGUF) para optimizar la inferencia.
- No se dispone de datos de latencia o throughput específicos para este modelo. La decodificación especulativa integrada debería reducir la latencia en comparación con una generación autoregresiva estándar, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Modalidades |
|---|---|---|---|---|---|
| gemma-4-26B-A4B (este) | 25,8B | 3,8B | 256K | Apache 2.0 | Texto, imagen |
| Mixtral 8x7B | 46,7B | 12,9B | 32K | Apache 2.0 | Texto |
| Qwen2.5-MoE | 14,3B | 2,7B | 128K | Apache 2.0 | Texto |
| DeepSeek-V2-Lite | 16B | 2,4B | 128K | MIT | Texto |

La comparativa se limita a parámetros, contexto, licencia y modalidades, ya que no hay datos de rendimiento disponibles. Gemma 4 26B A4B destaca por su ventana de contexto de 256K, muy superior a la de Mixtral, y por su naturaleza multimodal, que no está presente en los otros modelos comparados. Su número de parámetros activos (3,8B) es intermedio entre Qwen2.5-MoE y Mixtral, lo que sugiere un equilibrio entre capacidad y eficiencia, aunque sin benchmarks no se puede confirmar su rendimiento relativo.

## Limitaciones y advertencias

- No se han documentado sesgos específicos para este modelo, pero al ser un modelo entrenado con datos web, es probable que herede sesgos sociales, culturales y de género presentes en dichos datos.
- Riesgo de alucinación, especialmente en tareas de razonamiento visual o cuando se le pide interpretar imágenes ambiguas o de baja calidad.
- La ventana de contexto de 256K es amplia, pero el rendimiento en contextos muy largos puede degradarse si no se gestiona adecuadamente la memoria; se recomienda probar con casos reales.
- El repositorio actual (`Openintelligent123/gemma-4-26B-A4B`) es una copia de un tercero, no el repositorio oficial de Google. Aunque los pesos parecen coincidir con los del modelo oficial, se recomienda verificar la integridad de los archivos y descargar desde la fuente oficial (`google/gemma-4-26B-A4B`) para entornos de producción.
- La licencia Apache 2.0 permite uso comercial, pero es necesario revisar los términos específicos de la licencia de Gemma 4 (enlazada en la model card) para asegurar el cumplimiento, especialmente en lo relativo a marcas, atribución y restricciones de uso.
- No se proporcionan detalles sobre el proceso de alineación (RLHF, DPO, etc.), por lo que el comportamiento del modelo en tareas delicadas puede ser menos predecible que en modelos con alineación documentada.

## Enlaces

- Repositorio HuggingFace: [Openintelligent123/gemma-4-26B-A4B](https://huggingface.co/Openintelligent123/gemma-4-26B-A4B)
- Repositorio oficial de Google: [google/gemma-4-26B-A4B](https://huggingface.co/google/gemma-4-26B-A4B)
- Colección oficial de Gemma 4 en HuggingFace: [google/gemma-4](https://huggingface.co/collections/google/gemma-4)
- GitHub de Google Gemma: [google-gemma](https://github.com/google-gemma)
- Blog de lanzamiento: [Google Developers Blog - Gemma 4](https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/)
- Documentación oficial: [Google AI for Developers - Gemma 4](https://ai.google.dev/gemma/docs/core)
- Technical report (arXiv): [arxiv:2607.02770](https://arxiv.org/abs/2607.02770)
- Licencia específica de Gemma 4: [Gemma 4 License](https://ai.google.dev/gemma/docs/gemma_4_license)
