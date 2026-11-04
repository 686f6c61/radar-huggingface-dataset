# RunningHubAI/rh-yjlc-lora

## Resumen

`rh-yjlc-lora` es un adaptador LoRA (Low-Rank Adaptation) publicado en Hugging Face por RunningHubAI, la cuenta oficial de la plataforma RunningHub. No se trata de un modelo de lenguaje, sino de un conjunto de pesos auxiliares de aproximadamente 585 MiB que se aplican sobre un modelo base de generación de vídeo: según la model card, está afinado a partir de WAN2.2 en su variante HighNoise, un modelo de difusión texto-a-vídeo e imagen-a-vídeo de Alibaba.

El repositorio está etiquetado con `comfyui` y `lora`, lo que indica que su uso previsto es la carga dentro de un flujo de ComfyUI, presumiblemente a través de la plataforma RunningHub o de forma local con el nodo correspondiente de ComfyUI. El nombre del fichero de pesos (`2.2-I2V Reveal Penis_000003000_high_noise.safetensors`) sugiere que el adaptador está orientado a modificar el comportamiento del modelo base en una dirección temática concreta, y no a una mejora general de capacidades.

La relevancia de esta ficha es limitada desde el punto de vista de la evaluación técnica: no hay pipeline declarado, ni licencia explícita, ni idiomas, ni datos de entrenamiento, ni benchmarks. Además, el contenido temático del adaptador (contenido sexual explícito) condiciona fuertemente su aplicabilidad en entornos profesionales. Se documenta aquí lo que la información pública permite afirmar, marcando explícitamente todo lo que no está disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo de difusión de vídeo; modelo base declarado: WAN2.2 (HighNoise) |
| Parametros totales | no disponible (pesos del adaptador: ~585 MiB en safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de difusión, no de lenguaje) |
| Tipos de cuantizacion | no disponible; el fichero publicado es safetensors en el formato nativo del adaptador |
| Idiomas soportados | no disponible |
| Licencia | no disponible; la model card remite a la licencia del proyecto original o del modelo base |
| Formato de pesos | safetensors (`2.2-I2V%20Reveal%20Penis_000003000_high_noise.safetensors`, 585 MiB) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, un par de matrices de bajo rango que se inyectan en las capas del modelo base para modificar su comportamiento sin reentrenar todos los pesos. El modelo base declarado es WAN2.2 en la variante HighNoise, que corresponde a la etapa de mayor nivel de ruido del pipeline de difusión de vídeo de WAN 2.2. El fichero incluye el sufijo `high_noise`, lo que confirma que el adaptador está pensado para aplicarse únicamente en ese tramo del proceso de generación y no en el modelo de bajo ruido.

No se dispone de información sobre el número de pasos de entrenamiento (el `000003000` del nombre del fichero podría indicar el step de guardado, pero no se confirma en la model card), el dataset utilizado, la resolución de entrenamiento, el rango del LoRA ni si se emplearon técnicas como regularización o captions específicos. Tampoco se documenta ninguna innovación técnica más allá del propio ajuste fino. La model card se limita a indicar la plataforma de entrenamiento (RunningHub) y a enlazar a la página del modelo original en dicha plataforma.

## Capacidades

- Modificación del comportamiento generativo del modelo base WAN2.2 HighNoise mediante inyección de pesos LoRA.
- Aplicable a flujos de generación de vídeo (texto-a-vídeo e imagen-a-vídeo) que utilicen WAN2.2 como backbone.
- Integración prevista en ComfyUI, según las etiquetas del repositorio.
- Carga en la plataforma RunningHub, tanto en su sitio internacional como en el chino.
- No se documentan capacidades de tool calling, razonamiento multi-paso, agentes, visión general, audio ni modo de pensamiento: no es un modelo de lenguaje.
- El contenido temático del adaptador es explícitamente sexual, lo que restringe su uso a contextos que lo permitan legal y éticamente.

## Casos de uso

