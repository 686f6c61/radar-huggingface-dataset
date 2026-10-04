# Nanami231/m-shinhi

## Resumen

m-shinhi es un adaptador LoRA de tipo DreamBooth para generación de imágenes texto-a-imagen, desarrollado por el usuario Nanami231 (también conocido como DukeLe en HuggingFace). Está entrenado sobre Krea 2 RAW (krea/Krea-2-Raw) y sus muestras se han generado sobre Krea 2 Turbo, la variante destilada del mismo modelo base. Se trata, por tanto, de un adaptador de bajo rango que no funciona de forma autónoma: requiere cargar los pesos del modelo Krea 2 y aplicar encima los pesos de este LoRA mediante la librería diffusers.

El adaptador introduce un concepto concreto, invocado mediante el token `M@shiNhi`, que según los ejemplos de la model card se manifiesta como un emblema o inscripción que aparece integrado en escenas muy distintas (un guerrero cyborg, un autómata con forma de búho, un dirigible steampunk). El repositorio ocupa 1,6 GB, se distribuye bajo licencia Apache 2.0 y se publicó el 4 de octubre de 2026, sin descargas ni valoraciones registradas en el momento de la consulta.

Su relevancia práctica es limitada y muy específica: sirve para incorporar un elemento gráfico concreto en flujos de generación de imagen basados en Krea 2, con inferencia rápida gracias al uso de Krea 2 Turbo con tan solo 8 pasos y `guidance_scale=0.0`. No es un modelo de lenguaje, no procesa texto como tarea principal y no dispone de datos publicados sobre su dataset de entrenamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) sobre el modelo de difusión texto-a-imagen Krea 2 (base: krea/Krea-2-Raw) |
| Parametros totales | no disponible (el repositorio ocupa 1,6 GB e incluye pesos del adaptador y muestras) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo texto-a-imagen) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (los prompts de ejemplo de la model card están en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible en la información proporcionada (se carga mediante `load_lora_weights` de diffusers) |

## Arquitectura y entrenamiento

El modelo es un LoRA de DreamBooth, una técnica de ajuste eficiente por parámetros que congela los pesos del modelo base y entrena matrices de bajo rango que se suman a determinadas capas. El entrenamiento se realizó sobre Krea 2 RAW, la variante no destilada de la familia Krea 2, y las muestras publicadas se han generado aplicando el adaptador sobre Krea 2 Turbo. El token de activación es `M@shiNhi` y el `instance_prompt` declarado en los metadatos coincide con ese mismo token.

No se especifican en la model card el número de imágenes de entrenamiento, el número de pasos, el rango del LoRA, la tasa de aprendizaje ni la composición del dataset. Tampoco se documenta si hubo regularización, uso de imágenes de clase negativa o cualquier otra técnica de estabilización. La única referencia operativa es el ejemplo de inferencia: 8 pasos con Krea 2 Turbo y `guidance_scale=0.0`, lo que indica un flujo de generación de muy baja latencia típico de modelos destilados.

## Capacidades

- Generación de imágenes texto-a-imagen condicionada por el token `M@shiNhi`.
- Introducción de un emblema o inscripción con el texto "M@shiNhi" en escenas arbitrarias, según los ejemplos publicados.
- Compatibilidad con el pipeline `Krea2Pipeline` de diffusers mediante `pipe.load_lora_weights(...)`.
- Inferencia rápida en combinación con Krea 2 Turbo: 8 pasos y `guidance_scale=0.0`.
- Aplicación del concepto sobre estilos variados (cyberpunk, steampunk, ilustración victoriana) sin que el LoRA parezca restringido a un único dominio visual.
- No dispone de soporte de tool calling ni de function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No hay información sobre capacidades multilingües; los prompts de ejemplo están en inglés.

## Casos de uso

- Branding y marketing: generar visuales de campaña en los que aparezca el emblema "M@shiNhi" integrado de forma coherente en escenas temáticas, evitando el trabajo manual de composición gráfica.
- Concept art para videojuegos: producir variaciones de un mismo símbolo o facción sobre entornos distintos (ciudades lluviosas, paisajes aéreos, interiores históricos) para explorar dirección artística.
- Ilustración editorial y portadas: incorporar una marca o sello reconocible en ilustraciones de estilo steampunk o retrofuturista sin recurrir a retoque posterior.
- Prototipado de merchandising: generar mockups rápidos de productos (pósteres, camisetas, carcasas) con el emblema aplicado antes de invertir en producción real.
- Creación de contenido para redes sociales: alimentar un pipeline automatizado con diffusers que genere imágenes de forma masiva con una identidad visual consistente, aprovechando los 8 pasos de Krea 2 Turbo para reducir coste por imagen.
- Integración en pipelines de generación por lotes: cargar el LoRA sobre Krea 2 Turbo en un servicio interno y exponerlo vía API para que otros equipos generen activos con la marca sin conocer los detalles del adaptador.
- Exploración de estilo sobre un modelo base concreto: probar cómo se comporta el concepto al cambiar de variante (RAW frente a Turbo) o al modificar la escala de guiado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente incluye tres imágenes de muestra generadas con Krea 2 Turbo a 8 pasos, sin métricas objetivas (FID, CLIP score, similitud con el concepto, etc.) ni comparaciones cuantitativas.

## Requisitos de hardware

- El adaptador LoRA por sí solo ocupa 1,6 GB de repositorio, pero no puede ejecutarse sin cargar previamente los pesos de Krea 2 (RAW o Turbo).
- VRAM para inferencia: no disponible en la información proporcionada; depende íntegramente del modelo base Krea 2 y de la precisión usada (`torch.bfloat16` en el ejemplo oficial).
- GPU recomendadas: no disponible. El ejemplo de la model card emplea `torch_dtype=torch.bfloat16` y `.to("cuda")`, sin especificar modelo de GPU.
- Compatibilidad con GPU de consumo: no confirmada; depende de los requisitos de Krea 2 Turbo, no del LoRA.
- Opciones de despliegue: diffusers es la vía documentada (`Krea2Pipeline` + `load_lora_weights`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que en cualquier caso no aplican a un modelo de difusión.
- Latencia y throughput estimados: no disponibles. El uso de 8 pasos de inferencia con Krea 2 Turbo sugiere una latencia baja en comparación con modelos no destilados, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Contexto / tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nanami231/m-shinhi | LoRA DreamBooth | krea/Krea-2-Raw | Texto-a-imagen con token `M@shiNhi` | Apache 2.0 | HuggingFace, 0 descargas |
| krea/Krea-2-Raw | Modelo de difusión completo | — | Texto-a-imagen | no disponible en la información proporcionada | HuggingFace (referenciado como base) |
| krea/Krea-2-Turbo | Modelo de difusión destilado | — | Texto-a-imagen, inferencia en pocos pasos | no disponible en la información proporcionada | HuggingFace (usado en los ejemplos) |

No se dispone de otros LoRA comparables de la misma categoría en la información proporcionada. Los resultados de la búsqueda web corresponden a modelos homónimos o no relacionados (LoRAs de personajes sobre SD 1.5 en TensorHub Art y SeaArt), por lo que no son válidos como término de comparación técnica.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al ser un LoRA entrenado sobre un dataset no publicado, se heredan los sesgos del modelo base Krea 2 y los del conjunto de imágenes de entrenamiento, que se desconoce por completo.
- Riesgo de alucinación: en modelos de difusión se traduce en artefactos visuales, texto mal renderizado o estructura anatómica incorrecta. El propio token contiene un carácter especial (`@`), lo que puede provocar que la inscripción "M@shiNhi" se genere deformada o incompleta.
- Posible sobreajuste del concepto: no se documenta si el LoRA se activa únicamente con el trigger o si filtra el concepto en prompts sin el token `M@shiNhi`.
- Limitaciones de idioma: los tres prompts de ejemplo están en inglés; no hay evidencia de que el adaptador funcione igual de bien con prompts en castellano, aunque el comportamiento dependa principalmente del codificador de texto del modelo base.
- Restricciones de licencia: el adaptador se publica bajo Apache 2.0, lo que en principio permite uso comercial. No obstante, el uso comercial está condicionado por la licencia del modelo base Krea 2, que no se detalla en la información disponible y debe verificarse por separado.
- Ausencia de validación comunitaria: el modelo registra 0 descargas y 0 likes, sin retroalimentación de terceros que confirme la calidad o la estabilidad del adaptador.
- Documentación insuficiente para producción: no se especifican datos de entrenamiento, hiperparámetros, rango del LoRA ni evaluación cuantitativa, lo que dificulta estimar su robustez antes de integrarlo en un flujo real.
- La model card no indica el formato exacto de los pesos más allá de su compatibilidad con diffusers.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Nanami231/m-shinhi
- Perfil del autor: https://huggingface.co/Nanami231
- Modelo base Krea 2 RAW: https://huggingface.co/krea/Krea-2-Raw
- Otro modelo del mismo autor: https://huggingface.co/Nanami231/nh-v
