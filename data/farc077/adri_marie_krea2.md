# farc077/Adri_Marie_KREA2

## Resumen

Adri_Marie_KREA2 es un adaptador LoRA de tipo text-to-image publicado por el usuario farc077 en Hugging Face. Se trata de un LoRA de identidad (etiquetado como ONESHOTLORA) entrenado sobre el modelo base krea/Krea-2-Raw, cuyo objetivo es reproducir el rostro y la apariencia de la creadora de contenido y música Adri Marie en imágenes generadas por IA. El repositorio es de tipo adapter, no un modelo completo: requiere cargar Krea-2-Raw como base para funcionar.

El modelo se generó mediante la plataforma oneshotlora.com, un servicio que automatiza el entrenamiento de LoRAs de identidad a partir de un conjunto reducido de imágenes de referencia. El repositorio ocupa 0,2 GB, lo que es coherente con un adaptador LoRA de rango bajo y no con un modelo de pesos completos. Se publicó el 16 de noviembre de 2026 y, en el momento de la consulta, no registra descargas ni likes.

Su relevancia es acotada y de nicho: sirve para personalización de identidad en flujos de generación de imágenes (por ejemplo, ilustraciones de marca personal de la creadora). No es un modelo de lenguaje, no procesa texto de forma generativa ni ofrece capacidades de razonamiento, código o agentes, por lo que las secciones de esta ficha relativas a esas capacidades se marcan como no aplicables o no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo de difusión text-to-image; arquitectura del adaptador no detallada |
| Parámetros totales | no disponible (adaptador LoRA; tamaño de repo 0,2 GB) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo text-to-image, no de lenguaje) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (el prompt de texto se procesa en el idioma que soporte el modelo base Krea-2-Raw) |
| Licencia | other (licencia no estándar; condiciones no detalladas en la información disponible) |
| Formato de pesos | no disponible (repo de 0,2 GB; presumiblemente safetensors de LoRA, sin confirmar) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del adaptador. Por la etiqueta ONESHOTLORA y la referencia a oneshotlora.com, se trata de un LoRA de identidad entrenado con un conjunto pequeño de imágenes de la persona objetivo, un enfoque habitual para capturar rasgos faciales y estilo sin reentrenar el modelo base. El adaptador se aplica sobre krea/Krea-2-Raw, un modelo de difusión text-to-image, y modifica sus pesos de forma aditiva durante la inferencia.

No se especifican en la información proporcionada el número de imágenes de entrenamiento, el número de pasos, el rango del LoRA, la tasa de aprendizaje ni si se aplicaron técnicas adicionales como regularización o data augmentation. Tampoco hay datos sobre el proceso de curación del dataset ni sobre evaluación cuantitativa del adaptador.

## Capacidades

- Generación de imágenes text-to-image condicionada por el modelo base Krea-2-Raw, con personalización de la identidad de Adri Marie.
- Control de vestuario, entorno y pose mediante prompts descriptivos en lenguaje natural, como muestran los ejemplos de la model card (camisa blanca formal con blazer negro en una oficina; vestido rosa pastel con cárdigan azul en un campo de hierba; camiseta blanca con vaqueros azules ante una pared).
- Palabra de activación dedicada: 4DR1M, necesaria para invocar la identidad entrenada.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües propias; depende del codificador de texto del modelo base.
- No dispone de modo thinking, visión, audio ni otras capacidades multimodales más allá de la generación de imágenes.

## Casos de uso

- Ilustración de marca personal: generar retratos consistentes de la creadora para portadas, avatares y material promocional, invocando 4DR1M en el prompt y describiendo vestuario y escenario.
- Contenido para redes sociales: producir variaciones de una misma figura en distintos entornos (oficina, exterior, estudio) manteniendo el parecido facial gracias al adaptador de identidad.
- Maquetas de vestuario: probar combinaciones de ropa sobre la identidad entrenada (por ejemplo, camisa formal con blazer o vestido pastel) para previsualizar estilismos antes de una sesión fotográfica real.
- Storyboards y narrativa visual: crear secuencias de imágenes con el mismo personaje en escenas distintas, útil para cómics, presentaciones o vídeos con consistencia de personaje.
- Promoción musical: generar arte de portada y material gráfico para lanzamientos, dado que el modelo está asociado a una música y creadora de contenido.
- Pruebas de concepto en pipelines de difusión: integrar el LoRA en ComfyUI (los ejemplos de la model card parecen generados con ComfyUI) para evaluar personalización de identidad sobre Krea-2-Raw antes de escalar a producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica; depende enteramente del modelo base Krea-2-Raw y de la precisión utilizada. El adaptador en sí ocupa 0,2 GB.
- GPU recomendadas: no disponible en la información proporcionada; vendrán determinadas por los requisitos de Krea-2-Raw.
- Compatibilidad con GPU de consumo: no confirmada; depende del modelo base.
- Opciones de despliegue: los ejemplos de la model card apuntan a ComfyUI; no se documentan otras opciones (vLLM, llama.cpp, Ollama o TGI no aplican a un modelo de difusión de este tipo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Adri_Marie_KREA2 | LoRA de identidad text-to-image | krea/Krea-2-Raw | no disponible (repo 0,2 GB) | no aplica | other | Hugging Face, 0 descargas |
| LoRA de identidad genérico (oneshotlora.com) | LoRA de identidad text-to-image | variable | no disponible | no aplica | variable | plataforma oneshotlora.com |
| Krea-2-Raw (modelo base) | Modelo de difusión text-to-image | no aplica | no disponible | no aplica | no disponible | Hugging Face (krea/Krea-2-Raw) |

No se dispone de datos de rendimiento comparativo entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- Es un adaptador LoRA, no un modelo autónomo: sin el modelo base krea/Krea-2-Raw no genera imágenes.
- Requiere la palabra de activación 4DR1M; sin ella, la identidad entrenada no se invoca de forma fiable.
- Riesgo de sobreajuste a las condiciones del dataset de entrenamiento (poses, iluminación, encuadres), con posible pérdida de parecido en escenarios muy distintos.
- No hay información sobre sesgos del adaptador ni sobre diversidad del conjunto de entrenamiento.
- La licencia es "other" y no se detallan sus condiciones; es imprescindible revisar los términos antes de cualquier uso comercial.
- Uso de la imagen de una persona real: el autor declara que los usuarios son los únicos responsables del cumplimiento legal; deben considerarse derechos de imagen, consentimiento y normativa aplicable.
- Sin descargas ni likes registrados y sin benchmarks: no hay evidencia pública de calidad o robustez.
- No apto para tareas de lenguaje, razonamiento, código o agentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/farc077/Adri_Marie_KREA2
- Modelo base: https://huggingface.co/krea/Krea-2-Raw
- Plataforma de entrenamiento citada: https://oneshotlora.com