- Investigación sobre adaptadores LoRA en modelos de difusión de vídeo: el artefacto sirve como ejemplo práctico de cómo un LoRA de bajo rango altera un tramo concreto (HighNoise) del pipeline de WAN2.2, útil para estudiar el efecto de la inyección por etapas.
- Pruebas de compatibilidad en ComfyUI: permite verificar la carga de LoRAs de vídeo en nodos de ComfyUI y comprobar la resolución de dependencias con el checkpoint base WAN2.2.
- Reproducción de flujos alojados en RunningHub: el modelo original está publicado en esa plataforma, por lo que puede ejecutarse online sin infraestructura propia para comparar resultados con la ejecución local.
- Auditoría de contenido y moderación: útil para equipos que necesitan evaluar la eficacia de sus filtros y clasificadores frente a adaptadores que empujan la generación hacia contenido explícito.
- Estudio de sesgos y seguridad en modelos de vídeo: analizar cómo un LoRA temático modifica la distribución de salidas del modelo base y qué salvaguardas del pipeline se ven afectadas.
- Docencia sobre ajuste fino paramétricamente eficiente: el tamaño reducido del fichero (585 MiB) y su formato safetensors lo hacen manejable como material de ejemplo en cursos sobre LoRA aplicado a difusión.
- No se recomienda su uso en producción comercial sin antes verificar la licencia del modelo base y del adaptador, y sin una revisión legal del contenido generado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas cuantitativas (FVD, CLIP score, evaluación humana) ni comparaciones con otros LoRAs o con el modelo base sin adaptador.

## Requisitos de hardware

- VRAM: no disponible de forma específica. El adaptador pesa unos 585 MiB, pero la inferencia requiere cargar el modelo base WAN2.2 completo, cuyo consumo depende de la variante y la precisión elegida.
- GPU recomendadas: no disponibles en la información proporcionada; para modelos de difusión de vídeo de la familia WAN se suele requerir GPU con 16 GB de VRAM o más, pero este dato no se confirma en la model card.
- GPU de consumo: no confirmado. El adaptador en sí cabe en cualquier GPU, pero el modelo base condiciona el requisito real.
- Despliegue: ComfyUI (principal), plataforma RunningHub (online) y, potencialmente, cualquier runtime que cargue safetensors y soporte LoRA sobre el modelo base.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada adaptadores LoRA comparables sobre WAN2.2 con los que establecer una comparación de parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Contenido explícito: el nombre del fichero de pesos indica que el adaptador está orientado a generar contenido sexual explícito. Esto puede infringir las políticas de uso de plataformas de despliegue y las legislaciones de varios países.
- Licencia no declarada: la model card remite a la licencia del proyecto original o del modelo base, sin especificar términos. No hay garantía de uso comercial y debe verificarse la licencia de WAN2.2 antes de cualquier despliegue.
- Ausencia de documentación técnica: no se detallan datos de entrenamiento, hiperparámetros, rango del LoRA ni resolución, lo que impide evaluar su calidad de forma rigurosa.
- Dependencia estricta del modelo base: solo funciona con WAN2.2 HighNoise; aplicarlo sobre otras variantes o sobre el tramo de bajo ruido probablemente produzca resultados degradados.
- Riesgo de artefactos y alucinación visual: como todo LoRA de difusión, puede introducir inconsistencias temporales, deformaciones anatómicas y fallos de coherencia entre fotogramas.
- Sin métricas de calidad: no hay benchmarks que permitan comparar su rendimiento con el modelo base sin adaptador.
- Repositorio sin tracción: cero descargas y cero likes en el momento de la consulta, lo que reduce la probabilidad de que haya sido validado por la comunidad.
- Posible uso indebido: la combinación de un adaptador de contenido explícito con generación de vídeo plantea riesgos de suplantación y de generación de material no consentido; se recomienda extremar las precauciones y aplicar filtros de salida.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RunningHubAI/rh-yjlc-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2074123984697909249
- Página del autor en RunningHub: https://www.runninghub.ai/user-center/1986078446017196033
- RunningHub (sitio internacional): https://www.runninghub.ai
- RunningHub (sitio China): https://www.runninghub.cn
- Documentación de la API de RunningHub (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API de RunningHub (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- README en chino: https://huggingface.co/RunningHubAI/rh-yjlc-lora/blob/main/README_cn.md
