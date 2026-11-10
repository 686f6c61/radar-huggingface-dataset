# hodgy/skye-z-image-turbo

## Resumen

Skye — Z-Image Turbo LoRA es un adaptador LoRA de bajo rango para generación de imágenes a partir de texto (text-to-image), entrenado sobre el modelo base Tongyi-MAI/Z-Image-Turbo. Lo publica el usuario hodgy en Hugging Face y su propósito es inyectar una identidad concreta (la persona ficticia o real denominada «skye») en las generaciones del modelo base, activable mediante la palabra disparadora `skye` en el prompt. No es un modelo autónomo: requiere cargarse junto al modelo base Z-Image Turbo para funcionar.

El adaptador se ha entrenado con OSTRIS AI Toolkit y está checkpointado en el paso 2500, con un único archivo de pesos en formato safetensors (`skye_z_image_turbo_v1_000002500.safetensors`) y un tamaño de repositorio de 0,2 GB, coherente con un LoRA de rango bajo. La model card no documenta hiperparámetros de entrenamiento (rango, alpha, learning rate, resolución, número de imágenes del dataset), solo el paso final y la herramienta empleada.

Su relevancia es acotada y práctica: demuestra el flujo estándar de personalización de identidad sobre Z-Image Turbo, un modelo de difusión con FlowMatch. Es un artefacto de nicho, con cero descargas y cero likes en el momento de la consulta, sin benchmarks ni documentación técnica adicional, y con implicaciones éticas y legales relevantes por tratarse de un adaptador de identidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo de difusión Z-Image Turbo con FlowMatch |
| Parametros totales | no disponible (el repo ocupa 0,2 GB; el LoRA es de rango bajo, sin cifra publicada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo text-to-image; sin ventana de contexto de tokens publicada) |
| Tipos de cuantizacion | no disponible (se distribuye en safetensors; no se documentan variantes GGUF/FP8) |
| Idiomas soportados | no disponible (los prompts de ejemplo están en inglés) |
| Licencia | other (se remite a la licencia del modelo base y a restricciones de semejanza/identidad) |
| Formato de pesos | safetensors (`skye_z_image_turbo_v1_000002500.safetensors`) |

## Arquitectura y entrenamiento

El artefacto es un LoRA, es decir, un conjunto de matrices de bajo rango que se suman a los pesos del modelo base Tongyi-MAI/Z-Image-Turbo sin modificarlos. El modelo base es un text-to-image de la familia Z-Image Turbo que emplea FlowMatch (formulación de flujo para difusión) y está diseñado para inferencia rápida con pocos pasos. El adaptador se entrena con OSTRIS AI Toolkit, una herramienta de fine-tuning para modelos de difusión, sobre un dataset de identidad denominado `skye`.

La model card solo aporta el checkpoint final (paso 2500) y la palabra disparadora `skye`. No se especifican el rango del LoRA, el alpha, la tasa de aprendizaje, la resolución de entrenamiento, el número de imágenes ni la composición del dataset. Tampoco se documenta ningún proceso de RLHF, DPO ni preferencias humanas, algo esperable en un adaptador de este tipo. No hay innovaciones técnicas declaradas más allá del uso de FlowMatch heredado del base.

## Capacidades

- Generación de imágenes a partir de texto condicionada a una identidad concreta mediante la palabra disparadora `skye`.
- Reproducción consistente del rostro y cuerpo de la identidad «skye» en distintos escenarios: interiores, exteriores, luz natural y artificial, planos de cuerpo completo y medios planos.
- Control de vestuario y entorno mediante prompt (los ejemplos incluyen jerséis de punto, vestidos de satén, bikinis, ropa deportiva, denim).
- Compatible con setups de inferencia Z-Image Turbo / FlowMatch que acepten LoRA en safetensors.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo generativo de imagen, no un LLM.
- No dispone de modo thinking, visión de entrada, audio ni capacidades multimodales de comprensión.
- Capacidades multilingües: no documentadas; los prompts de ejemplo están en inglés.

## Casos de uso

