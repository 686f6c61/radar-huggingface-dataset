# mradermacher/Scalpel-VL-1.6B-Animal-GGUF

## Resumen

Scalpel-VL-1.6B-Animal-GGUF es una colección de cuantizaciones GGUF del modelo Scalpel-VL-1.6B-Animal, desarrollado por freeai-org y cuantizado por mradermacher. El modelo base es un sistema multimodal (visión-lenguaje) de aproximadamente 1.270 millones de parámetros, obtenido mediante poda estructural capa a capa de un modelo más grande usando la técnica Scalpel, que elimina capas y realiza un entrenamiento de recuperación ligero tras cada eliminación. Esta cuantización permite ejecutar el modelo en hardware con recursos limitados, manteniendo un equilibrio entre tamaño y calidad.

La relevancia actual radica en la creciente demanda de modelos multimodales pequeños y eficientes para despliegue en dispositivos edge, aplicaciones móviles y entornos con restricciones de VRAM. Al estar disponible en múltiples niveles de cuantización (desde Q2_K hasta f16), ofrece flexibilidad para distintos escenarios de inferencia. El modelo soporta inglés y chino, y su licencia MIT facilita su uso comercial sin restricciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal, probablemente transformer con encoder de visión y decoder de lenguaje) |
| Parametros totales | 1.267.550.976 (aprox. 1,27B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; además mmproj-Q8_0 y mmproj-f16 para el proyector multimodal |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | GGUF (el modelo base usa safetensors) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base. Por su naturaleza multimodal (incluye un proyector multimodal, mmproj), se infiere que combina un encoder de visión con un decoder de lenguaje, probablemente basado en transformer. El modelo Scalpel-VL-1.6B-Animal se obtiene mediante poda estructural de un modelo más grande, utilizando la herramienta Scalpel, que elimina una capa por ronda y realiza un entrenamiento de recuperación ligero para mitigar la pérdida de rendimiento. No se han publicado datos sobre el dataset de entrenamiento, el número de tokens procesados ni el uso de técnicas como RLHF o DPO.

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Comprensión de imágenes (entrada visual) gracias al proyector multimodal incluido en los archivos mmproj.
- Razonamiento básico sobre contenido visual, adecuado para tareas de descripción y respuesta a preguntas sobre imágenes.
- No se ha confirmado soporte para tool calling, function calling, agentes o razonamiento multi-paso.
- No se ha confirmado modo de pensamiento extendido (thinking mode) ni capacidades de audio.

## Casos de uso

- Descripción de imágenes en dispositivos edge: el modelo puede ejecutarse en una Raspberry Pi o un smartphone gracias a su pequeño tamaño (menos de 1 GB en cuantización Q4_K_M), permitiendo generar descripciones de fotografías sin conexión a internet.
- Asistencia a personas con discapacidad visual: integrado en una aplicación móvil, puede narrar el contenido de imágenes capturadas por la cámara en tiempo real, con soporte para inglés y chino.
- Moderación de contenido visual: análisis de imágenes en flujos de trabajo automatizados para detectar contenido inapropiado, usando la cuantización Q8_0 para mayor fidelidad en entornos con GPU dedicada.
- Etiquetado automático de imágenes en sistemas de gestión documental: el modelo puede generar metadatos descriptivos para archivos de imagen, facilitando su búsqueda y clasificación.
- Chatbots bilingües con soporte visual: integración en un asistente virtual que responde preguntas sobre imágenes enviadas por el usuario, aprovechando su naturaleza conversacional y su licencia MIT para uso comercial.
- Prototipado rápido de aplicaciones de visión por computador: investigadores pueden validar ideas de interacción multimodal sin necesidad de infraestructura costosa, gracias a la compatibilidad con llama.cpp y Ollama.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras pruebas estandarizadas para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 0,7 GB (Q2_K) y 2,6 GB (f16) para el modelo de lenguaje, más 0,5-0,9 GB para el proyector multimodal (mmproj). En total, la cuantización Q4_K_M con mmproj Q8_0 requiere aproximadamente 1,4 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, o incluso iGPU con suficiente memoria compartida). Para las cuantizaciones más altas (Q8_0, f16) se recomienda una GPU con 4 GB o más.
- Cabe en GPUs de consumo: sí, todas las cuantizaciones caben en GPUs de gama baja y media. Incluso puede ejecutarse en CPU con llama.cpp, aunque con mayor latencia.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y cualquier runtime compatible con GGUF (por ejemplo, text-generation-webui). También es compatible con la librería transformers mediante conversión a safetensors si se usa el modelo base.
- Latencia y throughput: no se han publicado mediciones oficiales. En una GPU RTX 3060, se estima una velocidad de generación de 20-40 tokens por segundo con cuantización Q4_K_M, pero estos valores son orientativos y dependen de la implementación.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable con otros modelos de la misma categoría (modelos VL pequeños). El modelo base Scalpel-VL-1.6B-Animal no tiene competidores directos documentados en el ecosistema GGUF. Se puede comparar con el propio modelo base sin cuantizar (freeai-org/Scalpel-VL-1.6B-Animal) en términos de tamaño y formato, pero no hay datos de rendimiento relativos.

## Limitaciones y advertencias

- Al ser una cuantización, puede haber pérdida de calidad respecto al modelo original en precisión numérica, especialmente en las versiones Q2_K y Q3_K.
- El modelo es pequeño (1,27B parámetros), por lo que su capacidad de razonamiento complejo, matemáticas avanzadas o generación de código es limitada en comparación con modelos de mayor tamaño.
- No se ha documentado el comportamiento ante sesgos o alucinaciones; al ser un modelo multimodal, puede generar descripciones inexactas de imágenes ambiguas.
- La longitud de contexto no está especificada; se recomienda no exceder 2048 tokens para evitar degradación, aunque este valor es una estimación conservadora.
- El soporte de idiomas se limita a inglés y chino; no se garantiza un rendimiento adecuado en otros idiomas.
- La licencia MIT permite uso comercial sin restricciones, pero el usuario debe verificar que el modelo base (freeai-org/Scalpel-VL-1.6B-Animal) también cumple con los requisitos de su proyecto, ya que la cuantización no modifica la licencia original.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Scalpel-VL-1.6B-Animal-GGUF
- Modelo base: https://huggingface.co/freeai-org/Scalpel-VL-1.6B-Animal
- Repositorio de la herramienta Scalpel: https://github.com/freeai-org/Scalpel
- Página de mradermacher en Hugging Face: https://huggingface.co/mradermacher
- Guía de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
