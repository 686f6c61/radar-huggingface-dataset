# AliveAi/Krea-2-Edit-Outfit-Transfer

## Resumen

Krea-2-Edit-Outfit-Transfer es un adaptador LoRA desarrollado por AliveAi para el modelo base de difusión krea/Krea-2-Raw. Su función principal es transferir la ropa de una imagen de referencia a un personaje generado, manteniendo la identidad del personaje y aplicando el atuendo de la imagen de entrada. Está diseñado específicamente para flujos de trabajo de edición de imágenes con Krea 2 Edit, y requiere nodos personalizados de ComfyUI para funcionar.

El modelo se distribuye como un repositorio de 1,2 GB en HuggingFace, con más de 8.000 descargas y 73 likes. Aunque la licencia no está especificada, el autor ofrece dos flujos de trabajo listos para usar, uno optimizado para precisión y otro para velocidad. La relevancia actual radica en la creciente demanda de herramientas de edición de moda y vestuario en generación de imágenes, donde la transferencia de outfit es una tarea habitual en catálogos, diseño y prototipado.

El LoRA se activa mediante el prompt "transfer the outfit" y está entrenado principalmente con prendas femeninas, lo que limita su aplicabilidad a otros tipos de vestimenta. No se dispone de información pública sobre la arquitectura interna del adaptador ni sobre los datos de entrenamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo base de difusión krea/Krea-2-Raw |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de texto a imagen) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles (el trigger está en inglés) |
| Licencia | no disponible |
| Formato de pesos | no disponible (repositorio de 1,2 GB, probablemente safetensors, pero no confirmado) |

## Arquitectura y entrenamiento

No se ha publicado información detallada sobre la arquitectura interna del LoRA ni sobre el proceso de entrenamiento. Se sabe que es un adaptador de bajo rango (LoRA) que modifica el comportamiento del modelo base krea/Krea-2-Raw, un modelo de difusión para generación de texto a imagen. El adaptador está diseñado para interpretar una imagen de referencia de vestimenta y aplicarla sobre un personaje generado, preservando la identidad de este último.

El entrenamiento se ha realizado con un dataset de outfits, disponible públicamente en HugFace (AliveAi/outfits), aunque no se especifican el número de imágenes, la composición del dataset ni si se utilizaron técnicas como RLHF o DPO. Tampoco se detallan innovaciones técnicas específicas más allá de la integración con los nodos personalizados de ComfyUI.

## Capacidades

- Transferencia de vestimenta desde una imagen de referencia a un personaje generado.
- Preservación del personaje generado mientras se aplica el outfit de la imagen de referencia.
- Compatibilidad con flujos de trabajo de Krea 2 Edit mediante nodos personalizados de ComfyUI.
- Dos modos de ejecución: uno con mayor precisión de outfit (más lento) y otro más rápido con adherencia ligeramente menor.
- Mejores resultados con prendas femeninas, según el autor.
- No se mencionan capacidades adicionales como tool calling, agentes, razonamiento multimodal o soporte de audio.

## Casos de uso

- Edición de moda en estudios de diseño: permite cambiar rápidamente la vestimenta de un personaje generado usando una foto de referencia de una prenda concreta, sin necesidad de re-generar toda la escena.
- Generación de catálogos de ropa: se puede crear un modelo virtual y probar diferentes outfits sobre el mismo personaje, manteniendo la pose y el entorno, lo que agiliza la producción de imágenes para e-commerce.
- Prototipado de colecciones: los diseñadores pueden visualizar cómo quedaría una prenda sobre un maniquí o modelo generado antes de producirla físicamente.
- Personalización de avatares: en aplicaciones de entretenimiento o redes sociales, se puede transferir la ropa de una foto del usuario a un avatar generado.
- Pruebas de vestuario en producción audiovisual: para previsualizar looks de personajes en cine o animación, usando referencias de vestuario reales.
- Creación de contenido para influencers virtuales: permite cambiar el atuendo de un personaje virtual de forma consistente, manteniendo su identidad visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre métricas de calidad de transferencia, fidelidad del outfit ni comparaciones con otros modelos de transferencia de vestimenta.

## Requisitos de hardware

- No se especifican requisitos de VRAM ni GPU concretos en la documentación del modelo.
- Al ser un LoRA sobre un modelo de difusión, los requisitos dependen del modelo base krea/Krea-2-Raw, del que no se dispone de especificaciones públicas.
- Se requiere una GPU con suficiente memoria para ejecutar el modelo base y el adaptador; no se puede determinar si es viable en GPUs de consumo como RTX 4090 sin conocer el tamaño del modelo base.
- El despliegue se realiza a través de ComfyUI con nodos personalizados (comfyui-krea2edit o ComfyUI-Krea2-Ostris-Edit), por lo que no es compatible directamente con vLLM, Ollama o TGI.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (LoRA de transferencia de outfit para Krea 2 Edit). No se puede establecer una comparativa con alternativas como otros adaptadores de transferencia de vestimenta o modelos de edición de imágenes sin datos adicionales.

## Limitaciones y advertencias

- El modelo está entrenado principalmente con outfits femeninos, por lo que su rendimiento con prendas masculinas o unisex puede ser significativamente inferior.
- Puede generar ocasionalmente dos personas en lugar de una; se recomienda cambiar la semilla o añadir explícitamente "single person" al prompt.
- Requiere nodos personalizados de ComfyUI, lo que añade complejidad de instalación y configuración; no es un modelo plug-and-play.
- La licencia no está especificada, por lo que se desconoce si permite uso comercial o si tiene restricciones de redistribución.
- No se han publicado datos sobre sesgos, alucinaciones o limitaciones de contexto, aunque al ser un modelo de texto a imagen, los riesgos típicos incluyen la generación de imágenes no deseadas o la mala interpretación de prompts complejos.
- El idioma de los prompts no está documentado; el trigger está en inglés, lo que sugiere que el modelo puede no responder bien a prompts en otros idiomas.

## Enlaces

- HuggingFace: https://huggingface.co/AliveAi/Krea-2-Edit-Outfit-Transfer
- Dataset de outfits: https://huggingface.co/datasets/AliveAi/outfits
- Nodo ComfyUI (lbouaraba): https://github.com/lbouaraba/comfyui-krea2edit
- Nodo ComfyUI (ostris): https://github.com/ostris/ComfyUI-Krea2-Ostris-Edit
- Aplicación web AliveAI: https://aliveai.app
