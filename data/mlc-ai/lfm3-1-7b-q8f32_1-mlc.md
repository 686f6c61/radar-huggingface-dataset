# mlc-ai/LFM3-1.7B-q8f32_1-MLC

## Resumen

LFM3-1.7B-q8f32_1-MLC es una conversión al formato MLC (Machine Learning Compilation) del modelo LiquidAI/LFM3-1.7B, publicada por el equipo de mlc-ai. No se trata de un modelo entrenado desde cero, sino de un artefacto de despliegue: los pesos originales de LiquidAI se reconvierten a la cuantización `q8f32_1` y se compilan con `mlc_llm` para su ejecución en el runtime MLC-LLM, con especial orientación a WebLLM (inferencia en navegador mediante WebGPU). El modelo base pertenece a la familia LFM3 de Liquid AI, de 1.700 millones de parámetros.

La relevancia de esta conversión es práctica: permite ejecutar un modelo de 1,7B en el navegador sin dependencia de `shader-f16`, ya que esta variante en coma flotante de 32 bits no requiere la extensión de shaders de media precisión. El repositorio ocupa 1,9 GB y está compilado para una ventana de contexto de 262.144 tokens con fragmentos de prefill de 256 tokens, aunque la propia model card recomienda limitar el contexto a 4.096 tokens en WebLLM.

La información publicada por el autor es muy escasa: no se detallan idiomas, benchmarks ni composición del entrenamiento. Todo lo que sigue se limita a lo que consta en la model card y en los metadatos del repositorio, marcando explícitamente como "no disponible" aquello que no se ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LiquidAI/LFM3-1.7B; la model card de la conversion no detalla la arquitectura) |
| Parametros totales | 1,7 mil millones (según el nombre del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens en la compilación MLC; 4.096 tokens recomendados en WebLLM |
| Tipos de cuantizacion | q8f32_1 (cuantización MLC con acumulación en float32) |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (identificador `lfm1.0`, etiquetada como "other") |
| Formato de pesos | MLC (artefacto compilado para MLC-LLM/WebLLM; no safetensors ni GGUF) |

## Arquitectura y entrenamiento

La model card de esta conversión no describe la arquitectura interna del modelo base. Lo único verificable es que se trata de un transformer de 1,7B parámetros de la familia LFM3 de Liquid AI, y que la conversión se realizó con `mlc_llm convert_weight` aplicando la cuantización `q8f32_1` sobre CPU, seguida de `mlc_llm gen_config` con la plantilla de conversación `lfm3`, ventana de contexto de 262.144 tokens y tamaño de fragmento de prefill de 256 tokens. El artefacto incluye un archivo `mlc-build-info.json` que registra las identidades de los ficheros y la procedencia del compilador WebGPU.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se documentan innovaciones técnicas del modelo base en esta ficha. Cualquier afirmación sobre la arquitectura (atención lineal, híbrida, MoE u otra) requeriría consultar la model card original de LiquidAI/LFM3-1.7B, que no forma parte de la información proporcionada.

## Capacidades

- Generación de texto: el pipeline declarado es `text-generation`.
- Conversación multi-turno: la conversión incluye la plantilla de chat `lfm3`, lo que indica soporte de formato conversacional.
- Contexto largo: compilado para 262.144 tokens, aunque con recomendación de uso a 4.096 tokens en WebLLM.
- Ejecución en navegador: compatible con WebLLM sobre WebGPU, sin necesidad de `shader-f16` gracias a la variante float32.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el campo de idiomas del repositorio está vacío.
- Capacidades especiales (visión, audio, modo thinking): no disponible en la información proporcionada.

## Casos de uso

- Inferencia en navegador sin instalación: el artefacto está compilado para WebLLM, de modo que una aplicación web puede cargar el modelo vía WebGPU y ejecutar generación de texto en el cliente, sin servidor ni backend de GPU. Es adecuado por su tamaño de 1,9 GB y por no requerir `shader-f16`.
- Asistentes de texto en aplicaciones web con privacidad por diseño: al ejecutarse en el dispositivo del usuario, los prompts no salen del navegador; útil para borradores, resúmenes o reescritura sobre contenido sensible.
- Prototipado rápido de chatbots: la plantilla `lfm3` y el contexto configurable permiten montar un chat multi-turno en local con MLC-LLM antes de decidir un despliegue en servidor.
- Pruebas de compatibilidad WebGPU: sirve como modelo de referencia para validar que un entorno (navegador, driver, GPU integrada) soporta la pila MLC-LLM/WebLLM con cuantización de 8 bits y acumulación float32.
- Generación de texto offline en escritorio: mediante el runtime MLC-LLM nativo, el mismo artefacto puede ejecutarse en CPU o GPU local para tareas de generación acotadas, con contexto limitado a la ventana recomendada.
- Educación y demos técnicas: al ser un artefacto reproducible (los comandos de conversión están documentados), resulta útil para talleres sobre compilación de modelos y cuantización MLC.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 1,9 GB en disco; en ejecución, un modelo de 1,7B en cuantización de 8 bits con acumulación float32 requiere del orden de 2 GB de memoria, más overhead del runtime y de la caché KV, que crece con el contexto. No se publican cifras oficiales.
- GPU recomendadas: no disponible. Al estar orientado a WebGPU, el requisito real es un navegador con WebGPU habilitado y una GPU compatible.
- Compatibilidad con GPU de consumo: previsiblemente sí, dado el tamaño, pero no se confirma en la documentación.
- Opciones de despliegue: MLC-LLM (runtime nativo) y WebLLM (navegador). No se distribuyen pesos en GGUF, por lo que llama.cpp u Ollama no son aplicables directamente a este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| LFM3-1.7B-q8f32_1-MLC | 1,7B | 262.144 (4.096 recomendado en WebLLM) | MLC | LFM Open License v1.0 | Conversión de despliegue, no modelo original |
| LiquidAI/LFM3-1.7B | 1,7B | no disponible en esta ficha | safetensors (presumible) | LFM Open License v1.0 | Modelo base original; consultar su model card |
| Otras conversiones MLC de modelos ~1-2B | variable | variable | MLC | variable | No se dispone de datos comparativos en la información proporcionada |

No se dispone de datos de benchmarks que permitan una comparación de rendimiento con alternativas.

## Limitaciones y advertencias

- Este repositorio es una conversión de formato, no un modelo entrenado; sus capacidades son las del modelo base LiquidAI/LFM3-1.7B.
- La ventana de 262.144 tokens es la compilada, pero la recomendación explícita para WebLLM es de 4.096 tokens; usar contextos mayores puede degradar el rendimiento o agotar memoria en el navegador.
- La variante float32 evita la dependencia de `shader-f16`, pero a costa de mayor uso de memoria y posible menor throughput frente a variantes de media precisión.
- No se documentan idiomas soportados, sesgos, tasas de alucinación ni limitaciones idiomáticas.
- Licencia LFM Open License v1.0: es necesario revisar los términos del archivo LICENSE antes de cualquier uso comercial; la licencia se etiqueta como "other", no como Apache o MIT.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que sugiere poca validación comunitaria de este artefacto concreto.
- No hay datos publicados de benchmarks, latencia ni throughput; cualquier decisión de producción debería basarse en una evaluación propia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mlc-ai/LFM3-1.7B-q8f32_1-MLC
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Revisión fijada del modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B/tree/1da06bec6a819da10b54c67e5c90972b46d81871
- Licencia (LFM Open License v1.0): archivo LICENSE del repositorio
- MLC-LLM: no se proporciona enlace en la información disponible
- WebLLM: no se proporciona enlace en la información disponible
