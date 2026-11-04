# RunningHubAI/rh-minimax-h3-realism-people-t2v-i2v-r2v-b-lora

## Resumen

`rh-minimax-h3-realism-people-t2v-i2v-r2v-b-lora` es un adaptador LoRA publicado por RunningHubAI (autor original identificado en la model card como `@T8star-Aix`) que se aplica sobre el modelo base `minimax-h3`. Su propósito declarado es reforzar el realismo de las personas generadas en tareas de texto-a-vídeo (t2v), imagen-a-vídeo (i2v) y referencia-a-vídeo (r2v), de ahí el sufijo del nombre. No se trata de un modelo fundacional completo, sino de un conjunto de pesos auxiliares que se cargan junto al modelo base dentro de ComfyUI o de la plataforma RunningHub.

El repositorio es extremadamente ligero (aproximadamente 0,1 GB) y contiene un único fichero `minimax-h3-realism-people-t2v-i2v-r2v_B.safetensors` de 125 MiB, lo que es coherente con un LoRA de rango bajo y no con un checkpoint completo. La model card no documenta arquitectura del modelo base, número de parámetros, longitud de contexto, idiomas ni licencia concreta, más allá de remitir a la licencia del proyecto original y a la página del modelo en RunningHub.

La relevancia de esta ficha es limitada pero concreta: sirve para quien ya trabaja con MiniMax-H3 en ComfyUI y quiere mejorar la fidelidad anatómica y fotográfica de figuras humanas en vídeo generado. Al no haber métricas publicadas, descargas ni likes, debe considerarse un artefacto en fase temprana de distribución y sin validación comunitaria independiente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo base `minimax-h3`; arquitectura del base no disponible |
| Parámetros totales | no disponible (el fichero de pesos ocupa 125 MiB) |
| Parámetros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el LoRA se distribuye en safetensors; la cuantización dependerá del modelo base) |
| Idiomas soportados | no disponible |
| Licencia | no disponible; la model card indica que se siga la licencia del proyecto original o del upstream |
| Formato de pesos | safetensors (`minimax-h3-realism-people-t2v-i2v-r2v_B.safetensors`) |

## Arquitectura y entrenamiento

La información disponible solo confirma que se trata de un LoRA afinado a partir de `minimax-h3`. No se especifican el rango del adaptador, las capas objetivo, el número de pasos de entrenamiento, el dataset utilizado ni si hubo técnicas de regularización o *captioning* automático. El nombre del fichero incluye el sufijo `_B`, lo que sugiere una variante o versión dentro de una familia de LoRAs del mismo autor, pero no se documenta qué la diferencia de otras versiones.

No hay datos sobre el volumen de tokens o clips de vídeo empleados, la composición del dataset (por ejemplo, proporción de primeros planos, planos medios, iluminación natural frente a estudio) ni sobre procesos de ajuste por preferencias humanas. Tampoco se describe ninguna innovación técnica específica más allá del objetivo declarado de mejorar el realismo de personas en generación de vídeo.

## Capacidades

- Adaptación de estética fotorrealista de figuras humanas sobre el modelo base `minimax-h3`.
- Aplicable a los tres flujos indicados en el nombre: texto-a-vídeo (t2v), imagen-a-vídeo (i2v) y referencia-a-vídeo (r2v).
- Integración nativa en ComfyUI mediante carga de LoRA sobre el checkpoint base.
- Compatible con el ecosistema RunningHub, incluyendo ejecución en la nube y API.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento, ya que es un adaptador de generación de vídeo, no un modelo de lenguaje.
- Capacidades multilingües: no disponibles; la model card está en inglés y enlaza a una versión en chino del README.

## Casos de uso

- Generación de vídeo publicitario con personas: aplicar el LoRA sobre MiniMax-H3 en ComfyUI para obtener primeros planos con textura de piel y rasgos faciales más creíbles en anuncios de producto o moda.
- Prototipado de escenas con actores sintéticos: usar el flujo i2v partiendo de un fotograma clave para animar retratos con un acabado más fotográfico antes de decidir si se escala a producción.
- Previsualización de storyboards: generar clips breves a partir de descripciones textuales (t2v) para validar encuadres y composición de escenas con personajes.
- Sustitución de referencia en pipelines de vídeo: emplear el modo r2v para mantener la identidad visual de una persona de referencia mientras se generan variaciones de plano.
- Integración en flujos de trabajo automatizados de ComfyUI: encadenar el LoRA con nodos de upscaling o interpolación de fotogramas para producir material de vídeo de mayor duración.
- Evaluación comparativa de estilos: alternar este LoRA con otros adaptadores del mismo autor para medir el impacto en el realismo de personas dentro de un mismo pipeline.
- Despliegue vía API de RunningHub: ejecutar el flujo en la nube cuando no se dispone de GPU local suficiente para el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM del LoRA en sí: mínima (125 MiB en disco); el cuello de botella es siempre el modelo base `minimax-h3`, cuyos requisitos no se detallan en la información proporcionada.
- GPU recomendadas: no disponibles para el modelo base; para el adaptador no aplica.
- Viabilidad en GPU de consumo: no disponible; depende enteramente del tamaño y la cuantización de MiniMax-H3.
- Opciones de despliegue: ComfyUI (soporte nativo de LoRA), plataforma RunningHub (nube y API). Otros motores como vLLM, llama.cpp, Ollama o TGI no aplican a un modelo de generación de vídeo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-minimax-h3-realism-people-t2v-i2v-r2v-b-lora | LoRA | minimax-h3 | t2v / i2v / r2v con realismo de personas | no disponible (se remite al upstream) | Hugging Face y RunningHub |
| fal/MiniMax-H3-Realism-People-LoRA | LoRA | MiniMax-H3 | Realismo de personas en vídeo | no disponible | Hugging Face |
| Modelo base minimax-h3 | Modelo generativo de vídeo | — | Generación de vídeo | no disponible | no disponible |

No se dispone de datos de parámetros, contexto ni rendimiento para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Ausencia total de métricas: sin benchmarks, sin descargas y sin likes, no existe validación independiente del efecto real del LoRA.
- Licencia ambigua: la model card no fija una licencia propia y remite a la del proyecto original; conviene verificar los términos de MiniMax-H3 antes de cualquier uso comercial.
- Dependencia del modelo base: el adaptador no funciona de forma autónoma; su calidad está acotada por `minimax-h3`.
- Posible sobreajuste estilístico: al estar orientado a "realismo de personas", puede empujar todas las generaciones hacia una estética homogénea y reducir diversidad de rostros, edades o contextos.
- Riesgo de artefactos en anatomía: los LoRA de realismo humano en vídeo suelen amplificar problemas de manos, dientes y coherencia temporal entre fotogramas; no hay documentación que indique mitigaciones.
- Idiomas y contexto no documentados: imposible planificar soporte multilingüe o prompts largos con la información disponible.
- Repositorio de 0,1 GB y creado y actualizado en el mismo día: indica una publicación reciente y sin ciclo de mantenimiento demostrado.
- Sin información sobre sesgos: no se documenta la composición del dataset de entrenamiento ni posibles sesgos demográficos.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-minimax-h3-realism-people-t2v-i2v-r2v-b-lora
- Modelo original en RunningHub: https://www.runninghub.cn/model/public/2094112867539841026
- LoRA de referencia en fal: https://huggingface.co/fal/MiniMax-H3-Realism-People-LoRA
- Página del autor: https://www.runninghub.cn/user-center/1819214514410942465
- RunningHub International: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
