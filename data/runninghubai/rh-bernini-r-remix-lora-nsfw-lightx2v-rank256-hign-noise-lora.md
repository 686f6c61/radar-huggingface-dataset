# RunningHubAI/rh-bernini-r-remix-lora-nsfw-lightx2v-rank256-hign-noise-lora

## Resumen

`rh-bernini-r-remix-lora-nsfw-lightx2v-rank256-hign-noise-lora` es un adaptador LoRA publicado por RunningHubAI para el modelo de edición y generación de vídeo Bernini, afinado a partir de WAN2.2 en su variante de alto ruido (HighNoise). No se trata de un modelo de lenguaje, sino de un conjunto de pesos de 3,7 GB (3526 MiB en safetensors) destinados a cargarse junto al modelo base dentro de ComfyUI o en la plataforma RunningHub. Su función declarada es acelerar la inferencia del modelo Bernini y mejorar la textura de imagen, las transiciones de iluminación y la coherencia dinámica, corrigiendo problemas del modelo original como lentitud de generación, fotogramas borrosos y lavado de luz.

El adaptador está etiquetado como NSFW y como "not-for-all-audiences", lo que restringe su uso a entornos adultos y de investigación personal según el propio autor. La nomenclatura indica un rango de LoRA de 256 (`rank256`), precisión bf16, orientación a alto ruido (`hign_noise`, sic) y compatibilidad con el runtime cuantizado en int8 del ecosistema lightx2v. El autor declara que es el LoRA de aceleración mejor adaptado a Bernini hasta la fecha.

La relevancia de esta ficha es limitada para el público de modelos fundacionales: no hay información sobre arquitectura interna, datos de entrenamiento, benchmarks ni licencia explícita, y el repositorio no registra descargas ni likes en el momento de la consulta. Se documenta aquí como artefacto de la categoría LoRA para vídeo generativo, con todas las advertencias que ello implica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo base de vídeo Bernini, afinado desde WAN2.2 (HighNoise) |
| Parametros totales | no disponible (rango de LoRA 256; tamaño de pesos 3526 MiB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | pesos en bf16; el autor indica adaptación al runtime int8 del modelo base |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el autor remite a la licencia del proyecto original o upstream) |
| Formato de pesos | safetensors (`Bernini-R_Remix_LoRA_NSFW_lightx2v_rank256_bf16_hign_noise_v1.0.safetensors`) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 256 en bf16, pensado para inyectarse en las capas del modelo base Bernini en su variante de alto ruido. Según la model card, el ajuste optimiza la lógica de muestreo y el mecanismo de renderizado de iluminación del modelo original, y está calibrado para convivir con la ejecución cuantizada en int8 del stack lightx2v. El autor afirma que el LoRA resuelve problemas de fluidez, nitidez de fotogramas y saturación de luz del Bernini original, y que funciona de forma estable en image-to-video, continuación de vídeo, sustitución de personajes, transferencia de movimiento y redibujado de estilo de escena.

No se especifican en la información disponible el número de tokens o clips de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF/DPO (poco habituales en modelos de difusión de vídeo). Tampoco se documentan innovaciones técnicas propias más allá de la mencionada integración con el runtime int8 y la orientación a alto ruido. El modelo base declarado es WAN2.2 en su variante HighNoise, lo que sitúa al adaptador en la familia de modelos de difusión de vídeo de Alibaba, aunque la ficha no aporta detalles sobre la arquitectura exacta del Bernini subyacente.

## Capacidades

- Generación de vídeo a partir de imagen (image-to-video) con el modelo base Bernini.
- Continuación de vídeo (video continuation) sobre clips existentes.
- Sustitución de personajes en secuencias de vídeo.
- Transferencia de movimiento entre clips.
- Redibujado de estilo de escena (scene style redrawing).
- Aceleración de la inferencia respecto al Bernini sin LoRA, según el autor.
- Mejora declarada de textura, transiciones de iluminación y coherencia dinámica.
- Compatibilidad con el runtime cuantizado int8 del ecosistema lightx2v.
- Contenido NSFW: el propio nombre del adaptador y la etiqueta `not-for-all-audiences` lo indican.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje; no es un modelo de texto.

## Casos de uso