- Creación de personajes consistentes para cómic o novela gráfica: el LoRA permite generar la misma identidad «skye» en múltiples viñetas y ángulos manteniendo coherencia facial, útil para previsualización de guion.
- Pruebas de vestuario y estilismo virtual: los prompts de ejemplo demuestran generación con prendas concretas (vestido de satén esmeralda, jersey de punto crema, bikini dorado), lo que sirve para moodboards de moda.
- Prototipado de avatares para aplicaciones: generar un conjunto de imágenes de una identidad fija para usar como avatar en demos, siempre que se respeten las restricciones de semejanza del modelo base.
- Ilustración de escenas cotidianas para contenido editorial: interiores domésticos, calles urbanas y luz de hora dorada, con control fino mediante prompt.
- Experimentación e investigación en personalización de difusión: sirve como caso de estudio reproducible del flujo OSTRIS AI Toolkit sobre Z-Image Turbo, con checkpoint documentado en el paso 2500.
- Generación de material para pruebas de pipelines de inferencia: al ser un LoRA pequeño (repo de 0,2 GB), es útil para validar la carga de adaptadores en servidores compatibles con FlowMatch antes de desplegar adaptadores mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; depende enteramente del modelo base Z-Image Turbo, no del LoRA, que añade una sobrecarga marginal (repo de 0,2 GB).
- GPU recomendadas: no disponibles en la información proporcionada; vendrán determinadas por los requisitos del modelo base.
- Compatibilidad con GPU de consumo: no confirmada; el LoRA en sí es ligero, pero el modelo base condiciona si cabe en tarjetas como RTX 4090 o similares.
- Opciones de despliegue: setups compatibles con Z-Image Turbo y FlowMatch que acepten LoRA en safetensors (la model card menciona «a compatible Z-Image Turbo / FlowMatch inference setup» sin nombrar herramientas concretas como vLLM, llama.cpp, Ollama o TGI, que además no aplican a difusión de imagen).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Contexto / resolución | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hodgy/skye-z-image-turbo | LoRA de identidad | Z-Image Turbo | no disponible | other | Hugging Face, 0 descargas |
| Tongyi-MAI/Z-Image-Turbo | Modelo base text-to-image | — | no disponible | no disponible | Hugging Face |
| Otros LoRA de identidad sobre Z-Image Turbo | LoRA de identidad | Z-Image Turbo | no disponible | variable | no disponible en la información |

No se dispone de datos de rendimiento ni de otros adaptadores comparables documentados en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse sobre un dataset de identidad concreto, puede heredar sesgos de composición, iluminación y estética de ese dataset.
- Riesgo de alucinación visual: como todo modelo de difusión, puede generar anatomía, manos o detalles de vestuario incoherentes, especialmente en planos complejos.
- Limitaciones de contexto e idioma: no se documenta el idioma de entrenamiento; los prompts de ejemplo están en inglés y no hay garantía de buen rendimiento en castellano.
- Restricciones de licencia: la licencia es «other» y la model card remite explícitamente a la licencia del modelo base y a «any applicable likeness/identity restrictions». El uso comercial no está autorizado de forma explícita y requiere revisar la licencia de Tongyi-MAI/Z-Image-Turbo.
- Riesgo ético y legal por identidad: es un adaptador de semejanza de una persona; su uso para suplantación, contenido íntimo no consentido o desinformación puede infringir normativa de protección de datos y derechos de imagen.
- Madurez: cero descargas y cero likes, creado y actualizado el mismo día (2026-11-10), sin validación externa ni issues documentados.
- Dependencia total del modelo base: sin Z-Image Turbo cargado, el adaptador no es funcional; cualquier incompatibilidad de versión del base puede degradar los resultados.

## Enlaces

- Hugging Face: https://huggingface.co/hodgy/skye-z-image-turbo
- Modelo base: https://huggingface.co/Tongyi-MAI/Z-Image-Turbo
- OSTRIS AI Toolkit: no disponible en la información proporcionada
- Paper, blog o demo: no disponible en la información proporcionada