- Postproducción de vídeo corto para redes: el adaptador acelera la generación sobre Bernini y permite iterar variaciones de una misma escena sin esperar tiempos de render largos, útil en flujos de creación de contenido vertical.
- Edición de vídeo con sustitución de personajes: en proyectos de ficción o publicidad, se puede reemplazar un actor por otro manteniendo la interpretación original gracias a la función de character replacement del modelo base.
- Transferencia de movimiento para animación: llevar el movimiento de un clip de referencia a un personaje estático, útil en animación de avatares o dobles digitales.
- Redibujado de estilo de escena: aplicar una estética concreta (por ejemplo, cinematográfica o ilustrada) a metraje existente sin rehacer la grabación.
- Continuación de clips para vídeo largo: extender tomas cortas en secuencias más largas, aprovechando la coherencia dinámica que el autor atribuye al LoRA.
- Investigación técnica sobre LoRA de aceleración en difusión de vídeo: comparar el efecto del rango 256 y la orientación a alto ruido frente a otros adaptadores, en entornos controlados de laboratorio.
- Prototipado en ComfyUI: cargar el safetensors en un grafo de ComfyUI con el modelo base Bernini para evaluar la mejora de velocidad antes de comprometerse con un pipeline de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente afirma mejoras cualitativas de velocidad y calidad (textura, iluminación, coherencia) sin cifras de FVD, CLIP score, latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El adaptador pesa 3526 MiB en bf16, pero el consumo real depende del modelo base Bernini y del runtime int8, que no se detallan.
- GPU recomendadas: no disponible. El autor no especifica modelos de GPU; solo menciona compatibilidad con ejecución int8 en lightx2v.
- ¿Cabe en GPU de consumo? No se puede confirmar. El tamaño del LoRA (3,4 GiB) es asumible, pero el modelo base de vídeo al que se aplica suele requerir VRAM elevada; sin datos del base no es posible afirmarlo.
- Opciones de despliegue: ComfyUI, plataforma RunningHub (web y API) y Hugging Face como repositorio de pesos. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusión de vídeo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros LoRA de aceleración para Bernini ni datos comparables de adaptadores para WAN2.2, por lo que no es posible establecer una comparativa con cifras verificables.

## Limitaciones y advertencias

- Contenido NSFW: el adaptador está explícitamente orientado a material para adultos y etiquetado como `not-for-all-audiences`; no debe desplegarse en entornos accesibles a menores ni en productos de consumo general.
- Licencia no disponible: el autor remite a la licencia del proyecto original o upstream (WAN2.2 / Bernini), pero no la concreta. Antes de cualquier uso comercial es imprescindible verificar la licencia del modelo base y del ecosistema RunningHub.
- Uso declarado restringido: la model card indica "personal study and technical research use only", lo que excluye en principio el uso comercial sin autorización adicional.
- Ausencia de benchmarks: las afirmaciones de mejora de velocidad y calidad son cualitativas y provienen del propio autor; no hay métricas independientes.
- Riesgo de artefactos: los modelos de difusión de vídeo pueden producir inconsistencias temporales, deformaciones anatómicas y flickering, especialmente en clips largos; el LoRA no elimina necesariamente estos problemas.
- Dependencia del modelo base: el adaptador no funciona de forma autónoma; requiere cargar Bernini (WAN2.2 HighNoise) y, según el autor, está optimizado para el runtime int8 de lightx2v. Cambiar de runtime o de cuantización puede degradar el resultado.
- Sin soporte de texto, código ni razonamiento: no es un modelo de lenguaje; cualquier expectativa de tool calling o agentes es inaplicable.
- Trazabilidad limitada: repositorio sin descargas ni likes, creado y actualizado el mismo día (2026-11-04), sin historial de versiones ni discusión pública.
- Sesgos: no documentados, pero los modelos de vídeo entrenados con datos web heredan sesgos demográficos y estéticos; la ausencia de información sobre el dataset impide evaluarlos.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-bernini-r-remix-lora-nsfw-lightx2v-rank256-hign-noise-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2079087633287974913
- Página del autor: https://www.runninghub.ai/user-center/1986370833360760833
- RunningHub International: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentación de la API (EN): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (CN): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
